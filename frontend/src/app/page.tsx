"use client";

import React, { useState, useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { API_BASE } from "@/config/api";
import {
    Activity,
    Cpu,
    ShieldAlert,
    Languages,
    Send,
    Zap,
    Waves,
    Radio,
    FileCode2,
    CheckCircle2,
    Clock,
    AlertTriangle,
    Droplets,
    Thermometer,
    ArrowRight,
    MapPin,
    Eye,
    Maximize2,
    Satellite,
    ExternalLink,
    Scale,
    BookOpen,
    Mountain,
    Search,
    Sliders,
    ChevronRight,
    RefreshCw,
    Globe,
    Building2,
    Users
} from "lucide-react";

const MapViewer = dynamic(() => import("@/components/MapViewer"), {
    ssr: false,
    loading: () => (
        <div className="h-full w-full flex items-center justify-center bg-slate-950 text-slate-500 font-mono text-xs">
            Cargando Geovisor 3D Nacional...
        </div>
    )
});

import TacticalPolarClock from "@/components/TacticalPolarClock";

const DopplerRadarConsole = dynamic(() => import("@/components/DopplerRadarConsole"), {
    ssr: false,
    loading: () => (
        <div className="w-full h-80 flex items-center justify-center bg-slate-950 text-slate-500 font-mono text-xs rounded-2xl border border-slate-800">
            Iniciando Consola de Radar Doppler Banda C...
        </div>
    )
});

export interface CuencaCritica {
    ubigeo: string;
    nombre: string;
    departamento: string;
    provincia: string;
    cuenca: string;
    nivel: "ROJO" | "AMARILLO" | "VERDE";
    lluvia: number;
    cape: number;
    suelo: number;
    caudal: number;
    estado: string;
    // Metadatos Etnoterritoriales RENALIO (D.S. 009-2021-MC / CENEPRED / D.S. 124-PCM)
    tipo: "BILINGÜE" | "MONOLINGÜE";
    lengua_nombre: string;
    familia: string;
    iso_code: string;
    cenepred_riesgo: string;
    ds124_pcm: boolean;
    aviso_castellano: string;
    aviso_originaria?: string;
}

export interface QuebradaTactical {
    id: string;
    nombre: string;
    distrito: string;
    ubigeo: string;
    departamento: string;
    pendiente: string;
    tlagMinutos: number;
    iphBasal: number;
    iphActivo: number;
    caudalEstimado: number;
    mallasGeodinamicas: boolean;
    leccionHistorica: string;
}

export const QUEBRADAS_TACTICAS: QuebradaTactical[] = [
    {
        id: "q-quirio",
        nombre: "Quebrada Quirio",
        distrito: "Lurigancho-Chosica",
        ubigeo: "150118",
        departamento: "Lima",
        pendiente: "14% (Manning n=0.055)",
        tlagMinutos: 24,
        iphBasal: 14.5,
        iphActivo: 93.8,
        caudalEstimado: 48.5,
        mallasGeodinamicas: true,
        leccionHistorica: "Colmatación de barreras dinámicas en 2017. Tiempo de evacuación vecinal: 20 min."
    },
    {
        id: "q-carossio",
        nombre: "Quebrada Carossio",
        distrito: "Lurigancho-Chosica",
        ubigeo: "150118",
        departamento: "Lima",
        pendiente: "18% (Manning n=0.060)",
        tlagMinutos: 38,
        iphBasal: 16.2,
        iphActivo: 91.4,
        caudalEstimado: 36.2,
        mallasGeodinamicas: true,
        leccionHistorica: "Impacto directo a Carretera Central y Losas Altas en 1987, 2015 y 2017."
    },
    {
        id: "q-pedregal",
        nombre: "Quebrada Pedregal",
        distrito: "Lurigancho-Chosica",
        ubigeo: "150118",
        departamento: "Lima",
        pendiente: "16% (Manning n=0.050)",
        tlagMinutos: 42,
        iphBasal: 12.0,
        iphActivo: 88.5,
        caudalEstimado: 29.8,
        mallasGeodinamicas: true,
        leccionHistorica: "Arrastre masivo de bloques rocosos hacia el Río Rímac."
    },
    {
        id: "q-huaycoloro",
        nombre: "Quebrada Huaycoloro",
        distrito: "San Antonio / SJL",
        ubigeo: "150132",
        departamento: "Lima",
        pendiente: "8% (Manning n=0.045)",
        tlagMinutos: 75,
        iphBasal: 11.8,
        iphActivo: 87.2,
        caudalEstimado: 65.0,
        mallasGeodinamicas: false,
        leccionHistorica: "Colapso de puente Huachipa y anegamiento de la autopista Ramiro Prialé en 2017."
    },
    {
        id: "q-san-ildefonso",
        nombre: "Quebrada San Ildefonso",
        distrito: "El Porvenir / Trujillo",
        ubigeo: "130101",
        departamento: "La Libertad",
        pendiente: "6% (Manning n=0.040)",
        tlagMinutos: 52,
        iphBasal: 9.4,
        iphActivo: 94.2,
        caudalEstimado: 82.0,
        mallasGeodinamicas: false,
        leccionHistorica: "7 desbordes continuos en 2017 sepultaron el Cementerio Mampuesto y la Plaza Mayor."
    },
    {
        id: "q-el-leon",
        nombre: "Quebrada El León",
        distrito: "Huanchaco / La Esperanza",
        ubigeo: "130104",
        departamento: "La Libertad",
        pendiente: "5% (Manning n=0.038)",
        tlagMinutos: 65,
        iphBasal: 8.5,
        iphActivo: 86.4,
        caudalEstimado: 54.0,
        mallasGeodinamicas: false,
        leccionHistorica: "Inundación masiva del Balneario de Huanchaco y corte de Carretera Panamericana Norte."
    }
];

export interface DistritoFEN {
    ubigeo: string;
    nombre: string;
    departamento: string;
    provincia: string;
    cuenca: string;
    lluviaActual: number;
    lluviaHistoricaPico: number;
    eventosFEN: string;
    impactoHistorico: string;
    estadoLluvia: "ROJO" | "AMARILLO" | "VERDE";
    cape: number;
    suelo: number;
    caudal: number;
    ds124: boolean;
}

export const DISTRITOS_FEN_CATALOGO: DistritoFEN[] = [
    {
        ubigeo: "200105",
        nombre: "Catacaos",
        departamento: "Piura",
        provincia: "Piura",
        cuenca: "Río Piura / Bajo Piura",
        lluviaActual: 52.4,
        lluviaHistoricaPico: 115.0,
        eventosFEN: "FEN 1983, 1998, 2017, 2023",
        impactoHistorico: "35,000 damnificados en 2017 por rotura de dique Viduque / Pedregal (caudal 2,300 m³/s).",
        estadoLluvia: "ROJO",
        cape: 1890,
        suelo: 94.0,
        caudal: 1420.0,
        ds124: true
    },
    {
        ubigeo: "150118",
        nombre: "Lurigancho-Chosica",
        departamento: "Lima",
        provincia: "Lima",
        cuenca: "Río Rímac / Quebradas Quirio-Carossio",
        lluviaActual: 41.2,
        lluviaHistoricaPico: 68.0,
        eventosFEN: "FEN 1987, 1997, 2015, 2017, 2023",
        impactoHistorico: "Activación masiva de 14 quebradas simultáneas. Bloqueo de Carretera Central.",
        estadoLluvia: "ROJO",
        cape: 1620,
        suelo: 88.0,
        caudal: 118.5,
        ds124: true
    },
    {
        ubigeo: "140304",
        nombre: "Íllimo",
        departamento: "Lambayeque",
        provincia: "Lambayeque",
        cuenca: "Río La Leche",
        lluviaActual: 38.0,
        lluviaHistoricaPico: 98.0,
        eventosFEN: "FEN 1998, 2017, Ciclón Yaku 2023",
        impactoHistorico: "Incomunicación total por caída de puente La Leche; casco urbano inundado bajo 1.5m.",
        estadoLluvia: "ROJO",
        cape: 1450,
        suelo: 85.0,
        caudal: 480.0,
        ds124: true
    },
    {
        ubigeo: "200114",
        nombre: "Tambogrande",
        departamento: "Piura",
        provincia: "Piura",
        cuenca: "Río Piura / Quebrada San Francisco",
        lluviaActual: 46.5,
        lluviaHistoricaPico: 145.0,
        eventosFEN: "FEN 1983, 1998, 2017",
        impactoHistorico: "Aislamiento de decenas de caseríos por crecida de Quebrada San Francisco.",
        estadoLluvia: "ROJO",
        cape: 1720,
        suelo: 91.0,
        caudal: 850.0,
        ds124: true
    },
    {
        ubigeo: "240101",
        nombre: "Tumbes",
        departamento: "Tumbes",
        provincia: "Tumbes",
        cuenca: "Río Tumbes / Puyango",
        lluviaActual: 36.2,
        lluviaHistoricaPico: 160.0,
        eventosFEN: "FEN 1983, 1998, 2023",
        impactoHistorico: "Desborde de Río Tumbes inundando Bellavista, El Tablazo y cultivos de plátano.",
        estadoLluvia: "ROJO",
        cape: 1680,
        suelo: 87.0,
        caudal: 1100.0,
        ds124: true
    },
    {
        ubigeo: "130101",
        nombre: "Trujillo / El Porvenir",
        departamento: "La Libertad",
        provincia: "Trujillo",
        cuenca: "Quebrada San Ildefonso / Moche",
        lluviaActual: 32.5,
        lluviaHistoricaPico: 85.0,
        eventosFEN: "FEN 1998, 2017, 2023",
        impactoHistorico: "Huaicos de lodo atravesaron Av. España e inundaron el centro histórico de Trujillo.",
        estadoLluvia: "ROJO",
        cape: 1380,
        suelo: 82.0,
        caudal: 95.0,
        ds124: true
    },
    {
        ubigeo: "200601",
        nombre: "Sullana",
        departamento: "Piura",
        provincia: "Sullana",
        cuenca: "Río Chira / Represa Poechos",
        lluviaActual: 28.0,
        lluviaHistoricaPico: 120.0,
        eventosFEN: "FEN 1983, 1998, 2017",
        impactoHistorico: "Aliviadero de Poechos a 3,800 m³/s. Inundación de Salitral y Marcavelica.",
        estadoLluvia: "AMARILLO",
        cape: 1120,
        suelo: 72.0,
        caudal: 620.0,
        ds124: true
    },
    {
        ubigeo: "020101",
        nombre: "Huaraz",
        departamento: "Áncash",
        provincia: "Huaraz",
        cuenca: "Río Santa / Callejón de Huaylas",
        lluviaActual: 38.5,
        lluviaHistoricaPico: 72.0,
        eventosFEN: "Aluvión 1941, FEN 1998, 2017",
        impactoHistorico: "Desborde de lagunas glaciares y ríos Quilcay y Santa.",
        estadoLluvia: "ROJO",
        cape: 1350,
        suelo: 86.0,
        caudal: 142.0,
        ds124: true
    },
    {
        ubigeo: "120601",
        nombre: "Satipo",
        departamento: "Junín",
        provincia: "Satipo",
        cuenca: "Río Satipo / Selva Central",
        lluviaActual: 62.0,
        lluviaHistoricaPico: 130.0,
        eventosFEN: "Inundaciones 2015, 2017, 2023",
        impactoHistorico: "Desborde violento de ríos Mazamari y Satipo cortando accesos viales.",
        estadoLluvia: "ROJO",
        cape: 1750,
        suelo: 94.0,
        caudal: 420.0,
        ds124: true
    },
    {
        ubigeo: "010401",
        nombre: "Nieva / Condorcanqui",
        departamento: "Amazonas",
        provincia: "Condorcanqui",
        cuenca: "Río Marañón / Nieva",
        lluviaActual: 75.0,
        lluviaHistoricaPico: 140.0,
        eventosFEN: "Crecientes extraordinarias de Selva Alta",
        impactoHistorico: "Anegamiento masivo de comunidades ribereñas Awajún y Wampis.",
        estadoLluvia: "ROJO",
        cape: 1910,
        suelo: 96.0,
        caudal: 1650.0,
        ds124: true
    },
    {
        ubigeo: "081301",
        nombre: "Urubamba",
        departamento: "Cusco",
        provincia: "Urubamba",
        cuenca: "Río Vilcanota / Valle Sagrado",
        lluviaActual: 44.0,
        lluviaHistoricaPico: 85.0,
        eventosFEN: "Aluvión Machu Picchu 2010, 2023",
        impactoHistorico: "Destrucción de vía férrea y sectores ribereños del Valle Sagrado.",
        estadoLluvia: "ROJO",
        cape: 1280,
        suelo: 89.0,
        caudal: 310.0,
        ds124: true
    },
    {
        ubigeo: "210505",
        nombre: "Santa Rosa / Mazocruz",
        departamento: "Puno",
        provincia: "El Collao",
        cuenca: "Río Ilave / Altiplano Sur",
        lluviaActual: 1.8,
        lluviaHistoricaPico: 25.0,
        eventosFEN: "Heladas extremas concomitantes FEN",
        impactoHistorico: "Temperaturas de -20°C con mortandad de camélidos sudamericanos.",
        estadoLluvia: "VERDE",
        cape: 210,
        suelo: 45.0,
        caudal: 14.2,
        ds124: false
    }
];

export default function NationalDashboard() {
    const [verModalCap, setVerModalCap] = useState<boolean>(false);
    const [cuencaSeleccionada, setCuencaSeleccionada] = useState<string>("150118");
    const [modoLluviaTorrencial, setModoLluviaTorrencial] = useState<boolean>(false);
    const [quebradasAlertaRoja, setQuebradasAlertaRoja] = useState<boolean>(false);
    const [searchDistrito, setSearchDistrito] = useState<string>("");
    const [modoWarRoom, setModoWarRoom] = useState<boolean>(false);
    const [liveMeteoMap, setLiveMeteoMap] = useState<Record<string, any>>({});
    const [liveMeteoActualizado, setLiveMeteoActualizado] = useState<string | null>(null);

    useEffect(() => {
        const fetchMeteo = async () => {
            try {
                const modeParam = modoLluviaTorrencial ? "SIMULACION" : "LIVE";
                const res = await fetch(`${API_BASE}/api/meteo/ds124-matrix?mode=${modeParam}`);
                if (res.ok) {
                    const json = await res.json();
                    if (json.distritos) {
                        const map: Record<string, any> = {};
                        json.distritos.forEach((d: any) => {
                            map[d.ubigeo] = d;
                        });
                        setLiveMeteoMap(map);
                        if (json.metadata?.ultima_actualizacion) {
                            setLiveMeteoActualizado(json.metadata.ultima_actualizacion);
                        }
                    }
                }
            } catch (e) {
                console.error("Error al sincronizar Open-Meteo Pro en dashboard:", e);
            }
        };
        fetchMeteo();
    }, [modoLluviaTorrencial]);

    // Catálogo representativo de cuencas críticas con clasificación etnoterritorial RENALIO
    const CUENCAS_CRITICAS: CuencaCritica[] = [
        {
            ubigeo: "150118",
            nombre: "Lurigancho-Chosica",
            departamento: "Lima",
            provincia: "Lima",
            cuenca: "Río Rímac / Quebradas Carossio-Pedregal",
            nivel: "ROJO",
            lluvia: 41.2,
            cape: 1620,
            suelo: 88.0,
            caudal: 118.5,
            estado: "Huaicos inminentes en quebradas",
            tipo: "BILINGÜE",
            lengua_nombre: "Runasimi Chanka (Quechua)",
            familia: "Quechua II-C",
            iso_code: "qu-PE",
            cenepred_riesgo: "MUY ALTO",
            ds124_pcm: true,
            aviso_castellano: "🚨 ALERTA MÁXIMA EN CHOSICA: CAPE Crítico (1620 J/kg) y saturación de suelo al 88%. Riesgo inminente de activación de quebradas Carossio y Pedregal. Evacuar a losas deportivas altas.",
            aviso_originaria: "🇵🇪 HATUN LLAKI WILLAKUY CHOSICA LLAQTAPI: Sinchi parawanmi urqukuna hunt'achkan. Lloqlla chayamunqa wayq'ukunapi. Usqhaylla hanay pata kanchakunaman lluqsiychik kawsaykichikta amachanapaq."
        },
        {
            ubigeo: "020101",
            nombre: "Huaraz",
            departamento: "Áncash",
            provincia: "Huaraz",
            cuenca: "Río Santa / Callejón de Huaylas",
            nivel: "ROJO",
            lluvia: 38.5,
            cape: 1350,
            suelo: 86.0,
            caudal: 142.0,
            estado: "Aluvión & desborde Río Santa",
            tipo: "BILINGÜE",
            lengua_nombre: "Quechua Áncash (Ancashino)",
            familia: "Quechua I (Huáyhuash)",
            iso_code: "qwh-PE",
            cenepred_riesgo: "MUY ALTO",
            ds124_pcm: true,
            aviso_castellano: "🚨 ALERTA ROJA EN HUARAZ: Deshielo y precipitaciones torrenciales en el Callejón de Huaylas. Saturación de suelo al 86%. Evacuar riberas del Río Santa hacia zonas altas seguras.",
            aviso_originaria: "🇵🇪 HATUN WILLAKUY WARAS LLAQTAMAN: Yaku qochakunam llumpaypaq huntayan. Santa mayu llimpimunqam. Llapan runakuna hanan patakunaman witsaykuyay kawaynikita tsapanaykipaq."
        },
        {
            ubigeo: "081301",
            nombre: "Urubamba",
            departamento: "Cusco",
            provincia: "Urubamba",
            cuenca: "Río Vilcanota / Valle Sagrado",
            nivel: "ROJO",
            lluvia: 44.0,
            cape: 1280,
            suelo: 89.0,
            caudal: 310.0,
            estado: "Crecida extraordinaria Vilcanota",
            tipo: "BILINGÜE",
            lengua_nombre: "Quechua Collao (Qusqu-Qullaw)",
            familia: "Quechua II-C",
            iso_code: "quz-PE",
            cenepred_riesgo: "MUY ALTO",
            ds124_pcm: true,
            aviso_castellano: "🚨 ALERTA ROJA EN URUBAMBA: Caudal del Río Vilcanota supera umbral de peligro (310 m³/s). Saturación de suelo al 89%. Evacuar de inmediato sectores bajos del Valle Sagrado.",
            aviso_originaria: "🇵🇪 HATUN LLAKI WILLAKUY URUBAMBA LLAQTAPI: Willkamayu sinchita llimp'iykamunqa. Wayq'ukuna parawan hunt'asqa kashan. Usqhaylla hanay cheqaskunaman ch'iklluychik kawsay amachanapaq."
        },
        {
            ubigeo: "210505",
            nombre: "Santa Rosa / Mazocruz",
            departamento: "Puno",
            provincia: "El Collao",
            cuenca: "Río Ilave / Altiplano Sur",
            nivel: "AMARILLO",
            lluvia: 1.8,
            cape: 210,
            suelo: 45.0,
            caudal: 14.2,
            estado: "Helada meteorológica severa -8.4°C",
            tipo: "BILINGÜE",
            lengua_nombre: "Aymara Altiplánico",
            familia: "Aru",
            iso_code: "ay-PE",
            cenepred_riesgo: "ALTO (HELADA SEVERA)",
            ds124_pcm: false,
            aviso_castellano: "❄️ AVISO DE EMERGENCIA EN MAZOCRUZ: Helada extrema con temperatura de -8.4°C en la madrugada. Resguardar niños, ancianos y ganado en cobertizos térmicos.",
            aviso_originaria: "🇵🇪 YATIYAWI MAZOCRUZ MARANAKATAKI: Jach'a thiyaw purintani akapachanxa ch'iji patanxa. Wawanakaru jilatanakaru sum q'uñt'ayapxam, ukat uywanakarux q'uñi utanakaru imantapxam."
        },
        {
            ubigeo: "120601",
            nombre: "Satipo",
            departamento: "Junín",
            provincia: "Satipo",
            cuenca: "Río Satipo / Selva Central",
            nivel: "ROJO",
            lluvia: 62.0,
            cape: 1750,
            suelo: 94.0,
            caudal: 420.0,
            estado: "Desbordes e inundación Selva Central",
            tipo: "BILINGÜE",
            lengua_nombre: "Asháninka",
            familia: "Arawak",
            iso_code: "cni-PE",
            cenepred_riesgo: "MUY ALTO",
            ds124_pcm: true,
            aviso_castellano: "🚨 ALERTA ROJA EN SATIPO: Lluvias torrenciales en Selva Central (62 mm). Río Satipo sobrepasa cota crítica de inundación. Evacuar riberas y comunidades hacia colinas.",
            aviso_originaria: "🇵🇪 KAMEETSA ASHÁNINKAPE SATIPO: Antaani inkani pookani ovashi inkaare. Katingaro nija pookantsi. Pijate aikiro pishite kitaiteroni anta janta katingareki kempisantsi pashitantyari."
        },
        {
            ubigeo: "010401",
            nombre: "Nieva / Condorcanqui",
            departamento: "Amazonas",
            provincia: "Condorcanqui",
            cuenca: "Río Marañón / Río Cenepa-Nieva",
            nivel: "ROJO",
            lluvia: 75.0,
            cape: 1910,
            suelo: 96.0,
            caudal: 1650.0,
            estado: "Crecida extraordinaria Marañón",
            tipo: "BILINGÜE",
            lengua_nombre: "Awajún",
            familia: "Jíbaro",
            iso_code: "agr-PE",
            cenepred_riesgo: "MUY ALTO",
            ds124_pcm: true,
            aviso_castellano: "🚨 ALERTA ROJA EN CONDORCANQUI: Crecida violenta de ríos Nieva, Cenepa y Marañón. Riesgo inminente de inundación. Evacuar a colinas altas de inmediato.",
            aviso_originaria: "🇵🇪 CHICHAM NAEK NIEVA-CENEPA: Yumi senchi yutuka namak wajau asamtai yumi puyatkak amaintai. Ashí aents aato pujau wainka jinkitin atinme mujanum iwaak pujustag takuka."
        },
        {
            ubigeo: "200101",
            nombre: "Piura / Catacaos",
            departamento: "Piura",
            provincia: "Piura",
            cuenca: "Río Piura / Bajo Piura",
            nivel: "ROJO",
            lluvia: 48.0,
            cape: 1850,
            suelo: 92.0,
            caudal: 890.0,
            estado: "Desborde fluvial Bajo Piura",
            tipo: "MONOLINGÜE",
            lengua_nombre: "Castellano Comunitario",
            familia: "Indoeuropea (Romance)",
            iso_code: "es-PE",
            cenepred_riesgo: "MUY ALTO",
            ds124_pcm: true,
            aviso_castellano: "🚨 ALERTA MÁXIMA EN PIURA Y CATACAOS: Boya Paita registra +2.6°C de anomalía marina. Caudal del Río Piura en 890 m³/s con riesgo inminente de desborde en Bajo Piura. Familias ribereñas evacuar inmediatamente a albergues autorizados en zonas altas.",
            aviso_originaria: undefined
        },
        {
            ubigeo: "140304",
            nombre: "Íllimo",
            departamento: "Lambayeque",
            provincia: "Lambayeque",
            cuenca: "Río La Leche",
            nivel: "AMARILLO",
            lluvia: 22.0,
            cape: 980,
            suelo: 68.0,
            caudal: 320.0,
            estado: "Vigilancia de diques y defensas",
            tipo: "MONOLINGÜE",
            lengua_nombre: "Castellano Comunitario",
            familia: "Indoeuropea (Romance)",
            iso_code: "es-PE",
            cenepred_riesgo: "MUY ALTO",
            ds124_pcm: true,
            aviso_castellano: "⚠️ ALERTA EN ÍLLIMO: Río La Leche en vigilancia crítica por saturación de cuenca media (68%). Monitoreo 24/7 en diques y defensas ribereñas. Mantenerse atentos a reportes del COEL.",
            aviso_originaria: undefined
        },
        {
            ubigeo: "200105",
            nombre: "Catacaos",
            departamento: "Piura",
            provincia: "Piura",
            cuenca: "Río Piura / Viduque-Pedregal",
            nivel: "ROJO",
            lluvia: 52.4,
            cape: 1890,
            suelo: 94.0,
            caudal: 1420.0,
            estado: "Desborde inminente Bajo Piura",
            tipo: "MONOLINGÜE",
            lengua_nombre: "Castellano Comunitario",
            familia: "Indoeuropea (Romance)",
            iso_code: "es-PE",
            cenepred_riesgo: "MUY ALTO",
            ds124_pcm: true,
            aviso_castellano: "🚨 ALERTA MÁXIMA EN CATACAOS: Caudal del Río Piura en 1,420 m³/s con riesgo de rotura de dique Pedregal y Viduque. Evacuación inmediata a zonas altas.",
            aviso_originaria: undefined
        },
        {
            ubigeo: "200114",
            nombre: "Tambogrande",
            departamento: "Piura",
            provincia: "Piura",
            cuenca: "Río Piura / Quebrada San Francisco",
            nivel: "ROJO",
            lluvia: 46.5,
            cape: 1720,
            suelo: 91.0,
            caudal: 850.0,
            estado: "Aislamiento por Quebrada San Francisco",
            tipo: "MONOLINGÜE",
            lengua_nombre: "Castellano Comunitario",
            familia: "Indoeuropea (Romance)",
            iso_code: "es-PE",
            cenepred_riesgo: "MUY ALTO",
            ds124_pcm: true,
            aviso_castellano: "🚨 ALERTA EN TAMBOGRANDE: Crecida violenta de Quebrada San Francisco. Riesgo de corte de vías hacia Piura y caseríos rurales.",
            aviso_originaria: undefined
        },
        {
            ubigeo: "240101",
            nombre: "Tumbes",
            departamento: "Tumbes",
            provincia: "Tumbes",
            cuenca: "Río Tumbes / Puyango",
            nivel: "ROJO",
            lluvia: 36.2,
            cape: 1680,
            suelo: 87.0,
            caudal: 1100.0,
            estado: "Desborde fluvial Río Tumbes",
            tipo: "MONOLINGÜE",
            lengua_nombre: "Castellano Comunitario",
            familia: "Indoeuropea (Romance)",
            iso_code: "es-PE",
            cenepred_riesgo: "MUY ALTO",
            ds124_pcm: true,
            aviso_castellano: "🚨 ALERTA ROJA EN TUMBES: Río Tumbes supera umbral de inundación en Bellavista y El Tablazo. Resguardar ganado y evacuar viviendas ribereñas.",
            aviso_originaria: undefined
        },
        {
            ubigeo: "130101",
            nombre: "Trujillo / El Porvenir",
            departamento: "La Libertad",
            provincia: "Trujillo",
            cuenca: "Quebrada San Ildefonso / Moche",
            nivel: "ROJO",
            lluvia: 32.5,
            cape: 1380,
            suelo: 82.0,
            caudal: 95.0,
            estado: "Activación Quebrada San Ildefonso",
            tipo: "MONOLINGÜE",
            lengua_nombre: "Castellano Comunitario",
            familia: "Indoeuropea (Romance)",
            iso_code: "es-PE",
            cenepred_riesgo: "MUY ALTO",
            ds124_pcm: true,
            aviso_castellano: "🚨 ALERTA EN TRUJILLO: Lluvias torrenciales activan Quebrada San Ildefonso en El Porvenir. Desvío de caudal hacia dique y quebrada El León.",
            aviso_originaria: undefined
        }
    ];

    const cActual = CUENCAS_CRITICAS.find(c => c.ubigeo === cuencaSeleccionada) || CUENCAS_CRITICAS[0];
    const isBilingue = cActual.tipo === "BILINGÜE";

    // Ordenamiento dinámico para Bloque 1:
    // Si modoLluviaTorrencial está activo: distritos con lluvia >= 30mm o ROJO van en cabecera ordenados desc.
    // Si modoLluviaTorrencial es falso (en vivo): distritos con telemetría en tiempo real de Open-Meteo Pro.
    const distritosOrdenadosBloque1 = useMemo(() => {
        return [...DISTRITOS_FEN_CATALOGO].map(d => {
            const live = liveMeteoMap[d.ubigeo];
            if (live) {
                return {
                    ...d,
                    lluviaActual: live.lluvia_24h,
                    estadoLluvia: live.nivel_alerta,
                    cape: live.cape_j_kg,
                    suelo: live.suelo_saturacion_pct,
                    caudal: live.caudal_glofas_m3s
                };
            }
            if (!modoLluviaTorrencial) {
                return {
                    ...d,
                    lluviaActual: 0.0,
                    estadoLluvia: "VERDE",
                    cape: 0,
                    suelo: 30.0,
                    caudal: 18.0
                };
            }
            return d;
        }).sort((a, b) => {
            if (modoLluviaTorrencial) {
                const aEsRojo = a.estadoLluvia === "ROJO" || a.lluviaActual >= 30;
                const bEsRojo = b.estadoLluvia === "ROJO" || b.lluviaActual >= 30;
                if (aEsRojo && !bEsRojo) return -1;
                if (!aEsRojo && bEsRojo) return 1;
                return b.lluviaActual - a.lluviaActual;
            } else {
                return b.lluviaActual - a.lluviaActual || b.lluviaHistoricaPico - a.lluviaHistoricaPico;
            }
        });
    }, [modoLluviaTorrencial, liveMeteoMap]);

    // Filtro para Buscador de Distritos en Bloque 2
    const distritosFiltradosBusqueda = DISTRITOS_FEN_CATALOGO.filter(d => 
        d.nombre.toLowerCase().includes(searchDistrito.toLowerCase()) ||
        d.departamento.toLowerCase().includes(searchDistrito.toLowerCase()) ||
        d.provincia.toLowerCase().includes(searchDistrito.toLowerCase()) ||
        d.ubigeo.includes(searchDistrito)
    );

    // Generación dinámica de payload ITU-T X.1303 / OASIS CAP v1.2 para SISMATE
    // Si es bilingüe: 2 bloques <info> (es-PE y lengua originaria)
    // Si es monolingüe castellano: 1 bloque <info> (es-PE)
    const capInfoList: any[] = [
        {
            language: "es-PE",
            category: "Met",
            event: `Alerta ${cActual.nivel} por Fenómeno Hidrometeorológico`,
            urgency: "Immediate",
            severity: cActual.nivel === "ROJO" ? "Extreme" : "Severe",
            headline: `ALERTA OFICIAL COEN EN ${cActual.nombre.toUpperCase()}: ${cActual.estado}`,
            instruction: cActual.aviso_castellano
        }
    ];

    if (isBilingue && cActual.aviso_originaria) {
        capInfoList.push({
            language: cActual.iso_code,
            category: "Met",
            event: `Alerta Comunitaria en Lengua Originaria (${cActual.lengua_nombre})`,
            urgency: "Immediate",
            severity: cActual.nivel === "ROJO" ? "Extreme" : "Severe",
            headline: `WILLAKUY / YATIYAWI (${cActual.lengua_nombre.toUpperCase()}): ${cActual.nombre.toUpperCase()}`,
            instruction: cActual.aviso_originaria
        });
    }

    const capPayloadMock = {
        identifier: `PE-COEN-2026-OMPRO-${cActual.ubigeo}-${cActual.iso_code}`,
        sender: "sat-coen@indeci.gob.pe",
        sent: new Date().toISOString(),
        status: "Actual",
        msgType: "Alert",
        scope: "Public",
        code: [
            "OPEN_METEO_PRO_ECMWF_IFS",
            "SENAMHI_WFS_VALIDATED",
            cActual.ds124_pcm ? "DS_124_2026_PCM_EMERGENCIA" : "MONITOREO_AMARU_CHIRI",
            isBilingue ? `RENALIO_BILINGUE_${cActual.iso_code.toUpperCase().replace('-', '_')}` : "RENALIO_MONOLINGUE_CASTELLANO",
            "CAP_V12_SISMATE"
        ],
        info: capInfoList
    };

    return (
        <section className="space-y-5">
            {/* ========================================================================= */}
            {/* [ZONA 1] CINTILLO INSTITUCIONAL NACIONAL & BARRA DE ESTADO 24/7           */}
            {/* ========================================================================= */}
            <div className="bg-gradient-to-r from-red-950 via-slate-900 to-blue-950 border border-red-800/60 rounded-2xl p-3.5 flex flex-wrap justify-between items-center text-xs gap-3 shadow-2xl">
                <div className="flex items-center gap-2.5">
                    <span className="flex h-3 w-3 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                    </span>
                    <span className="font-mono bg-red-900/80 text-white font-black px-2 py-0.5 rounded text-[10px] tracking-wider border border-red-700">
                        EN VIVO • 24/7
                    </span>
                    <span className="font-bold text-white text-sm tracking-wide">
                        COED NACIONAL AMARU: TABLERO DE MANDO DIGITAL
                    </span>
                </div>

                {/* Nodos circulares de estado institucional */}
                <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-1.5 bg-slate-950/80 border border-red-800 px-2.5 py-1 rounded-lg">
                        <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse"></span>
                        <span className="text-red-300 font-bold text-[11px]">
                            ENFEN: ALERTA EL NIÑO COSTERO (Factor x1.35)
                        </span>
                    </div>

                    <div className="flex items-center gap-1.5 bg-slate-950/80 border border-sky-800 px-2.5 py-1 rounded-lg">
                        <Waves className="w-3.5 h-3.5 text-sky-400" />
                        <span className="text-sky-300 font-mono text-[11px]">
                            Boya Paita: <b>+2.6°C [Onda Kelvin]</b>
                        </span>
                    </div>

                    <div className="flex items-center gap-1.5 bg-slate-950/80 border border-emerald-800 px-2.5 py-1 rounded-lg">
                        <Radio className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-300 font-mono text-[11px]">
                            SENAMHI: <b>WFS EMA Validado</b>
                        </span>
                    </div>

                    <button
                        type="button"
                        onClick={() => setModoWarRoom(!modoWarRoom)}
                        className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-[11px] font-bold transition border cursor-pointer ${
                            modoWarRoom
                                ? "bg-amber-500 text-slate-950 border-amber-400 shadow-lg shadow-amber-500/30"
                                : "bg-slate-950/80 border-slate-700 text-slate-300 hover:text-white hover:border-slate-500"
                        }`}
                        title="Modo War Room: maximiza el Geovisor 3D y Reloj Táctico para pantallas de crisis"
                    >
                        <Maximize2 className="w-3.5 h-3.5" />
                        <span>{modoWarRoom ? "Salir de War Room" : "🖥️ Modo War Room"}</span>
                    </button>
                </div>
            </div>

            {/* ========================================================================= */}
            {/* [SUITE TRIPARTITA & SUBSERVICIOS] AMARU-CLIMATE SOBERANO                */}
            {/* ========================================================================= */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-mono font-black px-2 py-0.5 rounded bg-gradient-to-r from-amber-500 to-sky-500 text-slate-950">
                                SISTEMA TRIPARTITO
                            </span>
                            <h2 className="text-base font-black text-white tracking-wide">
                                AMARU-CLIMATE • Suite Tripartita Soberana
                            </h2>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">
                            Plataforma integral de comando, inteligencia territorial y respuesta comunitaria ante el FEN 2026-2027
                        </p>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800 self-start md:self-auto">
                        Ley N.º 29664 • SINAGERD • D.S. 124-2026-PCM
                    </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {/* Subservicio 1: COED Nacional AMARU */}
                    <div className="bg-slate-950/60 border border-sky-800/60 hover:border-sky-500/80 rounded-xl p-3 flex flex-col justify-between transition group">
                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                                <span className="flex items-center gap-1.5 text-xs font-bold text-sky-300">
                                    <Globe className="w-3.5 h-3.5 text-sky-400" />
                                    COED Nacional AMARU
                                </span>
                                <span className="text-[9px] font-bold bg-sky-950 text-sky-300 px-1.5 py-0.5 rounded border border-sky-800">
                                    NIVEL C2 MACRO
                                </span>
                            </div>
                            <p className="text-[11px] text-slate-400 leading-snug">
                                Comando estratégico, 159 cuencas ANA, radares Banda C, ENFEN Niño 1+2 y despacho celular CAP v1.2 / SISMATE.
                            </p>
                        </div>
                        <div className="pt-2.5 mt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                            <span className="text-slate-500">Salas de Crisis & INDECI</span>
                            <span className="text-sky-400 font-bold group-hover:translate-x-1 transition flex items-center gap-0.5">
                                Activo en pantalla <ChevronRight className="w-3 h-3" />
                            </span>
                        </div>
                    </div>

                    {/* Subservicio 2: COED Municipal AMARU */}
                    <Link
                        href="/municipal/150118"
                        className="bg-slate-950/60 border border-amber-800/60 hover:border-amber-500/80 rounded-xl p-3 flex flex-col justify-between transition group cursor-pointer"
                    >
                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                                <span className="flex items-center gap-1.5 text-xs font-bold text-amber-300">
                                    <Building2 className="w-3.5 h-3.5 text-amber-400" />
                                    COED Municipal AMARU
                                </span>
                                <span className="text-[9px] font-bold bg-amber-950 text-amber-300 px-1.5 py-0.5 rounded border border-amber-800">
                                    1,891 ALCALDÍAS
                                </span>
                            </div>
                            <p className="text-[11px] text-slate-400 leading-snug">
                                Obras PP 0068, certificación de maquinaria (Ley 30225), Ficha EDAN preliminar, Planes PCMD y PPRRD CENEPRED.
                            </p>
                        </div>
                        <div className="pt-2.5 mt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                            <span className="text-slate-500">Suite Municipal 360°</span>
                            <span className="text-amber-400 font-bold group-hover:translate-x-1 transition flex items-center gap-0.5">
                                Abrir Consola <ChevronRight className="w-3 h-3" />
                            </span>
                        </div>
                    </Link>

                    {/* Subservicio 3: COED Social AMARU */}
                    <Link
                        href="/reporte-ciudadano"
                        className="bg-slate-950/60 border border-rose-800/60 hover:border-rose-500/80 rounded-xl p-3 flex flex-col justify-between transition group cursor-pointer"
                    >
                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                                <span className="flex items-center gap-1.5 text-xs font-bold text-rose-300">
                                    <Users className="w-3.5 h-3.5 text-rose-400" />
                                    COED Social AMARU
                                </span>
                                <span className="text-[9px] font-bold bg-rose-950 text-rose-300 px-1.5 py-0.5 rounded border border-rose-800">
                                    COMUNIDAD & AYNI
                                </span>
                            </div>
                            <p className="text-[11px] text-slate-400 leading-snug">
                                Pre-Padrón EDAN bilingüe (Quechua/Aymara/Castellano), grabación oral con SHA-256, Bono BAE y alertas Telegram.
                            </p>
                        </div>
                        <div className="pt-2.5 mt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                            <span className="text-slate-500">Ground-Truth Comunitario</span>
                            <span className="text-rose-400 font-bold group-hover:translate-x-1 transition flex items-center gap-0.5">
                                Participar <ChevronRight className="w-3 h-3" />
                            </span>
                        </div>
                    </Link>
                </div>
            </div>

            {/* [ESTACIÓN ESTRATÉGICA] RADAR METEOROLÓGICO DOPPLER BANDA C (NOWCASTING COED) */}
            <DopplerRadarConsole defaultLocalidad="PIU" />

            {/* Banner Táctico: Matriz de Triple Vulnerabilidad e IPI */}
            <div className="bg-purple-950/40 border border-purple-800/70 rounded-2xl p-3.5 flex flex-wrap items-center justify-between gap-3 shadow-lg">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-purple-900/50 border border-purple-700/60 text-purple-300">
                        <Scale className="w-5 h-5" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-white font-bold text-xs">Matriz de Triple Vulnerabilidad Territorial & Algoritmo IPI</span>
                            <span className="text-[10px] font-mono bg-purple-900/80 text-purple-200 px-2 py-0.5 rounded border border-purple-600 font-semibold">
                                CENEPRED 1,891 • D.S. 124-2026-PCM • RENALIO D.S. 009-2021-MC
                            </span>
                        </div>
                        <p className="text-[11px] text-slate-300 mt-0.5">
                            Índice de Prioridad de Intervención calibrado para priorización soberana algorítmica y despacho bilingüe ITU-T X.1303.
                        </p>
                    </div>
                </div>
                <Link
                    href="/doctrina"
                    className="flex items-center gap-1.5 px-3.5 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-bold transition shadow-md shadow-purple-600/30 shrink-0"
                >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Ver Consola Doctrinal & Fórmulas</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                </Link>
            </div>

            {/* ========================================================================= */}
            {/* [ZONA 2, 3, 4] GRID CENTRAL C2: BLOQUE 1 (LLUVIAS/HISTÓRICO) + BLOQUE 2 (GEOVISOR & BUSCADOR) + BLOQUE 3 (QUEBRADAS IPH-FEN) */}
            {/* ========================================================================= */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                
                {/* [BLOQUE 1] COLUMNA IZQUIERDA: OPEN-METEO PRO & DISTRITOS PRIORIZADOS */}
                <div className={`${modoWarRoom ? "hidden" : "lg:col-span-3"} bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3.5 shadow-xl flex flex-col justify-between order-1`}>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                            <div className="flex items-center gap-1.5">
                                <Zap className="w-4 h-4 text-amber-400" />
                                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                                    Open-Meteo Pro
                                </h2>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <span className="text-[10px] font-mono text-blue-400 bg-blue-950 px-1.5 py-0.5 rounded">
                                    ECMWF IFS 9km
                                </span>
                                <Link
                                    href="/meteo"
                                    className="text-[10px] font-bold text-amber-300 bg-amber-950/80 hover:bg-amber-900 px-2 py-0.5 rounded border border-amber-500/50 flex items-center gap-1 transition shadow-sm"
                                    title="Abrir Consola de 893 Distritos en Emergencia FEN"
                                >
                                    <span>893 D.S. 124</span>
                                    <ExternalLink className="w-3 h-3 text-amber-400" />
                                </Link>
                            </div>
                        </div>

                        {/* Selector Operativo: Simulación Lluvias Críticas vs Tiempo Real / Histórico */}
                        {/* Selector Operativo: Simulación Lluvias Críticas vs Tiempo Real / Histórico */}
                        <div className="bg-slate-950 border border-slate-800 rounded-xl p-2.5 space-y-2">
                            <div className="flex justify-between items-center text-[10px]">
                                <span className="font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1">
                                    <Sliders className="w-3 h-3 text-sky-400" /> Modo Hidrometeo:
                                </span>
                                <button
                                    onClick={() => setModoLluviaTorrencial(!modoLluviaTorrencial)}
                                    className={`px-2 py-0.5 rounded-full text-[9px] font-bold font-mono transition flex items-center gap-1 ${
                                        modoLluviaTorrencial
                                            ? "bg-red-950 text-red-400 border border-red-800 animate-pulse"
                                            : "bg-emerald-950 text-emerald-400 border border-emerald-800"
                                    }`}
                                >
                                    {modoLluviaTorrencial ? "🔴 ESCENARIO SIMULACIÓN FEN (>30mm)" : "🟢 EN VIVO OPEN-METEO PRO"}
                                </button>
                            </div>
                            <div className="flex justify-between items-center text-[10px] text-slate-400 leading-snug">
                                <p>
                                    {modoLluviaTorrencial
                                        ? "🚨 Priorización: Distritos con lluvias torrenciales simuladas (>30 mm/24h) en cabecera en rojo."
                                        : "⚡ Telemetría Open-Meteo Pro (ECMWF IFS 9km) en tiempo real: Condiciones atmosféricas observadas hoy."}
                                </p>
                                {liveMeteoActualizado && (
                                    <span className={`font-mono shrink-0 text-[8px] border px-1.5 py-0.5 rounded ml-1 ${
                                        modoLluviaTorrencial
                                            ? "text-amber-400 bg-amber-950/70 border-amber-800/60"
                                            : "text-emerald-400 bg-emerald-950/70 border-emerald-800/60"
                                    }`}>
                                        {modoLluviaTorrencial ? "⚠️ Escenario Simulado FEN" : "⚡ Open-Meteo Pro Live"}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Relación de Distritos */}
                        <div className="space-y-1.5">
                            <div className="flex justify-between items-center text-[10px] font-semibold text-slate-400 px-1">
                                <span>{modoLluviaTorrencial ? "🚨 DISTRITOS CON LLUVIA CRÍTICA SIMULADA" : "🟢 DISTRITOS EN OBSERVACIÓN EN TIEMPO REAL"}</span>
                                <span className="font-mono text-amber-400">{distritosOrdenadosBloque1.length} Nodos</span>
                            </div>

                            <div className="space-y-1.5 max-h-[300px] overflow-y-auto pr-1">
                                {distritosOrdenadosBloque1.map((d) => {
                                    const esRojo = (d.estadoLluvia === "ROJO" || d.lluviaActual >= 30) && modoLluviaTorrencial;
                                    const isSelected = cuencaSeleccionada === d.ubigeo;
                                    return (
                                        <div
                                            key={d.ubigeo}
                                            onClick={() => {
                                                setCuencaSeleccionada(d.ubigeo);
                                                setSearchDistrito(d.nombre);
                                            }}
                                            className={`p-2.5 rounded-xl border text-xs cursor-pointer transition flex flex-col gap-1.5 ${
                                                isSelected
                                                    ? "bg-slate-800/90 border-sky-500 shadow-md ring-1 ring-sky-500/40"
                                                    : esRojo
                                                    ? "bg-red-950/30 hover:bg-red-950/50 border-red-900/80 text-slate-200"
                                                    : "bg-slate-950/70 hover:bg-slate-850 border-slate-800 text-slate-300"
                                            }`}
                                        >
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <div className="font-bold text-white flex items-center gap-1.5">
                                                        <span>{d.nombre}</span>
                                                        <span className="text-[9px] font-mono text-slate-500">[{d.ubigeo}]</span>
                                                    </div>
                                                    <div className="text-[10px] text-slate-400 truncate max-w-[150px]">
                                                        {d.departamento} • {d.cuenca}
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    {modoLluviaTorrencial ? (
                                                        <span className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded ${
                                                            esRojo
                                                                ? "bg-red-950 text-red-300 border border-red-800 animate-pulse"
                                                                : "bg-amber-950 text-amber-400 border border-amber-800"
                                                        }`}>
                                                            {d.lluviaActual} mm
                                                        </span>
                                                    ) : (
                                                        <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${
                                                            d.lluviaActual >= 30
                                                                ? "bg-red-950 text-red-300 border-red-800"
                                                                : d.lluviaActual >= 5
                                                                ? "bg-amber-950 text-amber-400 border-amber-800"
                                                                : "bg-emerald-950 text-emerald-300 border-emerald-800"
                                                        }`} title="Precipitación acumulada 24h reportada en vivo por Open-Meteo Pro">
                                                            Hoy: {d.lluviaActual} mm
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex justify-between items-center text-[10px] pt-1 border-t border-slate-800/60">
                                                <span className="text-slate-400 text-[9px] truncate max-w-[160px]" title={d.impactoHistorico}>
                                                    {modoLluviaTorrencial 
                                                        ? (esRojo ? "⚠️ Riesgo activación de quebradas" : "Vigilancia preventiva")
                                                        : (d.lluviaActual >= 30 ? "⚠️ Lluvia crítica en cabecera" : d.lluviaActual >= 5 ? "Vigilancia de cuenca" : "Cielo despejado / Estable")}
                                                </span>
                                                <Link
                                                    href={`/dashboard/${d.ubigeo}`}
                                                    onClick={(e) => e.stopPropagation()}
                                                    className="text-[9px] font-bold text-sky-400 hover:text-sky-300 flex items-center gap-0.5"
                                                >
                                                    <span>C2</span>
                                                    <ChevronRight className="w-3 h-3" />
                                                </Link>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Resumen Telemetría Distrito Focalizado */}
                    <div className="bg-slate-950 border border-slate-800 p-2.5 rounded-xl space-y-1.5 text-xs mt-2">
                        <div className="flex justify-between items-center text-[10px] font-semibold text-slate-400 uppercase">
                            <span>Foco: <b className="text-white">{cActual.nombre}</b></span>
                            <span className="text-amber-400 font-mono">CAPE: {cActual.cape} J/kg</span>
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5">
                            <span>Suelo Crítico: <b className="text-red-400">{cActual.suelo}%</b></span>
                            <span>GloFAS: <b className="text-sky-400">{cActual.caudal} m³/s</b></span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-emerald-500 via-amber-500 to-red-500 rounded-full"
                                style={{ width: `${Math.min(cActual.suelo, 100)}%` }}
                            ></div>
                        </div>
                    </div>
                </div>

                {/* [BLOQUE 2] COLUMNA CENTRAL: GEOVISOR 3D & BUSCADOR DE DISTRITOS */}
                <div className={`${modoWarRoom ? "lg:col-span-12" : "lg:col-span-6"} bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between space-y-3.5 shadow-xl order-2 transition-all duration-300`}>
                    <div>
                        <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                            <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-sky-400" />
                                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                                    Geovisor 3D Nacional &amp; Nodos de Amenaza {modoWarRoom && "• MODO WAR ROOM VIDEOWALL"}
                                </h2>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-mono text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                                    159 Cuencas Activas
                                </span>
                                <Link
                                    href="/satelites"
                                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-300 bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-600/50 px-2.5 py-1 rounded-lg transition shadow-md"
                                    title="Abrir Visor Multitemporal Satelital NASA GIBS (AQUA/TERRA)"
                                >
                                    <Satellite className="w-3.5 h-3.5 text-emerald-400" />
                                    <span>Satélites NASA</span>
                                </Link>
                                <Link
                                    href="/geovisor"
                                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-500 border border-sky-400/40 px-3 py-1 rounded-lg transition shadow-md shadow-sky-600/30"
                                    title="Abrir Consola de Visor de Mapas C2 a Pantalla Completa"
                                >
                                    <Satellite className="w-3.5 h-3.5 text-sky-200" />
                                    <span>Abrir Geovisor C2</span>
                                    <ExternalLink className="w-3 h-3" />
                                </Link>
                            </div>
                        </div>

                        {/* Ventana de Mapa 3D */}
                        <div className={`${modoWarRoom ? "h-[540px]" : "h-[330px]"} rounded-xl overflow-hidden border border-slate-800/80 relative mt-2 transition-all duration-300`}>
                            <MapViewer mode="national" />
                            <div className="absolute top-2 left-2 bg-slate-950/90 border border-slate-800 p-2 rounded text-[10px] space-y-1 backdrop-blur pointer-events-none">
                                <div className="flex items-center gap-1.5 text-red-400">
                                    <span className="h-2 w-2 rounded-full bg-red-500 animate-ping"></span>
                                    <b>((◎)) Punto Caliente:</b> {cActual.nombre}
                                </div>
                                <div className="text-slate-400">
                                    Caudal: {cActual.caudal} m³/s • Lluvia: {cActual.lluvia} mm
                                </div>
                            </div>
                        </div>

                        {/* BUSCADOR DE DISTRITO EN LA PARTE DE ABAJO DEL BLOQUE 2 (Requerimiento Usuario) */}
                        <div className="mt-3 bg-slate-950 border border-slate-800 rounded-xl p-3 space-y-2.5 shadow-inner">
                            <div className="flex justify-between items-center">
                                <label className="text-[11px] font-bold text-slate-200 uppercase tracking-wide flex items-center gap-1.5">
                                    <Search className="w-3.5 h-3.5 text-sky-400" />
                                    <span>Buscador de Distritos (D.S. 124 / FONDES 1,891)</span>
                                </label>
                                <span className="text-[9px] font-mono text-slate-500">
                                    Filtro por Nombre o UBIGEO
                                </span>
                            </div>

                            <div className="relative">
                                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                                <input
                                    type="text"
                                    value={searchDistrito}
                                    onChange={(e) => setSearchDistrito(e.target.value)}
                                    placeholder="Buscar distrito (ej. Catacaos, Chosica, Íllimo, Tambogrande, 200105, 150118)..."
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-8 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 transition"
                                />
                                {searchDistrito && (
                                    <button
                                        onClick={() => setSearchDistrito("")}
                                        className="absolute right-2.5 top-2.5 text-slate-500 hover:text-white text-xs font-bold"
                                    >
                                        ✕
                                    </button>
                                )}
                            </div>

                            {/* Chips de Acceso Directo */}
                            <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                                <span className="text-[9px] text-slate-500 font-mono">Frecuentes:</span>
                                {[
                                    { ubigeo: "200105", nombre: "Catacaos" },
                                    { ubigeo: "150118", nombre: "Chosica" },
                                    { ubigeo: "140304", nombre: "Íllimo" },
                                    { ubigeo: "200114", nombre: "Tambogrande" },
                                    { ubigeo: "130101", nombre: "Trujillo" },
                                    { ubigeo: "020101", nombre: "Huaraz" }
                                ].map((chip) => (
                                    <button
                                        key={chip.ubigeo}
                                        onClick={() => {
                                            setCuencaSeleccionada(chip.ubigeo);
                                            setSearchDistrito(chip.nombre);
                                        }}
                                        className={`text-[10px] px-2 py-0.5 rounded-md border font-medium transition ${
                                            cuencaSeleccionada === chip.ubigeo
                                                ? "bg-sky-950 text-sky-300 border-sky-600"
                                                : "bg-slate-900 hover:bg-slate-800 text-slate-400 border-slate-800"
                                        }`}
                                    >
                                        {chip.nombre}
                                    </button>
                                ))}
                            </div>

                            {/* Resultados de Búsqueda si hay texto */}
                            {searchDistrito.trim().length > 0 && (
                                <div className="max-h-36 overflow-y-auto space-y-1 pt-1 border-t border-slate-800">
                                    {distritosFiltradosBusqueda.length === 0 ? (
                                        <div className="text-[11px] text-slate-500 py-1 text-center font-mono">
                                            No se encontraron distritos para "{searchDistrito}".
                                        </div>
                                    ) : (
                                        distritosFiltradosBusqueda.map((d) => (
                                            <div
                                                key={d.ubigeo}
                                                onClick={() => setCuencaSeleccionada(d.ubigeo)}
                                                className="flex items-center justify-between p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 cursor-pointer transition text-xs"
                                            >
                                                <div>
                                                    <span className="font-bold text-white">{d.nombre}</span>
                                                    <span className="text-[10px] text-slate-400 ml-2">
                                                        ({d.departamento} • UBIGEO {d.ubigeo})
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                                                        d.estadoLluvia === "ROJO" ? "bg-red-950 text-red-400 border border-red-800" : "bg-emerald-950 text-emerald-400 border border-emerald-800"
                                                    }`}>
                                                        {d.estadoLluvia}
                                                    </span>
                                                    <Link
                                                        href={`/dashboard/${d.ubigeo}`}
                                                        className="text-[10px] font-bold text-sky-400 hover:text-white px-2 py-0.5 rounded bg-sky-950/80 border border-sky-700"
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        Ir al C2
                                                    </Link>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* [BLOQUE 3] COLUMNA DERECHA: RADAR QUEBRADAS & IPH-FEN */}
                <div className={`${modoWarRoom ? "hidden" : "lg:col-span-3"} bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-xl flex flex-col justify-between order-3`}>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                            <div className="flex items-center gap-1.5">
                                <Mountain className={`w-4 h-4 ${quebradasAlertaRoja ? "text-red-400 animate-pulse" : "text-emerald-400"}`} />
                                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                                    Radar Quebradas &amp; IPH-FEN
                                </h2>
                            </div>
                            <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full flex items-center gap-1 font-bold ${
                                quebradasAlertaRoja
                                    ? "text-red-400 bg-red-950 border border-red-800 animate-pulse"
                                    : "text-emerald-400 bg-emerald-950 border border-emerald-800"
                            }`}>
                                {quebradasAlertaRoja ? "🚨 ALERTA ROJA ACTIVA" : "🟢 VERDE / INACTIVA"}
                            </span>
                        </div>

                        {/* Control Operativo de Activación de Quebradas */}
                        <div className="bg-slate-950 border border-slate-800 rounded-xl p-2.5 space-y-2">
                            <div className="flex justify-between items-center text-[10px]">
                                <span className="font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1">
                                    <Activity className="w-3 h-3 text-amber-400" /> Manning &amp; T-lag:
                                </span>
                                <button
                                    onClick={() => setQuebradasAlertaRoja(!quebradasAlertaRoja)}
                                    className={`px-2 py-0.5 rounded-md text-[9px] font-bold font-mono transition flex items-center gap-1 ${
                                        quebradasAlertaRoja
                                            ? "bg-emerald-900/60 hover:bg-emerald-800 text-emerald-300 border border-emerald-700"
                                            : "bg-red-950/80 hover:bg-red-900 text-red-300 border border-red-800"
                                    }`}
                                >
                                    {quebradasAlertaRoja ? "🟢 Restablecer a Verde" : "⚡ Simular Activación Tormenta"}
                                </button>
                            </div>
                            <p className="text-[10px] text-slate-400 leading-snug">
                                {quebradasAlertaRoja
                                    ? "⚠️ Alerta activada: Flujo hiperconcentrado en cuenca alta. IPH crítico y cuenta regresiva T-lag en marcha."
                                    : "🟢 Las quebradas están en estado VERDE (inactivas). Si se detecta precipitación torrencial, conmutan a ROJO con cuenta regresiva."}
                            </p>
                        </div>

                        {/* Lista de Quebradas Tácticas Críticas */}
                        <div className="space-y-2">
                            <div className="flex justify-between items-center text-[10px] font-semibold text-slate-400 px-1">
                                <span>QUEBRADA CRÍTICA</span>
                                <span className="font-mono">IPH PREVISTO • T-LAG</span>
                            </div>

                            <div className="space-y-2 max-h-[290px] overflow-y-auto pr-1">
                                {QUEBRADAS_TACTICAS.map((q) => {
                                    const iphActual = quebradasAlertaRoja ? q.iphActivo : q.iphBasal;
                                    return (
                                        <div
                                            key={q.id}
                                            className={`p-2.5 rounded-xl border text-xs transition flex flex-col gap-1.5 ${
                                                quebradasAlertaRoja
                                                    ? "bg-red-950/30 border-red-900/80 text-red-100"
                                                    : "bg-slate-950/80 border-slate-800 text-slate-300"
                                            }`}
                                        >
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <div className="font-bold text-white flex items-center gap-1.5">
                                                        <span>{q.nombre}</span>
                                                        {q.mallasGeodinamicas && (
                                                            <span className="text-[8px] font-mono bg-blue-950 text-blue-300 border border-blue-800 px-1 rounded" title="Protegida por barreras dinámicas geomecánicas">
                                                                Mallas
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="text-[10px] text-slate-400">
                                                        {q.distrito} ({q.departamento})
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <span className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded ${
                                                        quebradasAlertaRoja
                                                            ? "bg-red-950 text-red-300 border border-red-800 animate-pulse"
                                                            : "bg-emerald-950 text-emerald-400 border border-emerald-800"
                                                    }`}>
                                                        IPH {iphActual}%
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Barra de Progreso IPH */}
                                            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full transition-all duration-500 ${
                                                        quebradasAlertaRoja ? "bg-red-500 animate-pulse" : "bg-emerald-500"
                                                    }`}
                                                    style={{ width: `${iphActual}%` }}
                                                ></div>
                                            </div>

                                            {/* Métricas Manning y Tiempo de Llegada (Tlag) */}
                                            <div className="flex justify-between items-center text-[10px] text-slate-400 pt-0.5 font-mono">
                                                <span>{q.pendiente}</span>
                                                <span className={quebradasAlertaRoja ? "text-red-400 font-bold" : "text-slate-400"}>
                                                    {quebradasAlertaRoja
                                                        ? `⏱️ T-lag: ${q.tlagMinutos} min impacto`
                                                        : `T-lag: ${q.tlagMinutos} min nominal`}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* BOTÓN PROMINENTE A CONSOLA DE ANÁLISIS DE HUAICOS & GEOVISOR C2 (Requerimiento Usuario) */}
                    <div className="pt-2 space-y-2">
                        <Link
                            href="/geovisor"
                            className="w-full bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 hover:from-red-500 hover:via-rose-500 hover:to-amber-500 text-white font-bold py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 transition shadow-xl shadow-red-900/40 border border-red-500/50 text-xs text-center"
                            title="Abrir Consola de Análisis de Huaycos y Geovisor C2"
                        >
                            <Mountain className="w-4 h-4 text-amber-300 shrink-0" />
                            <span>CONSOLA ANÁLISIS HUAICOS &amp; GEOVISOR C2</span>
                            <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                        </Link>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setVerModalCap(!verModalCap)}
                                className="w-1/2 bg-blue-950 hover:bg-blue-900 border border-blue-700 text-blue-200 text-[10px] font-bold py-1.5 px-2 rounded-lg flex items-center justify-center gap-1 transition"
                            >
                                <FileCode2 className="w-3 h-3" />
                                {verModalCap ? "Ocultar CAP" : "Ver CAP v1.2"}
                            </button>

                            <Link
                                href={`/dashboard/${cuencaSeleccionada}`}
                                className="w-1/2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-bold py-1.5 px-2 rounded-lg flex items-center justify-center gap-1 transition border border-slate-700 truncate"
                            >
                                <Eye className="w-3 h-3 text-sky-400 shrink-0" />
                                <span className="truncate">C2: {cActual.nombre}</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal de Inspección CAP v1.2 */}
            {verModalCap && (
                <div className="bg-slate-900 border border-blue-700 rounded-2xl p-4 space-y-2 animate-fade-in shadow-2xl">
                    <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                        <span className="text-xs font-mono font-bold text-blue-300 flex items-center gap-2">
                            <FileCode2 className="w-4 h-4 text-blue-400" />
                            Payload Oficial CAP v1.2 (OASIS / ITU-T X.1303) para Difusión Masiva SISMATE
                        </span>
                        <span className="text-[10px] font-mono bg-blue-950 text-blue-300 border border-blue-800 px-2 py-0.5 rounded">
                            SISMATE &amp; GDACS READY
                        </span>
                    </div>
                    <pre className="bg-slate-950 p-3.5 rounded-xl text-[11px] font-mono text-slate-300 overflow-x-auto max-h-56 border border-slate-800">
                        {JSON.stringify(capPayloadMock, null, 2)}
                    </pre>
                </div>
            )}

            {/* ========================================================================= */}
            {/* [ZONA 4B] RELOJES POLARES TÁCTICOS C2 & VENTANAS DORADAS LOGÍSTICAS       */}
            {/* ========================================================================= */}
            <TacticalPolarClock initialMode="AMARU-FEN" />

            {/* ========================================================================= */}
            {/* [ZONA 5] BITÁCORA DE DESPACHO BILINGÜE / MONOLINGÜE Y AUDITORÍA TELEGRAM  */}
            {/* ========================================================================= */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 grid grid-cols-1 md:grid-cols-12 gap-4 shadow-xl">
                {/* Panel Comunitario según Criterio RENALIO */}
                <div className="md:col-span-7 space-y-3">
                    <div className="flex flex-wrap justify-between items-center gap-2">
                        <div className="flex items-center gap-2">
                            <Languages className="w-4 h-4 text-amber-400" />
                            <span className="text-xs font-bold text-slate-200 uppercase tracking-wide">
                                Despacho Comunitario ({isBilingue ? "Bilingüe Obligatorio" : "Monolingüe Castellano"})
                            </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            {isBilingue ? (
                                <span className="text-[10px] font-mono font-bold bg-amber-950 text-amber-300 border border-amber-800 px-2 py-0.5 rounded flex items-center gap-1">
                                    🇵🇪 RENALIO: {cActual.lengua_nombre} ({cActual.iso_code}) + Castellano Acompañante
                                </span>
                            ) : (
                                <span className="text-[10px] font-mono font-bold bg-blue-950 text-blue-300 border border-blue-800 px-2 py-0.5 rounded flex items-center gap-1">
                                    🏢 RENALIO: Castellano Llano (Sin traducción forzada)
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Contenido del Mensaje según regla etnoterritorial */}
                    {isBilingue ? (
                        <div className="space-y-2.5">
                            {/* Bloque 1: Lengua Originaria Predominante */}
                            <div className="bg-slate-950 border border-amber-900/60 p-3 rounded-xl space-y-1">
                                <div className="flex justify-between items-center text-[10px] font-bold text-amber-400">
                                    <span>🇵🇪 LENGUA ORIGINARIA PREDOMINANTE [{cActual.iso_code}] — {cActual.lengua_nombre.toUpperCase()}:</span>
                                    <span className="font-mono text-amber-500/80">{cActual.familia}</span>
                                </div>
                                <p className="text-amber-200 italic text-xs leading-relaxed">
                                    {cActual.aviso_originaria}
                                </p>
                            </div>

                            {/* Bloque 2: Castellano Acompañante Obligatorio */}
                            <div className="bg-slate-950 border border-blue-900/60 p-3 rounded-xl space-y-1">
                                <div className="flex justify-between items-center text-[10px] font-bold text-blue-400">
                                    <span>🏢 CASTELLANO ACOMPAÑANTE OBLIGATORIO [es-PE]:</span>
                                    <span className="font-mono text-blue-400/80">Co-oficial • Difusión Dual SISMATE</span>
                                </div>
                                <p className="text-slate-200 text-xs leading-relaxed">
                                    {cActual.aviso_castellano}
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {/* Bloque Único: Monolingüe Castellano */}
                            <div className="bg-slate-950 border border-blue-900/60 p-3.5 rounded-xl space-y-1.5">
                                <div className="flex justify-between items-center text-[10px] font-bold text-blue-400">
                                    <span>🏢 CASTELLANO COMUNITARIO [es-PE]:</span>
                                    <span className="font-mono text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-800">
                                        Zona Costera • 1 Bloque CAP
                                    </span>
                                </div>
                                <p className="text-slate-200 text-xs leading-relaxed">
                                    {cActual.aviso_castellano}
                                </p>
                            </div>
                            <div className="bg-slate-950/70 border border-slate-800 p-2.5 rounded-lg text-[10px] text-slate-400 flex items-center gap-2">
                                <span className="text-blue-400 text-sm">ℹ️</span>
                                <span>
                                    <b>Criterio RENALIO D.S. 009-2021-MC:</b> En {cActual.nombre} el 95%+ de la población es hispanohablante. El protocolo COEN emite la alerta exclusivamente en Castellano, evitando traducciones artificiales o no contextualizadas.
                                </span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Despacho a Canales Telegram y Célula SISMATE */}
                <div className="md:col-span-5 space-y-2">
                    <span className="text-xs font-bold text-purple-400 uppercase flex items-center gap-1.5">
                        <Send className="w-4 h-4" /> Despacho Auditado a Canales (Agente 4)
                    </span>
                    <div className="space-y-1.5 text-xs">
                        <div className="bg-slate-950 p-2 rounded-lg border border-slate-800 flex justify-between items-center">
                            <div>
                                <span className="font-semibold text-slate-200 text-[11px] block">🏢 Canal Autoridades (COER / COEL)</span>
                                <span className="text-[10px] text-slate-500 font-mono">-1001234567890 • Métricas + Boletín</span>
                            </div>
                            <span className="text-[10px] bg-emerald-950 border border-emerald-700 text-emerald-400 font-bold px-2 py-0.5 rounded">
                                ✓ ENTREGADO
                            </span>
                        </div>

                        <div className="bg-slate-950 p-2 rounded-lg border border-slate-800 flex justify-between items-center">
                            <div>
                                <span className="font-semibold text-slate-200 text-[11px] block">👥 Canal Vecinal Comunitario</span>
                                <span className="text-[10px] text-slate-500 font-mono">
                                    -1009876543210 • {isBilingue ? `Bilingüe (${cActual.iso_code} + es)` : "Castellano Directo"}
                                </span>
                            </div>
                            <span className="text-[10px] bg-emerald-950 border border-emerald-700 text-emerald-400 font-bold px-2 py-0.5 rounded">
                                ✓ ENTREGADO
                            </span>
                        </div>

                        <div className="bg-slate-950 p-2 rounded-lg border border-slate-800 flex justify-between items-center">
                            <div>
                                <span className="font-semibold text-slate-200 text-[11px] block">📡 Célula SISMATE / MTC (CAP v1.2)</span>
                                <span className="text-[10px] text-slate-500 font-mono">
                                    Difusión Celular • {isBilingue ? "2 Bloques <info>" : "1 Bloque <info>"}
                                </span>
                            </div>
                            <span className="text-[10px] bg-blue-950 border border-blue-700 text-blue-300 font-bold px-2 py-0.5 rounded">
                                ✓ DIFUNDIDO
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Aviso Institucional & Transparencia AMARU-CLIMATE */}
            <footer className="mt-8 pt-4 border-t border-slate-800/80 text-center text-slate-500 text-xs space-y-1">
                <p className="font-semibold text-slate-300">
                    AMARU-CLIMATE • Suite Tripartita Soberana (COED Nacional • COED Municipal • COED Social)
                </p>
                <p className="text-[11px] max-w-3xl mx-auto leading-relaxed text-slate-400">
                    Plataforma cívica y tecnológica independiente de analítica predictiva, memoria histórica (1983–2017)
                    y comando digital basada en inteligencia artificial (Agentes Soberanos AMARU). Diseñada para articular
                    y fortalecer técnicamente las capacidades de las municipalidades, comunidades y autoridades del SINAGERD.
                </p>
            </footer>
        </section>
    );
}
