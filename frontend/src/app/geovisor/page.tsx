"use client";

import React from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { ArrowLeft, Satellite, Compass } from "lucide-react";

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

export default function GeovisorPage() {
    return (
        <div className="space-y-3">
            {/* Barra de Mando y Retorno a Consola Principal */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/60 border border-slate-800 px-4 py-2 rounded-xl text-xs">
                <div className="flex items-center gap-2">
                    <Link
                        href="/"
                        className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg font-medium transition"
                    >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        <span>Consola de Mando Principal</span>
                    </Link>
                    <span className="text-slate-600">/</span>
                    <span className="text-sky-400 font-bold flex items-center gap-1">
                        <Compass className="w-3.5 h-3.5" />
                        Geovisor Táctico C2 (Pantalla Completa)
                    </span>
                </div>

                <div className="text-slate-400 text-[11px] hidden sm:block">
                    Sala de Crisis Nacional • Monitoreo Multiespectral Perú & Cuenca del Pacífico 2026
                </div>
            </div>

            {/* Consola Cartográfica Central */}
            <GeovisorConsole />
        </div>
    );
}
