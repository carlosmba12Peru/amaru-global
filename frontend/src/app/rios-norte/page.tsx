"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
    Waves,
    AlertTriangle,
    ShieldAlert,
    CheckCircle2,
    Clock,
    Activity,
    Compass,
    ExternalLink,
    RefreshCw,
    Search,
    Sliders,
    Droplets,
    ChevronRight,
    ArrowDownRight,
    Flame,
    Zap,
    Building2,
    Calendar,
    Wrench,
    FileText,
    Image,
    Layers,
    Filter,
    DollarSign,
    Users,
    Truck,
    Power,
    ShieldCheck
} from "lucide-react";

interface EstacionAforo {
    id_estacion: string;
    nombre: string;
    posicion: string;
    lat: number;
    lon: number;
    caudal_actual_m3s: number;
    umbral_amarillo_m3s: number;
    umbral_naranja_m3s: number;
    umbral_rojo_desborde_m3s: number;
    record_historico_1998_m3s: number;
    record_historico_2017_m3s?: number;
    record_historico_2023_m3s?: number;
    tiempo_transito_hacia_piura_horas?: number;
    tiempo_transito_hacia_catacaos_horas?: number;
    tiempo_transito_hacia_illimo_horas?: number;
    tiempo_transito_hacia_tumbes_horas?: number;
    tiempo_transito_hacia_sullana_horas?: number;
    tiempo_transito_hacia_reque_horas?: number;
    tiempo_transito_hacia_zana_horas?: number;
    tiempo_transito_hacia_ciudaddedios_horas?: number;
    tiempo_transito_hacia_ascope_horas?: number;
    tiempo_transito_hacia_moche_horas?: number;
    estado_actual: string;
}

interface CuencaFluvial {
    id_cuenca: string;
    nombre: string;
    departamento: string;
    longitud_cauce_km: number;
    ciudades_vulnerables: string[];
    estaciones_aforo: EstacionAforo[];
}

interface Represa {
    id_represa: string;
    nombre: string;
    rio: string;
    cuenca: string;
    departamento: string;
    provincia: string;
    distrito: string;
    cota_coronacion_msnm: number;
    cota_operacion_normal_msnm: number;
    cota_actual_msnm: number;
    capacidad_diseno_mmc: number;
    capacidad_actual_sedimentada_mmc: number;
    volumen_almacenado_actual_mmc: number;
    porcentaje_llenado: number;
    caudal_ingreso_m3s: number;
    caudal_descarga_alivio_m3s: number;
    umbral_descarga_emergencia_m3s: number;
    estado_alerta: string;
    impacto_aguas_abajo: string;
    leccion_historica: string;
}

interface PuntoCriticoAna {
    object_id: number;
    id_intervencion: number;
    id_punto_critico: number;
    codigo_ficha: string;
    sector: string;
    rio: string;
    cuenca: string;
    departamento: string;
    provincia: string;
    distrito: string;
    actividad: string;
    estado: string;
    meta_km: number;
    avance_km: number;
    avance_porcentaje: number;
    volumen_descolmatar_m3: number;
    costo_total_soles: number;
    costo_directo_soles: number;
    poblacion_protegida: number;
    habitantes_atendidos_valle: number;
    viviendas_protegidas: number;
    hectareas_cultivo: number;
    tipo_cultivos: string;
    tipo_peligro: string;
    nivel_peligro: string;
    responsable: string;
    decreto_supremo: string;
    lat: number;
    lon: number;
    ficha_pdf_url: string;
    galeria_fotos_url: string;
}

