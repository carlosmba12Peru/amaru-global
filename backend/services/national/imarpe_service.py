# backend/services/national/imarpe_service.py
"""
Servicio Oceanográfico Oficial IMARPE (Instituto del Mar del Perú)
Programa Presupuesto por Resultados - PPR 068 El Niño

Procesa y extrae la telemetría oficial de los Boletines Diarios Oceanográficos (BDO)
depositados en las carpetas mensuales (ej. data/Reporte de Imarpe diario/Set-2026/*.pdf).
Extrae:
- Diagnóstico textual oficial (Pág. 1)
- Metadatos (Fecha, Año, Número de Boletín)
- Sección III: CONDICIONES DE MICROESCALA (Tabla 1) con las 12 estaciones costeras fijas
  (Tumbes, Paita, San José, Chicama, Huanchaco, Chimbote, Huacho, Callao, Pisco, Chala, Matarani, Ilo).
"""

import os
import re
import json
import logging
from typing import Dict, Any, List, Optional
import pypdf

logger = logging.getLogger("imarpe_service")
logger.setLevel(logging.INFO)

# Catálogo maestro de estaciones costeras fijas del IMARPE
ESTACIONES_CATALOGO = [
    {"id": "tumbes", "nombre": "Tumbes", "lat_ref": -3.64, "lng_ref": -80.61, "region": "Tumbes", "puerto": "Puerto Pizarro"},
    {"id": "paita", "nombre": "Paita", "lat_ref": -5.08, "lng_ref": -81.12, "region": "Piura", "puerto": "Paita"},
    {"id": "san_jose", "nombre": "San José", "lat_ref": -6.77, "lng_ref": -79.97, "region": "Lambayeque", "puerto": "San José"},
    {"id": "chicama", "nombre": "Chicama", "lat_ref": -7.69, "lng_ref": -79.44, "region": "La Libertad", "puerto": "Puerto Chicama"},
    {"id": "huanchaco", "nombre": "Huanchaco", "lat_ref": -8.08, "lng_ref": -79.12, "region": "La Libertad", "puerto": "Huanchaco"},
    {"id": "chimbote", "nombre": "Chimbote", "lat_ref": -9.46, "lng_ref": -78.38, "region": "Áncash", "puerto": "Chimbote"},
    {"id": "huacho", "nombre": "Huacho", "lat_ref": -11.12, "lng_ref": -77.62, "region": "Lima", "puerto": "Huacho"},
    {"id": "callao", "nombre": "Callao", "lat_ref": -12.07, "lng_ref": -77.16, "region": "Callao", "puerto": "Callao"},
    {"id": "pisco", "nombre": "Pisco", "lat_ref": -13.71, "lng_ref": -76.22, "region": "Ica", "puerto": "Pisco / Paracas"},
    {"id": "chala", "nombre": "Chala", "lat_ref": -15.85, "lng_ref": -74.23, "region": "Arequipa", "puerto": "Chala"},
    {"id": "matarani", "nombre": "Matarani", "lat_ref": -17.02, "lng_ref": -72.11, "region": "Arequipa", "puerto": "Matarani"},
    {"id": "ilo", "nombre": "Ilo", "lat_ref": -17.64, "lng_ref": -71.35, "region": "Moquegua", "puerto": "Ilo"}
]

def clasificar_alerta_termica(anomalia: Optional[float]) -> Dict[str, str]:
    """Clasifica el nivel de anomalía según los umbrales de ENFEN e IMARPE."""
    if anomalia is None:
        return {
            "nivel": "SIN_DATOS",
            "etiqueta": "No informa ΔT",
            "color": "slate",
            "severidad": 0
        }
    if anomalia <= 1.0:
        return {
            "nivel": "NORMAL",
            "etiqueta": "Neutral / Normal",
            "color": "emerald",
            "severidad": 1
        }
    elif anomalia <= 2.5:
        return {
            "nivel": "VIGILANCIA",
            "etiqueta": "Vigilancia Térmica",
            "color": "yellow",
            "severidad": 2
        }
    elif anomalia <= 4.5:
        return {
            "nivel": "ALERTA_MODERADA",
            "etiqueta": "Alerta Térmica Alta",
            "color": "orange",
            "severidad": 3
        }
    else:
        return {
            "nivel": "ALERTA_EXTREMA",
            "etiqueta": "Alerta Térmica Extrema (El Niño)",
            "color": "red",
            "severidad": 4
        }

