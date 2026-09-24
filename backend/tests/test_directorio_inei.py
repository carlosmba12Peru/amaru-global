"""
Unit Tests para Directorio Nacional de Municipalidades INEI 2026
Verifica:
1. Carga íntegra de los 1,893 gobiernos locales del Perú (196 provinciales, 1,697 distritales).
2. Recuperación por UBIGEO de Alcalde Titular (Presidente GT-GRD / Ley 29664), teléfonos, correos y sede COED.
3. Enriquecimiento de get_district_full_profile y get_historical_district_memory.
4. Presencia en el catálogo de fuentes oficiales y métricas de AMARU-CLIMATE.
"""

import unittest
import sys
from pathlib import Path

backend_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_dir))

from services.historical_data_service import historical_service


class TestDirectorioMunicipalInei2026(unittest.TestCase):

    def setUp(self):
        self.hist_svc = historical_service

    def test_directorio_inei_loaded(self):
        """Verifica que el diccionario de municipalidades INEI 2026 esté cargado con cobertura nacional."""
        munis = self.hist_svc.municipalidades_por_ubigeo
        self.assertGreater(len(munis), 1850)

    def test_query_chosica_150118(self):
        """Verifica la recuperación exacta de la municipalidad de Lurigancho - Chosica (150118)."""
        muni = self.hist_svc.get_municipalidad_por_ubigeo("150118")
        self.assertIsNotNone(muni)
        self.assertEqual(muni["ubigeo"], "150118")
        self.assertEqual(muni["distrito"].upper(), "LURIGANCHO")
        self.assertIn("OSWALDO", muni["alcalde"].upper())
        self.assertIn("VARGAS", muni["alcalde"].upper())
        self.assertTrue(bool(muni["telefono"].strip()))
        self.assertTrue(bool(muni["correo"].strip()))
        self.assertTrue(bool(muni["direccion"].strip()))
        self.assertEqual(muni["fecha_corte"], "02/09/2026")

    def test_query_catacaos_200105(self):
        """Verifica la recuperación de Catacaos - Piura (200105)."""
        muni = self.hist_svc.get_municipalidad_por_ubigeo("200105")
        self.assertIsNotNone(muni)
        self.assertEqual(muni["ubigeo"], "200105")
        self.assertEqual(muni["departamento"].upper(), "PIURA")
        self.assertTrue(bool(muni["alcalde"].strip()))
        self.assertTrue(bool(muni["telefono"].strip()))

    def test_district_full_profile_enrichment(self):
        """Verifica que get_district_full_profile integre el Alcalde y Sede COED en contacto_defensa_civil."""
        perfil = self.hist_svc.get_district_full_profile("150118")
        contacto = perfil.get("contacto_defensa_civil", {})
        self.assertIsNotNone(contacto.get("alcalde"))
        self.assertIn("OSWALDO", contacto["alcalde"].upper())
        self.assertIn("VARGAS", contacto["alcalde"].upper())
        self.assertIsNotNone(contacto.get("sede_coed"))
        self.assertIn("INEI", contacto.get("fuente", ""))
        self.assertIn("autoridad_municipal_inei", perfil)

    def test_historical_memory_enrichment(self):
        """Verifica que get_historical_district_memory contenga autoridad_municipal_inei."""
        memoria = self.hist_svc.get_historical_district_memory("150118")
        self.assertIn("autoridad_municipal_inei", memoria)
        self.assertEqual(memoria["autoridad_municipal_inei"]["ubigeo"], "150118")

    def test_official_sources_catalog_metrics(self):
        """Verifica que INEI figure en las fuentes oficiales del resumen métrico."""
        metrics = self.hist_svc.get_historical_summary_metrics()
        fuentes_nombres = [f["fuente"] for f in metrics["fuentes_oficiales"]]
        self.assertTrue(any("INEI" in f for f in fuentes_nombres))


if __name__ == "__main__":
    unittest.main()
