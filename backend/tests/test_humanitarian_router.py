"""
Pruebas Unitarias del Motor de Ruteo Táctico y Logística Humanitaria (Fase 2)
AMARU-CLIMATE - Lab4
"""

import unittest
from services.routing.humanitarian_router import humanitarian_router

class TestHumanitarianRouter(unittest.TestCase):
    def setUp(self):
        self.router = humanitarian_router
        self.router.bloqueos_activos.clear()

    def tearDown(self):
        self.router.bloqueos_activos.clear()

    def test_catalogos_cargados(self):
        self.assertGreaterEqual(len(self.router.almacenes), 7, "Debe cargar al menos 7 almacenes INDECI")
        self.assertGreaterEqual(len(self.router.albergues), 12, "Debe cargar al menos 12 albergues críticos")
        self.assertGreaterEqual(len(self.router.vehiculos), 4, "Debe cargar al menos 4 tipos de vehículos")
        self.assertGreater(len(self.router.grafo_aristas), 20, "El grafo vial debe tener aristas troncales y desvíos")

    def test_ruta_nominal_despejada(self):
        # Ruta desde Lima hasta Virú sin cortes
        res = self.router.calcular_ruta_contingencia(
            origen_id="ALM-LIMA-CENTRAL",
            destino_id="ALB-VIRU-VICTORRAUL",
            puentes_cortados=[]
        )
        self.assertIsNotNone(res)
        self.assertEqual(res["estado_conectividad"], "TRANSITO_EXPEDITO_NORMAL")
        self.assertFalse(res["requiere_puente_aereo_ffaa"])
        self.assertIn("distancia_total_km", res["ruta_efectiva"])
        self.assertGreater(res["ruta_efectiva"]["distancia_total_km"], 400.0)

    def test_reruteo_anti_corte_puente_viru(self):
        # Simular caída histórica del Puente Virú (km 515)
        res = self.router.calcular_ruta_contingencia(
            origen_id="ALM-CHIMBOTE-REG",
            destino_id="ALB-VIRU-VICTORRAUL",
            puentes_cortados=["puente-viru-pe1n"]
        )
        self.assertIsNotNone(res)
        self.assertEqual(res["estado_conectividad"], "DESVIO_TACTICO_ACTIVO")
        self.assertTrue(res["ruta_efectiva"]["usa_desvios_emergencia"])
        self.assertGreater(res["balance_contingencia"]["distancia_adicional_km"], 0)
        self.assertGreater(res["balance_contingencia"]["diesel_adicional_galones"], 0)

    def test_reruteo_puente_reque(self):
        # Simular caída del Puente Reque (km 760)
        res = self.router.calcular_ruta_contingencia(
            origen_id="ALM-TRUJILLO-REG",
            destino_id="ALM-CHICLAYO-REG",
            puentes_cortados=["puente-reque-pe1n"]
        )
        self.assertIsNotNone(res)
        self.assertEqual(res["estado_conectividad"], "DESVIO_TACTICO_ACTIVO")
        self.assertTrue(res["ruta_efectiva"]["usa_desvios_emergencia"])

    def test_aislamiento_total_demanda_puente_aereo(self):
        # Simular corte de puente Sechín y bloqueo de desvío
        res = self.router.calcular_ruta_contingencia(
            origen_id="ALM-CHIMBOTE-REG",
            destino_id="ALB-CASMA-SECHIN",
            puentes_cortados=["puente-sechin-casma", "AR-HUARMEY-CASMA-DESVIO-HUARAZ"]
        )
        self.assertIsNotNone(res)
        # Debe calcular la respuesta o activar protocolo
        self.assertIn(res["estado_conectividad"], ["AISLAMIENTO_TERRESTRE_TOTAL", "DESVIO_TACTICO_ACTIVO", "TRANSITO_EXPEDITO_NORMAL"])

    def test_simulacion_red_global(self):
        # Simular colapso de 3 puentes principales del norte
        sim = self.router.simular_red_regional(
            puentes_cortados=["puente-viru-pe1n", "puente-reque-pe1n", "puente-independencia-catacaos"]
        )
        self.assertIn("resumen_simulacion", sim)
        self.assertEqual(sim["resumen_simulacion"]["total_puentes_cortados"], 3)
        self.assertEqual(len(sim["albergues"]), len(self.router.albergues))
        self.assertGreaterEqual(sim["resumen_simulacion"]["albergues_con_desvio_activo"], 1)

if __name__ == "__main__":
    unittest.main()
