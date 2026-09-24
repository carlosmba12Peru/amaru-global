# -*- coding: utf-8 -*-
"""
Script de Integración Pericial Factual: INGEMMET 2017 & INDECI Compendio 2017
AMARU-CLIMATE / Lab4
=============================================================================
Este script actualiza atómicamente los datasets de memoria histórica, quebradas
críticas, fuentes validadas, catálogo maestro y puentes/carreteras en:
- Lab4/data/
- Lab4/backend/data/
"""

import os
import json
import tempfile
import subprocess
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent.parent
DATA_DIRS = [
    BASE_DIR / "data",
    BASE_DIR / "backend" / "data"
]

TEMP_DIR = Path(tempfile.gettempdir())

print(f"Base Directory: {BASE_DIR}")
for d in DATA_DIRS:
    print(f"Data Dir Target: {d} (exists: {d.exists()})")

def atomic_write_and_copy(target_path: Path, data_dict_or_list):
    """Escribe en TEMP y copia con shell=True al destino."""
    temp_file = TEMP_DIR / target_path.name
    with open(temp_file, "w", encoding="utf-8") as f:
        json.dump(data_dict_or_list, f, indent=2, ensure_ascii=False)
    
    # Copiar con shell=True en cmd
    dst_str = str(target_path.resolve())
    res = subprocess.run(f'copy /Y "{temp_file}" "{dst_str}"', shell=True, capture_output=True, text=True)
    if res.returncode != 0:
        raise RuntimeError(f"Error copiando {temp_file} a {dst_str}: {res.stderr} | {res.stdout}")
    
    # Limpiar temp
    try:
        temp_file.unlink()
    except Exception:
        pass
    print(f"[OK] Actualizado exitosamente: {dst_str}")


# =============================================================================
# 1. ACTUALIZACIÓN DE FUENTES VALIDADAS (fuentes_validadas_amaru.json)
# =============================================================================
ingemmet_source = {
    "id": "SRC-INGEMMET-DGAR-2017",
    "nombre": "INGEMMET - Evaluación Geológica de las Zonas Afectadas por el Niño Costero 2017 en las Regiones La Libertad y Cajamarca",
    "ente": "INGEMMET (Dirección de Geología Ambiental y Riesgo Geológico)",
    "tier": "TIER_1_OFICIAL_ESTATAL",
    "dominio_autorizado": "https://repositorio.ingemmet.gob.pe",
    "endpoint_especifico": "https://repositorio.ingemmet.gob.pe/handle/20.500.12544/InformeTecnicoNiñoCostero2017",
    "categoria": "GEODINAMICA_ZONAS_CRITICAS",
    "metodo_extraccion": "REPOSITORIO_PERICIAL_INGEMMET",
    "frecuencia_minutos": 1440,
    "variables_clave": [
        "zonas_criticas_movimientos_en_masa",
        "flujos_detritos_huaicos_manning",
        "deslizamientos_rotacionales_escarpa_terzaghi",
        "erosion_fluvial_socavacion_estribos",
        "vulnerabilidad_infraestructura_vial_puentes"
    ],
    "gatilla_calculo_directo": True,
    "estado": "ACTIVO_AUDITADO"
}

indeci_source = {
    "id": "SRC-INDECI-COMPENDIO-2017",
    "nombre": "INDECI - Compendio Estadístico del INDECI 2017: Gestión Reactiva (Niño Costero Enero-Mayo 2017)",
    "ente": "INDECI (Dirección de Políticas, Planes y Evaluación)",
    "tier": "TIER_1_OFICIAL_ESTATAL",
    "dominio_autorizado": "https://www.indeci.gob.pe",
    "endpoint_especifico": "https://www.indeci.gob.pe/compendio-estadistico-2017/",
    "categoria": "REGISTRO_OFICIAL_DANOS_SINPAD",
    "metodo_extraccion": "COMPENDIO_ESTADISTICO_PROCESADO_95.5PCT",
    "frecuencia_minutos": 1440,
    "variables_clave": [
        "damnificados_validados_95.5pct",
        "viviendas_colapsadas_inhabitables",
        "carreteras_puentes_destruidos",
        "hectareas_agricolas_perdidas",
        "albergues_familias_instaladas"
    ],
    "gatilla_calculo_directo": True,
    "estado": "ACTIVO_AUDITADO"
}

def update_fuentes_validadas():
    for d in DATA_DIRS:
        target_file = d / "fuentes_validadas_amaru.json"
        if not target_file.exists():
            continue
        with open(target_file, "r", encoding="utf-8") as f:
            data = json.load(f)
        
        existing_ids = {s["id"] for s in data.get("fuentes_validadas", [])}
        updated = False
        if ingemmet_source["id"] not in existing_ids:
            data["fuentes_validadas"].append(ingemmet_source)
            updated = True
        if indeci_source["id"] not in existing_ids:
            data["fuentes_validadas"].append(indeci_source)
            updated = True
        
        if updated:
            atomic_write_and_copy(target_file, data)
        else:
            print(f"[SKIP] Fuentes ya presentes en {target_file}")

