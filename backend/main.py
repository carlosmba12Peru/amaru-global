# backend/main.py
"""
FastAPI entrypoint for COEN-Digital Backend con Arquitectura Multi-Agente Autónoma
"""
import os
from dotenv import load_dotenv
load_dotenv()

from typing import Optional, List, Dict, Any
from fastapi import FastAPI, BackgroundTasks, Query, Response
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from agents.orchestrator import run_coen_agent_pipeline, get_audit_log_history
from agents.schemas import MultiAgentPipelineResponse
from services.meteo_service import MeteoService
from services.meteo_service_pro import MeteoServicePro
from services.clocks_service import get_tactical_clocks_telemetry, get_yachay_knowledge
from services.historical_data_service import historical_service
from services.citizen_report_service import citizen_service
from services.national.dhn_buoy_service import get_all_buoys
from services.national.imarpe_service import imarpe_service
from services.national.enfen_service import enfen_service
from services.legal_framework_service import legal_service
from services.ayni_service import ayni_service

app = FastAPI(
    title="COEN-Digital Multi-Agent Backend",
    version="0.2.0",
    description="Sistema Multi-Agente Autónomo de Alerta Temprana e Inteligencia Territorial COEN"
)

# CORS middleware (permite comunicación con el frontend Next.js)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

COEN_PERFIL = os.getenv("COEN_PERFIL", "full").lower()

class UbigeoRequest(BaseModel):
    ubigeo: str
    force_critical: bool = False

@app.get("/health")
async def health_check():
    return {
        "status": "ok",
        "system": "COEN-Digital Multi-Agent",
        "profile": COEN_PERFIL,
        "agents": [
            "1. Agente Centinela Hidrometeorológico",
            "2. Agente de Evaluación Táctica y Logística",
            "3. Agente Lingüístico Territorial e Inclusivo",
            "4. Agente Despachador y Auditor de Canales"
        ]
    }

@app.get("/api/profile")
async def get_coen_profile():
    """
    Retorna la configuración del perfil modular tripartito activo en el sistema.
    """
    return {
        "profile": COEN_PERFIL,
        "system": "AMARU-CLIMATE / COEN DIGITAL",
        "version": "3.0.0-tripartito",
        "pillars": {
            "nacional": {
                "nombre": "COEN NACIONAL DIGITAL",
                "rol": "Comando y Control C2 Macro-Estratégico",
                "cobertura": "159 Cuencas Hidrográficas, ENFEN, IMARPE, SISMATE CAP v1.2"
            },
            "municipal": {
                "nombre": "COEN MUNICIPAL DIGITAL",
                "rol": "Gestión Táctica Distrital y Memoria Histórica",
                "cobertura": "1,891 Distritos del Perú (UBIGEO), Inspector Climático Open-Meteo, Fichas EDAN"
            },
            "social": {
                "nombre": "COEN SOCIAL DIGITAL",
                "rol": "Resiliencia Comunitaria y Red de Ollas Comunes",
                "cobertura": "Ollas Comunes, Juntas Vecinales, Bot Telegram Bilingüe, PWA Offline-First"
            }
        }
    }


@app.get("/api/clocks/enso")
async def get_polar_clocks():
    """
    Retorna la telemetría viva y cinemática polar para los Relojes Tácticos AMARU-FEN y AMARU-CHIRI.
    """
    return await get_tactical_clocks_telemetry()

# ============================================================================
# ENDPOINTS OPEN-METEO PRO: DECRETO DE EMERGENCIA D.S. 124 (893 DISTRITOS)
# ============================================================================

@app.get("/api/meteo/ds124-matrix")
async def get_meteo_ds124_matrix():
    """
    Retorna la matriz integral y semáforo de precipitación Open-Meteo para los
    893 distritos declarados en el Decreto de Emergencia D.S. Nº 124-2026-PCM ante el FEN 2026-2027.
    """
    return MeteoServicePro.get_ds124_matrix()

@app.get("/api/meteo/ds124-district/{ubigeo}")
async def get_meteo_ds124_district(ubigeo: str):
    """
    Retorna la telemetría viva y perfil meteorológico detallado de Open-Meteo para un distrito específico.
    """
    return await MeteoServicePro.fetch_district_live(ubigeo)

@app.get("/api/meteo/live/{lat}/{lng}")
async def get_meteo_live_coords(lat: float, lng: float):
    """
    Consulta en tiempo real telemetría multivariable Open-Meteo para cualquier par de coordenadas.
    """
    return await MeteoServicePro.fetch_cuenca_advanced(lat, lng)

