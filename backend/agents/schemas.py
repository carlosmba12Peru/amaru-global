# backend/agents/schemas.py
"""
Modelos Pydantic para los contratos de datos entre los 4 agentes del COEN-Digital
Incluye soporte para Open-Meteo Pro Full Stack, calibración nacional (SENAMHI, ENFEN, DHN)
y estándar internacional CAP v1.2 (Common Alerting Protocol).
"""
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class SoilLayersProfile(BaseModel):
    superficial_0_7cm: float = Field(..., description="Humedad superficial (%)")
    radicular_7_28cm: float = Field(..., description="Humedad radicular (%)")
    critica_talud_28_100cm: float = Field(..., description="Humedad crítica de deslizamiento (%)")
    profunda_100_255cm: float = Field(..., description="Humedad de capa freática (%)")

class HydroTelemetry(BaseModel):
    ubigeo: str
    nombre_distrito: str
    cuenca: str
    regimen: str = "EL_NINO"
    modelo_numerico: str = "Open-Meteo Pro ECMWF IFS 9km"
    precipitation_24h: float = Field(..., description="Precipitación acumulada en 24h (mm)")
    cape_convectivo_j_kg: float = Field(1620.0, description="Energía Potencial Convectiva Disponible (J/kg)")
    soil_moisture: float = Field(..., description="Humedad crítica de suelo profundo 28-100cm (%)")
    suelo_4_capas: Optional[SoilLayersProfile] = None
    river_flow: float = Field(..., description="Caudal de río GloFAS (m³/s)")
    min_temp: float = 14.0
    snowfall: float = 0.0

class NationalValidationContext(BaseModel):
    enfen_status: str = "ALERTA_NINO_COSTERO"
    enfen_factor_sensibilidad: float = 1.35
    dhn_boya_id: str = "BOYA-DHN-PAITA-01"
    dhn_anomalia_tsm_c: float = 2.6
    dhn_onda_kelvin_activa: bool = True
    senamhi_ema_codigo: str = "EMA-CHOSICA-472"
    senamhi_lluvia_real_24h_mm: float = 41.2
    senamhi_validada: bool = True
    bias_correction_aplicado: bool = True

class TriageResult(BaseModel):
    ubigeo: str
    distrito: str
    cuenca: str
    nivel_alerta: str = Field(..., description="VERDE, AMARILLO o ROJO")
    is_critical: bool = Field(..., description="True si supera umbrales críticos para activar Agente Táctico")
    criterio_disparo: str = Field(..., description="Explicación del umbral superado")
    telemetria: HydroTelemetry
    validacion_nacional: NationalValidationContext

class CriticalResource(BaseModel):
    tipo: str
    cantidad: int
    estado: str = "DISPONIBLE"

class TacticalAssessment(BaseModel):
    ubigeo: str
    distrito: str
    cuenca: str
    poblacion_expuesta_estimada: int
    familias_en_faja_marginal: int
    vias_comprometidas: List[str]
    centros_salud_en_riesgo: List[str]
    maquinaria_recomendada: List[CriticalResource]
    albergues_recomendados: List[str]
    accion_operativa_inmediata: str
    boletin_tecnico_oficial: str

class LinguisticMessages(BaseModel):
    ubigeo: str
    distrito: str
    variante_linguistica: str = "QUECHUA_CHANKA"
    mensaje_tecnico_coer: str
    mensaje_comunitario_castellano: str
    mensaje_comunitario_lengua_originaria: Optional[str] = None
    lengua_nombre: str = "Runasimi (Quechua)"
    es_bilingue: bool = True

class CAPAlertInfo(BaseModel):
    language: str
    category: str = "Met"
    event: str
    urgency: str = "Immediate"
    severity: str = "Extreme"
    certainty: str = "Observed"
    headline: str
    description: str
    instruction: str
    parameter: List[Dict[str, str]] = []
    area: Dict[str, Any]

class CAPAlertPayload(BaseModel):
    identifier: str
    sender: str = "sat-coen@indeci.gob.pe"
    sent: str
    status: str = "Actual"
    msgType: str = "Alert"
    scope: str = "Public"
    code: List[str]
    info: List[CAPAlertInfo]

class ChannelDispatchStatus(BaseModel):
    canal: str
    destinatario: str
    estado: str
    detalle: Optional[str] = None

class DispatchAudit(BaseModel):
    incident_id: str
    timestamp_utc: str
    ubigeo: str
    distrito: str
    nivel_alerta: str
    canales: List[ChannelDispatchStatus]
    latencia_ms: float
    auditoria_registrada: bool
    cap_v12_payload: Optional[CAPAlertPayload] = None

class QuebradaAlerta(BaseModel):
    nombre: str
    cuenca: str
    umbral_critico_mm_h: float
    lluvia_actual_estimada_mm_h: float
    umbral_superado: bool
    tiempo_concentracion_horas: float
    poblacion_cono_deyeccion: int
    puntos_estrangulamiento: Optional[str] = None
    obras_existentes: Optional[str] = None

class HistoricalAnalogueResult(BaseModel):
    ubigeo: str
    distrito: str
    evento_analogo_nombre: str
    similitud_porcentaje: float
    comparativa_tsm_anomalia: str
    patron_climatologico: str
    leccion_historica_clave: str
    distrito_declarado_ds124: bool
    nivel_peligro_cenepred: str
    sustento_juridico_pcm: str
    quebradas_analizadas: List[QuebradaAlerta]
    recomendacion_doctrinal: str

class AgentExecutionTrace(BaseModel):
    agente: str
    estado: str = "COMPLETADO"
    tiempo_ms: float
    resumen: str

class MultiAgentPipelineResponse(BaseModel):
    incident_id: str
    timestamp: str
    ubigeo: str
    distrito: str
    activacion_critica: bool
    trazabilidad_agentes: List[AgentExecutionTrace]
    triaje: TriageResult
    evaluacion_tactica: Optional[TacticalAssessment] = None
    analogo_historico: Optional[HistoricalAnalogueResult] = None
    mensajes_linguisticos: Optional[LinguisticMessages] = None
    despacho_auditoria: Optional[DispatchAudit] = None
