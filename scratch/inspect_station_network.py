import urllib.request
import re

headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}

url = "https://observatorio.senamhi.gob.pe/chunk-QC5B7ZVW.js"
req = urllib.request.Request(url, headers=headers)
with urllib.request.urlopen(req, timeout=10) as resp:
    js = resp.read().decode('utf-8', errors='ignore')

print("Length of StationNetwork chunk:", len(js))

# Look for imports, http calls, endpoints
endpoints = re.findall(r'(\/[a-zA-Z0-9_\-\.\?=\&]+)', js)
print("Potential endpoints / strings in StationNetwork:")
for ep in set(endpoints):
    if any(k in ep for k in ['estacion', 'api', 'red', 'tipo', 'dep', 'prov', 'dist', 'estado', 'sensor', 'data', 'csv', 'json', 'descarga', 'download']):
        print(" -", ep)

# Search for HttpClient / fetch / service calls
for m in re.finditer(r'(http|\.get\(|\.post\(|\/api\/)', js):
    idx = m.start()
    print("API CALL CONTEXT:")
    print(js[max(0, idx-100):min(len(js), idx+200)])
    print("-" * 40)
