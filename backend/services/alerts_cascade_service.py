# backend/services/alerts_cascade_service.py
"""
Servicio C2 de Alertas en Cascada Tripartita (AMARU-CLIMATE)
============================================================
Doctrina C2 de Articulación Escalonada:
1. COED Nacional AMARU: Vigilancia multi-modelo (ECMWF 9km, radar, satélite, GloFAS) y emisión de alertas tempranas EAP (T-144h, T-72h, T-24h).
2. COED Municipal AMARU: Bandeja del Alcalde (recepción por UBIGEO, cruce hiperlocal con SARE/ANA/Bofedales, detonación presupuestal PP 0068 y traducción comunitaria).
3. COED Social AMARU: Consola de la Sociedad Organizada (semáforo sin tecnicismos, albergues seguros, lenguas originarias y telemetría ciudadana inversa).
"""

import os
import json
import hashlib
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field


class EmisionAlertaNacionalRequest(BaseModel):
    titulo: str = Field(..., description="Título de la alerta oficial")
    regimen: str = Field(..., description="PLUVIAL_FEN, CRIOCLIMA_CHIRI o INCENDIO_FORESTAL")
    nivel_alerta: str = Field(..., description="ROJO, NARANJA o AMARILLO")
    lead_time: str = Field(..., description="T-144h, T-72h o T-24h")
    distritos_objetivo: List[str] = Field(..., description="Lista de UBIGEOs destinatarios")
    gatillo_cientifico: str = Field(..., description="Fundamentación físico-meteorológica")
    acciones_mandatadas: List[str] = Field(default=[], description="Acciones obligatorias EAP")
    emisor_responsable: str = Field(default="Comando C2 COED Nacional AMARU", description="Autoridad emisora")


class ValidacionDetonacionMunicipalRequest(BaseModel):
    id_alerta: str
    ubigeo: str
    autoridad_solicitante: str = Field(default="Alcalde Distrital / Presidente GT-GRD")
    orden_combustible_galones: Optional[int] = 500
    motobombas_desplegadas: Optional[int] = 4
    pacas_heno_asignadas: Optional[int] = 400
    horas_tractor_oruga_d8: Optional[int] = 45
    cisternas_desplegadas: Optional[int] = 2
    faja_cortafuego_km: Optional[float] = 10.0
    albergues_habilitados: List[str] = Field(default=["Colegio Emblemático Local / Polideportivo Municipal"])
    mensaje_comunitario_custom: Optional[str] = None
    habilitar_alerta_social: bool = True


class AprobacionHumanaNacionalRequest(BaseModel):
    id_alerta: str
    aprobador_nombre: str = Field(..., min_length=4, description="Nombre y Apellidos del Oficial de Guardia / Director")
    aprobador_dni: str = Field(..., min_length=8, max_length=8, description="DNI del Oficial responsable")
    cargo_institucional: str = Field(default="Oficial de Guardia C2 / Director de Análisis Territorial COED Nacional")
    observaciones_tecnicas: str = Field(default="Cotejado con hidrogramas y telemetría de campo.")
    confirmacion_no_sismate: bool = Field(..., description="Ratificación expresa de no-suplantación del SISMATE/COEN")


