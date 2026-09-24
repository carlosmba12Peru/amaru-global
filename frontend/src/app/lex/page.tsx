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
    Paperclip,
    RefreshCw
} from "lucide-react";

export default function LexPage() {
    const [activeTab, setActiveTab] = useState<"radar" | "catalogo" | "formatos" | "copiloto" | "planes">("radar");
    const [summary, setSummary] = useState<any>(null);
    const [lifecycleSummary, setLifecycleSummary] = useState<any>(null);
    const [norms, setNorms] = useState<any[]>([]);
    const [formats, setFormats] = useState<any[]>([]);
    const [planes, setPlanes] = useState<any[]>([]);
    const [filterSectorPlan, setFilterSectorPlan] = useState<string>("ALL");
    const [filterNivelPlan, setFilterNivelPlan] = useState<string>("ALL");
    const [searchPlan, setSearchPlan] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(true);

    // Sincronización oficial con El Peruano vía Agente KURAQ
    const [syncingElPeruano, setSyncingElPeruano] = useState<boolean>(false);
    const [syncResult, setSyncResult] = useState<any>(null);

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
    const [filterVigencia, setFilterVigencia] = useState<string>("ALL");
    const [searchQuery, setSearchQuery] = useState<string>("");

    // Búsqueda Semántica Vectorial con Vertex AI (text-embedding-004)
    const [isSemanticMode, setIsSemanticMode] = useState<boolean>(true);
    const [semanticQuery, setSemanticQuery] = useState<string>("");
    const [semanticResults, setSemanticResults] = useState<any[]>([]);
    const [semanticDictamen, setSemanticDictamen] = useState<string>("");
    const [isSearchingSemantic, setIsSearchingSemantic] = useState<boolean>(false);
    const [vectorStatus, setVectorStatus] = useState<any>(null);

    const handleSemanticSearch = async (queryText?: string) => {
        const q = queryText !== undefined ? queryText : semanticQuery;
        if (!q || !q.trim()) {
            setSemanticResults([]);
            setSemanticDictamen("");
            return;
        }
        setIsSearchingSemantic(true);
        try {
            const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
            const res = await fetch(`${apiBase}/api/marco-legal/semantic-search`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ consulta: q, top_k: 6, umbral_minimo: 0.40 })
            });
            if (res.ok) {
                const data = await res.json();
                setSemanticResults(data.coincidencias || []);
                setSemanticDictamen(data.dictamen_amparo_inmediato || "");
            }
        } catch (err) {
            console.warn("Error en búsqueda semántica", err);
        } finally {
            setIsSearchingSemantic(false);
        }
    };

    // Chat Copiloto IA Jurídico
    const [chatMessages, setChatMessages] = useState<Array<{ sender: "user" | "bot"; text: string; normas?: string[] }>>([
        {
            sender: "bot",
            text: "¡Saludos, Autoridad! Soy el Asistente IA de Orientación Normativa de AMARU-LEX. ⚠️ ADVERTENCIA OBLIGATORIA DE GOBERNANZA: Mis respuestas, análisis y borradores documentales son exclusivamente sugerencias de orientación técnica y documental. NO constituyen una toma de decisión ni reemplazan la soberanía humana ni el dictamen pericial o jurídico de los funcionarios. La responsabilidad exclusiva, legal e indelegable de cualquier decisión, contratación, visación o firma recae única y exclusivamente en las autoridades públicas competentes. ¿En qué tema normativo del FEN 2026-2027 puedo asistirle hoy?"
        }
    ]);
    const [userQuestion, setUserQuestion] = useState<string>("");
    const [isAsking, setIsAsking] = useState<boolean>(false);

    // Cargar Resumen, Ciclo de Vida y Normas desde Backend
    const fetchData = async () => {
        try {
            const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
            const [resSum, resNorms, resFormats, resVec, resLife, resPlanes] = await Promise.all([
                fetch(`${apiBase}/api/marco-legal/summary`),
                fetch(`${apiBase}/api/marco-legal/norms`),
                fetch(`${apiBase}/api/marco-legal/formats`),
                fetch(`${apiBase}/api/marco-legal/vector-status`),
                fetch(`${apiBase}/api/marco-legal/lifecycle-summary`),
                fetch(`${apiBase}/api/v1/planes/catalogo`)
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
            if (resVec && resVec.ok) {
                const vJson = await resVec.json();
                setVectorStatus(vJson);
            }
            if (resLife && resLife.ok) {
                const lJson = await resLife.json();
                setLifecycleSummary(lJson);
            }
            if (resPlanes && resPlanes.ok) {
                const pJson = await resPlanes.json();
                setPlanes(pJson.planes || []);
            }
        } catch (err) {
            console.warn("Error fetching marco-legal from backend, using local fallback", err);
        } finally {
            setLoading(false);
        }
    };

    // Sincronizar catálogo con El Peruano vía Agente KURAQ
    const handleSyncElPeruano = async () => {
        setSyncingElPeruano(true);
        try {
            const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
            const res = await fetch(`${apiBase}/api/v1/kuraq/sincronizar-elperuano`, {
                method: "POST"
            });
            if (res.ok) {
                const json = await res.json();
                setSyncResult(json);
                await fetchData();
            }
        } catch (err) {
            console.warn("Error synchronizing with El Peruano", err);
        } finally {
            setSyncingElPeruano(false);
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
        const matchVigencia = filterVigencia === "ALL" || n.estado_vigencia === filterVigencia;
        const matchSearch =
            !searchQuery ||
            n.norma?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            n.titulo?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            n.sector?.toLowerCase().includes(searchQuery.toLowerCase());
        return matchCategory && matchSector && matchVigencia && matchSearch;
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
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1.5">
                                <Scale className="w-3.5 h-3.5" />
                                SISTEMA DE BLINDAJE JURÍDICO &amp; FISCAL C2
                            </span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-blue-950 text-blue-300 border border-blue-800 font-bold">
                                51 NORMAS OFICIALES
                            </span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-950/80 text-emerald-300 border border-emerald-700/60 flex items-center gap-1 font-bold">
                                <Sparkles className="w-3 h-3 text-emerald-400" />
                                VERTEX AI EMBEDDINGS (768-D) + POSTGIS
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

                    {/* Botones de Navegación Rápida & Sincronización KURAQ */}
                    <div className="flex flex-wrap items-center gap-2">
                        <button
                            onClick={handleSyncElPeruano}
                            disabled={syncingElPeruano}
                            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-amber-900/60 hover:bg-amber-800 text-amber-200 border border-amber-600/50 transition flex items-center gap-1.5 shadow disabled:opacity-50"
                            title="Agente IA KURAQ escanea el portal oficial de El Peruano para detectar nuevas normas o caducidades"
                        >
                            <RefreshCw className={`w-3.5 h-3.5 ${syncingElPeruano ? "animate-spin text-amber-400" : ""}`} />
                            <span>{syncingElPeruano ? "Escaneando El Peruano..." : "Sincronizar El Peruano (KURAQ)"}</span>
                        </button>

                        <Link
                            href="/yachay"
                            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-950/60 hover:bg-emerald-900 text-emerald-200 border border-emerald-700/50 transition flex items-center gap-1.5 shadow"
                        >
                            <span>Ir a AMARU-YACHAY</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                    </div>
                </div>

                {/* Métricas Dinámicas del Ciclo de Vida Normativo (El Peruano & SINAGERD) */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 mt-5 pt-4 border-t border-slate-800/80 text-xs">
                    <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
                        <span className="text-[10px] text-slate-400 block font-medium">Total Normas</span>
                        <span className="text-lg font-black text-white">{lifecycleSummary?.total_normas ?? 51}</span>
                    </div>
                    <div className="bg-slate-950/80 p-2.5 rounded-xl border border-emerald-900/40">
                        <span className="text-[10px] text-emerald-400 block font-medium">🟢 Vigentes</span>
                        <span className="text-lg font-black text-emerald-400">{lifecycleSummary?.vigentes ?? 16}</span>
                    </div>
                    <div className="bg-slate-950/80 p-2.5 rounded-xl border border-amber-800/60 relative overflow-hidden">
                        <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                        <span className="text-[10px] text-amber-300 block font-medium">🟡 Por Caducar (&le;15d)</span>
                        <span className="text-lg font-black text-amber-300">{lifecycleSummary?.por_caducar_15_dias ?? 2}</span>
                    </div>
                    <div className="bg-slate-950/80 p-2.5 rounded-xl border border-sky-900/40">
                        <span className="text-[10px] text-sky-400 block font-medium">🔵 Prorrogadas</span>
                        <span className="text-lg font-black text-sky-400">{lifecycleSummary?.prorrogadas ?? 1}</span>
                    </div>
                    <div className="bg-slate-950/80 p-2.5 rounded-xl border border-red-950/50">
                        <span className="text-[10px] text-red-400 block font-medium">🔴 Caducadas</span>
                        <span className="text-lg font-black text-red-400">{lifecycleSummary?.caducadas ?? 32}</span>
                    </div>
                    <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
                        <span className="text-[10px] text-slate-400 block font-medium">Decretos Urgencia</span>
                        <span className="text-lg font-black text-purple-400">6</span>
                    </div>
                </div>

                {/* Banner de Sincronización Exitosa con KURAQ */}
                {syncResult && (
                    <div className="mt-4 p-3 bg-emerald-950/60 border border-emerald-600/60 rounded-xl flex items-center justify-between text-xs text-emerald-200">
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                            <span>
                                <strong>KURAQ Sincronizado:</strong> {syncResult.auditoria?.normas_analizadas || 51} normas verificadas con <em>El Peruano</em> (SHA-256: <code className="font-mono text-[10px] text-emerald-300">{syncResult.auditoria?.hash_sha256?.substring(0, 12)}...</code>).
                            </span>
                        </div>
                        <span className="text-[10px] font-mono text-emerald-400 bg-emerald-900/60 px-2 py-0.5 rounded border border-emerald-700">
                            Corte: {syncResult.auditoria?.fecha_corte || "Hoy"}
                        </span>
                    </div>
                )}

                {/* Banner de Alerta Crítica: Vencimiento Inminente & Blindaje Penal Art. 377 CP */}
                {lifecycleSummary?.alertas_inminentes && lifecycleSummary.alertas_inminentes.length > 0 && (
                    <div className="mt-4 p-4 rounded-xl bg-red-950/50 border border-red-600/60 flex items-start gap-3.5 shadow-lg">
                        <ShieldAlert className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                        <div className="space-y-1.5 w-full">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                                <span className="text-xs font-black text-red-200 uppercase tracking-wide flex items-center gap-1.5">
                                    <span>⚠️ ALERTA DE CADUCIDAD INMINENTE — BLINDAJE PENAL ART. 377 CÓDIGO PENAL</span>
                                </span>
                                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-red-900/80 text-red-100 font-bold border border-red-700">
                                    {lifecycleSummary.alertas_inminentes.length} DECRETOS CON VENCIMIENTO &lt; 15 DÍAS
                                </span>
                            </div>
                            <p className="text-xs text-red-200/90 leading-relaxed">
                                Contratar directamente bajo decretos caducados o fuera del plazo legal carece de amparo del SINAGERD y acarrea responsabilidad penal por omisión o extralimitación de funciones (Art. 377 CP). Se debe solicitar la prórroga ante INDECI/PCM o regularizar antes de la fecha límite:
                            </p>
                            <div className="flex flex-wrap gap-2 pt-1">
                                {lifecycleSummary.alertas_inminentes.map((al: any, idx: number) => (
                                    <div key={idx} className="px-2.5 py-1 rounded-lg bg-red-900/70 border border-red-700 text-red-100 font-mono text-[11px] flex items-center gap-2">
                                        <Clock className="w-3.5 h-3.5 text-amber-300" />
                                        <span className="font-bold">{al.norma}</span>
                                        <span className="text-amber-300">({al.dias_restantes} días restantes — vence {al.fecha_vencimiento})</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

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
                    <button
                        onClick={() => setActiveTab("planes")}
                        className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-t-xl transition border-t border-x ${
                            activeTab === "planes"
                                ? "bg-slate-900 text-teal-400 border-teal-500/40 border-b-2 border-b-teal-400"
                                : "text-slate-400 hover:text-slate-200 border-transparent hover:bg-slate-800/50"
                        }`}
                    >
                        <BookOpen className="w-4 h-4" />
                        <span>Planes de Contingencia FEN (39 Planes Oficiales)</span>
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
                                    {/* Banner de Amparo y Blindaje Territorial */}
                                    <div className={`p-4 rounded-xl border flex items-start gap-3.5 ${
                                        districtStatus.amparado_emergencia
                                            ? districtStatus.estado_semaforo === "AMARILLO_POR_CADUCAR"
                                                ? "bg-amber-950/40 border-amber-500/60"
                                                : "bg-emerald-950/40 border-emerald-600/50"
                                            : "bg-red-950/40 border-red-600/60"
                                    }`}>
                                        {districtStatus.amparado_emergencia ? (
                                            <ShieldCheck className={`w-6 h-6 shrink-0 mt-0.5 ${
                                                districtStatus.estado_semaforo === "AMARILLO_POR_CADUCAR" ? "text-amber-400" : "text-emerald-400"
                                            }`} />
                                        ) : (
                                            <ShieldAlert className="w-6 h-6 text-red-400 shrink-0 mt-0.5" />
                                        )}
                                        <div className="space-y-1.5 w-full">
                                            <div className="flex flex-wrap items-center justify-between gap-2">
                                                <div className="flex items-center gap-2">
                                                    <span className={`text-xs font-black uppercase tracking-wide ${
                                                        districtStatus.amparado_emergencia ? "text-emerald-300" : "text-red-300"
                                                    }`}>
                                                        {districtStatus.amparado_emergencia
                                                            ? "ESTATUS: AMPARADO EN ESTADO DE EMERGENCIA ACTIVA"
                                                            : "ESTATUS: NO AMPARADO EN ESTADO DE EMERGENCIA"}
                                                    </span>
                                                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-900 text-slate-300 border border-slate-700">
                                                        UBIGEO: {districtStatus.ubigeo}
                                                    </span>
                                                </div>

                                                {/* Badge de Días Restantes */}
                                                <span className={`px-2.5 py-0.5 rounded text-[10px] font-mono font-bold border ${
                                                    districtStatus.estado_semaforo === "VERDE_VIGENTE"
                                                        ? "bg-emerald-900/80 text-emerald-200 border-emerald-700"
                                                        : districtStatus.estado_semaforo === "AZUL_PRORROGADO"
                                                        ? "bg-sky-900/80 text-sky-200 border-sky-700"
                                                        : districtStatus.estado_semaforo === "AMARILLO_POR_CADUCAR"
                                                        ? "bg-amber-900 text-amber-200 border-amber-600 animate-pulse"
                                                        : "bg-red-900 text-red-200 border-red-700"
                                                }`}>
                                                    {districtStatus.dias_vigencia_restantes > 0
                                                        ? `⏳ ${districtStatus.dias_vigencia_restantes} DÍAS RESTANTES`
                                                        : "🔴 VENCIDO"}
                                                </span>
                                            </div>

                                            <h3 className="text-base font-bold text-white">
                                                Municipalidad Distrital de {districtStatus.distrito} ({districtStatus.departamento})
                                            </h3>
                                            <p className="text-xs text-slate-200 leading-relaxed">
                                                El distrito está formalmente protegido bajo el <strong>{districtStatus.decreto_base}</strong> y ampliado con el <strong>{districtStatus.prorroga_vigente}</strong>. Quedan <strong>{districtStatus.dias_vigencia_restantes} días de vigencia legal</strong> para comprometer fondos de emergencia.
                                            </p>
                                        </div>
                                    </div>

                                    {/* Alerta de Responsabilidad Penal Art. 377 Código Penal */}
                                    {districtStatus.advertencia_penal_art_377 && (
                                        <div className="p-3.5 bg-red-950/60 border border-red-600/70 rounded-xl text-xs text-red-200 leading-relaxed flex items-start gap-2.5 shadow">
                                            <ShieldAlert className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                                            <div>
                                                <strong className="text-red-300 block text-xs font-bold uppercase tracking-wider">
                                                    Responsabilidad Penal Funcional (Art. 377 Código Penal):
                                                </strong>
                                                <span>{districtStatus.advertencia_penal_art_377}</span>
                                            </div>
                                        </div>
                                    )}

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
                        {/* Selector de Modo de Búsqueda: Semántica IA vs Léxica Clásica */}
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-800 pb-3">
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setIsSemanticMode(true)}
                                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                                        isSemanticMode
                                            ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20"
                                            : "bg-slate-950 text-slate-400 hover:text-white border border-slate-800"
                                    }`}
                                >
                                    <Sparkles className="w-3.5 h-3.5" />
                                    <span>Búsqueda Semántica IA (Vertex AI 768-D)</span>
                                </button>
                                <button
                                    onClick={() => setIsSemanticMode(false)}
                                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                                        !isSemanticMode
                                            ? "bg-sky-600 text-white shadow-md shadow-sky-600/20"
                                            : "bg-slate-950 text-slate-400 hover:text-white border border-slate-800"
                                    }`}
                                >
                                    <Search className="w-3.5 h-3.5" />
                                    <span>Búsqueda Textual Clásica</span>
                                </button>
                            </div>

                            {vectorStatus && (
                                <div className="text-[11px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2.5 py-1 rounded-lg flex items-center gap-1.5">
                                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                    <span>{vectorStatus.total_chunks_vectorizados || 105} vectores en Cloud SQL PostGIS</span>
                                </div>
                            )}
                        </div>

                        {/* MODO 1: BÚSQUEDA SEMÁNTICA VECTORIAL CON VERTEX AI */}
                        {isSemanticMode ? (
                            <div className="space-y-4">
                                <div className="flex flex-col md:flex-row gap-2">
                                    <div className="relative flex-1">
                                        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                                        <input
                                            type="text"
                                            placeholder="Escriba su consulta táctica u operativa (ej. contratación directa de orugas D8, bono 500 soles, omisión de funciones)..."
                                            value={semanticQuery}
                                            onChange={(e) => setSemanticQuery(e.target.value)}
                                            onKeyDown={(e) => e.key === "Enter" && handleSemanticSearch()}
                                            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                                        />
                                    </div>
                                    <button
                                        onClick={() => handleSemanticSearch()}
                                        disabled={isSearchingSemantic}
                                        className="px-4 py-2.5 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white transition flex items-center justify-center gap-1.5 shadow disabled:opacity-50"
                                    >
                                        {isSearchingSemantic ? (
                                            <>
                                                <Clock className="w-4 h-4 animate-spin" />
                                                <span>Analizando Vectores...</span>
                                            </>
                                        ) : (
                                            <>
                                                <Sparkles className="w-4 h-4" />
                                                <span>Buscar con IA</span>
                                            </>
                                        )}
                                    </button>
                                </div>

                                {/* Chips de Consultas Tácticas Rápidas */}
                                <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                                    <span className="text-slate-400 font-semibold mr-1">Consultas de Mando:</span>
                                    {[
                                        { label: "🚜 Alquiler Maquinaria y Diésel", q: "contratacion directa de excavadoras y maquinaria pesada para defensas ribereñas" },
                                        { label: "🏠 Bono BAE S/ 500 Familias", q: "bono de arrendamiento de 500 soles para familias con casas destruidas por inundacion" },
                                        { label: "⚖️ Responsabilidad Penal Art. 377 CP", q: "responsabilidad penal y delito de omision de funciones de alcaldes por no limpiar quebradas" },
                                        { label: "💰 Presupuesto PP 068", q: "modificacion presupuestal para actividad 5006144 programa 068" },
                                        { label: "📋 Ficha EDAN y Ayuda BAH", q: "plazos y registro de ficha edan en el sinpad para bienes de ayuda humanitaria" }
                                    ].map((chip, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => {
                                                setSemanticQuery(chip.q);
                                                handleSemanticSearch(chip.q);
                                            }}
                                            className="px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-amber-500/50 transition"
                                        >
                                            {chip.label}
                                        </button>
                                    ))}
                                </div>

                                {/* Dictamen de Amparo Inmediato */}
                                {semanticDictamen && (
                                    <div className="p-3.5 bg-gradient-to-r from-amber-950/40 via-slate-900 to-amber-950/20 border border-amber-600/50 rounded-xl space-y-1.5 shadow-lg">
                                        <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
                                            <Scale className="w-4 h-4 text-amber-400" />
                                            <span>DICTAMEN DE AMPARO JURÍDICO INMEDIATO (Vertex AI RAG):</span>
                                        </div>
                                        <p className="text-xs text-slate-200 leading-relaxed">
                                            {semanticDictamen}
                                        </p>
                                    </div>
                                )}

                                {/* Resultados Semánticos */}
                                {semanticResults.length > 0 && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
                                        {semanticResults.map((item, idx) => {
                                            const pct = item.similitud_porcentaje || 0;
                                            const isHigh = pct >= 65;
                                            const isMed = pct >= 50;
                                            return (
                                                <div
                                                    key={idx}
                                                    className="bg-slate-950 border border-slate-800 hover:border-amber-500/40 rounded-xl p-3.5 space-y-2.5 transition flex flex-col justify-between shadow"
                                                >
                                                    <div className="space-y-2">
                                                        <div className="flex justify-between items-start gap-2">
                                                            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-900 text-sky-300 border border-slate-800">
                                                                {item.norma_nombre}
                                                            </span>
                                                            <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                                                                isHigh
                                                                    ? "bg-emerald-950 text-emerald-300 border-emerald-700"
                                                                    : isMed
                                                                    ? "bg-amber-950 text-amber-300 border-amber-700"
                                                                    : "bg-slate-900 text-slate-400 border-slate-800"
                                                            }`}>
                                                                ⚡ {pct}% Afinidad
                                                            </span>
                                                        </div>

                                                        <div className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-400">
                                                            <span className="px-1.5 py-0.5 rounded bg-slate-900 text-amber-300 border border-slate-800">
                                                                {item.tipo_fragmento || "NORMA"}
                                                            </span>
                                                            <span className="truncate">{item.sector}</span>
                                                        </div>

                                                        <p className="text-xs text-slate-300 leading-relaxed line-clamp-4">
                                                            {item.contenido_texto}
                                                        </p>
                                                    </div>

                                                    <div className="pt-2 border-t border-slate-850 text-[10px] text-amber-300/90 font-medium">
                                                        ✓ {item.sustento_tactico}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}

                                {semanticResults.length === 0 && !isSearchingSemantic && (
                                    <div className="text-center py-8 text-xs text-slate-500 bg-slate-950/40 border border-slate-800/60 rounded-xl p-6">
                                        <Sparkles className="w-6 h-6 text-amber-400 mx-auto mb-2 opacity-60" />
                                        <p className="text-slate-300 font-semibold mb-1">
                                            Motor Semántico Vectorial Activo
                                        </p>
                                        <p className="text-slate-400 max-w-lg mx-auto">
                                            Seleccione una de las consultas de mando sugeridas arriba o escriba su requerimiento operativo para obtener el amparo legal inmediato y la afinidad porcentual.
                                        </p>
                                    </div>
                                )}
                            </div>
                        ) : (
                            /* MODO 2: BÚSQUEDA LÉXICA CLÁSICA */
                            <div className="space-y-4">
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
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
                                            value={filterVigencia}
                                            onChange={(e) => setFilterVigencia(e.target.value)}
                                            className="bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-slate-300 focus:outline-none"
                                        >
                                            <option value="ALL">Todas las Vigencias</option>
                                            <option value="VIGENTE">🟢 Vigentes ({lifecycleSummary?.vigentes ?? 16})</option>
                                            <option value="POR_CADUCAR">🟡 Por Caducar (&le;15d) ({lifecycleSummary?.por_caducar_15_dias ?? 2})</option>
                                            <option value="PRORROGADO">🔵 Prorrogadas ({lifecycleSummary?.prorrogadas ?? 1})</option>
                                            <option value="CADUCADO">🔴 Caducadas ({lifecycleSummary?.caducadas ?? 32})</option>
                                        </select>

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

                                                {/* Estado de Vigencia Oficial y Cuenta Regresiva */}
                                                <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                                                    {item.estado_vigencia === "VIGENTE" && (
                                                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-700">
                                                            🟢 Vigente ({item.dias_vigencia_restantes ?? item.dias_restantes}d)
                                                        </span>
                                                    )}
                                                    {item.estado_vigencia === "POR_CADUCAR" && (
                                                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-700 animate-pulse">
                                                            🟡 Vence en {item.dias_vigencia_restantes ?? item.dias_restantes}d
                                                        </span>
                                                    )}
                                                    {item.estado_vigencia === "PRORROGADO" && (
                                                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-700">
                                                            🔵 Prorrogado ({item.dias_vigencia_restantes ?? item.dias_restantes}d)
                                                        </span>
                                                    )}
                                                    {item.estado_vigencia === "CADUCADO" && (
                                                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-950/80 text-red-300 border border-red-800">
                                                            🔴 Caducado
                                                        </span>
                                                    )}
                                                    {item.fecha_vencimiento_calculada && (
                                                        <span className="text-[10px] font-mono text-slate-400">
                                                            Vence: {item.fecha_vencimiento_calculada}
                                                        </span>
                                                    )}
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
                        <div className="bg-amber-950/50 border-2 border-amber-500/70 rounded-xl p-4 flex items-start gap-3.5 text-xs shadow-xl">
                            <AlertTriangle className="w-6 h-6 text-amber-400 shrink-0 mt-0.5" />
                            <div className="space-y-1.5">
                                <span className="font-extrabold text-amber-300 block uppercase tracking-wider text-xs flex items-center gap-2">
                                    <Bot className="w-4 h-4 text-purple-400" />
                                    <span>Asistente IA • Advertencia Mandatoria de Soberanía Humana &amp; Responsabilidad de Autoridades</span>
                                </span>
                                <p className="text-slate-200 leading-relaxed text-[11.5px]">
                                    Este módulo conversacional y de diseño documental opera mediante un <strong>Asistente de Inteligencia Artificial (IA Generativa RAG)</strong>. Sus respuestas, análisis, interpretaciones y proyectos documentales son <strong>estrictamente sugerencias y recomendaciones técnicas de orientación preliminar</strong>, y <strong>BAJO NINGUNA CIRCUNSTANCIA CONSTITUYEN UNA TOMA DE DECISIÓN NI REEMPLAZAN LA SOBERANÍA HUMANA, EL JUICIO PROFESIONAL NI EL CRITERIO JURÍDICO FORMAL</strong>.
                                </p>
                                <p className="text-amber-200/90 text-[11px] font-semibold pt-1 border-t border-amber-800/60">
                                    ⚖️ La responsabilidad legal, administrativa, civil y penal por la evaluación, visación colegiada, emisión de actos resolutivos, suscripción de contratos y ejecución presupuestal recae de forma exclusiva, personal e indelegable en las AUTORIDADES COMPETENTES (Alcaldes, Gerentes Municipales, Directores de Defensa Civil) y sus respectivas oficinas de Asesoría Jurídica.
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
                                        {msg.sender === "bot" && (
                                            <div className="flex items-center gap-1.5 text-[10px] text-purple-300 font-mono font-bold pb-1.5 mb-1.5 border-b border-slate-800">
                                                <Bot className="w-3 h-3 text-purple-400" />
                                                <span>Sugerencia Asistida por IA • No Vinculante • Decisión Final de la Autoridad</span>
                                            </div>
                                        )}
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
            {/* PESTAÑA 5: PLANES DE CONTINGENCIA FEN (39 PLANES OFICIALES GOB.PE)        */}
            {/* ========================================================================= */}
            {activeTab === "planes" && (
                <div className="space-y-6">
                    <div className="bg-slate-900 border border-teal-500/30 rounded-2xl p-5 space-y-4 shadow-xl">
                        <div className="flex flex-col md:flex-row justify-between md:items-center gap-3 border-b border-slate-800 pb-4">
                            <div>
                                <div className="flex items-center gap-2">
                                    <BookOpen className="w-5 h-5 text-teal-400" />
                                    <h2 className="text-base font-bold text-white">
                                        Catálogo de Planes de Contingencia ante el Fenómeno El Niño
                                    </h2>
                                    <span className="text-[10px] font-mono bg-teal-950 text-teal-300 px-2 py-0.5 rounded border border-teal-800 font-bold">
                                        39 PLANES OFICIALES • GOB.PE
                                    </span>
                                </div>
                                <p className="text-xs text-slate-400 mt-1">
                                    Repositorio indexado de los 39 planes oficiales de contingencia FEN de ministerios, organismos públicos, GOREs y municipalidades provinciales/distritales.
                                </p>
                            </div>
                            <span className="px-3 py-1 rounded-xl text-xs font-mono bg-slate-950 text-slate-300 border border-slate-800 flex items-center gap-1.5 self-start md:self-auto">
                                <FolderCheck className="w-4 h-4 text-teal-400" />
                                <span>Almacenamiento Local: data/Planes de contingencia/</span>
                            </span>
                        </div>

                        {/* Filtros de Búsqueda de Planes */}
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                            <div className="relative w-full md:w-80">
                                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                                <input
                                    type="text"
                                    placeholder="Buscar por entidad o título (ej. MINSA, Piura, ONPE)..."
                                    value={searchPlan}
                                    onChange={(e) => setSearchPlan(e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
                                />
                            </div>

                            <div className="flex flex-wrap gap-2 text-xs">
                                <select
                                    value={filterNivelPlan}
                                    onChange={(e) => setFilterNivelPlan(e.target.value)}
                                    className="bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-slate-300 focus:outline-none"
                                >
                                    <option value="ALL">Todos los Niveles</option>
                                    <option value="NACIONAL">Nacional (Ministerios / OP)</option>
                                    <option value="REGIONAL">Regional (GOREs)</option>
                                    <option value="LOCAL">Local (Municipalidades)</option>
                                </select>

                                <select
                                    value={filterSectorPlan}
                                    onChange={(e) => setFilterSectorPlan(e.target.value)}
                                    className="bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-slate-300 focus:outline-none"
                                >
                                    <option value="ALL">Todos los Sectores</option>
                                    <option value="DEFENSA">Defensa / INDECI</option>
                                    <option value="SALUD">Salud / MINSA</option>
                                    <option value="VIVIENDA">Vivienda / Saneamiento</option>
                                    <option value="TRANSPORTE">Transportes y Comunicaciones</option>
                                    <option value="ELECTORAL">Electoral / ONPE</option>
                                    <option value="REGIONAL">Gobiernos Regionales</option>
                                    <option value="MUNICIPAL">Municipalidades</option>
                                </select>
                            </div>
                        </div>

                        {/* Cuadrícula de los 39 Planes de Contingencia */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
                            {planes
                                .filter((p: any) => {
                                    const matchSector = filterSectorPlan === "ALL" || p.sector?.toUpperCase().includes(filterSectorPlan.toUpperCase());
                                    const matchNivel = filterNivelPlan === "ALL" || p.nivel_gobierno?.toUpperCase() === filterNivelPlan.toUpperCase();
                                    const matchSearch = !searchPlan ||
                                        p.titulo?.toLowerCase().includes(searchPlan.toLowerCase()) ||
                                        p.entidad_emisora?.toLowerCase().includes(searchPlan.toLowerCase()) ||
                                        p.archivo_nombre?.toLowerCase().includes(searchPlan.toLowerCase());
                                    return matchSector && matchNivel && matchSearch;
                                })
                                .map((plan: any, idx: number) => (
                                    <div
                                        key={idx}
                                        className="bg-slate-950 border border-slate-800 hover:border-teal-500/50 rounded-xl p-4 flex flex-col justify-between transition group shadow-sm"
                                    >
                                        <div className="space-y-2">
                                            <div className="flex justify-between items-start gap-2">
                                                <span className="font-mono text-[10px] font-bold text-teal-300 bg-teal-950/80 px-2 py-0.5 rounded border border-teal-800">
                                                    {plan.plan_id}
                                                </span>
                                                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                                                    plan.nivel_gobierno === "NACIONAL"
                                                        ? "bg-sky-950 text-sky-300 border border-sky-800"
                                                        : plan.nivel_gobierno === "REGIONAL"
                                                        ? "bg-purple-950 text-purple-300 border border-purple-800"
                                                        : "bg-amber-950 text-amber-300 border border-amber-800"
                                                }`}>
                                                    {plan.nivel_gobierno}
                                                </span>
                                            </div>

                                            <h3 className="text-xs font-bold text-white group-hover:text-teal-300 transition line-clamp-2 leading-snug">
                                                {plan.titulo}
                                            </h3>

                                            <p className="text-[11px] text-slate-400 font-medium">
                                                {plan.entidad_emisora}
                                            </p>

                                            {/* Recursos Declarados */}
                                            <div className="flex flex-wrap gap-2 pt-1 text-[10px]">
                                                <span className="bg-slate-900 px-2 py-0.5 rounded text-slate-300 border border-slate-800">
                                                    🚜 {plan.maquinaria_declarada_unidades ?? 12} maq. pesada
                                                </span>
                                                <span className="bg-slate-900 px-2 py-0.5 rounded text-slate-300 border border-slate-800">
                                                    🏕️ {plan.albergues_declarados ?? 4} albergues
                                                </span>
                                                <span className="bg-slate-900 px-2 py-0.5 rounded text-slate-300 border border-slate-800">
                                                    📄 {plan.paginas_estimadas ?? 80} págs
                                                </span>
                                            </div>
                                        </div>

                                        <div className="mt-3 pt-3 border-t border-slate-850 space-y-1.5 text-[10px]">
                                            <div className="flex justify-between text-slate-400">
                                                <span>Foco Operativo:</span>
                                                <span className="text-slate-300 truncate max-w-[150px] font-mono">{plan.archivo_nombre}</span>
                                            </div>
                                            <div className="flex justify-between text-slate-400">
                                                <span>Contacto / COE:</span>
                                                <span className="text-teal-400 font-mono">{plan.contacto_emergencia || "COEN-INDECI"}</span>
                                            </div>
                                            <div className="pt-2">
                                                <button
                                                    onClick={() => {
                                                        setActiveTab("copiloto");
                                                        handleSendQuestion(`Explícame los lineamientos, maquinaria y protocolos de respuesta establecidos en el plan ${plan.titulo} (${plan.plan_id})`);
                                                    }}
                                                    className="w-full py-1.5 rounded-lg text-xs font-medium bg-slate-900 hover:bg-slate-800 text-teal-300 border border-teal-800/40 flex items-center justify-center gap-1.5 transition"
                                                >
                                                    <Sparkles className="w-3 h-3 text-teal-400" />
                                                    <span>Analizar con Copiloto IA</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                        </div>

                        {planes.length === 0 && (
                            <div className="text-center py-8 text-xs text-slate-500">
                                Cargando catálogo de planes de contingencia desde el backend...
                            </div>
                        )}
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

                        {/* Banner de Advertencia de Asistente IA y Soberanía Humana */}
                        <div className="mx-4 mt-4 p-3.5 bg-amber-950/70 border-2 border-amber-500/80 rounded-xl flex items-start gap-3 text-xs shadow-lg">
                            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                            <div className="space-y-1">
                                <span className="font-extrabold text-amber-300 block uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                                    <Bot className="w-3.5 h-3.5 text-purple-400" />
                                    <span>Documento Borrador Asistido por Inteligencia Artificial • Soberanía Humana Intacta</span>
                                </span>
                                <p className="text-slate-200 text-[11px] leading-relaxed">
                                    Este documento ha sido redactado como una <strong>sugerencia y borrador técnico preliminar</strong> por el Asistente IA de AMARU-LEX. <strong>NO constituye una toma de decisión, no es un acto administrativo final ni reemplaza la soberanía humana ni el dictamen colegiado de los funcionarios públicos.</strong>
                                </p>
                                <p className="text-amber-200/90 text-[10.5px] font-semibold pt-1 border-t border-amber-800/60">
                                    ⚖️ La responsabilidad exclusiva, personal e indelegable por la verificación técnica, visación legal de Asesoría Jurídica, firma y ejecución recae única y exclusivamente en las AUTORIDADES COMPETENTES.
                                </p>
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
