# backend/scripts/test_linguistic_scenarios.py
"""
Script de Pruebas de Escenarios de Alerta Territorial (COEN-Digital)
Ejecuta y verifica la traducción y adaptación comunitaria de recomendaciones operativas
a Quechua (Chanka, Collao, Áncash), Aymara, Asháninka y Awajún a través de linguistic_agent.py.
"""
import sys
import os
import asyncio

if sys.stdout.encoding != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

# Asegurar path de importación del backend
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from agents.linguistic_agent import LinguisticAgent
from agents.dispatcher_agent import DispatcherAgent
from agents.schemas import (
    TriageResult,
    TacticalAssessment,
    HydroTelemetry,
    NationalValidationContext,
    CriticalResource
)

ESCENARIOS_DE_PRUEBA = [
    {
        "id": "ESC-01",
        "titulo": "Huaico e Inundación de Quebradas en Chosica (Lima)",
        "ubigeo": "150118",
        "distrito": "Lurigancho-Chosica",
        "cuenca": "Río Rímac / Quebradas Carossio y Pedregal",
        "nivel_alerta": "ROJO",
        "lengua_esperada": "Runasimi (Quechua Chanka)",
        "telemetria": {
            "precipitation_24h": 41.2,
            "soil_moisture": 88.5,
            "river_flow": 118.5
        },
        "tactica": {
            "poblacion_expuesta": 12100,
            "familias": 2880,
            "vias": ["Carretera Central Km 32 al 45", "Puente Carossio"],
            "albergues": ["Estadio Municipal Solís García", "Losa Deportiva San Fernando"],
            "accion": "Cierre preventivo de Carretera Central Km 32-45 y evacuación inmediata de quebradas Carossio y Pedregal a losas deportivas altas."
        }
    },
    {
        "id": "ESC-02",
        "titulo": "Aluvión Glaciar y Saturación en Callejón de Huaylas - Huaraz (Áncash)",
        "ubigeo": "020101",
        "distrito": "Huaraz",
        "cuenca": "Río Santa / Río Quillcay / Laguna Palcacocha",
        "nivel_alerta": "ROJO",
        "lengua_esperada": "Runasimi Ancashino (Huaylas/Conchucos)",
        "telemetria": {
            "precipitation_24h": 58.4,
            "soil_moisture": 91.0,
            "river_flow": 142.0
        },
        "tactica": {
            "poblacion_expuesta": 20500,
            "familias": 4880,
            "vias": ["Longitudinal de la Sierra Km 200", "Puente Quillcay"],
            "albergues": ["Estadio Rosas Pampa", "Coliseo Cerrado de Huaraz"],
            "accion": "Evacuación inmediata del cono aluviónico del Río Quillcay hacia terrazas altas de Nicrupampa y Shancayán."
        }
    },
    {
        "id": "ESC-03",
        "titulo": "Desborde Fluvial del Río Vilcanota en Urubamba - Valle Sagrado (Cusco)",
        "ubigeo": "081301",
        "distrito": "Urubamba",
        "cuenca": "Valle Sagrado / Cuenca Río Vilcanota-Urubamba",
        "nivel_alerta": "ROJO",
        "lengua_esperada": "Runasimi Collao (Cusco)",
        "telemetria": {
            "precipitation_24h": 46.0,
            "soil_moisture": 84.0,
            "river_flow": 380.0
        },
        "tactica": {
            "poblacion_expuesta": 5500,
            "familias": 1310,
            "vias": ["Vía Valle Sagrado Cusco - Ollantaytambo Km 50", "Puente Urubamba"],
            "albergues": ["Estadio Municipal Nogalpampa", "Coliseo de Urubamba"],
            "accion": "Desalojo de la faja marginal de Chichubamba y Yanahuara; traslado a zonas altas del Estadio Nogalpampa."
        }
    },
    {
        "id": "ESC-04",
        "titulo": "Helada Meteorológica Extrema (-14°C) en Mazocruz (El Collao, Puno)",
        "ubigeo": "210505",
        "distrito": "Santa Rosa (Mazocruz)",
        "cuenca": "Altiplano Puno / Río Ilave",
        "nivel_alerta": "ROJO",
        "lengua_esperada": "Aymara Altiplánico",
        "telemetria": {
            "precipitation_24h": 2.0,
            "soil_moisture": 45.0,
            "river_flow": 12.0,
            "min_temp": -14.2
        },
        "tactica": {
            "poblacion_expuesta": 2800,
            "familias": 660,
            "vias": ["Carretera Ilave - Mazocruz Km 55", "Trocha carrozable Chichillapi"],
            "albergues": ["Centro Comunal con calefacción solar", "Cobertizos Térmicos Central"],
            "accion": "Abrigo urgente de niños y adultos mayores en centros comunales con calefacción y protección de alpacas en cobertizos térmicos."
        }
    },
    {
        "id": "ESC-05",
        "titulo": "Crecida Violenta de Ríos Perené y Satipo e Inundación de Comunidades Nativas (Junín)",
        "ubigeo": "120601",
        "distrito": "Satipo",
        "cuenca": "Selva Central / Cuenca Río Satipo - Ene - Perené",
        "nivel_alerta": "ROJO",
        "lengua_esperada": "Asháninka Amazónico",
        "telemetria": {
            "precipitation_24h": 68.5,
            "soil_moisture": 93.0,
            "river_flow": 520.0
        },
        "tactica": {
            "poblacion_expuesta": 4700,
            "familias": 1120,
            "vias": ["Carretera Marginal de la Selva Km 125", "Puente Río Satipo"],
            "albergues": ["Coliseo Shirampari de Satipo", "Centro Comunal Multiétnico"],
            "accion": "Evacuación inmediata en botes y trochas altas hacia el Coliseo Shirampari; alerta roja por deslizamientos en laderas."
        }
    },
    {
        "id": "ESC-06",
        "titulo": "Inundación por Desborde del Río Marañón y Nieva (Condorcanqui, Amazonas)",
        "ubigeo": "010401",
        "distrito": "Nieva",
        "cuenca": "Cuenca Río Marañón / Río Nieva / Cenepa",
        "nivel_alerta": "ROJO",
        "lengua_esperada": "Awajún Amazónico",
        "telemetria": {
            "precipitation_24h": 74.0,
            "soil_moisture": 95.0,
            "river_flow": 1250.0
        },
        "tactica": {
            "poblacion_expuesta": 4500,
            "familias": 1070,
            "vias": ["Eje Fluvial Marañón", "Carretera Bagua - Saramiriza Km 95"],
            "albergues": ["Coliseo Municipal Santa María de Nieva", "Maloca Comunal de Refugio"],
            "accion": "Poner a buen recaudo embarcaciones y trasladar a las familias awajún a las malocas comunales y zonas no inundables."
        }
    },
    {
        "id": "ESC-07",
        "titulo": "Crecida Extraordinaria del Río Piura por Fenómeno El Niño (Piura)",
        "ubigeo": "200101",
        "distrito": "Piura",
        "cuenca": "Cuenca del Río Piura",
        "nivel_alerta": "ROJO",
        "lengua_esperada": "Castellano Comunitario",
        "telemetria": {
            "precipitation_24h": 52.0,
            "soil_moisture": 92.0,
            "river_flow": 1950.0
        },
        "tactica": {
            "poblacion_expuesta": 17800,
            "familias": 4230,
            "vias": ["Panamericana Norte Km 990", "Puente Sánchez Cerro"],
            "albergues": ["Colegio San Miguel de Piura", "Complejo Deportivo Santa Ana"],
            "accion": "Evacuación obligatoria del Bajo Piura y Catacaos ante inminente desborde; cierre vehicular de los puentes urbanos."
        }
    }
]

