# backend/scripts/extract_renalio_details.py
import sys
import os
import pypdf

if sys.stdout.encoding != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

data_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "data"))
tomo1_path = os.path.join(data_dir, "RENALIO Tomo I – Lenguas Andinas - alta calidad.pdf")
tomo2_path = os.path.join(data_dir, "RENALIO Tomo II – Lenguas Amazonicas - alta calidad.pdf")

def analyze_tomo1():
    reader = pypdf.PdfReader(tomo1_path)
    print("=" * 80)
    print("DETALLES DE TOMO I (LENGUAS ANDINAS)")
    print("=" * 80)
    # Extraer páginas 5 a 15 (índice general)
    for p in range(4, 15):
        txt = reader.pages[p].extract_text() or ""
        for line in txt.splitlines():
            line_s = line.strip()
            if any(term in line_s.lower() for term in ["aimara", "aymara", "quechua", "jaqaru", "kawki", "lenguas vigentes", "lenguas extintas", "mapa", "tabla"]):
                print(f"  [p.{p+1}] {line_s}")

def analyze_tomo2():
    reader = pypdf.PdfReader(tomo2_path)
    print("\n" + "=" * 80)
    print("DETALLES DE TOMO II (LENGUAS AMAZÓNICAS)")
    print("=" * 80)
    # Extraer páginas 5 a 15 (índice general)
    for p in range(2, 14):
        txt = reader.pages[p].extract_text() or ""
        for line in txt.splitlines():
            line_s = line.strip()
            if any(term in line_s.lower() for term in ["achuar", "ashaninka", "asheninka", "awajun", "matsigenka", "shipibo", "wampis", "shawi", "kukama", "ticuna", "yine", "yanesha", "tabla", "mapa"]):
                print(f"  [p.{p+1}] {line_s}")

if __name__ == "__main__":
    analyze_tomo1()
    analyze_tomo2()
