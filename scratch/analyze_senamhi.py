import urllib.request
import re

base_url = 'https://observatorio.senamhi.gob.pe/'

scripts = [
    "main-OGM63ETO.js", "chunk-JM57BX7F.js", "chunk-XRSZBCUV.js",
    "chunk-EPCBWG43.js", "chunk-HRXSRDID.js", "chunk-HLI7AOYG.js",
    "chunk-EGHZKF2C.js", "chunk-VJ5REYSE.js", "chunk-TJKLMDZ2.js",
    "chunk-DOIMCSDA.js", "chunk-HP5NM6PI.js", "chunk-IO2VALUB.js",
    "chunk-FTH6GE63.js", "chunk-VJWUAEO5.js", "chunk-CMSZM3SJ.js",
    "chunk-R3PM2L7S.js", "chunk-AWBGURTL.js", "chunk-UK654TP6.js",
    "chunk-2CGYWJGF.js", "chunk-XM3XF4J5.js", "chunk-JHNIGUQM.js"
]

headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}

for s in scripts:
    s_url = base_url + s
    try:
        req = urllib.request.Request(s_url, headers=headers)
        with urllib.request.urlopen(req, timeout=10) as resp:
            content = resp.read().decode('utf-8', errors='ignore')
            
            # Find occurrences of servicios.senamhi.gob.pe with context
            for m in re.finditer(r'servicios\.senamhi\.gob\.pe[^"\'` \<\>\)]*', content):
                print(f"[{s}] Endpoint/Ref:", m.group(0))
                
            # Also find patterns like .get(`${...}`, .get("..."), etc.
            matches = re.findall(r'(\/[a-zA-Z0-9_\-]+(\/[a-zA-Z0-9_\-]+)+)', content)
            # Find paths mentioning estacion, red, clima, tiempo, dato
            for m, _ in matches:
                if any(k in m for k in ['estacion', 'red', 'observatorio', 'sensor', 'meteorolog', 'hidrolog']):
                    print(f"[{s}] Path:", m)
    except Exception as e:
        pass
