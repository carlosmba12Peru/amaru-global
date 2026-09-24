import urllib.request
from pathlib import Path

url = 'https://sigrid.cenepred.gob.pe/sigridv3/documento/21362/descargar'
headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    'Referer': 'https://sigrid.cenepred.gob.pe/sigridv3/documento/21362'
}
req = urllib.request.Request(url, headers=headers)
print("Requesting PDF from SIGRID...")
with urllib.request.urlopen(req, timeout=180) as resp:
    data = resp.read()
    print(f"Downloaded {len(data)} bytes")

# Find the exact folder under data
data_dir = Path("data")
target_folder = None
for p in data_dir.iterdir():
    if p.is_dir() and "SIGRID" in p.name:
        target_folder = p
        break

if not target_folder:
    target_folder = data_dir

target_file = target_folder / "21362_plan-de-prevencion-y-reduccion-del-riesgo-de-desastres-ante-inundaciones-fluviales-ocasionadas-por-lluvias-intensas-distrito-de-eduardo villanueva san marcos cajamarca.pdf"

print(f"Saving to: {target_file}")
target_file.write_bytes(data)
print(f"Done! File size: {target_file.stat().st_size} bytes")
