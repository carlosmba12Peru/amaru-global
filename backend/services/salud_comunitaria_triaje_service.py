"""
Servicio Backend: salud_comunitaria_triaje_service.py
Gestión de Triaje Médico Preventivo bajo la Norma Técnica NTS-105 MINSA
y Vigilancia Epidemiológica de Vectores (Dengue, Leptospirosis, Malaria, EDAs)
operada por Agentes Comunitarios de Salud (ACS MINSA) en el COED Social AMARU.
"""

import json
import hashlib
import uuid
from typing import Dict, List
from datetime import datetime, timezone

# Registro en memoria de atenciones de triaje NTS-105
BD_TRIAJE_MINSA: Dict[str, Dict] = {}

class SaludComunitariaTriajeService:
    """
    Servicio encendido para procesar códigos CUP-MINSA y clasificar urgencias clínicas post-desastre.
    """

    @classmethod
    def procesar_triaje_nts105(
        cls,
        cup_code: str,
        ubigeo: str,
        sintomas: List[str],
        es_vulnerable: bool = False,
        edad_anios: int = 30
    ) -> Dict:
        """
        Clasifica al paciente o familia según la Norma Técnica de Salud NTS-105 MINSA.
        Retorna la prioridad clínica y las recomendaciones inmediatas.
        """
        sintomas_graves = ["DIFICULTAD_RESPIRATORIA", "FIEBRE_ALTA_PERSISTENTE", "DESHIDRATACION_SEVERA", "TRAUMATISMO_GRAVE"]
        es_emergencia = any(s in sintomas_graves for s in sintomas) or (es_vulnerable and len(sintomas) >= 2)

        if es_emergencia:
            prioridad = "PRIORIDAD_I_EMERGENCIA_VITAL"
            color_semaforo = "RED"
            accion = "Evacuación médica inmediata a Puesto de Salud o Hospital de Campaña MINSA."
        elif len(sintomas) >= 2 or es_vulnerable:
            prioridad = "PRIORIDAD_II_URGENCIA_MAYOR"
            color_semaforo = "ORANGE"
            accion = "Atención prioritaria por Agente Comunitario de Salud (ACS) en albergue."
        else:
            prioridad = "PRIORIDAD_III_PACIENTE_LEVE"
            color_semaforo = "YELLOW"
            accion = "Monitoreo ambulatorio y entrega de kit de agua segura y rehidratación."

        ticket_triaje = {
            "ticket_id": f"TRJ-{uuid.uuid4().hex[:6].upper()}",
            "cup_code_zero_pii": cup_code,
            "ubigeo": ubigeo,
            "fecha_atencion": datetime.now(timezone.utc).isoformat(),
            "evaluacion_nts105": {
                "prioridad": prioridad,
                "color_semaforo": color_semaforo,
                "accion_inmediata": accion,
                "requiere_traslado": es_emergencia
            },
            "sintomas_registrados": sintomas,
            "es_vulnerable": es_vulnerable,
            "edad_anios": edad_anios,
            "estado_atencion": "REGISTRADO_PENDIENTE_ACS"
        }

        BD_TRIAJE_MINSA[ticket_triaje["ticket_id"]] = ticket_triaje
        return ticket_triaje

    @classmethod
    def calcular_indice_riesgo_epidemiologico(cls, ubigeo: str, temperatura_c: float = 28.5, dias_agua_estancada: int = 5) -> Dict:
        """
        Calcula el Índice de Riesgo Epidemiológico (IRE) para brotes de vectores post-inundación.
        """
        # Algoritmo paramétrico: IRE = (Temp / 30) * 0.4 + (DiasAgua / 10) * 0.6
        ire_score = min(1.0, (temperatura_c / 30.0) * 0.4 + (dias_agua_estancada / 10.0) * 0.6)
        
        if ire_score >= 0.75:
            alerta = "ALERTA_BROTE_ALTO_DENGUE_LEPTOSPIROSIS"
            nivel = "CRITICO"
        elif ire_score >= 0.45:
            alerta = "ALERTA_MODERADA_VECTORES"
            nivel = "MODERADO"
        else:
            alerta = "BAJO_RIESGO"
            nivel = "ESTABLE"

        return {
            "ubigeo": ubigeo,
            "indice_riesgo_epidemiologico_ire": round(ire_score, 2),
            "nivel_alerta": alerta,
            "nivel_gravedad": nivel,
            "factores_riesgo": {
                "temperatura_ambiente_c": temperatura_c,
                "dias_acumulado_agua_estancada": dias_agua_estancada
            },
            "recomendaciones_acs": [
                "Abatización y control larvario en comedores y albergues.",
                "Distribución de pastillas de cloro para consumo de agua segura.",
                "Jornada de fumigación selectiva con brigadas del MINSA."
            ],
            "fecha_calculo": datetime.now(timezone.utc).isoformat()
        }
