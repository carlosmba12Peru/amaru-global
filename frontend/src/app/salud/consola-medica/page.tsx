"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
    Activity,
    HeartPulse,
    ShieldAlert,
    ShieldCheck,
    Lock,
    Unlock,
    AlertTriangle,
    Stethoscope,
    PhoneCall,
    Search,
    RefreshCw,
    CheckCircle2,
    Clock,
    FileText,
    Baby,
    ChevronRight,
    MapPin,
    ArrowLeft,
    Eye,
    EyeOff,
    Send,
    Truck,
    ExternalLink,
    Filter
} from "lucide-react";

interface CasoClinico {
    cup: string;
    ubigeo: string;
    distrito: string;
    departamento: string;
    lugar_referencial: string;
    edad: number;
    sexo: string;
    es_gestante: boolean;
    semanas_gestacion?: number;
    agua_en_vivienda: string;
    sintomas: string[];
    relato: string;
    foto_preview_url?: string;
    fecha_registro: string;
    triaje_ia: {
        prioridad_sugerida: string;
        tiempo_atencion_referencial: string;
        signos_alarma_detectados: string[];
        factores_riesgo_territorial: string[];
        analisis_vision_computacional?: {
            archivo: string;
            hallazgos_visuales: string;
            sospecha_lesion: string;
        };
        declaracion_no_vinculante: string;
    };
    estado: string;
    sello_identidad_desbloqueado: boolean;
    desbloqueado_por_cmp?: string;
    prioridad_oficial_medico?: string;
    diagnostico_presuntivo_medico?: string;
    conducta_terapeutica?: string;
}

interface MetricasSalud {
    total_casos_registrados: number;
    prioridad_I_rojo: number;
    prioridad_II_amarillo: number;
    prioridad_III_verde: number;
    prioridad_IV_azul: number;
    identidades_desbloqueadas_por_cmp: number;
    gestantes_en_vigilancia: number;
    tasa_privacidad_preservada: number;
    marco_legal: string;
}

