"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { API_BASE } from "@/config/api";
import {
    ShieldAlert,
    Building2,
    Users,
    Clock,
    AlertTriangle,
    CheckCircle2,
    Send,
    Truck,
    Activity,
    Siren,
    Zap,
    MapPin,
    RefreshCw,
    Search,
    ChevronRight,
    FileText,
    Volume2,
    PhoneCall,
    Languages,
    Compass,
    Radio,
    ShieldCheck,
    X,
    Filter,
    Layers,
    Info,
    ArrowRight,
    Satellite,
    Waves,
    Database,
    Scale,
    Landmark,
    FileEdit,
    HeartPulse,
    GraduationCap,
    BookOpen
} from "lucide-react";

interface AlertaNacionalItem {
    id_alerta: string;
    titulo: string;
    regimen: "PLUVIAL_FEN" | "CRIOCLIMA_CHIRI" | "INCENDIO_FORESTAL";
    nivel_alerta: "ROJO" | "NARANJA" | "AMARILLO";
    lead_time: "T-144h" | "T-72h" | "T-24h";
    horas_anticipacion: number;
    distritos_objetivo: string[];
    distritos_nombres: string[];
    departamento?: string;
    cuenca?: string;
    gatillo_cientifico: string;
    impacto_territorial_estimado?: any;
    acciones_mandatadas_eap: string[];
    emisor_responsable: string;
    fecha_emision_utc: string;
    estado_general: string;
    hash_sha256: string;
}

interface AlertaMunicipalItem extends AlertaNacionalItem {
    ubigeo_destinatario: string;
    estado_municipal: "RECIBIDA_PENDIENTE_VALIDACION" | "DETONADA_Y_COMUNICADA" | "EN_VIGILANCIA_ESTABLE";
    fecha_ingreso_bandeja: string;
    validado_por?: string;
    fecha_validacion?: string;
    orden_despacho_eap?: any;
    alerta_social_emitida: boolean;
}

interface AlertaSocialItem {
    id_alerta_social: string;
    ubigeo: string;
    nivel_alerta: string;
    semáforo_ciudadano: string;
    instrucciones_comunitarias: {
        castellano: string;
        quechua: string;
        aymara: string;
    };
    albergues_seguros: string[];
    numeros_emergencia: { entidad: string; telefono: string }[];
    hash_acta_sha256: string;
    fecha_publicacion: string;
}

