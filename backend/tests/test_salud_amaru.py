# backend/tests/test_salud_amaru.py
"""
Pruebas Unitarias de SALUD-AMARU:
- Desacoplamiento Criptográfico CUP y Zero-PII en la Bóveda de Identidad
- Observación Técnica Preliminar de IA bajo NTS N.° 105-MINSA
- Protocolo Break-the-Glass (Ruptura del Sello) con CMP y Auditoría WORM
- Soberanía Médica y Resolución Clínica Oficial
"""

import unittest
import os
import json
from services.salud_service import SaludAmaruService

class TestSaludAmaru(unittest.TestCase):
    def setUp(self):
        self.service = SaludAmaruService()

    def test_01_validacion_dni(self):
        """Valida que el DNI sea numérico de 8 dígitos."""
        self.assertTrue(self.service.validar_dni("45892147"))
        self.assertTrue(self.service.validar_dni("08471259"))
        self.assertFalse(self.service.validar_dni("12345"))  # Corto
        self.assertFalse(self.service.validar_dni("4589214A"))  # Letras
        self.assertFalse(self.service.validar_dni(""))  # Vacío
        self.assertFalse(self.service.validar_dni(None))  # None

    def test_02_registro_desacoplado_cup_y_boveda(self):
        """Valida que el registro separe la PII, genere un CUP y selle la identidad."""
        payload = {
            "dni": "72451098",
            "nombres": "Lucía Yolanda",
            "apellidos": "Navarro Chero",
            "telefono": "984512365",
            "contacto_auxiliar": "981245789 (Esposo)",
            "ubigeo": "200105",  # Catacaos
            "lugar_referencial": "Sector Simbilá, margen izquierda",
            "edad": 31,
            "sexo": "FEMENINO",
            "es_gestante": True,
            "semanas_gestacion": 35,
            "agua_en_vivienda": "INTERIOR_RODILLA",
            "sintomas": ["FIEBRE_ALTA", "CONTRACCIONES", "DIFICULTAD_RESPIRATORIA_SEVERA"],
            "relato": "Estoy con 35 semanas de embarazo y contracciones muy seguidas, el agua del río está en la sala y no puedo salir."
        }

        res = self.service.registrar_paciente_desacoplado(payload)
        self.assertIn("cup", res)
        self.assertTrue(res["cup"].startswith("CUP-MINSA-200105-"))
        self.assertEqual(res["prioridad_sugerida"], "PRIORIDAD_I_ROJO")
        self.assertIn("recomendaciones_primeros_auxilios", res)

        # Verificar que el caso en memoria existe pero NO tiene PII cruda
        caso = self.service.obtener_detalle_caso(res["cup"])
        self.assertIsNotNone(caso)
        self.assertNotIn("dni", caso)
        self.assertNotIn("telefono", caso)
        self.assertNotIn("nombres", caso)
        self.assertFalse(caso["sello_identidad_desbloqueado"])

    def test_03_triaje_ia_prioridad_ii_dengue_leptospira(self):
        """Valida la clasificación de IA de Prioridad II para Dengue con signos de alarma y Leptospirosis."""
        # Dengue con signos de alarma
        payload_dengue = {
            "dni": "41258963",
            "nombres": "Marcos",
            "apellidos": "Ipanaqué",
            "telefono": "965874123",
            "ubigeo": "200101",  # Piura
            "edad": 22,
            "sintomas": ["FIEBRE_ALTA", "DOLOR_ABDOMINAL", "VOMITOS_PERSISTENTES"],
            "relato": "Fiebre muy alta, dolor en la boca del estómago y vómitos que no paran."
        }
        res_d = self.service.registrar_paciente_desacoplado(payload_dengue)
        self.assertEqual(res_d["prioridad_sugerida"], "PRIORIDAD_II_AMARILLO")

        # Leptospirosis tras inmersión
        payload_lepto = {
            "dni": "09874561",
            "nombres": "Antero",
            "apellidos": "Siesquén",
            "telefono": "974125896",
            "ubigeo": "140301",  # Íllimo
            "edad": 48,
            "agua_en_vivienda": "INTERIOR_RODILLA",
            "sintomas": ["FIEBRE", "ICTERICIA"],
            "relato": "Ojos amarillos, orina oscura y dolor muscular en las piernas luego de estar en el agua sucia."
        }
        res_l = self.service.registrar_paciente_desacoplado(payload_lepto)
        self.assertEqual(res_l["prioridad_sugerida"], "PRIORIDAD_II_AMARILLO")

    def test_04_bandeja_medica_estrictamente_desacoplada(self):
        """Valida que la bandeja de entrada para médicos del MINSA NO exponga PII de ningún paciente."""
        bandeja = self.service.obtener_bandeja_medica_minsa()
        self.assertGreater(len(bandeja), 0)

        for caso in bandeja:
            self.assertIn("cup", caso)
            self.assertIn("triaje_ia", caso)
            self.assertNotIn("dni", caso)
            self.assertNotIn("telefono", caso)
            self.assertNotIn("nombres", caso)
            self.assertNotIn("nombre_completo", caso)
            # Debe contener el descargo legal obligatorio
            self.assertIn("declaracion_no_vinculante", caso["triaje_ia"])
            self.assertIn("Ley General de Salud N.° 26842", caso["triaje_ia"]["declaracion_no_vinculante"])

    def test_05_protocolo_break_the_glass_auditoria_worm(self):
        """Valida que el médico pueda romper el sello con CMP y registrar la auditoría inmutable."""
        # Tomar un caso existente
        bandeja = self.service.obtener_bandeja_medica_minsa()
        cup_target = bandeja[0]["cup"]

        # 1. Intento sin CMP debe fallar
        with self.assertRaises(ValueError):
            self.service.romper_sello_identidad_medica(cup_target, cmp_medico="", nombre_medico="Dr. Test", motivo_clinico="Urgencia médica")

        # 2. Intento con justificación insuficiente debe fallar
        with self.assertRaises(ValueError):
            self.service.romper_sello_identidad_medica(cup_target, cmp_medico="048291", nombre_medico="Dr. Test", motivo_clinico="hola")

        # 3. Ruptura de Sello válida con CMP
        res = self.service.romper_sello_identidad_medica(
            cup=cup_target,
            cmp_medico="048291",
            nombre_medico="Dr. Carlos Mendoza V.",
            motivo_clinico="Prioridad I: Sospecha de compromiso obstétrico agudo en zona aislada por inundación."
        )

        self.assertIn("datos_identidad_desbloqueados", res)
        self.assertIn("dni", res["datos_identidad_desbloqueados"])
        self.assertIn("telefono", res["datos_identidad_desbloqueados"])
        self.assertIn("auditoria_worm_hash", res)

        # Comprobar que el caso quedó marcado como desbloqueado
        caso_actualizado = self.service.obtener_detalle_caso(cup_target)
        self.assertTrue(caso_actualizado["sello_identidad_desbloqueado"])
        self.assertEqual(caso_actualizado["desbloqueado_por_cmp"], "048291")

    def test_06_soberania_medica_dictamen_oficial(self):
        """Valida que el médico colegiado emita la resolución clínica oficial soberana."""
        bandeja = self.service.obtener_bandeja_medica_minsa()
        cup_target = bandeja[0]["cup"]

        dictamen = self.service.emitir_resolucion_medica(
            cup=cup_target,
            cmp_medico="048291",
            prioridad_oficial="PRIORIDAD_I_ROJO",
            diagnostico_presuntivo="Gestante de 35 semanas con sospecha de sufrimiento fetal agudo y amenaza de parto prematuro",
            conducta_terapeutica="EVACUACION_AEROMEDICA_FAP",
            observaciones="Coordinado con el COED Nacional y base FAP Piura para helievacuación con cuna térmica."
        )

        self.assertEqual(dictamen["estado"], "EVALUADO_POR_MEDICO")
        self.assertEqual(dictamen["conducta_terapeutica"], "EVACUACION_AEROMEDICA_FAP")

    def test_07_metricas_c2_salud(self):
        """Valida las métricas del C2 Salud para el tablero de mando."""
        metricas = self.service.obtener_metricas_salud()
        self.assertIn("total_casos_registrados", metricas)
        self.assertIn("prioridad_I_rojo", metricas)
        self.assertIn("tasa_privacidad_preservada", metricas)
        self.assertGreater(metricas["total_casos_registrados"], 0)

if __name__ == "__main__":
    unittest.main()