class AlertsCascadeService:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(AlertsCascadeService, cls).__new__(cls)
            cls._instance._init_service()
        return cls._instance

    def _init_service(self):
        self.base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        self.data_dir = os.path.join(self.base_dir, "data")
        self._alertas_nacionales: Dict[str, Dict[str, Any]] = {}
        self._bandejas_municipales: Dict[str, List[Dict[str, Any]]] = {}
        self._alertas_sociales_activas: Dict[str, List[Dict[str, Any]]] = {}
        self._historial_transacciones_sha256: List[Dict[str, Any]] = []
        self._seed_initial_alerts()

    def _seed_initial_alerts(self):
        """Inicializa alertas canónicas operativas de alta fidelidad para la Costa Norte y Altiplano."""
        # 1. Alerta Piura y Bajo Piura (FEN Torrencial T-72h)
        alerta_piura_id = "ALT-NAT-2026-001"
        alerta_piura = {
            "id_alerta": alerta_piura_id,
            "titulo": "Alerta Táctica T-72h: Convergencia Pluvial Extrema y Crecida Inminente del Río Piura",
            "regimen": "PLUVIAL_FEN",
            "nivel_alerta": "ROJO",
            "lead_time": "T-72h",
            "horas_anticipacion": 72,
            "distritos_objetivo": ["200101", "200104", "200105", "200114"], # Piura, Castilla, Catacaos, Tambogrande
            "distritos_nombres": ["Piura", "Castilla", "Catacaos", "Tambogrande"],
            "departamento": "PIURA",
            "cuenca": "Cuenca Chira-Piura",
            "gatillo_cientifico": "CAPE 1,420 J/kg con anomalía TSM Niño 1+2 (+2.8°C). Modelo ECMWF IFS 9km proyecta 48 mm/24h en cuenca media y caudal GloFAS de 1,650 m³/s en Puente Sánchez Cerro.",
            "impacto_territorial_estimado": {
                "poblacion_expuesta": 320000,
                "manzanas_ana_criticas": 32,
                "cuencas_ciegas_sare_en_peligro": ["El Chilcal", "La Rinconada", "Ignacio Merino", "Gullman"],
                "puentes_en_riesgo": ["Puente Sánchez Cerro", "Puente Bolognesi", "Puente Independencia"]
            },
            "acciones_mandatadas_eap": [
                "1. Despliegue perentorio y encendido al 100% de electrobombas y motobombas SARE de 6\" en cuencas ciegas.",
                "2. Apertura inmediata de albergues seguros en Colegio San Miguel y Polideportivo de Piura.",
                "3. Emisión de alerta preventiva a dirigentes de Juntas Vecinales y evacuación voluntaria de faja marginal.",
                "4. Notificación formal a EPS Grau para resguardo de plantas de tratamiento de agua potable."
            ],
            "emisor_responsable": "Comando C2 COED Nacional AMARU",
            "fecha_emision_utc": datetime.now(timezone.utc).isoformat(),
            "estado_general": "DESPACHADA_A_MUNICIPIOS",
            "hash_sha256": hashlib.sha256(f"{alerta_piura_id}-FEN-PIURA-2026".encode("utf-8")).hexdigest()
        }
        self._alertas_nacionales[alerta_piura_id] = alerta_piura

        # 2. Alerta Lambayeque - Cuenca La Leche (T-144h Pre-posicionamiento Terrestre)
        alerta_leche_id = "ALT-NAT-2026-002"
        alerta_leche = {
            "id_alerta": alerta_leche_id,
            "titulo": "Alerta Estratégica T-144h: Pre-posicionamiento Terrestre ante Crecida en Cuenca Río La Leche",
            "regimen": "PLUVIAL_FEN",
            "nivel_alerta": "NARANJA",
            "lead_time": "T-144h",
            "horas_anticipacion": 144,
            "distritos_objetivo": ["140304", "140308", "140305"], # Íllimo, Pacora, Jayanca
            "distritos_nombres": ["Íllimo", "Pacora", "Jayanca"],
            "departamento": "LAMBAYEQUE",
            "cuenca": "Cuenca Valle La Leche",
            "gatillo_cientifico": "Saturación de suelo capa 3 superior al 78% en cabecera de cuenca. Proyección de onda hidrológica superior a 380 m³/s en T-144h.",
            "impacto_territorial_estimado": {
                "poblacion_expuesta": 45000,
                "manzanas_ana_criticas": 18,
                "cuencas_ciegas_sare_en_peligro": ["Sector Puente La Leche", "San Pedro de Sasape"],
                "puentes_en_riesgo": ["Puente La Leche Panamericana Norte"]
            },
            "acciones_mandatadas_eap": [
                "1. Enviar convoy terrestre con 30 TM de alimentos BAH a almacenes adelantados de Íllimo antes de corte de vía.",
                "2. Limpieza de defensas ribereñas con tractor sobre oruga D8.",
                "3. Mesa técnica de alerta temprana con comités de regantes del valle."
            ],
            "emisor_responsable": "Comando C2 COED Nacional AMARU",
            "fecha_emision_utc": datetime.now(timezone.utc).isoformat(),
            "estado_general": "DESPACHADA_A_MUNICIPIOS",
            "hash_sha256": hashlib.sha256(f"{alerta_leche_id}-FEN-LECHE-2026".encode("utf-8")).hexdigest()
        }
        self._alertas_nacionales[alerta_leche_id] = alerta_leche

        # 3. Alerta Puno - Mazocruz y Macusani (Heladas Extremas y Nevadas T-24h)
        alerta_puno_id = "ALT-NAT-2026-003"
        alerta_puno = {
            "id_alerta": alerta_puno_id,
            "titulo": "Alerta Operativa Inminente T-24h: Helada Polar Extrema (-18.5°C) y Nevadas Severas",
            "regimen": "CRIOCLIMA_CHIRI",
            "nivel_alerta": "ROJO",
            "lead_time": "T-24h",
            "horas_anticipacion": 24,
            "distritos_objetivo": ["210504", "210301", "211002"], # Mazocruz, Macusani, Ananea
            "distritos_nombres": ["Santa Rosa de Mazocruz", "Macusani", "Ananea"],
            "departamento": "PUNO",
            "cuenca": "Altiplano Ramis - Ilave",
            "gatillo_cientifico": "Incursión de masa de aire polar antártico con subsidencia extrema de humedad. Open-Meteo IFS prevé -18.5°C y nevada acumulada de 14.5 cm en puna sobre 4,100 msnm.",
            "impacto_territorial_estimado": {
                "poblacion_expuesta": 49820,
                "ninos_menores_5_anos": 3339,
                "alpacas_en_riesgo": 207173,
                "ovinos_en_riesgo": 82537,
                "superficie_bofedales_congelados_ha": 292000
            },
            "acciones_mandatadas_eap": [
                "1. Refugio nocturno obligatorio de crías y alpacas preñadas en cobertizos térmicos con cama de paja.",
                "2. Despacho perentorio de 1,800 pacas de heno de avena y 85 kits veterinarios de antibióticos.",
                "3. Distribución de frazadas térmicas y resguardo de menores en postas de salud I-3 / I-4.",
                "4. Suspensión de faenas escolares y pastoreo en campo abierto."
            ],
            "emisor_responsable": "Comando C2 COED Nacional AMARU",
            "fecha_emision_utc": datetime.now(timezone.utc).isoformat(),
            "estado_general": "DESPACHADA_A_MUNICIPIOS",
            "hash_sha256": hashlib.sha256(f"{alerta_puno_id}-CHIRI-PUNO-2026".encode("utf-8")).hexdigest()
        }
        self._alertas_nacionales[alerta_puno_id] = alerta_puno

        # Población inicial de bandejas municipales para los distritos objetivo
        self._distribuir_alerta_a_bandejas(alerta_piura)
        self._distribuir_alerta_a_bandejas(alerta_leche)
        self._distribuir_alerta_a_bandejas(alerta_puno)

    def _distribuir_alerta_a_bandejas(self, alerta: Dict[str, Any]):
        """Copia la alerta nacional hacia la bandeja de entrada privada de cada municipio."""
        for ubigeo in alerta["distritos_objetivo"]:
            if ubigeo not in self._bandejas_municipales:
                self._bandejas_municipales[ubigeo] = []

            # Verificar si ya existe en la bandeja
            existe = any(a["id_alerta"] == alerta["id_alerta"] for a in self._bandejas_municipales[ubigeo])
            if not existe:
                alerta_mun = {
                    **alerta,
                    "ubigeo_destinatario": ubigeo,
                    "estado_municipal": "RECIBIDA_PENDIENTE_VALIDACION",
                    "fecha_ingreso_bandeja": datetime.now(timezone.utc).isoformat(),
                    "validado_por": None,
                    "fecha_validacion": None,
                    "orden_despacho_eap": None,
                    "alerta_social_emitida": False
                }
                self._bandejas_municipales[ubigeo].append(alerta_mun)

    def get_resumen_nacional(self) -> Dict[str, Any]:
        """Retorna el concentrador consolidado de alertas C2 para el COED Nacional."""
        todas = list(self._alertas_nacionales.values())
        
        # Conteo global
        total_emitidas = len(todas)
        total_distritos_cubiertos = len(set(u for a in todas for u in a.get("distritos_objetivo", [])))
        
        alertas_por_nivel = {"ROJO": 0, "NARANJA": 0, "AMARILLO": 0}
        alertas_por_lead = {"T-144h": 0, "T-72h": 0, "T-24h": 0}
        alertas_por_regimen = {"PLUVIAL_FEN": 0, "CRIOCLIMA_CHIRI": 0}

        for a in todas:
            lvl = a.get("nivel_alerta", "AMARILLO")
            alertas_por_nivel[lvl] = alertas_por_nivel.get(lvl, 0) + 1
            lt = a.get("lead_time", "T-72h")
            alertas_por_lead[lt] = alertas_por_lead.get(lt, 0) + 1
            rg = a.get("regimen", "PLUVIAL_FEN")
            alertas_por_regimen[rg] = alertas_por_regimen.get(rg, 0) + 1

        # Cuántas han sido validadas por los alcaldes
        total_en_bandeja = sum(len(items) for items in self._bandejas_municipales.values())
        validadas_alcaldes = sum(
            1 for items in self._bandejas_municipales.values() for a in items if a.get("estado_municipal") == "DETONADA_Y_COMUNICADA"
        )

        return {
            "sistema": "AMARU-CLIMATE C2 • Concentrador Tripartito de Alertas",
            "entidad_emisora": "COED Nacional AMARU",
            "estadisticas": {
                "total_alertas_nacionales": total_emitidas,
                "total_distritos_alertados": total_distritos_cubiertos,
                "total_items_en_bandejas": total_en_bandeja,
                "alertas_validadas_por_alcaldes": validadas_alcaldes,
                "distribucion_niveles": alertas_por_nivel,
                "distribucion_lead_times": alertas_por_lead,
                "distribucion_regimen": alertas_por_regimen
            },
            "alertas_activas": todas,
            "timestamp_utc": datetime.now(timezone.utc).isoformat()
        }

    def emitir_alerta_nacional(self, req: EmisionAlertaNacionalRequest) -> Dict[str, Any]:
        """El COED Nacional despacha una nueva alerta anticipatoria con sello criptográfico hacia los municipios."""
        now_iso = datetime.now(timezone.utc).isoformat()
        nuevo_id = f"ALT-NAT-{int(datetime.now(timezone.utc).timestamp())}"
        
        sha_str = f"{nuevo_id}-{req.regimen}-{req.nivel_alerta}-{','.join(req.distritos_objetivo)}-{now_iso}"
        hash_sha256 = hashlib.sha256(sha_str.encode("utf-8")).hexdigest()

        alerta_nueva = {
            "id_alerta": nuevo_id,
            "titulo": req.titulo,
            "regimen": req.regimen,
            "nivel_alerta": req.nivel_alerta,
            "lead_time": req.lead_time,
            "horas_anticipacion": 144 if req.lead_time == "T-144h" else (72 if req.lead_time == "T-72h" else 24),
            "distritos_objetivo": req.distritos_objetivo,
            "distritos_nombres": [f"Distrito UBIGEO {u}" for u in req.distritos_objetivo],
            "gatillo_cientifico": req.gatillo_cientifico,
            "acciones_mandatadas_eap": req.acciones_mandatadas,
            "emisor_responsable": req.emisor_responsable,
            "fecha_emision_utc": now_iso,
            "estado_general": "PROPUESTA_AGENTICA_PENDIENTE",
            "auditoria_hitl": None,
            "hash_sha256": hash_sha256
        }

        self._alertas_nacionales[nuevo_id] = alerta_nueva
        # Nota: Por Soberanía Humana (Ley 31814 / D.S. 115-2025-PCM),
        # NO se distribuye a las bandejas municipales hasta contar con firma humana (HITL).

        registro_auditoria = {
            "evento": "PROPUESTA_ALERTA_AGENTICA_GENERADA",
            "id_alerta": nuevo_id,
            "emisor": req.emisor_responsable,
            "hash_sha256": hash_sha256,
            "timestamp": now_iso
        }
        self._historial_transacciones_sha256.append(registro_auditoria)

        return {
            "status": "PROPUESTA_AGENTICA_REGISTRADA",
            "id_alerta": nuevo_id,
            "mensaje": "Propuesta de alerta generada por IA. Requiere aprobación y firma humana (HITL) para distribución institucional.",
            "hash_criptografico_sha256": f"SHA256:{hash_sha256}",
            "fecha_emision": now_iso,
            "alerta": alerta_nueva
        }

    def aprobar_alerta_nacional_hitl(self, req: AprobacionHumanaNacionalRequest) -> Dict[str, Any]:
        """
        PUERTA SOBERANA DE APROBACIÓN HUMANA (Custodio HITL):
        Un Oficial de Guardia C2 / Director Técnico valida y firma digitalmente
        la transición de 'PROPUESTA_AGENTICA_PENDIENTE' a 'VALIDADA_DISTRIBUCION_INSTITUCIONAL'.
        Solo tras esta firma se copia y distribuye a las bandejas municipales.
        """
        if not req.confirmacion_no_sismate:
            raise ValueError("Debe ratificar expresamente que esta alerta es técnica institucional y no constituye una alerta celular SISMATE directa.")

        alerta = self._alertas_nacionales.get(req.id_alerta)
        if not alerta:
            raise KeyError(f"Alerta {req.id_alerta} no encontrada en el repositorio nacional.")

        now_iso = datetime.now(timezone.utc).isoformat()
        raw_seal = f"{req.id_alerta}|{req.aprobador_dni}|{now_iso}|{alerta['hash_sha256']}"
        sello_firma = hashlib.sha256(raw_seal.encode("utf-8")).hexdigest()

        # Transición de Estado por Autoridad Humana
        alerta["estado_general"] = "VALIDADA_DISTRIBUCION_INSTITUCIONAL"
        alerta["auditoria_hitl"] = {
            "aprobador_nombre": req.aprobador_nombre,
            "aprobador_dni": req.aprobador_dni,
            "cargo": req.cargo_institucional,
            "fecha_firma_utc": now_iso,
            "observaciones": req.observaciones_tecnicas,
            "sello_firma_sha256": f"SHA256:{sello_firma}",
            "declaracion_no_sismate": True,
            "estatus_legal": "APROBADO_CON_DELIMITACION_SISMATE"
        }

        # Despachar formalmente a bandejas municipales de los UBIGEOS objetivo
        self._distribuir_alerta_a_bandejas(alerta)

        registro_auditoria = {
            "evento": "FIRMA_HITL_APROBACION_NACIONAL",
            "id_alerta": req.id_alerta,
            "oficial_firmante": f"{req.aprobador_nombre} (DNI {req.aprobador_dni})",
            "sello_firma": f"SHA256:{sello_firma}",
            "timestamp": now_iso
        }
        self._historial_transacciones_sha256.append(registro_auditoria)

        return {
            "status": "APROBACION_HUMANA_EXITOSA",
            "id_alerta": req.id_alerta,
            "nuevo_estado": "VALIDADA_DISTRIBUCION_INSTITUCIONAL",
            "distritos_notificados": len(alerta["distritos_objetivo"]),
            "sello_firma_sha256": f"SHA256:{sello_firma}",
            "alerta": alerta
        }

    def get_bandeja_municipal(self, ubigeo: str) -> Dict[str, Any]:
        """Retorna la Bandeja de Entrada privada del Alcalde y su Grupo de Trabajo (GT-GRD)."""
        alertas = self._bandejas_municipales.get(ubigeo, [])
        
        # Si no hay alertas para este distrito, generar una alerta de vigilancia preventiva
        if not alertas:
            alerta_standby = {
                "id_alerta": f"ALT-STANDBY-{ubigeo}",
                "titulo": "Vigilancia Meteorológica Preventiva (Sin Alerta Crítica Extrema)",
                "regimen": "PLUVIAL_FEN",
                "nivel_alerta": "VERDE",
                "lead_time": "T-144h",
                "horas_anticipacion": 144,
                "distritos_objetivo": [ubigeo],
                "ubigeo_destinatario": ubigeo,
                "gatillo_cientifico": "Valores hidrometeorológicos dentro del rango normal. Monitoreo pasivo de cuencas.",
                "acciones_mandatadas_eap": [
                    "Mantener canales de comunicación abiertos con COED Regional.",
                    "Monitoreo de descolmatación preventiva habitual."
                ],
                "estado_municipal": "EN_VIGILANCIA_ESTABLE",
                "fecha_ingreso_bandeja": datetime.now(timezone.utc).isoformat(),
                "alerta_social_emitida": False
            }
            alertas = [alerta_standby]

        return {
            "ubigeo": ubigeo,
            "entidad": f"Municipalidad Distrital / COED Municipal ({ubigeo})",
            "total_alertas_bandeja": len(alertas),
            "alertas_pendientes_validacion": sum(1 for a in alertas if a.get("estado_municipal") == "RECIBIDA_PENDIENTE_VALIDACION"),
            "alertas": alertas,
            "habilitante_legal": "D.S. Nº 124-2026-PCM / TUO Ley 30225 Art. 27 lit. b / PP 0068",
            "timestamp": datetime.now(timezone.utc).isoformat()
        }

    def validar_y_detonar_municipal(self, req: ValidacionDetonacionMunicipalRequest) -> Dict[str, Any]:
        """
        El Alcalde valida la alerta nacional, firma el acta criptográfica EAP
        y aprueba la emisión de la alerta comunitaria para la sociedad organizada.
        """
        ubigeo = req.ubigeo
        bandeja = self._bandejas_municipales.get(ubigeo, [])
        alerta_encontrada = next((a for a in bandeja if a["id_alerta"] == req.id_alerta), None)

        now_iso = datetime.now(timezone.utc).isoformat()
        hash_acta = hashlib.sha256(f"EAP-{ubigeo}-{req.id_alerta}-{req.autoridad_solicitante}-{now_iso}".encode("utf-8")).hexdigest()

        # Generar orden de despacho y mensajes comunitarios en lenguas originarias
        orden_despacho = {
            "id_acta": f"ACTA-EAP-MUN-{ubigeo}-{int(datetime.now(timezone.utc).timestamp())}",
            "autoridad_firmante": req.autoridad_solicitante,
            "recursos_asignados": {
                "combustible_galones": req.orden_combustible_galones,
                "motobombas_sare_desplegadas": req.motobombas_desplegadas,
                "pacas_heno_asignadas": req.pacas_heno_asignadas,
                "horas_tractor_oruga_d8": req.horas_tractor_oruga_d8,
                "cisternas_desplegadas": req.cisternas_desplegadas,
                "faja_cortafuego_km": req.faja_cortafuego_km,
                "albergues_habilitados": req.albergues_habilitados
            },
            "hash_criptografico_sha256": f"SHA256:{hash_acta}",
            "fecha_detonacion_utc": now_iso
        }

        # Generar alerta social comunitaria estructurada
        regimen_str = alerta_encontrada.get("regimen", "") if alerta_encontrada else ""
        es_chiri = "CRIOCLIMA" in regimen_str
        es_incendio = "INCENDIO" in regimen_str
        
        if es_incendio:
            mensaje_es = req.mensaje_comunitario_custom or f"ALERTA ROJA POR INCENDIO FORESTAL: Foco activo avanzando con ráfagas de viento. Queda estrictamente prohibida la quema de rastrojos agrícolas. Evacuar ganado y familias hacia {req.albergues_habilitados[0]}."
            mensaje_quechua = "SALLQA NINA RAWRAY WILLAKUY: Wayrawan nina utqaylla mastarikuchkan. Ama chakra q'upata kañaychikchu. Qispikuychik albergue nisqaman."
            mensaje_aymara = "MONTE NINA PHICHIWI YATIYAWI: Thayampi nina jank'aki phichantaski. Janiraki yapu q'upanak phichapxati. Qurpachasipxam albergue ukaru."
        elif es_chiri:
            mensaje_es = req.mensaje_comunitario_custom or f"ALERTA ROJA POR HELADA EXTREMA: Proteger crías en cobertizos y acudir a la posta ante síntomas de neumonía. Refugio en {req.albergues_habilitados[0]}."
            mensaje_quechua = "LLUMPAY CHIRI WILLAKUY: Uywakunata cobertizoman churaychik, wawakunata unquqtin posta medicoman pusaychik."
            mensaje_aymara = "CH'IJIRI JACH'A YATIYAWI: Uywanakaru cobertizoru apapxam, wawanakaru qullaña utaru pusapxam."
        else:
            mensaje_es = req.mensaje_comunitario_custom or f"ALERTA TEMPRANA POR LLUVIAS TORRENCIALES: Evacuar voluntariamente fajas marginales. Albergue seguro habilitado en {req.albergues_habilitados[0]}."
            mensaje_quechua = "SINCHI PARA WILLAKUY: Mayu patapi kaqkuna albergue nisqaman rispa qispikuychik."
            mensaje_aymara = "JACH'A JALLU YATIYAWI: Jawira thiyankirinaka albergue ukaru qurpachasipxam."

        alerta_social = {
            "id_alerta_social": f"ALT-SOC-{ubigeo}-{int(datetime.now(timezone.utc).timestamp())}",
            "ubigeo": ubigeo,
            "nivel_alerta": alerta_encontrada.get("nivel_alerta", "ROJO") if alerta_encontrada else "ROJO",
            "semáforo_ciudadano": "🔴 PELIGRO INMINENTE / REFUGIO" if alerta_encontrada and alerta_encontrada.get("nivel_alerta") == "ROJO" else "🟡 ALERTA PREVENTIVA",
            "instrucciones_comunitarias": {
                "castellano": mensaje_es,
                "quechua": mensaje_quechua,
                "aymara": mensaje_aymara
            },
            "albergues_seguros": req.albergues_habilitados,
            "numeros_emergencia": [
                {"entidad": "Serenazgo / COED Municipal", "telefono": "073-308822"},
                {"entidad": "Comisaría PNP", "telefono": "105"},
                {"entidad": "Bomberos Voluntarios", "telefono": "116"},
                {"entidad": "SAMU Ambulancia MINSA", "telefono": "106"}
            ],
            "hash_acta_sha256": f"SHA256:{hash_acta}",
            "fecha_publicacion": now_iso
        }

        # Actualizar estado en la bandeja del alcalde
        if alerta_encontrada:
            alerta_encontrada["estado_municipal"] = "DETONADA_Y_COMUNICADA"
            alerta_encontrada["validado_por"] = req.autoridad_solicitante
            alerta_encontrada["fecha_validacion"] = now_iso
            alerta_encontrada["orden_despacho_eap"] = orden_despacho
            alerta_encontrada["alerta_social_emitida"] = True

        # Publicar en el tablero de la comunidad
        if ubigeo not in self._alertas_sociales_activas:
            self._alertas_sociales_activas[ubigeo] = []
        self._alertas_sociales_activas[ubigeo].insert(0, alerta_social)

        return {
            "status": "VALIDACION_Y_DETONACION_EXITOSA",
            "ubigeo": ubigeo,
            "id_alerta": req.id_alerta,
            "orden_despacho": orden_despacho,
            "alerta_social_publicada": alerta_social
        }

    def get_consola_social(self, ubigeo: str) -> Dict[str, Any]:
        """Retorna la vista limpia para la Sociedad Organizada (Juntas vecinales, rondas, comités de regantes)."""
        alertas = self._alertas_sociales_activas.get(ubigeo, [])
        
        # Si no hay alerta social activa aún, entregar el semáforo cívico por defecto
        if not alertas:
            alertas = [{
                "id_alerta_social": f"ALT-SOC-NORMAL-{ubigeo}",
                "ubigeo": ubigeo,
                "nivel_alerta": "VERDE",
                "semáforo_ciudadano": "🟢 CONDICIONES NORMALES / VIGILANCIA",
                "instrucciones_comunitarias": {
                    "castellano": "Condiciones climáticas sin riesgo inmediato. Mantener techos libres de escombros y limpiar acequias comunitarias.",
                    "quechua": "Allillanmi kachkanchik. Wasi qatata pichaychik, yaku purinamanta ch'ikikunata qispichiychik.",
                    "aymara": "Walikiskiwa. Utanaka q'umachapxam, um sarawinaka allipxam."
                },
                "albergues_seguros": ["Colegio San Miguel / Polideportivo Municipal (En reserva)"],
                "numeros_emergencia": [
                    {"entidad": "COED Municipal", "telefono": "073-308822"},
                    {"entidad": "PNP", "telefono": "105"}
                ],
                "hash_acta_sha256": "SHA256:0000000000000000000000000000000000000000000000000000000000000000",
                "fecha_publicacion": datetime.now(timezone.utc).isoformat()
            }]

        return {
            "ubigeo": ubigeo,
            "sociedad_organizada": "Juntas Vecinales, Rondas Campesinas y Comités de Regantes",
            "alerta_vigente": alertas[0],
            "historial_alertas_comunitarias": alertas,
            "protocolo_ciudadano": {
                "paso_1": "1. Mantener la calma y consultar únicamente fuentes oficiales AMARU / COED Municipal.",
                "paso_2": "2. Proteger niños, ancianos y documentos de identidad en bolsa plástica impermeable.",
                "paso_3": "3. Si su vivienda se ubica en faja marginal o quebrada, trasladarse al albergue designado antes del anochecer.",
                "paso_4": "4. Enviar reportes fotográficos de inundación o helada mediante el botón 'Reporte Ciudadano'."
            },
            "timestamp": datetime.now(timezone.utc).isoformat()
        }


# Instancia Global
alerts_cascade_service = AlertsCascadeService()
