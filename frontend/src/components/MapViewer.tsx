"use client";

import React, { useState, useEffect, useRef } from "react";
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
    Lock,
    CheckCircle2,
    XCircle,
    Maximize2,
    Minimize2,
    Waves,
    CloudRain,
    Snowflake,
    Radio
} from "lucide-react";

type Props = {
    mode?: "national" | "municipal";
    ubigeo?: string;
};

export interface PuntoTerritorial {
    id: string;
    nombre: string;
    region: string;
    ubigeo: string;
    tipo: "HUAICO" | "DESBORDE" | "HELADA" | "BOYA_TSM" | "CLIMA_UBIGEO";
    nivel: "ROJO" | "AMARILLO" | "VERDE";
    lat: number;
    lng: number;
    detalles: string;
    umbralMmH?: number;
    tiempoConcentracionH?: number;
    poblacionAfectada?: number;
    cuenca?: string;
    // Métricas marinas y climáticas
    tsmTemperatura?: number;
    tsmAnomalia?: number;
    ondaKelvin?: boolean;
    lluvia24h?: number;
    capeJkg?: number;
    temperaturaC?: number;
    // Coordenadas SVG porcentuales para modo fallback
    cx: number;
    cy: number;
}

// Red de Boyas Oceanográficas DHN / IMARPE (Monitoreo de Ondas Kelvin y TSM El Niño)
const BOYAS_OCEANOGRAFICAS: PuntoTerritorial[] = [
    {
        id: "b-tumbes",
        nombre: "Boya DHN Puerto Pizarro (Tumbes)",
        region: "Tumbes",
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
        ubigeo: "200101",
        tipo: "BOYA_TSM",
        nivel: "ROJO",
        lat: -5.08,
        lng: -81.25,
        detalles: "TSM: 24.2°C (Anomalía +3.2°C) • Termoclina profundizada a 88m • Marejada ligera",
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
        ubigeo: "021801",
        tipo: "BOYA_TSM",
        nivel: "ROJO",
        lat: -9.08,
        lng: -78.68,
        detalles: "TSM: 21.8°C (Anomalía +2.6°C) • Termoclina 72m • Pulso Kelvin en avance",
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
        ubigeo: "070101",
        tipo: "BOYA_TSM",
        nivel: "ROJO",
        lat: -12.05,
        lng: -77.30,
        detalles: "TSM: 20.1°C (Anomalía +2.6°C) • Calentamiento costero frente a la capital",
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
        ubigeo: "110501",
        tipo: "BOYA_TSM",
        nivel: "AMARILLO",
        lat: -13.78,
        lng: -76.35,
        detalles: "TSM: 19.2°C (Anomalía +2.0°C) • Vigilancia térmica costera",
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
        ubigeo: "180301",
        tipo: "BOYA_TSM",
        nivel: "VERDE",
        lat: -17.65,
        lng: -71.42,
        detalles: "TSM: 17.6°C (Anomalía +1.3°C) • Condiciones marítimas estables",
        tsmTemperatura: 17.6,
        tsmAnomalia: 1.3,
        ondaKelvin: false,
        cuenca: "Mar de Grau / Litoral Sur",
        cx: 65,
        cy: 88
    }
];

// Nodos de Clima y Precipitación por UBIGEO (Open-Meteo ECMWF + EMA SENAMHI)
const CLIMA_UBIGEOS: PuntoTerritorial[] = [
    {
        id: "c-chosica",
        nombre: "Lurigancho-Chosica",
        region: "Lima",
        ubigeo: "150118",
        tipo: "CLIMA_UBIGEO",
        nivel: "ROJO",
        lat: -11.9428,
        lng: -76.7094,
        detalles: "Lluvia: 41.2 mm • CAPE: 1,620 J/kg • Suelo talud saturado al 88%",
        lluvia24h: 41.2,
        capeJkg: 1620,
        cuenca: "Río Rímac / Qda. Huaycoloro",
        poblacionAfectada: 124000,
        cx: 46,
        cy: 58
    },
    {
        id: "c-piura",
        nombre: "Piura / Catacaos",
        region: "Piura",
        ubigeo: "200101",
        tipo: "CLIMA_UBIGEO",
        nivel: "ROJO",
        lat: -5.1945,
        lng: -80.6328,
        detalles: "Lluvia: 48.0 mm • Caudal: 890 m³/s • Alerta roja desborde bajo Piura",
        lluvia24h: 48.0,
        capeJkg: 1850,
        cuenca: "Río Piura",
        poblacionAfectada: 485000,
        cx: 28,
        cy: 22
    },
    {
        id: "c-tumbes",
        nombre: "Tumbes Centro",
        region: "Tumbes",
        ubigeo: "240101",
        tipo: "CLIMA_UBIGEO",
        nivel: "ROJO",
        lat: -3.5667,
        lng: -80.4500,
        detalles: "Lluvia: 52.0 mm • CAPE: 1,920 J/kg • Crecida Río Puyango-Tumbes",
        lluvia24h: 52.0,
        capeJkg: 1920,
        cuenca: "Río Tumbes",
        poblacionAfectada: 95000,
        cx: 25,
        cy: 12
    },
    {
        id: "c-illimo",
        nombre: "Íllimo (Valle La Leche)",
        region: "Lambayeque",
        ubigeo: "140304",
        tipo: "CLIMA_UBIGEO",
        nivel: "AMARILLO",
        lat: -6.4800,
        lng: -79.8500,
        detalles: "Lluvia: 22.0 mm • Caudal: 320 m³/s • Suelo 68% • Faja vulnerable",
        lluvia24h: 22.0,
        capeJkg: 980,
        cuenca: "Río La Leche",
        poblacionAfectada: 42000,
        cx: 31,
        cy: 29
    },
    {
        id: "c-trujillo",
        nombre: "El Porvenir / Trujillo",
        region: "La Libertad",
        ubigeo: "130102",
        tipo: "CLIMA_UBIGEO",
        nivel: "ROJO",
        lat: -8.0833,
        lng: -78.9667,
        detalles: "Lluvia: 36.5 mm • CAPE: 1,420 J/kg • Qda. San Ildefonso activable",
        lluvia24h: 36.5,
        capeJkg: 1420,
        cuenca: "Río Moche / San Ildefonso",
        poblacionAfectada: 85000,
        cx: 34,
        cy: 39
    },
    {
        id: "c-chaclacayo",
        nombre: "Chaclacayo",
        region: "Lima",
        ubigeo: "150115",
        tipo: "CLIMA_UBIGEO",
        nivel: "AMARILLO",
        lat: -11.9750,
        lng: -76.7667,
        detalles: "Lluvia: 32.0 mm • CAPE: 1,380 J/kg • Suelo 82%",
        lluvia24h: 32.0,
        capeJkg: 1380,
        cuenca: "Río Rímac",
        poblacionAfectada: 45000,
        cx: 48,
        cy: 59
    }
];