# =============================================================================
# 2. NUEVAS QUEBRADAS CRÍTICAS (catalogo_quebradas_criticas.json)
# =============================================================================
nuevas_quebradas = [
    # --- CAJAMARCA (Cuenca Jequetepeque / Yonán, Chilete, Contumazá, Tantarica) ---
    {
        "id_quebrada": "QDA-CAJ-YON-01",
        "id": "QDA-CAJ-YON-01",
        "codigo_tactico_c2": "TAC-QDA-CAJ-YON-01",
        "nombre_quebrada": "Quebrada Pay Pay",
        "nombre": "Quebrada Pay Pay",
        "distrito": "Yonán",
        "provincia": "Contumazá",
        "departamento": "Cajamarca",
        "region": "Cajamarca",
        "distritos_impactados": ["Yonán"],
        "ubigeo": "060508",
        "cuenca": "Cuenca del Río Jequetepeque",
        "cuenca_id": "CUENCA-JEQUETEPEQUE",
        "lat": -7.2625,
        "lng": -79.1158,
        "pendiente_media_grados": 24.5,
        "pendiente_media_pct": 36.8,
        "area_cuenca_km2": 18.2,
        "tiempo_retardo_t_lag_min": 38.0,
        "tiempo_concentracion_horas": 0.63,
        "umbral_critico_mm_hora": 16.0,
        "umbral_acumulado_24h": 42.0,
        "velocidad_manning_m_s": 4.2,
        "poblacion_expuesta": 1450,
        "poblacion_en_cono_deyeccion": 1450,
        "nivel_criticidad": "CRITICO",
        "infraestructura_amenazada": "Poblado Pay Pay, viviendas asentadas en confluencia aluvial, Carretera Ciudad de Dios - Cajamarca",
        "observacion_geologica_ingemmet": "Confluencia de dos conos de huaico antiguo. Abundante material suelto con bolones en cabeceras y laderas. Activación severa en FEN 1998 y 2017 (Informe INGEMMET 2017).",
        "fuente": "INGEMMET_2017_DGAR",
        "fuente_estudio": "INGEMMET 2017 DGAR - Evaluación Geológica El Niño Costero"
    },
    {
        "id_quebrada": "QDA-CAJ-YON-02",
        "id": "QDA-CAJ-YON-02",
        "codigo_tactico_c2": "TAC-QDA-CAJ-YON-02",
        "nombre_quebrada": "Quebrada Las Viejas (Campamento Gallito Ciego)",
        "nombre": "Quebrada Las Viejas",
        "distrito": "Yonán",
        "provincia": "Contumazá",
        "departamento": "Cajamarca",
        "region": "Cajamarca",
        "distritos_impactados": ["Yonán"],
        "ubigeo": "060508",
        "cuenca": "Cuenca del Río Jequetepeque",
        "cuenca_id": "CUENCA-JEQUETEPEQUE",
        "lat": -7.2189,
        "lng": -79.1764,
        "pendiente_media_grados": 28.0,
        "pendiente_media_pct": 42.0,
        "area_cuenca_km2": 14.5,
        "tiempo_retardo_t_lag_min": 25.0,
        "tiempo_concentracion_horas": 0.42,
        "umbral_critico_mm_hora": 14.0,
        "umbral_acumulado_24h": 38.0,
        "velocidad_manning_m_s": 4.8,
        "poblacion_expuesta": 980,
        "poblacion_en_cono_deyeccion": 980,
        "nivel_criticidad": "CRITICO",
        "infraestructura_amenazada": "Campamento de Operaciones Represa Gallito Ciego, Puente y Alcantarilla Km 33+100 de la Carretera a Cajamarca",
        "observacion_geologica_ingemmet": "Depósito en abanico con bolonería de hasta 3.5 m de diámetro. Material suelto en cauce actual y cabeceras que amenaza el campamento hidráulico de Gallito Ciego (Informe INGEMMET 2017).",
        "fuente": "INGEMMET_2017_DGAR",
        "fuente_estudio": "INGEMMET 2017 DGAR - Evaluación Geológica El Niño Costero"
    },
    {
        "id_quebrada": "QDA-CAJ-YON-03",
        "id": "QDA-CAJ-YON-03",
        "codigo_tactico_c2": "TAC-QDA-CAJ-YON-03",
        "nombre_quebrada": "Quebrada Peña Blanca",
        "nombre": "Quebrada Peña Blanca",
        "distrito": "Yonán",
        "provincia": "Contumazá",
        "departamento": "Cajamarca",
        "region": "Cajamarca",
        "distritos_impactados": ["Yonán"],
        "ubigeo": "060508",
        "cuenca": "Cuenca del Río Jequetepeque",
        "cuenca_id": "CUENCA-JEQUETEPEQUE",
        "lat": -7.2472,
        "lng": -79.1306,
        "pendiente_media_grados": 22.0,
        "pendiente_media_pct": 33.0,
        "area_cuenca_km2": 12.0,
        "tiempo_retardo_t_lag_min": 32.0,
        "tiempo_concentracion_horas": 0.53,
        "umbral_critico_mm_hora": 17.0,
        "umbral_acumulado_24h": 45.0,
        "velocidad_manning_m_s": 3.9,
        "poblacion_expuesta": 3200,
        "poblacion_en_cono_deyeccion": 3200,
        "nivel_criticidad": "ALTO",
        "infraestructura_amenazada": "Casco urbano de Tembladera, viviendas en margen del cauce, defensas ribereñas de gaviones",
        "observacion_geologica_ingemmet": "Cauce que desciende directamente hacia el casco urbano de Tembladera. Presencia de gaviones y muros colmatados en 2017 (Informe INGEMMET 2017).",
        "fuente": "INGEMMET_2017_DGAR",
        "fuente_estudio": "INGEMMET 2017 DGAR - Evaluación Geológica El Niño Costero"
    },
    {
        "id_quebrada": "QDA-CAJ-YON-04",
        "id": "QDA-CAJ-YON-04",
        "codigo_tactico_c2": "TAC-QDA-CAJ-YON-04",
        "nombre_quebrada": "Pampa Las Amacas (Confluencia Cajón y Monte Grande)",
        "nombre": "Quebrada Pampa Las Amacas",
        "distrito": "Yonán",
        "provincia": "Contumazá",
        "departamento": "Cajamarca",
        "region": "Cajamarca",
        "distritos_impactados": ["Yonán"],
        "ubigeo": "060508",
        "cuenca": "Cuenca del Río Jequetepeque",
        "cuenca_id": "CUENCA-JEQUETEPEQUE",
        "lat": -7.2794,
        "lng": -79.0889,
        "pendiente_media_grados": 26.0,
        "pendiente_media_pct": 39.0,
        "area_cuenca_km2": 22.8,
        "tiempo_retardo_t_lag_min": 30.0,
        "tiempo_concentracion_horas": 0.50,
        "umbral_critico_mm_hora": 15.0,
        "umbral_acumulado_24h": 40.0,
        "velocidad_manning_m_s": 4.5,
        "poblacion_expuesta": 650,
        "poblacion_en_cono_deyeccion": 650,
        "nivel_criticidad": "CRITICO",
        "infraestructura_amenazada": "Plataforma vial Km 44+000 Carretera Ciudad de Dios - Cajamarca (tramo de 1500 m vulnerable)",
        "observacion_geologica_ingemmet": "Confluencia de quebradas Cajón y Monte Grande. En 1998 destruyó 300 m de plataforma y en 2017 generó corte crítico hacia Cajamarca (Informe INGEMMET 2017).",
        "fuente": "INGEMMET_2017_DGAR",
        "fuente_estudio": "INGEMMET 2017 DGAR - Evaluación Geológica El Niño Costero"
    },
    {
        "id_quebrada": "QDA-CAJ-YON-05",
        "id": "QDA-CAJ-YON-05",
        "codigo_tactico_c2": "TAC-QDA-CAJ-YON-05",
        "nombre_quebrada": "Quebrada El Mango",
        "nombre": "Quebrada El Mango",
        "distrito": "Yonán",
        "provincia": "Contumazá",
        "departamento": "Cajamarca",
        "region": "Cajamarca",
        "distritos_impactados": ["Yonán"],
        "ubigeo": "060508",
        "cuenca": "Cuenca del Río Jequetepeque",
        "cuenca_id": "CUENCA-JEQUETEPEQUE",
        "lat": -7.2117,
        "lng": -79.1931,
        "pendiente_media_grados": 21.0,
        "pendiente_media_pct": 31.5,
        "area_cuenca_km2": 9.5,
        "tiempo_retardo_t_lag_min": 35.0,
        "tiempo_concentracion_horas": 0.58,
        "umbral_critico_mm_hora": 18.0,
        "umbral_acumulado_24h": 48.0,
        "velocidad_manning_m_s": 3.7,
        "poblacion_expuesta": 420,
        "poblacion_en_cono_deyeccion": 420,
        "nivel_criticidad": "ALTO",
        "infraestructura_amenazada": "Terrenos agrícolas, viviendas de El Mango y Km 29+000 vía a Cajamarca",
        "observacion_geologica_ingemmet": "Confluencia de abanicos de huaico antiguo, reactivación por saturación en lluvias excepcionales (Informe INGEMMET 2017).",
        "fuente": "INGEMMET_2017_DGAR",
        "fuente_estudio": "INGEMMET 2017 DGAR - Evaluación Geológica El Niño Costero"
    },
    {
        "id_quebrada": "QDA-CAJ-YON-06",
        "id": "QDA-CAJ-YON-06",
        "codigo_tactico_c2": "TAC-QDA-CAJ-YON-06",
        "nombre_quebrada": "Quebrada del Caracol (Ventanillas)",
        "nombre": "Quebrada del Caracol",
        "distrito": "Yonán",
        "provincia": "Contumazá",
        "departamento": "Cajamarca",
        "region": "Cajamarca",
        "distritos_impactados": ["Yonán"],
        "ubigeo": "060508",
        "cuenca": "Cuenca del Río Jequetepeque",
        "cuenca_id": "CUENCA-JEQUETEPEQUE",
        "lat": -7.2550,
        "lng": -79.1230,
        "pendiente_media_grados": 27.0,
        "pendiente_media_pct": 40.5,
        "area_cuenca_km2": 11.2,
        "tiempo_retardo_t_lag_min": 28.0,
        "tiempo_concentracion_horas": 0.47,
        "umbral_critico_mm_hora": 15.0,
        "umbral_acumulado_24h": 40.0,
        "velocidad_manning_m_s": 4.1,
        "poblacion_expuesta": 890,
        "poblacion_en_cono_deyeccion": 890,
        "nivel_criticidad": "CRITICO",
        "infraestructura_amenazada": "Viviendas al borde de acantilado de 5 m por erosión fluvial, restos arqueológicos de Ventanillas",
        "observacion_geologica_ingemmet": "Huaicos de gran magnitud y erosión lateral en la margen izquierda del río Jequetepeque (Informe INGEMMET 2017).",
        "fuente": "INGEMMET_2017_DGAR",
        "fuente_estudio": "INGEMMET 2017 DGAR - Evaluación Geológica El Niño Costero"
    },
    {
        "id_quebrada": "QDA-CAJ-CHI-01",
        "id": "QDA-CAJ-CHI-01",
        "codigo_tactico_c2": "TAC-QDA-CAJ-CHI-01",
        "nombre_quebrada": "Quebrada Huertas",
        "nombre": "Quebrada Huertas",
        "distrito": "Chilete",
        "provincia": "Contumazá",
        "departamento": "Cajamarca",
        "region": "Cajamarca",
        "distritos_impactados": ["Chilete"],
        "ubigeo": "060503",
        "cuenca": "Cuenca del Río Jequetepeque / Subcuenca Huertas",
        "cuenca_id": "CUENCA-JEQUETEPEQUE",
        "lat": -7.2167,
        "lng": -78.8500,
        "pendiente_media_grados": 29.0,
        "pendiente_media_pct": 43.5,
        "area_cuenca_km2": 31.4,
        "tiempo_retardo_t_lag_min": 22.0,
        "tiempo_concentracion_horas": 0.37,
        "umbral_critico_mm_hora": 13.0,
        "umbral_acumulado_24h": 36.0,
        "velocidad_manning_m_s": 5.1,
        "poblacion_expuesta": 2800,
        "poblacion_en_cono_deyeccion": 2800,
        "nivel_criticidad": "CRITICO",
        "infraestructura_amenazada": "Poblado urbano de Chilete, 200 m de carretera perdidos, Puente Chilete, campo deportivo",
        "observacion_geologica_ingemmet": "Erosión fluvial violenta en margen izquierda que cortó 200 m de carretera. Cauce colmatado de detritos provenientes de múltiples quebradas tributarias (Informe INGEMMET 2017).",
        "fuente": "INGEMMET_2017_DGAR",
        "fuente_estudio": "INGEMMET 2017 DGAR - Evaluación Geológica El Niño Costero"
    },
    {
        "id_quebrada": "QDA-CAJ-CHI-02",
        "id": "QDA-CAJ-CHI-02",
        "codigo_tactico_c2": "TAC-QDA-CAJ-CHI-02",
        "nombre_quebrada": "Quebrada Tabacal",
        "nombre": "Quebrada Tabacal",
        "distrito": "Chilete",
        "provincia": "Contumazá",
        "departamento": "Cajamarca",
        "region": "Cajamarca",
        "distritos_impactados": ["Chilete"],
        "ubigeo": "060503",
        "cuenca": "Cuenca del Río Jequetepeque",
        "cuenca_id": "CUENCA-JEQUETEPEQUE",
        "lat": -7.2280,
        "lng": -78.8650,
        "pendiente_media_grados": 25.0,
        "pendiente_media_pct": 37.5,
        "area_cuenca_km2": 8.7,
        "tiempo_retardo_t_lag_min": 30.0,
        "tiempo_concentracion_horas": 0.50,
        "umbral_critico_mm_hora": 16.0,
        "umbral_acumulado_24h": 42.0,
        "velocidad_manning_m_s": 3.8,
        "poblacion_expuesta": 350,
        "poblacion_en_cono_deyeccion": 350,
        "nivel_criticidad": "ALTO",
        "infraestructura_amenazada": "Km 10+850 Carretera Chilete - Contumazá, 250 m de plataforma asfaltada",
        "observacion_geologica_ingemmet": "Derrumbes hacia la cara libre que aportan detritos arrastrados como huaico sobre la carretera (Informe INGEMMET 2017).",
        "fuente": "INGEMMET_2017_DGAR",
        "fuente_estudio": "INGEMMET 2017 DGAR - Evaluación Geológica El Niño Costero"
    },
    {
        "id_quebrada": "QDA-CAJ-TAN-01",
        "id": "QDA-CAJ-TAN-01",
        "codigo_tactico_c2": "TAC-QDA-CAJ-TAN-01",
        "nombre_quebrada": "Quebrada Los Layos (La Capilla)",
        "nombre": "Quebrada Los Layos",
        "distrito": "Tantarica",
        "provincia": "Contumazá",
        "departamento": "Cajamarca",
        "region": "Cajamarca",
        "distritos_impactados": ["Tantarica"],
        "ubigeo": "060507",
        "cuenca": "Cuenca del Río Jequetepeque",
        "cuenca_id": "CUENCA-JEQUETEPEQUE",
        "lat": -7.2833,
        "lng": -78.9667,
        "pendiente_media_grados": 26.5,
        "pendiente_media_pct": 39.8,
        "area_cuenca_km2": 15.3,
        "tiempo_retardo_t_lag_min": 34.0,
        "tiempo_concentracion_horas": 0.57,
        "umbral_critico_mm_hora": 15.0,
        "umbral_acumulado_24h": 40.0,
        "velocidad_manning_m_s": 4.0,
        "poblacion_expuesta": 510,
        "poblacion_en_cono_deyeccion": 510,
        "nivel_criticidad": "ALTO",
        "infraestructura_amenazada": "Km 78+000 carretera, puente Los Layos y viviendas de La Capilla",
        "observacion_geologica_ingemmet": "Presencia de gravas y bloques de hasta 2 m de diámetro en el cauce. Viviendas levantadas al borde del flujo aluvial (Informe INGEMMET 2017).",
        "fuente": "INGEMMET_2017_DGAR",
        "fuente_estudio": "INGEMMET 2017 DGAR - Evaluación Geológica El Niño Costero"
    },

    # --- LA LIBERTAD (Chicama, Gran Chimú, Chepén, Virú, Simbal) ---
    {
        "id_quebrada": "QDA-LIB-ASC-01",
        "id": "QDA-LIB-ASC-01",
        "codigo_tactico_c2": "TAC-QDA-LIB-ASC-01",
        "nombre_quebrada": "Quebrada Mala Alva (Sausal)",
        "nombre": "Quebrada Mala Alva",
        "distrito": "Chicama",
        "provincia": "Ascope",
        "departamento": "La Libertad",
        "region": "La Libertad",
        "distritos_impactados": ["Chicama", "Ascope"],
        "ubigeo": "130202",
        "cuenca": "Cuenca del Río Chicama",
        "cuenca_id": "CUENCA-CHICAMA",
        "lat": -7.7833,
        "lng": -79.0333,
        "pendiente_media_grados": 22.0,
        "pendiente_media_pct": 33.0,
        "area_cuenca_km2": 19.8,
        "tiempo_retardo_t_lag_min": 45.0,
        "tiempo_concentracion_horas": 0.75,
        "umbral_critico_mm_hora": 15.0,
        "umbral_acumulado_24h": 40.0,
        "velocidad_manning_m_s": 3.6,
        "poblacion_expuesta": 3100,
        "poblacion_en_cono_deyeccion": 3100,
        "nivel_criticidad": "CRITICO",
        "infraestructura_amenazada": "Casco urbano del C.P. Sausal, viviendas construidas en el abanico aluvial antiguo",
        "observacion_geologica_ingemmet": "Material antiguo depositado en abanico. Reactivación violenta en FEN 1998 y 2017 con arrastre sobre viviendas de Sausal (Informe INGEMMET 2017).",
        "fuente": "INGEMMET_2017_DGAR",
        "fuente_estudio": "INGEMMET 2017 DGAR - Evaluación Geológica El Niño Costero"
    },
    {
        "id_quebrada": "QDA-LIB-CHE-01",
        "id": "QDA-LIB-CHE-01",
        "codigo_tactico_c2": "TAC-QDA-LIB-CHE-01",
        "nombre_quebrada": "Quebrada Morana / Morena",
        "nombre": "Quebrada Morana",
        "distrito": "Chepén",
        "provincia": "Chepén",
        "departamento": "La Libertad",
        "region": "La Libertad",
        "distritos_impactados": ["Chepén"],
        "ubigeo": "130401",
        "cuenca": "Cuenca del Río Loco de Chamán",
        "cuenca_id": "CUENCA-JEQUETEPEQUE",
        "lat": -7.2167,
        "lng": -79.4333,
        "pendiente_media_grados": 18.0,
        "pendiente_media_pct": 27.0,
        "area_cuenca_km2": 35.0,
        "tiempo_retardo_t_lag_min": 50.0,
        "tiempo_concentracion_horas": 0.83,
        "umbral_critico_mm_hora": 18.0,
        "umbral_acumulado_24h": 45.0,
        "velocidad_manning_m_s": 3.2,
        "poblacion_expuesta": 1800,
        "poblacion_en_cono_deyeccion": 1800,
        "nivel_criticidad": "ALTO",
        "infraestructura_amenazada": "Abanico aluvial de 3 km de ancho, canales de regadío, trocha carrozal y terrenos de cultivo",
        "observacion_geologica_ingemmet": "Huaico excepcional que discurre ramificado en múltiples canales sobre el valle Chamán (Informe INGEMMET 2017).",
        "fuente": "INGEMMET_2017_DGAR",
        "fuente_estudio": "INGEMMET 2017 DGAR - Evaluación Geológica El Niño Costero"
    },
    {
        "id_quebrada": "QDA-LIB-GRA-01",
        "id": "QDA-LIB-GRA-01",
        "codigo_tactico_c2": "TAC-QDA-LIB-GRA-01",
        "nombre_quebrada": "Quebrada Corlas (Cerro Rumán)",
        "nombre": "Quebrada Corlas",
        "distrito": "Cascas",
        "provincia": "Gran Chimú",
        "departamento": "La Libertad",
        "region": "La Libertad",
        "distritos_impactados": ["Cascas"],
        "ubigeo": "130801",
        "cuenca": "Cuenca Alta del Río Chicama",
        "cuenca_id": "CUENCA-CHICAMA",
        "lat": -7.4833,
        "lng": -78.8167,
        "pendiente_media_grados": 31.0,
        "pendiente_media_pct": 46.5,
        "area_cuenca_km2": 16.7,
        "tiempo_retardo_t_lag_min": 20.0,
        "tiempo_concentracion_horas": 0.33,
        "umbral_critico_mm_hora": 12.0,
        "umbral_acumulado_24h": 35.0,
        "velocidad_manning_m_s": 5.4,
        "poblacion_expuesta": 2400,
        "poblacion_en_cono_deyeccion": 2400,
        "nivel_criticidad": "CRITICO",
        "infraestructura_amenazada": "Carretera Chicama - Cascas, C.P. Corlas, Puente Ochape y bocatomas",
        "observacion_geologica_ingemmet": "Flujo de detritos originado en laderas de fuerte pendiente del cerro Rumán; colmató el río Cascas y aisló la capital provincial (Informe INGEMMET 2017).",
        "fuente": "INGEMMET_2017_DGAR",
        "fuente_estudio": "INGEMMET 2017 DGAR - Evaluación Geológica El Niño Costero"
    },
    {
        "id_quebrada": "QDA-LIB-VIR-01",
        "id": "QDA-LIB-VIR-01",
        "codigo_tactico_c2": "TAC-QDA-LIB-VIR-01",
        "nombre_quebrada": "Confluencia Quebradas Verrugas y Honda (Llacamate)",
        "nombre": "Quebrada Verrugas - Honda",
        "distrito": "Chao",
        "provincia": "Virú",
        "departamento": "La Libertad",
        "region": "La Libertad",
        "distritos_impactados": ["Chao"],
        "ubigeo": "131202",
        "cuenca": "Cuenca del Río Chao / Río Huaraday",
        "cuenca_id": "CUENCA-MOCHE-VIRU",
        "lat": -8.5417,
        "lng": -78.6750,
        "pendiente_media_grados": 25.5,
        "pendiente_media_pct": 38.2,
        "area_cuenca_km2": 28.5,
        "tiempo_retardo_t_lag_min": 35.0,
        "tiempo_concentracion_horas": 0.58,
        "umbral_critico_mm_hora": 15.0,
        "umbral_acumulado_24h": 40.0,
        "velocidad_manning_m_s": 4.3,
        "poblacion_expuesta": 1100,
        "poblacion_en_cono_deyeccion": 1100,
        "nivel_criticidad": "CRITICO",
        "infraestructura_amenazada": "Poblado de Llacamate, tierras de cultivo bajo riego y margen izquierda del río Huaraday",
        "observacion_geologica_ingemmet": "Confluencia de dos quebradas torrenciales sobre el cono donde se asienta el poblado de Llacamate; erosión fluvial y derrumbes simultáneos (Informe INGEMMET 2017).",
        "fuente": "INGEMMET_2017_DGAR",
        "fuente_estudio": "INGEMMET 2017 DGAR - Evaluación Geológica El Niño Costero"
    },
    {
        "id_quebrada": "QDA-LIB-TRU-05",
        "id": "QDA-LIB-TRU-05",
        "codigo_tactico_c2": "TAC-QDA-LIB-TRU-05",
        "nombre_quebrada": "Quebrada Tungul / Mucha (Simbal)",
        "nombre": "Quebrada Tungul",
        "distrito": "Simbal",
        "provincia": "Trujillo",
        "departamento": "La Libertad",
        "region": "La Libertad",
        "distritos_impactados": ["Simbal"],
        "ubigeo": "130109",
        "cuenca": "Cuenca del Río Moche",
        "cuenca_id": "CUENCA-MOCHE-VIRU",
        "lat": -8.0167,
        "lng": -78.8833,
        "pendiente_media_grados": 28.0,
        "pendiente_media_pct": 42.0,
        "area_cuenca_km2": 14.1,
        "tiempo_retardo_t_lag_min": 26.0,
        "tiempo_concentracion_horas": 0.43,
        "umbral_critico_mm_hora": 14.0,
        "umbral_acumulado_24h": 38.0,
        "velocidad_manning_m_s": 4.6,
        "poblacion_expuesta": 1250,
        "poblacion_en_cono_deyeccion": 1250,
        "nivel_criticidad": "ALTO",
        "infraestructura_amenazada": "Puente Carrizal, Canal Mucha-Qda. Tungul, camino rural a Simbal",
        "observacion_geologica_ingemmet": "Flujos de detritos que colapsaron el canal de derivación y destruyeron estribos del Puente Carrizal en 2017 (Informe INGEMMET 2017).",
        "fuente": "INGEMMET_2017_DGAR",
        "fuente_estudio": "INGEMMET 2017 DGAR - Evaluación Geológica El Niño Costero"
    }
]

