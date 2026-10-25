"use client";

import React, { useState, useEffect } from "react";
import {
    Tv,
    Video,
    Plus,
    Play,
    Pause,
    Trash2,
    ExternalLink,
    Maximize2,
    Minimize2,
    LayoutGrid,
    Square,
    Columns3,
    ShieldCheck,
    ShieldAlert,
    Activity,
    Droplets,
    CloudRain,
    RefreshCw,
    X,
    MapPin,
    Sparkles,
    Radio,
    AlertTriangle,
    CheckCircle2,
    XCircle,
    Info,
    Eye
} from "lucide-react";

export interface StreamChannel {
    id: string;
    titulo: string;
    plataforma: "YOUTUBE" | "TIKTOK" | "RTMP_DRON";
    urlOriginal: string;
    embedUrl: string;
    ubigeo: string;
    distrito: string;
    departamento: string;
    operador: string;
    categoria: "DRON_OFICIAL" | "CORRESPONSAL_ACREDITADO" | "TIKTOK_SUPERVISADO" | "VECINO_REPORTERO";
    estadoVerificacion: "OFICIAL_VERIFICADO" | "EN_CUARENTENA_IA" | "ALERTA_DESINFORMACION";
    afirmacionStreamer: string;
    // Datos de telemetría para triangulación anti-fake
    caudalSensorM3s: number;
    caudalUmbralRojoM3s: number;
    lluviaSensor24hMm: number;
    veredictoConsistencia: "CONSISTENTE_VALIDADO" | "DISCORDANCIA_POSIBLE_FAKE" | "MONITOREO_ESTABLE";
}

interface VideoWallC2Props {
    isOpen: boolean;
    onClose: () => void;
    onSelectDistrict?: (ubigeo: string) => void;
}

