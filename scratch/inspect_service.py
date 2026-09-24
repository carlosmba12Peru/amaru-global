import urllib.request
import re
import os

url = "https://observatorio.senamhi.gob.pe/chunk-QC5B7ZVW.js"
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
with urllib.request.urlopen(req) as resp:
    js = resp.read().decode('utf-8')

# Search for any string literal with / or api or station
strings = re.findall(r'"([^"\\]*)"|\'([^\'\\]*)\'', js)
found = set()
for group in strings:
    for s in group:
        if s and any(k in s.lower() for k in ['http', 'api', 'estacion', 'station', 'observatorio', 'sensor', 'estado', 'red']):
            found.add(s)

print("Found literals in StationNetwork:")
for s in sorted(found):
    print(" -", s)

# Search for class definition
classes = re.findall(r'class ([a-zA-Z0-9_]+)', js)
print("\nClasses:", classes)

# Find constructor or imports in this chunk
imports = re.findall(r'from\s*["\']([^"\']+)["\']|import\(["\']([^"\']+)["\']\)', js)
print("\nImports:", imports)
