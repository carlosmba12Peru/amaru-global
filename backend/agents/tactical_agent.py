# backend/agents/tactical_agent.py
"""
Agente 2: Agente de Evaluación Táctica y Logística (Crisis Assessment Agent)
Cruza las coordenadas y telemetría de emergencia con capas territoriales del INEI (habitantes y faja marginal),
infraestructura vial crítica (MTC) y catálogo de maquinaria de Defensa Civil.
Genera el Boletín Situacional Técnico Oficial del COEN.
"""
import os
import json
from typing import Dict, Any
import google.generativeai as genai

from agents.schemas import TriageResult, TacticalAssessment, CriticalResource
from services.tools.territorial_tools import (
    query_exposed_population,
    check_critical_infrastructure,
    locate_emergency_machinery
)

# Configuración con Google AI Studio
API_KEY = os.getenv("GOOGLE_GEMINI_API_KEY") or os.getenv("GEMINI_API_KEY")
if API_KEY:
    try:
        genai.configure(api_key=API_KEY)
    except Exception:
        pass

class TacticalAgent:
    def __init__(self):
        self.name = "Agente de Evaluación Táctica y Logística"
        self.model_name = "gemini-1.5-flash"

    async def assess(self, triage: TriageResult) -> TacticalAssessment:
        ubigeo = triage.ubigeo
        
        # 1. Ejecución de herramientas (Tools/Function Calling) territoriales
        pop_info = query_exposed_population(ubigeo)
        infra_info = check_critical_infrastructure(ubigeo)
        machinery_info = locate_emergency_machinery(pop_info.get("departamento", "Lima"))

        # 2. Generación o razonamiento con Gemini 1.5
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

        Responde en formato JSON estricto con las siguientes claves:
        {{
            "accion_operativa_inmediata": "Acción inmediata táctica y logística específica",
            "boletin_tecnico_oficial": "Texto completo del Boletín Situacional Oficial COEN con tono técnico militar/doctrina INDECI"
        }}
        """

        accion_inmediata = f"Cierre preventivo de tránsito en {infra_info.get('vias_comprometidas', ['vías'])[0]} y despliegue de maquinaria pesada a puntos críticos de la cuenca {triage.cuenca}."
        boletin = (
            f"BOLETÍN SITUACIONAL COEN-OFICIAL N° 048-2026/COEN-INDECI.\n"
            f"ZONA: {triage.distrito.upper()} - {triage.cuenca.upper()}.\n"
            f"SITUACIÓN: Nivel {triage.nivel_alerta} por activación hidrológica crítica. "
            f"Se registra precipitación acumulada de {triage.telemetria.precipitation_24h} mm y saturación edáfica al {triage.telemetria.soil_moisture}%.\n"
            f"IMPACTO ESTIMADO: {pop_info.get('poblacion_expuesta_estimada')} personas en faja marginal. Riesgo inminente de huaicos e interrupción vial.\n"
            f"DISPOSICIÓN: Activar de inmediato Centro de Operaciones de Emergencia Local (COEL), evacuar a los albergues habilitados y movilizar maquinaria pesada."
        )

        if API_KEY:
            try:
                model = genai.GenerativeModel(self.model_name)
                response = model.generate_content(
                    prompt,
                    generation_config={"response_mime_type": "application/json"}
                )
                res_json = json.loads(response.text)
                if "accion_operativa_inmediata" in res_json:
                    accion_inmediata = res_json["accion_operativa_inmediata"]
                if "boletin_tecnico_oficial" in res_json:
                    boletin = res_json["boletin_tecnico_oficial"]
            except Exception as e:
                # Log de fallback sin interrumpir el flujo del pipeline
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
