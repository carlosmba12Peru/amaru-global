"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
    BookOpen,
    Search,
    Map,
    Layers,
    Cpu,
    Scale,
    ShieldAlert,
    Waves,
    Mountain,
    Droplets,
    Snowflake,
    Languages,
    FileText,
    ArrowRight,
    Compass,
    Radio,
    Satellite,
    ExternalLink,
    Filter,
    CheckCircle2,
    Info,
    Flame,
    Wind,
    Thermometer
} from "lucide-react";

type CategoriaGlosario = "TODOS" | "MAPAS" | "AGENTES" | "INDICES" | "NORMATIVA" | "METEOROLOGIA";

interface ItemGlosario {
    id: string;
    termino: string;
    acronimo?: string;
    categoria: "MAPAS" | "AGENTES" | "INDICES" | "NORMATIVA" | "METEOROLOGIA";
    resumen: string;
    descripcionCompleta: string;
    fuenteOficial: string;
    aplicacionProyecto: string;
    etiquetas: string[];
    detallesTecnicos?: { [key: string]: string };
}

export default function GlosarioPage() {
    const [categoriaActiva, setCategoriaActiva] = useState<CategoriaGlosario>("TODOS");
    const [busqueda, setBusqueda] = useState<string>("");
    const [itemSeleccionado, setItemSeleccionado] = useState<string | null>(null);

    // =========================================================================
    // BASE DE CONOCIMIENTO DOCTRINAL Y CARTOGRÁFICA
    // =========================================================================
    const ITEMS_GLOSARIO: ItemGlosario[] = [
        // ---------------------------------------------------------------------
        // 1. MAPAS Y CAPAS CARTOGRÁFICAS
        // ---------------------------------------------------------------------
        {
            id: "map-noaa-sst",
            termino: "Mapa de Temperatura Superficial del Mar & Región Niño 1+2",
            acronimo: "TSM / SST NOAA CRW",
            categoria: "MAPAS",
            resumen: "Monitoreo térmico satelital del Pacífico oriental (costa norte del Perú: Tumbes, Piura, Lambayeque y La Libertad).",
            descripcionCompleta: "Capa térmica marina de alta resolución derivada del sensor Coral Reef Watch (CRW) de la NOAA y calibrada con IMARPE. Monitorea la anomalía positiva de la temperatura superficial del mar frente a la costa norte peruana. Un valor superior a +2.0°C en la Región Niño 1+2 gatilla de inmediato el factor multiplicador estacional (x1.35) en los modelos predictivos hidrológicos del sistema.",
            fuenteOficial: "NOAA (Coral Reef Watch) • IMARPE • DHN",
            aplicacionProyecto: "Geovisor C2: Polígono oceánico interactivo con gradiente térmico naranja-rojo y cálculo de termoclina.",
            etiquetas: ["Pacífico", "Niño 1+2", "Anomalía Térmica", "SST", "Onda Kelvin"],
            detallesTecnicos: {
                "Resolución espacial": "5 km satelital (blended IR/microwave)",
                "Umbral crítico": "Anomalía ≥ +2.5°C sobre la media histórica mensual",
                "Factor de impacto": "Multiplica el caudal pico proyectado por 1.35x"
            }
        },
        {
            id: "map-boyas-dhn",
            termino: "Mapa de Boyas Oceanográficas DHN / IMARPE",
            acronimo: "BOYAS_TSM",
            categoria: "MAPAS",
            resumen: "Red de estaciones oceanográficas fondeadas en el litoral para la detección de Ondas Kelvin y hundimiento de termoclina.",
            descripcionCompleta: "Puntos de telemetría in situ instalados en Puerto Pizarro (Tumbes), Paita (Piura), Chicama (La Libertad) y Callao (Lima). Miden en tiempo real la temperatura puntual del agua, salinidad superficial y la profundidad de la isoterma de 20°C (termoclina). Cuando la termoclina se profundiza a más de 80 metros en Paita, indica el arribo de una Onda Kelvin cálida de hundimiento que precede lluvias costeras torrenciales en 7 a 14 días.",
            fuenteOficial: "Dirección de Hidrografía y Navegación (DHN) • Marina de Guerra del Perú • IMARPE",
            aplicacionProyecto: "Geovisor C2: Nodos náuticos interactivos con indicador de pulso de Onda Kelvin activa y temperatura in situ.",
            etiquetas: ["DHN", "IMARPE", "Paita", "Puerto Pizarro", "Termoclina"],
            detallesTecnicos: {
                "Frecuencia de datos": "Horaria / Tiempo real",
                "Variables clave": "Temperatura (°C), Anomalía (°C), Profundidad de termoclina (m)",
                "Ubicaciones críticas": "Paita (-5.08, -81.25), Pto Pizarro (-3.48, -80.45)"
            }
        },
        {
            id: "map-radar-doppler",
            termino: "Mapa de Radar Doppler RainViewer & GOES-16",
            acronimo: "RADAR_DOPPLER",
            categoria: "MAPAS",
            resumen: "Malla animada de reflectividad de lluvia (dBZ) con línea de tiempo histórica y previsión a corto plazo.",
            descripcionCompleta: "Capa interactiva que compone la reflectividad compuesta (dBZ) de radares meteorológicos y bandas infrarrojas térmicas del satélite geoestacionario GOES-16 (Banda 13 / 10.3 µm). Permite a la sala de crisis rastrear frentes de tormenta convectiva en cuenca media y alta antes de que descarguen sobre quebradas secas.",
            fuenteOficial: "RainViewer API • NOAA GOES-16 • SENAMHI",
            aplicacionProyecto: "Geovisor C2: Barra inferior interactiva tipo Scrubber con pasos de -120m, -90m, -60m, -30m, tiempo real y +1h de previsión.",
            etiquetas: ["Radar", "RainViewer", "GOES-16", "Lluvia", "dBZ"],
            detallesTecnicos: {
                "Gama de reflectividad": "10 a 65 dBZ (Azul: llovizna → Rojo: tormenta severa)",
                "Bucle temporal": "Animación automatizada cada 1.4 segundos por fotograma",
                "Integración": "Superposición SVG sobre relieve de cordillera"
            }
        },
        {
            id: "map-quebradas",
            termino: "Mapa de las 46 Quebradas Críticas Nacionales",
            acronimo: "QUEBRADA_CRITICA",
            categoria: "MAPAS",
            resumen: "Georreferenciación de los conos de deyección más peligrosos del país con umbrales milimétricos y tiempos de concentración.",
            descripcionCompleta: "Capa fundamental de protección civil elaborada con base en los informes técnicos de CENEPRED, INGEMMET y la Autoridad Nacional del Agua (ANA). Mapea conos aluviales críticos como Carossio y Pedregal (Chosica), Huaycoloro (San Antonio de Huarochirí), San Ildefonso (Trujillo), Idelfonso/León (La Libertad) y quebradas de la cuenca del Chili (Arequipa). Contiene el umbral pluviométrico crítico (mm/h) a partir del cual el cono se activa inevitablemente.",
            fuenteOficial: "CENEPRED • ANA • INGEMMET • INDECI",
            aplicacionProyecto: "Geovisor C2 & Consola de Mando: Marcadores triangulares rojos con pulso aluvional, cálculo de tiempo de concentración (1.5 a 3.0 h) y población expuesta.",
            etiquetas: ["Quebradas", "Huaicos", "CENEPRED", "Chosica", "San Ildefonso", "Carossio"],
            detallesTecnicos: {
                "Universo cartográfico": "46 quebradas críticas prioritarias",
                "Umbrales críticos típicos": "Carossio: 14.5 mm/h • San Ildefonso: 12.0 mm/h • Huaycoloro: 16.0 mm/h",
                "Tiempo de concentración": "1.8 a 2.5 horas para activación aluvional masiva"
            }
        },
        {
            id: "map-aforos-fluviales",
            termino: "Mapa de Estaciones de Aforo Hidrológico Fluvial",
            acronimo: "ESTACION_AFORO",
            categoria: "MAPAS",
            resumen: "Monitoreo de caudales en tiempo real (m³/s) contrastados con los récords históricos catastróficos de 1998 y 2017.",
            descripcionCompleta: "Puntos hidrométricos situados en las cuencas fluviales más vulnerables: Río Piura (Puente Sánchez Cerro y Chulucanas), Río Rímac (Chosica), Río La Leche (Puchaca), Río Tumbes (El Tigre) y Río Santa (Condorcerro). Cada estación contrasta el caudal instantáneo contra el umbral de alerta roja y contra el récord histórico del meganiño de 1998 (e.g. 4,424 m³/s en Piura).",
            fuenteOficial: "Autoridad Nacional del Agua (ANA) • SENAMHI",
            aplicacionProyecto: "Geovisor C2: Nodos azules con comparativa histórica y lección aprendida de infraestructura (puentes colapsados y diques socavados).",
            etiquetas: ["Aforo", "Caudal", "Río Piura", "Río Rímac", "Río La Leche", "1998"],
            detallesTecnicos: {
                "Unidades": "Metros cúbicos por segundo (m³/s)",
                "Récords históricos integrados": "Piura: 4,424 m³/s (1998) • Rímac: 175 m³/s (1998) • La Leche: 1,200 m³/s (1998)",
                "Niveles de alarma": "Verde (Ordinario), Amarillo (Vigilancia diques), Rojo (Desborde inminente)"
            }
        },
        {
            id: "map-memoria-fen",
            termino: "Mapa de Memoria Histórica de Impactos FEN 1998 & 2017",
            acronimo: "MEMORIA_FEN",
            categoria: "MAPAS",
            resumen: "Cartografía de cicatrices aluviales, fallas de diques, puentes colapsados y lecciones tácticas aprendidas.",
            descripcionCompleta: "Capa doctrinal que geolocaliza las zonas con mayor recurrencia de desastre en la historia republicana del Perú durante eventos El Niño: Bajo Piura (Catacaos y Cura Mori con 35,000 damnificados en 2017), Valle La Leche (Íllimo y Pacora incomunicados por destrucción de puente), Trujillo (quebrada San Ildefonso desbordando 7 veces consecutivas hacia la Plaza de Armas) y Chosica (Carretera Central bloqueada km 32 al 38).",
            fuenteOficial: "COEN Histórico • INDECI • Archivo Nacional de Desastres",
            aplicacionProyecto: "Geovisor C2: Puntos de impacto carmesí con extractos de lecciones operativas para comandantes militares y alcaldes.",
            etiquetas: ["Memoria", "Catacaos", "Íllimo", "El Niño 1998", "Niño Costero 2017"],
            detallesTecnicos: {
                "Eventos catalogados": "Meganiño 1982-83, Meganiño 1997-98, Niño Costero 2017, Yaku 2023",
                "Lecciones integradas": "Falla de terraplenes en km 980 Panamericana, colapso de defensas de gaviones"
            }
        },
        {
            id: "map-heladas-chiri",
            termino: "Mapa de Heladas y Friajes (AMARU-CHIRI)",
            acronimo: "HELADA_CHIRI",
            categoria: "MAPAS",
            resumen: "Corredor de vulnerabilidad por temperaturas extremas bajo cero en el Altiplano y Sierra Sur (>3,800 msnm).",
            descripcionCompleta: "Capa que identifica las localidades altoandinas expuestas a heladas meteorológicas severas (temperaturas de -10°C a -16°C), mortandad de crías de camélidos sudamericanos (alpacas y llamas) y afecciones respiratorias agudas en menores de 5 años y adultos mayores. Cubre Mazocruz (Puno), Imata (Arequipa), Espinar (Cusco) y mesetas de Huancavelica y Pasco.",
            fuenteOficial: "SENAMHI • Plan Multisectorial ante Heladas y Friajes (PCM) • MIDAGRI",
            aplicacionProyecto: "Geovisor C2: Nodos celestes con temperatura mínima, altitud msnm y número de cabezas de camélidos en riesgo.",
            etiquetas: ["Heladas", "AMARU-CHIRI", "Mazocruz", "Puno", "Camélidos", "Friaje"],
            detallesTecnicos: {
                "Cota altitudinal": "Superior a 3,800 msnm",
                "Temperatura récord": "Mazocruz: -28.0°C (récord histórico nacional)",
                "Censo agropecuario": "Exposición cuantificada de alpacas y pastizales altoandinos"
            }
        },
        {
            id: "map-renalio-etno",
            termino: "Mapa Etnolingüístico RENALIO & Triple Vulnerabilidad (IPI)",
            acronimo: "RENALIO_ETNO",
            categoria: "MAPAS",
            resumen: "7ma capa cartográfica que visualiza la priorización algorítmica IPI sobre los 1,891 distritos y su filiación lingüística originaria.",
            descripcionCompleta: "Capa creada para materializar el mandato soberano de equidad territorial. Cruza los 1,891 distritos clasificados por CENEPRED, los 893 distritos con declaratoria de emergencia D.S. 124-2026-PCM, los distritos críticos de heladas y el Registro Nacional de Lenguas Indígenas u Originarias (RENALIO Tomos I y II, D.S. 009-2021-MC). Permite identificar de inmediato si la alerta de emergencia debe emitirse obligatoriamente en formato BILINGÜE (Lengua Nativa + Castellano) o en formato MONOLINGÜE en Castellano Comunitario.",
            fuenteOficial: "Ministerio de Cultura (D.S. 009-2021-MC) • CENEPRED • PCM (D.S. 124-2026)",
            aplicacionProyecto: "Geovisor C2: Nodos púrpuras con pulso táctico, badge de puntaje IPI (/100) y drawer con enlace a la Consola Doctrinal.",
            etiquetas: ["RENALIO", "IPI", "Triple Vulnerabilidad", "Bilingüe", "Quechua", "Aymara", "Asháninka", "Awajún"],
            detallesTecnicos: {
                "Población objetivo": "1,891 distritos del territorio nacional",
                "Régimen lingüístico": "Bilingüe obligatorio para distritos nativos; Castellano llano para distritos hispanos",
                "Estándar celular": "2 bloques <info> en CAP v1.2 para bilingües; 1 bloque <info> para hispanos"
            }
        },
        {
            id: "map-basemaps",
            termino: "Selector de Mapas Base Tácticos (4 Modos C2)",
            acronimo: "BASEMAPS_C2",
            categoria: "MAPAS",
            resumen: "Cuatro modalidades de visualización de fondo calibradas para distintos roles operacionales en sala de crisis.",
            descripcionCompleta: "El Geovisor cuenta con 4 mapas base vectoriales y satelitales optimizados: (1) Oscuro Táctico C2 (interfaz militar de baja luminiscencia para reducir fatiga en guardias 24/7); (2) Satelital de Alta Resolución (para inspección óptica de vegetación y cauces secos); (3) Terreno / Topográfico (curvas de nivel y gradientes de quebradas); y (4) Océano Pacífico (centrado en la termodinámica marina del fenómeno El Niño).",
            fuenteOficial: "COEN-DIGITAL Framework • WGS84 EPSG:4326",
            aplicacionProyecto: "Geovisor C2: Conmutador superior de 4 botones para cambio de contexto visual en 1 clic.",
            etiquetas: ["Basemap", "Oscuro Táctico", "Satelital", "Terreno", "Océano"],
            detallesTecnicos: {
                "Proyección estándar": "WGS84 EPSG:4326",
                "Optimización": "Renderizado por SVG vectorial nativo sin dependencias pesadas de terceros"
            }
        },

        // ---------------------------------------------------------------------
        // 2. ARQUITECTURA SWARM MULTI-AGENTE
        // ---------------------------------------------------------------------
        {
            id: "ag-centinela",
            termino: "Agente 1: Centinela Hidrometeorológico",
            acronimo: "SWARM_AG1",
            categoria: "AGENTES",
            resumen: "Sensor inteligente de telemetría física, radar Doppler, satélites y estaciones de aforo.",
            descripcionCompleta: "Primer eslabón de la cadena de mando autónoma. Consulta periódicamente las APIs de Open-Meteo Pro, modelos ECMWF/GFS, boyas de la DHN, radares RainViewer y WFS EMA del SENAMHI. Si detecta condiciones críticas (e.g. CAPE > 1500 J/kg, saturación de suelo > 85%, anomalía marina > +2.5°C o caudal excediendo umbral rojo), emite un evento estructurado de amenaza en un tiempo de respuesta promedio de 38 ms.",
            fuenteOficial: "Google Cloud Vertex AI • Open-Meteo Pro • SENAMHI WFS",
            aplicacionProyecto: "Backend: agents/hydro_sentinel_agent.py • Consola de Mando: Diagrama de flujo de agentes.",
            etiquetas: ["Agente 1", "Hidrometeo", "CAPE", "Open-Meteo", "Sensores"],
            detallesTecnicos: {
                "Latencia típica": "35 a 45 ms",
                "Fuentes consultadas": "Open-Meteo Pro API, Boyas DHN, WFS SENAMHI, RainViewer",
                "Salida": "Objeto tipado HydroTelemetryEvent"
            }
        },
        {
            id: "ag-evaluador",
            termino: "Agente 2: Evaluador Táctico Territorial",
            acronimo: "SWARM_AG2",
            categoria: "AGENTES",
            resumen: "Correlacionador geoespacial de amenazas con población expuesta, quebradas CENEPRED y vías MTC.",
            descripcionCompleta: "Recibe el evento hidrometeorológico y lo cruza espacialmente con las bases de datos de vulnerabilidad: identifica el cono de deyección exacto, la población en riesgo según INEI, los centros de salud amenazados, las rutas de evacuación hacia losas deportivas altas y las carreteras bloqueables de la Red Vial Nacional (MTC). Define la severidad táctica (AMARILLO, NARANJA o ROJO).",
            fuenteOficial: "CENEPRED • INEI • MTC • INDECI",
            aplicacionProyecto: "Backend: agents/tactical_evaluator_agent.py • Consola de Mando: Zona 3 de impacto demográfico.",
            etiquetas: ["Agente 2", "Táctico", "CENEPRED", "INEI", "Vías MTC", "Evacuación"],
            detallesTecnicos: {
                "Latencia típica": "90 a 120 ms",
                "Capas cruzadas": "46 Quebradas, Infraestructura Crítica, Población INEI",
                "Salida": "Objeto tipado TacticalEvaluationEvent"
            }
        },
        {
            id: "ag-linguistico",
            termino: "Agente 3: Lingüístico Cultural (RENALIO)",
            acronimo: "SWARM_AG3",
            categoria: "AGENTES",
            resumen: "Motor soberano de adaptación etnoterritorial para la traducción de alertas a lenguas originarias y castellano llano.",
            descripcionCompleta: "Garantiza el cumplimiento del D.S. 009-2021-MC. Analiza el UBIGEO y determina la variante dialectal exacta según RENALIO. Si el distrito tiene predominancia indígena, genera la recomendación operativa en la lengua originaria correspondiente (Quechua Chanka, Quechua Collao, Quechua Áncash, Aymara Altiplánico, Asháninka o Awajún) y la acompaña obligatoriamente con la versión en Castellano. Si el distrito es hispanohablante (Piura, Catacaos, Lima, etc.), despacha únicamente en Castellano Comunitario sin duplicados artificiales.",
            fuenteOficial: "Ministerio de Cultura (D.S. 009-2021-MC) • Gemini 1.5 Pro / Flash",
            aplicacionProyecto: "Backend: agents/linguistic_agent.py • Consola de Mando: Zona 5 con mensaje dual y glifo etnolingüístico.",
            etiquetas: ["Agente 3", "RENALIO", "Quechua", "Aymara", "Asháninka", "Awajún", "Bilingüe"],
            detallesTecnicos: {
                "Latencia típica": "65 a 85 ms",
                "Variantes soportadas": "qu-PE (Chanka/Collao/Áncash), ay-PE, cni-PE, agr-PE, es-PE",
                "Regla de negocio": "Bilingüe si predomina lengua nativa; Monolingüe si predomina español"
            }
        },
        {
            id: "ag-despachador",
            termino: "Agente 4: Despachador Soberano Multicanal",
            acronimo: "SWARM_AG4",
            categoria: "AGENTES",
            resumen: "Emisor en tiempo real de paquetes celulares ITU-T X.1303 / OASIS CAP v1.2 (SISMATE) y Telegram.",
            descripcionCompleta: "Ensambla el paquete oficial de difusión masiva. Para el sistema de radiodifusión celular SISMATE, formatea el XML bajo el estándar internacional OASIS CAP v1.2 con uno o dos bloques <info> según el régimen lingüístico del distrito. Simultáneamente, dispara el mensaje vecinal formateado con emojis y consejos de autoprotección hacia los canales territoriales de Telegram del COEL/COEN.",
            fuenteOficial: "ITU-T X.1303 • OASIS CAP v1.2 • MTC / SISMATE",
            aplicacionProyecto: "Backend: agents/dispatcher_agent.py • Frontend: Modal interactivo de inspección de payload XML CAP.",
            etiquetas: ["Agente 4", "Despacho", "CAP v1.2", "SISMATE", "ITU-T X.1303", "Telegram"],
            detallesTecnicos: {
                "Latencia típica": "40 a 55 ms",
                "Estándar celular": "OASIS Common Alerting Protocol v1.2 (ITU-T X.1303)",
                "Estructura bilingüe": "info[0]=es-PE, info[1]=qu-PE/ay-PE/cni-PE/agr-PE"
            }
        },

        // ---------------------------------------------------------------------
        // 3. ÍNDICES Y FÓRMULAS TÉCNICAS
        // ---------------------------------------------------------------------
        {
            id: "idx-ipi",
            termino: "Índice de Prioridad de Intervención",
            acronimo: "IPI (Triple Vulnerabilidad)",
            categoria: "INDICES",
            resumen: "Algoritmo de priorización territorial soberana que cruza CENEPRED 1,891, D.S. 124-2026-PCM, AMARU-CHIRI y RENALIO.",
            descripcionCompleta: "Índice sintético normalizado de 0 a 100 puntos que calcula la urgencia de despliegue de recursos estatales y despacho bilingüe de alertas para cada uno de los 1,891 distritos del Perú. Pondera el Nivel de Peligro CENEPRED (35%), la Declaratoria de Emergencia por El Niño D.S. 124-2026-PCM (30%), la vulnerabilidad a heladas altoandinas (15%) y la brecha etnolingüística RENALIO (20%). Puntajes ≥ 80.0 indican Triple Vulnerabilidad Crítica.",
            fuenteOficial: "COEN-DIGITAL • CENEPRED • PCM • MINCUL",
            aplicacionProyecto: "Backend: historical_data_service.py • Frontend: /doctrina y 7ma Capa Cartográfica en Geovisor.",
            etiquetas: ["IPI", "Triple Vulnerabilidad", "Fórmulas", "CENEPRED", "D.S. 124-PCM", "Ranking"],
            detallesTecnicos: {
                "Fórmula": "IPI = (0.35 * P_cenepred) + (0.30 * E_ds124) + (0.15 * H_amaru) + (0.20 * B_renalio)",
                "Escala": "≥80: Crítico • 60-79.9: Alto • 40-59.9: Medio • <40: Bajo",
                "Distritos evaluados": "1,891 distritos de todo el Perú"
            }
        },
        {
            id: "idx-iph",
            termino: "Índice de Probabilidad de Huaico",
            acronimo: "IPH",
            categoria: "INDICES",
            resumen: "Algoritmo físico-hidrológico para el cálculo de riesgo inminente de activación de flujos de detritos en quebradas.",
            descripcionCompleta: "Índice predictivo que modela la mecánica de fluidos no newtonianos en quebradas secas. Combina la energía convectiva atmosférica (CAPE en J/kg), la saturación de humedad en los cuatro estratos pedológicos del suelo (S4), la intensidad de precipitación horaria frente al umbral crítico de la cuenca (I_1h / I_crítico) y la pendiente geomorfológica del cono de deyección.",
            fuenteOficial: "Open-Meteo Pro • ECMWF • CENEPRED • ANA",
            aplicacionProyecto: "Consola Doctrinal: /doctrina (Pestaña IPH) • Próximo Sprint Operativo.",
            etiquetas: ["IPH", "Huaicos", "CAPE", "Saturación", "Física", "Cono de Deyección"],
            detallesTecnicos: {
                "Fórmula": "IPH = (0.40 * CAPE/2000 + 0.35 * S4/100 + 0.25 * I_1h/I_crit) * (1 + sin(θ))",
                "Variables pedológicas": "Estrato 1 (0-7 cm), Estrato 2 (7-28 cm), Estrato 3 (28-100 cm), Estrato 4 (100-255 cm)",
                "Umbral de activación": "IPH ≥ 75.0% dispara alerta aluvional inminente"
            }
        },
        {
            id: "idx-ish",
            termino: "Índice de Severidad de Helada",
            acronimo: "ISH",
            categoria: "INDICES",
            resumen: "Algoritmo agrometeorológico para evaluar el impacto del descenso térmico bajo cero sobre camélidos y cultivos.",
            descripcionCompleta: "Modela el estrés por congelamiento en cuencas altoandinas. Integra la caída de temperatura nocturna por debajo del umbral biológico de daño celular (-2°C a -15°C), la altitud en metros sobre el nivel del mar (foco sobre 3,800 msnm), el porcentaje de cabezas de alpaca sin cobertizo protector y la sensación térmica agudizada por viento catabático cordillerano.",
            fuenteOficial: "SENAMHI • MIDAGRI • PCM (Plan Heladas y Friajes)",
            aplicacionProyecto: "Consola Doctrinal: /doctrina (Pestaña ISH) • Próximo Sprint Operativo.",
            etiquetas: ["ISH", "Heladas", "Camélidos", "Temperatura Bajo Cero", "Altiplano"],
            detallesTecnicos: {
                "Fórmula": "ISH = (0.45 * |T_min - T_umbral|/ΔT_hist + 0.30 * (Alt-3800)/1200 + 0.25 * C_exp/C_total) * γ_viento",
                "Factor de viento": "Factor catabático cordillerano (γ_viento entre 1.0 y 1.25)",
                "Impacto primario": "Hipotermia en crías de camélidos y congelamiento de forraje"
            }
        },

        // ---------------------------------------------------------------------
        // 4. NORMATIVA Y ESTÁNDARES INTERNACIONALES
        // ---------------------------------------------------------------------
        {
            id: "norm-renalio",
            termino: "D.S. 009-2021-MC: Catálogo Oficial RENALIO",
            acronimo: "RENALIO Tomos I y II",
            categoria: "NORMATIVA",
            resumen: "Decreto Supremo que aprueba el Registro Nacional de Lenguas Indígenas u Originarias del Perú.",
            descripcionCompleta: "Norma rectora del Estado Peruano que establece el mapa etnolingüístico oficial, las 48 lenguas originarias y sus variantes dialectales territorializadas por departamento, provincia y distrito. Fundamenta el principio de no discriminación y obligatoriedad de que las alertas de desastre se emitan en la lengua predominante de la comunidad con duplicado en castellano.",
            fuenteOficial: "El Peruano • Ministerio de Cultura (Viceministerio de Interculturalidad)",
            aplicacionProyecto: "Base doctrinal del Agente 3 (Lingüístico Cultural) y la 7ma Capa Cartográfica del Geovisor.",
            etiquetas: ["D.S. 009-2021-MC", "RENALIO", "MINCUL", "Derechos Lingüísticos", "Lenguas Originarias"],
            detallesTecnicos: {
                "Lenguas registradas": "48 lenguas indígenas u originarias (4 andinas, 44 amazónicas)",
                "Estructura normativa": "Tomo I (Metodología y familias) y Tomo II (Distribución distrital)",
                "Aplicación COEN": "Garantía de derecho a la vida y alerta temprana comprensible"
            }
        },
        {
            id: "norm-ds124",
            termino: "D.S. 124-2026-PCM: Estado de Emergencia por Fenómeno El Niño",
            acronimo: "D.S. 124-2026-PCM",
            categoria: "NORMATIVA",
            resumen: "Decreto Supremo que declara el Estado de Emergencia en 893 distritos por peligro inminente y daños por lluvias.",
            descripcionCompleta: "Dispositivo legal emitido por la Presidencia del Consejo de Ministros (PCM) que faculta a los gobiernos regionales, locales, ministerios e INDECI a ejecutar medidas inmediatas de respuesta, reducción del muy alto riesgo existente y rehabilitación en las cuencas declaradas en emergencia.",
            fuenteOficial: "El Peruano • Presidencia del Consejo de Ministros (PCM)",
            aplicacionProyecto: "Incorporado en data/distritos_emergencia_el_nino_893_ds124_2026_pcm.json para el cálculo del IPI (30% de peso).",
            etiquetas: ["D.S. 124-2026-PCM", "Emergencia", "El Niño", "PCM", "INDECI", "893 Distritos"],
            detallesTecnicos: {
                "Cobertura": "893 distritos priorizados en 18 departamentos",
                "Efecto algorítmico": "Otorga automáticamente 30 puntos en el cálculo del IPI distrital"
            }
        },
        {
            id: "norm-cap-x1303",
            termino: "OASIS CAP v1.2 / ITU-T X.1303 (Protocolo de Alerta Común)",
            acronimo: "CAP v1.2 / ITU-T X.1303",
            categoria: "NORMATIVA",
            resumen: "Estándar internacional para el intercambio de alertas de emergencia entre sistemas multisensoriales y celulares.",
            descripcionCompleta: "Formato digital estándar basado en XML que permite unificar avisos públicos de protección civil en todo el mundo. En el Perú, es la base técnica del Sistema de Mensajería de Alerta Temprana de Emergencia (SISMATE) operado por el MTC. La innovación de COEN-DIGITAL consiste en generar alertas bilingües emitiendo dos bloques informativos independientes (<info language='es-PE'> e <info language='qu-PE'>).",
            fuenteOficial: "ITU (Unión Internacional de Telecomunicaciones) • OASIS Open Standard • MTC",
            aplicacionProyecto: "Agente 4 (Despachador Soberano) y visor interactivo de XML en la Consola de Mando.",
            etiquetas: ["CAP v1.2", "ITU-T X.1303", "SISMATE", "MTC", "XML", "Cell Broadcast"],
            detallesTecnicos: {
                "Estructura XML": "<alert> -> <info> (Category, Urgency, Severity, Headline, Description, Instruction)",
                "Bilingüismo digital": "Compatibilidad certificada con smartphones y terminales Cell Broadcast"
            }
        },

        // ---------------------------------------------------------------------
        // 5. VARIABLES FÍSICAS Y METEOROLOGÍA
        // ---------------------------------------------------------------------
        {
            id: "met-cape",
            termino: "Energía Potencial Convectiva Disponible",
            acronimo: "CAPE (J/kg)",
            categoria: "METEOROLOGIA",
            resumen: "Medida de la inestabilidad atmosférica y flotabilidad del aire causante de tormentas severas.",
            descripcionCompleta: "Representa la cantidad de energía que una parcela de aire ganaría al ascender libremente a través de la atmósfera. Valores de CAPE superiores a 1,200 J/kg en la vertiente occidental de los Andes indican un alto potencial de formación de nubes cumulonimbus de rápido desarrollo capaces de descargar lluvias torrenciales en cabeceras de quebradas secas en menos de 45 minutos.",
            fuenteOficial: "NOAA • ECMWF • Open-Meteo Pro",
            aplicacionProyecto: "Componente central del Agente 1 (Centinela) y variable principal del IPH.",
            etiquetas: ["CAPE", "Inestabilidad", "J/kg", "Cumulonimbus", "Lluvia Intensa"],
            detallesTecnicos: {
                "Unidades": "Joules por kilogramo (J/kg)",
                "Escala de riesgo": "<500 J/kg: Estable • 500-1200: Moderada • >1200: Tormenta severa aluvional"
            }
        },
        {
            id: "met-suelo-4estratos",
            termino: "Saturación Pedológica de Suelo en 4 Estratos",
            acronimo: "Saturación S4 (%)",
            categoria: "METEOROLOGIA",
            resumen: "Porcentaje de humedad acumulada en el perfil de suelo que anula la capacidad de infiltración.",
            descripcionCompleta: "El suelo actúa como una esponja natural. Cuando los cuatro estratos pedológicos (0-7 cm, 7-28 cm, 28-100 cm y 100-255 cm) superan el 80% de saturación hídrica, el agua de lluvia ya no puede infiltrarse y se transforma en escorrentía superficial violenta (100% de escurrimiento), desestabilizando laderas rocosas y detonando flujos de detritos (huaicos).",
            fuenteOficial: "ECMWF Land Model • Open-Meteo Pro",
            aplicacionProyecto: "Telemetría en tiempo real de cuencas en Consola de Mando y Municipal.",
            etiquetas: ["Suelo", "Saturación", "Humedad", "Infiltración", "Escorrentía"],
            detallesTecnicos: {
                "Estrato 1": "0 a 7 cm (superficial)",
                "Estrato 2": "7 a 28 cm (cuello radicular)",
                "Estrato 3": "28 a 100 cm (subsuelo medio)",
                "Estrato 4": "100 a 255 cm (capa profunda)"
            }
        },
        {
            id: "met-onda-kelvin",
            termino: "Onda Kelvin Oceánica Cálida de Hundimiento",
            acronimo: "Downwelling Kelvin Wave",
            categoria: "METEOROLOGIA",
            resumen: "Pulso termodinámico que viaja a lo largo del ecuador profundizando la termoclina y calentando la costa peruana.",
            descripcionCompleta: "Onda atrapada en la línea ecuatorial generada por pulsos de viento del oeste en el Pacífico occidental. Al chocar contra la costa sudamericana (frente a Tumbes y Piura), la onda se bifurca hacia el norte y el sur, hundiendo la termoclina (capa fría) e impidiendo el afloramiento costero de la Corriente de Humboldt. Esto dispara la evaporación marina extrema y alimenta las nubes de tormenta en la costa desértica del Perú.",
            fuenteOficial: "IMARPE • NOAA • ENFEN",
            aplicacionProyecto: "Detectada mediante las boyas oceanográficas de Paita y Puerto Pizarro en el Geovisor C2.",
            etiquetas: ["Onda Kelvin", "ENFEN", "Termoclina", "IMARPE", "Calentamiento Marino"],
            detallesTecnicos: {
                "Velocidad de propagación": "~2.5 m/s (~200 km/día)",
                "Tiempo de viaje transversal": "Aproximadamente 2 meses desde Indonesia hasta Paita",
                "Efecto local": "Profundización de la isoterma de 20°C a más de 80 metros"
            }
        }
    ];

    // Filtrado interactivo
    const itemsFiltrados = useMemo(() => {
        return ITEMS_GLOSARIO.filter(item => {
            const coincideCategoria = categoriaActiva === "TODOS" || item.categoria === categoriaActiva;
            const q = busqueda.toLowerCase().trim();
            const coincideBusqueda =
                !q ||
                item.termino.toLowerCase().includes(q) ||
                (item.acronimo && item.acronimo.toLowerCase().includes(q)) ||
                item.resumen.toLowerCase().includes(q) ||
                item.descripcionCompleta.toLowerCase().includes(q) ||
                item.etiquetas.some(t => t.toLowerCase().includes(q));

            return coincideCategoria && coincideBusqueda;
        });
    }, [categoriaActiva, busqueda]);

    const detalleActual = ITEMS_GLOSARIO.find(i => i.id === itemSeleccionado) || itemsFiltrados[0] || ITEMS_GLOSARIO[0];

    return (
        <section className="space-y-6 pb-12">
            {/* ========================================================================= */}
            {/* CABECERA INSTITUCIONAL Y BARRA DE IDENTIDAD                                */}
            {/* ========================================================================= */}
            <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-800/50 rounded-2xl p-5 shadow-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <div className="flex items-center gap-2.5 mb-1.5">
                        <span className="p-2 rounded-xl bg-indigo-900/60 border border-indigo-600 text-indigo-300">
                            <BookOpen className="w-5 h-5" />
                        </span>
                        <div>
                            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-indigo-400 bg-indigo-950 px-2 py-0.5 rounded border border-indigo-800">
                                DICCIONARIO TÁCTICO &amp; DOCTRINA DE SISTEMAS
                            </span>
                            <h1 className="text-xl font-black text-white tracking-wide">
                                Consola de Glosario &amp; Catálogo de Mapas C2
                            </h1>
                        </div>
                    </div>
                    <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
                        Compendio exhaustivo de especificaciones técnicas, arquitectura de agentes, formulaciones matemáticas, fuentes oficiales de datos y descripción operacional de las capas cartográficas del Gemelo Digital Territorial <b>COEN-DIGITAL</b>.
                    </p>
                </div>

                {/* Enlaces de Retorno Rápido */}
                <div className="flex items-center gap-2">
                    <Link
                        href="/geovisor"
                        className="px-3.5 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-lg shadow-sky-600/30"
                    >
                        <Satellite className="w-3.5 h-3.5" />
                        <span>Abrir Geovisor C2</span>
                    </Link>
                    <Link
                        href="/doctrina"
                        className="px-3.5 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-lg shadow-purple-600/30"
                    >
                        <Scale className="w-3.5 h-3.5" />
                        <span>Consola Doctrinal</span>
                    </Link>
                </div>
            </div>

            {/* ========================================================================= */}
            {/* BARRA DE BÚSQUEDA Y SELECTOR DE CATEGORÍAS                                 */}
            {/* ========================================================================= */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3">
                <div className="flex flex-col md:flex-row items-center justify-between gap-3">
                    {/* Input de Búsqueda Reactiva */}
                    <div className="relative w-full md:w-96">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                        <input
                            type="text"
                            placeholder="Buscar término, acrónimo, ley, mapa o sensor..."
                            value={busqueda}
                            onChange={(e) => setBusqueda(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-700 text-slate-200 text-xs pl-9 pr-4 py-2.5 rounded-xl focus:outline-none focus:border-indigo-500 transition shadow-inner"
                        />
                        {busqueda && (
                            <button
                                onClick={() => setBusqueda("")}
                                className="absolute right-3 top-2.5 text-xs text-slate-500 hover:text-slate-300"
                            >
                                ✕
                            </button>
                        )}
                    </div>

                    {/* Contador de Elementos Encontrados */}
                    <div className="text-xs text-slate-400 flex items-center gap-2">
                        <span>Elementos catalogados:</span>
                        <span className="font-mono font-bold text-indigo-400 bg-indigo-950 px-2 py-0.5 rounded border border-indigo-800">
                            {itemsFiltrados.length} de {ITEMS_GLOSARIO.length}
                        </span>
                    </div>
                </div>

                {/* Filtros de Categoría */}
                <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-800 text-xs">
                    <span className="text-slate-500 font-semibold mr-1 flex items-center gap-1 text-[11px]">
                        <Filter className="w-3 h-3" /> Categoría:
                    </span>
                    {(
                        [
                            { id: "TODOS", label: "Todos los Términos", icon: BookOpen },
                            { id: "MAPAS", label: "Mapas & Capas Cartográficas", icon: Map },
                            { id: "AGENTES", label: "Arquitectura Agentes IA", icon: Cpu },
                            { id: "INDICES", label: "Índices & Fórmulas", icon: Scale },
                            { id: "NORMATIVA", label: "Leyes, D.S. & Estándares", icon: FileText },
                            { id: "METEOROLOGIA", label: "Física & Meteorología", icon: Waves }
                        ] as const
                    ).map((cat) => {
                        const Icon = cat.icon;
                        const isActivo = categoriaActiva === cat.id;
                        return (
                            <button
                                key={cat.id}
                                onClick={() => setCategoriaActiva(cat.id)}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition ${
                                    isActivo
                                        ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                                        : "bg-slate-950 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800"
                                }`}
                            >
                                <Icon className="w-3.5 h-3.5" />
                                <span>{cat.label}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* ========================================================================= */}
            {/* GRID PRINCIPAL: LISTADO INTERACTIVO (IZQ) + DETALLE EN PROFUNDIDAD (DER)   */}
            {/* ========================================================================= */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                {/* Panel Izquierdo: Lista de Tarjetas (5 Columnas) */}
                <div className="lg:col-span-5 space-y-2.5 max-h-[750px] overflow-y-auto pr-1">
                    {itemsFiltrados.length === 0 ? (
                        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center text-slate-500 text-xs">
                            <Info className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                            No se encontraron términos para los criterios de búsqueda actuales.
                        </div>
                    ) : (
                        itemsFiltrados.map((item) => {
                            const isSelected = (itemSeleccionado === item.id) || (!itemSeleccionado && detalleActual.id === item.id);
                            return (
                                <div
                                    key={item.id}
                                    onClick={() => setItemSeleccionado(item.id)}
                                    className={`p-3.5 rounded-xl border transition cursor-pointer text-xs space-y-1.5 ${
                                        isSelected
                                            ? "bg-indigo-950/60 border-indigo-600 shadow-lg shadow-indigo-950/50"
                                            : "bg-slate-900/90 border-slate-800 hover:bg-slate-800/80 hover:border-slate-700"
                                    }`}
                                >
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="font-bold text-slate-100 leading-snug">
                                            {item.termino}
                                        </div>
                                        {item.acronimo && (
                                            <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-950 border border-slate-700 text-indigo-300 shrink-0">
                                                {item.acronimo}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                                        {item.resumen}
                                    </p>
                                    <div className="flex flex-wrap items-center gap-1 pt-1">
                                        <span className="text-[9px] uppercase font-bold text-slate-400 bg-slate-950/80 px-1.5 py-0.5 rounded">
                                            {item.categoria}
                                        </span>
                                        <span className="text-[9px] text-slate-500">
                                            • {item.fuenteOficial.split("•")[0]?.trim()}
                                        </span>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Panel Derecho: Ficha Técnica Completa (7 Columnas) */}
                <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl space-y-5">
                    {detalleActual && (
                        <>
                            {/* Cabecera de la Ficha */}
                            <div className="border-b border-slate-800 pb-4 space-y-2">
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-900/60 text-indigo-300 border border-indigo-700">
                                            FICHA TÉCNICA COEN-DIGITAL
                                        </span>
                                        <span className="text-[10px] font-mono uppercase text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                                            CATEGORÍA: {detalleActual.categoria}
                                        </span>
                                    </div>
                                    {detalleActual.acronimo && (
                                        <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
                                            {detalleActual.acronimo}
                                        </span>
                                    )}
                                </div>

                                <h2 className="text-lg font-black text-white leading-snug">
                                    {detalleActual.termino}
                                </h2>
                                <p className="text-xs text-indigo-200/90 font-medium">
                                    {detalleActual.resumen}
                                </p>
                            </div>

                            {/* Descripción Doctrinal Detallada */}
                            <div className="space-y-2">
                                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                                    <Info className="w-3.5 h-3.5 text-indigo-400" />
                                    Descripción Doctrinal &amp; Funcionamiento
                                </h3>
                                <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80 text-justify">
                                    {detalleActual.descripcionCompleta}
                                </p>
                            </div>

                            {/* Aplicación Concreta en el Proyecto */}
                            <div className="bg-gradient-to-r from-blue-950/40 to-indigo-950/30 border border-blue-900/50 rounded-xl p-3.5 space-y-1.5">
                                <div className="text-[11px] font-bold text-blue-300 flex items-center gap-1.5">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
                                    Implementación en COEN-DIGITAL
                                </div>
                                <p className="text-xs text-slate-300 leading-relaxed">
                                    {detalleActual.aplicacionProyecto}
                                </p>
                            </div>

                            {/* Parámetros Técnicos / Físicos */}
                            {detalleActual.detallesTecnicos && (
                                <div className="space-y-2">
                                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                                        <Cpu className="w-3.5 h-3.5 text-emerald-400" />
                                        Parámetros de Calibración &amp; Telemetría
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                                        {Object.entries(detalleActual.detallesTecnicos).map(([clave, valor]) => (
                                            <div key={clave} className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                                                <span className="text-slate-400 block text-[10px] font-semibold">{clave}:</span>
                                                <span className="font-mono text-slate-200 text-[11px] font-bold">{valor}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Fuentes Oficiales y Etiquetas */}
                            <div className="pt-3 border-t border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-3 text-xs">
                                <div>
                                    <span className="text-[10px] text-slate-500 block">Autoridades Oficiales Validadoras:</span>
                                    <span className="text-[11px] text-slate-300 font-semibold">
                                        {detalleActual.fuenteOficial}
                                    </span>
                                </div>

                                <div className="flex flex-wrap gap-1">
                                    {detalleActual.etiquetas.map((t, idx) => (
                                        <span
                                            key={idx}
                                            className="text-[10px] font-mono text-indigo-300 bg-indigo-950/70 border border-indigo-800/60 px-2 py-0.5 rounded-full"
                                        >
                                            #{t}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* ========================================================================= */}
            {/* SECCIÓN INFORMATIVA: RESUMEN DE LAS 7 CAPAS CARTOGRÁFICAS EN UN SOLO LUGAR */}
            {/* ========================================================================= */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2">
                        <Map className="w-5 h-5 text-sky-400" />
                        <div>
                            <h2 className="text-sm font-bold text-white tracking-wide">
                                Matriz Sinóptica de las Capas Cartográficas del Geovisor C2
                            </h2>
                            <p className="text-[11px] text-slate-400">
                                Referencia rápida de activación para los operadores de la Sala de Crisis Nacional.
                            </p>
                        </div>
                    </div>
                    <Link
                        href="/geovisor"
                        className="text-xs font-semibold text-sky-400 hover:text-sky-300 flex items-center gap-1 transition"
                    >
                        <span>Abrir Geovisor Táctico</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                    <div className="bg-slate-950 p-3 rounded-xl border border-orange-900/40 space-y-1">
                        <div className="flex items-center gap-1.5 font-bold text-orange-400 text-[11px]">
                            <Waves className="w-3.5 h-3.5" />
                            <span>1. NOAA SST Niño 1+2</span>
                        </div>
                        <p className="text-[10px] text-slate-400 leading-relaxed">
                            Polígono térmico en el Pacífico con anomalía marina (+2.5°C a +3.2°C). Gatilla factor estacional x1.35.
                        </p>
                    </div>

                    <div className="bg-slate-950 p-3 rounded-xl border border-sky-900/40 space-y-1">
                        <div className="flex items-center gap-1.5 font-bold text-sky-400 text-[11px]">
                            <Compass className="w-3.5 h-3.5" />
                            <span>2. Boyas DHN / IMARPE</span>
                        </div>
                        <p className="text-[10px] text-slate-400 leading-relaxed">
                            Estaciones oceanográficas fondeadas en Paita y Puerto Pizarro. Monitorea ondas Kelvin y termoclina profunda.
                        </p>
                    </div>

                    <div className="bg-slate-950 p-3 rounded-xl border border-red-900/40 space-y-1">
                        <div className="flex items-center gap-1.5 font-bold text-red-400 text-[11px]">
                            <Mountain className="w-3.5 h-3.5" />
                            <span>3. 46 Quebradas Críticas</span>
                        </div>
                        <p className="text-[10px] text-slate-400 leading-relaxed">
                            Conos de deyección (Chosica, Trujillo, Huaycoloro) con umbrales mm/h y tiempos de concentración aluvional.
                        </p>
                    </div>

                    <div className="bg-slate-950 p-3 rounded-xl border border-blue-900/40 space-y-1">
                        <div className="flex items-center gap-1.5 font-bold text-blue-400 text-[11px]">
                            <Droplets className="w-3.5 h-3.5" />
                            <span>4. Aforos Fluviales</span>
                        </div>
                        <p className="text-[10px] text-slate-400 leading-relaxed">
                            Caudales en m³/s de ríos Piura, Tumbes, Rímac y La Leche contrastados contra récords de El Niño 1998.
                        </p>
                    </div>

                    <div className="bg-slate-950 p-3 rounded-xl border border-rose-900/40 space-y-1">
                        <div className="flex items-center gap-1.5 font-bold text-rose-400 text-[11px]">
                            <ShieldAlert className="w-3.5 h-3.5" />
                            <span>5. Memoria FEN 1998 &amp; 2017</span>
                        </div>
                        <p className="text-[10px] text-slate-400 leading-relaxed">
                            Catálogo geolocalizado de zonas de falla de defensas ribereñas, puentes colapsados y lecciones tácticas.
                        </p>
                    </div>

                    <div className="bg-slate-950 p-3 rounded-xl border border-cyan-900/40 space-y-1">
                        <div className="flex items-center gap-1.5 font-bold text-cyan-400 text-[11px]">
                            <Snowflake className="w-3.5 h-3.5" />
                            <span>6. Heladas AMARU-CHIRI</span>
                        </div>
                        <p className="text-[10px] text-slate-400 leading-relaxed">
                            Corredor altoandino (&gt;3,800 msnm) con temperaturas bajo cero (-14°C) y mortandad de hatos de camélidos.
                        </p>
                    </div>

                    <div className="bg-slate-950 p-3 rounded-xl border border-purple-900/40 space-y-1">
                        <div className="flex items-center gap-1.5 font-bold text-purple-400 text-[11px]">
                            <Languages className="w-3.5 h-3.5" />
                            <span>7. RENALIO &amp; IPI</span>
                        </div>
                        <p className="text-[10px] text-slate-400 leading-relaxed">
                            Priorización de triple vulnerabilidad sobre 1,891 distritos y despacho bilingüe obligatorio ITU-T X.1303.
                        </p>
                    </div>

                    <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
                        <div className="flex items-center gap-1.5 font-bold text-slate-300 text-[11px]">
                            <Layers className="w-3.5 h-3.5" />
                            <span>8. Radares &amp; GOES-16</span>
                        </div>
                        <p className="text-[10px] text-slate-400 leading-relaxed">
                            Bucle temporal dinámico (-120 min a +60 min) de reflectividad radar Doppler y topes convectivos satelitales.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}
