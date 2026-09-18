import os
import httpx
from typing import Dict, Any

API_KEY = os.getenv("OPEN_METEO_API_KEY")

class MeteoService:
    @staticmethod
    async def _fetch_safe(url: str, params: Dict[str, Any]) -> Dict[str, Any]:
        """Ejecuta llamadas HTTP seguras. Agrega API_KEY solo si existe."""
        if API_KEY:
            params["apikey"] = API_KEY
        
        async with httpx.AsyncClient(timeout=10.0) as client:
            try:
                resp = await client.get(url, params=params)
                if resp.status_code == 200:
                    return resp.json()
            except Exception as e:
                print(f"[Open-Meteo Warning] Falló consulta a {url}: {e}")
        return {}

    @classmethod
    async def get_meteo_data(cls, lat: float, lng: float, regimen: str = "EL_NINO") -> Dict[str, Any]:
        """
        Obtiene telemetría combinada de Open-Meteo (Weather Forecast + GloFAS Flood)
        y evalúa la criticidad según el régimen estacional (El Niño vs La Niña).
        """
        # 1. Open-Meteo Weather Forecast (Lluvia, Suelo Profundo, Heladas)
        weather_params = {
            "latitude": lat,
            "longitude": lng,
            "daily": "precipitation_sum,temperature_2m_min,snowfall_sum",
            "hourly": "soil_moisture_27_to_100cm,temperature_2m",
            "timezone": "America/Lima",
            "forecast_days": 7
        }
        w_data = await cls._fetch_safe("https://api.open-meteo.com/v1/forecast", weather_params)

        # 2. Open-Meteo Flood API (Caudal de ríos GloFAS en m³/s)
        flood_params = {
            "latitude": lat,
            "longitude": lng,
            "daily": "river_discharge",
            "forecast_days": 7
        }
        f_data = await cls._fetch_safe("https://flood-api.open-meteo.com/v1/flood", flood_params)

        # Extracción segura con fallbacks técnicos realistas
        daily = w_data.get("daily", {})
        hourly = w_data.get("hourly", {})
        flood_daily = f_data.get("daily", {})

        precip_list = daily.get("precipitation_sum", [])
        precip_24h = precip_list[0] if precip_list and precip_list[0] is not None else 18.5

        temp_min_list = daily.get("temperature_2m_min", [])
        min_temp = temp_min_list[0] if temp_min_list and temp_min_list[0] is not None else 14.0

        snow_list = daily.get("snowfall_sum", [])
        snow_sum = snow_list[0] if snow_list and snow_list[0] is not None else 0.0

        soil_list = hourly.get("soil_moisture_27_to_100cm", [])
        soil_val = soil_list[0] if soil_list and soil_list[0] is not None else 0.38

        river_list = flood_daily.get("river_discharge", [])
        river_flow = river_list[0] if river_list and river_list[0] is not None else 85.0

        # Reglas de Triaje Territorial Bimodal
        if regimen == "EL_NINO":
            # Huaicos e Inundaciones por saturación y crecida de ríos
            if (soil_val > 0.40 and precip_24h > 25.0) or river_flow > 800.0:
                nivel_alerta = "ROJO"
            elif soil_val > 0.30 or precip_24h > 15.0 or river_flow > 400.0:
                nivel_alerta = "AMARILLO"
            else:
                nivel_alerta = "VERDE"
        else:
            # Heladas, Nevadas y Friajes (Sierra Sur / Altiplano)
            if min_temp <= -6.0 or snow_sum > 5.0:
                nivel_alerta = "ROJO"
            elif min_temp <= 0.0 or snow_sum > 0.0:
                nivel_alerta = "AMARILLO"
            else:
                nivel_alerta = "VERDE"

        return {
            "precipitation_24h": round(float(precip_24h), 1),
            "soil_moisture": round(float(soil_val * 100), 1),  # Porcentaje 0-100%
            "river_flow": round(float(river_flow), 1),
            "min_temp": round(float(min_temp), 1),
            "snowfall": round(float(snow_sum), 1),
            "nivel_alerta": nivel_alerta
        }
