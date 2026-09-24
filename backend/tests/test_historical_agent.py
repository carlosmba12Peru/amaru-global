# backend/tests/test_historical_agent.py
"""
Suite de Pruebas Unitarias y de Integración: Agente de Memoria Histórica (YACHAY)
Verifica:
1. Evaluación análoga con HistoricalAgent en UBIGEO crítico (150118 - Chosica / 200101 - Piura).
2. Generación del vector tripartito:
   - Impacto climático análogo (1983, 1998, 2017, Yaku 2023)
   - Nodos de falla CAF y cruce con obras MEF PP 0068 (Art. 377 CP)
   - Caseríos con riesgo de aislamiento y bioindicadores ancestrales (Yachay)
3. Ejecución del pipeline de 6 agentes en run_coen_agent_pipeline con traza inmutable del Agente 2.
"""
import os
import sys
import unittest
import asyncio

# Configurar path
BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PROJECT_DIR = os.path.dirname(BACKEND_DIR)
for p in [PROJECT_DIR, BACKEND_DIR]:
    if p not in sys.path:
        sys.path.insert(0, p)

from agents.historical_agent import historical_agent, HistoricalAgent
from agents.schemas import HistoricalAnalogueResult, TriageResult, HydroTelemetry, NationalValidationContext
from agents.orchestrator import run_coen_agent_pipeline


class TestHistoricalAgent(unittest.IsolatedAsyncioTestCase):
    async def test_historical_agent_direct_assessment(self):
        """Verifica que el Agente YACHAY genere la memoria histórica tripartita."""
        res: HistoricalAnalogueResult = await historical_agent.assess_history("200101")  # Piura
        
        # 1. Atributos básicos
        self.assertEqual(res.ubigeo, "200101")
        self.assertIn("PIURA", res.distrito.upper())
        self.assertGreater(res.similitud_porcentaje, 20.0)
        self.assertIn(res.evento_analogo_nombre, [
            "El Niño Costero 2017",
            "El Niño 1997-1998",
            "El Niño 1982-1983",
            "Ciclón Yaku 2023"
        ])

        # 2. Vertiente Climática
        self.assertGreaterEqual(res.lead_time_horas, 24)
        self.assertGreater(res.factor_amplificacion_fen, 1.0)
        self.assertIn("evento_referencia", res.impacto_climatico_analogo)

        # 3. Vertiente Gestión Pública & Infraestructura
        self.assertIsInstance(res.memoria_infraestructura_fallas, list)
        self.assertIsInstance(res.cruce_fiscal_obras, list)

        # 4. Vertiente Social y Bioindicadores
        self.assertIn("caserios_alto_riesgo_aislamiento", res.memoria_social_albergues)
        self.assertGreater(len(res.bioindicadores_ancestrales), 0)

        # 5. Doctrina y Lección Clave
        self.assertTrue(len(res.leccion_historica_clave) > 20)
        self.assertTrue(len(res.recomendacion_doctrinal) > 20)
        print(f"\n[Test YACHAY] Piura matching: {res.evento_analogo_nombre} ({res.similitud_porcentaje}%)")
        print(f"[Test YACHAY] Lección doctrinal: {res.recomendacion_doctrinal[:100]}...")

    async def test_coen_pipeline_6_agents_trace(self):
        """Verifica que el pipeline orqueste los 6 agentes con traza individual y analogo_historico poblado."""
        pipeline_resp = await run_coen_agent_pipeline("150118", force_critical=True)  # Chosica
        
        self.assertTrue(pipeline_resp.activacion_critica)
        self.assertIsNotNone(pipeline_resp.analogo_historico)
        self.assertEqual(pipeline_resp.analogo_historico.ubigeo, "150118")

        # Verificar que existan las 6 trazas en orden
        nombres_trazas = [t.agente for t in pipeline_resp.trazabilidad_agentes]
        self.assertEqual(len(nombres_trazas), 6)
        self.assertIn("1. Agente Centinela Hidrometeorológico", nombres_trazas[0])
        self.assertIn("2. Agente de Memoria Histórica y Análogos (YACHAY)", nombres_trazas[1])
        self.assertIn("3. Agente de Evaluación Táctica y Logística", nombres_trazas[2])
        self.assertIn("4. Agente Lingüístico Territorial e Inclusivo", nombres_trazas[3])
        self.assertIn("5. Agente Pericial ReNITLI", nombres_trazas[4])
        self.assertIn("6. Agente Despachador y Auditor de Canales", nombres_trazas[5])

        print(f"\n[Test Pipeline] 6 Trazas ejecutadas con éxito:")
        for t in pipeline_resp.trazabilidad_agentes:
            print(f"  - {t.agente}: {t.tiempo_ms} ms -> {t.resumen[:65]}...")


if __name__ == "__main__":
    unittest.main()
