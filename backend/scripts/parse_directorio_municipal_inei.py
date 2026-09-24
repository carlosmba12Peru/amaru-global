"""
Script pericial de extracción y normalización del Directorio Nacional de Municipalidades 2026
Fuente: Instituto Nacional de Estadística e Informática (INEI)
Archivo: data/3908763-directorio-nacional-de-municipalidades-provinciales-y-distritales-setiembre-2026.xlsx
Fecha de Corte Oficial: 02 de Setiembre de 2026
URL: https://www.gob.pe/institucion/inei/informes-publicaciones/3908763-directorio-nacional-de-municipalidades-provinciales-y-distritales-agosto-2026
Marco Legal: Ley Nº 29664 (SINAGERD) - Artículos 14 y 19 (Presidencia del GT-GRD)
"""

import json
import os
import subprocess
import tempfile
import xml.etree.ElementTree as ET
import zipfile
from typing import Any, Dict, List


def parse_shared_strings(z: zipfile.ZipFile) -> List[str]:
    """Extrae la tabla de cadenas compartidas (sharedStrings.xml) del formato OOXML XLSX."""
    shared_strings = []
    if "xl/sharedStrings.xml" in z.namelist():
        tree = ET.fromstring(z.read("xl/sharedStrings.xml"))
        for si in tree.findall("{http://schemas.openxmlformats.org/spreadsheetml/2006/main}si"):
            text_runs = [
                node.text
                for node in si.iter("{http://schemas.openxmlformats.org/spreadsheetml/2006/main}t")
                if node.text
            ]
            shared_strings.append("".join(text_runs))
    return shared_strings


def parse_municipalities_xlsx(xlsx_path: str) -> Dict[str, Any]:
    print(f"Abriendo archivo pericial INEI: {xlsx_path}...")
    with zipfile.ZipFile(xlsx_path, "r") as z:
        shared_strings = parse_shared_strings(z)
        print(f"Indexadas {len(shared_strings)} cadenas compartidas en OOXML.")

        ns = {"main": "http://schemas.openxmlformats.org/spreadsheetml/2006/main"}
        tree = ET.fromstring(z.read("xl/worksheets/sheet1.xml"))
        sheet_data = tree.find("main:sheetData", ns)

        por_ubigeo: Dict[str, Dict[str, Any]] = {}
        provinciales_count = 0
        distritales_count = 0

        for r in sheet_data.findall("main:row", ns):
            r_num = int(r.get("r", 0))
            if r_num <= 4:
                # Filas 1 a 4 corresponden a encabezados y metadatos
                continue

            row_cells: Dict[str, str] = {}
            for c in r.findall("main:c", ns):
                ref = c.get("r", "")  # ej. A5, B5...
                col_letter = "".join([ch for ch in ref if ch.isalpha()])
                t_type = c.get("t")
                v = c.find("main:v", ns)
                val = v.text.strip() if (v is not None and v.text) else ""
                if t_type == "s" and val.isdigit():
                    idx = int(val)
                    if idx < len(shared_strings):
                        val = shared_strings[idx].strip()
                row_cells[col_letter] = val

            ubigeo = row_cells.get("A", "").strip()
            if not (len(ubigeo) == 6 and ubigeo.isdigit()):
                continue

            departamento = row_cells.get("B", "").strip()
            provincia = row_cells.get("C", "").strip()
            distrito = row_cells.get("D", "").strip()
            cargo = row_cells.get("E", "").strip()
            alcalde = row_cells.get("F", "").strip()
            sexo = row_cells.get("G", "").strip()
            direccion = row_cells.get("H", "").strip()
            cod_ciudad = row_cells.get("I", "").strip()
            telefonos = row_cells.get("J", "").strip()
            correo = row_cells.get("K", "").strip()

            es_provincial = "Provincial" in cargo
            if es_provincial:
                provinciales_count += 1
            else:
                distritales_count += 1

            record = {
                "ubigeo": ubigeo,
                "departamento": departamento,
                "provincia": provincia,
                "distrito": distrito,
                "cargo": cargo,
                "es_provincial": es_provincial,
                "alcalde": alcalde,
                "sexo": sexo,
                "direccion_sede_municipal": direccion,
                "codigo_ciudad": cod_ciudad,
                "telefonos_contacto": telefonos,
                "correo_electronico": correo,
                "rol_sinagerd": "Presidente de la Plataforma Distrital de Defensa Civil (Ley 29664)",
                "fuente_oficial": "INEI-DIRECTORIO-MUNICIPALIDADES-SETIEMBRE-2026",
            }
            por_ubigeo[ubigeo] = record

    metadata = {
        "entidad": "Instituto Nacional de Estadística e Informática (INEI)",
        "fuente": "Directorio Nacional de Municipalidades Provinciales y Distritales 2026",
        "fecha_corte_oficial": "2026-09-02",
        "identificador_canonico": "SRC-INEI-DIRECTORIO-MUNIS-2026",
        "total_municipalidades_indexadas": len(por_ubigeo),
        "total_provinciales": provinciales_count,
        "total_distritales": distritales_count,
        "marco_legal": "Ley Nº 29664 (SINAGERD) - Artículos 14 y 19 (Presidencia del GT-GRD)",
    }

    print(
        f"Completado: {len(por_ubigeo)} municipalidades estructuradas "
        f"({provinciales_count} provinciales, {distritales_count} distritales)."
    )
    return {"metadata": metadata, "por_ubigeo": por_ubigeo}


def main():
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    root_dir = os.path.dirname(base_dir)

    xlsx_path = os.path.join(
        root_dir,
        "data",
        "3908763-directorio-nacional-de-municipalidades-provinciales-y-distritales-setiembre-2026.xlsx",
    )
    if not os.path.exists(xlsx_path):
        xlsx_path = os.path.join(
            base_dir,
            "data",
            "3908763-directorio-nacional-de-municipalidades-provinciales-y-distritales-setiembre-2026.xlsx",
        )

    data = parse_municipalities_xlsx(xlsx_path)

    target_data = os.path.join(root_dir, "data", "directorio_municipalidades_inei_2026.json")
    target_backend = os.path.join(base_dir, "data", "directorio_municipalidades_inei_2026.json")

    with tempfile.NamedTemporaryFile("w", delete=False, encoding="utf-8") as tf:
        json.dump(data, tf, ensure_ascii=False, indent=2)
        tname = tf.name

    for tgt in [target_data, target_backend]:
        res = subprocess.run(["cmd", "/C", "copy", "/Y", tname, tgt], capture_output=True, text=True)
        print(f"Copiado a {tgt}: {res.stdout.strip()}")

    os.unlink(tname)
    print("Directorio de municipalidades INEI 2026 depositado exitosamente.")


if __name__ == "__main__":
    main()