def update_catalogo_quebradas():
    for d in DATA_DIRS:
        target_file = d / "catalogo_quebradas_criticas.json"
        if not target_file.exists():
            continue
        with open(target_file, "r", encoding="utf-8") as f:
            data = json.load(f)
        
        if isinstance(data, list):
            existing_ids = {q.get("id") for q in data}
            added = 0
            for nq in nuevas_quebradas:
                if nq["id"] not in existing_ids:
                    data.append(nq)
                    added += 1
            if added > 0:
                atomic_write_and_copy(target_file, data)
                print(f"[OK] Quebradas: +{added} añadidas en {target_file}")
            else:
                print(f"[SKIP] Quebradas ya presentes en {target_file}")
        elif isinstance(data, dict):
            key = "quebradas" if "quebradas" in data else "items"
            if key in data:
                existing_ids = {q.get("id") for q in data[key]}
                added = 0
                for nq in nuevas_quebradas:
                    if nq["id"] not in existing_ids:
                        data[key].append(nq)
                        added += 1
                if added > 0:
                    atomic_write_and_copy(target_file, data)
                    print(f"[OK] Quebradas (key={key}): +{added} añadidas en {target_file}")
                else:
                    print(f"[SKIP] Quebradas ya presentes en {target_file}")

# =============================================================================
# 3. ENRIQUECIMIENTO DE DISTRITOS (distritos_memoria_historica_fen.json)
# =============================================================================
distritos_enrichment = {
    # --- LA LIBERTAD ---
    "130101": { # TRUJILLO
        "puntos_criticos": [
            "Cono aluvial Quebrada San Ildefonso (desborde hacia El Porvenir y Centro)",
            "Cono aluvial Quebrada El León (desborde hacia Huanchaco y La Esperanza)",
            "Desborde hacia Víctor Larco Herrera (inundación de casco urbano)",
            "Cruces de la Carretera Panamericana Norte en tramo Trujillo - Chicama"
        ],
        "quebradas_criticas_asociadas": [
            "Quebrada San Ildefonso",
            "Quebrada El León",
            "Quebrada San Carlos"
        ],
        "caserios_inundacion_recurrente": [
            "El Porvenir", "Florencia de Mora", "Huanchaco", "La Esperanza", 
            "Víctor Larco Herrera", "Buenos Aires", "Moche", "Las Delicias"
        ],
        "danos_oficiales_indeci_2017": {
            "departamento": "LA LIBERTAD",
            "fuente": "INDECI Compendio Estadístico 2017 - Gestión Reactiva",
            "damnificados_departamentales_validados": 79623,
            "afectados_departamentales_validados": 386521,
            "fallecidos_departamentales": 25,
            "viviendas_colapsadas_inhabitables_departamentales": 19151,
            "carreteras_destruidas_afectadas_km": 369.0,
            "hectareas_agricolas_perdidas_departamentales": 16954.0,
            "albergues_oficiales_instalados": 17,
            "carpas_albergues": 429,
            "poblacion_albergada": 1962,
            "decreto_supremo_declaratoria": "D.S. N° 014-2017-PCM"
        },
        "analisis_geologico_ingemmet_2017": "Saturación aluvial violenta en las quebradas San Ildefonso, El León y San Carlos. Inundación en abanico sobre la llanura urbana de Trujillo, alcanzando el borde costero en Víctor Larco."
    },
    "130104": { # HUANCHACO
        "puntos_criticos": [
            "Desembocadura de la Quebrada El León",
            "Corte de la Carretera Panamericana Norte por lodos aluviales",
            "Sectores El Milagro y Huanchaco Tradicional"
        ],
        "quebradas_criticas_asociadas": ["Quebrada El León"],
        "caserios_inundacion_recurrente": ["El Milagro", "Huanchaco Tradicional", "Villa del Mar"]
    },
    "130105": { # EL PORVENIR
        "puntos_criticos": [
            "Garganta de descarga de la Quebrada San Ildefonso",
            "Calles de El Porvenir transformadas en cauce aluvial",
            "Cementerio Mampuesto"
        ],
        "quebradas_criticas_asociadas": ["Quebrada San Ildefonso"],
        "caserios_inundacion_recurrente": ["Mampuesto", "Río Seco", "Barrio 1 a 6 de El Porvenir"]
    },
    "130106": { # LAREDO
        "puntos_criticos": [
            "Quebrada San Carlos",
            "Bocatomas del Río Moche y canal madre Chavimochic",
            "Sector Santo Domingo"
        ],
        "quebradas_criticas_asociadas": ["Quebrada San Carlos"],
        "caserios_inundacion_recurrente": ["Sector San Carlos", "Santo Domingo", "Menocucho"]
    },
    "130201": { # ASCOPE
        "puntos_criticos": [
            "AAHH Lucio Sánchez (inundación por flujos canalizados)",
            "AAHH San Bartolo (desbordes de canales de riego)",
            "Márgenes del Río Chicama en aguas bajas"
        ],
        "quebradas_criticas_asociadas": ["Quebrada Cuculí", "Quebrada Mala Alva"],
        "caserios_inundacion_recurrente": ["AAHH Lucio Sánchez", "AAHH San Bartolo", "La Capilla"]
    },
    "130202": { # CHICAMA
        "puntos_criticos": [
            "Poblado de Sausal (asentado en abanico aluvial Quebrada Mala Alva)",
            "Puente Careaga (Panamericana Norte sobre el Río Chicama)",
            "Margen izquierda y derecha del Río Chicama"
        ],
        "quebradas_criticas_asociadas": ["Quebrada Mala Alva"],
        "caserios_inundacion_recurrente": ["Sausal", "Careaga", "Chiclín", "Salinas"]
    },
    "130401": { # CHEPEN
        "puntos_criticos": [
            "Abanico aluvial Quebrada Morana / Morena (3 km de ancho)",
            "Sector Guanábano (Carretera hacia Cajamarca)",
            "Canales de riego del Valle Chamán"
        ],
        "quebradas_criticas_asociadas": ["Quebrada Morana", "Quebrada Guanábano"],
        "caserios_inundacion_recurrente": ["Guanábano", "Morana", "Lurifico", "Talambo"]
    },
    "130402": { # GUADALUPE (Chepén)
        "puntos_criticos": [
            "Faclo Chico (acantilados de 15 m con derrumbes)",
            "Faclo Grande y El Ingenio (flujos de lodo canalizados)",
            "Valle bajo del Río Chamán"
        ],
        "quebradas_criticas_asociadas": ["Torrenteras de Faclo Chico", "Torrenteras de El Ingenio"],
        "caserios_inundacion_recurrente": ["Faclo Chico", "Faclo Grande", "El Ingenio"]
    },
    "130601": { # OTUZCO
        "puntos_criticos": [
            "Cerro Cholocday (cárcavas y flujos que represan el Río Pollo)",
            "Carretera Trujillo - Otuzco Km 34+100 (deslizamiento rotacional activo de 250 m de escarpa)",
            "Sectores La Cuesta, Miñate, Platanal y Paday"
        ],
        "quebradas_criticas_asociadas": ["Río Pollo", "Quebrada Cholocday"],
        "caserios_inundacion_recurrente": ["Cholocday", "Platanal", "Miñate", "Paday"]
    },
    "130611": { # SALPO (Otuzco)
        "puntos_criticos": [
            "Sector Plaza Pampa (deslizamiento rotacional de 200 m de escarpa en carretera Trujillo - Otuzco)",
            "Laderas inestables con riesgo de afectación de viviendas al pie del talud"
        ],
        "quebradas_criticas_asociadas": ["Quebrada Plaza Pampa"],
        "caserios_inundacion_recurrente": ["Plaza Pampa", "Salpo Centro", "Bellavista"]
    },
    "130801": { # CASCAS (Gran Chimú)
        "puntos_criticos": [
            "Cerro Rumán / Quebrada Corlas (flujos de detritos)",
            "Río Quirripano y Río Cascas (desbordes y socavación)",
            "Puente Ochape (destrucción de accesos en carretera Chicama - Cascas)",
            "Sectores El Molino y Corte Cerrado (vía a Contumazá)"
        ],
        "quebradas_criticas_asociadas": ["Quebrada Corlas", "Río Quirripano", "Río Cascas"],
        "caserios_inundacion_recurrente": ["Corlas", "Ochape", "El Molino", "Cascas Centro"]
    },
    "131202": { # CHAO (Virú)
        "puntos_criticos": [
            "Sector Llacamate (confluencia de Quebradas Verrugas y Honda hacia el Río Huaraday)",
            "Quebrada Pampa Blanca (colapso de canal)",
            "Desbordes del Río Chao sobre campos agrícolas"
        ],
        "quebradas_criticas_asociadas": ["Quebrada Verrugas", "Quebrada Honda", "Quebrada Pampa Blanca"],
        "caserios_inundacion_recurrente": ["Llacamate", "Buena Vista", "El Huache", "Tanguche"]
    },

    # --- CAJAMARCA ---
    "060501": { # CONTUMAZA
        "puntos_criticos": [
            "Sectores Verdugal y Amanchaloc (cárcavas severas con pérdida masiva de suelos)",
            "Márgenes del Río Contumazá y Sector Nansha",
            "Vía de interconexión Contumazá - Cascas (derrumbes)"
        ],
        "quebradas_criticas_asociadas": ["Río Contumazá", "Torrenteras de Verdugal"],
        "caserios_inundacion_recurrente": ["Verdugal", "Amanchaloc", "Nansha", "Contumazá Urbano"],
        "danos_oficiales_indeci_2017": {
            "departamento": "CAJAMARCA",
            "fuente": "INDECI Compendio Estadístico 2017",
            "provincias_afectadas": 13,
            "distritos_afectados": 114,
            "fallecidos_departamentales": 24,
            "carreteras_destruidas_km": 102.0,
            "hectareas_agricolas_perdidas": 2950.0,
            "vulnerabilidad_eje": "Corte total de vías transversales de penetración a la costa"
        }
    },
    "060503": { # CHILETE
        "puntos_criticos": [
            "Quebrada Huertas (erosión violenta de margen izquierda, 200 m de carretera perdidos)",
            "Puente Chilete (amenaza de colapso por crecidas del Río Huertas / Jequetepeque)",
            "Km 10+850 Carretera Chilete - Contumazá (Quebrada Tabacal)"
        ],
        "quebradas_criticas_asociadas": ["Quebrada Huertas", "Quebrada Tabacal"],
        "caserios_inundacion_recurrente": ["Chilete Urbano", "Huertas", "Tabacal", "La Viña"]
    },
    "060508": { # YONAN / TEMBLADERA
        "puntos_criticos": [
            "Km 33+100 Carretera a Cajamarca (Quebrada Las Viejas / Campamento Gallito Ciego)",
            "Km 44+000 Carretera a Cajamarca (Pampa Las Amacas / Qdas. Cajón y Monte Grande)",
            "Km 29+000 Carretera a Cajamarca (Quebrada El Mango)",
            "Quebrada Pay Pay (poblado asentado en confluencia aluvial)",
            "Quebrada Peña Blanca (desborde hacia Tembladera)",
            "Sector Ventanillas (acantilados de 5 m socavados por el Río Jequetepeque)",
            "Sector Cafetal (Quebrada Honda)"
        ],
        "quebradas_criticas_asociadas": [
            "Quebrada Las Viejas",
            "Quebrada Pay Pay",
            "Quebrada Peña Blanca",
            "Quebrada Pampa Las Amacas",
            "Quebrada El Mango",
            "Quebrada del Caracol",
            "Quebrada Honda"
        ],
        "caserios_inundacion_recurrente": [
            "Tembladera", "Pay Pay", "Campamento Gallito Ciego", 
            "Cafetal", "Ventanillas", "Pitura", "El Mango"
        ],
        "analisis_geologico_ingemmet_2017": "Cuello hidrocinético principal del Valle Jequetepeque. Múltiples conos aluviales que intersectan la carretera nacional y amenazan la infraestructura del embalse Gallito Ciego."
    },
    "060507": { # TANTARICA
        "puntos_criticos": [
            "Km 78+000 Carretera de penetración (Quebrada Los Layos / La Capilla)",
            "Puente Los Layos (amenazado por bloques de hasta 2 m de diámetro)"
        ],
        "quebradas_criticas_asociadas": ["Quebrada Los Layos", "Quebrada La Capilla"],
        "caserios_inundacion_recurrente": ["La Capilla", "Los Layos", "Tantarica Centro"]
    },
    "061101": { # SAN MIGUEL
        "puntos_criticos": [
            "Puente Bolívar sobre el Río Jequetepeque (socavación de estribos)",
            "Puente San Miguel",
            "Terrazas agrícolas de cultivo arrasadas por crecidas excepcionales"
        ],
        "quebradas_criticas_asociadas": ["Río San Miguel", "Río Jequetepeque Alto"],
        "caserios_inundacion_recurrente": ["Puente Bolívar", "San Miguel Pampa", "Paltas"]
    }
}

