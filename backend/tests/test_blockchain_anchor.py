"""
Pruebas Unitarias para el Servicio de Anclaje Blockchain (AMARU-CLIMATECHAIN)
Fase 1: IEEE ClimateChain Global Hackathon (Track 4)
"""

import unittest
from fastapi.testclient import TestClient
from main import app
from services.blockchain_anchor_service import blockchain_anchor_service


class TestBlockchainAnchor(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(app)

    def test_01_status_endpoint(self):
        """Verifica que el endpoint /api/v1/blockchain/status retorne datos válidos de Polygon Amoy."""
        response = self.client.get("/api/v1/blockchain/status")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["status"], "OPERATIONAL")
        self.assertEqual(data["network"], "Polygon Amoy Testnet")
        self.assertEqual(data["chain_id"], 80002)
        self.assertIn("0x", data["contract_address"])
        self.assertIn("merkle_root", data)
        self.assertIn("explorer_url", data)

    def test_02_anchor_now_endpoint(self):
        """Verifica que /api/v1/blockchain/anchor-now selle los bloques WORM en la blockchain."""
        payload = {"summary": "TEST-IEEE-CLIMATECHAIN-PIURA-BATCH"}
        response = self.client.post("/api/v1/blockchain/anchor-now", json=payload)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertTrue(data["success"])
        self.assertIn("merkle_root", data)
        self.assertTrue(data["merkle_root"].startswith("0x"))
        self.assertIn("tx_hash", data)
        self.assertTrue(data["tx_hash"].startswith("0x"))
        self.assertIn("amoy.polygonscan.com", data["explorer_url"])

    def test_03_anchors_history_endpoint(self):
        """Verifica que /api/v1/blockchain/anchors-history retorne la lista histórica de anclajes."""
        response = self.client.get("/api/v1/blockchain/anchors-history?limite=10")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("total", data)
        self.assertIn("anchors", data)
        self.assertIsInstance(data["anchors"], list)
        self.assertGreater(data["total"], 0)

    def test_04_verify_tx_endpoint(self):
        """Verifica que /api/v1/blockchain/verify/{tx_hash} valide un hash existente."""
        # Obtener el último hash anclado
        history = self.client.get("/api/v1/blockchain/anchors-history?limite=1").json()
        self.assertTrue(len(history["anchors"]) > 0)
        ultimo_tx = history["anchors"][0]["tx_hash"]

        response = self.client.get(f"/api/v1/blockchain/verify/{ultimo_tx}")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertTrue(data["verified"])
        self.assertEqual(data["cryptographic_proof"], "VALID_MERKLE_ROOT")

    def test_05_merkle_root_calculation(self):
        """Verifica el cálculo de Merkle root balanceado."""
        h1 = "a" * 64
        h2 = "b" * 64
        root = blockchain_anchor_service.calcular_merkle_root([h1, h2])
        self.assertTrue(root.startswith("0x"))
        self.assertEqual(len(root), 66)  # 0x + 64 hex chars


if __name__ == "__main__":
    unittest.main()
