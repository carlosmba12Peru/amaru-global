# backend/tests/test_sagf_mc_compliance.py
"""
Suite de Conformidad Integral - Estandar SAGF-MC (AMARU-CLIMATE)
Evaluacion pericial de los 5 pilares obligatorios de gobernanza, seguridad y legalidad:
1. Pilar 1: Privacidad y Proteccion de Datos Personales (Ley N. 29733, NIST SP 800-57, Zero-PII Vault)
2. Pilar 2: Gobernanza HITL y Circuit Breakers (D.S. N. 115-2025-PCM, Ley N. 31814)
3. Pilar 3: Enjaulamiento Cognitivo & Consistencia Matematica AHP Saaty (CR <= 0.10)
4. Pilar 4: Sanitizacion Forense de Evidencias y Cadena de Custodia (NTP-ISO/IEC 27037:2012, RFC 3161 TSA)
5. Pilar 5: Inclusion Intercultural ReNITLI y Fe Publica Pericial (Ley N. 29735, Art. 220 CPP)
"""
import os
import unittest
import asyncio
from fastapi.testclient import TestClient

os.environ["LLM_PROVIDER"] = "local"

from main import app
from services.secure_vault import secure_vault
from services.auth_service import auth_service
from services.file_sanitizer import file_sanitizer, ForensicSanitizationError
from services.indices_amaru_service import indices_amaru_service, PESOS_CANONICOS_IRCE_SAATY
from agents.renitli_agent import ReNITLIAgent
from agents.schemas import ReNITLIForensicTicket
from agents.orchestrator import run_coen_agent_pipeline

