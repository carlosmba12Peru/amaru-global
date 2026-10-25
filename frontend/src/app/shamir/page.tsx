"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
    ShieldCheck,
    ShieldAlert,
    Lock,
    Key,
    Database,
    FileCheck2,
    Activity,
    CheckCircle2,
    XCircle,
    AlertTriangle,
    Eye,
    EyeOff,
    RefreshCw,
    ExternalLink,
    Scale,
    Cpu,
    Smartphone,
    Building2,
    QrCode,
    Sparkles,
    UserCheck,
    ArrowRight,
    Terminal,
    Fingerprint,
    Landmark
} from "lucide-react";
import { API_BASE } from "@/config/api";

interface ShamirCase {
    cup: string;
    ubigeo: string;
    distrito: string;
    departamento: string;
    sector: string;
    created_at: string;
    status: string;
    shares_disponibles: {
        indeci: string;
        anpd: string;
        damnificado: string;
    };
}

interface ShareDetail {
    role: string;
    x: number;
    tag: string;
    token: string;
    custodia: string;
    estado: string;
}

interface CaseDetail {
    cup: string;
    ubigeo: string;
    distrito: string;
    departamento: string;
    sector: string;
    created_at: string;
    status: string;
    shares: {
        share_1_indeci: ShareDetail;
        share_2_anpd: ShareDetail;
        share_3_damnificado: ShareDetail;
    };
}

interface ReconstructionResult {
    status: "AUTORIZADO" | "RECHAZADO" | "ERROR";
    cup?: string;
    flujo?: string;
    concurrencia?: string[];
    purga_ram_ms?: number;
    mensaje?: string;
    shares_detectados?: number;
    shares_requeridos?: number;
    pii_desprecintada?: {
        dni: string;
        nombres: string;
        apellidos: string;
        edad: number;
        telefono: string;
        danio: string;
        direccion: string;
        bono_bae: string;
        miembros_familia: number;
        menores_edad: number;
    };
    auditoria_worm?: {
        token_auditoria: string;
        sello_tiempo: string;
        norma_amparo: string;
    };
}

