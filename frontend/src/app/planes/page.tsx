"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
    FileText,
    Building2,
    ShieldAlert,
    ShieldCheck,
    AlertTriangle,
    CheckCircle2,
    Users,
    Search,
    Printer,
    Download,
    Copy,
    Check,
    Scale,
    Waves,
    Clock,
    ChevronRight,
    MapPin,
    Phone,
    Home,
    Truck,
    Radio,
    Flame,
    Landmark,
    ExternalLink,
    Stethoscope,
    Zap,
    Filter,
    Layers,
    FileSpreadsheet,
    HelpCircle
} from "lucide-react";

// =====================================================================
// ESQUEMA DIGITAL UNIFICADO AMARU 2026-27 (ESTÁNDAR C2)
// =====================================================================

export interface PlanContingenciaDigital {
    id_plan: string;
    titulo_oficial: string;
    entidad: string;
    tipo_entidad: "MUNICIPALIDAD" | "GOBIERNO_REGIONAL" | "HOSPITAL_SALUD" | "OTRA_ENTIDAD_PUBLICA";
    departamento: string;
    provincia: string;
    distrito?: string;
    ubigeo?: string;
    anio_plan: number;
    periodo_vigencia: string;
    estado_vigencia: "VIGENTE_2026_2027" | "EN_ACTUALIZACION" | "REFERENCIAL_HISTORICO";
    acto_resolutivo: string;
    carpeta_origen: string;
    archivo_fuente_pdf: string;
    resumen_ejecutivo: string;
    escenario_riesgo: {
        peligro_asociado: string;
        nivel_peligro: "MUY_ALTO" | "ALTO" | "MEDIO";
        lluvia_gatillo_24h_mm: number;
        caudal_critico_m3s?: number;
        poblacion_expuesta: number;
        viviendas_expuestas: number;
        infraestructura_critica: string[];
    };
    cadena_mando_c2: {
        presidente_gtgrd: string;
        secretaria_tecnica_coel: string;
        telefono_emergencia: string;
        frecuencia_radial_vhf?: string;
        puesto_comando_avanzado: string;
    };
    puntos_criticos_priorizados: Array<{
        nombre: string;
        tipo_amenaza: string;
        intervencion_inmediata: string;
    }>;
    albergues_temporales: Array<{
        nombre: string;
        capacidad_personas: number;
        cota_segura: boolean;
        servicios_basicos: boolean;
    }>;
    recursos_disponibles: {
        motobombas_unidades: number;
        sacos_terreros_stock: number;
        raciones_alimentos_dias: number;
        generadores_electricos: number;
        camas_uviclin_disponibles?: number;
    };
    protocolo_inmediato_0_4h: string[];
}

