# backend/agents/linguistic_agent.py
"""
Agente 3: Agente Lingüístico Territorial e Inclusivo (Cultural & Dispatch Agent)
Toma el reporte técnico del Agente Táctico y genera:
1. Mensaje técnico para autoridades (COER/COEL).
2. Alerta comunitaria adaptada en Castellano Llano (sin tecnicismos que confundan a los pobladores).
3. Alerta comunitaria adaptada en Lengua Originaria (Runasimi Chanka, Collao o Aymara según el territorio).
"""
import os
import json
import google.generativeai as genai
from agents.schemas import TacticalAssessment, TriageResult, LinguisticMessages
from services.tools.territorial_tools import query_exposed_population

API_KEY = os.getenv("GOOGLE_GEMINI_API_KEY") or os.getenv("GEMINI_API_KEY")
if API_KEY:
    try:
        genai.configure(api_key=API_KEY)
    except Exception:
        pass

# Catálogo dialectal con traducciones precisas de emergencia territorial
FALLBACK_DIALECTAL = {
    "150118": {
        "variante": "QUECHUA_CHANKA",
        "lengua_nombre": "Runasimi (Quechua Chanka)",
        "castellano": "¡ALERTA URGENTE VECINOS DE CHOSICA! Lluvias muy fuertes están saturando los cerros. Riesgo inminente de huaicos en las quebradas Carossio y Pedregal. Evacúen de inmediato a las losas altas y zonas seguras señaladas.",
        "originaria": "¡HATUN LLAKI WILLAKUY CHOSICA LLAQTAMASIKUNA! Sinchi parawanmi urqukuna nisyuta hunt'achkan. Lloqlla chayamunqa Carossio Pedregal wayq'ukunapi. Usqhaylla hanay pata kanchakunaman lluqsiychik kawsaykichikta amachanapaq."
    },
    "020101": {
        "variante": "QUECHUA_ANCASH",
        "lengua_nombre": "Runasimi Ancashino (Huaylas/Conchucos)",
        "castellano": "¡ALERTA MÁXIMA EN HUARAZ! Lluvias torrenciales y saturación crítica en la cuenca del Río Quillcay y Laguna Palcacocha. Aléjense de los puentes y fajas marginales. Evacúen de inmediato a las terrazas seguras de Nicrupampa y Shancayán.",
        "originaria": "¡HUARAZ LLAQTAPAQ SINCHI WILLAKUY! Sinchikaykaq tamya urqukunapita yarqamun Quillcay mayupi Palcacocha qochapipas. Lloqlla llimpiykamunqa. Usqhaylla mayu patamanta ayqikuychik Nicrupampa Shancayán hanan pampakunaman amachanakunapaq."
    },
    "081301": {
        "variante": "QUECHUA_COLLAO",
        "lengua_nombre": "Runasimi Collao (Cusco)",
        "castellano": "¡ALERTA DE DESBORDE EN URUBAMBA - VALLE SAGRADO! El Río Vilcanota ha superado el umbral crítico de inundación. Se ordena a todas las familias de Chichubamba y Pumahuanca evacuar hacia el Estadio Nogalpampa y el Coliseo de Urubamba.",
        "originaria": "¡URUBAMBA WILLAKUY, QHAPAQ QHESWA AYLLUKUNA! Vilcanota hatun mayum sinchita llimp'iykamushan, wasikunata chinkachiyta munashan. Usqhaylla mayu kantu wasikunamanta lluqsiychik Nogalpampa pampaman kawsay amachanapaq."
    },
    "080801": {
        "variante": "QUECHUA_COLLAO",
        "lengua_nombre": "Runasimi Collao (Cusco)",
        "castellano": "¡ALERTA EN ESPINAR! Crecida peligrosa de ríos e intensas granizadas en comunidades altas. Aléjense de las orillas del Río Salado y Cañipía, y acudan al Coliseo de Yauri.",
        "originaria": "¡ESPINAR AYLLUMASIKUNA WILLAY! Salado Cañipía mayukunan sinchita llimp'imushan, chikchipas urqukunapi urmaykamushan. Mayu kantukunamanta karunchakuychik, amataq chakanakunata chimpapuychikchu. Yauri wasikunaman ch'iklluychik."
    },
    "050101": {
        "variante": "QUECHUA_CHANKA",
        "lengua_nombre": "Runasimi (Quechua Chanka)",
        "castellano": "¡ALERTA DE HUAICO EN AYACUCHO! Lluvias torrenciales saturan la quebrada Chaquihuaycco y el río Alameda. Se dispone evacuación preventiva de fajas marginales hacia el Estadio Ciudad de Cumaná.",
        "originaria": "¡AYACUCHO LLAQTAMASIKUNA HATUN WILLAKUY! Sinchi parawanmi Chaquihuaycco wayq'o hunt'achkan. Lloqlla chayamunqa Alameda mayupipas. Usqhaylla hanay Ciudad de Cumaná kanchakunaman lluqsiychik aylluykichikta amachanapaq."
    },
    "210505": {
        "variante": "AYMARA_COLLAO",
        "lengua_nombre": "Aymara Altiplánico",
        "castellano": "AVISO DE EMERGENCIA POR HELADA SEVERA EN MAZOCRUZ. La temperatura caerá bajo cero intensamente esta madrugada. Protejan a niños, ancianos y resguarden el ganado en los cobertizos térmicos.",
        "originaria": "YATIYAWI MAZOCRUZ MARANAKATAKI: Jach'a thiyaw purintani akapachanxa. Wawanakaru jilatanakaru sum q'uñt'ayapxam, ukat uywanakarux q'uñi utanakaru imantapxam."
    },
    "120601": {
        "variante": "ASHANINKA",
        "lengua_nombre": "Asháninka Amazónico",
        "castellano": "¡ALERTA MÁXIMA EN SATIPO Y SELVA CENTRAL! Crecida violenta y desborde del Río Satipo y Perené. Riesgo inminente de deslizamientos. Pobladores ribereños y comunidades nativas evacúen de inmediato a las lomas y al Coliseo Shirampari.",
        "originaria": "¡KATINGARO KAIMINTOTSI SATIPO JEMIITENI! Eni antaroite oñaakotake Satipo Perené kipatsiki. Kityonkaro oshitovaji jenoqui. Pishiye jatanakero jenoqui Shirampari otsipana amampeite, paamaiteero pitsipatsite eentsite."
    },
    "010401": {
        "variante": "AWAJUN",
        "lengua_nombre": "Awajún Amazónico",
        "castellano": "¡ALERTA DE INUNDACIÓN EN SANTA MARÍA DE NIEVA! El Río Marañón y Nieva han sobrepasado niveles de desastre. Comunidades ribereñas trasladen sus embarcaciones y evacúen de inmediato hacia las malocas y zonas altas del Coliseo.",
        "originaria": "¡DEKAS YAPIYAGBAUNUM DEKATAI NIEVA AENTSTI! Namak senchi emami Marañón namakaen. Yumi tutai kugkag yumpunkawa. Uchigtin ainau apanainas najaimas Coliseo ayamataish nampijata, kuitamkata muun ainausha."
    },
    "200101": {
        "variante": "CASTELLANO_LLANO_NORTE",
        "lengua_nombre": "Castellano Comunitario",
        "castellano": "¡ALERTA DE DESBORDE EN PIURA Y BAJO PIURA! El caudal del río ha superado los niveles de seguridad en los puentes. Se ordena a todas las familias de las riberas y Catacaos ponerse a buen recaudo en los albergues comunales ahora.",
        "originaria": "¡ALERTA COEN BAJO PIURA! Crecida peligrosa del río Piura sobrepasa umbral rojo en el puente Sánchez Cerro y Catacaos. Evacuación inmediata de fajas marginales hacia los albergues comunales y zonas altas del Colegio San Miguel."
    }
}

