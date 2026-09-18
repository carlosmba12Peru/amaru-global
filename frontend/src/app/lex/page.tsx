"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
    Scale,
    FileText,
    ShieldAlert,
    ShieldCheck,
    Search,
    Filter,
    Download,
    Copy,
    Printer,
    CheckCircle2,
    Clock,
    AlertTriangle,
    MessageSquare,
    Building2,
    Calendar,
    ExternalLink,
    ChevronRight,
    Sparkles,
    Send,
    Bot,
    User,
    Compass,
    FolderCheck,
    BookOpen,
    Paperclip
} from "lucide-react";

export default function LexPage() {
    const [activeTab, setActiveTab] = useState<"radar" | "catalogo" | "formatos" | "copiloto">("radar");
    const [summary, setSummary] = useState<any>(null);
    const [norms, setNorms] = useState<any[]>([]);
    const [formats, setFormats] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    // Estado del Radar por Ubigeo
    const [selectedUbigeo, setSelectedUbigeo] = useState<string>("150118");
    const [districtName, setDistrictName] = useState<string>("Lurigancho-Chosica");
    const [departmentName, setDepartmentName] = useState<string>("Lima");
    const [districtStatus, setDistrictStatus] = useState<any>(null);

    // Modal de Resolución de Alcaldía
    const [showResolutionModal, setShowResolutionModal] = useState<boolean>(false);
    const [resolutionText, setResolutionText] = useState<string>("");
    const [alcaldeInput, setAlcaldeInput] = useState<string>("Ing. Oswaldo Vargas Cuéllar");
    const [objetoInput, setObjetoInput] = useState<string>("Alquiler de 02 excavadoras sobre orugas 330 y 02 volquetes para descolmatación y conformación de dique en faja marginal");
    const [copied, setCopied] = useState<boolean>(false);

    // Filtros del Catálogo
    const [filterCategory, setFilterCategory] = useState<string>("ALL");
    const [filterSector, setFilterSector] = useState<string>("ALL");
    const [searchQuery, setSearchQuery] = useState<string>("");

    // Chat Copiloto IA Jurídico
    const [chatMessages, setChatMessages] = useState<Array<{ sender: "user" | "bot"; text: string; normas?: string[] }>>([
        {
            sender: "bot",
            text: "¡Saludos, Autoridad! Soy el Asistente Técnico y Copiloto IA de AMARU-LEX, entrenado con las 51 Normas Legales Oficiales del Fenómeno El Niño 2026-2027. AVISO IMPORTANTE: Este copiloto NO es un abogado ni reemplaza al criterio profesional humano; es un asistente que brinda recomendaciones analíticas y apoyo documental. Toda decisión final, informe legal colegiado y ejecución presupuestal es de exclusiva responsabilidad de las autoridades distritales y regionales. ¿En qué tema del marco legal o formatos de emergencia puedo asistirle hoy?"
        }
    ]);
    const [userQuestion, setUserQuestion] = useState<string>("");
    const [isAsking, setIsAsking] = useState<boolean>(false);

    // Cargar Resumen y Normas desde Backend
    const fetchData = async () => {
        try {
            const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
            const [resSum, resNorms, resFormats] = await Promise.all([
                fetch(`${apiBase}/api/marco-legal/summary`),
                fetch(`${apiBase}/api/marco-legal/norms`),
                fetch(`${apiBase}/api/marco-legal/formats`)
            ]);
            if (resSum.ok) {
                const sJson = await resSum.json();
                setSummary(sJson);
            }
            if (resNorms.ok) {
                const nJson = await resNorms.json();
                setNorms(nJson);
            }
            if (resFormats.ok) {
                const fJson = await resFormats.json();
                setFormats(fJson);
            }
        } catch (err) {
            console.warn("Error fetching marco-legal from backend, using local fallback", err);
        } finally {
            setLoading(false);
        }
    };

    // Consultar Estatus Legal de Distrito
    const fetchDistrictStatus = async (ubigeo: string, dist: string, dep: string) => {
        try {
            const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
            const res = await fetch(`${apiBase}/api/marco-legal/district/${ubigeo}?distrito=${encodeURIComponent(dist)}&departamento=${encodeURIComponent(dep)}`);
            if (res.ok) {
                const json = await res.json();
                setDistrictStatus(json);
            }
        } catch (err) {
            console.warn("Error fetching district legal status", err);
        }
    };

    useEffect(() => {
        fetchData();
        fetchDistrictStatus(selectedUbigeo, districtName, departmentName);
    }, []);

    // Generar Proyecto de Resolución
    const handleGenerateResolution = async () => {
        try {
            const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
            const res = await fetch(`${apiBase}/api/marco-legal/generate-resolution`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ubigeo: selectedUbigeo,
                    distrito: districtName,
                    alcalde: alcaldeInput,
                    objeto: objetoInput
                })
            });
            if (res.ok) {
                const json = await res.json();
                setResolutionText(json.resolucion_texto);
                setShowResolutionModal(true);
            }
        } catch (err) {
            console.warn("Error generating resolution draft", err);
        }
    };

    // Enviar pregunta al Copiloto IA Jurídico
    const handleSendQuestion = async (qText?: string) => {
        const question = qText || userQuestion;
        if (!question.trim()) return;

        const newMessages = [...chatMessages, { sender: "user" as const, text: question }];
        setChatMessages(newMessages);
        setUserQuestion("");
        setIsAsking(true);

        try {
            const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
            const res = await fetch(`${apiBase}/api/marco-legal/chat`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ pregunta: question })
            });
            if (res.ok) {
                const json = await res.json();
                setChatMessages([
                    ...newMessages,
                    {
                        sender: "bot",
                        text: json.respuesta,
                        normas: json.normas_relevantes
                    }
                ]);
            }
        } catch (err) {
            setChatMessages([
                ...newMessages,
                {
                    sender: "bot",
                    text: "Error al consultar el servicio legal del backend. Por favor verifique que el servidor esté activo."
                }
            ]);
        } finally {
            setIsAsking(false);
        }
    };

    // Filtrar normas en el catálogo
    const filteredNorms = norms.filter((n) => {
        const matchCategory = filterCategory === "ALL" || n.categoria === filterCategory;
        const matchSector = filterSector === "ALL" || n.sector === filterSector;
        const matchSearch =
            !searchQuery ||
            n.norma?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            n.titulo?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            n.sector?.toLowerCase().includes(searchQuery.toLowerCase());
        return matchCategory && matchSector && matchSearch;
    });

    const distritosRapidos = [
        { ubigeo: "150118", nombre: "Lurigancho-Chosica", dep: "Lima", alcalde: "Ing. Oswaldo Vargas Cuéllar" },
        { ubigeo: "200114", nombre: "Tambogrande", dep: "Piura", alcalde: "Sr. Segundo Meléndez Zurita" },
        { ubigeo: "140305", nombre: "Íllimo", dep: "Lambayeque", alcalde: "Sr. Juan Pablo Santamaría" },
        { ubigeo: "210505", nombre: "Mazocruz (Santa Rosa)", dep: "Puno", alcalde: "Sr. Valerio Pari Gómez" },
        { ubigeo: "081301", nombre: "Urubamba", dep: "Cusco", alcalde: "Ing. Ronald Vera Gallegos" },
        { ubigeo: "020101", nombre: "Huaraz", dep: "Áncash", alcalde: "Lic. David Rosales Tinoco" }
    ];

    return (
        <div className="space-y-6 max-w-7xl mx-auto pb-12">
            {/* Cabecera Heroica de AMARU-LEX */}
            <div className="bg-gradient-to-r from-slate-900 via-amber-950/40 to-slate-900 border border-amber-500/30 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
                <div className="absolute -right-8 -bottom-8 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 relative z-10">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1.5">
                                <Scale className="w-3.5 h-3.5" />
                                SISTEMA DE BLINDAJE JURÍDICO &amp; FISCAL C2
                            </span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-blue-950 text-blue-300 border border-blue-800 font-bold">
                                51 NORMAS OFICIALES
                            </span>
                        </div>
                        <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight flex items-center gap-3">
                            <span>AMARU-LEX</span>
                            <span className="text-slate-400 font-light text-xl">|</span>
                            <span className="text-amber-400 font-semibold text-lg md:text-xl">
                                Marco Legal &amp; Blindaje Territorial FEN 2026-2027
                            </span>
                        </h1>
                        <p className="text-xs md:text-sm text-slate-300 max-w-3xl leading-relaxed">
                            Procesamiento inteligente y cruce territorial de los <strong>51 Decretos Supremos, Decretos de Urgencia y Resoluciones</strong> publicados en <em>El Peruano</em>: Radar de amparo por Ubigeo, generador de proyectos de Resolución de Alcaldía para contratación directa y Copiloto IA Jurídico.
                        </p>
                    </div>

                    {/* Botones de Navegación Rápida */}
                    <div className="flex items-center gap-2">
                        <Link
                            href="/yachay"
                            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-950/60 hover:bg-emerald-900 text-emerald-200 border border-emerald-700/50 transition flex items-center gap-1.5 shadow"
                        >
                            <span>Ir a AMARU-YACHAY</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                    </div>
                </div>

                {/* Métricas Rápidas de las 51 Normas */}
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2.5 mt-5 pt-4 border-t border-slate-800/80 text-xs">
                    <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
                        <span className="text-[10px] text-slate-400 block font-medium">Total Normas</span>
                        <span className="text-lg font-black text-white">51</span>
                    </div>
                    <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
                        <span className="text-[10px] text-slate-400 block font-medium">Decretos PCM</span>
                        <span className="text-lg font-black text-amber-400">36</span>
                    </div>
                    <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
                        <span className="text-[10px] text-slate-400 block font-medium">Normas MEF</span>
                        <span className="text-lg font-black text-sky-400">10</span>
                    </div>
                    <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
                        <span className="text-[10px] text-slate-400 block font-medium">Prórrogas</span>
                        <span className="text-lg font-black text-red-400">23</span>
                    </div>
                    <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
                        <span className="text-[10px] text-slate-400 block font-medium">Decretos Urgencia</span>
                        <span className="text-lg font-black text-emerald-400">6</span>
                    </div>
                    <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
                        <span className="text-[10px] text-slate-400 block font-medium">Crédito BID/KfW</span>
                        <span className="text-lg font-black text-purple-400">2</span>
                    </div>
                </div>

                {/* Pestañas de la Consola */}
                <div className="flex gap-2 mt-6 border-b border-slate-800 pt-2">
                    <button
                        onClick={() => setActiveTab("radar")}
                        className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-t-xl transition border-t border-x ${
                            activeTab === "radar"
                                ? "bg-slate-900 text-amber-400 border-amber-500/40 border-b-2 border-b-amber-400"
                                : "text-slate-400 hover:text-slate-200 border-transparent hover:bg-slate-800/50"
                        }`}
                    >
                        <ShieldAlert className="w-4 h-4" />
                        <span>Radar Geolegal &amp; Blindaje de Alcaldía</span>
                    </button>
                    <button
                        onClick={() => setActiveTab("catalogo")}
                        className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-t-xl transition border-t border-x ${
                            activeTab === "catalogo"
                                ? "bg-slate-900 text-sky-400 border-sky-500/40 border-b-2 border-b-sky-400"
                                : "text-slate-400 hover:text-slate-200 border-transparent hover:bg-slate-800/50"
                        }`}
                    >
                        <FileText className="w-4 h-4" />
                        <span>Catálogo Oficial de las 51 Normas</span>
                    </button>
                    <button
                        onClick={() => setActiveTab("formatos")}
                        className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-t-xl transition border-t border-x ${
                            activeTab === "formatos"
                                ? "bg-slate-900 text-emerald-400 border-emerald-500/40 border-b-2 border-b-emerald-400"
                                : "text-slate-400 hover:text-slate-200 border-transparent hover:bg-slate-800/50"
                        }`}
                    >
                        <FolderCheck className="w-4 h-4" />
                        <span>Kit de Formatos Oficiales (Alcaldías &amp; EDAN)</span>
                    </button>
                    <button
                        onClick={() => setActiveTab("copiloto")}
                        className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-t-xl transition border-t border-x ${
                            activeTab === "copiloto"
                                ? "bg-slate-900 text-purple-400 border-purple-500/40 border-b-2 border-b-purple-400"
                                : "text-slate-400 hover:text-slate-200 border-transparent hover:bg-slate-800/50"
                        }`}
                    >
                        <Sparkles className="w-4 h-4" />
                        <span>Copiloto IA Jurídico RAG</span>
                    </button>
                </div>
            </div>

            {/* ========================================================================= */}
            {/* PESTAÑA 1: RADAR GEOLEGAL & BLINDAJE PARA ALCALDES                        */}
            {/* ========================================================================= */}
            {activeTab === "radar" && (
                <div className="space-y-6">
                    {/* Selector de Distrito */}
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 border-b border-slate-800 pb-3">
                            <div>
                                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                                    <Compass className="w-4 h-4 text-amber-400" />
                                    <span>Consulta de Amparo Legal por Distrito (1,891 Distritos Nacionales)</span>
                                </h2>
                                <p className="text-xs text-slate-400">
                                    Verifica si tu municipalidad está facultada para realizar contrataciones directas sin concurso previo
                                </p>
                            </div>

                            {/* Botones de Acceso Rápido */}
                            <div className="flex flex-wrap gap-1.5">
                                {distritosRapidos.map((d) => (
                                    <button
                                        key={d.ubigeo}
                                        onClick={() => {
                                            setSelectedUbigeo(d.ubigeo);
                                            setDistrictName(d.nombre);
                                            setDepartmentName(d.dep);
                                            setAlcaldeInput(d.alcalde);
                                            fetchDistrictStatus(d.ubigeo, d.nombre, d.dep);
                                        }}
                                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                                            selectedUbigeo === d.ubigeo
                                                ? "bg-amber-600 text-white shadow font-bold"
                                                : "bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800"
                                        }`}
                                    >
                                        {d.nombre}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Ficha de Estado Legal del Distrito */}
                        {districtStatus && (
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
                                <div className="lg:col-span-8 space-y-4">
                                    {/* Banner de Amparo */}
                                    <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-600/50 flex items-start gap-3.5">
                                        <ShieldCheck className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-black text-emerald-300 uppercase tracking-wide">
                                                    ESTATUS: AMPARADO EN ESTADO DE EMERGENCIA ACTIVA
                                                </span>
                                                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-900/80 text-emerald-200 border border-emerald-700">
                                                    UBIGEO: {districtStatus.ubigeo}
                                                </span>
                                            </div>
                                            <h3 className="text-base font-bold text-white">
                                                Municipalidad Distrital de {districtStatus.distrito} ({districtStatus.departamento})
                                            </h3>
                                            <p className="text-xs text-emerald-200/90 leading-relaxed">
                                                El distrito está formalmente protegido bajo el <strong>{districtStatus.decreto_base}</strong> y ampliado con el <strong>{districtStatus.prorroga_vigente}</strong>. Quedan <strong>{districtStatus.dias_vigencia_restantes} días de vigencia legal</strong> para comprometer fondos de emergencia.
                                            </p>
                                        </div>
                                    </div>

                                    {/* Facultades Otorgadas */}
                                    <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2.5">
                                        <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                                            Facultades Legales Habilitadas para el Alcalde:
                                        </span>
                                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                                            {(districtStatus.facultades_otorgadas || []).map((f: string, i: number) => (
                                                <li key={i} className="flex items-start gap-2 text-slate-300 bg-slate-900/80 p-2 rounded-lg border border-slate-850">
                                                    <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                                                    <span>{f}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    {/* Aviso Doctrinario de Mando */}
                                    <div className="p-3 bg-amber-950/30 border border-amber-800/40 rounded-xl text-xs text-amber-200/90 leading-relaxed flex items-start gap-2.5">
                                        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                                        <div>
                                            <strong className="text-amber-300 block">Advertencia Legal C2:</strong>
                                            {districtStatus.aviso_legal_alcalde}
                                        </div>
                                    </div>
                                </div>

                                {/* Panel Lateral: Generador de Resolución */}
                                <div className="lg:col-span-4 bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3 flex flex-col justify-between">
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2 text-xs font-bold text-white uppercase border-b border-slate-800 pb-2">
                                            <FileText className="w-4 h-4 text-amber-400" />
                                            <span>Generador de Resolución de Alcaldía</span>
                                        </div>
                                        <div className="space-y-1.5 text-xs">
                                            <label className="text-[11px] text-slate-400 font-medium">Nombre del Alcalde:</label>
                                            <input
                                                type="text"
                                                value={alcaldeInput}
                                                onChange={(e) => setAlcaldeInput(e.target.value)}
                                                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                                            />
                                        </div>
                                        <div className="space-y-1.5 text-xs">
                                            <label className="text-[11px] text-slate-400 font-medium">Objeto de Contratación Directa:</label>
                                            <textarea
                                                rows={3}
                                                value={objetoInput}
                                                onChange={(e) => setObjetoInput(e.target.value)}
                                                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                                            />
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleGenerateResolution}
                                        className="w-full py-2.5 px-3 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white shadow-lg shadow-amber-600/30 transition flex items-center justify-center gap-2"
                                    >
                                        <Scale className="w-4 h-4" />
                                        <span>Generar Proyecto de Resolución</span>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ========================================================================= */}
            {/* PESTAÑA 2: CATÁLOGO DE LAS 51 NORMAS LEGALES                              */}
            {/* ========================================================================= */}
            {activeTab === "catalogo" && (
                <div className="space-y-6">
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
                        {/* Filtros y Buscador */}
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 border-b border-slate-800 pb-3">
                            <div className="relative w-full md:w-80">
                                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                                <input
                                    type="text"
                                    placeholder="Buscar en las 51 normas (ej. combustible, D.U. 031)..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                                />
                            </div>

                            <div className="flex flex-wrap gap-2 text-xs">
                                <select
                                    value={filterCategory}
                                    onChange={(e) => setFilterCategory(e.target.value)}
                                    className="bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-slate-300 focus:outline-none"
                                >
                                    <option value="ALL">Todas las Categorías</option>
                                    <option value="PRÓRROGA DE ESTADO DE EMERGENCIA">Prórrogas de Emergencia (23)</option>
                                    <option value="DECLARATORIA DE ESTADO DE EMERGENCIA">Declaratorias Originales (14)</option>
                                    <option value="DECRETO DE URGENCIA (FINANCIAMIENTO & COMPRAS C2)">Decretos de Urgencia (6)</option>
                                    <option value="TRANSFERENCIA PRESUPUESTAL DE EMERGENCIA">Transferencias MEF (4)</option>
                                    <option value="CRÉDITO Y ENDEUDAMIENTO CONTINGENTE INTERNACIONAL">Crédito BID / KfW (2)</option>
                                </select>

                                <select
                                    value={filterSector}
                                    onChange={(e) => setFilterSector(e.target.value)}
                                    className="bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-slate-300 focus:outline-none"
                                >
                                    <option value="ALL">Todos los Sectores</option>
                                    <option value="PRESIDENCIA DEL CONSEJO DE MINISTROS">PCM (36)</option>
                                    <option value="MINISTERIO DE ECONOMÍA Y FINANZAS">MEF (10)</option>
                                    <option value="MINISTERIO DE DESARROLLO AGRARIO Y RIEGO">MIDAGRI (2)</option>
                                    <option value="MINISTERIO DE VIVIENDA, CONSTRUCCIÓN Y SANEAMIENTO">MVCS (1)</option>
                                    <option value="MINISTERIO DE TRANSPORTES Y COMUNICACIONES">MTC (1)</option>
                                </select>
                            </div>
                        </div>

                        {/* Listado de Normas */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
                            {filteredNorms.map((item, idx) => (
                                <div
                                    key={idx}
                                    className="bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-xl p-3.5 space-y-2.5 transition flex flex-col justify-between"
                                >
                                    <div className="space-y-1.5">
                                        <div className="flex justify-between items-start gap-2">
                                            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-900 text-sky-300 border border-slate-800">
                                                {item.norma}
                                            </span>
                                            <span className="text-[10px] font-mono text-slate-400">
                                                {item.fecha_publicacion}
                                            </span>
                                        </div>
                                        <h3 className="text-xs font-bold text-white line-clamp-2 leading-snug">
                                            {item.titulo}
                                        </h3>
                                        <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                                            {item.facultad_principal}
                                        </p>
                                    </div>

                                    <div className="pt-2 border-t border-slate-850 flex justify-between items-center text-[10px] text-slate-400">
                                        <span className="truncate max-w-[150px]">{item.sector}</span>
                                        <span className="font-mono text-amber-400 font-bold">{item.paginas} págs</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {filteredNorms.length === 0 && (
                            <div className="text-center py-8 text-xs text-slate-500">
                                No se encontraron normas legales que coincidan con los filtros seleccionados.
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ========================================================================= */}
            {/* PESTAÑA 3: KIT DE FORMATOS OFICIALES PARA ALCALDES & EDAN (FEN 2026-2027) */}
            {/* ========================================================================= */}
            {activeTab === "formatos" && (
                <div className="space-y-6">
                    <div className="bg-slate-900 border border-emerald-500/30 rounded-2xl p-5 space-y-4 shadow-xl">
                        <div className="flex flex-col md:flex-row justify-between md:items-center gap-3 border-b border-slate-800 pb-4">
                            <div>
                                <div className="flex items-center gap-2">
                                    <FolderCheck className="w-5 h-5 text-emerald-400" />
                                    <h2 className="text-base font-bold text-white">
                                        Kit de Formatos Oficiales para Alcaldías &amp; Equipos Técnicos
                                    </h2>
                                    <span className="text-[10px] font-mono bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded border border-emerald-800 font-bold">
                                        6 ESTRUCTURAS REFERENCIALES
                                    </span>
                                </div>
                                <p className="text-xs text-slate-400 mt-1">
                                    Modelos y estructuras documentales amparados en el D.S. 124-2026-PCM, D.U. 031/032-2026, Ley 30225 y Directivas INDECI.
                                </p>
                            </div>
                            <button
                                onClick={() => setShowResolutionModal(true)}
                                className="px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center gap-1.5 transition shadow"
                            >
                                <Scale className="w-3.5 h-3.5" />
                                <span>Redactar Minuta de Resolución</span>
                            </button>
                        </div>

                        {/* Banner Obligatorio: Carácter Referencial y Validación de la Autoridad Competente */}
                        <div className="bg-amber-950/40 border border-amber-500/50 rounded-xl p-3.5 flex items-start gap-3 text-xs shadow-inner">
                            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                            <div className="space-y-1">
                                <span className="font-bold text-amber-300 block uppercase tracking-wider text-[11px]">
                                    Aviso de Carácter Referencial • Validación Obligatoria por la Autoridad Competente
                                </span>
                                <p className="text-slate-300 leading-relaxed text-[11px]">
                                    Todos los formatos, minutas, esquemas y textos generados o sugeridos por este sistema son de <strong>carácter estrictamente referencial y pedagógico</strong>. <strong>No producen efectos jurídicos por sí solos ni reemplazan el procedimiento administrativo formal.</strong> Todo documento debe ser <strong>revisado, adecuado a la realidad fáctica territorial, visado y validado formalmente por la autoridad competente (Alcalde) y sus órganos técnicos responsables</strong> (Oficina de Asesoría Jurídica, Subgerencia de Gestión del Riesgo de Desastres, Gerencia de Obras y Oficina de Abastecimiento) antes de su suscripción o registro ante el SEACE, INDECI, ANA o MEF.
                                </p>
                            </div>
                        </div>

                        {/* Cuadrícula de los 6 Formatos Oficiales */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {(formats.length > 0 ? formats : [
                                {
                                    id: "FMT-01",
                                    codigo: "RA-CONTRATACION-DIRECTA",
                                    titulo: "Proyecto de Resolución de Alcaldía (Contratación Directa de Emergencia)",
                                    base_legal: "Ley Nº 30225 Art. 27 lit. b, D.S. Nº 124-2026-PCM, D.U. Nº 031-2026",
                                    entidad_receptora: "Portal de Transparencia Municipal / SEACE",
                                    descripcion: "Aprueba la contratación directa inmediata de maquinaria pesada, roca al volteo o combustible sin concurso ordinario previo.",
                                    plazo_regularizacion: "10 días hábiles en el SEACE posteriores al inicio del servicio."
                                },
                                {
                                    id: "FMT-02",
                                    codigo: "EDAN-PERU-2A-2B",
                                    titulo: "Ficha EDAN Perú (Evaluación de Daños y Análisis de Necesidades) & SINPAD",
                                    base_legal: "Ley SINAGERD Nº 29664, Directiva Nº 016-2020-PCM/INDECI",
                                    entidad_receptora: "INDECI (Plataforma Nacional SINPAD)",
                                    descripcion: "Registra el impacto en viviendas, damnificados, vías y cultivos. Requisito legal obligatorio para el envío inmediato de Bienes de Ayuda Humanitaria (BAH).",
                                    plazo_regularizacion: "Formato 2A dentro de las primeras 8 horas; Formato 2B dentro de 72 horas."
                                },
                                {
                                    id: "FMT-03",
                                    codigo: "TDR-MAQUINARIA-DIESEL",
                                    titulo: "Términos de Referencia Simplificados (Alquiler de Maquinaria y Diésel B5)",
                                    base_legal: "D.U. Nº 031-2026, D.U. Nº 032-2026, Directiva OSCE de Contratación Directa",
                                    entidad_receptora: "Oficina de Logística / Abastecimiento Municipal",
                                    descripcion: "Especificaciones técnicas para alquiler por horas de tractor sobre oruga D8/D9, excavadora sobre oruga 330 y abastecimiento en campo de combustible.",
                                    plazo_regularizacion: "Regularizable en el expediente de contratación dentro de 10 días."
                                },
                                {
                                    id: "FMT-04",
                                    codigo: "FTE-CAUCES-MIDAGRI-ANA",
                                    titulo: "Ficha Técnica de Emergencia (FTE) para Descolmatación y Fajas Marginales",
                                    base_legal: "D.U. Nº 031-2026, R.J. Autoridad Nacional del Agua (ANA)",
                                    entidad_receptora: "ANA / Administraciones Locales de Agua (ALA) / GORE",
                                    descripcion: "Memoria descriptiva simplificada para intervención en ríos y quebradas, exenta de los plazos de viabilidad Invierte.pe.",
                                    plazo_regularizacion: "Aprobación técnica expedita por la ALA de la cuenca."
                                },
                                {
                                    id: "FMT-05",
                                    codigo: "MODIF-PP068-ACT-5006144",
                                    titulo: "Ficha de Modificación Presupuestaria Tipo 003 (PP 068 - Reducción de Vulnerabilidad)",
                                    base_legal: "D.U. Nº 031-2026, Directiva Nº 0001-2026-EF/50.01 (MEF)",
                                    entidad_receptora: "SIAF-SP / Dirección General de Presupuesto Público (MEF)",
                                    descripcion: "Autoriza la anulación de saldos de proyectos ordinarios para habilitar la Actividad 5006144 y adquirir insumos de defensa ribereña.",
                                    plazo_regularizacion: "Registro inmediato en el aplicativo web SIAF-Operaciones en Línea."
                                },
                                {
                                    id: "FMT-06",
                                    codigo: "ACTA-CONCEJO-SESION-PERMANENTE",
                                    titulo: "Acta de Sesión Extraordinaria de Concejo (Sesión Permanente y Emergencia Distrital)",
                                    base_legal: "Ley Orgánica de Municipalidades Nº 27972 Art. 20 num. 6",
                                    entidad_receptora: "Secretaría General Municipal",
                                    descripcion: "Acuerdo de concejo que respalda unánimemente las acciones de emergencia del Alcalde y autoriza los gastos directos.",
                                    plazo_regularizacion: "Acta firmada en sesión del concejo."
                                }
                            ]).map((fmt: any, idx: number) => (
                                <div
                                    key={idx}
                                    className="bg-slate-950/80 border border-slate-800 hover:border-emerald-500/40 rounded-xl p-4 flex flex-col justify-between transition group shadow-sm hover:shadow-emerald-950/30"
                                >
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center">
                                            <span className="font-mono text-[10px] font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">
                                                {fmt.id} • {fmt.codigo}
                                            </span>
                                            <span className="text-[10px] text-slate-400 font-medium">
                                                {fmt.entidad_receptora?.split("/")[0]}
                                            </span>
                                        </div>
                                        <h3 className="text-xs font-bold text-white group-hover:text-emerald-300 transition line-clamp-2">
                                            {fmt.titulo}
                                        </h3>
                                        <p className="text-[11px] text-slate-300 leading-relaxed line-clamp-3">
                                            {fmt.descripcion}
                                        </p>
                                    </div>

                                    <div className="mt-3 pt-3 border-t border-slate-800/80 space-y-2 text-[10px]">
                                        <div>
                                            <span className="text-slate-400 font-bold block">Base Legal:</span>
                                            <span className="text-amber-300 font-mono text-[9px]">{fmt.base_legal}</span>
                                        </div>
                                        <div>
                                            <span className="text-slate-400 font-bold block">Plazo / Destino:</span>
                                            <span className="text-slate-300">{fmt.plazo_regularizacion}</span>
                                        </div>
                                        <div>
                                            <span className="text-slate-400 font-bold block">Carácter &amp; Control:</span>
                                            <span className="text-amber-400/90 font-medium">Referencial • Requiere visación y firma formal de Autoridad</span>
                                        </div>
                                        <div className="pt-2">
                                            {fmt.id === "FMT-01" ? (
                                                <button
                                                    onClick={() => setShowResolutionModal(true)}
                                                    className="w-full py-1.5 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center justify-center gap-1.5 transition shadow"
                                                >
                                                    <Scale className="w-3.5 h-3.5" />
                                                    <span>Redactar Resolución</span>
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => {
                                                        setActiveTab("copiloto");
                                                        handleSendQuestion(`Explícame cómo llenar y tramitar el formato ${fmt.titulo} (${fmt.codigo}) bajo el marco legal FEN`);
                                                    }}
                                                    className="w-full py-1.5 rounded-lg text-xs font-medium bg-slate-900 hover:bg-slate-800 text-emerald-300 border border-emerald-800/40 flex items-center justify-center gap-1.5 transition"
                                                >
                                                    <Sparkles className="w-3 h-3 text-purple-400" />
                                                    <span>Consultar con Copiloto IA</span>
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* ========================================================================= */}
            {/* PESTAÑA 4: COPILOTO IA JURÍDICO (RAG)                                     */}
            {/* ========================================================================= */}
            {activeTab === "copiloto" && (
                <div className="space-y-6">
                    <div className="bg-slate-900 border border-purple-500/30 rounded-2xl p-5 space-y-4 shadow-xl">
                        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                            <div>
                                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                                    <Bot className="w-4 h-4 text-purple-400" />
                                    <span>Copiloto IA Jurídico: Asistencia Técnica y Consultas Normativas FEN</span>
                                </h2>
                                <p className="text-xs text-slate-400">
                                    Orientación técnica y documental basada en los 51 decretos y resoluciones oficiales
                                </p>
                            </div>
                            <span className="text-[10px] font-mono bg-purple-950 text-purple-300 px-2 py-0.5 rounded border border-purple-800">
                                RAG C2 ACTIVO
                            </span>
                        </div>

                        {/* Descargo de Responsabilidad y Advertencia Ético-Legal */}
                        <div className="bg-amber-950/40 border border-amber-500/50 rounded-xl p-3.5 flex items-start gap-3 text-xs shadow-inner">
                            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                            <div className="space-y-1">
                                <span className="font-bold text-amber-300 block uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                                    <span>Descargo de Responsabilidad Legal • Principio de No Sustitución del Criterio Humano</span>
                                </span>
                                <p className="text-slate-300 leading-relaxed text-[11px]">
                                    Este Copiloto IA es una <strong>herramienta computacional de asistencia técnica y consulta informativa</strong>. <strong>NO es un abogado colegiado ni reemplaza al criterio legal o técnico humano.</strong> Sus respuestas, recomendaciones y minutas constituyen sugerencias referenciales de apoyo. <strong>Toda decisión administrativa, emisión de actos resolutivos, visación de expedientes y ejecución presupuestal recae de manera exclusiva e indelegable en las autoridades locales/regionales, funcionarios y sus respectivas oficinas de Asesoría Jurídica.</strong>
                                </p>
                            </div>
                        </div>

                        {/* Preguntas Sugeridas */}
                        <div className="flex flex-wrap gap-1.5 text-xs">
                            {[
                                "¿Qué formatos oficiales dispongo para mi distrito ante el FEN?",
                                "Redacta el borrador formal de la Resolución de Alcaldía para maquinaria y diésel",
                                "¿Cómo registro la Ficha EDAN en el SINPAD para recibir ayuda de INDECI?",
                                "¿Cómo modifico el presupuesto del canon al Programa Presupuestal 068?",
                                "¿Cuál es el plazo de 10 días para regularizar la compra en el SEACE?",
                                "¿Cómo me blindo ante Contraloría y Fiscalía (Art. 377 Código Penal)?"
                            ].map((sug, i) => (
                                <button
                                    key={i}
                                    onClick={() => handleSendQuestion(sug)}
                                    className="bg-slate-950 text-slate-300 hover:text-white border border-slate-800 hover:border-slate-700 px-2.5 py-1 rounded-lg text-[11px] transition"
                                >
                                    💬 {sug}
                                </button>
                            ))}
                        </div>

                        {/* Ventana de Chat */}
                        <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 h-80 overflow-y-auto space-y-3">
                            {chatMessages.map((msg, i) => (
                                <div
                                    key={i}
                                    className={`flex gap-3 text-xs leading-relaxed ${
                                        msg.sender === "user" ? "justify-end" : "justify-start"
                                    }`}
                                >
                                    {msg.sender === "bot" && (
                                        <div className="w-7 h-7 rounded-lg bg-purple-900/60 text-purple-300 flex items-center justify-center shrink-0 border border-purple-700 font-bold text-xs">
                                            IA
                                        </div>
                                    )}
                                    <div
                                        className={`p-3 rounded-xl max-w-2xl ${
                                            msg.sender === "user"
                                                ? "bg-amber-600 text-white shadow"
                                                : "bg-slate-900 text-slate-200 border border-slate-800"
                                        }`}
                                    >
                                        <p>{msg.text}</p>
                                        {msg.normas && msg.normas.length > 0 && (
                                            <div className="mt-2 pt-2 border-t border-slate-800 flex flex-wrap gap-1">
                                                <span className="text-[10px] text-slate-400 font-bold block w-full">Normas Citadas:</span>
                                                {msg.normas.map((nr, idx) => (
                                                    <span key={idx} className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-slate-950 text-amber-300 border border-slate-800">
                                                        {nr}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    {msg.sender === "user" && (
                                        <div className="w-7 h-7 rounded-lg bg-slate-800 text-slate-300 flex items-center justify-center shrink-0 border border-slate-700 font-bold text-xs">
                                            <User className="w-4 h-4" />
                                        </div>
                                    )}
                                </div>
                            ))}
                            {isAsking && (
                                <div className="text-xs text-purple-400 animate-pulse flex items-center gap-2">
                                    <Bot className="w-4 h-4" /> Analizando los 51 decretos y extrayendo artículos legales...
                                </div>
                            )}
                        </div>

                        {/* Input de Chat */}
                        <div className="flex gap-2">
                            <input
                                type="text"
                                placeholder="Escribe tu consulta legal sobre contrataciones o facultades FEN..."
                                value={userQuestion}
                                onChange={(e) => setUserQuestion(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleSendQuestion()}
                                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                            />
                            <button
                                onClick={() => handleSendQuestion()}
                                disabled={isAsking}
                                className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow shadow-purple-600/30"
                            >
                                <Send className="w-3.5 h-3.5" />
                                <span>Consultar</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ========================================================================= */}
            {/* MODAL: PROYECTO DE RESOLUCIÓN DE ALCALDÍA DE EMERGENCIA                   */}
            {/* ========================================================================= */}
            {showResolutionModal && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl">
                        <div className="flex justify-between items-center p-4 border-b border-slate-800">
                            <div className="flex items-center gap-2">
                                <Scale className="w-5 h-5 text-amber-400" />
                                <h3 className="text-sm font-bold text-white">
                                    Proyecto de Resolución de Alcaldía: Contratación Directa de Emergencia
                                </h3>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => {
                                        navigator.clipboard.writeText(resolutionText);
                                        setCopied(true);
                                        setTimeout(() => setCopied(false), 2000);
                                    }}
                                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-lg flex items-center gap-1.5 transition border border-slate-700"
                                >
                                    <Copy className="w-3.5 h-3.5" />
                                    <span>{copied ? "¡Copiado!" : "Copiar Texto"}</span>
                                </button>
                                <button
                                    onClick={() => window.print()}
                                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-lg flex items-center gap-1.5 transition border border-slate-700"
                                >
                                    <Printer className="w-3.5 h-3.5" />
                                    <span>Imprimir</span>
                                </button>
                                <button
                                    onClick={() => setShowResolutionModal(false)}
                                    className="text-slate-400 hover:text-white px-2 py-1 text-sm font-bold"
                                >
                                    ✕
                                </button>
                            </div>
                        </div>

                        <div className="p-4 overflow-y-auto font-mono text-xs text-slate-200 leading-relaxed whitespace-pre-wrap bg-slate-950 m-4 rounded-xl border border-slate-850">
                            {resolutionText}
                        </div>

                        {/* Pie de Página de Validación Legal Obligatoria */}
                        <div className="px-5 py-3 bg-slate-950/90 border-t border-slate-850 text-[11px] text-slate-400 flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                                <span><strong>Nota Obligatoria:</strong> Este texto es un proyecto/minuta automatizada de apoyo. Requiere la visación previa de la Oficina de Asesoría Jurídica y el informe de sustento de Gestión del Riesgo de Desastres antes de la firma de la Autoridad.</span>
                            </div>
                            <button
                                onClick={() => setShowResolutionModal(false)}
                                className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs font-semibold shrink-0"
                            >
                                Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
