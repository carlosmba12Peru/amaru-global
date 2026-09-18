"use client";

import React from "react";
import {
    ResponsiveContainer,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
    Legend,
} from "recharts";

const dataHidrologica = [
    { tiempo: "D-3", lluvia: 14, caudal: 180 },
    { tiempo: "D-2", lluvia: 28, caudal: 320 },
    { tiempo: "D-1", lluvia: 52, caudal: 590 },
    { tiempo: "Hoy (Pico)", lluvia: 42, caudal: 890 },
    { tiempo: "+24h", lluvia: 24, caudal: 710 },
    { tiempo: "+48h", lluvia: 12, caudal: 430 },
    { tiempo: "+72h", lluvia: 6, caudal: 260 },
];

export default function HydroCharts() {
    return (
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl shadow-lg">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
                <div>
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-200">
                        Hidrograma Táctico: Precipitación vs. Caudal Fluvial Proyectado
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                        Monitoreo en tiempo real • Cuenca Río Piura / GloFAS 7 Días
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <span className="bg-red-950 border border-red-700 text-red-400 text-[11px] font-bold px-2 py-0.5 rounded">
                        Cota Crítica: 850 m³/s Superada
                    </span>
                </div>
            </div>

            <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={dataHidrologica} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorCaudal" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.4} />
                                <stop offset="95%" stopColor="#0284c7" stopOpacity={0.0} />
                            </linearGradient>
                            <linearGradient id="colorLluvia" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                                <stop offset="95%" stopColor="#d97706" stopOpacity={0.0} />
                            </linearGradient>
                        </defs>

                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                        <XAxis dataKey="tiempo" stroke="#64748b" tick={{ fontSize: 11 }} />

                        {/* Eje Izquierdo: Precipitación en mm */}
                        <YAxis
                            yAxisId="left"
                            stroke="#f59e0b"
                            domain={[0, 80]}
                            tick={{ fontSize: 11 }}
                            label={{ value: "Lluvia (mm)", angle: -90, position: "insideLeft", fill: "#f59e0b", fontSize: 10, dy: 35 }}
                        />

                        {/* Eje Derecho: Caudal en m3/s */}
                        <YAxis
                            yAxisId="right"
                            orientation="right"
                            stroke="#38bdf8"
                            domain={[0, 1000]}
                            tick={{ fontSize: 11 }}
                            label={{ value: "Caudal (m³/s)", angle: 90, position: "insideRight", fill: "#38bdf8", fontSize: 10, dy: 35 }}
                        />

                        <Tooltip
                            contentStyle={{
                                backgroundColor: "#020617",
                                borderColor: "#334155",
                                borderRadius: "8px",
                                fontSize: "12px",
                                color: "#f8fafc",
                            }}
                        />
                        <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />

                        <Area
                            yAxisId="right"
                            type="monotone"
                            dataKey="caudal"
                            stroke="#38bdf8"
                            strokeWidth={2}
                            fillOpacity={1}
                            fill="url(#colorCaudal)"
                            name="Caudal Fluvial (m³/s)"
                        />

                        <Area
                            yAxisId="left"
                            type="monotone"
                            dataKey="lluvia"
                            stroke="#f59e0b"
                            strokeWidth={2}
                            fillOpacity={1}
                            fill="url(#colorLluvia)"
                            name="Precipitación 24h (mm)"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}