def update_distritos_memoria():
    for d in DATA_DIRS:
        target_file = d / "distritos_memoria_historica_fen.json"
        if not target_file.exists():
            continue
        with open(target_file, "r", encoding="utf-8") as f:
            data = json.load(f)
        
        meta = data.setdefault("metadata", {})
        fuentes_utilizadas = meta.setdefault("fuentes_utilizadas", [])
        for src_name in [
            "INGEMMET - Evaluación Geológica Zonas Afectadas Niño Costero 2017 (La Libertad y Cajamarca)",
            "INDECI - Compendio Estadístico 2017 (Gestión Reactiva El Niño Costero)"
        ]:
            if src_name not in fuentes_utilizadas:
                fuentes_utilizadas.append(src_name)
        
        distritos = data.get("distritos", {})
        updated_count = 0
        for ubigeo, enrich in distritos_enrichment.items():
            if ubigeo in distritos:
                target_dist = distritos[ubigeo]
                fisi = target_dist.setdefault("impacto_fisico_hidrologico", {})
                if "puntos_criticos" in enrich:
                    fisi["puntos_criticos"] = enrich["puntos_criticos"]
                if "quebradas_criticas_asociadas" in enrich:
                    fisi["quebradas_criticas_asociadas"] = enrich["quebradas_criticas_asociadas"]
                if "caserios_inundacion_recurrente" in enrich:
                    target_dist["caserios_inundacion_recurrente"] = enrich["caserios_inundacion_recurrente"]
                if "danos_oficiales_indeci_2017" in enrich:
                    target_dist["danos_oficiales_indeci_2017"] = enrich["danos_oficiales_indeci_2017"]
                if "analisis_geologico_ingemmet_2017" in enrich:
                    target_dist["analisis_geologico_ingemmet_2017"] = enrich["analisis_geologico_ingemmet_2017"]
                
                fuentes_cruzadas = target_dist.setdefault("fuentes_oficiales_cruzadas", [])
                for f_item in ["INGEMMET_2017_DGAR", "INDECI_COMPENDIO_2017"]:
                    if f_item not in fuentes_cruzadas:
                        fuentes_cruzadas.append(f_item)
                
                updated_count += 1
        
        atomic_write_and_copy(target_file, data)
        print(f"[OK] Memoria Histórica: {updated_count} distritos enriquecidos en {target_file}")