@app.get("/api/data/districts/search")
async def search_districts_endpoint(q: str = Query(..., min_length=1), limit: int = Query(15, ge=1, le=50)):
    """
    Buscador omnicanal de los 1,891 distritos del Perú (autocompletado por nombre, provincia, departamento o UBIGEO).
    """
    return historical_service.search_districts(q, limit=limit)

# ============================================================================
# ENDPOINTS MEMORIA HISTÓRICA MUNICIPAL DE DESASTRES (CAF, INDECI, OPS, MINEDU)
# ============================================================================

@app.get("/api/historico/distrito/{ubigeo}")
async def get_historico_distrito_endpoint(ubigeo: str):
    """
    Retorna la memoria histórica de desastres y lecciones aprendidas (1983, 1998, 2017)
    para el alcalde y funcionarios del distrito especificado por UBIGEO.
    """
    from fastapi import HTTPException
    memoria = historical_service.get_historical_district_memory(ubigeo)
    if not memoria:
        raise HTTPException(status_code=404, detail=f"Distrito con UBIGEO {ubigeo} no encontrado")
    return memoria

@app.get("/api/historico/resumen")
async def get_historico_resumen_endpoint():
    """
    Retorna los agregados macro e indicadores nacionales de memoria histórica del FEN.
    """
    return historical_service.get_historical_summary_metrics()

@app.post("/api/historico/reload")
async def reload_historico_endpoint():
    """Recarga los datasets de memoria histórica en memoria."""
    historical_service.reload_datasets()
    return {"status": "ok", "total": len(historical_service.memoria_historica_distritos)}

@app.get("/api/meteo/district-forecast/{ubigeo}")
async def get_district_forecast_endpoint(ubigeo: str):
    """
    Retorna el pronóstico meteorológico multivariable de alta resolución (Open-Meteo Pro) para cualquier distrito:
    Condiciones actuales (Hero Card), matriz de 7 días (08:00, 14:00, 20:00, Lluvia, Viento, Nieve, Sol), 24 horas y fin de semana.
    """
    return await MeteoServicePro.fetch_district_detailed_forecast(ubigeo)

# ============================================================================
# ENDPOINTS OFICIALES ENFEN (COMUNICADOS PDF Y ESCALAMIENTO HISTÓRICO)
# ============================================================================

@app.get("/api/enfen/latest")
async def get_enfen_latest_endpoint():
    """Retorna el comunicado oficial más reciente del ENFEN y su desglose."""
    return enfen_service.get_latest()

@app.get("/api/enfen/history")
async def get_enfen_history_endpoint():
    """Retorna la serie temporal de evolución de probabilidades del ENFEN (Mayo a Setiembre 2026)."""
    return {
        "total_comunicados": len(enfen_service.get_all()),
        "serie_historica": enfen_service.get_history(),
        "ultimo_comunicado": enfen_service.get_latest()
    }

@app.get("/api/enfen/comunicados")
async def get_enfen_comunicados_endpoint():
    """Retorna el listado completo de comunicados ENFEN procesados con su texto ejecutivo."""
    return {
        "total": len(enfen_service.get_all()),
        "comunicados": enfen_service.get_all(),
        "directorio_origen": "data/Estudio Nacional del Fenómeno del Niño ENFEN"
    }

@app.post("/api/enfen/sync")
async def sync_enfen_pdfs():
    """Re-escanea en caliente la carpeta de PDFs del ENFEN, parsea los comunicados y actualiza caché."""
    res = enfen_service.sync_folder()
    return res

@app.get("/api/data/historical/summary")
async def get_historical_summary():
    """
    Retorna resumen estadístico de la base de datos histórica integrada (1,891 distritos, D.S. 124, quebradas).
    """
    return historical_service.get_summary_statistics()

@app.get("/api/data/distrito/{ubigeo}/profile")
async def get_district_profile(ubigeo: str):
    """
    Retorna el perfil histórico, legal, poblacional y de peligro CENEPRED de cualquier ubigeo del Perú.
    """
    return historical_service.get_district_full_profile(ubigeo)

