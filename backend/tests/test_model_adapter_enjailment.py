# backend/tests/test_model_adapter_enjailment.py
"""
Suite de Pruebas: Enjaulamiento Cognitivo y Capa Agnóstica de Modelos (SAGF-MC Módulo 3)
Plataforma AMARU-CLIMATE / COEN-Digital
Objetivos: Anti Vendor Lock-In, Temperature=0.0, Resiliencia Offline en el Borde
"""

import unittest
import asyncio
import os
from services.model_adapter import (
    BaseModelAdapter,
    LocalDeterministicAdapter,
    GeminiModelAdapter,
    get_model_adapter
)
from agents.tactical_agent import TacticalAgent
from agents.schemas import TriageResult, NationalValidationContext, HydroTelemetry

class TestModelAdapterEnjailment(unittest.TestCase):

    def test_local_deterministic_adapter_execution(self):
        adapter = LocalDeterministicAdapter()
        self.assertEqual(adapter.get_provider_name(), "Motor Local Determinista (Cero Alucinación / Offline-First / ISO 27037)")

        prompt = "Evaluación técnica estructurada y boletín oficial para Lurigancho-Chosica"
        res = asyncio.run(adapter.generate_json(prompt))

        self.assertIn("accion_operativa_inmediata", res)
        self.assertIn("boletin_tecnico_oficial", res)
        self.assertIn("BOLETÍN SITUACIONAL", res["boletin_tecnico_oficial"])

    def test_gemini_adapter_fallback_when_no_api_key(self):
        # Cuando no hay API Key de Gemini, conmuta al motor local sin lanzar excepciones
        adapter = GeminiModelAdapter(api_key=None)
        res = asyncio.run(adapter.generate_json("Evaluación técnica estructurada boletín oficial"))
        self.assertIn("accion_operativa_inmediata", res)

    def test_adapter_factory_respects_env(self):
        os.environ["LLM_PROVIDER"] = "local"
        adapter = get_model_adapter()
        self.assertIsInstance(adapter, LocalDeterministicAdapter)

    def test_tactical_agent_assess_with_model_adapter(self):
        agent = TacticalAgent()
        mock_triage = TriageResult(
            ubigeo="150118",
            distrito="Lurigancho-Chosica",
            cuenca="Río Rímac",
            nivel_alerta="ROJO",
            criterio_disparo="Superación de umbral crítico de precipitación",
            is_critical=True,
            telemetria=HydroTelemetry(
                ubigeo="150118",
                nombre_distrito="Lurigancho-Chosica",
                cuenca="Río Rímac",
                precipitation_24h=85.5,
                soil_moisture=92.0,
                river_flow=110.0,
                cape_convectivo_j_kg=1200.0,
                modelo_numerico="ECMWF_IFS_9KM"
            ),
            validacion_nacional=NationalValidationContext(
                senamhi_ema_codigo="EMA_CHOSICA",
                senamhi_lluvia_real_24h_mm=82.0,
                enfen_status="ALERTA_EL_NINO_COSTERO",
                dhn_anomalia_tsm_c=2.4
            )
        )

        assessment = asyncio.run(agent.assess(mock_triage))
        self.assertEqual(assessment.ubigeo, "150118")
        self.assertEqual(assessment.distrito, "Lurigancho-Chosica")
        self.assertGreater(len(assessment.accion_operativa_inmediata), 10)
        self.assertIn("BOLETÍN SITUACIONAL", assessment.boletin_tecnico_oficial)
        self.assertGreater(len(assessment.maquinaria_recomendada), 0)

if __name__ == "__main__":
    unittest.main()
