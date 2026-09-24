"use client";

import React, { useState, useEffect } from "react";
import {
    Activity,
    AlertTriangle,
    Camera,
    CheckCircle2,
    Clock,
    Download,
    Eye,
    FileEdit,
    FileText,
    HelpCircle,
    Layers,
    MapPin,
    Play,
    Radio,
    RefreshCw,
    Search,
    ShieldAlert,
    ShieldCheck,
    Volume2,
    Waves,
    Zap
} from "lucide-react";
import {
    ResponsiveContainer,
    ScatterChart,
    Scatter,
    XAxis,
    YAxis,
    ZAxis,
    Tooltip,
    CartesianGrid,
    ReferenceLine
} from "recharts";

interface EstacionScatter {
    nombre: string;
    altitud_msnm: number;
    lluvia_1h_mm: number;
    lluvia_12h_mm: number;
    lluvia_24h_mm: number;
    ecmwf_72h_mm: number;
    umbral_mm: number;
    tipo: string;
    estado_alerta: string;
    color_hex: string;
    ratio_saturacion_pct: number;
}

interface CuencaData {
    cuenca_id: string;
    nombre_cuenca: string;
    region: string;
    gradiente_orografico_mm_1000m: number;
    formula_orografica: string;
    total_estaciones: number;
    estaciones: EstacionScatter[];
    quebradas_criticas_asociadas: number;
}

interface EstacionIGP {
    id_estacion: string;
    codigo_amaru: string;
    nombre_estacion: string;
    nombre_quebrada: string;
    grupo: string;
    region: string;
    distrito: string;
    lat: number;
    lng: number;
    altitud_msnm: number;
    geofono_estado: "SILENTE" | "VIBRACION_LEVE" | "ALERTA_FLUJO_DETECTADO";
    infrasonido_db: number;
    ultima_imagen: {
        ruta_imagen: string;
        url_completa: string;
        actualizado_a: string;
        operativa: boolean;
    };
    ultima_alerta: {
        actividad_lahar: boolean;
        velocidad_lahar: number;
        altura_lahar: number;
        arrivos: {
            hora_estimada: string;
            minutos_impacto: number | null;
            localidades_cercanas: string[];
        };
    };
    entidad_custodia: string;
    poblacion_protegida: number;
}

interface QuebradaInfo {
    id_quebrada: string;
    nombre: string;
    cuenca: string;
    region: string;
    distrito: string;
    poblacion_en_cono_deyeccion: number;
    umbral_critico_mm_hora: number;
    tiempo_concentracion_horas: number;
    pendiente_media_pct: number;
    puntos_estrangulamiento: string[];
    obras_defensa_existentes: string;
    monitoreo_igp_in_situ: boolean;
}