@app.get("/api/data/distrito/{ubigeo}/etnoterritorial")
async def get_district_etnoterritorial(ubigeo: str):
    """
    Retorna el perfil etnoterritorial de alta precisión (CENEPRED + D.S. 124-PCM + AMARU-CHIRI + RENALIO Tomos I y II),
    evaluando la triple vulnerabilidad y el régimen obligatorio de difusión bilingüe vs monolingüe.
    """
    return historical_service.get_etnoterritorial_profile(ubigeo)

@app.get("/api/data/distrito/{ubigeo}/ipi")
async def get_district_ipi(ubigeo: str):
    """
    Retorna el cálculo detallado del Índice de Prioridad de Intervención (IPI) y desglose de los 4 factores para un ubigeo.
    """
    return historical_service.calculate_ipi(ubigeo)

@app.get("/api/data/etnoterritorial/ranking-triple-vulnerabilidad")
async def get_etnoterritorial_ranking(limit: int = 50, filtro: str = "todos"):
    """
    Retorna el ranking nacional de distritos según el Índice de Prioridad de Intervención (IPI),
    cruzando Peligro CENEPRED, Declaratoria D.S. 124-2026-PCM, Heladas y Brecha RENALIO.
    Filtros: 'todos', 'triple_vulnerabilidad', 'fen_ds124', 'heladas', 'bilingues'.
    """
    ranking = historical_service.get_ranking_triple_vulnerabilidad(limit=limit, filtro=filtro)
    return {
        "filtro_aplicado": filtro,
        "limite": limit,
        "total_encontrados": len(ranking),
        "ranking": ranking
    }

@app.get("/api/data/etnoterritorial/exportar-csv")
async def export_etnoterritorial_csv():
    """
    Exporta la Matriz Nacional de Triple Vulnerabilidad Territorial e IPI en formato CSV para analistas del COEN.
    """
    csv_content = historical_service.export_triple_vulnerabilidad_csv()
    return Response(
        content=csv_content,
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=COEN_Matriz_Triple_Vulnerabilidad_IPI_1891_Distritos.csv"}
    )

@app.get("/api/data/etnoterritorial/formulas")
async def get_etnoterritorial_formulas():
    """
    Retorna la especificación técnica, formulación matemática LaTeX y ponderaciones
    del Índice de Prioridad de Intervención (IPI), IPH (Huaicos) e ISH (Heladas).
    """
    return historical_service.get_formulas_metadata()

@app.get("/api/data/quebradas/criticas")
async def get_quebradas():
    """
    Retorna el catálogo nacional de 46 quebradas críticas mapeadas con umbrales y conos de deyección.
    """
    return {
        "total": len(historical_service.get_quebradas_criticas_list()),
        "quebradas": historical_service.get_quebradas_criticas_list()
    }

