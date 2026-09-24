"use strict";
"use client";

import React, { useState, useEffect } from "react";
import {
    FileText,
    QrCode,
    Shield,
    CheckCircle2,
    Download,
    X,
    AlertTriangle,
    Building,
    UserCheck,
    Scale,
    Clock,
    Lock
} from "lucide-react";

interface DossierMeta {
    ubigeo: string;
    distrito: string;
    correlativo: string;
    sha256_hash: string;
    verify_url: string;
    nivel_alerta: string;
    lead_time: number;
    lluvia_extrema_mm: number;
    puentes_en_riesgo: number;
    tamanio_bytes: number;
    fecha_emision: string;
}

interface DossierExportModalProps {
    isOpen: boolean;
    onClose: () => void;
    ubigeo: string;
    distritoNombre: string;
    departamento?: string;
}

export default function DossierExportModal({
    isOpen,
    onClose,
    ubigeo,
    distritoNombre,
    departamento = "LIMA"
}: DossierExportModalProps) {
    const [alcalde, setAlcalde] = useState("Sr. Alcalde Distrital");
    const [secretario, setSecretario] = useState("Ing. Secretario Técnico GRD");
    const [cip, setCip] = useState("CIP Nº 189423 / Reg. CENEPRED Nº 0042");
    const [incluirResolucion, setIncluirResolucion] = useState(true);
    const [incluirCGR, setIncluirCGR] = useState(true);

    const [meta, setMeta] = useState<DossierMeta | null>(null);
    const [loadingMeta, setLoadingMeta] = useState(false);
    const [downloading, setDownloading] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    // Cargar metadatos previos cuando se abre el modal
    useEffect(() => {
        if (!isOpen || !ubigeo) return;

        let isMounted = true;
        setLoadingMeta(true);
        setErrorMsg(null);
        const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

        fetch(`${apiBase}/api/v4/reports/dossier-meta`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                ubigeo,
                alcalde,
                secretario,
                cip,
                incluir_resolucion: incluirResolucion
            })
        })
            .then(async (res) => {
                if (!res.ok) throw new Error("Error al obtener metadatos del dossier");
                return res.json();
            })
            .then((data) => {
                if (isMounted) setMeta(data);
            })
            .catch((err) => {
                if (isMounted) setErrorMsg("No se pudo contactar al motor PDF. Asegúrese de que el backend esté activo.");
            })
            .finally(() => {
                if (isMounted) setLoadingMeta(false);
            });

        return () => {
            isMounted = false;
        };
    }, [isOpen, ubigeo]);

    if (!isOpen) return null;

    const handleDownloadPDF = async () => {
        setDownloading(true);
        setErrorMsg(null);
        const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

        try {
            const res = await fetch(`${apiBase}/api/v4/reports/dossier-pdf`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ubigeo,
                    alcalde,
                    secretario,
                    cip,
                    incluir_resolucion: incluirResolucion
                })
            });

            if (!res.ok) throw new Error("Fallo en la compilación del archivo PDF oficial.");

            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `Dossier_Ejecutivo_${ubigeo}_${distritoNombre.replace(/\s+/g, "_")}.pdf`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        } catch (err: any) {
            setErrorMsg(err.message || "Error al descargar el PDF");
        } finally {
            setDownloading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
            <div className="bg-slate-900 border border-slate-700 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
                {/* Header del Modal */}
                <div className="px-6 py-4 bg-gradient-to-r from-red-950 via-slate-900 to-slate-900 border-b border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-400">
                            <FileText className="w-5 h-5" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="text-base font-bold text-white">
                                    Generador de Dossier Ejecutivo Oficial en PDF
                                </h3>
                                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/30">
                                    FASE 4 • C2
                                </span>
                            </div>
                            <p className="text-xs text-slate-400">
                                Informe Técnico Vinculante con Sello QR SHA-256 y Vistos AMARU-LEX para Contratación Directa
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Cuerpo del Modal con Scroll */}
                <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-300 divide-y divide-slate-800/80">
                    {/* Tarjeta de Metadatos del Documento y Sello QR */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                            <span className="text-[10px] uppercase font-bold text-slate-500 block">Distrito / Ubigeo</span>
                            <div className="text-sm font-bold text-white">{distritoNombre}</div>
                            <div className="text-[11px] text-slate-400 font-mono">UBIGEO: {ubigeo}</div>
                        </div>

                        <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                            <span className="text-[10px] uppercase font-bold text-slate-500 block">Correlativo Oficial</span>
                            <div className="text-xs font-mono font-bold text-amber-400">
                                {loadingMeta ? "Generando..." : meta?.correlativo || "0918-2026-MD/GGRD"}
                            </div>
                            <div className="text-[10px] text-slate-400">Foliación Administrativa</div>
                        </div>

                        <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                            <span className="text-[10px] uppercase font-bold text-slate-500 block">Sello QR Criptográfico</span>
                            <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-xs">
                                <Lock className="w-3.5 h-3.5" />
                                <span>SHA-256 Activo</span>
                            </div>
                            <div className="text-[9px] font-mono text-slate-500 truncate" title={meta?.sha256_hash}>
                                {meta ? `${meta.sha256_hash.substring(0, 16)}...` : "Calculando hash..."}
                            </div>
                        </div>
                    </div>

                    {/* Resumen Físico y Legal */}
                    <div className="pt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-3.5 rounded-xl bg-red-950/20 border border-red-900/40 space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="font-bold text-red-300 flex items-center gap-1.5">
                                    <AlertTriangle className="w-4 h-4 text-red-400" />
                                    <span>Amenaza FEN Identificada</span>
                                </span>
                                <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-red-600 text-white">
                                    {meta?.nivel_alerta || "ALERTA"}
                                </span>
                            </div>
                            <ul className="space-y-1 text-slate-300 text-[11px]">
                                <li>• <strong>Lead Time:</strong> {meta?.lead_time || 48} horas para impacto principal.</li>
                                <li>• <strong>Lluvia Extrema Proyectada:</strong> {meta?.lluvia_extrema_mm || 0} mm/24h.</li>
                                <li>• <strong>Puentes en Riesgo (CAF):</strong> {meta?.puentes_en_riesgo || 0} estructuras vulnerables.</li>
                            </ul>
                        </div>

                        <div className="p-3.5 rounded-xl bg-blue-950/20 border border-blue-900/40 space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="font-bold text-blue-300 flex items-center gap-1.5">
                                    <Scale className="w-4 h-4 text-blue-400" />
                                    <span>Blindaje Legal AMARU-LEX</span>
                                </span>
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-600/30 text-blue-300 border border-blue-500/30">
                                    Ley 30225 Art. 27
                                </span>
                            </div>
                            <ul className="space-y-1 text-slate-300 text-[11px]">
                                <li>• <strong>Amparo:</strong> D.S. Nº 124-2026-PCM (Peligro Inminente).</li>
                                <li>• <strong>Facultad:</strong> Contratación Directa de maquinaria pesada y diésel.</li>
                                <li>• <strong>Regularización SEACE:</strong> Plazo máximo de 10 días hábiles.</li>
                            </ul>
                        </div>
                    </div>

                    {/* Formulario de Suscripción Oficial */}
                    <div className="pt-4 space-y-3">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-white uppercase tracking-wider">
                            <UserCheck className="w-4 h-4 text-amber-400" />
                            <span>Datos para la Suscripción y Postfirmas Oficiales</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                                    Alcalde Distrital (Pres. Plataforma GRD)
                                </label>
                                <input
                                    type="text"
                                    value={alcalde}
                                    onChange={(e) => setAlcalde(e.target.value)}
                                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:border-amber-500 focus:outline-none transition"
                                />
                            </div>

                            <div>
                                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                                    Secretario Técnico de Defensa Civil
                                </label>
                                <input
                                    type="text"
                                    value={secretario}
                                    onChange={(e) => setSecretario(e.target.value)}
                                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:border-amber-500 focus:outline-none transition"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                                    Matrícula Profesional CIP y Registro CENEPRED
                                </label>
                                <input
                                    type="text"
                                    value={cip}
                                    onChange={(e) => setCip(e.target.value)}
                                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:border-amber-500 focus:outline-none transition"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Checkboxes de Componentes Incluidos */}
                    <div className="pt-4 space-y-2">
                        <label className="flex items-center gap-2.5 cursor-pointer select-none">
                            <input
                                type="checkbox"
                                checked={incluirResolucion}
                                onChange={(e) => setIncluirResolucion(e.target.checked)}
                                className="w-4 h-4 rounded text-red-600 bg-slate-950 border-slate-700 focus:ring-red-500"
                            />
                            <span className="text-xs text-slate-300">
                                Anexar Proyecto de Resolución de Alcaldía de Contratación Directa de Emergencia
                            </span>
                        </label>

                        <label className="flex items-center gap-2.5 cursor-pointer select-none">
                            <input
                                type="checkbox"
                                checked={incluirCGR}
                                onChange={(e) => setIncluirCGR(e.target.checked)}
                                className="w-4 h-4 rounded text-red-600 bg-slate-950 border-slate-700 focus:ring-red-500"
                            />
                            <span className="text-xs text-slate-300">
                                Incluir Anexo de Control Preventivo Concurrente (Informe Nº 10671-2026-CG/AGR-SOP CGR)
                            </span>
                        </label>
                    </div>

                    {errorMsg && (
                        <div className="p-3 rounded-lg bg-red-950/50 border border-red-800 text-red-300 text-xs flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
                            <span>{errorMsg}</span>
                        </div>
                    )}
                </div>

                {/* Footer de Acciones */}
                <div className="px-6 py-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-slate-400 text-[11px]">
                        <Clock className="w-3.5 h-3.5 text-slate-500" />
                        <span>Tiempo estimado de compilación: &lt; 1.5 segundos</span>
                    </div>

                    <div className="flex items-center gap-2.5">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition"
                        >
                            Cancelar
                        </button>

                        <button
                            id="btn-confirm-download-pdf"
                            onClick={handleDownloadPDF}
                            disabled={downloading}
                            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-xs font-bold text-white shadow-lg shadow-red-700/30 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {downloading ? (
                                <>
                                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    <span>Compilando PDF Oficial...</span>
                                </>
                            ) : (
                                <>
                                    <Download className="w-4 h-4" />
                                    <span>Generar y Descargar PDF Oficial</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
