"""
Test Suite de Integración del Plan de Contingencia de Piura
AMARU-CLIMATE Lab4 (2026-2027)

Verifica la integración doctrinal de la UDEP, el blindaje ante Contraloría,
el soporte sanitario DSRSLCC y el catastro de cuencas ciegas SARE.
"""

import unittest
from services.piura_contingency_service import piura_contingency_service


class TestPiuraContingencyIntegration(unittest.TestCase):

    def setUp(self):
        self.service = piura_contingency_service

    def test_plan_integral_piura(self):
        """Verifica que el informe integral cumpla los 8 bloques INDECI con alta cobertura."""
        reporte = self.service.generar_reporte_plan_integral_piura()
        self.assertIn("cobertura_global_plan_contingencia_pct", reporte)
        self.assertGreaterEqual(reporte["cobertura_global_plan_contingencia_pct"], 85.0)
        self.assertEqual(len(reporte["bloques_evaluados"]), 8)
        self.assertEqual(reporte["estado_operativo"], "OPERATIVO_CONFORME_DIRECTIVA_CGR")
        
        pilares = reporte["pilares_doctrinales_integrados"]
        self.assertEqual(pilares["doctrina_udep_prof_chang"]["estado"], "ACTIVO")
        self.assertEqual(pilares["alerta_contraloria_pp0068"]["estado"], "ACTIVO")
        self.assertEqual(pilares["red_sanitaria_dsrslcc"]["estado"], "ACTIVO")
        self.assertEqual(pilares["catastro_sare_urbano"]["estado"], "ACTIVO")

    def test_transferencia_2026_vacio_100_dias(self):
        """Verifica que el expediente de transferencia contemple el vacío de 100 días y firma SHA-256."""
        transferencia = self.service.generar_expediente_transferencia_2026()
        self.assertEqual(transferencia["status"], "VALIDATED_CONTINUITY_DOSSIER")
        self.assertIn("hash_sha256_forense", transferencia)
        self.assertEqual(len(transferencia["hash_sha256_forense"]), 64)
        
        detalles = transferencia["detalles"]
        self.assertEqual(detalles["fecha_corte_mandato"], "2026-12-31T23:59:59Z")
        self.assertEqual(detalles["ventana_vulnerabilidad_dias"], 100)
        self.assertGreaterEqual(len(detalles["clausulas_continuidad_obligatorias"]), 4)

    def test_ordenanzas_propuestas(self):
        """Verifica la generación de las dos ordenanzas marco propuestas por la doctrina UDEP."""
        ordenanzas = self.service.generar_proyectos_ordenanza_normalizacion()
        self.assertEqual(len(ordenanzas), 2)
        ids = [o["ordenanza_id"] for o in ordenanzas]
        self.assertIn("ORD-MUN-PIURA-01", ids)
        self.assertIn("ORD-MUN-PIURA-02", ids)

    def test_auditoria_pp0068_contraloria(self):
        """Verifica la auditoría del Programa Presupuestal 0068 para Piura."""
        auditoria = self.service.auditar_ejecucion_pp0068_distritos_piura()
        self.assertIn("pim_total_analizado_pen", auditoria)
        self.assertGreater(auditoria["pim_total_analizado_pen"], 0)
        self.assertIn("alerta_control_concurrente", auditoria)
        
        # Verificar que Catacaos, Tambogrande y Las Lomas estén auditados
        distritos_map = {d["distrito"]: d for d in auditoria["distritos"]}
        self.assertIn("Catacaos", distritos_map)
        self.assertIn("Tambogrande", distritos_map)
        self.assertIn("Las Lomas", distritos_map)
        self.assertEqual(distritos_map["Las Lomas"]["avance_pct"], 0.0)

    def test_blindaje_contratacion_directa_sha256(self):
        """Verifica la generación del certificado pericial con hash SHA-256 para OCI."""
        for ubigeo in ["200101", "200105", "200114", "200111"]:
            cert = self.service.generar_blindaje_contratacion_directa(ubigeo)
            self.assertEqual(cert["status"], "APPROVED_FORENSIC_CERTIFICATE")
            self.assertIn("firma_sha256_oci", cert)
            self.assertEqual(len(cert["firma_sha256_oci"]), 64)
            self.assertIn("Ley N° 30225", cert["certificado_pericial"]["marco_normativo"])

    def test_salud_dsrslcc_y_alerta_dengue(self):
        """Verifica la ingesta de planes de salud DSRSLCC y cálculo del brote de dengue."""
        salud = self.service.obtener_diagnostico_salud_dsrslcc()
        self.assertIn("indicadores_capacidad_sanitaria", salud)
        self.assertGreaterEqual(len(salud["establecimientos_prioritarios_contingencia"]), 5)
        
        # Simular lluvia extrema de 85 mm (debe disparar nivel crítico y eclosión a 7 días)
        alerta_extrema = self.service.evaluar_riesgo_brote_dengue_post_lluvia(85.0)
        self.assertEqual(alerta_extrema["nivel_alerta_brote"], "ROJO_EPIDEMICO_CRITICO")
        self.assertEqual(alerta_extrema["dias_estimados_hasta_eclosion_vectorial"], 7)
        
        # Simular lluvia moderada de 50 mm (alerta temprana)
        alerta_moderada = self.service.evaluar_riesgo_brote_dengue_post_lluvia(50.0)
        self.assertEqual(alerta_moderada["nivel_alerta_brote"], "NARANJA_ALERTA_TEMPRANA")
        self.assertEqual(alerta_moderada["dias_estimados_hasta_eclosion_vectorial"], 10)

    def test_cuencas_ciegas_y_simulacion(self):
        """Verifica el catastro de cuencas ciegas y la simulación de bombeo SARE."""
        cuencas = self.service.listar_cuencas_ciegas_provinciales()
        self.assertIn("cuencas_ciegas_criticas", cuencas)
        self.assertGreaterEqual(len(cuencas["cuencas_ciegas_criticas"]), 6)
        
        # Simular bombeo para El Chilcal (CC-PIU-01) con 60 mm de lluvia
        sim = self.service.simular_evacuacion_cuenca_ciega("CC-PIU-01", 60.0)
        self.assertEqual(sim["cuenca_id"], "CC-PIU-01")
        self.assertGreater(sim["volumen_embalsado_m3"], 0)
        self.assertGreater(sim["tiempo_estimado_bombeo_horas"], 0)


if __name__ == "__main__":
    unittest.main()
