"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { API_BASE } from "@/config/api";
import {
    Activity,
    ShieldAlert,
    AlertTriangle,
    Search,
    RefreshCw,
    Building2,
    Calendar,
    Thermometer,
    Droplets,
    Bed,
    HeartPulse,
    Sparkles,
    CheckCircle2,
    Compass,
    Sliders,
    Zap,
    Skull,
    AlertOctagon
} from "lucide-react";

interface ResumenNacionalDengue {
    total_casos_nacional: number;
    sin_signos_alarma: number;
    con_signos_alarma: number;
    dengue_grave: number;
    hospitalizados_actuales: number;
    fallecidos_confirmados: number;
    tasa_letalidad_nacional_pct: number;
    departamentos_afectados: number;
    distritos_en_brote: number;
    semana_epidemiologica: number;
    fecha_corte: string;
    conector_id: string;
    hash_auditoria_sha256: string;
}

interface SituacionDengueDistrito {
    ubigeo: string;
    distrito: string;
    provincia: string;
    departamento: string;
    total_casos: number;
    sin_signos_alarma: number;
    con_signos_alarma: number;
    dengue_grave: number;
    hospitalizados: number;
    fallecidos: number;
    incidencia_por_100k_hab: number;
    estado_brote: "BROTE_ACTIVO" | "ALERTA_EPIDEMIOLOGICA" | "ENDEMICO_CONTROLADO";
    semana_epidemiologica: number;
    requiere_uviclin_emergencia: boolean;
    fecha_corte: string;
}

interface InsumosNecesidad {
    ubigeo: string;
    distrito: string;
    departamento: string;
    casos_activos: number;
    camas_uviclin_requeridas: number;
    camas_uviclin_existentes: number;
    deficit_camas_uviclin: number;
    raciones_hidratacion_oral_sobres: number;
    solucion_salina_cloruro_litros: number;
    equipos_venoclisis_unidades: number;
    insecticida_malation_litros: number;
    manzanas_fumigacion_requeridas: number;
    alerta_colapso_hospitalario: boolean;
}

interface RiesgoBioclimatico {
    ubigeo: string;
    distrito: string;
    departamento: string;
    precipitacion_acumulada_mm: number;
    dias_agua_empozada: number;
    casos_dengue_actuales: number;
    indice_riesgo_bioclimatico: number;
    nivel_riesgo: "CRITICO" | "ALTO" | "MODERADO" | "BAJO";
    factores_riesgo: string[];
    recomendaciones: string[];
}

const DISTRITOS_PRIORITARIOS = [
    { ubigeo: "200101", nombre: "Piura", dep: "Piura" },
    { ubigeo: "200114", nombre: "Tambogrande", dep: "Piura" },
    { ubigeo: "200601", nombre: "Sullana", dep: "Piura" },
    { ubigeo: "140305", nombre: "Íllimo", dep: "Lambayeque" },
    { ubigeo: "130101", nombre: "Trujillo", dep: "La Libertad" },
    { ubigeo: "150118", nombre: "Lurigancho-Chosica", dep: "Lima" }
];

