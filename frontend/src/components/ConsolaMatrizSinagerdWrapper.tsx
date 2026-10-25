"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { API_BASE } from "@/config/api";
import DiagramaFlujoSinagerdSvg from "./DiagramaFlujoSinagerdSvg";
import {
    Landmark,
    ShieldAlert,
    HeartPulse,
    Wheat,
    Home,
    Building2,
    Building,
    Users,
    Scale,
    Lock,
    ExternalLink,
    Search,
    Filter,
    CheckCircle2,
    ArrowRight,
    Sparkles,
    Activity,
    Layers,
    FileText,
    Radio,
    Zap,
    RefreshCw,
    X,
    Info,
    ShieldCheck
} from "lucide-react";

interface ActorSinagerd {
    id: string;
    nivel: "NACIONAL" | "REGIONAL" | "MUNICIPAL" | "SOCIAL" | "CONTROL" | "BLOCKCHAIN";
    subcategoria: string;
    entidad: string;
    icono: string;
    badge_color: "rose" | "cyan" | "amber" | "emerald" | "yellow" | "purple";
    rol_doctrinario: string;
    base_legal: string;
    entregable_clave: string;
}

interface PasoSimulado {
    paso: number;
    direccion: "TOP_DOWN" | "BOTTOM_UP";
    emisor: string;
    receptor: string;
    accion: string;
    badge_color: string;
    hash_sha256: string;
    polygonscan_url?: string;
}

