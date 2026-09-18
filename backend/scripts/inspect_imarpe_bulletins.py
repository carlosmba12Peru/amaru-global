import os
import sys
import pypdf

sys.stdout.reconfigure(encoding='utf-8')

data_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data", "Reporte de Imarpe diario", "Set-2026")
if not os.path.exists(data_dir):
    # Probar desde raíz
    data_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "data", "Reporte de Imarpe diario", "Set-2026")

files = sorted([f for f in os.listdir(data_dir) if f.endswith(".pdf")])
print(f"Archivos encontrados: {len(files)}")
for f in files:
    print(f" - {f}")

sample_file = os.path.join(data_dir, files[-1])
print(f"\n--- Analizando archivo más reciente: {files[-1]} ---")
reader = pypdf.PdfReader(sample_file)
print(f"Total de páginas: {len(reader.pages)}")

for i, page in enumerate(reader.pages):
    print(f"\n==================== PÁGINA {i+1} ====================")
    text = page.extract_text()
    lines = [line.strip() for line in text.splitlines() if line.strip()]
    for line in lines[:35]:
        print(f"  {line}")
