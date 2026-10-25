"""
Test Suite Pericial: Servicio Crioclima y Protocolos EAP La Niña 2026 (AMARU-CHIRI)
==================================================================================
Valida:
1. Carga íntegra de los 106 distritos de Puno y Catálogo Maestro.
2. Filtros de búsqueda (provincia, prioridad PMHF, texto libre).
3. Cruce meteorológico y cálculo de impacto en masa alpaquera e infantil.
4. Detonación de orden de despacho EAP con hash criptográfico SHA-256 (Doctrina Zero-PII).
5. Endpoints HTTP de FastAPI.
"""

import os
import sys

if sys.stdout.encoding.lower() != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

from fastapi.testclient import TestClient

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from main import app
from services.crioclima_service import crioclima_service, CrioclimaEAPDetonacionRequest

client = TestClient(app)


def test_crioclima_service_datasets_loaded():
    """Verifica que se hayan cargado los 106 distritos de Puno y el Catálogo Maestro."""
    assert len(crioclima_service.distritos_puno) == 106
    assert len(crioclima_service.catalogo_heladas) >= 106
    
    resumen = crioclima_service.get_resumen_puno()
    assert resumen["region"] == "PUNO"
    assert resumen["total_distritos"] == 106
    assert resumen["estadisticas_cenepred"]["total_alpacas_censadas"] > 1_400_000
    assert resumen["estadisticas_cenepred"]["ninos_menores_5_anos"] > 80_000


def test_listar_distritos_filtros():
    """Valida los filtros por provincia, prioridad y búsqueda textual."""
    # Filtro provincia Carabaya
    carabaya = crioclima_service.listar_distritos_puno(provincia="CARABAYA")
    assert len(carabaya) == 10
    assert all(d["provincia"] == "CARABAYA" for d in carabaya)

    # Filtro provincia El Collao
    collao = crioclima_service.listar_distritos_puno(provincia="EL COLLAO")
    assert len(collao) == 5
    assert any(d["ubigeo"] == "210504" for d in collao) # Mazocruz

    # Búsqueda por nombre común o distrito
    mazo = crioclima_service.listar_distritos_puno(buscar="Mazocruz")
    assert len(mazo) >= 1
    assert mazo[0]["ubigeo"] == "210504"


async def test_evaluar_impacto_distrito_mazocruz():
    """Valida el cálculo de impacto de helada extrema en Mazocruz (El Collao)."""
    evaluacion = await crioclima_service.evaluar_impacto_distrito("210504")
    assert evaluacion["ubigeo"] == "210504"
    assert evaluacion["distrito"] == "SANTA ROSA"
    assert evaluacion["departamento"] == "PUNO"
    assert evaluacion["semaforo_c2"] in ["ROJO", "NARANJA", "AMARILLO", "VERDE"]
    assert "pronostico_7_dias" in evaluacion
    assert "censo_territorial_cenepred" in evaluacion
    assert evaluacion["censo_territorial_cenepred"]["total_alpacas"] > 50_000
    assert "requerimientos_logistica_eap" in evaluacion
    assert evaluacion["requerimientos_logistica_eap"]["pacas_heno_avena_forrajera"] > 0
    assert evaluacion["requerimientos_logistica_eap"]["kits_veterinarios_antibioticos"] > 0


def test_detonar_eap_crioclima():
    """Valida la generación de un acta criptográfica de acción temprana EAP."""
    req = CrioclimaEAPDetonacionRequest(
        ubigeo="210301", # Macusani
        ventana_lead_time="T-72h",
        autoridad_solicitante="Alcalde Provincial de Carabaya",
        observaciones="Nevadas severas de 12 cm pronosticadas en cabecera de cuenca"
    )
    res = crioclima_service.detonar_eap_crioclima(req)
    assert res["id_detonacion"].startswith("EAP-CHIRI-210301")
    assert res["hash_criptografico_sha256"].startswith("SHA256:")
    assert len(res["hash_criptografico_sha256"]) == 71 # "SHA256:" (7) + 64 hex
    assert res["orden_despacho_inmediato"]["pacas_heno_asignadas"] > 0
    assert res["orden_despacho_inmediato"]["kits_veterinarios_asignados"] > 0
    assert res["estado"] == "DETONADO_EN_EJECUCION"


def test_api_endpoints_fastapi():
    """Valida las respuestas HTTP de los nuevos endpoints crioclimáticos."""
    # 1. Resumen Puno
    r1 = client.get("/api/crioclima/puno/resumen")
    assert r1.status_code == 200
    assert r1.json()["total_distritos"] == 106

    # 2. Listado distritos Puno con filtro
    r2 = client.get("/api/crioclima/puno/distritos?provincia=MELGAR")
    assert r2.status_code == 200
    assert len(r2.json()) == 9

    # 3. Evaluación de impacto en vivo Macusani
    r3 = client.get("/api/crioclima/distrito/210301/evaluacion-impacto")
    assert r3.status_code == 200
    data3 = r3.json()
    assert data3["distrito"] == "MACUSANI"
    assert "semaforo_c2" in data3

    # 4. Detonar EAP
    payload = {
        "ubigeo": "210504",
        "ventana_lead_time": "T-144h",
        "autoridad_solicitante": "COED Regional Puno / INDECI",
        "observaciones": "Prueba de homologación C2 Altiplano"
    }
    r4 = client.post("/api/crioclima/distrito/210504/detonar-eap", json=payload)
    assert r4.status_code == 200
    assert r4.json()["ubigeo"] == "210504"
    assert "SHA256:" in r4.json()["hash_criptografico_sha256"]

    # 5. Historial EAP
    r5 = client.get("/api/crioclima/eap/historial")
    assert r5.status_code == 200
    assert len(r5.json()) >= 1


if __name__ == "__main__":
    import asyncio
    print("==================================================")
    print("EJECUTANDO TEST SUITE CRIOCLIMA & EAP LA NINA 2026")
    print("==================================================")
    
    print("[1/5] Probando datasets cargados...")
    test_crioclima_service_datasets_loaded()
    print("  -> PASO OK")
    
    print("[2/5] Probando filtros distritales de Puno...")
    test_listar_distritos_filtros()
    print("  -> PASO OK")
    
    print("[3/5] Probando evaluacion de impacto (Mazocruz)...")
    asyncio.run(test_evaluar_impacto_distrito_mazocruz())
    print("  -> PASO OK")
    
    print("[4/5] Probando detonacion EAP crioclima...")
    test_detonar_eap_crioclima()
    print("  -> PASO OK")
    
    print("[5/5] Probando endpoints FastAPI...")
    test_api_endpoints_fastapi()
    print("  -> PASO OK")
    
    print("==================================================")
    print("TODOS LOS TESTS DE CRIOCLIMA PASARON EXITOSAMENTE")
    print("==================================================")
