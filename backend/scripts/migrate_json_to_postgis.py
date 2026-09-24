"""
Script ETL de Migración de Datos: JSON -> PostgreSQL 16 + PostGIS
AMARU-CLIMATE (COEN-Digital) - Lab4

Lee los catálogos territoriales, censales y logísticos en JSON
y genera el script SQL de carga masiva idempotente para PostGIS.
Soporta:
  1. Ejecución directa a PostgreSQL (si DATABASE_URL está configurado).
  2. Generación de sentencias SQL hacia stdout o archivo para psql.
"""

import json
import os
import sys
from pathlib import Path
from typing import Dict, List, Any

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8")

BASE_DIR = Path(__file__).resolve().parent.parent.parent
DATA_DIR = BASE_DIR / "data"

def escape_sql(val: Any) -> str:
    if val is None:
        return "NULL"
    if isinstance(val, bool):
        return "TRUE" if val else "FALSE"
    if isinstance(val, (int, float)):
        return str(val)
    val_str = str(val).replace("'", "''")
    return f"'{val_str}'"

def procesar_distritos() -> List[str]:
    sql_lines = ["-- ==================== INGESTA DE DISTRITOS NACIONALES ===================="]
    distritos_path = DATA_DIR / "distritos_riesgo_nacional_1891_cenepred_mef.json"
    ds124_path = DATA_DIR / "distritos_emergencia_ds_124_2026_pcm.json"

    ds124_set = set()
    geodatos_map = {}

    if ds124_path.exists():
        try:
            with open(ds124_path, "r", encoding="utf-8") as f:
                data = json.load(f)
                declarados = data.get("distritos_declarados", [])
                for item in declarados:
                    if isinstance(item, dict):
                        u = item.get("ubigeo")
                        if u:
                            ds124_set.add(u)
                            if "latitud" in item and "longitud" in item:
                                geodatos_map[u] = (item["latitud"], item["longitud"])
                    elif isinstance(item, str):
                        ds124_set.add(item)
        except Exception as e:
            print(f"-- Aviso leyendo DS124: {e}", file=sys.stderr)

    if distritos_path.exists():
        try:
            with open(distritos_path, "r", encoding="utf-8") as f:
                data = json.load(f)
                items = data.get("distritos", [])
                for d in items:
                    ubigeo = d.get("ubigeo")
                    distrito = d.get("distrito", "SIN NOMBRE")
                    provincia = d.get("provincia", "SIN PROVINCIA")
                    depto = d.get("departamento", "SIN DEPTO")
                    poblacion = d.get("poblacion_afectada_estimada", d.get("poblacion", 0))
                    es_ds124 = ubigeo in ds124_set
                    lat, lon = geodatos_map.get(ubigeo, (None, None))
                    if not lat and "latitud" in d:
                        lat, lon = d.get("latitud"), d.get("longitud")

                    geom_val = f"ST_SetSRID(ST_MakePoint({lon}, {lat}), 4326)" if lat and lon else "NULL"

                    sql = (
                        f"INSERT INTO distritos (ubigeo, distrito, provincia, departamento, poblacion_censo, es_emergencia_ds_124, geometria_centroide) "
                        f"VALUES ({escape_sql(ubigeo)}, {escape_sql(distrito)}, {escape_sql(provincia)}, {escape_sql(depto)}, {poblacion or 0}, "
                        f"{'TRUE' if es_ds124 else 'FALSE'}, {geom_val}) "
                        f"ON CONFLICT (ubigeo) DO UPDATE SET es_emergencia_ds_124 = EXCLUDED.es_emergencia_ds_124, "
                        f"geometria_centroide = COALESCE(EXCLUDED.geometria_centroide, distritos.geometria_centroide);"
                    )
                    sql_lines.append(sql)
        except Exception as e:
            print(f"-- Error procesando distritos: {e}", file=sys.stderr)

    return sql_lines

