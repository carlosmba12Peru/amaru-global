import urllib.request
import json

base_url = 'http://127.0.0.1:8000'

try:
    # 1. Probar analog-match para Íllimo (140304 - Cuenca La Leche)
    print("=== TEST 1: ANALOG MATCH ÍLLIMO (140304 - RÍO LA LECHE) ===")
    with urllib.request.urlopen(f'{base_url}/api/historico/analog-match/140304') as resp:
        illimo_match = json.loads(resp.read())
        print("Distrito:", illimo_match.get("distrito"), "-", illimo_match.get("cuenca_nombre"))
        print("Región macro:", illimo_match.get("region_macro"))
        
        dia_crit = illimo_match.get("dia_maximo_riesgo", {})
        print("Día máximo riesgo:", f"Día +{dia_crit.get('dia_numero')}", f"({dia_crit.get('horas_anticipacion')}h margen)")
        print("  - Similitud análoga:", f"{dia_crit.get('similitud_analoga_pct')}%")
        print("  - Evento análogo:", dia_crit.get("evento_analogo_referencia"))
        print("  - Nivel de alerta:", dia_crit.get("nivel_alerta_anticipada"))
        print("  - Lluvia Open-Meteo:", f"{dia_crit.get('lluvia_proyectada_openmeteo_mm')} mm")
        print("  - Factor amplificador FEN:", f"{dia_crit.get('factor_amplificacion_fen')}x")
        print("  - Lluvia extrema proyectada:", f"{dia_crit.get('lluvia_extrema_estimada_mm')} mm")
        
        print("Infraestructura CAF amenazada:")
        for inf in illimo_match.get("infraestructura_amenazada_caf", [])[:4]:
            print(f"  * [{inf.get('tipo')}] {inf.get('nombre')}: {inf.get('riesgo_historico') or inf.get('impacto')}")
            
        bipolar = illimo_match.get("acoplamiento_bipolar", {})
        print("Acoplamiento Bipolar Territorial:", bipolar.get("regla_activa"))
        print("  * Zonas inversa:", bipolar.get("zonas_alerta_inversa"))

    # 2. Probar analog-match para Ilave (210501 - Altiplano / Sierra Sur)
    print("\n=== TEST 2: ANALOG MATCH ILAVE (210501 - ALTIPLANO / TITICACA) ===")
    with urllib.request.urlopen(f'{base_url}/api/historico/analog-match/210501') as resp:
        ilave_match = json.loads(resp.read())
        print("Distrito:", ilave_match.get("distrito"), "-", ilave_match.get("cuenca_nombre"))
        dia_crit_sur = ilave_match.get("dia_maximo_riesgo", {})
        print("Día de mayor vigilancia:", f"Día +{dia_crit_sur.get('dia_numero')}")
        print("  - Similitud análoga:", f"{dia_crit_sur.get('similitud_analoga_pct')}%")
        print("  - Evento análogo:", dia_crit_sur.get("evento_analogo_referencia"))
        print("  - Temperatura mínima:", f"{dia_crit_sur.get('temperatura_min')} °C")
        print("  - Nivel de alerta:", dia_crit_sur.get("nivel_alerta_anticipada"))

    # 3. Probar Radar Nacional de Coincidencias Análogas
    print("\n=== TEST 3: RADAR NACIONAL DE COINCIDENCIAS ANÁLOGAS ===")
    with urllib.request.urlopen(f'{base_url}/api/historico/radar-nacional-analogos') as resp:
        radar = json.loads(resp.read())
        print("Total cuencas vigiladas:", radar.get("total_cuencas_vigiladas"))
        print("Semáforo nacional:", radar.get("resumen_semaforo"))
        print("Top 5 Cuencas con mayor coincidencia análoga:")
        for c in radar.get("cuencas", [])[:5]:
            print(f"  * {c.get('cuenca_nombre')} (Día +{c.get('dia_critico_numero')} - {c.get('horas_anticipacion')}h): {c.get('similitud_analoga_pct')}% {c.get('nivel_alerta')} | Análogo: {c.get('evento_referencia')}")

    print("\nTODAS LAS PRUEBAS DEL MOTOR ANÁLOGO (FASE 2) PASARON EXITOSAMENTE.")

except Exception as e:
    print("Error en prueba:", e)
