import urllib.request
import re

headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}

# Inspect chunk-HLI7AOYG.js
req = urllib.request.Request("https://observatorio.senamhi.gob.pe/chunk-HLI7AOYG.js", headers=headers)
with urllib.request.urlopen(req, timeout=10) as resp:
    js = resp.read().decode('utf-8', errors='ignore')

# Print snippets around servicios.senamhi.gob.pe
for idx in [m.start() for m in re.finditer(r'servicios\.senamhi\.gob\.pe', js)]:
    print("SNIPPET:")
    print(js[max(0, idx-200):min(len(js), idx+300)])
    print("-" * 50)

# Also check main for route definitions
req_main = urllib.request.Request("https://observatorio.senamhi.gob.pe/main-OGM63ETO.js", headers=headers)
with urllib.request.urlopen(req_main, timeout=10) as resp:
    js_main = resp.read().decode('utf-8', errors='ignore')

# Look for red-estaciones route or lazy loaded chunks
matches = re.finditer(r'red-estaciones', js_main)
for m in matches:
    idx = m.start()
    print("ROUTE SNIPPET:")
    print(js_main[max(0, idx-200):min(len(js_main), idx+400)])
    print("=" * 50)
