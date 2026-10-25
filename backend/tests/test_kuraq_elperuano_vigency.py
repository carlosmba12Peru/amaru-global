"""
Test Suite: AMARU-LEX & Agente KURAQ - Integración Oficial con El Peruano y Ciclo de Vida Normativo FEN
======================================================================================================
Valida:
1. Conector oficial SRC-ELPERUANO-FEN (ElPeruanoNormasConnector) y hash SHA-256.
2. Motor de ciclo de vida normativo en LegalFrameworkService:
   - Cálculo de vigencia (60 días D.S., 90 días D.U., 180 días crédito/presupuesto).
   - Detección de normas POR_CADUCAR (<= 15 días) y CADUCADAS.
   - Preservación de cadena de prórrogas.
   - Blindaje y advertencias por delito de omisión funcional (Art. 377 Código Penal).
3. Integración con Agente KURAQ y registro en historial de auditoría.
4. Endpoints FastAPI en main.py (/api/marco-legal/lifecycle-summary, /api/v1/kuraq/sincronizar-elperuano, etc.)
"""

import unittest
import asyncio
import sys
from pathlib import Path
from datetime import datetime

backend_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_dir))
sys.path.insert(0, str(backend_dir.parent))

from agents.kuraq.connectors.elperuano_normas_connector import ElPeruanoNormasConnector
from agents.kuraq.kuraq_agent import KuraqAgent
from services.legal_framework_service import LegalFrameworkService
from fastapi.testclient import TestClient
from main import app


class TestElPeruanoConnector(unittest.TestCase):
    """Pruebas unitarias del Conector Oficial de El Peruano."""

    def setUp(self):
        self.connector = ElPeruanoNormasConnector()

    def test_connector_initialization(self):
        self.assertEqual(self.connector.source_id, "SRC-ELPERUANO-FEN")
        self.assertIn("El Peruano", self.connector.nombre)
        self.assertEqual(self.connector.tier, "TIER_1_OFICIAL_ESTATAL")

    def test_connection_health(self):
        result = asyncio.run(self.connector.check_health())
        self.assertIsInstance(result, dict)
        self.assertEqual(result["source_id"], "SRC-ELPERUANO-FEN")
        self.assertIn("estado", result)

    def test_scan_elperuano_normas(self):
        scan = asyncio.run(self.connector.scan_elperuano_normas())
        self.assertIsInstance(scan, dict)
        self.assertEqual(scan["total_normas"], 51)
        self.assertGreater(scan["vigentes"], 0)
        self.assertGreaterEqual(scan["por_caducar"], 0)
        self.assertGreater(scan["caducadas"], 0)
        self.assertTrue(scan["hash_sha256"].isalnum())
        self.assertEqual(len(scan["hash_sha256"]), 64)

    def test_sync_execution(self):
        sync_res = asyncio.run(self.connector.sync())
        self.assertIsInstance(sync_res, dict)
        self.assertEqual(sync_res["total_normas"], 51)
        self.assertIn("hash_sha256", sync_res)