// CATÁLOGO BASE CANÓNICO RESILIENTE (0 ms Latencia Offline + Sync Online)
const PLANES_CANONICOS_INICIALES: PlanContingenciaDigital[] = [
    {
        id_plan: "PLAN-DIG-2026-MDET-ELTALLAN",
        titulo_oficial: "Plan de Contingencia frente al Fenómeno El Niño del Distrito de El Tallán 2026-2027",
        entidad: "Municipalidad Distrital de El Tallán",
        tipo_entidad: "MUNICIPALIDAD",
        departamento: "PIURA",
        provincia: "PIURA",
        distrito: "EL TALLAN",
        ubigeo: "200108",
        anio_plan: 2026,
        periodo_vigencia: "2026-2027",
        estado_vigencia: "VIGENTE_2026_2027",
        acto_resolutivo: "Oficio N° 471-2026-MDET/A - Ley 15434",
        carpeta_origen: "Planes de contingencia",
        archivo_fuente_pdf: "8533182-plan-de-contingencia-frente-al-fenomeno-el-nino-de-el-tallan-2026.pdf",
        resumen_ejecutivo: "Plan operativo táctico para proteger Sinchao Grande, Chatito y Nuevo Tallán ante el desborde del Río Piura y colapso de drenes agrícolas. Asegura la continuidad de recolección de residuos, diques de contención y reubicación hacia zonas altas.",
        escenario_riesgo: {
            peligro_asociado: "Inundación por Desborde del Río Piura y Lluvias Intensas FEN",
            nivel_peligro: "MUY_ALTO",
            lluvia_gatillo_24h_mm: 40.0,
            caudal_critico_m3s: 1850.0,
            poblacion_expuesta: 5620,
            viviendas_expuestas: 1340,
            infraestructura_critica: [
                "Dique margen izquierda Río Piura",
                "Botadero municipal y dren de contingencia",
                "Posta Médica Sinchao Grande",
                "I.E. 14064 El Tallán"
            ]
        },
        cadena_mando_c2: {
            presidente_gtgrd: "Alcalde Distrital de El Tallán",
            secretaria_tecnica_coel: "Oficina de Gestión de Riesgo de Desastres y Defensa Civil",
            telefono_emergencia: "+51 (073) 381-042 / 969-420-112",
            frecuencia_radial_vhf: "146.520 MHz (VHF Táctica FEN)",
            puesto_comando_avanzado: "Palacio Municipal de Sinchao Grande / I.E. Primaria"
        },
        puntos_criticos_priorizados: [
            { nombre: "Sinchao Grande (Zona Ribereña Dique)", tipo_amenaza: "Desborde y filtración del río", intervencion_inmediata: "Reforzamiento de espigones con roca al volteo y sacos de polipropileno." },
            { nombre: "Caserío Chatito", tipo_amenaza: "Anegamiento por cota topográfica deprimida", intervencion_inmediata: "Instalación de 2 electrobombas y zanja de coronación hacia dren Sechura." },
            { nombre: "Sector Nuevo Tallán", tipo_amenaza: "Aislamiento por corte de trocha carrozable", intervencion_inmediata: "Pase de tubería corrugada y habilitación de puente provisional." }
        ],
        albergues_temporales: [
            { nombre: "I.E. 14064 Sinchao Grande", capacidad_personas: 450, cota_segura: true, servicios_basicos: true },
            { nombre: "Complejo Deportivo Municipal El Tallán", capacidad_personas: 300, cota_segura: true, servicios_basicos: true }
        ],
        recursos_disponibles: {
            motobombas_unidades: 4,
            sacos_terreros_stock: 12000,
            raciones_alimentos_dias: 7,
            generadores_electricos: 2,
            camas_uviclin_disponibles: 0
        },
        protocolo_inmediato_0_4h: [
            "1. Convocatoria y sesión permanente del Grupo de Trabajo de GRD en el Palacio Municipal.",
            "2. Activación del Sistema de Alerta Temprana sonora en Sinchao Grande y Chatito.",
            "3. Despliegue de maquinaria pesada (retroexcavadora y volquetes) para reforzar el dique en puntos de filtración.",
            "4. Carga inmediata del Anexo 1 (Evaluación Rápida) en el EDAN Digital SINPAD v2."
        ]
    },
    {
        id_plan: "PLAN-DIG-2026-INSN-NINO-GLOBAL",
        titulo_oficial: "Plan de Contingencia ante los Efectos del Fenómeno El Niño Costero y Global 2026-2027",
        entidad: "Instituto Nacional de Salud del Niño (INSN)",
        tipo_entidad: "HOSPITAL_SALUD",
        departamento: "LIMA",
        provincia: "LIMA",
        distrito: "BREÑA",
        ubigeo: "150105",
        anio_plan: 2026,
        periodo_vigencia: "2026-2027",
        estado_vigencia: "VIGENTE_2026_2027",
        acto_resolutivo: "Resolución Directoral N° 045-2026-INSN-DG",
        carpeta_origen: "Planes de contingencia",
        archivo_fuente_pdf: "22f8299d_PLAN_DE_CONTINGENCIA_FRENTE_AL_FEN_NIÑO_GLOBAL_2026-2027_-OFFFF_iNSTITUTO_NACIONAL_DE_SALUD_DEL_NIÑO.pdf",
        resumen_ejecutivo: "Plan estratégico hospitalario pediátrico de referencia nacional. Garantiza la continuidad de atención crítica en UCI, Emergencia Pediátrica, salas de operaciones y contingencia UVICLIN ante epidemias de Dengue y EDA exacerbadas por El Niño.",
        escenario_riesgo: {
            peligro_asociado: "Colapso Sanitario por Dengue Grave Pediátrico, Leptospirosis e Inundación de Sótanos",
            nivel_peligro: "MUY_ALTO",
            lluvia_gatillo_24h_mm: 20.0,
            poblacion_expuesta: 85000,
            viviendas_expuestas: 0,
            infraestructura_critica: [
                "Pabellón de UCI Pediátrica y Neonatal",
                "Banco de Sangre y Cadena de Frío de Biológicos",
                "Subestación eléctrica principal y banco de oxígeno",
                "Unidad de Quemados y Hemodiálisis"
            ]
        },
        cadena_mando_c2: {
            presidente_gtgrd: "Director General del INSN",
            secretaria_tecnica_coel: "Jefe del Espacio de Monitoreo de Emergencias y Desastres (EMED Salud INSN)",
            telefono_emergencia: "+51 (01) 330-0066 / 998-112-700",
            frecuencia_radial_vhf: "154.200 MHz (Red de Trauma MINSA)",
            puesto_comando_avanzado: "Sede Central EMED INSN - Av. Brasil 600"
        },
        puntos_criticos_priorizados: [
            { nombre: "Sótano de Archivo Clínico y Farmacia Central", tipo_amenaza: "Filtración por red pluvial urbana colapsada", intervencion_inmediata: "Instalación de bombas sumergibles automáticas y diques perimétricos." },
            { nombre: "Pabellón de Hospitalización UVICLIN Pediátrico", tipo_amenaza: "Saturación por brote de dengue infantil", intervencion_inmediata: "Habilitación de 40 camas de expansión rápida con mosquiteros y bombas de infusión." }
        ],
        albergues_temporales: [
            { nombre: "Área de Expansión Hospitalaria Auditorio INSN", capacidad_personas: 120, cota_segura: true, servicios_basicos: true }
        ],
        recursos_disponibles: {
            motobombas_unidades: 4,
            sacos_terreros_stock: 2500,
            raciones_alimentos_dias: 15,
            generadores_electricos: 3,
            camas_uviclin_disponibles: 40
        },
        protocolo_inmediato_0_4h: [
            "1. Activación de la Alerta Roja Hospitalaria y pase del personal clave a rol retén 24/7.",
            "2. Verificación de autonomía de oxígeno líquido (> 10 días) y combustible para grupos electrógenos (> 72h).",
            "3. Notificación inmediata al Centro de Operaciones de Emergencia Sectorial (COES Salud MINSA)."
        ]
    },
    {
        id_plan: "PLAN-DIG-2026-SALUD-HUARAL-CHANCAY",
        titulo_oficial: "Plan de Contingencia ante el Fenómeno El Niño 2026 - Red de Salud Huaral Chancay",
        entidad: "Red de Salud Huaral - Chancay / Hospital San Juan Bautista",
        tipo_entidad: "HOSPITAL_SALUD",
        departamento: "LIMA",
        provincia: "HUARAL",
        distrito: "HUARAL",
        ubigeo: "150601",
        anio_plan: 2026,
        periodo_vigencia: "2026-2027",
        estado_vigencia: "VIGENTE_2026_2027",
        acto_resolutivo: "Resolución Directoral Red Huaral N° 112-2026",
        carpeta_origen: "Planes de contingencia",
        archivo_fuente_pdf: "8576568-plan-de-contigencia-del-fenomeno-del-nino-2026-red-salud-huaral-chancay-2026.pdf",
        resumen_ejecutivo: "Plan asistencial y epidemiológico para la cuenca del Río Chancay-Huaral y zona costera de Chancay. Cubre el riesgo de aislamiento de centros de salud de la sierra huaralina y control de vectores en valles bajos.",
        escenario_riesgo: {
            peligro_asociado: "Desborde del Río Chancay, Huaicos en Carretera Huaral-Acos y Epidemia de Dengue",
            nivel_peligro: "MUY_ALTO",
            lluvia_gatillo_24h_mm: 30.0,
            poblacion_expuesta: 195000,
            viviendas_expuestas: 0,
            infraestructura_critica: [
                "Hospital San Juan Bautista de Huaral (II-2)",
                "Hospital de Chancay (II-1)",
                "Puesto de Salud Acos (I-3)",
                "Cadena de frío de vacunas provincial"
            ]
        },
        cadena_mando_c2: {
            presidente_gtgrd: "Director Ejecutivo de la Red de Salud Huaral - Chancay",
            secretaria_tecnica_coel: "Coordinador de EMED Red Huaral",
            telefono_emergencia: "+51 (01) 246-2311 / 987-654-321",
            puesto_comando_avanzado: "Hospital San Juan Bautista Huaral"
        },
        puntos_criticos_priorizados: [
            { nombre: "Microred Huaral Valle", tipo_amenaza: "Brote agudo de dengue", intervencion_inmediata: "Fumigación espacial y brigadas de abatización." },
            { nombre: "Tramo Vial Huaral - Huayllay", tipo_amenaza: "Aislamiento por deslizamientos", intervencion_inmediata: "Preposicionamiento de ambulancias 4x4 y stock de medicamentos para 30 días." }
        ],
        albergues_temporales: [],
        recursos_disponibles: {
            motobombas_unidades: 3,
            sacos_terreros_stock: 3000,
            raciones_alimentos_dias: 5,
            generadores_electricos: 4,
            camas_uviclin_disponibles: 25
        },
        protocolo_inmediato_0_4h: [
            "1. Activación de los Centros de Operaciones de Emergencia (EMED) en Huaral y Chancay.",
            "2. Despliegue de los Equipos de Respuesta Rápida (ERR) a zonas de riesgo de huaico."
        ]
    },
    {
        id_plan: "PLAN-DIG-2023-TRUJILLO-FEN",
        titulo_oficial: "Plan de Contingencia ante Lluvias Intensas e Inundaciones de la Provincia de Trujillo 2023-2024",
        entidad: "Municipalidad Provincial de Trujillo",
        tipo_entidad: "MUNICIPALIDAD",
        departamento: "LA LIBERTAD",
        provincia: "TRUJILLO",
        distrito: "TRUJILLO",
        ubigeo: "130101",
        anio_plan: 2023,
        periodo_vigencia: "2023-2024",
        estado_vigencia: "REFERENCIAL_HISTORICO",
        acto_resolutivo: "Resolución de Alcaldía N° 210-2023-MPT",
        carpeta_origen: "Planes de contingencia",
        archivo_fuente_pdf: "Resolución de Alcaldía N° 210-2023-MPT Plan de contingencia ante lluvias intensas e inundaciones en la provincia de Trujillo 2023-2024.pdf",
        resumen_ejecutivo: "Plan táctico metropolitano de Trujillo ante la activación simultánea de las 3 quebradas históricas: San Ildefonso, El León y San Carlos. Define diques de encauzamiento hacia el mar y evacuación de distritos El Porvenir, Florencia de Mora y Víctor Larco.",
        escenario_riesgo: {
            peligro_asociado: "Desborde y Flujo de Detritos por Activación de Quebradas San Ildefonso, El León y San Carlos",
            nivel_peligro: "MUY_ALTO",
            lluvia_gatillo_24h_mm: 30.0,
            poblacion_expuesta: 340000,
            viviendas_expuestas: 78000,
            infraestructura_critica: [
                "Centro Histórico de Trujillo y By-pass Mansiche",
                "Canal Madre Chavimochic",
                "Hospital Regional Docente de Trujillo",
                "Planta de Tratamiento de Agua Potable de Alto Salaverry"
            ]
        },
        cadena_mando_c2: {
            presidente_gtgrd: "Alcalde Provincial de Trujillo",
            secretaria_tecnica_coel: "Subgerencia de Defensa Civil de Trujillo (COEP)",
            telefono_emergencia: "+51 (044) 484-242 / 949-112-900",
            frecuencia_radial_vhf: "148.125 MHz",
            puesto_comando_avanzado: "Centro de Operaciones de Emergencia Provincial (COEP Trujillo) / Palacio Municipal"
        },
        puntos_criticos_priorizados: [
            { nombre: "Garganta Quebrada San Ildefonso (El Porvenir)", tipo_amenaza: "Avenida torrencial de lodo sobre casco urbano", intervencion_inmediata: "Apertura de canaletas de alivio hacia Río Moche y colocación de sacos." },
            { nombre: "Distrito Víctor Larco Herrera", tipo_amenaza: "Anegamiento total por descarga en cota cero", intervencion_inmediata: "Batería de 12 electrobombas de alta presión hacia el litoral." }
        ],
        albergues_temporales: [
            { nombre: "Coliseo Gran Chimú de Trujillo", capacidad_personas: 4500, cota_segura: true, servicios_basicos: true },
            { nombre: "Estadio Mansiche", capacidad_personas: 6000, cota_segura: true, servicios_basicos: true }
        ],
        recursos_disponibles: {
            motobombas_unidades: 24,
            sacos_terreros_stock: 120000,
            raciones_alimentos_dias: 15,
            generadores_electricos: 12,
            camas_uviclin_disponibles: 50
        },
        protocolo_inmediato_0_4h: [
            "1. Declaratoria de Emergencia Nivel 4 Provincial y despliegue del Puesto de Comando Móvil.",
            "2. Sirenas de alarma en Quebrada San Ildefonso con 45 minutos de ventana de evacuación.",
            "3. Corte preventivo de energía eléctrica en zonas bajas inundables de Buenos Aires y Víctor Larco."
        ]
    },
    {
        id_plan: "PLAN-DIG-2024-GORE-AMAZONAS",
        titulo_oficial: "Plan de Contingencia Regional frente a los Efectos del Fenómeno El Niño - GORE Amazonas",
        entidad: "Gobierno Regional de Amazonas",
        tipo_entidad: "GOBIERNO_REGIONAL",
        departamento: "AMAZONAS",
        provincia: "CHACHAPOYAS",
        distrito: "CHACHAPOYAS",
        ubigeo: "010101",
        anio_plan: 2024,
        periodo_vigencia: "2023-2024",
        estado_vigencia: "REFERENCIAL_HISTORICO",
        acto_resolutivo: "Resolución Ejecutiva Regional N° 450-2023-GRA",
        carpeta_origen: "Planes de contingencia",
        archivo_fuente_pdf: "plan-de-contingencia-regional-frente-a-los-efectos-del-fenomeno-el-nino-2023-2024 gobierno regional de amazonas.pdf",
        resumen_ejecutivo: "Plan regional para cuencas orientales (Marañón y Utcubamba). Protege Bagua, Utcubamba, Chachapoyas y Luya ante deslizamientos de gran magnitud, desborde de ríos selváticos y colapso de la carretera Fernando Belaunde Terry.",
        escenario_riesgo: {
            peligro_asociado: "Deslizamientos Rotacionales Masivos, Flujos de Lodo y Desborde de los Ríos Marañón y Utcubamba",
            nivel_peligro: "MUY_ALTO",
            lluvia_gatillo_24h_mm: 70.0,
            poblacion_expuesta: 88000,
            viviendas_expuestas: 14500,
            infraestructura_critica: [
                "Carretera Marginal de la Selva / IIRSA Norte",
                "Puente Utcubamba y Puente Cumba",
                "Hospital Virgen de Fátima Chachapoyas",
                "Hospital de Apoyo Gustavo Lanatta Luján Bagua"
            ]
        },
        cadena_mando_c2: {
            presidente_gtgrd: "Gobernador Regional de Amazonas",
            secretaria_tecnica_coel: "Dirección Regional de Defensa Civil y COER Amazonas",
            telefono_emergencia: "+51 (041) 477-040 / 941-900-112",
            frecuencia_radial_vhf: "149.200 MHz (Red HF Selva)",
            puesto_comando_avanzado: "COER Amazonas - Chachapoyas"
        },
        puntos_criticos_priorizados: [
            { nombre: "Falla Geológica de Asunción - Luya", tipo_amenaza: "Deslizamiento masivo con represa fluvial", intervencion_inmediata: "Monitoreo con inclinómetros e instalación de geomallas." },
            { nombre: "Corredor Utcubamba (Sector Pedro Ruiz)", tipo_amenaza: "Inundación y socavación vial", intervencion_inmediata: "Preposicionamiento de cargadores frontales y roca al volteo." }
        ],
        albergues_temporales: [
            { nombre: "Estadio Kuélap de Chachapoyas", capacidad_personas: 1800, cota_segura: true, servicios_basicos: true }
        ],
        recursos_disponibles: {
            motobombas_unidades: 12,
            sacos_terreros_stock: 45000,
            raciones_alimentos_dias: 20,
            generadores_electricos: 8,
            camas_uviclin_disponibles: 30
        },
        protocolo_inmediato_0_4h: [
            "1. Convocatoria extraordinaria del COER Amazonas y enlace satelital con INDECI Central.",
            "2. Despacho de 3 frentes de maquinaria de PROVIAS Descentralizado hacia ejes viales cortados.",
            "3. Habilitación de puente aéreo con helicópteros del Ejército en Bagua y Santa María de Nieva."
        ]
    },
    {
        id_plan: "PLAN-DIG-2026-ONPE-ELECTORAL",
        titulo_oficial: "Plan de Contingencia para Procesos Electorales ante Desastres Naturales FEN - ONPE",
        entidad: "Oficina Nacional de Procesos Electorales (ONPE)",
        tipo_entidad: "OTRA_ENTIDAD_PUBLICA",
        departamento: "LIMA",
        provincia: "LIMA",
        distrito: "CERCADO DE LIMA",
        ubigeo: "150101",
        anio_plan: 2026,
        periodo_vigencia: "2026-2027",
        estado_vigencia: "VIGENTE_2026_2027",
        acto_resolutivo: "Resolución Gerencial N° 156-2026-GOECOR/ONPE",
        carpeta_origen: "Planes de contingencia",
        archivo_fuente_pdf: "plan de contingencia de las elecciones onpe 2026 rg_156_2026_goecor.pdf",
        resumen_ejecutivo: "Garantiza la continuidad del derecho al sufragio y la custodia soberana del material electoral en locales de votación ubicados en distritos declarados en emergencia por lluvias extremas y FEN en la costa y sierra norte.",
        escenario_riesgo: {
            peligro_asociado: "Aislamiento de Locales de Votación, Pérdida de Fluido Eléctrico e Inundación de Aulas de Votación",
            nivel_peligro: "ALTO",
            lluvia_gatillo_24h_mm: 25.0,
            poblacion_expuesta: 1250000,
            viviendas_expuestas: 0,
            infraestructura_critica: [
                "Centros de Cómputo ODPE",
                "Locales escolares designados como centros de votación",
                "Rutas de repliegue de actas electorales",
                "Servidores centrales del voto electrónico"
            ]
        },
        cadena_mando_c2: {
            presidente_gtgrd: "Jefe Nacional de la ONPE",
            secretaria_tecnica_coel: "Gerencia de Organización Electoral y Coordinación Regional (GOECOR)",
            telefono_emergencia: "+51 (01) 417-0630 / 999-555-111",
            puesto_comando_avanzado: "Centro de Monitoreo Electoral Central ONPE"
        },
        puntos_criticos_priorizados: [
            { nombre: "Colegios Electorales en Bajo Piura y Tumbes", tipo_amenaza: "Anegamiento de patios de votación", intervencion_inmediata: "Reubicación inmediata a locales en cotas seguras validadas por CENEPRED." }
        ],
        albergues_temporales: [],
        recursos_disponibles: {
            motobombas_unidades: 15,
            sacos_terreros_stock: 10000,
            raciones_alimentos_dias: 3,
            generadores_electricos: 45
        },
        protocolo_inmediato_0_4h: [
            "1. Activación de la Mesa de Ayuda Electoral C2 y monitoreo meteorológico de cada ODPE.",
            "2. Envío de kits de contingencia (grupos electrógenos, toldos pluviales, bolsas estancas para actas)."
        ]
    },
    {
        id_plan: "PLAN-DIG-2024-SEAL-ELECTRICO",
        titulo_oficial: "Plan de Contingencia ante el Fenómeno El Niño 2024-2026 - Sociedad Eléctrica del Sur Oeste SEAL",
        entidad: "Sociedad Eléctrica del Sur Oeste S.A. (SEAL)",
        tipo_entidad: "OTRA_ENTIDAD_PUBLICA",
        departamento: "AREQUIPA",
        provincia: "AREQUIPA",
        distrito: "AREQUIPA",
        ubigeo: "040101",
        anio_plan: 2024,
        periodo_vigencia: "2024-2026",
        estado_vigencia: "VIGENTE_2026_2027",
        acto_resolutivo: "Acuerdo de Directorio SEAL N° 082-2024",
        carpeta_origen: "Planes de contingencia",
        archivo_fuente_pdf: "plan_contingencia_fenomeno_nino_2024-2026_SEAL arequipa energia electrica.pdf",
        resumen_ejecutivo: "Plan de resiliencia del sistema de distribución eléctrica en el sur del Perú. Protege subestaciones de transformación, líneas de transmisión y redes subterráneas ante crecidas del Río Chili, torrenteras y huaicos.",
        escenario_riesgo: {
            peligro_asociado: "Caída de Torres de Media Tensión por Huaicos en Torrenteras e Inundación de Subestaciones",
            nivel_peligro: "ALTO",
            lluvia_gatillo_24h_mm: 35.0,
            poblacion_expuesta: 950000,
            viviendas_expuestas: 210000,
            infraestructura_critica: [
                "Subestación Chilina y Subestación Parque Industrial",
                "Líneas de 33 kV que alimentan hospitales de Arequipa",
                "Centro de Control SCADA SEAL"
            ]
        },
        cadena_mando_c2: {
            presidente_gtgrd: "Gerente General de SEAL",
            secretaria_tecnica_coel: "Comité de Crisis y Gestión de Emergencias Eléctricas",
            telefono_emergencia: "+51 (054) 381-188 / 959-100-200",
            puesto_comando_avanzado: "Centro de Control SCADA SEAL Arequipa"
        },
        puntos_criticos_priorizados: [
            { nombre: "Torrentera San Lázaro y Los Incas", tipo_amenaza: "Socavación de postes de media tensión", intervencion_inmediata: "Refuerzo de bases con zapatas de concreto armado y desvío de flujo." }
        ],
        albergues_temporales: [],
        recursos_disponibles: {
            motobombas_unidades: 10,
            sacos_terreros_stock: 15000,
            raciones_alimentos_dias: 5,
            generadores_electricos: 20
        },
        protocolo_inmediato_0_4h: [
            "1. Pase automático a modo de contingencia del SCADA eléctrico.",
            "2. Priorización de alimentación eléctrica a hospitales (Honorio Delgado y Goyeneche)."
        ]
    },
    {
        id_plan: "PLAN-DIG-MINDEF-DEFENSA-LLUVIAS",
        titulo_oficial: "Plan de Contingencia del Sector Defensa ante Lluvias Intensas y Fenómeno El Niño",
        entidad: "Ministerio de Defensa (MINDEF) / INDECI / CCFFAA",
        tipo_entidad: "OTRA_ENTIDAD_PUBLICA",
        departamento: "LIMA",
        provincia: "LIMA",
        distrito: "JESUS MARIA",
        ubigeo: "150113",
        anio_plan: 2024,
        periodo_vigencia: "2024-2026",
        estado_vigencia: "VIGENTE_2026_2027",
        acto_resolutivo: "Resolución Ministerial N° 340-2024-DE",
        carpeta_origen: "Planes de contingencia",
        archivo_fuente_pdf: "plan_contingencia_mindef_2023_2024_lluvias.pdf",
        resumen_ejecutivo: "Estrategia de empleo de las Fuerzas Armadas (Ejército, Marina, FAP) y Compañías de Intervención Rápida para Desastres (CIRD). Dispone puentes aéreos, buques multipropósito (BAP Pisco) y batallones de ingeniería.",
        escenario_riesgo: {
            peligro_asociado: "Catástrofe Pluvial Multirregional con Colapso Simultáneo de Vías Nacionales y Aislamiento",
            nivel_peligro: "MUY_ALTO",
            lluvia_gatillo_24h_mm: 50.0,
            poblacion_expuesta: 2500000,
            viviendas_expuestas: 450000,
            infraestructura_critica: [
                "Bases Aéreas de Piura, Chiclayo, Trujillo y Lima",
                "Puertos de Salaverry, Paita, Chimbote y Callao",
                "Red Troncal de Comunicaciones Militares HF/VHF"
            ]
        },
        cadena_mando_c2: {
            presidente_gtgrd: "Ministro de Defensa / Comandante General del CCFFAA",
            secretaria_tecnica_coel: "Centro de Operaciones de Emergencia Nacional (COEN)",
            telefono_emergencia: "+51 (01) 224-1685 / 115 INDECI",
            frecuencia_radial_vhf: "143.900 MHz (Canal Táctico Conjunto FFAA)",
            puesto_comando_avanzado: "COEN Chorrillos - Lima"
        },
        puntos_criticos_priorizados: [
            { nombre: "Corredor Costero Norte (Tumbes - La Libertad)", tipo_amenaza: "Corte de Panamericana por caída de puentes", intervencion_inmediata: "Instalación de puentes modulares tipo Acrow en menos de 48 horas." }
        ],
        albergues_temporales: [],
        recursos_disponibles: {
            motobombas_unidades: 50,
            sacos_terreros_stock: 500000,
            raciones_alimentos_dias: 30,
            generadores_electricos: 40
        },
        protocolo_inmediato_0_4h: [
            "1. Declaratoria de Alerta Máxima en las Regiones Militares del Norte y del Oriente.",
            "2. Disposición de 4 aviones Spartan y 6 helicópteros MI-17 para evacuaciones aeromédicas.",
            "3. Zarpado preventivo de BAP Pisco con 500 toneladas de BAH a puertos de Paita y Salaverry."
        ]
    }
];

