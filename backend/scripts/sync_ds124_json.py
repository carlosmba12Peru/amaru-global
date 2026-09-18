import os
import json
import shutil

ROOT_DIR = r"c:\Users\Usuario Libre\Documents\recuperacion de USB 14 de setiembre\curso-gcp-google-adk-01\Lab4"
GEO_PATH = os.path.join(ROOT_DIR, "data", "geodatos_893_distritos_ubigeo.json")
DS_PATH = os.path.join(ROOT_DIR, "data", "distritos_emergencia_ds_124_2026_pcm.json")
BACKEND_DS_PATH = os.path.join(ROOT_DIR, "backend", "data", "distritos_emergencia_ds_124_2026_pcm.json")

with open(GEO_PATH, "r", encoding="utf-8") as f:
    geo_data = json.load(f)

# Create lookup from geodatos
geo_list = geo_data.get("ubigeos", [])

# Build enriched distritos_declarados with authentic UBIGEO
declarados = []
for idx, g in enumerate(geo_list, start=1):
    declarados.append({
        "id": idx,
        "ubigeo": g["ubigeo"],
        "departamento": g["departamento"].upper(),
        "provincia": g["provincia"].upper(),
        "distrito": g["distrito"].upper(),
        "latitud": g.get("latitud"),
        "longitud": g.get("longitud"),
        "poblacion_estimada": g.get("poblacion_estimada")
    })

ds_content = {
    "metadata": {
        "norma_oficial": "Decreto Supremo Nº 124-2026-PCM",
        "publicacion_el_peruano": "2026-09-01",
        "url_oficial": "https://busquedas.elperuano.pe/dispositivo/NL/2549507-1",
        "asunto": "Declaratoria de Estado de Emergencia por peligro inminente ante intensas precipitaciones pluviales asociadas al Fenómeno El Niño 2026-2027",
        "vigencia_dias": 60,
        "total_departamentos": len(set(d["departamento"] for d in declarados)),
        "total_provincias": len(set(f"{d['departamento']}_{d['provincia']}" for d in declarados)),
        "total_distritos": len(declarados),
        "fuente_ubigeo": "INEI Oficial - Ubigeo INEI 17 SET 2026"
    },
    "distritos_declarados": declarados
}

# Backup and write
if os.path.exists(DS_PATH):
    shutil.copyfile(DS_PATH, DS_PATH + ".bak")
with open(DS_PATH, "w", encoding="utf-8") as f:
    json.dump(ds_content, f, ensure_ascii=False, indent=2)
print("Updated:", DS_PATH)

if os.path.exists(BACKEND_DS_PATH):
    shutil.copyfile(BACKEND_DS_PATH, BACKEND_DS_PATH + ".bak")
with open(BACKEND_DS_PATH, "w", encoding="utf-8") as f:
    json.dump(ds_content, f, ensure_ascii=False, indent=2)
print("Updated:", BACKEND_DS_PATH)