// Nodos de Heladas Altoandinas y Friajes (AMARU-CHIRI)
const HELADAS_UBIGEOS: PuntoTerritorial[] = [
    {
        id: "h-mazocruz",
        nombre: "Santa Rosa / Mazocruz (El Collao)",
        region: "Puno",
        ubigeo: "210505",
        tipo: "HELADA",
        nivel: "ROJO",
        lat: -16.5833,
        lng: -69.6500,
        detalles: "Temp: -8.4°C (Anomalía -4.2°C) • 45,000 alpacas en riesgo de hipotermia",
        temperaturaC: -8.4,
        poblacionAfectada: 18500,
        cuenca: "Altiplano / Río Ilave",
        cx: 80,
        cy: 82
    },
    {
        id: "h-imata",
        nombre: "Imata (San Antonio de Chuca)",
        region: "Arequipa",
        ubigeo: "040501",
        tipo: "HELADA",
        nivel: "ROJO",
        lat: -15.8333,
        lng: -71.0833,
        detalles: "Temp: -9.2°C (Cota 4,500 msnm) • Helada severa sobre ganado y pastos",
        temperaturaC: -9.2,
        poblacionAfectada: 8200,
        cuenca: "Cuenca Quilca-Vítor-Chili",
        cx: 72,
        cy: 79
    },
    {
        id: "h-espinar",
        nombre: "Espinar (Yauri)",
        region: "Cusco",
        ubigeo: "080801",
        tipo: "HELADA",
        nivel: "AMARILLO",
        lat: -14.7936,
        lng: -71.4131,
        detalles: "Temp: -6.1°C • Helada agrometeorológica sobre cultivos andinos",
        temperaturaC: -6.1,
        poblacionAfectada: 32000,
        cuenca: "Alto Apurímac",
        cx: 68,
        cy: 72
    },
    {
        id: "h-macusani",
        nombre: "Macusani (Carabaya)",
        region: "Puno",
        ubigeo: "210301",
        tipo: "HELADA",
        nivel: "AMARILLO",
        lat: -14.0667,
        lng: -70.4333,
        detalles: "Temp: -7.5°C • Capital Alpaquera del Perú • Nevadas y helada",
        temperaturaC: -7.5,
        poblacionAfectada: 25000,
        cuenca: "Inambari / Altiplano",
        cx: 76,
        cy: 67
    }
];

// Quebradas Críticas Prioritarias (ANA / CENEPRED / INGEMMET)
const QUEBRADAS_CRITICAS: PuntoTerritorial[] = [
    {
        id: "q-carossio",
        nombre: "Quebrada Carossio (Chosica)",
        region: "Lima",
        ubigeo: "150118",
        tipo: "HUAICO",
        nivel: "ROJO",
        lat: -11.9428,
        lng: -76.7094,
        detalles: "Umbral: 14.5 mm/h • Tiempo conc: 1.8 h • Diques saturados",
        umbralMmH: 14.5,
        tiempoConcentracionH: 1.8,
        poblacionAfectada: 42000,
        cuenca: "Río Rímac",
        cx: 46,
        cy: 58
    },
    {
        id: "q-huaycoloro",
        nombre: "Quebrada Huaycoloro (San Antonio / Lurigancho)",
        region: "Lima",
        ubigeo: "150118",
        tipo: "HUAICO",
        nivel: "ROJO",
        lat: -11.9833,
        lng: -76.9167,
        detalles: "Historial de desborde hacia autopista Ramiro Prialé y puente Huaycoloro",
        umbralMmH: 16.0,
        tiempoConcentracionH: 2.2,
        poblacionAfectada: 68000,
        cuenca: "Río Rímac",
        cx: 44,
        cy: 57
    },
    {
        id: "q-san-ildefonso",
        nombre: "Quebrada San Ildefonso (El Porvenir / Trujillo)",
        region: "La Libertad",
        ubigeo: "130102",
        tipo: "HUAICO",
        nivel: "ROJO",
        lat: -8.0833,
        lng: -78.9667,
        detalles: "Umbral: 12.0 mm/h • Reincidencia crítica • Cono directo a Trujillo Centro",
        umbralMmH: 12.0,
        tiempoConcentracionH: 2.5,
        poblacionAfectada: 85000,
        cuenca: "Río Moche",
        cx: 34,
        cy: 39
    },
    {
        id: "q-leon-dormido",
        nombre: "Quebrada El León (Huanchaco)",
        region: "La Libertad",
        ubigeo: "130104",
        tipo: "HUAICO",
        nivel: "AMARILLO",
        lat: -8.0167,
        lng: -79.0833,
        detalles: "Umbral: 15.0 mm/h • Cruza Panamericana Norte y balneario Huanchaco",
        umbralMmH: 15.0,
        tiempoConcentracionH: 3.0,
        poblacionAfectada: 35000,
        cuenca: "Costera Huanchaco",
        cx: 33,
        cy: 38
    },
    {
        id: "q-pedregal",
        nombre: "Quebrada Pedregal y Quirio (Chosica)",
        region: "Lima",
        ubigeo: "150118",
        tipo: "HUAICO",
        nivel: "ROJO",
        lat: -11.9333,
        lng: -76.6900,
        detalles: "Umbral: 15.0 mm/h • Pendiente 24% • Cruce con Carretera Central Km 38",
        umbralMmH: 15.0,
        tiempoConcentracionH: 1.5,
        poblacionAfectada: 38000,
        cuenca: "Río Rímac",
        cx: 47,
        cy: 59
    }
];

// Polígono Marino de la Región Niño 1+2 (Costa Peruana y ZEE 200 Millas)
const POLIGONO_NINO_1_2 = [
    { lat: -3.0, lng: -82.0 },
    { lat: -3.0, lng: -80.0 },
    { lat: -6.0, lng: -80.8 },
    { lat: -10.0, lng: -78.5 },
    { lat: -14.0, lng: -76.5 },
    { lat: -18.4, lng: -71.2 },
    { lat: -18.4, lng: -74.5 },
    { lat: -12.0, lng: -80.0 },
    { lat: -5.0, lng: -83.0 }
];

// Estilo militar táctico Dark para Google Maps C2
const GOOGLE_MAPS_DARK_STYLE = [
    { elementType: "geometry", stylers: [{ color: "#0b1329" }] },
    { elementType: "labels.text.stroke", stylers: [{ color: "#0b1329" }] },
    { elementType: "labels.text.fill", stylers: [{ color: "#7488a6" }] },
    {
        featureType: "administrative.locality",
        elementType: "labels.text.fill",
        stylers: [{ color: "#93c5fd" }]
    },
    {
        featureType: "poi",
        elementType: "labels.text.fill",
        stylers: [{ color: "#64748b" }]
    },
    {
        featureType: "poi.park",
        elementType: "geometry",
        stylers: [{ color: "#0f172a" }]
    },
    {
        featureType: "road",
        elementType: "geometry",
        stylers: [{ color: "#1e293b" }]
    },
    {
        featureType: "road",
        elementType: "geometry.stroke",
        stylers: [{ color: "#0f172a" }]
    },
    {
        featureType: "road.highway",
        elementType: "geometry",
        stylers: [{ color: "#334155" }]
    },
    {
        featureType: "road.highway",
        elementType: "labels.text.fill",
        stylers: [{ color: "#cbd5e1" }]
    },
    {
        featureType: "water",
        elementType: "geometry",
        stylers: [{ color: "#0369a1" }]
    },
    {
        featureType: "water",
        elementType: "labels.text.fill",
        stylers: [{ color: "#38bdf8" }]
    },
    {
        featureType: "water",
        elementType: "labels.text.stroke",
        stylers: [{ color: "#075985" }]
    }
];

// Función utilitaria para proyectar coordenadas geográficas (Lat/Lng) sobre el SVG de contingencia
function projectCoordsToSvg(lat: number, lng: number): { cx: number; cy: number } {
    // Latitud Perú: de -3.0° (Norte) a -18.5° (Sur) -> Eje Y de 10 a 90
    const cy = Math.max(8, Math.min(92, ((lat - (-3.0)) / (-18.5 - (-3.0))) * 80 + 10));
    // Longitud Perú: de -81.5° (Oeste) a -69.0° (Este) -> Eje X de 15 a 85
    const cx = Math.max(10, Math.min(90, ((lng - (-81.5)) / (-69.0 - (-81.5))) * 70 + 15));
    return { cx: Math.round(cx), cy: Math.round(cy) };
}

