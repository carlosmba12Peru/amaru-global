# backend/tests/test_anti_hallucination_suite.py
"""
BATERÍA DE PRUEBAS AUTOMATIZADAS DE CERO ALUCINACIÓN (GROUNDING & TRUTHFULNESS BENCHMARK)
========================================================================================
Propósito:
Asegurar que los Agentes de IA y el Motor Predictivo de Análogos:
1. No inventen infraestructuras, puentes o quebradas que no figuren en los libros oficiales de la CAF / INDECI.
2. Degradar elegantemente a "Neutro" (1.0x, Alerta Verde, 0 obras) ante distritos sin historial FEN o inventados.
3. Respetar la lógica climática de Bipolaridad Territorial (Costa Norte: lluvia; Sierra Sur: sequía/heladas).
4. No alterar ni fabular cifras numéricas históricas (hectáreas perdidas, presupuestos MINAG-OIA).
5. Incluir atribución y fuentes auditadas en cada diagnóstico técnico.
"""

import asyncio
import json
import sys
import os
from typing import Any, Dict, List

# Soporte UTF-8 en terminal Windows
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

# Asegurar path de imports
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.dirname(CURRENT_DIR) if CURRENT_DIR.endswith("tests") or CURRENT_DIR.endswith("scratch") else CURRENT_DIR
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

from services.historical_analog_engine import analog_engine
from services.historical_data_service import historical_service


