# backend/tests/test_file_sanitizer_forensics.py
"""
Suite de Pruebas: Sanitización Forense de Archivos e Integridad Probatoria ISO 27037
(SAGF-MC Módulo 4)
Plataforma AMARU-CLIMATE / COEN-Digital
Normativa: NTP-ISO/IEC 27037:2012 / Art. 220 Código Procesal Penal / IETF RFC 3161
"""

import unittest
import base64
from services.file_sanitizer import file_sanitizer, ForensicSanitizationError
from services.citizen_report_service import citizen_service

class TestFileSanitizerForensics(unittest.TestCase):

    def setUp(self):
        self.valid_jpeg_bytes = b"\xFF\xD8\xFF\xE0\x00\x10JFIF\x00\x01\x01\x01\x00H\x00H\x00\x00" + b"EVIDENCIA_FOTOGRAFICA_CHOSICA_2026"
        self.valid_png_bytes = b"\x89\x50\x4E\x47\x0D\x0A\x1A\x0A" + b"IMAGEN_PNG_TESTIMONIO_VECINAL"
        self.malicious_script_bytes = b"DUMMY_TEXT_SAMPLE_NON_EXECUTABLE"

    def test_magic_bytes_detection(self):
        # JPEG
        mime_jpg = file_sanitizer.inspect_magic_bytes(self.valid_jpeg_bytes)
        self.assertEqual(mime_jpg, "image/jpeg")

        # PNG
        mime_png = file_sanitizer.inspect_magic_bytes(self.valid_png_bytes)
        self.assertEqual(mime_png, "image/png")

        # Corrupto / Desconocido
        mime_unknown = file_sanitizer.inspect_magic_bytes(b"PLAIN_TEXT_NOT_IMAGE")
        self.assertIsNone(mime_unknown)

    def test_prohibited_extensions_blocked(self):
        # Intento de subir script php camuflado
        with self.assertRaises(ForensicSanitizationError) as ctx:
            file_sanitizer.sanitize_uploaded_file(self.valid_jpeg_bytes, "malware.php")
        self.assertIn("estrictamente proscrita", str(ctx.exception))

        # Intento de subir script bash
        with self.assertRaises(ForensicSanitizationError) as ctx:
            file_sanitizer.sanitize_uploaded_file(self.valid_jpeg_bytes, "exploit.sh")
        self.assertIn("estrictamente proscrita", str(ctx.exception))

    def test_fake_magic_bytes_blocked(self):
        # Intento de subir archivo renombrado a .jpg pero con contenido de script
        with self.assertRaises(ForensicSanitizationError) as ctx:
            file_sanitizer.sanitize_uploaded_file(self.malicious_script_bytes, "foto_falsa.jpg")
        self.assertIn("Magic Bytes", str(ctx.exception))

    def test_sha256_and_rfc3161_tsa_issuance(self):
        bundle = file_sanitizer.sanitize_uploaded_file(
            content_bytes=self.valid_jpeg_bytes,
            filename="evidencia_quebrada.jpg",
            ubigeo="150118",
            submitter_id="BRIGADA_TEST_01"
        )
        self.assertIn("folio_tsa", bundle)
        self.assertTrue(bundle["folio_tsa"].startswith("TSA-COEN-"))
        self.assertEqual(len(bundle["hash_sha256"]), 64) # Longitud SHA-256
        self.assertTrue(bundle["magic_bytes_verificado"])

        tsa = bundle["sello_tiempo_rfc3161"]
        self.assertEqual(tsa["tsa_provider"], "COEN-TSA-FORENSIC-AUTHORITY-RFC3161")
        self.assertEqual(tsa["estado_custodia"], "WORM_COMPLIANT_INMUTABLE")

    def test_worm_immutability_and_tamper_detection(self):
        bundle = file_sanitizer.sanitize_uploaded_file(
            content_bytes=self.valid_png_bytes,
            filename="grafico_aforo.png",
            ubigeo="150118"
        )
        folio = bundle["folio_tsa"]

        # 1. Verificación de archivo íntegro
        verif_ok = file_sanitizer.verify_evidence_integrity(folio, self.valid_png_bytes)
        self.assertTrue(verif_ok["verificado"])
        self.assertEqual(verif_ok["dictamen_pericial"], "EVIDENCIA_DIGITAL_AUTENTICA_E_INALTERADA")

        # 2. Verificación de archivo adulterado (1 byte alterado)
        altered_bytes = self.valid_png_bytes + b"_ALTERED"
        verif_tampered = file_sanitizer.verify_evidence_integrity(folio, altered_bytes)
        self.assertFalse(verif_tampered["verificado"])
        self.assertEqual(verif_tampered["dictamen_pericial"], "EVIDENCIA_CORRUPTA_O_ALTERADA")

    def test_citizen_report_service_integration(self):
        b64_foto = base64.b64encode(self.valid_jpeg_bytes).decode("ascii")
        payload = {
            "tipo_registro": "EN_VIVO_2026_2027",
            "tipo_evento": "HUAICO_ACTIVO",
            "ubigeo": "150118",
            "lugar_especifico": "Quebrada Quirio",
            "nivel_afectacion": "CINTURA_100CM",
            "testimonio": "Activación repentina de torrentera con arrastre de lodo.",
            "nombre_archivo": "quebrada_quirio.jpg",
            "foto_bytes_base64": b64_foto
        }

        res = citizen_service.registrar_reporte(payload)
        self.assertTrue(res["success"])
        self.assertIn("folio_tsa", res)
        self.assertIn("cadena_custodia", res)
        self.assertEqual(res["cadena_custodia"]["estado_custodia"], "WORM_COMPLIANT_INMUTABLE")

        # Comprobar que en el reporte registrado se conservó la metadata forense
        primer_reporte = citizen_service.reportes[0]
        self.assertEqual(primer_reporte["folio_tsa"], res["folio_tsa"])
        self.assertTrue(primer_reporte["evidencia_foto"]["magic_bytes_verificado"])

    def test_citizen_report_service_blocks_executable(self):
        payload_malicioso = {
            "tipo_registro": "EN_VIVO_2026_2027",
            "tipo_evento": "INUNDACION_PLUVIAL",
            "ubigeo": "150118",
            "lugar_especifico": "Puente Carapongo",
            "testimonio": "Reporte normal",
            "nombre_archivo": "script_malicioso.php"
        }
        with self.assertRaises(ForensicSanitizationError):
            citizen_service.registrar_reporte(payload_malicioso)

if __name__ == "__main__":
    unittest.main()
