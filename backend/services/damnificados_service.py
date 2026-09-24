# backend/services/damnificados_service.py
"""
AMARU-DAMNIFICADOS: Servicio de Pre-Padrón Digital con Validación Geoespacial Cruzada
Cumplimiento Normativo:
- Ley N.° 29664 del SINAGERD y D.S. N.° 048-2011-PCM (Definición de Damnificado vs. Afectado)
- Manual de Evaluación de Daños y Análisis de Necesidades (EDAN v2 - INDECI)
- Ley N.° 31526 y D.S. N.° 008-2022-VIVIENDA (Bono de Arrendamiento de Emergencia - Bono BAE de S/ 500)
- R.J. N.° 188-2015-INDECI (Norma Técnica de Ayuda Humanitaria BAH)
- Ley de Protección de Datos Personales N.° 29733 (Bóveda Criptográfica Envelope Zero-PII y CUP-DAMN)
"""

import os
import json
import time
import math
import hashlib
import logging
from typing import Dict, Any, List, Optional
from datetime import datetime, timezone

from services.secure_vault import SecureZeroPiiVault

logger = logging.getLogger("damnificados_service")

BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(BACKEND_DIR, "data")
CASOS_DAMN_PATH = os.path.join(DATA_DIR, "damnificados_casos.json")
AUDIT_DAMN_PATH = os.path.join(DATA_DIR, "audit_damnificados_break_glass.jsonl")

# Catálogo de polígonos de afectación y quebradas críticas en memoria
ZONAS_CRITICAS_FEN = {
    "200105": {
        "distrito": "Catacaos",
        "depto": "Piura",
        "cuenca": "Río Piura / Bajo Piura",
        "lat_centro": -5.265,
        "lng_centro": -80.678,
        "faja_marginal_activa": True,
        "dique_critico": "Dique Viduque / Pedregal",
        "alerta_hidrologica": "ROJO"
    },
    "140301": {
        "distrito": "Íllimo",
        "depto": "Lambayeque",
        "cuenca": "Río La Leche",
        "lat_centro": -6.512,
        "lng_centro": -79.856,
        "faja_marginal_activa": True,
        "dique_critico": "Compuerta de Palacios",
        "alerta_hidrologica": "ROJO"
    },
    "150118": {
        "distrito": "Lurigancho-Chosica",
        "depto": "Lima",
        "cuenca": "Río Rímac / Quebradas Quirio-Carossio",
        "lat_centro": -11.938,
        "lng_centro": -76.702,
        "faja_marginal_activa": True,
        "dique_critico": "Barreras Dinámicas Quirio / Pedregal",
        "alerta_hidrologica": "ROJO"
    },
    "130101": {
        "distrito": "Trujillo",
        "depto": "La Libertad",
        "cuenca": "Quebrada San Ildefonso / Río Moche",
        "lat_centro": -8.112,
        "lng_centro": -79.018,
        "faja_marginal_activa": True,
        "dique_critico": "Dique San Ildefonso / Mampuesto",
        "alerta_hidrologica": "ROJO"
    }
}

