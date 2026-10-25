"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import PredictiveMultidayEapConsole from "@/components/PredictiveMultidayEapConsole";
import CrioclimaPunoConsole from "@/components/CrioclimaPunoConsole";
import { Sun, CloudSnow, ShieldAlert, Zap, Building2, Clock, Compass, ArrowRight } from "lucide-react";

export default function PronosticoTabWrapper() {
    const [activeMode, setActiveMode] = useState<"EL_NINO" | "LA_NINA">("EL_NINO");

    useEffect(() => {
        // Sincronizar con el modo global de HeaderNav
        const savedSeason = localStorage.getItem("seasonMode");
        if (savedSeason === "LA_NINA" || savedSeason === "EL_NINO") {
            setActiveMode(savedSeason);
        }

        // Listener para cambios de storage en la misma ventana
        const handleStorage = () => {
            const current = localStorage.getItem("seasonMode");
            if (current === "LA_NINA" || current === "EL_NINO") {
                setActiveMode(current);
            }
        };

        window.addEventListener("storage", handleStorage);
        return () => window.removeEventListener("storage", handleStorage);
    }, []);

    const handleSwitchMode = (mode: "EL_NINO" | "LA_NINA") => {
        setActiveMode(mode);
        localStorage.setItem("seasonMode", mode);
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-6 space-y-6">
            {/* Cintillo de Nivel 2 COED Municipal (Anillo 2: Táctico Territorial) */}
            <div className="bg-slate-900 border border-amber-900/60 rounded-2xl p-4 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2.5 py-0.5 rounded text-[10px] font-mono bg-amber-500 text-slate-950 font-black uppercase tracking-wider">
                            NIVEL 2 • COED MUNICIPAL
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-950 text-amber-300 border border-amber-700/60 font-bold">
                            ANILLO 2: TÁCTICO TERRITORIAL & EAP
                        </span>
                        <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/60">
                            VENTANA DORADA Tlag = 0.6 · tc
                        </span>
                    </div>
                    <h1 className="text-xl md:text-2xl font-black text-white tracking-tight mt-1">
                        Reloj Polar Táctico, Ventanas EAP y Monitoreo Crioclimático
                    </h1>
                    <p className="text-xs text-slate-400 mt-0.5">
                        Anticipación escalonada: T-144h (Estratégico) &rarr; T-72h (Táctico) &rarr; T-24h (Despliegue Maquinaria PP 0068 / Ley 30225).
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <Link
                        href="/municipal/200101"
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs transition"
                    >
                        <Building2 className="w-3.5 h-3.5" />
                        <span>Suite Municipal 360°</span>
                    </Link>
                    <Link
                        href="/alertas"
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 transition"
                    >
                        <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                        <span>Bandeja Alertas</span>
                    </Link>
                </div>
            </div>
            {/* Barra Táctica Superior de Conmutación de Régimen */}
            <div className="flex flex-col sm:flex-row justify-between items-center bg-slate-900 border border-slate-800 p-3 rounded-2xl gap-3 shadow-md">
                <div className="flex items-center gap-2">
                    <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">
                        Régimen Climático Activo:
                    </span>
                    <span className={`px-2.5 py-0.5 rounded text-xs font-bold font-mono ${
                        activeMode === "LA_NINA"
                            ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                            : "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                    }`}>
                        {activeMode === "LA_NINA" ? "FASE FRÍA (LA NIÑA / HELADAS)" : "FASE CÁLIDA (EL NIÑO / LLUVIAS)"}
                    </span>
                </div>

                {/* Tabs de Selección */}
                <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
                    <button
                        onClick={() => handleSwitchMode("EL_NINO")}
                        className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
                            activeMode === "EL_NINO"
                                ? "bg-amber-600 text-white shadow-md shadow-amber-900/40"
                                : "text-slate-400 hover:text-white"
                        }`}
                    >
                        <Sun className="w-3.5 h-3.5 text-amber-300" />
                        <span>MODO EL NIÑO (Costa Norte / Lluvias & EAP)</span>
                    </button>

                    <button
                        onClick={() => handleSwitchMode("LA_NINA")}
                        className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
                            activeMode === "LA_NINA"
                                ? "bg-cyan-600 text-white shadow-md shadow-cyan-900/40"
                                : "text-slate-400 hover:text-white"
                        }`}
                    >
                        <CloudSnow className="w-3.5 h-3.5 text-cyan-300" />
                        <span>MODO LA NIÑA (Sierra Sur / Puno Crioclima)</span>
                    </button>
                </div>
            </div>

            {/* Vista Condicional */}
            {activeMode === "LA_NINA" ? (
                <CrioclimaPunoConsole />
            ) : (
                <PredictiveMultidayEapConsole />
            )}
        </div>
    );
}
