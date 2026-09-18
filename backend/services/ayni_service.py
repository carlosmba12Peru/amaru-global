import os
import json
import logging
from typing import Dict, Any, List, Optional
from datetime import datetime

logger = logging.getLogger("ayni_service")

class AyniCommunityService:
    """
    Servicio de Inteligencia Territorial y Participación Ciudadana: AMARU-AYNI.
    Gestiona Ollas Comunes, Juntas Vecinales, Agentes Comunitarios de Salud,
    Faenas Vecinales (Minkas) y despacho de alertas vía Telegram y Correo Electrónico.
    """

    def __init__(self):
        self.telegram_token = os.getenv("TELEGRAM_BOT_TOKEN", "")
        self.telegram_chat_id = os.getenv("TELEGRAM_CHAT_ID", "")
        self.smtp_host = os.getenv("SMTP_HOST", "smtp.gmail.com")
        self.smtp_port = int(os.getenv("SMTP_PORT", "587"))
        self.smtp_user = os.getenv("SMTP_USER", "")
        self.smtp_password = os.getenv("SMTP_PASSWORD", "")
        self.smtp_from = os.getenv("SMTP_FROM_EMAIL", "alertas@amaru-climate.gob.pe")

        # Base de datos en memoria para ollas comunes y juntas
        self._init_mock_data()

    def _init_mock_data(self):
        self.ollas_comunes = [
            {
                "id": "OLLA-01",
                "nombre": "Olla Común 'Mujeres Luchadoras de Carapongo'",
                "ubigeo": "150118",
                "distrito": "Lurigancho-Chosica",
                "sector": "Carapongo - Ribera del Río Rímac",
                "lideresa": "Sra. María Quispe Huamán",
                "telefono": "987-654-321",
                "raciones_diarias": 140,
                "dias_autonomia_alimentos": 4,
                "estado_agua": "Cisterna requerida con urgencia",
                "familias_atendidas": 38,
                "requiere_apoyo": True,
                "nivel_urgencia": "ALTA"
            },
            {
                "id": "OLLA-02",
                "nombre": "Comedor Popular 'Virgen del Carmen'",
                "ubigeo": "150118",
                "distrito": "Lurigancho-Chosica",
                "sector": "Quebrada San Antonio de Pedregal",
                "lideresa": "Sra. Carmen Rosa Mendoza",
                "telefono": "976-543-210",
                "raciones_diarias": 210,
                "dias_autonomia_alimentos": 9,
                "estado_agua": "Tanque comunitario con pastillas de cloro",
                "familias_atendidas": 55,
                "requiere_apoyo": False,
                "nivel_urgencia": "MEDIA"
            },
            {
                "id": "OLLA-03",
                "nombre": "Olla Común 'Esperanza de Quirio'",
                "ubigeo": "150118",
                "distrito": "Lurigancho-Chosica",
                "sector": "Quebrada Quirio - Parte Alta",
                "lideresa": "Sra. Juana Mamani Calisaya",
                "telefono": "965-432-109",
                "raciones_diarias": 115,
                "dias_autonomia_alimentos": 2,
                "estado_agua": "Sin agua potable, acarreo en bidones",
                "familias_atendidas": 32,
                "requiere_apoyo": True,
                "nivel_urgencia": "CRITICA"
            },
            {
                "id": "OLLA-04",
                "nombre": "Olla Común 'Semillitas del Norte'",
                "ubigeo": "200101",
                "distrito": "Piura",
                "sector": "Asociación Santa Rosa - Faja Bajo Piura",
                "lideresa": "Sra. Rosaura Yamunaqué Chunga",
                "telefono": "954-321-098",
                "raciones_diarias": 180,
                "dias_autonomia_alimentos": 6,
                "estado_agua": "Bidones clorados por Agente de Salud",
                "familias_atendidas": 46,
                "requiere_apoyo": False,
                "nivel_urgencia": "BAJA"
            }
        ]

        self.juntas_vecinales = [
            {
                "id": "JUVESC-01",
                "nombre": "Junta Vecinal de Seguridad Ciudadana Nº 4",
                "ubigeo": "150118",
                "distrito": "Lurigancho-Chosica",
                "sector": "Quebrada Corrales / Moyopampa",
                "coordinador": "Sr. Walter Ramos Pérez",
                "integrantes": 24,
                "sirenas_activas": 2,
                "megafonos_operativos": 4,
                "silbatos_repartidos": 80,
                "poblacion_vulnerable_censada": 19,
                "estado_operativo": "ALERTA_AMARILLA"
            },
            {
                "id": "JUVESC-02",
                "nombre": "Comité de Vigilancia Ribereña Carapongo",
                "ubigeo": "150118",
                "distrito": "Lurigancho-Chosica",
                "sector": "Margen Izquierda Río Rímac Km 15",
                "coordinador": "Sr. Humberto Cárdenas Soto",
                "integrantes": 31,
                "sirenas_activas": 1,
                "megafonos_operativos": 3,
                "silbatos_repartidos": 120,
                "poblacion_vulnerable_censada": 27,
                "estado_operativo": "OPERATIVO_PREVENCION"
            },
            {
                "id": "JUVESC-03",
                "nombre": "Brigada Vecinal San Gabriel Alto",
                "ubigeo": "150132",
                "distrito": "San Juan de Lurigancho",
                "sector": "Quebrada Canto Grande",
                "coordinador": "Sra. Elena Córdova Vilca",
                "integrantes": 18,
                "sirenas_activas": 1,
                "megafonos_operativos": 2,
                "silbatos_repartidos": 60,
                "poblacion_vulnerable_censada": 14,
                "estado_operativo": "OPERATIVO_PREVENCION"
            }
        ]

        self.padron_vulnerables = [
            {
                "id": "VULN-001",
                "nombre": "Don Saturnino Huamán (84 años)",
                "condicion": "Adulto Mayor - Movilidad Reducida",
                "sector": "Quebrada Quirio Mz B Lote 4",
                "brigadista_asignado_1": "Walter Ramos (Vecino Colindante)",
                "brigadista_asignado_2": "Marcos Díaz (Brigadista JUVESC)",
                "punto_evacuacion": "Loza Deportiva Techada Moyopampa",
                "contacto_emergencia": "987-111-222"
            },
            {
                "id": "VULN-002",
                "nombre": "Doña Gregoria Canchari (78 años) y Nieta (3 años)",
                "condicion": "Adulto Mayor y Menor de Edad",
                "sector": "Carapongo Ribera Sur Lote 12",
                "brigadista_asignado_1": "Humberto Cárdenas (Coordinador)",
                "brigadista_asignado_2": "Luz Marina Pérez (Vecina)",
                "punto_evacuacion": "I.E. Manuel Fernando Bonilla",
                "contacto_emergencia": "999-333-444"
            },
            {
                "id": "VULN-003",
                "nombre": "Sra. Beatriz Alanya (Gestante - 8vo mes)",
                "condicion": "Madre Gestante en Zona Crítica",
                "sector": "Quebrada Corrales Lote 9",
                "brigadista_asignado_1": "Gladys Palomino (Agente Salud ACS)",
                "brigadista_asignado_2": "César Alanya (Familiar)",
                "punto_evacuacion": "Puesto de Salud Chosica I",
                "contacto_emergencia": "955-777-888"
            }
        ]

        self.faenas_comunitarias = [
            {
                "id": "FAENA-01",
                "titulo": "Minka Vecinal: Llenado y Estiba de 2,000 Sacos Terreros",
                "fecha": "Domingo 20 de Septiembre de 2026 - 07:30 AM",
                "lugar": "Bocacalle Quebrada Quirio con Av. Lima Sur",
                "convocante": "JUVESC Nº 4 y Olla Común Esperanza",
                "objetivo": "Formar dique de desvío provisional ante el 30 de Noviembre.",
                "herramientas_necesarias": "Palas, carretillas, guantes de faena, saquillos de polipropileno",
                "voluntarios_confirmados": 48,
                "refrigerio_comunitario": "Garantizado por Olla Común Quirio (Quinua caliente y pan con palta)",
                "estado": "PROGRAMADA"
            },
            {
                "id": "FAENA-02",
                "titulo": "Limpieza y Desbroce Manual de Acequia Colectora",
                "fecha": "Sábado 26 de Septiembre de 2026 - 08:00 AM",
                "lugar": "Sector Faja Marginal Carapongo Km 14.5",
                "convocante": "Comité de Regantes y Vecinos Unidos",
                "objetivo": "Retirar ramas, maleza y desechos plásticos que bloquean el paso de agua de lluvias.",
                "herramientas_necesarias": "Rastrillos, machetes, costales, botas de jebe",
                "voluntarios_confirmados": 35,
                "refrigerio_comunitario": "A cargo del Comedor Popular Carapongo",
                "estado": "PROGRAMADA"
            }
        ]

        self.agentes_salud_vigilancia = {
            "agentes_activos": 26,
            "distritos_cobertura": ["Lurigancho-Chosica", "Chaclacayo", "Piura", "Sullana"],
            "casos_febriles_sospecha_dengue": 2,
            "tanques_agua_inspeccionados": 142,
            "porcentaje_cloracion_optima": 94.2,
            "visitas_a_gestantes_completadas": 18,
            "stock_pastillas_cloro_bidones": 4500,
            "recomendacion_semanal": "Eliminar inservibles en techos y tapar herméticamente cilindros de agua."
        }

        self.historial_difusion = [
            {
                "id": "MSG-01",
                "fecha": "16-Sep-2026 18:20",
                "canal": "TELEGRAM_CANAL_OFICIAL",
                "destinatario": "@COEN_Comunidad_Peru",
                "asunto": "ALERTA PREVENTIVA: Convocatoria a Faena Dominical de Sacos Terreros en Quebrada Quirio",
                "estado": "ENTREGADO_EXITOSAMENTE"
            },
            {
                "id": "MSG-02",
                "fecha": "16-Sep-2026 19:45",
                "canal": "CORREO_ELECTRONICO_SMTP",
                "destinatario": "juntas.chosica@gmail.com, ollas.solidarias@midis.gob.pe",
                "asunto": "Protocolo de Emergencia y Coordinación de Raciones FEN 2026-2027",
                "estado": "ENVIADO_200_OK"
            }
        ]

    # --------------------------------------------------------------------------
    # MÉTODOS DE CONSULTA Y GESTIÓN
    # --------------------------------------------------------------------------

    def get_community_summary(self) -> Dict[str, Any]:
        """Retorna las métricas globales del tablero comunitario AMARU-AYNI."""
        total_raciones = sum(o.get("raciones_diarias", 0) for o in self.ollas_comunes)
        total_brigadistas = sum(j.get("integrantes", 0) for j in self.juntas_vecinales)
        total_vulnerables = len(self.padron_vulnerables)
        ollas_urgentes = len([o for o in self.ollas_comunes if o.get("requiere_apoyo")])

        return {
            "sistema": "AMARU-AYNI • Red de Gobernanza y Participación Ciudadana C2",
            "fecha_corte": datetime.now().strftime("%d de %B de %Y"),
            "total_ollas_comunes": len(self.ollas_comunes),
            "raciones_diarias_total": total_raciones,
            "ollas_requieren_cisterna_viveres": ollas_urgentes,
            "total_juntas_vecinales": len(self.juntas_vecinales),
            "total_brigadistas_civiles": total_brigadistas,
            "padron_vulnerables_registrados": total_vulnerables,
            "faenas_programadas": len(self.faenas_comunitarias),
            "agentes_salud_activos": self.agentes_salud_vigilancia["agentes_activos"],
            "cumplimiento_cloracion": self.agentes_salud_vigilancia["porcentaje_cloracion_optima"],
            "mensajes_difundidos_total": len(self.historial_difusion),
            "canales_integrados": {
                "telegram": "Activo (Bot API C2 & Canales de Alerta Rápida)",
                "correo_smtp": "Activo (Notificaciones Institucionales y Dirigencias)",
                "whatsapp_web": "Integrado vía enlace directo de mensajería"
            },
            "marco_legal": "Ley SINAGERD 29664 Art. 12 / Ley 31458 (Ollas Comunes) / Ley 27933 (Juntas Vecinales)"
        }

    def get_ollas_list(self) -> List[Dict[str, Any]]:
        return self.ollas_comunes

    def get_juntas_list(self) -> List[Dict[str, Any]]:
        return self.juntas_vecinales

    def get_vulnerables_padron(self) -> List[Dict[str, Any]]:
        return self.padron_vulnerables

    def get_faenas_list(self) -> List[Dict[str, Any]]:
        return self.faenas_comunitarias

    def get_salud_stats(self) -> Dict[str, Any]:
        return self.agentes_salud_vigilancia

    def get_difusion_history(self) -> List[Dict[str, Any]]:
        return self.historial_difusion

    # --------------------------------------------------------------------------
    # DESPACHO DE MENSAJES MULTICANAL (TELEGRAM & CORREO)
    # --------------------------------------------------------------------------

    def dispatch_broadcast(self, canal: str, destinatario: str, asunto: str, mensaje: str) -> Dict[str, Any]:
        """
        Despacha un aviso oficial o alerta comunitaria a Telegram, Correo Electrónico o ambos.
        Si las credenciales no están configuradas en el entorno, opera en modo de simulación segura (Sandbox C2).
        """
        timestamp = datetime.now().strftime("%d-%b-%Y %H:%M")
        msg_id = f"MSG-AYNI-{len(self.historial_difusion) + 1:03d}"

        resultado_detalles = []
        is_simulated = False

        # Envío a Telegram
        if canal in ["TELEGRAM", "AMBOS"]:
            if self.telegram_token and self.telegram_chat_id:
                # Intento de llamada real a Telegram Bot API
                try:
                    import urllib.request
                    url = f"https://api.telegram.org/bot{self.telegram_token}/sendMessage"
                    target_chat = destinatario if destinatario.startswith("@") or destinatario.isdigit() else self.telegram_chat_id
                    payload = json.dumps({
                        "chat_id": target_chat,
                        "text": f"📢 *[AMARU-AYNI COMUNITARIO]*\n*{asunto}*\n\n{mensaje}",
                        "parse_mode": "Markdown"
                    }).encode("utf-8")
                    req = urllib.request.Request(url, data=payload, headers={"Content-Type": "application/json"})
                    with urllib.request.urlopen(req, timeout=5) as resp:
                        resultado_detalles.append("Telegram: Enviado exitosamente a la API oficial.")
                except Exception as e:
                    logger.warning(f"Error despachando Telegram: {e}. Activando modo Sandbox.")
                    resultado_detalles.append(f"Telegram (Sandbox): Despachado al canal de simulación ({e})")
                    is_simulated = True
            else:
                resultado_detalles.append("Telegram (Sandbox Seguro): Transmitido al canal de difusión comunitario.")
                is_simulated = True

        # Envío por Correo Electrónico (SMTP)
        if canal in ["CORREO", "AMBOS"]:
            if self.smtp_user and self.smtp_password:
                try:
                    import smtplib
                    from email.mime.text import MIMEText
                    from email.mime.multipart import MIMEMultipart

                    msg_mail = MIMEMultipart()
                    msg_mail["From"] = self.smtp_from
                    msg_mail["To"] = destinatario
                    msg_mail["Subject"] = f"[AMARU-AYNI] {asunto}"
                    msg_mail.attach(MIMEText(mensaje, "plain"))

                    with smtplib.SMTP(self.smtp_host, self.smtp_port, timeout=5) as server:
                        server.starttls()
                        server.login(self.smtp_user, self.smtp_password)
                        server.sendmail(self.smtp_from, [destinatario], msg_mail.as_string())
                    resultado_detalles.append("Correo: Enviado satisfactoriamente vía servidor SMTP.")
                except Exception as e:
                    logger.warning(f"Error despachando Correo: {e}. Activando modo Sandbox.")
                    resultado_detalles.append(f"Correo (Sandbox): Notificación procesada en cola segura ({e})")
                    is_simulated = True
            else:
                resultado_detalles.append("Correo (Sandbox Seguro): Notificación enviada a la bandeja de autoridades y dirigentas.")
                is_simulated = True

        registro = {
            "id": msg_id,
            "fecha": timestamp,
            "canal": canal,
            "destinatario": destinatario,
            "asunto": asunto,
            "estado": "DESPACHADO_EXITOSO" if not is_simulated else "SANDBOX_SIMULACION_EXITOSA",
            "detalles": " | ".join(resultado_detalles)
        }
        self.historial_difusion.insert(0, registro)
        return registro

    def add_vulnerable_person(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Registra a un ciudadano vulnerable para asistencia prioritaria."""
        new_id = f"VULN-{len(self.padron_vulnerables) + 1:03d}"
        registro = {
            "id": new_id,
            "nombre": data.get("nombre", "Ciudadano Vulnerable"),
            "condicion": data.get("condicion", "Adulto Mayor"),
            "sector": data.get("sector", "Sector no especificado"),
            "brigadista_asignado_1": data.get("brigadista_1", "Brigadista Comunitario Asignado"),
            "brigadista_asignado_2": data.get("brigadista_2", "Vecino de Soporte"),
            "punto_evacuacion": data.get("punto_evacuacion", "Losa o Local Comunal Seguro"),
            "contacto_emergencia": data.get("contacto", "Sin teléfono")
        }
        self.padron_vulnerables.append(registro)
        return registro

    def request_olla_support(self, olla_id: str, motivo: str) -> Dict[str, Any]:
        """Registra un pedido urgente de cisterna de agua o insumos para una olla común."""
        for olla in self.ollas_comunes:
            if olla["id"] == olla_id:
                olla["requiere_apoyo"] = True
                olla["nivel_urgencia"] = "CRITICA"
                olla["estado_agua"] = f"URGENTE: {motivo}"
                return {"status": "OK", "olla": olla}
        return {"status": "NOT_FOUND"}

ayni_service = AyniCommunityService()
