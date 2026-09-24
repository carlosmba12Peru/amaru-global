"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { ArrowLeft, Satellite, Compass, Layers, CloudRain } from "lucide-react";

// Carga dinámica del GeovisorConsole para evitar SSR mismatches
const GeovisorConsole = dynamic(() => import("@/components/GeovisorConsole"), {
    ssr: false,
    loading: () => (
        <div className="w-full h-[calc(100vh-100px)] min-h-[600px] bg-slate-950 border border-slate-800 rounded-2xl flex flex-col items-center justify-center text-slate-400 gap-3">
            <Satellite className="w-8 h-8 text-blue-400 animate-spin" />
            <span className="text-sm font-semibold tracking-wide text-slate-200">
                Iniciando Consola Geovisor C2 Cartográfica...
            </span>
            <span className="text-xs text-slate-500">
                Cargando capas Open-Meteo, NOAA SST, Boyas DHN/IMARPE e Inteligencia Histórica FEN
            </span>
        </div>
    )
});

// Carga dinámica de Google Maps Platform (MapViewer)
const MapViewer = dynamic(() => import("@/components/MapViewer"), {
    ssr: false,
    loading: () => (
        <div className="w-full h-[calc(100vh-100px)] min-h-[600px] bg-slate-950 border border-slate-800 rounded-2xl flex flex-col items-center justify-center text-slate-400 gap-3">
            <Satellite className="w-8 h-8 text-emerald-400 animate-spin" />
            <span className="text-sm font-semibold tracking-wide text-slate-200">
                Iniciando Google Maps Platform (Satelital 3D)...
            </span>
            <span className="text-xs text-slate-500">
                Cargando API de Google Maps, capas de hidrología y red de boyas DHN
            </span>
        </div>
    )
});

export default function GeovisorPage() {
    const [mapEngine, setMapEngine] = useState<"c2_tactical" | "google_maps">("c2_tactical");

    return (
        <div className="space-y-3">
            {/* Barra de Mando, Selector de Motor Cartográfico y Retorno */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/80 border border-slate-800 px-4 py-2.5 rounded-xl text-xs">
                <div className="flex items-center gap-2">
                    <Link
                        href="/"
                        className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg font-medium transition"
                    >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        <span>Consola Principal</span>
                    </Link>
                    <span className="text-slate-600">/</span>
                    <span className="text-sky-400 font-bold flex items-center gap-1">
                        <Compass className="w-3.5 h-3.5" />
                        Geovisor COEN C2
                    </span>
                </div>

                {/* SELECTOR DUAL DE MOTOR CARTOGRÁFICO: C2 TÁCTICO VS GOOGLE MAPS PLATFORM */}
                <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 gap-1 shadow-inner">
                    <button
                        onClick={() => setMapEngine("c2_tactical")}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-xs transition ${
                            mapEngine === "c2_tactical"
                                ? "bg-sky-600 text-white shadow-md shadow-sky-600/30"
                                : "text-slate-400 hover:text-white hover:bg-slate-900"
                        }`}
                    >
                        <CloudRain className="w-3.5 h-3.5" />
                        <span>Retícula C2 / Radar Doppler</span>
                    </button>

                    <button
                        onClick={() => setMapEngine("google_maps")}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-xs transition ${
                            mapEngine === "google_maps"
                                ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30"
                                : "text-slate-400 hover:text-white hover:bg-slate-900"
                        }`}
                    >
                        <Satellite className="w-3.5 h-3.5" />
                        <span>Google Maps Platform (Satelital 3D)</span>
                    </button>
                </div>

                <div className="text-slate-400 text-[11px] hidden lg:block font-mono">
                    {mapEngine === "c2_tactical"
                        ? "Motor: Open-Meteo Pro • RainViewer Doppler • Boyas DHN"
                        : "Motor: Google Maps Platform API • Capas Satelitales e Hidrográficas"}
                </div>
            </div>

            {/* Renderizado Condicional del Motor Cartográfico Seleccionado */}
            {mapEngine === "c2_tactical" ? (
                <GeovisorConsole />
            ) : (
                <div className="w-full bg-slate-900/60 border border-slate-800 rounded-2xl p-2 shadow-2xl overflow-hidden">
                    <MapViewer mode="national" />
                </div>
            )}
        </div>
    );
}
