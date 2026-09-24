"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
    Database,
    ShieldCheck,
    Radio,
    Waves,
    RefreshCw,
    Activity,
    CheckCircle2,
    AlertTriangle,
    XCircle,
    ExternalLink,
    Filter,
    Clock,
    Lock,
    Scale,
    FileCheck2,
    Layers,
    Terminal,
    Search,
    ChevronDown,
    ChevronUp,
    Copy,
    Check,
    Eye,
    Code,
    Zap,
    Droplets,
    Compass,
    Server,
    ShieldAlert
} from "lucide-react";

interface PedigreeInfo {
    codigo: string;
    color_hex: string;
    insignia: string;
    nombre: string;
    significado?: string;
    doctrina?: string;
    grado_certeza_pct: number;
}

interface TelemetryStream {
    id: string;
    nombre: string;
    ente: string;
    sector: string;
    endpoint_exacto: string;
    protocolo: string;
    frecuencia: string;
    pedigree: PedigreeInfo;
    estado_salud: string;
    latencia_ms: number;
    ultimo_sync_utc: string;
    sello_sha256: string;
    resumen_ejecutivo: string;
    ultimo_payload: Record<string, any>;
    norma_marco_legal: string;
}

interface FuenteCatalogData {
    id: string;
    nombre: string;
    ente: string;
    tier: string;
    categoria: string;
    endpoint: string;
    frecuencia_minutos: number;
    estado_salud: string;
    latencia_ms: number;
    ultimo_sync_utc: string | null;
    ultimo_hash_sha256: string | null;
    conector_especializado_activo: boolean;
}

