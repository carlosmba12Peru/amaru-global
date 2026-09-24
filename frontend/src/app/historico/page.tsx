"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
    Search,
    Building2,
    Calendar,
    AlertTriangle,
    ShieldAlert,
    GraduationCap,
    HeartPulse,
    Waves,
    BookOpen,
    Printer,
    MapPin,
    Users,
    Activity,
    ExternalLink,
    ChevronRight,
    Sparkles,
    FileText,
    CheckCircle2,
    Clock,
    Layers,
    Compass,
    Phone,
    Mail,
    Sprout,
    Coins,
    FileSpreadsheet,
    TrendingUp,
    Gauge,
    Radio,
    Eye,
    Zap,
    CloudRain,
    Wind,
    Thermometer,
    Flame,
    RefreshCw,
    AlertOctagon,
    ArrowUpRight,
    HelpCircle,
    Truck,
    Navigation
} from "lucide-react";

import DossierExportModal from "@/components/DossierExportModal";
import HistoricalFailureNodesPanel from "@/components/HistoricalFailureNodesPanel";
import HistoricalInfrastructureMap from "@/components/HistoricalInfrastructureMap";

interface ImpactoEducativo {
    colegios_afectados: number;
    colegios_inhabitables: number;
    semanas_perdidas: number;
    albergues: string[];
    observacion: string;
}

interface ImpactoSanitario {
    brotes: string[];
    casos: number;
    postas_afectadas: string;
}

interface ImpactoAgropecuarioMinag {
    valle_oficial: string;
    1983?: {
        perdida_ha: number;
        afectada_ha: number;
        cultivo_critico?: string;
        bocatomas_danadas?: number;
    };
    1998: {
        perdida_ha: number;
        afectada_ha: number;
        familias_campesinas: number;
        presupuesto_soles: number;
        infraestructura: string;
    };
    2017?: {
        perdida_ha: number;
        afectada_ha: number;
        cultivo_critico?: string;
    };
    cultivos_principales: string[];
    vulnerabilidad_fisiologica: string;
    infraestructura_riego: string[];
}

interface MemoriaDistrital {
    ubigeo: string;
    distrito: string;
    provincia: string;
    departamento: string;
    lat: number;
    lng: number;
    poblacion: number;
    nivel_riesgo_cenepred: string;
    declarado_ds124: boolean;
    cuenca_principal: string;
    nivel_exposicion_historica: string;
    resumen_historico: string;
    eventos_historicos: string[];
    impacto_educativo: {
        "1983": ImpactoEducativo;
        "1998": ImpactoEducativo;
        "2017": ImpactoEducativo;
    };
    impacto_sanitario_epidemiologico: {
        "1983": ImpactoSanitario;
        "1998": ImpactoSanitario;
        "2017": ImpactoSanitario;
        vector_predominante: string;
        semanas_criticas_epidemicas: string;
    };
    impacto_agropecuario_minag?: ImpactoAgropecuarioMinag;
    impacto_fisico_hidrologico: {
        puntos_criticos: string[];
        quebradas_criticas_asociadas: string[];
        vias_aislamiento: string[];
        dias_aislamiento_promedio: number;
        hectareas_agricolas_perdidas: number;
        patron_hidrologico: string;
    };
    danos_oficiales_indeci_2017?: {
        departamento: string;
        fuente: string;
        damnificados_departamentales_validados?: number;
        afectados_departamentales_validados?: number;
        fallecidos_departamentales?: number;
        viviendas_colapsadas_inhabitables_departamentales?: number;
        carreteras_destruidas_afectadas_km?: number;
        hectareas_agricolas_perdidas_departamentales?: number;
        albergues_oficiales_instalados?: number;
        carpas_albergues?: number;
        poblacion_albergada?: number;
        decreto_supremo_declaratoria?: string;
        provincias_afectadas?: number;
        distritos_afectados?: number;
        carreteras_destruidas_km?: number;
        hectareas_agricolas_perdidas?: number;
        vulnerabilidad_eje?: string;
    };
    analisis_geologico_ingemmet_2017?: string;
    fuentes_oficiales_cruzadas?: string[];
    lecciones_aprendidas_caf_indeci: {
        sintesis_lecciones: string;
        fuentes_validadas: string[];
    };
    contacto_defensa_civil?: {
        funcionario: string;
        telefono: string;
        correo: string;
        alcalde?: string;
        direccion_municipal?: string;
        sede_coed?: string;
        fuente?: string;
    };
    autoridad_municipal_inei?: {
        ubigeo: string;
        departamento: string;
        provincia: string;
        distrito: string;
        tipo_municipalidad: string;
        alcalde: string;
        direccion: string;
        telefono: string;
        correo: string;
        web?: string;
        fuente: string;
        fecha_corte: string;
    };
    etnoterritorial?: {
        variante_linguistica: string;
        lengua_nombre: string;
        es_bilingue_requerido: boolean;
        regimen_difusion: string;
    };
    comisarias_pnp?: {
        cod_cpnp: string;
        cod_uni: string;
        nombre: string;
        tipo_comisaria: string;
        sectores_patrullaje_cuadrante: number;
        region_policial: string;
        departamento: string;
        provincia: string;
        distrito: string;
        rol_en_contingencia?: string;
    }[];
    albergues_temporales_indeci?: {
        codigo_local: string;
        codigo_modular: string;
        nombre_ie: string;
        nivel_modalidad: string;
        gestion: string;
        direccion: string;
        centro_poblado?: string;
        latitud?: number;
        longitud?: number;
        altitud?: number;
        cod_ugel?: string;
    }[];
    centros_educativos?: {
        total_servicios_educativos: number;
        total_publicas: number;
        total_privadas: number;
        total_albergues_potenciales: number;
        albergues_recomendados?: any[];
    };
}

// Interfaces del Motor Predictivo de Análogos y Radar FEN
interface DiaHorizonteAnalog {
    dia_numero: number;
    fecha: string;
    dia_semana: string;
    horas_anticipacion: number;
    temperatura_max: number;
    temperatura_min: number;
    lluvia_proyectada_openmeteo_mm: number;
    factor_amplificacion_fen: number;
    lluvia_extrema_estimada_mm: number;
    similitud_analoga_pct: number;
    evento_analogo_referencia: string;
    nivel_alerta_anticipada: string;
    condicion_viento_alisio: string;
}

interface InfraestructuraAmenazada {
    tipo: string;
    nombre?: string;
    tramo?: string;
    riesgo_historico?: string;
    impacto?: string;
    patron_dano?: string;
}

interface AcoplamientoBipolar {
    regla_activa: string;
    descripcion: string;
    zonas_alerta_inversa?: string[];
    accion_preventiva_recomendada?: string;
}

interface AnalogMatchResult {
    ubigeo: string;
    distrito: string;
    provincia: string;
    departamento: string;
    cuenca_id: string;
    cuenca_nombre: string;
    region_macro: string;
    poblacion_expuesta: number;
    dia_maximo_riesgo: DiaHorizonteAnalog;
    horizonte_7_dias: DiaHorizonteAnalog[];
    infraestructura_amenazada_caf: InfraestructuraAmenazada[];
    acoplamiento_bipolar: AcoplamientoBipolar;
    oportunidades_territoriales_fen: { oportunidad: string; detalle: string }[];
    fuentes_validadas: string[];
}

interface CuencaRadarItem {
    cuenca_id: string;
    cuenca_nombre: string;
    region_macro: string;
    distrito_centinela: string;
    ubigeo: string;
    dia_critico_numero: number;
    horas_anticipacion: number;
    similitud_analoga_pct: number;
    evento_referencia: string;
    factor_amplificacion: number;
    lluvia_proyectada_mm: number;
    lluvia_extrema_amplificada_mm: number;
    nivel_alerta: string;
    puentes_en_riesgo_caf: number;
}

interface RadarNacionalResult {
    radar_nacional_version: string;
    total_cuencas_vigiladas: number;
    resumen_semaforo: {
        cuencas_alerta_roja: number;
        cuencas_alerta_naranja: number;
        cuencas_alerta_amarilla: number;
        cuencas_alerta_verde: number;
    };
    cuencas: CuencaRadarItem[];
    generado_el: string;
}

const DISTRITOS_RAPIDOS = [
    { ubigeo: "200105", nombre: "Catacaos", depto: "Piura", icono: "🌊" },
    { ubigeo: "200104", nombre: "Castilla", depto: "Piura", icono: "💧" },
    { ubigeo: "200101", nombre: "Piura", depto: "Piura", icono: "🏛️" },
    { ubigeo: "200114", nombre: "Tambogrande", depto: "Piura", icono: "🥭" },
    { ubigeo: "140304", nombre: "Íllimo", depto: "Lambayeque", icono: "🌾" },
    { ubigeo: "150118", nombre: "Chosica (Lurigancho)", depto: "Lima", icono: "⛰️" },
    { ubigeo: "130102", nombre: "El Porvenir", depto: "La Libertad", icono: "⚠️" },
    { ubigeo: "240101", nombre: "Tumbes", depto: "Tumbes", icono: "🌴" },
    { ubigeo: "021101", nombre: "Huarmey", depto: "Áncash", icono: "🚧" },
    { ubigeo: "210501", nombre: "Ilave (Altiplano)", depto: "Puno", icono: "❄️" }
];

