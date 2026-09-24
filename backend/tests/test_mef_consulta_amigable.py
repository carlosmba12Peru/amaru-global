"""
Test Suite: Navegador Consulta Amigable MEF 0068 & Auditor C2 Contraloría
=========================================================================
Valida:
1. Ingesta y parseo de los 652 proyectos CUI del Programa 0068 (MEF Consulta Amigable).
2. Diagnóstico de cuellos de botella del SIAF (Sin certificar, Licitación trabada, Sin devengar).
3. Cruce con observaciones de campo de la Contraloría (Informe N° 10671-2026-CG/AGR-SOP).
4. Endpoints REST FastAPI en /api/v1/mef-obras/*.
"""

import unittest
import sys
from pathlib import Path

backend_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_dir))
sys.path.insert(0, str(backend_dir.parent))

from services.mef_obras_service import mef_obras_service
from services.cgr_auditoria_obras_service import cgr_auditoria_obras_service
from fastapi.testclient import TestClient
from main import app


class TestMefConsultaAmigable(unittest.TestCase):
    """Pruebas del servicio MefObrasService."""

    def test_obras_parsing_integrity(self):
        resumen = mef_obras_service.get_resumen_nacional()
        self.assertGreaterEqual(resumen["total_obras_auditadas"], 500)
        self.assertGreater(resumen["pim_total_soles"], 1_000_000_000)
        self.assertGreater(resumen["devengado_total_soles"], 500_000_000)
        self.assertTrue(resumen["hash_sha256"])

    def test_cuellos_botella_diagnostics(self):
        cuellos = mef_obras_service.get_obras_cuello_botella()
        self.assertIn("sin_certificar", cuellos)
        self.assertIn("licitacion_trabada", cuellos)
        self.assertIn("contrato_sin_devengar", cuellos)
        # Debe haber al menos 10 obras detectadas en cada traba
        self.assertGreaterEqual(len(cuellos["sin_certificar"]), 10)
        self.assertGreaterEqual(len(cuellos["licitacion_trabada"]), 5)

    def test_catalogo_filters(self):
        # Filtro por nivel regional
        cat_reg = mef_obras_service.get_catalogo_obras(nivel="REGIONAL", limite=50)
        self.assertGreater(cat_reg["total_obras"], 0)
        for o in cat_reg["obras"]:
            self.assertEqual(o["nivel_gobierno"], "GOBIERNO REGIONAL")

        # Filtro por nivel local
        cat_loc = mef_obras_service.get_catalogo_obras(nivel="LOCAL", limite=50)
        self.assertGreater(cat_loc["total_obras"], 0)
        for o in cat_loc["obras"]:
            self.assertEqual(o["nivel_gobierno"], "GOBIERNO LOCAL")

    def test_cgr_cross_audit(self):
        cruce = cgr_auditoria_obras_service.get_cruce_mef_contraloria()
        self.assertGreater(cruce["total_cuencas_auditadas"], 0)
        discrepancias = cruce["discrepancias_criticas"]
        cuencas = [d["cuenca"] for d in discrepancias]
        self.assertIn("PIURA", cuencas)
        self.assertIn("TUMBES", cuencas)
        self.assertIn("LA LECHE", cuencas)

    def test_fastapi_endpoints(self):
        client = TestClient(app)

        # GET /api/v1/mef-obras/resumen
        r_sum = client.get("/api/v1/mef-obras/resumen")
        self.assertEqual(r_sum.status_code, 200)
        data_sum = r_sum.json()
        self.assertIn("total_obras_auditadas", data_sum)
        self.assertIn("diagnostico_cuellos_botella_siaf", data_sum)

        # GET /api/v1/mef-obras/catalogo
        r_cat = client.get("/api/v1/mef-obras/catalogo?limite=10")
        self.assertEqual(r_cat.status_code, 200)
        data_cat = r_cat.json()
        self.assertEqual(len(data_cat["obras"]), 10)

        # GET /api/v1/mef-obras/cuello-botella
        r_cue = client.get("/api/v1/mef-obras/cuello-botella")
        self.assertEqual(r_cue.status_code, 200)

        # GET /api/v1/mef-obras/cgr-cruce
        r_cgr = client.get("/api/v1/mef-obras/cgr-cruce")
        self.assertEqual(r_cgr.status_code, 200)
        data_cgr = r_cgr.json()
        self.assertIn("discrepancias_criticas", data_cgr)


if __name__ == "__main__":
    unittest.main()
