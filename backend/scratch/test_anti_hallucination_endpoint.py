import urllib.request
import json

def test_api():
    url = "http://localhost:8000/api/audit/anti-hallucination-benchmark"
    req = urllib.request.urlopen(url)
    data = json.loads(req.read().decode('utf-8'))
    
    print("=== RESPUESTA DEL ENDPOINT /api/audit/anti-hallucination-benchmark ===")
    print("STATUS:", data.get("status"))
    print(f"SCORE FIABILIDAD FACTUAL: {data.get('puntuacion_fiabilidad_factual_pct')}%")
    print("DICTAMEN:", data.get("dictamen"))
    print("\nDETALLE DE PRUEBAS EJECUTADAS EN VIVO:")
    for p in data.get("pruebas_ejecutadas", []):
        mark = "[PASO]" if p.get("passed") else "[FALLO]"
        print(f"  * {p.get('id')}: {mark} {p.get('name')}")
        print(f"    - Diagnóstico: {p.get('details')}")

if __name__ == "__main__":
    test_api()
