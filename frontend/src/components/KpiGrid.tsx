"use client";

import React, { useEffect, useState } from "react";
import { Droplets, Thermometer, Waves, AlertTriangle, CloudSnow, Wind } from "lucide-react";

type Props = {
    ubigeo?: string;
};

export default function KpiGrid({ ubigeo }: Props) {
    const [seasonMode, setSeasonMode] = useState<"EL_NINO" | "LA_NINA">("EL_NINO");

    useEffect(() => {
        // Sincronizar con el modo seleccionado en HeaderNav
        const checkSeason = () => {
            const saved = localStorage.getItem("seasonMode");
            if (saved === "EL_NINO" || saved === "LA_NINA") {
                setSeasonMode(saved);
            }
        };
        checkSeason();
        window.addEventListener("storage", checkSeason);
        return () => window.removeEventListener("storage", checkSeason);
    }, []);

    // --- MODO EL NIÑO (Costa / Lluvias / Caudales) ---
    if (seasonMode === "EL_NINO") {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
                    <div className="flex justify-between items-center text-slate-400 mb-2">
                        <span className="text-xs font-semibold uppercase">Lluvia Acumulada 24h</span>
                        <Droplets className="w-4 h-4 text-sky-400" />
                    </div>
                    <div className="text-2xl font-bold text-white">42.5 mm</div>
                    <p className="text-xs text-amber-400 mt-1">Cuenca Piura en umbral crítico</p>
                </div>

                <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
                    <div className="flex justify-between items-center text-slate-400 mb-2">
                        <span className="text-xs font-semibold uppercase">Saturación Suelo Profundo</span>
                        <AlertTriangle className="w-4 h-4 text-amber-400" />
                    </div>
                    <div className="text-2xl font-bold text-white">88.4%</div>
                    <p className="text-xs text-red-400 mt-1">Riesgo alto de huaico en Rímac</p>
                </div>

                <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
                    <div className="flex justify-between items-center text-slate-400 mb-2">
                        <span className="text-xs font-semibold uppercase">Caudal Máximo GloFAS</span>
                        <Waves className="w-4 h-4 text-blue-400" />
                    </div>
                    <div className="text-2xl font-bold text-white">890 m³/s</div>
                    <p className="text-xs text-red-400 mt-1">Puente Sánchez Cerro en alerta roja</p>
                </div>

                <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
                    <div className="flex justify-between items-center text-slate-400 mb-2">
                        <span className="text-xs font-semibold uppercase">Anomalía Niño 1+2</span>
                        <Thermometer className="w-4 h-4 text-red-500" />
                    </div>
                    <div className="text-2xl font-bold text-white">+1.8 °C</div>
                    <p className="text-xs text-slate-400 mt-1">Condición cálida fuerte (ENFEN)</p>
                </div>
            </div>
        );
    }

    // --- MODO LA NIÑA (Sierra Sur / Heladas / Friajes) ---
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
                <div className="flex justify-between items-center text-slate-400 mb-2">
                    <span className="text-xs font-semibold uppercase">Temperatura Mínima</span>
                    <Thermometer className="w-4 h-4 text-cyan-400" />
                </div>
                <div className="text-2xl font-bold text-cyan-300">-8.4 °C</div>
                <p className="text-xs text-red-400 mt-1">Mazocruz (El Collao, Puno)</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
                <div className="flex justify-between items-center text-slate-400 mb-2">
                    <span className="text-xs font-semibold uppercase">Sensación Térmica</span>
                    <Wind className="w-4 h-4 text-sky-400" />
                </div>
                <div className="text-2xl font-bold text-sky-300">-12.1 °C</div>
                <p className="text-xs text-amber-400 mt-1">Viento sostenido 34 km/h en puna</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
                <div className="flex justify-between items-center text-slate-400 mb-2">
                    <span className="text-xs font-semibold uppercase">Nieve Acumulada</span>
                    <CloudSnow className="w-4 h-4 text-blue-300" />
                </div>
                <div className="text-2xl font-bold text-white">12.0 cm</div>
                <p className="text-xs text-red-400 mt-1">Paso de Imata (Vía MTC bloqueada)</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
                <div className="flex justify-between items-center text-slate-400 mb-2">
                    <span className="text-xs font-semibold uppercase">Anomalía Niño 3.4</span>
                    <AlertTriangle className="w-4 h-4 text-cyan-400" />
                </div>
                <div className="text-2xl font-bold text-cyan-400">-1.4 °C</div>
                <p className="text-xs text-slate-400 mt-1">Condición fría moderada (ENFEN)</p>
            </div>
        </div>
    );
}