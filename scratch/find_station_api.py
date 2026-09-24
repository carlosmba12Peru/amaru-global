import urllib.request
import re

chunks = [
    './chunk-WANBE7VT.js', './chunk-N7L5U2E6.js', './chunk-MGMKBZKA.js',
    './chunk-AEVSDLIX.js', './chunk-OWMTPAFM.js', './chunk-SC6FKBQM.js',
    './chunk-N3RM7TYI.js', './chunk-26JNFLBF.js', './chunk-PP7YIBPE.js',
    './chunk-FRO3EVPY.js', './chunk-QA5NQACW.js', './chunk-HL56MF22.js',
    './chunk-KRM4JAGQ.js', './chunk-AWBGURTL.js', './chunk-CD5K4TE5.js',
    './chunk-7OJX4HDU.js', './chunk-BVB4XSUX.js', './chunk-5YNK5EGD.js',
    './chunk-HV26P3NR.js', './chunk-EPCBWG43.js', './chunk-HRXSRDID.js',
    './chunk-GGQ47PKL.js', './chunk-IM5V7DCU.js', './chunk-4F5V7V4U.js'
]

headers = {'User-Agent': 'Mozilla/5.0'}

for c in chunks:
    c_clean = c.replace('./', '')
    url = f"https://observatorio.senamhi.gob.pe/{c_clean}"
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, timeout=10) as resp:
            js = resp.read().decode('utf-8', errors='ignore')
            if 'getAllStations' in js or 'getStationData' in js:
                print(f"Found in {c_clean}!")
                # Print around getAllStations
                for m in re.finditer(r'getAllStations', js):
                    idx = m.start()
                    print(js[max(0, idx-100):min(len(js), idx+500)])
                    print("="*60)
    except Exception as e:
        pass
