# backend/tests/test_all_ai_agents_swarm.py
"""
Suite Maestra de Validación Exhaustiva de Códigos y Facultades de Todos los Agentes IA
Ecosistema AMARU-CLIMATE (Swarm Soberano de 9 Agentes Autónomos)

Agentes Evaluados:
1. SENTINEL: Vigilancia 24/7 y Triaje Hidrometeorológico Multicapa
2. TACTICAL: Comando y Control C2, Asignación de Maquinaria y Logística Humanitaria
3. HISTORICAL (YACHAY): Memoria Doctrinal de Desastres y Motor Análogo FEN
4. LINGUISTIC: Traducción Cultural Territorial en Lenguas Originarias (Runasimi/Aymara)
5. RENITLI: Fe Pública Pericial Lingüística (Ley 29735 / MINCUL)
6. DISPATCHER: Notificaciones de Emergencia CAP v1.2 y Depósito WORM
7. KURAQ: Curador & Centinela de Ingesta Multifuente Soberana (27 Fuentes)
8. QILQAY: Escribano Mayor y Redactor de Fe Pública Estatal (6 Facultades)
9. YUPAQ: Calculador e Ingeniero Científico Soberano (Tetra-Índices y Radares)
10. ORCHESTRATOR: Pipeline de Coordinación e Interoperabilidad Multi-Agente
"""
import unittest
import asyncio
from datetime import datetime, timezone

# 1. Imports de Agentes del Swarm
from agents.sentinel_agent import SentinelAgent
from agents.tactical_agent import TacticalAgent
from agents.historical_agent import HistoricalAgent, historical_agent
from agents.linguistic_agent import LinguisticAgent
from agents.renitli_agent import ReNITLIAgent
from agents.dispatcher_agent import DispatcherAgent
from agents.kuraq.kuraq_agent import kuraq_agent
from agents.qilqay_agent import qilqay_agent
from agents.yupaq_agent import yupaq_agent
from agents.fiscalizador_agent import agente_fiscalizador
from agents.comunitario_agent import agente_comunitario
from agents.satelital_agent import agente_satelital
from agents.schemas import RazonabilidadPrecioRequest, CitizenReportInput
from agents.orchestrator import run_coen_agent_pipeline
from schemas.qilqay_schema import QilqayDraftRequest, QilqayFacultadTematica, QilqayTipoDocumento


