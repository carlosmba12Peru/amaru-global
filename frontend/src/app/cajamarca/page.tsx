"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
    Building2,
    ShieldAlert,
    ShieldCheck,
    AlertTriangle,
    Waves,
    Droplets,
    Activity,
    FileText,
    Download,
    CheckCircle2,
    RefreshCw,
    Search,
    Sliders,
    Zap,
    Scale,
    Users,
    Calendar,
    ChevronRight,
    Lock,
    ExternalLink,
    Clock,
    MapPin,
    Compass
} from "lucide-react";

interface PuntoCritico {
    id: string;
    denominacion: string;
    codigo_ficha_plan: string;
    sector: string;
    cauce: string;
    altitud_msnm: number;
    coordenadas_utm_17s: {
        inicio: { este: number; norte: number };
        final: { este: number; norte: number };
    };
    nivel_peligro: string;
    nivel_vulnerabilidad: string;
    elementos_expuestos: {
        poblacion_afectada: number;
        viviendas_expuestas: number;
        material_predominante: string;
        infraestructura_publica: string[];
    };
    metrados_obra: {
        descolmatacion_cauce_km: number;
        dique_material_propio_km: number;
        enrocado_proteccion_km: number;
    };
    presupuesto_estimado_pen: number;
    plazo_ejecucion_dias: number;
    fuente_financiamiento_propuesta: string;
}

interface CeldaPisco {
    celda_id: string;
    nombre: string;
    area_drenaje_km2: number;
    precipitacion_total_simulada_mm: number;
    precipitacion_efectiva_mm: number;
    caudal_pico_estimado_m3_s: number;
    tiempo_retardo_tlag_h: number;
    tiempo_anticipacion_alerta_h: number;
    nivel_alerta: string;
    color_alerta: string;
}

interface SimulacionPiscoResponse {
    timestamp: string;
    parametros_simulacion: {
        multiplicador_precipitacion: number;
        intensidad_tormenta_mm_h: number;
        duracion_tormenta_h: number;
        precipitacion_acumulada_mm: number;
    };
    celdas_pisco: CeldaPisco[];
    resumen_alerta_distrital: string;
}

interface AuditoriaPP0068 {
    entidad: string;
    inversion_estructural_requerida_pen: number;
    presupuesto_pp0068_disponible_2024_pen: number;
    brecha_financiera_pen: number;
    ratio_cobertura_financiera_pct: number;
    alerta_forense: {
        patron_paralisis: string;
        distorsion_gasto: string;
        estrategia_recomendada: string;
    };
}

interface DossierTransferencia {
    titulo_instrumento: string;
    distrito: string;
    ubigeo: string;
    fecha_cierre_mandato: string;
    autoridad_saliente: string;
    autoridad_entrante_cargo: string;
    marco_juridico_responsabilidad: string[];
    notificacion_vinculante: string;
    cartera_proyectos_priorizados: Array<{
        id: string;
        denominacion: string;
        sector: string;
        presupuesto_requerido: number;
        nivel_peligro: string;
    }>;
    presupuesto_global_comprometido_pen: number;
    sello_criptografico_sha256: string;
    estado_juridico: string;
    timestamp_certificacion: string;
}

