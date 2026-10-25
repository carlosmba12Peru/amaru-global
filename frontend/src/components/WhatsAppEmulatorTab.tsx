"use client";

import React, { useState, useEffect } from "react";
import { API_BASE } from "@/config/api";
import {
    MessageSquare,
    Send,
    Radio,
    RefreshCw,
    CheckCircle2,
    AlertTriangle,
    Shield,
    Users,
    MapPin,
    Clock,
    WifiOff,
    Wifi,
    Sparkles,
    Copy,
    Check,
    FileText
} from "lucide-react";

interface Plantilla {
    id: string;
    remitente: string;
    nombre_contacto: string;
    caserio: string;
    distrito: string;
    provincia: string;
    departamento: string;
    coordenadas: { lat: number; lng: number };
    mensaje: string;
    categoria_esperada: string;
    familias_estimadas: number;
}

interface MensajeComunitario {
    ticket_id: string;
    remitente: string;
    nombre_contacto: string;
    mensaje_original: string;
    caserio: string;
    distrito: string;
    timestamp: string;
    estado: string;
    nlp_analisis: {
        categoria: string;
        severidad: string;
        familias_estimadas: number;
        vulnerables: { ninos: number; ancianos: number; heridos: number };
        insumos_prioritarios: string[];
    };
    respuesta_automatica: string;
    bloque_worm_cgr?: string;
}

