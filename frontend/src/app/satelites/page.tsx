"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
    Satellite,
    Calendar,
    Layers,
    Play,
    Pause,
    RotateCcw,
    ChevronLeft,
    ChevronRight,
    Compass,
    Sliders,
    ShieldAlert,
    ExternalLink,
    Maximize2,
    Eye,
    RefreshCw,
    MapPin,
    ArrowLeft
} from "lucide-react";
import { API_BASE } from "@/config/api";

// Configuración de capas satelitales NASA GIBS (EPSG:3857)
const NASA_LAYERS = [
    {
        id: "MODIS_Aqua_CorrectedReflectance_TrueColor",
        nombre: "Aqua MODIS (Color Verdadero)",
        sensor: "NASA EOS AQUA / MODIS",
        resolucion: "250m",
        descripcion: "Imagen fotorrealista diurna (paso vespertino ~13:30 local). Identificación de desbordes e inundaciones.",
        badge: "AQUA"
    },
    {
        id: "MODIS_Terra_CorrectedReflectance_TrueColor",
        nombre: "Terra MODIS (Color Verdadero)",
        sensor: "NASA EOS TERRA / MODIS",
        resolucion: "250m",
        descripcion: "Imagen fotorrealista matutina (~10:30 local). Permite comparar la evolución del mismo día antes y después.",
        badge: "TERRA"
    },
    {
        id: "VIIRS_SNPP_CorrectedReflectance_TrueColor",
        nombre: "VIIRS Suomi-NPP (Alta Resolución)",
        sensor: "Suomi NPP / VIIRS",
        resolucion: "375m",
        descripcion: "Mayor nitidez espacial para caseríos, fajas marginales y cono aluvial de ríos.",
        badge: "VIIRS"
    }
];

// Presets Históricos Críticos para el Norte del Perú (Fenómeno El Niño & Ciclón Yaku)
const PRESETS_HISTORICOS = [
    { fecha: "2026-09-24", label: "Hoy (Tiempo Real)", descripcion: "Pase orbital más reciente disponible" },
    { fecha: "2023-03-10", label: "Ciclón Yaku 2023", descripcion: "Inundación masiva Piura, La Leche y quebradas" },
    { fecha: "2017-03-27", label: "FEN Costero 2017", descripcion: "Desborde catastrófico del Río Piura (2,300 m³/s)" },
    { fecha: "2017-03-15", label: "Huaicos Lima 2017", descripcion: "Activación masiva de quebradas en Lurigancho-Chosica" }
];

