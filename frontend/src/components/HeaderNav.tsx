"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    Sun,
    CloudSnow,
    Clock,
    AlertTriangle,
    LayoutDashboard,
    Satellite,
    Building2,
    Scale,
    BookOpen,
    ShieldCheck,
    ShieldAlert,
    Waves,
    Zap,
    GraduationCap,
    Users,
    Layers,
    Filter
} from "lucide-react";

type PillarType = "ALL" | "NACIONAL" | "MUNICIPAL" | "SOCIAL";

export default function HeaderNav() {
    const pathname = usePathname();
    const [season, setSeason] = useState<"EL_NINO" | "LA_NINA">("EL_NINO");
    const [enfen, setEnfen] = useState<string>("ALERTA ACTIVA");
    const [horaLocal, setHoraLocal] = useState<string>("");
    const [activePillar, setActivePillar] = useState<PillarType>("ALL");

    // Reloj dinámico ejecutado estrictamente en cliente para evitar Hydration Mismatch
    useEffect(() => {
        setHoraLocal(new Date().toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
        const timer = setInterval(() => {
            setHoraLocal(new Date().toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    // Sincronizar modo estacional y pilar guardado
    useEffect(() => {
        const savedSeason = localStorage.getItem("seasonMode");
        if (savedSeason === "EL_NINO" || savedSeason === "LA_NINA") {
            setSeason(savedSeason);
        }

        const savedPillar = localStorage.getItem("coenPillar") as PillarType;
        if (savedPillar && ["ALL", "NACIONAL", "MUNICIPAL", "SOCIAL"].includes(savedPillar)) {
            setActivePillar(savedPillar);
        }
    }, []);

    // Auto-detectar pilar según la ruta actual si se está navegando
    useEffect(() => {
        if (!pathname) return;
        if (pathname === "/historico" || pathname.startsWith("/dashboard") || pathname === "/meteo") {
            // Rutas de perfil Municipal
            if (activePillar === "ALL") return;
        } else if (pathname === "/ayni" || pathname === "/reporte-ciudadano" || pathname === "/yachay") {
            // Rutas de perfil Social
            if (activePillar === "ALL") return;
        }
    }, [pathname, activePillar]);

    const handlePillarChange = (pillar: PillarType) => {
        setActivePillar(pillar);
        localStorage.setItem("coenPillar", pillar);
    };

    const toggleSeason = () => {
        const next = season === "EL_NINO" ? "LA_NINA" : "EL_NINO";
        setSeason(next);
        localStorage.setItem("seasonMode", next);
    };

    // Catálogo de Enlaces Tripartito
    const navLinks = [
        // ==================== PILAR 1: COEN NACIONAL DIGITAL ====================
        {
            href: "/",
            label: "Mando C2",
            pillar: "NACIONAL",
            icon: LayoutDashboard,
            badge: null,
            badgeColor: ""
        },
        {
            href: "/geovisor",
            label: "Geovisor C2",
            pillar: "NACIONAL",
            icon: Satellite,
            badge: "3D",
            badgeColor: "bg-sky-500/20 text-sky-300 border-sky-500/40"
        },
        {
            href: "/imarpe",
            label: "IMARPE",
            pillar: "NACIONAL",
            icon: Waves,
            badge: "BDO",
            badgeColor: "bg-teal-500/20 text-teal-300 border-teal-500/40"
        },
        {
            href: "/enfen",
            label: "ENFEN",
            pillar: "NACIONAL",
            icon: ShieldAlert,
            badge: "PDF",
            badgeColor: "bg-red-500/20 text-red-300 border-red-500/40 animate-pulse"
        },
        {
            href: "/lex",
            label: "AMARU-LEX",
            pillar: "NACIONAL",
            icon: Scale,
            badge: "51 Normas",
            badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/40"
        },
        {
            href: "/doctrina",
            label: "Doctrina",
            pillar: "NACIONAL",
            icon: Scale,
            badge: null,
            badgeColor: ""
        },

        // ==================== PILAR 2: COEN MUNICIPAL DIGITAL ====================
        {
            href: "/historico",
            label: "Memoria Histórica",
            pillar: "MUNICIPAL",
            icon: Building2,
            badge: "1983-2017",
            badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/40"
        },
        {
            href: "/dashboard/150118",
            label: "Inspector Distrital",
            pillar: "MUNICIPAL",
            icon: Building2,
            badge: "UBIGEO",
            badgeColor: "bg-indigo-500/20 text-indigo-300 border-indigo-500/40"
        },
        {
            href: "/meteo",
            label: "Open-Meteo FEN",
            pillar: "MUNICIPAL",
            icon: Zap,
            badge: "893 D.S. 124",
            badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/40"
        },

        // ==================== PILAR 3: COEN SOCIAL DIGITAL ====================
        {
            href: "/ayni",
            label: "AMARU-AYNI",
            pillar: "SOCIAL",
            icon: Users,
            badge: "Comunidad",
            badgeColor: "bg-rose-500/20 text-rose-300 border-rose-500/40"
        },
        {
            href: "/reporte-ciudadano",
            label: "Reporte Ciudadano",
            pillar: "SOCIAL",
            icon: ShieldCheck,
            badge: "Blindado",
            badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
        },
        {
            href: "/yachay",
            label: "AMARU-YACHAY",
            pillar: "SOCIAL",
            icon: GraduationCap,
            badge: "Saberes",
            badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
        },
        {
            href: "/glosario",
            label: "Glosario & Mapas",
            pillar: "SOCIAL",
            icon: BookOpen,
            badge: null,
            badgeColor: ""
        }
    ];

    const visibleLinks = navLinks.filter(
        (link) => activePillar === "ALL" || link.pillar === activePillar
    );

    return (
        <header className="flex flex-col bg-slate-900 border-b border-slate-800">
            {/* Barra Superior: Logo, Selector de Perfiles Tripartito y Métricas */}
            <div className="flex flex-col lg:flex-row justify-between items-center px-4 py-2.5 gap-3 border-b border-slate-800/60 bg-slate-950/40">
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
                                    COEN TRIPARTITO
                                </span>
                            </div>
                            <span className="text-[10px] text-slate-400 block tracking-wider uppercase">
                                Plataforma Nacional, Municipal &amp; Comunitaria
                            </span>
                        </div>
                    </Link>
                </div>

                {/* SELECTOR DE PILAR TRIPARTITO (COEN NACIONAL | COEN MUNICIPAL | COEN SOCIAL) */}
                <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800 shadow-inner text-xs">
                    <button
                        onClick={() => handlePillarChange("ALL")}
                        className={`px-2.5 py-1 rounded-lg font-medium transition flex items-center gap-1.5 ${
                            activePillar === "ALL"
                                ? "bg-slate-700 text-white font-bold shadow"
                                : "text-slate-400 hover:text-slate-200"
                        }`}
                        title="Ver todas las consolas integradas"
                    >
                        <Layers className="w-3.5 h-3.5" />
                        <span>Todos</span>
                    </button>

                    <button
                        onClick={() => handlePillarChange("NACIONAL")}
                        className={`px-2.5 py-1 rounded-lg font-medium transition flex items-center gap-1.5 ${
                            activePillar === "NACIONAL"
                                ? "bg-sky-600 text-white font-bold shadow-md shadow-sky-600/30"
                                : "text-sky-400/80 hover:text-sky-300"
                        }`}
                        title="COEN Nacional: C2 Macro-Estratégico, ENFEN, IMARPE, SISMATE"
                    >
                        <span>🏛️ COEN Nacional</span>
                    </button>

                    <button
                        onClick={() => handlePillarChange("MUNICIPAL")}
                        className={`px-2.5 py-1 rounded-lg font-medium transition flex items-center gap-1.5 ${
                            activePillar === "MUNICIPAL"
                                ? "bg-amber-600 text-white font-bold shadow-md shadow-amber-600/30"
                                : "text-amber-400/80 hover:text-amber-300"
                        }`}
                        title="COEN Municipal: Memoria Histórica 1983-2017, Inspector Distrital Open-Meteo"
                    >
                        <span>🏢 COEN Municipal</span>
                    </button>

                    <button
                        onClick={() => handlePillarChange("SOCIAL")}
                        className={`px-2.5 py-1 rounded-lg font-medium transition flex items-center gap-1.5 ${
                            activePillar === "SOCIAL"
                                ? "bg-rose-600 text-white font-bold shadow-md shadow-rose-600/30"
                                : "text-rose-400/80 hover:text-rose-300"
                        }`}
                        title="COEN Social: AMARU-AYNI, Ollas Comunes, Reporte Ciudadano, Saberes Yachay"
                    >
                        <span>🤝 COEN Social</span>
                    </button>
                </div>

                {/* Controles Tácticos: Conmutador Estacional, Reloj y ENFEN */}
                <div className="flex items-center gap-2.5 text-xs">
                    {/* Switch Bimodal */}
                    <button
                        onClick={toggleSeason}
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border font-semibold transition ${
                            season === "EL_NINO"
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
                    <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 px-2.5 py-1 rounded-lg text-slate-300">
                        <AlertTriangle className="w-3 h-3 text-red-400" />
                        <span className="text-slate-400">ENFEN:</span>
                        <span className="font-semibold text-red-300">{enfen}</span>
                    </div>

                    {/* Reloj Operativo de Emergencia */}
                    <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 px-2.5 py-1 rounded-lg text-slate-300 font-mono">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>{horaLocal || "--:--:--"}</span>
                    </div>
                </div>
            </div>

            {/* Barra Inferior: Navegación de Consolas según el Pilar Seleccionado */}
            <nav className="flex items-center gap-1.5 px-4 py-2 overflow-x-auto bg-slate-950/80 shadow-inner scrollbar-thin scrollbar-thumb-slate-800">
                {visibleLinks.map((item) => {
                    const Icon = item.icon;
                    const isActive =
                        item.href === "/"
                            ? pathname === "/"
                            : pathname === item.href || (item.href.startsWith("/dashboard") && pathname?.startsWith("/dashboard"));

                    let activeClass = "bg-blue-600 text-white shadow-md shadow-blue-600/30 font-bold";
                    if (item.pillar === "NACIONAL") activeClass = "bg-sky-600 text-white shadow-md shadow-sky-600/30 font-bold";
                    if (item.pillar === "MUNICIPAL") activeClass = "bg-amber-600 text-white shadow-md shadow-amber-600/30 font-bold";
                    if (item.pillar === "SOCIAL") activeClass = "bg-rose-600 text-white shadow-md shadow-rose-600/30 font-bold";

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                                isActive
                                    ? activeClass
                                    : "text-slate-300 hover:text-white hover:bg-slate-800/80 border border-transparent hover:border-slate-700"
                            }`}
                        >
                            <Icon className="w-3.5 h-3.5" />
                            <span>{item.label}</span>
                            {item.badge && (
                                <span className={`px-1.5 py-0.2 text-[9px] font-bold rounded border ${item.badgeColor}`}>
                                    {item.badge}
                                </span>
                            )}
                        </Link>
                    );
                })}
            </nav>
        </header>
    );
}