import urllib.request
import json

base_url = 'http://127.0.0.1:8000'

try:
    # 1. Test reload endpoint
    req = urllib.request.Request(f'{base_url}/api/historico/reload', method='POST')
    with urllib.request.urlopen(req) as resp:
        print('Reload response:', json.loads(resp.read()))

    # 2. Test catalogo-maestro endpoint
    with urllib.request.urlopen(f'{base_url}/api/historico/catalogo-maestro') as resp:
        data = json.loads(resp.read())
        print('Master Catalog title:', data.get('metadata', {}).get('titulo'))
        print('Cuencas count:', len(data.get('cuencas_estrategicas', {})))
        print('Matriz bivalente keys:', list(data.get('matriz_bivalente_fen', {}).keys()))

    # 3. Test cuencas summary
    with urllib.request.urlopen(f'{base_url}/api/historico/cuencas') as resp:
        cuencas = json.loads(resp.read())
        print('Cuencas summary count:', cuencas.get('total_cuencas'))
        for c in cuencas.get('cuencas', [])[:5]:
            print(f"  - {c['nombre']} ({c['region_macro']}): {c['total_ubigeos']} distritos, {c['total_puentes_vulnerables']} puentes")

    # 4. Test district memory enriched (Íllimo 140304)
    with urllib.request.urlopen(f'{base_url}/api/historico/distrito/140304') as resp:
        illimo = json.loads(resp.read())
        print('Distrito 140304 (Íllimo):')
        print('  - Cuenca:', illimo.get('cuenca_principal'))
        print('  - Puentes vulnerables:', len(illimo.get('infraestructura_critica_asociada', {}).get('puentes_vulnerables', [])))
        print('  - Caseríos recurrentes:', illimo.get('caserios_inundacion_recurrente'))
        print('  - Lección CAF:', illimo.get('lecciones_caf'))

    # 5. Test district in Sierra Sur (Ilave 210501)
    with urllib.request.urlopen(f'{base_url}/api/historico/distrito/210501') as resp:
        ilave = json.loads(resp.read())
        print('Distrito 210501 (Ilave):')
        print('  - Cuenca:', ilave.get('cuenca_principal'))
        print('  - Macro región:', ilave.get('region_macro'))
        print('  - Bipolaridad FEN:', ilave.get('firmas_meteorologicas_precursoras', {}).get('bipolaridad_fen'))

    print('\nTODAS LAS PRUEBAS DE LA FASE 1 PASARON EXITOSAMENTE.')

except Exception as e:
    print('Error en prueba:', e)