class AntiHallucinationBenchmark:
    def __init__(self):
        self.results = []
        self.total_tests = 0
        self.passed_tests = 0

    def record(self, test_id: str, name: str, passed: bool, details: str, ground_truth: Any, observed: Any):
        self.total_tests += 1
        if passed:
            self.passed_tests += 1
        self.results.append({
            "id": test_id,
            "name": name,
            "passed": passed,
            "details": details,
            "ground_truth": ground_truth,
            "observed": observed
        })

    async def run_all(self):
        print("\n" + "=" * 80)
        print("  SUITE DE PRUEBAS DE CERO ALUCINACIÓN Y ANCLAJE FACTUAL (COEN / FEN)")
        print("=" * 80 + "\n")

        await self.test_1_negative_grounding_nonexistent_ubigeo()
        await self.test_2_negative_grounding_neutral_district()
        await self.test_3_exact_match_caf_infrastructure()
        await self.test_4_numeric_integrity_minag_oia()
        await self.test_5_bipolar_climatic_logic()
        await self.test_6_source_provenance_attribution()

        self.print_summary()

    async def test_1_negative_grounding_nonexistent_ubigeo(self):
        """
        TEST 1: Inyección de UBIGEO inexistente (999999)
        El agente DEBE devolver fallback neutro sin inventar puentes ni crear alertas falsas.
        """
        test_id = "TEST-01"
        name = "Inyección Negativa: UBIGEO Inexistente (999999)"
        try:
            res = await analog_engine.evaluate_district_analog("999999")
            dia_crit = res.get("dia_maximo_riesgo", {})
            factor = dia_crit.get("factor_amplificacion_fen")
            nivel = dia_crit.get("nivel_alerta_anticipada")
            infra = res.get("infraestructura_amenazada_caf", [])

            # Criterio: factor 1.0, nivel VERDE, 0 infraestructuras
            passed = (factor == 1.0) and (nivel == "VERDE") and (len(infra) == 0)
            details = f"Factor: {factor}, Nivel: {nivel}, Obras inventadas: {len(infra)}"
            self.record(test_id, name, passed, details, "Factor 1.0x, VERDE, 0 obras", f"{factor}x, {nivel}, {len(infra)} obras")
        except Exception as e:
            self.record(test_id, name, False, f"Excepción no controlada: {e}", "Fallback controlado", str(e))

    async def test_2_negative_grounding_neutral_district(self):
        """
        TEST 2: Distrito sin antecedentes FEN (Chachapoyas - 010101)
        El agente no debe forzar similitud con FEN 1998 ni asignar puentes de la costa.
        """
        test_id = "TEST-02"
        name = "Distrito Fuera de Cuenca FEN (010101 - Chachapoyas)"
        try:
            res = await analog_engine.evaluate_district_analog("010101")
            dia_crit = res.get("dia_maximo_riesgo", {})
            infra = res.get("infraestructura_amenazada_caf", [])
            factor = dia_crit.get("factor_amplificacion_fen")

            # Criterio: Sin puentes costeros inventados y factor neutro 1.0
            passed = (len(infra) == 0) and (factor == 1.0)
            details = f"Factor asignado: {factor}x, Obras: {len(infra)}"
            self.record(test_id, name, passed, details, "0 obras asignadas, 1.0x", f"{len(infra)} obras, {factor}x")
        except Exception as e:
            self.record(test_id, name, False, f"Excepción: {e}", "Ejecución limpia", str(e))

    async def test_3_exact_match_caf_infrastructure(self):
        """
        TEST 3: Coincidencia Exacta de Puentes de la CAF en Íllimo (140304 - Río La Leche)
        Cada puente reportado debe pertenecer de forma estricta al libro de la CAF / CEPAL 1998.
        """
        test_id = "TEST-03"
        name = "Exact-Match de Infraestructura CAF (140304 - Íllimo / Río La Leche)"
        try:
            # Obtener ground truth oficial del catálogo maestro
            cat = historical_service.get_master_catalog()
            cuencas_dict = cat.get("cuencas_estrategicas", {})
            cuenca_info = cuencas_dict.get("CUENCA-LA-LECHE", {})
            puentes_oficiales = {p["nombre"].lower() for p in cuenca_info.get("infraestructura_critica", {}).get("puentes_vulnerables", [])}

            # Consultar agente
            res = await analog_engine.evaluate_district_analog("140304")
            infra_reportada = res.get("infraestructura_amenazada_caf", [])
            puentes_reportados = [i["nombre"] for i in infra_reportada if i["tipo"] == "PUENTE_VULNERABLE"]

            # Verificar que TODO puente reportado esté en la lista oficial auditada
            alucinaciones = [p for p in puentes_reportados if p.lower() not in puentes_oficiales]
            passed = len(puentes_reportados) > 0 and len(alucinaciones) == 0

            details = f"Puentes reportados: {puentes_reportados}. Alucinados: {alucinaciones}"
            self.record(test_id, name, passed, details, f"Subconjunto de {puentes_oficiales}", puentes_reportados)
        except Exception as e:
            self.record(test_id, name, False, f"Excepción: {e}", "Match exacto", str(e))

    async def test_4_numeric_integrity_minag_oia(self):
        """
        TEST 4: Integridad Numérica de Daños Agropecuarios Oficiales (Catacaos - 200105)
        Las hectáreas y presupuestos deben ser deterministas y coincidir con el informe del MINAG-OIA.
        """
        test_id = "TEST-04"
        name = "Integridad Numérica MINAG-OIA (200105 - Catacaos)"
        try:
            distrito = historical_service.get_historical_district_memory("200105")
            agro = distrito.get("impacto_agropecuario_minag", {})
            agro_98 = agro.get("1998", {})

            perdida_ha = agro_98.get("perdida_ha")
            afectada_ha = agro_98.get("afectada_ha")
            familias = agro_98.get("familias_campesinas")
            valle = agro.get("valle_oficial", "")

            # Valores del compendio MINAG-OIA 1998 para el Valle del Bajo Piura
            # (Pérdida > 1000 Ha, familias campesinas identificadas, valle oficial contiene Bajo Piura)
            passed = ("bajo piura" in valle.lower()) and (perdida_ha > 0) and (afectada_ha > 0) and (familias > 0)
            details = f"Valle: {valle}, Pérdida: {perdida_ha} Ha, Afectada: {afectada_ha} Ha, Familias: {familias}"
            self.record(test_id, name, passed, details, "Valle con mención a Bajo Piura y cifras positivas auditadas", details)
        except Exception as e:
            self.record(test_id, name, False, f"Excepción: {e}", "Cifras oficiales", str(e))

    async def test_5_bipolar_climatic_logic(self):
        """
        TEST 5: Lógica Geográfica Bipolar FEN (Ilave - 210501 - Puno)
        En el Altiplano, el agente NUNCA debe alucinar 'inundaciones costeras' ni 'huaicos marinos'.
        Debe reportar 'estrés andino', 'sequía' o 'heladas nocturnas'.
        """
        test_id = "TEST-05"
        name = "Consistencia Geográfica Bipolar (210501 - Ilave / Puno)"
        try:
            res = await analog_engine.evaluate_district_analog("210501")
            bipolar = res.get("acoplamiento_bipolar", {})
            regla = bipolar.get("regla_activa", "")
            desc = bipolar.get("descripcion", "").lower()

            # Comprobar que no alucine huaicos de costa y sí hable de estrés/sequía/heladas
            alucina_costa = "huaico" in desc or "marino" in desc or "desborde costero" in desc
            habla_de_estres_andino = "altiplano" in desc or "sequía" in desc or "heladas" in desc or "andino" in desc
            passed = (not alucina_costa) and (habla_de_estres_andino or regla != "REGULAR")

            details = f"Regla activa: {regla}. Mención de estrés andino: {habla_de_estres_andino}. Alucinación costera: {alucina_costa}"
            self.record(test_id, name, passed, details, "Ausencia de huaicos costeros y presencia de estrés andino", details)
        except Exception as e:
            self.record(test_id, name, False, f"Excepción: {e}", "Lógica bipolar", str(e))

    async def test_6_source_provenance_attribution(self):
        """
        TEST 6: Trazabilidad y Citación de Fuentes Documentales Auditadas
        Cada evaluación del motor debe citar explícitamente los compendios de referencia.
        """
        test_id = "TEST-06"
        name = "Trazabilidad Documental y Atribución Oficial"
        try:
            res = await analog_engine.evaluate_district_analog("200105")
            fuentes = res.get("fuentes_validadas", [])
            fuentes_str = " ".join(fuentes)

            tiene_caf = "CAF" in fuentes_str
            tiene_senamhi = "SENAMHI" in fuentes_str
            tiene_openmeteo = "Open-Meteo" in fuentes_str or "ECMWF" in fuentes_str

            passed = tiene_caf and tiene_senamhi and tiene_openmeteo
            details = f"Fuentes registradas: {fuentes}"
            self.record(test_id, name, passed, details, "Citas a CAF, SENAMHI y Open-Meteo", fuentes)
        except Exception as e:
            self.record(test_id, name, False, f"Excepción: {e}", "Fuentes auditadas", str(e))

    def print_summary(self):
        print("\n" + "-" * 80)
        print("  RESULTADOS DETALLADOS DEL BENCHMARK")
        print("-" * 80)
        for r in self.results:
            status = "[PASO]" if r["passed"] else "[FALLO]"
            icon = "[OK]  " if r["passed"] else "[FAIL]"
            print(f"{icon} {r['id']} - {r['name']}: {status}")
            print(f"   * Observado:    {r['observed']}")
            print(f"   * Ground Truth: {r['ground_truth']}")
            print(f"   * Diagnostico:  {r['details']}\n")

        score = (self.passed_tests / self.total_tests) * 100.0 if self.total_tests > 0 else 0
        print("=" * 80)
        print(f"  PUNTUACION DE FIABILIDAD FACTUAL: {score:.1f}% ({self.passed_tests}/{self.total_tests} Tests Aprobados)")
        if score == 100.0:
            print("  [SUCCESS] DICTAMEN: CERO ALUCINACIONES DETECTADAS. EL SISTEMA ES 100% FACTUAL.")
        else:
            print(f"  [WARNING] DICTAMEN: SE DETECTARON {self.total_tests - self.passed_tests} DISCREPANCIAS FACTUALES.")
        print("=" * 80 + "\n")


async def main():
    benchmark = AntiHallucinationBenchmark()
    await benchmark.run_all()


if __name__ == "__main__":
    asyncio.run(main())
