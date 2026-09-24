"""
Pruebas de Validación Táctica: FASE 1 - Gemelo Digital de Servicios Básicos y Soporte Vital
AMARU-CLIMATE Lab4 — PTAPs, Subestaciones Eléctricas y Bocatomas Troncales
"""

import unittest
import sys
from pathlib import Path

# Agregar backend al path de python
BACKEND_DIR = Path(__file__).resolve().parent.parent
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from services.lifeline_infrastructure_service import lifeline_service


class TestLifelineInfrastructure(unittest.TestCase):

    def test_catalogo_lifelines_carga(self):
        """Verifica que el catálogo cargue todas las infraestructuras críticas con sus metadatos."""
        cat = lifeline_service.listar_catalogo()
        self.assertGreaterEqual(cat["total_ptaps"], 7, "Deben existir al menos 7 PTAPs críticas registradas")
        self.assertGreaterEqual(cat["total_subestaciones"], 5, "Deben existir al menos 5 Subestaciones Eléctricas registradas")
        self.assertGreaterEqual(cat["total_bocatomas"], 4, "Deben existir al menos 4 Bocatomas troncales registradas")

        # Verificar existencia de PTAP Curumuy y La Atarjea
        ptap_curumuy = lifeline_service.obtener_ptap("PTAP-PIU-01")
        self.assertIsNotNone(ptap_curumuy)
        self.assertEqual(ptap_curumuy["nombre"], "PTAP Curumuy")
        self.assertGreater(ptap_curumuy["caudal_distribucion_m3h"], 0)
        self.assertGreater(ptap_curumuy["volumen_reserva_total_m3"], 0)

        ptap_atarjea = lifeline_service.obtener_ptap("PTAP-LIM-01")
        self.assertIsNotNone(ptap_atarjea)
        self.assertIn("Atarjea", ptap_atarjea["nombre"])
        self.assertGreater(ptap_atarjea["poblacion_beneficiaria"], 5000000)

    def test_evaluacion_ptap_curumuy_operacion_normal(self):
        """Verifica la respuesta en condiciones normales de baja turbidez."""
        ev = lifeline_service.evaluar_ptap("PTAP-PIU-01", turbidez_ntu=450.0, porcentaje_reserva=100.0)
        self.assertEqual(ev["nivel_alerta"], "VERDE_NORMAL")
        self.assertEqual(ev["estado_compuertas"], "ABIERTAS_CAPTACION_NORMAL")
        self.assertTrue(ev["suministro_activo_por_red"])
        self.assertEqual(ev["autonomia_restante_horas"], 999.0)
        self.assertEqual(len(ev["sello_criptografico_sha256"]), 64)

    def test_evaluacion_ptap_curumuy_aluvion_y_cierre(self):
        """Verifica el cálculo de autonomía ante cierre forzoso por turbidez aluvial (> 10,000 NTU)."""
        # Curumuy: V_reserva = 50,000 m3, Q_distrib = 3,960 m3/h -> Autonomía teórica = 50,000 / 3,960 = 12.63 horas
        ev = lifeline_service.evaluar_ptap("PTAP-PIU-01", turbidez_ntu=14500.0, porcentaje_reserva=100.0)
        self.assertEqual(ev["estado_compuertas"], "CERRADAS_FORZOSO")
        self.assertEqual(ev["estado_operativo"], "CIERRE_CAPTACION_CRISIS")
        self.assertEqual(ev["nivel_alerta"], "AMARILLO_AUTONOMIA_LIMITADA")
        self.assertGreaterEqual(ev["autonomia_restante_horas"], 12.0)
        self.assertLessEqual(ev["autonomia_restante_horas"], 13.0)
        self.assertGreaterEqual(ev["logistica_cisternas"]["camiones_cisterna_requeridos"], 48)

    def test_evaluacion_ptap_curumuy_colapso_inminente(self):
        """Verifica la alerta roja de colapso inminente cuando la reserva cae por debajo de 4 horas."""
        # 20% de reserva = 10,000 m3 / 3,960 m3/h = ~2.52 horas
        ev = lifeline_service.evaluar_ptap("PTAP-PIU-01", turbidez_ntu=15000.0, porcentaje_reserva=20.0)
        self.assertEqual(ev["nivel_alerta"], "ROJO_COLAPSO_INMINENTE")
        self.assertLess(ev["autonomia_restante_horas"], 4.0)
        self.assertIn("COLAPSO INMINENTE", ev["mensaje_tactico_coen"])

    def test_evaluacion_subestacion_piura_oeste_seguridad_electrica(self):
        """Verifica la lógica de protección dieléctrica en la SE Piura Oeste ante inundación."""
        # 1. Patio seco
        ev_seco = lifeline_service.evaluar_subestacion("SE-PIU-01", tirante_inundacion_cm=0.0)
        self.assertEqual(ev_seco["nivel_alerta"], "VERDE_NORMAL")
        self.assertFalse(ev_seco["orden_corte_preventivo"])
        self.assertEqual(ev_seco["margen_seguridad_cm"], 45.0)

        # 2. Anegamiento medio que supera umbral crítico (35 cm) pero aún bajo zócalo (45 cm)
        ev_preventivo = lifeline_service.evaluar_subestacion("SE-PIU-01", tirante_inundacion_cm=38.0)
        self.assertEqual(ev_preventivo["nivel_alerta"], "NARANJA_DESCONEXION_PREVENTIVA")
        self.assertTrue(ev_preventivo["orden_corte_preventivo"])
        self.assertEqual(ev_preventivo["margen_seguridad_cm"], 7.0)
        self.assertGreaterEqual(len(ev_preventivo["hospitales_electrodependientes"]), 2)

        # 3. Inundación que sobrepasa el zócalo del transformador (45 cm)
        ev_emergencia = lifeline_service.evaluar_subestacion("SE-PIU-01", tirante_inundacion_cm=52.0)
        self.assertEqual(ev_emergencia["nivel_alerta"], "ROJO_DESCONEXION_EMERGENCIA")
        self.assertTrue(ev_emergencia["orden_corte_preventivo"])
        self.assertIn("DISPARO INMEDIATO", ev_emergencia["accion_tactica_coes_coen"])

    def test_evaluacion_bocatoma_los_ejidos_crecida(self):
        """Verifica la operación de compuertas de la Bocatoma Los Ejidos ante caudales de crecida."""
        # Umbral de palizadas = 1,200 m3/s
        ev_normal = lifeline_service.evaluar_bocatoma("BOC-PIU-01", caudal_afluente_m3s=300.0)
        self.assertEqual(ev_normal["nivel_alerta"], "VERDE_NORMAL")
        self.assertIn("DERIVACION_NORMAL", ev_normal["estado_compuertas"])

        ev_crecida = lifeline_service.evaluar_bocatoma("BOC-PIU-01", caudal_afluente_m3s=1800.0)
        self.assertEqual(ev_crecida["nivel_alerta"], "ROJO_CIERRE_DESVIACION")
        self.assertIn("DESCARGA_FONDO_TOTAL", ev_crecida["estado_compuertas"])

    def test_evaluacion_red_integral_simulacion_fen(self):
        """Verifica la respuesta global del tablero ante un impacto FEN aluvial severo."""
        res_global = lifeline_service.evaluar_red_completa(
            turbidez_simulada_ntu=16000.0,
            tirante_simulado_cm=48.0,
            caudal_simulado_factor=2.0
        )
        self.assertEqual(res_global["estado_general_lifelines"], "CRISIS_VITAL_ACTIVA")
        self.assertEqual(res_global["semaforo_tactico"], "ROJO")
        self.assertGreaterEqual(res_global["resumen_agua_potable"]["ptaps_cierre_forzoso"], 5)
        self.assertGreaterEqual(res_global["resumen_energia_electrica"]["subestaciones_orden_corte"], 3)
        self.assertGreater(len(res_global["resumen_energia_electrica"]["hospitales_electrodependientes_en_riesgo"]), 0)
        self.assertGreaterEqual(res_global["resumen_bocatomas"]["bocatomas_cerradas_palizadas"], 2)


if __name__ == "__main__":
    unittest.main()