@app.get("/api/maps/layers/telemetry")
async def get_map_layers_telemetry():
    """
    Retorna la telemetría unificada para las capas especializadas del Geovisor C2:
    - Boyas oceanográficas y anomalía de temperatura del mar (TSM / SST ENSO de NOAA / IMARPE / DHN)
    - Polígono marino Región Niño 1+2 y Niño 3.4
    - Clima en tiempo real (Open-Meteo Pro, precipitación ECMWF, CAPE, GloFAS)
    - Distritos de heladas y friajes (AMARU-CHIRI)
    - Memoria histórica FEN 1998/2017 y récords de desastre
    - Red de estaciones de aforo hidrológico ANA/SENAMHI (caudales simulados vs récord 1998)
    - Catálogo nacional de 46 quebradas críticas con conos de deyección
    """
    boyas = get_all_buoys()
    quebradas = historical_service.get_quebradas_criticas_list()
    hist_layers = historical_service.get_map_historical_layers()

    # Catálogo de clima en distritos representativos (Open-Meteo Pro)
    clima_distritos = [
        {
            "ubigeo": "150118", "nombre": "Lurigancho-Chosica", "region": "Lima", "cuenca": "Río Rímac",
            "lat": -11.9428, "lng": -76.7094, "lluvia_24h_mm": 41.2, "cape_j_kg": 1620, "suelo_pct": 88.0,
            "caudal_m3s": 118.5, "nivel_alerta": "ROJO", "tipo_amenaza": "HUAICO_LADERA"
        },
        {
            "ubigeo": "200101", "nombre": "Piura / Catacaos", "region": "Piura", "cuenca": "Río Piura",
            "lat": -5.1945, "lng": -80.6328, "lluvia_24h_mm": 48.0, "cape_j_kg": 1850, "suelo_pct": 92.0,
            "caudal_m3s": 890.0, "nivel_alerta": "ROJO", "tipo_amenaza": "DESBORDE_FLUVIAL"
        },
        {
            "ubigeo": "140304", "nombre": "Íllimo", "region": "Lambayeque", "cuenca": "Río La Leche",
            "lat": -6.4800, "lng": -79.8500, "lluvia_24h_mm": 22.0, "cape_j_kg": 980, "suelo_pct": 68.0,
            "caudal_m3s": 320.0, "nivel_alerta": "AMARILLO", "tipo_amenaza": "CRECIDA_VALLE"
        },
        {
            "ubigeo": "130102", "nombre": "El Porvenir / Trujillo", "region": "La Libertad", "cuenca": "Qda. San Ildefonso",
            "lat": -8.0833, "lng": -78.9667, "lluvia_24h_mm": 36.5, "cape_j_kg": 1420, "suelo_pct": 76.0,
            "caudal_m3s": 85.0, "nivel_alerta": "ROJO", "tipo_amenaza": "HUAICO_REINCIDENTE"
        },
        {
            "ubigeo": "240101", "nombre": "Tumbes Centro", "region": "Tumbes", "cuenca": "Río Puyango-Tumbes",
            "lat": -3.5667, "lng": -80.4500, "lluvia_24h_mm": 52.0, "cape_j_kg": 1920, "suelo_pct": 94.0,
            "caudal_m3s": 940.0, "nivel_alerta": "ROJO", "tipo_amenaza": "DESBORDE_COSTA_NORTE"
        },
        {
            "ubigeo": "150115", "nombre": "Chaclacayo", "region": "Lima", "cuenca": "Río Rímac",
            "lat": -11.9750, "lng": -76.7667, "lluvia_24h_mm": 32.0, "cape_j_kg": 1380, "suelo_pct": 82.0,
            "caudal_m3s": 105.0, "nivel_alerta": "AMARILLO", "tipo_amenaza": "HUAICO_QUEBRADAS"
        }
    ]

    # Catálogo de distritos de heladas (AMARU-CHIRI)
    heladas_distritos = [
        {
            "ubigeo": "210505", "nombre": "Santa Rosa / Mazocruz", "region": "Puno", "provincia": "El Collao",
            "lat": -16.5833, "lng": -69.6500, "altitud_msnm": 3970, "temperatura_c": -8.4, "anomalia_c": -4.2,
            "nivel_alerta": "ROJO", "camelidos_expuestos": 45000, "tipo": "HELADA_EXTREMA"
        },
        {
            "ubigeo": "080801", "nombre": "Espinar", "region": "Cusco", "provincia": "Espinar",
            "lat": -14.7936, "lng": -71.4131, "altitud_msnm": 3928, "temperatura_c": -6.1, "anomalia_c": -3.5,
            "nivel_alerta": "AMARILLO", "camelidos_expuestos": 32000, "tipo": "HELADA_AGROMETEOROLOGICA"
        },
        {
            "ubigeo": "040501", "nombre": "Imata / San Antonio de Chuca", "region": "Arequipa", "provincia": "Caylloma",
            "lat": -15.8333, "lng": -71.0833, "altitud_msnm": 4500, "temperatura_c": -9.2, "anomalia_c": -4.8,
            "nivel_alerta": "ROJO", "camelidos_expuestos": 28000, "tipo": "HELADA_ALTIURBANA"
        },
        {
            "ubigeo": "210301", "nombre": "Macusani", "region": "Puno", "provincia": "Carabaya",
            "lat": -14.0667, "lng": -70.4333, "altitud_msnm": 4315, "temperatura_c": -7.5, "anomalia_c": -3.8,
            "nivel_alerta": "AMARILLO", "camelidos_expuestos": 55000, "tipo": "FRIAJE_NIEVE"
        }
    ]

    # Telemetría in-situ de estaciones costeras de IMARPE
    imarpe_latest = imarpe_service.get_latest_bulletin()
    anomalia_prom = imarpe_latest["resumen"]["promedio_anomalia_costera"] if imarpe_latest and "resumen" in imarpe_latest else 4.89
    estaciones_costeras_imarpe = imarpe_service.get_stations_catalog()

    return {
        "tsm_marino": {
            "region_enso": "NIÑO 1+2 (Costa Peruana)",
            "anomalia_promedio_tsm_c": anomalia_prom,
            "estado_enfen": "ALERTA_NINO_COSTERO",
            "ondas_kelvin_costa": True,
            "boyas": boyas,
            "estaciones_imarpe": estaciones_costeras_imarpe,
            "diagnostico_imarpe": imarpe_latest.get("diagnostico_oficial") if imarpe_latest else "",
            "poligono_marino_nino_1_2": [
                {"lat": -3.2, "lng": -81.8},
                {"lat": -3.2, "lng": -80.2},
                {"lat": -14.5, "lng": -76.5},
                {"lat": -18.2, "lng": -71.5},
                {"lat": -18.2, "lng": -74.0},
                {"lat": -10.0, "lng": -80.5},
                {"lat": -5.0, "lng": -82.5}
            ]
        },
        "clima_ubigeos": clima_distritos,
        "heladas_amaru_chiri": heladas_distritos,
        "total_quebradas_criticas": len(quebradas),
        "quebradas_criticas": quebradas[:46],
        "capas_historicas": hist_layers,
        "satelite_config": {
            "noaa_crw_sst_wms": "https://coastwatch.pfeg.noaa.gov/erddap/wms/erdCRWchla1day/request",
            "noaa_goes16_geocolor": "https://cdn.star.nesdis.noaa.gov/GOES16/ABI/SECTOR/ssa/GEOCOLOR/",
            "noaa_goes16_ir": "https://cdn.star.nesdis.noaa.gov/GOES16/ABI/SECTOR/ssa/13/",
            "rainviewer_api_host": "https://api.rainviewer.com/public/weather-maps.json"
        }
    }

