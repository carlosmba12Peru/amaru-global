"""
Pruebas de Integración de Endpoints REST de Logística Humanitaria (Fase 2)
AMARU-CLIMATE - Lab4
"""

import unittest
from fastapi.testclient import TestClient
import main

class TestLogisticaEndpoints(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(main.app)

    def test_get_catalogo(self):
        resp = self.client.get("/api/v1/logistica/catalogo")
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertIn("almacenes_indeci", data)
        self.assertIn("albergues_destinos", data)
        self.assertIn("flota_vehiculos", data)
        self.assertIn("puentes_criticos", data)
        self.assertGreaterEqual(len(data["almacenes_indeci"]), 7)
        self.assertGreaterEqual(len(data["albergues_destinos"]), 12)

    def test_get_red_vial(self):
        resp = self.client.get("/api/v1/logistica/red-vial")
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertIn("nodos", data)
        self.assertIn("aristas", data)
        self.assertGreater(data["total_nodos"], 15)

    def test_post_calcular_ruta_normal(self):
        payload = {
            "origen_id": "ALM-LIMA-CENTRAL",
            "destino_id": "ALB-VIRU-VICTORRAUL",
            "tipo_vehiculo": "CAMION_PESADO_15T",
            "puentes_cortados": []
        }
        resp = self.client.post("/api/v1/logistica/calcular-ruta", json=payload)
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertEqual(data["estado_conectividad"], "TRANSITO_EXPEDITO_NORMAL")
        self.assertFalse(data["requiere_puente_aereo_ffaa"])
        self.assertIn("ruta_efectiva", data)
        self.assertGreater(data["ruta_efectiva"]["distancia_total_km"], 400.0)

    def test_post_calcular_ruta_con_corte_viru(self):
        payload = {
            "origen_id": "ALM-CHIMBOTE-REG",
            "destino_id": "ALB-VIRU-VICTORRAUL",
            "tipo_vehiculo": "CAMION_PESADO_15T",
            "puentes_cortados": ["puente-viru-pe1n"]
        }
        resp = self.client.post("/api/v1/logistica/calcular-ruta", json=payload)
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertEqual(data["estado_conectividad"], "DESVIO_TACTICO_ACTIVO")
        self.assertGreater(data["balance_contingencia"]["diesel_adicional_galones"], 0)

    def test_post_simular_red_global(self):
        payload = {
            "puentes_cortados": ["puente-viru-pe1n", "puente-reque-pe1n", "puente-sechin-casma"]
        }
        resp = self.client.post("/api/v1/logistica/simular-red", json=payload)
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertIn("resumen_simulacion", data)
        self.assertEqual(data["resumen_simulacion"]["total_puentes_cortados"], 3)
        self.assertEqual(len(data["albergues"]), 12)

if __name__ == "__main__":
    unittest.main()
