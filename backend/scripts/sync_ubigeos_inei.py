# backend/scripts/sync_ubigeos_inei.py
"""
Sincronización Maestra de UBIGEOS INEI Oficiales
Basado en: data/Ubigeo INEI 17 SET 2026.xls
Corrige y actualiza los 893 distritos declarados en el D.S. Nº 124-2026-PCM.
"""
import os
import xlrd
import re
import json
import shutil
import unicodedata

def normalize(text):
    if not text:
        return ""
    nfkd = unicodedata.normalize('NFKD', text)
    clean = "".join([c for c in nfkd if not unicodedata.combining(c)])
    return re.sub(r'[^A-Z0-9]', ' ', clean.upper()).strip()

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ROOT_DIR = os.path.dirname(BASE_DIR)

EXCEL_PATH = os.path.join(ROOT_DIR, "data", "Ubigeo INEI 17 SET 2026.xls")

print(f"Cargando padrón oficial INEI desde: {EXCEL_PATH}")
wb = xlrd.open_workbook(EXCEL_PATH)
sheet = wb.sheet_by_index(0)

inei_list = []
inei_by_dist = {}

for r in range(2, sheet.nrows):
    dep = str(sheet.cell_value(r, 1)).strip()
    prov = str(sheet.cell_value(r, 4)).strip()
    dist = str(sheet.cell_value(r, 5)).strip()
    
    m_dep = re.match(r"^(\d{2})\s+(.+)$", dep)
    m_prov = re.match(r"^(\d{2})\s+(.+)$", prov)
    m_dist = re.match(r"^(\d{2})\s+(.+)$", dist)
    
    if m_dep and m_prov and m_dist:
        dep_code, dep_name = m_dep.groups()
        prov_code, prov_name = m_prov.groups()
        dist_code, dist_name = m_dist.groups()
        
        entry = {
            "ubigeo": f"{dep_code}{prov_code}{dist_code}",
            "departamento": dep_name.strip(),
            "provincia": prov_name.strip(),
            "distrito": dist_name.strip(),
            "norm_dep": normalize(dep_name),
            "norm_prov": normalize(prov_name),
            "norm_dist": normalize(dist_name)
        }
        inei_list.append(entry)
        inei_by_dist.setdefault(entry["norm_dist"], []).append(entry)

print(f"Total entidades distritales INEI cargadas: {len(inei_list)}")

# Mapeo manual de nombres truncados por desborde de columnas en la extracción original del D.S. 124
TRUNCATED_FIXES = {
    "SAN FRANCISCO DEL": "SAN FRANCISCO DE YESO",
    "SAN FRANCISCO DEL YESO": "SAN FRANCISCO DE YESO",
    "SAN JUAN DE": "SAN JUAN DE LOPECANCHA",
    "FIDEL OLIVAS": "FIDEL OLIVAS ESCUDERO",
    "SANTA MARIA DE": "SANTA MARIA DE CHICMO",
    "JOSE LUIS": "JOSE LUIS BUSTAMANTE Y RIVERO",
    "SANTA ISABEL DE": "SANTA ISABEL DE SIGUAS",
    "MARIANO NICOLAS": "MARIANO NICOLAS VALCARCEL",
    "SAN ANTONIO DE": "SAN ANTONIO DE CHUCA",
    "SANTIAGO DE": "SANTIAGO DE LUCANAMARCA",
    "SANTA CRUZ DE TOLED": "SANTA CRUZ DE TOLED",
    "SAN MIGUEL DE EL": "SAN MIGUEL DE EL FAIQUE",
    "EL CARMEN DE LA": "EL CARMEN DE LA FRONTERA",
    "SANTA CATALINA DE": "SANTA CATALINA DE MOSSA",
    "BELLAVISTA DE LA": "BELLAVISTA DE LA UNION",
    "SANTO DOMINGO DE": "SANTO DOMINGO DE ACOBAMBA",
    "VEINTISEIS DE": "VEINTISEIS DE OCTUBRE",
    "CHACAPALCA": "CHACAPALPA",
    "CRISTO NOS VALGA": "CRISTO NOS VALGA",
    "RINCONADA LLICUAR": "RINCONADA LLICUAR"
}

# Cargar geodatos existentes
GEO_PATH = os.path.join(ROOT_DIR, "data", "geodatos_893_distritos_ubigeo.json")
with open(GEO_PATH, "r", encoding="utf-8") as f:
    geo_json = json.load(f)

# Guardar backup de seguridad
backup_path = GEO_PATH + ".bak"
shutil.copyfile(GEO_PATH, backup_path)
print(f"Backup de seguridad guardado en: {backup_path}")

