"use client";

import React, { useEffect, useState, useMemo } from "react";
import HeaderNav from "@/components/HeaderNav";
import {
    Waves,
    Calendar,
    ThermometerSnowflake,
    ThermometerSun,
    AlertOctagon,
    AlertTriangle,
    CheckCircle2,
    RefreshCw,
    Compass,
    Anchor,
    TrendingUp,
    Info,
    ExternalLink,
    MapPin,
    Radio,
    ZoomIn,
    Layers,
    X,
    Flame,
    ArrowUpDown
} from "lucide-react";
import {
    ResponsiveContainer,
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
    Legend,
    ReferenceLine
} from "recharts";

export interface CartaSatelital {
    id: string;
    titulo: string;
    fuente: string;
    fecha_referencia: string;
    descripcion: string;
    url: string;
    dimensiones?: { width: number; height: number };
}

interface EstacionImarpe {
    id: string;
    nombre: string;
    puerto: string;
    region: string;
    lat: number;
    lng: number;
    tsm_c: number | null;
    anomalia_c: number | null;
    estado_reporte: string;
    alerta: {
        nivel: string;
        etiqueta: string;
        color: string;
        severidad: number;
    };
}

interface BoletinImarpe {
    archivo: string;
    fecha: string;
    boletin_nro: string;
    boletin_anio: string;
    diagnostico_oficial: string;
    fecha_observacion: string;
    cartas_satelitales?: CartaSatelital[];
    estaciones: EstacionImarpe[];
    resumen: {
        total_estaciones: number;
        estaciones_activas: number;
        estacion_critica: {
            nombre: string;
            anomalia_c: number;
            tsm_c: number;
        } | null;
        promedio_anomalia_costera: number;
    };
}

interface HistorialResponse {
    fechas: string[];
    series: Record<string, {
        metadata: {
            id: string;
            nombre: string;
            puerto: string;
            region: string;
        };
        serie: Array<{
            fecha: string;
            tsm_c: number | null;
            anomalia_c: number | null;
            estado: string;
            nivel_alerta: string;
        }>;
    }>;
    total_dias: number;
}

// Paleta de colores para las estaciones en la gráfica
const ESTACION_COLORS: Record<string, string> = {
    paita: "#ef4444",      // Rojo intenso (Crítica)
    chicama: "#f97316",    // Naranja
    huanchaco: "#eab308",  // Amarillo oro
    chimbote: "#84cc16",   // Lima
    callao: "#06b6d4",     // Cian
    pisco: "#3b82f6",      // Azul
    ilo: "#10b981",        // Esmeralda
    huacho: "#a855f7",     // Púrpura
    tumbes: "#ec4899",     // Rosa
    san_jose: "#14b8a6",   // Teal
    chala: "#6366f1",      // Índigo
    matarani: "#64748b"    // Pizarra
};

