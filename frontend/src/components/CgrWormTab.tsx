"use client";

import React, { useState, useEffect } from "react";
import { API_BASE } from "@/config/api";
import {
    Shield,
    CheckCircle2,
    AlertOctagon,
    RefreshCw,
    FileCheck2,
    Lock,
    Key,
    Clock,
    FileText,
    ExternalLink,
    ChevronDown,
    ChevronRight,
    Copy,
    Check,
    Download,
    Landmark,
    Search
} from "lucide-react";

interface BloqueWORM {
    index: number;
    timestamp: string;
    tipo_evento: string;
    actor_responsable: string;
    entidad_origen: string;
    datos_evento: any;
    payload_hash: string;
    prev_hash: string;
    block_hash: string;
    sello_tsa_rfc3161: string;
}

interface VerificacionIntegridad {
    valida: boolean;
    estado: string;
    total_bloques: number;
    bloque_mas_reciente: number;
    ultimo_block_hash: string;
    discrepancias: any[];
    marco_legal: string;
}

interface CertificadoCGR {
    certificado_id: string;
    fecha_emision: string;
    autoridad_emisora: string;
    dictamen_pericial: string;
    cadena_integra: boolean;
    total_eventos_auditados: number;
    desglose_operativo: Record<string, number>;
    raiz_merkle_vigente: string;
    declaracion_jurada_institucional: string;
}

