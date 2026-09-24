"""
Pruebas Unitarias para el Conector PIDE - RENIEC y Endpoints de Interoperabilidad
AMARU-CLIMATE - Lab4
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
from services.connectors.pide_reniec_connector import pide_reniec_connector

class TestPideReniecConnector(unittest.TestCase):
    def setUp(self):
        self.connector = pide_reniec_connector
        self.client = TestClient(app)

    def test_consulta_dni_vigente_seed(self):
        # DNI semilla de Catacaos
        res = self.connector.consultar_dni("45892134")
        self.assertEqual(res["coResultado"], "0000")
        self.assertEqual(res["nuDni"], "45892134")
        self.assertEqual(res["nombreCompleto"], "PEREZ RAMOS JUAN CARLOS")
        self.assertEqual(res["sexo"], "M")
        self.assertEqual(res["restriccion"], "NINGUNA")
        self.assertTrue(res["esValidoBae"])

    def test_consulta_dni_fallecido_alerta_bae(self):
        # DNI de prueba de titular fallecido
        res = self.connector.consultar_dni("99990001")
        self.assertEqual(res["coResultado"], "0003")
        self.assertEqual(res["restriccion"], "FALLECIDO")
        self.assertFalse(res["esValidoBae"])
        self.assertIn("FALLECIDO", res["mensaje"])

    def test_consulta_dni_menor_de_edad(self):
        # DNI de prueba de menor de edad
        res = self.connector.consultar_dni("99990002")
        self.assertEqual(res["restriccion"], "MENOR DE EDAD")
        self.assertFalse(res["esValidoBae"])
        self.assertLess(res["edad"], 18)

    def test_consulta_dni_algoritmico_determinista(self):
        # DNI arbitrario válido de 8 dígitos
        res = self.connector.consultar_dni("72345678")
        self.assertEqual(res["coResultado"], "0000")
        self.assertEqual(res["nuDni"], "72345678")
        self.assertGreater(len(res["nombreCompleto"]), 5)
        self.assertIn(res["sexo"], ["M", "F"])

    def test_consulta_dni_invalido_sintaxis(self):
        # DNI corto o con letras
        res = self.connector.consultar_dni("12345A")
        self.assertEqual(res["coResultado"], "0001")
        self.assertFalse(res["esValidoBae"])

    def test_validar_padron_masivo(self):
        familias = [
            {"dni_titular": "45892134", "condicion_vivienda": "COLAPSADA"},
            {"dni_titular": "99990001", "condicion_vivienda": "INHABITABLE"},  # Fallecido
            {"dni_titular": "45892134", "condicion_vivienda": "DESTRUIDA"}    # Duplicado
        ]
        res = self.connector.validar_padron_masivo(familias)
        self.assertEqual(res["total_auditados"], 3)
        self.assertEqual(len(res["fallecidos_detectados"]), 1)
        self.assertEqual(len(res["duplicados_padron"]), 1)
        self.assertTrue(res["alerta_bloqueante_cgr"])

    def test_endpoint_consultar_dni(self):
        resp = self.client.get("/api/v1/pide/reniec/consultar/45892134")
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertEqual(data["nuDni"], "45892134")
        self.assertEqual(data["nombreCompleto"], "PEREZ RAMOS JUAN CARLOS")

    def test_endpoint_estado_conexion(self):
        resp = self.client.get("/api/v1/pide/reniec/estado-conexion")
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertIn("simulador_contingencia_activo", data)
        self.assertIn("endpoint_oficial", data)

    def test_endpoint_casos_simulacion(self):
        resp = self.client.get("/api/v1/pide/reniec/casos-simulacion")
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertGreaterEqual(len(data), 3)

if __name__ == "__main__":
    unittest.main()