export default function CajamarcaContingencyPage() {
    const [activeTab, setActiveTab] = useState<"puntos" | "pisco" | "auditoria" | "dossier">("puntos");
    const [puntos, setPuntos] = useState<PuntoCritico[]>([]);
    const [selectedPunto, setSelectedPunto] = useState<PuntoCritico | null>(null);
    const [simulacion, setSimulacion] = useState<SimulacionPiscoResponse | null>(null);
    const [auditoria, setAuditoria] = useState<AuditoriaPP0068 | null>(null);
    const [dossier, setDossier] = useState<DossierTransferencia | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [searchPunto, setSearchPunto] = useState<string>("");

    // Sliders de simulación hidrológica
    const [lluviaMultiplicador, setLluviaMultiplicador] = useState<number>(1.0);
    const [intensidadMmH, setIntensidadMmH] = useState<number>(35.0);
    const [duracionHoras, setDuracionHoras] = useState<number>(3.0);

    // Modal IOARR
    const [ioarrModalOpen, setIoarrModalOpen] = useState<boolean>(false);
    const [ioarrData, setIoarrData] = useState<any>(null);
    const [loadingIoarr, setLoadingIoarr] = useState<boolean>(false);

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        setLoading(true);
        try {
            const [resPuntos, resAuditoria, resDossier] = await Promise.all([
                fetch("http://localhost:8000/api/v1/cajamarca/puntos-criticos"),
                fetch("http://localhost:8000/api/v1/cajamarca/pp0068-diagnostico"),
                fetch("http://localhost:8000/api/v1/cajamarca/dossier-transferencia")
            ]);

            if (resPuntos.ok) {
                const data = await resPuntos.json();
                setPuntos(data.puntos_criticos || []);
                if (data.puntos_criticos?.length > 0) {
                    setSelectedPunto(data.puntos_criticos[0]);
                }
            }

            if (resAuditoria.ok) {
                setAuditoria(await resAuditoria.json());
            }

            if (resDossier.ok) {
                setDossier(await resDossier.json());
            }

            await executeSimulacionPisco(1.0, 35.0, 3.0);
        } catch (error) {
            console.error("Error fetching Cajamarca contingency data:", error);
        } finally {
            setLoading(false);
        }
    };

    const executeSimulacionPisco = async (mult: number, intensidad: number, duracion: number) => {
        try {
            const url = `http://localhost:8000/api/v1/cajamarca/simulacion-hidraulica-pisco?multiplicador_lluvia=${mult}&intensidad_mm_h=${intensidad}&duracion_horas=${duracion}`;
            const res = await fetch(url);
            if (res.ok) {
                setSimulacion(await res.json());
            }
        } catch (error) {
            console.error("Error simulating PISCO hydraulics:", error);
        }
    };

    const handleSliderChange = (mult: number, intensidad: number, duracion: number) => {
        setLluviaMultiplicador(mult);
        setIntensidadMmH(intensidad);
        setDuracionHoras(duracion);
        executeSimulacionPisco(mult, intensidad, duracion);
    };

    const openIoarrModal = async (puntoId: string) => {
        setLoadingIoarr(true);
        setIoarrModalOpen(true);
        try {
            const res = await fetch(`http://localhost:8000/api/v1/cajamarca/ioarr-fondes?punto_id=${puntoId}`);
            if (res.ok) {
                setIoarrData(await res.json());
            }
        } catch (error) {
            console.error("Error fetching IOARR data:", error);
        } finally {
            setLoadingIoarr(false);
        }
    };

    const filteredPuntos = puntos.filter(p =>
        p.denominacion.toLowerCase().includes(searchPunto.toLowerCase()) ||
        p.sector.toLowerCase().includes(searchPunto.toLowerCase()) ||
        p.cauce.toLowerCase().includes(searchPunto.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 p-4 lg:p-8 font-sans">
            {/* Header / Command Ribbon */}
            <div className="border-b border-slate-800 pb-6 mb-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-3">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                <Activity className="w-3.5 h-3.5 animate-pulse" />
                                CONSOLA OPERATIVA C4ISR • CAJAMARCA
                            </span>
                            <span className="text-xs text-slate-500">UBIGEO 061003 • CUENCA CRISNEJAS</span>
                        </div>
                        <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight mt-2 text-white flex items-center gap-3">
                            <Waves className="w-8 h-8 text-cyan-400" />
                            Distrito Eduardo Villanueva • Plan PPRRD SIGRID 21362
                        </h1>
                        <p className="text-sm text-slate-400 mt-1 max-w-3xl">
                            Monitoreo hidrológico con Grilla Virtual <span className="text-cyan-300 font-semibold">PISCO/SENAMHI</span>, 9 defensas ribereñas críticas (S/ 25.87M),
                            auditoría presupuestal PP 0068 y <span className="text-amber-400 font-semibold">Dossier Cero Días (31-Dic-2026)</span>.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <Link
                            href="/piura"
                            className="px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-300 transition-colors flex items-center gap-2"
                        >
                            <Compass className="w-4 h-4 text-cyan-400" />
                            Consola Piura
                        </Link>
                        <button
                            onClick={() => fetchInitialData()}
                            className="px-3.5 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-lg shadow-cyan-600/20 transition-colors flex items-center gap-2"
                        >
                            <RefreshCw className="w-4 h-4" />
                            Sincronizar C2
                        </button>
                    </div>
                </div>

                {/* Banner de Métricas Estratégicas */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mt-6">
                    <div className="bg-slate-900/80 border border-slate-800 p-3.5 rounded-xl">
                        <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">Puntos Críticos</span>
                        <div className="text-xl font-bold text-cyan-400 mt-1">9 Obras</div>
                        <span className="text-[10px] text-slate-500 mt-0.5 block">Cedrocucho, Yunguilla, Crisnejas</span>
                    </div>

                    <div className="bg-slate-900/80 border border-slate-800 p-3.5 rounded-xl">
                        <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">Inversión Total</span>
                        <div className="text-xl font-bold text-emerald-400 mt-1">S/ 25.87M</div>
                        <span className="text-[10px] text-slate-500 mt-0.5 block">Cartera FONDES / MVCS</span>
                    </div>

                    <div className="bg-slate-900/80 border border-slate-800 p-3.5 rounded-xl">
                        <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">Población Protegida</span>
                        <div className="text-xl font-bold text-amber-400 mt-1">4,091 Hab.</div>
                        <span className="text-[10px] text-slate-500 mt-0.5 block">1,477 Viviendas de adobe</span>
                    </div>

                    <div className="bg-slate-900/80 border border-slate-800 p-3.5 rounded-xl">
                        <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">Tierras Agrícolas</span>
                        <div className="text-xl font-bold text-indigo-400 mt-1">622.9 ha</div>
                        <span className="text-[10px] text-slate-500 mt-0.5 block">Bajo cota de desborde</span>
                    </div>

                    <div className="bg-slate-900/80 border border-slate-800 p-3.5 rounded-xl">
                        <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">Metrado Defensas</span>
                        <div className="text-xl font-bold text-sky-400 mt-1">11.7 km</div>
                        <span className="text-[10px] text-slate-500 mt-0.5 block">8.7 km enrocado pesado</span>
                    </div>

                    <div className="bg-slate-900/80 border border-slate-800 p-3.5 rounded-xl">
                        <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">Transición Edil</span>
                        <div className="text-xl font-bold text-rose-400 mt-1">31-Dic-2026</div>
                        <span className="text-[10px] text-slate-500 mt-0.5 block">Riesgo 100 días blindado</span>
                    </div>
                </div>
            </div>

            {/* Selector de Pestañas */}
            <div className="flex border-b border-slate-800 mb-6 space-x-2 overflow-x-auto pb-2">
                <button
                    onClick={() => setActiveTab("puntos")}
                    className={`px-4 py-2.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 whitespace-nowrap ${
                        activeTab === "puntos"
                            ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm"
                            : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
                    }`}
                >
                    <Building2 className="w-4 h-4" />
                    Puntos Críticos & Fichas (9 Obras)
                </button>

                <button
                    onClick={() => setActiveTab("pisco")}
                    className={`px-4 py-2.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 whitespace-nowrap ${
                        activeTab === "pisco"
                            ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm"
                            : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
                    }`}
                >
                    <Sliders className="w-4 h-4" />
                    Simulación Hidráulica PISCO (Qpico & Tlag)
                </button>

                <button
                    onClick={() => setActiveTab("auditoria")}
                    className={`px-4 py-2.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 whitespace-nowrap ${
                        activeTab === "auditoria"
                            ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm"
                            : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
                    }`}
                >
                    <Scale className="w-4 h-4" />
                    Auditoría Forense PP 0068 & FONDES
                </button>

                <button
                    onClick={() => setActiveTab("dossier")}
                    className={`px-4 py-2.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 whitespace-nowrap ${
                        activeTab === "dossier"
                            ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm"
                            : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
                    }`}
                >
                    <Lock className="w-4 h-4" />
                    Dossier Cero Días (SHA-256)
                </button>
            </div>

            {/* ========================================================================= */}
            {/* TAB 1: PUNTOS CRÍTICOS & FICHAS TÉCNICAS */}
            {/* ========================================================================= */}
            {activeTab === "puntos" && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Lista lateral de los 9 proyectos */}
                    <div className="lg:col-span-5 space-y-3">
                        <div className="relative">
                            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                            <input
                                type="text"
                                placeholder="Filtrar por sector, cauce o quebrada..."
                                value={searchPunto}
                                onChange={(e) => setSearchPunto(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                            />
                        </div>

                        <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
                            {filteredPuntos.map((p) => {
                                const isSelected = selectedPunto?.id === p.id;
                                return (
                                    <div
                                        key={p.id}
                                        onClick={() => setSelectedPunto(p)}
                                        className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                                            isSelected
                                                ? "bg-slate-900 border-cyan-500/50 shadow-md shadow-cyan-950/30 ring-1 ring-cyan-500/30"
                                                : "bg-slate-900/60 border-slate-800 hover:border-slate-700"
                                        }`}
                                    >
                                        <div className="flex items-start justify-between gap-2">
                                            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-cyan-950/60 text-cyan-400 border border-cyan-800/40">
                                                {p.id}
                                            </span>
                                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                                                p.nivel_peligro === "MUY ALTO"
                                                    ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                                                    : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                                            }`}>
                                                PELIGRO {p.nivel_peligro}
                                            </span>
                                        </div>

                                        <h4 className="text-sm font-semibold text-white mt-2 leading-snug">
                                            {p.denominacion}
                                        </h4>

                                        <div className="flex items-center gap-4 mt-2.5 text-xs text-slate-400">
                                            <span className="flex items-center gap-1">
                                                <MapPin className="w-3.5 h-3.5 text-slate-500" />
                                                {p.sector}
                                            </span>
                                            <span className="flex items-center gap-1 text-emerald-400 font-medium">
                                                S/ {(p.presupuesto_estimado_pen / 1000000).toFixed(2)}M
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Detalle ampliado del punto seleccionado */}
                    <div className="lg:col-span-7">
                        {selectedPunto ? (
                            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-6">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                                    <div>
                                        <span className="text-xs text-cyan-400 font-mono font-semibold">
                                            {selectedPunto.codigo_ficha_plan} • {selectedPunto.id}
                                        </span>
                                        <h3 className="text-xl font-bold text-white mt-1">
                                            {selectedPunto.denominacion}
                                        </h3>
                                        <p className="text-xs text-slate-400 mt-0.5">
                                            Sector: {selectedPunto.sector} • Cauce Receptor: {selectedPunto.cauce} • Altitud: {selectedPunto.altitud_msnm} msnm
                                        </p>
                                    </div>

                                    <button
                                        onClick={() => openIoarrModal(selectedPunto.id)}
                                        className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-emerald-600/20 transition-colors whitespace-nowrap"
                                    >
                                        <FileText className="w-4 h-4" />
                                        Expediente IOARR (Art. 27)
                                    </button>
                                </div>

                                {/* Coordenadas y Georreferenciación UTM */}
                                <div>
                                    <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-2">
                                        <Compass className="w-4 h-4 text-cyan-400" />
                                        Georreferenciación WGS84 (UTM Zona 17S)
                                    </h4>
                                    <div className="grid grid-cols-2 gap-3 bg-slate-950 p-3.5 rounded-xl border border-slate-800 font-mono text-xs">
                                        <div>
                                            <span className="text-slate-500 block text-[10px]">PUNTO INICIAL CAUCE:</span>
                                            <span className="text-slate-200">
                                                E: {selectedPunto.coordenadas_utm_17s.inicio.este.toFixed(2)} | N: {selectedPunto.coordenadas_utm_17s.inicio.norte.toFixed(2)}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-slate-500 block text-[10px]">PUNTO FINAL CAUCE:</span>
                                            <span className="text-slate-200">
                                                E: {selectedPunto.coordenadas_utm_17s.final.este.toFixed(2)} | N: {selectedPunto.coordenadas_utm_17s.final.norte.toFixed(2)}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Metrados de Ingeniería Hidráulica */}
                                <div>
                                    <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-2">
                                        <Activity className="w-4 h-4 text-cyan-400" />
                                        Metrados de Intervención Estructural
                                    </h4>
                                    <div className="grid grid-cols-3 gap-3">
                                        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-center">
                                            <span className="text-[10px] text-slate-400 block">Descolmatación</span>
                                            <div className="text-lg font-bold text-cyan-400 mt-1">
                                                {selectedPunto.metrados_obra.descolmatacion_cauce_km.toFixed(3)} km
                                            </div>
                                            <span className="text-[10px] text-slate-500">Limpieza mecanizada</span>
                                        </div>

                                        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-center">
                                            <span className="text-[10px] text-slate-400 block">Bordo / Dique</span>
                                            <div className="text-lg font-bold text-amber-400 mt-1">
                                                {selectedPunto.metrados_obra.dique_material_propio_km.toFixed(3)} km
                                            </div>
                                            <span className="text-[10px] text-slate-500">Material propio compactado</span>
                                        </div>

                                        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-center">
                                            <span className="text-[10px] text-slate-400 block">Enrocado Rip-Rap</span>
                                            <div className="text-lg font-bold text-emerald-400 mt-1">
                                                {selectedPunto.metrados_obra.enrocado_proteccion_km.toFixed(3)} km
                                            </div>
                                            <span className="text-[10px] text-slate-500">Piedra acomodada d50=0.8m</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Elementos Expuestos e Impacto Social */}
                                <div>
                                    <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-2">
                                        <Users className="w-4 h-4 text-cyan-400" />
                                        Elementos Expuestos y Vulnerabilidad Física
                                    </h4>
                                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3 text-xs">
                                        <div className="flex items-center justify-between border-b border-slate-900 pb-2">
                                            <span className="text-slate-400">Población Afectable Directa:</span>
                                            <span className="font-bold text-white">{selectedPunto.elementos_expuestos.poblacion_afectada} habitantes</span>
                                        </div>
                                        <div className="flex items-center justify-between border-b border-slate-900 pb-2">
                                            <span className="text-slate-400">Viviendas Expuestas:</span>
                                            <span className="font-bold text-white">{selectedPunto.elementos_expuestos.viviendas_expuestas} unidades</span>
                                        </div>
                                        <div className="flex items-center justify-between border-b border-slate-900 pb-2">
                                            <span className="text-slate-400">Material Predominante:</span>
                                            <span className="text-amber-400">{selectedPunto.elementos_expuestos.material_predominante}</span>
                                        </div>

                                        <div>
                                            <span className="text-slate-400 block mb-1">Infraestructura Pública en Riesgo:</span>
                                            <ul className="list-disc list-inside space-y-1 text-slate-300">
                                                {selectedPunto.elementos_expuestos.infraestructura_publica.map((infra, idx) => (
                                                    <li key={idx}>{infra}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                </div>

                                {/* Presupuesto y Financiamiento */}
                                <div className="flex items-center justify-between p-4 bg-cyan-950/20 border border-cyan-800/30 rounded-xl">
                                    <div>
                                        <span className="text-[10px] text-cyan-400 uppercase tracking-wider block font-semibold">
                                            Presupuesto Total Requerido
                                        </span>
                                        <div className="text-2xl font-black text-white mt-0.5">
                                            S/ {selectedPunto.presupuesto_estimado_pen.toLocaleString("es-PE", { minimumFractionDigits: 2 })}
                                        </div>
                                        <span className="text-xs text-slate-400">Plazo de ejecución: {selectedPunto.plazo_ejecucion_dias} días calendario</span>
                                    </div>

                                    <div className="text-right">
                                        <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Fuente Propuesta</span>
                                        <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded border border-emerald-500/20 inline-block mt-1">
                                            {selectedPunto.fuente_financiamiento_propuesta}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-12 text-center text-slate-500">
                                Seleccione un punto crítico para visualizar la ficha técnica completa.
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ========================================================================= */}
            {/* TAB 2: SIMULACIÓN HIDRÁULICA PISCO (Qpico & Tlag) */}
            {/* ========================================================================= */}
            {activeTab === "pisco" && (
                <div className="space-y-6">
                    {/* Panel de Control de Simulación Hidrometeorológica */}
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                            <div>
                                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                    <Sliders className="w-5 h-5 text-cyan-400" />
                                    Simulador de Escorrentía y Caudales Pico — Grilla PISCO / SENAMHI
                                </h3>
                                <p className="text-xs text-slate-400 mt-1">
                                    Ajuste los parámetros convectivos para proyectar el hidrograma en tiempo real en las microcuencas de Eduardo Villanueva.
                                </p>
                            </div>

                            <div className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-cyan-400">
                                Lluvia Total: {simulacion?.parametros_simulacion.precipitacion_acumulada_mm.toFixed(1)} mm
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                            <div>
                                <div className="flex justify-between text-xs mb-2">
                                    <span className="text-slate-400">Multiplicador de Lluvia:</span>
                                    <span className="text-cyan-400 font-bold">{lluviaMultiplicador.toFixed(1)}x</span>
                                </div>
                                <input
                                    type="range"
                                    min="0.5"
                                    max="3.0"
                                    step="0.1"
                                    value={lluviaMultiplicador}
                                    onChange={(e) => handleSliderChange(parseFloat(e.target.value), intensidadMmH, duracionHoras)}
                                    className="w-full accent-cyan-500 bg-slate-800 h-2 rounded-lg cursor-pointer"
                                />
                                <span className="text-[10px] text-slate-500 mt-1 block">Escenario de amplificación FEN</span>
                            </div>

                            <div>
                                <div className="flex justify-between text-xs mb-2">
                                    <span className="text-slate-400">Intensidad Tormenta Convectiva:</span>
                                    <span className="text-amber-400 font-bold">{intensidadMmH} mm/h</span>
                                </div>
                                <input
                                    type="range"
                                    min="15"
                                    max="80"
                                    step="5"
                                    value={intensidadMmH}
                                    onChange={(e) => handleSliderChange(lluviaMultiplicador, parseFloat(e.target.value), duracionHoras)}
                                    className="w-full accent-amber-500 bg-slate-800 h-2 rounded-lg cursor-pointer"
                                />
                                <span className="text-[10px] text-slate-500 mt-1 block">Ráfagas orográficas en cabecera</span>
                            </div>

                            <div>
                                <div className="flex justify-between text-xs mb-2">
                                    <span className="text-slate-400">Duración del Evento:</span>
                                    <span className="text-emerald-400 font-bold">{duracionHoras} horas</span>
                                </div>
                                <input
                                    type="range"
                                    min="1"
                                    max="6"
                                    step="0.5"
                                    value={duracionHoras}
                                    onChange={(e) => handleSliderChange(lluviaMultiplicador, intensidadMmH, parseFloat(e.target.value))}
                                    className="w-full accent-emerald-500 bg-slate-800 h-2 rounded-lg cursor-pointer"
                                />
                                <span className="text-[10px] text-slate-500 mt-1 block">Persistencia de lluvia estacional</span>
                            </div>
                        </div>
                    </div>

                    {/* Resumen de Alerta Distrital */}
                    {simulacion && (
                        <div className={`p-4 rounded-xl border flex items-center gap-3 ${
                            simulacion.resumen_alerta_distrital.includes("ROJA")
                                ? "bg-rose-500/10 border-rose-500/30 text-rose-300"
                                : "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                        }`}>
                            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                            <div className="text-xs font-semibold">
                                {simulacion.resumen_alerta_distrital}
                            </div>
                        </div>
                    )}

                    {/* Celdas PISCO Simuladas */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {simulacion?.celdas_pisco.map((c) => (
                            <div key={c.celda_id} className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 text-cyan-400 border border-slate-800">
                                        {c.celda_id}
                                    </span>
                                    <span
                                        className="text-[10px] font-bold px-2 py-0.5 rounded"
                                        style={{ backgroundColor: `${c.color_alerta}20`, color: c.color_alerta }}
                                    >
                                        {c.nivel_alerta.split(" ")[0]}
                                    </span>
                                </div>

                                <div>
                                    <h4 className="text-sm font-bold text-white">{c.nombre}</h4>
                                    <span className="text-[11px] text-slate-400">Área de Cuenca: {c.area_drenaje_km2} km²</span>
                                </div>

                                <div className="space-y-2 pt-2 border-t border-slate-800 text-xs font-mono">
                                    <div className="flex justify-between">
                                        <span className="text-slate-400 font-sans">Lluvia Efectiva (Peff):</span>
                                        <span className="text-cyan-400 font-bold">{c.precipitacion_efectiva_mm} mm</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-400 font-sans">Caudal Pico (Qpico):</span>
                                        <span className="text-amber-400 font-bold">{c.caudal_pico_estimado_m3_s} m³/s</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-400 font-sans">Tiempo Retardo (Tlag):</span>
                                        <span className="text-indigo-300 font-bold">{c.tiempo_retardo_tlag_h} h</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-400 font-sans">Alerta Temprana SAT:</span>
                                        <span className="text-emerald-400 font-bold">{c.tiempo_anticipacion_alerta_h} h anticipación</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ========================================================================= */}
            {/* TAB 3: AUDITORÍA FORENSE PP 0068 & FONDES */}
            {/* ========================================================================= */}
            {activeTab === "auditoria" && (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        {/* Diagnóstico Forense */}
                        <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                <Scale className="w-5 h-5 text-amber-400" />
                                Diagnóstico Forense del Gasto en PP 0068 (2015-2024)
                            </h3>

                            <div className="bg-rose-500/10 border border-rose-500/30 p-4 rounded-xl space-y-2">
                                <div className="flex items-center gap-2 text-rose-400 text-xs font-bold">
                                    <AlertTriangle className="w-4 h-4" />
                                    EL ANTECEDENTE DEL COLAPSO EN 2019 (0% DE EJECUCIÓN)
                                </div>
                                <p className="text-xs text-rose-200/80 leading-relaxed">
                                    En 2019 (primer año de la gestión municipal anterior), la municipalidad ejecutó **S/ 0.00** en el Programa Presupuestal 0068.
                                    Este antecedente confirma el riesgo inminente de **parálisis en los primeros 100 días del 2027** si no se implementa el Dossier Cero Días antes del 31-Dic-2026.
                                </p>
                            </div>

                            <div className="space-y-3 text-xs">
                                <div className="flex justify-between p-3 bg-slate-950 rounded-lg border border-slate-800">
                                    <span className="text-slate-400">Presupuesto Inicial de Apertura (PIA Promedio):</span>
                                    <span className="font-bold text-amber-400">S/ 1,000.00 / año</span>
                                </div>

                                <div className="flex justify-between p-3 bg-slate-950 rounded-lg border border-slate-800">
                                    <span className="text-slate-400">Concentración en Gasto Reactivo (Acciones Comunes):</span>
                                    <span className="font-bold text-rose-400">82.4% del presupuesto</span>
                                </div>

                                <div className="flex justify-between p-3 bg-slate-950 rounded-lg border border-slate-800">
                                    <span className="text-slate-400">Inversión en Protección Física de Cauces (10 años):</span>
                                    <span className="font-bold text-slate-300">S/ 18,192.00 (0.23% del total)</span>
                                </div>
                            </div>
                        </div>

                        {/* Brecha Financiera FONDES */}
                        <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                <Zap className="w-5 h-5 text-emerald-400" />
                                Brecha Estructural vs. Cartera FONDES
                            </h3>

                            <div className="space-y-3">
                                <div>
                                    <div className="flex justify-between text-xs mb-1.5">
                                        <span className="text-slate-400">Inversión Requerida (9 Defensas Ribereñas):</span>
                                        <span className="font-bold text-emerald-400">S/ 25,870,000.00</span>
                                    </div>
                                    <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden border border-slate-800">
                                        <div className="bg-emerald-500 h-full w-[0.2%]" />
                                    </div>
                                </div>

                                <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2 text-xs">
                                    <div className="flex justify-between">
                                        <span className="text-slate-400">Presupuesto PP 0068 Disponible (2024):</span>
                                        <span className="font-bold text-slate-200">S/ 52,301.00</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-400">Brecha Financiera No Cubierta:</span>
                                        <span className="font-bold text-rose-400">S/ 25,817,699.00</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-400">Ratio de Cobertura con Recursos Propios:</span>
                                        <span className="font-bold text-amber-400">0.20% (Insuficiente)</span>
                                    </div>
                                </div>

                                <div className="p-4 bg-emerald-950/20 border border-emerald-800/30 rounded-xl">
                                    <span className="text-xs font-bold text-emerald-400 block mb-1">
                                        Estrategia de Salvaguarda FONDES (Ley 30458)
                                    </span>
                                    <p className="text-xs text-slate-300 leading-relaxed">
                                        La municipalidad debe tramitar los 9 proyectos mediante fichas **IOARR de Emergencia** ante el Ministerio de Vivienda y FONDES
                                        bajo el amparo del **Art. 27 de la Ley 30225**, cerrando la dependencia del presupuesto ordinario municipal.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ========================================================================= */}
            {/* TAB 4: DOSSIER CERO DÍAS (SHA-256) */}
            {/* ========================================================================= */}
            {activeTab === "dossier" && (
                <div className="max-w-4xl mx-auto space-y-6">
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 space-y-6">
                        <div className="flex items-start justify-between gap-4 border-b border-slate-800 pb-6">
                            <div>
                                <div className="flex items-center gap-2">
                                    <Lock className="w-5 h-5 text-amber-400" />
                                    <span className="text-xs font-mono text-amber-400 font-bold uppercase tracking-wider">
                                        SALVAGUARDA DE CONTINUIDAD OPERATIVA
                                    </span>
                                </div>
                                <h3 className="text-xl font-bold text-white mt-1">
                                    Dossier Cero Días • Acta de Transferencia Técnico-Legal
                                </h3>
                                <p className="text-xs text-slate-400 mt-1">
                                    Instrumento criptográfico para blindar a Eduardo Villanueva del vacío de los 100 días en la transición del 31-Dic-2026.
                                </p>
                            </div>

                            <div className="px-3.5 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
                                OPONIBLE ANTE CONTRALORÍA
                            </div>
                        </div>

                        {/* Contenido del Acta */}
                        {dossier && (
                            <div className="space-y-4 text-xs">
                                <div className="grid grid-cols-2 gap-4 p-4 bg-slate-950 rounded-xl border border-slate-800">
                                    <div>
                                        <span className="text-slate-500 block text-[10px]">AUTORIDAD SALIENTE:</span>
                                        <span className="font-bold text-white">{dossier.autoridad_saliente}</span>
                                    </div>
                                    <div>
                                        <span className="text-slate-500 block text-[10px]">FECHA CIERRE DE MANDATO:</span>
                                        <span className="font-bold text-amber-400">{dossier.fecha_cierre_mandato}</span>
                                    </div>
                                    <div className="col-span-2">
                                        <span className="text-slate-500 block text-[10px]">RECEPTOR DE LA NOTIFICACIÓN:</span>
                                        <span className="font-semibold text-slate-300">{dossier.autoridad_entrante_cargo}</span>
                                    </div>
                                </div>

                                <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-200/90 leading-relaxed font-serif">
                                    &ldquo;{dossier.notificacion_vinculante}&rdquo;
                                </div>

                                <div>
                                    <h4 className="font-bold text-slate-300 uppercase tracking-wider mb-2">
                                        Marco Jurídico de Responsabilidad Indelegable:
                                    </h4>
                                    <ul className="list-disc list-inside space-y-1 text-slate-400">
                                        {dossier.marco_juridico_responsabilidad.map((marco, idx) => (
                                            <li key={idx}>{marco}</li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Sello Criptográfico SHA-256 */}
                                <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
                                            FIRMA HASH CRIPTOGRÁFICA SHA-256 (INMUTABLE)
                                        </span>
                                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                    </div>
                                    <div className="font-mono text-xs text-cyan-400 break-all bg-slate-900 p-2.5 rounded border border-slate-800">
                                        {dossier.sello_criptografico_sha256}
                                    </div>
                                    <span className="text-[10px] text-slate-500 block">
                                        Certificado emitido: {new Date(dossier.timestamp_certificacion).toLocaleString()}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ========================================================================= */}
            {/* MODAL EXPEDIENTE IOARR FONDES */}
            {/* ========================================================================= */}
            {ioarrModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                            <h3 className="text-base font-bold text-white flex items-center gap-2">
                                <FileText className="w-5 h-5 text-emerald-400" />
                                Expediente Técnico IOARR de Emergencia (Art. 27 Ley 30225)
                            </h3>
                            <button
                                onClick={() => setIoarrModalOpen(false)}
                                className="text-slate-400 hover:text-white text-xs font-bold px-2 py-1"
                            >
                                ✕
                            </button>
                        </div>

                        {loadingIoarr ? (
                            <div className="py-12 text-center text-slate-400">Generando expediente técnico con firma digital...</div>
                        ) : ioarrData ? (
                            <div className="space-y-4 text-xs">
                                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                                    <span className="text-slate-400 block text-[10px]">PROYECTO:</span>
                                    <span className="font-bold text-white text-sm">{ioarrData.denominacion}</span>
                                    <span className="text-slate-500 block mt-1">Código: {ioarrData.codigo_intervencion} • Plazo: {ioarrData.plazo_ejecucion_dias} días</span>
                                </div>

                                <div>
                                    <h4 className="font-semibold text-slate-300 mb-2">Desglose de Partidas Principales (BOQ):</h4>
                                    <div className="space-y-1.5">
                                        {ioarrData.componentes_tecnicos_boq?.map((item: any, idx: number) => (
                                            <div key={idx} className="flex justify-between p-2.5 bg-slate-950 rounded-lg border border-slate-800">
                                                <div>
                                                    <span className="text-cyan-400 font-mono font-bold mr-2">{item.partida}</span>
                                                    <span className="text-slate-300">{item.descripcion}</span>
                                                    <span className="text-slate-500 block text-[10px] mt-0.5">Metrado: {item.metrado} {item.unidad}</span>
                                                </div>
                                                <span className="font-bold text-emerald-400 whitespace-nowrap">
                                                    S/ {item.costo_estimado_pen.toLocaleString()}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex justify-between items-center p-3 bg-emerald-950/20 border border-emerald-800/30 rounded-xl">
                                    <span className="font-bold text-white">Presupuesto Total de Intervención:</span>
                                    <span className="text-lg font-black text-emerald-400">
                                        S/ {ioarrData.costo_total_obra_pen?.toLocaleString()}
                                    </span>
                                </div>

                                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                                    <span className="text-[10px] font-mono text-slate-500 block uppercase">Sello Digital SHA-256:</span>
                                    <span className="font-mono text-[11px] text-cyan-400 break-all">{ioarrData.sello_criptografico_sha256}</span>
                                </div>
                            </div>
                        ) : null}

                        <div className="pt-3 border-t border-slate-800 flex justify-end">
                            <button
                                onClick={() => setIoarrModalOpen(false)}
                                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold"
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
