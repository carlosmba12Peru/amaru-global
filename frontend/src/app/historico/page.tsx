"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
    Search,
    Building2,
    Calendar,
    AlertTriangle,
    ShieldAlert,
    GraduationCap,
    HeartPulse,
    Waves,
    BookOpen,
    Printer,
    MapPin,
    Users,
    Activity,
    ExternalLink,
    ChevronRight,
    Sparkles,
    FileText,
    CheckCircle2,
    Clock,
    Layers,
    Compass,
    Phone,
    Mail,
    Sprout,
    Coins,
    FileSpreadsheet
} from "lucide-react";

interface ImpactoEducativo {
    colegios_afectados: number;
    colegios_inhabitables: number;
    semanas_perdidas: number;
    albergues: string[];
    observacion: string;
}

interface ImpactoSanitario {
    brotes: string[];
    casos: number;
    postas_afectadas: string;
}

interface ImpactoAgropecuarioMinag {
    valle_oficial: string;
    1983?: {
        perdida_ha: number;
        afectada_ha: number;
        cultivo_critico?: string;
        bocatomas_danadas?: number;
    };
    1998: {
        perdida_ha: number;
        afectada_ha: number;
        familias_campesinas: number;
        presupuesto_soles: number;
        infraestructura: string;
    };
    2017?: {
        perdida_ha: number;
        afectada_ha: number;
        cultivo_critico?: string;
    };
    cultivos_principales: string[];
    vulnerabilidad_fisiologica: string;
    infraestructura_riego: string[];
}

interface MemoriaDistrital {
    ubigeo: string;
    distrito: string;
    provincia: string;
    departamento: string;
    lat: number;
    lng: number;
    poblacion: number;
    nivel_riesgo_cenepred: string;
    declarado_ds124: boolean;
    cuenca_principal: string;
    nivel_exposicion_historica: string;
    resumen_historico: string;
    eventos_historicos: string[];
    impacto_educativo: {
        "1983": ImpactoEducativo;
        "1998": ImpactoEducativo;
        "2017": ImpactoEducativo;
    };
    impacto_sanitario_epidemiologico: {
        "1983": ImpactoSanitario;
        "1998": ImpactoSanitario;
        "2017": ImpactoSanitario;
        vector_predominante: string;
        semanas_criticas_epidemicas: string;
    };
    impacto_agropecuario_minag?: ImpactoAgropecuarioMinag;
    impacto_fisico_hidrologico: {
        puntos_criticos: string[];
        quebradas_criticas_asociadas: string[];
        vias_aislamiento: string[];
        dias_aislamiento_promedio: number;
        hectareas_agricolas_perdidas: number;
        patron_hidrologico: string;
    };
    lecciones_aprendidas_caf_indeci: {
        sintesis_lecciones: string;
        fuentes_validadas: string[];
    };
    contacto_defensa_civil?: {
        funcionario: string;
        telefono: string;
        correo: string;
    };
    etnoterritorial?: {
        variante_linguistica: string;
        lengua_nombre: string;
        es_bilingue_requerido: boolean;
        regimen_difusion: string;
    };
}

const DISTRITOS_RAPIDOS = [
    { ubigeo: "200105", nombre: "Catacaos", depto: "Piura", icono: "🌊" },
    { ubigeo: "200104", nombre: "Castilla", depto: "Piura", icono: "💧" },
    { ubigeo: "200101", nombre: "Piura", depto: "Piura", icono: "🏛️" },
    { ubigeo: "200114", nombre: "Tambogrande", depto: "Piura", icono: "🥭" },
    { ubigeo: "140304", nombre: "Íllimo", depto: "Lambayeque", icono: "🌾" },
    { ubigeo: "150118", nombre: "Chosica (Lurigancho)", depto: "Lima", icono: "⛰️" },
    { ubigeo: "130102", nombre: "El Porvenir", depto: "La Libertad", icono: "⚠️" },
    { ubigeo: "240101", nombre: "Tumbes", depto: "Tumbes", icono: "🌴" },
    { ubigeo: "021101", nombre: "Huarmey", depto: "Áncash", icono: "🚧" }
];