def get_imarpe_data_dirs() -> List[str]:
    """Obtiene posibles directorios donde se ubica la carpeta 'Reporte de Imarpe diario'."""
    base_dirs = []
    
    # 1. Desde backend/data
    b_data = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "data", "Reporte de Imarpe diario")
    if os.path.exists(b_data):
        base_dirs.append(b_data)
        
    # 2. Desde raíz Lab4/data
    root_data = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))), "data", "Reporte de Imarpe diario")
    if os.path.exists(root_data) and root_data not in base_dirs:
        base_dirs.append(root_data)
        
    return base_dirs

def get_cache_filepath() -> str:
    """Ruta al archivo JSON consolidado de caché."""
    # Guardar en backend/data
    target_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "data")
    os.makedirs(target_dir, exist_ok=True)
    return os.path.join(target_dir, "imarpe_boletines_cache.json")

def parse_coordenada_str(coord_str: str) -> Optional[float]:
    """Convierte '05,08◦S' a -5.08 o '81,12◦W' a -81.12."""
    try:
        clean = coord_str.replace("◦", "").replace("°", "").strip()
        is_south_or_west = clean.endswith("S") or clean.endswith("W")
        num_part = clean.rstrip("SWNE").replace(",", ".").strip()
        val = float(num_part)
        return -val if is_south_or_west else val
    except Exception:
        return None

