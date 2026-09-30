"""
Servicio C2 de Control Concurrente, Auditoría de Obras FEN y FTR ANA (AMARU-CLIMATE)
==================================================================================
Centraliza y audita todas las intervenciones públicas y de mitigación ante el
Fenómeno El Niño 2026 bajo los criterios de control gubernamental de la Contraloría
General de la República (CGR).

Fuentes de Control Integradas:
  1. MEF Consulta Amigable SIAF: 652 proyectos del Programa Presupuestal 0068
     ("Reducción de Vulnerabilidad y Atención de Emergencias").
  2. ANA GeoSNIRH / D.S. N° 164-2026-EF: 536 intervenciones de descolmatación,
     defensas ribereñas y encauzamiento con Fichas Técnicas Referenciales (FTR).
  3. CGR - Informe N° 10671-2026-CG/AGR-SOP (Operativo Descolmatación y Limpieza de Ríos):
     Evaluación de 2,016 FTR (23% no recibidas, 58% recibidas en inacción funcional).
  4. CGR - Informe de Orientación de Oficio Catacaos (Defensas Río Piura).
  5. CGR - Operativo "Vigilamos contigo la reconstrucción" (433 obras visitadas).
  6. INEI - Censos Nacionales: Cruce geoespacial con los 1,891 distritos (Ubigeos).
"""

import os
import re
import unicodedata
from typing import Dict, Any, List, Optional
from datetime import datetime

try:
    from services.mef_obras_service import mef_obras_service
    from services.ana_geosnirh_client import AnaGeosnirhClient
    from services.inei_vulnerability_service import inei_vulnerability_service
except ImportError:
    from backend.services.mef_obras_service import mef_obras_service
    from backend.services.ana_geosnirh_client import AnaGeosnirhClient
    from backend.services.inei_vulnerability_service import inei_vulnerability_service


def _strip_accents(text: str) -> str:
    if not text:
        return ""
    text_norm = unicodedata.normalize('NFD', text)
    return ''.join(c for c in text_norm if unicodedata.category(c) != 'Mn').upper().strip()