export default function QuebradasC2Page() {
    const [tabActiva, setTabActiva] = useState<"ISAAC" | "IGP" | "CATALOGO">("ISAAC");
    const [cuencaSeleccionada, setCuencaSeleccionada] = useState<string>("RIMAC_CHOSICA");
    const [cuencaData, setCuencaData] = useState<CuencaData | null>(null);
    const [cuencasDisponibles, setCuencasDisponibles] = useState<{ id_cuenca: string; nombre_cuenca: string; region: string }[]>([]);
    
    // Telemetría IGP
    const [estacionesIGP, setEstacionesIGP] = useState<EstacionIGP[]>([]);
    const [filtroRegionIGP, setFiltroRegionIGP] = useState<string>("TODAS");
    const [modoOrigenIGP, setModoOrigenIGP] = useState<string>("CONECTANDO...");
    const [cargandoIGP, setCargandoIGP] = useState<boolean>(false);

    // Catálogo 60 quebradas
    const [quebradas, setQuebradas] = useState<QuebradaInfo[]>([]);
    const [busqueda, setBusqueda] = useState<string>("");
    const [filtroRegion, setFiltroRegion] = useState<string>("TODAS");

    // Modal / Alerta QILQAY
    const [quebradaAlerta, setQuebradaAlerta] = useState<QuebradaInfo | null>(null);
    const [ejecutandoQilqay, setEjecutandoQilqay] = useState<boolean>(false);
    const [resultadoQilqay, setResultadoQilqay] = useState<any>(null);

    // Métricas globales
    const [metricasC2, setMetricasC2] = useState<{
        total_quebradas: number;
        poblacion_riesgo: number;
        geofonos_alerta: number;
        lahares_en_curso: number;
    }>({
        total_quebradas: 60,
        poblacion_riesgo: 1845000,
        geofonos_alerta: 0,
        lahares_en_curso: 0
    });

    // Cargar Cuencas y Resumen C2 inicial
    useEffect(() => {
        fetch("/api/v1/quebradas/c2/cuencas")
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) setCuencasDisponibles(data);
            })
            .catch(() => {});

        fetch("/api/v1/quebradas/c2/resumen")
            .then(res => res.json())
            .then(data => {
                if (data && data.metricas_clave) {
                    setMetricasC2({
                        total_quebradas: data.metricas_clave.total_quebradas_catalogo || 60,
                        poblacion_riesgo: data.metricas_clave.poblacion_total_expuesta || 1845000,
                        geofonos_alerta: data.metricas_clave.geofonos_flujo_detectado || 0,
                        lahares_en_curso: data.metricas_clave.lahares_o_huaicos_en_curso || 0
                    });
                }
            })
            .catch(() => {});

        fetch("/api/v1/indices/quebradas")
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) setQuebradas(data);
            })
            .catch(() => {});
    }, []);

    // Cargar Datos ISAAC según cuenca seleccionada
    useEffect(() => {
        fetch(`/api/v1/quebradas/c2/isaac-scatter?cuenca_id=${cuencaSeleccionada}`)
            .then(res => res.json())
            .then(data => setCuencaData(data))
            .catch(() => {});
    }, [cuencaSeleccionada]);

    // Cargar Telemetría IGP
    const cargarTelemetriaIGP = (force: boolean = false) => {
        setCargandoIGP(true);
        fetch(`/api/v1/quebradas/c2/igp-telemetria?force_refresh=${force}`)
            .then(res => res.json())
            .then(data => {
                if (data && data.estaciones) {
                    setEstacionesIGP(data.estaciones);
                    setModoOrigenIGP(data.modo_origen || "OK");
                }
            })
            .catch(() => {})
            .finally(() => setCargandoIGP(false));
    };

    useEffect(() => {
        cargarTelemetriaIGP();
        const interval = setInterval(() => cargarTelemetriaIGP(), 30000);
        return () => clearInterval(interval);
    }, []);

    // Simular Geófono para prueba de Gabinete
    const handleSimularGeofono = (idEstacion: string) => {
        fetch("/api/v1/quebradas/c2/simular-geofono", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id_estacion: idEstacion, velocidad_ms: 4.8, altura_m: 2.4 })
        })
            .then(res => res.json())
            .then(data => {
                if (data.estado === "SIMULACRO_DISPARADO") {
                    cargarTelemetriaIGP(true);
                    setMetricasC2(prev => ({
                        ...prev,
                        geofonos_alerta: prev.geofonos_alerta + 1,
                        lahares_en_curso: prev.lahares_en_curso + 1
                    }));
                }
            })
            .catch(() => {});
    };

    // Disparar Alerta Táctica con Agente QILQAY
    const handleDispararQilqay = (q: QuebradaInfo) => {
        setQuebradaAlerta(q);
        setEjecutandoQilqay(true);
        setResultadoQilqay(null);

        fetch("/api/v1/quebradas/c2/disparar-alerta-qilqay", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                id_quebrada: q.id_quebrada,
                alcalde_o_autoridad: `Alcalde de ${q.distrito}`,
                actor_solicitante: "COEN / AMARU-QUEBRADAS C2"
            })
        })
            .then(res => res.json())
            .then(data => {
                setResultadoQilqay(data);
            })
            .catch(err => {
                console.error("Error al invocar QILQAY:", err);
            })
            .finally(() => {
                setEjecutandoQilqay(false);
            });
    };

    // Filtrar Estaciones IGP
    const estacionesIGPFiltradas = estacionesIGP.filter(e => {
        if (filtroRegionIGP === "TODAS") return true;
        return e.region.toUpperCase() === filtroRegionIGP;
    });

    // Filtrar Quebradas
    const quebradasFiltradas = quebradas.filter(q => {
        const matchTxt = (q.nombre + " " + q.cuenca + " " + q.distrito + " " + q.region).toLowerCase().includes(busqueda.toLowerCase());
        const matchReg = filtroRegion === "TODAS" || q.region.toUpperCase().includes(filtroRegion);
        return matchTxt && matchReg;
    });

    // Custom Tooltip para el Scatter Plot de ISAAC
    const CustomScatterTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            const data: EstacionScatter = payload[0].payload;
            return (
                <div className="bg-slate-900 border border-slate-700 p-3 rounded-lg shadow-2xl text-xs space-y-1">
                    <p className="font-bold text-white text-sm">{data.nombre}</p>
                    <p className="text-slate-400">Tipo: <span className="text-sky-300">{data.tipo}</span></p>
                    <p className="text-slate-400">Altitud: <span className="text-amber-300 font-mono">{data.altitud_msnm} msnm</span></p>
                    <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-800">
                        <p className="text-slate-300">Lluvia 1h: <span className="font-bold text-sky-400">{data.lluvia_1h_mm} mm</span></p>
                        <p className="text-slate-300">Lluvia 24h: <span className="font-bold text-cyan-400">{data.lluvia_24h_mm} mm</span></p>
                        <p className="text-slate-300">ECMWF 72h: <span className="font-bold text-indigo-400">{data.ecmwf_72h_mm} mm</span></p>
                        <p className="text-slate-300">Umbral Crítico: <span className="font-bold text-rose-400">{data.umbral_mm} mm</span></p>
                    </div>
                    <div className="pt-1">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                            data.estado_alerta === "DISPARO_INMINENTE" ? "bg-red-500/20 text-red-400 border border-red-500/40" :
                            data.estado_alerta === "ALERTA_PREVENTIVA" ? "bg-orange-500/20 text-orange-400 border border-orange-500/40" :
                            data.estado_alerta === "VIGILANCIA" ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/40" :
                            "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                        }`}>
                            {data.estado_alerta} ({data.ratio_saturacion_pct}% del umbral)
                        </span>
                    </div>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="space-y-6">
            {/* Banner de Cabecera C2 */}
            <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-slate-850 to-indigo-950 border border-slate-800 p-6 rounded-2xl shadow-xl">
                <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="space-y-1">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400">
                                <Waves className="w-6 h-6 animate-pulse" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                                    AMARU-QUEBRADAS C2
                                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-300 font-mono">
                                        ISAAC + IGP LAHARES
                                    </span>
                                </h1>
                                <p className="text-xs text-slate-400">
                                    Sala Táctica de Mando & Control Hidro-Geofísico • Dispersión Altitudinal SENAMHI + Geófonos IGP en Tiempo Real
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Resumen de Métricas */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                        <div className="bg-slate-950/60 border border-slate-800/80 p-2.5 rounded-xl">
                            <p className="text-[10px] text-slate-400 font-medium">QUEBRADAS CRÍTICAS</p>
                            <p className="text-xl font-bold text-white font-mono">{metricasC2.total_quebradas}</p>
                        </div>
                        <div className="bg-slate-950/60 border border-slate-800/80 p-2.5 rounded-xl">
                            <p className="text-[10px] text-slate-400 font-medium">POBLACIÓN EN RIESGO</p>
                            <p className="text-xl font-bold text-amber-400 font-mono">{(metricasC2.poblacion_riesgo / 1000000).toFixed(2)}M</p>
                        </div>
                        <div className="bg-slate-950/60 border border-slate-800/80 p-2.5 rounded-xl">
                            <p className="text-[10px] text-slate-400 font-medium">GEÓFONOS IGP</p>
                            <p className={`text-xl font-bold font-mono ${metricasC2.geofonos_alerta > 0 ? "text-rose-400 animate-pulse" : "text-emerald-400"}`}>
                                {metricasC2.geofonos_alerta > 0 ? `${metricasC2.geofonos_alerta} EN ALERTA` : "SILENTES (OK)"}
                            </p>
                        </div>
                        <div className="bg-slate-950/60 border border-slate-800/80 p-2.5 rounded-xl">
                            <p className="text-[10px] text-slate-400 font-medium">TELEMETRÍA EN VIVO</p>
                            <p className="text-xs font-semibold text-sky-400 mt-1 flex items-center justify-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-sky-400 animate-ping"></span>
                                {modoOrigenIGP.includes("API") ? "IGP ONLINE" : "RESILIENTE"}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Pestañas de Navegación del Módulo */}
            <div className="flex border-b border-slate-800 gap-2">
                <button
                    onClick={() => setTabActiva("ISAAC")}
                    className={`flex items-center gap-2 px-5 py-3 font-semibold text-sm rounded-t-xl transition-colors border-t border-x ${
                        tabActiva === "ISAAC"
                            ? "bg-slate-900 border-slate-800 text-sky-400 border-b-2 border-b-sky-500"
                            : "bg-slate-950/40 border-transparent text-slate-400 hover:text-white"
                    }`}
                >
                    <Activity className="w-4 h-4" />
                    Visor ISAAC Multi-Cuenca (Lluvia vs. Altitud)
                </button>
                <button
                    onClick={() => setTabActiva("IGP")}
                    className={`flex items-center gap-2 px-5 py-3 font-semibold text-sm rounded-t-xl transition-colors border-t border-x ${
                        tabActiva === "IGP"
                            ? "bg-slate-900 border-slate-800 text-rose-400 border-b-2 border-b-rose-500"
                            : "bg-slate-950/40 border-transparent text-slate-400 hover:text-white"
                    }`}
                >
                    <Camera className="w-4 h-4" />
                    Cámaras & Geófonos IGP en Vivo
                    {metricasC2.geofonos_alerta > 0 && (
                        <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
                    )}
                </button>
                <button
                    onClick={() => setTabActiva("CATALOGO")}
                    className={`flex items-center gap-2 px-5 py-3 font-semibold text-sm rounded-t-xl transition-colors border-t border-x ${
                        tabActiva === "CATALOGO"
                            ? "bg-slate-900 border-slate-800 text-emerald-400 border-b-2 border-b-emerald-500"
                            : "bg-slate-950/40 border-transparent text-slate-400 hover:text-white"
                    }`}
                >
                    <Layers className="w-4 h-4" />
                    Catálogo de 60 Quebradas & Despacho QILQAY
                </button>
            </div>

            {/* ========================================================================= */}
            {/* PESTAÑA 1: VISOR ISAAC MULTI-CUENCA (SCATTER PLOT)                        */}
            {/* ========================================================================= */}
            {tabActiva === "ISAAC" && (
                <div className="space-y-6">
                    {/* Barra de Control de Cuenca */}
                    <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900/60 border border-slate-800 p-4 rounded-xl">
                        <div className="flex items-center gap-3">
                            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Cuenca Operativa:</span>
                            <div className="flex flex-wrap gap-2">
                                {cuencasDisponibles.map(c => (
                                    <button
                                        key={c.id_cuenca}
                                        onClick={() => setCuencaSeleccionada(c.id_cuenca)}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                                            cuencaSeleccionada === c.id_cuenca
                                                ? "bg-sky-500 text-white shadow-lg shadow-sky-500/20"
                                                : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                                        }`}
                                    >
                                        {c.nombre_cuenca.split("(")[0]}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {cuencaData && (
                            <div className="text-right text-xs text-slate-400 font-mono">
                                Gradiente: <span className="text-amber-400 font-bold">{cuencaData.gradiente_orografico_mm_1000m} mm / 1000m</span> • {cuencaData.total_estaciones} estaciones
                            </div>
                        )}
                    </div>

                    {/* Gráfico Scatter Plot ISAAC */}
                    <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl shadow-xl space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-base font-bold text-white flex items-center gap-2">
                                    Perfil Longitudinal de Precipitación vs. Altitud (Modelo ISAAC Chosica / SENAMHI)
                                </h3>
                                <p className="text-xs text-slate-400">
                                    Eje X: Altitud de la estación (msnm) • Eje Y: Lluvia acumulada 1h (mm) • La línea roja demarca el umbral crítico de activación
                                </p>
                            </div>
                            <div className="flex items-center gap-4 text-xs">
                                <span className="flex items-center gap-1.5 text-slate-300">
                                    <span className="w-3 h-3 rounded-full bg-emerald-500"></span> Normal
                                </span>
                                <span className="flex items-center gap-1.5 text-slate-300">
                                    <span className="w-3 h-3 rounded-full bg-yellow-500"></span> Vigilancia
                                </span>
                                <span className="flex items-center gap-1.5 text-slate-300">
                                    <span className="w-3 h-3 rounded-full bg-orange-500"></span> Alerta Preventiva
                                </span>
                                <span className="flex items-center gap-1.5 text-slate-300">
                                    <span className="w-3 h-3 rounded-full bg-rose-500 animate-pulse"></span> Disparo Inminente
                                </span>
                            </div>
                        </div>

                        <div className="h-[360px] w-full">
                            {cuencaData && (
                                <ResponsiveContainer width="100%" height="100%">
                                    <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 10 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                                        <XAxis
                                            type="number"
                                            dataKey="altitud_msnm"
                                            name="Altitud"
                                            unit=" m"
                                            domain={[0, 4800]}
                                            stroke="#94a3b8"
                                            tick={{ fontSize: 11 }}
                                        />
                                        <YAxis
                                            type="number"
                                            dataKey="lluvia_1h_mm"
                                            name="Lluvia 1h"
                                            unit=" mm"
                                            domain={[0, 35]}
                                            stroke="#94a3b8"
                                            tick={{ fontSize: 11 }}
                                        />
                                        <ZAxis type="number" dataKey="ratio_saturacion_pct" range={[60, 200]} />
                                        <Tooltip content={<CustomScatterTooltip />} />
                                        <ReferenceLine y={15} stroke="#ef4444" strokeDasharray="5 5" label={{ value: "Umbral Crítico Promedio (15 mm/h)", fill: "#ef4444", fontSize: 11, position: "insideTopRight" }} />
                                        <Scatter
                                            name="Estaciones Pluviométricas"
                                            data={cuencaData.estaciones}
                                            fill="#38bdf8"
                                            shape={(props: any) => {
                                                const { cx, cy, payload } = props;
                                                return (
                                                    <circle
                                                        cx={cx}
                                                        cy={cy}
                                                        r={payload.lluvia_1h_mm >= payload.umbral_mm ? 9 : 6}
                                                        fill={payload.color_hex}
                                                        stroke="#ffffff"
                                                        strokeWidth={1.5}
                                                    />
                                                );
                                            }}
                                        />
                                    </ScatterChart>
                                </ResponsiveContainer>
                            )}
                        </div>
                    </div>

                    {/* Tabla de Estaciones de la Cuenca */}
                    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
                        <div className="px-5 py-3.5 bg-slate-850 border-b border-slate-800 flex items-center justify-between">
                            <span className="text-sm font-bold text-white">Red Pluviométrica de la Cuenca ({cuencaData?.estaciones.length || 0} estaciones)</span>
                            <span className="text-xs text-slate-400 font-mono">Actualizado cada 15 min</span>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead className="bg-slate-950/60 text-slate-400 uppercase font-mono border-b border-slate-800">
                                    <tr>
                                        <th className="py-3 px-4">Estación</th>
                                        <th className="py-3 px-3">Altitud</th>
                                        <th className="py-3 px-3">Lluvia 1h</th>
                                        <th className="py-3 px-3">Lluvia 12h</th>
                                        <th className="py-3 px-3">Lluvia 24h</th>
                                        <th className="py-3 px-3">ECMWF Pro 72h</th>
                                        <th className="py-3 px-3">Umbral Crítico</th>
                                        <th className="py-3 px-4">Estado ISAAC</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                                    {cuencaData?.estaciones.map((est, idx) => (
                                        <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                                            <td className="py-3 px-4 font-semibold text-white flex items-center gap-2">
                                                <Radio className="w-3.5 h-3.5 text-sky-400" />
                                                {est.nombre}
                                                <span className="text-[10px] text-slate-400 font-normal">({est.tipo})</span>
                                            </td>
                                            <td className="py-3 px-3 font-mono text-amber-300">{est.altitud_msnm} msnm</td>
                                            <td className="py-3 px-3 font-mono font-bold text-sky-400">{est.lluvia_1h_mm} mm</td>
                                            <td className="py-3 px-3 font-mono">{est.lluvia_12h_mm} mm</td>
                                            <td className="py-3 px-3 font-mono">{est.lluvia_24h_mm} mm</td>
                                            <td className="py-3 px-3 font-mono text-indigo-400">{est.ecmwf_72h_mm} mm</td>
                                            <td className="py-3 px-3 font-mono text-rose-400">{est.umbral_mm} mm</td>
                                            <td className="py-3 px-4">
                                                <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                                                    est.estado_alerta === "DISPARO_INMINENTE" ? "bg-rose-500/20 text-rose-300 border border-rose-500/40" :
                                                    est.estado_alerta === "ALERTA_PREVENTIVA" ? "bg-orange-500/20 text-orange-300 border border-orange-500/40" :
                                                    est.estado_alerta === "VIGILANCIA" ? "bg-yellow-500/20 text-yellow-300 border border-yellow-500/40" :
                                                    "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                                                }`}>
                                                    {est.estado_alerta}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* ========================================================================= */}
            {/* PESTAÑA 2: CÁMARAS Y GEÓFONOS IGP EN VIVO (grd.igp.gob.pe)                 */}
            {/* ========================================================================= */}
            {tabActiva === "IGP" && (
                <div className="space-y-6">
                    {/* Barra de Filtros y Control IGP */}
                    <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900/60 border border-slate-800 p-4 rounded-xl">
                        <div className="flex items-center gap-3">
                            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Región:</span>
                            <div className="flex gap-2">
                                {["TODAS", "LIMA", "PIURA", "AREQUIPA"].map(r => (
                                    <button
                                        key={r}
                                        onClick={() => setFiltroRegionIGP(r)}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                                            filtroRegionIGP === r
                                                ? "bg-rose-500 text-white shadow-lg shadow-rose-500/20"
                                                : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                                        }`}
                                    >
                                        {r}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => cargarTelemetriaIGP(true)}
                                disabled={cargandoIGP}
                                className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 transition-colors"
                            >
                                <RefreshCw className={`w-3.5 h-3.5 ${cargandoIGP ? "animate-spin text-sky-400" : ""}`} />
                                Actualizar Telemetría IGP
                            </button>
                        </div>
                    </div>

                    {/* Grid de Estaciones IGP con Cámara y Geófono */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {estacionesIGPFiltradas.map((est) => {
                            const alertaActiva = est.ultima_alerta.actividad_lahar || est.geofono_estado === "ALERTA_FLUJO_DETECTADO";
                            return (
                                <div
                                    key={est.id_estacion}
                                    className={`bg-slate-900/80 border rounded-2xl overflow-hidden shadow-xl transition-all duration-300 ${
                                        alertaActiva
                                            ? "border-rose-500 ring-2 ring-rose-500/30 shadow-rose-500/10"
                                            : "border-slate-800 hover:border-slate-700"
                                    }`}
                                >
                                    {/* Cabecera de la Tarjeta */}
                                    <div className="p-4 border-b border-slate-800 flex items-start justify-between bg-slate-850/60">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h4 className="font-bold text-white text-sm">{est.nombre_estacion}</h4>
                                                <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                                                    {est.codigo_amaru}
                                                </span>
                                            </div>
                                            <p className="text-xs text-slate-400 mt-0.5">
                                                {est.nombre_quebrada} • {est.region} ({est.altitud_msnm} msnm)
                                            </p>
                                        </div>
                                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 ${
                                            alertaActiva
                                                ? "bg-rose-500/20 text-rose-300 border border-rose-500/50 animate-pulse"
                                                : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                                        }`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${alertaActiva ? "bg-rose-400 animate-ping" : "bg-emerald-400"}`}></span>
                                            {est.geofono_estado.replace("_", " ")}
                                        </span>
                                    </div>

                                    {/* Feed de Cámara IP */}
                                    <div className="relative aspect-video bg-slate-950 flex items-center justify-center overflow-hidden group">
                                        <img
                                            src={est.ultima_imagen.url_completa}
                                            alt={est.nombre_estacion}
                                            onError={(e) => {
                                                // Fallback si la cámara institucional no responde
                                                (e.target as HTMLElement).style.display = "none";
                                            }}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/40 pointer-events-none"></div>

                                        {/* Marca de Tiempo y Estado de Cámara */}
                                        <div className="absolute top-2 left-2 flex items-center gap-1.5 bg-black/60 backdrop-blur px-2.5 py-1 rounded-md text-[10px] text-slate-300 font-mono">
                                            <Camera className="w-3 h-3 text-sky-400" />
                                            <span>EN VIVO IGP</span>
                                        </div>
                                        <div className="absolute bottom-2 left-2 text-[10px] text-slate-300 font-mono bg-black/60 backdrop-blur px-2 py-0.5 rounded">
                                            {est.ultima_imagen.actualizado_a}
                                        </div>
                                    </div>

                                    {/* Telemetría Geofísica */}
                                    <div className="p-4 space-y-3">
                                        <div className="grid grid-cols-3 gap-2 text-center">
                                            <div className="bg-slate-950/60 p-2 rounded-lg border border-slate-800/80">
                                                <p className="text-[10px] text-slate-400 font-medium">INFRASONIDO</p>
                                                <p className="text-sm font-bold text-amber-300 font-mono">{est.infrasonido_db} dB</p>
                                            </div>
                                            <div className="bg-slate-950/60 p-2 rounded-lg border border-slate-800/80">
                                                <p className="text-[10px] text-slate-400 font-medium">VELOCIDAD</p>
                                                <p className={`text-sm font-bold font-mono ${est.ultima_alerta.velocidad_lahar > 1.5 ? "text-rose-400 font-bold" : "text-slate-300"}`}>
                                                    {est.ultima_alerta.velocidad_lahar.toFixed(1)} m/s
                                                </p>
                                            </div>
                                            <div className="bg-slate-950/60 p-2 rounded-lg border border-slate-800/80">
                                                <p className="text-[10px] text-slate-400 font-medium">TIRANTE</p>
                                                <p className="text-sm font-bold text-cyan-300 font-mono">{est.ultima_alerta.altura_lahar.toFixed(1)} m</p>
                                            </div>
                                        </div>

                                        {/* Estado de Llegada y Localidades */}
                                        <div className="bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/60 text-xs space-y-1">
                                            <div className="flex justify-between text-slate-300">
                                                <span className="text-slate-400">Arribo Estimado (ETA):</span>
                                                <span className="font-bold font-mono text-white">
                                                    {est.ultima_alerta.arrivos.hora_estimada}
                                                </span>
                                            </div>
                                            <div className="flex justify-between text-slate-300">
                                                <span className="text-slate-400">Población Expuesta:</span>
                                                <span className="font-bold font-mono text-amber-400">
                                                    {est.poblacion_protegida.toLocaleString()} hab.
                                                </span>
                                            </div>
                                        </div>

                                        {/* Botones de Acción */}
                                        <div className="flex items-center gap-2 pt-1">
                                            <button
                                                onClick={() => handleSimularGeofono(est.id_estacion)}
                                                className="flex-1 py-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-lg border border-slate-700 flex items-center justify-center gap-1.5 transition-colors"
                                            >
                                                <Play className="w-3 h-3 text-amber-400" />
                                                Simular Detección
                                            </button>
                                            <button
                                                onClick={() => {
                                                    const qMatch = quebradas.find(q => q.id_quebrada === est.codigo_amaru) || {
                                                        id_quebrada: est.codigo_amaru,
                                                        nombre: est.nombre_quebrada,
                                                        cuenca: est.nombre_estacion,
                                                        region: est.region,
                                                        distrito: est.distrito,
                                                        poblacion_en_cono_deyeccion: est.poblacion_protegida,
                                                        umbral_critico_mm_hora: 15.0,
                                                        tiempo_concentracion_horas: 1.5,
                                                        pendiente_media_pct: 18.0,
                                                        puntos_estrangulamiento: ["Cono de Deyección Urbano"],
                                                        obras_defensa_existentes: "Mallas dinámicas y diques",
                                                        monitoreo_igp_in_situ: true
                                                    };
                                                    handleDispararQilqay(qMatch);
                                                }}
                                                className="py-1.5 px-3 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-lg shadow-lg shadow-rose-600/20 flex items-center justify-center gap-1.5 transition-colors"
                                            >
                                                <ShieldAlert className="w-3.5 h-3.5" />
                                                Evacuar QILQAY
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* ========================================================================= */}
            {/* PESTAÑA 3: CATÁLOGO DE 60 QUEBRADAS & ACCIÓN CON AGENTE QILQAY            */}
            {/* ========================================================================= */}
            {tabActiva === "CATALOGO" && (
                <div className="space-y-6">
                    {/* Barra de Filtro y Búsqueda */}
                    <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900/60 border border-slate-800 p-4 rounded-xl">
                        <div className="flex items-center gap-3 flex-1 min-w-[280px]">
                            <Search className="w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                value={busqueda}
                                onChange={(e) => setBusqueda(e.target.value)}
                                placeholder="Buscar por quebrada, cuenca, distrito o región..."
                                className="w-full bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none"
                            />
                        </div>

                        <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-400 font-medium">Región:</span>
                            <select
                                value={filtroRegion}
                                onChange={(e) => setFiltroRegion(e.target.value)}
                                className="bg-slate-800 border border-slate-700 text-white text-xs rounded-lg px-2.5 py-1.5 focus:outline-none"
                            >
                                <option value="TODAS">Todas las Regiones</option>
                                <option value="LIMA">Lima</option>
                                <option value="LA LIBERTAD">La Libertad</option>
                                <option value="PIURA">Piura</option>
                                <option value="AREQUIPA">Arequipa</option>
                                <option value="ANCASH">Áncash</option>
                                <option value="ICA">Ica</option>
                                <option value="LAMBAYEQUE">Lambayeque</option>
                                <option value="CAJAMARCA">Cajamarca</option>
                            </select>
                        </div>
                    </div>

                    {/* Tabla de 60 Quebradas Críticas */}
                    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                        <div className="px-5 py-3.5 bg-slate-850 border-b border-slate-800 flex items-center justify-between">
                            <span className="text-sm font-bold text-white">Catálogo Nacional de Quebradas Críticas ({quebradasFiltradas.length} identificadas)</span>
                            <span className="text-xs text-slate-400 font-mono">Fórmulas de Manning & Retardo T_lag integradas</span>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead className="bg-slate-950/60 text-slate-400 uppercase font-mono border-b border-slate-800">
                                    <tr>
                                        <th className="py-3 px-4">Código / Quebrada</th>
                                        <th className="py-3 px-3">Cuenca</th>
                                        <th className="py-3 px-3">Ubicación</th>
                                        <th className="py-3 px-3">Población Cono</th>
                                        <th className="py-3 px-3">Umbral (mm/h)</th>
                                        <th className="py-3 px-3">Tiempo Concentración</th>
                                        <th className="py-3 px-3">Monitoreo IGP</th>
                                        <th className="py-3 px-4 text-center">Acción Táctica</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                                    {quebradasFiltradas.map((q) => (
                                        <tr key={q.id_quebrada} className="hover:bg-slate-800/30 transition-colors">
                                            <td className="py-3 px-4 font-semibold text-white">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-mono text-sky-400 font-bold">{q.id_quebrada}</span>
                                                    <span>{q.nombre}</span>
                                                </div>
                                            </td>
                                            <td className="py-3 px-3 text-slate-300">{q.cuenca}</td>
                                            <td className="py-3 px-3 text-slate-300">
                                                {q.distrito}, <span className="text-slate-400 font-medium">{q.region}</span>
                                            </td>
                                            <td className="py-3 px-3 font-mono font-bold text-amber-300">
                                                {q.poblacion_en_cono_deyeccion.toLocaleString()}
                                            </td>
                                            <td className="py-3 px-3 font-mono text-rose-400 font-semibold">
                                                {q.umbral_critico_mm_hora} mm/h
                                            </td>
                                            <td className="py-3 px-3 font-mono text-slate-300">
                                                {q.tiempo_concentracion_horas} h (~{Math.round(q.tiempo_concentracion_horas * 60)} min)
                                            </td>
                                            <td className="py-3 px-3">
                                                {q.monitoreo_igp_in_situ ? (
                                                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center gap-1 w-max">
                                                        <Camera className="w-3 h-3" />
                                                        GEÓFONO + CAM
                                                    </span>
                                                ) : (
                                                    <span className="px-2 py-0.5 rounded text-[10px] text-slate-500 bg-slate-800/60">
                                                        SENAMHI SAT
                                                    </span>
                                                )}
                                            </td>
                                            <td className="py-3 px-4 text-center">
                                                <button
                                                    onClick={() => handleDispararQilqay(q)}
                                                    className="px-3 py-1.5 bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-semibold rounded-lg shadow-md transition-all text-xs flex items-center gap-1.5 mx-auto"
                                                >
                                                    <FileEdit className="w-3.5 h-3.5" />
                                                    Evacuar con QILQAY
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* ========================================================================= */}
            {/* MODAL / PANEL DE ACCIÓN TÁCTICA DEL AGENTE QILQAY                         */}
            {/* ========================================================================= */}
            {quebradaAlerta && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
                    <div className="bg-slate-900 border border-slate-700 w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden my-8">
                        {/* Cabecera del Modal */}
                        <div className="bg-gradient-to-r from-rose-950 via-slate-900 to-slate-900 p-5 border-b border-slate-800 flex items-start justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-rose-500/20 border border-rose-500/40 rounded-xl text-rose-300">
                                    <ShieldAlert className="w-6 h-6 animate-pulse" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                        Acción Táctica Perentoria: {quebradaAlerta.nombre}
                                    </h3>
                                    <p className="text-xs text-slate-400">
                                        Despacho Inmediato del Agente QILQAY • Emisión de Resolución Oficial & Alerta SISMATE
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setQuebradaAlerta(null)}
                                className="text-slate-400 hover:text-white p-1 rounded-lg"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Contenido del Modal */}
                        <div className="p-6 space-y-5">
                            {ejecutandoQilqay && (
                                <div className="py-12 text-center space-y-3">
                                    <div className="w-12 h-12 border-4 border-rose-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                                    <p className="text-sm font-semibold text-white">Agente QILQAY redactando Resolución de Alcaldía...</p>
                                    <p className="text-xs text-slate-400 font-mono">
                                        Enjaulando datos del D.S. 124-2026-PCM, Ley 29664 y cinemática de Manning
                                    </p>
                                </div>
                            )}

                            {!ejecutandoQilqay && resultadoQilqay && (
                                <div className="space-y-4">
                                    {/* Alerta CAP para SISMATE */}
                                    <div className="bg-rose-950/40 border border-rose-800/80 p-4 rounded-xl space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                                                <Volume2 className="w-4 h-4 animate-bounce" />
                                                Mensaje de Difusión Celular SISMATE / INDECI (CAP v1.2)
                                            </span>
                                            <span className="text-[10px] font-mono text-rose-300 bg-rose-900/60 px-2 py-0.5 rounded">
                                                EXTREME / INMEDIATE
                                            </span>
                                        </div>
                                        <p className="text-xs text-slate-200 font-medium bg-black/40 p-3 rounded-lg border border-rose-900/40">
                                            {resultadoQilqay.alerta_cap_sismate.mensaje_difusion_celular}
                                        </p>
                                    </div>

                                    {/* Ficha de Resolución Oficial */}
                                    <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-xl space-y-3">
                                        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                                            <div>
                                                <h4 className="text-sm font-bold text-white">
                                                    {resultadoQilqay.documento_qilqay.correlativo_oficial}
                                                </h4>
                                                <p className="text-xs text-slate-400">
                                                    {resultadoQilqay.documento_qilqay.titulo}
                                                </p>
                                            </div>
                                            <span className="text-[10px] px-2 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-full font-semibold">
                                                FE PÚBLICA VERIFICADA
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3 text-xs text-slate-300">
                                            <div>
                                                <span className="text-slate-400">Tiempo de Retardo T_lag:</span>
                                                <span className="font-bold text-white font-mono ml-2">
                                                    {resultadoQilqay.cinematica_manning.t_lag_minutos} minutos
                                                </span>
                                            </div>
                                            <div>
                                                <span className="text-slate-400">Velocidad Onda Manning:</span>
                                                <span className="font-bold text-amber-400 font-mono ml-2">
                                                    {resultadoQilqay.cinematica_manning.velocidad_ms} m/s
                                                </span>
                                            </div>
                                            <div>
                                                <span className="text-slate-400">Población Protegida:</span>
                                                <span className="font-bold text-white font-mono ml-2">
                                                    {resultadoQilqay.poblacion_en_riesgo.toLocaleString()} hab.
                                                </span>
                                            </div>
                                            <div>
                                                <span className="text-slate-400">Probabilidad IPH:</span>
                                                <span className="font-bold text-rose-400 font-mono ml-2">
                                                    {resultadoQilqay.cinematica_manning.probabilidad_iph_pct}%
                                                </span>
                                            </div>
                                        </div>

                                        <div className="pt-2 border-t border-slate-800/80">
                                            <p className="text-[10px] text-slate-400">Sello Criptográfico SHA-256:</p>
                                            <p className="text-[11px] font-mono text-sky-400 break-all bg-black/40 p-2 rounded">
                                                {resultadoQilqay.documento_qilqay.hash_sha256}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Botones de Descarga y Cierre */}
                                    <div className="flex items-center justify-end gap-3 pt-2">
                                        <a
                                            href={`/api/v1/agents/qilqay/documento/${resultadoQilqay.documento_qilqay.documento_id}/pdf`}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-xl shadow-lg transition-colors flex items-center gap-1.5"
                                        >
                                            <Download className="w-4 h-4" />
                                            Descargar Resolución PDF A4
                                        </a>
                                        <button
                                            onClick={() => setQuebradaAlerta(null)}
                                            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-xl transition-colors"
                                        >
                                            Cerrar
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
