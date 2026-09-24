# backend/tests/test_circuit_breaker_hitl.py
"""
Suite de Pruebas: Gobernanza HITL y Circuit Breaker de Despacho (SAGF-MC Módulo 2)
Plataforma AMARU-CLIMATE / Misión Crítica COEN-Digital
Normativa: D.S. N.° 115-2025-PCM (Art. 4 y 5 - Gobernanza HITL) / Ley N.° 31814
Doctrina Operativa: AMARU-CLIMATE remite alertas al INDECI/COEN; INDECI activa SISMATE.
"""

import unittest
import time
from services.auth_service import auth_service

class TestCircuitBreakerHITL(unittest.TestCase):

    def setUp(self):
        # Autenticar usuarios institucionales de prueba
        self.session_alcalde = auth_service.authenticate("admin.alcaldia", "Amaru2026!!!")
        self.session_coen = auth_service.authenticate("admin.coen", "Amaru2026@@@")
        self.session_operador = auth_service.authenticate("admin.social", "Amaru2026$$$")

    def test_circuit_breaker_status(self):
        status = auth_service.get_circuit_breaker_status()
        self.assertEqual(status["sistema"], "Circuit Breaker Gubernamental HITL (D.S. N.° 115-2025-PCM)")
        self.assertIn("AMARU-CLIMATE remite alertas al INDECI/COEN", status["doctrina_despacho"])
        self.assertIn("estado_compuertas", status)

    def test_unauthorized_role_cannot_issue_dispatch_token(self):
        # Operador de campo carece de potestad para ordenar despacho crítico
        res = auth_service.create_dispatch_authority_token(
            session_token=self.session_operador["token"],
            ubigeo="150118"
        )
        self.assertIn("error", res)
        self.assertIn("carece de competencia legal", res["error"])

    def test_territorial_jurisdiction_enforcement(self):
        # El alcalde de Lurigancho-Chosica (150118) no puede despachar alertas para Piura (200101)
        res = auth_service.create_dispatch_authority_token(
            session_token=self.session_alcalde["token"],
            ubigeo="200101" # UBIGEO ajeno
        )
        self.assertIn("error", res)
        self.assertIn("Incompetencia territorial", res["error"])

        # Para su propio distrito (150118) sí es competente
        res_ok = auth_service.create_dispatch_authority_token(
            session_token=self.session_alcalde["token"],
            ubigeo="150118"
        )
        self.assertIn("authority_token", res_ok)
        self.assertEqual(res_ok["officer_name"], "Ing. Luis Mendieta Ramos")
        self.assertIn("INDECI / COEN", res_ok["entidad_receptora_destino"])

    def test_super_admin_national_jurisdiction(self):
        # El comando nacional COEN tiene competencia sobre cualquier UBIGEO
        res = auth_service.create_dispatch_authority_token(
            session_token=self.session_coen["token"],
            ubigeo="200101" # Piura
        )
        self.assertIn("authority_token", res)
        self.assertEqual(res["officer_role"], "SUPER_ADMIN")

    def test_token_verification_and_expiration(self):
        res = auth_service.create_dispatch_authority_token(
            session_token=self.session_coen["token"],
            ubigeo="150118"
        )
        token = res["authority_token"]

        # Token válido para UBIGEO 150118
        is_valid, record, msg = auth_service.verify_authority_token(token, target_ubigeo="150118")
        self.assertTrue(is_valid)
        self.assertEqual(msg, "OK")
        self.assertEqual(record["officer_cargo"], "Director General de Operaciones de Emergencia")

        # Token inválido para otro UBIGEO
        is_valid_wrong, _, msg_wrong = auth_service.verify_authority_token(token, target_ubigeo="040101")
        self.assertFalse(is_valid_wrong)
        self.assertIn("no para 040101", msg_wrong)

        # Token inexistente
        is_valid_fake, _, msg_fake = auth_service.verify_authority_token("AUTH-TOKEN-FAKE-1234")
        self.assertFalse(is_valid_fake)
        self.assertIn("no registrado o revocado", msg_fake)

    def test_bypass_simulation_tokens(self):
        is_valid, record, msg = auth_service.verify_authority_token("BYPASS-SIMULACION-SANDBOX-DEMO", "150118")
        self.assertTrue(is_valid)
        self.assertEqual(record["officer_name"], "SIMULADOR_C2_SANDBOX")

if __name__ == "__main__":
    unittest.main()
