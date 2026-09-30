import unittest
import sys
from pathlib import Path

backend_dir = Path(__file__).resolve().parent.parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from fastapi.testclient import TestClient
from main import app

class TestPredictiveEAPEndpoints(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(app)

    def test_predictive_matrix_7days(self):
        """Verifica que la matriz de 7 días devuelva los 893 distritos del D.S. 124-2026-PCM."""
        response = self.client.get("/api/predictivo/matriz-7dias?days=7&mode=SIMULACION&limit=10")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("metadata", data)
        self.assertIn("124-2026-PCM", data["metadata"]["norma_habilitante"])
        self.assertEqual(data["estadisticas"]["total_distritos_declarados_ds124"], 893)
        self.assertEqual(len(data["fechas_horizonte"]), 7)
        self.assertEqual(len(data["distritos"]), 10)

        # Verificar estructura del primer distrito
        dist = data["distritos"][0]
        self.assertIn("pronostico_7dias", dist)
        self.assertEqual(len(dist["pronostico_7dias"]), 7)
        self.assertIn("protocolos_eap", dist)
        eap = dist["protocolos_eap"]
        self.assertIn("T_144h", eap)
        self.assertIn("T_72h", eap)
        self.assertIn("T_24h", eap)
        self.assertIn("acciones_mandatadas", eap["T_144h"])
        self.assertIn("acciones_mandatadas", eap["T_72h"])
        self.assertIn("acciones_mandatadas", eap["T_24h"])

    def test_predictive_district_eap_detail(self):
        """Verifica el expediente predictivo distrital y cubicaje logístico (Catacaos - 200105)."""
        response = self.client.get("/api/predictivo/distrito/200105/eap?mode=SIMULACION")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["distrito_perfil"]["ubigeo"], "200105")
        self.assertIn("CATACAOS", data["distrito_perfil"]["distrito"].upper())
        logistica = data["logistica_anticipada_requerida"]
        self.assertGreaterEqual(logistica["camiones_10tm_preposicionamiento"], 1)
        self.assertGreaterEqual(logistica["motobombas_4_pulgadas"], 1)
        self.assertIn("checklist_intervencion_eap", data)
        self.assertEqual(len(data["checklist_intervencion_eap"]), 6)

    def test_detonar_eap_with_sha256(self):
        """Verifica que la detonación de una alerta EAP genere sello de integridad SHA-256."""
        payload = {
            "ubigeo": "200105",
            "fase_lead_time": "T-144h",
            "autorizador": "Comandante General COEN / Alcalde Catacaos",
            "observaciones": "Pre-posicionamiento terrestre urgente antes del corte de puentes Bolognesi e Independencia"
        }
        response = self.client.post("/api/predictivo/detonar-eap", json=payload)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("despacho", data)
        despacho = data["despacho"]
        self.assertEqual(despacho["fase_lead_time"], "T-144h")
        self.assertEqual(len(despacho["hash_integridad_sha256"]), 64)  # Longitud SHA-256
        self.assertEqual(despacho["estado"], "EJECUTADO_Y_TRANSMITIDO_C2")
        self.assertIn("124-2026-PCM", despacho["norma_invocada"])

    def test_cuencas_eap_summary(self):
        """Verifica el resumen de cuencas estratégicas y estatus EAP."""
        response = self.client.get("/api/predictivo/cuencas-eap-resumen?mode=SIMULACION")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertGreaterEqual(data["total_cuencas"], 10)
        self.assertGreaterEqual(len(data["cuencas"]), 10)
        self.assertTrue(any("PIURA" in c["nombre"].upper() for c in data["cuencas"]))

if __name__ == "__main__":
    unittest.main()