export default function SatelitesPage() {
    const [fechaSeleccionada, setFechaSeleccionada] = useState<string>("2026-09-24");
    const [capaActiva, setCapaActiva] = useState<string>("MODIS_Aqua_CorrectedReflectance_TrueColor");
    const [opacidad, setOpacidad] = useState<number>(0.9);
    const [animando, setAnimando] = useState<boolean>(false);
    const [sectorFoco, setSectorFoco] = useState<"PIURA" | "LIMA" | "PERU">("PIURA");

    const mapRef = useRef<HTMLDivElement>(null);
    const googleMapInstance = useRef<any>(null);
    const imageMapTypeRef = useRef<any>(null);

    // Centros geográficos predefinidos
    const CENTROS = {
        PIURA: { lat: -5.194, lng: -80.632, zoom: 8 },
        LIMA: { lat: -11.94, lng: -76.85, zoom: 9 },
        PERU: { lat: -9.189, lng: -75.015, zoom: 6 }
    };

    // Carga de API Key y Google Maps
    const [apiKey, setApiKey] = useState<string>("");
    const [mapError, setMapError] = useState<string | null>(null);
    const [gmapsLoaded, setGmapsLoaded] = useState<boolean>(false);

    useEffect(() => {
        if (typeof window !== "undefined") {
            const saved = localStorage.getItem("gmaps_api_key");
            const envKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";
            setApiKey(saved || envKey);
        }
    }, []);

    // Cargar script de Google Maps si no está presente
    useEffect(() => {
        if (typeof window === "undefined") return;

        if ((window as any).google?.maps?.Map) {
            setGmapsLoaded(true);
            return;
        }

        const keyToUse = apiKey || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";
        const scriptId = "google-maps-platform-script";
        let script = document.getElementById(scriptId) as HTMLScriptElement;

        if (!script && keyToUse) {
            script = document.createElement("script");
            script.id = scriptId;
            script.src = `https://maps.googleapis.com/maps/api/js?key=${keyToUse}&loading=async`;
            script.async = true;
            script.defer = true;
            script.onload = () => {
                setGmapsLoaded(true);
            };
            script.onerror = () => {
                setMapError("Error de conexión al cargar Google Maps Platform.");
            };
            document.head.appendChild(script);
        } else if (script) {
            script.addEventListener("load", () => setGmapsLoaded(true));
        }

        const interval = setInterval(() => {
            if ((window as any).google?.maps?.Map) {
                setGmapsLoaded(true);
                clearInterval(interval);
            }
        }, 300);

        return () => clearInterval(interval);
    }, [apiKey]);

    // Inicializar Google Maps con capa NASA GIBS
    useEffect(() => {
        if (!mapRef.current) return;
        if (!gmapsLoaded || typeof window === "undefined" || !(window as any).google?.maps) return;

        const google = (window as any).google;
        const config = CENTROS[sectorFoco];

        try {
            const map = new google.maps.Map(mapRef.current, {
                center: { lat: config.lat, lng: config.lng },
                zoom: config.zoom,
                mapTypeId: "hybrid",
                disableDefaultUI: false,
                zoomControl: true,
                mapTypeControl: false,
                streetViewControl: false,
                fullscreenControl: false,
                backgroundColor: "#020617"
            });
            googleMapInstance.current = map;

            actualizarCapaNasa(map, capaActiva, fechaSeleccionada, opacidad);
        } catch (e: any) {
            console.error("Error al inicializar mapa satelital:", e);
            setMapError(e?.message || "Error al inicializar mapa");
        }
    }, [sectorFoco, gmapsLoaded]);

    // Función para crear o actualizar el ImageMapType de NASA GIBS
    const actualizarCapaNasa = (map: any, capa: string, fecha: string, opac: number) => {
        if (!map || !(window as any).google?.maps) return;
        const google = (window as any).google;

        // Remover capas satelitales previas si existen
        map.overlayMapTypes.clear();

        const gibsTileLayer = new google.maps.ImageMapType({
            getTileUrl: function (coord: any, zoom: number) {
                if (zoom > 9) zoom = 9;
                const maxCoord = Math.pow(2, zoom);
                if (coord.y < 0 || coord.y >= maxCoord) return "";
                const x = ((coord.x % maxCoord) + maxCoord) % maxCoord;
                return `https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/${capa}/default/${fecha}/GoogleMapsCompatible_Level9/${zoom}/${coord.y}/${x}.jpg`;
            },
            tileSize: new google.maps.Size(256, 256),
            maxZoom: 9,
            minZoom: 1,
            isPng: false,
            name: "NASA GIBS",
            opacity: opac
        });

        imageMapTypeRef.current = gibsTileLayer;
        map.overlayMapTypes.push(gibsTileLayer);
    };

    // Actualizar cuando cambia la fecha, capa u opacidad
    useEffect(() => {
        if (googleMapInstance.current) {
            actualizarCapaNasa(googleMapInstance.current, capaActiva, fechaSeleccionada, opacidad);
        }
    }, [capaActiva, fechaSeleccionada, opacidad]);

    // Control de paso de días (+1 / -1)
    const cambiarDia = (offset: number) => {
        const d = new Date(fechaSeleccionada);
        d.setDate(d.getDate() + offset);
        const newDateStr = d.toISOString().split("T")[0];
        setFechaSeleccionada(newDateStr);
    };

    // Animación automática de días sucesivos (Time-Lapse)
    useEffect(() => {
        let interval: any = null;
        if (animando) {
            interval = setInterval(() => {
                setFechaSeleccionada((prev) => {
                    const d = new Date(prev);
                    d.setDate(d.getDate() + 1);
                    return d.toISOString().split("T")[0];
                });
            }, 1800);
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [animando]);

    return (
        <div className="space-y-4 max-w-7xl mx-auto pb-16">
            {/* Header Barra Superior */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-xl">
                <div className="flex items-center gap-3">
                    <Link
                        href="/"
                        className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition flex items-center gap-1 text-xs"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>COEN</span>
                    </Link>
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-sky-500/20 text-sky-300 border border-sky-500/40 font-bold">
                                NASA GIBS • EARTHDATA
                            </span>
                            <span className="text-xs text-slate-400">Paso Orbital MODIS &amp; VIIRS</span>
                        </div>
                        <h1 className="text-lg md:text-xl font-black text-white flex items-center gap-2">
                            <Satellite className="w-5 h-5 text-sky-400" />
                            <span>Visor Multitemporal Satelital Soberano</span>
                        </h1>
                    </div>
                </div>

                {/* Selector de Sector de Foco */}
                <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
                    <button
                        onClick={() => setSectorFoco("PIURA")}
                        className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1 ${
                            sectorFoco === "PIURA"
                                ? "bg-sky-600 text-white shadow-md shadow-sky-600/30"
                                : "text-slate-400 hover:text-white"
                        }`}
                    >
                        <MapPin className="w-3.5 h-3.5" />
                        <span>Piura / Chira</span>
                    </button>
                    <button
                        onClick={() => setSectorFoco("LIMA")}
                        className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1 ${
                            sectorFoco === "LIMA"
                                ? "bg-sky-600 text-white shadow-md shadow-sky-600/30"
                                : "text-slate-400 hover:text-white"
                        }`}
                    >
                        <MapPin className="w-3.5 h-3.5" />
                        <span>Lima / Rímac</span>
                    </button>
                    <button
                        onClick={() => setSectorFoco("PERU")}
                        className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1 ${
                            sectorFoco === "PERU"
                                ? "bg-sky-600 text-white shadow-md shadow-sky-600/30"
                                : "text-slate-400 hover:text-white"
                        }`}
                    >
                        <span>Perú Nacional</span>
                    </button>
                </div>
            </div>

            {/* BARRA DE MANDO TEMPORAL MULTIDÍA (Time Machine) */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-amber-400" />
                        <span className="text-xs font-bold text-white uppercase tracking-wider">
                            Control Temporal Diario:
                        </span>
                        <div className="flex items-center gap-1 bg-slate-950 px-2 py-1 rounded-lg border border-slate-800">
                            <button
                                onClick={() => cambiarDia(-1)}
                                className="p-1 hover:bg-slate-800 text-slate-300 rounded transition"
                                title="Día Anterior"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <input
                                type="date"
                                value={fechaSeleccionada}
                                onChange={(e) => setFechaSeleccionada(e.target.value)}
                                className="bg-transparent text-sm font-mono font-bold text-amber-400 focus:outline-none px-2"
                            />
                            <button
                                onClick={() => cambiarDia(1)}
                                className="p-1 hover:bg-slate-800 text-slate-300 rounded transition"
                                title="Día Siguiente"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Presets de Desastres Históricos */}
                    <div className="flex flex-wrap items-center gap-1.5 text-xs">
                        <span className="text-[11px] text-slate-400 font-semibold mr-1">Hitos FEN:</span>
                        {PRESETS_HISTORICOS.map((p) => (
                            <button
                                key={p.fecha}
                                onClick={() => setFechaSeleccionada(p.fecha)}
                                className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition border ${
                                    fechaSeleccionada === p.fecha
                                        ? "bg-amber-500/20 text-amber-300 border-amber-500"
                                        : "bg-slate-950 text-slate-400 border-slate-800 hover:text-white"
                                }`}
                                title={p.descripcion}
                            >
                                {p.label}
                            </button>
                        ))}
                    </div>

                    {/* Control de Reproducción Animada (Time-Lapse) */}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setAnimando(!animando)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition shadow ${
                                animando
                                    ? "bg-rose-600 text-white animate-pulse"
                                    : "bg-sky-600 hover:bg-sky-500 text-white"
                            }`}
                        >
                            {animando ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                            <span>{animando ? "Pausar Loop" : "Time-Lapse"}</span>
                        </button>
                    </div>
                </div>

                {/* SELECTOR DE SENSOR / PRODUCTO SATELITAL */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 pt-2 border-t border-slate-800">
                    {NASA_LAYERS.map((layer) => (
                        <div
                            key={layer.id}
                            onClick={() => setCapaActiva(layer.id)}
                            className={`p-2.5 rounded-xl border cursor-pointer transition-all ${
                                capaActiva === layer.id
                                    ? "bg-sky-950/40 border-sky-500 shadow-md"
                                    : "bg-slate-950/60 border-slate-800 hover:border-slate-700 opacity-75"
                            }`}
                        >
                            <div className="flex items-center justify-between mb-1">
                                <span className="font-bold text-white text-xs">{layer.nombre}</span>
                                <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-sky-900/60 text-sky-300 border border-sky-700">
                                    {layer.badge}
                                </span>
                            </div>
                            <p className="text-[11px] text-slate-400 leading-tight">
                                {layer.descripcion}
                            </p>
                        </div>
                    ))}
                </div>

                {/* Slider de Opacidad de la Capa Satelital */}
                <div className="flex items-center justify-between gap-4 pt-1 text-xs text-slate-400">
                    <span className="font-medium flex items-center gap-1.5">
                        <Sliders className="w-3.5 h-3.5 text-sky-400" />
                        Opacidad Satélite vs Mapa Base: <b>{Math.round(opacidad * 100)}%</b>
                    </span>
                    <input
                        type="range"
                        min="0.1"
                        max="1"
                        step="0.05"
                        value={opacidad}
                        onChange={(e) => setOpacidad(parseFloat(e.target.value))}
                        className="w-48 accent-sky-500 cursor-pointer"
                    />
                </div>
            </div>

            {/* CONTENEDOR DEL MAPA SATELITAL INTERACTIVO */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-2 shadow-2xl relative">
                <div
                    ref={mapRef}
                    className="w-full h-[580px] rounded-xl overflow-hidden bg-slate-950"
                />

                {/* HUD Flotante de Telemetría Satelital */}
                <div className="absolute top-5 left-5 bg-slate-950/90 border border-slate-700/80 px-3.5 py-2.5 rounded-xl backdrop-blur text-xs z-10 space-y-1 shadow-2xl">
                    <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                        <span className="font-bold text-white uppercase tracking-wide">
                            {NASA_LAYERS.find((l) => l.id === capaActiva)?.sensor}
                        </span>
                    </div>
                    <div className="text-[11px] text-slate-300 font-mono">
                        Fecha Observada: <strong className="text-amber-400">{fechaSeleccionada}</strong>
                    </div>
                    <div className="text-[10px] text-slate-400">
                        Proyección: EPSG:3857 (Web Mercator WGS84) • Teselas WMTS Directas
                    </div>
                </div>

                {/* Enlace de Cotejo Oficial SENAMHI Piura */}
                <div className="absolute bottom-5 right-5 z-10 flex items-center gap-2">
                    <a
                        href="https://www.senamhi.gob.pe/servicios/main.php?dp=piura&p=satelites-aqua"
                        target="_blank"
                        rel="noreferrer"
                        className="bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-slate-300 px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 backdrop-blur transition shadow-xl font-medium"
                    >
                        <span>Cotejar Recorte SENAMHI Piura</span>
                        <ExternalLink className="w-3.5 h-3.5 text-sky-400" />
                    </a>
                </div>

                {/* Mensaje de Inicialización / Diagnóstico si el mapa está cargando */}
                {!gmapsLoaded && (
                    <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center z-20 rounded-xl space-y-3">
                        <Satellite className="w-10 h-10 text-sky-400 animate-spin" />
                        <div className="space-y-1 max-w-md">
                            <h3 className="text-sm font-bold text-white">Inicializando Motor Cartográfico Satelital...</h3>
                            <p className="text-xs text-slate-400">
                                Sincronizando capas orbitales de la NASA (AQUA/TERRA) sobre Google Maps Platform.
                            </p>
                            {mapError && (
                                <p className="text-xs text-amber-300 bg-amber-950/60 p-2 rounded-lg border border-amber-800 mt-2">
                                    {mapError}
                                </p>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