export default function SaludDenguePage() {
    const [resumen, setResumen] = useState<ResumenNacionalDengue | null>(null);
    const [distritoActual, setDistritoActual] = useState<SituacionDengueDistrito | null>(null);
    const [insumos, setInsumos] = useState<InsumosNecesidad | null>(null);
    const [bioclimatico, setBioclimatico] = useState<RiesgoBioclimatico | null>(null);
    const [brotes, setBrotes] = useState<SituacionDengueDistrito[]>([]);
    const [ubigeoSeleccionado, setUbigeoSeleccionado] = useState<string>("200114");

    // Parámetros de simulación bioclimática
    const [lluviaMm, setLluviaMm] = useState<number>(145);
    const [diasEmpoce, setDiasEmpoce] = useState<number>(6);

    const [cargando, setCargando] = useState<boolean>(true);
    const [sincronizando, setSincronizando] = useState<boolean>(false);
    const [mensajeSync, setMensajeSync] = useState<string | null>(null);

    const apiBase = API_BASE;

    const cargarDatos = async (ubigeo: string, lluvia: number = lluviaMm, empoce: number = diasEmpoce) => {
        setCargando(true);
        try {
            const [resResumen, resDist, resInsumos, resBio, resBrotes] = await Promise.all([
                fetch(`${apiBase}/api/v1/salud/dengue/resumen`),
                fetch(`${apiBase}/api/v1/salud/dengue/distrito/${ubigeo}`),
                fetch(`${apiBase}/api/v1/salud/dengue/insumos-necesidad/${ubigeo}`),
                fetch(`${apiBase}/api/v1/salud/dengue/riesgo-bioclimatico/${ubigeo}?precipitacion_mm=${lluvia}&dias_agua_empozada=${empoce}`),
                fetch(`${apiBase}/api/v1/salud/dengue/brotes?limite=10`)
            ]);

            if (resResumen.ok) setResumen(await resResumen.json());
            if (resDist.ok) setDistritoActual(await resDist.json());
            if (resInsumos.ok) setInsumos(await resInsumos.json());
            if (resBio.ok) setBioclimatico(await resBio.json());
            if (resBrotes.ok) {
                const bJson = await resBrotes.json();
                setBrotes(bJson.brotes || []);
            }
        } catch (err) {
            console.error("Error al cargar datos epidemiológicos:", err);
        } finally {
            setCargando(false);
        }
    };

    const handleSincronizarDengue = async () => {
        setSincronizando(true);
        setMensajeSync(null);
        try {
            const res = await fetch(`${apiBase}/api/v1/kuraq/sincronizar-dengue`, {
                method: "POST"
            });
            if (res.ok) {
                const data = await res.json();
                setMensajeSync(`Vigilancia CDC sincronizada: ${data.total_casos_analizados} casos procesados (SHA-256: ${data.hash_sha256?.substring(0, 10)}...)`);
                await cargarDatos(ubigeoSeleccionado);
            }
        } catch (err) {
            setMensajeSync("Fallo en sincronización. Usando serie canónica CDC.");
        } finally {
            setSincronizando(false);
        }
    };

    const handleSimularBioclima = () => {
        cargarDatos(ubigeoSeleccionado, lluviaMm, diasEmpoce);
    };

    useEffect(() => {
        cargarDatos(ubigeoSeleccionado);
    }, [ubigeoSeleccionado]);

    return (
        <div className="space-y-6 max-w-7xl mx-auto pb-16">
            {/* Header Hero */}
            <div className="bg-gradient-to-r from-slate-900 via-teal-950/40 to-slate-900 border border-teal-500/30 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
                <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 relative z-10">
                    <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-teal-500/20 text-teal-300 border border-teal-500/40 flex items-center gap-1.5">
                                <Activity className="w-3.5 h-3.5" />
                                VIGILANCIA EPIDEMIOLÓGICA CDC • MINSA 2026
                            </span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-950 text-slate-300 border border-slate-700 font-bold">
                                SRC-MINSA-CDC-DENGUE
                            </span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-950 text-emerald-300 border border-emerald-800 flex items-center gap-1 font-bold">
                                <HeartPulse className="w-3 h-3 text-emerald-400" />
                                MODELO BIOCLIMÁTICO DE RIESGO VECTORIAL
                            </span>
                        </div>
                        <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight flex items-center gap-3">
                            <span>Vigilancia Epidemiológica de Dengue</span>
                            <span className="text-slate-500 font-light text-xl">|</span>
                            <span className="text-teal-400 font-semibold text-lg md:text-xl">
                                Brotes FEN &amp; Capacidad Hospitalaria
                            </span>
                        </h1>
                        <p className="text-xs md:text-sm text-slate-300 max-w-3xl leading-relaxed">
                            Integración oficial con la Red Nacional de Epidemiología (<strong>RENACE/CDC Perú</strong>): Detección de brotes activos, proyección de camas UVICLIN requeridas, cálculo de insecticida para nebulización y correlación bioclimática entre lluvias FEN y proliferación del vector <em>Aedes aegypti</em>.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <button
                            onClick={handleSincronizarDengue}
                            disabled={sincronizando}
                            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-teal-900/60 hover:bg-teal-800 text-teal-200 border border-teal-600/50 transition flex items-center gap-1.5 shadow disabled:opacity-50"
                            title="Sincronizar datasets con el Centro Nacional de Epidemiología, Prevención y Control de Enfermedades"
                        >
                            <RefreshCw className={`w-3.5 h-3.5 ${sincronizando ? "animate-spin text-teal-400" : ""}`} />
                            <span>{sincronizando ? "Descargando CDC..." : "Sincronizar CDC (KURAQ)"}</span>
                        </button>
                        <Link
                            href="/edan"
                            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-950 hover:bg-slate-800 text-slate-200 border border-slate-700 transition flex items-center gap-1.5 shadow"
                        >
                            <Building2 className="w-3.5 h-3.5 text-emerald-400" />
                            <span>EDAN SINPAD</span>
                        </Link>
                    </div>
                </div>

                {mensajeSync && (
                    <div className="mt-4 p-3 bg-emerald-950/60 border border-emerald-600/60 rounded-xl flex items-center gap-2 text-xs text-emerald-200">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>{mensajeSync}</span>
                    </div>
                )}

                {/* Métricas Epidemiológicas Nacionales */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-5 pt-4 border-t border-slate-800/80 text-xs">
                    <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800">
                        <span className="text-[10px] text-slate-400 block font-medium">Total Casos Nacional</span>
                        <span className="text-lg font-black text-white">
                            {resumen ? resumen.total_casos_nacional.toLocaleString() : "--"}
                        </span>
                        <span className="text-[10px] text-slate-500 block mt-0.5">Semana SE {resumen?.semana_epidemiologica || 11}</span>
                    </div>
                    <div className="bg-slate-950/80 p-3 rounded-xl border border-teal-900/40">
                        <span className="text-[10px] text-teal-400 block font-medium">Sin Signos Alarma</span>
                        <span className="text-lg font-black text-teal-300">
                            {resumen ? resumen.sin_signos_alarma.toLocaleString() : "--"}
                        </span>
                        <span className="text-[10px] text-teal-600/80 block mt-0.5">Manejo ambulatorio</span>
                    </div>
                    <div className="bg-slate-950/80 p-3 rounded-xl border border-amber-900/40">
                        <span className="text-[10px] text-amber-400 block font-medium">Con Signos Alarma</span>
                        <span className="text-lg font-black text-amber-300">
                            {resumen ? resumen.con_signos_alarma.toLocaleString() : "--"}
                        </span>
                        <span className="text-[10px] text-amber-600/80 block mt-0.5">Vigilancia UVICLIN</span>
                    </div>
                    <div className="bg-slate-950/80 p-3 rounded-xl border border-rose-900/40">
                        <span className="text-[10px] text-rose-400 block font-medium">Dengue Grave</span>
                        <span className="text-lg font-black text-rose-400">
                            {resumen ? resumen.dengue_grave.toLocaleString() : "--"}
                        </span>
                        <span className="text-[10px] text-rose-600/80 block mt-0.5">UCI / Shock</span>
                    </div>
                    <div className="bg-slate-950/80 p-3 rounded-xl border border-sky-900/40">
                        <span className="text-[10px] text-sky-400 block font-medium">Hospitalizados</span>
                        <span className="text-lg font-black text-sky-300">
                            {resumen ? resumen.hospitalizados_actuales.toLocaleString() : "--"}
                        </span>
                        <span className="text-[10px] text-sky-600/80 block mt-0.5">Camas ocupadas</span>
                    </div>
                    <div className="bg-slate-950/80 p-3 rounded-xl border border-red-950/80">
                        <span className="text-[10px] text-red-400 block font-medium">Fallecidos / Letalidad</span>
                        <span className="text-lg font-black text-red-400">
                            {resumen ? `${resumen.fallecidos_confirmados} (${resumen.tasa_letalidad_nacional_pct}%)` : "--"}
                        </span>
                        <span className="text-[10px] text-red-600/80 block mt-0.5">Meta &lt; 0.1%</span>
                    </div>
                </div>
            </div>

            {/* Selector de Distrito & Monitor Epidemiológico */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 border-b border-slate-800 pb-3">
                    <div>
                        <h2 className="text-sm font-bold text-white flex items-center gap-2">
                            <Compass className="w-4 h-4 text-teal-400" />
                            <span>Monitor Epidemiológico por Ubigeo</span>
                        </h2>
                        <p className="text-xs text-slate-400">
                            Evaluación de brote distrital, camas de hidratación UVICLIN e insumos de nebulización
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                        {DISTRITOS_PRIORITARIOS.map((d) => (
                            <button
                                key={d.ubigeo}
                                onClick={() => setUbigeoSeleccionado(d.ubigeo)}
                                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                                    ubigeoSeleccionado === d.ubigeo
                                        ? "bg-teal-600 text-white shadow font-bold"
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
                        {/* Panel Central: Estado de Brote y Severidad */}
                        <div className="lg:col-span-7 space-y-4">
                            <div className={`p-4 rounded-xl border flex items-start gap-3.5 ${
                                distritoActual.estado_brote === "BROTE_ACTIVO"
                                    ? "bg-red-950/40 border-red-600/60"
                                    : distritoActual.estado_brote === "ALERTA_EPIDEMIOLOGICA"
                                    ? "bg-amber-950/40 border-amber-600/60"
                                    : "bg-emerald-950/40 border-emerald-600/60"
                            }`}>
                                {distritoActual.estado_brote === "BROTE_ACTIVO" ? (
                                    <ShieldAlert className="w-6 h-6 text-red-400 shrink-0 mt-0.5" />
                                ) : distritoActual.estado_brote === "ALERTA_EPIDEMIOLOGICA" ? (
                                    <AlertTriangle className="w-6 h-6 text-amber-400 shrink-0 mt-0.5" />
                                ) : (
                                    <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
                                )}

                                <div className="space-y-1.5 w-full">
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                        <div className="flex items-center gap-2">
                                            <span className={`text-xs font-black uppercase tracking-wide ${
                                                distritoActual.estado_brote === "BROTE_ACTIVO"
                                                    ? "text-red-300"
                                                    : distritoActual.estado_brote === "ALERTA_EPIDEMIOLOGICA"
                                                    ? "text-amber-300"
                                                    : "text-emerald-300"
                                            }`}>
                                                ESTADO SANITARIO: {distritoActual.estado_brote.replace(/_/g, " ")}
                                            </span>
                                            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-900 text-slate-300 border border-slate-700">
                                                UBIGEO: {distritoActual.ubigeo}
                                            </span>
                                        </div>

                                        <span className={`px-2.5 py-0.5 rounded text-[10px] font-mono font-bold border ${
                                            distritoActual.estado_brote === "BROTE_ACTIVO"
                                                ? "bg-red-900 text-red-100 border-red-700 animate-pulse"
                                                : "bg-amber-900 text-amber-100 border-amber-700"
                                        }`}>
                                            INCIDENCIA: {distritoActual.incidencia_por_100k_hab} / 100k hab.
                                        </span>
                                    </div>

                                    <h3 className="text-base font-bold text-white">
                                        Distrito de {distritoActual.distrito} ({distritoActual.provincia}, {distritoActual.departamento})
                                    </h3>
                                    <p className="text-xs text-slate-300">
                                        Total acumulado: <strong className="text-white">{distritoActual.total_casos} casos</strong> reportados en el sistema RENACE.
                                    </p>

                                    {/* Gráfica de Barras por Severidad */}
                                    <div className="grid grid-cols-3 gap-2 pt-2">
                                        <div className="bg-slate-950/80 p-2 rounded-lg border border-slate-800 text-center">
                                            <span className="text-[10px] text-teal-400 block font-medium">Sin Alarma</span>
                                            <span className="text-sm font-bold text-white">{distritoActual.sin_signos_alarma}</span>
                                        </div>
                                        <div className="bg-slate-950/80 p-2 rounded-lg border border-amber-800/40 text-center">
                                            <span className="text-[10px] text-amber-400 block font-medium">Con Alarma</span>
                                            <span className="text-sm font-bold text-amber-300">{distritoActual.con_signos_alarma}</span>
                                        </div>
                                        <div className="bg-slate-950/80 p-2 rounded-lg border border-rose-800/40 text-center">
                                            <span className="text-[10px] text-rose-400 block font-medium">Grave</span>
                                            <span className="text-sm font-bold text-rose-400">{distritoActual.dengue_grave}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Calculadora de Insumos Médicos & UVICLIN */}
                            {insumos && (
                                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
                                    <div className="flex justify-between items-center border-b border-slate-850 pb-2">
                                        <div className="flex items-center gap-2">
                                            <Bed className="w-4 h-4 text-teal-400" />
                                            <span className="text-xs font-bold text-white uppercase tracking-wider">
                                                Cálculo de Demanda de Recursos Sanitarios (UVICLIN)
                                            </span>
                                        </div>
                                        {insumos.alerta_colapso_hospitalario && (
                                            <span className="text-[9px] font-bold text-red-300 bg-red-950 px-2 py-0.5 rounded border border-red-800 animate-pulse">
                                                DÉFICIT DE CAMAS
                                            </span>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                                        <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                                            <span className="text-[10px] text-slate-400 block">Camas Requeridas</span>
                                            <span className="text-base font-bold text-white">{insumos.camas_uviclin_requeridas}</span>
                                            <span className="text-[9px] text-slate-500 block">Existentes: {insumos.camas_uviclin_existentes}</span>
                                        </div>
                                        <div className="bg-slate-900/80 p-2.5 rounded-lg border border-red-900/40">
                                            <span className="text-[10px] text-red-400 block">Déficit Camas</span>
                                            <span className="text-base font-bold text-red-300">
                                                {insumos.deficit_camas_uviclin > 0 ? `-${insumos.deficit_camas_uviclin}` : "0"}
                                            </span>
                                            <span className="text-[9px] text-slate-500 block">Brecha hospitalaria</span>
                                        </div>
                                        <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                                            <span className="text-[10px] text-slate-400 block">Sales Rehidratación</span>
                                            <span className="text-base font-bold text-teal-300">
                                                {insumos.raciones_hidratacion_oral_sobres.toLocaleString()}
                                            </span>
                                            <span className="text-[9px] text-slate-500 block">Sobres de SRO</span>
                                        </div>
                                        <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                                            <span className="text-[10px] text-slate-400 block">Cloruro de Sodio</span>
                                            <span className="text-base font-bold text-sky-300">
                                                {insumos.solucion_salina_cloruro_litros.toLocaleString()} L
                                            </span>
                                            <span className="text-[9px] text-slate-500 block">Suero endovenoso</span>
                                        </div>
                                    </div>

                                    {/* Demanda de Fumigación */}
                                    <div className="p-3 bg-teal-950/30 border border-teal-800/40 rounded-lg flex justify-between items-center text-xs">
                                        <div>
                                            <span className="text-teal-300 font-bold block">
                                                Control Vectorial por Nebulización Espacial:
                                            </span>
                                            <span className="text-slate-400 text-[11px]">
                                                {insumos.manzanas_fumigacion_requeridas} manzanas urbanas priorizadas
                                            </span>
                                        </div>
                                        <div className="text-right">
                                            <span className="font-mono text-teal-400 font-bold text-sm">
                                                {insumos.insecticida_malation_litros} L
                                            </span>
                                            <span className="text-[10px] text-slate-500 block">Malatión 57% EC</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Panel Lateral: Simulador de Riesgo Bioclimático */}
                        <div className="lg:col-span-5 bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-4 flex flex-col justify-between">
                            <div className="space-y-3">
                                <div className="flex items-center gap-2 text-xs font-bold text-white uppercase border-b border-slate-800 pb-2">
                                    <Droplets className="w-4 h-4 text-sky-400" />
                                    <span>Correlación Bioclimática Dengue-Lluvia</span>
                                </div>
                                <p className="text-[11px] text-slate-400">
                                    Simule el impacto del incremento de lluvias FEN y días de agua empozada sobre el riesgo de dispersión larvaria:
                                </p>

                                {/* Controles del Simulador */}
                                <div className="space-y-3 bg-slate-900/60 p-3 rounded-xl border border-slate-850 text-xs">
                                    <div>
                                        <div className="flex justify-between text-slate-300 mb-1">
                                            <span>Precipitación Acumulada:</span>
                                            <span className="font-mono font-bold text-sky-400">{lluviaMm} mm</span>
                                        </div>
                                        <input
                                            type="range"
                                            min="0"
                                            max="400"
                                            step="5"
                                            value={lluviaMm}
                                            onChange={(e) => setLluviaMm(Number(e.target.value))}
                                            className="w-full accent-sky-500 cursor-pointer"
                                        />
                                    </div>

                                    <div>
                                        <div className="flex justify-between text-slate-300 mb-1">
                                            <span>Días con Agua Empozada:</span>
                                            <span className="font-mono font-bold text-teal-400">{diasEmpoce} días</span>
                                        </div>
                                        <input
                                            type="range"
                                            min="0"
                                            max="20"
                                            step="1"
                                            value={diasEmpoce}
                                            onChange={(e) => setDiasEmpoce(Number(e.target.value))}
                                            className="w-full accent-teal-500 cursor-pointer"
                                        />
                                    </div>

                                    <button
                                        onClick={handleSimularBioclima}
                                        className="w-full py-1.5 rounded-lg text-xs font-bold bg-teal-600 hover:bg-teal-500 text-white transition flex items-center justify-center gap-1.5 shadow"
                                    >
                                        <Sliders className="w-3.5 h-3.5" />
                                        <span>Recalcular Índice Bioclimático</span>
                                    </button>
                                </div>

                                {/* Resultado Bioclimático */}
                                {bioclimatico && (
                                    <div className="space-y-2 pt-1 text-xs">
                                        <div className="flex justify-between items-center bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                                            <span className="text-slate-400">Índice IRBV:</span>
                                            <span className="font-mono font-black text-base text-teal-300">
                                                {bioclimatico.indice_riesgo_bioclimatico} / 100
                                            </span>
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                                bioclimatico.nivel_riesgo === "CRITICO"
                                                    ? "bg-red-950 text-red-300 border border-red-800 animate-pulse"
                                                    : bioclimatico.nivel_riesgo === "ALTO"
                                                    ? "bg-amber-950 text-amber-300 border border-amber-800"
                                                    : "bg-emerald-950 text-emerald-300 border border-emerald-800"
                                            }`}>
                                                {bioclimatico.nivel_riesgo}
                                            </span>
                                        </div>

                                        <div className="space-y-1">
                                            <span className="text-[10px] text-slate-400 font-bold block uppercase">
                                                Recomendaciones Inmediatas KURAQ:
                                            </span>
                                            {bioclimatico.recomendaciones?.map((rec, i) => (
                                                <div key={i} className="text-[11px] text-slate-300 bg-slate-900/60 p-2 rounded border border-slate-850 flex items-start gap-1.5">
                                                    <Sparkles className="w-3.5 h-3.5 text-teal-400 shrink-0 mt-0.5" />
                                                    <span>{rec}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="pt-3 border-t border-slate-850">
                                <Link
                                    href="/edan"
                                    className="w-full py-2 px-3 rounded-lg text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-emerald-300 border border-emerald-800/40 transition flex items-center justify-center gap-1.5"
                                >
                                    <Building2 className="w-3.5 h-3.5" />
                                    <span>Ir a EDAN SINPAD para Registro de Afectados</span>
                                </Link>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Tabla de Brotes Activos Nacionales */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
                <div className="flex justify-between items-center border-b border-slate-850 pb-3">
                    <div className="flex items-center gap-2">
                        <Activity className="w-4 h-4 text-teal-400" />
                        <h2 className="text-sm font-bold text-white">
                            Brotes Activos Priorizados de Dengue (CDC RENACE)
                        </h2>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
                        {brotes.length} Distritos en Brote
                    </span>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                        <thead>
                            <tr className="border-b border-slate-800 text-slate-400 text-[11px]">
                                <th className="py-2.5 px-3">UBIGEO</th>
                                <th className="py-2.5 px-3">Distrito</th>
                                <th className="py-2.5 px-3">Departamento</th>
                                <th className="py-2.5 px-3 text-right">Total Casos</th>
                                <th className="py-2.5 px-3 text-right">Con Signos</th>
                                <th className="py-2.5 px-3 text-right">Grave</th>
                                <th className="py-2.5 px-3 text-center">Estado</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60">
                            {brotes.map((b, idx) => (
                                <tr
                                    key={idx}
                                    onClick={() => setUbigeoSeleccionado(b.ubigeo)}
                                    className="hover:bg-slate-800/40 transition cursor-pointer"
                                >
                                    <td className="py-2.5 px-3 font-mono text-teal-400 font-bold">
                                        {b.ubigeo}
                                    </td>
                                    <td className="py-2.5 px-3 font-medium text-slate-200">
                                        {b.distrito}
                                    </td>
                                    <td className="py-2.5 px-3 text-slate-400">
                                        {b.departamento}
                                    </td>
                                    <td className="py-2.5 px-3 text-right font-mono font-bold text-white">
                                        {b.total_casos}
                                    </td>
                                    <td className="py-2.5 px-3 text-right font-mono text-amber-400">
                                        {b.con_signos_alarma}
                                    </td>
                                    <td className="py-2.5 px-3 text-right font-mono text-rose-400 font-bold">
                                        {b.dengue_grave}
                                    </td>
                                    <td className="py-2.5 px-3 text-center">
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                            b.estado_brote === "BROTE_ACTIVO"
                                                ? "bg-red-950 text-red-300 border border-red-800 animate-pulse"
                                                : "bg-amber-950 text-amber-300 border border-amber-800"
                                        }`}>
                                            {b.estado_brote.replace(/_/g, " ")}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
