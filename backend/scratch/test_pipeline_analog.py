import urllib.request
import json
import time

base_url = 'http://127.0.0.1:8000'

try:
    print("=== DISPARANDO PIPELINE AGENTE CENTINELA EN ÍLLIMO (140304) ===")
    req = urllib.request.Request(f'{base_url}/api/distrito/140304/alerta', method='POST', data=b"{}")
    with urllib.request.urlopen(req) as resp:
        res = json.loads(resp.read())
        print("Respuesta disparo:", res)

    # Esperar 3 segundos para que los agentes procesen en background
    time.sleep(3)

    # Consultar eventos de auditoría
    with urllib.request.urlopen(f'{base_url}/api/agents/audit-log') as resp:
        logs = json.loads(resp.read())
        eventos = logs.get("eventos", [])
        print(f"Total eventos de auditoría: {len(eventos)}")
        if eventos:
            ultimo = eventos[-1]
            print("Último despacho de agentes:")
            print("  - Incidente ID:", ultimo.get("incidente_id"))
            print("  - Nivel:", ultimo.get("nivel"))
            print("  - Veredicto táctico:", ultimo.get("veredicto_tactico")[:180] if ultimo.get("veredicto_tactico") else "N/A")
            print("  - Resumen despachador:", ultimo.get("resumen_despachador")[:200] if ultimo.get("resumen_despachador") else "N/A")

except Exception as e:
    print("Error:", e)
