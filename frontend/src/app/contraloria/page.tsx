"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
    Shield,
    CheckCircle2,
    AlertTriangle,
    FileCheck2,
    Download,
    Eye,
    RefreshCw,
    Building2,
    Calendar,
    Users,
    Search,
    Filter,
    ExternalLink,
    AlertOctagon,
    Coins,
    Award,
    FileSignature,
    Clock,
    Check,
    X,
    FileSpreadsheet,
    FileText
} from "lucide-react";

interface ExpedienteCGR {
    registro_cgr_id: string;
    edan_id: string;
    codigo_sinpad: string;
    ubigeo: string;
    distrito: string;
    provincia: string;
    departamento: string;
    alcalde: string;
    hash_sha256: string;
    fecha_disparo: string;
    estado_control: "PENDIENTE_VISTO_BUENO" | "EN_REVISION_OCI" | "CONFORME_CON_CONSTANCIA";
    resultado_auditoria: {
        puntaje_consistencia_pct: number;
        estado_evaluacion: string;
        semaforo: string;
        total_familias_auditadas: number;
        familias_elegibles_bono_bae: number;
        monto_estimado_bono_bae_mensual_soles: number;
        seguro_agricola_sac_activable: boolean;
        dias_restantes_estado_emergencia: number;
        alertas_detectadas: Array<{
            codigo: string;
            gravedad: string;
            mensaje: string;
        }>;
        resumen_dictamen: string;
    };
    visto_bueno_concurrente?: {
        constancia_codigo: string;
        auditor_responsable: string;
        organo_control: string;
        fecha_aprobacion: string;
        dictamen: string;
        blindaje_legal_alcalde: string;
        tramite_subsidio_bae_autorizado: boolean;
        tramite_seguro_agricola_sac_autorizado: boolean;
        observaciones: string;
    };
    autoriza_reparto_inmediato_bah: boolean;
}

