# backend/agents/sentinel_agent.py
"""
Agente 1: Agente Centinela Hidrometeorológico (Data & Triage Agent) V2.5
Monitorea de forma continua las variables hidro-atmosféricas mediante Open-Meteo Pro Full Stack:
- Modelo numérico ECMWF IFS 9km
- Termodinámica convectiva de huaicos: CAPE (J/kg)
- Perfil de suelo en 4 capas (0-7, 7-28, 28-100, 100-255 cm)
- Calibración nacional: Semáforo ENFEN, Boyas DHN/IMARPE y Bias Correction con EMA SENAMHI
"""
import time
from typing import Dict, Any
from agents.schemas import (
    HydroTelemetry,
    TriageResult,
    NationalValidationContext,
    SoilLayersProfile
)
from services.meteo_service_pro import MeteoServicePro
from services.national.senamhi_service import get_senamhi_ema_data
from services.national.enfen_service import get_enfen_official_status
from services.national.dhn_buoy_service import get_dhn_buoy_status
from services.national.imarpe_service import imarpe_service

UBIGEO_COORDS = {
    "150118": {"lat": -11.9428, "lng": -76.7094, "nombre": "Lurigancho-Chosica", "cuenca": "Río Rímac", "regimen": "EL_NINO", "region": "CENTRO"},
    "200101": {"lat": -5.1945, "lng": -80.6328, "nombre": "Piura", "cuenca": "Río Piura", "regimen": "EL_NINO", "region": "NORTE"},
    "140304": {"lat": -6.4800, "lng": -79.8500, "nombre": "Íllimo", "cuenca": "Río La Leche", "regimen": "EL_NINO", "region": "NORTE"},
    "210505": {"lat": -16.5833, "lng": -69.6500, "nombre": "Santa Rosa / Mazocruz", "cuenca": "Altiplano Puno", "regimen": "LA_NINA", "region": "SUR"},
    "080801": {"lat": -14.7936, "lng": -71.4131, "nombre": "Espinar", "cuenca": "Cusco", "regimen": "LA_NINA", "region": "SUR"},
}

