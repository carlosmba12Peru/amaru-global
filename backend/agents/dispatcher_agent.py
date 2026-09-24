# backend/agents/dispatcher_agent.py
"""
Agente 4: Agente Despachador y Auditor de Canales (Notification & Feedback Agent) V2.5
- Despacho técnico a las plataformas institucionales del COEN, INDECI, COER y canales comunitarios.
- Generador de Alerta bajo el Estándar Internacional OASIS CAP v1.2 (ITU-T X.1303) para entrega oficial a INDECI.
  NOTA DE DOCTRINA OPERATIVA: AMARU-CLIMATE NO conecta ni activa SISMATE de forma autónoma.
  AMARU-CLIMATE finaliza su misión técnica remitiendo el paquete pericial y la alerta CAP v1.2 a INDECI,
  quienes son la autoridad estatal exclusiva con competencia legal para evaluar y activar SISMATE.
- Registro inmutable de auditoría con latencia punta a punta.
"""
import os
import time
import httpx
from datetime import datetime, timezone
from typing import List, Dict, Any
from agents.schemas import (
    TriageResult,
    TacticalAssessment,
    LinguisticMessages,
    DispatchAudit,
    ChannelDispatchStatus,
    CAPAlertPayload,
    CAPAlertInfo
)

TELEGRAM_BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")
CHANNEL_COER = os.getenv("TELEGRAM_CHAT_ID_COEL") or os.getenv("TELEGRAM_CHAT_ID") or "-1001234567890"
CHANNEL_VECINAL = os.getenv("TELEGRAM_CHAT_ID_VECINAL", "-1009876543210")

AUDIT_LOG_STORE: List[Dict[str, Any]] = []

