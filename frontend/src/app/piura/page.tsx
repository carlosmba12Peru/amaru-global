"use client";

import React, { useState, useEffect, useMemo } from "react";
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
    const [activeTab, setActiveTab] = useState<"cuencas" | "contraloria" | "udep_100dias" | "salud" | "planes_distritales" | "escudo_departamental" | "chulucanas_mercado">("chulucanas_mercado");
    const [loading, setLoading] = useState<boolean>(true);
    const [planData, setPlanData] = useState<any>(null);
    const [cuencas, setCuencas] = useState<CuencaCiega[]>([]);
    const [auditoriaData, setAuditoriaData] = useState<any>(null);
    const [saludData, setSaludData] = useState<any>(null);
    const [transferenciaData, setTransferenciaData] = useState<any>(null);
    const [planesDistritales, setPlanesDistritales] = useState<any[]>([]);
    const [selectedPlanDistrital, setSelectedPlanDistrital] = useState<any>(null);

    // Escudo Departamental y Costero (513 Puntos Críticos CENEPRED / ANA / SARE en 7 Regiones)
    const [departamentoActivo, setDepartamentoActivo] = useState<string>("PIURA");
    const [loadingDep, setLoadingDep] = useState<boolean>(false);
    const [catalogoDepartamental, setCatalogoDepartamental] = useState<any>(null);
    const [filtroProvincia, setFiltroProvincia] = useState<string>("TODAS");
    const [filtroFuente, setFiltroFuente] = useState<string>("TODAS");
    const [busquedaPuntoPiura, setBusquedaPuntoPiura] = useState<string>("");
    const [certLoadingPiura, setCertLoadingPiura] = useState<string | null>(null);
    const [certSuccessPiura, setCertSuccessPiura] = useState<Record<string, any>>({});

    const cambiarDepartamento = async (dep: string) => {
        setDepartamentoActivo(dep);
        setFiltroProvincia("TODAS");
        setLoadingDep(true);
        try {
            const res = await fetch(`${API_BASE}/api/v1/sigrid/departamental/${dep}`);
            if (res.ok) {
                const data = await res.json();
                setCatalogoDepartamental(data);
            }
        } catch (e) {
            console.error("Error cambiando departamento:", e);
        } finally {
            setLoadingDep(false);
        }
    };

    const handleCertificarPuntoPiura = async (pt: any) => {
        setCertLoadingPiura(pt.id);
        const depActor = (pt.departamento || departamentoActivo || "COSTA").toUpperCase().replace(/\s+/g, "_");
        try {
            const res = await fetch(`${API_BASE}/api/v1/sigrid/certificar-evento`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    actor: `COER_${depActor}_SALA_CRISIS`,
                    ubigeo: pt.ubigeo || "200101",
                    latitud: pt.latitud,
                    longitud: pt.longitud,
                    datos_evento: {
                        punto_id: pt.id,
                        sector: pt.sector,
                        distrito: pt.distrito,
                        provincia: pt.provincia,
                        departamento: pt.departamento || departamentoActivo,
                        peligro: pt.peligro,
                        medida: pt.medida_estructural,
                        costo_soles: pt.costo_soles,
                        fuente: pt.fuente
                    }
                })
            });
            if (res.ok) {
                const data = await res.json();
                setCertSuccessPiura(prev => ({ ...prev, [pt.id]: data }));
            } else {
                alert("Error al certificar punto en Blockchain");
            }
        } catch (e: any) {
            alert(`Error: ${e.message}`);
        } finally {
            setCertLoadingPiura(null);
        }
    };


    // Estados de simulación interactiva
    const [lluviaSimulada, setLluviaSimulada] = useState<number>(65);
    const [cuencaSeleccionada, setCuencaSeleccionada] = useState<string>("CC-PIU-01");
    const [simulacionResultado, setSimulacionResultado] = useState<any>(null);
    const [selectedUbigeoCert, setSelectedUbigeoCert] = useState<string>("200101");
    const [certificadoSha256, setCertificadoSha256] = useState<any>(null);
    const [radarModalOpen, setRadarModalOpen] = useState<boolean>(false);
    const [copilotoModalOpen, setCopilotoModalOpen] = useState<boolean>(false);

    // Estados tácticos Chulucanas - Mercado Modelo
    const [lluviaChulucanas, setLluviaChulucanas] = useState<number>(45);
    const [chulucanasData, setChulucanasData] = useState<any>(null);
    const [chulucanasLoading, setChulucanasLoading] = useState<boolean>(false);

    const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

    const fetchChulucanasContingencia = async (mm: number) => {
        setChulucanasLoading(true);
        try {
            const res = await fetch(`${API_BASE}/api/v1/piura/chulucanas-mercado-contingencia?lluvia_mm=${mm}`);
            if (res.ok) {
                const data = await res.json();
                setChulucanasData(data);
            }
        } catch (e) {
            console.error("Error cargando contingencia Chulucanas:", e);
        } finally {
            setChulucanasLoading(false);
        }
    };

    useEffect(() => {
        fetchPlanData();
    }, []);

    const fetchPlanData = async () => {
        setLoading(true);
        try {
            const [rPlan, rCuencas, rAudit, rSalud, rTrans, rPlanesDist, rDep] = await Promise.all([
                fetch(`${API_BASE}/api/v1/piura/contingencia/plan-integral`).then(r => r.json()).catch(() => null),
                fetch(`${API_BASE}/api/v1/piura/cuencas-ciegas`).then(r => r.json()).catch(() => ({ cuencas_ciegas_criticas: [] })),
                fetch(`${API_BASE}/api/v1/piura/contingencia/auditoria-pp0068`).then(r => r.json()).catch(() => null),
                fetch(`${API_BASE}/api/v1/piura/contingencia/salud-dsrslcc`).then(r => r.json()).catch(() => null),
                fetch(`${API_BASE}/api/v1/piura/contingencia/transferencia-2026`).then(r => r.json()).catch(() => null),
                fetch(`${API_BASE}/api/v1/planes/piura/distritales`).then(r => r.json()).catch(() => []),
                fetch(`${API_BASE}/api/v1/sigrid/departamental/piura`).then(r => r.json()).catch(() => null),
            ]);

            setPlanData(rPlan);
            setCuencas(rCuencas?.cuencas_ciegas_criticas || []);
            setAuditoriaData(rAudit);
            setSaludData(rSalud);
            setTransferenciaData(rTrans);
            setCatalogoDepartamental(rDep);
            if (Array.isArray(rPlanesDist) && rPlanesDist.length > 0) {
                setPlanesDistritales(rPlanesDist);
                setSelectedPlanDistrital(rPlanesDist[0]);
            }

            // Simular primer resultado
            ejecutarSimulacion("CC-PIU-01", 65);
            generarCertificado("200101");
            fetchChulucanasContingencia(45);
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

    const puntosFiltradosPiura = useMemo(() => {
        return (catalogoDepartamental?.puntos_criticos_departamental || []).filter((pt: any) => {
            const busq = busquedaPuntoPiura.trim().toLowerCase();
            const matchBusq = !busq ||
                (pt.sector && pt.sector.toLowerCase().includes(busq)) ||
                (pt.distrito && pt.distrito.toLowerCase().includes(busq)) ||
                (pt.cauce && pt.cauce.toLowerCase().includes(busq));
            const matchProv = filtroProvincia === "TODAS" ||
                (pt.provincia && pt.provincia.toUpperCase().includes(filtroProvincia.toUpperCase()));
            const matchFuente = filtroFuente === "TODAS" ||
                (pt.fuente && pt.fuente.toUpperCase().includes(filtroFuente.toUpperCase()));
            return matchBusq && matchProv && matchFuente;
        });
    }, [catalogoDepartamental, busquedaPuntoPiura, filtroProvincia, filtroFuente]);

    const provinciasDisponibles = useMemo(() => {
        const s = new Set<string>();
        (catalogoDepartamental?.puntos_criticos_departamental || []).forEach((pt: any) => {
            if (pt.provincia) s.add(pt.provincia.toUpperCase());
        });
        return Array.from(s).sort();
    }, [catalogoDepartamental]);

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

                <button
                    onClick={() => setActiveTab("escudo_departamental")}
                    className={`flex-1 min-w-[220px] py-3 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                        activeTab === "escudo_departamental"
                            ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-600/30 font-bold"
                            : "text-cyan-300 hover:text-white hover:bg-slate-800/60 border border-cyan-500/30"
                    }`}
                >
                    <ShieldCheck className="w-4 h-4 text-cyan-400" />
                    6. Escudo Departamental (102 Pts C2)
                </button>

                <button
                    onClick={() => setActiveTab("chulucanas_mercado")}
                    className={`flex-1 min-w-[240px] py-3 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                        activeTab === "chulucanas_mercado"
                            ? "bg-gradient-to-r from-amber-600 to-rose-600 text-white shadow-lg shadow-rose-600/30 font-bold border border-rose-400/50"
                            : "text-amber-300 hover:text-white hover:bg-slate-800/60 border border-amber-500/30 animate-pulse"
                    }`}
                >
                    <AlertTriangle className="w-4 h-4 text-amber-300" />
                    7. Chulucanas: Mercado & Motobombas (C2)
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
                                            <span className="text-[10px] text-slate-500 block">Secretaría Técnica / COED Municipal:</span>
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

            {/* CONTENIDO TAB 6: ESCUDO DEPARTAMENTAL DE PIURA (102 PUNTOS CRÍTICOS C2) */}
            {activeTab === "escudo_departamental" && (
                <div className="space-y-6">
                    {/* ENCABEZADO Y RESUMEN TÁCTICO DE COBERTURA */}
                    <div className="bg-slate-900/90 border border-cyan-500/40 rounded-2xl p-6 shadow-2xl space-y-4">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                            <div>
                                <div className="flex flex-wrap items-center gap-2 mb-2">
                                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 flex items-center gap-1.5">
                                        <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                                        ESCUDO DEPARTAMENTAL C2 • {catalogoDepartamental?.metadata?.departamento?.toUpperCase() || departamentoActivo} 360°
                                    </span>
                                    <span className="px-2 py-0.5 rounded text-xs font-mono bg-slate-800 text-slate-300">
                                        D.S. N.° 124-2026-PCM
                                    </span>
                                    <span className="px-2 py-0.5 rounded text-xs font-mono bg-blue-950 text-blue-300 border border-blue-800">
                                        {catalogoDepartamental?.metadata?.total_distritos_cubiertos || catalogoDepartamental?.metadata?.total_distritos_con_puntos_directos || 28} Distritos Priorizados
                                    </span>
                                </div>
                                <h2 className="text-2xl font-black text-white">
                                    Concentrador Departamental de Mitigación y Defensas Ribereñas
                                </h2>
                                <p className="text-xs text-slate-400 mt-1">
                                    Integración soberana de {catalogoDepartamental?.metadata?.total_puntos_criticos_georreferenciados || 102} puntos críticos georreferenciados (ANA FTR 2026 + CENEPRED SIGRID + Sistemas SARE MVCS).
                                </p>
                            </div>

                            <div className="flex flex-wrap items-center gap-3">
                                {/* SELECTOR MULTIRREGIONAL */}
                                <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-cyan-500/50">
                                    <span className="text-[11px] text-cyan-400 font-bold uppercase tracking-wider">Región:</span>
                                    <select
                                        value={departamentoActivo}
                                        onChange={e => cambiarDepartamento(e.target.value)}
                                        disabled={loadingDep}
                                        className="bg-transparent text-xs font-bold text-white focus:outline-none cursor-pointer"
                                    >
                                        <option value="PIURA" className="bg-slate-950 text-white">Piura (102 Pts • S/ 310M)</option>
                                        <option value="LIMA" className="bg-slate-950 text-white">Lima (142 Pts • S/ 153M)</option>
                                        <option value="AREQUIPA" className="bg-slate-950 text-white">Arequipa (95 Pts • S/ 75M)</option>
                                        <option value="LA LIBERTAD" className="bg-slate-950 text-white">La Libertad (61 Pts • S/ 50M)</option>
                                        <option value="ICA" className="bg-slate-950 text-white">Ica (54 Pts • S/ 70M)</option>
                                        <option value="LAMBAYEQUE" className="bg-slate-950 text-white">Lambayeque (44 Pts • S/ 69M)</option>
                                        <option value="TUMBES" className="bg-slate-950 text-white">Tumbes (15 Pts • S/ 21M)</option>
                                        <option value="COSTA_NACIONAL" className="bg-slate-950 text-white">Gran Escudo Costero (513 Pts • S/ 748M)</option>
                                    </select>
                                </div>

                                <a
                                    href={`${API_BASE}/api/v1/sigrid/departamental/${departamentoActivo}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-600/50 text-cyan-200 text-xs font-bold transition shadow-lg shadow-cyan-950/40"
                                >
                                    <Download className="w-4 h-4 text-cyan-400" />
                                    <span>Exportar JSON</span>
                                </a>
                            </div>
                        </div>

                        {/* MÉTRICAS CLAVE DEL DEPARTAMENTO */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                                <span className="text-[10px] text-slate-400 uppercase font-mono block">Puntos Críticos</span>
                                <strong className="text-xl font-bold text-white font-mono">
                                    {catalogoDepartamental?.metadata?.total_puntos_criticos_georreferenciados || 102}
                                </strong>
                                <span className="text-[10px] text-cyan-400 block mt-0.5">100% Georreferenciados WGS84</span>
                            </div>

                            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                                <span className="text-[10px] text-slate-400 uppercase font-mono block">Inversión en Mitigación</span>
                                <strong className="text-xl font-bold text-emerald-400 font-mono">
                                    S/ {(catalogoDepartamental?.metadata?.inversion_total_mitigacion_soles || 312047748).toLocaleString()}
                                </strong>
                                <span className="text-[10px] text-emerald-300 block mt-0.5">PP 0068 / Fondes / ANA FTR</span>
                            </div>

                            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                                <span className="text-[10px] text-slate-400 uppercase font-mono block">Distritos Priorizados</span>
                                <strong className="text-xl font-bold text-amber-400 font-mono">
                                    {catalogoDepartamental?.metadata?.total_distritos_cubiertos || catalogoDepartamental?.metadata?.total_distritos_con_puntos_directos || 28} Distritos
                                </strong>
                                <span className="text-[10px] text-amber-300 block mt-0.5">{provinciasDisponibles.length} Provincias Involucradas</span>
                            </div>

                            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                                <span className="text-[10px] text-slate-400 uppercase font-mono block">Blindaje Blockchain</span>
                                <strong className="text-xl font-bold text-purple-400 font-mono">
                                    Polygon Amoy
                                </strong>
                                <span className="text-[10px] text-purple-300 block mt-0.5">WORM RFC 3161 • ChainID 80002</span>
                            </div>
                        </div>
                    </div>

                    {/* MACRO-ESCENARIOS DE RIESGO DE LA REGIÓN SELECCIONADA */}
                    <div className="space-y-3">
                        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-amber-400" />
                            Macro-Escenarios Hidrológicos de Cuenca ({catalogoDepartamental?.metadata?.departamento || departamentoActivo})
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3 text-xs">
                            {Object.entries(catalogoDepartamental?.escenarios_macrocuenca || {}).map(([key, esc]: [string, any], idx: number) => {
                                const borderColors = ["border-rose-900/60", "border-amber-900/60", "border-purple-900/60", "border-cyan-900/60", "border-blue-900/60"];
                                const badgeColors = [
                                    "bg-rose-950 text-rose-300 border-rose-800",
                                    "bg-amber-950 text-amber-300 border-amber-800",
                                    "bg-purple-950 text-purple-300 border-purple-800",
                                    "bg-cyan-950 text-cyan-300 border-cyan-800",
                                    "bg-blue-950 text-blue-300 border-blue-800"
                                ];
                                const textColors = ["text-rose-400", "text-amber-400", "text-purple-400", "text-cyan-400", "text-blue-400"];
                                const bCol = borderColors[idx % borderColors.length];
                                const badgeCol = badgeColors[idx % badgeColors.length];
                                const tCol = textColors[idx % textColors.length];
                                return (
                                    <div key={key} className={`p-3.5 bg-slate-950 border ${bCol} rounded-xl space-y-1.5 flex flex-col justify-between`}>
                                        <div className="space-y-1.5">
                                            <span className={`px-2 py-0.5 rounded text-[9px] font-mono ${badgeCol} border font-bold block w-fit`}>
                                                {idx + 1}. {key.replace(/_/g, " ").toUpperCase()}
                                            </span>
                                            <strong className="text-white text-xs block">{esc.nombre || key}</strong>
                                            <p className="text-[11px] text-slate-300 line-clamp-3">
                                                {esc.descripcion}
                                            </p>
                                        </div>
                                        <div className="pt-2 border-t border-slate-800/80 mt-2 space-y-1">
                                            <div className={`text-[11px] font-mono font-bold ${tCol}`}>
                                                {(esc.poblacion_expuesta_estimada || 25000).toLocaleString()} hab. en faja crítica
                                            </div>
                                            {esc.poblacion_censal_inei_total ? (
                                                <div className="text-[10px] text-slate-400 leading-tight">
                                                    Base censal: <span className="text-slate-200 font-mono font-semibold">{(esc.poblacion_censal_inei_total).toLocaleString()} hab.</span> en {esc.distritos_nombres_base?.length || 0} distritos ribereños
                                                    <span className="block text-[9px] text-slate-500 mt-0.5 font-sans">
                                                        Fuente: INEI 2017 / CENEPRED Escenario FEN
                                                    </span>
                                                </div>
                                            ) : (
                                                <div className="text-[9px] text-slate-500 font-sans">
                                                    Fuente: CENEPRED / ANA FTR 2026
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* CATÁLOGO FILTRABLE DE PUNTOS CRÍTICOS */}
                    <div className="p-5 bg-slate-900/90 border border-slate-800 rounded-xl space-y-4">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                            <div>
                                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                                    <MapPin className="w-4 h-4 text-cyan-400" />
                                    Inventario Georreferenciado de Puntos Críticos ({catalogoDepartamental?.metadata?.departamento || departamentoActivo})
                                </h3>
                                <p className="text-xs text-slate-400">
                                    Filtre por provincia, sector o fuente oficial para auditar y sellar en Blockchain.
                                </p>
                            </div>

                            <div className="flex flex-wrap items-center gap-2">
                                <div className="relative">
                                    <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-500" />
                                    <input
                                        type="text"
                                        value={busquedaPuntoPiura}
                                        onChange={e => setBusquedaPuntoPiura(e.target.value)}
                                        placeholder="Buscar sector, río, distrito..."
                                        className="pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-500 w-44"
                                    />
                                </div>

                                <select
                                    value={filtroProvincia}
                                    onChange={e => setFiltroProvincia(e.target.value)}
                                    className="px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                                >
                                    <option value="TODAS">Todas las Provincias ({provinciasDisponibles.length})</option>
                                    {provinciasDisponibles.map(prov => (
                                        <option key={prov} value={prov}>{prov}</option>
                                    ))}
                                </select>

                                <select
                                    value={filtroFuente}
                                    onChange={e => setFiltroFuente(e.target.value)}
                                    className="px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                                >
                                    <option value="TODAS">Todas las Fuentes</option>
                                    <option value="ANA">Autoridad Nacional del Agua (ANA)</option>
                                    <option value="SIGRID">CENEPRED SIGRID (PPRRD)</option>
                                    <option value="PECHP">PECHP / SARE / MVCS</option>
                                </select>

                            </div>
                        </div>

                        {/* LISTA EN CARDS DE PUNTOS */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[600px] overflow-y-auto pr-1">
                            {puntosFiltradosPiura.map((pt: any) => {
                                const cert = certSuccessPiura[pt.id];
                                const isLoading = certLoadingPiura === pt.id;
                                const txHash = cert?.blockchain_anchor?.tx_hash;
                                const explorerUrl = cert?.blockchain_anchor?.explorer_url || (txHash ? `https://amoy.polygonscan.com/tx/${txHash}` : null);
                                return (
                                    <div key={pt.id} className="p-3.5 bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-xl space-y-2 text-xs flex flex-col justify-between">
                                        <div className="space-y-1.5">
                                            <div className="flex items-center justify-between">
                                                <span className="font-mono font-bold text-cyan-400 bg-cyan-950/60 px-1.5 py-0.5 rounded text-[10px] border border-cyan-800">
                                                    {pt.id}
                                                </span>
                                                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-950 text-rose-300 border border-rose-800">
                                                    {pt.nivel}
                                                </span>
                                            </div>

                                            <div className="font-bold text-white text-xs line-clamp-1">
                                                {pt.sector}
                                            </div>

                                            <div className="text-[11px] text-slate-400">
                                                {pt.distrito}, Prov. {pt.provincia} • <strong className="text-slate-300">{pt.cauce}</strong>
                                            </div>

                                            <div className="text-[11px] text-slate-300 line-clamp-2">
                                                {pt.descripcion}
                                            </div>

                                            <div className="p-2 bg-emerald-950/20 border border-emerald-900/40 rounded-lg text-[11px] text-emerald-300">
                                                <strong>Medida:</strong> {pt.medida_estructural}
                                            </div>
                                        </div>

                                        <div className="pt-2 border-t border-slate-800/80 space-y-2 mt-2">
                                            <div className="flex items-center justify-between text-[11px] font-mono">
                                                <span className="text-slate-400">Presupuesto:</span>
                                                <strong className="text-white">
                                                    S/ {(pt.costo_soles || 0).toLocaleString()}
                                                </strong>
                                            </div>

                                            <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                                                <span>GPS: {pt.latitud?.toFixed(4)}, {pt.longitud?.toFixed(4)}</span>
                                            </div>

                                            {cert ? (
                                                <div className="space-y-1">
                                                    <span className="w-full py-1 px-2 rounded bg-emerald-950 text-emerald-300 border border-emerald-700 font-bold text-[10px] flex items-center justify-center gap-1">
                                                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                                                        WORM Blk #{cert.bloque_worm_id} • TX {txHash ? txHash.substring(0, 10) : "0x"}...
                                                    </span>
                                                    {explorerUrl && (
                                                        <a
                                                            href={explorerUrl}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="w-full py-1 px-2 rounded bg-slate-900 hover:bg-slate-800 text-[10px] font-mono text-cyan-400 hover:text-cyan-300 border border-cyan-800/60 flex items-center justify-center gap-1 transition-colors"
                                                        >
                                                            <ExternalLink className="w-2.5 h-2.5" /> Ver en PolygonScan Explorer
                                                        </a>
                                                    )}
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => handleCertificarPuntoPiura(pt)}
                                                    disabled={isLoading}
                                                    className="w-full py-1.5 px-3 rounded bg-slate-900 hover:bg-slate-800 border border-cyan-700/60 hover:border-cyan-500 text-cyan-300 text-xs font-bold transition flex items-center justify-center gap-1.5 disabled:opacity-50"
                                                >
                                                    <ShieldCheck className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : "text-cyan-400"}`} />
                                                    <span>{isLoading ? "Sellando..." : "Sellar en WORM / Blockchain"}</span>
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}

                        </div>
                    </div>
                </div>
            )}

            {/* CONTENIDO TAB 7: CHULUCANAS - MERCADO MODELO & MOTOBOMBAS (C2 TÁCTICO) */}
            {activeTab === "chulucanas_mercado" && (
                <div className="space-y-6">
                    {/* BANNER DE SITUACIÓN REAL: RPP NOTICIAS / COEN MORROPÓN */}
                    <div className="bg-gradient-to-r from-red-950/80 via-slate-900 to-amber-950/50 p-6 rounded-2xl border border-red-500/40 shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-80 h-80 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
                        
                        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
                            <div>
                                <div className="flex flex-wrap items-center gap-2 mb-2">
                                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-500/20 text-red-300 border border-red-500/40 flex items-center gap-1 animate-pulse">
                                        <AlertTriangle className="w-3.5 h-3.5" /> CASO REAL RPP NOTICIAS • MORROPÓN-CHULUCANAS
                                    </span>
                                    <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                                        UBIGEO 200401
                                    </span>
                                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                                        <ShieldCheck className="w-3 h-3" /> ART. 27 LEY 30225 / PP 0068
                                    </span>
                                </div>
                                <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
                                    <Building2 className="w-6 h-6 text-amber-400" />
                                    Comando C2: Inundación Mercado Modelo de Chulucanas
                                </h2>
                                <p className="text-xs text-slate-300 mt-1 max-w-4xl">
                                    A diferencia del visor de SENAMHI (que reporta exclusivamente lluvia estática en mm), AMARU-CLIMATE convierte la precipitación en <strong>tirante hidráulico ({chulucanasData?.evento_meteorologico?.tirante_inundacion_estimado_cm || 32.4} cm)</strong>, dimensiona las <strong>motobombas requeridas ({chulucanasData?.dimensionamiento_motobombas_c2?.unidades_motobomba_6_pulgadas || 2}x 6&quot;)</strong>, blinda la contratación de emergencia ante Contraloría y calcula la <strong>onda de crecida hacia Tambogrande y Piura</strong>.
                                </p>
                            </div>

                            <div className="flex flex-col items-end gap-2">
                                <a
                                    href="https://rpp.pe/peru/piura/piura-lluvias-torrenciales-inundan-calles-y-obligan-a-cerrar-el-mercado-modelo-en-chulucanas-noticia-1713517"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-3 py-1.5 rounded-lg bg-red-600/30 hover:bg-red-600/50 border border-red-500/60 text-red-200 text-xs font-bold flex items-center gap-1.5 transition-colors"
                                >
                                    <ExternalLink className="w-3.5 h-3.5" /> Ver Despacho RPP Noticias
                                </a>
                                <span className="text-[11px] text-slate-400 font-mono">
                                    Alcalde: {chulucanasData?.alcalde_titular || "Sr. Richard Baca Palacios"}
                                </span>
                            </div>
                        </div>

                        {/* SLIDER DE PRECIPITACIÓN SIMULADA */}
                        <div className="mt-6 pt-5 border-t border-slate-800/80 bg-slate-950/60 p-4 rounded-xl border border-slate-700/50">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                                <label className="text-xs font-bold text-slate-200 flex items-center gap-2">
                                    <Droplets className="w-4 h-4 text-cyan-400" />
                                    Simulador de Escorrentía Pluvial en Chulucanas:
                                </label>
                                <span className="text-sm font-black text-cyan-300 font-mono bg-cyan-950/80 px-2.5 py-0.5 rounded border border-cyan-800">
                                    {lluviaChulucanas} mm de Precipitación Acumulada
                                </span>
                            </div>
                            <input
                                type="range"
                                min={15}
                                max={110}
                                step={5}
                                value={lluviaChulucanas}
                                onChange={(e) => {
                                    const val = Number(e.target.value);
                                    setLluviaChulucanas(val);
                                    fetchChulucanasContingencia(val);
                                }}
                                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                            />
                            <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-mono">
                                <span>20 mm (Lluvia Moderada)</span>
                                <span className="text-amber-400 font-bold">45 mm (Evento Real Mercado Modelo)</span>
                                <span>75 mm (Torrencial FEN)</span>
                                <span>110 mm (Extraordinario 1998/2017)</span>
                            </div>
                        </div>
                    </div>

                    {/* 4 TARJETAS TÁCTICAS OPERACIONALES */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* 1. TIRANTE Y CALADO */}
                        <div className="p-4 rounded-xl bg-slate-900/80 border border-amber-500/30 space-y-2">
                            <div className="flex items-center justify-between text-xs text-slate-400">
                                <span className="font-semibold uppercase tracking-wider">TIRANTE DE INUNDACIÓN</span>
                                <Waves className="w-4 h-4 text-amber-400" />
                            </div>
                            <div className="text-3xl font-black text-amber-300 font-mono">
                                {chulucanasData?.evento_meteorologico?.tirante_inundacion_estimado_cm || 32.4} cm
                            </div>
                            <div className="text-[11px] text-slate-300">
                                Calado medido en Jr. Pisagua y pasajes comerciales del Mercado Modelo.
                            </div>
                            <div className="text-[10px] font-bold text-rose-400 bg-rose-950/60 px-2 py-0.5 rounded border border-rose-800/80 inline-block">
                                ESTADO: {chulucanasData?.evento_meteorologico?.estado_alerta || "ROJO_CRITICO"}
                            </div>
                        </div>

                        {/* 2. VOLUMEN DE AGUA EMBALSADA */}
                        <div className="p-4 rounded-xl bg-slate-900/80 border border-cyan-500/30 space-y-2">
                            <div className="flex items-center justify-between text-xs text-slate-400">
                                <span className="font-semibold uppercase tracking-wider">VOLUMEN EMBALSADO</span>
                                <Droplets className="w-4 h-4 text-cyan-400" />
                            </div>
                            <div className="text-3xl font-black text-cyan-300 font-mono">
                                {chulucanasData?.evento_meteorologico?.volumen_inundacion_mercado_m3?.toLocaleString() || "506.2"} m³
                            </div>
                            <div className="text-[11px] text-slate-300">
                                Volumen crítico techado (12,500 m²). Cuenca ciega completa: <strong>{chulucanasData?.evento_meteorologico?.volumen_cuenca_ciega_total_m3?.toLocaleString() || "3,251"} m³</strong>.
                            </div>
                            <div className="text-[10px] text-cyan-400 font-mono">
                                Coeficiente escorrentía: C = 0.90 urbano
                            </div>
                        </div>

                        {/* 3. PARQUE DE MOTOBOMBAS REQUERIDO */}
                        <div className="p-4 rounded-xl bg-slate-900/80 border border-emerald-500/30 space-y-2">
                            <div className="flex items-center justify-between text-xs text-slate-400">
                                <span className="font-semibold uppercase tracking-wider">MAQUINARIA C2 EXIGIDA</span>
                                <Truck className="w-4 h-4 text-emerald-400" />
                            </div>
                            <div className="text-3xl font-black text-emerald-300 font-mono">
                                {chulucanasData?.dimensionamiento_motobombas_c2?.unidades_motobomba_6_pulgadas || 2}x 6&quot; + {chulucanasData?.dimensionamiento_motobombas_c2?.unidades_cisterna_hidrojet || 2}x Cis
                            </div>
                            <div className="text-[11px] text-slate-300">
                                Capacidad desfogue: <strong>{chulucanasData?.dimensionamiento_motobombas_c2?.capacidad_desfogue_m3_hora || 500} m³/h</strong>. Tiempo de achique objetivo: <strong>2 horas</strong>.
                            </div>
                            <div className="text-[10px] text-emerald-400 font-mono">
                                Manguera requerida: {chulucanasData?.dimensionamiento_motobombas_c2?.manguera_descarga_requerida_metros || 600} m hacia dren
                            </div>
                        </div>

                        {/* 4. BLINDAJE CONTRALORÍA Y HASH */}
                        <div className="p-4 rounded-xl bg-slate-900/80 border border-purple-500/30 space-y-2">
                            <div className="flex items-center justify-between text-xs text-slate-400">
                                <span className="font-semibold uppercase tracking-wider">CERTIFICACIÓN PERICIAL</span>
                                <Lock className="w-4 h-4 text-purple-400" />
                            </div>
                            <div className="text-lg font-mono font-bold text-purple-300 break-all">
                                {chulucanasData?.blindaje_legal_contraloria_mef?.hash_certificacion_pericial || "SHA256-CHUL-8F4C2A1"}
                            </div>
                            <div className="text-[11px] text-slate-300">
                                Habilita Contratación Directa por Emergencia (Art. 27 Ley 30225) y previene Art. 377 Código Penal.
                            </div>
                            <div className="text-[10px] font-mono text-purple-300">
                                Presupuesto Operativo: S/ {(chulucanasData?.blindaje_legal_contraloria_mef?.costo_estimado_soles || 12050).toLocaleString()}
                            </div>
                        </div>
                    </div>

                    {/* SECCIÓN DE CUENCAS CIEGAS ASOCIADAS Y ONDA AGUAS ABAJO */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* CUENCAS CIEGAS URBANAS EN CHULUCANAS */}
                        <div className="lg:col-span-2 bg-slate-900/70 p-5 rounded-xl border border-slate-800 space-y-4">
                            <h3 className="text-sm font-bold text-white flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-rose-400" />
                                Sectores Críticos y Cuencas Ciegas Afectadas en Chulucanas
                            </h3>
                            <div className="space-y-3">
                                {(chulucanasData?.puntos_criticos_asociados || [
                                    { nombre: "Mercado Modelo de Chulucanas", calado_cm: 32.4, comerciantes_expuestos: 850, accion: "Cierre preventivo y elevación de mercadería a tarimas" },
                                    { nombre: "Barrio Monte Verde", calado_cm: 27.5, viviendas_expuestas: 140, accion: "Activación de electrobomba comunal y sacos terreros" },
                                    { nombre: "AA.HH. Villa Mercedes / Consuelo de Velasco", calado_cm: 24.3, viviendas_expuestas: 220, accion: "Zanja de coronación y desvío hacia dren" },
                                    { nombre: "AA.HH. José Carlos Mariátegui", calado_cm: 29.1, viviendas_expuestas: 180, accion: "Evacuación de familias ribereñas" }
                                ]).map((pt: any, idx: number) => (
                                    <div key={idx} className="p-3.5 bg-slate-950/80 rounded-lg border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-white text-sm">{pt.nombre}</span>
                                                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                                    Calado {pt.calado_cm} cm
                                                </span>
                                            </div>
                                            <div className="text-slate-400 text-[11px]">
                                                {pt.comerciantes_expuestos ? `${pt.comerciantes_expuestos} Comerciantes empadronados` : `${pt.viviendas_expuestas} Familias vulnerables`}
                                            </div>
                                            <div className="text-emerald-400 text-[11px]">
                                                <strong>Acción Táctica:</strong> {pt.accion}
                                            </div>
                                        </div>
                                        <span className="px-3 py-1 rounded bg-slate-900 border border-slate-700 text-slate-300 font-mono text-[10px] text-center whitespace-nowrap self-start sm:self-center">
                                            PRIORIDAD ALTA
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* TRÁNSITO HIDRÁULICO AGUAS ABAJO (LEAD-TIME) */}
                        <div className="bg-gradient-to-b from-indigo-950/40 via-slate-900 to-slate-950 p-5 rounded-xl border border-indigo-500/30 space-y-4">
                            <h3 className="text-sm font-bold text-white flex items-center gap-2">
                                <Clock className="w-4 h-4 text-cyan-400" />
                                Alerta Temprana Aguas Abajo (Lead-Time)
                            </h3>
                            <p className="text-xs text-slate-300">
                                La escorrentía en las cuencas altas de Morropón-Chulucanas transita hacia el cauce del Río Piura afectando distritos receptores:
                            </p>

                            <div className="space-y-3">
                                <div className="p-3 bg-slate-950 rounded-lg border border-indigo-500/30 space-y-1">
                                    <div className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                                        <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                                        Tambogrande (Badén San Francisco)
                                    </div>
                                    <div className="text-lg font-black text-white font-mono">
                                        T - 70 minutos
                                    </div>
                                    <p className="text-[11px] text-slate-400">
                                        Riesgo inminente de corte vehicular en la carretera Piura - Chulucanas - Tambogrande.
                                    </p>
                                </div>

                                <div className="p-3 bg-slate-950 rounded-lg border border-indigo-500/30 space-y-1">
                                    <div className="text-xs font-bold text-rose-300 flex items-center gap-1.5">
                                        <Waves className="w-3.5 h-3.5 text-rose-400" />
                                        Bajo Piura (Sánchez Cerro / Catacaos)
                                    </div>
                                    <div className="text-lg font-black text-white font-mono">
                                        T - 12.0 horas
                                    </div>
                                    <p className="text-[11px] text-slate-400">
                                        Aporte al caudal pico en el Puente Sánchez Cerro y defensas ribereñas de Cura Mori.
                                    </p>
                                </div>
                            </div>

                            <div className="p-3 bg-indigo-950/60 rounded-lg border border-indigo-500/40 text-[11px] text-indigo-200">
                                <strong>Doctrina C2:</strong> El alcalde provincial puede ordenar la evacuación vehicular y activar el plan de contingencia de Tambogrande 70 minutos antes del impacto físico de la riada.
                            </div>
                        </div>
                    </div>

                    {/* VINCULACIÓN AL PDU CHULUCANAS 2020-2030 (PROYECTO MERCADO S/ 25.8M Y MACRO-DRENAJE S/ 91.8M) */}
                    <div className="bg-slate-900/90 p-5 rounded-2xl border border-indigo-500/30 space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                            <div className="flex items-center gap-2">
                                <FileText className="w-5 h-5 text-indigo-400" />
                                <h3 className="text-sm font-bold text-white">
                                    Cruce con el Plan de Desarrollo Urbano (PDU) Chulucanas 2020-2030 (MVCS / MP Morropón)
                                </h3>
                            </div>
                            <span className="text-[11px] font-mono bg-indigo-950 text-indigo-300 px-2.5 py-0.5 rounded border border-indigo-800">
                                Diagnóstico Multianual PDU pág. 10 y 42
                            </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                            <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5">
                                <div className="text-[10px] font-mono text-amber-400 font-bold uppercase">PROYECTO P.1.1.2.2 (PDU PÁG. 42)</div>
                                <div className="font-bold text-white text-sm">Nuevo Mercado Distrital de Chulucanas</div>
                                <div className="text-slate-300 text-[11px]">
                                    Presupuesto PDU: <strong className="text-white">S/ 25,800,000</strong> a cargo de la MP Morropón.
                                </div>
                                <div className="text-[10px] text-rose-300 bg-rose-950/40 p-1.5 rounded border border-rose-900/40">
                                    Brecha no ejecutada: Obliga a la respuesta C2 inmediata de bombeo (S/ 12,050) para evitar colapso sanitario de comerciantes.
                                </div>
                            </div>

                            <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5">
                                <div className="text-[10px] font-mono text-cyan-400 font-bold uppercase">PROYECTO P.5.4.12.1 (PDU PÁG. 41)</div>
                                <div className="font-bold text-white text-sm">Medidas Estructurales de Prevención y Drenaje</div>
                                <div className="text-slate-300 text-[11px]">
                                    Presupuesto PDU: <strong className="text-white">S/ 91,860,000</strong> a cargo del GORE Piura.
                                </div>
                                <div className="text-[10px] text-cyan-300 bg-cyan-950/40 p-1.5 rounded border border-cyan-900/40">
                                    Macro-drenaje de cuencas ciegas y defensas ribereñas del Río Yapatera y Quebrada Sol Sol.
                                </div>
                            </div>

                            <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5">
                                <div className="text-[10px] font-mono text-emerald-400 font-bold uppercase">SECTORES CRÍTICOS PDU (TABLA 1-3)</div>
                                <div className="font-bold text-white text-sm">Matriz de Exposición Pluvial</div>
                                <div className="space-y-1 text-[11px] text-slate-300 font-mono">
                                    <div>• Sector 02 (Norte / Pilar Nores): <strong>12.28%</strong></div>
                                    <div>• Sector 06 (Este / Ñácara): <strong>11.61%</strong></div>
                                    <div>• Sector 04 (Suroeste / Mercedes): <strong>10.46%</strong></div>
                                    <div>• Sector 03 (Oeste / Mariátegui): <strong>7.06%</strong></div>
                                </div>
                            </div>
                        </div>
                    </div>
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
