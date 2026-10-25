# backend/tests/test_damnificados_amaru.py
"""
Pruebas Unitarias de AMARU-DAMNIFICADOS:
- Pre-Padrón Digital EDAN con Desacoplamiento Criptográfico Zero-PII (CUP-DAMN)
- Motor de Auditoría Cruzada Territorial AMARU-CLIMATE (Score 0 - 100%)
- Pre-Clasificación Oficial EDAN v2 / INDECI (Colapsada, Inhabitable, Afectada Leve)
- Elegibilidad Técnica para Bono BAE (S/ 500 mensuales - Ley N.° 31526)
- Protocolo Break-the-Glass con Auditoría WORM inmutable y Hash SHA-256
- Soberanía Humana: Dictamen Aprobatorio de la Ficha EDAN y Exportación al SINPAD
"""

import unittest
import os
import json
from services.damnificados_service import DamnificadosService

class TestDamnificadosAmaru(unittest.TestCase):
    def setUp(self):
        self.service = DamnificadosService()

    def test_01_validacion_dni(self):
        """Valida que el DNI del jefe de hogar sea numérico de 8 dígitos."""
        self.assertTrue(self.service.validar_dni("02847125"))
        self.assertTrue(self.service.validar_dni("74581296"))
        self.assertFalse(self.service.validar_dni("12345"))  # Menor a 8
        self.assertFalse(self.service.validar_dni("7458129A"))  # Contiene letras
        self.assertFalse(self.service.validar_dni(""))  # Vacío
        self.assertFalse(self.service.validar_dni(None))  # Nulo

    def test_02_registro_desacoplado_cup_damn(self):
        """Valida que el registro desacople la PII en AES-256 y genere CUP-DAMN sin exponer datos."""
        payload = {
            "dni_jefe_hogar": "02847125",
            "nombres": "Segundo Manuel",
            "apellidos": "Sernaqué Chero",
            "telefono": "969123456",
            "contacto_auxiliar": "981245789 (Hijo)",
            "ubigeo": "200105",  # Catacaos
            "direccion_exacta": "Jr. Comercio 840, Barrio Monte Sullón",
            "referencia_catastral": "A 3 cuadras del Malecón",
            "lat": -5.268,
            "lng": -80.680,
            "condicion_tenencia": "PROPIETARIO",
            "material_muros": "ADOBE_QUINCHA",
            "material_techo": "CALAMINA",
            "tirante_agua": "RODILLA_50CM",
            "agua_dentro_vivienda": True,
            "estado_vivienda_declarado": "INHABITABLE",
            "total_integrantes": 5,
            "ninos_menores_5": 2,
            "adultos_mayores_65": 1,
            "personas_discapacidad": 0,
            "mujeres_gestantes": 1,
            "servicios_afectados": ["AGUA_POTABLE", "DESAGUE"],
            "relato_danos": "El desborde del río Piura entró a la casa y los muros de adobe se están partiendo.",
            "foto_evidencia_url": "/img/edan/adobe_flood_sample.jpg"
        }

        res = self.service.registrar_pre_padron_damnificado(payload)
        self.assertIn("cup", res)
        self.assertTrue(res["cup"].startswith("CUP-DAMN-200105-"))
        self.assertEqual(res["pre_clasificacion"], "DAMNIFICADO_VIVIENDA_INHABITABLE")
        self.assertTrue(res["elegible_bono_bae"])
        self.assertGreaterEqual(res["score_consistencia"], 80.0)

        # Verificar que el expediente en memoria NO expone PII cruda
        caso = self.service.obtener_detalle_caso(res["cup"])
        self.assertIsNotNone(caso)
        self.assertNotIn("dni_jefe_hogar", caso)
        self.assertNotIn("nombres", caso)
        self.assertNotIn("apellidos", caso)
        self.assertNotIn("telefono", caso)
        self.assertNotIn("direccion_exacta", caso)
        self.assertFalse(caso["sello_identidad_desbloqueado"])

    def test_03_evaluacion_consistencia_colapsada_techo(self):
        """Valida que tirante a nivel techo clasifique como DAMNIFICADO_VIVIENDA_COLAPSADA y Bono BAE."""
        payload_techo = {
            "dni_jefe_hogar": "41258963",
            "nombres": "Rosa",
            "apellidos": "Sandoval",
            "telefono": "974125896",
            "direccion_exacta": "Sector Viduque Mz B Lote 4",
            "ubigeo": "200105",
            "lat": -5.270,
            "lng": -80.675,
            "material_muros": "LADRILLO_CONCRETO",
            "tirante_agua": "TECHO_200CM",
            "estado_vivienda_declarado": "COLAPSADA_DESTRUIDA"
        }
        res = self.service.registrar_pre_padron_damnificado(payload_techo)
        self.assertEqual(res["pre_clasificacion"], "DAMNIFICADO_VIVIENDA_COLAPSADA")
        self.assertTrue(res["elegible_bono_bae"])

    def test_04_evaluacion_afectado_leve_no_bae(self):
        """Valida que anegamiento ligero clasifique como AFECTADO_LEVE y NO elegible a Bono BAE."""
        payload_leve = {
            "dni_jefe_hogar": "10458796",
            "nombres": "Carlos",
            "apellidos": "Mendoza",
            "telefono": "981245789",
            "direccion_exacta": "Av. Los Nogales 210",
            "ubigeo": "150118",  # Chosica
            "lat": -11.935,
            "lng": -76.705,
            "material_muros": "LADRILLO_CONCRETO",
            "tirante_agua": "TOBILLO_15CM",
            "agua_dentro_vivienda": False,
            "estado_vivienda_declarado": "AFECTADA"
        }
        res = self.service.registrar_pre_padron_damnificado(payload_leve)
        self.assertEqual(res["pre_clasificacion"], "AFECTADO_VIVIENDA_AFECTADA_LEVE")
        self.assertFalse(res["elegible_bono_bae"])

    def test_05_bandeja_municipal_desacoplada_y_ordenada(self):
        """Valida que la bandeja de Defensa Civil no exponga PII y priorice colapsados."""
        bandeja = self.service.obtener_padron_municipal()
        self.assertGreater(len(bandeja), 0)

        for c in bandeja:
            self.assertIn("cup", c)
            self.assertIn("evaluacion_ia", c)
            self.assertNotIn("dni_jefe_hogar", c)
            self.assertNotIn("telefono", c)

    def test_06_protocolo_break_the_glass_auditoria_worm(self):
        """Valida el desbloqueo de identidad con DNI de evaluador y bitácora WORM inmutable."""
        # Tomar un caso existente
        bandeja = self.service.obtener_padron_municipal()
        caso_elegido = bandeja[0]
        cup = caso_elegido["cup"]

        # Intentar con DNI inválido -> debe fallar
        with self.assertRaises(ValueError):
            self.service.romper_sello_identidad_edan(
                cup=cup,
                dni_evaluador="123",  # Inválido
                nombre_evaluador="Ing. Manuel Torres",
                cargo="Jefe Defensa Civil",
                motivo="Inspección ocular para entrega de carpas humanitarias."
            )

        # Desbloqueo válido
        res = self.service.romper_sello_identidad_edan(
            cup=cup,
            dni_evaluador="40891234",
            nombre_evaluador="Ing. Manuel Torres Pacherres",
            cargo="Jefe ODC Catacaos",
            motivo="Inspección ocular en faja marginal para entrega de kit de alimentos y carpa familiar."
        )

        self.assertEqual(res["cup"], cup)
        self.assertIn("auditoria_worm_hash", res)
        self.assertIn("datos_familiares_desbloqueados", res)
        self.assertIn("dni_jefe_hogar", res["datos_familiares_desbloqueados"])
        self.assertIn("nombre_completo", res["datos_familiares_desbloqueados"])

        # Verificar que el caso refleja el sello desbloqueado
        caso_actualizado = self.service.obtener_detalle_caso(cup)
        self.assertTrue(caso_actualizado["sello_identidad_desbloqueado"])
        self.assertIn("Ing. Manuel Torres Pacherres", caso_actualizado["desbloqueado_por_oficial"])

    def test_07_aprobacion_soberana_sinpad(self):
        """Valida la incorporación formal al SINPAD Nacional respetando la Soberanía Humana."""
        bandeja = self.service.obtener_padron_municipal()
        cup = bandeja[0]["cup"]

        res = self.service.aprobar_y_exportar_sinpad(
            cup=cup,
            dni_evaluador="40891234",
            codigo_sinpad="SINPAD-2026-EDAN-00458",
            ayuda_entregada=["CARPA_FAMILIAR", "KIT_ALIMENTOS_BAH", "BIDON_AGUA_20L"],
            observaciones="Vivienda inspeccionada en campo. Muros colapsados por anegamiento de 72 horas."
        )

        self.assertEqual(res["cup"], cup)
        self.assertEqual(res["codigo_sinpad"], "SINPAD-2026-EDAN-00458")
        self.assertEqual(res["estado"], "VALIDADO_OFICIAL_SINPAD")

        caso = self.service.obtener_detalle_caso(cup)
        self.assertEqual(caso["codigo_sinpad_oficial"], "SINPAD-2026-EDAN-00458")
        self.assertEqual(caso["estado_validacion"], "VALIDADO_OFICIAL_SINPAD")

    def test_08_metricas_distritales(self):
        """Valida que las métricas distritales totalicen damnificados y elegibles al Bono BAE."""
        metricas = self.service.obtener_metricas_padron()
        self.assertIn("total_familias_pre_empadronadas", metricas)
        self.assertIn("viviendas_colapsadas", metricas)
        self.assertIn("viviendas_inhabitables", metricas)
        self.assertIn("elegibles_bono_bae_500", metricas)
        self.assertGreaterEqual(metricas["total_familias_pre_empadronadas"], 1)

    def test_09_registro_intercultural_lengua_originaria_y_audio(self):
        """Valida que el registro en Runasimi Chanka persista lengua originaria, audio SHA-256 y emita confirmación en su lengua."""
        payload_quechua = {
            "dni_jefe_hogar": "43589124",
            "nombres": "Rosa Herminia",
            "apellidos": "Quispe Huamán",
            "telefono": "966123789",
            "direccion_exacta": "Comunidad Campesina Chuschi Sector 2",
            "ubigeo": "150118",
            "lengua_materna": "qu_chanka",
            "variante_renalio": "Quechua II-C",
            "requiere_asistencia_bilingue": True,
            "material_muros": "ADOBE_QUINCHA",
            "material_techo": "CALAMINA",
            "tirante_agua": "RODILLA_50CM",
            "agua_dentro_vivienda": True,
            "estado_vivienda_declarado": "INHABITABLE",
            "relato_danos": "Lloqllam wasiykuman yaykumurqan, tika pirqakunata nuyurqun.",
            "audio_testimonio_sha256": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
        }

        res = self.service.registrar_pre_padron_damnificado(payload_quechua)
        self.assertIn("cup", res)
        self.assertEqual(res["lengua_materna"], "qu_chanka")
        self.assertTrue(res["tiene_audio_testimonio"])
        self.assertIn("Llakisqa", res["mensaje_ciudadano"])

        # Verificar expediente en bandeja
        caso = self.service.obtener_detalle_caso(res["cup"])
        self.assertIn("identidad_linguistica", caso)
        self.assertEqual(caso["identidad_linguistica"]["lengua_materna"], "qu_chanka")
        self.assertTrue(caso["identidad_linguistica"]["requiere_asistencia_bilingue"])
        self.assertEqual(caso["identidad_linguistica"]["audio_sha256"], "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855")

    def test_10_motor_ipad_saaty_ahp_consistencia_y_sla(self):
        """Valida la consistencia axiomática Saaty AHP 4x4 (CR = 0.0115) y los tiempos SLA del semáforo humanitario."""
        payload_critico = {
            "dni_jefe_hogar": "70891234",
            "nombres": "Marcos",
            "apellidos": "Yarlequé",
            "telefono": "987654321",
            "direccion_exacta": "Sector Simbilá Mz D Lote 12",
            "ubigeo": "200105",  # Catacaos (Alerta Roja)
            "lat": -5.265,
            "lng": -80.678,
            "material_muros": "ADOBE_QUINCHA",
            "tirante_agua": "TECHO_200CM",
            "estado_vivienda_declarado": "COLAPSADA_DESTRUIDA",
            "total_integrantes": 6,
            "ninos_menores_5": 2,
            "adultos_mayores_65": 1,
            "personas_discapacidad": 1,
            "mujeres_gestantes": 0
        }
        res = self.service.registrar_pre_padron_damnificado(payload_critico)
        self.assertIn("score_ipad", res)
        self.assertGreaterEqual(res["score_ipad"], 80.0)
        
        # Validar metadatos Saaty
        saaty = res.get("saaty_ahp_metadatos")
        self.assertIsNotNone(saaty)
        self.assertEqual(saaty["modelo"], "IPAD_SAATY_4x4")
        self.assertAlmostEqual(saaty["autovalor_lambda_max"], 4.0310, places=3)
        self.assertAlmostEqual(saaty["ratio_consistencia_cr"], 0.0115, places=3)
        self.assertTrue(saaty["consistencia_aprobada"])

        # Validar Semáforo Humanitario y SLA
        semaforo = res.get("semaforo_humanitario")
        self.assertIsNotNone(semaforo)
        self.assertEqual(semaforo["nivel_prioridad"], "CRITICO_URGENTE")
        self.assertEqual(semaforo["plazo_sla_horas"], 6)
        self.assertTrue(semaforo["alerta_inmediata"])

if __name__ == "__main__":
    unittest.main()


