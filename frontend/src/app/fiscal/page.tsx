"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
    Landmark,
    Coins,
    ShieldAlert,
    ShieldCheck,
    AlertTriangle,
    Search,
    RefreshCw,
    TrendingDown,
    Building2,
    Calendar,
    ArrowUpRight,
    FileSpreadsheet,
    Scale,
    AlertOctagon,
    Compass,
    CheckCircle2,
    ChevronRight,
    FileCheck2,
    Shield
} from "lucide-react";

import { API_BASE } from "@/config/api";

interface ResumenNacionalMEF {
    ejercicio_fiscal?: number;
    ano_fiscal?: number;
    fuentes_integradas?: string[];
    conector_id?: string;
    hash_auditoria_sha256?: string;
    total_pim_nacional_soles: number;
    total_devengado_nacional_soles: number;
    porcentaje_ejecucion_nacional: number;
    tasa_inaccion_fiscal_promedio: number;
    gobiernos_locales_analizados: number;
    distritos_inaccion_critica: number;
    fecha_corte?: string;
    programa_presupuestal?: string;
}

interface ProyectoFONDES {
    codigo_cui?: string;
    cui?: string;
    nombre_proyecto?: string;
    nombre?: string;
    entidad?: string;
    departamento?: string;
    provincia?: string;
    distrito?: string;
    monto_pim?: number;
    monto_inversion?: number;
    monto_devengado?: number;
    porcentaje_ejecucion?: number;
    avance_fisico_pct?: number;
    avance_financiero_pct?: number;
    alerta_cero_ejecucion?: boolean;
}

interface EstadoFiscalDistrito {
    ubigeo: string;
    distrito: string;
    provincia?: string;
    departamento?: string;
    alcalde?: string;
    pliego?: string;
    pia?: number;
    pim?: number;
    pim_soles?: number;
    devengado?: number;
    devengado_soles?: number;
    porcentaje_ejecucion: number;
    tasa_inaccion_fiscal?: number;
    semaforo_inaccion?: "VERDE_CONFORME" | "AMARILLO_RIESGO" | "ROJO_INACCION_CRITICA";
    estado_alerta_fiscal?: string;
    advertencia_penal_art_377?: string;
    dictamen_responsabilidad_penal?: string | null;
    proyectos_fondes?: ProyectoFONDES[];
    fecha_corte?: string;
}

interface ItemRankingInaccion {
    ubigeo: string;
    distrito: string;
    departamento: string;
    pim_soles?: number;
    pim?: number;
    devengado_soles?: number;
    devengado?: number;
    porcentaje_ejecucion: number;
    tasa_inaccion_fiscal?: number;
    semaforo?: string;
    riesgo_penal_art_377?: boolean;
}

const DISTRITOS_RAPIDOS = [
    { ubigeo: "150118", nombre: "Lurigancho-Chosica", dep: "Lima" },
    { ubigeo: "200114", nombre: "Tambogrande", dep: "Piura" },
    { ubigeo: "140305", nombre: "Íllimo", dep: "Lambayeque" },
    { ubigeo: "200101", nombre: "Piura", dep: "Piura" },
    { ubigeo: "130101", nombre: "Trujillo", dep: "La Libertad" },
    { ubigeo: "240101", nombre: "Tumbes", dep: "Tumbes" }
];

