"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sun, CloudSnow, Clock, AlertTriangle, LayoutDashboard, Satellite, Building2, Scale, BookOpen, ShieldCheck, ShieldAlert, Waves, Zap, CloudRain, GraduationCap, Users } from "lucide-react";

export default function HeaderNav() {
    const pathname = usePathname();
    const [season, setSeason] = useState<"EL_NINO" | "LA_NINA">("EL_NINO");
    const [enfen, setEnfen] = useState<string>("ALERTA ACTIVA");
    const [horaLocal, setHoraLocal] = useState<string>("");

    // Reloj dinámico ejecutado estrictamente en cliente para evitar Hydration Mismatch
    useEffect(() => {
        setHoraLocal(new Date().toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
        const timer = setInterval(() => {
            setHoraLocal(new Date().toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    // Sincronizar modo estacional guardado
    useEffect(() => {
        const saved = localStorage.getItem("seasonMode");
        if (saved === "EL_NINO" || saved === "LA_NINA") {
            setSeason(saved);
        }
    }, []);

    const toggleSeason = () => {
        const next = season === "EL_NINO" ? "LA_NINA" : "EL_NINO";
        setSeason(next);
        localStorage.setItem("seasonMode", next);
    };

    return (
        <header className="flex flex-col xl:flex-row justify-between items-center px-4 py-3 bg-slate-900 border-b border-slate-800 gap-3">
            {/* Logotipo y Título de Sala de Crisis */}
            <div className="flex items-center gap-3">
                <Link href="/" className="flex items-center gap-2.5 hover:opacity-90 transition">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 via-sky-600 to-indigo-700 flex items-center justify-center font-black text-white shadow-md shadow-sky-500/20 text-xs border border-white/20">
                        ⚡
                    </div>
                    <div>
                        <div className="flex items-center gap-1.5">
                            <span className="font-black text-sm tracking-wide text-white block leading-tight">
                                AMARU-CLIMATE
                            </span>
                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-400 border border-amber-500/40">
                                C2 PERÚ
                            </span>
                        </div>
                        <span className="text-[10px] text-slate-400 block tracking-wider uppercase">
                            Inteligencia &amp; Gobernanza Climática Territorial
                        </span>
                    </div>
                </Link>
            </div>

            {/* Selector Central de Consolas Especializadas */}
            <nav className="flex items-center gap-1.5 bg-slate-950/90 p-1 rounded-xl border border-slate-800 shadow-inner">
                <Link
                    href="/"
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                        pathname === "/"
                            ? "bg-blue-600 text-white shadow-md shadow-blue-600/30 font-bold"
                            : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                    }`}
                >
                    <LayoutDashboard className="w-3.5 h-3.5" />
                    <span>Consola de Mando</span>
                </Link>
                <Link
                    href="/geovisor"
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                        pathname === "/geovisor"
                            ? "bg-sky-600 text-white shadow-md shadow-sky-600/30 font-bold"
                            : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                    }`}
                >
                    <Satellite className="w-3.5 h-3.5 text-sky-400" />
                    <span>Consola Geovisor C2</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                </Link>
                <Link
                    href="/imarpe"
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                        pathname === "/imarpe"
                            ? "bg-teal-600 text-white shadow-md shadow-teal-600/30 font-bold"
                            : "text-teal-300/80 hover:text-teal-200 hover:bg-slate-800 border border-teal-500/20"
                    }`}
                >
                    <Waves className="w-3.5 h-3.5 text-teal-400" />
                    <span>Consola IMARPE</span>
                    <span className="px-1.5 py-0.2 text-[9px] font-bold rounded bg-teal-500/20 text-teal-300 border border-teal-500/40">
                        BDO
                    </span>
                </Link>
                <Link
                    href="/enfen"
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                        pathname === "/enfen"
                            ? "bg-red-600 text-white shadow-md shadow-red-600/30 font-bold"
                            : "text-red-300/90 hover:text-red-200 hover:bg-slate-800 border border-red-500/30"
                    }`}
                >
                    <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
                    <span>Consola ENFEN</span>
                    <span className="px-1.5 py-0.2 text-[9px] font-bold rounded bg-red-500/20 text-red-300 border border-red-500/40 animate-pulse">
                        PDF
                    </span>
                </Link>
                <Link
                    href="/meteo"
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                        pathname === "/meteo"
                            ? "bg-amber-600 text-white shadow-md shadow-amber-600/30 font-bold"
                            : "text-amber-300/90 hover:text-amber-200 hover:bg-slate-800 border border-amber-500/30"
                    }`}
                >
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                    <span>Open-Meteo FEN</span>
                    <span className="px-1.5 py-0.2 text-[9px] font-bold rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                        893 D.S. 124
                    </span>
                </Link>
                <Link
                    href="/dashboard/150118"
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                        pathname?.startsWith("/dashboard")
                            ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30 font-bold"
                            : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                    }`}
                >
                    <Building2 className="w-3.5 h-3.5" />
                    <span>Consola Municipal</span>
                </Link>
                <Link
                    href="/historico"
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                        pathname === "/historico"
                            ? "bg-amber-600 text-white shadow-md shadow-amber-600/30 font-bold"
                            : "text-amber-300/90 hover:text-amber-200 hover:bg-slate-800 border border-amber-500/30"
                    }`}
                >
                    <Building2 className="w-3.5 h-3.5 text-amber-400" />
                    <span>Memoria Histórica</span>
                    <span className="px-1.5 py-0.2 text-[9px] font-bold rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                        1983-2017
                    </span>
                </Link>
                <Link
                    href="/doctrina"
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                        pathname === "/doctrina"
                            ? "bg-purple-600 text-white shadow-md shadow-purple-600/30 font-bold"
                            : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                    }`}
                >
                    <Scale className="w-3.5 h-3.5 text-purple-400" />
                    <span>Doctrina &amp; Fórmulas</span>
                </Link>
                <Link
                    href="/yachay"
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                        pathname === "/yachay"
                            ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30 font-bold"
                            : "text-emerald-400/90 hover:text-emerald-200 hover:bg-slate-800 border border-emerald-500/30"
                    }`}
                >
                    <GraduationCap className="w-3.5 h-3.5 text-emerald-400" />
                    <span>AMARU-YACHAY</span>
                    <span className="px-1.5 py-0.2 text-[9px] font-bold rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                        Saberes
                    </span>
                </Link>
                <Link
                    href="/lex"
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                        pathname === "/lex"
                            ? "bg-amber-600 text-white shadow-md shadow-amber-600/30 font-bold"
                            : "text-amber-400/90 hover:text-amber-200 hover:bg-slate-800 border border-amber-500/30"
                    }`}
                >
                    <Scale className="w-3.5 h-3.5 text-amber-400" />
                    <span>AMARU-LEX</span>
                    <span className="px-1.5 py-0.2 text-[9px] font-bold rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                        51 Normas
                    </span>
                </Link>
                <Link
                    href="/ayni"
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                        pathname === "/ayni"
                            ? "bg-rose-600 text-white shadow-md shadow-rose-600/30 font-bold"
                            : "text-rose-400/90 hover:text-rose-200 hover:bg-slate-800 border border-rose-500/30"
                    }`}
                >
                    <Users className="w-3.5 h-3.5 text-rose-400" />
                    <span>AMARU-AYNI</span>
                    <span className="px-1.5 py-0.2 text-[9px] font-bold rounded bg-rose-500/20 text-rose-300 border border-rose-500/40">
                        Comunidad
                    </span>
                </Link>
                <Link
                    href="/glosario"
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                        pathname === "/glosario"
                            ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30 font-bold"
                            : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                    }`}
                >
                    <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Glosario &amp; Mapas</span>
                </Link>
                <Link
                    href="/reporte-ciudadano"
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                        pathname === "/reporte-ciudadano"
                            ? "bg-amber-600 text-white shadow-md shadow-amber-600/30 font-bold"
                            : "text-amber-400/80 hover:text-amber-300 hover:bg-slate-800 border border-amber-500/20"
                    }`}
                >
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                    <span>Reporte Ciudadano</span>
                    <span className="px-1.5 py-0.2 text-[9px] font-bold rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                        Blindado
                    </span>
                </Link>
            </nav>

            {/* Controles Tácticos: Conmutador Estacional, Reloj y ENFEN */}
            <div className="flex items-center gap-3 text-xs">
                {/* Switch Bimodal */}
                <button
                    onClick={toggleSeason}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-semibold transition ${season === "EL_NINO"
                            ? "bg-amber-950/80 border-amber-600 text-amber-300 hover:bg-amber-900"
                            : "bg-cyan-950/80 border-cyan-600 text-cyan-300 hover:bg-cyan-900"
                        }`}
                    title="Alternar régimen de monitoreo estacional"
                >
                    {season === "EL_NINO" ? (
                        <>
                            <Sun className="w-3.5 h-3.5 text-amber-400" />
                            <span>MODO EL NIÑO</span>
                        </>
                    ) : (
                        <>
                            <CloudSnow className="w-3.5 h-3.5 text-cyan-400" />
                            <span>MODO LA NIÑA</span>
                        </>
                    )}
                </button>

                {/* Estado Oficial ENFEN */}
                <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 px-2.5 py-1.5 rounded-lg text-slate-300">
                    <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                    <span className="text-slate-400">ENFEN:</span>
                    <span className="font-semibold text-red-300">{enfen}</span>
                </div>

                {/* Reloj Operativo de Emergencia */}
                <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 px-2.5 py-1.5 rounded-lg text-slate-300 font-mono">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{horaLocal || "--:--:--"}</span>
                </div>
            </div>
        </header>
    );
}