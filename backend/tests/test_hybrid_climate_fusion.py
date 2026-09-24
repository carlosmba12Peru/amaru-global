# backend/tests/test_hybrid_climate_fusion.py
"""
Suite de Pruebas Unitarias e Integradas para la Fusión Hidro-Meteorológica Híbrida
(Observatorio SENAMHI + Open-Meteo) en el Ecosistema AMARU-CLIMATE.
"""
import unittest
import sys
from pathlib import Path

backend_dir = Path(__file__).resolve().parent.parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from agents.kuraq.kuraq_agent import kuraq_agent
from agents.kuraq.connectors.senamhi_observatorio_connector import senamhi_observatorio_connector
from agents.kuraq.connectors.open_meteo_connector import open_meteo_connector
from services.national.amaru_meteo_fusion_service import amaru_meteo_fusion_service


class TestHybridClimateFusionSuite(unittest.IsolatedAsyncioTestCase):

    async def asyncSetUp(self):
        if not senamhi_observatorio_connector._estaciones_cache:
            await senamhi_observatorio_connector.sync()

    async def test_kuraq_agent_connector_registration(self):
        """Verifica que ambos conectores soberanos estén activos en el catálogo de KURAQ."""
        conectores = kuraq_agent.conectores_especializados
        self.assertIn("SRC-SENAMHI-OBSERVATORIO-ESTACIONES", conectores)
        self.assertIn("SRC-OPEN-METEO-GLOBAL-CORE", conectores)

        c_senamhi = conectores["SRC-SENAMHI-OBSERVATORIO-ESTACIONES"]
        self.assertEqual(c_senamhi.tier, "TIER_1_OFICIAL_ESTATAL")
        self.assertEqual(c_senamhi.ente, "SENAMHI")

        c_om = conectores["SRC-OPEN-METEO-GLOBAL-CORE"]
        self.assertEqual(c_om.tier, "TIER_2_INSTITUCIONAL_INTERNACIONAL")

    async def test_senamhi_observatorio_connector_sync(self):
        """Valida la sincronización, conteo de estaciones y firmado SHA-256."""
        resumen = await senamhi_observatorio_connector.sync()
        self.assertEqual(resumen["estado"], "SINCRONIZADO_OK")
        self.assertGreaterEqual(resumen["total_estaciones"], 900)
        self.assertGreater(resumen["estaciones_automaticas"], 150)
        self.assertGreater(resumen["estaciones_hidrologicas"], 200)
        self.assertEqual(len(resumen["hash_sha256"]), 64)  # Formato hexadecimal SHA-256

    def test_senamhi_nearest_station_lookup(self):
        """Verifica la búsqueda de la estación más cercana por Haversine geodésico."""
        # Coordenadas de Piura Centro (-5.1945, -80.6328)
        nearest_piura = senamhi_observatorio_connector.find_nearest_station(-5.1945, -80.6328)
        self.assertIsNotNone(nearest_piura)
        self.assertLess(nearest_piura["distancia_km"], 25.0)
        self.assertEqual(nearest_piura["departmentName"], "PIURA")

        # Coordenadas de Chosica (-11.9406, -76.7022)
        nearest_chosica = senamhi_observatorio_connector.find_nearest_station(-11.9406, -76.7022)
        self.assertIsNotNone(nearest_chosica)
        self.assertLess(nearest_chosica["distancia_km"], 35.0)

    async def test_open_meteo_connector_forecast(self):
        """Valida consulta de pronóstico numérico ECMWF IFS en Open-Meteo."""
        data = await open_meteo_connector.get_forecast(-5.1945, -80.6328, days=3)
        self.assertTrue("hourly" in data or "daily" in data)
        daily = data.get("daily", {})
        self.assertIn("precipitation_sum", daily)

    async def test_amaru_meteo_fusion_forecast(self):
        """Valida el cálculo del pronóstico fusionado con calibración territorial."""
        # Consulta por Ubigeo 200101 (Piura)
        res = await amaru_meteo_fusion_service.get_hybrid_forecast(ubigeo="200101", days=7)
        
        self.assertEqual(res["meta"]["sistema"], "AMARU-CLIMATE • HYBRID METEO FUSION")
        self.assertEqual(res["meta"]["ubigeo"], "200101")

        # Ground Truth SENAMHI presente
        gt = res["ground_truth_senamhi"]
        self.assertIsNotNone(gt["estacion_id"])
        self.assertIsNotNone(gt["distancia_km"])

        # Pronóstico fusionado coherente
        pf = res["pronostico_fusionado"]
        self.assertIn("precipitacion_acumulada_24h_mm", pf)
        self.assertIn("precipitacion_acumulada_7d_mm", pf)
        self.assertIn("temperatura_max_estimada_c", pf)
        self.assertIn("caudal_rio_pico_m3_s", pf)

        # Diagnóstico táctico
        diag = res["diagnostico_tactico_amaru"]
        self.assertIn(diag["nivel_riesgo_fen"], [
            "VERDE_ESTABLE", "AMARILLO_PREVENCION", "NARANJA_ALERTA_MODERADA", "ROJO_CRITICO_PELIGRO_INMINENTE"
        ])
        self.assertIsInstance(diag["habilitante_legal_ds124"], bool)

    async def test_amaru_flood_monitoring(self):
        """Valida el monitoreo de cuenca combinando hidrología SENAMHI y GloFAS."""
        flood_res = await amaru_meteo_fusion_service.get_river_basin_monitoring(-5.1945, -80.6328)
        self.assertIn("glofas_proyeccion_7d", flood_res)
        self.assertIn("estacion_hidrologica_senamhi", flood_res)


if __name__ == "__main__":
    unittest.main()
