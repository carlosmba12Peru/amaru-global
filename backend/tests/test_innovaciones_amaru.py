"""
Prueba de Integración: test_innovaciones_amaru.py
Valida la operatividad técnica completa de las innovaciones del Modelo MHEWS-AMARU:
  1. Red de Voluntarios Especializados (GRD, OCSE, ACS MINSA).
  2. Motor de Expedientes D8 de Contratación Directa (Art. 27 Ley 30225).
  3. Triaje NTS-105 MINSA y Vigilancia Epidemiológica ACS.
  4. Asset Spacial GeoJSON de Polígonos de Quebradas Críticas.
"""

import os
import sys
import json
import pytest

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

from services.voluntariado_especializado_service import VoluntariadoEspecializadoService
from services.expediente_contratacion_d8_service import ExpedienteContratacionD8Service
from services.salud_comunitaria_triaje_service import SaludComunitariaTriajeService

def test_voluntariado_especializado_service():
    """Valida el registro, generación Zero-PII y despacho telemétrico de voluntarios."""
    resumen_inicial = VoluntariadoEspecializadoService.obtener_resumen_red_voluntariado()
    assert resumen_inicial["total_voluntarios_registrados"] >= 3

    # Registro de nuevo voluntario OCSE
    nuevo = VoluntariadoEspecializadoService.registrar_voluntario(
        nombre_completo="Dr. Pedro Alva",
        dni="10458923",
        especialidad="VOLUNTARIO_OCSE",
        departamento="LAMBAYEQUE",
        provincia="CHICLAYO",
        distrito="ILLIMO",
        codigo_certificacion="OCSE-CERT-2026-9901",
        telefono_contacto="+51988776655"
    )
    assert nuevo["codigo_zero_pii"].startswith("VOL-OCSE-")
    assert nuevo["estado"] == "ACTIVO_DISPONIBLE"

    # Despacho telemétrico a Ubigeo 200101 (Piura)
    despacho = VoluntariadoEspecializadoService.despachar_voluntarios_ds124(ubigeo_target="200101")
    assert despacho["ubigeo_destino"] == "200101"
    assert despacho["total_voluntarios_asignados"] > 0
    print("✅ Test Voluntariado Especializado: PASADO")


def test_expediente_contratacion_d8_service():
    """Valida la generación del expediente D8 de contratación directa (Art. 27 Ley 30225)."""
    items = [
        {"tipo": "TRACTOR_ORUGA_D8", "horas": 100},
        {"tipo": "EXCAVADORA_ORUGA_330", "horas": 80}
    ]
    expediente = ExpedienteContratacionD8Service.generar_expediente_d8(
        ubigeo="200114",
        distrito="TAMBOGRANDE",
        provincia="PIURA",
        departamento="PIURA",
        nombre_alcalde="Segundo Meléndez",
        secretario_tecnico="Ing. Juan Valdivia",
        items_requeridos=items
    )
    
    assert expediente["expediente_id"].startswith("EXP-D8-200114-")
    assert expediente["monto_total_requerido_pen"] == (480.0 * 100) + (420.0 * 80)
    assert "PROYECTO DE RESOLUCIÓN DE ALCALDÍA" in expediente["resolucion_alcaldia_borrador"]
    assert "hash_trazabilidad_worm" in expediente
    print("✅ Test Expedientes D8 Contratación Directa: PASADO")


def test_salud_comunitaria_triaje_service():
    """Valida el triaje NTS-105 MINSA y el cálculo del Índice de Riesgo Epidemiológico."""
    # Triaje Emergencia
    triaje = SaludComunitariaTriajeService.procesar_triaje_nts105(
        cup_code="CUP-MINSA-99012",
        ubigeo="200114",
        sintomas=["DIFICULTAD_RESPIRATORIA", "FIEBRE_ALTA_PERSISTENTE"],
        es_vulnerable=True
    )
    assert triaje["evaluacion_nts105"]["prioridad"] == "PRIORIDAD_I_EMERGENCIA_VITAL"
    assert triaje["evaluacion_nts105"]["color_semaforo"] == "RED"

    # Riesgo Epidemiológico Dengue / Leptospirosis
    ire = SaludComunitariaTriajeService.calcular_indice_riesgo_epidemiologico(
        ubigeo="200114",
        temperatura_c=30.0,
        dias_agua_estancada=7
    )
    assert ire["indice_riesgo_epidemiologico_ire"] >= 0.75
    assert ire["nivel_alerta"] == "ALERTA_BROTE_ALTO_DENGUE_LEPTOSPIROSIS"
    print("✅ Test Triaje NTS-105 & Vigilancia Epidemiológica ACS MINSA: PASADO")


def test_geojson_quebradas_asset():
    """Valida la integridad del archivo GeoJSON de polígonos de quebradas."""
    file_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data", "quebradas_poligonos_geojson.json")
    assert os.path.exists(file_path), "El archivo GeoJSON de quebradas no existe."
    
    with open(file_path, "r", encoding="utf-8") as f:
        geojson = json.load(f)
    
    assert geojson["type"] == "FeatureCollection"
    assert len(geojson["features"]) >= 5
    for feat in geojson["features"]:
        assert "id_quebrada" in feat["properties"]
        assert feat["geometry"]["type"] == "Polygon"
    print("✅ Test Asset Spacial GeoJSON Quebradas: PASADO")


if __name__ == "__main__":
    test_voluntariado_especializado_service()
    test_expediente_contratacion_d8_service()
    test_salud_comunitaria_triaje_service()
    test_geojson_quebradas_asset()
    print("\n🎉 ¡TODOS LOS TESTS DE LAS INNOVACIONES DE AMARU-CLIMATE PASARON AL 100%!")
