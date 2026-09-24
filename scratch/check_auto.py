import urllib.request
import json

headers = {'User-Agent': 'Mozilla/5.0'}
req = urllib.request.Request("https://servicios.senamhi.gob.pe/api/researchers/stations", headers=headers)
with urllib.request.urlopen(req) as resp:
    stations = json.loads(resp.read().decode('utf-8'))['data']

auto = [s for s in stations if 'AUTOM' in s.get('subTypeDescription', '') and 'METEOROLOGICA' in s.get('typeDescription', '')]
if auto:
    sample = auto[0]
    print("Auto station:", sample['name'], sample['id'], sample['departmentName'])
    req_periods = urllib.request.Request(f"https://servicios.senamhi.gob.pe/api/researchers/stations/{sample['id']}/periods", headers=headers)
    with urllib.request.urlopen(req_periods) as r:
        pers = json.loads(r.read().decode('utf-8'))['data']
        print("Periods count:", len(pers), "Latest:", pers[0] if pers else None)
        
    req_data = urllib.request.Request(f"https://servicios.senamhi.gob.pe/api/researchers/stations/{sample['id']}/data?yearMonth={pers[0]['id']}", headers=headers)
    with urllib.request.urlopen(req_data) as r:
        d = json.loads(r.read().decode('utf-8'))['data']
        print("Data count:", len(d))
        if d:
            print("Columns:", [c['columnName'] for c in d[0]['columns']])
            print("Time field present?:", d[0].get('time'))
