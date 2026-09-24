"use client";

import React, { useState, useEffect } from "react";
import {
    ShieldAlert,
    AlertTriangle,
    Mountain,
    Video,
    CheckCircle2,
    Clock,
    Activity,
    Search,
    RefreshCw,
    Wrench,
    FileText,
    Send,
    ExternalLink,
    HelpCircle,
    MapPin,
    Sliders,
    ChevronRight,
    Flame
} from "lucide-react";

interface NodoHistorico {
    id: string;
    nombre: string;
    tipo: string;
    departamento: string;
    provincia: string;
    distrito: string;
    ubigeo: string;
    coordenadas: { lat: number; lon: number };
    cuenca: string;
    eventos_historicos: string[];
    umbral_critico_lluvia_mm: number;
    umbral_critico_caudal_m3s: number;
    tiempo_retardo_tlag_min: number;
    infraestructura_vulnerable: string;
    leccion_historica: string;
    evidencia_audiovisual: string;
    accion_ingenieria_preventiva: string;
    estado_defensa: string;
}

interface EvaluacionAmenaza {
    nodo_id: string;
    nombre: string;
    nivel_alerta: string;
    color_semaforo: string;
    porcentaje_umbral_alcanzado: number;
    tiempo_retardo_tlag_min: number;
    accion_recomendada: string;
    aviso_cuenca_seca?: string;
}

interface VeredictoFakeNews {
    timestamp: string;
    fuente_reportada: string;
    texto_analizado: string;
    entidad_geografica?: string;
    veredicto_auditoria: string;
    color_dictamen: string;
    confianza_tecnica_pct: number;
    caudal_telemetrico_m3s: number;
    umbral_desborde_m3s: number;
    ratio_estres_hidraulico_pct: number;
    dictamen_oficial_coen: string;
    sello_criptografico_sha256: string;
}

