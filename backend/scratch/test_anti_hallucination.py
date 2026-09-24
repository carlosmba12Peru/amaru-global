import urllib.request
import json

base_url = 'http://127.0.0.1:8000'

def test_ubigeo(ub, label):
    url = f"{base_url}/api/historico/analog-match/{ub}"
    with urllib.request.urlopen(url) as resp:
        d = json.loads(resp.read())
        crit = d.get('dia_maximo_riesgo', {})
        print(f"============================================================")
        print(f"=== {label} ===")
        print(f"============================================================")
        print("Distrito:", d.get('distrito'), "| Cuenca:", d.get('cuenca_nombre'))
        print("Macro-Región:", d.get('region_macro'))
        print("Similitud Análoga:", f"{crit.get('similitud_analoga_pct')}%")
        print("Evento Análogo Asignado:", crit.get('evento_analogo_referencia'))
        print("Factor Amplificación FEN:", f"{crit.get('factor_amplificacion_fen')}x")
        print("Nivel de Alerta Anticipada:", crit.get('nivel_alerta_anticipada'))
        
        infra = d.get('infraestructura_amenazada_caf', [])
        print(f"Total Infraestructuras CAF Identificadas: {len(infra)}")
        if infra:
            for item in infra:
                print(f"  * [{item.get('tipo')}] {item.get('nombre') or item.get('tramo')}")
        else:
            print("  * [NINGUNA] El sistema no inventa infraestructura si no está en la base de la CAF.")
        print()

test_ubigeo('140304', 'CASO A: DISTRITO CRÍTICO CON HISTORIA (ÍLLIMO - LA LECHE)')
test_ubigeo('010101', 'CASO B: DISTRITO SIN CUENCA FEN CRÍTICA (CHACHAPOYAS)')
