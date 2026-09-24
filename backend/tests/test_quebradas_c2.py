# backend/tests/test_quebradas_c2.py
"""
Suite de Pruebas Unitarias e Integración para AMARU-QUEBRADAS C2
Valida:
1. Endpoints de Mando C2 (Resumen Nacional, Cuencas, Scatter Plot ISAAC).
2. Telemetría de Geófonos y Cámaras en Tiempo Real del IGP (con resiliencia y caché).
3. Simulación de gabinete de disparo de geófonos.
4. Integración táctica perentoria con el Agente QILQAY y emisión de alerta CAP v1.2 SISMATE.
"""

import unittest
from fastapi.testclient import TestClient
from main import app


class TestQuebradasC2(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(app)

    def test_01_resumen_c2_nacional(self):
        """Verifica que el resumen nacional de Quebradas C2 reporte métricas y catálogo."""
        resp = self.client.get("/api/v1/quebradas/c2/resumen")
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertEqual(data["estado"], "C2_OPERATIVO")
        self.assertIn("metricas_clave", data)
        self.assertEqual(data["metricas_clave"]["total_quebradas_catalogo"], 60)
        self.assertGreater(data["metricas_clave"]["poblacion_total_expuesta"], 500000)
        self.assertIn("telemetria_igp", data)
        self.assertIn("estrangulamientos_criticos", data)

    def test_02_cuencas_isaac_disponibles(self):
        """Verifica que se listen las cuencas instrumentadas con el modelo ISAAC."""
        resp = self.client.get("/api/v1/quebradas/c2/cuencas")
        self.assertEqual(resp.status_code, 200)
        cuencas = resp.json()
        self.assertGreaterEqual(len(cuencas), 4)
        ids = [c["id_cuenca"] for c in cuencas]
        self.assertIn("RIMAC_CHOSICA", ids)
        self.assertIn("MOCHE_TRUJILLO", ids)
        self.assertIn("PIURA_CANCHAQUE", ids)
        self.assertIn("CHILI_AREQUIPA", ids)

    def test_03_isaac_scatter_rimac(self):
        """Verifica el cálculo del scatter plot Precipitación vs Altitud en la Cuenca Rímac."""
        resp = self.client.get("/api/v1/quebradas/c2/isaac-scatter?cuenca_id=RIMAC_CHOSICA")
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertEqual(data["cuenca_id"], "RIMAC_CHOSICA")
        self.assertIn("gradiente_orografico_mm_1000m", data)
        self.assertGreater(data["total_estaciones"], 5)
        estaciones = data["estaciones"]
        nombres = [e["nombre"] for e in estaciones]
        self.assertTrue(any("Chosica" in n for n in nombres))
        self.assertTrue(any("Matucana" in n for n in nombres))
        # Validar campos de cada estación
        for est in estaciones:
            self.assertIn("altitud_msnm", est)
            self.assertIn("lluvia_1h_mm", est)
            self.assertIn("umbral_mm", est)
            self.assertIn("estado_alerta", est)

    def test_04_isaac_scatter_piura(self):
        """Verifica el scatter plot en la Cuenca Piura / Canchaque."""
        resp = self.client.get("/api/v1/quebradas/c2/isaac-scatter?cuenca_id=PIURA_CANCHAQUE")
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertEqual(data["region"], "Piura")
        estaciones = data["estaciones"]
        nombres = [e["nombre"] for e in estaciones]
        self.assertTrue(any("Canchaque" in n for n in nombres))

    def test_05_igp_telemetria_geofonos_camaras(self):
        """Verifica la telemetría de geófonos y webcams del IGP."""
        resp = self.client.get("/api/v1/quebradas/c2/igp-telemetria")
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertEqual(data["estado"], "OK")
        self.assertIn("total_estaciones", data)
        self.assertGreaterEqual(data["total_estaciones"], 6)
        estaciones = data["estaciones"]
        
        # Validar cobertura geográfica trilateral (Lima, Piura, Arequipa)
        ids_str = " ".join([f"{e['id_estacion']} {e.get('codigo_amaru','')} {e.get('nombre_quebrada','')}" for e in estaciones]).lower()
        self.assertTrue("huaycoloro" in ids_str or "rioseco" in ids_str)
        self.assertTrue("piur" in ids_str or "limon" in ids_str or "canchaque" in ids_str)
        self.assertTrue("areq" in ids_str or "misti" in ids_str or "lazaro" in ids_str)

        # Validar estructura sensorial de cada estación
        for est in estaciones:
            self.assertIn("geofono_estado", est)
            self.assertIn("ultima_imagen", est)
            self.assertIn("url_completa", est["ultima_imagen"])
            self.assertIn("ultima_alerta", est)
            self.assertIn("actividad_lahar", est["ultima_alerta"])

    def test_06_simulacion_disparo_geofono(self):
        """Gabinete de Simulación: Simula la detección física de flujo en el geófono de Huaycoloro."""
        # Obtener estaciones actuales
        resp_est = self.client.get("/api/v1/quebradas/c2/igp-telemetria")
        estaciones = resp_est.json()["estaciones"]
        est_target = next(
            (e for e in estaciones if "huaycoloro" in e["id_estacion"].lower() or "huaycoloro" in e.get("nombre_quebrada","").lower()),
            estaciones[0]
        )
        target_id = est_target["id_estacion"]

        payload = {
            "id_estacion": target_id,
            "velocidad_ms": 4.8,
            "altura_m": 2.5
        }
        resp = self.client.post("/api/v1/quebradas/c2/simular-geofono", json=payload)
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertEqual(data["estado"], "SIMULACRO_DISPARADO")
        estacion = data["estacion"]
        self.assertEqual(estacion["geofono_estado"], "ALERTA_FLUJO_DETECTADO")
        self.assertTrue(estacion["ultima_alerta"]["actividad_lahar"])
        self.assertEqual(estacion["ultima_alerta"]["velocidad_lahar"], 4.8)
        self.assertIsNotNone(estacion["ultima_alerta"]["arrivos"]["minutos_impacto"])

    def test_07_disparar_alerta_qilqay_orden_evacuacion(self):
        """Verifica la respuesta perentoria conectando la activación de quebrada con el Agente QILQAY."""
        payload = {
            "id_quebrada": "Q-LIM-09",
            "alcalde_o_autoridad": "Alcalde de Lurigancho-Chosica",
            "actor_solicitante": "AMARU-QUEBRADAS C2 / COEN"
        }
        resp = self.client.post("/api/v1/quebradas/c2/disparar-alerta-qilqay", json=payload)
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertEqual(data["estado"], "ALERTA_Y_RESOLUCION_EMITIDA")
        self.assertEqual(data["quebrada_id"], "Q-LIM-09")
        self.assertIn("cinematica_manning", data)
        self.assertGreater(data["cinematica_manning"]["t_lag_minutos"], 0)
        self.assertIn("documento_qilqay", data)
        doc = data["documento_qilqay"]
        self.assertIn("documento_id", doc)
        self.assertIn("RESOLUCIÓN DE ALCALDÍA", doc["correlativo_oficial"])
        self.assertEqual(len(doc["hash_sha256"]), 64)
        self.assertTrue(doc["pdf_disponible"])
        self.assertIn("alerta_cap_sismate", data)
        self.assertEqual(data["alerta_cap_sismate"]["urgencia"], "Inmediate")
        self.assertIn("SISMATE", data["alerta_cap_sismate"]["mensaje_difusion_celular"])


if __name__ == "__main__":
    unittest.main()
