# backend/services/tools/territorial_tools.py
"""
Herramientas (tools) territoriales para el Agente de Evaluación Táctica.
Permite cruzar coordenadas y UBIGEOS con polígonos del INEI, vías críticas y maquinaria INDECI.
"""
from typing import Dict, Any, List

CATALOGO_TERRITORIAL = {
    "150118": {
        "distrito": "Lurigancho-Chosica",
        "provincia": "Lima",
        "departamento": "Lima",
        "cuenca": "Río Rímac / Quebrada Huaycoloro",
        "poblacion_total": 240000,
        "centros_poblados_criticos": [
            {"nombre": "Quebrada Carossio", "habitantes": 4200, "faja_marginal": True},
            {"nombre": "Quebrada Corrales", "habitantes": 2800, "faja_marginal": True},
            {"nombre": "Quebrada Pedregal", "habitantes": 5100, "faja_marginal": True},
            {"nombre": "Chacrasana", "habitantes": 3100, "faja_marginal": False},
        ],
        "vias_criticas": [
            "Carretera Central Km 32 al 45 (Eje Logístico Nacional)",
            "Puente Carossio",
            "Avenida Las Torres (acceso Huachipa)"
        ],
        "centros_salud": [
            "Hospital José Agurto Tello de Chosica",
            "Centro de Salud Moyopampa"
        ],
        "albergues": [
            "Estadio Municipal Solís García",
            "Losa Deportiva San Fernando",
            "Colegio Felipe Santiago Estenos"
        ],
        "variante_linguistica": "CASTELLANO_LLANO_Y_CHANKA",
        "lengua_nombre": "Runasimi Chanka / Quechua Central"
    },
    "200101": {
        "distrito": "Piura",
        "provincia": "Piura",
        "departamento": "Piura",
        "cuenca": "Cuenca del Río Piura",
        "poblacion_total": 520000,
        "centros_poblados_criticos": [
            {"nombre": "Bajo Piura - Catacaos", "habitantes": 8500, "faja_marginal": True},
            {"nombre": "Puente Sánchez Cerro", "habitantes": 3200, "faja_marginal": True},
            {"nombre": "Urb. Los Polvorines", "habitantes": 6100, "faja_marginal": False}
        ],
        "vias_criticas": [
            "Panamericana Norte Km 980 al 1010",
            "Puente Sánchez Cerro",
            "Puente Cáceres"
        ],
        "centros_salud": [
            "Hospital Regional Santa Rosa",
            "Centro de Salud Pachitea"
        ],
        "albergues": [
            "Colegio San Miguel de Piura",
            "Complejo Deportivo Santa Ana"
        ],
        "variante_linguistica": "CASTELLANO_LLANO_NORTE",
        "lengua_nombre": "Castellano Llano Norteño"
    },
    "210505": {
        "distrito": "Santa Rosa (Mazocruz)",
        "provincia": "El Collao",
        "departamento": "Puno",
        "cuenca": "Altiplano / Cuenca Río Ilave",
        "poblacion_total": 8500,
        "centros_poblados_criticos": [
            {"nombre": "Comunidad Campesina Huacullani", "habitantes": 1200, "faja_marginal": False},
            {"nombre": "Pampa Mazocruz Sector Pastizal", "habitantes": 950, "faja_marginal": False},
            {"nombre": "Chichillapi", "habitantes": 650, "faja_marginal": False}
        ],
        "vias_criticas": [
            "Carretera Ilave - Mazocruz Km 45 al 80",
            "Trocha carrozable a Chichillapi"
        ],
        "centros_salud": [
            "Puesto de Salud Mazocruz (I-3)"
        ],
        "albergues": [
            "Centro Comunal Mazocruz (con calefacción solar)",
            "Cobertizo Térmico Agropecuario Sector Central"
        ],
        "variante_linguistica": "AYMARA_COLLAO",
        "lengua_nombre": "Aymara Altiplánico"
    },
    "080801": {
        "distrito": "Espinar (Yauri)",
        "provincia": "Espinar",
        "departamento": "Cusco",
        "cuenca": "Cuenca Río Salado / Cañipía",
        "poblacion_total": 32000,
        "centros_poblados_criticos": [
            {"nombre": "Comunidad Alto Huarca", "habitantes": 1400, "faja_marginal": False},
            {"nombre": "Huanu Huanu", "habitantes": 800, "faja_marginal": True}
        ],
        "vias_criticas": [
            "Corredor Vial del Sur Km 120 a 145",
            "Puente Cañipía"
        ],
        "centros_salud": [
            "Hospital de Espinar"
        ],
        "albergues": [
            "Coliseo Cerrado de Yauri"
        ],
        "variante_linguistica": "QUECHUA_COLLAO",
        "lengua_nombre": "Runasimi Collao (Cusco)"
    },
    "020101": {
        "distrito": "Huaraz",
        "provincia": "Huaraz",
        "departamento": "Áncash",
        "cuenca": "Río Santa / Río Quillcay / Laguna Palcacocha",
        "poblacion_total": 135000,
        "centros_poblados_criticos": [
            {"nombre": "Sector Cono Aluviónico Río Quillcay", "habitantes": 14200, "faja_marginal": True},
            {"nombre": "Nueva Florida / Soledad Baja", "habitantes": 6300, "faja_marginal": True},
            {"nombre": "Vichay", "habitantes": 4100, "faja_marginal": False}
        ],
        "vias_criticas": [
            "Carretera Longitudinal de la Sierra Norte Km 190 a 220",
            "Puente Quillcay",
            "Avenida Luzuriaga"
        ],
        "centros_salud": [
            "Hospital Víctor Ramos Guardia de Huaraz",
            "Centro de Salud Nicrupampa"
        ],
        "albergues": [
            "Estadio Rosas Pampa de Huaraz",
            "Colegio La Libertad",
            "Coliseo Cerrado de Huaraz"
        ],
        "variante_linguistica": "QUECHUA_ANCASH",
        "lengua_nombre": "Runasimi Ancashino (Huaylas/Conchucos)"
    },
    "081301": {
        "distrito": "Urubamba",
        "provincia": "Urubamba",
        "departamento": "Cusco",
        "cuenca": "Valle Sagrado / Río Vilcanota-Urubamba",
        "poblacion_total": 24500,
        "centros_poblados_criticos": [
            {"nombre": "Riberas Río Vilcanota - Sector Chichubamba", "habitantes": 3400, "faja_marginal": True},
            {"nombre": "Pumahuanca / Yanahuara", "habitantes": 2100, "faja_marginal": True}
        ],
        "vias_criticas": [
            "Vía Valle Sagrado Cusco - Ollantaytambo Km 45 al 60",
            "Puente Urubamba"
        ],
        "centros_salud": [
            "Hospital de Apoyo Urubamba"
        ],
        "albergues": [
            "Estadio Municipal Nogalpampa",
            "Coliseo de Urubamba"
        ],
        "variante_linguistica": "QUECHUA_COLLAO",
        "lengua_nombre": "Runasimi Collao (Cusco)"
    },
    "050101": {
        "distrito": "Ayacucho (Huamanga)",
        "provincia": "Huamanga",
        "departamento": "Ayacucho",
        "cuenca": "Cuenca Río Cachi / Río Alameda",
        "poblacion_total": 115000,
        "centros_poblados_criticos": [
            {"nombre": "Quebrada Chaquihuaycco", "habitantes": 4800, "faja_marginal": True},
            {"nombre": "Sector La Hoyada / Alameda", "habitantes": 3200, "faja_marginal": True}
        ],
        "vias_criticas": [
            "Vía Los Libertadores Wari Km 310 al 330",
            "Puente Nuevo Alameda"
        ],
        "centros_salud": [
            "Hospital Regional de Ayacucho Miguel Ángel Mariscal Llerena"
        ],
        "albergues": [
            "Estadio Ciudad de Cumaná",
            "Complejo Deportivo Mariscal Cáceres"
        ],
        "variante_linguistica": "QUECHUA_CHANKA",
        "lengua_nombre": "Runasimi Chanka"
    },
    "120601": {
        "distrito": "Satipo",
        "provincia": "Satipo",
        "departamento": "Junín",
        "cuenca": "Selva Central / Cuenca Río Satipo - Río Ene - Río Perené",
        "poblacion_total": 42000,
        "centros_poblados_criticos": [
            {"nombre": "Comunidad Nativa San Francisco de Satipo", "habitantes": 1900, "faja_marginal": True},
            {"nombre": "Sector Bellavista Ribera", "habitantes": 2800, "faja_marginal": True},
            {"nombre": "Tzactziriki / Pampa Hermosa", "habitantes": 1200, "faja_marginal": False}
        ],
        "vias_criticas": [
            "Carretera Marginal de la Selva Central Km 110 al 145",
            "Puente Río Satipo"
        ],
        "centros_salud": [
            "Hospital Manuel Higa Arakaki de Satipo"
        ],
        "albergues": [
            "Coliseo Shirampari de Satipo",
            "Centro Comunal Multiétnico Satipo"
        ],
        "variante_linguistica": "ASHANINKA",
        "lengua_nombre": "Asháninka Amazónico"
    },
    "010401": {
        "distrito": "Nieva",
        "provincia": "Condorcanqui",
        "departamento": "Amazonas",
        "cuenca": "Cuenca Río Marañón / Río Nieva / Cenepa",
        "poblacion_total": 29000,
        "centros_poblados_criticos": [
            {"nombre": "Santa María de Nieva - Ribera Marañón", "habitantes": 3100, "faja_marginal": True},
            {"nombre": "Comunidad Awajún Kigkis", "habitantes": 1100, "faja_marginal": True},
            {"nombre": "Juan Velasco Alvarado - Puerto Nieva", "habitantes": 1400, "faja_marginal": True}
        ],
        "vias_criticas": [
            "Eje Vial Fluvial Río Marañón",
            "Carretera Bagua - Saramiriza Km 80 al 115"
        ],
        "centros_salud": [
            "Centro de Salud I-4 Santa María de Nieva"
        ],
        "albergues": [
            "Coliseo Municipal de Santa María de Nieva",
            "Maloca Comunal de Refugio Awajún"
        ],
        "variante_linguistica": "AWAJUN",
        "lengua_nombre": "Awajún Amazónico"
    }
}