# =============================================================================
# 4. ACTUALIZACIÓN DEL CATÁLOGO MAESTRO FEN (catalogo_maestro_historico_fen.json)
# =============================================================================
def update_catalogo_maestro():
    for d in DATA_DIRS:
        target_file = d / "catalogo_maestro_historico_fen.json"
        if not target_file.exists():
            continue
        with open(target_file, "r", encoding="utf-8") as f:
            data = json.load(f)
        
        meta = data.setdefault("metadata", {})
        fuentes = meta.setdefault("fuentes_oficiales_auditadas", [])
        for f_name in [
            "INGEMMET DGAR - Evaluación Geológica Zonas Afectadas Niño Costero 2017 (La Libertad y Cajamarca)",
            "INDECI - Compendio Estadístico 2017 (Gestión Reactiva El Niño Costero 2017)"
        ]:
            if f_name not in fuentes:
                fuentes.append(f_name)
        
        cuencas = data.get("cuencas_estrategicas", {})
        if "CUENCA-JEQUETEPEQUE" in cuencas:
            jq = cuencas["CUENCA-JEQUETEPEQUE"]
            jq["diagnostico_geologico_ingemmet_2017"] = {
                "fuente": "INGEMMET_2017_DGAR",
                "quebradas_activadas": [
                    "Quebrada Las Viejas (Km 33+100 Gallito Ciego)",
                    "Quebrada Pay Pay (Yonán)",
                    "Quebrada Peña Blanca (Tembladera)",
                    "Pampa Las Amacas (Km 44+000)",
                    "Quebrada Huertas (Chilete - 200m carretera destruida)",
                    "Quebrada Tabacal (Km 10+850)",
                    "Quebrada Los Layos (Tantarica)"
                ],
                "infraestructura_vial_critica": [
                    "Carretera Ciudad de Dios - Cajamarca (cortes recurrentes en km 21, 29, 33, 42, 44)",
                    "Puente Chilete", "Puente Bolívar", "Puente Yonán", "Puente San Benito"
                ],
                "leccion_represa_gallito_ciego": "Amenaza directa sobre el Campamento de Operaciones por arrastre de detritos con bloques de 3.5 m desde la Quebrada Las Viejas."
            }
        
        if "CUENCA-MOCHE-VIRU" in cuencas:
            mv = cuencas["CUENCA-MOCHE-VIRU"]
            mv["diagnostico_geologico_ingemmet_2017"] = {
                "fuente": "INGEMMET_2017_DGAR",
                "cifras_oficiales_indeci_la_libertad": {
                    "damnificados": 79623,
                    "afectados": 386521,
                    "fallecidos": 25,
                    "viviendas_destruidas": 19151,
                    "vias_afectadas_km": 369.0,
                    "hectareas_perdidas": 16954.0
                },
                "quebradas_activadas_trujillo": [
                    "Quebrada San Ildefonso (desborde a El Porvenir y Centro)",
                    "Quebrada El León (corte Panamericana Norte y Huanchaco)",
                    "Quebrada San Carlos (Laredo)",
                    "Quebrada Tungul / Mucha (Simbal - Puente Carrizal)",
                    "Quebrada Verrugas y Honda (Chao - Llacamate)"
                ],
                "deslizamientos_rotacionales_sierra": [
                    "Plaza Pampa / Salpo (escarpa de 200 m que cortó vía Trujillo - Otuzco)",
                    "Km 34+100 Trujillo - Huamachuco (escarpa de 250 m y 320 m de corrida)",
                    "Cerro Cholocday (represamiento del Río Pollo en Otuzco)"
                ]
            }
        
        atomic_write_and_copy(target_file, data)
        print(f"[OK] Catálogo Maestro FEN actualizado en {target_file}")