export default function ConsolaMedicaSaludPage() {
    const [casos, setCasos] = useState<CasoClinico[]>([]);
    const [metricas, setMetricas] = useState<MetricasSalud | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedCaso, setSelectedCaso] = useState<CasoClinico | null>(null);
    const [filtroPrioridad, setFiltroPrioridad] = useState<string>("TODOS");
    const [filtroUbigeo, setFiltroUbigeo] = useState<string>("TODOS");

    // Modal Break-the-Glass (Ruptura del Sello)
    const [showBreakGlassModal, setShowBreakGlassModal] = useState(false);
    const [cmpMedico, setCmpMedico] = useState("");
    const [nombreMedico, setNombreMedico] = useState("");
    const [motivoClinico, setMotivoClinico] = useState("");
    const [unsealedData, setUnsealedData] = useState<any | null>(null);
    const [submittingBreakGlass, setSubmittingBreakGlass] = useState(false);

    // Modal Dictamen Médico Soberano
    const [showDictamenModal, setShowDictamenModal] = useState(false);
    const [prioridadOficial, setPrioridadOficial] = useState("PRIORIDAD_I_ROJO");
    const [diagnostico, setDiagnostico] = useState("");
    const [conducta, setConducta] = useState("EVACUACION_AEROMEDICA_FAP");
    const [observaciones, setObservaciones] = useState("");
    const [submittingDictamen, setSubmittingDictamen] = useState(false);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [resCasos, resMetricas] = await Promise.all([
                fetch("http://localhost:8000/api/v1/salud/bandeja-minsa").then(r => r.json()).catch(() => []),
                fetch("http://localhost:8000/api/v1/salud/metricas").then(r => r.json()).catch(() => null)
            ]);
            setCasos(resCasos || []);
            setMetricas(resMetricas || null);
        } catch (e) {
            console.error("Error cargando bandeja médica:", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 15000);
        return () => clearInterval(interval);
    }, []);

    // Ejecutar Ruptura de Sello
    const handleBreakGlass = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedCaso) return;

        if (!cmpMedico.trim() || !nombreMedico.trim() || motivoClinico.trim().length < 10) {
            alert("Por favor ingrese su N.° de CMP, su nombre completo y una justificación asistencial válida (mínimo 10 caracteres).");
            return;
        }

        setSubmittingBreakGlass(true);
        try {
            const res = await fetch(`http://localhost:8000/api/v1/salud/caso/${selectedCaso.cup}/desbloquear-identidad`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    cmp_medico: cmpMedico.trim(),
                    nombre_medico: nombreMedico.trim(),
                    motivo_clinico: motivoClinico.trim()
                })
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || "No se pudo romper el sello de identidad.");
            }

            const data = await res.json();
            setUnsealedData(data.datos_identidad_desbloqueados);
            setShowBreakGlassModal(false);
            // Actualizar caso localmente y refrescar
            selectedCaso.sello_identidad_desbloqueado = true;
            selectedCaso.desbloqueado_por_cmp = cmpMedico.trim();
            fetchData();
        } catch (err: any) {
            alert(err.message || "Error al romper el sello de identidad.");
        } finally {
            setSubmittingBreakGlass(false);
        }
    };

    // Emitir Dictamen Médico Soberano
    const handleDictamen = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedCaso) return;

        if (!cmpMedico.trim() || !diagnostico.trim()) {
            alert("Ingrese su CMP y el diagnóstico presuntivo oficial.");
            return;
        }

        setSubmittingDictamen(true);
        try {
            const res = await fetch(`http://localhost:8000/api/v1/salud/caso/${selectedCaso.cup}/resolucion-medica`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    cmp_medico: cmpMedico.trim(),
                    prioridad_oficial: prioridadOficial,
                    diagnostico_presuntivo: diagnostico.trim(),
                    conducta_terapeutica: conducta,
                    observaciones: observaciones.trim()
                })
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || "Error registrando dictamen.");
            }

            alert("Dictamen médico registrado con éxito en la bitácora COED-Salud.");
            setShowDictamenModal(false);
            setSelectedCaso(null);
            fetchData();
        } catch (err: any) {
            alert(err.message || "Error al emitir dictamen.");
        } finally {
            setSubmittingDictamen(false);
        }
    };

    // Filtros
    const casosFiltrados = casos.filter(c => {
        if (filtroPrioridad !== "TODOS" && c.triaje_ia?.prioridad_sugerida !== filtroPrioridad) return false;
        if (filtroUbigeo !== "TODOS" && c.ubigeo !== filtroUbigeo) return false;
        return true;
    });

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-16 flex flex-col">
            {/* CINTILLO INSTITUCIONAL C2 SALUD */}
            <div className="bg-slate-900 border-b border-slate-800 px-4 py-3 shadow-lg">
                <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-3">
                    <div className="flex items-center gap-2.5">
                        <Link href="/" className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition">
                            <ArrowLeft className="w-4 h-4" />
                        </Link>
                        <div className="p-2 rounded-xl bg-red-500/20 text-red-400 border border-red-500/30">
                            <Stethoscope className="w-5 h-5" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-sm font-bold text-white tracking-wide">
                                    COED SALUD • Consola Médica de Triaje &amp; Teleorientación FEN
                                </h1>
                                <span className="px-2 py-0.5 text-[9px] font-bold rounded-full bg-red-950 text-red-300 border border-red-800 uppercase font-mono">
                                    Nivel Médico CMP
                                </span>
                            </div>
                            <p className="text-[11px] text-slate-400">
                                Asistencia en Crisis Bajo la Ley General de Salud N.° 26842 &amp; NTS N.° 105-MINSA
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={fetchData}
                            className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition cursor-pointer"
                        >
                            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
                            <span>Refrescar</span>
                        </button>
                        <Link
                            href="/salud/triaje"
                            className="px-2.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition shadow-md shadow-rose-600/30 flex items-center gap-1"
                        >
                            <span>+ Formulario Ciudadano</span>
                            <ExternalLink className="w-3 h-3" />
                        </Link>
                    </div>
                </div>

                {/* MÉTRICAS EJECUTIVAS C2 */}
                {metricas && (
                    <div className="max-w-7xl mx-auto mt-3 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-xs">
                        <div className="bg-slate-950/80 border border-red-900/60 rounded-xl p-2.5 flex flex-col">
                            <span className="text-[10px] text-red-400 font-bold uppercase tracking-wider flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                                🔴 Prioridad I (Rojo)
                            </span>
                            <span className="text-xl font-black text-red-400 mt-1">{metricas.prioridad_I_rojo}</span>
                            <span className="text-[9px] text-red-400/80">Emergencia Vital / Rescate</span>
                        </div>

                        <div className="bg-slate-950/80 border border-amber-900/60 rounded-xl p-2.5 flex flex-col">
                            <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">
                                🟡 Prioridad II (Amarillo)
                            </span>
                            <span className="text-xl font-black text-amber-400 mt-1">{metricas.prioridad_II_amarillo}</span>
                            <span className="text-[9px] text-amber-400/80">Urgencia Mayor / Dengue</span>
                        </div>

                        <div className="bg-slate-950/80 border border-emerald-900/60 rounded-xl p-2.5 flex flex-col">
                            <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">
                                🟢 Prioridad III (Verde)
                            </span>
                            <span className="text-xl font-black text-emerald-400 mt-1">{metricas.prioridad_III_verde}</span>
                            <span className="text-[9px] text-emerald-400/80">Urgencia Menor</span>
                        </div>

                        <div className="bg-slate-950/80 border border-purple-900/60 rounded-xl p-2.5 flex flex-col">
                            <span className="text-[10px] text-purple-400 font-bold uppercase tracking-wider flex items-center gap-1">
                                <Baby className="w-3 h-3 text-purple-400" />
                                Gestantes en FEN
                            </span>
                            <span className="text-xl font-black text-purple-300 mt-1">{metricas.gestantes_en_vigilancia}</span>
                            <span className="text-[9px] text-purple-400/80">Riesgo Obstétrico Aislado</span>
                        </div>

                        <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-2.5 flex flex-col">
                            <span className="text-[10px] text-sky-400 font-bold uppercase tracking-wider">
                                Sellos Desbloqueados
                            </span>
                            <span className="text-xl font-black text-sky-300 mt-1">{metricas.identidades_desbloqueadas_por_cmp}</span>
                            <span className="text-[9px] text-slate-500">Con N.° CMP registrado</span>
                        </div>

                        <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-2.5 flex flex-col">
                            <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">
                                Privacidad Preservada
                            </span>
                            <span className="text-xl font-black text-emerald-400 mt-1">{metricas.tasa_privacidad_preservada}%</span>
                            <span className="text-[9px] text-emerald-500/80">CUP Cripto Desacoplado</span>
                        </div>
                    </div>
                )}
            </div>

            {/* CUERPO PRINCIPAL */}
            <div className="max-w-7xl mx-auto w-full p-4 flex-1 space-y-4">
                {/* BARRA DE FILTROS Y ESTADO DE PROTECCIÓN */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 flex flex-wrap justify-between items-center gap-3 text-xs shadow-lg">
                    <div className="flex items-center gap-2">
                        <Filter className="w-4 h-4 text-slate-400" />
                        <span className="font-semibold text-slate-300">Filtrar por Prioridad:</span>
                        <div className="flex gap-1.5 flex-wrap">
                            {[
                                { id: "TODOS", label: "Todos" },
                                { id: "PRIORIDAD_I_ROJO", label: "🔴 Prioridad I (Rojo)" },
                                { id: "PRIORIDAD_II_AMARILLO", label: "🟡 Prioridad II (Amarillo)" },
                                { id: "PRIORIDAD_III_VERDE", label: "🟢 Prioridad III (Verde)" }
                            ].map(btn => (
                                <button
                                    key={btn.id}
                                    onClick={() => setFiltroPrioridad(btn.id)}
                                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition cursor-pointer ${
                                        filtroPrioridad === btn.id
                                            ? "bg-slate-800 text-white border border-slate-700 shadow-sm"
                                            : "text-slate-400 hover:text-slate-200"
                                    }`}
                                >
                                    {btn.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="text-slate-400 text-[11px]">Cuenca:</span>
                        <select
                            value={filtroUbigeo}
                            onChange={(e) => setFiltroUbigeo(e.target.value)}
                            className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none"
                        >
                            <option value="TODOS">Todas las cuencas</option>
                            <option value="200105">Catacaos (Piura)</option>
                            <option value="140301">Íllimo (Lambayeque)</option>
                            <option value="150118">Lurigancho Chosica (Lima)</option>
                            <option value="130101">Trujillo (La Libertad)</option>
                        </select>
                    </div>
                </div>

                {/* BANDEJA DE EXPEDIENTES CLÍNICOS DESACOPLADOS */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {casosFiltrados.map((c) => {
                        const prio = c.triaje_ia?.prioridad_sugerida;
                        const esRojo = prio === "PRIORIDAD_I_ROJO";
                        const esAmarillo = prio === "PRIORIDAD_II_AMARILLO";

                        return (
                            <div
                                key={c.cup}
                                className={`rounded-2xl border p-4 shadow-xl flex flex-col justify-between space-y-3 transition ${
                                    esRojo
                                        ? "bg-gradient-to-b from-red-950/40 via-slate-900 to-slate-900 border-red-700/60 shadow-red-950/20"
                                        : esAmarillo
                                            ? "bg-gradient-to-b from-amber-950/30 via-slate-900 to-slate-900 border-amber-700/50 shadow-amber-950/20"
                                            : "bg-slate-900 border-slate-800"
                                }`}
                            >
                                {/* Cabecera de la Tarjeta */}
                                <div className="space-y-2">
                                    <div className="flex justify-between items-start gap-2">
                                        <div>
                                            <span className="text-[10px] text-slate-500 font-mono">CÓDIGO CUP</span>
                                            <div className="font-mono font-bold text-sm text-amber-400 tracking-wide">{c.cup}</div>
                                        </div>
                                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border uppercase tracking-wider ${
                                            esRojo
                                                ? "bg-red-500/20 text-red-300 border-red-500/50 animate-pulse"
                                                : esAmarillo
                                                    ? "bg-amber-500/20 text-amber-300 border-amber-500/50"
                                                    : "bg-emerald-500/20 text-emerald-300 border-emerald-500/50"
                                        }`}>
                                            {prio.replace(/_/g, " ")}
                                        </span>
                                    </div>

                                    {/* Datos Clínicos Generales */}
                                    <div className="text-xs text-slate-300 space-y-1">
                                        <div className="flex justify-between text-[11px]">
                                            <span className="text-slate-400">Edad / Sexo:</span>
                                            <span className="font-semibold text-white">{c.edad} años • {c.sexo}</span>
                                        </div>
                                        <div className="flex justify-between text-[11px]">
                                            <span className="text-slate-400">Cuenca / Distrito:</span>
                                            <span className="font-semibold text-sky-400">{c.distrito} ({c.departamento})</span>
                                        </div>
                                        <div className="flex justify-between text-[11px]">
                                            <span className="text-slate-400">Nivel de Agua:</span>
                                            <span className="font-mono text-amber-300">{c.agua_en_vivienda.replace(/_/g, " ")}</span>
                                        </div>
                                        {c.es_gestante && (
                                            <div className="p-1.5 rounded-lg bg-purple-950/60 border border-purple-800 text-[10px] text-purple-300 font-bold flex items-center gap-1.5">
                                                <Baby className="w-3.5 h-3.5" />
                                                <span>GESTANTE EN VIGILANCIA ({c.semanas_gestacion || "?"} semanas)</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Relato Breve */}
                                    <div className="bg-slate-950/80 rounded-xl p-2.5 border border-slate-800 text-xs text-slate-300 italic line-clamp-3">
                                        "{c.relato}"
                                    </div>

                                    {/* Signos de Alarma IA */}
                                    {c.triaje_ia?.signos_alarma_detectados?.length > 0 && (
                                        <div className="text-[10px] space-y-1">
                                            <span className="text-rose-400 font-bold uppercase tracking-wider">Signos Alarma Detectados:</span>
                                            {c.triaje_ia.signos_alarma_detectados.map((sig, i) => (
                                                <div key={i} className="text-red-300/90 font-medium flex items-start gap-1">
                                                    <span>•</span>
                                                    <span>{sig}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Pie de Tarjeta: Estado del Sello y Botón de Apertura */}
                                <div className="pt-2 border-t border-slate-800/80 flex justify-between items-center">
                                    <div className="flex items-center gap-1 text-[10px]">
                                        {c.sello_identidad_desbloqueado ? (
                                            <span className="text-emerald-400 font-semibold flex items-center gap-1">
                                                <Unlock className="w-3 h-3" /> Identidad Desbloqueada (CMP {c.desbloqueado_por_cmp})
                                            </span>
                                        ) : (
                                            <span className="text-slate-500 flex items-center gap-1">
                                                <Lock className="w-3 h-3" /> Identidad Cifrada
                                            </span>
                                        )}
                                    </div>

                                    <button
                                        onClick={() => {
                                            setSelectedCaso(c);
                                            setUnsealedData(null);
                                        }}
                                        className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs transition flex items-center gap-1 shadow-md shadow-sky-600/30 cursor-pointer"
                                    >
                                        <span>Examinar Caso</span>
                                        <ChevronRight className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* MODAL DETALLE DE CASO CLÍNICO */}
            {selectedCaso && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
                    <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-3xl w-full p-6 shadow-2xl space-y-5 my-8">
                        {/* Cabecera Modal */}
                        <div className="flex justify-between items-start border-b border-slate-800 pb-3">
                            <div>
                                <span className="text-[10px] text-slate-400 uppercase tracking-widest font-mono">Expediente Clínico de Emergencia FEN</span>
                                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                    <span className="text-amber-400 font-mono">{selectedCaso.cup}</span>
                                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                                        {selectedCaso.distrito} ({selectedCaso.departamento})
                                    </span>
                                </h2>
                            </div>
                            <button
                                onClick={() => setSelectedCaso(null)}
                                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 text-sm font-bold"
                            >
                                ✕ Cerrar
                            </button>
                        </div>

                        {/* CUERPO DEL CASO */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                            {/* Columna Izquierda: Datos Clínicos y Relato */}
                            <div className="space-y-3 bg-slate-950 p-4 rounded-xl border border-slate-800">
                                <h3 className="font-bold text-slate-200 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                                    <FileText className="w-4 h-4 text-sky-400" />
                                    Relato y Entorno del Paciente
                                </h3>

                                <div className="space-y-1.5 text-slate-300">
                                    <div><span className="text-slate-500">Ubicación declarada:</span> {selectedCaso.lugar_referencial}</div>
                                    <div><span className="text-slate-500">Edad / Sexo:</span> {selectedCaso.edad} años • {selectedCaso.sexo}</div>
                                    <div><span className="text-slate-500">Nivel de agua en casa:</span> <b className="text-amber-300">{selectedCaso.agua_en_vivienda}</b></div>
                                    {selectedCaso.es_gestante && (
                                        <div className="text-purple-300 font-bold">
                                            🤰 GESTANTE DE {selectedCaso.semanas_gestacion} SEMANAS EN AISLAMIENTO
                                        </div>
                                    )}
                                </div>

                                <div className="pt-2 border-t border-slate-800">
                                    <span className="text-slate-500 font-semibold">Testimonio textual del poblador:</span>
                                    <p className="mt-1 p-2 bg-slate-900 rounded-lg text-slate-200 leading-relaxed italic border border-slate-800">
                                        "{selectedCaso.relato}"
                                    </p>
                                </div>

                                {selectedCaso.sintomas?.length > 0 && (
                                    <div className="pt-1">
                                        <span className="text-slate-500 font-semibold">Síntomas marcados:</span>
                                        <div className="flex flex-wrap gap-1 mt-1">
                                            {selectedCaso.sintomas.map((s, i) => (
                                                <span key={i} className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] font-mono">
                                                    {s}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Columna Derecha: Observación IA (NTS-105 MINSA) */}
                            <div className="space-y-3 bg-slate-950 p-4 rounded-xl border border-slate-800">
                                <h3 className="font-bold text-slate-200 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                                    <Activity className="w-4 h-4 text-rose-400" />
                                    Informe Observacional IA SALUD-AMARU
                                </h3>

                                <div className="p-2.5 rounded-lg bg-red-950/40 border border-red-800/60 space-y-1">
                                    <div className="text-[10px] text-red-300 font-semibold uppercase">Triaje Sugerido (No Vinculante):</div>
                                    <div className="text-base font-extrabold text-red-400">
                                        {selectedCaso.triaje_ia?.prioridad_sugerida.replace(/_/g, " ")}
                                    </div>
                                    <div className="text-[10px] text-slate-400">
                                        {selectedCaso.triaje_ia?.tiempo_atencion_referencial}
                                    </div>
                                </div>

                                {/* Signos de Alarma */}
                                <div className="space-y-1">
                                    <span className="text-slate-400 font-bold uppercase text-[10px]">Signos de Alarma Clínicos:</span>
                                    {selectedCaso.triaje_ia?.signos_alarma_detectados?.map((sig, i) => (
                                        <div key={i} className="text-red-300 text-[11px] flex items-start gap-1">
                                            <span>⚠️</span>
                                            <span>{sig}</span>
                                        </div>
                                    ))}
                                </div>

                                {/* Alertas Epidemiológicas */}
                                {selectedCaso.triaje_ia?.factores_riesgo_territorial?.map((fac, i) => (
                                    <div key={i} className="text-[10px] text-amber-300 bg-amber-950/40 p-2 rounded-lg border border-amber-900/60">
                                        {fac}
                                    </div>
                                ))}

                                {/* Descargo Legal */}
                                <div className="text-[9px] text-slate-500 leading-tight pt-1 border-t border-slate-800">
                                    {selectedCaso.triaje_ia?.declaracion_no_vinculante}
                                </div>
                            </div>
                        </div>

                        {/* SECCIÓN IDENTIDAD: RUPTURA DE SELLO O DATOS YA VISIBLES */}
                        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                            <div className="flex justify-between items-center">
                                <h3 className="text-xs font-bold text-white flex items-center gap-1.5 uppercase">
                                    <Lock className="w-4 h-4 text-emerald-400" />
                                    Bóveda de Identidad (Ley N.° 29733 Art. 14 inc. 4)
                                </h3>

                                {!selectedCaso.sello_identidad_desbloqueado && !unsealedData && (
                                    <button
                                        onClick={() => setShowBreakGlassModal(true)}
                                        className="px-3.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-xs transition flex items-center gap-1.5 shadow-md shadow-red-600/30 cursor-pointer"
                                    >
                                        <Unlock className="w-3.5 h-3.5" />
                                        <span>Romper el Sello (Acceso con CMP)</span>
                                    </button>
                                )}
                            </div>

                            {unsealedData ? (
                                <div className="bg-emerald-950/40 border border-emerald-500/40 rounded-xl p-3 text-xs space-y-2">
                                    <div className="text-emerald-300 font-bold flex items-center gap-1">
                                        <CheckCircle2 className="w-4 h-4" />
                                        IDENTIDAD DESBLOQUEADA POR MÉDICO COLEGIADO:
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-white">
                                        <div><span className="text-slate-400">DNI:</span> <b className="font-mono">{unsealedData.dni}</b></div>
                                        <div><span className="text-slate-400">Nombre:</span> <b>{unsealedData.nombre_completo}</b></div>
                                        <div><span className="text-slate-400">Teléfono:</span> <b className="text-emerald-400 font-mono">{unsealedData.telefono}</b></div>
                                    </div>
                                    <div className="flex gap-2 pt-2">
                                        <a
                                            href={`tel:${unsealedData.telefono}`}
                                            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-1"
                                        >
                                            <PhoneCall className="w-3.5 h-3.5" />
                                            <span>Llamar al Paciente</span>
                                        </a>
                                        <a
                                            href={`https://api.whatsapp.com/send?phone=51${unsealedData.telefono}&text=${encodeURIComponent(`Hola, le saluda el médico de guardia del COED-Salud respecto a su reporte CUP ${selectedCaso.cup}.`)}`}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="px-3 py-1.5 rounded-lg bg-green-600 hover:bg-green-500 text-white text-xs font-bold transition flex items-center gap-1"
                                        >
                                            <span>Abrir WhatsApp</span>
                                        </a>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-[11px] text-slate-400 italic">
                                    Los datos personales (DNI, nombres y teléfono) permanecen cifrados. Pulse "Romper el Sello" para acceder con su CMP y coordinar la evacuación o llamada médica.
                                </div>
                            )}
                        </div>

                        {/* ACCIONES FINALES: DICTAMEN MÉDICO */}
                        <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                            <button
                                onClick={() => setShowDictamenModal(true)}
                                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-xs transition flex items-center gap-2 shadow-lg shadow-red-600/30 cursor-pointer"
                            >
                                <Stethoscope className="w-4 h-4" />
                                <span>Emitir Dictamen Médico Soberano (Conducta Clínica)</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL BREAK-THE-GLASS */}
            {showBreakGlassModal && (
                <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-60 flex items-center justify-center p-4">
                    <form onSubmit={handleBreakGlass} className="bg-slate-900 border border-red-600/70 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
                        <div className="flex items-center gap-2.5 text-red-400 pb-2 border-b border-slate-800">
                            <ShieldAlert className="w-6 h-6 animate-pulse" />
                            <div>
                                <h3 className="font-bold text-sm text-white">Ruptura del Sello de Identidad</h3>
                                <p className="text-[10px] text-red-300">Protocolo Legal Ley N.° 29733 Art. 14 inc. 4</p>
                            </div>
                        </div>

                        <p className="text-xs text-slate-300 leading-relaxed">
                            Usted está accediendo a datos personales sensibles bajo responsabilidad profesional médica. Su número de CMP, nombre y justificación quedarán registrados de forma inalterable en la bitácora WORM de auditoría forense.
                        </p>

                        <div className="space-y-3 text-xs">
                            <div>
                                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                                    N.° de Colegiatura Médica (CMP) (*):
                                </label>
                                <input
                                    type="text"
                                    value={cmpMedico}
                                    onChange={(e) => setCmpMedico(e.target.value.replace(/\D/g, ""))}
                                    placeholder="Ej: 048291"
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500 font-mono"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                                    Nombre Completo del Médico Cirujano (*):
                                </label>
                                <input
                                    type="text"
                                    value={nombreMedico}
                                    onChange={(e) => setNombreMedico(e.target.value)}
                                    placeholder="Ej: Dr. Carlos Mendoza V."
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                                    Justificación Asistencial de Urgencia (*):
                                </label>
                                <textarea
                                    rows={2}
                                    value={motivoClinico}
                                    onChange={(e) => setMotivoClinico(e.target.value)}
                                    placeholder="Ej: Paciente Prioridad I con riesgo de choque séptico requiere coordinación directa de ambulancia fluvial."
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-red-500"
                                    required
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                            <button
                                type="button"
                                onClick={() => setShowBreakGlassModal(false)}
                                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={submittingBreakGlass}
                                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs transition flex items-center gap-1.5 shadow-md shadow-red-600/30"
                            >
                                {submittingBreakGlass ? "Registrando en WORM..." : "Desbloquear con mi CMP"}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* MODAL DICTAMEN MÉDICO SOBERANO */}
            {showDictamenModal && (
                <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-60 flex items-center justify-center p-4">
                    <form onSubmit={handleDictamen} className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
                        <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
                            <Stethoscope className="w-5 h-5 text-rose-400" />
                            <div>
                                <h3 className="font-bold text-sm text-white">Dictamen Clínico &amp; Conducta Terapéutica</h3>
                                <p className="text-[10px] text-slate-400">Soberanía Médica bajo Ley N.° 26842</p>
                            </div>
                        </div>

                        <div className="space-y-3 text-xs">
                            <div>
                                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                                    N.° CMP del Médico Tratante:
                                </label>
                                <input
                                    type="text"
                                    value={cmpMedico}
                                    onChange={(e) => setCmpMedico(e.target.value)}
                                    placeholder="Su número de colegiatura"
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none font-mono"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                                    Prioridad Oficial Ratificada por el Médico:
                                </label>
                                <select
                                    value={prioridadOficial}
                                    onChange={(e) => setPrioridadOficial(e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                                >
                                    <option value="PRIORIDAD_I_ROJO">🔴 Prioridad I (Rojo) - Emergencia Vital Inmediata</option>
                                    <option value="PRIORIDAD_II_AMARILLO">🟡 Prioridad II (Amarillo) - Urgencia Mayor</option>
                                    <option value="PRIORIDAD_III_VERDE">🟢 Prioridad III (Verde) - Urgencia Menor</option>
                                    <option value="PRIORIDAD_IV_AZUL">⚪ Prioridad IV (Azul) - No Urgente</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                                    Diagnóstico Presuntivo Oficial:
                                </label>
                                <textarea
                                    rows={2}
                                    value={diagnostico}
                                    onChange={(e) => setDiagnostico(e.target.value)}
                                    placeholder="Ej: Sospecha de Dengue con signos de alarma / Deshidratación moderada / Amenaza de parto prematuro"
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                                    Conducta / Disposición Táctica:
                                </label>
                                <select
                                    value={conducta}
                                    onChange={(e) => setConducta(e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none font-semibold"
                                >
                                    <option value="EVACUACION_AEROMEDICA_FAP">🚁 Evacuación Aeromédica Inmediata (FAP / INDECI)</option>
                                    <option value="BRIGADA_FLUVIAL_ZODIAC">🚤 Despacho de Bote Zodiac / Brigada Fluvial Marina</option>
                                    <option value="TELECONSULTA_TELEFONICA">📞 Teleorientación Telefónica con Monitoreo</option>
                                    <option value="BRIGADA_TERRESTRE_SALUD">🚑 Programar Visita de Brigada Móvil de Salud</option>
                                    <option value="REHIDRATACION_ALBERGUE">💧 Manejo con Sales de Rehidratación Oral en Albergue</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                                    Observaciones Tácticas:
                                </label>
                                <input
                                    type="text"
                                    value={observaciones}
                                    onChange={(e) => setObservaciones(e.target.value)}
                                    placeholder="Ej: Coordinar con Base Aérea Pisco / Piura para helievacuación con cuna"
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                            <button
                                type="button"
                                onClick={() => setShowDictamenModal(false)}
                                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={submittingDictamen}
                                className="px-4 py-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 text-white font-bold text-xs transition shadow-md shadow-red-600/30"
                            >
                                {submittingDictamen ? "Guardando Dictamen..." : "Confirmar Dictamen Soberano"}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}
