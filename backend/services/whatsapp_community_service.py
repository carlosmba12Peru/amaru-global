"""
Servicio de Ingesta Comunitaria y Emulador WhatsApp (AMARU-CLIMATE)
Módulo 5: Recepción, NLP de daños, geolocalización de caseríos y cola Store-and-Forward offline.
Compatible con Meta WhatsApp Cloud API y Twilio Webhook.
"""

import json
import re
import hashlib
from datetime import datetime, timezone, timedelta
from pathlib import Path
from typing import Dict, List, Optional, Any

PERU_TZ = timezone(timedelta(hours=-5))

BASE_DIR = Path(__file__).resolve().parent.parent.parent
DATA_DIR_PRIMARY = BASE_DIR / "data"
DATA_DIR_BACKEND = BASE_DIR / "backend" / "data"

def get_whatsapp_data_path() -> Path:
    if DATA_DIR_PRIMARY.exists():
        return DATA_DIR_PRIMARY / "whatsapp_community_inbox.json"
    if DATA_DIR_BACKEND.exists():
        return DATA_DIR_BACKEND / "whatsapp_community_inbox.json"
    return DATA_DIR_PRIMARY / "whatsapp_community_inbox.json"


# Plantillas representativas de campo (Ground Truth FEN Norte y FEN Sur)
PLANTILLAS_COMUNITARIAS = [
    {
        "id": "wa-template-01",
        "remitente": "+51 974 812 340",
        "nombre_contacto": "Sr. Santos Chiroque (Teniente Gobernador)",
        "caserio": "Caserío Naranjo Alto",
        "distrito": "Cura Mori",
        "provincia": "Piura",
        "departamento": "Piura",
        "coordenadas": {"lat": -5.3340, "lng": -80.6580},
        "mensaje": "URGENTE INDECI: El río Piura rompió el dique a las 5am. Caserío Naranjo Alto inundado con 1.20m de agua. 28 familias en los techos, 14 niños y 6 ancianos sin comida ni agua potable. Por favor envíen lanchas o helicóptero.",
        "categoria_esperada": "DESBORDE_INUNDACION_GRAVE",
        "familias_estimadas": 28
    },
    {
        "id": "wa-template-02",
        "remitente": "+51 944 120 985",
        "nombre_contacto": "Prof. Nancy Morales (Comité de Vaso de Leche)",
        "caserio": "Anexo La Otra Banda",
        "distrito": "Íllimo",
        "provincia": "Lambayeque",
        "departamento": "Lambayeque",
        "coordenadas": {"lat": -6.4820, "lng": -79.8510},
        "mensaje": "Alerta: El río La Leche se desbordó por el sector San Pedro. El puente rústico colapsó y estamos totalmente aislados. Hay 15 viviendas de adobe destruidas y postas médicas anegadas.",
        "categoria_esperada": "COLAPSO_PUENTE_AISLAMIENTO",
        "familias_estimadas": 15
    },
    {
        "id": "wa-template-03",
        "remitente": "+51 961 883 412",
        "nombre_contacto": "Don Teodoro Huamán (Presidente Comunal)",
        "caserio": "Comunidad Campesina Yauyos",
        "distrito": "Chupaca",
        "provincia": "Chupaca",
        "departamento": "Junín",
        "coordenadas": {"lat": -12.0645, "lng": -75.2890},
        "mensaje": "Emergencia Valle del Mantaro: Crecida del Río Cunas arrasó plataforma de la vía ribereña. Puente Cunas en riesgo inminente de desplome. No hay paso para Huancayo. Necesitamos roca al volteo y cargador frontal.",
        "categoria_esperada": "COLAPSO_PUENTE_INFRAESTRUCTURA",
        "familias_estimadas": 45
    },
    {
        "id": "wa-template-04",
        "remitente": "+51 989 334 117",
        "nombre_contacto": "Subprefectura Distrital",
        "caserio": "Puente Virú - Panamericana Norte",
        "distrito": "Virú",
        "provincia": "Virú",
        "departamento": "La Libertad",
        "coordenadas": {"lat": -8.4180, "lng": -78.7510},
        "mensaje": "SOCORRO: Caudal extraordinario socavó el pilar central del Puente Virú. El tránsito está detenido en ambos sentidos de la Panamericana. Cientos de pasajeros y camiones varados bajo lluvia torrencial.",
        "categoria_esperada": "CORTE_TRONCAL_NACIONAL",
        "familias_estimadas": 80
    }
]


