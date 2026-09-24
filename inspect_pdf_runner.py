import os
import sys
from pypdf import PdfReader

pdf_path = "data/SIGRID~1/21362_~1.PDF"
print(f"Reading: {pdf_path}")
reader = PdfReader(pdf_path)
total = len(reader.pages)
print(f"Total pages: {total}")

out_path = r"C:\Users\Usuario Libre\.gemini\antigravity-ide\brain\6e69dcac-42ba-498f-bafb-519aaa3568c6\scratch\extracted_plan_21362.txt"
os.makedirs(os.path.dirname(out_path), exist_ok=True)

with open(out_path, "w", encoding="utf-8") as out:
    out.write(f"DOCUMENTO: Plan de Prevencion y Reduccion de Desastres - Eduardo Villanueva 2025-2030 (SIGRID 21362)\n")
    out.write(f"TOTAL PAGINAS: {total}\n\n")
    
    for i in range(total):
        txt = reader.pages[i].extract_text() or ""
        out.write(f"\n--- [PAGINA {i+1}] ---\n")
        out.write(txt)
        out.write("\n")

print(f"Successfully extracted all 194 pages to {out_path}!")
print("File size:", os.path.getsize(out_path))
