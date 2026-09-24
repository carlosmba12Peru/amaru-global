# backend/tests/test_zero_pii_vault.py
"""
Suite de Pruebas: Bóveda Criptográfica Zero-PII en el Borde (SAGF-MC Módulo 1)
Plataforma AMARU-CLIMATE / COEN-Digital
Normas: Ley N.° 29733 (Protección de Datos Personales) / NIST SP 800-57 / FIPS 140-3
"""

import unittest
from services.secure_vault import secure_vault
from services.ayni_service import ayni_service

class TestZeroPiiVault(unittest.TestCase):

    def test_cup_generation_format(self):
        cup = secure_vault.generate_cup(prefix="AYNI")
        self.assertTrue(cup.startswith("CUP-AYNI-"))
        self.assertGreaterEqual(len(cup), 14)

    def test_seal_and_envelope_encryption(self):
        raw_payload = {
            "nombre": "Sra. Esperanza Gómez",
            "telefono": "987654321",
            "condicion": "Gestante 7mo mes",
            "sector": "Quebrada San Antonio"
        }
        cup, safe_record = secure_vault.seal_pii(raw_payload, prefix="AYNI", metadata_categoria="TEST_PADRON")
        
        # El registro seguro no debe contener el nombre completo ni el teléfono
        self.assertEqual(safe_record["cup"], cup)
        self.assertTrue(safe_record["is_protected"])
        self.assertNotIn("987654321", str(safe_record))
        self.assertNotIn("Esperanza Gómez", str(safe_record))

        # Verificación de que los datos no autorizados son denegados
        unauthorized = secure_vault.unseal_pii(cup, authority_role="OPERADOR_CAMPO")
        self.assertIsNone(unauthorized)

        # Verificación de que la autoridad competente sí puede desprecintar
        authorized = secure_vault.unseal_pii(cup, authority_role="AUTORIDAD_MUNICIPAL", officer_id="ALCALDE_TEST")
        self.assertIsNotNone(authorized)
        self.assertEqual(authorized["nombre"], "Sra. Esperanza Gómez")
        self.assertEqual(authorized["telefono"], "987654321")

    def test_crypto_shredding(self):
        raw_payload = {"nombre": "Don Teófilo", "telefono": "912345678"}
        cup, _ = secure_vault.seal_pii(raw_payload)
        
        # Destrucción permanente
        shred_result = secure_vault.crypto_shred(cup)
        self.assertTrue(shred_result)

        # Intento de recuperación incluso con SUPER_ADMIN debe fallar
        unseal_after_shred = secure_vault.unseal_pii(cup, authority_role="SUPER_ADMIN")
        self.assertIsNone(unseal_after_shred)

    def test_ayni_service_padron_zero_pii(self):
        padron = ayni_service.get_vulnerables_padron()
        self.assertGreaterEqual(len(padron), 3)

        for item in padron:
            # Cada registro debe tener su token CUP y la bandera de protección
            self.assertIn("cup", item)
            self.assertTrue(item["cup"].startswith("CUP-AYNI-"))
            self.assertTrue(item.get("protegido_zero_pii"))

            # El nombre debe estar disociado
            self.assertIn("Ciudadano Protegido", item["nombre"])
            
            # El contacto debe estar enmascarado
            self.assertIn("***", item["contacto_emergencia"])

    def test_ayni_ollas_masking(self):
        ollas = ayni_service.get_ollas_list()
        self.assertGreaterEqual(len(ollas), 4)

        for o in ollas:
            # Lideresas enmascaradas
            self.assertIn("(Identidad Protegida)", o["lideresa"])
            # Teléfono enmascarado
            self.assertIn("***", o["telefono"])

    def test_vault_metrics(self):
        metrics = secure_vault.get_metrics()
        self.assertEqual(metrics["almacenamiento_crudo_disco"], "0 BYTES (Volátil estricto en RAM)")
        self.assertGreater(metrics["total_registros_precintados"], 0)
        self.assertTrue(metrics["soporte_crypto_shredding"])

if __name__ == "__main__":
    unittest.main()