export default function RiosNortePage() {
    // Modo de vista principal (Pestañas Maestras C2)
    const [pestañaPrincipal, setPestañaPrincipal] = useState<"cuencas" | "puntos_ana" | "ird_fluv" | "lifelines">("cuencas");

    const [cuencas, setCuencas] = useState<CuencaFluvial[]>([]);
    const [represas, setRepresas] = useState<Represa[]>([]);
    const [puntosAna, setPuntosAna] = useState<PuntoCriticoAna[]>([]);
    const [metricasAna, setMetricasAna] = useState<any>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [loadingAna, setLoadingAna] = useState<boolean>(false);

    // Estado del Gemelo Digital de Servicios Básicos (Fase 1 Lifelines)
    const [lifelinesData, setLifelinesData] = useState<any>(null);
    const [loadingLifelines, setLoadingLifelines] = useState<boolean>(false);
    const [simTurbidez, setSimTurbidez] = useState<number>(850);
    const [simTirante, setSimTirante] = useState<number>(0);
    const [filtroTipoLifeline, setFiltroTipoLifeline] = useState<"TODOS" | "PTAP" | "SE" | "BOC">("TODOS");
    
    // Filtros de Puntos Críticos ANA
    const [filtroDeptoAna, setFiltroDeptoAna] = useState<string>("TODOS");
    const [filtroEstadoAna, setFiltroEstadoAna] = useState<string>("TODOS");
    const [busquedaAna, setBusquedaAna] = useState<string>("");

    // Cuenca y estación activa
    const [cuencaActivaId, setCuencaActivaId] = useState<string>("CUENCA-PIURA");
    const [estacionSeleccionadaId, setEstacionSeleccionadaId] = useState<string>("EST-PIU-SANCHEZ-CERRO");

    // Simulador interactivo de Caudal
    const [simCaudal, setSimCaudal] = useState<number>(1850.0);
    const [evaluacionData, setEvaluacionData] = useState<any>(null);
    const [evaluando, setEvaluando] = useState<boolean>(false);

    // Calculadora IRD-FLUV en vivo
    const [irdCaudal, setIrdCaudal] = useState<number>(1950.0);
    const [irdCaudalDesborde, setIrdCaudalDesborde] = useState<number>(2400.0);
    const [irdAvanceObra, setIrdAvanceObra] = useState<number>(15.0);
    const [irdLlenadoRepresa, setIrdLlenadoRepresa] = useState<number>(86.4);
    const [irdFactorFen, setIrdFactorFen] = useState<number>(1.25);
    const [irdResult, setIrdResult] = useState<any>(null);

    // Cargar cuencas, represas y puntos ANA
    useEffect(() => {
        async function fetchData() {
            try {
                setLoading(true);
                const [resCuencas, resRepresas] = await Promise.all([
                    fetch("http://localhost:8000/api/v1/rios-norte/cuencas"),
                    fetch("http://localhost:8000/api/v1/rios-norte/represas")
                ]);

                if (resCuencas.ok) {
                    const dataCuencas = await resCuencas.json();
                    setCuencas(dataCuencas.cuencas || []);
                }
                if (resRepresas.ok) {
                    const dataRepresas = await resRepresas.json();
                    setRepresas(dataRepresas.represas || []);
                }
            } catch (err) {
                console.error("Error cargando datos fluviales:", err);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    // Cargar puntos críticos oficiales ANA (536 puntos D.S. 164-2026-EF)
    useEffect(() => {
        async function fetchPuntosAna() {
            try {
                setLoadingAna(true);
                const res = await fetch("http://localhost:8000/api/v1/ana/puntos-priorizados-2026");
                if (res.ok) {
                    const data = await res.json();
                    setPuntosAna(data.intervenciones || []);
                    setMetricasAna(data.metricas_ejecucion || null);
                }
            } catch (err) {
                console.error("Error cargando puntos críticos ANA:", err);
            } finally {
                setLoadingAna(false);
            }
        }
        fetchPuntosAna();
    }, []);

    // Evaluar estación seleccionada
    useEffect(() => {
        if (!estacionSeleccionadaId) return;

        async function evaluar() {
            try {
                setEvaluando(true);
                const res = await fetch(
                    `http://localhost:8000/api/v1/rios-norte/estacion/${estacionSeleccionadaId}/evaluar?caudal_m3s=${simCaudal}`
                );
                if (res.ok) {
                    const data = await res.json();
                    setEvaluacionData(data);
                }
            } catch (err) {
                console.error("Error evaluando estación:", err);
            } finally {
                setEvaluando(false);
            }
        }

        evaluar();
    }, [estacionSeleccionadaId, simCaudal]);

    // Calcular IRD-FLUV cuando cambian sliders
    useEffect(() => {
        async function calcularIrd() {
            try {
                const params = new URLSearchParams({
                    caudal_actual_m3s: irdCaudal.toString(),
                    caudal_desborde_m3s: irdCaudalDesborde.toString(),
                    avance_obra_pct: irdAvanceObra.toString(),
                    llenado_represa_pct: irdLlenadoRepresa.toString(),
                    factor_fen: irdFactorFen.toString()
                });
                const res = await fetch(`http://localhost:8000/api/v1/ana/evaluar-ird-fluv?${params.toString()}`);
                if (res.ok) {
                    const data = await res.json();
                    setIrdResult(data);
                }
            } catch (err) {
                console.error("Error calculando IRD-FLUV:", err);
            }
        }
        calcularIrd();
    }, [irdCaudal, irdCaudalDesborde, irdAvanceObra, irdLlenadoRepresa, irdFactorFen]);

    // Cargar evaluación del Gemelo Digital de Servicios Básicos (Fase 1)
    useEffect(() => {
        async function fetchLifelines() {
            try {
                setLoadingLifelines(true);
                const res = await fetch(
                    `http://localhost:8000/api/v1/lifelines/evaluar?turbidez_ntu=${simTurbidez}&tirante_cm=${simTirante}`
                );
                if (res.ok) {
                    const data = await res.json();
                    setLifelinesData(data);
                }
            } catch (err) {
                console.error("Error evaluando lifelines:", err);
            } finally {
                setLoadingLifelines(false);
            }
        }
        fetchLifelines();
    }, [simTurbidez, simTirante]);

    const cuencaActiva = useMemo(() => {
        return cuencas.find(c => c.id_cuenca === cuencaActivaId) || cuencas[0];
    }, [cuencas, cuencaActivaId]);

    const handleCuencaChange = (id: string) => {
        setCuencaActivaId(id);
        const c = cuencas.find(item => item.id_cuenca === id);
        if (c && c.estaciones_aforo.length > 0) {
            setEstacionSeleccionadaId(c.estaciones_aforo[0].id_estacion);
            setSimCaudal(c.estaciones_aforo[0].caudal_actual_m3s);
        }
    };

    // Filtrar Puntos Críticos ANA
    const puntosAnaFiltrados = useMemo(() => {
        return puntosAna.filter(p => {
            const matchDepto = filtroDeptoAna === "TODOS" || p.departamento.toUpperCase() === filtroDeptoAna.toUpperCase();
            const matchEstado = filtroEstadoAna === "TODOS" || p.estado.toUpperCase().includes(filtroEstadoAna.toUpperCase());
            const matchSearch = busquedaAna === "" || 
                p.sector.toLowerCase().includes(busquedaAna.toLowerCase()) ||
                p.rio.toLowerCase().includes(busquedaAna.toLowerCase()) ||
                p.cuenca.toLowerCase().includes(busquedaAna.toLowerCase()) ||
                p.distrito.toLowerCase().includes(busquedaAna.toLowerCase());
            return matchDepto && matchEstado && matchSearch;
        });
    }, [puntosAna, filtroDeptoAna, filtroEstadoAna, busquedaAna]);

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 space-y-8">
            {/* HERO BANNER DE MANDO C2 */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-950 via-slate-900 to-cyan-950 p-6 md:p-8 border border-blue-800/40 shadow-2xl">
                <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl -z-10 pointer-events-none" />

                <div className="flex flex-wrap justify-between items-start gap-4">
                    <div className="space-y-2 max-w-3xl">
                        <div className="flex flex-wrap items-center gap-2.5">
                            <span className="text-xs font-mono font-bold bg-blue-950 text-blue-300 border border-blue-800 px-3 py-1 rounded-full flex items-center gap-1.5">
                                <Waves className="w-3.5 h-3.5 text-blue-400" />
                                <span>CONSOLA C2 • CONTROL FLUVIAL &amp; OBRAS DEFENSIVAS ANA</span>
                            </span>
                            <span className="text-xs font-mono bg-emerald-950 text-emerald-300 border border-emerald-800 px-3 py-1 rounded-full font-bold flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5" /> SNIRH - ANA Oficial
                            </span>
                            <span className="text-xs font-mono bg-purple-950 text-purple-300 border border-purple-800 px-3 py-1 rounded-full font-bold flex items-center gap-1">
                                <Activity className="w-3.5 h-3.5" /> 536 Puntos D.S. 164-2026-EF
                            </span>
                        </div>

                        <h1 className="text-2xl md:text-4xl font-black tracking-tight text-white">
                            Control Fluvial, Represas &amp; Puntos Críticos ANA
                        </h1>
                        <p className="text-sm text-slate-400 leading-relaxed">
                            Integración del Sistema Nacional de Información de Recursos Hídricos (SNIRH / ANA) con la telemetría fluvial en tiempo real, monitoreo de las 3 grandes represas reguladoras, avance físico de descolmataciones 2026 y cálculo del Indicador de Riesgo Dinámico de Desborde (<strong>IRD-FLUV</strong>).
                        </p>
                    </div>

                    {/* Acciones Rápidas */}
                    <div className="flex flex-wrap items-center gap-2">
                        <Link
                            href="/geovisor"
                            className="px-4 py-2 bg-slate-800 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold hover:bg-slate-700 transition flex items-center gap-2"
                        >
                            <Compass className="w-4 h-4" /> Geovisor 3D
                        </Link>
                        <Link
                            href="/doctrina"
                            className="px-4 py-2 bg-blue-950 text-blue-300 border border-blue-800 rounded-xl text-xs font-bold hover:bg-blue-900 transition flex items-center gap-2"
                        >
                            <Zap className="w-4 h-4" /> Fórmulas FEN
                        </Link>
                        <a
                            href="https://snirhgeo.ana.gob.pe/portal/apps/dashboards/c1d16bc07ccd49769253c442a50ffec1"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2 bg-cyan-950 text-cyan-300 border border-cyan-800 rounded-xl text-xs font-bold hover:bg-cyan-900 transition flex items-center gap-2"
                        >
                            <ExternalLink className="w-4 h-4" /> Dashboard ANA 2026
                        </a>
                    </div>
                </div>

                {/* SELECTOR DE PESTAÑAS MAESTRAS C2 */}
                <div className="flex flex-wrap gap-2 mt-6 pt-4 border-t border-slate-800/80">
                    <button
                        onClick={() => setPestañaPrincipal("cuencas")}
                        className={`px-4 py-2.5 rounded-xl text-xs font-black transition flex items-center gap-2 border ${
                            pestañaPrincipal === "cuencas"
                                ? "bg-blue-600 text-white border-blue-500 shadow-lg shadow-blue-500/20"
                                : "bg-slate-900 text-slate-400 border-slate-800 hover:text-white"
                        }`}
                    >
                        <Waves className="w-4 h-4" />
                        <span>1. Cuencas del Norte &amp; Represas ({cuencas.length} Cuencas)</span>
                    </button>

                    <button
                        onClick={() => setPestañaPrincipal("puntos_ana")}
                        className={`px-4 py-2.5 rounded-xl text-xs font-black transition flex items-center gap-2 border ${
                            pestañaPrincipal === "puntos_ana"
                                ? "bg-cyan-600 text-white border-cyan-500 shadow-lg shadow-cyan-500/20"
                                : "bg-slate-900 text-slate-400 border-slate-800 hover:text-white"
                        }`}
                    >
                        <Wrench className="w-4 h-4 text-cyan-300" />
                        <span>2. Puntos Críticos &amp; Obras ANA 2026 ({puntosAna.length} Intervenciones)</span>
                    </button>

                    <button
                        onClick={() => setPestañaPrincipal("ird_fluv")}
                        className={`px-4 py-2.5 rounded-xl text-xs font-black transition flex items-center gap-2 border ${
                            pestañaPrincipal === "ird_fluv"
                                ? "bg-gradient-to-r from-red-600 to-amber-600 text-white border-red-500 shadow-lg shadow-red-500/20"
                                : "bg-slate-900 text-slate-400 border-slate-800 hover:text-white"
                        }`}
                    >
                        <ShieldAlert className="w-4 h-4 text-amber-300" />
                        <span>3. Indicador IRD-FLUV</span>
                    </button>

                    <button
                        onClick={() => setPestañaPrincipal("lifelines")}
                        className={`px-4 py-2.5 rounded-xl text-xs font-black transition flex items-center gap-2 border ${
                            pestañaPrincipal === "lifelines"
                                ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white border-cyan-400 shadow-lg shadow-cyan-500/20"
                                : "bg-slate-900 text-slate-400 border-slate-800 hover:text-white"
                        }`}
                    >
                        <Droplets className="w-4 h-4 text-cyan-300" />
                        <span>4. Soporte Vital: PTAPs &amp; Subestaciones (Fase 1)</span>
                    </button>
                </div>
            </div>

            {/* CONTENIDO 1: CUENCAS DEL NORTE Y REPRESAS REGULADORAS */}
            {pestañaPrincipal === "cuencas" && (
                <div className="space-y-8">
                    {/* SECCIÓN REPRESAS REGULADORAS */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                            <div className="flex items-center gap-2">
                                <Building2 className="w-5 h-5 text-blue-400" />
                                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-200">
                                    Estado de Almacenamiento &amp; Compuertas de Alivio de Represas
                                </h2>
                            </div>
                            <span className="text-[11px] font-mono text-slate-400">
                                Cotas msnm y umbrales de alivio forzoso
                            </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {represas.map(rep => {
                                const isPoechos = rep.id_represa === "REP-POECHOS";

                                return (
                                    <div
                                        key={rep.id_represa}
                                        className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4 relative overflow-hidden"
                                    >
                                        <div className="flex justify-between items-start gap-2">
                                            <div>
                                                <span className="text-[10px] font-mono uppercase text-blue-400 font-bold bg-blue-950 px-2 py-0.5 rounded border border-blue-900">
                                                    {rep.rio}
                                                </span>
                                                <h3 className="text-sm font-bold text-white mt-1">
                                                    {rep.nombre.split("(")[0]}
                                                </h3>
                                                <p className="text-[11px] text-slate-400 font-mono">
                                                    {rep.distrito}, {rep.departamento}
                                                </p>
                                            </div>
                                            <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                                                rep.estado_alerta.includes("NARANJA")
                                                    ? "bg-amber-950 text-amber-400 border-amber-800"
                                                    : "bg-emerald-950 text-emerald-400 border-emerald-800"
                                            }`}>
                                                {rep.estado_alerta.replace("_", " ")}
                                            </span>
                                        </div>

                                        {/* Barra de Capacidad y Sedimentación */}
                                        <div className="space-y-1.5">
                                            <div className="flex justify-between text-xs font-mono">
                                                <span className="text-slate-400">Llenado Actual:</span>
                                                <strong className={rep.porcentaje_llenado > 85 ? "text-amber-400" : "text-blue-400"}>
                                                    {rep.porcentaje_llenado}% ({rep.volumen_almacenado_actual_mmc} MMC)
                                                </strong>
                                            </div>
                                            <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden flex">
                                                <div
                                                    className={`h-full transition-all duration-500 ${
                                                        rep.porcentaje_llenado > 85
                                                            ? "bg-gradient-to-r from-amber-500 to-red-500"
                                                            : "bg-gradient-to-r from-blue-500 to-cyan-400"
                                                    }`}
                                                    style={{ width: `${Math.min(rep.porcentaje_llenado, 100)}%` }}
                                                />
                                            </div>
                                            <div className="flex justify-between text-[10px] font-mono text-slate-500">
                                                <span>Cota actual: {rep.cota_actual_msnm} msnm</span>
                                                <span>Coronación: {rep.cota_coronacion_msnm} msnm</span>
                                            </div>
                                        </div>

                                        {/* Caudales de Ingreso vs Descarga */}
                                        <div className="grid grid-cols-2 gap-2 p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs font-mono">
                                            <div>
                                                <span className="text-[10px] text-slate-500 block">Q Ingreso</span>
                                                <span className="text-emerald-400 font-bold text-sm">
                                                    {rep.caudal_ingreso_m3s} m³/s
                                                </span>
                                            </div>
                                            <div>
                                                <span className="text-[10px] text-slate-500 block">Q Descarga</span>
                                                <span className="text-cyan-400 font-bold text-sm">
                                                    {rep.caudal_descarga_alivio_m3s} m³/s
                                                </span>
                                            </div>
                                            <div className="col-span-2 pt-1 border-t border-slate-800/80 text-[10px] text-slate-400 flex justify-between">
                                                <span>Umbral Alivio Forzoso:</span>
                                                <strong className="text-red-400">{rep.umbral_descarga_emergencia_m3s} m³/s</strong>
                                            </div>
                                        </div>

                                        <p className="text-[11px] text-slate-400 leading-snug">
                                            ⚠️ <strong className="text-slate-300">Impacto aguas abajo:</strong> {rep.impacto_aguas_abajo}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* SECCIÓN SELECTOR DE CUENCAS Y SIMULADOR DE ONDA */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                            <div className="flex items-center gap-2">
                                <Waves className="w-5 h-5 text-cyan-400" />
                                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-200">
                                    Monitoreo Fluvial &amp; Aforos por Cuenca Aluvial
                                </h2>
                            </div>
                        </div>

                        {/* Tabs de Cuencas */}
                        <div className="flex flex-wrap gap-2">
                            {cuencas.map(c => (
                                <button
                                    key={c.id_cuenca}
                                    onClick={() => handleCuencaChange(c.id_cuenca)}
                                    className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                                        cuencaActivaId === c.id_cuenca
                                            ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30"
                                            : "bg-slate-900 text-slate-400 border border-slate-800 hover:bg-slate-800 hover:text-white"
                                    }`}
                                >
                                    <span>{c.nombre.replace("Cuenca del ", "")}</span>
                                    <span className="text-[10px] font-mono bg-black/30 px-1.5 py-0.5 rounded">
                                        {c.estaciones_aforo.length} est.
                                    </span>
                                </button>
                            ))}
                        </div>

                        {/* DETALLE DE LA CUENCA SELECCIONADA: ESTACIONES + SIMULADOR DE ONDA */}
                        {cuencaActiva && (
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                                {/* Columna Izquierda (5 cols): Estaciones de Aforo de la Cuenca */}
                                <div className="lg:col-span-5 space-y-3">
                                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
                                        <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                                            <span className="text-xs font-bold text-white uppercase tracking-wider">
                                                Estaciones de {cuencaActiva.nombre}
                                            </span>
                                            <span className="text-[10px] font-mono text-cyan-400">
                                                Cauce: {cuencaActiva.longitud_cauce_km} km
                                            </span>
                                        </div>

                                        <div className="space-y-2">
                                            {cuencaActiva.estaciones_aforo.map(e => {
                                                const isSelected = estacionSeleccionadaId === e.id_estacion;

                                                return (
                                                    <button
                                                        key={e.id_estacion}
                                                        onClick={() => {
                                                            setEstacionSeleccionadaId(e.id_estacion);
                                                            setSimCaudal(e.caudal_actual_m3s);
                                                        }}
                                                        className={`w-full text-left p-3.5 rounded-xl border transition flex flex-col space-y-1.5 ${
                                                            isSelected
                                                                ? "bg-blue-950/60 border-blue-500 shadow-md shadow-blue-900/20"
                                                                : "bg-slate-950 border-slate-800 hover:border-slate-700"
                                                        }`}
                                                    >
                                                        <div className="flex justify-between items-center">
                                                            <strong className="text-xs text-white font-bold">
                                                                {e.nombre}
                                                            </strong>
                                                            <span className="text-[10px] font-mono text-slate-500">
                                                                {e.posicion}
                                                            </span>
                                                        </div>

                                                        <div className="flex justify-between items-center text-xs font-mono">
                                                            <span className="text-slate-400">
                                                                Q Actual: <strong className="text-cyan-300">{e.caudal_actual_m3s} m³/s</strong>
                                                            </span>
                                                            <span className="text-red-400">
                                                                Desborde: {e.umbral_rojo_desborde_m3s} m³/s
                                                            </span>
                                                        </div>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>

                                {/* Columna Derecha (7 cols): Simulador de Caudal y Onda de Avenida */}
                                <div className="lg:col-span-7 space-y-4">
                                    {evaluacionData ? (
                                        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-2xl">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <span className="text-xs font-mono uppercase tracking-wider text-slate-400 block">
                                                        Estación Seleccionada para Evaluación
                                                    </span>
                                                    <h3 className="text-xl font-black text-white mt-0.5">
                                                        {evaluacionData.nombre}
                                                    </h3>
                                                    <p className="text-xs text-slate-400 font-mono">
                                                        {evaluacionData.cuenca} • Coordenadas: {evaluacionData.lat}, {evaluacionData.lon}
                                                    </p>
                                                </div>

                                                <div
                                                    className="px-3.5 py-1.5 rounded-xl border text-xs font-mono font-black"
                                                    style={{
                                                        backgroundColor: `${evaluacionData.color_hex}15`,
                                                        borderColor: evaluacionData.color_hex,
                                                        color: evaluacionData.color_hex
                                                    }}
                                                >
                                                    {evaluacionData.nivel_alerta.replace("_", " ")}
                                                </div>
                                            </div>

                                            {/* Slider de Simulación */}
                                            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
                                                <div className="flex justify-between items-center">
                                                    <label className="text-xs font-bold text-slate-200 flex items-center gap-2">
                                                        <Sliders className="w-4 h-4 text-blue-400" />
                                                        Simulador de Caudal Instantáneo ($Q$):
                                                    </label>
                                                    <span className="text-lg font-mono font-black text-cyan-400">
                                                        {simCaudal} m³/s
                                                    </span>
                                                </div>

                                                <input
                                                    type="range"
                                                    min="50"
                                                    max={Math.max(evaluacionData.record_historico_1998_m3s, 4000)}
                                                    step="50"
                                                    value={simCaudal}
                                                    onChange={e => setSimCaudal(parseFloat(e.target.value))}
                                                    className="w-full accent-blue-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
                                                />

                                                <div className="flex justify-between text-[10px] font-mono text-slate-500">
                                                    <span>50 m³/s (Estiaje)</span>
                                                    <span className="text-amber-500">Alerta: {evaluacionData.umbral_amarillo_m3s} m³/s</span>
                                                    <span className="text-red-500">Desborde: {evaluacionData.umbral_rojo_desborde_m3s} m³/s</span>
                                                    <span className="text-purple-400">Récord 1998: {evaluacionData.record_historico_1998_m3s} m³/s</span>
                                                </div>
                                            </div>

                                            {/* Tiempos de Tránsito hacia Ciudades Aguas Abajo */}
                                            <div className="space-y-2">
                                                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                                                    <Clock className="w-4 h-4 text-amber-400" /> Tiempo de Tránsito de la Onda (T-tránsito):
                                                </span>

                                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                                    {Object.entries(evaluacionData.tiempos_transito_aguas_abajo || {}).map(([ciudad, t]: [string, any]) => (
                                                        <div key={ciudad} className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                                                            <span className="text-[10px] font-mono uppercase text-slate-400 block">
                                                                Hacia {ciudad}
                                                            </span>
                                                            <div className="text-base font-mono font-black text-amber-300">
                                                                {t.horas_estimadas} Horas
                                                            </div>
                                                            <span className="text-[10px] text-slate-500">
                                                                {t.minutos_estimados} min de anticipación
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Acción Recomendada */}
                                            <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/80 space-y-2 text-xs">
                                                <span className="font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                                                    <ShieldAlert className="w-4 h-4 text-red-400" /> Protocolo Táctico de Mando COEN / INDECI:
                                                </span>
                                                <p className="text-slate-300 text-[11.5px] leading-relaxed">
                                                    {evaluacionData.accion_recomendada}
                                                </p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="p-12 text-center text-slate-500 font-mono text-xs">
                                            Cargando simulación hidrológica...
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* CONTENIDO 2: PUNTOS CRÍTICOS & OBRAS ANA 2026 (D.S. 164-2026-EF) */}
            {pestañaPrincipal === "puntos_ana" && (
                <div className="space-y-6">
                    {/* Tarjetas de Métricas de Ejecución ANA 2026 */}
                    {metricasAna && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-1">
                                <span className="text-[11px] font-mono text-slate-400 uppercase">Inversión Priorizada D.S. 164</span>
                                <div className="text-xl md:text-2xl font-black text-emerald-400 font-mono">
                                    S/. {(metricasAna.inversion_total_soles / 1e6).toFixed(1)} Millones
                                </div>
                                <span className="text-[10px] text-slate-500">536 intervenciones nacionales</span>
                            </div>

                            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-1">
                                <span className="text-[11px] font-mono text-slate-400 uppercase">Población Protegida</span>
                                <div className="text-xl md:text-2xl font-black text-cyan-400 font-mono">
                                    {metricasAna.poblacion_protegida_directa.toLocaleString()} Hab.
                                </div>
                                <span className="text-[10px] text-slate-500">Familias ribereñas directas</span>
                            </div>

                            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-1">
                                <span className="text-[11px] font-mono text-slate-400 uppercase">Tierras Agrícolas</span>
                                <div className="text-xl md:text-2xl font-black text-amber-400 font-mono">
                                    {metricasAna.hectareas_agricolas_protegidas.toLocaleString()} Ha
                                </div>
                                <span className="text-[10px] text-slate-500">Arroz, banano, limón, mango</span>
                            </div>

                            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-1">
                                <span className="text-[11px] font-mono text-slate-400 uppercase">Estado de Obras</span>
                                <div className="flex items-center gap-2 pt-1 text-xs font-mono">
                                    <span className="text-amber-400 font-bold">{metricasAna.por_ejecutar} Por Ejecutar</span>
                                    <span className="text-slate-600">•</span>
                                    <span className="text-cyan-400 font-bold">{metricasAna.en_ejecucion} En Curso</span>
                                </div>
                                <span className="text-[10px] text-slate-500">Monitoreo semanal satelital</span>
                            </div>
                        </div>
                    )}

                    {/* Barra de Búsqueda y Filtros */}
                    <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex flex-wrap items-center justify-between gap-4">
                        <div className="relative flex-1 min-w-[280px]">
                            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                placeholder="Buscar punto crítico por sector, río, cuenca o distrito (ej. Limonal, Chira, Piura)..."
                                value={busquedaAna}
                                onChange={e => setBusquedaAna(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition"
                            />
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                            <div className="flex items-center gap-2">
                                <Filter className="w-3.5 h-3.5 text-slate-400" />
                                <span className="text-xs text-slate-400">Dpto:</span>
                                <select
                                    value={filtroDeptoAna}
                                    onChange={e => setFiltroDeptoAna(e.target.value)}
                                    className="bg-slate-950 border border-slate-800 text-xs rounded-xl px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-cyan-500"
                                >
                                    <option value="TODOS">Todos los Dptos</option>
                                    <option value="PIURA">Piura</option>
                                    <option value="LAMBAYEQUE">Lambayeque</option>
                                    <option value="TUMBES">Tumbes</option>
                                    <option value="LA LIBERTAD">La Libertad</option>
                                    <option value="ANCASH">Áncash</option>
                                    <option value="LIMA">Lima</option>
                                    <option value="ICA">Ica</option>
                                </select>
                            </div>

                            <div className="flex items-center gap-2">
                                <span className="text-xs text-slate-400">Estado:</span>
                                <select
                                    value={filtroEstadoAna}
                                    onChange={e => setFiltroEstadoAna(e.target.value)}
                                    className="bg-slate-950 border border-slate-800 text-xs rounded-xl px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-cyan-500"
                                >
                                    <option value="TODOS">Todos los Estados</option>
                                    <option value="POR EJECUTAR">Por Ejecutar</option>
                                    <option value="EJECUCION">En Ejecución</option>
                                    <option value="CULMINADO">Culminado</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Grilla de Puntos Críticos Reales ANA */}
                    {loadingAna ? (
                        <div className="p-16 text-center text-slate-400">
                            <RefreshCw className="w-8 h-8 animate-spin mx-auto text-cyan-400 mb-3" />
                            <p className="text-sm">Consultando GeoSNIRH oficial de la Autoridad Nacional del Agua...</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {puntosAnaFiltrados.slice(0, 36).map(p => (
                                <div
                                    key={p.object_id}
                                    className="bg-slate-900/90 border border-slate-800 hover:border-cyan-500/50 rounded-2xl p-4 shadow-xl space-y-3 transition flex flex-col justify-between"
                                >
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-start gap-2">
                                            <div>
                                                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-900 font-bold">
                                                    {p.cuenca}
                                                </span>
                                                <h4 className="text-sm font-black text-white mt-1">
                                                    Sector {p.sector}
                                                </h4>
                                                <p className="text-[11px] text-slate-400">
                                                    {p.rio} • {p.distrito}, {p.departamento}
                                                </p>
                                            </div>

                                            <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                                                p.estado.toUpperCase().includes("POR EJECUTAR")
                                                    ? "bg-amber-950 text-amber-400 border-amber-800"
                                                    : "bg-cyan-950 text-cyan-300 border-cyan-800"
                                            }`}>
                                                {p.estado}
                                            </span>
                                        </div>

                                        <p className="text-xs text-slate-300 leading-snug line-clamp-2">
                                            {p.actividad}
                                        </p>

                                        {/* Barra de Avance */}
                                        <div className="space-y-1">
                                            <div className="flex justify-between text-[11px] font-mono">
                                                <span className="text-slate-400">Avance Físico:</span>
                                                <strong className="text-cyan-400">{p.avance_porcentaje}% ({p.avance_km} / {p.meta_km} km)</strong>
                                            </div>
                                            <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                                                <div
                                                    className="bg-cyan-400 h-full transition-all"
                                                    style={{ width: `${Math.min(p.avance_porcentaje, 100)}%` }}
                                                />
                                            </div>
                                        </div>

                                        {/* Metadatos Económicos y Sociales */}
                                        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800 text-[11px] font-mono text-slate-400">
                                            <div>
                                                <span className="text-[10px] text-slate-500 block">Presupuesto ANA</span>
                                                <strong className="text-slate-200">S/. {p.costo_total_soles.toLocaleString()}</strong>
                                            </div>
                                            <div>
                                                <span className="text-[10px] text-slate-500 block">Cultivos / Superficie</span>
                                                <strong className="text-slate-200">{p.hectareas_cultivo} Ha ({p.tipo_cultivos || "Varios"})</strong>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Botones de Enlace a Documentos Oficiales ANA */}
                                    <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-2">
                                        {p.ficha_pdf_url ? (
                                            <a
                                                href={p.ficha_pdf_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-[11px] font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition"
                                            >
                                                <FileText className="w-3.5 h-3.5" /> Ficha Técnica PDF
                                            </a>
                                        ) : (
                                            <span className="text-[10px] text-slate-600">Sin PDF digital</span>
                                        )}

                                        {p.galeria_fotos_url && (
                                            <a
                                                href={p.galeria_fotos_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-[11px] font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1 transition"
                                            >
                                                <Image className="w-3.5 h-3.5" /> Fotos Dron
                                            </a>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* CONTENIDO 3: INDICADOR DE RIESGO DINÁMICO DE DESBORDE (IRD-FLUV) */}
            {pestañaPrincipal === "ird_fluv" && (
                <div className="space-y-6">
                    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6 shadow-2xl">
                        <div className="max-w-3xl space-y-2">
                            <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider bg-amber-950/60 px-3 py-1 rounded-full border border-amber-900 inline-block">
                                Algoritmo Doctrinal Oficial C2
                            </span>
                            <h2 className="text-2xl font-black text-white">
                                Indicador de Riesgo Dinámico de Desborde Fluvial (IRD-FLUV)
                            </h2>
                            <p className="text-xs text-slate-400 leading-relaxed">
                                Modela el riesgo de ruptura de defensas ribereñas correlacionando el caudal instantáneo ($Q$), la capacidad de conducción hidráulica, el avance de la obra de la ANA ($0-100\%$) y la presión de descarga de la represa reguladora aguas arriba.
                            </p>
                        </div>

                        {/* Calculadora Interactiva de Escenarios */}
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                            {/* Sliders de Parámetros (7 cols) */}
                            <div className="lg:col-span-7 bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-5">
                                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                                    Variables Hidrodinámicas &amp; Estado de Obras en Terreno:
                                </h3>

                                <div className="space-y-2">
                                    <div className="flex justify-between text-xs font-mono">
                                        <span className="text-slate-300">Caudal Instantáneo en el Río ($Q$):</span>
                                        <strong className="text-cyan-400">{irdCaudal} m³/s</strong>
                                    </div>
                                    <input
                                        type="range"
                                        min="200"
                                        max="3800"
                                        step="50"
                                        value={irdCaudal}
                                        onChange={e => setIrdCaudal(parseFloat(e.target.value))}
                                        className="w-full accent-cyan-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between text-xs font-mono">
                                        <span className="text-slate-300">Capacidad Máxima del Cauce (Q-desborde):</span>
                                        <strong className="text-red-400">{irdCaudalDesborde} m³/s</strong>
                                    </div>
                                    <input
                                        type="range"
                                        min="1000"
                                        max="3500"
                                        step="100"
                                        value={irdCaudalDesborde}
                                        onChange={e => setIrdCaudalDesborde(parseFloat(e.target.value))}
                                        className="w-full accent-red-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between text-xs font-mono">
                                        <span className="text-slate-300">Avance Físico del Dique / Descolmatación ANA:</span>
                                        <strong className={irdAvanceObra < 20 ? "text-amber-400" : "text-emerald-400"}>
                                            {irdAvanceObra}% ({irdAvanceObra < 20 ? "OBRA VULNERABLE" : "OBRA CONSOLIDADA"})
                                        </strong>
                                    </div>
                                    <input
                                        type="range"
                                        min="0"
                                        max="100"
                                        step="5"
                                        value={irdAvanceObra}
                                        onChange={e => setIrdAvanceObra(parseFloat(e.target.value))}
                                        className="w-full accent-amber-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between text-xs font-mono">
                                        <span className="text-slate-300">Llenado de Represa Reguladora Aguas Arriba:</span>
                                        <strong className="text-blue-400">{irdLlenadoRepresa}%</strong>
                                    </div>
                                    <input
                                        type="range"
                                        min="20"
                                        max="100"
                                        step="2"
                                        value={irdLlenadoRepresa}
                                        onChange={e => setIrdLlenadoRepresa(parseFloat(e.target.value))}
                                        className="w-full accent-blue-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between text-xs font-mono">
                                        <span className="text-slate-300">Factor Amplificador ENSO / Anomalía Térmica IMARPE (M-FEN):</span>
                                        <strong className="text-purple-400">{irdFactorFen}x</strong>
                                    </div>
                                    <input
                                        type="range"
                                        min="1.0"
                                        max="1.6"
                                        step="0.05"
                                        value={irdFactorFen}
                                        onChange={e => setIrdFactorFen(parseFloat(e.target.value))}
                                        className="w-full accent-purple-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
                                    />
                                </div>
                            </div>

                            {/* Panel de Veredicto C2 (5 cols) */}
                            <div className="lg:col-span-5 flex flex-col justify-between p-6 bg-slate-950 rounded-2xl border border-slate-800 space-y-4">
                                {irdResult && (
                                    <>
                                        <div>
                                            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">
                                                Resultado del Modelo Matemático
                                            </span>
                                            <div className="text-4xl font-black font-mono mt-1" style={{ color: irdResult.color_hex }}>
                                                {irdResult.valor_ird} <span className="text-sm font-normal text-slate-500">/ 1.00</span>
                                            </div>
                                            <div
                                                className="inline-block mt-2 px-3 py-1 rounded-full text-xs font-mono font-bold border"
                                                style={{
                                                    backgroundColor: `${irdResult.color_hex}20`,
                                                    borderColor: irdResult.color_hex,
                                                    color: irdResult.color_hex
                                                }}
                                            >
                                                {irdResult.nivel_alerta.replace("_", " ")}
                                            </div>
                                        </div>

                                        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/90 space-y-2 text-xs">
                                            <span className="font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                                                <ShieldAlert className="w-4 h-4 text-amber-400" /> Directiva Táctica para el COEN / Alcaldes:
                                            </span>
                                            <p className="text-slate-300 leading-relaxed text-[11.5px]">
                                                {irdResult.accion_tactica_coen}
                                            </p>
                                        </div>

                                        <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-[10px] font-mono text-slate-400 space-y-1">
                                            <div className="flex justify-between">
                                                <span>Ratio Q / Q_desborde:</span>
                                                <strong className="text-slate-200">{irdResult.parametros_calculo.ratio_capacidad_pct}%</strong>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Vulnerabilidad Dique:</span>
                                                <strong className="text-slate-200">{irdResult.parametros_calculo.vulnerabilidad_dique_factor}</strong>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Factor ENSO Aplicado:</span>
                                                <strong className="text-purple-300">{irdResult.parametros_calculo.factor_fen_aplicado}x</strong>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* CONTENIDO 4: GEMELO DIGITAL DE SOPORTE VITAL & SERVICIOS BÁSICOS (FASE 1) */}
            {pestañaPrincipal === "lifelines" && (
                <div className="space-y-6">
                    {/* ENCABEZADO Y CONSOLA DE MANDO */}
                    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6 shadow-2xl">
                        <div className="flex flex-wrap justify-between items-start gap-4">
                            <div className="max-w-3xl space-y-2">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider bg-cyan-950/60 px-3 py-1 rounded-full border border-cyan-800 flex items-center gap-1.5">
                                        <Droplets className="w-3.5 h-3.5 text-cyan-400" /> FASE 1: SOPORTE VITAL &amp; SERVICIOS BÁSICOS
                                    </span>
                                    <span className="text-xs font-mono font-bold bg-slate-800 text-slate-300 px-3 py-1 rounded-full border border-slate-700">
                                        SUNASS • COES • OSINERGMIN • OTASS
                                    </span>
                                </div>
                                <h2 className="text-2xl md:text-3xl font-black text-white">
                                    Gemelo Digital de Plantas de Agua (PTAP) &amp; Subestaciones Eléctricas
                                </h2>
                                <p className="text-xs text-slate-400 leading-relaxed">
                                    Monitorea en tiempo real la autonomía hídrica regresiva (T_reserva = V_reserva / Q_distribución) ante el cierre intempestivo de compuertas por turbidez aluvial (&gt;10,000 NTU), y emite órdenes de desconexión eléctrica preventiva cuando el anegamiento en patio de llaves amenace los transformadores de 220/60 kV.
                                </p>
                            </div>

                            {/* Badge de Estado Situacional General */}
                            {lifelinesData && (
                                <div className="p-4 rounded-2xl border text-right font-mono"
                                    style={{
                                        backgroundColor: lifelinesData.semaforo_tactico === "ROJO" ? "#ef444415" : lifelinesData.semaforo_tactico === "AMARILLO" ? "#eab30815" : "#22c55e15",
                                        borderColor: lifelinesData.semaforo_tactico === "ROJO" ? "#ef4444" : lifelinesData.semaforo_tactico === "AMARILLO" ? "#eab308" : "#22c55e"
                                    }}
                                >
                                    <span className="text-[10px] text-slate-400 block uppercase">Estado Redes Vitales</span>
                                    <strong className="text-lg font-black"
                                        style={{
                                            color: lifelinesData.semaforo_tactico === "ROJO" ? "#ef4444" : lifelinesData.semaforo_tactico === "AMARILLO" ? "#eab308" : "#22c55e"
                                        }}
                                    >
                                        {lifelinesData.estado_general_lifelines.replace(/_/g, " ")}
                                    </strong>
                                    <div className="text-[10px] text-slate-400 mt-1">
                                        Actualizado: {new Date(lifelinesData.timestamp_utc).toLocaleTimeString()}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* KPIS CONSOLIDADOS */}
                        {lifelinesData && (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
                                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1">
                                    <span className="text-[10px] font-mono text-slate-400 uppercase flex items-center gap-1.5">
                                        <Users className="w-3.5 h-3.5 text-blue-400" /> Población Servida
                                    </span>
                                    <div className="text-xl font-mono font-black text-white">
                                        {(lifelinesData.resumen_agua_potable.poblacion_total_monitoreada / 1000000).toFixed(2)}M hab.
                                    </div>
                                    <div className="text-[11px] text-slate-400">
                                        {lifelinesData.resumen_agua_potable.poblacion_colapso_inminente > 0 ? (
                                            <span className="text-red-400 font-bold">
                                                🚨 {lifelinesData.resumen_agua_potable.poblacion_colapso_inminente.toLocaleString()} en colapso &lt;4h
                                            </span>
                                        ) : (
                                            <span className="text-emerald-400">🟢 100% Suministro seguro</span>
                                        )}
                                    </div>
                                </div>

                                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1">
                                    <span className="text-[10px] font-mono text-slate-400 uppercase flex items-center gap-1.5">
                                        <Droplets className="w-3.5 h-3.5 text-cyan-400" /> PTAPs Monitoreadas
                                    </span>
                                    <div className="text-xl font-mono font-black text-white">
                                        {lifelinesData.resumen_agua_potable.total_ptaps} Plantas
                                    </div>
                                    <div className="text-[11px] text-slate-400">
                                        {lifelinesData.resumen_agua_potable.ptaps_cierre_forzoso > 0 ? (
                                            <span className="text-red-400 font-bold">
                                                ⛔ {lifelinesData.resumen_agua_potable.ptaps_cierre_forzoso} compuertas cerradas
                                            </span>
                                        ) : (
                                            <span className="text-emerald-400">🟢 Captación nominal activa</span>
                                        )}
                                    </div>
                                </div>

                                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1">
                                    <span className="text-[10px] font-mono text-slate-400 uppercase flex items-center gap-1.5">
                                        <Power className="w-3.5 h-3.5 text-amber-400" /> Subestaciones (SE)
                                    </span>
                                    <div className="text-xl font-mono font-black text-white">
                                        {lifelinesData.resumen_energia_electrica.total_subestaciones} Nodos 220kV
                                    </div>
                                    <div className="text-[11px] text-slate-400">
                                        {lifelinesData.resumen_energia_electrica.subestaciones_orden_corte > 0 ? (
                                            <span className="text-amber-400 font-bold">
                                                ⚡ {lifelinesData.resumen_energia_electrica.subestaciones_orden_corte} en orden de desconexión
                                            </span>
                                        ) : (
                                            <span className="text-emerald-400">🟢 Patios secos / aislados</span>
                                        )}
                                    </div>
                                </div>

                                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1">
                                    <span className="text-[10px] font-mono text-slate-400 uppercase flex items-center gap-1.5">
                                        <Truck className="w-3.5 h-3.5 text-purple-400" /> Flota Cisternas OTASS
                                    </span>
                                    <div className="text-xl font-mono font-black text-white">
                                        {lifelinesData.resumen_agua_potable.camiones_cisterna_totales_requeridos} Unidades
                                    </div>
                                    <div className="text-[11px] text-purple-300">
                                        Capacidad: 15,000L c/u
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* BANNER DE HOSPITALES ELECTRODEPENDIENTES EN RIESGO */}
                        {lifelinesData && lifelinesData.resumen_energia_electrica.hospitales_electrodependientes_en_riesgo.length > 0 && (
                            <div className="p-4 rounded-2xl bg-red-950/40 border border-red-800 flex items-start gap-3">
                                <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                                <div className="space-y-1 text-xs">
                                    <strong className="text-red-300 font-bold block">
                                        🚨 ALERTA ROJA COEN: Hospitales Electrodependientes en Riesgo por Desenergización de Subestación
                                    </strong>
                                    <div className="flex flex-wrap gap-2 pt-1">
                                        {lifelinesData.resumen_energia_electrica.hospitales_electrodependientes_en_riesgo.map((hosp: string, idx: number) => (
                                            <span key={idx} className="bg-red-900/80 border border-red-700 text-red-200 px-2.5 py-0.5 rounded-full font-mono text-[11px]">
                                                🏥 {hosp}
                                            </span>
                                        ))}
                                    </div>
                                    <p className="text-[11px] text-red-200/80 pt-1">
                                        Directiva: Confirmar inmediatamente abastecimiento de combustible diésel para grupos electrógenos y autonomía mínima de 48 horas.
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* GUÍA DOCTRINAL DE CERTEZA Y PROCEDENCIA DE DATOS (DATA PEDIGREE) */}
                        <div className="bg-slate-950/90 p-5 rounded-2xl border border-slate-800 space-y-3 shadow-xl">
                            <div className="flex flex-wrap justify-between items-center gap-2">
                                <span className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                                    Doctrina de Certeza de Datos C2 • Código de Colores de Procedencia (Data Pedigree):
                                </span>
                                <span className="text-[10px] font-mono text-slate-400 bg-slate-900 px-2.5 py-0.5 rounded border border-slate-800">
                                    Estándar SAGF-MC • COEN-Digital
                                </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                                {/* Verde */}
                                <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-800/60 space-y-1.5">
                                    <div className="flex items-center justify-between">
                                        <span className="font-mono font-bold text-emerald-400 flex items-center gap-1.5 text-[11px]">
                                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                                            🟢 DATO OFICIAL VALIDADO
                                        </span>
                                        <span className="text-[10px] font-mono text-emerald-300 font-bold bg-emerald-950 px-1.5 py-0.5 rounded border border-emerald-700">100% Certeza</span>
                                    </div>
                                    <p className="text-[11px] text-slate-300 leading-snug">
                                        Medido directamente por sensor físico in-situ, telemetría SCADA oficial o expediente técnico de diseño (SUNASS, ANA SNIRH, OSINERGMIN, COES).
                                    </p>
                                </div>

                                {/* Ámbar */}
                                <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-800/60 space-y-1.5">
                                    <div className="flex items-center justify-between">
                                        <span className="font-mono font-bold text-amber-400 flex items-center gap-1.5 text-[11px]">
                                            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                                            🟠 INFERENCIA ALGORÍTMICA
                                        </span>
                                        <span className="text-[10px] font-mono text-amber-300 font-bold bg-amber-950 px-1.5 py-0.5 rounded border border-amber-700">85-90% Certeza</span>
                                    </div>
                                    <p className="text-[11px] text-slate-300 leading-snug">
                                        Calculado por física hidráulica o correlación matemática ante ausencia de sensor directo (turbidez por radar SENAMHI + aforo ANA; T_reserva = V/Q).
                                    </p>
                                </div>

                                {/* Púrpura */}
                                <div className="p-3 rounded-xl bg-purple-950/20 border border-purple-800/60 space-y-1.5">
                                    <div className="flex items-center justify-between">
                                        <span className="font-mono font-bold text-purple-400 flex items-center gap-1.5 text-[11px]">
                                            <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                                            🟣 GROUND-TRUTH CAMPO
                                        </span>
                                        <span className="text-[10px] font-mono text-purple-300 font-bold bg-purple-950 px-1.5 py-0.5 rounded border border-purple-700">92% Certeza</span>
                                    </div>
                                    <p className="text-[11px] text-slate-300 leading-snug">
                                        Reporte pericial humano en terreno (Serenazgo, Policía, Defensa Civil, AYNI) con fotografía, coordenadas GPS y sello SHA-256 verificado.
                                    </p>
                                </div>

                                {/* Azul */}
                                <div className="p-3 rounded-xl bg-cyan-950/20 border border-cyan-800/60 space-y-1.5">
                                    <div className="flex items-center justify-between">
                                        <span className="font-mono font-bold text-cyan-400 flex items-center gap-1.5 text-[11px]">
                                            <span className="w-2.5 h-2.5 rounded-full bg-cyan-500" />
                                            🔵 SIMULACIÓN TÁCTICA C2
                                        </span>
                                        <span className="text-[10px] font-mono text-cyan-300 font-bold bg-cyan-950 px-1.5 py-0.5 rounded border border-cyan-700">Hipótesis C2</span>
                                    </div>
                                    <p className="text-[11px] text-slate-300 leading-snug">
                                        Escenario hipotético introducido por el analista en los controles deslizadores para evaluar planes de contingencia y entrenar la toma de decisiones.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* CONSOLA DE SIMULACIÓN DE ESCENARIOS C2 */}
                        <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4">
                            <div className="flex justify-between items-center">
                                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                                    <Sliders className="w-4 h-4 text-cyan-400" />
                                    Simulador Táctico C2: Impacto Hidráulico &amp; Anegamiento de Servicios Básicos
                                </h3>
                                <span className="text-[11px] font-mono text-slate-400">
                                    Ajuste los deslizadores para proyectar horas de corte y órdenes de disparo
                                </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Slider Turbidez */}
                                <div className="space-y-2 p-4 bg-slate-900/80 rounded-xl border border-slate-800">
                                    <div className="flex justify-between text-xs font-mono">
                                        <span className="text-slate-300 flex items-center gap-1.5">
                                            <Droplets className="w-3.5 h-3.5 text-cyan-400" /> Turbidez en Ríos Afluentes:
                                        </span>
                                        <strong className={simTurbidez >= 10000 ? "text-red-400 font-bold" : simTurbidez >= 3000 ? "text-amber-400" : "text-emerald-400"}>
                                            {simTurbidez.toLocaleString()} NTU {simTurbidez >= 10000 && "⛔ CIERRE FORZOSO"}
                                        </strong>
                                    </div>
                                    <input
                                        type="range"
                                        min="200"
                                        max="18000"
                                        step="200"
                                        value={simTurbidez}
                                        onChange={e => setSimTurbidez(parseFloat(e.target.value))}
                                        className="w-full accent-cyan-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
                                    />
                                    <div className="flex justify-between gap-2 pt-1 text-[10px]">
                                        <button
                                            onClick={() => setSimTurbidez(850)}
                                            className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700"
                                        >
                                            Normal (850 NTU)
                                        </button>
                                        <button
                                            onClick={() => setSimTurbidez(4000)}
                                            className="px-2 py-1 bg-amber-950/60 hover:bg-amber-900 text-amber-300 rounded border border-amber-800"
                                        >
                                            Alerta (4,000 NTU)
                                        </button>
                                        <button
                                            onClick={() => setSimTurbidez(14500)}
                                            className="px-2 py-1 bg-red-950/60 hover:bg-red-900 text-red-300 rounded border border-red-800"
                                        >
                                            Aluvión Huaico (14,500 NTU)
                                        </button>
                                    </div>
                                </div>

                                {/* Slider Tirante Inundación Subestaciones */}
                                <div className="space-y-2 p-4 bg-slate-900/80 rounded-xl border border-slate-800">
                                    <div className="flex justify-between text-xs font-mono">
                                        <span className="text-slate-300 flex items-center gap-1.5">
                                            <Power className="w-3.5 h-3.5 text-amber-400" /> Anegamiento Patio de Llaves:
                                        </span>
                                        <strong className={simTirante >= 45 ? "text-red-400 font-bold" : simTirante >= 35 ? "text-amber-400 font-bold" : "text-emerald-400"}>
                                            {simTirante} cm de agua {simTirante >= 35 && "⚡ CORTE PREVENTIVO"}
                                        </strong>
                                    </div>
                                    <input
                                        type="range"
                                        min="0"
                                        max="65"
                                        step="1"
                                        value={simTirante}
                                        onChange={e => setSimTirante(parseFloat(e.target.value))}
                                        className="w-full accent-amber-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
                                    />
                                    <div className="flex justify-between gap-2 pt-1 text-[10px]">
                                        <button
                                            onClick={() => setSimTirante(0)}
                                            className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700"
                                        >
                                            Seco (0 cm)
                                        </button>
                                        <button
                                            onClick={() => setSimTirante(38)}
                                            className="px-2 py-1 bg-amber-950/60 hover:bg-amber-900 text-amber-300 rounded border border-amber-800"
                                        >
                                            Preventivo (38 cm)
                                        </button>
                                        <button
                                            onClick={() => setSimTirante(52)}
                                            className="px-2 py-1 bg-red-950/60 hover:bg-red-900 text-red-300 rounded border border-red-800"
                                        >
                                            Disparo Total (52 cm)
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* FILTROS POR CATEGORÍA DE INFRAESTRUCTURA */}
                        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800">
                            <span className="text-xs font-mono text-slate-400 mr-2">Filtrar Activos:</span>
                            {(["TODOS", "PTAP", "SE", "BOC"] as const).map(tipo => (
                                <button
                                    key={tipo}
                                    onClick={() => setFiltroTipoLifeline(tipo)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition border ${
                                        filtroTipoLifeline === tipo
                                            ? "bg-cyan-600 text-white border-cyan-400 shadow-md shadow-cyan-600/20"
                                            : "bg-slate-900 text-slate-400 border-slate-800 hover:text-white"
                                    }`}
                                >
                                    {tipo === "TODOS" && "Todos los Activos"}
                                    {tipo === "PTAP" && "💧 Plantas de Agua Potable (7)"}
                                    {tipo === "SE" && "⚡ Subestaciones Eléctricas (5)"}
                                    {tipo === "BOC" && "🏗️ Bocatomas Troncales (4)"}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* CUADRÍCULA DE PLANTAS DE TRATAMIENTO DE AGUA POTABLE (PTAP) */}
                    {(filtroTipoLifeline === "TODOS" || filtroTipoLifeline === "PTAP") && lifelinesData && (
                        <div className="space-y-4">
                            <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                                <div className="flex items-center gap-2">
                                    <Droplets className="w-5 h-5 text-cyan-400" />
                                    <h3 className="text-lg font-bold text-white">
                                        Plantas de Tratamiento de Agua Potable (PTAP) • Reloj de Autonomía Hídrica
                                    </h3>
                                </div>
                                <span className="text-xs font-mono text-slate-400">
                                    Fórmula: T_reserva = V_reserva / Q_distribución
                                </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                                {lifelinesData.resumen_agua_potable.evaluaciones.map((ptap: any) => {
                                    const esCritica = ptap.nivel_alerta.includes("ROJO") || ptap.nivel_alerta.includes("NARANJA");
                                    return (
                                        <div
                                            key={ptap.id_ptap}
                                            className="p-5 rounded-2xl bg-slate-900 border transition hover:border-slate-700 flex flex-col justify-between space-y-4 shadow-xl"
                                            style={{ borderColor: esCritica ? `${ptap.color_hex}80` : "#334155" }}
                                        >
                                            <div className="space-y-2">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
                                                            {ptap.id_ptap}
                                                        </span>
                                                        <h4 className="text-base font-black text-white mt-1">
                                                            {ptap.nombre}
                                                        </h4>
                                                        <span className="text-xs text-slate-400">
                                                            {ptap.operador} • {ptap.distrito}, {ptap.departamento}
                                                        </span>
                                                    </div>
                                                    <span
                                                        className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold border"
                                                        style={{
                                                            backgroundColor: `${ptap.color_hex}20`,
                                                            borderColor: ptap.color_hex,
                                                            color: ptap.color_hex
                                                        }}
                                                    >
                                                        {ptap.estado_compuertas.replace(/_/g, " ")}
                                                    </span>
                                                </div>

                                                <div className="text-xs text-slate-300 font-mono flex items-center gap-1.5 pt-1">
                                                    <Waves className="w-3.5 h-3.5 text-blue-400" />
                                                    <span>Fuente: {ptap.rio_fuente}</span>
                                                </div>

                                                {/* RELOJ DE AUTONOMÍA HÍDRICA */}
                                                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                                                    <div className="flex justify-between items-center text-xs font-mono">
                                                        <span className="text-slate-400 flex items-center gap-1">
                                                            <Clock className="w-3.5 h-3.5 text-cyan-400" /> Autonomía de Reserva:
                                                        </span>
                                                        <div className="flex items-center gap-1.5">
                                                            <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-amber-950 text-amber-300 border border-amber-800">
                                                                🟠 MODELO T=V/Q
                                                            </span>
                                                            <strong className="text-base font-black" style={{ color: ptap.color_hex }}>
                                                                {ptap.autonomia_restante_horas === 999.0 ? "CONTINUO (∞)" : `${ptap.autonomia_restante_horas} HORAS`}
                                                            </strong>
                                                        </div>
                                                    </div>

                                                    <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                                                        <div
                                                            className="h-full rounded-full transition-all duration-500"
                                                            style={{
                                                                width: `${Math.min(100, (ptap.autonomia_restante_horas / ptap.autonomia_horas_si_cierra) * 100)}%`,
                                                                backgroundColor: ptap.color_hex
                                                            }}
                                                        />
                                                    </div>

                                                    <div className="flex justify-between text-[10px] font-mono text-slate-400 items-center">
                                                        <span className="flex items-center gap-1">
                                                            <span>Reserva: {ptap.volumen_reserva_total_m3.toLocaleString()} m³</span>
                                                            <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
                                                                🟢 OFICIAL SUNASS
                                                            </span>
                                                        </span>
                                                        <span>Q: {ptap.caudal_distribucion_m3h.toLocaleString()} m³/h</span>
                                                    </div>
                                                </div>

                                                {/* TACÓMETRO DE TURBIDEZ */}
                                                <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 text-[11px] font-mono space-y-1.5">
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-slate-400 flex items-center gap-1.5">
                                                            <span>Turbidez Actual:</span>
                                                            {simTurbidez !== 850 ? (
                                                                <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-800">
                                                                    🔵 SIMULADO C2
                                                                </span>
                                                            ) : (
                                                                <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-amber-950 text-amber-300 border border-amber-800">
                                                                    🟠 INFERENCIA RADAR
                                                                </span>
                                                            )}
                                                        </span>
                                                        <strong className={ptap.turbidez_evaluada_ntu >= ptap.umbral_turbidez_cierre_critico_ntu ? "text-red-400 font-bold" : "text-slate-200"}>
                                                            {ptap.turbidez_evaluada_ntu.toLocaleString()} NTU
                                                        </strong>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-slate-400">Umbral Cierre Forzoso:</span>
                                                        <span className="text-slate-300">{ptap.umbral_turbidez_cierre_critico_ntu.toLocaleString()} NTU</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-slate-400">Población Servida:</span>
                                                        <span className="text-cyan-300 font-bold">{ptap.poblacion_beneficiaria.toLocaleString()} hab.</span>
                                                    </div>
                                                </div>

                                                {/* MENSAJE TÁCTICO */}
                                                <div className="text-[11px] text-slate-300 p-2.5 rounded-lg bg-slate-950 border border-slate-800 leading-relaxed">
                                                    {ptap.mensaje_tactico_coen}
                                                </div>
                                            </div>

                                            {/* LOGÍSTICA DE CISTERNAS Y SELLO */}
                                            <div className="space-y-2 pt-2 border-t border-slate-800/80 text-[10px] font-mono">
                                                <div className="flex justify-between text-purple-300">
                                                    <span className="flex items-center gap-1">
                                                        <Truck className="w-3.5 h-3.5" /> Cisternas de Emergencia:
                                                    </span>
                                                    <strong className="text-white bg-purple-950 px-2 py-0.5 rounded border border-purple-800">
                                                        {ptap.logistica_cisternas.camiones_cisterna_requeridos} cisternas
                                                    </strong>
                                                </div>
                                                <div className="text-slate-500 truncate" title={`SHA-256: ${ptap.sello_criptografico_sha256}`}>
                                                    Sello SHA: {ptap.sello_criptografico_sha256.substring(0, 16)}...
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* CUADRÍCULA DE SUBESTACIONES ELÉCTRICAS (SE 220/60 kV) */}
                    {(filtroTipoLifeline === "TODOS" || filtroTipoLifeline === "SE") && lifelinesData && (
                        <div className="space-y-4">
                            <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                                <div className="flex items-center gap-2">
                                    <Power className="w-5 h-5 text-amber-400" />
                                    <h3 className="text-lg font-bold text-white">
                                        Subestaciones Eléctricas de Alta Tensión (SE 220/60 kV) • Seguridad Dieléctrica
                                    </h3>
                                </div>
                                <span className="text-xs font-mono text-slate-400">
                                    Protocolo: OSINERGMIN / COES PR-21
                                </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                                {lifelinesData.resumen_energia_electrica.evaluaciones.map((se: any) => {
                                    const esPeligro = se.orden_corte_preventivo;
                                    return (
                                        <div
                                            key={se.id_se}
                                            className="p-5 rounded-2xl bg-slate-900 border transition hover:border-slate-700 flex flex-col justify-between space-y-4 shadow-xl"
                                            style={{ borderColor: esPeligro ? `${se.color_hex}80` : "#334155" }}
                                        >
                                            <div className="space-y-3">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <span className="text-[10px] font-mono text-amber-400 bg-amber-950 px-2 py-0.5 rounded border border-amber-800">
                                                            {se.id_se} • {se.potencia_mva} MVA
                                                        </span>
                                                        <h4 className="text-base font-black text-white mt-1">
                                                            {se.nombre}
                                                        </h4>
                                                        <span className="text-xs text-slate-400">
                                                            {se.operador} • {se.distrito}, {se.departamento}
                                                        </span>
                                                    </div>
                                                    <span
                                                        className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold border"
                                                        style={{
                                                            backgroundColor: `${se.color_hex}20`,
                                                            borderColor: se.color_hex,
                                                            color: se.color_hex
                                                        }}
                                                    >
                                                        {se.nivel_alerta.replace(/_/g, " ")}
                                                    </span>
                                                </div>

                                                {/* MONITOR DE ANEGAMIENTO VS BASE TRANSFORMADOR */}
                                                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                                                    <div className="flex justify-between items-center text-xs font-mono">
                                                        <span className="text-slate-400 flex items-center gap-1.5">
                                                            <span>Tirante en Patio:</span>
                                                            {simTirante > 0 ? (
                                                                <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-800">
                                                                    🔵 SIMULADO C2
                                                                </span>
                                                            ) : (
                                                                <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                                                                    🟢 SENSOR SECO
                                                                </span>
                                                            )}
                                                        </span>
                                                        <strong className="text-base font-black" style={{ color: se.color_hex }}>
                                                            {se.tirante_inundacion_actual_cm} cm / {se.altura_base_transformadores_cm} cm
                                                        </strong>
                                                    </div>

                                                    <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
                                                        <div
                                                            className="h-full rounded-full transition-all duration-500"
                                                            style={{
                                                                width: `${Math.min(100, (se.tirante_inundacion_actual_cm / se.altura_base_transformadores_cm) * 100)}%`,
                                                                backgroundColor: se.color_hex
                                                            }}
                                                        />
                                                    </div>

                                                    <div className="flex justify-between text-[10px] font-mono text-slate-400 items-center">
                                                        <span>Margen de seguridad: <strong className={se.margen_seguridad_cm <= 0 ? "text-red-400" : "text-emerald-400"}>{se.margen_seguridad_cm} cm</strong></span>
                                                        <span className="flex items-center gap-1">
                                                            <span>Base {se.altura_base_transformadores_cm}cm</span>
                                                            <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
                                                                🟢 COES
                                                            </span>
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* ACCIÓN TÁCTICA COES */}
                                                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] leading-relaxed text-slate-300">
                                                    {se.accion_tactica_coes_coen}
                                                </div>

                                                {/* HOSPITALES DEPENDIENTES */}
                                                <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 space-y-1.5 text-[11px]">
                                                    <span className="text-slate-400 font-mono text-[10px] uppercase block">
                                                        Hospitales Electrodependientes en el Eje:
                                                    </span>
                                                    <div className="space-y-1">
                                                        {se.hospitales_electrodependientes.map((h: string, idx: number) => (
                                                            <div key={idx} className="flex items-center gap-1.5 text-slate-200">
                                                                <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                                                                <span>{h}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="space-y-1 pt-2 border-t border-slate-800/80 text-[10px] font-mono">
                                                <div className="flex justify-between text-slate-400">
                                                    <span>Usuarios en zona:</span>
                                                    <strong className="text-amber-300">{se.usuarios_afectados_estimados.toLocaleString()} usuarios</strong>
                                                </div>
                                                <div className="text-slate-500 truncate" title={`SHA-256: ${se.sello_criptografico_sha256}`}>
                                                    Sello SHA: {se.sello_criptografico_sha256.substring(0, 16)}...
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* CUADRÍCULA DE BOCATOMAS TRONCALES */}
                    {(filtroTipoLifeline === "TODOS" || filtroTipoLifeline === "BOC") && lifelinesData && (
                        <div className="space-y-4">
                            <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                                <div className="flex items-center gap-2">
                                    <Building2 className="w-5 h-5 text-purple-400" />
                                    <h3 className="text-lg font-bold text-white">
                                        Bocatomas Troncales de Derivación &amp; Desarenadores
                                    </h3>
                                </div>
                                <span className="text-xs font-mono text-slate-400">
                                    Operación de compuertas radiales y limpia de fondo
                                </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                                {lifelinesData.resumen_bocatomas.evaluaciones.map((boc: any) => (
                                    <div
                                        key={boc.id_bocatoma}
                                        className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between space-y-3 shadow-xl"
                                    >
                                        <div className="space-y-2">
                                            <div className="flex justify-between items-start">
                                                <span className="text-[10px] font-mono text-purple-400 bg-purple-950 px-2 py-0.5 rounded border border-purple-800">
                                                    {boc.id_bocatoma}
                                                </span>
                                                <span
                                                    className="px-2 py-0.5 rounded text-[10px] font-mono font-bold border"
                                                    style={{
                                                        backgroundColor: `${boc.color_hex}20`,
                                                        borderColor: boc.color_hex,
                                                        color: boc.color_hex
                                                    }}
                                                >
                                                    {boc.nivel_alerta.replace(/_/g, " ")}
                                                </span>
                                            </div>

                                            <h4 className="text-base font-black text-white">
                                                {boc.nombre}
                                            </h4>
                                            <div className="text-xs text-slate-400 font-mono">
                                                {boc.rio} • {boc.cuenca}
                                            </div>

                                            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-[10px] font-mono space-y-1">
                                                <div className="flex justify-between">
                                                    <span className="text-slate-400">Canal:</span>
                                                    <span className="text-slate-200 truncate max-w-[150px]">{boc.canal_derivacion}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-slate-400">Caudal Evaluado:</span>
                                                    <strong className="text-cyan-400">{boc.caudal_evaluado_m3s} m³/s</strong>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-slate-400">Umbral Palizadas:</span>
                                                    <span className="text-red-400">{boc.umbral_cierre_palizadas_m3s} m³/s</span>
                                                </div>
                                            </div>

                                            <div className="text-[11px] text-slate-300 p-2.5 rounded-lg bg-slate-950 border border-slate-800 leading-relaxed">
                                                {boc.accion_operativa}
                                            </div>
                                        </div>

                                        <div className="text-[10px] font-mono text-slate-500 truncate pt-2 border-t border-slate-800">
                                            Sello SHA: {boc.sello_criptografico_sha256.substring(0, 16)}...
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