const CANALES_INICIALES: StreamChannel[] = [
    {
        id: "stream-01",
        titulo: "Dron Térmico INDECI — Quebrada Carossio (Chosica)",
        plataforma: "YOUTUBE",
        urlOriginal: "https://www.youtube.com/watch?v=live_demo_chosica",
        embedUrl: "https://www.youtube-nocookie.com/embed/jfKfPfyJRdk?autoplay=1&mute=1&controls=1", // Video ilustrativo de transmisión en vivo
        ubigeo: "150118",
        distrito: "Lurigancho Chosica",
        departamento: "Lima",
        operador: "Brigada Aérea INDECI / COED Nacional C2",
        categoria: "DRON_OFICIAL",
        estadoVerificacion: "OFICIAL_VERIFICADO",
        afirmacionStreamer: "Vigilancia de cono deyector. Flujo de escorrentía dentro de márgenes normales.",
        caudalSensorM3s: 18.4,
        caudalUmbralRojoM3s: 85.0,
        lluviaSensor24hMm: 12.2,
        veredictoConsistencia: "CONSISTENTE_VALIDADO"
    },
    {
        id: "stream-02",
        titulo: "Radio Cutivalú Directo — Malecón Huaca de la Cruz (Catacaos)",
        plataforma: "YOUTUBE",
        urlOriginal: "https://www.youtube.com/watch?v=live_demo_piura",
        embedUrl: "https://www.youtube-nocookie.com/embed/5qap5aO4i9A?autoplay=1&mute=1&controls=1",
        ubigeo: "200105",
        distrito: "Catacaos",
        departamento: "Piura",
        operador: "Radio Cutivalú / Corresponsal Comunitario",
        categoria: "CORRESPONSAL_ACREDITADO",
        estadoVerificacion: "OFICIAL_VERIFICADO",
        afirmacionStreamer: "Río Piura incrementa caudal. Pobladores en dique Viduque en alerta.",
        caudalSensorM3s: 1420.0,
        caudalUmbralRojoM3s: 1900.0,
        lluviaSensor24hMm: 45.0,
        veredictoConsistencia: "CONSISTENTE_VALIDADO"
    },
    {
        id: "stream-03",
        titulo: "TikTok Live — Quebrada San Ildefonso (El Porvenir)",
        plataforma: "TIKTOK",
        urlOriginal: "https://www.tiktok.com/@vecinotrujillo/live",
        embedUrl: "https://www.youtube-nocookie.com/embed/DWcJFNfaw9c?autoplay=1&mute=1&controls=1", // Fallback seguro iframe
        ubigeo: "130101",
        distrito: "Trujillo (El Porvenir)",
        departamento: "La Libertad",
        operador: "Vecino Reportero (@vecinotrujillo)",
        categoria: "TIKTOK_SUPERVISADO",
        estadoVerificacion: "EN_CUARENTENA_IA",
        afirmacionStreamer: "Afirma que el agua sube rápido por la pista. Se aprecian sedimentos en pistas.",
        caudalSensorM3s: 12.5,
        caudalUmbralRojoM3s: 40.0,
        lluviaSensor24hMm: 28.6,
        veredictoConsistencia: "CONSISTENTE_VALIDADO"
    },
    {
        id: "stream-04",
        titulo: "Alerta Ciudadana Viral — ¿Colapso de Puente?",
        plataforma: "TIKTOK",
        urlOriginal: "https://www.tiktok.com/@alerta_viral_lima/video/12345",
        embedUrl: "https://www.youtube-nocookie.com/embed/kJQP7kiw5Fk?autoplay=1&mute=1&controls=1",
        ubigeo: "150118",
        distrito: "Lurigancho Chosica",
        departamento: "Lima",
        operador: "Cuenta Anónima Viral en Redes",
        categoria: "TIKTOK_SUPERVISADO",
        estadoVerificacion: "ALERTA_DESINFORMACION",
        afirmacionStreamer: "¡ALERTA MÁXIMA! Puente colapsó y se lleva viviendas enteras.",
        caudalSensorM3s: 18.4,
        caudalUmbralRojoM3s: 85.0,
        lluviaSensor24hMm: 12.2,
        veredictoConsistencia: "DISCORDANCIA_POSIBLE_FAKE"
    }
];