class TestAllAIAgentsSwarm(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        cls.sentinel = SentinelAgent()
        cls.tactical = TacticalAgent()
        cls.historical = historical_agent
        cls.linguistic = LinguisticAgent()
        cls.renitli = ReNITLIAgent()
        cls.dispatcher = DispatcherAgent()
        cls.kuraq = kuraq_agent
        cls.qilqay = qilqay_agent
        cls.yupaq = yupaq_agent
        cls.fiscalizador = agente_fiscalizador
        cls.comunitario = agente_comunitario
        cls.satelital = agente_satelital

    # --------------------------------------------------------------------------
    # 1. AGENTE SENTINEL (Data & Triage)
    # --------------------------------------------------------------------------
    def test_01_sentinel_agent_telemetry_and_triage(self):
        """Valida que SENTINEL procese telemetría Open-Meteo Pro, suelo 4 capas y triaje."""
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        try:
            triage = loop.run_until_complete(
                self.sentinel.evaluate_ubigeo("150118", force_critical=True)
            )
            self.assertEqual(triage.ubigeo, "150118")
            self.assertIn(triage.nivel_alerta, ["AMARILLO", "NARANJA", "ROJO"])
            self.assertTrue(triage.is_critical)
            self.assertIsNotNone(triage.telemetria)
            self.assertGreaterEqual(triage.telemetria.precipitation_24h, 0.0)
            self.assertIsNotNone(triage.telemetria.suelo_4_capas)
            self.assertGreaterEqual(triage.telemetria.suelo_4_capas.superficial_0_7cm, 0.0)
            self.assertTrue(triage.validacion_nacional.bias_correction_aplicado)
        finally:
            loop.close()

    # --------------------------------------------------------------------------
    # 2. AGENTE TACTICAL (C2 Assessment & Machinery)
    # --------------------------------------------------------------------------
    def test_02_tactical_agent_machinery_and_resources(self):
        """Valida que TACTICAL dimensione población expuesta y asigne maquinaria pesada."""
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        try:
            triage = loop.run_until_complete(
                self.sentinel.evaluate_ubigeo("200101", force_critical=True)
            )
            hist = loop.run_until_complete(
                self.historical.assess_history("200101", triage)
            )
            tactical_res = loop.run_until_complete(
                self.tactical.assess(triage, hist)
            )
            self.assertEqual(tactical_res.ubigeo, "200101")
            self.assertGreater(tactical_res.poblacion_expuesta_estimada, 0)
            self.assertGreater(len(tactical_res.maquinaria_recomendada), 0)
            tipos = [m.tipo for m in tactical_res.maquinaria_recomendada]
            self.assertTrue(any("Cargador" in t or "Volquete" in t for t in tipos))
            self.assertIn("BOLETÍN", tactical_res.boletin_tecnico_oficial.upper())
        finally:
            loop.close()

    # --------------------------------------------------------------------------
    # 3. AGENTE HISTORICAL / YACHAY (Doctrinal Memory & Analogs)
    # --------------------------------------------------------------------------
    def test_03_historical_agent_analog_matching_and_vetted_shelters(self):
        """Valida que YACHAY reconozca eventos análogos FEN y emita advertencias de albergues vetados."""
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        try:
            hist_res = loop.run_until_complete(
                self.historical.assess_history("200104")  # Catacaos
            )
            self.assertEqual(hist_res.ubigeo, "200104")
            self.assertIn("Niño", hist_res.evento_analogo_nombre)
            self.assertGreater(hist_res.similitud_porcentaje, 0.0)
            self.assertGreater(hist_res.factor_amplificacion_fen, 1.0)
            self.assertIn("memoria_social_albergues", hist_res.model_dump())
            self.assertGreater(len(hist_res.leccion_historica_clave), 10)
        finally:
            loop.close()

    # --------------------------------------------------------------------------
    # 4. AGENTE LINGUISTIC (Runasimi & Aymara Translation)
    # --------------------------------------------------------------------------
    def test_04_linguistic_agent_indigenous_language_dispatch(self):
        """Valida que LINGUISTIC traduzca alertas a Quechua Chanka/Collao y Aymara."""
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        try:
            triage = loop.run_until_complete(
                self.sentinel.evaluate_ubigeo("150118", force_critical=True)
            )
            hist = loop.run_until_complete(
                self.historical.assess_history("150118", triage)
            )
            tactical_res = loop.run_until_complete(
                self.tactical.assess(triage, hist)
            )
            ling_res = loop.run_until_complete(
                self.linguistic.translate_and_adapt(triage, tactical_res)
            )
            self.assertEqual(ling_res.ubigeo, "150118")
            self.assertIn("Quechua", ling_res.lengua_nombre)
            self.assertGreater(len(ling_res.mensaje_comunitario_lengua_originaria), 20)
            self.assertTrue(ling_res.es_bilingue)
            self.assertIn("Chosica", ling_res.distrito)
        finally:
            loop.close()

    # --------------------------------------------------------------------------
    # 5. AGENTE RENITLI (Legal Forensic Accreditation MINCUL)
    # --------------------------------------------------------------------------
    def test_05_renitli_agent_forensic_ticket(self):
        """Valida que RENITLI genere folios periciales con firma SHA-256 (Ley 29735)."""
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        try:
            triage = loop.run_until_complete(
                self.sentinel.evaluate_ubigeo("150118", force_critical=True)
            )
            tactical_res = loop.run_until_complete(
                self.tactical.assess(triage, None)
            )
            ling_res = loop.run_until_complete(
                self.linguistic.translate_and_adapt(triage, tactical_res)
            )
            ticket = self.renitli.generate_forensic_ticket(
                linguistic=ling_res,
                ubigeo="150118",
                incident_id="INC-2026-TEST"
            )
            self.assertTrue(ticket.folio_pericial.startswith("RENITLI-PERITAJE-"))
            self.assertIn("ReNITLI-MINCUL", ticket.perito_colegiado_asignado)
            self.assertEqual(len(ticket.hash_sha256_traduccion), 64)
            self.assertIn("Ley N.º 29735", ticket.normativa_aplicable)
        finally:
            loop.close()

    # --------------------------------------------------------------------------
    # 6. AGENTE DISPATCHER (OASIS CAP v1.2 & WORM Audit)
    # --------------------------------------------------------------------------
    def test_06_dispatcher_agent_cap_and_audit_trail(self):
        """Valida que DISPATCHER emita paquetes CAP v1.2 y registre auditoría WORM."""
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        try:
            triage = loop.run_until_complete(
                self.sentinel.evaluate_ubigeo("150118", force_critical=True)
            )
            tactical_res = loop.run_until_complete(
                self.tactical.assess(triage, None)
            )
            ling_res = loop.run_until_complete(
                self.linguistic.translate_and_adapt(triage, tactical_res)
            )
            audit = loop.run_until_complete(
                self.dispatcher.dispatch_and_audit(
                    incident_id="INC-DISP-01",
                    triage=triage,
                    tactical=tactical_res,
                    linguistic=ling_res,
                    start_time_ms=1000.0
                )
            )
            self.assertEqual(audit.incident_id, "INC-DISP-01")
            self.assertEqual(len(audit.canales), 2)
            self.assertTrue(audit.auditoria_registrada)
            self.assertGreaterEqual(audit.latencia_ms, 0.0)
        finally:
            loop.close()

    # --------------------------------------------------------------------------
    # 7. AGENTE KURAQ (Curador & Centinela Multifuente Soberano)
    # --------------------------------------------------------------------------
    def test_07_kuraq_agent_multisource_governance(self):
        """Valida que KURAQ supervise y audite el catálogo de fuentes oficiales con SHA-256."""
        inv = self.kuraq.get_inventory()
        self.assertTrue("Agente KURAQ" in inv["agente"] or "Agente CURADOR" in inv["agente"])
        self.assertGreaterEqual(inv["total_fuentes_registradas"], 20)
        self.assertEqual(inv["estado_agente"], "VIGILANCIA_PERMANENTE_24_7")
        self.assertIn("NTP-ISO/IEC 27037:2012", inv["estandar_evidencia"])

    # --------------------------------------------------------------------------
    # 8. AGENTE QILQAY (Escribano Mayor y Redactor de Fe Pública)
    # --------------------------------------------------------------------------
    def test_08_qilqay_agent_official_legal_drafting_and_pdf(self):
        """Valida que QILQAY redacte resoluciones reglamentarias y exporte PDF oficial con QR."""
        req = QilqayDraftRequest(
            ubigeo="200104",  # Catacaos
            facultad_tematica=QilqayFacultadTematica.JURIDICO_EDIL,
            tipo_documento=QilqayTipoDocumento.RESOLUCION_ALCALDIA,
            firmante_nombre="Econ. Johnny Cruz Flores",
            firmante_cargo="Alcalde Distrital de Catacaos",
            asunto="Declaratoria de Emergencia por desborde del Río Piura",
            instrucciones_adicionales="Desborde inminente del Río Piura por caudal superior a 1,800 m3/s"
        )
        doc = self.qilqay.redactar_documento(req)
        self.assertEqual(doc.tipo_documento, "RESOLUCION_ALCALDIA")
        self.assertEqual(len(doc.hash_sha256), 64)
        self.assertIn("RESOLUCIÓN DE ALCALDÍA", doc.titulo)
        self.assertIn("VISTO", doc.texto_completo_markdown)
        self.assertIn("ARTÍCULO PRIMERO", doc.texto_completo_markdown)

        # Validación de exportación PDF
        pdf_bytes = self.qilqay.exportar_pdf_oficial_bytes(doc.documento_id)
        self.assertIsNotNone(pdf_bytes)
        self.assertTrue(pdf_bytes.startswith(b"%PDF"), "Debe generar un binario PDF válido")

    # --------------------------------------------------------------------------
    # 9. AGENTE YUPAQ (Calculador e Ingeniero Científico Soberano)
    # --------------------------------------------------------------------------
    def test_09_yupaq_agent_canonical_tetra_indices(self):
        """Valida que YUPAQ ejecute el IRCE, IPH, IPI, ISH y audite su Circuit-Breaker."""
        # 1. Circuit Breaker
        cb = self.yupaq.auditar_circuit_breaker()
        self.assertEqual(cb["estado"], "INTEGRO_VERIFICADO_OK")
        self.assertTrue(cb["irce_integro"])
        self.assertTrue(cb["iph_integro"])

        # 2. IPI de asignación de recursos
        ipi = self.yupaq.calcular_ipi_prioridad(
            ubigeo="150118",
            peligro_cenepred="ALTO",
            declarado_ds124=True
        )
        self.assertGreater(ipi["score_ipi"], 50.0)
        self.assertIn("certificacion_agente_yupaq", ipi)

        # 3. ISH Heladas
        ish = self.yupaq.calcular_ish_heladas(
            ubigeo="210505",
            delta_temp_nocturna=-10.5,
            altitud_msnm=4200.0
        )
        self.assertGreater(ish["score_ish"], 50.0)

    # --------------------------------------------------------------------------
    # 10. ORCHESTRATOR SWARM E2E PIPELINE
    # --------------------------------------------------------------------------
    def test_10_orchestrator_pipeline_swarm_e2e(self):
        """Valida la ejecución secuencial integral del Swarm Multi-Agente en tiempo real."""
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        try:
            resp = loop.run_until_complete(
                run_coen_agent_pipeline("150118", force_critical=True)
            )
            self.assertTrue(resp.incident_id.startswith("INC-"))
            self.assertEqual(resp.ubigeo, "150118")
            self.assertTrue(resp.activacion_critica)
            self.assertEqual(len(resp.trazabilidad_agentes), 6)

            # Verificar que todos los agentes del pipeline ejecutaron en orden
            nombres_trazas = [t.agente for t in resp.trazabilidad_agentes]
            self.assertIn("1. Agente Centinela Hidrometeorológico", nombres_trazas[0])
            self.assertIn("2. Agente de Memoria Histórica y Análogos (YACHAY)", nombres_trazas[1])
            self.assertIn("3. Agente de Evaluación Táctica y Logística", nombres_trazas[2])
            self.assertIn("4. Agente Lingüístico Territorial e Inclusivo", nombres_trazas[3])
            self.assertIn("5. Agente Pericial ReNITLI (Fe Pública MINCUL Ley 29735)", nombres_trazas[4])
            self.assertIn("6. Agente Despachador y Auditor de Canales", nombres_trazas[5])
        finally:
            loop.close()

    # --------------------------------------------------------------------------
    # 11. AGENTE FISCALIZADOR (Presupuesto MEF & Contrataciones SEACE)
    # --------------------------------------------------------------------------
    def test_11_fiscalizador_agent_presupuesto_mef_and_seace(self):
        """Valida que FISCALIZADOR audite saldo PP 0068 y evalúe razonabilidad de precios de maquinaria."""
        presupuesto = self.fiscalizador.consultar_presupuesto_distrital("200104")
        self.assertGreater(presupuesto.pim_pp0068_pen, 0.0)
        self.assertGreater(presupuesto.saldo_disponible_pp0068_pen, 0.0)

        # Evaluación de razonabilidad
        req = RazonabilidadPrecioRequest(
            tipo_maquinaria="Cargador Frontal 950",
            precio_hora_ofertado_pen=340.0,
            departamento="Piura"
        )
        res = self.fiscalizador.evaluar_razonabilidad_contratacion(req)
        self.assertTrue(res.es_razonable)
        self.assertIn("CONFORMIDAD FISCAL", res.dictamen_anticorrupcion)

    # --------------------------------------------------------------------------
    # 12. AGENTE COMUNITARIO (Veeduría Territorial & Filtro Anti-Bulos)
    # --------------------------------------------------------------------------
    def test_12_comunitario_agent_veeduria_and_anti_hoax(self):
        """Valida que COMUNITARIO detecte bulos y catalogue reportes genuinos de quebradas."""
        rep = CitizenReportInput(
            ubigeo="150118",
            distrito="Lurigancho-Chosica",
            latitud=-11.93,
            longitud=-76.69,
            tipo_incidente="QUEBRADA_ACTIVADA",
            descripcion="El lodo baja con piedras por la quebrada Pedregal"
        )
        verif = self.comunitario.verificar_reporte_ciudadano(
            reporte=rep,
            lluvia_acumulada_24h_mm=32.0,
            es_zona_quebrada=True
        )
        self.assertTrue(verif.es_autentico)
        self.assertEqual(verif.clasificacion_anti_hoax, "GENUINO_VERIFICADO")

        # Monitoreo de Ollas Comunes
        ollas = self.comunitario.monitorear_ollas_comunes("150118")
        self.assertGreater(len(ollas), 0)
        self.assertGreater(ollas[0].requerimiento_alimentos_kg, 0.0)

    # --------------------------------------------------------------------------
    # 13. AGENTE SATELITAL (Radar SAR Sentinel-1 & Seguro Agrícola Catastrófico)
    # --------------------------------------------------------------------------
    def test_13_satelital_agent_radar_sar_and_seguro_sac(self):
        """Valida que SATELITAL penetre nubosidad con SAR Sentinel-1 y emita expediente SAC."""
        sar = self.satelital.procesar_radar_sar_sentinel1(
            ubigeo="200104",
            precipitacion_acumulada_mm=75.0,
            caudal_rio_m3s=1700.0
        )
        self.assertTrue(sar.capacidad_penetracion_nubes)
        self.assertGreater(sar.superficie_inundada_hectareas, 100.0)

        # Activación SAC
        sac = self.satelital.evaluar_activacion_seguro_sac(
            ubigeo="200104",
            hectareas_afectadas=120.0,
            cultivo_predominante="Arroz"
        )
        self.assertEqual(sac.monto_indemnizacion_estimado_pen, 120.0 * 800.0)
        self.assertEqual(sac.estado_activacion, "EXPEDIENTE_PARAMETRICO_APROBADO")


if __name__ == "__main__":
    unittest.main()