export default function MapViewer({ mode = "national", ubigeo }: Props) {
    const mapRef = useRef<HTMLDivElement>(null);
    const googleMapInstance = useRef<any>(null);
    const infoWindowRef = useRef<any>(null);
    const markersRef = useRef<any[]>([]);
    const polygonRef = useRef<any>(null);
    const DEFAULT_MAPS_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "AIzaSyCQpoz3Zw4JarglGM7w2aq46d9XCtwfTyE";

    // Capas Dinámicas con Telemetría Viva (Inicializadas con fallback de contingencia)
    const [marinosList, setMarinosList] = useState<PuntoTerritorial[]>(BOYAS_OCEANOGRAFICAS);
    const [quebradasList, setQuebradasList] = useState<PuntoTerritorial[]>(QUEBRADAS_CRITICAS);
    const [climaList, setClimaList] = useState<PuntoTerritorial[]>(CLIMA_UBIGEOS);
    const [heladasList, setHeladasList] = useState<PuntoTerritorial[]>(HELADAS_UBIGEOS);
    const [poligonoMarino, setPoligonoMarino] = useState(POLIGONO_NINO_1_2);
    const [isLiveTelemetry, setIsLiveTelemetry] = useState<boolean>(false);
    const [boletinInfo, setBoletinInfo] = useState<{ fecha: string; nro: string; diagnostico?: string } | null>(null);

    // Carga de Telemetría Oficial en Vivo (IMARPE, 46 Quebradas, Open-Meteo Pro)
    useEffect(() => {
        let isMounted = true;
        const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

        const loadTelemetry = async () => {
            try {
                const [resLayers, resImarpe] = await Promise.all([
                    fetch(`${API_BASE}/api/maps/layers/telemetry`).catch(() => null),
                    fetch(`${API_BASE}/api/imarpe/latest`).catch(() => null)
                ]);

                if (resImarpe && resImarpe.ok) {
                    const imarpeData = await resImarpe.json();
                    if (isMounted && imarpeData && imarpeData.estaciones) {
                        setBoletinInfo({
                            fecha: imarpeData.fecha || "",
                            nro: `${imarpeData.boletin_anio || ''} ${imarpeData.boletin_nro || ''}`.trim(),
                            diagnostico: imarpeData.diagnostico_oficial || ""
                        });
                    }
                }

                if (resLayers && resLayers.ok) {
                    const layersData = await resLayers.json();

                    // 1. Red de 12 Estaciones Costeras Oficiales de IMARPE
                    if (layersData.tsm_marino?.estaciones_imarpe?.length > 0) {
                        const estaciones: PuntoTerritorial[] = layersData.tsm_marino.estaciones_imarpe.map((est: any) => {
                            const proj = projectCoordsToSvg(est.lat, est.lng);
                            const sinDatos = est.estado_reporte === "SIN_DATOS" || est.tsm_c === null;
                            const severidad = est.alerta?.severidad || 0;
                            const nivel: "ROJO" | "AMARILLO" | "VERDE" = severidad >= 3 ? "ROJO" : (severidad === 2 ? "AMARILLO" : "VERDE");

                            return {
                                id: `imarpe-${est.id}`,
                                nombre: `Estación IMARPE ${est.nombre} (${est.puerto})`,
                                region: est.region,
                                ubigeo: est.id === "paita" ? "200101" : (est.id === "callao" ? "070101" : (est.id === "tumbes" ? "240101" : "000000")),
                                tipo: "BOYA_TSM" as const,
                                nivel: nivel,
                                lat: est.lat,
                                lng: est.lng,
                                detalles: sinDatos
                                    ? `Estación costera ${est.puerto} (${est.region}): (1) Sin datos en el boletín del día.`
                                    : `TSM In-situ: ${est.tsm_c}°C • Anomalía: +${est.anomalia_c}°C (${est.alerta?.etiqueta || 'Vigilancia Térmica'})`,
                                tsmTemperatura: est.tsm_c ?? undefined,
                                tsmAnomalia: est.anomalia_c ?? undefined,
                                ondaKelvin: est.anomalia_c && est.anomalia_c >= 2.0,
                                cuenca: `Litoral Marino / ${est.region}`,
                                cx: proj.cx,
                                cy: proj.cy
                            };
                        });
                        if (isMounted) setMarinosList(estaciones);
                    }

                    // 2. Catálogo Nacional de 46 Quebradas Críticas
                    if (layersData.quebradas_criticas?.length > 0) {
                        const quebradas: PuntoTerritorial[] = layersData.quebradas_criticas.map((q: any, idx: number) => {
                            const lat = q.lat || (q.triangulo_hidrografico?.vertice_inferior_cono?.lat) || -11.94;
                            const lng = q.lng || (q.triangulo_hidrografico?.vertice_inferior_cono?.lng) || -76.70;
                            const proj = projectCoordsToSvg(lat, lng);
                            return {
                                id: q.id_quebrada || `q-${idx}`,
                                nombre: q.nombre,
                                region: q.region || "Costa / Andes",
                                ubigeo: q.ubigeo_receptor || q.ubigeo || "150118",
                                tipo: "HUAICO" as const,
                                nivel: "ROJO" as const,
                                lat: lat,
                                lng: lng,
                                detalles: `Umbral: ${q.umbral_critico_mm_hora || 15} mm/h • Cono: ${q.puntos_estrangulamiento?.[0] || q.cuenca} • ${q.frecuencia_historica || 'Riesgo Crítico'}`,
                                umbralMmH: q.umbral_critico_mm_hora || 15.0,
                                tiempoConcentracionH: q.tiempo_concentracion_horas || 2.0,
                                poblacionAfectada: q.poblacion_en_cono_deyeccion || 25000,
                                cuenca: q.cuenca,
                                cx: proj.cx,
                                cy: proj.cy
                            };
                        });
                        if (isMounted) setQuebradasList(quebradas);
                    }

                    // 3. Clima Distrital Vivo (Open-Meteo Pro)
                    if (layersData.clima_ubigeos?.length > 0) {
                        const climas: PuntoTerritorial[] = layersData.clima_ubigeos.map((c: any) => {
                            const proj = projectCoordsToSvg(c.lat, c.lng);
                            return {
                                id: `clima-${c.ubigeo}`,
                                nombre: c.nombre,
                                region: c.region,
                                ubigeo: c.ubigeo,
                                tipo: "CLIMA_UBIGEO" as const,
                                nivel: (c.nivel_alerta || "ROJO") as any,
                                lat: c.lat,
                                lng: c.lng,
                                detalles: `Lluvia 24h: ${c.lluvia_24h_mm} mm • CAPE: ${c.cape_j_kg} J/kg • Suelo: ${c.suelo_pct}% • Caudal: ${c.caudal_m3s} m³/s`,
                                lluvia24h: c.lluvia_24h_mm,
                                capeJkg: c.cape_j_kg,
                                cuenca: c.cuenca,
                                cx: proj.cx,
                                cy: proj.cy
                            };
                        });
                        if (isMounted) setClimaList(climas);
                    }

                    // 4. Polígono Marino Oficial
                    if (layersData.tsm_marino?.poligono_marino_nino_1_2) {
                        if (isMounted) setPoligonoMarino(layersData.tsm_marino.poligono_marino_nino_1_2);
                    }

                    if (isMounted) setIsLiveTelemetry(true);
                }
            } catch (err) {
                console.warn("MapViewer: operando con telemetría local de respaldo:", err);
            }
        };

        loadTelemetry();
        return () => { isMounted = false; };
    }, []);

    // Estado de la API Key y Google Maps
    const [apiKey, setApiKey] = useState<string>(
        process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || DEFAULT_MAPS_KEY
    );

    // Cargar clave desde localStorage o variable de entorno
    useEffect(() => {
        if (typeof window !== "undefined") {
            const saved = localStorage.getItem("gmaps_api_key");
            if (saved && saved.trim()) {
                setApiKey(saved.trim());
            } else if (process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
                setApiKey(process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY.trim());
            } else {
                setApiKey(DEFAULT_MAPS_KEY);
            }
        }
    }, []);

    const [mapLoaded, setMapLoaded] = useState<boolean>(false);
    const [mapError, setMapError] = useState<string | null>(null);
    const [showKeyModal, setShowKeyModal] = useState<boolean>(false);
    const [tempKeyInput, setTempKeyInput] = useState<string>("");

    const handleOpenKeyModal = () => {
        setTempKeyInput(apiKey || DEFAULT_MAPS_KEY);
        setShowKeyModal(true);
    };

    // ResizeObserver para que Google Maps recalcule su tamaño dinámicamente al expandir la visión
    useEffect(() => {
        if (!mapRef.current) return;
        const observer = new ResizeObserver(() => {
            if (googleMapInstance.current && (window as any).google?.maps) {
                (window as any).google.maps.event.trigger(googleMapInstance.current, "resize");
            }
        });
        observer.observe(mapRef.current);
        return () => observer.disconnect();
    }, [mapLoaded]);

    // Controles de Visualización Base
    const [mapType, setMapType] = useState<"dark" | "hybrid" | "terrain">(
        mode === "municipal" ? "hybrid" : "dark"
    );

    // Conmutadores de Capas Temáticas Especializadas C2
    const [showTSM, setShowTSM] = useState<boolean>(true);
    const [showClima, setShowClima] = useState<boolean>(true);
    const [showQuebradas, setShowQuebradas] = useState<boolean>(true);
    const [showHeladas, setShowHeladas] = useState<boolean>(mode === "national");

    // Estado de Pantalla Completa
    const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

    const toggleFullscreen = () => {
        setIsFullscreen(prev => !prev);
    };

    // Al entrar o salir de pantalla completa, forzar a Google Maps a recalcular su tamaño de vista
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape" && isFullscreen) {
                setIsFullscreen(false);
            }
        };
        window.addEventListener("keydown", handleKeyDown);

        const timer = setTimeout(() => {
            if (googleMapInstance.current && (window as any).google?.maps) {
                (window as any).google.maps.event.trigger(googleMapInstance.current, "resize");
            }
        }, 150);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
            clearTimeout(timer);
        };
    }, [isFullscreen]);

    // Búsqueda y Selección
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [puntoSeleccionado, setPuntoSeleccionado] = useState<PuntoTerritorial | null>(null);

    // Cargar Google Maps JavaScript API de forma asíncrona y segura
    useEffect(() => {
        if (!apiKey || typeof window === "undefined") return;

        // Registrar callback global esperado por la URL de Google Maps
        (window as any).__gmapsMeteoInit = () => {
            initGoogleMap();
        };

        // Capturar errores de autenticación/restricciones de Google Maps
        (window as any).gm_authFailure = () => {
            console.error("[GoogleMaps] gm_authFailure: Error de autenticación en Google Maps Platform.");
            setMapError("Google Maps Platform: Error de autenticación con la clave API. Revisa que el proyecto tenga facturación activa (Billing) y que este dominio esté autorizado en 'Restricciones de sitios web'.");
        };

        if ((window as any).google?.maps?.Map) {
            initGoogleMap();
            return;
        }

        const scriptId = "google-maps-platform-script";
        let script = document.getElementById(scriptId) as HTMLScriptElement;

        if (!script) {
            script = document.createElement("script");
            script.id = scriptId;
            script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=__gmapsMeteoInit&loading=async`;
            script.async = true;
            script.defer = true;
            script.onload = () => {
                initGoogleMap();
            };
            script.onerror = () => {
                setMapError("Error al descargar la librería de Google Maps Platform (revisa conexión o bloqueador de anuncios).");
            };
            document.head.appendChild(script);
        } else {
            if ((window as any).google?.maps?.Map) {
                initGoogleMap();
            } else {
                script.addEventListener("load", () => {
                    initGoogleMap();
                });
            }
        }

        const pollInterval = setInterval(() => {
            if ((window as any).google?.maps?.Map) {
                initGoogleMap();
                clearInterval(pollInterval);
            }
        }, 250);

        return () => {
            clearInterval(pollInterval);
        };
    }, [apiKey]);

    // Inicializar mapa de Google Maps
    const initGoogleMap = () => {
        if (!mapRef.current || !(window as any).google?.maps) return;

        try {
            const google = (window as any).google;
            const centroPeru = { lat: -9.189967, lng: -75.015152 };

            // Buscar coordenadas objetivo si hay ubigeo
            const targetPunto = ubigeo
                ? [...climaList, ...quebradasList, ...heladasList, ...marinosList].find(p => p.ubigeo === ubigeo)
                : null;

            const initialCenter = targetPunto ? { lat: targetPunto.lat, lng: targetPunto.lng } : centroPeru;
            const initialZoom = targetPunto ? (mode === "municipal" ? 14 : 12) : (mode === "municipal" ? 13 : 6);

            const map = new google.maps.Map(mapRef.current, {
                center: initialCenter,
                zoom: initialZoom,
                mapTypeId: mapType === "dark" ? "roadmap" : mapType,
                styles: mapType === "dark" ? GOOGLE_MAPS_DARK_STYLE : [],
                disableDefaultUI: false,
                zoomControl: true,
                mapTypeControl: false,
                streetViewControl: false,
                fullscreenControl: false,
                backgroundColor: "#020617"
            });

            googleMapInstance.current = map;
            infoWindowRef.current = new google.maps.InfoWindow();

            renderThematicLayers(map);
            setMapLoaded(true);
            setMapError(null);
        } catch (err: any) {
            console.error("Error inicializando Google Maps:", err);
            setMapError(err?.message || "Error al inicializar mapa");
        }
    };

    // Auto-centrado dinámico cuando cambia el ubigeo
    useEffect(() => {
        if (!googleMapInstance.current || !ubigeo) return;
        const target = [...climaList, ...quebradasList, ...heladasList, ...marinosList].find(p => p.ubigeo === ubigeo);
        if (target) {
            setPuntoSeleccionado(target);
            googleMapInstance.current.panTo({ lat: target.lat, lng: target.lng });
            googleMapInstance.current.setZoom(mode === "municipal" ? 14 : 12);
        }
    }, [ubigeo, mode, mapLoaded, climaList, quebradasList, heladasList, marinosList]);

    // Actualizar estilo del mapa (Dark / Satelital / Terreno)
    useEffect(() => {
        if (!googleMapInstance.current || !(window as any).google?.maps) return;
        const google = (window as any).google;

        if (mapType === "dark") {
            googleMapInstance.current.setMapTypeId("roadmap");
            googleMapInstance.current.setOptions({ styles: GOOGLE_MAPS_DARK_STYLE });
        } else if (mapType === "hybrid") {
            googleMapInstance.current.setMapTypeId(google.maps.MapTypeId.HYBRID);
            googleMapInstance.current.setOptions({ styles: [] });
        } else if (mapType === "terrain") {
            googleMapInstance.current.setMapTypeId(google.maps.MapTypeId.TERRAIN);
            googleMapInstance.current.setOptions({ styles: [] });
        }
    }, [mapType]);

    // Re-renderizar capas temáticas cuando el usuario active/desactive un conmutador o lleguen datos vivos
    useEffect(() => {
        if (googleMapInstance.current) {
            renderThematicLayers(googleMapInstance.current);
        }
    }, [showTSM, showClima, showQuebradas, showHeladas, marinosList, quebradasList, climaList, heladasList, poligonoMarino]);

    // Renderizado multicapa en Google Maps con Telemetría Viva
    const renderThematicLayers = (map: any) => {
        const google = (window as any).google;
        if (!google?.maps) return;

        // 1. Limpiar marcadores y polígonos previos
        markersRef.current.forEach(m => m.setMap(null));
        markersRef.current = [];

        if (polygonRef.current) {
            polygonRef.current.setMap(null);
            polygonRef.current = null;
        }

        // 2. CAPA 1: TEMPERATURA DEL MAR (TSM) - RED DE ESTACIONES OFICIALES IMARPE (BDO)
        if (showTSM) {
            // Dibujar polígono térmico marino Niño 1+2
            const ninoPolygon = new google.maps.Polygon({
                paths: poligonoMarino,
                strokeColor: "#f97316",
                strokeOpacity: 0.8,
                strokeWeight: 2,
                fillColor: "#ea580c",
                fillOpacity: 0.18,
                map: map
            });
            polygonRef.current = ninoPolygon;

            // Marcadores de Estaciones Costeras IMARPE
            marinosList.forEach(boya => {
                const sinDatos = boya.tsmTemperatura === undefined || boya.tsmTemperatura === null;
                const esExtrema = boya.tsmAnomalia && boya.tsmAnomalia >= 4.5;
                const labelText = sinDatos ? "S/D" : `${boya.tsmTemperatura?.toFixed(1)}°`;

                const marker = new google.maps.Marker({
                    position: { lat: boya.lat, lng: boya.lng },
                    map: map,
                    title: boya.nombre,
                    label: {
                        text: labelText,
                        color: "#ffffff",
                        fontSize: "9px",
                        fontWeight: "bold"
                    },
                    icon: {
                        path: google.maps.SymbolPath.CIRCLE,
                        scale: esExtrema ? 16 : 13,
                        fillColor: sinDatos ? "#64748b" : (esExtrema ? "#dc2626" : (boya.tsmAnomalia && boya.tsmAnomalia >= 2.0 ? "#ea580c" : "#059669")),
                        fillOpacity: 0.95,
                        strokeColor: "#ffffff",
                        strokeWeight: esExtrema ? 2.5 : 1.8
                    }
                });

                marker.addListener("click", () => {
                    setPuntoSeleccionado(boya);
                    map.panTo({ lat: boya.lat, lng: boya.lng });
                    const anomaliaHtml = sinDatos
                        ? `<span style="color: #64748b; font-weight: bold;">(1) Sin datos en boletín</span>`
                        : `<span style="color: ${esExtrema ? '#dc2626' : '#c2410c'}; font-weight: bold; font-size: 13px;">+${boya.tsmAnomalia?.toFixed(1)}°C (${esExtrema ? '¡Alerta Térmica Extrema!' : 'Anomalía Observada'})</span>`;

                    const content = `
                        <div style="color: #0f172a; font-family: ui-sans-serif, system-ui, sans-serif; padding: 6px; max-width: 290px;">
                            <div style="font-weight: 800; font-size: 13px; color: #0d9488; margin-bottom: 2px;">
                                🌊 ESTACIÓN COSTERA IMARPE (BDO)
                            </div>
                            <div style="font-weight: 700; font-size: 12px; margin-bottom: 4px;">
                                ${boya.nombre}
                            </div>
                            <div style="background: #f0fdfa; border: 1px solid #ccfbf1; padding: 6px; border-radius: 6px; font-size: 11px; margin-bottom: 6px;">
                                <strong>TSM Superficie:</strong> <span style="font-size: 13px; color: #0f766e; font-weight: bold;">${sinDatos ? '---' : `${boya.tsmTemperatura}°C`}</span><br/>
                                <strong>Anomalía Térmica:</strong> ${anomaliaHtml}<br/>
                                <strong>Régimen:</strong> <span style="color: #0f766e; font-weight: bold;">${boya.ondaKelvin ? "Propagación Onda Kelvin Activa" : "Vigilancia Térmica"}</span>
                            </div>
                            <div style="font-size: 10px; color: #64748b; margin-bottom: 6px;">
                                ${boya.detalles}
                            </div>
                            <a href="/imarpe" style="display: block; text-align: center; background: #0d9488; color: white; padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: bold; text-decoration: none;">
                                Ver en Consola IMARPE →
                            </a>
                        </div>
                    `;
                    if (infoWindowRef.current) {
                        (infoWindowRef.current as any)?.setContent(content);
                        (infoWindowRef.current as any)?.open(map, marker);
                    }
                });
                markersRef.current.push(marker);
            });
        }

        // 3. CAPA 2: CLIMA & PRECIPITACIÓN (OPEN-METEO PRO + ECMWF IFS)
        if (showClima) {
            climaList.forEach(clima => {
                const marker = new google.maps.Marker({
                    position: { lat: clima.lat, lng: clima.lng },
                    map: map,
                    title: clima.nombre,
                    label: {
                        text: `${clima.lluvia24h ?? 0}mm`,
                        color: "#ffffff",
                        fontSize: "9px",
                        fontWeight: "bold"
                    },
                    icon: {
                        path: google.maps.SymbolPath.CIRCLE,
                        scale: 13,
                        fillColor: clima.nivel === "ROJO" ? "#2563eb" : "#0284c7",
                        fillOpacity: 0.95,
                        strokeColor: "#ffffff",
                        strokeWeight: 2
                    }
                });

                marker.addListener("click", () => {
                    setPuntoSeleccionado(clima);
                    map.panTo({ lat: clima.lat, lng: clima.lng });
                    const content = `
                        <div style="color: #0f172a; font-family: ui-sans-serif, system-ui, sans-serif; padding: 6px; max-width: 270px;">
                            <div style="font-weight: 800; font-size: 13px; color: #0284c7; margin-bottom: 2px;">
                                🌧️ CLIMA & PRECIPITACIÓN EN CUENCA
                            </div>
                            <div style="font-weight: 700; font-size: 12px; margin-bottom: 4px;">
                                ${clima.nombre} (UBIGEO: ${clima.ubigeo})
                            </div>
                            <div style="background: #f0f9ff; border: 1px solid #e0f2fe; padding: 6px; border-radius: 6px; font-size: 11px; margin-bottom: 6px;">
                                <strong>Lluvia 24h (ECMWF IFS):</strong> <span style="font-size: 13px; color: #0369a1; font-weight: bold;">${clima.lluvia24h ?? 0} mm</span><br/>
                                <strong>Índice CAPE Convectivo:</strong> <span style="color: #b45309; font-weight: bold;">${clima.capeJkg ?? 0} J/kg</span><br/>
                                <strong>Cuenca:</strong> ${clima.cuenca || 'Cuenca local'}
                            </div>
                            <div style="font-size: 10px; color: #64748b;">
                                ${clima.detalles}
                            </div>
                        </div>
                    `;
                    if (infoWindowRef.current) {
                        infoWindowRef.current.setContent(content);
                        infoWindowRef.current.open(map, marker);
                    }
                });
                markersRef.current.push(marker);
            });
        }

        // 4. CAPA 3: CATÁLOGO DE 46 QUEBRADAS CRÍTICAS (HUAICOS CENEPRED / ANA)
        if (showQuebradas) {
            quebradasList.forEach(quebrada => {
                const marker = new google.maps.Marker({
                    position: { lat: quebrada.lat, lng: quebrada.lng },
                    map: map,
                    title: quebrada.nombre,
                    icon: {
                        path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
                        scale: 5,
                        fillColor: "#ef4444",
                        fillOpacity: 1.0,
                        strokeColor: "#ffffff",
                        strokeWeight: 1.2,
                        rotation: 180
                    }
                });

                marker.addListener("click", () => {
                    setPuntoSeleccionado(quebrada);
                    map.panTo({ lat: quebrada.lat, lng: quebrada.lng });
                    const content = `
                        <div style="color: #0f172a; font-family: ui-sans-serif, system-ui, sans-serif; padding: 6px; max-width: 280px;">
                            <div style="font-weight: 800; font-size: 13px; color: #dc2626; margin-bottom: 2px;">
                                ⚠️ QUEBRADA CRÍTICA ACTIVABLE
                            </div>
                            <div style="font-weight: 700; font-size: 12px; margin-bottom: 4px;">
                                ${quebrada.nombre}
                            </div>
                            <div style="background: #fef2f2; border: 1px solid #fee2e2; padding: 6px; border-radius: 6px; font-size: 11px; margin-bottom: 6px;">
                                <strong>Umbral Huaico:</strong> <span style="font-size: 12px; color: #b91c1c; font-weight: bold;">${quebrada.umbralMmH ?? 15} mm/h</span><br/>
                                <strong>Tiempo Concentración:</strong> ${quebrada.tiempoConcentracionH ?? 2} horas<br/>
                                <strong>Población en Cono:</strong> ${(quebrada.poblacionAfectada || 0).toLocaleString()} habitantes
                            </div>
                            <div style="font-size: 10px; color: #64748b;">
                                ${quebrada.detalles}
                            </div>
                        </div>
                    `;
                    if (infoWindowRef.current) {
                        infoWindowRef.current.setContent(content);
                        infoWindowRef.current.open(map, marker);
                    }
                });
                markersRef.current.push(marker);
            });
        }

        // 5. CAPA 4: HELADAS Y FRIAJES ALTOANDINOS (AMARU-CHIRI)
        if (showHeladas) {
            heladasList.forEach(helada => {
                const marker = new google.maps.Marker({
                    position: { lat: helada.lat, lng: helada.lng },
                    map: map,
                    title: helada.nombre,
                    label: {
                        text: `${helada.temperaturaC ?? 0}°C`,
                        color: "#ffffff",
                        fontSize: "9px",
                        fontWeight: "bold"
                    },
                    icon: {
                        path: google.maps.SymbolPath.CIRCLE,
                        scale: 13,
                        fillColor: "#06b6d4",
                        fillOpacity: 0.95,
                        strokeColor: "#ffffff",
                        strokeWeight: 2
                    }
                });

                marker.addListener("click", () => {
                    setPuntoSeleccionado(helada);
                    map.panTo({ lat: helada.lat, lng: helada.lng });
                    const content = `
                        <div style="color: #0f172a; font-family: ui-sans-serif, system-ui, sans-serif; padding: 6px; max-width: 270px;">
                            <div style="font-weight: 800; font-size: 13px; color: #0891b2; margin-bottom: 2px;">
                                ❄️ HELADA AGROMETEOROLÓGICA (AMARU-CHIRI)
                            </div>
                            <div style="font-weight: 700; font-size: 12px; margin-bottom: 4px;">
                                ${helada.nombre} (UBIGEO: ${helada.ubigeo})
                            </div>
                            <div style="background: #ecfeff; border: 1px solid #cffafe; padding: 6px; border-radius: 6px; font-size: 11px; margin-bottom: 6px;">
                                <strong>Temperatura Mínima:</strong> <span style="font-size: 13px; color: #0e7490; font-weight: bold;">${helada.temperaturaC}°C</span><br/>
                                <strong>Población Vulnerable:</strong> ${(helada.poblacionAfectada || 0).toLocaleString()} hab.<br/>
                                <strong>Zona:</strong> ${helada.cuenca}
                            </div>
                            <div style="font-size: 10px; color: #64748b;">
                                ${helada.detalles}
                            </div>
                        </div>
                    `;
                    if (infoWindowRef.current) {
                        infoWindowRef.current.setContent(content);
                        infoWindowRef.current.open(map, marker);
                    }
                });
                markersRef.current.push(marker);
            });
        }
    };

    // Geocodificación inteligente en 2 niveles (UBIGEO y Búsqueda Libre)
    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;

        const term = searchQuery.trim().toLowerCase();
        const allItems = [...climaList, ...quebradasList, ...heladasList, ...marinosList];

        // Nivel 1: Búsqueda en memoria local (Costo $0 de cuota)
        const match = allItems.find(
            p => p.ubigeo === term || p.nombre.toLowerCase().includes(term) || p.region.toLowerCase().includes(term)
        );

        if (match) {
            setPuntoSeleccionado(match);
            if (googleMapInstance.current) {
                googleMapInstance.current.panTo({ lat: match.lat, lng: match.lng });
                googleMapInstance.current.setZoom(13);
            }
            return;
        }

        // Nivel 2: Google Geocoding API (Búsqueda Libre)
        if ((window as any).google?.maps?.Geocoder && googleMapInstance.current) {
            const geocoder = new (window as any).google.maps.Geocoder();
            geocoder.geocode({ address: `${searchQuery}, Peru` }, (results: any, status: any) => {
                if (status === "OK" && results && results[0]) {
                    const loc = results[0].geometry.location;
                    googleMapInstance.current.panTo(loc);
                    googleMapInstance.current.setZoom(13);
                } else {
                    alert(`No se encontró ubicación para: "${searchQuery}"`);
                }
            });
        }
    };

    const aplicarNuevaApiKey = () => {
        if (tempKeyInput.trim()) {
            setApiKey(tempKeyInput.trim());
            if (typeof window !== "undefined") {
                localStorage.setItem("gmaps_api_key", tempKeyInput.trim());
            }
            setShowKeyModal(false);
        }
    };

    return (
        <div
            className={`transition-all duration-300 ${isFullscreen
                ? "fixed inset-0 z-[99999] w-screen h-screen bg-slate-950 p-3 flex flex-col justify-between"
                : "relative w-full h-full min-h-[520px] bg-slate-950 border border-slate-800 rounded-xl overflow-hidden flex flex-col justify-between"
                }`}
        >
            {/* Barra de Mando y Herramientas Cartográficas */}
            <div className="absolute top-3 left-3 right-3 z-10 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
                {/* Título & Badge de Proveedor */}
                <div className="pointer-events-auto flex items-center gap-2 bg-slate-900/90 backdrop-blur-md border border-slate-700/80 px-3 py-1.5 rounded-lg text-xs shadow-xl">
                    <span className="font-bold text-white flex items-center gap-1.5">
                        🛰️ C2 GEOVISOR COEN
                    </span>
                    <span className="text-slate-500">•</span>
                    {isLiveTelemetry ? (
                        <span className="inline-flex items-center gap-1 text-teal-400 font-bold text-[11px]" title="Telemetría in-situ oficial del IMARPE y Open-Meteo conectada">
                            <Radio className="w-3 h-3 text-teal-400 animate-pulse" />
                            IMARPE Vivo ({marinosList.length} Estaciones) • {quebradasList.length} Quebradas
                        </span>
                    ) : apiKey && mapLoaded ? (
                        <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold text-[11px]">
                            <CheckCircle2 className="w-3 h-3" />
                            Google Maps Platform
                        </span>
                    ) : (
                        <span className="inline-flex items-center gap-1 text-amber-400 font-semibold text-[11px]">
                            <AlertTriangle className="w-3 h-3" />
                            Modo Táctico Autónomo
                        </span>
                    )}
                    {isFullscreen && (
                        <span className="bg-red-950 text-red-300 border border-red-700 px-2 py-0.5 rounded text-[10px] font-bold animate-pulse">
                            MODO PANTALLA COMPLETA SALA DE SITUACIÓN
                        </span>
                    )}
                </div>

                {/* Barra de Búsqueda Inteligente UBIGEO */}
                <form
                    onSubmit={handleSearch}
                    className="pointer-events-auto flex items-center bg-slate-900/95 backdrop-blur border border-slate-700 rounded-lg px-2 py-1 shadow-xl text-xs w-full max-w-xs"
                >
                    <Search className="w-3.5 h-3.5 text-slate-400 mr-1.5 shrink-0" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Buscar UBIGEO, Quebrada o Boya (ej. 150118, Paita)..."
                        className="bg-transparent text-slate-200 placeholder-slate-500 outline-none w-full text-xs"
                    />
                    <button
                        type="submit"
                        className="ml-1 bg-blue-600 hover:bg-blue-500 text-white px-2 py-0.5 rounded text-[10px] font-semibold transition-colors"
                    >
                        Ir
                    </button>
                </form>

                {/* Selector de Modos de Mapa, Llave y Pantalla Completa */}
                <div className="pointer-events-auto flex items-center gap-1.5 bg-slate-900/90 backdrop-blur border border-slate-700/80 p-1 rounded-lg text-xs shadow-xl">
                    <button
                        onClick={() => setMapType("dark")}
                        className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${mapType === "dark" ? "bg-blue-600 text-white" : "text-slate-300 hover:bg-slate-800"
                            }`}
                        title="Modo Oscuro C2 Sala de Crisis"
                    >
                        Táctico C2
                    </button>
                    <button
                        onClick={() => setMapType("hybrid")}
                        className={`px-2 py-1 rounded text-[11px] font-medium transition-colors flex items-center gap-1 ${mapType === "hybrid" ? "bg-blue-600 text-white" : "text-slate-300 hover:bg-slate-800"
                            }`}
                        title="Imágenes Satelitales Reales"
                    >
                        <Satellite className="w-3 h-3" />
                        Satelital
                    </button>
                    <button
                        onClick={() => setMapType("terrain")}
                        className={`px-2 py-1 rounded text-[11px] font-medium transition-colors flex items-center gap-1 ${mapType === "terrain" ? "bg-blue-600 text-white" : "text-slate-300 hover:bg-slate-800"
                            }`}
                        title="Curvas de Nivel y Relieve Topográfico"
                    >
                        <Mountain className="w-3 h-3" />
                        Relieve
                    </button>
                    <button
                        onClick={handleOpenKeyModal}
                        className="px-2 py-1 rounded text-[11px] font-medium text-slate-300 hover:bg-slate-800 transition-colors flex items-center gap-1"
                        title="Configuración de Credencial Google Maps Platform"
                    >
                        <Lock className="w-3 h-3 text-amber-400" />
                        <span>API Key</span>
                    </button>
                    <button
                        onClick={toggleFullscreen}
                        className={`px-2.5 py-1 rounded text-[11px] font-semibold flex items-center gap-1.5 transition shadow-lg ${isFullscreen
                            ? "bg-red-600 hover:bg-red-500 text-white animate-pulse border border-red-400"
                            : "bg-sky-600 hover:bg-sky-500 text-white border border-sky-400/40"
                            }`}
                        title={isFullscreen ? "Presiona ESC o clic para salir de pantalla completa" : "Ver Geovisor en Pantalla Completa"}
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

            {/* Modal de Configuración Privada de API Key */}
            {showKeyModal && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-slate-900 border border-slate-700 max-w-md w-full rounded-2xl p-5 shadow-2xl space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                            <div className="flex items-center gap-2">
                                <Lock className="w-4 h-4 text-amber-400" />
                                <h3 className="text-sm font-bold text-white">Google Maps Platform • Credencial</h3>
                            </div>
                            <button
                                onClick={() => setShowKeyModal(false)}
                                className="text-slate-400 hover:text-white text-xs"
                            >
                                ✕
                            </button>
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed">
                            Ingresa tu clave de API de Google Maps Platform. La clave se guardará únicamente de forma local en tu navegador (LocalStorage) y nunca será expuesta.
                        </p>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <label className="text-[11px] font-semibold text-slate-400 block">
                                    Clave de API de Google Cloud:
                                </label>
                                {DEFAULT_MAPS_KEY && (
                                    <button
                                        type="button"
                                        onClick={() => setTempKeyInput(DEFAULT_MAPS_KEY)}
                                        className="text-[11px] text-sky-400 hover:text-sky-300 underline font-medium cursor-pointer"
                                    >
                                        ⚡ Cargar clave del proyecto
                                    </button>
                                )}
                            </div>
                            <input
                                type="text"
                                value={tempKeyInput}
                                onChange={(e) => setTempKeyInput(e.target.value)}
                                placeholder="Pega tu clave aquí (AIzaSy...)"
                                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 font-mono"
                            />
                        </div>
                        {mapError && (
                            <div className="p-2.5 rounded-lg bg-red-950/60 border border-red-800/80 text-[11px] text-red-300">
                                {mapError}
                            </div>
                        )}
                        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                            <button
                                onClick={() => {
                                    localStorage.removeItem("gmaps_api_key");
                                    setApiKey(DEFAULT_MAPS_KEY);
                                    setShowKeyModal(false);
                                }}
                                className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white"
                            >
                                Restablecer
                            </button>
                            <button
                                onClick={() => {
                                    if (tempKeyInput.trim()) {
                                        localStorage.setItem("gmaps_api_key", tempKeyInput.trim());
                                        setApiKey(tempKeyInput.trim());
                                        setMapError(null);
                                    }
                                    setShowKeyModal(false);
                                }}
                                className="px-4 py-1.5 rounded-lg text-xs font-bold bg-sky-600 hover:bg-sky-500 text-white shadow"
                            >
                                Guardar y Recargar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Barra de Capas Temáticas Especializadas C2 (Sub-barra superior izquierda) */}
            <div className="absolute top-14 left-3 z-10 flex flex-wrap items-center gap-1.5 bg-slate-900/90 backdrop-blur-md border border-slate-700/80 p-1.5 rounded-lg text-xs shadow-xl">
                <span className="text-[10px] uppercase font-bold text-slate-400 px-1">
                    Capas C2:
                </span>
                <button
                    onClick={() => setShowTSM(prev => !prev)}
                    className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors flex items-center gap-1 border ${showTSM
                        ? "bg-orange-950/80 text-orange-300 border-orange-600 shadow-sm font-semibold"
                        : "bg-slate-950/60 text-slate-400 border-slate-800 hover:text-slate-200"
                        }`}
                    title="Temperatura Superficial del Mar y Boyas DHN / IMARPE (Niño 1+2)"
                >
                    <Waves className="w-3 h-3 text-orange-400" />
                    <span>Mar & TSM ENSO</span>
                    {showTSM && <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />}
                </button>
                <button
                    onClick={() => setShowClima(prev => !prev)}
                    className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors flex items-center gap-1 border ${showClima
                        ? "bg-blue-950/80 text-blue-300 border-blue-600 shadow-sm font-semibold"
                        : "bg-slate-950/60 text-slate-400 border-slate-800 hover:text-slate-200"
                        }`}
                    title="Precipitación Acumulada y Clima por Distritos (Open-Meteo Pro)"
                >
                    <CloudRain className="w-3 h-3 text-sky-400" />
                    <span>Clima UBIGEOS</span>
                    {showClima && <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />}
                </button>
                <button
                    onClick={() => setShowQuebradas(prev => !prev)}
                    className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors flex items-center gap-1 border ${showQuebradas
                        ? "bg-red-950/80 text-red-300 border-red-600 shadow-sm font-semibold"
                        : "bg-slate-950/60 text-slate-400 border-slate-800 hover:text-slate-200"
                        }`}
                    title="Catálogo de 46 Quebradas Críticas y Conos de Deyección"
                >
                    <AlertTriangle className="w-3 h-3 text-red-400" />
                    <span>Quebradas (46)</span>
                    {showQuebradas && <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />}
                </button>
                <button
                    onClick={() => setShowHeladas(prev => !prev)}
                    className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors flex items-center gap-1 border ${showHeladas
                        ? "bg-cyan-950/80 text-cyan-300 border-cyan-600 shadow-sm font-semibold"
                        : "bg-slate-950/60 text-slate-400 border-slate-800 hover:text-slate-200"
                        }`}
                    title="Corredor de Heladas y Friajes Altoandinos (AMARU-CHIRI)"
                >
                    <Snowflake className="w-3 h-3 text-cyan-400" />
                    <span>Heladas Chiri</span>
                    {showHeladas && <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />}
                </button>
            </div>

            {/* Contenedor Principal: Google Maps o Fallback Táctico */}
            <div className={`w-full h-full ${isFullscreen ? "h-[calc(100vh-20px)] min-h-[calc(100vh-20px)]" : "min-h-[480px]"} relative`}>
                {/* Contenedor del DOM de Google Maps */}
                <div
                    ref={mapRef}
                    className={`w-full h-full ${isFullscreen ? "h-[calc(100vh-20px)] min-h-[calc(100vh-20px)]" : "min-h-[480px]"} ${apiKey && !mapError ? "block" : "hidden"}`}
                />

                {/* Visor Táctico de Resiliencia (Fallback cuando no hay Google Maps Key activa) */}
                {(!apiKey || mapError) && (
                    <div className={`w-full h-full ${isFullscreen ? "h-[calc(100vh-20px)] min-h-[calc(100vh-20px)]" : "min-h-[480px]"} flex flex-col items-center justify-center p-4 bg-slate-950`}>
                        {/* Banner explicativo elegante */}
                        <div className="mb-3 max-w-lg bg-slate-900 border border-slate-700/80 p-3.5 rounded-xl text-xs flex flex-col gap-2 shadow-xl">
                            <div className="flex items-start gap-2.5">
                                <ShieldAlert className={`w-4 h-4 shrink-0 mt-0.5 ${mapError ? "text-amber-400" : "text-sky-400"}`} />
                                <div className="space-y-1">
                                    <strong className="font-bold text-white block">
                                        {mapError ? "Google Maps Platform • Advertencia de Inicialización" : "Consola Cartográfica C2 Multicapa"}
                                    </strong>
                                    <p className="text-[11px] text-slate-300 leading-relaxed">
                                        {mapError 
                                            ? mapError 
                                            : "Operando con la cartografía vectorial de contingencia C2 (Boyas DHN, TSM Niño 1+2, Clima UBIGEOS y 46 Quebradas)."}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center justify-between pt-1 border-t border-slate-800 text-[11px]">
                                <span className="text-slate-400 font-mono">
                                    Estado API: {apiKey ? "Clave configurada" : "Sin clave pública"}
                                </span>
                                <button
                                    onClick={handleOpenKeyModal}
                                    className="text-sky-400 hover:text-sky-300 font-semibold underline cursor-pointer"
                                >
                                    Configurar Credencial
                                </button>
                            </div>
                        </div>

                        {/* Mapa Esquemático Vectorial de Contingencia con las capas */}
                        <div className="w-full max-w-xl h-80 relative flex items-center justify-center">
                            <svg viewBox="0 0 100 100" className="w-full h-full filter drop-shadow-[0_0_15px_rgba(30,41,59,0.5)]">
                                {/* Zona Marina Niño 1+2 en el Pacífico */}
                                {showTSM && (
                                    <path
                                        d="M 12 10 Q 18 30 26 55 Q 34 75 60 92 L 68 88 Q 42 70 30 45 Q 20 22 18 10 Z"
                                        fill="#ea580c"
                                        fillOpacity="0.2"
                                        stroke="#f97316"
                                        strokeWidth="0.6"
                                        strokeDasharray="1,1"
                                    />
                                )}

                                {/* Silueta Continental */}
                                <path
                                    d="M 22 15 Q 26 24 32 35 Q 38 48 45 62 Q 55 75 75 82 L 86 85 L 88 78 Q 78 70 70 55 Q 65 40 58 28 Q 50 18 36 10 Z"
                                    fill="#0f172a"
                                    stroke="#334155"
                                    strokeWidth="0.8"
                                />

                                {/* Estaciones Costeras IMARPE */}
                                {showTSM && marinosList.map((b) => (
                                    <g key={b.id} className="cursor-pointer" onClick={() => setPuntoSeleccionado(b)}>
                                        <circle cx={b.cx} cy={b.cy} r="2.8" className="fill-teal-500/40 animate-ping" />
                                        <circle cx={b.cx} cy={b.cy} r="1.6" fill={b.tsmAnomalia && b.tsmAnomalia >= 4.5 ? "#dc2626" : "#0d9488"} stroke="#ffffff" strokeWidth="0.4" />
                                    </g>
                                ))}

                                {/* Clima UBIGEOS */}
                                {showClima && climaList.map((c) => (
                                    <g key={c.id} className="cursor-pointer" onClick={() => setPuntoSeleccionado(c)}>
                                        <circle cx={c.cx} cy={c.cy} r="1.8" fill="#0284c7" stroke="#ffffff" strokeWidth="0.4" />
                                    </g>
                                ))}

                                {/* 46 Quebradas */}
                                {showQuebradas && quebradasList.map((q) => (
                                    <g key={q.id} className="cursor-pointer" onClick={() => setPuntoSeleccionado(q)}>
                                        <circle cx={q.cx} cy={q.cy} r="2.2" className="fill-red-500/30 animate-pulse" />
                                        <circle cx={q.cx} cy={q.cy} r="1.3" fill="#ef4444" stroke="#ffffff" strokeWidth="0.3" />
                                    </g>
                                ))}

                                {/* Heladas */}
                                {showHeladas && heladasList.map((h) => (
                                    <g key={h.id} className="cursor-pointer" onClick={() => setPuntoSeleccionado(h)}>
                                        <circle cx={h.cx} cy={h.cy} r="1.8" fill="#06b6d4" stroke="#ffffff" strokeWidth="0.4" />
                                    </g>
                                ))}
                            </svg>
                        </div>
                    </div>
                )}
            </div>

            {/* Ficha Táctica Inferior del Punto Seleccionado */}
            {puntoSeleccionado && (
                <div className="absolute bottom-3 left-3 right-3 z-10 bg-slate-900/95 backdrop-blur-md border border-slate-700/90 rounded-xl p-3 shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold ${puntoSeleccionado.tipo === "BOYA_TSM"
                                    ? "bg-orange-500/20 text-orange-400 border border-orange-500/40"
                                    : puntoSeleccionado.tipo === "CLIMA_UBIGEO"
                                        ? "bg-blue-500/20 text-blue-400 border border-blue-500/40"
                                        : puntoSeleccionado.tipo === "HELADA"
                                            ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/40"
                                            : "bg-red-500/20 text-red-400 border border-red-500/40 animate-pulse"
                                    }`}
                            >
                                {puntoSeleccionado.tipo === "BOYA_TSM" ? "🌊 BOYA OCEANOGRÁFICA DHN" : puntoSeleccionado.tipo} • ALERTA {puntoSeleccionado.nivel}
                            </span>
                            <span className="font-semibold text-white text-sm">
                                {puntoSeleccionado.nombre}
                            </span>
                            <span className="text-slate-400 text-[11px]">
                                (UBIGEO: {puntoSeleccionado.ubigeo})
                            </span>
                        </div>
                        <p className="text-slate-300 text-xs">
                            {puntoSeleccionado.detalles}
                        </p>
                        <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400">
                            {puntoSeleccionado.tsmTemperatura !== undefined && (
                                <span>TSM Superficie: <strong className="text-orange-400">{puntoSeleccionado.tsmTemperatura}°C (Anomalía +{puntoSeleccionado.tsmAnomalia}°C)</strong></span>
                            )}
                            {puntoSeleccionado.lluvia24h !== undefined && (
                                <span>Lluvia 24h: <strong className="text-sky-400">{puntoSeleccionado.lluvia24h} mm</strong></span>
                            )}
                            {puntoSeleccionado.capeJkg !== undefined && (
                                <span>Índice CAPE: <strong className="text-amber-400">{puntoSeleccionado.capeJkg} J/kg</strong></span>
                            )}
                            {puntoSeleccionado.temperaturaC !== undefined && (
                                <span>Temperatura: <strong className="text-cyan-400">{puntoSeleccionado.temperaturaC}°C</strong></span>
                            )}
                            {puntoSeleccionado.poblacionAfectada !== undefined && (
                                <span>Pob. Expuesta: <strong className="text-slate-200">{(puntoSeleccionado.poblacionAfectada).toLocaleString()} hab.</strong></span>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                        <Link
                            href={`/dashboard/${puntoSeleccionado.ubigeo}`}
                            className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-lg"
                        >
                            <span>Consola Distrital</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                        <button
                            onClick={() => setPuntoSeleccionado(null)}
                            className="text-slate-400 hover:text-white px-2 py-1 text-xs"
                        >
                            Cerrar
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}