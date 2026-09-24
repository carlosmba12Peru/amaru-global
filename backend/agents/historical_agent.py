# backend/agents/historical_agent.py
"""
Agente 2: Agente de Memoria Histórica, Análogos FEN y Sabiduría Doctrinal (Agente YACHAY)
Componente Soberano del Swarm AMARU-CLIMATE.

Rol Único:
Es el único agente con memoria temporal e institucional profunda.
Cruza la telemetría viva contra 4 décadas de catástrofes documentadas
(Niño 1983, 1998, Costero 2017, Ciclón Yaku 2023) y ALIMENTA DE FORMA TRANSVERSAL
a las tres vertientes del sistema:
1. Vertiente Climática/Física: Pattern-matching análogo, factor amplificador FEN y memoria de quebradas ciegas.
2. Vertiente de Gestión Pública/Fiscal: Memoria de puentes y bocatomas CAF colapsados, y cruce de obras MEF trabadas (Art. 377 CP).
3. Vertiente Social/Comunitaria: Historial de caseríos aislados, colegios históricamente inundables y bioindicadores ancestrales (Yachay).
"""
import time
from typing import Dict, Any, List, Optional
from datetime import datetime, timezone

from agents.schemas import (
    TriageResult,
    HistoricalAnalogueResult,
    QuebradaAlerta
)
from services.historical_analog_engine import analog_engine
from services.historical_data_service import historical_service
from services.historical_failure_nodes_service import HistoricalFailureNodesService
from services.mef_obras_service import mef_obras_service

failure_nodes_service = HistoricalFailureNodesService()

# Bioindicadores ancestrales de la cuenca (Sabiduría Milenaria Yachay)
BIOINDICADORES_CUENCAS: Dict[str, List[Dict[str, Any]]] = {
    "Río Piura": [
        {"indicador": "Floración masiva del algarrobo en época atípica", "significado": "Precursor ancestral de año pluvioso extraordinario / Niño", "certeza": "ALTA"},
        {"indicador": "Presencia inusual de piqueros y aves guaneras en tierra firme", "significado": "Calentamiento anómalo del mar (TSM > 26°C) y migración de cardumen", "certeza": "MUY_ALTA"}
    ],
    "Río Tumbes": [
        {"indicador": "Proliferación masiva de grillos y anfibios en zonas áridas", "significado": "Incremento de humedad freática y proximidad de lluvias torrenciales", "certeza": "ALTA"}
    ],
    "Río La Leche": [
        {"indicador": "Reverdecimiento precoz de lomas y matorrales secos", "significado": "Saturación temprana de suelos por neblinas cálidas ecuatoriales", "certeza": "MEDIA_ALTA"}
    ],
    "Río Rímac": [
        {"indicador": "Canto nocturno prolongado de sapos en riberas altas", "significado": "Aumento brusco de humedad relativa y proximidad de huayco en quebradas", "certeza": "ALTA"}
    ],
    "Altiplano Puno": [
        {"indicador": "Comportamiento inquieto y anidación baja del ave Lequecho", "significado": "Año de heladas severas y sequía en el ciclo agrícola andino", "certeza": "MUY_ALTA"}
    ]
}


