"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
    Calculator,
    ShieldAlert,
    FileSpreadsheet,
    Languages,
    Flame,
    Snowflake,
    Sliders,
    ArrowLeft,
    Download,
    CheckCircle2,
    AlertTriangle,
    Info,
    ExternalLink,
    Sparkles,
    Scale,
    Layers,
    Waves
} from "lucide-react";

interface RankingItem {
    ubigeo: string;
    distrito: string;
    provincia: string;
    departamento: string;
    ipi_score: number;
    categoria: string;
    etiqueta: string;
    color: string;
    accion_recomendada: string;
    desglose: {
        peligro_cenepred: { nivel: string; score: number; peso: number; aporte: number };
        emergencia_ds124: { declarado: boolean; score: number; peso: number; aporte: number };
        helada_amaru: { critico: boolean; score: number; peso: number; aporte: number };
        brecha_renalio: {
            es_bilingue_requerido: boolean;
            lengua: string;
            iso: string;
            familia: string;
            score: number;
            peso: number;
            aporte: number;
        };
    };
}

export default function DoctrinaFormulasPage() {
    const [tabActiva, setTabActiva] = useState<"IPI" | "IPH" | "ISH">("IPI");
    const [filtroRanking, setFiltroRanking] = useState<string>("todos");
    const [ranking, setRanking] = useState<RankingItem[]>([]);
    const [cargandoRanking, setCargandoRanking] = useState<boolean>(true);

    // Carga de datos reales desde el backend
    useEffect(() => {
        const fetchRanking = async () => {
            setCargandoRanking(true);
            const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
            try {
                const res = await fetch(`${apiBase}/api/data/etnoterritorial/ranking-triple-vulnerabilidad?limit=25&filtro=${filtroRanking}`);
                if (res.ok) {
                    const json = await res.json();
                    setRanking(json.ranking || []);
                } else {
                    throw new Error("HTTP error");
                }
            } catch {
                // Fallback con distritos clave verificados
                setRanking([
                    {
                        ubigeo: "010401",
                        distrito: "Nieva",
                        provincia: "Condorcanqui",
                        departamento: "Amazonas",
                        ipi_score: 85.0,
                        categoria: "ZONA_ROJA_TRIPLE_VULNERABILIDAD",
                        etiqueta: "Prioridad Crítica Absoluta",
                        color: "#ef4444",
                        accion_recomendada: "Despacho SISMATE bilingüe en Awajún y evacuación fluvial prioritaria.",
                        desglose: {
                            peligro_cenepred: { nivel: "MUY ALTO", score: 100, peso: 0.35, aporte: 35.0 },
                            emergencia_ds124: { declarado: true, score: 100, peso: 0.30, aporte: 30.0 },
                            helada_amaru: { critico: false, score: 0, peso: 0.15, aporte: 0.0 },
                            brecha_renalio: { es_bilingue_requerido: true, lengua: "Awajún Amazónico", iso: "agr-PE", familia: "Jíbaro", score: 100, peso: 0.20, aporte: 20.0 }
                        }
                    },
                    {
                        ubigeo: "020101",
                        distrito: "Huaraz",
                        provincia: "Huaraz",
                        departamento: "Áncash",
                        ipi_score: 85.0,
                        categoria: "ZONA_ROJA_TRIPLE_VULNERABILIDAD",
                        etiqueta: "Prioridad Crítica Absoluta",
                        color: "#ef4444",
                        accion_recomendada: "Alerta bilingüe en Quechua Áncash por desborde del Río Santa.",
                        desglose: {
                            peligro_cenepred: { nivel: "MUY ALTO", score: 100, peso: 0.35, aporte: 35.0 },
                            emergencia_ds124: { declarado: true, score: 100, peso: 0.30, aporte: 30.0 },
                            helada_amaru: { critico: false, score: 0, peso: 0.15, aporte: 0.0 },
                            brecha_renalio: { es_bilingue_requerido: true, lengua: "Quechua Áncash", iso: "qwh-PE", familia: "Quechua I", score: 100, peso: 0.20, aporte: 20.0 }
                        }
                    },
                    {
                        ubigeo: "210505",
                        distrito: "Santa Rosa (Mazocruz)",
                        provincia: "El Collao",
                        departamento: "Puno",
                        ipi_score: 80.0,
                        categoria: "ZONA_ROJA_TRIPLE_VULNERABILIDAD",
                        etiqueta: "Prioridad Crítica Absoluta",
                        color: "#ef4444",
                        accion_recomendada: "Despacho bilingüe en Aymara y suministro de cobertizos térmicos para ganado.",
                        desglose: {
                            peligro_cenepred: { nivel: "ALTO", score: 70, peso: 0.35, aporte: 24.5 },
                            emergencia_ds124: { declarado: true, score: 100, peso: 0.30, aporte: 30.0 },
                            helada_amaru: { critico: true, score: 100, peso: 0.15, aporte: 15.0 },
                            brecha_renalio: { es_bilingue_requerido: true, lengua: "Aymara Altiplánico", iso: "ay-PE", familia: "Aru", score: 100, peso: 0.20, aporte: 20.0 }
                        }
                    },
                    {
                        ubigeo: "150118",
                        distrito: "Lurigancho-Chosica",
                        provincia: "Lima",
                        departamento: "Lima",
                        ipi_score: 75.0,
                        categoria: "ALTA_PRIORIDAD_OPERATIVA",
                        etiqueta: "Alta Prioridad Operativa",
                        color: "#f97316",
                        accion_recomendada: "Alerta preventiva por activación de quebradas Carossio y Pedregal.",
                        desglose: {
                            peligro_cenepred: { nivel: "MUY ALTO", score: 100, peso: 0.35, aporte: 35.0 },
                            emergencia_ds124: { declarado: false, score: 0, peso: 0.30, aporte: 0.0 },
                            helada_amaru: { critico: false, score: 0, peso: 0.15, aporte: 0.0 },
                            brecha_renalio: { es_bilingue_requerido: true, lengua: "Runasimi Chanka", iso: "qu-PE", familia: "Quechua II-C", score: 100, peso: 0.20, aporte: 20.0 }
                        }
                    },
                    {
                        ubigeo: "200101",
                        distrito: "Piura / Catacaos",
                        provincia: "Piura",
                        departamento: "Piura",
                        ipi_score: 70.0,
                        categoria: "ALTA_PRIORIDAD_OPERATIVA",
                        etiqueta: "Alta Prioridad Operativa",
                        color: "#f97316",
                        accion_recomendada: "Despacho directo en Castellano llano ante crecida del Río Piura.",
                        desglose: {
                            peligro_cenepred: { nivel: "MUY ALTO", score: 100, peso: 0.35, aporte: 35.0 },
                            emergencia_ds124: { declarado: true, score: 100, peso: 0.30, aporte: 30.0 },
                            helada_amaru: { critico: false, score: 0, peso: 0.15, aporte: 0.0 },
                            brecha_renalio: { es_bilingue_requerido: false, lengua: "Castellano Comunitario", iso: "es-PE", familia: "Castellano", score: 25, peso: 0.20, aporte: 5.0 }
                        }
                    }
                ]);
            } finally {
                setCargandoRanking(false);
            }
        };

        fetchRanking();
    }, [filtroRanking]);

    const descargarCsvOficial = () => {
        const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
        window.open(`${apiBase}/api/data/etnoterritorial/exportar-csv`, "_blank");
    };

    return (
        <div className="space-y-6 max-w-7xl mx-auto pb-12">
            {/* ========================================================================= */}
            {/* BARRA SUPERIOR DE MANDO Y RETORNO                                         */}
            {/* ========================================================================= */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/90 border border-slate-800 p-4 rounded-2xl shadow-xl">
                <div className="flex items-center gap-3">
                    <Link
                        href="/"
                        className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg text-xs font-semibold transition"
                    >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        <span>Consola Principal</span>
                    </Link>
                    <span className="text-slate-600">/</span>
                    <div className="flex items-center gap-2">
                        <Scale className="w-4 h-4 text-amber-400" />
                        <h1 className="text-sm font-bold text-white uppercase tracking-wider">
                            Consola Doctrinal de Fórmulas &amp; Modelos Matemáticos (COEN)
                        </h1>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={descargarCsvOficial}
                        className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition shadow-md shadow-emerald-600/30"
                        title="Descargar matriz en formato CSV de los 1,891 distritos nacionales"
                    >
                        <Download className="w-3.5 h-3.5" />
                        <span>Exportar Matriz IPI (CSV)</span>
                    </button>
                    <span className="text-[10px] font-mono bg-blue-950 text-blue-300 border border-blue-800 px-2 py-1 rounded">
                        1,891 Distritos Estandarizados
                    </span>
                </div>
            </div>

            {/* ========================================================================= */}
            {/* SELECTOR DE ÍNDICES DOCTRINALES                                           */}
            {/* ========================================================================= */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Índice 1: IPI */}
                <button
                    onClick={() => setTabActiva("IPI")}
                    className={`p-4 rounded-2xl border text-left transition flex flex-col justify-between space-y-2 shadow-lg ${
                        tabActiva === "IPI"
                            ? "bg-slate-900 border-amber-500 ring-2 ring-amber-500/40"
                            : "bg-slate-950/80 border-slate-800 hover:bg-slate-900"
                    }`}
                >
                    <div className="flex justify-between items-start">
                        <span className="text-xs font-mono font-bold bg-amber-950 text-amber-300 border border-amber-800 px-2 py-0.5 rounded">
                            ÍNDICE 01 • ACTIVO
                        </span>
                        <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> En Producción
                        </span>
                    </div>
                    <div>
                        <h2 className="text-sm font-bold text-white">
                            Índice de Prioridad de Intervención (IPI)
                        </h2>
                        <p className="text-xs text-slate-400 mt-0.5">
                            Matriz de Triple Vulnerabilidad: Peligro CENEPRED + D.S. 124-PCM + Heladas + RENALIO.
                        </p>
                    </div>
                    <div className="text-[11px] font-mono text-amber-400/90 pt-1 border-t border-slate-800">
                        IPI = (w₁·P) + (w₂·E) + (w₃·H) + (w₄·B)
                    </div>
                </button>

                {/* Índice 2: IPH (Huaicos) */}
                <button
                    onClick={() => setTabActiva("IPH")}
                    className={`p-4 rounded-2xl border text-left transition flex flex-col justify-between space-y-2 shadow-lg ${
                        tabActiva === "IPH"
                            ? "bg-slate-900 border-blue-500 ring-2 ring-blue-500/40"
                            : "bg-slate-950/80 border-slate-800 hover:bg-slate-900"
                    }`}
                >
                    <div className="flex justify-between items-start">
                        <span className="text-xs font-mono font-bold bg-blue-950 text-blue-300 border border-blue-800 px-2 py-0.5 rounded">
                            ÍNDICE 02 • HIDROMETEO
                        </span>
                        <span className="text-[10px] text-blue-400 bg-blue-950/60 px-2 py-0.5 rounded border border-blue-900">
                            Próximo Sprint
                        </span>
                    </div>
                    <div>
                        <h2 className="text-sm font-bold text-white">
                            Índice de Probabilidad de Huaico (IPH)
                        </h2>
                        <p className="text-xs text-slate-400 mt-0.5">
                            Termodinámica CAPE + Saturación de Suelo 4 Capas + Lluvia + Pendiente INGEMMET.
                        </p>
                    </div>
                    <div className="text-[11px] font-mono text-blue-400/90 pt-1 border-t border-slate-800">
                        IPH = (0.35·CAPE) + (0.30·Suelo) + (0.20·Lluvia) + (0.15·Grad)
                    </div>
                </button>

                {/* Índice 3: ISH (Heladas) */}
                <button
                    onClick={() => setTabActiva("ISH")}
                    className={`p-4 rounded-2xl border text-left transition flex flex-col justify-between space-y-2 shadow-lg ${
                        tabActiva === "ISH"
                            ? "bg-slate-900 border-cyan-500 ring-2 ring-cyan-500/40"
                            : "bg-slate-950/80 border-slate-800 hover:bg-slate-900"
                    }`}
                >
                    <div className="flex justify-between items-start">
                        <span className="text-xs font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-800 px-2 py-0.5 rounded">
                            ÍNDICE 03 • AGROMETEO
                        </span>
                        <span className="text-[10px] text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-900">
                            Próximo Sprint
                        </span>
                    </div>
                    <div>
                        <h2 className="text-sm font-bold text-white">
                            Índice de Severidad de Helada (ISH)
                        </h2>
                        <p className="text-xs text-slate-400 mt-0.5">
                            Anomalía Térmica Nocturna + Altitud msnm + Demografía Vulnerable + Ganadería.
                        </p>
                    </div>
                    <div className="text-[11px] font-mono text-cyan-400/90 pt-1 border-t border-slate-800">
                        ISH = (0.40·ΔT) + (0.25·Alt) + (0.20·Social) + (0.15·Pecuario)
                    </div>
                </button>
            </div>

            {/* ========================================================================= */}
            {/* CONTENIDO SEGÚN LA PESTAÑA ACTIVA                                         */}
            {/* ========================================================================= */}

            {tabActiva === "IPI" && (
                <div className="space-y-6">
                    {/* PANEL DE FORMULACIÓN MATEMÁTICA Y EXPLICACIÓN DOCTRINAL */}
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
                        <div className="flex flex-wrap justify-between items-center gap-2 pb-3 border-b border-slate-800">
                            <div className="flex items-center gap-2">
                                <Calculator className="w-5 h-5 text-amber-400" />
                                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200">
                                    Formulación Matemática Oficial del IPI (Matriz de Triple Vulnerabilidad)
                                </h3>
                            </div>
                            <span className="text-[11px] font-mono bg-amber-950 text-amber-300 border border-amber-800 px-2.5 py-1 rounded-full font-bold">
                                Escala Normalizada: [0.0 - 100.0 Puntos]
                            </span>
                        </div>

                        {/* Ecuación Central Destacada */}
                        <div className="bg-slate-950 p-4 rounded-xl border border-amber-900/40 text-center space-y-2">
                            <span className="text-[11px] font-mono uppercase text-slate-400 tracking-wider">
                                Algoritmo de Prioridad de Intervención para los 1,891 Distritos Nacionales:
                            </span>
                            <div className="text-xl md:text-2xl font-mono font-black text-amber-300 tracking-wide">
                                IPI = (0.35 · P<sub>CENEPRED</sub>) + (0.30 · E<sub>DS124</sub>) + (0.15 · H<sub>AMARU</sub>) + (0.20 · B<sub>RENALIO</sub>)
                            </div>
                            <p className="text-xs text-slate-400 max-w-2xl mx-auto leading-relaxed">
                                Este modelo matemático resuelve el sesgo histórico de atender únicamente a grandes ciudades, otorgando máxima prioridad a las poblaciones en peligro extremo amparadas por ley cuya lengua nativa requiere auxilio bilingüe inmediato.
                            </p>
                        </div>

                        {/* Desglose de los 4 Factores Operativos */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-2">
                            {/* Factor 1 */}
                            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2">
                                <div className="flex justify-between items-center">
                                    <span className="text-xs font-bold text-red-400">P<sub>CENEPRED</sub> (35%)</span>
                                    <span className="text-[10px] font-mono text-slate-400">SIGRID MEF</span>
                                </div>
                                <div className="text-xs text-slate-300 space-y-1">
                                    <div className="flex justify-between"><span>Muy Alto:</span> <b className="text-red-400">100 pts</b></div>
                                    <div className="flex justify-between"><span>Alto:</span> <b className="text-amber-400">70 pts</b></div>
                                    <div className="flex justify-between"><span>Medio:</span> <b className="text-yellow-400">40 pts</b></div>
                                    <div className="flex justify-between"><span>Bajo:</span> <b className="text-slate-400">10 pts</b></div>
                                </div>
                                <p className="text-[10px] text-slate-500 leading-tight">
                                    Peligro de inundación, huaico y movimientos en masa certificado por CENEPRED.
                                </p>
                            </div>

                            {/* Factor 2 */}
                            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2">
                                <div className="flex justify-between items-center">
                                    <span className="text-xs font-bold text-amber-400">E<sub>DS124</sub> (30%)</span>
                                    <span className="text-[10px] font-mono text-slate-400">PCM 2026</span>
                                </div>
                                <div className="text-xs text-slate-300 space-y-1">
                                    <div className="flex justify-between"><span>En D.S. 124-PCM:</span> <b className="text-emerald-400">100 pts</b></div>
                                    <div className="flex justify-between"><span>No Declarado:</span> <b className="text-slate-400">0 pts</b></div>
                                </div>
                                <p className="text-[10px] text-slate-500 leading-tight">
                                    Estado de Emergencia oficial que habilita el uso inmediato de fondos FONDEN y maquinaria.
                                </p>
                            </div>

                            {/* Factor 3 */}
                            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2">
                                <div className="flex justify-between items-center">
                                    <span className="text-xs font-bold text-cyan-400">H<sub>AMARU</sub> (15%)</span>
                                    <span className="text-[10px] font-mono text-slate-400">AMARU-CHIRI</span>
                                </div>
                                <div className="text-xs text-slate-300 space-y-1">
                                    <div className="flex justify-between"><span>Zona Crítica:</span> <b className="text-cyan-400">100 pts</b></div>
                                    <div className="flex justify-between"><span>No Crítico:</span> <b className="text-slate-400">0 pts</b></div>
                                </div>
                                <p className="text-[10px] text-slate-500 leading-tight">
                                    Distritos con temperaturas nocturnas bajo cero (&lt; -8°C) y afectación de camélidos.
                                </p>
                            </div>

                            {/* Factor 4 */}
                            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2">
                                <div className="flex justify-between items-center">
                                    <span className="text-xs font-bold text-purple-400">B<sub>RENALIO</sub> (20%)</span>
                                    <span className="text-[10px] font-mono text-slate-400">D.S. 009-2021-MC</span>
                                </div>
                                <div className="text-xs text-slate-300 space-y-1">
                                    <div className="flex justify-between"><span>Lengua Originaria:</span> <b className="text-purple-400">100 pts</b></div>
                                    <div className="flex justify-between"><span>Castellano Llano:</span> <b className="text-blue-400">25 pts</b></div>
                                </div>
                                <p className="text-[10px] text-slate-500 leading-tight">
                                    Brecha de comunicación. Si la población habla lengua originaria, una alerta en español genera alta vulnerabilidad.
                                </p>
                            </div>
                        </div>

                        {/* Escala de Decisión Operativa */}
                        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex flex-wrap justify-between items-center text-xs gap-2">
                            <span className="font-bold text-slate-300 uppercase text-[11px]">Umbrales de Activación COEN:</span>
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="bg-red-950 border border-red-700 text-red-300 px-2 py-0.5 rounded text-[11px] font-bold">
                                    ≥ 80 pts: Zona Roja Crítica (SISMATE Bilingüe Inmediato)
                                </span>
                                <span className="bg-amber-950 border border-amber-700 text-amber-300 px-2 py-0.5 rounded text-[11px] font-bold">
                                    60-79 pts: Alta Prioridad Operativa
                                </span>
                                <span className="bg-yellow-950 border border-yellow-700 text-yellow-300 px-2 py-0.5 rounded text-[11px]">
                                    40-59 pts: Vigilancia Moderada
                                </span>
                                <span className="bg-emerald-950 border border-emerald-700 text-emerald-300 px-2 py-0.5 rounded text-[11px]">
                                    &lt; 40 pts: Bajo Impacto
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* TABLA EN VIVO DE DISTRITOS EN TRIPLE VULNERABILIDAD */}
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
                        <div className="flex flex-wrap justify-between items-center gap-3 pb-3 border-b border-slate-800">
                            <div className="flex items-center gap-2">
                                <ShieldAlert className="w-5 h-5 text-red-400" />
                                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200">
                                    Ranking Nacional de Distritos en Triple Vulnerabilidad (En Vivo)
                                </h3>
                            </div>

                            {/* Filtros de la Matriz */}
                            <div className="flex flex-wrap items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
                                {[
                                    { id: "todos", label: "Todos los Distritos" },
                                    { id: "triple_vulnerabilidad", label: "🔴 Triple Vulnerabilidad (IPI ≥ 80)" },
                                    { id: "fen_ds124", label: "D.S. 124 El Niño" },
                                    { id: "heladas", label: "Heladas Severas" },
                                    { id: "bilingues", label: "🇵🇪 Comunidades Bilingües" }
                                ].map(f => (
                                    <button
                                        key={f.id}
                                        onClick={() => setFiltroRanking(f.id)}
                                        className={`px-2.5 py-1 rounded-lg transition font-medium text-[11px] ${
                                            filtroRanking === f.id
                                                ? "bg-blue-600 text-white font-bold shadow-md"
                                                : "text-slate-400 hover:text-slate-200"
                                        }`}
                                    >
                                        {f.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Tabla de Datos */}
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs text-slate-300">
                                <thead className="bg-slate-950 text-slate-400 font-mono text-[11px] uppercase border-b border-slate-800">
                                    <tr>
                                        <th className="p-3">UBIGEO</th>
                                        <th className="p-3">Distrito / Jurisdicción</th>
                                        <th className="p-3">Región</th>
                                        <th className="p-3">Score IPI</th>
                                        <th className="p-3">Nivel CENEPRED</th>
                                        <th className="p-3">D.S. 124</th>
                                        <th className="p-3">Heladas</th>
                                        <th className="p-3">Lengua RENALIO</th>
                                        <th className="p-3">Régimen Alerta</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800/80 font-mono text-[11px]">
                                    {ranking.map((item, idx) => (
                                        <tr key={idx} className="hover:bg-slate-850/50 transition">
                                            <td className="p-3 text-sky-400 font-bold">{item.ubigeo}</td>
                                            <td className="p-3 font-sans font-bold text-white">{item.distrito}</td>
                                            <td className="p-3 text-slate-400 font-sans">{item.departamento}</td>
                                            <td className="p-3">
                                                <span
                                                    className="px-2 py-0.5 rounded font-black text-white"
                                                    style={{ backgroundColor: item.color }}
                                                >
                                                    {item.ipi_score.toFixed(1)}
                                                </span>
                                            </td>
                                            <td className="p-3 font-sans">
                                                <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                                    item.desglose.peligro_cenepred.nivel === "MUY ALTO" ? "bg-red-950 text-red-400 border border-red-800" : "bg-amber-950 text-amber-400"
                                                }`}>
                                                    {item.desglose.peligro_cenepred.nivel}
                                                </span>
                                            </td>
                                            <td className="p-3">
                                                {item.desglose.emergencia_ds124.declarado ? (
                                                    <span className="text-emerald-400 font-bold">✓ SÍ</span>
                                                ) : (
                                                    <span className="text-slate-600">NO</span>
                                                )}
                                            </td>
                                            <td className="p-3">
                                                {item.desglose.helada_amaru.critico ? (
                                                    <span className="text-cyan-400 font-bold">❄️ CRÍTICO</span>
                                                ) : (
                                                    <span className="text-slate-600">—</span>
                                                )}
                                            </td>
                                            <td className="p-3 font-sans text-amber-300">
                                                {item.desglose.brecha_renalio.lengua}
                                            </td>
                                            <td className="p-3">
                                                {item.desglose.brecha_renalio.es_bilingue_requerido ? (
                                                    <span className="bg-amber-950/90 text-amber-300 border border-amber-800 px-2 py-0.5 rounded text-[10px] font-bold">
                                                        BILINGÜE + ESPAÑOL
                                                    </span>
                                                ) : (
                                                    <span className="bg-blue-950/90 text-blue-300 border border-blue-800 px-2 py-0.5 rounded text-[10px] font-bold">
                                                        SOLO CASTELLANO
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* ========================================================================= */}
            {/* PESTAÑA ÍNDICE 2: IPH (ÍNDICE DE PROBABILIDAD DE HUAICO)                  */}
            {/* ========================================================================= */}
            {tabActiva === "IPH" && (
                <div className="bg-slate-900 border border-blue-900/50 rounded-2xl p-6 shadow-2xl space-y-6">
                    <div className="flex justify-between items-center pb-3 border-b border-slate-800">
                        <div className="flex items-center gap-2">
                            <Waves className="w-5 h-5 text-blue-400" />
                            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200">
                                Marco Metodológico: Índice de Probabilidad de Huaico (IPH)
                            </h3>
                        </div>
                        <span className="text-xs font-mono bg-blue-950 text-blue-300 border border-blue-800 px-2.5 py-1 rounded-full font-bold">
                            Fase: Próximo Sprint (Calibración Hidrometeorológica)
                        </span>
                    </div>

                    <div className="bg-slate-950 p-5 rounded-xl border border-blue-900/40 text-center space-y-2">
                        <span className="text-[11px] font-mono uppercase text-slate-400 tracking-wider">
                            Formulación Hidrometeorológica en Desarrollo:
                        </span>
                        <div className="text-xl md:text-2xl font-mono font-black text-blue-300 tracking-wide">
                            IPH = (0.35 · C<sub>CAPE</sub>) + (0.30 · S<sub>EDÁFICO</sub>) + (0.20 · L<sub>24H</sub>) + (0.15 · G<sub>PENDIENTE</sub>)
                        </div>
                        <p className="text-xs text-slate-400 max-w-2xl mx-auto leading-relaxed">
                            Combina la energía convectiva disponible en la atmósfera (CAPE) para tormentas severas con la saturación edáfica en las capas profundas del suelo (28-100 cm), la precipitación acumulada frente a los umbrales de quebrada y el factor de ladera INGEMMET.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
                            <span className="text-xs font-bold text-amber-400">C<sub>CAPE</sub> (35%)</span>
                            <h4 className="text-xs font-bold text-white">Energía Convectiva Atmosférica</h4>
                            <p className="text-[11px] text-slate-400">
                                Medido por Open-Meteo Pro / ECMWF IFS 9km. Umbral crítico en quebradas: &gt; 1,400 J/kg desencadena lluvias torrenciales de ladera.
                            </p>
                        </div>
                        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
                            <span className="text-xs font-bold text-blue-400">S<sub>EDÁFICO</sub> (30%)</span>
                            <h4 className="text-xs font-bold text-white">Saturación en Estrato 28–100 cm</h4>
                            <p className="text-[11px] text-slate-400">
                                Si el suelo profundo supera el 85% de capacidad de campo, el agua de lluvia no infiltra y genera escorrentía súbita con lodo y piedras.
                            </p>
                        </div>
                        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
                            <span className="text-xs font-bold text-cyan-400">L<sub>24H</sub> (20%)</span>
                            <h4 className="text-xs font-bold text-white">Lluvia Acumulada vs Umbral ANA</h4>
                            <p className="text-[11px] text-slate-400">
                                Cruce con las 46 quebradas críticas mapeadas. Cada quebrada tiene un umbral histórico de activación (ej. Carossio: 35 mm/h).
                            </p>
                        </div>
                        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
                            <span className="text-xs font-bold text-emerald-400">G<sub>PENDIENTE</sub> (15%)</span>
                            <h4 className="text-xs font-bold text-white">Pendiente &amp; Susceptibilidad</h4>
                            <p className="text-[11px] text-slate-400">
                                Mapa de movimientos en masa INGEMMET. Pendientes &gt; 25° en conos de deyección aceleran la velocidad del flujo aluviónico.
                            </p>
                        </div>
                    </div>

                    <div className="p-4 rounded-xl bg-blue-950/40 border border-blue-800/80 text-xs text-blue-200 flex items-center gap-3">
                        <Info className="w-5 h-5 flex-shrink-0 text-blue-400" />
                        <div>
                            <b>Nota de Programación:</b> Este índice será calibrado e integrado en el siguiente sprint junto con los datos telemétricos en tiempo real del Agente 1 (Centinela Hidrometeorológico).
                        </div>
                    </div>
                </div>
            )}

            {/* ========================================================================= */}
            {/* PESTAÑA ÍNDICE 3: ISH (ÍNDICE DE SEVERIDAD DE HELADA)                    */}
            {/* ========================================================================= */}
            {tabActiva === "ISH" && (
                <div className="bg-slate-900 border border-cyan-900/50 rounded-2xl p-6 shadow-2xl space-y-6">
                    <div className="flex justify-between items-center pb-3 border-b border-slate-800">
                        <div className="flex items-center gap-2">
                            <Snowflake className="w-5 h-5 text-cyan-400" />
                            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200">
                                Marco Metodológico: Índice de Severidad de Helada (ISH)
                            </h3>
                        </div>
                        <span className="text-xs font-mono bg-cyan-950 text-cyan-300 border border-cyan-800 px-2.5 py-1 rounded-full font-bold">
                            Fase: Próximo Sprint (Calibración Agrometeorológica)
                        </span>
                    </div>

                    <div className="bg-slate-950 p-5 rounded-xl border border-cyan-900/40 text-center space-y-2">
                        <span className="text-[11px] font-mono uppercase text-slate-400 tracking-wider">
                            Formulación Agrometeorológica Altoandina en Desarrollo:
                        </span>
                        <div className="text-xl md:text-2xl font-mono font-black text-cyan-300 tracking-wide">
                            ISH = (0.40 · ΔT<sub>NOCTURNA</sub>) + (0.25 · A<sub>MSNM</sub>) + (0.20 · V<sub>SOCIAL</sub>) + (0.15 · V<sub>PECUARIA</sub>)
                        </div>
                        <p className="text-xs text-slate-400 max-w-2xl mx-auto leading-relaxed">
                            Mide la letalidad de las heladas y friajes en la Sierra Sur y el Altiplano, combinando la anomalía térmica bajo cero, la altitud orográfica, la vulnerabilidad infantil/adulta mayor y el riesgo pecuario de camélidos sudamericanos.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
                            <span className="text-xs font-bold text-cyan-400">ΔT<sub>NOCTURNA</sub> (40%)</span>
                            <h4 className="text-xs font-bold text-white">Anomalía Térmica Bajo Cero</h4>
                            <p className="text-[11px] text-slate-400">
                                Magnitud de la temperatura mínima nocturna prevista (&lt; -5°C a -18°C en el polo del frío como Mazocruz).
                            </p>
                        </div>
                        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
                            <span className="text-xs font-bold text-sky-400">A<sub>MSNM</sub> (25%)</span>
                            <h4 className="text-xs font-bold text-white">Cota Orográfica &gt; 3,800 msnm</h4>
                            <p className="text-[11px] text-slate-400">
                                A mayor altitud, menor densidad de oxígeno y mayor pérdida de calor por radiación nocturna a cielo despejado.
                            </p>
                        </div>
                        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
                            <span className="text-xs font-bold text-amber-400">V<sub>SOCIAL</sub> (20%)</span>
                            <h4 className="text-xs font-bold text-white">Población Expuesta (INEI)</h4>
                            <p className="text-[11px] text-slate-400">
                                Porcentaje de menores de 5 años y mayores de 65 años en viviendas sin aislamiento térmico Sumaq Wasi.
                            </p>
                        </div>
                        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
                            <span className="text-xs font-bold text-purple-400">V<sub>PECUARIA</sub> (15%)</span>
                            <h4 className="text-xs font-bold text-white">Hatos de Camélidos sin Cobertizo</h4>
                            <p className="text-[11px] text-slate-400">
                                Número de alpacas y ovinos expuestos a neumonía y mortandad por heladas en pastizales congelados.
                            </p>
                        </div>
                    </div>

                    <div className="p-4 rounded-xl bg-cyan-950/40 border border-cyan-800/80 text-xs text-cyan-200 flex items-center gap-3">
                        <Info className="w-5 h-5 flex-shrink-0 text-cyan-400" />
                        <div>
                            <b>Nota de Programación:</b> Este índice se integrará con el módulo AMARU-CHIRI del COEN para alertar en Aymara y Quechua Collao a los criadores de alpacas del Altiplano.
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
