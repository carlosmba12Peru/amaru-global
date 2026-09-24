"""
Test Suite: AMARU-CLIMATE - Integración Multifuente Estratégica (MEF, MINSA/CDC, INEI, Gob.pe)
=============================================================================================
Valida:
1. Conectores KURAQ:
   - SRC-MEF-GASTO-FEN-FONDES (MefGastoConnector)
   - SRC-MINSA-CDC-DENGUE (MinsaDengueConnector)
   - SRC-INEI-FEN-ESTADISTICA (IneiFenConnector)
   - SRC-GOBPE-PLANES-FEN (GobPePlanesConnector)
2. Servicios de Inteligencia:
   - mef_fiscal_service (Inacción fiscal y Art. 377 CP)
   - epidemiological_service (Vigilancia dengue y riesgo bioclimático)
   - inei_vulnerability_service (Demografía y pre-cálculo EDAN)
   - contingency_plans_service (Catálogo y recursos declarados)
3. Endpoints REST FastAPI en main.py (/api/v1/fiscal, /api/v1/salud, /api/v1/inei, /api/v1/planes)
"""

import unittest
import asyncio
import sys
from pathlib import Path

backend_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_dir))
sys.path.insert(0, str(backend_dir.parent))

from agents.kuraq.connectors.mef_gasto_connector import mef_gasto_connector, MefGastoConnector
from agents.kuraq.connectors.minsa_dengue_connector import minsa_dengue_connector, MinsaDengueConnector
from agents.kuraq.connectors.inei_fen_connector import inei_fen_connector, IneiFenConnector
from agents.kuraq.connectors.gobpe_planes_connector import gobpe_planes_connector, GobPePlanesConnector
from agents.kuraq.kuraq_agent import kuraq_agent

from services.mef_fiscal_service import mef_fiscal_service
from services.epidemiological_service import epidemiological_service
from services.inei_vulnerability_service import inei_vulnerability_service
from services.contingency_plans_service import contingency_plans_service

from fastapi.testclient import TestClient
from main import app


class TestMultisourceConnectors(unittest.TestCase):
    """Pruebas de los 4 nuevos conectores de KURAQ."""

    def test_mef_connector(self):
        connector = MefGastoConnector()
        self.assertEqual(connector.source_id, "SRC-MEF-GASTO-FEN-FONDES")
        self.assertEqual(connector.tier, "TIER_1_OFICIAL_ESTATAL")
        res = asyncio.run(connector.sync())
        self.assertIsInstance(res, dict)
        self.assertIn("hash_sha256", res)
        self.assertIn("resumen_presupuestal_nacional", res)
        self.assertGreater(res["resumen_presupuestal_nacional"]["pim_total"], 0)

    def test_minsa_dengue_connector(self):
        connector = MinsaDengueConnector()
        self.assertEqual(connector.source_id, "SRC-MINSA-CDC-DENGUE")
        res = asyncio.run(connector.sync())
        self.assertIsInstance(res, dict)
        self.assertIn("hash_sha256", res)
        self.assertIn("resumen_nacional", res)
        self.assertGreater(res["resumen_nacional"]["total_casos"], 0)

    def test_inei_connector(self):
        connector = IneiFenConnector()
        self.assertEqual(connector.source_id, "SRC-INEI-FEN-ESTADISTICA")
        res = asyncio.run(connector.sync())
        self.assertIsInstance(res, dict)
        self.assertIn("hash_sha256", res)
        self.assertIn("resumen_vulnerabilidad_nacional", res)
        self.assertGreater(res["resumen_vulnerabilidad_nacional"]["poblacion_total_expuesta"], 0)

    def test_gobpe_planes_connector(self):
        connector = GobPePlanesConnector()
        self.assertEqual(connector.source_id, "SRC-GOBPE-PLANES-FEN")
        res = asyncio.run(connector.sync())
        self.assertIsInstance(res, dict)
        self.assertIn("hash_sha256", res)
        self.assertGreaterEqual(res["total_planes_catalogados"], 5)