def parse_single_imarpe_pdf(pdf_path: str) -> Optional[Dict[str, Any]]:
    """Extrae diagnóstico, fecha y Tabla 1 de un PDF del IMARPE."""
    try:
        reader = pypdf.PdfReader(pdf_path)
        if len(reader.pages) < 4:
            return None

        # 1. Metadatos y diagnóstico de Pág. 1
        p1_text = reader.pages[0].extract_text()
        
        # Extraer fecha del nombre del archivo: BOL_IMARPE_BDO_YYYY-MM-DD.pdf
        filename = os.path.basename(pdf_path)
        date_match = re.search(r"(\d{4}-\d{2}-\d{2})", filename)
        fecha_str = date_match.group(1) if date_match else ""

        # Número de boletín y año (soporta tilde pequeña \u02dc de LaTeX)
        num_boletin_match = re.search(r"A\s*[\u02dc~ñn\s]+o\s*(\d+),\s*N[°º\s]*(\d+)", p1_text, re.IGNORECASE)
        boletin_nro = f"N° {num_boletin_match.group(2)}" if num_boletin_match else ""
        boletin_anio = f"Año {num_boletin_match.group(1)}" if num_boletin_match else ""

        # Diagnóstico (Maneja variaciones como 'DIAGN ´OSTICO')
        diagnostico = ""
        diag_match = re.search(r"DIAGN\s*[´'`]?\s*[ÓO]STICO\s*\n(.*?)(?=\n\s*I\.\s*CONDICIONES|\n\s*Figura 1|\Z)", p1_text, re.DOTALL | re.IGNORECASE)
        if diag_match:
            lines = [l.strip() for l in diag_match.group(1).splitlines() if l.strip()]
            diagnostico = " ".join(lines)
            # Limpiar caracteres tipográficos desarticulados de LaTeX
            diagnostico = (
                diagnostico
                .replace("´ı", "í")
                .replace("´o", "ó")
                .replace("´a", "á")
                .replace("´e", "é")
                .replace("´u", "ú")
                .replace(" ˜no", "ño")
                .replace("˜no", "ño")
            )
            # Recomponer palabras con acento partido: ej. 'alcanz ó' -> 'alcanzó', 'm áximos' -> 'máximos'
            diagnostico = re.sub(r"(\w+)\s+´([aeiou])", r"\1\2", diagnostico)
            diagnostico = re.sub(r"(\w+)\s+([áéíóú])([a-z]*)", r"\1\2\3", diagnostico)
            diagnostico = re.sub(r"\s+", " ", diagnostico).strip()

        # 2. Pág 4: Sección III Microescala (Tabla 1)
        p4_text = reader.pages[3].extract_text()
        
        # Extraer fecha de observación reportada en la tabla (usualmente D-1)
        fecha_obs_match = re.search(r"para el\s+(\d+\s+de\s+\w+\s+de\s+\d{4})", p4_text, re.IGNORECASE)
        fecha_observacion = fecha_obs_match.group(1) if fecha_obs_match else ""

        estaciones_resultado = []
        p4_lines = p4_text.splitlines()

        for cat in ESTACIONES_CATALOGO:
            nombre_busqueda = cat["nombre"]
            # En el PDF Chicama puede aparecer como "Chicama", San José como "San Jos´e", etc.
            nombre_regex = re.escape(nombre_busqueda).replace("é", r"[eé´]+").replace("o", r"[oó´]+")
            
            line_found = None
            for line in p4_lines:
                if re.search(rf"\b{nombre_regex}\b", line, re.IGNORECASE):
                    line_found = line
                    break
            
            if not line_found:
                estaciones_resultado.append({
                    **cat,
                    "tsm_c": None,
                    "anomalia_c": None,
                    "lat": cat["lat_ref"],
                    "lng": cat["lng_ref"],
                    "alerta": clasificar_alerta_termica(None),
                    "estado_reporte": "NO_FIGURA"
                })
                continue

            # Parsear línea de la Tabla 1
            # Columnas: Estación costera | Ubicación (Lat S, Lng W) | T, °C | ∆T, °C
            # Ejemplo 1: 'Paita 05,08◦S 81,12◦W 25,0 +8,2'
            # Ejemplo 2: 'Chala 15,85◦S 74,23◦W 17,7' (TSM = 17.7, pero columna ∆T vacía)
            # Ejemplo 3: 'Chala 15,85◦S 74,23◦W (1)' (Sin datos)
            lat_parsed = cat["lat_ref"]
            lng_parsed = cat["lng_ref"]
            tsm_parsed = None
            anomalia_parsed = None
            estado_reporte = "OK"

            # 1. Extraer coordenadas geográficas explícitas de la línea
            lat_m = re.search(r"(\d+[\.,]\d+)\s*[◦°]?\s*S", line_found, re.IGNORECASE)
            lng_m = re.search(r"(\d+[\.,]\d+)\s*[◦°]?\s*W", line_found, re.IGNORECASE)
            if lat_m:
                lat_parsed = -float(lat_m.group(1).replace(",", "."))
            if lng_m:
                lng_parsed = -float(lng_m.group(1).replace(",", "."))

            # 2. Obtener el texto que se encuentra estrictamente después de la longitud ('W' o '◦W')
            partes_w = re.split(r"[◦°]?\s*[Ww]", line_found, maxsplit=1)
            datos_columnas = partes_w[1].strip() if len(partes_w) > 1 else ""

            if "(1)" in datos_columnas or "sin datos" in datos_columnas.lower() or "(1)" in line_found:
                estado_reporte = "SIN_DATOS"
                tsm_parsed = None
                anomalia_parsed = None
            else:
                # Extraer números decimales que aparecen estrictamente DESPUÉS de las coordenadas
                nums_telemetria = re.findall(r"([+-]?\d+[\.,]\d+)", datos_columnas)
                if len(nums_telemetria) >= 2:
                    # Ambas columnas presentes: TSM y ∆T
                    tsm_parsed = float(nums_telemetria[0].replace(",", "."))
                    anomalia_parsed = float(nums_telemetria[1].replace(",", "."))
                    estado_reporte = "OK"
                elif len(nums_telemetria) == 1:
                    # Solo una columna presente: corresponde a T, °C (TSM). ∆T está vacío (ej. Chala).
                    tsm_parsed = float(nums_telemetria[0].replace(",", "."))
                    anomalia_parsed = None
                    estado_reporte = "SIN_ANOMALIA"
                else:
                    tsm_parsed = None
                    anomalia_parsed = None
                    estado_reporte = "SIN_DATOS"

            estaciones_resultado.append({
                **cat,
                "tsm_c": tsm_parsed,
                "anomalia_c": anomalia_parsed,
                "lat": lat_parsed,
                "lng": lng_parsed,
                "alerta": clasificar_alerta_termica(anomalia_parsed),
                "estado_reporte": estado_reporte,
                "linea_raw": line_found.strip()
            })

        # Estación más crítica (mayor anomalía positiva)
        estaciones_con_anomalia = [e for e in estaciones_resultado if e["anomalia_c"] is not None]
        estacion_max = max(estaciones_con_anomalia, key=lambda x: x["anomalia_c"]) if estaciones_con_anomalia else None

        return {
            "archivo": filename,
            "fecha": fecha_str,
            "boletin_nro": boletin_nro,
            "boletin_anio": boletin_anio,
            "diagnostico_oficial": diagnostico,
            "fecha_observacion": fecha_observacion,
            "estaciones": estaciones_resultado,
            "resumen": {
                "total_estaciones": len(estaciones_resultado),
                "estaciones_activas": len(estaciones_con_anomalia),
                "estacion_critica": {
                    "nombre": estacion_max["nombre"] if estacion_max else "N/A",
                    "anomalia_c": estacion_max["anomalia_c"] if estacion_max else 0.0,
                    "tsm_c": estacion_max["tsm_c"] if estacion_max else 0.0
                } if estacion_max else None,
                "promedio_anomalia_costera": round(sum(e["anomalia_c"] for e in estaciones_con_anomalia) / len(estaciones_con_anomalia), 2) if estaciones_con_anomalia else 0.0
            }
        }
    except Exception as e:
        logger.error(f"Error procesando {pdf_path}: {e}")
        return None

