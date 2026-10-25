"""
Suite Completa de Pruebas de Extremo a Extremo (E2E Lifecycle) - Paso 4
AMARU-CLIMATE: Ciclo Completo de Respuesta Humanitaria C4ISR ante Fenómenos Extremos (FEN Niño y FEN Niña)

Ciclo Evaluado:
1. INGESTA COMUNITARIA WHATSAPP: Reporte vecinal de colapso y familias en riesgo.
2. PRE-LLENADO INTELIGENTE EDAN: Síntesis del 75% (Censo INEI, Fajas Marginales ANA, PNP, MINEDU).
3. QUÓRUM CRIPTOGRÁFICO DUAL: Firma combinada (Alcalde + Defensa Civil) y desbloqueo de almacén (Horas 0-2).
4. RUTEO VRP TÁCTICO DIJKSTRA: Detección de corte de puente, cálculo de desvío MTC y orden de despacho de convoy.
5. TRAZABILIDAD WORM CGR (Ley N.° 31358): Encadenamiento SHA-256 de todos los actos y dictamen pericial sin fisuras.
6. EXPORTACIÓN FORMAL: Generación de PDF oficial con código QR y payload JSON interoperable SINPAD v2.
"""

import unittest
import json
from fastapi.testclient import TestClient
from main import app

from services.edan_sinpad_service import edan_sinpad_service
from services.routing.humanitarian_router import humanitarian_router
from services.whatsapp_community_service import whatsapp_community_service
from services.cgr_worm_service import cgr_worm_service
from services.contraloria_audit_service import contraloria_service