export default function AlertasTripartitasWrapper() {
    const [activeTab, setActiveTab] = useState<"NACIONAL" | "MUNICIPAL" | "SOCIAL">("NACIONAL");
    const [selectedUbigeo, setSelectedUbigeo] = useState<string>("200101"); // Piura por defecto
    const [distritoNombre, setDistritoNombre] = useState<string>("Piura (Bajo Piura)");

    // Estados Nacional
    const [resumenNacional, setResumenNacional] = useState<any>(null);
    const [loadingNacional, setLoadingNacional] = useState<boolean>(true);
    const [modalNuevaAlerta, setModalNuevaAlerta] = useState<boolean>(false);
    const [filtroRegimen, setFiltroRegimen] = useState<string>("ALL");
    const [filtroNivel, setFiltroNivel] = useState<string>("ALL");
    // Estados Puerta Soberana de Aprobación Humana (HITL)
    const [alertaParaAprobarHitl, setAlertaParaAprobarHitl] = useState<any | null>(null);
    const [oficialNombre, setOficialNombre] = useState<string>("Ing. Carlos Mendoza Rivas");
    const [oficialDni, setOficialDni] = useState<string>("41892301");
    const [oficialCargo, setOficialCargo] = useState<string>("Oficial de Guardia C2 / Director de Análisis Territorial COED Nacional");
    const [oficialObs, setOficialObs] = useState<string>("Cotejado con hidrograma telemétrico y radar Doppler. Conforme para distribución a municipios.");
    const [checkNoSismate, setCheckNoSismate] = useState<boolean>(false);
    const [firmandoHitl, setFirmandoHitl] = useState<boolean>(false);

    // Estados Municipal
    const [bandejaMunicipal, setBandejaMunicipal] = useState<AlertaMunicipalItem[]>([]);
    const [loadingMunicipal, setLoadingMunicipal] = useState<boolean>(false);
    const [alertaParaDetonar, setAlertaParaDetonar] = useState<AlertaMunicipalItem | null>(null);
    const [autoridadFirmante, setAutoridadFirmante] = useState<string>("Alcalde Provincial / Presidente GT-GRD");
    const [combustibleInput, setCombustibleInput] = useState<number>(600);
    const [motobombasInput, setMotobombasInput] = useState<number>(6);
    const [pacasInput, setPacasInput] = useState<number>(0);
    const [detonandoEAP, setDetonandoEAP] = useState<boolean>(false);
    const [detonacionExitosa, setDetonacionExitosa] = useState<any | null>(null);

    // Estados Social
    const [alertaSocialVigente, setAlertaSocialVigente] = useState<AlertaSocialItem | null>(null);
    const [loadingSocial, setLoadingSocial] = useState<boolean>(false);
    const [idiomaSocial, setIdiomaSocial] = useState<"castellano" | "quechua" | "aymara">("castellano");

    // Formulario de Emisión Nacional
    const [formTitulo, setFormTitulo] = useState<string>("");
    const [formRegimen, setFormRegimen] = useState<"PLUVIAL_FEN" | "CRIOCLIMA_CHIRI" | "INCENDIO_FORESTAL">("PLUVIAL_FEN");
    const [formNivel, setFormNivel] = useState<"ROJO" | "NARANJA" | "AMARILLO">("ROJO");
    const [formLeadTime, setFormLeadTime] = useState<"T-144h" | "T-72h" | "T-24h">("T-72h");
    const [formUbigeos, setFormUbigeos] = useState<string>("200101, 200104, 200105");
    const [formGatillo, setFormGatillo] = useState<string>("");

    // 1. Cargar Resumen Nacional
    const fetchNacional = async () => {
        setLoadingNacional(true);
        try {
            const res = await fetch(`${API_BASE}/api/alertas/nacional/resumen`);
            if (res.ok) {
                const data = await res.json();
                setResumenNacional(data);
            }
        } catch (e) {
            console.error("Error al cargar alertas nacionales:", e);
        } finally {
            setLoadingNacional(false);
        }
    };

    // 2. Cargar Bandeja Municipal
    const fetchMunicipal = async (ubigeo: string) => {
        setLoadingMunicipal(true);
        try {
            const res = await fetch(`${API_BASE}/api/alertas/municipal/${ubigeo}`);
            if (res.ok) {
                const data = await res.json();
                setBandejaMunicipal(data.alertas || []);
            }
        } catch (e) {
            console.error("Error al cargar bandeja municipal:", e);
        } finally {
            setLoadingMunicipal(false);
        }
    };

    // 3. Cargar Consola Social
    const fetchSocial = async (ubigeo: string) => {
        setLoadingSocial(true);
        try {
            const res = await fetch(`${API_BASE}/api/alertas/social/${ubigeo}`);
            if (res.ok) {
                const data = await res.json();
                setAlertaSocialVigente(data.alerta_vigente || null);
            }
        } catch (e) {
            console.error("Error al cargar consola social:", e);
        } finally {
            setLoadingSocial(false);
        }
    };

    useEffect(() => {
        fetchNacional();
    }, []);

    useEffect(() => {
        if (selectedUbigeo) {
            fetchMunicipal(selectedUbigeo);
            fetchSocial(selectedUbigeo);
        }
    }, [selectedUbigeo]);

    const handleSwitchUbigeo = (ubigeo: string, nombre: string) => {
        setSelectedUbigeo(ubigeo);
        setDistritoNombre(nombre);
    };

    // Despacho de Alerta Nacional (Emisión COED Nacional)
    const handleEmitirAlertaNacional = async (e: React.FormEvent) => {
        e.preventDefault();
        const listaU = formUbigeos.split(",").map(u => u.trim()).filter(Boolean);
        try {
            const payload = {
                titulo: formTitulo || "Alerta C2 Extraordinaria por Ciclón y Lluvias Convectivas",
                regimen: formRegimen,
                nivel_alerta: formNivel,
                lead_time: formLeadTime,
                distritos_objetivo: listaU,
                gatillo_cientifico: formGatillo || "Superación de umbral hidrológico con anomalía térmica en radar Doppler.",
                acciones_mandatadas: [
                    "1. Convocar al Grupo de Trabajo de la Municipalidad (GT-GRD).",
                    "2. Inspección perentoria de defensas y albergues.",
                    "3. Notificar a comités vecinales."
                ],
                emisor_responsable: "Comando C2 COED Nacional AMARU"
            };

            const res = await fetch(`${API_BASE}/api/alertas/nacional/emitir`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                setModalNuevaAlerta(false);
                fetchNacional();
            }
        } catch (err) {
            console.error("Error al emitir alerta nacional:", err);
        }
    };

    // Aprobación Humana de Alerta Nacional (Puerta Soberana HITL Gatekeeper)
    const handleAprobarAlertaHitl = async () => {
        if (!alertaParaAprobarHitl || !checkNoSismate || !oficialDni || !oficialNombre) return;
        setFirmandoHitl(true);
        try {
            const payload = {
                id_alerta: alertaParaAprobarHitl.id_alerta,
                aprobador_nombre: oficialNombre,
                aprobador_dni: oficialDni,
                cargo_institucional: oficialCargo,
                observaciones_tecnicas: oficialObs,
                confirmacion_no_sismate: checkNoSismate
            };

            const res = await fetch(`${API_BASE}/api/alertas/nacional/aprobar-hitl`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                setAlertaParaAprobarHitl(null);
                setCheckNoSismate(false);
                fetchNacional();
                fetchMunicipal(selectedUbigeo);
            }
        } catch (err) {
            console.error("Error al aprobar alerta nacional HITL:", err);
        } finally {
            setFirmandoHitl(false);
        }
    };

    // Detonación y Firma Municipal (El Alcalde valida y emite alerta a la comunidad)
    const handleValidarYDetonar = async () => {
        if (!alertaParaDetonar) return;
        setDetonandoEAP(true);
        try {
            const payload = {
                id_alerta: alertaParaDetonar.id_alerta,
                ubigeo: selectedUbigeo,
                autoridad_solicitante: autoridadFirmante,
                orden_combustible_galones: combustibleInput,
                motobombas_desplegadas: motobombasInput,
                pacas_heno_asignadas: pacasInput,
                albergues_habilitados: [
                    selectedUbigeo.startsWith("21")
                        ? "Polideportivo Municipal / Tambo Comunal"
                        : "Colegio San Miguel / Polideportivo Piura"
                ],
                habilitar_alerta_social: true
            };

            const res = await fetch(`${API_BASE}/api/alertas/municipal/${selectedUbigeo}/validar-detonar`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                const data = await res.json();
                setDetonacionExitosa(data);
                fetchMunicipal(selectedUbigeo);
                fetchSocial(selectedUbigeo);
            }
        } catch (err) {
            console.error("Error al detonar EAP:", err);
        } finally {
            setDetonandoEAP(false);
        }
    };

    const getBadgeClass = (nivel: string) => {
        switch (nivel) {
            case "ROJO":
                return "bg-rose-500/20 text-rose-300 border-rose-500/50";
            case "NARANJA":
                return "bg-amber-500/20 text-amber-300 border-amber-500/50";
            case "AMARILLO":
                return "bg-yellow-500/20 text-yellow-300 border-yellow-500/50";
            default:
                return "bg-emerald-500/20 text-emerald-300 border-emerald-500/50";
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-6 space-y-6">
            {/* Header Táctico y Conmutador de los 3 Pilares de Alertas */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl space-y-4">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-3 rounded-2xl bg-gradient-to-br from-rose-500/20 to-orange-600/30 border border-rose-500/40 text-rose-400 shadow-xl shadow-rose-950/40">
                            <Radio className="w-7 h-7 animate-pulse" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-xl md:text-2xl font-black text-white tracking-tight">
                                    Centro C2 de Gestión y Despacho de Alertas en Cascada
                                </h1>
                                <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold">
                                    PIPELINE EAP TRIPARTITO
                                </span>
                            </div>
                            <p className="text-xs text-slate-400 mt-1">
                                Flujo doctrinario: <strong className="text-slate-200">COED Nacional</strong> (Vigilancia e Ingesta Científica) &rarr; <strong className="text-slate-200">COED Municipal</strong> (Bandeja del Alcalde / PP 0068) &rarr; <strong className="text-slate-200">COED Social</strong> (Sociedad Organizada / Resiliencia Ciudadana).
                            </p>
                        </div>
                    </div>

                    {/* Selector Rápido de Jurisdicción Municipal para Pruebas C2 */}
                    <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-2xl border border-slate-800 text-xs">
                        <span className="text-slate-400 font-semibold px-2">Distrito C2:</span>
                        <button
                            onClick={() => handleSwitchUbigeo("200101", "Piura (Bajo Piura)")}
                            className={`px-3 py-1.5 rounded-xl font-medium transition ${
                                selectedUbigeo === "200101"
                                    ? "bg-cyan-500 text-slate-950 font-bold"
                                    : "text-slate-400 hover:text-white"
                            }`}
                        >
                            Piura (200101)
                        </button>
                        <button
                            onClick={() => handleSwitchUbigeo("200105", "Catacaos (Inundación)")}
                            className={`px-3 py-1.5 rounded-xl font-medium transition ${
                                selectedUbigeo === "200105"
                                    ? "bg-cyan-500 text-slate-950 font-bold"
                                    : "text-slate-400 hover:text-white"
                            }`}
                        >
                            Catacaos (200105)
                        </button>
                        <button
                            onClick={() => handleSwitchUbigeo("210504", "Mazocruz (Polo del Frío)")}
                            className={`px-3 py-1.5 rounded-xl font-medium transition ${
                                selectedUbigeo === "210504"
                                    ? "bg-cyan-500 text-slate-950 font-bold"
                                    : "text-slate-400 hover:text-white"
                            }`}
                        >
                            Mazocruz (210504)
                        </button>
                    </div>
                </div>

                {/* STEPPER VISUAL DEL FLUJO BIDIRECCIONAL SINCRONIZADO (6 FASES C2) */}
                <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-3 space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-mono">
                        <span className="text-slate-400 font-bold flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
                            CIRCUITO CERRADO FULL-DUPLEX: ESTADO DEL CICLO DE VIDA C2
                        </span>
                        <span className="text-slate-500">Decisión 486 • Ley 29664 • Art. 377 CP</span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-6 gap-1.5 text-[10px]">
                        {/* Fase 1 */}
                        <div
                            onClick={() => setActiveTab("NACIONAL")}
                            className={`p-2 rounded-xl border transition cursor-pointer ${
                                activeTab === "NACIONAL"
                                    ? "bg-sky-950/80 border-sky-500 text-sky-200 ring-1 ring-sky-500/50"
                                    : "bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700"
                            }`}
                        >
                            <span className="font-bold text-sky-400 block font-mono">Fase 1 • Nacional</span>
                            <span className="text-[10px] text-white block mt-0.5 leading-tight">Alerta Top-Down</span>
                            <span className="text-[9px] text-slate-400 block">T-144h / 72h / 24h</span>
                        </div>

                        {/* Fase 2 */}
                        <div
                            onClick={() => setActiveTab("MUNICIPAL")}
                            className={`p-2 rounded-xl border transition cursor-pointer ${
                                activeTab === "MUNICIPAL"
                                    ? "bg-amber-950/80 border-amber-500 text-amber-200 ring-1 ring-amber-500/50"
                                    : "bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700"
                            }`}
                        >
                            <span className="font-bold text-amber-400 block font-mono">Fase 2 • Municipal</span>
                            <span className="text-[10px] text-white block mt-0.5 leading-tight">Detonación EAP</span>
                            <span className="text-[9px] text-slate-400 block">Reloj Polar & PP 0068</span>
                        </div>

                        {/* Fase 3 */}
                        <div
                            onClick={() => setActiveTab("SOCIAL")}
                            className={`p-2 rounded-xl border transition cursor-pointer ${
                                activeTab === "SOCIAL"
                                    ? "bg-emerald-950/80 border-emerald-500 text-emerald-200 ring-1 ring-emerald-500/50"
                                    : "bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700"
                            }`}
                        >
                            <span className="font-bold text-emerald-400 block font-mono">Fase 3 • Social</span>
                            <span className="text-[10px] text-white block mt-0.5 leading-tight">Difusión Cívica</span>
                            <span className="text-[9px] text-slate-400 block">5 Lenguas & Albergues</span>
                        </div>

                        {/* Fase 4 */}
                        <Link
                            href="/reporte-ciudadano"
                            className="p-2 rounded-xl border bg-slate-900/60 border-slate-800 text-slate-400 hover:border-rose-500/70 hover:text-rose-300 transition cursor-pointer"
                        >
                            <span className="font-bold text-rose-400 block font-mono">Fase 4 • Social</span>
                            <span className="text-[10px] text-white block mt-0.5 leading-tight">Sensor Humano RAM</span>
                            <span className="text-[9px] text-slate-400 block">SHA-256 & Tríada CUP</span>
                        </Link>

                        {/* Fase 5 */}
                        <Link
                            href="/edan"
                            className="p-2 rounded-xl border bg-slate-900/60 border-slate-800 text-slate-400 hover:border-cyan-500/70 hover:text-cyan-300 transition cursor-pointer"
                        >
                            <span className="font-bold text-cyan-400 block font-mono">Fase 5 • Municipal</span>
                            <span className="text-[10px] text-white block mt-0.5 leading-tight">Filtro 4 Capas</span>
                            <span className="text-[9px] text-slate-400 block">ICT ≥ 0.70 & WORM</span>
                        </Link>

                        {/* Fase 6 */}
                        <Link
                            href="/fiscal"
                            className="p-2 rounded-xl border bg-slate-900/60 border-slate-800 text-slate-400 hover:border-purple-500/70 hover:text-purple-300 transition cursor-pointer"
                        >
                            <span className="font-bold text-purple-400 block font-mono">Fase 6 • Gobernanza</span>
                            <span className="text-[10px] text-white block mt-0.5 leading-tight">Cierre de Bucle</span>
                            <span className="text-[9px] text-slate-400 block">SINPAD, BAE & SAC</span>
                        </Link>
                    </div>
                </div>

                {/* Tabs de Selección de los 3 Niveles */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 pt-2 border-t border-slate-800">
                    <button
                        onClick={() => setActiveTab("NACIONAL")}
                        className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between text-left ${
                            activeTab === "NACIONAL"
                                ? "bg-slate-800/90 border-rose-500/80 shadow-lg shadow-rose-950/30 ring-1 ring-rose-500/50"
                                : "bg-slate-950/60 border-slate-800/80 hover:bg-slate-800/40 text-slate-400"
                        }`}
                    >
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-xl ${activeTab === "NACIONAL" ? "bg-rose-500 text-white" : "bg-slate-800 text-slate-400"}`}>
                                <Radio className="w-5 h-5" />
                            </div>
                            <div>
                                <span className="text-[10px] font-mono uppercase tracking-wider block text-rose-400 font-bold">Nivel 1 • Macro C2 (Anillo 1)</span>
                                <span className="text-xs font-bold text-white">CONSOLA NACIONAL DE ALERTAS</span>
                            </div>
                        </div>
                        <span className="text-[11px] font-mono font-bold bg-slate-900 px-2 py-0.5 rounded text-slate-300 border border-slate-800">
                            {resumenNacional?.estadisticas?.total_alertas_nacionales ?? 3} activas
                        </span>
                    </button>

                    <button
                        onClick={() => setActiveTab("MUNICIPAL")}
                        className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between text-left ${
                            activeTab === "MUNICIPAL"
                                ? "bg-slate-800/90 border-cyan-500/80 shadow-lg shadow-cyan-950/30 ring-1 ring-cyan-500/50"
                                : "bg-slate-950/60 border-slate-800/80 hover:bg-slate-800/40 text-slate-400"
                        }`}
                    >
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-xl ${activeTab === "MUNICIPAL" ? "bg-cyan-500 text-slate-950" : "bg-slate-800 text-slate-400"}`}>
                                <Building2 className="w-5 h-5" />
                            </div>
                            <div>
                                <span className="text-[10px] font-mono uppercase tracking-wider block text-cyan-400 font-bold">Nivel 2 • Despacho Local (Anillo 2)</span>
                                <span className="text-xs font-bold text-white">BANDEJA DEL ALCALDE (COED Municipal)</span>
                            </div>
                        </div>
                        <span className="text-[11px] font-mono font-bold bg-slate-900 px-2 py-0.5 rounded text-cyan-300 border border-slate-800">
                            {bandejaMunicipal.length} en bandeja
                        </span>
                    </button>

                    <button
                        onClick={() => setActiveTab("SOCIAL")}
                        className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between text-left ${
                            activeTab === "SOCIAL"
                                ? "bg-slate-800/90 border-emerald-500/80 shadow-lg shadow-emerald-950/30 ring-1 ring-emerald-500/50"
                                : "bg-slate-950/60 border-slate-800/80 hover:bg-slate-800/40 text-slate-400"
                        }`}
                    >
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-xl ${activeTab === "SOCIAL" ? "bg-emerald-500 text-slate-950" : "bg-slate-800 text-slate-400"}`}>
                                <Users className="w-5 h-5" />
                            </div>
                            <div>
                                <span className="text-[10px] font-mono uppercase tracking-wider block text-emerald-400 font-bold">Nivel 3 • Comunidad</span>
                                <span className="text-xs font-bold text-white">CONSOLA SOCIAL DE ALERTAS</span>
                            </div>
                        </div>
                        <span className="text-[11px] font-mono font-bold bg-slate-900 px-2 py-0.5 rounded text-emerald-300 border border-slate-800">
                            Ciudadanía
                        </span>
                    </button>
                </div>
            </div>

            {/* ============================================================== */}
            {/* PESTAÑA 1: CONSOLA NACIONAL DE ALERTAS (COED NACIONAL AMARU)  */}
            {/* ============================================================== */}
            {activeTab === "NACIONAL" && (
                <div className="space-y-6">
                    {/* DOCK C2 DE LAS 9 FUENTES DE TELEMETRÍA DEL ANILLO 1 */}
                    <div className="bg-slate-900 border border-sky-800/60 rounded-2xl p-4 shadow-xl space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-mono font-bold text-sky-400 flex items-center gap-1.5 uppercase">
                                <Satellite className="w-4 h-4 text-sky-400" />
                                Fuentes de Telemetría e Ingesta Científica del Anillo 1 (Físico-Hidrocinético y Crioclimático)
                            </span>
                            <span className="text-[10px] font-mono text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                                9 CONSOLAS ARTICULADAS
                            </span>
                        </div>
                        <div className="grid grid-cols-3 md:grid-cols-9 gap-2 text-[11px]">
                            <Link href="/geovisor" className="bg-slate-950 border border-slate-800 hover:border-sky-500 p-2 rounded-xl text-center transition group">
                                <Satellite className="w-3.5 h-3.5 text-sky-400 mx-auto group-hover:scale-110 transition" />
                                <span className="text-[10px] font-bold text-slate-300 block mt-1">Geovisor 3D</span>
                            </Link>
                            <Link href="/satelites" className="bg-slate-950 border border-slate-800 hover:border-cyan-500 p-2 rounded-xl text-center transition group">
                                <Satellite className="w-3.5 h-3.5 text-cyan-400 mx-auto group-hover:scale-110 transition" />
                                <span className="text-[10px] font-bold text-slate-300 block mt-1">Satélites</span>
                            </Link>
                            <Link href="/imarpe" className="bg-slate-950 border border-slate-800 hover:border-teal-500 p-2 rounded-xl text-center transition group">
                                <Waves className="w-3.5 h-3.5 text-teal-400 mx-auto group-hover:scale-110 transition" />
                                <span className="text-[10px] font-bold text-slate-300 block mt-1">IMARPE BDO</span>
                            </Link>
                            <Link href="/enfen" className="bg-slate-950 border border-slate-800 hover:border-red-500 p-2 rounded-xl text-center transition group">
                                <ShieldAlert className="w-3.5 h-3.5 text-red-400 mx-auto group-hover:scale-110 transition animate-pulse" />
                                <span className="text-[10px] font-bold text-slate-300 block mt-1">ENFEN</span>
                            </Link>
                            <Link href="/rios-norte" className="bg-slate-950 border border-slate-800 hover:border-cyan-500 p-2 rounded-xl text-center transition group">
                                <Waves className="w-3.5 h-3.5 text-cyan-400 mx-auto group-hover:scale-110 transition" />
                                <span className="text-[10px] font-bold text-slate-300 block mt-1">Ríos ANA</span>
                            </Link>
                            <Link href="/quebradas" className="bg-slate-950 border border-slate-800 hover:border-rose-500 p-2 rounded-xl text-center transition group">
                                <AlertTriangle className="w-3.5 h-3.5 text-rose-400 mx-auto group-hover:scale-110 transition" />
                                <span className="text-[10px] font-bold text-slate-300 block mt-1">Quebradas</span>
                            </Link>
                            <Link href="/simulacion" className="bg-slate-950 border border-slate-800 hover:border-amber-500 p-2 rounded-xl text-center transition group">
                                <Zap className="w-3.5 h-3.5 text-amber-400 mx-auto group-hover:scale-110 transition" />
                                <span className="text-[10px] font-bold text-slate-300 block mt-1">Mega-FEN</span>
                            </Link>
                            <Link href="/meteo" className="bg-slate-950 border border-slate-800 hover:border-sky-500 p-2 rounded-xl text-center transition group">
                                <Activity className="w-3.5 h-3.5 text-sky-400 mx-auto group-hover:scale-110 transition" />
                                <span className="text-[10px] font-bold text-slate-300 block mt-1">Meteo</span>
                            </Link>
                            <Link href="/fuentes" className="bg-slate-950 border border-slate-800 hover:border-indigo-500 p-2 rounded-xl text-center transition group">
                                <Database className="w-3.5 h-3.5 text-indigo-400 mx-auto group-hover:scale-110 transition" />
                                <span className="text-[10px] font-bold text-slate-300 block mt-1">Fuentes</span>
                            </Link>
                        </div>
                    </div>

                    {/* Tarjetas KPI Nacionales */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl">
                            <span className="text-xs text-slate-400 uppercase font-semibold block">Alertas Nacionales Activas</span>
                            <span className="text-2xl font-black text-white font-mono mt-1 block">
                                {resumenNacional?.estadisticas?.total_alertas_nacionales ?? "--"}
                            </span>
                            <span className="text-[11px] text-rose-400 block mt-0.5">Vigilancia continua ECMWF</span>
                        </div>

                        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl">
                            <span className="text-xs text-slate-400 uppercase font-semibold block">Distritos con Alerta Activa</span>
                            <span className="text-2xl font-black text-cyan-300 font-mono mt-1 block">
                                {resumenNacional?.estadisticas?.total_distritos_alertados ?? "--"}
                            </span>
                            <span className="text-[11px] text-slate-400 block mt-0.5">Con Directiva C2 (de 1,813 nacionales)</span>
                        </div>

                        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl">
                            <span className="text-xs text-slate-400 uppercase font-semibold block">En Bandejas de Alcaldes</span>
                            <span className="text-2xl font-black text-amber-300 font-mono mt-1 block">
                                {resumenNacional?.estadisticas?.total_items_en_bandejas ?? "--"}
                            </span>
                            <span className="text-[11px] text-amber-400 block mt-0.5">Despacho digital seguro</span>
                        </div>

                        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl">
                            <span className="text-xs text-slate-400 uppercase font-semibold block">Detonadas en Terreno</span>
                            <span className="text-2xl font-black text-emerald-300 font-mono mt-1 block">
                                {resumenNacional?.estadisticas?.alertas_validadas_por_alcaldes ?? "--"}
                            </span>
                            <span className="text-[11px] text-emerald-400 block mt-0.5">Con firma digital SHA-256</span>
                        </div>
                    </div>

                    {/* Barra de Filtros y Botón de Emisión con Separación FEN vs CHIRI */}
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1">Régimen:</span>
                            
                            <button
                                onClick={() => setFiltroRegimen("PLUVIAL_FEN")}
                                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border ${
                                    filtroRegimen === "PLUVIAL_FEN"
                                        ? "bg-red-600 text-white border-red-500 shadow-md shadow-red-600/30"
                                        : "bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700 hover:text-white"
                                }`}
                            >
                                <span className="w-2 h-2 rounded-full bg-red-400" />
                                <span>🔴 FEN (Lluvias & Huaicos)</span>
                            </button>

                            <button
                                onClick={() => setFiltroRegimen("CRIOCLIMA_CHIRI")}
                                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border ${
                                    filtroRegimen === "CRIOCLIMA_CHIRI"
                                        ? "bg-sky-600 text-white border-sky-500 shadow-md shadow-sky-600/30"
                                        : "bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700 hover:text-white"
                                }`}
                            >
                                <span className="w-2 h-2 rounded-full bg-sky-400" />
                                <span>🔵 CHIRI (Heladas & Friajes)</span>
                            </button>

                            <button
                                onClick={() => setFiltroRegimen("INCENDIO_FORESTAL")}
                                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border ${
                                    filtroRegimen === "INCENDIO_FORESTAL"
                                        ? "bg-amber-600 text-white border-amber-500 shadow-md shadow-amber-600/30"
                                        : "bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700 hover:text-white"
                                }`}
                            >
                                <span className="w-2 h-2 rounded-full bg-amber-400" />
                                <span>🔥 FUEGO (Incendio Forestal)</span>
                            </button>

                            <button
                                onClick={() => setFiltroRegimen("ALL")}
                                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border ${
                                    filtroRegimen === "ALL"
                                        ? "bg-purple-600 text-white border-purple-500 shadow-md shadow-purple-600/30"
                                        : "bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700 hover:text-white"
                                }`}
                            >
                                <span className="w-2 h-2 rounded-full bg-purple-400" />
                                <span>🟣 Vista Consolidada (Todos)</span>
                            </button>

                            <div className="h-4 w-px bg-slate-800 mx-1 hidden sm:block" />

                            <select
                                value={filtroNivel}
                                onChange={(e) => setFiltroNivel(e.target.value)}
                                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                            >
                                <option value="ALL">Todos los Niveles</option>
                                <option value="ROJO">🔴 Alerta Roja</option>
                                <option value="NARANJA">🟠 Alerta Naranja</option>
                                <option value="AMARILLO">🟡 Alerta Amarilla</option>
                            </select>
                        </div>

                        <button
                            onClick={() => setModalNuevaAlerta(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-rose-600 to-red-700 hover:from-rose-500 hover:to-red-600 text-white font-bold rounded-xl text-xs shadow-lg shadow-rose-950/50 transition w-full md:w-auto justify-center"
                        >
                            <Send className="w-4 h-4" />
                            <span>Emitir Alerta Temprana Nacional (EAP)</span>
                        </button>
                    </div>

                    {/* Lista de Alertas Nacionales */}
                    <div className="space-y-4">
                        {resumenNacional?.alertas_activas?.filter((a: any) => {
                            if (filtroRegimen !== "ALL" && a.regimen !== filtroRegimen) return false;
                            if (filtroNivel !== "ALL" && a.nivel_alerta !== filtroNivel) return false;
                            return true;
                        }).map((alerta: AlertaNacionalItem) => (
                            <div
                                key={alerta.id_alerta}
                                className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition space-y-4 shadow-xl"
                            >
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                                    <div className="flex items-center gap-2.5 flex-wrap">
                                        <span className={`px-2.5 py-0.5 rounded text-xs font-bold font-mono border ${getBadgeClass(alerta.nivel_alerta)}`}>
                                            NIVEL {alerta.nivel_alerta}
                                        </span>
                                        <span className="px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-slate-800 text-cyan-300 border border-cyan-800/60">
                                            VENTANA {alerta.lead_time} ({alerta.horas_anticipacion}h)
                                        </span>
                                        <span className="text-xs font-mono text-slate-400">
                                            ID: {alerta.id_alerta}
                                        </span>
                                    </div>
                                    <span className="text-[11px] text-slate-500 font-mono">
                                        Emitido: {new Date(alerta.fecha_emision_utc).toLocaleString("es-PE")}
                                    </span>
                                </div>

                                <div>
                                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                                        {alerta.titulo}
                                    </h3>
                                    <p className="text-xs text-slate-300 mt-1">
                                        {alerta.gatillo_cientifico}
                                    </p>
                                </div>

                                {/* Destinatarios e impacto */}
                                <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800/80 text-xs space-y-2">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className="font-bold text-slate-400">Bandejas Municipales Notificadas:</span>
                                        {alerta.distritos_nombres?.map((nom, idx) => (
                                            <span key={idx} className="px-2 py-0.5 bg-slate-900 text-slate-200 rounded border border-slate-800 font-mono">
                                                {nom}
                                            </span>
                                        ))}
                                    </div>
                                    <div className="text-[11px] font-mono text-slate-400 break-all">
                                        <strong>Sello Criptográfico SHA-256:</strong> SHA256:{alerta.hash_sha256}
                                    </div>
                                </div>

                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pt-2 border-t border-slate-800/60 text-xs gap-3">
                                    <div className="flex items-center gap-2">
                                        {alerta.estado_general === "PROPUESTA_AGENTICA_PENDIENTE" ? (
                                            <div className="flex items-center gap-1.5 text-amber-400 font-medium bg-amber-950/60 px-2.5 py-1 rounded-lg border border-amber-600/50">
                                                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                                                <span>Propuesta Agéntica Pendiente de Firma Humana (HITL)</span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-1.5 text-emerald-400 font-medium bg-emerald-950/60 px-2.5 py-1 rounded-lg border border-emerald-600/50">
                                                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                                                <span>Alerta Validada para Distribución Institucional</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-2">
                                        {alerta.estado_general === "PROPUESTA_AGENTICA_PENDIENTE" ? (
                                            <button
                                                onClick={() => setAlertaParaAprobarHitl(alerta)}
                                                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition shadow-lg shadow-emerald-950/40 text-xs"
                                            >
                                                <ShieldCheck className="w-3.5 h-3.5" />
                                                <span>Firmar y Validar (HITL)</span>
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => {
                                                    setActiveTab("MUNICIPAL");
                                                    if (alerta.distritos_objetivo.length > 0) {
                                                        setSelectedUbigeo(alerta.distritos_objetivo[0]);
                                                        setDistritoNombre(alerta.distritos_nombres[0] || "Distrito");
                                                    }
                                                }}
                                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/30 font-semibold transition text-xs"
                                            >
                                                <span>Auditar en Bandeja Municipal</span>
                                                <ArrowRight className="w-3.5 h-3.5" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ============================================================== */}
            {/* PESTAÑA 2: BANDEJA MUNICIPAL DEL ALCALDE (COED MUNICIPAL AMARU) */}
            {/* ============================================================== */}
            {activeTab === "MUNICIPAL" && (
                <div className="space-y-6">
                    {/* Banner de Identidad Municipal */}
                    <div className="bg-gradient-to-r from-amber-950/80 via-slate-900 to-slate-950 border border-amber-800/50 rounded-3xl p-5 shadow-xl space-y-3">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div>
                                <div className="flex items-center gap-2 mb-1 flex-wrap">
                                    <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-black bg-amber-500 text-slate-950 uppercase tracking-wider">
                                        NIVEL 2 • COED MUNICIPAL
                                    </span>
                                    <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-950 text-amber-300 border border-amber-700/60">
                                        ANILLO 2: TÁCTICO TERRITORIAL & DESPLIEGUE LOCAL
                                    </span>
                                    <span className="text-xs text-slate-400 font-mono">
                                        UBIGEO: {selectedUbigeo}
                                    </span>
                                </div>
                                <h2 className="text-2xl font-black text-white flex items-center gap-2">
                                    <Building2 className="w-6 h-6 text-amber-400" />
                                    Bandeja de Entrada del Alcalde: {distritoNombre}
                                </h2>
                                <p className="text-xs text-slate-300 mt-1 max-w-2xl">
                                    Recepción directa de mandatos de acción temprana desde el <strong>COED Nacional AMARU</strong>. Validación local, asignación de recursos (<strong className="text-amber-300">PP 0068 / Art. 27 Ley 30225</strong>) y blindaje jurídico (<strong className="text-amber-300">Art. 377 Código Penal</strong>).
                                </p>
                            </div>

                            <button
                                onClick={() => fetchMunicipal(selectedUbigeo)}
                                className="flex items-center gap-2 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition border border-slate-700"
                            >
                                <RefreshCw className={`w-4 h-4 ${loadingMunicipal ? "animate-spin text-amber-400" : ""}`} />
                                <span>Actualizar Bandeja</span>
                            </button>
                        </div>

                        {/* DOCK TÁCTICO MUNICIPAL EN BANDEJA */}
                        <div className="pt-2 border-t border-slate-800/80">
                            <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-bold block mb-1.5">
                                HERRAMIENTAS TÁCTICAS MUNICIPALES VINCULADAS
                            </span>
                            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-[11px]">
                                <Link href="/pronostico" className="bg-slate-950 border border-slate-800 hover:border-amber-500 p-2 rounded-xl transition group">
                                    <Clock className="w-3.5 h-3.5 text-amber-400 mb-1 group-hover:scale-110 transition" />
                                    <span className="font-bold text-white block">Reloj Polar & EAP</span>
                                    <span className="text-[9px] text-slate-400 block">Ventana Dorada tc</span>
                                </Link>
                                <Link href={`/municipal/${selectedUbigeo}`} className="bg-slate-950 border border-slate-800 hover:border-cyan-500 p-2 rounded-xl transition group">
                                    <Building2 className="w-3.5 h-3.5 text-cyan-400 mb-1 group-hover:scale-110 transition" />
                                    <span className="font-bold text-white block">Suite Municipal 360°</span>
                                    <span className="text-[9px] text-slate-400 block">Obras PP 0068</span>
                                </Link>
                                <Link href={`/dashboard/${selectedUbigeo}`} className="bg-slate-950 border border-slate-800 hover:border-indigo-500 p-2 rounded-xl transition group">
                                    <Compass className="w-3.5 h-3.5 text-indigo-400 mb-1 group-hover:scale-110 transition" />
                                    <span className="font-bold text-white block">Inspector Distrital</span>
                                    <span className="text-[9px] text-slate-400 block">Ficha territorial</span>
                                </Link>
                                <Link href="/planes" className="bg-slate-950 border border-slate-800 hover:border-emerald-500 p-2 rounded-xl transition group">
                                    <FileText className="w-3.5 h-3.5 text-emerald-400 mb-1 group-hover:scale-110 transition" />
                                    <span className="font-bold text-white block">Planes Contingencia</span>
                                    <span className="text-[9px] text-slate-400 block">PCMD y PPRRD</span>
                                </Link>
                                <Link href="/redactor" className="bg-slate-950 border border-slate-800 hover:border-amber-500 p-2 rounded-xl transition group">
                                    <FileEdit className="w-3.5 h-3.5 text-amber-400 mb-1 group-hover:scale-110 transition" />
                                    <span className="font-bold text-white block">Redactor QILQAY</span>
                                    <span className="text-[9px] text-slate-400 block">Actas Notariales</span>
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Selector Rápido de Alcaldías por Régimen (Separación FEN vs CHIRI) */}
                    <div className="bg-slate-900/90 border border-slate-800 p-3.5 rounded-2xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 text-xs shadow-lg">
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-slate-400 uppercase tracking-wider text-[11px]">Bandeja por Distrito:</span>
                            
                            {/* Grupo FEN Costa Norte */}
                            <div className="flex items-center gap-1 p-1 bg-red-950/40 rounded-xl border border-red-800/40">
                                <span className="text-[10px] font-bold text-red-400 px-1.5 flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                                    FEN Norte:
                                </span>
                                {[
                                    { u: "200101", n: "Piura" },
                                    { u: "200104", n: "Castilla" },
                                    { u: "200105", n: "Catacaos" },
                                    { u: "140305", n: "Jayanca" },
                                    { u: "140304", n: "Íllimo" },
                                ].map((d) => (
                                    <button
                                        key={d.u}
                                        onClick={() => handleSwitchUbigeo(d.u, `${d.n} (${d.u})`)}
                                        className={`px-2.5 py-1 rounded-lg font-mono text-[11px] transition ${
                                            selectedUbigeo === d.u
                                                ? "bg-red-600 text-white font-bold shadow-md shadow-red-600/30"
                                                : "text-slate-300 hover:text-white hover:bg-slate-800/60"
                                        }`}
                                    >
                                        {d.n}
                                    </button>
                                ))}
                            </div>

                            {/* Grupo CHIRI Sierra/Altiplano */}
                            <div className="flex items-center gap-1 p-1 bg-sky-950/40 rounded-xl border border-sky-800/40">
                                <span className="text-[10px] font-bold text-sky-400 px-1.5 flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                                    CHIRI Puno:
                                </span>
                                {[
                                    { u: "210504", n: "Mazocruz" },
                                    { u: "210301", n: "Macusani" },
                                    { u: "211002", n: "Ananea" },
                                    { u: "210401", n: "Ilave" },
                                ].map((d) => (
                                    <button
                                        key={d.u}
                                        onClick={() => handleSwitchUbigeo(d.u, `${d.n} (${d.u})`)}
                                        className={`px-2.5 py-1 rounded-lg font-mono text-[11px] transition ${
                                            selectedUbigeo === d.u
                                                ? "bg-sky-600 text-white font-bold shadow-md shadow-sky-600/30"
                                                : "text-slate-300 hover:text-white hover:bg-slate-800/60"
                                        }`}
                                    >
                                        {d.n}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="text-[11px] text-slate-400 font-mono bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
                            Distrito activo: <strong className="text-white">{distritoNombre}</strong>
                        </div>
                    </div>

                    {/* Alertas en Bandeja */}
                    <div className="space-y-4">
                        {bandejaMunicipal.map((alerta) => {
                            const estaDetonada = alerta.estado_municipal === "DETONADA_Y_COMUNICADA";
                            return (
                                <div
                                    key={alerta.id_alerta}
                                    className={`rounded-3xl p-6 border transition-all space-y-5 shadow-2xl ${
                                        estaDetonada
                                            ? "bg-slate-900/80 border-emerald-500/40"
                                            : "bg-slate-900 border-amber-500/50 ring-1 ring-amber-500/30"
                                    }`}
                                >
                                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                                        <div className="flex items-center gap-2.5 flex-wrap">
                                            <span className={`px-2.5 py-0.5 rounded text-xs font-bold font-mono border ${getBadgeClass(alerta.nivel_alerta)}`}>
                                                {alerta.nivel_alerta}
                                            </span>
                                            <span className="px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-slate-800 text-amber-300 border border-amber-700/50">
                                                {alerta.lead_time}
                                            </span>
                                            <span className={`px-2.5 py-0.5 rounded text-xs font-bold font-mono ${
                                                estaDetonada
                                                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                                                    : "bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse"
                                            }`}>
                                                {estaDetonada ? "ORDEN EAP DETONADA & PUBLICADA" : "PENDIENTE DE VALIDACIÓN DEL ALCALDE"}
                                            </span>
                                        </div>

                                        <span className="text-xs text-slate-400 font-mono">
                                            Ingresó a bandeja: {new Date(alerta.fecha_ingreso_bandeja).toLocaleTimeString("es-PE")}
                                        </span>
                                    </div>

                                    <div>
                                        <h3 className="text-lg font-bold text-white">
                                            {alerta.titulo}
                                        </h3>
                                        <p className="text-xs text-slate-300 mt-1">
                                            <strong>Gatillo Científico:</strong> {alerta.gatillo_cientifico}
                                        </p>
                                    </div>

                                    {/* Cruce Local Específico del Distrito */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                                            <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider block">
                                                Infraestructura Local en Riesgo:
                                            </span>
                                            <ul className="text-xs text-slate-300 space-y-1">
                                                {alerta.regimen === "INCENDIO_FORESTAL" ? (
                                                    <>
                                                        <li>• Cobertura vegetal y biomasa combustible en ladera (estrés hídrico severo).</li>
                                                        <li>• Viviendas rurales y caseríos en radio de amortiguamiento de 3 a 5 km.</li>
                                                        <li>• Vías de penetración y tomas de agua con necesidad de cisterna 5,000 gal.</li>
                                                    </>
                                                ) : alerta.regimen === "CRIOCLIMA_CHIRI" ? (
                                                    <>
                                                        <li>• 85,000 ha de bofedales y pastos con riesgo de congelamiento.</li>
                                                        <li>• 80,430 alpacas y 42,000 ovinos en riesgo de corte alimentario.</li>
                                                        <li>• 239 menores de 5 años bajo vigilancia prioritaria IRA/Neumonía.</li>
                                                    </>
                                                ) : (
                                                    <>
                                                        <li>• 4 Cuencas Ciegas SARE (El Chilcal, La Rinconada, Gullman).</li>
                                                        <li>• 32 Manzanas censales ANA en faja marginal inundable.</li>
                                                        <li>• Puente Sánchez Cerro y Bolognesi con riesgo de colapso de estribos.</li>
                                                    </>
                                                )}
                                            </ul>
                                        </div>

                                        <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                                            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block">
                                                Protocolos EAP Mandatados por el COED:
                                            </span>
                                            <ul className="text-xs text-slate-300 space-y-1">
                                                {alerta.acciones_mandatadas_eap?.map((acc, idx) => (
                                                    <li key={idx}>• {acc}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>

                                    {/* Panel de Acción del Alcalde */}
                                    <div className="pt-2 flex flex-col sm:flex-row justify-between items-center gap-3 border-t border-slate-800">
                                        <div className="text-xs text-slate-400 font-mono">
                                            Habilitante: <strong>PP 0068 / Exoneración Ley 30225 Art. 27 lit. b</strong>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            {!estaDetonada ? (
                                                <button
                                                    onClick={() => setAlertaParaDetonar(alerta)}
                                                    className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white font-bold rounded-xl text-xs shadow-lg shadow-red-950/50 transition"
                                                >
                                                    <ShieldAlert className="w-4 h-4" />
                                                    <span>Firmar Acta EAP y Emitir Alerta Social</span>
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => setActiveTab("SOCIAL")}
                                                    className="flex items-center gap-2 px-4 py-2 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 font-bold rounded-xl text-xs transition"
                                                >
                                                    <CheckCircle2 className="w-4 h-4" />
                                                    <span>Ver Comunicado en Consola Social &rarr;</span>
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* ============================================================== */}
            {/* PESTAÑA 3: CONSOLA SOCIAL DE ALERTAS (COED SOCIAL AMARU)       */}
            {/* ============================================================== */}
            {activeTab === "SOCIAL" && (
                <div className="max-w-4xl mx-auto space-y-6">
                    {/* Cabecera Ciudadana Limpia */}
                    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl text-center space-y-3">
                        <div className="flex flex-wrap items-center justify-center gap-2">
                            <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-full text-xs font-bold font-mono tracking-wider uppercase inline-flex items-center gap-1.5">
                                <Users className="w-3.5 h-3.5" />
                                NIVEL 3 • COED SOCIAL AMARU
                            </span>
                            <span className="px-2.5 py-0.5 rounded text-[10px] font-mono bg-rose-950/80 text-rose-300 border border-rose-800 font-bold">
                                BORDE CIUDADANO &amp; SENSOR HUMANO
                            </span>
                            <span className="px-2.5 py-0.5 rounded text-[10px] font-mono bg-blue-950 text-blue-300 border border-blue-800 font-bold">
                                TRÍADA TRIPARTITA: CUP-DAMN / MINSA / AGRO
                            </span>
                        </div>
                        <h2 className="text-2xl md:text-3xl font-black text-white">
                            Tablero Cívico de Alertas: {distritoNombre}
                        </h2>
                        <p className="text-xs text-slate-300 max-w-2xl mx-auto">
                            Información oficial en lenguaje claro para Juntas Vecinales, Rondas Campesinas, Comités de Regantes y Familias. Sin alarmismos ni noticias falsas. Articulado con el Nivel 2 Municipal y respaldado por el Nivel 4 de Fe Pública.
                        </p>

                        {/* Dock de Consolas del Nivel 3 Social */}
                        <div className="p-3 bg-slate-950/90 border border-rose-900/40 rounded-2xl flex flex-wrap items-center justify-center gap-2 text-xs">
                            <span className="text-[11px] font-bold text-rose-400 mr-1 flex items-center gap-1">
                                <Radio className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
                                HERRAMIENTAS COMUNITARIAS:
                            </span>
                            <Link href="/reporte-ciudadano" className="px-2.5 py-1 rounded-lg bg-rose-900/40 hover:bg-rose-800/60 text-rose-200 border border-rose-700/40 transition flex items-center gap-1">
                                <Radio className="w-3 h-3 text-rose-400" />
                                <span>Sensor Humano C2</span>
                            </Link>
                            <Link href="/ayni" className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-rose-950/60 text-slate-300 hover:text-rose-200 border border-slate-800 transition flex items-center gap-1">
                                <Users className="w-3 h-3 text-rose-400" />
                                <span>Red AYNI</span>
                            </Link>
                            <Link href="/salud/triaje" className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-rose-950/60 text-slate-300 hover:text-rose-200 border border-slate-800 transition flex items-center gap-1">
                                <HeartPulse className="w-3 h-3 text-rose-400" />
                                <span>Triaje Salud</span>
                            </Link>
                            <Link href="/yachay" className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-emerald-950/60 text-slate-300 hover:text-emerald-200 border border-slate-800 transition flex items-center gap-1">
                                <GraduationCap className="w-3 h-3 text-emerald-400" />
                                <span>Capacitación Yachay</span>
                            </Link>
                            <Link href="/glosario" className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-cyan-950/60 text-slate-300 hover:text-cyan-200 border border-slate-800 transition flex items-center gap-1">
                                <BookOpen className="w-3 h-3 text-cyan-400" />
                                <span>Glosario</span>
                            </Link>
                            <span className="text-slate-600">|</span>
                            <Link href="/edan" className="px-2.5 py-1 rounded-lg bg-emerald-950/60 hover:bg-emerald-900 text-emerald-200 border border-emerald-800/50 transition flex items-center gap-1 text-[11px]">
                                <span>⚖️ Nivel 4 Fe Pública</span>
                            </Link>
                        </div>

                        {/* Conmutador de Idioma */}
                        <div className="pt-2 flex justify-center items-center gap-2 text-xs">
                            <span className="text-slate-400 font-semibold flex items-center gap-1">
                                <Languages className="w-4 h-4 text-cyan-400" />
                                Idioma / Simi / Aru:
                            </span>
                            <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
                                <button
                                    onClick={() => setIdiomaSocial("castellano")}
                                    className={`px-3 py-1 rounded-lg font-bold transition ${
                                        idiomaSocial === "castellano"
                                            ? "bg-cyan-500 text-slate-950"
                                            : "text-slate-400 hover:text-white"
                                    }`}
                                >
                                    Castellano
                                </button>
                                <button
                                    onClick={() => setIdiomaSocial("quechua")}
                                    className={`px-3 py-1 rounded-lg font-bold transition ${
                                        idiomaSocial === "quechua"
                                            ? "bg-amber-500 text-slate-950"
                                            : "text-slate-400 hover:text-white"
                                    }`}
                                >
                                    Quechua
                                </button>
                                <button
                                    onClick={() => setIdiomaSocial("aymara")}
                                    className={`px-3 py-1 rounded-lg font-bold transition ${
                                        idiomaSocial === "aymara"
                                            ? "bg-blue-500 text-slate-950"
                                            : "text-slate-400 hover:text-white"
                                    }`}
                                >
                                    Aymara
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Semáforo Ciudadano & Instrucciones */}
                    {alertaSocialVigente && (
                        <div className={`rounded-3xl p-6 border space-y-5 shadow-2xl ${
                            alertaSocialVigente.nivel_alerta === "ROJO"
                                ? "bg-rose-950/40 border-rose-500/70 ring-2 ring-rose-500/30"
                                : alertaSocialVigente.nivel_alerta === "NARANJA"
                                ? "bg-amber-950/40 border-amber-500/60"
                                : "bg-slate-900 border-slate-800"
                        }`}>
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-800/80 pb-4">
                                <div className="flex items-center gap-2">
                                    <span className="text-xl font-black text-white">
                                        {alertaSocialVigente.semáforo_ciudadano}
                                    </span>
                                </div>
                                <span className="text-xs font-mono text-slate-400">
                                    Actualizado: {new Date(alertaSocialVigente.fecha_publicacion).toLocaleTimeString("es-PE")}
                                </span>
                            </div>

                            {/* Mensaje en Lenguaje Claro */}
                            <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 text-sm md:text-base text-slate-100 font-medium leading-relaxed">
                                {alertaSocialVigente.instrucciones_comunitarias[idiomaSocial]}
                            </div>

                            {/* Albergues y Refugios Seguros */}
                            <div className="space-y-3">
                                <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                                    <Building2 className="w-4 h-4" />
                                    Albergues y Puntos Seguros Autorizados por el Municipio:
                                </span>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                    {alertaSocialVigente.albergues_seguros?.map((alb, i) => (
                                        <div key={i} className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center gap-2 text-xs">
                                            <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
                                            <span className="font-semibold text-white">{alb}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Números de Emergencia Directos */}
                            <div className="space-y-3 pt-2 border-t border-slate-800/80">
                                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                                    <PhoneCall className="w-4 h-4 text-emerald-400" />
                                    Líneas de Atención Inmediata:
                                </span>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
                                    {alertaSocialVigente.numeros_emergencia?.map((tel, idx) => (
                                        <div key={idx} className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 text-center">
                                            <span className="text-[10px] text-slate-400 block font-sans">{tel.entidad}</span>
                                            <span className="font-bold text-emerald-400 text-sm">{tel.telefono}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="text-[10px] font-mono text-slate-500 break-all pt-1">
                                Acta Oficial Firmada: {alertaSocialVigente.hash_acta_sha256}
                            </div>
                        </div>
                    )}

                    {/* Protocolo de Telemetría Inversa: Reporte Ciudadano */}
                    <div className="bg-gradient-to-r from-blue-950/60 to-slate-900 border border-blue-900/40 rounded-3xl p-6 shadow-xl flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="space-y-1">
                            <h3 className="text-base font-bold text-white flex items-center gap-2">
                                <ShieldCheck className="w-5 h-5 text-cyan-400" />
                                ¿Detectas desbordes, inundaciones o nevadas en tu zona?
                            </h3>
                            <p className="text-xs text-slate-300">
                                Envía tu reporte con foto y ubicación GPS. Pasará por el filtro pericial anti-fake news de AMARU para actualizar en vivo la Sala de Crisis del Alcalde.
                            </p>
                        </div>

                        <Link
                            href="/reporte-ciudadano"
                            className="px-5 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-cyan-950 transition shrink-0"
                        >
                            <span>Enviar Reporte Ciudadano</span>
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                </div>
            )}

            {/* ============================================================== */}
            {/* MODAL: EMITIR ALERTA NACIONAL (COED NACIONAL)                  */}
            {/* ============================================================== */}
            {modalNuevaAlerta && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl relative">
                        <button
                            onClick={() => setModalNuevaAlerta(false)}
                            className="absolute top-5 right-5 text-slate-400 hover:text-white"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="flex items-center gap-2 text-rose-400">
                            <Radio className="w-6 h-6" />
                            <h3 className="text-lg font-bold text-white">
                                Despachar Alerta Temprana Nacional C2
                            </h3>
                        </div>

                        <form onSubmit={handleEmitirAlertaNacional} className="space-y-3.5 text-xs">
                            <div>
                                <label className="text-slate-400 block mb-1">Título Oficial de la Alerta:</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Ej. Alerta Roja por Lluvias Torrenciales en Cuenca Piura"
                                    value={formTitulo}
                                    onChange={(e) => setFormTitulo(e.target.value)}
                                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-rose-500"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-slate-400 block mb-1">Régimen Climático:</label>
                                    <select
                                        value={formRegimen}
                                        onChange={(e) => setFormRegimen(e.target.value as any)}
                                        className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-rose-500"
                                    >
                                        <option value="PLUVIAL_FEN">🔴 FASE CÁLIDA (FEN Lluvias)</option>
                                        <option value="CRIOCLIMA_CHIRI">🔵 FASE FRÍA (CHIRI Heladas)</option>
                                        <option value="INCENDIO_FORESTAL">🔥 FUEGO (Incendio Forestal / VIIRS)</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="text-slate-400 block mb-1">Ventana Lead Time:</label>
                                    <select
                                        value={formLeadTime}
                                        onChange={(e) => setFormLeadTime(e.target.value as any)}
                                        className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-rose-500"
                                    >
                                        <option value="T-144h">T-144h (6 Días / Estratégico)</option>
                                        <option value="T-72h">T-72h (3 Días / Táctico)</option>
                                        <option value="T-24h">T-24h (24 Horas / Inminente)</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="text-slate-400 block mb-1">UBIGEOs de los Municipios Destinatarios (separados por coma):</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="200101, 200104, 200105"
                                    value={formUbigeos}
                                    onChange={(e) => setFormUbigeos(e.target.value)}
                                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono focus:outline-none focus:border-rose-500"
                                />
                            </div>

                            <div>
                                <label className="text-slate-400 block mb-1">Gatillo Científico / Fundamentación Físico-Meteorológica:</label>
                                <textarea
                                    rows={3}
                                    placeholder="Detallar modelos numéricos, CAPE, caudal m³/s o temperatura mínima extrema..."
                                    value={formGatillo}
                                    onChange={(e) => setFormGatillo(e.target.value)}
                                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-rose-500"
                                />
                            </div>

                            <div className="flex justify-end gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setModalNuevaAlerta(false)}
                                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl flex items-center gap-2 shadow-lg shadow-rose-950"
                                >
                                    <Send className="w-4 h-4" />
                                    <span>Emitir y Despachar a Bandejas</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ============================================================== */}
            {/* MODAL: DETONACIÓN Y FIRMA MUNICIPAL (EL ALCALDE)                */}
            {/* ============================================================== */}
            {alertaParaDetonar && (
                <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl relative">
                        <button
                            onClick={() => {
                                setAlertaParaDetonar(null);
                                setDetonacionExitosa(null);
                            }}
                            className="absolute top-5 right-5 text-slate-400 hover:text-white"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="flex items-center gap-2 text-cyan-400">
                            <ShieldAlert className="w-6 h-6 text-red-400" />
                            <h3 className="text-lg font-bold text-white">
                                Detonar EAP Municipal & Publicar Alerta Comunitaria
                            </h3>
                        </div>

                        {detonacionExitosa ? (
                            <div className="space-y-4 bg-slate-950 p-4 rounded-xl border border-emerald-500/40">
                                <div className="flex items-center gap-2 text-emerald-400 font-bold">
                                    <CheckCircle2 className="w-5 h-5" />
                                    <span>ACTA FIRMADA Y ALERTA SOCIAL PUBLICADA</span>
                                </div>
                                <div className="text-xs space-y-1 font-mono text-slate-300">
                                    <p><strong>Acta:</strong> {detonacionExitosa.orden_despacho?.id_acta}</p>
                                    <p><strong>Autoridad:</strong> {detonacionExitosa.orden_despacho?.autoridad_firmante}</p>
                                    <p className="text-cyan-300">
                                        <strong>Recursos:</strong> {detonacionExitosa.orden_despacho?.recursos_asignados?.combustible_galones} gal. combustible • {detonacionExitosa.orden_despacho?.recursos_asignados?.motobombas_sare_desplegadas} motobombas
                                    </p>
                                </div>
                                <div className="p-2 bg-slate-900 rounded text-[10px] font-mono break-all text-slate-400 border border-slate-800">
                                    <strong>Firma SHA-256:</strong> {detonacionExitosa.orden_despacho?.hash_criptografico_sha256}
                                </div>
                                <button
                                    onClick={() => {
                                        setAlertaParaDetonar(null);
                                        setDetonacionExitosa(null);
                                        setActiveTab("SOCIAL");
                                    }}
                                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold rounded-xl text-xs transition flex items-center justify-center gap-2"
                                >
                                    <span>Ver Alerta Publicada en Consola Social</span>
                                    <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-3.5 text-xs">
                                <div>
                                    <label className="text-slate-400 block mb-1">Autoridad Firmante (Alcalde / GT-GRD):</label>
                                    <input
                                        type="text"
                                        value={autoridadFirmante}
                                        onChange={(e) => setAutoridadFirmante(e.target.value)}
                                        className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-cyan-500"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-slate-400 block mb-1">Combustible (Galones D-2):</label>
                                        <input
                                            type="number"
                                            value={combustibleInput}
                                            onChange={(e) => setCombustibleInput(Number(e.target.value))}
                                            className="w-full p-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-slate-400 block mb-1">
                                            {selectedUbigeo.startsWith("21") ? "Pacas Heno / Avena:" : "Motobombas SARE 6\":"}
                                        </label>
                                        <input
                                            type="number"
                                            value={selectedUbigeo.startsWith("21") ? pacasInput || 450 : motobombasInput}
                                            onChange={(e) => selectedUbigeo.startsWith("21") ? setPacasInput(Number(e.target.value)) : setMotobombasInput(Number(e.target.value))}
                                            className="w-full p-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono"
                                        />
                                    </div>
                                </div>

                                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5 text-slate-300">
                                    <span className="font-bold text-white block">Traducción Comunitaria Inteligente (IA QILQAY):</span>
                                    <p className="text-[11px] text-cyan-300">
                                        • Se publicará simultáneamente en Castellano, Quechua y Aymara en la Consola Social.
                                    </p>
                                    <p className="text-[11px] text-slate-400">
                                        • Amparo presupuestal: PP 0068 / Contratación Directa Art. 27 lit. b Ley Nº 30225.
                                    </p>
                                </div>

                                <div className="flex justify-end gap-2 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setAlertaParaDetonar(null)}
                                        className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="button"
                                        disabled={detonandoEAP}
                                        onClick={handleValidarYDetonar}
                                        className="px-5 py-2 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl flex items-center gap-2 shadow-lg shadow-red-950"
                                    >
                                        {detonandoEAP ? (
                                            <>
                                                <RefreshCw className="w-4 h-4 animate-spin" />
                                                <span>Firmando Acta SHA-256...</span>
                                            </>
                                        ) : (
                                            <>
                                                <Send className="w-4 h-4" />
                                                <span>Firmar y Emitir a la Comunidad</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ============================================================== */}
            {/* MODAL HITL: PUERTA DE SOBERANÍA HUMANA Y FIRMA DE ALERTA NACIONAL */}
            {/* ============================================================== */}
            {alertaParaAprobarHitl && (
                <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
                    <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-xl w-full p-6 text-slate-100 shadow-2xl space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400">
                                    <ShieldCheck className="w-6 h-6" />
                                </div>
                                <div>
                                    <h2 className="text-base font-bold text-white flex items-center gap-2">
                                        Puerta Soberana de Aprobación Humana (HITL)
                                    </h2>
                                    <p className="text-xs text-slate-400 font-mono">
                                        Alerta #{alertaParaAprobarHitl.id_alerta} • Ventana {alertaParaAprobarHitl.lead_time}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setAlertaParaAprobarHitl(null)}
                                className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Banner de Advertencia Legal y Delimitación Institucional */}
                        <div className="bg-red-950/40 border border-red-500/40 rounded-2xl p-4 text-xs text-red-200 flex items-start gap-3">
                            <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                            <div className="space-y-1">
                                <p className="font-bold text-red-300 uppercase tracking-wide">
                                    Cláusula de Delimitación Institucional y Soberanía Humana:
                                </p>
                                <p className="leading-relaxed text-[11px] text-red-200">
                                    Esta validación habilita la notificación a bandejas municipales de los UBIGEOS seleccionados. 
                                    <strong> AMARU-CLIMATE NO DISPARA ALERTAS CELULARES DIRECTAS A LA POBLACIÓN NI INTERVIENE EL SISMATE</strong>, 
                                    cuya potestad y despacho público son privativos y exclusivos del <strong>COEN / INDECI / MTC</strong> del Gobierno Peruano.
                                </p>
                            </div>
                        </div>

                        <div className="space-y-3 text-xs">
                            <div>
                                <label className="block text-slate-400 mb-1 font-semibold">
                                    Oficial de Guardia C2 / Director Técnico Responsable:
                                </label>
                                <input
                                    type="text"
                                    value={oficialNombre}
                                    onChange={(e) => setOficialNombre(e.target.value)}
                                    className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white font-medium focus:outline-none focus:border-emerald-500"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-slate-400 mb-1 font-semibold">
                                        DNI del Oficial:
                                    </label>
                                    <input
                                        type="text"
                                        maxLength={8}
                                        value={oficialDni}
                                        onChange={(e) => setOficialDni(e.target.value)}
                                        className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono"
                                    />
                                </div>
                                <div>
                                    <label className="block text-slate-400 mb-1 font-semibold">
                                        Cargo Institucional:
                                    </label>
                                    <input
                                        type="text"
                                        value={oficialCargo}
                                        onChange={(e) => setOficialCargo(e.target.value)}
                                        className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-slate-400 mb-1 font-semibold">
                                    Observaciones Técnicas y Sustento de Campo:
                                </label>
                                <textarea
                                    rows={2}
                                    value={oficialObs}
                                    onChange={(e) => setOficialObs(e.target.value)}
                                    className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white"
                                />
                            </div>

                            <label className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-950/80 border border-slate-800 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={checkNoSismate}
                                    onChange={(e) => setCheckNoSismate(e.target.checked)}
                                    className="mt-0.5 accent-emerald-500 rounded w-4 h-4"
                                />
                                <span className="text-[11px] text-slate-300 leading-tight">
                                    Doy fe de haber cotejado la coherencia territorial de los modelos y ratifico expresamente que esta alerta es técnica institucional interna y <strong>no sustituye las facultades del COEN en difusión masiva</strong>.
                                </span>
                            </label>
                        </div>

                        <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-800">
                            <button
                                type="button"
                                onClick={() => setAlertaParaAprobarHitl(null)}
                                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
                            >
                                Cancelar
                            </button>
                            <button
                                type="button"
                                disabled={!checkNoSismate || !oficialDni || !oficialNombre || firmandoHitl}
                                onClick={handleAprobarAlertaHitl}
                                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-emerald-950/50"
                            >
                                {firmandoHitl ? (
                                    <>
                                        <RefreshCw className="w-4 h-4 animate-spin" />
                                        <span>Acuñando Firma SHA-256...</span>
                                    </>
                                ) : (
                                    <>
                                        <FileText className="w-4 h-4" />
                                        <span>Firmar y Validar para Distribución</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
