# backend/agents/orchestrator.py
"""
Orquestador Multi-Agente COEN-Digital (Swarm Soberano de Agentes Autónomos AMARU-CLIMATE)
Conforme al estándar SAGF-MC, opera bajo dos planos integrados:

I. PLANO DE GOBERNANZA, INGESTA CONTINUA, INGENIERÍA Y VEEDURÍA:
   • Agente KURAQ: Curador & Centinela de Ingesta Multifuente Soberana (27 Fuentes Oficiales).
   • Agente YUPAQ: Calculador e Ingeniero Científico Soberano (IRCE, IPH, IPI, ISH, Manning, Radar Nowcasting).
   • Agente QILQAY: Escribano Mayor de Fe Pública Estatal (18 Instrumentos SINAGERD & PDF con QR).
   • Agente FISCALIZADOR: Auditoría Presupuestal MEF/SIAF (PP 0068 / FONDES) y Razonabilidad SEACE (Art. 27 Ley 30225).
   • Agente COMUNITARIO: Veeduría Territorial, Crowdsourcing Ciudadano, Filtro Anti-Bulos y Ollas Comunes (Ley 31458).
   • Agente SATELITAL: Teledetección Radar SAR Sentinel-1 (Penetración de Nubes) y Seguro Agrícola Catastrófico (SAC).

II. PLANO SECUENCIAL DE DESPACHO Y ALERTA TEMPRANA EN TIEMPO REAL:
   1. Centinela (Data & Triage Hidrometeorológico 24/7) ->
   2. Memoria Histórica YACHAY (Análogos FEN y Veto Preventivo de Albergues) ->
   3. Táctico (Crisis Assessment, Cálculo BAH R.J. 188 y Maquinaria Pesada) ->
   4. Lingüístico (Traducción Territorial Comunitaria en Quechua y Aymara) ->
   5. Pericial ReNITLI (Fe Pública & Acreditación MINCUL Ley 29735) ->
   6. Despachador (Notification & Audit OASIS CAP v1.2 y Bitácora WORM)
"""
import time
import uuid
from datetime import datetime, timezone
from typing import Optional, List

from agents.schemas import (
    MultiAgentPipelineResponse,
    AgentExecutionTrace,
    TriageResult,
    TacticalAssessment,
    LinguisticMessages,
    ReNITLIForensicTicket,
    DispatchAudit,
    HistoricalAnalogueResult
)
from agents.sentinel_agent import SentinelAgent
from agents.historical_agent import HistoricalAgent, historical_agent
from agents.tactical_agent import TacticalAgent
from agents.linguistic_agent import LinguisticAgent
from agents.renitli_agent import ReNITLIAgent
from agents.dispatcher_agent import DispatcherAgent, AUDIT_LOG_STORE
from agents.kuraq.kuraq_agent import kuraq_agent
from agents.yupaq_agent import yupaq_agent
from agents.qilqay_agent import qilqay_agent
from agents.fiscalizador_agent import agente_fiscalizador
from agents.comunitario_agent import agente_comunitario
from agents.satelital_agent import agente_satelital

kuraq = kuraq_agent
yupaq = yupaq_agent
qilqay = qilqay_agent
fiscalizador = agente_fiscalizador
comunitario = agente_comunitario
satelital = agente_satelital
sentinel = SentinelAgent()
historical = historical_agent
tactical = TacticalAgent()
linguistic = LinguisticAgent()
renitli = ReNITLIAgent()
dispatcher = DispatcherAgent()

