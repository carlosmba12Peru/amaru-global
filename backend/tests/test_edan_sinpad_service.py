"""
Pruebas Unitarias para el Servicio Oficial EDAN SINPAD v2 (Fase 3)
AMARU-CLIMATE - Lab4
"""

import unittest
import sys
from pathlib import Path

backend_dir = Path(__file__).resolve().parent.parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from services.edan_sinpad_service import edan_sinpad_service

class TestEdanSinpadService(unittest.TestCase):
    def setUp(self):
        self.service = edan_sinpad_service

    def test_plantilla_catacaos_prellenada(self):
        # UBIGEO 200105 = Catacaos (Piura)
        plantilla = self.service.generar_plantilla("200105")
        self.assertEqual(plantilla["ubigeo"], "200105")
        self.assertEqual(plantilla["distrito"], "Catacaos")
        self.assertEqual(plantilla["departamento"], "Piura")
        self.assertIn("alcalde", plantilla)
        self.assertIn("formulario_1_evaluacion_rapida", plantilla)
        self.assertGreaterEqual(len(plantilla["formulario_2a_familias"]), 3)
        self.assertIn("formulario_2b_medios_vida", plantilla)

    def test_evaluacion_consistencia_anti_error_bae(self):
        plantilla = self.service.generar_plantilla("200105")
        eval_cgr = self.service.evaluar_consistencia_legal(plantilla)
        self.assertIn("puntaje_consistencia_pct", eval_cgr)
        self.assertGreaterEqual(eval_cgr["puntaje_consistencia_pct"], 80)
        self.assertGreaterEqual(eval_cgr["familias_elegibles_bono_bae"], 1)
        self.assertTrue(eval_cgr["seguro_agricola_sac_activable"])

    def test_generar_ficha_oficial_y_disparo_cgr(self):
        plantilla = self.service.generar_plantilla("200105")
        res = self.service.generar_ficha_oficial(plantilla, token_autoridad="TOKEN-TEST-ALCALDE-2026")
        self.assertTrue(res["exito"])
        self.assertTrue(res["edan_id"].startswith("EDAN-"))
        self.assertTrue(res["codigo_sinpad"].startswith("SINPAD-"))
        self.assertEqual(len(res["hash_sha256"]), 64)
        self.assertIn("disparo_contraloria", res)
        self.assertTrue(res["disparo_contraloria"]["registro_cgr_id"].startswith("CGR-DISPARO-"))

    def test_generacion_pdf_con_qr(self):
        plantilla = self.service.generar_plantilla("200105")
        res = self.service.generar_ficha_oficial(plantilla)
        pdf_bytes = self.service.generar_pdf_oficial_bytes(res["edan_id"])
        self.assertIsNotNone(pdf_bytes)
        self.assertGreater(len(pdf_bytes), 5000, "El PDF oficial debe contener al menos 5KB")
        # Verificar firma de archivo PDF (%PDF)
        self.assertTrue(pdf_bytes.startswith(b"%PDF"))

    def test_exportacion_payload_sinpad(self):
        plantilla = self.service.generar_plantilla("200105")
        res = self.service.generar_ficha_oficial(plantilla)
        payload = self.service.exportar_payload_sinpad(res["edan_id"])
        self.assertIsNotNone(payload)
        self.assertEqual(payload["version_schema"], "SINPAD_V2_2026_HOMOLOGADO")
        self.assertIn("cabecera_emergencia", payload)
        self.assertIn("padron_familiar_f2a", payload)
        self.assertIn("medios_vida_f2b", payload)
        self.assertIn("seguridad_criptografica", payload)

if __name__ == "__main__":
    unittest.main()
