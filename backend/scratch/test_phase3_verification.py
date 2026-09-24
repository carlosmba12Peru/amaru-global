import urllib.request
import json

def test_phase3():
    print("=== VERIFICACIÓN INTEGRAL DE FASE 3 ===")
    
    # 1. Catacaos (Costa Norte)
    r1 = json.loads(urllib.request.urlopen('http://localhost:8000/api/historico/analog-match/200105').read())
    print("[1] Catacaos (200105):")
    print(f"    - Cuenca: {r1['cuenca_nombre']}")
    print(f"    - Alerta Proyectada: {r1['dia_maximo_riesgo']['nivel_alerta_anticipada']}")
    print(f"    - Lead Time: {r1['dia_maximo_riesgo']['horas_anticipacion']}h (Día +{r1['dia_maximo_riesgo']['dia_numero']})")
    print(f"    - Análogo: {r1['dia_maximo_riesgo']['evento_analogo_referencia']} ({r1['dia_maximo_riesgo']['similitud_analoga_pct']}%)")
    print(f"    - Factor Amplificador: {r1['dia_maximo_riesgo']['factor_amplificacion_fen']}x")
    print(f"    - Precipitación Proyectada FEN: {r1['dia_maximo_riesgo']['lluvia_extrema_estimada_mm']} mm")
    print(f"    - Obras CAF en Riesgo: {len(r1['infraestructura_amenazada_caf'])} infraestructuras")
    
    # 2. Ilave (Altiplano / Sierra Sur)
    r2 = json.loads(urllib.request.urlopen('http://localhost:8000/api/historico/analog-match/210501').read())
    print("\n[2] Ilave (210501 - Puno):")
    print(f"    - Cuenca: {r2['cuenca_nombre']}")
    print(f"    - Bipolaridad Activa: {r2['acoplamiento_bipolar']['regla_activa']}")
    print(f"    - Diagnóstico: {r2['acoplamiento_bipolar']['descripcion'][:80]}...")
    
    # 3. Radar Nacional 17 Cuencas
    r3 = json.loads(urllib.request.urlopen('http://localhost:8000/api/historico/radar-nacional-analogos').read())
    print("\n[3] Radar Nacional de 17 Cuencas:")
    print(f"    - Total Cuencas: {r3['total_cuencas_vigiladas']}")
    total_alerta = (r3['resumen_semaforo']['cuencas_alerta_roja'] + 
                    r3['resumen_semaforo']['cuencas_alerta_naranja'] + 
                    r3['resumen_semaforo']['cuencas_alerta_amarilla'])
    print(f"    - Cuencas en Alerta (Roja/Naranja/Amarilla): {total_alerta}")
    for c in r3['cuencas'][:4]:
        print(f"      * {c['cuenca_nombre']}: {c['nivel_alerta']} (+{c['horas_anticipacion']}h, FEN: {c['factor_amplificacion']}x, Similitud: {c['similitud_analoga_pct']}%)")
        
    # 4. Catálogo Maestro y Matriz Bivalente
    r4 = json.loads(urllib.request.urlopen('http://localhost:8000/api/historico/catalogo-maestro').read())
    print("\n[4] Catálogo Maestro FEN:")
    print(f"    - Cuencas Estratégicas: {len(r4['cuencas_estrategicas'])}")
    print(f"    - Amenazas Mapeadas (CAF/SENAMHI): {len(r4['matriz_bivalente_fen']['impactos_negativos_amenazas'])}")
    print(f"    - Oportunidades Territoriales: {len(r4['matriz_bivalente_fen']['impactos_positivos_oportunidades'])}")
    
    # 5. Frontend Next.js
    rf = urllib.request.urlopen('http://localhost:3000/historico')
    print(f"\n[5] Frontend Next.js /historico: HTTP {rf.status} OK (Tamaño: {len(rf.read())} bytes)")

if __name__ == "__main__":
    test_phase3()
