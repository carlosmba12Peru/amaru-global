"""
Servicio Pericial de Infraestructura Escolar y Albergues Temporales INDECI
Fuente: Ministerio de Educación (MINEDU) - Unidad de Estadística Educativa (ESCALE) / SIGMED
Portal: https://sigmed.minedu.gob.pe/mapaeducativo/mapassee.aspx
Marco Legal: Ley Nº 29664 (SINAGERD) - D.S. 111-2012-PCM
"""

import json
import logging
import os
import subprocess
import tempfile
import unicodedata
import urllib.request
from typing import Any, Dict, List, Optional

logger = logging.getLogger("amaru.minedu_sigmed")


class MineduSigmedService:
    """
    Servicio de consulta y clasificación táctica de centros educativos e infraestructura
    escolar para la designación oficial de albergues temporales y evaluación de exposición a peligro.
    """

    def __init__(self, data_dir: Optional[str] = None):
        if data_dir is None:
            base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
            data_dir = os.path.join(base_dir, "data")
        self.data_dir = data_dir
        self.cache_seed_path = os.path.join(self.data_dir, "centros_educativos_minedu_seed.json")
        self._memory_cache: Dict[str, Dict[str, Any]] = {}
        self._load_seed()

    def _load_seed(self) -> None:
        """Carga el archivo semilla en memoria para disponibilidad inmediata offline."""
        if os.path.exists(self.cache_seed_path):
            try:
                with open(self.cache_seed_path, "r", encoding="utf-8") as f:
                    self._memory_cache = json.load(f)
                logger.info(
                    "MineduSigmedService: Semilla cargada con %d distritos iniciales.",
                    len(self._memory_cache),
                )
            except Exception as e:
                logger.warning("Error al cargar semilla de centros educativos: %s", e)
                self._memory_cache = {}
        else:
            # Buscar en directorio hermano si se ejecuta en modo raíz
            alt_path = os.path.join(os.path.dirname(self.data_dir), "data", "centros_educativos_minedu_seed.json")
            if os.path.exists(alt_path):
                try:
                    with open(alt_path, "r", encoding="utf-8") as f:
                        self._memory_cache = json.load(f)
                    logger.info("MineduSigmedService: Semilla cargada desde alt_path.")
                except Exception as e:
                    logger.warning("Error al cargar semilla alt_path: %s", e)

    def _normalize_school(self, raw: Dict[str, Any]) -> Dict[str, Any]:
        """Normaliza una fila del padrón de SIGMED."""
        ges_dep = str(raw.get("GESTION_DEPENDENCIA", "")).strip()
        es_publica = ges_dep.startswith("A")

        nivel = str(raw.get("NIVEL_MODALIDAD", "")).strip()
        nivel_norm = unicodedata.normalize("NFKD", nivel).encode("ASCII", "ignore").decode("ASCII").lower()

        cod_local = str(raw.get("CODIGO_LOCAL", "")).strip()
        # Criterio SINAGERD / INDECI: Institución pública, código de local formal y niveles con losas o pabellones amplios
        es_albergue_potencial = (
            es_publica
            and bool(cod_local)
            and any(k in nivel_norm for k in ["primaria", "secundaria", "superior", "cetpro", "basica regular"])
        )

        try:
            lat = float(raw.get("LATITUD_DEC", 0.0))
        except (ValueError, TypeError):
            lat = 0.0

        try:
            lon = float(raw.get("LONGITUD_DEC", 0.0))
        except (ValueError, TypeError):
            lon = 0.0

        try:
            alt = int(raw.get("ALTITUD", 0))
        except (ValueError, TypeError):
            alt = 0

        return {
            "codigo_modular": str(raw.get("CODIGO_MODULAR", "")).strip(),
            "anexo": str(raw.get("ANEXO", "0")).strip(),
            "codigo_local": cod_local,
            "nombre_ie": str(raw.get("NOMBRE_ESCUELA", "")).strip(),
            "nivel_modalidad": nivel,
            "gestion": "PUBLICA" if es_publica else "PRIVADA",
            "gestion_codigo": ges_dep,
            "direccion": str(raw.get("DIRECCION_ESCUELA", "")).strip(),
            "centro_poblado": str(raw.get("NOMBRE_CENTRO_POBLADO", "")).strip(),
            "cod_centro_poblado": str(raw.get("COD_CENTRO_POBLADO", "")).strip(),
            "cod_ugel": str(raw.get("CODIGO_UGEL", "")).strip(),
            "ubigeo": str(raw.get("CODIGO_UBIGEO", "")).strip(),
            "distrito": str(raw.get("DISTRITO", "")).strip(),
            "provincia": str(raw.get("PROVINCIA", "")).strip(),
            "departamento": str(raw.get("DEPARTAMENTO", "")).strip(),
            "latitud": lat,
            "longitud": lon,
            "altitud": alt,
            "es_albergue_potencial": es_albergue_potencial,
            "fuente_oficial": "MINEDU-ESCALE-SIGMED-2026",
        }

    def _query_sigmed_live(self, ubigeo: str) -> List[Dict[str, Any]]:
        """Consulta en vivo al servicio REST de SIGMED de MINEDU."""
        url = (
            f"https://sigmed.minedu.gob.pe/servicios/rest/service/restsig.svc/padron?"
            f"codgeo={ubigeo}&codugel=&codmod=&anexo=&nombreie=&codlocal=&direccion=&"
            f"cenpob=&localidad=&nivmod=&gesdep=&codcp=&estado=&ubicados="
        )
        headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AmaruClimate/1.0"}
        req = urllib.request.Request(url, headers=headers)
        try:
            with urllib.request.urlopen(req, timeout=12) as resp:
                content = resp.read().decode("utf-8")
                parsed = json.loads(content)
                if isinstance(parsed, str):
                    parsed = json.loads(parsed)
                return parsed.get("Rows", [])
        except Exception as e:
            logger.warning("Error consultando SIGMED en vivo para UBIGEO %s: %s", ubigeo, e)
            return []

    def get_centros_educativos_por_ubigeo(self, ubigeo: str) -> Dict[str, Any]:
        """
        Obtiene el resumen y la lista completa de servicios educativos del distrito.
        Utiliza caché en memoria primero y fallback en vivo.
        """
        ubigeo = str(ubigeo).strip()
        if ubigeo in self._memory_cache and self._memory_cache[ubigeo].get("escuelas"):
            cached = self._memory_cache[ubigeo]
            albergues = [e for e in cached["escuelas"] if e.get("es_albergue_potencial")]
            return {
                "ubigeo": ubigeo,
                "distrito": cached.get("distrito", ""),
                "provincia": cached.get("provincia", ""),
                "departamento": cached.get("departamento", ""),
                "total_servicios_educativos": cached.get("total_servicios_educativos", len(cached["escuelas"])),
                "total_publicas": cached.get("total_publicas", 0),
                "total_privadas": cached.get("total_privadas", 0),
                "total_albergues_potenciales": cached.get("total_albergues_potenciales", len(albergues)),
                "albergues_recomendados": albergues[:12],
                "escuelas": cached["escuelas"],
                "fuente_valida": "SRC-MINEDU-ESCALE-SIGMED-2026",
            }

        # Intentar consulta en vivo
        raw_list = self._query_sigmed_live(ubigeo)
        if raw_list:
            normalized_list = [self._normalize_school(r) for r in raw_list]
            publicas = sum(1 for s in normalized_list if s["gestion"] == "PUBLICA")
            privadas = len(normalized_list) - publicas
            albergues = [s for s in normalized_list if s["es_albergue_potencial"]]

            record = {
                "ubigeo": ubigeo,
                "distrito": normalized_list[0]["distrito"] if normalized_list else "",
                "provincia": normalized_list[0]["provincia"] if normalized_list else "",
                "departamento": normalized_list[0]["departamento"] if normalized_list else "",
                "total_servicios_educativos": len(normalized_list),
                "total_publicas": publicas,
                "total_privadas": privadas,
                "total_albergues_potenciales": len(albergues),
                "albergues_recomendados": albergues[:12],
                "escuelas": normalized_list,
                "fuente_valida": "SRC-MINEDU-ESCALE-SIGMED-2026",
            }
            self._memory_cache[ubigeo] = record
            return record

        # Fallback vacío pero conforme a estructura
        return {
            "ubigeo": ubigeo,
            "distrito": "",
            "provincia": "",
            "departamento": "",
            "total_servicios_educativos": 0,
            "total_publicas": 0,
            "total_privadas": 0,
            "total_albergues_potenciales": 0,
            "albergues_recomendados": [],
            "escuelas": [],
            "fuente_valida": "SRC-MINEDU-ESCALE-SIGMED-2026",
        }

    def get_albergues_temporales_indeci(self, ubigeo: str, max_results: int = 8) -> List[Dict[str, Any]]:
        """
        Retorna la lista priorizada de escuelas públicas aptas como Albergues Temporales INDECI.
        """
        data = self.get_centros_educativos_por_ubigeo(ubigeo)
        return data.get("albergues_recomendados", [])[:max_results]


# Instancia singleton
_minedu_service_instance: Optional[MineduSigmedService] = None


def get_minedu_sigmed_service() -> MineduSigmedService:
    global _minedu_service_instance
    if _minedu_service_instance is None:
        _minedu_service_instance = MineduSigmedService()
    return _minedu_service_instance

minedu_sigmed_service = get_minedu_sigmed_service()
