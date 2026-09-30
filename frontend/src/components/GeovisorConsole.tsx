"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import {
    MapPin,
    Layers,
    Search,
    Satellite,
    Mountain,
    ShieldAlert,
    ExternalLink,
    AlertTriangle,
    Key,
    CheckCircle2,
    XCircle,
    Maximize2,
    Minimize2,
    Waves,
    CloudRain,
    Snowflake,
    Radio,
    Play,
    Pause,
    Clock,
    Activity,
    Compass,
    Eye,
    EyeOff,
    Sliders,
    BookOpen,
    Droplets,
    ChevronDown,
    ChevronRight,
    HelpCircle,
    RefreshCw,
    Languages,
    Scale,
    Tv
} from "lucide-react";
import VideoWallC2 from "./VideoWallC2";

// Tipos de datos unificados para el Geovisor
export interface PuntoCartografico {
    id: string;
    nombre: string;
    region: string;
    provincia?: string;
    ubigeo: string;
    tipo: "BOYA_TSM" | "CLIMA_UBIGEO" | "QUEBRADA_CRITICA" | "ESTACION_AFORO" | "MEMORIA_FEN" | "HELADA_CHIRI" | "RENALIO_ETNO";
    nivel: "ROJO" | "AMARILLO" | "VERDE";
    lat: number;
    lng: number;
    detalles: string;
    cuenca?: string;
    // Métricas etnoterritoriales e IPI
    ipiScore?: number;
    lenguaNombre?: string;
    esBilingue?: boolean;
    cenepredRiesgo?: string;
    ds124Pcm?: boolean;
    // Métricas marinas y TSM (NOAA / IMARPE / DHN)
    tsmTemperatura?: number;
    tsmAnomalia?: number;
    ondaKelvin?: boolean;
    // Métricas meteorológicas (Open-Meteo Pro / ECMWF)
    lluvia24h?: number;
    capeJkg?: number;
    sueloPct?: number;
    // Métricas hidrológicas y aforo (ANA / SENAMHI)
    rio?: string;
    caudalActualM3s?: number;
    caudalUmbralRojoM3s?: number;
    caudalRecord1998M3s?: number;
    // Métricas de Quebradas Críticas (CENEPRED / INGEMMET)
    umbralMmH?: number;
    tiempoConcentracionH?: number;
    poblacionAfectada?: number;
    leccionHistorica?: string;
    historialActivaciones?: number[];
    // Métricas de Heladas (AMARU-CHIRI)
    temperaturaC?: number;
    camelidosExpuestos?: number;
    // Posición porcentual para visualizador SVG de contingencia
    cx: number;
    cy: number;
}

// 1. BOYAS OCEANOGRÁFICAS DHN / IMARPE / NOAA TSM
const BOYAS_OCEANOGRAFICAS: PuntoCartografico[] = [
    {
        id: "b-tumbes",
        nombre: "Boya DHN Puerto Pizarro (Tumbes)",
        region: "Tumbes",
        provincia: "Zarumilla",
        ubigeo: "240101",
        tipo: "BOYA_TSM",
        nivel: "ROJO",
        lat: -3.48,
        lng: -80.45,
        detalles: "TSM: 26.8°C (Anomalía +3.2°C) • Onda Kelvin Activa • Región Niño 1+2 Extrema",
        tsmTemperatura: 26.8,
        tsmAnomalia: 3.2,
        ondaKelvin: true,
        cuenca: "Mar de Grau / Litoral Norte",
        cx: 20,
        cy: 11
    },
    {
        id: "b-paita",
        nombre: "Boya DHN Paita (Piura)",
        region: "Piura",
        provincia: "Paita",
        ubigeo: "200101",
        tipo: "BOYA_TSM",
        nivel: "ROJO",
        lat: -5.08,
        lng: -81.25,
        detalles: "TSM: 24.2°C (Anomalía +3.2°C) • Termoclina profundizada a 88m • Pulso Kelvin Máximo",
        tsmTemperatura: 24.2,
        tsmAnomalia: 3.2,
        ondaKelvin: true,
        cuenca: "Mar de Grau / Piura",
        cx: 18,
        cy: 21
    },
    {
        id: "b-chimbote",
        nombre: "Boya DHN Chimbote (Áncash)",
        region: "Áncash",
        provincia: "Santa",
        ubigeo: "021801",
        tipo: "BOYA_TSM",
        nivel: "ROJO",
        lat: -9.08,
        lng: -78.68,
        detalles: "TSM: 21.8°C (Anomalía +2.6°C) • Termoclina 72m • Pulso Kelvin en avance hacia costa central",
        tsmTemperatura: 21.8,
        tsmAnomalia: 2.6,
        ondaKelvin: true,
        cuenca: "Mar de Grau / Áncash",
        cx: 28,
        cy: 42
    },
    {
        id: "b-callao",
        nombre: "Boya DHN Callao (Lima)",
        region: "Lima",
        provincia: "Callao",
        ubigeo: "070101",
        tipo: "BOYA_TSM",
        nivel: "ROJO",
        lat: -12.05,
        lng: -77.30,
        detalles: "TSM: 20.1°C (Anomalía +2.6°C) • Calentamiento costero frente a Lima Metropolitana",
        tsmTemperatura: 20.1,
        tsmAnomalia: 2.6,
        ondaKelvin: true,
        cuenca: "Mar de Grau / Lima Central",
        cx: 37,
        cy: 60
    },
    {
        id: "b-pisco",
        nombre: "Boya DHN Paracas / Pisco (Ica)",
        region: "Ica",
        provincia: "Pisco",
        ubigeo: "110501",
        tipo: "BOYA_TSM",
        nivel: "AMARILLO",
        lat: -13.78,
        lng: -76.35,
        detalles: "TSM: 19.2°C (Anomalía +2.0°C) • Vigilancia térmica costera y oleaje anómalo",
        tsmTemperatura: 19.2,
        tsmAnomalia: 2.0,
        ondaKelvin: true,
        cuenca: "Mar de Grau / Ica",
        cx: 44,
        cy: 69
    },
    {
        id: "b-ilo",
        nombre: "Boya DHN Ilo (Moquegua)",
        region: "Moquegua",
        provincia: "Ilo",
        ubigeo: "180301",
        tipo: "BOYA_TSM",
        nivel: "VERDE",
        lat: -17.65,
        lng: -71.42,
        detalles: "TSM: 17.6°C (Anomalía +1.3°C) • Condiciones marítimas frías dentro de rango",
        tsmTemperatura: 17.6,
        tsmAnomalia: 1.3,
        ondaKelvin: false,
        cuenca: "Mar de Grau / Litoral Sur",
        cx: 65,
        cy: 88
    }
];

// 2. ESTACIONES DE AFORO HIDROLÓGICO (ANA / SENAMHI - data/estaciones_hidrologicas_aforo.json)
const ESTACIONES_AFORO_CRITICAS: PuntoCartografico[] = [
    {
        id: "est-piu-01",
        nombre: "Estación Aforo Puente Sánchez Cerro (Piura)",
        region: "Piura",
        provincia: "Piura",
        ubigeo: "200101",
        tipo: "ESTACION_AFORO",
        nivel: "ROJO",
        lat: -5.1953,
        lng: -80.6272,
        rio: "Río Piura",
        caudalActualM3s: 1850,
        caudalUmbralRojoM3s: 2000,
        caudalRecord1998M3s: 4424,
        cuenca: "Cuenca del Río Piura",
        detalles: "Caudal: 1,850 m³/s • Umbral rojo: 2,000 m³/s • Récord 1998: 4,424 m³/s (Inundación total)",
        leccionHistorica: "En 1998 el desborde inundó Castilla, el Malecón Eguiguren y colapsó el Puente Bolognesi.",
        cx: 27,
        cy: 22
    },
    {
        id: "est-piu-02",
        nombre: "Estación Aforo Puente Independencia (Catacaos)",
        region: "Piura",
        provincia: "Piura",
        ubigeo: "200105",
        tipo: "ESTACION_AFORO",
        nivel: "ROJO",
        lat: -5.2711,
        lng: -80.6789,
        rio: "Río Piura (Bajo Piura)",
        caudalActualM3s: 2250,
        caudalUmbralRojoM3s: 2100,
        caudalRecord1998M3s: 4200,
        cuenca: "Bajo Piura",
        detalles: "Caudal: 2,250 m³/s • ¡SUPERA UMBRAL ROJO (2,100 m³/s)! • Rotura inminente de Dique Pedregal",
        leccionHistorica: "En 2017 el caudal de 2,300 m³/s rompió el dique e inundó Catacaos bajo 1.8 metros de agua.",
        cx: 26,
        cy: 23
    },
    {
        id: "est-tum-01",
        nombre: "Estación Aforo El Tigre (Río Tumbes)",
        region: "Tumbes",
        provincia: "Tumbes",
        ubigeo: "240101",
        tipo: "ESTACION_AFORO",
        nivel: "ROJO",
        lat: -3.7667,
        lng: -80.4667,
        rio: "Río Puyango-Tumbes",
        caudalActualM3s: 940,
        caudalUmbralRojoM3s: 1000,
        caudalRecord1998M3s: 3600,
        cuenca: "Cuenca Río Tumbes",
        detalles: "Caudal: 940 m³/s • Alerta Roja Desborde • Inundación del Malecón Benavides y cultivos de plátano",
        leccionHistorica: "En 1998 el río aisló Tumbes por semanas destruyendo el sistema de agua potable.",
        cx: 25,
        cy: 13
    },
    {
        id: "est-rim-01",
        nombre: "Estación Aforo Chosica (Río Rímac)",
        region: "Lima",
        provincia: "Lima",
        ubigeo: "150118",
        tipo: "ESTACION_AFORO",
        nivel: "ROJO",
        lat: -11.9428,
        lng: -76.7094,
        rio: "Río Rímac",
        caudalActualM3s: 118.5,
        caudalUmbralRojoM3s: 120.0,
        caudalRecord1998M3s: 175.0,
        cuenca: "Cuenca Media Río Rímac",
        detalles: "Caudal: 118.5 m³/s • Suelo 88% saturado • Aluviones laterales activos en quebradas Carossio y Pedregal",
        leccionHistorica: "Caudales >110 m³/s en Chosica socavan las bases de la Carretera Central Km 32-38.",
        cx: 46,
        cy: 58
    },
    {
        id: "est-lam-01",
        nombre: "Estación Aforo Puchaca (Río La Leche)",
        region: "Lambayeque",
        provincia: "Lambayeque",
        ubigeo: "140304",
        tipo: "ESTACION_AFORO",
        nivel: "AMARILLO",
        lat: -6.4500,
        lng: -79.7800,
        rio: "Río La Leche",
        caudalActualM3s: 320,
        caudalUmbralRojoM3s: 400,
        caudalRecord1998M3s: 1200,
        cuenca: "Valle La Leche / Íllimo",
        detalles: "Caudal: 320 m³/s • Amenaza directa a Pacora, Íllimo y Panamericana Norte",
        leccionHistorica: "En 1998 y 2017 destruyó el Puente La Leche dejando incomunicado el norte del Perú.",
        cx: 31,
        cy: 30
    }
];

