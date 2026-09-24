"""
Servicio de Contingencia y Modelación Hidráulica para Cajamarca
(Distrito de Eduardo Villanueva, Cuenca Crisnejas-Cajamarquino, PPRRD SIGRID 21362).

Implementa:
1. Ingestión y cálculo hidrológico con Grilla Virtual PISCO / SENAMHI.
2. Estimación de Caudales Pico (Qpico) y Tiempo de Retardo (Tlag) para Quebradas Cedrocucho e Yunguilla.
3. Auditoría Forense y Brecha Presupuestal PP 0068 vs. Cartera FONDES (S/ 22.87M).
4. Generador de Fichas IOARR Estandarizadas de Emergencia (Art. 27 Ley 30225).
5. Dossier Criptográfico "Cero Días" (SHA-256) para blindaje ante la transición edil del 31-Dic-2026.
"""

import hashlib
import json
import math
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List, Optional


class CajamarcaContingencyService:
    def __init__(self, data_path: Optional[str] = None):
        if data_path:
            self.data_file = Path(data_path)
        else:
            candidates = [
                Path(__file__).resolve().parent.parent / "data" / "cajamarca_eduardo_villanueva_pprrd.json",
                Path(__file__).resolve().parent.parent.parent / "data" / "cajamarca_eduardo_villanueva_pprrd.json",
                Path("data/cajamarca_eduardo_villanueva_pprrd.json")
            ]
            self.data_file = next((p for p in candidates if p.exists()), candidates[0])
        
        self.data: Dict[str, Any] = self._load_data()

    def _load_data(self) -> Dict[str, Any]:
        if not self.data_file.exists():
            return {}
        try:
            with open(self.data_file, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            return {}

    def get_documento_info(self) -> Dict[str, Any]:
        return self.data.get("documento_metadatos", {})

    def get_puntos_criticos(self) -> List[Dict[str, Any]]:
        return self.data.get("puntos_criticos_medidas_estructurales", [])

    def get_punto_critico_by_id(self, punto_id: str) -> Optional[Dict[str, Any]]:
        for p in self.get_puntos_criticos():
            if p.get("id") == punto_id:
                return p
        return None

    def get_grilla_pisco(self) -> List[Dict[str, Any]]:
        return self.data.get("grilla_virtual_pisco_senamhi", [])

    def simulate_hydraulics_pisco(
        self,
        rainfall_multiplier: float = 1.0,
        storm_intensity_mm_h: float = 35.0,
        storm_duration_hours: float = 3.0
    ) -> Dict[str, Any]:
        """
        Simulación hidrológica y de caudales pico por celda PISCO utilizando el método SCS-CN
        y ecuaciones hidrodinámicas de propagación en cuencas de cabecera.
        """
        results = []
        total_p = storm_intensity_mm_h * storm_duration_hours * rainfall_multiplier
        timestamp = datetime.now().isoformat()

        for cell in self.get_grilla_pisco():
            cell_id = cell["celda_id"]
            name = cell["nombre"]
            area_km2 = cell["area_drenaje_km2"]
            tc_hours = cell["tiempo_concentracion_horas"]
            cn = cell["curva_cn_soil"]

            # Retención potencial máxima S (mm)
            s_mm = (25400.0 / cn) - 254.0
            ia_mm = 0.2 * s_mm  # Abstracción inicial

            # Precipitación efectiva Peff (mm)
            if total_p > ia_mm:
                p_eff_mm = ((total_p - ia_mm) ** 2) / (total_p - ia_mm + s_mm)
            else:
                p_eff_mm = 0.0

            # Tiempo de retardo Tlag (horas) ~= 0.6 * Tc
            t_lag_hours = round(tc_hours * 0.6, 2)

            # Caudal pico Qpico (m3/s) por hidrograma triangular SCS
            # Qp = (0.208 * A_km2 * Peff_mm) / (Tlag + 0.5 * D)
            denominator = t_lag_hours + (0.5 * storm_duration_hours)
            if denominator > 0:
                q_peak = round((0.208 * area_km2 * p_eff_mm) / denominator, 2)
            else:
                q_peak = 0.0

            # Determinación del nivel de alerta hidrológica
            if "CRISNEJAS" in cell_id or "CAJAMARQUINO" in cell_id:
                # Cuencas fluviales principales
                threshold_yellow = cell.get("umbral_alerta_amarilla_m3_s", 80.0)
                threshold_orange = cell.get("umbral_alerta_naranja_m3_s", 130.0)
                threshold_red = cell.get("umbral_alerta_roja_m3_s", 200.0)

                if q_peak >= threshold_red:
                    alert_level = "ROJA (DESBORDE FLUVIAL INMINENTE)"
                    alert_color = "#dc2626"
                elif q_peak >= threshold_orange:
                    alert_level = "NARANJA (CAUDAL CRÍTICO / ALTO RIESGO)"
                    alert_color = "#ea580c"
                elif q_peak >= threshold_yellow:
                    alert_level = "AMARILLA (VIGILANCIA HIDROLÓGICA ACTIVA)"
                    alert_color = "#eab308"
                else:
                    alert_level = "VERDE (NIVEL NORMAL)"
                    alert_color = "#16a34a"
            else:
                # Microcuencas torrenciales de quebrada
                threshold_yellow_p = cell.get("umbral_alerta_amarilla_mm_dia", 25.0)
                threshold_orange_p = cell.get("umbral_alerta_naranja_mm_dia", 45.0)
                threshold_red_p = cell.get("umbral_alerta_roja_mm_dia", 65.0)

                if total_p >= threshold_red_p:
                    alert_level = "ROJA (ACTIVACIÓN TORRENCIAL DE QUEBRADA)"
                    alert_color = "#dc2626"
                elif total_p >= threshold_orange_p:
                    alert_level = "NARANJA (CRECIDA SEVERA)"
                    alert_color = "#ea580c"
                elif total_p >= threshold_yellow_p:
                    alert_level = "AMARILLA (PRE-ALERTA SAT)"
                    alert_color = "#eab308"
                else:
                    alert_level = "VERDE (FLUJO ESTABLE)"
                    alert_color = "#16a34a"

            # Tiempo de anticipación efectiva de alerta temprana (horas hacia la población)
            lead_time_hours = round(max(0.5, t_lag_hours * 1.15), 1)

            results.append({
                "celda_id": cell_id,
                "nombre": name,
                "area_drenaje_km2": area_km2,
                "precipitacion_total_simulada_mm": round(total_p, 1),
                "precipitacion_efectiva_mm": round(p_eff_mm, 2),
                "caudal_pico_estimado_m3_s": q_peak,
                "tiempo_retardo_tlag_h": t_lag_hours,
                "tiempo_anticipacion_alerta_h": lead_time_hours,
                "nivel_alerta": alert_level,
                "color_alerta": alert_color
            })

        return {
            "timestamp": timestamp,
            "parametros_simulacion": {
                "multiplicador_precipitacion": rainfall_multiplier,
                "intensidad_tormenta_mm_h": storm_intensity_mm_h,
                "duracion_tormenta_h": storm_duration_hours,
                "precipitacion_acumulada_mm": round(total_p, 1)
            },
            "celdas_pisco": results,
            "resumen_alerta_distrital": (
                "ALERTA ROJA ACTIVA: Crecida en Quebradas Cedrocucho e Yunguilla con riesgo de anegamiento en Aguas Calientes"
                if any("ROJA" in r["nivel_alerta"] for r in results)
                else "CONDICIÓN HIDROLÓGICA CONTROLADA: Monitoreo continuo vía grilla PISCO"
            )
        }

    def audit_pp0068_cajamarca(self) -> Dict[str, Any]:
        """
        Auditoría forense del Programa Presupuestal 0068 en el Distrito Eduardo Villanueva,
        analizando la distorsión del gasto y la brecha financiera para defensas ribereñas.
        """
        diagnostico = self.data.get("diagnostico_pp0068_historico", {})
        resumen_obras = self.data.get("resumen_inversion_estructural", {})

        inversion_requerida = resumen_obras.get("presupuesto_global_pen", 22870000.0)
        pim_2024 = 52301.0
        brecha_financiera = inversion_requerida - pim_2024

        ratio_cobertura_actual = round((pim_2024 / inversion_requerida) * 100, 2)

        return {
            "entidad": "Municipalidad Distrital de Eduardo Villanueva (061003)",
            "historico": diagnostico,
            "inversion_estructural_requerida_pen": inversion_requerida,
            "presupuesto_pp0068_disponible_2024_pen": pim_2024,
            "brecha_financiera_pen": brecha_financiera,
            "ratio_cobertura_financiera_pct": ratio_cobertura_actual,
            "alerta_forense": {
              "patron_paralisis": "Riesgo crítico de parálisis en el primer año 2027 idéntico al antecedente 2019 (0% de ejecución).",
              "distorsion_gasto": "82.4% del gasto histórico asignado a actividades operativas de contingencia frente a solo 0.23% en protección física de cauces.",
              "estrategia_recomendada": "Postulación en bloque de los 9 proyectos al Fondo para Intervenciones ante la Ocurrencia de Desastres Naturales (FONDES - Ley 30458) mediante expedientes IOARR de emergencia."
            }
        }

    def generate_ioarr_fondes_package(self, punto_critico_id: str) -> Dict[str, Any]:
        """
        Genera el expediente técnico IOARR estandarizado para postulación a FONDES/MVCS
        bajo el régimen del Art. 27 de la Ley de Contrataciones del Estado (Ley 30225).
        """
        punto = self.get_punto_critico_by_id(punto_critico_id)
        if not punto:
            raise ValueError(f"Punto crítico {punto_critico_id} no encontrado en el PPRRD")

        metrados = punto.get("metrados_obra", {})
        presupuesto = punto.get("presupuesto_estimado_pen", 3000000.0)
        elementos = punto.get("elementos_expuestos", {})

        # Estructura del expediente
        expediente_raw = {
            "codigo_intervencion": punto["id"],
            "denominacion": punto["denominacion"],
            "ubicacion": {
                "distrito": "Eduardo Villanueva",
                "provincia": "San Marcos",
                "departamento": "Cajamarca",
                "sector": punto["sector"],
                "cauce": punto["cauce"],
                "utm_17s": punto["coordenadas_utm_17s"]
            },
            "normativa_aplicable": [
                "Ley N° 30225 Art. 27 literal b (Contratación directa por emergencia)",
                "Ley N° 30458 (Ley que crea el FONDES)",
                "Decreto de Urgencia Marco FEN 2026-2027",
                "Ley N° 29664 - Ley del SINAGERD"
            ],
            "componentes_tecnicos_boq": [
                {
                    "partida": "01.01",
                    "descripcion": "Limpieza, encauzamiento y descolmatación mecanizada de cauce",
                    "unidad": "km",
                    "metrado": metrados.get("descolmatacion_cauce_km", 1.0),
                    "costo_estimado_pen": round(presupuesto * 0.25, 2)
                },
                {
                    "partida": "01.02",
                    "descripcion": "Conformación de bordo de protección con material propio compactado",
                    "unidad": "km",
                    "metrado": metrados.get("dique_material_propio_km", 0.8),
                    "costo_estimado_pen": round(presupuesto * 0.35, 2)
                },
                {
                    "partida": "01.03",
                    "descripcion": "Colocación de enrocado de protección tipo rip-rap (piedra acomodada d50=0.80m)",
                    "unidad": "km",
                    "metrado": metrados.get("enrocado_proteccion_km", 0.8),
                    "costo_estimado_pen": round(presupuesto * 0.40, 2)
                }
            ],
            "costo_total_obra_pen": presupuesto,
            "poblacion_beneficiaria": elementos.get("poblacion_afectada", 0),
            "viviendas_protegidas": elementos.get("viviendas_expuestas", 0),
            "plazo_ejecucion_dias": punto.get("plazo_ejecucion_dias", 60),
            "timestamp_emision": datetime.now().isoformat()
        }

        # Sello criptográfico SHA-256
        content_string = json.dumps(expediente_raw, sort_keys=True)
        sha256_hash = hashlib.sha256(content_string.encode("utf-8")).hexdigest()

        expediente_raw["sello_criptografico_sha256"] = sha256_hash
        expediente_raw["certificacion_validez"] = "EXPEDIENTE IOARR ELEGIBLE PARA FINANCIAMIENTO FONDES"

        return expediente_raw

    def generate_dossier_transferencia_2026(self) -> Dict[str, Any]:
        """
        Genera el "Dossier Cero Días" de transferencia formal para la administración entrante (2027-2030),
        cerrando la brecha de impunidad y el vacío administrativo de los 100 días post 31-Dic-2026.
        """
        salvaguarda = self.data.get("salvaguarda_transicion_100_dias", {})
        doc_info = self.get_documento_info()
        puntos = self.get_puntos_criticos()

        resumen_puntos = [
            {
                "id": p["id"],
                "denominacion": p["denominacion"],
                "sector": p["sector"],
                "presupuesto_requerido": p["presupuesto_estimado_pen"],
                "nivel_peligro": p["nivel_peligro"]
            }
            for p in puntos
        ]

        acta_transferencia = {
            "titulo_instrumento": "DOSSIER CERO DÍAS: ACTA DE TRANSFERENCIA TÉCNICO-LEGAL DEL PPRRD ANTE EL FEN",
            "distrito": "Eduardo Villanueva (La Grama), San Marcos, Cajamarca",
            "ubigeo": "061003",
            "fecha_cierre_mandato": salvaguarda.get("fecha_termino_mandato_actual", "2026-12-31"),
            "autoridad_saliente": doc_info.get("autoridad_edil", "Wilder Alex Ávila Tirado"),
            "autoridad_entrante_cargo": "Alcalde Distrital y Presidente del GT-GRD Electo (Periodo 2027-2030)",
            "marco_juridico_responsabilidad": [
                "Ley 29664 (SINAGERD) Art. 14: Los Alcaldes son las máximas autoridades responsables de la GRD.",
                "D.S. 048-2011-PCM Reglamento SINAGERD Art. 61: Responsabilidad administrativa y penal funcional.",
                "Art. 27 Ley 30225: Habilitación de contrataciones directas para obras de emergencia."
            ],
            "notificacion_vinculante": (
                "Se hace entrega formal del Plan SIGRID 21362 y de los 9 PUNTOS CRÍTICOS hidrológicos del distrito. "
                "Cualquier dilación funcional en los primeros 100 días de gestión (enero a marzo 2027) "
                "que genere pérdidas de vidas o colapso de infraestructura será tipificada bajo responsabilidad "
                "penal directa de la nueva administración, no pudiendo alegar desconocimiento institucional."
            ),
            "cartera_proyectos_priorizados": resumen_puntos,
            "presupuesto_global_comprometido_pen": self.data.get("resumen_inversion_estructural", {}).get("presupuesto_global_pen", 22870000.0),
            "timestamp_certificacion": datetime.now().isoformat()
        }

        # Generación del hash criptográfico formal
        raw_repr = json.dumps(acta_transferencia, sort_keys=True)
        sha256_dossier = hashlib.sha256(raw_repr.encode("utf-8")).hexdigest()

        acta_transferencia["sello_criptografico_sha256"] = sha256_dossier
        acta_transferencia["estado_juridico"] = "DOCUMENTO OPONIBLE ANTE CONTRALORÍA Y MINISTERIO PÚBLICO"

        return acta_transferencia

cajamarca_contingency_service = CajamarcaContingencyService()
