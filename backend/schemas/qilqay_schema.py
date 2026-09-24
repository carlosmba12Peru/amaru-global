# backend/schemas/qilqay_schema.py
"""
Esquemas Canónicos Pydantic para el Agente QILQAY (Escribano Mayor y Redactor de Fe Pública del Estado)
Cubre las 6 facultades temáticas de la administración pública peruana en emergencia:
1. Jurídico-Edil (Resoluciones de Alcaldía, Ordenanzas, Acuerdos de Concejo)
2. Táctico-SINAGERD (Planes de Contingencia R.J. 188, Fichas EDAN, Boletines COEN, Oficios de Requerimiento)
3. Fiscal-Contrataciones (Dossiers de Emergencia Art. 27 Ley 30225, Descargos OCI/CGR, PP 0068)
4. Social-Humanitario (Padrón Bono BAE Ley 31526, Seguro Agrícola Catastrófico SAC, Ollas Comunes Ley 31458)
5. Técnico-Ingenieril (Expedientes IOARR FONDES Ley 30458, Cómputos Métricos BOQ, Fichas Pre-Impacto)
6. Fe Pública y Peritaje (Folios Forenses ReNITLI Ley 29735, Actas ISO 27037 / RFC 3161, Dictámenes Art. 377 CP)
"""

from enum import Enum
from typing import Dict, List, Optional, Any
from pydantic import BaseModel, Field


class QilqayFacultadTematica(str, Enum):
    JURIDICO_EDIL = "JURIDICO_EDIL"
    TACTICO_SINAGERD = "TACTICO_SINAGERD"
    FISCAL_CONTRATACIONES = "FISCAL_CONTRATACIONES"
    SOCIAL_HUMANITARIO = "SOCIAL_HUMANITARIO"
    TECNICO_INGENIERIL = "TECNICO_INGENIERIL"
    FE_PUBLICA_PERITAJE = "FE_PUBLICA_PERITAJE"


class QilqayTipoDocumento(str, Enum):
    # Facultad 1: Jurídico-Edil
    RESOLUCION_ALCALDIA = "RESOLUCION_ALCALDIA"
    ORDENANZA_MUNICIPAL = "ORDENANZA_MUNICIPAL"
    ACUERDO_CONCEJO = "ACUERDO_CONCEJO"
    
    # Facultad 2: Táctico-SINAGERD
    PLAN_CONTINGENCIA = "PLAN_CONTINGENCIA"
    FICHA_TECNICA_EDAN = "FICHA_TECNICA_EDAN"
    BOLETIN_SITUACIONAL_COEN = "BOLETIN_SITUACIONAL_COEN"
    OFICIO_REQUERIMIENTO_MAQUINARIA = "OFICIO_REQUERIMIENTO_MAQUINARIA"
    
    # Facultad 3: Fiscal y Contrataciones
    INFORME_SUSTENTO_CONTRATACION_DIRECTA = "INFORME_SUSTENTO_CONTRATACION_DIRECTA"
    DESCARGO_PREVENTIVO_OCI_CGR = "DESCARGO_PREVENTIVO_OCI_CGR"
    INFORME_DESBLOQUEO_PP0068 = "INFORME_DESBLOQUEO_PP0068"
    
    # Facultad 4: Social-Humanitario
    PADRON_DAMNIFICADOS_BONO_BAE = "PADRON_DAMNIFICADOS_BONO_BAE"
    EXPEDIENTE_PERDIDAS_AGRO_SAC = "EXPEDIENTE_PERDIDAS_AGRO_SAC"
    CEDULA_MONITOREO_OLLAS_COMUNES = "CEDULA_MONITOREO_OLLAS_COMUNES"
    
    # Facultad 5: Técnico-Ingenieril
    FICHA_TECNICA_IOARR_FONDES = "FICHA_TECNICA_IOARR_FONDES"
    COMPUTO_METRADOS_BOQ_DESCOLMATACION = "COMPUTO_METRADOS_BOQ_DESCOLMATACION"
    FICHA_INGENIERIA_PRE_IMPACTO = "FICHA_INGENIERIA_PRE_IMPACTO"
    
    # Facultad 6: Fe Pública y Peritaje
    FOLIO_PERICIAL_FORENSE_RENITLI = "FOLIO_PERICIAL_FORENSE_RENITLI"
    ACTA_CADENA_CUSTODIA_DIGITAL = "ACTA_CADENA_CUSTODIA_DIGITAL"
    DICTAMEN_PREVENTIVO_ART377_CP = "DICTAMEN_PREVENTIVO_ART377_CP"


class QilqayDraftRequest(BaseModel):
    ubigeo: str = Field(..., description="Código UBIGEO de 6 dígitos del distrito o provincia")
    facultad_tematica: QilqayFacultadTematica = Field(..., description="Eje temático de especialidad de redacción")
    tipo_documento: QilqayTipoDocumento = Field(..., description="Tipo específico de documento a redactar")
    destinatario: Optional[str] = Field(None, description="Destinatario del documento (ej. Gobernador Regional de Piura, Contralor General)")
    asunto: Optional[str] = Field(None, description="Asunto o sumilla específica del documento")
    instrucciones_adicionales: Optional[str] = Field(None, description="Instrucciones o requerimientos específicos del usuario para adaptar el texto")
    firmante_nombre: Optional[str] = Field(None, description="Nombre de la autoridad firmante (omite para usar el del Directorio INEI)")
    firmante_cargo: Optional[str] = Field(None, description="Cargo de la autoridad firmante (omite para usar el del Directorio INEI)")


class QilqaySeccionDocumento(BaseModel):
    subtitulo: str
    contenido: str


class QilqayDocumentoEmitido(BaseModel):
    documento_id: str = Field(..., description="ID único inmutable del documento (DOC-QILQAY-...)")
    correlativo_oficial: str = Field(..., description="Numeración oficial institucional")
    ubigeo: str
    distrito: str
    provincia: str
    departamento: str
    facultad_tematica: str
    tipo_documento: str
    titulo: str
    sumilla: str
    destinatario: str
    base_legal: List[str]
    visto: Optional[str] = None
    considerandos: List[str] = Field(default_factory=list)
    articulado_o_cuerpo: List[QilqaySeccionDocumento] = Field(default_factory=list)
    conclusiones_o_resuelve: List[str] = Field(default_factory=list)
    firmante_nombre: str
    firmante_cargo: str
    firmante_entidad: str
    texto_completo_markdown: str
    hash_sha256: str
    fecha_emision_pe: str
    hora_emision_pe: str
    qr_verification_url: str
    pdf_disponible: bool = True
    metricas_datos_duros: Dict[str, Any] = Field(default_factory=dict)


class QilqayFacultadInfo(BaseModel):
    codigo: str
    nombre: str
    descripcion: str
    icono: str
    tipos_documentos: List[Dict[str, str]]


class QilqayCatalogResponse(BaseModel):
    total_facultades: int
    facultades: List[QilqayFacultadInfo]
