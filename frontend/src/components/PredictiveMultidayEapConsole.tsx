"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { API_BASE } from "@/config/api";
import {
    Clock,
    AlertTriangle,
    ShieldAlert,
    ShieldCheck,
    CloudRain,
    Droplets,
    Activity,
    Wind,
    Thermometer,
    Truck,
    Siren,
    Zap,
    Download,
    RefreshCw,
    Search,
    Filter,
    ChevronRight,
    MapPin,
    FileText,
    CheckCircle2,
    X,
    Building2,
    Info,
    ExternalLink,
    SlidersHorizontal,
    Send
} from "lucide-react";

interface PronosticoDia {
    dia_numero: number;
    lead_hours: number;
    fecha: string;
    dia_corto: string;
    lluvia_openmeteo_mm: number;
    factor_amplificacion_fen: number;
    lluvia_extrema_mm: number;
    cape_j_kg: number;
    suelo_saturacion_pct: number;
    caudal_glofas_m3s: number;
    temp_max: number;
    temp_min: number;
    nivel_alerta: "ROJO" | "NARANJA" | "AMARILLO" | "VERDE";
}

interface ProtocoloEAPFase {
    lead_time: string;
    lead_time_horas: number;
    fase: string;
    detonado: boolean;
    nivel_alerta: string;
    gatillo_cientifico: string;
    acciones_mandatadas: string[];
    ahorro_logistico_estimado?: string;
    infraestructura_a_proteger?: string[];
    albergues_y_evacuacion?: string;
    responsable_principal: string;
}

interface ProtocolosEAP {
    T_144h: ProtocoloEAPFase;
    T_72h: ProtocoloEAPFase;
    T_24h: ProtocoloEAPFase;
    protocolo_activo_dominante: string;
    requiere_detonacion_urgente: boolean;
}

interface DistritoPredictivo {
    ubigeo: string;
    distrito: string;
    provincia: string;
    departamento: string;
    latitud: number;
    longitud: number;
    poblacion: number;
    cuenca_id: string;
    cuenca_nombre: string;
    alerta_consolidada: "ROJO" | "NARANJA" | "AMARILLO" | "VERDE";
    lluvia_acumulada_7d_mm: number;
    max_lluvia_24h_mm: number;
    max_cape_j_kg: number;
    max_suelo_pct: number;
    max_glofas_m3s: number;
    pronostico_7dias: PronosticoDia[];
    protocolos_eap: ProtocolosEAP;
    puentes_vulnerables_caf: string[];
    cuencas_ciegas_sare: string[];
    amparo_legal: string;
}

interface FechaHorizonte {
    dia_numero: number;
    lead_hours: number;
    lead_label: string;
    fecha_iso: string;
    dia_corto: string;
}

interface MatrizPredictivaResponse {
    metadata: {
        sistema: string;
        norma_habilitante: string;
        horizonte_temporal: string;
        modo_operativo: string;
        fuentes_validadas: string[];
        fecha_emision_utc: string;
    };
    estadisticas: {
        total_distritos_evaluados: number;
        total_distritos_declarados_ds124: number;
        poblacion_protegida_total: number;
        conteo_alertas_semaforo: {
            ROJO: number;
            NARANJA: number;
            AMARILLO: number;
            VERDE: number;
        };
        conteo_protocolos_eap_activos: {
            T_144h: number;
            T_72h: number;
            T_24h: number;
            STANDBY: number;
        };
    };
    fechas_horizonte: FechaHorizonte[];
    distritos: DistritoPredictivo[];
    paginacion: {
        total: number;
        limit: number;
        offset: number;
        has_more: boolean;
    };
}