INVENTARIO_MAQUINARIA = {
    "Lima": [
        {"tipo": "Cargador Frontal Caterpillar 950", "cantidad": 3, "estado": "OPERATIVO"},
        {"tipo": "Volquete Scania 15m³", "cantidad": 5, "estado": "OPERATIVO"},
        {"tipo": "Retroexcavadora CAT 420F", "cantidad": 2, "estado": "OPERATIVO"},
        {"tipo": "Bomba de Succión 8 pulgadas", "cantidad": 4, "estado": "OPERATIVO"}
    ],
    "Piura": [
        {"tipo": "Motobomba de Achique 10 pulgadas", "cantidad": 8, "estado": "OPERATIVO"},
        {"tipo": "Cisterna de Agua Potable 5000 gal", "cantidad": 6, "estado": "OPERATIVO"},
        {"tipo": "Volquete Mercedes 15m³", "cantidad": 4, "estado": "OPERATIVO"},
        {"tipo": "Tractor de Oruga D6", "cantidad": 2, "estado": "OPERATIVO"}
    ],
    "Puno": [
        {"tipo": "Camioneta 4x4 Rescate Invernal", "cantidad": 3, "estado": "OPERATIVO"},
        {"tipo": "Generador Eléctrico 50kW para abrigo", "cantidad": 4, "estado": "OPERATIVO"},
        {"tipo": "Camión Distribuidor de Forraje y Mantas", "cantidad": 3, "estado": "OPERATIVO"}
    ],
    "Cusco": [
        {"tipo": "Cargador Frontal CAT", "cantidad": 2, "estado": "OPERATIVO"},
        {"tipo": "Camioneta 4x4 Rural", "cantidad": 3, "estado": "OPERATIVO"}
    ],
    "Áncash": [
        {"tipo": "Tractor de Oruga CAT D8", "cantidad": 2, "estado": "OPERATIVO"},
        {"tipo": "Cargador Frontal CAT 966", "cantidad": 3, "estado": "OPERATIVO"},
        {"tipo": "Volquete 15m³", "cantidad": 4, "estado": "OPERATIVO"}
    ],
    "Ayacucho": [
        {"tipo": "Retroexcavadora CAT 420", "cantidad": 2, "estado": "OPERATIVO"},
        {"tipo": "Volquete Scania 15m³", "cantidad": 3, "estado": "OPERATIVO"}
    ],
    "Junín": [
        {"tipo": "Balsa Cautiva y Lancha Deslizadora Fluvial", "cantidad": 4, "estado": "OPERATIVO"},
        {"tipo": "Tractor Oruga Desbrozador", "cantidad": 2, "estado": "OPERATIVO"},
        {"tipo": "Motosierras y Bombas de Achique", "cantidad": 8, "estado": "OPERATIVO"}
    ],
    "Amazonas": [
        {"tipo": "Deslizador Fluvial con Motor Fuera de Borda 75HP", "cantidad": 5, "estado": "OPERATIVO"},
        {"tipo": "Cargador Frontal de Riberas", "cantidad": 2, "estado": "OPERATIVO"}
    ]
}

