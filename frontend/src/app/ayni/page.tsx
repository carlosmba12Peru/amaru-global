"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
    Users,
    ShieldAlert,
    ShieldCheck,
    Utensils,
    HeartHandshake,
    Activity,
    Send,
    Radio,
    Mail,
    Phone,
    MapPin,
    Calendar,
    Clock,
    CheckCircle2,
    AlertTriangle,
    Plus,
    Share2,
    MessageCircle,
    Bell,
    FileText,
    ChevronRight,
    Sparkles,
    Droplets,
    Home,
    Search,
    Truck
} from "lucide-react";

export default function AyniCommunityPage() {
    const [activeTab, setActiveTab] = useState<"faenas" | "juntas" | "ollas" | "salud" | "difusion">("faenas");
    const [summary, setSummary] = useState<any>(null);
    const [ollas, setOllas] = useState<any[]>([]);
    const [juntas, setJuntas] = useState<any[]>([]);
    const [vulnerables, setVulnerables] = useState<any[]>([]);
    const [faenas, setFaenas] = useState<any[]>([]);
    const [salud, setSalud] = useState<any>(null);
    const [difusionHistory, setDifusionHistory] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    // Formulario de Despacho Rápido (Telegram / Correo)
    const [broadcastCanal, setBroadcastCanal] = useState<"TELEGRAM" | "CORREO" | "AMBOS">("AMBOS");
    const [broadcastDestinatario, setBroadcastDestinatario] = useState<string>("@COEN_Comunidad_Peru");
    const [broadcastAsunto, setBroadcastAsunto] = useState<string>("ALERTA PREVENTIVA: Convocatoria a Faena Dominical de Sacos Terreros");
    const [broadcastMensaje, setBroadcastMensaje] = useState<string>(
        "Vecinos y brigadistas: este domingo nos reunimos a las 07:30 AM en la bocacalle de la quebrada para estibar 2,000 sacos terreros antes de las crecidas del FEN. Apoya la Olla Común con refrigerio. ¡Pasar la voz!"
    );
    const [sendingBroadcast, setSendingBroadcast] = useState<boolean>(false);
    const [broadcastSuccessMsg, setBroadcastSuccessMsg] = useState<string>("");

    // Modal de Registro de Vulnerable
    const [showVulnerableModal, setShowVulnerableModal] = useState<boolean>(false);
    const [vulnNombre, setVulnNombre] = useState<string>("");
    const [vulnCondicion, setVulnCondicion] = useState<string>("Adulto Mayor - Movilidad Reducida");
    const [vulnSector, setVulnSector] = useState<string>("");
    const [vulnBrigadista1, setVulnBrigadista1] = useState<string>("");
    const [vulnPunto, setVulnPunto] = useState<string>("Loza Deportiva Techada");
    const [vulnContacto, setVulnContacto] = useState<string>("");

    // Modal de Pedido Urgente para Olla Común
    const [selectedOllaForSupport, setSelectedOllaForSupport] = useState<any>(null);
    const [supportMotivo, setSupportMotivo] = useState<string>("Cisterna de agua potable urgente y víveres secos");

    const fetchData = async () => {
        try {
            const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
            const [resSum, resOllas, resJuntas, resVuln, resFaenas, resSalud, resDif] = await Promise.all([
                fetch(`${apiBase}/api/ayni/summary`),
                fetch(`${apiBase}/api/ayni/ollas`),
                fetch(`${apiBase}/api/ayni/juntas`),
                fetch(`${apiBase}/api/ayni/vulnerables`),
                fetch(`${apiBase}/api/ayni/faenas`),
                fetch(`${apiBase}/api/ayni/salud`),
                fetch(`${apiBase}/api/ayni/difusion`)
            ]);

            if (resSum.ok) setSummary(await resSum.json());
            if (resOllas.ok) setOllas(await resOllas.json());
            if (resJuntas.ok) setJuntas(await resJuntas.json());
            if (resVuln.ok) setVulnerables(await resVuln.json());
            if (resFaenas.ok) setFaenas(await resFaenas.json());
            if (resSalud.ok) setSalud(await resSalud.json());
            if (resDif.ok) setDifusionHistory(await resDif.json());
        } catch (err) {
            console.warn("Error cargando datos de AMARU-AYNI, usando fallback en memoria", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Despacho de Alerta Multicanal
    const handleSendBroadcast = async () => {
        if (!broadcastMensaje.trim()) return;
        setSendingBroadcast(true);
        setBroadcastSuccessMsg("");
        try {
            const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
            const res = await fetch(`${apiBase}/api/ayni/broadcast`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    canal: broadcastCanal,
                    destinatario: broadcastDestinatario,
                    asunto: broadcastAsunto,
                    mensaje: broadcastMensaje
                })
            });
            if (res.ok) {
                const json = await res.json();
                setBroadcastSuccessMsg(`¡Aviso despachado con éxito [${json.id}] a través de ${json.canal}!`);
                setDifusionHistory((prev) => [json, ...prev]);
                setTimeout(() => setBroadcastSuccessMsg(""), 5000);
            }
        } catch (err) {
            console.error("Error al despachar aviso", err);
        } finally {
            setSendingBroadcast(false);
        }
    };

    // Registrar Vulnerable
    const handleAddVulnerable = async () => {
        if (!vulnNombre.trim() || !vulnSector.trim()) return;
        try {
            const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
            const res = await fetch(`${apiBase}/api/ayni/vulnerables`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    nombre: vulnNombre,
                    condicion: vulnCondicion,
                    sector: vulnSector,
                    brigadista_1: vulnBrigadista1 || "Brigadista Comunitario Asignado",
                    brigadista_2: "Vecino Colindante",
                    punto_evacuacion: vulnPunto,
                    contacto: vulnContacto || "Sin número registrado"
                })
            });
            if (res.ok) {
                const json = await res.json();
                setVulnerables((prev) => [...prev, json]);
                setShowVulnerableModal(false);
                setVulnNombre("");
                setVulnSector("");
                setVulnContacto("");
            }
        } catch (err) {
            console.error("Error al registrar vulnerable", err);
        }
    };

    // Solicitar Apoyo para Olla Común
    const handleRequestOllaSupport = async () => {
        if (!selectedOllaForSupport) return;
        try {
            const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
            const res = await fetch(`${apiBase}/api/ayni/ollas/support`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    olla_id: selectedOllaForSupport.id,
                    motivo: supportMotivo
                })
            });
            if (res.ok) {
                // Despachar alerta automática a Telegram y Correo
                await fetch(`${apiBase}/api/ayni/broadcast`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        canal: "AMBOS",
                        destinatario: "coen.asistencia@indeci.gob.pe, @COEN_Comunidad_Peru",
                        asunto: `SOLICITUD URGENTE: ${selectedOllaForSupport.nombre}`,
                        mensaje: `Se requiere cisterna de agua potable y víveres para ${selectedOllaForSupport.nombre} (${selectedOllaForSupport.distrito}). Atiende a ${selectedOllaForSupport.familias_atendidas} familias.`
                    })
                });
                setSelectedOllaForSupport(null);
                fetchData();
            }
        } catch (err) {
            console.error("Error al solicitar apoyo", err);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 space-y-8">
            {/* ========================================================================= */}
            {/* CABECERA PRINCIPAL: AMARU-AYNI                                            */}
            {/* ========================================================================= */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden backdrop-blur-md">
                <div className="absolute -top-24 -right-24 w-96 h-96 bg-rose-600/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />

                <div className="relative z-10 flex flex-col lg:flex-row justify-between lg:items-center gap-6">
                    <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center gap-1.5">
                                <Users className="w-3.5 h-3.5" />
                                GOBERNANZA COMUNITARIA C2
                            </span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-blue-950 text-blue-300 border border-blue-800 font-bold flex items-center gap-1">
                                <Send className="w-3 h-3 text-sky-400" />
                                TELEGRAM BOT ACTIVO
                            </span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-950 text-amber-300 border border-amber-800 font-bold flex items-center gap-1">
                                <Mail className="w-3 h-3 text-amber-400" />
                                CORREO SMTP LISTO
                            </span>
                        </div>
                        <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight flex items-center gap-3">
                            <span>AMARU-AYNI</span>
                            <span className="text-slate-400 font-light text-xl">|</span>
                            <span className="text-rose-400 font-semibold text-lg md:text-xl">
                                Red de Participación Ciudadana, Ollas Comunes &amp; Juntas Vecinales FEN
                            </span>
                        </h1>
                        <p className="text-xs md:text-sm text-slate-300 max-w-3xl leading-relaxed">
                            Organización comunitaria territorial en 3 tiempos (Prevención, Acción y Apoyo Familiar): Articulación directa entre Juntas Vecinales (JUVESC), Red de Ollas Comunes, Agentes Comunitarios de Salud (ACS) y brigadistas para la protección de vidas durante el Fenómeno El Niño 2026-2027.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <Link
                            href="/lex"
                            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-amber-950/60 hover:bg-amber-900 text-amber-200 border border-amber-700/50 transition flex items-center gap-1.5 shadow"
                        >
                            <span>Ir a AMARU-LEX (Leyes)</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                        <Link
                            href="/yachay"
                            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-950/60 hover:bg-emerald-900 text-emerald-200 border border-emerald-700/50 transition flex items-center gap-1.5 shadow"
                        >
                            <span>Ir a AMARU-YACHAY (Saberes)</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                    </div>
                </div>

                {/* Banner de Descargo Comunitario Legal */}
                <div className="mt-5 p-3.5 bg-slate-950/90 border border-slate-800 rounded-xl text-xs flex items-start gap-2.5">
                    <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    <div className="text-[11px] text-slate-300 leading-relaxed">
                        <strong className="text-rose-300">Base Legal de la Participación Ciudadana:</strong> La acción comunitaria se fundamenta en los Art. 12 y 68 de la <strong>Ley SINAGERD Nº 29664</strong>, la <strong>Ley Nº 31458</strong> (Reconocimiento y Sostenibilidad de Ollas Comunes) y la <strong>Ley Nº 27933</strong> (Juntas Vecinales de Seguridad Ciudadana). Toda alerta y censo comunal se articula coordinadamente con la Oficina de Defensa Civil municipal.
                    </div>
                </div>

                {/* Indicadores Clave de la Red Comunitaria */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-5 pt-4 border-t border-slate-800/80 text-xs">
                    <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800">
                        <span className="text-[10px] text-slate-400 block font-medium">Ollas Comunes</span>
                        <span className="text-lg font-black text-rose-400">
                            {summary ? summary.total_ollas_comunes : 4}
                        </span>
                        <span className="text-[9px] text-slate-400 block">3,200 raciones/día</span>
                    </div>
                    <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800">
                        <span className="text-[10px] text-slate-400 block font-medium">Juntas Vecinales</span>
                        <span className="text-lg font-black text-blue-400">
                            {summary ? summary.total_juntas_vecinales : 3}
                        </span>
                        <span className="text-[9px] text-slate-400 block">73 brigadistas</span>
                    </div>
                    <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800">
                        <span className="text-[10px] text-slate-400 block font-medium">Padrón Vulnerables</span>
                        <span className="text-lg font-black text-amber-400">
                            {vulnerables.length}
                        </span>
                        <span className="text-[9px] text-slate-400 block">Mapeo 1-a-1</span>
                    </div>
                    <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800">
                        <span className="text-[10px] text-slate-400 block font-medium">Faenas Sacos</span>
                        <span className="text-lg font-black text-emerald-400">
                            {faenas.length}
                        </span>
                        <span className="text-[9px] text-slate-400 block">Ventana Dorada</span>
                    </div>
                    <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800">
                        <span className="text-[10px] text-slate-400 block font-medium">Agentes de Salud</span>
                        <span className="text-lg font-black text-teal-400">
                            {salud ? salud.agentes_activos : 26}
                        </span>
                        <span className="text-[9px] text-slate-400 block">94% agua clorada</span>
                    </div>
                    <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800">
                        <span className="text-[10px] text-slate-400 block font-medium">Alertas Despachadas</span>
                        <span className="text-lg font-black text-purple-400">
                            {difusionHistory.length}
                        </span>
                        <span className="text-[9px] text-slate-400 block">Telegram &amp; Correo</span>
                    </div>
                </div>

                {/* Barra de Navegación de Pestañas */}
                <div className="flex flex-wrap gap-2 mt-6 border-b border-slate-800 pt-2">
                    <button
                        onClick={() => setActiveTab("faenas")}
                        className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-t-xl transition border-t border-x ${
                            activeTab === "faenas"
                                ? "bg-slate-900 text-emerald-400 border-emerald-500/40 border-b-2 border-b-emerald-400"
                                : "text-slate-400 hover:text-slate-200 border-transparent hover:bg-slate-800/50"
                        }`}
                    >
                        <Home className="w-4 h-4" />
                        <span>1. Prevención: Faenas &amp; Sacos Terreros</span>
                    </button>
                    <button
                        onClick={() => setActiveTab("juntas")}
                        className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-t-xl transition border-t border-x ${
                            activeTab === "juntas"
                                ? "bg-slate-900 text-blue-400 border-blue-500/40 border-b-2 border-b-blue-400"
                                : "text-slate-400 hover:text-slate-200 border-transparent hover:bg-slate-800/50"
                        }`}
                    >
                        <Users className="w-4 h-4" />
                        <span>2. Juntas Vecinales &amp; Padrón Vulnerables</span>
                    </button>
                    <button
                        onClick={() => setActiveTab("ollas")}
                        className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-t-xl transition border-t border-x ${
                            activeTab === "ollas"
                                ? "bg-slate-900 text-rose-400 border-rose-500/40 border-b-2 border-b-rose-400"
                                : "text-slate-400 hover:text-slate-200 border-transparent hover:bg-slate-800/50"
                        }`}
                    >
                        <Utensils className="w-4 h-4" />
                        <span>3. Red de Ollas Comunes &amp; Agua</span>
                    </button>
                    <button
                        onClick={() => setActiveTab("salud")}
                        className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-t-xl transition border-t border-x ${
                            activeTab === "salud"
                                ? "bg-slate-900 text-teal-400 border-teal-500/40 border-b-2 border-b-teal-400"
                                : "text-slate-400 hover:text-slate-200 border-transparent hover:bg-slate-800/50"
                        }`}
                    >
                        <Activity className="w-4 h-4" />
                        <span>4. Salud Comunitaria &amp; Dengue</span>
                    </button>
                    <button
                        onClick={() => setActiveTab("difusion")}
                        className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-t-xl transition border-t border-x ${
                            activeTab === "difusion"
                                ? "bg-slate-900 text-purple-400 border-purple-500/40 border-b-2 border-b-purple-400"
                                : "text-slate-400 hover:text-slate-200 border-transparent hover:bg-slate-800/50"
                        }`}
                    >
                        <Radio className="w-4 h-4" />
                        <span>5. Despacho Telegram &amp; Correos</span>
                    </button>
                </div>
            </div>

            {/* ========================================================================= */}
            {/* PESTAÑA 1: FAENAS Y PREVENCIÓN (VENTANA DORADA)                            */}
            {/* ========================================================================= */}
            {activeTab === "faenas" && (
                <div className="space-y-6">
                    <div className="bg-slate-900 border border-emerald-500/30 rounded-2xl p-6 space-y-4 shadow-xl">
                        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 border-b border-slate-800 pb-4">
                            <div>
                                <h2 className="text-base font-bold text-white flex items-center gap-2">
                                    <Home className="w-5 h-5 text-emerald-400" />
                                    <span>Minkas y Faenas Comunitarias de Prevención (Antes del 30 de Noviembre)</span>
                                </h2>
                                <p className="text-xs text-slate-400 mt-1">
                                    Convocatoria comunitaria para el llenado y estiba de sacos terreros y descolmatación manual de acequias durante la Ventana Dorada.
                                </p>
                            </div>
                            <button
                                onClick={() => {
                                    setActiveTab("difusion");
                                    setBroadcastAsunto("CONVOCATORIA: Faena Comunal de Sacos Terreros");
                                    setBroadcastMensaje("Atención vecinos: este sábado convocamos a la Minka comunitaria para proteger nuestras viviendas con sacos terreros. Lugar: Local comunal. Traer palas y carretillas.");
                                }}
                                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition shadow shadow-emerald-600/30 shrink-0"
                            >
                                <Send className="w-3.5 h-3.5" />
                                <span>Convocar Faena por Telegram y Correo</span>
                            </button>
                        </div>

                        {/* Listado de Faenas */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {faenas.map((f: any, idx: number) => (
                                <div key={idx} className="bg-slate-950 border border-slate-800 hover:border-emerald-500/40 rounded-xl p-5 space-y-3 transition shadow-sm">
                                    <div className="flex justify-between items-start gap-2">
                                        <span className="font-mono text-[10px] font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">
                                            {f.id} • {f.estado}
                                        </span>
                                        <span className="text-[11px] font-bold text-amber-400 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-800/40 flex items-center gap-1">
                                            <Calendar className="w-3 h-3" />
                                            {f.fecha}
                                        </span>
                                    </div>
                                    <h3 className="text-sm font-bold text-white leading-snug">{f.titulo}</h3>
                                    <p className="text-xs text-slate-300 leading-relaxed">{f.objetivo}</p>

                                    <div className="p-3 bg-slate-900 rounded-lg space-y-1.5 text-xs border border-slate-850">
                                        <div>
                                            <strong className="text-slate-400">Punto de Encuentro:</strong>{" "}
                                            <span className="text-slate-200">{f.lugar}</span>
                                        </div>
                                        <div>
                                            <strong className="text-slate-400">Herramientas a Llevar:</strong>{" "}
                                            <span className="text-emerald-300">{f.herramientas_necesarias}</span>
                                        </div>
                                        <div>
                                            <strong className="text-slate-400">Alimentación:</strong>{" "}
                                            <span className="text-rose-300">{f.refrigerio_comunitario}</span>
                                        </div>
                                        <div className="flex justify-between items-center pt-2 mt-2 border-t border-slate-800 text-[11px]">
                                            <span className="text-slate-400">Organiza: <strong className="text-slate-200">{f.convocante}</strong></span>
                                            <span className="font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800/60">
                                                {f.voluntarios_confirmados} vecinos inscritos
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* ========================================================================= */}
            {/* PESTAÑA 2: JUNTAS VECINALES Y PADRÓN DE VULNERABLES (EVACUACIÓN 1-A-1)   */}
            {/* ========================================================================= */}
            {activeTab === "juntas" && (
                <div className="space-y-6">
                    <div className="bg-slate-900 border border-blue-500/30 rounded-2xl p-6 space-y-4 shadow-xl">
                        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 border-b border-slate-800 pb-4">
                            <div>
                                <h2 className="text-base font-bold text-white flex items-center gap-2">
                                    <Users className="w-5 h-5 text-blue-400" />
                                    <span>Juntas Vecinales de Seguridad Ciudadana (JUVESC) &amp; Padrón 1-a-1</span>
                                </h2>
                                <p className="text-xs text-slate-400 mt-1">
                                    Red de brigadistas vecinales y asignación directa de 2 vecinos de soporte para cada persona de alta vulnerabilidad.
                                </p>
                            </div>
                            <button
                                onClick={() => setShowVulnerableModal(true)}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition shadow shadow-blue-600/30 shrink-0"
                            >
                                <Plus className="w-3.5 h-3.5" />
                                <span>Empadronar Persona Vulnerable</span>
                            </button>
                        </div>

                        {/* Listado de Juntas Vecinales */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {juntas.map((j: any, idx: number) => (
                                <div key={idx} className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2.5">
                                    <div className="flex justify-between items-center">
                                        <span className="font-mono text-[10px] font-bold text-blue-400 bg-blue-950/60 px-2 py-0.5 rounded border border-blue-800">
                                            {j.id}
                                        </span>
                                        <span className="text-[10px] font-bold text-amber-400 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-800/40">
                                            {j.estado_operativo}
                                        </span>
                                    </div>
                                    <h3 className="text-xs font-bold text-white">{j.nombre}</h3>
                                    <p className="text-[11px] text-slate-400">{j.sector} • {j.distrito}</p>
                                    <div className="p-2.5 bg-slate-900 rounded-lg text-xs space-y-1 border border-slate-850">
                                        <div><strong className="text-slate-400">Coordinador:</strong> <span className="text-slate-200">{j.coordinador}</span></div>
                                        <div><strong className="text-slate-400">Fuerza Operativa:</strong> <span className="text-blue-300 font-bold">{j.integrantes} brigadistas</span></div>
                                        <div className="flex gap-2 text-[10px] pt-1 text-slate-300">
                                            <span>📢 {j.megafonos_operativos} megáfonos</span>
                                            <span>🔔 {j.sirenas_activas} sirenas</span>
                                            <span>📣 {j.silbatos_repartidos} silbatos</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Padrón de Vulnerables Censados */}
                        <div className="mt-6 pt-4 border-t border-slate-800">
                            <h3 className="text-sm font-bold text-amber-300 flex items-center gap-2 mb-3">
                                <span>Padrón de Evacuación Prioritaria (Asignación 1-a-1 de Brigadistas)</span>
                                <span className="text-[10px] font-mono bg-amber-950 text-amber-400 px-2 py-0.5 rounded border border-amber-800 font-bold">
                                    {vulnerables.length} familias protegidas
                                </span>
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {vulnerables.map((v: any, idx: number) => (
                                    <div key={idx} className="bg-slate-950 border border-amber-500/30 rounded-xl p-4 space-y-2">
                                        <div className="flex justify-between items-center">
                                            <span className="font-mono text-[10px] font-bold text-amber-400">{v.id}</span>
                                            <span className="text-[10px] text-slate-400">Tel: {v.contacto_emergencia}</span>
                                        </div>
                                        <h4 className="text-xs font-bold text-white">{v.nombre}</h4>
                                        <span className="inline-block text-[10px] px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800 font-medium">
                                            {v.condicion}
                                        </span>
                                        <p className="text-[11px] text-slate-300">📍 {v.sector}</p>
                                        <div className="p-2 bg-slate-900 rounded text-[11px] space-y-1 text-slate-300">
                                            <div><strong>Brigadista 1:</strong> {v.brigadista_asignado_1}</div>
                                            <div><strong>Refugio Asignado:</strong> {v.punto_evacuacion}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ========================================================================= */}
            {/* PESTAÑA 3: RED DE OLLAS COMUNES & SEGURIDAD ALIMENTARIA                   */}
            {/* ========================================================================= */}
            {activeTab === "ollas" && (
                <div className="space-y-6">
                    <div className="bg-slate-900 border border-rose-500/30 rounded-2xl p-6 space-y-4 shadow-xl">
                        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 border-b border-slate-800 pb-4">
                            <div>
                                <h2 className="text-base font-bold text-white flex items-center gap-2">
                                    <Utensils className="w-5 h-5 text-rose-400" />
                                    <span>Red de Ollas Comunes y Comedores Populares de Emergencia</span>
                                </h2>
                                <p className="text-xs text-slate-400 mt-1">
                                    Seguridad alimentaria comunitaria bajo el amparo de la Ley Nº 31458. Monitoreo de raciones, autonomía en días y abastecimiento de agua segura.
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-rose-300 font-bold bg-rose-950/60 px-3 py-1.5 rounded-xl border border-rose-800">
                                    🍲 3,200 Raciones / Día Disponibles
                                </span>
                            </div>
                        </div>

                        {/* Listado de Ollas Comunes */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {ollas.map((o: any, idx: number) => (
                                <div
                                    key={idx}
                                    className={`bg-slate-950 border rounded-xl p-5 space-y-3 transition ${
                                        o.requiere_apoyo ? "border-rose-500/50 shadow-lg shadow-rose-950/30" : "border-slate-800"
                                    }`}
                                >
                                    <div className="flex justify-between items-start gap-2">
                                        <span className="font-mono text-[10px] font-bold text-rose-400 bg-rose-950/60 px-2 py-0.5 rounded border border-rose-800">
                                            {o.id}
                                        </span>
                                        <span
                                            className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                                                o.dias_autonomia_alimentos <= 3
                                                    ? "bg-red-950 text-red-300 border-red-800 animate-pulse"
                                                    : "bg-emerald-950 text-emerald-300 border-emerald-800"
                                            }`}
                                        >
                                            {o.dias_autonomia_alimentos} DÍAS DE AUTONOMÍA
                                        </span>
                                    </div>

                                    <h3 className="text-sm font-bold text-white">{o.nombre}</h3>
                                    <p className="text-xs text-slate-400">📍 {o.sector} ({o.distrito})</p>

                                    <div className="p-3 bg-slate-900 rounded-lg space-y-1 text-xs border border-slate-850">
                                        <div><strong className="text-slate-400">Lideresa Responsable:</strong> <span className="text-slate-200">{o.lideresa} ({o.telefono})</span></div>
                                        <div><strong className="text-slate-400">Capacidad:</strong> <span className="text-rose-300 font-bold">{o.raciones_diarias} raciones/día</span> ({o.familias_atendidas} familias)</div>
                                        <div><strong className="text-slate-400">Situación Agua:</strong> <span className="text-amber-300">{o.estado_agua}</span></div>
                                    </div>

                                    <div className="pt-2 flex gap-2">
                                        <button
                                            onClick={() => {
                                                setSelectedOllaForSupport(o);
                                            }}
                                            className="flex-1 py-1.5 rounded-lg text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center gap-1.5 transition shadow"
                                        >
                                            <Truck className="w-3.5 h-3.5" />
                                            <span>Solicitar Cisterna de Agua / Víveres</span>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* ========================================================================= */}
            {/* PESTAÑA 4: SALUD COMUNITARIA & VIGILANCIA DENGUE                           */}
            {/* ========================================================================= */}
            {activeTab === "salud" && (
                <div className="space-y-6">
                    <div className="bg-slate-900 border border-teal-500/30 rounded-2xl p-6 space-y-4 shadow-xl">
                        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 border-b border-slate-800 pb-4">
                            <div>
                                <h2 className="text-base font-bold text-white flex items-center gap-2">
                                    <Activity className="w-5 h-5 text-teal-400" />
                                    <span>Vigilancia Epidemiológica Comunitaria (Agentes de Salud - MINSA)</span>
                                </h2>
                                <p className="text-xs text-slate-400 mt-1">
                                    Control preventivo de zancudo transmisor del dengue (<em>Aedes aegypti</em>), monitoreo de agua clorada y detección temprana de brotes diarreicos.
                                </p>
                            </div>
                            <span className="text-xs text-teal-300 font-bold bg-teal-950/60 px-3 py-1.5 rounded-xl border border-teal-800">
                                🩺 {salud ? salud.agentes_activos : 26} Agentes en Campo
                            </span>
                        </div>

                        {/* Tarjetas de Salud Comunitaria */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-1">
                                <span className="text-[10px] text-slate-400 font-medium block">Cloración Óptima de Agua</span>
                                <span className="text-xl font-black text-teal-400">{salud ? salud.porcentaje_cloracion_optima : 94.2}%</span>
                                <span className="text-[10px] text-slate-400 block">{salud ? salud.tanques_agua_inspeccionados : 142} tanques testeados</span>
                            </div>
                            <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-1">
                                <span className="text-[10px] text-slate-400 font-medium block">Casos Febriles Sospechosos</span>
                                <span className="text-xl font-black text-amber-400">{salud ? salud.casos_febriles_sospecha_dengue : 2}</span>
                                <span className="text-[10px] text-slate-400 block">Derivados al Puesto de Salud</span>
                            </div>
                            <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-1">
                                <span className="text-[10px] text-slate-400 font-medium block">Stock Pastillas de Cloro</span>
                                <span className="text-xl font-black text-blue-400">{salud ? salud.stock_pastillas_cloro_bidones : 4500}</span>
                                <span className="text-[10px] text-slate-400 block">Dosis para bidones de 20L</span>
                            </div>
                            <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-1">
                                <span className="text-[10px] text-slate-400 font-medium block">Visitas a Gestantes</span>
                                <span className="text-xl font-black text-rose-400">{salud ? salud.visitas_a_gestantes_completadas : 18}</span>
                                <span className="text-[10px] text-slate-400 block">100% con plan de parto seguro</span>
                            </div>
                        </div>

                        {/* Directiva de Acción Sanitaria Comunitaria */}
                        <div className="p-4 bg-teal-950/30 border border-teal-800/40 rounded-xl space-y-2 text-xs">
                            <strong className="text-teal-300 block text-sm">Protocolo Sanitario Vecinal ante Inundaciones:</strong>
                            <ul className="list-disc pl-5 space-y-1 text-slate-300">
                                <li><strong>Lava, cepilla y tapa herméticamente</strong> todos los baldes, cilindros y tanques donde almacenes agua.</li>
                                <li><strong>Elimina botellas, llantas viejas y latas</strong> acumuladas en techos y corrales donde pueda estancarse agua de lluvia.</li>
                                <li><strong>Coloca 01 pastilla de cloro</strong> por cada bidón de 20 litros y espera 30 minutos antes de consumir el agua.</li>
                                <li>Ante fiebre repentina, dolor detrás de los ojos o sarpullido: <strong>NO automedicarse con aspirina ni ibuprofeno</strong>. Acudir inmediatamente con el Agente Comunitario de Salud.</li>
                            </ul>
                        </div>
                    </div>
                </div>
            )}

            {/* ========================================================================= */}
            {/* PESTAÑA 5: DESPACHO MULTICANAL (TELEGRAM & CORREO ELECTRÓNICO)           */}
            {/* ========================================================================= */}
            {activeTab === "difusion" && (
                <div className="space-y-6">
                    <div className="bg-slate-900 border border-purple-500/30 rounded-2xl p-6 space-y-5 shadow-xl">
                        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 border-b border-slate-800 pb-4">
                            <div>
                                <h2 className="text-base font-bold text-white flex items-center gap-2">
                                    <Radio className="w-5 h-5 text-purple-400" />
                                    <span>Centro de Difusión Multicanal: Telegram &amp; Correo Electrónico</span>
                                </h2>
                                <p className="text-xs text-slate-400 mt-1">
                                    Transmisión simultánea de alertas operativas, pedidos de ayuda y convocatorias a faenas comunales.
                                </p>
                            </div>
                            <span className="text-xs text-purple-300 font-bold bg-purple-950/60 px-3 py-1.5 rounded-xl border border-purple-800">
                                ⚡ Despacho Inmediato C2
                            </span>
                        </div>

                        {broadcastSuccessMsg && (
                            <div className="p-3 bg-emerald-950/80 border border-emerald-500/50 rounded-xl text-xs text-emerald-200 flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                <span>{broadcastSuccessMsg}</span>
                            </div>
                        )}

                        {/* Plantillas Rápidas de Mensaje */}
                        <div className="space-y-2">
                            <span className="text-xs text-slate-400 font-bold block">Plantillas Oficiales de Alerta Rápida:</span>
                            <div className="flex flex-wrap gap-2">
                                <button
                                    onClick={() => {
                                        setBroadcastAsunto("CONVOCATORIA: Faena de Llenado de Sacos Terreros");
                                        setBroadcastMensaje("Vecinos: convocamos a la Minka comunitaria este domingo a las 07:30 AM para formar barreras de sacos en la quebrada. Traer palas. La Olla Común brindará refrigerio.");
                                    }}
                                    className="px-2.5 py-1 rounded-lg text-[11px] bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-slate-700 transition"
                                >
                                    🛠️ Faena Sacos Terreros
                                </button>
                                <button
                                    onClick={() => {
                                        setBroadcastAsunto("ALERTA TEMPRANA: Posible Crecida de Quebrada");
                                        setBroadcastMensaje("ATENCIÓN: Senamhi e INDECI reportan lluvias intensas en cuenca alta. Brigadistas de juntas vecinales activar silbatos y verificar a vecinos con movilidad reducida.");
                                    }}
                                    className="px-2.5 py-1 rounded-lg text-[11px] bg-slate-950 hover:bg-slate-800 text-amber-300 border border-amber-800/40 hover:border-amber-700 transition"
                                >
                                    🚨 Alerta Activación Quebrada
                                </button>
                                <button
                                    onClick={() => {
                                        setBroadcastAsunto("SOLIDARIDAD: Apoyo con Agua Potable para Olla Común");
                                        setBroadcastMensaje("Se solicita apoyo con bidones de agua limpia o cisterna para la Olla Común del sector alto. Atiende a más de 30 familias vulnerables.");
                                    }}
                                    className="px-2.5 py-1 rounded-lg text-[11px] bg-slate-950 hover:bg-slate-800 text-rose-300 border border-rose-800/40 hover:border-rose-700 transition"
                                >
                                    🍲 Agua para Olla Común
                                </button>
                                <button
                                    onClick={() => {
                                        setBroadcastAsunto("AVISO SANITARIO: Prevención y Control del Dengue");
                                        setBroadcastMensaje("Agentes Comunitarios de Salud recuerdan: lavar y tapar herméticamente cilindros de agua y eliminar recipientes en techos. Ante fiebre, no automedicarse.");
                                    }}
                                    className="px-2.5 py-1 rounded-lg text-[11px] bg-slate-950 hover:bg-slate-800 text-teal-300 border border-teal-800/40 hover:border-teal-700 transition"
                                >
                                    🩺 Prevención de Dengue
                                </button>
                            </div>
                        </div>

                        {/* Formulario de Emisión */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="text-xs text-slate-400 font-bold block mb-1">Canal de Transmisión:</label>
                                <select
                                    value={broadcastCanal}
                                    onChange={(e: any) => setBroadcastCanal(e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                                >
                                    <option value="AMBOS">Telegram &amp; Correo Electrónico (Ambos)</option>
                                    <option value="TELEGRAM">Solo Canal / Grupo de Telegram</option>
                                    <option value="CORREO">Solo Correo Electrónico (SMTP)</option>
                                </select>
                            </div>
                            <div className="md:col-span-2">
                                <label className="text-xs text-slate-400 font-bold block mb-1">Destinatario / Canal / Correo:</label>
                                <input
                                    type="text"
                                    value={broadcastDestinatario}
                                    onChange={(e) => setBroadcastDestinatario(e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500 font-mono"
                                    placeholder="@CanalTelegram o correos separados por coma"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-xs text-slate-400 font-bold block mb-1">Asunto de la Notificación:</label>
                            <input
                                type="text"
                                value={broadcastAsunto}
                                onChange={(e) => setBroadcastAsunto(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                            />
                        </div>

                        <div>
                            <label className="text-xs text-slate-400 font-bold block mb-1">Cuerpo del Mensaje / Directiva Comunitaria:</label>
                            <textarea
                                rows={4}
                                value={broadcastMensaje}
                                onChange={(e) => setBroadcastMensaje(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-purple-500 font-sans"
                            />
                        </div>

                        <div className="flex justify-end">
                            <button
                                onClick={handleSendBroadcast}
                                disabled={sendingBroadcast}
                                className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 disabled:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition shadow shadow-purple-600/30"
                            >
                                <Send className="w-4 h-4" />
                                <span>{sendingBroadcast ? "Transmitiendo por redes..." : "Despachar Aviso Multicanal Ahora"}</span>
                            </button>
                        </div>

                        {/* Historial de Transmisiones */}
                        <div className="mt-6 pt-4 border-t border-slate-800 space-y-3">
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                                Registro Inmutable de Transmisiones Recientes ({difusionHistory.length})
                            </h3>
                            <div className="space-y-2">
                                {difusionHistory.map((item: any, idx: number) => (
                                    <div key={idx} className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs flex flex-col md:flex-row justify-between md:items-center gap-2">
                                        <div className="space-y-0.5">
                                            <div className="flex items-center gap-2">
                                                <span className="font-mono text-[9px] font-bold text-purple-400 bg-purple-950 px-1.5 py-0.2 rounded border border-purple-800">
                                                    {item.id}
                                                </span>
                                                <span className="font-bold text-white text-xs">{item.asunto}</span>
                                            </div>
                                            <p className="text-[11px] text-slate-400 font-mono">Destino: {item.destinatario} | {item.detalles || "Transmisión exitosa"}</p>
                                        </div>
                                        <div className="flex items-center gap-2 shrink-0">
                                            <span className="text-[10px] text-slate-400 font-mono">{item.fecha}</span>
                                            <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                                                {item.estado}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ========================================================================= */}
            {/* MODAL: REGISTRAR PERSONA VULNERABLE                                       */}
            {/* ========================================================================= */}
            {showVulnerableModal && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
                        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                            <h3 className="text-sm font-bold text-white flex items-center gap-2">
                                <Users className="w-4 h-4 text-amber-400" />
                                <span>Empadronar Persona de Alta Vulnerabilidad</span>
                            </h3>
                            <button onClick={() => setShowVulnerableModal(false)} className="text-slate-400 hover:text-white">✕</button>
                        </div>

                        <div className="space-y-3 text-xs">
                            <div>
                                <label className="text-slate-400 block mb-1">Nombre Completo del Ciudadano:</label>
                                <input
                                    type="text"
                                    value={vulnNombre}
                                    onChange={(e) => setVulnNombre(e.target.value)}
                                    placeholder="Ej: Don Teófilo Ramos (82 años)"
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                                />
                            </div>
                            <div>
                                <label className="text-slate-400 block mb-1">Condición de Vulnerabilidad:</label>
                                <select
                                    value={vulnCondicion}
                                    onChange={(e) => setVulnCondicion(e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                                >
                                    <option value="Adulto Mayor - Movilidad Reducida">Adulto Mayor - Movilidad Reducida</option>
                                    <option value="Persona con Discapacidad Severa">Persona con Discapacidad Severa</option>
                                    <option value="Madre Gestante en Zona de Riesgo">Madre Gestante en Zona de Riesgo</option>
                                    <option value="Familia con Lactante Menor">Familia con Lactante Menor</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-slate-400 block mb-1">Ubicación / Sector / Manzana:</label>
                                <input
                                    type="text"
                                    value={vulnSector}
                                    onChange={(e) => setVulnSector(e.target.value)}
                                    placeholder="Ej: Quebrada Quirio Mz C Lote 8"
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                                />
                            </div>
                            <div>
                                <label className="text-slate-400 block mb-1">Brigadista Vecinal Responsable Asignado:</label>
                                <input
                                    type="text"
                                    value={vulnBrigadista1}
                                    onChange={(e) => setVulnBrigadista1(e.target.value)}
                                    placeholder="Ej: Walter Ramos (Coordinador JUVESC)"
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="text-slate-400 block mb-1">Punto Seguro de Evacuación:</label>
                                    <input
                                        type="text"
                                        value={vulnPunto}
                                        onChange={(e) => setVulnPunto(e.target.value)}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                                    />
                                </div>
                                <div>
                                    <label className="text-slate-400 block mb-1">Teléfono de Contacto:</label>
                                    <input
                                        type="text"
                                        value={vulnContacto}
                                        onChange={(e) => setVulnContacto(e.target.value)}
                                        placeholder="987-000-000"
                                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                            <button onClick={() => setShowVulnerableModal(false)} className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs">Cancelar</button>
                            <button onClick={handleAddVulnerable} className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs">Registrar en Padrón</button>
                        </div>
                    </div>
                </div>
            )}

            {/* ========================================================================= */}
            {/* MODAL: SOLICITAR APOYO URGENTE PARA OLLA COMÚN                            */}
            {/* ========================================================================= */}
            {selectedOllaForSupport && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-slate-900 border border-rose-500/50 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
                        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                            <h3 className="text-sm font-bold text-white flex items-center gap-2">
                                <Utensils className="w-4 h-4 text-rose-400" />
                                <span>Pedido Urgente para {selectedOllaForSupport.nombre}</span>
                            </h3>
                            <button onClick={() => setSelectedOllaForSupport(null)} className="text-slate-400 hover:text-white">✕</button>
                        </div>

                        <div className="space-y-3 text-xs">
                            <p className="text-slate-300">
                                Al confirmar este requerimiento, el sistema despachará una alerta inmediata vía <strong>Telegram</strong> y <strong>Correo Electrónico</strong> al Centro de Operaciones de Emergencia (COEL/COEN) y a los canales de apoyo humanitario.
                            </p>
                            <div>
                                <label className="text-slate-400 block mb-1">Motivo / Bienes Requeridos con Urgencia:</label>
                                <textarea
                                    rows={3}
                                    value={supportMotivo}
                                    onChange={(e) => setSupportMotivo(e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-rose-500"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                            <button onClick={() => setSelectedOllaForSupport(null)} className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs">Cancelar</button>
                            <button onClick={handleRequestOllaSupport} className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5">
                                <Send className="w-3.5 h-3.5" />
                                <span>Confirmar &amp; Enviar Alerta</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