export default function PredictiveMultidayEapConsole() {
    const [mode, setMode] = useState<"LIVE" | "SIMULACION">("SIMULACION");
    const [loading, setLoading] = useState<boolean>(true);
    const [data, setData] = useState<MatrizPredictivaResponse | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Filtros
    const [filtroDept, setFiltroDept] = useState<string>("");
    const [filtroSemaforo, setFiltroSemaforo] = useState<string>("");
    const [filtroEAP, setFiltroEAP] = useState<string>("");
    const [searchQuery, setSearchQuery] = useState<string>("");

    // Modal de Detalle EAP y Detonación
    const [selectedDistrict, setSelectedDistrict] = useState<DistritoPredictivo | null>(null);
    const [districtDetailData, setDistrictDetailData] = useState<any | null>(null);
    const [loadingDetail, setLoadingDetail] = useState<boolean>(false);
    const [detonandoFase, setDetonandoFase] = useState<string | null>(null);
    const [detonacionExitosa, setDetonacionExitosa] = useState<any | null>(null);

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            let url = `${API_BASE}/api/predictivo/matriz-7dias?days=7&mode=${mode}&limit=120`;
            if (filtroDept) url += `&departamento=${encodeURIComponent(filtroDept)}`;
            if (filtroSemaforo) url += `&nivel=${encodeURIComponent(filtroSemaforo)}`;

            const res = await fetch(url);
            if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
            const json: MatrizPredictivaResponse = await res.json();
            setData(json);
        } catch (err: any) {
            console.error("Error fetching predictive matrix:", err);
            setError("No se pudo cargar la matriz predictiva multidía. Verifique la conexión con el backend.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [mode, filtroDept, filtroSemaforo]);

    // Cargar expediente distrital detallado
    const handleOpenDistrictDetail = async (dist: DistritoPredictivo) => {
        setSelectedDistrict(dist);
        setLoadingDetail(true);
        setDetonacionExitosa(null);
        try {
            const res = await fetch(`${API_BASE}/api/predictivo/distrito/${dist.ubigeo}/eap?mode=${mode}`);
            if (res.ok) {
                const detailJson = await res.json();
                setDistrictDetailData(detailJson);
            }
        } catch (e) {
            console.error("Error loading district detail:", e);
        } finally {
            setLoadingDetail(false);
        }
    };

    // Detonar acción EAP en vivo
    const handleDetonarEAP = async (fase: "T-144h" | "T-72h" | "T-24h") => {
        if (!selectedDistrict) return;
        setDetonandoFase(fase);
        try {
            const payload = {
                ubigeo: selectedDistrict.ubigeo,
                fase_lead_time: fase,
                autorizador: "Comando C2 AMARU-CLIMATE / Alcalde Distrital",
                observaciones: `Detonación formal bajo el D.S. Nº 124-2026-PCM ante pronóstico extremo a ${fase}.`
            };
            const res = await fetch(`${API_BASE}/api/predictivo/detonar-eap`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
            if (res.ok) {
                const detJson = await res.json();
                setDetonacionExitosa(detJson);
            }
        } catch (e) {
            console.error("Error detonating EAP:", e);
        } finally {
            setDetonandoFase(null);
        }
    };

    // Filtrado en cliente por buscador de texto y fase EAP
    const distritosFiltrados = useMemo(() => {
        if (!data?.distritos) return [];
        return data.distritos.filter(d => {
            const matchSearch = searchQuery === "" ||
                d.distrito.toLowerCase().includes(searchQuery.toLowerCase()) ||
                d.provincia.toLowerCase().includes(searchQuery.toLowerCase()) ||
                d.departamento.toLowerCase().includes(searchQuery.toLowerCase()) ||
                d.cuenca_nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
                d.ubigeo.includes(searchQuery);

            if (!matchSearch) return false;

            if (filtroEAP === "T-144h") return d.protocolos_eap.T_144h.detonado;
            if (filtroEAP === "T-72h") return d.protocolos_eap.T_72h.detonado;
            if (filtroEAP === "T-24h") return d.protocolos_eap.T_24h.detonado;

            return true;
        });
    }, [data, searchQuery, filtroEAP]);

    const getBadgeClass = (nivel: string) => {
        switch (nivel) {
            case "ROJO":
                return "bg-rose-500/20 text-rose-300 border-rose-500/50";
            case "NARANJA":
                return "bg-amber-500/20 text-amber-300 border-amber-500/50";
            case "AMARILLO":
                return "bg-yellow-500/20 text-yellow-300 border-yellow-500/50";
            default:
                return "bg-emerald-500/20 text-emerald-300 border-emerald-500/50";
        }
    };

    const getDayCellClass = (nivel: string) => {
        switch (nivel) {
            case "ROJO":
                return "bg-rose-950/70 border-rose-500/60 text-rose-200 shadow-sm shadow-rose-900/50";
            case "NARANJA":
                return "bg-amber-950/60 border-amber-500/50 text-amber-200";
            case "AMARILLO":
                return "bg-yellow-950/50 border-yellow-500/40 text-yellow-200";
            default:
                return "bg-slate-900/40 border-slate-700/50 text-slate-400";
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-cyan-500 selection:text-slate-950 pb-20">
            {/* Header Táctico */}
            <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-40 px-4 lg:px-8 py-3.5">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/30 border border-cyan-500/40 text-cyan-400 shadow-lg shadow-cyan-500/10">
                            <Clock className="w-6 h-6 animate-pulse" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                                    Módulo Predictivo Multidía (7 Días)
                                    <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                                        EAP v2.6
                                    </span>
                                </h1>
                            </div>
                            <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                                <span className="font-semibold text-slate-300">D.S. Nº 124-2026-PCM</span> • Matriz Consolidada de Precipitaciones y Protocolos de Acción Temprana (T-144h, T-72h, T-24h)
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 self-end md:self-auto">
                        {/* Selector de Modo */}
                        <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
                            <button
                                onClick={() => setMode("LIVE")}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                                    mode === "LIVE"
                                        ? "bg-cyan-500 text-slate-950 shadow-md font-semibold"
                                        : "text-slate-400 hover:text-slate-200"
                                }`}
                            >
                                <span className={`w-2 h-2 rounded-full ${mode === "LIVE" ? "bg-slate-950 animate-ping" : "bg-emerald-500"}`} />
                                LIVE (ECMWF 9km)
                            </button>
                            <button
                                onClick={() => setMode("SIMULACION")}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                                    mode === "SIMULACION"
                                        ? "bg-rose-500 text-white shadow-md font-semibold"
                                        : "text-slate-400 hover:text-slate-200"
                                }`}
                            >
                                <Zap className="w-3.5 h-3.5" />
                                SIMULACIÓN PICO FEN
                            </button>
                        </div>

                        <button
                            onClick={fetchData}
                            disabled={loading}
                            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
                            title="Recargar Telemetría"
                        >
                            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-cyan-400" : ""}`} />
                        </button>
                    </div>
                </div>
            </header>

            {/* Banner de Fundamentación Legal y Científica */}
            <div className="bg-gradient-to-r from-blue-950/40 via-cyan-950/30 to-slate-950 border-b border-cyan-900/30 px-4 lg:px-8 py-2.5">
                <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between text-xs gap-3">
                    <div className="flex items-center gap-2 text-cyan-300">
                        <Info className="w-4 h-4 shrink-0 text-cyan-400" />
                        <span>
                            <strong>Doctrina EAP (Early Action Protocols):</strong> Escalonamiento anticipatorio en <strong>T-144h</strong> (pre-posicionamiento terrestre sin corte de puentes, -92.8% costo), <strong>T-72h</strong> (maquinaria y motobombas SARE) y <strong>T-24h</strong> (evacuación de 229 manzanas censales ANA).
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-slate-400">Habilitante Presupuestal:</span>
                        <span className="font-mono text-cyan-300 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/60">
                            PP 0068 / TUO Ley 30225 Art. 27 lit. b
                        </span>
                    </div>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-4 lg:px-8 py-6 space-y-6">
                {/* Métricas Hero EAP */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {/* Tarjeta T-144h */}
                    <div
                        onClick={() => setFiltroEAP(filtroEAP === "T-144h" ? "" : "T-144h")}
                        className={`cursor-pointer rounded-2xl p-4 border transition-all relative overflow-hidden ${
                            filtroEAP === "T-144h"
                                ? "bg-amber-950/40 border-amber-400 ring-2 ring-amber-400/30"
                                : "bg-slate-900/60 border-slate-800 hover:border-amber-500/40"
                        }`}
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                                <Truck className="w-3.5 h-3.5" />
                                Fase T-144h (D-6)
                            </span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                6 Días Antes
                            </span>
                        </div>
                        <div className="mt-2 text-2xl font-black tracking-tight text-white">
                            {data?.estadisticas?.conteo_protocolos_eap_activos?.T_144h ?? "--"}
                            <span className="text-xs font-normal text-slate-400 ml-1.5">distritos activos</span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                            Pre-posicionamiento terrestre de BAH en camiones 10 TM a almacenes avanzados antes del colapso de puentes.
                        </p>
                    </div>

                    {/* Tarjeta T-72h */}
                    <div
                        onClick={() => setFiltroEAP(filtroEAP === "T-72h" ? "" : "T-72h")}
                        className={`cursor-pointer rounded-2xl p-4 border transition-all relative overflow-hidden ${
                            filtroEAP === "T-72h"
                                ? "bg-orange-950/40 border-orange-400 ring-2 ring-orange-400/30"
                                : "bg-slate-900/60 border-slate-800 hover:border-orange-500/40"
                        }`}
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold uppercase tracking-wider text-orange-400 flex items-center gap-1.5">
                                <Activity className="w-3.5 h-3.5" />
                                Fase T-72h (D-3)
                            </span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-300 border border-orange-500/30">
                                3 Días Antes
                            </span>
                        </div>
                        <div className="mt-2 text-2xl font-black tracking-tight text-white">
                            {data?.estadisticas?.conteo_protocolos_eap_activos?.T_72h ?? "--"}
                            <span className="text-xs font-normal text-slate-400 ml-1.5">distritos activos</span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                            Despliegue de maquinaria pesada, motobombas 4"-6" en cuencas ciegas SARE y stock de vacunas.
                        </p>
                    </div>

                    {/* Tarjeta T-24h */}
                    <div
                        onClick={() => setFiltroEAP(filtroEAP === "T-24h" ? "" : "T-24h")}
                        className={`cursor-pointer rounded-2xl p-4 border transition-all relative overflow-hidden ${
                            filtroEAP === "T-24h"
                                ? "bg-rose-950/40 border-rose-400 ring-2 ring-rose-400/30"
                                : "bg-slate-900/60 border-slate-800 hover:border-rose-500/40"
                        }`}
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
                                <Siren className="w-3.5 h-3.5 animate-bounce" />
                                Fase T-24h (D-1)
                            </span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                                24 Horas Antes
                            </span>
                        </div>
                        <div className="mt-2 text-2xl font-black tracking-tight text-white">
                            {data?.estadisticas?.conteo_protocolos_eap_activos?.T_24h ?? "--"}
                            <span className="text-xs font-normal text-slate-400 ml-1.5">distritos críticos</span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                            Evacuación perentoria en 229 manzanas ANA, cierre de puentes CAF y brigadas EDAN Zero-PII.
                        </p>
                    </div>

                    {/* Cobertura Total D.S. 124 */}
                    <div className="rounded-2xl p-4 border border-slate-800 bg-slate-900/60">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                                <ShieldCheck className="w-3.5 h-3.5" />
                                Cobertura D.S. 124
                            </span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                                Oficial
                            </span>
                        </div>
                        <div className="mt-2 text-2xl font-black tracking-tight text-white">
                            893
                            <span className="text-xs font-normal text-slate-400 ml-1.5">distritos amparados</span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1">
                            Población protegida: {(data?.estadisticas?.poblacion_protegida_total ?? 18450000).toLocaleString("es-PE")} hab.
                        </p>
                    </div>
                </div>

                {/* Barra de Filtros y Búsqueda */}
                <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="relative w-full md:w-80">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Buscar por distrito, provincia o cuenca..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition"
                        />
                    </div>

                    <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                        {/* Selector Departamento */}
                        <select
                            value={filtroDept}
                            onChange={(e) => setFiltroDept(e.target.value)}
                            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                        >
                            <option value="">Todos los Departamentos</option>
                            <option value="PIURA">Piura (Prioridad 1)</option>
                            <option value="TUMBES">Tumbes</option>
                            <option value="LAMBAYEQUE">Lambayeque</option>
                            <option value="LA LIBERTAD">La Libertad</option>
                            <option value="ANCASH">Áncash</option>
                            <option value="LIMA">Lima</option>
                            <option value="ICA">Ica</option>
                            <option value="CAJAMARCA">Cajamarca</option>
                            <option value="PUNO">Puno (Sierra Sur Bipolar)</option>
                        </select>

                        {/* Selector Semáforo */}
                        <select
                            value={filtroSemaforo}
                            onChange={(e) => setFiltroSemaforo(e.target.value)}
                            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                        >
                            <option value="">Todas las Alertas</option>
                            <option value="ROJO">Alerta Roja</option>
                            <option value="NARANJA">Alerta Naranja</option>
                            <option value="AMARILLO">Alerta Amarilla</option>
                            <option value="VERDE">Alerta Verde</option>
                        </select>

                        {/* Reset Filters */}
                        {(filtroDept || filtroSemaforo || filtroEAP || searchQuery) && (
                            <button
                                onClick={() => {
                                    setFiltroDept("");
                                    setFiltroSemaforo("");
                                    setFiltroEAP("");
                                    setSearchQuery("");
                                }}
                                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 transition"
                            >
                                Limpiar Filtros
                            </button>
                        )}
                    </div>
                </div>

                {/* Matriz Multidía Consolidada a 7 Días */}
                <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
                    <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                        <div>
                            <h2 className="text-sm font-bold text-white flex items-center gap-2">
                                <CloudRain className="w-4 h-4 text-cyan-400" />
                                Matriz de Pronóstico a 7 Días & Pipeline EAP
                            </h2>
                            <p className="text-xs text-slate-400 mt-0.5">
                                Mostrando {distritosFiltrados.length} distritos priorizados con simulación termo-hidrodinámica calibrada.
                            </p>
                        </div>

                        <div className="flex items-center gap-2 text-xs text-slate-400">
                            <span className="flex items-center gap-1.5">
                                <span className="w-2.5 h-2.5 rounded bg-rose-500" /> &gt;35 mm/d (Rojo)
                            </span>
                            <span className="flex items-center gap-1.5 ml-2">
                                <span className="w-2.5 h-2.5 rounded bg-amber-500" /> &gt;18 mm/d (Naranja)
                            </span>
                            <span className="flex items-center gap-1.5 ml-2">
                                <span className="w-2.5 h-2.5 rounded bg-yellow-500" /> &gt;6 mm/d (Amarillo)
                            </span>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider sticky top-0">
                                <tr>
                                    <th className="py-3 px-4">Distrito / Cuenca</th>
                                    <th className="py-3 px-3">Semáforo</th>
                                    <th className="py-3 px-3">Lámina 7D</th>
                                    <th className="py-3 px-3">Gatillo EAP</th>
                                    {data?.fechas_horizonte?.map((fh) => (
                                        <th key={fh.dia_numero} className="py-3 px-2 text-center min-w-[75px]">
                                            <div className="font-bold text-slate-200">{fh.dia_corto}</div>
                                            <div className="text-[9px] text-cyan-400 font-mono">D+{fh.dia_numero}</div>
                                            <div className="text-[8px] text-slate-500">{fh.lead_label}</div>
                                        </th>
                                    ))}
                                    <th className="py-3 px-4 text-right">Acción C2</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/60">
                                {distritosFiltrados.map((dist) => (
                                    <tr
                                        key={dist.ubigeo}
                                        className="hover:bg-slate-800/40 transition group"
                                    >
                                        <td className="py-3 px-4">
                                            <div className="font-semibold text-white group-hover:text-cyan-300 transition">
                                                {dist.distrito}
                                            </div>
                                            <div className="text-[11px] text-slate-400">
                                                {dist.provincia}, {dist.departamento}
                                            </div>
                                            <div className="text-[10px] text-cyan-400/80 font-mono mt-0.5">
                                                {dist.cuenca_nombre}
                                            </div>
                                        </td>

                                        <td className="py-3 px-3">
                                            <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold border ${getBadgeClass(dist.alerta_consolidada)}`}>
                                                {dist.alerta_consolidada}
                                            </span>
                                        </td>

                                        <td className="py-3 px-3">
                                            <div className="font-mono font-bold text-white text-xs">
                                                {dist.lluvia_acumulada_7d_mm} mm
                                            </div>
                                            <div className="text-[10px] text-slate-400">
                                                Pico: {dist.max_lluvia_24h_mm} mm
                                            </div>
                                        </td>

                                        <td className="py-3 px-3">
                                            {dist.protocolos_eap.T_24h.detonado ? (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse">
                                                    <Siren className="w-3 h-3" /> T-24h
                                                </span>
                                            ) : dist.protocolos_eap.T_72h.detonado ? (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-orange-500/20 text-orange-300 border border-orange-500/40">
                                                    <Activity className="w-3 h-3" /> T-72h
                                                </span>
                                            ) : dist.protocolos_eap.T_144h.detonado ? (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                                                    <Truck className="w-3 h-3" /> T-144h
                                                </span>
                                            ) : (
                                                <span className="text-[10px] text-slate-500">Standby</span>
                                            )}
                                        </td>

                                        {/* Columnas Día +1 a Día +7 */}
                                        {dist.pronostico_7dias.map((d) => (
                                            <td key={d.dia_numero} className="py-2 px-1 text-center">
                                                <div className={`p-1.5 rounded-lg border text-[11px] font-mono transition-transform hover:scale-105 ${getDayCellClass(d.nivel_alerta)}`}>
                                                    <div className="font-bold">{d.lluvia_extrema_mm}</div>
                                                    <div className="text-[9px] opacity-75">mm</div>
                                                </div>
                                            </td>
                                        ))}

                                        <td className="py-3 px-4 text-right">
                                            <button
                                                onClick={() => handleOpenDistrictDetail(dist)}
                                                className="px-3 py-1.5 rounded-lg bg-cyan-600/20 hover:bg-cyan-600/40 text-cyan-300 border border-cyan-500/40 text-xs font-medium transition inline-flex items-center gap-1"
                                            >
                                                Ver EAP <ChevronRight className="w-3.5 h-3.5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>

            {/* Modal de Detalle Distrital EAP y Detonación C2 */}
            {selectedDistrict && (
                <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
                    <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 relative">
                        <button
                            onClick={() => setSelectedDistrict(null)}
                            className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="flex items-start gap-4">
                            <div className="p-3 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-400">
                                <Building2 className="w-7 h-7" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                    {selectedDistrict.distrito}
                                    <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold border ${getBadgeClass(selectedDistrict.alerta_consolidada)}`}>
                                        Alerta {selectedDistrict.alerta_consolidada}
                                    </span>
                                </h3>
                                <p className="text-xs text-slate-400 mt-1">
                                    Provincia de {selectedDistrict.provincia}, {selectedDistrict.departamento} • {selectedDistrict.cuenca_nombre} • UBIGEO: {selectedDistrict.ubigeo}
                                </p>
                            </div>
                        </div>

                        {/* Banner de Confirmación de Detonación Exitosa */}
                        {detonacionExitosa && (
                            <div className="mt-5 p-4 rounded-2xl bg-emerald-950/60 border border-emerald-500/60 text-emerald-200 animate-fadeIn">
                                <div className="flex items-center gap-2 font-bold text-sm">
                                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                                    <span>{detonacionExitosa.mensaje}</span>
                                </div>
                                <div className="mt-2 text-xs font-mono text-emerald-300/80 space-y-1">
                                    <div>ID Despacho: <strong>{detonacionExitosa.despacho?.id_despacho}</strong></div>
                                    <div>Hash SHA-256: <strong className="break-all">{detonacionExitosa.despacho?.hash_integridad_sha256}</strong></div>
                                    <div>Transmisión: C2 Red Nacional COEN / Fiscalía de Prevención del Delito</div>
                                </div>
                            </div>
                        )}

                        {/* Pipeline EAP Interactivo con Acciones de Detonación */}
                        <div className="mt-6 space-y-4">
                            <h4 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                                <SlidersHorizontal className="w-4 h-4 text-cyan-400" />
                                Protocolos de Acción Temprana Escalonados (EAP)
                            </h4>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {/* Fase T-144h */}
                                <div className="p-4 rounded-2xl bg-slate-950 border border-amber-500/30 flex flex-col justify-between">
                                    <div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                                                <Truck className="w-3.5 h-3.5" /> T-144h (D-6)
                                            </span>
                                            <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300">
                                                Estratégico
                                            </span>
                                        </div>
                                        <div className="mt-2 text-xs text-slate-300 font-medium">
                                            Pre-posicionamiento Terrestre
                                        </div>
                                        <p className="mt-1 text-[11px] text-slate-400">
                                            {selectedDistrict.protocolos_eap.T_144h.gatillo_cientifico}
                                        </p>
                                        <div className="mt-3 text-[10px] text-emerald-400 font-semibold">
                                            {selectedDistrict.protocolos_eap.T_144h.ahorro_logistico_estimado}
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleDetonarEAP("T-144h")}
                                        disabled={detonandoFase === "T-144h"}
                                        className="mt-4 w-full py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition disabled:opacity-50"
                                    >
                                        <Send className="w-3.5 h-3.5" />
                                        {detonandoFase === "T-144h" ? "Detonando..." : "Detonar T-144h"}
                                    </button>
                                </div>

                                {/* Fase T-72h */}
                                <div className="p-4 rounded-2xl bg-slate-950 border border-orange-500/30 flex flex-col justify-between">
                                    <div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-bold text-orange-400 flex items-center gap-1.5">
                                                <Activity className="w-3.5 h-3.5" /> T-72h (D-3)
                                            </span>
                                            <span className="text-[10px] px-2 py-0.5 rounded bg-orange-500/20 text-orange-300">
                                                Táctico
                                            </span>
                                        </div>
                                        <div className="mt-2 text-xs text-slate-300 font-medium">
                                            Maquinaria & Puntos SARE
                                        </div>
                                        <p className="mt-1 text-[11px] text-slate-400">
                                            {selectedDistrict.protocolos_eap.T_72h.gatillo_cientifico}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => handleDetonarEAP("T-72h")}
                                        disabled={detonandoFase === "T-72h"}
                                        className="mt-4 w-full py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition disabled:opacity-50"
                                    >
                                        <Send className="w-3.5 h-3.5" />
                                        {detonandoFase === "T-72h" ? "Detonando..." : "Detonar T-72h"}
                                    </button>
                                </div>

                                {/* Fase T-24h */}
                                <div className="p-4 rounded-2xl bg-slate-950 border border-rose-500/30 flex flex-col justify-between">
                                    <div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-bold text-rose-400 flex items-center gap-1.5">
                                                <Siren className="w-3.5 h-3.5" /> T-24h (D-1)
                                            </span>
                                            <span className="text-[10px] px-2 py-0.5 rounded bg-rose-500/20 text-rose-300">
                                                Operativo Inminente
                                            </span>
                                        </div>
                                        <div className="mt-2 text-xs text-slate-300 font-medium">
                                            Evacuación Perentoria 229 Manzanas
                                        </div>
                                        <p className="mt-1 text-[11px] text-slate-400">
                                            {selectedDistrict.protocolos_eap.T_24h.gatillo_cientifico}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => handleDetonarEAP("T-24h")}
                                        disabled={detonandoFase === "T-24h"}
                                        className="mt-4 w-full py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition disabled:opacity-50"
                                    >
                                        <Send className="w-3.5 h-3.5" />
                                        {detonandoFase === "T-24h" ? "Detonando..." : "Detonar T-24h"}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Cubicaje Logístico Paramétrico */}
                        {districtDetailData?.logistica_anticipada_requerida && (
                            <div className="mt-6 p-4 rounded-2xl bg-slate-950 border border-slate-800">
                                <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-2">
                                    <Truck className="w-4 h-4" />
                                    Cubicaje Logístico Paramétrico (INDECI Ground Truth)
                                </h4>
                                <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                                        <div className="text-slate-400">Camiones 10 TM</div>
                                        <div className="text-lg font-bold text-white mt-1">
                                            {districtDetailData.logistica_anticipada_requerida.camiones_10tm_preposicionamiento}
                                        </div>
                                        <div className="text-[10px] text-slate-500">Convoy terrestre anticipado</div>
                                    </div>
                                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                                        <div className="text-slate-400">Motobombas 4" / 6"</div>
                                        <div className="text-lg font-bold text-white mt-1">
                                            {districtDetailData.logistica_anticipada_requerida.motobombas_4_pulgadas + districtDetailData.logistica_anticipada_requerida.motobombas_6_pulgadas}
                                        </div>
                                        <div className="text-[10px] text-slate-500">Para cuencas ciegas SARE</div>
                                    </div>
                                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                                        <div className="text-slate-400">Plantas Potabilizadoras</div>
                                        <div className="text-lg font-bold text-white mt-1">
                                            {districtDetailData.logistica_anticipada_requerida.plantas_potabilizadoras_moviles}
                                        </div>
                                        <div className="text-[10px] text-slate-500">Autonomía hídrica de emergencia</div>
                                    </div>
                                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                                        <div className="text-slate-400">Ahorro Fiscal Neto</div>
                                        <div className="text-lg font-bold text-emerald-400 mt-1">
                                            S/ {Number(districtDetailData.logistica_anticipada_requerida.ahorro_vs_puente_aereo_pen).toLocaleString("es-PE")}
                                        </div>
                                        <div className="text-[10px] text-slate-500">Evita puente aéreo colapsado</div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Infraestructura CAF y Cuencas Ciegas SARE */}
                        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                                <h4 className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
                                    <ShieldAlert className="w-4 h-4" />
                                    Puentes Críticos CAF en Riesgo
                                </h4>
                                <ul className="mt-2 space-y-1.5 text-xs text-slate-300">
                                    {selectedDistrict.puentes_vulnerables_caf?.length ? (
                                        selectedDistrict.puentes_vulnerables_caf.map((p, i) => (
                                            <li key={i} className="flex items-center gap-2">
                                                <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                                                <span>{p}</span>
                                            </li>
                                        ))
                                    ) : (
                                        <li className="text-slate-500">Sin puentes troncales CAF colapsados en el registro histórico.</li>
                                    )}
                                </ul>
                            </div>

                            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                                <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                                    <Droplets className="w-4 h-4" />
                                    Cuencas Ciegas Urbanas (SARE)
                                </h4>
                                <ul className="mt-2 space-y-1.5 text-xs text-slate-300">
                                    {selectedDistrict.cuencas_ciegas_sare?.length ? (
                                        selectedDistrict.cuencas_ciegas_sare.map((cc, i) => (
                                            <li key={i} className="flex items-center gap-2">
                                                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                                                <span>{cc}</span>
                                            </li>
                                        ))
                                    ) : (
                                        <li className="text-slate-500">Sin cuencas ciegas críticas registradas en este cuadrante.</li>
                                    )}
                                </ul>
                            </div>
                        </div>

                        {/* Marco Legal Invocado */}
                        <div className="mt-6 p-4 rounded-2xl bg-blue-950/30 border border-blue-900/40 text-xs text-blue-200">
                            <strong>Blindaje Legal y Penal del Alcalde:</strong> Las acciones del EAP se amparan en el <strong>Decreto Supremo Nº 124-2026-PCM</strong> y el <strong>Art. 27 lit. b del TUO de la Ley Nº 30225</strong>, eximiendo a las autoridades distritales de imputaciones por omisión funcional (Art. 377 del Código Penal) al ejecutar el pre-posicionamiento preventivo.
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