async def run_coen_agent_pipeline(
    ubigeo: str,
    force_critical: bool = False
) -> MultiAgentPipelineResponse:
    """
    Ejecuta el pipeline de 6 agentes de IA para un distrito dado.
    """
    t_global_start = time.time()
    t_global_ms = t_global_start * 1000
    now_utc = datetime.now(timezone.utc)
    incident_id = f"INC-{now_utc.strftime('%Y%m%d')}-{uuid.uuid4().hex[:6].upper()}"
    trazas: List[AgentExecutionTrace] = []

    # -------------------------------------------------------------
    # 1. Agente Centinela Hidrometeorológico
    # -------------------------------------------------------------
    t1_start = time.time()
    triage_result: TriageResult = await sentinel.evaluate_ubigeo(ubigeo, force_critical=force_critical)
    t1_elapsed = round((time.time() - t1_start) * 1000, 1)

    trazas.append(AgentExecutionTrace(
        agente="1. Agente Centinela Hidrometeorológico",
        estado="COMPLETADO",
        tiempo_ms=t1_elapsed,
        resumen=f"Nivel {triage_result.nivel_alerta}. {triage_result.criterio_disparo}"
    ))

    # Si no supera el umbral crítico ni se fuerza la alerta, finaliza el pipeline ahorrando llamadas y costos
    if not triage_result.is_critical:
        return MultiAgentPipelineResponse(
            incident_id=incident_id,
            timestamp=datetime.now(timezone.utc).isoformat(),
            ubigeo=ubigeo,
            distrito=triage_result.distrito,
            activacion_critica=False,
            trazabilidad_agentes=trazas,
            triaje=triage_result,
            evaluacion_tactica=None,
            analogo_historico=None,
            mensajes_linguisticos=None,
            peritaje_renitli=None,
            despacho_auditoria=None
        )

    # -------------------------------------------------------------
    # 2. Agente de Memoria Histórica, Análogos FEN y Sabiduría Doctrinal (YACHAY)
    # -------------------------------------------------------------
    t2_start = time.time()
    historical_result: HistoricalAnalogueResult = await historical.assess_history(
        ubigeo=ubigeo,
        triage=triage_result
    )
    t2_elapsed = round((time.time() - t2_start) * 1000, 1)

    trazas.append(AgentExecutionTrace(
        agente="2. Agente de Memoria Histórica y Análogos (YACHAY)",
        estado="COMPLETADO",
        tiempo_ms=t2_elapsed,
        resumen=(
            f"Firma análoga {historical_result.evento_analogo_nombre} ({historical_result.similitud_porcentaje}% similitud). "
            f"Auditados {len(historical_result.memoria_infraestructura_fallas)} nodos de falla y {len(historical_result.cruce_fiscal_obras)} obras MEF."
        )
    ))

    # -------------------------------------------------------------
    # 3. Agente de Evaluación Táctica y Logística
    # -------------------------------------------------------------
    t3_start = time.time()
    tactical_result: TacticalAssessment = await tactical.assess(
        triage=triage_result,
        historical=historical_result
    )
    t3_elapsed = round((time.time() - t3_start) * 1000, 1)

    trazas.append(AgentExecutionTrace(
        agente="3. Agente de Evaluación Táctica y Logística",
        estado="COMPLETADO",
        tiempo_ms=t3_elapsed,
        resumen=f"Impacto estimado: {tactical_result.poblacion_expuesta_estimada} hab. en riesgo. Acción: {tactical_result.accion_operativa_inmediata[:80]}..."
    ))

    # -------------------------------------------------------------
    # 4. Agente Lingüístico Territorial e Inclusivo
    # -------------------------------------------------------------
    t4_start = time.time()
    linguistic_result: LinguisticMessages = await linguistic.translate_and_adapt(triage_result, tactical_result)
    t4_elapsed = round((time.time() - t4_start) * 1000, 1)

    trazas.append(AgentExecutionTrace(
        agente="4. Agente Lingüístico Territorial e Inclusivo",
        estado="COMPLETADO",
        tiempo_ms=t4_elapsed,
        resumen=f"Generadas alertas bilingües en Castellano y {linguistic_result.lengua_nombre}."
    ))

    # -------------------------------------------------------------
    # 5. Agente Pericial ReNITLI (Fe Pública & Acreditación MINCUL)
    # -------------------------------------------------------------
    t5_start = time.time()
    renitli_ticket: ReNITLIForensicTicket = renitli.generate_forensic_ticket(
        linguistic=linguistic_result,
        ubigeo=ubigeo,
        incident_id=incident_id
    )
    t5_elapsed = round((time.time() - t5_start) * 1000, 1)

    trazas.append(AgentExecutionTrace(
        agente="5. Agente Pericial ReNITLI (Fe Pública MINCUL Ley 29735)",
        estado="COMPLETADO",
        tiempo_ms=t5_elapsed,
        resumen=f"Folio pericial: {renitli_ticket.folio_pericial} - Hash SHA-256 verificado. Perito asignado: {renitli_ticket.perito_colegiado_asignado.split('(')[0].strip()}"
    ))

    # -------------------------------------------------------------
    # 6. Agente Despachador y Auditor de Canales (DOS CANALES)
    # -------------------------------------------------------------
    t6_start = time.time()
    audit_result: DispatchAudit = await dispatcher.dispatch_and_audit(
        incident_id=incident_id,
        triage=triage_result,
        tactical=tactical_result,
        linguistic=linguistic_result,
        start_time_ms=t_global_ms
    )
    t6_elapsed = round((time.time() - t6_start) * 1000, 1)

    trazas.append(AgentExecutionTrace(
        agente="6. Agente Despachador y Auditor de Canales",
        estado="COMPLETADO",
        tiempo_ms=t6_elapsed,
        resumen=f"Despachado a 2 canales (Táctico COER y Vecinal). Latencia total del incidente: {audit_result.latencia_ms} ms."
    ))

    return MultiAgentPipelineResponse(
        incident_id=incident_id,
        timestamp=datetime.now(timezone.utc).isoformat(),
        ubigeo=ubigeo,
        distrito=triage_result.distrito,
        activacion_critica=True,
        trazabilidad_agentes=trazas,
        triaje=triage_result,
        evaluacion_tactica=tactical_result,
        analogo_historico=historical_result,
        mensajes_linguisticos=linguistic_result,
        peritaje_renitli=renitli_ticket,
        despacho_auditoria=audit_result
    )

def get_audit_log_history():
    """Retorna el historial de auditoría de despachos de alertas."""
    return AUDIT_LOG_STORE