export default function HistoricoConsolePage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [currentUbigeo, setCurrentUbigeo] = useState("200105"); // Default: Catacaos
    const [memoria, setMemoria] = useState<MemoriaDistrital | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<"general" | "educacion" | "salud" | "hidrologia" | "agropecuario" | "lecciones">("general");
    const [selectedYear, setSelectedYear] = useState<"1983" | "1998" | "2017">("2017");

    const searchTimeout = useRef<NodeJS.Timeout | null>(null);

    // Cargar distrito activo
    useEffect(() => {
        async function fetchDistrito(ubg: string) {
            setLoading(true);
            try {
                const res = await fetch(`http://localhost:8000/api/historico/distrito/${ubg}`);
                if (res.ok) {
                    const data = await res.json();
                    setMemoria(data);
                }
            } catch (err) {
                console.error("Error al cargar memoria histórica:", err);
            } finally {
                setLoading(false);
            }
        }
        fetchDistrito(currentUbigeo);
    }, [currentUbigeo]);

    // Búsqueda autocompletada
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setSearchQuery(val);
        if (searchTimeout.current) clearTimeout(searchTimeout.current);

        if (val.trim().length >= 2) {
            setIsSearching(true);
            searchTimeout.current = setTimeout(async () => {
                try {
                    const res = await fetch(`http://localhost:8000/api/data/districts/search?q=${encodeURIComponent(val)}&limit=8`);
                    if (res.ok) {
                        const results = await res.json();
                        setSearchResults(results);
                    }
                } catch (err) {
                    console.error("Error en búsqueda:", err);
                } finally {
                    setIsSearching(false);
                }
            }, 250);
        } else {
            setSearchResults([]);
            setIsSearching(false);
        }
    };

    const handleSelectDistrito = (ubg: string) => {
        setCurrentUbigeo(ubg);
        setSearchQuery("");
        setSearchResults([]);
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="min-h-screen text-slate-100 pb-16">
            {/* Header / Hero de la Consola Histórica */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 mb-6 backdrop-blur shadow-xl">
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                    <div className="flex items-center gap-3.5">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 via-orange-600 to-red-700 flex items-center justify-center text-2xl shadow-lg shadow-orange-600/30 border border-amber-400/30">
                            🏛️
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-xl font-black tracking-tight text-white">
                                    Consola de Memoria Histórica Municipal de Desastres
                                </h1>
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                                    COEN • 1,891 DISTRITOS
                                </span>
                            </div>
                            <p className="text-xs text-slate-400 mt-0.5">
                                Inteligencia territorial retrospectiva basada en las memorias oficiales de la{" "}
                                <strong className="text-slate-300">CAF</strong>, <strong className="text-slate-300">INDECI</strong>,{" "}
                                <strong className="text-emerald-400 font-semibold">MINAG-OIA</strong>,{" "}
                                <strong className="text-slate-300">OPS/OMS</strong> y <strong className="text-slate-300">MINEDU</strong> (FEN 1982-1983, 1997-1998 y 2017).
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2.5 w-full lg:w-auto justify-end">
                        <button
                            id="btn-print-dossier"
                            onClick={handlePrint}
                            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 hover:text-white transition shadow-sm"
                        >
                            <Printer className="w-4 h-4 text-amber-400" />
                            <span>Imprimir Ficha Ejecutiva</span>
                        </button>
                        <Link
                            href={`/dashboard/${currentUbigeo}`}
                            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-blue-600/30 hover:bg-blue-600/50 border border-blue-500/40 text-xs font-semibold text-blue-300 hover:text-white transition shadow-sm"
                        >
                            <Activity className="w-4 h-4 text-blue-400" />
                            <span>Ver Telemetría en Vivo</span>
                        </Link>
                    </div>
                </div>

                {/* Buscador de Distritos y Ubigeos */}
                <div className="mt-4 relative">
                    <div className="relative">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                            id="input-historico-search"
                            type="text"
                            value={searchQuery}
                            onChange={handleSearchChange}
                            placeholder="Buscar municipio por UBIGEO, nombre de distrito, provincia o departamento (ej. 200105, Catacaos, Chosica, Íllimo)..."
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-950/90 border border-slate-700 focus:border-amber-500 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none transition shadow-inner"
                        />
                        {isSearching && (
                            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-amber-400 font-mono animate-pulse">
                                Buscando...
                            </span>
                        )}
                    </div>

                    {/* Desplegable de Resultados de Búsqueda */}
                    {searchResults.length > 0 && (
                        <div className="absolute left-0 right-0 top-full mt-2 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden divide-y divide-slate-800 max-h-80 overflow-y-auto">
                            {searchResults.map((d) => (
                                <button
                                    key={d.ubigeo}
                                    onClick={() => handleSelectDistrito(d.ubigeo)}
                                    className="w-full text-left px-4 py-3 hover:bg-slate-800/80 flex items-center justify-between transition group"
                                >
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-sm text-white group-hover:text-amber-300 transition">
                                                {d.distrito}
                                            </span>
                                            <span className="font-mono text-xs px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                                                UBIGEO {d.ubigeo}
                                            </span>
                                            {d.declarado_ds124 && (
                                                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-red-500/20 text-red-400 border border-red-500/30">
                                                    D.S. 124
                                                </span>
                                            )}
                                        </div>
                                        <div className="text-xs text-slate-400 mt-0.5">
                                            {d.provincia}, {d.departamento} • Riesgo SIGRID: {d.peligro_cenepred}
                                        </div>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 transition transform group-hover:translate-x-1" />
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Chips de Distritos Emblemáticos FEN */}
                    <div className="flex items-center gap-2 mt-3 flex-wrap">
                        <span className="text-xs font-semibold text-slate-400 mr-1 flex items-center gap-1">
                            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                            Casos Emblemáticos FEN:
                        </span>
                        {DISTRITOS_RAPIDOS.map((d) => (
                            <button
                                key={d.ubigeo}
                                onClick={() => handleSelectDistrito(d.ubigeo)}
                                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition border ${
                                    currentUbigeo === d.ubigeo
                                        ? "bg-amber-500/20 text-amber-300 border-amber-500/60 font-bold shadow-sm"
                                        : "bg-slate-950 text-slate-400 hover:text-slate-200 border-slate-800 hover:border-slate-700"
                                }`}
                            >
                                <span>{d.icono}</span>
                                <span>{d.nombre}</span>
                                <span className="text-[10px] opacity-60">({d.depto})</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="p-16 text-center bg-slate-900/50 border border-slate-800 rounded-2xl">
                    <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <h3 className="font-bold text-slate-200">Cargando Memoria Histórica Territorial...</h3>
                    <p className="text-xs text-slate-500 mt-1 font-mono">Indexando compendios CAF, INDECI, MINAG-OIA, OPS/OMS y MINEDU</p>
                </div>
            ) : memoria ? (
                <div className="space-y-6">
                    {/* Tarjeta de Identidad Territorial del Municipio */}
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

                        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                            <div>
                                <div className="flex items-center gap-2.5 flex-wrap">
                                    <span className="font-mono text-xs px-2.5 py-1 rounded-md bg-amber-500/20 text-amber-300 font-black border border-amber-500/40">
                                        UBIGEO: {memoria.ubigeo}
                                    </span>
                                    <h2 className="text-2xl font-black text-white tracking-wide">
                                        Municipalidad Distrital de {memoria.distrito}
                                    </h2>
                                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                                        {memoria.provincia}, {memoria.departamento}
                                    </span>
                                </div>
                                <p className="text-sm text-slate-300 mt-2 max-w-4xl leading-relaxed">
                                    {memoria.resumen_historico}
                                </p>
                            </div>

                            <div className="flex flex-wrap lg:flex-nowrap gap-3 w-full lg:w-auto">
                                <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 flex-1 lg:flex-initial min-w-[140px]">
                                    <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold block">
                                        Cuenca Principal
                                    </span>
                                    <span className="text-xs font-bold text-sky-400 block mt-0.5 truncate">
                                        {memoria.cuenca_principal}
                                    </span>
                                </div>
                                <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 flex-1 lg:flex-initial min-w-[140px]">
                                    <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold block">
                                        Peligro CENEPRED
                                    </span>
                                    <span
                                        className={`text-xs font-bold block mt-0.5 ${
                                            memoria.nivel_riesgo_cenepred.toUpperCase().includes("MUY ALTO")
                                                ? "text-red-400"
                                                : "text-amber-400"
                                        }`}
                                    >
                                        {memoria.nivel_riesgo_cenepred}
                                    </span>
                                </div>
                                <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 flex-1 lg:flex-initial min-w-[140px]">
                                    <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold block">
                                        Amparo D.S. 124
                                    </span>
                                    <span
                                        className={`text-xs font-bold block mt-0.5 ${
                                            memoria.declarado_ds124 ? "text-emerald-400" : "text-slate-400"
                                        }`}
                                    >
                                        {memoria.declarado_ds124 ? "DECLARADO EN EMERGENCIA" : "MONITOREO REGULAR"}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Metadatos adicionales de contacto municipal */}
                        {memoria.contacto_defensa_civil && (
                            <div className="mt-4 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-3">
                                <div className="flex items-center gap-4">
                                    <span className="flex items-center gap-1.5">
                                        <Building2 className="w-3.5 h-3.5 text-slate-500" />
                                        <strong>GRD Municipal:</strong> {memoria.contacto_defensa_civil.funcionario}
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        <Phone className="w-3.5 h-3.5 text-emerald-400" />
                                        {memoria.contacto_defensa_civil.telefono}
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        <Mail className="w-3.5 h-3.5 text-sky-400" />
                                        {memoria.contacto_defensa_civil.correo}
                                    </span>
                                </div>
                                {memoria.etnoterritorial && (
                                    <div className="flex items-center gap-2">
                                        <span className="text-[11px] px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                                            Régimen {memoria.etnoterritorial.regimen_difusion} ({memoria.etnoterritorial.lengua_nombre})
                                        </span>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Selector de Pestañas Temáticas */}
                    <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-2">
                        <button
                            id="tab-btn-general"
                            onClick={() => setActiveTab("general")}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition ${
                                activeTab === "general"
                                    ? "bg-amber-600 text-white shadow-md shadow-amber-600/30"
                                    : "bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800"
                            }`}
                        >
                            <Calendar className="w-4 h-4" />
                            <span>1. Radiografía Comparativa (1983 - 1998 - 2017)</span>
                        </button>
                        <button
                            id="tab-btn-educacion"
                            onClick={() => setActiveTab("educacion")}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition ${
                                activeTab === "educacion"
                                    ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                                    : "bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800"
                            }`}
                        >
                            <GraduationCap className="w-4 h-4" />
                            <span>2. Impacto Educativo (MINEDU / CISE)</span>
                        </button>
                        <button
                            id="tab-btn-salud"
                            onClick={() => setActiveTab("salud")}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition ${
                                activeTab === "salud"
                                    ? "bg-rose-600 text-white shadow-md shadow-rose-600/30"
                                    : "bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800"
                            }`}
                        >
                            <HeartPulse className="w-4 h-4" />
                            <span>3. Alerta Sanitaria &amp; Brotes (OPS/OMS)</span>
                        </button>
                        <button
                            id="tab-btn-hidrologia"
                            onClick={() => setActiveTab("hidrologia")}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition ${
                                activeTab === "hidrologia"
                                    ? "bg-sky-600 text-white shadow-md shadow-sky-600/30"
                                    : "bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800"
                            }`}
                        >
                            <Waves className="w-4 h-4" />
                            <span>4. Puntos Críticos &amp; Quebradas</span>
                        </button>
                        <button
                            id="tab-btn-agropecuario"
                            onClick={() => setActiveTab("agropecuario")}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition ${
                                activeTab === "agropecuario"
                                    ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30"
                                    : "bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800"
                            }`}
                        >
                            <Sprout className="w-4 h-4 text-emerald-400" />
                            <span>5. Sector Agropecuario &amp; Riego (MINAG - OIA)</span>
                        </button>
                        <button
                            id="tab-btn-lecciones"
                            onClick={() => setActiveTab("lecciones")}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition ${
                                activeTab === "lecciones"
                                    ? "bg-purple-600 text-white shadow-md shadow-purple-600/30"
                                    : "bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800"
                            }`}
                        >
                            <BookOpen className="w-4 h-4" />
                            <span>6. Lecciones CAF &amp; Hoja de Ruta</span>
                        </button>
                    </div>

                    {/* Selector de Evento FEN Específico para Análisis Detallado */}
                    <div className="flex items-center justify-between bg-slate-950 p-3 rounded-xl border border-slate-800">
                        <span className="text-xs font-bold text-slate-400 flex items-center gap-2">
                            <Clock className="w-4 h-4 text-amber-400" />
                            Seleccionar Evento Climático Histórico para Detalle:
                        </span>
                        <div className="flex items-center gap-2">
                            {(["1983", "1998", "2017"] as const).map((yr) => (
                                <button
                                    key={yr}
                                    onClick={() => setSelectedYear(yr)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-black transition border ${
                                        selectedYear === yr
                                            ? "bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/20"
                                            : "bg-slate-900 text-slate-400 hover:text-white border-slate-700"
                                    }`}
                                >
                                    {yr === "1983" && "FEN 1982-1983 (Mega)"}
                                    {yr === "1998" && "FEN 1997-1998 (Mega)"}
                                    {yr === "2017" && "Niño Costero 2017"}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* CONTENIDO DE PESTAÑAS */}

                    {/* PESTAÑA 1: RADIOGRAFÍA COMPARATIVA */}
                    {activeTab === "general" && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {(["1983", "1998", "2017"] as const).map((yr) => {
                                    const edu = memoria.impacto_educativo[yr];
                                    const sal = memoria.impacto_sanitario_epidemiologico[yr];
                                    const isHighlight = selectedYear === yr;

                                    return (
                                        <div
                                            key={yr}
                                            onClick={() => setSelectedYear(yr)}
                                            className={`p-5 rounded-2xl border transition cursor-pointer ${
                                                isHighlight
                                                    ? "bg-slate-900/90 border-amber-500 shadow-xl shadow-amber-500/10 ring-1 ring-amber-500"
                                                    : "bg-slate-900/50 border-slate-800 hover:border-slate-700"
                                            }`}
                                        >
                                            <div className="flex items-center justify-between mb-3">
                                                <span className="text-base font-black text-white">
                                                    {yr === "1983" && "Mega FEN 1982-1983"}
                                                    {yr === "1998" && "Mega FEN 1997-1998"}
                                                    {yr === "2017" && "Niño Costero 2017"}
                                                </span>
                                                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-amber-300">
                                                    {yr}
                                                </span>
                                            </div>

                                            <div className="space-y-3">
                                                <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800/80">
                                                    <div className="text-[10px] text-slate-500 uppercase font-bold">
                                                        Sector Escolar (MINEDU)
                                                    </div>
                                                    <div className="flex justify-between items-center mt-1">
                                                        <span className="text-xs text-slate-300">Colegios Afectados:</span>
                                                        <span className="text-sm font-bold text-blue-400">
                                                            {edu.colegios_afectados}
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between items-center mt-0.5">
                                                        <span className="text-xs text-slate-300">Aulas Inhabitables:</span>
                                                        <span className="text-sm font-bold text-red-400">
                                                            {edu.colegios_inhabitables}
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between items-center mt-0.5">
                                                        <span className="text-xs text-slate-300">Semanas de Clases Perdidas:</span>
                                                        <span className="text-sm font-bold text-amber-400">
                                                            {edu.semanas_perdidas} sem
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800/80">
                                                    <div className="text-[10px] text-slate-500 uppercase font-bold">
                                                        Salud &amp; Brotes (OPS)
                                                    </div>
                                                    <div className="flex justify-between items-center mt-1">
                                                        <span className="text-xs text-slate-300">Casos Registrados:</span>
                                                        <span className="text-sm font-bold text-rose-400">
                                                            ~{sal.casos.toLocaleString()}
                                                        </span>
                                                    </div>
                                                    <div className="mt-1.5 flex flex-wrap gap-1">
                                                        {sal.brotes.slice(0, 3).map((b, idx) => (
                                                            <span
                                                                key={idx}
                                                                className="text-[10px] px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-300 border border-rose-500/20"
                                                            >
                                                                {b}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>

                                            <p className="text-xs text-slate-400 mt-3 line-clamp-3 italic">
                                                &ldquo;{edu.observacion}&rdquo;
                                            </p>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Resumen Físico, Agrícola y Pérdidas del Distrito */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
                                    <div className="flex items-center gap-2 text-emerald-400 mb-2">
                                        <Sprout className="w-4 h-4" />
                                        <h4 className="text-xs font-bold uppercase tracking-wider">
                                            Sector Agrario (MINAG-OIA)
                                        </h4>
                                    </div>
                                    <div className="text-2xl font-black text-white">
                                        ~{memoria.impacto_fisico_hidrologico.hectareas_agricolas_perdidas.toLocaleString()} Has
                                    </div>
                                    <p className="text-xs text-slate-400 mt-1">
                                        Valle: <strong className="text-slate-200">{memoria.impacto_agropecuario_minag?.valle_oficial || memoria.cuenca_principal}</strong>
                                    </p>
                                </div>

                                <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
                                    <div className="flex items-center gap-2 text-amber-400 mb-2">
                                        <Compass className="w-4 h-4" />
                                        <h4 className="text-xs font-bold uppercase tracking-wider">
                                            Aislamiento Vial Promedio
                                        </h4>
                                    </div>
                                    <div className="text-2xl font-black text-white">
                                        {memoria.impacto_fisico_hidrologico.dias_aislamiento_promedio} días
                                    </div>
                                    <p className="text-xs text-slate-400 mt-1 truncate">
                                        Vías: {memoria.impacto_fisico_hidrologico.vias_aislamiento.join(", ")}
                                    </p>
                                </div>

                                <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
                                    <div className="flex items-center gap-2 text-sky-400 mb-2">
                                        <Layers className="w-4 h-4" />
                                        <h4 className="text-xs font-bold uppercase tracking-wider">
                                            Patrón Hidrológico
                                        </h4>
                                    </div>
                                    <div className="text-xs font-bold text-white mt-1">
                                        {memoria.impacto_fisico_hidrologico.patron_hidrologico}
                                    </div>
                                    <p className="text-[11px] text-slate-400 mt-1">
                                        Cuenca receptora: {memoria.cuenca_principal}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* PESTAÑA 2: IMPACTO EDUCATIVO (MINEDU / CISE) */}
                    {activeTab === "educacion" && (
                        <div className="space-y-6">
                            <div className="p-5 bg-slate-900 border border-blue-500/30 rounded-2xl shadow-lg">
                                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
                                            <GraduationCap className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h3 className="text-base font-bold text-white">
                                                Expediente de Vulnerabilidad Escolar • {memoria.distrito} ({selectedYear})
                                            </h3>
                                            <p className="text-xs text-slate-400">
                                                Fuente: MINEDU / PUCP CISE - Colección Especial Manuel Etesse (&ldquo;El FEN y la Escuela Peruana&rdquo;)
                                            </p>
                                        </div>
                                    </div>
                                    <span className="text-xs font-black px-2.5 py-1 rounded bg-blue-500/20 text-blue-300 border border-blue-500/40">
                                        AÑO {selectedYear}
                                    </span>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5">
                                    <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-center">
                                        <span className="text-xs text-slate-400 block font-medium">Colegios con Anegamiento</span>
                                        <span className="text-3xl font-black text-blue-400 mt-1 block">
                                            {memoria.impacto_educativo[selectedYear].colegios_afectados}
                                        </span>
                                        <span className="text-[10px] text-slate-500 mt-1 block">Locales educativos en la jurisdicción</span>
                                    </div>
                                    <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-center">
                                        <span className="text-xs text-slate-400 block font-medium">Locales Inhabitables / Colapsados</span>
                                        <span className="text-3xl font-black text-red-400 mt-1 block">
                                            {memoria.impacto_educativo[selectedYear].colegios_inhabitables}
                                        </span>
                                        <span className="text-[10px] text-slate-500 mt-1 block">Paredes de adobe o filtración total de techos</span>
                                    </div>
                                    <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-center">
                                        <span className="text-xs text-slate-400 block font-medium">Tiempo Lectivo Perdido</span>
                                        <span className="text-3xl font-black text-amber-400 mt-1 block">
                                            {memoria.impacto_educativo[selectedYear].semanas_perdidas} semanas
                                        </span>
                                        <span className="text-[10px] text-slate-500 mt-1 block">Retraso directo en calendario escolar</span>
                                    </div>
                                </div>

                                <div className="mt-5 p-4 bg-slate-950/80 rounded-xl border border-slate-800">
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-2 flex items-center gap-2">
                                        <AlertTriangle className="w-4 h-4 text-amber-400" />
                                        Crónica Situacional del Sector Educación:
                                    </h4>
                                    <p className="text-xs text-slate-300 leading-relaxed italic">
                                        &ldquo;{memoria.impacto_educativo[selectedYear].observacion}&rdquo;
                                    </p>
                                </div>

                                <div className="mt-4 p-4 bg-slate-950/80 rounded-xl border border-slate-800">
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                                        Colegios Utilizados Históricamente como Albergues Comunales:
                                    </h4>
                                    <div className="flex flex-wrap gap-2">
                                        {memoria.impacto_educativo[selectedYear].albergues.map((alb, i) => (
                                            <span
                                                key={i}
                                                className="px-3 py-1.5 rounded-lg bg-blue-900/30 text-blue-300 border border-blue-700/50 text-xs font-medium"
                                            >
                                                🏫 {alb}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* PESTAÑA 3: SALUD PÚBLICA & BROTES (OPS/OMS) */}
                    {activeTab === "salud" && (
                        <div className="space-y-6">
                            <div className="p-5 bg-slate-900 border border-rose-500/30 rounded-2xl shadow-lg">
                                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
                                            <HeartPulse className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h3 className="text-base font-bold text-white">
                                                Expediente Epidemiológico Post-Inundación • {memoria.distrito} ({selectedYear})
                                            </h3>
                                            <p className="text-xs text-slate-400">
                                                Fuente: OPS / OMS - &ldquo;Crónica de Desastres y Repercusiones Sanitarias del FEN&rdquo; (Capítulo 11 Perú)
                                            </p>
                                        </div>
                                    </div>
                                    <span className="text-xs font-black px-2.5 py-1 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40">
                                        AÑO {selectedYear}
                                    </span>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
                                    <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
                                        <span className="text-xs text-slate-400 block font-medium">Brotes Registrados:</span>
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {memoria.impacto_sanitario_epidemiologico[selectedYear].brotes.map((b, i) => (
                                                <span
                                                    key={i}
                                                    className="px-2.5 py-1 rounded-md bg-rose-500/20 text-rose-300 border border-rose-500/40 text-xs font-bold"
                                                >
                                                    ⚠️ {b}
                                                </span>
                                            ))}
                                        </div>
                                        <div className="mt-4 pt-3 border-t border-slate-800 text-xs text-slate-400">
                                            Total aproximado de atenciones de emergencia:{" "}
                                            <strong className="text-rose-400 font-mono text-sm">
                                                ~{memoria.impacto_sanitario_epidemiologico[selectedYear].casos.toLocaleString()} casos
                                            </strong>
                                        </div>
                                    </div>

                                    <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
                                        <span className="text-xs text-slate-400 block font-medium">Vectores y Periodo Crítico:</span>
                                        <div className="mt-2 space-y-2">
                                            <div>
                                                <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold block">
                                                    Vector Principal de Transmisión:
                                                </span>
                                                <span className="text-xs font-bold text-amber-300">
                                                    🦟 {memoria.impacto_sanitario_epidemiologico.vector_predominante}
                                                </span>
                                            </div>
                                            <div>
                                                <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold block">
                                                    Ventana Temporal de Máximo Contagio:
                                                </span>
                                                <span className="text-xs font-bold text-white">
                                                    📅 {memoria.impacto_sanitario_epidemiologico.semanas_criticas_epidemicas}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-4 p-4 bg-slate-950/80 rounded-xl border border-slate-800">
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-2 flex items-center gap-2">
                                        <AlertTriangle className="w-4 h-4 text-rose-400" />
                                        Afectación de Centros de Salud y Red de Alcantarillado:
                                    </h4>
                                    <p className="text-xs text-slate-300 leading-relaxed italic">
                                        &ldquo;{memoria.impacto_sanitario_epidemiologico[selectedYear].postas_afectadas}&rdquo;
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* PESTAÑA 4: PUNTOS CRÍTICOS & QUEBRADAS */}
                    {activeTab === "hidrologia" && (
                        <div className="space-y-6">
                            <div className="p-5 bg-slate-900 border border-sky-500/30 rounded-2xl shadow-lg">
                                <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
                                    <div className="w-10 h-10 rounded-xl bg-sky-500/20 border border-sky-500/40 flex items-center justify-center text-sky-400">
                                        <Waves className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="text-base font-bold text-white">
                                            Catálogo de Puntos Críticos y Quebradas Reincidentes • {memoria.distrito}
                                        </h3>
                                        <p className="text-xs text-slate-400">
                                            Cruce ANA, CENEPRED e INDECI de zonas de rotura de diques y activación de torrenteras.
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
                                    <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
                                        <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-3 flex items-center gap-2">
                                            <AlertTriangle className="w-4 h-4" />
                                            Puntos Críticos de Desborde Histórico:
                                        </h4>
                                        <ul className="space-y-2">
                                            {memoria.impacto_fisico_hidrologico.puntos_criticos.map((p, idx) => (
                                                <li key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                                                    <span className="text-amber-400 font-bold">•</span>
                                                    <span>{p}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
                                        <h4 className="text-xs font-bold uppercase tracking-wider text-sky-400 mb-3 flex items-center gap-2">
                                            <Compass className="w-4 h-4" />
                                            Quebradas Críticas en la Jurisdicción:
                                        </h4>
                                        {memoria.impacto_fisico_hidrologico.quebradas_criticas_asociadas.length > 0 ? (
                                            <div className="flex flex-wrap gap-2">
                                                {memoria.impacto_fisico_hidrologico.quebradas_criticas_asociadas.map((q, idx) => (
                                                    <span
                                                        key={idx}
                                                        className="px-3 py-1.5 rounded-lg bg-sky-900/30 text-sky-300 border border-sky-700/50 text-xs font-medium"
                                                    >
                                                        ⛰️ {q}
                                                    </span>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-xs text-slate-400 italic">
                                                No se registran quebradas torrenciales de cabecera; el riesgo predominante es desborde por planicie de inundación fluvial ({memoria.cuenca_principal}).
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* PESTAÑA 5: SECTOR AGROPECUARIO & RIEGO (MINAG - OIA) */}
                    {activeTab === "agropecuario" && memoria.impacto_agropecuario_minag && (
                        <div className="space-y-6">
                            <div className="p-5 bg-slate-900 border border-emerald-500/40 rounded-2xl shadow-xl">
                                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                                    <div className="flex items-center gap-3">
                                        <div className="w-11 h-11 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-lg shadow-emerald-500/10">
                                            <Sprout className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h3 className="text-base font-black text-white tracking-wide">
                                                    Expediente de Áreas Perdidas y Daños en Riego • {memoria.distrito}
                                                </h3>
                                                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                                                    MINAG - OIA
                                                </span>
                                            </div>
                                            <p className="text-xs text-slate-400 mt-0.5">
                                                Valle Oficial: <strong className="text-slate-200">{memoria.impacto_agropecuario_minag.valle_oficial}</strong> • Compendio Oficial de 338 págs.
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-mono px-3 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-300">
                                            Frecuencia FEN: 1983 • 1998 • 2017
                                        </span>
                                    </div>
                                </div>

                                {/* Métricas del Evento Seleccionado o 1998 */}
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-5">
                                    <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-center">
                                        <span className="text-[11px] text-slate-400 block font-bold uppercase tracking-wider">
                                            Superficie Perdida (100% Siniestro)
                                        </span>
                                        <span className="text-3xl font-black text-red-400 mt-1 block">
                                            {memoria.impacto_agropecuario_minag["1998"].perdida_ha.toLocaleString()} Ha
                                        </span>
                                        <span className="text-[10px] text-slate-500 mt-1 block">
                                            Pérdida irrecuperable por inundación / huaico
                                        </span>
                                    </div>

                                    <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-center">
                                        <span className="text-[11px] text-slate-400 block font-bold uppercase tracking-wider">
                                            Superficie Afectada (Rendimiento)
                                        </span>
                                        <span className="text-3xl font-black text-amber-400 mt-1 block">
                                            {memoria.impacto_agropecuario_minag["1998"].afectada_ha.toLocaleString()} Ha
                                        </span>
                                        <span className="text-[10px] text-slate-500 mt-1 block">
                                            Pérdida parcial en quintales / toneladas
                                        </span>
                                    </div>

                                    <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-center">
                                        <span className="text-[11px] text-slate-400 block font-bold uppercase tracking-wider">
                                            Familias Campesinas
                                        </span>
                                        <span className="text-3xl font-black text-sky-400 mt-1 block">
                                            ~{memoria.impacto_agropecuario_minag["1998"].familias_campesinas.toLocaleString()}
                                        </span>
                                        <span className="text-[10px] text-slate-500 mt-1 block">
                                            Pequeños agricultores y comuneros
                                        </span>
                                    </div>

                                    <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-center">
                                        <span className="text-[11px] text-slate-400 block font-bold uppercase tracking-wider">
                                            Presupuesto Rehabilitación MINAG
                                        </span>
                                        <span className="text-2xl font-black text-emerald-400 mt-1 block">
                                            S/. {memoria.impacto_agropecuario_minag["1998"].presupuesto_soles.toLocaleString()}
                                        </span>
                                        <span className="text-[10px] text-slate-500 mt-1 block">
                                            Obras provisionales de emergencia DGAS
                                        </span>
                                    </div>
                                </div>

                                {/* Vulnerabilidad Fisiológica y Cultivos */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
                                    <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
                                        <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-2 flex items-center gap-2">
                                            <Sprout className="w-4 h-4" />
                                            Cultivos de Mayor Vulnerabilidad Fisiológica:
                                        </h4>
                                        <div className="flex flex-wrap gap-1.5 mb-3">
                                            {memoria.impacto_agropecuario_minag.cultivos_principales.map((c, i) => (
                                                <span
                                                    key={i}
                                                    className="px-2.5 py-1 rounded bg-emerald-950/40 text-emerald-300 border border-emerald-800/40 text-xs font-semibold"
                                                >
                                                    🌱 {c}
                                                </span>
                                            ))}
                                        </div>
                                        <p className="text-xs text-slate-300 leading-relaxed italic bg-slate-900/60 p-3 rounded-lg border border-slate-800">
                                            &ldquo;{memoria.impacto_agropecuario_minag.vulnerabilidad_fisiologica}&rdquo;
                                        </p>
                                    </div>

                                    <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
                                        <h4 className="text-xs font-bold uppercase tracking-wider text-sky-400 mb-2 flex items-center gap-2">
                                            <Waves className="w-4 h-4" />
                                            Infraestructura de Riego Siniestrada (MINAG):
                                        </h4>
                                        <ul className="space-y-2 mb-3">
                                            {memoria.impacto_agropecuario_minag.infraestructura_riego.map((inf, i) => (
                                                <li key={i} className="flex items-start gap-2 text-xs text-slate-300">
                                                    <span className="text-sky-400 font-bold">💧</span>
                                                    <span>{inf}</span>
                                                </li>
                                            ))}
                                        </ul>
                                        <div className="p-3 bg-sky-950/20 border border-sky-900/40 rounded-lg text-xs text-sky-200">
                                            <strong>Diagnóstico MINAG:</strong> {memoria.impacto_agropecuario_minag["1998"].infraestructura}
                                        </div>
                                    </div>
                                </div>

                                {/* Hoja de Ruta para el Alcalde y Junta de Regantes */}
                                <div className="mt-5 p-4 bg-emerald-950/20 border border-emerald-900/40 rounded-xl">
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-300 mb-2 flex items-center gap-2">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                        Directivas Técnicas MINAG para el Alcalde y la Junta de Usuarios de Agua:
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-slate-300 mt-3">
                                        <div className="p-3 bg-slate-950/80 rounded-lg border border-slate-800">
                                            <strong className="text-white block mb-1">1. Desazolve de Drenes Troncales:</strong>
                                            Limpieza mecánica de drenes antes de diciembre para permitir el escurrimiento y evitar la hipersalinización de suelos.
                                        </div>
                                        <div className="p-3 bg-slate-950/80 rounded-lg border border-slate-800">
                                            <strong className="text-white block mb-1">2. Protección de Bocatomas:</strong>
                                            Enrocado y refuerzo de compuertas de derivación para impedir que los aluviones colmaten los canales matrices.
                                        </div>
                                        <div className="p-3 bg-slate-950/80 rounded-lg border border-slate-800">
                                            <strong className="text-white block mb-1">3. Semillas de Ciclo Corto:</strong>
                                            Gestionar ante el INIA y Agrobanco paquetes de semillas de ciclo vegetativo corto en caso de pérdida total de siembras.
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* PESTAÑA 6: LECCIONES CAF & HOJA DE RUTA */}
                    {activeTab === "lecciones" && (
                        <div className="space-y-6">
                            <div className="p-5 bg-slate-900 border border-purple-500/30 rounded-2xl shadow-lg">
                                <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
                                    <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400">
                                        <BookOpen className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="text-base font-bold text-white">
                                            Lecciones Aprendidas de la CAF &amp; Hoja de Ruta para el Alcalde • {memoria.distrito}
                                        </h3>
                                        <p className="text-xs text-slate-400">
                                            Fuente: Corporación Andina de Fomento (CAF) - &ldquo;Las Lecciones de El Niño: Memoria, Retos y Soluciones&rdquo; (Volumen V Perú)
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-5 p-4 bg-purple-950/20 border border-purple-900/40 rounded-xl">
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-purple-400 mb-2 flex items-center gap-2">
                                        <CheckCircle2 className="w-4 h-4" />
                                        Síntesis Doctrinal de Lecciones para este Municipio:
                                    </h4>
                                    <p className="text-sm text-purple-200 leading-relaxed font-medium">
                                        {memoria.lecciones_aprendidas_caf_indeci.sintesis_lecciones}
                                    </p>
                                </div>

                                <div className="mt-5 space-y-3">
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                                        Decálogo de Prevención Táctica Municipal Recomendado:
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                                        <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-start gap-2.5">
                                            <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs shrink-0">
                                                1
                                            </span>
                                            <div>
                                                <strong className="text-white block">Descolmatación Inmediata:</strong>
                                                <span className="text-slate-400">
                                                    Limpieza de cauces y retiro de desmonte en puntos de estrangulamiento antes del inicio de lluvias.
                                                </span>
                                            </div>
                                        </div>

                                        <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-start gap-2.5">
                                            <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs shrink-0">
                                                2
                                            </span>
                                            <div>
                                                <strong className="text-white block">Revisión de Diques y Defensas:</strong>
                                                <span className="text-slate-400">
                                                    Los diques de arena sin geobolsas ni enrocado fallaron en 1998 y 2017. Exija consolidación técnica.
                                                </span>
                                            </div>
                                        </div>

                                        <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-start gap-2.5">
                                            <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs shrink-0">
                                                3
                                            </span>
                                            <div>
                                                <strong className="text-white block">Empadronamiento EDAN Preventivo:</strong>
                                                <span className="text-slate-400">
                                                    Censo preliminar de familias en faja marginal para despacho inmediato de ayuda humanitaria FONDEN.
                                                </span>
                                            </div>
                                        </div>

                                        <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-start gap-2.5">
                                            <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs shrink-0">
                                                4
                                            </span>
                                            <div>
                                                <strong className="text-white block">Aseguramiento de Salud y Agua:</strong>
                                                <span className="text-slate-400">
                                                    Protección de pozos tubulares contra anegamiento y abastecimiento de sales de rehidratación y motobombas.
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-5 pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
                                    <span>Fuentes oficiales auditadas:</span>
                                    <div className="flex flex-wrap gap-2">
                                        {memoria.lecciones_aprendidas_caf_indeci.fuentes_validadas.map((f, idx) => (
                                            <span key={idx} className="px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                                                ✓ {f}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <div className="p-16 text-center bg-slate-900/50 border border-slate-800 rounded-2xl">
                    <AlertTriangle className="w-10 h-10 text-amber-400 mx-auto mb-3" />
                    <h3 className="font-bold text-slate-200">Municipio no encontrado</h3>
                    <p className="text-xs text-slate-500 mt-1">
                        Verifique que el código UBIGEO o nombre de distrito coincida con el catálogo nacional del INEI.
                    </p>
                </div>
            )}
        </div>
    );
}