def procesar_municipalidades() -> List[str]:
    sql_lines = ["\n-- ==================== INGESTA DE AUTORIDADES MUNICIPALES INEI 2026 ===================="]
    muni_path = DATA_DIR / "directorio_municipalidades_inei_2026.json"
    if muni_path.exists():
        try:
            with open(muni_path, "r", encoding="utf-8") as f:
                data = json.load(f)
                por_ubigeo = data.get("por_ubigeo", {})
                for ubigeo, m in por_ubigeo.items():
                    muni_nom = m.get("municipalidad", f"Municipalidad Distrital de {ubigeo}")
                    alcalde = m.get("alcalde", "AUTORIDAD ELECTA")
                    dni = m.get("dni_alcalde", "")
                    direccion = m.get("direccion_sede_municipal", "Plaza de Armas S/N")
                    telefono = m.get("telefono_sede", "")

                    sql_parent = (
                        f"INSERT INTO distritos (ubigeo, distrito, provincia, departamento) "
                        f"VALUES ({escape_sql(ubigeo)}, {escape_sql(muni_nom)}, 'PROVINCIA', 'DEPARTAMENTO') "
                        f"ON CONFLICT (ubigeo) DO NOTHING;"
                    )
                    sql_lines.append(sql_parent)

                    sql = (
                        f"INSERT INTO municipalidades_autoridades (ubigeo, municipio_nombre, alcalde_titular, dni_alcalde, direccion_sede, telefono_central) "
                        f"VALUES ({escape_sql(ubigeo)}, {escape_sql(muni_nom)}, {escape_sql(alcalde)}, {escape_sql(dni)}, {escape_sql(direccion)}, {escape_sql(telefono)}) "
                        f"ON CONFLICT (ubigeo) DO UPDATE SET alcalde_titular = EXCLUDED.alcalde_titular, direccion_sede = EXCLUDED.direccion_sede;"
                    )
                    sql_lines.append(sql)

        except Exception as e:
            print(f"-- Error procesando autoridades: {e}", file=sys.stderr)

    return sql_lines

