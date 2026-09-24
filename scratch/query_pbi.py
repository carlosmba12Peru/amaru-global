import urllib.request
import json
import gzip

cluster = 'https://wabi-south-central-us-c-primary-api.analysis.windows.net'
resource_key = '31e8586b-f722-4019-aa38-00980375c872'
url = f'{cluster}/public/reports/querydata'

# Build a DAX or Semantic Query for table Datos_total_vf (2)
query_payload = {
    "version": "1.0.0",
    "queries": [
        {
            "Query": {
                "Commands": [
                    {
                        "SemanticQueryDataShapeCommand": {
                            "Query": {
                                "Version": 2,
                                "From": [{"Name": "d", "Entity": "Datos_total_vf (2)"}],
                                "Select": [
                                    {"Column": {"Expression": {"SourceRef": {"Source": "d"}}, "Property": "Estacion"}, "Name": "Estacion"},
                                    {"Column": {"Expression": {"SourceRef": {"Source": "d"}}, "Property": "Latitud"}, "Name": "Latitud"},
                                    {"Column": {"Expression": {"SourceRef": {"Source": "d"}}, "Property": "Longitud"}, "Name": "Longitud"},
                                    {"Column": {"Expression": {"SourceRef": {"Source": "d"}}, "Property": "Elevacion"}, "Name": "Elevacion"},
                                    {"Column": {"Expression": {"SourceRef": {"Source": "d"}}, "Property": "Total acumulado (mm)"}, "Name": "Lluvia_mm"},
                                    {"Column": {"Expression": {"SourceRef": {"Source": "d"}}, "Property": "Fuente"}, "Name": "Fuente"}
                                ]
                            },
                            "Binding": {
                                "Primary": {"Groupings": [{"Projections": [0, 1, 2, 3, 4, 5]}]},
                                "DataReduction": {"DataVolume": 3, "Primary": {"Top": {}}}
                            }
                        }
                    }
                ]
            },
            "QueryId": "",
            "ApplicationContext": {"DatasetId": "any", "Sources": [{"ReportId": "any"}]}
        }
    ],
    "cancelQueries": [],
    "modelId": 0
}

req = urllib.request.Request(
    url,
    data=json.dumps(query_payload).encode('utf-8'),
    headers={
        'X-PowerBI-ResourceKey': resource_key,
        'User-Agent': 'Mozilla/5.0',
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
)

try:
    with urllib.request.urlopen(req) as resp:
        res_data = json.loads(gzip.decompress(resp.read()).decode('utf-8'))
        print("Query Success!")
        # print results
        results = res_data.get('results', [])
        for r in results:
            ds = r.get('result', {}).get('data', {}).get('dsr', {}).get('DS', [])
            for d in ds:
                rows = d.get('PH', [{}])[0].get('DM0', [])
                print(f"Total Rows: {len(rows)}")
                for row in rows:
                    print("Row:", row)
except Exception as e:
    print("Query error:", e)
