"""
Unit Tests para MineduSigmedService e Integración de Albergues Temporales INDECI
Verifica:
1. Carga de semilla de infraestructura escolar oficial MINEDU / ESCALE SIGMED.
2. Identificación de escuelas públicas aptas como albergues temporales (Ley 29664).
3. Integración en HistoricalDataService y DossierPDFService.
"""

import unittest
from services.minedu_sigmed_service import get_minedu_sigmed_service
from services.historical_data_service import historical_service


class TestMineduSigmedIntegration(unittest.TestCase):

    def setUp(self):
        self.minedu_svc = get_minedu_sigmed_service()
        self.hist_svc = historical_service

    def test_seed_loading_and_district_query(self):
        """Verifica que el servicio cargue la semilla y responda para distritos emblemáticos."""
        data = self.minedu_svc.get_centros_educativos_por_ubigeo("150118")  # Lurigancho - Chosica
        self.assertEqual(data["ubigeo"], "150118")
        self.assertGreater(data["total_servicios_educativos"], 0)
        self.assertGreater(data["total_publicas"], 0)
        self.assertGreater(data["total_albergues_potenciales"], 0)
        self.assertEqual(data["fuente_valida"], "SRC-MINEDU-ESCALE-SIGMED-2026")

    def test_albergues_indeci_ranking(self):
        """Verifica que los albergues recomendados sean públicos y posean código de local."""
        albergues = self.minedu_svc.get_albergues_temporales_indeci("150118", max_results=5)
        self.assertGreater(len(albergues), 0)
        for alb in albergues:
            self.assertEqual(alb["gestion"], "PUBLICA")
            self.assertTrue(bool(alb["codigo_local"].strip()))
            self.assertTrue(alb["es_albergue_potencial"])

    def test_historical_service_enrichment(self):
        """Verifica que get_historical_district_memory incluya centros educativos y albergues."""
        memoria = self.hist_svc.get_historical_district_memory("150118")
        self.assertIn("centros_educativos", memoria)
        self.assertIn("albergues_temporales_indeci", memoria)
        self.assertGreater(len(memoria["albergues_temporales_indeci"]), 0)

    def test_official_sources_catalog_metrics(self):
        """Verifica que MINEDU / ESCALE SIGMED figure en las fuentes oficiales del resumen métrico."""
        metrics = self.hist_svc.get_historical_summary_metrics()
        fuentes_nombres = [f["fuente"] for f in metrics["fuentes_oficiales"]]
        self.assertTrue(any("MINEDU / ESCALE" in f for f in fuentes_nombres))


if __name__ == "__main__":
    unittest.main()
