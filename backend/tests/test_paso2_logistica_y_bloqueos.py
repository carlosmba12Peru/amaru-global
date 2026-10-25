import unittest
from fastapi.testclient import TestClient
from main import app
from services.routing.humanitarian_router import humanitarian_router
from services.edan_sinpad_service import edan_sinpad_service


class TestPaso2LogisticaYBloqueos(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(app)
        humanitarian_router.bloqueos_activos.clear()

    def tearDown(self):
        humanitarian_router.bloqueos_activos.clear()

    def test_01_catalogos_junin_chupaca_cargados(self):
        """Verifica que el almacén Huancayo, el albergue Chupaca y los puentes Cunas y Breña estén integrados."""
        almacenes = {a["id"]: a for a in humanitarian_router.listar_almacenes()}
        albergues = {alb["id"]: alb for alb in humanitarian_router.listar_albergues()}
        puentes = {p["id"]: p for p in humanitarian_router.listar_puentes_criticos()}

        self.assertIn("ALM-JUNIN-HUANCAYO", almacenes, "Debe existir el almacén de Huancayo")
        self.assertEqual(almacenes["ALM-JUNIN-HUANCAYO"]["departamento"], "Junín")
        self.assertGreaterEqual(almacenes["ALM-JUNIN-HUANCAYO"]["capacidad_tn"], 300.0)

        self.assertIn("ALB-CHUPACA-YAUYOS", albergues, "Debe existir el albergue de Chupaca Yauyos")
        self.assertEqual(albergues["ALB-CHUPACA-YAUYOS"]["puente_critico_acceso"], "puente-cunas-chupaca")

        self.assertIn("puente-cunas-chupaca", puentes, "Debe existir Puente Cunas")
        self.assertIn("puente-brena-huancayo", puentes, "Debe existir Puente Breña")

    def test_02_ruteo_chupaca_nominal_vs_desvio_vs_aislamiento(self):
        """Verifica el ruteo Dijkstra: troncal (12 km), desvío por Puente Breña (23.5 km) y aislamiento total."""
        # 1. Ruta nominal sin cortes
        res_normal = humanitarian_router.calcular_ruta_contingencia(
            origen_id="ALM-JUNIN-HUANCAYO",
            destino_id="ALB-CHUPACA-YAUYOS",
            puentes_cortados=[]
        )
        self.assertEqual(res_normal["estado_conectividad"], "TRANSITO_EXPEDITO_NORMAL")
        self.assertEqual(res_normal["ruta_efectiva"]["distancia_total_km"], 12.0)
        self.assertFalse(res_normal["ruta_efectiva"]["usa_desvios_emergencia"])

        # 2. Corte de Puente Cunas -> Reruteo por Puente Breña
        res_desvio = humanitarian_router.calcular_ruta_contingencia(
            origen_id="ALM-JUNIN-HUANCAYO",
            destino_id="ALB-CHUPACA-YAUYOS",
            puentes_cortados=["puente-cunas-chupaca"]
        )
        self.assertEqual(res_desvio["estado_conectividad"], "DESVIO_TACTICO_ACTIVO")
        self.assertEqual(res_desvio["ruta_efectiva"]["distancia_total_km"], 23.5)
        self.assertTrue(res_desvio["ruta_efectiva"]["usa_desvios_emergencia"])
        self.assertIn("puente-brena-huancayo", res_desvio["ruta_efectiva"]["puentes_en_ruta"])

        # 3. Colapso de ambos puentes -> Aislamiento Total Terrestre
        res_aislado = humanitarian_router.calcular_ruta_contingencia(
            origen_id="ALM-JUNIN-HUANCAYO",
            destino_id="ALB-CHUPACA-YAUYOS",
            puentes_cortados=["puente-cunas-chupaca", "puente-brena-huancayo"]
        )
        self.assertEqual(res_aislado["estado_conectividad"], "AISLAMIENTO_TERRESTRE_TOTAL")
        self.assertTrue(res_aislado["requiere_puente_aereo_ffaa"])
        self.assertIn("Helicóptero FAP", res_aislado["medio_transporte_recomendado"])

    def test_03_motor_bloqueos_viales_dinamico(self):
        """Verifica registrar_bloqueo, su impacto automático en el ruteo y el posterior levantamiento."""
        # Registrar bloqueo por huayco en Río Cunas
        bloqueo = humanitarian_router.registrar_bloqueo(
            tipo_incidente="CRECIDA_RIO_COLAPSO_ESTRIBO",
            ubicacion="Río Cunas km 4.5, Chupaca",
            descripcion="Desborde torrencial socava estribo izquierdo de Puente Cunas",
            puente_afectado="puente-cunas-chupaca",
            reportado_por="COEL_CHUPACA_POLTUR",
            severidad="CRITICO"
        )

        self.assertTrue(bloqueo["id"].startswith("BLOQ-"))
        self.assertEqual(len(humanitarian_router.listar_bloqueos_activos()), 1)

        # Calcular ruta sin pasar puentes_cortados explícitamente: el bloqueo debe activarse automáticamente
        res = humanitarian_router.calcular_ruta_contingencia(
            origen_id="ALM-JUNIN-HUANCAYO",
            destino_id="ALB-CHUPACA-YAUYOS",
            puentes_cortados=[]
        )
        self.assertEqual(res["estado_conectividad"], "DESVIO_TACTICO_ACTIVO")
        self.assertEqual(res["ruta_efectiva"]["distancia_total_km"], 23.5)

        # Levantar bloqueo
        eliminado = humanitarian_router.eliminar_bloqueo(bloqueo["id"])
        self.assertTrue(eliminado)
        self.assertEqual(len(humanitarian_router.listar_bloqueos_activos()), 0)

        # Tras levantar el bloqueo, la ruta vuelve a la troncal de 12 km
        res_restaurado = humanitarian_router.calcular_ruta_contingencia(
            origen_id="ALM-JUNIN-HUANCAYO",
            destino_id="ALB-CHUPACA-YAUYOS",
            puentes_cortados=[]
        )
        self.assertEqual(res_restaurado["estado_conectividad"], "TRANSITO_EXPEDITO_NORMAL")
        self.assertEqual(res_restaurado["ruta_efectiva"]["distancia_total_km"], 12.0)

    def test_04_despacho_orden_edan_integrado(self):
        """Verifica que una Ficha EDAN aprobada genere la orden de despacho formal INDECI con convoy y hash CGR."""
        # 1. Crear ficha EDAN para Chupaca con doble quórum
        borrador = edan_sinpad_service.generar_plantilla("120901")
        oficial = edan_sinpad_service.generar_ficha_oficial(
            payload=borrador,
            token_alcalde="TOKEN-ALCALDE-CHUPACA-2026",
            token_indeci="TOKEN-INDECI-COEN-2026"
        )
        edan_id = oficial["edan_id"]

        # 2. Despachar convoy formal
        orden = humanitarian_router.despachar_orden_edan(edan_id)

        self.assertTrue(orden["exito"])
        self.assertTrue(orden["codigo_orden_despacho"].startswith("ORD-DESP-"))
        self.assertEqual(orden["edan_id"], edan_id)
        self.assertEqual(orden["almacen_origen"]["id"], "ALM-JUNIN-HUANCAYO")
        self.assertEqual(orden["albergue_destino"]["id"], "ALB-CHUPACA-YAUYOS")
        self.assertEqual(orden["estado_desbloqueo_almacen"], "DESBLOQUEO_TOTAL_ALMACEN_INDECI")
        self.assertTrue(orden["quorum_dual_cumplido"])
        self.assertGreaterEqual(orden["convoy_tactico"]["numero_camiones_requeridos"], 1)
        self.assertIn("trazabilidad_cgr", orden)
        self.assertEqual(len(orden["trazabilidad_cgr"]["hash_sha256_orden"]), 64)

    def test_05_api_endpoints_bloqueos_y_despacho(self):
        """Verifica los endpoints REST en FastAPI para gestión de bloqueos y despacho EDAN."""
        # 1. Crear bloqueo vía API
        payload_bloq = {
            "tipo_incidente": "HUAYCO_LADERA",
            "ubicacion": "Carretera Central km 44, Matucana",
            "descripcion": "Deslizamiento de lodo interrumpe ambos sentidos",
            "puente_afectado": "carretera-central-chosica-matucana",
            "severidad": "CRITICO"
        }
        res_post = self.client.post("/api/v1/logistica/bloqueos", json=payload_bloq)
        self.assertEqual(res_post.status_code, 200)
        data_post = res_post.json()
        bloqueo_id = data_post["bloqueo"]["id"]

        # 2. Listar bloqueos vía API
        res_get = self.client.get("/api/v1/logistica/bloqueos")
        self.assertEqual(res_get.status_code, 200)
        data_get = res_get.json()
        self.assertTrue(any(b["id"] == bloqueo_id for b in data_get["bloqueos"]))

        # 3. Despachar EDAN vía API
        res_despacho = self.client.post(f"/api/v1/logistica/despachar-edan/EDAN-TEST-CHUPACA-001")
        self.assertEqual(res_despacho.status_code, 200)
        data_despacho = res_despacho.json()
        self.assertTrue(data_despacho["exito"])
        self.assertEqual(data_despacho["almacen_origen"]["id"], "ALM-JUNIN-HUANCAYO")

        # 4. Eliminar bloqueo vía API
        res_del = self.client.delete(f"/api/v1/logistica/bloqueos/{bloqueo_id}")
        self.assertEqual(res_del.status_code, 200)
        data_del = res_del.json()
        self.assertTrue(data_del["exito"])

    def test_06_simulacro_mega_fen_c4isr(self):
        """Verifica la ejecución integral del Simulacro Operacional Mega-FEN (Ground Truth 1998/2017)."""
        res_sim = self.client.post("/api/v1/logistica/simulacro-mega-fen")
        self.assertEqual(res_sim.status_code, 200)
        data = res_sim.json()

        self.assertTrue(data["exito"])
        self.assertEqual(data["tipo_simulacro"], "OPERACIONAL_MEGA_FEN_2026_2027")
        self.assertEqual(len(data["puentes_cortados"]), 6)
        self.assertIn("puente-viru-pe1n", data["puentes_cortados"])
        self.assertIn("puente-reque-pe1n", data["puentes_cortados"])

        # Rutas estratégicas de contingencia calculadas
        rutas = data["rutas_estrategicas"]
        self.assertIn("viru_la_libertad", rutas)
        self.assertTrue(rutas["viru_la_libertad"]["ruta_efectiva"]["usa_desvios_emergencia"])
        self.assertEqual(rutas["viru_la_libertad"]["estado_conectividad"], "DESVIO_TACTICO_ACTIVO")

        # Comparativa pericial de doctrina contra modelo convencional
        self.assertIn("comparativa_doctrina", data)
        self.assertIn("modelo_amaru_climate_c4isr_vrp", data["comparativa_doctrina"])


if __name__ == "__main__":
    unittest.main()
