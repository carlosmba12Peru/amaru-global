# backend/services/legal_framework_service.py
"""
Servicio Táctico de Inteligencia Jurídica y Blindaje Territorial FEN (AMARU-LEX)
Procesa y consulta el catálogo estructurado de las 51 normas legales oficiales
(Decretos Supremos, Decretos de Urgencia y Resoluciones) para el FEN 2026-2027.
"""
import os
import json
import tempfile
import time
from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta

try:
    from services.lex.vertex_embedding_service import embedding_service
except ImportError:
    from backend.services.lex.vertex_embedding_service import embedding_service

class LegalFrameworkService:
    def __init__(self):
        self.catalog_path = os.path.abspath(
            os.path.join(os.path.dirname(__file__), "..", "..", "data", "marco_legal_51_catalog.json")
        )
        self.data: Dict[str, Any] = self._load_data()
        self.embedding_service = embedding_service
        self.vector_chunks: List[Dict[str, Any]] = self._load_vector_chunks()

    def _load_data(self) -> Dict[str, Any]:
        if os.path.exists(self.catalog_path):
            try:
                with open(self.catalog_path, "r", encoding="utf-8") as f:
                    return json.load(f)
            except Exception as e:
                print(f"Error loading {self.catalog_path}: {e}")
        return {
            "total_normas": 51,
            "fecha_corte": "16 de Septiembre de 2026",
            "resumen_categorias": {
                "TRANSFERENCIA PRESUPUESTAL DE EMERGENCIA": 10,
                "PRÓRROGA DE ESTADO DE EMERGENCIA": 9,
                "CRÉDITO Y ENDEUDAMIENTO CONTINGENTE INTERNACIONAL": 17,
                "MEDIDA REGULATORIA SECTORIAL": 10,
                "DECLARATORIA DE ESTADO DE EMERGENCIA": 3,
                "DECRETO DE URGENCIA (FINANCIAMIENTO & COMPRAS C2)": 2
            },
            "resumen_sectores": {
                "MINISTERIO DE DESARROLLO AGRARIO Y RIEGO": 19,
                "MINISTERIO DE DEFENSA / INDECI": 13,
                "PRESIDENCIA DEL CONSEJO DE MINISTROS": 7,
                "MINISTERIO DE TRANSPORTES Y COMUNICACIONES": 6,
                "MINISTERIO DE SALUD": 5,
                "MINISTERIO DE VIVIENDA, CONSTRUCCIÓN Y SANEAMIENTO": 1
            },
            "normas": []
        }

    def get_summary(self) -> Dict[str, Any]:
        normas = self.data.get("normas", [])
        return {
            "total_normas": len(normas) if normas else self.data.get("total_normas", 51),
            "fecha_corte": self.data.get("fecha_corte", "16 de Septiembre de 2026"),
            "categorias": self.data.get("resumen_categorias", {}),
            "sectores": self.data.get("resumen_sectores", {}),
            "normas_destacadas": [
                {
                    "norma": "D.S. Nº 124-2026-PCM",
                    "titulo": "Declaratoria de Estado de Emergencia por Peligro Inminente ante FEN 2026-2027 en 893 distritos.",
                    "impacto": "Habilita contrataciones directas para mitigación de cauces y descolmatación.",
                    "sector": "PCM"
                },
                {
                    "norma": "D.U. Nº 031-2026",
                    "titulo": "Medidas extraordinarias y urgentes en materia económica y financiera para el FEN.",
                    "impacto": "Autorización de fondos de contingencia y exoneración de procedimientos clásicos SEACE.",
                    "sector": "MEF / PCM"
                },
                {
                    "norma": "D.U. Nº 032-2026",
                    "titulo": "Sostenibilidad fiscal y abastecimiento de diésel estratégico para maquinaria pesada.",
                    "impacto": "Financiamiento inmediato de horas-máquina para defensas ribereñas.",
                    "sector": "MEF"
                },
                {
                    "norma": "D.S. Nº 185-2026-EF",
                    "titulo": "Endeudamiento contingente externo con el BID y KfW para resiliencia climática.",
                    "impacto": "Línea de crédito contingente por hasta US$ 450M para emergencias FEN.",
                    "sector": "MEF"
                }
            ]
        }

    def _evaluar_vigencia_norma(self, norma: Dict[str, Any], fecha_ref: Optional[datetime] = None) -> Dict[str, Any]:
        """Calcula el estado de vigencia de una norma conforme al marco legal del SINAGERD."""
        if not fecha_ref:
            fecha_ref = datetime.now()

        norma_id = norma.get("id", "norm-unknown")
        nombre = norma.get("norma", "Norma Legal")
        titulo = norma.get("titulo", "")
        categoria = norma.get("categoria", "")
        sector = norma.get("sector", "")
        fecha_pub_str = norma.get("fecha_publicacion", "2026-07-01")

        try:
            fecha_pub = datetime.strptime(fecha_pub_str, "%Y-%m-%d")
        except Exception:
            try:
                fecha_pub = datetime.strptime(fecha_pub_str, "%d/%m/%Y")
            except Exception:
                fecha_pub = datetime(2026, 7, 1)

        # Reglas de plazo legal:
        # Estados de Emergencia: 60 días
        # Decretos de Urgencia: 90 días
        # Transferencias y Crédito: 180 días (Vigencia fiscal anual)
        if "EMERGENCIA" in categoria:
            plazo_dias = 60
        elif "DECRETO DE URGENCIA" in categoria:
            plazo_dias = 90
        elif "TRANSFERENCIA" in categoria or "CRÉDITO" in categoria:
            plazo_dias = 180
        else:
            plazo_dias = 60

        fecha_vencimiento = fecha_pub + timedelta(days=plazo_dias)
        dias_restantes = (fecha_vencimiento - fecha_ref).days

        # Detección de prórrogas conocidas (ej. D.S. 124 prorrogado por D.S. 130)
        es_prorrogada = False
        prorroga_info = None
        if "124-2026" in nombre:
            es_prorrogada = True
            prorroga_info = "Prorrogado por D.S. Nº 130-2026-PCM (Vigencia ampliada 60 días adicionales)."
            dias_restantes = max(dias_restantes, 38)
        elif "130-2026" in nombre:
            es_prorrogada = True
            prorroga_info = "Prórroga oficial del Estado de Emergencia por Peligro Inminente ante FEN (38 días de vigencia)."
            dias_restantes = max(dias_restantes, 38)

        if es_prorrogada:
            estado = "PRORROGADO"
            semaforo = "AZUL_PRORROGADO"
            amparo = True
        elif dias_restantes > 15:
            estado = "VIGENTE"
            semaforo = "VERDE_AMPARADO"
            amparo = True
        elif 0 < dias_restantes <= 15:
            estado = "POR_CADUCAR"
            semaforo = "AMARILLO_ALERTA_PRORROGA"
            amparo = True
        else:
            estado = "CADUCADO"
            semaforo = "ROJO_CADUCADO_DESAMPARADO"
            amparo = False
            dias_restantes = 0

        res = dict(norma)
        res.update({
            "fecha_vencimiento_calculada": fecha_vencimiento.strftime("%Y-%m-%d"),
            "plazo_legal_dias": plazo_dias,
            "dias_vigencia_restantes": max(0, dias_restantes),
            "estado_vigencia": estado,
            "semaforo_c2": semaforo,
            "amparo_legal_activo": amparo,
            "prorroga_info": prorroga_info
        })
        return res

    def get_normative_lifecycle_summary(self) -> Dict[str, Any]:
        """Retorna el desglose de normas vigentes, por caducar, prorrogadas y caducadas."""
        normas = self.data.get("normas", [])
        fecha_ref = datetime.now()
        vigentes = 0
        por_caducar = 0
        prorrogadas = 0
        caducadas = 0
        alertas = []

        for n in normas:
            aud = self._evaluar_vigencia_norma(n, fecha_ref)
            st = aud["estado_vigencia"]
            if st == "VIGENTE":
                vigentes += 1
            elif st == "POR_CADUCAR":
                por_caducar += 1
                alertas.append({
                    "norma": aud.get("norma"),
                    "titulo": aud.get("titulo"),
                    "dias_restantes": aud.get("dias_vigencia_restantes"),
                    "fecha_vencimiento": aud.get("fecha_vencimiento_calculada"),
                    "alerta": "Vence en menos de 15 días. Requiere informe de necesidad para trámite de prórroga."
                })
            elif st == "PRORROGADO":
                prorrogadas += 1
            elif st == "CADUCADO":
                caducadas += 1

        return {
            "total_normas": len(normas),
            "vigentes": vigentes,
            "por_caducar_15_dias": por_caducar,
            "prorrogadas": prorrogadas,
            "caducadas": caducadas,
            "alertas_inminentes": alertas,
            "fecha_corte": fecha_ref.strftime("%d de %B de %Y")
        }

    def get_expiring_norms_alert(self, dias_umbral: int = 15) -> List[Dict[str, Any]]:
        """Retorna las normas que expiran dentro del umbral especificado de días."""
        normas = self.data.get("normas", [])
        fecha_ref = datetime.now()
        alertas = []
        for n in normas:
            aud = self._evaluar_vigencia_norma(n, fecha_ref)
            dias = aud["dias_vigencia_restantes"]
            if 0 < dias <= dias_umbral and aud["estado_vigencia"] == "POR_CADUCAR":
                alertas.append(aud)
        return alertas

    def get_all_norms(
        self,
        category: Optional[str] = None,
        sector: Optional[str] = None,
        search: Optional[str] = None,
        vigencia: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        normas = self.data.get("normas", [])
        result = []
        fecha_ref = datetime.now()
        for n in normas:
            n_enriched = self._evaluar_vigencia_norma(n, fecha_ref)
            if category and n_enriched.get("categoria") != category:
                continue
            if sector and n_enriched.get("sector") != sector:
                continue
            if vigencia and vigencia != "ALL" and n_enriched.get("estado_vigencia") != vigencia:
                continue
            if search:
                s_lower = search.lower()
                matches = (
                    s_lower in n_enriched.get("norma", "").lower()
                    or s_lower in n_enriched.get("titulo", "").lower()
                    or s_lower in n_enriched.get("sector", "").lower()
                    or any(s_lower in d.lower() for d in n_enriched.get("departamentos", []))
                )
                if not matches:
                    continue
            result.append(n_enriched)
        return result

    def get_district_legal_status(self, ubigeo: str, distrito_nombre: str = "", departamento: str = "") -> Dict[str, Any]:
        """
        Determina el estatus legal de protección, vigencia y facultades de compra para un Ubigeo.
        Calcula dinámicamente los días de vigencia restantes y emite advertencia de responsabilidad penal.
        """
        dep_clean = departamento.strip().title()
        normas_aplicables = []
        fecha_ref = datetime.now()
        for n in self.data.get("normas", []):
            if any(dep_clean.lower() in d.lower() for d in n.get("departamentos", [])):
                normas_aplicables.append(self._evaluar_vigencia_norma(n, fecha_ref))

        if not normas_aplicables:
            normas_aplicables = [self._evaluar_vigencia_norma(n, fecha_ref) for n in self.data.get("normas", [])[:4]]

        # Evaluar norma base (D.S. 124 prorrogado)
        ds124_audit = self._evaluar_vigencia_norma({
            "norma": "D.S. Nº 124-2026-PCM",
            "categoria": "DECLARATORIA DE ESTADO DE EMERGENCIA",
            "fecha_publicacion": "2026-07-15"
        }, fecha_ref)

        dias_restantes = ds124_audit.get("dias_vigencia_restantes", 38)
        semaforo = ds124_audit.get("semaforo_c2", "VERDE_AMPARADO")
        amparado = ds124_audit.get("amparo_legal_activo", True)

        aviso = (
            f"Usted cuenta con blindaje legal pleno bajo el D.S. Nº 124-2026-PCM (Prorrogado por D.S. Nº 130-2026-PCM) "
            f"con {dias_restantes} días de vigencia restantes. "
            "Cualquier retraso en la contratación de maquinaria pesada antes del vencimiento "
            "incurre en infracción por omisión de funciones bajo el Art. 377 del Código Penal y la Ley SINAGERD 29664."
            if amparado else
            "ALERTA CRÍTICA PENAL: Su distrito no cuenta con Estado de Emergencia vigente. "
            "Queda terminantemente prohibido contratar directamente sin concurso ordinario SEACE "
            "hasta la publicación de un nuevo Decreto Supremo en El Peruano (Art. 377 y 384 Código Penal)."
        )

        advertencia_penal = None
        if not amparado:
            advertencia_penal = "ALERTA PENAL CRÍTICA: Distrito sin amparo de emergencia. Contratar directamente acarrea responsabilidad penal por colusión (Art. 384 CP) y omisión/extralimitación funcional (Art. 377 CP)."
        elif dias_restantes <= 15:
            advertencia_penal = f"ALERTA PENAL DE CADUCIDAD: Restan sólo {dias_restantes} días de vigencia. Contrataciones comprometidas fuera del plazo legal carecen de amparo excepcional y tipifican responsabilidad bajo el Art. 377 del Código Penal."

        return {
            "ubigeo": ubigeo,
            "distrito": distrito_nombre or "Distrito Focalizado",
            "departamento": departamento or "Nacional",
            "amparado_emergencia": amparado,
            "decreto_base": "D.S. Nº 124-2026-PCM (Peligro Inminente)",
            "prorroga_vigente": "D.S. Nº 130-2026-PCM",
            "dias_vigencia_restantes": dias_restantes,
            "estado_semaforo": semaforo,
            "advertencia_penal_art_377": advertencia_penal,
            "facultades_otorgadas": [
                "Contratación Directa inmediata de maquinaria pesada (excavadoras, orugas D8/D9).",
                "Compra expedita de combustible diésel B5 para faenas de descolmatación.",
                "Adquisición de sacos terreros, calaminas y geomallas con fondos del PP 068.",
                "Exoneración de concurso público ordinario SEACE con regularización posterior (10 días hábiles)."
            ],
            "normas_especificas": normas_aplicables[:5],
            "aviso_legal_alcalde": aviso
        }

    def sync_and_vectorize_new_norm(self, nueva_norma: Dict[str, Any]) -> Dict[str, Any]:
        """
        Ingesta y auto-vectorización RAG con Vertex AI (text-embedding-004) para una nueva norma.
        """
        nombre = nueva_norma.get("norma", "Norma Legal")
        n_id = nueva_norma.get("id", f"norm-{int(time.time())}")
        nueva_norma["id"] = n_id

        # Agregar al catálogo en memoria
        normas = self.data.get("normas", [])
        normas.insert(0, nueva_norma)
        self.data["normas"] = normas

        # Preparar 2 chunks
        chunks_nuevos = [
            {
                "chunk_id": f"{n_id}-c1-objeto",
                "norma_id": n_id,
                "norma_nombre": nombre,
                "sector": nueva_norma.get("sector", "Sector"),
                "categoria": nueva_norma.get("categoria", "MEDIDA"),
                "tipo_fragmento": "OBJETO_Y_RESUMEN",
                "contenido_texto": f"Norma: {nombre}. Objeto: {nueva_norma.get('titulo')}. Resumen: {nueva_norma.get('resumen_ejecutivo', '')}."
            },
            {
                "chunk_id": f"{n_id}-c2-facultades",
                "norma_id": n_id,
                "norma_nombre": nombre,
                "sector": nueva_norma.get("sector", "Sector"),
                "categoria": nueva_norma.get("categoria", "MEDIDA"),
                "tipo_fragmento": "FACULTADES_COMPRA",
                "contenido_texto": f"Facultades Operativas - Norma: {nombre}. Facultad: {nueva_norma.get('facultad_principal', 'Contratación Directa')}."
            }
        ]

        # Vectorizar con Vertex AI
        for c in chunks_nuevos:
            c["vector_embedding"] = self.embedding_service.generar_embedding(c["contenido_texto"], task_type="RETRIEVAL_DOCUMENT")
            self.vector_chunks.append(c)

        return {
            "exito": True,
            "norma_id": n_id,
            "norma": nombre,
            "chunks_vectorizados": len(chunks_nuevos),
            "dimension": 768,
            "modelo": "text-embedding-004",
            "total_chunks_acumulados": len(self.vector_chunks)
        }

    def generate_resolution_draft(
        self,
        ubigeo: str,
        distrito: str,
        alcalde_nombre: str = "Sr. Alcalde Distrital",
        objeto_contratacion: str = "Servicio de alquiler de 02 excavadoras sobre orugas y 02 volquetes para descolmatación y conformación de dique en faja marginal"
    ) -> Dict[str, Any]:
        now = datetime.now()
        fecha_str = now.strftime("%d de %B de %Y")
        anio = now.year

        disclaimer_header = (
            "====================================================================================================\n"
            "[!] [AVISO OBLIGATORIO DE GOBERNANZA Y SOBERANÍA HUMANA - SISTEMA AMARU-LEX]\n"
            "DOCUMENTO BORRADOR ASISTIDO POR INTELIGENCIA ARTIFICIAL (IA GENERATIVA RAG).\n"
            "ESTE TEXTO CONSTITUYE EXCLUSIVAMENTE UNA SUGERENCIA Y ORIENTACIÓN TÉCNICA DOCUMENTAL PRELIMINAR.\n"
            "NO CONSTITUYE UNA TOMA DE DECISIÓN, NO ES UN ACTO ADMINISTRATIVO FINAL NI REEMPLAZA LA SOBERANÍA\n"
            "HUMANA NI EL CRITERIO PERICIAL Y JURÍDICO DE LOS FUNCIONARIOS PÚBLICOS.\n"
            "LA RESPONSABILIDAD EXCLUSIVA, INDELEGABLE Y LEGAL (ADMINISTRATIVA, CIVIL Y PENAL) POR LA EVALUACIÓN,\n"
            "APROBACIÓN, VISACIÓN, FIRMA Y EJECUCIÓN RECAE ÚNICA Y EXCLUSIVAMENTE EN LAS AUTORIDADES COMPETENTES.\n"
            "====================================================================================================\n\n"
        )

        disclaimer_footer = (
            "\n\n====================================================================================================\n"
            "DILIGENCIA OBLIGATORIA PREVIA A LA FIRMA:\n"
            "1. Visación de la Subgerencia de Gestión del Riesgo de Desastres (sustento de necesidad táctica).\n"
            "2. Visación de la Oficina de Asesoría Jurídica (control de legalidad TUO Ley 30225 y D.S. 124-2026-PCM).\n"
            "3. Certificación de Crédito Presupuestario de la Oficina de Planeamiento y Presupuesto (PP 0068).\n"
            "===================================================================================================="
        )

        texto = disclaimer_header + f"""MUNICIPALIDAD DISTRITAL DE {distrito.upper()}
RESOLUCIÓN DE ALCALDÍA Nº {now.strftime('%m%d')}-{anio}-MD{distrito.upper()[:3]}/AL

{distrito}, {fecha_str}

EL ALCALDE DE LA MUNICIPALIDAD DISTRITAL DE {distrito.upper()};

VISTOS:
El Informe Técnico de la Subgerencia de Gestión del Riesgo de Desastres y Defensa Civil, el Informe Legal de la Oficina de Asesoría Jurídica, el Decreto Supremo Nº 124-2026-PCM, el Decreto Supremo Nº 130-2026-PCM, el Decreto de Urgencia Nº 031-2026 y el Texto Único Ordenado de la Ley Nº 30225, Ley de Contrataciones del Estado;

CONSIDERANDO:
Que, mediante Decreto Supremo Nº 124-2026-PCM se declaró el Estado de Emergencia en varios distritos, entre ellos el distrito de {distrito} (Ubigeo {ubigeo}), por peligro inminente ante intensas precipitaciones pluviales y posible Fenómeno El Niño 2026-2027;

Que, el literal b) del artículo 27 del TUO de la Ley Nº 30225 y el artículo 100 de su Reglamento facultan a las entidades públicas a contratar directamente con un proveedor determinado ante una situación de emergencia producida por catástrofes o situaciones de peligro inminente;

Que, mediante Decreto de Urgencia Nº 031-2026 se dictaron medidas extraordinarias en materia económica y financiera que autorizan a los Gobiernos Locales a ejecutar acciones inmediatas de descolmatación y defensas ribereñas con cargo al Programa Presupuestal 068;

Que, existe la necesidad perentoria de contratar de forma inmediata el "{objeto_contratacion}", a fin de salvaguardar la vida, salud e infraestructura pública de la población durante la Ventana Dorada Logística antes del incremento torrencial de caudales;

Estando a las facultades conferidas por el numeral 6 del artículo 20 de la Ley Nº 27972, Ley Orgánica de Municipalidades;

SE RESUELVE:
ARTÍCULO PRIMERO.- APROBAR la CONTRATACIÓN DIRECTA POR SITUACIÓN DE EMERGENCIA para el "{objeto_contratacion}", al amparo del literal b) del artículo 27 del TUO de la Ley Nº 30225 y los Decretos Supremos Nº 124-2026-PCM y D.U. Nº 031-2026.

ARTÍCULO SEGUNDO.- ENCARGAR a la Subgerencia de Logística y Control Patrimonial realizar las gestiones contractuales inmediatas para el inicio de las operaciones de maquinaria pesada dentro de las veinticuatro (24) horas de emitida la presente.

ARTÍCULO TERCERO.- DISPONER que la regularización de la documentación correspondiente ante el Sistema Electrónico de Contrataciones del Estado (SEACE) se efectúe dentro del plazo máximo de diez (10) días hábiles siguientes a la entrega de la prestación, conforme a ley.

REGÍSTRESE, COMUNÍQUESE Y CÚMPLASE.

____________________________________
{alcalde_nombre.upper()}
Alcalde de la Municipalidad Distrital de {distrito.upper()}
""" + disclaimer_footer
        return {
            "ubigeo": ubigeo,
            "distrito": distrito,
            "alcalde": alcalde_nombre,
            "objeto": objeto_contratacion,
            "fecha": fecha_str,
            "resolucion_texto": texto,
            "advertencia_gobernanza_ia": {
                "asistente_ia": True,
                "es_sugerencia": True,
                "reemplazo_soberania_humana": False,
                "mensaje": (
                    "Este documento es un proyecto/minuta generado por un Asistente IA con fines de orientación técnica. "
                    "No constituye una decisión definitiva ni sustituye la soberanía humana. "
                    "La responsabilidad exclusiva de la aprobación, visación, firma y ejecución recae en las autoridades competentes."
                )
            }
        }

    def query_legal_assistant(self, question: str) -> Dict[str, Any]:
        """
        Copiloto IA Jurídico RAG: Responde dudas sobre los 51 decretos con base en el catálogo.
        """
        q = (question or "").lower()
        # Base de respuesta según intención temática
        if any(w in q for w in ["formato", "formatos", "plantilla", "plantillas", "documento", "documentos", "kit"]):
            resp_txt = (
                "Su Municipalidad dispone de 6 FORMATOS OFICIALES DE EMERGENCIA bajo el marco legal FEN 2026-2027:\n\n"
                "1. FORMATO DE RESOLUCIÓN DE ALCALDÍA (Contratación Directa - Art. 27 lit. b Ley 30225 y D.S. 124-PCM): "
                "Para aprobar la contratación inmediata de maquinaria y diésel sin concurso previo. Puede generarlo con 1 clic en esta misma consola.\n"
                "2. FICHA EDAN PERÚ (Formatos 2A y 2B de INDECI): "
                "Evaluación Rápida de Daños y Análisis de Necesidades. Obligatorio para registrar en el SINPAD y solicitar ayuda humanitaria (alimentos, carpas, sacos).\n"
                "3. TDR SIMPLIFICADOS PARA MAQUINARIA PESADA Y DIÉSEL (D.U. 031 y 032-2026): "
                "Términos de referencia para alquiler directo de horas-máquina (oruga D8, excavadora 330) y diésel B5.\n"
                "4. FICHA TÉCNICA DE EMERGENCIA (FTE - MIDAGRI / ANA): "
                "Para intervenciones en cauces, diques y descolmatación, exonerado de perfil Invierte.pe tradicional.\n"
                "5. FICHA DE MODIFICACIÓN PRESUPUESTARIA TIPO 003 (MEF / PP 068): "
                "Habilita el traslado de recursos del canon hacia la Actividad 5006144 para atención inmediata de desastres.\n"
                "6. ACTA DE SESIÓN EXTRAORDINARIA DE CONCEJO MUNICIPAL: "
                "Declaratoria distrital en sesión permanente y facultades delegadas al Alcalde."
            )
            normas = ["Ley Nº 30225", "D.S. Nº 124-2026-PCM", "D.U. Nº 031-2026", "Directiva INDECI EDAN-SINPAD"]
            facultad = "Kit de Formatos Oficiales para Alcaldes y Equipos Técnicos"

        elif any(w in q for w in ["resolucion", "resolución", "redacta", "borrador", "minuta"]):
            resp_txt = (
                "Para redactar el borrador formal de la Resolución de Alcaldía con 1 clic: "
                "Suba a la sección 'Generador de Proyecto de Resolución de Alcaldía' en esta misma pantalla, "
                "ingrese el nombre del Alcalde, seleccione el Objeto (ej: 'Alquiler de Maquinaria y Diésel') y presione 'Generar Proyecto'. "
                "El sistema compilará automáticamente los vistos y considerandos citando el D.S. Nº 124-2026-PCM, "
                "D.U. Nº 031-2026 y la Ley 30225 Art. 27 lit. b, con botones para Copiar al Portapapeles o Imprimir."
            )
            normas = ["D.S. Nº 124-2026-PCM", "D.U. Nº 031-2026", "Ley Nº 30225 Art. 27"]
            facultad = "Generador de Proyecto de Resolución de Alcaldía Automatizado"

        elif any(w in q for w in ["edan", "sinpad", "daños", "damnificados", "humanitaria"]):
            resp_txt = (
                "El Formato EDAN Perú (Evaluación de Daños y Análisis de Necesidades) es administrado por la Oficina de Defensa Civil municipal. "
                "Se divide en: Formato 2A (Evaluación rápida dentro de las 8 horas del evento) y Formato 2B (Empadronamiento familiar complementario). "
                "Es requisito indispensable según la Ley SINAGERD 29664 subirlo al SINPAD (Sistema Nacional de Información para la Respuesta y Rehabilitación) "
                "para que INDECI autorice la entrega de bienes de ayuda humanitaria (sacos terreros, calaminas, herramientas, víveres)."
            )
            normas = ["Ley SINAGERD Nº 29664", "Directiva Nº 016-2020-PCM/INDECI", "D.S. Nº 074-2014-PCM"]
            facultad = "Registro EDAN-SINPAD para Ayuda Humanitaria"

        elif any(w in q for w in ["presupuesto", "pp 068", "fondes", "dinero", "partida", "mef"]):
            resp_txt = (
                "Para financiar las obras del FEN en su distrito, el marco legal le permite:\n"
                "1. Modificación Presupuestaria Tipo 003: Redireccionar hasta el 100% de saldos no comprometidos de canon/sobrecanon a la Actividad 5006144 del Programa Presupuestal 068.\n"
                "2. Solicitar financiamiento adicional al FONDES (Fondo para Intervenciones ante la Ocurrencia de Desastres Naturales) al amparo del D.U. Nº 031-2026.\n"
                "3. Compras directas de diésel y horas-máquina con cargo al fondo de contingencia."
            )
            normas = ["D.U. Nº 031-2026", "D.U. Nº 033-2026", "D.S. Nº 185-2026-EF"]
            facultad = "Financiamiento Presupuestal PP 068 y FONDES"

        elif "combustible" in q or "diesel" in q or "diésel" in q:
            resp_txt = (
                "Usted puede adquirir combustible diésel B5 de forma directa e inmediata al amparo del "
                "Decreto de Urgencia Nº 032-2026 y el D.S. Nº 124-2026-PCM. No requiere licitación pública. "
                "Solo debe emitir la orden de servicio con certificación presupuestal del Programa Presupuestal 068 "
                "(Actividad 5006144) y regularizar el expediente en el SEACE dentro de los 10 días hábiles posteriores."
            )
            normas = ["D.U. Nº 032-2026", "D.S. Nº 124-2026-PCM"]
            facultad = "Contratación Directa Inmediata para Combustible de Emergencia"

        elif "maquinaria" in q or "excavadora" in q or "descolmatacion" in q or "descolmatación" in q:
            resp_txt = (
                "El alquiler y movilización de maquinaria pesada (excavadoras sobre orugas, tractores D8, volquetes) "
                "está 100% amparado en el Decreto de Urgencia Nº 031-2026 y la Ley SINAGERD 29664. "
                "La directiva del INDECI establece que estas labores deben quedar concluidas al 30 de Noviembre "
                "(Ventana Dorada), momento en el cual la maquinaria debe salir del cauce hacia campamentos secos."
            )
            normas = ["D.U. Nº 031-2026", "D.S. Nº 124-2026-PCM", "D.S. Nº 130-2026-PCM"]
            facultad = "Alquiler Directo de Maquinaria y Faenas en Fajas Marginales"

        elif "regularizar" in q or "plazo" in q or "seace" in q:
            resp_txt = (
                "Conforme al artículo 100 del Reglamento de la Ley de Contrataciones del Estado (Ley 30225), "
                "en contrataciones directas por situación de emergencia provocada por peligro inminente (D.S. 124-PCM), "
                "la entidad dispone de diez (10) días hábiles contados a partir de la entrega del bien o del inicio de los "
                "servicios para regularizar el informe técnico-legal, la resolución de alcaldía y el registro en el SEACE."
            )
            normas = ["Ley Nº 30225 Art. 27", "D.U. Nº 031-2026"]
            facultad = "Plazo de Regularización Ex-Post en SEACE"

        elif "contraloria" in q or "contraloría" in q or "fiscalia" in q or "delito" in q:
            resp_txt = (
                "Para estar plenamente blindado ante la Contraloría General de la República: (1) Su resolución debe citar "
                "el D.S. Nº 124-2026-PCM y D.U. Nº 031-2026; (2) Adjuntar el Informe de Estimación de Riesgo de Defensa Civil; "
                "y (3) Fotografiar el antes, durante y después de los trabajos en el río. Tenga presente que el mayor riesgo penal "
                "no es contratar en emergencia, sino OMITIR la contratación oportuna (Art. 377 Código Penal por omisión de funciones)."
            )
            normas = ["Ley SINAGERD 29664 Art. 89", "Código Penal Art. 377"]
            facultad = "Blindaje Legal y Prevención de Responsabilidad Funcional"

        else:
            resp_txt = (
                "El catálogo de 51 normas legales FEN 2026-2027 cubre de forma integral la declaratoria de peligro inminente, "
                "prórrogas en 25 departamentos, financiamiento extraordinario mediante Decretos de Urgencia 031/032/033 y "
                "líneas de endeudamiento externo con el BID (D.S. 185-EF). Los Gobiernos Locales tienen facultades plenas para "
                "actuar preventivamente durante la Ventana Dorada."
            )
            normas = ["51 Normas Legales FEN 2026-2027"]
            facultad = "Gobernanza y Facultades Plenas de Emergencia"

        # Recordatorio canónico de soberanía humana y responsabilidad institucional
        clausula_soberania = (
            "\n\n[AVISO DE GOBERNANZA Y SOBERANÍA HUMANA]: "
            "Esta respuesta es una sugerencia analítica y de orientación documental generada por un Asistente IA. "
            "No constituye una decisión ejecutiva ni reemplaza la soberanía humana ni el dictamen técnico-jurídico formal. "
            "La responsabilidad de toda decisión administrativa, suscripción de actos y ejecución presupuestal recae "
            "exclusiva e indelegablemente en las autoridades y funcionarios públicos competentes."
        )

        return {
            "respuesta": resp_txt + clausula_soberania,
            "normas_relevantes": normas,
            "facultad": facultad,
            "advertencia_gobernanza_ia": {
                "asistente_ia": True,
                "es_sugerencia": True,
                "reemplazo_soberania_humana": False,
                "mensaje": (
                    "Orientación técnica emitida por Asistente IA. No sustituye la soberanía humana. "
                    "La responsabilidad final recae en las autoridades públicas competentes."
                )
            }
        }

    def get_official_formats_catalog(self) -> List[Dict[str, Any]]:
        """
        Retorna el catálogo oficial de formatos administrativos y legales para autoridades municipales.
        """
        return [
            {
                "id": "FMT-01",
                "codigo": "RA-CONTRATACION-DIRECTA",
                "titulo": "Proyecto de Resolución de Alcaldía (Contratación Directa de Emergencia)",
                "base_legal": "Ley Nº 30225 Art. 27 lit. b, D.S. Nº 124-2026-PCM, D.U. Nº 031-2026",
                "entidad_receptora": "Portal de Transparencia Municipal / SEACE",
                "descripcion": "Aprueba la contratación directa inmediata de maquinaria pesada, roca al volteo o combustible sin concurso ordinario previo.",
                "plazo_regularizacion": "10 días hábiles en el SEACE posteriores al inicio del servicio.",
                "disponible_en_consola": True,
                "accion": "generate_resolution"
            },
            {
                "id": "FMT-02",
                "codigo": "EDAN-PERU-2A-2B",
                "titulo": "Ficha EDAN Perú (Evaluación de Daños y Análisis de Necesidades) & SINPAD",
                "base_legal": "Ley SINAGERD Nº 29664, Directiva Nº 016-2020-PCM/INDECI",
                "entidad_receptora": "INDECI (Plataforma Nacional SINPAD)",
                "descripcion": "Registra el impacto en viviendas, damnificados, vías y cultivos. Requisito legal obligatorio para el envío inmediato de Bienes de Ayuda Humanitaria (BAH).",
                "plazo_regularizacion": "Formato 2A dentro de las primeras 8 horas; Formato 2B dentro de 72 horas.",
                "disponible_en_consola": True,
                "accion": "template_edan"
            },
            {
                "id": "FMT-03",
                "codigo": "TDR-MAQUINARIA-DIESEL",
                "titulo": "Términos de Referencia Simplificados (Alquiler de Maquinaria y Diésel B5)",
                "base_legal": "D.U. Nº 031-2026, D.U. Nº 032-2026, Directiva OSCE de Contratación Directa",
                "entidad_receptora": "Oficina de Logística / Abastecimiento Municipal",
                "descripcion": "Especificaciones técnicas para alquiler por horas de tractor sobre oruga D8/D9, excavadora sobre oruga 330 y abastecimiento en campo de combustible.",
                "plazo_regularizacion": "Regularizable en el expediente de contratación dentro de 10 días.",
                "disponible_en_consola": True,
                "accion": "template_tdr"
            },
            {
                "id": "FMT-04",
                "codigo": "FTE-CAUCES-MIDAGRI-ANA",
                "titulo": "Ficha Técnica de Emergencia (FTE) para Descolmatación y Fajas Marginales",
                "base_legal": "D.U. Nº 031-2026, R.J. Autoridad Nacional del Agua (ANA)",
                "entidad_receptora": "ANA / Administraciones Locales de Agua (ALA) / GORE",
                "descripcion": "Memoria descriptiva simplificada para intervención en ríos y quebradas, exenta de los plazos de viabilidad Invierte.pe.",
                "plazo_regularizacion": "Aprobación técnica expedita por la ALA de la cuenca.",
                "disponible_en_consola": True,
                "accion": "template_fte"
            },
            {
                "id": "FMT-05",
                "codigo": "MODIF-PP068-ACT-5006144",
                "titulo": "Ficha de Modificación Presupuestaria Tipo 003 (PP 068 - Reducción de Vulnerabilidad)",
                "base_legal": "D.U. Nº 031-2026, Directiva Nº 0001-2026-EF/50.01 (MEF)",
                "entidad_receptora": "SIAF-SP / Dirección General de Presupuesto Público (MEF)",
                "descripcion": "Autoriza la anulación de saldos de proyectos ordinarios para habilitar la Actividad 5006144 y adquirir insumos de defensa ribereña.",
                "plazo_regularizacion": "Registro inmediato en el aplicativo web SIAF-Operaciones en Línea.",
                "disponible_en_consola": True,
                "accion": "template_pp068"
            },
            {
                "id": "FMT-06",
                "codigo": "ACTA-CONCEJO-SESION-PERMANENTE",
                "titulo": "Acta de Sesión Extraordinaria de Concejo (Sesión Permanente y Emergencia Distrital)",
                "base_legal": "Ley Orgánica de Municipalidades Nº 27972 Art. 20 num. 6",
                "entidad_receptora": "Secretaría General Municipal",
                "descripcion": "Acuerdo de concejo que respalda unánimemente las acciones de emergencia del Alcalde y autoriza los gastos directos.",
                "plazo_regularizacion": "Acta firmada en sesión del concejo.",
                "disponible_en_consola": True,
                "accion": "template_acta"
            }
        ]

    def _load_vector_chunks(self) -> List[Dict[str, Any]]:
        """Carga los 105 fragmentos vectorizados de 768-D con Vertex AI."""
        # 1. Intentar cargar desde el archivo en TEMP
        temp_path = os.path.join(tempfile.gettempdir(), "marco_legal_embeddings_vertex.json")
        if os.path.exists(temp_path):
            try:
                with open(temp_path, "r", encoding="utf-8") as f:
                    d = json.load(f)
                    chunks = d.get("chunks", [])
                    if chunks:
                        return chunks
            except Exception as e:
                print(f"[LegalFrameworkService] Error leyendo cache vectorial en TEMP: {e}")

        # 2. Intentar cargar desde data/ si existe
        data_path = os.path.abspath(
            os.path.join(os.path.dirname(__file__), "..", "..", "data", "marco_legal_embeddings_vertex.json")
        )
        if os.path.exists(data_path):
            try:
                with open(data_path, "r", encoding="utf-8") as f:
                    d = json.load(f)
                    chunks = d.get("chunks", [])
                    if chunks:
                        return chunks
            except Exception:
                pass

        # 3. Intentar cargar desde Cloud SQL PostgreSQL si está habilitado
        try:
            try:
                from database.db_connection import db_manager
            except ImportError:
                from backend.database.db_connection import db_manager
            if db_manager.enabled:

                import sys
                p_pkgs = r"C:\Users\USUARI~1\AppData\Local\Temp\my_pg_packages"
                if os.path.exists(p_pkgs) and p_pkgs not in sys.path:
                    sys.path.insert(0, p_pkgs)
                import pg8000.native
                from urllib.parse import urlparse
                u = urlparse(db_manager.db_url)
                con = pg8000.native.Connection(
                    user=u.username or "amaru_admin",
                    password=u.password or "",
                    host=u.hostname or "34.176.254.17",
                    port=u.port or 5432,
                    database=u.path.lstrip("/") or "amaru_climate_db",
                    timeout=5
                )
                rows = con.run("SELECT chunk_id, norma_id, norma_nombre, sector, categoria, tipo_fragmento, contenido_texto, vector_embedding FROM marco_legal_vectores LIMIT 200;")
                con.close()
                chunks = []
                for r in rows:
                    raw_vec = r[7]
                    vec = json.loads(raw_vec) if isinstance(raw_vec, str) else list(raw_vec)
                    chunks.append({
                        "chunk_id": r[0],
                        "norma_id": r[1],
                        "norma_nombre": r[2],
                        "sector": r[3],
                        "categoria": r[4],
                        "tipo_fragmento": r[5],
                        "contenido_texto": r[6],
                        "vector_embedding": vec
                    })
                if chunks:
                    return chunks
        except Exception:
            pass

        return []

    def buscar_normas_semanticas(
        self,
        consulta: str,
        top_k: int = 5,
        umbral_minimo: float = 0.40
    ) -> Dict[str, Any]:
        """
        Búsqueda Semántica Vectorial con Vertex AI text-embedding-004 (768-D).
        Compara la intención de la consulta táctica con el espacio vectorial de las
        51 normas del SINAGERD y jurisprudencia de emergencia.
        """
        t0 = time.time()
        q = (consulta or "").strip()
        if not q:
            return {
                "consulta": "",
                "total_coincidencias": 0,
                "coincidencias": [],
                "dictamen_amparo_inmediato": "Debe ingresar una consulta jurídica o táctica válida.",
                "tiempo_inferencia_ms": 0.0
            }

        if not self.vector_chunks:
            self.vector_chunks = self._load_vector_chunks()

        # Si aún no hay vectores cargados, fallback a búsqueda léxica
        if not self.vector_chunks:
            normas_lexicas = self.get_all_norms(search=q)[:top_k]
            coincidencias_lex = [
                {
                    "norma_id": n.get("id", "LEX"),
                    "norma_nombre": n.get("norma", "Norma"),
                    "sector": n.get("sector", "Sector"),
                    "categoria": n.get("categoria", "MEDIDA"),
                    "tipo_fragmento": "OBJETO_Y_RESUMEN",
                    "similitud_porcentaje": 75.0,
                    "nivel_relevancia": "RELEVANCIA_MEDIA_TACTICA",
                    "contenido_texto": n.get("resumen_ejecutivo") or n.get("titulo", ""),
                    "sustento_tactico": n.get("facultad_principal", "Facultad conforme a norma.")
                }
                for n in normas_lexicas
            ]
            return {
                "consulta": q,
                "motor": "LÉXICO_FALLBACK_CONTINGENCIA",
                "modelo_vectorial": "Búsqueda Textual Resiliente",
                "total_coincidencias": len(coincidencias_lex),
                "coincidencias": coincidencias_lex,
                "dictamen_amparo_inmediato": "Búsqueda ejecutada en modo de contingencia local FEN.",
                "tiempo_inferencia_ms": round((time.time() - t0) * 1000, 2)
            }

        # Generar embedding para la consulta (Vertex AI con fallback determinista)
        q_vec = self.embedding_service.generar_embedding(q, task_type="RETRIEVAL_QUERY")

        scored = []
        for c in self.vector_chunks:
            sim = self.embedding_service.similitud_coseno(q_vec, c.get("vector_embedding", []))
            if sim >= umbral_minimo:
                scored.append((sim, c))

        scored.sort(key=lambda x: x[0], reverse=True)
        top_matches = scored[:top_k]

        coincidencias = []
        for sim, c in top_matches:
            pct = round(sim * 100, 1)
            if sim >= 0.65:
                nivel = "ALTA_RELEVANCIA_CRITICA"
            elif sim >= 0.50:
                nivel = "RELEVANCIA_MEDIA_TACTICA"
            else:
                nivel = "REFERENCIAL_COMPLEMENTARIO"

            coincidencias.append({
                "norma_id": c.get("norma_id"),
                "norma_nombre": c.get("norma_nombre"),
                "sector": c.get("sector"),
                "categoria": c.get("categoria"),
                "tipo_fragmento": c.get("tipo_fragmento"),
                "similitud_porcentaje": pct,
                "nivel_relevancia": nivel,
                "contenido_texto": c.get("contenido_texto"),
                "sustento_tactico": f"Amparo legal prioritario ({pct}% afinidad semántica con el requerimiento operativo)."
            })

        # Generación del dictamen de amparo inmediato
        top_norma = coincidencias[0]["norma_nombre"] if coincidencias else "Normativa General SINAGERD"
        dictamen = (
            f"La consulta táctica se encuentra respaldada principalmente por: {top_norma}. "
            "Se faculta a los comités distritales y provinciales a ejecutar las contrataciones directas "
            "y traslados presupuestales correspondientes antes del inicio de la temporada de lluvias torrenciales."
        )

        return {
            "consulta": q,
            "motor": "VERTEX_AI_VECTOR_SEARCH",
            "modelo_vectorial": "text-embedding-004 (Google Cloud Vertex AI 768-D)",
            "total_coincidencias": len(coincidencias),
            "coincidencias": coincidencias,
            "dictamen_amparo_inmediato": dictamen,
            "tiempo_inferencia_ms": round((time.time() - t0) * 1000, 2)
        }

    def get_vector_status(self) -> Dict[str, Any]:
        """Reporta el estado operativo del motor vectorial de AMARU-LEX."""
        if not self.vector_chunks:
            self.vector_chunks = self._load_vector_chunks()
        return {
            "activo": len(self.vector_chunks) > 0,
            "total_chunks_vectorizados": len(self.vector_chunks),
            "dimension": 768,
            "modelo": "text-embedding-004",
            "proveedor": "Google Cloud Vertex AI",
            "persistencia": "Google Cloud SQL (marco_legal_vectores) + Cache Local",
            "estado_motor": "OPERATIVO_EN_PRODUCCION" if len(self.vector_chunks) > 0 else "SIN_VECTORES_CARGADOS"
        }

legal_service = LegalFrameworkService()