export default function WhatsAppEmulatorTab() {
    const [plantillas, setPlantillas] = useState<Plantilla[]>([]);
    const [mensajes, setMensajes] = useState<MensajeComunitario[]>([]);
    const [estadisticas, setEstadisticas] = useState<any>(null);
    const [cargando, setCargando] = useState<boolean>(true);
    const [enviando, setEnviando] = useState<boolean>(false);
    const [sincronizando, setSincronizando] = useState<boolean>(false);

    // Formulario de envío
    const [remitente, setRemitente] = useState<string>("+51 974 812 340");
    const [nombreContacto, setNombreContacto] = useState<string>("Sr. Santos Chiroque (Teniente Gobernador)");
    const [caserio, setCaserio] = useState<string>("Caserío Naranjo Alto");
    const [distrito, setDistrito] = useState<string>("Cura Mori");
    const [mensajeTexto, setMensajeTexto] = useState<string>(
        "URGENTE INDECI: El río Piura rompió el dique a las 5am. Caserío Naranjo Alto inundado con 1.20m de agua. 28 familias en los techos, 14 niños y 6 ancianos sin comida ni agua potable. Por favor envíen lanchas o helicóptero."
    );
    const [modoOffline, setModoOffline] = useState<boolean>(false);
    const [ultimoResultado, setUltimoResultado] = useState<any>(null);
    const [copiado, setCopiado] = useState<string | null>(null);

    const cargarDatos = async () => {
        try {
            setCargando(true);
            const [resPlantillas, resMensajes, resStats] = await Promise.all([
                fetch(`${API_BASE}/api/v1/comunidad/whatsapp/plantillas-rapidas`),
                fetch(`${API_BASE}/api/v1/comunidad/whatsapp/mensajes?limite=30`),
                fetch(`${API_BASE}/api/v1/comunidad/whatsapp/estadisticas`)
            ]);

            if (resPlantillas.ok) setPlantillas(await resPlantillas.json());
            if (resMensajes.ok) {
                const data = await resMensajes.json();
                setMensajes(data.mensajes || []);
            }
            if (resStats.ok) setEstadisticas(await resStats.json());
        } catch (e) {
            console.error("Error al cargar datos WhatsApp:", e);
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => {
        cargarDatos();
    }, []);

    const seleccionarPlantilla = (p: Plantilla) => {
        setRemitente(p.remitente);
        setNombreContacto(p.nombre_contacto);
        setCaserio(p.caserio);
        setDistrito(p.distrito);
        setMensajeTexto(p.mensaje);
    };

    const enviarMensaje = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!mensajeTexto.trim()) return;

        try {
            setEnviando(true);
            const payload = {
                remitente,
                mensaje: mensajeTexto,
                nombre_contacto: nombreContacto,
                caserio,
                distrito,
                modo_offline: modoOffline
            };

            const res = await fetch(`${API_BASE}/api/v1/comunidad/whatsapp/simular-envio`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                const data = await res.json();
                setUltimoResultado(data);
                cargarDatos();
            }
        } catch (e) {
            console.error("Error al enviar mensaje:", e);
        } finally {
            setEnviando(false);
        }
    };

    const sincronizarColaOffline = async () => {
        try {
            setSincronizando(true);
            const res = await fetch(`${API_BASE}/api/v1/comunidad/whatsapp/sincronizar-offline`, {
                method: "POST"
            });
            if (res.ok) {
                await cargarDatos();
            }
        } catch (e) {
            console.error("Error al sincronizar cola offline:", e);
        } finally {
            setSincronizando(false);
        }
    };

    const copiarTexto = (txt: string, key: string) => {
        navigator.clipboard.writeText(txt);
        setCopiado(key);
        setTimeout(() => setCopiado(null), 2000);
    };

    return (
        <div className="space-y-6">
            {/* Cabecera del Emulador */}
            <div className="bg-gradient-to-r from-emerald-950/70 via-slate-900 to-slate-950 p-5 rounded-2xl border border-emerald-800/40 shadow-xl">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shadow-lg">
                            <MessageSquare className="w-6 h-6" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="text-lg font-bold text-white tracking-wide">
                                    Emulador de Ingesta Comunitaria WhatsApp
                                </h3>
                                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-mono px-2 py-0.5 rounded-full font-bold border border-emerald-500/30">
                                    Meta Cloud / Twilio API
                                </span>
                            </div>
                            <p className="text-xs text-slate-400">
                                Recepción en tiempo real de llamadas de auxilio de Tenientes Gobernadores, comités de vasos de leche y agentes de campo.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {estadisticas?.mensajes_en_buffer_offline > 0 && (
                            <button
                                onClick={sincronizarColaOffline}
                                disabled={sincronizando}
                                className="px-3.5 py-2 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/50 text-amber-300 text-xs font-bold rounded-xl flex items-center gap-2 transition"
                            >
                                <RefreshCw className={`w-3.5 h-3.5 ${sincronizando ? "animate-spin" : ""}`} />
                                Sincronizar {estadisticas.mensajes_en_buffer_offline} Reportes Offline
                            </button>
                        )}
                        <button
                            onClick={cargarDatos}
                            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition border border-slate-700"
                            title="Recargar mensajes"
                        >
                            <RefreshCw className={`w-4 h-4 ${cargando ? "animate-spin" : ""}`} />
                        </button>
                    </div>
                </div>

                {/* Métricas rápidas */}
                {estadisticas && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-slate-800/80 text-xs">
                        <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                            <span className="text-slate-400 block text-[11px]">Total Reportes Ingeridos</span>
                            <span className="text-base font-bold text-white font-mono">{estadisticas.total_reportes_recibidos}</span>
                        </div>
                        <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                            <span className="text-slate-400 block text-[11px]">Severidad Crítica</span>
                            <span className="text-base font-bold text-rose-400 font-mono">{estadisticas.reportes_severidad_critica}</span>
                        </div>
                        <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                            <span className="text-slate-400 block text-[11px]">Familias en Auxilio</span>
                            <span className="text-base font-bold text-amber-300 font-mono">{estadisticas.total_familias_en_riesgo}</span>
                        </div>
                        <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                            <span className="text-slate-400 block text-[11px]">Buffer Store-and-Forward</span>
                            <span className="text-base font-bold text-sky-300 font-mono">{estadisticas.mensajes_en_buffer_offline} encolados</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Selector de Plantillas Rápidas de Campo */}
            <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                    Plantillas Operacionales de Campo (Caseríos Críticos FEN):
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                    {plantillas.map((p) => (
                        <div
                            key={p.id}
                            onClick={() => seleccionarPlantilla(p)}
                            className="bg-slate-900/70 hover:bg-slate-800/80 p-3 rounded-xl border border-slate-800 hover:border-emerald-600/50 cursor-pointer transition flex flex-col justify-between text-xs"
                        >
                            <div>
                                <div className="flex items-center justify-between mb-1.5">
                                    <span className="font-bold text-white">{p.caserio}</span>
                                    <span className="text-[10px] bg-slate-800 text-emerald-300 px-1.5 py-0.5 rounded font-mono">
                                        {p.distrito}
                                    </span>
                                </div>
                                <p className="text-[11px] text-slate-400 line-clamp-2 italic mb-2">
                                    "{p.mensaje}"
                                </p>
                            </div>
                            <div className="flex items-center justify-between pt-1 border-t border-slate-800/60 text-[10px] text-slate-400">
                                <span>{p.nombre_contacto.split("(")[0]}</span>
                                <span className="text-amber-400 font-medium">~{p.familias_estimadas} familias</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Split Screen: Formulario WhatsApp + Vista Teléfono Simulador */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Formulario de Emisión (7 cols) */}
                <div className="lg:col-span-7 bg-slate-900/60 p-5 rounded-2xl border border-slate-800 space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                        <h4 className="text-sm font-bold text-white flex items-center gap-2">
                            <Radio className="w-4 h-4 text-emerald-400" />
                            Consola de Despacho de Reporte Ciudadano
                        </h4>

                        {/* Switch Online / Offline */}
                        <button
                            type="button"
                            onClick={() => setModoOffline(!modoOffline)}
                            className={`px-3 py-1 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition border ${
                                modoOffline
                                    ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                                    : "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                            }`}
                        >
                            {modoOffline ? (
                                <>
                                    <WifiOff className="w-3.5 h-3.5 text-amber-400" />
                                    Modo Offline (Store-and-Forward)
                                </>
                            ) : (
                                <>
                                    <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                                    Enlace Satelital Directo (C4ISR Online)
                                </>
                            )}
                        </button>
                    </div>

                    <form onSubmit={enviarMensaje} className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                            <div>
                                <label className="block text-slate-400 mb-1 font-medium">Teléfono / WhatsApp Remitente:</label>
                                <input
                                    type="text"
                                    value={remitente}
                                    onChange={(e) => setRemitente(e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono focus:border-emerald-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-slate-400 mb-1 font-medium">Informante / Autoridad Comunal:</label>
                                <input
                                    type="text"
                                    value={nombreContacto}
                                    onChange={(e) => setNombreContacto(e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:border-emerald-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-slate-400 mb-1 font-medium">Caserío / Sector Afectado:</label>
                                <input
                                    type="text"
                                    value={caserio}
                                    onChange={(e) => setCaserio(e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:border-emerald-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-slate-400 mb-1 font-medium">Distrito:</label>
                                <input
                                    type="text"
                                    value={distrito}
                                    onChange={(e) => setDistrito(e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:border-emerald-500 outline-none"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-slate-400 text-xs mb-1 font-medium">Mensaje de Texto de Emergencia (Voz/Texto Ciudadano):</label>
                            <textarea
                                rows={4}
                                value={mensajeTexto}
                                onChange={(e) => setMensajeTexto(e.target.value)}
                                placeholder="Describa el evento, familias atrapadas, colapso de vías, niños/ancianos..."
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:border-emerald-500 outline-none leading-relaxed"
                            />
                        </div>

                        <div className="flex items-center justify-between pt-2">
                            <span className="text-[11px] text-slate-400 flex items-center gap-1.5">
                                <Shield className="w-3.5 h-3.5 text-emerald-400" />
                                Encriptación y sello WORM CGR automático al ingresar.
                            </span>

                            <button
                                type="submit"
                                disabled={enviando}
                                className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-lg shadow-emerald-950/40 transition disabled:opacity-50"
                            >
                                {enviando ? (
                                    <>
                                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                        Inyectando...
                                    </>
                                ) : (
                                    <>
                                        <Send className="w-3.5 h-3.5" />
                                        Emitir Reporte WhatsApp
                                    </>
                                )}
                            </button>
                        </div>
                    </form>

                    {/* Feedback del Último Mensaje Procesado */}
                    {ultimoResultado && (
                        <div className="mt-4 p-4 rounded-xl bg-slate-950 border border-emerald-800/40 text-xs space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                    {ultimoResultado.estado === "ENCOLADO_OFFLINE" ? "Reporte Encolado en Buffer Offline" : "Reporte Procesado por el Motor C4ISR"}
                                </span>
                                <span className="font-mono text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded">
                                    {ultimoResultado.ticket_id}
                                </span>
                            </div>

                            {ultimoResultado.registro?.nlp_analisis && (
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                                    <div>
                                        <span className="text-slate-400 block">Categoría:</span>
                                        <span className="font-semibold text-white">{ultimoResultado.registro.nlp_analisis.categoria}</span>
                                    </div>
                                    <div>
                                        <span className="text-slate-400 block">Severidad:</span>
                                        <span className="font-semibold text-rose-400">{ultimoResultado.registro.nlp_analisis.severidad}</span>
                                    </div>
                                    <div>
                                        <span className="text-slate-400 block">Familias:</span>
                                        <span className="font-semibold text-amber-300">{ultimoResultado.registro.nlp_analisis.familias_estimadas}</span>
                                    </div>
                                    <div>
                                        <span className="text-slate-400 block">Vulnerables:</span>
                                        <span className="font-semibold text-sky-300">
                                            {ultimoResultado.registro.nlp_analisis.vulnerables.ninos} niños | {ultimoResultado.registro.nlp_analisis.vulnerables.ancianos} ancianos
                                        </span>
                                    </div>
                                </div>
                            )}

                            {ultimoResultado.registro?.bloque_worm_cgr && (
                                <div className="text-[10px] font-mono text-slate-400 flex items-center gap-1.5 truncate">
                                    <Shield className="w-3 h-3 text-emerald-400 shrink-0" />
                                    <span>Sello WORM CGR:</span>
                                    <span className="text-emerald-300 truncate">{ultimoResultado.registro.bloque_worm_cgr}</span>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Vista Previa Smartphone WhatsApp (5 cols) */}
                <div className="lg:col-span-5 bg-slate-950 p-4 rounded-3xl border-4 border-slate-800 shadow-2xl flex flex-col justify-between h-[540px]">
                    {/* Barra superior de WhatsApp */}
                    <div>
                        <div className="bg-emerald-900/80 px-4 py-3 rounded-2xl flex items-center justify-between mb-3 text-white border border-emerald-700/50">
                            <div className="flex items-center gap-2.5">
                                <div className="w-9 h-9 rounded-full bg-emerald-700 flex items-center justify-center font-bold text-xs">
                                    🇵🇪
                                </div>
                                <div>
                                    <div className="font-bold text-xs leading-tight">AMARU-INDECI C4ISR</div>
                                    <div className="text-[10px] text-emerald-300 flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                                        Línea Oficial de Emergencia
                                    </div>
                                </div>
                            </div>
                            <span className="text-[10px] font-mono bg-emerald-950/70 text-emerald-300 px-2 py-0.5 rounded">
                                SINPAD v2
                            </span>
                        </div>

                        {/* Conversación */}
                        <div className="space-y-3 overflow-y-auto max-h-[400px] pr-1 text-xs">
                            {/* Burbuja entrante (del ciudadano) */}
                            <div className="flex justify-end">
                                <div className="max-w-[85%] bg-emerald-950/80 text-slate-200 p-3 rounded-2xl rounded-tr-none border border-emerald-800/40 shadow">
                                    <div className="text-[10px] text-emerald-400 font-bold mb-1 flex items-center justify-between gap-2">
                                        <span>{nombreContacto}</span>
                                        <span className="font-mono text-slate-400">{remitente}</span>
                                    </div>
                                    <p className="text-[11px] leading-relaxed mb-1">{mensajeTexto}</p>
                                    <div className="text-[9px] text-slate-400 text-right font-mono">
                                        📍 {caserio}, {distrito}
                                    </div>
                                </div>
                            </div>

                            {/* Burbuja de respuesta del C4ISR */}
                            <div className="flex justify-start">
                                <div className="max-w-[90%] bg-slate-900 text-slate-200 p-3 rounded-2xl rounded-tl-none border border-slate-800 shadow">
                                    <div className="text-[10px] text-emerald-400 font-bold mb-1 flex items-center gap-1">
                                        <Shield className="w-3 h-3 text-emerald-400" />
                                        Respuesta Automatizada Bilingüe Oficial
                                    </div>
                                    <p className="text-[11px] text-slate-300 whitespace-pre-line leading-relaxed">
                                        {ultimoResultado?.respuesta_ciudadano ||
                                            `🇵🇪 *AMARU-CLIMATE / INDECI C4ISR*\nEstimado/a *Santos*, su reporte ha sido registrado con *Folio de Auxilio N.° AMARU-WA-2026-F981*.\n\n📍 *Sector:* Caserío Naranjo Alto (Cura Mori)\n🚨 *Clasificación:* DESBORDE_INUNDACION_GRAVE (CRITICA)\n📦 *Ayuda Priorizada:* Agua Potable en Bidones, Evacuación Fluvial / Aérea\n\n🛡️ *Acción:* La Plataforma de Defensa Civil y el Padrón EDAN han sido alertados.`}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Barra inferior de entrada simulada */}
                    <div className="pt-2 border-t border-slate-900 text-[10px] text-slate-400 text-center font-mono">
                        🔒 Cifrado de extremo a extremo con respaldo en Bitácora WORM CGR
                    </div>
                </div>
            </div>

            {/* Listado Histórico de Mensajes Ingeridos */}
            <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                        <Users className="w-4 h-4 text-emerald-400" />
                        Buzón de Reportes Comunitarios de Campo ({mensajes.length})
                    </h4>
                    <span className="text-xs text-slate-400 font-mono">
                        Últimos reportes transmitidos vía Red AYNI
                    </span>
                </div>

                <div className="divide-y divide-slate-800/80 max-h-72 overflow-y-auto">
                    {mensajes.length === 0 ? (
                        <div className="py-8 text-center text-slate-400 text-xs">
                            No hay reportes de WhatsApp registrados aún.
                        </div>
                    ) : (
                        mensajes.map((m) => (
                            <div key={m.ticket_id} className="py-3 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-white">{m.nombre_contacto}</span>
                                        <span className="text-slate-400 font-mono text-[11px]">{m.remitente}</span>
                                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                                            m.nlp_analisis?.severidad === "CRITICA"
                                                ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                                                : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                                        }`}>
                                            {m.nlp_analisis?.categoria || "EMERGENCIA"}
                                        </span>
                                    </div>
                                    <p className="text-slate-300 text-[11px] italic line-clamp-1">
                                        "{m.mensaje_original}"
                                    </p>
                                    <div className="text-[10px] text-slate-400 flex items-center gap-3">
                                        <span>📍 {m.caserio} ({m.distrito})</span>
                                        <span>👥 ~{m.nlp_analisis?.familias_estimadas} familias</span>
                                        <span>🕒 {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 self-start md:self-auto">
                                    <span className="font-mono text-[10px] bg-slate-950 px-2 py-1 rounded border border-slate-800 text-slate-300">
                                        {m.ticket_id}
                                    </span>
                                    <button
                                        onClick={() => copiarTexto(m.ticket_id, m.ticket_id)}
                                        className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded transition"
                                        title="Copiar Ticket"
                                    >
                                        {copiado === m.ticket_id ? (
                                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                                        ) : (
                                            <Copy className="w-3.5 h-3.5" />
                                        )}
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