@app.get("/api/cuencas/macro")
async def macro_status():
    return {
        "regimen": os.getenv("SEASON_MODE", "EL_NINO"),
        "cuencas": [
            {"id": "rimac", "nombre": "Cuenca Río Rímac", "nivel": "ROJO", "distritos_criticos": 3},
            {"id": "piura", "nombre": "Cuenca Río Piura", "nivel": "ROJO", "distritos_criticos": 5},
            {"id": "la_leche", "nombre": "Cuenca Río La Leche", "nivel": "AMARILLO", "distritos_criticos": 2},
            {"id": "altiplano", "nombre": "Cuenca Altiplano Puno", "nivel": "AMARILLO", "distritos_criticos": 4}
        ]
    }

@app.get("/api/distrito/{ubigeo}/telemetria")
async def distrito_telemetry(ubigeo: str):
    pipeline_res = await run_coen_agent_pipeline(ubigeo, force_critical=False)
    return {
        "ubigeo": ubigeo,
        "distrito": pipeline_res.distrito,
        "telemetria": pipeline_res.triaje.telemetria,
        "nivel_alerta": pipeline_res.triaje.nivel_alerta,
        "is_critical": pipeline_res.triaje.is_critical
    }

# -------------------------------------------------------------------
# ENDPOINTS MULTI-AGENTE COEN
# -------------------------------------------------------------------

@app.post("/api/agents/run/{ubigeo}", response_model=MultiAgentPipelineResponse)
async def execute_agent_pipeline(ubigeo: str, force_critical: bool = Query(False)):
    """
    Dispara la ejecución completa de la cadena multi-agente para el distrito especificado.
    """
    response = await run_coen_agent_pipeline(ubigeo, force_critical=force_critical)
    return response

@app.get("/api/agents/audit")
async def get_audit_trail():
    """
    Retorna los registros inmutables de auditoría de alertas tempranas emitidas por los agentes.
    """
    return {
        "total_eventos": len(get_audit_log_history()),
        "eventos": get_audit_log_history()
    }

@app.get("/api/agents/status")
async def get_agents_status():
    """
    Diagnóstico operativo de los 4 agentes del sistema.
    """
    return {
        "sistema": "COEN-Digital Multi-Agent Swarm",
        "estado": "ACTIVO_24_7",
        "motor_llm": "Google Gemini 1.5 en AI Studio / Vertex AI",
        "agentes": [
            {
                "id": 1,
                "nombre": "Agente Centinela Hidrometeorológico",
                "rol": "Data & Triage Agent",
                "estado": "VIGILANCIA_CONTINUA",
                "herramientas": ["Open-Meteo Pro", "GloFAS Flood API", "Matriz de Saturación Edáfica"]
            },
            {
                "id": 2,
                "nombre": "Agente de Evaluación Táctica y Logística",
                "rol": "Crisis Assessment Agent",
                "estado": "LISTO",
                "herramientas": ["INEI Padrón Población", "MTC Red Vial", "INDECI Inventario Maquinaria"]
            },
            {
                "id": 3,
                "nombre": "Agente Lingüístico Territorial e Inclusivo",
                "rol": "Cultural & Dispatch Agent",
                "estado": "LISTO",
                "herramientas": ["Dialectos Quechua Chanka/Collao/Áncash", "Aymara", "Castellano Llano"]
            },
            {
                "id": 4,
                "nombre": "Agente Despachador y Auditor de Canales",
                "rol": "Notification & Feedback Agent",
                "estado": "LISTO",
                "herramientas": ["Telegram Canal Autoridades COER", "Telegram Canal Vecinal Comunitario", "Auditoría UTC"]
            }
        ]
    }

