import json
import urllib.request

payload = json.dumps({"pregunta": "¿Qué formatos oficiales dispongo para mi distrito ante el FEN?"}).encode("utf-8")
req = urllib.request.Request("http://127.0.0.1:8000/api/marco-legal/chat", data=payload, headers={"Content-Type": "application/json"})
try:
    with urllib.request.urlopen(req) as resp:
        data = json.loads(resp.read().decode("utf-8"))
        print("STATUS: SUCCESS")
        print("RESPUESTA:\n", data["respuesta"])
except Exception as e:
    print("ERROR:", e)
