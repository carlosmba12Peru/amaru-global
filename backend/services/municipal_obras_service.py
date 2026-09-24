"""
Servicio Municipal de Inteligencia de Obras FEN - Consulta Amigable MEF (PP 0068 & FONDES)
========================================================================================
Aísla, audita y diagnostica las obras públicas e intervenciones de emergencia del
Programa Presupuestal 0068 correspondientes a un UBIGEO municipal distrital o provincial.

Integra:
  1. Filtro quirúrgico de proyectos por distrito, provincia, departamento y cuenca.
  2. Diagnóstico anatómico de cuellos de botella del SIAF:
       - SIN_CERTIFICAR (Certificación = 0)
       - LICITACION_TRABADA (Certificación > 0, Compromiso = 0)
       - CONTRATO_SIN_DEVENGAR (Compromiso > 0, Devengado = 0)
       - EN_EJECUCION_REGULAR (Devengado > 0)
       - CULMINADO_O_AVANZADO (Avance >= 80%)
  3. Certificación de Razonabilidad de Precios de Maquinaria Pesada (Art. 27 Ley N.º 30225).
  4. Alerta Pericial por Inacción Funcional (Art. 377 Código Penal).
"""

import unicodedata
import re
from typing import Dict, Any, List, Optional
from services.mef_obras_service import mef_obras_service
from services.historical_data_service import historical_data_service


def _strip_accents(text: str) -> str:
    if not text:
        return ""
    t = unicodedata.normalize('NFKD', text)
    t = ''.join(c for c in t if not unicodedata.combining(c))
    return re.sub(r'[^A-Z0-9 ]', ' ', t.upper())