class HistoricalAgent:
    """
    Agente YACHAY de Memoria Histórica, Análogos Atmosféricos y Doctrina Operativa.
    """

    def __init__(self):
        self.nombre = "Agente de Memoria Histórica y Análogos (YACHAY)"
        self.rol = "Master Historical Memory & Cross-Domain Precedent Engine"

    async def assess_history(
        self,
        ubigeo: str,
        triage: Optional[TriageResult] = None
    ) -> HistoricalAnalogueResult:
        """
        Ejecuta la evaluación histórica y genera el vector de cruce tripartito.
        """
        # 1. Obtener expediente histórico y distrital
        distrito_data = historical_service.get_historical_district_memory(ubigeo)
        if not distrito_data:
            distrito_data = historical_service.get_district_full_profile(ubigeo)

        nombre_distrito = (
            distrito_data.get("distrito")
            or distrito_data.get("nombre")
            or (triage.distrito if triage else f"Distrito {ubigeo}")
        )
        cuenca = (
            distrito_data.get("cuenca")
            or distrito_data.get("cuenca_nombre")
            or (triage.cuenca if triage else "Cuenca Local")
        )
        departamento = distrito_data.get("departamento", "")

        # 2. Pattern Matching Atmosférico con HistoricalAnalogEngine
        analog_eval = await analog_engine.evaluate_district_analog(ubigeo)
        dia_crit = analog_eval.get("dia_maximo_riesgo") or {}
        evento_mas_probable = analog_eval.get("evento_mas_probable", "El Niño Costero 2017")
        similitud_pct = float(dia_crit.get("similitud_analoga_pct", 74.5))
        lead_time = int(dia_crit.get("horas_anticipacion", 72))
        factor_amplif = float(analog_eval.get("multiplicador_fen", 1.4))

        # 3. Quebradas históricas analizadas
        quebradas_resp: List[QuebradaAlerta] = []
        quebradas_raw = distrito_data.get("quebradas_criticas") or distrito_data.get("quebradas_activas") or []
        for q in quebradas_raw:
            if isinstance(q, dict):
                quebradas_resp.append(QuebradaAlerta(
                    nombre=q.get("nombre", "Quebrada"),
                    cuenca=cuenca,
                    umbral_critico_mm_h=float(q.get("umbral_critico_mm_h", 25.0)),
                    lluvia_actual_estimada_mm_h=float(triage.telemetria.precipitation_24h / 4.0 if triage else 20.0),
                    umbral_superado=bool(triage and (triage.telemetria.precipitation_24h / 4.0 >= float(q.get("umbral_critico_mm_h", 25.0)))),
                    tiempo_concentracion_horas=float(q.get("tiempo_concentracion_horas", 1.5)),
                    poblacion_cono_deyeccion=int(q.get("poblacion_riesgo", 2400)),
                    puntos_estrangulamiento=q.get("puntos_estrangulamiento", "Puente / Alcantarilla"),
                    obras_existentes=q.get("obras_existentes", "Dique enrocado")
                ))

        # 4. Vertiente Gestión Pública & Infraestructura: Nodos de Falla Histórica CAF y Cruce MEF
        nodos_region = failure_nodes_service.listar_nodos(departamento=departamento)
        infra_fallas: List[Dict[str, Any]] = []
        for n in nodos_region:
            infra_fallas.append({
                "id": n.get("id"),
                "nombre": n.get("nombre"),
                "tipo": n.get("tipo"),
                "colapsos_previos": n.get("historico_fallas", ["1998", "2017"]),
                "causa_raiz": n.get("modo_falla", "Socavación de estribos / Desborde"),
                "alerta_reincidencia": f"Vulnerable a colapso si caudal supera {n.get('umbral_critico_caudal_m3s', 200)} m³/s."
            })

        # Cruce con obras MEF PP 0068 activas en la zona
        obras_zona = mef_obras_service.get_catalogo_obras(
            departamento=departamento.upper() if departamento else "TODOS",
            limite=3
        )
        cruce_fiscal = []
        for o in obras_zona.get("proyectos", []):
            cruce_fiscal.append({
                "cui": o.get("cui"),
                "proyecto": o.get("proyecto"),
                "pim": o.get("pim_soles"),
                "avance_pct": o.get("avance_porcentaje"),
                "cuello_botella": o.get("cuello_botella_siaf"),
                "advertencia_art377": bool(o.get("semaforo_inaccion") == "ROJO_CRITICO"),
                "leccion_historica": (
                    f"Zona con antecedente de desastre en {evento_mas_probable}. "
                    f"Si el CUI {o.get('cui')} tiene avance deficiente ({o.get('avance_porcentaje')}%), se configura omisión funcional."
                )
            })

        # 5. Vertiente Social y Humanitaria: Aislamiento y Memoria de Albergues
        caserios_aislables = distrito_data.get("caserios_aislables") or [
            f"Sectores ribereños y fajas bajas de {nombre_distrito}"
        ]
        colegios_inundables_memoria = distrito_data.get("colegios_inundados_historico") or [
            "I.E. Local de zona baja (Se recomienda vetar como albergue por cota de desborde 2017)"
        ]

        memoria_social = {
            "caserios_alto_riesgo_aislamiento": caserios_aislables,
            "advertencia_albergues_vetados": colegios_inundables_memoria,
            "leccion_evacuacion": (
                f"En {evento_mas_probable}, las vías principales quedaron cortadas en menos de 6 horas. "
                "La evacuación debe ejecutarse de inmediato hacia cotas superiores a la marca histórica."
            )
        }

        # 6. Sabiduría Milenaria Yachay (Bioindicadores)
        bioindicadores = BIOINDICADORES_CUENCAS.get(cuenca, [
            {"indicador": "Comportamiento anómalo de fauna ribereña", "significado": "Variación brusca de microclima y presión barométrica", "certeza": "MEDIA"}
        ])

        # 7. Síntesis y Recomendación Doctrinal
        leccion_clave = (
            f"La firma meteorológica actual replica en un {similitud_pct}% al evento {evento_mas_probable}. "
            f"Históricamente, en esta cuenca el modelo numérico subestimó las precipitaciones por un factor de {factor_amplif}x. "
            "Se exige no esperar el desborde para el repliegue táctico de la población."
        )

        recomendacion_doctrinal = (
            f"[DOCTRINA HISTÓRICA AMARU - LECCIÓN {evento_mas_probable}]: "
            f"1) Activar protocolo de corte preventivo en puentes con estribos socavables. "
            f"2) Vetar albergues en colegios de cota inferior. "
            f"3) Fiscalizar maquinaria de obras CUI en cauce antes de la crecida."
        )

        return HistoricalAnalogueResult(
            ubigeo=ubigeo,
            distrito=nombre_distrito,
            evento_analogo_nombre=evento_mas_probable,
            similitud_porcentaje=similitud_pct,
            comparativa_tsm_anomalia=f"+{triage.validacion_nacional.dhn_anomalia_tsm_c if triage else 2.4}°C en mar costero",
            patron_climatologico=f"Firma análoga a {evento_mas_probable} con onda Kelvin cálida activa.",
            leccion_historica_clave=leccion_clave,
            distrito_declarado_ds124=distrito_data.get("declarado_ds124", True),
            nivel_peligro_cenepred=distrito_data.get("nivel_peligro_cenepred", "MUY_ALTO"),
            sustento_juridico_pcm=distrito_data.get("sustento_pcm", "D.S. N° 124-2026-PCM / Ley 29664 SINAGERD"),
            quebradas_analizadas=quebradas_resp,
            recomendacion_doctrinal=recomendacion_doctrinal,
            lead_time_horas=lead_time,
            factor_amplificacion_fen=factor_amplif,
            impacto_climatico_analogo={
                "evento_referencia": evento_mas_probable,
                "similitud_pct": similitud_pct,
                "lead_time_horas": lead_time,
                "multiplicador_fen": factor_amplif,
                "horizonte": dia_crit.get("dia_nombre", "Día Crítico")
            },
            memoria_infraestructura_fallas=infra_fallas,
            cruce_fiscal_obras=cruce_fiscal,
            memoria_social_albergues=memoria_social,
            bioindicadores_ancestrales=bioindicadores
        )


historical_agent = HistoricalAgent()
