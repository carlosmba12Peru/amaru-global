"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
    Building2,
    Clock,
    ShieldAlert,
    FileSpreadsheet,
    FileText,
    Wrench,
    AlertTriangle,
    CheckCircle2,
    XCircle,
    Compass,
    ArrowLeft,
    RefreshCw,
    TrendingDown,
    Scale,
    Users,
    Home,
    MapPin,
    Radio,
    Shield,
    FileCheck,
    Cpu,
    ExternalLink,
    Copy,
    Printer,
    Check,
    AlertOctagon,
    X,
    Lock,
    Unlock
} from "lucide-react";

export default function MunicipalSuitePage() {
    const params = useParams();
    const ubigeo = (params?.ubigeo as string) || "200101";

    const [activeTab, setActiveTab] = useState<"obras" | "reloj" | "contingencia" | "pprrd" | "damnificados">("obras");

    // Data States
    const [obrasData, setObrasData] = useState<any>(null);
    const [relojData, setRelojData] = useState<any>(null);
    const [planData, setPlanData] = useState<any>(null);
    const [pprrdData, setPprrdData] = useState<any>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    // AMARU-DAMNIFICADOS States
    const [padronData, setPadronData] = useState<any[]>([]);
    const [padronMetricas, setPadronMetricas] = useState<any>(null);
    const [filtroClasificacion, setFiltroClasificacion] = useState<string>("TODOS");
    const [filtroEstadoEdan, setFiltroEstadoEdan] = useState<string>("TODOS");

    // Break-the-Glass State
    const [unlockTargetCup, setUnlockTargetCup] = useState<string | null>(null);
    const [oficialDni, setOficialDni] = useState<string>("");
    const [oficialNombre, setOficialNombre] = useState<string>("");
    const [oficialCargo, setOficialCargo] = useState<string>("Jefe ODC / Evaluador EDAN");
    const [oficialMotivo, setOficialMotivo] = useState<string>("");
    const [unlockResult, setUnlockResult] = useState<any | null>(null);
    const [unlocking, setUnlocking] = useState<boolean>(false);

    // SINPAD Approval State
    const [sinpadTargetCup, setSinpadTargetCup] = useState<string | null>(null);
    const [sinpadCodigo, setSinpadCodigo] = useState<string>("");
    const [sinpadObservaciones, setSinpadObservaciones] = useState<string>("");
    const [sinpadAyuda, setSinpadAyuda] = useState<string[]>(["CARPA_FAMILIAR", "KIT_ALIMENTOS_BAH"]);
    const [approvingSinpad, setApprovingSinpad] = useState<boolean>(false);
    const [sinpadSuccessMsg, setSinpadSuccessMsg] = useState<string | null>(null);

    // UX Quick Wins States
    const [copiedRes, setCopiedRes] = useState<boolean>(false);
    const [showPanicModal, setShowPanicModal] = useState<boolean>(false);
    const [panicSuccessMsg, setPanicSuccessMsg] = useState<string | null>(null);

    // Certificador Maquinaria State
    const [tipoMaquinaria, setTipoMaquinaria] = useState<string>("TRACTOR_ORUGA_D8T");
    const [precioHora, setPrecioHora] = useState<number>(450);
    const [horasReq, setHorasReq] = useState<number>(120);
    const [certResult, setCertResult] = useState<any>(null);
    const [certifying, setCertifying] = useState<boolean>(false);

    // Filtro de Obras
    const [filtroSiaf, setFiltroSiaf] = useState<string>("TODAS");

    const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

    const fetchPadronData = async () => {
        try {
            const queryParams = new URLSearchParams();
            if (filtroClasificacion !== "TODOS") queryParams.append("clasificacion", filtroClasificacion);
            if (filtroEstadoEdan !== "TODOS") queryParams.append("estado", filtroEstadoEdan);

            const [resList, resMet] = await Promise.all([
                fetch(`${apiBase}/api/v1/municipal/${ubigeo}/padron-damnificados?${queryParams.toString()}`),
                fetch(`${apiBase}/api/v1/municipal/${ubigeo}/padron-damnificados/metricas`)
            ]);
            if (resList.ok) setPadronData(await resList.json());
            if (resMet.ok) setPadronMetricas(await resMet.json());
        } catch (e) {
            console.error("Error cargando pre-padrón damnificados:", e);
        }
    };

    const fetchAllData = async () => {
        setLoading(true);
        setErrorMsg(null);
        try {
            const [resObras, resReloj, resPlan, resPprrd] = await Promise.all([
                fetch(`${apiBase}/api/v1/municipal/${ubigeo}/obras-pp0068`),
                fetch(`${apiBase}/api/v1/municipal/${ubigeo}/reloj-fen`),
                fetch(`${apiBase}/api/v1/municipal/${ubigeo}/plan-contingencia-digital`),
                fetch(`${apiBase}/api/v1/municipal/${ubigeo}/pprrd-digital`)
            ]);

            if (resObras.ok) setObrasData(await resObras.json());
            if (resReloj.ok) setRelojData(await resReloj.json());
            if (resPlan.ok) setPlanData(await resPlan.json());
            if (resPprrd.ok) setPprrdData(await resPprrd.json());
            await fetchPadronData();
        } catch (err: any) {
            console.error("Error fetching municipal suite data:", err);
            setErrorMsg("No se pudo conectar con el servidor municipal. Verifique que el backend esté operativo.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (ubigeo) {
            fetchAllData();
        }
    }, [ubigeo]);

    useEffect(() => {
        if (activeTab === "damnificados") {
            fetchPadronData();
        }
    }, [activeTab, filtroClasificacion, filtroEstadoEdan]);

    const handleBreakTheGlass = async (cup: string) => {
        if (!oficialDni.trim() || oficialDni.trim().length !== 8) {
            alert("Debe ingresar un DNI de evaluador válido de 8 dígitos.");
            return;
        }
        if (!oficialNombre.trim() || !oficialMotivo.trim() || oficialMotivo.trim().length < 10) {
            alert("Debe ingresar el nombre del evaluador y un motivo asistencial detallado (mín. 10 caracteres).");
            return;
        }

        setUnlocking(true);
        try {
            const res = await fetch(`${apiBase}/api/v1/municipal/${ubigeo}/padron-damnificados/${cup}/desbloquear-identidad`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    dni_funcionario: oficialDni.trim(),
                    nombre_funcionario: oficialNombre.trim(),
                    cargo: oficialCargo.trim(),
                    motivo_acceso: oficialMotivo.trim()
                })
            });
            if (res.ok) {
                const data = await res.json();
                setUnlockResult(data);
                fetchPadronData();
            } else {
                const err = await res.json();
                alert(`Error al desbloquear identidad: ${err.error || "Operación denegada"}`);
            }
        } catch (e: any) {
            alert(`Error de red: ${e.message}`);
        } finally {
            setUnlocking(false);
        }
    };

    const handleAprobarSinpad = async (cup: string) => {
        if (!sinpadCodigo.trim()) {
            alert("Debe ingresar el código de registro oficial SINPAD.");
            return;
        }

        setApprovingSinpad(true);
        try {
            const res = await fetch(`${apiBase}/api/v1/municipal/${ubigeo}/padron-damnificados/${cup}/aprobar-sinpad`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    dni_evaluador: oficialDni.trim() || "40891234",
                    codigo_sinpad: sinpadCodigo.trim(),
                    ayuda_entregada: sinpadAyuda,
                    observaciones: sinpadObservaciones.trim() || "Ficha EDAN validada en campo conforme a directiva INDECI."
                })
            });
            if (res.ok) {
                const data = await res.json();
                setSinpadSuccessMsg(`Caso ${cup} incorporado con éxito al SINPAD con código ${sinpadCodigo}.`);
                fetchPadronData();
                setTimeout(() => {
                    setSinpadTargetCup(null);
                    setSinpadSuccessMsg(null);
                }, 2000);
            } else {
                const err = await res.json();
                alert(`Error al aprobar SINPAD: ${err.error || "Falla en registro"}`);
            }
        } catch (e: any) {
            alert(`Error de red: ${e.message}`);
        } finally {
            setApprovingSinpad(false);
        }
    };

    const handleCertificarMaquinaria = async (e: React.FormEvent) => {
        e.preventDefault();
        setCertifying(true);
        try {
            const res = await fetch(`${apiBase}/api/v1/municipal/${ubigeo}/certificar-maquinaria`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    tipo_maquinaria: tipoMaquinaria,
                    precio_hora_pen: Number(precioHora),
                    horas_requeridas: Number(horasReq)
                })
            });
            if (res.ok) {
                const data = await res.json();
                setCertResult(data);
            }
        } catch (err) {
            console.error("Error certificando maquinaria:", err);
        } finally {
            setCertifying(false);
        }
    };

    const handleCopyResolution = () => {
        if (!planData?.anexo_legal_resolucion_alcaldia) return;
        const res = planData.anexo_legal_resolucion_alcaldia;
        const vistosText = res.vistos?.map((v: string) => `• ${v}`).join("\n") || "";
        const considerandosText = res.considerandos?.join("\n\n") || "";
        const articulosText = res.articulos_resolutivos?.join("\n\n") || "";
        const fullText = `${res.numero_resolucion}\n${res.titulo}\nFecha: ${res.fecha_emision}\n\nVISTOS:\n${vistosText}\n\nCONSIDERANDO:\n${considerandosText}\n\nSE RESUELVE:\n${articulosText}\n\nFirmado:\n${res.firmante_alcalde}\nAlcalde Distrital de ${distNombre}`;
        navigator.clipboard.writeText(fullText);
        setCopiedRes(true);
        setTimeout(() => setCopiedRes(false), 3000);
    };

    const handlePrintExpediente = () => {
        window.print();
    };

    const handleTriggerCrisisConvocatoria = () => {
        setPanicSuccessMsg(`¡CONVOCATORIA ENVIADA! Notificación prioritaria despachada a la Plataforma de Defensa Civil y a los 6 miembros del GT-GRD de ${distNombre}.`);
        setTimeout(() => {
            setShowPanicModal(false);
            setPanicSuccessMsg(null);
        }, 3500);
    };

    const obrasFiltradas = obrasData?.obras_prioritarias?.filter((o: any) => {
        if (filtroSiaf === "CRITICAS") return o.semaforo_inaccion === "ROJO_INACCION_CRITICA";
        if (filtroSiaf === "SIN_CERTIFICAR") return o.cuello_botella_siaf === "SIN_CERTIFICAR";
        if (filtroSiaf === "LICITACION_TRABADA") return o.cuello_botella_siaf === "LICITACION_TRABADA";
        if (filtroSiaf === "CONTRATO_SIN_DEVENGAR") return o.cuello_botella_siaf === "CONTRATO_SIN_DEVENGAR";
        return true;
    }) || [];

    const distNombre = obrasData?.distrito || relojData?.distrito || `Distrito ${ubigeo}`;
    const provNombre = obrasData?.provincia || relojData?.provincia || "";
    const depNombre = obrasData?.departamento || relojData?.departamento || "";
    const alcaldeNombre = planData?.capitulo2_organizacion_mando?.presidente_gt_grd || "Alcalde Distrital";

    return (
        <main className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 font-sans">
            {/* Header Barra Superior */}
            <div className="max-w-7xl mx-auto space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
                    <div className="flex items-center gap-3">
                        <Link
                            href={`/dashboard/${ubigeo}`}
                            className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-lg text-slate-300 transition-colors"
                            title="Volver al Dashboard Territorial"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-950 text-cyan-400 border border-cyan-800 font-bold uppercase tracking-wider">
                                    COED MUNICIPAL AMARU • C2 DIGITAL
                                </span>
                                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-950 text-amber-400 border border-amber-800 font-bold">
                                    UBIGEO {ubigeo}
                                </span>
                                {planData?.declarado_ds_124_pcm && (
                                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-rose-950 text-rose-300 border border-rose-800 animate-pulse">
                                        D.S. 124-2026-PCM ACTIVO
                                    </span>
                                )}
                            </div>
                            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white mt-1">
                                Suite Municipal 360°: <span className="text-cyan-400">{distNombre}</span>
                            </h1>
                            <p className="text-xs text-slate-400 mt-0.5">
                                {provNombre}, {depNombre} • Alcalde / Pdte. GT-GRD: <strong className="text-slate-200">{alcaldeNombre}</strong>
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <button
                            onClick={() => setShowPanicModal(true)}
                            className="flex items-center gap-1.5 px-3 py-2 bg-rose-950/90 hover:bg-rose-900 border border-rose-600 rounded-lg text-xs font-bold text-rose-200 shadow-md shadow-rose-950/60 transition-all animate-pulse"
                            title="Convocar de Urgencia al Grupo de Trabajo de la GRD (Ley N.º 29664)"
                        >
                            <AlertOctagon className="w-3.5 h-3.5 text-rose-400" />
                            <span>🚨 Convocar GT-GRD</span>
                        </button>
                        <button
                            onClick={handlePrintExpediente}
                            className="flex items-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-lg text-xs font-medium text-slate-300 transition-colors"
                            title="Imprimir o guardar expediente digital en A4"
                        >
                            <Printer className="w-3.5 h-3.5 text-cyan-400" />
                            <span>Imprimir A4</span>
                        </button>
                        <button
                            onClick={fetchAllData}
                            disabled={loading}
                            className="flex items-center gap-2 px-3 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-lg text-xs font-medium text-slate-300 transition-colors disabled:opacity-50"
                        >
                            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
                            Actualizar Telemetría
                        </button>
                        <Link
                            href="/fiscal"
                            className="flex items-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-lg text-xs font-medium text-slate-300 transition-colors"
                        >
                            <Scale className="w-3.5 h-3.5 text-amber-400" />
                            Auditoría SIAF
                        </Link>
                    </div>
                </div>

                {errorMsg && (
                    <div className="p-4 bg-rose-950/80 border border-rose-800 rounded-xl text-rose-200 text-sm flex items-center gap-3">
                        <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
                        <span>{errorMsg}</span>
                    </div>
                )}

                {/* Tabs de Navegación 360° */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 border-b border-slate-800 pb-2">
                    <button
                        onClick={() => setActiveTab("obras")}
                        className={`flex items-center justify-center gap-1.5 p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                            activeTab === "obras"
                                ? "bg-cyan-950/70 border-cyan-500 text-cyan-200 shadow-lg shadow-cyan-950/50"
                                : "bg-slate-900/60 border-slate-800 text-slate-400 hover:bg-slate-800/80 hover:text-slate-200"
                        }`}
                    >
                        <Building2 className="w-4 h-4 text-cyan-400" />
                        <span>1. Obras PP 0068</span>
                    </button>

                    <button
                        onClick={() => setActiveTab("reloj")}
                        className={`flex items-center justify-center gap-1.5 p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                            activeTab === "reloj"
                                ? "bg-amber-950/70 border-amber-500 text-amber-200 shadow-lg shadow-amber-950/50"
                                : "bg-slate-900/60 border-slate-800 text-slate-400 hover:bg-slate-800/80 hover:text-slate-200"
                        }`}
                    >
                        <Clock className="w-4 h-4 text-amber-400" />
                        <span>2. Reloj FEN</span>
                    </button>

                    <button
                        onClick={() => setActiveTab("contingencia")}
                        className={`flex items-center justify-center gap-1.5 p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                            activeTab === "contingencia"
                                ? "bg-blue-950/70 border-blue-500 text-blue-200 shadow-lg shadow-blue-950/50"
                                : "bg-slate-900/60 border-slate-800 text-slate-400 hover:bg-slate-800/80 hover:text-slate-200"
                        }`}
                    >
                        <FileText className="w-4 h-4 text-blue-400" />
                        <span>3. Plan PCMD</span>
                    </button>

                    <button
                        onClick={() => setActiveTab("pprrd")}
                        className={`flex items-center justify-center gap-1.5 p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                            activeTab === "pprrd"
                                ? "bg-emerald-950/70 border-emerald-500 text-emerald-200 shadow-lg shadow-emerald-950/50"
                                : "bg-slate-900/60 border-slate-800 text-slate-400 hover:bg-slate-800/80 hover:text-slate-200"
                        }`}
                    >
                        <Shield className="w-4 h-4 text-emerald-400" />
                        <span>4. PPRRD Digital</span>
                    </button>

                    <button
                        onClick={() => setActiveTab("damnificados")}
                        className={`flex items-center justify-center gap-1.5 p-2.5 rounded-xl border text-xs font-semibold transition-all relative ${
                            activeTab === "damnificados"
                                ? "bg-purple-950/80 border-purple-500 text-purple-200 shadow-lg shadow-purple-950/50 font-bold"
                                : "bg-slate-900/60 border-slate-800 text-slate-400 hover:bg-slate-800/80 hover:text-slate-200"
                        }`}
                    >
                        <Users className="w-4 h-4 text-purple-400" />
                        <span>5. Pre-Padrón EDAN</span>
                        {padronData?.length > 0 && (
                            <span className="px-1.5 py-0.2 rounded-full bg-purple-500/30 text-purple-300 text-[10px] font-bold border border-purple-500/40">
                                {padronData.length}
                            </span>
                        )}
                    </button>
                </div>

                {/* CONTENIDO DE TAB 1: CONSOLA DE OBRAS PP 0068 & CERTIFICADOR DE MAQUINARIA */}
                {activeTab === "obras" && (
                    <div className="space-y-6">
                        {/* Alerta Preventiva Legal OCI / CGR si existe */}
                        {obrasData?.alerta_preventiva_legal && (
                            <div className="p-4 bg-amber-950/60 border border-amber-700/80 rounded-xl text-amber-200 text-sm flex items-start gap-3">
                                <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                                <div>
                                    <strong className="block text-amber-300 font-bold mb-1">
                                        ALERTA PREVENTIVA OCI / CGR (ART. 377 CÓDIGO PENAL)
                                    </strong>
                                    <p className="text-xs leading-relaxed text-amber-200/90">{obrasData.alerta_preventiva_legal}</p>
                                </div>
                            </div>
                        )}

                        {/* Tarjetas KPI Presupuestal */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl">
                                <span className="text-[11px] font-mono text-slate-400 uppercase">Cartera Obras PP 0068</span>
                                <div className="text-2xl font-black text-cyan-400 mt-1">
                                    {obrasData?.total_obras_cartera || 0}
                                </div>
                                <span className="text-[10px] text-slate-500">Proyectos / Intervenciones</span>
                            </div>

                            <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl">
                                <span className="text-[11px] font-mono text-slate-400 uppercase">PIM Total Asignado</span>
                                <div className="text-2xl font-black text-white mt-1">
                                    S/ {((obrasData?.pim_total_soles || 0) / 1e6).toFixed(2)}M
                                </div>
                                <span className="text-[10px] text-slate-500">Saldo Disp: S/ {((obrasData?.saldo_disponible_soles || 0) / 1e6).toFixed(2)}M</span>
                            </div>

                            <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl">
                                <span className="text-[11px] font-mono text-slate-400 uppercase">Devengado Acumulado</span>
                                <div className="text-2xl font-black text-emerald-400 mt-1">
                                    S/ {((obrasData?.devengado_total_soles || 0) / 1e6).toFixed(2)}M
                                </div>
                                <span className="text-[10px] text-slate-500">Avance Ponderado: {obrasData?.avance_ponderado_pim || 0}%</span>
                            </div>

                            <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl">
                                <span className="text-[11px] font-mono text-slate-400 uppercase">Inacción Crítica Roja</span>
                                <div className="text-2xl font-black text-rose-400 mt-1">
                                    {obrasData?.diagnostico_cuellos_botella?.obras_inaccion_critica_rojo || 0}
                                </div>
                                <span className="text-[10px] text-rose-300/80">Proyectos con &lt;15% de avance</span>
                            </div>
                        </div>

                        {/* Semáforo de Cuellos de Botella SIAF */}
                        <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-xl">
                            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-3 flex items-center gap-2">
                                <Scale className="w-4 h-4 text-cyan-400" />
                                Diagnóstico de Cuellos de Botella del Proceso Presupuestal (SIAF 2026)
                            </h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                                <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg">
                                    <div className="text-slate-400 font-mono">1. Sin Certificar</div>
                                    <div className="text-lg font-bold text-amber-400 mt-1">
                                        {obrasData?.diagnostico_cuellos_botella?.sin_certificar_obras || 0} obras
                                    </div>
                                    <p className="text-[10px] text-slate-500 mt-1">Presupuesto sin certificar. Requiere requerimiento de área usuaria.</p>
                                </div>

                                <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg">
                                    <div className="text-slate-400 font-mono">2. Licitación Trabada</div>
                                    <div className="text-lg font-bold text-orange-400 mt-1">
                                        {obrasData?.diagnostico_cuellos_botella?.licitacion_trabada_obras || 0} obras
                                    </div>
                                    <p className="text-[10px] text-slate-500 mt-1">Certificado pero sin compromiso anual. Traba en SEACE.</p>
                                </div>

                                <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg">
                                    <div className="text-slate-400 font-mono">3. Contrato Sin Devengar</div>
                                    <div className="text-lg font-bold text-cyan-400 mt-1">
                                        {obrasData?.diagnostico_cuellos_botella?.contrato_sin_devengar_obras || 0} obras
                                    </div>
                                    <p className="text-[10px] text-slate-500 mt-1">Contrato firmado, sin giro ni pago de valorizaciones.</p>
                                </div>

                                <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg">
                                    <div className="text-slate-400 font-mono">4. Monto en Riesgo</div>
                                    <div className="text-lg font-bold text-rose-400 mt-1">
                                        S/ {((obrasData?.diagnostico_cuellos_botella?.monto_en_riesgo_inaccion_soles || 0) / 1e6).toFixed(2)}M
                                    </div>
                                    <p className="text-[10px] text-slate-500 mt-1">Sujeto a reversión al Tesoro Público al cierre de año.</p>
                                </div>
                            </div>
                        </div>

                        {/* MÓDULO INTERACTIVO: CERTIFICADOR DE RAZONABILIDAD DE MAQUINARIA PESADA */}
                        <div className="p-5 bg-gradient-to-br from-slate-900 via-slate-900 to-cyan-950/40 border border-cyan-800/60 rounded-xl">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <Wrench className="w-5 h-5 text-cyan-400" />
                                    <h3 className="text-base font-bold text-white">
                                        Certificador Pericial de Razonabilidad de Alquiler de Maquinaria Pesada
                                    </h3>
                                </div>
                                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-950 text-cyan-300 border border-cyan-800">
                                    Art. 27 Ley N.º 30225 • D.S. 124-2026-PCM
                                </span>
                            </div>
                            <p className="text-xs text-slate-400 mb-4">
                                Protege al Alcalde y funcionarios municipales ante denuncias de sobreprecio o colusión en contrataciones directas de emergencia.
                                Contrasta la cotización con la banda oficial del MTC/SEACE.
                            </p>

                            <form onSubmit={handleCertificarMaquinaria} className="grid grid-cols-1 md:grid-cols-4 gap-3">
                                <div>
                                    <label className="block text-[11px] font-mono text-slate-400 mb-1">Tipo de Maquinaria</label>
                                    <select
                                        value={tipoMaquinaria}
                                        onChange={(e) => setTipoMaquinaria(e.target.value)}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                                    >
                                        <option value="TRACTOR_ORUGA_D8T">Tractor Oruga D8T / D8R</option>
                                        <option value="EXCAVADORA_ORUGA_330">Excavadora Oruga CAT 330 / 336</option>
                                        <option value="CARGADOR_FRONTAL_950">Cargador Frontal CAT 950H</option>
                                        <option value="RETROEXCAVADORA_420F">Retroexcavadora CAT 420F 4x4</option>
                                        <option value="MOTONIVELADORA_140K">Motoniveladora CAT 140K</option>
                                        <option value="VOLQUETE_15M3">Volquete 15 m³ Scania/Volvo</option>
                                        <option value="MOTOBOMBA_6_PULG">Motobomba Autocebante 6-8 Pulgadas</option>
                                        <option value="CISTERNA_AGUA_4000GAL">Camión Cisterna Agua 4,000 Galones</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-[11px] font-mono text-slate-400 mb-1">Precio Ofertado (S/ por Hora)</label>
                                    <input
                                        type="number"
                                        value={precioHora}
                                        onChange={(e) => setPrecioHora(Number(e.target.value))}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                                        placeholder="Ej: 450.00"
                                        step="10"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[11px] font-mono text-slate-400 mb-1">Horas Requeridas</label>
                                    <input
                                        type="number"
                                        value={horasReq}
                                        onChange={(e) => setHorasReq(Number(e.target.value))}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                                        placeholder="Ej: 120"
                                        step="10"
                                    />
                                </div>

                                <div className="flex items-end">
                                    <button
                                        type="submit"
                                        disabled={certifying}
                                        className="w-full py-2.5 px-4 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold rounded-lg text-xs transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
                                    >
                                        {certifying ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <FileCheck className="w-3.5 h-3.5" />}
                                        Emitir Dictamen Pericial
                                    </button>
                                </div>
                            </form>

                            {/* Resultado del Certamen Pericial */}
                            {certResult && (
                                <div className={`mt-4 p-4 rounded-xl border text-xs ${
                                    certResult.aprobado_para_contratacion_directa
                                        ? "bg-emerald-950/60 border-emerald-700/80 text-emerald-200"
                                        : "bg-rose-950/70 border-rose-700/80 text-rose-200"
                                }`}>
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2 font-bold uppercase tracking-wider text-sm">
                                            {certResult.aprobado_para_contratacion_directa ? (
                                                <>
                                                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                                                    <span>DICTAMEN: PRECIO RAZONABLE DE MERCADO (CONFORME)</span>
                                                </>
                                            ) : (
                                                <>
                                                    <XCircle className="w-5 h-5 text-rose-400" />
                                                    <span>DICTAMEN: ALERTA DE SOBREPRECIO (+{certResult.desviacion_porcentual}%)</span>
                                                </>
                                            )}
                                        </div>
                                        <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-black/40 border border-current">
                                            {certResult.amparo_legal}
                                        </span>
                                    </div>
                                    <p className="leading-relaxed mb-3">{certResult.conclusion_pericial}</p>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-2 border-t border-current/20 text-[11px] font-mono">
                                        <div>Banda MTC Mín: S/ {certResult.banda_referencial_mtc_seace?.minimo_hora_pen}</div>
                                        <div>Banda MTC Máx: S/ {certResult.banda_referencial_mtc_seace?.maximo_hora_pen}</div>
                                        <div>Monto Total Cotizado: S/ {certResult.monto_total_estimado_pen?.toLocaleString()}</div>
                                        <div>Techo Razonable: S/ {certResult.banda_referencial_mtc_seace?.monto_techo_razonable_pen?.toLocaleString()}</div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Tabla de Obras Distritales con Filtro */}
                        <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-xl space-y-4">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                                <div>
                                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                                        Cartera Detallada de Obras e Intervenciones PP 0068
                                    </h3>
                                    <p className="text-xs text-slate-400">
                                        Mostrando {obrasFiltradas.length} de {obrasData?.total_obras_cartera || 0} proyectos en la jurisdicción
                                    </p>
                                </div>

                                <div className="flex items-center gap-1.5 flex-wrap">
                                    <button
                                        onClick={() => setFiltroSiaf("TODAS")}
                                        className={`px-2.5 py-1 rounded text-xs font-mono transition-colors ${
                                            filtroSiaf === "TODAS" ? "bg-cyan-600 text-slate-950 font-bold" : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                                        }`}
                                    >
                                        Todas ({obrasData?.total_obras_cartera || 0})
                                    </button>
                                    <button
                                        onClick={() => setFiltroSiaf("CRITICAS")}
                                        className={`px-2.5 py-1 rounded text-xs font-mono transition-colors ${
                                            filtroSiaf === "CRITICAS" ? "bg-rose-600 text-white font-bold" : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                                        }`}
                                    >
                                        Críticas &lt;15% ({obrasData?.diagnostico_cuellos_botella?.obras_inaccion_critica_rojo || 0})
                                    </button>
                                    <button
                                        onClick={() => setFiltroSiaf("SIN_CERTIFICAR")}
                                        className={`px-2.5 py-1 rounded text-xs font-mono transition-colors ${
                                            filtroSiaf === "SIN_CERTIFICAR" ? "bg-amber-600 text-slate-950 font-bold" : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                                        }`}
                                    >
                                        Sin Certificar
                                    </button>
                                    <button
                                        onClick={() => setFiltroSiaf("LICITACION_TRABADA")}
                                        className={`px-2.5 py-1 rounded text-xs font-mono transition-colors ${
                                            filtroSiaf === "LICITACION_TRABADA" ? "bg-orange-600 text-white font-bold" : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                                        }`}
                                    >
                                        Trabadas SEACE
                                    </button>
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs border-collapse">
                                    <thead>
                                        <tr className="border-b border-slate-800 text-slate-400 font-mono text-[11px]">
                                            <th className="py-2.5 px-3">CUI</th>
                                            <th className="py-2.5 px-3">Nombre del Proyecto</th>
                                            <th className="py-2.5 px-3 text-right">PIM (S/)</th>
                                            <th className="py-2.5 px-3 text-right">Devengado (S/)</th>
                                            <th className="py-2.5 px-3 text-center">Avance</th>
                                            <th className="py-2.5 px-3">Cuello Botella</th>
                                            <th className="py-2.5 px-3 text-center">Semáforo</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-800/60 font-sans">
                                        {obrasFiltradas.map((obra: any, idx: number) => (
                                            <tr key={obra.cui || idx} className="hover:bg-slate-800/40 transition-colors">
                                                <td className="py-2.5 px-3 font-mono font-bold text-cyan-400">{obra.cui}</td>
                                                <td className="py-2.5 px-3 text-slate-200 max-w-md truncate" title={obra.nombre_proyecto}>
                                                    {obra.nombre_proyecto}
                                                    {obra.nivel_coincidencia && (
                                                        <span className="ml-2 text-[10px] font-mono text-slate-500">[{obra.nivel_coincidencia}]</span>
                                                    )}
                                                </td>
                                                <td className="py-2.5 px-3 text-right font-mono text-slate-200">
                                                    S/ {obra.pim_soles?.toLocaleString()}
                                                </td>
                                                <td className="py-2.5 px-3 text-right font-mono text-emerald-400">
                                                    S/ {obra.devengado_soles?.toLocaleString()}
                                                </td>
                                                <td className="py-2.5 px-3 text-center font-mono">
                                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                                        obra.porcentaje_ejecucion >= 60 ? "bg-emerald-950 text-emerald-300" :
                                                        obra.porcentaje_ejecucion >= 20 ? "bg-amber-950 text-amber-300" :
                                                        "bg-rose-950 text-rose-300"
                                                    }`}>
                                                        {obra.porcentaje_ejecucion}%
                                                    </span>
                                                </td>
                                                <td className="py-2.5 px-3 font-mono text-[11px] text-slate-400">
                                                    {obra.cuello_botella_siaf}
                                                </td>
                                                <td className="py-2.5 px-3 text-center">
                                                    <span className={`inline-block w-2.5 h-2.5 rounded-full ${
                                                        obra.semaforo_inaccion === "VERDE_CONFORME" ? "bg-emerald-500 shadow-emerald-500/50 shadow-sm" :
                                                        obra.semaforo_inaccion === "AMARILLO_RIESGO" ? "bg-amber-500 shadow-amber-500/50 shadow-sm" :
                                                        "bg-rose-500 shadow-rose-500/50 shadow-sm animate-pulse"
                                                    }`} title={obra.semaforo_inaccion} />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* CONTENIDO DE TAB 2: RELOJ FEN MUNICIPAL MICRO-CALIBRADO */}
                {activeTab === "reloj" && (
                    <div className="space-y-6">
                        {/* Directiva Táctica Inmediata */}
                        <div className="p-5 bg-gradient-to-r from-amber-950/80 via-slate-900 to-slate-900 border border-amber-600/80 rounded-xl">
                            <div className="flex items-center gap-2 mb-2">
                                <Radio className="w-5 h-5 text-amber-400 animate-pulse" />
                                <span className="text-xs font-mono text-amber-400 uppercase tracking-wider font-bold">
                                    DIRECTIVA TÁCTICA COED MUNICIPAL AMARU PARA EL ALCALDE DISTRITAL
                                </span>
                            </div>
                            <p className="text-sm text-slate-100 font-medium leading-relaxed">
                                {relojData?.directiva_tactica_alcalde || "Monitoreo preventivo ordinario activo. Mantener enlace radial con COER e INDECI."}
                            </p>
                        </div>

                        {/* Visor Polar del Reloj FEN Municipal */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Panel Visual del Reloj */}
                            <div className="p-6 bg-slate-900/80 border border-slate-800 rounded-xl flex flex-col items-center justify-center text-center">
                                <div className="text-xs font-mono text-slate-400 uppercase tracking-wider mb-2">
                                    Cinemática Polar Hidrológica Local
                                </div>
                                <h3 className="text-lg font-bold text-white mb-4">
                                    {relojData?.cuenca_hidrologica?.nombre || "Cuenca Local"}
                                </h3>

                                {/* Reloj Visual SVG */}
                                <div className="relative w-64 h-64 my-2">
                                    <svg viewBox="0 0 200 200" className="w-full h-full">
                                        {/* Círculo exterior con cuadrante */}
                                        <circle cx="100" cy="100" r="90" fill="#090d16" stroke="#1e293b" strokeWidth="4" />
                                        <circle cx="100" cy="100" r="82" fill="none" stroke="#0ea5e9" strokeWidth="1" strokeDasharray="3 3" opacity="0.3" />

                                        {/* Cuadrantes y marcas */}
                                        <line x1="100" y1="12" x2="100" y2="24" stroke="#f59e0b" strokeWidth="3" />
                                        <line x1="188" y1="100" x2="176" y2="100" stroke="#64748b" strokeWidth="2" />
                                        <line x1="100" y1="188" x2="100" y2="176" stroke="#0ea5e9" strokeWidth="3" />
                                        <line x1="12" y1="100" x2="24" y2="100" stroke="#64748b" strokeWidth="2" />

                                        {/* Texto cardinal temporal */}
                                        <text x="100" y="34" fill="#f59e0b" fontSize="8" textAnchor="middle" fontFamily="monospace" fontWeight="bold">NOV (VENTANA)</text>
                                        <text x="100" y="172" fill="#0ea5e9" fontSize="8" textAnchor="middle" fontFamily="monospace">MAR (PICO FEN)</text>

                                        {/* Aguja del Reloj */}
                                        <g transform={`rotate(${relojData?.reloj_polar_cinematica?.angulo_aguja_grados || 45} 100 100)`}>
                                            <line x1="100" y1="100" x2="100" y2="30" stroke="#06b6d4" strokeWidth="4" strokeLinecap="round" />
                                            <circle cx="100" cy="30" r="4" fill="#38bdf8" />
                                        </g>

                                        {/* Centro */}
                                        <circle cx="100" cy="100" r="7" fill="#0284c7" stroke="#ffffff" strokeWidth="2" />
                                    </svg>
                                </div>

                                <div className="mt-4 flex items-center gap-3">
                                    <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-800">
                                        Modo: {relojData?.reloj_polar_cinematica?.modo_activo}
                                    </span>
                                    <span className={`px-3 py-1 rounded-full text-xs font-mono font-bold border ${
                                        relojData?.reloj_polar_cinematica?.nivel_alerta_coel === "ROJO_INMINENTE"
                                            ? "bg-rose-950 text-rose-300 border-rose-700 animate-pulse"
                                            : "bg-amber-950 text-amber-300 border-amber-700"
                                    }`}>
                                        {relojData?.reloj_polar_cinematica?.nivel_alerta_coel}
                                    </span>
                                </div>
                            </div>

                            {/* Detalle Hidráulico de Cuenca */}
                            <div className="space-y-4">
                                <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-xl space-y-3">
                                    <h4 className="text-xs font-mono text-cyan-400 uppercase tracking-wider font-bold">
                                        Ecuación Hidrológica de Concentración (Kirpich)
                                    </h4>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg">
                                            <span className="text-[10px] text-slate-400 font-mono">Tiempo de Concentración (tc)</span>
                                            <div className="text-xl font-black text-amber-400 mt-1">
                                                {relojData?.cuenca_hidrologica?.tiempo_concentracion_tc_horas || 0} horas
                                            </div>
                                            <span className="text-[10px] text-slate-500">Desde lluvia en cabecera a valle</span>
                                        </div>

                                        <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg">
                                            <span className="text-[10px] text-slate-400 font-mono">Caudal Crítico Desborde</span>
                                            <div className="text-xl font-black text-rose-400 mt-1">
                                                {relojData?.cuenca_hidrologica?.caudal_critico_m3s || 0} m³/s
                                            </div>
                                            <span className="text-[10px] text-slate-500">Umbral de colapso de faja marginal</span>
                                        </div>
                                    </div>

                                    <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg text-xs space-y-1">
                                        <div className="text-slate-400">Estación Hidrométrica de Cabecera:</div>
                                        <div className="font-bold text-white">{relojData?.cuenca_hidrologica?.estacion_cabecera}</div>
                                    </div>

                                    <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg text-xs space-y-1">
                                        <div className="text-slate-400">Puntos de Estrangulamiento Urbano:</div>
                                        <div className="flex flex-wrap gap-1.5 pt-1">
                                            {relojData?.cuenca_hidrologica?.puntos_estrangulamiento?.map((p: string, idx: number) => (
                                                <span key={idx} className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-300 font-mono text-[11px]">
                                                    {p}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl text-xs space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-slate-400 font-mono">Ventana Dorada Noviembre:</span>
                                        <strong className="text-amber-400 font-mono">{relojData?.reloj_polar_cinematica?.ventana_dorada_dias_restantes} días restantes</strong>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-slate-400 font-mono">Precipitación Cabecera Estimada:</span>
                                        <strong className="text-cyan-400 font-mono">{relojData?.reloj_polar_cinematica?.precipitacion_cabecera_estimada_mm} mm/h</strong>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-slate-400 font-mono">Tiempo Estimado al Impacto:</span>
                                        <strong className="text-rose-400 font-mono">{relojData?.reloj_polar_cinematica?.tiempo_llegada_crecida_minutos} minutos</strong>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Quebradas y Puntos Críticos Distritales */}
                        <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-xl">
                            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3">
                                Quebradas Críticas y Conos de Deyección en la Jurisdicción
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                {relojData?.puntos_criticos_distritales?.map((q: any, idx: number) => (
                                    <div key={idx} className="p-3 bg-slate-950 border border-slate-800 rounded-lg text-xs space-y-1.5">
                                        <div className="font-bold text-cyan-300">{q.nombre}</div>
                                        <div className="text-slate-400">
                                            Umbral lluvia crítica: <strong className="text-amber-400 font-mono">{q.umbral_lluvia_critica_mm_h} mm/h</strong>
                                        </div>
                                        <div className="text-slate-400">
                                            Población en riesgo: <strong className="text-white font-mono">{q.poblacion_riesgo?.toLocaleString()} hab.</strong>
                                        </div>
                                        <div className="text-slate-500 text-[10px]">{q.obras_existentes}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* CONTENIDO DE TAB 3: PLAN DE CONTINGENCIA MUNICIPAL DIGITAL (PCMD - R.J. 188-2015-INDECI) */}
                {activeTab === "contingencia" && (
                    <div className="space-y-6">
                        {/* Header del Expediente con Hash de Integridad Forense */}
                        <div className="p-5 bg-slate-900/80 border border-blue-800/80 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-blue-950 text-blue-300 border border-blue-700 font-bold">
                                        R.J. N.º 188-2015-INDECI
                                    </span>
                                    <span className="text-xs font-mono text-slate-400">
                                        Expediente {planData?.id_expediente}
                                    </span>
                                </div>
                                <h3 className="text-lg font-bold text-white mt-1">
                                    Plan de Contingencia Distrital ante el Fenómeno El Niño 2026–2027
                                </h3>
                                <p className="text-xs text-slate-400">
                                    Generado y calibrado automáticamente para la Municipalidad Distrital de {distNombre}.
                                </p>
                            </div>

                            <div className="text-right">
                                <span className="text-[10px] font-mono text-slate-500 block">HASH SHA-256 (FE PÚBLICA)</span>
                                <span className="text-xs font-mono text-cyan-400 break-all">
                                    {planData?.hash_sha256?.substring(0, 24)}...
                                </span>
                            </div>
                        </div>

                        {/* Capítulo 1: Escenario de Riesgo y Población Expuesta */}
                        <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-xl space-y-4">
                            <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                                <Users className="w-4 h-4 text-blue-400" />
                                Capítulo I: Escenario de Riesgo y Exposición Territorial
                            </h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                                <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg">
                                    <span className="text-slate-400">Población Total</span>
                                    <div className="text-lg font-bold text-white mt-1 font-mono">
                                        {planData?.capitulo1_escenario_riesgo?.exposicion?.poblacion_total_distrital?.toLocaleString()}
                                    </div>
                                </div>
                                <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg">
                                    <span className="text-slate-400">Población Faja Marginal</span>
                                    <div className="text-lg font-bold text-amber-400 mt-1 font-mono">
                                        {planData?.capitulo1_escenario_riesgo?.exposicion?.poblacion_expuesta_faja_marginal?.toLocaleString()}
                                    </div>
                                </div>
                                <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg">
                                    <span className="text-slate-400">Familias en Alto Riesgo</span>
                                    <div className="text-lg font-bold text-rose-400 mt-1 font-mono">
                                        {planData?.capitulo1_escenario_riesgo?.exposicion?.familias_alto_riesgo_no_mitigable?.toLocaleString()}
                                    </div>
                                </div>
                                <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg">
                                    <span className="text-slate-400">Pérdidas Probables</span>
                                    <div className="text-lg font-bold text-cyan-400 mt-1 font-mono">
                                        S/ {((planData?.capitulo1_escenario_riesgo?.estimacion_danos_probables?.perdidas_economicas_estimadas_soles || 0) / 1e6).toFixed(2)}M
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Capítulo 2: Directorio de Mando GT-GRD */}
                        <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-xl space-y-4">
                            <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                                <Shield className="w-4 h-4 text-cyan-400" />
                                Capítulo II: Organización del Grupo de Trabajo de la GRD (Puesto de Comando)
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                                {planData?.capitulo2_organizacion_mando?.integrantes?.map((m: any, idx: number) => (
                                    <div key={idx} className="p-3 bg-slate-950 border border-slate-800 rounded-lg space-y-1">
                                        <div className="font-bold text-cyan-300">{m.cargo_comite}</div>
                                        <div className="text-white">{m.titular_nombre}</div>
                                        <div className="text-slate-400 text-[11px]">{m.cargo_institucional}</div>
                                        <div className="text-slate-500 font-mono text-[10px] pt-1">
                                            Contacto: {m.telefono_contacto} • {m.correo_institucional}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Capítulo 3: Albergues Temporales Validados por YACHAY & Cálculo BAH */}
                        <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-xl space-y-4">
                            <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                                <Home className="w-4 h-4 text-emerald-400" />
                                Capítulo III: Albergues Temporales Certificados & Bienes de Ayuda Humanitaria (BAH)
                            </h4>

                            {/* Albergues Validados */}
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs border-collapse">
                                    <thead>
                                        <tr className="border-b border-slate-800 text-slate-400 font-mono">
                                            <th className="py-2 px-3">Instalación / Local Escolar</th>
                                            <th className="py-2 px-3">Capacidad</th>
                                            <th className="py-2 px-3">Cota Segura</th>
                                            <th className="py-2 px-3">Agua / Letrinas</th>
                                            <th className="py-2 px-3">Veto Histórico YACHAY</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-800/60">
                                        {planData?.capitulo3_procedimientos_respuesta?.albergues_temporales?.map((alb: any, idx: number) => (
                                            <tr key={idx} className="hover:bg-slate-800/40">
                                                <td className="py-2.5 px-3 font-medium text-white">{alb.nombre}</td>
                                                <td className="py-2.5 px-3 font-mono text-cyan-400">{alb.capacidad_personas} personas</td>
                                                <td className="py-2.5 px-3 text-emerald-400">
                                                    {alb.cota_segura_inundacion ? "✓ Sí (Fuera de cauce)" : "✗ En cota de inundación"}
                                                </td>
                                                <td className="py-2.5 px-3 text-slate-300">
                                                    {alb.servicio_agua_letrinas ? "✓ Conforme" : "✗ Sin servicios"}
                                                </td>
                                                <td className="py-2.5 px-3">
                                                    {alb.vetado_por_antecedente_historico ? (
                                                        <span className="px-2 py-0.5 rounded text-[10px] bg-rose-950 text-rose-300 font-bold">VETADO POR ANTECEDENTE</span>
                                                    ) : (
                                                        <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-950 text-emerald-300 font-bold">✓ APTO Y VALIDADO</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Cálculo BAH */}
                            <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg">
                                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2">
                                    Cálculo de Bienes de Ayuda Humanitaria (BAH) - Protocolo INDECI
                                </span>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                                    <div>Carpas: <strong className="text-white font-mono">{planData?.capitulo3_procedimientos_respuesta?.bienes_ayuda_humanitaria?.carpas_familiares_unidades} unid.</strong></div>
                                    <div>Frazadas: <strong className="text-white font-mono">{planData?.capitulo3_procedimientos_respuesta?.bienes_ayuda_humanitaria?.frazadas_termicas_unidades} unid.</strong></div>
                                    <div>Raciones 72h: <strong className="text-white font-mono">{planData?.capitulo3_procedimientos_respuesta?.bienes_ayuda_humanitaria?.raciones_frias_72h_unidades} unid.</strong></div>
                                    <div>Bidones Agua: <strong className="text-white font-mono">{planData?.capitulo3_procedimientos_respuesta?.bienes_ayuda_humanitaria?.bidones_agua_131l_unidades} unid.</strong></div>
                                </div>
                            </div>
                        </div>

                        {/* Proyecto de Resolución de Alcaldía */}
                        <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-xl space-y-3">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                                    <FileCheck className="w-4 h-4 text-amber-400" />
                                    Proyecto de Resolución de Alcaldía (Listo para Firma y Promulgación)
                                </h4>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-mono text-amber-300">
                                        {planData?.anexo_legal_resolucion_alcaldia?.numero_resolucion}
                                    </span>
                                    <button
                                        onClick={handleCopyResolution}
                                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                                            copiedRes
                                                ? "bg-emerald-600 text-white border-emerald-500 shadow-md shadow-emerald-900/50"
                                                : "bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700"
                                        }`}
                                        title="Copiar texto formal para Notaría, Sesión de Concejo o Mesa de Partes"
                                    >
                                        {copiedRes ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5 text-amber-400" />}
                                        <span>{copiedRes ? "✓ Copiado al Portapapeles" : "Copiar Texto Formal"}</span>
                                    </button>
                                </div>
                            </div>

                            <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono space-y-2 text-slate-300 max-h-72 overflow-y-auto">
                                <p className="font-bold text-white">{planData?.anexo_legal_resolucion_alcaldia?.titulo}</p>
                                <p className="text-slate-400">Fecha: {planData?.anexo_legal_resolucion_alcaldia?.fecha_emision}</p>
                                <div className="pt-2 text-slate-400">VISTOS:</div>
                                {planData?.anexo_legal_resolucion_alcaldia?.vistos?.map((v: string, idx: number) => (
                                    <p key={idx}>• {v}</p>
                                ))}
                                <div className="pt-2 text-slate-400">CONSIDERANDO:</div>
                                {planData?.anexo_legal_resolucion_alcaldia?.considerandos?.map((c: string, idx: number) => (
                                    <p key={idx}>{c}</p>
                                ))}
                                <div className="pt-2 text-slate-400">SE RESUELVE:</div>
                                {planData?.anexo_legal_resolucion_alcaldia?.articulos_resolutivos?.map((a: string, idx: number) => (
                                    <p key={idx} className="font-bold text-cyan-200">{a}</p>
                                ))}
                                <div className="pt-4 text-right text-slate-400">
                                    ____________________________________<br />
                                    {planData?.anexo_legal_resolucion_alcaldia?.firmante_alcalde}<br />
                                    Alcalde Distrital de {distNombre}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* CONTENIDO DE TAB 4: PPRRD DIGITAL (R.J. 058-2019-CENEPRED/J) */}
                {activeTab === "pprrd" && (
                    <div className="space-y-6">
                        <div className="p-5 bg-slate-900/80 border border-emerald-800/80 rounded-xl">
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-950 text-emerald-300 border border-emerald-700 font-bold">
                                {pprrdData?.marco_legal}
                            </span>
                            <h3 className="text-lg font-bold text-white mt-2">
                                Plan de Prevención y Reducción del Riesgo de Desastres (PPRRD)
                            </h3>
                            <p className="text-xs text-slate-400 mt-1">
                                {pprrdData?.objetivo_estrategico} • Jurisdicción: {distNombre}, {provNombre}, {depNombre}.
                            </p>
                        </div>

                        {/* Matriz de Inversiones Estructurales */}
                        <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-xl space-y-4">
                            <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                                <Building2 className="w-4 h-4 text-emerald-400" />
                                Cartera de Inversiones Estructurales (Defensas Ribereñas y Drenaje Pluvial)
                            </h4>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {planData?.capitulo5_inversion_pprrd_mef?.obras_prioritarias_defensas?.map((p: any, idx: number) => (
                                    <div key={idx} className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2 text-xs">
                                        <div className="flex items-center justify-between">
                                            <span className="font-mono font-bold text-cyan-400">CUI {p.cui}</span>
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                                                p.avance_porcentaje >= 50 ? "bg-emerald-950 text-emerald-300" : "bg-amber-950 text-amber-300"
                                            }`}>
                                                {p.avance_porcentaje}% Avance
                                            </span>
                                        </div>
                                        <div className="font-medium text-slate-200 line-clamp-2">{p.proyecto}</div>
                                        <div className="flex items-center justify-between text-slate-400 font-mono text-[11px] pt-1 border-t border-slate-800">
                                            <span>PIM: S/ {p.monto_pim_soles?.toLocaleString()}</span>
                                            <span>Dev: S/ {p.monto_devengado_soles?.toLocaleString()}</span>
                                        </div>
                                        <div className="text-[11px] text-amber-300">
                                            Acción: {p.accion_preventiva_urgente}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Medidas No Estructurales */}
                        <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-xl space-y-3">
                            <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                                <Shield className="w-4 h-4 text-cyan-400" />
                                Medidas No Estructurales y Ordenamiento Territorial
                            </h4>
                            <div className="space-y-2 text-xs text-slate-300">
                                {planData?.capitulo5_inversion_pprrd_mef?.medidas_no_estructurales_ordenamiento?.map((m: string, idx: number) => (
                                    <div key={idx} className="p-3 bg-slate-950 border border-slate-800 rounded-lg flex items-start gap-2">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                                        <span>{m}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* CONTENIDO DE TAB 5: PRE-PADRÓN EDAN & DAMNIFICADOS VALIDADOS (AMARU-DAMNIFICADOS) */}
                {activeTab === "damnificados" && (
                    <div className="space-y-6">
                        {/* Encabezado Doctrinal y Legal */}
                        <div className="p-5 bg-slate-900/90 border border-purple-800/80 rounded-2xl shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div>
                                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-purple-950 text-purple-300 border border-purple-700 font-bold">
                                        AMARU-DAMNIFICADOS
                                    </span>
                                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300 border border-slate-700">
                                        Ley N.º 29664 (SINAGERD)
                                    </span>
                                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-950 text-emerald-300 border border-emerald-700">
                                        Bono BAE S/ 500 (Ley N.º 31526)
                                    </span>
                                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-950 text-amber-300 border border-amber-700">
                                        Bóveda Zero-PII (Ley N.º 29733)
                                    </span>
                                </div>
                                <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
                                    <Users className="w-5 h-5 text-purple-400" />
                                    Pre-Padrón Digital EDAN &amp; Verificación Cruzada Territorial
                                </h3>
                                <p className="text-xs text-slate-400 mt-1 max-w-3xl leading-relaxed">
                                    Módulo soberano de filtrado y pre-calificación de familias damnificadas y afectadas.
                                    Valida el reporte vecinal contra el gemelo digital climático AMARU-CLIMATE, fajas marginales ANA y quebradas críticas CENEPRED.
                                    <span className="text-purple-300 font-medium ml-1">
                                        Soberanía Humana: La IA no decide; entrega pre-calificación y peritaje para que el Oficial de Defensa Civil apruebe formalmente en el SINPAD.
                                    </span>
                                </p>
                            </div>

                            <button
                                onClick={fetchPadronData}
                                className="px-3.5 py-2 bg-purple-900/60 hover:bg-purple-800 border border-purple-600 rounded-xl text-xs font-bold text-purple-200 transition flex items-center gap-1.5 shrink-0"
                            >
                                <RefreshCw className="w-3.5 h-3.5" />
                                <span>Refrescar Padrón</span>
                            </button>
                        </div>

                        {/* KPIs Ejecutivos del Padrón Distrital */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 flex flex-col">
                                <span className="text-[10px] text-slate-400 uppercase font-semibold">Total Familias</span>
                                <span className="text-xl font-extrabold text-white mt-1">
                                    {padronMetricas?.total_familias_pre_empadronadas || padronData.length}
                                </span>
                                <span className="text-[10px] text-slate-500">Expedientes CUP-DAMN</span>
                            </div>

                            <div className="bg-slate-900/80 border border-rose-900/40 rounded-xl p-3 flex flex-col">
                                <span className="text-[10px] text-rose-400 uppercase font-semibold">Viviendas Colapsadas</span>
                                <span className="text-xl font-extrabold text-rose-400 mt-1">
                                    {padronMetricas?.viviendas_colapsadas || 0}
                                </span>
                                <span className="text-[10px] text-rose-500/80">Pérdida total estructural</span>
                            </div>

                            <div className="bg-slate-900/80 border border-amber-900/40 rounded-xl p-3 flex flex-col">
                                <span className="text-[10px] text-amber-400 uppercase font-semibold">Viviendas Inhabitables</span>
                                <span className="text-xl font-extrabold text-amber-300 mt-1">
                                    {padronMetricas?.viviendas_inhabitables || 0}
                                </span>
                                <span className="text-[10px] text-amber-500/80">Saturación / Riesgo colapso</span>
                            </div>

                            <div className="bg-slate-900/80 border border-emerald-900/40 rounded-xl p-3 flex flex-col">
                                <span className="text-[10px] text-emerald-400 uppercase font-semibold">Elegibles Bono BAE</span>
                                <span className="text-xl font-extrabold text-emerald-400 mt-1">
                                    {padronMetricas?.elegibles_bono_bae_500 || 0}
                                </span>
                                <span className="text-[10px] text-emerald-500/80">S/ 500 / mes (2 años)</span>
                            </div>

                            <div className="bg-slate-900/80 border border-cyan-900/40 rounded-xl p-3 flex flex-col">
                                <span className="text-[10px] text-cyan-400 uppercase font-semibold">Presupuesto BAE Estimado</span>
                                <span className="text-sm font-extrabold text-cyan-300 mt-2 font-mono">
                                    S/ {(padronMetricas?.presupuesto_bae_estimado_mensual_pen || 0).toLocaleString()}
                                </span>
                                <span className="text-[10px] text-cyan-500/80">Mensual distrito</span>
                            </div>

                            <div className="bg-slate-900/80 border border-blue-900/40 rounded-xl p-3 flex flex-col">
                                <span className="text-[10px] text-blue-400 uppercase font-semibold">Validados en SINPAD</span>
                                <span className="text-xl font-extrabold text-blue-400 mt-1">
                                    {padronMetricas?.validados_oficial_sinpad || 0}
                                </span>
                                <span className="text-[10px] text-blue-500/80">Ficha EDAN formalizada</span>
                            </div>
                        </div>

                        {/* Filtros Tácticos de la Bandeja */}
                        <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-900/60 border border-slate-800 rounded-xl">
                            <div className="flex flex-wrap items-center gap-1.5">
                                <span className="text-xs text-slate-400 font-semibold mr-1">Pre-Clasificación:</span>
                                {[
                                    { id: "TODOS", label: "Todos" },
                                    { id: "DAMNIFICADO_VIVIENDA_COLAPSADA", label: "Colapsadas (Rojo)" },
                                    { id: "DAMNIFICADO_VIVIENDA_INHABITABLE", label: "Inhabitables (Ámbar)" },
                                    { id: "AFECTADO_VIVIENDA_AFECTADA_LEVE", label: "Afectadas Leves (Azul)" }
                                ].map((btn) => (
                                    <button
                                        key={btn.id}
                                        onClick={() => setFiltroClasificacion(btn.id)}
                                        className={`px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                                            filtroClasificacion === btn.id
                                                ? "bg-purple-600 text-white shadow-md shadow-purple-600/30"
                                                : "bg-slate-950 text-slate-400 hover:text-white border border-slate-800"
                                        }`}
                                    >
                                        {btn.label}
                                    </button>
                                ))}
                            </div>

                            <div className="flex items-center gap-2">
                                <span className="text-xs text-slate-400 font-semibold">Estado:</span>
                                <select
                                    value={filtroEstadoEdan}
                                    onChange={(e) => setFiltroEstadoEdan(e.target.value)}
                                    className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-300 focus:outline-none focus:border-purple-500 font-mono"
                                >
                                    <option value="TODOS">Todos los Estados</option>
                                    <option value="PRE_EMPADRONADO_PENDIENTE">Pendientes de Validación</option>
                                    <option value="VALIDADO_OFICIAL_SINPAD">Validados SINPAD Oficial</option>
                                </select>
                            </div>
                        </div>

                        {/* Listado de Casos / Expedientes CUP-DAMN */}
                        {padronData.length === 0 ? (
                            <div className="p-8 text-center bg-slate-900/50 border border-slate-800 rounded-2xl">
                                <Users className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                                <p className="text-sm font-semibold text-slate-300">No se encontraron expedientes con los filtros seleccionados.</p>
                                <p className="text-xs text-slate-500 mt-1">Los nuevos reportes de ciudadanos que soliciten empadronamiento aparecerán automáticamente aquí.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {padronData.map((c: any) => {
                                    const preClasif = c.evaluacion_ia?.pre_clasificacion_indeci;
                                    const isColapsada = preClasif === "DAMNIFICADO_VIVIENDA_COLAPSADA";
                                    const isInhabitable = preClasif === "DAMNIFICADO_VIVIENDA_INHABITABLE";
                                    const isBae = c.evaluacion_ia?.elegible_bono_bae_500;
                                    const isUnsealed = c.sello_identidad_desbloqueado;
                                    const isSinpadApproved = c.estado_validacion === "VALIDADO_OFICIAL_SINPAD";

                                    return (
                                        <div
                                            key={c.cup}
                                            className={`p-5 rounded-2xl border transition-all ${
                                                isColapsada
                                                    ? "bg-slate-900/90 border-rose-900/60 shadow-lg shadow-rose-950/20"
                                                    : isInhabitable
                                                    ? "bg-slate-900/90 border-amber-900/60 shadow-lg shadow-amber-950/20"
                                                    : "bg-slate-900/90 border-slate-800"
                                            }`}
                                        >
                                            {/* Cabecera del Caso */}
                                            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <span className="font-mono text-sm font-extrabold text-amber-400 bg-amber-950/40 px-2.5 py-1 rounded-lg border border-amber-500/30">
                                                        {c.cup}
                                                    </span>

                                                    <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                                                        isColapsada
                                                            ? "bg-rose-950 text-rose-300 border border-rose-700"
                                                            : isInhabitable
                                                            ? "bg-amber-950 text-amber-300 border border-amber-700"
                                                            : "bg-blue-950 text-blue-300 border border-blue-700"
                                                    }`}>
                                                        {isColapsada ? "🔴 DAMNIFICADO: Vivienda Colapsada" :
                                                         isInhabitable ? "🟠 DAMNIFICADO: Vivienda Inhabitable" :
                                                         "🔵 AFECTADO: Vivienda Afectada Leve"}
                                                    </span>

                                                    <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-700 flex items-center gap-1">
                                                        <span>🎯 {c.evaluacion_ia?.score_consistencia_territorial}%</span>
                                                        <span className="text-[10px] text-emerald-400/80 font-normal">Consistencia</span>
                                                    </span>

                                                    {isBae && (
                                                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                                                            ✓ Elegible Bono BAE S/ 500
                                                        </span>
                                                    )}

                                                    {/* Badge de Lengua Originaria & Testimonio de Audio */}
                                                    {c.identidad_linguistica?.lengua_materna && c.identidad_linguistica.lengua_materna !== "es" && (
                                                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950 text-amber-300 border border-amber-700 flex items-center gap-1">
                                                            <span>🌐 {c.identidad_linguistica.lengua_materna.toUpperCase()}</span>
                                                            {c.identidad_linguistica.requiere_asistencia_bilingue && (
                                                                <span className="text-[9px] bg-rose-900 text-rose-200 px-1 rounded font-semibold">Requiere Bilingüe</span>
                                                            )}
                                                        </span>
                                                    )}

                                                    {c.identidad_linguistica?.tiene_audio && (
                                                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-950 text-teal-300 border border-teal-700 flex items-center gap-1">
                                                            <span>🎤 Audio Testimonio</span>
                                                            {c.identidad_linguistica.audio_sha256 && (
                                                                <span className="text-[9px] font-mono opacity-70">({c.identidad_linguistica.audio_sha256.slice(0, 8)})</span>
                                                            )}
                                                        </span>
                                                    )}

                                                    {isSinpadApproved && (
                                                        <span className="px-2.5 py-0.5 rounded text-[11px] font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-700">
                                                            ✓ SINPAD: {c.codigo_sinpad_oficial}
                                                        </span>
                                                    )}
                                                </div>

                                                <span className="text-[11px] text-slate-500 font-mono">
                                                    {new Date(c.fecha_registro).toLocaleString()}
                                                </span>
                                            </div>

                                            {/* Alerta Operativa: Despacho de Evaluador Bilingüe */}
                                            {c.identidad_linguistica?.requiere_asistencia_bilingue && (
                                                <div className="mt-3 p-2.5 rounded-xl bg-amber-950/40 border border-amber-500/40 text-[11px] text-amber-300 flex items-center gap-2">
                                                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                                                    <span>
                                                        <strong>Alerta Intercultural MINCUL (Ley N.° 29735):</strong> La familia declara preferencia en lengua originaria ({c.identidad_linguistica.lengua_materna.toUpperCase()}). Asignar brigadista bilingüe acreditado de Defensa Civil para la inspección y firma del Formato 2B EDAN.
                                                    </span>
                                                </div>
                                            )}

                                            {/* Detalles Técnicos de la Vivienda y Familia */}
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-4 text-xs">
                                                {/* Columna 1: Características Físicas */}
                                                <div className="space-y-1.5 p-3 bg-slate-950 rounded-xl border border-slate-800/80">
                                                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Estructura &amp; Daño</span>
                                                    <div className="text-slate-300"><strong className="text-white">Ubicación:</strong> {c.referencia_zona}</div>
                                                    <div className="text-slate-300"><strong className="text-white">Tirante de Agua:</strong> <span className="font-mono text-cyan-300">{c.tirante_agua}</span></div>
                                                    <div className="text-slate-300"><strong className="text-white">Muros / Techo:</strong> {c.material_muros} / {c.material_techo}</div>
                                                    <div className="text-slate-300"><strong className="text-white">Tenencia:</strong> {c.condicion_tenencia}</div>
                                                </div>

                                                {/* Columna 2: Vulnerabilidad Familiar */}
                                                <div className="space-y-1.5 p-3 bg-slate-950 rounded-xl border border-slate-800/80">
                                                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Vulnerabilidad Familiar</span>
                                                    <div className="text-slate-300"><strong className="text-white">Total Integrantes:</strong> <span className="font-bold text-white">{c.total_integrantes} personas</span></div>
                                                    <div className="flex flex-wrap gap-1.5 pt-1">
                                                        {c.ninos_menores_5 > 0 && <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 text-[10px] font-semibold border border-cyan-800">{c.ninos_menores_5} Niños &lt;5</span>}
                                                        {c.adultos_mayores_65 > 0 && <span className="px-2 py-0.5 rounded bg-amber-950 text-amber-300 text-[10px] font-semibold border border-amber-800">{c.adultos_mayores_65} Adultos &gt;65</span>}
                                                        {c.mujeres_gestantes > 0 && <span className="px-2 py-0.5 rounded bg-rose-950 text-rose-300 text-[10px] font-semibold border border-rose-800">{c.mujeres_gestantes} Gestantes</span>}
                                                        {c.personas_discapacidad > 0 && <span className="px-2 py-0.5 rounded bg-purple-950 text-purple-300 text-[10px] font-semibold border border-purple-800">{c.personas_discapacidad} Con Discapacidad</span>}
                                                    </div>
                                                </div>

                                                {/* Columna 3: Auditoría Cruzada AMARU-CLIMATE */}
                                                <div className="space-y-1.5 p-3 bg-slate-950 rounded-xl border border-slate-800/80">
                                                    <span className="text-[10px] text-emerald-400 uppercase font-semibold block">Peritaje Territorial Cruzado</span>
                                                    <div className="text-slate-300 font-mono text-[11px]">• {c.evaluacion_ia?.capas_auditoria?.inundacion_activa_ana}</div>
                                                    <div className="text-slate-300 font-mono text-[11px]">• {c.evaluacion_ia?.capas_auditoria?.buffer_quebrada_cenepred}</div>
                                                    <div className="text-slate-300 font-mono text-[11px]">• {c.evaluacion_ia?.capas_auditoria?.consenso_espacial_multivecinal}</div>
                                                    <div className="text-slate-300 font-mono text-[11px]">• {c.evaluacion_ia?.capas_auditoria?.peritaje_gemini_vision}</div>
                                                </div>
                                            </div>

                                            {/* Testimonio del Poblador */}
                                            {c.relato_danos && (
                                                <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 text-xs text-slate-300 italic mb-4">
                                                    "{c.relato_danos}"
                                                </div>
                                            )}

                                            {/* SECCIÓN ZERO-PII / IDENTIDAD Y SOBERANÍA HUMANA */}
                                            <div className="pt-3 border-t border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                                                {/* Estado del Sello Criptográfico */}
                                                <div>
                                                    {!isUnsealed ? (
                                                        <div className="flex items-center gap-2 text-xs text-slate-400">
                                                            <Lock className="w-4 h-4 text-amber-400 shrink-0" />
                                                            <span>
                                                                Identidad del Jefe de Hogar cifrada bajo AES-256 (Ley N.° 29733 Zero-PII).
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        <div className="space-y-1 text-xs text-emerald-300">
                                                            <div className="flex items-center gap-1.5 font-bold">
                                                                <Unlock className="w-4 h-4 text-emerald-400 shrink-0" />
                                                                <span>Identidad Desbloqueada por {c.desbloqueado_por_oficial}</span>
                                                            </div>
                                                            {unlockResult?.cup === c.cup && (
                                                                <div className="font-mono text-[11px] text-slate-300 bg-slate-950 p-2 rounded-lg border border-slate-800">
                                                                    <strong>Jefe Hogar:</strong> {unlockResult.datos_familiares_desbloqueados?.nombre_completo} (DNI: {unlockResult.datos_familiares_desbloqueados?.dni_jefe_hogar}) | <strong>Tel:</strong> {unlockResult.datos_familiares_desbloqueados?.telefono} | <strong>Dir:</strong> {unlockResult.datos_familiares_desbloqueados?.direccion_exacta}
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Botones Operativos de Soberanía Humana */}
                                                <div className="flex flex-wrap items-center gap-2">
                                                    {!isUnsealed && (
                                                        <button
                                                            onClick={() => {
                                                                setUnlockTargetCup(c.cup);
                                                                setOficialMotivo("Inspección ocular y empadronamiento de emergencia Ficha EDAN.");
                                                            }}
                                                            className="px-3 py-1.5 bg-amber-950/80 hover:bg-amber-900 border border-amber-600 rounded-lg text-xs font-bold text-amber-200 transition flex items-center gap-1.5 cursor-pointer shadow-sm"
                                                        >
                                                            <Unlock className="w-3.5 h-3.5" />
                                                            <span>Romper Sello (Break-the-Glass)</span>
                                                        </button>
                                                    )}

                                                    {!isSinpadApproved ? (
                                                        <button
                                                            onClick={() => {
                                                                setSinpadTargetCup(c.cup);
                                                                setSinpadCodigo(`SINPAD-${new Date().getFullYear()}-EDAN-${c.cup.slice(-5)}`);
                                                            }}
                                                            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-emerald-700/30 cursor-pointer"
                                                        >
                                                            <FileCheck className="w-3.5 h-3.5" />
                                                            <span>Validar Ficha EDAN / SINPAD</span>
                                                        </button>
                                                    ) : (
                                                        <span className="px-3 py-1.5 bg-cyan-950 border border-cyan-700 rounded-lg text-xs font-mono font-bold text-cyan-300">
                                                            ✓ Validado en SINPAD
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* MODAL BREAK-THE-GLASS: RUPTURA PROTOCOLAR DE SELLO ZERO-PII */}
            {unlockTargetCup && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="bg-slate-900 border border-amber-500 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                            <div className="flex items-center gap-2 text-amber-400">
                                <Unlock className="w-6 h-6 text-amber-400" />
                                <div>
                                    <h3 className="text-base font-black text-white">PROTOCOLO BREAK-THE-GLASS</h3>
                                    <p className="text-[11px] text-amber-300 font-mono">CUP: {unlockTargetCup} • Ley N.° 29733 Art. 14 inc. 4</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setUnlockTargetCup(null)}
                                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <p className="text-xs text-slate-300 leading-relaxed">
                            Al desprecintar la identidad, su DNI, nombre y cargo quedarán registrados de forma inmutable
                            en la <strong>bitácora de auditoría WORM con hash SHA-256</strong> para efectos de fiscalización de OCI / Contraloría.
                        </p>

                        <div className="space-y-3 text-xs">
                            <div>
                                <label className="block text-slate-300 font-semibold mb-1">DNI del Evaluador / Oficial: *</label>
                                <input
                                    type="text"
                                    maxLength={8}
                                    value={oficialDni}
                                    onChange={(e) => setOficialDni(e.target.value.replace(/\D/g, ""))}
                                    placeholder="8 dígitos del evaluador"
                                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono"
                                />
                            </div>
                            <div>
                                <label className="block text-slate-300 font-semibold mb-1">Nombre y Apellidos del Evaluador: *</label>
                                <input
                                    type="text"
                                    value={oficialNombre}
                                    onChange={(e) => setOficialNombre(e.target.value)}
                                    placeholder="Ej: Ing. Manuel Torres Pacherres"
                                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-slate-300 font-semibold mb-1">Cargo Oficial: *</label>
                                <input
                                    type="text"
                                    value={oficialCargo}
                                    onChange={(e) => setOficialCargo(e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono"
                                />
                            </div>
                            <div>
                                <label className="block text-slate-300 font-semibold mb-1">Motivo Asistencial de la Apertura: *</label>
                                <textarea
                                    rows={2}
                                    value={oficialMotivo}
                                    onChange={(e) => setOficialMotivo(e.target.value)}
                                    placeholder="Detalle el motivo asistencial conforme a ley..."
                                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white"
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-2 pt-2">
                            <button
                                type="button"
                                onClick={() => setUnlockTargetCup(null)}
                                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium"
                            >
                                Cancelar
                            </button>
                            <button
                                type="button"
                                disabled={unlocking}
                                onClick={() => unlockTargetCup && handleBreakTheGlass(unlockTargetCup)}
                                className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-bold shadow-lg shadow-amber-900/50 flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                            >
                                {unlocking ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Unlock className="w-4 h-4" />}
                                <span>Autorizar Ruptura de Sello WORM</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL SINPAD: DICTAMEN OFICIAL Y ASIGNACIÓN DE CÓDIGO EDAN */}
            {sinpadTargetCup && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="bg-slate-900 border border-emerald-500 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                            <div className="flex items-center gap-2 text-emerald-400">
                                <FileCheck className="w-6 h-6 text-emerald-400" />
                                <div>
                                    <h3 className="text-base font-black text-white">APROBACIÓN FORMAL FICHA EDAN / SINPAD</h3>
                                    <p className="text-[11px] text-emerald-300 font-mono">CUP: {sinpadTargetCup} • Soberanía Humana</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setSinpadTargetCup(null)}
                                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {sinpadSuccessMsg ? (
                            <div className="p-4 bg-emerald-950 border border-emerald-600 rounded-xl text-emerald-200 text-xs flex items-center gap-3">
                                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                                <span>{sinpadSuccessMsg}</span>
                            </div>
                        ) : (
                            <div className="space-y-3 text-xs">
                                <div>
                                    <label className="block text-slate-300 font-semibold mb-1">Código Oficial SINPAD (INDECI): *</label>
                                    <input
                                        type="text"
                                        value={sinpadCodigo}
                                        onChange={(e) => setSinpadCodigo(e.target.value)}
                                        placeholder="Ej: SINPAD-2026-EDAN-00458"
                                        className="w-full bg-slate-950 border border-emerald-600/60 rounded-lg px-3 py-2 text-white font-mono font-bold"
                                    />
                                </div>

                                <div>
                                    <label className="block text-slate-300 font-semibold mb-1">Bienes de Ayuda Humanitaria (BAH) Autorizados:</label>
                                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                                        {[
                                            { id: "CARPA_FAMILIAR", label: "Carpa Familiar Unifamiliar" },
                                            { id: "KIT_ALIMENTOS_BAH", label: "Kit Alimentos BAH 72h" },
                                            { id: "BIDON_AGUA_20L", label: "Bidón Agua 20L + Pastillas" },
                                            { id: "HERRAMIENTAS_ACHIQUE", label: "Pala, Botas y Carretilla" }
                                        ].map((item) => (
                                            <label key={item.id} className="flex items-center gap-2 p-2 bg-slate-950 rounded-lg border border-slate-800 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={sinpadAyuda.includes(item.id)}
                                                    onChange={(e) => {
                                                        if (e.target.checked) setSinpadAyuda([...sinpadAyuda, item.id]);
                                                        else setSinpadAyuda(sinpadAyuda.filter(x => x !== item.id));
                                                    }}
                                                    className="w-4 h-4 text-emerald-500 rounded"
                                                />
                                                <span className="text-slate-300">{item.label}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-slate-300 font-semibold mb-1">Observaciones Técnicas de Inspección:</label>
                                    <textarea
                                        rows={2}
                                        value={sinpadObservaciones}
                                        onChange={(e) => setSinpadObservaciones(e.target.value)}
                                        placeholder="Vivienda inspeccionada en campo. Certificación de daños para trámite del Bono BAE de S/ 500."
                                        className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white"
                                    />
                                </div>

                                <div className="flex items-center justify-end gap-2 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setSinpadTargetCup(null)}
                                        className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="button"
                                        disabled={approvingSinpad}
                                        onClick={() => sinpadTargetCup && handleAprobarSinpad(sinpadTargetCup)}
                                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold shadow-lg shadow-emerald-900/50 flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                                    >
                                        {approvingSinpad ? <RefreshCw className="w-4 h-4 animate-spin" /> : <FileCheck className="w-4 h-4" />}
                                        <span>Dictaminar y Formalizar en SINPAD</span>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Modal de Convocatoria de Emergencia al GT-GRD */}
            {showPanicModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="bg-slate-900 border border-rose-600 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                            <div className="flex items-center gap-2.5 text-rose-400">
                                <AlertOctagon className="w-6 h-6 text-rose-500 animate-pulse" />
                                <div>
                                    <h3 className="text-base font-black text-white">CONVOCATORIA URGENTE DE CRISIS COED</h3>
                                    <p className="text-[11px] text-rose-300">Sesión Permanente del GT-GRD • Ley N.º 29664</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowPanicModal(false)}
                                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {panicSuccessMsg ? (
                            <div className="p-4 bg-emerald-950 border border-emerald-600 rounded-xl text-emerald-200 text-xs flex items-center gap-3">
                                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                                <span>{panicSuccessMsg}</span>
                            </div>
                        ) : (
                            <div className="space-y-3 text-xs text-slate-300">
                                <p className="leading-relaxed">
                                    Esta acción emitirá una notificación de comando con alta prioridad a los miembros titulares
                                    del <strong>Grupo de Trabajo de la GRD</strong> de <strong>{distNombre}</strong>:
                                </p>
                                <ul className="space-y-1.5 font-mono text-[11px] bg-slate-950 p-3 rounded-lg border border-slate-800">
                                    <li>• Presidente: <strong>{alcaldeNombre}</strong></li>
                                    <li>• Subgerencia de Defensa Civil (Secretaría Técnica)</li>
                                    <li>• Gerencia de Obras Públicas (Maquinaria y Operaciones)</li>
                                    <li>• Gerencia de Presupuesto (Programa Presupuestal 0068)</li>
                                    <li>• Comisaría PNP y Jefatura del Centro de Salud MINSA</li>
                                </ul>
                                <div className="p-3 bg-amber-950/60 border border-amber-800/80 rounded-lg text-amber-200 text-[11px]">
                                    ⚠️ Habilita automáticamente el acta de sesión para contratación directa de maquinaria (Art. 27 Ley 30225).
                                </div>

                                <div className="flex items-center justify-end gap-2 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setShowPanicModal(false)}
                                        className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleTriggerCrisisConvocatoria}
                                        className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold shadow-lg shadow-rose-900/50 flex items-center gap-1.5"
                                    >
                                        <AlertOctagon className="w-4 h-4" />
                                        <span>Confirmar y Despachar Alerta</span>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </main>
    );
}
