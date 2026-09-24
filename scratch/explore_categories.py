import urllib.request
import json
from collections import Counter

headers = {'User-Agent': 'Mozilla/5.0'}
req = urllib.request.Request("https://servicios.senamhi.gob.pe/api/researchers/stations", headers=headers)
with urllib.request.urlopen(req) as resp:
    stations = json.loads(resp.read().decode('utf-8'))['data']

print("Total stations:", len(stations))
types = Counter((s.get('typeDescription'), s.get('subTypeDescription')) for s in stations)
for t, c in types.most_common():
    print(f" - {t}: {c}")

# Find an automatic meteorological station
auto_met = [s for s in stations if 'METEOROLOGICA' in str(s.get('typeDescription'))]
print(f"\nMeteorological stations found: {len(auto_met)}")
if auto_met:
    print("Sample Met Station:", auto_met[0])
    st_id = auto_met[0]['id']
    req_data = urllib.request.Request(f"https://servicios.senamhi.gob.pe/api/researchers/stations/{st_id}/data?yearMonth=202608", headers=headers)
    try:
        with urllib.request.urlopen(req_data) as resp:
            data = json.loads(resp.read().decode('utf-8'))['data']
            print(f"\nReadings count for {auto_met[0]['name']}: {len(data)}")
            if data:
                print("Columns captured:", [c['columnName'] for c in data[0]['columns']])
                print("Sample reading values:", json.dumps(data[0], indent=2, ensure_ascii=False))
    except Exception as e:
        print("Data error:", e)
