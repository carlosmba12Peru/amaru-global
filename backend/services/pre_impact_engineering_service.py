"""
Servicio de Fichas de Ingeniería Pre-Impacto para Alcaldes (CENEPRED / Ventana Dorada)
AMARU-Climate Lab4 — Planificación anticipada de obras antes del pico del Meganiño 2026-2027
"""

from typing import Dict, Any, List
from services.historical_failure_nodes_service import historical_failure_service
from services.anticipatory_governance_service import anticipatory_governance_service

class PreImpactEngineeringService:
    def __init__(self):
        # Catálogo de planes de ingeniería física por nodo/distrito
        self._planes_ingenieria = {
            "150124": {  # Punta Hermosa
                "cuenca_ciega": "Plaza Central y Cruce Panamericana Sur km 43",
                "descolmatacion_metros_lineales": 1200,
                "obras_requeridas": [
                    "Canalización de concreto en la garganta de salida de la Quebrada Malanche.",
                    "Instalación de disipadores de energía antes del cruce con la Panamericana Sur.",
                    "Preposicionamiento de 2 motobombas de 6'' en la zona baja de Playa Norte."
                ],
                "evacuacion_vertical": "Polideportivo Municipal de Punta Hermosa y Colina Alta San José."
            },
            "150107": {  # Chaclacayo
                "cuenca_ciega": "Residencial Los Cóndores y Cruce Nicolás Ayllón",
                "descolmatacion_metros_lineales": 2800,
                "obras_requeridas": [
                    "Descolmatación completa de los 6 diques de retención en la Quebrada Huascata (volumen estimado: 15,000 m³).",
                    "Mantenimiento de gaviones en Quebrada Los Cóndores y Huascarán.",
                    "Limpieza del puente peatonal sobre la Carretera Central."
                ],
                "evacuacion_vertical": "Estadio Municipal Pachacútec y Losas Altas de Huascata."
            },
            "150118": {  # Chosica
                "cuenca_ciega": "Sector Carossio, Rayos del Sol y Quirio",
                "descolmatacion_metros_lineales": 4500,
                "obras_requeridas": [
                    "Vaciado de rocas y lodo en las 22 barreras dinámicas Geobrugg en Quirio, Carossio y Pedregal.",
                    "Tensado de cables de anclaje de acero en roca madre.",
                    "Enrocado en la margen izquierda del río Rímac en el puente Los Ángeles."
                ],
                "evacuacion_vertical": "Colegio Pablo Patrón, Losas Deportivas Altas de Quirio y Coliseo Carmela Estrella."
            },
            "200105": {  # Catacaos
                "cuenca_ciega": "Zona urbana Catacaos, Simbilá y Viduque",
                "descolmatacion_metros_lineales": 8500,
                "obras_requeridas": [
                    "Elevación de la cota de coronación del Dique Viduque y Dique Pedregal en 1.5 metros adicionales.",
                    "Refuerzo del espigón del Puente Independencia con geobolsas de polipropileno.",
                    "Instalación de 8 motobombas de 6'' en cuencas ciegas urbanas con descarga hacia dren Sechura."
                ],
                "evacuacion_vertical": "Albergues autorizados en el Km 980 de la Panamericana Norte y Colegio 14001."
            },
            "140304": {  # Íllimo
                "cuenca_ciega": "Plaza Principal de Íllimo y Caseríos Huaca de la Cruz",
                "descolmatacion_metros_lineales": 6200,
                "obras_requeridas": [
                    "Descolmatación y ensanchamiento del cauce del río La Leche en el sector Dique La Virgen.",
                    "Reconstrucción del estribo izquierdo del Puente La Leche con protección de gaviones.",
                    "Apertura de zanjas de coronación para desvío de aguas hacia tierras eriazas."
                ],
                "evacuacion_vertical": "Santuario Histórico Bosque de Pómac (colinas altas) y techos del Centro Cívico."
            },
            "130101": {  # Trujillo
                "cuenca_ciega": "Cementerio Mampuesto, Av. Miraflores y Av. España",
                "descolmatacion_metros_lineales": 5500,
                "obras_requeridas": [
                    "Aceleración de los diques de retención y dique derivador de la Quebrada San Ildefonso hacia el río Moche.",
                    "Instalación de barreras temporales de contención en Av. Miraflores.",
                    "Sellado de alcantarillas pluviales colmatadas en el centro histórico."
                ],
                "evacuacion_vertical": "Mansiche Estadio Gran Chimú y Universidad Nacional de Trujillo (Pabellones 3er piso)."
            }
        }

    def generar_ficha_ingenieria(self, ubigeo: str) -> Dict[str, Any]:
        """Genera el dossier técnico preventivo de ingeniería para un alcalde o COEL."""
        plan = self._planes_ingenieria.get(ubigeo, {
            "cuenca_ciega": "Zonas bajas ribereñas del distrito",
            "descolmatacion_metros_lineales": 3000,
            "obras_requeridas": [
                "Descolmatación de cauce principal y quebradas afluentes.",
                "Enrocado en puntos críticos con riesgo de socavación de estribos.",
                "Instalación de motobombas en depresiones urbanas."
            ],
            "evacuacion_vertical": "Losas comunales altas y colegios de material noble de más de 2 pisos."
        })

        # Nodos históricos vinculados en este distrito
        nodos_distrito = [
            n for n in historical_failure_service.listar_nodos()
            if n.get("ubigeo") == ubigeo
        ]

        # Insumos logísticos de la gobernanza anticipatoria
        plan_obj = anticipatory_governance_service.evaluar_plan_anticipatorio_distrital(ubigeo)
        plan_logistico = plan_obj.model_dump() if hasattr(plan_obj, "model_dump") else plan_obj.__dict__

        return {
            "ubigeo": ubigeo,
            "distrito": plan_logistico.get("distrito"),
            "departamento": plan_logistico.get("departamento"),
            "provincia": plan_logistico.get("provincia"),
            "ventana_dorada_semanas": 8,
            "nodos_historicos_colapso": nodos_distrito,
            "diagnostico_cuencas_ciegas": plan["cuenca_ciega"],
            "meta_descolmatacion_metros": plan["descolmatacion_metros_lineales"],
            "obras_prioritarias_pre_impacto": plan["obras_requeridas"],
            "rutas_evacuacion_vertical": plan["evacuacion_vertical"],
            "recursos_maquinaria_sugeridos": {
                "cargadores_frontales": 3,
                "volquetes_15m3": 6,
                "excavadoras_oruga": 2,
                "motobombas_4_pulgadas": plan_logistico.get("insumos_necesarios", {}).get("motobombas_4_pulgadas", 4),
                "motobombas_6_pulgadas": plan_logistico.get("insumos_necesarios", {}).get("motobombas_6_pulgadas", 2)
            },
            "presupuesto_estimado_pen": plan_logistico.get("presupuesto_estimado_pen", 1500000.0),
            "marco_legal": "D.S. 124-2026-PCM • R.J. 112-2014-CENEPRED/J • PP 0068"
        }

pre_impact_service = PreImpactEngineeringService()
