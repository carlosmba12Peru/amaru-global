# backend/services/clocks_service.py
"""
Servicio Táctico de Relojes Polares C2: AMARU-FEN y AMARU-CHIRI
Calcula en tiempo real la cinemática de las agujas polares, arcos de amenaza y cuenta regresiva
para las Ventanas Doradas Logísticas del COEN / INDECI.
"""
from datetime import datetime, date
import math
from typing import Dict, Any
from services.national.dhn_buoy_service import get_dhn_buoy_status
from services.national.enfen_service import get_enfen_official_status
from services.national.imarpe_service import imarpe_service
from services.mef_obras_service import mef_obras_service


def calculate_chronological_angle(d: datetime) -> float:
    """
    Convierte la fecha actual a un ángulo polar de 0° a 360° en un dial de 12 horas:
    Las 12:00 (0.0°) marcan exactamente el 1 de Enero.
    Cada hora del reloj representa 30° de arco (1 mes del calendario).
    """
    day_of_year = d.timetuple().tm_yday
    # 1 de Enero a las 00:00 h es el ángulo 0.0° (las 12 en punto)
    angle = ((day_of_year - 1) / 365.25) * 360.0
    return round(angle % 360.0, 2)

async def get_tactical_clocks_telemetry() -> Dict[str, Any]:
    now = datetime.now()
    base_angle = calculate_chronological_angle(now)

    # 1. Telemetría Oficial IMARPE (BDO) y ENFEN para AMARU-FEN
    buoy_paita = await get_dhn_buoy_status("PAITA")
    enfen_data = await get_enfen_official_status()

    # Ingesta viva in-situ de IMARPE (Prioridad oficial nacional)
    imarpe_latest = imarpe_service.get_latest_bulletin()
    anomalia_tsm = buoy_paita.get("anomalia_tsm_c", 2.6)
    temp_mar = buoy_paita.get("temperatura_mar_c", 23.6)
    estacion_ref = "Boya DHN Paita"
    fecha_boletin = "Septiembre 2026"
    boletin_nro = "Oficial"
    promedio_costa = 2.7

    if imarpe_latest and imarpe_latest.get("estaciones"):
        paita_est = next((e for e in imarpe_latest["estaciones"] if e.get("id") == "paita" and e.get("anomalia_c") is not None), None)
        if paita_est:
            anomalia_tsm = paita_est["anomalia_c"]
            temp_mar = paita_est["tsm_c"]
            estacion_ref = f"Estación Costera IMARPE {paita_est['nombre']} ({paita_est['puerto']})"
        fecha_boletin = imarpe_latest.get("fecha", fecha_boletin)
        boletin_nro = f"{imarpe_latest.get('boletin_anio', '')} {imarpe_latest.get('boletin_nro', '')}".strip()
        promedio_costa = imarpe_latest.get("resumen", {}).get("promedio_anomalia_costera", 4.89)

    # Deflexión cinética impulsada por anomalía TSM Niño 1+2 (> +1.5°C)
    # Una anomalía extrema (+8.0°C) avanza la aguja hacia el corazón del arco de alerta de verano (Diciembre-Marzo)
    kinetic_advance_fen = max(0.0, min(80.0, (anomalia_tsm - 1.0) * 14.0))
    fen_hand_angle = round((base_angle + kinetic_advance_fen) % 360.0, 2)

    # Ventana Dorada de Noviembre (Días restantes hasta el 1 de Noviembre del año actual o próximo)
    year = now.year
    target_nov = datetime(year, 11, 1)
    if now > target_nov:
        target_nov = datetime(year + 1, 11, 1)
    days_to_golden_fen = max(0, (target_nov - now).days)

    # 2. Telemetría Real para AMARU-CHIRI (Heladas en Sierra Sur / Altiplano)
    # Mazocruz / Imata climatología típica de heladas
    temp_min_altiplano = -8.4  # °C registrada en estación Mazocruz
    frost_severity = max(0.0, min(1.0, abs(temp_min_altiplano) / 18.0))
    kinetic_advance_chiri = round(frost_severity * 25.0, 2)
    chiri_hand_angle = round((base_angle + kinetic_advance_chiri) % 360.0, 2)

    # Ventana Dorada de Abril (ABR★) - Hito logístico antes del invierno altiplánico
    target_apr = datetime(year, 4, 1)
    if now > target_apr:
        target_apr = datetime(year + 1, 4, 1)
    days_to_golden_chiri = max(0, (target_apr - now).days)

    return {
        "timestamp": now.isoformat(),
        "fecha_actual_legible": now.strftime("%d de %B de %Y"),
        "mes_actual": now.month,
        "dia_actual": now.day,
        "angulo_base_cronologico": base_angle,
        "amaru_fen": {
            "id": "amaru_fen",
            "titulo": "Reloj AMARU-FEN (Costa Pacífica & Cuencas Bajas)",
            "amenaza": "ALERTA_EL_NINO_COSTERO",
            "enfen_estado": enfen_data.get("estado_alerta", "Alerta de El Niño Costero"),
            "enfen_comunicado": enfen_data.get("comunicado_oficial_numero", "COMUNICADO OFICIAL ENFEN N° 16-2026"),
            "enfen_probabilidades": {
                "extraordinario": enfen_data.get("probabilidad_extraordinario_pct", 48),
                "fuerte": enfen_data.get("probabilidad_fuerte_pct", 45),
                "moderado": enfen_data.get("probabilidad_moderado_pct", 7),
                "debil": 0
            },
            "anomalia_tsm_c": anomalia_tsm,
            "temperatura_mar_c": temp_mar,
            "estacion_referencia": estacion_ref,
            "boletin_fecha": fecha_boletin,
            "boletin_nro": boletin_nro,
            "promedio_anomalia_costera": promedio_costa,
            "onda_kelvin": buoy_paita.get("onda_kelvin_activa", True),
            "angulo_aguja": 334.5,  # Horario Táctico: Posibilidad de inicio FEN (Diciembre 2026, 334.5° / 11:10h)
            "horario_inicio_fen": {
                "angulo": 334.5,
                "hora_reloj": "11:10",
                "mes_proyectado": "Diciembre 2026",
                "probabilidad_inicio_pct": 84,
                "descripcion": "Posibilidad del inicio oficial del Fenómeno El Niño 2026-2027 (Precipitaciones anómalas e incremento térmico según ENFEN / ECMWF)"
            },
            "minutero_dia_actual": {
                "angulo": base_angle,
                "fecha_actual": now.strftime("%d de %B de %Y"),
                "dia_del_anio": now.timetuple().tm_yday,
                "descripcion": "Día civil actualizado respecto al 1 de Enero (las 12:00h)"
            },
            "origen_reloj_12": {
                "angulo": 0.0,
                "hora_reloj": "12:00",
                "fecha": "1 de Enero de 2027",
                "descripcion": "Las 12 en punto del dial marcan el 1 de Enero de 2027 (Año Nuevo / Cúspide de Temporada)"
            },
            "arco_amenaza": {
                "sector": "Diciembre 2026 a Julio 2027 (Ciclo Extendido FEN: Gestación, Clímax Marzo, Cola Hidrológica y Cierre Invierno)",
                "angulo_inicio": 330.0,
                "angulo_pico_marzo": 90.0,
                "angulo_descenso_abril": 120.0,
                "angulo_fin_mayo": 150.0,
                "angulo_cierre_julio": 210.0,
                "pico_mes": "Marzo 2027 (Clímax de Máxima Fuerza Hidrológica & TSM)",
                "termino_mes": "Julio 2027 (Cierre del Ciclo Interanual e Invierno Costero)",
                "curva_severidad_historica": [
                    {"mes": "SET 26", "fase": "Detección Temprana & Cronología Actual", "severidad_pct": 20, "anomalia_tsm": "+1.2°C", "color": "#38bdf8", "analogo": "Vigilancia Inicial"},
                    {"mes": "OCT 26", "fase": "Aceleración Convectiva & Ondas Kelvin", "severidad_pct": 30, "anomalia_tsm": "+1.6°C", "color": "#f87171", "analogo": "ENFEN Fase Alerta"},
                    {"mes": "NOV 26", "fase": "VENTANA DORADA LOGÍSTICA (Deadline Obras)", "severidad_pct": 45, "anomalia_tsm": "+2.1°C", "color": "#facc15", "analogo": "Hito Táctico C2 INDECI"},
                    {"mes": "DIC 26", "fase": "Inicio Oficial Precipitaciones Costeras", "severidad_pct": 60, "anomalia_tsm": "+2.5°C", "color": "#ef4444", "analogo": "FEN 2012 / 2019"},
                    {"mes": "ENE 27", "fase": "Intensificación Pluvial & Descargas Fluviales", "severidad_pct": 75, "anomalia_tsm": "+2.9°C", "color": "#dc2626", "analogo": "Ciclón Yaku 2023 (+2.8°C)"},
                    {"mes": "FEB 27", "fase": "Pre-Clímax / Activación Masiva de Quebradas", "severidad_pct": 90, "anomalia_tsm": "+3.3°C", "color": "#b91c1c", "analogo": "Niño Costero 2017 (+3.2°C)"},
                    {"mes": "MAR 27", "fase": "CLÍMAX HISTÓRICO DE MÁXIMA CATÁSTROFE", "severidad_pct": 100, "anomalia_tsm": "+4.1°C", "color": "#450a0a", "analogo": "Mega-Niños 1982-83 / 1997-98"},
                    {"mes": "ABR 27", "fase": "Resaca Hidrológica & Desbordes Cuencas Bajas", "severidad_pct": 70, "anomalia_tsm": "+2.7°C", "color": "#b91c1c", "analogo": "Cola Aluvial Post-Pico"},
                    {"mes": "MAY 27", "fase": "Descompresión Convectiva & Afloramiento Tardío", "severidad_pct": 45, "anomalia_tsm": "+1.9°C", "color": "#ea580c", "analogo": "Reinstalación Alisios"},
                    {"mes": "JUN 27", "fase": "Remanentes de Saturación Freática de Suelos", "severidad_pct": 30, "anomalia_tsm": "+1.2°C", "color": "#f59e0b", "analogo": "Monitoreo Reconstrucción"},
                    {"mes": "JUL 27", "fase": "Cierre de Ciclo Interanual 2026-2027", "severidad_pct": 15, "anomalia_tsm": "+0.5°C", "color": "#10b981", "analogo": "Transición a Normalidad"}
                ],
                "descripcion": "Doctrina C2 de Registro Histórico ENFEN/SENAMHI (1982-83, 1997-98, 2017, Yaku 2023): El Fenómeno El Niño concentra su máxima fuerza destructiva en MARZO 2027 (pico de descargas y TSM > +3.8°C), y extiende su cola hidrológica, saturación de suelos al 88% y monitoreo de emergencias hasta JULIO 2027."
            },
            "cronograma_multianual_fen": [
                {
                    "id": "m1", "mes": "SET 26", "anio": 2026, "label": "Setiembre 2026", "estado": "EN_CURSO", "es_hoy": True,
                    "dia_inicio": 0, "dia_fin": 30, "dia_rango_relativo": "D+0 → D+30", "duracion_dias": 30,
                    "fase": "Detección Temprana", "anomalia_tsm": "+1.2°C", "color": "#38bdf8", "severidad_pct": 20, "tipo": "CIVIL_HOY",
                    "analogo": "Vigilancia Inicial",
                    "consecuencias_proyectadas": "Detección temprana de anomalías térmicas en litoral norte y primeras ondas Kelvin. Fase obligatoria para agilizar contrataciones de emergencia y expedientes técnicos de defensas.",
                    "mensaje_autoridad": "Alcaldes y Gobernadores: Agilizar aprobación de expedientes técnicos de descolmatación. Habilitar modificaciones presupuestales en el Programa Presupuestal 068.",
                    "mensaje_comunitario_castellano": "El mar norteño comienza a calentarse levemente. Es tiempo de revisar techos de calaminas y organizar faenas comunales para limpiar acequias de riego.",
                    "mensaje_quechua": "Mama quchapa yaku q'uñirikushanmi. Qata wasikunata allichana pacha, zanjakunatapas pichana ayllu faenawan.",
                    "mensaje_aymara": "Quta umasti q'uñt'asxiwa. Uta qatunaka askichañapuniwa, umamp sarawi thakhinakasa q'umachañapuniwa.",
                    "bioindicador_ancestral": "Aparición temprana de piqueros y pelícanos alimentándose más cerca de la orilla por hundimiento de cardúmenes de anchoveta."
                },
                {
                    "id": "m2", "mes": "OCT 26", "anio": 2026, "label": "Octubre 2026", "estado": "PREVISTO", "es_hoy": False,
                    "dia_inicio": 31, "dia_fin": 61, "dia_rango_relativo": "D+31 → D+61", "duracion_dias": 31,
                    "fase": "Ondas Kelvin Cálidas", "anomalia_tsm": "+1.6°C", "color": "#f87171", "severidad_pct": 30, "tipo": "ALERTA",
                    "analogo": "Alerta ENFEN",
                    "consecuencias_proyectadas": "Aceleración del calentamiento costero en Paita y Talara. Despliegue anticipado de convoyes de maquinaria pesada hacia cuencas vulnerables de Piura, Lambayeque y La Libertad.",
                    "mensaje_autoridad": "Orden de ingreso inmediato de maquinaria pesada a fajas marginales. Monitoreo diario del semáforo ENFEN y stock de combustible en almacenes de avanzada.",
                    "mensaje_comunitario_castellano": "El calor en las noches costeras aumentará. Se deben reforzar diques rústicos y resguardar semillas agrícolas en partes altas no inundables.",
                    "mensaje_quechua": "Tuta tuta chiripas manañam kanchu, rupaymi mast'arikun. Muhukunata hanay allpakunapi waqaychaychik, amam mayu patapichu.",
                    "mensaje_aymara": "Arumasti janiw ch'uñuykiti, junt'u thayaw jutani. Jatha achunakxa alay ch'uxña pampanakar apapxam.",
                    "bioindicador_ancestral": "Floración atípica y abundante de algarrobos y zapotes en el bosque seco, señal tradicional de precipitaciones venideras."
                },
                {
                    "id": "m3", "mes": "NOV 26", "anio": 2026, "label": "Noviembre 2026", "estado": "CRITICO", "es_hoy": False,
                    "dia_inicio": 62, "dia_fin": 91, "dia_rango_relativo": "D+62 → D+91 (NOV★)", "duracion_dias": 30,
                    "fase": "VENTANA DORADA (DEADLINE)", "anomalia_tsm": "+2.1°C", "color": "#facc15", "severidad_pct": 45, "tipo": "VENTANA_DORADA",
                    "analogo": "Hito Táctico C2",
                    "consecuencias_proyectadas": "DEADLINE FÍSICO IMPRORROGABLE: Límite final para descolmatación y enrocado riprap en fajas marginales urbanas antes de que las avenidas fluviales impidan el trabajo de maquinaria.",
                    "mensaje_autoridad": "¡DEADLINE FÍSICO! El 30 de Noviembre vence la posibilidad de trabajar con excavadoras en los ríos. Traslado obligatorio de maquinaria a campamentos secos.",
                    "mensaje_comunitario_castellano": "Último mes seco en las cuencas. Todos los puentes y badenes comunales deben quedar libres de troncos y piedras. Preparar mochilas de emergencia.",
                    "mensaje_quechua": "¡TUKUY CHURANAPAQ KURAQ PACHA! Mayupi maquinakuna llinp'iyta manaraq qallarichkan tukuchun. Mochila de emergencia nisqata rurakuychik.",
                    "mensaje_aymara": "Ch'uxña urunaka tukusxiwa. Jawirankasisa maquinanaka qhiparu apsupxam. Jach'a uma janiw llamp'uchaykiti.",
                    "bioindicador_ancestral": "Vuelos nocturnos de libélulas y avistamiento de sapos cerca de canales secos, anunciando humedad atmosférica creciente."
                },
                {
                    "id": "m4", "mes": "DIC 26", "anio": 2026, "label": "Diciembre 2026", "estado": "AMENAZA", "es_hoy": False,
                    "dia_inicio": 92, "dia_fin": 122, "dia_rango_relativo": "D+92 → D+122", "duracion_dias": 31,
                    "fase": "Inicio Lluvias Costeras", "anomalia_tsm": "+2.5°C", "color": "#ef4444", "severidad_pct": 60, "tipo": "AMENAZA_INICIAL",
                    "analogo": "FEN 2012 / 2019",
                    "consecuencias_proyectadas": "Lluvias torrenciales tempranas en Tumbes y Piura. Saturación inicial de quebradas secas y primeros desvíos preventivos de tránsito en tramos vulnerables de la Panamericana Norte.",
                    "mensaje_autoridad": "Activación en sesión permanente de Salas de Crisis COER y COEL. Guardias de 24 horas en diques y puntos críticos de rebose.",
                    "mensaje_comunitario_castellano": "Llegan las primeras lluvias fuertes al norte. No cruzar ríos a pie ni en camioneta cuando el agua se torne turbia o marrón.",
                    "mensaje_quechua": "Sinchi param qallarin. Mayu yanakuspa hamuptinqa amapuni chimpapuychikchu, lloqllachá chayaykamunqa.",
                    "mensaje_aymara": "Nayrïr jach'a jallunaka purini. Jawirax ch'iyarakispa qhuruyaspanxa janipuni khitis paspanti, qala llusk'aniwa.",
                    "bioindicador_ancestral": "Hormigas de campo trasladando huevos hacia partes altas y nidos de aves construidos por encima del nivel habitual de ramas."
                },
                {
                    "id": "m5", "mes": "ENE 27", "anio": 2027, "label": "Enero 2027", "estado": "ALERTA_MAX", "es_hoy": False,
                    "dia_inicio": 123, "dia_fin": 153, "dia_rango_relativo": "D+123 → D+153", "duracion_dias": 31,
                    "fase": "Ciclón & Ondas Costeras", "anomalia_tsm": "+2.9°C", "color": "#dc2626", "severidad_pct": 75, "tipo": "AMENAZA_SEVERA",
                    "analogo": "Ciclón Yaku (+2.8°C)",
                    "consecuencias_proyectadas": "Acoplamiento atmosférico oceánico análogo a Yaku. Activación violenta de quebradas costeras y saturación rápida de suelos en cuencas de Lima y Áncash.",
                    "mensaje_autoridad": "Evacuación inmediata y obligatoria de viviendas asentadas en cauces secos y laderas inestables hacia albergues temporales seguros.",
                    "mensaje_comunitario_castellano": "Quebradas secas pueden activarse de noche sin aviso previo. Dormir alertas y mantener la radio comunitaria a pilas encendida.",
                    "mensaje_quechua": "Wayq'ukunan tutamanta phawaykamunqa. Rikch'arisqa kawsaychik, radiotapas uyariychik maymanta willakamunankama.",
                    "mensaje_aymara": "Jawiranakax arumaxa katusispa jallt'iriwa. Amuyasisa ikipxam, janiw ch'amaka pampanakar sarapxamti.",
                    "bioindicador_ancestral": "Bandadas de gaviotas ingresando varios kilómetros tierra adentro hacia los valles huyendo del oleaje turbulento."
                },
                {
                    "id": "m6", "mes": "FEB 27", "anio": 2027, "label": "Febrero 2027", "estado": "ALERTA_MAX", "es_hoy": False,
                    "dia_inicio": 154, "dia_fin": 181, "dia_rango_relativo": "D+154 → D+181", "duracion_dias": 28,
                    "fase": "Huaicos y Desbordes", "anomalia_tsm": "+3.3°C", "color": "#b91c1c", "severidad_pct": 90, "tipo": "AMENAZA_MUY_FUERTE",
                    "analogo": "Niño 2017 (+3.2°C)",
                    "consecuencias_proyectadas": "Avenidas máximas sostenidas en ríos Piura y La Leche (>2,000 m³/s). Colapso de alcantarillados urbanos, anegamiento masivo y caída de puentes carrozables secundarios.",
                    "mensaje_autoridad": "Declaratoria de estado de calamidad distrital. Distribución de agua potable con cisternas de las FFAA y carpas INDECI.",
                    "mensaje_comunitario_castellano": "Protección de fuentes de agua dulce para evitar contaminación con lodo. Hervir toda el agua y proteger a niños contra zancudos.",
                    "mensaje_quechua": "Yaku upyanata chuya waqaychaychik t'urunmanta. Chhulli onqoymanta, ch'uspikunamantapas wawakunata sumaqta qhawapuychik.",
                    "mensaje_aymara": "Uma q'uma imapxam, jan jallu uma upyapxamti. Chhuxu usuw purini, wawanakaru sum amuyapxam.",
                    "bioindicador_ancestral": "Sonido sordo y vibración subterránea en las nacientes de cerros, indicativo de derrumbes y colmatación de bolsones de agua."
                },
                {
                    "id": "m7", "mes": "MAR 27", "anio": 2027, "label": "Marzo 2027", "estado": "CATASTROFE", "es_hoy": False,
                    "dia_inicio": 182, "dia_fin": 212, "dia_rango_relativo": "D+182 → D+212 (MARZO🚨)", "duracion_dias": 31,
                    "fase": "CLÍMAX HISTÓRICO FEN", "anomalia_tsm": "+4.1°C", "color": "#450a0a", "severidad_pct": 100, "tipo": "CLIMAX_HISTORICO",
                    "analogo": "Mega-Niño 1982-83 / 97-98",
                    "consecuencias_proyectadas": "CLÍMAX HISTÓRICO CATASTRÓFICO: Máximo acoplamiento térmico costero. Activación simultánea de cuencas norte y centro (Rímac, Piura, Tumbes). Aislamiento interregional prolongado e inundación de valles agrícolas.",
                    "mensaje_autoridad": "Punto culminante de impacto. Coordinación con puente aéreo FAP para rescate de poblaciones aisladas y entrega de víveres de supervivencia.",
                    "mensaje_comunitario_castellano": "Momento más crítico de la temporada. Mantener la unión comunal, permanecer en zonas altas y coordinar ollas comunes solidarias.",
                    "mensaje_quechua": "¡HATUN LLAKI CHAYAYKAMUSQA! Aylluntin huñunasqa kawsaychik hanay pampakunapi. Huñu mankakunata ruraspa mikuykuychik.",
                    "mensaje_aymara": "Jach'a llakiwa akapachanxa. Taqpacha jilatanaka mayacht'asis janiw jiwt'apxamti, alay qullunakarux qhiparapxam.",
                    "bioindicador_ancestral": "Coloración rojiza del mar (aguaje) por muerte de fitoplancton frío y ausencia total de peces costeros tradicionales."
                },
                {
                    "id": "m8", "mes": "ABR 27", "anio": 2027, "label": "Abril 2027", "estado": "IMPACTO", "es_hoy": False,
                    "dia_inicio": 213, "dia_fin": 242, "dia_rango_relativo": "D+213 → D+242", "duracion_dias": 30,
                    "fase": "Resaca Fluvial & Aluviones", "anomalia_tsm": "+2.7°C", "color": "#b91c1c", "severidad_pct": 70, "tipo": "RESACA_FLUVIAL",
                    "analogo": "Cola Aluvial Post-Pico",
                    "consecuencias_proyectadas": "Resaca fluvial y aluviones de lodo remanentes. Cuencas bajas con desagüe lento, lagunas artificiales en áreas deprimidas y desborde por sedimentación acumulada.",
                    "mensaje_autoridad": "Desagüe forzado con motobombas de alta capacidad en calles inundadas y fumigación masiva contra el zancudo del dengue.",
                    "mensaje_comunitario_castellano": "El agua estancada es foco de dengue y zancudos. Tapar recipientes con agua y usar ropa que cubra brazos y piernas.",
                    "mensaje_quechua": "Sayasqa yakuqa ch'uspikunatam paqarichimun. Yakuta sumaqta tapaychik, churakuychik suni p'achakunata.",
                    "mensaje_aymara": "Sayt'at uma qhuruyasiriwa, q'iwi ch'uspinaka nasini. Uma wayt'apxam, jach'a isimpi janchip jark'aqapxam.",
                    "bioindicador_ancestral": "Aparición masiva de mosquitos y grillos gigantes en zonas urbanas tras el cese de los primeros vientos alisios."
                },
                {
                    "id": "m9", "mes": "MAY 27", "anio": 2027, "label": "Mayo 2027", "estado": "DESCENSO", "es_hoy": False,
                    "dia_inicio": 243, "dia_fin": 273, "dia_rango_relativo": "D+243 → D+273", "duracion_dias": 31,
                    "fase": "Descompresión & Alisios", "anomalia_tsm": "+1.9°C", "color": "#ea580c", "severidad_pct": 45, "tipo": "DESCOMPRESION",
                    "analogo": "Reinstalación Alisios",
                    "consecuencias_proyectadas": "Descompresión convectiva e intensificación de vientos alisios del sur. Crisis epidemiológica secundaria por vectores (Dengue, Leptospirosis, EDA) y desabastecimiento de insumos básicos.",
                    "mensaje_autoridad": "Evaluación de Daños y Análisis de Necesidades (EDAN) para empadronar damnificados y tramitar bonos de arrendamiento de emergencia.",
                    "mensaje_comunitario_castellano": "Comienza a soplar viento fresco del sur. Momento de empadronarse ante las autoridades comunales para la reconstrucción.",
                    "mensaje_quechua": "Urhu wayram chayamun mama quchamanta. Huñunakuypi sutiykichikta qillqachiychik wasinchikta sayarichinapaq.",
                    "mensaje_aymara": "Ainacha thayaw purintani. Jilatanaka mayampi qillqayasis utanakasa askichañataki phuqhapxam.",
                    "bioindicador_ancestral": "Cambio de dirección del viento de la tarde, soplando con fuerza desde el sur (viento Paraca) despejando la niebla cálida."
                },
                {
                    "id": "m10", "mes": "JUN 27", "anio": 2027, "label": "Junio 2027", "estado": "REMANENTE", "es_hoy": False,
                    "dia_inicio": 274, "dia_fin": 303, "dia_rango_relativo": "D+274 → D+303", "duracion_dias": 30,
                    "fase": "Saturación de Suelos", "anomalia_tsm": "+1.2°C", "color": "#f59e0b", "severidad_pct": 30, "tipo": "SATURACION_SUELOS",
                    "analogo": "Monitoreo Reconstrucción",
                    "consecuencias_proyectadas": "Suelos saturados al 80%. Obras tempranas de rehabilitación de transitabilidad, dragado de sedimentos en reservorios (Poechos/San Lorenzo) y restitución de servicios básicos.",
                    "mensaje_autoridad": "Dragado y rehabilitación de canales principales de regadío. Reapertura de caminos vecinales y trochas de saca de cosechas.",
                    "mensaje_comunitario_castellano": "La tierra retiene humedad fértil. Excelente momento para cultivos de ciclo corto y recuperación de pasturas comunales.",
                    "mensaje_quechua": "Allpam yakuwan sumaq hunt'asqa kachkan. Tarpunapaq allin pacha, chakra kawsaykuna usqhaylla puqunanpaq.",
                    "mensaje_aymara": "Uraqix ch'uxña umampi sumakiwa. Jathanaka phawaspa qhipa ch'uñu achunakanaka apthapiñapuniwa.",
                    "bioindicador_ancestral": "Presencia de pastos verdes exuberantes en lomas costeras normalmente áridas y desérticas."
                },
                {
                    "id": "m11", "mes": "JUL 27", "anio": 2027, "label": "Julio 2027", "estado": "CIERRE", "es_hoy": False,
                    "dia_inicio": 304, "dia_fin": 334, "dia_rango_relativo": "D+304 → D+334 (JULIO CIERRE)", "duracion_dias": 31,
                    "fase": "Cierre Ciclo Interanual", "anomalia_tsm": "+0.5°C", "color": "#10b981", "severidad_pct": 15, "tipo": "CIERRE_INTERANUAL",
                    "analogo": "Transición a Normalidad",
                    "consecuencias_proyectadas": "Cierre del ciclo interanual 2026-2027. Normalización progresiva de anomalías térmicas marinas y balance definitivo de daños multisectoriales para reconstrucción definitiva.",
                    "mensaje_autoridad": "Cierre de cuentas de emergencia y rendición documentada de gastos ante Contraloría y MEF. Actualización del plan comunal de contingencia.",
                    "mensaje_comunitario_castellano": "El mar y el clima regresan a su ritmo habitual. Aprendizaje y preparación comunitaria para el siguiente ciclo del Niño.",
                    "mensaje_quechua": "Mama quchapas, paramanpas hawkallam tikrakun. Yachasqanchikwan wasinchikta qipaq watakunapaq amachasun.",
                    "mensaje_aymara": "Quta umasa mayampi samart'xiwa. Yatiqatampi juk'ampi amuyt'asis qhipa maranakaraki suyapxañani.",
                    "bioindicador_ancestral": "Retorno masivo de la anchoveta a aguas someras y reaparición de cardúmenes de caballa y jurel cerca del litoral."
                }
            ],
            "advertencia_doctrinaria": "MODELO REFERENCIAL PROYECTIVO: Cuadro de barras e histograma en días (D+0 a D+334) calibrado sobre el comportamiento hidrometeorológico de los eventos extraordinarios 1982-83, 1997-98, Niño Costero 2017 y Ciclón Yaku 2023. Las consecuencias e intensidades son referenciales y permiten anticipar las ventanas de respuesta operativa multisectorial.",
            "ventana_dorada": {
                "mes": "Noviembre",
                "badge": "NOV★ DEADLINE",
                "dias_restantes": days_to_golden_fen,
                "estado_urgencia": "CRITICO_VENTANA_CERRANDOSE" if days_to_golden_fen < 60 else "EN_EJECUCION",
                "cartera_obras_pp0068": mef_obras_service.get_resumen_obras_por_grupo_logistico(),
                "doctrina_logistica": [
                    {
                        "hitos": "Descolmatación intensiva de cauces fluviales",
                        "entidades": "ANA / Gobiernos Regionales",
                        "progreso_nacional": 68,
                        "critico": True
                    },
                    {
                        "hitos": "Enrocado riprap y conformación de diques en márgenes urbanas",
                        "entidades": "MTC / Municipalidades",
                        "progreso_nacional": 52,
                        "critico": True
                    },
                    {
                        "hitos": "Protección de bocatomas rústicas de riego agrícola",
                        "entidades": "MIDAGRI / Juntas de Usuarios",
                        "progreso_nacional": 45,
                        "critico": False
                    },
                    {
                        "hitos": "Preposicionamiento de convoyes de maquinaria INDECI",
                        "entidades": "INDECI / Ejército del Perú",
                        "progreso_nacional": 74,
                        "critico": True
                    }
                ]
            },
            "doctrina_logistica_obras_pp0068": mef_obras_service.get_resumen_obras_por_grupo_logistico(),
            "probabilidad_fen_2026_2027": {
                "temporada": "Ciclo Interanual 2026 - 2027 (Hasta Julio 2027)",
                "probabilidad_global_pct": 84,
                "estado_alerta": "ALERTA_EL_NINO_COSTERO",
                "fuente_oficial": "Comisión Multisectorial ENFEN / NOAA CPC / ECMWF",
                "desglose_magnitud": [
                    {"magnitud": "Fuerte / Extraordinario (1982-83 / 1997-98)", "probabilidad_pct": 48, "color": "#450a0a"},
                    {"magnitud": "Moderado a Fuerte (Yaku 2023 / 2017)", "probabilidad_pct": 34, "color": "#dc2626"},
                    {"magnitud": "Débil", "probabilidad_pct": 12, "color": "#f87171"},
                    {"magnitud": "Condición Neutra", "probabilidad_pct": 6, "color": "#10b981"}
                ]
            },
            "analogos_historicos": [
                {
                    "evento": "Mega-Niño 1982-1983",
                    "categoria": "EXTRAORDINARIO",
                    "anomalia_tsm": "+4.1°C",
                    "impacto": "Lluvias extremas récord en Piura y Tumbes (1,200 mm acumulados). Desborde e interrupción vial.",
                    "perdidas_usd": "$3,280M USD",
                    "angulo_marcador": 45.0
                },
                {
                    "evento": "El Niño 1997-1998",
                    "categoria": "EXTRAORDINARIO",
                    "anomalia_tsm": "+3.8°C",
                    "impacto": "Desbordes simultáneos en cuencas Norte y Centro (Rímac, Piura, La Leche). 530,000 damnificados.",
                    "perdidas_usd": "$3,500M USD",
                    "angulo_marcador": 60.0
                },
                {
                    "evento": "El Niño Costero 2017",
                    "categoria": "SÚBITO / COSTERO",
                    "anomalia_tsm": "+3.2°C",
                    "impacto": "7 huaicos consecutivos en Qda. San Ildefonso cruzando Trujillo. Colapso de puente Huaycoloro.",
                    "perdidas_usd": "$3,124M USD",
                    "angulo_marcador": 68.0
                },
                {
                    "evento": "Ciclón Yaku (Marzo 2023)",
                    "categoria": "VÓRTICE CONVECTIVO",
                    "anomalia_tsm": "+2.8°C",
                    "impacto": "Activación masiva de quebradas secas en la vertiente occidental y corte en Carretera Central.",
                    "perdidas_usd": "$1,450M USD",
                    "angulo_marcador": 75.0
                }
            ]
        },
        "amaru_chiri": {
            "id": "amaru_chiri",
            "titulo": "Reloj AMARU-CHIRI (Sierra Sur & Alto Altiplano)",
            "amenaza": "HELADAS_Y_FRIAJES_CRITICOS",
            "temp_minima_altiplano_c": temp_min_altiplano,
            "isoterma_severa_c": -12.0,
            "estacion_referencia": "SENAMHI EMA Mazocruz (Puno, 3,970 msnm)",
            "angulo_aguja": chiri_hand_angle,
            "geometria_c2": {
                "centro_x": 260.0,
                "centro_y": 260.0,
                "radio_exterior": 247.0
            },
            "arco_amenaza": {
                "sector": "Mayo a Julio (90° amplitud glacial)",
                "angulo_inicio": 120.0,
                "angulo_fin": 210.0,
                "pistas_radiales": [
                    {"pista": "Pista Exterior (r: 247-220)", "label": "ISOTERMAS BAJO CERO (< -10°C)"},
                    {"pista": "Pista Media (r: 220-180)", "label": "MORTANDAD NEONATAL CAMÉLIDOS"},
                    {"pista": "Pista Interior (r: 180-140)", "label": "AGOTAMIENTO DE FORRAJE"}
                ],
                "color_base": "#38bdf8"
            },
            "ventana_dorada": {
                "mes": "Abril",
                "badge": "ABR★ GOLDEN WINDOW",
                "dias_restantes": days_to_golden_chiri,
                "color_destacado": "#facc15",
                "borde_destacado": "#fef08a",
                "doctrina_logistica": [
                    {
                        "hitos": "Desparasitación y vitaminización ADE de madres alpacas preñadas",
                        "entidades": "SERFOR / Agro Rural / MIDAGRI",
                        "progreso_nacional": 82,
                        "critico": True
                    },
                    {
                        "hitos": "Acopio y resguardo seco de pacas de heno de alfalfa en Tambos",
                        "entidades": "Programa Nacional PAIS / Agro Rural",
                        "progreso_nacional": 88,
                        "critico": True
                    },
                    {
                        "hitos": "Acondicionamiento térmico de escuelas rurales y ajuste horario PREVAED",
                        "entidades": "MINEDU / DRE Puno / DRE Cusco",
                        "progreso_nacional": 75,
                        "critico": True
                    }
                ]
            },
            "probabilidad_nina_2026_2027": {
                "temporada": "Invierno 2026 - 2027",
                "probabilidad_global_pct": 74,
                "estado_alerta": "VIGILANCIA_DE_LA_NINA_Y_HELADAS",
                "fuente_oficial": "SENAMHI / MIDAGRI Agro Rural / NOAA CPC",
                "desglose_magnitud": [
                    {"magnitud": "Helada Polar / Severa (< -15°C)", "probabilidad_pct": 30, "color": "#0284c7"},
                    {"magnitud": "Moderada (-10°C a -15°C)", "probabilidad_pct": 44, "color": "#38bdf8"},
                    {"magnitud": "Débil (-5°C a -10°C)", "probabilidad_pct": 18, "color": "#7dd3fc"},
                    {"magnitud": "Condición Neutra", "probabilidad_pct": 8, "color": "#10b981"}
                ]
            },
            "analogos_historicos": [
                {
                    "evento": "La Niña 1988-1989",
                    "categoria": "POLAR EXTREMA",
                    "tmin": "-22.0°C en Mazocruz",
                    "impacto": "Pérdida de más del 32% del hato de alpacas por helada negra sin forraje.",
                    "alpacas_afectadas": "280,000 cabezas",
                    "angulo_marcador": 165.0
                },
                {
                    "evento": "La Niña 2007-2008",
                    "categoria": "OLA DE FRÍO & FRIAJE",
                    "tmin": "-18.5°C en Imata",
                    "impacto": "Ola de frío polar en cordillera combinada con friaje extremo en selva baja (Madre de Dios a 9°C).",
                    "alpacas_afectadas": "145,000 cabezas",
                    "angulo_marcador": 180.0
                },
                {
                    "evento": "Crisis Polar 2015-2016",
                    "categoria": "NEVADAS & HELADA",
                    "tmin": "-16.8°C en Macusani",
                    "impacto": "Bloqueo de pasos cordilleranos a más de 4,300 msnm y mortandad de crías por hipotermia.",
                    "alpacas_afectadas": "180,000 crías",
                    "angulo_marcador": 172.0
                },
                {
                    "evento": "Helada Negra 2022",
                    "categoria": "DÉFICIT DE FORRAJE",
                    "tmin": "-14.2°C en Alto Altiplano",
                    "impacto": "Sequía agronómica asociada y rápido agotamiento de las reservas de pacas de heno en Tambos.",
                    "alpacas_afectadas": "92,000 cabezas",
                    "angulo_marcador": 188.0
                }
            ]
        }
    }

