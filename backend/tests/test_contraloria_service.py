"""
Pruebas Unitarias para el Servicio de Control Concurrente CGR (Fase 3)
AMARU-CLIMATE - Lab4
"""

import unittest
import sys
from pathlib import Path

backend_dir = Path(__file__).resolve().parent.parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from services.contraloria_audit_service import contraloria_service

class TestContraloriaService(unittest.TestCase):
    def setUp(self):
        self.service = contraloria_service

    def test_auditoria_preventiva_padron_correcto(self):
        ficha_mock = {
            "ubigeo": "140304",
            "distrito": "Íllimo",
            "formulario_2a_familias": [
                {
                    "dni_titular": "42891054",
                    "condicion_vivienda": "INHABITABLE"
                },
                {
                    "dni_titular": "02874198",
                    "condicion_vivienda": "DESTRUIDA"
                }
            ],
            "formulario_2b_medios_vida": {
                "hectareas_cultivo_perdidas": 15.0,
                "ganado_muerto_o_afectado": 10
            }
        }
        res = self.service.auditar_consistencia_algoritmica(ficha_mock)
        self.assertEqual(res["estado_evaluacion"], "CONFORME_PARA_VISTO_BUENO")
        self.assertEqual(res["familias_elegibles_bono_bae"], 2)
        self.assertTrue(res["seguro_agricola_sac_activable"])

    def test_auditoria_detecta_dnis_duplicados_o_invalidos(self):
        ficha_invalida = {
            "ubigeo": "140304",
            "distrito": "Íllimo",
            "formulario_2a_familias": [
                {
                    "dni_titular": "123", # DNI corto inválido
                    "condicion_vivienda": "AFECTADA"
                },
                {
                    "dni_titular": "42891054",
                    "condicion_vivienda": "AFECTADA"
                },
                {
                    "dni_titular": "42891054", # DNI duplicado
                    "condicion_vivienda": "AFECTADA"
                }
            ],
            "formulario_2b_medios_vida": {}
        }
        res = self.service.auditar_consistencia_algoritmica(ficha_invalida)
        self.assertLess(res["puntaje_consistencia_pct"], 75)
        codigos = [a["codigo"] for a in res["alertas_detectadas"]]
        self.assertIn("CGR-ALERTA-DNI-SINTAXIS", codigos)
        self.assertIn("CGR-ALERTA-DNI-DUPLICADO", codigos)
        self.assertIn("CGR-ALERTA-BAE-CERO-CALIFICADOS", codigos)

    def test_emision_visto_bueno_concurrente_blindaje(self):
        ficha_mock = {
            "edan_id": "EDAN-20260923-140304-9999",
            "ubigeo": "140304",
            "distrito": "Íllimo",
            "alcalde": "ALCALDE TEST",
            "formulario_2a_familias": [
                {"dni_titular": "42891054", "condicion_vivienda": "INHABITABLE"}
            ],
            "formulario_2b_medios_vida": {"hectareas_cultivo_perdidas": 10.0}
        }
        reg = self.service.registrar_inyeccion_edan(ficha_mock)
        self.assertIsNotNone(reg)

        # Emitir visto bueno concurrente
        vb = self.service.emitir_visto_bueno_concurrente(
            edan_id=ficha_mock["edan_id"],
            auditor_cgr="Auditor CGR Especialista Juan Pérez",
            observaciones_adicionales="Validado con cruce RENIEC y satelital."
        )
        self.assertTrue(vb["exito"])
        self.assertIn("constancia_cgr", vb)
        self.assertTrue(vb["constancia_cgr"]["constancia_codigo"].startswith("CGR-CNC-2026-"))
        self.assertTrue(vb["constancia_cgr"]["tramite_subsidio_bae_autorizado"])

if __name__ == "__main__":
    unittest.main()