export default function PlanesNacionalesPage() {
    const [planes, setPlanes] = useState<PlanContingenciaDigital[]>(PLANES_CANONICOS_INICIALES);
    const [selectedPlan, setSelectedPlan] = useState<PlanContingenciaDigital>(PLANES_CANONICOS_INICIALES[0]);
    const [filtroTipo, setFiltroTipo] = useState<string>("TODOS");
    const [filtroAnio, setFiltroAnio] = useState<string>("TODOS");
    const [filtroDepto, setFiltroDepto] = useState<string>("TODOS");
    const [busqueda, setBusqueda] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);
    const [copied, setCopied] = useState<boolean>(false);
    const [estadisticas, setEstadisticas] = useState<any>(null);

    const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

    useEffect(() => {
        cargarCatalogoCompleto();
    }, []);

    const cargarCatalogoCompleto = async () => {
        setLoading(true);
        try {
            const [resPlanes, resStats] = await Promise.all([
                fetch(`${API_BASE}/api/v1/planes/catalogo`).then(r => r.json()).catch(() => null),
                fetch(`${API_BASE}/api/v1/planes/estadisticas`).then(r => r.json()).catch(() => null)
            ]);

            if (Array.isArray(resPlanes) && resPlanes.length > 0) {
                setPlanes(resPlanes);
                // Si el plan actualmente seleccionado está en la nueva lista, mantenerlo, sino tomar el primero
                setSelectedPlan(resPlanes[0]);
            }
            if (resStats) {
                setEstadisticas(resStats);
            }
        } catch (e) {
            console.error("Error sincronizando catálogo C2:", e);
        } finally {
            setLoading(false);
        }
    };

    // Filtrado dinámico multivariable
    const planesFiltrados = useMemo(() => {
        const q = busqueda.toLowerCase().trim();
        return planes.filter((p) => {
            // Filtro Entidad
            if (filtroTipo !== "TODOS" && p.tipo_entidad !== filtroTipo) {
                return false;
            }

            // Filtro Año
            if (filtroAnio !== "TODOS") {
                if (filtroAnio === "2026" && p.anio_plan < 2026) return false;
                if (filtroAnio === "2024" && (p.anio_plan < 2024 || p.anio_plan > 2025)) return false;
                if (filtroAnio === "2023" && p.anio_plan !== 2023) return false;
                if (filtroAnio === "HISTORICO" && p.anio_plan >= 2023) return false;
            }

            // Filtro Departamento
            if (filtroDepto !== "TODOS" && p.departamento !== filtroDepto) {
                return false;
            }

            // Búsqueda en texto
            if (q) {
                const target = `${p.titulo_oficial} ${p.entidad} ${p.departamento} ${p.provincia} ${p.distrito || ""} ${p.escenario_riesgo?.peligro_asociado || ""}`.toLowerCase();
                if (!target.includes(q)) return false;
            }

            return true;
        });
    }, [planes, filtroTipo, filtroAnio, filtroDepto, busqueda]);

    const handleCopyC2 = () => {
        if (!selectedPlan) return;
        const text = `🚨 RESUMEN TÁCTICO C2 - AMARU 2026-27 🚨
ENTIDAD: ${selectedPlan.entidad}
PLAN: ${selectedPlan.titulo_oficial}
RESOLUCIÓN: ${selectedPlan.acto_resolutivo}
VIGENCIA: ${selectedPlan.periodo_vigencia} (${selectedPlan.estado_vigencia})
PELIGRO: ${selectedPlan.escenario_riesgo?.peligro_asociado}
LLUVIA GATILLO: > ${selectedPlan.escenario_riesgo?.lluvia_gatillo_24h_mm} mm/24h
POBLACIÓN EXPUESTA: ${(selectedPlan.escenario_riesgo?.poblacion_expuesta || 0).toLocaleString()} hab.
C2 CONTACTO: ${selectedPlan.cadena_mando_c2?.presidente_gtgrd} (${selectedPlan.cadena_mando_c2?.telefono_emergencia})
FRECUENCIA VHF: ${selectedPlan.cadena_mando_c2?.frecuencia_radial_vhf || "Canal Local"}
PUESTO COMANDO: ${selectedPlan.cadena_mando_c2?.puesto_comando_avanzado}

PROTOCOLO 0-4H:
${selectedPlan.protocolo_inmediato_0_4h?.join("\n")}

Generado soberanamente por Plataforma AMARU C2.`;

        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
    };

    const handlePrint = () => {
        window.print();
    };

    const getTipoIcon = (tipo: string) => {
        switch (tipo) {
            case "HOSPITAL_SALUD":
                return <Stethoscope className="w-4 h-4 text-rose-400" />;
            case "GOBIERNO_REGIONAL":
                return <Landmark className="w-4 h-4 text-purple-400" />;
            case "OTRA_ENTIDAD_PUBLICA":
                return <Zap className="w-4 h-4 text-amber-400" />;
            default:
                return <Building2 className="w-4 h-4 text-emerald-400" />;
        }
    };

    const getTipoLabel = (tipo: string) => {
        switch (tipo) {
            case "HOSPITAL_SALUD":
                return "Hospital / Red de Salud";
            case "GOBIERNO_REGIONAL":
                return "Gobierno Regional (GORE)";
            case "OTRA_ENTIDAD_PUBLICA":
                return "Entidad Pública Estratégica";
            default:
                return "Municipalidad Provincial/Distrital";
        }
    };

    // Contadores dinámicos para los botones de taxonomía
    const contadores = useMemo(() => {
        const counts = {
            TODOS: planes.length,
            MUNICIPALIDAD: planes.filter(p => p.tipo_entidad === "MUNICIPALIDAD").length,
            GOBIERNO_REGIONAL: planes.filter(p => p.tipo_entidad === "GOBIERNO_REGIONAL").length,
            HOSPITAL_SALUD: planes.filter(p => p.tipo_entidad === "HOSPITAL_SALUD").length,
            OTRA_ENTIDAD_PUBLICA: planes.filter(p => p.tipo_entidad === "OTRA_ENTIDAD_PUBLICA").length,
        };
        return counts;
    }, [planes]);

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 space-y-6 max-w-7xl mx-auto pb-20">
            {/* =====================================================================
                HEADER C2 GUBERNAMENTAL NACIONAL
            ===================================================================== */}
            <div className="bg-gradient-to-r from-slate-900 via-indigo-950/80 to-slate-900 p-6 rounded-2xl border border-indigo-500/30 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
                    <div>
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                                <ShieldCheck className="w-3.5 h-3.5" /> SINAGERD • LEY N.° 29664
                            </span>
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                                R.J. 188-2015-INDECI
                            </span>
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-500/20 text-sky-300 border border-sky-500/40">
                                79 DOCUMENTOS OFICIALES INDEXADOS
                            </span>
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse">
                                VIGENCIA FEN 2026–2027
                            </span>
                        </div>

                        <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight flex items-center gap-3">
                            <FileText className="w-8 h-8 text-emerald-400" />
                            Consola Nacional de Planes de Contingencia Digitales 2026–2027
                        </h1>
                        <p className="text-sm text-slate-300 mt-1 max-w-4xl">
                            Centro de Comando y Control (C2) de Planes de Contingencia y Prevención del Perú. 
                            Estandarización de expedientes extensos en <strong>Fichas Tácticas de Choque de 1 Página</strong> para Municipalidades, Gobiernos Regionales, Hospitales e Infraestructura Estratégica.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={handlePrint}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-colors shadow-sm"
                        >
                            <Printer className="w-4 h-4 text-emerald-400" />
                            Imprimir Ficha (1 Pág.)
                        </button>

                        <button
                            onClick={handleCopyC2}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-lg shadow-indigo-600/30"
                        >
                            {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                            {copied ? "Copiado a C2!" : "Copiar Telegram C2"}
                        </button>
                    </div>
                </div>

                {/* 4 METRICAS NACIONALES */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
                    <div className="bg-slate-900/80 backdrop-blur-md p-3.5 rounded-xl border border-indigo-500/20">
                        <div className="text-[11px] text-slate-400 font-semibold uppercase flex items-center justify-between">
                            <span>TOTAL EXPEDIENTES</span>
                            <Layers className="w-3.5 h-3.5 text-indigo-400" />
                        </div>
                        <div className="text-2xl font-bold text-white mt-0.5">79 Oficiales</div>
                        <div className="text-[10px] text-emerald-400 mt-0.5">3 Carpetas data/ Indexadas</div>
                    </div>

                    <div className="bg-slate-900/80 backdrop-blur-md p-3.5 rounded-xl border border-indigo-500/20">
                        <div className="text-[11px] text-slate-400 font-semibold uppercase flex items-center justify-between">
                            <span>ESTÁNDAR DE CHOQUE</span>
                            <Clock className="w-3.5 h-3.5 text-emerald-400" />
                        </div>
                        <div className="text-2xl font-bold text-emerald-300 mt-0.5">0 - 4 Horas</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">Protocolo Inmediato Autoridad</div>
                    </div>

                    <div className="bg-slate-900/80 backdrop-blur-md p-3.5 rounded-xl border border-indigo-500/20">
                        <div className="text-[11px] text-slate-400 font-semibold uppercase flex items-center justify-between">
                            <span>INFRAESTRUCTURA DE VIDA</span>
                            <Stethoscope className="w-3.5 h-3.5 text-rose-400" />
                        </div>
                        <div className="text-2xl font-bold text-rose-300 mt-0.5">INSN + Redes</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">UVICLIN Pediátrico & Adultos</div>
                    </div>

                    <div className="bg-slate-900/80 backdrop-blur-md p-3.5 rounded-xl border border-indigo-500/20">
                        <div className="text-[11px] text-slate-400 font-semibold uppercase flex items-center justify-between">
                            <span>OPERACIÓN SOBERANA</span>
                            <ShieldAlert className="w-3.5 h-3.5 text-cyan-400" />
                        </div>
                        <div className="text-2xl font-bold text-cyan-300 mt-0.5">100% Local</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">Inmune a Cortes de Red</div>
                    </div>
                </div>
            </div>

            {/* =====================================================================
                BANNER DESTACADO: CASO MODELO #1 - EPICENTRO FEN PIURA
            ===================================================================== */}
            <div className="bg-gradient-to-r from-emerald-950/80 via-slate-900 to-indigo-950/80 border-2 border-emerald-500/40 rounded-2xl p-5 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-5 relative overflow-hidden">
                <div className="flex items-start gap-4">
                    <div className="p-3.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex-shrink-0">
                        <Building2 className="w-7 h-7 text-emerald-300" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-emerald-500/30 text-emerald-200 border border-emerald-400/50">
                                CASO MODELO #1 DE REFERENCIA NACIONAL
                            </span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                                EPICENTRO FEN
                            </span>
                        </div>
                        <h3 className="text-xl font-black text-white">
                            Consola Especializada: Epicentro FEN - Plan Piura 2026-27
                        </h3>
                        <p className="text-xs text-slate-300 mt-1 max-w-3xl">
                            Conserva al 100% el Gemelo Digital de <strong>Cuencas Ciegas SARE</strong>, Simulación de Lluvias UDEP, Auditoría Blindada Contraloría (PP 0068) y la Red de Salud DSRSLCC con UVICLIN.
                        </p>
                    </div>
                </div>

                <Link
                    href="/piura"
                    className="flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-black transition-all shadow-xl shadow-emerald-950/60 border border-emerald-400/40 whitespace-nowrap uppercase tracking-wider"
                >
                    <span>Ingresar a Consola Piura</span>
                    <ChevronRight className="w-4 h-4 text-emerald-200" />
                </Link>
            </div>

            {/* =====================================================================
                TAXONOMÍA DE 4 FAMILIAS (SELECTORES PRINCIPALES)
            ===================================================================== */}
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                        <Filter className="w-3.5 h-3.5 text-indigo-400" />
                        Taxonomía de Entidades Obligadas (Ley 29664 SINAGERD)
                    </span>
                    <span className="text-xs text-slate-500">
                        Mostrando <strong>{planesFiltrados.length}</strong> de {planes.length} planes
                    </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                    <button
                        onClick={() => setFiltroTipo("TODOS")}
                        className={`p-3 rounded-xl text-left border transition-all ${
                            filtroTipo === "TODOS"
                                ? "bg-indigo-600 text-white border-indigo-400 shadow-lg shadow-indigo-900/40"
                                : "bg-slate-900/80 text-slate-300 border-slate-800 hover:bg-slate-800 hover:border-slate-700"
                        }`}
                    >
                        <div className="text-[10px] font-bold opacity-80 uppercase">Todas las Familias</div>
                        <div className="text-base font-extrabold mt-0.5">Todas ({contadores.TODOS})</div>
                    </button>

                    <button
                        onClick={() => setFiltroTipo("MUNICIPALIDAD")}
                        className={`p-3 rounded-xl text-left border transition-all ${
                            filtroTipo === "MUNICIPALIDAD"
                                ? "bg-emerald-600 text-white border-emerald-400 shadow-lg shadow-emerald-900/40"
                                : "bg-slate-900/80 text-slate-300 border-slate-800 hover:bg-slate-800 hover:border-slate-700"
                        }`}
                    >
                        <div className="text-[10px] font-bold text-emerald-300 opacity-90 uppercase flex items-center gap-1">
                            <Building2 className="w-3 h-3" /> 1. Municipios
                        </div>
                        <div className="text-base font-extrabold mt-0.5">Municipalidades ({contadores.MUNICIPALIDAD})</div>
                    </button>

                    <button
                        onClick={() => setFiltroTipo("GOBIERNO_REGIONAL")}
                        className={`p-3 rounded-xl text-left border transition-all ${
                            filtroTipo === "GOBIERNO_REGIONAL"
                                ? "bg-purple-600 text-white border-purple-400 shadow-lg shadow-purple-900/40"
                                : "bg-slate-900/80 text-slate-300 border-slate-800 hover:bg-slate-800 hover:border-slate-700"
                        }`}
                    >
                        <div className="text-[10px] font-bold text-purple-300 opacity-90 uppercase flex items-center gap-1">
                            <Landmark className="w-3 h-3" /> 2. Regiones
                        </div>
                        <div className="text-base font-extrabold mt-0.5">GOREs ({contadores.GOBIERNO_REGIONAL})</div>
                    </button>

                    <button
                        onClick={() => setFiltroTipo("HOSPITAL_SALUD")}
                        className={`p-3 rounded-xl text-left border transition-all ${
                            filtroTipo === "HOSPITAL_SALUD"
                                ? "bg-rose-600 text-white border-rose-400 shadow-lg shadow-rose-900/40"
                                : "bg-slate-900/80 text-slate-300 border-slate-800 hover:bg-slate-800 hover:border-slate-700"
                        }`}
                    >
                        <div className="text-[10px] font-bold text-rose-300 opacity-90 uppercase flex items-center gap-1">
                            <Stethoscope className="w-3 h-3" /> 3. Red de Salud
                        </div>
                        <div className="text-base font-extrabold mt-0.5">Hospitales ({contadores.HOSPITAL_SALUD})</div>
                    </button>

                    <button
                        onClick={() => setFiltroTipo("OTRA_ENTIDAD_PUBLICA")}
                        className={`p-3 rounded-xl text-left border transition-all ${
                            filtroTipo === "OTRA_ENTIDAD_PUBLICA"
                                ? "bg-amber-600 text-white border-amber-400 shadow-lg shadow-amber-900/40"
                                : "bg-slate-900/80 text-slate-300 border-slate-800 hover:bg-slate-800 hover:border-slate-700"
                        }`}
                    >
                        <div className="text-[10px] font-bold text-amber-300 opacity-90 uppercase flex items-center gap-1">
                            <Zap className="w-3 h-3" /> 4. Estratégicas
                        </div>
                        <div className="text-base font-extrabold mt-0.5">Defensa/ONPE ({contadores.OTRA_ENTIDAD_PUBLICA})</div>
                    </button>
                </div>
            </div>

            {/* =====================================================================
                BARRA DE BÚSQUEDA Y FILTROS SECUNDARIOS
            ===================================================================== */}
            <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl flex flex-col md:flex-row items-center gap-3">
                <div className="relative flex-1 w-full">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                        type="text"
                        placeholder="Buscar por distrito, hospital, río, peligro o palabra clave (ej: El Tallán, INSN, Chancay, Trujillo, Marañón)..."
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                </div>

                <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                    {/* Filtro Vigencia */}
                    <select
                        value={filtroAnio}
                        onChange={(e) => setFiltroAnio(e.target.value)}
                        className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                    >
                        <option value="TODOS">Todos los Años</option>
                        <option value="2026">2026-2027 (FEN Vigente)</option>
                        <option value="2024">2024-2025</option>
                        <option value="2023">2023-2024</option>
                        <option value="HISTORICO">Históricos (≤2022)</option>
                    </select>

                    {/* Filtro Departamento */}
                    <select
                        value={filtroDepto}
                        onChange={(e) => setFiltroDepto(e.target.value)}
                        className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                    >
                        <option value="TODOS">Todas las Regiones</option>
                        <option value="PIURA">Piura</option>
                        <option value="LIMA">Lima</option>
                        <option value="LA LIBERTAD">La Libertad</option>
                        <option value="AMAZONAS">Amazonas</option>
                        <option value="LAMBAYEQUE">Lambayeque</option>
                        <option value="AREQUIPA">Arequipa</option>
                    </select>

                    <button
                        onClick={() => {
                            setFiltroTipo("TODOS");
                            setFiltroAnio("TODOS");
                            setFiltroDepto("TODOS");
                            setBusqueda("");
                        }}
                        className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition-colors"
                    >
                        Limpiar
                    </button>
                </div>
            </div>

            {/* =====================================================================
                SELECTOR RÁPIDO DE CASOS EMBLEMÁTICOS
            ===================================================================== */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1">
                    Acceso Rápido:
                </span>
                {[
                    { id: "PLAN-DIG-2026-INSN-NINO-GLOBAL", label: "INSN del Niño (2026-27)", color: "border-rose-500/50 text-rose-300" },
                    { id: "PLAN-DIG-2026-MDET-ELTALLAN", label: "El Tallán (Piura 2026)", color: "border-emerald-500/50 text-emerald-300" },
                    { id: "PLAN-DIG-2026-SALUD-HUARAL-CHANCAY", label: "Red Salud Huaral-Chancay (2026)", color: "border-rose-500/50 text-rose-300" },
                    { id: "PLAN-DIG-2023-TRUJILLO-FEN", label: "Trujillo (La Libertad)", color: "border-emerald-500/50 text-emerald-300" },
                    { id: "PLAN-DIG-2024-GORE-AMAZONAS", label: "GORE Amazonas (Marañón)", color: "border-purple-500/50 text-purple-300" },
                    { id: "PLAN-DIG-2026-ONPE-ELECTORAL", label: "ONPE Electoral (2026)", color: "border-amber-500/50 text-amber-300" },
                    { id: "PLAN-DIG-2024-SEAL-ELECTRICO", label: "SEAL Eléctrico (Arequipa)", color: "border-amber-500/50 text-amber-300" },
                    { id: "PLAN-DIG-MINDEF-DEFENSA-LLUVIAS", label: "Sector Defensa / INDECI", color: "border-sky-500/50 text-sky-300" }
                ].map((item) => {
                    const p = planes.find(x => x.id_plan === item.id);
                    if (!p) return null;
                    const isSelected = selectedPlan?.id_plan === p.id_plan;
                    return (
                        <button
                            key={item.id}
                            onClick={() => setSelectedPlan(p)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                                isSelected
                                    ? "bg-slate-800 text-white border-white shadow-md"
                                    : `bg-slate-900/60 ${item.color} hover:bg-slate-800`
                            }`}
                        >
                            {item.label}
                        </button>
                    );
                })}
            </div>

            {/* =====================================================================
                PANEL DUAL: CATÁLOGO IZQUIERDA / FICHA TÁCTICA 1 PÁGINA DERECHA
            ===================================================================== */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
                {/* LADO IZQUIERDO: LISTA DE PLANES (4 COLS) */}
                <div className="lg:col-span-4 space-y-3">
                    <div className="flex items-center justify-between pb-1">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                            Catálogo Indexado ({planesFiltrados.length})
                        </span>
                        <span className="text-[11px] text-slate-500">Click para ver ficha</span>
                    </div>

                    <div className="space-y-2.5 max-h-[850px] overflow-y-auto pr-1">
                        {planesFiltrados.length === 0 ? (
                            <div className="p-8 text-center bg-slate-900/50 rounded-xl border border-slate-800">
                                <AlertTriangle className="w-8 h-8 text-amber-400 mx-auto mb-2 opacity-60" />
                                <div className="text-xs text-slate-300 font-semibold">No se encontraron planes</div>
                                <div className="text-[11px] text-slate-500 mt-0.5">Prueba ajustando los filtros de búsqueda</div>
                            </div>
                        ) : (
                            planesFiltrados.map((p) => {
                                const isSelected = selectedPlan?.id_plan === p.id_plan;
                                return (
                                    <div
                                        key={p.id_plan}
                                        onClick={() => setSelectedPlan(p)}
                                        className={`p-4 rounded-xl border cursor-pointer transition-all ${
                                            isSelected
                                                ? "bg-slate-900 border-indigo-500 ring-2 ring-indigo-500/30 shadow-xl shadow-indigo-950/60"
                                                : "bg-slate-900/60 border-slate-800/80 hover:bg-slate-800/60 hover:border-slate-700"
                                        }`}
                                    >
                                        <div className="flex items-center justify-between text-[11px] mb-2">
                                            <span className="flex items-center gap-1.5 font-bold">
                                                {getTipoIcon(p.tipo_entidad)}
                                                <span className="text-slate-300">{p.departamento}</span>
                                            </span>
                                            <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                                                p.estado_vigencia === "VIGENTE_2026_2027"
                                                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                                                    : "bg-slate-800 text-slate-400"
                                            }`}>
                                                {p.periodo_vigencia}
                                            </span>
                                        </div>

                                        <h4 className="text-sm font-bold text-white leading-snug line-clamp-2">
                                            {p.titulo_oficial}
                                        </h4>

                                        <p className="text-xs text-indigo-300/90 font-medium mt-1">
                                            {p.entidad}
                                        </p>

                                        <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                                            <span>
                                                Gatillo: <strong className="text-amber-400">{p.escenario_riesgo?.lluvia_gatillo_24h_mm || 35} mm</strong>
                                            </span>
                                            <span className="text-[10px] font-mono text-slate-500 truncate max-w-[130px]">
                                                {p.archivo_fuente_pdf.substring(0, 16)}...
                                            </span>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* LADO DERECHO: FICHA TÁCTICA RESUMIDA EN 1 PÁGINA (8 COLS) */}
                <div className="lg:col-span-8">
                    {selectedPlan ? (
                        <div className="bg-slate-900 border border-indigo-500/30 rounded-2xl p-6 shadow-2xl space-y-6">
                            {/* ENCABEZADO FORMAL DE LA FICHA TÁCTICA */}
                            <div className="flex flex-col md:flex-row md:items-start justify-between pb-6 border-b border-slate-800 gap-4">
                                <div className="space-y-1.5">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                                            <ShieldCheck className="w-3.5 h-3.5" /> FICHA TÁCTICA AMARU • ACCIÓN INMEDIATA
                                        </span>
                                        <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-slate-800 text-slate-300">
                                            {selectedPlan.id_plan}
                                        </span>
                                        <span className="px-2 py-0.5 rounded text-xs font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                                            {getTipoLabel(selectedPlan.tipo_entidad)}
                                        </span>
                                    </div>

                                    <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight leading-tight">
                                        {selectedPlan.titulo_oficial}
                                    </h2>

                                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400 pt-1">
                                        <div className="flex items-center gap-1.5 text-slate-200 font-semibold">
                                            <Building2 className="w-3.5 h-3.5 text-emerald-400" />
                                            <span>{selectedPlan.entidad}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                                            <span>{selectedPlan.distrito || selectedPlan.provincia}, Región {selectedPlan.departamento}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-amber-300 font-medium">
                                            <Scale className="w-3.5 h-3.5 text-amber-400" />
                                            <span>{selectedPlan.acto_resolutivo}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 flex-shrink-0">
                                    <button
                                        onClick={handlePrint}
                                        className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors shadow-sm"
                                    >
                                        <Printer className="w-3.5 h-3.5 text-emerald-400" />
                                        Imprimir Ficha
                                    </button>

                                    <a
                                        href={`${API_BASE}/api/v1/planes/descargar/${selectedPlan.id_plan}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-indigo-600/80 hover:bg-indigo-600 text-white text-xs font-semibold border border-indigo-500/40 transition-colors shadow-sm"
                                    >
                                        <Download className="w-3.5 h-3.5" />
                                        PDF Original
                                    </a>
                                </div>
                            </div>

                            {/* RESUMEN OPERATIVO EJECUTIVO */}
                            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 block mb-1">
                                    Resumen Operativo de Choque para la Autoridad (Alcalde / Gobernador / Director)
                                </span>
                                <p className="text-xs text-slate-200 leading-relaxed font-normal">
                                    {selectedPlan.resumen_ejecutivo}
                                </p>
                            </div>

                            {/* 3 BLOQUES TÁCTICOS FUNDAMENTALES */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {/* BLOQUE 1: ESCENARIO Y UMBRALES GATILLO */}
                                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                                            <AlertTriangle className="w-4 h-4" />
                                            1. Umbrales Gatillo
                                        </span>
                                        <span className="text-[10px] px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-bold border border-rose-500/30">
                                            PELIGRO {selectedPlan.escenario_riesgo?.nivel_peligro}
                                        </span>
                                    </div>

                                    <div className="text-xs text-slate-200 font-medium">
                                        {selectedPlan.escenario_riesgo?.peligro_asociado}
                                    </div>

                                    <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                                        <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                                            <span className="text-[10px] text-slate-500 block">Lluvia Gatillo 24h</span>
                                            <span className="text-base font-bold text-amber-400">
                                                &gt; {selectedPlan.escenario_riesgo?.lluvia_gatillo_24h_mm} mm
                                            </span>
                                        </div>
                                        <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                                            <span className="text-[10px] text-slate-500 block">Caudal Crítico</span>
                                            <span className="text-base font-bold text-cyan-400">
                                                {selectedPlan.escenario_riesgo?.caudal_critico_m3s ? `${selectedPlan.escenario_riesgo.caudal_critico_m3s} m³/s` : "N/A"}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="text-xs space-y-1.5 pt-1 text-slate-400 border-t border-slate-900">
                                        <div className="flex justify-between">
                                            <span>Población Expuesta:</span>
                                            <strong className="text-white">{(selectedPlan.escenario_riesgo?.poblacion_expuesta || 0).toLocaleString()} hab.</strong>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Viviendas en Riesgo:</span>
                                            <strong className="text-white">{(selectedPlan.escenario_riesgo?.viviendas_expuestas || 0).toLocaleString()}</strong>
                                        </div>
                                    </div>
                                </div>

                                {/* BLOQUE 2: CADENA DE MANDO C2 Y ENLACE 24/7 */}
                                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                                            <ShieldAlert className="w-4 h-4" />
                                            2. Cadena Mando C2 (24/7)
                                        </span>
                                    </div>

                                    <div className="space-y-2 text-xs">
                                        <div>
                                            <span className="text-[10px] text-slate-500 block">Presidente GT-GRD / Titular:</span>
                                            <strong className="text-white block font-medium">
                                                {selectedPlan.cadena_mando_c2?.presidente_gtgrd}
                                            </strong>
                                        </div>
                                        <div>
                                            <span className="text-[10px] text-slate-500 block">Secretaría Técnica / COEL / EMED:</span>
                                            <span className="text-slate-300 block">
                                                {selectedPlan.cadena_mando_c2?.secretaria_tecnica_coel}
                                            </span>
                                        </div>
                                        <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
                                            <div className="flex items-center gap-2 text-emerald-400 font-mono font-bold">
                                                <Phone className="w-3.5 h-3.5" />
                                                <span>{selectedPlan.cadena_mando_c2?.telefono_emergencia}</span>
                                            </div>
                                            {selectedPlan.cadena_mando_c2?.frecuencia_radial_vhf && (
                                                <div className="flex items-center gap-2 text-cyan-300 font-mono text-[11px]">
                                                    <Radio className="w-3.5 h-3.5" />
                                                    <span>{selectedPlan.cadena_mando_c2.frecuencia_radial_vhf}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* BLOQUE 3: CAPACIDAD LOGÍSTICA DE CHOQUE */}
                                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="font-bold uppercase tracking-wider text-sky-400 flex items-center gap-1.5">
                                            <Truck className="w-4 h-4" />
                                            3. Recursos de Choque
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2 text-xs">
                                        <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                                            <span className="text-[10px] text-slate-500 block">Motobombas</span>
                                            <span className="text-base font-bold text-white">
                                                {selectedPlan.recursos_disponibles?.motobombas_unidades || 0} unids.
                                            </span>
                                        </div>
                                        <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                                            <span className="text-[10px] text-slate-500 block">Sacos Terreros</span>
                                            <span className="text-base font-bold text-emerald-400">
                                                {(selectedPlan.recursos_disponibles?.sacos_terreros_stock || 0).toLocaleString()}
                                            </span>
                                        </div>
                                        <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                                            <span className="text-[10px] text-slate-500 block">Raciones BAH</span>
                                            <span className="text-base font-bold text-amber-400">
                                                {selectedPlan.recursos_disponibles?.raciones_alimentos_dias || 0} días
                                            </span>
                                        </div>
                                        <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                                            <span className="text-[10px] text-slate-500 block">Camas UVICLIN</span>
                                            <span className="text-base font-bold text-rose-400">
                                                {selectedPlan.recursos_disponibles?.camas_uviclin_disponibles || 0} camas
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* PROTOCOLO TÁCTICO DE CHOQUE INMEDIATO (0 - 4 HORAS) */}
                            <div className="p-5 rounded-xl bg-slate-950 border border-emerald-500/30 space-y-3">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                                        <Clock className="w-4 h-4 text-emerald-400" />
                                        Protocolo Táctico de Choque Inmediato (Ventana Crítica 0 - 4 Horas)
                                    </h4>
                                    <span className="text-[10px] text-emerald-400 font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30">
                                        ORDEN DE OPERACIONES C2
                                    </span>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {selectedPlan.protocolo_inmediato_0_4h?.map((paso: string, idx: number) => (
                                        <div key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-slate-900/80 border border-slate-800 text-xs">
                                            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                                            <span className="text-slate-200 leading-relaxed">{paso}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* PUNTOS CRÍTICOS Y ALBERGUES TEMPORALES */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
                                {/* PUNTOS CRÍTICOS PRIORIZADOS */}
                                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2.5">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block">
                                            Puntos Críticos de Falla Priorizados
                                        </span>
                                        <span className="text-[10px] text-slate-500">Intervención Urgente</span>
                                    </div>

                                    <div className="space-y-2 text-xs">
                                        {selectedPlan.puntos_criticos_priorizados?.length > 0 ? (
                                            selectedPlan.puntos_criticos_priorizados.map((pt: any, i: number) => (
                                                <div key={i} className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                                                    <div className="font-bold text-white flex items-center justify-between">
                                                        <span>{pt.nombre}</span>
                                                        <span className="text-[10px] text-rose-400 font-mono font-normal">{pt.tipo_amenaza}</span>
                                                    </div>
                                                    <div className="text-[11px] text-emerald-400 mt-1">
                                                        <strong>Acción:</strong> {pt.intervencion_inmediata}
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="p-4 text-center text-xs text-slate-500 italic">
                                                Plan articulado con la red de puntos críticos del sector y COEN central.
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* ALBERGUES Y ZONAS SEGURAS */}
                                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2.5">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider block">
                                            Albergues y Zonas de Evacuación Segura
                                        </span>
                                        <span className="text-[10px] text-slate-500">Cota Alta Validada</span>
                                    </div>

                                    <div className="space-y-2 text-xs">
                                        {selectedPlan.albergues_temporales?.length > 0 ? (
                                            selectedPlan.albergues_temporales.map((alb: any, i: number) => (
                                                <div key={i} className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between">
                                                    <div>
                                                        <div className="font-bold text-white">{alb.nombre}</div>
                                                        <div className="text-[10px] text-slate-400 mt-0.5">
                                                            Cota Segura: {alb.cota_segura ? "Validada" : "En verificación"} • Servicios: {alb.servicios_basicos ? "Operativos" : "Provisorios"}
                                                        </div>
                                                    </div>
                                                    <span className="px-2.5 py-1 rounded bg-slate-800 text-cyan-300 font-mono font-bold text-xs">
                                                        {alb.capacidad_personas} hab.
                                                    </span>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="p-4 text-center text-xs text-slate-500 italic">
                                                Establecimiento de respuesta sectorial. Coordina evacuación con albergues municipales y de defensa civil de su jurisdicción.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="p-12 text-center bg-slate-900 rounded-2xl border border-slate-800">
                            <Clock className="w-10 h-10 text-indigo-400 animate-spin mx-auto mb-3" />
                            <h3 className="text-sm font-bold text-white">Cargando ficha táctica del plan...</h3>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
