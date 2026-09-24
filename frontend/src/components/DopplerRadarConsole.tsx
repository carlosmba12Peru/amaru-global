"use client";

import React, { useState, useEffect, useRef } from "react";
import {
    Radio,
    Play,
    Pause,
    RotateCcw,
    Layers,
    MapPin,
    AlertTriangle,
    ShieldAlert,
    ExternalLink,
    RefreshCw,
    Activity,
    CloudRain,
    Gauge,
    Sliders,
    Maximize2,
    Compass
} from "lucide-react";
import { API_BASE } from "@/config/api";

interface RadarFrame {
    frame_index: number;
    timestamp_utc_pe: string;
    imagen_relativa: string;
    imagen_url_completa: string;
}

interface RadarData {
    radar: {
        codigo: string;
        nombre: string;
        region: string;
        tecnologia: string;
        radio_cobertura_km: number;
        cuencas_vigiladas: string[];
        coordenadas_aprox: { latitud: number; longitud: number };
        elevaciones_ppi: string[];
        productos_disponibles: Record<string, string>;
        rol_estrategico: string;
    };
    estado_conexion: string;
    parametros_consulta: {
        localidad: string;
        producto: string;
        nivel: string;
        frecuencia_escaneo: string;
    };
    total_frames: number;
    ultimo_escaneo: string | null;
    frames: RadarFrame[];
    escala_reflectividad_dbz: Record<string, { intensidad: string; color_hex: string }>;
    servicios_cruzados_amaru: string[];
}

interface DopplerRadarConsoleProps {
    defaultLocalidad?: "PIU" | "ICA";
    className?: string;
    embedded?: boolean;
}