class ImarpeService:
    def __init__(self):
        self.cache_file = get_cache_filepath()
        self._cache_data: Optional[Dict[str, Any]] = None

    def sync_bulletins(self, force: bool = False) -> Dict[str, Any]:
        """Escanea todos los PDFs disponibles, regenera la caché JSON y extrae las cartas satelitales."""
        data_dirs = get_imarpe_data_dirs()
        logger.info(f"Escaneando directorios IMARPE: {data_dirs}")
        
        pdf_paths = []
        for d in data_dirs:
            for root, _, files in os.walk(d):
                for f in files:
                    if f.startswith("BOL_IMARPE_") and f.endswith(".pdf"):
                        full_path = os.path.join(root, f)
                        if full_path not in pdf_paths:
                            pdf_paths.append(full_path)

        pdf_paths.sort()
        logger.info(f"Encontrados {len(pdf_paths)} boletines IMARPE.")

        boletines = []
        for p in pdf_paths:
            res = parse_single_imarpe_pdf(p)
            if res:
                boletines.append(res)

        # Ordenar cronológicamente
        boletines.sort(key=lambda x: x["fecha"])

        # Extraer figuras satelitales oficiales del boletín más reciente
        cartas_extraidas = []
        if boletines and pdf_paths:
            latest_boletin = boletines[-1]
            latest_fecha = latest_boletin.get("fecha", "latest")
            latest_pdf = pdf_paths[-1]
            try:
                # Directorio en frontend/public
                public_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))), "frontend", "public", "imarpe_images")
                os.makedirs(public_dir, exist_ok=True)
                
                reader = pypdf.PdfReader(latest_pdf)
                # Extraer imagen principal de página 1 (Figura 1: I. CONDICIONES DE MACROESCALA - Pacífico Tropical)
                if len(reader.pages) >= 1 and len(reader.pages[0].images) > 0:
                    # En los boletines de IMARPE, images[0] es el banner institucional (Im1) e images[1] es la Figura 1 (Im2)
                    fig1_img = None
                    for candidate in reader.pages[0].images:
                        if candidate.name == "Im2.png" or "Im2" in candidate.name or len(candidate.data) < 1000000:
                            fig1_img = candidate
                            break
                    if not fig1_img and len(reader.pages[0].images) > 1:
                        fig1_img = reader.pages[0].images[1]
                    elif not fig1_img:
                        fig1_img = reader.pages[0].images[0]

                    fig1_data = fig1_img.data
                    fig1_canonical = os.path.join(public_dir, "figura_1_pacifico_tropical.png")
                    fig1_dated = os.path.join(public_dir, f"figura_1_pacifico_tropical_{latest_fecha}.png")
                    with open(fig1_canonical, "wb") as f_img:
                        f_img.write(fig1_data)
                    with open(fig1_dated, "wb") as f_img:
                        f_img.write(fig1_data)

                    cartas_extraidas.append({
                        "id": "figura_1",
                        "titulo": "I. CONDICIONES DE MACROESCALA — Figura 1: TSM y Anomalías en el Pacífico Tropical (Niño 1+2 / 3.4)",
                        "url": f"/imarpe_images/figura_1_pacifico_tropical_{latest_fecha}.png",
                        "canonical_url": f"/imarpe_images/figura_1_pacifico_tropical.png?v={latest_fecha}",
                        "fecha": latest_fecha,
                        "fuente": "OSTIA-UKMO-L4-GLOB-v2.0 (UK Met Office) / Marine Copernicus / IMARPE"
                    })
                
                # Extraer imagen de página 2 (Figura 3: Anomalías frente a la costa peruana)
                if len(reader.pages) >= 2 and len(reader.pages[1].images) >= 3:
                    fig3_data = reader.pages[1].images[2].data
                    fig3_canonical = os.path.join(public_dir, "figura_3_anomalias_costa_peru.png")
                    fig3_dated = os.path.join(public_dir, f"figura_3_anomalias_costa_peru_{latest_fecha}.png")
                    with open(fig3_canonical, "wb") as f_img:
                        f_img.write(fig3_data)
                    with open(fig3_dated, "wb") as f_img:
                        f_img.write(fig3_data)

                    cartas_extraidas.append({
                        "id": "figura_3",
                        "titulo": "Figura 3: Anomalías Térmicas Multitemporales frente al Litoral Peruano",
                        "url": f"/imarpe_images/figura_3_anomalias_costa_peru_{latest_fecha}.png",
                        "canonical_url": f"/imarpe_images/figura_3_anomalias_costa_peru.png?v={latest_fecha}",
                        "fecha": latest_fecha,
                        "fuente": "OSTIA-UKMO-L4-GLOB-v2.0 / DGIOCC IMARPE"
                    })
            except Exception as e:
                logger.error(f"Error extrayendo cartas satelitales: {e}")

        # Generar series históricas por estación
        series_estaciones = {}
        for cat in ESTACIONES_CATALOGO:
            est_id = cat["id"]
            series_estaciones[est_id] = {
                "metadata": cat,
                "serie": []
            }

        for b in boletines:
            f = b["fecha"]
            for est in b["estaciones"]:
                est_id = est["id"]
                if est_id in series_estaciones:
                    series_estaciones[est_id]["serie"].append({
                        "fecha": f,
                        "tsm_c": est["tsm_c"],
                        "anomalia_c": est["anomalia_c"],
                        "estado": est["estado_reporte"],
                        "nivel_alerta": est["alerta"]["nivel"]
                    })

        consolidado = {
            "ultima_actualizacion": boletines[-1]["fecha"] if boletines else "",
            "total_boletines": len(boletines),
            "boletines": boletines,
            "cartas_satelitales": cartas_extraidas,
            "series_por_estacion": series_estaciones,
            "catalogo_estaciones": ESTACIONES_CATALOGO
        }

        with open(self.cache_file, "w", encoding="utf-8") as f_out:
            json.dump(consolidado, f_out, indent=2, ensure_ascii=False)

        self._cache_data = consolidado
        return {
            "status": "success",
            "boletines_procesados": len(boletines),
            "ultimo_boletin": boletines[-1]["fecha"] if boletines else None,
            "cache_file": self.cache_file
        }

    def _ensure_cache(self) -> Dict[str, Any]:
        """Carga la caché en memoria o la genera si no existe."""
        if self._cache_data is not None:
            return self._cache_data

        if os.path.exists(self.cache_file):
            try:
                with open(self.cache_file, "r", encoding="utf-8") as f_in:
                    self._cache_data = json.load(f_in)
                    return self._cache_data
            except Exception:
                pass

        # Generar por primera vez
        self.sync_bulletins()
        return self._cache_data or {}

    def get_latest_bulletin(self) -> Optional[Dict[str, Any]]:
        """Retorna el boletín más reciente disponible."""
        cache = self._ensure_cache()
        boletines = cache.get("boletines", [])
        if not boletines:
            return None
        latest = dict(boletines[-1])
        latest["cartas_satelitales"] = cache.get("cartas_satelitales", [])
        return latest

    def get_history(self) -> Dict[str, Any]:
        """Retorna todas las fechas y las series históricas por estación."""
        cache = self._ensure_cache()
        fechas = [b["fecha"] for b in cache.get("boletines", [])]
        return {
            "fechas": fechas,
            "series": cache.get("series_por_estacion", {}),
            "total_dias": len(fechas)
        }

    def get_stations_catalog(self) -> List[Dict[str, Any]]:
        """Retorna el catálogo de estaciones con la última telemetría de cada una."""
        latest = self.get_latest_bulletin()
        if not latest:
            return ESTACIONES_CATALOGO

        return latest.get("estaciones", [])

# Instancia singleton del servicio
imarpe_service = ImarpeService()
