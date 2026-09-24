import os
import re

txt_path = r"C:\Users\Usuario Libre\.gemini\antigravity-ide\brain\6e69dcac-42ba-498f-bafb-519aaa3568c6\scratch\extracted_plan_21362.txt"

with open(txt_path, "r", encoding="utf-8") as f:
    lines = f.readlines()

print(f"Total lines: {len(lines)}")

# Let's find pages where specific sections start
section_hits = []
current_page = 1

for idx, line in enumerate(lines):
    m = re.match(r"--- \[PAGINA (\d+)\] ---", line)
    if m:
        current_page = int(m.group(1))
        
    line_u = line.upper()
    keywords = [
        "RESOLUCIÓN", "ORDENANZA", "PRESENTACIÓN", "INTRODUCCIÓN",
        "OBJETIVO GENERAL", "OBJETIVOS ESPECÍFICOS",
        "CAPÍTULO I", "CAPÍTULO II", "CAPÍTULO III", "CAPÍTULO IV", "CAPÍTULO V", "CAPÍTULO VI",
        "EVALUACIÓN DEL PELIGRO", "ANÁLISIS DE VULNERABILIDAD", "CÁLCULO DEL RIESGO",
        "MEDIDAS ESTRUCTURALES", "MEDIDAS NO ESTRUCTURALES",
        "CEDROCUCHO", "YUNGUILLA", "AGUAS CALIENTES", "LA GRAMA",
        "MATRIZ DE ACCIONES", "MATRIZ DEL PLAN", "PRESUPUESTO TOTAL",
        "PROGRAMA PRESUPUESTAL 0068", "FONDES", "CRONOGRAMA"
    ]
    for kw in keywords:
        if kw in line_u:
            section_hits.append((current_page, kw, line.strip()[:100]))

print(f"Total section hits: {len(section_hits)}")

# Filter unique page-keyword
seen = set()
unique_hits = []
for p, kw, sample in section_hits:
    if (p, kw) not in seen:
        seen.add((p, kw))
        unique_hits.append((p, kw, sample))

out_analysis = r"C:\Users\Usuario Libre\.gemini\antigravity-ide\brain\6e69dcac-42ba-498f-bafb-519aaa3568c6\scratch\plan_index_hits.txt"
with open(out_analysis, "w", encoding="utf-8") as out:
    for p, kw, sample in unique_hits:
        out.write(f"PAG {p:3d} | {kw:25s} | {sample}\n")

print(f"Saved {len(unique_hits)} unique section hits to {out_analysis}")
