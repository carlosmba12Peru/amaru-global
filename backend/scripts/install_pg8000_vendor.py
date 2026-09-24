"""
Vendor installer for pure-python PostgreSQL driver (pg8000, scramp, asn1crypto)
Bypasses Windows pip shutil.move / temp directory permission lockouts.
"""

import sys
import io
import json
import zipfile
import urllib.request
from pathlib import Path

VENDOR_DIR = Path(__file__).resolve().parent.parent / "vendor"

PACKAGES = ["pg8000", "scramp", "asn1crypto"]

def install_pkg(pkg_name: str):
    print(f"Buscando rueda wheel para {pkg_name} en PyPI...")
    url = f"https://pypi.org/pypi/{pkg_name}/json"
    req = urllib.request.Request(url, headers={"User-Agent": "AmaruVendor/1.0"})
    with urllib.request.urlopen(req) as resp:
        data = json.loads(resp.read().decode("utf-8"))
    
    wheel_url = None
    wheel_name = None
    for item in data.get("urls", []):
        filename = item.get("filename", "")
        if filename.endswith(".whl") and ("py3-none-any" in filename or "py2.py3-none-any" in filename):
            wheel_url = item.get("url")
            wheel_name = filename
            break
            
    if not wheel_url:
        print(f"No se encontró rueda .whl universal para {pkg_name}")
        return False
        
    print(f"Descargando {wheel_name}...")
    with urllib.request.urlopen(wheel_url) as resp:
        wheel_bytes = resp.read()
        
    print(f"Extrayendo en {VENDOR_DIR}...")
    with zipfile.ZipFile(io.BytesIO(wheel_bytes)) as z:
        z.extractall(VENDOR_DIR)
        
    print(f"{pkg_name} instalado correctamente en vendor.")
    return True

if __name__ == "__main__":
    for p in PACKAGES:
        install_pkg(p)
    print("Todos los paquetes de PostgreSQL instalados.")