geolist = geo_json.get("ubigeos", [])
print(f"Procesando {len(geolist)} distritos de contingencia...")

actualizados = []
mismatches_corregidos = 0

for idx, g in enumerate(geolist):
    raw_dist = g.get("distrito", "").strip()
    dist_g = normalize(raw_dist)
    dep_g = normalize(g.get("departamento", ""))
    prov_g = normalize(g.get("provincia", ""))
    
    # 1. Aplicar corrección por truncamiento
    if dist_g in TRUNCATED_FIXES:
        dist_g = normalize(TRUNCATED_FIXES[dist_g])
    elif "CANETE" in prov_g and "SANTA CRUZ" in dist_g:
        dist_g = normalize("SANTA CRUZ DE FLORES")
    elif "TUPICOCHA" in prov_g:
        dist_g = normalize("SAN ANDRES DE TUPICOCHA")
        
    # 2. Búsqueda por candidatos INEI
    candidates = inei_by_dist.get(dist_g, [])
    match = None
    if len(candidates) == 1:
        match = candidates[0]
    elif len(candidates) > 1:
        # Priorizar departamento
        for c in candidates:
            if c["norm_dep"] == dep_g:
                match = c
                break
        if not match:
            # Priorizar provincia
            for c in candidates:
                if c["norm_prov"] in prov_g or prov_g in c["norm_prov"]:
                    match = c
                    break
        if not match:
            match = candidates[0]
    else:
        # Búsqueda por prefijo
        for c in inei_list:
            if c["norm_dist"].startswith(dist_g) or dist_g.startswith(c["norm_dist"]):
                if c["norm_dep"] == dep_g or c["norm_prov"] in prov_g:
                    match = c
                    break

    if not match:
        print(f"ADVERTENCIA: No se encontró match para {raw_dist} ({dep_g} - {prov_g})")
        actualizados.append(g)
        continue

    old_ubigeo = g.get("ubigeo")
    new_ubigeo = match["ubigeo"]
    
    if old_ubigeo != new_ubigeo or g.get("provincia") != match["provincia"]:
        mismatches_corregidos += 1
        
    # Crear registro enriquecido y saneado
    registro = {
        "ubigeo": new_ubigeo,
        "departamento": match["departamento"],
        "provincia": match["provincia"],
        "distrito": match["distrito"],
        "latitud": g.get("latitud"),
        "longitud": g.get("longitud"),
        "poblacion_estimada": g.get("poblacion_estimada"),
        "declarado_ds_124": True
    }
    actualizados.append(registro)

# Ordenar por ubigeo oficial
actualizados.sort(key=lambda x: x["ubigeo"])

nuevo_geo_json = {
    "metadata": {
        "descripcion": "Geodatos de los 893 distritos declarados en Estado de Emergencia FEN (D.S. Nº 124-2026-PCM)",
        "fuente_ubigeo": "INEI Oficial - Ubigeo INEI 17 SET 2026",
        "total_distritos": len(actualizados),
        "fecha_sincronizacion": "2026-09-17",
        "estado": "SINCRONIZADO_INEI_OFICIAL"
    },
    "ubigeos": actualizados
}

# Escribir en data/geodatos_893_distritos_ubigeo.json
with open(GEO_PATH, "w", encoding="utf-8") as f:
    json.dump(nuevo_geo_json, f, ensure_ascii=False, indent=2)
print(f"Actualizado con éxito: {GEO_PATH}")

# Escribir en backend/data/geodatos_893_distritos_ubigeo.json
BACKEND_GEO_PATH = os.path.join(ROOT_DIR, "backend", "data", "geodatos_893_distritos_ubigeo.json")
with open(BACKEND_GEO_PATH, "w", encoding="utf-8") as f:
    json.dump(nuevo_geo_json, f, ensure_ascii=False, indent=2)
print(f"Actualizado con éxito en backend: {BACKEND_GEO_PATH}")

print(f"\n=======================================================")
print(f"RESUMEN DE SINCRONIZACIÓN:")
print(f" - Distritos procesados: {len(actualizados)} de 893")
print(f" - Mismatches/errores corregidos: {mismatches_corregidos}")

# Verificar Catacaos y Montero específicamente
for d in actualizados:
    if d["ubigeo"] in ["200105", "200205"] or d["distrito"] in ["Catacaos", "Montero"]:
        print(f" -> VERIFICACIÓN: UBIGEO={d['ubigeo']} | {d['distrito']} ({d['provincia']} - {d['departamento']}) | Lat={d['latitud']}, Lng={d['longitud']}")
print(f"=======================================================")
