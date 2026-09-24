import urllib.request
import re
import json

url = "https://grd.igp.gob.pe/lahares-huaicos/assets/index-UhkG1XQI.js"
req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})

try:
    with urllib.request.urlopen(req) as resp:
        content = resp.read().decode("utf-8", errors="ignore")
        print(f"JS Length: {len(content)}")
        
        # Look for API endpoints or paths
        urls = re.findall(r"https?://[a-zA-Z0-9_\-\./:]+", content)
        print("\n--- URLs Encontradas ---")
        for u in set(urls):
            if "igp" in u or "api" in u:
                print(u)
                
        # Look for station names, sensor types, or JSON structures
        matches = re.findall(r'(?:arequipa|lima|piura|chosica|huaycoloro|canchaque|misti|geofono|infrasonido|camara|pluviometro)', content, re.IGNORECASE)
        print("\n--- Palabras Clave Mencionadas ---")
        counts = {}
        for m in matches:
            counts[m.lower()] = counts.get(m.lower(), 0) + 1
        print(counts)
        
        # Look for api routes like /api or api/
        routes = re.findall(r'["\'](/api/[^"\']+|https?://[^"\']+)["\']', content)
        print("\n--- Rutas API ---")
        for r in set(routes):
            print(r)

except Exception as e:
    print("Error:", e)