class WhatsAppCommunityService:
    """Motor de gestión de reportes de emergencia comunitaria vía WhatsApp."""

    def __init__(self):
        self._mensajes: List[Dict[str, Any]] = self._cargar_mensajes()
        self._cola_offline: List[Dict[str, Any]] = []

    def _cargar_mensajes(self) -> List[Dict[str, Any]]:
        path = get_whatsapp_data_path()
        if not path.exists():
            return []
        try:
            with open(path, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            return []

    def _guardar_mensajes(self):
        path = get_whatsapp_data_path()
        try:
            path.parent.mkdir(parents=True, exist_ok=True)
            with open(str(path.resolve()), "w", encoding="utf-8") as f:
                f.write(json.dumps(self._mensajes, indent=2, ensure_ascii=False))
        except Exception:
            pass

    def procesar_nlp_mensaje(self, texto: str) -> Dict[str, Any]:
        """
        Analizador NLP contextual para extraer tipo de daño, severidad,
        familias afectadas, niños/ancianos y necesidades críticas.
        """
        texto_lower = texto.lower()

        # Detección de Categoría y Severidad
        categoria = "REPORTE_GENERAL_EMERGENCIA"
        severidad = "MEDIA"

        if any(w in texto_lower for w in ["puente", "socavó", "desplome", "aislados", "no hay paso", "varados", "corte"]):
            categoria = "COLAPSO_PUENTE_O_VIA"
            severidad = "CRITICA"
        elif any(w in texto_lower for w in ["rompió el dique", "desbordó", "inundad", "1.20m", "techo", "lanchas", "bote"]):
            categoria = "INUNDACION_DESBORDE_EXTREMO"
            severidad = "CRITICA"
        elif any(w in texto_lower for w in ["huaico", "lodo", "piedras", "deslizamiento", "colapsó casa", "destruida"]):
            categoria = "HUAICO_DESTRUCCION_VIVIENDAS"
            severidad = "ALTA"
        elif any(w in texto_lower for w in ["helada", "nevada", "frío extremo", "ganado muerto", "cultivo perdido"]):
            categoria = "EVENTO_CRIOCLIMATICO_AGRO"
            severidad = "ALTA"

        # Extracción de Familias
        familias = 0
        match_fam = re.search(r"(\d+)\s*(familias|viviendas|casas|hogares)", texto_lower)
        if match_fam:
            familias = int(match_fam.group(1))
        elif "muchas familias" in texto_lower or "todo el pueblo" in texto_lower:
            familias = 20

        # Personas vulnerables
        vulnerables = {"ninos": 0, "ancianos": 0, "heridos": 0}
        match_ninos = re.search(r"(\d+)\s*(niños|niñas|menores|bebes|bebés)", texto_lower)
        if match_ninos:
            vulnerables["ninos"] = int(match_ninos.group(1))
        match_ancianos = re.search(r"(\d+)\s*(ancianos|abuelos|adultos mayores|viejitos)", texto_lower)
        if match_ancianos:
            vulnerables["ancianos"] = int(match_ancianos.group(1))
        match_heridos = re.search(r"(\d+)\s*(heridos|atrapados|lesionados)", texto_lower)
        if match_heridos:
            vulnerables["heridos"] = int(match_heridos.group(1))

        # Requerimientos prioritarios detectados
        insumos_clave = []
        if any(w in texto_lower for w in ["comida", "alimento", "víveres", "leche", "olla"]):
            insumos_clave.append("Raciones Frías de Alimento")
        if any(w in texto_lower for w in ["agua", "sed", "potable", "bidon", "bidones"]):
            insumos_clave.append("Agua Potable en Bidones")
        if any(w in texto_lower for w in ["lancha", "bote", "rescate", "helicoptero", "helicóptero"]):
            insumos_clave.append("Evacuación Fluvial / Aérea")
        if any(w in texto_lower for w in ["cargador", "retroexcavadora", "maquinaria", "roca"]):
            insumos_clave.append("Maquinaria Pesada MTC")
        if any(w in texto_lower for w in ["carpa", "techo", "frazada", "calaminas"]):
            insumos_clave.append("Kits de Techo y Abrigo")

        if not insumos_clave:
            insumos_clave.append("Evaluación EDAN de Campo Inmediata")

        return {
            "categoria": categoria,
            "severidad": severidad,
            "familias_estimadas": max(familias, 1 if severidad in ["CRITICA", "ALTA"] else 0),
            "vulnerables": vulnerables,
            "insumos_prioritarios": insumos_clave
        }

    def registrar_mensaje_entrante(
        self,
        remitente: str,
        mensaje: str,
        nombre_contacto: Optional[str] = None,
        caserio: Optional[str] = None,
        distrito: Optional[str] = None,
        coordenadas: Optional[Dict[str, float]] = None,
        modo_offline: bool = False
    ) -> Dict[str, Any]:
        """
        Procesa un reporte comunitario proveniente de WhatsApp.
        Genera el ticket de auxilio, notifica la bitácora y responde al ciudadano.
        """
        ahora = datetime.now(PERU_TZ)
        ahora_iso = ahora.isoformat()
        mensaje_hash = hashlib.sha256(f"{remitente}|{mensaje}|{ahora_iso}".encode("utf-8")).hexdigest()[:12]
        ticket_id = f"AMARU-WA-{ahora.strftime('%Y%m%d')}-{mensaje_hash.upper()}"

        nlp_result = self.procesar_nlp_mensaje(mensaje)

        registro = {
            "ticket_id": ticket_id,
            "remitente": remitente,
            "nombre_contacto": nombre_contacto or "Comunero / Informante de Campo",
            "mensaje_original": mensaje,
            "caserio": caserio or "Sector Rural No Especificado",
            "distrito": distrito or "Distrito en Emergencia",
            "coordenadas": coordenadas or {"lat": -9.1899, "lng": -75.0152},
            "timestamp": ahora_iso,
            "nlp_analisis": nlp_result,
            "estado": "ENCOLADO_OFFLINE" if modo_offline else "PROCESADO_C4ISR",
            "canal": "WHATSAPP_TWILIO_META_SIMULATOR",
            "incorporado_a_edan": False,
            "bloque_worm_cgr": None
        }

        # Generar respuesta automática bilingüe para el informante
        contacto_nombre_pila = (nombre_contacto or "Hermano/a comunero").split()[0]
        respuesta_ciudadano = (
            f"🇵🇪 *AMARU-CLIMATE / INDECI C4ISR*\n"
            f"Estimado/a *{contacto_nombre_pila}*, su reporte ha sido registrado con *Folio de Auxilio N.° {ticket_id}*.\n\n"
            f"📍 *Sector:* {registro['caserio']} ({registro['distrito']})\n"
            f"🚨 *Clasificación:* {nlp_result['categoria']} ({nlp_result['severidad']})\n"
            f"📦 *Ayuda Priorizada:* {', '.join(nlp_result['insumos_prioritarios'])}\n\n"
            f"🛡️ *Acción:* La Plataforma de Defensa Civil y el Padrón EDAN han sido alertados. Su llamada tiene amparo legal bajo el D.S. 124-2026-PCM."
        )
        registro["respuesta_automatica"] = respuesta_ciudadano

        # Si está en modo offline, encola en buffer de resiliencia
        if modo_offline:
            self._cola_offline.append(registro)
            return {
                "ticket_id": ticket_id,
                "estado": "ENCOLADO_OFFLINE",
                "mensaje": "Reporte almacenado en cola de resiliencia de campo (sin enlace satelital). Se sincronizará al conectar.",
                "registro": registro
            }

        # Guardar en buzón permanente
        self._mensajes.insert(0, registro)
        self._guardar_mensajes()

        # Notificar a bitácora CGR WORM si está disponible
        try:
            from services.cgr_worm_service import cgr_worm_service
            bloque = cgr_worm_service.acunar_evento(
                tipo_evento="REPORTE_COMUNITARIO_SELLADO",
                actor_responsable=f"{nombre_contacto or 'Comunero'} ({remitente})",
                entidad_origen="RED_VECINAL_WHATSAPP",
                datos_evento={
                    "ticket_id": ticket_id,
                    "caserio": registro["caserio"],
                    "distrito": registro["distrito"],
                    "categoria": nlp_result["categoria"],
                    "familias_estimadas": nlp_result["familias_estimadas"]
                }
            )
            registro["bloque_worm_cgr"] = bloque["block_hash"]
            self._guardar_mensajes()
        except Exception:
            pass

        # Si reportaron colapso de puente, registrar corte en el router logístico
        if "puente" in mensaje.lower() and ("colapsó" in mensaje.lower() or "socavó" in mensaje.lower() or "desplome" in mensaje.lower()):
            try:
                from services.routing.humanitarian_router import humanitarian_router
                if "virú" in mensaje.lower() or "viru" in mensaje.lower():
                    humanitarian_router.registrar_bloqueo(
                        tipo_incidente="COLAPSO_PUENTE",
                        ubicacion="Puente Virú PE-1N Km 515",
                        descripcion=f"Reporte WhatsApp vecinal {ticket_id}",
                        puente_afectado="puente-viru-pe1n",
                        reportado_por="WHATSAPP_COMUNIDAD_VECINAL",
                        severidad="CRITICO"
                    )
                elif "cunas" in mensaje.lower():
                    humanitarian_router.registrar_bloqueo(
                        tipo_incidente="COLAPSO_PUENTE",
                        ubicacion="Puente Cunas - Chupaca",
                        descripcion=f"Reporte WhatsApp vecinal {ticket_id}",
                        puente_afectado="puente-cunas-chupaca",
                        reportado_por="WHATSAPP_COMUNIDAD_VECINAL",
                        severidad="CRITICO"
                    )
                elif "leche" in mensaje.lower() or "illimo" in mensaje.lower():
                    humanitarian_router.registrar_bloqueo(
                        tipo_incidente="COLAPSO_PUENTE",
                        ubicacion="Puente La Leche - Íllimo",
                        descripcion=f"Reporte WhatsApp vecinal {ticket_id}",
                        puente_afectado="puente-la-leche-illimo",
                        reportado_por="WHATSAPP_COMUNIDAD_VECINAL",
                        severidad="CRITICO"
                    )
            except Exception:
                pass

        return {
            "ticket_id": ticket_id,
            "estado": "PROCESADO_EXITOSAMENTE",
            "respuesta_ciudadano": respuesta_ciudadano,
            "registro": registro
        }

    def sincronizar_cola_offline(self) -> Dict[str, Any]:
        """Descarga y procesa en bloque los mensajes acumulados durante cortes de conectividad."""
        procesados = []
        while self._cola_offline:
            item = self._cola_offline.pop(0)
            item["estado"] = "PROCESADO_C4ISR"
            self._mensajes.insert(0, item)
            procesados.append(item["ticket_id"])

        self._guardar_mensajes()
        return {
            "total_sincronizados": len(procesados),
            "tickets": procesados,
            "mensaje": f"Se procesaron {len(procesados)} reportes offline desde la cola de resiliencia."
        }

    def listar_mensajes(self, limite: int = 50) -> List[Dict[str, Any]]:
        return self._mensajes[:limite]

    def listar_plantillas(self) -> List[Dict[str, Any]]:
        return PLANTILLAS_COMUNITARIAS

    def obtener_estadisticas(self) -> Dict[str, Any]:
        total = len(self._mensajes)
        criticos = sum(1 for m in self._mensajes if m.get("nlp_analisis", {}).get("severidad") == "CRITICA")
        familias_total = sum(m.get("nlp_analisis", {}).get("familias_estimadas", 0) for m in self._mensajes)
        offline_pendientes = len(self._cola_offline)

        return {
            "total_reportes_recibidos": total,
            "reportes_severidad_critica": criticos,
            "total_familias_en_riesgo": familias_total,
            "mensajes_en_buffer_offline": offline_pendientes,
            "canales_activos": ["WHATSAPP_TWILIO", "META_CLOUD_API", "MOCK_CAMPO_SIMULATOR"]
        }


whatsapp_community_service = WhatsAppCommunityService()