@app.post("/api/distrito/{ubigeo}/alerta")
async def disparar_alerta(ubigeo: str, background_tasks: BackgroundTasks):
    """
    Compatibilidad hacia atrás con el endpoint anterior, orquestando los 4 agentes de forma asíncrona.
    """
    res = await run_coen_agent_pipeline(ubigeo, force_critical=True)
    return {
        "status": "alerta multi-agente ejecutada y despachada",
        "incident_id": res.incident_id,
        "ubigeo": ubigeo,
        "distrito": res.distrito,
        "nivel_alerta": res.triaje.nivel_alerta,
        "canales_despachados": 2
    }

# -------------------------------------------------------------
# MÓDULO DE REPORTE CIUDADANO SEGURO & BLINDAJE ANTI-FAKE
# -------------------------------------------------------------
class ReporteCiudadanoInput(BaseModel):
    tipo_registro: str = "EN_VIVO_2026_2027"  # "MEMORIA_HISTORICA" o "EN_VIVO_2026_2027"
    evento_historico_referencia: Optional[str] = "FEN_2026_2027_LIVE"
    tipo_evento: str = "INUNDACION_PLUVIAL"
    ubigeo: str
    distrito: Optional[str] = None
    provincia: Optional[str] = None
    departamento: Optional[str] = None
    lugar_especifico: str
    lat: Optional[float] = None
    lng: Optional[float] = None
    nivel_afectacion: str = "RODILLA_50CM"
    calle_inundada: bool = True
    testimonio: str
    nombre_archivo: Optional[str] = "captura_ciudadana.jpg"
    foto_preview_url: Optional[str] = None
    dispositivo_exif: Optional[str] = "Dispositivo Móvil Ciudadano"

@app.get("/api/ciudadano/reportes")
async def obtener_reportes_ciudadanos(
    vista: str = Query("publica", description="Nivel de privacidad: 'publica' (solo pines discretos y anonimizados) o 'militar_c2' (peritaje forense completo y fotos)"),
    tipo_registro: Optional[str] = Query(None, description="Filtrar por 'MEMORIA_HISTORICA' o 'EN_VIVO_2026_2027'"),
    ubigeo: Optional[str] = Query(None, description="Filtrar por código UBIGEO de 6 dígitos")
):
    """
    Retorna reportes de campo.
    - En vista='publica': CERO fotos públicas, CERO testimonios alarmistas (Blindaje Anti-Pánico).
    - En vista='militar_c2': Acceso irrestricto de inteligencia con dictamen IA Gemini Vision y metadatos EXIF.
    """
    return citizen_service.get_reportes(
        vista=vista,
        tipo_registro=tipo_registro,
        ubigeo=ubigeo
    )

@app.post("/api/ciudadano/reportar")
async def registrar_reporte_ciudadano(reporte: ReporteCiudadanoInput):
    """
    Registra un reporte ciudadano, ejecuta peritaje forense de consistencia,
    valida con quebradas CENEPRED y agrupa por consenso espacial.
    """
    payload = {
        "tipo_registro": reporte.tipo_registro,
        "evento_historico_referencia": reporte.evento_historico_referencia,
        "tipo_evento": reporte.tipo_evento,
        "ubigeo": reporte.ubigeo,
        "distrito": reporte.distrito,
        "provincia": reporte.provincia,
        "departamento": reporte.departamento,
        "lugar_especifico": reporte.lugar_especifico,
        "coordenadas": {"lat": reporte.lat, "lng": reporte.lng} if reporte.lat and reporte.lng else {},
        "nivel_afectacion": reporte.nivel_afectacion,
        "calle_inundada": reporte.calle_inundada,
        "testimonio": reporte.testimonio,
        "nombre_archivo": reporte.nombre_archivo,
        "foto_preview_url": reporte.foto_preview_url,
        "dispositivo_exif": reporte.dispositivo_exif
    }
    return citizen_service.registrar_reporte(payload)

