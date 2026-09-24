"""
Script pericial de ingestión y normalización de infraestructura educativa oficial
Fuente: MINEDU / ESCALE - Sistema de Información Geográfica de Educación (SIGMED)
URL: https://sigmed.minedu.gob.pe/mapaeducativo/mapassee.aspx
API REST: https://sigmed.minedu.gob.pe/servicios/rest/service/restsig.svc/padron
"""

import json
import os
import subprocess
import tempfile
import unicodedata
import urllib.request
from typing import Any, Dict, List

# Distritos emblemáticos para seeding inicial de alta disponibilidad offline
SEED_UBIGEOS = [
    "150118",  # Lurigancho - Chosica (Lima) - Cuenca Rímac
    "130101",  # Trujillo (La Libertad) - Quebradas San Idelfonso, El León
    "060101",  # Cajamarca (Cajamarca) - Zona de fallas y deslizamientos
    "150101",  # Lima (Cercado)
    "200101",  # Piura (Piura) - Inundaciones Río Piura
    "140101",  # Chiclayo (Lambayeque) - Cuenca Chancay-Lambayeque
    "131103",  # Marmot (Gran Chimú, La Libertad)
    "060507",  # Santa Cruz de Toledo (Contumazá, Cajamarca)
]

USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 AmaruClimate/1.0"


def fetch_schools_by_ubigeo(ubigeo: str) -> List[Dict[str, Any]]:
    url = (
        f"https://sigmed.minedu.gob.pe/servicios/rest/service/restsig.svc/padron?"
        f"codgeo={ubigeo}&codugel=&codmod=&anexo=&nombreie=&codlocal=&direccion=&"
        f"cenpob=&localidad=&nivmod=&gesdep=&codcp=&estado=&ubicados="
    )
    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            content = resp.read().decode("utf-8")
            parsed = json.loads(content)
            if isinstance(parsed, str):
                parsed = json.loads(parsed)
            return parsed.get("Rows", [])
    except Exception as e:
        print(f"[WARN] Error al consultar SIGMED para UBIGEO {ubigeo}: {e}")
        return []


def normalize_school(raw: Dict[str, Any]) -> Dict[str, Any]:
    ges_dep = str(raw.get("GESTION_DEPENDENCIA", "")).strip()
    es_publica = ges_dep.startswith("A")
    
    nivel = str(raw.get("NIVEL_MODALIDAD", "")).strip()
    nivel_norm = unicodedata.normalize("NFKD", nivel).encode("ASCII", "ignore").decode("ASCII").lower()
    
    # Evaluar aptitud para Albergue Temporal / Centro de Refugio INDECI (Ley 29664)
    # Criterio SINAGERD: Institución pública, código de local validado, con infraestructura física
    # (primaria, secundaria, superior, cetpro o inicial integrada)
    cod_local = str(raw.get("CODIGO_LOCAL", "")).strip()
    es_albergue_potencial = (
        es_publica and
        bool(cod_local) and
        any(k in nivel_norm for k in ["primaria", "secundaria", "superior", "cetpro", "basica regular"])
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
        "fuente_oficial": "MINEDU-ESCALE-SIGMED-2026"
    }


def main():
    print("Iniciando extracción oficial MINEDU / ESCALE - SIGMED...")
    db_por_ubigeo = {}
    
    for ub in SEED_UBIGEOS:
        print(f"Descargando escuelas oficiales para UBIGEO {ub}...")
        raw_list = fetch_schools_by_ubigeo(ub)
        normalized_list = [normalize_school(r) for r in raw_list]
        
        # Métricas del distrito
        total = len(normalized_list)
        publicas = sum(1 for s in normalized_list if s["gestion"] == "PUBLICA")
        privadas = total - publicas
        albergues = sum(1 for s in normalized_list if s["es_albergue_potencial"])
        
        db_por_ubigeo[ub] = {
            "ubigeo": ub,
            "distrito": normalized_list[0]["distrito"] if normalized_list else "",
            "provincia": normalized_list[0]["provincia"] if normalized_list else "",
            "departamento": normalized_list[0]["departamento"] if normalized_list else "",
            "total_servicios_educativos": total,
            "total_publicas": publicas,
            "total_privadas": privadas,
            "total_albergues_potenciales": albergues,
            "escuelas": normalized_list
        }
        print(f" -> UBIGEO {ub}: {total} escuelas (Públicas: {publicas}, Albergues potenciales INDECI: {albergues})")

    # Guardar en archivo semilla JSON
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    target_data = os.path.join(os.path.dirname(base_dir), "data", "centros_educativos_minedu_seed.json")
    target_backend = os.path.join(base_dir, "data", "centros_educativos_minedu_seed.json")
    
    with tempfile.NamedTemporaryFile("w", delete=False, encoding="utf-8") as tf:
        json.dump(db_por_ubigeo, tf, ensure_ascii=False, indent=2)
        tname = tf.name
        
    for tgt in [target_data, target_backend]:
        res = subprocess.run(["cmd", "/C", "copy", "/Y", tname, tgt], capture_output=True, text=True)
        print(f"Copiado a {tgt}: {res.stdout.strip()}")
        
    os.unlink(tname)
    print("Extracción e integración de semilla MINEDU completada exitosamente.")


if __name__ == "__main__":
    main()
