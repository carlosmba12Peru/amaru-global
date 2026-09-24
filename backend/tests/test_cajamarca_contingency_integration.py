"""
Pruebas de Integración para el Módulo de Contingencia y Modelación Hidráulica de Cajamarca
(Distrito Eduardo Villanueva - Cuenca Crisnejas - PPRRD SIGRID 21362 / PISCO).
"""

import unittest
import sys
from pathlib import Path

# Añadir backend al sys.path
backend_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_dir))

from services.cajamarca_contingency_service import cajamarca_contingency_service


class TestCajamarcaContingencyIntegration(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.service = cajamarca_contingency_service

    def test_documento_metadatos(self):
        meta = self.service.get_documento_info()
        self.assertEqual(meta["sigrid_codigo"], 21362)
        self.assertEqual(meta["ubigeo"], "061003")
        self.assertEqual(meta["distrito"], "Eduardo Villanueva")
        self.assertEqual(meta["provincia"], "San Marcos")
        self.assertEqual(meta["departamento"], "Cajamarca")
        self.assertIn("Wilder Alex Ávila Tirado", meta["autoridad_edil"])
        self.assertEqual(meta["marco_aprobacion"]["resolucion_alcaldia_gtgrd"], "Resolución de Alcaldía N° 098-2024-MDEV-A")

    def test_puntos_criticos_count_and_details(self):
        puntos = self.service.get_puntos_criticos()
        self.assertEqual(len(puntos), 9)

        # Verificar Quebrada Cedrocucho (Aguas Calientes)
        cedrocucho = next(p for p in puntos if p["id"] == "MDEV-EST-01")
        self.assertIn("Cedrocucho", cedrocucho["denominacion"])
        self.assertEqual(cedrocucho["nivel_peligro"], "MUY ALTO")
        self.assertEqual(cedrocucho["elementos_expuestos"]["poblacion_afectada"], 449)
        self.assertEqual(cedrocucho["elementos_expuestos"]["viviendas_expuestas"], 342)
        self.assertEqual(cedrocucho["metrados_obra"]["descolmatacion_cauce_km"], 1.324)
        self.assertEqual(cedrocucho["metrados_obra"]["dique_material_propio_km"], 0.889)
        self.assertEqual(cedrocucho["metrados_obra"]["enrocado_proteccion_km"], 0.889)
        self.assertEqual(cedrocucho["presupuesto_estimado_pen"], 3000000.0)

        # Verificar Quebrada Yunguilla (Aguas Calientes / El Chirimoyo)
        yunguilla = next(p for p in puntos if p["id"] == "MDEV-EST-02")
        self.assertIn("Yunguilla", yunguilla["denominacion"])
        self.assertEqual(yunguilla["elementos_expuestos"]["poblacion_afectada"], 810)
        self.assertEqual(yunguilla["elementos_expuestos"]["viviendas_expuestas"], 365)
        self.assertEqual(yunguilla["presupuesto_estimado_pen"], 3000000.0)

        # Sumatoria de cartera estructural
        total_pen = sum(p["presupuesto_estimado_pen"] for p in puntos)
        self.assertEqual(total_pen, 25870000.0)

    def test_simulacion_pisco_baseline(self):
        sim = self.service.simulate_hydraulics_pisco(
            rainfall_multiplier=1.0,
            storm_intensity_mm_h=35.0,
            storm_duration_hours=3.0
        )
        self.assertIn("celdas_pisco", sim)
        self.assertEqual(len(sim["celdas_pisco"]), 4)
        self.assertEqual(sim["parametros_simulacion"]["precipitacion_acumulada_mm"], 105.0)

        # Verificar que cada celda tenga caudal pico positivo y tiempo de retardo
        for c in sim["celdas_pisco"]:
            self.assertGreater(c["caudal_pico_estimado_m3_s"], 0)
            self.assertGreater(c["tiempo_retardo_tlag_h"], 0)
            self.assertGreater(c["tiempo_anticipacion_alerta_h"], 0)
            self.assertIn("nivel_alerta", c)

    def test_simulacion_pisco_extreme_triggers_red_alert(self):
        sim_extreme = self.service.simulate_hydraulics_pisco(
            rainfall_multiplier=2.0,
            storm_intensity_mm_h=55.0,
            storm_duration_hours=4.0
        )
        self.assertEqual(sim_extreme["parametros_simulacion"]["precipitacion_acumulada_mm"], 440.0)
        self.assertIn("ALERTA ROJA ACTIVA", sim_extreme["resumen_alerta_distrital"])

        # Quebrada Cedrocucho debe estar en Alerta Roja
        cedro_sim = next(c for c in sim_extreme["celdas_pisco"] if "CEDROCUCHO" in c["celda_id"])
        self.assertIn("ROJA", cedro_sim["nivel_alerta"])

    def test_audit_pp0068_cajamarca(self):
        audit = self.service.audit_pp0068_cajamarca()
        self.assertEqual(audit["inversion_estructural_requerida_pen"], 25870000.0)
        self.assertGreater(audit["brecha_financiera_pen"], 22000000.0)
        self.assertLess(audit["ratio_cobertura_financiera_pct"], 1.0)
        self.assertIn("0% de ejecución", audit["alerta_forense"]["patron_paralisis"])
        self.assertIn("FONDES", audit["alerta_forense"]["estrategia_recomendada"])

    def test_ioarr_fondes_generation(self):
        ioarr = self.service.generate_ioarr_fondes_package("MDEV-EST-01")
        self.assertEqual(ioarr["codigo_intervencion"], "MDEV-EST-01")
        self.assertEqual(ioarr["costo_total_obra_pen"], 3000000.0)
        self.assertEqual(len(ioarr["componentes_tecnicos_boq"]), 3)
        self.assertEqual(len(ioarr["sello_criptografico_sha256"]), 64)
        self.assertIn("FONDES", ioarr["certificacion_validez"])

        # Verificar que falle con un ID inválido
        with self.assertRaises(ValueError):
            self.service.generate_ioarr_fondes_package("ID_INEXISTENTE")

    def test_dossier_transferencia_sha256(self):
        dossier = self.service.generate_dossier_transferencia_2026()
        self.assertEqual(dossier["fecha_cierre_mandato"], "2026-12-31")
        self.assertIn("Wilder Alex Ávila Tirado", dossier["autoridad_saliente"])
        self.assertEqual(len(dossier["cartera_proyectos_priorizados"]), 9)
        self.assertEqual(len(dossier["sello_criptografico_sha256"]), 64)
        self.assertIn("OPONIBLE", dossier["estado_juridico"])
        self.assertIn("100 días", dossier["notificacion_vinculante"])


if __name__ == "__main__":
    unittest.main()