class TestLegalFrameworkLifecycle(unittest.TestCase):
    """Pruebas del motor de ciclo de vida normativo y amparo legal."""

    def setUp(self):
        self.service = LegalFrameworkService()
        self.fecha_ref = datetime(2026, 9, 23, 12, 0, 0)

    def test_evaluar_vigencia_du_010_por_caducar(self):
        """Verifica que el D.U. 010-2026 emitido el 2026-07-01 (90 días) expire en 6 días o menos y sea POR_CADUCAR."""
        norma_du = {
            "norma": "DECRETO DE URGENCIA Nº 010-2026",
            "categoria": "DECRETO DE URGENCIA (FINANCIAMIENTO & COMPRAS C2)",
            "fecha_publicacion": "2026-07-01",
            "vigencia_dias": 90
        }
        res = self.service._evaluar_vigencia_norma(norma_du, self.fecha_ref)
        self.assertEqual(res["estado_vigencia"], "POR_CADUCAR")
        self.assertIn(res["dias_vigencia_restantes"], [5, 6])
        self.assertEqual(res["fecha_vencimiento_calculada"], "2026-09-29")

    def test_evaluar_vigencia_prorroga_130_pcm(self):
        """Verifica que el D.S. 130-2026-PCM con prórroga mantenga 38 días restantes."""
        norma_ds = {
            "norma": "DECRETO SUPREMO Nº 130-2026-PCM",
            "categoria": "PRÓRROGA DE ESTADO DE EMERGENCIA",
            "fecha_publicacion": "2026-08-01",
            "dias_vigencia_restantes": 38
        }
        res = self.service._evaluar_vigencia_norma(norma_ds, self.fecha_ref)
        self.assertEqual(res["estado_vigencia"], "PRORROGADO")
        self.assertEqual(res["dias_vigencia_restantes"], 38)

    def test_evaluar_vigencia_norma_caducada(self):
        """Verifica que una norma de 2023 o con fecha vencida sea catalogada como CADUCADO."""
        norma_caducada = {
            "norma": "DECRETO SUPREMO Nº 029-2023-PCM",
            "categoria": "DECLARATORIA DE ESTADO DE EMERGENCIA",
            "fecha_publicacion": "2023-03-03",
            "vigencia_dias": 60
        }
        res = self.service._evaluar_vigencia_norma(norma_caducada, self.fecha_ref)
        self.assertEqual(res["estado_vigencia"], "CADUCADO")
        self.assertLessEqual(res["dias_vigencia_restantes"], 0)

    def test_lifecycle_summary(self):
        summary = self.service.get_normative_lifecycle_summary()
        self.assertEqual(summary["total_normas"], 51)
        self.assertGreater(summary["vigentes"], 0)
        self.assertGreaterEqual(summary["por_caducar_15_dias"], 0)
        self.assertGreater(summary["caducadas"], 0)
        self.assertIsInstance(summary["alertas_inminentes"], list)

    def test_get_expiring_norms_alert(self):
        alerts = self.service.get_expiring_norms_alert(dias_umbral=15)
        self.assertIsInstance(alerts, list)
        self.assertGreaterEqual(len(alerts), 0)
        for a in alerts:
            self.assertLessEqual(a["dias_vigencia_restantes"], 15)
            self.assertGreater(a["dias_vigencia_restantes"], 0)

    def test_district_legal_status_penal_warning(self):
        """Valida advertencia de Art. 377 Código Penal y cálculo de días en Chosica."""
        status = self.service.get_district_legal_status("150118", "Lurigancho-Chosica", "Lima")
        self.assertEqual(status["ubigeo"], "150118")
        self.assertTrue(status["amparado_emergencia"])
        self.assertIn("dias_vigencia_restantes", status)
        self.assertIn("Art. 377 del Código Penal", status["aviso_legal_alcalde"])

    def test_filter_norms_by_vigencia(self):
        vigentes = self.service.get_all_norms(vigencia="VIGENTE")
        caducadas = self.service.get_all_norms(vigencia="CADUCADO")
        self.assertGreater(len(vigentes), 0)
        self.assertGreater(len(caducadas), 0)
        for v in vigentes:
            self.assertEqual(v["estado_vigencia"], "VIGENTE")
        for c in caducadas:
            self.assertEqual(c["estado_vigencia"], "CADUCADO")


class TestKuraqAgentIntegration(unittest.TestCase):
    """Pruebas de la orquestación del Agente KURAQ con El Peruano."""

    def setUp(self):
        self.agent = KuraqAgent()

    def test_connector_registered_in_kuraq(self):
        self.assertIn("SRC-ELPERUANO-FEN", self.agent.conectores_especializados)
        conector = self.agent.conectores_especializados["SRC-ELPERUANO-FEN"]
        self.assertIsInstance(conector, ElPeruanoNormasConnector)

    def test_sincronizar_normas_elperuano(self):
        res = asyncio.run(self.agent.sincronizar_normas_elperuano())
        self.assertIsInstance(res, dict)
        self.assertEqual(res["status"], "SUCCESS")
        self.assertEqual(res["source_id"], "SRC-ELPERUANO-FEN")
        self.assertIn("auditoria", res)
        # Verificar que se registró en el historial de auditoría del agente
        self.assertGreater(len(self.agent.historial_auditoria), 0)
        ultimo_registro = self.agent.historial_auditoria[-1]
        self.assertEqual(ultimo_registro["accion"], "SINCRONIZACION_ELPERUANO_NORMAS")


class TestFastApiEndpoints(unittest.TestCase):
    """Pruebas funcionales de los endpoints REST en FastAPI."""

    def setUp(self):
        self.client = TestClient(app)

    def test_endpoint_lifecycle_summary(self):
        response = self.client.get("/api/marco-legal/lifecycle-summary")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["total_normas"], 51)
        self.assertIn("por_caducar_15_dias", data)

    def test_endpoint_vigencia_alertas(self):
        response = self.client.get("/api/marco-legal/vigencia-alertas?dias_umbral=15")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIsInstance(data, list)
        self.assertGreaterEqual(len(data), 0)

    def test_endpoint_kuraq_sync(self):
        response = self.client.post("/api/v1/kuraq/sincronizar-elperuano")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["status"], "SUCCESS")
        self.assertIn("auditoria", data)

    def test_endpoint_norms_filtered_vigencia(self):
        response = self.client.get("/api/v1/lex/normas?vigencia=POR_CADUCAR")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIsInstance(data, list)
        self.assertGreaterEqual(len(data), 0)
        for n in data:
            self.assertEqual(n["estado_vigencia"], "POR_CADUCAR")


if __name__ == "__main__":
    unittest.main()
