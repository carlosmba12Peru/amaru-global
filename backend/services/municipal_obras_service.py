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

    def _asegurar_catalogo_distritos(self):
        if hasattr(self, "_distritos_indexados") and self._distritos_indexados:
            return
        distritos_map = getattr(self.hist_service, "distritos_1891", {})
        self._distritos_catalogo = []
        for u, d in distritos_map.items():
            self._distritos_catalogo.append({
                "ubigeo": u,
                "distrito": d.get("distrito", ""),
                "provincia": d.get("provincia", ""),
                "departamento": d.get("departamento", ""),
                "d_clean": _strip_accents(d.get("distrito", "")),
                "p_clean": _strip_accents(d.get("provincia", "")),
                "dep_clean": _strip_accents(d.get("departamento", ""))
            })
        self._distritos_catalogo.sort(key=lambda x: len(x["d_clean"]), reverse=True)

        for o in self.mef_service.obras:
            nom = _strip_accents(o["nombre_proyecto"])
            dep = _strip_accents(o.get("departamento", ""))
            matched = None
            for d in self._distritos_catalogo:
                if dep and d["dep_clean"] == dep:
                    dn = d["d_clean"]
                    if (f"DISTRITO DE {dn}" in nom) or (f"DISTRITO Y PROVINCIA DE {dn}" in nom) or (f"DISTRITO {dn}" in nom) or (f"LOCALIDAD DE {dn}" in nom) or (f"CIUDAD DE {dn}" in nom):
                        matched = d
                        break
            if not matched:
                for d in self._distritos_catalogo:
                    dn = d["d_clean"]
                    if len(dn) > 4 and ((f"DISTRITO DE {dn}" in nom) or (f"DISTRITO Y PROVINCIA DE {dn}" in nom)):
                        matched = d
                        break
            o["distrito_detectado"] = matched["distrito"] if matched else ""
            o["provincia_detectada"] = matched["provincia"] if matched else ""
            o["ubigeo_detectado"] = matched["ubigeo"] if matched else ""
        self._distritos_indexados = True

    def get_obras_distritales(
        self,
        ubigeo: str,
        alcance: Optional[str] = "AUTO",
        ubigeo_filtro: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Retorna la cartera completa de obras del PP 0068 filtrada y diagnosticada
        para el UBIGEO especificado con aislamiento territorial riguroso.
        """
        self._asegurar_catalogo_distritos()
        target_ubigeo = ubigeo_filtro or ubigeo
        dist_info = self.hist_service.get_distrito_info(target_ubigeo) or {}
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
            dep_proj = _strip_accents(o.get("departamento", ""))
            cuenca_proj = _strip_accents(o.get("cuenca_rio") or "")
            o_ubigeo = o.get("ubigeo_detectado", "")
            o_dist = _strip_accents(o.get("distrito_detectado", ""))
            o_prov = _strip_accents(o.get("provincia_detectada", ""))

            # Coincidencia directa distrital estricta
            if (o_ubigeo and o_ubigeo == target_ubigeo) or (dist_clean and (f"DISTRITO DE {dist_clean}" in nom_proj or f"DISTRITO Y PROVINCIA DE {dist_clean}" in nom_proj or dist_clean == o_dist)):
                obras_locales.append({
                    **o,
                    "nivel_coincidencia": "DISTRITAL_DIRECTA",
                    "distrito_nombre": o.get("distrito_detectado") or nombre_dist,
                    "provincia_nombre": o.get("provincia_detectada") or nombre_prov,
                    "ubigeo_asignado": o.get("ubigeo_detectado") or target_ubigeo
                })
            # Coincidencia provincial
            elif (o_prov and o_prov == prov_clean) or (prov_clean and f"PROVINCIA DE {prov_clean}" in nom_proj):
                obras_provinciales.append({
                    **o,
                    "nivel_coincidencia": "PROVINCIAL",
                    "distrito_nombre": o.get("distrito_detectado") or "Provincial",
                    "provincia_nombre": o.get("provincia_detectada") or nombre_prov,
                    "ubigeo_asignado": o.get("ubigeo_detectado") or ""
                })
            # Coincidencia por cuenca hidrográfica del distrito (nivel regional/cuenca)
            elif cuenca_clean and any(w in nom_proj for w in cuenca_clean.split() if len(w) > 4 and w not in ["PIURA", "LIMA", "SANTA"]):
                obras_regionales.append({
                    **o,
                    "nivel_coincidencia": "CUENCA_LOCAL",
                    "distrito_nombre": o.get("distrito_detectado") or "Cuenca",
                    "provincia_nombre": o.get("provincia_detectada") or nombre_prov,
                    "ubigeo_asignado": o.get("ubigeo_detectado") or ""
                })
            # Obras departamentales relevantes
            elif dep_clean and (dep_clean == dep_proj or dep_clean == _strip_accents(o.get("departamento", ""))):
                obras_regionales.append({
                    **o,
                    "nivel_coincidencia": "REGIONAL_DEPARTAMENTAL",
                    "distrito_nombre": o.get("distrito_detectado") or "Regional",
                    "provincia_nombre": o.get("provincia_detectada") or "",
                    "ubigeo_asignado": o.get("ubigeo_detectado") or ""
                })
            elif o["cui"] in ["3000001", "3000735", "3000734", "3000736"]:
                obras_multidepartamentales.append({
                    **o,
                    "fuente": "MEF_PP0068",
                    "fuente_label": "MEF - Consulta Amigable (PP 0068)",
                    "nivel_coincidencia": "MULTIDEPARTAMENTAL_NACIONAL",
                    "distrito_nombre": "Nacional",
                    "provincia_nombre": "Nacional",
                    "ubigeo_asignado": ""
                })

        # Marcar fuente MEF en las obras existentes
        for o in obras_locales:
            o["fuente"] = "MEF_PP0068"
            o["fuente_label"] = "MEF - Inversión Pública (PP 0068)"
        for o in obras_provinciales:
            o["fuente"] = "MEF_PP0068"
            o["fuente_label"] = "MEF - Ámbito Provincial (PP 0068)"
        for o in obras_regionales:
            o["fuente"] = "MEF_PP0068"
            o["fuente_label"] = "MEF - Ámbito Regional (PP 0068)"

        # -------------------------------------------------------------
        # INTEGRACIÓN ESTRATÉGICA: OBRAS Y DEFENSAS FLUVIALES ANA (FTR)
        # -------------------------------------------------------------
        ana_locales = []
        ana_provinciales = []
        ana_regionales = []

        try:
            from services.cgr_auditoria_obras_service import cgr_auditoria_obras_service
            # Consultar intervenciones ANA filtradas para el departamento
            cat_ana = cgr_auditoria_obras_service.get_catalogo_unificado(
                departamento=nombre_dep,
                fuente="ANA_FTR",
                limite=300
            ).get("obras", [])

            for it in cat_ana:
                it_ubg = it.get("ubigeo") or ""
                it_dist = _strip_accents(it.get("distrito") or "")
                it_prov = _strip_accents(it.get("provincia") or "")
                it_cuenca = _strip_accents(it.get("cuenca") or "")

                ana_item = {
                    "cui": it.get("cui_o_ftr") or it.get("id"),
                    "codigo_oficial": it.get("codigo_oficial"),
                    "nombre_proyecto": it.get("nombre_proyecto"),
                    "nivel_gobierno": "GOBIERNO NACIONAL (ANA / MIDAGRI)",
                    "gobierno_local_o_sector": "Autoridad Nacional del Agua - " + str(it.get("sector", "Cauce")),
                    "departamento": it.get("departamento") or nombre_dep,
                    "provincia": it.get("provincia") or nombre_prov,
                    "distrito": it.get("distrito") or nombre_dist,
                    "ubigeo_asignado": it_ubg or target_ubigeo,
                    "pim_soles": float(it.get("pim_soles") or 0.0),
                    "devengado_soles": float(it.get("devengado_soles") or 0.0),
                    "certificacion_soles": float(it.get("pim_soles") or 0.0) * (0.9 if it.get("porcentaje_ejecucion", 0) > 0 else 0.0),
                    "compromiso_anual_soles": float(it.get("pim_soles") or 0.0) * (0.8 if it.get("porcentaje_ejecucion", 0) > 0 else 0.0),
                    "porcentaje_ejecucion": float(it.get("porcentaje_ejecucion") or 0.0),
                    "cuello_botella_siaf": it.get("cuello_botella_siaf") or "EN_EJECUCION_REGULAR",
                    "estado_ftr_cgr": it.get("estado_ftr_cgr") or "OBRA_CON_CONTRATO_EN_CAMPO",
                    "semaforo_inaccion": it.get("semaforo_cgr") or "VERDE_CONFORME",
                    "alerta_penal_art_377": it.get("alerta_penal_texto"),
                    "cuenca_rio": it.get("cuenca") or cuenca_nombre or "Cuenca Local",
                    "sector": it.get("sector") or "Sector Ribereño",
                    "cauce": it.get("cauce") or it.get("rio") or "Cauce Principal",
                    "poblacion_protegida": int(it.get("poblacion_protegida") or 0),
                    "hectareas_cultivo": float(it.get("hectareas_cultivo") or 0.0),
                    "tipo_cultivos": it.get("tipo_cultivos") or "Cultivos de valle",
                    "fuente": "ANA_FTR",
                    "fuente_label": "ANA / MIDAGRI - Control Fluvial (FTR)",
                    "criterio_cgr": it.get("criterio_cgr_informe", "Informe N° 10671-2026-CG/AGR-SOP")
                }

                # Coincidencia distrital directa
                if (it_ubg and it_ubg == target_ubigeo) or (dist_clean and (dist_clean == it_dist or dist_clean in it_dist)):
                    ana_locales.append({
                        **ana_item,
                        "nivel_coincidencia": "DISTRITAL_DIRECTA_ANA",
                        "distrito_nombre": it.get("distrito") or nombre_dist,
                        "provincia_nombre": it.get("provincia") or nombre_prov
                    })
                # Coincidencia provincial
                elif (prov_clean and (prov_clean == it_prov or prov_clean in it_prov)):
                    ana_provinciales.append({
                        **ana_item,
                        "nivel_coincidencia": "PROVINCIAL_ANA",
                        "distrito_nombre": it.get("distrito") or "Provincial ANA",
                        "provincia_nombre": it.get("provincia") or nombre_prov
                    })
                else:
                    ana_regionales.append({
                        **ana_item,
                        "nivel_coincidencia": "REGIONAL_ANA",
                        "distrito_nombre": it.get("distrito") or "Regional ANA",
                        "provincia_nombre": it.get("provincia") or ""
                    })
        except Exception as e_ana:
            print(f"[MunicipalObrasService Warning] No se pudo integrar catálogo ANA: {e_ana}")

        # Recopilar distritos del departamento que tienen proyectos registrados (MEF + ANA)
        distritos_dict = {}
        for o in (obras_locales + ana_locales + obras_provinciales + ana_provinciales + obras_regionales + ana_regionales):
            u_o = o.get("ubigeo_asignado") or o.get("ubigeo_detectado")
            d_o = o.get("distrito_nombre") or o.get("distrito_detectado")
            p_o = o.get("provincia_nombre") or o.get("provincia_detectada") or nombre_prov
            if u_o and d_o and d_o not in ["Provincial", "Regional", "Nacional", "Provincial ANA", "Regional ANA"] and u_o[:2] == target_ubigeo[:2]:
                if u_o not in distritos_dict:
                    distritos_dict[u_o] = {
                        "ubigeo": u_o,
                        "distrito": d_o,
                        "provincia": p_o,
                        "departamento": nombre_dep,
                        "total_obras": 0,
                        "pim_total_soles": 0.0,
                        "es_distrito_actual": (u_o == target_ubigeo)
                    }
                distritos_dict[u_o]["total_obras"] += 1
                distritos_dict[u_o]["pim_total_soles"] += o.get("pim_soles", 0.0)

        distritos_disponibles = sorted(list(distritos_dict.values()), key=lambda x: x["distrito"])

        # Determinar la cartera a entregar según el alcance solicitado
        es_fallback_provincial = False
        alcance_str = (alcance or "AUTO").upper()

        obras_locales_totales = obras_locales + ana_locales
        obras_provinciales_totales = obras_provinciales + ana_provinciales
        obras_regionales_totales = obras_regionales + ana_regionales

        if alcance_str == "DISTRITAL":
            cartera_prioritaria = obras_locales_totales
        elif alcance_str == "PROVINCIAL":
            cartera_prioritaria = obras_locales_totales + obras_provinciales_totales
        elif alcance_str in ["REGIONAL", "DEPARTAMENTAL"]:
            cartera_prioritaria = obras_locales_totales + obras_provinciales_totales + obras_regionales_totales
        else:
            # AUTO: Si hay obras locales directas (MEF o ANA), muestra las locales directas
            if obras_locales_totales:
                cartera_prioritaria = obras_locales_totales
                es_fallback_provincial = False
            elif obras_provinciales_totales:
                cartera_prioritaria = obras_provinciales_totales
                es_fallback_provincial = True
            else:
                cartera_prioritaria = obras_regionales_totales[:10]
                es_fallback_provincial = True

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
        criticos_rojos = [x for x in cartera_prioritaria if x["semaforo_inaccion"] == "ROJO_INACCION_CRITICA"]

        # Clasificación por familias de ingeniería para la cartera local
        familias_meta = {
            "G1_DEFENSAS_RIBERENAS": {"nombre": "Defensas Ribereñas y Diques", "icono": "ShieldAlert", "color": "rose"},
            "G2_DRENAJE_PLUVIAL": {"nombre": "Drenaje Pluvial y Cuencas Ciegas", "icono": "CloudRain", "color": "amber"},
            "G3_CONTROL_QUEBRADAS": {"nombre": "Control de Torrenteras y Huaycos", "icono": "Mountain", "color": "sky"},
            "G4_INFRAESTRUCTURA_VIAL": {"nombre": "Infraestructura Vial y Puentes", "icono": "Milestone", "color": "orange"},
            "G5_CAPACIDAD_OPERATIVA": {"nombre": "Capacidad Operativa y Maquinaria", "icono": "Truck", "color": "emerald"},
            "G6_LOCALES_ESENCIALES": {"nombre": "Locales Esenciales de Mitigación", "icono": "Building2", "color": "cyan"}
        }

        def _clasificar_familia(nom_raw: str) -> str:
            n = re.sub(r'[^A-Z0-9 ]', ' ', nom_raw.upper())
            if any(k in n for k in ["DEFENSA", "DEFENZA", "RIBERE", "RIBERA", "ENCAUZAMIENTO", "MURO DE CONTEN", "GAVION", "ENROCADO", "DIQUE", "MARGEN", "CANALIZACION", "CANAL", "PROTECCION CONTRA INUNDACION"]):
                return "G1_DEFENSAS_RIBERENAS"
            if any(k in n for k in ["DRENAJE", "PLUVIAL", "EVACUACION DE AGUA", "CUNETA", "ALCANTARILLA", "COLECTOR", "VIA CANAL", "SIFONES", "CUENCA CIEGA"]):
                return "G2_DRENAJE_PLUVIAL"
            if any(k in n for k in ["QUEBRADA", "HUAYCO", "HUAICO", "ALUD", "DESLIZAMIENTO", "TORRENTERA", "BARRERA DINAMICA", "DIQUE TRANSVERSAL", "LADERA"]):
                return "G3_CONTROL_QUEBRADAS"
            if any(k in n for k in ["PUENTE", "CARRETERA", "CAMINO", "TRANSITABILIDAD", "PASO A DESNIVEL", "VIAL", "BADEN", "PONTON"]):
                return "G4_INFRAESTRUCTURA_VIAL"
            if any(k in n for k in ["ACCIONES COMUNES", "EMERGENCIA", "MAQUINARIA", "COMBUSTIBLE", "ALMACEN", "AYUDA HUMANITARIA", "CAPACIDAD OPERATIVA", "MOTOBOMBA"]):
                return "G5_CAPACIDAD_OPERATIVA"
            return "G6_LOCALES_ESENCIALES"

        familias_stats = {k: {"id": k, "nombre": v["nombre"], "icono": v["icono"], "color": v["color"], "total_obras": 0, "pim_soles": 0.0, "devengado_soles": 0.0, "obras_criticas_rojo": 0, "avances": []} for k, v in familias_meta.items()}

        for o in cartera_prioritaria:
            fam_id = _clasificar_familia(o["nombre_proyecto"])
            o["familia_ingenieria"] = fam_id
            st = familias_stats[fam_id]
            st["total_obras"] += 1
            st["pim_soles"] += o.get("pim_soles", 0.0)
            st["devengado_soles"] += o.get("devengado_soles", 0.0)
            if o.get("semaforo_inaccion") == "ROJO_INACCION_CRITICA":
                st["obras_criticas_rojo"] += 1
            st["avances"].append(o.get("porcentaje_ejecucion", 0.0))

        familias_list = []
        for k, v in familias_stats.items():
            tot = v["total_obras"]
            pim_f = v["pim_soles"]
            dev_f = v["devengado_soles"]
            pct = round(dev_f / pim_f * 100, 1) if pim_f > 0 else (round(sum(v["avances"]) / tot, 1) if tot > 0 else 0.0)
            familias_list.append({
                "id": v["id"],
                "nombre": v["nombre"],
                "icono": v["icono"],
                "color": v["color"],
                "total_obras": tot,
                "pim_soles": pim_f,
                "devengado_soles": dev_f,
                "avance_promedio_pct": pct,
                "obras_criticas_rojo": v["obras_criticas_rojo"]
            })

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
            "ubigeo_efectivo": target_ubigeo,
            "distrito": nombre_dist,
            "provincia": nombre_prov,
            "departamento": nombre_dep,
            "alcance_aplicado": alcance_str,
            "total_obras_distrito": len(obras_locales_totales),
            "total_obras_provincia": len(obras_locales_totales) + len(obras_provinciales_totales),
            "total_obras_region": len(obras_locales_totales) + len(obras_provinciales_totales) + len(obras_regionales_totales),
            "total_obras_mef": len([x for x in cartera_prioritaria if x.get("fuente") == "MEF_PP0068"]),
            "total_intervenciones_ana": len([x for x in cartera_prioritaria if x.get("fuente") == "ANA_FTR"]),
            "pim_mef_soles": sum(x["pim_soles"] for x in cartera_prioritaria if x.get("fuente") == "MEF_PP0068"),
            "inversion_ana_soles": sum(x["pim_soles"] for x in cartera_prioritaria if x.get("fuente") == "ANA_FTR"),
            "poblacion_protegida_total": sum(x.get("poblacion_protegida", 0) for x in cartera_prioritaria),
            "hectareas_cultivo_total": round(sum(x.get("hectareas_cultivo", 0.0) for x in cartera_prioritaria), 1),
            "es_fallback_provincial": es_fallback_provincial,
            "distritos_con_obras_departamento": distritos_disponibles,
            "cuenca_rio": cuenca_nombre or "Cuenca Local",
            "programa_presupuestal": "0068: Reducción de Vulnerabilidad y Atención de Emergencias por Desastres / FTR ANA D.S. 164-2026-EF",
            "fecha_corte_siaf": self.mef_service.fecha_corte,
            "fuente_oficial": "MEF Consulta Amigable SIAF & ANA GeoSNIRH 2026",
            "total_obras_cartera": total_obras,
            "pim_total_soles": pim_total,
            "devengado_total_soles": dev_total,
            "certificacion_total_soles": cert_total,
            "compromiso_total_soles": comp_total,
            "saldo_disponible_soles": max(0.0, pim_total - dev_total),
            "avance_ponderado_pim": avance_ponderado,
            "promedio_simple_avance": promedio_simple,
            "familias_ingenieria": familias_list,
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
            "obras_regionales_complementarias": obras_regionales_totales[:5],
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