export default function HistoricalFailureNodesPanel({ ubigeoSeleccionado }: { ubigeoSeleccionado?: string }) {
    const [subTab, setSubTab] = useState<"nodos" | "fakenews" | "ingenieria">("nodos");
    const [nodos, setNodos] = useState<NodoHistorico[]>([]);
    const [nodoActivoId, setNodoActivoId] = useState<string>("falla-punta-hermosa-malanche");
    const [filtroDepto, setFiltroDepto] = useState<string>("todos");
    const [loadingNodos, setLoadingNodos] = useState<boolean>(true);

    // Estado del Simulador Interactivo
    const [simLluvia, setSimLluvia] = useState<number>(30.0);
    const [simColmatacion, setSimColmatacion] = useState<number>(20.0);
    const [evaluacion, setEvaluacion] = useState<EvaluacionAmenaza | null>(null);

    // Estado del Verificador Anti-Fake News
    const [textoAlerta, setTextoAlerta] = useState<string>("¡Urgente, se acaba de romper el dique en Catacaos y el agua está a metro y medio!");
    const [caudalSimuladoAna, setCaudalSimuladoAna] = useState<number>(320.0);
    const [veredicto, setVeredicto] = useState<VeredictoFakeNews | null>(null);
    const [auditando, setAuditando] = useState<boolean>(false);

    // Estado de la Ficha de Ingeniería Pre-Impacto
    const [fichaUbigeo, setFichaUbigeo] = useState<string>(ubigeoSeleccionado || "200105");
    const [fichaData, setFichaData] = useState<any>(null);
    const [loadingFicha, setLoadingFicha] = useState<boolean>(false);

    // Cargar Nodos al Montar
    useEffect(() => {
        async function fetchNodos() {
            try {
                setLoadingNodos(true);
                const res = await fetch("http://localhost:8000/api/v1/historico/nodos-criticos");
                if (res.ok) {
                    const data = await res.json();
                    setNodos(data.nodos || []);
                }
            } catch (err) {
                console.error("Error cargando nodos históricos:", err);
            } finally {
                setLoadingNodos(false);
            }
        }
        fetchNodos();
    }, []);

    // Evaluar Amenaza al cambiar nodo o slider
    useEffect(() => {
        if (!nodoActivoId) return;
        async function runEvaluacion() {
            try {
                const res = await fetch(
                    `http://localhost:8000/api/v1/historico/nodos-criticos/${nodoActivoId}/evaluar?lluvia_mm=${simLluvia}&colmatacion_malla_pct=${simColmatacion}`
                );
                if (res.ok) {
                    const data = await res.json();
                    setEvaluacion(data);
                }
            } catch (err) {
                console.error("Error evaluando amenaza:", err);
            }
        }
        runEvaluacion();
    }, [nodoActivoId, simLluvia, simColmatacion]);

    // Cargar Ficha de Ingeniería
    useEffect(() => {
        async function fetchFicha() {
            try {
                setLoadingFicha(true);
                const res = await fetch(`http://localhost:8000/api/v1/governance/ficha-ingenieria/${fichaUbigeo}`);
                if (res.ok) {
                    const data = await res.json();
                    setFichaData(data);
                }
            } catch (err) {
                console.error("Error cargando ficha de ingeniería:", err);
            } finally {
                setLoadingFicha(false);
            }
        }
        fetchFicha();
    }, [fichaUbigeo]);

    // Ejecutar Auditoría Anti-Fake News
    const handleAuditar = async () => {
        setAuditando(true);
        try {
            const res = await fetch("http://localhost:8000/api/v1/verificacion/auditar-alerta", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    texto: textoAlerta,
                    fuente: "Redes Sociales / Monitoreo Ciudadano",
                    simulacion_caudal_ana: caudalSimuladoAna
                })
            });
            if (res.ok) {
                const data = await res.json();
                setVeredicto(data);
            }
        } catch (err) {
            console.error("Error auditando alerta:", err);
        } finally {
            setAuditando(false);
        }
    };

    const nodosFiltrados = filtroDepto === "todos"
        ? nodos
        : nodos.filter(n => n.departamento.toLowerCase() === filtroDepto.toLowerCase());

    const nodoActivo = nodos.find(n => n.id === nodoActivoId) || nodos[0];

    return (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-5 shadow-2xl">
            {/* Header del Componente */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
                <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
                        <Mountain className="w-5 h-5" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                                Memoria Forense FEN &amp; Escudo de Verificación 2026-2027
                            </h3>
                            <span className="text-[10px] font-mono bg-red-950 text-red-300 border border-red-800 px-2 py-0.5 rounded font-bold">
                                18 Puntos de Falla • 1983-2023
                            </span>
                        </div>
                        <p className="text-xs text-slate-400">
                            Georreferenciación de colapsos estructurales históricos, mallas geodinámicas y verificación anti-fake news con aforo ANA.
                        </p>
                    </div>
                </div>

                {/* Sub-Tabs de Navegación */}
                <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
                    <button
                        onClick={() => setSubTab("nodos")}
                        className={`px-3 py-1.5 rounded-lg font-semibold transition flex items-center gap-1.5 ${
                            subTab === "nodos"
                                ? "bg-amber-600 text-white shadow-md shadow-amber-600/30"
                                : "text-slate-400 hover:text-white"
                        }`}
                    >
                        <Mountain className="w-3.5 h-3.5" />
                        <span>18 Nodos Históricos</span>
                    </button>
                    <button
                        onClick={() => setSubTab("fakenews")}
                        className={`px-3 py-1.5 rounded-lg font-semibold transition flex items-center gap-1.5 ${
                            subTab === "fakenews"
                                ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                                : "text-slate-400 hover:text-white"
                        }`}
                    >
                        <ShieldAlert className="w-3.5 h-3.5" />
                        <span>Escudo Anti-Fake News</span>
                    </button>
                    <button
                        onClick={() => setSubTab("ingenieria")}
                        className={`px-3 py-1.5 rounded-lg font-semibold transition flex items-center gap-1.5 ${
                            subTab === "ingenieria"
                                ? "bg-purple-600 text-white shadow-md shadow-purple-600/30"
                                : "text-slate-400 hover:text-white"
                        }`}
                    >
                        <Wrench className="w-3.5 h-3.5" />
                        <span>Fichas Pre-Impacto CENEPRED</span>
                    </button>
                </div>
            </div>

            {/* TAB 1: 18 NODOS DE FALLA HISTÓRICA */}
            {subTab === "nodos" && (
                <div className="space-y-4">
                    {/* Filtros por Departamento */}
                    <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
                        <span className="text-slate-400 font-medium">Filtrar por Región Afectada:</span>
                        <div className="flex items-center gap-1.5 flex-wrap">
                            {["todos", "Lima", "Piura", "Lambayeque", "La Libertad"].map((depto) => (
                                <button
                                    key={depto}
                                    onClick={() => setFiltroDepto(depto)}
                                    className={`px-2.5 py-1 rounded-lg border font-mono capitalize transition ${
                                        filtroDepto === depto
                                            ? "bg-amber-950 text-amber-300 border-amber-600 font-bold"
                                            : "bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-800"
                                    }`}
                                >
                                    {depto}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                        {/* Lista de Nodos Históricos (Columna Izquierda 5/12) */}
                        <div className="lg:col-span-5 space-y-2 max-h-[460px] overflow-y-auto pr-1">
                            {loadingNodos ? (
                                <div className="p-4 text-center text-slate-500 font-mono text-xs">
                                    Cargando catálogo de fallas históricas...
                                </div>
                            ) : (
                                nodosFiltrados.map((nodo) => {
                                    const isSelected = nodoActivoId === nodo.id;
                                    return (
                                        <div
                                            key={nodo.id}
                                            onClick={() => setNodoActivoId(nodo.id)}
                                            className={`p-3 rounded-xl border text-xs cursor-pointer transition flex flex-col gap-1.5 ${
                                                isSelected
                                                    ? "bg-slate-800/90 border-amber-500 text-white shadow-md ring-1 ring-amber-500/40"
                                                    : "bg-slate-950/80 hover:bg-slate-850 border-slate-800 text-slate-300"
                                            }`}
                                        >
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <span className="font-bold text-white block">{nodo.nombre}</span>
                                                    <span className="text-[10px] text-slate-400">
                                                        {nodo.distrito}, {nodo.departamento} • {nodo.cuenca}
                                                    </span>
                                                </div>
                                                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-amber-950/60 text-amber-300 border border-amber-800">
                                                    T-lag {nodo.tiempo_retardo_tlag_min}m
                                                </span>
                                            </div>

                                            <div className="flex items-center gap-1 flex-wrap pt-0.5 border-t border-slate-800/60 text-[9px] font-mono text-slate-400">
                                                <span>Eventos:</span>
                                                {nodo.eventos_historicos.map((ev, i) => (
                                                    <span key={i} className="px-1 rounded bg-slate-900 border border-slate-800 text-slate-300">
                                                        {ev}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>

                        {/* Detalle Táctico del Nodo Seleccionado (Columna Derecha 7/12) */}
                        <div className="lg:col-span-7 bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3.5">
                            {nodoActivo && (
                                <>
                                    <div className="flex justify-between items-start pb-2 border-b border-slate-800">
                                        <div>
                                            <h4 className="text-sm font-bold text-white flex items-center gap-2">
                                                <span>{nodoActivo.nombre}</span>
                                                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800">
                                                    {nodoActivo.tipo}
                                                </span>
                                            </h4>
                                            <p className="text-xs text-slate-400 mt-0.5">
                                                {nodoActivo.distrito} ({nodoActivo.provincia}, {nodoActivo.departamento}) • UBIGEO: {nodoActivo.ubigeo}
                                            </p>
                                        </div>
                                        <a
                                            href={nodoActivo.evidencia_audiovisual}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="px-2.5 py-1 rounded-lg bg-red-950/80 hover:bg-red-900 text-red-300 border border-red-700 text-xs font-bold flex items-center gap-1 transition shadow-sm"
                                        >
                                            <Video className="w-3.5 h-3.5 text-red-400" />
                                            <span>Ver Archivo Video</span>
                                            <ExternalLink className="w-3 h-3" />
                                        </a>
                                    </div>

                                    {/* Lección de Ingeniería Histórica */}
                                    <div className="bg-slate-900/80 border border-amber-900/40 p-3 rounded-xl space-y-1">
                                        <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider flex items-center gap-1">
                                            <Activity className="w-3.5 h-3.5" /> Lección de Ingeniería Aprendida (Ground Truth):
                                        </span>
                                        <p className="text-xs text-slate-200 leading-relaxed">
                                            {nodoActivo.leccion_historica}
                                        </p>
                                    </div>

                                    {/* Simulador Interactivo de Amenaza */}
                                    <div className="bg-slate-900/60 border border-slate-800 p-3 rounded-xl space-y-2.5">
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="font-bold text-slate-300 uppercase tracking-wide flex items-center gap-1.5">
                                                <Sliders className="w-3.5 h-3.5 text-sky-400" />
                                                Simulador de Amenaza 2026:
                                            </span>
                                            <span className="font-mono text-xs text-amber-400">
                                                Umbral Crítico: {nodoActivo.umbral_critico_lluvia_mm} mm
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                                            <div>
                                                <div className="flex justify-between text-slate-400 mb-1">
                                                    <span>Lluvia Prevista:</span>
                                                    <span className="font-mono text-white font-bold">{simLluvia} mm/24h</span>
                                                </div>
                                                <input
                                                    type="range"
                                                    min="0"
                                                    max="70"
                                                    step="2"
                                                    value={simLluvia}
                                                    onChange={(e) => setSimLluvia(parseFloat(e.target.value))}
                                                    className="w-full accent-amber-500 bg-slate-800 rounded-lg cursor-pointer"
                                                />
                                            </div>

                                            <div>
                                                <div className="flex justify-between text-slate-400 mb-1">
                                                    <span>Colmatación de Malla:</span>
                                                    <span className="font-mono text-white font-bold">{simColmatacion}%</span>
                                                </div>
                                                <input
                                                    type="range"
                                                    min="0"
                                                    max="100"
                                                    step="5"
                                                    value={simColmatacion}
                                                    onChange={(e) => setSimColmatacion(parseFloat(e.target.value))}
                                                    className="w-full accent-red-500 bg-slate-800 rounded-lg cursor-pointer"
                                                />
                                            </div>
                                        </div>

                                        {/* Resultado Dinámico de la Evaluación */}
                                        {evaluacion && (
                                            <div className="pt-2 border-t border-slate-800 space-y-2">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-xs text-slate-400">Tensión Hidráulica:</span>
                                                    <span className={`text-xs font-bold font-mono px-2 py-0.5 rounded ${
                                                        evaluacion.color_semaforo === "ROJO"
                                                            ? "bg-red-950 text-red-300 border border-red-800 animate-pulse"
                                                            : evaluacion.color_semaforo === "NARANJA"
                                                            ? "bg-orange-950 text-orange-300 border border-orange-800"
                                                            : "bg-emerald-950 text-emerald-300 border border-emerald-800"
                                                    }`}>
                                                        {evaluacion.porcentaje_umbral_alcanzado}% del umbral ({evaluacion.nivel_alerta})
                                                    </span>
                                                </div>

                                                <p className="text-xs font-semibold text-slate-200">
                                                    {evaluacion.accion_recomendada}
                                                </p>

                                                {evaluacion.aviso_cuenca_seca && (
                                                    <div className="p-2.5 rounded-lg bg-red-950/40 border border-red-800 text-red-200 text-xs font-bold animate-pulse">
                                                        {evaluacion.aviso_cuenca_seca}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {/* Acción de Ingeniería Preventiva */}
                                    <div className="text-xs text-slate-300 bg-slate-900/40 p-2.5 rounded-lg border border-slate-800 flex items-start gap-2">
                                        <Wrench className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                                        <div>
                                            <b className="text-white">Intervención de Ingeniería Requerida:</b>{" "}
                                            {nodoActivo.accion_ingenieria_preventiva}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* TAB 2: ESCUDO ANTI-FAKE NEWS & VERIFICACIÓN FORENSE */}
            {subTab === "fakenews" && (
                <div className="space-y-4">
                    <div className="bg-blue-950/30 border border-blue-800/60 rounded-xl p-3.5 flex items-center gap-3">
                        <ShieldAlert className="w-6 h-6 text-blue-400 shrink-0" />
                        <div>
                            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                                Motor de Verificación C2 contra la Desinformación y Pánico Social
                            </h4>
                            <p className="text-xs text-slate-300 mt-0.5">
                                Cruza cualquier reporte, foto viral o rumor de WhatsApp con la red oficial de telemetría de aforo de la ANA y la base histórica de colapsos para emitir un dictamen oficial inmutable.
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                        {/* Entrada de la Alerta (5/12) */}
                        <div className="lg:col-span-5 bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
                            <label className="text-xs font-bold text-slate-300 uppercase tracking-wide block">
                                Reporte o Mensaje Viral a Auditar:
                            </label>

                            <textarea
                                rows={3}
                                value={textoAlerta}
                                onChange={(e) => setTextoAlerta(e.target.value)}
                                placeholder="Pegar texto de WhatsApp, tweet o reporte vecinal..."
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                            />

                            {/* Casos Frecuentes Rápidos */}
                            <div className="space-y-1.5">
                                <span className="text-[10px] text-slate-500 font-mono block">Casos de Desinformación Frecuentes:</span>
                                {[
                                    "¡Urgente, se acaba de romper el dique en Catacaos y el agua está a metro y medio!",
                                    "¡Gran huaico bajó por la quebrada Malanche en Punta Hermosa arrasando casas!",
                                    "¡El río Piura superó los 2,200 m³/s y colapsó el Puente Sánchez Cerro!"
                                ].map((ejemplo, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setTextoAlerta(ejemplo)}
                                        className="w-full text-left text-[11px] p-1.5 rounded bg-slate-900 hover:bg-slate-850 text-slate-300 border border-slate-800 truncate block transition"
                                    >
                                        {ejemplo}
                                    </button>
                                ))}
                            </div>

                            {/* Ajuste de Caudal ANA para la simulación */}
                            <div className="pt-2 border-t border-slate-800 space-y-1">
                                <div className="flex justify-between text-xs text-slate-400">
                                    <span>Caudal Actual Estación ANA:</span>
                                    <span className="font-mono text-white font-bold">{caudalSimuladoAna} m³/s</span>
                                </div>
                                <input
                                    type="range"
                                    min="50"
                                    max="2500"
                                    step="50"
                                    value={caudalSimuladoAna}
                                    onChange={(e) => setCaudalSimuladoAna(parseFloat(e.target.value))}
                                    className="w-full accent-blue-500 bg-slate-800 rounded-lg cursor-pointer"
                                />
                                <span className="text-[9px] font-mono text-slate-500">
                                    Umbral de rotura histórico: 1,900 m³/s
                                </span>
                            </div>

                            <button
                                onClick={handleAuditar}
                                disabled={auditando}
                                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 transition shadow-lg shadow-blue-600/30"
                            >
                                <ShieldAlert className="w-4 h-4" />
                                <span>{auditando ? "Auditando con Telemetría..." : "AUDITAR CON TELEMETRÍA Y ARCHIVO"}</span>
                            </button>
                        </div>

                        {/* Dictamen Oficial Emitido (7/12) */}
                        <div className="lg:col-span-7 bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
                            <span className="text-xs font-bold text-slate-300 uppercase tracking-wide block pb-2 border-b border-slate-800">
                                Dictamen Oficial Anti-Pánico Emitido:
                            </span>

                            {veredicto ? (
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className={`text-xs font-bold font-mono px-2.5 py-1 rounded-lg ${
                                            veredicto.veredicto_auditoria.includes("DESMENTIDO")
                                                ? "bg-emerald-950 text-emerald-300 border border-emerald-700"
                                                : veredicto.veredicto_auditoria.includes("ALERTA_CONFIRMADA")
                                                ? "bg-red-950 text-red-300 border border-red-700 animate-pulse"
                                                : "bg-amber-950 text-amber-300 border border-amber-700"
                                        }`}>
                                            {veredicto.veredicto_auditoria}
                                        </span>
                                        <span className="text-[10px] font-mono text-slate-400">
                                            Confianza: {veredicto.confianza_tecnica_pct}%
                                        </span>
                                    </div>

                                    {/* Caja de Dictamen Oficial */}
                                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 leading-relaxed">
                                        {veredicto.dictamen_oficial_coen}
                                    </div>

                                    {/* Métricas Hidráulicas de Respaldo */}
                                    <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono">
                                        <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                                            <span className="text-[10px] text-slate-500 block">Caudal en Línea</span>
                                            <b className="text-white text-sm">{veredicto.caudal_telemetrico_m3s} m³/s</b>
                                        </div>
                                        <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                                            <span className="text-[10px] text-slate-500 block">Umbral Desborde</span>
                                            <b className="text-amber-400 text-sm">{veredicto.umbral_desborde_m3s} m³/s</b>
                                        </div>
                                        <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                                            <span className="text-[10px] text-slate-500 block">Estrés de Cauce</span>
                                            <b className={`text-sm ${
                                                veredicto.ratio_estres_hidraulico_pct > 80 ? "text-red-400" : "text-emerald-400"
                                            }`}>
                                                {veredicto.ratio_estres_hidraulico_pct}%
                                            </b>
                                        </div>
                                    </div>

                                    {/* Sello Digital SHA-256 */}
                                    <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800 text-[9px] font-mono text-slate-500 truncate">
                                        SHA-256 Sello Oficial: {veredicto.sello_criptografico_sha256}
                                    </div>
                                </div>
                            ) : (
                                <div className="py-12 text-center text-slate-500 text-xs font-mono">
                                    Presione "AUDITAR" para contrastar el mensaje con la telemetría oficial de la ANA.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* TAB 3: FICHAS DE INGENIERÍA PRE-IMPACTO (CENEPRED) */}
            {subTab === "ingenieria" && (
                <div className="space-y-4">
                    {/* Selector de Distrito */}
                    <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
                        <span className="text-slate-400 font-medium">Seleccionar Distrito con Falla Histórica Comprobada:</span>
                        <div className="flex items-center gap-1.5 flex-wrap">
                            {[
                                { ubigeo: "200105", nombre: "Catacaos" },
                                { ubigeo: "150118", nombre: "Chosica" },
                                { ubigeo: "150107", nombre: "Chaclacayo" },
                                { ubigeo: "150124", nombre: "Punta Hermosa" },
                                { ubigeo: "140304", nombre: "Íllimo" },
                                { ubigeo: "130101", nombre: "Trujillo" }
                            ].map((d) => (
                                <button
                                    key={d.ubigeo}
                                    onClick={() => setFichaUbigeo(d.ubigeo)}
                                    className={`px-3 py-1 rounded-lg border font-medium transition ${
                                        fichaUbigeo === d.ubigeo
                                            ? "bg-purple-950 text-purple-300 border-purple-600 font-bold shadow-sm"
                                            : "bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-800"
                                    }`}
                                >
                                    {d.nombre} ({d.ubigeo})
                                </button>
                            ))}
                        </div>
                    </div>

                    {loadingFicha ? (
                        <div className="p-8 text-center text-slate-500 font-mono text-xs">
                            Cubicando ficha técnica de ingeniería...
                        </div>
                    ) : fichaData ? (
                        <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-4 text-xs">
                            <div className="flex justify-between items-start pb-2 border-b border-slate-800">
                                <div>
                                    <h4 className="text-sm font-bold text-white">
                                        Ficha Táctica de Pre-Impacto FEN: {fichaData.distrito} ({fichaData.departamento})
                                    </h4>
                                    <p className="text-xs text-slate-400">
                                        Marco: {fichaData.marco_legal} • Ventana Dorada de Intervención: {fichaData.ventana_dorada_semanas} Semanas
                                    </p>
                                </div>
                                <span className="text-xs font-mono font-bold px-2 py-1 rounded bg-purple-950 text-purple-300 border border-purple-800">
                                    Presupuesto Ref: S/ {fichaData.presupuesto_estimado_pen.toLocaleString()}
                                </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Obras Físicas Requeridas */}
                                <div className="space-y-2">
                                    <span className="font-bold text-slate-300 uppercase tracking-wide flex items-center gap-1.5">
                                        <Wrench className="w-3.5 h-3.5 text-amber-400" />
                                        Obras de Ingeniería Prioritarias:
                                    </span>
                                    <ul className="space-y-1.5">
                                        {fichaData.obras_prioritarias_pre_impacto.map((obra: string, i: number) => (
                                            <li key={i} className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 flex items-start gap-2">
                                                <span className="text-amber-400 font-bold">✓</span>
                                                <span>{obra}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Maquinaria y Evacuación */}
                                <div className="space-y-3">
                                    <div>
                                        <span className="font-bold text-slate-300 uppercase tracking-wide block mb-1.5">
                                            Maquinaria &amp; Motobombas a Preposicionar:
                                        </span>
                                        <div className="grid grid-cols-2 gap-2 text-center font-mono">
                                            <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                                                <span className="text-[10px] text-slate-500 block">Cargadores Frontales</span>
                                                <b className="text-white">{fichaData.recursos_maquinaria_sugeridos.cargadores_frontales} unidades</b>
                                            </div>
                                            <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                                                <span className="text-[10px] text-slate-500 block">Volquetes 15m³</span>
                                                <b className="text-white">{fichaData.recursos_maquinaria_sugeridos.volquetes_15m3} unidades</b>
                                            </div>
                                            <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                                                <span className="text-[10px] text-slate-500 block">Motobombas 4''</span>
                                                <b className="text-amber-400">{fichaData.recursos_maquinaria_sugeridos.motobombas_4_pulgadas} unidades</b>
                                            </div>
                                            <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                                                <span className="text-[10px] text-slate-500 block">Motobombas 6''</span>
                                                <b className="text-amber-400">{fichaData.recursos_maquinaria_sugeridos.motobombas_6_pulgadas} unidades</b>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Rutas de Evacuación Vertical */}
                                    <div className="p-2.5 rounded-lg bg-blue-950/30 border border-blue-800/60">
                                        <b className="text-blue-300 block mb-0.5">Rutas de Evacuación Vertical:</b>
                                        <span className="text-slate-300">{fichaData.rutas_evacuacion_vertical}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : null}
                </div>
            )}
        </div>
    );
}
