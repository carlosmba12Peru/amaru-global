import urllib.request
import re
import json

headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}

print("=== INSPECTING SIOFEN BDO ===")
try:
    req = urllib.request.Request('https://siofen.imarpe.gob.pe/boletines-e-informes/BDO', headers=headers)
    html = urllib.request.urlopen(req, timeout=12).read().decode('utf-8', errors='ignore')
    
    # Buscar links a pdfs
    pdf_links = re.findall(r'href=[\'"]([^\'"]+?\.pdf[^\'"]*?)[\'"]', html, re.I)
    print(f"Total PDFs encontrados: {len(pdf_links)}")
    for p in pdf_links[:5]:
        print("PDF:", p)
        
    # Buscar enlaces a BDO o fechas
    bdo_matches = re.findall(r'(\d{4}[-/]\d{2}[-/]\d{2}|BDO[^\s<"\']+)', html)
    print(f"Menciones BDO/Fechas: {len(bdo_matches)}")
    print(bdo_matches[:10])
except Exception as e:
    print(f"Error SIOFEN: {e}")

print("\n=== INSPECTING ENFEN ===")
try:
    req2 = urllib.request.Request('https://enfen.imarpe.gob.pe/', headers=headers)
    html2 = urllib.request.urlopen(req2, timeout=12).read().decode('utf-8', errors='ignore')
    
    pdf_links2 = re.findall(r'href=[\'"]([^\'"]+?\.pdf[^\'"]*?)[\'"]', html2, re.I)
    print(f"Total PDFs encontrados en ENFEN: {len(pdf_links2)}")
    for p in pdf_links2[:5]:
        print("ENFEN PDF:", p)
        
    comunicados = re.findall(r'(Comunicado Oficial[^\n<]+|Alerta de El Ni[ñn]o[^\n<]+)', html2, re.I)
    print(f"Menciones Comunicados: {len(comunicados)}")
    for c in comunicados[:5]:
        print("Comunicado:", c.strip())
except Exception as e:
    print(f"Error ENFEN: {e}")