export default function VideoWallC2({ isOpen, onClose, onSelectDistrict }: VideoWallC2Props) {
    const [canales, setCanales] = useState<StreamChannel[]>(CANALES_INICIALES);
    const [selectedChannelId, setSelectedChannelId] = useState<string>(CANALES_INICIALES[0].id);
    const [layoutMode, setLayoutMode] = useState<"2x2" | "1x1" | "3x1">("2x2");
    const [showAddModal, setShowAddModal] = useState<boolean>(false);

    // Formulario para nuevo enlace
    const [nuevoUrl, setNuevoUrl] = useState<string>("");
    const [nuevoTitulo, setNuevoTitulo] = useState<string>("");
    const [nuevoPlataforma, setNuevoPlataforma] = useState<"YOUTUBE" | "TIKTOK" | "RTMP_DRON">("YOUTUBE");
    const [nuevoUbigeo, setNuevoUbigeo] = useState<string>("150118");
    const [nuevoOperador, setNuevoOperador] = useState<string>("");
    const [nuevoAfirmacion, setNuevoAfirmacion] = useState<string>("");

    if (!isOpen) return null;

    const canalSeleccionado = canales.find((c) => c.id === selectedChannelId) || canales[0];

    // Parser inteligente de URL (YouTube / TikTok a Embed Seguro)
    const procesarEmbedUrl = (url: string, plataforma: "YOUTUBE" | "TIKTOK" | "RTMP_DRON"): string => {
        if (!url) return "https://www.youtube-nocookie.com/embed/jfKfPfyJRdk";

        if (plataforma === "YOUTUBE") {
            // Caso 1: youtube.com/watch?v=VIDEO_ID
            const vMatch = url.match(/[?&]v=([^&#]+)/);
            if (vMatch && vMatch[1]) {
                return `https://www.youtube-nocookie.com/embed/${vMatch[1]}?autoplay=1&mute=1&controls=1`;
            }
            // Caso 2: youtu.be/VIDEO_ID
            const shortMatch = url.match(/youtu\.be\/([^?&#]+)/);
            if (shortMatch && shortMatch[1]) {
                return `https://www.youtube-nocookie.com/embed/${shortMatch[1]}?autoplay=1&mute=1&controls=1`;
            }
            // Caso 3: ya es embed
            if (url.includes("embed/")) {
                return url;
            }
            return `https://www.youtube-nocookie.com/embed/jfKfPfyJRdk?autoplay=1&mute=1`;
        } else if (plataforma === "TIKTOK") {
            // Para TikTok, los iframes directos requieren sandbox seguro o fallback de streaming
            if (url.includes("tiktok.com")) {
                return url;
            }
            return "https://www.youtube-nocookie.com/embed/DWcJFNfaw9c?autoplay=1&mute=1";
        }
        return url;
    };

    const handleAddChannel = (e: React.FormEvent) => {
        e.preventDefault();
        if (!nuevoTitulo.trim() || !nuevoUrl.trim()) {
            alert("Por favor complete el título y la URL de la transmisión.");
            return;
        }

        const embedFinal = procesarEmbedUrl(nuevoUrl, nuevoPlataforma);
        const distritosMap: Record<string, { dist: string; depto: string; caudal: number; umbral: number }> = {
            "150118": { dist: "Lurigancho Chosica", depto: "Lima", caudal: 18.4, umbral: 85.0 },
            "200105": { dist: "Catacaos", depto: "Piura", caudal: 1420.0, umbral: 1900.0 },
            "140301": { dist: "Íllimo", depto: "Lambayeque", caudal: 180.0, umbral: 250.0 },
            "130101": { dist: "Trujillo", depto: "La Libertad", caudal: 12.5, umbral: 40.0 },
            "240101": { dist: "Tumbes", depto: "Tumbes", caudal: 580.0, umbral: 1000.0 }
        };

        const distInfo = distritosMap[nuevoUbigeo] || { dist: "Distrito Nacional", depto: "Perú", caudal: 20.0, umbral: 100.0 };

        // Simulación de evaluación de consistencia
        const esSospechoso = nuevoAfirmacion.toLowerCase().includes("colapso") || nuevoAfirmacion.toLowerCase().includes("muertos");
        const veredicto: "CONSISTENTE_VALIDADO" | "DISCORDANCIA_POSIBLE_FAKE" = esSospechoso ? "DISCORDANCIA_POSIBLE_FAKE" : "CONSISTENTE_VALIDADO";
        const estado: "OFICIAL_VERIFICADO" | "EN_CUARENTENA_IA" | "ALERTA_DESINFORMACION" = esSospechoso ? "ALERTA_DESINFORMACION" : "EN_CUARENTENA_IA";

        const nuevoItem: StreamChannel = {
            id: `stream-${Date.now().toString().slice(-4)}`,
            titulo: nuevoTitulo,
            plataforma: nuevoPlataforma,
            urlOriginal: nuevoUrl,
            embedUrl: embedFinal,
            ubigeo: nuevoUbigeo,
            distrito: distInfo.dist,
            departamento: distInfo.depto,
            operador: nuevoOperador || "Corresponsal Comunitario",
            categoria: nuevoPlataforma === "TIKTOK" ? "TIKTOK_SUPERVISADO" : "CORRESPONSAL_ACREDITADO",
            estadoVerificacion: estado,
            afirmacionStreamer: nuevoAfirmacion || "Transmisión en directo desde el sector afectado.",
            caudalSensorM3s: distInfo.caudal,
            caudalUmbralRojoM3s: distInfo.umbral,
            lluviaSensor24hMm: 22.0,
            veredictoConsistencia: veredicto
        };

        setCanales([nuevoItem, ...canales]);
        setSelectedChannelId(nuevoItem.id);
        setShowAddModal(false);
        setNuevoTitulo("");
        setNuevoUrl("");
        setNuevoOperador("");
        setNuevoAfirmacion("");
    };

    const handleDeleteChannel = (id: string) => {
        if (canales.length <= 1) {
            alert("Debe mantenerse al menos una transmisión activa en la consola.");
            return;
        }
        const actualizados = canales.filter((c) => c.id !== id);
        setCanales(actualizados);
        if (selectedChannelId === id) {
            setSelectedChannelId(actualizados[0].id);
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex flex-col font-sans text-slate-100 overflow-hidden animate-in fade-in duration-200">
            {/* 1. BARRA SUPERIOR DE MANDO C2 */}
            <header className="px-4 py-3 bg-slate-900 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0 shadow-lg">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center justify-center">
                        <Tv className="w-5 h-5 animate-pulse" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h2 className="text-base font-bold text-white tracking-wide flex items-center gap-2">
                                Video Wall C2 — Pantalla Táctica de Transmisiones en Vivo
                            </h2>
                            <span className="px-2 py-0.5 rounded-full bg-red-600 text-white text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                                LIVE C2
                            </span>
                        </div>
                        <p className="text-xs text-slate-400">
                            Supervisión de directos (YouTube Live / TikTok / Drones COE) con triangulación en tiempo real de aforos ANA y radar SENAMHI.
                        </p>
                    </div>
                </div>

                {/* Controles de Disposición (Layout) & Acciones */}
                <div className="flex items-center gap-2">
                    {/* Selector de Cuadrícula */}
                    <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
                        <button
                            onClick={() => setLayoutMode("1x1")}
                            className={`p-1.5 rounded-lg transition ${
                                layoutMode === "1x1" ? "bg-purple-600 text-white shadow" : "text-slate-400 hover:text-slate-200"
                            }`}
                            title="Foco Individual (1x1)"
                        >
                            <Square className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setLayoutMode("2x2")}
                            className={`p-1.5 rounded-lg transition ${
                                layoutMode === "2x2" ? "bg-purple-600 text-white shadow" : "text-slate-400 hover:text-slate-200"
                            }`}
                            title="Matriz Cuádruple (2x2)"
                        >
                            <LayoutGrid className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setLayoutMode("3x1")}
                            className={`p-1.5 rounded-lg transition ${
                                layoutMode === "3x1" ? "bg-purple-600 text-white shadow" : "text-slate-400 hover:text-slate-200"
                            }`}
                            title="Tríptico Costero (3x1)"
                        >
                            <Columns3 className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Botón Conectar Transmisión */}
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-purple-600/30 transition cursor-pointer"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Conectar Enlace Live</span>
                    </button>

                    {/* Botón Cerrar */}
                    <button
                        onClick={onClose}
                        className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer border border-slate-700"
                        title="Cerrar Video Wall C2"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            </header>

            {/* 2. ÁREA DE TRABAJO PRINCIPAL: PANTALLAS + PANEL DE AUDITORÍA LATERAL */}
            <div className="flex-1 flex overflow-hidden">
                {/* ÁREA DE VIDEO WALL */}
                <main className="flex-1 p-3 overflow-y-auto bg-slate-950 flex flex-col justify-between">
                    {/* LAYOUT 1X1 (FOCO PRINCIPAL) */}
                    {layoutMode === "1x1" && (
                        <div className="h-full flex flex-col">
                            <div className="relative flex-1 bg-black rounded-2xl overflow-hidden border border-slate-800 shadow-2xl flex items-center justify-center">
                                <iframe
                                    src={canalSeleccionado.embedUrl}
                                    title={canalSeleccionado.titulo}
                                    className="w-full h-full border-0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                />
                                {/* Overlay Táctico C2 */}
                                <div className="absolute top-3 left-3 flex items-center gap-2 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700/80 text-xs">
                                    <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                                    <span className="font-bold text-white">{canalSeleccionado.titulo}</span>
                                    <span className="text-slate-400 font-mono">[{canalSeleccionado.plataforma}]</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* LAYOUT 2X2 (MATRIZ CUÁDRUPLE) */}
                    {layoutMode === "2x2" && (
                        <div className="h-full grid grid-cols-1 md:grid-cols-2 gap-3">
                            {canales.slice(0, 4).map((canal) => {
                                const isSelected = canal.id === selectedChannelId;
                                const isFake = canal.estadoVerificacion === "ALERTA_DESINFORMACION";

                                return (
                                    <div
                                        key={canal.id}
                                        onClick={() => setSelectedChannelId(canal.id)}
                                        className={`relative rounded-2xl overflow-hidden border transition flex flex-col cursor-pointer ${
                                            isSelected
                                                ? "border-purple-500 ring-2 ring-purple-500/30 shadow-xl"
                                                : isFake
                                                ? "border-rose-800/80 bg-rose-950/20"
                                                : "border-slate-800 hover:border-slate-700 bg-slate-900"
                                        }`}
                                    >
                                        {/* Player de Video */}
                                        <div className="relative flex-1 bg-black min-h-[220px]">
                                            <iframe
                                                src={canal.embedUrl}
                                                title={canal.titulo}
                                                className="w-full h-full border-0 pointer-events-none"
                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                            />
                                            {/* Header del Canal en el Monitor */}
                                            <div className="absolute top-2 left-2 right-2 flex items-center justify-between gap-1 pointer-events-auto">
                                                <div className="flex items-center gap-1.5 bg-slate-900/90 backdrop-blur-sm px-2 py-1 rounded-lg border border-slate-700 text-[11px] font-bold text-white truncate">
                                                    <span className={`w-2 h-2 rounded-full ${isFake ? "bg-rose-500" : "bg-emerald-400"} animate-pulse`} />
                                                    <span className="truncate">{canal.titulo}</span>
                                                </div>
                                                <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                                                    isFake
                                                        ? "bg-rose-600 text-white"
                                                        : "bg-purple-600 text-white"
                                                }`}>
                                                    {canal.plataforma}
                                                </span>
                                            </div>

                                            {/* Badge Inferior con Ubicación y Estado */}
                                            <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-[11px] bg-slate-950/85 backdrop-blur-sm px-2.5 py-1 rounded-lg border border-slate-800 text-slate-300">
                                                <span className="flex items-center gap-1 font-semibold text-amber-300">
                                                    <MapPin className="w-3 h-3" />
                                                    {canal.distrito}
                                                </span>
                                                <span className={isFake ? "text-rose-400 font-bold" : "text-emerald-400 font-bold"}>
                                                    {canal.estadoVerificacion.replace(/_/g, " ")}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* LAYOUT 3X1 (TRÍPTICO COSTERO) */}
                    {layoutMode === "3x1" && (
                        <div className="h-full grid grid-cols-1 md:grid-cols-3 gap-3">
                            {canales.slice(0, 3).map((canal) => (
                                <div
                                    key={canal.id}
                                    onClick={() => setSelectedChannelId(canal.id)}
                                    className={`relative rounded-2xl overflow-hidden border transition flex flex-col cursor-pointer ${
                                        canal.id === selectedChannelId
                                            ? "border-purple-500 ring-2 ring-purple-500/30"
                                            : "border-slate-800 bg-slate-900 hover:border-slate-700"
                                    }`}
                                >
                                    <div className="relative flex-1 bg-black min-h-[300px]">
                                        <iframe
                                            src={canal.embedUrl}
                                            title={canal.titulo}
                                            className="w-full h-full border-0 pointer-events-none"
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        />
                                        <div className="absolute top-2 left-2 bg-slate-900/90 px-2 py-1 rounded-lg text-xs font-bold text-white border border-slate-700">
                                            {canal.distrito} ({canal.plataforma})
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </main>

                {/* 3. PANEL LATERAL DERECHO: TRIANGULACIÓN ANTI-FAKE CON SENSORES ANA/SENAMHI */}
                <aside className="w-80 md:w-96 bg-slate-900/95 border-l border-slate-800 p-4 flex flex-col justify-between overflow-y-auto shrink-0 shadow-2xl text-xs space-y-4">
                    <div className="space-y-4">
                        {/* ENCABEZADO DE AUDITORÍA DEL FEED SELECCIONADO */}
                        <div className="pb-3 border-b border-slate-800">
                            <div className="flex items-center justify-between text-slate-400 mb-1">
                                <span className="font-mono text-[11px] text-purple-400 font-bold uppercase">
                                    Canal en Inspección
                                </span>
                                <span className="text-[10px] text-slate-500 font-mono">
                                    UBIGEO: {canalSeleccionado.ubigeo}
                                </span>
                            </div>
                            <h3 className="text-sm font-bold text-white leading-tight">
                                {canalSeleccionado.titulo}
                            </h3>
                            <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1.5">
                                <Radio className="w-3 h-3 text-emerald-400" />
                                <span>Operado por: <strong className="text-slate-200">{canalSeleccionado.operador}</strong></span>
                            </div>
                        </div>

                        {/* LO QUE EL STREAMER / TIKTOKER AFIRMA EN EL VIDEO */}
                        <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                            <span className="text-[10px] text-slate-400 uppercase font-semibold block mb-1 flex items-center gap-1">
                                <Activity className="w-3 h-3 text-amber-400" />
                                Relato del Creador de Contenido:
                            </span>
                            <p className="text-slate-200 text-xs italic leading-relaxed">
                                &ldquo;{canalSeleccionado.afirmacionStreamer}&rdquo;
                            </p>
                        </div>

                        {/* TRIANGULACIÓN TELEMÉTRICA REAL (SENSORES FÍSICOS VS STREAM) */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-slate-300 font-bold uppercase text-[11px]">
                                <span className="flex items-center gap-1.5 text-cyan-400">
                                    <Droplets className="w-3.5 h-3.5" />
                                    Triangulación de Sensores Físicos
                                </span>
                                <span className="text-[10px] text-slate-500">ANA & SENAMHI</span>
                            </div>

                            {/* Sensor de Caudal Fluvial */}
                            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                                <div className="flex justify-between items-center text-slate-400">
                                    <span>Estación Hidrológica Oficial:</span>
                                    <span className="font-mono font-bold text-white">{canalSeleccionado.caudalSensorM3s} m³/s</span>
                                </div>
                                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full transition-all duration-500 ${
                                            canalSeleccionado.caudalSensorM3s > canalSeleccionado.caudalUmbralRojoM3s
                                                ? "bg-rose-500"
                                                : "bg-blue-500"
                                        }`}
                                        style={{
                                            width: `${Math.min(
                                                100,
                                                (canalSeleccionado.caudalSensorM3s / canalSeleccionado.caudalUmbralRojoM3s) * 100
                                            )}%`
                                        }}
                                    />
                                </div>
                                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                                    <span>Umbral Seguro: 0 m³/s</span>
                                    <span>Alerta Roja: {canalSeleccionado.caudalUmbralRojoM3s} m³/s</span>
                                </div>
                            </div>

                            {/* Pluviómetro 24 Horas */}
                            <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 flex justify-between items-center text-[11px]">
                                <span className="text-slate-400 flex items-center gap-1">
                                    <CloudRain className="w-3.5 h-3.5 text-sky-400" />
                                    Lluvia Acumulada 24h:
                                </span>
                                <span className="font-mono font-bold text-sky-300">
                                    {canalSeleccionado.lluviaSensor24hMm} mm
                                </span>
                            </div>
                        </div>

                        {/* VEREDICTO DE INTEGRIDAD C2 */}
                        <div
                            className={`p-3 rounded-xl border leading-relaxed ${
                                canalSeleccionado.veredictoConsistencia === "CONSISTENTE_VALIDADO"
                                    ? "bg-emerald-950/40 border-emerald-700/60 text-emerald-200"
                                    : "bg-rose-950/40 border-rose-700/60 text-rose-200"
                            }`}
                        >
                            <div className="flex items-center gap-2 font-bold mb-1 text-xs">
                                {canalSeleccionado.veredictoConsistencia === "CONSISTENTE_VALIDADO" ? (
                                    <>
                                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                                        <span>Consistencia Operativa Verificada</span>
                                    </>
                                ) : (
                                    <>
                                        <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
                                        <span>Alerta de Desinformación / Fake News</span>
                                    </>
                                )}
                            </div>
                            <p className="text-[11px]">
                                {canalSeleccionado.veredictoConsistencia === "CONSISTENTE_VALIDADO"
                                    ? "Las imágenes del directo concuerdan con la curva hidrológica y los reportes pluviométricos del COED Nacional. Canal apto para orientación de respuesta."
                                    : "DISCORDANCIA CRÍTICA: El creador afirma colapso o catástrofe, pero la estación de aforo ANA registra caudal ordinario. Material retenido en Sala de Crisis para evitar pánico social."}
                            </p>
                        </div>

                        {/* LISTADO RÁPIDO DE CANALES DISPONIBLES */}
                        <div>
                            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                                Canales en la Sala ({canales.length})
                            </span>
                            <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
                                {canales.map((c) => (
                                    <div
                                        key={c.id}
                                        onClick={() => setSelectedChannelId(c.id)}
                                        className={`p-2 rounded-xl border text-xs flex items-center justify-between cursor-pointer transition ${
                                            c.id === selectedChannelId
                                                ? "bg-purple-950/80 border-purple-500 text-white font-semibold"
                                                : "bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700"
                                        }`}
                                    >
                                        <div className="flex items-center gap-2 truncate">
                                            <span
                                                className={`w-2 h-2 rounded-full shrink-0 ${
                                                    c.estadoVerificacion === "ALERTA_DESINFORMACION"
                                                        ? "bg-rose-500"
                                                        : "bg-emerald-400"
                                                }`}
                                            />
                                            <span className="truncate">{c.titulo}</span>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDeleteChannel(c.id);
                                            }}
                                            className="text-slate-500 hover:text-rose-400 p-1 shrink-0"
                                            title="Eliminar canal"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* BOTONES DE ACCIÓN RÁPIDA C2 */}
                    <div className="pt-3 border-t border-slate-800 space-y-2">
                        {onSelectDistrict && (
                            <button
                                onClick={() => {
                                    onSelectDistrict(canalSeleccionado.ubigeo);
                                    onClose();
                                }}
                                className="w-full py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-blue-600/30"
                            >
                                <MapPin className="w-3.5 h-3.5" />
                                <span>Centrar Mapa en {canalSeleccionado.distrito}</span>
                            </button>
                        )}
                        <button
                            onClick={() => alert(`Alerta C2 emitida: Brigada INDECI alertada en ${canalSeleccionado.distrito}.`)}
                            className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition border border-slate-700 flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Validar para Despacho de Crisis</span>
                        </button>
                    </div>
                </aside>
            </div>

            {/* MODAL PARA CONECTAR NUEVO ENLACE LIVE (YOUTUBE / TIKTOK) */}
            {showAddModal && (
                <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
                    <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-5 shadow-2xl space-y-4">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                            <div className="flex items-center gap-2">
                                <Tv className="w-5 h-5 text-purple-400" />
                                <h3 className="font-bold text-sm text-white">
                                    Conectar Enlace Live (YouTube / TikTok)
                                </h3>
                            </div>
                            <button
                                onClick={() => setShowAddModal(false)}
                                className="text-slate-400 hover:text-white"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <form onSubmit={handleAddChannel} className="space-y-3 text-xs">
                            <div>
                                <label className="block text-slate-300 font-semibold mb-1">
                                    Plataforma de Streaming:
                                </label>
                                <div className="grid grid-cols-3 gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setNuevoPlataforma("YOUTUBE")}
                                        className={`py-2 rounded-lg border font-semibold transition ${
                                            nuevoPlataforma === "YOUTUBE"
                                                ? "bg-red-600 text-white border-red-500 shadow"
                                                : "bg-slate-950 text-slate-400 border-slate-800"
                                        }`}
                                    >
                                        YouTube Live
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setNuevoPlataforma("TIKTOK")}
                                        className={`py-2 rounded-lg border font-semibold transition ${
                                            nuevoPlataforma === "TIKTOK"
                                                ? "bg-purple-600 text-white border-purple-500 shadow"
                                                : "bg-slate-950 text-slate-400 border-slate-800"
                                        }`}
                                    >
                                        TikTok Live
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setNuevoPlataforma("RTMP_DRON")}
                                        className={`py-2 rounded-lg border font-semibold transition ${
                                            nuevoPlataforma === "RTMP_DRON"
                                                ? "bg-blue-600 text-white border-blue-500 shadow"
                                                : "bg-slate-950 text-slate-400 border-slate-800"
                                        }`}
                                    >
                                        Dron / RTMP
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-slate-300 font-semibold mb-1">
                                    Título de la Transmisión:
                                </label>
                                <input
                                    type="text"
                                    value={nuevoTitulo}
                                    onChange={(e) => setNuevoTitulo(e.target.value)}
                                    placeholder="Ej: Directo Puente Los Ángeles / Youtuber en Chosica"
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-slate-300 font-semibold mb-1">
                                    URL del Enlace o Código Embed:
                                </label>
                                <input
                                    type="text"
                                    value={nuevoUrl}
                                    onChange={(e) => setNuevoUrl(e.target.value)}
                                    placeholder="https://www.youtube.com/watch?v=... o https://www.tiktok.com/@.../live"
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono text-[11px] focus:outline-none focus:border-purple-500"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="block text-slate-300 font-semibold mb-1">
                                        Distrito / UBIGEO:
                                    </label>
                                    <select
                                        value={nuevoUbigeo}
                                        onChange={(e) => setNuevoUbigeo(e.target.value)}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-white font-mono"
                                    >
                                        <option value="150118">Lurigancho Chosica (150118)</option>
                                        <option value="200105">Catacaos Piura (200105)</option>
                                        <option value="140301">Íllimo Lambayeque (140301)</option>
                                        <option value="130101">Trujillo (130101)</option>
                                        <option value="240101">Tumbes (240101)</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-slate-300 font-semibold mb-1">
                                        Operador / Creador:
                                    </label>
                                    <input
                                        type="text"
                                        value={nuevoOperador}
                                        onChange={(e) => setNuevoOperador(e.target.value)}
                                        placeholder="Nombre de canal o DNI"
                                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-slate-300 font-semibold mb-1">
                                    ¿Qué asegura o muestra el video?
                                </label>
                                <textarea
                                    rows={2}
                                    value={nuevoAfirmacion}
                                    onChange={(e) => setNuevoAfirmacion(e.target.value)}
                                    placeholder="Ej: Muestra el río subiendo de nivel / Calle anegada..."
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                                />
                            </div>

                            <div className="pt-2 flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setShowAddModal(false)}
                                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold cursor-pointer"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold cursor-pointer shadow-md shadow-purple-600/30"
                                >
                                    Conectar al Video Wall C2
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
