"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
    Building2,
    ShieldAlert,
    ShieldCheck,
    AlertTriangle,
    Waves,
    Droplets,
    Activity,
    FileText,
    Download,
    CheckCircle2,
    RefreshCw,
    Search,
    Sliders,
    Zap,
    Scale,
    Users,
    Stethoscope,
    Calendar,
    ChevronRight,
    Lock,
    ExternalLink,
    Clock,
    Flame,
    Radio,
    Printer,
    Phone,
    MapPin,
    Home,
    Truck,
    Sparkles
} from "lucide-react";
import RadarViewerModal from "@/components/RadarViewerModal";
import CopilotoTacticoPiuraModal from "@/components/CopilotoTacticoPiuraModal";

interface CuencaCiega {
    id: string;
    nombre: string;
    distrito: string;
    ubigeo: string;
    coordenadas: { latitud: number; longitud: number };
    cota_topografica_msnm: number;
    poblacion_afectada_directa: number;
    viviendas_expuestas: number;
    volumen_maximo_m3: number;
    sistema_evacuacion: string;
    punto_descarga: string;
    longitud_linea_impulsion_metros: number;
    tiempo_evacuacion_nominal_horas: number;
    estado_operativo: string;
    vulnerabilidad_adicional: string;
}

interface DistritoAuditoria {
    ubigeo: string;
    distrito: string;
    pim_pp0068_pen: number;
    ejecutado_pen: number;
    avance_pct: number;
    estado_contraloria: string;
}

interface EstablecimientoSalud {
    id: string;
    nombre: string;
    distrito: string;
    provincia: string;
    categoria: string;
    poblacion_adscrita: number;
    capacidad_uviclin: number;
    vulnerabilidad_hidrica: string;
    cadena_frio_respaldo: string;
    ruta_referencia_evacuacion: string;
}

