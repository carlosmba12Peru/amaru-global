"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import DistrictWeatherInspector from "@/components/DistrictWeatherInspector";
import {
    Zap,
    CloudRain,
    AlertTriangle,
    ShieldAlert,
    ShieldCheck,
    MapPin,
    Search,
    Filter,
    Layers,
    Maximize2,
    Minimize2,
    ArrowLeft,
    ExternalLink,
    RefreshCw,
    ChevronRight,
    Droplets,
    Wind,
    Thermometer,
    Activity,
    Info,
    Database,
    Download,
    Eye,
    TrendingUp
} from "lucide-react";

interface SueloCapas {
    superficial_0_7cm: number;
    radicular_7_28cm: number;
    talud_28_100cm: number;
    profunda_100_255cm: number;
}

interface DistritoMeteo {
    ubigeo: string;
    departamento: string;
    provincia: string;
    distrito: string;
    latitud: number;
    longitud: number;
    poblacion: number;
    lluvia_24h: number;
    lluvia_72h: number;
    nivel_alerta: "ROJO" | "NARANJA" | "AMARILLO" | "VERDE";
    cape_j_kg: number;
    suelo_saturacion_pct: number;
    suelo_4_capas: SueloCapas;
    viento_rafagas_kmh: number;
    probabilidad_lluvia_pct: number;
    caudal_glofas_m3s: number;
    weather_code: number;
    descripcion_clima: string;
    temp_max: number;
    temp_min: number;
}

interface MeteoMatrixResponse {
    metadata: {
        norma: string;
        asunto: string;
        total_distritos_declarados: number;
        fuente_meteorologica: string;
        fecha_emision: string;
        reglas_semaforo: Record<string, string>;
    };
    estadisticas: {
        total_distritos: number;
        conteo_alertas: {
            ROJO: number;
            NARANJA: number;
            AMARILLO: number;
            VERDE: number;
        };
        poblacion_total_expuesta: number;
        poblacion_riesgo_extremo: number;
        departamentos_afectados: number;
        top_10_precipitacion: DistritoMeteo[];
        departamentos_resumen: Record<string, { total: number; ROJO: number; NARANJA: number; AMARILLO: number; VERDE: number; poblacion: number }>;
    };
    distritos: DistritoMeteo[];
}

const TACTICAL_DARK_STYLE: any[] = [
    { elementType: "geometry", stylers: [{ color: "#0f172a" }] },
    { elementType: "labels.text.stroke", stylers: [{ color: "#0f172a" }] },
    { elementType: "labels.text.fill", stylers: [{ color: "#94a3b8" }] },
    {
        featureType: "administrative.locality",
        elementType: "labels.text.fill",
        stylers: [{ color: "#38bdf8" }]
    },
    { featureType: "poi", stylers: [{ visibility: "off" }] },
    {
        featureType: "road",
        elementType: "geometry",
        stylers: [{ color: "#1e293b" }]
    },
    {
        featureType: "road",
        elementType: "geometry.stroke",
        stylers: [{ color: "#0f172a" }]
    },
    {
        featureType: "water",
        elementType: "geometry",
        stylers: [{ color: "#0284c7" }]
    },
    {
        featureType: "water",
        elementType: "labels.text.fill",
        stylers: [{ color: "#38bdf8" }]
    }
];

