# backend/tests/test_yupaq_agent.py
"""
Pruebas Unitarias y de Integración para el Agente YUPAQ
(Calculador e Ingeniero Científico Soberano de AMARU-CLIMATE)
"""
import unittest
import asyncio
from agents.yupaq_agent import yupaq_agent, YupaqAgent


class TestYupaqAgent(unittest.TestCase):

    def setUp(self):
        self.agent = yupaq_agent

    def test_yupaq_metadata_and_identity(self):
        """Verifica la identidad soberana y normativa del Agente YUPAQ."""
        self.assertEqual(self.agent.agent_id, "AMARU-AGENT-YUPAQ-07")
        self.assertIn("YUPAQ", self.agent.nombre)
        self.assertIn("Ley Nº 31814", self.agent.normativa)

    def test_yupaq_circuit_breaker_integrity(self):
        """El Agente YUPAQ debe verificar la inmutabilidad SHA-256 de los pesos Saaty y Manning."""
        audit = self.agent.auditar_circuit_breaker()
        self.assertEqual(audit["estado"], "INTEGRO_VERIFICADO_OK")
        self.assertTrue(audit["iph_integro"])
        self.assertTrue(audit["irce_integro"])
        self.assertEqual(len(audit["hash_irce"]), 64)

    def test_yupaq_calcular_irce_con_radar_piura(self):
        """Valida el cálculo del IRCE Saaty AHP 4x4 con modulación de radar Nowcasting en Piura."""
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        try:
            res = loop.run_until_complete(
                self.agent.calcular_irce_con_radar(
                    ubigeo="200101",  # Piura
                    anomalia_tsm_nino12=2.8,
                    lluvia_24h_mm=55.0,
                    aplicar_radar=True
                )
            )
            self.assertEqual(res["ubigeo"], "200101")
            self.assertIn("certificacion_agente_yupaq", res)
            self.assertEqual(len(res["certificacion_agente_yupaq"]["sello_sha256"]), 64)
            self.assertGreaterEqual(res["score_irce"], 0.60)
            self.assertIn("desglose_saaty", res)
            self.assertAlmostEqual(res["blindaje_legal"]["ratio_consistencia_saaty_cr"], 0.0113, places=3)
        finally:
            loop.close()

    def test_yupaq_calcular_iph_quebrada_manning(self):
        """Valida el IPH para una quebrada crítica con física de Manning y cálculo de T_lag."""
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        try:
            res = loop.run_until_complete(
                self.agent.calcular_iph_quebrada(
                    id_o_nombre="Carossio",
                    lluvia_cabecera_mm_h=25.0,
                    lluvia_acumulada_24h=70.0,
                    saturacion_api_72h=45.0,
                    ubigeo_contexto="150118"
                )
            )
            self.assertEqual(res["estado"], "CALCULADO_OK")
            self.assertGreaterEqual(res["probabilidad_huaico_pct"], 85.0)
            self.assertEqual(res["nivel_alerta"], "ROJO_CRITICO")
            self.assertGreater(res["tiempo_retardo_minutos"], 0)
            self.assertIn("certificacion_agente_yupaq", res)
            self.assertEqual(len(res["certificacion_agente_yupaq"]["sello_sha256"]), 64)
        finally:
            loop.close()

    def test_yupaq_calcular_ipi_prioridad(self):
        """Valida el IPI (Matriz cuádruple CENEPRED + D.S. 124 + Heladas + RENALIO)."""
        res_ds124 = self.agent.calcular_ipi_prioridad(
            ubigeo="200101",
            peligro_cenepred="MUY_ALTO",
            declarado_ds124=True,
            es_zona_heladas=False,
            es_lengua_originaria=False
        )
        self.assertGreaterEqual(res_ds124["score_ipi"], 70.0)
        self.assertIn("PRIORIDAD", res_ds124["prioridad_atencion"])
        self.assertIn("certificacion_agente_yupaq", res_ds124)

    def test_yupaq_calcular_ish_heladas_altoandinas(self):
        """Valida el ISH (AMARU-CHIRI) para zonas de alta montaña sobre 3800 msnm."""
        res_helada = self.agent.calcular_ish_heladas(
            ubigeo="210505",  # Mazocruz - Puno
            delta_temp_nocturna=-12.0,
            altitud_msnm=4100.0,
            ratio_poblacion_vulnerable=0.45,
            ratio_carga_pecuaria=0.85
        )
        self.assertGreaterEqual(res_helada["score_ish"], 60.0)
        self.assertIn("HELADA", res_helada["nivel_alerta"])
        self.assertIn("camélidos", res_helada["accion_zoosanitaria_humanitaria"].lower())
        self.assertIn("certificacion_agente_yupaq", res_helada)

    def test_yupaq_calcular_tetra_indices_completo(self):
        """Valida la radiografía integral tetra-índice distrital."""
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        try:
            res = loop.run_until_complete(
                self.agent.calcular_tetra_indices_completo(
                    ubigeo="150118",  # Chosica
                    quebrada_id="Carossio"
                )
            )
            self.assertEqual(res["ubigeo"], "150118")
            self.assertIn("tetra_indices", res)
            self.assertIn("irce_macro_distrital", res["tetra_indices"])
            self.assertIn("ipi_prioridad_recursos", res["tetra_indices"])
            self.assertIn("iph_micro_quebrada", res["tetra_indices"])
            self.assertIn("fusion_climatica_ground_truth", res)
            self.assertEqual(len(res["auditoria_sha256"]), 64)
        finally:
            loop.close()


if __name__ == "__main__":
    unittest.main()