export default function PiuraContingencyPage() {
    const [activeTab, setActiveTab] = useState<"cuencas" | "contraloria" | "udep_100dias" | "salud" | "planes_distritales">("cuencas");
    const [loading, setLoading] = useState<boolean>(true);
    const [planData, setPlanData] = useState<any>(null);
    const [cuencas, setCuencas] = useState<CuencaCiega[]>([]);
    const [auditoriaData, setAuditoriaData] = useState<any>(null);
    const [saludData, setSaludData] = useState<any>(null);
    const [transferenciaData, setTransferenciaData] = useState<any>(null);
    const [planesDistritales, setPlanesDistritales] = useState<any[]>([]);
    const [selectedPlanDistrital, setSelectedPlanDistrital] = useState<any>(null);

    // Estados de simulación interactiva
    const [lluviaSimulada, setLluviaSimulada] = useState<number>(65);
    const [cuencaSeleccionada, setCuencaSeleccionada] = useState<string>("CC-PIU-01");
    const [simulacionResultado, setSimulacionResultado] = useState<any>(null);
    const [selectedUbigeoCert, setSelectedUbigeoCert] = useState<string>("200101");
    const [certificadoSha256, setCertificadoSha256] = useState<any>(null);
    const [radarModalOpen, setRadarModalOpen] = useState<boolean>(false);
    const [copilotoModalOpen, setCopilotoModalOpen] = useState<boolean>(false);

    const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

    useEffect(() => {
        fetchPlanData();
    }, []);

    const fetchPlanData = async () => {
        setLoading(true);
        try {
            const [rPlan, rCuencas, rAudit, rSalud, rTrans, rPlanesDist] = await Promise.all([
                fetch(`${API_BASE}/api/v1/piura/contingencia/plan-integral`).then(r => r.json()).catch(() => null),
                fetch(`${API_BASE}/api/v1/piura/cuencas-ciegas`).then(r => r.json()).catch(() => ({ cuencas_ciegas_criticas: [] })),
                fetch(`${API_BASE}/api/v1/piura/contingencia/auditoria-pp0068`).then(r => r.json()).catch(() => null),
                fetch(`${API_BASE}/api/v1/piura/contingencia/salud-dsrslcc`).then(r => r.json()).catch(() => null),
                fetch(`${API_BASE}/api/v1/piura/contingencia/transferencia-2026`).then(r => r.json()).catch(() => null),
                fetch(`${API_BASE}/api/v1/planes/piura/distritales`).then(r => r.json()).catch(() => []),
            ]);

            setPlanData(rPlan);
            setCuencas(rCuencas?.cuencas_ciegas_criticas || []);
            setAuditoriaData(rAudit);
            setSaludData(rSalud);
            setTransferenciaData(rTrans);
            if (Array.isArray(rPlanesDist) && rPlanesDist.length > 0) {
                setPlanesDistritales(rPlanesDist);
                setSelectedPlanDistrital(rPlanesDist[0]);
            }

            // Simular primer resultado
            ejecutarSimulacion("CC-PIU-01", 65);
            generarCertificado("200101");
        } catch (err) {
            console.error("Error cargando datos de contingencia Piura:", err);
        } finally {
            setLoading(false);
        }
    };

    const ejecutarSimulacion = async (cuencaId: string, mm: number) => {
        try {
            const res = await fetch(`${API_BASE}/api/v1/piura/cuencas-ciegas/simulacion?cuenca_id=${cuencaId}&milimetros_lluvia=${mm}`);
            const data = await res.json();
            setSimulacionResultado(data);
        } catch (e) {
            console.error(e);
        }
    };

    const generarCertificado = async (ubigeo: string) => {
        try {
            const res = await fetch(`${API_BASE}/api/v1/piura/contingencia/blindaje-contraloria?ubigeo=${ubigeo}`);
            const data = await res.json();
            setCertificadoSha256(data);
        } catch (e) {
            console.error(e);
        }
    };

    const handleLluviaChange = (val: number) => {
        setLluviaSimulada(val);
        ejecutarSimulacion(cuencaSeleccionada, val);
    };

    const handleCuencaSelect = (id: string) => {
        setCuencaSeleccionada(id);
        ejecutarSimulacion(id, lluviaSimulada);
    };

    const handleUbigeoCertSelect = (ubigeo: string) => {
        setSelectedUbigeoCert(ubigeo);
        generarCertificado(ubigeo);
    };

    return (
        <div className="space-y-6 max-w-7xl mx-auto pb-16">
            {/* ENCABEZADO C2 PIURA */}
            <div className="bg-gradient-to-r from-slate-900 via-indigo-950/80 to-slate-900 p-6 rounded-2xl border border-indigo-500/30 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
                
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1">
                                <Building2 className="w-3 h-3" /> MUNICIPALIDAD PROVINCIAL DE PIURA
                            </span>
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                                <ShieldCheck className="w-3 h-3" /> PROTOCOLO CUSTODIA ISO 27037
                            </span>
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-500/20 text-red-300 border border-red-500/30 flex items-center gap-1 animate-pulse">
                                <Flame className="w-3 h-3" /> FEN 2026-2027
                            </span>
                        </div>
                        <h1 className="text-3xl font-extrabold text-white tracking-tight">
                            Consola Táctica Provincial del Plan de Contingencia FEN
                        </h1>
                        <p className="text-sm text-slate-300 mt-1 max-w-3xl">
                            Integración soberana de la doctrina UDEP (Prof. Chang Chuyes), el blindaje criptográfico ante Contraloría (PP 0068), el plan sanitario de la DIRESA / DSRSLCC y el Gemelo Digital de Cuencas Ciegas SARE.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5">
                        <button
                            onClick={() => setCopilotoModalOpen(true)}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-sm font-bold transition-all shadow-lg shadow-emerald-600/30 border border-emerald-400/40 animate-pulse"
                        >
                            <Sparkles className="w-4 h-4 text-emerald-200" />
                            Copiloto Táctico (Vertex AI)
                        </button>

                        <button
                            onClick={() => setRadarModalOpen(true)}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-sm font-semibold transition-all shadow-lg shadow-sky-600/30 border border-sky-400/30"
                        >
                            <Radio className="w-4 h-4 text-sky-200 animate-pulse" />
                            Radar Doppler SENAMHI (Nowcasting)
                        </button>

                        <button
                            onClick={fetchPlanData}
                            disabled={loading}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-all shadow-lg shadow-indigo-600/30"
                        >
                            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                            Sincronizar C2
                        </button>
                    </div>
                </div>

                {/* 4 KPIs EJECUTIVOS */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                    <div className="bg-slate-900/80 backdrop-blur-md p-4 rounded-xl border border-indigo-500/20">
                        <div className="flex items-center justify-between text-xs text-slate-400">
                            <span>COBERTURA CANÓNICA</span>
                            <ShieldCheck className="w-4 h-4 text-emerald-400" />
                        </div>
                        <div className="text-2xl font-bold text-white mt-1">
                            {planData?.cobertura_global_plan_contingencia_pct || 93.1}%
                        </div>
                        <div className="text-[11px] text-emerald-400 mt-0.5">8 Bloques INDECI Completos</div>
                    </div>

                    <div className="bg-slate-900/80 backdrop-blur-md p-4 rounded-xl border border-indigo-500/20">
                        <div className="flex items-center justify-between text-xs text-slate-400">
                            <span>AFORO RÍO PIURA</span>
                            <Waves className="w-4 h-4 text-amber-400" />
                        </div>
                        <div className="text-2xl font-bold text-amber-400 mt-1">
                            1,850 m³/s
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">Pte. Sánchez Cerro (Alerta Naranja)</div>
                    </div>

                    <div className="bg-slate-900/80 backdrop-blur-md p-4 rounded-xl border border-indigo-500/20">
                        <div className="flex items-center justify-between text-xs text-slate-400">
                            <span>CUENCAS CIEGAS SARE</span>
                            <Droplets className="w-4 h-4 text-cyan-400" />
                        </div>
                        <div className="text-2xl font-bold text-white mt-1">
                            96 Depresiones
                        </div>
                        <div className="text-[11px] text-cyan-400 mt-0.5">6 Críticas Monitoreadas</div>
                    </div>

                    <div className="bg-slate-900/80 backdrop-blur-md p-4 rounded-xl border border-indigo-500/20">
                        <div className="flex items-center justify-between text-xs text-slate-400">
                            <span>SALVAGUARDA 100 DÍAS</span>
                            <Lock className="w-4 h-4 text-purple-400" />
                        </div>
                        <div className="text-2xl font-bold text-purple-300 mt-1 font-mono">
                            {transferenciaData?.hash_sha256_forense ? transferenciaData.hash_sha256_forense.substring(0, 8) : "4A9D61F7"}...
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">Hash SHA-256 RFC 3161</div>
                    </div>
                </div>
            </div>

            {/* SELECTOR DE PESTAÑAS */}
            <div className="flex flex-wrap border-b border-slate-800 bg-slate-900/40 p-1 rounded-xl gap-1">
                <button
                    onClick={() => setActiveTab("cuencas")}
                    className={`flex-1 min-w-[180px] py-3 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                        activeTab === "cuencas"
                            ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                            : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                    }`}
                >
                    <Droplets className="w-4 h-4 text-cyan-400" />
                    1. Cuencas Ciegas & SARE
                </button>

                <button
                    onClick={() => setActiveTab("contraloria")}
                    className={`flex-1 min-w-[180px] py-3 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                        activeTab === "contraloria"
                            ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                            : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                    }`}
                >
                    <Scale className="w-4 h-4 text-amber-400" />
                    2. Blindaje PP 0068 (OCI)
                </button>

                <button
                    onClick={() => setActiveTab("udep_100dias")}
                    className={`flex-1 min-w-[180px] py-3 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                        activeTab === "udep_100dias"
                            ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                            : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                    }`}
                >
                    <Building2 className="w-4 h-4 text-emerald-400" />
                    3. Doctrina UDEP & 100 Días
                </button>

                <button
                    onClick={() => setActiveTab("salud")}
                    className={`flex-1 min-w-[180px] py-3 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                        activeTab === "salud"
                            ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                            : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                    }`}
                >
                    <Stethoscope className="w-4 h-4 text-rose-400" />
                    4. Red Sanitaria & Dengue
                </button>

                <button
                    onClick={() => setActiveTab("planes_distritales")}
                    className={`flex-1 min-w-[200px] py-3 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                        activeTab === "planes_distritales"
                            ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/30"
                            : "text-slate-300 hover:text-white hover:bg-slate-800/60 border border-emerald-500/20"
                    }`}
                >
                    <FileText className="w-4 h-4 text-emerald-300" />
                    5. Planes Distritales (El Tallán, Catacaos, etc.)
                </button>
            </div>

            {/* CONTENIDO TAB 1: CUENCAS CIEGAS & SARE */}
            {activeTab === "cuencas" && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* LISTA DE CUENCAS CRÍTICAS */}
                    <div className="lg:col-span-2 space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                <Droplets className="w-5 h-5 text-cyan-400" />
                                Catastro de Cuencas Ciegas Críticas de Piura y Castilla
                            </h2>
                            <span className="text-xs text-slate-400">Total: 96 depresiones urbanas</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {cuencas.map((c) => {
                                const isSelected = cuencaSeleccionada === c.id;
                                return (
                                    <div
                                        key={c.id}
                                        onClick={() => handleCuencaSelect(c.id)}
                                        className={`p-4 rounded-xl border cursor-pointer transition-all ${
                                            isSelected
                                                ? "bg-indigo-950/60 border-indigo-500 shadow-xl shadow-indigo-500/10"
                                                : "bg-slate-900/60 border-slate-800 hover:border-slate-700"
                                        }`}
                                    >
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                                                    {c.id} • UBIGEO {c.ubigeo}
                                                </span>
                                                <h3 className="text-base font-bold text-white mt-1">{c.nombre}</h3>
                                                <p className="text-xs text-indigo-300 font-medium">{c.distrito}</p>
                                            </div>
                                            <span
                                                className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                                                    c.estado_operativo === "OPERATIVO"
                                                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                                        : c.estado_operativo === "OPERATIVO_ALERTA"
                                                        ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                                                        : "bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse"
                                                }`}
                                            >
                                                {c.estado_operativo}
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-800 text-xs">
                                            <div>
                                                <span className="text-slate-400 block">Población Expuesta:</span>
                                                <span className="font-semibold text-white">{c.poblacion_afectada_directa.toLocaleString()} hab.</span>
                                            </div>
                                            <div>
                                                <span className="text-slate-400 block">Volumen Máx:</span>
                                                <span className="font-semibold text-white">{c.volumen_maximo_m3.toLocaleString()} m³</span>
                                            </div>
                                            <div className="col-span-2">
                                                <span className="text-slate-400 block">Sistema Evacuación:</span>
                                                <span className="text-slate-200 text-[11px] line-clamp-1">{c.sistema_evacuacion}</span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* PANEL DE SIMULACIÓN EN TIEMPO REAL */}
                    <div className="bg-slate-900/80 p-5 rounded-xl border border-slate-800 space-y-4">
                        <h3 className="text-base font-bold text-white flex items-center gap-2">
                            <Sliders className="w-5 h-5 text-indigo-400" />
                            Simulador Hidrocinético SARE
                        </h3>
                        <p className="text-xs text-slate-300">
                            Ajuste la precipitación pronosticada para calcular el volumen embalsado y las horas de motobombeo necesarias.
                        </p>

                        <div className="space-y-2 pt-2">
                            <div className="flex justify-between text-xs">
                                <span className="text-slate-400">Precipitación 24h:</span>
                                <span className="text-indigo-400 font-bold font-mono">{lluviaSimulada} mm</span>
                            </div>
                            <input
                                type="range"
                                min={10}
                                max={150}
                                step={5}
                                value={lluviaSimulada}
                                onChange={(e) => handleLluviaChange(Number(e.target.value))}
                                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                            />
                            <div className="flex justify-between text-[10px] text-slate-500">
                                <span>10 mm (Leve)</span>
                                <span>60 mm (Lluvia FEN)</span>
                                <span>150 mm (Extrema 1998)</span>
                            </div>
                        </div>

                        {simulacionResultado && (
                            <div className="p-4 rounded-xl bg-slate-950/80 border border-indigo-500/30 space-y-3 mt-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-white">{simulacionResultado.nombre}</span>
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                                        simulacionResultado.estado_simulado === "CRITICO_DESBORDE"
                                            ? "bg-red-500/20 text-red-400 border border-red-500/30"
                                            : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                                    }`}>
                                        {simulacionResultado.estado_simulado}
                                    </span>
                                </div>

                                <div className="space-y-1 text-xs">
                                    <div className="flex justify-between">
                                        <span className="text-slate-400">Volumen Embalsado:</span>
                                        <span className="font-bold text-cyan-300">{simulacionResultado.volumen_embalsado_m3?.toLocaleString()} m³</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-400">Capacidad Total:</span>
                                        <span className="text-slate-300">{simulacionResultado.capacidad_total_m3?.toLocaleString()} m³</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-400">% Saturación:</span>
                                        <span className="font-bold text-amber-400">{simulacionResultado.porcentaje_ocupacion_cuenca}%</span>
                                    </div>
                                </div>

                                <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                                    <div
                                        className="bg-indigo-500 h-2 rounded-full transition-all duration-300"
                                        style={{ width: `${Math.min(100, simulacionResultado.porcentaje_ocupacion_cuenca || 0)}%` }}
                                    />
                                </div>

                                <div className="p-3 bg-indigo-950/40 rounded-lg border border-indigo-500/20 space-y-1 text-xs">
                                    <div className="flex items-center gap-1.5 text-indigo-300 font-semibold">
                                        <Clock className="w-3.5 h-3.5" /> Tiempo Estimado Bombeo SARE:
                                    </div>
                                    <div className="text-xl font-black text-white">
                                        {simulacionResultado.tiempo_estimado_bombeo_horas} Horas
                                    </div>
                                    <p className="text-[10px] text-slate-400">
                                        Descarga hacia: <span className="text-slate-200">{simulacionResultado.punto_descarga}</span>
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* CONTENIDO TAB 2: CONTRALORÍA & PP 0068 */}
            {activeTab === "contraloria" && (
                <div className="space-y-6">
                    {/* RESUMEN CONTRALORÍA */}
                    <div className="bg-gradient-to-r from-red-950/40 via-slate-900 to-slate-900 p-5 rounded-xl border border-red-500/30">
                        <div className="flex items-start justify-between">
                            <div>
                                <span className="text-xs font-bold text-red-400 tracking-wider uppercase flex items-center gap-1">
                                    <AlertTriangle className="w-3.5 h-3.5" /> Alerta de Control Concurrente • Contraloría General
                                </span>
                                <h3 className="text-xl font-bold text-white mt-1">
                                    Inejecución Crítica del Programa Presupuestal 0068 en Piura
                                </h3>
                                <p className="text-xs text-slate-300 mt-1 max-w-2xl">
                                    Distritos en inminente riesgo por El Niño presentan ejecución de 0% a niveles ínfimos debido al temor a investigaciones fiscales y falta de fichas de ingeniería.
                                </p>
                            </div>
                            <div className="text-right">
                                <span className="text-xs text-slate-400">Avance Global Ponderado:</span>
                                <div className="text-2xl font-black text-red-400">
                                    {auditoriaData?.avance_global_ponderado_pct || 15.6}%
                                </div>
                                <span className="text-[10px] text-slate-400">Saldo: S/ {(auditoriaData?.saldo_por_ejecutar_pen || 27000000).toLocaleString()} PEN</span>
                            </div>
                        </div>
                    </div>

                    {/* TABLA DE DISTRITOS AUDITADOS */}
                    <div className="bg-slate-900/80 rounded-xl border border-slate-800 overflow-hidden">
                        <table className="w-full text-xs text-left">
                            <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider font-mono border-b border-slate-800">
                                <tr>
                                    <th className="p-3.5">UBIGEO</th>
                                    <th className="p-3.5">Distrito</th>
                                    <th className="p-3.5 text-right">PIM PP 0068</th>
                                    <th className="p-3.5 text-right">Ejecutado</th>
                                    <th className="p-3.5 text-center">% Avance</th>
                                    <th className="p-3.5">Alerta OCI</th>
                                    <th className="p-3.5 text-center">Acción Blindaje</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800 text-slate-300">
                                {auditoriaData?.distritos?.map((d: DistritoAuditoria) => (
                                    <tr key={d.ubigeo} className="hover:bg-slate-800/40 transition-colors">
                                        <td className="p-3.5 font-mono text-indigo-400">{d.ubigeo}</td>
                                        <td className="p-3.5 font-bold text-white">{d.distrito}</td>
                                        <td className="p-3.5 text-right font-mono">S/ {d.pim_pp0068_pen.toLocaleString()}</td>
                                        <td className="p-3.5 text-right font-mono text-emerald-400">S/ {d.ejecutado_pen.toLocaleString()}</td>
                                        <td className="p-3.5 text-center font-bold">
                                            <span className={`px-2 py-0.5 rounded ${
                                                d.avance_pct === 0
                                                    ? "bg-red-500/20 text-red-400 border border-red-500/30"
                                                    : d.avance_pct < 20
                                                    ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                                                    : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                            }`}>
                                                {d.avance_pct}%
                                            </span>
                                        </td>
                                        <td className="p-3.5 font-semibold text-[11px] text-red-400">{d.estado_contraloria}</td>
                                        <td className="p-3.5 text-center">
                                            <button
                                                onClick={() => handleUbigeoCertSelect(d.ubigeo)}
                                                className="px-2.5 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-[10px] transition-all"
                                            >
                                                Ver Certificado SHA-256
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* CERTIFICADO PERICIAL CRIPTOGRÁFICO */}
                    {certificadoSha256 && (
                        <div className="p-5 rounded-xl bg-slate-900 border border-indigo-500/40 space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <ShieldCheck className="w-5 h-5 text-emerald-400" />
                                    <h4 className="text-base font-bold text-white">
                                        Dictamen Pericial de Contratación Directa • Art. 27 Ley 30225
                                    </h4>
                                </div>
                                <span className="font-mono text-[10px] bg-slate-950 px-3 py-1 rounded border border-slate-800 text-slate-400">
                                    FIRMA SHA-256: <span className="text-indigo-300 font-bold">{certificadoSha256.firma_sha256_oci}</span>
                                </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs bg-slate-950 p-4 rounded-lg border border-slate-800">
                                <div>
                                    <span className="text-slate-400 block">Distrito / Entidad:</span>
                                    <span className="font-bold text-white">{certificadoSha256.certificado_pericial?.distrito} (UBIGEO {certificadoSha256.certificado_pericial?.ubigeo})</span>
                                </div>
                                <div>
                                    <span className="text-slate-400 block">Procedimiento Autorizado:</span>
                                    <span className="font-bold text-emerald-400">{certificadoSha256.certificado_pericial?.tipo_procedimiento}</span>
                                </div>
                                <div className="col-span-2">
                                    <span className="text-slate-400 block">Obras Prioritarias Desbloqueadas:</span>
                                    <ul className="list-disc list-inside mt-1 text-slate-200">
                                        {certificadoSha256.certificado_pericial?.obras_prioritarias_declaradas?.map((o: string, idx: number) => (
                                            <li key={idx}>{o}</li>
                                        ))}
                                    </ul>
                                </div>
                                <div className="col-span-2">
                                    <span className="text-slate-400 block">Garantía de Control Concurrente OCI:</span>
                                    <p className="text-slate-300 text-[11px] mt-0.5">
                                        {certificadoSha256.certificado_pericial?.garantia_control_concurrente}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* CONTENIDO TAB 3: DOCTRINA UDEP & 100 DÍAS */}
            {activeTab === "udep_100dias" && (
                <div className="space-y-6">
                    <div className="bg-slate-900/80 p-5 rounded-xl border border-indigo-500/30">
                        <div className="flex items-start justify-between">
                            <div>
                                <span className="text-xs font-bold text-indigo-400 flex items-center gap-1">
                                    <Building2 className="w-3.5 h-3.5" /> Universidad de Piura (UDEP) • Facultad de Derecho
                                </span>
                                <h3 className="text-xl font-bold text-white mt-1">
                                    Doctrina de Normalización del FEN & Salvaguarda de los 100 Días
                                </h3>
                                <p className="text-xs text-slate-300 mt-1 max-w-3xl">
                                    Análisis del Prof. Guillermo Chang Chuyes: Los desastres no respetan el recambio de mandato del 31 de diciembre de 2026. Se requiere pre-comprometer partidas y estandarizar ordenanzas para evitar el colapso municipal.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* CLÁUSULAS DE CONTINUIDAD */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {transferenciaData?.detalles?.clausulas_continuidad_obligatorias?.map((c: any) => (
                            <div key={c.codigo} className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                                        {c.codigo}
                                    </span>
                                    <h4 className="text-sm font-bold text-white">{c.titulo}</h4>
                                </div>
                                <p className="text-xs text-slate-300">{c.descripcion}</p>
                            </div>
                        ))}
                    </div>

                    {/* PROYECTOS DE ORDENANZAS MUNICIPALES */}
                    <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
                        <h4 className="text-base font-bold text-white flex items-center gap-2">
                            <FileText className="w-5 h-5 text-amber-400" />
                            Proyectos de Ordenanza Municipal de Aprobación Inmediata
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
                                <span className="text-[10px] font-mono text-amber-400 font-bold">ORD-MUN-PIURA-01</span>
                                <h5 className="text-sm font-bold text-white">Declaratoria de Temporada Pluvial Ordinaria Anual</h5>
                                <p className="text-xs text-slate-400">
                                    Fija entre el 1 de agosto y el 30 de noviembre la limpieza obligatoria de drenes y quebradas con presupuesto intangible del 8% de recursos ordinarios.
                                </p>
                            </div>

                            <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
                                <span className="text-[10px] font-mono text-amber-400 font-bold">ORD-MUN-PIURA-02</span>
                                <h5 className="text-sm font-bold text-white">Congelamiento Catastral de Fajas Marginales y Cuencas Ciegas</h5>
                                <p className="text-xs text-slate-400">
                                    Prohíbe licencias de edificación y constancias de posesión en las 96 cuencas ciegas inventariadas e impone faja marginal de 50 metros desde la cota histórica de 1998.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* CONTENIDO TAB 4: RED SANITARIA & DENGUE */}
            {activeTab === "salud" && (
                <div className="space-y-6">
                    <div className="bg-slate-900/80 p-5 rounded-xl border border-emerald-500/30">
                        <div className="flex items-start justify-between">
                            <div>
                                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                                    <Stethoscope className="w-3.5 h-3.5" /> R.D. N° 1649-2026-DRSP (DIRESA) • DSRSLCC Sullana
                                </span>
                                <h3 className="text-xl font-bold text-white mt-1">
                                    Plan Regional de Contingencia Sanitaria & Anillos de Contención
                                </h3>
                                <p className="text-xs text-slate-300 mt-1 max-w-3xl">
                                    Descentralización hacia postas I-3 y I-4, puente aéreo médico con la FAP y modelo predictivo de control vectorial del dengue.
                                </p>
                            </div>
                            <div className="text-right">
                                <span className="text-xs text-slate-400">Camas UVICLIN Requeridas:</span>
                                <div className="text-2xl font-black text-amber-400">
                                    {saludData?.indicadores_capacidad_sanitaria?.camas_uviclin_requeridas_escenario_fen || 380}
                                </div>
                                <span className="text-[10px] text-slate-400">Disponibles: {saludData?.indicadores_capacidad_sanitaria?.camas_uviclin_disponibles || 140}</span>
                            </div>
                        </div>
                    </div>

                    {/* RED DE ESTABLECIMIENTOS PRIORITARIOS */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {saludData?.establecimientos_prioritarios_contingencia?.map((es: EstablecimientoSalud) => (
                            <div key={es.id} className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                                <div className="flex items-start justify-between">
                                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-indigo-300">
                                        {es.categoria}
                                    </span>
                                    <span className="text-[10px] text-emerald-400 font-semibold">{es.distrito}</span>
                                </div>
                                <h4 className="text-sm font-bold text-white">{es.nombre}</h4>
                                <p className="text-xs text-slate-400">{es.vulnerabilidad_hidrica}</p>
                                
                                <div className="pt-2 border-t border-slate-800 text-xs space-y-1">
                                    <div className="flex justify-between">
                                        <span className="text-slate-500">Camas UVICLIN:</span>
                                        <span className="font-bold text-white">{es.capacidad_uviclin}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-500">Cadena de Frío:</span>
                                        <span className="text-slate-300">{es.cadena_frio_respaldo}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* MODELO EPIDEMIOLÓGICO DE DENGUE */}
                    <div className="p-5 rounded-xl bg-slate-900 border border-indigo-500/30 space-y-3">
                        <h4 className="text-base font-bold text-white flex items-center gap-2">
                            <Flame className="w-5 h-5 text-red-400" />
                            Modelo de Alerta Preventiva de Brote de Dengue Post-Impacto
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
                            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                                <span className="text-slate-400 block">Vector Principal:</span>
                                <span className="font-bold text-white">Aedes aegypti</span>
                            </div>
                            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                                <span className="text-slate-400 block">Días hasta Eclosión:</span>
                                <span className="font-bold text-amber-400">7 a 10 Días Post-Lluvia</span>
                            </div>
                            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                                <span className="text-slate-400 block">Pico de Hospitalizaciones:</span>
                                <span className="font-bold text-red-400">Semanas 2 a 6 Post-Lluvia</span>
                            </div>
                            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                                <span className="text-slate-400 block">Medida Inmediata:</span>
                                <span className="font-bold text-emerald-400">Fumigación Térmica Día 5</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* CONTENIDO TAB 5: PLANES DISTRITALES DE PIURA (EPICENTRO FEN) */}
            {activeTab === "planes_distritales" && (
                <div className="space-y-6">
                    {/* BANNER ENLACE C2 CONSOLA NACIONAL */}
                    <div className="bg-gradient-to-r from-emerald-950/70 via-slate-900 to-indigo-950/70 border border-emerald-500/30 rounded-2xl p-5 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                                    RED REGIONAL DE PLANES DIGITALES FEN
                                </span>
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                                    RESUMEN TÁCTICO EN 1 PÁGINA
                                </span>
                            </div>
                            <h3 className="text-xl font-bold text-white tracking-tight">
                                Catálogo de Planes de Contingencia y Prevención de Piura
                            </h3>
                            <p className="text-xs text-slate-300 mt-1 max-w-2xl">
                                Protocolos tácticos estandarizados para El Tallán (2026-2027), Catacaos, Sechura, Ayabaca y cuencas afluentes del Río Piura y Chira.
                            </p>
                        </div>

                        <Link
                            href="/planes"
                            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold transition-all shadow-lg shadow-emerald-900/40 border border-emerald-400/30 whitespace-nowrap"
                        >
                            <span>Consola Nacional de Planes</span>
                            <ExternalLink className="w-4 h-4 text-emerald-200" />
                        </Link>
                    </div>

                    {/* SELECTOR RÁPIDO DE PLANES DISTRITALES */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        {planesDistritales.map((p) => {
                            const isSelected = selectedPlanDistrital?.id_plan === p.id_plan;
                            return (
                                <button
                                    key={p.id_plan}
                                    onClick={() => setSelectedPlanDistrital(p)}
                                    className={`p-4 rounded-xl text-left border transition-all ${
                                        isSelected
                                            ? "bg-slate-900 border-emerald-500 ring-2 ring-emerald-500/30 shadow-lg shadow-emerald-950/50"
                                            : "bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40"
                                    }`}
                                >
                                    <div className="flex items-center justify-between text-[10px] mb-2">
                                        <span className="font-mono text-emerald-400 font-bold">{p.ubigeo || "PIURA"}</span>
                                        <span className="px-2 py-0.5 rounded-full font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                            {p.periodo_vigencia}
                                        </span>
                                    </div>
                                    <h4 className="text-sm font-bold text-white line-clamp-1">{p.distrito || p.entidad}</h4>
                                    <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">{p.titulo_oficial}</p>
                                    <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
                                        <span>Gatillo: <strong className="text-amber-400">{p.escenario_riesgo?.lluvia_gatillo_24h_mm || 40} mm</strong></span>
                                        <span className="text-emerald-400 font-semibold">{isSelected ? "Activo" : "Ver Ficha"}</span>
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    {/* FICHA TÁCTICA RESUMIDA EN 1 PÁGINA (ACCIÓN DE CHOQUE 0-4H) */}
                    {selectedPlanDistrital && (
                        <div className="bg-slate-900/90 border border-emerald-500/30 rounded-2xl p-6 shadow-2xl space-y-6">
                            {/* ENCABEZADO DE LA FICHA */}
                            <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-slate-800 gap-4">
                                <div>
                                    <div className="flex flex-wrap items-center gap-2 mb-2">
                                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                                            FICHA TÁCTICA AMARU • ACCIÓN INMEDIATA
                                        </span>
                                        <span className="px-2 py-0.5 rounded text-xs font-mono bg-slate-800 text-slate-300">
                                            {selectedPlanDistrital.id_plan}
                                        </span>
                                        <span className="px-2 py-0.5 rounded text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                            {selectedPlanDistrital.acto_resolutivo}
                                        </span>
                                    </div>
                                    <h2 className="text-2xl font-black text-white">
                                        {selectedPlanDistrital.titulo_oficial}
                                    </h2>
                                    <div className="text-xs text-slate-400 mt-1 flex items-center gap-2">
                                        <Building2 className="w-3.5 h-3.5 text-emerald-400" />
                                        <span>{selectedPlanDistrital.entidad}</span>
                                        <span>•</span>
                                        <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                                        <span>{selectedPlanDistrital.distrito || selectedPlanDistrital.provincia}, {selectedPlanDistrital.departamento}</span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => window.print()}
                                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors shadow-sm"
                                    >
                                        <Printer className="w-4 h-4 text-emerald-400" />
                                        Imprimir Ficha (1 Página)
                                    </button>
                                </div>
                            </div>

                            {/* RESUMEN EJECUTIVO */}
                            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block mb-1">
                                    Resumen Operativo de la Autoridad
                                </span>
                                <p className="text-xs text-slate-200 leading-relaxed">
                                    {selectedPlanDistrital.resumen_ejecutivo}
                                </p>
                            </div>

                            {/* 3 BLOQUES TÁCTICOS FUNDAMENTALES */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                {/* BLOQUE 1: ESCENARIO Y GATILLOS */}
                                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
                                    <div className="flex items-center justify-between text-xs text-slate-400">
                                        <span className="font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                                            <AlertTriangle className="w-4 h-4" />
                                            1. Umbrales Gatillo
                                        </span>
                                        <span className="text-[10px] px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-bold">
                                            PELIGRO {selectedPlanDistrital.escenario_riesgo?.nivel_peligro}
                                        </span>
                                    </div>
                                    
                                    <div className="text-xs text-slate-300 font-semibold">
                                        {selectedPlanDistrital.escenario_riesgo?.peligro_asociado}
                                    </div>

                                    <div className="grid grid-cols-2 gap-2 text-xs pt-2">
                                        <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                                            <span className="text-[10px] text-slate-500 block">Lluvia Gatillo 24h</span>
                                            <span className="text-base font-bold text-amber-400">
                                                &gt; {selectedPlanDistrital.escenario_riesgo?.lluvia_gatillo_24h_mm} mm
                                            </span>
                                        </div>
                                        <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                                            <span className="text-[10px] text-slate-500 block">Caudal Crítico</span>
                                            <span className="text-base font-bold text-cyan-400">
                                                {selectedPlanDistrital.escenario_riesgo?.caudal_critico_m3s ? `${selectedPlanDistrital.escenario_riesgo.caudal_critico_m3s} m³/s` : "N/A"}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="text-xs space-y-1 pt-1 text-slate-400">
                                        <div className="flex justify-between">
                                            <span>Población Expuesta:</span>
                                            <strong className="text-white">{(selectedPlanDistrital.escenario_riesgo?.poblacion_expuesta || 0).toLocaleString()} hab.</strong>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Viviendas en Riesgo:</span>
                                            <strong className="text-white">{(selectedPlanDistrital.escenario_riesgo?.viviendas_expuestas || 0).toLocaleString()}</strong>
                                        </div>
                                    </div>
                                </div>

                                {/* BLOQUE 2: CADENA DE MANDO C2 Y TELEFONÍA */}
                                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
                                    <div className="flex items-center justify-between text-xs text-slate-400">
                                        <span className="font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                                            <ShieldAlert className="w-4 h-4" />
                                            2. Cadena Mando C2 (24/7)
                                        </span>
                                    </div>

                                    <div className="space-y-2 text-xs">
                                        <div>
                                            <span className="text-[10px] text-slate-500 block">Presidente GT-GRD:</span>
                                            <strong className="text-white block font-medium">
                                                {selectedPlanDistrital.cadena_mando_c2?.presidente_gtgrd}
                                            </strong>
                                        </div>
                                        <div>
                                            <span className="text-[10px] text-slate-500 block">Secretaría Técnica / COEL:</span>
                                            <span className="text-slate-300 block">
                                                {selectedPlanDistrital.cadena_mando_c2?.secretaria_tecnica_coel}
                                            </span>
                                        </div>
                                        <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
                                            <div className="flex items-center gap-2 text-emerald-400 font-mono font-bold">
                                                <Phone className="w-3.5 h-3.5" />
                                                <span>{selectedPlanDistrital.cadena_mando_c2?.telefono_emergencia}</span>
                                            </div>
                                            {selectedPlanDistrital.cadena_mando_c2?.frecuencia_radial_vhf && (
                                                <div className="flex items-center gap-2 text-cyan-300 font-mono text-[11px]">
                                                    <Radio className="w-3.5 h-3.5" />
                                                    <span>{selectedPlanDistrital.cadena_mando_c2.frecuencia_radial_vhf}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* BLOQUE 3: CAPACIDAD LOGÍSTICA */}
                                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
                                    <div className="flex items-center justify-between text-xs text-slate-400">
                                        <span className="font-bold uppercase tracking-wider text-sky-400 flex items-center gap-1.5">
                                            <Truck className="w-4 h-4" />
                                            3. Recursos de Choque
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2 text-xs">
                                        <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                                            <span className="text-[10px] text-slate-500 block">Motobombas</span>
                                            <span className="text-base font-bold text-white">
                                                {selectedPlanDistrital.recursos_disponibles?.motobombas_unidades || 0} unids.
                                            </span>
                                        </div>
                                        <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                                            <span className="text-[10px] text-slate-500 block">Sacos Terreros</span>
                                            <span className="text-base font-bold text-emerald-400">
                                                {(selectedPlanDistrital.recursos_disponibles?.sacos_terreros_stock || 0).toLocaleString()}
                                            </span>
                                        </div>
                                        <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                                            <span className="text-[10px] text-slate-500 block">Raciones BAH</span>
                                            <span className="text-base font-bold text-amber-400">
                                                {selectedPlanDistrital.recursos_disponibles?.raciones_alimentos_dias || 0} días
                                            </span>
                                        </div>
                                        <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                                            <span className="text-[10px] text-slate-500 block">Generadores</span>
                                            <span className="text-base font-bold text-cyan-400">
                                                {selectedPlanDistrital.recursos_disponibles?.generadores_electricos || 0} unids.
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* PROTOCOLO TÁCTICO DE CHOQUE INMEDIATO (0-4H) */}
                            <div className="p-5 rounded-xl bg-slate-950 border border-emerald-500/30 space-y-3">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                                        <Clock className="w-4 h-4 text-emerald-400" />
                                        Protocolo Táctico de Choque Inmediato (0 - 4 Horas)
                                    </h4>
                                    <span className="text-[10px] text-emerald-400 font-mono">EJECUCIÓN INMEDIATA POR EL ALCALDE</span>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {selectedPlanDistrital.protocolo_inmediato_0_4h?.map((paso: string, idx: number) => (
                                        <div key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-slate-900/80 border border-slate-800 text-xs">
                                            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                                            <span className="text-slate-200">{paso}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* PUNTOS CRÍTICOS Y ALBERGUES */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
                                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                                    <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block">
                                        Puntos Críticos Priorizados
                                    </span>
                                    <div className="space-y-2 text-xs">
                                        {selectedPlanDistrital.puntos_criticos_priorizados?.map((pt: any, i: number) => (
                                            <div key={i} className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                                                <div className="font-bold text-white">{pt.nombre}</div>
                                                <div className="text-[11px] text-rose-300 mt-0.5">Amenaza: {pt.tipo_amenaza}</div>
                                                <div className="text-[11px] text-emerald-400 mt-0.5">Acción: {pt.intervencion_inmediata}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                                    <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider block">
                                        Albergues y Zonas de Evacuación Segura
                                    </span>
                                    <div className="space-y-2 text-xs">
                                        {selectedPlanDistrital.albergues_temporales?.length > 0 ? (
                                            selectedPlanDistrital.albergues_temporales.map((alb: any, i: number) => (
                                                <div key={i} className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between">
                                                    <div>
                                                        <div className="font-bold text-white">{alb.nombre}</div>
                                                        <div className="text-[10px] text-slate-400">
                                                            Cota Segura: {alb.cota_segura ? "Sí" : "Verificar"} • Servicios: {alb.servicios_basicos ? "Operativos" : "Provisorios"}
                                                        </div>
                                                    </div>
                                                    <span className="px-2 py-1 rounded bg-slate-800 text-cyan-300 font-bold font-mono">
                                                        {alb.capacidad_personas} hab.
                                                    </span>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="p-4 text-center text-xs text-slate-500 italic">
                                                Este establecimiento coordina evacuación de pacientes hacia el corredor de salud del MINSA.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* MODAL RADAR METEOROLÓGICO SENAMHI BANDA C */}
            <RadarViewerModal
                isOpen={radarModalOpen}
                onClose={() => setRadarModalOpen(false)}
                initialLocalidad="PIU"
            />

            {/* MODAL COPILOTO TÁCTICO VERTEX AI SEARCH + TELEMETRÍA */}
            <CopilotoTacticoPiuraModal
                isOpen={copilotoModalOpen}
                onClose={() => setCopilotoModalOpen(false)}
                initialUbigeo="200101"
            />
        </div>
    );
}