@app.get("/api/ciudadano/estadisticas")
async def obtener_estadisticas_ciudadanas():
    """
    Retorna métricas de la red de reporte ciudadano y la efectividad del blindaje anti-fake.
    """
    return citizen_service.get_estadisticas()

@app.get("/api/ciudadano/transmisiones-en-vivo")
async def obtener_transmisiones_en_vivo():
    """
    Retorna transmisiones en vivo (Drones COE, YouTubers locales y TikTokers acreditados)
    bajo supervisión del Sandbox de Cuarentena Audiovisual de la Sala de Crisis.
    """
    return citizen_service.get_transmisiones_en_vivo()

# ==============================================================================
# RUTAS DE TELEMETRÍA OCEANOGRÁFICA NACIONAL - IMARPE (BDO / PPR 068 El Niño)
# ==============================================================================

@app.get("/api/imarpe/latest")
async def obtener_ultimo_boletin_imarpe():
    """
    Retorna el boletín diario oceanográfico más reciente del IMARPE:
    - Diagnóstico textual oficial de la franja marina peruana
    - Condiciones de Microescala (Tabla 1): 12 estaciones costeras fijas
    - Anomalías térmicas (°C) y semáforo de alerta
    - Resumen y estación crítica (ej. Paita / Chicama)
    """
    boletin = imarpe_service.get_latest_bulletin()
    if not boletin:
        return {"error": "No hay boletines de IMARPE disponibles en el sistema."}
    return boletin

@app.get("/api/imarpe/history")
async def obtener_historial_imarpe():
    """
    Retorna la serie temporal multitemporal de anomalías térmicas por estación costera
    para graficar tendencias diarias del calentamiento marino.
    """
    return imarpe_service.get_history()

@app.get("/api/imarpe/stations")
async def obtener_catalogo_estaciones_imarpe():
    """
    Retorna la red de las 12 estaciones oceanográficas costeras del IMARPE
    con su última telemetría in-situ y coordenadas para capas cartográficas.
    """
    return imarpe_service.get_stations_catalog()

@app.post("/api/imarpe/sync")
async def sincronizar_boletines_imarpe():
    """
    Dispara la sincronización y parsing automático de nuevos boletines PDF depositados
    en las carpetas de meses de 'Reporte de Imarpe diario/'.
    """
    resultado = imarpe_service.sync_bulletins(force=True)
    return resultado

# ==============================================================================
# RUTAS DE RELOJES POLARES TÁCTICOS - AMARU (FEN & CHIRI) & AMARU-YACHAY
# ==============================================================================

@app.get("/api/clocks")
async def obtener_relojes_tacticos():
    """
    Retorna la telemetría dinámica de los Relojes Polares Tácticos:
    - AMARU-FEN (Costa Pacífica & Cuencas Bajas) sincronizado con IMARPE BDO.
    - AMARU-CHIRI (Sierra Sur & Altiplano) sincronizado con SENAMHI Mazocruz.
    """
    return await get_tactical_clocks_telemetry()

@app.get("/api/yachay/knowledge")
async def obtener_conocimiento_yachay():
    """
    Retorna la base de conocimiento pedagógica y de gobernanza territorial de AMARU-YACHAY:
    - Doctrina para autoridades regionales y locales (PP 068, Ventana Dorada, SINAGERD).
    - Diálogo de saberes y bioindicadores ancestrales para comunidades campesinas e indígenas.
    """
    return get_yachay_knowledge()

# ==============================================================================
# RUTAS DE INTELIGENCIA JURÍDICA Y MARCO LEGAL FEN (AMARU-LEX - 51 NORMAS)
# ==============================================================================

@app.get("/api/marco-legal/summary")
async def obtener_resumen_marco_legal():
    """Retorna las métricas cuantitativas, desglose por sectores y categorías de las 51 normas FEN."""
    return legal_service.get_summary()

@app.get("/api/marco-legal/norms")
async def listar_normas_legales(category: Optional[str] = None, sector: Optional[str] = None, search: Optional[str] = None):
    """Lista y filtra las 51 normas legales oficiales con buscador por texto."""
    return legal_service.get_all_norms(category=category, sector=sector, search=search)

