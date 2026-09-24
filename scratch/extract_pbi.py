import urllib.request
import json
import gzip

cluster = 'https://wabi-south-central-us-c-primary-api.analysis.windows.net'
resource_key = '31e8586b-f722-4019-aa38-00980375c872'
url = f'{cluster}/public/reports/{resource_key}/modelsAndExploration?preferReadOnlySession=true'

req = urllib.request.Request(url, headers={'X-PowerBI-ResourceKey': resource_key, 'User-Agent': 'Mozilla/5.0'})
with urllib.request.urlopen(req) as resp:
    data = json.loads(gzip.decompress(resp.read()).decode('utf-8'))

exp = data.get('exploration', {})
for s in exp.get('sections', [])[1:]:
    s_name = s.get('displayName')
    print(f"\n=== SECTION: {s_name} ===")
    for v in s.get('visualContainers', []):
        cfg_str = v.get('config')
        if not cfg_str:
            continue
        cfg = json.loads(cfg_str)
        single = cfg.get('singleVisual', {})
        vtype = single.get('visualType')
        title_obj = single.get('vcObjects', {}).get('title')
        title_text = None
        if title_obj and isinstance(title_obj, list) and len(title_obj) > 0:
            title_text = title_obj[0].get('properties', {}).get('text', {}).get('expr', {}).get('Literal', {}).get('Value')
        
        if vtype == 'lineClusteredColumnComboChart':
            print(f"Chart: {title_text}")
            prototype = single.get('prototypeQuery', {})
            selects = prototype.get('Select', [])
            for sel in selects:
                print("  Select:", sel.get('Name'))
            print("  From:", prototype.get('From'))
