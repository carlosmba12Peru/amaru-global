"use client";

import React, { useState, useEffect, useRef } from "react";
import {
    X,
    Play,
    Pause,
    SkipBack,
    SkipForward,
    RotateCcw,
    Radio,
    Layers,
    Clock,
    Activity,
    ExternalLink,
    AlertTriangle,
    Shield,
    Sparkles,
    Eye,
    Maximize2
} from "lucide-react";

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
        rol_estrategico: string;
    };
    estado_conexion: string;
    parametros_consulta: {
        localidad: string;
        producto: string;
        nivel: string;
    };
    total_frames: number;
    ultimo_escaneo: string;
    frames: RadarFrame[];
    escala_reflectividad_dbz: Record<string, { intensidad: string; color_hex: string }>;
}

interface RadarViewerModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialLocalidad?: "PIU" | "ICA";
}

export default function RadarViewerModal({
    isOpen,
    onClose,
    initialLocalidad = "PIU"
}: RadarViewerModalProps) {
    const [localidad, setLocalidad] = useState<"PIU" | "ICA">(initialLocalidad);
    const [producto, setProducto] = useState<string>("HRef_QC");
    const [nivel, setNivel] = useState<string>("E00p5");
    const [data, setData] = useState<RadarData | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    // Reproducción secuencial (Radar Loop)
    const [currentFrameIndex, setCurrentFrameIndex] = useState<number>(0);
    const [isPlaying, setIsPlaying] = useState<boolean>(true);
    const [speedMs, setSpeedMs] = useState<number>(800); // 800ms normal

    const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

    useEffect(() => {
        if (isOpen) {
            fetchRadarData();
        }
    }, [isOpen, localidad, producto, nivel]);

    // Timer del loop de reproducción
    useEffect(() => {
        let interval: NodeJS.Timeout | null = null;
        if (isPlaying && data && data.frames && data.frames.length > 1) {
            interval = setInterval(() => {
                setCurrentFrameIndex((prev) => (prev + 1) % data.frames.length);
            }, speedMs);
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isPlaying, data, speedMs]);

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
            setData(json);
            if (json.frames && json.frames.length > 0) {
                setCurrentFrameIndex(json.frames.length - 1); // Posicionar en el último scan por defecto
            }
        } catch (err: any) {
            setError(`Error cargando scans de radar SENAMHI: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    const currentFrame = data?.frames?.[currentFrameIndex] || null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
            <div className="relative w-full max-w-5xl bg-slate-900 border border-sky-500/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
                {/* Header Táctico */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-950/90">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
                            <Radio className="w-5 h-5 animate-pulse" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="text-base font-bold text-white tracking-wide">
                                    Radar Meteorológico Doppler Banda C
                                </h3>
                                <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                    NOWCASTING 0-120 MIN
                                </span>
                            </div>
                            <p className="text-xs text-slate-400">
                                {data?.radar?.nombre || "SENAMHI"} • {data?.radar?.tecnologia || "Vaisala WRM200"} • Radio ~{data?.radar?.radio_cobertura_km || 250} km
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Selector de Localidad */}
                        <div className="flex items-center bg-slate-800/90 rounded-lg p-1 border border-slate-700">
                            <button
                                onClick={() => setLocalidad("PIU")}
                                className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                                    localidad === "PIU"
                                        ? "bg-sky-600 text-white shadow-md shadow-sky-600/30"
                                        : "text-slate-400 hover:text-white"
                                }`}
                            >
                                PIURA (FEN)
                            </button>
                            <button
                                onClick={() => setLocalidad("ICA")}
                                className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                                    localidad === "ICA"
                                        ? "bg-sky-600 text-white shadow-md shadow-sky-600/30"
                                        : "text-slate-400 hover:text-white"
                                }`}
                            >
                                ICA (SUR)
                            </button>
                        </div>

                        <button
                            onClick={onClose}
                            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all"
                            title="Cerrar Visor"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Sub-Barra de Parámetros y Filtros */}
                <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-2.5 bg-slate-900/95 border-b border-slate-800/80 text-xs">
                    <div className="flex items-center gap-3">
                        <label className="text-slate-400 flex items-center gap-1 font-medium">
                            <Layers className="w-3.5 h-3.5 text-sky-400" /> Producto:
                        </label>
                        <select
                            value={producto}
                            onChange={(e) => setProducto(e.target.value)}
                            className="bg-slate-800 border border-slate-700 text-slate-200 rounded px-2.5 py-1 focus:outline-none focus:border-sky-500"
                        >
                            <option value="HRef_QC">Reflectividad Filtrada (HRef QC)</option>
                            <option value="HRef">Reflectividad Bruta (HRef)</option>
                            <option value="RVel">Velocidad Radial Doppler (RVel)</option>
                        </select>

                        <label className="text-slate-400 flex items-center gap-1 font-medium ml-2">
                            Elevación PPI:
                        </label>
                        <select
                            value={nivel}
                            onChange={(e) => setNivel(e.target.value)}
                            className="bg-slate-800 border border-slate-700 text-slate-200 rounded px-2 py-1 focus:outline-none focus:border-sky-500"
                        >
                            <option value="E00p5">PPI 0.5° (Base)</option>
                            <option value="E01p3">PPI 1.3°</option>
                            <option value="E03p0">PPI 3.0°</option>
                            <option value="E05p0">PPI 5.0°</option>
                            <option value="E10p0">PPI 10.0°</option>
                        </select>
                    </div>

                    <div className="flex items-center gap-3">
                        <span className="text-slate-400">
                            Estado:{" "}
                            <span className="text-emerald-400 font-semibold">
                                {data?.estado_conexion || "CONSULTANDO..."}
                            </span>
                        </span>
                        <a
                            href="https://www.senamhi.gob.pe/main.php?p=satelites-radares"
                            target="_blank"
                            rel="noreferrer"
                            className="text-sky-400 hover:text-sky-300 flex items-center gap-1 font-medium underline"
                        >
                            Portal SENAMHI <ExternalLink className="w-3 h-3" />
                        </a>
                    </div>
                </div>

                {/* Contenedor Visual Central */}
                <div className="relative flex-1 bg-black flex items-center justify-center min-h-[380px] sm:min-h-[460px] overflow-hidden">
                    {loading ? (
                        <div className="flex flex-col items-center gap-3 text-slate-400">
                            <Radio className="w-10 h-10 text-sky-400 animate-spin" />
                            <p className="text-sm">Descargando barrido volumétrico del SENAMHI...</p>
                        </div>
                    ) : error ? (
                        <div className="p-6 text-center max-w-md">
                            <AlertTriangle className="w-10 h-10 text-amber-400 mx-auto mb-2" />
                            <p className="text-sm text-slate-300 mb-3">{error}</p>
                            <button
                                onClick={() => fetchRadarData(true)}
                                className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold rounded-lg"
                            >
                                Reintentar Conexión
                            </button>
                        </div>
                    ) : currentFrame ? (
                        <div className="relative w-full h-full flex items-center justify-center p-2">
                            {/* Imagen de Radar SENAMHI */}
                            <img
                                src={currentFrame.imagen_url_completa}
                                alt={`Radar ${localidad} ${currentFrame.timestamp_utc_pe}`}
                                className="max-h-[460px] w-auto object-contain rounded-lg shadow-inner select-none"
                            />

                            {/* Overlay de Estampa Temporal y Frame */}
                            <div className="absolute top-4 left-4 bg-slate-950/80 border border-slate-700/80 backdrop-blur-md rounded-lg px-3 py-2 text-xs shadow-lg">
                                <div className="text-slate-400 flex items-center gap-1">
                                    <Clock className="w-3.5 h-3.5 text-sky-400" />
                                    <span>Escaneo:</span>
                                    <strong className="text-white font-mono">
                                        {currentFrame.timestamp_utc_pe || "Tiempo Real"}
                                    </strong>
                                </div>
                                <div className="text-slate-400 mt-0.5">
                                    Fotograma:{" "}
                                    <strong className="text-sky-300 font-mono">
                                        {currentFrameIndex + 1} / {data?.total_frames || 1}
                                    </strong>
                                </div>
                            </div>

                            {/* Badge de Alerta Táctica */}
                            <div className="absolute top-4 right-4 bg-slate-950/80 border border-sky-500/40 backdrop-blur-md rounded-lg px-3 py-2 text-xs text-right shadow-lg">
                                <span className="text-sky-400 font-semibold uppercase tracking-wider block">
                                    {data?.radar?.region || "Vigilancia"}
                                </span>
                                <span className="text-[11px] text-slate-300">
                                    Cuencas: {data?.radar?.cuencas_vigiladas?.slice(0, 2).join(", ")}
                                </span>
                            </div>
                        </div>
                    ) : (
                        <p className="text-slate-500 text-sm">No hay escaneos disponibles en este momento.</p>
                    )}

                    {/* Escala de Reflectividad Horizontal (dBZ) */}
                    <div className="absolute bottom-3 left-4 right-4 sm:left-auto sm:right-4 bg-slate-950/85 border border-slate-800 backdrop-blur-md rounded-lg p-2.5 shadow-xl text-xs max-w-sm">
                        <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1 font-semibold uppercase">
                            <span>Escala dBZ (Intensidad)</span>
                            <span className="text-sky-400">Marshall-Palmer</span>
                        </div>
                        <div className="grid grid-cols-6 gap-1 h-3 rounded overflow-hidden">
                            <div className="bg-[#00e4ff]" title="0-15 dBZ: Muy débil" />
                            <div className="bg-[#0099ff]" title="15-30 dBZ: Lluvia ligera" />
                            <div className="bg-[#22c55e]" title="30-40 dBZ: Moderada" />
                            <div className="bg-[#eab308]" title="40-50 dBZ: Lluvia fuerte" />
                            <div className="bg-[#f97316]" title="50-60 dBZ: Torrencial / Riesgo Aluvial" />
                            <div className="bg-[#ef4444]" title=">60 dBZ: Granizo / Convección Extrema" />
                        </div>
                        <div className="flex justify-between text-[9px] text-slate-400 mt-1 font-mono">
                            <span>10 dBZ</span>
                            <span>25</span>
                            <span>35</span>
                            <span>45</span>
                            <span>55</span>
                            <span>&gt;60 dBZ</span>
                        </div>
                    </div>
                </div>

                {/* Barra de Control de Reproducción (Playback Loop) */}
                <div className="px-5 py-4 bg-slate-950 border-t border-slate-800 flex flex-col gap-3">
                    {/* Slider temporal */}
                    <div className="flex items-center gap-3">
                        <span className="text-xs font-mono text-slate-400 w-8">
                            #{currentFrameIndex + 1}
                        </span>
                        <input
                            type="range"
                            min={0}
                            max={(data?.frames?.length || 1) - 1}
                            value={currentFrameIndex}
                            onChange={(e) => {
                                setIsPlaying(false);
                                setCurrentFrameIndex(Number(e.target.value));
                            }}
                            className="w-full accent-sky-500 h-2 bg-slate-800 rounded-lg cursor-pointer"
                        />
                        <span className="text-xs font-mono text-slate-400 w-8 text-right">
                            #{data?.frames?.length || 1}
                        </span>
                    </div>

                    {/* Botonera y Velocidad */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => {
                                    setIsPlaying(false);
                                    setCurrentFrameIndex(0);
                                }}
                                className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-all"
                                title="Ir al Primer Scan"
                            >
                                <SkipBack className="w-4 h-4" />
                            </button>

                            <button
                                onClick={() => {
                                    setIsPlaying(false);
                                    setCurrentFrameIndex((prev) =>
                                        prev > 0 ? prev - 1 : (data?.frames?.length || 1) - 1
                                    );
                                }}
                                className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-all"
                                title="Scan Anterior"
                            >
                                <RotateCcw className="w-4 h-4" />
                            </button>

                            <button
                                onClick={() => setIsPlaying(!isPlaying)}
                                className="flex items-center gap-1.5 px-4 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-bold shadow-md shadow-sky-600/30 transition-all"
                            >
                                {isPlaying ? (
                                    <>
                                        <Pause className="w-4 h-4" /> Pausa
                                    </>
                                ) : (
                                    <>
                                        <Play className="w-4 h-4" /> Reproducir
                                    </>
                                )}
                            </button>

                            <button
                                onClick={() => {
                                    setIsPlaying(false);
                                    setCurrentFrameIndex((prev) =>
                                        (prev + 1) % (data?.frames?.length || 1)
                                    );
                                }}
                                className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-all"
                                title="Siguiente Scan"
                            >
                                <SkipForward className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Selector de Velocidad */}
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-400">Velocidad:</span>
                            <div className="flex bg-slate-900 border border-slate-800 rounded-lg p-0.5 text-xs">
                                <button
                                    onClick={() => setSpeedMs(1500)}
                                    className={`px-2 py-1 rounded ${
                                        speedMs === 1500 ? "bg-slate-700 text-white font-bold" : "text-slate-400"
                                    }`}
                                >
                                    0.5x
                                </button>
                                <button
                                    onClick={() => setSpeedMs(800)}
                                    className={`px-2 py-1 rounded ${
                                        speedMs === 800 ? "bg-slate-700 text-white font-bold" : "text-slate-400"
                                    }`}
                                >
                                    1.0x
                                </button>
                                <button
                                    onClick={() => setSpeedMs(400)}
                                    className={`px-2 py-1 rounded ${
                                        speedMs === 400 ? "bg-slate-700 text-white font-bold" : "text-slate-400"
                                    }`}
                                >
                                    2.0x
                                </button>
                            </div>

                            <button
                                onClick={() => fetchRadarData(true)}
                                className="ml-3 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-medium rounded-lg transition-all"
                                title="Refrescar datos en vivo de SENAMHI"
                            >
                                Actualizar Ahora
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