export default function CgrWormTab() {
    const [ledger, setLedger] = useState<BloqueWORM[]>([]);
    const [verificacion, setVerificacion] = useState<VerificacionIntegridad | null>(null);
    const [certificado, setCertificado] = useState<CertificadoCGR | null>(null);
    const [cargando, setCargando] = useState<boolean>(true);
    const [auditando, setAuditando] = useState<boolean>(false);
    const [bloqueExpandido, setBloqueExpandido] = useState<number | null>(null);
    const [copiado, setCopiado] = useState<string | null>(null);
    const [modalCertificado, setModalCertificado] = useState<boolean>(false);

    const cargarLedgerYVerificar = async () => {
        try {
            setCargando(true);
            const [resLedger, resVerif, resCert] = await Promise.all([
                fetch(`${API_BASE}/api/v1/auditoria/cgr-worm/ledger?limite=100`),
                fetch(`${API_BASE}/api/v1/auditoria/cgr-worm/verificar`),
                fetch(`${API_BASE}/api/v1/auditoria/cgr-worm/certificado-cgr`)
            ]);

            if (resLedger.ok) {
                const data = await resLedger.json();
                setLedger(data.ledger || []);
            }
            if (resVerif.ok) {
                setVerificacion(await resVerif.json());
            }
            if (resCert.ok) {
                setCertificado(await resCert.json());
            }
        } catch (e) {
            console.error("Error cargando bitácora WORM:", e);
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => {
        cargarLedgerYVerificar();
    }, []);

    const auditarEnVivo = async () => {
        try {
            setAuditando(true);
            const res = await fetch(`${API_BASE}/api/v1/auditoria/cgr-worm/verificar`);
            if (res.ok) {
                const data = await res.json();
                setVerificacion(data);
            }
        } catch (e) {
            console.error("Error auditando cadena:", e);
        } finally {
            setAuditando(false);
        }
    };

    const copiarTexto = (txt: string, key: string) => {
        navigator.clipboard.writeText(txt);
        setCopiado(key);
        setTimeout(() => setCopiado(null), 2000);
    };

    const getBadgeEvento = (tipo: string) => {
        switch (tipo) {
            case "GENESIS_LEDGER_CGR":
                return "bg-slate-700/50 text-slate-300 border-slate-600";
            case "RATIFICACION_EDAN_DUAL_QUORUM":
                return "bg-emerald-500/20 text-emerald-300 border-emerald-500/40";
            case "DESBLOQUEO_ALMACEN_HORAS_0_2":
                return "bg-teal-500/20 text-teal-300 border-teal-500/40";
            case "DESPACHO_CONVOY_VRP":
                return "bg-sky-500/20 text-sky-300 border-sky-500/40";
            case "CONSTANCIA_OCI_CONCURRENTE":
                return "bg-purple-500/20 text-purple-300 border-purple-500/40";
            case "REPORTE_COMUNITARIO_SELLADO":
                return "bg-amber-500/20 text-amber-300 border-amber-500/40";
            default:
                return "bg-blue-500/20 text-blue-300 border-blue-500/40";
        }
    };

    return (
        <div className="space-y-6">
            {/* Cabecera CGR WORM */}
            <div className="bg-gradient-to-r from-purple-950/70 via-slate-900 to-slate-950 p-5 rounded-2xl border border-purple-800/40 shadow-xl">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-purple-500/20 border border-purple-500/40 text-purple-400 flex items-center justify-center shadow-lg">
                            <Lock className="w-6 h-6" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="text-lg font-bold text-white tracking-wide">
                                    Bitácora Inmutable WORM de Control Concurrente
                                </h3>
                                <span className="text-[10px] bg-purple-500/20 text-purple-300 font-mono px-2 py-0.5 rounded-full font-bold border border-purple-500/30">
                                    Ley N.° 31358 CGR
                                </span>
                            </div>
                            <p className="text-xs text-slate-400">
                                Registro Criptográfico Write-Once-Read-Many con encadenamiento SHA-256 para auditoría en tiempo real y no repudio estatal.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={auditarEnVivo}
                            disabled={auditando}
                            className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-lg shadow-emerald-950/40 transition disabled:opacity-50"
                        >
                            <RefreshCw className={`w-3.5 h-3.5 ${auditando ? "animate-spin" : ""}`} />
                            {auditando ? "Verificando Hashes..." : "Auditar Cadena CGR"}
                        </button>

                        <button
                            onClick={() => setModalCertificado(true)}
                            className="px-3.5 py-2 bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/40 text-purple-200 text-xs font-bold rounded-xl flex items-center gap-2 transition"
                        >
                            <FileCheck2 className="w-3.5 h-3.5" />
                            Certificado Pericial CGR
                        </button>
                    </div>
                </div>

                {/* Métricas y Estado Criptográfico */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-slate-800/80 text-xs">
                    <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800 flex items-center justify-between">
                        <div>
                            <span className="text-slate-400 block text-[11px]">Estado Criptográfico</span>
                            <span className="text-sm font-bold text-emerald-400 flex items-center gap-1.5 mt-0.5">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                                {verificacion?.valida ? "100% Válida / No Repudio" : "Verificando..."}
                            </span>
                        </div>
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    </div>

                    <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                        <span className="text-slate-400 block text-[11px]">Total Bloques Acuñados</span>
                        <span className="text-base font-bold text-white font-mono">{verificacion?.total_bloques || ledger.length}</span>
                    </div>

                    <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800 col-span-2">
                        <span className="text-slate-400 block text-[11px]">Raíz Merkle Vigente (Block Hash Cabeza)</span>
                        <span className="text-[11px] font-mono text-purple-300 truncate block mt-0.5">
                            {verificacion?.ultimo_block_hash || "Cargando..."}
                        </span>
                    </div>
                </div>
            </div>

            {/* Explorador de Bloques WORM en Cascada */}
            <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                        <Key className="w-4 h-4 text-purple-400" />
                        Cadena de Bloques CGR WORM (Orden Cronológico Inverso)
                    </h4>
                    <span className="text-xs text-slate-400 font-mono">
                        Protocolo SHA-256 Chained Hash Ledger
                    </span>
                </div>

                {cargando ? (
                    <div className="py-16 text-center text-slate-400 text-xs">
                        <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-purple-400" />
                        Cargando libro mayor inmutable...
                    </div>
                ) : (
                    <div className="space-y-3">
                        {ledger.map((b) => (
                            <div
                                key={b.index}
                                className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 hover:border-purple-600/40 transition space-y-2 text-xs"
                            >
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className="font-mono font-bold bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded text-[11px] border border-purple-500/30">
                                            Bloque #{b.index}
                                        </span>
                                        <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] border ${getBadgeEvento(b.tipo_evento)}`}>
                                            {b.tipo_evento}
                                        </span>
                                        <span className="text-slate-400 text-[11px]">
                                            por <strong className="text-white">{b.actor_responsable}</strong> ({b.entidad_origen})
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
                                        <Clock className="w-3.5 h-3.5 text-slate-500" />
                                        <span>{new Date(b.timestamp).toLocaleString()}</span>
                                    </div>
                                </div>

                                {/* Hashes de Encadenamiento */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[10px] font-mono bg-slate-900/80 p-2.5 rounded-lg border border-slate-800/60">
                                    <div className="flex items-center justify-between gap-2 overflow-hidden">
                                        <span className="text-slate-400 shrink-0">Block Hash:</span>
                                        <span className="text-purple-300 truncate">{b.block_hash}</span>
                                        <button
                                            onClick={() => copiarTexto(b.block_hash, `bh-${b.index}`)}
                                            className="text-slate-400 hover:text-white shrink-0"
                                        >
                                            {copiado === `bh-${b.index}` ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                                        </button>
                                    </div>

                                    <div className="flex items-center justify-between gap-2 overflow-hidden">
                                        <span className="text-slate-400 shrink-0">Prev Hash:</span>
                                        <span className="text-slate-400 truncate">{b.prev_hash}</span>
                                        <button
                                            onClick={() => copiarTexto(b.prev_hash, `ph-${b.index}`)}
                                            className="text-slate-400 hover:text-white shrink-0"
                                        >
                                            {copiado === `ph-${b.index}` ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                                        </button>
                                    </div>
                                </div>

                                {/* Inspector de Payload JSON */}
                                <div>
                                    <button
                                        onClick={() => setBloqueExpandido(bloqueExpandido === b.index ? null : b.index)}
                                        className="text-[11px] text-purple-400 hover:text-purple-300 flex items-center gap-1 font-medium transition"
                                    >
                                        {bloqueExpandido === b.index ? (
                                            <>
                                                <ChevronDown className="w-3.5 h-3.5" />
                                                Ocultar Datos del Evento
                                            </>
                                        ) : (
                                            <>
                                                <ChevronRight className="w-3.5 h-3.5" />
                                                Inspeccionar Datos del Evento Sellado
                                            </>
                                        )}
                                    </button>

                                    {bloqueExpandido === b.index && (
                                        <pre className="mt-2 p-3 bg-slate-900 rounded-lg text-[10px] font-mono text-emerald-300 overflow-x-auto border border-slate-800">
                                            {JSON.stringify(b.datos_evento, null, 2)}
                                        </pre>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Modal de Certificado Pericial Oficial CGR */}
            {modalCertificado && certificado && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-slate-900 border border-purple-500/50 rounded-2xl max-w-2xl w-full p-6 space-y-4 shadow-2xl text-slate-200">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                            <div className="flex items-center gap-2 text-white font-bold text-sm">
                                <Landmark className="w-5 h-5 text-purple-400" />
                                Dictamen Pericial CGR de Inmutabilidad WORM
                            </div>
                            <button
                                onClick={() => setModalCertificado(false)}
                                className="text-slate-400 hover:text-white text-xs px-2 py-1 rounded bg-slate-800"
                            >
                                Cerrar
                            </button>
                        </div>

                        <div className="space-y-3 text-xs leading-relaxed">
                            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
                                <div className="text-slate-400">Certificado ID: <strong className="text-white font-mono">{certificado.certificado_id}</strong></div>
                                <div className="text-slate-400">Autoridad Emisora: <strong className="text-white">{certificado.autoridad_emisora}</strong></div>
                                <div className="text-slate-400">Fecha de Emisión: <strong className="text-white">{new Date(certificado.fecha_emision).toLocaleString()}</strong></div>
                            </div>

                            <div className="bg-emerald-950/40 border border-emerald-600/40 p-3.5 rounded-xl text-emerald-200">
                                <div className="font-bold text-emerald-300 mb-1 flex items-center gap-1.5">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                    {certificado.dictamen_pericial}
                                </div>
                                <p className="text-[11px] text-emerald-300/90 italic">
                                    "{certificado.declaracion_jurada_institucional}"
                                </p>
                            </div>

                            <div>
                                <span className="font-bold text-white block mb-2">Desglose de Eventos Auditados ({certificado.total_eventos_auditados} bloques):</span>
                                <div className="grid grid-cols-2 gap-2 text-[11px]">
                                    {Object.entries(certificado.desglose_operativo).map(([k, v]) => (
                                        <div key={k} className="bg-slate-950 p-2 rounded border border-slate-800 flex justify-between">
                                            <span className="text-slate-400 truncate">{k}:</span>
                                            <span className="font-bold text-white font-mono">{v}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="pt-2 border-t border-slate-800 flex justify-end">
                                <button
                                    onClick={() => setModalCertificado(false)}
                                    className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs rounded-lg transition"
                                >
                                    Entendido y Conforme
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
