# backend/tests/test_senamhi_radar.py
"""
Suite de pruebas unitarias para el Servicio de Radares Meteorológicos SENAMHI Banda C.
Verifica metadatos de Piura e Ica, ingesta de escaneos, estructuración de URLs, caché y nowcasting.
"""
import unittest
import asyncio
import sys
from pathlib import Path

backend_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_dir))

from services.national.senamhi_radar_service import senamhi_radar_service, RADARES_CATALOGO


class TestSenamhiRadarService(unittest.TestCase):

    def setUp(self):
        self.service = senamhi_radar_service

    def test_catalogo_radares_metadata(self):
        """Verifica que el catálogo incluya los radares de Piura e Ica con sus especificaciones."""
        self.assertIn("PIU", RADARES_CATALOGO)
        self.assertIn("ICA", RADARES_CATALOGO)

        piu = RADARES_CATALOGO["PIU"]
        self.assertEqual(piu["codigo"], "PIU")
        self.assertEqual(piu["region"], "Piura")
        self.assertIn("Banda C", piu["tecnologia"])
        self.assertGreaterEqual(piu["radio_cobertura_km"], 250)
        self.assertIn("Río Piura", piu["cuencas_vigiladas"])
        self.assertIn("HRef_QC", piu["productos_disponibles"])

    def test_get_radar_scans_structure(self):
        """Verifica la respuesta estructurada de escaneos del radar de Piura."""
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        try:
            data = loop.run_until_complete(
                self.service.get_radar_scans(localidad="PIU", producto="HRef_QC", nivel="E00p5")
            )
        finally:
            loop.close()

        self.assertIsInstance(data, dict)
        self.assertIn("radar", data)
        self.assertEqual(data["radar"]["codigo"], "PIU")
        self.assertIn("frames", data)
        self.assertGreater(data["total_frames"], 0)

        # Verificar primer frame
        first_frame = data["frames"][0]
        self.assertIn("frame_index", first_frame)
        self.assertIn("timestamp_utc_pe", first_frame)
        self.assertIn("imagen_url_completa", first_frame)
        self.assertTrue(first_frame["imagen_url_completa"].startswith("https://www.senamhi.gob.pe/"))

        # Verificar escala de reflectividad dBZ
        self.assertIn("escala_reflectividad_dbz", data)
        self.assertIn("40-50", data["escala_reflectividad_dbz"])

    def test_cache_mechanism(self):
        """Verifica que las llamadas consecutivas utilicen la caché en memoria."""
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        try:
            res1 = loop.run_until_complete(self.service.get_radar_scans(localidad="ICA", producto="HRef", nivel="E00p5"))
            res2 = loop.run_until_complete(self.service.get_radar_scans(localidad="ICA", producto="HRef", nivel="E00p5"))
        finally:
            loop.close()

        self.assertEqual(res1["total_frames"], res2["total_frames"])
        self.assertEqual(res1["radar"]["codigo"], "ICA")

    def test_nowcasting_risk_evaluation(self):
        """Verifica la emisión del dictamen de riesgo preliminar de Nowcasting."""
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        try:
            risk = loop.run_until_complete(self.service.evaluate_nowcasting_risk(localidad="PIU"))
        finally:
            loop.close()

        self.assertEqual(risk["localidad"], "PIU")
        self.assertEqual(risk["nowcasting_ventana_minutos"], 120)
        self.assertIn("VIGILANCIA", risk["nivel_amenaza_radar"])


if __name__ == "__main__":
    unittest.main()