class TestSAGFMCCompliance(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(app)

    # =========================================================================
    # PILAR 1: PRIVACIDAD Y PROTECCION DE DATOS PERSONALES (Ley 29733 & NIST SP 800-57)
    # =========================================================================
    def test_pilar1_zero_pii_vault_envelope_and_crypto_shredding(self):
        """Pilar 1: Boveda Zero-PII en RAM, tokens CUP sinteticos y destruccion criptografica."""
        pii_data = {
            "dni": "45871239",
            "nombre": "Mamani Choquehuanca, Asunta",
            "telefono": "993882711",
            "sector": "Sector Quebrada Carossio",
            "condicion": "Adulta Mayor - Movilidad Reducida"
        }

        # 1. Cifrado Envelope AES-256-GCM y tokenizacion CUP sintetica
        cup, safe_record = secure_vault.seal_pii(pii_data, prefix="AYNI")
        self.assertTrue(cup.startswith("CUP-AYNI-"), "El token debe usar el prefijo sintetico CUP-AYNI-")
        masked_phone = secure_vault.mask_phone(pii_data["telefono"])
        self.assertEqual(masked_phone, "993-***-***", "El telefono debe estar enmascarado para nivel 1")
        self.assertTrue(safe_record["is_protected"])

        # 2. Desprecintado con rol autorizado de emergencia
        unsealed = secure_vault.unseal_pii(
            cup=cup,
            authority_role="AUTORIDAD_MUNICIPAL",
            officer_id="AUT-INDECI-LIMA-09"
        )
        self.assertIsNotNone(unsealed)
        self.assertEqual(unsealed["dni"], pii_data["dni"])
        self.assertEqual(unsealed["nombre"], pii_data["nombre"])
        self.assertEqual(unsealed["telefono"], pii_data["telefono"])

        # 3. Denegacion de desprecintado ante rol no facultado
        unauthorized = secure_vault.unseal_pii(
            cup=cup,
            authority_role="OPERADOR_CAMPO",
            officer_id="BRIGADA-VOLUNTARIA"
        )
        self.assertIsNone(unauthorized, "Operador de campo no debe poder desprecintar PII sensible")

        # 4. Crypto-shredding: eliminacion irrevocable del sobre criptografico
        shredded = secure_vault.crypto_shred(cup)
        self.assertTrue(shredded)

        # 5. Intento posterior al shredding debe resultar irrevocablemente fallido
        unsealed_post_shred = secure_vault.unseal_pii(
            cup=cup,
            authority_role="AUTORIDAD_MUNICIPAL",
            officer_id="AUT-INDECI-LIMA-09"
        )
        self.assertIsNone(unsealed_post_shred, "Los datos deben ser matematicamente irrecuperables")

    # =========================================================================
    # PILAR 2: GOBERNANZA HITL Y CIRCUIT BREAKERS (D.S. 115-2025-PCM & Ley 31814)
    # =========================================================================
    def test_pilar2_circuit_breaker_blocks_unauthorized_dispatch_http_403(self):
        """Pilar 2: Bloqueo inmediato HTTP 403 ante ordenes de alerta critica sin firma de autoridad."""
        # 1. Intento sin token de autoridad hacia el endpoint de despacho de alerta
        resp_no_token = self.client.post("/api/distrito/150118/alerta")
        self.assertEqual(resp_no_token.status_code, 403)
        self.assertIn("CIRCUIT_BREAKER_HITL_FORBIDDEN", resp_no_token.json().get("error", ""))

        # 2. Autenticar autoridad distrital de Chosica (ubigeo 150118)
        session_alcalde = auth_service.authenticate("admin.alcaldia", "Amaru2026!!!")
        self.assertIsNotNone(session_alcalde)

        # 3. Intento de emitir token para jurisdiccion ajena (Urubamba 081301) es rechazado por competencia
        token_err = auth_service.create_dispatch_authority_token(
            session_token=session_alcalde["token"],
            ubigeo="081301"
        )
        self.assertIn("error", token_err)
        self.assertIn("Incompetencia territorial", token_err["error"])

        # 4. Emision valida para su distrito legal (150118)
        token_ok = auth_service.create_dispatch_authority_token(
            session_token=session_alcalde["token"],
            ubigeo="150118"
        )
        self.assertIn("authority_token", token_ok)
        self.assertIn("INDECI / COEN", token_ok["entidad_receptora_destino"])

        # 5. Despacho autorizado con encabezado X-Authority-Token exitoso
        resp_authorized = self.client.post(
            "/api/distrito/150118/alerta",
            headers={"X-Authority-Token": token_ok["authority_token"]}
        )
        self.assertEqual(resp_authorized.status_code, 200)
        resp_json = resp_authorized.json()
        self.assertTrue(resp_json.get("circuit_breaker_autorizado", False))
        self.assertIn("alerta multi-agente", resp_json.get("status", ""))

    # =========================================================================
    # PILAR 3: ENJAULAMIENTO COGNITIVO & CONSISTENCIA AHP SAATY (CR <= 0.10)
    # =========================================================================
    def test_pilar3_ahp_saaty_mathematical_consistency_and_weights(self):
        """Pilar 3: Verificacion de consistencia Saaty AHP (CR <= 0.10) y normalizacion estricta."""
        # 1. Calculo oficial de indice de riesgo compuesto distrital Saaty AHP 4x4
        irce_result = indices_amaru_service.calcular_irce_fen("150118")

        blindaje = irce_result.get("blindaje_legal", {})
        cr = blindaje.get("ratio_consistencia_saaty_cr", 1.0)
        self.assertLessEqual(cr, 0.10, f"El Ratio de Consistencia Saaty CR debe ser <= 0.10 (Valor: {cr})")
        self.assertTrue(blindaje.get("consistencia_aprobada", False))

        # 2. Verificar normalizacion estricta de los pesos canonicos
        w = PESOS_CANONICOS_IRCE_SAATY
        suma_pesos = w["w_peligro"] + w["w_vulnerabilidad"] + w["w_exposicion"] + w["w_capacidad"]
        self.assertAlmostEqual(suma_pesos, 1.0, places=2, msg="La suma de pesos debe ser exactamente 1.0")

    # =========================================================================
    # PILAR 4: SANITIZACION FORENSE & CADENA DE CUSTODIA ISO 27037 (RFC 3161)
    # =========================================================================
    def test_pilar4_file_sanitization_magic_bytes_and_rfc3161_tsa(self):
        """Pilar 4: Rechazo por Magic Bytes y sellado cronologico pericial TSA."""
        valid_jpeg_sample = b"\xFF\xD8\xFF\xE0\x00\x10JFIF\x00\x01\x01\x00\x00\x01\x00\x01\x00\x00" + (b"\x00" * 64)

        # 1. Bloqueo de archivo con extension proscrita
        with self.assertRaises(ForensicSanitizationError) as ctx:
            file_sanitizer.sanitize_uploaded_file(valid_jpeg_sample, "script_prueba.php")
        self.assertIn("estrictamente proscrita", str(ctx.exception))

        # 2. Bloqueo de bytes corruptos / no reconocidos
        with self.assertRaises(ForensicSanitizationError) as ctx2:
            file_sanitizer.sanitize_uploaded_file(b"CORRUPT_BYTES_NON_IMAGE", "foto_quebrada.jpg")
        self.assertIn("Magic Bytes", str(ctx2.exception))

        # 3. Admision y sellado de imagen JPEG valida
        custodia = file_sanitizer.sanitize_uploaded_file(
            content_bytes=valid_jpeg_sample,
            filename="foto_quebrada_carossio.jpg",
            ubigeo="150118"
        )
        self.assertEqual(custodia["mime_type"], "image/jpeg")
        self.assertTrue(custodia["folio_tsa"].startswith("TSA-COEN-"))
        self.assertEqual(custodia["magic_bytes_verificado"], True)
        self.assertEqual(len(custodia["hash_sha256"]), 64)

    # =========================================================================
    # PILAR 5: INCLUSION INTERCULTURAL RENITLI (Ley 29735 & Art. 220 CPP)
    # =========================================================================
    def test_pilar5_renitli_dual_stream_and_forensic_ticket(self):
        """Pilar 5: Doble flujo (evacuacion rapida + peritaje pericial con valor para juicio oral)."""
        # 1. Ejecucion del pipeline en modo critico
        pipeline_resp = asyncio.run(run_coen_agent_pipeline("150118", force_critical=True))
        self.assertTrue(pipeline_resp.activacion_critica)
        self.assertIsNotNone(pipeline_resp.peritaje_renitli, "Debe incluir ticket pericial ReNITLI en modo critico")

        # 2. Verificacion de atributos periciales
        ticket: ReNITLIForensicTicket = pipeline_resp.peritaje_renitli
        self.assertTrue(ticket.folio_pericial.startswith("RENITLI-PERITAJE-"))
        self.assertEqual(ticket.variante_linguistica, "QUECHUA_CHANKA")
        self.assertIn("Quispe Huam", ticket.perito_colegiado_asignado)
        self.assertEqual(ticket.validez_juicio_oral, True)
        self.assertEqual(len(ticket.hash_sha256_traduccion), 64)
        self.assertEqual(len(ticket.hash_sha256_castellano), 64)

        # 3. Verificacion de consulta y convalidacion en API
        resp_folio = self.client.get(f"/api/renitli/tickets/{ticket.folio_pericial}")
        self.assertEqual(resp_folio.status_code, 200)
        json_folio = resp_folio.json()
        self.assertEqual(json_folio["estado_certificacion"], "CONFORME_RENITLI_MINCUL")
        self.assertEqual(json_folio["ticket"]["folio_pericial"], ticket.folio_pericial)

if __name__ == "__main__":
    unittest.main()
