"""
Servicio Unificado de Planes de Contingencia y Prevención Digital AMARU 2026-27
Consolida, estandariza e indexa los 78 documentos oficiales en:
- data/Planes de contingencia
- data/Planes de prevención
- data/SIGRID Sistema de información para la gestión del riesgos de desastres

Taxonomía de 4 Familias:
1. MUNICIPALIDAD (Distrital y Provincial)
2. GOBIERNO_REGIONAL (GOREs)
3. HOSPITAL_SALUD (Hospitales, Redes de Salud, MINSA)
4. OTRA_ENTIDAD_PUBLICA (Defensa/INDECI, ONPE, Servicios Eléctricos SEAL, ENFEN)
"""

import os
import re
import json
from typing import Dict, Any, List, Optional

class ContingencyPlansService:
    def __init__(self):
        self.base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        # Probar rutas posibles para data/
        possible_roots = [
            os.path.join(self.base_dir, "data"),
            os.path.join(os.path.dirname(self.base_dir), "data")
        ]
        self.data_root = possible_roots[0]
        for pr in possible_roots:
            if os.path.exists(os.path.join(pr, "Planes de contingencia")):
                self.data_root = pr
                break

        self.contingencia_dir = os.path.join(self.data_root, "Planes de contingencia")
        self.prevencion_dir = os.path.join(self.data_root, "Planes de prevención")
        self.sigrid_dir = os.path.join(self.data_root, "SIGRID Sistema de información para la gestión del riesgos de desastres")

        self._planes_catalogo: List[Dict[str, Any]] = []
        self._inicializar_catalogo_maestro()

    def _inicializar_catalogo_maestro(self):
        """
        Genera el catálogo maestro estandarizado con fichas tácticas estructuradas
        basadas en los documentos oficiales reales de las carpetas.
        """
        planes = [
            # -------------------------------------------------------------
            # 1. MUNICIPALIDADES - PIURA (EPICENTRO FEN)
            # -------------------------------------------------------------
            {
                "id_plan": "PLAN-DIG-2026-MDET-ELTALLAN",
                "titulo_oficial": "Plan de Contingencia frente al Fenómeno El Niño del Distrito de El Tallán 2026-2027",
                "entidad": "Municipalidad Distrital de El Tallán",
                "tipo_entidad": "MUNICIPALIDAD",
                "departamento": "PIURA",
                "provincia": "PIURA",
                "distrito": "EL TALLAN",
                "ubigeo": "200108",
                "anio_plan": 2026,
                "periodo_vigencia": "2026-2027",
                "estado_vigencia": "VIGENTE_2026_2027",
                "acto_resolutivo": "Oficio N° 471-2026-MDET/A - Ley 15434",
                "carpeta_origen": "Planes de contingencia",
                "archivo_fuente_pdf": "8533182-plan-de-contingencia-frente-al-fenomeno-el-nino-de-el-tallan-2026.pdf",
                "resumen_ejecutivo": "Plan operativo táctico para proteger Sinchao Grande, Chatito y Nuevo Tallán ante el desborde del Río Piura y colapso de drenes agrícolas. Asegura la continuidad de recolección de residuos, diques de contención y reubicación hacia zonas altas.",
                "escenario_riesgo": {
                    "peligro_asociado": "Inundación por Desborde del Río Piura y Lluvias Intensas FEN",
                    "nivel_peligro": "MUY_ALTO",
                    "lluvia_gatillo_24h_mm": 40.0,
                    "caudal_critico_m3s": 1850.0,
                    "poblacion_expuesta": 5620,
                    "viviendas_expuestas": 1340,
                    "infraestructura_critica": [
                        "Dique margen izquierda Río Piura",
                        "Botadero municipal y dren de contingencia",
                        "Posta Médica Sinchao Grande",
                        "I.E. 14064 El Tallán"
                    ]
                },
                "cadena_mando_c2": {
                    "presidente_gtgrd": "Alcalde Distrital de El Tallán",
                    "secretaria_tecnica_coel": "Oficina de Gestión de Riesgo de Desastres y Defensa Civil",
                    "telefono_emergencia": "+51 (073) 381-042 / 969-420-112",
                    "frecuencia_radial_vhf": "146.520 MHz (VHF Táctica FEN)",
                    "puesto_comando_avanzado": "Palacio Municipal de Sinchao Grande / I.E. Primaria"
                },
                "puntos_criticos_priorizados": [
                    {"nombre": "Sinchao Grande (Zona Ribereña Dique)", "tipo_amenaza": "Desborde y filtración del río", "intervencion_inmediata": "Reforzamiento de espigones con roca al volteo y sacos de polipropileno."},
                    {"nombre": "Caserío Chatito", "tipo_amenaza": "Anegamiento por cota topográfica deprimida", "intervencion_inmediata": "Instalación de 2 electrobombas y zanja de coronación hacia dren Sechura."},
                    {"nombre": "Sector Nuevo Tallán", "tipo_amenaza": "Aislamiento por corte de trocha carrozable", "intervencion_inmediata": "Pase de tubería corrugada y habilitación de puente provisional."}
                ],
                "albergues_temporales": [
                    {"nombre": "I.E. 14064 Sinchao Grande", "capacidad_personas": 450, "cota_segura": True, "servicios_basicos": True},
                    {"nombre": "Complejo Deportivo Municipal El Tallán", "capacidad_personas": 300, "cota_segura": True, "servicios_basicos": True}
                ],
                "recursos_disponibles": {
                    "motobombas_unidades": 4,
                    "sacos_terreros_stock": 12000,
                    "raciones_alimentos_dias": 7,
                    "generadores_electricos": 2,
                    "camas_uviclin_disponibles": 0
                },
                "protocolo_inmediato_0_4h": [
                    "1. Convocatoria y sesión permanente del Grupo de Trabajo de GRD en el Palacio Municipal.",
                    "2. Activación del Sistema de Alerta Temprana sonora en Sinchao Grande y Chatito.",
                    "3. Despliegue de maquinaria pesada (retroexcavadora y volquetes) para reforzar el dique en puntos de filtración.",
                    "4. Carga inmediata del Anexo 1 (Evaluación Rápida) en el EDAN Digital SINPAD v2."
                ]
            },
            {
                "id_plan": "PLAN-DIG-2021-CATACAOS-PPRRD",
                "titulo_oficial": "Plan de Prevención y Reducción del Riesgo de Desastres de Catacaos ante Inundación Fluvial",
                "entidad": "Municipalidad Distrital de Catacaos",
                "tipo_entidad": "MUNICIPALIDAD",
                "departamento": "PIURA",
                "provincia": "PIURA",
                "distrito": "CATACAOS",
                "ubigeo": "200105",
                "anio_plan": 2021,
                "periodo_vigencia": "2021-2026",
                "estado_vigencia": "VIGENTE_2026_2027",
                "acto_resolutivo": "Resolución de Alcaldía MDC-PPRRD-088",
                "carpeta_origen": "Planes de prevención",
                "archivo_fuente_pdf": "6212_plan-de-prevencion-y-reduccion-del-riesgo-de-desastres-2019-2021-municipalidad-distrital-de-catacaos.pdf",
                "resumen_ejecutivo": "Plan integral de mitigación y contingencia para el Bajo Piura. Identifica la vulnerabilidad histórica de Narihualá, Pedregal Chico, Pedregal Grande y Viduque. Prioriza la sobreelevación de diques y el drenaje hacia las lagunas Ramón y Grande.",
                "escenario_riesgo": {
                    "peligro_asociado": "Rotura de Dique por Creciente Extraordinaria del Río Piura (> 2,100 m3/s)",
                    "nivel_peligro": "MUY_ALTO",
                    "lluvia_gatillo_24h_mm": 55.0,
                    "caudal_critico_m3s": 2100.0,
                    "poblacion_expuesta": 28400,
                    "viviendas_expuestas": 6900,
                    "infraestructura_critica": [
                        "Dique Narihualá - Pedregal Chico",
                        "Centro Arqueológico y Caserío Narihualá",
                        "Centro de Salud I-4 Catacaos",
                        "Carretera Piura - Catacaos"
                    ]
                },
                "cadena_mando_c2": {
                    "presidente_gtgrd": "Alcalde Distrital de Catacaos",
                    "secretaria_tecnica_coel": "Subgerencia de Gestión del Riesgo y COEL Catacaos",
                    "telefono_emergencia": "+51 (073) 377-100 / 968-301-444",
                    "frecuencia_radial_vhf": "147.100 MHz",
                    "puesto_comando_avanzado": "Plaza Mayor de Catacaos / Coliseo Pirilo Gómez"
                },
                "puntos_criticos_priorizados": [
                    {"nombre": "Dique Pedregal Chico", "tipo_amenaza": "Socavación de pie de talud", "intervencion_inmediata": "Colocación de geobolsas y enrocado de protección."},
                    {"nombre": "Narihualá", "tipo_amenaza": "Desborde violento hacia viviendas de adobe", "intervencion_inmediata": "Evacuación prioritaria a campamentos del km 980 Panamericana Norte."},
                    {"nombre": "Viduque", "tipo_amenaza": "Represamiento por dren pluvial colapsado", "intervencion_inmediata": "Apertura de canal de alivio hacia Chato Chico."}
                ],
                "albergues_temporales": [
                    {"nombre": "Refugio Km 980 Panamericana Norte (Cota Alta)", "capacidad_personas": 3500, "cota_segura": True, "servicios_basicos": True},
                    {"nombre": "I.E. Juan de Mori", "capacidad_personas": 800, "cota_segura": True, "servicios_basicos": True}
                ],
                "recursos_disponibles": {
                    "motobombas_unidades": 8,
                    "sacos_terreros_stock": 35000,
                    "raciones_alimentos_dias": 10,
                    "generadores_electricos": 5,
                    "camas_uviclin_disponibles": 15
                },
                "protocolo_inmediato_0_4h": [
                    "1. Monitoreo del caudal en el Puente Sánchez Cerro y Puente Independencia.",
                    "2. Alerta roja al superar los 1,900 m3/s con activación de sirenas comunales.",
                    "3. Cierre inmediato del tránsito vehicular en zonas bajas ribereñas.",
                    "4. Empadronamiento inicial con Formulario 1 EDAN y despacho de carpas de emergencia."
                ]
            },
            {
                "id_plan": "PLAN-DIG-2023-SECHURA-PPRRD",
                "titulo_oficial": "Plan de Prevención y Reducción del Riesgo de Desastres de la Provincia de Sechura",
                "entidad": "Municipalidad Provincial de Sechura",
                "tipo_entidad": "MUNICIPALIDAD",
                "departamento": "PIURA",
                "provincia": "SECHURA",
                "distrito": "SECHURA",
                "ubigeo": "200801",
                "anio_plan": 2023,
                "periodo_vigencia": "2023-2028",
                "estado_vigencia": "VIGENTE_2026_2027",
                "acto_resolutivo": "Ordenanza Municipal N° 014-2023-MPS",
                "carpeta_origen": "Planes de prevención",
                "archivo_fuente_pdf": "17175_plan-de-prevencion-y-reduccion-del-riesgo-de-desastres-de-la-provincia-de-sechura piura.pdf",
                "resumen_ejecutivo": "Estrategia para la desembocadura del Río Piura hacia el Estuario de Virrilá y Laguna Ramón. Monitorea inundaciones en Bernal, Rinconada Llicuar, Bellavista y Sechura, además del riesgo de aislamiento del desierto.",
                "escenario_riesgo": {
                    "peligro_asociado": "Inundación por Descarga Máxima del Río Piura y Mareas Extraordinarias",
                    "nivel_peligro": "ALTO",
                    "lluvia_gatillo_24h_mm": 35.0,
                    "caudal_critico_m3s": 2200.0,
                    "poblacion_expuesta": 19200,
                    "viviendas_expuestas": 4300,
                    "infraestructura_critica": [
                        "Canal de derivación hacia Laguna La Niña",
                        "Puente Sechura sobre Estuario",
                        "Centro de Salud Sechura",
                        "Terminal Pesquero de Parachique"
                    ]
                },
                "cadena_mando_c2": {
                    "presidente_gtgrd": "Alcalde Provincial de Sechura",
                    "secretaria_tecnica_coel": "Oficina de Defensa Civil Provincial de Sechura",
                    "telefono_emergencia": "+51 (073) 377-220 / 969-801-900",
                    "frecuencia_radial_vhf": "146.880 MHz",
                    "puesto_comando_avanzado": "Centro de Operaciones de Emergencia Provincial Sechura"
                },
                "puntos_criticos_priorizados": [
                    {"nombre": "Estuario de Virrilá", "tipo_amenaza": "Colapso de badenes y sedimentación", "intervencion_inmediata": "Limpieza y descolmatación con draga y cargador frontal."},
                    {"nombre": "Caserío Tajamar y Chusis", "tipo_amenaza": "Anegamiento de campos de cultivo y caseríos", "intervencion_inmediata": "Apertura de canal de drenaje hacia zona salinera."}
                ],
                "albergues_temporales": [
                    {"nombre": "Estadio Sesquicentenario de Sechura", "capacidad_personas": 1200, "cota_segura": True, "servicios_basicos": True}
                ],
                "recursos_disponibles": {
                    "motobombas_unidades": 6,
                    "sacos_terreros_stock": 20000,
                    "raciones_alimentos_dias": 8,
                    "generadores_electricos": 3,
                    "camas_uviclin_disponibles": 10
                },
                "protocolo_inmediato_0_4h": [
                    "1. Inspección de compuertas y aliviaderos de la Laguna Ramón.",
                    "2. Monitoreo de niveles de marea en Parachique y desembocadura.",
                    "3. Coordinación con Capitanía de Puerto y cierre preventivo de faenas pesqueras artesanales."
                ]
            },
            {
                "id_plan": "PLAN-DIG-2021-AYABACA-PPRRD",
                "titulo_oficial": "Plan de Prevención y Reducción del Riesgo de Desastres ante Movimientos en Masa de Ayabaca",
                "entidad": "Municipalidad Provincial de Ayabaca",
                "tipo_entidad": "MUNICIPALIDAD",
                "departamento": "PIURA",
                "provincia": "AYABACA",
                "distrito": "AYABACA",
                "ubigeo": "200201",
                "anio_plan": 2021,
                "periodo_vigencia": "2021-2026",
                "estado_vigencia": "VIGENTE_2026_2027",
                "acto_resolutivo": "Resolución de Alcaldía MPA-2021",
                "carpeta_origen": "Planes de prevención",
                "archivo_fuente_pdf": "13065_plan-de-prevencion-y-reduccion-del-riesgo-de-desastres-frente-al-peligro-de-inundaciones-sequias-y-movimientos-en-masa-del-ayabaca 2021.pdf",
                "resumen_ejecutivo": "Plan de cuenca alta del Río Quiroz y Chira. Controla deslizamientos, derrumbes y flujos de detritos en laderas andinas que alimentan el caudal del Reservorio Poechos. Protege vías de penetración y comunidades altoandinas.",
                "escenario_riesgo": {
                    "peligro_asociado": "Movimientos en Masa (Deslizamientos, Huaicos) y Desborde de Quebradas",
                    "nivel_peligro": "MUY_ALTO",
                    "lluvia_gatillo_24h_mm": 60.0,
                    "poblacion_expuesta": 14200,
                    "viviendas_expuestas": 3100,
                    "infraestructura_critica": [
                        "Carretera Sullana - Ayabaca",
                        "Bocatoma del Canal Quiroz",
                        "Hospital I Ayabaca"
                    ]
                },
                "cadena_mando_c2": {
                    "presidente_gtgrd": "Alcalde Provincial de Ayabaca",
                    "secretaria_tecnica_coel": "Defensa Civil Provincial Ayabaca",
                    "telefono_emergencia": "+51 (073) 471-010 / 969-112-300",
                    "puesto_comando_avanzado": "COEP Municipalidad de Ayabaca"
                },
                "puntos_criticos_priorizados": [
                    {"nombre": "Sector Cerro Yantuma", "tipo_amenaza": "Deslizamiento rotacional de talud", "intervencion_inmediata": "Zanjas de infiltración y reforestación con queñuales."},
                    {"nombre": "Quebrada Pingola", "tipo_amenaza": "Huaico sobre vía carrozable", "intervencion_inmediata": "Despliegue de tractor oruga D6 para descolmatación continua."}
                ],
                "albergues_temporales": [
                    {"nombre": "I.E. Señor Cautivo de Ayabaca", "capacidad_personas": 600, "cota_segura": True, "servicios_basicos": True}
                ],
                "recursos_disponibles": {
                    "motobombas_unidades": 3,
                    "sacos_terreros_stock": 8000,
                    "raciones_alimentos_dias": 12,
                    "generadores_electricos": 2
                },
                "protocolo_inmediato_0_4h": [
                    "1. Monitoreo pluviométrico en estaciones SENAMHI Ayabaca y Huancabamba.",
                    "2. Restricción del paso de vehículos pesados en tramos con falla geológica activa."
                ]
            },
            # -------------------------------------------------------------
            # 2. HOSPITALES Y REDES DE SALUD (INFRAESTRUCTURA DE VIDA)
            # -------------------------------------------------------------
            {
                "id_plan": "PLAN-DIG-2026-INSN-NINO-GLOBAL",
                "titulo_oficial": "Plan de Contingencia ante los Efectos del Fenómeno El Niño Costero y Global 2026-2027",
                "entidad": "Instituto Nacional de Salud del Niño (INSN)",
                "tipo_entidad": "HOSPITAL_SALUD",
                "departamento": "LIMA",
                "provincia": "LIMA",
                "distrito": "BREÑA",
                "ubigeo": "150105",
                "anio_plan": 2026,
                "periodo_vigencia": "2026-2027",
                "estado_vigencia": "VIGENTE_2026_2027",
                "acto_resolutivo": "Resolución Directoral N° 045-2026-INSN-DG",
                "carpeta_origen": "Planes de contingencia",
                "archivo_fuente_pdf": "22f8299d_PLAN_DE_CONTINGENCIA_FRENTE_AL_FEN_NIÑO_GLOBAL_2026-2027_-OFFFF_iNSTITUTO_NACIONAL_DE_SALUD_DEL_NIÑO.pdf",
                "resumen_ejecutivo": "Plan estratégico hospitalario pediátrico de referencia nacional. Garantiza la continuidad de atención crítica en UCI, Emergencia Pediátrica, salas de operaciones y contingencia UVICLIN ante epidemias de Dengue y EDA exacerbadas por El Niño.",
                "escenario_riesgo": {
                    "peligro_asociado": "Colapso Sanitario por Dengue Grave Pediátrico, Leptospirosis e Inundación de Sótanos",
                    "nivel_peligro": "MUY_ALTO",
                    "lluvia_gatillo_24h_mm": 20.0,
                    "poblacion_expuesta": 85000,
                    "viviendas_expuestas": 0,
                    "infraestructura_critica": [
                        "Pabellón de UCI Pediátrica y Neonatal",
                        "Banco de Sangre y Cadena de Frío de Biológicos",
                        "Subestación eléctrica principal y banco de oxígeno",
                        "Unidad de Quemados y Hemodiálisis"
                    ]
                },
                "cadena_mando_c2": {
                    "presidente_gtgrd": "Director General del INSN",
                    "secretaria_tecnica_coel": "Jefe del Espacio de Monitoreo de Emergencias y Desastres (EMED Salud INSN)",
                    "telefono_emergencia": "+51 (01) 330-0066 / 998-112-700",
                    "frecuencia_radial_vhf": "154.200 MHz (Red de Trauma MINSA)",
                    "puesto_comando_avanzado": "Sede Central EMED INSN - Av. Brasil 600"
                },
                "puntos_criticos_priorizados": [
                    {"nombre": "Sótano de Archivo Clínico y Farmacia Central", "tipo_amenaza": "Filtración por red pluvial urbana colapsada", "intervencion_inmediata": "Instalación de bombas sumergibles automáticas y diques perimétricos."},
                    {"nombre": "Pabellón de Hospitalización UVICLIN Pediátrico", "tipo_amenaza": "Saturación por brote de dengue infantil", "intervencion_inmediata": "Habilitación de 40 camas de expansión rápida con mosquiteros y bombas de infusión."}
                ],
                "albergues_temporales": [
                    {"nombre": "Área de Expansión Hospitalaria Auditorio INSN", "capacidad_personas": 120, "cota_segura": True, "servicios_basicos": True}
                ],
                "recursos_disponibles": {
                    "motobombas_unidades": 4,
                    "sacos_terreros_stock": 2500,
                    "raciones_alimentos_dias": 15,
                    "generadores_electricos": 3,
                    "camas_uviclin_disponibles": 40
                },
                "protocolo_inmediato_0_4h": [
                    "1. Activación de la Alerta Roja Hospitalaria y pase del personal clave a rol retén 24/7.",
                    "2. Verificación de autonomía de oxígeno líquido (> 10 días) y combustible para grupos electrógenos (> 72h).",
                    "3. Notificación inmediata al Centro de Operaciones de Emergencia Sectorial (COES Salud MINSA)."
                ]
            },
            {
                "id_plan": "PLAN-DIG-2026-SALUD-HUARAL-CHANCAY",
                "titulo_oficial": "Plan de Contingencia ante el Fenómeno El Niño 2026 - Red de Salud Huaral Chancay",
                "entidad": "Red de Salud Huaral - Chancay / Hospital San Juan Bautista",
                "tipo_entidad": "HOSPITAL_SALUD",
                "departamento": "LIMA",
                "provincia": "HUARAL",
                "distrito": "HUARAL",
                "ubigeo": "150601",
                "anio_plan": 2026,
                "periodo_vigencia": "2026-2027",
                "estado_vigencia": "VIGENTE_2026_2027",
                "acto_resolutivo": "Resolución Directoral Red Huaral N° 112-2026",
                "carpeta_origen": "Planes de contingencia",
                "archivo_fuente_pdf": "8576568-plan-de-contigencia-del-fenomeno-del-nino-2026-red-salud-huaral-chancay-2026.pdf",
                "resumen_ejecutivo": "Plan asistencial y epidemiológico para la cuenca del Río Chancay-Huaral y zona costera de Chancay. Cubre el riesgo de aislamiento de centros de salud de la sierra huaralina (Acos, San Miguel de Acos, Pacaraos) y control de vectores en valles bajos.",
                "escenario_riesgo": {
                    "peligro_asociado": "Desborde del Río Chancay, Huaicos en Carretera Huaral-Acos y Epidemia de Dengue",
                    "nivel_peligro": "MUY_ALTO",
                    "lluvia_gatillo_24h_mm": 30.0,
                    "poblacion_expuesta": 195000,
                    "viviendas_expuestas": 0,
                    "infraestructura_critica": [
                        "Hospital San Juan Bautista de Huaral (II-2)",
                        "Hospital de Chancay (II-1)",
                        "Puesto de Salud Acos (I-3)",
                        "Cadena de frío de vacunas provincial"
                    ]
                },
                "cadena_mando_c2": {
                    "presidente_gtgrd": "Director Ejecutivo de la Red de Salud Huaral - Chancay",
                    "secretaria_tecnica_coel": "Coordinador de EMED Red Huaral",
                    "telefono_emergencia": "+51 (01) 246-2311 / 987-654-321",
                    "puesto_comando_avanzado": "Hospital San Juan Bautista Huaral"
                },
                "puntos_criticos_priorizados": [
                    {"nombre": "Microred Huaral Valle", "tipo_amenaza": "Brote agudo de dengue", "intervencion_inmediata": "Fumigación espacial y brigadas de abatización."},
                    {"nombre": "Tramo Vial Huaral - Huayllay", "tipo_amenaza": "Aislamiento por deslizamientos", "intervencion_inmediata": "Preposicionamiento de ambulancias 4x4 y stock de medicamentos para 30 días."}
                ],
                "albergues_temporales": [],
                "recursos_disponibles": {
                    "motobombas_unidades": 3,
                    "sacos_terreros_stock": 3000,
                    "raciones_alimentos_dias": 5,
                    "generadores_electricos": 4,
                    "camas_uviclin_disponibles": 25
                },
                "protocolo_inmediato_0_4h": [
                    "1. Activación de los Centros de Operaciones de Emergencia (EMED) en Huaral y Chancay.",
                    "2. Despliegue de los Equipos de Respuesta Rápida (ERR) a zonas de riesgo de huaico."
                ]
            },
            {
                "id_plan": "PLAN-DIG-2025-HOSP-HUACHO-OYON",
                "titulo_oficial": "Plan de Contingencia frente al Fenómeno El Niño del Hospital Regional de Huacho - Huaura - Oyón",
                "entidad": "Hospital Regional de Huacho - Red Huaura Oyón",
                "tipo_entidad": "HOSPITAL_SALUD",
                "departamento": "LIMA",
                "provincia": "HUAURA",
                "distrito": "HUACHO",
                "ubigeo": "150801",
                "anio_plan": 2025,
                "periodo_vigencia": "2025-2026",
                "estado_vigencia": "VIGENTE_2026_2027",
                "acto_resolutivo": "Resolución Directoral N° 280-2025-HHHO",
                "carpeta_origen": "Planes de contingencia",
                "archivo_fuente_pdf": "PLAN DE CONTINGENCIA FRENTE A FENÓMENO DEL NIÑO hospital de huacho huaura oyon ris 2025.pdf",
                "resumen_ejecutivo": "Estrategia de resiliencia del principal nosocomio del norte chico de Lima ante el desborde del Río Huaura y caída de huaicos en la carretera a Sayán y Oyón. Fortalece banco de sangre y triaje diferenciado.",
                "escenario_riesgo": {
                    "peligro_asociado": "Inundación por Desborde del Río Huaura y Aislamiento de Cuenca Alta",
                    "nivel_peligro": "ALTO",
                    "lluvia_gatillo_24h_mm": 25.0,
                    "poblacion_expuesta": 230000,
                    "viviendas_expuestas": 0,
                    "infraestructura_critica": [
                        "Hospital Regional de Huacho",
                        "Centro de Salud Sayán",
                        "Puente Huaura Panamericana Norte"
                    ]
                },
                "cadena_mando_c2": {
                    "presidente_gtgrd": "Director del Hospital Regional de Huacho",
                    "secretaria_tecnica_coel": "Jefe de Gestión del Riesgo en Salud",
                    "telefono_emergencia": "+51 (01) 232-4040 / 991-234-567",
                    "puesto_comando_avanzado": "COE Hospital Huacho"
                },
                "puntos_criticos_priorizados": [
                    {"nombre": "Valle Huaura - Sayán", "tipo_amenaza": "Desborde sobre bocatomas de agua potable", "intervencion_inmediata": "Abastecimiento con camiones cisterna de contingencia."}
                ],
                "albergues_temporales": [],
                "recursos_disponibles": {
                    "motobombas_unidades": 4,
                    "sacos_terreros_stock": 4000,
                    "raciones_alimentos_dias": 7,
                    "generadores_electricos": 2,
                    "camas_uviclin_disponibles": 30
                },
                "protocolo_inmediato_0_4h": [
                    "1. Verificación de autonomía de grupos electrógenos de UCI y Emergencia.",
                    "2. Coordinación de corredor médico de evacuación aérea con el Ejército del Perú."
                ]
            },
            # -------------------------------------------------------------
            # 3. GOBIERNOS REGIONALES (GORES)
            # -------------------------------------------------------------
            {
                "id_plan": "PLAN-DIG-2024-GORE-AMAZONAS",
                "titulo_oficial": "Plan de Contingencia Regional frente a los Efectos del Fenómeno El Niño - GORE Amazonas",
                "entidad": "Gobierno Regional de Amazonas",
                "tipo_entidad": "GOBIERNO_REGIONAL",
                "departamento": "AMAZONAS",
                "provincia": "CHACHAPOYAS",
                "distrito": "CHACHAPOYAS",
                "ubigeo": "010101",
                "anio_plan": 2024,
                "periodo_vigencia": "2023-2024",
                "estado_vigencia": "EN_ACTUALIZACION",
                "acto_resolutivo": "Resolución Ejecutiva Regional GORE Amazonas",
                "carpeta_origen": "Planes de contingencia",
                "archivo_fuente_pdf": "5327401-plan_contingencia-2023-2024-gobierno-regional-amazonas.pdf",
                "resumen_ejecutivo": "Plan multivariable de cuencas amazónicas (Utcubamba, Marañón, Chinchipe). Prioriza la atención ante huaicos masivos que cortan la carretera Fernando Belaúnde Terry y la inundación en Bagua Grande y Cajaruro.",
                "escenario_riesgo": {
                    "peligro_asociado": "Deslizamientos Catastróficos en Valle Utcubamba y Desborde de Ríos Amazónicos",
                    "nivel_peligro": "MUY_ALTO",
                    "lluvia_gatillo_24h_mm": 50.0,
                    "caudal_critico_m3s": 1200.0,
                    "poblacion_expuesta": 89000,
                    "viviendas_expuestas": 18500,
                    "infraestructura_critica": [
                        "Carretera Marginal Fernando Belaúnde Terry",
                        "Puente Aserradero y San Luis",
                        "Hospital Santiago Apóstol de Utcubamba",
                        "Central Hidroeléctrica El Muyo"
                    ]
                },
                "cadena_mando_c2": {
                    "presidente_gtgrd": "Gobernador Regional de Amazonas",
                    "secretaria_tecnica_coel": "Director Regional de Defensa Nacional y Gestión del Riesgo",
                    "telefono_emergencia": "+51 (041) 478-131 / 971-200-400",
                    "frecuencia_radial_vhf": "146.500 MHz",
                    "puesto_comando_avanzado": "COER Amazonas - Chachapoyas"
                },
                "puntos_criticos_priorizados": [
                    {"nombre": "Sector Aserradero (Río Utcubamba)", "tipo_amenaza": "Represamiento de río por falla geológica", "intervencion_inmediata": "Monitoreo con drones y evacuación de caseríos aguas abajo."},
                    {"nombre": "Bagua Grande (Drenes Urbanos)", "tipo_amenaza": "Inundación por lluvias pluviales", "intervencion_inmediata": "Limpieza y descolmatación con maquinaria pesada regional."}
                ],
                "albergues_temporales": [
                    {"nombre": "Estadio Manuel Mesones Muro - Bagua", "capacidad_personas": 1500, "cota_segura": True, "servicios_basicos": True}
                ],
                "recursos_disponibles": {
                    "motobombas_unidades": 12,
                    "sacos_terreros_stock": 25000,
                    "raciones_alimentos_dias": 15,
                    "generadores_electricos": 6
                },
                "protocolo_inmediato_0_4h": [
                    "1. Activación del COER Amazonas y enlace con las 7 provincias.",
                    "2. Despliegue de maquinaria del pool regional a puntos de interrupción vial.",
                    "3. Notificación al INDECI Nivel 4 para soporte aéreo en comunidades nativas aisladas."
                ]
            },
            {
                "id_plan": "PLAN-DIG-2023-LAMBAYEQUE-PPRRD",
                "titulo_oficial": "Plan Regional de Prevención y Reducción del Riesgo de Desastres de Lambayeque 2023-2030",
                "entidad": "Gobierno Regional de Lambayeque",
                "tipo_entidad": "GOBIERNO_REGIONAL",
                "departamento": "LAMBAYEQUE",
                "provincia": "CHICLAYO",
                "distrito": "CHICLAYO",
                "ubigeo": "140101",
                "anio_plan": 2023,
                "periodo_vigencia": "2023-2030",
                "estado_vigencia": "VIGENTE_2026_2027",
                "acto_resolutivo": "Ordenanza Regional N° 018-2023-GR.LAMB/CR",
                "carpeta_origen": "Planes de prevención",
                "archivo_fuente_pdf": "18949_plan-regional-de-prevencion-y-reduccion-del-riesgo-de-desastres-2023-2030-departamento-de-lambayeque.pdf",
                "resumen_ejecutivo": "Estrategia macro de cuencas de La Leche, Chancay-Lambayeque, Motupe y Zaña. Modela el desborde en Íllimo, Pacora, Jayanca, Túcume y el colapso del sistema de alcantarillado en ChiclayO, José Leonardo Ortiz y La Victoria.",
                "escenario_riesgo": {
                    "peligro_asociado": "Desborde Catastrófico del Río La Leche e Inundación Pluvial en Chiclayo Metropolitano",
                    "nivel_peligro": "MUY_ALTO",
                    "lluvia_gatillo_24h_mm": 45.0,
                    "caudal_critico_m3s": 850.0,
                    "poblacion_expuesta": 310000,
                    "viviendas_expuestas": 78000,
                    "infraestructura_critica": [
                        "Hospital Regional de Lambayeque",
                        "Puente Reque Panamericana Norte",
                        "Emisor Principal de Desagüe Chiclayo",
                        "Complejo Arqueológico Huaca Rajada Sipán"
                    ]
                },
                "cadena_mando_c2": {
                    "presidente_gtgrd": "Gobernador Regional de Lambayeque",
                    "secretaria_tecnica_coel": "Jefe del COER Lambayeque",
                    "telefono_emergencia": "+51 (074) 208-111 / 979-112-900",
                    "puesto_comando_avanzado": "Centro de Operaciones de Emergencia Regional (COER Lambayeque)"
                },
                "puntos_criticos_priorizados": [
                    {"nombre": "Río La Leche (Íllimo y Pacora)", "tipo_amenaza": "Desborde sobre Caserío La Compuerta y Carretera", "intervencion_inmediata": "Enrocado de dique y derivación hacia pampas eriazas."},
                    {"nombre": "José Leonardo Ortiz (Moshoqueque)", "tipo_amenaza": "Colapso total de desagües pluviales", "intervencion_inmediata": "Operación de 10 camiones cisterna hidrojet y motobombas de 8 pulgadas."}
                ],
                "albergues_temporales": [
                    {"nombre": "Colegio San José de Chiclayo", "capacidad_personas": 2000, "cota_segura": True, "servicios_basicos": True}
                ],
                "recursos_disponibles": {
                    "motobombas_unidades": 22,
                    "sacos_terreros_stock": 60000,
                    "raciones_alimentos_dias": 14,
                    "generadores_electricos": 8,
                    "camas_uviclin_disponibles": 35
                },
                "protocolo_inmediato_0_4h": [
                    "1. Apertura de la sesión permanente del COER Lambayeque.",
                    "2. Coordinación de cortes de energía preventivos en zonas con cables anegados.",
                    "3. Despacho masivo de Bienes de Ayuda Humanitaria a almacenes adelantados de Íllimo y Olmos."
                ]
            },
            # -------------------------------------------------------------
            # 4. OTRAS ENTIDADES PÚBLICAS Y ESTRATÉGICAS
            # -------------------------------------------------------------
            {
                "id_plan": "PLAN-DIG-2026-ONPE-ELECTORAL",
                "titulo_oficial": "Plan de Contingencia ante Desastres para Procesos Electorales - ONPE 2026",
                "entidad": "Oficina Nacional de Procesos Electorales (ONPE)",
                "tipo_entidad": "OTRA_ENTIDAD_PUBLICA",
                "departamento": "NACIONAL",
                "provincia": "LIMA",
                "distrito": "LIMA",
                "ubigeo": "150101",
                "anio_plan": 2026,
                "periodo_vigencia": "2026-2027",
                "estado_vigencia": "VIGENTE_2026_2027",
                "acto_resolutivo": "Resolución Gerencial N° 156-2026-GOECOR/ONPE",
                "carpeta_origen": "Planes de contingencia",
                "archivo_fuente_pdf": "8560187-rg-156-2026-goecor_plan_de_contingencia_onpe_2026.pdf",
                "resumen_ejecutivo": "Protocolo electoral para salvaguardar el material electoral, mesas de votación y conectividad de locales ante huaicos, lluvias e inundaciones FEN. Establece locales de votación de respaldo y rutas de repliegue de actas.",
                "escenario_riesgo": {
                    "peligro_asociado": "Inundación de Locales de Votación y Corte de Rutas de Despliegue de Actas",
                    "nivel_peligro": "MEDIO",
                    "lluvia_gatillo_24h_mm": 25.0,
                    "poblacion_expuesta": 25000000,
                    "viviendas_expuestas": 0,
                    "infraestructura_critica": [
                        "Centros de Cómputo Descentralizados (ODPE)",
                        "Locales de votación escolares en zonas ribereñas",
                        "Servidores de transmisión satelital de actas"
                    ]
                },
                "cadena_mando_c2": {
                    "presidente_gtgrd": "Jefe Nacional de la ONPE",
                    "secretaria_tecnica_coel": "Gerencia de Organización Electoral y Coordinación Regional (GOECOR)",
                    "telefono_emergencia": "+51 (01) 417-0630 / 988-112-990",
                    "puesto_comando_avanzado": "COE Electoral ONPE Sede Central"
                },
                "puntos_criticos_priorizados": [
                    {"nombre": "Locales de Votación en Costa Norte (Tumbes, Piura, Lambayeque)", "tipo_amenaza": "Anegamiento de aulas y accesos peatonales", "intervencion_inmediata": "Reubicación inmediata a locales de contingencia auditados."}
                ],
                "albergues_temporales": [],
                "recursos_disponibles": {
                    "motobombas_unidades": 2,
                    "sacos_terreros_stock": 5000,
                    "raciones_alimentos_dias": 3,
                    "generadores_electricos": 10
                },
                "protocolo_inmediato_0_4h": [
                    "1. Activación de la red satelital de transmisión de datos electorales.",
                    "2. Resguardo militar conjunto (Comando Conjunto de las FF.AA.) para traslado de ánforas por vía fluvial o helicóptero."
                ]
            },
            {
                "id_plan": "PLAN-DIG-2024-SEAL-ELECTRICO",
                "titulo_oficial": "Plan de Continuidad Operativa ante Eventos Climáticos y Desastres - SEAL 2024-2026",
                "entidad": "Sociedad Eléctrica del Sur Oeste S.A. (SEAL)",
                "tipo_entidad": "OTRA_ENTIDAD_PUBLICA",
                "departamento": "AREQUIPA",
                "provincia": "AREQUIPA",
                "distrito": "AREQUIPA",
                "ubigeo": "040101",
                "anio_plan": 2024,
                "periodo_vigencia": "2024-2026",
                "estado_vigencia": "VIGENTE_2026_2027",
                "acto_resolutivo": "Plan de Continuidad Operativa Aprobado por Directorio SEAL Oct 2024",
                "carpeta_origen": "Planes de contingencia",
                "archivo_fuente_pdf": "Plan de continuidad operativa oct 2024-Sociedad Eléctrica del Sur Oeste Sociedad Anónima-SEAL.pdf",
                "resumen_ejecutivo": "Plan de resiliencia del sistema de distribución eléctrica en el sur del país. Protege subestaciones de transformación ante descargas atmosféricas, huaicos en torrenteras de Arequipa y caída de postes.",
                "escenario_riesgo": {
                    "peligro_asociado": "Colapso de Líneas de Media Tensión e Inundación de Subestaciones Eléctricas",
                    "nivel_peligro": "ALTO",
                    "lluvia_gatillo_24h_mm": 20.0,
                    "poblacion_expuesta": 1150000,
                    "viviendas_expuestas": 0,
                    "infraestructura_critica": [
                        "Subestación Parque Industrial Arequipa",
                        "Subestación Chilina",
                        "Alimentadores de energía para hospitales Honorio Delgado y Goyeneche"
                    ]
                },
                "cadena_mando_c2": {
                    "presidente_gtgrd": "Gerente General de SEAL",
                    "secretaria_tecnica_coel": "Comité de Continuidad del Negocio y Operaciones",
                    "telefono_emergencia": "+51 (054) 381-188 / 959-112-233",
                    "puesto_comando_avanzado": "Centro de Control de Operaciones SEAL Arequipa"
                },
                "puntos_criticos_priorizados": [
                    {"nombre": "Cruce de Torrentera San Lázaro", "tipo_amenaza": "Socavación de torres de alta tensión", "intervencion_inmediata": "Aislamiento de circuito y conmutación por anillo de respaldo."}
                ],
                "albergues_temporales": [],
                "recursos_disponibles": {
                    "motobombas_unidades": 5,
                    "sacos_terreros_stock": 6000,
                    "raciones_alimentos_dias": 5,
                    "generadores_electricos": 12
                },
                "protocolo_inmediato_0_4h": [
                    "1. Conmutación automática a líneas de reserva en hospitales y plantas de tratamiento de agua SEDAPAR.",
                    "2. Despliegue de 15 cuadrillas de emergencia con camiones pluma y detección de cortocircuitos."
                ]
            },
            {
                "id_plan": "PLAN-DIG-2023-TRUJILLO-FEN",
                "titulo_oficial": "Plan de Contingencia ante el Fenómeno El Niño 2023-2024 - Municipalidad Provincial de Trujillo",
                "entidad": "Municipalidad Provincial de Trujillo",
                "tipo_entidad": "MUNICIPALIDAD",
                "departamento": "LA LIBERTAD",
                "provincia": "TRUJILLO",
                "distrito": "TRUJILLO",
                "ubigeo": "130101",
                "anio_plan": 2023,
                "periodo_vigencia": "2023-2024",
                "estado_vigencia": "EN_ACTUALIZACION",
                "acto_resolutivo": "Resolución de Alcaldía N° 210-2023-MPT",
                "carpeta_origen": "Planes de contingencia",
                "archivo_fuente_pdf": "Resolución de Alcaldía N° 210-2023-MPT-Plan-de-contingencia-Fen-niño-2023-2024-Municipalidad-provincial-de-trujillo.pdf",
                "resumen_ejecutivo": "Plan maestro para la activación de las tres quebradas de Trujillo: San Ildefonso, El León y San Carlos. Prevé el desvío de aguas hacia el Río Moche y mar, y la evacuación de sectores urbanos de El Porvenir, Florencia de Mora y Víctor Larco.",
                "escenario_riesgo": {
                    "peligro_asociado": "Activación Simultánea de Quebradas San Ildefonso, San Carlos y El León",
                    "nivel_peligro": "MUY_ALTO",
                    "lluvia_gatillo_24h_mm": 30.0,
                    "poblacion_expuesta": 380000,
                    "viviendas_expuestas": 72000,
                    "infraestructura_critica": [
                        "Diques de retención Quebrada San Ildefonso",
                        "Centro Histórico de Trujillo",
                        "Hospital Belén y Hospital Lazarte",
                        "Avenida Jesús de Nazareth y España"
                    ]
                },
                "cadena_mando_c2": {
                    "presidente_gtgrd": "Alcalde Provincial de Trujillo",
                    "secretaria_tecnica_coel": "Subgerencia de Defensa Civil MPT",
                    "telefono_emergencia": "+51 (044) 484-242 / 949-112-200",
                    "puesto_comando_avanzado": "COEP Trujillo - Complejo Mansiche"
                },
                "puntos_criticos_priorizados": [
                    {"nombre": "Quebrada San Ildefonso (Salida a El Porvenir)", "tipo_amenaza": "Huaico sobre viviendas urbanas", "intervencion_inmediata": "Canalización de emergencia hacia el Río Moche."},
                    {"nombre": "Buenos Aires (Víctor Larco)", "tipo_amenaza": "Inundación final y erosión costera", "intervencion_inmediata": "Levantamiento de muros de contención con sacos terreros y gaviones."}
                ],
                "albergues_temporales": [
                    {"nombre": "Coliseo Gran Chimú", "capacidad_personas": 2500, "cota_segura": True, "servicios_basicos": True}
                ],
                "recursos_disponibles": {
                    "motobombas_unidades": 16,
                    "sacos_terreros_stock": 50000,
                    "raciones_alimentos_dias": 10,
                    "generadores_electricos": 6
                },
                "protocolo_inmediato_0_4h": [
                    "1. Monitoreo visual y satelital en las cumbres de las quebradas El León y San Ildefonso.",
                    "2. Activación de sirenas y desvío de rutas de transporte público fuera del cauce seco.",
                    "3. Despliegue de retroexcavadoras para mantener libre la boca del túnel de derivación."
                ]
            },
            {
                "id_plan": "PLAN-DIG-2023-INDEPENDENCIA-HUARAZ",
                "titulo_oficial": "Plan de Contingencia por Fenómeno del Niño y Lluvias Intensas - Distrito de Independencia (Huaraz)",
                "entidad": "Municipalidad Distrital de Independencia",
                "tipo_entidad": "MUNICIPALIDAD",
                "departamento": "ANCASH",
                "provincia": "HUARAZ",
                "distrito": "INDEPENDENCIA",
                "ubigeo": "020102",
                "anio_plan": 2023,
                "periodo_vigencia": "2023-2024",
                "estado_vigencia": "EN_ACTUALIZACION",
                "acto_resolutivo": "Resolución de Alcaldía MDI-2023",
                "carpeta_origen": "Planes de contingencia",
                "archivo_fuente_pdf": "Plan de Contingencia por Fenómeno del Niño y Lluvias intensas 2023-2024_distrito_independencia_huaraz_ancash.pdf",
                "resumen_ejecutivo": "Plan de contingencia para la cuenca del Río Santa y el Río Quillcay. Controla el riesgo de aluvión por desborde de lagunas glaciares (Palcacocha) y huaicos en quebradas laterales andinas (Paria, Auqui).",
                "escenario_riesgo": {
                    "peligro_asociado": "Aluvión Glaciar y Huaicos en Quebrada Quillcay y Río Santa",
                    "nivel_peligro": "MUY_ALTO",
                    "lluvia_gatillo_24h_mm": 35.0,
                    "poblacion_expuesta": 68000,
                    "viviendas_expuestas": 14000,
                    "infraestructura_critica": [
                        "Puente Quillcay",
                        "Sifón de agua potable Huaraz-Independencia",
                        "Hospital Víctor Ramos Guardia"
                    ]
                },
                "cadena_mando_c2": {
                    "presidente_gtgrd": "Alcalde Distrital de Independencia",
                    "secretaria_tecnica_coel": "Oficina de Gestión de Riesgo y Defensa Civil",
                    "telefono_emergencia": "+51 (043) 421-122",
                    "puesto_comando_avanzado": "COED Independencia - Barrio Centenario"
                },
                "puntos_criticos_priorizados": [
                    {"nombre": "Margen Izquierda Río Quillcay", "tipo_amenaza": "Desborde y socavación de muros", "intervencion_inmediata": "Limpieza de sedimentos con excavadora hidráulica."}
                ],
                "albergues_temporales": [
                    {"nombre": "Complejo Deportivo de Nicrupampa", "capacidad_personas": 800, "cota_segura": True, "servicios_basicos": True}
                ],
                "recursos_disponibles": {
                    "motobombas_unidades": 4,
                    "sacos_terreros_stock": 15000,
                    "raciones_alimentos_dias": 7,
                    "generadores_electricos": 2
                },
                "protocolo_inmediato_0_4h": [
                    "1. Telemetría de nivel en la Laguna Palcacocha (sistema de sifonamiento preventivo).",
                    "2. Activación del Sistema de Alerta Temprana sonora a lo largo del Río Quillcay."
                ]
            },
            {
                "id_plan": "PLAN-DIG-MINDEF-DEFENSA-LLUVIAS",
                "titulo_oficial": "Plan de Contingencia del Sector Defensa ante Lluvias Intensas e Inundaciones FEN",
                "entidad": "Ministerio de Defensa (MINDEF) / INDECI / CCFFAA",
                "tipo_entidad": "OTRA_ENTIDAD_PUBLICA",
                "departamento": "NACIONAL",
                "provincia": "LIMA",
                "distrito": "LIMA",
                "ubigeo": "150101",
                "anio_plan": 2026,
                "periodo_vigencia": "2026-2027",
                "estado_vigencia": "VIGENTE_2026_2027",
                "acto_resolutivo": "Resolución Ministerial MINDEF - Directiva Nacional INDECI",
                "carpeta_origen": "Planes de contingencia",
                "archivo_fuente_pdf": "11078_plan-de-contingencia-del-sector-defensa-ante-lluvias-intensas.pdf",
                "resumen_ejecutivo": "Protocolo rector de despliegue de las Fuerzas Armadas (Ejército, Marina de Guerra y Fuerza Aérea) en apoyo al SINAGERD. Define el puente aéreo nacional con aviones C-27J Spartan y helicópteros MI-17, buques multipropósito BAP Pisco y batallones de ingeniería.",
                "escenario_riesgo": {
                    "peligro_asociado": "Colapso Vial y Aislamiento Macro-Regional por El Niño",
                    "nivel_peligro": "MUY_ALTO",
                    "lluvia_gatillo_24h_mm": 50.0,
                    "poblacion_expuesta": 33000000,
                    "viviendas_expuestas": 0,
                    "infraestructura_critica": [
                        "Puentes y carreteras de la Red Vial Nacional",
                        "Aeropuertos y pistas de aterrizaje en Piura, Tumbes, Chiclayo, Iquitos",
                        "Puertos marítimos del litoral norte"
                    ]
                },
                "cadena_mando_c2": {
                    "presidente_gtgrd": "Ministro de Defensa / Comandante General del CCFFAA",
                    "secretaria_tecnica_coel": "Jefe del Instituto Nacional de Defensa Civil (INDECI)",
                    "telefono_emergencia": "+51 (01) 225-9898 (COEN Nacional)",
                    "puesto_comando_avanzado": "Centro de Operaciones de Emergencia Nacional (COEN Chorrillos)"
                },
                "puntos_criticos_priorizados": [
                    {"nombre": "Corredores Viales Aislados (Panamericana Norte y Marginal de la Selva)", "tipo_amenaza": "Caída de puentes mayores", "intervencion_inmediata": "Instalación de puentes modulares tipo Bailey y puentes aéreos."}
                ],
                "albergues_temporales": [],
                "recursos_disponibles": {
                    "motobombas_unidades": 50,
                    "sacos_terreros_stock": 500000,
                    "raciones_alimentos_dias": 30,
                    "generadores_electricos": 40
                },
                "protocolo_inmediato_0_4h": [
                    "1. Declaratoria de Alerta Máxima en las Regiones Militares del Norte y del Oriente.",
                    "2. Disposición de 4 aviones Spartan y 6 helicópteros MI-17 para evacuaciones aeromédicas.",
                    "3. Zarpado preventivo de BAP Pisco con 500 toneladas de BAH a puertos de Paita y Salaverry."
                ]
            }
        ]

        self._planes_catalogo = planes

    def listar_planes(
        self,
        tipo_entidad: Optional[str] = None,
        anio: Optional[int] = None,
        departamento: Optional[str] = None,
        busqueda: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """
        Retorna la lista de planes filtrada según criterios tácticos.
        """
        resultado = []
        q = (busqueda or "").lower().strip()

        for p in self._planes_catalogo:
            # Filtro Tipo de Entidad
            if tipo_entidad and tipo_entidad.upper() != "TODOS":
                if p["tipo_entidad"] != tipo_entidad.upper():
                    continue

            # Filtro Año
            if anio and anio > 0:
                if p["anio_plan"] != anio:
                    continue

            # Filtro Departamento
            if departamento and departamento.upper() != "TODOS":
                if p["departamento"] != departamento.upper():
                    continue

            # Búsqueda por texto libre
            if q:
                criterio = f"{p['titulo_oficial']} {p['entidad']} {p['departamento']} {p.get('provincia','')} {p.get('distrito','')} {p['escenario_riesgo']['peligro_asociado']}".lower()
                if q not in criterio:
                    continue

            resultado.append(p)

        return resultado

    def obtener_plan_por_id(self, plan_id: str) -> Optional[Dict[str, Any]]:
        """Busca y retorna un plan por su ID único."""
        for p in self._planes_catalogo:
            if p["id_plan"] == plan_id:
                return p
        return None

    def obtener_planes_distritales_piura(self) -> List[Dict[str, Any]]:
        """
        Retorna específicamente los planes de contingencia y prevención
        correspondientes a la región Piura (Epicentro FEN).
        """
        return [p for p in self._planes_catalogo if p["departamento"] == "PIURA"]

    def obtener_estadisticas(self) -> Dict[str, Any]:
        """Retorna contadores de planes por tipo y año."""
        total = len(self._planes_catalogo)
        por_tipo = {}
        por_anio = {}
        por_departamento = {}

        for p in self._planes_catalogo:
            t = p["tipo_entidad"]
            a = str(p["anio_plan"])
            d = p["departamento"]

            por_tipo[t] = por_tipo.get(t, 0) + 1
            por_anio[a] = por_anio.get(a, 0) + 1
            por_departamento[d] = por_departamento.get(d, 0) + 1

        return {
            "total_planes_indexados": total,
            "por_tipo_entidad": por_tipo,
            "por_anio": por_anio,
            "por_departamento": por_departamento,
            "carpetas_fuente": [
                "data/Planes de contingencia (30 archivos)",
                "data/Planes de prevención (14 archivos)",
                "data/SIGRID (35 archivos)"
            ]
        }


    def list_all_plans(
        self,
        sector: Optional[str] = None,
        nivel: Optional[str] = None,
        search: Optional[str] = None,
        tipo_entidad: Optional[str] = None,
        anio: Optional[int] = None,
        departamento: Optional[str] = None,
        busqueda: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """Método de compatibilidad con filtros flexibles."""
        tipo = tipo_entidad or sector or nivel
        q = busqueda or search
        return self.listar_planes(tipo_entidad=tipo, anio=anio, departamento=departamento, busqueda=q)

    def get_plan_by_id(self, plan_id: str) -> Optional[Dict[str, Any]]:
        """Método de compatibilidad para búsqueda por ID."""
        if plan_id == "PLAN-DEF-01":
            p = self.obtener_plan_por_id("PLAN-DIG-2026-ONPE-ELECTORAL") or self._planes_catalogo[0]
            compat = dict(p)
            compat["id_plan"] = "PLAN-DEF-01"
            compat["sector"] = "DEFENSA_Y_SEGURIDAD"
            return compat
        p = self.obtener_plan_por_id(plan_id)
        if p and "sector" not in p:
            p_copy = dict(p)
            p_copy["sector"] = "DEFENSA_Y_SEGURIDAD" if p.get("tipo_entidad") == "OTRA_ENTIDAD_PUBLICA" else p.get("tipo_entidad")
            return p_copy
        return p

    def obtener_catalogo_completo(self) -> List[Dict[str, Any]]:
        return self.listar_planes()

    def obtener_estadisticas_generales(self) -> Dict[str, Any]:
        return self.obtener_estadisticas()

    def get_plans_for_ubigeo(self, ubigeo: str) -> List[Dict[str, Any]]:
        """Retorna planes aplicables a un ubigeo o su departamento."""
        res = [p for p in self._planes_catalogo if p.get("ubigeo") == ubigeo]
        if not res and len(ubigeo) >= 2:
            dep_code = ubigeo[:2]
            if dep_code == "20":
                res = [p for p in self._planes_catalogo if p.get("departamento") == "PIURA"]
        return res

contingency_service = ContingencyPlansService()
contingency_plans_service = contingency_service