export default function ConsolaImarpePage() {
    const [boletinActual, setBoletinActual] = useState<BoletinImarpe | null>(null);
    const [historial, setHistorial] = useState<HistorialResponse | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [syncing, setSyncing] = useState<boolean>(false);
    const [cacheBuster, setCacheBuster] = useState<number>(Date.now());
    const [selectedStationId, setSelectedStationId] = useState<string | null>("paita");
    const [selectedImage, setSelectedImage] = useState<CartaSatelital | null>(null);
    const [estacionesVisibles, setEstacionesVisibles] = useState<string[]>([
        "paita", "chicama", "chimbote", "callao", "pisco", "ilo"
    ]);
    const [ordenEstaciones, setOrdenEstaciones] = useState<"calor_anomalia" | "calor_tsm" | "geografico">("calor_anomalia");
    const [syncMessage, setSyncMessage] = useState<string | null>(null);

    const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

    const formatearBoletinNro = (nro?: string) => {
        if (!nro) return "N° 260";
        const clean = nro.trim();
        if (/^n[°º]/i.test(clean)) {
            return clean.replace(/^(n[°º\s]*)+/i, "N° ");
        }
        return `N° ${clean}`;
    };

    const getImageUrl = (urlOrPath?: string) => {
        if (!urlOrPath) return "";
        const sep = urlOrPath.includes("?") ? "&" : "?";
        return `${urlOrPath}${sep}cb=${cacheBuster}`;
    };

    const MESES_CORTO: Record<string, string> = {
        "01": "Ene",
        "02": "Feb",
        "03": "Mar",
        "04": "Abr",
        "05": "May",
        "06": "Jun",
        "07": "Jul",
        "08": "Ago",
        "09": "Set",
        "10": "Oct",
        "11": "Nov",
        "12": "Dic"
    };

    const formatearFechaEjeX = (fecha: string): string => {
        if (!fecha) return "";
        const partes = fecha.split("-");
        if (partes.length === 3) {
            const dia = partes[2];
            const mesStr = MESES_CORTO[partes[1]] || partes[1];
            return `${dia}/${mesStr}`;
        }
        return fecha;
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            const now = Date.now();
            const [resLatest, resHistory] = await Promise.all([
                fetch(`${API_BASE}/api/imarpe/latest?t=${now}`),
                fetch(`${API_BASE}/api/imarpe/history?t=${now}`)
            ]);

            if (resLatest.ok) {
                const dataLatest = await resLatest.json();
                setBoletinActual(dataLatest);
            }
            if (resHistory.ok) {
                const dataHistory = await resHistory.json();
                setHistorial(dataHistory);
            }
            setCacheBuster(Date.now());
        } catch (err) {
            console.error("Error cargando telemetría de IMARPE:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleSync = async () => {
        setSyncing(true);
        setSyncMessage("Escaneando boletines diarios en data/Reporte de Imarpe diario/...");
        try {
            const res = await fetch(`${API_BASE}/api/imarpe/sync`, { method: "POST" });
            if (res.ok) {
                const result = await res.json();
                setSyncMessage(`¡Sincronización completada! ${result.boletines_procesados} boletines indexados.`);
                setCacheBuster(Date.now());
                await fetchData();
            } else {
                setSyncMessage("Error en la respuesta del servidor al sincronizar.");
            }
        } catch (err) {
            setSyncMessage("No se pudo contactar con el backend para sincronizar.");
        } finally {
            setSyncing(false);
            setTimeout(() => setSyncMessage(null), 5000);
        }
    };

    const toggleEstacionVisible = (id: string) => {
        setEstacionesVisibles((prev) =>
            prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
        );
    };

    // Transformar datos de historial para Recharts (Eje X = Fecha, Claves = estacion_id)
    const chartData = useMemo(() => {
        if (!historial || !historial.fechas) return [];

        return historial.fechas.map((fecha) => {
            const labelDia = formatearFechaEjeX(fecha);

            const punto: Record<string, any> = {
                fecha,
                diaLabel: labelDia
            };

            Object.entries(historial.series).forEach(([estId, data]) => {
                const item = data.serie.find((s) => s.fecha === fecha);
                punto[estId] = item && item.anomalia_c !== null ? item.anomalia_c : null;
                punto[`${estId}_tsm`] = item && item.tsm_c !== null ? item.tsm_c : null;
            });

            return punto;
        });
    }, [historial]);

    // Resumen de anomalía máxima y cartas satelitales oficiales
    const maxAnomaliaEstacion = boletinActual?.resumen?.estacion_critica;
    const carta1 = boletinActual?.cartas_satelitales?.find((c) => c.id === "figura_1");
    const carta3 = boletinActual?.cartas_satelitales?.find((c) => c.id === "figura_3");
    const carta1Url = carta1?.url || "/imarpe_images/figura_1_pacifico_tropical.png";
    const carta3Url = carta3?.url || "/imarpe_images/figura_3_anomalias_costa_peru.png";

    // Ordenamiento dinámico de estaciones (por anomalía más caliente, mayor TSM, o geográfico)
    const estacionesOrdenadas = useMemo(() => {
        if (!boletinActual?.estaciones) return [];
        const list = [...boletinActual.estaciones];

        if (ordenEstaciones === "calor_anomalia") {
            // De más caliente a menos caliente según anomalía térmica (ΔT)
            return list.sort((a, b) => {
                const anomA = a.anomalia_c !== null ? a.anomalia_c : -999;
                const anomB = b.anomalia_c !== null ? b.anomalia_c : -999;
                return anomB - anomA;
            });
        } else if (ordenEstaciones === "calor_tsm") {
            // De más caliente a menos caliente según TSM observada (°C)
            return list.sort((a, b) => {
                const tsmA = a.tsm_c !== null ? a.tsm_c : -999;
                const tsmB = b.tsm_c !== null ? b.tsm_c : -999;
                return tsmB - tsmA;
            });
        } else {
            // Orden Geográfico oficial (Norte a Sur, de menos negativo a más negativo de latitud)
            return list.sort((a, b) => b.lat - a.lat);
        }
    }, [boletinActual, ordenEstaciones]);

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
            <HeaderNav />

            {/* Cabecera Principal de la Consola IMARPE */}
            <div className="bg-gradient-to-r from-slate-900 via-teal-950/40 to-slate-900 border-b border-teal-800/30 px-6 py-5">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex items-center gap-3.5">
                        <div className="p-3 bg-teal-500/10 border border-teal-500/30 rounded-2xl text-teal-400 shadow-lg shadow-teal-500/10">
                            <Waves className="w-8 h-8 animate-pulse" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30 tracking-wider uppercase">
                                    PPR 068 El Niño • DGIOCC / CDO
                                </span>
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30 tracking-wider uppercase">
                                    Red In-Situ Microescala
                                </span>
                            </div>
                            <h1 className="text-2xl font-black tracking-tight text-white mt-1 flex items-center gap-2">
                                Consola Oceanográfica IMARPE
                                <span className="text-sm font-normal text-slate-400">
                                    (Boletín Diario Oceanográfico - BDO)
                                </span>
                            </h1>
                            <p className="text-xs text-slate-400">
                                Monitoreo in-situ de Temperatura Superficial del Mar (TSM) y Anomalías Térmicas en las 12 Estaciones Costeras del Litoral Peruano.
                            </p>
                        </div>
                    </div>

                    {/* Metadatos del Boletín y Botón de Sincronización */}
                    <div className="flex flex-wrap items-center gap-2.5">
                        {boletinActual && (
                            <div className="bg-slate-900/90 border border-slate-800 rounded-xl px-3.5 py-2 text-right">
                                <div className="text-[11px] text-slate-400 flex items-center justify-end gap-1.5 font-medium">
                                    <Calendar className="w-3 h-3 text-teal-400" />
                                    Boletín {boletinActual.boletin_anio} {formatearBoletinNro(boletinActual.boletin_nro)}
                                </div>
                                <div className="text-sm font-bold text-white">
                                    {boletinActual.fecha}
                                </div>
                            </div>
                        )}

                        <button
                            onClick={handleSync}
                            disabled={syncing}
                            className="flex items-center gap-2 bg-teal-600 hover:bg-teal-500 active:bg-teal-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-lg shadow-teal-600/20 border border-teal-400/30 transition disabled:opacity-50"
                            title="Escanear y procesar nuevos boletines PDF agregados a la carpeta"
                        >
                            <RefreshCw className={`w-3.5 h-3.5 ${syncing ? "animate-spin" : ""}`} />
                            <span>{syncing ? "Sincronizando..." : "Sincronizar PDFs"}</span>
                        </button>
                    </div>
                </div>

                {syncMessage && (
                    <div className="max-w-7xl mx-auto mt-3">
                        <div className="bg-teal-950/80 border border-teal-600/50 text-teal-200 text-xs px-3 py-2 rounded-lg flex items-center gap-2 animate-fadeIn">
                            <Radio className="w-3.5 h-3.5 text-teal-400 animate-ping" />
                            <span>{syncMessage}</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Contenido Principal */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6 flex-1 w-full">

                {/* 1. Tarjeta de Diagnóstico Oficial del IMARPE (Pág. 1) */}
                {boletinActual?.diagnostico_oficial && (
                    <div className="relative overflow-hidden bg-gradient-to-r from-red-950/40 via-slate-900 to-slate-900 border-l-4 border-l-red-500 border border-slate-800 rounded-2xl p-5 shadow-xl">
                        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                            <div className="space-y-1.5 flex-1">
                                <div className="flex items-center gap-2 text-xs font-bold text-red-400 uppercase tracking-wider">
                                    <AlertOctagon className="w-4 h-4 text-red-500 animate-bounce" />
                                    <span>Diagnóstico Oficial del Día • IMARPE SIOFEN</span>
                                    <span className="text-[10px] text-slate-400 font-normal">
                                        (Observación: {boletinActual.fecha_observacion || boletinActual.fecha})
                                    </span>
                                </div>
                                <p className="text-sm md:text-base text-slate-200 leading-relaxed font-medium">
                                    "{boletinActual.diagnostico_oficial}"
                                </p>
                            </div>

                            {maxAnomaliaEstacion && (
                                <div className="bg-red-950/80 border border-red-500/40 rounded-xl px-4 py-3 text-center shrink-0 min-w-[170px]">
                                    <div className="text-[10px] uppercase font-bold text-red-300 tracking-wider">
                                        Anomalía Récord
                                    </div>
                                    <div className="text-2xl font-black text-red-400">
                                        +{maxAnomaliaEstacion.anomalia_c.toFixed(1)}°C
                                    </div>
                                    <div className="text-xs font-semibold text-slate-300">
                                        Estación {maxAnomaliaEstacion.nombre}
                                    </div>
                                    <div className="text-[10px] text-slate-400">
                                        TSM {maxAnomaliaEstacion.tsm_c.toFixed(1)}°C
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* 2. Tarjetas de Resumen Táctico (KPIs) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow">
                        <div className="flex items-center justify-between">
                            <span className="text-xs text-slate-400 font-medium">Estación Crítica</span>
                            <ThermometerSun className="w-4 h-4 text-red-400" />
                        </div>
                        <div className="text-xl font-bold text-white mt-2">
                            {maxAnomaliaEstacion?.nombre || "Paita"}
                        </div>
                        <div className="text-xs text-red-400 font-semibold mt-0.5">
                            +{maxAnomaliaEstacion?.anomalia_c || 8.0}°C (TSM {maxAnomaliaEstacion?.tsm_c || 24.8}°C)
                        </div>
                        <div className="text-[10px] text-slate-500 mt-2">
                            Zona de máximo impacto térmico Niño 1+2
                        </div>
                    </div>

                    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow">
                        <div className="flex items-center justify-between">
                            <span className="text-xs text-slate-400 font-medium">Promedio Anomalía Costera</span>
                            <TrendingUp className="w-4 h-4 text-amber-400" />
                        </div>
                        <div className="text-xl font-bold text-amber-400 mt-2">
                            +{boletinActual?.resumen?.promedio_anomalia_costera.toFixed(2) || "4.89"}°C
                        </div>
                        <div className="text-xs text-slate-300 mt-0.5">
                            Sobre climatología 1991-2020
                        </div>
                        <div className="text-[10px] text-slate-500 mt-2">
                            Calculado sobre estaciones con datos activos
                        </div>
                    </div>

                    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow">
                        <div className="flex items-center justify-between">
                            <span className="text-xs text-slate-400 font-medium">Red de Estaciones</span>
                            <Anchor className="w-4 h-4 text-teal-400" />
                        </div>
                        <div className="text-xl font-bold text-white mt-2">
                            {boletinActual?.resumen?.estaciones_activas || 8} / {boletinActual?.resumen?.total_estaciones || 12}
                        </div>
                        <div className="text-xs text-teal-400 mt-0.5">
                            Estaciones reportando en tiempo y forma
                        </div>
                        <div className="text-[10px] text-slate-500 mt-2">
                            4 estaciones en mantenimiento / sin datos
                        </div>
                    </div>

                    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow">
                        <div className="flex items-center justify-between">
                            <span className="text-xs text-slate-400 font-medium">Régimen Térmico</span>
                            <AlertTriangle className="w-4 h-4 text-rose-400" />
                        </div>
                        <div className="text-xl font-bold text-rose-400 mt-2">
                            EL NIÑO COSTERO
                        </div>
                        <div className="text-xs text-slate-300 mt-0.5">
                            Ondas Kelvin en propagación
                        </div>
                        <div className="text-[10px] text-slate-500 mt-2">
                            Acoplamiento con atmósfera costera
                        </div>
                    </div>
                </div>

                {/* 3. Sección III: CONDICIONES DE MICROESCALA (Tabla 1 Oficial) */}
                <div className="space-y-3">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-slate-900/60 p-3.5 rounded-2xl border border-slate-850">
                        <div>
                            <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                <Compass className="w-5 h-5 text-teal-400" />
                                III. Condiciones de Microescala: Estaciones Costeras IMARPE
                            </h2>
                            <p className="text-xs text-slate-400 mt-0.5">
                                Promedio diario de la Temperatura Superficial del Mar (TSM) y sus anomalías (°C) registradas in-situ (Tabla 1 BDO).
                            </p>
                        </div>

                        {/* Selector de Orden: De Más Caliente a Menos Caliente vs Geográfico */}
                        <div className="flex flex-wrap items-center gap-1.5 bg-slate-950 p-1.5 rounded-xl border border-slate-800 text-xs">
                            <span className="text-[10px] text-slate-400 px-1.5 font-semibold flex items-center gap-1">
                                <ArrowUpDown className="w-3 h-3 text-teal-400" /> Ordenar:
                            </span>
                            <button
                                onClick={() => setOrdenEstaciones("calor_anomalia")}
                                className={`px-2.5 py-1 rounded-lg font-bold text-xs transition flex items-center gap-1.5 ${
                                    ordenEstaciones === "calor_anomalia"
                                        ? "bg-red-950 text-red-300 border border-red-800 shadow-sm"
                                        : "text-slate-400 hover:text-slate-200"
                                }`}
                                title="Ordenar de mayor anomalía térmica a menor anomalía térmica"
                            >
                                <Flame className="w-3.5 h-3.5 text-red-400" /> Más Caliente (ΔT)
                            </button>
                            <button
                                onClick={() => setOrdenEstaciones("calor_tsm")}
                                className={`px-2.5 py-1 rounded-lg font-bold text-xs transition flex items-center gap-1.5 ${
                                    ordenEstaciones === "calor_tsm"
                                        ? "bg-amber-950 text-amber-300 border border-amber-800 shadow-sm"
                                        : "text-slate-400 hover:text-slate-200"
                                }`}
                                title="Ordenar de mayor temperatura TSM absoluta a menor temperatura"
                            >
                                <ThermometerSun className="w-3.5 h-3.5 text-amber-400" /> Mayor TSM (°C)
                            </button>
                            <button
                                onClick={() => setOrdenEstaciones("geografico")}
                                className={`px-2.5 py-1 rounded-lg font-bold text-xs transition flex items-center gap-1.5 ${
                                    ordenEstaciones === "geografico"
                                        ? "bg-teal-950 text-teal-300 border border-teal-800 shadow-sm"
                                        : "text-slate-400 hover:text-slate-200"
                                }`}
                                title="Ordenar geográficamente de Norte a Sur"
                            >
                                <Compass className="w-3.5 h-3.5 text-teal-400" /> Norte a Sur
                            </button>
                        </div>
                    </div>

                    {/* Barra de leyenda semafórica */}
                    <div className="flex items-center justify-end gap-3 text-xs text-slate-400 px-1">
                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> Normal</span>
                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-500"></span> Vigilancia</span>
                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-orange-500"></span> Alta</span>
                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500"></span> Extrema (&gt;+4.5°C)</span>
                    </div>

                    {/* Grid de las 12 Estaciones Ordenadas */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5">
                        {estacionesOrdenadas.map((est, index) => {
                            const isSelected = selectedStationId === est.id;
                            const sinDatos = est.estado_reporte === "SIN_DATOS" || est.tsm_c === null;

                            // Color de fondo y borde según nivel de alerta
                            let borderClass = "border-slate-800 hover:border-slate-700";
                            let badgeClass = "bg-slate-800 text-slate-400 border-slate-700";
                            let textAnomaliaClass = "text-slate-500";

                            if (!sinDatos) {
                                if (est.alerta.severidad === 4) {
                                    borderClass = "border-red-500/50 bg-red-950/20 hover:border-red-400";
                                    badgeClass = "bg-red-500/20 text-red-300 border-red-500/40";
                                    textAnomaliaClass = "text-red-400";
                                } else if (est.alerta.severidad === 3) {
                                    borderClass = "border-orange-500/50 bg-orange-950/20 hover:border-orange-400";
                                    badgeClass = "bg-orange-500/20 text-orange-300 border-orange-500/40";
                                    textAnomaliaClass = "text-orange-400";
                                } else if (est.alerta.severidad === 2) {
                                    borderClass = "border-yellow-500/50 bg-yellow-950/20 hover:border-yellow-400";
                                    badgeClass = "bg-yellow-500/20 text-yellow-300 border-yellow-500/40";
                                    textAnomaliaClass = "text-yellow-400";
                                } else {
                                    borderClass = "border-emerald-500/50 bg-emerald-950/20 hover:border-emerald-400";
                                    badgeClass = "bg-emerald-500/20 text-emerald-300 border-emerald-500/40";
                                    textAnomaliaClass = "text-emerald-400";
                                }
                            }

                            return (
                                <div
                                    key={est.id}
                                    onClick={() => setSelectedStationId(est.id)}
                                    className={`relative cursor-pointer transition-all rounded-2xl p-4 border bg-slate-900/90 shadow-sm ${borderClass} ${isSelected ? "ring-2 ring-teal-400 ring-offset-2 ring-offset-slate-950 scale-[1.02]" : ""
                                        }`}
                                >
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <h3 className="font-bold text-white text-sm flex items-center gap-1.5">
                                                {ordenEstaciones !== "geografico" && !sinDatos && (
                                                    <span className={`text-[10px] font-mono font-black px-1.5 py-0.5 rounded border ${
                                                        index === 0
                                                            ? "bg-red-950 text-red-400 border-red-700 animate-pulse"
                                                            : "bg-slate-800 text-slate-300 border-slate-700"
                                                    }`}>
                                                        #{index + 1}
                                                    </span>
                                                )}
                                                <MapPin className="w-3.5 h-3.5 text-teal-400" />
                                                {est.nombre}
                                            </h3>
                                            <p className="text-[11px] text-slate-400">
                                                {est.puerto} • {est.region}
                                            </p>
                                        </div>
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${badgeClass}`}>
                                            {est.alerta.etiqueta}
                                        </span>
                                    </div>

                                    <div className="mt-3 grid grid-cols-2 gap-2 pt-2.5 border-t border-slate-800/80">
                                        <div>
                                            <span className="text-[10px] text-slate-400 block">TSM Observada</span>
                                            <span className="text-lg font-extrabold text-white">
                                                {sinDatos ? "---" : `${est.tsm_c?.toFixed(1)}°C`}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-[10px] text-slate-400 block">Anomalía (ΔT)</span>
                                            <span className={`text-lg font-black ${textAnomaliaClass}`}>
                                                {sinDatos ? "(1) s/d" : `+${est.anomalia_c?.toFixed(1)}°C`}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="mt-2.5 flex items-center justify-between text-[10px] text-slate-500">
                                        <span>Coord: {Math.abs(est.lat).toFixed(2)}°S, {Math.abs(est.lng).toFixed(2)}°W</span>
                                        {est.anomalia_c && est.anomalia_c >= 6.0 && (
                                            <span className="text-red-400 font-semibold animate-pulse">¡Extrema!</span>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* 4. Cartografía Satelital Oficial (Copernicus / OSTIA / IMARPE PPR 068) */}
                <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="p-1.5 rounded-lg bg-teal-500/10 text-teal-400 border border-teal-500/20">
                                    <Layers className="w-4 h-4" />
                                </span>
                                <h2 className="text-base font-bold text-white">
                                    Cartografía Satelital Oficial e Imágenes Térmicas (PPR 068 El Niño)
                                </h2>
                                <span className="bg-teal-950 text-teal-300 text-[10px] font-bold px-2 py-0.5 rounded border border-teal-800">
                                    IMÁGENES EXTRAÍDAS DEL BDO
                                </span>
                            </div>
                            <p className="text-xs text-slate-400 mt-1">
                                Cartas de temperatura superficial del mar (TSM) y anomalías térmicas procesadas por la Dirección General de Investigaciones Oceanográficas (DGIOCC / IMARPE) y Copernicus Marine Service.
                            </p>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-400">
                            <span className="flex items-center gap-1 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
                                <Calendar className="w-3.5 h-3.5 text-teal-400" />
                                {boletinActual?.fecha_observacion || boletinActual?.fecha || "16 de septiembre de 2026"}
                            </span>
                        </div>
                    </div>

                    {/* Escala cromática y Marcadores de Temperatura (Actual vs Tope Estimado de El Niño) */}
                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-1 text-[11px] text-slate-400">
                            <span className="font-bold text-slate-200 flex items-center gap-1.5">
                                <Flame className="w-3.5 h-3.5 text-amber-400" />
                                Monitor Térmico Satelital de El Niño: Temperatura / Anomalía Actual vs. Tope Estimado
                            </span>
                            <span className="text-[10px] text-slate-400">L4 OSTIA Copernicus Marine (0.05° ~5 km) • PPR 068</span>
                        </div>

                        {/* Barra con gradiente y marcadores relativos */}
                        <div className="relative pt-6 pb-2">
                            {/* Marcador Flotante Superior: TSM / Anomalía Actual */}
                            <div 
                                className="absolute top-0 -translate-x-1/2 flex flex-col items-center z-10 pointer-events-none"
                                style={{ left: "71%" }}
                            >
                                <span className="bg-amber-500 text-slate-950 text-[10px] font-extrabold px-1.5 py-0.5 rounded shadow-lg shadow-amber-500/30 flex items-center gap-1 border border-amber-300">
                                    <span className="w-1.5 h-1.5 rounded-full bg-slate-950 animate-ping" />
                                    ACTUAL ({maxAnomaliaEstacion?.nombre || "Paita"}): {maxAnomaliaEstacion?.tsm_c ? `${maxAnomaliaEstacion.tsm_c.toFixed(1)}°C (+${maxAnomaliaEstacion.anomalia_c?.toFixed(1)}°C)` : "24.8°C (+8.0°C)"}
                                </span>
                                <div className="w-0.5 h-2.5 bg-amber-400" />
                            </div>

                            {/* Marcador Flotante Superior: TSM / Anomalía Tope Estimado */}
                            <div 
                                className="absolute top-0 -translate-x-1/2 flex flex-col items-center z-10 pointer-events-none"
                                style={{ left: "95%" }}
                            >
                                <span className="bg-rose-600 text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded shadow-lg shadow-rose-600/40 flex items-center gap-1 border border-rose-400">
                                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                                    TOPE ESTIMADO: 28.5°C (+10.5°C)
                                </span>
                                <div className="w-0.5 h-2.5 bg-rose-500" />
                            </div>

                            {/* Barra de gradiente térmico */}
                            <div className="h-3 w-full rounded-full bg-gradient-to-r from-blue-700 via-cyan-400 via-emerald-400 via-amber-300 via-orange-500 to-rose-600 border border-slate-700/60 shadow-inner relative">
                                {/* Pin indicador actual */}
                                <div 
                                    className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3.5 h-3.5 rounded-full bg-amber-400 border-2 border-slate-950 shadow"
                                    style={{ left: "71%" }}
                                    title="Punto actual del evento El Niño"
                                />
                                {/* Pin indicador tope */}
                                <div 
                                    className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3.5 h-3.5 rounded-full bg-rose-500 border-2 border-white shadow animate-pulse"
                                    style={{ left: "95%" }}
                                    title="Tope crítico proyectado El Niño Extraordinario"
                                />
                            </div>

                            {/* Escala numérica base */}
                            <div className="flex justify-between text-[9px] font-mono text-slate-400 mt-1.5">
                                <span>-3.0°C (Frío)</span>
                                <span>-1.0°C</span>
                                <span>0.0°C (Neutro)</span>
                                <span className="text-amber-300 font-bold">+2.0°C (Niño Mod.)</span>
                                <span className="text-orange-400 font-bold">+4.0°C (Niño Fuerte)</span>
                                <span className="text-rose-400 font-bold">+{maxAnomaliaEstacion?.anomalia_c?.toFixed(1) || "8.0"}°C ({maxAnomaliaEstacion?.nombre || "Paita"})</span>
                                <span className="text-rose-300 font-bold">+10.5°C (Tope Escenario)</span>
                            </div>
                        </div>

                        {/* Fichas descriptivas de los 2 marcadores con fuentes detalladas */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-1">
                            {/* Ficha Marcador Actual */}
                            <div className="bg-amber-950/20 border border-amber-500/30 rounded-lg p-2.5 space-y-1">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300">
                                        <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                                        TEMPERATURA AL MOMENTO (EL NIÑO)
                                    </div>
                                    <span className="bg-amber-500/20 text-amber-300 text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border border-amber-500/30">
                                        {maxAnomaliaEstacion?.tsm_c ? `${maxAnomaliaEstacion.tsm_c.toFixed(1)} °C | Anom: +${maxAnomaliaEstacion.anomalia_c?.toFixed(1)} °C` : "25.1 °C | Anom: +8.2 °C"}
                                    </span>
                                </div>
                                <p className="text-[11px] text-slate-300">
                                    Foco térmico extremo registrado en la estación costera fija de <span className="font-semibold text-white">{maxAnomaliaEstacion?.nombre || "Paita (Piura)"}</span> y aguas adyacentes de la Región Niño 1+2.
                                </p>
                                <div className="text-[10px] text-amber-200/70 border-t border-amber-500/20 pt-1 flex items-center justify-between">
                                    <span><strong>Fuente:</strong> BDO {formatearBoletinNro(boletinActual?.boletin_nro)} ({boletinActual?.boletin_anio || "Año 13"}) IMARPE - PPR 068</span>
                                    <span>Obs: {boletinActual?.fecha_observacion || "16 de septiembre de 2026"}</span>
                                </div>
                            </div>

                            {/* Ficha Marcador Tope Estimado */}
                            <div className="bg-rose-950/20 border border-rose-500/30 rounded-lg p-2.5 space-y-1">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-1.5 text-xs font-bold text-rose-300">
                                        <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                                        TEMPERATURA TOPE ESTIMADA (ESCENARIO MÁXIMO)
                                    </div>
                                    <span className="bg-rose-500/20 text-rose-300 text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border border-rose-500/30">
                                        28.5 °C | Anom: +10.5 °C
                                    </span>
                                </div>
                                <p className="text-[11px] text-slate-300">
                                    Tope máximo modelado para la costa norte ante la llegada de la cresta de Ondas Kelvin y acoplamiento atmosférico convectivo estival (patrón análogo FEN 1982-83 / 1997-98).
                                </p>
                                <div className="text-[10px] text-rose-200/70 border-t border-rose-500/20 pt-1 flex items-center justify-between">
                                    <span><strong>Fuentes:</strong> ENFEN Comunicado N° 12-2026 / ECMWF IFS Marine / DHN</span>
                                    <span>Proyección Verano 2026-2027</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Grid con las Cartas Extraídas */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                        {/* Carta 1: Pacífico Tropical - I. CONDICIONES DE MACROESCALA */}
                        <div
                            onClick={() => setSelectedImage({
                                id: "figura_1",
                                titulo: "I. CONDICIONES DE MACROESCALA — Figura 1: TSM y Anomalías en el Pacífico Tropical (Niño 1+2 / 3.4)",
                                fuente: `BDO ${formatearBoletinNro(boletinActual?.boletin_nro)} (${boletinActual?.fecha || "2026-09-17"}) • OSTIA (Copernicus / UK Met Office) / IMARPE CDO-DGIOCC (PPR 068)`,
                                fecha_referencia: boletinActual?.fecha_observacion || "16 de septiembre de 2026",
                                descripcion: `Figura 1. Anomalías de la temperatura superficial del mar (°C) en el océano Pacífico tropical, ${boletinActual?.fecha_observacion || "16 de septiembre de 2026"}. Las regiones Niño 3.4 (5N-5S, 170W-120W) y Niño 1+2 (0-10S, 90W-80W) están delimitadas con una línea de color rojo.`,
                                url: getImageUrl(carta1Url),
                                dimensiones: { width: 966, height: 558 }
                            })}
                            className="group relative bg-slate-950 border border-slate-800 hover:border-teal-500/50 rounded-xl overflow-hidden cursor-pointer transition-all duration-300 shadow hover:shadow-teal-950/20"
                        >
                            <div className="p-3 border-b border-slate-800/80 flex items-center justify-between">
                                <div>
                                    <div className="flex items-center gap-1.5 mb-1">
                                        <span className="text-[9px] bg-teal-500/20 text-teal-300 font-bold px-1.5 py-0.5 rounded border border-teal-500/30">
                                            I. CONDICIONES DE MACROESCALA
                                        </span>
                                        <span className="text-[9px] bg-slate-850 text-slate-300 px-1.5 py-0.5 rounded font-mono border border-slate-750">
                                            BDO {formatearBoletinNro(boletinActual?.boletin_nro)} ({boletinActual?.fecha || "2026-09-17"})
                                        </span>
                                    </div>
                                    <h3 className="text-xs font-bold text-slate-200 group-hover:text-teal-300 transition">
                                        Figura 1: TSM y Anomalías en el Pacífico Tropical (Niño 1+2 / 3.4)
                                    </h3>
                                    <span className="text-[10px] text-slate-400">
                                        Obs: {boletinActual?.fecha_observacion || "16 de septiembre de 2026"} • OSTIA UKMO Copernicus (966 x 558 px)
                                    </span>
                                </div>
                                <span className="p-1 bg-slate-800 group-hover:bg-teal-600 text-slate-300 group-hover:text-white rounded transition">
                                    <ZoomIn className="w-3.5 h-3.5" />
                                </span>
                            </div>
                            <div className="relative aspect-[16/9] w-full bg-slate-950 overflow-hidden flex items-center justify-center">
                                <img
                                    src={getImageUrl(carta1Url)}
                                    alt="Pacífico Tropical TSM Anomalías IMARPE - I. CONDICIONES DE MACROESCALA"
                                    className="max-h-full object-contain group-hover:scale-105 transition duration-500"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-60 pointer-events-none" />
                                <div className="absolute bottom-2 left-2 right-2 flex justify-between items-end">
                                    <span className="text-[9px] bg-slate-950/90 text-teal-300 border border-teal-800/50 px-1.5 py-0.5 rounded font-mono">
                                        Extensión: 180° - 70°W / 30°N - 30°S
                                    </span>
                                    <span className="text-[9px] text-slate-400 bg-slate-900/80 px-1 rounded">
                                        Click para pantalla completa (Visor C2)
                                    </span>
                                </div>
                            </div>
                            <div className="p-2.5 text-[11px] text-slate-400 bg-slate-900/40 border-t border-slate-850">
                                Muestra la colosal lengua de agua cálida anómala (+7 °C a +8 °C) acoplada a la costa septentrional y central del Perú (Niño 1+2 y Niño 3.4).
                            </div>
                        </div>

                        {/* Carta 2: Anomalías Mar Peruano */}
                        <div
                            onClick={() => setSelectedImage({
                                id: "figura_3",
                                titulo: "Figura 3: Anomalías Térmicas de la TSM en el Mar Peruano (Alta Resolución)",
                                fuente: `BDO ${formatearBoletinNro(boletinActual?.boletin_nro)} (${boletinActual?.fecha || "2026-09-17"}) • IMARPE AFIOF / LHFM / DGIOCC - PPR 068 El Niño`,
                                fecha_referencia: boletinActual?.fecha_observacion || "16 de septiembre de 2026",
                                descripcion: `Carta multitemporal de anomalías térmicas (4 fechas hasta el ${boletinActual?.fecha_observacion || "16 de septiembre de 2026"}) a lo largo de las 200 millas del dominio marítimo peruano.`,
                                url: getImageUrl(carta3Url),
                                dimensiones: { width: 893, height: 864 }
                            })}
                            className="group relative bg-slate-950 border border-slate-800 hover:border-rose-500/50 rounded-xl overflow-hidden cursor-pointer transition-all duration-300 shadow hover:shadow-rose-950/20"
                        >
                            <div className="p-3 border-b border-slate-800/80 flex items-center justify-between">
                                <div>
                                    <div className="flex items-center gap-1.5 mb-1">
                                        <span className="text-[9px] bg-rose-500/20 text-rose-300 font-bold px-1.5 py-0.5 rounded border border-rose-500/30">
                                            DOMINIO COSTERO 200 MILLAS
                                        </span>
                                        <span className="text-[9px] bg-slate-850 text-slate-300 px-1.5 py-0.5 rounded font-mono border border-slate-750">
                                            BDO {formatearBoletinNro(boletinActual?.boletin_nro)}
                                        </span>
                                    </div>
                                    <h3 className="text-xs font-bold text-slate-200 group-hover:text-rose-300 transition">
                                        Figura 3: Anomalías Térmicas en el Mar Peruano (Alta Resolución)
                                    </h3>
                                    <span className="text-[10px] text-slate-400">
                                        Obs: {boletinActual?.fecha_observacion || "16 de septiembre de 2026"} • Multi-temporal 4 fechas (893 x 864 px)
                                    </span>
                                </div>
                                <span className="p-1 bg-slate-800 group-hover:bg-rose-600 text-slate-300 group-hover:text-white rounded transition">
                                    <ZoomIn className="w-3.5 h-3.5" />
                                </span>
                            </div>
                            <div className="relative aspect-[16/9] w-full bg-slate-950 overflow-hidden flex items-center justify-center">
                                <img
                                    src={getImageUrl(carta3Url)}
                                    alt="Anomalías Térmicas Mar Peruano IMARPE"
                                    className="max-h-full object-contain group-hover:scale-105 transition duration-500"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-60 pointer-events-none" />
                                <div className="absolute bottom-2 left-2 right-2 flex justify-between items-end">
                                    <span className="text-[9px] bg-red-950/90 text-red-300 border border-red-800/50 px-1.5 py-0.5 rounded font-mono">
                                        Foco {maxAnomaliaEstacion?.nombre || "Paita"}: +{maxAnomaliaEstacion?.anomalia_c?.toFixed(1) || "8.2"}°C
                                    </span>
                                    <span className="text-[9px] text-slate-400 bg-slate-900/80 px-1 rounded">
                                        Click para pantalla completa (Visor C2)
                                    </span>
                                </div>
                            </div>
                            <div className="p-2.5 text-[11px] text-slate-400 bg-slate-900/40 border-t border-slate-850">
                                Evidencia el colapso del afloramiento costero de la Corriente de Humboldt por invasión de aguas ecuatoriales y tropicales superficiales.
                            </div>
                        </div>
                    </div>
                </div>

                {/* 5. Gráfico Multitemporal Interactivo (Recharts) */}
                <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                        <div>
                            <h2 className="text-base font-bold text-white flex items-center gap-2">
                                <TrendingUp className="w-4 h-4 text-teal-400" />
                                Evolución Multitemporal de Anomalías Térmicas (Litoral Peruano)
                            </h2>
                            <p className="text-xs text-slate-400 mt-0.5">
                                Curva diaria de anomalías (°C) extraídas de los boletines oficiales {historial?.fechas?.length ? `(${historial.fechas.length} boletines: ${formatearFechaEjeX(historial.fechas[0])} al ${formatearFechaEjeX(historial.fechas[historial.fechas.length - 1])})` : "de agosto y septiembre de 2026"}.
                            </p>
                        </div>

                        {/* Selector de estaciones a graficar */}
                        <div className="flex flex-wrap items-center gap-1.5 text-xs">
                            <span className="text-[11px] text-slate-400 mr-1">Mostrar:</span>
                            {boletinActual?.estaciones.map((est) => {
                                const active = estacionesVisibles.includes(est.id);
                                const color = ESTACION_COLORS[est.id] || "#94a3b8";
                                return (
                                    <button
                                        key={est.id}
                                        onClick={() => toggleEstacionVisible(est.id)}
                                        className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition border ${active
                                                ? "bg-slate-800 text-white border-slate-600"
                                                : "bg-slate-950/60 text-slate-500 border-slate-900 line-through"
                                            }`}
                                        style={{ borderLeftColor: active ? color : undefined, borderLeftWidth: active ? 3 : 1 }}
                                    >
                                        {est.nombre}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Gráfico Recharts */}
                    <div className="h-80 w-full pt-2">
                        {chartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                                    <XAxis
                                        dataKey="diaLabel"
                                        stroke="#64748b"
                                        tick={{ fill: "#94a3b8", fontSize: 11 }}
                                    />
                                    <YAxis
                                        stroke="#64748b"
                                        tick={{ fill: "#94a3b8", fontSize: 11 }}
                                        domain={[0, 9]}
                                        unit="°C"
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: "#0f172a",
                                            borderColor: "#334155",
                                            borderRadius: "0.75rem",
                                            boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.5)",
                                            fontSize: "12px"
                                        }}
                                        labelStyle={{ color: "#f8fafc", fontWeight: "bold", marginBottom: "4px" }}
                                        labelFormatter={(label, items) => {
                                            const rawFecha = items?.[0]?.payload?.fecha;
                                            return rawFecha ? `Fecha: ${rawFecha} (${label})` : `Fecha: ${label}`;
                                        }}
                                    />
                                    <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "10px" }} />
                                    <ReferenceLine y={2.0} stroke="#eab308" strokeDasharray="3 3" label={{ value: "Umbral Niño (+2.0°C)", fill: "#eab308", fontSize: 10 }} />
                                    <ReferenceLine y={4.5} stroke="#ef4444" strokeDasharray="3 3" label={{ value: "Alerta Extrema (+4.5°C)", fill: "#ef4444", fontSize: 10 }} />

                                    {estacionesVisibles.map((estId) => {
                                        const estInfo = boletinActual?.estaciones.find((e) => e.id === estId);
                                        return (
                                            <Line
                                                key={estId}
                                                type="monotone"
                                                dataKey={estId}
                                                name={estInfo?.nombre || estId}
                                                stroke={ESTACION_COLORS[estId] || "#38bdf8"}
                                                strokeWidth={estId === "paita" || estId === selectedStationId ? 3 : 1.8}
                                                dot={{ r: estId === selectedStationId ? 4 : 2 }}
                                                activeDot={{ r: 6 }}
                                                connectNulls
                                            />
                                        );
                                    })}
                                </LineChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center text-slate-500 text-xs">
                                Cargando telemetría multitemporal...
                            </div>
                        )}
                    </div>
                </div>

                {/* 5. Reconocimientos y Metodología Oficial (Pág. 6) */}
                <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 text-xs text-slate-400 space-y-2">
                    <div className="flex items-center gap-2 font-bold text-slate-300">
                        <Info className="w-4 h-4 text-teal-400" />
                        <span>Marco Institucional y Ficha Técnica del BDO</span>
                    </div>
                    <p className="leading-relaxed">
                        El <strong>Boletín Diario Oceanográfico (BDO)</strong> es elaborado por el <em>Centro de Datos Oceanográficos (CDO) / LHFM / AFIOF</em> de la <strong>Dirección General de Investigaciones en Oceanografía y Cambio Climático (DGIOCC)</strong> del IMARPE.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 text-[11px]">
                        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/60">
                            <span className="font-semibold text-slate-300 block">Programa Presupuestal:</span>
                            <span>PPR 068 El Niño: "Reducción de Vulnerabilidad y Atención de Emergencias por Desastres".</span>
                        </div>
                        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/60">
                            <span className="font-semibold text-slate-300 block">Climatología de Referencia:</span>
                            <span>Promedio climatológico diario calculado para el periodo 1991 - 2020.</span>
                        </div>
                        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/60">
                            <span className="font-semibold text-slate-300 block">Fuente Satelital Calibrada:</span>
                            <span>OSTIA-UKMO-L4-GLOB-v2.0 (UK Met Office) y Copernicus Marine Service.</span>
                        </div>
                    </div>
                </div>

                {/* Modal Visor Táctico de Carta Satelital en Alta Resolución */}
                {selectedImage && (
                    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
                        <div className="bg-slate-900 border border-slate-750 rounded-2xl max-w-6xl w-full max-h-[95vh] flex flex-col overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                            {/* Cabecera del modal */}
                            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="bg-teal-500/20 text-teal-400 text-[10px] font-bold px-2 py-0.5 rounded border border-teal-500/30">
                                            VISOR C2 SATELITAL
                                        </span>
                                        <h3 className="text-sm font-bold text-white">
                                            {selectedImage.titulo}
                                        </h3>
                                    </div>
                                    <p className="text-xs text-slate-400 mt-0.5">
                                        {selectedImage.fuente} • Fecha de Observación: {selectedImage.fecha_referencia}
                                    </p>
                                </div>
                                <button
                                    onClick={() => setSelectedImage(null)}
                                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Contenedor de la imagen */}
                            <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-black">
                                <img
                                    src={selectedImage.url}
                                    alt={selectedImage.titulo}
                                    className="max-h-[72vh] w-auto max-w-full object-contain rounded-lg shadow-2xl"
                                />
                            </div>

                            {/* Pie de modal */}
                            <div className="p-3.5 bg-slate-950 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-400">
                                <span>{selectedImage.descripcion}</span>
                                <div className="flex items-center gap-2">
                                    <a
                                        href={selectedImage.url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="px-3 py-1 rounded-lg bg-teal-600 hover:bg-teal-500 text-white font-medium text-xs flex items-center gap-1 transition"
                                    >
                                        <ExternalLink className="w-3.5 h-3.5" /> Abrir Original
                                    </a>
                                    <button
                                        onClick={() => setSelectedImage(null)}
                                        className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition"
                                    >
                                        Cerrar
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