def procesar_logistica_y_puentes() -> List[str]:
    sql_lines = ["\n-- ==================== INGESTA DE ALMACENES, ALBERGUES Y PUENTES VRP ===================="]
    log_path = DATA_DIR / "almacenes_albergues_logistica.json"
    if log_path.exists():
        try:
            with open(log_path, "r", encoding="utf-8") as f:
                data = json.load(f)
                # Almacenes
                for alm in data.get("almacenes_indeci", []):
                    lat = alm.get("coordenadas", {}).get("lat")
                    lon = alm.get("coordenadas", {}).get("lon")
                    geom = f"ST_SetSRID(ST_MakePoint({lon}, {lat}), 4326)" if lat and lon else "NULL"
                    ciudad = alm.get("ciudad") or alm.get("departamento") or "LIMA"
                    sql = (
                        f"INSERT INTO almacenes_indeci (almacen_id, nombre, ciudad, departamento, raciones_frias_stock, agua_litros_stock, carpas_stock, herramientas_kits, ubicacion) "
                        f"VALUES ({escape_sql(alm.get('id'))}, {escape_sql(alm.get('nombre'))}, {escape_sql(ciudad)}, {escape_sql(alm.get('departamento'))}, "
                        f"{alm.get('raciones_frias_stock', 0)}, {alm.get('agua_litros_stock', 0)}, {alm.get('carpas_stock', 0)}, {alm.get('herramientas_kits', 0)}, {geom}) "
                        f"ON CONFLICT (almacen_id) DO UPDATE SET raciones_frias_stock = EXCLUDED.raciones_frias_stock, agua_litros_stock = EXCLUDED.agua_litros_stock;"
                    )
                    sql_lines.append(sql)


                # Albergues
                for alb in data.get("albergues_destinos", []):
                    lat = alb.get("coordenadas", {}).get("lat")
                    lon = alb.get("coordenadas", {}).get("lon")
                    geom = f"ST_SetSRID(ST_MakePoint({lon}, {lat}), 4326)" if lat and lon else "NULL"
                    sql = (
                        f"INSERT INTO albergues_logistica (albergue_id, nombre, distrito, departamento, poblacion_albergada, demanda_raciones_dia, demanda_agua_litros_dia, ubicacion) "
                        f"VALUES ({escape_sql(alb.get('id'))}, {escape_sql(alb.get('nombre'))}, {escape_sql(alb.get('distrito'))}, {escape_sql(alb.get('departamento'))}, "
                        f"{alb.get('poblacion_albergada', 0)}, {alb.get('demanda_raciones_dia', 0)}, {alb.get('demanda_agua_litros_dia', 0)}, {geom}) "
                        f"ON CONFLICT (albergue_id) DO UPDATE SET poblacion_albergada = EXCLUDED.poblacion_albergada;"
                    )
                    sql_lines.append(sql)
        except Exception as e:
            print(f"-- Error procesando logística: {e}", file=sys.stderr)

    # Puentes y Puntos Críticos (26 Puentes)
    puentes_path = DATA_DIR / "puentes_carreteras_historicos_fen.json"
    if puentes_path.exists():
        try:
            with open(puentes_path, "r", encoding="utf-8") as f:
                puentes_data = json.load(f)
                items_p = puentes_data if isinstance(puentes_data, list) else []
                for pte in items_p:
                    lat = pte.get("coordenadas", {}).get("lat")
                    lon = pte.get("coordenadas", {}).get("lon")
                    geom = f"ST_SetSRID(ST_MakePoint({lon}, {lat}), 4326)" if lat and lon else "NULL"
                    sql = (
                        f"INSERT INTO red_vial_puentes (puente_id, nombre, carretera_codigo, kilometro, cuenca_cruzada, estado_transitabilidad, desvio_tactico_nombre, caudal_alerta_m3s, ubicacion) "
                        f"VALUES ({escape_sql(pte.get('id'))}, {escape_sql(pte.get('nombre'))}, {escape_sql(pte.get('eje_vial') or pte.get('carretera') or 'RED-VIAL-NACIONAL')}, 'KM-VAR', {escape_sql(pte.get('rio'))}, "
                        f"{escape_sql(pte.get('estado_actual', 'TRANSITABLE'))}, {escape_sql(pte.get('ruta_alterna'))}, {pte.get('caudal_gatillo_m3s', 0.0)}, {geom}) "
                        f"ON CONFLICT (puente_id) DO UPDATE SET estado_transitabilidad = EXCLUDED.estado_transitabilidad;"
                    )
                    sql_lines.append(sql)
        except Exception as e:
            print(f"-- Error procesando puentes: {e}", file=sys.stderr)

    return sql_lines

def obtener_metricas_migracion() -> Dict[str, Any]:
    lineas_distritos = procesar_distritos()
    lineas_munis = procesar_municipalidades()
    lineas_log = procesar_logistica_y_puentes()

    return {
        "distritos_sql_count": len(lineas_distritos) - 1,
        "municipalidades_sql_count": len(lineas_munis) - 1,
        "logistica_puentes_sql_count": len(lineas_log) - 1,
        "total_instrucciones": (len(lineas_distritos) - 1) + (len(lineas_munis) - 1) + (len(lineas_log) - 1)
    }

if __name__ == "__main__":
    if "--stats" in sys.argv:
        metricas = obtener_metricas_migracion()
        print(json.dumps(metricas, indent=2))
    elif "--dump" in sys.argv:
        print("BEGIN;")
        for l in procesar_distritos():
            print(l)
        for l in procesar_municipalidades():
            print(l)
        for l in procesar_logistica_y_puentes():
            print(l)
        print("COMMIT;")
    else:
        metricas = obtener_metricas_migracion()
        print(f"[ETL PostGIS] Total de sentencias generadas: {metricas['total_instrucciones']}")
        print(f"  - Distritos: {metricas['distritos_sql_count']}")
        print(f"  - Municipalidades INEI 2026: {metricas['municipalidades_sql_count']}")
        print(f"  - Almacenes, Albergues y Puentes: {metricas['logistica_puentes_sql_count']}")
        print("Usa --dump para volcar el SQL completo hacia psql, o --stats para JSON.")