// 3. QUEBRADAS CRÍTICAS NACIONALES (ANA / CENEPRED / data/catalogo_quebradas_criticas.json)
const QUEBRADAS_CRITICAS_MAPA: PuntoCartografico[] = [
    {
        id: "q-chosica-carossio",
        nombre: "Quebrada Carossio (Chosica)",
        region: "Lima",
        provincia: "Lima",
        ubigeo: "150118",
        tipo: "QUEBRADA_CRITICA",
        nivel: "ROJO",
        lat: -11.9428,
        lng: -76.7094,
        cuenca: "Río Rímac",
        umbralMmH: 14.5,
        tiempoConcentracionH: 1.8,
        poblacionAfectada: 42000,
        detalles: "Umbral: 14.5 mm/h • Tiempo conc: 1.8 h • Diques desarenadores al 85% de capacidad",
        historialActivaciones: [1987, 1998, 2015, 2017, 2023],
        leccionHistorica: "En 1987 dejó decenas de víctimas; en 2017 los diques contuvieron 40,000 m³ de lodo.",
        cx: 46,
        cy: 58
    },
    {
        id: "q-trujillo-ildefonso",
        nombre: "Quebrada San Ildefonso (El Porvenir / Trujillo)",
        region: "La Libertad",
        provincia: "Trujillo",
        ubigeo: "130102",
        tipo: "QUEBRADA_CRITICA",
        nivel: "ROJO",
        lat: -8.0833,
        lng: -78.9667,
        cuenca: "Río Moche",
        umbralMmH: 12.0,
        tiempoConcentracionH: 2.5,
        poblacionAfectada: 85000,
        detalles: "Umbral: 12.0 mm/h • Reincidencia extrema (6 activaciones históricas) • Cono hacia Centro Histórico",
        historialActivaciones: [1891, 1925, 1983, 1998, 2017, 2023],
        leccionHistorica: "En marzo 2017 se activó 7 veces consecutivas cruzando Trujillo hasta el balneario de Buenos Aires.",
        cx: 34,
        cy: 39
    },
    {
        id: "q-huaycoloro",
        nombre: "Quebrada Huaycoloro (San Antonio de Huarochirí / Lurigancho)",
        region: "Lima",
        provincia: "Huarochirí / Lima",
        ubigeo: "150118",
        tipo: "QUEBRADA_CRITICA",
        nivel: "ROJO",
        lat: -11.9833,
        lng: -76.9167,
        cuenca: "Río Rímac",
        umbralMmH: 16.0,
        tiempoConcentracionH: 2.2,
        poblacionAfectada: 68000,
        detalles: "Cruce crítico con Autopista Ramiro Prialé y Planta La Atarjea (Agua de Lima)",
        historialActivaciones: [1998, 2017, 2023],
        leccionHistorica: "En 2017 destruyó el puente Huaycoloro y suspendió el agua potable a 9 millones de limeños por turbidez >10,000 NTU.",
        cx: 44,
        cy: 57
    },
    {
        id: "q-leon-trujillo",
        nombre: "Quebrada El León (Huanchaco / La Esperanza)",
        region: "La Libertad",
        provincia: "Trujillo",
        ubigeo: "130104",
        tipo: "QUEBRADA_CRITICA",
        nivel: "AMARILLO",
        lat: -8.0167,
        lng: -79.0833,
        cuenca: "Costera Norte Trujillo",
        umbralMmH: 15.0,
        tiempoConcentracionH: 3.0,
        poblacionAfectada: 35000,
        detalles: "Umbral: 15.0 mm/h • Cono de deyección cruza la Panamericana Norte y balneario Huanchaco",
        historialActivaciones: [1998, 2017],
        leccionHistorica: "En 1998 cortó el tránsito interprovincial hacia Chiclayo y Piura durante 12 días.",
        cx: 33,
        cy: 38
    }
];

// 4. MEMORIA HISTÓRICA FEN 1998 / 2017 (data/historico_fen_1998_2017.json)
const MEMORIA_HISTORICA_FEN: PuntoCartografico[] = [
    {
        id: "fen-catacaos",
        nombre: "Memoria FEN: Catacaos (Bajo Piura)",
        region: "Piura",
        provincia: "Piura",
        ubigeo: "200105",
        tipo: "MEMORIA_FEN",
        nivel: "ROJO",
        lat: -5.2711,
        lng: -80.6789,
        cuenca: "Río Piura",
        poblacionAfectada: 75000,
        detalles: "Zonificación histórica de máxima recurrencia FEN 1998 y 2017 • Rotura de diques",
        leccionHistorica: "Tiempo de anticipación: 4 horas entre la crecida en Sánchez Cerro y la inundación en Catacaos. El Dique Pedregal es el punto más débil.",
        cx: 26,
        cy: 23
    },
    {
        id: "fen-illimo",
        nombre: "Memoria FEN: Íllimo (Valle La Leche)",
        region: "Lambayeque",
        provincia: "Lambayeque",
        ubigeo: "140304",
        tipo: "MEMORIA_FEN",
        nivel: "ROJO",
        lat: -6.4800,
        lng: -79.8500,
        cuenca: "Río La Leche",
        poblacionAfectada: 12000,
        detalles: "Inundación por colapso de faja marginal del Río La Leche • Aislamiento distrital",
        leccionHistorica: "Tiempo de anticipación: 8 horas. En 1998 el 80% de la zona urbana quedó bajo agua.",
        cx: 31,
        cy: 29
    },
    {
        id: "fen-castilla",
        nombre: "Memoria FEN: Castilla (Piura)",
        region: "Piura",
        provincia: "Piura",
        ubigeo: "200101",
        tipo: "MEMORIA_FEN",
        nivel: "ROJO",
        lat: -5.1989,
        lng: -80.6200,
        cuenca: "Río Piura",
        poblacionAfectada: 160000,
        detalles: "Colapso histórico de defensas ribereñas del Río Piura • Inundación urbana",
        leccionHistorica: "Tiempo de anticipación: 6 horas. Daño a infraestructura crítica: Puente Bolognesi y Hospital Cayetano Heredia.",
        cx: 27,
        cy: 22
    },
    {
        id: "fen-porvenir",
        nombre: "Memoria FEN: El Porvenir (Trujillo)",
        region: "La Libertad",
        provincia: "Trujillo",
        ubigeo: "130102",
        tipo: "MEMORIA_FEN",
        nivel: "ROJO",
        lat: -8.0833,
        lng: -78.9667,
        cuenca: "Qda. San Ildefonso",
        poblacionAfectada: 85000,
        detalles: "Cono aluviónico con velocidad de flujo de lodo de hasta 35 km/h",
        leccionHistorica: "El sector Mampuesto y cementerio actúan como embudo geográfico desbordando el lodo hacia la Av. Miraflores.",
        cx: 34,
        cy: 39
    }
];

// 5. CORREDOR DE HELADAS Y FRIAJES ALTOANDINOS (AMARU-CHIRI / data/catalogo_distritos_heladas_nina.json)
const HELADAS_ALTOANDINAS: PuntoCartografico[] = [
    {
        id: "h-mazocruz",
        nombre: "Santa Rosa / Mazocruz (El Collao - Puno)",
        region: "Puno",
        provincia: "El Collao",
        ubigeo: "210505",
        tipo: "HELADA_CHIRI",
        nivel: "ROJO",
        lat: -16.5833,
        lng: -69.6500,
        cuenca: "Cuenca Ilave / Lago Titicaca",
        temperaturaC: -8.4,
        camelidosExpuestos: 45000,
        detalles: "Temp mínima: -8.4°C (Anomalía -4.2°C) • Altitud 3,970 msnm • Pérdida de crías de alpaca",
        leccionHistorica: "Polo del Frío del Perú. Requiere módulos térmicos Sumaq Wasi y cobertizos de emergencia.",
        cx: 80,
        cy: 80
    },
    {
        id: "h-imata",
        nombre: "Imata (San Antonio de Chuca - Arequipa)",
        region: "Arequipa",
        provincia: "Caylloma",
        ubigeo: "040501",
        tipo: "HELADA_CHIRI",
        nivel: "ROJO",
        lat: -15.8333,
        lng: -71.0833,
        cuenca: "Alto Quilca",
        temperaturaC: -9.2,
        camelidosExpuestos: 28000,
        detalles: "Temp mínima: -9.2°C • Altitud 4,500 msnm • Congelamiento de pastizales y bofedales",
        leccionHistorica: "Cruce ferroviario y vial Arequipa-Juliaca vulnerable a nevadas de hasta 40 cm de espesor.",
        cx: 72,
        cy: 79
    },
    {
        id: "h-espinar",
        nombre: "Espinar (Yauri - Cusco)",
        region: "Cusco",
        provincia: "Espinar",
        ubigeo: "080801",
        tipo: "HELADA_CHIRI",
        nivel: "AMARILLO",
        lat: -14.7936,
        lng: -71.4131,
        cuenca: "Alto Apurímac",
        temperaturaC: -6.1,
        camelidosExpuestos: 32000,
        detalles: "Temp mínima: -6.1°C • Helada agrometeorológica sobre forraje altoandino",
        leccionHistorica: "Vulnerabilidad respiratoria en menores de 5 años y adultos mayores en comunidades quechuas.",
        cx: 68,
        cy: 72
    }
];

