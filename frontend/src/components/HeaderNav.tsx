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
    Filter,
    Database,
    Truck,
    UserCheck,
    Landmark,
    Activity,
    FileText,
    FileEdit,
    HeartPulse,
    Search,
    Globe,
    Cpu,
    Key,
    Flame
} from "lucide-react";

import UserNavBadge from "@/components/UserNavBadge";
import { useLanguage } from "@/context/LanguageContext";

type PillarType = "ALL" | "NACIONAL" | "MUNICIPAL" | "SOCIAL" | "GOBERNANZA";

export default function HeaderNav() {
    const pathname = usePathname();
    const { language, toggleLanguage, t } = useLanguage();
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
        if (savedPillar && ["ALL", "NACIONAL", "MUNICIPAL", "SOCIAL", "GOBERNANZA"].includes(savedPillar)) {
            setActivePillar(savedPillar);
        }
    }, []);

    // Auto-detectar pilar según la ruta actual si se está navegando
    useEffect(() => {
        if (!pathname) return;
        if (
            pathname.startsWith("/municipal") ||
            pathname.startsWith("/dashboard") ||
            pathname === "/pronostico" ||
            pathname === "/planes" ||
            pathname === "/piura" ||
            pathname === "/cajamarca" ||
            pathname === "/redactor" ||
            pathname === "/logistica" ||
            pathname === "/historico"
        ) {
            if (activePillar === "ALL") return;
            setActivePillar("MUNICIPAL");
        } else if (
            pathname === "/ayni" ||
            pathname === "/reporte-ciudadano" ||
            pathname === "/salud/triaje" ||
            pathname === "/yachay" ||
            pathname === "/glosario"
        ) {
            if (activePillar === "ALL") return;
            setActivePillar("SOCIAL");
        } else if (
            pathname === "/edan" ||
            pathname === "/contraloria" ||
            pathname === "/auditoria" ||
            pathname === "/fiscal" ||
            pathname === "/lex" ||
            pathname === "/doctrina" ||
            pathname === "/reniec" ||
            pathname.startsWith("/salud")
        ) {
            if (activePillar === "ALL") return;
            setActivePillar("GOBERNANZA");
        } else if (
            pathname === "/geovisor" ||
            pathname === "/satelites" ||
            pathname === "/imarpe" ||
            pathname === "/enfen" ||
            pathname === "/rios-norte" ||
            pathname === "/quebradas" ||
            pathname === "/fuentes" ||
            pathname === "/simulacion" ||
            pathname === "/meteo"
        ) {
            if (activePillar === "ALL") return;
            setActivePillar("NACIONAL");
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

    // Catálogo de Enlaces Tripartito y de Gobernanza
    const navLinks = [
        // ==================== HUB CENTRAL TRIPARTITO ====================
        {
            href: "/alertas",
            label: t("nav_alert_hub"),
            pillar: "ALL",
            icon: ShieldAlert,
            badge: "CIRCUITO C2",
            badgeColor: "bg-gradient-to-r from-sky-500/20 via-amber-500/20 to-emerald-500/20 text-white border-amber-500/50 animate-pulse font-bold"
        },

        // ==================== NIVEL 1: COED NACIONAL DIGITAL (ANILLO 1: FÍSICO-HIDROCINÉTICO) ====================
        {
            href: "/",
            label: t("nav_mando_nacional"),
            pillar: "NACIONAL",
            icon: LayoutDashboard,
            badge: "MACRO",
            badgeColor: "bg-sky-500/20 text-sky-300 border-sky-500/40"
        },
        {
            href: "/geovisor",
            label: t("nav_geovisor"),
            pillar: "NACIONAL",
            icon: Satellite,
            badge: "3D C2",
            badgeColor: "bg-sky-500/20 text-sky-300 border-sky-500/40"
        },
        {
            href: "/meteo",
            label: t("nav_meteo"),
            pillar: "NACIONAL",
            icon: Zap,
            badge: "FEN & HELADAS",
            badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/40"
        },
        {
            href: "/satelites",
            label: "Satélites NASA",
            pillar: "NACIONAL",
            icon: Satellite,
            badge: "AQUA/TERRA",
            badgeColor: "bg-cyan-500/20 text-cyan-300 border-cyan-500/40"
        },
        {
            href: "/imarpe",
            label: "IMARPE BDO",
            pillar: "NACIONAL",
            icon: Waves,
            badge: "TSM / ATSM",
            badgeColor: "bg-teal-500/20 text-teal-300 border-teal-500/40"
        },
        {
            href: "/enfen",
            label: "ENFEN Oficial",
            pillar: "NACIONAL",
            icon: ShieldAlert,
            badge: "ALERTA",
            badgeColor: "bg-red-500/20 text-red-300 border-red-500/40 animate-pulse"
        },
        {
            href: "/rios-norte",
            label: "Control Fluvial ANA",
            pillar: "NACIONAL",
            icon: Waves,
            badge: "SNIRH",
            badgeColor: "bg-cyan-500/20 text-cyan-300 border-cyan-500/40"
        },
        {
            href: "/quebradas",
            label: "Quebradas & Huaicos",
            pillar: "NACIONAL",
            icon: AlertTriangle,
            badge: "ISAAC / IGP",
            badgeColor: "bg-rose-500/20 text-rose-300 border-rose-500/40"
        },
        {
            href: "/simulacion",
            label: "Simulación Mega-FEN",
            pillar: "NACIONAL",
            icon: Zap,
            badge: "ESTRÉS 26-27",
            badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/40 font-bold"
        },
        {
            href: "/fuentes",
            label: "Fuentes C2",
            pillar: "NACIONAL",
            icon: Database,
            badge: "KURAQ",
            badgeColor: "bg-indigo-500/20 text-indigo-300 border-indigo-500/40"
        },
        {
            href: "/incendios",
            label: t("nav_incendios"),
            pillar: "NACIONAL",
            icon: Flame,
            badge: "FWI / VIIRS",
            badgeColor: "bg-orange-500/20 text-orange-300 border-orange-500/40 font-bold animate-pulse"
        },

        // ==================== NIVEL 2: COED MUNICIPAL DIGITAL (ANILLO 2: TÁCTICO TERRITORIAL) ====================
        {
            href: "/municipal/200101",
            label: t("nav_suite_municipal"),
            pillar: "MUNICIPAL",
            icon: Building2,
            badge: "PP 0068 C2",
            badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/40"
        },
        {
            href: "/pronostico",
            label: t("nav_polar_clock"),
            pillar: "MUNICIPAL",
            icon: Clock,
            badge: "VENTANA DORADA",
            badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/40 font-bold animate-pulse"
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
            href: "/piura",
            label: "Plan Piura 2026-27",
            pillar: "MUNICIPAL",
            icon: Building2,
            badge: "EPICENTRO FEN",
            badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
        },
        {
            href: "/cajamarca",
            label: "PPRRD Cajamarca",
            pillar: "MUNICIPAL",
            icon: Waves,
            badge: "PISCO / 21362",
            badgeColor: "bg-cyan-500/20 text-cyan-300 border-cyan-500/40"
        },
        {
            href: "/planes",
            label: "Planes Contingencia",
            pillar: "MUNICIPAL",
            icon: FileText,
            badge: "PCMD / PPRRD",
            badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
        },
        {
            href: "/redactor",
            label: "Redactor QILQAY",
            pillar: "MUNICIPAL",
            icon: FileEdit,
            badge: "ACTAS C2",
            badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/40"
        },
        {
            href: "/logistica",
            label: "Logística VRP",
            pillar: "MUNICIPAL",
            icon: Truck,
            badge: "ANTI-CORTE",
            badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
        },
        {
            href: "/historico",
            label: "Memoria Histórica",
            pillar: "MUNICIPAL",
            icon: Building2,
            badge: "1983-2017",
            badgeColor: "bg-slate-500/20 text-slate-300 border-slate-500/40"
        },

        // ==================== NIVEL 3: COED SOCIAL DIGITAL (BORDE & SENSOR HUMANO) ====================
        {
            href: "/ayni",
            label: "AMARU-AYNI Comunitario",
            pillar: "SOCIAL",
            icon: Users,
            badge: "SEMÁFORO CÍVICO",
            badgeColor: "bg-rose-500/20 text-rose-300 border-rose-500/40 font-bold"
        },
        {
            href: "/reporte-ciudadano",
            label: t("nav_reporte_ciudadano"),
            pillar: "SOCIAL",
            icon: ShieldCheck,
            badge: "TRÍADA CUP",
            badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-bold animate-pulse"
        },
        {
            href: "/salud/triaje",
            label: t("nav_triaje_salud"),
            pillar: "SOCIAL",
            icon: HeartPulse,
            badge: "MANCHESTER",
            badgeColor: "bg-rose-500/20 text-rose-300 border-rose-500/40"
        },
        {
            href: "/yachay",
            label: t("nav_yachay"),
            pillar: "SOCIAL",
            icon: GraduationCap,
            badge: "SABERES",
            badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
        },
        {
            href: "/glosario",
            label: "Glosario & Mapas",
            pillar: "SOCIAL",
            icon: BookOpen,
            badge: "5 LENGUAS",
            badgeColor: "bg-sky-500/20 text-sky-300 border-sky-500/40"
        },

        // ==================== NIVEL 4: GOBERNANZA, AUDITORÍA Y LEGALIDAD (ANILLO 3: BLINDAJE LEGAL) ====================
        {
            href: "/edan",
            label: t("nav_edan"),
            pillar: "GOBERNANZA",
            icon: Building2,
            badge: "BONO BAE",
            badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-bold"
        },
        {
            href: "/contraloria",
            label: t("nav_control_cgr"),
            pillar: "GOBERNANZA",
            icon: ShieldCheck,
            badge: "CGR 2026",
            badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/40 font-bold"
        },
        {
            href: "/auditoria",
            label: t("nav_audit_worm"),
            pillar: "GOBERNANZA",
            icon: ShieldAlert,
            badge: "ISO 27037 / WORM",
            badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
        },
        {
            href: "/shamir",
            label: "Bóveda Shamir",
            pillar: "GOBERNANZA",
            icon: Cpu,
            badge: "k=2 / ZERO-PII",
            badgeColor: "bg-indigo-500/20 text-indigo-300 border-indigo-500/40 font-bold"
        },
        {
            href: "/fiscal",
            label: "Control Fiscal MEF",
            pillar: "GOBERNANZA",
            icon: Landmark,
            badge: "PP 0068",
            badgeColor: "bg-rose-500/20 text-rose-300 border-rose-500/40"
        },
        {
            href: "/lex",
            label: "AMARU-LEX",
            pillar: "GOBERNANZA",
            icon: Scale,
            badge: "51 NORMAS",
            badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/40"
        },
        {
            href: "/doctrina",
            label: "Doctrina C2",
            pillar: "GOBERNANZA",
            icon: Scale,
            badge: "ART. 377 CP",
            badgeColor: "bg-sky-500/20 text-sky-300 border-sky-500/40"
        },
        {
            href: "/reniec",
            label: "Validación RENIEC",
            pillar: "GOBERNANZA",
            icon: UserCheck,
            badge: "PIDE",
            badgeColor: "bg-sky-500/20 text-sky-300 border-sky-500/40"
        },
        {
            href: "/salud/consola-medica",
            label: "C2 Salud MINSA",
            pillar: "GOBERNANZA",
            icon: HeartPulse,
            badge: "BREAK-GLASS",
            badgeColor: "bg-red-500/20 text-red-300 border-red-500/40 animate-pulse"
        },
        {
            href: "/salud",
            label: "Vigilancia Dengue",
            pillar: "GOBERNANZA",
            icon: Activity,
            badge: "CDC MINSA",
            badgeColor: "bg-teal-500/20 text-teal-300 border-teal-500/40"
        }
    ];

    const visibleLinks = navLinks.filter(
        (link) => activePillar === "ALL" || link.pillar === "ALL" || link.pillar === activePillar
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
                                    {t("app_title")}
                                </span>
                                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-400 border border-amber-500/40">
                                    {language === "es" ? "COED-AMARU" : "C2-GLOBAL"}
                                </span>
                            </div>
                            <span className="text-[10px] text-slate-400 block tracking-wider uppercase">
                                {t("app_subtitle")}
                            </span>
                        </div>
                    </Link>

                    {/* SELECTOR DE PERSPECTIVA DEL ECOSISTEMA (WFP SEED | PERÚ TESTBED | IEEE GLOBAL) */}
                    <div className="hidden xl:flex items-center gap-1 bg-slate-950/80 p-0.5 rounded-lg border border-slate-700/60 text-[10px]">
                        <Link
                            href="/pronostico"
                            className="px-2 py-0.5 rounded text-amber-400/90 hover:text-amber-300 hover:bg-slate-800 transition font-medium"
                            title={t("wfp_perspective_title")}
                        >
                            {t("wfp_perspective")}
                        </Link>
                        <span className="text-slate-600">|</span>
                        <Link
                            href="/alertas"
                            className="px-2 py-0.5 rounded text-sky-400/90 hover:text-sky-300 hover:bg-slate-800 transition font-medium"
                            title={t("peru_perspective_title")}
                        >
                            {t("peru_perspective")}
                        </Link>
                        <span className="text-slate-600">|</span>
                        <Link
                            href="/doctrina/matriz-sinagerd"
                            className="px-2 py-0.5 rounded text-emerald-400 font-bold bg-emerald-950/60 border border-emerald-500/30 hover:bg-emerald-900/60 transition shadow-sm"
                            title={t("ieee_perspective_title")}
                        >
                            {t("ieee_perspective")}
                        </Link>
                    </div>

                    {/* Botón Acceso Rápido Command Palette (Ctrl+K) */}
                    <button
                        onClick={() => window.dispatchEvent(new CustomEvent("open-command-palette"))}
                        className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700/80 shadow-sm transition text-xs group ml-2"
                        title="Buscar distritos, puentes o comandos C2 (Ctrl + K)"
                    >
                        <Search className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition-transform" />
                        <span className="font-medium text-[11px]">Buscador C2...</span>
                        <kbd className="px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 text-[10px] font-mono border border-slate-700">
                            Ctrl K
                        </kbd>
                    </button>
                </div>

                {/* SELECTOR DE PILAR TRIPARTITO (COED NACIONAL | COED MUNICIPAL | COED SOCIAL) */}
                <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800 shadow-inner text-xs">
                    <button
                        onClick={() => handlePillarChange("ALL")}
                        className={`px-2.5 py-1 rounded-lg font-medium transition flex items-center gap-1.5 ${
                            activePillar === "ALL"
                                ? "bg-slate-700 text-white font-bold shadow"
                                : "text-slate-400 hover:text-slate-200"
                        }`}
                        title="Ver todas las consolas digitales integradas"
                    >
                        <Layers className="w-3.5 h-3.5" />
                        <span>{t("pillar_all")}</span>
                    </button>

                    <button
                        onClick={() => handlePillarChange("NACIONAL")}
                        className={`px-2.5 py-1 rounded-lg font-medium transition flex items-center gap-1.5 ${
                            activePillar === "NACIONAL"
                                ? "bg-sky-600 text-white font-bold shadow-md shadow-sky-600/30"
                                : "text-sky-400/80 hover:text-sky-300"
                        }`}
                        title="COED Nacional Amaru: C2 Macro-Estratégico Digital, ENFEN, IMARPE, Radares y Cuencas"
                    >
                        <span>{t("pillar_nacional")}</span>
                    </button>

                    <button
                        onClick={() => handlePillarChange("MUNICIPAL")}
                        className={`px-2.5 py-1 rounded-lg font-medium transition flex items-center gap-1.5 ${
                            activePillar === "MUNICIPAL"
                                ? "bg-amber-600 text-white font-bold shadow-md shadow-amber-600/30"
                                : "text-amber-400/80 hover:text-amber-300"
                        }`}
                        title="COED Municipal Amaru: Suite Municipal 360°, Obras PP 0068, Reloj FEN tc y Planes PCMD/PPRRD"
                    >
                        <span>{t("pillar_municipal")}</span>
                    </button>

                    <button
                        onClick={() => handlePillarChange("SOCIAL")}
                        className={`px-2.5 py-1 rounded-lg font-medium transition flex items-center gap-1.5 ${
                            activePillar === "SOCIAL"
                                ? "bg-rose-600 text-white font-bold shadow-md shadow-rose-600/30"
                                : "text-rose-400/80 hover:text-rose-300"
                        }`}
                        title="COED Social Amaru: AMARU-AYNI Comunitario, Ollas Comunes Ley 31458, Triaje Anti-Bulos"
                    >
                        <span>{t("pillar_social")}</span>
                    </button>

                    <button
                        onClick={() => handlePillarChange("GOBERNANZA")}
                        className={`px-2.5 py-1 rounded-lg font-medium transition flex items-center gap-1.5 ${
                            activePillar === "GOBERNANZA"
                                ? "bg-emerald-600 text-white font-bold shadow-md shadow-emerald-600/30"
                                : "text-emerald-400/80 hover:text-emerald-300"
                        }`}
                        title="Gobernanza y Auditoría: EDAN SINPAD, Contraloría CGR, MEF PP 0068, AMARU-LEX y Bitácora WORM"
                    >
                        <span>{t("pillar_gobernanza")}</span>
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
                                <span>{t("mode_el_nino")}</span>
                            </>
                        ) : (
                            <>
                                <CloudSnow className="w-3.5 h-3.5 text-cyan-400" />
                                <span>{t("mode_la_nina")}</span>
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

                    {/* Conmutador Bilingüe Español / Inglés (Language Switcher) */}
                    <button
                        onClick={toggleLanguage}
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-500/50 text-indigo-300 font-bold transition shadow-sm hover:scale-105"
                        title={language === "es" ? "Cambiar a Inglés (English for IEEE Judges)" : "Switch to Spanish (Español)"}
                    >
                        <Globe className="w-3.5 h-3.5 text-indigo-400" />
                        <span className="font-mono text-[11px] tracking-wider uppercase">
                            {language === "es" ? "ES 🇪🇸" : "EN 🇺🇸"}
                        </span>
                    </button>

                    {/* Identidad y Rol del Usuario Conectado */}
                    <UserNavBadge />
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
                    if (item.pillar === "GOBERNANZA") activeClass = "bg-emerald-600 text-white shadow-md shadow-emerald-600/30 font-bold";

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