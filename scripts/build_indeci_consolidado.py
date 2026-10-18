import os, glob, pypdf, re, json
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
data_pdf_folder = BASE_DIR / "data" / "Incendios forestales" / "indeci coen"
output_file = BASE_DIR / "backend" / "data" / "indeci_coen_consolidado.json"

pdf_files = list(data_pdf_folder.glob("*.pdf"))
print(f"Total PDFs encontrados: {len(pdf_files)}")

reports = []

for f in pdf_files:
    fname = f.name
    if "INCENDIO-FORESTAL" not in fname:
        continue
    try:
        reader = pypdf.PdfReader(str(f))
        pages_text = [p.extract_text() or "" for p in reader.pages[:3]]
        full = "\n".join(pages_text)
        
        rep_m = re.search(r'REPORTE\s+(COMPLEMENTARIO|PRELIMINAR)\s+N[.°º\s]+([0-9]+)', full, re.IGNORECASE)
        tipo_rep = rep_m.group(1).upper() if rep_m else "COMPLEMENTARIO"
        num_rep = rep_m.group(2) if rep_m else "S/N"
        
        fech_m = re.search(r'(\d{1,2}/\d{1,2}/2026)', full)
        fecha_rep = fech_m.group(1) if fech_m else "18/10/2026"
        
        sinpad_m = re.search(r'SINPAD\s*[:\s]*([0-9]{5,7})', full)
        sinpad = sinpad_m.group(1) if sinpad_m else None
        
        m_fn = re.search(r'INCENDIO-FORESTAL-EN-EL-DISTRITO-DE-(.+?)-([A-ZÁÉÍÓÚÑ]+)(?:-|\.)', fname)
        dist_fn = m_fn.group(1).replace("-", " ").strip().upper() if m_fn else ""
        dpto_fn = m_fn.group(2).strip().upper() if m_fn else ""
        
        low = full.lower()
        if "se encuentra extinguido" in low or "incendio extinguido" in low or "extinguido" in low[:600]:
            estado = "EXTINGUIDO"
        elif "se encuentra controlado" in low or "incendio controlado" in low:
            estado = "CONTROLADO"
        elif "se encuentra activo" in low or "incendio activo" in low or "activo" in low[:600]:
            estado = "ACTIVO"
        else:
            estado = "EN_EVALUACION"
            
        ha_m = re.findall(r'(\d+(?:\.\d+)?)\s*(?:ha|hect[aá]reas)', low)
        has = [float(h) for h in ha_m if float(h) > 0 and float(h) < 50000]
        ha_max = max(has) if has else 0.0
        
        comunidades = []
        com_m = re.search(r'(?:comunidades?\s+nativas?|sectores?|anexos?)\s+de\s+([^\.]+?)(?:,|\.|\s+distrito)', full, re.IGNORECASE)
        if com_m:
            comunidades = [c.strip() for c in re.split(r',|y\s+', com_m.group(1)) if len(c.strip()) > 2][:4]
            
        apoyo_aereo = bool(re.search(r'(?:helic[oó]ptero|avi[oó]n|fap|fuerza\s+[aá]rea|ej[eé]rcito)', low))
        
        reports.append({
            "archivo": fname,
            "tipo_reporte": tipo_rep,
            "numero_reporte": num_rep,
            "fecha_reporte": fecha_rep,
            "distrito": dist_fn,
            "departamento": dpto_fn,
            "sinpad": sinpad,
            "estado_terreno": estado,
            "hectareas_estimadas": ha_max,
            "comunidades": comunidades,
            "apoyo_aereo": apoyo_aereo,
            "fuente_url": "https://portal.indeci.gob.pe/informe/reportes-preliminares-complementarios-emergencias/"
        })
    except Exception as e:
        print(f"Error procesando {fname}: {e}")

output_file.parent.mkdir(parents=True, exist_ok=True)
with open(output_file, "w", encoding="utf-8") as out:
    json.dump(reports, out, indent=2, ensure_ascii=False)

print(f"Procesados {len(reports)} reportes de incendios con éxito.")
print(f"Guardado en {output_file}")
