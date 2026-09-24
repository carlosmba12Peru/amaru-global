import urllib.request
import os

url = 'https://sigrid.cenepred.gob.pe/sigridv3/documento/21362/descargar'
headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36',
    'Referer': 'https://sigrid.cenepred.gob.pe/sigridv3/documento/21362'
}
req = urllib.request.Request(url, headers=headers)
try:
    with urllib.request.urlopen(req, timeout=60) as resp:
        print('Status:', resp.status)
        content_disp = resp.headers.get('Content-Disposition')
        print('Content-Disposition:', content_disp)
        content_type = resp.headers.get('Content-Type')
        print('Content-Type:', content_type)
        data = resp.read()
        print('Downloaded bytes:', len(data))
        
        filename = "21362_plan-de-prevencion-y-reduccion-del-riesgo-de-desastres-ante-inundaciones-fluviales-ocasionadas-por-lluvias-intensas-distrito-de-eduardo villanueva san marcos cajamarca.pdf"
        if content_disp and 'filename=' in content_disp:
            raw_fn = content_disp.split('filename=')[-1].strip().strip('";\'')
            if raw_fn:
                filename = raw_fn
        
        target_dir = r"data\SIGRID Sistema de información para la gestión del riesgos de desastres"
        target_path = os.path.join(target_dir, filename)
        with open(target_path, 'wb') as f:
            f.write(data)
        print('Saved successfully to:', target_path)
except Exception as e:
    print('Download failed:', e)