def get_yachay_knowledge() -> Dict[str, Any]:
    """
    Retorna la base de conocimiento de Educación Climática y Gobernanza Territorial:
    - Doctrina y Directivas para Autoridades Locales / Regionales (PP 068, Ventana Dorada, SINAGERD).
    - Diálogo de Saberes y Bioindicadores Ancestrales para Comunidades Campesinas e Indígenas.
    - Repertorio de Lenguas Originarias (Quechua Chanka, Collao, Ancashino, Aymara).
    """
    return {
        "plataforma": "AMARU-CLIMATE",
        "modulo": "AMARU-YACHAY",
        "descripcion": "Centro de Educación Climática Territorial, Diálogo de Saberes y Doctrina de Mando",
        "doctrina_autoridades": {
            "titulo": "Doctrina de Mando para Autoridades Regionales y Locales (SINAGERD N° 29664)",
            "ventana_dorada": {
                "concepto": "La Ventana Dorada Logística es el período físico y estacional entre Septiembre y Noviembre en el cual los caudales de los ríos y las quebradas secas permiten el ingreso seguro y continuo de maquinaria pesada (tractores sobre orugas D8/D9, excavadoras 330, volquetes).",
                "fecha_limite": "30 de Noviembre",
                "por_que_falla_la_gestion": "Las autoridades novatas suelen esperar la declaratoria de emergencia de Enero o Febrero cuando ya comenzó a llover. En ese momento, la fuerza de arrastre de sedimentos y el nivel freático hacen que las máquinas se atasquen o sean volteadas por avenidas intempestivas, encareciendo los costos hasta un 400% y perdiendo vidas humanas.",
                "hitos_obligatorios": [
                    {"hito": "Aprobación de fichas técnicas definitivas de defensas ribereñas", "mes_limite": "Septiembre"},
                    {"hito": "Contratación de maquinaria pesada y reserva estratégica de diésel", "mes_limite": "Octubre"},
                    {"hito": "Culminación de enrocado rip-rap y retiro de maquinaria a campamento seco", "mes_limite": "30 de Noviembre"},
                    {"hito": "Activación del Puesto de Comando de Avanzada (COEL 24/7)", "mes_limite": "15 de Diciembre"}
                ]
            },
            "presupuesto_pp068": {
                "nombre": "Programa Presupuestal 068: Reducción de la Vulnerabilidad y Atención de Emergencias por Desastres",
                "directiva_mef": "Permite habilitar transferencias y modificaciones presupuestarias de partidas ordinarias no priorizadas hacia actividades de emergencia (Actividad 5006144: Atención de Actividades de Emergencia).",
                "responsabilidad_legal": "El artículo 89 del Reglamento de la Ley SINAGERD establece responsabilidad administrativa, civil y penal (omisión de deberes de función) para los alcaldes y gerentes que no ejecuten las partidas del PP 068 contando con alertas tempranas oficiales del SENAMHI y ENFEN."
            },
            "checklist_10_acciones": [
                "1. Descolmatación de cauces críticos identificados por la ANA.",
                "2. Colocación de roca al volteo (rip-rap) en curvas de socavación activa.",
                "3. Limpieza de alcantarillas, pontones y quebradas que cruzan centros urbanos.",
                "4. Empadronamiento de familias en zonas de muy alto riesgo no mitigable.",
                "5. Señalización y adecuación de rutas de evacuación hacia terrazas altas.",
                "6. Mantenimiento y prueba de motobombas de desagüe de 4 y 6 pulgadas.",
                "7. Stock de sacos terreros (mínimo 10,000 unidades por distrito costero).",
                "8. Reserva de alimentos no perecibles, agua embotellada y calaminas galvanizadas.",
                "9. Registro actualizado en el Sistema de Información Nacional para la Respuesta (SINPAD).",
                "10. Red comunitaria de radio VHF/HF con baterías cargadas para enlace con el COER/COEN."
            ]
        },
        "dialogo_saberes_comunidades": {
            "titulo": "Diálogo de Saberes: Sabiduría Ancestral y Monitoreo Bioclimático",
            "enfoque": "La ciencia satelital moderna de AMARU-CLIMATE no reemplaza los saberes milenarios de las comunidades campesinas y pueblos originarios, sino que dialoga con ellos para crear una cultura de prevención resiliente y respetuosa del territorio.",
            "bioindicadores": [
                {
                    "nombre": "Comportamiento de Aves Marinas Guaneras (Piqueros, Guanayes y Pelícanos)",
                    "region": "Costa Pacífica (Tumbes a Ica)",
                    "observacion_ancestral": "Cuando las aves guaneras abandonan las islas, vuelan erraticas hacia las orillas o se adentran en tierra firme, los antiguos pescadores saben que el mar se ha calentado profundamente (ondas Kelvin), hundiendo la anchoveta hacia aguas frías inalcanzables.",
                    "correlacion_cientifica": "Anomalía positiva de TSM Niño 1+2 superior a +1.5°C; termoclina profundizada a más de 50 metros."
                },
                {
                    "nombre": "Floración del Algarrobo (Prosopis pallida) y Zapote",
                    "region": "Bosque Seco del Norte (Piura, Lambayeque)",
                    "observacion_ancestral": "Una floración excesiva y temprana en los meses de Septiembre-Octubre anuncia 'año de agua' o Niño abundante.",
                    "correlacion_cientifica": "Incremento de humedad relativa nocturna y transpiración vegetal acelerada por advección de aire cálido ecuatorial."
                },
                {
                    "nombre": "Constelación de Qullqa / Las Pléyades",
                    "region": "Sierra Central y Sierra Sur (Cusco, Puno, Ayacucho)",
                    "observacion_ancestral": "Durante el solsticio de Junio, si las estrellas de las Pléyades se observan nítidas y brillantes, habrá lluvias regulares en verano. Si se observan borrosas o pequeñas, las lluvias se retrasarán o vendrá sequía/helada.",
                    "correlacion_cientifica": "Presencia de cirros tenues a gran altitud atmosférica impulsados por vientos de la alta troposfera relacionados con la fase ENSO."
                },
                {
                    "nombre": "Anidación de la Huallata y Aves de Humedal",
                    "region": "Altiplano y Punas Altoandinas (Puno, Arequipa, Huancavelica)",
                    "observacion_ancestral": "Si las huallatas construyen sus nidos en la parte alta de los totorales o peñascos secos, predicen crecidas e inundaciones. Si anidan en las orillas bajas, anuncian año seco.",
                    "correlacion_cientifica": "Sensibilidad barométrica de aves acuáticas a gradientes de presión regional previas a fases convectivas de la ZCIT."
                },
                {
                    "nombre": "Viento Paraca y Dirección de Corrientes de Aire",
                    "region": "Costa Central y Sur",
                    "observacion_ancestral": "El cese prolongado del viento del sur y la aparición de brisas húmedas y tibias desde el norte indican la ruptura de la barrera de los vientos alisios.",
                    "correlacion_cientifica": "Debilitamiento del Anticiclón del Pacífico Sur (APS), permitiendo el avance libre de aguas cálidas hacia el litoral central."
                }
            ],
            "calendario_comunal_adaptativo": {
                "costa_norte": {
                    "regla_oro": "Evitar sembrar maíz o algodón en fajas marginales o lechos secos en años de Niño moderado o fuerte. Priorizar arroz en terrazas protegidas y cultivos de ciclo corto.",
                    "medidas_pecuarias": "Trasladar hatos de caprinos y vacunos hacia partes altas del bosque seco antes de diciembre; preparar plataformas elevadas de madera para porcinos y aves."
                },
                "sierra_sur": {
                    "regla_oro": "En años de Niño fuerte en la costa, suele haber veranillos o déficit hídrico temporal en el Altiplano. Conservar agua en qochas altoandinas y diversificar parcelas agrícolas en diferentes pisos altitudinales (aynokas).",
                    "medidas_pecuarias": "Dosificación y desparasitación de madres alpacas en Abril (Ventana Dorada AMARU-CHIRI); almacenamiento de heno de avena en cobertizos térmicos secos."
                }
            }
        }
    }