export default function MeteoFenConsole() {
    const [data, setData] = useState<MeteoMatrixResponse | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // Filtros
    const [filtroAlerta, setFiltroAlerta] = useState<string>("TODOS");
    const [filtroDepto, setFiltroDepto] = useState<string>("TODOS");
    const [busqueda, setBusqueda] = useState<string>("");
    const [distritoSeleccionado, setDistritoSeleccionado] = useState<DistritoMeteo | null>(null);
    const [showInspector, setShowInspector] = useState<boolean>(true);
    const [inspectorUbigeo, setInspectorUbigeo] = useState<string>("120701");

    // Estado visual y capas
    const [primaryMode, setPrimaryMode] = useState<"clima" | "alerta">("alerta");
    const [baseMap, setBaseMap] = useState<"dark" | "satellite" | "terrain">("dark");
    const [indicatorMode, setIndicatorMode] = useState<"rain" | "cape" | "soil" | "glofas">("rain");
    const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
    const [liveLoading, setLiveLoading] = useState<boolean>(false);
    const [liveReport, setLiveReport] = useState<any>(null);

    // Google Maps Platform Refs y Estados
    const [mapProvider, setMapProvider] = useState<"google" | "svg">("google");
    const [googleMapLoaded, setGoogleMapLoaded] = useState<boolean>(false);
    const [googleMapError, setGoogleMapError] = useState<string | null>(null);
    const googleMapRef = useRef<HTMLDivElement>(null);
    const googleMapInstance = useRef<any>(null);
    const markersRef = useRef<any[]>([]);
    const infoWindowRef = useRef<any>(null);

    // Paginación de tabla
    const [paginaActual, setPaginaActual] = useState<number>(1);
    const elementosPorPagina = 15;

    // Cargar datos desde el Backend
    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch("http://127.0.0.1:8000/api/meteo/ds124-matrix");
            if (!res.ok) throw new Error(`HTTP Error ${res.status}`);
            const json: MeteoMatrixResponse = await res.json();
            setData(json);
            // Seleccionar por defecto el distrito con mayor precipitación
            if (json.distritos && json.distritos.length > 0) {
                const topDist = json.distritos.find(d => d.nivel_alerta === "ROJO") || json.distritos[0];
                setDistritoSeleccionado(topDist);
            }
        } catch (err: any) {
            console.error("Error al cargar matriz Open-Meteo DS124:", err);
            setError("No se pudo conectar con el servicio meteorológico local. Reintentando...");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Consultar telemetría viva individual
    const handleConsultarLive = async (ubigeo: string) => {
        setLiveLoading(true);
        try {
            const res = await fetch(`http://127.0.0.1:8000/api/meteo/ds124-district/${ubigeo}`);
            if (res.ok) {
                const json = await res.json();
                setLiveReport(json);
            }
        } catch (e) {
            console.error("Error al consultar live district:", e);
        } finally {
            setLiveLoading(false);
        }
    };

    // Filtrar distritos
    const distritosFiltrados = useMemo(() => {
        if (!data?.distritos) return [];
        return data.distritos.filter(d => {
            const matchAlerta = filtroAlerta === "TODOS" || d.nivel_alerta === filtroAlerta;
            const matchDepto = filtroDepto === "TODOS" || d.departamento === filtroDepto;
            const q = busqueda.toLowerCase().trim();
            const matchQuery = !q ||
                d.distrito.toLowerCase().includes(q) ||
                d.provincia.toLowerCase().includes(q) ||
                d.departamento.toLowerCase().includes(q) ||
                d.ubigeo.includes(q);
            return matchAlerta && matchDepto && matchQuery;
        });
    }, [data, filtroAlerta, filtroDepto, busqueda]);

    // Lista de departamentos ordenada
    const listaDepartamentos = useMemo(() => {
        if (!data?.distritos) return [];
        const deptos = Array.from(new Set(data.distritos.map(d => d.departamento)));
        return deptos.sort();
    }, [data]);

    // Distritos paginados
    const distritosPaginados = useMemo(() => {
        const inicio = (paginaActual - 1) * elementosPorPagina;
        return distritosFiltrados.slice(inicio, inicio + elementosPorPagina);
    }, [distritosFiltrados, paginaActual]);

    const totalPaginas = Math.ceil(distritosFiltrados.length / elementosPorPagina) || 1;

    // Proyección de coordenadas a SVG (800 x 1000)
    const proyectarCoord = (lat: number, lng: number) => {
        const minLng = -81.5;
        const maxLng = -68.5;
        const minLat = -18.5;
        const maxLat = 0.0;
        const x = 60 + ((lng - minLng) / (maxLng - minLng)) * 680;
        const y = 50 + ((maxLat - lat) / (maxLat - minLat)) * 900;
        return { x: Math.max(20, Math.min(780, x)), y: Math.max(20, Math.min(980, y)) };
    };

    // Helper de color según modo operacional y variable activa
    const getColorPunto = (d: DistritoMeteo) => {
        // En Modo Alerta Oficial, rige el semáforo legal de Defensa Civil (D.S. 124-PCM)
        if (primaryMode === "alerta") {
            switch (d.nivel_alerta) {
                case "ROJO": return "#ef4444";
                case "NARANJA": return "#f97316";
                case "AMARILLO": return "#eab308";
                case "VERDE": return "#22c55e";
                default: return "#38bdf8";
            }
        }

        // En Modo 1: Situación Climática Actual (Mapa Exclusivo de Lluvias en Vivo de Hoy)
        // Solo cambia de color cuando efectivamente hay lluvias registradas hoy
        if (d.lluvia_24h >= 50.0) return "#ef4444"; // Lluvia Torrencial (> 50 mm)
        if (d.lluvia_24h >= 25.0) return "#f97316"; // Lluvia Fuerte (25-50 mm)
        if (d.lluvia_24h >= 10.0) return "#eab308"; // Lluvia Moderada (10-25 mm)
        if (d.lluvia_24h >= 1.0)  return "#22c55e"; // Lluvia Ligera (1-10 mm)
        return "#38bdf8"; // 0.0 mm: Seco / Sin Lluvia (Azul Cielo)
    };

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";
    const [isSlowLoading, setIsSlowLoading] = useState<boolean>(false);

    // 1. Cargar Google Maps Platform Script de forma segura, rápida y reactiva
    useEffect(() => {
        if (!apiKey || typeof window === "undefined") {
            setGoogleMapError("Clave API de Google Maps no configurada en .env.local.");
            return;
        }

        // Si ya está listo en window
        if ((window as any).google?.maps?.Map) {
            setGoogleMapLoaded(true);
            return;
        }

        // Watchdog de lentitud de red (5 segundos)
        const slowTimer = setTimeout(() => {
            setIsSlowLoading(true);
        }, 5000);

        // Capturar errores de autenticación/restricción de Google Maps
        (window as any).gm_authFailure = () => {
            console.error("Google Maps Platform auth failure");
            setGoogleMapError("Google Maps rechazó la autenticación. Verifica que 'Maps JavaScript API' esté habilitada y sin restricciones de dominio que bloqueen localhost en Google Cloud Console.");
        };

        // Callback oficial global
        (window as any).__gmapsMeteoInit = () => {
            if ((window as any).google?.maps?.Map) {
                setGoogleMapLoaded(true);
            }
        };

        // Polling constante por si el script ya terminó o cargó asíncronamente
        const pollInterval = setInterval(() => {
            if ((window as any).google?.maps?.Map) {
                setGoogleMapLoaded(true);
                clearInterval(pollInterval);
            }
        }, 250);

        const scriptId = "google-maps-platform-script";
        let script = document.getElementById(scriptId) as HTMLScriptElement;

        if (!script) {
            script = document.createElement("script");
            script.id = scriptId;
            script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=__gmapsMeteoInit&loading=async`;
            script.async = true;
            script.defer = true;
            script.onload = () => {
                if ((window as any).google?.maps?.Map) {
                    setGoogleMapLoaded(true);
                }
            };
            script.onerror = () => {
                setGoogleMapError("Error al descargar la librería de Google Maps Platform (revisa tu conexión o firewall).");
            };
            document.head.appendChild(script);
        } else {
            if ((window as any).google?.maps?.Map) {
                setGoogleMapLoaded(true);
            } else {
                script.addEventListener("load", () => {
                    if ((window as any).google?.maps?.Map) {
                        setGoogleMapLoaded(true);
                    }
                });
            }
        }

        return () => {
            clearTimeout(slowTimer);
            clearInterval(pollInterval);
        };
    }, [apiKey]);

    // 2. Inicializar Mapa cuando googleMapLoaded sea true y el ref esté disponible
    useEffect(() => {
        if (!googleMapLoaded || !googleMapRef.current || mapProvider !== "google") return;
        if (googleMapInstance.current) return;

        try {
            const google = (window as any).google;
            const centroPeru = { lat: -9.189967, lng: -75.015152 };

            const map = new google.maps.Map(googleMapRef.current, {
                center: centroPeru,
                zoom: 6,
                mapTypeId: baseMap === "dark" ? "roadmap" : baseMap === "satellite" ? google.maps.MapTypeId.HYBRID : google.maps.MapTypeId.TERRAIN,
                styles: baseMap === "dark" ? TACTICAL_DARK_STYLE : [],
                disableDefaultUI: false,
                zoomControl: true,
                mapTypeControl: false,
                streetViewControl: false,
                fullscreenControl: false,
                backgroundColor: "#020617"
            });

            googleMapInstance.current = map;
            infoWindowRef.current = new google.maps.InfoWindow();
        } catch (e: any) {
            console.error("Error inicializando mapa Google:", e);
            setGoogleMapError(e.message || "Error al inicializar Google Maps");
        }
    }, [googleMapLoaded, mapProvider]);

    // 3. Sincronizar estilo de mapa base (dark, satellite, terrain) con Google Maps
    useEffect(() => {
        if (!googleMapInstance.current || !(window as any).google?.maps) return;
        const google = (window as any).google;

        if (baseMap === "dark") {
            googleMapInstance.current.setMapTypeId("roadmap");
            googleMapInstance.current.setOptions({ styles: TACTICAL_DARK_STYLE });
        } else if (baseMap === "satellite") {
            googleMapInstance.current.setMapTypeId(google.maps.MapTypeId.HYBRID);
            googleMapInstance.current.setOptions({ styles: [] });
        } else if (baseMap === "terrain") {
            googleMapInstance.current.setMapTypeId(google.maps.MapTypeId.TERRAIN);
            googleMapInstance.current.setOptions({ styles: [] });
        }
    }, [baseMap]);

    // 4. Renderizar y actualizar los 893 marcadores en Google Maps
    useEffect(() => {
        if (!googleMapInstance.current || !(window as any).google?.maps || mapProvider !== "google") return;
        const google = (window as any).google;

        // Limpiar marcadores existentes
        markersRef.current.forEach(m => m.setMap(null));
        markersRef.current = [];

        // Generar marcadores vectoriales para los distritos filtrados
        distritosFiltrados.forEach((d) => {
            if (d.latitud == null || d.longitud == null) return;
            const color = getColorPunto(d);
            const isRed = primaryMode === "clima" ? d.lluvia_24h >= 50.0 : d.nivel_alerta === "ROJO";
            const isSelected = distritoSeleccionado?.ubigeo === d.ubigeo;

            const marker = new google.maps.Marker({
                position: { lat: d.latitud, lng: d.longitud },
                map: googleMapInstance.current,
                title: primaryMode === "clima"
                    ? `[CLIMA] ${d.distrito}: ${d.descripcion_clima} | Lluvia: ${d.lluvia_24h}mm | Temp: ${d.temp_min}°-${d.temp_max}°C`
                    : `[ALERTA ${d.nivel_alerta}] ${d.distrito} (${d.provincia}, ${d.departamento}) • Población en riesgo: ${d.poblacion.toLocaleString()} hab.`,
                icon: {
                    path: google.maps.SymbolPath.CIRCLE,
                    fillColor: color,
                    fillOpacity: isSelected ? 1.0 : isRed ? 0.95 : 0.85,
                    scale: isSelected ? 8.5 : isRed ? 6 : 4.2,
                    strokeColor: isSelected ? "#38bdf8" : "#020617",
                    strokeWeight: isSelected ? 2.5 : 1.2
                },
                zIndex: isSelected ? 9999 : isRed ? 1000 : 100
            });

            marker.addListener("click", () => {
                setDistritoSeleccionado(d);
                if (infoWindowRef.current) {
                    const content = primaryMode === "clima" ? `
                        <div style="color: #0f172a; font-family: system-ui, -apple-system, sans-serif; font-size: 12px; padding: 6px; min-width: 260px; line-height: 1.45;">
                            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px; padding-bottom:3px; border-bottom: 1px solid #e2e8f0;">
                                <div style="display:flex; align-items:center; gap:4px;">
                                    <span style="font-size:14px;">🌦️</span>
                                    <strong style="font-size: 13px; color: #0284c7;">${d.distrito}</strong>
                                </div>
                                <span style="background: #0284c7; color: #ffffff; padding: 2px 6px; border-radius: 4px; font-weight: bold; font-size: 10px;">
                                    OPEN-METEO
                                </span>
                            </div>
                            <div style="color: #64748b; font-size: 11px; margin-bottom: 6px;">
                                ${d.provincia}, ${d.departamento} (UBIGEO: ${d.ubigeo})
                            </div>
                            <div style="background: #f8fafc; border-radius: 6px; padding: 6px; margin-bottom: 6px; border: 1px solid #e2e8f0;">
                                <div style="font-weight:bold; color: #1e293b; font-size: 11.5px;">🌤️ Condición: ${d.descripcion_clima}</div>
                                <div style="color: #475569; font-size: 11px; margin-top:2px;">🌡️ Temp: <b>${d.temp_min}°C – ${d.temp_max}°C</b> • 💨 Viento: <b>${d.viento_rafagas_kmh} km/h</b></div>
                            </div>
                            <div style="font-size: 11px; color: #334155; display: flex; flex-direction: column; gap: 3px;">
                                <div style="display:flex; justify-content:space-between;">
                                    <span>🌧️ <b>Lluvia 24h:</b> ${d.lluvia_24h} mm</span>
                                    <span style="color:#0284c7; font-size:10px;">(72h: ${d.lluvia_72h} mm)</span>
                                </div>
                                <div>⚡ <b>CAPE Gatillo:</b> ${d.cape_j_kg} J/kg</div>
                                <div>💧 <b>Suelo Talud:</b> ${d.suelo_saturacion_pct}% saturado</div>
                                <div>🌊 <b>Caudal Fluvial GloFAS:</b> ${d.caudal_glofas_m3s} m³/s</div>
                            </div>
                        </div>
                    ` : `
                        <div style="color: #0f172a; font-family: system-ui, -apple-system, sans-serif; font-size: 12px; padding: 6px; min-width: 260px; line-height: 1.45;">
                            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px; padding-bottom:3px; border-bottom: 1px solid #e2e8f0;">
                                <div style="display:flex; align-items:center; gap:4px;">
                                    <span style="font-size:14px;">🚨</span>
                                    <strong style="font-size: 13px; color: #0f172a;">${d.distrito}</strong>
                                </div>
                                <span style="background: ${color}; color: #ffffff; padding: 2px 7px; border-radius: 4px; font-weight: 800; font-size: 10.5px; letter-spacing:0.5px;">
                                    ALERTA ${d.nivel_alerta}
                                </span>
                            </div>
                            <div style="color: #64748b; font-size: 11px; margin-bottom: 6px;">
                                ${d.provincia}, ${d.departamento} (D.S. 124-2026-PCM)
                            </div>
                            <div style="background: ${isRed ? '#fef2f2' : '#f8fafc'}; border-radius: 6px; padding: 6px; margin-bottom: 6px; border: 1px solid ${isRed ? '#fecaca' : '#e2e8f0'};">
                                <div style="font-weight:bold; color: ${isRed ? '#991b1b' : '#334155'}; font-size: 11px;">
                                    👥 Población en Riesgo: <b>${d.poblacion.toLocaleString()} hab.</b>
                                </div>
                                <div style="color: #64748b; font-size: 10px; margin-top:2px;">
                                    Criterio: Lluvia ${d.lluvia_24h} mm + Suelo ${d.suelo_saturacion_pct}%
                                </div>
                            </div>
                            <div style="background: #0f172a; color: #f8fafc; padding: 5px 7px; border-radius: 5px; font-size: 10.5px; font-weight: 500;">
                                ${d.nivel_alerta === 'ROJO' ? '⚠️ EVACUACIÓN Y ALERTA MÁXIMA EN QUEBRADAS' : d.nivel_alerta === 'NARANJA' ? '⚡ ALISTAMIENTO DE MAQUINARIA (D.U. 031)' : d.nivel_alerta === 'AMARILLO' ? '📢 MONITOREO Y LIMPIEZA PREVENTIVA' : '✅ VIGILANCIA DE RUTINA'}
                            </div>
                        </div>
                    `;
                    infoWindowRef.current.setContent(content);
                    infoWindowRef.current.open(googleMapInstance.current, marker);
                }
            });

            markersRef.current.push(marker);
        });
    }, [distritosFiltrados, indicatorMode, googleMapLoaded, mapProvider, primaryMode]);

    // 5. Centrar suavemente en el distrito seleccionado cuando cambia
    useEffect(() => {
        if (!googleMapInstance.current || !distritoSeleccionado?.latitud || !distritoSeleccionado?.longitud || mapProvider !== "google") return;
        googleMapInstance.current.panTo({
            lat: distritoSeleccionado.latitud,
            lng: distritoSeleccionado.longitud
        });
    }, [distritoSeleccionado, mapProvider]);

    // 6. Manejar redimensionamiento al alternar proveedores de mapa
    useEffect(() => {
        if (mapProvider === "google" && googleMapInstance.current && (window as any).google?.maps) {
            setTimeout(() => {
                (window as any).google.maps.event.trigger(googleMapInstance.current, "resize");
                if (distritoSeleccionado?.latitud && distritoSeleccionado?.longitud) {
                    googleMapInstance.current.panTo({
                        lat: distritoSeleccionado.latitud,
                        lng: distritoSeleccionado.longitud
                    });
                }
            }, 100);
        }
    }, [mapProvider]);

    return (
        <div className={`w-full min-h-screen bg-slate-950 text-slate-100 font-sans transition-all duration-300 ${
            isFullscreen ? "fixed inset-0 z-[99999] p-3 overflow-y-auto" : "p-4 md:p-6"
        }`}>
            {/* Cabecera Táctica de Comando */}
            <header className="mb-6 space-y-4">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                    <div>
                        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                            <span className="px-2 py-0.5 rounded bg-blue-950 text-blue-400 border border-blue-800 text-[10px] font-mono font-bold tracking-wider">
                                COEN C2 • METEOROLOGÍA PRO
                            </span>
                            <span className="px-2 py-0.5 rounded bg-red-950 text-red-300 border border-red-800 text-[10px] font-mono font-bold">
                                D.S. Nº 124-2026-PCM (893 DISTRITOS)
                            </span>
                            <span className="px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800 text-[10px] font-mono flex items-center gap-1">
                                <Zap className="w-3 h-3 text-amber-400" />
                                ECMWF IFS 9km + GLOFAS
                            </span>
                        </div>
                        <h1 className="text-xl md:text-2xl font-black tracking-tight text-white flex items-center gap-2.5">
                            <CloudRain className="w-6 h-6 text-sky-400" />
                            <span>CONSOLA METEOROLÓGICA DE CONTINGENCIA FEN</span>
                            <span className="text-sm font-semibold text-slate-400 font-mono">
                                (893 Distritos Declarados)
                            </span>
                        </h1>
                        <p className="text-xs text-slate-400 max-w-4xl mt-1">
                            Evaluación cuantitativa de precipitaciones en 24h, inestabilidad convectiva CAPE (gatillo de huaicos),
                            saturación edáfica en 4 estratos y caudales fluviales para los 893 distritos en estado de emergencia.
                        </p>
                    </div>

                    <div className="flex items-center gap-2 self-start lg:self-center shrink-0">
                        <button
                            onClick={() => setShowInspector(!showInspector)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-950/90 hover:bg-sky-900 border border-sky-600/60 text-xs font-bold text-sky-300 hover:text-white transition shadow-sm"
                            title="Abrir o cerrar el Inspector Climático Distrital (Portal Clima Perú)"
                        >
                            <CloudRain className="w-3.5 h-3.5 text-sky-400" />
                            <span>{showInspector ? "Ocultar Portal Clima" : "Inspector Distrital (1,891)"}</span>
                        </button>
                        <button
                            onClick={fetchData}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-750 text-xs font-semibold text-slate-300 hover:text-white transition shadow-sm"
                            title="Actualizar datos meteorológicos"
                        >
                            <RefreshCw className={`w-3.5 h-3.5 text-sky-400 ${loading ? "animate-spin" : ""}`} />
                            <span>Sincronizar</span>
                        </button>
                        <button
                            onClick={() => setIsFullscreen(!isFullscreen)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-750 text-xs font-semibold text-slate-300 hover:text-white transition shadow-sm"
                            title={isFullscreen ? "Salir de Pantalla Completa" : "Pantalla Completa"}
                        >
                            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5 text-amber-400" /> : <Maximize2 className="w-3.5 h-3.5 text-amber-400" />}
                            <span>{isFullscreen ? "Reducir" : "C2 Fullscreen"}</span>
                        </button>
                        <Link
                            href="/"
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition shadow-md shadow-blue-600/30"
                        >
                            <ArrowLeft className="w-3.5 h-3.5" />
                            <span>Consola de Mando</span>
                        </Link>
                    </div>
                </div>

                {/* INSPECTOR CLIMÁTICO DISTRITAL DE ALTA PRECISIÓN (ESTILO PORTAL CLIMA PERÚ) */}
                {showInspector && (
                    <div className="mb-4">
                        <DistrictWeatherInspector
                            initialUbigeo={inspectorUbigeo}
                            onSelectDistrict={(ub) => {
                                setInspectorUbigeo(ub);
                                if (data?.distritos) {
                                    const found = data.distritos.find(d => d.ubigeo === ub);
                                    if (found) setDistritoSeleccionado(found);
                                }
                            }}
                        />
                    </div>
                )}

                {/* Tarjetas KPI de Estado de Emergencia FEN */}
                {data && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                        <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl flex flex-col justify-between shadow-lg">
                            <span className="text-[10px] uppercase font-bold text-slate-400">Total Declarados</span>
                            <div className="text-2xl font-black text-white font-mono">{data.estadisticas.total_distritos}</div>
                            <span className="text-[10px] text-slate-500 font-mono">100% Cobertura D.S. 124</span>
                        </div>

                        <div className="bg-slate-900 border border-red-900/60 p-3 rounded-xl flex flex-col justify-between shadow-lg bg-gradient-to-b from-red-950/20 to-transparent">
                            <span className="text-[10px] uppercase font-bold text-red-400 flex items-center gap-1">
                                <span className="h-2 w-2 rounded-full bg-red-500 animate-ping" />
                                Alarma Roja (&gt; 50 mm)
                            </span>
                            <div className="text-2xl font-black text-red-400 font-mono">
                                {data.estadisticas.conteo_alertas.ROJO}
                            </div>
                            <span className="text-[10px] text-red-300/80 font-mono">Lluvias Torrenciales</span>
                        </div>

                        <div className="bg-slate-900 border border-orange-900/60 p-3 rounded-xl flex flex-col justify-between shadow-lg bg-gradient-to-b from-orange-950/20 to-transparent">
                            <span className="text-[10px] uppercase font-bold text-orange-400">Alerta Naranja (25-50mm)</span>
                            <div className="text-2xl font-black text-orange-400 font-mono">
                                {data.estadisticas.conteo_alertas.NARANJA}
                            </div>
                            <span className="text-[10px] text-orange-300/80 font-mono">Peligro de Huaicos</span>
                        </div>

                        <div className="bg-slate-900 border border-yellow-900/60 p-3 rounded-xl flex flex-col justify-between shadow-lg bg-gradient-to-b from-yellow-950/20 to-transparent">
                            <span className="text-[10px] uppercase font-bold text-yellow-400">Atención Amarilla (10-25mm)</span>
                            <div className="text-2xl font-black text-yellow-400 font-mono">
                                {data.estadisticas.conteo_alertas.AMARILLO}
                            </div>
                            <span className="text-[10px] text-yellow-300/80 font-mono">Vigilancia de Cuencas</span>
                        </div>

                        <div className="bg-slate-900 border border-emerald-900/60 p-3 rounded-xl flex flex-col justify-between shadow-lg bg-gradient-to-b from-emerald-950/20 to-transparent">
                            <span className="text-[10px] uppercase font-bold text-emerald-400">Normal Verde (&lt; 10mm)</span>
                            <div className="text-2xl font-black text-emerald-400 font-mono">
                                {data.estadisticas.conteo_alertas.VERDE}
                            </div>
                            <span className="text-[10px] text-emerald-300/80 font-mono">Bajo Riesgo Inmediato</span>
                        </div>

                        <div className="bg-slate-900 border border-blue-900/60 p-3 rounded-xl flex flex-col justify-between shadow-lg bg-gradient-to-b from-blue-950/20 to-transparent">
                            <span className="text-[10px] uppercase font-bold text-blue-400">Población en Alto Riesgo</span>
                            <div className="text-2xl font-black text-blue-300 font-mono">
                                {(data.estadisticas.poblacion_riesgo_extremo / 1000000).toFixed(1)}M
                            </div>
                            <span className="text-[10px] text-blue-400/80 font-mono">Rojo + Naranja FEN</span>
                        </div>
                    </div>
                )}
            </header>

            {/* Barra de Filtros y Modos Operativos */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 mb-6 shadow-xl space-y-3">
                <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
                    {/* Buscador Rápido */}
                    <div className="relative flex-1 min-w-[280px]">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Buscar en los 893 distritos por Nombre, Provincia, Departamento o UBIGEO..."
                            value={busqueda}
                            onChange={(e) => {
                                setBusqueda(e.target.value);
                                setPaginaActual(1);
                            }}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition"
                        />
                    </div>

                    {/* Selector de Departamento */}
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-400 whitespace-nowrap">Departamento:</span>
                        <select
                            value={filtroDepto}
                            onChange={(e) => {
                                setFiltroDepto(e.target.value);
                                setPaginaActual(1);
                            }}
                            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
                        >
                            <option value="TODOS">Todos los Departamentos (22)</option>
                            {listaDepartamentos.map(dep => (
                                <option key={dep} value={dep}>{dep}</option>
                            ))}
                        </select>
                    </div>

                    {/* Conmutador de Mapa Base */}
                    <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 self-start sm:self-auto">
                        <button
                            onClick={() => setBaseMap("dark")}
                            className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition ${
                                baseMap === "dark" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"
                            }`}
                        >
                            Táctico C2
                        </button>
                        <button
                            onClick={() => setBaseMap("satellite")}
                            className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition ${
                                baseMap === "satellite" ? "bg-emerald-600 text-white" : "text-slate-400 hover:text-white"
                            }`}
                        >
                            Satelital
                        </button>
                        <button
                            onClick={() => setBaseMap("terrain")}
                            className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition ${
                                baseMap === "terrain" ? "bg-amber-600 text-white" : "text-slate-400 hover:text-white"
                            }`}
                        >
                            Relieve
                        </button>
                    </div>
                </div>

                {/* Filtros de Semáforo y Selección de Indicador de Open-Meteo */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-2 border-t border-slate-800/80">
                    <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[11px] font-bold text-slate-400 uppercase mr-1">Filtrar Alerta:</span>
                        <button
                            onClick={() => { setFiltroAlerta("TODOS"); setPaginaActual(1); }}
                            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                                filtroAlerta === "TODOS"
                                    ? "bg-slate-700 text-white border border-slate-500"
                                    : "bg-slate-950 text-slate-400 border border-slate-800 hover:bg-slate-800"
                            }`}
                        >
                            Todos ({data?.estadisticas.total_distritos || 893})
                        </button>
                        <button
                            onClick={() => { setFiltroAlerta("ROJO"); setPaginaActual(1); }}
                            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition flex items-center gap-1 ${
                                filtroAlerta === "ROJO"
                                    ? "bg-red-600 text-white font-bold shadow-md shadow-red-600/30"
                                    : "bg-red-950/40 text-red-300 border border-red-800/60 hover:bg-red-900/40"
                            }`}
                        >
                            <span className="h-1.5 w-1.5 rounded-full bg-red-400 animate-pulse" />
                            <span>Rojo ({data?.estadisticas.conteo_alertas.ROJO || 0})</span>
                        </button>
                        <button
                            onClick={() => { setFiltroAlerta("NARANJA"); setPaginaActual(1); }}
                            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition flex items-center gap-1 ${
                                filtroAlerta === "NARANJA"
                                    ? "bg-orange-600 text-white font-bold shadow-md shadow-orange-600/30"
                                    : "bg-orange-950/40 text-orange-300 border border-orange-800/60 hover:bg-orange-900/40"
                            }`}
                        >
                            <span>Naranja ({data?.estadisticas.conteo_alertas.NARANJA || 0})</span>
                        </button>
                        <button
                            onClick={() => { setFiltroAlerta("AMARILLO"); setPaginaActual(1); }}
                            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition flex items-center gap-1 ${
                                filtroAlerta === "AMARILLO"
                                    ? "bg-yellow-600 text-black font-bold shadow-md shadow-yellow-600/30"
                                    : "bg-yellow-950/40 text-yellow-300 border border-yellow-800/60 hover:bg-yellow-900/40"
                            }`}
                        >
                            <span>Amarillo ({data?.estadisticas.conteo_alertas.AMARILLO || 0})</span>
                        </button>
                        <button
                            onClick={() => { setFiltroAlerta("VERDE"); setPaginaActual(1); }}
                            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition flex items-center gap-1 ${
                                filtroAlerta === "VERDE"
                                    ? "bg-emerald-600 text-white font-bold shadow-md shadow-emerald-600/30"
                                    : "bg-emerald-950/40 text-emerald-300 border border-emerald-800/60 hover:bg-emerald-900/40"
                            }`}
                        >
                            <span>Verde ({data?.estadisticas.conteo_alertas.VERDE || 0})</span>
                        </button>
                    </div>

                    {/* Selector de Indicador Mapeado */}
                    <div className="flex items-center gap-1.5">
                        <span className="text-[11px] font-bold text-slate-400 uppercase mr-1">Indicador en Mapa:</span>
                        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
                            <button
                                onClick={() => setIndicatorMode("rain")}
                                className={`px-2 py-0.5 text-xs font-semibold rounded transition flex items-center gap-1 ${
                                    indicatorMode === "rain" ? "bg-sky-600 text-white" : "text-slate-400 hover:text-white"
                                }`}
                                title="Precipitación acumulada 24h"
                            >
                                <CloudRain className="w-3 h-3" />
                                <span>Lluvia 24h</span>
                            </button>
                            <button
                                onClick={() => setIndicatorMode("cape")}
                                className={`px-2 py-0.5 text-xs font-semibold rounded transition flex items-center gap-1 ${
                                    indicatorMode === "cape" ? "bg-amber-600 text-white" : "text-slate-400 hover:text-white"
                                }`}
                                title="Energía Convectiva CAPE (Gatillo Huaicos)"
                            >
                                <Zap className="w-3 h-3" />
                                <span>CAPE</span>
                            </button>
                            <button
                                onClick={() => setIndicatorMode("soil")}
                                className={`px-2 py-0.5 text-xs font-semibold rounded transition flex items-center gap-1 ${
                                    indicatorMode === "soil" ? "bg-emerald-600 text-white" : "text-slate-400 hover:text-white"
                                }`}
                                title="Saturación de suelo capa crítica 28-100cm"
                            >
                                <Droplets className="w-3 h-3" />
                                <span>Suelo %</span>
                            </button>
                            <button
                                onClick={() => setIndicatorMode("glofas")}
                                className={`px-2 py-0.5 text-xs font-semibold rounded transition flex items-center gap-1 ${
                                    indicatorMode === "glofas" ? "bg-cyan-600 text-white" : "text-slate-400 hover:text-white"
                                }`}
                                title="Caudal de ríos GloFAS m³/s"
                            >
                                <Activity className="w-3 h-3" />
                                <span>GloFAS</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* CONMUTADOR MAESTRO DE MODOS: SITUACIÓN CLIMÁTICA ACTUAL vs NIVEL DE ALERTA INDECI */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 mb-5 shadow-xl flex flex-col md:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 w-full md:w-auto">
                    <button
                        onClick={() => setPrimaryMode("clima")}
                        className={`flex-1 md:flex-initial py-2.5 px-4 rounded-xl text-xs font-black transition flex items-center justify-center gap-2.5 border ${
                            primaryMode === "clima"
                                ? "bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-600 text-white shadow-lg shadow-sky-600/30 border-sky-400 ring-1 ring-sky-400/40"
                                : "bg-slate-950 text-slate-400 border-slate-800 hover:text-white hover:bg-slate-800"
                        }`}
                        title="Ver telemetría física de precipitaciones, CAPE, suelo y caudales en vivo de Open-Meteo"
                    >
                        <CloudRain className={`w-4 h-4 ${primaryMode === "clima" ? "text-white" : "text-sky-400"}`} />
                        <div className="text-left">
                            <div className="leading-tight text-[11px] font-extrabold uppercase tracking-wide">1. SITUACIÓN CLIMÁTICA ACTUAL</div>
                            <div className="text-[9px] opacity-80 font-normal">Telemetría en Vivo • Open-Meteo API</div>
                        </div>
                        {primaryMode === "clima" && (
                            <span className="ml-1 w-2 h-2 rounded-full bg-emerald-300 animate-pulse" />
                        )}
                    </button>

                    <button
                        onClick={() => setPrimaryMode("alerta")}
                        className={`flex-1 md:flex-initial py-2.5 px-4 rounded-xl text-xs font-black transition flex items-center justify-center gap-2.5 border ${
                            primaryMode === "alerta"
                                ? "bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 text-white shadow-lg shadow-red-600/30 border-red-400 ring-1 ring-red-400/40"
                                : "bg-slate-950 text-slate-400 border-slate-800 hover:text-white hover:bg-slate-800"
                        }`}
                        title="Ver semáforo operacional oficial de Defensa Civil D.S. Nº 124-2026-PCM / INDECI"
                    >
                        <ShieldAlert className={`w-4 h-4 ${primaryMode === "alerta" ? "text-white" : "text-red-400"}`} />
                        <div className="text-left">
                            <div className="leading-tight text-[11px] font-extrabold uppercase tracking-wide">2. NIVEL DE ALERTA OFICIAL</div>
                            <div className="text-[9px] opacity-80 font-normal">Semáforo INDECI • D.S. Nº 124-2026-PCM</div>
                        </div>
                        {primaryMode === "alerta" && (
                            <span className="ml-1 w-2 h-2 rounded-full bg-amber-300 animate-pulse" />
                        )}
                    </button>
                </div>

                <div className="text-xs text-slate-400 flex items-center gap-2 px-2 bg-slate-950/60 py-2 rounded-xl border border-slate-800/60 w-full md:w-auto">
                    <Info className="w-4 h-4 text-sky-400 shrink-0" />
                    <span className="text-[11px]">
                        {primaryMode === "clima"
                            ? "Visualizando telemetría física: Lluvia 24h/72h, energía convectiva CAPE, humedad en taludes y caudales fluviales."
                            : "Visualizando semáforo oficial de contingencia, población en riesgo y protocolos de acción inmediata INDECI."}
                    </span>
                </div>
            </div>

            {/* Panel Principal Dividido: MAPA VECTORIAL (Izquierda) + DRAWER TELEMETRÍA DETALLADA (Derecha) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
                {/* Visualizador del Mapa Vectorial Táctico (893 Distritos) */}
                <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col justify-between relative overflow-hidden">
                    <div className="flex flex-wrap justify-between items-center gap-2 mb-3 pb-2 border-b border-slate-800">
                        <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-sky-400" />
                            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                                {primaryMode === "clima"
                                    ? `Situación Climática Actual • Open-Meteo (${mapProvider === "google" ? "Google Maps Platform" : "SVG"})`
                                    : `Nivel de Alerta Oficial D.S. 124-2026-PCM (${mapProvider === "google" ? "Google Maps Platform" : "SVG"})`}
                            </h2>
                        </div>
                        <div className="flex items-center gap-2">
                            {/* Selector de Motor de Mapa: Google Maps Platform vs SVG */}
                            <div className="flex items-center bg-slate-950 p-0.5 rounded-lg border border-slate-800 text-[11px]">
                                <button
                                    onClick={() => setMapProvider("google")}
                                    className={`px-2.5 py-1 rounded-md font-semibold transition flex items-center gap-1.5 ${
                                        mapProvider === "google"
                                            ? "bg-sky-600 text-white shadow-sm font-bold"
                                            : "text-slate-400 hover:text-white"
                                    }`}
                                    title="Google Maps Platform (Satelital, Terreno y Táctico con zoom interactivo)"
                                >
                                    <span>Google Maps</span>
                                    {googleMapLoaded && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />}
                                </button>
                                <button
                                    onClick={() => setMapProvider("svg")}
                                    className={`px-2.5 py-1 rounded-md font-semibold transition flex items-center gap-1.5 ${
                                        mapProvider === "svg"
                                            ? "bg-slate-700 text-white shadow-sm font-bold"
                                            : "text-slate-400 hover:text-white"
                                    }`}
                                    title="Mapa Vectorial Nativo SVG (Modo ligero para baja conectividad)"
                                >
                                    <span>Vectorial SVG</span>
                                </button>
                            </div>

                            <span className="text-[10px] font-mono text-slate-400 bg-slate-950 px-2 py-1 rounded border border-slate-800">
                                {distritosFiltrados.length} Distritos en Vista
                            </span>
                        </div>
                    </div>

                    {/* Canvas Cartográfico Interactivo (Google Maps Platform + SVG Fallback) */}
                    <div className="relative w-full h-[580px] bg-slate-950 rounded-xl overflow-hidden border border-slate-800 shadow-inner">
                        {/* Contenedor Google Maps Platform */}
                        <div
                            ref={googleMapRef}
                            className={`w-full h-full ${mapProvider === "google" ? "block" : "hidden"}`}
                        />

                        {/* Overlay de Carga / Error de Google Maps */}
                        {mapProvider === "google" && !googleMapLoaded && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/85 backdrop-blur z-10 text-center p-4">
                                {googleMapError ? (
                                    <div className="space-y-3 max-w-md bg-slate-900 border border-amber-500/40 p-4 rounded-xl shadow-xl">
                                        <AlertTriangle className="w-8 h-8 text-amber-400 mx-auto" />
                                        <p className="text-xs text-amber-200 font-semibold">{googleMapError}</p>
                                        <button
                                            onClick={() => setMapProvider("svg")}
                                            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-semibold rounded border border-slate-700 text-slate-200 transition"
                                        >
                                            Cambiar a Mapa Vectorial SVG
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-3 max-w-md bg-slate-900/95 border border-slate-800 p-4 rounded-xl shadow-2xl">
                                        <div className="flex items-center justify-center gap-2.5 text-slate-200 text-xs font-mono">
                                            <RefreshCw className="w-4 h-4 animate-spin text-sky-400" />
                                            <span>Conectando con Google Maps Platform API...</span>
                                        </div>

                                        {isSlowLoading && (
                                            <div className="text-[11px] text-amber-200/90 bg-amber-950/40 border border-amber-800/40 p-2.5 rounded-lg text-left space-y-1.5 animate-fadeIn">
                                                <p className="font-semibold flex items-center gap-1.5 text-amber-300">
                                                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                                                    La conexión con Google Maps está tardando más de lo usual
                                                </p>
                                                <p className="text-[10px] text-slate-300">
                                                    Esto puede deberse a latencia hacia los servidores de Google o cuotas de la API Key. Puedes esperar o activar de inmediato el mapa vectorial nativo.
                                                </p>
                                                <div className="pt-1 flex justify-center">
                                                    <button
                                                        onClick={() => setMapProvider("svg")}
                                                        className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-lg shadow transition flex items-center gap-1.5"
                                                    >
                                                        ⚡ Usar Mapa Vectorial SVG (Instantáneo)
                                                    </button>
                                                </div>
                                            </div>
                                        )}

                                        {!isSlowLoading && (
                                            <div className="pt-1">
                                                <button
                                                    onClick={() => setMapProvider("svg")}
                                                    className="text-[11px] text-slate-400 hover:text-sky-300 transition underline underline-offset-2"
                                                >
                                                    ¿Prefieres no esperar? Alternar a Mapa SVG
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Canvas Cartográfico SVG (Disponible cuando se selecciona 'svg') */}
                        {mapProvider === "svg" && (
                        <svg
                            viewBox="0 0 800 1000"
                            className="w-full h-full select-none"
                            style={{ filter: "drop-shadow(0 0 10px rgba(0,0,0,0.5))" }}
                        >
                            {/* Definición de Texturas y Gradientes de Capa */}
                            <defs>
                                <pattern id="meteoGrid" width="40" height="40" patternUnits="userSpaceOnUse">
                                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1e293b" strokeWidth="0.5" strokeDasharray="2,2" />
                                </pattern>
                                <radialGradient id="satOceanoMeteo" cx="30%" cy="50%" r="70%">
                                    <stop offset="0%" stopColor="#082f49" />
                                    <stop offset="60%" stopColor="#031525" />
                                    <stop offset="100%" stopColor="#020817" />
                                </radialGradient>
                                <linearGradient id="reliefGradMeteo" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="#1e1b4b" />
                                    <stop offset="35%" stopColor="#2e1065" />
                                    <stop offset="70%" stopColor="#1c1917" />
                                    <stop offset="100%" stopColor="#052e16" />
                                </linearGradient>
                            </defs>

                            {/* Fondos Cartográficos según Selección */}
                            {baseMap === "dark" && (
                                <>
                                    <rect width="800" height="1000" fill="#020617" />
                                    <rect width="800" height="1000" fill="url(#meteoGrid)" opacity="0.6" />
                                </>
                            )}
                            {baseMap === "satellite" && (
                                <>
                                    <rect width="800" height="1000" fill="url(#satOceanoMeteo)" />
                                    {/* Franja de masa continental */}
                                    <path
                                        d="M 120 180 Q 200 120 320 100 T 520 150 Q 720 220 740 450 T 680 750 Q 640 920 620 950 L 260 620 L 160 380 Z"
                                        fill="#064e3b"
                                        opacity="0.35"
                                    />
                                    {/* Corriente de Humboldt */}
                                    <path
                                        d="M 100 950 Q 140 600 80 200"
                                        fill="none"
                                        stroke="#38bdf8"
                                        strokeWidth="2"
                                        strokeDasharray="6,6"
                                        opacity="0.4"
                                    />
                                </>
                            )}
                            {baseMap === "terrain" && (
                                <>
                                    <rect width="800" height="1000" fill="url(#reliefGradMeteo)" />
                                    {/* Curvas de nivel andinas */}
                                    <path d="M 140 220 Q 280 400 320 620 T 580 820" fill="none" stroke="#ca8a04" strokeWidth="1" opacity="0.4" />
                                    <path d="M 180 240 Q 320 420 360 640 T 620 840" fill="none" stroke="#eab308" strokeWidth="1" strokeDasharray="3,3" opacity="0.3" />
                                </>
                            )}

                            {/* Contorno Esquemático del Perú */}
                            <path
                                d="M 118 220 
                                   L 165 180 L 245 130 L 320 105 L 420 115 L 495 230 L 580 240 L 720 330 
                                   L 710 460 L 680 560 L 730 680 L 690 760 L 650 930 L 590 890 L 510 770 
                                   L 410 740 L 310 650 L 250 560 L 180 410 L 140 310 Z"
                                fill="#0f172a"
                                fillOpacity="0.4"
                                stroke="#334155"
                                strokeWidth="1.5"
                            />

                            {/* Líneas de Coordenadas Geográficas de Referencia */}
                            <line x1="60" y1="230" x2="740" y2="230" stroke="#1e293b" strokeWidth="0.8" strokeDasharray="4,4" />
                            <text x="65" y="225" fill="#475569" fontSize="9" fontFamily="monospace">LAT -3.5° (NORTE FEN)</text>

                            <line x1="60" y1="634" x2="740" y2="634" stroke="#1e293b" strokeWidth="0.8" strokeDasharray="4,4" />
                            <text x="65" y="629" fill="#475569" fontSize="9" fontFamily="monospace">LAT -12.0° (LIMA / CENTRO)</text>

                            <line x1="60" y1="925" x2="740" y2="925" stroke="#1e293b" strokeWidth="0.8" strokeDasharray="4,4" />
                            <text x="65" y="920" fill="#475569" fontSize="9" fontFamily="monospace">LAT -18.0° (SUR TACNA)</text>

                            {/* Ploteo de los 893 Distritos con el Color del Semáforo */}
                            {distritosFiltrados.map((d) => {
                                const { x, y } = proyectarCoord(d.latitud, d.longitud);
                                const isSelected = distritoSeleccionado?.ubigeo === d.ubigeo;
                                const dotColor = getColorPunto(d);
                                const isRed = primaryMode === "clima" ? d.lluvia_24h >= 50.0 : d.nivel_alerta === "ROJO";

                                return (
                                    <g
                                        key={d.ubigeo}
                                        onClick={() => setDistritoSeleccionado(d)}
                                        className="cursor-pointer"
                                    >
                                        {/* Pulso animado para distritos en Alarma Roja */}
                                        {isRed && (
                                            <circle
                                                cx={x}
                                                cy={y}
                                                r="7"
                                                fill="#ef4444"
                                                opacity="0.5"
                                                className="animate-ping pointer-events-none"
                                            />
                                        )}

                                        {/* Anillo de selección táctica */}
                                        {isSelected && (
                                            <circle
                                                cx={x}
                                                cy={y}
                                                r="8"
                                                fill="none"
                                                stroke="#38bdf8"
                                                strokeWidth="2"
                                                strokeDasharray="3,3"
                                                className="pointer-events-none"
                                            />
                                        )}

                                        {/* Punto visual del distrito */}
                                        <circle
                                            cx={x}
                                            cy={y}
                                            r={isSelected ? "4.5" : isRed ? "3.5" : "2.6"}
                                            fill={dotColor}
                                            stroke="#020617"
                                            strokeWidth="0.75"
                                            opacity={isSelected ? 1 : 0.9}
                                        />

                                        {/* Hitbox táctico invisible amplio para erradicar cualquier parpadeo (Jitter Fix) */}
                                        <circle
                                            cx={x}
                                            cy={y}
                                            r="6"
                                            fill="transparent"
                                        >
                                            <title>{primaryMode === "clima"
                                                ? `${d.distrito} (${d.provincia})\nLluvia Hoy: ${d.lluvia_24h} mm\nCondición: ${d.descripcion_clima}\nTemp: ${d.temp_min}°-${d.temp_max}°C`
                                                : `${d.distrito} (${d.provincia})\nALERTA OFICIAL: ${d.nivel_alerta}\nPoblación: ${d.poblacion.toLocaleString()} hab.`}
                                            </title>
                                        </circle>
                                    </g>
                                );
                            })}
                        </svg>
                        )}

                        {/* Leyenda Táctica del Mapa */}
                        <div className="absolute bottom-3 left-3 bg-slate-950/90 border border-slate-800 p-2.5 rounded-xl backdrop-blur text-[10px] space-y-1.5 shadow-lg pointer-events-none z-10">
                            <div className="font-bold text-slate-300 uppercase tracking-wider">
                                {primaryMode === "clima"
                                    ? "Mapa Exclusivo de Precipitaciones en Vivo (Open-Meteo Hoy):"
                                    : "Semáforo Oficial de Alerta (D.S. Nº 124-2026-PCM / INDECI):"}
                            </div>
                            <div className="flex items-center gap-3 flex-wrap">
                                {primaryMode === "clima" ? (
                                    <>
                                        <div className="flex items-center gap-1">
                                            <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                                            <span className="text-slate-300">&gt; 50 mm (Torrencial)</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
                                            <span className="text-slate-300">25–50 mm (Fuerte)</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
                                            <span className="text-slate-300">10–25 mm (Moderada)</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                                            <span className="text-slate-300">1–10 mm (Ligera)</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <span className="w-2.5 h-2.5 rounded-full bg-sky-400" />
                                            <span className="text-sky-300 font-bold">0 mm (Seco / Sin Lluvia)</span>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="flex items-center gap-1">
                                            <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                                            <span className="text-slate-300">Alarma Roja</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
                                            <span className="text-slate-300">Alerta Naranja</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
                                            <span className="text-slate-300">Alerta Amarilla</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                                            <span className="text-slate-300">Alerta Verde</span>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Panel Lateral Táctico (Detalle en Tiempo Real del Distrito Seleccionado) */}
                <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between space-y-5">
                    {distritoSeleccionado ? (
                        <div className="space-y-4">
                            {/* Cabecera del Distrito */}
                            <div className="pb-3 border-b border-slate-800 flex justify-between items-start">
                                <div>
                                    <div className="flex items-center gap-1.5 mb-1">
                                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                                            UBIGEO: {distritoSeleccionado.ubigeo}
                                        </span>
                                        <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                                            distritoSeleccionado.nivel_alerta === "ROJO"
                                                ? "bg-red-950 text-red-400 border-red-800"
                                                : distritoSeleccionado.nivel_alerta === "NARANJA"
                                                ? "bg-orange-950 text-orange-400 border-orange-800"
                                                : distritoSeleccionado.nivel_alerta === "AMARILLO"
                                                ? "bg-yellow-950 text-yellow-400 border-yellow-800"
                                                : "bg-emerald-950 text-emerald-400 border-emerald-800"
                                        }`}>
                                            ALERTA {distritoSeleccionado.nivel_alerta}
                                        </span>
                                    </div>
                                    <h3 className="text-lg font-black text-white leading-tight">
                                        {distritoSeleccionado.distrito}
                                    </h3>
                                    <div className="text-xs text-slate-400">
                                        {distritoSeleccionado.provincia}, {distritoSeleccionado.departamento}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-[10px] text-slate-500 font-mono">Población</div>
                                    <div className="text-sm font-bold text-slate-200 font-mono">
                                        {distritoSeleccionado.poblacion.toLocaleString()} hab.
                                    </div>
                                </div>
                            </div>

                            {/* Panel Operacional Dinámico según el Modo Activo */}
                            {primaryMode === "alerta" ? (
                                <div className={`p-3.5 rounded-xl border space-y-2.5 ${
                                    distritoSeleccionado.nivel_alerta === "ROJO"
                                        ? "bg-red-950/40 border-red-800/80 shadow-lg shadow-red-950/30"
                                        : distritoSeleccionado.nivel_alerta === "NARANJA"
                                        ? "bg-orange-950/40 border-orange-800/80 shadow-lg shadow-orange-950/30"
                                        : distritoSeleccionado.nivel_alerta === "AMARILLO"
                                        ? "bg-yellow-950/40 border-yellow-800/80 shadow-lg shadow-yellow-950/30"
                                        : "bg-emerald-950/40 border-emerald-800/80 shadow-lg shadow-emerald-950/30"
                                }`}>
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="font-extrabold uppercase tracking-wide flex items-center gap-1.5 text-white">
                                            <ShieldAlert className="w-4 h-4 text-amber-400" />
                                            Dictamen Oficial INDECI • D.S. 124
                                        </span>
                                        <span className={`text-[10px] font-mono font-black px-2 py-0.5 rounded ${
                                            distritoSeleccionado.nivel_alerta === "ROJO" ? "bg-red-600 text-white" :
                                            distritoSeleccionado.nivel_alerta === "NARANJA" ? "bg-orange-600 text-white" :
                                            distritoSeleccionado.nivel_alerta === "AMARILLO" ? "bg-yellow-600 text-black" :
                                            "bg-emerald-600 text-white"
                                        }`}>
                                            ALERTA {distritoSeleccionado.nivel_alerta}
                                        </span>
                                    </div>

                                    <p className="text-[11px] text-slate-200 leading-snug">
                                        {distritoSeleccionado.nivel_alerta === "ROJO" && (
                                            <>🚨 <b>Peligro Inminente:</b> Precipitación extrema proyectada ({distritoSeleccionado.lluvia_24h} mm) con saturación edáfica al {distritoSeleccionado.suelo_saturacion_pct}%. Alta probabilidad de activación violenta de quebradas y huaicos.</>
                                        )}
                                        {distritoSeleccionado.nivel_alerta === "NARANJA" && (
                                            <>⚡ <b>Peligro Severo:</b> Lluvias acumuladas de {distritoSeleccionado.lluvia_24h} mm y energía convectiva de {distritoSeleccionado.cape_j_kg} J/kg. Alistamiento de maquinaria y protección de defensas ribereñas.</>
                                        )}
                                        {distritoSeleccionado.nivel_alerta === "AMARILLO" && (
                                            <>⚠️ <b>Aviso Preventivo:</b> Lluvias moderadas ({distritoSeleccionado.lluvia_24h} mm). Mantener vigilancia de cauces y limpieza de colectores pluviales.</>
                                        )}
                                        {distritoSeleccionado.nivel_alerta === "VERDE" && (
                                            <>✅ <b>Vigilancia Regular:</b> Sin umbrales críticos de precipitación en 24h. Mantener protocolos de inspección preventiva rutinaria.</>
                                        )}
                                    </p>

                                    {/* Enlaces de Acción Operacional */}
                                    <div className="grid grid-cols-2 gap-2 pt-1">
                                        <Link
                                            href="/lex"
                                            className="px-2.5 py-1.5 bg-slate-900/90 hover:bg-slate-800 text-slate-200 hover:text-white rounded-lg text-[10px] font-bold border border-slate-700 flex items-center justify-center gap-1 transition text-center"
                                            title="Generar Resolución de Alcaldía y Contratación Directa"
                                        >
                                            <span>⚖️ AMARU-LEX</span>
                                        </Link>
                                        <Link
                                            href="/ayni"
                                            className="px-2.5 py-1.5 bg-slate-900/90 hover:bg-slate-800 text-slate-200 hover:text-white rounded-lg text-[10px] font-bold border border-slate-700 flex items-center justify-center gap-1 transition text-center"
                                            title="Convocar Juntas Vecinales y Ollas Comunes"
                                        >
                                            <span>👥 AMARU-AYNI</span>
                                        </Link>
                                    </div>

                                    <button
                                        onClick={() => {
                                            setInspectorUbigeo(distritoSeleccionado.ubigeo);
                                            setShowInspector(true);
                                            window.scrollTo({ top: 0, behavior: "smooth" });
                                        }}
                                        className="w-full py-2 px-3 bg-gradient-to-r from-sky-500/20 to-blue-600/20 hover:from-sky-500/30 hover:to-blue-600/30 border border-sky-500/40 hover:border-sky-400 text-sky-200 hover:text-white rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm mt-1"
                                    >
                                        <CloudRain className="w-3.5 h-3.5 text-sky-400" />
                                        <span>Ver en Portal Clima (7 Días / Horas)</span>
                                    </button>
                                </div>
                            ) : (
                                <div className="p-3.5 rounded-xl border border-sky-800/80 bg-sky-950/30 space-y-2 shadow-lg shadow-sky-950/20">
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="font-extrabold uppercase tracking-wide flex items-center gap-1.5 text-sky-200">
                                            <CloudRain className="w-4 h-4 text-sky-400" />
                                            Situación Atmosférica en Vivo
                                        </span>
                                        <span className="text-[10px] font-mono text-sky-300 bg-sky-900/80 px-2 py-0.5 rounded border border-sky-700">
                                            Open-Meteo
                                        </span>
                                    </div>
                                    <div className="text-xs text-slate-200">
                                        Condición: <b className="text-white">{distritoSeleccionado.descripcion_clima}</b>
                                    </div>
                                    <div className="text-[11px] text-slate-300">
                                        Probabilidad de Lluvia: <b className="text-sky-300 font-mono">{distritoSeleccionado.probabilidad_lluvia_pct}%</b> • Viento: <b className="font-mono">{distritoSeleccionado.viento_rafagas_kmh} km/h</b>
                                    </div>
                                </div>
                            )}

                            {/* Tarjeta de Lluvia 24h y 72h */}
                            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 space-y-2">
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-slate-400 font-semibold flex items-center gap-1">
                                        <CloudRain className="w-3.5 h-3.5 text-sky-400" />
                                        Precipitación Acumulada
                                    </span>
                                    <span className="text-[10px] font-mono text-sky-400 bg-sky-950 px-2 py-0.5 rounded">
                                        ECMWF 9km
                                    </span>
                                </div>
                                <div className="grid grid-cols-2 gap-3 pt-1">
                                    <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                                        <div className="text-[10px] text-slate-400">Próximas 24 Horas</div>
                                        <div className="text-xl font-black text-white font-mono flex items-baseline gap-1">
                                            <span>{distritoSeleccionado.lluvia_24h}</span>
                                            <span className="text-xs text-slate-400">mm</span>
                                        </div>
                                    </div>
                                    <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                                        <div className="text-[10px] text-slate-400">Acumulado 72 Horas</div>
                                        <div className="text-xl font-black text-white font-mono flex items-baseline gap-1">
                                            <span>{distritoSeleccionado.lluvia_72h}</span>
                                            <span className="text-xs text-slate-400">mm</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-[11px] text-slate-400 flex items-center gap-1.5 pt-1">
                                    <Info className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                                    <span>Condición: <b>{distritoSeleccionado.descripcion_clima}</b></span>
                                </div>
                            </div>

                            {/* Indicador de Energía Convectiva CAPE */}
                            <div className="bg-slate-950 border border-amber-900/40 rounded-xl p-3.5 space-y-2">
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-amber-400 font-semibold flex items-center gap-1">
                                        <Zap className="w-3.5 h-3.5" />
                                        Energía Convectiva CAPE
                                    </span>
                                    <span className="text-sm font-black text-amber-400 font-mono">
                                        {distritoSeleccionado.cape_j_kg} J/kg
                                    </span>
                                </div>
                                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full transition-all duration-500 ${
                                            distritoSeleccionado.cape_j_kg > 1400 ? "bg-red-500 animate-pulse" : "bg-amber-400"
                                        }`}
                                        style={{ width: `${Math.min(100, (distritoSeleccionado.cape_j_kg / 2000) * 100)}%` }}
                                    />
                                </div>
                                <p className="text-[10px] text-slate-400">
                                    {distritoSeleccionado.cape_j_kg > 1400
                                        ? "⚠️ Inestabilidad Extrema: Alta probabilidad de tormenta violenta y gatillo de huaico."
                                        : distritoSeleccionado.cape_j_kg > 900
                                        ? "⚡ Inestabilidad Moderada: Nubosidad vertical en desarrollo."
                                        : "Condición atmosférica estable."}
                                </p>
                            </div>

                            {/* Perfil de Suelo en 4 Capas (Open-Meteo Edáfico) */}
                            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 space-y-2 text-xs">
                                <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase">
                                    <span>Humedad de Suelo (4 Capas)</span>
                                    <span className="text-emerald-400 font-mono">Infiltración</span>
                                </div>
                                <div className="space-y-1.5 text-[10px]">
                                    <div>
                                        <div className="flex justify-between text-slate-400 mb-0.5">
                                            <span>0–7 cm (Superficial):</span>
                                            <span className="font-mono text-slate-200">{distritoSeleccionado.suelo_4_capas.superficial_0_7cm}%</span>
                                        </div>
                                        <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                                            <div className="h-full bg-blue-400" style={{ width: `${distritoSeleccionado.suelo_4_capas.superficial_0_7cm}%` }} />
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex justify-between text-slate-400 mb-0.5">
                                            <span>7–28 cm (Radicular):</span>
                                            <span className="font-mono text-slate-200">{distritoSeleccionado.suelo_4_capas.radicular_7_28cm}%</span>
                                        </div>
                                        <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                                            <div className="h-full bg-sky-400" style={{ width: `${distritoSeleccionado.suelo_4_capas.radicular_7_28cm}%` }} />
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex justify-between text-red-300 font-semibold mb-0.5">
                                            <span>28–100 cm (Talud Crítico Huaico):</span>
                                            <span className="font-mono font-bold text-red-400">{distritoSeleccionado.suelo_4_capas.talud_28_100cm}%</span>
                                        </div>
                                        <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden border border-red-900">
                                            <div
                                                className={`h-full ${distritoSeleccionado.suelo_4_capas.talud_28_100cm > 80 ? "bg-red-500 animate-pulse" : "bg-orange-400"}`}
                                                style={{ width: `${distritoSeleccionado.suelo_4_capas.talud_28_100cm}%` }}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex justify-between text-slate-400 mb-0.5">
                                            <span>100–255 cm (Freático Profundo):</span>
                                            <span className="font-mono text-slate-200">{distritoSeleccionado.suelo_4_capas.profunda_100_255cm}%</span>
                                        </div>
                                        <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                                            <div className="h-full bg-slate-600" style={{ width: `${distritoSeleccionado.suelo_4_capas.profunda_100_255cm}%` }} />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Otros Indicadores: Viento, Caudal y Temperatura */}
                            <div className="grid grid-cols-3 gap-2 text-center text-xs">
                                <div className="bg-slate-950 border border-slate-800 p-2 rounded-xl">
                                    <Wind className="w-3.5 h-3.5 text-slate-400 mx-auto mb-1" />
                                    <div className="text-[9px] text-slate-500">Ráfagas</div>
                                    <div className="font-bold text-white font-mono">{distritoSeleccionado.viento_rafagas_kmh} km/h</div>
                                </div>
                                <div className="bg-slate-950 border border-slate-800 p-2 rounded-xl">
                                    <Activity className="w-3.5 h-3.5 text-cyan-400 mx-auto mb-1" />
                                    <div className="text-[9px] text-slate-500">Caudal GloFAS</div>
                                    <div className="font-bold text-cyan-300 font-mono">{distritoSeleccionado.caudal_glofas_m3s} m³/s</div>
                                </div>
                                <div className="bg-slate-950 border border-slate-800 p-2 rounded-xl">
                                    <Thermometer className="w-3.5 h-3.5 text-amber-400 mx-auto mb-1" />
                                    <div className="text-[9px] text-slate-500">Temp. Max/Min</div>
                                    <div className="font-bold text-amber-300 font-mono">{distritoSeleccionado.temp_max}° / {distritoSeleccionado.temp_min}°</div>
                                </div>
                            </div>

                            {/* Botones de Acción para el Distrito Seleccionado */}
                            <div className="space-y-2 pt-2 border-t border-slate-800">
                                <button
                                    onClick={() => handleConsultarLive(distritoSeleccionado.ubigeo)}
                                    disabled={liveLoading}
                                    className="w-full py-2 px-3 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-md shadow-amber-600/20 disabled:opacity-50"
                                >
                                    <Zap className={`w-3.5 h-3.5 ${liveLoading ? "animate-spin" : ""}`} />
                                    <span>{liveLoading ? "Consultando Satélite..." : "Consultar Open-Meteo Satelital en Vivo"}</span>
                                </button>

                                <Link
                                    href={`/dashboard/${distritoSeleccionado.ubigeo}`}
                                    className="w-full py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 border border-slate-700"
                                >
                                    <span>Abrir Consola Municipal de {distritoSeleccionado.distrito}</span>
                                    <ExternalLink className="w-3.5 h-3.5 text-sky-400" />
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-16 text-slate-500 space-y-2">
                            <MapPin className="w-8 h-8 mx-auto text-slate-600" />
                            <p className="text-xs">Seleccione un distrito en el mapa o en la tabla para ver su perfil meteorológico.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Matriz Tabular de Contingencia (893 Distritos) */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                    <div>
                        <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                            <Database className="w-4 h-4 text-sky-400" />
                            <span>Matriz Oficial de Distritos en Emergencia FEN 2026–2027</span>
                        </h2>
                        <p className="text-xs text-slate-400">
                            Listado completo de los 893 distritos ordenados por nivel de lluvia acumulada 24h e impacto territorial.
                        </p>
                    </div>
                    <div className="text-xs text-slate-400 font-mono">
                        Mostrando {distritosPaginados.length} de {distritosFiltrados.length} distritos filtrados
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-slate-300">
                        <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-mono border-b border-slate-800">
                            <tr>
                                <th className="py-2.5 px-3">Alerta</th>
                                <th className="py-2.5 px-3">UBIGEO</th>
                                <th className="py-2.5 px-3">Distrito</th>
                                <th className="py-2.5 px-3">Provincia</th>
                                <th className="py-2.5 px-3">Departamento</th>
                                <th className="py-2.5 px-3 text-right">Lluvia 24h</th>
                                <th className="py-2.5 px-3 text-right">CAPE</th>
                                <th className="py-2.5 px-3 text-right">Suelo 28-100cm</th>
                                <th className="py-2.5 px-3 text-right">GloFAS</th>
                                <th className="py-2.5 px-3 text-right">Población</th>
                                <th className="py-2.5 px-3 text-center">Acción</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60 font-mono">
                            {distritosPaginados.map((d) => (
                                <tr
                                    key={d.ubigeo}
                                    onClick={() => setDistritoSeleccionado(d)}
                                    className={`hover:bg-slate-850 cursor-pointer transition ${
                                        distritoSeleccionado?.ubigeo === d.ubigeo ? "bg-slate-800/80 ring-1 ring-sky-500/50" : ""
                                    }`}
                                >
                                    <td className="py-2.5 px-3">
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                                            d.nivel_alerta === "ROJO"
                                                ? "bg-red-950 text-red-400 border-red-800"
                                                : d.nivel_alerta === "NARANJA"
                                                ? "bg-orange-950 text-orange-400 border-orange-800"
                                                : d.nivel_alerta === "AMARILLO"
                                                ? "bg-yellow-950 text-yellow-400 border-yellow-800"
                                                : "bg-emerald-950 text-emerald-400 border-emerald-800"
                                        }`}>
                                            {d.nivel_alerta}
                                        </span>
                                    </td>
                                    <td className="py-2.5 px-3 text-slate-400">{d.ubigeo}</td>
                                    <td className="py-2.5 px-3 font-semibold text-white font-sans">{d.distrito}</td>
                                    <td className="py-2.5 px-3 text-slate-400 font-sans">{d.provincia}</td>
                                    <td className="py-2.5 px-3 text-slate-400 font-sans">{d.departamento}</td>
                                    <td className="py-2.5 px-3 text-right font-bold text-sky-400">{d.lluvia_24h} mm</td>
                                    <td className="py-2.5 px-3 text-right text-amber-300">{d.cape_j_kg} J/kg</td>
                                    <td className="py-2.5 px-3 text-right text-red-300">{d.suelo_saturacion_pct}%</td>
                                    <td className="py-2.5 px-3 text-right text-cyan-300">{d.caudal_glofas_m3s} m³/s</td>
                                    <td className="py-2.5 px-3 text-right text-slate-300">{d.poblacion.toLocaleString()}</td>
                                    <td className="py-2.5 px-3 text-center">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setDistritoSeleccionado(d);
                                            }}
                                            className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-sky-400 rounded text-[10px] font-sans font-semibold transition"
                                        >
                                            Ver Mapa
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Controles de Paginación */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-800 text-xs">
                    <span className="text-slate-400">
                        Página <b>{paginaActual}</b> de <b>{totalPaginas}</b>
                    </span>
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => setPaginaActual(p => Math.max(1, p - 1))}
                            disabled={paginaActual === 1}
                            className="px-3 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 hover:bg-slate-800 disabled:opacity-40 transition"
                        >
                            Anterior
                        </button>
                        <button
                            onClick={() => setPaginaActual(p => Math.min(totalPaginas, p + 1))}
                            disabled={paginaActual === totalPaginas}
                            className="px-3 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 hover:bg-slate-800 disabled:opacity-40 transition"
                        >
                            Siguiente
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