class TestStrategicServices(unittest.TestCase):
    """Pruebas de la lógica analítica de los servicios de backend."""

    def test_mef_fiscal_service(self):
        nac = mef_fiscal_service.get_national_fiscal_summary()
        self.assertIn("pim_total", nac)
        self.assertGreater(nac["pim_total"], 0)

        # Chosica (150118)
        status_chosica = mef_fiscal_service.get_district_fiscal_status("150118")
        self.assertEqual(status_chosica["distrito"], "Lurigancho-Chosica")
        self.assertIn("proyectos_fondes", status_chosica)

        # Tambogrande (200114) con alerta penal Art. 377
        status_tambogrande = mef_fiscal_service.get_district_fiscal_status("200114")
        self.assertIn("Art. 377", status_tambogrande["dictamen_responsabilidad_penal"])

        # Ranking de inacción
        ranking = mef_fiscal_service.get_inaction_ranking(5)
        self.assertIsInstance(ranking, list)
        self.assertGreater(len(ranking), 0)

    def test_epidemiological_service(self):
        summary = epidemiological_service.get_national_dengue_summary()
        self.assertIn("total_casos", summary)
        self.assertGreater(summary["total_casos"], 0)

        # Tambogrande brote
        status_tg = epidemiological_service.get_district_epidemiological_status("200114")
        self.assertEqual(status_tg["estado_alerta"], "BROTE_EPIDEMICO_ACTIVO")

        # Necesidad de insumos
        supplies = epidemiological_service.calculate_medical_supplies_need("200114")
        self.assertIn("camas_uviclin_requeridas", supplies["insumos"])
        self.assertGreater(supplies["insumos"]["malation_litros_fumigacion"], 0)

        # Correlación bioclimática
        corr = epidemiological_service.correlate_rainfall_vector_risk("200114", lluvia_acumulada_mm=80.0, dias_anegamiento=21)
        self.assertEqual(corr["nivel_alerta"], "CRITICO_BROTE_EXPLOSIVO")

    def test_inei_vulnerability_service(self):
        summary = inei_vulnerability_service.get_national_vulnerability_summary()
        self.assertIn("poblacion_total_expuesta", summary)

        # Chosica
        vuln = inei_vulnerability_service.get_district_vulnerability("150118")
        self.assertGreater(vuln["poblacion_total"], 100000)
        self.assertGreater(vuln["viviendas_adobe_quincha_count"], 5000)

        # Precalculo EDAN
        edan_pre = inei_vulnerability_service.precalculate_edan_demographics("150118")
        self.assertIn("padron_edan_sugerido", edan_pre)
        self.assertGreater(edan_pre["padron_edan_sugerido"]["raciones_humanitarias_diarias"], 0)

    def test_contingency_plans_service(self):
        planes = contingency_plans_service.list_all_plans()
        self.assertIsInstance(planes, list)
        self.assertGreaterEqual(len(planes), 5)

        # Plan defensa
        plan_def = contingency_plans_service.get_plan_by_id("PLAN-DEF-01")
        self.assertIsNotNone(plan_def)
        self.assertEqual(plan_def["sector"], "DEFENSA_Y_SEGURIDAD")

        # Planes por ubigeo (El Tallán 200108)
        planes_tallan = contingency_plans_service.get_plans_for_ubigeo("200108")
        self.assertGreaterEqual(len(planes_tallan), 1)


class TestFastApiStrategicEndpoints(unittest.TestCase):
    """Pruebas funcionales de los endpoints REST en FastAPI."""

    def setUp(self):
        self.client = TestClient(app)

    def test_endpoints_fiscal(self):
        # Resumen
        r = self.client.get("/api/v1/fiscal/resumen")
        self.assertEqual(r.status_code, 200)
        self.assertIn("pim_total", r.json())

        # Distrito
        r2 = self.client.get("/api/v1/fiscal/distrito/150118")
        self.assertEqual(r2.status_code, 200)
        self.assertEqual(r2.json()["distrito"], "Lurigancho-Chosica")

        # Ranking
        r3 = self.client.get("/api/v1/fiscal/ranking-inaccion")
        self.assertEqual(r3.status_code, 200)
        self.assertIsInstance(r3.json(), list)

    def test_endpoints_salud(self):
        # Resumen
        r = self.client.get("/api/v1/salud/dengue/resumen")
        self.assertEqual(r.status_code, 200)
        self.assertIn("total_casos", r.json())

        # Distrito
        r2 = self.client.get("/api/v1/salud/dengue/distrito/200114")
        self.assertEqual(r2.status_code, 200)
        self.assertEqual(r2.json()["estado_alerta"], "BROTE_EPIDEMICO_ACTIVO")

        # Insumos
        r3 = self.client.get("/api/v1/salud/dengue/insumos-necesidad/200114")
        self.assertEqual(r3.status_code, 200)
        self.assertIn("insumos", r3.json())

    def test_endpoints_inei(self):
        r = self.client.get("/api/v1/inei/vulnerabilidad/distrito/150118")
        self.assertEqual(r.status_code, 200)
        self.assertIn("viviendas_adobe_quincha_pct", r.json())

        r2 = self.client.get("/api/v1/inei/vulnerabilidad/edan-asistencia/150118")
        self.assertEqual(r2.status_code, 200)
        self.assertIn("padron_edan_sugerido", r2.json())

    def test_endpoints_planes(self):
        r = self.client.get("/api/v1/planes/catalogo")
        self.assertEqual(r.status_code, 200)
        self.assertIsInstance(r.json(), list)

    def test_endpoints_kuraq_sync(self):
        r = self.client.post("/api/v1/kuraq/sincronizar-mef")
        self.assertEqual(r.status_code, 200)
        self.assertEqual(r.json()["status"], "SUCCESS")

        r2 = self.client.post("/api/v1/kuraq/sincronizar-dengue")
        self.assertEqual(r2.status_code, 200)
        self.assertEqual(r2.json()["status"], "SUCCESS")


if __name__ == "__main__":
    unittest.main()