export default function ConsolaMatrizSinagerdWrapper() {
    const [activeTab, setActiveTab] = useState<"MATRIZ" | "AMARU_BLOCKCHAIN" | "SIMULADOR" | "HITL_TRIPARTITO">("MATRIZ");
    const [selectedLente, setSelectedLente] = useState<string>("ALL");
    const [actores, setActores] = useState<ActorSinagerd[]>([]);
    const [selectedActor, setSelectedActor] = useState<ActorSinagerd | null>(null);

    // Estados para el simulador
    const [simUbigeo, setSimUbigeo] = useState<string>("200101");
    const [simTipoEvento, setSimTipoEvento] = useState<string>("PLUVIAL_FEN");
    const [pasosSimulacion, setPasosSimulacion] = useState<PasoSimulado[]>([]);
    const [loadingSim, setLoadingSim] = useState<boolean>(false);

    useEffect(() => {
        fetchMatrizActores();
    }, []);

    const FALLBACK_ACTORES: ActorSinagerd[] = [
        {
            id: "pcm",
            nivel: "NACIONAL",
            subcategoria: "ENTE_RECTOR",
            entidad: "PCM (Presidencia del Consejo de Ministros)",
            icono: "Landmark",
            badge_color: "rose",
            rol_doctrinario: "Ente rector del SINAGERD. Emisión de Decretos Supremos de Estado de Emergencia (D.S. N.º 124-2026-PCM) y priorización presupuestal del FONDES.",
            base_legal: "Ley N.º 29664 Art. 10",
            entregable_clave: "Decreto Supremo publicado en El Peruano"
        },
        {
            id: "indeci",
            nivel: "NACIONAL",
            subcategoria: "ENTE_OPERATIVO",
            entidad: "INDECI (Instituto Nacional de Defensa Civil)",
            icono: "ShieldAlert",
            badge_color: "rose",
            rol_doctrinario: "Conducción del COEN, administración técnica de la plataforma SINPAD y almacenamiento centralizado de Bienes de Ayuda Humanitaria (BAH).",
            base_legal: "Ley N.º 29664 Art. 12",
            entregable_clave: "Fichas SINPAD y Almacenes Nacionales BAH"
        },
        {
            id: "minsa",
            nivel: "NACIONAL",
            subcategoria: "SECTORIAL_ASISTENCIAL",
            entidad: "MINSA (Ministerio de Salud)",
            icono: "HeartPulse",
            badge_color: "rose",
            rol_doctrinario: "Operación del COE-Salud, triaje masivo desacoplado NTS-105, prioridad de camas hospitalarias y despliegue de ambulancias SAMU.",
            base_legal: "Ley N.º 29664 Art. 14 / NTS-105-MINSA",
            entregable_clave: "CUP-MINSA (Triaje Vital y Prioridad de Evacuación)"
        },
        {
            id: "midagri",
            nivel: "NACIONAL",
            subcategoria: "SECTORIAL_MEDIOS_VIDA",
            entidad: "MIDAGRI (Desarrollo Agrario y Riego)",
            icono: "Wheat",
            badge_color: "rose",
            rol_doctrinario: "Ejecución del Seguro Agrícola Catastrófico (SAC), indemnización por hectáreas anegadas y mortandad de ganado alpaquero/ovino por heladas.",
            base_legal: "D.S. N.º 002-2024-MIDAGRI",
            entregable_clave: "CUP-AGRO (Formulario EDAN 2B e Indemnización SAC)"
        },
        {
            id: "mvcs",
            nivel: "NACIONAL",
            subcategoria: "SECTORIAL_HABITAT",
            entidad: "MVCS (Vivienda, Construcción y Saneamiento)",
            icono: "Home",
            badge_color: "rose",
            rol_doctrinario: "Otorgamiento del Bono de Arrendamiento para Emergencias (BAE S/ 500/mes) para viviendas destruidas/inhabitables y despliegue de plantas potabilizadoras SARE.",
            base_legal: "Ley N.º 31526 (Bono BAE)",
            entregable_clave: "CUP-DAMN (Formulario EDAN 2A y Padrón BAE)"
        },
        {
            id: "gore_coer",
            nivel: "REGIONAL",
            subcategoria: "INTERMEDIO",
            entidad: "Gobierno Regional (GORE / COER)",
            icono: "Building2",
            badge_color: "cyan",
            rol_doctrinario: "Coordinación de emergencias Nivel 4, administración de almacenes regionales adelantados y apoyo con maquinaria pesada a distritos colapsados.",
            base_legal: "Ley N.º 27867 Art. 61",
            entregable_clave: "Maquinaria en apoyo y Convoyes Regionales BAH"
        },
        {
            id: "alcalde_gtgrd",
            nivel: "MUNICIPAL",
            subcategoria: "TACTICO_LOCAL",
            entidad: "Alcalde Distrital/Provincial (GT-GRD)",
            icono: "Building",
            badge_color: "amber",
            rol_doctrinario: "Preside el Grupo de Trabajo (GT-GRD), aprueba la firma de la Directiva C2 SHA-256, autoriza Contrataciones Directas (Ley 30225 Art. 27 b) y canaliza el EDAN v2.",
            base_legal: "Ley N.º 29664 Art. 14 / TUO Ley 30225 / PP 0068",
            entregable_clave: "Acta Municipal C2 SHA-256 & Fichas EDAN 2A/2B"
        },
        {
            id: "comunidad_juvesc",
            nivel: "SOCIAL",
            subcategoria: "COMUNITARIO",
            entidad: "Sociedad Organizada (JUVESC, Rondas, Regantes)",
            icono: "Users",
            badge_color: "emerald",
            rol_doctrinario: "Primera línea de respuesta cívica, validación de sensor humano en terreno mediante fotos con GPS EXIF y evacuación preventiva a albergues.",
            base_legal: "Ley N.º 29664 Art. 60",
            entregable_clave: "Reportes Ciudadanos y Control Social Ground-Truth"
        },
        {
            id: "cgr_fiscalia",
            nivel: "CONTROL",
            subcategoria: "FISCALIZACION",
            entidad: "Contraloría General (CGR) / Fiscalía",
            icono: "Scale",
            badge_color: "yellow",
            rol_doctrinario: "Aplica el Control Concurrente (Ley 31358). Fiscaliza la legalidad de contrataciones de emergencia sin frenar el auxilio, previniendo delitos del Art. 377 CP.",
            base_legal: "Ley N.º 31358 / Código Penal Art. 377",
            entregable_clave: "Informes de Hito de Control WORM"
        },
        {
            id: "polygon_blockchain",
            nivel: "BLOCKCHAIN",
            subcategoria: "RED_EXTERNA",
            entidad: "Polygon Blockchain (L3 Anchor / ClimateAuditAnchor.sol)",
            icono: "Lock",
            badge_color: "purple",
            rol_doctrinario: "Anclaje notarial incorruptible fuera del servidor del Estado. Sella la Raíz de Merkle de todos los eventos en un Smart Contract público visible en PolygonScan.",
            base_legal: "Fe Pública Criptográfica Determinista (IEEE Standard)",
            entregable_clave: "TxHash On-Chain Público (amoy.polygonscan.com)"
        }
    ];

    const FALLBACK_PASOS: PasoSimulado[] = [
        {
            paso: 1,
            direccion: "TOP_DOWN",
            emisor: "COED Nacional C2 (Radar Doppler)",
            receptor: "Bandeja C2 del Alcalde",
            accion: "Emisión de Alerta Temprana EAP T_0 con firma criptográfica SHA-256 por reflectividad meteorológica pluvial severa (UBIGEO 200101).",
            badge_color: "rose",
            hash_sha256: "0x8f2d4e7a1b9c3d5e..."
        },
        {
            paso: 2,
            direccion: "TOP_DOWN",
            emisor: "Alcalde Distrital (GT-GRD)",
            receptor: "Contrataciones & Defensa Civil",
            accion: "Activación del Plan de Contingencia y firma del expediente de Contratación Directa de Maquinaria bajo el Art. 27 lit. b de la Ley N.º 30225.",
            badge_color: "amber",
            hash_sha256: "0x3a7b9c1d5e2f4a8b..."
        },
        {
            paso: 3,
            direccion: "TOP_DOWN",
            emisor: "Defensa Civil Municipal",
            receptor: "Sociedad Organizada / Comunidades",
            accion: "Despacho multicanal de alertas a radios bilingües y activación de refugios temporales con kits de abrigo y alimentos BAH.",
            badge_color: "cyan",
            hash_sha256: "0x5e2f4a8b1c3d9e7f..."
        },
        {
            paso: 4,
            direccion: "BOTTOM_UP",
            emisor: "Sensor Humano Cívico (JUVESC)",
            receptor: "Centro Operativo Municipal",
            accion: "Envío de reportes en terreno con fotos geoetiquetadas GPS EXIF (CUP-DAMN para viviendas colapsadas y CUP-AGRO para tierras anegadas).",
            badge_color: "emerald",
            hash_sha256: "0x1c3d9e7f5a8b2c4d..."
        },
        {
            paso: 5,
            direccion: "BOTTOM_UP",
            emisor: "GT-GRD Municipal",
            receptor: "Bóveda SINPAD / INDECI",
            accion: "Inyección síncrona de los Padrones EDAN v2 consolidados a la plataforma nacional SINPAD y al programa fiscal PP 0068.",
            badge_color: "yellow",
            hash_sha256: "0x9e7f5a8b2c4d1e3f..."
        },
        {
            paso: 6,
            direccion: "BOTTOM_UP",
            emisor: "AMARU Notary Service",
            receptor: "Polygon Blockchain (L3 Anchor)",
            accion: "Anclaje notarial incorruptible de la Raíz de Merkle en el Smart Contract ClimateAuditAnchor.sol (ChainID: 80002) para auditoría CGR.",
            badge_color: "purple",
            hash_sha256: "0x683a4f2b9c1d5e7a...",
            polygonscan_url: "https://amoy.polygonscan.com"
        }
    ];

    useEffect(() => {
        fetchMatrizActores();
    }, []);

    const fetchMatrizActores = async () => {
        try {
            const res = await fetch(`${API_BASE}/api/v1/doctrina/matriz-actores`);
            if (res.ok) {
                const data = await res.json();
                if (data.actores && data.actores.length > 0) {
                    setActores(data.actores);
                    return;
                }
            }
            setActores(FALLBACK_ACTORES);
        } catch (err) {
            console.error("Error al cargar matriz de actores, usando fallback:", err);
            setActores(FALLBACK_ACTORES);
        }
    };

    const runSimulacion = async (ubigeo: string, tipo: string) => {
        setLoadingSim(true);
        try {
            const res = await fetch(`${API_BASE}/api/v1/doctrina/simular-flujo?ubigeo=${ubigeo}&tipo_evento=${tipo}`);
            if (res.ok) {
                const data = await res.json();
                if (data.pasos_flujo_bidireccional && data.pasos_flujo_bidireccional.length > 0) {
                    setPasosSimulacion(data.pasos_flujo_bidireccional);
                    return;
                }
            }
            setPasosSimulacion(FALLBACK_PASOS);
        } catch (err) {
            console.error("Error al ejecutar simulación, usando fallback:", err);
            setPasosSimulacion(FALLBACK_PASOS);
        } finally {
            setLoadingSim(false);
        }
    };

    useEffect(() => {
        if (activeTab === "SIMULADOR") {
            runSimulacion(simUbigeo, simTipoEvento);
        }
    }, [activeTab, simUbigeo, simTipoEvento]);

    const renderIcon = (iconName: string, className: string) => {
        switch (iconName) {
            case "Landmark": return <Landmark className={className} />;
            case "ShieldAlert": return <ShieldAlert className={className} />;
            case "HeartPulse": return <HeartPulse className={className} />;
            case "Wheat": return <Wheat className={className} />;
            case "Home": return <Home className={className} />;
            case "Building2": return <Building2 className={className} />;
            case "Building": return <Building className={className} />;
            case "Users": return <Users className={className} />;
            case "Scale": return <Scale className={className} />;
            case "Lock": return <Lock className={className} />;
            default: return <Activity className={className} />;
        }
    };

    const getBadgeStyle = (color: string) => {
        switch (color) {
            case "rose":
                return "bg-rose-500/20 text-rose-300 border-rose-500/50 hover:bg-rose-500/30";
            case "cyan":
                return "bg-cyan-500/20 text-cyan-300 border-cyan-500/50 hover:bg-cyan-500/30";
            case "amber":
                return "bg-amber-500/20 text-amber-300 border-amber-500/50 hover:bg-amber-500/30";
            case "emerald":
                return "bg-emerald-500/20 text-emerald-300 border-emerald-500/50 hover:bg-emerald-500/30";
            case "yellow":
                return "bg-yellow-500/20 text-yellow-300 border-yellow-500/50 hover:bg-yellow-500/30";
            case "purple":
                return "bg-purple-500/20 text-purple-300 border-purple-500/50 hover:bg-purple-500/30 ring-2 ring-purple-500/60 animate-pulse";
            default:
                return "bg-slate-800 text-slate-300 border-slate-700";
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-6 space-y-6">
            {/* Header Táctico de la Consola Doctrinaria */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl space-y-4">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-3 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-600/30 border border-purple-500/40 text-purple-300 shadow-xl">
                            <Landmark className="w-7 h-7" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2 flex-wrap">
                                <h1 className="text-xl md:text-2xl font-black text-white tracking-tight">
                                    Matriz Multi-Actor SINAGERD & Circuito Bidireccional
                                </h1>
                                <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40 font-bold">
                                    AMARU BLOCKCHAIN ANCHOR L3
                                </span>
                            </div>
                            <p className="text-xs text-slate-400 mt-1">
                                Articulación Institucional Completa: <strong className="text-rose-400">🔴 Nacional</strong> (PCM, INDECI, MINSA, MIDAGRI, MVCS) &rarr; <strong className="text-cyan-400">🔵 Regional</strong> (GORE/COER) &rarr; <strong className="text-amber-400">🟠 Municipal</strong> (Alcalde / PP 0068) &rarr; <strong className="text-emerald-400">🟢 Social</strong> (Comunidad) &rarr; <strong className="text-yellow-400">⚖️ Control</strong> (Contraloría CGR) &rarr; <strong className="text-purple-400">🟣 Blockchain Polygon L3</strong>.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Tabs Principales de Navegación */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-2.5 pt-2 border-t border-slate-800">
                    <button
                        onClick={() => setActiveTab("MATRIZ")}
                        className={`p-3 rounded-2xl border transition-all flex items-center justify-between text-left ${
                            activeTab === "MATRIZ"
                                ? "bg-slate-800/90 border-indigo-500/80 shadow-lg shadow-indigo-950/30 ring-1 ring-indigo-500/50"
                                : "bg-slate-950/60 border-slate-800/80 hover:bg-slate-800/40 text-slate-400"
                        }`}
                    >
                        <div className="flex items-center gap-2.5">
                            <div className={`p-2 rounded-xl ${activeTab === "MATRIZ" ? "bg-indigo-500 text-white" : "bg-slate-800 text-slate-400"}`}>
                                <Layers className="w-4 h-4" />
                            </div>
                            <div>
                                <span className="text-[9px] font-mono uppercase tracking-wider block text-indigo-400 font-bold">Pestaña 1 • Macro</span>
                                <span className="text-xs font-bold text-white">ACTORES LEY 29664</span>
                            </div>
                        </div>
                    </button>

                    <button
                        onClick={() => setActiveTab("AMARU_BLOCKCHAIN")}
                        className={`p-3 rounded-2xl border transition-all flex items-center justify-between text-left ${
                            activeTab === "AMARU_BLOCKCHAIN"
                                ? "bg-slate-800/90 border-purple-500/80 shadow-lg shadow-purple-950/30 ring-1 ring-purple-500/50"
                                : "bg-slate-950/60 border-slate-800/80 hover:bg-slate-800/40 text-slate-400"
                        }`}
                    >
                        <div className="flex items-center gap-2.5">
                            <div className={`p-2 rounded-xl ${activeTab === "AMARU_BLOCKCHAIN" ? "bg-purple-500 text-white animate-pulse" : "bg-slate-800 text-slate-400"}`}>
                                <Lock className="w-4 h-4" />
                            </div>
                            <div>
                                <span className="text-[9px] font-mono uppercase tracking-wider block text-purple-400 font-bold">Pestaña 2 • Cripto</span>
                                <span className="text-xs font-bold text-white">POLYGON L3 & WORM</span>
                            </div>
                        </div>
                    </button>

                    <button
                        onClick={() => setActiveTab("SIMULADOR")}
                        className={`p-3 rounded-2xl border transition-all flex items-center justify-between text-left ${
                            activeTab === "SIMULADOR"
                                ? "bg-slate-800/90 border-emerald-500/80 shadow-lg shadow-emerald-950/30 ring-1 ring-emerald-500/50"
                                : "bg-slate-950/60 border-slate-800/80 hover:bg-slate-800/40 text-slate-400"
                        }`}
                    >
                        <div className="flex items-center gap-2.5">
                            <div className={`p-2 rounded-xl ${activeTab === "SIMULADOR" ? "bg-emerald-500 text-slate-950" : "bg-slate-800 text-slate-400"}`}>
                                <RefreshCw className="w-4 h-4" />
                            </div>
                            <div>
                                <span className="text-[9px] font-mono uppercase tracking-wider block text-emerald-400 font-bold">Pestaña 3 • Dinámica</span>
                                <span className="text-xs font-bold text-white">FLUJO FULL-DUPLEX</span>
                            </div>
                        </div>
                    </button>

                    <button
                        onClick={() => setActiveTab("HITL_TRIPARTITO")}
                        className={`p-3 rounded-2xl border transition-all flex items-center justify-between text-left ${
                            activeTab === "HITL_TRIPARTITO"
                                ? "bg-slate-800/90 border-rose-500/80 shadow-lg shadow-rose-950/30 ring-1 ring-rose-500/50"
                                : "bg-slate-950/60 border-slate-800/80 hover:bg-slate-800/40 text-slate-400"
                        }`}
                    >
                        <div className="flex items-center gap-2.5">
                            <div className={`p-2 rounded-xl ${activeTab === "HITL_TRIPARTITO" ? "bg-rose-500 text-white" : "bg-slate-800 text-slate-400"}`}>
                                <ShieldCheck className="w-4 h-4" />
                            </div>
                            <div>
                                <span className="text-[9px] font-mono uppercase tracking-wider block text-rose-400 font-bold">Pestaña 4 • Doctrina</span>
                                <span className="text-xs font-bold text-white">SOBERANÍA HITL & OMM</span>
                            </div>
                        </div>
                    </button>
                </div>
            </div>

            {/* ============================================================== */}
            {/* PESTAÑA 1: MATRIZ INSTITUCIONAL MULTI-ACTOR SINAGERD           */}
            {/* ============================================================== */}
            {activeTab === "MATRIZ" && (
                <div className="space-y-6">
                    {/* MAPA CONCEPTUAL INTERACTIVO VECTORIAL SVG */}
                    <DiagramaFlujoSinagerdSvg />

                    {/* BARRA DE LENTES DE VISIÓN TÁCTICA (FILTROS DE ROL) */}
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                                <Filter className="w-3.5 h-3.5 text-indigo-400" /> Lente Táctico:
                            </span>

                            {[
                                { id: "ALL", label: "👁️ Todos los Niveles", color: "bg-slate-800 text-white border-slate-700" },
                                { id: "NACIONAL", label: "🔴 Nacional (PCM/Sectores)", color: "bg-rose-950/80 text-rose-300 border-rose-700" },
                                { id: "REGIONAL", label: "🔵 Regional (GORE/COER)", color: "bg-cyan-950/80 text-cyan-300 border-cyan-700" },
                                { id: "MUNICIPAL", label: "🟠 Municipal (Alcalde/PP0068)", color: "bg-amber-950/80 text-amber-300 border-amber-700" },
                                { id: "SOCIAL", label: "🟢 Social (Comunidad)", color: "bg-emerald-950/80 text-emerald-300 border-emerald-700" },
                                { id: "CONTROL", label: "⚖️ Control (CGR/Fiscalía)", color: "bg-yellow-950/80 text-yellow-300 border-yellow-700" },
                                { id: "BLOCKCHAIN", label: "🟣 Blockchain Polygon L3", color: "bg-purple-950/80 text-purple-300 border-purple-700 animate-pulse" }
                            ].map((lente) => (
                                <button
                                    key={lente.id}
                                    onClick={() => setSelectedLente(lente.id)}
                                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition ${
                                        selectedLente === lente.id
                                            ? `${lente.color} shadow-lg ring-2 ring-white/30 scale-105`
                                            : "bg-slate-950 text-slate-400 border-slate-800 hover:text-white"
                                    }`}
                                >
                                    {lente.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* GRILLA DE TARJETAS DE ACTORES DE LA MATRIZ */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {actores
                            .filter((a) => selectedLente === "ALL" || a.nivel === selectedLente)
                            .map((actor) => (
                                <div
                                    key={actor.id}
                                    onClick={() => setSelectedActor(actor)}
                                    className={`bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 transition space-y-3 cursor-pointer shadow-xl flex flex-col justify-between ${
                                        actor.nivel === "BLOCKCHAIN" ? "ring-2 ring-purple-500/50 bg-gradient-to-br from-slate-900 to-purple-950/40" : ""
                                    }`}
                                >
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <div className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-white">
                                                {renderIcon(actor.icono, "w-5 h-5")}
                                            </div>
                                            <span className={`px-2.5 py-0.5 rounded text-[10px] font-mono font-bold border ${getBadgeStyle(actor.badge_color)}`}>
                                                {actor.nivel}
                                            </span>
                                        </div>

                                        <div>
                                            <h3 className="font-bold text-sm text-white flex items-center gap-1.5">
                                                {actor.entidad}
                                            </h3>
                                            <span className="text-[10px] text-slate-400 font-mono block mt-0.5">
                                                {actor.base_legal}
                                            </span>
                                        </div>

                                        <p className="text-xs text-slate-300 leading-relaxed line-clamp-3">
                                            {actor.rol_doctrinario}
                                        </p>
                                    </div>

                                    <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                                        <span className="text-slate-400 font-mono font-semibold">Producto Clave:</span>
                                        <span className="font-mono font-bold text-cyan-300 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                                            {actor.entregable_clave}
                                        </span>
                                    </div>
                                </div>
                            ))}
                    </div>
                </div>
            )}

            {/* ============================================================== */}
            {/* PESTAÑA 2: ENFOQUE SOBERANO AMARU & BLOCKCHAIN POLYGON L3      */}
            {/* ============================================================== */}
            {activeTab === "AMARU_BLOCKCHAIN" && (
                <div className="space-y-6">


                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Lado Izquierdo: Tradicional Bucrocrático */}
                        <div className="bg-slate-900/60 border border-red-900/50 rounded-3xl p-5 space-y-4">
                            <div className="flex items-center gap-2 text-rose-400 font-mono font-bold text-sm">
                                <X className="w-5 h-5" /> SISTEMA TRADICIONAL DISPERSO (SIN TECNOLOGÍA)
                            </div>
                            <ul className="space-y-2.5 text-xs text-slate-300">
                                <li className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-start gap-2">
                                    <span className="text-rose-400 font-bold">1.</span>
                                    <span>Informes en PDF o documentos impresos demorados por trámites burocráticos.</span>
                                </li>
                                <li className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-start gap-2">
                                    <span className="text-rose-400 font-bold">2.</span>
                                    <span>Fichas EDAN en papel propensas a pérdida o manipulación de padrones.</span>
                                </li>
                                <li className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-start gap-2">
                                    <span className="text-rose-400 font-bold">3.</span>
                                    <span>Parálsis del alcalde por temor a denuncias de la Contraloría (CGR) o cargos bajo el Art. 377 CP.</span>
                                </li>
                            </ul>
                        </div>

                        {/* Lado Derecho: Motor Soberano AMARU + Blockchain */}
                        <div className="bg-gradient-to-br from-slate-900 to-purple-950/60 border border-purple-500/60 rounded-3xl p-5 space-y-4 shadow-2xl ring-1 ring-purple-500/30">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-purple-300 font-mono font-bold text-sm">
                                    <Sparkles className="w-5 h-5 text-purple-400" /> MOTOR SOBERANO AMARU + POLYGON BLOCKCHAIN L3
                                </div>
                                <span className="text-[10px] font-mono bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded border border-purple-500/40 font-bold animate-pulse">
                                    POLYGON AMOY
                                </span>
                            </div>

                            <ul className="space-y-2.5 text-xs text-slate-200">
                                <li className="p-3 bg-slate-950/80 rounded-xl border border-purple-800/50 flex items-start gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                                    <span><strong>Ingesta Científica 24/7:</strong> Alerta inmediata EAP con firma criptográfica SHA-256.</span>
                                </li>
                                <li className="p-3 bg-slate-950/80 rounded-xl border border-purple-800/50 flex items-start gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                                    <span><strong>Empadronamiento Digital EDAN v2:</strong> Validación DNI con RENIEC y Bóveda Zero-PII.</span>
                                </li>
                                <li className="p-3 bg-slate-950/80 rounded-xl border border-purple-800/50 flex items-start gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                                    <span><strong>Anclaje On-Chain en Polygon:</strong> Inscripción inmutable en el Smart Contract <code>ClimateAuditAnchor.sol</code> para fe pública universal.</span>
                                </li>
                            </ul>

                            <div className="p-3 bg-purple-950/80 border border-purple-700/60 rounded-xl flex items-center justify-between text-xs">
                                <div className="space-y-0.5">
                                    <span className="text-[10px] font-mono text-purple-300 block font-bold">Estado del Smart Contract On-Chain:</span>
                                    <span className="font-mono text-white text-[11px]">ClimateAuditAnchor.sol (Polygon Amoy L3)</span>
                                </div>
                                <a
                                    href="https://amoy.polygonscan.com"
                                    target="_blank"
                                    rel="noreferrer"
                                    className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-[11px] rounded-lg transition flex items-center gap-1 shadow"
                                >
                                    <span>PolygonScan</span>
                                    <ExternalLink className="w-3 h-3" />
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ============================================================== */}
            {/* PESTAÑA 3: SIMULADOR DE FLUJO BIDIRECCIONAL FULL-DUPLEX         */}
            {/* ============================================================== */}
            {activeTab === "SIMULADOR" && (
                <div className="space-y-6">
                    {/* Selector de Evento y Distrito para la Simulación */}
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="flex items-center gap-3 w-full md:w-auto">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Simular Evento:</span>
                            <button
                                onClick={() => { setSimUbigeo("200101"); setSimTipoEvento("PLUVIAL_FEN"); }}
                                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition border ${
                                    simTipoEvento === "PLUVIAL_FEN"
                                        ? "bg-red-600 text-white border-red-500 shadow-md shadow-red-600/30"
                                        : "bg-slate-950 text-slate-400 border-slate-800 hover:text-white"
                                }`}
                            >
                                🔴 Inundación FEN (Piura 200101)
                            </button>
                            <button
                                onClick={() => { setSimUbigeo("210504"); setSimTipoEvento("CRIOCLIMA_CHIRI"); }}
                                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition border ${
                                    simTipoEvento === "CRIOCLIMA_CHIRI"
                                        ? "bg-sky-600 text-white border-sky-500 shadow-md shadow-sky-600/30"
                                        : "bg-slate-950 text-slate-400 border-slate-800 hover:text-white"
                                }`}
                            >
                                🔵 Helada Crioclima (Mazocruz 210504)
                            </button>
                        </div>

                        <div className="text-xs font-mono text-slate-400">
                            Distrito Seleccionado: <strong className="text-cyan-300">{simUbigeo === "200101" ? "Piura" : "Santa Rosa de Mazocruz"}</strong>
                        </div>
                    </div>

                    {/* LÍNEA DE TIEMPO DEL CIRCUITO BIDIRECCIONAL EN 6 PASOS */}
                    <div className="space-y-4">
                        {pasosSimulacion.map((paso) => (
                            <div
                                key={paso.paso}
                                className={`bg-slate-900/90 border rounded-2xl p-4 space-y-2 transition shadow-xl ${
                                    paso.badge_color === "purple"
                                        ? "border-purple-500/80 ring-1 ring-purple-500/40 bg-gradient-to-r from-slate-900 to-purple-950/40"
                                        : "border-slate-800 hover:border-slate-700"
                                }`}
                            >
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                                    <div className="flex items-center gap-2">
                                        <span className="w-6 h-6 rounded-full bg-slate-950 text-white font-mono text-xs font-bold flex items-center justify-center border border-slate-700">
                                            {paso.paso}
                                        </span>
                                        <span className="text-xs font-mono font-bold text-slate-300">
                                            {paso.emisor} &rarr; {paso.receptor}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${getBadgeStyle(paso.badge_color)}`}>
                                            {paso.direccion}
                                        </span>
                                    </div>
                                </div>

                                <p className="text-xs text-slate-200 pl-8">
                                    {paso.accion}
                                </p>

                                <div className="pl-8 pt-1 flex items-center justify-between text-[10px] font-mono text-slate-400 flex-wrap gap-2">
                                    <span>Sello Criptográfico: {paso.hash_sha256}</span>
                                    {paso.polygonscan_url && (
                                        <a
                                            href={paso.polygonscan_url}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="text-purple-300 font-bold underline flex items-center gap-1 hover:text-purple-200"
                                        >
                                            <span>Verificar en PolygonScan</span>
                                            <ExternalLink className="w-3 h-3" />
                                        </a>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ============================================================== */}
            {/* PESTAÑA 4: CADENA CONCÉNTRICA HITL & 6 ESLABONES OMM / SENDAI */}
            {/* ============================================================== */}
            {activeTab === "HITL_TRIPARTITO" && (
                <div className="space-y-6">
                    {/* Banner Doctrinario Global */}
                    <div className="bg-gradient-to-r from-rose-950/80 via-slate-900 to-slate-950 border border-rose-800/50 rounded-3xl p-6 shadow-2xl space-y-3">
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="px-3 py-1 rounded-full text-xs font-mono font-black bg-rose-500 text-white uppercase tracking-wider">
                                DOCTRINA GLOBAL & SINAGERD
                            </span>
                            <span className="px-2.5 py-0.5 rounded text-[11px] font-mono bg-purple-950 text-purple-300 border border-purple-800">
                                MARCO DE SENDAI • ODS 13.1 • ONU/OMM EW4ALL
                            </span>
                        </div>
                        <h2 className="text-xl md:text-2xl font-black text-white">
                            Cadena Concéntrica de Soberanía Humana (HITL) & Continuidad Operativa OMM
                        </h2>
                        <p className="text-xs text-slate-300 leading-relaxed max-w-4xl">
                            La efectividad de un Sistema de Alerta Temprana Multirriesgo (MHEWS) depende de la continuidad ininterrumpida de sus <strong>seis eslabones clave</strong>. En AMARU-CLIMATE, la IA procesa la física hidro-termodinámica, pero la potestad de alerta y respuesta está gobernada por <strong>tres custodios humanos soberanos</strong> interconectados en un bucle cerrado.
                        </p>
                    </div>

                    {/* Las 3 Interfaces de Usuario y sus 3 Custodios HITL */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        {/* Custodio 1: COED Nacional */}
                        <div className="bg-slate-900/90 border border-rose-800/60 rounded-3xl p-5 space-y-4 shadow-xl flex flex-col justify-between">
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold bg-rose-950 text-rose-300 border border-rose-700">
                                        NIVEL 1 • MACRO C2
                                    </span>
                                    <span className="text-[10px] font-mono text-slate-400">Eslabones 1, 2 y 3 OMM</span>
                                </div>
                                <h3 className="text-base font-bold text-white flex items-center gap-2">
                                    🌐 COED Nacional AMARU
                                </h3>
                                <p className="text-xs text-slate-300">
                                    <strong>Custodio Humano (HITL 1):</strong> Oficial de Guardia C2 / Director Técnico Nacional.
                                </p>
                                <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 text-xs space-y-1.5">
                                    <span className="font-bold text-rose-300 block">Puerta Soberana HITL:</span>
                                    <p className="text-slate-400 text-[11px]">
                                        • Enjaula el borrador analítico de IA.<br />
                                        • Certifica la <strong>no-suplantación del SISMATE/COEN</strong> (difusión celular exclusiva del Estado).<br />
                                        • Firma con hash SHA-256 para habilitar el pase a las bandejas ediles.
                                    </p>
                                </div>
                            </div>
                            <Link
                                href="/alertas"
                                className="w-full py-2.5 bg-rose-600/20 hover:bg-rose-600/30 text-rose-200 border border-rose-500/40 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
                            >
                                <span>Auditar Puerta Soberana (/alertas)</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                        </div>

                        {/* Custodio 2: COED Municipal */}
                        <div className="bg-slate-900/90 border border-amber-800/60 rounded-3xl p-5 space-y-4 shadow-xl flex flex-col justify-between">
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold bg-amber-950 text-amber-300 border border-amber-700">
                                        NIVEL 2 • TÁCTICO EDIL
                                    </span>
                                    <span className="text-[10px] font-mono text-slate-400">Eslabones 4 y 5 OMM</span>
                                </div>
                                <h3 className="text-base font-bold text-white flex items-center gap-2">
                                    🚜 COED Municipal AMARU
                                </h3>
                                <p className="text-xs text-slate-300">
                                    <strong>Custodio Humano (HITL 2):</strong> Alcalde Distrital / Provincial + Comisario PNP (Quórum Dual).
                                </p>
                                <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 text-xs space-y-1.5">
                                    <span className="font-bold text-amber-300 block">Detonación Edil & Pre-Padrón:</span>
                                    <p className="text-slate-400 text-[11px]">
                                        • Detona el <strong>PP 0068</strong> y contratación directa D8 (Art. 27 Ley 30225).<br />
                                        • Audita el <strong>Pre-Padrón EDAN</strong> familia x familia para el Bono BAE (S/ 500).<br />
                                        • Aprueba el aviso cívico local para la comunidad.
                                    </p>
                                </div>
                            </div>
                            <Link
                                href="/edan"
                                className="w-full py-2.5 bg-amber-600/20 hover:bg-amber-600/30 text-amber-200 border border-amber-500/40 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
                            >
                                <span>Inspeccionar EDAN & Quórum (/edan)</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                        </div>

                        {/* Custodio 3: COED Social */}
                        <div className="bg-slate-900/90 border border-emerald-800/60 rounded-3xl p-5 space-y-4 shadow-xl flex flex-col justify-between">
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-700">
                                        NIVEL 3 • BORDE SOCIAL
                                    </span>
                                    <span className="text-[10px] font-mono text-slate-400">Eslabones 4, 5 y 6 OMM</span>
                                </div>
                                <h3 className="text-base font-bold text-white flex items-center gap-2">
                                    💖 COED Social AMARU
                                </h3>
                                <p className="text-xs text-slate-300">
                                    <strong>Custodio Humano (HITL 3):</strong> Lideresas de Ollas Comunes + Agentes ACS MINSA.
                                </p>
                                <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 text-xs space-y-1.5">
                                    <span className="font-bold text-emerald-300 block">Sensor de Verdad & Dignidad:</span>
                                    <p className="text-slate-400 text-[11px]">
                                        • Reporte de voz y fotos de tirante de agua (Ground-Truth).<br />
                                        • Bóveda de protección Zero-PII con códigos opacos (CUP-DAMN).<br />
                                        • Triaje clínico NTS-105 MINSA y auxilio mutuo Red AYNI.
                                    </p>
                                </div>
                            </div>
                            <Link
                                href="/reporte-ciudadano"
                                className="w-full py-2.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-200 border border-emerald-500/40 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
                            >
                                <span>Ver Borde Comunitario (/reporte-c.)</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                        </div>
                    </div>

                    {/* Matriz Visual de los 6 Eslabones de la OMM / Sendai */}
                    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
                        <h3 className="text-base font-bold text-white flex items-center gap-2">
                            <Activity className="w-5 h-5 text-cyan-400" />
                            <span>La Cadena Operativa de los Seis Eslabones (OMM / UNDRR) implementada en AMARU-CLIMATE</span>
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-3 text-xs">
                            <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                                <span className="w-6 h-6 rounded-full bg-cyan-950 text-cyan-400 font-mono font-bold flex items-center justify-center border border-cyan-800 text-xs">1</span>
                                <h4 className="font-bold text-white">Observación en Tiempo Real</h4>
                                <p className="text-[11px] text-slate-400 leading-tight">Nowcasting radar Doppler Banda C, satélites y aforos fluviales ANA.</p>
                                <span className="text-[10px] font-mono text-cyan-300 block">Consola: /geovisor</span>
                            </div>

                            <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                                <span className="w-6 h-6 rounded-full bg-cyan-950 text-cyan-400 font-mono font-bold flex items-center justify-center border border-cyan-800 text-xs">2</span>
                                <h4 className="font-bold text-white">Pronóstico de Peligros</h4>
                                <p className="text-[11px] text-slate-400 leading-tight">Modelación 7 días ECMWF IFS 9km, cálculo de heladas y motor IAQ de quebradas.</p>
                                <span className="text-[10px] font-mono text-cyan-300 block">Consola: /meteo</span>
                            </div>

                            <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                                <span className="w-6 h-6 rounded-full bg-cyan-950 text-cyan-400 font-mono font-bold flex items-center justify-center border border-cyan-800 text-xs">3</span>
                                <h4 className="font-bold text-white">Predicción de Impactos</h4>
                                <p className="text-[11px] text-slate-400 leading-tight">Cruce con SIGRID CENEPRED, fajas marginales, escuelas y ganado alpaquero.</p>
                                <span className="text-[10px] font-mono text-cyan-300 block">Consola: /simulacion</span>
                            </div>

                            <div className="p-3 bg-slate-950 rounded-2xl border border-rose-800/70 space-y-2 ring-1 ring-rose-500/30">
                                <span className="w-6 h-6 rounded-full bg-rose-950 text-rose-400 font-mono font-bold flex items-center justify-center border border-rose-700 text-xs">4</span>
                                <h4 className="font-bold text-rose-200">Difusión Autorizada (HITL)</h4>
                                <p className="text-[11px] text-slate-300 leading-tight">Firma Puerta Soberana (no-SISMATE) y traducción a Quechua/Aymara.</p>
                                <span className="text-[10px] font-mono text-rose-400 font-bold block">Consola: /alertas</span>
                            </div>

                            <div className="p-3 bg-slate-950 rounded-2xl border border-amber-800/70 space-y-2 ring-1 ring-amber-500/30">
                                <span className="w-6 h-6 rounded-full bg-amber-950 text-amber-400 font-mono font-bold flex items-center justify-center border border-amber-700 text-xs">5</span>
                                <h4 className="font-bold text-amber-200">Respuesta Operativa</h4>
                                <p className="text-[11px] text-slate-300 leading-tight">Inyección PP 0068, contratación directa D8, convoyes y apertura de albergues.</p>
                                <span className="text-[10px] font-mono text-amber-400 font-bold block">Consola: /municipal</span>
                            </div>

                            <div className="p-3 bg-slate-950 rounded-2xl border border-emerald-800/70 space-y-2 ring-1 ring-emerald-500/30">
                                <span className="w-6 h-6 rounded-full bg-emerald-950 text-emerald-400 font-mono font-bold flex items-center justify-center border border-emerald-700 text-xs">6</span>
                                <h4 className="font-bold text-emerald-200">Retroalimentación Ground-Truth</h4>
                                <p className="text-[11px] text-slate-300 leading-tight">Testimonios de voz SHA-256, Bono BAE S/ 500 y anclaje blockchain Polygon.</p>
                                <span className="text-[10px] font-mono text-emerald-400 font-bold block">Consola: /edan & /ayni</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL DE DETALLE DEL ACTOR SINAGERD SELECCIONADO */}
            {selectedActor && (
                <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-2xl relative">
                        <button
                            onClick={() => setSelectedActor(null)}
                            className="absolute right-4 top-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="flex items-center gap-3">
                            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-white">
                                {renderIcon(selectedActor.icono, "w-6 h-6")}
                            </div>
                            <div>
                                <span className={`px-2.5 py-0.5 rounded text-[10px] font-mono font-bold border ${getBadgeStyle(selectedActor.badge_color)}`}>
                                    {selectedActor.nivel}
                                </span>
                                <h3 className="text-lg font-bold text-white mt-1">
                                    {selectedActor.entidad}
                                </h3>
                            </div>
                        </div>

                        <div className="space-y-3 text-xs text-slate-300">
                            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                                <strong className="text-slate-400 block font-mono">Base Legal Obligatoria:</strong>
                                <span className="text-white font-mono">{selectedActor.base_legal}</span>
                            </div>

                            <div>
                                <strong className="text-slate-400 block font-mono mb-1">Rol Doctrinario y Competencia:</strong>
                                <p className="leading-relaxed">{selectedActor.rol_doctrinario}</p>
                            </div>

                            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                                <span className="text-slate-400 font-mono">Producto / Entregable Clave:</span>
                                <span className="font-mono font-bold text-cyan-300 bg-slate-900 px-2.5 py-1 rounded border border-slate-800">
                                    {selectedActor.entregable_clave}
                                </span>
                            </div>
                        </div>

                        <button
                            onClick={() => setSelectedActor(null)}
                            className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl transition"
                        >
                            Cerrar Ficha del Actor
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