// 6. DISTRITOS CON ALTO ÍNDICE DE PRIORIDAD DE INTERVENCIÓN (IPI) & RENALIO D.S. 009-2021-MC
const DIST_RENALIO_ETNO: PuntoCartografico[] = [
    {
        id: "etno-chosica",
        nombre: "Lurigancho-Chosica (IPI: 95.0)",
        region: "Lima",
        provincia: "Lima",
        ubigeo: "150118",
        tipo: "RENALIO_ETNO",
        nivel: "ROJO",
        lat: -11.9428,
        lng: -76.7094,
        detalles: "IPI: 95.0/100 • Triple Vulnerabilidad Crítica • CENEPRED: Muy Alto • D.S. 124-2026-PCM Vigente",
        ipiScore: 95.0,
        lenguaNombre: "Runasimi Chanka (Quechua)",
        esBilingue: true,
        cenepredRiesgo: "MUY ALTO",
        ds124Pcm: true,
        leccionHistorica: "Obligatoriedad de protocolo bilingüe (Runasimi Chanka + Castellano) según RENALIO D.S. 009-2021-MC.",
        cx: 46,
        cy: 58
    },
    {
        id: "etno-huaraz",
        nombre: "Huaraz (IPI: 95.0)",
        region: "Áncash",
        provincia: "Huaraz",
        ubigeo: "020101",
        tipo: "RENALIO_ETNO",
        nivel: "ROJO",
        lat: -9.5261,
        lng: -77.5289,
        detalles: "IPI: 95.0/100 • Laguna Palcacocha & Callejón de Huaylas • Aluvión y Fenómeno El Niño",
        ipiScore: 95.0,
        lenguaNombre: "Quechua Áncash (Ancashino)",
        esBilingue: true,
        cenepredRiesgo: "MUY ALTO",
        ds124Pcm: true,
        leccionHistorica: "Cuenca Río Santa: Evacuación comunicada en Quechua Ancashino Huáyhuash con duplicado en castellano.",
        cx: 42,
        cy: 48
    },
    {
        id: "etno-mazocruz",
        nombre: "Santa Rosa de Mazocruz (IPI: 92.5)",
        region: "Puno",
        provincia: "El Collao",
        ubigeo: "210406",
        tipo: "RENALIO_ETNO",
        nivel: "ROJO",
        lat: -16.7411,
        lng: -69.7125,
        detalles: "IPI: 92.5/100 • Epicentro Nacional de Heladas (-14.2°C) • Cobertura Aymara Altiplánico",
        ipiScore: 92.5,
        lenguaNombre: "Aymara Central",
        esBilingue: true,
        cenepredRiesgo: "MUY ALTO",
        ds124Pcm: true,
        leccionHistorica: "Población aymarahablante de altura: Protección de hatos de alpaca y albergues térmicos comunitarios.",
        cx: 73,
        cy: 88
    },
    {
        id: "etno-satipo",
        nombre: "Satipo (IPI: 90.0)",
        region: "Junín",
        provincia: "Satipo",
        ubigeo: "120601",
        tipo: "RENALIO_ETNO",
        nivel: "ROJO",
        lat: -11.2522,
        lng: -74.6386,
        detalles: "IPI: 90.0/100 • Selva Central VRAEM • Inundaciones fluviales y deslizamientos masivos",
        ipiScore: 90.0,
        lenguaNombre: "Asháninka (Arawak)",
        esBilingue: true,
        cenepredRiesgo: "MUY ALTO",
        ds124Pcm: true,
        leccionHistorica: "Comunidades nativas de cuenca: Alertas de crecida fluvial en lengua originaria Asháninka y castellano.",
        cx: 56,
        cy: 54
    },
    {
        id: "etno-nieva",
        nombre: "Santa María de Nieva (IPI: 92.5)",
        region: "Amazonas",
        provincia: "Condorcanqui",
        ubigeo: "010401",
        tipo: "RENALIO_ETNO",
        nivel: "ROJO",
        lat: -4.5933,
        lng: -77.8631,
        detalles: "IPI: 92.5/100 • Frontera Norte Marañón-Cenepa • Inundaciones torrenciales",
        ipiScore: 92.5,
        lenguaNombre: "Awajún (Jíbaro)",
        esBilingue: true,
        cenepredRiesgo: "MUY ALTO",
        ds124Pcm: true,
        leccionHistorica: "Pueblos awajún del Cenepa: Alerta temprana bilingüe por crecidas intempestivas del río Marañón.",
        cx: 37,
        cy: 22
    },
    {
        id: "etno-catacaos",
        nombre: "Catacaos (IPI: 80.0)",
        region: "Piura",
        provincia: "Piura",
        ubigeo: "200105",
        tipo: "RENALIO_ETNO",
        nivel: "ROJO",
        lat: -5.2667,
        lng: -80.6833,
        detalles: "IPI: 80.0/100 • Bajo Piura • Desborde fluvial histórico 1998 y 2017 • Monolingüe Castellano",
        ipiScore: 80.0,
        lenguaNombre: "Castellano Comunitario",
        esBilingue: false,
        cenepredRiesgo: "MUY ALTO",
        ds124Pcm: true,
        leccionHistorica: "Distrito monolingüe: Despacho estricto y directo en Castellano según directriz ministerial.",
        cx: 26,
        cy: 23
    }
];

interface GeovisorConsoleProps {
    onSwitchToGoogleMaps?: () => void;
}

