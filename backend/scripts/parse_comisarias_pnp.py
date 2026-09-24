# backend/scripts/parse_comisarias_pnp.py
"""
Extractor y Normalizador Maestro de Comisarías Básicas de la Policía Nacional del Perú (PNP)
Fuente: MININTER / PNP - Equipo Especial de Gestión del PP 0030 (15 de diciembre de 2025)
Documento: Línea Base de Información Georreferenciada de Comisarías Básicas (1,332 CPNP)
Marco Legal: D.S. Nº 012-2025-IN, Ley Nº 29664 (SINAGERD), RCG Nº 855-2025-CG PNP/COMOPPOL
"""

import os
import re
import json
import tempfile
import subprocess
import pypdf
import unicodedata

def normalize_text(text: str) -> str:
    if not text:
        return ""
    text = text.replace('\ufffd', 'N')
    text = unicodedata.normalize('NFKD', text).encode('ASCII', 'ignore').decode('ASCII')
    text = re.sub(r'[^A-Z0-9\s]', ' ', text.upper())
    return " ".join(text.split())

def main():
    base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    pdf_path = os.path.join(base_dir, "data", "7531378-relacion-de-comisarias-operativas-a-nivel-nacional-2025.pdf")
    distritos_path = os.path.join(base_dir, "data", "distritos_riesgo_nacional_1891_cenepred_mef.json")
    out_data_path = os.path.join(base_dir, "data", "comisarias_pnp_nacional_2026.json")
    out_backend_path = os.path.join(base_dir, "backend", "data", "comisarias_pnp_nacional_2026.json")

    print(f"[Parser CPNP] Leyendo PDF: {pdf_path}")
    reader = pypdf.PdfReader(pdf_path)
    print(f"[Parser CPNP] Total páginas: {len(reader.pages)}")

    # 1. Cargar distritos nacionales para mapeo de UBIGEO
    with open(distritos_path, 'r', encoding='utf-8') as f:
        distritos_info = json.load(f)
    
    dist_list = distritos_info.get("distritos", [])
    ubigeo_map = {} # (depto_norm, prov_norm, dist_norm) -> ubigeo
    name_to_ubigeos = {} # dist_norm -> [ubigeo, ...]
    dept_to_provinces = {} # dep_norm -> [prov_norm_sorted_by_len_desc]

    for d in dist_list:
        ub = d.get("ubigeo")
        dep_n = normalize_text(d.get("departamento", ""))
        prov_n = normalize_text(d.get("provincia", ""))
        dist_n = normalize_text(d.get("distrito", ""))
        ubigeo_map[(dep_n, prov_n, dist_n)] = ub
        ubigeo_map[(dep_n, dist_n)] = ub
        
        if dep_n not in dept_to_provinces:
            dept_to_provinces[dep_n] = set()
        dept_to_provinces[dep_n].add(prov_n)

        if dist_n not in name_to_ubigeos:
            name_to_ubigeos[dist_n] = []
        name_to_ubigeos[dist_n].append({
            "ubigeo": ub,
            "departamento": dep_n,
            "provincia": prov_n,
            "distrito": dist_n
        })

    # Ordenar provincias por longitud descendente para emparejar multi-palabra primero
    for dep_n in dept_to_provinces:
        dept_to_provinces[dep_n] = sorted(list(dept_to_provinces[dep_n]), key=lambda x: len(x), reverse=True)

    print(f"[Parser CPNP] Indexados {len(dist_list)} distritos nacionales para cruce de UBIGEO.")

    # 2. Parsear registros de las páginas 1 a 17
    comisarias_list = []
    
    for p_idx in range(1, len(reader.pages)):
        text = reader.pages[p_idx].extract_text()
        lines = text.split('\n')
        for line in lines:
            line_clean = line.strip()
            if not line_clean or line_clean.startswith('*') or line_clean.startswith('ANEXOS') or line_clean.startswith('N'):
                continue
            
            # Buscar inicio con número de 1 a 1332
            m_start = re.match(r'^(\d+)\s+([A-Z0-9\s]+?)\s+(\d{3,5})\s+(\d{5,7})\s+(CPNP\s+.+)$', line_clean)
            if not m_start:
                continue
            
            nro = int(m_start.group(1))
            region_pnp = m_start.group(2).strip()
            cod_cpnp = m_start.group(3).strip()
            cod_uni = m_start.group(4).strip()
            rest = m_start.group(5).strip()
            
            m_end = re.search(r'\s+([A-E0-9])\s+(\d+)\s+([A-Z\ufffd\s\_\-\.]+)$', rest)
            if not m_end:
                m_end_alt = re.search(r'([A-E])\s+(\d+)\s+([A-Z\ufffd\s\_\-\.]+)$', rest)
                if m_end_alt:
                    m_end = m_end_alt
            
            if m_end:
                nombre_comisaria = rest[:m_end.start()].strip()
                tipo_comi = m_end.group(1).strip()
                sectores = int(m_end.group(2).strip())
                geo_tail = m_end.group(3).strip()
                
                # Tratamos de emparejar con los departamentos peruanos
                depto_encontrado = None
                deptos_posibles = [
                    "MADRE DE DIOS", "LA LIBERTAD", "SAN MARTIN", "AMAZONAS", "ANCASH",
                    "APURIMAC", "AREQUIPA", "AYACUCHO", "CAJAMARCA", "CALLAO", "CUSCO",
                    "HUANCAVELICA", "HUANUCO", "ICA", "JUNIN", "LAMBAYEQUE", "LIMA",
                    "LORETO", "MOQUEGUA", "PASCO", "PIURA", "PUNO", "TACNA", "TUMBES", "UCAYALI"
                ]
                
                geo_tail_norm = normalize_text(geo_tail)
                for dep in deptos_posibles:
                    if geo_tail_norm.startswith(dep):
                        depto_encontrado = dep
                        break
                
                provincia_str = ""
                distrito_str = ""

                if depto_encontrado:
                    dep_norm = depto_encontrado
                    # Quitar depto del inicio de geo_tail_norm
                    after_dep = geo_tail_norm[len(depto_encontrado):].strip()
                    # Buscar la provincia correspondiente
                    provincias_de_dep = dept_to_provinces.get(dep_norm, [])
                    for prov_cand in provincias_de_dep:
                        # Comprobar si after_dep empieza con prov_cand
                        if after_dep.startswith(prov_cand):
                            provincia_str = prov_cand
                            distrito_str = after_dep[len(prov_cand):].strip()
                            break
                        # O si están pegadas (ej. FITZCARRALDSAN)
                        compact_prov = prov_cand.replace(" ", "")
                        compact_after = after_dep.replace(" ", "")
                        if compact_after.startswith(compact_prov):
                            provincia_str = prov_cand
                            # Recuperar el distrito restante
                            distrito_str = compact_after[len(compact_prov):]
                            break
                    
                    if not provincia_str:
                        tokens = after_dep.split()
                        if len(tokens) >= 2:
                            provincia_str = tokens[0]
                            distrito_str = " ".join(tokens[1:])
                        elif len(tokens) == 1:
                            provincia_str = tokens[0]
                            distrito_str = tokens[0]
                        else:
                            provincia_str = depto_encontrado
                            distrito_str = depto_encontrado
                else:
                    tokens = geo_tail_norm.split()
                    depto_encontrado = tokens[0] if tokens else "PERU"
                    provincia_str = tokens[1] if len(tokens) > 1 else depto_encontrado
                    distrito_str = " ".join(tokens[2:]) if len(tokens) > 2 else provincia_str

                dep_norm = normalize_text(depto_encontrado)
                prov_norm = normalize_text(provincia_str)
                dist_norm = normalize_text(distrito_str)

                # Alias específicos por variantes ortográficas oficiales
                distrito_alias = {
                    ("CAJAMARCA", "CONTUMAZA", "SANTA CRUZ DE TOLEDO"): "060507",  # Santa Cruz de Toled
                    ("LA LIBERTAD", "GRAN CHIMU", "MARMOT COMPIN"): "131103",      # Marmot (Compín)
                    ("UCAYALI", "ATALAYA", "RAYMONDI"): "250201",                 # Raimondi
                }

                ubigeo_resuelto = distrito_alias.get((dep_norm, prov_norm, dist_norm))
                if not ubigeo_resuelto:
                    ubigeo_resuelto = ubigeo_map.get((dep_norm, prov_norm, dist_norm))
                if not ubigeo_resuelto:
                    ubigeo_resuelto = ubigeo_map.get((dep_norm, dist_norm))
                if not ubigeo_resuelto:
                    candidatos = name_to_ubigeos.get(dist_norm, [])
                    for cand in candidatos:
                        if cand["departamento"] == dep_norm:
                            ubigeo_resuelto = cand["ubigeo"]
                            break
                    if not ubigeo_resuelto and candidatos:
                        ubigeo_resuelto = candidatos[0]["ubigeo"]

                comisarias_list.append({
                    "nro": nro,
                    "cod_cpnp": cod_cpnp,
                    "cod_uni": cod_uni,
                    "nombre": nombre_comisaria.replace('\ufffd', 'N'),
                    "tipo_comisaria": tipo_comi,
                    "sectores_patrullaje_cuadrante": sectores,
                    "region_policial": region_pnp,
                    "departamento": depto_encontrado,
                    "provincia": provincia_str,
                    "distrito": distrito_str,
                    "ubigeo": ubigeo_resuelto or "999999",
                    "rol_en_contingencia": "Fuerza Pública, Seguridad Perimetral de Albergues y Ejecución de Cierre de Puentes/Vías (Art. 67 Ley 29664)"
                })

    print(f"[Parser CPNP] Total comisarías extraídas: {len(comisarias_list)}")
    
    # 3. Incorporar modificaciones de página 0
    modificaciones_pg0 = {
        "1150": {"tipo_comisaria": "E", "resolucion": "RCG Nº 855-2025 CG PNP/COMOPPOL"}, # Usquil
        "1198": {"tipo_comisaria": "E", "resolucion": "RCG Nº 633-2025-CG PNP/COMMOPOL"}, # Jequetepeque
        "5440": {"nombre": "CPNP CHALHUANCA", "tipo_comisaria": "C", "resolucion": "RCG Nº 822-2025-CG PNP/COMOPPOL"},
        "5438": {"nombre": "CPNP PALPACACHI", "tipo_comisaria": "E", "resolucion": "RCG Nº 839-2025-CG PNP/COMOPPOL"}
    }
    for c in comisarias_list:
        cod = c["cod_cpnp"]
        if cod in modificaciones_pg0:
            c.update(modificaciones_pg0[cod])
            c["actualizado_resolucion_2025"] = True

    # 4. Agrupar por UBIGEO
    ubigeo_to_comisarias = {}
    for c in comisarias_list:
        ub = c["ubigeo"]
        if ub not in ubigeo_to_comisarias:
            ubigeo_to_comisarias[ub] = []
        ubigeo_to_comisarias[ub].append(c)

    # 5. Generar estructura maestra
    dataset_final = {
        "metadata": {
            "titulo": "Línea Base Georreferenciada de Comisarías Básicas de la Policía Nacional del Perú (PNP)",
            "fuente_oficial": "Ministerio del Interior (MININTER) / Policía Nacional del Perú (PNP) - Equipo Especial de Gestión del PP 0030",
            "documento_sustento": "Relación de Comisarías Operativas a Nivel Nacional al 15 de Diciembre de 2025 (RPTE 1332 CPNP 15DIC25)",
            "marco_legal": [
                "Ley Nº 29664 (Sistema Nacional de Gestión del Riesgo de Desastres - SINAGERD)",
                "D.S. Nº 012-2025-IN (Línea Base de Infraestructura Policial)",
                "D.S. Nº 124-2026-PCM (Declaratoria de Estado de Emergencia por FEN)",
                "Programa Presupuestal 0030: Reducción de Delitos y Faltas que Afectan la Seguridad Ciudadana"
            ],
            "total_comisarias_operativas": len(comisarias_list),
            "total_distritos_con_comisaria_directa": len([k for k in ubigeo_to_comisarias.keys() if k != "999999"]),
            "fecha_reporte_oficial": "2025-12-15",
            "fecha_ingesta_amaru": "2026-09-19",
            "clasificacion_tiers": "TIER_1_OFICIAL_ESTATAL"
        },
        "resumen_departamental": {},
        "comisarias": comisarias_list,
        "por_ubigeo": ubigeo_to_comisarias
    }

    for c in comisarias_list:
        dep = c["departamento"]
        dataset_final["resumen_departamental"][dep] = dataset_final["resumen_departamental"].get(dep, 0) + 1

    json_str = json.dumps(dataset_final, ensure_ascii=False, indent=2)

    with tempfile.NamedTemporaryFile('w', encoding='utf-8', delete=False) as tmp:
        tmp.write(json_str)
        tmp_name = tmp.name

    print(f"[Parser CPNP] Escribiendo archivo temporal ({len(json_str)} bytes)...")
    subprocess.run(f'copy /Y "{tmp_name}" "{out_data_path}"', shell=True, check=True)
    subprocess.run(f'copy /Y "{tmp_name}" "{out_backend_path}"', shell=True, check=True)
    os.remove(tmp_name)

    print(f"[SUCCESS] Dataset de Comisarías PNP integrado con éxito en:")
    print(f"  -> {out_data_path}")
    print(f"  -> {out_backend_path}")
    print(f"Total CPNP procesadas: {len(comisarias_list)} en 25 departamentos.")

if __name__ == "__main__":
    main()
