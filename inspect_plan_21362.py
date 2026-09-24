import os
from pathlib import Path
from pypdf import PdfReader

def inspect_pdf():
    data_dir = Path("data")
    target_folder = None
    for p in data_dir.iterdir():
        if p.is_dir() and "SIGRID" in p.name:
            target_folder = p
            break
            
    pdf_path = list(target_folder.glob("*21362*"))
    if not pdf_path:
        print("PDF 21362 not found yet.")
        return
        
    pdf_file = pdf_path[0]
    print(f"Opening: {pdf_file.name} ({pdf_file.stat().st_size / (1024*1024):.2f} MB)")
    
    reader = PdfReader(str(pdf_file))
    num_pages = len(reader.pages)
    print(f"Total Pages: {num_pages}")
    
    # Extract outlines / TOC if available
    try:
        outline = reader.outline
        print("Outline structure found:", len(outline))
    except Exception as e:
        print("No outline structure:", e)
        
    # Search for key sections
    key_terms = [
        "OBJETIVO", "DIAGNÓSTICO", "PELIGRO", "VULNERABILIDAD", "RIESGO",
        "MEDIDAS ESTRUCTURALES", "MEDIDAS NO ESTRUCTURALES",
        "PRESUPUESTO", "FINANCIAMIENTO", "PROGRAMA PRESUPUESTAL 0068",
        "CEDROCUCHO", "YUNGUILLA", "CRISNEJAS", "AGUAS CALIENTES",
        "MATRIZ", "CRONOGRAMA", "INVERSIÓN"
    ]
    
    summary_findings = []
    
    # Sample pages or search
    for idx, page in enumerate(reader.pages):
        text = page.extract_text() or ""
        text_upper = text.upper()
        for term in key_terms:
            if term in text_upper:
                summary_findings.append((idx + 1, term))
                
    print(f"Total term occurrences across pages: {len(summary_findings)}")
    
    # Let's save a summary of pages with text
    with open("plan_21362_extracted_summary.txt", "w", encoding="utf-8") as out:
        out.write(f"DOCUMENTO: {pdf_file.name}\n")
        out.write(f"PAGINAS: {num_pages}\n\n")
        
        # Extract first 15 pages (Executive summary, TOC, intro)
        out.write("=== PRIMERAS 15 PAGINAS (INTRODUCCION / RESUMEN / INDICE) ===\n")
        for i in range(min(15, num_pages)):
            txt = reader.pages[i].extract_text() or ""
            out.write(f"\n--- PAGINA {i+1} ---\n")
            out.write(txt[:2500] + "\n")
            
        # Extract pages that mention "MATRIZ" or "PRESUPUESTO" or "PROGRAMA PRESUPUESTAL" or "CEDROCUCHO"
        out.write("\n=== PAGINAS CON MATRIZ DE ACCIONES / PRESUPUESTO / PUNTOS CRITICOS ===\n")
        saved_pages = set(range(min(15, num_pages)))
        for i, page in enumerate(reader.pages):
            if i in saved_pages:
                continue
            txt = page.extract_text() or ""
            txt_u = txt.upper()
            if any(k in txt_u for k in ["MATRIZ DE MEDIDAS", "MATRIZ DE ACCIONES", "MEDIDAS ESTRUCTURALES", "CEDROCUCHO", "YUNGUILLA", "PRESUPUESTO ESTIMADO", "PLAN DE ACCIÓN", "FONDES"]):
                out.write(f"\n--- PAGINA {i+1} ---\n")
                out.write(txt[:3000] + "\n")
                saved_pages.add(i)

    print("Summary written to plan_21362_extracted_summary.txt")

if __name__ == "__main__":
    inspect_pdf()
