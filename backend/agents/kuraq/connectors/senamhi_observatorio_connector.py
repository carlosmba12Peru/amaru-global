# backend/agents/kuraq/connectors/senamhi_observatorio_connector.py
"""
Conector Soberano para el Observatorio Nacional del Tiempo, Agua y Clima del SENAMHI
(Red Nacional de 982 Estaciones Meteorológicas, Hidrológicas y Agrometeorológicas).
Fuente Oficial: https://observatorio.senamhi.gob.pe/investigadores/red-estaciones
API Backend: https://servicios.senamhi.gob.pe/api/researchers/stations
"""
import os
import json
import math
import httpx
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional
try:
    from agents.kuraq.connectors.base_connector import BaseSourceConnector
except ImportError:
    from backend.agents.kuraq.connectors.base_connector import BaseSourceConnector

API_BASE = "https://servicios.senamhi.gob.pe/api/researchers"
CACHE_FILE = os.path.join(
    os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__)))),
    "data",
    "senamhi_estaciones_cache.json"
)

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 AMARU-CLIMATE/1.0",
    "Accept": "application/json, text/plain, */*",
    "Origin": "https://observatorio.senamhi.gob.pe",
    "Referer": "https://observatorio.senamhi.gob.pe/"
}


class SenamhiObservatorioConnector(BaseSourceConnector):
    def __init__(self):
        super().__init__(
            source_id="SRC-SENAMHI-OBSERVATORIO-ESTACIONES",
            nombre="SENAMHI - Red Nacional de Estaciones (Observatorio Oficial)",
            ente="SENAMHI",
            tier="TIER_1_OFICIAL_ESTATAL",
            endpoint=f"{API_BASE}/stations",
            frecuencia_minutos=30,
            categoria="HIDROMETEOROLOGIA_ESTACIONES_RED_NACIONAL"
        )
        self._estaciones_cache: List[Dict[str, Any]] = []
        self._cargar_cache_disco()

    def _cargar_cache_disco(self):
        """Carga catálogo en memoria si existe en disco."""
        if os.path.exists(CACHE_FILE):
            try:
                with open(CACHE_FILE, "r", encoding="utf-8") as f:
                    self._estaciones_cache = json.load(f)
            except Exception:
                self._estaciones_cache = []

    def _guardar_cache_disco(self, data: List[Dict[str, Any]]):
        """Persiste catálogo en disco para tolerancia a fallas de red."""
        try:
            os.makedirs(os.path.dirname(CACHE_FILE), exist_ok=True)
            with open(CACHE_FILE, "w", encoding="utf-8") as f:
                json.dump(data, f, ensure_ascii=False, indent=2)
        except Exception:
            pass

    async def sync(self) -> Dict[str, Any]:
        """
        Sincroniza el catálogo maestro de 982 estaciones del SENAMHI y calcula SHA-256.
        """
        start_time = datetime.now(timezone.utc).isoformat()
        try:
            async with httpx.AsyncClient(timeout=15.0, headers=HEADERS, follow_redirects=True) as client:
                resp = await client.get(f"{API_BASE}/stations")
                if resp.status_code == 200:
                    payload = resp.json()
                    estaciones = payload.get("data", [])
                    if estaciones:
                        self._estaciones_cache = estaciones
                        self._guardar_cache_disco(estaciones)

            if not self._estaciones_cache:
                raise RuntimeError("No se recibieron estaciones ni se dispone de caché local.")

            raw_bytes = json.dumps(self._estaciones_cache, sort_keys=True).encode("utf-8")
            sha256_hash = self.calculate_sha256(raw_bytes)

            total = len(self._estaciones_cache)
            automaticas = sum(1 for e in self._estaciones_cache if "AUTOM" in str(e.get("subTypeDescription", "")).upper())
            hidrologicas = sum(1 for e in self._estaciones_cache if e.get("typeId") == "H")
            meteorologicas = sum(1 for e in self._estaciones_cache if e.get("typeId") == "M")

            self.ultimo_sync_utc = start_time
            self.ultimo_hash_sha256 = sha256_hash
            self.ultimo_estado = "SINCRONIZADO_OK"

            resumen = {
                "source_id": self.source_id,
                "estado": "SINCRONIZADO_OK",
                "total_estaciones": total,
                "estaciones_automaticas": automaticas,
                "estaciones_hidrologicas": hidrologicas,
                "estaciones_meteorologicas": meteorologicas,
                "hash_sha256": sha256_hash,
                "timestamp_utc": start_time
            }
            self.ultimo_payload_resumen = resumen
            return resumen

        except Exception as e:
            if self._estaciones_cache:
                raw_bytes = json.dumps(self._estaciones_cache, sort_keys=True).encode("utf-8")
                sha256_hash = self.calculate_sha256(raw_bytes)
                self.ultimo_sync_utc = start_time
                self.ultimo_hash_sha256 = sha256_hash
                self.ultimo_estado = "SINCRONIZADO_OK"
                return {
                    "source_id": self.source_id,
                    "estado": "SINCRONIZADO_OK",
                    "total_estaciones": len(self._estaciones_cache),
                    "estaciones_automaticas": sum(1 for e in self._estaciones_cache if "AUTOM" in str(e.get("subTypeDescription", "")).upper()),
                    "estaciones_hidrologicas": sum(1 for e in self._estaciones_cache if e.get("typeId") == "H"),
                    "estaciones_meteorologicas": sum(1 for e in self._estaciones_cache if e.get("typeId") == "M"),
                    "hash_sha256": sha256_hash,
                    "nota": f"Operando con caché en memoria ante latencia remota: {e}",
                    "timestamp_utc": start_time
                }

            self.ultimo_estado = "ERROR_SINCRONIZACION"
            return {
                "source_id": self.source_id,
                "estado": "ERROR_SINCRONIZACION",
                "total_estaciones_en_cache": len(self._estaciones_cache),
                "error": str(e),
                "timestamp_utc": start_time
            }


    async def get_stations(
        self,
        tipo: Optional[str] = None,
        departamento: Optional[str] = None,
        solo_automaticas: bool = False
    ) -> List[Dict[str, Any]]:
        """
        Retorna estaciones filtradas por tipo ('M' meteorológica, 'H' hidrológica),
        departamento o condición automática.
        """
        if not self._estaciones_cache:
            await self.sync()

        resultado = self._estaciones_cache
        if tipo:
            resultado = [e for e in resultado if e.get("typeId") == tipo.upper()]
        if departamento:
            dep_clean = departamento.strip().upper()
            resultado = [e for e in resultado if dep_clean in str(e.get("departmentName", "")).upper()]
        if solo_automaticas:
            resultado = [e for e in resultado if "AUTOM" in str(e.get("subTypeDescription", "")).upper()]

        return resultado

    async def get_station_data(self, station_id: str, year_month: Optional[str] = None) -> List[Dict[str, Any]]:
        """
        Consulta lecturas horarias o diarias de una estación para un periodo YYYYMM.
        Si no se especifica periodo, consulta los periodos disponibles y toma el más reciente.
        """
        try:
            async with httpx.AsyncClient(timeout=10.0, headers=HEADERS, follow_redirects=True) as client:
                if not year_month:
                    p_resp = await client.get(f"{API_BASE}/stations/{station_id}/periods")
                    if p_resp.status_code == 200:
                        periods = p_resp.json().get("data", [])
                        if periods:
                            year_month = periods[0].get("id")

                if not year_month:
                    now = datetime.now()
                    year_month = f"{now.year}{now.month:02d}"

                url = f"{API_BASE}/stations/{station_id}/data?yearMonth={year_month}"
                d_resp = await client.get(url)
                if d_resp.status_code == 200:
                    return d_resp.json().get("data", [])
        except Exception as e:
            print(f"[SENAMHI Observatorio Warning] Error obteniendo lecturas de estación {station_id}: {e}")
        return []

    def find_nearest_station(
        self,
        lat: float,
        lon: float,
        tipo: Optional[str] = None,
        solo_automaticas: bool = False
    ) -> Optional[Dict[str, Any]]:
        """
        Encuentra la estación SENAMHI más cercana usando la fórmula de Haversine.
        """
        candidatas = self._estaciones_cache
        if tipo:
            candidatas = [e for e in candidatas if e.get("typeId") == tipo.upper()]
        if solo_automaticas:
            candidatas = [e for e in candidatas if "AUTOM" in str(e.get("subTypeDescription", "")).upper()]

        if not candidatas:
            return None

        mejor_estacion = None
        menor_distancia_km = float("inf")

        for est in candidatas:
            e_lat = est.get("latitude")
            e_lon = est.get("longitude")
            if e_lat is None or e_lon is None:
                continue

            # Haversine distance
            rad = math.pi / 180
            dlat = (e_lat - lat) * rad
            dlon = (e_lon - lon) * rad
            a = (
                math.sin(dlat / 2) ** 2
                + math.cos(lat * rad) * math.cos(e_lat * rad) * math.sin(dlon / 2) ** 2
            )
            c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
            distancia_km = 6371.0 * c

            if distancia_km < menor_distancia_km:
                menor_distancia_km = distancia_km
                mejor_estacion = est.copy()
                mejor_estacion["distancia_km"] = round(distancia_km, 2)

        return mejor_estacion


# Instancia singleton para uso en el agente Kuraq
senamhi_observatorio_connector = SenamhiObservatorioConnector()