async def run_scenario_tests():
    print("=" * 80)
    print("SIMULADOR DE PRUEBAS DE ALERTAS LINGÜÍSTICAS MULTILINGÜES (COEN-DIGITAL)")
    print("Evaluando traducción a Quechua (Chanka, Collao, Áncash), Aymara, Asháninka y Awajún")
    print("=" * 80)

    linguistic_agent = LinguisticAgent()
    dispatcher_agent = DispatcherAgent()
    total_passed = 0

    for esc in ESCENARIOS_DE_PRUEBA:
        print(f"\n[{esc['id']}] {esc['titulo']}")
        print(f"Distrito: {esc['distrito']} | UBIGEO: {esc['ubigeo']} | Cuenca: {esc['cuenca']}")
        print(f"Nivel Alerta: {esc['nivel_alerta']} | Lengua Meta: {esc['lengua_esperada']}")
        print("-" * 80)

        # Construcción de contratos de datos
        t_data = esc["telemetria"]
        telemetria = HydroTelemetry(
            ubigeo=esc["ubigeo"],
            nombre_distrito=esc["distrito"],
            cuenca=esc["cuenca"],
            precipitation_24h=t_data.get("precipitation_24h", 40.0),
            soil_moisture=t_data.get("soil_moisture", 85.0),
            river_flow=t_data.get("river_flow", 100.0),
            min_temp=t_data.get("min_temp", 14.0)
        )

        triage = TriageResult(
            ubigeo=esc["ubigeo"],
            distrito=esc["distrito"],
            cuenca=esc["cuenca"],
            nivel_alerta=esc["nivel_alerta"],
            is_critical=True,
            criterio_disparo=f"Superación de umbral hidrológico crítico en {esc['cuenca']}",
            telemetria=telemetria,
            validacion_nacional=NationalValidationContext()
        )

        tac_data = esc["tactica"]
        tactical = TacticalAssessment(
            ubigeo=esc["ubigeo"],
            distrito=esc["distrito"],
            cuenca=esc["cuenca"],
            poblacion_expuesta_estimada=tac_data["poblacion_expuesta"],
            familias_en_faja_marginal=tac_data["familias"],
            vias_comprometidas=tac_data["vias"],
            centros_salud_en_riesgo=["Centro de Salud Distrital"],
            maquinaria_recomendada=[CriticalResource(tipo="Cargador Frontal", cantidad=2)],
            albergues_recomendados=tac_data["albergues"],
            accion_operativa_inmediata=tac_data["accion"],
            boletin_tecnico_oficial=f"Boletín Técnico COEN N° {esc['id']}"
        )

        # 1. Ejecución del Agente Lingüístico
        res_ling = await linguistic_agent.translate_and_adapt(triage, tactical)

        # 2. Generación del Estándar CAP v1.2 (SISMATE / ITU-T X.1303)
        cap_payload = dispatcher_agent.generate_cap_v12_payload(
            f"INC-TEST-{esc['id']}", triage, tactical, res_ling
        )

        # Validación según la Regla de Oro Lingüística
        has_castellano = len(res_ling.mensaje_comunitario_castellano) > 20
        if res_ling.es_bilingue:
            has_originaria = res_ling.mensaje_comunitario_lengua_originaria is not None and len(res_ling.mensaje_comunitario_lengua_originaria) > 20
            has_cap = len(cap_payload.info) == 2
            cap_valid = cap_payload.info[0].language == "es-PE" and cap_payload.info[1].language != "es-PE"
        else:
            has_originaria = res_ling.mensaje_comunitario_lengua_originaria is None
            has_cap = len(cap_payload.info) == 1
            cap_valid = cap_payload.info[0].language == "es-PE"

        print(f"🗣️ Lengua Asignada: {res_ling.lengua_nombre} ({res_ling.variante_linguistica}) | Bilingüe: {res_ling.es_bilingue}")
        print(f"\n📋 [1. RECOMENDACIÓN TÁCTICA AUTORIDADES (COER)]:\n{res_ling.mensaje_tecnico_coer}")
        if res_ling.es_bilingue:
            print(f"\n🇵🇪 [2. ALERTA LENGUA ORIGINARIA PREDOMINANTE ({res_ling.lengua_nombre})]:\n{res_ling.mensaje_comunitario_lengua_originaria}")
            print(f"\n🇪🇸 [3. VERSIÓN CASTELLANO QUE SIEMPRE ACOMPAÑA]:\n{res_ling.mensaje_comunitario_castellano}")
        else:
            print(f"\n🇪🇸 [2. ALERTA ÚNICA EN CASTELLANO LLANO (SIN TRADUCCIÓN FORZADA)]:\n{res_ling.mensaje_comunitario_castellano}")
        
        print(f"\n📡 [4. ESTÁNDAR CAP v1.2 SISMATE]:")
        for idx, inf in enumerate(cap_payload.info):
            print(f"   - Info {idx} ({inf.language}): {inf.event} | {inf.headline[:60]}...")

        if has_castellano and has_originaria and has_cap and cap_valid:
            print(f"\n✅ RESULTADO: TEST {esc['id']} APROBADO SATISFACTORIAMENTE ({'BILINGÜE' if res_ling.es_bilingue else 'MONOLINGÜE CASTELLANO'}).")
            total_passed += 1
        else:
            print(f"\n❌ RESULTADO: TEST {esc['id']} FALLÓ EN VALIDACIÓN.")

    print("\n" + "=" * 80)
    print(f"RESUMEN FINAL: {total_passed}/{len(ESCENARIOS_DE_PRUEBA)} ESCENARIOS VALIDADOS EXITOSAMENTE")
    print("=" * 80)

if __name__ == "__main__":
    asyncio.run(run_scenario_tests())