export default function HistoricoConsolePage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [currentUbigeo, setCurrentUbigeo] = useState("200105"); // Default: Catacaos
    const [memoria, setMemoria] = useState<MemoriaDistrital | null>(null);
    const [analogData, setAnalogData] = useState<AnalogMatchResult | null>(null);
    const [radarData, setRadarData] = useState<RadarNacionalResult | null>(null);
    const [masterCatalog, setMasterCatalog] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);
    const [loadingAnalog, setLoadingAnalog] = useState(false);
    const [loadingRadar, setLoadingRadar] = useState(false);
    const [radarFilter, setRadarFilter] = useState<string>("TODAS");
    const [activeTab, setActiveTab] = useState<
        "general" | "infraestructura" | "educacion" | "salud" | "hidrologia" | "agropecuario" | "lecciones" | "predictor" | "radar" | "bivalente"
    >("general");
    const [selectedYear, setSelectedYear] = useState<"1983" | "1998" | "2017">("2017");
    const [showDossierModal, setShowDossierModal] = useState(false);

    const searchTimeout = useRef<NodeJS.Timeout | null>(null);

    const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

    // Cargar distrito activo y su evaluación análoga Open-Meteo Pro a 7 días en paralelo desacoplado
    useEffect(() => {
        async function fetchDistritoData(ubg: string) {
            setLoading(true);
            setLoadingAnalog(true);

            // 1. Cargar Memoria Histórica Territorial (ultra rápido, se renderiza de inmediato en milisegundos)
            fetch(`${API_BASE}/api/historico/distrito/${ubg}`)
                .then(res => res.ok ? res.json() : null)
                .then(data => {
                    if (data) setMemoria(data);
                })
                .catch(err => console.error("Error al cargar memoria histórica:", err))
                .finally(() => setLoading(false));

            // 2. Cargar Evaluación Análoga Meteorológica a 7 días en segundo plano (Open-Meteo Pro)
            fetch(`${API_BASE}/api/historico/analog-match/${ubg}`)
                .then(res => res.ok ? res.json() : null)
                .then(aData => {
                    setAnalogData(aData);
                })
                .catch(err => {
                    console.error("Error al cargar análogo:", err);
                    setAnalogData(null);
                })
                .finally(() => setLoadingAnalog(false));
        }
        fetchDistritoData(currentUbigeo);
    }, [currentUbigeo]);

    // Cargar radar nacional de 17 cuencas y catálogo maestro
    useEffect(() => {
        async function fetchGlobalData() {
            setLoadingRadar(true);
            try {
                const [resRadar, resCat] = await Promise.allSettled([
                    fetch(`${API_BASE}/api/historico/radar-nacional-analogos`),
                    fetch(`${API_BASE}/api/historico/catalogo-maestro`)
                ]);

                if (resRadar.status === "fulfilled" && resRadar.value.ok) {
                    const rData = await resRadar.value.json();
                    setRadarData(rData);
                }
                if (resCat.status === "fulfilled" && resCat.value.ok) {
                    const cData = await resCat.value.json();
                    setMasterCatalog(cData);
                }
            } catch (err) {
                console.error("Error al cargar radar o catálogo maestro:", err);
            } finally {
                setLoadingRadar(false);
            }
        }
        fetchGlobalData();
    }, []);

    // Búsqueda autocompletada
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setSearchQuery(val);
        if (searchTimeout.current) clearTimeout(searchTimeout.current);

        if (val.trim().length >= 2) {
            setIsSearching(true);
            searchTimeout.current = setTimeout(async () => {
                try {
                    const res = await fetch(`${API_BASE}/api/data/districts/search?q=${encodeURIComponent(val)}&limit=8`);
                    if (res.ok) {
                        const results = await res.json();
                        setSearchResults(results);
                    }
                } catch (err) {
                    console.error("Error en búsqueda:", err);
                } finally {
                    setIsSearching(false);
                }
            }, 250);
        } else {
            setSearchResults([]);
            setIsSearching(false);
        }
    };

    const handleSelectDistrito = (ubg: string) => {
        setCurrentUbigeo(ubg);
        setSearchQuery("");
        setSearchResults([]);
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="min-h-screen text-slate-100 pb-16">
            {/* Header / Hero de la Consola Histórica */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 mb-6 backdrop-blur shadow-xl">
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                    <div className="flex items-center gap-3.5">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 via-orange-600 to-red-700 flex items-center justify-center text-2xl shadow-lg shadow-orange-600/30 border border-amber-400/30">
                            🏛️
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-xl font-black tracking-tight text-white">
                                    Consola de Memoria Histórica Municipal de Desastres
                                </h1>
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                                    COEN • 1,891 DISTRITOS
                                </span>
                            </div>
                            <p className="text-xs text-slate-400 mt-0.5">
                                Inteligencia territorial retrospectiva basada en las memorias oficiales de la{" "}
                                <strong className="text-slate-300">CAF</strong>, <strong className="text-slate-300">INDECI</strong>,{" "}
                                <strong className="text-emerald-400 font-semibold">MINAG-OIA</strong>,{" "}
                                <strong className="text-slate-300">OPS/OMS</strong> y <strong className="text-slate-300">MINEDU</strong> (FEN 1982-1983, 1997-1998 y 2017).
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto justify-end">
                        <button
                            id="btn-export-dossier-pdf"
                            onClick={() => setShowDossierModal(true)}
                            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 border border-red-500/50 text-xs font-bold text-white transition shadow-md shadow-red-900/30 hover:scale-[1.02]"
                        >
                            <FileText className="w-4 h-4 text-red-200" />
                            <span>📄 Exportar Dossier PDF (Fase 4)</span>
                        </button>
                        <button
                            id="btn-print-dossier"
                            onClick={handlePrint}
                            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 hover:text-white transition shadow-sm"
                        >
                            <Printer className="w-4 h-4 text-amber-400" />
                            <span>Imprimir Ficha</span>
                        </button>
                        <Link
                            href={`/dashboard/${currentUbigeo}`}
                            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-blue-600/30 hover:bg-blue-600/50 border border-blue-500/40 text-xs font-semibold text-blue-300 hover:text-white transition shadow-sm"
                        >
                            <Activity className="w-4 h-4 text-blue-400" />
                            <span>Ver Telemetría</span>
                        </Link>
                    </div>
                </div>

                {/* Buscador de Distritos y Ubigeos */}
                <div className="mt-4 relative">
                    <div className="relative">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                            id="input-historico-search"
                            type="text"
                            value={searchQuery}
                            onChange={handleSearchChange}
                            placeholder="Buscar municipio por UBIGEO, nombre de distrito, provincia o departamento (ej. 200105, Catacaos, Chosica, Íllimo)..."
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-950/90 border border-slate-700 focus:border-amber-500 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none transition shadow-inner"
                        />
                        {isSearching && (
                            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-amber-400 font-mono animate-pulse">
                                Buscando...
                            </span>
                        )}
                    </div>

                    {/* Desplegable de Resultados de Búsqueda */}
                    {searchResults.length > 0 && (
                        <div className="absolute left-0 right-0 top-full mt-2 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden divide-y divide-slate-800 max-h-80 overflow-y-auto">
                            {searchResults.map((d) => (
                                <button
                                    key={d.ubigeo}
                                    onClick={() => handleSelectDistrito(d.ubigeo)}
                                    className="w-full text-left px-4 py-3 hover:bg-slate-800/80 flex items-center justify-between transition group"
                                >
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-sm text-white group-hover:text-amber-300 transition">
                                                {d.distrito}
                                            </span>
                                            <span className="font-mono text-xs px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                                                UBIGEO {d.ubigeo}
                                            </span>
                                            {d.declarado_ds124 && (
                                                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-red-500/20 text-red-400 border border-red-500/30">
                                                    D.S. 124
                                                </span>
                                            )}
                                        </div>
                                        <div className="text-xs text-slate-400 mt-0.5">
                                            {d.provincia}, {d.departamento} • Riesgo SIGRID: {d.peligro_cenepred}
                                        </div>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 transition transform group-hover:translate-x-1" />
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Chips de Distritos Emblemáticos FEN */}
                    <div className="flex items-center gap-2 mt-3 flex-wrap">
                        <span className="text-xs font-semibold text-slate-400 mr-1 flex items-center gap-1">
                            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                            Casos Emblemáticos FEN:
                        </span>
                        {DISTRITOS_RAPIDOS.map((d) => (
                            <button
                                key={d.ubigeo}
                                onClick={() => handleSelectDistrito(d.ubigeo)}
                                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition border ${
                                    currentUbigeo === d.ubigeo
                                        ? "bg-amber-500/20 text-amber-300 border-amber-500/60 font-bold shadow-sm"
                                        : "bg-slate-950 text-slate-400 hover:text-slate-200 border-slate-800 hover:border-slate-700"
                                }`}
                            >
                                <span>{d.icono}</span>
                                <span>{d.nombre}</span>
                                <span className="text-[10px] opacity-60">({d.depto})</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="p-16 text-center bg-slate-900/50 border border-slate-800 rounded-2xl">
                    <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <h3 className="font-bold text-slate-200">Cargando Memoria Histórica Territorial...</h3>
                    <p className="text-xs text-slate-500 mt-1 font-mono">Indexando compendios CAF, INDECI, MINAG-OIA, OPS/OMS y MINEDU</p>
                </div>
            ) : memoria ? (
                <div className="space-y-6">
                    {/* [ESCUDO C2] Nodos de Falla Histórica (1983-2023), Anti-Fake News y Fichas de Ingeniería Pre-Impacto */}
                    <HistoricalFailureNodesPanel ubigeoSeleccionado={currentUbigeo} />

                    {/* Tarjeta de Identidad Territorial del Municipio */}
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

                        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                            <div>
                                <div className="flex items-center gap-2.5 flex-wrap">
                                    <span className="font-mono text-xs px-2.5 py-1 rounded-md bg-amber-500/20 text-amber-300 font-black border border-amber-500/40">
                                        UBIGEO: {memoria.ubigeo}
                                    </span>
                                    <h2 className="text-2xl font-black text-white tracking-wide">
                                        Municipalidad Distrital de {memoria.distrito}
                                    </h2>
                                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                                        {memoria.provincia}, {memoria.departamento}
                                    </span>
                                </div>
                                <p className="text-sm text-slate-300 mt-2 max-w-4xl leading-relaxed">
                                    {memoria.resumen_historico}
                                </p>
                            </div>

                            <div className="flex flex-wrap lg:flex-nowrap gap-3 w-full lg:w-auto">
                                <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 flex-1 lg:flex-initial min-w-[140px]">
                                    <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold block">
                                        Cuenca Principal
                                    </span>
                                    <span className="text-xs font-bold text-sky-400 block mt-0.5 truncate">
                                        {memoria.cuenca_principal}
                                    </span>
                                </div>
                                <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 flex-1 lg:flex-initial min-w-[140px]">
                                    <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold block">
                                        Peligro CENEPRED
                                    </span>
                                    <span
                                        className={`text-xs font-bold block mt-0.5 ${
                                            memoria.nivel_riesgo_cenepred.toUpperCase().includes("MUY ALTO")
                                                ? "text-red-400"
                                                : "text-amber-400"
                                        }`}
                                    >
                                        {memoria.nivel_riesgo_cenepred}
                                    </span>
                                </div>
                                <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 flex-1 lg:flex-initial min-w-[140px]">
                                    <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold block">
                                        Amparo D.S. 124
                                    </span>
                                    <span
                                        className={`text-xs font-bold block mt-0.5 ${
                                            memoria.declarado_ds124 ? "text-emerald-400" : "text-slate-400"
                                        }`}
                                    >
                                        {memoria.declarado_ds124 ? "DECLARADO EN EMERGENCIA" : "MONITOREO REGULAR"}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Comando Político-Operativo Local y Plataforma de Defensa Civil (INEI 2026 / Ley 29664) */}
                        {(memoria.contacto_defensa_civil || memoria.autoridad_municipal_inei) && (
                            <div className="mt-4 pt-4 border-t border-slate-800/80 space-y-2">
                                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs">
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                                        {(memoria.autoridad_municipal_inei?.alcalde || memoria.contacto_defensa_civil?.alcalde) && (
                                            <div className="flex items-center gap-2">
                                                <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shrink-0">
                                                    <Building2 className="w-4 h-4 text-emerald-400" />
                                                </div>
                                                <div>
                                                    <div className="text-[10px] text-emerald-400 font-bold tracking-wider uppercase">
                                                        Alcalde Titular • Presidente GT-GRD
                                                    </div>
                                                    <div className="text-white font-black text-xs">
                                                        {memoria.autoridad_municipal_inei?.alcalde || memoria.contacto_defensa_civil?.alcalde}
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {(memoria.autoridad_municipal_inei?.direccion || memoria.contacto_defensa_civil?.sede_coed) && (
                                            <div className="hidden lg:flex items-center gap-2 border-l border-slate-800 pl-3">
                                                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                                <div>
                                                    <div className="text-[10px] text-slate-400 font-medium">Sede COED / Palacio</div>
                                                    <div className="text-slate-200 text-xs font-semibold truncate max-w-[220px]">
                                                        {memoria.autoridad_municipal_inei?.direccion || memoria.contacto_defensa_civil?.sede_coed}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex flex-wrap items-center gap-3">
                                        {(memoria.autoridad_municipal_inei?.telefono || memoria.contacto_defensa_civil?.telefono) && (
                                            <a
                                                href={`tel:${(memoria.autoridad_municipal_inei?.telefono || memoria.contacto_defensa_civil?.telefono || "").split("/")[0].trim()}`}
                                                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 font-bold hover:bg-emerald-500/20 transition text-[11px]"
                                            >
                                                <Phone className="w-3 h-3 text-emerald-400" />
                                                <span>{memoria.autoridad_municipal_inei?.telefono || memoria.contacto_defensa_civil?.telefono}</span>
                                            </a>
                                        )}
                                        {(memoria.autoridad_municipal_inei?.correo || memoria.contacto_defensa_civil?.correo) && (
                                            <a
                                                href={`mailto:${memoria.autoridad_municipal_inei?.correo || memoria.contacto_defensa_civil?.correo}`}
                                                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-300 font-medium hover:bg-sky-500/20 transition text-[11px]"
                                            >
                                                <Mail className="w-3 h-3 text-sky-400" />
                                                <span className="truncate max-w-[180px]">{memoria.autoridad_municipal_inei?.correo || memoria.contacto_defensa_civil?.correo}</span>
                                            </a>
                                        )}
                                        <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 font-semibold uppercase">
                                            INEI 2026
                                        </span>
                                    </div>
                                </div>

                                {memoria.etnoterritorial && (
                                    <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                                        <span className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                                            <Activity className="w-3.5 h-3.5 text-indigo-400" />
                                            <strong>Protocolo Lingüístico:</strong> {memoria.etnoterritorial.variante_linguistica}
                                        </span>
                                        <span className="text-[11px] px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 font-semibold">
                                            Régimen {memoria.etnoterritorial.regimen_difusion} ({memoria.etnoterritorial.lengua_nombre})
                                        </span>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Tarjeta Hero de Alerta Predictiva Análoga Open-Meteo Pro a 7 Días */}
                    {analogData && (
                        <div
                            className={`rounded-2xl p-5 border backdrop-blur-md shadow-2xl relative overflow-hidden transition-all duration-300 ${
                                analogData.dia_maximo_riesgo.nivel_alerta_anticipada === "ROJA"
                                    ? "bg-gradient-to-br from-red-950/50 via-slate-900 to-slate-950 border-red-500/50 shadow-red-950/30"
                                    : analogData.dia_maximo_riesgo.nivel_alerta_anticipada === "NARANJA"
                                    ? "bg-gradient-to-br from-orange-950/50 via-slate-900 to-slate-950 border-orange-500/50 shadow-orange-950/30"
                                    : analogData.dia_maximo_riesgo.nivel_alerta_anticipada === "AMARILLA"
                                    ? "bg-gradient-to-br from-amber-950/40 via-slate-900 to-slate-950 border-amber-500/40 shadow-amber-950/20"
                                    : "bg-gradient-to-br from-emerald-950/30 via-slate-900 to-slate-950 border-emerald-500/30 shadow-emerald-950/20"
                            }`}
                        >
                            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
                                <div className="flex items-center gap-3">
                                    <div
                                        className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold shadow-lg shrink-0 ${
                                            analogData.dia_maximo_riesgo.nivel_alerta_anticipada === "ROJA"
                                                ? "bg-red-600/30 border border-red-500 text-red-400 animate-pulse"
                                                : analogData.dia_maximo_riesgo.nivel_alerta_anticipada === "NARANJA"
                                                ? "bg-orange-600/30 border border-orange-500 text-orange-400"
                                                : analogData.dia_maximo_riesgo.nivel_alerta_anticipada === "AMARILLA"
                                                ? "bg-amber-600/30 border border-amber-500 text-amber-400"
                                                : "bg-emerald-600/30 border border-emerald-500 text-emerald-400"
                                        }`}
                                    >
                                        <Zap className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span
                                                className={`text-[11px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider border ${
                                                    analogData.dia_maximo_riesgo.nivel_alerta_anticipada === "ROJA"
                                                        ? "bg-red-500/20 text-red-300 border-red-500/50"
                                                        : analogData.dia_maximo_riesgo.nivel_alerta_anticipada === "NARANJA"
                                                        ? "bg-orange-500/20 text-orange-300 border-orange-500/50"
                                                        : analogData.dia_maximo_riesgo.nivel_alerta_anticipada === "AMARILLA"
                                                        ? "bg-amber-500/20 text-amber-300 border-amber-500/50"
                                                        : "bg-emerald-500/20 text-emerald-300 border-emerald-500/50"
                                                }`}
                                            >
                                                ALERTA PREDICTIVA ANÁLOGA: {analogData.dia_maximo_riesgo.nivel_alerta_anticipada}
                                            </span>
                                            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                                                ⏱️ Lead Time: {analogData.dia_maximo_riesgo.horas_anticipacion}h (Día +{analogData.dia_maximo_riesgo.dia_numero} - {analogData.dia_maximo_riesgo.dia_semana})
                                            </span>
                                            <span className="text-[10px] px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/40">
                                                Open-Meteo Pro ECMWF IFS 9km
                                            </span>
                                        </div>
                                        <h3 className="text-base font-black text-white mt-1">
                                            Vigilancia Retrospectiva FEN • {analogData.cuenca_nombre}
                                        </h3>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 w-full lg:w-auto justify-end">
                                    <button
                                        onClick={() => setActiveTab("predictor")}
                                        className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-bold text-xs shadow-lg shadow-orange-600/20 transition"
                                    >
                                        <Sparkles className="w-3.5 h-3.5" />
                                        <span>Ver Modelo 7 Días Detallado</span>
                                        <ArrowUpRight className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>

                            {/* Grid de 4 Métricas Clave de Anticipación */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
                                <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800">
                                    <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                                        Análogo Histórico Cercano
                                    </span>
                                    <span className="text-xs font-black text-amber-300 block mt-1 truncate">
                                        {analogData.dia_maximo_riesgo.evento_analogo_referencia}
                                    </span>
                                    <div className="flex items-center gap-2 mt-2">
                                        <div className="flex-1 bg-slate-800 h-1.5 rounded-full overflow-hidden">
                                            <div
                                                className="bg-amber-500 h-full rounded-full"
                                                style={{ width: `${analogData.dia_maximo_riesgo.similitud_analoga_pct}%` }}
                                            />
                                        </div>
                                        <span className="text-[10px] font-mono font-bold text-slate-300">
                                            {analogData.dia_maximo_riesgo.similitud_analoga_pct}%
                                        </span>
                                    </div>
                                </div>

                                <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800">
                                    <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                                        Factor Amplificador FEN (M_FEN)
                                    </span>
                                    <div className="flex items-baseline gap-2 mt-1">
                                        <span className="text-xl font-black text-orange-400">
                                            {analogData.dia_maximo_riesgo.factor_amplificacion_fen}x
                                        </span>
                                        <span className="text-[10px] text-slate-400">
                                            Multiplicador de saturación
                                        </span>
                                    </div>
                                    <p className="text-[10px] text-slate-500 mt-1">
                                        Basado en la respuesta no lineal de la cuenca (CAF 1998)
                                    </p>
                                </div>

                                <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800">
                                    <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                                        Precipitación Estimada Pico
                                    </span>
                                    <div className="flex items-baseline gap-2 mt-1">
                                        <span className="text-xl font-black text-sky-400">
                                            {analogData.dia_maximo_riesgo.lluvia_extrema_estimada_mm} mm
                                        </span>
                                        <span className="text-[10px] text-slate-400">
                                            (Crudo: {analogData.dia_maximo_riesgo.lluvia_proyectada_openmeteo_mm} mm)
                                        </span>
                                    </div>
                                    <p className="text-[10px] text-slate-500 mt-1">
                                        Proyección corregida por hidrogramas históricos
                                    </p>
                                </div>

                                <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800">
                                    <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                                        Firma Precursora &amp; Viento
                                    </span>
                                    <div className="flex items-center justify-between mt-1">
                                        <span className="text-xs font-bold text-white">
                                            Alisios: {analogData.dia_maximo_riesgo.condicion_viento_alisio}
                                        </span>
                                        <span className="text-[10px] font-mono text-slate-400">
                                            {analogData.dia_maximo_riesgo.temperatura_min}°C / {analogData.dia_maximo_riesgo.temperatura_max}°C
                                        </span>
                                    </div>
                                    <p className="text-[10px] text-slate-500 mt-1">
                                        Debilitamiento de alisios favorece convección
                                    </p>
                                </div>
                            </div>

                            {/* Infraestructura Crítica Amenazada de la CAF */}
                            {analogData.infraestructura_amenazada_caf && analogData.infraestructura_amenazada_caf.length > 0 && (
                                <div className="mt-4 pt-3 border-t border-slate-800/80">
                                    <div className="flex items-center gap-2 mb-2">
                                        <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
                                        <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                                            Infraestructura Crítica CAF en Riesgo Inmediato:
                                        </span>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {analogData.infraestructura_amenazada_caf.map((inf, idx) => (
                                            <div
                                                key={idx}
                                                className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-xs flex items-center gap-1.5"
                                                title={inf.riesgo_historico || inf.impacto || inf.patron_dano}
                                            >
                                                <span className="text-red-400">⚠️</span>
                                                <span className="font-semibold text-slate-200">
                                                    {inf.nombre || inf.tramo}
                                                </span>
                                                <span className="text-[10px] text-slate-500">
                                                    ({inf.tipo.replace("_", " ")})
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Banner de Acoplamiento Bipolar Norte-Sur (SENAMHI Dossier Pág. 21) */}
                            {analogData.acoplamiento_bipolar && analogData.acoplamiento_bipolar.regla_activa !== "REGULAR" && (
                                <div className="mt-4 p-3 rounded-xl bg-purple-950/40 border border-purple-800/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs">
                                    <div className="flex items-start gap-2.5">
                                        <Radio className="w-4 h-4 text-purple-400 shrink-0 mt-0.5 animate-pulse" />
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <strong className="text-purple-300 font-bold">
                                                    Acoplamiento Bipolar FEN Territorial (SENAMHI Pág. 21):
                                                </strong>
                                                <span className="text-[10px] px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-200 border border-purple-500/40 font-mono">
                                                    COSTA NORTE ◄► SIERRA SUR
                                                </span>
                                            </div>
                                            <p className="text-purple-200/80 mt-0.5 leading-relaxed">
                                                {analogData.acoplamiento_bipolar.descripcion}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="shrink-0 bg-slate-950/80 px-3 py-2 rounded-lg border border-purple-900/50 text-[11px] text-slate-300">
                                        <strong className="text-amber-400 block mb-0.5">Acción Preventiva COEN:</strong>
                                        {analogData.acoplamiento_bipolar.accion_preventiva_recomendada}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Selector de Pestañas Temáticas */}
                    <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-2">
                        <button
                            id="tab-btn-general"
                            onClick={() => setActiveTab("general")}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition ${
                                activeTab === "general"
                                    ? "bg-amber-600 text-white shadow-md shadow-amber-600/30"
                                    : "bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800"
                            }`}
                        >
                            <Calendar className="w-4 h-4" />
                            <span>1. Radiografía Comparativa (1983 - 1998 - 2017)</span>
                        </button>
                        <button
                            id="tab-btn-infraestructura"
                            onClick={() => setActiveTab("infraestructura")}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition ${
                                activeTab === "infraestructura"
                                    ? "bg-gradient-to-r from-red-600 to-amber-600 text-white shadow-md shadow-red-600/30"
                                    : "bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800"
                            }`}
                        >
                            <Truck className="w-4 h-4 text-amber-300" />
                            <span>Puentes &amp; Carreteras Colapsadas (CAF)</span>
                        </button>
                        <button
                            id="tab-btn-educacion"
                            onClick={() => setActiveTab("educacion")}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition ${
                                activeTab === "educacion"
                                    ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                                    : "bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800"
                            }`}
                        >
                            <GraduationCap className="w-4 h-4" />
                            <span>2. Impacto Educativo (MINEDU / CISE)</span>
                        </button>
                        <button
                            id="tab-btn-salud"
                            onClick={() => setActiveTab("salud")}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition ${
                                activeTab === "salud"
                                    ? "bg-rose-600 text-white shadow-md shadow-rose-600/30"
                                    : "bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800"
                            }`}
                        >
                            <HeartPulse className="w-4 h-4" />
                            <span>3. Alerta Sanitaria &amp; Brotes (OPS/OMS)</span>
                        </button>
                        <button
                            id="tab-btn-hidrologia"
                            onClick={() => setActiveTab("hidrologia")}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition ${
                                activeTab === "hidrologia"
                                    ? "bg-sky-600 text-white shadow-md shadow-sky-600/30"
                                    : "bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800"
                            }`}
                        >
                            <Waves className="w-4 h-4" />
                            <span>4. Puntos Críticos &amp; Quebradas</span>
                        </button>
                        <button
                            id="tab-btn-agropecuario"
                            onClick={() => setActiveTab("agropecuario")}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition ${
                                activeTab === "agropecuario"
                                    ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30"
                                    : "bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800"
                            }`}
                        >
                            <Sprout className="w-4 h-4 text-emerald-400" />
                            <span>5. Sector Agropecuario &amp; Riego (MINAG - OIA)</span>
                        </button>
                        <button
                            id="tab-btn-lecciones"
                            onClick={() => setActiveTab("lecciones")}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition ${
                                activeTab === "lecciones"
                                    ? "bg-purple-600 text-white shadow-md shadow-purple-600/30"
                                    : "bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800"
                            }`}
                        >
                            <BookOpen className="w-4 h-4" />
                            <span>6. Lecciones CAF &amp; Hoja de Ruta</span>
                        </button>
                        <button
                            id="tab-btn-predictor"
                            onClick={() => setActiveTab("predictor")}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition ${
                                activeTab === "predictor"
                                    ? "bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-md shadow-orange-600/30"
                                    : "bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800"
                            }`}
                        >
                            <Sparkles className="w-4 h-4 text-amber-300" />
                            <span>7. Predictor Análogo 7 Días (Open-Meteo Pro)</span>
                        </button>
                        <button
                            id="tab-btn-radar"
                            onClick={() => setActiveTab("radar")}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition ${
                                activeTab === "radar"
                                    ? "bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-md shadow-red-600/30"
                                    : "bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800"
                            }`}
                        >
                            <Compass className="w-4 h-4 text-rose-300" />
                            <span>8. Radar Nacional 17 Cuencas FEN</span>
                        </button>
                        <button
                            id="tab-btn-bivalente"
                            onClick={() => setActiveTab("bivalente")}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition ${
                                activeTab === "bivalente"
                                    ? "bg-gradient-to-r from-teal-600 to-emerald-600 text-white shadow-md shadow-emerald-600/30"
                                    : "bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800"
                            }`}
                        >
                            <Layers className="w-4 h-4 text-teal-300" />
                            <span>9. Matriz Bivalente FEN (Riesgos vs. Oportunidades)</span>
                        </button>
                    </div>

                    {/* Selector de Evento FEN Específico para Análisis Detallado */}
                    <div className="flex items-center justify-between bg-slate-950 p-3 rounded-xl border border-slate-800">
                        <span className="text-xs font-bold text-slate-400 flex items-center gap-2">
                            <Clock className="w-4 h-4 text-amber-400" />
                            Seleccionar Evento Climático Histórico para Detalle:
                        </span>
                        <div className="flex items-center gap-2">
                            {(["1983", "1998", "2017"] as const).map((yr) => (
                                <button
                                    key={yr}
                                    onClick={() => setSelectedYear(yr)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-black transition border ${
                                        selectedYear === yr
                                            ? "bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/20"
                                            : "bg-slate-900 text-slate-400 hover:text-white border-slate-700"
                                    }`}
                                >
                                    {yr === "1983" && "FEN 1982-1983 (Mega)"}
                                    {yr === "1998" && "FEN 1997-1998 (Mega)"}
                                    {yr === "2017" && "Niño Costero 2017"}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* CONTENIDO DE PESTAÑAS */}

                    {/* PESTAÑA 1: RADIOGRAFÍA COMPARATIVA */}
                    {activeTab === "general" && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {(["1983", "1998", "2017"] as const).map((yr) => {
                                    const edu = memoria.impacto_educativo[yr];
                                    const sal = memoria.impacto_sanitario_epidemiologico[yr];
                                    const isHighlight = selectedYear === yr;

                                    return (
                                        <div
                                            key={yr}
                                            onClick={() => setSelectedYear(yr)}
                                            className={`p-5 rounded-2xl border transition cursor-pointer ${
                                                isHighlight
                                                    ? "bg-slate-900/90 border-amber-500 shadow-xl shadow-amber-500/10 ring-1 ring-amber-500"
                                                    : "bg-slate-900/50 border-slate-800 hover:border-slate-700"
                                            }`}
                                        >
                                            <div className="flex items-center justify-between mb-3">
                                                <span className="text-base font-black text-white">
                                                    {yr === "1983" && "Mega FEN 1982-1983"}
                                                    {yr === "1998" && "Mega FEN 1997-1998"}
                                                    {yr === "2017" && "Niño Costero 2017"}
                                                </span>
                                                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-amber-300">
                                                    {yr}
                                                </span>
                                            </div>

                                            <div className="space-y-3">
                                                <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800/80">
                                                    <div className="text-[10px] text-slate-500 uppercase font-bold">
                                                        Sector Escolar (MINEDU)
                                                    </div>
                                                    <div className="flex justify-between items-center mt-1">
                                                        <span className="text-xs text-slate-300">Colegios Afectados:</span>
                                                        <span className="text-sm font-bold text-blue-400">
                                                            {edu.colegios_afectados}
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between items-center mt-0.5">
                                                        <span className="text-xs text-slate-300">Aulas Inhabitables:</span>
                                                        <span className="text-sm font-bold text-red-400">
                                                            {edu.colegios_inhabitables}
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between items-center mt-0.5">
                                                        <span className="text-xs text-slate-300">Semanas de Clases Perdidas:</span>
                                                        <span className="text-sm font-bold text-amber-400">
                                                            {edu.semanas_perdidas} sem
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800/80">
                                                    <div className="text-[10px] text-slate-500 uppercase font-bold">
                                                        Salud &amp; Brotes (OPS)
                                                    </div>
                                                    <div className="flex justify-between items-center mt-1">
                                                        <span className="text-xs text-slate-300">Casos Registrados:</span>
                                                        <span className="text-sm font-bold text-rose-400">
                                                            ~{sal.casos.toLocaleString()}
                                                        </span>
                                                    </div>
                                                    <div className="mt-1.5 flex flex-wrap gap-1">
                                                        {sal.brotes.slice(0, 3).map((b, idx) => (
                                                            <span
                                                                key={idx}
                                                                className="text-[10px] px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-300 border border-rose-500/20"
                                                            >
                                                                {b}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>

                                            <p className="text-xs text-slate-400 mt-3 line-clamp-3 italic">
                                                &ldquo;{edu.observacion}&rdquo;
                                            </p>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Resumen Físico, Agrícola y Pérdidas del Distrito */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
                                    <div className="flex items-center gap-2 text-emerald-400 mb-2">
                                        <Sprout className="w-4 h-4" />
                                        <h4 className="text-xs font-bold uppercase tracking-wider">
                                            Sector Agrario (MINAG-OIA)
                                        </h4>
                                    </div>
                                    <div className="text-2xl font-black text-white">
                                        ~{memoria.impacto_fisico_hidrologico.hectareas_agricolas_perdidas.toLocaleString()} Has
                                    </div>
                                    <p className="text-xs text-slate-400 mt-1">
                                        Valle: <strong className="text-slate-200">{memoria.impacto_agropecuario_minag?.valle_oficial || memoria.cuenca_principal}</strong>
                                    </p>
                                </div>

                                <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
                                    <div className="flex items-center gap-2 text-amber-400 mb-2">
                                        <Compass className="w-4 h-4" />
                                        <h4 className="text-xs font-bold uppercase tracking-wider">
                                            Aislamiento Vial Promedio
                                        </h4>
                                    </div>
                                    <div className="text-2xl font-black text-white">
                                        {memoria.impacto_fisico_hidrologico.dias_aislamiento_promedio} días
                                    </div>
                                    <p className="text-xs text-slate-400 mt-1 truncate">
                                        Vías: {memoria.impacto_fisico_hidrologico.vias_aislamiento.join(", ")}
                                    </p>
                                </div>

                                <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
                                    <div className="flex items-center gap-2 text-sky-400 mb-2">
                                        <Layers className="w-4 h-4" />
                                        <h4 className="text-xs font-bold uppercase tracking-wider">
                                            Patrón Hidrológico
                                        </h4>
                                    </div>
                                    <div className="text-xs font-bold text-white mt-1">
                                        {memoria.impacto_fisico_hidrologico.patron_hidrologico}
                                    </div>
                                    <p className="text-[11px] text-slate-400 mt-1">
                                        Cuenca receptora: {memoria.cuenca_principal}
                                    </p>
                                </div>
                            </div>

                            {/* Evaluación Geológica de Zonas Críticas (INGEMMET 2017) & Compendio INDECI 2017 */}
                            {(memoria.analisis_geologico_ingemmet_2017 || memoria.danos_oficiales_indeci_2017) && (
                                <div className="space-y-4 pt-2">
                                    {/* Bloque INGEMMET DGAR */}
                                    {memoria.analisis_geologico_ingemmet_2017 && (
                                        <div className="p-5 bg-gradient-to-br from-amber-950/20 via-slate-900 to-slate-900 border border-amber-500/30 rounded-2xl relative overflow-hidden">
                                            <div className="flex items-start justify-between gap-4 mb-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-amber-500/10 border border-amber-500/30 rounded-lg text-amber-400">
                                                        <AlertTriangle className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <h4 className="text-sm font-black text-amber-200 uppercase tracking-wide">
                                                                Dictamen Geológico Pericial (INGEMMET DGAR 2017)
                                                            </h4>
                                                            <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-full">
                                                                TIER 1 OFICIAL
                                                            </span>
                                                        </div>
                                                        <p className="text-[11px] text-slate-400">
                                                            Evaluación Geológica de Zonas Afectadas por el Niño Costero 2017 (La Libertad y Cajamarca)
                                                        </p>
                                                    </div>
                                                </div>
                                                <span className="text-[10px] font-mono text-slate-500 bg-slate-800 px-2 py-1 rounded">
                                                    SRC-INGEMMET-DGAR-2017
                                                </span>
                                            </div>
                                            <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80 mb-3">
                                                {memoria.analisis_geologico_ingemmet_2017}
                                            </p>
                                            {memoria.fuentes_oficiales_cruzadas && memoria.fuentes_oficiales_cruzadas.length > 0 && (
                                                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                                                    <span className="text-[10px] text-slate-400 font-semibold mr-1">Fuentes Validadas Cruzadas:</span>
                                                    {memoria.fuentes_oficiales_cruzadas.map((src, i) => (
                                                        <span key={i} className="text-[10px] font-mono bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
                                                            {src}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Bloque INDECI Compendio Estadístico 2017 */}
                                    {memoria.danos_oficiales_indeci_2017 && (
                                        <div className="p-5 bg-gradient-to-br from-red-950/20 via-slate-900 to-slate-900 border border-red-500/30 rounded-2xl">
                                            <div className="flex items-start justify-between gap-4 mb-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400">
                                                        <ShieldAlert className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <h4 className="text-sm font-black text-red-200 uppercase tracking-wide">
                                                                Registro de Impactos Validados (INDECI 2017 - Gestión Reactiva)
                                                            </h4>
                                                            <span className="px-2 py-0.5 text-[10px] font-bold bg-red-500/20 text-red-300 border border-red-500/40 rounded-full">
                                                                COMPENDIO ESTADÍSTICO
                                                            </span>
                                                        </div>
                                                        <p className="text-[11px] text-slate-400">
                                                            {memoria.danos_oficiales_indeci_2017.decreto_supremo_declaratoria 
                                                                ? `Marco Legal: ${memoria.danos_oficiales_indeci_2017.decreto_supremo_declaratoria}` 
                                                                : `Área Departamental: ${memoria.danos_oficiales_indeci_2017.departamento}`}
                                                        </p>
                                                    </div>
                                                </div>
                                                <span className="text-[10px] font-mono text-slate-500 bg-slate-800 px-2 py-1 rounded">
                                                    SRC-INDECI-COMPENDIO-2017
                                                </span>
                                            </div>

                                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                                                {memoria.danos_oficiales_indeci_2017.damnificados_departamentales_validados !== undefined && (
                                                    <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800">
                                                        <span className="text-[10px] text-slate-400 block font-semibold uppercase">Damnificados Dptal.</span>
                                                        <span className="text-lg font-black text-red-400">
                                                            {memoria.danos_oficiales_indeci_2017.damnificados_departamentales_validados.toLocaleString()}
                                                        </span>
                                                    </div>
                                                )}
                                                {memoria.danos_oficiales_indeci_2017.viviendas_colapsadas_inhabitables_departamentales !== undefined && (
                                                    <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800">
                                                        <span className="text-[10px] text-slate-400 block font-semibold uppercase">Viviendas Colap/Inhab</span>
                                                        <span className="text-lg font-black text-amber-400">
                                                            {memoria.danos_oficiales_indeci_2017.viviendas_colapsadas_inhabitables_departamentales.toLocaleString()}
                                                        </span>
                                                    </div>
                                                )}
                                                {(memoria.danos_oficiales_indeci_2017.carreteras_destruidas_afectadas_km !== undefined || memoria.danos_oficiales_indeci_2017.carreteras_destruidas_km !== undefined) && (
                                                    <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800">
                                                        <span className="text-[10px] text-slate-400 block font-semibold uppercase">Vías Destruidas/Afect.</span>
                                                        <span className="text-lg font-black text-orange-400">
                                                            {(memoria.danos_oficiales_indeci_2017.carreteras_destruidas_afectadas_km || memoria.danos_oficiales_indeci_2017.carreteras_destruidas_km || 0).toLocaleString()} km
                                                        </span>
                                                    </div>
                                                )}
                                                {memoria.danos_oficiales_indeci_2017.albergues_oficiales_instalados !== undefined && (
                                                    <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800">
                                                        <span className="text-[10px] text-slate-400 block font-semibold uppercase">Albergues Oficiales</span>
                                                        <span className="text-lg font-black text-sky-400">
                                                            {memoria.danos_oficiales_indeci_2017.albergues_oficiales_instalados} ({memoria.danos_oficiales_indeci_2017.poblacion_albergada?.toLocaleString()} alb.)
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                            {memoria.danos_oficiales_indeci_2017.vulnerabilidad_eje && (
                                                <p className="text-[11px] text-slate-400 mt-2 italic">
                                                    Foco Geográfico: {memoria.danos_oficiales_indeci_2017.vulnerabilidad_eje}
                                                </p>
                                            )}
                                        </div>
                                    )}

                                    {/* Bloque PNP: Dispositivo Policial de Seguridad y Evacuación */}
                                    {memoria.comisarias_pnp && memoria.comisarias_pnp.length > 0 && (
                                        <div className="p-5 bg-gradient-to-br from-blue-950/20 via-slate-900 to-slate-900 border border-blue-500/30 rounded-2xl">
                                            <div className="flex items-start justify-between gap-4 mb-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-blue-500/10 border border-blue-500/30 rounded-lg text-blue-400">
                                                        <ShieldAlert className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <h4 className="text-sm font-black text-blue-200 uppercase tracking-wide">
                                                                Dispositivo Policial de Seguridad & Orden Público (PNP)
                                                            </h4>
                                                            <span className="px-2 py-0.5 text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/40 rounded-full">
                                                                PLAN DE CONTINGENCIA
                                                            </span>
                                                        </div>
                                                        <p className="text-[11px] text-slate-400">
                                                            Fuerza Pública Asignada, Protección Perimetral de Albergues y Cierre de Puentes (Art. 67 Ley 29664)
                                                        </p>
                                                    </div>
                                                </div>
                                                <span className="text-[10px] font-mono text-slate-500 bg-slate-800 px-2 py-1 rounded">
                                                    SRC-PNP-MININTER-COMISARIAS-2026
                                                </span>
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-1">
                                                {memoria.comisarias_pnp.map((cpnp, idx) => (
                                                    <div key={idx} className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 flex flex-col justify-between space-y-2">
                                                        <div>
                                                            <div className="flex items-center justify-between">
                                                                <span className="text-[10px] font-mono text-blue-400 bg-blue-950/60 px-1.5 py-0.5 rounded border border-blue-900">
                                                                    COD: {cpnp.cod_cpnp}
                                                                </span>
                                                                <span className="text-[10px] font-bold text-slate-300 bg-slate-800 px-1.5 py-0.5 rounded">
                                                                    Tipo {cpnp.tipo_comisaria}
                                                                </span>
                                                            </div>
                                                            <h5 className="text-xs font-black text-white mt-1.5">
                                                                {cpnp.nombre}
                                                            </h5>
                                                            <p className="text-[11px] text-slate-400 mt-0.5">
                                                                Región: {cpnp.region_policial}
                                                            </p>
                                                        </div>
                                                        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px]">
                                                            <span className="text-slate-400">Cuadrantes de Evacuación:</span>
                                                            <span className="font-bold text-emerald-400">{cpnp.sectores_patrullaje_cuadrante} Sectores</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* PESTAÑA INFRAESTRUCTURA: PUENTES & CARRETERAS HISTÓRICAS (CAF 1983-2023) */}
                    {activeTab === "infraestructura" && (
                        <div className="space-y-6">
                            <HistoricalInfrastructureMap />
                        </div>
                    )}

                    {/* PESTAÑA 2: IMPACTO EDUCATIVO (MINEDU / CISE) */}
                    {activeTab === "educacion" && (
                        <div className="space-y-6">
                            <div className="p-5 bg-slate-900 border border-blue-500/30 rounded-2xl shadow-lg">
                                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
                                            <GraduationCap className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h3 className="text-base font-bold text-white">
                                                Expediente de Vulnerabilidad Escolar • {memoria.distrito} ({selectedYear})
                                            </h3>
                                            <p className="text-xs text-slate-400">
                                                Fuente: MINEDU / PUCP CISE - Colección Especial Manuel Etesse (&ldquo;El FEN y la Escuela Peruana&rdquo;)
                                            </p>
                                        </div>
                                    </div>
                                    <span className="text-xs font-black px-2.5 py-1 rounded bg-blue-500/20 text-blue-300 border border-blue-500/40">
                                        AÑO {selectedYear}
                                    </span>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5">
                                    <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-center">
                                        <span className="text-xs text-slate-400 block font-medium">Colegios con Anegamiento</span>
                                        <span className="text-3xl font-black text-blue-400 mt-1 block">
                                            {memoria.impacto_educativo[selectedYear].colegios_afectados}
                                        </span>
                                        <span className="text-[10px] text-slate-500 mt-1 block">Locales educativos en la jurisdicción</span>
                                    </div>
                                    <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-center">
                                        <span className="text-xs text-slate-400 block font-medium">Locales Inhabitables / Colapsados</span>
                                        <span className="text-3xl font-black text-red-400 mt-1 block">
                                            {memoria.impacto_educativo[selectedYear].colegios_inhabitables}
                                        </span>
                                        <span className="text-[10px] text-slate-500 mt-1 block">Paredes de adobe o filtración total de techos</span>
                                    </div>
                                    <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-center">
                                        <span className="text-xs text-slate-400 block font-medium">Tiempo Lectivo Perdido</span>
                                        <span className="text-3xl font-black text-amber-400 mt-1 block">
                                            {memoria.impacto_educativo[selectedYear].semanas_perdidas} semanas
                                        </span>
                                        <span className="text-[10px] text-slate-500 mt-1 block">Retraso directo en calendario escolar</span>
                                    </div>
                                </div>

                                <div className="mt-5 p-4 bg-slate-950/80 rounded-xl border border-slate-800">
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-2 flex items-center gap-2">
                                        <AlertTriangle className="w-4 h-4 text-amber-400" />
                                        Crónica Situacional del Sector Educación:
                                    </h4>
                                    <p className="text-xs text-slate-300 leading-relaxed italic">
                                        &ldquo;{memoria.impacto_educativo[selectedYear].observacion}&rdquo;
                                    </p>
                                </div>

                                <div className="mt-4 p-4 bg-slate-950/80 rounded-xl border border-slate-800">
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                                        Colegios Utilizados Históricamente como Albergues Comunales:
                                    </h4>
                                    <div className="flex flex-wrap gap-2">
                                        {memoria.impacto_educativo[selectedYear].albergues.map((alb, i) => (
                                            <span
                                                key={i}
                                                className="px-3 py-1.5 rounded-lg bg-blue-900/30 text-blue-300 border border-blue-700/50 text-xs font-medium"
                                            >
                                                🏫 {alb}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {/* PADRÓN OFICIAL DE ALBERGUES TEMPORALES INDECI (MINEDU / ESCALE - SIGMED 2026) */}
                                {memoria.centros_educativos && (
                                    <div className="mt-6 p-5 bg-gradient-to-br from-slate-950 via-blue-950/20 to-slate-950 border border-blue-500/40 rounded-2xl shadow-xl">
                                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-blue-900/40">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400 font-black">
                                                    🏛️
                                                </div>
                                                <div>
                                                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                                                        Albergues Temporales & Infraestructura Escolar Oficial (MINEDU / ESCALE)
                                                        <span className="text-[10px] font-black px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/40">
                                                            SIGMED 2026
                                                        </span>
                                                    </h4>
                                                    <p className="text-xs text-slate-400">
                                                        Marco Legal: Ley Nº 29664 (SINAGERD) • Padrón Georreferenciado de Infraestructura Educativa
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <div className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-center">
                                                    <span className="text-[10px] text-slate-400 block font-bold">TOTAL II.EE.</span>
                                                    <span className="text-sm font-black text-white">{memoria.centros_educativos.total_servicios_educativos}</span>
                                                </div>
                                                <div className="px-3 py-1.5 rounded-lg bg-blue-950/40 border border-blue-800/40 text-center">
                                                    <span className="text-[10px] text-blue-300 block font-bold">PÚBLICAS</span>
                                                    <span className="text-sm font-black text-blue-400">{memoria.centros_educativos.total_publicas}</span>
                                                </div>
                                                <div className="px-3 py-1.5 rounded-lg bg-amber-950/40 border border-amber-800/40 text-center">
                                                    <span className="text-[10px] text-amber-300 block font-bold">ALBERGUES APTOS</span>
                                                    <span className="text-sm font-black text-amber-400">{memoria.centros_educativos.total_albergues_potenciales}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {memoria.albergues_temporales_indeci && memoria.albergues_temporales_indeci.length > 0 ? (
                                            <div className="mt-4">
                                                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-3">
                                                    Colegios Públicos Priorizados como Centros de Refugio Comunitario:
                                                </span>
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                                    {memoria.albergues_temporales_indeci.slice(0, 6).map((alb, idx) => (
                                                        <div
                                                            key={idx}
                                                            className="p-3.5 bg-slate-900/80 hover:bg-slate-900 border border-blue-900/30 hover:border-blue-500/50 rounded-xl transition-all shadow-md group"
                                                        >
                                                            <div className="flex items-start justify-between gap-2 mb-1.5">
                                                                <span className="text-xs font-bold text-white group-hover:text-blue-300 transition-colors line-clamp-1">
                                                                    🏫 {alb.nombre_ie}
                                                                </span>
                                                                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800/40 flex-shrink-0">
                                                                    Cód: {alb.codigo_local}
                                                                </span>
                                                            </div>
                                                            <div className="text-[11px] text-slate-400 space-y-1">
                                                                <div className="text-slate-300">
                                                                    <strong>Nivel:</strong> {alb.nivel_modalidad}
                                                                </div>
                                                                <div className="truncate text-slate-400">
                                                                    <strong>Dirección:</strong> {alb.direccion || "Área Urbana/Rural"}
                                                                </div>
                                                                {alb.latitud && alb.longitud ? (
                                                                    <div className="text-[10px] text-slate-500 font-mono flex items-center justify-between pt-1 border-t border-slate-800">
                                                                        <span>GPS: {alb.latitud.toFixed(4)}, {alb.longitud.toFixed(4)}</span>
                                                                        <span className="text-emerald-400 font-bold">✓ Geo-Validado</span>
                                                                    </div>
                                                                ) : null}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ) : (
                                            <p className="text-xs text-slate-400 mt-3 italic">
                                                Consultando inventario de infraestructura escolar en la base georreferenciada de MINEDU / ESCALE...
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* PESTAÑA 3: SALUD PÚBLICA & BROTES (OPS/OMS) */}
                    {activeTab === "salud" && (
                        <div className="space-y-6">
                            <div className="p-5 bg-slate-900 border border-rose-500/30 rounded-2xl shadow-lg">
                                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
                                            <HeartPulse className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h3 className="text-base font-bold text-white">
                                                Expediente Epidemiológico Post-Inundación • {memoria.distrito} ({selectedYear})
                                            </h3>
                                            <p className="text-xs text-slate-400">
                                                Fuente: OPS / OMS - &ldquo;Crónica de Desastres y Repercusiones Sanitarias del FEN&rdquo; (Capítulo 11 Perú)
                                            </p>
                                        </div>
                                    </div>
                                    <span className="text-xs font-black px-2.5 py-1 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40">
                                        AÑO {selectedYear}
                                    </span>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
                                    <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
                                        <span className="text-xs text-slate-400 block font-medium">Brotes Registrados:</span>
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {memoria.impacto_sanitario_epidemiologico[selectedYear].brotes.map((b, i) => (
                                                <span
                                                    key={i}
                                                    className="px-2.5 py-1 rounded-md bg-rose-500/20 text-rose-300 border border-rose-500/40 text-xs font-bold"
                                                >
                                                    ⚠️ {b}
                                                </span>
                                            ))}
                                        </div>
                                        <div className="mt-4 pt-3 border-t border-slate-800 text-xs text-slate-400">
                                            Total aproximado de atenciones de emergencia:{" "}
                                            <strong className="text-rose-400 font-mono text-sm">
                                                ~{memoria.impacto_sanitario_epidemiologico[selectedYear].casos.toLocaleString()} casos
                                            </strong>
                                        </div>
                                    </div>

                                    <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
                                        <span className="text-xs text-slate-400 block font-medium">Vectores y Periodo Crítico:</span>
                                        <div className="mt-2 space-y-2">
                                            <div>
                                                <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold block">
                                                    Vector Principal de Transmisión:
                                                </span>
                                                <span className="text-xs font-bold text-amber-300">
                                                    🦟 {memoria.impacto_sanitario_epidemiologico.vector_predominante}
                                                </span>
                                            </div>
                                            <div>
                                                <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold block">
                                                    Ventana Temporal de Máximo Contagio:
                                                </span>
                                                <span className="text-xs font-bold text-white">
                                                    📅 {memoria.impacto_sanitario_epidemiologico.semanas_criticas_epidemicas}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-4 p-4 bg-slate-950/80 rounded-xl border border-slate-800">
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-2 flex items-center gap-2">
                                        <AlertTriangle className="w-4 h-4 text-rose-400" />
                                        Afectación de Centros de Salud y Red de Alcantarillado:
                                    </h4>
                                    <p className="text-xs text-slate-300 leading-relaxed italic">
                                        &ldquo;{memoria.impacto_sanitario_epidemiologico[selectedYear].postas_afectadas}&rdquo;
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* PESTAÑA 4: PUNTOS CRÍTICOS & QUEBRADAS */}
                    {activeTab === "hidrologia" && (
                        <div className="space-y-6">
                            <div className="p-5 bg-slate-900 border border-sky-500/30 rounded-2xl shadow-lg">
                                <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
                                    <div className="w-10 h-10 rounded-xl bg-sky-500/20 border border-sky-500/40 flex items-center justify-center text-sky-400">
                                        <Waves className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="text-base font-bold text-white">
                                            Catálogo de Puntos Críticos y Quebradas Reincidentes • {memoria.distrito}
                                        </h3>
                                        <p className="text-xs text-slate-400">
                                            Cruce ANA, CENEPRED e INDECI de zonas de rotura de diques y activación de torrenteras.
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
                                    <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
                                        <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-3 flex items-center gap-2">
                                            <AlertTriangle className="w-4 h-4" />
                                            Puntos Críticos de Desborde Histórico:
                                        </h4>
                                        <ul className="space-y-2">
                                            {memoria.impacto_fisico_hidrologico.puntos_criticos.map((p, idx) => (
                                                <li key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                                                    <span className="text-amber-400 font-bold">•</span>
                                                    <span>{p}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
                                        <h4 className="text-xs font-bold uppercase tracking-wider text-sky-400 mb-3 flex items-center gap-2">
                                            <Compass className="w-4 h-4" />
                                            Quebradas Críticas en la Jurisdicción:
                                        </h4>
                                        {memoria.impacto_fisico_hidrologico.quebradas_criticas_asociadas.length > 0 ? (
                                            <div className="flex flex-wrap gap-2">
                                                {memoria.impacto_fisico_hidrologico.quebradas_criticas_asociadas.map((q, idx) => (
                                                    <span
                                                        key={idx}
                                                        className="px-3 py-1.5 rounded-lg bg-sky-900/30 text-sky-300 border border-sky-700/50 text-xs font-medium"
                                                    >
                                                        ⛰️ {q}
                                                    </span>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-xs text-slate-400 italic">
                                                No se registran quebradas torrenciales de cabecera; el riesgo predominante es desborde por planicie de inundación fluvial ({memoria.cuenca_principal}).
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* PESTAÑA 5: SECTOR AGROPECUARIO & RIEGO (MINAG - OIA) */}
                    {activeTab === "agropecuario" && memoria.impacto_agropecuario_minag && (
                        <div className="space-y-6">
                            <div className="p-5 bg-slate-900 border border-emerald-500/40 rounded-2xl shadow-xl">
                                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                                    <div className="flex items-center gap-3">
                                        <div className="w-11 h-11 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-lg shadow-emerald-500/10">
                                            <Sprout className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h3 className="text-base font-black text-white tracking-wide">
                                                    Expediente de Áreas Perdidas y Daños en Riego • {memoria.distrito}
                                                </h3>
                                                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                                                    MINAG - OIA
                                                </span>
                                            </div>
                                            <p className="text-xs text-slate-400 mt-0.5">
                                                Valle Oficial: <strong className="text-slate-200">{memoria.impacto_agropecuario_minag.valle_oficial}</strong> • Compendio Oficial de 338 págs.
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-mono px-3 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-300">
                                            Frecuencia FEN: 1983 • 1998 • 2017
                                        </span>
                                    </div>
                                </div>

                                {/* Métricas del Evento Seleccionado o 1998 */}
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-5">
                                    <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-center">
                                        <span className="text-[11px] text-slate-400 block font-bold uppercase tracking-wider">
                                            Superficie Perdida (100% Siniestro)
                                        </span>
                                        <span className="text-3xl font-black text-red-400 mt-1 block">
                                            {memoria.impacto_agropecuario_minag["1998"].perdida_ha.toLocaleString()} Ha
                                        </span>
                                        <span className="text-[10px] text-slate-500 mt-1 block">
                                            Pérdida irrecuperable por inundación / huaico
                                        </span>
                                    </div>

                                    <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-center">
                                        <span className="text-[11px] text-slate-400 block font-bold uppercase tracking-wider">
                                            Superficie Afectada (Rendimiento)
                                        </span>
                                        <span className="text-3xl font-black text-amber-400 mt-1 block">
                                            {memoria.impacto_agropecuario_minag["1998"].afectada_ha.toLocaleString()} Ha
                                        </span>
                                        <span className="text-[10px] text-slate-500 mt-1 block">
                                            Pérdida parcial en quintales / toneladas
                                        </span>
                                    </div>

                                    <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-center">
                                        <span className="text-[11px] text-slate-400 block font-bold uppercase tracking-wider">
                                            Familias Campesinas
                                        </span>
                                        <span className="text-3xl font-black text-sky-400 mt-1 block">
                                            ~{memoria.impacto_agropecuario_minag["1998"].familias_campesinas.toLocaleString()}
                                        </span>
                                        <span className="text-[10px] text-slate-500 mt-1 block">
                                            Pequeños agricultores y comuneros
                                        </span>
                                    </div>

                                    <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-center">
                                        <span className="text-[11px] text-slate-400 block font-bold uppercase tracking-wider">
                                            Presupuesto Rehabilitación MINAG
                                        </span>
                                        <span className="text-2xl font-black text-emerald-400 mt-1 block">
                                            S/. {memoria.impacto_agropecuario_minag["1998"].presupuesto_soles.toLocaleString()}
                                        </span>
                                        <span className="text-[10px] text-slate-500 mt-1 block">
                                            Obras provisionales de emergencia DGAS
                                        </span>
                                    </div>
                                </div>

                                {/* Vulnerabilidad Fisiológica y Cultivos */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
                                    <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
                                        <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-2 flex items-center gap-2">
                                            <Sprout className="w-4 h-4" />
                                            Cultivos de Mayor Vulnerabilidad Fisiológica:
                                        </h4>
                                        <div className="flex flex-wrap gap-1.5 mb-3">
                                            {memoria.impacto_agropecuario_minag.cultivos_principales.map((c, i) => (
                                                <span
                                                    key={i}
                                                    className="px-2.5 py-1 rounded bg-emerald-950/40 text-emerald-300 border border-emerald-800/40 text-xs font-semibold"
                                                >
                                                    🌱 {c}
                                                </span>
                                            ))}
                                        </div>
                                        <p className="text-xs text-slate-300 leading-relaxed italic bg-slate-900/60 p-3 rounded-lg border border-slate-800">
                                            &ldquo;{memoria.impacto_agropecuario_minag.vulnerabilidad_fisiologica}&rdquo;
                                        </p>
                                    </div>

                                    <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
                                        <h4 className="text-xs font-bold uppercase tracking-wider text-sky-400 mb-2 flex items-center gap-2">
                                            <Waves className="w-4 h-4" />
                                            Infraestructura de Riego Siniestrada (MINAG):
                                        </h4>
                                        <ul className="space-y-2 mb-3">
                                            {memoria.impacto_agropecuario_minag.infraestructura_riego.map((inf, i) => (
                                                <li key={i} className="flex items-start gap-2 text-xs text-slate-300">
                                                    <span className="text-sky-400 font-bold">💧</span>
                                                    <span>{inf}</span>
                                                </li>
                                            ))}
                                        </ul>
                                        <div className="p-3 bg-sky-950/20 border border-sky-900/40 rounded-lg text-xs text-sky-200">
                                            <strong>Diagnóstico MINAG:</strong> {memoria.impacto_agropecuario_minag["1998"].infraestructura}
                                        </div>
                                    </div>
                                </div>

                                {/* Hoja de Ruta para el Alcalde y Junta de Regantes */}
                                <div className="mt-5 p-4 bg-emerald-950/20 border border-emerald-900/40 rounded-xl">
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-300 mb-2 flex items-center gap-2">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                        Directivas Técnicas MINAG para el Alcalde y la Junta de Usuarios de Agua:
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-slate-300 mt-3">
                                        <div className="p-3 bg-slate-950/80 rounded-lg border border-slate-800">
                                            <strong className="text-white block mb-1">1. Desazolve de Drenes Troncales:</strong>
                                            Limpieza mecánica de drenes antes de diciembre para permitir el escurrimiento y evitar la hipersalinización de suelos.
                                        </div>
                                        <div className="p-3 bg-slate-950/80 rounded-lg border border-slate-800">
                                            <strong className="text-white block mb-1">2. Protección de Bocatomas:</strong>
                                            Enrocado y refuerzo de compuertas de derivación para impedir que los aluviones colmaten los canales matrices.
                                        </div>
                                        <div className="p-3 bg-slate-950/80 rounded-lg border border-slate-800">
                                            <strong className="text-white block mb-1">3. Semillas de Ciclo Corto:</strong>
                                            Gestionar ante el INIA y Agrobanco paquetes de semillas de ciclo vegetativo corto en caso de pérdida total de siembras.
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* PESTAÑA 6: LECCIONES CAF & HOJA DE RUTA */}
                    {activeTab === "lecciones" && (
                        <div className="space-y-6">
                            <div className="p-5 bg-slate-900 border border-purple-500/30 rounded-2xl shadow-lg">
                                <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
                                    <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400">
                                        <BookOpen className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="text-base font-bold text-white">
                                            Lecciones Aprendidas de la CAF &amp; Hoja de Ruta para el Alcalde • {memoria.distrito}
                                        </h3>
                                        <p className="text-xs text-slate-400">
                                            Fuente: Corporación Andina de Fomento (CAF) - &ldquo;Las Lecciones de El Niño: Memoria, Retos y Soluciones&rdquo; (Volumen V Perú)
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-5 p-4 bg-purple-950/20 border border-purple-900/40 rounded-xl">
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-purple-400 mb-2 flex items-center gap-2">
                                        <CheckCircle2 className="w-4 h-4" />
                                        Síntesis Doctrinal de Lecciones para este Municipio:
                                    </h4>
                                    <p className="text-sm text-purple-200 leading-relaxed font-medium">
                                        {memoria.lecciones_aprendidas_caf_indeci.sintesis_lecciones}
                                    </p>
                                </div>

                                <div className="mt-5 space-y-3">
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                                        Decálogo de Prevención Táctica Municipal Recomendado:
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                                        <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-start gap-2.5">
                                            <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs shrink-0">
                                                1
                                            </span>
                                            <div>
                                                <strong className="text-white block">Descolmatación Inmediata:</strong>
                                                <span className="text-slate-400">
                                                    Limpieza de cauces y retiro de desmonte en puntos de estrangulamiento antes del inicio de lluvias.
                                                </span>
                                            </div>
                                        </div>

                                        <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-start gap-2.5">
                                            <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs shrink-0">
                                                2
                                            </span>
                                            <div>
                                                <strong className="text-white block">Revisión de Diques y Defensas:</strong>
                                                <span className="text-slate-400">
                                                    Los diques de arena sin geobolsas ni enrocado fallaron en 1998 y 2017. Exija consolidación técnica.
                                                </span>
                                            </div>
                                        </div>

                                        <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-start gap-2.5">
                                            <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs shrink-0">
                                                3
                                            </span>
                                            <div>
                                                <strong className="text-white block">Empadronamiento EDAN Preventivo:</strong>
                                                <span className="text-slate-400">
                                                    Censo preliminar de familias en faja marginal para despacho inmediato de ayuda humanitaria FONDEN.
                                                </span>
                                            </div>
                                        </div>

                                        <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-start gap-2.5">
                                            <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs shrink-0">
                                                4
                                            </span>
                                            <div>
                                                <strong className="text-white block">Aseguramiento de Salud y Agua:</strong>
                                                <span className="text-slate-400">
                                                    Protección de pozos tubulares contra anegamiento y abastecimiento de sales de rehidratación y motobombas.
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-5 pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
                                    <span>Fuentes oficiales auditadas:</span>
                                    <div className="flex flex-wrap gap-2">
                                        {memoria.lecciones_aprendidas_caf_indeci.fuentes_validadas.map((f, idx) => (
                                            <span key={idx} className="px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                                                ✓ {f}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* PESTAÑA 7: PREDICTOR ANÁLOGO 7 DÍAS (OPEN-METEO PRO) */}
                    {activeTab === "predictor" && (
                        <div className="space-y-6">
                            <div className="p-5 bg-slate-900 border border-orange-500/40 rounded-2xl shadow-xl">
                                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-orange-500/20 border border-orange-500/40 flex items-center justify-center text-orange-400">
                                            <Sparkles className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h3 className="text-base font-bold text-white flex items-center gap-2">
                                                <span>Modelado Predictivo de Análogos a 7 Días</span>
                                                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-orange-500/20 text-orange-300 border border-orange-500/40">
                                                    OPEN-METEO PRO ECMWF IFS (9 KM)
                                                </span>
                                            </h3>
                                            <p className="text-xs text-slate-400">
                                                Correlación multivariable de horizonte extendido contra eventos FEN 1982-1983, 1997-1998 y 2017 en {memoria.distrito} ({memoria.cuenca_principal})
                                            </p>
                                        </div>
                                    </div>
                                    {analogData && (
                                        <div className="flex items-center gap-2 text-xs">
                                            <span className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 font-mono">
                                                Margen Crítico: <strong className="text-amber-400">{analogData.dia_maximo_riesgo.horas_anticipacion}h</strong>
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {analogData ? (
                                    <div className="mt-5 space-y-6">
                                        {/* Horizonte de 7 Días: Tarjetas Día a Día */}
                                        <div>
                                            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3 flex items-center gap-2">
                                                <Clock className="w-4 h-4 text-orange-400" />
                                                Evolución Proyectada Día a Día (Día +1 a Día +7):
                                            </h4>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2.5">
                                                {analogData.horizonte_7_dias.map((d) => (
                                                    <div
                                                        key={d.dia_numero}
                                                        className={`p-3 rounded-xl border flex flex-col justify-between transition-all ${
                                                            d.nivel_alerta_anticipada === "ROJA"
                                                                ? "bg-red-950/40 border-red-500/60 shadow-md shadow-red-950/40"
                                                                : d.nivel_alerta_anticipada === "NARANJA"
                                                                ? "bg-orange-950/30 border-orange-500/50"
                                                                : d.nivel_alerta_anticipada === "AMARILLA"
                                                                ? "bg-amber-950/20 border-amber-500/40"
                                                                : "bg-slate-950 border-slate-800"
                                                        }`}
                                                    >
                                                        <div>
                                                            <div className="flex items-center justify-between">
                                                                <span className="text-[11px] font-black text-white">
                                                                    Día +{d.dia_numero}
                                                                </span>
                                                                <span
                                                                    className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                                                                        d.nivel_alerta_anticipada === "ROJA"
                                                                            ? "bg-red-500 text-slate-950 font-black"
                                                                            : d.nivel_alerta_anticipada === "NARANJA"
                                                                            ? "bg-orange-500 text-slate-950 font-black"
                                                                            : d.nivel_alerta_anticipada === "AMARILLA"
                                                                            ? "bg-amber-500 text-slate-950 font-black"
                                                                            : "bg-emerald-900/60 text-emerald-300"
                                                                    }`}
                                                                >
                                                                    {d.nivel_alerta_anticipada}
                                                                </span>
                                                            </div>
                                                            <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                                                                {d.dia_semana} {d.fecha.slice(5)}
                                                            </div>
                                                            <div className="text-[10px] text-slate-500 font-mono">
                                                                +{d.horas_anticipacion}h
                                                            </div>
                                                        </div>

                                                        <div className="my-2.5 py-2 border-y border-slate-800/80">
                                                            <div className="text-[10px] text-slate-400">Precip. FEN:</div>
                                                            <div className="text-lg font-black text-sky-400">
                                                                {d.lluvia_extrema_estimada_mm} <span className="text-[10px]">mm</span>
                                                            </div>
                                                            <div className="text-[9px] text-slate-500">
                                                                Crudo: {d.lluvia_proyectada_openmeteo_mm} mm
                                                            </div>
                                                        </div>

                                                        <div className="space-y-1 text-[10px]">
                                                            <div className="flex justify-between text-slate-400">
                                                                <span>Factor FEN:</span>
                                                                <strong className="text-orange-400 font-mono">{d.factor_amplificacion_fen}x</strong>
                                                            </div>
                                                            <div className="flex justify-between text-slate-400">
                                                                <span>Similitud:</span>
                                                                <strong className="text-amber-300 font-mono">{d.similitud_analoga_pct}%</strong>
                                                            </div>
                                                            <div className="flex justify-between text-slate-400">
                                                                <span>Temp:</span>
                                                                <span className="text-slate-300 font-mono">{d.temperatura_min}°/{d.temperatura_max}°</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Explicación Técnica del Factor de Amplificación y Anti-Alucinación */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
                                                <h4 className="text-xs font-bold uppercase tracking-wider text-orange-400 mb-2 flex items-center gap-2">
                                                    <Gauge className="w-4 h-4" />
                                                    ¿Por qué se aplica el Factor Amplificador FEN (M_FEN)?
                                                </h4>
                                                <p className="text-xs text-slate-300 leading-relaxed">
                                                    Los modelos de predicción numérica global como el <strong>ECMWF IFS</strong> predicen la lámina bruta de precipitación atmosférica.
                                                    Sin embargo, durante eventos El Niño registrados en el Perú (CAF 1998, Cuadro IV-1), la persistencia de lluvias previas satura el suelo
                                                    y colmata los lechos de los ríos con sedimentos. Esto provoca que una lluvia moderada (ej. 15 mm) genere escorrentías e inundaciones
                                                    equivalentes a <strong>{analogData.dia_maximo_riesgo.factor_amplificacion_fen} veces</strong> su volumen normal.
                                                </p>
                                                <div className="mt-3 p-2.5 bg-orange-950/20 border border-orange-900/30 rounded-lg text-[11px] text-orange-200">
                                                    <strong>Fórmula de Transvase:</strong> Lluvia_Proyectada = Precipitación_ECMWF × Factor_FEN(Similitud_Vectorial)
                                                </div>
                                            </div>

                                            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
                                                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-2 flex items-center gap-2">
                                                    <CheckCircle2 className="w-4 h-4" />
                                                    Garantía de Cero Alucinación del Agente Predictivo
                                                </h4>
                                                <p className="text-xs text-slate-300 leading-relaxed">
                                                    El motor de análogos opera exclusivamente con el <strong>Catálogo Maestro FEN</strong> auditado a partir de los documentos oficiales
                                                    de la <strong>CAF</strong>, <strong>SENAMHI</strong> e <strong>INDECI</strong>. Si un municipio no cuenta con infraestructura
                                                    o antecedentes directos en la cuenca, el sistema no inventa datos: asigna un factor neutro de <strong>1.0x</strong>, semáforo <strong>VERDE</strong>
                                                    y lista vacía de obras en peligro.
                                                </p>
                                                <div className="mt-3 flex items-center gap-2 text-[11px] text-slate-400">
                                                    <span className="text-emerald-400">✓</span> 17 Cuencas Estratégicas delimitadas con coordenadas y lecciones reales.
                                                </div>
                                            </div>
                                        </div>

                                        {/* Inventario de Infraestructura Vulnerable CAF para esta Cuenca */}
                                        <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
                                            <h4 className="text-xs font-bold uppercase tracking-wider text-rose-400 mb-3 flex items-center gap-2">
                                                <ShieldAlert className="w-4 h-4" />
                                                Inventario de Infraestructura Crítica en la Cuenca (Fuente: CAF 1998, Vol. V):
                                            </h4>
                                            {analogData.infraestructura_amenazada_caf.length > 0 ? (
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                                    {analogData.infraestructura_amenazada_caf.map((inf, idx) => (
                                                        <div key={idx} className="p-3 bg-slate-900/80 rounded-lg border border-slate-800 text-xs">
                                                            <div className="flex items-center justify-between mb-1">
                                                                <strong className="text-white">
                                                                    {inf.nombre || inf.tramo}
                                                                </strong>
                                                                <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 font-mono">
                                                                    {inf.tipo}
                                                                </span>
                                                            </div>
                                                            <p className="text-[11px] text-slate-300 leading-snug">
                                                                {inf.riesgo_historico || inf.impacto || inf.patron_dano}
                                                            </p>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p className="text-xs text-slate-400 italic">
                                                    No se registran obras hidráulicas ni puentes críticos de alta vulnerabilidad inventariados por la CAF en este distrito específico.
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="p-8 text-center text-slate-400">
                                        <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-orange-400" />
                                        <span>Calculando análogos históricos para este distrito...</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* PESTAÑA 8: RADAR NACIONAL DE 17 CUENCAS FEN */}
                    {activeTab === "radar" && (
                        <div className="space-y-6">
                            <div className="p-5 bg-slate-900 border border-red-500/40 rounded-2xl shadow-xl">
                                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-400">
                                            <Compass className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h3 className="text-base font-bold text-white flex items-center gap-2">
                                                <span>Radar Nacional de las 17 Cuencas Estratégicas del FEN</span>
                                                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-500/20 text-red-300 border border-red-500/40">
                                                    COEN • MONITOREO MULTI-CUENCA
                                                </span>
                                            </h3>
                                            <p className="text-xs text-slate-400">
                                                Red nacional de alerta temprana de 7 días evaluando en paralelo todas las cuencas vulnerables del Perú
                                            </p>
                                        </div>
                                    </div>

                                    {radarData && (
                                        <div className="flex items-center gap-3">
                                            <div className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs">
                                                <span className="text-slate-400">Cuencas en Alerta: </span>
                                                <strong className="text-red-400">
                                                    {(radarData.resumen_semaforo.cuencas_alerta_roja || 0) +
                                                     (radarData.resumen_semaforo.cuencas_alerta_naranja || 0) +
                                                     (radarData.resumen_semaforo.cuencas_alerta_amarilla || 0)}
                                                </strong>
                                                <span className="text-slate-500"> / {radarData.total_cuencas_vigiladas}</span>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Filtros por Macro-Región */}
                                <div className="flex items-center gap-2 mt-4 flex-wrap">
                                    <span className="text-xs font-semibold text-slate-400 mr-2">Filtrar por Región:</span>
                                    {["TODAS", "Costa Norte", "Costa Centro", "Costa Sur", "Sierra Sur"].map((region) => (
                                        <button
                                            key={region}
                                            onClick={() => setRadarFilter(region)}
                                            className={`px-3 py-1 rounded-lg text-xs font-semibold transition border ${
                                                radarFilter === region
                                                    ? "bg-red-600 text-white border-red-500 shadow-sm"
                                                    : "bg-slate-950 text-slate-400 hover:text-white border-slate-800"
                                            }`}
                                        >
                                            {region}
                                        </button>
                                    ))}
                                </div>

                                {/* Grid de las 17 Cuencas */}
                                {radarData ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-5">
                                        {radarData.cuencas
                                            .filter((c) => radarFilter === "TODAS" || c.region_macro === radarFilter)
                                            .map((c) => (
                                                <div
                                                    key={c.cuenca_id}
                                                    className={`p-4 rounded-xl border flex flex-col justify-between transition-all hover:border-slate-600 ${
                                                        c.nivel_alerta === "ROJA"
                                                            ? "bg-red-950/30 border-red-500/50"
                                                            : c.nivel_alerta === "NARANJA"
                                                            ? "bg-orange-950/25 border-orange-500/40"
                                                            : c.nivel_alerta === "AMARILLA"
                                                            ? "bg-amber-950/20 border-amber-500/30"
                                                            : "bg-slate-950/80 border-slate-800"
                                                    }`}
                                                >
                                                    <div>
                                                        <div className="flex items-center justify-between gap-2 mb-2">
                                                            <span
                                                                className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider ${
                                                                    c.nivel_alerta === "ROJA"
                                                                        ? "bg-red-500 text-slate-950"
                                                                        : c.nivel_alerta === "NARANJA"
                                                                        ? "bg-orange-500 text-slate-950"
                                                                        : c.nivel_alerta === "AMARILLA"
                                                                        ? "bg-amber-500 text-slate-950"
                                                                        : "bg-emerald-900/60 text-emerald-300"
                                                                }`}
                                                            >
                                                                {c.nivel_alerta}
                                                            </span>
                                                            <span className="text-[10px] font-mono text-slate-400">
                                                                +{c.horas_anticipacion}h (Día +{c.dia_critico_numero})
                                                            </span>
                                                        </div>

                                                        <h4 className="text-sm font-bold text-white leading-tight">
                                                            {c.cuenca_nombre}
                                                        </h4>
                                                        <span className="text-[11px] text-slate-400 font-medium block mt-0.5">
                                                            {c.region_macro} • Distrito foco: <strong className="text-slate-200">{c.distrito_centinela}</strong>
                                                        </span>

                                                        <div className="grid grid-cols-2 gap-2 mt-3 p-2.5 bg-slate-900/90 rounded-lg border border-slate-800 text-[11px]">
                                                            <div>
                                                                <span className="text-slate-400 block text-[10px]">Similitud Análoga</span>
                                                                <strong className="text-amber-300 font-mono">{c.similitud_analoga_pct}%</strong>
                                                            </div>
                                                            <div>
                                                                <span className="text-slate-400 block text-[10px]">Factor FEN</span>
                                                                <strong className="text-orange-400 font-mono">{c.factor_amplificacion}x</strong>
                                                            </div>
                                                            <div className="col-span-2 pt-1 border-t border-slate-800/80 flex items-center justify-between">
                                                                <span className="text-slate-400 text-[10px]">Precipitación Pico:</span>
                                                                <strong className="text-sky-400 font-mono">{c.lluvia_extrema_amplificada_mm} mm</strong>
                                                            </div>
                                                        </div>

                                                        <div className="mt-2.5 text-[10px] text-slate-400">
                                                            Correlación: <span className="text-slate-300">{c.evento_referencia}</span>
                                                        </div>
                                                    </div>

                                                    <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                                                        <span className="text-[10px] text-slate-500">
                                                            {c.puentes_en_riesgo_caf} puentes en peligro (CAF)
                                                        </span>
                                                        <button
                                                            onClick={() => {
                                                                handleSelectDistrito(c.ubigeo);
                                                                setActiveTab("predictor");
                                                            }}
                                                            className="flex items-center gap-1 text-xs font-bold text-sky-400 hover:text-sky-300 transition"
                                                        >
                                                            <span>Auditar en Consola</span>
                                                            <ChevronRight className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                    </div>
                                ) : (
                                    <div className="p-12 text-center text-slate-400">
                                        <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-red-400" />
                                        <span>Escaneando las 17 cuencas en tiempo real con Open-Meteo Pro...</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* PESTAÑA 9: MATRIZ BIVALENTE FEN (RIESGOS VS. OPORTUNIDADES) */}
                    {activeTab === "bivalente" && (
                        <div className="space-y-6">
                            <div className="p-5 bg-slate-900 border border-teal-500/40 rounded-2xl shadow-xl">
                                <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
                                    <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-400">
                                        <Layers className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="text-base font-bold text-white flex items-center gap-2">
                                            <span>Matriz Bivalente del Fenómeno El Niño: Riesgos Destructivos vs. Oportunidades Territoriales</span>
                                        </h3>
                                        <p className="text-xs text-slate-400">
                                            Doctrina SENAMHI (Dossier 2014, Pág. 19-25) &amp; CAF: El Niño no solo es destrucción, transforma la hidrología y genera bonanza si el Estado planifica.
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                                    {/* Columna 1: Impactos Destructivos a Mitigar */}
                                    <div className="p-5 bg-red-950/20 border border-red-900/40 rounded-xl space-y-4">
                                        <div className="flex items-center gap-2 pb-2 border-b border-red-900/40">
                                            <AlertTriangle className="w-5 h-5 text-red-400" />
                                            <h4 className="text-sm font-black uppercase tracking-wider text-red-300">
                                                Impactos Destructivos a Mitigar (Plan de Contingencia)
                                            </h4>
                                        </div>

                                        <div className="space-y-3 text-xs text-slate-300">
                                            <div className="p-3 bg-slate-950 rounded-lg border border-red-950">
                                                <strong className="text-white block mb-1">1. Socavación y Colapso de Puentes Troncales:</strong>
                                                En 1983, 1998 y 2017 colapsaron puentes como Independencia, Bolognesi, Sánchez Cerro y Huambacho.
                                                La falla no es por el tirante de agua, sino por la socavación profunda de estribos y pilas en lechos arenosos.
                                            </div>

                                            <div className="p-3 bg-slate-950 rounded-lg border border-red-950">
                                                <strong className="text-white block mb-1">2. Aislamiento Territorial Prolongado:</strong>
                                                Corte de la Panamericana Norte y vías de penetración andina. Caseríos rurales quedan aislados entre 18 y 45 días sin acceso a alimentos ni medicinas.
                                            </div>

                                            <div className="p-3 bg-slate-950 rounded-lg border border-red-950">
                                                <strong className="text-white block mb-1">3. Siniestro Agrícola &amp; Colapso de Bocatomas:</strong>
                                                Anegamiento de cultivos de exportación (mango, banano, uva, algodón) y colmatación violenta de canales matrices por huaicos en valles costeros.
                                            </div>

                                            <div className="p-3 bg-slate-950 rounded-lg border border-red-950">
                                                <strong className="text-white block mb-1">4. Crisis Sanitaria Post-Inundación:</strong>
                                                Proliferación de aguas estancadas, detonando epidemias de dengue, zika, chikungunya y brotes diarreicos por contaminación de redes de agua potable.
                                            </div>
                                        </div>
                                    </div>

                                    {/* Columna 2: Oportunidades Territoriales a Explotar */}
                                    <div className="p-5 bg-teal-950/20 border border-teal-900/40 rounded-xl space-y-4">
                                        <div className="flex items-center gap-2 pb-2 border-b border-teal-900/40">
                                            <Sprout className="w-5 h-5 text-teal-400" />
                                            <h4 className="text-sm font-black uppercase tracking-wider text-teal-300">
                                                Oportunidades Territoriales a Explotar (Plan de Desarrollo)
                                            </h4>
                                        </div>

                                        <div className="space-y-3 text-xs text-slate-300">
                                            <div className="p-3 bg-slate-950 rounded-lg border border-teal-950">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="text-base">💧</span>
                                                    <strong className="text-white">Recarga Masiva de Acuíferos Subterráneos:</strong>
                                                </div>
                                                Las lluvias extraordinarias recargan las napas freáticas de los valles áridos de Piura, Lambayeque e Ica, asegurando reservas hídricas para los siguientes 5 a 10 años de agricultura tecnificada.
                                            </div>

                                            <div className="p-3 bg-slate-950 rounded-lg border border-teal-950">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="text-base">🌳</span>
                                                    <strong className="text-white">Pastizales y Bosques Secos en Sechura:</strong>
                                                </div>
                                                Aparición de la gigantesca <em>Laguna La Niña</em> en el desierto de Sechura. Explosión de pastos naturales para ganado caprino y regeneración masiva de bosques secos de algarrobo y zapote.
                                            </div>

                                            <div className="p-3 bg-slate-950 rounded-lg border border-teal-950">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="text-base">🐟</span>
                                                    <strong className="text-white">Pesca Pelágica de Aguas Cálidas:</strong>
                                                </div>
                                                Mientras la anchoveta migra hacia el sur, aguas cálidas traen abundancia de especies de alto valor comercial: Perico / Dorado (<em>Coryphaena hippurus</em>), Atún de aleta amarilla, Barrilete y bonanza de langostinos en los manglares.
                                            </div>

                                            <div className="p-3 bg-slate-950 rounded-lg border border-teal-950">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="text-base">🌾</span>
                                                    <strong className="text-white">Agricultura en Zonas Áridas de Ciclo Corto:</strong>
                                                </div>
                                                Tierras usualmente yermas adquieren humedad suficiente para sembrar maíz, frijol y cucurbitáceas con cosechas récord de ciclo corto si el campesinado recibe semillas a tiempo.
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Decálogo de Coordinación Interinstitucional */}
                                <div className="mt-6 p-4 bg-slate-950 rounded-xl border border-slate-800">
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-2 flex items-center gap-2">
                                        <Building2 className="w-4 h-4" />
                                        Directiva Bivalente para Alcaldes y Autoridades Regionales:
                                    </h4>
                                    <p className="text-xs text-slate-300 leading-relaxed">
                                        La gestión del riesgo moderno (Ley N° 29664 SINAGERD) exige no solo una postura reactiva de socorro ante el desastre,
                                        sino una <strong>visión prospectiva</strong>: canalizar los excedentes de agua hacia depresiones desérticas para crear reservorios naturales,
                                        habilitar créditos de emergencia para pesca pelágica y coordinar con el MINAGRI la entrega de forraje e insumos veterinarios para aprovechar
                                        la biomasa vegetal temporal.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <div className="p-16 text-center bg-slate-900/50 border border-slate-800 rounded-2xl">
                    <AlertTriangle className="w-10 h-10 text-amber-400 mx-auto mb-3" />
                    <h3 className="font-bold text-slate-200">Municipio no encontrado</h3>
                    <p className="text-xs text-slate-500 mt-1">
                        Verifique que el código UBIGEO o nombre de distrito coincida con el catálogo nacional del INEI.
                    </p>
                </div>
            )}

            {/* Modal de Exportación de Dossier Ejecutivo Oficial (Fase 4) */}
            <DossierExportModal
                isOpen={showDossierModal}
                onClose={() => setShowDossierModal(false)}
                ubigeo={currentUbigeo}
                distritoNombre={memoria?.distrito || "Distrito"}
                departamento={memoria?.departamento || "LIMA"}
            />
        </div>
    );
}