export default function ShamirVaultPage() {
    const [cases, setCases] = useState<ShamirCase[]>([]);
    const [selectedCup, setSelectedCup] = useState<string>("CUP-DAMN-200105-8F4C2A");
    const [caseDetail, setCaseDetail] = useState<CaseDetail | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [reconstructing, setReconstructing] = useState<boolean>(false);

    // Selección de shares aportados para la reconstrucción
    const [selectedShares, setSelectedShares] = useState<{ [key: string]: boolean }>({
        share_1: true,
        share_2: false,
        share_3: true
    });

    const [operadorId, setOperadorId] = useState<string>("OFICIAL_COEL_PIURA_04");
    const [motivo, setMotivo] = useState<string>("ENTREGA_KIT_HUMANITARIO_BAE_PRESENCIAL");
    const [result, setResult] = useState<ReconstructionResult | null>(null);
    const [auditLog, setAuditLog] = useState<any[]>([]);

    // Cargar casos
    const loadCases = async () => {
        try {
            setLoading(true);
            const res = await fetch(`${API_BASE}/api/v1/shamir/cases`);
            if (res.ok) {
                const data = await res.json();
                setCases(data.cases || []);
                if (data.cases && data.cases.length > 0 && !selectedCup) {
                    setSelectedCup(data.cases[0].cup);
                }
            }
        } catch (e) {
            console.error("Error al cargar casos de la bóveda Shamir:", e);
        } finally {
            setLoading(false);
        }
    };

    // Cargar detalle del caso seleccionado
    const loadCaseDetail = async (cup: string) => {
        if (!cup) return;
        try {
            const res = await fetch(`${API_BASE}/api/v1/shamir/cases/${cup}`);
            if (res.ok) {
                const data = await res.json();
                setCaseDetail(data.case);
                setResult(null);
            }
        } catch (e) {
            console.error("Error al cargar detalle del caso:", e);
        }
    };

    // Cargar bitácora WORM
    const loadAudit = async () => {
        try {
            const res = await fetch(`${API_BASE}/api/v1/shamir/audit`);
            if (res.ok) {
                const data = await res.json();
                setAuditLog(data.audit_log || []);
            }
        } catch (e) {
            console.error("Error al cargar auditoría WORM:", e);
        }
    };

    useEffect(() => {
        loadCases();
        loadAudit();
    }, []);

    useEffect(() => {
        if (selectedCup) {
            loadCaseDetail(selectedCup);
        }
    }, [selectedCup]);

    // Ejecutar reconstrucción de secreto
    const handleReconstruct = async () => {
        if (!caseDetail) return;
        setReconstructing(true);
        setResult(null);

        const tokensToSubmit: string[] = [];
        if (selectedShares.share_1 && caseDetail.shares.share_1_indeci) {
            tokensToSubmit.push(caseDetail.shares.share_1_indeci.token);
        }
        if (selectedShares.share_2 && caseDetail.shares.share_2_anpd) {
            tokensToSubmit.push(caseDetail.shares.share_2_anpd.token);
        }
        if (selectedShares.share_3 && caseDetail.shares.share_3_damnificado) {
            tokensToSubmit.push(caseDetail.shares.share_3_damnificado.token);
        }

        try {
            const res = await fetch(`${API_BASE}/api/v1/shamir/reconstruct`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    cup: selectedCup,
                    provided_shares: tokensToSubmit,
                    operador_id: operadorId,
                    motivo: motivo
                })
            });
            const data = await res.json();
            setResult(data);
            await loadAudit();
        } catch (e) {
            console.error("Error en reconstrucción Shamir:", e);
            setResult({
                status: "ERROR",
                mensaje: "Error de conexión o fallo interno del servicio criptográfico."
            });
        } finally {
            setReconstructing(false);
        }
    };

    const toggleShare = (shareKey: "share_1" | "share_2" | "share_3") => {
        setSelectedShares((prev) => ({
            ...prev,
            [shareKey]: !prev[shareKey]
        }));
    };

    const countSelected = Object.values(selectedShares).filter(Boolean).length;

    return (
        <div className="space-y-6 max-w-7xl mx-auto pb-12">
            {/* CABECERA TRIPARTITA SOVEREIGN SARA-STYLE */}
            <div className="bg-gradient-to-r from-slate-900 via-indigo-950/60 to-slate-900 border border-indigo-500/30 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-indigo-900/40 pb-4">
                    <div>
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 flex items-center gap-1.5 font-mono">
                                <Cpu className="w-3.5 h-3.5" />
                                BÓVEDA TRIPARTITA DE SHAMIR • (k=2, n=3)
                            </span>
                            <span className="px-2.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[11px] font-mono font-bold">
                                ZERO-PII ARCHITECTURE
                            </span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-purple-950 text-purple-300 border border-purple-800 font-bold">
                                LEY N.º 29733 &amp; ART. 14 INC. 4
                            </span>
                        </div>
                        <h1 className="text-xl md:text-2xl font-black text-white tracking-wide flex items-center gap-2">
                            CUSTODIA SEGURA DE FILIACIÓN SENSIBLE EN DESASTRES
                        </h1>
                        <p className="text-xs text-slate-300 mt-1 max-w-3xl">
                            Aislamiento criptográfico estricto para erradicar padrones fantasma y filtraciones de PII.
                            La reconstrucción de la identidad sólo es matemáticamente posible con el quórum de <strong>2 de los 3 fragmentos</strong>,
                            garantizando que ninguna entidad por sí sola pueda vigilar o alterar los datos.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <Link
                            href="/edan"
                            className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition"
                        >
                            <FileCheck2 className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Padrón EDAN</span>
                        </Link>
                        <Link
                            href="/auditoria"
                            className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition"
                        >
                            <Scale className="w-3.5 h-3.5 text-cyan-400" />
                            <span>Auditoría WORM</span>
                        </Link>
                        <button
                            onClick={() => { loadCases(); loadAudit(); if (selectedCup) loadCaseDetail(selectedCup); }}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition shadow-md shadow-indigo-600/30"
                        >
                            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
                            <span>Sincronizar</span>
                        </button>
                    </div>
                </div>

                {/* SELECTOR DE CASO EN LA BÓVEDA */}
                <div className="mt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-950/80 p-3 rounded-xl border border-slate-800">
                    <div className="flex items-center gap-2">
                        <Fingerprint className="w-4 h-4 text-indigo-400" />
                        <span className="text-xs font-bold text-slate-300">Expediente Ciego Activo:</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {cases.map((c) => (
                            <button
                                key={c.cup}
                                onClick={() => setSelectedCup(c.cup)}
                                className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition flex items-center gap-1.5 ${
                                    selectedCup === c.cup
                                        ? "bg-indigo-600 text-white border border-indigo-400 shadow-md"
                                        : "bg-slate-900 text-slate-400 border border-slate-800 hover:text-white"
                                }`}
                            >
                                <span>{c.cup}</span>
                                <span className="text-[10px] opacity-75">({c.distrito})</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* LAS 3 CONSOLAS TRIPARTITAS INSTITUCIONALES (SARA ARCHITECTURE) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {/* CONSOLA 1: INDECI / COEL */}
                <div className={`rounded-2xl border p-5 transition relative overflow-hidden flex flex-col justify-between ${
                    selectedShares.share_1
                        ? "bg-gradient-to-b from-blue-950/80 to-slate-950 border-blue-500/60 shadow-xl shadow-blue-950/50"
                        : "bg-slate-950/70 border-slate-800 opacity-80"
                }`}>
                    <div>
                        <div className="flex items-center justify-between border-b border-blue-900/40 pb-3">
                            <div className="flex items-center gap-2">
                                <div className="p-2 bg-blue-500/20 text-blue-400 rounded-xl border border-blue-500/40">
                                    <Building2 className="w-5 h-5" />
                                </div>
                                <div>
                                    <span className="text-[10px] font-mono uppercase tracking-wider text-blue-400 font-bold block">
                                        CONSOLA 1 • OPERADOR &amp; DESPACHO
                                    </span>
                                    <h2 className="text-sm font-black text-white">INDECI / COEL NACIONAL</h2>
                                </div>
                            </div>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800 font-bold">
                                SHARE 1 (x=1)
                            </span>
                        </div>

                        <div className="mt-4 space-y-3 text-xs">
                            <div className="bg-slate-950/90 p-3 rounded-xl border border-slate-800">
                                <span className="text-[10px] text-slate-400 block font-medium">Rol Institucional:</span>
                                <p className="text-white font-bold mt-0.5">
                                    Solicitante &amp; Centro de Distribución de Ayuda Humanitaria
                                </p>
                                <span className="text-[10px] text-blue-300 mt-1 block">
                                    Directiva N.º 001-2022-INDECI &amp; Bono BAE S/ 500
                                </span>
                            </div>

                            <div className="bg-slate-950/90 p-3 rounded-xl border border-slate-800 font-mono">
                                <span className="text-[10px] text-slate-400 block font-sans">Fragmento Shamir Criptográfico:</span>
                                <p className="text-blue-300 text-[11px] truncate mt-1 select-all" title={caseDetail?.shares.share_1_indeci?.token}>
                                    {caseDetail?.shares.share_1_indeci?.token || "SHAMIR-SHARE-1-INDECI-..."}
                                </p>
                                <span className="text-[10px] text-emerald-400 mt-1 flex items-center gap-1 font-sans">
                                    <CheckCircle2 className="w-3 h-3" /> Custodiado en HSM FIPS 140-3
                                </span>
                            </div>

                            <div className="bg-slate-950/90 p-3 rounded-xl border border-slate-800">
                                <span className="text-[10px] text-slate-400 block font-medium">Aislamiento Zero-PII:</span>
                                <p className="text-slate-300 text-[11px] mt-0.5">
                                    🔒 <strong>BLOQUEADO:</strong> INDECI no posee acceso directo a la PII del damnificado hasta la interpolación con un segundo share.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-5 pt-3 border-t border-slate-800">
                        <button
                            onClick={() => toggleShare("share_1")}
                            className={`w-full py-2.5 px-3 rounded-xl font-bold text-xs transition flex items-center justify-center gap-2 ${
                                selectedShares.share_1
                                    ? "bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30"
                                    : "bg-slate-900 hover:bg-slate-800 text-slate-400 border border-slate-800"
                            }`}
                        >
                            <Key className="w-3.5 h-3.5" />
                            <span>{selectedShares.share_1 ? "Share 1 Aportado (Activo)" : "Aportar Share 1 (INDECI)"}</span>
                        </button>
                    </div>
                </div>

                {/* CONSOLA 2: ANPD - MINJUSDH */}
                <div className={`rounded-2xl border p-5 transition relative overflow-hidden flex flex-col justify-between ${
                    selectedShares.share_2
                        ? "bg-gradient-to-b from-purple-950/80 to-slate-950 border-purple-500/60 shadow-xl shadow-purple-950/50"
                        : "bg-slate-950/70 border-slate-800 opacity-80"
                }`}>
                    <div>
                        <div className="flex items-center justify-between border-b border-purple-900/40 pb-3">
                            <div className="flex items-center gap-2">
                                <div className="p-2 bg-purple-500/20 text-purple-400 rounded-xl border border-purple-500/40">
                                    <Scale className="w-5 h-5" />
                                </div>
                                <div>
                                    <span className="text-[10px] font-mono uppercase tracking-wider text-purple-400 font-bold block">
                                        CONSOLA 2 • GARANTE TUTELAR
                                    </span>
                                    <h2 className="text-sm font-black text-white">ANPD - MINJUSDH</h2>
                                </div>
                            </div>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800 font-bold">
                                SHARE 2 (x=2)
                            </span>
                        </div>

                        <div className="mt-4 space-y-3 text-xs">
                            <div className="bg-slate-950/90 p-3 rounded-xl border border-slate-800">
                                <span className="text-[10px] text-slate-400 block font-medium">Marco Jurídico de Custodia:</span>
                                <p className="text-white font-bold mt-0.5">
                                    Autoridad Nacional de Protección de Datos Personales
                                </p>
                                <span className="text-[10px] text-purple-300 mt-1 block">
                                    Ley N.º 29733 (Art. 14 inc. 4: Riesgo Grave a la Salud o Vida)
                                </span>
                            </div>

                            <div className="bg-slate-950/90 p-3 rounded-xl border border-slate-800 font-mono">
                                <span className="text-[10px] text-slate-400 block font-sans">Fragmento de Resguardo Tutelar:</span>
                                <p className="text-purple-300 text-[11px] truncate mt-1 select-all" title={caseDetail?.shares.share_2_anpd?.token}>
                                    {caseDetail?.shares.share_2_anpd?.token || "SHAMIR-SHARE-2-ANPD-..."}
                                </p>
                                <span className="text-[10px] text-purple-400 mt-1 flex items-center gap-1 font-sans">
                                    <Lock className="w-3 h-3" /> Bóveda Aislada de Desbloqueo Extraordinario
                                </span>
                            </div>

                            <div className="bg-slate-950/90 p-3 rounded-xl border border-slate-800">
                                <span className="text-[10px] text-slate-400 block font-medium">Activación de Excepción:</span>
                                <p className="text-slate-300 text-[11px] mt-0.5">
                                    ⚠️ <strong>USO EXTRAORDINARIO:</strong> Se detona únicamente cuando el damnificado está inconsciente, fallecido o incomunicado físicamente en la zona de desastre.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-5 pt-3 border-t border-slate-800">
                        <button
                            onClick={() => toggleShare("share_2")}
                            className={`w-full py-2.5 px-3 rounded-xl font-bold text-xs transition flex items-center justify-center gap-2 ${
                                selectedShares.share_2
                                    ? "bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-600/30"
                                    : "bg-slate-900 hover:bg-slate-800 text-slate-400 border border-slate-800"
                            }`}
                        >
                            <Key className="w-3.5 h-3.5" />
                            <span>{selectedShares.share_2 ? "Share 2 Aportado (Excepción Activa)" : "Concurrir con Share 2 (ANPD)"}</span>
                        </button>
                    </div>
                </div>

                {/* CONSOLA 3: CIUDADANO DAMNIFICADO (PWA / QR) */}
                <div className={`rounded-2xl border p-5 transition relative overflow-hidden flex flex-col justify-between ${
                    selectedShares.share_3
                        ? "bg-gradient-to-b from-emerald-950/80 to-slate-950 border-emerald-500/60 shadow-xl shadow-emerald-950/50"
                        : "bg-slate-950/70 border-slate-800 opacity-80"
                }`}>
                    <div>
                        <div className="flex items-center justify-between border-b border-emerald-900/40 pb-3">
                            <div className="flex items-center gap-2">
                                <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/40">
                                    <Smartphone className="w-5 h-5" />
                                </div>
                                <div>
                                    <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-bold block">
                                        CONSOLA 3 • SOBERANÍA DEL TITULAR
                                    </span>
                                    <h2 className="text-sm font-black text-white">DAMNIFICADO TITULAR (PWA)</h2>
                                </div>
                            </div>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold">
                                SHARE 3 (x=3)
                            </span>
                        </div>

                        <div className="mt-4 space-y-3 text-xs">
                            <div className="bg-slate-950/90 p-3 rounded-xl border border-slate-800">
                                <span className="text-[10px] text-slate-400 block font-medium">Credencial Soberana Offline:</span>
                                <div className="flex items-center justify-between mt-1">
                                    <span className="text-white font-mono font-bold text-sm">
                                        {selectedCup}
                                    </span>
                                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/40 font-mono">
                                        OFFLINE-FIRST
                                    </span>
                                </div>
                                <span className="text-[10px] text-slate-400 mt-1 block">
                                    Sector: {caseDetail?.sector || "Viduque"}, {caseDetail?.distrito || "Catacaos"}
                                </span>
                            </div>

                            <div className="bg-slate-950/90 p-3 rounded-xl border border-slate-800 font-mono">
                                <span className="text-[10px] text-slate-400 block font-sans">Fragmento de Soberanía Personal:</span>
                                <p className="text-emerald-300 text-[11px] truncate mt-1 select-all" title={caseDetail?.shares.share_3_damnificado?.token}>
                                    {caseDetail?.shares.share_3_damnificado?.token || "SHAMIR-SHARE-3-DAMN-..."}
                                </p>
                                <span className="text-[10px] text-emerald-400 mt-1 flex items-center gap-1 font-sans">
                                    <QrCode className="w-3 h-3" /> Código QR en App Móvil / Tarjeta Física
                                </span>
                            </div>

                            <div className="bg-slate-950/90 p-3 rounded-xl border border-slate-800">
                                <span className="text-[10px] text-slate-400 block font-medium">Flujo Ordinario en Campo:</span>
                                <p className="text-slate-300 text-[11px] mt-0.5">
                                    ✅ <strong>ENTREGA SEGURA:</strong> Al presentar este QR al oficial de INDECI (Share 1 + Share 3), se desprecinta la orden de entrega sin intermediarios.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-5 pt-3 border-t border-slate-800">
                        <button
                            onClick={() => toggleShare("share_3")}
                            className={`w-full py-2.5 px-3 rounded-xl font-bold text-xs transition flex items-center justify-center gap-2 ${
                                selectedShares.share_3
                                    ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30"
                                    : "bg-slate-900 hover:bg-slate-800 text-slate-400 border border-slate-800"
                            }`}
                        >
                            <Key className="w-3.5 h-3.5" />
                            <span>{selectedShares.share_3 ? "Share 3 Aportado (Titular Presente)" : "Escanear Share 3 (Damnificado)"}</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* SECCIÓN DE INTERPOLACIÓN MATEMÁTICA Y DESPRECINTADO EN RAM */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full bg-indigo-500 animate-pulse" />
                        <h2 className="text-base font-bold text-white flex items-center gap-2">
                            <span>MOTOR DE INTERPOLACIÓN DE LAGRANGE EN CUERPO FINITO GF(p)</span>
                            <span className="text-xs font-mono font-normal text-indigo-300 bg-indigo-950 px-2 py-0.5 rounded border border-indigo-800">
                                Primo de 257 bits: p = 2^256 + 297
                            </span>
                        </h2>
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-slate-400">
                            Shares Seleccionados: <strong className={countSelected >= 2 ? "text-emerald-400" : "text-amber-400"}>{countSelected} / 3</strong> (Umbral k=2)
                        </span>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                    <div>
                        <label className="text-slate-400 block font-medium mb-1">Operador / Autoridad Solicitante:</label>
                        <input
                            type="text"
                            value={operadorId}
                            onChange={(e) => setOperadorId(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-indigo-500"
                        />
                    </div>
                    <div className="md:col-span-2">
                        <label className="text-slate-400 block font-medium mb-1">Motivo Legal / Operativo del Desprecintado:</label>
                        <input
                            type="text"
                            value={motivo}
                            onChange={(e) => setMotivo(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-indigo-500"
                        />
                    </div>
                </div>

                <div className="pt-2">
                    <button
                        onClick={handleReconstruct}
                        disabled={reconstructing}
                        className={`w-full py-3 px-4 rounded-xl font-bold text-sm transition flex items-center justify-center gap-2 shadow-xl ${
                            countSelected >= 2
                                ? "bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-600 hover:from-indigo-500 hover:to-blue-500 text-white shadow-indigo-600/30"
                                : "bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-700"
                        }`}
                    >
                        <RefreshCw className={`w-4 h-4 ${reconstructing ? "animate-spin" : ""}`} />
                        <span>
                            {reconstructing
                                ? "Interpolando en RAM volátil..."
                                : countSelected >= 2
                                    ? `Ejecutar Desprecintado de Umbral con ${countSelected} Shares (k=2)`
                                    : `Simular Intento con ${countSelected} Share (Incertidumbre Criptográfica)`}
                        </span>
                    </button>
                </div>

                {/* RESULTADO DEL DESPRECINTADO */}
                {result && (
                    <div className={`mt-4 rounded-2xl border p-5 transition font-mono ${
                        result.status === "AUTORIZADO"
                            ? "bg-slate-950 border-emerald-500/50 shadow-2xl shadow-emerald-950/40"
                            : "bg-slate-950 border-rose-500/50 shadow-2xl shadow-rose-950/40"
                    }`}>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                            <div className="flex items-center gap-2">
                                {result.status === "AUTORIZADO" ? (
                                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                                ) : (
                                    <XCircle className="w-5 h-5 text-rose-400" />
                                )}
                                <span className={`text-sm font-black tracking-wide ${
                                    result.status === "AUTORIZADO" ? "text-emerald-400" : "text-rose-400"
                                }`}>
                                    DICTAMEN: {result.status === "AUTORIZADO" ? "ACCESO AUTORIZADO EN MEMORIA RAM VOLÁTIL" : "ACCESO DENEGADO (QUÓRUM INSUFICIENTE)"}
                                </span>
                            </div>

                            <div className="flex items-center gap-2">
                                {result.status === "AUTORIZADO" && (
                                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded font-bold">
                                        ⚡ RAM PURGADA EN {result.purga_ram_ms} ms (&lt;50ms FIPS 140-3)
                                    </span>
                                )}
                                <span className="text-[10px] bg-slate-900 text-slate-400 border border-slate-800 px-2 py-0.5 rounded">
                                    {result.flujo || "INCERTIDUMBRE_TOTAL"}
                                </span>
                            </div>
                        </div>

                        {/* Detalle si fue RECHAZADO */}
                        {result.status === "RECHAZADO" && (
                            <div className="mt-3 space-y-2 text-xs">
                                <p className="text-rose-300">
                                    {result.mensaje}
                                </p>
                                <div className="bg-rose-950/30 p-3 rounded-xl border border-rose-900/40 text-[11px] text-slate-300 font-sans">
                                    <p>
                                        <strong>Fundamento Matemático de Seguridad:</strong> Un polinomio de grado 1 requiere estrictamente 2 puntos para interpolar el secreto $S$ en $x=0$.
                                        Con únicamente 1 fragmento ($k=1$), el valor de $S$ tiene exactamente la misma probabilidad entre los $p \approx 2^{256}$ valores posibles (Seguridad Perfecta de Shannon).
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Detalle si fue AUTORIZADO */}
                        {result.status === "AUTORIZADO" && result.pii_desprecintada && (
                            <div className="mt-4 space-y-4">
                                <div className="bg-emerald-950/20 border border-emerald-900/40 rounded-xl p-3 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-300 font-sans">
                                    <div className="flex items-center gap-2">
                                        <Sparkles className="w-4 h-4 text-emerald-400" />
                                        <span><strong>Concurrencia Validada:</strong> {result.concurrencia?.join(" + ")}</span>
                                    </div>
                                    <div className="text-[11px] text-emerald-400 font-mono">
                                        Amparo: {result.auditoria_worm?.norma_amparo}
                                    </div>
                                </div>

                                {/* Tarjeta de PII Desprecintada */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                                    <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800">
                                        <span className="text-slate-400 text-[10px] uppercase font-sans">DNI Titular:</span>
                                        <p className="text-white text-sm font-bold mt-0.5 font-mono">{result.pii_desprecintada.dni}</p>
                                    </div>
                                    <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800">
                                        <span className="text-slate-400 text-[10px] uppercase font-sans">Nombre Completo:</span>
                                        <p className="text-emerald-300 text-sm font-bold mt-0.5">{result.pii_desprecintada.nombres} {result.pii_desprecintada.apellidos}</p>
                                    </div>
                                    <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800">
                                        <span className="text-slate-400 text-[10px] uppercase font-sans">Evaluación de Daño:</span>
                                        <p className="text-rose-400 text-sm font-bold mt-0.5 font-mono">{result.pii_desprecintada.danio}</p>
                                    </div>
                                    <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800">
                                        <span className="text-slate-400 text-[10px] uppercase font-sans">Asignación Bono BAE:</span>
                                        <p className="text-cyan-300 text-sm font-bold mt-0.5 font-mono">{result.pii_desprecintada.bono_bae}</p>
                                    </div>
                                    <div className="sm:col-span-2 bg-slate-900/90 p-3 rounded-xl border border-slate-800">
                                        <span className="text-slate-400 text-[10px] uppercase font-sans">Dirección Registrada:</span>
                                        <p className="text-slate-200 mt-0.5">{result.pii_desprecintada.direccion}</p>
                                    </div>
                                    <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800">
                                        <span className="text-slate-400 text-[10px] uppercase font-sans">Carga Familiar:</span>
                                        <p className="text-white mt-0.5">{result.pii_desprecintada.miembros_familia} miembros ({result.pii_desprecintada.menores_edad} menores)</p>
                                    </div>
                                    <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800">
                                        <span className="text-slate-400 text-[10px] uppercase font-sans">Teléfono de Enlace:</span>
                                        <p className="text-white mt-0.5 font-mono">{result.pii_desprecintada.telefono}</p>
                                    </div>
                                </div>

                                <div className="bg-slate-950 p-3 rounded-xl border border-indigo-900/40 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400">
                                    <span>Token WORM Generado: <strong className="text-indigo-300">{result.auditoria_worm?.token_auditoria}</strong></span>
                                    <span>Sello Temporal: <strong className="text-white">{result.auditoria_worm?.sello_tiempo}</strong></span>
                                    <span className="text-emerald-400">🛡️ Cero escritura en disco duro (Zero-Disk Leakage)</span>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* BITÁCORA INMUTABLE WORM DE AUDITORÍA FORENSE */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2">
                        <Terminal className="w-4 h-4 text-emerald-400" />
                        <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                            BITÁCORA INMUTABLE DE AUDITORÍA CRIPTOGRÁFICA (WORM)
                        </h2>
                    </div>
                    <span className="text-[11px] text-slate-400 font-mono">
                        {auditLog.length} eventos registrados
                    </span>
                </div>

                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {auditLog.length === 0 ? (
                        <p className="text-xs text-slate-500 py-4 text-center font-mono">No hay eventos recientes en la bitácora WORM.</p>
                    ) : (
                        auditLog.map((log, idx) => (
                            <div
                                key={idx}
                                className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-[11px] font-mono flex flex-wrap items-center justify-between gap-2"
                            >
                                <div className="flex items-center gap-2">
                                    <span className="text-slate-500">{log.timestamp}</span>
                                    <span className="font-bold text-white">{log.cup}</span>
                                    <span className="text-indigo-400">({log.operador})</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                        log.resultado === "AUTORIZADO_RAM_VOLATIL"
                                            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                                            : "bg-rose-500/20 text-rose-400 border border-rose-500/40"
                                    }`}>
                                        {log.resultado}
                                    </span>
                                    {log.purga_ram_ms !== undefined && (
                                        <span className="text-slate-400 text-[10px]">
                                            {log.purga_ram_ms} ms
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
