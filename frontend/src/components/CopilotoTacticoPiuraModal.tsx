"use client";

import React, { useState } from "react";
import {
    Sparkles,
    Send,
    ShieldCheck,
    Waves,
    Radio,
    Building2,
    ExternalLink,
    AlertTriangle,
    Copy,
    Check,
    Printer,
    FileText,
    Activity,
    Landmark,
    MessageSquare,
    Truck,
    Clock,
    X
} from "lucide-react";

interface CopilotoTacticoModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialUbigeo?: string;
}

export default function CopilotoTacticoPiuraModal({
    isOpen,
    onClose,
    initialUbigeo = "200101"
}: CopilotoTacticoModalProps) {
    const [pregunta, setPregunta] = useState("");
    const [cargando, setCargando] = useState(false);
    const [resultado, setResultado] = useState<any>(null);
    const [copied, setCopied] = useState(false);

    const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

    const SUGERENCIAS = [
        "¿Cuál es el umbral de lluvia y caudal crítico para evacuar El Tallán?",
        "¿A cuántos m³/s colapsa el dique de Pedregal Chico en Catacaos y dónde evacúo?",
        "¿Qué motobombas y línea de descarga tiene la cuenca ciega El Golf?",
        "¿Puedo contratar alquiler de maquinaria pesada hoy bajo el D.S. 124 sin licitación?",
        "¿Qué dice el plan sobre habilitar camas UVICLIN en postas I-3 y I-4?"
    ];

    const consultarIA = async (textoPregunta: string) => {
        if (!textoPregunta.trim()) return;
        setCargando(true);
        setResultado(null);
        try {
            const res = await fetch(`${API_BASE}/api/v1/piura/asistente-ia`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    pregunta: textoPregunta,
                    ubigeo: initialUbigeo
                })
            });
            if (res.ok) {
                const data = await res.json();
                setResultado(data);
            } else {
                setResultado({
                    respuesta_tactica: "Error al conectar con el servidor táctico. Por favor intente nuevamente.",
                    telemetria_utilizada: null,
                    fuentes_documentales: []
                });
            }
        } catch (e) {
            console.error("Error consultando al copiloto:", e);
            setResultado({
                respuesta_tactica: "Error de red. Verifique que el servicio backend esté activo en el puerto 8000.",
                telemetria_utilizada: null,
                fuentes_documentales: []
            });
        } finally {
            setCargando(false);
        }
    };

    const handleCopy = () => {
        if (!resultado?.respuesta_tactica) return;
        navigator.clipboard.writeText(resultado.respuesta_tactica);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
            <div className="relative w-full max-w-4xl max-h-[92vh] bg-slate-900 border-2 border-emerald-500/40 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
                {/* ENCABEZADO C2 */}
                <div className="bg-gradient-to-r from-emerald-950/90 via-slate-900 to-indigo-950/90 px-6 py-4 border-b border-emerald-500/30 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-inner">
                            <Sparkles className="w-6 h-6 animate-pulse" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                                    AMARU COPILOTO TÁCTICO FEN
                                </span>
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                                    VERTEX AI SEARCH + TELEMETRÍA VIVA
                                </span>
                            </div>
                            <h2 className="text-lg font-black text-white tracking-tight mt-0.5">
                                Asistente Táctico para Alcaldes y Grupos de Trabajo GRD de Piura
                            </h2>
                        </div>
                    </div>

                    <button
                        onClick={onClose}
                        className="p-2 rounded-xl bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* BARRA DE TELEMETRÍA EN VIVO ACTUAL */}
                <div className="bg-slate-950 px-6 py-2.5 border-b border-slate-800/80 grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                    <div className="flex items-center gap-2">
                        <Waves className="w-4 h-4 text-cyan-400" />
                        <div>
                            <span className="text-[10px] text-slate-500 block leading-tight">CAUDAL PUENTE SÁNCHEZ CERRO</span>
                            <span className="font-bold text-cyan-300">1,790 m³/s <span className="text-[10px] text-emerald-400">(+55 m³/h)</span></span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Radio className="w-4 h-4 text-amber-400" />
                        <div>
                            <span className="text-[10px] text-slate-500 block leading-tight">RADAR DOPPLER PIURA</span>
                            <span className="font-bold text-amber-300">Convección Cuenca Alta</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Activity className="w-4 h-4 text-emerald-400" />
                        <div>
                            <span className="text-[10px] text-slate-500 block leading-tight">CUENCAS CIEGAS SARE</span>
                            <span className="font-bold text-emerald-300">96 Catastradas (18 Bombas)</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Landmark className="w-4 h-4 text-purple-400" />
                        <div>
                            <span className="text-[10px] text-slate-500 block leading-tight">SALDO PP 0068 DISPONIBLE</span>
                            <span className="font-bold text-purple-300">S/ 345,000 (SIAF MEF)</span>
                        </div>
                    </div>
                </div>

                {/* CUERPO DEL ASISTENTE */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {/* RESULTADO DE LA CONSULTA */}
                    {cargando ? (
                        <div className="p-12 text-center bg-slate-950/60 rounded-xl border border-slate-800">
                            <Sparkles className="w-10 h-10 text-emerald-400 animate-spin mx-auto mb-3" />
                            <h3 className="text-base font-bold text-white">Consultando la Telemetría en Vivo y los 79 Planes Oficiales...</h3>
                            <p className="text-xs text-slate-400 mt-1 max-w-lg mx-auto">
                                Cruzando el aforo de ANA en Sánchez Cerro, reflectividad del Radar SENAMHI, las 96 cuencas ciegas y el D.S. 124-2026-PCM en Vertex AI Search.
                            </p>
                        </div>
                    ) : resultado ? (
                        <div className="space-y-4">
                            {/* ACCIONES DE COPIAR / IMPRIMIR */}
                            <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs">
                                <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                                    <ShieldCheck className="w-4 h-4" />
                                    Fundamentado en Planes Oficiales & Telemetría Viva de Piura
                                </span>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={handleCopy}
                                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
                                    >
                                        {copied ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                                        {copied ? "Copiado!" : "Copiar Telegram C2"}
                                    </button>
                                    <button
                                        onClick={() => window.print()}
                                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
                                    >
                                        <Printer className="w-3.5 h-3.5 text-emerald-400" />
                                        Imprimir
                                    </button>
                                </div>
                            </div>

                            {/* CAJA DE TEXTO TÁCTICO */}
                            <div className="bg-slate-950 border border-emerald-500/30 rounded-xl p-5 text-xs text-slate-200 leading-relaxed font-mono whitespace-pre-line shadow-inner">
                                {resultado.respuesta_tactica}
                            </div>

                            {/* FUENTES Y DOCUMENTOS CITADOS */}
                            {resultado.fuentes_documentales && resultado.fuentes_documentales.length > 0 && (
                                <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                                        Documentos Oficiales Indexados en data/ y Consultados:
                                    </span>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                        {resultado.fuentes_documentales.map((f: any, idx: number) => (
                                            <div key={idx} className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-[11px]">
                                                <div className="font-bold text-white line-clamp-1">{f.titulo}</div>
                                                <div className="text-emerald-400 text-[10px] mt-0.5">{f.acto_resolutivo || f.entidad}</div>
                                                <div className="text-slate-500 text-[10px] truncate mt-0.5 font-mono">{f.archivo_fuente}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        /* ESTADO INICIAL / SUGERENCIAS */
                        <div className="space-y-4">
                            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300">
                                <span className="font-bold text-white block mb-1">
                                    ¿Cómo funciona el Copiloto Táctico AMARU para los Alcaldes?
                                </span>
                                Formule cualquier pregunta operativa sobre caudales, motobombas, albergues de evacuación o contratación de emergencia. El sistema cruzará en 5 segundos los <strong>79 planes oficiales de sus carpetas locales</strong> con la <strong>telemetría en tiempo real</strong> de SENAMHI, ANA y COED Social.
                            </div>

                            <div>
                                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                                    Consultas Tácticas Recomendadas para Probar:
                                </span>
                                <div className="space-y-2">
                                    {SUGERENCIAS.map((sug, i) => (
                                        <button
                                            key={i}
                                            onClick={() => {
                                                setPregunta(sug);
                                                consultarIA(sug);
                                            }}
                                            className="w-full p-3 rounded-xl bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800 hover:border-emerald-500/40 text-left text-xs text-slate-300 hover:text-white transition-all flex items-center justify-between group"
                                        >
                                            <span className="flex items-center gap-2">
                                                <MessageSquare className="w-3.5 h-3.5 text-emerald-400 group-hover:scale-110 transition-transform" />
                                                {sug}
                                            </span>
                                            <span className="text-[10px] text-emerald-400 opacity-0 group-hover:opacity-100 font-semibold transition-opacity">
                                                Consultar →
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* BARRA DE INPUT INFERIOR */}
                <div className="p-4 bg-slate-950 border-t border-slate-800">
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            consultarIA(pregunta);
                        }}
                        className="flex items-center gap-2"
                    >
                        <input
                            type="text"
                            placeholder="Escriba su consulta táctica (ej: ¿Dónde evacúo Sinchao Grande a más de 1,850 m³/s?)..."
                            value={pregunta}
                            onChange={(e) => setPregunta(e.target.value)}
                            className="flex-1 bg-slate-900 border border-slate-800 focus:border-emerald-500 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none transition-colors"
                        />
                        <button
                            type="submit"
                            disabled={cargando || !pregunta.trim()}
                            className="px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold transition-all shadow-lg shadow-emerald-950/60 flex items-center gap-2 whitespace-nowrap"
                        >
                            <Send className="w-4 h-4" />
                            <span>Consultar Copiloto</span>
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
