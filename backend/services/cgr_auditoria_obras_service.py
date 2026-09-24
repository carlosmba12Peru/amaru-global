"""
Servicio de Cruce Auditor C2: Informes de Contraloría vs Consulta Amigable MEF
=============================================================================
Cruza las observaciones físicas de los informes de control de la Contraloría
General de la República (CGR) con la ejecución financiera del Programa 0068:

Informes fuente:
  1. Informe N° 10671-2026-CG/AGR-SOP (113 págs): Operativo de Descolmatación y Limpieza
     de Ríos y Quebradas (Gestión de Fichas Técnicas Referenciales de Peligro Muy Alto y Alto).
  2. Segundo Operativo "Vigilamos contigo la reconstrucción" (24 págs, 433 obras visitadas
     en campo por S/ 1,379 millones).
  3. Informe de Orientación de Oficio Catacaos (Defensas ribereñas del Río Piura).
"""

import os
from typing import Dict, Any, List, Optional
try:
    from services.mef_obras_service import mef_obras_service
except ImportError:
    from backend.services.mef_obras_service import mef_obras_service


class CgrAuditoriaObrasService:
    def __init__(self):
        self.puntos_criticos_cgr = [
            {
                "cuenca": "PIURA",
                "departamento": "PIURA",
                "distrito": "Catacaos",
                "sector": "Simbilá / Dique 2.1 / Cura Mori",
                "peligro": "MUY ALTO",
                "situacion_adversa": "Ausencia de maquinaria pesada contratada y riesgo inminente de desborde por debilitamiento del dique en época de crecidas FEN.",
                "informe_cgr": "Informe N° 10671-2026-CG/AGR-SOP & Orientación de Oficio Catacaos",
                "tipo_riesgo": "DESBORDE_Y_PAGOS_EN_RIESGO"
            },
            {
                "cuenca": "TUMBES",
                "departamento": "TUMBES",
                "distrito": "San Juan de la Virgen / Pampas de Hospital",
                "sector": "Margen izquierda del Río Tumbes",
                "peligro": "MUY ALTO",
                "situacion_adversa": "Incongruencia entre avance físico verificado en campo (15%) y avance financiero reportado en SIAF-MEF (68%). Deficiencia en conformación de bordo.",
                "informe_cgr": "Informe N° 10671-2026-CG/AGR-SOP",
                "tipo_riesgo": "SOBREVALORACION_O_PAGOS_ADELANTADOS"
            },
            {
                "cuenca": "LA LECHE",
                "departamento": "LAMBAYEQUE",
                "distrito": "Íllimo / Pacora",
                "sector": "Puente La Leche y fajas marginales",
                "peligro": "MUY ALTO",
                "situacion_adversa": "Retraso injustificado en la suscripción del contrato de descolmatación habiendo certificación presupuestal aprobada desde febrero 2026.",
                "informe_cgr": "Informe N° 10671-2026-CG/AGR-SOP",
                "tipo_riesgo": "LICITACION_TRABADA_INACCION"
            },
            {
                "cuenca": "SANTA",
                "departamento": "ANCASH",
                "distrito": "Santa / Carhuaz / Huaraz",
                "sector": "Sector Rinconada / Dique Santa",
                "peligro": "ALTO",
                "situacion_adversa": "Falta de supervisión permanente en el cauce del río y ausencia de almacén/campamento con equipos de emergencia.",
                "informe_cgr": "Segundo Operativo Vigilamos Contigo la Reconstrucción",
                "tipo_riesgo": "FALTA_DE_SUPERVISION_Y_CALIDAD"
            },
            {
                "cuenca": "RIMAC",
                "departamento": "LIMA",
                "distrito": "Lurigancho-Chosica / Chaclacayo",
                "sector": "Quebrada Huaycoloro / Carapongo / Santa Inés",
                "peligro": "MUY ALTO",
                "situacion_adversa": "Material descolmatado acopiado indebidamente en la faja marginal con riesgo de ser reincorporado al cauce ante huayco activo.",
                "informe_cgr": "Informe N° 10671-2026-CG/AGR-SOP",
                "tipo_riesgo": "COLAPSO_POR_DEFICIENCIA_TECNICA"
            }
        ]

    def get_cruce_mef_contraloria(self) -> Dict[str, Any]:
        obras_mef = mef_obras_service.obras
        discrepancias: List[Dict[str, Any]] = []

        for p_cgr in self.puntos_criticos_cgr:
            cuenca = p_cgr["cuenca"]
            dep = p_cgr["departamento"]

            # Buscar obras en MEF que coincidan con la cuenca o departamento
            obras_coincidentes = [
                o for o in obras_mef
                if o.get("cuenca_rio") == cuenca or o.get("departamento") == dep
            ]

            total_pim_cuenca = sum(o["pim_soles"] for o in obras_coincidentes)
            total_dev_cuenca = sum(o["devengado_soles"] for o in obras_coincidentes)
            promedio_avance = (total_dev_cuenca / total_pim_cuenca * 100) if total_pim_cuenca > 0 else 0.0

            # Identificar obras en cuello de botella o riesgo crítico en esta cuenca
            obras_criticas = [
                o for o in obras_coincidentes
                if o["cuello_botella_siaf"] in ["SIN_CERTIFICAR", "LICITACION_TRABADA", "CONTRATO_SIN_DEVENGAR"]
                or o["semaforo_inaccion"] == "ROJO_INACCION_CRITICA"
            ]

            discrepancias.append({
                "cuenca": cuenca,
                "departamento": dep,
                "distrito_focal": p_cgr["distrito"],
                "sector_critico": p_cgr["sector"],
                "nivel_peligro_cgr": p_cgr["peligro"],
                "hallazgo_contraloria": p_cgr["situacion_adversa"],
                "tipo_riesgo": p_cgr["tipo_riesgo"],
                "fuente_informe_cgr": p_cgr["informe_cgr"],
                "estadisticas_mef_cuenca": {
                    "obras_identificadas": len(obras_coincidentes),
                    "pim_total_soles": total_pim_cuenca,
                    "devengado_soles": total_dev_cuenca,
                    "porcentaje_avance_financiero": round(promedio_avance, 1),
                    "obras_en_cuello_de_botella": len(obras_criticas)
                },
                "obras_prioritarias_mef": [
                    {
                        "cui": o["cui"],
                        "nombre_proyecto": o["nombre_proyecto"],
                        "nivel_gobierno": o["nivel_gobierno"],
                        "pim_soles": o["pim_soles"],
                        "devengado_soles": o["devengado_soles"],
                        "avance_pct": o["porcentaje_ejecucion"],
                        "cuello_botella": o["cuello_botella_siaf"],
                        "alerta_penal_art_377": o["alerta_penal_art_377"]
                    }
                    for o in obras_coincidentes[:3]
                ]
            })

        return {
            "titulo": "Matriz de Cruce Físico-Financiero: Consulta Amigable MEF vs Auditorías de Contraloría",
            "fecha_analisis": "2026-09-23",
            "total_cuencas_auditadas": len(discrepancias),
            "discrepancias_criticas": discrepancias
        }


cgr_auditoria_obras_service = CgrAuditoriaObrasService()
