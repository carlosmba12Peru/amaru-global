import os

txt_path = r"C:\Users\Usuario Libre\.gemini\antigravity-ide\brain\6e69dcac-42ba-498f-bafb-519aaa3568c6\scratch\extracted_plan_21362.txt"

with open(txt_path, "r", encoding="utf-8") as f:
    text = f.read()

pages = text.split("--- [PAGINA ")

def get_page(num):
    for p in pages:
        if p.startswith(f"{num}] ---"):
            return p
    return ""

out_summary_path = r"C:\Users\Usuario Libre\.gemini\antigravity-ide\brain\6e69dcac-42ba-498f-bafb-519aaa3568c6\scratch\deep_dive_cajamarca_plan.txt"

with open(out_summary_path, "w", encoding="utf-8") as out:
    out.write("=== 1. MARCO INSTITUCIONAL Y LEGAL (PAGS 1-4, 48-52) ===\n")
    for p in [2, 3, 49, 50, 51]:
        out.write(f"\n--- PAGINA {p} ---\n")
        out.write(get_page(p))

    out.write("\n=== 2. HISTORIAL Y EJECUCION PP 0068 (PAGS 58-61) ===\n")
    for p in [58, 59, 60, 61]:
        out.write(f"\n--- PAGINA {p} ---\n")
        out.write(get_page(p))

    out.write("\n=== 3. DIAGNOSTICO DE RIESGO Y VULNERABILIDAD (PAGS 76, 80, 85, 90) ===\n")
    for p in [76, 80, 85, 90]:
        out.write(f"\n--- PAGINA {p} ---\n")
        out.write(get_page(p))

    out.write("\n=== 4. MEDIDAS ESTRUCTURALES Y NO ESTRUCTURALES (PAGS 102-108) ===\n")
    for p in [102, 103, 104, 105, 106, 107, 108]:
        out.write(f"\n--- PAGINA {p} ---\n")
        out.write(get_page(p))

    out.write("\n=== 5. PROGRAMACION DE INVERSIONES Y PRESUPUESTO (PAGS 120-130) ===\n")
    for p in [120, 121, 122, 124, 125, 126]:
        out.write(f"\n--- PAGINA {p} ---\n")
        out.write(get_page(p))

    out.write("\n=== 6. FICHAS TECNICAS CEDROCUCHO Y YUNGUILLA (PAGS 137-142) ===\n")
    for p in [137, 138, 139, 140, 141]:
        out.write(f"\n--- PAGINA {p} ---\n")
        out.write(get_page(p))

print(f"Deep dive extracts saved to {out_summary_path}")
print("Size:", os.path.getsize(out_summary_path))
