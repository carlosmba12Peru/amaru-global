"use client";

import React, { useState, useEffect, useRef } from "react";
import {
    Search,
    CloudRain,
    Sun,
    Cloud,
    CloudSun,
    CloudLightning,
    Snowflake,
    CloudFog,
    Wind,
    Droplets,
    Gauge,
    SunMedium,
    Sunrise,
    Sunset,
    ChevronLeft,
    ChevronRight,
    Compass,
    MapPin,
    AlertTriangle,
    ShieldAlert,
    ShieldCheck,
    Zap,
    Layers,
    Clock,
    Calendar,
    RefreshCw,
    Info,
    ExternalLink
} from "lucide-react";

interface DistrictSearchItem {
    ubigeo: string;
    distrito: string;
    provincia: string;
    departamento: string;
    lat: number;
    lng: number;
    poblacion: number;
    declarado_ds124: boolean;
    peligro_cenepred: string;
}

interface WeatherSlot {
    temp: number;
    weather_code: number;
    icon_type: string;
    prob_rain: number;
}

interface DayForecast {
    index: number;
    date: string;
    day_short: string;
    date_formatted: string;
    temp_max: number;
    temp_min: number;
    weather_code: number;
    icon_type: string;
    weather_desc: string;
    slots: {
        slot_08: WeatherSlot;
        slot_14: WeatherSlot;
        slot_20: WeatherSlot;
    };
    rain_mm: number;
    snow_cm: number;
    wind_speed_kmh: number;
    wind_direction: string;
    wind_arrow: string;
    wind_direction_deg: number;
    sunrise: string;
    sunset: string;
    prob_precip_max: number;
    nivel_riesgo_quebrada: "VERDE" | "AMARILLO" | "NARANJA" | "ROJO";
}

interface HourForecast {
    time: string;
    full_time: string;
    temp: number;
    prob_rain: number;
    rain_mm: number;
    weather_code: number;
    icon_type: string;
    wind_speed_kmh: number;
    cape: number;
}

interface DistrictForecastData {
    metadata: {
        ubigeo: string;
        distrito: string;
        provincia: string;
        departamento: string;
        coordenadas: { lat: number; lng: number };
        poblacion: number;
        declarado_ds124: boolean;
        peligro_cenepred: string;
        modelo: string;
        generado_el: string;
    };
    current: {
        temperature: number;
        temperature_exact: number;
        apparent_temperature: number;
        weather_code: number;
        weather_desc: string;
        icon_type: string;
        wind_speed_kmh: number;
        wind_direction: string;
        wind_arrow: string;
        wind_direction_deg: number;
        cloud_cover_pct: number;
        relative_humidity_pct: number;
        uv_index: number;
        uv_level: string;
        pressure_hpa: number;
        cape_j_kg: number;
        soil_moisture_pct: number;
        soil_4_capas: {
            superficial_0_7cm: number;
            radicular_7_28cm: number;
            talud_28_100cm: number;
            profunda_100_255cm: number;
        };
        is_day: boolean;
    };
    days: DayForecast[];
    hours_24: HourForecast[];
    weekend: DayForecast[];
}

interface DistrictWeatherInspectorProps {
    initialUbigeo?: string;
    className?: string;
    onSelectDistrict?: (ubigeo: string) => void;
    compact?: boolean;
}