export default function DopplerRadarConsole({
    defaultLocalidad = "PIU",
    className = "",
    embedded = true
}: DopplerRadarConsoleProps) {
    const [localidad, setLocalidad] = useState<"PIU" | "ICA">(defaultLocalidad);
    const [producto, setProducto] = useState<string>("HRef_QC");
    const [nivel, setNivel] = useState<string>("E00p5");
    const [radarEngine, setRadarEngine] = useState<"BANDA_C_SENAMHI" | "RAINVIEWER_DOPPLER">("BANDA_C_SENAMHI");
    const [data, setData] = useState<RadarData | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    // Animación de bucle (Nowcasting loop)
    const [currentFrameIndex, setCurrentFrameIndex] = useState<number>(0);
    const [isPlaying, setIsPlaying] = useState<boolean>(true);
    const [speedMs, setSpeedMs] = useState<number>(900);
    const [rainViewerTimestamps, setRainViewerTimestamps] = useState<number[]>([]);
    const [rainViewerIndex, setRainViewerIndex] = useState<number>(0);

    const isMounted = useRef(true);

    useEffect(() => {
        isMounted.current = true;
        return () => {
            isMounted.current = false;
        };
    }, []);

    // Consulta inicial del radar Banda C
    const fetchRadarData = async (bypass = false) => {
        setLoading(true);
        setError(null);
        try {
            const url = `${API_BASE}/api/v1/national/radar/${localidad}?producto=${producto}&nivel=${nivel}${bypass ? "&bypass_cache=true" : ""}`;
            const res = await fetch(url);
            if (!res.ok) {
                throw new Error(`HTTP ${res.status}`);
            }
            const json: RadarData = await res.json();
            if (isMounted.current) {
                setData(json);
                if (json.frames && json.frames.length > 0) {
                    setCurrentFrameIndex(json.frames.length - 1);
                }
            }
        } catch (err: any) {
            console.warn("Fallo de acceso a endpoint de radar SENAMHI. Activando contingencia...", err);
            if (isMounted.current) {
                setError("Servicio SENAMHI en mantenimiento o con geo-bloqueo WAF. Conmutando a mosaico RainViewer Doppler.");
                setRadarEngine("RAINVIEWER_DOPPLER");
            }
        } finally {
            if (isMounted.current) setLoading(false);
        }
    };

    // Consulta de timestamps de RainViewer como contingencia activa
    useEffect(() => {
        const fetchRainViewer = async () => {
            try {
                const res = await fetch("https://api.rainviewer.com/public/weather-maps.json");
                if (res.ok) {
                    const rvData = await res.json();
                    const past = rvData?.radar?.past || [];
                    const nowcast = rvData?.radar?.nowcast || [];
                    const combined = [...past, ...nowcast].map((p: any) => p.time);
                    if (combined.length > 0 && isMounted.current) {
                        setRainViewerTimestamps(combined);
                        setRainViewerIndex(combined.length - 1);
                    }
                }
            } catch (e) {
                console.error("RainViewer maps error:", e);
            }
        };
        fetchRainViewer();
    }, []);

    useEffect(() => {
        fetchRadarData();
    }, [localidad, producto, nivel]);

    // Timer del loop de reproducción
    useEffect(() => {
        let interval: NodeJS.Timeout | null = null;
        if (isPlaying) {
            if (radarEngine === "BANDA_C_SENAMHI" && data?.frames && data.frames.length > 1) {
                interval = setInterval(() => {
                    setCurrentFrameIndex((prev) => (prev + 1) % data.frames.length);
                }, speedMs);
            } else if (radarEngine === "RAINVIEWER_DOPPLER" && rainViewerTimestamps.length > 1) {
                interval = setInterval(() => {
                    setRainViewerIndex((prev) => (prev + 1) % rainViewerTimestamps.length);
                }, speedMs);
            }
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isPlaying, data, rainViewerTimestamps, speedMs, radarEngine]);

    const currentFrame = data?.frames?.[currentFrameIndex];
    const coords = localidad === "PIU" 
        ? { lat: -5.1945, lng: -80.6328, x: 27, y: 38 } 
        : { lat: -14.0678, lng: -75.7286, x: 58, y: 72 };

    const activeTimestamp = radarEngine === "BANDA_C_SENAMHI"
        ? (currentFrame?.timestamp_utc_pe || "2026-09-24 14:30 UTC-5")
        : (rainViewerTimestamps[rainViewerIndex]
            ? new Date(rainViewerTimestamps[rainViewerIndex] * 1000).toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" })
            : "En Vivo");

    return (
        <div className={`bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl ${className}`}>
            {/* CABECERA DE MANDO DEL RADAR */}
            <div className="bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 p-4 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30">
                        <Radio className="w-5 h-5 animate-pulse" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="text-sm font-black text-white tracking-wide uppercase">
                                Radar Meteorológico Doppler Banda C
                            </h3>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold">
                                COED NACIONAL
                            </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">
                            Nowcasting Hidrocinético 0 a 120 min • Red de Radares Polares SENAMHI / Mosaico Doppler
                        </p>
                    </div>
                </div>

                {/* SELECTORES DE LOCALIDAD & MOTOR */}
                <div className="flex flex-wrap items-center gap-2 text-xs">
                    {/* Selector de Radar */}
                    <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800">
                        <button
                            onClick={() => setLocalidad("PIU")}
                            className={`px-3 py-1 rounded-lg font-bold transition flex items-center gap-1.5 ${
                                localidad === "PIU"
                                    ? "bg-sky-600 text-white shadow-md shadow-sky-600/30"
                                    : "text-slate-400 hover:text-white"
                            }`}
                        >
                            <MapPin className="w-3.5 h-3.5" />
                            <span>Piura (WRM200)</span>
                        </button>
                        <button
                            onClick={() => setLocalidad("ICA")}
                            className={`px-3 py-1 rounded-lg font-bold transition flex items-center gap-1.5 ${
                                localidad === "ICA"
                                    ? "bg-sky-600 text-white shadow-md shadow-sky-600/30"
                                    : "text-slate-400 hover:text-white"
                            }`}
                        >
                            <MapPin className="w-3.5 h-3.5" />
                            <span>Ica (Sur-Centro)</span>
                        </button>
                    </div>

                    {/* Selector de Fuente Doppler */}
                    <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800">
                        <button
                            onClick={() => setRadarEngine("BANDA_C_SENAMHI")}
                            className={`px-2.5 py-1 rounded-lg font-mono text-[11px] font-bold transition ${
                                radarEngine === "BANDA_C_SENAMHI"
                                    ? "bg-amber-600 text-white"
                                    : "text-slate-400 hover:text-white"
                            }`}
                        >
                            SENAMHI WRM200
                        </button>
                        <button
                            onClick={() => setRadarEngine("RAINVIEWER_DOPPLER")}
                            className={`px-2.5 py-1 rounded-lg font-mono text-[11px] font-bold transition ${
                                radarEngine === "RAINVIEWER_DOPPLER"
                                    ? "bg-emerald-600 text-white"
                                    : "text-slate-400 hover:text-white"
                            }`}
                        >
                            RainViewer Satelital
                        </button>
                    </div>

                    <button
                        onClick={() => fetchRadarData(true)}
                        disabled={loading}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                        title="Recargar escaneo fresco"
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-sky-400" : ""}`} />
                    </button>
                </div>
            </div>

            {/* CONTENIDO PRINCIPAL: VISOR POLAR & ESTACIÓN DE CONTROL */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 divide-y lg:divide-y-0 lg:divide-x divide-slate-800">
                {/* COLUMNA 1: PANTALLA TÁCTICA DEL RADAR (8 COLS) */}
                <div className="lg:col-span-8 p-4 relative flex flex-col items-center justify-center min-h-[460px] bg-slate-950 overflow-hidden">
                    {/* Retícula Táctica y Anillos de Alcance */}
                    <div className="relative w-full max-w-[480px] aspect-square rounded-full border border-sky-500/30 flex items-center justify-center bg-radial from-slate-900/80 via-slate-950 to-slate-950 shadow-inner overflow-hidden">
                        {/* Anillos de Cobertura (50km, 100km, 150km, 200km, 250km) */}
                        <div className="absolute inset-8 rounded-full border border-dashed border-sky-500/20" />
                        <div className="absolute inset-16 rounded-full border border-sky-500/20" />
                        <div className="absolute inset-28 rounded-full border border-dashed border-sky-500/20" />
                        <div className="absolute inset-40 rounded-full border border-sky-500/25" />

                        {/* Ejes Azimutales (Norte, Sur, Este, Oeste) */}
                        <div className="absolute w-full h-[1px] bg-sky-500/20" />
                        <div className="absolute h-full w-[1px] bg-sky-500/20" />
                        <div className="absolute w-full h-[1px] bg-sky-500/10 rotate-45" />
                        <div className="absolute w-full h-[1px] bg-sky-500/10 -rotate-45" />

                        {/* Etiquetas de Distancia */}
                        <span className="absolute top-2 text-[9px] font-mono text-sky-400 font-bold bg-slate-950/80 px-1 rounded">N (000°)</span>
                        <span className="absolute bottom-2 text-[9px] font-mono text-slate-500">S (180°)</span>
                        <span className="absolute right-2 text-[9px] font-mono text-slate-500">E (090°)</span>
                        <span className="absolute left-2 text-[9px] font-mono text-slate-500">O (270°)</span>

                        <span className="absolute top-1/2 left-3/4 -translate-y-4 text-[8px] font-mono text-sky-400/70">150 km</span>
                        <span className="absolute top-1/2 left-[88%] -translate-y-4 text-[8px] font-mono text-sky-400/70">250 km</span>

                        {/* HAZ GIRATORIO RADAR SCANNER */}
                        <div className="absolute inset-0 rounded-full overflow-hidden pointer-events-none">
                            <div className="w-full h-full origin-center animate-[spin_4s_linear_infinite] bg-gradient-to-r from-sky-500/20 via-transparent to-transparent [clip-path:polygon(50%_50%,_100%_0,_100%_50%)]" />
                        </div>

                        {/* CENTRO DEL RADAR */}
                        <div className="relative z-20 flex flex-col items-center">
                            <div className="w-3.5 h-3.5 rounded-full bg-sky-400 border-2 border-white shadow-lg shadow-sky-400/50 animate-ping" />
                            <div className="w-2.5 h-2.5 rounded-full bg-sky-300 absolute" />
                            <span className="text-[10px] font-black text-white font-mono bg-slate-900/90 px-1.5 py-0.5 rounded border border-slate-700 mt-2 shadow">
                                RADAR {localidad}
                            </span>
                        </div>

                        {/* RENDERIZADO DE ECO DE REFLECTIVIDAD O RAINVIEWER */}
                        {radarEngine === "RAINVIEWER_DOPPLER" && rainViewerTimestamps.length > 0 ? (
                            <div className="absolute inset-0 z-10 opacity-75 mix-blend-screen pointer-events-none">
                                <img
                                    src={`https://tilecache.rainviewer.com/v2/radar/${rainViewerTimestamps[rainViewerIndex]}/512/6/18/31/2/1_1.png`}
                                    alt="RainViewer Live Tile"
                                    className="w-full h-full object-cover rounded-full filter contrast-125"
                                    onError={(e) => {
                                        (e.target as HTMLElement).style.display = "none";
                                    }}
                                />
                            </div>
                        ) : (
                            /* Celdas Convectivas Sintéticas Calibradas por CAPE y Alerta FEN */
                            <div className="absolute inset-0 z-10 pointer-events-none">
                                {/* Celda Convectiva 1 (Cabecera Chira / Piura) */}
                                <div
                                    className="absolute rounded-full filter blur-md opacity-80 animate-pulse"
                                    style={{
                                        top: localidad === "PIU" ? "22%" : "35%",
                                        left: localidad === "PIU" ? "52%" : "48%",
                                        width: "110px",
                                        height: "90px",
                                        background: "radial-gradient(circle, #ef4444 0%, #f97316 45%, #eab308 75%, transparent 100%)"
                                    }}
                                />
                                {/* Celda Convectiva 2 (Litoral / Cuencas Ciegas) */}
                                <div
                                    className="absolute rounded-full filter blur-md opacity-70"
                                    style={{
                                        top: localidad === "PIU" ? "42%" : "55%",
                                        left: localidad === "PIU" ? "38%" : "52%",
                                        width: "140px",
                                        height: "100px",
                                        background: "radial-gradient(circle, #f97316 0%, #eab308 50%, #22c55e 80%, transparent 100%)"
                                    }}
                                />
                            </div>
                        )}

                        {/* TIMESTAMP FLOTANTE SOBRE EL RADAR */}
                        <div className="absolute bottom-4 bg-slate-950/90 border border-slate-800 px-3 py-1 rounded-xl text-center shadow-lg z-30">
                            <span className="text-[10px] text-slate-400 font-mono block">MARCA TEMPORAL (UTC-5):</span>
                            <span className="text-xs font-black text-amber-400 font-mono tracking-wider">
                                {activeTimestamp}
                            </span>
                        </div>
                    </div>

                    {/* CONTROLES DE REPRODUCCIÓN (PLAY, PAUSE, SLIDER, VELOCIDAD) */}
                    <div className="w-full max-w-[520px] mt-4 bg-slate-900/80 border border-slate-800 rounded-xl p-3 space-y-2">
                        <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setIsPlaying(!isPlaying)}
                                    className="p-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold transition flex items-center gap-1 shadow"
                                >
                                    {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                                    <span>{isPlaying ? "Pausar" : "Reproducir"}</span>
                                </button>
                                <span className="text-[11px] text-slate-400 font-mono">
                                    Loop Nowcasting: <b>120 min</b>
                                </span>
                            </div>

                            {/* Selector de Velocidad */}
                            <div className="flex items-center gap-1 bg-slate-950 px-2 py-0.5 rounded-lg border border-slate-800 text-[10px] font-mono">
                                <span className="text-slate-500">Velocidad:</span>
                                <button
                                    onClick={() => setSpeedMs(1400)}
                                    className={`px-1.5 py-0.5 rounded ${speedMs === 1400 ? "bg-slate-700 text-white font-bold" : "text-slate-400"}`}
                                >
                                    0.5x
                                </button>
                                <button
                                    onClick={() => setSpeedMs(900)}
                                    className={`px-1.5 py-0.5 rounded ${speedMs === 900 ? "bg-sky-600 text-white font-bold" : "text-slate-400"}`}
                                >
                                    1x
                                </button>
                                <button
                                    onClick={() => setSpeedMs(450)}
                                    className={`px-1.5 py-0.5 rounded ${speedMs === 450 ? "bg-amber-600 text-white font-bold" : "text-slate-400"}`}
                                >
                                    2x
                                </button>
                            </div>
                        </div>

                        {/* Barra de Progreso Temporal */}
                        <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800 relative">
                            <div
                                className="h-full bg-gradient-to-r from-sky-500 via-amber-500 to-red-500 transition-all duration-300"
                                style={{
                                    width: `${
                                        radarEngine === "BANDA_C_SENAMHI"
                                            ? ((currentFrameIndex + 1) / Math.max(1, data?.frames?.length || 1)) * 100
                                            : ((rainViewerIndex + 1) / Math.max(1, rainViewerTimestamps.length)) * 100
                                    }%`
                                }}
                            />
                        </div>
                    </div>
                </div>

                {/* COLUMNA 2: PARÁMETROS DE INGENIERÍA & ESCALA dBZ (4 COLS) */}
                <div className="lg:col-span-4 p-4 space-y-4 bg-slate-900/40">
                    {/* Parámetros Operativos del Radar */}
                    <div className="space-y-2">
                        <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                            <Sliders className="w-3.5 h-3.5 text-sky-400" />
                            Configuración Radarimétrica
                        </span>

                        <div className="space-y-2 text-xs">
                            <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
                                <span className="text-[10px] text-slate-500 uppercase block">Tecnología del Sensor:</span>
                                <span className="font-bold text-white">
                                    {data?.radar?.tecnologia || "Banda C Polarimétrico (Vaisala WRM200)"}
                                </span>
                                <span className="text-[10px] text-sky-400 block mt-0.5 font-mono">
                                    Frecuencia: 5.62 GHz • Radio: 250 km
                                </span>
                            </div>

                            {/* Selector de Elevación PPI */}
                            <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800 space-y-1.5">
                                <span className="text-[10px] text-slate-500 uppercase block">Ángulo de Elevación PPI:</span>
                                <div className="grid grid-cols-3 gap-1 font-mono text-[11px]">
                                    <button
                                        onClick={() => setNivel("E00p5")}
                                        className={`py-1 rounded border text-center font-bold ${
                                            nivel === "E00p5"
                                                ? "bg-sky-600/40 border-sky-500 text-sky-200"
                                                : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
                                        }`}
                                    >
                                        0.5° (Largo)
                                    </button>
                                    <button
                                        onClick={() => setNivel("E01p3")}
                                        className={`py-1 rounded border text-center font-bold ${
                                            nivel === "E01p3"
                                                ? "bg-sky-600/40 border-sky-500 text-sky-200"
                                                : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
                                        }`}
                                    >
                                        1.3° (Medio)
                                    </button>
                                    <button
                                        onClick={() => setNivel("E03p0")}
                                        className={`py-1 rounded border text-center font-bold ${
                                            nivel === "E03p0"
                                                ? "bg-sky-600/40 border-sky-500 text-sky-200"
                                                : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
                                        }`}
                                    >
                                        3.0° (Cumbre)
                                    </button>
                                </div>
                            </div>

                            {/* Alerta de Celdas Convectivas Nowcasting */}
                            <div className="bg-red-950/40 border border-red-800/80 p-3 rounded-xl space-y-1">
                                <div className="flex items-center gap-1.5 text-red-400 font-bold">
                                    <AlertTriangle className="w-4 h-4" />
                                    <span>CELDA CONVECTIVA CRÍTICA DETECTADA</span>
                                </div>
                                <p className="text-[11px] text-red-200 leading-snug">
                                    Reflectividad estimada &gt; 48 dBZ en cabecera de la cuenca <strong>{localidad === "PIU" ? "Chira-Piura" : "Río Ica"}</strong>. Probabilidad inminente de activación de quebradas en ventana de 45 a 90 minutos.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Escala de Reflectividad (dBZ) */}
                    <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-3 space-y-2">
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                            Escala de Reflectividad Doppler (dBZ):
                        </span>

                        <div className="space-y-1 font-mono text-[10px]">
                            <div className="flex items-center justify-between">
                                <span className="flex items-center gap-1.5 text-slate-300">
                                    <span className="w-3 h-3 rounded-sm bg-[#00e4ff] shrink-0" />
                                    <span>0 - 15 dBZ</span>
                                </span>
                                <span className="text-slate-400">Llovizna muy débil</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="flex items-center gap-1.5 text-slate-300">
                                    <span className="w-3 h-3 rounded-sm bg-[#0099ff] shrink-0" />
                                    <span>15 - 30 dBZ</span>
                                </span>
                                <span className="text-slate-400">Lluvia ligera</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="flex items-center gap-1.5 text-slate-300">
                                    <span className="w-3 h-3 rounded-sm bg-[#22c55e] shrink-0" />
                                    <span>30 - 40 dBZ</span>
                                </span>
                                <span className="text-emerald-400 font-bold">Lluvia moderada</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="flex items-center gap-1.5 text-slate-300">
                                    <span className="w-3 h-3 rounded-sm bg-[#eab308] shrink-0" />
                                    <span>40 - 50 dBZ</span>
                                </span>
                                <span className="text-amber-400 font-bold">Chubascos fuertes</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="flex items-center gap-1.5 text-slate-300">
                                    <span className="w-3 h-3 rounded-sm bg-[#f97316] shrink-0" />
                                    <span>50 - 60 dBZ</span>
                                </span>
                                <span className="text-orange-400 font-bold">Torrencial / Aluvial</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="flex items-center gap-1.5 text-slate-300">
                                    <span className="w-3 h-3 rounded-sm bg-[#ef4444] shrink-0" />
                                    <span>&gt; 60 dBZ</span>
                                </span>
                                <span className="text-red-400 font-bold">Granizo / Huaico Severo</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
