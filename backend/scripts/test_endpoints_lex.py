import sys
import os

sys.stdout.reconfigure(encoding='utf-8')
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)

print("=" * 70)
print("TESTING FASTAPI ENDPOINTS FOR AMARU-LEX SEMANTIC RAG & VECTOR STATUS")
print("=" * 70)

# 1. Test status
r1 = client.get("/api/v1/lex/estado-vectores")
print(f"Status Code /api/v1/lex/estado-vectores: {r1.status_code}")
data1 = r1.json()
print(f" -> Activo: {data1.get('activo')}")
print(f" -> Modelo: {data1.get('modelo')}")
print(f" -> Dimension: {data1.get('dimension')}")
print(f" -> Total Chunks: {data1.get('total_chunks_vectorizados')}")
print(f" -> Persistencia: {data1.get('persistencia')}")
assert r1.status_code == 200
assert data1.get("activo") is True
assert data1.get("total_chunks_vectorizados") == 105

# 2. Test semantic search
payload = {
    "consulta": "alquiler urgente de excavadoras y motobombas para inundaciones",
    "top_k": 3,
    "umbral_minimo": 0.45
}
r2 = client.post("/api/v1/lex/buscar-semantica", json=payload)
print(f"\nStatus Code /api/v1/lex/buscar-semantica: {r2.status_code}")
data2 = r2.json()
print(f" -> Total Coincidencias: {data2.get('total_coincidencias')}")
print(f" -> Motor: {data2.get('motor')}")
print(f" -> Dictamen: {data2.get('dictamen_amparo_inmediato')[:120]}...")

for i, m in enumerate(data2.get("coincidencias", []), 1):
    print(f"    [{i}] ({m['similitud_porcentaje']}%) {m['norma_nombre']} | {m['tipo_fragmento']}")
    print(f"        {m['contenido_texto'][:110]}...")

assert r2.status_code == 200
assert data2.get("total_coincidencias") > 0

print("\nALL FASTAPI AMARU-LEX ENDPOINTS VERIFIED SUCCESSFULLY!")
