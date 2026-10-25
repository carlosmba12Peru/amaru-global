"""
Pruebas Unitarias e Integración: Paso 1 (AMARU-CLIMATE)
- Síntesis Dinámica Territorial de la Ficha EDAN (Eliminación de Mocks y cableado estático)
- Quórum Dual Criptográfico (Alcalde + INDECI/OCI)
- Mesa de Evaluación y Homologación Tripartita (RENIEC + Municipio + INDECI)
"""

import unittest
import sys
from pathlib import Path

# Add backend to sys.path
backend_dir = Path(__file__).resolve().parent.parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from fastapi.testclient import TestClient
from main import app
from services.edan_sinpad_service import edan_sinpad_service
from services.connectors.pide_reniec_connector import pide_reniec_connector

class TestPaso1SintesisYQuorum(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(app)
        self.edan = edan_sinpad_service
        self.reniec = pide_reniec_connector

    def test_sintesis_dinamica_chupaca_junin(self):
        """Valida que UBIGEO 120901 (Chupaca) no use datos fijos de Piura sino síntesis andina real."""
        plantilla = self.edan.generar_plantilla("120901")
        
        # 1. Datos institucionales
        self.assertEqual(plantilla["ubigeo"], "120901")
        self.assertIn("Jun", plantilla["departamento"])
        self.assertEqual(plantilla["provincia"], "Chupaca")
        self.assertEqual(plantilla["distrito"], "Chupaca")
        self.assertIn("BASTIDAS", plantilla["alcalde"].upper())

        # 2. Familias territorializadas andinas
        familias = plantilla["formulario_2a_familias"]
        self.assertGreaterEqual(len(familias), 3)
        apellidos_juntos = " ".join(f["apellidos_nombres_titular"] for f in familias)
        self.assertTrue(any(ape in apellidos_juntos for ape in ["MAYTA", "HUAMAN", "BASTIDAS", "QUISPE"]))
        
        # Materiales y sectores de Chupaca
        sectores_juntos = " ".join(f["sector_caserio"] for f in familias)
        self.assertTrue(any(s in sectores_juntos for s in ["Barrio", "Yauyos", "Cunas", "Chupaca"]))
        
        # 3. Medios de vida de sierra
        medios = plantilla["formulario_2b_medios_vida"]
        self.assertIn("MAIZ", medios["tipo_cultivo"])
        self.assertIn("PAPA", medios["tipo_cultivo"])
        self.assertTrue(medios["activacion_seguro_agricola_sac"])

        # 4. Cálculo Anexo 06 INDECI de BAH
        bah = plantilla["requerimiento_ayuda_humanitaria_anexo_06"]
        self.assertGreater(bah["carpas_familiares"], 0)
        self.assertGreater(bah["agua_potable_litros"], 0)
        self.assertGreater(bah["raciones_frias"], 0)

    def test_sintesis_dinamica_chosica_lima(self):
        """Valida que UBIGEO 150118 (Lurigancho) sintetice quebradas y colegios de Chosica."""
        plantilla = self.edan.generar_plantilla("150118")
        self.assertEqual(plantilla["distrito"].upper(), "LURIGANCHO")
        
        # Verificar sectores de quebrada
        familias = plantilla["formulario_2a_familias"]
        sectores = " ".join(f["sector_caserio"] for f in familias)
        self.assertTrue("Quirio" in sectores or "Carapongo" in sectores or "Pedregal" in sectores)

    def test_quorum_dual_bloqueo_preventivo_una_sola_firma(self):
        """Valida que con 1 sola firma no se desbloquee el almacén de INDECI."""
        plantilla = self.edan.generar_plantilla("120901")
        
        # Caso A: Solo firma Alcalde
        res_alc = self.edan.generar_ficha_oficial(
            payload=plantilla,
            token_alcalde="TOKEN-ALCALDE-CHUPACA-123456"
        )
        self.assertFalse(res_alc["quorum_dual"]["cumplido"])
        self.assertEqual(res_alc["quorum_dual"]["estado_desbloqueo"], "BLOQUEO_PREVENTIVO_FALTA_FIRMA_INDECI")
        self.assertEqual(len(res_alc["quorum_dual"]["firmas"]), 1)

        # Caso B: Solo firma INDECI
        res_ind = self.edan.generar_ficha_oficial(
            payload=plantilla,
            token_indeci="TOKEN-INDECI-COEN-789012"
        )
        self.assertFalse(res_ind["quorum_dual"]["cumplido"])
        self.assertEqual(res_ind["quorum_dual"]["estado_desbloqueo"], "BLOQUEO_PREVENTIVO_FALTA_FIRMA_ALCALDE")

    def test_quorum_dual_desbloqueo_total_dos_firmas(self):
        """Valida que con ambas firmas (Alcalde + INDECI) el almacén se desbloquee formalmente."""
        plantilla = self.edan.generar_plantilla("120901")
        res = self.edan.generar_ficha_oficial(
            payload=plantilla,
            token_alcalde="TOKEN-ALCALDE-CHUPACA-123456",
            token_indeci="TOKEN-INDECI-COEN-789012"
        )
        self.assertTrue(res["quorum_dual"]["cumplido"])
        self.assertEqual(res["quorum_dual"]["estado_desbloqueo"], "DESBLOQUEO_TOTAL_ALMACEN_INDECI")
        self.assertEqual(len(res["quorum_dual"]["firmas"]), 2)
        self.assertTrue(res["exito"])
        self.assertTrue(res["codigo_sinpad"].startswith("SINPAD-2026-"))
        self.assertTrue(len(res["hash_sha256"]) == 64)

    def test_evaluacion_tripartita_puertas_reniec_municipio_indeci(self):
        """Valida la mesa de homologación tripartita para los distintos escenarios."""
        # 1. Caso Aprobado Conforme (Chupaca)
        ev_ok = self.reniec.simular_evaluacion_tripartita(
            dni="20045612",
            ubigeo_emergencia="120901"
        )
        self.assertEqual(ev_ok["dictamen_final"], "APROBADO_CONFORME_TRIPARTITO")
        self.assertEqual(ev_ok["semaforo"], "VERDE")
        self.assertEqual(ev_ok["puerta_1_reniec"]["estado"], "APROBADO")
        self.assertTrue(ev_ok["puerta_2_municipio"]["coincidencia_ubigeo"])
        self.assertTrue(ev_ok["puerta_3_indeci_oci"]["califica_bono_arrendamiento_bae_500"])

        # 2. Caso Fallecido (Alerta de Fraude)
        ev_fallecido = self.reniec.simular_evaluacion_tripartita(
            dni="99990001",
            ubigeo_emergencia="200105"
        )
        self.assertEqual(ev_fallecido["dictamen_final"], "RECHAZADO_FRAUDE_FALLECIDO")
        self.assertEqual(ev_fallecido["semaforo"], "ROJO")
        self.assertEqual(ev_fallecido["puerta_1_reniec"]["estado"], "RECHAZADO")
        self.assertFalse(ev_fallecido["puerta_3_indeci_oci"]["califica_bono_arrendamiento_bae_500"])

        # 3. Caso Menor de Edad (Observado)
        ev_menor = self.reniec.simular_evaluacion_tripartita(
            dni="99990002",
            ubigeo_emergencia="200105"
        )
        self.assertEqual(ev_menor["dictamen_final"], "OBSERVADO_MENOR_DE_EDAD")
        self.assertEqual(ev_menor["semaforo"], "AMBAR")
        self.assertFalse(ev_menor["puerta_3_indeci_oci"]["califica_bono_arrendamiento_bae_500"])
        self.assertTrue(ev_menor["puerta_3_indeci_oci"]["califica_bienes_ayuda_humanitaria_bah"])

        # 4. Caso Fuera de Jurisdicción (Arraigo en otra provincia)
        ev_juris = self.reniec.simular_evaluacion_tripartita(
            dni="99990003",
            ubigeo_emergencia="120901" # Pretende cobrar en Chupaca con DNI de Arequipa
        )
        self.assertEqual(ev_juris["dictamen_final"], "CONDICIONADO_ARRAIGO_TERRITORIAL")
        self.assertEqual(ev_juris["semaforo"], "AMBAR")
        self.assertFalse(ev_juris["puerta_2_municipio"]["coincidencia_ubigeo"])

    def test_endpoint_evaluacion_tripartita_api(self):
        """Valida el endpoint HTTP POST /api/v1/pide/reniec/simular-evaluacion-tripartita."""
        resp = self.client.post(
            "/api/v1/pide/reniec/simular-evaluacion-tripartita",
            json={
                "dni": "20045612",
                "ubigeo_emergencia": "120901"
            }
        )
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertEqual(data["dictamen_final"], "APROBADO_CONFORME_TRIPARTITO")
        self.assertEqual(data["semaforo"], "VERDE")

if __name__ == "__main__":
    unittest.main()