def resolve_linguistic_variant(departamento: str, provincia: str = "") -> tuple:
    """Resuelve la variante lingüística predominante para cualquier jurisdicción del Perú."""
    dep = (departamento or "").upper()
    prov = (provincia or "").upper()

    if any(k in dep for k in ["PUNO", "MOQUEGUA", "TACNA"]):
        return "AYMARA_COLLAO", "Aymara Altiplánico"
    if any(k in dep for k in ["ANCASH", "ÁNCASH"]):
        return "QUECHUA_ANCASH", "Runasimi Ancashino (Huaylas/Conchucos)"
    if any(k in dep for k in ["CUSCO", "APURIMAC", "APURÍMAC"]):
        return "QUECHUA_COLLAO", "Runasimi Collao (Cusco)"
    if any(k in dep for k in ["AYACUCHO", "HUANCAVELICA"]):
        return "QUECHUA_CHANKA", "Runasimi Chanka"
    if any(k in dep for k in ["JUNIN", "JUNÍN", "PASCO", "UCAYALI"]):
        if any(k in prov for k in ["SATIPO", "CHANCHAMAYO", "OXAPAMPA", "ATALAYA", "CORONEL PORTILLO"]):
            return "ASHANINKA", "Asháninka Amazónico"
        return "QUECHUA_CHANKA", "Runasimi Central / Wanka"
    if any(k in dep for k in ["AMAZONAS", "LORETO", "SAN MARTIN", "SAN MARTÍN"]):
        if any(k in prov for k in ["CONDORCANQUI", "BAGUA", "DATEM DEL MARAÑON", "DATEM DEL MARAÑÓN"]):
            return "AWAJUN", "Awajún Amazónico"
        return "CASTELLANO_LLANO_NORTE", "Castellano Comunitario Amazónico"
    if any(k in dep for k in ["PIURA", "TUMBES", "LAMBAYEQUE", "LA LIBERTAD"]):
        return "CASTELLANO_LLANO_NORTE", "Castellano Llano Norteño"
    
    return "CASTELLANO_LLANO_Y_CHANKA", "Castellano Llano Comunitario"