# Plantillas dinámicas de emergencia por variante lingüística (para cualquier distrito no catalogado)
DIALECT_TEMPLATES = {
    "QUECHUA_CHANKA": {
        "lengua_nombre": "Runasimi (Quechua Chanka)",
        "castellano": "¡ALERTA URGENTE EN {distrito}! Peligro inminente por intensas lluvias y huaicos en {cuenca}. {accion}. Evacúen de inmediato a {albergue}.",
        "originaria": "¡HATUN LLAKI WILLAKUY {distrito} LLAQTAPAQ! Sinchi parawanmi {cuenca} mayupas wayq'upas hunt'achkan. Lloqlla chayamunqa. {accion} Usqhaylla hanay pata {albergue} kanchakunaman ripuychik kawsaykichik amachanapaq."
    },
    "QUECHUA_COLLAO": {
        "lengua_nombre": "Runasimi Collao (Cusco)",
        "castellano": "¡ALERTA DE EMERGENCIA EN {distrito}! Crecida peligrosa de ríos y huaicos en la cuenca {cuenca}. {accion}. Resguárdense en {albergue}.",
        "originaria": "¡{distrito} AYLLUMASIKUNA HATUN WILLAY! Sinchi para chayamushan, mayukunan llimp'iykamushan {cuenca} cheqaspi. {accion} Usqhaylla {albergue} wasikunaman ch'iklluychik amataq mayu patapi qipaychikchu."
    },
    "QUECHUA_ANCASH": {
        "lengua_nombre": "Runasimi Ancashino (Huaylas/Conchucos)",
        "castellano": "¡ALERTA DE ALURIÓN EN {distrito}! Lluvias torrenciales y saturación de cerros en la cuenca {cuenca}. {accion}. Evacúen hacia {albergue}.",
        "originaria": "¡{distrito} LLAQTAPAQ LLOQLLA WILLAKUY! Sinchikaykaq tamya urqukunapita yarqamun {cuenca} mayupi. {accion} Hanaq pampakunaman ayqikuychik {albergue} wayiman kawsay amachanakunapaq."
    },
    "AYMARA_COLLAO": {
        "lengua_nombre": "Aymara Altiplánico",
        "castellano": "¡AVISO DE EMERGENCIA EN {distrito}! Peligro crítico por fenómeno meteorológico en {cuenca}. {accion}. Acudan de inmediato a {albergue}.",
        "originaria": "¡YATIYAWI {distrito} MARANAKATAKI! Jach'a ch'axwataw purintani {cuenca} uraqina. {accion} Wawanakaru jilatanakaru sum q'uñt'ayapxam, ukat {albergue} utanakaru imantapxam."
    },
    "ASHANINKA": {
        "lengua_nombre": "Asháninka Amazónico",
        "castellano": "¡ALERTA MÁXIMA EN {distrito}! Crecida violenta de río y deslizamiento en {cuenca}. {accion}. Pónganse a salvo en {albergue}.",
        "originaria": "¡KATINGARO KAIMINTOTSI {distrito} JEMIITENI! Eni antaroite oñaakotake {cuenca} kipatsiki. {accion} Pishiye jatanakero jenoqui {albergue} otsipana amampeite, paamaiteero pitsipatsite eentsite."
    },
    "AWAJUN": {
        "lengua_nombre": "Awajún Amazónico",
        "castellano": "¡AVISO DE EMERGENCIA EN {distrito}! Inundación y peligro fluvial en la cuenca {cuenca}. {accion}. Evacúen de inmediato a {albergue}.",
        "originaria": "¡DEKAS YAPIYAGBAUNUM DEKATAI {distrito} AENTSTI! Namak senchi emami {cuenca} namakaen. {accion} Uchigtin ainau apanainas najaimas {albergue} ayamataish nampijata, kuitamkata."
    },
    "CASTELLANO_LLANO_NORTE": {
        "lengua_nombre": "Castellano Comunitario",
        "castellano": "¡ALERTA DE DESBORDE EN {distrito}! Peligro de inundación en la cuenca {cuenca}. {accion}. Se ordena evacuar a {albergue}.",
        "originaria": "¡AVISO COEN COMUNITARIO EN {distrito}! El caudal en la cuenca {cuenca} ha superado el umbral rojo. {accion}. Evacúen a zonas seguras en {albergue} de inmediato."
    }
}

