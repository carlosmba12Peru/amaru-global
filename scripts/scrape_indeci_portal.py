import urllib.request, re

url = 'https://portal.indeci.gob.pe/informe/reportes-preliminares-complementarios-emergencias/'
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
try:
    with urllib.request.urlopen(req, timeout=15) as resp:
        html = resp.read().decode('utf-8', errors='ignore')
    
    # Buscar enlaces a reportes individuales
    items = re.findall(r'<article[^>]*>.*?<h[1-4][^>]*><a\s+href="([^"]+)"[^>]*>(.*?)</a>.*?</article>', html, re.DOTALL | re.IGNORECASE)
    print(f"Total reportes en la portada de INDECI: {len(items)}")
    for link, title in items[:15]:
        print(f"  • {title.strip()[:70]} -> {link}")
        
    # Buscar paginación
    pages = re.findall(r'href="([^"]+/reportes-preliminares-complementarios-emergencias/page/\d+/)"', html)
    print(f"Páginas detectadas: {set(pages)}")

except Exception as e:
    print(f"Error al conectar con INDECI: {e}")
