import unittest
import sys
from pathlib import Path

# Add backend directory to sys.path
backend_dir = Path(__file__).resolve().parent.parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from fastapi.testclient import TestClient
from main import app

class TestEdanEndpoints(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(app)

    def test_plantilla_edan_endpoint(self):
        # Test valid ubigeo from directory (Catacaos - 200105)
        response = self.client.get("/api/v1/edan/plantilla/200105")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["ubigeo"], "200105")
        self.assertIn("Catacaos", data["distrito"])
        self.assertEqual(data["departamento"], "Piura")
        self.assertIn("124-2026", data["decreto_emergencia"])
        self.assertGreater(data["dias_restantes_estado_emergencia"], 0)
        self.assertIn("formulario_1_evaluacion_rapida", data)
        self.assertIn("formulario_2a_familias", data)
        self.assertIn("formulario_2b_medios_vida", data)

    def test_evaluar_consistencia_endpoint(self):
        ficha = {
            "ubigeo": "200105",
            "formulario_1_evaluacion_rapida": {
                "poblacion_afectada_estimada": 350,
                "viviendas_colapsadas_estimadas": 15,
                "viviendas_inhabitables_estimadas": 35,
                "servicios_basicos_interrumpidos": ["AGUA_POTABLE", "ELECTRICIDAD"]
            },
            "formulario_2a_familias": [
                {
                    "dni_titular": "45892134",
                    "apellidos_nombres_titular": "Juan Perez Ramos",
                    "condicion_vivienda": "COLAPSADA",
                    "miembros_familia": 4
                },
                {
                    "dni_titular": "78129043",
                    "apellidos_nombres_titular": "Maria Chero Gomez",
                    "condicion_vivienda": "INHABITABLE",
                    "miembros_familia": 3
                }
            ],
            "formulario_2b_medios_vida": {
                "hectareas_cultivo_perdidas": 18.5,
                "tipo_cultivo": "Algodón / Maíz",
                "ganado_muerto_o_afectado": 12
            }
        }
        response = self.client.post("/api/v1/edan/evaluar-consistencia", json={"ficha": ficha})
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("puntaje_consistencia_pct", data)
        self.assertEqual(data["estado_evaluacion"], "CONFORME_PARA_VISTO_BUENO")
        self.assertEqual(data["familias_elegibles_bono_bae"], 2)
        self.assertTrue(data["seguro_agricola_sac_activable"])

    def test_generar_oficial_y_descargar_pdf_endpoint(self):
        ficha = {
            "ubigeo": "200105",
            "distrito": "Catacaos",
            "provincia": "Piura",
            "departamento": "Piura",
            "alcalde": "Johnny Cruz Flores",
            "formulario_1_evaluacion_rapida": {
                "poblacion_afectada_estimada": 120,
                "viviendas_destruidas": 5,
                "viviendas_inhabitables": 10
            },
            "formulario_2a_familias": [
                {
                    "numero_orden": 1,
                    "dni_titular": "41235678",
                    "apellidos_nombres_titular": "Carlos Vilela Nunura",
                    "condicion_vivienda": "DESTRUIDA",
                    "miembros_familia": 5,
                    "material_pared": "ADOBE_COLAPSADO",
                    "califica_bono_bae": True
                }
            ],
            "formulario_2b_medios_vida": {
                "hectareas_cultivo_perdidas": 8.0,
                "tipo_cultivo": "Arroz",
                "ganado_muerto_o_afectado": 4
            }
        }
        
        req = {
            "ficha": ficha,
            "token_autoridad": "MUNI-CATACAOS-SEC-99"
        }
        response = self.client.post("/api/v1/edan/generar-oficial", json=req)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertTrue(data["exito"])
        self.assertIn("edan_id", data)
        edan_id = data["edan_id"]
        self.assertIn("codigo_sinpad", data)
        self.assertIn("hash_sha256", data)
        self.assertIn("disparo_contraloria", data)

        # Test PDF download
        pdf_resp = self.client.get(f"/api/v1/edan/descargar-pdf/{edan_id}")
        self.assertEqual(pdf_resp.status_code, 200)
        self.assertEqual(pdf_resp.headers["content-type"], "application/pdf")
        self.assertGreater(len(pdf_resp.content), 1000)

        # Test SINPAD JSON export
        sinpad_resp = self.client.get(f"/api/v1/edan/exportar-sinpad/{edan_id}")
        self.assertEqual(sinpad_resp.status_code, 200)
        sinpad_data = sinpad_resp.json()
        self.assertEqual(sinpad_data["version_schema"], "SINPAD_V2_2026_HOMOLOGADO")
        self.assertEqual(sinpad_data["cabecera_emergencia"]["edan_id_amaru"], edan_id)

    def test_contraloria_endpoints(self):
        # 1. Dispatch a test edan first
        ficha = {
            "ubigeo": "200105",
            "distrito": "Catacaos",
            "provincia": "Piura",
            "departamento": "Piura",
            "alcalde": "Johnny Cruz Flores",
            "formulario_1_evaluacion_rapida": {"poblacion_afectada_estimada": 80},
            "formulario_2a_familias": [
                {
                    "dni_titular": "10293847",
                    "apellidos_nombres_titular": "Rosa Taboada Cruz",
                    "condicion_vivienda": "COLAPSADA"
                }
            ],
            "formulario_2b_medios_vida": {
                "hectareas_cultivo_perdidas": 5.0,
                "ganado_muerto_o_afectado": 2
            }
        }
        gen_resp = self.client.post("/api/v1/edan/generar-oficial", json={"ficha": ficha})
        self.assertEqual(gen_resp.status_code, 200)
        edan_id = gen_resp.json()["edan_id"]

        # 2. Check inbox
        resp_bandeja = self.client.get("/api/v1/contraloria/bandeja-concurrente")
        self.assertEqual(resp_bandeja.status_code, 200)
        bandeja = resp_bandeja.json()
        self.assertGreaterEqual(bandeja["total_registros"], 1)

        # 3. Issue clearance / visto bueno concurrente
        vb_payload = {
            "edan_id": edan_id,
            "auditor_cgr": "Auditor Principal OCI Piura - C.P.C. M. Mendoza",
            "observaciones": "Revisión satelital y DNI conforme sin duplicidades."
        }
        vb_resp = self.client.post("/api/v1/contraloria/emitir-visto-bueno", json=vb_payload)
        self.assertEqual(vb_resp.status_code, 200)
        vb_data = vb_resp.json()
        self.assertTrue(vb_data["exito"])
        self.assertIn("constancia_cgr", vb_data)
        self.assertIn("CGR-CNC-2026-", vb_data["constancia_cgr"]["constancia_codigo"])

if __name__ == "__main__":
    unittest.main()