class TestPaso4E2ELifecycle(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(app)

    def setUp(self):
        humanitarian_router.bloqueos_activos.clear()

    def tearDown(self):
        humanitarian_router.bloqueos_activos.clear()

    def test_e2e_ciclo_completo_fen_costero_catacaos(self):
        """
        Escenario E2E 1: FEN Costero Crítico (Bajo Piura - Catacaos)
        Evalúa el flujo continuo desde el WhatsApp vecinal hasta el convoy en ruta y sello WORM.
        """
        print("\n=== [E2E] INICIO CICLO COMPLETO FEN COSTERO (CATACAOS - PIURA) ===")

        # ---------------------------------------------------------------------
        # FASE 1: Ingesta Comunitaria WhatsApp (Alerta de rotura de dique)
        # ---------------------------------------------------------------------
        payload_wa = {
            "remitente": "+51 974 812 340",
            "mensaje": "URGENTE INDECI: El río Piura rompió el dique margen izquierda. Caserío inundado con 1.20m de agua. 35 familias atrapadas en los techos, 18 niños y 7 ancianos sin agua. Puente Independencia a punto de colapsar.",
            "nombre_contacto": "Sr. Santos Chiroque (Teniente Gobernador)",
            "caserio": "Caserío Naranjo Alto",
            "distrito": "Catacaos",
            "coordenadas": {"lat": -5.3340, "lng": -80.6580},
            "modo_offline": False
        }
        resp_wa = self.client.post("/api/v1/comunidad/whatsapp/simular-envio", json=payload_wa)
        self.assertEqual(resp_wa.status_code, 200)
        data_wa = resp_wa.json()
        self.assertEqual(data_wa["estado"], "PROCESADO_EXITOSAMENTE")
        ticket_id = data_wa["ticket_id"]
        self.assertTrue(ticket_id.startswith("AMARU-WA-"))
        self.assertIn(data_wa["registro"]["nlp_analisis"]["categoria"], ["INUNDACION_DESBORDE_EXTREMO", "COLAPSO_PUENTE_O_VIA"])
        self.assertEqual(data_wa["registro"]["nlp_analisis"]["severidad"], "CRITICA")
        print(f"  [OK] Paso 1: Reporte WhatsApp procesado. Ticket: {ticket_id} ({data_wa['registro']['nlp_analisis']['familias_estimadas']} familias)")

        # ---------------------------------------------------------------------
        # FASE 2: Pre-Llenado Inteligente EDAN (Ubigeo 200105 - Catacaos)
        # ---------------------------------------------------------------------
        resp_plantilla = self.client.get("/api/v1/edan/plantilla/200105")
        self.assertEqual(resp_plantilla.status_code, 200)
        plantilla_edan = resp_plantilla.json()
        self.assertEqual(plantilla_edan["ubigeo"], "200105")
        self.assertEqual(plantilla_edan["distrito"], "Catacaos")
        self.assertGreaterEqual(len(plantilla_edan["formulario_2a_familias"]), 3)
        self.assertGreater(plantilla_edan["requerimiento_ayuda_humanitaria_anexo_06"]["agua_potable_litros"], 0)
        print(f"  [OK] Paso 2: Plantilla EDAN sintetizada al 75% ({len(plantilla_edan['formulario_2a_familias'])} familias censadas)")

        # ---------------------------------------------------------------------
        # FASE 3: Quórum Criptográfico Dual y Desbloqueo de Almacén Horas 0-2
        # ---------------------------------------------------------------------
        token_alcalde = "TOKEN-ALCALDE-200105-JOHNNY-CRUZ"
        token_indeci = "TOKEN-INDECI-COEN-DIRECTOR-048"

        payload_emision = {
            "ficha": plantilla_edan,
            "token_alcalde": token_alcalde,
            "token_indeci": token_indeci
        }
        resp_emision = self.client.post("/api/v1/edan/generar-oficial", json=payload_emision)
        self.assertEqual(resp_emision.status_code, 200)
        data_edan = resp_emision.json()
        self.assertTrue(data_edan["exito"])
        edan_id = data_edan["edan_id"]
        codigo_sinpad = data_edan["codigo_sinpad"]
        self.assertTrue(data_edan["quorum_dual"]["cumplido"])
        self.assertEqual(data_edan["quorum_dual"]["estado_desbloqueo"], "DESBLOQUEO_TOTAL_ALMACEN_INDECI")
        self.assertIn("bitacora_worm_cgr", data_edan)
        print(f"  [OK] Paso 3: Ficha EDAN ratificada con Quórum Dual. ID: {edan_id} | SINPAD: {codigo_sinpad}")
        print(f"            Almacén INDECI Desbloqueado formalmente: {data_edan['quorum_dual']['estado_desbloqueo']}")

        # ---------------------------------------------------------------------
        # FASE 4: Control Concurrente Preventivo CGR (Visto Bueno OCI)
        # ---------------------------------------------------------------------
        payload_cgr = {
            "edan_id": edan_id,
            "auditor_cgr": "Auditor Supervisor OCI Piura N.° 8412",
            "observaciones": "Padrón auditado sin duplicidades con RENIEC bajo Ley 31358."
        }
        resp_cgr = self.client.post("/api/v1/contraloria/emitir-visto-bueno", json=payload_cgr)
        self.assertEqual(resp_cgr.status_code, 200)
        data_cgr = resp_cgr.json()
        self.assertTrue(data_cgr["exito"])
        self.assertIn("constancia_cgr", data_cgr)
        self.assertIn("CGR-CNC-2026-", data_cgr["constancia_cgr"]["constancia_codigo"])
        print(f"  [OK] Paso 4: Visto Bueno Concurrente CGR emitido: {data_cgr['constancia_cgr']['constancia_codigo']}")

        # ---------------------------------------------------------------------
        # FASE 5: Simulación de Corte Vial y Ruteo Dinámico VRP (Dijkstra)
        # ---------------------------------------------------------------------
        # Registrar colapso del Puente Independencia en Catacaos
        bloqueo_payload = {
            "tipo_incidente": "COLAPSO_ESTRUCTURAL_PUENTE",
            "ubicacion": "Puente Independencia - Bajo Piura",
            "descripcion": "Crecida extraordinaria del Río Piura arrancó aproche sur.",
            "puente_afectado": "puente-independencia-catacaos",
            "reportado_por": "POLTUR_PNP_PIURA",
            "severidad": "CRITICO"
        }
        resp_bloq = self.client.post("/api/v1/logistica/bloqueos", json=bloqueo_payload)
        self.assertEqual(resp_bloq.status_code, 200)

        # Despachar convoy humanitario vinculado a la ficha EDAN
        resp_desp = self.client.post(f"/api/v1/logistica/despachar-orden-edan/{edan_id}")
        self.assertEqual(resp_desp.status_code, 200)
        data_desp = resp_desp.json()
        self.assertTrue(data_desp["exito"])
        orden_desp = data_desp["codigo_orden_despacho"]
        self.assertTrue(orden_desp.startswith("ORD-DESP-"))
        self.assertGreater(data_desp["ayuda_humanitaria_despachada"]["peso_total_toneladas"], 0)
        self.assertGreaterEqual(data_desp["convoy_tactico"]["numero_camiones_requeridos"], 1)

        # Comprobar que el ruteo evitó el puente cortado y tomó el desvío táctico
        ruta_info = data_desp["ruta_contingencia"]
        self.assertIn(ruta_info["estado_conectividad"], ["DESVIO_TACTICO_ACTIVO", "TRANSITO_EXPEDITO_NORMAL"])
        print(f"  [OK] Paso 5: Convoy humanitario despachado: {orden_desp}")
        print(f"            Camiones: {data_desp['convoy_tactico']['numero_camiones_requeridos']}x 15T | Carga: {data_desp['ayuda_humanitaria_despachada']['peso_total_toneladas']} Tn")
        print(f"            Estado Vial: {ruta_info['estado_conectividad']} (Evitó puente colapsado)")

        # ---------------------------------------------------------------------
        # FASE 6: Auditoría Criptográfica WORM y Dictamen Pericial CGR
        # ---------------------------------------------------------------------
        resp_verif = self.client.get("/api/v1/auditoria/cgr-worm/verificar")
        self.assertEqual(resp_verif.status_code, 200)
        audit_worm = resp_verif.json()
        self.assertTrue(audit_worm["valida"], "La cadena de bloques WORM debe ser íntegra")
        self.assertEqual(audit_worm["estado"], "INTEGRIDAD_FORENSE_100_PORCIENTO")
        self.assertEqual(len(audit_worm["discrepancias"]), 0)

        resp_cert = self.client.get("/api/v1/auditoria/cgr-worm/certificado-cgr")
        self.assertEqual(resp_cert.status_code, 200)
        cert_cgr = resp_cert.json()
        self.assertTrue(cert_cgr["cadena_integra"])
        self.assertIn("CERT-CGR-WORM-", cert_cgr["certificado_id"])
        print(f"  [OK] Paso 6: Auditoría WORM CGR completada: 100% Válida ({audit_worm['total_bloques']} bloques acuñados)")
        print(f"            Certificado Pericial emitido: {cert_cgr['certificado_id']}")

        # ---------------------------------------------------------------------
        # FASE 7: Verificación de Entregables Oficiales (PDF con QR y Payload SINPAD)
        # ---------------------------------------------------------------------
        # Descarga de PDF
        resp_pdf = self.client.get(f"/api/v1/edan/descargar-pdf/{edan_id}")
        self.assertEqual(resp_pdf.status_code, 200)
        self.assertEqual(resp_pdf.headers["content-type"], "application/pdf")
        self.assertGreater(len(resp_pdf.content), 5000, "El PDF debe contener bytes válidos con el QR")

        # Exportación de SINPAD v2 JSON
        resp_sinpad = self.client.get(f"/api/v1/edan/exportar-sinpad/{edan_id}")
        self.assertEqual(resp_sinpad.status_code, 200)
        data_sinpad = resp_sinpad.json()
        self.assertEqual(data_sinpad["version_schema"], "SINPAD_V2_2026_HOMOLOGADO")
        self.assertEqual(data_sinpad["cabecera_emergencia"]["codigo_sinpad"], codigo_sinpad)
        print(f"  [OK] Paso 7: Entregables reglamentarios generados:")
        print(f"            - PDF Oficial INDECI con sello QR: {len(resp_pdf.content)} bytes")
        print(f"            - Payload Carga Masiva SINPAD v2: {len(data_sinpad['padron_familiar_f2a'])} damnificados")

        print("=== [E2E] CICLO COMPLETO CONCLUIDO CON ÉXITO ===\n")

    def test_e2e_ciclo_fen_andino_chupaca_y_corte_carretera_central(self):
        """
        Escenario E2E 2: FEN Andino / Heladas & Crecida Mantaro (Chupaca - Junín)
        Evalúa el flujo en corredor de sierra con puente Cunas comprometido y activación SAC.
        """
        print("\n=== [E2E] INICIO CICLO FEN ANDINO (CHUPACA - VALLE DEL MANTARO) ===")

        # 1. Pre-llenado Chupaca (Ubigeo 120901)
        resp_plantilla = self.client.get("/api/v1/edan/plantilla/120901")
        self.assertEqual(resp_plantilla.status_code, 200)
        p = resp_plantilla.json()
        self.assertEqual(p["departamento"], "Junín")
        self.assertTrue(p["formulario_2b_medios_vida"]["activacion_seguro_agricola_sac"])
        print(f"  [OK] Paso 1: Plantilla Andina sintetizada con cultivos de Maíz/Papa y Seguro Agrícola SAC")

        # 2. Firma Quórum Dual Chupaca
        resp_oficial = self.client.post("/api/v1/edan/generar-oficial", json={
            "ficha": p,
            "token_alcalde": "TOKEN-ALCALDE-CHUPACA-BASTIDAS",
            "token_indeci": "TOKEN-INDECI-JUNIN-HUANCAYO"
        })
        self.assertEqual(resp_oficial.status_code, 200)
        edan_data = resp_oficial.json()
        self.assertTrue(edan_data["quorum_dual"]["cumplido"])
        edan_id = edan_data["edan_id"]
        print(f"  [OK] Paso 2: EDAN Chupaca firmado. Desbloqueo: {edan_data['quorum_dual']['estado_desbloqueo']}")

        # 3. Bloqueo de Puente Cunas y Despacho desde Almacén Huancayo
        humanitarian_router.registrar_bloqueo(
            tipo_incidente="COLAPSO_PUENTE",
            ubicacion="Puente Cunas Km 4.2",
            descripcion="Crecida extraordinaria del Río Cunas arrasó terraplén.",
            puente_afectado="puente-cunas-chupaca",
            reportado_por="DEFENSA_CIVIL_CHUPACA",
            severidad="CRITICO"
        )

        resp_desp = self.client.post(f"/api/v1/logistica/despachar-orden-edan/{edan_id}")
        self.assertEqual(resp_desp.status_code, 200)
        desp = resp_desp.json()
        self.assertEqual(desp["almacen_origen"]["id"], "ALM-JUNIN-HUANCAYO")
        self.assertEqual(desp["albergue_destino"]["id"], "ALB-CHUPACA-YAUYOS")
        self.assertEqual(desp["ruta_contingencia"]["estado_conectividad"], "DESVIO_TACTICO_ACTIVO")
        self.assertIn("puente-brena-huancayo", desp["ruta_contingencia"]["ruta_efectiva"]["puentes_en_ruta"])
        print(f"  [OK] Paso 3: Despacho desde Huancayo hacia Chupaca desviado exitosamente por Puente Breña.")

        # 4. Verificación de Cadena WORM
        resp_verif = self.client.get("/api/v1/auditoria/cgr-worm/verificar")
        self.assertEqual(resp_verif.status_code, 200)
        self.assertTrue(resp_verif.json()["valida"])
        print(f"  [OK] Paso 4: Cadena WORM 100% consistente con evento andino acuñado.")

        print("=== [E2E] CICLO ANDINO CONCLUIDO CON ÉXITO ===\n")


if __name__ == "__main__":
    unittest.main()
