# backend/scripts/inspect_renalio.py
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

def inspect_tomo(path, name):
    print("=" * 80)
    print(f"ANALIZANDO: {name}")
    print(f"Ruta: {path}")
    if not os.path.exists(path):
        print(f"ERROR: Archivo no encontrado en {path}")
        return

    size_mb = os.path.getsize(path) / (1024 * 1024)
    print(f"Tamaño: {size_mb:.2f} MB")

    reader = pypdf.PdfReader(path)
    total_pages = len(reader.pages)
    print(f"Total de Páginas: {total_pages}")

    # Verificar bookmarks / outline
    try:
        outline = reader.outline
        print(f"\n--- ÍNDICE / BOOKMARKS DETECTADOS EN {name} ---")
        def print_outline(elem, depth=0):
            if isinstance(elem, list):
                for sub in elem:
                    print_outline(sub, depth)
            elif hasattr(elem, 'title'):
                page_num = reader.get_destination_page_number(elem) if hasattr(reader, 'get_destination_page_number') else '?'
                print("  " * depth + f"• {elem.title} (pág {page_num})")
            elif isinstance(elem, dict) and '/Title' in elem:
                print("  " * depth + f"• {elem.get('/Title')}")
        if outline:
            print_outline(outline[:40])
        else:
            print("No se encontraron bookmarks embebidos.")
    except Exception as e:
        print(f"Error extrayendo outline: {e}")

    # Revisar las primeras 25 páginas para encontrar el Sumario / Índice
    print(f"\n--- BÚSQUEDA DE ÍNDICE / SUMARIO EN LAS PRIMERAS 20 PÁGINAS ---")
    for idx in range(min(20, total_pages)):
        text = reader.pages[idx].extract_text() or ""
        lines = [l.strip() for l in text.splitlines() if l.strip()]
        if any(term in text.lower() for term in ["índice", "contenido", "sumario", "presentación", "lenguas"]):
            print(f"\n[Página {idx+1}] Muestra:")
            for l in lines[:15]:
                print(f"  {l}")

if __name__ == "__main__":
    inspect_tomo(tomo1_path, "RENALIO Tomo I (Lenguas Andinas)")
    inspect_tomo(tomo2_path, "RENALIO Tomo II (Lenguas Amazónicas)")
