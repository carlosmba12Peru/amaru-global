# backend/schemas/contingency_plan_schema.py
"""
Esquemas Pydantic para el Plan de Contingencia Digital y PPRRD (AMARU-PLAN 2026-2027)
Marco Normativo:
- Ley N.° 29664 (Ley del SINAGERD) y D.S. N.° 048-2011-PCM.
- R.J. N.° 188-2015-INDECI (Guía Técnica para la Formulación del Plan de Contingencia).
- R.J. N.° 058-2019-CENEPRED/J (Guía Metodológica para Elaborar el PPRRD).
- D.S. N.° 124-2026-PCM (Declaratoria de Estado de Emergencia por Peligro Inminente ante FEN).
"""
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field


class ParametrosPeligroFen(BaseModel):
    tipo_peligro: str = "INUNDACIONES_Y_MOVIMIENTOS_EN_MASA_FEN"
    lluvia_gatillo_24h_mm: float = Field(..., description="Umbral de lluvia crítica en 24h para activación")
    caudal_critico_desborde_m3s: float = Field(..., description="Caudal de desborde en el tramo distrital")
    tiempo_concentracion_horas: float = Field(..., description="Tiempo de retardo hidrológico de la cuenca")
    nivel_saturacion_suelo_pct: float = Field(..., description="Porcentaje de humedad edáfica crítica")
    evento_analogo_referencia: str = Field(..., description="Mega-evento histórico con firma similar (1983, 1998, 2017, 2023)")
    factor_amplificacion_fen: float = Field(..., description="Multiplicador de corrección local FEN")


class PoblacionInfraestructuraExpuesta(BaseModel):
    poblacion_total_distrital: int
    poblacion_expuesta_faja_marginal: int
    familias_alto_riesgo_no_mitigable: int
    viviendas_material_precario: int
    centros_poblados_sectores_criticos: List[str]
    vias_vecinales_vulnerables: List[str]
    puentes_en_riesgo_socavacion: List[Dict[str, Any]]
    centros_salud_zona_inundable: List[str]
    locales_escolares_vulnerables: List[str]


class EscenarioRiesgoOperativo(BaseModel):
    ubigeo: str
    distrito: str
    provincia: str
    departamento: str
    cuenca_rio: str
    declarado_emergencia_ds124: bool
    nivel_peligro_cenepred: str
    parametros_peligro: ParametrosPeligroFen
    exposicion: PoblacionInfraestructuraExpuesta
    estimacion_danos_probables: Dict[str, Any]


class MiembroComiteGTGRD(BaseModel):
    cargo_comite: str
    titular_nombre: str
    cargo_institucional: str
    telefono_contacto: str
    correo_institucional: str


class OrganizacionMandoGTGRD(BaseModel):
    presidente_gt_grd: str  # Alcalde
    secretario_tecnico: str  # Gerente de Defensa Civil / GRD
    integrantes: List[MiembroComiteGTGRD]
    plataforma_defensa_civil_actores: List[str]
    coel_ubicacion_puesto_comando: str
    frecuencias_radiales_hf_vhf: str
    enlace_coer_regional: str


class AlbergueTemporalValidado(BaseModel):
    codigo_modular: Optional[str] = None
    nombre: str
    tipo_instalacion: str  # I.E., Complejo Deportivo, Coliseo
    capacidad_personas: int
    cota_segura_inundacion: bool
    servicio_agua_letrinas: bool
    vetado_por_antecedente_historico: bool
    observacion: str


class CalculoBienesAyudaHumanitaria(BaseModel):
    carpas_familiares_unidades: int
    frazadas_termicas_unidades: int
    camas_plegables_unidades: int
    bidones_agua_131l_unidades: int
    raciones_frias_72h_unidades: int
    bobinas_plastico_pesado_unidades: int
    herramientas_palas_picos_unidades: int
    stock_disponible_almacen_local: str
    deficit_requerido_indeci_nivel2: str


class ProcedimientosRespuesta(BaseModel):
    protocolo_alerta_temprana: Dict[str, Any]
    rutas_evacuacion_zonas_seguras: List[Dict[str, Any]]
    albergues_temporales: List[AlbergueTemporalValidado]
    bienes_ayuda_humanitaria: CalculoBienesAyudaHumanitaria
    maquinaria_pesada_primera_respuesta: List[Dict[str, Any]]
    brigadas_comunitarias_ayni: List[str]


class ContinuidadOperativa(BaseModel):
    abastecimiento_provisorio_agua: str
    puntos_distribucion_camion_cisterna: List[str]
    atencion_medica_avanzada_triage: str
    transitabilidad_rutas_alternas: str
    puntos_criticos_enlace_telecom: str


class ProyectoInversionPPRRD(BaseModel):
    cui: str
    proyecto: str
    monto_pim_soles: float
    monto_devengado_soles: float
    avance_porcentaje: float
    cuello_botella_siaf: str
    semaforo_inaccion: str
    alerta_omision_art377_cp: bool
    accion_preventiva_urgente: str


class MatrizInversionPPRRD(BaseModel):
    programa_presupuestal: str = "0068: REDUCCION DE VULNERABILIDAD Y ATENCION DE EMERGENCIAS POR DESASTRES"
    total_proyectos_cui: int
    monto_total_pim_soles: float
    monto_total_devengado_soles: float
    avance_financiero_global_pct: float
    obras_prioritarias_defensas: List[ProyectoInversionPPRRD]
    medidas_no_estructurales_ordenamiento: List[str]


class ProyectoResolucionAlcaldia(BaseModel):
    numero_resolucion: str
    titulo: str
    fecha_emision: str
    vistos: List[str]
    considerandos: List[str]
    articulos_resolutivos: List[str]
    firmante_alcalde: str
    distrito: str


class PlanContingenciaDigitalCompleto(BaseModel):
    id_expediente: str
    fecha_generacion_utc: str
    ubigeo: str
    distrito: str
    provincia: str
    departamento: str
    periodo_vigencia: str = "2026-2027"
    declarado_ds_124_pcm: bool
    hash_sha256: str
    marco_normativo_aplicable: List[str]
    
    # Capítulos Oficiales R.J. 188-2015-INDECI y R.J. 058-2019-CENEPRED
    capitulo1_escenario_riesgo: EscenarioRiesgoOperativo
    capitulo2_organizacion_mando: OrganizacionMandoGTGRD
    capitulo3_procedimientos_respuesta: ProcedimientosRespuesta
    capitulo4_continuidad_operativa: ContinuidadOperativa
    capitulo5_inversion_pprrd_mef: MatrizInversionPPRRD
    anexo_legal_resolucion_alcaldia: ProyectoResolucionAlcaldia