class LinguisticAgent:
    def __init__(self):
        self.name = "Agente Lingüístico Territorial e Inclusivo"
        self.model_name = "gemini-1.5-flash"

    async def translate_and_adapt(
        self, triage: TriageResult, tactical: TacticalAssessment
    ) -> LinguisticMessages:
        ubigeo = triage.ubigeo
        pop_info = query_exposed_population(ubigeo)
        variante = pop_info.get("variante_linguistica", "QUECHUA_CHANKA")
        lengua_nombre = pop_info.get("lengua_nombre", "Runasimi (Quechua)")
        albergue = tactical.albergues_recomendados[0] if tactical.albergues_recomendados else "zona alta y segura"
        accion = tactical.accion_operativa_inmediata

        es_originaria_predominante = variante not in ["CASTELLANO_LLANO", "CASTELLANO_LLANO_NORTE"]

        # 1. Búsqueda en catálogo exacto de emergencia
        if ubigeo in FALLBACK_DIALECTAL:
            fallback = FALLBACK_DIALECTAL[ubigeo]
            variante = fallback.get("variante", variante)
            es_originaria_predominante = variante not in ["CASTELLANO_LLANO", "CASTELLANO_LLANO_NORTE"]
            lengua_nombre = fallback.get("lengua_nombre", lengua_nombre if es_originaria_predominante else "Castellano / Español")
            mensaje_castellano = fallback["castellano"]
            mensaje_originario = fallback.get("originaria") if es_originaria_predominante else None
        else:
            # 2. Generación dinámica contextual basada en la plantilla dialectal
            template = DIALECT_TEMPLATES.get(variante, DIALECT_TEMPLATES["QUECHUA_CHANKA"] if es_originaria_predominante else DIALECT_TEMPLATES["CASTELLANO_LLANO_NORTE"])
            lengua_nombre = template.get("lengua_nombre", lengua_nombre if es_originaria_predominante else "Castellano / Español")
            mensaje_castellano = template["castellano"].format(
                distrito=triage.distrito.upper(),
                cuenca=triage.cuenca,
                accion=accion,
                albergue=albergue
            )
            mensaje_originario = template["originaria"].format(
                distrito=triage.distrito.upper(),
                cuenca=triage.cuenca,
                accion=accion,
                albergue=albergue
            ) if es_originaria_predominante else None

        mensaje_coer = (
            f"🚨 [COEN TÁCTICO] ALERTA {triage.nivel_alerta} - {triage.distrito.upper()}\n"
            f"Cuenca: {triage.cuenca} | Caudal: {triage.telemetria.river_flow} m³/s | Suelo: {triage.telemetria.soil_moisture}%\n"
            f"Población en riesgo: ~{tactical.poblacion_expuesta_estimada} hab.\n"
            f"Acción prioritaria: {tactical.accion_operativa_inmediata}"
        )

        # 3. Refinamiento en tiempo real con Google Gemini 1.5 si API Key está disponible
        if API_KEY:
            if es_originaria_predominante:
                prompt = f"""
                Eres el Agente Lingüístico Cultural del COEN Perú.
                Tu misión es transformar este informe técnico en una ALERTA BILINGÜE:
                1. lengua_originaria ({lengua_nombre} - {variante}): Traducción auténtica y gramaticalmente correcta, vocabulario nativo de desastres.
                2. castellano_llano: Versión en español directo, empático y salvavidas que SIEMPRE debe acompañar a la lengua originaria.

                INFORME TÉCNICO:
                - Distrito: {triage.distrito} | Cuenca: {triage.cuenca} | Nivel: {triage.nivel_alerta}
                - Zonas críticas: {', '.join(tactical.vias_comprometidas)}
                - Albergue: {albergue} | Acción operativa: {accion}

                Responde ÚNICAMENTE en este JSON:
                {{
                    "lengua_originaria": "texto en {lengua_nombre}",
                    "castellano_llano": "texto en castellano llano"
                }}
                """
            else:
                prompt = f"""
                Eres el Agente Lingüístico Cultural del COEN Perú.
                El distrito {triage.distrito} es predominantemente hispanohablante.
                Tu misión es transformar este informe técnico en UNA ALERTA ÚNICA EN CASTELLANO LLANO (coloquial, empático, sin tecnicismos confusos).

                INFORME TÉCNICO:
                - Distrito: {triage.distrito} | Cuenca: {triage.cuenca} | Nivel: {triage.nivel_alerta}
                - Albergue: {albergue} | Acción operativa: {accion}

                Responde ÚNICAMENTE en este JSON:
                {{
                    "castellano_llano": "texto en castellano llano"
                }}
                """
            try:
                model = genai.GenerativeModel(self.model_name)
                response = model.generate_content(
                    prompt,
                    generation_config={"response_mime_type": "application/json"}
                )
                res_json = json.loads(response.text)
                if "castellano_llano" in res_json and len(res_json["castellano_llano"]) > 20:
                    mensaje_castellano = res_json["castellano_llano"]
                if es_originaria_predominante and "lengua_originaria" in res_json and len(res_json["lengua_originaria"]) > 20:
                    mensaje_originario = res_json["lengua_originaria"]
            except Exception as e:
                print(f"[{self.name}] Utilizando catálogo lingüístico territorial base: {e}")

        return LinguisticMessages(
            ubigeo=ubigeo,
            distrito=triage.distrito,
            variante_linguistica=variante,
            mensaje_tecnico_coer=mensaje_coer,
            mensaje_comunitario_castellano=mensaje_castellano,
            mensaje_comunitario_lengua_originaria=mensaje_originario,
            lengua_nombre=lengua_nombre if es_originaria_predominante else "Castellano / Español",
            es_bilingue=es_originaria_predominante
        )