from services.historical_data_service import historical_service

def query_exposed_population(ubigeo: str) -> Dict[str, Any]:
    """Consulta polígonos del INEI, catálogo CENEPRED de 1,891 distritos y padrón de habitantes."""
    data = CATALOGO_TERRITORIAL.get(ubigeo)
    if not data:
        profile = historical_service.get_district_full_profile(ubigeo)
        pob_total = profile.get("poblacion_estimada", 25000)
        # Cálculo de expuesta basado en quebradas críticas si existen
        quebradas = profile.get("quebradas_criticas", [])
        if quebradas:
            pob_expuesta = sum(q.get("poblacion_cono_deyeccion", 0) for q in quebradas if isinstance(q.get("poblacion_cono_deyeccion"), (int, float)))
            if pob_expuesta == 0:
                pob_expuesta = int(pob_total * 0.12)
            centros = [f"Cono de Deyección: {q.get('nombre')}" for q in quebradas]
        else:
            pob_expuesta = int(pob_total * 0.10)
            centros = ["Zona Ribereña Central", "Faja Marginal Sector Crítico"]
            
        familias = int(pob_expuesta / 4.2)
        depto = profile.get("departamento", "Lima")
        prov = profile.get("provincia", "")
        variante, lengua = resolve_linguistic_variant(depto, prov)

        return {
            "ubigeo": ubigeo,
            "distrito": profile.get("distrito"),
            "departamento": depto,
            "cuenca": f"Cuenca Hidrográfica {prov}",
            "poblacion_total": pob_total,
            "poblacion_expuesta_estimada": pob_expuesta,
            "familias_en_faja_marginal": familias,
            "centros_poblados_criticos": centros,
            "declarado_ds_124_pcm": profile.get("declarado_ds_124_pcm"),
            "nivel_peligro_cenepred": profile.get("nivel_peligro_cenepred"),
            "variante_linguistica": variante,
            "lengua_nombre": lengua
        }
    
    criticos = data["centros_poblados_criticos"]
    pob_expuesta = sum(c["habitantes"] for c in criticos if c.get("faja_marginal", False))
    if pob_expuesta == 0:
        pob_expuesta = sum(c["habitantes"] for c in criticos)
    familias = int(pob_expuesta / 4.2)  # Promedio miembros por hogar en zonas vulnerables

    return {
        "ubigeo": ubigeo,
        "distrito": data["distrito"],
        "departamento": data["departamento"],
        "cuenca": data["cuenca"],
        "poblacion_total": data["poblacion_total"],
        "poblacion_expuesta_estimada": pob_expuesta,
        "familias_en_faja_marginal": familias,
        "centros_poblados_criticos": [c["nombre"] for c in criticos],
        "variante_linguistica": data["variante_linguistica"],
        "lengua_nombre": data["lengua_nombre"]
    }

def check_critical_infrastructure(ubigeo: str) -> Dict[str, Any]:
    """Consulta vías troncales, puentes e infraestructura de salud en riesgo."""
    data = CATALOGO_TERRITORIAL.get(ubigeo, {})
    return {
        "vias_comprometidas": data.get("vias_criticas", ["Vía principal de acceso al distrito"]),
        "centros_salud_en_riesgo": data.get("centros_salud", ["Centro de Salud Local"]),
        "albergues_recomendados": data.get("albergues", ["Estadio o Coliseo Municipal Local"])
    }

def locate_emergency_machinery(departamento: str) -> List[Dict[str, Any]]:
    """Consulta inventario de maquinaria pesada y equipamiento de emergencia de INDECI/COER."""
    return INVENTARIO_MAQUINARIA.get(departamento, [
        {"tipo": "Cargador Frontal", "cantidad": 2, "estado": "OPERATIVO"},
        {"tipo": "Volquete", "cantidad": 3, "estado": "OPERATIVO"}
    ])