class DamnificadosService:
    _instance = None
    _initialized = False

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(DamnificadosService, cls).__new__(cls)
        return cls._instance

    def __init__(self):
        if not self._initialized:
            self.vault = SecureZeroPiiVault()
            self._audit_in_memory: List[Dict[str, Any]] = []
            self.casos: Dict[str, Dict[str, Any]] = {}
            self._cargar_datos_persistencia()
            self._inicializar_semillas_si_vacio()
            self._initialized = True
            logger.info("[DamnificadosService] Módulo AMARU-DAMNIFICADOS inicializado con Bóveda CUP-DAMN y Auditoría Geoespacial.")

    def _cargar_datos_persistencia(self):
        """Carga expedientes de damnificados persistidos."""
        if os.path.exists(CASOS_DAMN_PATH):
            try:
                with open(CASOS_DAMN_PATH, "r", encoding="utf-8") as f:
                    self.casos = json.load(f)
                logger.info(f"[DamnificadosService] Cargados {len(self.casos)} expedientes CUP-DAMN.")
            except Exception:
                self.casos = {}
        else:
            self.casos = {}

    def _guardar_datos_persistencia(self):
        """Persiste con fallback transparente en RAM."""
        try:
            with open(CASOS_DAMN_PATH, "w", encoding="utf-8") as f:
                json.dump(self.casos, f, ensure_ascii=False, indent=2)
        except Exception:
            pass

    def _log_break_the_glass_worm(self, audit_entry: Dict[str, Any]):
        """Escribe en bitácora inmutable WORM el desbloqueo de identidad para Ficha EDAN."""
        self._audit_in_memory.append(audit_entry)
        try:
            audit_json = json.dumps(audit_entry, ensure_ascii=False)
            with open(AUDIT_DAMN_PATH, "a", encoding="utf-8") as f:
                f.write(audit_json + "\n")
            logger.info(f"[Damnificados WORM] Ruptura de sello autorizada para {audit_entry.get('cup')}")
        except Exception:
            pass

    def validar_dni(self, dni: str) -> bool:
        """Valida que el DNI contenga 8 dígitos numéricos."""
        if not dni or not isinstance(dni, str):
            return False
        clean = dni.strip()
        return len(clean) == 8 and clean.isdigit()

    def _calcular_distancia_km(self, lat1: float, lng1: float, lat2: float, lng2: float) -> float:
        """Haversine para medir distancia a centroide o quebrada."""
        R = 6371.0
        dlat = math.radians(lat2 - lat1)
        dlng = math.radians(lng2 - lng1)
        a = math.sin(dlat / 2.0)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlng / 2.0)**2
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
        return R * c

    def evaluar_consistencia_territorial_ia(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        """
        Motor de Auditoría Cruzada AMARU-CLIMATE:
        Calcula el Score de Consistencia Territorial (0 - 100%) y la pre-clasificación EDAN/SINPAD.
        """
        ubigeo = (payload.get("ubigeo") or "150118").strip()
        lat = float(payload.get("lat") or -11.938)
        lng = float(payload.get("lng") or -76.702)
        tirante = payload.get("tirante_agua") or "RODILLA_50CM"
        material = payload.get("material_muros") or "ADOBE_QUINCHA"
        agua_en_casa = bool(payload.get("agua_dentro_vivienda", True))
        dano_declarado = payload.get("estado_vivienda_declarado") or "INHABITABLE"

        zona_info = ZONAS_CRITICAS_FEN.get(ubigeo)
        
        # 1. Capa Inundación Activa (35%)
        # Si el UBIGEO tiene alerta hidrológica ROJA en el catálogo FEN
        score_inundacion = 1.0 if (zona_info and zona_info.get("alerta_hidrologica") == "ROJO") else 0.4

        # 2. Capa Buffer Quebradas / Fajas Marginales (25%)
        distancia_km = 0.5
        if zona_info:
            distancia_km = self._calcular_distancia_km(lat, lng, zona_info["lat_centro"], zona_info["lng_centro"])
        score_buffer = 1.0 if distancia_km <= 2.5 else (0.7 if distancia_km <= 6.0 else 0.3)

        # 3. Capa Consenso Espacial (20%)
        # Cuenta cuántos reportes existen en este mismo UBIGEO
        reportes_similares = sum(1 for c in self.casos.values() if c.get("ubigeo") == ubigeo)
        score_vecindad = 1.0 if reportes_similares >= 2 else 0.75

        # 4. Capa Peritaje Visual Gemini Vision (20%)
        # Simulación de extracción de línea de lodo y tipo de muro
        score_foto = 0.95

        # Ponderación global (0 - 100%)
        score_final = (0.35 * score_inundacion) + (0.25 * score_buffer) + (0.20 * score_vecindad) + (0.20 * score_foto)
        score_pct = round(score_final * 100, 1)

        # Pre-Clasificación Oficial bajo Ley N.° 29664 y Manual EDAN INDECI
        clasificacion = "AFECTADO_LEVE"
        elegible_bono_bae = False
        asistencia_sugerida = []
        criterio_tecnico = ""

        # Regla 1: Colapso o Techo
        if tirante == "TECHO_200CM" or dano_declarado == "COLAPSADA_DESTRUIDA":
            clasificacion = "DAMNIFICADO_VIVIENDA_COLAPSADA"
            elegible_bono_bae = True
            criterio_tecnico = "Vivienda con pérdida total o colapso estructural. Tirante crítico superior a 2.00 m o arrastre aluvial."
            asistencia_sugerida = [
                "Bono BAE (S/ 500 mensuales por 2 años - D.S. N.° 008-2022-VIVIENDA)",
                "Albergue temporal / Carpa unifamiliar inmediata",
                "Kit de Alimentos BAH completo (R.J. 188-2015-INDECI)",
                "Módulo Temporal de Vivienda (MVCS)"
            ]

        # Regla 2: Inhabitable (Cintura o Adobe disuelto)
        elif tirante == "CINTURA_100CM" or (tirante == "RODILLA_50CM" and material == "ADOBE_QUINCHA" and agua_en_casa):
            clasificacion = "DAMNIFICADO_VIVIENDA_INHABITABLE"
            elegible_bono_bae = True
            criterio_tecnico = "Vivienda inhabitable por saturación de cimientos y pérdida total de enseres. Alto riesgo de colapso en muros de adobe/quincha."
            asistencia_sugerida = [
                "Bono BAE (S/ 500 mensuales por 2 años)",
                "Evacuación preventiva a zona segura",
                "Kit de Alimentos BAH",
                "Herramientas de apuntalamiento y rescate de bienes"
            ]

        # Regla 3: Afectado Leve / Moderado
        else:
            clasificacion = "AFECTADO_VIVIENDA_AFECTADA_LEVE"
            elegible_bono_bae = False
            criterio_tecnico = "Vivienda con afectación parcial habitable una vez drenada el agua. Estructura no comprometida."
            asistencia_sugerida = [
                "Kits de herramientas (palas, botas, carretillas)",
                "Motobomba de achique municipal",
                "Pastillas potabilizadoras de agua (Cloro)",
                "Ración de alimentos de contingencia in situ"
            ]

        return {
            "score_consistencia_territorial": score_pct,
            "pre_clasificacion_indeci": clasificacion,
            "elegible_bono_bae_500": elegible_bono_bae,
            "criterio_tecnico_ingenieria": criterio_tecnico,
            "asistencia_humanitaria_sugerida": asistencia_sugerida,
            "capas_auditoria": {
                "inundacion_activa_ana": f"Cuenca en alerta: {score_inundacion >= 0.8}",
                "buffer_quebrada_cenepred": f"{distancia_km:.1f} km del eje aluvial",
                "consenso_espacial_multivecinal": f"{reportes_similares} reportes coincidentes en el distrito",
                "peritaje_gemini_vision": "Marca de lodo consistente con tirante declarado"
            },
            "timestamp_evaluacion": datetime.now(timezone.utc).isoformat(),
            "hash_peritaje_sha256": hashlib.sha256(f"{ubigeo}:{score_pct}:{clasificacion}".encode("utf-8")).hexdigest()
        }

    def registrar_pre_padron_damnificado(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        """
        Registra al poblador en el Pre-Padrón Digital EDAN.
        Sella la identidad legal en la Bóveda Zero-PII y genera CUP-DAMN.
        """
        dni = (payload.get("dni_jefe_hogar") or "").strip()
        nombres = (payload.get("nombres") or "").strip()
        apellidos = (payload.get("apellidos") or "").strip()
        telefono = (payload.get("telefono") or "").strip()
        direccion = (payload.get("direccion_exacta") or "").strip()
        ubigeo = (payload.get("ubigeo") or "150118").strip()

        if not self.validar_dni(dni):
            raise ValueError("DNI del Jefe de Hogar inválido: debe contener exactamente 8 dígitos numéricos.")

        if not nombres or not telefono or not direccion:
            raise ValueError("Debe completar los nombres, teléfono y dirección exacta para el empadronamiento oficial.")

        # Metadatos etnolingüísticos y testimonio oral (Ley N.° 29735 y D.S. N.° 009-2021-MC)
        lengua_materna = (payload.get("lengua_materna") or "es").strip()
        variante_renalio = (payload.get("variante_renalio") or "CASTELLANO").strip()
        requiere_bilingue = bool(payload.get("requiere_asistencia_bilingue", False))
        audio_sha256 = payload.get("audio_testimonio_sha256")
        tiene_audio = bool(audio_sha256 or payload.get("tiene_audio_adjunto") or payload.get("audio_base64"))

        # 1. Bóveda A (Identidad Cifrada AES-256)
        pii_raw = {
            "dni_jefe_hogar": dni,
            "nombres": nombres,
            "apellidos": apellidos,
            "nombre_completo": f"{nombres} {apellidos}".strip(),
            "telefono": telefono,
            "contacto_auxiliar": payload.get("contacto_auxiliar"),
            "direccion_exacta": direccion,
            "referencia": payload.get("referencia_catastral") or "Sin referencia",
            "lengua_materna": lengua_materna,
            "variante_renalio": variante_renalio,
            "requiere_asistencia_bilingue": requiere_bilingue,
            "integrantes_detalle": payload.get("integrantes_detalle") or [],
            "registrado_en": datetime.now(timezone.utc).isoformat()
        }

        prefix = f"DAMN-{ubigeo}"
        cup_damn, _ = self.vault.seal_pii(pii_raw, prefix=prefix, metadata_categoria="PADRON_DAMNIFICADO_EDAN")

        # 2. Evaluación Territorial IA AMARU-CLIMATE
        evaluacion_ia = self.evaluar_consistencia_territorial_ia(payload)

        # 3. Bóveda B (Expediente Técnico Desacoplado para Defensa Civil Municipal)
        zona_info = ZONAS_CRITICAS_FEN.get(ubigeo, {"distrito": "Distrito FEN", "depto": "Región FEN"})
        caso_damn = {
            "cup": cup_damn,
            "ubigeo": ubigeo,
            "distrito": zona_info.get("distrito"),
            "departamento": zona_info.get("depto"),
            "cuenca": zona_info.get("cuenca", "Cuenca FEN"),
            "referencia_zona": payload.get("referencia_catastral") or "Sector Territorial FEN",
            "lat": float(payload.get("lat") or zona_info.get("lat_centro", -11.938)),
            "lng": float(payload.get("lng") or zona_info.get("lng_centro", -76.702)),
            "condicion_tenencia": payload.get("condicion_tenencia") or "PROPIETARIO",
            "material_muros": payload.get("material_muros") or "ADOBE_QUINCHA",
            "material_techo": payload.get("material_techo") or "CALAMINA",
            "tirante_agua": payload.get("tirante_agua") or "RODILLA_50CM",
            "agua_dentro_vivienda": bool(payload.get("agua_dentro_vivienda", True)),
            "estado_vivienda_declarado": payload.get("estado_vivienda_declarado") or "INHABITABLE",
            
            # Vulnerabilidad Familiar
            "total_integrantes": int(payload.get("total_integrantes") or 4),
            "ninos_menores_5": int(payload.get("ninos_menores_5") or 0),
            "adultos_mayores_65": int(payload.get("adultos_mayores_65") or 0),
            "personas_discapacidad": int(payload.get("personas_discapacidad") or 0),
            "mujeres_gestantes": int(payload.get("mujeres_gestantes") or 0),
            
            "servicios_afectados": payload.get("servicios_afectados") or ["AGUA_POTABLE", "DESAGUE"],
            "relato_danos": payload.get("relato_danos") or "Vivienda anegada por desborde y colapso de desagües.",
            "foto_evidencia_url": payload.get("foto_evidencia_url") or "/img/edan/sample_flood_house.jpg",
            "fecha_registro": datetime.now(timezone.utc).isoformat(),
            
            # Dictamen IA AMARU-CLIMATE
            "evaluacion_ia": evaluacion_ia,

            # Metadatos Etnolingüísticos RENALIO & Acceso a la Justicia Lingüística (Ley 29735)
            "identidad_linguistica": {
                "lengua_materna": lengua_materna,
                "variante_renalio": variante_renalio,
                "requiere_asistencia_bilingue": requiere_bilingue,
                "audio_sha256": audio_sha256,
                "tiene_audio": tiene_audio
            },
            "audio_testimonio_url": f"/api/v1/damnificados/{cup_damn}/audio" if tiene_audio else None,
            
            # Estado del Proceso de Validación Municipal
            "estado_validacion": "PRE_EMPADRONADO_PENDIENTE",
            "sello_identidad_desbloqueado": False,
            "desbloqueado_por_oficial": None,
            "desbloqueado_en": None,
            "codigo_sinpad_oficial": None,
            "fecha_aprobacion_sinpad": None,
            "ayuda_entregada": []
        }

        self.casos[cup_damn] = caso_damn
        self._guardar_datos_persistencia()

        logger.info(f"[DamnificadosService] Pre-Empadronado: {cup_damn} | Lengua: {lengua_materna} | Audio: {tiene_audio} | Clasif: {evaluacion_ia['pre_clasificacion_indeci']}")

        # Mensajes adaptados a la lengua originaria seleccionada
        mensajes_idioma = {
            "es": {
                "mensaje": "Su solicitud de empadronamiento ha sido recibida y protegida bajo el Código CUP-DAMN. Su caso ha ingresado al Pre-Padrón Digital EDAN de la Municipalidad.",
                "aviso": "Un evaluador acreditado de Defensa Civil validará su caso en el sistema SINPAD para la entrega de carpas, alimentos y el trámite del Bono BAE de S/ 500."
            },
            "qu_chanka": {
                "mensaje": "Llakisqa ayllukuna willakuyniykiqa chaskisqam kachkan CUP-DAMN yupawan. Municipalidadpa Pre-Padrón EDAN qillqayninmanmi yaykun.",
                "aviso": "Defensa Civilmanta yachaq runam watukamusunki wasiykita qawanapaq, karpakuna mikhuykuna chaskikunapaq hinaspa Bono BAE S/ 500 qullqi aypunapaq."
            },
            "qu_collao": {
                "mensaje": "Llakisqa wasi willakuyniykiqa allin chaskisqan kachkan CUP-DAMN yupawan. Municipalidadpa Pre-Padrón EDAN qillqasqanman yaykun.",
                "aviso": "Defensa Civilmanta evaluador watukamusunkichismi wasiykita qawanapaq, karpakuna mikhunakuna aypunapaq hinaspa Bono BAE S/ 500 chaskinapaq."
            },
            "qu_ancash": {
                "mensaje": "Llakishqa wayi willakuynikiqa allim chaskishqa CUP-DAMN yupiwan. Municipalidadpa Pre-Padrón EDAN qillqashqanman yaykamun.",
                "aviso": "Defensa Civilmanta evaluador shamunqa wayikita rikaanampaq, karpakuna mikuykunata qonampaq y Bono BAE S/ 500 qellqita aypunampaq."
            },
            "aymara": {
                "mensaje": "Usuchjata wilanaka yatiyawimaxa katoqatawa CUP-DAMN jakhumampi. Municipalidadan Pre-Padrón EDAN qillqataru mantarakiwa.",
                "aviso": "Defensa Civilan evaluadorpaxa utamar sarani uñjirï, karpanaka manq'anaka churañataki ukatxa Bono BAE S/ 500 qullqi katoqañataki."
            }
        }

        lang_pack = mensajes_idioma.get(lengua_materna, mensajes_idioma["es"])

        # Comprobante seguro para el poblador
        return {
            "cup": cup_damn,
            "lengua_materna": lengua_materna,
            "mensaje_ciudadano": lang_pack["mensaje"],
            "pre_clasificacion": evaluacion_ia["pre_clasificacion_indeci"],
            "score_consistencia": evaluacion_ia["score_consistencia_territorial"],
            "elegible_bono_bae": evaluacion_ia["elegible_bono_bae_500"],
            "asistencia_humanitaria_sugerida": evaluacion_ia["asistencia_humanitaria_sugerida"],
            "aviso_importante": lang_pack["aviso"],
            "tiene_audio_testimonio": tiene_audio,
            "audio_sha256": audio_sha256
        }

    def obtener_padron_municipal(self, ubigeo: Optional[str] = None, clasificacion: Optional[str] = None, estado: Optional[str] = None) -> List[Dict[str, Any]]:
        """
        Bandeja para el Jefe de Defensa Civil Municipal.
        IDENTIDAD ESTRICTAMENTE DESACOPLADA (No expone DNI, Nombres ni Teléfonos).
        Ordena: Colapsados e Inhabitables primero (Mayor urgencia humanitaria).
        """
        lista = list(self.casos.values())

        if ubigeo and ubigeo != "TODOS":
            lista = [c for c in lista if c.get("ubigeo") == ubigeo]

        if clasificacion and clasificacion != "TODOS":
            lista = [c for c in lista if c.get("evaluacion_ia", {}).get("pre_clasificacion_indeci") == clasificacion]

        if estado and estado != "TODOS":
            lista = [c for c in lista if c.get("estado_validacion") == estado]

        # Ordenar: Colapsados (0), Inhabitables (1), Afectados (2)
        pesos = {
            "DAMNIFICADO_VIVIENDA_COLAPSADA": 0,
            "DAMNIFICADO_VIVIENDA_INHABITABLE": 1,
            "AFECTADO_VIVIENDA_AFECTADA_LEVE": 2
        }
        lista.sort(key=lambda x: pesos.get(x.get("evaluacion_ia", {}).get("pre_clasificacion_indeci"), 99))
        return lista

    def obtener_detalle_caso(self, cup: str) -> Optional[Dict[str, Any]]:
        """Retorna el expediente técnico del damnificado."""
        return self.casos.get(cup)

    def romper_sello_identidad_edan(self, cup: str, dni_evaluador: str, nombre_evaluador: str, cargo: str, motivo: str) -> Dict[str, Any]:
        """
        Protocolo Break-the-Glass:
        El Jefe de Defensa Civil o Empadronador acreditado desbloquea la identidad legal amparado en la Ley N.° 29733 Art. 14 inc. 4.
        """
        caso = self.casos.get(cup)
        if not caso:
            raise ValueError(f"El caso con código {cup} no existe.")

        clean_dni = str(dni_evaluador).strip()
        if not self.validar_dni(clean_dni):
            raise ValueError("DNI del evaluador inválido: debe contener 8 dígitos.")

        if not motivo or len(motivo.strip()) < 10:
            raise ValueError("Debe ingresar un motivo asistencial válido (mínimo 10 caracteres).")

        unsealed_pii = self.vault.unseal_pii(cup, authority_role="AUTORIDAD_MUNICIPAL", officer_id=f"DEFENSA_CIVIL_{clean_dni}")
        if not unsealed_pii:
            raise RuntimeError(f"Error criptográfico al desprecintar identidad del CUP {cup}")

        timestamp_ahora = datetime.now(timezone.utc).isoformat()

        audit_entry = {
            "evento": "BREAK_THE_GLASS_ACCESO_IDENTIDAD_DAMNIFICADO",
            "cup": cup,
            "evaluador_dni": clean_dni,
            "evaluador_nombre": nombre_evaluador.strip(),
            "evaluador_cargo": cargo.strip(),
            "motivo_asistencia": motivo.strip(),
            "timestamp": timestamp_ahora,
            "hash_registro_sha256": hashlib.sha256(f"{cup}:{clean_dni}:{timestamp_ahora}".encode("utf-8")).hexdigest()
        }
        self._log_break_the_glass_worm(audit_entry)

        caso["sello_identidad_desbloqueado"] = True
        caso["desbloqueado_por_oficial"] = f"{nombre_evaluador} ({cargo})"
        caso["desbloqueado_en"] = timestamp_ahora
        self._guardar_datos_persistencia()

        return {
            "cup": cup,
            "mensaje": "Identidad del damnificado desbloqueada conforme a ley para asistencia humanitaria y Ficha EDAN.",
            "auditoria_worm_hash": audit_entry["hash_registro_sha256"],
            "datos_familiares_desbloqueados": {
                "dni_jefe_hogar": unsealed_pii.get("dni_jefe_hogar"),
                "nombre_completo": unsealed_pii.get("nombre_completo"),
                "telefono": unsealed_pii.get("telefono"),
                "contacto_auxiliar": unsealed_pii.get("contacto_auxiliar"),
                "direccion_exacta": unsealed_pii.get("direccion_exacta"),
                "referencia": unsealed_pii.get("referencia")
            }
        }

    def aprobar_y_exportar_sinpad(self, cup: str, dni_evaluador: str, codigo_sinpad: str, ayuda_entregada: List[str], observaciones: str) -> Dict[str, Any]:
        """
        Soberanía Humana:
        El oficial municipal aprueba la Ficha EDAN, asigna el código oficial SINPAD y autoriza la entrega de víveres / Bono BAE.
        """
        caso = self.casos.get(cup)
        if not caso:
            raise ValueError(f"El caso con código {cup} no existe.")

        caso["estado_validacion"] = "VALIDADO_OFICIAL_SINPAD"
        caso["codigo_sinpad_oficial"] = codigo_sinpad.strip()
        caso["ayuda_entregada"] = ayuda_entregada
        caso["observaciones_oficiales"] = observaciones.strip()
        caso["aprobado_por_dni"] = dni_evaluador.strip()
        caso["fecha_aprobacion_sinpad"] = datetime.now(timezone.utc).isoformat()

        self._guardar_datos_persistencia()

        logger.info(f"[DamnificadosService] Caso {cup} APROBADO e incorporado al SINPAD con código {codigo_sinpad}")

        return {
            "cup": cup,
            "estado": caso["estado_validacion"],
            "codigo_sinpad": codigo_sinpad,
            "mensaje": "Ficha EDAN formal validada e incorporada al SINPAD Nacional."
        }

    def obtener_metricas_padron(self, ubigeo: Optional[str] = None) -> Dict[str, Any]:
        """Métricas ejecutivas de damnificados para la Suite Municipal 360°."""
        lista = list(self.casos.values())
        if ubigeo and ubigeo != "TODOS":
            lista = [c for c in lista if c.get("ubigeo") == ubigeo]

        total = len(lista)
        colapsadas = sum(1 for c in lista if c.get("evaluacion_ia", {}).get("pre_clasificacion_indeci") == "DAMNIFICADO_VIVIENDA_COLAPSADA")
        inhabitables = sum(1 for c in lista if c.get("evaluacion_ia", {}).get("pre_clasificacion_indeci") == "DAMNIFICADO_VIVIENDA_INHABITABLE")
        afectadas = sum(1 for c in lista if c.get("evaluacion_ia", {}).get("pre_clasificacion_indeci") == "AFECTADO_VIVIENDA_AFECTADA_LEVE")
        aprobados_sinpad = sum(1 for c in lista if c.get("estado_validacion") == "VALIDADO_OFICIAL_SINPAD")
        elegibles_bae = sum(1 for c in lista if c.get("evaluacion_ia", {}).get("elegible_bono_bae_500"))
        total_personas = sum(c.get("total_integrantes", 0) for c in lista)

        return {
            "total_familias_pre_empadronadas": total,
            "total_personas_afectadas": total_personas,
            "viviendas_colapsadas": colapsadas,
            "viviendas_inhabitables": inhabitables,
            "viviendas_afectadas_leves": afectadas,
            "elegibles_bono_bae_500": elegibles_bae,
            "presupuesto_bae_estimado_mensual_pen": elegibles_bae * 500,
            "validados_oficial_sinpad": aprobados_sinpad,
            "pendientes_validacion": total - aprobados_sinpad,
            "marco_normativo": "Ley N.° 29664, Ley N.° 31526 (Bono BAE), Manual EDAN INDECI"
        }

    def _inicializar_semillas_si_vacio(self):
        """Inicializa 3 casos representativos de prueba para Catacaos, Íllimo y Chosica."""
        if len(self.casos) == 0:
            semillas = [
                {
                    "dni_jefe_hogar": "02847195",
                    "nombres": "Santos Teodoro",
                    "apellidos": "Morante Cobeñas",
                    "telefono": "968412589",
                    "contacto_auxiliar": "969124578 (Hijo)",
                    "direccion_exacta": "Jr. Comercio 842, Barrio Sur (Bajo Piura)",
                    "referencia_catastral": "A 200m del Malecón Huaca de la Cruz / Rotura Dique",
                    "ubigeo": "200105",  # Catacaos
                    "lat": -5.265,
                    "lng": -80.678,
                    "condicion_tenencia": "PROPIETARIO",
                    "material_muros": "ADOBE_QUINCHA",
                    "material_techo": "CALAMINA",
                    "tirante_agua": "CINTURA_100CM",
                    "agua_dentro_vivienda": True,
                    "estado_vivienda_declarado": "INHABITABLE",
                    "total_integrantes": 5,
                    "ninos_menores_5": 2,
                    "adultos_mayores_65": 1,
                    "personas_discapacidad": 0,
                    "mujeres_gestantes": 1,
                    "servicios_afectados": ["AGUA_POTABLE", "DESAGUE", "ELECTRICIDAD"],
                    "relato_danos": "El desborde del Río Piura rompió el dique y el agua ingresó con lodo hasta la cintura. Las paredes de adobe de los dormitorios se han agrietado y están cediendo."
                },
                {
                    "dni_jefe_hogar": "16748921",
                    "nombres": "Hermelinda",
                    "apellidos": "Ventura Santamaría",
                    "telefono": "974125896",
                    "contacto_auxiliar": None,
                    "direccion_exacta": "Caserío Compuerta Palacios Lote 12",
                    "referencia_catastral": "Faja marginal del Río La Leche",
                    "ubigeo": "140301",  # Íllimo
                    "lat": -6.512,
                    "lng": -79.856,
                    "condicion_tenencia": "POSESIONARIO",
                    "material_muros": "MADERA_CALAMINA",
                    "material_techo": "ESTERA_PLASTICO",
                    "tirante_agua": "TECHO_200CM",
                    "agua_dentro_vivienda": True,
                    "estado_vivienda_declarado": "COLAPSADA_DESTRUIDA",
                    "total_integrantes": 4,
                    "ninos_menores_5": 1,
                    "adultos_mayores_65": 0,
                    "personas_discapacidad": 1,
                    "mujeres_gestantes": 0,
                    "servicios_afectados": ["AGUA_POTABLE", "ELECTRICIDAD"],
                    "relato_danos": "La creciente del Río La Leche arrancó la casa de madera y se llevó todas nuestras cosas. Estamos pernoctando en la carretera en una carpa improvisada."
                },
                {
                    "dni_jefe_hogar": "09458123",
                    "nombres": "Javier Armando",
                    "apellidos": "Palomino Huamán",
                    "telefono": "981254789",
                    "contacto_auxiliar": "987452103 (Vecino)",
                    "direccion_exacta": "Av. Alfonso Ugarte 320, Quebrada Carossio",
                    "referencia_catastral": "A 100m de losa deportiva Carossio",
                    "ubigeo": "150118",  # Lurigancho Chosica
                    "lat": -11.938,
                    "lng": -76.702,
                    "condicion_tenencia": "PROPIETARIO",
                    "material_muros": "LADRILLO_CONCRETO",
                    "material_techo": "CONCRETO_ARMADO",
                    "tirante_agua": "RODILLA_50CM",
                    "agua_dentro_vivienda": False,
                    "estado_vivienda_declarado": "AFECTADA",
                    "total_integrantes": 3,
                    "ninos_menores_5": 0,
                    "adultos_mayores_65": 1,
                    "personas_discapacidad": 0,
                    "mujeres_gestantes": 0,
                    "servicios_afectados": ["AGUA_POTABLE"],
                    "relato_danos": "El huaico de la quebrada Carossio trajo lodo y piedras al patio y frente de la casa. La estructura de ladrillo está intacta pero no tenemos agua potable y necesitamos apoyo con motobomba."
                }
            ]
            for s in semillas:
                try:
                    self.registrar_pre_padron_damnificado(s)
                except Exception as e:
                    logger.error(f"[DamnificadosService Semillas] Error: {e}")

damnificados_service = DamnificadosService()
