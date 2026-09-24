# backend/agents/kuraq/connectors/open_meteo_connector.py
"""
Conector Soberano para Open-Meteo Global Numerical Weather & Hydrological Models
(ECMWF IFS 9km, GloFAS River Discharge, ERA5 Reanalysis y Marine Weather).
Endpoints Oficiales:
- Forecast: https://api.open-meteo.com/v1/forecast
- Flood (GloFAS): https://flood-api.open-meteo.com/v1/flood
- Historical (ERA5): https://archive-api.open-meteo.com/v1/archive
- Marine: https://marine-api.open-meteo.com/v1/marine
"""
import os
import json
import httpx
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional
try:
    from agents.kuraq.connectors.base_connector import BaseSourceConnector
except ImportError:
    from backend.agents.kuraq.connectors.base_connector import BaseSourceConnector

API_KEY = os.getenv("OPEN_METEO_API_KEY")
FORECAST_BASE = "https://customer-api.open-meteo.com/v1/forecast" if API_KEY else "https://api.open-meteo.com/v1/forecast"
FLOOD_BASE = "https://flood-api.open-meteo.com/v1/flood"
ARCHIVE_BASE = "https://archive-api.open-meteo.com/v1/archive"
MARINE_BASE = "https://marine-api.open-meteo.com/v1/marine"


class OpenMeteoConnector(BaseSourceConnector):
    def __init__(self):
        super().__init__(
            source_id="SRC-OPEN-METEO-GLOBAL-CORE",
            nombre="Open-Meteo Global Numerical Weather & Flood Models (ECMWF/GloFAS)",
            ente="Open-Meteo / ECMWF / GloFAS Copernicus",
            tier="TIER_2_INSTITUCIONAL_INTERNACIONAL",
            endpoint=FORECAST_BASE,
            frecuencia_minutos=60,
            categoria="METEOROLOGIA_NUMERICA_GLOBAL"
        )

    def _inject_key(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Inyecta apikey si está configurada en el entorno."""
        if API_KEY:
            params["apikey"] = API_KEY
        return params

    async def sync(self) -> Dict[str, Any]:
        """
        Realiza un sondeo de comprobación de salud en el clúster de Open-Meteo
        probando una consulta estándar para Lima (-12.0464, -77.0428).
        """
        start_time = datetime.now(timezone.utc).isoformat()
        try:
            params = {
                "latitude": -12.0464,
                "longitude": -77.0428,
                "hourly": "temperature_2m,precipitation",
                "forecast_days": 1,
                "timezone": "America/Lima"
            }
            self._inject_key(params)

            async with httpx.AsyncClient(timeout=8.0) as client:
                resp = await client.get(FORECAST_BASE, params=params)
                if resp.status_code == 200:
                    data = resp.json()
                    raw_bytes = json.dumps(data, sort_keys=True).encode("utf-8")
                    sha256_hash = self.calculate_sha256(raw_bytes)

                    self.ultimo_sync_utc = start_time
                    self.ultimo_hash_sha256 = sha256_hash
                    self.ultimo_estado = "SINCRONIZADO_OK"

                    resumen = {
                        "source_id": self.source_id,
                        "estado": "SINCRONIZADO_OK",
                        "cluster_disponible": True,
                        "modelo_primario": "ECMWF / Best Match",
                        "hash_sha256": sha256_hash,
                        "timestamp_utc": start_time
                    }
                    self.ultimo_payload_resumen = resumen
                    return resumen
                else:
                    raise RuntimeError(f"Open-Meteo HTTP {resp.status_code}: {resp.text}")
        except Exception as e:
            self.ultimo_estado = "ERROR_SINCRONIZACION"
            return {
                "source_id": self.source_id,
                "estado": "ERROR_SINCRONIZACION",
                "error": str(e),
                "timestamp_utc": start_time
            }

    async def get_forecast(
        self,
        lat: float,
        lon: float,
        days: int = 7,
        model: str = "ecmwf_ifs025"
    ) -> Dict[str, Any]:
        """
        Obtiene pronóstico numérico de alta resolución (precipitación horaria, temperatura,
        viento, humedad y parámetros termodinámicos convectivos CAPE).
        """
        params = {
            "latitude": lat,
            "longitude": lon,
            "hourly": (
                "precipitation,precipitation_probability,temperature_2m,relative_humidity_2m,"
                "wind_speed_10m,wind_direction_10m,cape,surface_pressure"
            ),
            "daily": "precipitation_sum,precipitation_hours,temperature_2m_max,temperature_2m_min,wind_speed_10m_max",
            "models": model,
            "timezone": "America/Lima",
            "forecast_days": min(max(days, 1), 16)
        }
        self._inject_key(params)

        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                resp = await client.get(FORECAST_BASE, params=params)
                if resp.status_code == 200:
                    return resp.json()
        except Exception as e:
            print(f"[Open-Meteo Warning] Forecast falló: {e}")
        return {}

    async def get_flood_discharge(self, lat: float, lon: float, days: int = 7) -> Dict[str, Any]:
        """
        Obtiene predicción de caudal de río en m³/s de GloFAS (Global Flood Awareness System).
        """
        params = {
            "latitude": lat,
            "longitude": lon,
            "daily": "river_discharge,river_discharge_mean,river_discharge_median,river_discharge_max,river_discharge_min",
            "forecast_days": min(max(days, 1), 16)
        }
        self._inject_key(params)

        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                resp = await client.get(FLOOD_BASE, params=params)
                if resp.status_code == 200:
                    return resp.json()
        except Exception as e:
            print(f"[Open-Meteo Warning] Flood GloFAS falló: {e}")
        return {}

    async def get_historical_era5(
        self,
        lat: float,
        lon: float,
        start_date: str,
        end_date: str
    ) -> Dict[str, Any]:
        """
        Extrae datos históricos del reanálisis ERA5 para cálculo de percentiles y anomalías FEN.
        Formato fechas: 'YYYY-MM-DD'.
        """
        params = {
            "latitude": lat,
            "longitude": lon,
            "start_date": start_date,
            "end_date": end_date,
            "daily": "precipitation_sum,temperature_2m_max,temperature_2m_min",
            "timezone": "America/Lima"
        }
        self._inject_key(params)

        try:
            async with httpx.AsyncClient(timeout=15.0) as client:
                resp = await client.get(ARCHIVE_BASE, params=params)
                if resp.status_code == 200:
                    return resp.json()
        except Exception as e:
            print(f"[Open-Meteo Warning] ERA5 Archive falló: {e}")
        return {}

    async def get_marine_conditions(self, lat: float, lon: float, days: int = 5) -> Dict[str, Any]:
        """
        Obtiene parámetros marinos para la costa peruana (SST, altura de ola, swell).
        """
        params = {
            "latitude": lat,
            "longitude": lon,
            "hourly": "wave_height,wave_direction,wave_period,wind_wave_height,swell_wave_height",
            "daily": "wave_height_max",
            "timezone": "America/Lima",
            "forecast_days": min(max(days, 1), 8)
        }
        self._inject_key(params)

        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                resp = await client.get(MARINE_BASE, params=params)
                if resp.status_code == 200:
                    return resp.json()
        except Exception as e:
            print(f"[Open-Meteo Warning] Marine conditions falló: {e}")
        return {}


# Instancia singleton para uso en el agente Kuraq
open_meteo_connector = OpenMeteoConnector()