export default function ContraloriaConcurrentePage() {
    const [expedientes, setExpedientes] = useState<ExpedienteCGR[]>([]);
    const [filtroDepto, setFiltroDepto] = useState<string>("");
    const [busqueda, setBusqueda] = useState<string>("");
    const [cargando, setCargando] = useState<boolean>(true);
    const [seleccionado, setSeleccionado] = useState<ExpedienteCGR | null>(null);

    // Pestaña activa y discrepancias físico-financieras MEF vs CGR
    const [tabPrincipal, setTabPrincipal] = useState<"edan" | "obras_cgr">("edan");
    const [cgrDiscrepancias, setCgrDiscrepancias] = useState<any[]>([]);

    // Formulario de emisión de visto bueno
    const [auditorNombre, setAuditorNombre] = useState<string>("Auditor Especialista OCI - C.P.C. Marco Mendoza Rios");
    const [observacionAuditor, setObservacionAuditor] = useState<string>("Revisión satelital de inundación conforme. Padrón nominal cruzado sin duplicidades.");
    const [emitiendoConstancia, setEmitiendoConstancia] = useState<boolean>(false);
    const [mensajeExito, setMensajeExito] = useState<string | null>(null);

    const cargarBandeja = async () => {
        setCargando(true);
        try {
            const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
            const url = filtroDepto
                ? `${apiBase}/api/v1/contraloria/bandeja-concurrente?departamento=${filtroDepto}`
                : `${apiBase}/api/v1/contraloria/bandeja-concurrente`;
            const [res, resCruce] = await Promise.all([
                fetch(url),
                fetch(`${apiBase}/api/v1/mef-obras/cgr-cruce`)
            ]);
            if (res.ok) {
                const data = await res.json();
                const items: ExpedienteCGR[] = data.fichas_recepcionadas || [];
                setExpedientes(items);
                if (items.length > 0 && !seleccionado) {
                    setSeleccionado(items[0]);
                } else if (seleccionado) {
                    const actualizado = items.find(i => i.edan_id === seleccionado.edan_id);
                    if (actualizado) setSeleccionado(actualizado);
                }
            }
            if (resCruce && resCruce.ok) {
                const cruceData = await resCruce.json();
                setCgrDiscrepancias(cruceData.discrepancias_criticas || []);
            }
        } catch (err) {
            console.error("Error al cargar bandeja CGR o cruce:", err);
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => {
        cargarBandeja();
    }, [filtroDepto]);

    // Emitir visto bueno concurrente
    const emitirVistoBueno = async () => {
        if (!seleccionado) return;
        setEmitiendoConstancia(true);
        setMensajeExito(null);
        try {
            const res = await fetch("http://127.0.0.1:8000/api/v1/contraloria/emitir-visto-bueno", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    edan_id: seleccionado.edan_id,
                    auditor_cgr: auditorNombre,
                    observaciones: observacionAuditor
                })
            });
            if (res.ok) {
                const data = await res.json();
                setMensajeExito(`¡Constancia ${data.constancia_cgr.constancia_codigo} emitida exitosamente!`);
                await cargarBandeja();
            }
        } catch (err) {
            console.error("Error al emitir visto bueno:", err);
        } finally {
            setEmitiendoConstancia(false);
        }
    };

    // Filtrar expedientes en memoria
    const expedientesFiltrados = expedientes.filter(exp => {
        const matchText = exp.distrito.toLowerCase().includes(busqueda.toLowerCase()) ||
                          exp.edan_id.toLowerCase().includes(busqueda.toLowerCase()) ||
                          exp.codigo_sinpad.toLowerCase().includes(busqueda.toLowerCase()) ||
                          exp.alcalde.toLowerCase().includes(busqueda.toLowerCase());
        return matchText;
    });

    const conformesCount = expedientes.filter(e => e.estado_control === "CONFORME_CON_CONSTANCIA").length;
    const pendientesCount = expedientes.filter(e => e.estado_control !== "CONFORME_CON_CONSTANCIA").length;

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 font-sans">
            {/* Header Institucional CGR */}
            <header className="max-w-7xl mx-auto mb-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1.5">
                                <Shield className="w-3.5 h-3.5" />
                                Contraloría General de la República - Control Concurrente en Tiempo Real
                            </span>
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                Ley Nº 29664 & D.S. N.° 124-2026-PCM
                            </span>
                        </div>
                        <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
                            <FileSignature className="w-8 h-8 text-amber-400" />
                            Bandeja de Control Concurrente & Blindaje Legal EDAN
                        </h1>
                        <p className="text-sm text-slate-400 mt-1 max-w-3xl">
                            Fiscalización preventiva sin bloqueo burocrático: verificación algorítmica de padrones nominales, blindaje legal al Alcalde mediante la <strong className="text-slate-200">Constancia de No Observación</strong> y autorización de entrega inmediata de ayuda humanitaria.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <Link
                            href="/edan"
                            className="px-4 py-2.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-sm font-semibold flex items-center gap-2 transition"
                        >
                            <Building2 className="w-4 h-4" />
                            Ir a Consola Municipal EDAN
                            <ExternalLink className="w-3.5 h-3.5 opacity-60" />
                        </Link>
                    </div>
                </div>

                {/* Métricas Globales de Fiscalización */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                    <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl">
                        <span className="text-xs text-slate-400 block mb-1">Total Expedientes Notificados</span>
                        <div className="text-2xl font-black text-white">{expedientes.length}</div>
                        <span className="text-[11px] text-slate-500 mt-0.5 block">Vía Webhook Inmediato</span>
                    </div>

                    <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl">
                        <span className="text-xs text-slate-400 block mb-1">Con Visto Bueno (Blindaje Emitido)</span>
                        <div className="text-2xl font-black text-emerald-400">{conformesCount}</div>
                        <span className="text-[11px] text-emerald-500/80 mt-0.5 block">Autorizados para Reparto</span>
                    </div>

                    <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl">
                        <span className="text-xs text-slate-400 block mb-1">Pendientes de Constancia OCI</span>
                        <div className="text-2xl font-black text-amber-400">{pendientesCount}</div>
                        <span className="text-[11px] text-amber-500/80 mt-0.5 block">Revisión Preventiva Activa</span>
                    </div>

                    <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl">
                        <span className="text-xs text-slate-400 block mb-1">Estado de Emergencia Nacional</span>
                        <div className="text-sm font-bold text-sky-400">D.S. 124-2026-PCM</div>
                        <span className="text-[11px] text-slate-400 mt-0.5 block">Vigente - Celeridad de Gasto</span>
                    </div>
                </div>
            </header>

            {/* Mensaje de Éxito de Emisión */}
            {mensajeExito && (
                <div className="max-w-7xl mx-auto mb-6 bg-emerald-950/60 border border-emerald-500/60 rounded-xl p-4 flex items-center justify-between text-emerald-200">
                    <div className="flex items-center gap-2 text-sm font-semibold">
                        <Award className="w-5 h-5 text-emerald-400" />
                        {mensajeExito}
                    </div>
                    <button onClick={() => setMensajeExito(null)} className="text-emerald-400 hover:text-white">
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}

            {/* Selector de Pestañas: Bandeja EDAN vs Cruce Obras CGR-MEF */}
            <div className="max-w-7xl mx-auto mb-6 flex gap-2 border-b border-slate-800">
                <button
                    onClick={() => setTabPrincipal("edan")}
                    className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition border-t border-x flex items-center gap-2 ${
                        tabPrincipal === "edan"
                            ? "bg-slate-900 text-amber-400 border-amber-500/40 border-b-2 border-b-amber-400"
                            : "text-slate-400 hover:text-slate-200 border-transparent hover:bg-slate-800/50"
                    }`}
                >
                    <FileCheck2 className="w-4 h-4" />
                    <span>Bandeja EDAN SINPAD (Visto Bueno &amp; BAH)</span>
                </button>
                <button
                    onClick={() => setTabPrincipal("obras_cgr")}
                    className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition border-t border-x flex items-center gap-2 ${
                        tabPrincipal === "obras_cgr"
                            ? "bg-slate-900 text-rose-400 border-rose-500/40 border-b-2 border-b-rose-400"
                            : "text-slate-400 hover:text-slate-200 border-transparent hover:bg-slate-800/50"
                    }`}
                >
                    <AlertOctagon className="w-4 h-4" />
                    <span>Auditor C2: Discrepancias Físico-Financieras (MEF vs CGR)</span>
                    <span className="text-[9px] bg-red-950 text-red-300 px-1.5 py-0.5 rounded border border-red-800 font-bold">
                        INF. 10671-2026
                    </span>
                </button>
            </div>

            {/* Contenedor Principal EDAN: Lista y Detalle */}
            {tabPrincipal === "edan" && (
                <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Panel Izquierdo: Lista de Fichas (5 columnas) */}
                <div className="lg:col-span-5 space-y-4">
                    <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl space-y-3">
                        <div className="flex items-center justify-between gap-2">
                            <h2 className="text-sm font-bold text-white flex items-center gap-2">
                                <Shield className="w-4 h-4 text-amber-400" />
                                Expedientes EDAN Notificados
                            </h2>
                            <button
                                onClick={cargarBandeja}
                                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition"
                                title="Actualizar bandeja"
                            >
                                <RefreshCw className={`w-3.5 h-3.5 ${cargando ? "animate-spin" : ""}`} />
                            </button>
                        </div>

                        {/* Buscador y Filtro */}
                        <div className="grid grid-cols-2 gap-2">
                            <div className="relative">
                                <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-500" />
                                <input
                                    type="text"
                                    placeholder="Distrito, ID, alcalde..."
                                    value={busqueda}
                                    onChange={(e) => setBusqueda(e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-700 text-xs rounded-lg pl-8 pr-2 py-1.5 text-white focus:outline-none focus:border-amber-500"
                                />
                            </div>

                            <select
                                value={filtroDepto}
                                onChange={(e) => setFiltroDepto(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-700 text-xs rounded-lg px-2 py-1.5 text-white focus:outline-none focus:border-amber-500"
                            >
                                <option value="">Todos los departamentos</option>
                                <option value="Piura">Piura</option>
                                <option value="Lambayeque">Lambayeque</option>
                                <option value="La Libertad">La Libertad</option>
                                <option value="Tumbes">Tumbes</option>
                            </select>
                        </div>
                    </div>

                    {/* Listado de Tarjetas */}
                    <div className="space-y-2.5 max-h-[650px] overflow-y-auto pr-1">
                        {expedientesFiltrados.length === 0 ? (
                            <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-8 text-center text-slate-500 text-xs">
                                No se encontraron expedientes con los criterios seleccionados.
                            </div>
                        ) : (
                            expedientesFiltrados.map((exp) => {
                                const esConforme = exp.estado_control === "CONFORME_CON_CONSTANCIA";
                                const esActivo = seleccionado?.edan_id === exp.edan_id;

                                return (
                                    <div
                                        key={exp.edan_id}
                                        onClick={() => setSeleccionado(exp)}
                                        className={`p-3.5 rounded-xl border text-xs cursor-pointer transition ${
                                            esActivo
                                                ? "bg-slate-800/90 border-amber-500/70 shadow-lg"
                                                : "bg-slate-900/60 border-slate-800 hover:bg-slate-800/40"
                                        }`}
                                    >
                                        <div className="flex items-center justify-between mb-1.5">
                                            <span className="font-bold text-sm text-white">{exp.distrito}</span>
                                            <span
                                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                                    esConforme
                                                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                                                        : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                                                }`}
                                            >
                                                {esConforme ? "NO OBSERVADO" : "PENDIENTE OCI"}
                                            </span>
                                        </div>

                                        <div className="text-slate-400 text-[11px] mb-2">
                                            {exp.provincia}, {exp.departamento} | Alcalde: {exp.alcalde}
                                        </div>

                                        <div className="flex items-center justify-between text-[11px] pt-2 border-t border-slate-800/80">
                                            <span className="font-mono text-slate-500">{exp.codigo_sinpad}</span>
                                            <span
                                                className="font-bold"
                                                style={{ color: exp.resultado_auditoria.semaforo || "#10b981" }}
                                            >
                                                Consistencia: {exp.resultado_auditoria.puntaje_consistencia_pct}%
                                            </span>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* Panel Derecho: Detalle de Auditoría & Emisión de Blindaje (7 columnas) */}
                <div className="lg:col-span-7">
                    {seleccionado ? (
                        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 space-y-6">
                            {/* Cabecera del Expediente Seleccionado */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h2 className="text-xl font-bold text-white">
                                            {seleccionado.distrito} - Expediente EDAN
                                        </h2>
                                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300">
                                            UBIGEO: {seleccionado.ubigeo}
                                        </span>
                                    </div>
                                    <div className="text-xs text-slate-400 mt-1">
                                        {seleccionado.alcalde} ({seleccionado.provincia}, {seleccionado.departamento})
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <a
                                        href={`http://127.0.0.1:8000/api/v1/edan/descargar-pdf/${seleccionado.edan_id}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg flex items-center gap-1.5 border border-slate-700 transition"
                                    >
                                        <Download className="w-3.5 h-3.5 text-emerald-400" />
                                        PDF Oficial
                                    </a>
                                </div>
                            </div>

                            {/* Resultados de la Auditoría Algorítmica */}
                            <div>
                                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                                    <Shield className="w-3.5 h-3.5 text-emerald-400" />
                                    Dictamen de Consistencia Algorítmica (CGR)
                                </h3>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                                    <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                                        <span className="text-[11px] text-slate-400 block mb-0.5">Puntaje Consistencia:</span>
                                        <div
                                            className="text-2xl font-black"
                                            style={{ color: seleccionado.resultado_auditoria.semaforo || "#10b981" }}
                                        >
                                            {seleccionado.resultado_auditoria.puntaje_consistencia_pct}%
                                        </div>
                                    </div>

                                    <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                                        <span className="text-[11px] text-slate-400 block mb-0.5">Familias Aptas Bono BAE:</span>
                                        <div className="text-2xl font-black text-sky-400">
                                            {seleccionado.resultado_auditoria.familias_elegibles_bono_bae}
                                        </div>
                                        <span className="text-[10px] text-slate-500">
                                            S/ {seleccionado.resultado_auditoria.monto_estimado_bono_bae_mensual_soles.toLocaleString()} / mes
                                        </span>
                                    </div>

                                    <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                                        <span className="text-[11px] text-slate-400 block mb-0.5">Seguro Agrario SAC:</span>
                                        <div className="text-sm font-bold text-emerald-400 mt-1">
                                            {seleccionado.resultado_auditoria.seguro_agricola_sac_activable ? "Activado (Pérdidas declaradas)" : "Sin daños agrarios"}
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-xs text-slate-300 space-y-1">
                                    <div className="font-semibold text-white">Resumen del Dictamen Automático:</div>
                                    <p className="text-slate-400 leading-relaxed">
                                        {seleccionado.resultado_auditoria.resumen_dictamen}
                                    </p>
                                </div>
                            </div>

                            {/* Alertas Detectadas */}
                            {seleccionado.resultado_auditoria.alertas_detectadas.length > 0 && (
                                <div>
                                    <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                        <AlertTriangle className="w-3.5 h-3.5" />
                                        Alertas Preventivas del Padrón ({seleccionado.resultado_auditoria.alertas_detectadas.length})
                                    </h3>
                                    <div className="space-y-2">
                                        {seleccionado.resultado_auditoria.alertas_detectadas.map((al, idx) => (
                                            <div key={idx} className="bg-amber-950/30 border border-amber-800/40 p-3 rounded-xl text-xs text-amber-200">
                                                <span className="font-bold text-[10px] bg-amber-800 px-1.5 py-0.5 rounded mr-1.5 uppercase">
                                                    {al.codigo}
                                                </span>
                                                {al.mensaje}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* ESTADO DEL VISTO BUENO / BLINDAJE LEGAL */}
                            {seleccionado.estado_control === "CONFORME_CON_CONSTANCIA" && seleccionado.visto_bueno_concurrente ? (
                                <div className="bg-emerald-950/40 border border-emerald-600/60 rounded-2xl p-5 space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                                            <Award className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold text-white">
                                                Constancia de No Observación Concurrente Emitida
                                            </h4>
                                            <div className="text-xs font-mono text-emerald-300">
                                                Código: {seleccionado.visto_bueno_concurrente.constancia_codigo}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 text-xs text-slate-300">
                                        <div className="font-bold text-emerald-400 mb-1">Blindaje Legal al Alcalde Distrital:</div>
                                        <p className="text-slate-300 text-[11px] leading-relaxed">
                                            {seleccionado.visto_bueno_concurrente.blindaje_legal_alcalde}
                                        </p>
                                        <div className="mt-2 text-[10px] text-slate-400 flex items-center justify-between border-t border-slate-800 pt-2">
                                            <span>Auditor: {seleccionado.visto_bueno_concurrente.auditor_responsable}</span>
                                            <span>Fecha: {new Date(seleccionado.visto_bueno_concurrente.fecha_aprobacion).toLocaleString()}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 text-xs font-semibold text-emerald-300 bg-emerald-500/10 px-3 py-2 rounded-lg border border-emerald-500/20">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                        Autorización expedita: Los almacenes distritales e INDECI pueden distribuir de inmediato los bienes BAH.
                                    </div>
                                </div>
                            ) : (
                                /* Formulario para Emitir la Constancia de Control Concurrente */
                                <div className="bg-slate-950 border border-amber-500/30 rounded-2xl p-5 space-y-4">
                                    <div className="flex items-center gap-2">
                                        <FileSignature className="w-5 h-5 text-amber-400" />
                                        <h4 className="text-sm font-bold text-white">
                                            Emisión de Constancia Concurrente de No Observación
                                        </h4>
                                    </div>
                                    <p className="text-xs text-slate-400">
                                        Al otorgar la conformidad, la CGR valida el cruce con RENIEC y blinda a la autoridad municipal contra imputaciones de responsabilidad por reparto anticipado bajo el marco del D.S. N.° 124-2026-PCM.
                                    </p>

                                    <div className="space-y-3 text-xs">
                                        <div>
                                            <label className="text-slate-300 block mb-1 font-medium">Auditor / Especialista Responsable:</label>
                                            <input
                                                type="text"
                                                value={auditorNombre}
                                                onChange={(e) => setAuditorNombre(e.target.value)}
                                                className="w-full bg-slate-900 border border-slate-700 text-xs rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                                            />
                                        </div>

                                        <div>
                                            <label className="text-slate-300 block mb-1 font-medium">Observaciones / Conclusión del Órgano de Control:</label>
                                            <textarea
                                                rows={2}
                                                value={observacionAuditor}
                                                onChange={(e) => setObservacionAuditor(e.target.value)}
                                                className="w-full bg-slate-900 border border-slate-700 text-xs rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                                            />
                                        </div>

                                        <button
                                            onClick={emitirVistoBueno}
                                            disabled={emitiendoConstancia}
                                            className="w-full py-3 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition shadow-lg shadow-amber-900/30 disabled:opacity-50"
                                        >
                                            {emitiendoConstancia ? (
                                                <>
                                                    <RefreshCw className="w-4 h-4 animate-spin" />
                                                    Emitiendo Constancia CGR...
                                                </>
                                            ) : (
                                                <>
                                                    <Award className="w-4 h-4" />
                                                    Emitir Constancia de No Observación (Blindar Alcalde & Autorizar BAH)
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-12 text-center text-slate-500 text-sm">
                            Seleccione un expediente de la bandeja para revisar su dictamen y emitir el visto bueno concurrente.
                        </div>
                    )}
                </div>
            </main>
            )}

            {/* ========================================================================= */}
            {/* VISTA 2: AUDITOR C2 - DISCREPANCIAS FÍSICO-FINANCIERAS (MEF VS CGR)       */}
            {/* ========================================================================= */}
            {tabPrincipal === "obras_cgr" && (
                <div className="max-w-7xl mx-auto space-y-6">
                    <div className="bg-slate-900 border border-rose-500/40 rounded-2xl p-6 space-y-4 shadow-xl">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 border-b border-slate-800 pb-4">
                            <div>
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center gap-1.5">
                                        <AlertOctagon className="w-3.5 h-3.5" />
                                        CONTROL CONCURRENTE EN CAUCES • OPERATIVO 2026
                                    </span>
                                    <span className="text-[10px] font-mono bg-slate-950 text-slate-300 px-2 py-0.5 rounded border border-slate-700 font-bold">
                                        INFORME N° 10671-2026-CG/AGR-SOP
                                    </span>
                                    <span className="text-[10px] font-mono bg-red-950 text-red-300 px-2 py-0.5 rounded border border-red-800 font-bold">
                                        SUBGERENCIA DE AGRICULTURA Y AMBIENTE CGR
                                    </span>
                                </div>
                                <h2 className="text-xl font-black text-white tracking-tight mt-1 flex items-center gap-2">
                                    <span>Auditor C2: Discrepancias Físico-Financieras en Cuencas Críticas</span>
                                </h2>
                                <p className="text-xs text-slate-400 mt-1 max-w-3xl leading-relaxed">
                                    Cruce directo entre la <strong>ejecución presupuestal devengada en el SIAF-MEF (PP 0068)</strong> y los <strong>hallazgos físicos in situ de los auditores de la Contraloría</strong> en puntos críticos de peligro Muy Alto y Alto ante el Fenómeno El Niño 2026.
                                </p>
                            </div>

                            <Link
                                href="/fiscal"
                                className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/40 transition flex items-center gap-1.5 self-start md:self-auto shadow"
                            >
                                <Coins className="w-3.5 h-3.5" />
                                <span>Ver Navegador Consulta Amigable MEF</span>
                            </Link>
                        </div>

                        {/* Listado de Cuencas con Discrepancias Críticas */}
                        <div className="space-y-4 pt-1">
                            {cgrDiscrepancias.map((disc, idx) => (
                                <div
                                    key={idx}
                                    className="bg-slate-950 border border-slate-800 hover:border-rose-500/50 rounded-2xl p-5 space-y-4 transition shadow-lg"
                                >
                                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-850 pb-3">
                                        <div className="flex items-center gap-2.5">
                                            <span className="w-3 h-3 rounded-full bg-red-500 animate-ping" />
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <h3 className="text-base font-black text-white">
                                                        Cuenca del Río {disc.cuenca} ({disc.departamento})
                                                    </h3>
                                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-950 text-red-300 border border-red-800">
                                                        PELIGRO {disc.nivel_peligro_cgr}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-slate-400">
                                                    Foco: <strong className="text-slate-200">{disc.distrito_focal}</strong> • Sector: {disc.sector_critico}
                                                </p>
                                            </div>
                                        </div>

                                        <span className="font-mono text-[10px] text-amber-400 bg-amber-950/60 px-2.5 py-1 rounded-lg border border-amber-800/60">
                                            {disc.tipo_riesgo?.replace(/_/g, " ")}
                                        </span>
                                    </div>

                                    {/* Comparativa: Hallazgo CGR vs Datos SIAF-MEF */}
                                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 text-xs">
                                        {/* Columna Izquierda: Lo que constató Contraloría */}
                                        <div className="lg:col-span-7 bg-red-950/30 border border-red-900/60 rounded-xl p-4 space-y-2">
                                            <div className="flex items-center gap-2 text-red-300 font-bold text-xs uppercase tracking-wider">
                                                <AlertTriangle className="w-4 h-4 text-red-400" />
                                                <span>Inspección Física en Campo (Contraloría General)</span>
                                            </div>
                                            <p className="text-slate-200 text-xs leading-relaxed">
                                                {disc.hallazgo_contraloria}
                                            </p>
                                            <div className="pt-2 text-[10px] text-slate-400 font-mono border-t border-red-900/40">
                                                Fuente: {disc.fuente_informe_cgr}
                                            </div>
                                        </div>

                                        {/* Columna Derecha: Lo que dice el MEF */}
                                        <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-2 flex flex-col justify-between">
                                            <div className="space-y-1.5">
                                                <div className="flex items-center gap-2 text-slate-300 font-bold text-xs uppercase tracking-wider">
                                                    <Coins className="w-4 h-4 text-amber-400" />
                                                    <span>Ejecución Financiera en Consulta Amigable MEF</span>
                                                </div>
                                                <div className="grid grid-cols-2 gap-2 pt-1 font-mono text-xs">
                                                    <div>
                                                        <span className="text-[10px] text-slate-500 block">PIM Asignado:</span>
                                                        <span className="text-white font-bold">
                                                            S/ {(disc.estadisticas_mef_cuenca?.pim_total_soles / 1e6).toFixed(1)}M
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <span className="text-[10px] text-slate-500 block">Devengado:</span>
                                                        <span className="text-emerald-400 font-bold">
                                                            S/ {(disc.estadisticas_mef_cuenca?.devengado_soles / 1e6).toFixed(1)}M ({disc.estadisticas_mef_cuenca?.porcentaje_avance_financiero}%)
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="p-2 bg-slate-950 rounded-lg border border-slate-850 flex justify-between items-center text-[10px]">
                                                <span className="text-slate-400">Obras en Cuello de Botella SIAF:</span>
                                                <span className="font-mono text-red-400 font-bold text-xs">
                                                    {disc.estadisticas_mef_cuenca?.obras_en_cuello_de_botella} obras
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Muestra de Obras CUI MEF en esta Cuenca */}
                                    {disc.obras_prioritarias_mef && disc.obras_prioritarias_mef.length > 0 && (
                                        <div className="bg-slate-900/50 rounded-xl p-3 border border-slate-850 space-y-2">
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                                                Obras CUI Auditadas en la Cuenca (Consulta Amigable MEF):
                                            </span>
                                            <div className="space-y-1.5">
                                                {disc.obras_prioritarias_mef.map((ob: any, i: number) => (
                                                    <div
                                                        key={i}
                                                        className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-xs"
                                                    >
                                                        <div className="space-y-0.5 max-w-xl">
                                                            <div className="flex items-center gap-2">
                                                                <span className="font-mono text-[10px] font-bold text-amber-400 bg-amber-950/80 px-1.5 py-0.2 rounded border border-amber-800">
                                                                    CUI {ob.cui}
                                                                </span>
                                                                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-slate-900 text-slate-300 border border-slate-700">
                                                                    {ob.nivel_gobierno}
                                                                </span>
                                                            </div>
                                                            <p className="text-slate-300 font-medium line-clamp-1">{ob.nombre_proyecto}</p>
                                                        </div>
                                                        <div className="text-right shrink-0 font-mono text-[11px]">
                                                            <span className="text-emerald-400 font-bold">
                                                                S/ {(ob.devengado_soles).toLocaleString()}
                                                            </span>
                                                            <span className="text-slate-500 text-[10px] block">
                                                                de S/ {(ob.pim_soles).toLocaleString()} ({ob.avance_pct}%)
                                                            </span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