export default function DistrictWeatherInspector({
    initialUbigeo = "120701", // Tarma por defecto según la imagen
    className = "",
    onSelectDistrict,
    compact = false
}: DistrictWeatherInspectorProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<DistrictSearchItem[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const [selectedUbigeo, setSelectedUbigeo] = useState<string>(initialUbigeo);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [forecastData, setForecastData] = useState<DistrictForecastData | null>(null);
    const [activeTab, setActiveTab] = useState<"dias" | "horas" | "fin_semana">("dias");

    const searchRef = useRef<HTMLDivElement>(null);
    const tableScrollRef = useRef<HTMLDivElement>(null);

    // Distritos sugeridos de acceso rápido
    const quickDistricts = [
        { name: "Tarma", ubigeo: "120701", dept: "Junín" },
        { name: "Chosica", ubigeo: "150118", dept: "Lima" },
        { name: "Huaraz", ubigeo: "020101", dept: "Áncash" },
        { name: "Piura", ubigeo: "200101", dept: "Piura" },
        { name: "Urubamba", ubigeo: "081301", dept: "Cusco" },
        { name: "Puno", ubigeo: "210101", dept: "Puno" }
    ];

    // Cargar pronóstico detallado
    const loadDistrictForecast = async (ubigeo: string) => {
        setLoading(true);
        setError(null);
        try {
            const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
            const res = await fetch(`${apiBase}/api/meteo/district-forecast/${ubigeo}`);
            if (!res.ok) {
                throw new Error(`Error en servidor: ${res.status}`);
            }
            const data: DistrictForecastData = await res.json();
            setForecastData(data);
            setSelectedUbigeo(ubigeo);
            if (onSelectDistrict) {
                onSelectDistrict(ubigeo);
            }
        } catch (err: any) {
            console.error("Error al cargar pronóstico de distrito:", err);
            setError("No se pudo conectar con el servidor meteorológico. Mostrando respaldo local.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (initialUbigeo) {
            loadDistrictForecast(initialUbigeo);
        }
    }, [initialUbigeo]);

    // Búsqueda autocomplete de distritos con debounce
    useEffect(() => {
        if (!searchQuery || searchQuery.trim().length < 2) {
            setSearchResults([]);
            return;
        }

        const timer = setTimeout(async () => {
            setIsSearching(true);
            try {
                const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
                const res = await fetch(`${apiBase}/api/data/districts/search?q=${encodeURIComponent(searchQuery.trim())}&limit=8`);
                if (res.ok) {
                    const items: DistrictSearchItem[] = await res.json();
                    setSearchResults(items);
                    setShowResults(true);
                }
            } catch (err) {
                console.error("Error buscando distritos:", err);
            } finally {
                setIsSearching(false);
            }
        }, 220);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Cerrar buscador si se hace clic afuera
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setShowResults(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Renderizador de íconos meteorológicos
    const renderWeatherIcon = (iconType: string, size: "sm" | "md" | "lg" | "xl" = "md") => {
        const sizeClasses = {
            sm: "w-5 h-5",
            md: "w-7 h-7",
            lg: "w-10 h-10",
            xl: "w-20 h-20"
        };
        const s = sizeClasses[size];

        switch (iconType) {
            case "sunny":
                return <Sun className={`${s} text-amber-400 drop-shadow-[0_0_12px_rgba(251,191,36,0.5)]`} />;
            case "partly_cloudy":
                return <CloudSun className={`${s} text-amber-300 drop-shadow-[0_0_8px_rgba(252,211,77,0.4)]`} />;
            case "cloudy":
                return <Cloud className={`${s} text-slate-400`} />;
            case "fog":
                return <CloudFog className={`${s} text-slate-300`} />;
            case "drizzle":
                return <CloudRain className={`${s} text-sky-400`} />;
            case "rain":
                return <CloudRain className={`${s} text-blue-400 drop-shadow-[0_0_10px_rgba(96,165,250,0.5)]`} />;
            case "heavy_rain":
                return <CloudRain className={`${s} text-indigo-400 animate-pulse`} />;
            case "snow":
                return <Snowflake className={`${s} text-cyan-200 drop-shadow-[0_0_8px_rgba(165,243,252,0.6)]`} />;
            case "thunderstorm":
                return <CloudLightning className={`${s} text-yellow-400 animate-bounce`} />;
            default:
                return <Cloud className={`${s} text-slate-400`} />;
        }
    };

    // Renderizador de badge de nivel UV
    const renderUvBadge = (uvIndex: number, uvLevel: string) => {
        let colorClass = "bg-emerald-500/20 text-emerald-300 border-emerald-500/40";
        if (uvIndex >= 11) colorClass = "bg-purple-600/25 text-purple-300 border-purple-500/50 font-black";
        else if (uvIndex >= 8) colorClass = "bg-rose-500/20 text-rose-300 border-rose-500/40";
        else if (uvIndex >= 6) colorClass = "bg-amber-500/20 text-amber-300 border-amber-500/40";

        return (
            <span className={`px-2 py-0.5 rounded text-xs border uppercase tracking-wider ${colorClass}`}>
                {uvLevel} ({uvIndex})
            </span>
        );
    };

    // Scroll horizontal en tabla de 7 días
    const scrollTable = (direction: "left" | "right") => {
        if (tableScrollRef.current) {
            const offset = direction === "left" ? -260 : 260;
            tableScrollRef.current.scrollBy({ left: offset, behavior: "smooth" });
        }
    };

    return (
        <div className={`w-full bg-slate-950/90 border border-slate-800/80 rounded-2xl p-4 md:p-6 shadow-2xl backdrop-blur-xl ${className}`}>
            {/* -------------------------------------------------------------
                1. TOP BAR: LOGO CLIMA PERÚ / COEN + BUSCADOR AUTOCOMPLETE
               ------------------------------------------------------------- */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
                <div className="flex items-center gap-3 self-start md:self-auto">
                    <div className="flex items-center gap-2 bg-gradient-to-r from-sky-500/20 to-blue-600/20 border border-sky-500/30 px-3.5 py-1.5 rounded-full">
                        <CloudRain className="w-5 h-5 text-sky-400" />
                        <span className="text-sm font-black text-white tracking-wide">
                            clima <span className="text-sky-400">Perú</span>
                        </span>
                        <span className="text-[10px] bg-sky-500/30 text-sky-200 px-1.5 py-0.5 rounded font-mono font-bold">
                            PRO C2
                        </span>
                    </div>
                    <span className="hidden sm:inline-block text-xs text-slate-400 font-mono">
                        Open-Meteo ECMWF IFS 9km • 1,891 Distritos
                    </span>
                </div>

                {/* Input de Búsqueda de Distritos */}
                <div ref={searchRef} className="relative w-full md:w-96">
                    <div className="relative flex items-center">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onFocus={() => {
                                if (searchResults.length > 0) setShowResults(true);
                            }}
                            placeholder="Clima en... (Distrito, Provincia o Departamento)"
                            className="w-full bg-slate-900/90 border border-slate-700/80 hover:border-sky-500/70 focus:border-sky-400 focus:ring-2 focus:ring-sky-500/20 rounded-full py-2 pl-10 pr-10 text-sm text-white placeholder-slate-400 transition-all outline-none"
                        />
                        <Search className="w-4 h-4 text-slate-400 absolute left-3.5" />
                        {isSearching ? (
                            <RefreshCw className="w-4 h-4 text-sky-400 animate-spin absolute right-3.5" />
                        ) : searchQuery ? (
                            <button
                                onClick={() => {
                                    setSearchQuery("");
                                    setSearchResults([]);
                                }}
                                className="text-xs text-slate-400 hover:text-white absolute right-3.5 font-bold"
                            >
                                ×
                            </button>
                        ) : null}
                    </div>

                    {/* Menú Desplegable Autocomplete */}
                    {showResults && searchResults.length > 0 && (
                        <div className="absolute top-full mt-2 w-full bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden max-h-80 overflow-y-auto">
                            <div className="px-3 py-1.5 bg-slate-800/80 text-[10px] font-mono text-slate-400 uppercase tracking-wider flex justify-between">
                                <span>Distritos Encontrados ({searchResults.length})</span>
                                <span>INEI / CENEPRED</span>
                            </div>
                            {searchResults.map((item) => (
                                <button
                                    key={item.ubigeo}
                                    onClick={() => {
                                        loadDistrictForecast(item.ubigeo);
                                        setShowResults(false);
                                        setSearchQuery("");
                                    }}
                                    className="w-full text-left px-3.5 py-2.5 hover:bg-sky-500/10 border-b border-slate-800/50 flex items-center justify-between group transition-colors"
                                >
                                    <div>
                                        <p className="text-sm font-semibold text-white group-hover:text-sky-300">
                                            {item.distrito}
                                        </p>
                                        <p className="text-xs text-slate-400">
                                            {item.provincia} — <span className="text-slate-300 font-medium">{item.departamento}</span>
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                                            {item.ubigeo}
                                        </span>
                                        {item.declarado_ds124 && (
                                            <span className="block mt-1 text-[9px] font-bold text-amber-400">
                                                D.S. 124-PCM
                                            </span>
                                        )}
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Chips de acceso rápido */}
            <div className="flex items-center gap-1.5 mt-3 overflow-x-auto pb-1 text-xs text-slate-400 no-scrollbar">
                <span className="font-semibold text-slate-500 text-[11px] uppercase tracking-wider mr-1 shrink-0">
                    Sugerencias:
                </span>
                {quickDistricts.map((d) => (
                    <button
                        key={d.ubigeo}
                        onClick={() => loadDistrictForecast(d.ubigeo)}
                        className={`px-2.5 py-1 rounded-full text-xs shrink-0 transition-all ${
                            selectedUbigeo === d.ubigeo
                                ? "bg-sky-500 text-white font-bold shadow-lg shadow-sky-500/30"
                                : "bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800"
                        }`}
                    >
                        {d.name} <span className="text-[10px] opacity-70">({d.dept})</span>
                    </button>
                ))}
            </div>

            {/* Estado de Carga */}
            {loading && (
                <div className="py-20 flex flex-col items-center justify-center text-center space-y-3">
                    <RefreshCw className="w-10 h-10 text-sky-400 animate-spin" />
                    <p className="text-sm text-slate-300 font-medium">
                        Consultando telemetría de alta resolución Open-Meteo Pro (ECMWF IFS 9km)...
                    </p>
                    <p className="text-xs text-slate-500 font-mono">
                        Obteniendo perfil térmico, CAPE convectivo, 4 capas de suelo y viento
                    </p>
                </div>
            )}

            {/* Error */}
            {!loading && error && (
                <div className="my-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-center justify-between">
                    <span>{error}</span>
                    <button
                        onClick={() => loadDistrictForecast(selectedUbigeo)}
                        className="px-3 py-1 bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 rounded text-xs font-bold"
                    >
                        Reintentar
                    </button>
                </div>
            )}

            {/* Contenido Principal con Datos */}
            {!loading && forecastData && (
                <div className="mt-4 space-y-5">
                    {/* -------------------------------------------------------------
                        2. TÍTULO DE UBICACIÓN
                       ------------------------------------------------------------- */}
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <div>
                            <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight flex items-center gap-2">
                                <span>
                                    {forecastData.metadata.provincia === forecastData.metadata.distrito
                                        ? `Provincia de ${forecastData.metadata.provincia}`
                                        : `Distrito de ${forecastData.metadata.distrito}`}
                                </span>
                                <span className="text-sky-400 font-normal">
                                    — {forecastData.metadata.departamento}
                                </span>
                            </h2>
                            <p className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                                <MapPin className="w-3.5 h-3.5 text-rose-400" />
                                <span>UBIGEO: {forecastData.metadata.ubigeo}</span>
                                <span>•</span>
                                <span>Población: {forecastData.metadata.poblacion.toLocaleString()} hab.</span>
                                {forecastData.metadata.declarado_ds124 && (
                                    <>
                                        <span>•</span>
                                        <span className="text-amber-400 font-bold">Emergencia FEN (D.S. 124-2026-PCM)</span>
                                    </>
                                )}
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-[11px] font-mono text-slate-400 bg-slate-900 border border-slate-800 px-2.5 py-1 rounded">
                                Modelo: <strong className="text-sky-300">ECMWF IFS (9km)</strong>
                            </span>
                            <button
                                onClick={() => loadDistrictForecast(selectedUbigeo)}
                                title="Actualizar datos"
                                className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition"
                            >
                                <RefreshCw className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </div>

                    {/* -------------------------------------------------------------
                        3. HERO CARD: CONDICIONES ACTUALES (ESTILO CLIMA PERÚ)
                       ------------------------------------------------------------- */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 bg-slate-900/60 border border-slate-800 rounded-xl p-4 md:p-6 items-center">
                        {/* Lado Izquierdo: Icono + Temperatura Gigante + Viento */}
                        <div className="lg:col-span-5 flex items-center gap-4 sm:gap-6 border-b lg:border-b-0 lg:border-r border-slate-800/80 pb-4 lg:pb-0 lg:pr-6">
                            <div className="shrink-0">
                                {renderWeatherIcon(forecastData.current.icon_type, "xl")}
                            </div>
                            <div>
                                <div className="flex items-baseline">
                                    <span className="text-6xl sm:text-7xl font-black text-white tracking-tighter">
                                        {forecastData.current.temperature}°
                                    </span>
                                </div>
                                <div className="mt-1 space-y-0.5">
                                    <p className="text-sm font-semibold text-slate-200">
                                        {forecastData.current.weather_desc}
                                    </p>
                                    <div className="flex items-center gap-3 text-xs text-slate-400 font-mono">
                                        <span className="flex items-center gap-1 font-bold text-slate-300">
                                            <span className="text-sky-400 text-base font-bold">
                                                {forecastData.current.wind_arrow}
                                            </span>
                                            Viento {forecastData.current.wind_speed_kmh}km/h
                                        </span>
                                        <span>•</span>
                                        <span>Sensación {forecastData.current.apparent_temperature}°</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Lado Derecho: 4 Métricas de la imagen (Nubes, Humedad, UV, Presión) */}
                        <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-4 gap-3">
                            {/* NUBES */}
                            <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3">
                                <div className="flex items-center gap-2 text-slate-400 text-xs font-mono uppercase tracking-wider mb-1">
                                    <Cloud className="w-4 h-4 text-sky-400" />
                                    <span>NUBES</span>
                                </div>
                                <p className="text-lg font-bold text-white">
                                    {forecastData.current.cloud_cover_pct}%
                                </p>
                            </div>

                            {/* HUMEDAD */}
                            <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3">
                                <div className="flex items-center gap-2 text-slate-400 text-xs font-mono uppercase tracking-wider mb-1">
                                    <Droplets className="w-4 h-4 text-blue-400" />
                                    <span>HUMEDAD</span>
                                </div>
                                <p className="text-lg font-bold text-white">
                                    {forecastData.current.relative_humidity_pct}%
                                </p>
                            </div>

                            {/* RADIACIÓN UV */}
                            <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3">
                                <div className="flex items-center gap-2 text-slate-400 text-xs font-mono uppercase tracking-wider mb-1">
                                    <SunMedium className="w-4 h-4 text-amber-400" />
                                    <span>RAD. UV</span>
                                </div>
                                <div>
                                    {renderUvBadge(forecastData.current.uv_index, forecastData.current.uv_level)}
                                </div>
                            </div>

                            {/* PRESIÓN */}
                            <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3">
                                <div className="flex items-center gap-2 text-slate-400 text-xs font-mono uppercase tracking-wider mb-1">
                                    <Gauge className="w-4 h-4 text-emerald-400" />
                                    <span>PRESIÓN</span>
                                </div>
                                <p className="text-lg font-bold text-white font-mono">
                                    {forecastData.current.pressure_hpa} <span className="text-xs font-normal text-slate-400">hPa</span>
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* BARRA TÁCTICA COEN: CAPE + HUMEDAD SUELO 4 CAPAS */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-gradient-to-r from-slate-900/90 to-slate-950 border border-sky-900/30 rounded-xl p-3.5">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
                                <Zap className="w-5 h-5 text-yellow-400" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-mono font-bold text-slate-300">
                                        ENERGÍA CONVECTIVA (CAPE):
                                    </span>
                                    <span className="text-sm font-bold text-yellow-300 font-mono">
                                        {forecastData.current.cape_j_kg} J/kg
                                    </span>
                                </div>
                                <p className="text-[11px] text-slate-400">
                                    {forecastData.current.cape_j_kg > 1000
                                        ? "⚠️ Inestabilidad severa: Potencial formación de tormentas convectivas y huaicos."
                                        : "Atmósfera estable: Bajo riesgo de lluvias torrenciales inmediatas."}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
                                <Layers className="w-5 h-5 text-emerald-400" />
                            </div>
                            <div className="w-full">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-mono font-bold text-slate-300">
                                        HUMEDAD DE SUELO (4 CAPAS):
                                    </span>
                                    <span className="text-sm font-bold text-emerald-300 font-mono">
                                        {forecastData.current.soil_moisture_pct}% Sat.
                                    </span>
                                </div>
                                <div className="grid grid-cols-4 gap-1 mt-1 text-[10px] font-mono text-slate-400">
                                    <div className="bg-slate-800/80 px-1 py-0.5 rounded text-center">
                                        0-7cm: <strong className="text-slate-200">{forecastData.current.soil_4_capas.superficial_0_7cm}%</strong>
                                    </div>
                                    <div className="bg-slate-800/80 px-1 py-0.5 rounded text-center">
                                        7-28cm: <strong className="text-slate-200">{forecastData.current.soil_4_capas.radicular_7_28cm}%</strong>
                                    </div>
                                    <div className="bg-slate-800/80 px-1 py-0.5 rounded text-center">
                                        28-100cm: <strong className="text-slate-200">{forecastData.current.soil_4_capas.talud_28_100cm}%</strong>
                                    </div>
                                    <div className="bg-slate-800/80 px-1 py-0.5 rounded text-center">
                                        100-255cm: <strong className="text-slate-200">{forecastData.current.soil_4_capas.profunda_100_255cm}%</strong>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* -------------------------------------------------------------
                        4. PESTAÑAS: DÍAS | HORAS | FIN DE SEMANA
                       ------------------------------------------------------------- */}
                    <div className="flex items-center justify-between border-b border-slate-800">
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setActiveTab("dias")}
                                className={`px-4 py-2 rounded-t-lg text-sm font-bold transition-all border-b-2 ${
                                    activeTab === "dias"
                                        ? "border-sky-400 text-sky-400 bg-sky-500/10"
                                        : "border-transparent text-slate-400 hover:text-white"
                                }`}
                            >
                                Días
                            </button>
                            <button
                                onClick={() => setActiveTab("horas")}
                                className={`px-4 py-2 rounded-t-lg text-sm font-bold transition-all border-b-2 ${
                                    activeTab === "horas"
                                        ? "border-sky-400 text-sky-400 bg-sky-500/10"
                                        : "border-transparent text-slate-400 hover:text-white"
                                }`}
                            >
                                Horas (24h)
                            </button>
                            <button
                                onClick={() => setActiveTab("fin_semana")}
                                className={`px-4 py-2 rounded-t-lg text-sm font-bold transition-all border-b-2 ${
                                    activeTab === "fin_semana"
                                        ? "border-sky-400 text-sky-400 bg-sky-500/10"
                                        : "border-transparent text-slate-400 hover:text-white"
                                }`}
                            >
                                Fin de semana
                            </button>
                        </div>

                        {activeTab === "dias" && (
                            <div className="hidden sm:flex items-center gap-1 text-slate-400">
                                <button
                                    onClick={() => scrollTable("left")}
                                    className="p-1 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 transition"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => scrollTable("right")}
                                    className="p-1 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 transition"
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        )}
                    </div>

                    {/* -------------------------------------------------------------
                        5. CONTENIDO DE PESTAÑA: TABLA 7 DÍAS (COMO EN LA IMAGEN)
                       ------------------------------------------------------------- */}
                    {activeTab === "dias" && (
                        <div className="relative">
                            <div
                                ref={tableScrollRef}
                                className="overflow-x-auto pb-4 no-scrollbar border border-slate-800 rounded-xl bg-slate-900/40"
                            >
                                <table className="w-full text-center border-collapse min-w-[700px]">
                                    <thead>
                                        {/* Fila Cabecera con Días y Temperaturas Máx/Mín */}
                                        <tr className="border-b border-slate-800 bg-slate-950/70">
                                            <th className="p-3 text-left w-24 text-xs font-mono text-slate-400">
                                                PARÁMETRO
                                            </th>
                                            {forecastData.days.map((day) => (
                                                <th key={day.date} className="p-3 min-w-[100px]">
                                                    <p className="text-sm font-black text-white">
                                                        {day.day_short}
                                                    </p>
                                                    <p className="text-[11px] text-slate-400 font-mono">
                                                        {day.date_formatted}
                                                    </p>
                                                    <p className="text-xs font-bold text-slate-300 mt-1 font-mono">
                                                        <span className="text-amber-400">↑ {day.temp_max}°</span>{" "}
                                                        <span className="text-sky-400">↓ {day.temp_min}°</span>
                                                    </p>
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-800/60 text-xs">
                                        {/* FRANJA 08:00 */}
                                        <tr className="hover:bg-slate-800/20 transition">
                                            <td className="p-3 text-left font-bold text-slate-400 font-mono">
                                                08:00
                                            </td>
                                            {forecastData.days.map((day) => (
                                                <td key={`08-${day.date}`} className="p-3">
                                                    <div className="flex flex-col items-center gap-1">
                                                        {renderWeatherIcon(day.slots.slot_08.icon_type, "sm")}
                                                        <span className="font-bold text-slate-200">
                                                            {day.slots.slot_08.temp}°
                                                        </span>
                                                    </div>
                                                </td>
                                            ))}
                                        </tr>

                                        {/* FRANJA 14:00 */}
                                        <tr className="hover:bg-slate-800/20 transition bg-slate-900/30">
                                            <td className="p-3 text-left font-bold text-slate-400 font-mono">
                                                14:00
                                            </td>
                                            {forecastData.days.map((day) => (
                                                <td key={`14-${day.date}`} className="p-3">
                                                    <div className="flex flex-col items-center gap-1">
                                                        {renderWeatherIcon(day.slots.slot_14.icon_type, "sm")}
                                                        <span className="font-bold text-slate-200">
                                                            {day.slots.slot_14.temp}°
                                                        </span>
                                                    </div>
                                                </td>
                                            ))}
                                        </tr>

                                        {/* FRANJA 20:00 */}
                                        <tr className="hover:bg-slate-800/20 transition">
                                            <td className="p-3 text-left font-bold text-slate-400 font-mono">
                                                20:00
                                            </td>
                                            {forecastData.days.map((day) => (
                                                <td key={`20-${day.date}`} className="p-3">
                                                    <div className="flex flex-col items-center gap-1">
                                                        {renderWeatherIcon(day.slots.slot_20.icon_type, "sm")}
                                                        <span className="font-bold text-slate-200">
                                                            {day.slots.slot_20.temp}°
                                                        </span>
                                                    </div>
                                                </td>
                                            ))}
                                        </tr>

                                        {/* LLUVIA */}
                                        <tr className="hover:bg-slate-800/20 transition">
                                            <td className="p-3 text-left font-bold text-blue-400 font-mono">
                                                Lluvia
                                            </td>
                                            {forecastData.days.map((day) => (
                                                <td key={`rain-${day.date}`} className="p-3">
                                                    <span className={`font-mono font-bold ${
                                                        day.rain_mm > 10 ? "text-amber-400" : "text-slate-300"
                                                    }`}>
                                                        {day.rain_mm} mm
                                                    </span>
                                                </td>
                                            ))}
                                        </tr>

                                        {/* NIEVE / GRANIZO */}
                                        <tr className="hover:bg-slate-800/20 transition">
                                            <td className="p-3 text-left font-bold text-cyan-300 font-mono">
                                                Nieve
                                            </td>
                                            {forecastData.days.map((day) => (
                                                <td key={`snow-${day.date}`} className="p-3 text-slate-400 font-mono">
                                                    {day.snow_cm} cm
                                                </td>
                                            ))}
                                        </tr>

                                        {/* VIENTO */}
                                        <tr className="hover:bg-slate-800/20 transition bg-slate-900/30">
                                            <td className="p-3 text-left font-bold text-slate-400 font-mono">
                                                Viento
                                            </td>
                                            {forecastData.days.map((day) => (
                                                <td key={`wind-${day.date}`} className="p-3">
                                                    <div className="flex items-center justify-center gap-1 text-slate-300 font-mono">
                                                        <span className="text-sky-400 text-sm font-bold">
                                                            {day.wind_arrow}
                                                        </span>
                                                        <span>{day.wind_speed_kmh} km/h</span>
                                                    </div>
                                                </td>
                                            ))}
                                        </tr>

                                        {/* AMANECER */}
                                        <tr className="hover:bg-slate-800/20 transition">
                                            <td className="p-3 text-left font-bold text-amber-400 font-mono flex items-center gap-1.5">
                                                <Sunrise className="w-3.5 h-3.5" />
                                                <span>Amanecer</span>
                                            </td>
                                            {forecastData.days.map((day) => (
                                                <td key={`sr-${day.date}`} className="p-3 text-slate-400 font-mono">
                                                    {day.sunrise}
                                                </td>
                                            ))}
                                        </tr>

                                        {/* ATARDECER */}
                                        <tr className="hover:bg-slate-800/20 transition">
                                            <td className="p-3 text-left font-bold text-rose-400 font-mono flex items-center gap-1.5">
                                                <Sunset className="w-3.5 h-3.5" />
                                                <span>Atardecer</span>
                                            </td>
                                            {forecastData.days.map((day) => (
                                                <td key={`ss-${day.date}`} className="p-3 text-slate-400 font-mono">
                                                    {day.sunset}
                                                </td>
                                            ))}
                                        </tr>

                                        {/* ALERTA C2 / SINAGERD */}
                                        <tr className="hover:bg-slate-800/20 transition bg-slate-950/60">
                                            <td className="p-3 text-left font-bold text-sky-400 font-mono">
                                                Riesgo C2
                                            </td>
                                            {forecastData.days.map((day) => {
                                                const colors = {
                                                    VERDE: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
                                                    AMARILLO: "bg-yellow-500/20 text-yellow-300 border-yellow-500/40",
                                                    NARANJA: "bg-amber-500/20 text-amber-300 border-amber-500/40",
                                                    ROJO: "bg-rose-500/25 text-rose-300 border-rose-500/50 animate-pulse font-black"
                                                };
                                                return (
                                                    <td key={`risk-${day.date}`} className="p-3">
                                                        <span className={`px-2 py-0.5 rounded text-[10px] border font-mono uppercase ${colors[day.nivel_riesgo_quebrada]}`}>
                                                            {day.nivel_riesgo_quebrada}
                                                        </span>
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* -------------------------------------------------------------
                        6. PESTAÑA: HORAS (24H SCROLL HORIZONTAL)
                       ------------------------------------------------------------- */}
                    {activeTab === "horas" && (
                        <div className="space-y-3">
                            <p className="text-xs text-slate-400 font-mono">
                                Evolución térmica y probabilidad de precipitación en las próximas 24 horas (Open-Meteo Pro Hourly):
                            </p>
                            <div className="flex gap-2.5 overflow-x-auto pb-4 no-scrollbar">
                                {forecastData.hours_24.map((h, idx) => (
                                    <div
                                        key={idx}
                                        className="shrink-0 w-24 bg-slate-900 border border-slate-800 hover:border-sky-500/50 rounded-xl p-3 text-center space-y-2 transition"
                                    >
                                        <p className="text-xs font-mono font-bold text-slate-300">
                                            {h.time}
                                        </p>
                                        <div className="flex justify-center">
                                            {renderWeatherIcon(h.icon_type, "sm")}
                                        </div>
                                        <p className="text-base font-bold text-white">
                                            {h.temp}°
                                        </p>
                                        <div className="space-y-1 text-[10px] font-mono">
                                            <p className="text-blue-400 font-semibold">
                                                💧 {h.prob_rain}%
                                            </p>
                                            {h.rain_mm > 0 && (
                                                <p className="text-slate-300 font-bold">
                                                    {h.rain_mm}mm
                                                </p>
                                            )}
                                            <p className="text-slate-400">
                                                💨 {h.wind_speed_kmh}k/h
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* -------------------------------------------------------------
                        7. PESTAÑA: FIN DE SEMANA
                       ------------------------------------------------------------- */}
                    {activeTab === "fin_semana" && (
                        <div className="space-y-4">
                            <div className="p-4 rounded-xl bg-gradient-to-r from-sky-950/40 to-slate-900 border border-sky-800/40">
                                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-sky-400" />
                                    <span>Planificación Operativa para el Fin de Semana</span>
                                </h3>
                                <p className="text-xs text-slate-400 mt-1">
                                    Reporte táctico para cuadrillas municipales, ferias de quebrada y comités de defensa civil:
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {forecastData.weekend.map((day) => (
                                    <div
                                        key={day.date}
                                        className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3"
                                    >
                                        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                                            <div>
                                                <p className="text-base font-bold text-white">
                                                    {day.day_short === "Sáb" ? "Sábado" : "Domingo"} ({day.date_formatted})
                                                </p>
                                                <p className="text-xs text-slate-400 font-medium">
                                                    {day.weather_desc}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-lg font-black text-amber-400 font-mono">
                                                    {day.temp_max}°
                                                </span>
                                                <span className="text-xs text-sky-400 font-mono block">
                                                    Mín {day.temp_min}°
                                                </span>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-3 gap-2 text-center text-xs">
                                            <div className="bg-slate-950 p-2 rounded">
                                                <span className="text-slate-400 block text-[10px]">Lluvia Total</span>
                                                <strong className="text-blue-400 font-mono">{day.rain_mm} mm</strong>
                                            </div>
                                            <div className="bg-slate-950 p-2 rounded">
                                                <span className="text-slate-400 block text-[10px]">Prob. Máx</span>
                                                <strong className="text-sky-300 font-mono">{day.prob_precip_max}%</strong>
                                            </div>
                                            <div className="bg-slate-950 p-2 rounded">
                                                <span className="text-slate-400 block text-[10px]">Viento</span>
                                                <strong className="text-slate-200 font-mono">{day.wind_speed_kmh} km/h</strong>
                                            </div>
                                        </div>

                                        <div className="p-2.5 rounded bg-slate-950/70 border border-slate-800 text-xs flex items-center justify-between">
                                            <span className="text-slate-400">Nivel de Riesgo Municipal:</span>
                                            <span className={`px-2 py-0.5 rounded font-mono font-bold ${
                                                day.nivel_riesgo_quebrada === "VERDE"
                                                    ? "text-emerald-400 bg-emerald-500/10"
                                                    : "text-amber-400 bg-amber-500/10"
                                            }`}>
                                                {day.nivel_riesgo_quebrada}
                                            </span>
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
