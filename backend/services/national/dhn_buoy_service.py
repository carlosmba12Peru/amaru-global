# backend/services/national/dhn_buoy_service.py
"""
Servicio Oceanográfico Marino Costero (DHN - Dirección de Hidrografía y Navegación / IMARPE)
Monitorea la franja marina de 0 a 50 millas náuticas a través de boyas meteo-oceanográficas.
Detecta ondas Kelvin cálidas y calentamiento anómalo de la superficie marina (TSM / SST) frente al litoral.
"""
from typing import Dict, Any, List

BOYAS_TELEMETRIA = {
    "TUMBES": {
        "boya_id": "BOYA-DHN-TUMBES-00",
        "puerto_cercano": "Puerto Pizarro, Tumbes",
        "coordenadas": {"lat": -3.48, "lng": -80.45},
        "distancia_costa_mn": 12.0,
        "temperatura_mar_c": 26.8,
        "temperatura_climatologica_c": 23.6,
        "anomalia_tsm_c": 3.2,
        "onda_kelvin_activa": True,
        "profundidad_termoclina_m": 92.0,
        "estado_mar": "MAREJADA_LIGERA",
        "alerta_costera": "ALERTA_TERMICA_EXTREMA"
    },
    "PAITA": {
        "boya_id": "BOYA-DHN-PAITA-01",
        "puerto_cercano": "Paita, Piura",
        "coordenadas": {"lat": -5.08, "lng": -81.25},
        "distancia_costa_mn": 14.2,
        "temperatura_mar_c": 24.2,
        "temperatura_climatologica_c": 21.0,
        "anomalia_tsm_c": 3.2,
        "onda_kelvin_activa": True,
        "profundidad_termoclina_m": 88.0,
        "estado_mar": "LIGERO_MAREJADA",
        "alerta_costera": "ALERTA_TERMICA_ACTIVA"
    },
    "CHIMBOTE": {
        "boya_id": "BOYA-DHN-CHIMBOTE-03",
        "puerto_cercano": "Chimbote, Áncash",
        "coordenadas": {"lat": -9.08, "lng": -78.68},
        "distancia_costa_mn": 16.5,
        "temperatura_mar_c": 21.8,
        "temperatura_climatologica_c": 19.2,
        "anomalia_tsm_c": 2.6,
        "onda_kelvin_activa": True,
        "profundidad_termoclina_m": 72.0,
        "estado_mar": "NORMAL",
        "alerta_costera": "ALERTA_TERMICA_ACTIVA"
    },
    "CALLAO": {
        "boya_id": "BOYA-DHN-CALLAO-02",
        "puerto_cercano": "Callao, Lima",
        "coordenadas": {"lat": -12.05, "lng": -77.30},
        "distancia_costa_mn": 10.5,
        "temperatura_mar_c": 20.1,
        "temperatura_climatologica_c": 17.5,
        "anomalia_tsm_c": 2.6,
        "onda_kelvin_activa": True,
        "profundidad_termoclina_m": 68.0,
        "estado_mar": "NORMAL",
        "alerta_costera": "ALERTA_TERMICA_ACTIVA"
    },
    "PISCO": {
        "boya_id": "BOYA-DHN-PISCO-04",
        "puerto_cercano": "Paracas / Pisco, Ica",
        "coordenadas": {"lat": -13.78, "lng": -76.35},
        "distancia_costa_mn": 15.0,
        "temperatura_mar_c": 19.2,
        "temperatura_climatologica_c": 17.2,
        "anomalia_tsm_c": 2.0,
        "onda_kelvin_activa": True,
        "profundidad_termoclina_m": 60.0,
        "estado_mar": "NORMAL",
        "alerta_costera": "VIGILANCIA_TERMICA"
    },
    "ILO": {
        "boya_id": "BOYA-DHN-ILO-05",
        "puerto_cercano": "Ilo, Moquegua",
        "coordenadas": {"lat": -17.65, "lng": -71.42},
        "distancia_costa_mn": 11.8,
        "temperatura_mar_c": 17.6,
        "temperatura_climatologica_c": 16.3,
        "anomalia_tsm_c": 1.3,
        "onda_kelvin_activa": False,
        "profundidad_termoclina_m": 45.0,
        "estado_mar": "TRANQUILO",
        "alerta_costera": "NORMAL"
    }
}

async def get_dhn_buoy_status(region: str = "NORTE") -> Dict[str, Any]:
    """Retorna la telemetría de la boya costera más representativa."""
    if region == "NORTE" or region == "Piura":
        return BOYAS_TELEMETRIA["PAITA"]
    if region == "Tumbes":
        return BOYAS_TELEMETRIA["TUMBES"]
    return BOYAS_TELEMETRIA["CALLAO"]

def get_all_buoys() -> List[Dict[str, Any]]:
    """Retorna el catálogo completo de boyas para visualización en mapa cartográfico."""
    return list(BOYAS_TELEMETRIA.values())
