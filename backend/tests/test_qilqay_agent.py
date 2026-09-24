# backend/tests/test_qilqay_agent.py
"""
Suite de Pruebas Unitarias e Integración para el Agente QILQAY (Redacción Estatal y Fe Pública)
Verifica las 6 facultades temáticas, el enjaulamiento determinístico de datos (cero alucinaciones),
el sellado criptográfico SHA-256 y la exportación de PDF A4 institucional.
"""

import unittest
from fastapi.testclient import TestClient
from main import app
from agents.qilqay_agent import qilqay_agent
from schemas.qilqay_schema import (
    QilqayFacultadTematica,
    QilqayTipoDocumento,
    QilqayDraftRequest
)


class TestQilqayAgent(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(app)

    def test_01_catalogo_6_facultades(self):
        """Verifica que el catálogo exponga las 6 facultades temáticas completas."""
        resp = self.client.get("/api/v1/agents/qilqay/facultades")
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertEqual(data["total_facultades"], 6)
        codigos = [f["codigo"] for f in data["facultades"]]
        self.assertIn("JURIDICO_EDIL", codigos)
        self.assertIn("TACTICO_SINAGERD", codigos)
        self.assertIn("FISCAL_CONTRATACIONES", codigos)
        self.assertIn("SOCIAL_HUMANITARIO", codigos)
        self.assertIn("TECNICO_INGENIERIL", codigos)
        self.assertIn("FE_PUBLICA_PERITAJE", codigos)

    def test_02_redactar_resolucion_alcaldia(self):
        """Facultad 1: Redacción de Resolución de Alcaldía oficial en Catacaos (200105)."""
        payload = {
            "ubigeo": "200105",
            "facultad_tematica": "JURIDICO_EDIL",
            "tipo_documento": "RESOLUCION_ALCALDIA",
            "instrucciones_adicionales": "Enfatizar la declaratoria de sesión permanente del GT-GRD."
        }
        resp = self.client.post("/api/v1/agents/qilqay/redactar", json=payload)
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        
        self.assertEqual(data["distrito"].upper(), "CATACAOS")
        self.assertIn("RESOLUCIÓN DE ALCALDÍA", data["correlativo_oficial"])
        self.assertIn("124-2026-PCM", " ".join(data["base_legal"]))
        self.assertIn("27972", " ".join(data["base_legal"]))
        self.assertTrue(len(data["considerandos"]) >= 3)
        self.assertTrue(len(data["articulado_o_cuerpo"]) >= 3)
        self.assertEqual(len(data["hash_sha256"]), 64)
        self.assertTrue(data["pdf_disponible"])
        print(f"[Test QILQAY] Resolución emitida: {data['correlativo_oficial']} - SHA: {data['hash_sha256'][:16]}")

    def test_03_redactar_oficio_maquinaria_sinagerd(self):
        """Facultad 2: Redacción de Oficio de Requerimiento de Maquinaria en Chosica (150118)."""
        payload = {
            "ubigeo": "150118",
            "facultad_tematica": "TACTICO_SINAGERD",
            "tipo_documento": "OFICIO_REQUERIMIENTO_MAQUINARIA",
            "destinatario": "General de División EP - Comandante General del COEN",
            "instrucciones_adicionales": "Solicitar con urgencia 3 volquetes adicionales para Quebrada Carossio."
        }
        resp = self.client.post("/api/v1/agents/qilqay/redactar", json=payload)
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        
        self.assertIn("LURIGANCHO", data["distrito"].upper())
        self.assertIn("OFICIO N.º", data["correlativo_oficial"])
        self.assertIn("Río Rímac", data["titulo"] + " " + data["sumilla"] + " " + data["texto_completo_markdown"])
        self.assertIn("General de División EP", data["destinatario"])
        self.assertEqual(len(data["hash_sha256"]), 64)
        print(f"[Test QILQAY] Oficio emitido: {data['correlativo_oficial']}")

    def test_04_redactar_sustento_contratacion_directa(self):
        """Facultad 3: Sustento de Contratación Directa Art. 27 Ley 30225 en Chicama (130202)."""
        payload = {
            "ubigeo": "130202",
            "facultad_tematica": "FISCAL_CONTRATACIONES",
            "tipo_documento": "INFORME_SUSTENTO_CONTRATACION_DIRECTA",
            "instrucciones_adicionales": "Incluir alerta de exención de dolo para la comisión evaluadora frente al OCI."
        }
        resp = self.client.post("/api/v1/agents/qilqay/redactar", json=payload)
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        
        self.assertIn("INFORME TÉCNICO-LEGAL", data["correlativo_oficial"])
        self.assertIn("Ley N.º 30225", " ".join(data["base_legal"]))
        self.assertIn("CONTRATACIÓN DIRECTA", data["titulo"])
        self.assertTrue(data["metricas_datos_duros"]["presupuesto_pen"] > 0)
        print(f"[Test QILQAY] Informe Contratación Directa emitido: {data['correlativo_oficial']}")

    def test_05_redactar_padron_bono_bae(self):
        """Facultad 4: Padrón Certificado para Bono BAE en Sechura (200801)."""
        payload = {
            "ubigeo": "200801",
            "facultad_tematica": "SOCIAL_HUMANITARIO",
            "tipo_documento": "PADRON_DAMNIFICADOS_BONO_BAE",
            "instrucciones_adicionales": "Priorizar sectores inundados en el Bajo Piura."
        }
        resp = self.client.post("/api/v1/agents/qilqay/redactar", json=payload)
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        
        self.assertIn("PADRÓN PRELIMINAR", data["titulo"])
        self.assertIn("Ley N.º 31526", " ".join(data["base_legal"]))
        self.assertEqual(data["metricas_datos_duros"]["familias_bae"], 48)
        print(f"[Test QILQAY] Padrón BAE emitido: {data['correlativo_oficial']}")

    def test_06_redactar_ioarr_fondes(self):
        """Facultad 5: Expediente IOARR para FONDES en Eduardo Villanueva (061003)."""
        payload = {
            "ubigeo": "061003",
            "facultad_tematica": "TECNICO_INGENIERIL",
            "tipo_documento": "FICHA_TECNICA_IOARR_FONDES",
            "instrucciones_adicionales": "Metrado para Quebrada Cedrocucho con enrocado rip-rap."
        }
        resp = self.client.post("/api/v1/agents/qilqay/redactar", json=payload)
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        
        self.assertIn("EXPEDIENTE IOARR", data["correlativo_oficial"])
        self.assertIn("Ley N.º 30458", " ".join(data["base_legal"]))
        self.assertEqual(data["metricas_datos_duros"]["costo_total_ioarr"], 1800000.0)
        print(f"[Test QILQAY] Expediente IOARR emitido: {data['correlativo_oficial']}")

    def test_07_redactar_folio_renitli(self):
        """Facultad 6: Folio Pericial Forense ReNITLI en Chosica (150118)."""
        payload = {
            "ubigeo": "150118",
            "facultad_tematica": "FE_PUBLICA_PERITAJE",
            "tipo_documento": "FOLIO_PERICIAL_FORENSE_RENITLI",
            "instrucciones_adicionales": "Acreditar traducción en Quechua Chanka para evacuación en Pedregal."
        }
        resp = self.client.post("/api/v1/agents/qilqay/redactar", json=payload)
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        
        self.assertIn("FOLIO PERICIAL RENITLI-MINCUL", data["correlativo_oficial"])
        self.assertIn("Ley N.º 29735", " ".join(data["base_legal"]))
        self.assertTrue(data["metricas_datos_duros"]["validez_juicio_oral"])
        print(f"[Test QILQAY] Folio ReNITLI emitido: {data['correlativo_oficial']}")

    def test_08_generar_y_verificar_pdf_y_qr(self):
        """Verifica la generación de bytes de PDF A4 oficial con ReportLab y la verificación pública del QR."""
        # 1. Redactar documento
        payload = {
            "ubigeo": "200101", # Piura
            "facultad_tematica": "JURIDICO_EDIL",
            "tipo_documento": "RESOLUCION_ALCALDIA"
        }
        resp = self.client.post("/api/v1/agents/qilqay/redactar", json=payload)
        self.assertEqual(resp.status_code, 200)
        doc = resp.json()
        doc_id = doc["documento_id"]
        sha_hash = doc["hash_sha256"]

        # 2. Descargar PDF
        pdf_resp = self.client.get(f"/api/v1/agents/qilqay/documento/{doc_id}/pdf")
        self.assertEqual(pdf_resp.status_code, 200)
        self.assertEqual(pdf_resp.headers["content-type"], "application/pdf")
        self.assertTrue(len(pdf_resp.content) > 1000)
        self.assertTrue(pdf_resp.content.startswith(b"%PDF"))

        # 3. Verificar mediante Endpoint QR
        verif_resp = self.client.get(f"/api/v1/agents/qilqay/verificar/{sha_hash[:16]}")
        self.assertEqual(verif_resp.status_code, 200)
        vdata = verif_resp.json()
        self.assertTrue(vdata["valido"])
        self.assertEqual(vdata["documento_id"], doc_id)
        self.assertEqual(vdata["estado"], "AUTÉNTICO_REGISTRADO_EN_SEDE_SOBERANA")
        print(f"[Test QILQAY] PDF generado ({len(pdf_resp.content)} bytes) y validado con QR.")


if __name__ == "__main__":
    unittest.main()
