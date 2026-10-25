"use client";

import React from "react";
import Link from "next/link";

interface FilaTriaje {
    ubigeo: string;
    distrito: string;
    region: string;
    cuenca: string;
    riesgo: "ROJO" | "AMARILLO" | "VERDE";
    amenaza: string;
    poblacion: string;
    scoreRiesgo: number;
}

const distritosMock: FilaTriaje[] = [
    {
        ubigeo: "150118",
        distrito: "Lurigancho-Chosica",
        region: "Lima",
        cuenca: "Río Rímac / Huaycoloro",
        riesgo: "ROJO",
        amenaza: "Huaico / Saturación 88%",
        poblacion: "85,000",
        scoreRiesgo: 94,
    },
    {
        ubigeo: "200101",
        distrito: "Piura",
        region: "Piura",
        cuenca: "Cuenca Río Piura",
        riesgo: "ROJO",
        amenaza: "Desborde Fluvial (890 m³/s)",
        poblacion: "168,000",
        scoreRiesgo: 91,
    },
    {
        ubigeo: "140304",
        distrito: "Íllimo",
        region: "Lambayeque",
        cuenca: "Río La Leche",
        riesgo: "AMARILLO",
        amenaza: "Inundación Agrícola",
        poblacion: "12,400",
        scoreRiesgo: 68,
    },
    {
        ubigeo: "080801",
        distrito: "Espinar",
        region: "Cusco",
        cuenca: "Alto Apurímac / Salado",
        riesgo: "AMARILLO",
        amenaza: "Helada Agrícola (-4.0°C)",
        poblacion: "29,800",
        scoreRiesgo: 62,
    },
    {
        ubigeo: "210505",
        distrito: "Santa Rosa (Mazocruz)",
        region: "Puno",
        cuenca: "Altiplano / Río Ilave",
        riesgo: "VERDE",
        amenaza: "Vigilancia Térmica (-8.4°C)",
        poblacion: "6,500",
        scoreRiesgo: 35,
    },
];

export default function TriageTable() {
    return (
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl shadow-lg">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
                <div>
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-200">
                        Matriz de Triaje Territorial Nacional (Priorización Operativa)
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                        50 Distritos Monitoreados • Ordenados por criticidad e impacto poblacional
                    </p>
                </div>
                <span className="text-[11px] font-mono bg-slate-950 border border-slate-800 text-slate-400 px-2.5 py-1 rounded">
                    CSCG Red Activa: 50 Nodos
                </span>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-300">
                    <thead className="text-xs uppercase bg-slate-950 text-slate-400 border-b border-slate-800">
                        <tr>
                            <th className="p-3">Nivel</th>
                            <th className="p-3">Distrito (UBIGEO)</th>
                            <th className="p-3">Región / Cuenca</th>
                            <th className="p-3">Amenaza Activa</th>
                            <th className="p-3">Población Expuesta</th>
                            <th className="p-3 text-center">Criticidad</th>
                            <th className="p-3 text-right">Mando Municipal</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                        {distritosMock.map((row) => (
                            <tr key={row.ubigeo} className="hover:bg-slate-800/40 transition">
                                <td className="p-3">
                                    <span
                                        className={`px-2 py-0.5 rounded text-[11px] font-bold tracking-wide ${row.riesgo === "ROJO"
                                                ? "bg-red-950 text-red-400 border border-red-700 animate-pulse"
                                                : row.riesgo === "AMARILLO"
                                                    ? "bg-amber-950 text-amber-400 border border-amber-700"
                                                    : "bg-emerald-950 text-emerald-400 border border-emerald-700"
                                            }`}
                                    >
                                        {row.riesgo}
                                    </span>
                                </td>
                                <td className="p-3">
                                    <div className="font-semibold text-white">{row.distrito}</div>
                                    <div className="text-[11px] font-mono text-slate-400">UBIGEO: {row.ubigeo}</div>
                                </td>
                                <td className="p-3">
                                    <span className="text-slate-200 font-medium">{row.region}</span>
                                    <div className="text-xs text-slate-400">{row.cuenca}</div>
                                </td>
                                <td className="p-3 text-slate-200 font-medium">{row.amenaza}</td>
                                <td className="p-3 font-mono text-slate-300">{row.poblacion} hab.</td>
                                <td className="p-3 text-center">
                                    <span className="font-mono text-xs font-bold text-slate-300 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                                        {row.scoreRiesgo} / 100
                                    </span>
                                </td>
                                <td className="p-3 text-right">
                                    <Link
                                        href={`/dashboard/${row.ubigeo}`}
                                        className="inline-flex items-center gap-1 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow transition"
                                    >
                                        Abrir COED Municipal →
                                    </Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}