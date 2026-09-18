import os
import json
import re
import pypdf

def parse_all_norms():
    folder = r"data\Marco Legal Fenómeno del Niño 2026 2027"
    if not os.path.exists(folder):
        folder = os.path.join(os.path.dirname(__file__), "..", "..", "data", "Marco Legal Fenómeno del Niño 2026 2027")
        folder = os.path.abspath(folder)

    files = sorted([f for f in os.listdir(folder) if f.endswith(".pdf")])
    print(f"Total PDFs found: {len(files)}")

    catalog = []
    category_counts = {}
    sector_counts = {}

    for i, f in enumerate(files):
        path = os.path.join(folder, f)
        try:
            reader = pypdf.PdfReader(path)
            num_pages = len(reader.pages)

            # Extraer texto de las primeras páginas
            text = ""
            for p in reader.pages[:min(4, num_pages)]:
                text += (p.extract_text() or "") + "\n"

            # 1. Fecha de publicación en El Peruano
            date_match = re.search(r'([A-Za-z]+,\s+\d{1,2}\s+de\s+[a-zñ]+\s+de\s+202\d|[A-Za-z]+\s+\d{1,2}\s+de\s+[a-zñ]+\s+de\s+202\d|\d{1,2}\s+de\s+[a-zñ]+\s+de\s+202\d)', text, re.I)
            date_str = date_match.group(0).strip() if date_match else "2026"

            # 2. Identificación de la Norma
            norm_match = re.search(r'((?:DECRETO SUPREMO|DECRETO DE URGENCIA|RESOLUCI[ÓO]N MINISTERIAL|RESOLUCI[ÓO]N JEFATURAL|LEY)\s*N[º°\.\s]*[\d\-]+(?:\-[A-Z0-9]+)*)', text, re.I)
            if norm_match:
                norm_id = re.sub(r'\s+', ' ', norm_match.group(0).strip())
            else:
                norm_id = f"Norma Oficial {f.replace('.pdf', '')}"

            # 3. Sector / Ministerio emisor
            sector = "PRESIDENCIA DEL CONSEJO DE MINISTROS"
            if "ECONOMIA Y FINANZAS" in text.upper() or "EF" in norm_id:
                sector = "MINISTERIO DE ECONOMÍA Y FINANZAS"
            elif "DESARROLLO AGRARIO Y RIEGO" in text.upper() or "MIDAGRI" in text.upper():
                sector = "MINISTERIO DE DESARROLLO AGRARIO Y RIEGO"
            elif "VIVIENDA, CONSTRUCCION" in text.upper() or "MVCS" in text.upper():
                sector = "MINISTERIO DE VIVIENDA, CONSTRUCCIÓN Y SANEAMIENTO"
            elif "TRANSPORTES Y COMUNICACIONES" in text.upper() or "MTC" in text.upper():
                sector = "MINISTERIO DE TRANSPORTES Y COMUNICACIONES"
            elif "MINISTERIO DE SALUD" in text.upper() or "MINSA" in text.upper():
                sector = "MINISTERIO DE SALUD"
            elif "DEFENSA" in text.upper() or "INDECI" in text.upper():
                sector = "MINISTERIO DE DEFENSA / INDECI"
            elif "CONGRESO" in text.upper():
                sector = "CONGRESO DE LA REPÚBLICA"
            elif "PCM" in norm_id or "CONSEJO DE MINISTROS" in text.upper():
                sector = "PRESIDENCIA DEL CONSEJO DE MINISTROS"

            # 4. Título y Asunto
            title_match = re.search(r'((?:Decreto Supremo que|DECRETO DE URGENCIA QUE|Aprueban|Declaran|Prorrogan|Establecen|Autorizan|Dictan)[^\n\r\.\;]{10,250})', text, re.I)
            if title_match:
                title_str = re.sub(r'\s+', ' ', title_match.group(0).strip())
            else:
                title_str = f"Disposición oficial ante impacto del Fenómeno El Niño 2026-2027 ({f})"

            # 5. Categoría Operativa
            text_lower = text.lower()
            if "prórroga" in text_lower or "prorrogan" in text_lower or "prorroga el estado" in text_lower:
                cat = "PRÓRROGA DE ESTADO DE EMERGENCIA"
            elif "decreto de urgencia" in norm_id.lower() or "medidas extraordinarias y urgentes" in text_lower:
                cat = "DECRETO DE URGENCIA (FINANCIAMIENTO & COMPRAS C2)"
            elif "endeudamiento" in text_lower or "bid" in text_lower or "kfw" in text_lower:
                cat = "CRÉDITO Y ENDEUDAMIENTO CONTINGENTE INTERNACIONAL"
            elif "transferencia de partidas" in text_lower or "crédito suplementario" in text_lower:
                cat = "TRANSFERENCIA PRESUPUESTAL DE EMERGENCIA"
            elif "peligro inminente" in text_lower or "declara el estado de emergencia" in text_lower:
                cat = "DECLARATORIA DE ESTADO DE EMERGENCIA"
            else:
                cat = "MEDIDA REGULATORIA SECTORIAL"

            # 6. Extracción de distritos y departamentos citados
            deps_pattern = r'\b(Tumbes|Piura|Lambayeque|La Libertad|Ancash|Lima|Ica|Arequipa|Moquegua|Tacna|Cajamarca|Amazonas|San Martín|Loreto|Ucayali|Huánuco|Pasco|Junín|Huancavelica|Ayacucho|Apurímac|Cusco|Puno|Madre de Dios)\b'
            deps_found = list(set(re.findall(deps_pattern, text, re.I)))

            # Montos en Soles / Dólares si existen
            montos = re.findall(r'S/\.?\s*[\d\.,]+(?:\s*(?:millones|mil))?|US\$\s*[\d\.,]+(?:\s*(?:millones|mil))?', text)
            monto_destacado = montos[0] if montos else None

            item = {
                "id": f"leg-{i+1:02d}",
                "archivo": f,
                "norma": norm_id,
                "sector": sector,
                "fecha_publicacion": date_str,
                "categoria": cat,
                "titulo": title_str,
                "departamentos": deps_found[:6],
                "monto_referencial": monto_destacado,
                "paginas": num_pages,
                "resumen_ejecutivo": f"Norma emitida por {sector} para acciones de preparación y respuesta ante el FEN 2026-2027.",
                "facultad_principal": "Contratación directa de bienes y servicios para reducción del muy alto riesgo e intervención inmediata en cauces."
            }

            catalog.append(item)
            category_counts[cat] = category_counts.get(cat, 0) + 1
            sector_counts[sector] = sector_counts.get(sector, 0) + 1

        except Exception as e:
            print(f"Error reading {f}: {e}")

    # Guardar catálogo estructurado en JSON
    output_path = os.path.join(os.path.dirname(__file__), "..", "..", "data", "marco_legal_51_catalog.json")
    output_path = os.path.abspath(output_path)
    with open(output_path, "w", encoding="utf-8") as fp:
        json.dump({
            "total_normas": len(catalog),
            "fecha_corte": "16 de Septiembre de 2026",
            "resumen_categorias": category_counts,
            "resumen_sectores": sector_counts,
            "normas": catalog
        }, fp, indent=2, ensure_ascii=False)

    print(f"\n[OK] Catalogo guardado exitosamente en: {output_path}")
    print("\nDesglose por Categorias:")
    for c, count in category_counts.items():
        print(f" - {c}: {count} normas")
    print("\nDesglose por Sectores:")
    for s, count in sector_counts.items():
        print(f" - {s}: {count} normas")

if __name__ == "__main__":
    parse_all_norms()