export default function FuentesGovernancePage() {
    const [activeTab, setActiveTab] = useState<"TELEMETRIA_VIVA" | "INVENTARIO_MAESTRO">("TELEMETRIA_VIVA");
    
    // Telemetría Viva States
    const [streams, setStreams] = useState<TelemetryStream[]>([]);
    const [loadingStreams, setLoadingStreams] = useState<boolean>(true);
    const [expandedStreamIds, setExpandedStreamIds] = useState<Set<string>>(new Set(["STREAM-SENAMHI-RADAR-PIU", "STREAM-AMARU-INFERENCIA-TURBIDEZ"]));
    const [filterPedigree, setFilterPedigree] = useState<string>("ALL");
    const [filterSector, setFilterSector] = useState<string>("ALL");
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [probingStreamId, setProbingStreamId] = useState<string | null>(null);
    const [copiedHashId, setCopiedHashId] = useState<string | null>(null);
    const [copiedUrlId, setCopiedUrlId] = useState<string | null>(null);
    const [rawJsonViewMap, setRawJsonViewMap] = useState<Record<string, boolean>>({});

    // Catálogo Maestro States
    const [fuentes, setFuentes] = useState<FuenteCatalogData[]>([]);
    const [loadingCatalog, setLoadingCatalog] = useState<boolean>(true);
    const [filterTier, setFilterTier] = useState<string>("ALL");
    const [syncingId, setSyncingId] = useState<string | null>(null);
    const [auditModalItem, setAuditModalItem] = useState<any | null>(null);

    const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

    useEffect(() => {
        fetchTelemetryFeed();
        fetchCatalog();
    }, []);

    const fetchTelemetryFeed = async () => {
        setLoadingStreams(true);
        try {
            const res = await fetch(`${API_BASE}/api/v1/kuraq/telemetria-viva`);
            if (res.ok) {
                const data = await res.json();
                setStreams(data.streams || []);
            }
        } catch (e) {
            console.error("Error al cargar feed de telemetría viva:", e);
        } finally {
            setLoadingStreams(false);
        }
    };

    const fetchCatalog = async () => {
        setLoadingCatalog(true);
        try {
            const res = await fetch(`${API_BASE}/api/v1/kuraq/fuentes`);
            if (res.ok) {
                const data = await res.json();
                setFuentes(data.fuentes || []);
            }
        } catch (e) {
            console.error("Error al cargar inventario de fuentes:", e);
        } finally {
            setLoadingCatalog(false);
        }
    };

    const handleProbeStream = async (streamId: string) => {
        setProbingStreamId(streamId);
        try {
            const res = await fetch(`${API_BASE}/api/v1/kuraq/telemetria-viva/sondear/${streamId}`, {
                method: "POST"
            });
            if (res.ok) {
                const result = await res.json();
                if (result.stream) {
                    setStreams((prev) =>
                        prev.map((s) => (s.id === streamId ? result.stream : s))
                    );
                }
            }
        } catch (e) {
            console.error("Error al sondear corriente:", e);
        } finally {
            setProbingStreamId(null);
        }
    };

    const handleSyncCatalogSource = async (sourceId: string) => {
        setSyncingId(sourceId);
        try {
            const res = await fetch(`${API_BASE}/api/v1/kuraq/sincronizar`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ source_id: sourceId })
            });
            if (res.ok) {
                const result = await res.json();
                setAuditModalItem(result);
                fetchCatalog();
            }
        } catch (e) {
            console.error("Error al sincronizar fuente:", e);
        } finally {
            setSyncingId(null);
        }
    };

    const toggleExpandStream = (id: string) => {
        setExpandedStreamIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    };

    const expandAllStreams = () => {
        setExpandedStreamIds(new Set(streams.map((s) => s.id)));
    };

    const collapseAllStreams = () => {
        setExpandedStreamIds(new Set());
    };

    const toggleRawJsonView = (id: string) => {
        setRawJsonViewMap((prev) => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    const handleCopy = (text: string, id: string, type: "hash" | "url") => {
        navigator.clipboard.writeText(text);
        if (type === "hash") {
            setCopiedHashId(id);
            setTimeout(() => setCopiedHashId(null), 2500);
        } else {
            setCopiedUrlId(id);
            setTimeout(() => setCopiedUrlId(null), 2500);
        }
    };

    // Filtros de Telemetría Viva
    const filteredStreams = streams.filter((s) => {
        const matchesPedigree =
            filterPedigree === "ALL" || s.pedigree.codigo === filterPedigree;
        const matchesSector =
            filterSector === "ALL" || s.sector === filterSector;
        const q = searchQuery.toLowerCase();
        const matchesSearch =
            s.nombre.toLowerCase().includes(q) ||
            s.ente.toLowerCase().includes(q) ||
            s.endpoint_exacto.toLowerCase().includes(q) ||
            s.id.toLowerCase().includes(q) ||
            s.resumen_ejecutivo.toLowerCase().includes(q);
        return matchesPedigree && matchesSector && matchesSearch;
    });

    // Filtros de Catálogo Maestro
    const filteredFuentes = fuentes.filter((f) => {
        const matchesTier = filterTier === "ALL" || f.tier === filterTier;
        const q = searchQuery.toLowerCase();
        const matchesSearch =
            f.nombre.toLowerCase().includes(q) ||
            f.ente.toLowerCase().includes(q) ||
            f.id.toLowerCase().includes(q);
        return matchesTier && matchesSearch;
    });

    const totalOficiales = streams.filter((s) => s.pedigree.codigo === "DATO_OFICIAL_VALIDADO").length;
    const totalInferencias = streams.filter((s) => s.pedigree.codigo === "INFERENCIA_ALGORITMICA").length;
    const totalGroundTruth = streams.filter((s) => s.pedigree.codigo === "GROUND_TRUTH_VERIFICADO").length;
    const totalSimulacion = streams.filter((s) => s.pedigree.codigo === "SIMULACION_TACTICA_C2").length;

    return (
        <div className="space-y-6 max-w-7xl mx-auto pb-20 px-2 sm:px-4">
            {/* ENCABEZADO TÁCTICO C2 & AUDITORÍA FORENSE */}
            <div className="bg-gradient-to-r from-slate-900 via-indigo-950/90 to-slate-900 p-6 rounded-2xl border border-indigo-500/30 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 relative z-10">
                    <div>
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1">
                                <Database className="w-3 h-3" /> AGENTE KURAQ (CURADOR MULTIFUENTE SOBERANO)
                            </span>
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                                <ShieldCheck className="w-3 h-3" /> NTP-ISO/IEC 27037:2012
                            </span>
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                                <Scale className="w-3 h-3" /> LEY N° 31814 & D.S. 115-2025-PCM
                            </span>
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-500/20 text-sky-300 border border-sky-500/30 flex items-center gap-1">
                                <Radio className="w-3 h-3 animate-pulse" /> 14 CORRIENTES VIVAS
                            </span>
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
                            Consola de Auditoría Forense & Telemetría Viva de Fuentes
                        </h1>
                        <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-4xl">
                            Inspección pericial en tiempo real para auditores y decisores del SINAGERD / COEN. Expone la fuente exacta, protocolo, payload íntegro de datos y el sello criptográfico SHA-256 clasificado según la doctrina oficial de certeza.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <button
                            onClick={() => {
                                fetchTelemetryFeed();
                                fetchCatalog();
                            }}
                            disabled={loadingStreams || loadingCatalog}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-all shadow-lg shadow-indigo-600/30"
                        >
                            <RefreshCw className={`w-3.5 h-3.5 ${loadingStreams ? "animate-spin" : ""}`} />
                            Sincronizar Telemetría
                        </button>
                    </div>
                </div>

                {/* DOCTRINA DE CERTEZA Y PROCEDENCIA DE DATOS: 4 CARDS DE SIGNIFICADO */}
                <div className="mt-6 pt-5 border-t border-indigo-500/20">
                    <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2.5 flex items-center justify-between">
                        <span>Doctrina de Certeza de Datos AMARU (Haz clic en un nivel para filtrar):</span>
                        <span className="text-indigo-400 font-normal">Filtro activo: {filterPedigree === "ALL" ? "Mostrando Todo" : filterPedigree}</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        {/* 1. VERDE ESMERALDA */}
                        <div
                            onClick={() => setFilterPedigree(filterPedigree === "DATO_OFICIAL_VALIDADO" ? "ALL" : "DATO_OFICIAL_VALIDADO")}
                            className={`p-3 rounded-xl border cursor-pointer transition-all ${
                                filterPedigree === "DATO_OFICIAL_VALIDADO"
                                    ? "bg-emerald-950/80 border-emerald-400 ring-2 ring-emerald-500/50 shadow-lg shadow-emerald-900/40"
                                    : "bg-slate-900/90 border-emerald-500/30 hover:border-emerald-500/60"
                            }`}
                        >
                            <div className="flex items-center justify-between">
                                <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block shadow-sm shadow-emerald-400" />
                                    DATO OFICIAL VALIDADO
                                </span>
                                <span className="px-1.5 py-0.5 text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 rounded border border-emerald-500/40">
                                    100% Certeza
                                </span>
                            </div>
                            <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                                Sensor físico in-situ, radar polarimétrico, telemetría SCADA oficial o expediente técnico aprobado.
                            </p>
                            <div className="text-[10px] text-emerald-400/80 font-mono mt-2 flex items-center justify-between">
                                <span>SENAMHI, ANA, IMARPE, COES, SUNASS</span>
                                <span className="font-bold bg-emerald-900/50 px-1.5 py-0.2 rounded">{totalOficiales} fuentes</span>
                            </div>
                        </div>

                        {/* 2. ÁMBAR RADIANTE */}
                        <div
                            onClick={() => setFilterPedigree(filterPedigree === "INFERENCIA_ALGORITMICA" ? "ALL" : "INFERENCIA_ALGORITMICA")}
                            className={`p-3 rounded-xl border cursor-pointer transition-all ${
                                filterPedigree === "INFERENCIA_ALGORITMICA"
                                    ? "bg-amber-950/80 border-amber-400 ring-2 ring-amber-500/50 shadow-lg shadow-amber-900/40"
                                    : "bg-slate-900/90 border-amber-500/30 hover:border-amber-500/60"
                            }`}
                        >
                            <div className="flex items-center justify-between">
                                <span className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
                                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block shadow-sm shadow-amber-400" />
                                    INFERENCIA ALGORÍTMICA
                                </span>
                                <span className="px-1.5 py-0.5 text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 rounded border border-amber-500/40">
                                    85 - 90%
                                </span>
                            </div>
                            <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                                Fórmulas físicas e hidráulicas inversas ejecutadas por AMARU (turbidez Ss = a·Q^b, horas de reserva T = V/Q, IRD-FLUV).
                            </p>
                            <div className="text-[10px] text-amber-400/80 font-mono mt-2 flex items-center justify-between">
                                <span>Kernel Saint-Venant / Lifelines C2</span>
                                <span className="font-bold bg-amber-900/50 px-1.5 py-0.2 rounded">{totalInferencias} inferencias</span>
                            </div>
                        </div>

                        {/* 3. PÚRPURA AYNI */}
                        <div
                            onClick={() => setFilterPedigree(filterPedigree === "GROUND_TRUTH_VERIFICADO" ? "ALL" : "GROUND_TRUTH_VERIFICADO")}
                            className={`p-3 rounded-xl border cursor-pointer transition-all ${
                                filterPedigree === "GROUND_TRUTH_VERIFICADO"
                                    ? "bg-purple-950/80 border-purple-400 ring-2 ring-purple-500/50 shadow-lg shadow-purple-900/40"
                                    : "bg-slate-900/90 border-purple-500/30 hover:border-purple-500/60"
                            }`}
                        >
                            <div className="flex items-center justify-between">
                                <span className="flex items-center gap-1.5 text-xs font-bold text-purple-400">
                                    <span className="w-2.5 h-2.5 rounded-full bg-purple-500 inline-block shadow-sm shadow-purple-400" />
                                    GROUND-TRUTH EN CAMPO
                                </span>
                                <span className="px-1.5 py-0.5 text-[10px] font-mono font-bold bg-purple-500/20 text-purple-300 rounded border border-purple-500/40">
                                    92% Certeza
                                </span>
                            </div>
                            <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                                Reporte humano verificado por Serenazgo, Defensa Civil o AYNI PWA con geocerca, foto y sello SHA-256 inmutable.
                            </p>
                            <div className="text-[10px] text-purple-400/80 font-mono mt-2 flex items-center justify-between">
                                <span>Red Ciudadana / Serenazgo Comunal</span>
                                <span className="font-bold bg-purple-900/50 px-1.5 py-0.2 rounded">{totalGroundTruth} reportes</span>
                            </div>
                        </div>

                        {/* 4. AZUL / CIAN SIMULACIÓN */}
                        <div
                            onClick={() => setFilterPedigree(filterPedigree === "SIMULACION_TACTICA_C2" ? "ALL" : "SIMULACION_TACTICA_C2")}
                            className={`p-3 rounded-xl border cursor-pointer transition-all ${
                                filterPedigree === "SIMULACION_TACTICA_C2"
                                    ? "bg-cyan-950/80 border-cyan-400 ring-2 ring-cyan-500/50 shadow-lg shadow-cyan-900/40"
                                    : "bg-slate-900/90 border-cyan-500/30 hover:border-cyan-500/60"
                            }`}
                        >
                            <div className="flex items-center justify-between">
                                <span className="flex items-center gap-1.5 text-xs font-bold text-cyan-400">
                                    <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 inline-block shadow-sm shadow-cyan-400" />
                                    SIMULACIÓN TÁCTICA C2
                                </span>
                                <span className="px-1.5 py-0.5 text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 rounded border border-cyan-500/40">
                                    0% (Hipótesis)
                                </span>
                            </div>
                            <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                                Parámetro forzado en controles por analistas para testeo de contingencias, resiliencia hospitalaria y simulacros.
                            </p>
                            <div className="text-[10px] text-cyan-400/80 font-mono mt-2 flex items-center justify-between">
                                <span>Simuladores COEN / Controles C2</span>
                                <span className="font-bold bg-cyan-900/50 px-1.5 py-0.2 rounded">{totalSimulacion} escenarios</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* SELECTOR DE VISTA: TELEMETRÍA VIVA VS CATÁLOGO MAESTRO */}
            <div className="flex border-b border-slate-800 bg-slate-900/50 p-1.5 rounded-xl gap-2">
                <button
                    onClick={() => setActiveTab("TELEMETRIA_VIVA")}
                    className={`flex-1 py-2.5 px-4 rounded-lg font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 ${
                        activeTab === "TELEMETRIA_VIVA"
                            ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                            : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                    }`}
                >
                    <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
                    <span>⚡ Telemetría Viva & Payloads en Tiempo Real</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-900/80 text-indigo-200">
                        {streams.length} Corrientes
                    </span>
                </button>
                <button
                    onClick={() => setActiveTab("INVENTARIO_MAESTRO")}
                    className={`flex-1 py-2.5 px-4 rounded-lg font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 ${
                        activeTab === "INVENTARIO_MAESTRO"
                            ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                            : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                    }`}
                >
                    <Database className="w-4 h-4 text-sky-400" />
                    <span>🏛️ Catálogo Maestro Regulado (27 Fuentes)</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-900/80 text-sky-200">
                        {fuentes.length} Registradas
                    </span>
                </button>
            </div>

            {/* TAB 1: TELEMETRÍA VIVA CON BLOQUES DESPLEGABLES */}
            {activeTab === "TELEMETRIA_VIVA" && (
                <div className="space-y-4">
                    {/* BARRA DE BÚSQUEDA Y FILTRADO AVANZADO */}
                    <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
                        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                            <span className="text-slate-400 font-semibold flex items-center gap-1">
                                <Filter className="w-3.5 h-3.5 text-indigo-400" /> Sector:
                            </span>
                            {[
                                { id: "ALL", label: "Todos los Sectores" },
                                { id: "HIDROMETEOROLOGÍA", label: "Hidrometeorología" },
                                { id: "OCEANOGRAFÍA", label: "Oceanografía" },
                                { id: "RECURSOS_HIDRICOS", label: "Recursos Hídricos" },
                                { id: "AGUA_Y_SANEAMIENTO", label: "Agua (PTAPs)" },
                                { id: "ENERGÍA_ELECTRICA", label: "Energía (SE 220kV)" },
                                { id: "INTELIGENCIA_C2", label: "Inteligencia AMARU" },
                                { id: "COMUNIDAD_AYNI", label: "Comunidad AYNI" }
                            ].map((sec) => (
                                <button
                                    key={sec.id}
                                    onClick={() => setFilterSector(sec.id)}
                                    className={`px-2.5 py-1 rounded-lg transition-all font-medium text-[11px] ${
                                        filterSector === sec.id
                                            ? "bg-indigo-600 text-white font-bold"
                                            : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                                    }`}
                                >
                                    {sec.label}
                                </button>
                            ))}
                        </div>

                        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                            <div className="relative w-full md:w-56">
                                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Buscar en telemetría..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-slate-200 focus:outline-none focus:border-indigo-500 text-xs"
                                />
                            </div>

                            <button
                                onClick={expandAllStreams}
                                className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-medium whitespace-nowrap"
                            >
                                Expandir Todos
                            </button>
                            <button
                                onClick={collapseAllStreams}
                                className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-medium whitespace-nowrap"
                            >
                                Colapsar Todos
                            </button>
                        </div>
                    </div>

                    {/* LISTADO DE BLOQUES DESPLEGABLES DE TELEMETRÍA */}
                    {loadingStreams ? (
                        <div className="p-12 text-center text-slate-400 bg-slate-900 rounded-2xl border border-slate-800">
                            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3 text-indigo-400" />
                            <p className="font-semibold text-slate-200">Sondeando corrientes de telemetría en tiempo real...</p>
                            <p className="text-xs text-slate-500 mt-1">Verificando firmas SHA-256 e integraciones con SENAMHI, ANA, IMARPE y COES.</p>
                        </div>
                    ) : filteredStreams.length === 0 ? (
                        <div className="p-12 text-center text-slate-400 bg-slate-900 rounded-2xl border border-slate-800">
                            <AlertTriangle className="w-8 h-8 mx-auto mb-3 text-amber-400" />
                            <p className="font-semibold text-slate-200">No se encontraron corrientes con los filtros seleccionados.</p>
                            <button
                                onClick={() => {
                                    setFilterPedigree("ALL");
                                    setFilterSector("ALL");
                                    setSearchQuery("");
                                }}
                                className="mt-3 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg"
                            >
                                Restablecer Filtros
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {filteredStreams.map((stream) => {
                                const isExpanded = expandedStreamIds.has(stream.id);
                                const isRawView = rawJsonViewMap[stream.id] || false;
                                const isProbing = probingStreamId === stream.id;

                                // Color dinámico según Pedigree
                                const isVerde = stream.pedigree.codigo === "DATO_OFICIAL_VALIDADO";
                                const isAmbar = stream.pedigree.codigo === "INFERENCIA_ALGORITMICA";
                                const isPurpura = stream.pedigree.codigo === "GROUND_TRUTH_VERIFICADO";
                                const isAzul = stream.pedigree.codigo === "SIMULACION_TACTICA_C2";

                                const borderStyle = isVerde
                                    ? "border-emerald-500/40 hover:border-emerald-500/70"
                                    : isAmbar
                                    ? "border-amber-500/40 hover:border-amber-500/70"
                                    : isPurpura
                                    ? "border-purple-500/40 hover:border-purple-500/70"
                                    : "border-cyan-500/40 hover:border-cyan-500/70";

                                const headerBg = isVerde
                                    ? "from-slate-900 via-emerald-950/20 to-slate-900"
                                    : isAmbar
                                    ? "from-slate-900 via-amber-950/20 to-slate-900"
                                    : isPurpura
                                    ? "from-slate-900 via-purple-950/20 to-slate-900"
                                    : "from-slate-900 via-cyan-950/20 to-slate-900";

                                return (
                                    <div
                                        key={stream.id}
                                        className={`bg-slate-900 rounded-2xl border transition-all shadow-md overflow-hidden ${borderStyle}`}
                                    >
                                        {/* CABECERA COLAPSIBLE (SIEMPRE VISIBLE) */}
                                        <div
                                            onClick={() => toggleExpandStream(stream.id)}
                                            className={`p-4 bg-gradient-to-r ${headerBg} cursor-pointer flex flex-col md:flex-row items-start md:items-center justify-between gap-3 select-none`}
                                        >
                                            <div className="flex items-start md:items-center gap-3">
                                                {/* BADGE DE PEDIGREE OFICIAL */}
                                                <div className="flex-shrink-0 mt-0.5 md:mt-0">
                                                    <span
                                                        className="px-2.5 py-1 rounded-md text-[11px] font-bold tracking-tight inline-flex items-center gap-1.5 shadow-sm"
                                                        style={{
                                                            backgroundColor: `${stream.pedigree.color_hex}22`,
                                                            color: stream.pedigree.color_hex,
                                                            border: `1px solid ${stream.pedigree.color_hex}66`
                                                        }}
                                                    >
                                                        <span
                                                            className="w-2 h-2 rounded-full inline-block animate-pulse"
                                                            style={{ backgroundColor: stream.pedigree.color_hex }}
                                                        />
                                                        {stream.pedigree.insignia} ({stream.pedigree.grado_certeza_pct}%)
                                                    </span>
                                                </div>

                                                <div>
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <h3 className="text-sm font-bold text-white tracking-tight">
                                                            {stream.nombre}
                                                        </h3>
                                                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300 border border-slate-700">
                                                            {stream.ente}
                                                        </span>
                                                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-indigo-950/60 text-indigo-300 border border-indigo-800/40">
                                                            {stream.sector.replace(/_/g, " ")}
                                                        </span>
                                                    </div>
                                                    <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">
                                                        {stream.resumen_ejecutivo}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3 self-end md:self-center">
                                                <div className="text-right text-[11px] font-mono">
                                                    <div className="flex items-center justify-end gap-1.5 text-slate-300">
                                                        <Activity className="w-3 h-3 text-emerald-400" />
                                                        <span>{stream.latencia_ms} ms</span>
                                                        <span>•</span>
                                                        <span className="text-slate-400">
                                                            {new Date(stream.ultimo_sync_utc).toLocaleTimeString("es-PE")}
                                                        </span>
                                                    </div>
                                                    <div className="text-[10px] text-slate-500 truncate max-w-[180px]">
                                                        Hash: {stream.sello_sha256.substring(0, 10)}...
                                                    </div>
                                                </div>

                                                <div className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white">
                                                    {isExpanded ? (
                                                        <ChevronUp className="w-4 h-4" />
                                                    ) : (
                                                        <ChevronDown className="w-4 h-4" />
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* CUERPO EXPANDIDO: INSPECTOR AUDITOR COMPLETO */}
                                        {isExpanded && (
                                            <div className="p-5 border-t border-slate-800/80 bg-slate-950/60 space-y-4">
                                                {/* 1. FUENTE EXACTA & PROTOCOLO DE EXTRACCIÓN */}
                                                <div className="bg-slate-900/90 p-3.5 rounded-xl border border-slate-800">
                                                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
                                                        <div>
                                                            <span className="text-slate-400 font-semibold uppercase text-[10px] tracking-wider block">
                                                                FUENTE EXACTA / ENDPOINT DE INGESTA
                                                            </span>
                                                            <div className="flex items-center gap-2 mt-0.5">
                                                                <code className="font-mono text-xs text-sky-300 bg-slate-950 px-2 py-1 rounded border border-slate-800 break-all select-all">
                                                                    {stream.endpoint_exacto}
                                                                </code>
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleCopy(stream.endpoint_exacto, stream.id, "url");
                                                                    }}
                                                                    className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
                                                                    title="Copiar URL"
                                                                >
                                                                    {copiedUrlId === stream.id ? (
                                                                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                                                                    ) : (
                                                                        <Copy className="w-3.5 h-3.5" />
                                                                    )}
                                                                </button>
                                                                {stream.endpoint_exacto.startsWith("http") && (
                                                                    <a
                                                                        href={stream.endpoint_exacto}
                                                                        target="_blank"
                                                                        rel="noreferrer"
                                                                        className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-sky-400"
                                                                        title="Abrir en nueva pestaña"
                                                                    >
                                                                        <ExternalLink className="w-3.5 h-3.5" />
                                                                    </a>
                                                                )}
                                                            </div>
                                                        </div>

                                                        <div className="sm:text-right">
                                                            <span className="text-slate-400 font-semibold uppercase text-[10px] tracking-wider block">
                                                                PROTOCOLO & FRECUENCIA
                                                            </span>
                                                            <span className="font-mono text-[11px] text-slate-200 block">
                                                                {stream.protocolo}
                                                            </span>
                                                            <span className="text-[10px] text-slate-400">
                                                                {stream.frecuencia}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* 2. DICTAMEN EJECUTIVO Y DOCTRINA DE CERTEZA */}
                                                <div
                                                    className="p-3.5 rounded-xl border text-xs"
                                                    style={{
                                                        backgroundColor: `${stream.pedigree.color_hex}0d`,
                                                        borderColor: `${stream.pedigree.color_hex}33`
                                                    }}
                                                >
                                                    <div className="flex items-center gap-2 font-bold mb-1" style={{ color: stream.pedigree.color_hex }}>
                                                        <ShieldCheck className="w-4 h-4" />
                                                        <span>Doctrina de Certeza: {stream.pedigree.nombre}</span>
                                                    </div>
                                                    <p className="text-slate-300 leading-relaxed text-[11px]">
                                                        {stream.pedigree.doctrina || stream.pedigree.significado}
                                                    </p>
                                                    <div className="mt-2 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-400">
                                                        <span><strong>Marco Legal / Regulatorio:</strong> {stream.norma_marco_legal}</span>
                                                        <span className="font-mono text-emerald-400">Estado: {stream.estado_salud}</span>
                                                    </div>
                                                </div>

                                                {/* 3. VISOR DE INFORMACIÓN ÚLTIMA (PAYLOAD VIVO) */}
                                                <div>
                                                    <div className="flex items-center justify-between mb-2">
                                                        <span className="text-xs font-bold text-white flex items-center gap-1.5">
                                                            <Terminal className="w-3.5 h-3.5 text-indigo-400" />
                                                            Última Información Extraída que Fluye en AMARU-CLIMATE:
                                                        </span>
                                                        <div className="flex items-center gap-2">
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    toggleRawJsonView(stream.id);
                                                                }}
                                                                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-mono flex items-center gap-1"
                                                            >
                                                                {isRawView ? (
                                                                    <>
                                                                        <Eye className="w-3 h-3 text-sky-400" /> Vista Ejecutiva
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <Code className="w-3 h-3 text-amber-400" /> JSON Crudo
                                                                    </>
                                                                )}
                                                            </button>
                                                        </div>
                                                    </div>

                                                    {isRawView ? (
                                                        /* JSON Crudo con Sintaxis y Estilo Terminal */
                                                        <div className="relative">
                                                            <pre className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-[11px] font-mono text-emerald-300 overflow-x-auto select-all max-h-72">
                                                                {JSON.stringify(stream.ultimo_payload, null, 2)}
                                                            </pre>
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleCopy(JSON.stringify(stream.ultimo_payload, null, 2), stream.id, "hash");
                                                                }}
                                                                className="absolute top-3 right-3 px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[10px] font-mono flex items-center gap-1"
                                                            >
                                                                {copiedHashId === stream.id ? (
                                                                    <>
                                                                        <Check className="w-3 h-3 text-emerald-400" /> Copiado
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <Copy className="w-3 h-3" /> Copiar JSON
                                                                    </>
                                                                )}
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        /* Vista Ejecutiva Formateada en Grilla */
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                                                            {Object.entries(stream.ultimo_payload).map(([k, v]) => (
                                                                <div
                                                                    key={k}
                                                                    className="bg-slate-900/90 p-2.5 rounded-lg border border-slate-800/80"
                                                                >
                                                                    <div className="text-[10px] text-slate-400 font-mono uppercase tracking-wider truncate">
                                                                        {k.replace(/_/g, " ")}
                                                                    </div>
                                                                    <div className="text-xs font-bold text-white mt-0.5 break-words">
                                                                        {typeof v === "object"
                                                                            ? JSON.stringify(v)
                                                                            : String(v)}
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>

                                                {/* 4. SELLO CRIPTOGRÁFICO SHA-256 & ACCIONES DE AUDITORÍA */}
                                                <div className="pt-3 border-t border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                                                    <div className="flex items-center gap-2 w-full sm:w-auto">
                                                        <Lock className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                                                        <span className="text-[11px] text-slate-400 font-mono">
                                                            SHA-256:
                                                        </span>
                                                        <span className="font-mono text-[11px] text-amber-300 bg-slate-950 px-2 py-0.5 rounded border border-slate-800 truncate select-all">
                                                            {stream.sello_sha256}
                                                        </span>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleCopy(stream.sello_sha256, stream.id, "hash");
                              }}
                                                            className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
                                                            title="Copiar Hash SHA-256"
                                                        >
                                                            {copiedHashId === stream.id ? (
                                                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                                                            ) : (
                                                                <Copy className="w-3.5 h-3.5" />
                                                            )}
                                                        </button>
                                                    </div>

                                                    <div className="flex items-center gap-2 self-end sm:self-auto">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleProbeStream(stream.id);
                                                            }}
                                                            disabled={isProbing}
                                                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-[11px] transition-all shadow-md shadow-indigo-600/30 disabled:opacity-50"
                                                        >
                                                            <Activity className={`w-3.5 h-3.5 ${isProbing ? "animate-spin" : ""}`} />
                                                            {isProbing ? "Sondeando..." : "Sondear en Caliente / Re-certificar"}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            {/* TAB 2: CATÁLOGO MAESTRO REGULADO (27 FUENTES) */}
            {activeTab === "INVENTARIO_MAESTRO" && (
                <div className="space-y-4">
                    {/* FILTRO POR TIER */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900/90 p-4 rounded-xl border border-slate-800 text-xs">
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="text-slate-400 font-semibold flex items-center gap-1 mr-1">
                                <Filter className="w-3.5 h-3.5 text-indigo-400" /> Filtrar por Tier Regulador:
                            </span>
                            {[
                                { id: "ALL", label: "Todas las Fuentes" },
                                { id: "TIER_1_OFICIAL_ESTATAL", label: "Tier 1: Estatal (.gob.pe)" },
                                { id: "TIER_2_INSTITUCIONAL_INTERNACIONAL", label: "Tier 2: Internacional" },
                                { id: "TIER_3_MEDIOS_REGIONALES_VERIFICADOS", label: "Tier 3: Regional" },
                                { id: "TIER_4_OSINT_CIUDADANO_ACOTADO", label: "Tier 4: Social / Ayni" }
                            ].map((t) => (
                                <button
                                    key={t.id}
                                    onClick={() => setFilterTier(t.id)}
                                    className={`px-3 py-1.5 rounded-lg transition-all font-medium ${
                                        filterTier === t.id
                                            ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                                            : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                                    }`}
                                >
                                    {t.label}
                                </button>
                            ))}
                        </div>

                        <div className="relative w-full sm:w-64">
                            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Buscar en catálogo..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-slate-200 focus:outline-none focus:border-indigo-500 text-xs"
                            />
                        </div>
                    </div>

                    {/* TABLA PRINCIPAL DE FUENTES OFICIALES */}
                    <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs border-collapse">
                                <thead>
                                    <tr className="border-b border-slate-800 bg-slate-950 text-slate-400 uppercase font-semibold tracking-wider">
                                        <th className="p-4">Fuente / Ente Oficial</th>
                                        <th className="p-4">Tier & Categoría</th>
                                        <th className="p-4">Frecuencia</th>
                                        <th className="p-4">Estado C2 & Latencia</th>
                                        <th className="p-4">Última Sincronización</th>
                                        <th className="p-4 text-right">Acción Operativa</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                                    {loadingCatalog ? (
                                        <tr>
                                            <td colSpan={6} className="p-8 text-center text-slate-500">
                                                <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-400" />
                                                Cargando inventario de fuentes del Agente KURAQ...
                                            </td>
                                        </tr>
                                    ) : filteredFuentes.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="p-8 text-center text-slate-500">
                                                No se encontraron fuentes coincidentes con el filtro seleccionado.
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredFuentes.map((fuente) => (
                                            <tr key={fuente.id} className="hover:bg-slate-800/40 transition-colors">
                                                <td className="p-4">
                                                    <div className="font-bold text-white flex items-center gap-2">
                                                        {fuente.nombre}
                                                        {fuente.conector_especializado_activo && (
                                                            <span className="px-1.5 py-0.5 text-[10px] rounded bg-sky-500/20 text-sky-300 border border-sky-500/30">
                                                                CONECTOR VIVO
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-2">
                                                        <span className="font-mono text-indigo-300">{fuente.ente}</span>
                                                        <span>•</span>
                                                        <a
                                                            href={fuente.endpoint}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="text-slate-400 hover:text-sky-300 flex items-center gap-0.5 underline truncate max-w-xs"
                                                        >
                                                            {fuente.endpoint}
                                                            <ExternalLink className="w-2.5 h-2.5" />
                                                        </a>
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <span
                                                        className={`px-2 py-0.5 rounded font-mono text-[10px] font-semibold block w-fit mb-1 ${
                                                            fuente.tier.includes("TIER_1")
                                                                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                                                                : fuente.tier.includes("TIER_2")
                                                                ? "bg-sky-500/20 text-sky-300 border border-sky-500/30"
                                                                : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                                                        }`}
                                                    >
                                                        {fuente.tier.replace(/_/g, " ")}
                                                    </span>
                                                    <span className="text-[11px] text-slate-400">{fuente.categoria}</span>
                                                </td>
                                                <td className="p-4">
                                                    <span className="text-slate-200 font-mono">
                                                        {fuente.frecuencia_minutos >= 1440
                                                            ? `${Math.round(fuente.frecuencia_minutos / 1440)} Días (24h)`
                                                            : fuente.frecuencia_minutos >= 60
                                                            ? `${Math.round(fuente.frecuencia_minutos / 60)} Horas`
                                                            : `${fuente.frecuencia_minutos} Minutos`}
                                                    </span>
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex items-center gap-2">
                                                        <span
                                                            className={`w-2 h-2 rounded-full ${
                                                                fuente.estado_salud.includes("OK") ||
                                                                fuente.estado_salud.includes("ACTIVO") ||
                                                                fuente.estado_salud.includes("OPERATIVO")
                                                                    ? "bg-emerald-400 animate-pulse"
                                                                    : fuente.estado_salud.includes("DEGRADADO")
                                                                    ? "bg-amber-400"
                                                                    : "bg-red-400"
                                                            }`}
                                                        />
                                                        <span className="font-semibold text-slate-200">
                                                            {fuente.estado_salud}
                                                        </span>
                                                    </div>
                                                    {fuente.latencia_ms > 0 && (
                                                        <span className="text-[10px] text-slate-400 font-mono">
                                                            Latencia: {fuente.latencia_ms} ms
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="p-4">
                                                    <span className="text-slate-300 font-mono block">
                                                        {fuente.ultimo_sync_utc
                                                            ? new Date(fuente.ultimo_sync_utc).toLocaleTimeString("es-PE")
                                                            : "En cola programada"}
                                                    </span>
                                                    {fuente.ultimo_hash_sha256 && (
                                                        <span
                                                            className="text-[10px] text-indigo-400 font-mono underline cursor-pointer"
                                                            title={fuente.ultimo_hash_sha256}
                                                            onClick={() =>
                                                                setAuditModalItem({
                                                                    source_id: fuente.id,
                                                                    hash_sha256: fuente.ultimo_hash_sha256,
                                                                    timestamp_utc: fuente.ultimo_sync_utc
                                                                })
                                                            }
                                                        >
                                                            SHA-256: {fuente.ultimo_hash_sha256.substring(0, 12)}...
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="p-4 text-right">
                                                    <button
                                                        onClick={() => handleSyncCatalogSource(fuente.id)}
                                                        disabled={syncingId === fuente.id}
                                                        className="px-3 py-1.5 rounded-lg bg-indigo-600/90 hover:bg-indigo-500 text-white font-semibold transition-all shadow-md shadow-indigo-600/20 disabled:opacity-50 text-[11px]"
                                                    >
                                                        {syncingId === fuente.id ? (
                                                            <span className="flex items-center gap-1">
                                                                <RefreshCw className="w-3 h-3 animate-spin" /> Ingestando...
                                                            </span>
                                                        ) : (
                                                            "Sincronizar"
                                                        )}
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL DE EVIDENCIA DIGITAL Y AUDITORÍA FORENSE SHA-256 */}
            {auditModalItem && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
                    <div className="bg-slate-900 border border-indigo-500/40 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                            <div className="flex items-center gap-2">
                                <FileCheck2 className="w-5 h-5 text-emerald-400" />
                                <h3 className="font-bold text-white text-base">
                                    Certificado de Ingesta & Evidencia Digital
                                </h3>
                            </div>
                            <button
                                onClick={() => setAuditModalItem(null)}
                                className="text-slate-400 hover:text-white text-sm"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="space-y-3 text-xs">
                            <div>
                                <span className="text-slate-400 block">Identificador de Fuente:</span>
                                <span className="font-mono font-bold text-indigo-300">
                                    {auditModalItem.source_id}
                                </span>
                            </div>

                            <div>
                                <span className="text-slate-400 block">Estado de Ingesta:</span>
                                <span className="font-semibold text-emerald-400">
                                    {auditModalItem.estado || "SINCRONIZADO_CON_EXITO"}
                                </span>
                            </div>

                            <div>
                                <span className="text-slate-400 block">Firma Criptográfica SHA-256:</span>
                                <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 font-mono text-[11px] text-amber-300 break-all select-all">
                                    {auditModalItem.hash_sha256}
                                </div>
                            </div>

                            <div>
                                <span className="text-slate-400 block">Sellado de Tiempo UTC (RFC 3161):</span>
                                <span className="font-mono text-slate-300">{auditModalItem.timestamp_utc}</span>
                            </div>

                            <div className="p-3 bg-indigo-950/40 border border-indigo-500/20 rounded-lg text-slate-300 text-[11px]">
                                ⚖️ Conforme a la <strong>NTP-ISO/IEC 27037:2012</strong> (Cadena de custodia de evidencia digital) y al <strong>Decreto Supremo N° 115-2025-PCM</strong>. Este registro es legalmente vinculante ante auditorías de Contraloría General de la República (CGR) y procesos del fuero judicial (Art. 220 CPP).
                            </div>
                        </div>

                        <div className="flex justify-end pt-2">
                            <button
                                onClick={() => setAuditModalItem(null)}
                                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
                            >
                                Entendido / Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