@app.get("/api/marco-legal/district/{ubigeo}")
async def obtener_estatus_legal_distrito(ubigeo: str, distrito: str = "", departamento: str = ""):
    """Retorna el amparo legal, días de vigencia restantes y facultades directas para un distrito específico."""
    return legal_service.get_district_legal_status(ubigeo, distrito_nombre=distrito, departamento=departamento)

@app.post("/api/marco-legal/generate-resolution")
async def generar_resolucion_alcaldia(payload: Dict[str, Any]):
    """Genera el proyecto de Resolución de Alcaldía oficial para Contratación Directa de Emergencia."""
    ubigeo = payload.get("ubigeo", "150118")
    distrito = payload.get("distrito", "Lurigancho-Chosica")
    alcalde = payload.get("alcalde", "Alcalde Distrital")
    objeto = payload.get("objeto", "Servicio de alquiler de 02 excavadoras sobre orugas para descolmatación")
    return legal_service.generate_resolution_draft(ubigeo, distrito, alcalde_nombre=alcalde, objeto_contratacion=objeto)

@app.get("/api/marco-legal/formats")
async def obtener_catalogo_formatos():
    """Retorna el kit oficial de formatos legales y administrativos para alcaldes en emergencias FEN."""
    return legal_service.get_official_formats_catalog()

@app.post("/api/marco-legal/chat")
async def chat_copiloto_juridico(payload: Dict[str, Any]):
    """Copiloto IA Jurídico RAG para resolver dudas sobre los 51 decretos con citas de artículos oficiales."""
    pregunta = payload.get("pregunta", "")
    return legal_service.query_legal_assistant(pregunta)

# ==============================================================================
# RUTAS DE PARTICIPACIÓN CIUDADANA Y ORGANIZACIONES SOCIALES (AMARU-AYNI)
# ==============================================================================

@app.get("/api/ayni/summary")
async def ayni_summary():
    """Retorna el resumen global del tablero comunitario AMARU-AYNI."""
    return ayni_service.get_community_summary()

@app.get("/api/ayni/ollas")
async def ayni_ollas():
    """Lista las ollas comunes y comedores populares georreferenciados."""
    return ayni_service.get_ollas_list()

@app.post("/api/ayni/ollas/support")
async def ayni_ollas_support(payload: Dict[str, Any]):
    """Registra una solicitud urgente de cisterna de agua potable o víveres para una olla común."""
    olla_id = payload.get("olla_id", "")
    motivo = payload.get("motivo", "Cisterna requerida con urgencia")
    return ayni_service.request_olla_support(olla_id, motivo)

@app.get("/api/ayni/juntas")
async def ayni_juntas():
    """Lista las juntas vecinales de seguridad ciudadana y brigadas operativas."""
    return ayni_service.get_juntas_list()

@app.get("/api/ayni/vulnerables")
async def ayni_vulnerables():
    """Lista el padrón de ciudadanos vulnerables para evacuación prioritaria."""
    return ayni_service.get_vulnerables_padron()

@app.post("/api/ayni/vulnerables")
async def ayni_vulnerables_add(payload: Dict[str, Any]):
    """Registra a un ciudadano vulnerable (adulto mayor, gestante, persona con discapacidad)."""
    return ayni_service.add_vulnerable_person(payload)

@app.get("/api/ayni/faenas")
async def ayni_faenas():
    """Lista las faenas y minkas comunitarias programadas (sacos terreros, descolmatación manual)."""
    return ayni_service.get_faenas_list()

@app.get("/api/ayni/salud")
async def ayni_salud():
    """Retorna estadísticas de vigilancia epidemiológica comunitaria (dengue, cloración de agua)."""
    return ayni_service.get_salud_stats()

@app.get("/api/ayni/difusion")
async def ayni_difusion_history():
    """Historial de alertas comunitarias despachadas por Telegram y Correo Electrónico."""
    return ayni_service.get_difusion_history()

@app.post("/api/ayni/broadcast")
async def ayni_broadcast(payload: Dict[str, Any]):
    """
    Despacha una alerta comunitaria o convocatoria a Telegram, Correo Electrónico o ambos.
    """
    canal = payload.get("canal", "AMBOS")
    destinatario = payload.get("destinatario", "@COEN_Comunidad_Peru")
    asunto = payload.get("asunto", "Alerta Comunitaria FEN 2026-2027")
    mensaje = payload.get("mensaje", "")
    return ayni_service.dispatch_broadcast(canal, destinatario, asunto, mensaje)
