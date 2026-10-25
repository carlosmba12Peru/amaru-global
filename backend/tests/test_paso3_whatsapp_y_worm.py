"""
Pruebas Unitarias e Integración: Paso 3 - Módulo 5 (WhatsApp Comunitario) y Módulo 6 (Bitácora WORM CGR)
AMARU-CLIMATE - Lab4
"""

import unittest
from fastapi.testclient import TestClient
from main import app
from services.whatsapp_community_service import whatsapp_community_service
from services.cgr_worm_service import cgr_worm_service, GENESIS_PREV_HASH
from services.edan_sinpad_service import edan_sinpad_service
from services.routing.humanitarian_router import humanitarian_router


class TestPaso3WhatsAppYWorm(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(app)
        humanitarian_router.bloqueos_activos.clear()

    def tearDown(self):
        humanitarian_router.bloqueos_activos.clear()

    # =========================================================================
    # MÓDULO 5: PRUEBAS DE EMULADOR WHATSAPP Y NLP COMUNITARIO
    # =========================================================================

    def test_01_whatsapp_nlp_analisis_desborde(self):
        """Valida que el NLP extraiga inundación crítica, familias, niños y requerimiento de agua/lanchas."""
        texto = "URGENTE INDECI: El río Piura rompió el dique. Caserío inundado con 1.20m de agua. 25 familias en techos, 10 niños y 4 ancianos sin comida ni agua potable. Envíen lanchas."
        nlp = whatsapp_community_service.procesar_nlp_mensaje(texto)

        self.assertEqual(nlp["categoria"], "INUNDACION_DESBORDE_EXTREMO")
        self.assertEqual(nlp["severidad"], "CRITICA")
        self.assertEqual(nlp["familias_estimadas"], 25)
        self.assertEqual(nlp["vulnerables"]["ninos"], 10)
        self.assertEqual(nlp["vulnerables"]["ancianos"], 4)
        self.assertIn("Agua Potable en Bidones", nlp["insumos_prioritarios"])
        self.assertIn("Evacuación Fluvial / Aérea", nlp["insumos_prioritarios"])

    def test_02_whatsapp_nlp_colapso_puente_y_bloqueo_automatico(self):
        """Valida que el reporte de colapso de puente en Virú registre el bloqueo en el router logístico."""
        texto = "SOCORRO: Caudal extraordinario socavó el Puente Virú. El tránsito está cortado totalmente."
        res = whatsapp_community_service.registrar_mensaje_entrante(
            remitente="+51 989 334 117",
            mensaje=texto,
            nombre_contacto="Subprefecto Virú",
            caserio="Puente Virú",
            distrito="Virú"
        )

        self.assertEqual(res["estado"], "PROCESADO_EXITOSAMENTE")
        self.assertIn("AMARU-WA-", res["ticket_id"])
        self.assertIn("Folio de Auxilio", res["respuesta_ciudadano"])

        # Verificar que el corte fue registrado en humanitarian_router
        bloqueos = humanitarian_router.listar_bloqueos_activos()
        self.assertTrue(any(b.get("puente_afectado") == "puente-viru-pe1n" for b in bloqueos), "Puente Virú debió bloquearse")

    def test_03_whatsapp_cola_offline_store_and_forward(self):
        """Valida el encolamiento sin internet y sincronización en bloque al restablecer conexión satelital."""
        # Enviar mensaje con modo_offline=True
        res_offline = whatsapp_community_service.registrar_mensaje_entrante(
            remitente="+51 961 883 412",
            mensaje="Emergencia en caserío aislado sin señal celular: 12 familias afectadas por huaico.",
            caserio="Caserío Andino",
            distrito="Chupaca",
            modo_offline=True
        )
        self.assertEqual(res_offline["estado"], "ENCOLADO_OFFLINE")

        # Sincronizar cola
        res_sync = whatsapp_community_service.sincronizar_cola_offline()
        self.assertGreaterEqual(res_sync["total_sincronizados"], 1)
        self.assertIn(res_offline["ticket_id"], res_sync["tickets"])

    def test_04_endpoints_whatsapp_api(self):
        """Prueba los endpoints REST de WhatsApp webhook, simulación, catálogo y estadísticas."""
        # 1. Simular envío por POST
        payload = {
            "remitente": "+51 944 120 985",
            "mensaje": "Alerta: El río La Leche se desbordó. Puente rústico colapsó y 15 casas destruidas.",
            "nombre_contacto": "Comité Vaso de Leche",
            "caserio": "Anexo La Otra Banda",
            "distrito": "Íllimo",
            "coordenadas": {"lat": -6.4820, "lng": -79.8510},
            "modo_offline": False
        }
        resp = self.client.post("/api/v1/comunidad/whatsapp/simular-envio", json=payload)
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertEqual(data["estado"], "PROCESADO_EXITOSAMENTE")

        # 2. Webhook compatible Twilio
        twilio_payload = {
            "From": "whatsapp:+51974812340",
            "Body": "Auxilio, necesitamos agua potable en Caserío Naranjo Alto",
            "Latitude": "-5.3340",
            "Longitude": "-80.6580"
        }
        resp_wh = self.client.post("/api/v1/comunidad/whatsapp/webhook", json=twilio_payload)
        self.assertEqual(resp_wh.status_code, 200)

        # 3. Listar mensajes
        resp_list = self.client.get("/api/v1/comunidad/whatsapp/mensajes")
        self.assertEqual(resp_list.status_code, 200)
        self.assertGreater(resp_list.json()["total_mensajes"], 0)

        # 4. Estadísticas
        resp_stats = self.client.get("/api/v1/comunidad/whatsapp/estadisticas")
        self.assertEqual(resp_stats.status_code, 200)
        self.assertIn("total_reportes_recibidos", resp_stats.json())

    # =========================================================================
    # MÓDULO 6: PRUEBAS DE BITÁCORA WORM CGR Y ENCADENAMIENTO CRIPTOGRÁFICO
    # =========================================================================

    def test_05_cgr_worm_genesis_y_acunacion_secuencial(self):
        """Verifica que el bloque génesis exista con prev_hash=0*64 y que nuevos bloques se encadenen."""
        ledger = cgr_worm_service.obtener_ledger()
        self.assertGreater(len(ledger), 0, "Debe tener al menos el bloque génesis")

        bloque_genesis = cgr_worm_service._cadena[0]
        self.assertEqual(bloque_genesis["index"], 0)
        self.assertEqual(bloque_genesis["prev_hash"], GENESIS_PREV_HASH)
        self.assertEqual(bloque_genesis["tipo_evento"], "GENESIS_LEDGER_CGR")

        # Acuñar un evento de prueba
        nuevo_bloque = cgr_worm_service.acunar_evento(
            tipo_evento="PRUEBA_AUDITORIA_OCI",
            actor_responsable="Auditor Inspector CGR N.° 4102",
            entidad_origen="CONTRALORIA_SEDE_CENTRAL",
            datos_evento={"memo": "Inspección física de almacén de emergencia"}
        )
        self.assertGreater(nuevo_bloque["index"], 0)
        self.assertEqual(nuevo_bloque["prev_hash"], cgr_worm_service._cadena[-2]["block_hash"])
        self.assertIn("TSA-CGR-", nuevo_bloque["sello_tsa_rfc3161"])

    def test_06_cgr_worm_verificacion_integridad_y_deteccion_manipulacion(self):
        """Valida que la auditoría criptográfica confirme 100% integridad y detecte adulteraciones."""
        # 1. Verificar cadena intacta
        audit = cgr_worm_service.verificar_integridad_cadena()
        self.assertTrue(audit["valida"], "La cadena debe ser 100% válida")
        self.assertEqual(audit["estado"], "INTEGRIDAD_FORENSE_100_PORCIENTO")
        self.assertEqual(len(audit["discrepancias"]), 0)

        # 2. Generar Certificado CGR
        cert = cgr_worm_service.generar_certificado_auditoria_cgr()
        self.assertIn("CERT-CGR-WORM-", cert["certificado_id"])
        self.assertTrue(cert["cadena_integra"])
        self.assertIn("Ley N.° 31358", cert["declaracion_jurada_institucional"])

        # 3. Test de Manipulación Forense (Adulteración deliberada de un payload)
        # Clonamos el último bloque para modificarlo temporalmente
        ultimo = cgr_worm_service._cadena[-1]
        payload_original = dict(ultimo["datos_evento"])
        ultimo["datos_evento"]["hacked"] = True  # Inyección maliciosa

        audit_tampered = cgr_worm_service.verificar_integridad_cadena()
        self.assertFalse(audit_tampered["valida"], "Debe detectar que el payload fue adulterado")
        self.assertGreater(len(audit_tampered["discrepancias"]), 0)

        # Restaurar estado original
        ultimo["datos_evento"] = payload_original
        audit_restored = cgr_worm_service.verificar_integridad_cadena()
        self.assertTrue(audit_restored["valida"], "Tras restaurar debe volver a ser íntegra")

    def test_07_integracion_dual_quorum_y_acuñacion_worm(self):
        """Valida que al firmar un EDAN con quórum dual se acuñe automáticamente un bloque WORM."""
        ficha_catacaos = edan_sinpad_service.cargar_caso_modelo("modelo_catacaos_piura")

        # Firmar con quórum dual
        res_firma = edan_sinpad_service.generar_ficha_oficial(
            payload=ficha_catacaos,
            token_alcalde="TOKEN-ALCALDE-CATACAOS-987654",
            token_indeci="TOKEN-INDECI-COEN-321098"
        )

        self.assertTrue(res_firma["exito"])
        self.assertIn("bitacora_worm_cgr", res_firma)
        worm_info = res_firma["bitacora_worm_cgr"]
        self.assertIsNotNone(worm_info["block_hash"])
        self.assertIn("TSA-CGR-", worm_info["sello_tsa"])

        # Verificar que el bloque está efectivamente en el ledger WORM
        ledger = cgr_worm_service.obtener_ledger()
        bloque_encontrado = any(b["block_hash"] == worm_info["block_hash"] for b in ledger)
        self.assertTrue(bloque_encontrado, "El bloque del EDAN debe figurar en el ledger WORM")


if __name__ == "__main__":
    unittest.main()
