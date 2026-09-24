import urllib.request
import re
import json

url = 'https://app.powerbi.com/view?r=eyJrIjoiMzFlODU4NmItZjcyMi00MDE5LWFhMzgtMDA5ODAzNzVjODcyIiwidCI6IjFiMThkODNiLWQxNWYtNDE2YS04NTg2LTY4YjcwYTE0NjRjYSIsImMiOjR9'
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
with urllib.request.urlopen(req) as resp:
    html = resp.read().decode('utf-8')

# Search for any string literals
print("Total HTML len:", len(html))

# Let's search for mentions of quebrada, cenepred, ana, indeci, anin, arcc, chosica, lima, etc.
keywords = ['quebrada', 'cenepred', 'ana', 'indeci', 'anin', 'arcc', 'peligro', 'riesgo', 'huaico', 'chile', 'peru', 'lima', 'rimac', 'lurin', 'chillon']
for kw in keywords:
    count = len(re.findall(re.escape(kw), html, re.IGNORECASE))
    print(f"Keyword '{kw}': {count} occurrences")

# Find all JSON-like assignments or window properties
for m in re.finditer(r'var\s+([a-zA-Z0-9_]+)\s*=', html):
    var_name = m.group(1)
    snippet = html[m.start():m.start()+200].replace('\n', ' ')
    print(f"Var: {snippet}")
