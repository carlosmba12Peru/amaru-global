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
    quebradas_analizadas: List[QuebradaAlerta] = []
    recomendacion_doctrinal: str
    # Vertiente 1: Impacto Climático e Hidrológico
    lead_time_horas: int = 72
    factor_amplificacion_fen: float = 1.0
    impacto_climatico_analogo: Dict[str, Any] = Field(default_factory=dict, description="Firma análoga, factor multiplicador FEN y lead time")
    # Vertiente 2: Memoria de Gestión Pública, Infraestructura y Fiscal (MEF/CGR)
    memoria_infraestructura_fallas: List[Dict[str, Any]] = Field(default_factory=list, description="Puentes y diques CAF colapsados en 1983/1998/2017")
    cruce_fiscal_obras: List[Dict[str, Any]] = Field(default_factory=list, description="Obras MEF PP 0068 en puntos críticos históricos y advertencia Art. 377 CP")
    # Vertiente 3: Memoria Social, Aislamiento y Sabiduría Ancestral (Yachay)
    memoria_social_albergues: Dict[str, Any] = Field(default_factory=dict, description="Caseríos aislados y advertencia de locales escolares inundables")
    bioindicadores_ancestrales: List[Dict[str, Any]] = Field(default_factory=list, description="Validación de bioindicadores milenarios Yachay")

class AgentExecutionTrace(BaseModel):
    agente: str
    estado: str = "COMPLETADO"
    tiempo_ms: float
    resumen: str

class ReNITLIForensicTicket(BaseModel):
    """
    Ticket Pericial Forense ReNITLI (Registro Nacional de Intérpretes y Traductores
    en Lenguas Indígenas u Originarias - Ministerio de Cultura del Perú).
    Conforme a Ley N.º 29735, D.S. N.º 004-2016-MC y Art. 220 del Código Procesal Penal.
    Garantiza trazabilidad, inmutabilidad y fe pública para traducciones de emergencia.
    """
    folio_pericial: str
    lengua_originaria: str
    variante_linguistica: str
    texto_fuente_castellano: str
    texto_traducido_originaria: str
    hash_sha256_castellano: str
    hash_sha256_traduccion: str
    estado_convalidacion: str = "ENVIADO_BANDEJA_RENITLI_MINCUL"
    perito_colegiado_asignado: str
    sello_tiempo_utc: str
    validez_juicio_oral: bool = True
    normativa_aplicable: str = "Ley N.º 29735 / Art. 220 CPP / D.S. 115-2025-PCM"

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
    peritaje_renitli: Optional[ReNITLIForensicTicket] = None
    despacho_auditoria: Optional[DispatchAudit] = None


# ==============================================================================
# Esquemas para Nuevos Agentes Soberanos en Castellano
# ==============================================================================

# 1. Agente FISCALIZADOR (Presupuesto MEF & Contrataciones SEACE)
class FiscalReportePresupuestal(BaseModel):
    ubigeo: str
    distrito: str
    provincia: str
    departamento: str
    pim_pp0068_pen: float
    devengado_pp0068_pen: float
    saldo_disponible_pp0068_pen: float
    porcentaje_ejecucion_pp0068: float
    saldo_fondes_pen: float
    requiere_credito_suplementario: bool
    monto_sugerido_modificacion_pen: float
    fuente_financiamiento_recomendada: str
    fecha_consulta_mef: str
    hash_sha256_consulta: str


class RazonabilidadPrecioRequest(BaseModel):
    tipo_maquinaria: str
    precio_hora_ofertado_pen: float
    departamento: str = "Piura"


class RazonabilidadPrecioResponse(BaseModel):
    tipo_maquinaria: str
    precio_hora_ofertado_pen: float
    precio_referencial_seace_pen: float
    limite_superior_tolerable_pen: float
    es_razonable: bool
    porcentaje_desviacion: float
    dictamen_anticorrupcion: str
    base_legal: str = "Art. 27 Ley N.º 30225 y Directiva OSCE N.º 005-2020"


class DictamenFiscalEmergencia(BaseModel):
    folio_fiscal: str
    ubigeo: str
    distrito: str
    monto_total_comprometido_pen: float
    disponibilidad_presupuestal_certificada: bool
    cumple_razonabilidad_precios: bool
    resumen_dictamen: str
    hash_sha256: str
    fecha_emision: str


# 2. Agente COMUNITARIO (Crowdsourcing Territorial & Anti-Bulos)
class CitizenReportInput(BaseModel):
    ubigeo: str
    distrito: str
    latitud: float
    longitud: float
    tipo_incidente: str
    descripcion: str
    canal_origen: str = "WHATSAPP_COMUNITARIO"
    tiene_multimedia: bool = True
    url_multimedia: Optional[str] = None
    timestamp_reporte: Optional[str] = None


class ComunitarioReporteVerificado(BaseModel):
    reporte_id: str
    ubigeo: str
    distrito: str
    es_autentico: bool
    score_confianza_antibullying: float
    clasificacion_anti_hoax: str
    motivo_clasificacion: str
    radar_coincidencia_lluvia: bool
    prioridad_atencion: str
    requiere_inspeccion_campo: bool
    hash_sha256_evidencia: str
    fecha_procesamiento: str


class OllaComunMonitoreo(BaseModel):
    olla_comun_id: str
    nombre: str
    ubigeo: str
    distrito: str
    sector: str
    beneficiarios_atendidos: int
    estado_acceso: str
    requerimiento_alimentos_kg: float
    requerimiento_agua_litros: float
    prioridad_abastecimiento: str


# 3. Agente SATELITAL (Radar SAR Sentinel-1 & Daños)
class SatelitalEvaluacionSAR(BaseModel):
    evaluacion_id: str
    ubigeo: str
    distrito: str
    sensor_satelital: str = "Copernicus Sentinel-1 SAR (Banda C - 5.405 GHz)"
    cobertura_nubosa_porcentaje: float = 98.5
    capacidad_penetracion_nubes: bool = True
    modo_adquisicion: str = "Interferometric Wide Swath (IW)"
    polarizaciones: List[str] = Field(default_factory=lambda: ["VV", "VH"])
    umbral_retrodispersion_db: float = -14.2
    superficie_inundada_hectareas: float
    hectareas_agricolas_afectadas: float
    hectareas_urbanas_afectadas: float
    principales_cultivos_comprometidos: List[str] = Field(default_factory=list)
    puentes_o_vias_anegadas: List[str] = Field(default_factory=list)
    indice_severidad_inundacion: str
    poligono_geojson_resumen: Dict[str, Any] = Field(default_factory=dict)
    hash_sha256_raster: str
    fecha_pasada_satelital: str


class SeguroAgricolaSACResponse(BaseModel):
    expediente_sac_id: str
    ubigeo: str
    distrito: str
    departamento: str
    hectareas_elegibles_sac: float
    cultivo_predominante: str
    monto_indemnizacion_estimado_pen: float
    aseguradora_operadora: str = "La Positiva Seguros / MIDAGRI SAC"
    estado_activacion: str = "EXPEDIENTE_PARAMETRICO_APROBADO"
    hash_sha256: str

