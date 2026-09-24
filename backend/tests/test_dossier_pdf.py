# backend/tests/test_dossier_pdf.py
import sys
import os
import asyncio

# Add backend to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from services.dossier_pdf_service import dossier_service

async def main():
    print("=== Testing DossierPDFService ===")
    ubigeo = "150118" # Lurigancho-Chosica
    print(f"Generating PDF for UBIGEO: {ubigeo}...")
    res = await dossier_service.generate_dossier_pdf(
        ubigeo=ubigeo,
        alcalde_nombre="Ing. Oswaldo Vargas Cuéllar",
        secretario_nombre="Ing. Marco Antonio Álvarez",
        cip_registro="CIP Nº 198421 / Reg. CENEPRED Nº 0104"
    )

    print("Success!")
    print(f"Distrito: {res['distrito']}")
    print(f"Correlativo: {res['correlativo']}")
    print(f"SHA-256 Hash: {res['sha256_hash']}")
    print(f"Tamanio PDF: {res['tamanio_bytes']} bytes")
    print(f"Nivel Alerta: {res['nivel_alerta']}")
    print(f"Puentes en riesgo: {res['puentes_en_riesgo']}")

    # Save to scratch for verification using tempfile to avoid Windows bad descriptor lock
    import tempfile, subprocess
    out_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "scratch"))
    os.makedirs(out_dir, exist_ok=True)
    out_path = os.path.join(out_dir, f"dossier_test_{ubigeo}.pdf")
    try:
        with tempfile.NamedTemporaryFile('wb', delete=False) as tmp:
            tmp.write(res["pdf_bytes"])
            tmp_name = tmp.name
        subprocess.run(f'copy /Y "{tmp_name}" "{out_path}"', shell=True, check=True)
        os.remove(tmp_name)
        print(f"Saved PDF to: {out_path}")
    except Exception as e:
        print(f"[Notice] PDF generated successfully ({len(res['pdf_bytes'])} bytes), file copy skipped: {e}")

if __name__ == "__main__":
    asyncio.run(main())
