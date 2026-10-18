import os, glob, pypdf, re, json

folder = r'c:\Users\Usuario Libre\Documents\recuperacion de USB 14 de setiembre\curso-gcp-google-adk-01\Lab4\data\Incendios forestales\indeci coen'
files = glob.glob(os.path.join(folder, '*.pdf'))

events = []
for f in files:
    fname = os.path.basename(f)
    if 'INCENDIO-FORESTAL' not in fname:
        continue
    try:
        reader = pypdf.PdfReader(f)
        text0 = reader.pages[0].extract_text() or ''
        text1 = reader.pages[1].extract_text() or '' if len(reader.pages) > 1 else ''
        full_head = text0 + '\n' + text1
        
        rep_match = re.search(r'REPORTE\s+(?:COMPLEMENTARIO|PRELIMINAR)\s+N[.°º]+\s*([0-9]+)', full_head)
        rep_num = rep_match.group(1) if rep_match else '?'
        
        # Parse from filename if possible: INCENDIO-FORESTAL-EN-EL-DISTRITO-DE-(...)-(DPTO)
        m_file = re.search(r'INCENDIO-FORESTAL-EN-EL-DISTRITO-DE-(.+?)-([A-ZÁÉÍÓÚÑ]+)(?:-|\.)', fname)
        dist_fn = m_file.group(1).replace('-', ' ') if m_file else ''
        dpto_fn = m_file.group(2) if m_file else ''
        
        # Check estado
        low = full_head.lower()
        if 'se encuentra extinguido' in low or 'incendio extinguido' in low:
            estado = 'EXTINGUIDO'
        elif 'se encuentra controlado' in low or 'incendio controlado' in low:
            estado = 'CONTROLADO'
        elif 'se encuentra activo' in low or 'incendio activo' in low:
            estado = 'ACTIVO'
        else:
            estado = 'NO_ESPECIFICADO'
            
        # Check danos
        has_danos_salud = 'daños a la vida y a la salud' in low and 'no se reportan' not in low
        sinpad_m = re.search(r'SINPAD\s*[:\s]*([0-9]{5,7})', full_head)
        sinpad = sinpad_m.group(1) if sinpad_m else None
        
        events.append({
            'archivo': fname,
            'reporte': rep_num,
            'distrito': dist_fn,
            'departamento': dpto_fn,
            'estado_terreno': estado,
            'sinpad': sinpad,
            'paginas': len(reader.pages)
        })
    except Exception as e:
        events.append({'archivo': fname, 'error': str(e)})

print(f"Total reportes evaluados: {len(events)}")
dptos = {}
for e in events:
    dp = e.get('departamento', 'DESCONOCIDO')
    dptos[dp] = dptos.get(dp, 0) + 1

print("Distribucion por Departamento:")
for k, v in sorted(dptos.items(), key=lambda x: x[1], reverse=True):
    print(f"  - {k}: {v}")

out_path = os.path.join(r'c:\Users\Usuario Libre\Documents\recuperacion de USB 14 de setiembre\curso-gcp-google-adk-01\Lab4\data', 'indeci_parsed_summary.json')
with open(out_path, 'w', encoding='utf-8') as out:
    json.dump(events, out, indent=2, ensure_ascii=False)
print("Resumen guardado en:", out_path)