class CgrAuditoriaObrasService:
    def __init__(self):
        self.ana_client = AnaGeosnirhClient()
        self.catalogo_unificado: List[Dict[str, Any]] = []
        self.catalogo_by_id: Dict[str, Dict[str, Any]] = {}
        self.jerarquia_geografica: Dict[str, Any] = {}
        self._inicializado = False

        # Datos retrocompatibles de cuencas críticas
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

    def _asegurar_inicializacion(self):
        if not self._inicializado:
            self._construir_catalogo_unificado()
            self._inicializado = True

    def _construir_catalogo_unificado(self):
        """Fusiona, enriquece e indexa todas las obras MEF y FTR ANA con Ubigeo y criterios CGR."""
        obras_mef = mef_obras_service.obras
        puntos_ana = self.ana_client.obtener_puntos_criticos_priorizados_2026()
        distritos_censo = inei_vulnerability_service.distritos_censo

        # Tablas de búsqueda rápida de Ubigeos
        # (dep_clean, dist_clean) -> (ubigeo, dep, prov, dist)
        map_dep_dist = {}
        # dist_clean -> list of (ubigeo, dep, prov, dist)
        map_dist_only = {}
        # dep_clean -> list of (ubigeo, dep, prov, dist)
        map_dep_only = {}

        for ubg, d in distritos_censo.items():
            dep = d.get("departamento", "").upper()
            prov = d.get("provincia", "").upper()
            dist = d.get("distrito", "").upper()
            dep_c = _strip_accents(dep)
            dist_c = _strip_accents(dist)

            entry = (ubg, dep, prov, dist)
            map_dep_dist[(dep_c, dist_c)] = entry

            if dist_c not in map_dist_only:
                map_dist_only[dist_c] = []
            map_dist_only[dist_c].append(entry)

            if dep_c not in map_dep_only:
                map_dep_only[dep_c] = []
            map_dep_only[dep_c].append(entry)

        items_unificados: List[Dict[str, Any]] = []

        # -------------------------------------------------------------
        # 1. Procesar Obras MEF Consulta Amigable (PP 0068)
        # -------------------------------------------------------------
        for o in obras_mef:
            cui = str(o.get("cui") or "").strip()
            nom = o.get("nombre_proyecto") or ""
            nom_c = _strip_accents(nom)
            dep_mef = o.get("departamento") or "MULTIDEPARTAMENTAL"
            dep_mef_c = _strip_accents(dep_mef)

            # Inferencia de Ubigeo
            ubigeo = "000000"
            prov_final = "NO DETERMINADO"
            dist_final = "NO DETERMINADO"
            dep_final = dep_mef

            # Buscar por distrito dentro del departamento
            encontrado = False
            if dep_mef_c in map_dep_only:
                for entry in map_dep_only[dep_mef_c]:
                    u_cand, d_cand, p_cand, dist_cand = entry
                    dist_cand_c = _strip_accents(dist_cand)
                    if len(dist_cand_c) >= 4 and dist_cand_c in nom_c:
                        ubigeo, dep_final, prov_final, dist_final = entry
                        encontrado = True
                        break

            # Si no encontró, buscar por distrito a nivel nacional
            if not encontrado:
                for dist_c, entries in map_dist_only.items():
                    if len(dist_c) >= 5 and f"DISTRITO DE {dist_c}" in nom_c:
                        ubigeo, dep_final, prov_final, dist_final = entries[0]
                        encontrado = True
                        break

            # Determinar Situación Adversa CGR para MEF
            pim = float(o.get("pim_soles") or 0.0)
            dev = float(o.get("devengado_soles") or 0.0)
            pct = float(o.get("porcentaje_ejecucion") or 0.0)
            cb = o.get("cuello_botella_siaf") or "EN_EJECUCION_REGULAR"
            sem = o.get("semaforo_inaccion") or "VERDE_CONFORME"

            # Estado FTR equivalente CGR
            if cb in ["SIN_CERTIFICAR", "LICITACION_TRABADA"]:
                estado_ftr_cgr = "FTR_RECIBIDA_SIN_ACCION" if cb == "SIN_CERTIFICAR" else "FTR_EN_GESTION_PRELIMINAR"
                situacion_adversa = f"Traba administrativa en fase de {cb.replace('_', ' ')}. Presupuesto asignado de S/ {pim:,.2f} sin devengar a semanas del inicio del FEN."
                alerta_penal = (sem == "ROJO_INACCION_CRITICA")
            elif cb == "CONTRATO_SIN_DEVENGAR":
                estado_ftr_cgr = "FTR_EN_GESTION_PRELIMINAR"
                situacion_adversa = f"Contrato suscrito en SIAF pero registra S/ 0 devengados. Riesgo de retraso en movilización de maquinaria y abandono de cauce."
                alerta_penal = (pim >= 500000)
            elif pct >= 80.0:
                estado_ftr_cgr = "OBRA_CON_CONTRATO_EN_CAMPO"
                situacion_adversa = "Obra en fase final de culminación. Pendiente verificar liquidación física y prueba de capacidad hidráulica."
                alerta_penal = False
            else:
                estado_ftr_cgr = "OBRA_CON_CONTRATO_EN_CAMPO"
                situacion_adversa = f"Ejecución en curso ({pct:.1f}%). Requiere control concurrente permanente de horas-máquina y descolmatación efectiva."
                alerta_penal = (sem == "ROJO_INACCION_CRITICA")

            item_mef = {
                "id": f"MEF-{cui}",
                "cui_o_ftr": cui,
                "codigo_oficial": f"CUI {cui}",
                "fuente": "MEF_PP0068",
                "fuente_label": "MEF - Consulta Amigable (PP 0068)",
                "nombre_proyecto": nom,
                "nivel_gobierno": o.get("nivel_gobierno") or "GOBIERNO LOCAL",
                "entidad_ejecutora": o.get("gobierno_local_o_sector") or "Municipalidad / GORE",
                "ubigeo": ubigeo,
                "departamento": dep_final,
                "provincia": prov_final,
                "distrito": dist_final,
                "cuenca": o.get("cuenca_rio") or "Cuenca Local",
                "sector": dist_final,
                "pim_soles": pim,
                "devengado_soles": dev,
                "porcentaje_ejecucion": pct,
                "cuello_botella_siaf": cb,
                "estado_ftr_cgr": estado_ftr_cgr,
                "semaforo_cgr": sem,
                "situacion_adversa_cgr": situacion_adversa,
                "alerta_penal_art_377": alerta_penal,
                "alerta_penal_texto": o.get("alerta_penal_art_377"),
                "criterio_cgr_informe": "Consulta Amigable MEF PP 0068 & Directiva N° 018-2023-CG/BMPL",
                "poblacion_protegida": int(pim / 120) if pim > 0 else 500,  # Estimación paramétrica CGR
                "hectareas_cultivo": round(pim / 4500, 1) if pim > 0 else 15.0,
                "lat": None,
                "lon": None
            }
            items_unificados.append(item_mef)

        # -------------------------------------------------------------
        # 2. Procesar Puntos Críticos y Obras ANA (GeoSNIRH / FTR)
        # -------------------------------------------------------------
        for p in puntos_ana:
            idpc = p.get("id_punto_critico") or p.get("id_intervencion") or p.get("object_id")
            cod_ftr = p.get("codigo_ficha") or f"FTR-ANA-{idpc}"
            dep_ana = (p.get("departamento") or "SIN_DEP").upper()
            prov_ana = (p.get("provincia") or "SIN_PROV").upper()
            dist_ana = (p.get("distrito") or "SIN_DIST").upper()
            dep_ana_c = _strip_accents(dep_ana)
            dist_ana_c = _strip_accents(dist_ana)

            # Match Ubigeo
            ubigeo = "000000"
            if (dep_ana_c, dist_ana_c) in map_dep_dist:
                ubigeo, dep_ana, prov_ana, dist_ana = map_dep_dist[(dep_ana_c, dist_ana_c)]
            elif dist_ana_c in map_dist_only:
                ubigeo, dep_ana, prov_ana, dist_ana = map_dist_only[dist_ana_c][0]
            elif dep_ana_c in map_dep_only:
                ubigeo = map_dep_only[dep_ana_c][0][0]

            costo = float(p.get("costo_total_soles") or p.get("costo_directo_soles") or 0.0)
            estado_ana = (p.get("estado") or "POR EJECUTAR").upper()
            nivel_peligro = (p.get("nivel_peligro") or "MUY ALTO").upper()

            # Clasificación CGR según Informe N° 10671-2026-CG/AGR-SOP
            if "CULMINAD" in estado_ana or "TERMINAD" in estado_ana:
                estado_ftr_cgr = "OBRA_CON_CONTRATO_EN_CAMPO"
                cb_siaf = "CULMINADO_O_AVANZADO"
                sem_cgr = "VERDE_CONFORME"
                pct_ejec = 100.0
                dev_ana = costo
                situacion_adversa = "Intervención de descolmatación/defensa culminada por ANA. Requiere inspección post-ejecución de rasante de fondo."
                alerta_penal = False
            elif "EJECUCI" in estado_ana:
                estado_ftr_cgr = "OBRA_CON_CONTRATO_EN_CAMPO"
                cb_siaf = "EN_EJECUCION_REGULAR"
                sem_cgr = "AMARILLO_RIESGO" if nivel_peligro == "MUY ALTO" else "VERDE_CONFORME"
                pct_ejec = 45.0
                dev_ana = costo * 0.45
                situacion_adversa = f"Obra fluvial en ejecución física en cauce ({p.get('rio')}). Verificar rendimiento de maquinaria pesada y no acopio en faja marginal."
                alerta_penal = False
            elif "TRMITE" in estado_ana or "GESTI" in estado_ana or "LICIT" in estado_ana:
                estado_ftr_cgr = "FTR_EN_GESTION_PRELIMINAR"
                cb_siaf = "LICITACION_TRABADA"
                sem_cgr = "AMARILLO_RIESGO"
                pct_ejec = 10.0
                dev_ana = costo * 0.10
                situacion_adversa = f"FTR remitida a entidad ejecutora en trámite preliminar. Demora en adjudicación de maquinaria para punto crítico {p.get('sector')}."
                alerta_penal = False
            else:
                # Criterio CGR: 58% de FTR sin acción o 23% no recibidas
                if nivel_peligro == "MUY ALTO":
                    estado_ftr_cgr = "FTR_RECIBIDA_SIN_ACCION"
                    cb_siaf = "SIN_CERTIFICAR"
                    sem_cgr = "ROJO_INACCION_CRITICA"
                    pct_ejec = 0.0
                    dev_ana = 0.0
                    situacion_adversa = f"OBSERVACIÓN CGR INF. N° 10671: Punto crítico en Peligro MUY ALTO con FTR comunicada sin inicio de obras ni maquinaria en cauce. Riesgo inminente de desborde."
                    alerta_penal = True
                else:
                    estado_ftr_cgr = "FTR_NO_RECEPCIONADA"
                    cb_siaf = "SIN_CERTIFICAR"
                    sem_cgr = "AMARILLO_RIESGO"
                    pct_ejec = 0.0
                    dev_ana = 0.0
                    situacion_adversa = "FTR sin registro de avance físico ni financiero reportado a la CGR. Requiere notificación inmediata a OCI."
                    alerta_penal = False

            alerta_penal_texto = None
            if alerta_penal:
                alerta_penal_texto = (
                    f"ALERTA ART. 377 CP (Omisión Funcional): El punto crítico {p.get('sector')} en el río {p.get('rio')} "
                    f"figura con peligro MUY ALTO en la FTR {cod_ftr}, con presupuesto estimado de S/ {costo:,.2f} "
                    f"y protege a {p.get('poblacion_protegida', 0):,} pobladores, pero permanece sin ejecución física a puertas de la crecida FEN."
                )

            item_ana = {
                "id": f"ANA-{idpc}",
                "cui_o_ftr": cod_ftr,
                "codigo_oficial": cod_ftr,
                "fuente": "ANA_FTR",
                "fuente_label": "ANA / MIDAGRI - Ficha Técnica Referencial (FTR)",
                "nombre_proyecto": f"Defensa y Descolmatación ANA: {p.get('sector')} - Río {p.get('rio')}",
                "nivel_gobierno": "GOBIERNO NACIONAL",
                "entidad_ejecutora": "Autoridad Nacional del Agua (ANA) / MIDAGRI",
                "ubigeo": ubigeo,
                "departamento": dep_ana,
                "provincia": prov_ana,
                "distrito": dist_ana,
                "cuenca": p.get("cuenca") or "Cuenca Hidrográfica",
                "sector": p.get("sector") or "Sector Ribereño",
                "cauce": p.get("rio") or "Cauce Principal",
                "tipo_intervencion": p.get("tipo_intervencion") or "Descolmatación y Protección de Ribera",
                "nivel_peligro": nivel_peligro,
                "pim_soles": costo,
                "devengado_soles": dev_ana,
                "porcentaje_ejecucion": pct_ejec,
                "cuello_botella_siaf": cb_siaf,
                "estado_ftr_cgr": estado_ftr_cgr,
                "semaforo_cgr": sem_cgr,
                "situacion_adversa_cgr": situacion_adversa,
                "alerta_penal_art_377": alerta_penal,
                "alerta_penal_texto": alerta_penal_texto,
                "criterio_cgr_informe": "Informe N° 10671-2026-CG/AGR-SOP & D.S. N° 164-2026-EF",
                "poblacion_protegida": int(p.get("poblacion_protegida") or 0),
                "hectareas_cultivo": float(p.get("hectareas_cultivo") or 0.0),
                "tipo_cultivos": p.get("tipo_cultivos") or "Cultivos varios de valle",
                "lat": p.get("lat"),
                "lon": p.get("lon")
            }
            items_unificados.append(item_ana)

        self.catalogo_unificado = items_unificados
        self.catalogo_by_id = {item["id"]: item for item in items_unificados}

        # Construir árbol jerárquico de Ubigeos con conteo de obras
        self._construir_jerarquia_geografica()

    def _construir_jerarquia_geografica(self):
        """Construye estructura jerárquica Departamento -> Provincias -> Distritos (Ubigeos)."""
        arbol: Dict[str, Dict[str, Dict[str, Dict[str, Any]]]] = {}

        for it in self.catalogo_unificado:
            dep = it["departamento"]
            prov = it["provincia"]
            dist = it["distrito"]
            ubg = it["ubigeo"]

            if dep not in arbol:
                arbol[dep] = {}
            if prov not in arbol[dep]:
                arbol[dep][prov] = {}
            if dist not in arbol[dep][prov]:
                arbol[dep][prov][dist] = {
                    "ubigeo": ubg,
                    "distrito": dist,
                    "obras_mef": 0,
                    "fichas_ana": 0,
                    "total_intervenciones": 0
                }

            if it["fuente"] == "MEF_PP0068":
                arbol[dep][prov][dist]["obras_mef"] += 1
            else:
                arbol[dep][prov][dist]["fichas_ana"] += 1
            arbol[dep][prov][dist]["total_intervenciones"] += 1

        self.jerarquia_geografica = arbol

    # -------------------------------------------------------------------------
    # Métodos Públicos de Consulta y Filtrado
    # -------------------------------------------------------------------------
    def get_jerarquia_ubigeos(self) -> Dict[str, Any]:
        self._asegurar_inicializacion()
        return {
            "total_departamentos": len(self.jerarquia_geografica),
            "departamentos": sorted(list(self.jerarquia_geografica.keys())),
            "estructura": self.jerarquia_geografica
        }

    def get_catalogo_unificado(
        self,
        ubigeo: Optional[str] = None,
        departamento: Optional[str] = None,
        provincia: Optional[str] = None,
        distrito: Optional[str] = None,
        fuente: str = "TODAS",
        nivel_gobierno: str = "TODOS",
        cuello_botella: str = "TODOS",
        estado_ftr: str = "TODOS",
        semaforo: str = "TODOS",
        busqueda: str = "",
        limite: int = 50,
        offset: int = 0
    ) -> Dict[str, Any]:
        self._asegurar_inicializacion()
        res = self.catalogo_unificado

        # 1. Filtro por Ubigeo (exacto o prefijo)
        if ubigeo and ubigeo != "TODOS" and ubigeo != "":
            u_clean = ubigeo.strip()
            res = [it for it in res if it["ubigeo"].startswith(u_clean) or u_clean in it["ubigeo"]]

        # 2. Filtro por Departamento
        if departamento and departamento != "TODOS" and departamento != "":
            dep_norm = _strip_accents(departamento)
            res = [it for it in res if _strip_accents(it["departamento"]) == dep_norm]

        # 3. Filtro por Provincia
        if provincia and provincia != "TODOS" and provincia != "":
            prov_norm = _strip_accents(provincia)
            res = [it for it in res if _strip_accents(it["provincia"]) == prov_norm]

        # 4. Filtro por Distrito
        if distrito and distrito != "TODOS" and distrito != "":
            dist_norm = _strip_accents(distrito)
            res = [it for it in res if _strip_accents(it["distrito"]) == dist_norm]

        # 5. Filtro por Fuente
        if fuente != "TODAS":
            res = [it for it in res if it["fuente"] == fuente]

        # 6. Filtro por Nivel de Gobierno
        if nivel_gobierno != "TODOS":
            res = [it for it in res if nivel_gobierno in it["nivel_gobierno"].upper()]

        # 7. Filtro por Cuello de Botella SIAF
        if cuello_botella != "TODOS":
            res = [it for it in res if it["cuello_botella_siaf"] == cuello_botella]

        # 8. Filtro por Estado FTR CGR
        if estado_ftr != "TODOS":
            res = [it for it in res if it["estado_ftr_cgr"] == estado_ftr]

        # 9. Filtro por Semáforo CGR
        if semaforo != "TODOS":
            res = [it for it in res if it["semaforo_cgr"] == semaforo]

        # 10. Buscador de Texto Universal
        if busqueda:
            q = _strip_accents(busqueda)
            res = [
                it for it in res
                if q in _strip_accents(it["nombre_proyecto"])
                or q in _strip_accents(it["cui_o_ftr"])
                or q in _strip_accents(it["sector"])
                or q in _strip_accents(it.get("cauce", ""))
                or q in _strip_accents(it["entidad_ejecutora"])
                or q in it["ubigeo"]
            ]

        total_filtrado = len(res)
        paginados = res[offset: offset + limite]

        # Calcular KPIs dinámicos del conjunto filtrado
        pim_total = sum(it["pim_soles"] for it in res)
        dev_total = sum(it["devengado_soles"] for it in res)
        avance_pct = (dev_total / pim_total * 100) if pim_total > 0 else 0.0
        pob_total = sum(it["poblacion_protegida"] for it in res)
        ha_total = sum(it["hectareas_cultivo"] for it in res)

        rojos = sum(1 for it in res if it["semaforo_cgr"] == "ROJO_INACCION_CRITICA")
        amarillos = sum(1 for it in res if it["semaforo_cgr"] == "AMARILLO_RIESGO")
        verdes = sum(1 for it in res if it["semaforo_cgr"] == "VERDE_CONFORME")

        ftr_sin_accion = sum(1 for it in res if it["estado_ftr_cgr"] in ["FTR_RECIBIDA_SIN_ACCION", "FTR_NO_RECEPCIONADA"])

        return {
            "metadata": {
                "total_registros_universo": len(self.catalogo_unificado),
                "total_filtrado": total_filtrado,
                "limite": limite,
                "offset": offset,
                "criterio_cgr": "Informe N° 10671-2026-CG/AGR-SOP & Directiva N° 018-2023-CG/BMPL"
            },
            "kpis_resumen": {
                "pim_total_soles": round(pim_total, 2),
                "devengado_total_soles": round(dev_total, 2),
                "avance_financiero_pct": round(avance_pct, 1),
                "poblacion_protegida_total": pob_total,
                "hectareas_cultivo_total": round(ha_total, 1),
                "alertas_rojas_art_377": rojos,
                "alertas_amarillas_riesgo": amarillos,
                "verdes_conforme": verdes,
                "ftr_sin_accion_cgr": ftr_sin_accion
            },
            "obras": paginados
        }

    def get_obra_por_id(self, obra_id: str) -> Optional[Dict[str, Any]]:
        self._asegurar_inicializacion()
        return self.catalogo_by_id.get(obra_id)

    def get_cruce_mef_contraloria(self) -> Dict[str, Any]:
        """Retrocompatibilidad con endpoint anterior /api/v1/mef-obras/cgr-cruce."""
        self._asegurar_inicializacion()
        obras_mef = mef_obras_service.obras
        discrepancias: List[Dict[str, Any]] = []

        for p_cgr in self.puntos_criticos_cgr:
            cuenca = p_cgr["cuenca"]
            dep = p_cgr["departamento"]

            obras_coincidentes = [
                o for o in obras_mef
                if o.get("cuenca_rio") == cuenca or o.get("departamento") == dep
            ]

            total_pim_cuenca = sum(o["pim_soles"] for o in obras_coincidentes)
            total_dev_cuenca = sum(o["devengado_soles"] for o in obras_coincidentes)
            promedio_avance = (total_dev_cuenca / total_pim_cuenca * 100) if total_pim_cuenca > 0 else 0.0

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
            "fecha_analisis": "2026-09-25",
            "total_cuencas_auditadas": len(discrepancias),
            "discrepancias_criticas": discrepancias
        }


cgr_auditoria_obras_service = CgrAuditoriaObrasService()
