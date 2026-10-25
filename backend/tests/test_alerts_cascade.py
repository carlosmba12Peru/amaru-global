# backend/tests/test_alerts_cascade.py
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

client = TestClient(app)

def test_alerts_cascade_flow():
    # 1. COED Nacional: Consultar concentrador de alertas
    res_nat = client.get("/api/alertas/nacional/resumen")
    assert res_nat.status_code == 200
    data_nat = res_nat.json()
    assert data_nat["estadisticas"]["total_alertas_nacionales"] >= 3
    assert "Piura" in str(data_nat["alertas_activas"])

    # 2. COED Municipal: Consultar bandeja del Alcalde de Piura (200101)
    res_mun = client.get("/api/alertas/municipal/200101")
    assert res_mun.status_code == 200
    data_mun = res_mun.json()
    assert data_mun["total_alertas_bandeja"] >= 1
    assert data_mun["alertas"][0]["ubigeo_destinatario"] == "200101"

    # 3. COED Municipal: El Alcalde valida la alerta, firma EAP y emite alerta social
    payload_val = {
        "id_alerta": data_mun["alertas"][0]["id_alerta"],
        "ubigeo": "200101",
        "autoridad_solicitante": "Alcalde Provincial de Piura / Presidente GT-GRD",
        "orden_combustible_galones": 650,
        "motobombas_desplegadas": 6,
        "pacas_heno_asignadas": 0,
        "albergues_habilitados": ["Colegio San Miguel", "Polideportivo Municipal de Piura"],
        "habilitar_alerta_social": True
    }
    res_val = client.post("/api/alertas/municipal/200101/validar-detonar", json=payload_val)
    assert res_val.status_code == 200
    data_val = res_val.json()
    assert data_val["status"] == "VALIDACION_Y_DETONACION_EXITOSA"
    assert "SHA256:" in data_val["orden_despacho"]["hash_criptografico_sha256"]

    # 4. COED Social: La comunidad consulta el tablero comunitario de Piura (200101)
    res_soc = client.get("/api/alertas/social/200101")
    assert res_soc.status_code == 200
    data_soc = res_soc.json()
    assert "alerta_vigente" in data_soc
    assert "quechua" in data_soc["alerta_vigente"]["instrucciones_comunitarias"]
    assert "Colegio San Miguel" in str(data_soc["alerta_vigente"]["albergues_seguros"])

    print("TEST ALERTAS CASCADE: TODOS LOS PASOS PASARON EXITOSAMENTE (COED NACIONAL -> MUNICIPAL -> SOCIAL)")

if __name__ == "__main__":
    test_alerts_cascade_flow()