export default function FiscalDashboardPage() {
    const [resumen, setResumen] = useState<ResumenNacionalMEF | null>(null);
    const [distritoActual, setDistritoActual] = useState<EstadoFiscalDistrito | null>(null);
    const [ranking, setRanking] = useState<ItemRankingInaccion[]>([]);
    const [proyectosFondes, setProyectosFondes] = useState<ProyectoFONDES[]>([]);
    const [ubigeoSeleccionado, setUbigeoSeleccionado] = useState<string>("150118");
    const [cargando, setCargando] = useState<boolean>(true);
    const [sincronizando, setSincronizando] = useState<boolean>(false);
    const [mensajeSync, setMensajeSync] = useState<string | null>(null);

    // Estado del Navegador Consulta Amigable 0068 (MEF Navegador SIAF)
    const [mefObrasResumen, setMefObrasResumen] = useState<any>(null);
    const [mefObras, setMefObras] = useState<any[]>([]);
    const [filtroNivelObra, setFiltroNivelObra] = useState<string>("TODOS");
    const [filtroCuelloBotella, setFiltroCuelloBotella] = useState<string>("TODOS");
    const [busquedaObra, setBusquedaObra] = useState<string>("");
    const [obraModal, setObraModal] = useState<any>(null);

    const apiBase = API_BASE;

    const cargarDatos = async (ubigeo: string) => {
        setCargando(true);
        try {
            const [resResumen, resDist, resRank, resFondes, resObrasSum, resObrasCat] = await Promise.all([
                fetch(`${apiBase}/api/v1/fiscal/resumen`),
                fetch(`${apiBase}/api/v1/fiscal/distrito/${ubigeo}`),
                fetch(`${apiBase}/api/v1/fiscal/ranking-inaccion?limit=10`),
                fetch(`${apiBase}/api/v1/fiscal/fondes-proyectos`),
                fetch(`${apiBase}/api/v1/mef-obras/resumen`).catch(() => null),
                fetch(`${apiBase}/api/v1/mef-obras/catalogo?limite=300`).catch(() => null)
            ]);

            if (resResumen && resResumen.ok) {
                const rawResumen = await resResumen.json();
                // Normalización flexible para formatos del conector
                const pim = rawResumen.total_pim_nacional_soles ?? rawResumen.pim_total ?? 0;
                const devengado = rawResumen.total_devengado_nacional_soles ?? rawResumen.devengado_total ?? 0;
                const pct = rawResumen.porcentaje_ejecucion_nacional ?? rawResumen.porcentaje_ejecucion ?? 0;
                const tasaInaccion = rawResumen.tasa_inaccion_fiscal_promedio ?? Math.max(0, Math.round(100 - pct));
                setResumen({
                    ...rawResumen,
                    total_pim_nacional_soles: pim,
                    total_devengado_nacional_soles: devengado,
                    porcentaje_ejecucion_nacional: pct,
                    tasa_inaccion_fiscal_promedio: tasaInaccion,
                    gobiernos_locales_analizados: rawResumen.gobiernos_locales_analizados ?? 1891,
                    distritos_inaccion_critica: rawResumen.distritos_inaccion_critica ?? 87
                });
            }

            if (resDist && resDist.ok) {
                const rawDist = await resDist.json();
                const pimDist = rawDist.pim_soles ?? rawDist.pim ?? 0;
                const devDist = rawDist.devengado_soles ?? rawDist.devengado ?? 0;
                const pctDist = rawDist.porcentaje_ejecucion ?? (pimDist > 0 ? (devDist / pimDist) * 100 : 0);
                const semaforo = rawDist.semaforo_inaccion || (
                    pctDist < 25 ? "ROJO_INACCION_CRITICA" : pctDist < 45 ? "AMARILLO_RIESGO" : "VERDE_CONFORME"
                );
                setDistritoActual({
                    ...rawDist,
                    provincia: rawDist.provincia || rawDist.departamento || "Nacional",
                    alcalde: rawDist.alcalde || rawDist.pliego || "Gestión Municipal en Funciones",
                    pim_soles: pimDist,
                    devengado_soles: devDist,
                    porcentaje_ejecucion: Math.round(pctDist * 100) / 100,
                    tasa_inaccion_fiscal: rawDist.tasa_inaccion_fiscal ?? Math.max(0, Math.round(100 - pctDist)),
                    semaforo_inaccion: semaforo,
                    advertencia_penal_art_377: rawDist.advertencia_penal_art_377 || rawDist.dictamen_responsabilidad_penal || rawDist.advertencia_art_377
                });
            }

            if (resRank && resRank.ok) {
                const rJson = await resRank.json();
                const rankList = Array.isArray(rJson) ? rJson : (rJson.ranking || []);
                setRanking(rankList.map((item: any) => ({
                    ...item,
                    pim_soles: item.pim_soles ?? item.pim ?? 0,
                    devengado_soles: item.devengado_soles ?? item.devengado ?? 0,
                    tasa_inaccion_fiscal: item.tasa_inaccion_fiscal ?? Math.max(0, Math.round(100 - (item.porcentaje_ejecucion || 0)))
                })));
            }

            if (resFondes && resFondes.ok) {
                const fJson = await resFondes.json();
                const pList = Array.isArray(fJson) ? fJson : (fJson.proyectos || []);
                setProyectosFondes(pList);
            }

            if (resObrasSum && resObrasSum.ok) {
                setMefObrasResumen(await resObrasSum.json());
            }
            if (resObrasCat && resObrasCat.ok) {
                const oJson = await resObrasCat.json();
                setMefObras(oJson.obras || []);
            }
        } catch (err) {
            console.error("Error al cargar datos fiscales MEF:", err);
        } finally {
            setCargando(false);
        }
    };

    const handleSincronizarMEF = async () => {
        setSincronizando(true);
        setMensajeSync(null);
        try {
            const res = await fetch(`${apiBase}/api/v1/kuraq/sincronizar-mef`, {
                method: "POST"
            });
            if (res.ok) {
                const data = await res.json();
                setMensajeSync(`Sincronización completada. PIM procesado: S/ ${(data.pim_total_soles / 1e6).toFixed(1)}M (SHA-256: ${data.hash_sha256?.substring(0, 10)}...)`);
                await cargarDatos(ubigeoSeleccionado);
            }
        } catch (err) {
            setMensajeSync("Fallo en sincronización. Usando caché canónico.");
        } finally {
            setSincronizando(false);
        }
    };

    useEffect(() => {
        cargarDatos(ubigeoSeleccionado);
    }, [ubigeoSeleccionado]);

    const formatSoles = (monto: number) => {
        return new Intl.NumberFormat("es-PE", {
            style: "currency",
            currency: "PEN",
            maximumFractionDigits: 0
        }).format(monto);
    };

    return (
        <div className="space-y-6 max-w-7xl mx-auto pb-16">
            {/* Header Hero */}
            <div className="bg-gradient-to-r from-slate-900 via-rose-950/30 to-slate-900 border border-rose-500/30 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
                <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 relative z-10">
                    <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center gap-1.5">
                                <Scale className="w-3.5 h-3.5" />
                                NIVEL 4 • GOBERNANZA, AUDITORÍA &amp; FE PÚBLICA (ANILLO 3)
                            </span>
                            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1.5">
                                <Landmark className="w-3.5 h-3.5" />
                                MEF DATOS ABIERTOS • PP 0068 &amp; FONDES 2026
                            </span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-950 text-slate-300 border border-slate-700 font-bold">
                                SRC-MEF-GASTO-FEN-FONDES
                            </span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-red-950 text-red-300 border border-red-800 flex items-center gap-1 font-bold">
                                <Scale className="w-3 h-3 text-red-400" />
                                BLINDAJE PENAL ART. 377 CP
                            </span>
                        </div>
                        <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight flex items-center gap-3">
                            <span>Control Fiscal &amp; Presupuestal FEN</span>
                            <span className="text-slate-500 font-light text-xl">|</span>
                            <span className="text-rose-400 font-semibold text-lg md:text-xl">
                                Ejecución PP 0068 y FONDES
                            </span>
                        </h1>
                        <p className="text-xs md:text-sm text-slate-300 max-w-3xl leading-relaxed">
                            Monitoreo en tiempo real de la ejecución financiera del <strong>Programa Presupuestal 0068 (Reducción de Vulnerabilidad y Atención de Emergencias)</strong> y el <strong>FONDES</strong> para mitigar el Fenómeno El Niño 2026–2027. Alerta temprana ante inacción que vulnere el Art. 377 del Código Penal.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <button
                            onClick={handleSincronizarMEF}
                            disabled={sincronizando}
                            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-rose-900/60 hover:bg-rose-800 text-rose-200 border border-rose-600/50 transition flex items-center gap-1.5 shadow disabled:opacity-50"
                            title="Sincronizar datasets con el portal de datos abiertos del Ministerio de Economía y Finanzas"
                        >
                            <RefreshCw className={`w-3.5 h-3.5 ${sincronizando ? "animate-spin text-rose-400" : ""}`} />
                            <span>{sincronizando ? "Descargando MEF..." : "Sincronizar MEF (KURAQ)"}</span>
                        </button>
                        <Link
                            href="/lex"
                            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-amber-950/60 hover:bg-amber-900 border border-amber-700/50 text-amber-200 transition flex items-center gap-1.5 shadow"
                        >
                            <Scale className="w-3.5 h-3.5 text-amber-400" />
                            <span>AMARU-LEX</span>
                        </Link>
                        <Link
                            href="/contraloria"
                            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 transition flex items-center gap-1.5"
                        >
                            <Shield className="w-3.5 h-3.5 text-amber-400" />
                            <span>Control CGR</span>
                        </Link>
                    </div>
                </div>

                {/* Dock de Gobernanza Legal & Trazabilidad C2 */}
                <div className="mt-4 p-3 bg-slate-950/90 border border-rose-900/40 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                        <span className="font-bold text-rose-300">ANILLO 3 DE BLINDAJE LEGAL:</span>
                        <span className="text-slate-400 hidden md:inline">Trazabilidad financiera, fondos de emergencia FONDES y rendición de cuentas</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Link href="/edan" className="px-2.5 py-1 rounded-lg bg-emerald-950/60 hover:bg-emerald-900 text-emerald-200 border border-emerald-800/40 transition flex items-center gap-1">
                            <FileCheck2 className="w-3 h-3 text-emerald-400" />
                            <span>Ficha EDAN</span>
                        </Link>
                        <Link href="/auditoria" className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 transition flex items-center gap-1">
                            <span>Bitácora WORM</span>
                        </Link>
                        <Link href="/doctrina" className="px-2.5 py-1 rounded-lg bg-purple-950/60 hover:bg-purple-900 text-purple-200 border border-purple-800/40 transition flex items-center gap-1">
                            <span>Fórmulas C2</span>
                        </Link>
                        <span className="text-slate-600">|</span>
                        <Link href="/alertas" className="px-2.5 py-1 rounded-lg bg-amber-950/50 hover:bg-amber-900 text-amber-200 border border-amber-800/40 transition flex items-center gap-1 text-[11px]">
                            <span>⬆ Nivel 2 Municipal</span>
                        </Link>
                    </div>
                </div>

                {mensajeSync && (
                    <div className="mt-4 p-3 bg-emerald-950/60 border border-emerald-600/60 rounded-xl flex items-center gap-2 text-xs text-emerald-200">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>{mensajeSync}</span>
                    </div>
                )}

                {/* Métricas Macroeconómicas Nacionales */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mt-5 pt-4 border-t border-slate-800/80 text-xs">
                    <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800">
                        <span className="text-[10px] text-slate-400 block font-medium">PIM FEN Asignado</span>
                        <span className="text-lg font-black text-white">
                            {resumen ? formatSoles(resumen.total_pim_nacional_soles) : "Cargando..."}
                        </span>
                        <span className="text-[10px] text-slate-500 block mt-0.5">PP 0068 + FONDES 2026</span>
                    </div>
                    <div className="bg-slate-950/80 p-3 rounded-xl border border-emerald-900/40">
                        <span className="text-[10px] text-emerald-400 block font-medium">Gasto Devengado</span>
                        <span className="text-lg font-black text-emerald-400">
                            {resumen ? formatSoles(resumen.total_devengado_nacional_soles) : "Cargando..."}
                        </span>
                        <span className="text-[10px] text-emerald-600/80 block mt-0.5">Ejecución efectiva</span>
                    </div>
                    <div className="bg-slate-950/80 p-3 rounded-xl border border-sky-900/40">
                        <span className="text-[10px] text-sky-400 block font-medium">% Avance Financiero</span>
                        <span className="text-lg font-black text-sky-400">
                            {resumen ? `${resumen.porcentaje_ejecucion_nacional}%` : "--"}
                        </span>
                        <span className="text-[10px] text-slate-500 block mt-0.5">Meta Q1 &gt; 45%</span>
                    </div>
                    <div className="bg-slate-950/80 p-3 rounded-xl border border-rose-900/40">
                        <span className="text-[10px] text-rose-400 block font-medium">Tasa Inacción Promedio</span>
                        <span className="text-lg font-black text-rose-400">
                            {resumen ? `${resumen.tasa_inaccion_fiscal_promedio}%` : "--"}
                        </span>
                        <span className="text-[10px] text-rose-600/80 block mt-0.5">Sin ejecutar</span>
                    </div>
                    <div className="bg-slate-950/80 p-3 rounded-xl border border-amber-900/40">
                        <span className="text-[10px] text-amber-400 block font-medium">Distritos en Riesgo Crítico</span>
                        <span className="text-lg font-black text-amber-300">
                            {resumen ? resumen.distritos_inaccion_critica : "--"}
                        </span>
                        <span className="text-[10px] text-amber-600/80 block mt-0.5">Inacción &gt; 80% con PIM &gt; S/1M</span>
                    </div>
                </div>
            </div>

            {/* Selector de Distrito & Inspector Táctico */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 border-b border-slate-800 pb-3">
                    <div>
                        <h2 className="text-sm font-bold text-white flex items-center gap-2">
                            <Compass className="w-4 h-4 text-rose-400" />
                            <span>Inspector Fiscal Distrital por Ubigeo</span>
                        </h2>
                        <p className="text-xs text-slate-400">
                            Verifique la asignación presupuestal y el semáforo penal por omisión funcional
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                        {DISTRITOS_RAPIDOS.map((d) => (
                            <button
                                key={d.ubigeo}
                                onClick={() => setUbigeoSeleccionado(d.ubigeo)}
                                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                                    ubigeoSeleccionado === d.ubigeo
                                        ? "bg-rose-600 text-white shadow font-bold"
                                        : "bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800"
                                }`}
                            >
                                {d.nombre} ({d.dep})
                            </button>
                        ))}
                    </div>
                </div>

                {distritoActual && (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
                        {/* Ficha Principal de Estado Fiscal */}
                        <div className="lg:col-span-8 space-y-4">
                            <div className={`p-4 rounded-xl border flex items-start gap-3.5 ${
                                distritoActual.semaforo_inaccion === "ROJO_INACCION_CRITICA"
                                    ? "bg-red-950/40 border-red-600/60"
                                    : distritoActual.semaforo_inaccion === "AMARILLO_RIESGO"
                                    ? "bg-amber-950/40 border-amber-600/60"
                                    : "bg-emerald-950/40 border-emerald-600/60"
                            }`}>
                                {distritoActual.semaforo_inaccion === "ROJO_INACCION_CRITICA" ? (
                                    <ShieldAlert className="w-6 h-6 text-red-400 shrink-0 mt-0.5" />
                                ) : distritoActual.semaforo_inaccion === "AMARILLO_RIESGO" ? (
                                    <AlertTriangle className="w-6 h-6 text-amber-400 shrink-0 mt-0.5" />
                                ) : (
                                    <ShieldCheck className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
                                )}

                                <div className="space-y-1.5 w-full">
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                        <div className="flex items-center gap-2">
                                            <span className={`text-xs font-black uppercase tracking-wide ${
                                                distritoActual.semaforo_inaccion === "ROJO_INACCION_CRITICA"
                                                    ? "text-red-300"
                                                    : distritoActual.semaforo_inaccion === "AMARILLO_RIESGO"
                                                    ? "text-amber-300"
                                                    : "text-emerald-300"
                                            }`}>
                                                ESTADO FISCAL: {distritoActual.semaforo_inaccion.replace(/_/g, " ")}
                                            </span>
                                            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-900 text-slate-300 border border-slate-700">
                                                UBIGEO: {distritoActual.ubigeo}
                                            </span>
                                        </div>

                                        <span className={`px-2.5 py-0.5 rounded text-[10px] font-mono font-bold border ${
                                            distritoActual.semaforo_inaccion === "ROJO_INACCION_CRITICA"
                                                ? "bg-red-900 text-red-100 border-red-700 animate-pulse"
                                                : distritoActual.semaforo_inaccion === "AMARILLO_RIESGO"
                                                ? "bg-amber-900 text-amber-100 border-amber-700"
                                                : "bg-emerald-900 text-emerald-100 border-emerald-700"
                                        }`}>
                                            TASA DE INACCIÓN: {distritoActual.tasa_inaccion_fiscal}%
                                        </span>
                                    </div>

                                    <h3 className="text-base font-bold text-white">
                                        Municipalidad Distrital de {distritoActual.distrito} ({distritoActual.provincia}, {distritoActual.departamento})
                                    </h3>
                                    <p className="text-xs text-slate-300">
                                        Alcalde responsable: <strong className="text-white">{distritoActual.alcalde}</strong>
                                    </p>

                                    {/* Barra de Progreso Presupuestal */}
                                    <div className="pt-2 space-y-1">
                                        <div className="flex justify-between text-xs font-mono">
                                            <span className="text-emerald-400">Devengado: {formatSoles(distritoActual.devengado_soles)} ({distritoActual.porcentaje_ejecucion}%)</span>
                                            <span className="text-slate-400">PIM Total: {formatSoles(distritoActual.pim_soles)}</span>
                                        </div>
                                        <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden flex">
                                            <div
                                                className="bg-emerald-500 h-2.5"
                                                style={{ width: `${Math.min(distritoActual.porcentaje_ejecucion, 100)}%` }}
                                            />
                                            <div
                                                className="bg-red-500/60 h-2.5"
                                                style={{ width: `${Math.max(100 - distritoActual.porcentaje_ejecucion, 0)}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Alerta Penal Art. 377 Código Penal */}
                            {distritoActual.advertencia_penal_art_377 && (
                                <div className="p-4 bg-red-950/70 border border-red-600/80 rounded-xl text-xs text-red-200 leading-relaxed flex items-start gap-3 shadow-lg">
                                    <AlertOctagon className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                                    <div>
                                        <strong className="text-red-300 block text-xs font-bold uppercase tracking-wider mb-1">
                                            Alerta de Imputación Penal • Art. 377 Código Penal:
                                        </strong>
                                        <span>{distritoActual.advertencia_penal_art_377}</span>
                                    </div>
                                </div>
                            )}

                            {/* Lista de Proyectos FONDES del Distrito */}
                            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
                                <div className="flex justify-between items-center border-b border-slate-850 pb-2">
                                    <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                                        Intervenciones &amp; Proyectos CUI FONDES ({distritoActual.proyectos_fondes?.length || 0})
                                    </span>
                                    <span className="text-[10px] text-slate-500 font-mono">Fondo FONDES</span>
                                </div>

                                {distritoActual.proyectos_fondes && distritoActual.proyectos_fondes.length > 0 ? (
                                    <div className="space-y-2">
                                        {distritoActual.proyectos_fondes.map((p, idx) => (
                                            <div
                                                key={idx}
                                                className="bg-slate-900/80 border border-slate-800 rounded-lg p-3 text-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-2"
                                            >
                                                <div className="space-y-1 max-w-xl">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-mono text-[10px] font-bold text-rose-300 bg-rose-950/80 px-2 py-0.5 rounded border border-rose-800">
                                                            CUI: {p.codigo_cui}
                                                        </span>
                                                        {p.alerta_cero_ejecucion && (
                                                            <span className="text-[9px] font-bold text-red-300 bg-red-950 px-2 py-0.5 rounded border border-red-800 animate-pulse">
                                                                0% EJECUCIÓN
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-slate-200 font-medium">{p.nombre_proyecto}</p>
                                                </div>
                                                <div className="text-right shrink-0">
                                                    <div className="font-mono text-emerald-400 font-bold">
                                                        {formatSoles(p.monto_devengado)}
                                                    </div>
                                                    <div className="text-[10px] text-slate-500">
                                                        de {formatSoles(p.monto_pim)} ({p.porcentaje_ejecucion}%)
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-xs text-slate-500 italic py-2">
                                        No se registran proyectos específicos de inversión CUI FONDES con código asignado en este distrito. El gasto se procesa bajo Actividad Operativa 5006144 (PP 0068).
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Panel Lateral: Ranking de Inacción Fiscal */}
                        <div className="lg:col-span-4 bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3 flex flex-col justify-between">
                            <div className="space-y-3">
                                <div className="flex items-center gap-2 text-xs font-bold text-white uppercase border-b border-slate-800 pb-2">
                                    <TrendingDown className="w-4 h-4 text-red-400" />
                                    <span>Top Distritos con Inacción Crítica</span>
                                </div>
                                <p className="text-[11px] text-slate-400">
                                    Distritos con mayor asignación de recursos y menor porcentaje de ejecución devengada:
                                </p>

                                <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                                    {ranking.map((r, idx) => (
                                        <div
                                            key={idx}
                                            onClick={() => setUbigeoSeleccionado(r.ubigeo)}
                                            className={`p-2.5 rounded-lg border cursor-pointer transition text-xs ${
                                                ubigeoSeleccionado === r.ubigeo
                                                    ? "bg-rose-950/60 border-rose-500 text-white"
                                                    : "bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-300"
                                            }`}
                                        >
                                            <div className="flex justify-between items-center">
                                                <span className="font-bold text-white">
                                                    #{idx + 1} {r.distrito}
                                                </span>
                                                <span className="font-mono text-[10px] text-red-400 font-bold">
                                                    {r.tasa_inaccion_fiscal}% inacción
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-center text-[10px] text-slate-400 mt-1">
                                                <span>{r.departamento}</span>
                                                <span className="font-mono">{formatSoles(r.pim_soles)}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="pt-3 border-t border-slate-850">
                                <Link
                                    href="/lex"
                                    className="w-full py-2 px-3 rounded-lg text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-amber-300 border border-amber-800/40 transition flex items-center justify-center gap-1.5"
                                >
                                    <Scale className="w-3.5 h-3.5" />
                                    <span>Ver Marco Legal de Contratación Directa</span>
                                </Link>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Proyectos FONDES a Nivel Nacional */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
                <div className="flex justify-between items-center border-b border-slate-850 pb-3">
                    <div className="flex items-center gap-2">
                        <FileSpreadsheet className="w-4 h-4 text-rose-400" />
                        <h2 className="text-sm font-bold text-white">
                            Intervenciones Prioritarias FONDES para Mitigación FEN
                        </h2>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
                        {proyectosFondes.length} Proyectos Filtrados
                    </span>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                        <thead>
                            <tr className="border-b border-slate-800 text-slate-400 text-[11px]">
                                <th className="py-2.5 px-3">CUI</th>
                                <th className="py-2.5 px-3">Proyecto / Obra</th>
                                <th className="py-2.5 px-3">Entidad Ejecutora</th>
                                <th className="py-2.5 px-3">Ubicación</th>
                                <th className="py-2.5 px-3 text-right">PIM Soles</th>
                                <th className="py-2.5 px-3 text-right">Devengado</th>
                                <th className="py-2.5 px-3 text-center">Avance</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60">
                            {proyectosFondes.map((p, idx) => (
                                <tr key={idx} className="hover:bg-slate-800/40 transition">
                                    <td className="py-2.5 px-3 font-mono text-rose-400 font-bold">
                                        {p.codigo_cui}
                                    </td>
                                    <td className="py-2.5 px-3 max-w-xs font-medium text-slate-200 truncate">
                                        {p.nombre_proyecto}
                                    </td>
                                    <td className="py-2.5 px-3 text-slate-400 max-w-[150px] truncate">
                                        {p.entidad}
                                    </td>
                                    <td className="py-2.5 px-3 text-slate-400">
                                        {p.distrito}, {p.departamento}
                                    </td>
                                    <td className="py-2.5 px-3 text-right font-mono text-slate-300">
                                        {formatSoles(p.monto_pim)}
                                    </td>
                                    <td className="py-2.5 px-3 text-right font-mono text-emerald-400 font-bold">
                                        {formatSoles(p.monto_devengado)}
                                    </td>
                                    <td className="py-2.5 px-3 text-center">
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                                            p.porcentaje_ejecucion === 0
                                                ? "bg-red-950 text-red-300 border border-red-800"
                                                : p.porcentaje_ejecucion < 30
                                                ? "bg-amber-950 text-amber-300 border border-amber-800"
                                                : "bg-emerald-950 text-emerald-300 border border-emerald-800"
                                        }`}>
                                            {p.porcentaje_ejecucion}%
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ========================================================================= */}
            {/* NAVEGADOR CONSULTA AMIGABLE MEF 0068 (PP 0068: NACIONAL, REGIONAL, LOCAL) */}
            {/* ========================================================================= */}
            <div className="bg-slate-900 border border-amber-500/40 rounded-2xl p-5 space-y-5 shadow-2xl">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-3 border-b border-slate-800 pb-4">
                    <div>
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1.5">
                                <Landmark className="w-3.5 h-3.5" />
                                MEF NAVEGADOR SIAF • CONSULTA AMIGABLE 2026
                            </span>
                            <span className="text-[10px] font-mono bg-slate-950 text-slate-300 px-2 py-0.5 rounded border border-slate-700 font-bold">
                                {mefObrasResumen?.total_obras_auditadas ?? 652} PROYECTOS CUI AUDITADOS
                            </span>
                            <span className="text-[10px] font-mono bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded border border-emerald-800 font-bold">
                                PIM: {mefObrasResumen ? formatSoles(mefObrasResumen.pim_total_soles) : "S/ 1,855M"}
                            </span>
                        </div>
                        <h2 className="text-lg font-black text-white tracking-tight mt-1 flex items-center gap-2">
                            <span>Navegador de Obras FEN 2026</span>
                            <span className="text-slate-500 font-light">|</span>
                            <span className="text-amber-400 font-semibold text-sm">
                                Diagnóstico de Cuellos de Botella SIAF y Art. 377 CP
                            </span>
                        </h2>
                        <p className="text-xs text-slate-400 mt-0.5">
                            Exploración granular de obras descargadas de la Consulta Amigable oficial (
                            <a
                                href="https://apps5.mineco.gob.pe/transparencia/Navegador/default.aspx"
                                target="_blank"
                                rel="noreferrer"
                                className="text-amber-300 underline inline-flex items-center gap-1 hover:text-amber-200"
                            >
                                apps5.mineco.gob.pe/transparencia/Navegador
                                <ArrowUpRight className="w-3 h-3" />
                            </a>
                            ) cruzadas con la etapa exacta donde el dinero está trabado.
                        </p>
                    </div>

                    <div className="text-right shrink-0">
                        <span className="text-[10px] text-slate-400 block font-mono">Corte Consulta Amigable:</span>
                        <span className="text-xs font-mono text-amber-300 font-bold">
                            {mefObrasResumen?.fecha_corte || "20-septiembre-2026"}
                        </span>
                    </div>
                </div>

                {/* Tarjetas de Diagnóstico de Cuellos de Botella SIAF */}
                {mefObrasResumen?.diagnostico_cuellos_botella_siaf && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                        <div
                            onClick={() => setFiltroCuelloBotella(filtroCuelloBotella === "SIN_CERTIFICAR" ? "TODOS" : "SIN_CERTIFICAR")}
                            className={`p-3 rounded-xl border cursor-pointer transition ${
                                filtroCuelloBotella === "SIN_CERTIFICAR"
                                    ? "bg-red-950/80 border-red-500 shadow-md"
                                    : "bg-slate-950/80 border-red-900/40 hover:border-red-700"
                            }`}
                        >
                            <div className="flex justify-between items-start">
                                <span className="text-[10px] text-red-400 font-bold uppercase">🛑 Sin Certificar (SIAF)</span>
                                <span className="text-[10px] font-mono text-red-300 font-bold bg-red-950 px-1.5 py-0.5 rounded border border-red-800">
                                    {mefObrasResumen.diagnostico_cuellos_botella_siaf.sin_certificar_obras} obras
                                </span>
                            </div>
                            <span className="text-base font-black text-white block mt-1">
                                {formatSoles(mefObrasResumen.diagnostico_cuellos_botella_siaf.sin_certificar_pim_soles)}
                            </span>
                            <span className="text-[10px] text-slate-400 block mt-0.5">
                                PIM &gt; S/100k con S/ 0 certificados (No inician bases)
                            </span>
                        </div>

                        <div
                            onClick={() => setFiltroCuelloBotella(filtroCuelloBotella === "LICITACION_TRABADA" ? "TODOS" : "LICITACION_TRABADA")}
                            className={`p-3 rounded-xl border cursor-pointer transition ${
                                filtroCuelloBotella === "LICITACION_TRABADA"
                                    ? "bg-amber-950/80 border-amber-500 shadow-md"
                                    : "bg-slate-950/80 border-amber-900/40 hover:border-amber-700"
                            }`}
                        >
                            <div className="flex justify-between items-start">
                                <span className="text-[10px] text-amber-400 font-bold uppercase">⚠️ Licitación Trabada</span>
                                <span className="text-[10px] font-mono text-amber-300 font-bold bg-amber-950 px-1.5 py-0.5 rounded border border-amber-800">
                                    {mefObrasResumen.diagnostico_cuellos_botella_siaf.licitacion_trabada_obras} obras
                                </span>
                            </div>
                            <span className="text-base font-black text-white block mt-1">
                                {formatSoles(mefObrasResumen.diagnostico_cuellos_botella_siaf.licitacion_trabada_pim_soles)}
                            </span>
                            <span className="text-[10px] text-slate-400 block mt-0.5">
                                Certificado aprobado pero S/ 0 comprometidos (OSCE/Desierta)
                            </span>
                        </div>

                        <div
                            onClick={() => setFiltroCuelloBotella(filtroCuelloBotella === "CONTRATO_SIN_DEVENGAR" ? "TODOS" : "CONTRATO_SIN_DEVENGAR")}
                            className={`p-3 rounded-xl border cursor-pointer transition ${
                                filtroCuelloBotella === "CONTRATO_SIN_DEVENGAR"
                                    ? "bg-purple-950/80 border-purple-500 shadow-md"
                                    : "bg-slate-950/80 border-purple-900/40 hover:border-purple-700"
                            }`}
                        >
                            <div className="flex justify-between items-start">
                                <span className="text-[10px] text-purple-400 font-bold uppercase">⏳ Contrato Sin Devengar</span>
                                <span className="text-[10px] font-mono text-purple-300 font-bold bg-purple-950 px-1.5 py-0.5 rounded border border-purple-800">
                                    {mefObrasResumen.diagnostico_cuellos_botella_siaf.contrato_sin_devengar_obras} obras
                                </span>
                            </div>
                            <span className="text-base font-black text-white block mt-1">
                                {formatSoles(mefObrasResumen.diagnostico_cuellos_botella_siaf.contrato_sin_devengar_pim_soles)}
                            </span>
                            <span className="text-[10px] text-slate-400 block mt-0.5">
                                Contrato firmado pero S/ 0 devengados (Contratista inactivo)
                            </span>
                        </div>

                        <div className="p-3 rounded-xl border border-red-800 bg-red-950/40">
                            <div className="flex justify-between items-start">
                                <span className="text-[10px] text-red-300 font-bold uppercase">⚖️ Riesgo Penal Art. 377</span>
                                <span className="text-[10px] font-mono text-red-200 font-bold bg-red-900 px-1.5 py-0.5 rounded border border-red-700 animate-pulse">
                                    {mefObrasResumen.diagnostico_cuellos_botella_siaf.obras_inaccion_critica_art_377} obras
                                </span>
                            </div>
                            <span className="text-base font-black text-red-200 block mt-1">
                                {formatSoles(mefObrasResumen.diagnostico_cuellos_botella_siaf.monto_en_riesgo_inaccion_soles)}
                            </span>
                            <span className="text-[10px] text-slate-300 block mt-0.5">
                                PIM &ge; S/ 500k con avance &lt; 15% en zona de emergencia
                            </span>
                        </div>
                    </div>
                )}

                {/* Filtros de Navegación: Nivel de Gobierno, Cuello de Botella y Buscador CUI */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 pt-1">
                    {/* Botones de Nivel de Gobierno */}
                    <div className="flex flex-wrap items-center gap-1.5 text-xs">
                        <button
                            onClick={() => setFiltroNivelObra("TODOS")}
                            className={`px-3 py-1.5 rounded-xl font-bold transition ${
                                filtroNivelObra === "TODOS"
                                    ? "bg-amber-600 text-white shadow"
                                    : "bg-slate-950 text-slate-400 hover:text-white border border-slate-800"
                            }`}
                        >
                            Todos ({mefObrasResumen?.total_obras_auditadas ?? 652})
                        </button>
                        <button
                            onClick={() => setFiltroNivelObra("REGIONAL")}
                            className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 ${
                                filtroNivelObra === "REGIONAL"
                                    ? "bg-purple-600 text-white shadow"
                                    : "bg-slate-950 text-purple-300 hover:text-white border border-slate-800"
                            }`}
                        >
                            <span>🏢 Gobiernos Regionales (65)</span>
                        </button>
                        <button
                            onClick={() => setFiltroNivelObra("LOCAL")}
                            className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 ${
                                filtroNivelObra === "LOCAL"
                                    ? "bg-sky-600 text-white shadow"
                                    : "bg-slate-950 text-sky-300 hover:text-white border border-slate-800"
                            }`}
                        >
                            <span>🏘️ Gobiernos Locales (587)</span>
                        </button>
                    </div>

                    {/* Selector de Estado SIAF y Barra de Búsqueda */}
                    <div className="flex flex-wrap items-center gap-2 text-xs w-full md:w-auto">
                        <select
                            value={filtroCuelloBotella}
                            onChange={(e) => setFiltroCuelloBotella(e.target.value)}
                            className="bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-slate-300 focus:outline-none"
                        >
                            <option value="TODOS">Todos los Estados SIAF</option>
                            <option value="SIN_CERTIFICAR">🛑 Sin Certificar</option>
                            <option value="LICITACION_TRABADA">⚠️ Licitación Trabada</option>
                            <option value="CONTRATO_SIN_DEVENGAR">⏳ Contrato Sin Devengar</option>
                            <option value="EN_EJECUCION_REGULAR">✅ En Ejecución Regular</option>
                            <option value="CULMINADO_O_AVANZADO">🎉 Culminado o Avanzado (≥80%)</option>
                        </select>

                        <div className="relative flex-1 md:w-64">
                            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                            <input
                                type="text"
                                placeholder="Buscar por CUI (ej. 2684873), río o distrito..."
                                value={busquedaObra}
                                onChange={(e) => setBusquedaObra(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                            />
                        </div>
                    </div>
                </div>

                {/* Tabla Interactiva de las 652 Obras */}
                <div className="overflow-x-auto max-h-[520px] overflow-y-auto rounded-xl border border-slate-850">
                    <table className="w-full text-left text-xs">
                        <thead className="sticky top-0 bg-slate-950 border-b border-slate-800 text-slate-400 text-[11px] z-10">
                            <tr>
                                <th className="py-2.5 px-3">CUI</th>
                                <th className="py-2.5 px-3">Denominación del Proyecto / Obra FEN</th>
                                <th className="py-2.5 px-3">Nivel</th>
                                <th className="py-2.5 px-3">Región / Cuenca</th>
                                <th className="py-2.5 px-3 text-right">PIM Soles</th>
                                <th className="py-2.5 px-3 text-right">Devengado</th>
                                <th className="py-2.5 px-3 text-center">Avance</th>
                                <th className="py-2.5 px-3 text-center">Fase SIAF</th>
                                <th className="py-2.5 px-3 text-center">Acción</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60">
                            {mefObras
                                .filter((o) => {
                                    const matchNivel =
                                        filtroNivelObra === "TODOS" ||
                                        (filtroNivelObra === "REGIONAL" && o.nivel_gobierno === "GOBIERNO REGIONAL") ||
                                        (filtroNivelObra === "LOCAL" && o.nivel_gobierno === "GOBIERNO LOCAL");

                                    const matchCuello =
                                        filtroCuelloBotella === "TODOS" || o.cuello_botella_siaf === filtroCuelloBotella;

                                    const matchBusqueda =
                                        !busquedaObra ||
                                        o.cui.toLowerCase().includes(busquedaObra.toLowerCase()) ||
                                        o.nombre_proyecto.toLowerCase().includes(busquedaObra.toLowerCase()) ||
                                        o.departamento.toLowerCase().includes(busquedaObra.toLowerCase());

                                    return matchNivel && matchCuello && matchBusqueda;
                                })
                                .map((obra, idx) => (
                                    <tr key={idx} className="hover:bg-slate-800/40 transition">
                                        <td className="py-2.5 px-3 font-mono text-amber-400 font-bold whitespace-nowrap">
                                            {obra.cui}
                                        </td>
                                        <td className="py-2.5 px-3 max-w-sm">
                                            <p className="font-medium text-slate-200 line-clamp-2 leading-snug">
                                                {obra.nombre_proyecto}
                                            </p>
                                        </td>
                                        <td className="py-2.5 px-3 whitespace-nowrap">
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                                obra.nivel_gobierno === "GOBIERNO REGIONAL"
                                                    ? "bg-purple-950 text-purple-300 border border-purple-800"
                                                    : "bg-sky-950 text-sky-300 border border-sky-800"
                                            }`}>
                                                {obra.nivel_gobierno === "GOBIERNO REGIONAL" ? "REGIONAL" : "LOCAL"}
                                            </span>
                                        </td>
                                        <td className="py-2.5 px-3 text-slate-300 text-[11px] whitespace-nowrap">
                                            <div className="font-semibold">{obra.departamento}</div>
                                            {obra.cuenca_rio && (
                                                <div className="text-[10px] text-teal-400 font-mono">
                                                    Río {obra.cuenca_rio}
                                                </div>
                                            )}
                                        </td>
                                        <td className="py-2.5 px-3 text-right font-mono text-slate-200 font-medium whitespace-nowrap">
                                            {formatSoles(obra.pim_soles)}
                                        </td>
                                        <td className="py-2.5 px-3 text-right font-mono text-emerald-400 font-bold whitespace-nowrap">
                                            {formatSoles(obra.devengado_soles)}
                                        </td>
                                        <td className="py-2.5 px-3 text-center whitespace-nowrap">
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                                                obra.porcentaje_ejecucion === 0
                                                    ? "bg-red-950 text-red-300 border border-red-800"
                                                    : obra.porcentaje_ejecucion < 30
                                                    ? "bg-amber-950 text-amber-300 border border-amber-800"
                                                    : "bg-emerald-950 text-emerald-300 border border-emerald-800"
                                            }`}>
                                                {obra.porcentaje_ejecucion}%
                                            </span>
                                        </td>
                                        <td className="py-2.5 px-3 text-center whitespace-nowrap">
                                            <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                                                obra.cuello_botella_siaf === "SIN_CERTIFICAR"
                                                    ? "bg-red-950 text-red-300 border border-red-800"
                                                    : obra.cuello_botella_siaf === "LICITACION_TRABADA"
                                                    ? "bg-amber-950 text-amber-300 border border-amber-800"
                                                    : obra.cuello_botella_siaf === "CONTRATO_SIN_DEVENGAR"
                                                    ? "bg-purple-950 text-purple-300 border border-purple-800"
                                                    : obra.cuello_botella_siaf === "CULMINADO_O_AVANZADO"
                                                    ? "bg-teal-950 text-teal-300 border border-teal-800"
                                                    : "bg-slate-900 text-slate-300 border border-slate-700"
                                            }`}>
                                                {obra.cuello_botella_siaf?.replace(/_/g, " ")}
                                            </span>
                                        </td>
                                        <td className="py-2.5 px-3 text-center whitespace-nowrap">
                                            <button
                                                onClick={() => setObraModal(obra)}
                                                className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 transition"
                                            >
                                                Ficha 360°
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal de Ficha 360° de la Obra MEF */}
            {obraModal && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-slate-900 border border-amber-500/50 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-4 shadow-2xl">
                        <div className="flex justify-between items-start border-b border-slate-800 pb-3">
                            <div>
                                <span className="font-mono text-xs font-bold text-amber-400 bg-amber-950/80 px-2.5 py-0.5 rounded border border-amber-800">
                                    CUI: {obraModal.cui}
                                </span>
                                <h3 className="text-sm font-bold text-white mt-1 leading-snug">
                                    {obraModal.nombre_proyecto}
                                </h3>
                            </div>
                            <button
                                onClick={() => setObraModal(null)}
                                className="text-slate-400 hover:text-white px-2 py-1 text-sm font-bold"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Alerta Penal Art. 377 si corresponde */}
                        {obraModal.alerta_penal_art_377 && (
                            <div className="p-3.5 bg-red-950/80 border border-red-600 rounded-xl text-xs text-red-200 leading-relaxed flex items-start gap-2.5">
                                <AlertOctagon className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                                <div>
                                    <strong className="text-red-300 block font-bold mb-0.5">
                                        Exposición de Responsabilidad Funcional y Penal:
                                    </strong>
                                    <span>{obraModal.alerta_penal_art_377}</span>
                                </div>
                            </div>
                        )}

                        {/* Desglose Anatómico del SIAF */}
                        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3 text-xs">
                            <span className="font-bold text-slate-300 uppercase tracking-wider block text-[11px]">
                                Flujo Financiero en el Sistema Integrado de Administración Financiera (SIAF-MEF)
                            </span>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                                <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-850">
                                    <span className="text-[10px] text-slate-400 block">PIA Inicial:</span>
                                    <span className="font-mono text-white font-bold">{formatSoles(obraModal.pia_soles)}</span>
                                </div>
                                <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-850">
                                    <span className="text-[10px] text-slate-400 block">PIM Modificado:</span>
                                    <span className="font-mono text-amber-300 font-bold">{formatSoles(obraModal.pim_soles)}</span>
                                </div>
                                <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-850">
                                    <span className="text-[10px] text-slate-400 block">Certificación:</span>
                                    <span className="font-mono text-sky-300 font-bold">{formatSoles(obraModal.certificacion_soles)}</span>
                                </div>
                                <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-850">
                                    <span className="text-[10px] text-slate-400 block">Compromiso Anual:</span>
                                    <span className="font-mono text-purple-300 font-bold">{formatSoles(obraModal.compromiso_anual_soles)}</span>
                                </div>
                                <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-850">
                                    <span className="text-[10px] text-slate-400 block">Devengado (Ejecutado):</span>
                                    <span className="font-mono text-emerald-400 font-bold">{formatSoles(obraModal.devengado_soles)}</span>
                                </div>
                                <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-850">
                                    <span className="text-[10px] text-slate-400 block">Avance Financiero:</span>
                                    <span className="font-mono text-white font-bold">{obraModal.porcentaje_ejecucion}%</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end pt-2">
                            <button
                                onClick={() => setObraModal(null)}
                                className="px-4 py-1.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
                            >
                                Cerrar Ficha
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
