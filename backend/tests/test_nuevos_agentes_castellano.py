# backend/tests/test_nuevos_agentes_castellano.py
"""
Suite de Pruebas Unitarias y de Integración para los Nuevos Agentes Soberanos en Castellano:
1. Agente FISCALIZADOR (Presupuesto MEF & Contrataciones SEACE)
2. Agente COMUNITARIO (Veeduría Territorial, Crowdsourcing & Filtro Anti-Bulos)
3. Agente SATELITAL (Radar SAR Sentinel-1 & Seguro Agrícola Catastrófico SAC)
"""
import unittest
from fastapi.testclient import TestClient

from agents.fiscalizador_agent import FiscalizadorAgent, agente_fiscalizador
from agents.comunitario_agent import ComunitarioAgent, agente_comunitario
from agents.satelital_agent import SatelitalAgent, agente_satelital
from agents.schemas import (
    RazonabilidadPrecioRequest,
    CitizenReportInput
)
from main import app


class TestNuevosAgentesCastellano(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        cls.fiscalizador = agente_fiscalizador
        cls.comunitario = agente_comunitario
        cls.satelital = agente_satelital
        cls.client = TestClient(app)

    # ==========================================================================
    # 1. PRUEBAS DEL AGENTE FISCALIZADOR
    # ==========================================================================
    def test_01_fiscalizador_consultar_presupuesto_mef(self):
        """Valida que el Agente Fiscalizador obtenga los saldos del PP 0068 y FONDES."""
        presupuesto = self.fiscalizador.consultar_presupuesto_distrital("200104")
        self.assertEqual(presupuesto.ubigeo, "200104")
        self.assertTrue(len(presupuesto.distrito) > 0)
        self.assertGreater(presupuesto.pim_pp0068_pen, 0.0)
        self.assertGreater(presupuesto.saldo_disponible_pp0068_pen, 0.0)
        self.assertGreaterEqual(presupuesto.saldo_fondes_pen, 0.0)
        self.assertEqual(len(presupuesto.hash_sha256_consulta), 64)

    def test_02_fiscalizador_razonabilidad_precios_conforme(self):
        """Valida que un precio dentro de la banda tolerable reciba Dictamen Conforme."""
        req = RazonabilidadPrecioRequest(
            tipo_maquinaria="Cargador Frontal 950",
            precio_hora_ofertado_pen=350.0,
            departamento="Piura"
        )
        res = self.fiscalizador.evaluar_razonabilidad_contratacion(req)
        self.assertTrue(res.es_razonable)
        self.assertIn("CONFORMIDAD FISCAL", res.dictamen_anticorrupcion)
        self.assertLessEqual(res.precio_hora_ofertado_pen, res.limite_superior_tolerable_pen)

    def test_03_fiscalizador_razonabilidad_precios_alerta_sobreprecio(self):
        """Valida que un precio abusivo sea marcado con ALERTA DE SOBREPRECIO para OCI/CGR."""
        req = RazonabilidadPrecioRequest(
            tipo_maquinaria="Cargador Frontal 950",
            precio_hora_ofertado_pen=650.0,  # Exceso grave frente al límite de 390
            departamento="Piura"
        )
        res = self.fiscalizador.evaluar_razonabilidad_contratacion(req)
        self.assertFalse(res.es_razonable)
        self.assertIn("ALERTA DE SOBREPRECIO", res.dictamen_anticorrupcion)
        self.assertGreater(res.porcentaje_desviacion, 50.0)

    def test_04_fiscalizador_dictamen_fiscal_emergencia(self):
        """Valida la emisión del folio fiscal inmutable con firma SHA-256."""
        dictamen = self.fiscalizador.emitir_dictamen_fiscal_emergencia(
            ubigeo="200104",
            monto_comprometido_pen=250000.0,
            todos_precios_razonables=True
        )
        self.assertTrue(dictamen.folio_fiscal.startswith("FOLIO-FISCAL-"))
        self.assertTrue(dictamen.disponibilidad_presupuestal_certificada)
        self.assertEqual(len(dictamen.hash_sha256), 64)
        self.assertIn("FAVORABLE", dictamen.resumen_dictamen)

    # ==========================================================================
    # 2. PRUEBAS DEL AGENTE COMUNITARIO
    # ==========================================================================
    def test_05_comunitario_filtro_anti_hoax_genuino(self):
        """Valida que un reporte consistente con telemetría de lluvia sea catalogado GENUINO."""
        rep = CitizenReportInput(
            ubigeo="150118",
            distrito="Lurigancho-Chosica",
            latitud=-11.93,
            longitud=-76.69,
            tipo_incidente="QUEBRADA_ACTIVADA",
            descripcion="El agua con lodo comenzó a bajar por la quebrada Pedregal con fuerte sonido de piedras"
        )
        verif = self.comunitario.verificar_reporte_ciudadano(
            reporte=rep,
            lluvia_acumulada_24h_mm=38.5,
            es_zona_quebrada=True
        )
        self.assertTrue(verif.es_autentico)
        self.assertEqual(verif.clasificacion_anti_hoax, "GENUINO_VERIFICADO")
        self.assertGreater(verif.score_confianza_antibullying, 90.0)
        self.assertEqual(len(verif.hash_sha256_evidencia), 64)

    def test_06_comunitario_filtro_anti_hoax_desinformacion_detectada(self):
        """Valida que un reporte de huaico con 0 mm de lluvia sea descartado como FALSO/RECICLADO."""
        rep = CitizenReportInput(
            ubigeo="150118",
            distrito="Lurigancho-Chosica",
            latitud=-11.93,
            longitud=-76.69,
            tipo_incidente="HUAICO_MASIVO",
            descripcion="¡Urgente huaico gigante destruyendo casas en Chosica ahora mismo!"
        )
        verif = self.comunitario.verificar_reporte_ciudadano(
            reporte=rep,
            lluvia_acumulada_24h_mm=0.2,  # Lluvia nula en radares
            es_zona_quebrada=True
        )
        self.assertFalse(verif.es_autentico)
        self.assertEqual(verif.clasificacion_anti_hoax, "SOSPECHOSO_RECICLADO_O_FALSO")
        self.assertIn("DESINFORMACIÓN DETECTADA", verif.motivo_clasificacion)

    def test_07_comunitario_monitoreo_ollas_comunes(self):
        """Valida el cálculo de víveres y agua para Ollas Comunes bajo Ley 31458."""
        ollas = self.comunitario.monitorear_ollas_comunes("150118", severidad_emergencia="ALTA")
        self.assertGreater(len(ollas), 0)
        primera = ollas[0]
        self.assertGreater(primera.beneficiarios_atendidos, 0)
        self.assertGreater(primera.requerimiento_alimentos_kg, 0.0)
        self.assertGreater(primera.requerimiento_agua_litros, 0.0)
        self.assertEqual(primera.prioridad_abastecimiento, "INMEDIATA_NIVEL_1")

    # ==========================================================================
    # 3. PRUEBAS DEL AGENTE SATELITAL
    # ==========================================================================
    def test_08_satelital_radar_sar_penetracion_nubes(self):
        """Valida que el Radar SAR procese la inundación con 99% de nubosidad."""
        eval_sar = self.satelital.procesar_radar_sar_sentinel1(
            ubigeo="200104",  # Catacaos
            precipitacion_acumulada_mm=85.0,
            caudal_rio_m3s=1850.0
        )
        self.assertEqual(eval_sar.ubigeo, "200104")
        self.assertTrue(eval_sar.capacidad_penetracion_nubes)
        self.assertGreater(eval_sar.superficie_inundada_hectareas, 500.0)
        self.assertGreater(eval_sar.hectareas_agricolas_afectadas, 300.0)
        self.assertIn("Arroz", eval_sar.principales_cultivos_comprometidos)
        self.assertIn("Polygon", eval_sar.poligono_geojson_resumen["geometry"]["type"])
        self.assertEqual(len(eval_sar.hash_sha256_raster), 64)

    def test_09_satelital_activacion_seguro_agricola_sac(self):
        """Valida la generación del expediente paramétrico SAC (S/ 800 por hectárea)."""
        sac = self.satelital.evaluar_activacion_seguro_sac(
            ubigeo="200104",
            hectareas_afectadas=150.0,
            cultivo_predominante="Arroz"
        )
        self.assertEqual(sac.hectareas_elegibles_sac, 150.0)
        self.assertEqual(sac.monto_indemnizacion_estimado_pen, 150.0 * 800.0)  # S/ 120,000.00
        self.assertEqual(sac.estado_activacion, "EXPEDIENTE_PARAMETRICO_APROBADO")
        self.assertEqual(len(sac.hash_sha256), 64)

    # ==========================================================================
    # 4. PRUEBAS DE INTEGRACIÓN HTTP ENDPOINTS (API REST FASTAPI)
    # ==========================================================================
    def test_10_api_endpoints_nuevos_agentes(self):
        """Valida la disponibilidad HTTP y respuestas JSON de los 3 nuevos agentes."""
        # 1. Fiscalizador
        resp_fisc = self.client.get("/api/v1/agents/fiscalizador/presupuesto/200104")
        self.assertEqual(resp_fisc.status_code, 200)
        self.assertIn("saldo_disponible_pp0068_pen", resp_fisc.json())

        # 2. Comunitario
        resp_com = self.client.get("/api/v1/agents/comunitario/ollas-comunes/150118")
        self.assertEqual(resp_com.status_code, 200)
        self.assertIsInstance(resp_com.json(), list)

        # 3. Satelital
        resp_sat = self.client.get("/api/v1/agents/satelital/sar-evaluacion/200104?lluvia_mm=60.0")
        self.assertEqual(resp_sat.status_code, 200)
        self.assertIn("superficie_inundada_hectareas", resp_sat.json())


if __name__ == "__main__":
    unittest.main()