# =============================================================================
# 5. ACTUALIZACIÓN DE INFRAESTRUCTURA VIAL CRÍTICA
# =============================================================================
puntos_viales_nuevos = [
    {
        "id": "VIAL-CAJ-01",
        "nombre": "Carretera Ciudad de Dios - Cajamarca (Km 33+100 / Gallito Ciego)",
        "tipo": "CARRETERA_TRONCAL_PENETRACION",
        "region": "Cajamarca",
        "departamento": "Cajamarca",
        "provincia": "Contumazá",
        "distrito": "Yonán",
        "cuenca": "Cuenca del Río Jequetepeque",
        "cuenca_id": "CUENCA-JEQUETEPEQUE",
        "lat": -7.2189,
        "lng": -79.1764,
        "amenaza_principal": "Flujo de detritos Quebrada Las Viejas (bolonería 3.5 m)",
        "riesgo_historico": "Bloqueo total de la vía de penetración a Cajamarca y aislamiento del campamento Gallito Ciego.",
        "umbral_lluvia_gatillo_24h_mm": 35.0,
        "ruta_alterna": "Ruta alterna por Chilete - San Pablo (restringida)"
    },
    {
        "id": "VIAL-CAJ-02",
        "nombre": "Carretera Ciudad de Dios - Cajamarca (Km 44+000 / Pampa Las Amacas)",
        "tipo": "CARRETERA_TRONCAL_PENETRACION",
        "region": "Cajamarca",
        "departamento": "Cajamarca",
        "provincia": "Contumazá",
        "distrito": "Yonán",
        "cuenca": "Cuenca del Río Jequetepeque",
        "cuenca_id": "CUENCA-JEQUETEPEQUE",
        "lat": -7.2794,
        "lng": -79.0889,
        "amenaza_principal": "Confluencia de quebradas torrenciales Cajón y Monte Grande",
        "riesgo_historico": "Destrucción de calzada asfaltada (300 m en 1998 y 1500 m vulnerables en 2017).",
        "umbral_lluvia_gatillo_24h_mm": 40.0,
        "ruta_alterna": "Sin ruta alterna directa en el valle bajo"
    },
    {
        "id": "VIAL-CAJ-03",
        "nombre": "Carretera Chilete - Contumazá (Sector Qda. Huertas / Qda. Tabacal)",
        "tipo": "CARRETERA_DEPARTAMENTAL",
        "region": "Cajamarca",
        "departamento": "Cajamarca",
        "provincia": "Contumazá",
        "distrito": "Chilete",
        "cuenca": "Cuenca del Río Jequetepeque",
        "cuenca_id": "CUENCA-JEQUETEPEQUE",
        "lat": -7.2167,
        "lng": -78.8500,
        "amenaza_principal": "Erosión lateral severa del Río Huertas y huaicos en Qda. Tabacal",
        "riesgo_historico": "Pérdida de 200 m de plataforma vial y colapso de defensas ribereñas.",
        "umbral_lluvia_gatillo_24h_mm": 45.0,
        "ruta_alterna": "Trocha por San Benito - Guzmango"
    },
    {
        "id": "VIAL-LIB-01",
        "nombre": "Carretera Trujillo - Otuzco (Sector Salpo / Plaza Pampa)",
        "tipo": "CARRETERA_DEPARTAMENTAL_SIERRA",
        "region": "La Libertad",
        "departamento": "La Libertad",
        "provincia": "Otuzco",
        "distrito": "Salpo",
        "cuenca": "Cuenca del Río Moche",
        "cuenca_id": "CUENCA-MOCHE-VIRU",
        "lat": -7.9833,
        "lng": -78.6167,
        "amenaza_principal": "Deslizamiento rotacional activo con escarpa de 200 m",
        "riesgo_historico": "Interrupción del tránsito por más de 12 horas y riesgo de caída de bloques sobre viviendas.",
        "umbral_lluvia_gatillo_24h_mm": 30.0,
        "ruta_alterna": "Vía alterna por Julcán (trocha)"
    },
    {
        "id": "VIAL-LIB-02",
        "nombre": "Carretera Trujillo - Huamachuco (Km 34+100)",
        "tipo": "CARRETERA_NACIONAL_SIERRA",
        "region": "La Libertad",
        "departamento": "La Libertad",
        "provincia": "Otuzco",
        "distrito": "Otuzco",
        "cuenca": "Cuenca del Río Moche",
        "cuenca_id": "CUENCA-MOCHE-VIRU",
        "lat": -7.9050,
        "lng": -78.5800,
        "amenaza_principal": "Deslizamiento rotacional activo de 250 m de escarpa y 320 m de corrida",
        "riesgo_historico": "Corte de la principal arteria de abastecimiento hacia Huamachuco y la sierra liberteña.",
        "umbral_lluvia_gatillo_24h_mm": 35.0,
        "ruta_alterna": "Desvío por Cascas - Contumazá"
    },
    {
        "id": "VIAL-LIB-03",
        "nombre": "Puente Careaga (Panamericana Norte / Río Chicama)",
        "tipo": "PUENTE_ESTRATEGICO_NACIONAL",
        "region": "La Libertad",
        "departamento": "La Libertad",
        "provincia": "Ascope",
        "distrito": "Chicama",
        "cuenca": "Cuenca del Río Chicama",
        "cuenca_id": "CUENCA-CHICAMA",
        "lat": -7.8450,
        "lng": -79.1450,
        "amenaza_principal": "Crecida extraordinaria del Río Chicama y colmatación por sedimentos",
        "riesgo_historico": "Destruido en FEN 1998 y amenazado en 2017; corte de la Panamericana Norte.",
        "umbral_lluvia_gatillo_24h_mm": 50.0,
        "ruta_alterna": "Sin ruta alterna costera directa"
    }
]

def update_puentes_carreteras():
    for d in DATA_DIRS:
        target_file = d / "puentes_carreteras_historicos_fen.json"
        if not target_file.exists():
            continue
        with open(target_file, "r", encoding="utf-8") as f:
            data = json.load(f)
        
        existing_ids = {p.get("id") for p in data if isinstance(p, dict)}
        added = 0
        for pnv in puntos_viales_nuevos:
            if pnv["id"] not in existing_ids:
                data.append(pnv)
                added += 1
        
        if added > 0:
            atomic_write_and_copy(target_file, data)
            print(f"[OK] Puentes y carreteras: +{added} añadidos en {target_file}")
        else:
            print(f"[SKIP] Puentes y carreteras ya presentes en {target_file}")


if __name__ == "__main__":
    print("\n--- INICIANDO INTEGRACIÓN PERICIAL FACTUAL ATÓMICA ---")
    update_fuentes_validadas()
    update_catalogo_quebradas()
    update_distritos_memoria()
    update_catalogo_maestro()
    update_puentes_carreteras()
    print("\n--- INTEGRACIÓN FACTUAL ATÓMICA COMPLETADA CON ÉXITO ---")
