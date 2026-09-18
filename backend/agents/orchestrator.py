# backend/agents/orchestrator.py
"""
Orquestador Multi-Agente COEN-Digital
Coordina secuencialmente la cadena de ejecución de los 4 agentes de IA:
1. Centinela (Data & Triage) ->
2. Táctico (Crisis Assessment) ->
3. Lingüístico (Cultural & Dispatch) ->
4. Despachador (Notification & Feedback / Audit)
"""
import time
import uuid
from datetime import datetime
from typing import Optional, List

from agents.schemas import (
    MultiAgentPipelineResponse,
    AgentExecutionTrace,
    TriageResult,
    TacticalAssessment,
    LinguisticMessages,
    DispatchAudit
)
from agents.sentinel_agent import SentinelAgent
from agents.tactical_agent import TacticalAgent
from agents.linguistic_agent import LinguisticAgent
from agents.dispatcher_agent import DispatcherAgent, AUDIT_LOG_STORE

sentinel = SentinelAgent()
tactical = TacticalAgent()
linguistic = LinguisticAgent()
dispatcher = DispatcherAgent()

async def run_coen_agent_pipeline(
    ubigeo: str,
    force_critical: bool = False
) -> MultiAgentPipelineResponse:
    """
    Ejecuta el pipeline de agentes de IA para un distrito dado.
    """
    t_global_start = time.time()
    t_global_ms = t_global_start * 1000
    incident_id = f"INC-{datetime.utcnow().strftime('%Y%m%d')}-{uuid.uuid4().hex[:6].upper()}"
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
            timestamp=datetime.utcnow().isoformat() + "Z",
            ubigeo=ubigeo,
            distrito=triage_result.distrito,
            activacion_critica=False,
            trazabilidad_agentes=trazas,
            triaje=triage_result,
            evaluacion_tactica=None,
            mensajes_linguisticos=None,
            despacho_auditoria=None
        )

    # -------------------------------------------------------------
    # 2. Agente de Evaluación Táctica y Logística
    # -------------------------------------------------------------
    t2_start = time.time()
    tactical_result: TacticalAssessment = await tactical.assess(triage_result)
    t2_elapsed = round((time.time() - t2_start) * 1000, 1)

    trazas.append(AgentExecutionTrace(
        agente="2. Agente de Evaluación Táctica y Logística",
        estado="COMPLETADO",
        tiempo_ms=t2_elapsed,
        resumen=f"Impacto estimado: {tactical_result.poblacion_expuesta_estimada} hab. en riesgo. Acción: {tactical_result.accion_operativa_inmediata[:80]}..."
    ))

    # -------------------------------------------------------------
    # 3. Agente Lingüístico Territorial e Inclusivo
    # -------------------------------------------------------------
    t3_start = time.time()
    linguistic_result: LinguisticMessages = await linguistic.translate_and_adapt(triage_result, tactical_result)
    t3_elapsed = round((time.time() - t3_start) * 1000, 1)

    trazas.append(AgentExecutionTrace(
        agente="3. Agente Lingüístico Territorial e Inclusivo",
        estado="COMPLETADO",
        tiempo_ms=t3_elapsed,
        resumen=f"Generadas alertas bilingües en Castellano y {linguistic_result.lengua_nombre}."
    ))

    # -------------------------------------------------------------
    # 4. Agente Despachador y Auditor de Canales (DOS CANALES)
    # -------------------------------------------------------------
    t4_start = time.time()
    audit_result: DispatchAudit = await dispatcher.dispatch_and_audit(
        incident_id=incident_id,
        triage=triage_result,
        tactical=tactical_result,
        linguistic=linguistic_result,
        start_time_ms=t_global_ms
    )
    t4_elapsed = round((time.time() - t4_start) * 1000, 1)

    trazas.append(AgentExecutionTrace(
        agente="4. Agente Despachador y Auditor de Canales",
        estado="COMPLETADO",
        tiempo_ms=t4_elapsed,
        resumen=f"Despachado a 2 canales (Táctico COER y Vecinal). Latencia total del incidente: {audit_result.latencia_ms} ms."
    ))

    return MultiAgentPipelineResponse(
        incident_id=incident_id,
        timestamp=datetime.utcnow().isoformat() + "Z",
        ubigeo=ubigeo,
        distrito=triage_result.distrito,
        activacion_critica=True,
        trazabilidad_agentes=trazas,
        triaje=triage_result,
        evaluacion_tactica=tactical_result,
        mensajes_linguisticos=linguistic_result,
        despacho_auditoria=audit_result
    )

def get_audit_log_history():
    """Retorna el historial de auditoría de despachos de alertas."""
    return AUDIT_LOG_STORE
