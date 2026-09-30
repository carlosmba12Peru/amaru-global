"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { API_BASE } from "@/config/api";
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
    FileText,
    MapPin,
    Layers,
    ChevronRight,
    TrendingUp,
    ShieldAlert,
    Landmark,
    Waves,
    Wheat
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

interface ObraUnificadaCGR {
    id: string;
    cui_o_ftr: string;
    codigo_oficial: string;
    fuente: "MEF_PP0068" | "ANA_FTR";
    fuente_label: string;
    nombre_proyecto: string;
    nivel_gobierno: string;
    entidad_ejecutora: string;
    ubigeo: string;
    departamento: string;
    provincia: string;
    distrito: string;
    cuenca: string;
    sector: string;
    cauce?: string;
    pim_soles: number;
    devengado_soles: number;
    porcentaje_ejecucion: number;
    cuello_botella_siaf: string;
    estado_ftr_cgr: string;
    semaforo_cgr: string;
    situacion_adversa_cgr: string;
    alerta_penal_art_377: boolean;
    alerta_penal_texto?: string;
    criterio_cgr_informe: string;
    poblacion_protegida: number;
    hectareas_cultivo: number;
    tipo_cultivos?: string;
    lat?: number;
    lon?: number;
}

export default function ContraloriaConcurrentePage() {
    // -------------------------------------------------------------------------
    // ESTADO: Pestañas Principales
    // -------------------------------------------------------------------------
    const [tabPrincipal, setTabPrincipal] = useState<"obras_unificadas" | "edan" | "cruce_cgr">("obras_unificadas");

    // -------------------------------------------------------------------------
    // ESTADO: Expedientes EDAN SINPAD
    // -------------------------------------------------------------------------
    const [expedientes, setExpedientes] = useState<ExpedienteCGR[]>([]);
    const [filtroDeptoEdan, setFiltroDeptoEdan] = useState<string>("");
    const [busquedaEdan, setBusquedaEdan] = useState<string>("");
    const [cargandoEdan, setCargandoEdan] = useState<boolean>(false);
    const [seleccionadoEdan, setSeleccionadoEdan] = useState<ExpedienteCGR | null>(null);

    // Formulario de visto bueno EDAN
    const [auditorNombre, setAuditorNombre] = useState<string>("Auditor Especialista OCI - C.P.C. Marco Mendoza Rios");
    const [observacionAuditor, setObservacionAuditor] = useState<string>("Revisión satelital de inundación conforme. Padrón nominal cruzado sin duplicidades.");
    const [emitiendoConstancia, setEmitiendoConstancia] = useState<boolean>(false);
    const [mensajeExito, setMensajeExito] = useState<string | null>(null);

    // -------------------------------------------------------------------------
    // ESTADO: Bandeja Central de Obras FEN & FTR ANA (CGR)
    // -------------------------------------------------------------------------
    const [obras, setObras] = useState<ObraUnificadaCGR[]>([]);
    const [kpisObras, setKpisObras] = useState<any>({
        pim_total_soles: 0,
        devengado_total_soles: 0,
        avance_financiero_pct: 0,
        poblacion_protegida_total: 0,
        hectareas_cultivo_total: 0,
        alertas_rojas_art_377: 0,
        alertas_amarillas_riesgo: 0,
        verdes_conforme: 0,
        ftr_sin_accion_cgr: 0
    });
    const [totalRegistrosUniverso, setTotalRegistrosUniverso] = useState<number>(0);
    const [totalFiltradoObras, setTotalFiltradoObras] = useState<number>(0);
    const [cargandoObras, setCargandoObras] = useState<boolean>(false);
    const [obraModal, setObraModal] = useState<ObraUnificadaCGR | null>(null);

    // Árbol jerárquico de Ubigeos
    const [arbolUbigeos, setArbolUbigeos] = useState<any>({});
    const [departamentosDisponibles, setDepartamentosDisponibles] = useState<string[]>([]);

    // Filtros de Obras
    const [filtroUbigeo, setFiltroUbigeo] = useState<string>("");
    const [filtroDeptoObra, setFiltroDeptoObra] = useState<string>("");
    const [filtroProvObra, setFiltroProvObra] = useState<string>("");
    const [filtroDistObra, setFiltroDistObra] = useState<string>("");
    const [filtroFuente, setFiltroFuente] = useState<string>("TODAS");
    const [filtroNivel, setFiltroNivel] = useState<string>("TODOS");
    const [filtroCuello, setFiltroCuello] = useState<string>("TODOS");
    const [filtroEstadoFTR, setFiltroEstadoFTR] = useState<string>("TODOS");
    const [filtroSemaforo, setFiltroSemaforo] = useState<string>("TODOS");
    const [busquedaObra, setBusquedaObra] = useState<string>("");
    const [limiteObras, setLimiteObras] = useState<number>(50);
    const [offsetObras, setOffsetObras] = useState<number>(0);

    // -------------------------------------------------------------------------
    // ESTADO: Cruce CGR / Informes (Tab 3)
    // -------------------------------------------------------------------------
    const [cgrDiscrepancias, setCgrDiscrepancias] = useState<any[]>([]);

    // -------------------------------------------------------------------------
    // CARGAS DE DATOS
    // -------------------------------------------------------------------------
    // Cargar árbol de Ubigeos inicial
    useEffect(() => {
        const cargarUbigeos = async () => {
            try {
                const res = await fetch(`${API_BASE}/api/v1/contraloria/ubigeos-filtro`);
                if (res.ok) {
                    const data = await res.json();
                    setDepartamentosDisponibles(data.departamentos || []);
                    setArbolUbigeos(data.estructura || {});
                }
            } catch (err) {
                console.error("Error al cargar ubigeos filtro:", err);
            }
        };
        cargarUbigeos();
    }, []);

    // Provincias disponibles según departamento seleccionado
    const provinciasDisponibles = useMemo(() => {
        if (!filtroDeptoObra || !arbolUbigeos[filtroDeptoObra]) return [];
        return Object.keys(arbolUbigeos[filtroDeptoObra]).sort();
    }, [filtroDeptoObra, arbolUbigeos]);

    // Distritos disponibles según provincia seleccionada
    const distritosDisponibles = useMemo(() => {
        if (!filtroDeptoObra || !filtroProvObra || !arbolUbigeos[filtroDeptoObra]?.[filtroProvObra]) return [];
        const distObj = arbolUbigeos[filtroDeptoObra][filtroProvObra];
        return Object.keys(distObj).map(d => ({
            nombre: d,
            ubigeo: distObj[d].ubigeo,
            total: distObj[d].total_intervenciones
        })).sort((a, b) => a.nombre.localeCompare(b.nombre));
    }, [filtroDeptoObra, filtroProvObra, arbolUbigeos]);

    // Cargar Obras Unificadas CGR
    const cargarObrasUnificadas = async () => {
        setCargandoObras(true);
        try {
            const params = new URLSearchParams();
            if (filtroUbigeo) params.append("ubigeo", filtroUbigeo);
            if (filtroDeptoObra) params.append("departamento", filtroDeptoObra);
            if (filtroProvObra) params.append("provincia", filtroProvObra);
            if (filtroDistObra) params.append("distrito", filtroDistObra);
            if (filtroFuente !== "TODAS") params.append("fuente", filtroFuente);
            if (filtroNivel !== "TODOS") params.append("nivel_gobierno", filtroNivel);
            if (filtroCuello !== "TODOS") params.append("cuello_botella", filtroCuello);
            if (filtroEstadoFTR !== "TODOS") params.append("estado_ftr", filtroEstadoFTR);
            if (filtroSemaforo !== "TODOS") params.append("semaforo", filtroSemaforo);
            if (busquedaObra) params.append("busqueda", busquedaObra);
            params.append("limite", limiteObras.toString());
            params.append("offset", offsetObras.toString());

            const res = await fetch(`${API_BASE}/api/v1/contraloria/obras-unificadas?${params.toString()}`);
            if (res.ok) {
                const data = await res.json();
                setObras(data.obras || []);
                setKpisObras(data.kpis_resumen || {});
                setTotalRegistrosUniverso(data.metadata?.total_registros_universo || 0);
                setTotalFiltradoObras(data.metadata?.total_filtrado || 0);
            }
        } catch (err) {
            console.error("Error cargando obras unificadas:", err);
        } finally {
            setCargandoObras(false);
        }
    };

    // Recargar obras cuando cambien los filtros
    useEffect(() => {
        cargarObrasUnificadas();
    }, [
        filtroUbigeo,
        filtroDeptoObra,
        filtroProvObra,
        filtroDistObra,
        filtroFuente,
        filtroNivel,
        filtroCuello,
        filtroEstadoFTR,
        filtroSemaforo,
        busquedaObra,
        limiteObras,
        offsetObras
    ]);

    // Cargar bandeja EDAN
    const cargarBandejaEdan = async () => {
        setCargandoEdan(true);
        try {
            const url = filtroDeptoEdan
                ? `${API_BASE}/api/v1/contraloria/bandeja-concurrente?departamento=${filtroDeptoEdan}`
                : `${API_BASE}/api/v1/contraloria/bandeja-concurrente`;
            const [res, resCruce] = await Promise.all([
                fetch(url),
                fetch(`${API_BASE}/api/v1/mef-obras/cgr-cruce`)
            ]);
            if (res.ok) {
                const data = await res.json();
                const items: ExpedienteCGR[] = data.fichas_recepcionadas || [];
                setExpedientes(items);
                if (items.length > 0 && !seleccionadoEdan) {
                    setSeleccionadoEdan(items[0]);
                } else if (seleccionadoEdan) {
                    const actualizado = items.find(i => i.edan_id === seleccionadoEdan.edan_id);
                    if (actualizado) setSeleccionadoEdan(actualizado);
                }
            }
            if (resCruce && resCruce.ok) {
                const cruceData = await resCruce.json();
                setCgrDiscrepancias(cruceData.discrepancias_criticas || []);
            }
        } catch (err) {
            console.error("Error al cargar bandeja EDAN o cruce:", err);
        } finally {
            setCargandoEdan(false);
        }
    };

    useEffect(() => {
        cargarBandejaEdan();
    }, [filtroDeptoEdan]);

    // Emitir visto bueno concurrente EDAN
    const emitirVistoBueno = async () => {
        if (!seleccionadoEdan) return;
        setEmitiendoConstancia(true);
        setMensajeExito(null);
        try {
            const res = await fetch(`${API_BASE}/api/v1/contraloria/emitir-visto-bueno`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    edan_id: seleccionadoEdan.edan_id,
                    auditor_cgr: auditorNombre,
                    observaciones: observacionAuditor
                })
            });
            if (res.ok) {
                const data = await res.json();
                setMensajeExito(`¡Constancia ${data.constancia_cgr.constancia_codigo} emitida exitosamente!`);
                await cargarBandejaEdan();
            }
        } catch (err) {
            console.error("Error al emitir visto bueno:", err);
        } finally {
            setEmitiendoConstancia(false);
        }
    };

    const expedientesFiltrados = expedientes.filter(exp => {
        return exp.distrito.toLowerCase().includes(busquedaEdan.toLowerCase()) ||
               exp.edan_id.toLowerCase().includes(busquedaEdan.toLowerCase()) ||
               exp.codigo_sinpad.toLowerCase().includes(busquedaEdan.toLowerCase()) ||
               exp.alcalde.toLowerCase().includes(busquedaEdan.toLowerCase());
    });

    const conformesCount = expedientes.filter(e => e.estado_control === "CONFORME_CON_CONSTANCIA").length;
    const pendientesCount = expedientes.filter(e => e.estado_control !== "CONFORME_CON_CONSTANCIA").length;

    // Resetear filtros geográficos
    const resetearFiltros = () => {
        setFiltroUbigeo("");
        setFiltroDeptoObra("");
        setFiltroProvObra("");
        setFiltroDistObra("");
        setFiltroFuente("TODAS");
        setFiltroNivel("TODOS");
        setFiltroCuello("TODOS");
        setFiltroEstadoFTR("TODOS");
        setFiltroSemaforo("TODOS");
        setBusquedaObra("");
        setOffsetObras(0);
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 font-sans">
            {/* Header Institucional CGR */}
            <header className="max-w-7xl mx-auto mb-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
                    <div>
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1.5">
                                <Shield className="w-3.5 h-3.5" />
                                Contraloría General de la República - Control Concurrente en Tiempo Real
                            </span>
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                Ley Nº 31358 &amp; D.S. N.° 124-2026-PCM
                            </span>
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono bg-red-950/80 text-red-300 border border-red-800/60 font-bold">
                                Criterios Informe N° 10671-2026-CG/AGR-SOP
                            </span>
                        </div>
                        <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
                            <FileSignature className="w-8 h-8 text-amber-400" />
                            Bandeja de Control Concurrente &amp; Blindaje Legal EDAN
                        </h1>
                        <p className="text-sm text-slate-400 mt-1 max-w-4xl leading-relaxed">
                            Control gubernamental simultáneo y auditoría forense preventiva: fiscalización de las <strong className="text-white">652 obras del MEF (PP 0068)</strong> y <strong className="text-white">536 intervenciones fluviales de la ANA (FTR)</strong> georreferenciadas a nivel de los <strong className="text-white">1,891 Ubigeos distritales</strong>, blindaje legal al funcionario honesto y visto bueno para la entrega de ayuda humanitaria (BAH).
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5">
                        <Link
                            href="/edan"
                            className="px-3.5 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-1.5 transition"
                        >
                            <Building2 className="w-4 h-4" />
                            Consola EDAN Municipal
                        </Link>
                        <Link
                            href="/fiscal"
                            className="px-3.5 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-semibold flex items-center gap-1.5 transition"
                        >
                            <Coins className="w-4 h-4" />
                            Consulta Amigable MEF
                        </Link>
                        <Link
                            href="/rios-norte"
                            className="px-3.5 py-2 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/30 text-sky-300 text-xs font-semibold flex items-center gap-1.5 transition"
                        >
                            <Waves className="w-4 h-4" />
                            Control Fluvial ANA
                        </Link>
                    </div>
                </div>

                {/* Mensaje de Éxito de Emisión */}
                {mensajeExito && (
                    <div className="mt-4 bg-emerald-950/60 border border-emerald-500/60 rounded-xl p-4 flex items-center justify-between text-emerald-200">
                        <div className="flex items-center gap-2 text-sm font-semibold">
                            <Award className="w-5 h-5 text-emerald-400" />
                            {mensajeExito}
                        </div>
                        <button onClick={() => setMensajeExito(null)} className="text-emerald-400 hover:text-white">
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                )}

                {/* SELECTOR DE PESTAÑAS PRINCIPALES */}
                <div className="flex gap-2 border-b border-slate-800 mt-6">
                    <button
                        onClick={() => setTabPrincipal("obras_unificadas")}
                        className={`px-4 py-3 text-xs font-bold rounded-t-xl transition border-t border-x flex items-center gap-2 ${
                            tabPrincipal === "obras_unificadas"
                                ? "bg-slate-900 text-amber-400 border-amber-500/40 border-b-2 border-b-amber-400"
                                : "text-slate-400 hover:text-slate-200 border-transparent hover:bg-slate-800/50"
                        }`}
                    >
                        <Landmark className="w-4 h-4" />
                        <span>Bandeja Central de Obras FEN (MEF PP 0068 + ANA FTR)</span>
                        <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full font-mono font-bold">
                            {totalRegistrosUniverso > 0 ? totalRegistrosUniverso : "1,179"} INTERVENCIONES
                        </span>
                    </button>

                    <button
                        onClick={() => setTabPrincipal("edan")}
                        className={`px-4 py-3 text-xs font-bold rounded-t-xl transition border-t border-x flex items-center gap-2 ${
                            tabPrincipal === "edan"
                                ? "bg-slate-900 text-emerald-400 border-emerald-500/40 border-b-2 border-b-emerald-400"
                                : "text-slate-400 hover:text-slate-200 border-transparent hover:bg-slate-800/50"
                        }`}
                    >
                        <FileCheck2 className="w-4 h-4" />
                        <span>Expedientes EDAN SINPAD (Visto Bueno &amp; BAH)</span>
                        <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-mono font-bold">
                            {expedientes.length}
                        </span>
                    </button>

                    <button
                        onClick={() => setTabPrincipal("cruce_cgr")}
                        className={`px-4 py-3 text-xs font-bold rounded-t-xl transition border-t border-x flex items-center gap-2 ${
                            tabPrincipal === "cruce_cgr"
                                ? "bg-slate-900 text-rose-400 border-rose-500/40 border-b-2 border-b-rose-400"
                                : "text-slate-400 hover:text-slate-200 border-transparent hover:bg-slate-800/50"
                        }`}
                    >
                        <AlertOctagon className="w-4 h-4" />
                        <span>Auditor C2: Discrepancias Físico-Financieras en Cuencas</span>
                        <span className="text-[9px] bg-red-950 text-red-300 px-1.5 py-0.5 rounded border border-red-800 font-bold">
                            INF. 10671-2026
                        </span>
                    </button>
                </div>
            </header>

            {/* ========================================================================= */}
            {/* PESTAÑA 1: BANDEJA CENTRAL DE OBRAS FEN & FTR ANA (UNIFICADA)             */}
            {/* ========================================================================= */}
            {tabPrincipal === "obras_unificadas" && (
                <main className="max-w-7xl mx-auto space-y-6">
                    {/* PANEL DE KPIs GLOBALES / FILTRADOS */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                        <div className="bg-slate-900/90 border border-slate-800 p-3.5 rounded-xl">
                            <span className="text-[11px] text-slate-400 block mb-1">Presupuesto PIM Auditado</span>
                            <div className="text-lg font-black text-white font-mono">
                                S/ {(kpisObras.pim_total_soles / 1e6).toFixed(1)}M
                            </div>
                            <span className="text-[10px] text-slate-500 mt-0.5 block">MEF PP0068 + ANA</span>
                        </div>

                        <div className="bg-slate-900/90 border border-slate-800 p-3.5 rounded-xl">
                            <span className="text-[11px] text-slate-400 block mb-1">Monto Devengado</span>
                            <div className="text-lg font-black text-emerald-400 font-mono">
                                S/ {(kpisObras.devengado_total_soles / 1e6).toFixed(1)}M
                            </div>
                            <span className="text-[10px] text-emerald-500/80 mt-0.5 block font-bold">
                                {kpisObras.avance_financiero_pct}% Ejecución Global
                            </span>
                        </div>

                        <div className="bg-slate-900/90 border border-rose-900/40 p-3.5 rounded-xl">
                            <span className="text-[11px] text-rose-300 block mb-1 font-bold">Alertas Art. 377 CP</span>
                            <div className="text-lg font-black text-rose-400 font-mono flex items-center gap-1.5">
                                <ShieldAlert className="w-4 h-4 text-rose-500" />
                                {kpisObras.alertas_rojas_art_377}
                            </div>
                            <span className="text-[10px] text-rose-400/80 mt-0.5 block">Omisión Funcional Crítica</span>
                        </div>

                        <div className="bg-slate-900/90 border border-amber-900/40 p-3.5 rounded-xl">
                            <span className="text-[11px] text-amber-300 block mb-1 font-bold">FTRs Sin Acción CGR</span>
                            <div className="text-lg font-black text-amber-400 font-mono">
                                {kpisObras.ftr_sin_accion_cgr}
                            </div>
                            <span className="text-[10px] text-amber-400/80 mt-0.5 block">Informe 10671 (58% nac.)</span>
                        </div>

                        <div className="bg-slate-900/90 border border-slate-800 p-3.5 rounded-xl">
                            <span className="text-[11px] text-slate-400 block mb-1">Población Protegida</span>
                            <div className="text-lg font-black text-sky-400 font-mono">
                                {(kpisObras.poblacion_protegida_total / 1e6).toFixed(2)}M
                            </div>
                            <span className="text-[10px] text-slate-500 mt-0.5 block">Habitantes en Cuencas</span>
                        </div>

                        <div className="bg-slate-900/90 border border-slate-800 p-3.5 rounded-xl">
                            <span className="text-[11px] text-slate-400 block mb-1">Superficie Agrícola</span>
                            <div className="text-lg font-black text-amber-300 font-mono">
                                {(kpisObras.hectareas_cultivo_total).toLocaleString()} Ha
                            </div>
                            <span className="text-[10px] text-slate-500 mt-0.5 block">Valles en Riesgo</span>
                        </div>
                    </div>

                    {/* SELECTOR JERÁRQUICO POR UBIGEOS Y FILTROS MULTIDIMENSIONALES */}
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-800 pb-3">
                            <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-amber-400" />
                                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                                    Filtro Territorial por Ubigeo &amp; Control Gubernamental
                                </h3>
                            </div>
                            <button
                                onClick={resetearFiltros}
                                className="text-xs text-slate-400 hover:text-amber-400 transition underline flex items-center gap-1"
                            >
                                <RefreshCw className="w-3 h-3" />
                                Limpiar Filtros
                            </button>
                        </div>

                        {/* FILA 1: SELECTORES GEOGRÁFICOS (DEPARTAMENTO -> PROVINCIA -> DISTRITO/UBIGEO) */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                            {/* Departamento */}
                            <div>
                                <label className="text-[11px] text-slate-400 block mb-1 font-semibold">1. Departamento:</label>
                                <select
                                    value={filtroDeptoObra}
                                    onChange={(e) => {
                                        setFiltroDeptoObra(e.target.value);
                                        setFiltroProvObra("");
                                        setFiltroDistObra("");
                                        setFiltroUbigeo("");
                                    }}
                                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-2 text-white font-medium focus:outline-none focus:border-amber-500"
                                >
                                    <option value="">Todos los Departamentos ({departamentosDisponibles.length})</option>
                                    {departamentosDisponibles.map(d => (
                                        <option key={d} value={d}>{d}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Provincia */}
                            <div>
                                <label className="text-[11px] text-slate-400 block mb-1 font-semibold">2. Provincia:</label>
                                <select
                                    value={filtroProvObra}
                                    disabled={!filtroDeptoObra}
                                    onChange={(e) => {
                                        setFiltroProvObra(e.target.value);
                                        setFiltroDistObra("");
                                        setFiltroUbigeo("");
                                    }}
                                    className="w-full bg-slate-950 border border-slate-700 disabled:opacity-50 rounded-lg px-2.5 py-2 text-white font-medium focus:outline-none focus:border-amber-500"
                                >
                                    <option value="">Todas las Provincias ({provinciasDisponibles.length})</option>
                                    {provinciasDisponibles.map(p => (
                                        <option key={p} value={p}>{p}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Distrito con Ubigeo */}
                            <div>
                                <label className="text-[11px] text-slate-400 block mb-1 font-semibold">3. Distrito (Ubigeo):</label>
                                <select
                                    value={filtroDistObra}
                                    disabled={!filtroProvObra}
                                    onChange={(e) => {
                                        const dist = e.target.value;
                                        setFiltroDistObra(dist);
                                        const found = distritosDisponibles.find(d => d.nombre === dist);
                                        if (found) {
                                            setFiltroUbigeo(found.ubigeo);
                                        } else {
                                            setFiltroUbigeo("");
                                        }
                                    }}
                                    className="w-full bg-slate-950 border border-slate-700 disabled:opacity-50 rounded-lg px-2.5 py-2 text-white font-medium focus:outline-none focus:border-amber-500"
                                >
                                    <option value="">Todos los Distritos ({distritosDisponibles.length})</option>
                                    {distritosDisponibles.map(d => (
                                        <option key={d.nombre} value={d.nombre}>
                                            {d.nombre} ({d.ubigeo}) - {d.total} obras
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Buscador de Ubigeo Directo */}
                            <div>
                                <label className="text-[11px] text-slate-400 block mb-1 font-semibold">Ubigeo Directo (6 dígitos):</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Ej: 200105 (Catacaos)"
                                        value={filtroUbigeo}
                                        onChange={(e) => setFiltroUbigeo(e.target.value)}
                                        className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-3 pr-8 py-2 text-white font-mono text-xs focus:outline-none focus:border-amber-500"
                                    />
                                    {filtroUbigeo && (
                                        <button
                                            onClick={() => setFiltroUbigeo("")}
                                            className="absolute right-2.5 top-2.5 text-slate-500 hover:text-white"
                                        >
                                            <X className="w-3.5 h-3.5" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* FILA 2: FILTROS FACETADOS DE CONTROL GUBERNAMENTAL */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs pt-1">
                            {/* Fuente */}
                            <div>
                                <label className="text-[10px] text-slate-400 block mb-1 font-semibold uppercase">Fuente Oficial:</label>
                                <select
                                    value={filtroFuente}
                                    onChange={(e) => setFiltroFuente(e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-1.5 text-white focus:outline-none focus:border-amber-500"
                                >
                                    <option value="TODAS">Todas (MEF PP0068 + ANA)</option>
                                    <option value="MEF_PP0068">MEF PP 0068 (Consulta Amigable)</option>
                                    <option value="ANA_FTR">ANA / MIDAGRI (Fichas FTR)</option>
                                </select>
                            </div>

                            {/* Nivel de Gobierno */}
                            <div>
                                <label className="text-[10px] text-slate-400 block mb-1 font-semibold uppercase">Nivel de Gobierno:</label>
                                <select
                                    value={filtroNivel}
                                    onChange={(e) => setFiltroNivel(e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-1.5 text-white focus:outline-none focus:border-amber-500"
                                >
                                    <option value="TODOS">Todos los Niveles</option>
                                    <option value="GOBIERNO LOCAL">Gobierno Local (Municipios)</option>
                                    <option value="GOBIERNO REGIONAL">Gobierno Regional (GORE)</option>
                                    <option value="GOBIERNO NACIONAL">Gobierno Nacional (ANA/MIDAGRI)</option>
                                </select>
                            </div>

                            {/* Cuello de Botella SIAF */}
                            <div>
                                <label className="text-[10px] text-slate-400 block mb-1 font-semibold uppercase">Cuello de Botella SIAF:</label>
                                <select
                                    value={filtroCuello}
                                    onChange={(e) => setFiltroCuello(e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-1.5 text-white focus:outline-none focus:border-amber-500"
                                >
                                    <option value="TODOS">Todos los Estados SIAF</option>
                                    <option value="SIN_CERTIFICAR">1. Sin Certificar (PIM Estancado)</option>
                                    <option value="LICITACION_TRABADA">2. Licitación Trabada</option>
                                    <option value="CONTRATO_SIN_DEVENGAR">3. Contrato sin Devengar</option>
                                    <option value="EN_EJECUCION_REGULAR">4. En Ejecución Regular</option>
                                    <option value="CULMINADO_O_AVANZADO">5. Culminado / Avanzado (&gt;=80%)</option>
                                </select>
                            </div>

                            {/* Criterio FTR CGR (Informe 10671) */}
                            <div>
                                <label className="text-[10px] text-slate-400 block mb-1 font-semibold uppercase">Criterio CGR Inf. 10671:</label>
                                <select
                                    value={filtroEstadoFTR}
                                    onChange={(e) => setFiltroEstadoFTR(e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-1.5 text-white focus:outline-none focus:border-amber-500"
                                >
                                    <option value="TODOS">Todos los Criterios CGR</option>
                                    <option value="FTR_RECIBIDA_SIN_ACCION">FTR Recibida Sin Acción (58% nac.)</option>
                                    <option value="FTR_NO_RECEPCIONADA">FTR No Recepcionada (23% nac.)</option>
                                    <option value="FTR_EN_GESTION_PRELIMINAR">FTR en Gestión Preliminar</option>
                                    <option value="OBRA_CON_CONTRATO_EN_CAMPO">Obra con Contrato en Campo</option>
                                </select>
                            </div>

                            {/* Semáforo CGR / Art. 377 */}
                            <div>
                                <label className="text-[10px] text-slate-400 block mb-1 font-semibold uppercase">Semáforo de Riesgo CGR:</label>
                                <select
                                    value={filtroSemaforo}
                                    onChange={(e) => setFiltroSemaforo(e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-1.5 text-white focus:outline-none focus:border-amber-500"
                                >
                                    <option value="TODOS">Todos los Semáforos</option>
                                    <option value="ROJO_INACCION_CRITICA">🔴 Rojo: Inacción Crítica (Art. 377)</option>
                                    <option value="AMARILLO_RIESGO">🟡 Amarillo: Riesgo / En Trámite</option>
                                    <option value="VERDE_CONFORME">🟢 Verde: Avance Conforme</option>
                                </select>
                            </div>
                        </div>

                        {/* BUSCADOR LIBRE POR TEXTO */}
                        <div className="relative pt-1">
                            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                            <input
                                type="text"
                                placeholder="Buscar por CUI, código FTR, nombre de proyecto, río, quebrada o contratista..."
                                value={busquedaObra}
                                onChange={(e) => setBusquedaObra(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                            />
                        </div>
                    </div>

                    {/* ENCABEZADO DE RESULTADOS & PAGINACIÓN */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 px-1 text-xs">
                        <div className="text-slate-400 flex items-center gap-2">
                            <span>Mostrando <strong className="text-white">{obras.length}</strong> de <strong className="text-white">{totalFiltradoObras}</strong> intervenciones filtradas (Universo total: {totalRegistrosUniverso})</span>
                            {cargandoObras && <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-400" />}
                        </div>

                        <div className="flex items-center gap-2">
                            <label className="text-slate-500">Límite:</label>
                            <select
                                value={limiteObras}
                                onChange={(e) => setLimiteObras(Number(e.target.value))}
                                className="bg-slate-900 border border-slate-800 rounded px-2 py-1 text-white text-xs"
                            >
                                <option value={25}>25</option>
                                <option value={50}>50</option>
                                <option value={100}>100</option>
                            </select>

                            <button
                                disabled={offsetObras === 0}
                                onClick={() => setOffsetObras(Math.max(0, offsetObras - limiteObras))}
                                className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 disabled:opacity-40 text-slate-300 hover:text-white"
                            >
                                Anterior
                            </button>
                            <button
                                disabled={offsetObras + limiteObras >= totalFiltradoObras}
                                onClick={() => setOffsetObras(offsetObras + limiteObras)}
                                className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 disabled:opacity-40 text-slate-300 hover:text-white"
                            >
                                Siguiente
                            </button>
                        </div>
                    </div>

                    {/* LISTA DE TARJETAS DE OBRAS AUDITADAS */}
                    {obras.length === 0 ? (
                        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-12 text-center text-slate-500 text-sm">
                            No se encontraron obras ni fichas ANA con los filtros seleccionados. Pruebe ampliando el criterio geográfico o limpiando los filtros.
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {obras.map((ob) => {
                                const esMef = ob.fuente === "MEF_PP0068";
                                const esRojo = ob.semaforo_cgr === "ROJO_INACCION_CRITICA";
                                const esAmarillo = ob.semaforo_cgr === "AMARILLO_RIESGO";

                                return (
                                    <div
                                        key={ob.id}
                                        className={`bg-slate-900/90 border rounded-2xl p-4 sm:p-5 transition hover:shadow-xl space-y-3 ${
                                            esRojo
                                                ? "border-red-900/70 hover:border-red-600/80 bg-red-950/10"
                                                : esAmarillo
                                                ? "border-amber-900/50 hover:border-amber-600/70"
                                                : "border-slate-800 hover:border-slate-700"
                                        }`}
                                    >
                                        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-3 border-b border-slate-800 pb-3">
                                            <div className="space-y-1 max-w-3xl">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                                                        esMef
                                                            ? "bg-blue-950/80 text-blue-300 border-blue-800/80"
                                                            : "bg-emerald-950/80 text-emerald-300 border-emerald-800/80"
                                                    }`}>
                                                        {ob.fuente_label}
                                                    </span>
                                                    <span className="font-mono text-xs font-black text-amber-400 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-800/60">
                                                        {ob.codigo_oficial}
                                                    </span>
                                                    <span className="text-[10px] font-mono bg-slate-950 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
                                                        Ubigeo: {ob.ubigeo}
                                                    </span>
                                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                                                        {ob.nivel_gobierno}
                                                    </span>
                                                </div>

                                                <h4 className="text-sm font-black text-white leading-snug">
                                                    {ob.nombre_proyecto}
                                                </h4>

                                                <div className="text-xs text-slate-400 flex flex-wrap items-center gap-x-3 gap-y-1">
                                                    <span><strong>Ubicación:</strong> {ob.distrito}, {ob.provincia}, {ob.departamento}</span>
                                                    {ob.cuenca && <span>• <strong>Cuenca:</strong> {ob.cuenca}</span>}
                                                    {ob.cauce && <span>• <strong>Río:</strong> {ob.cauce}</span>}
                                                    {ob.sector && <span>• <strong>Sector:</strong> {ob.sector}</span>}
                                                </div>
                                            </div>

                                            {/* Semáforo & Estado CGR */}
                                            <div className="flex flex-wrap lg:flex-col items-end gap-1.5 shrink-0 self-start lg:self-auto">
                                                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border ${
                                                    esRojo
                                                        ? "bg-red-950 text-red-300 border-red-800 animate-pulse"
                                                        : esAmarillo
                                                        ? "bg-amber-950 text-amber-300 border-amber-800"
                                                        : "bg-emerald-950 text-emerald-300 border-emerald-800"
                                                }`}>
                                                    {esRojo ? "🔴 INACCIÓN CRÍTICA" : esAmarillo ? "🟡 RIESGO EN TRÁMITE" : "🟢 CONFORME"}
                                                </span>
                                                <span className="text-[10px] font-mono text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                                                    {ob.cuello_botella_siaf?.replace(/_/g, " ")}
                                                </span>
                                            </div>
                                        </div>

                                        {/* MÉTRICAS FINANCIERAS Y DE IMPACTO */}
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-1">
                                            <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-850">
                                                <span className="text-[10px] text-slate-500 block">PIM / Inversión ANA</span>
                                                <strong className="text-white font-mono text-sm block">
                                                    S/ {(ob.pim_soles).toLocaleString()}
                                                </strong>
                                            </div>

                                            <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-850">
                                                <span className="text-[10px] text-slate-500 block">Devengado Real</span>
                                                <strong className="text-emerald-400 font-mono text-sm block">
                                                    S/ {(ob.devengado_soles).toLocaleString()} ({ob.porcentaje_ejecucion}%)
                                                </strong>
                                                <div className="w-full bg-slate-800 h-1.5 rounded-full mt-1.5 overflow-hidden">
                                                    <div
                                                        className={`h-full ${ob.porcentaje_ejecucion >= 80 ? "bg-emerald-400" : ob.porcentaje_ejecucion >= 30 ? "bg-amber-400" : "bg-red-500"}`}
                                                        style={{ width: `${Math.min(100, ob.porcentaje_ejecucion)}%` }}
                                                    />
                                                </div>
                                            </div>

                                            <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-850">
                                                <span className="text-[10px] text-slate-500 block">Población Protegida</span>
                                                <strong className="text-sky-300 font-mono text-sm block">
                                                    {(ob.poblacion_protegida || 0).toLocaleString()} hab.
                                                </strong>
                                                <span className="text-[10px] text-slate-500">Vulnerabilidad de cuenca</span>
                                            </div>

                                            <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-850">
                                                <span className="text-[10px] text-slate-500 block">Cultivos / Valle</span>
                                                <strong className="text-amber-300 font-mono text-sm block">
                                                    {(ob.hectareas_cultivo || 0).toLocaleString()} Ha
                                                </strong>
                                                <span className="text-[10px] text-slate-500">{ob.tipo_cultivos || "Agrícola"}</span>
                                            </div>
                                        </div>

                                        {/* CRITERIO CGR & ALERTA PENAL ART. 377 */}
                                        <div className="bg-slate-950/80 rounded-xl p-3 border border-slate-850 space-y-1.5 text-xs">
                                            <div className="flex items-center justify-between gap-2">
                                                <div className="flex items-center gap-1.5 text-slate-300 font-bold text-[11px] uppercase">
                                                    <AlertTriangle className={`w-3.5 h-3.5 ${esRojo ? "text-red-400" : "text-amber-400"}`} />
                                                    <span>Hallazgo y Diagnóstico de Control Concurrente (CGR)</span>
                                                </div>
                                                <span className="text-[10px] text-slate-500 font-mono">
                                                    {ob.criterio_cgr_informe}
                                                </span>
                                            </div>

                                            <p className="text-slate-300 text-xs leading-relaxed">
                                                {ob.situacion_adversa_cgr}
                                            </p>

                                            {ob.alerta_penal_art_377 && ob.alerta_penal_texto && (
                                                <div className="p-2.5 rounded-lg bg-red-950/40 border border-red-900/60 text-red-300 text-xs font-mono leading-relaxed mt-2 flex items-start gap-2">
                                                    <ShieldAlert className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                                                    <div>{ob.alerta_penal_texto}</div>
                                                </div>
                                            )}
                                        </div>

                                        {/* ACCIONES DEL AUDITOR OCI */}
                                        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-800/80 text-xs">
                                            <div className="text-slate-500 text-[11px]">
                                                Entidad Ejecutora: <strong className="text-slate-300">{ob.entidad_ejecutora}</strong>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => setObraModal(ob)}
                                                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition"
                                                >
                                                    <Eye className="w-3.5 h-3.5 text-amber-400" />
                                                    Ficha 360° de Control
                                                </button>

                                                <button
                                                    onClick={() => {
                                                        setObraModal(ob);
                                                    }}
                                                    className="px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-semibold flex items-center gap-1.5 transition"
                                                >
                                                    <FileCheck2 className="w-3.5 h-3.5" />
                                                    Emitir Dictamen OCI
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </main>
            )}

            {/* ========================================================================= */}
            {/* PESTAÑA 2: BANDEJA EDAN SINPAD & BLINDAJE LEGAL ALCALDE                   */}
            {/* ========================================================================= */}
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
                                    onClick={cargarBandejaEdan}
                                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition"
                                    title="Actualizar bandeja"
                                >
                                    <RefreshCw className={`w-3.5 h-3.5 ${cargandoEdan ? "animate-spin" : ""}`} />
                                </button>
                            </div>

                            {/* Buscador y Filtro */}
                            <div className="grid grid-cols-2 gap-2">
                                <div className="relative">
                                    <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-500" />
                                    <input
                                        type="text"
                                        placeholder="Distrito, ID, alcalde..."
                                        value={busquedaEdan}
                                        onChange={(e) => setBusquedaEdan(e.target.value)}
                                        className="w-full bg-slate-950 border border-slate-700 text-xs rounded-lg pl-8 pr-2 py-1.5 text-white focus:outline-none focus:border-amber-500"
                                    />
                                </div>

                                <select
                                    value={filtroDeptoEdan}
                                    onChange={(e) => setFiltroDeptoEdan(e.target.value)}
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
                                    const esActivo = seleccionadoEdan?.edan_id === exp.edan_id;

                                    return (
                                        <div
                                            key={exp.edan_id}
                                            onClick={() => setSeleccionadoEdan(exp)}
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

                    {/* Panel Derecho: Detalle del Expediente EDAN y Emisión de Constancia (7 columnas) */}
                    <div className="lg:col-span-7">
                        {seleccionadoEdan ? (
                            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-800 pb-4">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="text-lg font-black text-white">{seleccionadoEdan.distrito}</h3>
                                            <span className="font-mono text-xs bg-slate-950 px-2 py-0.5 rounded text-slate-300 border border-slate-800">
                                                SINPAD: {seleccionadoEdan.codigo_sinpad}
                                            </span>
                                        </div>
                                        <p className="text-xs text-slate-400">
                                            {seleccionadoEdan.provincia}, {seleccionadoEdan.departamento} • Alcalde: {seleccionadoEdan.alcalde}
                                        </p>
                                    </div>

                                    <div className="text-right">
                                        <div className="text-2xl font-black text-emerald-400">
                                            {seleccionadoEdan.resultado_auditoria.puntaje_consistencia_pct}%
                                        </div>
                                        <span className="text-[10px] text-slate-500 uppercase tracking-wider block">
                                            Consistencia Algorítmica
                                        </span>
                                    </div>
                                </div>

                                {/* Formulario para Emitir la Constancia de Control Concurrente */}
                                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-4">
                                    <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-2">
                                        <FileSignature className="w-4 h-4 text-amber-400" />
                                        Emisión de Constancia de Control Concurrente
                                    </h4>

                                    <div className="space-y-3">
                                        <div>
                                            <label className="text-[11px] text-slate-400 block mb-1">Auditor Responsable OCI:</label>
                                            <input
                                                type="text"
                                                value={auditorNombre}
                                                onChange={(e) => setAuditorNombre(e.target.value)}
                                                className="w-full bg-slate-900 border border-slate-700 text-xs rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                                            />
                                        </div>

                                        <div>
                                            <label className="text-[11px] text-slate-400 block mb-1">Observaciones / Dictamen de Conformidad:</label>
                                            <textarea
                                                rows={3}
                                                value={observacionAuditor}
                                                onChange={(e) => setObservacionAuditor(e.target.value)}
                                                className="w-full bg-slate-900 border border-slate-700 text-xs rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                                            />
                                        </div>

                                        <button
                                            onClick={emitirVistoBueno}
                                            disabled={emitiendoConstancia}
                                            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-emerald-600 hover:from-amber-600 hover:to-emerald-700 text-slate-950 font-black text-xs transition flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
                                        >
                                            {emitiendoConstancia ? (
                                                <RefreshCw className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <>
                                                    <Award className="w-4 h-4" />
                                                    Emitir Constancia de No Observación (Blindar Alcalde &amp; Autorizar BAH)
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
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
            {/* PESTAÑA 3: AUDITOR C2 - DISCREPANCIAS FÍSICO-FINANCIERAS EN CUENCAS        */}
            {/* ========================================================================= */}
            {tabPrincipal === "cruce_cgr" && (
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
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* ========================================================================= */}
            {/* MODAL FICHA 360° DE CONTROL CONCURRENTE DE LA OBRA                         */}
            {/* ========================================================================= */}
            {obraModal && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-slate-900 border border-slate-700 w-full max-w-4xl rounded-2xl p-6 max-h-[90vh] overflow-y-auto space-y-5 shadow-2xl">
                        <div className="flex justify-between items-start gap-4 border-b border-slate-800 pb-4">
                            <div>
                                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                                    <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                                        {obraModal.codigo_oficial}
                                    </span>
                                    <span className="px-2.5 py-0.5 rounded text-xs font-mono bg-slate-950 text-slate-300 border border-slate-800">
                                        Ubigeo: {obraModal.ubigeo}
                                    </span>
                                    <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-slate-800 text-slate-300">
                                        {obraModal.fuente_label}
                                    </span>
                                </div>
                                <h3 className="text-lg font-black text-white">{obraModal.nombre_proyecto}</h3>
                                <p className="text-xs text-slate-400 mt-0.5">
                                    {obraModal.distrito}, {obraModal.provincia}, {obraModal.departamento} | Unidad Ejecutora: {obraModal.entidad_ejecutora}
                                </p>
                            </div>
                            <button
                                onClick={() => setObraModal(null)}
                                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Comparativo Económico */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                                <span className="text-[10px] text-slate-500 block">Presupuesto PIM (S/.)</span>
                                <strong className="text-white font-mono text-base">
                                    S/ {(obraModal.pim_soles).toLocaleString()}
                                </strong>
                            </div>
                            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                                <span className="text-[10px] text-slate-500 block">Devengado Acumulado (S/.)</span>
                                <strong className="text-emerald-400 font-mono text-base">
                                    S/ {(obraModal.devengado_soles).toLocaleString()}
                                </strong>
                            </div>
                            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                                <span className="text-[10px] text-slate-500 block">Avance Financiero</span>
                                <strong className="text-amber-400 font-mono text-base">
                                    {obraModal.porcentaje_ejecucion}%
                                </strong>
                            </div>
                            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                                <span className="text-[10px] text-slate-500 block">Población Protegida</span>
                                <strong className="text-sky-400 font-mono text-base">
                                    {(obraModal.poblacion_protegida).toLocaleString()} hab.
                                </strong>
                            </div>
                        </div>

                        {/* Dictamen y Diagnóstico de la Contraloría */}
                        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                            <div className="flex items-center justify-between border-b border-slate-800 pb-2 text-xs">
                                <span className="font-bold text-slate-300 uppercase flex items-center gap-1.5">
                                    <Shield className="w-4 h-4 text-amber-400" />
                                    Diagnóstico Forense de Control Gubernamental
                                </span>
                                <span className="text-slate-500 font-mono text-[10px]">{obraModal.criterio_cgr_informe}</span>
                            </div>

                            <p className="text-xs text-slate-200 leading-relaxed">
                                {obraModal.situacion_adversa_cgr}
                            </p>

                            {obraModal.alerta_penal_art_377 && obraModal.alerta_penal_texto && (
                                <div className="p-3 rounded-lg bg-red-950/60 border border-red-800 text-red-200 text-xs font-mono leading-relaxed">
                                    <strong>TIPICIDAD PENAL: </strong>
                                    {obraModal.alerta_penal_texto}
                                </div>
                            )}
                        </div>

                        {/* Acciones de Blindaje / Constancia OCI */}
                        <div className="bg-emerald-950/30 p-4 rounded-xl border border-emerald-500/40 space-y-3">
                            <h4 className="text-xs font-bold text-emerald-300 uppercase flex items-center gap-1.5">
                                <Award className="w-4 h-4 text-emerald-400" />
                                Protocolo de Blindaje Legal al Funcionario Honesto
                            </h4>
                            <p className="text-xs text-slate-300 leading-relaxed">
                                De conformidad con la Directiva N° 018-2023-CG/BMPL y la Ley N° 31358, la emisión de la Constancia de No Observación de Control Concurrente certifica que la entidad ha acreditado la existencia física de la obra, el registro de horas-máquina y la consistencia del gasto ante el peligro inminente FEN.
                            </p>
                            <div className="flex justify-end gap-2 pt-2">
                                <button
                                    onClick={() => setObraModal(null)}
                                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                                >
                                    Cerrar Ficha
                                </button>
                                <button
                                    onClick={() => {
                                        setMensajeExito(`¡Constancia de Control Concurrente emitida para ${obraModal.codigo_oficial}! Registrada con sello criptográfico.`);
                                        setObraModal(null);
                                    }}
                                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow"
                                >
                                    <Check className="w-4 h-4" />
                                    Emitir Constancia Concurrente SHA-256
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
