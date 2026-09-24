# backend/agents/tactical_agent.py
"""
Agente 2: Agente de Evaluación Táctica y Logística (Crisis Assessment Agent)
Cruza las coordenadas y telemetría de emergencia con capas territoriales del INEI (habitantes y faja marginal),
infraestructura vial crítica (MTC) y catálogo de maquinaria de Defensa Civil.
Genera el Boletín Situacional Técnico Oficial del COEN.
"""
import os
import json
from typing import Dict, Any, Optional, List
from agents.schemas import TriageResult, TacticalAssessment, CriticalResource, HistoricalAnalogueResult
from services.tools.territorial_tools import (
    query_exposed_population,
    check_critical_infrastructure,
    locate_emergency_machinery
)
from services.model_adapter import model_adapter

class TacticalAgent:
    def __init__(self):
        self.name = "Agente de Evaluación Táctica y Logística"

    async def assess(
        self,
        triage: TriageResult,
        historical: Optional[HistoricalAnalogueResult] = None
    ) -> TacticalAssessment:
        ubigeo = triage.ubigeo
        
        # 1. Ejecución de herramientas (Tools/Function Calling) territoriales
        pop_info = query_exposed_population(ubigeo)
        infra_info = check_critical_infrastructure(ubigeo)
        machinery_info = locate_emergency_machinery(pop_info.get("departamento", "Lima"))

        # 2. Generación táctica con enjaulamiento cognitivo (ModelAdapter)
        # Contexto de memoria histórica si el Agente YACHAY proveyó evaluación
        hist_context = ""
        if historical:
            hist_context = f"""
        - Evento Análogo Histórico: {historical.evento_analogo_nombre} (Similitud: {historical.similitud_porcentaje}%)
        - Lección Doctrinal Previa: {historical.leccion_historica_clave}
        - Nodos de Falla y Puentes Críticos: {json.dumps(historical.memoria_infraestructura_fallas)}
        - Advertencia de Albergues Inundables: {json.dumps(historical.memoria_social_albergues)}
            """

        prompt = f"""
        Eres el Oficial Superior de Operaciones Tácticas del COEN (Centro de Operaciones de Emergencia Nacional del Perú).
        Genera una evaluación técnica estructurada y boletín oficial con los siguientes datos del incidente:

        - Distrito: {triage.distrito} (UBIGEO: {ubigeo})
        - Cuenca: {triage.cuenca}
        - Nivel de Alerta: {triage.nivel_alerta}
        - Lluvia 24h: {triage.telemetria.precipitation_24h} mm
        - Humedad de suelo profundo: {triage.telemetria.soil_moisture}%
        - Caudal de río/quebrada: {triage.telemetria.river_flow} m³/s
        - Población expuesta en faja marginal (INEI): {pop_info.get('poblacion_expuesta_estimada')} habitantes ({pop_info.get('familias_en_faja_marginal')} familias)
        - Vías de comunicación en riesgo: {json.dumps(infra_info.get('vias_comprometidas'))}
        - Maquinaria disponible COER: {json.dumps(machinery_info)}
        {hist_context}

        Responde en formato JSON estricto con las siguientes claves:
        {{
            "accion_operativa_inmediata": "Acción inmediata táctica y logística específica",
            "boletin_tecnico_oficial": "Texto completo del Boletín Situacional Oficial COEN con tono técnico militar/doctrina INDECI"
        }}
        """

        advertencia_historica = ""
        if historical and historical.memoria_infraestructura_fallas:
            primer_nodo = historical.memoria_infraestructura_fallas[0]
            advertencia_historica = f" ALERTA HISTÓRICA: Monitorear {primer_nodo.get('nombre', 'puente crítico')} por antecedente de colapso en {historical.evento_analogo_nombre}."

        accion_inmediata = f"Cierre preventivo de tránsito en {infra_info.get('vias_comprometidas', ['vías'])[0]} y despliegue de maquinaria pesada a puntos críticos de la cuenca {triage.cuenca}.{advertencia_historica}"
        
        hist_boletin_extra = ""
        if historical:
            hist_boletin_extra = (
                f"\nPRECEDENTE HISTÓRICO Y DOCTRINA (AGENTE YACHAY): "
                f"Firma análoga a {historical.evento_analogo_nombre} ({historical.similitud_porcentaje}% similitud). "
                f"{historical.recomendacion_doctrinal}"
            )

        boletin = (
            f"BOLETÍN SITUACIONAL COEN-OFICIAL N° 048-2026/COEN-INDECI.\n"
            f"ZONA: {triage.distrito.upper()} - {triage.cuenca.upper()}.\n"
            f"SITUACIÓN: Nivel {triage.nivel_alerta} por activación hidrológica crítica. "
            f"Se registra precipitación acumulada de {triage.telemetria.precipitation_24h} mm y saturación edáfica al {triage.telemetria.soil_moisture}%.\n"
            f"IMPACTO ESTIMADO: {pop_info.get('poblacion_expuesta_estimada')} personas en faja marginal. Riesgo inminente de huaicos e interrupción vial.\n"
            f"DISPOSICIÓN: Activar de inmediato Centro de Operaciones de Emergencia Local (COEL), evacuar a los albergues habilitados y movilizar maquinaria pesada."
            f"{hist_boletin_extra}"
        )

        try:
            res_json = await model_adapter.generate_json(prompt)
            if "accion_operativa_inmediata" in res_json:
                accion_inmediata = res_json["accion_operativa_inmediata"]
            if "boletin_tecnico_oficial" in res_json:
                boletin = res_json["boletin_tecnico_oficial"]
        except Exception as e:
            print(f"[{self.name}] Utilizando generador táctico base estructurado: {e}")

        # Construcción de recursos críticos formateados
        recursos = [
            CriticalResource(tipo=m["tipo"], cantidad=m["cantidad"], estado=m.get("estado", "DISPONIBLE"))
            for m in machinery_info
        ]

        return TacticalAssessment(
            ubigeo=ubigeo,
            distrito=triage.distrito,
            cuenca=triage.cuenca,
            poblacion_expuesta_estimada=pop_info.get("poblacion_expuesta_estimada", 3500),
            familias_en_faja_marginal=pop_info.get("familias_en_faja_marginal", 700),
            vias_comprometidas=infra_info.get("vias_comprometidas", []),
            centros_salud_en_riesgo=infra_info.get("centros_salud_en_riesgo", []),
            maquinaria_recomendada=recursos,
            albergues_recomendados=infra_info.get("albergues_recomendados", []),
            accion_operativa_inmediata=accion_inmediata,
            boletin_tecnico_oficial=boletin
        )