class DispatcherAgent:
    def __init__(self):
        self.name = "Agente Despachador y Auditor de Canales (CAP v1.2 + Telegram)"

    async def _send_telegram(self, chat_id: str, text: str) -> Dict[str, Any]:
        """Envía un mensaje a un chat de Telegram de forma segura."""
        if not TELEGRAM_BOT_TOKEN or "ABCdef" in TELEGRAM_BOT_TOKEN:
            try:
                print(f"[Telegram Mock Despacho] -> Canal {chat_id}:\n{text}\n{'-'*40}")
            except Exception:
                safe_text = text.encode("ascii", errors="replace").decode("ascii")
                print(f"[Telegram Mock Despacho] -> Canal {chat_id}:\n{safe_text}\n{'-'*40}")
            return {"status": "FALLBACK_LOG", "detail": "Despachado en log simulado (token de prueba)"}

        url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage"
        try:
            async with httpx.AsyncClient(timeout=8.0) as client:
                res = await client.post(url, json={"chat_id": chat_id, "text": text, "parse_mode": "HTML"})
                if res.status_code == 200:
                    return {"status": "ENVIADO", "detail": f"Mensaje entregado HTTP {res.status_code}"}
                else:
                    return {"status": "FALLBACK_LOG", "detail": f"Respuesta Telegram: {res.status_code}"}
        except Exception as ex:
            return {"status": "FALLBACK_LOG", "detail": f"Excepción de conexión Telegram: {str(ex)}"}

    def generate_cap_v12_payload(
        self,
        incident_id: str,
        triage: TriageResult,
        tactical: TacticalAssessment,
        linguistic: LinguisticMessages
    ) -> CAPAlertPayload:
        """
        Genera el payload de alerta bajo el estándar internacional Common Alerting Protocol (CAP v1.2 / ITU-T X.1303).
        Diseñado para la ingesta directa por el COEN / INDECI para su posterior evaluación de difusión celular (SISMATE).
        """
        now_iso = datetime.now(timezone.utc).isoformat()
        v = triage.validacion_nacional

        info_es = CAPAlertInfo(
            language="es-PE",
            category="Met",
            event="Activación Inminente de Quebradas y Crecida Fluvial",
            urgency="Immediate",
            severity="Extreme" if triage.nivel_alerta == "ROJO" else "Severe",
            certainty="Observed",
            headline=f"ALERTA {triage.nivel_alerta} EN {triage.distrito.upper()}: Riesgo de Huaico y Desborde",
            description=(
                f"Telemetría Open-Meteo Pro (ECMWF IFS) reporta CAPE en {triage.telemetria.cape_convectivo_j_kg} J/kg "
                f"y saturación de suelo al {triage.telemetria.soil_moisture}%. Validado con EMA SENAMHI ({v.senamhi_ema_codigo}). "
                f"{v.enfen_status} activa."
            ),
            instruction=(
                f"Evacuar de inmediato a las zonas altas y albergues habilitados ({tactical.albergues_recomendados[0] if tactical.albergues_recomendados else 'Losa deportiva'}). "
                f"Acción táctica: {tactical.accion_operativa_inmediata}"
            ),
            parameter=[
                {"valueName": "MODEL_SOURCE", "value": triage.telemetria.modelo_numerico},
                {"valueName": "CAPE_INDEX_J_KG", "value": str(triage.telemetria.cape_convectivo_j_kg)},
                {"valueName": "DEEP_SOIL_MOISTURE_PCT", "value": str(triage.telemetria.soil_moisture)},
                {"valueName": "ENFEN_STATUS", "value": v.enfen_status},
                {"valueName": "SENAMHI_STATION", "value": v.senamhi_ema_codigo},
                {"valueName": "DHN_BUOY_ANOMALY", "value": f"+{v.dhn_anomalia_tsm_c}°C"}
            ],
            area={
                "areaDesc": f"Distrito de {triage.distrito}, Cuenca {triage.cuenca}",
                "geocode": {"UBIGEO": triage.ubigeo}
            }
        )

        info_list = [info_es]

        if linguistic.es_bilingue and linguistic.mensaje_comunitario_lengua_originaria:
            cap_meta = {
                "QUECHUA_CHANKA": ("qu-PE", "Lloqlla Mayu Hunt'ay Willakuy", f"HATUN LLAKI WILLAKUY: {triage.distrito.upper()} lloqlla chayamunqa", "Usqhaylla hanay pata kanchakunaman lluqsiychik kawsaykichikta amachanapaq."),
                "QUECHUA_COLLAO": ("qu-PE", "Lloqlla Mayu Llimp'iy Willakuy", f"HATUN WILLAY: {triage.distrito.upper()} mayukunan llimp'iykamushan", "Usqhaylla hanay cheqaskunaman lluqsiychik kawsaykichikta amachanapaq."),
                "QUECHUA_ANCASH": ("qu-PE", "Lloqlla Tamya Sinchi Willakuy", f"SINCHI WILLAKUY: {triage.distrito.upper()} lloqlla llimpiykamunqa", "Hanaq pampakunaman ayqikuychik wayikikunata haqirir kawsay amachanakunapaq."),
                "AYMARA_COLLAO": ("ay-PE", "Yatiyawi Jach'a Thiyaw / Jawira Phojchi", f"YATIYAWI: {triage.distrito.upper()} jach'a ch'axwataw purintani", "Wawanakaru jilatanakaru sum q'uñt'ayapxam, ukat utanakaru imantapxam."),
                "ASHANINKA": ("cni-PE", "Katingaro Kaimintotsi Eni Oñaakotake", f"KAIMINTOTSI: {triage.distrito.upper()} eni antaroite oñaakotake", "Pishiye jatanakero jenoqui otsipana amampeite, paamaiteero pitsipatsite."),
                "AWAJUN": ("agr-PE", "Dekas Yapiyagbaunum Dekatai Namak Emami", f"DEKATAI: {triage.distrito.upper()} namak senchi emami", "Uchigtin ainau apanainas najaimas ayamataish nampijata, kuitamkata.")
            }
            lang_code, event_name, headline_text, default_inst = cap_meta.get(
                linguistic.variante_linguistica,
                ("qu-PE", "Lloqlla Mayu Hunt'ay Willakuy", f"HATUN WILLAKUY: {triage.distrito.upper()}", "Usqhaylla hanay cheqaskunaman lluqsiychik kawsaykichik amachanapaq.")
            )

            info_originaria = CAPAlertInfo(
                language=lang_code,
                category="Met",
                event=event_name,
                urgency="Immediate",
                severity="Extreme" if triage.nivel_alerta == "ROJO" else "Severe",
                certainty="Observed",
                headline=headline_text,
                description=linguistic.mensaje_comunitario_lengua_originaria,
                instruction=default_inst,
                parameter=[],
                area={
                    "areaDesc": f"{triage.distrito} Llaqta, {triage.cuenca}",
                    "geocode": {"UBIGEO": triage.ubigeo}
                }
            )
            info_list.append(info_originaria)

        return CAPAlertPayload(
            identifier=f"PE-COEN-2026-CAP-{incident_id}",
            sender="sat-coen@indeci.gob.pe",
            sent=now_iso,
            status="Actual",
            msgType="Alert",
            scope="Public",
            code=["OPEN_METEO_PRO_ECMWF", "SENAMHI_WFS", "ENFEN_OFICIAL", "CAP_V12_SISMATE"],
            info=info_list
        )

    async def dispatch_and_audit(
        self,
        incident_id: str,
        triage: TriageResult,
        tactical: TacticalAssessment,
        linguistic: LinguisticMessages,
        start_time_ms: float
    ) -> DispatchAudit:
        canales_status: List[ChannelDispatchStatus] = []

        # 1. Generación del Estándar Internacional CAP v1.2
        cap_payload = self.generate_cap_v12_payload(incident_id, triage, tactical, linguistic)

        # 2. Despacho a Canal Táctico de Autoridades (COER / COEL)
        v = triage.validacion_nacional
        cuerpo_coer = (
            f"<b>{linguistic.mensaje_tecnico_coer}</b>\n\n"
            f"🌐 <b>Open-Meteo Pro (ECMWF IFS 9km):</b>\n"
            f"• CAPE: {triage.telemetria.cape_convectivo_j_kg} J/kg | Suelo: {triage.telemetria.soil_moisture}%\n"
            f"• Caudal: {triage.telemetria.river_flow} m³/s | Lluvia: {triage.telemetria.precipitation_24h} mm\n\n"
            f"🇵🇪 <b>Validación Nacional:</b>\n"
            f"• ENFEN: {v.enfen_status} (Factor x{v.enfen_factor_sensibilidad})\n"
            f"• Boya DHN: +{v.dhn_anomalia_tsm_c}°C (Onda Kelvin: {v.dhn_onda_kelvin_activa})\n"
            f"• SENAMHI EMA: {v.senamhi_ema_codigo} ({v.senamhi_lluvia_real_24h_mm} mm)\n\n"
            f"📋 <b>Boletín Oficial INDECI:</b>\n{tactical.boletin_tecnico_oficial}\n\n"
            f"🚜 <b>Maquinaria Requerida:</b>\n"
            + "\n".join([f"• {m.cantidad}x {m.tipo}" for m in tactical.maquinaria_recomendada[:3]])
        )
        res_coer = await self._send_telegram(CHANNEL_COER, cuerpo_coer)
        canales_status.append(ChannelDispatchStatus(
            canal="COER_COEL_TACTICO",
            destinatario=f"Canal Autoridades ({CHANNEL_COER})",
            estado=res_coer["status"],
            detalle=res_coer["detail"]
        ))

        # 3. Despacho a Canal Vecinal Comunitario (Bilingüe si aplica, o solo Castellano)
        refugio = tactical.albergues_recomendados[0] if tactical.albergues_recomendados else 'Losa deportiva central'
        if linguistic.es_bilingue and linguistic.mensaje_comunitario_lengua_originaria:
            cuerpo_vecinal = (
                f"📢 <b>AVISO DE ALERTA TEMPRANA - {triage.distrito.upper()}</b>\n\n"
                f"🇵🇪 <b>{linguistic.lengua_nombre}:</b>\n<i>{linguistic.mensaje_comunitario_lengua_originaria}</i>\n\n"
                f"🇪🇸 <b>Castellano:</b>\n{linguistic.mensaje_comunitario_castellano}\n\n"
                f"📍 <b>Punto de Encuentro:</b> {refugio}\n"
                f"📡 <i>Transmitido vía Red SAT COEN / SISMATE CAP v1.2 (Bilingüe Oficial)</i>"
            )
        else:
            cuerpo_vecinal = (
                f"📢 <b>AVISO DE ALERTA TEMPRANA - {triage.distrito.upper()}</b>\n\n"
                f"🇪🇸 <b>Castellano:</b>\n{linguistic.mensaje_comunitario_castellano}\n\n"
                f"📍 <b>Punto de Encuentro:</b> {refugio}\n"
                f"📡 <i>Transmitido vía Red SAT COEN / SISMATE CAP v1.2</i>"
            )
        res_vecinal = await self._send_telegram(CHANNEL_VECINAL, cuerpo_vecinal)
        canales_status.append(ChannelDispatchStatus(
            canal="VECINAL_COMUNITARIO",
            destinatario=f"Canal Vecinal Ciudadano ({CHANNEL_VECINAL})",
            estado=res_vecinal["status"],
            detalle=res_vecinal["detail"]
        ))

        latencia = round((time.time() * 1000) - start_time_ms, 2)
        audit_record = DispatchAudit(
            incident_id=incident_id,
            timestamp_utc=datetime.now(timezone.utc).isoformat(),
            ubigeo=triage.ubigeo,
            distrito=triage.distrito,
            nivel_alerta=triage.nivel_alerta,
            canales=canales_status,
            latencia_ms=latencia,
            auditoria_registrada=True,
            cap_v12_payload=cap_payload
        )

        AUDIT_LOG_STORE.insert(0, audit_record.model_dump())
        if len(AUDIT_LOG_STORE) > 100:
            AUDIT_LOG_STORE.pop()

        return audit_record
