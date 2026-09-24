"""
Suite de Pruebas Unitarias e Integración para la Suite Municipal 360° (AMARU-COEL C2)
======================================================================================
Valida:
  1. Consola de Obras FEN (PP 0068 & FONDES) con aislamiento por UBIGEO y cuellos de botella SIAF.
  2. Certificación de Razonabilidad de Maquinaria Pesada (Art. 27 Ley N.º 30225).
  3. Reloj FEN Municipal Micro-Calibrado (tc hidrológico, régimen preventivo / nowcasting).
  4. Endpoints REST de la Suite Municipal en FastAPI.
"""

import unittest
from fastapi.testclient import TestClient
from main import app
from services.municipal_obras_service import municipal_obras_service
from services.municipal_clock_service import municipal_clock_service


class TestMunicipalSuite360(unittest.IsolatedAsyncioTestCase):

    def setUp(self):
        self.client = TestClient(app)

    def test_01_obras_distritales_piura(self):
        """Valida aislamiento de obras PP 0068 para Piura (UBIGEO 200101)."""
        res = municipal_obras_service.get_obras_distritales("200101")
        self.assertEqual(res["ubigeo"], "200101")
        self.assertGreater(res["total_obras_cartera"], 0)
        self.assertGreater(res["pim_total_soles"], 0.0)
        self.assertIn("diagnostico_cuellos_botella", res)
        self.assertIn("cartera_obras", res)
        # Verificar que cada obra tiene atributos SIAF completos
        primera_obra = res["cartera_obras"][0]
        self.assertIn("cui", primera_obra)
        self.assertIn("cuello_botella_siaf", primera_obra)
        self.assertIn("semaforo_inaccion", primera_obra)

    def test_02_obras_distritales_chosica(self):
        """Valida aislamiento de obras PP 0068 para Lurigancho-Chosica (UBIGEO 150118)."""
        res = municipal_obras_service.get_obras_distritales("150118")
        self.assertEqual(res["ubigeo"], "150118")
        self.assertIn("diagnostico_cuellos_botella", res)
        self.assertIn("cartera_obras", res)

    def test_03_certificar_maquinaria_razonable(self):
        """Precio dentro de la banda oficial del MTC/SEACE (Tractor D8T a S/ 450.00/h)."""
        cert = municipal_obras_service.certificar_razonabilidad_maquinaria(
            tipo_maquinaria="TRACTOR_ORUGA_D8T",
            precio_hora_ofertado_pen=450.0,
            horas_estimadas=120.0
        )
        self.assertEqual(cert["dictamen_pericial"], "PRECIO_RAZONABLE_MERCADO")
        self.assertTrue(cert["aprobado_para_contratacion_directa"])
        self.assertEqual(cert["desviacion_porcentual"], 0.0)
        self.assertIn("Art. 27 Ley N.° 30225", cert["amparo_legal"])

    def test_04_certificar_maquinaria_sobreprecio(self):
        """Precio con sobrecosto especulativo (> 15% por encima de banda máxima)."""
        cert = municipal_obras_service.certificar_razonabilidad_maquinaria(
            tipo_maquinaria="TRACTOR_ORUGA_D8T",
            precio_hora_ofertado_pen=750.0,
            horas_estimadas=100.0
        )
        self.assertEqual(cert["dictamen_pericial"], "SOBREPRECIO_CRITICO_ESPECULATIVO")
        self.assertFalse(cert["aprobado_para_contratacion_directa"])
        self.assertGreater(cert["desviacion_porcentual"], 40.0)
        self.assertIn("SOBREPRECIO", cert["conclusion_pericial"])

    async def test_05_reloj_fen_municipal_piura(self):
        """Valida micro-calibración hidrológica para cuenca del Río Piura (tc=18h)."""
        reloj = await municipal_clock_service.get_reloj_fen_municipal("200101")
        self.assertEqual(reloj["ubigeo"], "200101")
        self.assertEqual(reloj["cuenca_hidrologica"]["tiempo_concentracion_tc_horas"], 18.0)
        self.assertIn("Piura", reloj["cuenca_hidrologica"]["nombre"])
        self.assertIn("reloj_polar_cinematica", reloj)
        self.assertIn("directiva_tactica_alcalde", reloj)

    async def test_06_reloj_fen_municipal_chosica(self):
        """Valida micro-calibración hidrológica para cuenca del Río Rímac (tc=2.5h)."""
        reloj = await municipal_clock_service.get_reloj_fen_municipal("150118")
        self.assertEqual(reloj["ubigeo"], "150118")
        cuenca_nom = reloj["cuenca_hidrologica"]["nombre"]
        self.assertTrue("R" in cuenca_nom and "mac" in cuenca_nom)

    def test_07_api_endpoints_municipal(self):
        """Valida que los nuevos endpoints REST respondan con HTTP 200 y JSON correcto."""
        # 1. Obras PP0068
        resp_obras = self.client.get("/api/v1/municipal/200101/obras-pp0068")
        self.assertEqual(resp_obras.status_code, 200)
        data_obras = resp_obras.json()
        self.assertEqual(data_obras["ubigeo"], "200101")

        # 2. Certificar maquinaria
        resp_cert = self.client.post(
            "/api/v1/municipal/200101/certificar-maquinaria",
            json={"tipo_maquinaria": "EXCAVADORA_ORUGA_330", "precio_hora_pen": 380.0, "horas_requeridas": 80.0}
        )
        self.assertEqual(resp_cert.status_code, 200)
        data_cert = resp_cert.json()
        self.assertEqual(data_cert["dictamen_pericial"], "PRECIO_RAZONABLE_MERCADO")

        # 3. Reloj FEN Municipal
        resp_reloj = self.client.get("/api/v1/municipal/200101/reloj-fen")
        self.assertEqual(resp_reloj.status_code, 200)
        data_reloj = resp_reloj.json()
        self.assertEqual(data_reloj["ubigeo"], "200101")
        self.assertIn("cuenca_hidrologica", data_reloj)

        # 4. Plan de Contingencia Digital
        resp_plan = self.client.get("/api/v1/municipal/200101/plan-contingencia-digital")
        self.assertEqual(resp_plan.status_code, 200)
        data_plan = resp_plan.json()
        self.assertEqual(data_plan["ubigeo"], "200101")
        self.assertIn("capitulo2_organizacion_mando", data_plan)
        self.assertIn("anexo_legal_resolucion_alcaldia", data_plan)

        # 5. PPRRD Digital
        resp_pprrd = self.client.get("/api/v1/municipal/200101/pprrd-digital")
        self.assertEqual(resp_pprrd.status_code, 200)
        data_pprrd = resp_pprrd.json()
        self.assertEqual(data_pprrd["ubigeo"], "200101")
        self.assertIn("matriz_inversion_pprrd", data_pprrd)


if __name__ == "__main__":
    unittest.main()
