# backend/tests/test_kuraq_agent.py
"""
Suite de pruebas unitarias para el Agente KURAQ (Curador & Centinela de Ingesta Multifuente).
Valida:
1. Inventario de fuentes oficiales y clasificación por Tiers.
2. Conector IMARPE SIOFEN BDO (generación de candidatos, CDN oficial, formato de fecha).
3. Conector ENFEN (detección de comunicados y probabilidades).
4. Conectores de radar meteorológico SENAMHI Banda C.
5. Trazabilidad criptográfica SHA-256 y auditoría forense SAGF-MC.
"""
import unittest
import asyncio
import sys
from pathlib import Path

backend_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_dir))

from agents.kuraq.kuraq_agent import kuraq_agent, KuraqAgent
from agents.kuraq.connectors.imarpe_bdo_connector import imarpe_bdo_connector
from agents.kuraq.connectors.enfen_connector import enfen_connector
from agents.kuraq.connectors.senamhi_radar_connector import senamhi_radar_piura_connector


class TestKuraqAgentSuite(unittest.TestCase):

    def setUp(self):
        self.agent = kuraq_agent

    def test_kuraq_inventory_loaded(self):
        """Verifica que el Agente KURAQ tenga indexadas las fuentes oficiales con sus Tiers."""
        inv = self.agent.get_inventory()
        self.assertIn("fuentes", inv)
        self.assertGreaterEqual(inv["total_fuentes_registradas"], 15)

        ids = [f["id"] for f in inv["fuentes"]]
        self.assertIn("SRC-IMARPE-BDO", ids)
        self.assertIn("SRC-ENFEN-OFICIAL", ids)
        self.assertIn("SRC-SENAMHI-RADAR-PIU", ids)
        self.assertIn("SRC-ANA-SNIRH-AFOROS", ids)

    def test_imarpe_bdo_connector_urls(self):
        """Verifica que el conector de IMARPE genere las URLs canónicas del CDN oficial SIOFEN."""
        candidates = imarpe_bdo_connector._generate_candidate_urls(max_days_back=3)
        self.assertGreaterEqual(len(candidates), 3)

        first = candidates[0]
        self.assertIn("https://siofen-admin.imarpe.gob.pe/img/productoArchivo/BDO/", first["url"])
        self.assertTrue(first["filename"].startswith("BOL_IMARPE_BDO_"))
        self.assertTrue(first["filename"].endswith(".pdf"))

    def test_enfen_connector_metadata(self):
        """Verifica los parámetros institucionales del conector ENFEN."""
        self.assertEqual(enfen_connector.ente, "ENFEN / IMARPE")
        self.assertEqual(enfen_connector.tier, "TIER_1_OFICIAL_ESTATAL")
        self.assertEqual(enfen_connector.frecuencia_minutos, 720)
        self.assertIn("enfen.imarpe.gob.pe", enfen_connector.endpoint)

    def test_senamhi_radar_piura_connector_sync(self):
        """Verifica la sincronización y cálculo de hash SHA-256 en el conector de radar de Piura."""
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        try:
            res = loop.run_until_complete(senamhi_radar_piura_connector.sync())
        finally:
            loop.close()

        self.assertEqual(res["source_id"], "SRC-SENAMHI-RADAR-PIU")
        self.assertEqual(res["estado"], "SINCRONIZADO_OK")
        self.assertIn("hash_sha256", res)
        self.assertEqual(len(res["hash_sha256"]), 64)

    def test_kuraq_sync_individual_source(self):
        """Verifica que el método sync_source registre el evento en el historial de auditoría."""
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        try:
            res = loop.run_until_complete(self.agent.sync_source("SRC-SENAMHI-RADAR-PIU"))
        finally:
            loop.close()

        self.assertIn("hash_sha256", res)
        history = self.agent.get_audit_history()
        self.assertGreater(len(history), 0)
        last_item = history[-1]
        self.assertEqual(last_item["source_id"], "SRC-SENAMHI-RADAR-PIU")

    def test_sha256_forensic_integrity(self):
        """Verifica la conformidad del cálculo de firma criptográfica bajo NTP-ISO/IEC 27037."""
        sample_bytes = b"IMARPE_TELEMETRIA_TSM_2026_PAITA_24.5C"
        hash_calc = imarpe_bdo_connector.calculate_sha256(sample_bytes)
        self.assertEqual(len(hash_calc), 64)
        # Idempotencia
        self.assertEqual(hash_calc, imarpe_bdo_connector.calculate_sha256(sample_bytes))


if __name__ == "__main__":
    unittest.main()