export default function GeovisorConsole({ onSwitchToGoogleMaps }: GeovisorConsoleProps = {}) {
    // Estado del Mapa y Motor Cartográfico
    const [baseMap, setBaseMap] = useState<"dark" | "satellite" | "terrain" | "ocean">("dark");
    const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
    const [showVideoWall, setShowVideoWall] = useState<boolean>(false);
    const [apiKey, setApiKey] = useState<string>("");
    const [showKeyModal, setShowKeyModal] = useState<boolean>(false);
    const [tempKeyInput, setTempKeyInput] = useState<string>("");

    // Conmutadores de Capas en Tiempo Real
    const [showNOAA_SST, setShowNOAA_SST] = useState<boolean>(true);
    const [showBoyasDHN, setShowBoyasDHN] = useState<boolean>(true);
    const [showRadarDoppler, setShowRadarDoppler] = useState<boolean>(true);
    const [showSateliteGOES, setShowSateliteGOES] = useState<boolean>(false);

    // Conmutadores de Capas Históricas (data/)
    const [showMemoriaFEN, setShowMemoriaFEN] = useState<boolean>(true);
    const [showQuebradas, setShowQuebradas] = useState<boolean>(true);
    const [showAforosFluviales, setShowAforosFluviales] = useState<boolean>(true);
    const [showHeladasChiri, setShowHeladasChiri] = useState<boolean>(false);
    const [showRenalioEtno, setShowRenalioEtno] = useState<boolean>(true);

    // Controles de Radar Doppler y Línea de Tiempo
    const [radarPlaying, setRadarPlaying] = useState<boolean>(false);
    const [radarStep, setRadarStep] = useState<number>(4);
    const radarLabels = ["-120m", "-90m", "-60m", "-30m", "Ahora (Vivo)", "+1h Prev"];

    // Búsqueda y Selección de Punto
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [puntoSeleccionado, setPuntoSeleccionado] = useState<PuntoCartografico | null>(null);

    // Loop de animación para Radar Doppler
    useEffect(() => {
        if (!radarPlaying) return;
        const interval = setInterval(() => {
            setRadarStep(prev => (prev >= radarLabels.length - 1 ? 0 : prev + 1));
        }, 1400);
        return () => clearInterval(interval);
    }, [radarPlaying, radarLabels.length]);

    // Manejador de teclado para pantalla completa
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape" && isFullscreen) {
                setIsFullscreen(false);
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isFullscreen]);

    // Consolidación de todos los puntos activos según las capas
    const puntosActivos = useMemo(() => {
        const lista: PuntoCartografico[] = [];
        if (showBoyasDHN) lista.push(...BOYAS_OCEANOGRAFICAS);
        if (showAforosFluviales) lista.push(...ESTACIONES_AFORO_CRITICAS);
        if (showQuebradas) lista.push(...QUEBRADAS_CRITICAS_MAPA);
        if (showMemoriaFEN) lista.push(...MEMORIA_HISTORICA_FEN);
        if (showHeladasChiri) lista.push(...HELADAS_ALTOANDINAS);
        if (showRenalioEtno) lista.push(...DIST_RENALIO_ETNO);
        return lista;
    }, [showBoyasDHN, showAforosFluviales, showQuebradas, showMemoriaFEN, showHeladasChiri, showRenalioEtno]);

    // Búsqueda táctica
    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;
        const term = searchQuery.trim().toLowerCase();

        const match = puntosActivos.find(
            p => p.ubigeo === term ||
                p.nombre.toLowerCase().includes(term) ||
                p.region.toLowerCase().includes(term) ||
                (p.cuenca && p.cuenca.toLowerCase().includes(term)) ||
                (p.rio && p.rio.toLowerCase().includes(term))
        );

        if (match) {
            setPuntoSeleccionado(match);
        } else {
            alert(`No se encontró registro para: "${searchQuery}"`);
        }
    };

    const guardarApiKey = () => {
        if (tempKeyInput.trim()) {
            setApiKey(tempKeyInput.trim());
            localStorage.setItem("gmaps_api_key", tempKeyInput.trim());
            setShowKeyModal(false);
        }
    };

    return (
        <div
            className={`w-full transition-all duration-300 ${
                isFullscreen
                    ? "fixed inset-0 z-[99999] w-screen h-screen bg-slate-950 p-3 flex flex-col justify-between"
                    : "relative w-full h-[calc(100vh-95px)] min-h-[640px] bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden flex flex-col"
            }`}
        >
            {/* 1. BARRA SUPERIOR DE MANDO C2 Y HERRAMIENTAS */}
            <div className="bg-slate-900/95 backdrop-blur border-b border-slate-800 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 shrink-0 z-20">
                {/* Título & Badge de Mando */}
                <div className="flex items-center gap-2.5">
                    <div className="flex items-center gap-1.5 bg-blue-950/80 border border-blue-600 px-2.5 py-1 rounded-lg text-xs">
                        <Satellite className="w-3.5 h-3.5 text-blue-400" />
                        <span className="font-bold text-white tracking-wide">CONSOLA GEOVISOR C2</span>
                        <span className="text-blue-400 font-mono text-[10px]">• EN VIVO</span>
                    </div>

                    <div className="hidden md:flex items-center gap-2 text-slate-400 text-xs font-medium">
                        <span className="text-slate-600">|</span>
                        <span>Fuentes:</span>
                        <span className="bg-slate-800 text-sky-300 px-2 py-0.5 rounded text-[10px] font-semibold">Open-Meteo Pro</span>
                        <span className="bg-slate-800 text-amber-300 px-2 py-0.5 rounded text-[10px] font-semibold">NOAA CRW</span>
                        <span className="bg-slate-800 text-emerald-300 px-2 py-0.5 rounded text-[10px] font-semibold">IMARPE / DHN</span>
                        <span className="bg-slate-800 text-indigo-300 px-2 py-0.5 rounded text-[10px] font-semibold">Memoria FEN / ANA</span>
                    </div>
                </div>

                {/* Buscador Universal C2 */}
                <form
                    onSubmit={handleSearch}
                    className="flex items-center bg-slate-950/90 border border-slate-700 rounded-lg px-2.5 py-1 text-xs w-full max-w-sm shadow-inner"
                >
                    <Search className="w-3.5 h-3.5 text-slate-400 mr-2 shrink-0" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Buscar UBIGEO, Quebrada, Río o Boya (ej. 200101, Chosica)..."
                        className="bg-transparent text-slate-200 placeholder-slate-500 outline-none w-full text-xs"
                    />
                    <button
                        type="submit"
                        className="ml-2 bg-blue-600 hover:bg-blue-500 text-white px-2 py-0.5 rounded text-[11px] font-semibold transition"
                    >
                        Localizar
                    </button>
                </form>

                {/* Selector de Mapas Base y Pantalla Completa */}
                <div className="flex items-center gap-2">
                    <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs shadow-inner">
                        <button
                            onClick={() => setBaseMap("dark")}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition flex items-center gap-1 ${
                                baseMap === "dark"
                                    ? "bg-blue-600 text-white shadow-md shadow-blue-500/30"
                                    : "text-slate-400 hover:text-white"
                            }`}
                            title="Estilo Táctico Oscuro C2 Militar"
                        >
                            <Compass className="w-3 h-3" />
                            <span>Táctico</span>
                        </button>
                        <button
                            onClick={() => setBaseMap("satellite")}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition flex items-center gap-1 ${
                                baseMap === "satellite"
                                    ? "bg-emerald-600 text-white shadow-md shadow-emerald-500/30"
                                    : "text-slate-400 hover:text-white"
                            }`}
                            title="Satelital de Alta Definición (NOAA / Sentinel)"
                        >
                            <Satellite className="w-3 h-3" />
                            <span>Satelital</span>
                        </button>
                        <button
                            onClick={() => setBaseMap("terrain")}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition flex items-center gap-1 ${
                                baseMap === "terrain"
                                    ? "bg-amber-600 text-white shadow-md shadow-amber-500/30"
                                    : "text-slate-400 hover:text-white"
                            }`}
                            title="Relieve, Topografía y Curvas de Nivel"
                        >
                            <Mountain className="w-3 h-3" />
                            <span>Relieve</span>
                        </button>
                        <button
                            onClick={() => setBaseMap("ocean")}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition flex items-center gap-1 ${
                                baseMap === "ocean"
                                    ? "bg-cyan-600 text-white shadow-md shadow-cyan-500/30"
                                    : "text-slate-400 hover:text-white"
                            }`}
                            title="Cartografía Batimétrica y Mar de Grau (200 Millas)"
                        >
                            <Waves className="w-3 h-3" />
                            <span>Marítimo</span>
                        </button>
                        {onSwitchToGoogleMaps && (
                            <button
                                onClick={onSwitchToGoogleMaps}
                                className="px-2.5 py-1 rounded-lg text-[11px] font-bold transition flex items-center gap-1.5 bg-emerald-950/90 hover:bg-emerald-800 text-emerald-300 border border-emerald-500/70 shadow-md cursor-pointer ml-1 animate-pulse"
                                title="Conmutar a Google Maps Platform (Satelital 3D Real del Perú)"
                            >
                                <Satellite className="w-3.5 h-3.5 text-emerald-400" />
                                <span>Google Maps 3D</span>
                            </button>
                        )}
                    </div>

                    {/* Botón Video Wall C2 / Pantalla de Transmisiones */}
                    <button
                        onClick={() => setShowVideoWall(true)}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white border border-purple-400/40 shadow-lg shadow-purple-600/20 cursor-pointer"
                        title="Abrir Video Wall C2 (Transmisiones YouTube Live y TikTok en Zona)"
                    >
                        <Tv className="w-3.5 h-3.5 text-purple-200" />
                        <span>Video Wall C2</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-ping" />
                    </button>

                    <button
                        onClick={() => setIsFullscreen(prev => !prev)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition shadow-lg ${
                            isFullscreen
                                ? "bg-red-600 hover:bg-red-500 text-white animate-pulse border border-red-400"
                                : "bg-sky-600 hover:bg-sky-500 text-white border border-sky-400/40"
                        }`}
                        title={isFullscreen ? "Salir de Pantalla Completa (ESC)" : "Pantalla Completa Sala de Crisis"}
                    >
                        {isFullscreen ? (
                            <>
                                <Minimize2 className="w-3.5 h-3.5" />
                                <span>Salir (ESC)</span>
                            </>
                        ) : (
                            <>
                                <Maximize2 className="w-3.5 h-3.5" />
                                <span>Pantalla Completa</span>
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* 2. ÁREA DE TRABAJO PRINCIPAL: DRAWER DE CAPAS + CANVAS CARTOGRÁFICO */}
            <div className="relative flex-1 w-full h-full flex overflow-hidden">
                {/* PANEL LATERAL FLOTANTE DE CONMUTACIÓN DE CAPAS */}
                <aside className="w-72 md:w-80 bg-slate-900/90 backdrop-blur-md border-r border-slate-800 p-3 overflow-y-auto flex flex-col justify-between shrink-0 z-10 text-xs space-y-4 shadow-2xl">
                    <div className="space-y-4">
                        {/* SECCIÓN A: CAPAS EN TIEMPO REAL */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-slate-400 font-bold uppercase tracking-wider text-[11px] pb-1 border-b border-slate-800">
                                <span className="flex items-center gap-1.5 text-sky-400">
                                    <Activity className="w-3.5 h-3.5" />
                                    Capas en Tiempo Real
                                </span>
                                <span className="text-[10px] text-slate-500">Meteo & Océano</span>
                            </div>

                            {/* Capa NOAA SST Anomaly */}
                            <label className="flex items-start gap-2 p-1.5 rounded-lg hover:bg-slate-800/60 cursor-pointer transition">
                                <input
                                    type="checkbox"
                                    checked={showNOAA_SST}
                                    onChange={(e) => setShowNOAA_SST(e.target.checked)}
                                    className="mt-0.5 rounded border-slate-700 text-orange-600 focus:ring-orange-500"
                                />
                                <div>
                                    <div className="font-semibold text-white flex items-center gap-1.5">
                                        <Waves className="w-3.5 h-3.5 text-orange-400" />
                                        <span>NOAA SST Anomaly (El Niño 1+2)</span>
                                    </div>
                                    <p className="text-[10px] text-slate-400 leading-tight mt-0.5">
                                        Polígono térmico marino con anomalías térmicas de +2.8°C a +3.2°C frente al litoral.
                                    </p>
                                </div>
                            </label>

                            {/* Capa Boyas DHN / IMARPE */}
                            <label className="flex items-start gap-2 p-1.5 rounded-lg hover:bg-slate-800/60 cursor-pointer transition">
                                <input
                                    type="checkbox"
                                    checked={showBoyasDHN}
                                    onChange={(e) => setShowBoyasDHN(e.target.checked)}
                                    className="mt-0.5 rounded border-slate-700 text-orange-600 focus:ring-orange-500"
                                />
                                <div>
                                    <div className="font-semibold text-white flex items-center gap-1.5">
                                        <Radio className="w-3.5 h-3.5 text-orange-400" />
                                        <span>Boyas Costeras DHN / IMARPE</span>
                                    </div>
                                    <p className="text-[10px] text-slate-400 leading-tight mt-0.5">
                                        6 boyas con telemetría de termoclina, temperatura superficial y onda Kelvin activa.
                                    </p>
                                </div>
                            </label>

                            {/* Capa Radar Doppler RainViewer */}
                            <label className="flex items-start gap-2 p-1.5 rounded-lg hover:bg-slate-800/60 cursor-pointer transition">
                                <input
                                    type="checkbox"
                                    checked={showRadarDoppler}
                                    onChange={(e) => setShowRadarDoppler(e.target.checked)}
                                    className="mt-0.5 rounded border-slate-700 text-sky-600 focus:ring-sky-500"
                                />
                                <div>
                                    <div className="font-semibold text-white flex items-center gap-1.5">
                                        <CloudRain className="w-3.5 h-3.5 text-sky-400" />
                                        <span>Radar Doppler en Vivo (RainViewer)</span>
                                    </div>
                                    <p className="text-[10px] text-slate-400 leading-tight mt-0.5">
                                        Malla de reflectividad de nubes y lluvias animadas en bucle temporal de 2 horas.
                                    </p>
                                </div>
                            </label>

                            {/* Capa Satélite GOES-16 ABI */}
                            <label className="flex items-start gap-2 p-1.5 rounded-lg hover:bg-slate-800/60 cursor-pointer transition">
                                <input
                                    type="checkbox"
                                    checked={showSateliteGOES}
                                    onChange={(e) => setShowSateliteGOES(e.target.checked)}
                                    className="mt-0.5 rounded border-slate-700 text-indigo-600 focus:ring-indigo-500"
                                />
                                <div>
                                    <div className="font-semibold text-white flex items-center gap-1.5">
                                        <Satellite className="w-3.5 h-3.5 text-indigo-400" />
                                        <span>Satélite GOES-16 (Infrarrojo IR-13)</span>
                                    </div>
                                    <p className="text-[10px] text-slate-400 leading-tight mt-0.5">
                                        Detección de topes de nubes convectivas profundas sobre cordillera y costa.
                                    </p>
                                </div>
                            </label>
                        </div>

                        {/* SECCIÓN B: CAPAS HISTÓRICAS INTEGRADAS (data/) */}
                        <div className="space-y-2 pt-2 border-t border-slate-800">
                            <div className="flex items-center justify-between text-slate-400 font-bold uppercase tracking-wider text-[11px] pb-1 border-b border-slate-800">
                                <span className="flex items-center gap-1.5 text-amber-400">
                                    <BookOpen className="w-3.5 h-3.5" />
                                    Inteligencia Histórica
                                </span>
                                <span className="text-[10px] text-slate-500">Carpeta data/</span>
                            </div>

                            {/* Capa Memoria FEN 1998 / 2017 */}
                            <label className="flex items-start gap-2 p-1.5 rounded-lg hover:bg-slate-800/60 cursor-pointer transition">
                                <input
                                    type="checkbox"
                                    checked={showMemoriaFEN}
                                    onChange={(e) => setShowMemoriaFEN(e.target.checked)}
                                    className="mt-0.5 rounded border-slate-700 text-red-600 focus:ring-red-500"
                                />
                                <div>
                                    <div className="font-semibold text-white flex items-center gap-1.5">
                                        <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                                        <span>Memoria de Impactos FEN 1998 & 2017</span>
                                    </div>
                                    <p className="text-[10px] text-slate-400 leading-tight mt-0.5">
                                        Zonas de mayor recurrencia de desborde (Catacaos, Íllimo, Chosica, Castilla, Trujillo).
                                    </p>
                                </div>
                            </label>

                            {/* Capa 46 Quebradas Críticas */}
                            <label className="flex items-start gap-2 p-1.5 rounded-lg hover:bg-slate-800/60 cursor-pointer transition">
                                <input
                                    type="checkbox"
                                    checked={showQuebradas}
                                    onChange={(e) => setShowQuebradas(e.target.checked)}
                                    className="mt-0.5 rounded border-slate-700 text-red-600 focus:ring-red-500"
                                />
                                <div>
                                    <div className="font-semibold text-white flex items-center gap-1.5">
                                        <Mountain className="w-3.5 h-3.5 text-amber-400" />
                                        <span>46 Quebradas Críticas (CENEPRED/ANA)</span>
                                    </div>
                                    <p className="text-[10px] text-slate-400 leading-tight mt-0.5">
                                        Conos de deyección, umbrales de lluvia crítica (mm/h) y tiempos de concentración.
                                    </p>
                                </div>
                            </label>

                            {/* Capa Estaciones de Aforo Hidrológico */}
                            <label className="flex items-start gap-2 p-1.5 rounded-lg hover:bg-slate-800/60 cursor-pointer transition">
                                <input
                                    type="checkbox"
                                    checked={showAforosFluviales}
                                    onChange={(e) => setShowAforosFluviales(e.target.checked)}
                                    className="mt-0.5 rounded border-slate-700 text-blue-600 focus:ring-blue-500"
                                />
                                <div>
                                    <div className="font-semibold text-white flex items-center gap-1.5">
                                        <Droplets className="w-3.5 h-3.5 text-blue-400" />
                                        <span>Estaciones de Aforo (Caudal vs 1998)</span>
                                    </div>
                                    <p className="text-[10px] text-slate-400 leading-tight mt-0.5">
                                        Ríos Piura, Tumbes, Rímac y La Leche: caudal actual vs récord de 1998 (4,424 m³/s).
                                    </p>
                                </div>
                            </label>

                            {/* Capa Heladas y Friajes AMARU-CHIRI */}
                            <label className="flex items-start gap-2 p-1.5 rounded-lg hover:bg-slate-800/60 cursor-pointer transition">
                                <input
                                    type="checkbox"
                                    checked={showHeladasChiri}
                                    onChange={(e) => setShowHeladasChiri(e.target.checked)}
                                    className="mt-0.5 rounded border-slate-700 text-cyan-600 focus:ring-cyan-500"
                                />
                                <div>
                                    <div className="font-semibold text-white flex items-center gap-1.5">
                                        <Snowflake className="w-3.5 h-3.5 text-cyan-400" />
                                        <span>Corredor de Heladas (AMARU-CHIRI)</span>
                                    </div>
                                    <p className="text-[10px] text-slate-400 leading-tight mt-0.5">
                                        Altiplano y Sierra Sur (&gt;3,800 msnm): Mazocruz, Imata, Espinar y ganado camélido.
                                    </p>
                                </div>
                            </label>

                            {/* Capa 7: Etnolingüística RENALIO e IPI */}
                            <label className="flex items-start gap-2 p-1.5 rounded-lg hover:bg-slate-800/60 cursor-pointer transition">
                                <input
                                    type="checkbox"
                                    checked={showRenalioEtno}
                                    onChange={(e) => setShowRenalioEtno(e.target.checked)}
                                    className="mt-0.5 rounded border-slate-700 text-purple-600 focus:ring-purple-500"
                                />
                                <div>
                                    <div className="font-semibold text-white flex items-center gap-1.5">
                                        <Languages className="w-3.5 h-3.5 text-purple-400" />
                                        <span>RENALIO &amp; Triple Vulnerabilidad (IPI)</span>
                                    </div>
                                    <p className="text-[10px] text-slate-400 leading-tight mt-0.5">
                                        Catálogo de lenguas D.S. 009-2021-MC cruzado con CENEPRED (1,891) y D.S. 124-2026-PCM.
                                    </p>
                                </div>
                            </label>
                        </div>
                    </div>

                    {/* Resumen de Capas Activas y Estado */}
                    <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 space-y-1 text-[11px] text-slate-400">
                        <div className="flex justify-between items-center text-slate-300 font-semibold">
                            <span>Objetos Activos en Mapa:</span>
                            <span className="text-blue-400 font-bold">{puntosActivos.length}</span>
                        </div>
                        <div className="flex justify-between items-center text-[10px]">
                            <span>Régimen ENSO Oficial:</span>
                            <span className="text-red-400 font-bold">ALERTA NIÑO 1+2</span>
                        </div>
                        <div className="flex justify-between items-center text-[10px]">
                            <span>Resolución Satelital:</span>
                            <span className="text-emerald-400">5 km (NOAA CRW)</span>
                        </div>
                    </div>
                </aside>

                {/* CANVAS CARTOGRÁFICO INTERACTIVO */}
                <div className="relative flex-1 w-full h-full bg-slate-950 overflow-hidden flex items-center justify-center">
                    <div className="w-full h-full p-4 relative flex items-center justify-center">
                        <svg viewBox="0 0 100 100" className="w-full h-full max-w-4xl max-h-[750px] filter drop-shadow-[0_0_20px_rgba(15,23,42,0.8)]">
                            <defs>
                                {/* 1. Patrón Cuadrícula Táctica Militar (Modo Táctico) */}
                                <pattern id="tactical-grid" width="10" height="10" patternUnits="userSpaceOnUse">
                                    <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#1e293b" strokeWidth="0.15" strokeDasharray="1,2" />
                                </pattern>

                                {/* 2. Gradiente Térmico Marino ENSO (Niño 1+2) */}
                                <linearGradient id="nino-thermal-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="#ef4444" stopOpacity="0.45" />
                                    <stop offset="50%" stopColor="#f97316" stopOpacity="0.3" />
                                    <stop offset="100%" stopColor="#ea580c" stopOpacity="0.12" />
                                </linearGradient>

                                {/* 3. Gradientes para Mosaico Satelital Multiespectral */}
                                <linearGradient id="satellite-ocean-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="#082f49" />   {/* Pacífico Ecuatorial cálido */}
                                    <stop offset="60%" stopColor="#03192e" />  {/* Mar de Grau / Corriente de Humboldt */}
                                    <stop offset="100%" stopColor="#020d1a" /> {/* Fosa Abisal */}
                                </linearGradient>
                                <linearGradient id="satellite-land-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="0%" stopColor="#a16207" />   {/* Costa desértica árida */}
                                    <stop offset="28%" stopColor="#713f12" />  {/* Estribaciones rocosas occidentales */}
                                    <stop offset="48%" stopColor="#292524" />  {/* Cordillera andina alta */}
                                    <stop offset="65%" stopColor="#14532d" />  {/* Ceja de selva */}
                                    <stop offset="100%" stopColor="#064e3b" /> {/* Llanura Amazónica verde profunda */}
                                </linearGradient>

                                {/* 4. Gradiente Hipsométrico de Relieve y Curvas de Nivel */}
                                <linearGradient id="terrain-relief-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="0%" stopColor="#65a30d" />   {/* 0 - 500m Costa y Valles Bajos */}
                                    <stop offset="25%" stopColor="#eab308" />  {/* 500 - 2,300m Yunga / Quebradas */}
                                    <stop offset="50%" stopColor="#ea580c" />  {/* 2,300 - 3,500m Quechua */}
                                    <stop offset="70%" stopColor="#991b1b" />  {/* 3,500 - 4,800m Suni / Puna Heladas */}
                                    <stop offset="85%" stopColor="#78350f" />  {/* >4,800m Rocas Cordillera */}
                                    <stop offset="100%" stopColor="#15803d" /> {/* Amazonía oriental */}
                                </linearGradient>

                                {/* 5. Gradiente Batimétrico Marítimo (Mar de Grau) */}
                                <linearGradient id="ocean-bathy-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="0%" stopColor="#020617" />   {/* Fosas de Chimbote / Lima (-6,500m) */}
                                    <stop offset="45%" stopColor="#0369a1" />  {/* Talud Continental (-2,000m) */}
                                    <stop offset="85%" stopColor="#0284c7" />  {/* Zócalo Continental (-200m) */}
                                    <stop offset="100%" stopColor="#38bdf8" /> {/* Aguas Costeras Someras (0 a -50m) */}
                                </linearGradient>
                            </defs>

                            {/* ========================================================================= */}
                            {/* FONDO CARTOGRÁFICO BASE SEGÚN MODO SELECCIONADO (4 CAPAS REALES)          */}
                            {/* ========================================================================= */}

                            {/* MODO A: SATELITAL MULTIESPECTRAL DE ALTA RESOLUCIÓN */}
                            {baseMap === "satellite" && (
                                <g id="capa-satelital-multiespectral">
                                    {/* Océano Pacífico Satelital */}
                                    <rect width="100" height="100" fill="url(#satellite-ocean-grad)" />
                                    
                                    {/* Ondas y Corrientes Oceánicas Satelitales (Humboldt fría vs Kelvin cálida) */}
                                    <path d="M 2 85 Q 12 55 18 20" stroke="#0ea5e9" strokeWidth="0.6" strokeDasharray="2,3" fill="none" opacity="0.6" />
                                    <path d="M 6 92 Q 16 62 22 25" stroke="#38bdf8" strokeWidth="0.5" strokeDasharray="1.5,2.5" fill="none" opacity="0.5" />
                                    <path d="M 0 12 Q 14 18 20 28" stroke="#f97316" strokeWidth="0.9" strokeDasharray="3,2" fill="none" opacity="0.8" />
                                    
                                    {/* Territorio Peruano Texturizado Satelitalmente */}
                                    <path
                                        d="M 22 10 Q 24 16 20 22 Q 22 32 30 42 Q 35 52 42 62 Q 52 75 66 88 L 74 94 L 78 88 L 84 80 L 80 65 L 75 50 L 68 35 L 55 20 L 38 12 Z"
                                        fill="url(#satellite-land-grad)"
                                        stroke="#10b981"
                                        strokeWidth="0.5"
                                    />
                                    {/* Cresta Cordillerana Nevados / Glaciares Blancos (Huascarán 6,768m / Alpamayo / Vilcanota) */}
                                    <path d="M 28 28 Q 36 46 48 66 Q 56 76 68 84" stroke="#ffffff" strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.9" filter="drop-shadow(0 0 1px #ffffff)" />
                                    <circle cx="34" cy="38" r="0.9" fill="#ffffff" /> {/* Huascarán */}
                                    <text x="35.5" y="38.5" fill="#ffffff" fontSize="1.3" fontWeight="bold" opacity="0.85">Nev. Huascarán (6,768m)</text>
                                    
                                    {/* Red Hidrográfica Amazónica (Marañón / Ucayali / Amazonas) */}
                                    <path d="M 38 15 Q 48 24 64 22 Q 74 24 82 26" stroke="#0284c7" strokeWidth="0.7" fill="none" opacity="0.75" />
                                    <path d="M 46 36 Q 54 44 64 34 Q 72 26 78 24" stroke="#0284c7" strokeWidth="0.5" fill="none" opacity="0.65" />
                                    
                                    {/* Lago Titicaca en Altiplano */}
                                    <ellipse cx="74" cy="86" rx="3.5" ry="2.2" fill="#0369a1" stroke="#38bdf8" strokeWidth="0.4" />
                                    <text x="71" y="90" fill="#93c5fd" fontSize="1.2" fontWeight="bold">Lago Titicaca (3,812m)</text>
                                </g>
                            )}

                            {/* MODO B: RELIEVE Y TOPOGRAFÍA ANDINA (HIPSOMETRÍA & CURVAS DE NIVEL) */}
                            {baseMap === "terrain" && (
                                <g id="capa-relieve-curvas-nivel">
                                    <rect width="100" height="100" fill="#090d16" />
                                    
                                    {/* Sombra de Relieve y Terreno Continental */}
                                    <path
                                        d="M 22 10 Q 24 16 20 22 Q 22 32 30 42 Q 35 52 42 62 Q 52 75 66 88 L 74 94 L 78 88 L 84 80 L 80 65 L 75 50 L 68 35 L 55 20 L 38 12 Z"
                                        fill="url(#terrain-relief-grad)"
                                        stroke="#f59e0b"
                                        strokeWidth="0.6"
                                    />
                                    
                                    {/* Curvas de Nivel Topográficas Andinas (Isohipsas 1,000m, 3,000m, 5,000m) */}
                                    <path d="M 24 16 Q 28 32 36 48 Q 44 64 58 78 Q 66 86 70 88" stroke="#78350f" strokeWidth="0.4" strokeDasharray="1,1" fill="none" opacity="0.7" />
                                    <path d="M 26 22 Q 32 38 40 54 Q 48 68 62 82" stroke="#451a03" strokeWidth="0.5" strokeDasharray="1.5,1.5" fill="none" opacity="0.8" />
                                    <path d="M 29 28 Q 36 44 46 62 Q 54 74 66 84" stroke="#ffffff" strokeWidth="0.8" fill="none" opacity="0.9" />
                                    
                                    {/* Cañones Profundos (Colca, Cotahuasi) */}
                                    <path d="M 54 72 L 58 75" stroke="#7f1d1d" strokeWidth="0.7" />
                                    <text x="50" y="76" fill="#fca5a5" fontSize="1.3" fontWeight="bold">Cañón del Colca</text>
                                    
                                    {/* Eje de Vertiente del Pacífico (46 Quebradas Huaqueras) */}
                                    <path d="M 22 20 Q 28 40 38 60 Q 48 76 64 88" stroke="#ef4444" strokeWidth="0.3" strokeDasharray="2,1" fill="none" opacity="0.6" />
                                </g>
                            )}

                            {/* MODO C: CARTOGRAFÍA MARÍTIMA & BATIMETRÍA DEL MAR DE GRAU */}
                            {baseMap === "ocean" && (
                                <g id="capa-maritimo-batimetria">
                                    {/* Fondo Abisal Marino */}
                                    <rect width="100" height="100" fill="url(#ocean-bathy-grad)" />
                                    
                                    {/* Isóbata de -200m (Límite Zócalo Continental de Pesca e IMARPE) */}
                                    <path d="M 17 8 Q 21 28 27 52 Q 34 72 58 88" stroke="#38bdf8" strokeWidth="0.6" strokeDasharray="2,2" fill="none" opacity="0.85" />
                                    <text x="7" y="58" fill="#38bdf8" fontSize="1.4" fontWeight="bold" opacity="0.8">Zócalo -200m</text>
                                    
                                    {/* Isóbata de -6,000m (Fosas Marinas de Chimbote y Lima) */}
                                    <path d="M 12 14 Q 16 34 22 58 Q 28 78 50 94" stroke="#1e40af" strokeWidth="0.8" fill="none" opacity="0.9" />
                                    <circle cx="21" cy="46" r="1.5" fill="#020617" stroke="#3b82f6" strokeWidth="0.4" />
                                    <text x="9" y="46" fill="#93c5fd" fontSize="1.3" fontWeight="bold">Fosa de Lima (-6,868m)</text>
                                    
                                    {/* Dorsal de Nazca Submarina */}
                                    <path d="M 8 72 L 44 65" stroke="#0ea5e9" strokeWidth="1" strokeDasharray="2,1" opacity="0.75" />
                                    <text x="12" y="70" fill="#38bdf8" fontSize="1.3" fontWeight="bold">Dorsal de Nazca</text>
                                    
                                    {/* Línea Oficial de las 200 Millas Marítimas del Mar de Grau */}
                                    <path d="M 4 2 Q 8 30 14 62 Q 22 84 46 98" stroke="#facc15" strokeWidth="0.7" strokeDasharray="3,2" fill="none" opacity="0.9" />
                                    <text x="2" y="38" fill="#facc15" fontSize="1.4" fontWeight="900" transform="rotate(-75, 4, 38)">
                                        200 MILLAS MAR DE GRAU
                                    </text>

                                    {/* Contorno Terrestre Costero */}
                                    <path
                                        d="M 22 10 Q 24 16 20 22 Q 22 32 30 42 Q 35 52 42 62 Q 52 75 66 88 L 74 94 L 78 88 L 84 80 L 80 65 L 75 50 L 68 35 L 55 20 L 38 12 Z"
                                        fill="#0f172a"
                                        stroke="#38bdf8"
                                        strokeWidth="0.6"
                                        opacity="0.9"
                                    />
                                </g>
                            )}

                            {/* MODO D: TÁCTICO OSCURO C2 MILITAR (Por defecto) */}
                            {baseMap === "dark" && (
                                <g id="capa-tactico-c2">
                                    <rect width="100" height="100" fill="url(#tactical-grid)" />
                                    
                                    {/* Contorno Táctico Nacional C2 */}
                                    <path
                                        d="M 22 10 Q 24 16 20 22 Q 22 32 30 42 Q 35 52 42 62 Q 52 75 66 88 L 74 94 L 78 88 L 84 80 L 80 65 L 75 50 L 68 35 L 55 20 L 38 12 Z"
                                        fill="#0b1329"
                                        stroke="#38bdf8"
                                        strokeWidth="0.9"
                                    />
                                    
                                    {/* Coordenadas Geográficas Guía */}
                                    <text x="3" y="12" fill="#475569" fontSize="1.6" fontFamily="monospace">04°S</text>
                                    <text x="3" y="42" fill="#475569" fontSize="1.6" fontFamily="monospace">10°S</text>
                                    <text x="3" y="72" fill="#475569" fontSize="1.6" fontFamily="monospace">15°S</text>
                                    <text x="18" y="98" fill="#475569" fontSize="1.6" fontFamily="monospace">82°W</text>
                                    <text x="48" y="98" fill="#475569" fontSize="1.6" fontFamily="monospace">76°W</text>
                                    <text x="78" y="98" fill="#475569" fontSize="1.6" fontFamily="monospace">70°W</text>
                                </g>
                            )}

                            {/* Capa NOAA: Polígono Marino Región Niño 1+2 en el Pacífico */}
                            {showNOAA_SST && (
                                <g id="capa-noaa-poligono-sst">
                                    <path
                                        d="M 10 8 Q 16 28 24 55 Q 32 75 58 92 L 66 88 Q 40 70 28 45 Q 18 22 16 8 Z"
                                        fill="url(#nino-thermal-grad)"
                                        stroke="#f97316"
                                        strokeWidth="0.7"
                                        strokeDasharray="1.5,1.5"
                                    />
                                    <text x="12" y="28" fill="#f97316" fontSize="2.2" fontWeight="bold" opacity="0.85">
                                        🌊 NOAA REGION NIÑO 1+2 (+3.2°C)
                                    </text>
                                    <text x="14" y="31" fill="#fdba74" fontSize="1.8" opacity="0.7">
                                        Termoclina Profunda • Onda Kelvin Activa
                                    </text>
                                </g>
                            )}

                            {/* Capa Radar Doppler Animada (Malla de Lluvia por step) */}
                            {showRadarDoppler && (
                                <g id="capa-radar-doppler" opacity={0.35 + radarStep * 0.08} className="pointer-events-none">
                                    <circle cx="28" cy="24" r={10 + radarStep * 1.5} fill="#0284c7" fillOpacity="0.3" />
                                    <circle cx="28" cy="24" r={6 + radarStep * 0.8} fill="#22c55e" fillOpacity="0.4" />
                                    <circle cx="28" cy="24" r={3.5} fill="#ef4444" fillOpacity="0.6" />
                                    <text x="22" y="16" fill="#38bdf8" fontSize="2" fontWeight="bold">
                                        📡 Radar Doppler ({radarLabels[radarStep]})
                                    </text>
                                </g>
                            )}

                            {/* ========================================================================= */}
                            {/* RENDERIZADO DE OBJETOS CARTOGRÁFICOS (SIN OSCILACIÓN + HITBOX TÁCTICO)    */}
                            {/* ========================================================================= */}
                            {puntosActivos.map((punto) => {
                                const isSelected = puntoSeleccionado?.id === punto.id;
                                let color = "#3b82f6";
                                if (punto.tipo === "BOYA_TSM") color = "#f97316";
                                if (punto.tipo === "ESTACION_AFORO") color = "#0284c7";
                                if (punto.tipo === "QUEBRADA_CRITICA") color = "#ef4444";
                                if (punto.tipo === "MEMORIA_FEN") color = "#e11d48";
                                if (punto.tipo === "HELADA_CHIRI") color = "#06b6d4";
                                if (punto.tipo === "RENALIO_ETNO") color = "#a855f7";

                                return (
                                    <g
                                        key={punto.id}
                                        className="cursor-pointer group select-none"
                                        onClick={() => setPuntoSeleccionado(punto)}
                                    >
                                        <title>{`${punto.nombre} (${punto.region}) • ${punto.tipo} • Clic para fijar telemetría`}</title>

                                        {/* HITBOX TÁCTICO DE ALTO IMPACTO (Invisible pero amplio para dar en el blanco sin oscilar) */}
                                        <circle
                                            cx={punto.cx}
                                            cy={punto.cy}
                                            r="5.5"
                                            fill="transparent"
                                            className="cursor-pointer"
                                        />

                                        {/* Anillo de pulso para puntos críticos (AISLADO CON pointer-events-none) */}
                                        {punto.nivel === "ROJO" && (
                                            <circle
                                                cx={punto.cx}
                                                cy={punto.cy}
                                                r={isSelected ? "4.8" : "3.4"}
                                                fill="none"
                                                stroke={color}
                                                strokeWidth="0.4"
                                                opacity="0.8"
                                                className="animate-ping pointer-events-none"
                                            />
                                        )}

                                        {/* Halo de selección o hover estacionario (Sin scale de transformación que provoque parpadeo) */}
                                        <circle
                                            cx={punto.cx}
                                            cy={punto.cy}
                                            r={isSelected ? "4" : "3"}
                                            fill="none"
                                            stroke={isSelected ? "#ffffff" : color}
                                            strokeWidth="0.5"
                                            className={`pointer-events-none transition-opacity duration-150 ${
                                                isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-80"
                                            }`}
                                        />

                                        {/* Círculo Principal Firme y Centrado */}
                                        <circle
                                            cx={punto.cx}
                                            cy={punto.cy}
                                            r={isSelected ? "2.9" : "2.1"}
                                            fill={color}
                                            stroke="#ffffff"
                                            strokeWidth={isSelected ? "0.9" : "0.5"}
                                            className="pointer-events-none transition-all duration-150 group-hover:brightness-125 group-hover:drop-shadow-[0_0_4px_rgba(255,255,255,0.9)]"
                                        />

                                        {/* Etiqueta flotante con pointer-events-none para no entorpecer el clic */}
                                        <text
                                            x={punto.cx + 2.5}
                                            y={punto.cy + 0.8}
                                            fill="#f8fafc"
                                            fontSize={isSelected ? "2.4" : "1.8"}
                                            fontWeight={isSelected ? "bold" : "normal"}
                                            filter="drop-shadow(0 1px 2px rgba(0,0,0,0.95))"
                                            className="pointer-events-none select-none font-medium"
                                        >
                                            {punto.tipo === "BOYA_TSM" && `🚢 ${punto.nombre.split(" ")[2] || punto.nombre}`}
                                            {punto.tipo === "ESTACION_AFORO" && `🌊 ${punto.rio}`}
                                            {punto.tipo === "QUEBRADA_CRITICA" && `▲ Qda. ${punto.nombre.split(" ")[1] || punto.nombre}`}
                                            {punto.tipo === "MEMORIA_FEN" && `📜 FEN: ${punto.nombre.split(":")[1]?.trim() || punto.nombre}`}
                                            {punto.tipo === "HELADA_CHIRI" && `❄️ ${punto.temperaturaC}°C`}
                                            {punto.tipo === "RENALIO_ETNO" && `🌐 IPI:${punto.ipiScore} ${punto.nombre.split(" ")[0]}`}
                                        </text>
                                    </g>
                                );
                            })}
                        </svg>

                        {/* Banner flotante de coordenadas, proyección y capa activa */}
                        <div className="absolute top-4 left-4 bg-slate-900/90 backdrop-blur border border-slate-700/80 px-3 py-1.5 rounded-lg text-[11px] text-slate-300 shadow-xl flex items-center gap-2 select-none">
                            <Compass className="w-3.5 h-3.5 text-blue-400" />
                            <span>Proyección: <strong>WGS84 EPSG:4326</strong></span>
                            <span className="text-slate-600">•</span>
                            <span>Capa Base: <strong className="text-sky-400 uppercase">
                                {baseMap === "dark" ? "Táctico C2 (MGRS)" : baseMap === "satellite" ? "Satelital Multiespectral" : baseMap === "terrain" ? "Relieve & Topografía" : "Marítimo & Batimetría"}
                            </strong></span>
                        </div>

                        {/* Ficha de Leyenda Dinámica de la Capa Seleccionada */}
                        <div className="absolute top-4 right-4 bg-slate-900/90 backdrop-blur border border-slate-700/80 px-3 py-1.5 rounded-lg text-[10px] text-slate-300 shadow-xl select-none hidden sm:flex items-center gap-2">
                            {baseMap === "satellite" && (
                                <>
                                    <Satellite className="w-3 h-3 text-emerald-400" />
                                    <span>Ortoimagen Multiespectral • <strong>NOAA CRW / Sentinel 5km</strong></span>
                                </>
                            )}
                            {baseMap === "terrain" && (
                                <>
                                    <Mountain className="w-3 h-3 text-amber-400" />
                                    <span>Hipsometría Andina • <strong>0m (Costa) a 6,768m (Huascarán)</strong></span>
                                </>
                            )}
                            {baseMap === "ocean" && (
                                <>
                                    <Waves className="w-3 h-3 text-sky-400" />
                                    <span>Batimetría Oficial • <strong>Mar de Grau & Fosa -6,868m</strong></span>
                                </>
                            )}
                            {baseMap === "dark" && (
                                <>
                                    <Compass className="w-3 h-3 text-blue-400" />
                                    <span>Retícula Militar • <strong>Sala de Crisis C2</strong></span>
                                </>
                            )}
                        </div>
                    </div>

                    {/* 3. BARRA INFERIOR DE REPRODUCCIÓN RADAR DOPPLER (TIMELINE SCRUBBER) */}
                    <div className="absolute bottom-4 left-4 right-4 bg-slate-900/95 backdrop-blur-md border border-slate-700/80 p-2.5 rounded-xl shadow-2xl flex flex-wrap items-center justify-between gap-3 text-xs z-10">
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setRadarPlaying(prev => !prev)}
                                className="bg-sky-600 hover:bg-sky-500 text-white p-1.5 rounded-lg transition shadow flex items-center gap-1 font-semibold text-[11px]"
                            >
                                {radarPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                                <span>{radarPlaying ? "Pausar" : "Reproducir"}</span>
                            </button>
                            <span className="text-slate-400 text-[11px] flex items-center gap-1 font-medium">
                                <Clock className="w-3 h-3 text-sky-400" />
                                Bucle Radar Doppler RainViewer:
                            </span>
                        </div>

                        {/* Puntos de la Línea de Tiempo */}
                        <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
                            {radarLabels.map((label, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => {
                                        setRadarStep(idx);
                                        setRadarPlaying(false);
                                    }}
                                    className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition ${
                                        radarStep === idx
                                            ? "bg-sky-500 text-white shadow-md shadow-sky-500/30 scale-105"
                                            : "bg-slate-950 text-slate-400 hover:bg-slate-800"
                                    }`}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>

                        <div className="text-[10px] text-slate-500 hidden lg:block">
                            *Actualización continua cada 10 min vía satélites GOES & red de radares.
                        </div>
                    </div>
                </div>

                {/* 4. DRAWER LATERAL DE TELEMETRÍA TÁCTICA E INTELIGENCIA HISTÓRICA */}
                {puntoSeleccionado && (
                    <div className="w-80 md:w-96 bg-slate-900/95 backdrop-blur-xl border-l border-slate-800 p-4 overflow-y-auto flex flex-col justify-between shrink-0 z-20 text-xs shadow-2xl space-y-4 animate-in slide-in-from-right duration-200">
                        <div className="space-y-4">
                            {/* Cabecera del Punto */}
                            <div className="flex items-start justify-between border-b border-slate-800 pb-3">
                                <div>
                                    <div className="flex items-center gap-1.5 mb-1">
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                            puntoSeleccionado.nivel === "ROJO" ? "bg-red-950 text-red-300 border border-red-700" :
                                            puntoSeleccionado.nivel === "AMARILLO" ? "bg-amber-950 text-amber-300 border border-amber-700" :
                                            "bg-emerald-950 text-emerald-300 border border-emerald-700"
                                        }`}>
                                            ALERTA {puntoSeleccionado.nivel}
                                        </span>
                                        <span className="text-slate-500 font-mono text-[10px]">UBIGEO: {puntoSeleccionado.ubigeo}</span>
                                    </div>
                                    <h3 className="font-bold text-sm text-white leading-snug">
                                        {puntoSeleccionado.nombre}
                                    </h3>
                                    <p className="text-[11px] text-slate-400">
                                        {puntoSeleccionado.region} {puntoSeleccionado.provincia ? `• ${puntoSeleccionado.provincia}` : ""}
                                    </p>
                                </div>
                                <button
                                    onClick={() => setPuntoSeleccionado(null)}
                                    className="text-slate-400 hover:text-white p-1 rounded-lg bg-slate-800/60"
                                >
                                    ✕
                                </button>
                            </div>

                            {/* MÉTRICAS EN VIVO */}
                            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2">
                                <div className="font-semibold text-slate-300 text-[11px] flex items-center gap-1.5 text-blue-400">
                                    <Activity className="w-3.5 h-3.5" />
                                    Telemetría en Tiempo Real
                                </div>

                                {puntoSeleccionado.tsmTemperatura !== undefined && (
                                    <div className="flex justify-between items-center py-1 border-b border-slate-900">
                                        <span className="text-slate-400">TSM Superficial:</span>
                                        <span className="font-bold text-orange-400 text-sm">{puntoSeleccionado.tsmTemperatura}°C</span>
                                    </div>
                                )}

                                {puntoSeleccionado.tsmAnomalia !== undefined && (
                                    <div className="flex justify-between items-center py-1 border-b border-slate-900">
                                        <span className="text-slate-400">Anomalía Térmica NOAA:</span>
                                        <span className="font-bold text-red-400">+{puntoSeleccionado.tsmAnomalia}°C (Alerta ENSO)</span>
                                    </div>
                                )}

                                {puntoSeleccionado.ondaKelvin !== undefined && (
                                    <div className="flex justify-between items-center py-1 border-b border-slate-900">
                                        <span className="text-slate-400">Onda Kelvin Costera:</span>
                                        <span className={`font-bold ${puntoSeleccionado.ondaKelvin ? "text-orange-400" : "text-emerald-400"}`}>
                                            {puntoSeleccionado.ondaKelvin ? "ACTIVA (Hundimiento)" : "Normal"}
                                        </span>
                                    </div>
                                )}

                                {puntoSeleccionado.caudalActualM3s !== undefined && (
                                    <div className="flex justify-between items-center py-1 border-b border-slate-900">
                                        <span className="text-slate-400">Caudal Fluvial Actual:</span>
                                        <span className="font-bold text-sky-400 text-sm">{puntoSeleccionado.caudalActualM3s} m³/s</span>
                                    </div>
                                )}

                                {puntoSeleccionado.caudalUmbralRojoM3s !== undefined && (
                                    <div className="flex justify-between items-center py-1 border-b border-slate-900">
                                        <span className="text-slate-400">Umbral Desborde Rojo:</span>
                                        <span className="font-bold text-red-400">{puntoSeleccionado.caudalUmbralRojoM3s} m³/s</span>
                                    </div>
                                )}

                                {puntoSeleccionado.umbralMmH !== undefined && (
                                    <div className="flex justify-between items-center py-1 border-b border-slate-900">
                                        <span className="text-slate-400">Umbral Lluvia Huaico:</span>
                                        <span className="font-bold text-amber-400">{puntoSeleccionado.umbralMmH} mm/h</span>
                                    </div>
                                )}

                                {puntoSeleccionado.tiempoConcentracionH !== undefined && (
                                    <div className="flex justify-between items-center py-1 border-b border-slate-900">
                                        <span className="text-slate-400">Retardo Aluvial Manning (T_lag):</span>
                                        <span className="font-bold text-rose-400 font-mono">
                                            {puntoSeleccionado.tiempoConcentracionH} h (~{Math.round(puntoSeleccionado.tiempoConcentracionH * 60)} min)
                                        </span>
                                    </div>
                                )}

                                {puntoSeleccionado.tipo === "QUEBRADA_CRITICA" && (
                                    <div className="flex justify-between items-center py-1 border-b border-slate-900">
                                        <span className="text-slate-400">Índice IPH-FEN (Física Manning):</span>
                                        <span className="font-bold text-amber-400 font-mono">
                                            {puntoSeleccionado.nivel === "ROJO" ? "88.5% (Crítico Inminente)" : "52.0% (Vigilancia)"}
                                        </span>
                                    </div>
                                )}

                                {puntoSeleccionado.tipo === "ESTACION_AFORO" && puntoSeleccionado.caudalActualM3s && puntoSeleccionado.caudalUmbralRojoM3s && (
                                    <div className="flex justify-between items-center py-1 border-b border-slate-900">
                                        <span className="text-slate-400">Ratio Capacidad Red ANA:</span>
                                        <span className="font-bold text-rose-400 font-mono">
                                            {Math.round((puntoSeleccionado.caudalActualM3s / puntoSeleccionado.caudalUmbralRojoM3s) * 100)}% de sección crítica
                                        </span>
                                    </div>
                                )}

                                {puntoSeleccionado.temperaturaC !== undefined && (
                                    <div className="flex justify-between items-center py-1 border-b border-slate-900">
                                        <span className="text-slate-400">Temperatura Mínima:</span>
                                        <span className="font-bold text-cyan-400 text-sm">{puntoSeleccionado.temperaturaC}°C</span>
                                    </div>
                                )}

                                {puntoSeleccionado.poblacionAfectada !== undefined && (
                                    <div className="flex justify-between items-center py-1 border-b border-slate-900">
                                        <span className="text-slate-400">Población Expuesta:</span>
                                        <span className="font-bold text-white">{(puntoSeleccionado.poblacionAfectada).toLocaleString()} hab.</span>
                                    </div>
                                )}

                                {puntoSeleccionado.ipiScore !== undefined && (
                                    <div className="flex justify-between items-center py-1 border-b border-slate-900">
                                        <span className="text-slate-400">Índice IPI (Triple Vulnerabilidad):</span>
                                        <span className="font-bold text-purple-400 text-sm">{puntoSeleccionado.ipiScore} / 100</span>
                                    </div>
                                )}
                                {puntoSeleccionado.cenepredRiesgo && (
                                    <div className="flex justify-between items-center py-1 border-b border-slate-900">
                                        <span className="text-slate-400">Riesgo CENEPRED (1,891 distritos):</span>
                                        <span className="font-bold text-red-400">{puntoSeleccionado.cenepredRiesgo}</span>
                                    </div>
                                )}
                                {puntoSeleccionado.ds124Pcm !== undefined && (
                                    <div className="flex justify-between items-center py-1 border-b border-slate-900">
                                        <span className="text-slate-400">D.S. 124-2026-PCM (Emergencia FEN):</span>
                                        <span className="font-bold text-emerald-400">{puntoSeleccionado.ds124Pcm ? "VIGENTE (Decreto)" : "No consignado"}</span>
                                    </div>
                                )}
                                {puntoSeleccionado.lenguaNombre && (
                                    <div className="flex justify-between items-center py-1 border-b border-slate-900">
                                        <span className="text-slate-400">Lengua RENALIO Predominante:</span>
                                        <span className="font-bold text-purple-300">{puntoSeleccionado.lenguaNombre}</span>
                                    </div>
                                )}
                                {puntoSeleccionado.esBilingue !== undefined && (
                                    <div className="flex justify-between items-center py-1 border-b border-slate-900">
                                        <span className="text-slate-400">Régimen Alerta ITU-T X.1303:</span>
                                        <span className={`font-bold ${puntoSeleccionado.esBilingue ? "text-amber-400" : "text-sky-400"}`}>
                                            {puntoSeleccionado.esBilingue ? "BILINGÜE (Nativa + Castellano)" : "MONOLINGÜE (Castellano)"}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* SECCIÓN DE INTELIGENCIA HISTÓRICA (data/) */}
                            <div className="bg-amber-950/20 border border-amber-800/40 p-3 rounded-xl space-y-2">
                                <div className="font-semibold text-amber-300 text-[11px] flex items-center gap-1.5">
                                    <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                                    Memoria Histórica & Lección FEN
                                </div>

                                {puntoSeleccionado.caudalRecord1998M3s !== undefined && (
                                    <div className="bg-slate-950/60 p-2 rounded-lg border border-amber-900/30 text-[11px]">
                                        <span className="text-slate-400">Récord Histórico El Niño 1998:</span>
                                        <div className="text-red-400 font-bold text-sm mt-0.5">
                                            {puntoSeleccionado.caudalRecord1998M3s} m³/s
                                        </div>
                                    </div>
                                )}

                                {puntoSeleccionado.historialActivaciones && (
                                    <div className="text-[11px] text-slate-300">
                                        <span className="text-slate-400">Años de Activación Crítica: </span>
                                        <span className="font-semibold text-amber-300">
                                            {puntoSeleccionado.historialActivaciones.join(", ")}
                                        </span>
                                    </div>
                                )}

                                <p className="text-[11px] text-slate-300 leading-relaxed italic bg-slate-950/40 p-2 rounded-lg border border-slate-800">
                                    &ldquo;{puntoSeleccionado.leccionHistorica || puntoSeleccionado.detalles}&rdquo;
                                </p>
                            </div>
                        </div>

                        {/* Botones de Acción */}
                        <div className="pt-2 border-t border-slate-800 flex flex-col gap-2">
                            <div className="flex items-center gap-2">
                                <Link
                                    href={`/dashboard/${puntoSeleccionado.ubigeo}`}
                                    className="flex-1 bg-blue-600 hover:bg-blue-500 text-white px-3 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition shadow-lg"
                                >
                                    <span>Abrir Consola Municipal</span>
                                    <ExternalLink className="w-3.5 h-3.5" />
                                </Link>
                                <button
                                    onClick={() => setPuntoSeleccionado(null)}
                                    className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-2 rounded-lg text-xs transition"
                                >
                                    Cerrar
                                </button>
                            </div>

                            <Link
                                href="/doctrina"
                                className="w-full bg-purple-950/80 hover:bg-purple-900 border border-purple-700 text-purple-300 hover:text-white px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition shadow"
                            >
                                <Scale className="w-3.5 h-3.5 text-purple-400" />
                                <span>Ver Formulación Doctrinal & Fórmulas IPI</span>
                            </Link>
                        </div>
                    </div>
                )}
            </div>

            {/* MODAL / PANTALLA DE TRANSMISIONES EN VIVO VIDEO WALL C2 */}
            <VideoWallC2
                isOpen={showVideoWall}
                onClose={() => setShowVideoWall(false)}
                onSelectDistrict={(ubigeo) => {
                    const match = puntosActivos.find(p => p.ubigeo === ubigeo) ||
                        QUEBRADAS_CRITICAS_MAPA.find(p => p.ubigeo === ubigeo) ||
                        ESTACIONES_AFORO_CRITICAS.find(p => p.ubigeo === ubigeo);
                    if (match) {
                        setPuntoSeleccionado(match);
                    }
                    setShowVideoWall(false);
                }}
            />
        </div>
    );
}