class MunicipalObrasService:
    def __init__(self):
        self.mef_service = mef_obras_service
        self.hist_service = historical_data_service

        # Banda oficial de precios razonables por hora-máquina (MTC / SEACE 2026 - Lima / Macro Regiones)
        self.banda_precios_maquinaria_hora = {
            "TRACTOR_ORUGA_D8T": {"precio_min_pen": 380.0, "precio_max_pen": 520.0, "unidad": "HORA_MAQUINA"},
            "EXCAVADORA_ORUGA_330": {"precio_min_pen": 320.0, "precio_max_pen": 450.0, "unidad": "HORA_MAQUINA"},
            "CARGADOR_FRONTAL_950": {"precio_min_pen": 260.0, "precio_max_pen": 360.0, "unidad": "HORA_MAQUINA"},
            "RETROEXCAVADORA_420F": {"precio_min_pen": 160.0, "precio_max_pen": 240.0, "unidad": "HORA_MAQUINA"},
            "MOTONIVELADORA_140K": {"precio_min_pen": 280.0, "precio_max_pen": 390.0, "unidad": "HORA_MAQUINA"},
            "VOLQUETE_15M3": {"precio_min_pen": 140.0, "precio_max_pen": 210.0, "unidad": "HORA_MAQUINA"},
            "MOTOBOMBA_6_PULG": {"precio_min_pen": 75.0, "precio_max_pen": 130.0, "unidad": "HORA_MAQUINA"},
            "CISTERNA_AGUA_4000GAL": {"precio_min_pen": 150.0, "precio_max_pen": 230.0, "unidad": "HORA_MAQUINA"}
        }

    def get_obras_distritales(self, ubigeo: str) -> Dict[str, Any]:
        """
        Retorna la cartera completa de obras del PP 0068 filtrada y diagnosticada
        para el UBIGEO especificado.
        """
        dist_info = self.hist_service.get_distrito_info(ubigeo) or {}
        nombre_dist = dist_info.get("distrito", "").strip()
        nombre_prov = dist_info.get("provincia", "").strip()
        nombre_dep = dist_info.get("departamento", "").strip()
        cuenca_nombre = ""
        if dist_info.get("quebradas_criticas") and len(dist_info["quebradas_criticas"]) > 0:
            cuenca_nombre = dist_info["quebradas_criticas"][0].get("cuenca", "")

        dist_clean = _strip_accents(nombre_dist)
        prov_clean = _strip_accents(nombre_prov)
        dep_clean = _strip_accents(nombre_dep)
        cuenca_clean = _strip_accents(cuenca_nombre)

        obras_locales = []
        obras_provinciales = []
        obras_regionales = []
        obras_multidepartamentales = []

        todas = self.mef_service.obras

        for o in todas:
            nom_proj = _strip_accents(o["nombre_proyecto"])
            dep_proj = _strip_accents(o["departamento"])
            cuenca_proj = _strip_accents(o.get("cuenca_rio") or "")

            # Coincidencia directa distrital
            if dist_clean and dist_clean in nom_proj:
                obras_locales.append({**o, "nivel_coincidencia": "DISTRITAL_DIRECTA"})
            # Coincidencia provincial
            elif prov_clean and prov_clean in nom_proj:
                obras_provinciales.append({**o, "nivel_coincidencia": "PROVINCIAL"})
            # Coincidencia por cuenca hidrográfica del distrito
            elif cuenca_clean and any(w in nom_proj for w in cuenca_clean.split() if len(w) > 4):
                obras_locales.append({**o, "nivel_coincidencia": "CUENCA_LOCAL"})
            # Obras departamentales relevantes
            elif dep_clean and dep_clean == dep_proj:
                obras_regionales.append({**o, "nivel_coincidencia": "REGIONAL_DEPARTAMENTAL"})
            # Obras multidepartamentales estratégicas de impacto nacional (PIM > 50M)
            elif o["cui"] in ["3000001", "3000735", "3000734", "3000736"]:
                obras_multidepartamentales.append({**o, "nivel_coincidencia": "MULTIDEPARTAMENTAL_NACIONAL"})

        # Consolidar cartera prioritaria del distrito
        cartera_prioritaria = obras_locales + obras_provinciales
        if not cartera_prioritaria:
            # Si no hay proyectos específicos con el nombre del distrito, mostrar los regionales
            cartera_prioritaria = obras_regionales[:10]

        total_obras = len(cartera_prioritaria)
        pim_total = sum(x["pim_soles"] for x in cartera_prioritaria)
        dev_total = sum(x["devengado_soles"] for x in cartera_prioritaria)
        cert_total = sum(x["certificacion_soles"] for x in cartera_prioritaria)
        comp_total = sum(x["compromiso_anual_soles"] for x in cartera_prioritaria)

        avance_ponderado = round((dev_total / pim_total * 100.0), 1) if pim_total > 0 else 0.0
        promedio_simple = round(sum(x["porcentaje_ejecucion"] for x in cartera_prioritaria) / total_obras, 1) if total_obras > 0 else 0.0

        # Diagnóstico de cuellos de botella
        sin_cert = [x for x in cartera_prioritaria if x["cuello_botella_siaf"] == "SIN_CERTIFICAR"]
        licit_trab = [x for x in cartera_prioritaria if x["cuello_botella_siaf"] == "LICITACION_TRABADA"]
        sin_dev = [x for x in cartera_prioritaria if x["cuello_botella_siaf"] == "CONTRATO_SIN_DEVENGAR"]
        criticos_rojos = [x for x in cartera_prioritaria if x["semaforo_inaccion"] == "ROJO_INACCION_CRITICA"]

        # Alerta legal preventiva
        alerta_legal = None
        if len(criticos_rojos) > 0 and pim_total > 500000:
            alerta_legal = (
                f"ALERTA PREVENTIVA OCI / CGR (Art. 377 Código Penal): El distrito registra {len(criticos_rojos)} "
                f"proyecto(s) en semáforo rojo con avance inferior al 15% a pesar de contar con saldo presupuestal en el PP 0068. "
                f"Se recomienda emitir de inmediato Resolución de Alcaldía habilitando Contratación Directa de Emergencia "
                f"(D.S. 124-2026-PCM / Art. 27 Ley N.º 30225) para evitar responsabilidad funcional."
            )

        return {
            "ubigeo": ubigeo,
            "distrito": nombre_dist,
            "provincia": nombre_prov,
            "departamento": nombre_dep,
            "cuenca_rio": cuenca_nombre or "Cuenca Local",
            "programa_presupuestal": "0068: Reducción de Vulnerabilidad y Atención de Emergencias por Desastres",
            "fecha_corte_siaf": self.mef_service.fecha_corte,
            "fuente_oficial": "Consulta Amigable MEF - Datos Abiertos SIAF 2026",
            "total_obras_cartera": total_obras,
            "pim_total_soles": pim_total,
            "devengado_total_soles": dev_total,
            "certificacion_total_soles": cert_total,
            "compromiso_total_soles": comp_total,
            "saldo_disponible_soles": max(0.0, pim_total - dev_total),
            "avance_ponderado_pim": avance_ponderado,
            "promedio_simple_avance": promedio_simple,
            "diagnostico_cuellos_botella": {
                "sin_certificar_obras": len(sin_cert),
                "licitacion_trabada_obras": len(licit_trab),
                "contrato_sin_devengar_obras": len(sin_dev),
                "obras_inaccion_critica_rojo": len(criticos_rojos),
                "monto_en_riesgo_inaccion_soles": sum(x["pim_soles"] for x in criticos_rojos)
            },
            "alerta_preventiva_legal": alerta_legal,
            "obras_prioritarias": cartera_prioritaria,
            "cartera_obras": cartera_prioritaria,
            "obras_regionales_complementarias": obras_regionales[:5],
            "intervenciones_nacionales_indeci": obras_multidepartamentales
        }

    def certificar_razonabilidad_maquinaria(
        self,
        tipo_maquinaria: str,
        precio_hora_cotizado_pen: float = 0.0,
        horas_requeridas: float = 100.0,
        ubigeo: Optional[str] = None,
        precio_hora_ofertado_pen: Optional[float] = None,
        horas_estimadas: Optional[float] = None
    ) -> Dict[str, Any]:
        """
        Emite dictamen pericial de razonabilidad de precios de alquiler de maquinaria pesada
        para contrataciones directas de emergencia (Art. 27 Ley N.º 30225 / D.S. 124-2026-PCM).
        """
        if precio_hora_ofertado_pen is not None:
            precio_hora_cotizado_pen = precio_hora_ofertado_pen
        if horas_estimadas is not None:
            horas_requeridas = horas_estimadas

        tipo_upper = tipo_maquinaria.upper().replace(" ", "_")
        ref = self.banda_precios_maquinaria_hora.get(tipo_upper)
        if not ref:
            # Buscar coincidencia parcial
            for k, v in self.banda_precios_maquinaria_hora.items():
                if any(part in tipo_upper for part in k.split("_") if len(part) > 3):
                    ref = v
                    tipo_upper = k
                    break

        if not ref:
            ref = {"precio_min_pen": 200.0, "precio_max_pen": 350.0, "unidad": "HORA_MAQUINA"}

        precio_min = ref["precio_min_pen"]
        precio_max = ref["precio_max_pen"]

        es_conforme = precio_hora_cotizado_pen <= precio_max * 1.10  # Hasta 10% de tolerancia por emergencia
        es_sobreprecio = precio_hora_cotizado_pen > precio_max * 1.10
        sobreprecio_pct = round(((precio_hora_cotizado_pen - precio_max) / precio_max * 100.0), 1) if es_sobreprecio else 0.0

        monto_total_cotizado = round(precio_hora_cotizado_pen * horas_requeridas, 2)
        monto_referencial_techo = round(precio_max * horas_requeridas, 2)

        dictamen = "CONFORME_RAZONABLE" if es_conforme else "OBSERVADO_SOBREPRECIO"
        fundamentacion = (
            f"El precio cotizado de S/ {precio_hora_cotizado_pen:.2f}/hora para {tipo_upper} "
            f"se encuentra dentro de la banda de razonabilidad de mercado (S/ {precio_min:.2f} a S/ {precio_max:.2f}). "
            f"Habilitado para Contratación Directa de Emergencia al amparo del Art. 27 de la Ley N.º 30225."
            if es_conforme else
            f"ALERTA DE SOBREPRECIO (+{sobreprecio_pct}%): El precio cotizado de S/ {precio_hora_cotizado_pen:.2f}/hora "
            f"supera el techo referencial de S/ {precio_max:.2f}/hora. Riesgo de observación penal por colusión u omisión."
        )

        return {
            "dictamen": dictamen,
            "dictamen_pericial": "PRECIO_RAZONABLE_MERCADO" if es_conforme else "SOBREPRECIO_CRITICO_ESPECULATIVO",
            "aprobado_para_contratacion_directa": es_conforme,
            "desviacion_porcentual": sobreprecio_pct,
            "tipo_maquinaria": tipo_upper,
            "precio_cotizado_hora_pen": precio_hora_cotizado_pen,
            "horas_solicitadas": horas_requeridas,
            "monto_total_estimado_pen": monto_total_cotizado,
            "banda_referencial_mtc_seace": {
                "minimo_hora_pen": precio_min,
                "maximo_hora_pen": precio_max,
                "monto_techo_razonable_pen": monto_referencial_techo
            },
            "es_conforme": es_conforme,
            "sobreprecio_detectado_pct": sobreprecio_pct,
            "marco_normativo": "Art. 27 Ley N.º 30225 • D.S. 124-2026-PCM • Directiva CGR N.º 018-2020-CG/NORM",
            "amparo_legal": "Art. 27 Ley N.° 30225 • D.S. 124-2026-PCM",
            "fundamentacion_pericial": fundamentacion,
            "conclusion_pericial": fundamentacion
        }


# Instancia singleton
municipal_obras_service = MunicipalObrasService()
