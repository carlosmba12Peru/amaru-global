import os
import sys
import re
from backend.services.mef_obras_service import mef_obras_service

def clean_name(t):
    return re.sub(r'[^A-Z0-9 ]', ' ', t.upper())

def clasificar_obra(nom_raw):
    n = clean_name(nom_raw)
    
    # 1. Defensas Ribereñas, Muros y Protección Fluvial
    if any(k in n for k in ['DEFENSA', 'DEFENZA', 'RIBERE', 'RIBERA', 'ENCAUZAMIENTO', 'MURO DE CONTEN', 'GAVION', 'ENROCADO', 'DIQUE', 'MARGEN', 'CANALIZACION', 'CANAL', 'PROTECCION CONTRA INUNDACION', 'CONTROL DE INUNDACION', 'PROTECCION EN LA RIBERA', 'PROTECCION DE LA RIBERA', 'PROTECCION FISICA']):
        return 'DEFENSAS RIBEREÑAS Y CONTROL DE INUNDACIONES'
    
    # 2. Descolmatación y Limpieza de Ríos/Cauces
    if any(k in n for k in ['DESCOLMATAC', 'LIMPIEZA DE CAUCE', 'DESCOLMATAR', 'LIMPIEZA Y DESCOLMATACION']):
        return 'DESCOLMATACIÓN Y LIMPIEZA DE CAUCES'
        
    # 3. Drenaje Pluvial, Cunetas y Evacuación de Aguas
    if any(k in n for k in ['DRENAJE', 'PLUVIAL', 'EVACUACION DE AGUA', 'CUNETA', 'ALCANTARILLA', 'COLECTOR', 'VIA CANAL', 'SIFONES']):
        return 'DRENAJE PLUVIAL Y COLECTORES URBANOS'
        
    # 4. Quebradas, Huaycos, Torrenteras y Laderas
    if any(k in n for k in ['QUEBRADA', 'HUAYCO', 'ALUD', 'DESLIZAMIENTO', 'TORRENTERA', 'BARRERA DINAMICA', 'DIQUE TRANSVERSAL', 'LADERA', 'ESTABILIZACION', 'TALUD']):
        return 'CONTROL DE TORRENTERAS, HUAYCOS Y QUEBRADAS'
        
    # 5. Infraestructura Vial, Puentes y Transitabilidad
    if any(k in n for k in ['PUENTE', 'CARRETERA', 'CAMINO', 'TRANSITABILIDAD', 'PASO A DESNIVEL', 'VIAL', 'BADEN', 'PONTON', 'VADOS']):
        return 'INFRAESTRUCTURA VIAL Y PUENTES CRÍTICOS'
        
    # 6. Reconstrucción de Colegios y Locales Esenciales (IRI)
    if any(k in n for k in ['LOCAL EDUCATIVO', 'INSTITUCION EDUCATIVA', 'COLEGIO', 'IRI EN LOCAL', 'CENTRO DE SALUD', 'POSTA', 'HOSPITAL']):
        return 'PROTECCIÓN Y RECONSTRUCCIÓN DE LOCALES ESENCIALES (IRI)'
        
    # 7. Saneamiento Básico y Agua Potable
    if any(k in n for k in ['AGUA POTABLE', 'ALCANTARILLADO', 'SANEAMIENTO', 'DESAGUE', 'CAPTACION']):
        return 'SANEAMIENTO BÁSICO Y AGUA POTABLE'
        
    # 8. Capacidad Operativa, Maquinaria, Logística y Almacenes
    if any(k in n for k in ['ACCIONES COMUNES', 'EMERGENCIA', 'MAQUINARIA', 'COMBUSTIBLE', 'ALMACEN', 'AYUDA HUMANITARIA', 'CAPACIDAD OPERATIVA', 'CAPACIDAD INSTALADA', 'ATENCION', 'CENTRO DE OPERACIONES', 'GESTION DE DESASTRES', 'PREVENCION Y ATENCION']):
        return 'CAPACIDAD OPERATIVA, MAQUINARIA Y LOGÍSTICA DE EMERGENCIA'
        
    # 9. Estudios, Preinversión y Expedientes Técnicos
    if any(k in n for k in ['EXPEDIENTE', 'ESTUDIO', 'PRE INVERSION', 'PREINVERSION', 'SUPERVISION', 'PERFIL']):
        return 'ESTUDIOS DE PREINVERSIÓN Y EXPEDIENTES TÉCNICOS'
        
    return 'OBRAS DE PROTECCIÓN Y MITIGACIÓN COMPLEMENTARIAS'

agrupados = {}
for o in mef_obras_service.obras:
    grupo = clasificar_obra(o['nombre_proyecto'])
    if grupo not in agrupados:
        agrupados[grupo] = {
            'obras': [],
            'pim_total': 0.0,
            'devengado_total': 0.0,
            'avances': []
        }
    agrupados[grupo]['obras'].append(o)
    agrupados[grupo]['pim_total'] += o['pim_soles']
    agrupados[grupo]['devengado_total'] += o['devengado_soles']
    agrupados[grupo]['avances'].append(o['porcentaje_ejecucion'])

print(f"=== ANÁLISIS DE {len(mef_obras_service.obras)} OBRAS PP 0068 - CONSULTA AMIGABLE MEF 2026 ===\n")
resumen = []
for grp, datos in agrupados.items():
    n_obras = len(datos['obras'])
    pim = datos['pim_total']
    dev = datos['devengado_total']
    prom_simple = sum(datos['avances']) / n_obras if n_obras > 0 else 0.0
    prom_ponderado = (dev / pim * 100.0) if pim > 0 else 0.0
    obras_criticas = [x for x in datos['obras'] if x['porcentaje_ejecucion'] < 20.0 and x['pim_soles'] > 50000]
    obras_avanzadas = [x for x in datos['obras'] if x['porcentaje_ejecucion'] >= 70.0]
    resumen.append({
        'grupo': grp,
        'n_obras': n_obras,
        'pim': pim,
        'dev': dev,
        'prom_simple': prom_simple,
        'prom_ponderado': prom_ponderado,
        'obras_criticas_count': len(obras_criticas),
        'obras_avanzadas_count': len(obras_avanzadas),
        'obras_ejemplo': sorted(datos['obras'], key=lambda x: x['pim_soles'], reverse=True)[:3]
    })

resumen.sort(key=lambda x: x['pim'], reverse=True)
for r in resumen:
    print(f"[{r['grupo']}]")
    print(f"  • Cantidad de Obras: {r['n_obras']} proyectos")
    print(f"  • Presupuesto PIM: S/ {r['pim']:,.2f}")
    print(f"  • Devengado Ejecutado: S/ {r['dev']:,.2f}")
    print(f"  • Promedio Simple de Avance Físico/Financiero: {r['prom_simple']:.1f}%")
    print(f"  • Avance Financiero Ponderado (Devengado/PIM): {r['prom_ponderado']:.1f}%")
    print(f"  • Proyectos Críticos (<20% avance): {r['obras_criticas_count']} | Avanzados (>=70%): {r['obras_avanzadas_count']}")
    print("  • Principales Proyectos:")
    for ej in r['obras_ejemplo']:
        print(f"     - CUI {ej['cui']}: {clean_name(ej['nombre_proyecto'])[:60]}... (PIM: S/ {ej['pim_soles']:,.0f} | Avance: {ej['porcentaje_ejecucion']}%)")
    print()