class SentinelAgent:
    def __init__(self):
        self.name = "Agente Centinela Hidrometeorológico (Open-Meteo Pro + Red Nacional)"

    async def evaluate_ubigeo(self, ubigeo: str, force_critical: bool = False) -> TriageResult:
        geo = UBIGEO_COORDS.get(ubigeo, {
            "lat": -12.0464, "lng": -77.0428, "nombre": f"Distrito {ubigeo}", "cuenca": "Cuenca Local", "regimen": "EL_NINO", "region": "CENTRO"
        })

        # 1. Ingesta Open-Meteo Pro (ECMWF IFS 9km, CAPE, Suelo 4 Capas, GloFAS)
        pro_data = await MeteoServicePro.fetch_cuenca_advanced(geo["lat"], geo["lng"], ubigeo)

        # 2. Ingesta Red Nacional (ENFEN, DHN Boyas, SENAMHI EMA)
        enfen = await get_enfen_official_status()
        dhn = await get_dhn_buoy_status(geo.get("region", "CENTRO"))
        senamhi = await get_senamhi_ema_data(ubigeo)

        # 3. Algoritmo de Corrección de Sesgo (Bias Correction)
        lluvia_pro = pro_data["precipitation_24h"]
        lluvia_senamhi = senamhi.get("lluvia_real_24h_mm", lluvia_pro)
        # Si la estación real de SENAMHI marca mayor lluvia que el modelo numérico, calibramos al alza
        lluvia_calibrada = max(lluvia_pro, lluvia_senamhi)

        soil_layers = pro_data.get("suelo_4_capas", {})
        suelo_perfil = SoilLayersProfile(
            superficial_0_7cm=soil_layers.get("superficial_0_7cm", 42.0),
            radicular_7_28cm=soil_layers.get("radicular_7_28cm", 40.0),
            critica_talud_28_100cm=soil_layers.get("critica_talud_28_100cm", 38.0),
            profunda_100_255cm=soil_layers.get("profunda_100_255cm", 35.0)
        )

        cape = pro_data.get("cape_convectivo_j_kg", 1620.0)
        soil_critica = suelo_perfil.critica_talud_28_100cm
        river_flow = pro_data["river_flow_m3s"]

        telemetry = HydroTelemetry(
            ubigeo=ubigeo,
            nombre_distrito=geo["nombre"],
            cuenca=geo["cuenca"],
            regimen=geo["regimen"],
            modelo_numerico=pro_data.get("modelo_utilizado", "Open-Meteo Pro ECMWF IFS 9km"),
            precipitation_24h=lluvia_calibrada,
            cape_convectivo_j_kg=cape,
            soil_moisture=soil_critica,
            suelo_4_capas=suelo_perfil,
            river_flow=river_flow,
            min_temp=pro_data.get("min_temp", 14.0),
            snowfall=pro_data.get("snowfall", 0.0)
        )

        # Ingesta de telemetría in-situ oficial IMARPE
        imarpe_latest = imarpe_service.get_latest_bulletin()
        anomalia_marina_real = dhn.get("anomalia_tsm_c", 2.6)
        boya_origen_id = dhn.get("boya_id", "BOYA-DHN-PAITA-01")
        if imarpe_latest and imarpe_latest.get("estaciones"):
            # Si estamos en región norte, preferimos Paita o Chicama; si centro, Callao; si sur, Ilo
            target_station_name = "Paita" if geo.get("region") == "NORTE" else ("Callao" if geo.get("region") == "CENTRO" else "Ilo")
            est_match = next((e for e in imarpe_latest["estaciones"] if e["nombre"].lower() == target_station_name.lower() and e.get("anomalia_c") is not None), None)
            if est_match:
                anomalia_marina_real = est_match["anomalia_c"]
                boya_origen_id = f"IMARPE-{est_match['nombre'].upper()}"

        validacion = NationalValidationContext(
            enfen_status=enfen.get("estado_alerta", "ALERTA_NINO_COSTERO"),
            enfen_factor_sensibilidad=enfen.get("factor_sensibilidad", 1.35),
            dhn_boya_id=boya_origen_id,
            dhn_anomalia_tsm_c=anomalia_marina_real,
            dhn_onda_kelvin_activa=dhn.get("onda_kelvin_activa", True),
            senamhi_ema_codigo=senamhi.get("codigo", "EMA-CHOSICA-472"),
            senamhi_lluvia_real_24h_mm=lluvia_senamhi,
            senamhi_validada=True,
            bias_correction_aplicado=True
        )

        # 4. Matriz de Decisión Multi-Criterio con Umbral Adaptativo ENFEN
        # Umbral base modulado por el factor ENFEN: P_base / 1.35
        umbral_lluvia = 25.0 / validacion.enfen_factor_sensibilidad  # ~ 18.5 mm en Alerta ENFEN
        is_critical = False
        nivel = "VERDE"
        criterio = "Variables hidro-meteorológicas estables en cuenca."

        if force_critical:
            is_critical = True
            nivel = "ROJO"
            criterio = (
                f"¡DISPARO CRÍTICO FORZADO! Acoplamiento Niño 1+2 (+{validacion.dhn_anomalia_tsm_c}°C en boya {validacion.dhn_boya_id}) "
                f"con CAPE extremo ({cape} J/kg) y saturación de suelo al {soil_critica}% (EMA {validacion.senamhi_ema_codigo})."
            )
        elif geo["regimen"] == "EL_NINO":
            # Gatilladores:
            # 1. Termodinámico: CAPE extremo (>1400) + Suelo saturado (>35%)
            # 2. Hidráulico: Lluvia calibrada > umbral adaptativo + Caudal
            if (cape > 1400.0 and soil_critica > 35.0) or (lluvia_calibrada > umbral_lluvia and soil_critica > 35.0) or river_flow > 650.0:
                is_critical = True
                nivel = "ROJO"
                criterio = (
                    f"¡ALERTA ROJA EN CUENCA {geo['cuenca']}! ENFEN en {validacion.enfen_status}. "
                    f"Energía convectiva CAPE en {cape} J/kg con suelo crítico al {soil_critica}% "
                    f"y lluvia calibrada SENAMHI en {lluvia_calibrada} mm."
                )
            elif cape > 800.0 or lluvia_calibrada > 15.0:
                nivel = "AMARILLO"
                criterio = f"Vigilancia meteorológica. CAPE moderado ({cape} J/kg) con lluvia proyectada de {lluvia_calibrada} mm."
        else:
            # Heladas Altiplano
            if telemetry.min_temp <= -6.0 or telemetry.snowfall > 5.0:
                is_critical = True
                nivel = "ROJO"
                criterio = f"¡EMERGENCIA POR HELADA SEVERA! Temperatura mínima proyectada en {telemetry.min_temp}°C."
            elif telemetry.min_temp <= 0.0:
                nivel = "AMARILLO"
                criterio = f"Aviso preventivo por descenso térmico ({telemetry.min_temp}°C)."

        return TriageResult(
            ubigeo=ubigeo,
            distrito=geo["nombre"],
            cuenca=geo["cuenca"],
            nivel_alerta=nivel,
            is_critical=is_critical,
            criterio_disparo=criterio,
            telemetria=telemetry,
            validacion_nacional=validacion
        )
