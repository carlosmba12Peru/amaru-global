"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
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
    BookOpen
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

export default function NationalDashboard() {
    const [verModalCap, setVerModalCap] = useState<boolean>(false);
    const [cuencaSeleccionada, setCuencaSeleccionada] = useState<string>("150118");

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
        }
    ];

    const cActual = CUENCAS_CRITICAS.find(c => c.ubigeo === cuencaSeleccionada) || CUENCAS_CRITICAS[0];
    const isBilingue = cActual.tipo === "BILINGÜE";

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
                        COEN-DIGITAL: TABLERO DE MANDO NACIONAL
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
                </div>
            </div>

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
            {/* [ZONA 2, 3, 4] GRID CENTRAL: TELEMETRÍA (IZQ) + GEOVISOR AL MEDIO + SWARM (DER)  */}
            {/* ========================================================================= */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                
                {/* [ZONA 3] COLUMNA IZQUIERDA: TELEMETRÍA OPEN-METEO PRO FULL STACK (3 Columnas) */}
                <div className="lg:col-span-3 bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-4 shadow-xl flex flex-col justify-between order-1">
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

                    {/* Botón de Acceso Táctico a Consola de Emergencia FEN (893 Distritos) */}
                    <Link
                        href="/meteo"
                        className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-gradient-to-r from-amber-950/40 via-orange-950/40 to-red-950/40 hover:from-amber-900/50 hover:via-orange-900/50 hover:to-red-900/50 border border-amber-500/50 text-white transition shadow-lg group"
                        title="Abrir Consola Meteorológica FEN: 893 Distritos del D.S. 124-2026-PCM"
                    >
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/40 group-hover:scale-105 transition">
                                <Zap className="w-4 h-4 text-amber-400" />
                            </div>
                            <div className="text-left">
                                <div className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                                    <span>CONSOLA FEN: 893 DISTRITOS</span>
                                    <span className="text-[8px] px-1 py-0.2 rounded bg-red-950 text-red-400 border border-red-800 font-mono">
                                        D.S. 124
                                    </span>
                                </div>
                                <div className="text-[10px] text-slate-400">
                                    Semáforo 🟢 🟡 🟠 🔴 Lluvias &amp; CAPE
                                </div>
                            </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-amber-400 group-hover:translate-x-1 transition" />
                    </Link>

                    {/* Círculo Radial / Gauge de CAPE Convectivo */}
                    <div className="bg-slate-950 border border-amber-900/40 p-3.5 rounded-xl text-center space-y-2">
                        <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">
                            Energía Convectiva CAPE
                        </span>
                        <div className="flex justify-center items-center">
                            <div className="relative w-24 h-24 rounded-full border-4 border-amber-600/30 flex items-center justify-center bg-amber-950/20 shadow-inner">
                                <div className="text-center">
                                    <span className="text-xl font-black text-amber-400 leading-none block">
                                        {cActual.cape}
                                    </span>
                                    <span className="text-[9px] font-mono text-slate-400 block">J/kg</span>
                                </div>
                            </div>
                        </div>
                        <p className="text-[10px] text-red-400 font-semibold leading-tight">
                            {cActual.cape > 1400 ? "⚠️ Inestabilidad Extrema (Gatillo Huaico)" : "Vigilancia Moderada"}
                        </p>
                    </div>

                    {/* Perfil de Suelo en 4 Capas */}
                    <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl space-y-2 text-xs">
                        <div className="flex justify-between items-center text-[10px] font-semibold text-slate-400 uppercase">
                            <span>Suelo en 4 Estratos</span>
                            <span className="text-amber-400 font-mono">Infiltración</span>
                        </div>
                        
                        <div className="space-y-1.5 text-[10px]">
                            <div>
                                <div className="flex justify-between text-slate-400 mb-0.5">
                                    <span>0–7 cm (Superficial):</span>
                                    <span className="font-mono text-slate-200">42%</span>
                                </div>
                                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-blue-500 rounded-full" style={{ width: "42%" }}></div>
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between text-slate-400 mb-0.5">
                                    <span>7–28 cm (Radicular):</span>
                                    <span className="font-mono text-slate-200">40%</span>
                                </div>
                                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-blue-400 rounded-full" style={{ width: "40%" }}></div>
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between text-slate-400 mb-0.5">
                                    <span className="text-red-300 font-bold">28–100 cm (Talud Crítico):</span>
                                    <span className="font-mono font-bold text-red-400">{cActual.suelo}%</span>
                                </div>
                                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden border border-red-900">
                                    <div className="h-full bg-red-500 rounded-full animate-pulse" style={{ width: `${cActual.suelo}%` }}></div>
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between text-slate-400 mb-0.5">
                                    <span>100–255 cm (Freático):</span>
                                    <span className="font-mono text-slate-200">35%</span>
                                </div>
                                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-slate-600 rounded-full" style={{ width: "35%" }}></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Hidrograma Fluvial GloFAS */}
                    <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl space-y-1 text-xs">
                        <div className="flex justify-between items-center text-[10px] font-semibold text-slate-400 uppercase">
                            <span>Descarga GloFAS</span>
                            <span className="text-sky-400 font-mono">{cActual.caudal} m³/s</span>
                        </div>
                        <div className="pt-1 flex items-baseline justify-between">
                            <span className="text-lg font-bold text-white">{cActual.caudal}</span>
                            <span className="text-[10px] text-red-400 font-mono">Umbral crítico: 100 m³/s</span>
                        </div>
                        <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full bg-sky-400 rounded-full" style={{ width: "85%" }}></div>
                        </div>
                    </div>
                </div>

                {/* [ZONA 2] COLUMNA CENTRAL: GEOVISOR 3D & CUENCAS AL MEDIO (6 Columnas) */}
                <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between space-y-4 shadow-xl order-2">
                    <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                        <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-sky-400" />
                            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                                Geovisor 3D Nacional &amp; Nodos de Amenaza
                            </h2>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                                159 Cuencas Activas
                            </span>
                            <Link
                                href="/geovisor"
                                className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-500 border border-sky-400/40 px-3 py-1 rounded-lg transition shadow-md shadow-sky-600/30"
                                title="Abrir Consola de Visor de Mapas C2 a Pantalla Completa"
                            >
                                <Satellite className="w-3.5 h-3.5 text-sky-200" />
                                <span>Abrir Consola Geovisor C2</span>
                                <ExternalLink className="w-3 h-3" />
                            </Link>
                        </div>
                    </div>

                    {/* Ventana de Mapa 3D ampliada al centro */}
                    <div className="h-[360px] rounded-xl overflow-hidden border border-slate-800/80 relative">
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

                    {/* Selector Rápido de Cuencas Críticas y Monitoreo Etnoterritorial */}
                    <div className="space-y-1.5">
                        <div className="flex justify-between items-center">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                                Nodos Críticos RENALIO en Observación (8 Distritos Clave):
                            </span>
                            <span className="text-[9px] font-mono text-slate-500">
                                D.S. 009-2021-MC
                            </span>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 max-h-[170px] overflow-y-auto pr-1">
                            {CUENCAS_CRITICAS.map((c) => (
                                <button
                                    key={c.ubigeo}
                                    onClick={() => setCuencaSeleccionada(c.ubigeo)}
                                    className={`p-2 rounded-lg border text-left text-xs transition flex flex-col justify-between gap-1 ${
                                        cuencaSeleccionada === c.ubigeo
                                            ? "bg-slate-800 border-sky-500 text-white shadow-md ring-1 ring-sky-500/40"
                                            : "bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-850"
                                    }`}
                                >
                                    <div className="flex justify-between items-start w-full">
                                        <div>
                                            <div className="font-semibold text-slate-200 leading-tight">{c.nombre}</div>
                                            <div className="text-[10px] text-slate-500 truncate max-w-[110px]">{c.departamento}</div>
                                        </div>
                                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                                            c.nivel === "ROJO" ? "bg-red-950 text-red-400 border border-red-800" : "bg-amber-950 text-amber-400 border border-amber-800"
                                        }`}>
                                            {c.nivel}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1 w-full pt-0.5 border-t border-slate-800/60">
                                        <span className={`text-[9px] font-mono px-1 py-0.2 rounded ${
                                            c.tipo === "BILINGÜE"
                                                ? "bg-amber-950/80 text-amber-300 border border-amber-800/80"
                                                : "bg-blue-950/80 text-blue-300 border border-blue-800/80"
                                        }`}>
                                            {c.tipo === "BILINGÜE" ? `🇵🇪 (${c.iso_code})` : "🏢 ES"}
                                        </span>
                                        {c.ds124_pcm && (
                                            <span className="text-[8px] font-mono text-red-400 bg-red-950/40 px-1 rounded border border-red-900/60">
                                                D.S. 124
                                            </span>
                                        )}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* [ZONA 4] COLUMNA DERECHA: SWARM MULTI-AGENTE COMPACTADO (3 Columnas) */}
                <div className="lg:col-span-3 bg-slate-900 border border-purple-900/50 rounded-2xl p-4 space-y-3 shadow-xl flex flex-col justify-between order-3">
                    <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                        <div className="flex items-center gap-1.5">
                            <Cpu className="w-4 h-4 text-purple-400" />
                            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                                Swarm Agentes 24/7
                            </h2>
                        </div>
                        <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950 border border-emerald-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <CheckCircle2 className="w-2.5 h-2.5" /> 4/4 Activos
                        </span>
                    </div>

                    {/* Diagrama de Nodos Circulares y Líneas de Flujo */}
                    <div className="space-y-1.5">
                        {/* Agente 1 */}
                        <div className="bg-slate-950 p-2 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2">
                                <div className="w-5 h-5 rounded-full bg-blue-950 border border-blue-600 text-blue-300 font-bold flex items-center justify-center text-[10px]">
                                    ①
                                </div>
                                <div>
                                    <div className="font-bold text-slate-200 text-[11px]">Centinela Hidrometeo</div>
                                    <div className="text-[9px] text-slate-500">Open-Meteo Pro + Bias WFS</div>
                                </div>
                            </div>
                            <span className="text-[9px] font-mono text-emerald-400 bg-emerald-950/60 px-1 py-0.5 rounded">
                                38 ms
                            </span>
                        </div>

                        {/* Línea conectora */}
                        <div className="h-1.5 w-0.5 bg-purple-700 ml-4.5"></div>

                        {/* Agente 2 */}
                        <div className="bg-slate-950 p-2 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2">
                                <div className="w-5 h-5 rounded-full bg-amber-950 border border-amber-600 text-amber-300 font-bold flex items-center justify-center text-[10px]">
                                    ②
                                </div>
                                <div>
                                    <div className="font-bold text-slate-200 text-[11px]">Evaluador Táctico</div>
                                    <div className="text-[9px] text-slate-500">INEI + Vías MTC + INDECI</div>
                                </div>
                            </div>
                            <span className="text-[9px] font-mono text-emerald-400 bg-emerald-950/60 px-1 py-0.5 rounded">
                                112 ms
                            </span>
                        </div>

                        {/* Línea conectora */}
                        <div className="h-1.5 w-0.5 bg-purple-700 ml-4.5"></div>

                        {/* Agente 3 */}
                        <div className="bg-slate-950 p-2 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2">
                                <div className="w-5 h-5 rounded-full bg-emerald-950 border border-emerald-600 text-emerald-300 font-bold flex items-center justify-center text-[10px]">
                                    ③
                                </div>
                                <div>
                                    <div className="font-bold text-slate-200 text-[11px]">Lingüístico Cultural</div>
                                    <div className="text-[9px] text-slate-500">Gemini 1.5 • Quechua/Aymara</div>
                                </div>
                            </div>
                            <span className="text-[9px] font-mono text-emerald-400 bg-emerald-950/60 px-1 py-0.5 rounded">
                                78 ms
                            </span>
                        </div>

                        {/* Línea conectora */}
                        <div className="h-1.5 w-0.5 bg-purple-700 ml-4.5"></div>

                        {/* Agente 4 */}
                        <div className="bg-slate-950 p-2 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2">
                                <div className="w-5 h-5 rounded-full bg-purple-950 border border-purple-600 text-purple-300 font-bold flex items-center justify-center text-[10px]">
                                    ④
                                </div>
                                <div>
                                    <div className="font-bold text-slate-200 text-[11px]">Despachador &amp; Auditor</div>
                                    <div className="text-[9px] text-slate-500">Norma CAP v1.2 (SISMATE)</div>
                                </div>
                            </div>
                            <span className="text-[9px] font-mono text-emerald-400 bg-emerald-950/60 px-1 py-0.5 rounded">
                                66 ms
                            </span>
                        </div>
                    </div>

                    {/* Botones de Acción: Modal CAP v1.2 y Consola Distrital */}
                    <div className="space-y-1.5 pt-1">
                        <button
                            onClick={() => setVerModalCap(!verModalCap)}
                            className="w-full bg-blue-950 hover:bg-blue-900 border border-blue-700 text-blue-200 text-[11px] font-bold py-1.5 px-2.5 rounded-xl flex items-center justify-center gap-1.5 transition"
                        >
                            <FileCode2 className="w-3 h-3" />
                            {verModalCap ? "Ocultar CAP v1.2" : "Ver CAP v1.2 (SISMATE)"}
                        </button>

                        <Link
                            href={`/dashboard/${cuencaSeleccionada}`}
                            className="w-full bg-gradient-to-r from-red-700 to-rose-700 hover:from-red-600 hover:to-rose-600 text-white text-[11px] font-bold py-2 px-2.5 rounded-xl flex items-center justify-center gap-1.5 transition shadow-lg"
                        >
                            <Eye className="w-3 h-3" />
                            CONSOLA: {cActual.nombre.toUpperCase()}
                        </Link>
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
        </section>
    );
}
