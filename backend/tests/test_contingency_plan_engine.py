# backend/tests/test_contingency_plan_engine.py
"""
Suite de Pruebas: Motor Digital de Planes de Contingencia y PPRRD (AMARU-PLAN FEN 2026-2027)
Verifica:
1. Generación del Plan de Contingencia para distrito rural costero: El Tallán (200108) / Catacaos (200105).
2. Generación para distrito urbano con quebradas: La Esperanza (130105) / Chosica (150118).
3. Cumplimiento de la estructura R.J. 188-2015-INDECI y R.J. 058-2019-CENEPRED.
4. Correctitud en el cálculo de kits BAH INDECI, autoridades INEI 2026 y Proyecto de Resolución de Alcaldía.
5. Endpoints REST en FastAPI.
"""
import os
import sys
import unittest
import asyncio

# Setup path
BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PROJECT_DIR = os.path.dirname(BACKEND_DIR)
for p in [PROJECT_DIR, BACKEND_DIR]:
    if p not in sys.path:
        sys.path.insert(0, p)

from main import app
from fastapi.testclient import TestClient
from services.contingency_plan_engine_service import contingency_plan_engine
from schemas.contingency_plan_schema import PlanContingenciaDigitalCompleto


class TestContingencyPlanEngine(unittest.IsolatedAsyncioTestCase):
    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(app)

    async def test_generar_plan_rural_piura(self):
        """Verifica generación de plan en cuenca del Río Piura (Catacaos - 200105)."""
        plan: PlanContingenciaDigitalCompleto = await contingency_plan_engine.generar_plan_contingencia("200105")

        self.assertEqual(plan.ubigeo, "200105")
        self.assertIn("CATACAOS", plan.distrito.upper())
        self.assertEqual(plan.departamento.upper(), "PIURA")
        self.assertTrue(plan.declarado_ds_124_pcm)
        self.assertEqual(len(plan.hash_sha256), 64)

        # Capítulo I: Escenario
        escenario = plan.capitulo1_escenario_riesgo
        self.assertGreater(escenario.parametros_peligro.lluvia_gatillo_24h_mm, 20.0)
        self.assertGreater(escenario.exposicion.poblacion_expuesta_faja_marginal, 1000)
        self.assertGreater(escenario.exposicion.familias_alto_riesgo_no_mitigable, 200)

        # Capítulo II: Mando GT-GRD
        mando = plan.capitulo2_organizacion_mando
        self.assertTrue(len(mando.presidente_gt_grd) > 5)
        self.assertIn("COEL", mando.coel_ubicacion_puesto_comando)

        # Capítulo III: Albergues y BAH
        resp = plan.capitulo3_procedimientos_respuesta
        self.assertGreater(len(resp.albergues_temporales), 0)
        self.assertGreater(resp.bienes_ayuda_humanitaria.carpas_familiares_unidades, 100)
        self.assertGreater(resp.bienes_ayuda_humanitaria.frazadas_termicas_unidades, 500)

        # Capítulo V: Obras PP 0068
        pprrd = plan.capitulo5_inversion_pprrd_mef
        self.assertGreater(len(pprrd.obras_prioritarias_defensas), 0)

        # Anexo: Resolución de Alcaldía
        res = plan.anexo_legal_resolucion_alcaldia
        self.assertIn("RESOLUCIÓN DE ALCALDÍA", res.numero_resolucion)
        self.assertIn("APROBAR", res.articulos_resolutivos[0])
        print(f"\n[Test AMARU-PLAN] Catacaos Plan ID: {plan.id_expediente}")
        print(f"[Test AMARU-PLAN] Resolución: {res.numero_resolucion}")

    async def test_generar_plan_urbano_trujillo_la_esperanza(self):
        """Verifica generación de plan en La Esperanza / Trujillo (130105)."""
        plan: PlanContingenciaDigitalCompleto = await contingency_plan_engine.generar_plan_contingencia("130105")

        self.assertEqual(plan.ubigeo, "130105")
        self.assertIn("ESPERANZA", plan.distrito.upper())
        self.assertEqual(plan.departamento.upper(), "LA LIBERTAD")
        self.assertGreater(plan.capitulo3_procedimientos_respuesta.bienes_ayuda_humanitaria.raciones_frias_72h_unidades, 1000)

    def test_catalogo_distritos_contingencia(self):
        """Verifica el endpoint de catálogo distrital con filtros."""
        res = self.client.get("/api/v1/planes/contingencia/catalogo?departamento=PIURA&solo_emergencia_ds124=true")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        print(f"\n[Test Catalogo Debug] data keys: {list(data.keys()) if isinstance(data, dict) else type(data)}")
        self.assertIn("total_distritos_nacionales", data)
        self.assertGreater(data["total_distritos_nacionales"], 0)
        self.assertTrue(len(data["distritos"]) > 0)
        self.assertEqual(data["distritos"][0]["departamento"].upper(), "PIURA")

    def test_api_resolucion_alcaldia_minuta(self):
        """Verifica endpoint específico de la minuta de Resolución de Alcaldía."""
        res = self.client.get("/api/v1/planes/contingencia/150118/resolucion-alcaldia")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["ubigeo"], "150118")
        self.assertIn("resolucion_alcaldia", data)
        self.assertIn("LURIGANCHO", data["resolucion_alcaldia"]["titulo"].upper())

    def test_api_calibracion_patrones(self):
        """Verifica endpoint de patrones de calibración multianual."""
        res = self.client.get("/api/v1/planes/contingencia-calibracion/patrones")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertIn("planes_base_2026", data)
        self.assertIn("planes_historicos_calibradores", data)


if __name__ == "__main__":
    unittest.main()
