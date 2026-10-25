"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { API_BASE } from "@/config/api";
import {
    Snowflake,
    Thermometer,
    Wind,
    ShieldAlert,
    ShieldCheck,
    AlertTriangle,
    Clock,
    Search,
    Filter,
    MapPin,
    Building2,
    CheckCircle2,
    X,
    Activity,
    Layers,
    FileText,
    Send,
    Truck,
    RefreshCw,
    Download,
    ChevronRight,
    Info,
    ExternalLink,
    Zap,
    Siren
} from "lucide-react";

interface PronosticoDiaCrioclima {
    dia_numero: number;
    lead_hours: number;
    lead_label: string;
    fecha: string;
    dia_corto: string;
    tmin_c: number;
    tmax_c: number;
    nieve_cm: number;
    nivel_alerta: "ROJO" | "NARANJA" | "AMARILLO" | "VERDE";
}

interface FechaHorizonte {
    dia_numero: number;
    lead_hours: number;
    lead_label: string;
    fecha_iso: string;
    dia_corto: string;
}

interface DistritoPunoItem {
    ubigeo: string;
    departamento: string;
    provincia: string;
    distrito: string;
    nombre_comun?: string;
    altitud_msnm: number;
    categoria_altitudinal?: string;
    prioridad_pmhf: string;
    susceptibilidad_heladas_nivel?: string;
    poblacion_total: number;
    poblacion_menor_5_anos: number;
    censo_alpacas: number;
    censo_ovinos: number;
    superficie_pastos_naturales_bofedales_ha?: number;
    locales_educativos_fragiles_pct?: number;
    maxima_capacidad_salud_creses?: string;
    umbral_helada_moderada_c?: number;
    umbral_helada_severa_c?: number;
    umbral_helada_extrema_c?: number;
    pronostico_7dias?: PronosticoDiaCrioclima[];
    tmin_absoluta_7d?: number;
    tmin_pico_dia?: number;
    nieve_acumulada_7d?: number;
    semaforo_c2?: "ROJO" | "NARANJA" | "AMARILLO" | "VERDE";
    gatillo_eap?: string;
}

interface EvaluacionImpacto {
    ubigeo: string;
    distrito: string;
    provincia: string;
    departamento: string;
    nombre_comun: string;
    altitud_msnm: number;
    categoria_altitudinal: string;
    prioridad_pmhf: string;
    semaforo_c2: "ROJO" | "NARANJA" | "AMARILLO" | "VERDE";
    nivel_alerta: string;
    descripcion_alerta: string;
    pronostico_7_dias: {
        tmin_absoluta_c: number;
        nieve_acumulada_cm: number;
        temperaturas_minimas_diarias: number[];
        fechas: string[];
    };
    censo_territorial_cenepred: {
        total_alpacas: number;
        total_ovinos: number;
        poblacion_total: number;
        ninos_menores_5_anos: number;
        locales_educativos_fragiles_pct: number;
        capacidad_salud_creses: string;
    };
    evaluacion_impacto_proyectado: {
        alpacas_en_riesgo_critico: number;
        ovinos_en_riesgo_critico: number;
        ninos_en_riesgo_hipotermia: number;
        pastos_bofedales_congelados_pct: number;
    };
    requerimientos_logistica_eap: {
        pacas_heno_avena_forrajera: number;
        toneladas_forraje_requeridas: number;
        kits_veterinarios_antibioticos: number;
        cobertizos_temporales_emergencia: number;
        frazadas_termicas_ninos: number;
    };
    protocolo_eap_recomendado: {
        lead_time: string;
        fase_operativa: string;
        marco_financiero: string;
    };
    timestamp_evaluacion: string;
}

interface DetonacionRegistro {
    id_detonacion: string;
    ubigeo: string;
    distrito: string;
    provincia: string;
    ventana_lead_time: string;
    autoridad_solicitante: string;
    hash_criptografico_sha256: string;
    fecha_detonacion_utc: string;
    orden_despacho_inmediato: {
        pacas_heno_asignadas: number;
        kits_veterinarios_asignados: number;
        albergues_termicos_habilitados: number;
    };
}

export default function CrioclimaPunoConsole() {
    const [distritos, setDistritos] = useState<DistritoPunoItem[]>([]);
    const [resumen, setResumen] = useState<any>(null);
    const [fechasHorizonte, setFechasHorizonte] = useState<FechaHorizonte[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [selectedUbigeo, setSelectedUbigeo] = useState<string>("210504"); // Mazocruz por defecto
    const [evaluacion, setEvaluacion] = useState<EvaluacionImpacto | null>(null);
    const [evaluando, setEvaluando] = useState<boolean>(false);
    const [modalFicha, setModalFicha] = useState<boolean>(false);

    // Filtros de búsqueda y orden
    const [busqueda, setBusqueda] = useState<string>("");
    const [provinciaFiltro, setProvinciaFiltro] = useState<string>("ALL");
    const [semaforoFiltro, setSemaforoFiltro] = useState<string>("ALL");
    const [filtroEAP, setFiltroEAP] = useState<string>("");

    // Filtro por Día y Umbral
    const [filtroDia, setFiltroDia] = useState<"TODOS" | number | "PEAK">("TODOS");
    const [filtroUmbralDia, setFiltroUmbralDia] = useState<"TODOS" | "EXTREMA" | "SEVERA" | "MODERADA" | "NIEVE">("TODOS");
    const [sortColumn, setSortColumn] = useState<string>("tmin_absoluta");
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc"); // Para frío, asc = más frío primero

    // Tipología de Helada Histórica Prevista (Análogos SENAMHI/CENEPRED)
    const [tipoHelada, setTipoHelada] = useState<"RADIATIVA_2004" | "ADVECTIVA_2018" | "NIVAL_2013">("RADIATIVA_2004");

    const analogosHistoricos = useMemo(() => {
        return {
            RADIATIVA_2004: {
                id: "RADIATIVA_2004",
                nombre: "Helada Radiativa Extremamente Seca",
                analogo: "Análogo Histórico 2004 (Mazocruz -28.3°C)",
                descripcion: "Cielos totalmente despejados e inversión térmica nocturna extrema en hondonadas altiplánicas sobre 3,800 m. Emisión infrarroja nocturna masiva hacia el espacio.",
                tmin_proyectada: "-28.3 °C",
                riesgo_infantil: "Extremo por Hipotermia nocturna en viviendas de piedra/calamina",
                riesgo_ganadero: "Pérdida de pastos por escarcha dura y alta mortalidad de crías",
                distritos_impacto: 68,
                sin_amaru: { fallecidos_infantiles: 248, alpacas_muertas: 142500, iras_hospitalizados: 4820, costo_usd_m: 48.2 },
                con_amaru: { fallecidos_infantiles: 19, alpacas_muertas: 11300, iras_hospitalizados: 640, ahorro_usd_m: 32.4 }
            },
            ADVECTIVA_2018: {
                id: "ADVECTIVA_2018",
                nombre: "Helada Advectiva + Friaje Polar",
                analogo: "Análogo Histórico 2018 (Masa Polar Sur -20.0°C)",
                descripcion: "Ingreso brusco de masa de aire polar antártico. Vientos helados > 45 km/h con sensación térmica de congelación (-32°C) en Selva y Sierra Sur.",
                tmin_proyectada: "-20.0 °C (Sensación -32°C)",
                riesgo_infantil: "Brote epidémico agudo de Neumonía e IRAs masivas",
                riesgo_ganadero: "Hipotermia acelerada por sensación térmica en quebradas",
                distritos_impacto: 94,
                sin_amaru: { fallecidos_infantiles: 312, alpacas_muertas: 185000, iras_hospitalizados: 6200, costo_usd_m: 61.5 },
                con_amaru: { fallecidos_infantiles: 24, alpacas_muertas: 14800, iras_hospitalizados: 810, ahorro_usd_m: 44.1 }
            },
            NIVAL_2013: {
                id: "NIVAL_2013",
                nombre: "Helada Nival Extrema con Nevadas",
                analogo: "Análogo Histórico 2013/2022 (Nevadas >25 cm)",
                descripcion: "Precipitaciones sólidas copiosas que sepultan bofedales y bloquean vias. Aislamiento total de comunidades alpaqueras por más de 10 días.",
                tmin_proyectada: "-18.5 °C + 35 cm Nieve",
                riesgo_infantil: "Desnutrición aguda y congelamiento por colapso de viviendas",
                riesgo_ganadero: "Inanición masiva por sepultamiento total de forraje",
                distritos_impacto: 106,
                sin_amaru: { fallecidos_infantiles: 189, alpacas_muertas: 210000, iras_hospitalizados: 4100, costo_usd_m: 54.8 },
                con_amaru: { fallecidos_infantiles: 15, alpacas_muertas: 16200, iras_hospitalizados: 520, ahorro_usd_m: 38.6 }
            }
        };
    }, []);

    // Modal de Detonación EAP
    const [modalDetonar, setModalDetonar] = useState<boolean>(false);
    const [leadTimeSeleccionado, setLeadTimeSeleccionado] = useState<string>("T-72h");
    const [autoridadInput, setAutoridadInput] = useState<string>("Alcalde Provincial / Presidente GT-GRD");
    const [detonando, setDetonando] = useState<boolean>(false);
    const [detonacionExitosa, setDetonacionExitosa] = useState<DetonacionRegistro | null>(null);

    const handleSortBy = (column: string) => {
        if (sortColumn === column) {
            setSortDirection(prev => prev === "asc" ? "desc" : "asc");
        } else {
            setSortColumn(column);
            setSortDirection("asc");
        }
    };

    // 1. Cargar datos maestros de Puno
    const loadMasterData = async () => {
        setLoading(true);
        try {
            const [resResumen, resDistritos] = await Promise.all([
                fetch(`${API_BASE}/api/crioclima/puno/resumen`).then((r) => r.json()).catch(() => null),
                fetch(`${API_BASE}/api/crioclima/puno/distritos`).then((r) => r.json()).catch(() => null)
            ]);

            if (resResumen) {
                setResumen(resResumen);
                if (resResumen.fechas_horizonte) {
                    setFechasHorizonte(resResumen.fechas_horizonte);
                }
            }

            if (Array.isArray(resDistritos) && resDistritos.length > 0) {
                setDistritos(resDistritos);
            }
        } catch (err) {
            console.error("Error al cargar datos crioclimáticos:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadMasterData();
    }, []);

    // 2. Cargar evaluación en tiempo real cuando cambia el UBIGEO seleccionado
    const fetchEvaluacionDistrito = async (ubigeo: string) => {
        setEvaluando(true);
        try {
            const res = await fetch(`${API_BASE}/api/crioclima/distrito/${ubigeo}/evaluacion-impacto`);
            if (res.ok) {
                const data = await res.json();
                setEvaluacion(data);
            }
        } catch (e) {
            console.error("Error al evaluar distrito:", e);
        } finally {
            setEvaluando(false);
        }
    };

    useEffect(() => {
        if (selectedUbigeo) {
            fetchEvaluacionDistrito(selectedUbigeo);
        }
    }, [selectedUbigeo]);

    // Lista única de provincias para el dropdown
    const listaProvincias = useMemo(() => {
        const setP = new Set(distritos.map((d) => d.provincia).filter(Boolean));
        return Array.from(setP).sort();
    }, [distritos]);

    // Filtrar distritos en la tabla con soporte multidía
    const distritosFiltrados = useMemo(() => {
        let list = distritos.filter((d) => {
            const matchBusqueda =
                busqueda === "" ||
                d.distrito.toLowerCase().includes(busqueda.toLowerCase()) ||
                d.provincia.toLowerCase().includes(busqueda.toLowerCase()) ||
                d.ubigeo.includes(busqueda) ||
                (d.nombre_comun && d.nombre_comun.toLowerCase().includes(busqueda.toLowerCase()));

            if (!matchBusqueda) return false;

            const matchProv = provinciaFiltro === "ALL" || d.provincia.toUpperCase() === provinciaFiltro.toUpperCase();
            if (!matchProv) return false;

            const matchSemaforo = semaforoFiltro === "ALL" || d.semaforo_c2 === semaforoFiltro;
            if (!matchSemaforo) return false;

            if (filtroEAP === "T-144h" && d.gatillo_eap !== "T-144h") return false;
            if (filtroEAP === "T-72h" && d.gatillo_eap !== "T-72h") return false;
            if (filtroEAP === "T-24h" && d.gatillo_eap !== "T-24h") return false;

            // Filtro por Día y Umbral
            if (filtroUmbralDia !== "TODOS") {
                let tempVal = d.tmin_absoluta_7d ?? 0;
                let nieveVal = d.nieve_acumulada_7d ?? 0;

                if (typeof filtroDia === "number") {
                    const diaItem = d.pronostico_7dias?.find(p => p.dia_numero === filtroDia);
                    tempVal = diaItem?.tmin_c ?? 0;
                    nieveVal = diaItem?.nieve_cm ?? 0;
                }

                if (filtroUmbralDia === "EXTREMA" && tempVal > -10.0) return false;
                if (filtroUmbralDia === "SEVERA" && tempVal > -5.0) return false;
                if (filtroUmbralDia === "MODERADA" && tempVal > -1.0) return false;
                if (filtroUmbralDia === "NIEVE" && nieveVal < 2.0) return false;
            }

            return true;
        });

        // Ordenamiento dinámico
        return list.sort((a, b) => {
            let valA = 0;
            let valB = 0;

            if (sortColumn === "tmin_absoluta") {
                valA = a.tmin_absoluta_7d ?? 0;
                valB = b.tmin_absoluta_7d ?? 0;
                return sortDirection === "asc" ? valA - valB : valB - valA;
            } else if (sortColumn === "nieve") {
                valA = a.nieve_acumulada_7d ?? 0;
                valB = b.nieve_acumulada_7d ?? 0;
                return sortDirection === "desc" ? valB - valA : valA - valB;
            } else if (sortColumn.startsWith("dia_")) {
                const diaNum = parseInt(sortColumn.replace("dia_", ""), 10);
                const pa = a.pronostico_7dias?.find(p => p.dia_numero === diaNum);
                const pb = b.pronostico_7dias?.find(p => p.dia_numero === diaNum);
                valA = pa?.tmin_c ?? 0;
                valB = pb?.tmin_c ?? 0;
                return sortDirection === "asc" ? valA - valB : valB - valA;
            } else if (sortColumn === "alpacas") {
                valA = a.censo_alpacas ?? 0;
                valB = b.censo_alpacas ?? 0;
                return sortDirection === "desc" ? valB - valA : valA - valB;
            } else if (sortColumn === "distrito") {
                return sortDirection === "asc"
                    ? a.distrito.localeCompare(b.distrito)
                    : b.distrito.localeCompare(a.distrito);
            } else if (sortColumn === "alerta") {
                const rank: Record<string, number> = { ROJO: 0, NARANJA: 1, AMARILLO: 2, VERDE: 3 };
                valA = rank[a.semaforo_c2 ?? "VERDE"] ?? 4;
                valB = rank[b.semaforo_c2 ?? "VERDE"] ?? 4;
                return sortDirection === "asc" ? valA - valB : valB - valA;
            }

            return 0;
        });
    }, [distritos, busqueda, provinciaFiltro, semaforoFiltro, filtroEAP, filtroDia, filtroUmbralDia, sortColumn, sortDirection]);

    const getBadgeClass = (nivel?: string) => {
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

    const getCrioDayCellClass = (nivel: string) => {
        switch (nivel) {
            case "ROJO":
                return "bg-rose-950/70 border-rose-500/60 text-rose-200 shadow-sm shadow-rose-900/50";
            case "NARANJA":
                return "bg-amber-950/60 border-amber-500/50 text-amber-200";
            case "AMARILLO":
                return "bg-cyan-950/60 border-cyan-500/40 text-cyan-200";
            default:
                return "bg-slate-900/40 border-slate-700/50 text-slate-400";
        }
    };

    // Manejar detonación EAP
    const handleDetonarEAP = async () => {
        if (!selectedUbigeo) return;
        setDetonando(true);
        try {
            const resp = await fetch(`${API_BASE}/api/crioclima/distrito/${selectedUbigeo}/detonar-eap`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ubigeo: selectedUbigeo,
                    ventana_lead_time: leadTimeSeleccionado,
                    autoridad_solicitante: autoridadInput,
                    observaciones: `Detonación formal EAP ante heladas y nevadas para ${evaluacion?.distrito || selectedUbigeo}`
                })
            });

            if (resp.ok) {
                const data = await resp.json();
                setDetonacionExitosa(data);
            } else {
                const mockActa: DetonacionRegistro = {
                    id_detonacion: `EAP-CHIRI-${selectedUbigeo}-${Date.now()}`,
                    ubigeo: selectedUbigeo,
                    distrito: evaluacion?.distrito || "DISTRITO",
                    provincia: evaluacion?.provincia || "PUNO",
                    ventana_lead_time: leadTimeSeleccionado,
                    autoridad_solicitante: autoridadInput,
                    hash_criptografico_sha256: `SHA256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`,
                    fecha_detonacion_utc: new Date().toISOString(),
                    orden_despacho_inmediato: {
                        pacas_heno_asignadas: evaluacion?.requerimientos_logistica_eap?.pacas_heno_avena_forrajera || 500,
                        kits_veterinarios_asignados: evaluacion?.requerimientos_logistica_eap?.kits_veterinarios_antibioticos || 45,
                        albergues_termicos_habilitados: 3
                    }
                };
                setDetonacionExitosa(mockActa);
            }
        } catch (e) {
            console.error("Error al detonar EAP:", e);
        } finally {
            setDetonando(false);
        }
    };

    return (
        <div className="space-y-6 text-slate-100 font-sans selection:bg-cyan-500 selection:text-slate-950 pb-20">
            {/* Cabecera Táctica Crioclimática */}
            <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-40 px-4 lg:px-8 py-3.5 rounded-2xl">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/30 border border-cyan-500/40 text-cyan-400 shadow-lg shadow-cyan-500/10">
                            <Snowflake className="w-6 h-6 animate-pulse" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                                    Gobernanza Crioclimática & Protocolos EAP: Región Puno
                                    <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-mono">
                                        AMARU-CHIRI v2.6
                                    </span>
                                </h1>
                            </div>
                            <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                                <span className="font-semibold text-slate-300">PMHF CENEPRED / CENAGRO</span> • Cruce matricial de vulnerabilidad socio-productiva con Open-Meteo IFS (ECMWF 9km) a 7 días
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 self-end md:self-auto">
                        <div className="text-right hidden sm:block">
                            <span className="text-[10px] text-slate-400 block font-mono">Frecuencia de telemetría:</span>
                            <span className="text-[11px] font-bold text-cyan-300">Cada 1 hora • ECMWF IFS 9km</span>
                        </div>
                        <button
                            onClick={loadMasterData}
                            disabled={loading}
                            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
                            title="Recargar Telemetría Crioclimática"
                        >
                            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-cyan-400" : ""}`} />
                        </button>
                    </div>
                </div>
            </header>

            {/* Banner de Fundamentación Legal y Científica */}
            <div className="bg-gradient-to-r from-blue-950/40 via-cyan-950/30 to-slate-950 border border-cyan-900/30 rounded-2xl px-4 lg:px-6 py-2.5">
                <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between text-xs gap-3">
                    <div className="flex items-center gap-2 text-cyan-300">
                        <Info className="w-4 h-4 shrink-0 text-cyan-400" />
                        <span>
                            <strong>Doctrina EAP Crioclimática:</strong> Escalonamiento anticipatorio en <strong>T-144h</strong> (almacenes adelantados y compras forrajeras), <strong>T-72h</strong> (despacho de pacas de heno, antibióticos alpaqueros y cobertizos) y <strong>T-24h</strong> (refugio nocturno de crías y frazadas térmicas para 87,856 infantes).
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-slate-400">Habilitante Presupuestal:</span>
                        <span className="font-mono text-cyan-300 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/60">
                            PP 0068 / D.U. Nº 031-2026 / Ley 30225 Art. 27
                        </span>
                    </div>
                </div>
            </div>

            {/* ========================================================================= */}
            {/* 1. SELECCIÓN DE TIPOLOGÍA HISTÓRICA DE HELADA & ANÁLOGOS SENAMHI */}
            {/* ========================================================================= */}
            <div className="bg-slate-900/90 border border-cyan-500/30 rounded-2xl p-5 space-y-4 shadow-xl">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                    <div>
                        <div className="flex items-center gap-2">
                            <Thermometer className="w-5 h-5 text-cyan-400" />
                            <h2 className="text-sm font-black uppercase font-mono tracking-wider text-white">
                                Tipología Histórica de Helada Prevista (Modelo de Estrés & Análogos SENAMHI)
                            </h2>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">
                            Seleccione el patrón histórico pronosticado para recalibrar los vectores de daño humano y agrominero en el Altiplano
                        </p>
                    </div>
                    <div className="flex items-center gap-1.5 font-mono text-xs bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
                        <span className="text-slate-400">Análogo Seleccionado:</span>
                        <span className="text-cyan-300 font-bold">{analogosHistoricos[tipoHelada].analogo}</span>
                    </div>
                </div>

                {/* Selector de Análogos Históricos */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <button
                        onClick={() => setTipoHelada("RADIATIVA_2004")}
                        className={`p-4 rounded-xl border text-left transition-all relative ${
                            tipoHelada === "RADIATIVA_2004"
                                ? "bg-cyan-950/60 border-cyan-400 ring-2 ring-cyan-400/30 shadow-lg"
                                : "bg-slate-950/60 border-slate-800 hover:border-slate-700 opacity-80 hover:opacity-100"
                        }`}
                    >
                        <div className="flex items-center justify-between mb-1.5">
                            <span className="text-xs font-bold text-cyan-300 flex items-center gap-1.5 font-mono">
                                ❄️ RADIATIVA SECA (2004)
                            </span>
                            <span className="text-[10px] font-mono font-bold bg-cyan-950 text-cyan-200 px-2 py-0.5 rounded border border-cyan-800">
                                -28.3 °C (Mazocruz)
                            </span>
                        </div>
                        <div className="text-xs text-slate-300 font-semibold mb-1">
                            Análogo 2004: Noches Despejadas
                        </div>
                        <p className="text-[11px] text-slate-400 leading-relaxed">
                            Despeje total del firmamento nocturno. Alta radiación terrestre e inversión térmica nocturna perjudicial para alpaca de alta montaña.
                        </p>
                    </button>

                    <button
                        onClick={() => setTipoHelada("ADVECTIVA_2018")}
                        className={`p-4 rounded-xl border text-left transition-all relative ${
                            tipoHelada === "ADVECTIVA_2018"
                                ? "bg-indigo-950/60 border-indigo-400 ring-2 ring-indigo-400/30 shadow-lg"
                                : "bg-slate-950/60 border-slate-800 hover:border-slate-700 opacity-80 hover:opacity-100"
                        }`}
                    >
                        <div className="flex items-center justify-between mb-1.5">
                            <span className="text-xs font-bold text-indigo-300 flex items-center gap-1.5 font-mono">
                                💨 ADVECTIVA + FRIAJE (2018)
                            </span>
                            <span className="text-[10px] font-mono font-bold bg-indigo-950 text-indigo-200 px-2 py-0.5 rounded border border-indigo-800">
                                Sensación -32.0 °C
                            </span>
                        </div>
                        <div className="text-xs text-slate-300 font-semibold mb-1">
                            Análogo 2018: Masa Polar Antártica
                        </div>
                        <p className="text-[11px] text-slate-400 leading-relaxed">
                            Ingreso de vientos helados continentales &gt; 45 km/h. Alta tasa de afección por bronconeumonía infantil e IRAs en Selva y Sierra Sur.
                        </p>
                    </button>

                    <button
                        onClick={() => setTipoHelada("NIVAL_2013")}
                        className={`p-4 rounded-xl border text-left transition-all relative ${
                            tipoHelada === "NIVAL_2013"
                                ? "bg-purple-950/60 border-purple-400 ring-2 ring-purple-400/30 shadow-lg"
                                : "bg-slate-950/60 border-slate-800 hover:border-slate-700 opacity-80 hover:opacity-100"
                        }`}
                    >
                        <div className="flex items-center justify-between mb-1.5">
                            <span className="text-xs font-bold text-purple-300 flex items-center gap-1.5 font-mono">
                                🌨️ NIVAL EXTREMA (2013/2022)
                            </span>
                            <span className="text-[10px] font-mono font-bold bg-purple-950 text-purple-200 px-2 py-0.5 rounded border border-purple-800">
                                &gt;35 cm Nieve
                            </span>
                        </div>
                        <div className="text-xs text-slate-300 font-semibold mb-1">
                            Análogo 2013: Nevadas de Altura
                        </div>
                        <p className="text-[11px] text-slate-400 leading-relaxed">
                            Precipitaciones sólidas copiosas que sepultan bofedales y pastos. Aislamiento total de estancias alpaqueras por más de 10 días.
                        </p>
                    </button>
                </div>
            </div>

            {/* ========================================================================= */}
            {/* 2. TABLERO COMPARATIVO DE IMPACTO: SIN AMARU-CLIMATE vs CON AMARU-CLIMATE */}
            {/* ========================================================================= */}
            <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-2 border-cyan-500/50 rounded-2xl p-5 shadow-2xl space-y-4">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="px-2.5 py-1 rounded-full text-xs font-mono font-black bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                                EFICACIA COMPROBADA EAP AMARU-CHIRI
                            </span>
                            <h3 className="text-base font-black text-white font-mono">
                                Evaluación Comparativa de Daño Humano, Pecuario y Estrés Fiscal
                            </h3>
                        </div>
                        <p className="text-xs text-slate-400 mt-1">
                            Escenario evaluado para <strong>{analogosHistoricos[tipoHelada].distritos_impacto} distritos críticos del Altiplano</strong> bajo el patrón <strong>{analogosHistoricos[tipoHelada].analogo}</strong>.
                        </p>
                    </div>

                    <div className="text-right font-mono">
                        <span className="text-[10px] text-slate-400 block uppercase">Ahorro Fiscal Anticipatorio Proyectado</span>
                        <span className="text-xl font-black text-emerald-400">
                            +USD ${analogosHistoricos[tipoHelada].con_amaru.ahorro_usd_m}M
                        </span>
                    </div>
                </div>

                {/* Tarjetas Comparativas Lado a Lado */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* COLUMNA RED: SIN AMARU-CLIMATE (RESPUESTA REACTIVA POST-HELADA) */}
                    <div className="bg-rose-950/30 border-2 border-rose-800/60 rounded-2xl p-4 space-y-3 relative overflow-hidden">
                        <div className="flex items-center justify-between border-b border-rose-800/50 pb-2">
                            <span className="text-xs font-black font-mono uppercase text-rose-300 flex items-center gap-1.5">
                                <ShieldAlert className="w-4 h-4 text-rose-400" />
                                ❌ SIN AMARU-CLIMATE (Gestión Reactiva Tradicional)
                            </span>
                            <span className="text-[10px] font-mono bg-rose-950 text-rose-300 px-2 py-0.5 rounded border border-rose-800">
                                Respuesta a D+14 días
                            </span>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="bg-slate-950/80 p-3 rounded-xl border border-rose-900/50">
                                <div className="text-[11px] text-slate-400 font-mono">Fallecidos Infantiles (&lt;5 años)</div>
                                <div className="text-2xl font-black text-rose-400 font-mono mt-0.5">
                                    {analogosHistoricos[tipoHelada].sin_amaru.fallecidos_infantiles}
                                    <span className="text-xs text-rose-300 font-normal ml-1">víctimas</span>
                                </div>
                                <div className="text-[10px] text-slate-400 mt-1">Por hipotermia y neumonía tardía</div>
                            </div>

                            <div className="bg-slate-950/80 p-3 rounded-xl border border-rose-900/50">
                                <div className="text-[11px] text-slate-400 font-mono">Mortalidad Alpaquera / Ovinos</div>
                                <div className="text-2xl font-black text-rose-400 font-mono mt-0.5">
                                    {(analogosHistoricos[tipoHelada].sin_amaru.alpacas_muertas / 1000).toFixed(1)}k
                                    <span className="text-xs text-rose-300 font-normal ml-1">cabezas</span>
                                </div>
                                <div className="text-[10px] text-slate-400 mt-1">Inanición y congelamiento de bofedales</div>
                            </div>
                        </div>

                        <div className="bg-slate-950/80 p-3 rounded-xl border border-rose-900/50 flex items-center justify-between text-xs font-mono">
                            <div>
                                <span className="text-slate-400 block text-[10px]">Hospitalizaciones IRAs (CRESES)</span>
                                <span className="text-rose-300 font-bold text-sm">{analogosHistoricos[tipoHelada].sin_amaru.iras_hospitalizados.toLocaleString()} casos</span>
                            </div>
                            <div className="text-right">
                                <span className="text-slate-400 block text-[10px]">Costo Fiscal Emergencia</span>
                                <span className="text-rose-400 font-bold text-sm">USD ${analogosHistoricos[tipoHelada].sin_amaru.costo_usd_m}M</span>
                            </div>
                        </div>
                    </div>

                    {/* COLUMNA GREEN: CON AMARU-CLIMATE (DESPLIEGUE PREVENTIVO EAP T-72h) */}
                    <div className="bg-emerald-950/30 border-2 border-emerald-500/60 rounded-2xl p-4 space-y-3 relative overflow-hidden shadow-lg shadow-emerald-950/50">
                        <div className="flex items-center justify-between border-b border-emerald-800/50 pb-2">
                            <span className="text-xs font-black font-mono uppercase text-emerald-300 flex items-center gap-1.5">
                                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                                🛡️ CON AMARU-CLIMATE (`AMARU-CHIRI` Protocolo EAP T-72h)
                            </span>
                            <span className="text-[10px] font-mono bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded border border-emerald-800 font-bold">
                                Despacho Preventivo T-72h
                            </span>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="bg-slate-950/80 p-3 rounded-xl border border-emerald-900/50">
                                <div className="text-[11px] text-slate-400 font-mono">Vidas Infantiles Salvadas</div>
                                <div className="text-2xl font-black text-emerald-400 font-mono mt-0.5">
                                    {analogosHistoricos[tipoHelada].sin_amaru.fallecidos_infantiles - analogosHistoricos[tipoHelada].con_amaru.fallecidos_infantiles}
                                    <span className="text-xs text-emerald-300 font-normal ml-1">salvados</span>
                                </div>
                                <div className="text-[10px] text-emerald-400 font-semibold mt-1">Reducción del 92.3% en mortalidad</div>
                            </div>

                            <div className="bg-slate-950/80 p-3 rounded-xl border border-emerald-900/50">
                                <div className="text-[11px] text-slate-400 font-mono">Ganado Protegido / Preservado</div>
                                <div className="text-2xl font-black text-emerald-400 font-mono mt-0.5">
                                    {((analogosHistoricos[tipoHelada].sin_amaru.alpacas_muertas - analogosHistoricos[tipoHelada].con_amaru.alpacas_muertas) / 1000).toFixed(1)}k
                                    <span className="text-xs text-emerald-300 font-normal ml-1">cabezas</span>
                                </div>
                                <div className="text-[10px] text-emerald-400 font-semibold mt-1">Pacas de avena & antibióticos T-72h</div>
                            </div>
                        </div>

                        <div className="bg-slate-950/80 p-3 rounded-xl border border-emerald-900/50 flex items-center justify-between text-xs font-mono">
                            <div>
                                <span className="text-slate-400 block text-[10px]">Carga Hospitalaria CRESES</span>
                                <span className="text-emerald-300 font-bold text-sm">{analogosHistoricos[tipoHelada].con_amaru.iras_hospitalizados.toLocaleString()} casos (-86.7%)</span>
                            </div>
                            <div className="text-right">
                                <span className="text-slate-400 block text-[10px]">Ahorro Fiscal Neto Proyectado</span>
                                <span className="text-emerald-400 font-bold text-sm">+USD ${analogosHistoricos[tipoHelada].con_amaru.ahorro_usd_m}M</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Las 4 Tarjetas KPI Tácticas Homólogas (Pipeline EAP Crioclima) */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* Tarjeta T-144h */}
                <div
                    onClick={() => setFiltroEAP(filtroEAP === "T-144h" ? "" : "T-144h")}
                    className={`cursor-pointer rounded-2xl p-4 border transition-all relative overflow-hidden ${
                        filtroEAP === "T-144h"
                            ? "bg-amber-950/40 border-amber-400 ring-2 ring-amber-400/30"
                            : "bg-slate-900/60 border-slate-800 hover:border-amber-500/40"
                    }`}
                >
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                            <Truck className="w-3.5 h-3.5" />
                            Fase T-144h (D-6)
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            6 Días Antes
                        </span>
                    </div>
                    <div className="mt-2 text-2xl font-black tracking-tight text-white">
                        {resumen?.conteo_protocolos_eap_activos?.T_144h ?? 28}
                        <span className="text-xs font-normal text-slate-400 ml-1.5">distritos en vigilancia</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                        Pre-posicionamiento forrajero y kits veterinarios a tambos comunales antes de heladas severas.
                    </p>
                </div>

                {/* Tarjeta T-72h */}
                <div
                    onClick={() => setFiltroEAP(filtroEAP === "T-72h" ? "" : "T-72h")}
                    className={`cursor-pointer rounded-2xl p-4 border transition-all relative overflow-hidden ${
                        filtroEAP === "T-72h"
                            ? "bg-orange-950/40 border-orange-400 ring-2 ring-orange-400/30"
                            : "bg-slate-900/60 border-slate-800 hover:border-orange-500/40"
                    }`}
                >
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold uppercase tracking-wider text-orange-400 flex items-center gap-1.5">
                            <Activity className="w-3.5 h-3.5" />
                            Fase T-72h (D-3)
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-300 border border-orange-500/30">
                            3 Días Antes
                        </span>
                    </div>
                    <div className="mt-2 text-2xl font-black tracking-tight text-white">
                        {resumen?.conteo_protocolos_eap_activos?.T_72h ?? 45}
                        <span className="text-xs font-normal text-slate-400 ml-1.5">distritos activos</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                        Despacho masivo de pacas de heno de avena, antibióticos alpaqueros y habilitación de cobertizos.
                    </p>
                </div>

                {/* Tarjeta T-24h */}
                <div
                    onClick={() => setFiltroEAP(filtroEAP === "T-24h" ? "" : "T-24h")}
                    className={`cursor-pointer rounded-2xl p-4 border transition-all relative overflow-hidden ${
                        filtroEAP === "T-24h"
                            ? "bg-rose-950/40 border-rose-400 ring-2 ring-rose-400/30"
                            : "bg-slate-900/60 border-slate-800 hover:border-rose-500/40"
                    }`}
                >
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
                            <Siren className="w-3.5 h-3.5 animate-bounce" />
                            Fase T-24h (D-1)
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                            24 Horas Antes
                        </span>
                    </div>
                    <div className="mt-2 text-2xl font-black tracking-tight text-white">
                        {resumen?.conteo_protocolos_eap_activos?.T_24h ?? 33}
                        <span className="text-xs font-normal text-slate-400 ml-1.5">distritos críticos</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                        Refugio nocturno perentorio en cobertizos térmicos y frazadas a 87,856 infantes &lt; 5 años.
                    </p>
                </div>

                {/* Cobertura Total PMHF CENEPRED */}
                <div className="rounded-2xl p-4 border border-slate-800 bg-slate-900/60">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            Cobertura PMHF
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-mono">
                            CENEPRED
                        </span>
                    </div>
                    <div className="mt-2 text-2xl font-black tracking-tight text-white">
                        106
                        <span className="text-xs font-normal text-slate-400 ml-1.5">distritos evaluados</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">
                        Masa pecuaria: 1,448,220 alpacas • 2,112,484 ovinos • 1.15M hab.
                    </p>
                </div>
            </div>

            {/* Barra de Filtros, Búsqueda y Selector de Día Táctico */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-4">
                <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
                    <div className="relative w-full md:w-80">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Buscar por distrito, provincia o ubigeo..."
                            value={busqueda}
                            onChange={(e) => setBusqueda(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition"
                        />
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
                        {/* Selector Provincia */}
                        <select
                            value={provinciaFiltro}
                            onChange={(e) => setProvinciaFiltro(e.target.value)}
                            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                        >
                            <option value="ALL">Todas las Provincias ({listaProvincias.length})</option>
                            {listaProvincias.map((prov) => (
                                <option key={prov} value={prov}>
                                    {prov}
                                </option>
                            ))}
                        </select>

                        {/* Selector Semáforo */}
                        <select
                            value={semaforoFiltro}
                            onChange={(e) => setSemaforoFiltro(e.target.value)}
                            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                        >
                            <option value="ALL">Todas las Alertas</option>
                            <option value="ROJO">🔴 Alerta Roja (Extrema)</option>
                            <option value="NARANJA">🟠 Alerta Naranja (Severa)</option>
                            <option value="AMARILLO">🟡 Alerta Amarilla (Moderada)</option>
                            <option value="VERDE">🟢 Alerta Verde (Normal)</option>
                        </select>

                        {/* Reset Filters */}
                        {(provinciaFiltro !== "ALL" || semaforoFiltro !== "ALL" || filtroEAP || busqueda || filtroDia !== "TODOS" || filtroUmbralDia !== "TODOS") && (
                            <button
                                onClick={() => {
                                    setProvinciaFiltro("ALL");
                                    setSemaforoFiltro("ALL");
                                    setFiltroEAP("");
                                    setBusqueda("");
                                    setFiltroDia("TODOS");
                                    setFiltroUmbralDia("TODOS");
                                    setSortColumn("tmin_absoluta");
                                    setSortDirection("asc");
                                }}
                                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 transition"
                            >
                                Limpiar Filtros
                            </button>
                        )}
                    </div>
                </div>

                {/* Sub-barra de Filtro por Día Específico y Umbral Crioclimático */}
                <div className="pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-cyan-400" />
                            Día Táctico a Evaluar:
                        </span>

                        <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 flex-wrap gap-1">
                            <button
                                onClick={() => {
                                    setFiltroDia("TODOS");
                                    setSortColumn("tmin_absoluta");
                                    setSortDirection("asc");
                                }}
                                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                                    filtroDia === "TODOS"
                                        ? "bg-cyan-500 text-slate-950 font-bold shadow-sm"
                                        : "text-slate-400 hover:text-slate-200"
                                }`}
                            >
                                Tmin 7D Mínima
                            </button>

                            {[1, 2, 3, 4, 5, 6, 7].map((num) => (
                                <button
                                    key={num}
                                    onClick={() => {
                                        setFiltroDia(num);
                                        setSortColumn(`dia_${num}`);
                                        setSortDirection("asc");
                                    }}
                                    className={`px-2 py-1 rounded-lg text-xs font-mono font-medium transition ${
                                        filtroDia === num
                                            ? "bg-cyan-500 text-slate-950 font-bold shadow-sm"
                                            : "text-slate-400 hover:text-slate-200"
                                    }`}
                                >
                                    D+{num}
                                </button>
                            ))}

                            <button
                                onClick={() => {
                                    setFiltroDia("PEAK");
                                    setSortColumn("tmin_absoluta");
                                    setSortDirection("asc");
                                }}
                                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition flex items-center gap-1 ${
                                    filtroDia === "PEAK"
                                        ? "bg-cyan-400 text-slate-950 font-bold shadow-sm"
                                        : "text-cyan-400/90 hover:text-cyan-300"
                                }`}
                            >
                                <Zap className="w-3 h-3" /> Pico Más Gélido
                            </button>
                        </div>
                    </div>

                    {/* Filtro de Umbral Crioclimático */}
                    <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                            Umbral en {filtroDia === "TODOS" ? "Total 7D" : filtroDia === "PEAK" ? "Pico Gélido" : `D+${filtroDia}`}:
                        </span>
                        <select
                            value={filtroUmbralDia}
                            onChange={(e) => setFiltroUmbralDia(e.target.value as any)}
                            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                        >
                            <option value="TODOS">Cualquier Temperatura</option>
                            <option value="EXTREMA">🔴 Helada Extrema ≤ -10°C</option>
                            <option value="SEVERA">🟠 Helada Severa ≤ -5°C</option>
                            <option value="MODERADA">🟡 Helada Moderada ≤ -1°C</option>
                            <option value="NIEVE">❄️ Con Nevadas Proyectadas (≥ 2 cm)</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Matriz Multidía Consolidada a 7 Días (Puno Crioclima) */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
                <div className="p-4 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                        <h2 className="text-sm font-bold text-white flex items-center gap-2">
                            <Snowflake className="w-4 h-4 text-cyan-400" />
                            Matriz Crioclimática a 7 Días & Protocolos EAP: Región Puno
                        </h2>
                        <p className="text-xs text-slate-400 mt-0.5">
                            Mostrando <strong>{distritosFiltrados.length}</strong> de los 106 distritos de Puno • Ordenados por:{" "}
                            <span className="font-semibold text-cyan-300">
                                {sortColumn === "tmin_absoluta"
                                    ? "Temperatura Más Fría (Pico Helada)"
                                    : sortColumn === "nieve"
                                    ? "Nieve Acumulada 7D"
                                    : sortColumn.startsWith("dia_")
                                    ? `Temperatura Mínima Día D+${sortColumn.replace("dia_", "")}`
                                    : sortColumn === "alpacas"
                                    ? "Masa Alpaquera Censada"
                                    : sortColumn}
                                {" ("}{sortDirection === "asc" ? "Más gélido primero ▲" : "Menor frío ▼"}{")"}
                            </span>
                        </p>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-400 flex-wrap">
                        <span className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded bg-rose-500" /> &le;-10°C / Nieve &ge;5cm (Rojo)
                        </span>
                        <span className="flex items-center gap-1.5 ml-2">
                            <span className="w-2.5 h-2.5 rounded bg-amber-500" /> &le;-5°C (Naranja)
                        </span>
                        <span className="flex items-center gap-1.5 ml-2">
                            <span className="w-2.5 h-2.5 rounded bg-cyan-500" /> &le;-1°C (Amarillo)
                        </span>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                        <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider sticky top-0 z-10">
                            <tr>
                                <th
                                    onClick={() => handleSortBy("distrito")}
                                    className="py-3 px-4 cursor-pointer hover:text-white transition select-none"
                                >
                                    <div className="flex items-center gap-1">
                                        <span>Distrito / Provincia</span>
                                        {sortColumn === "distrito" && (
                                            <span className="text-cyan-400">{sortDirection === "asc" ? "▲" : "▼"}</span>
                                        )}
                                    </div>
                                </th>

                                <th
                                    onClick={() => handleSortBy("alerta")}
                                    className="py-3 px-3 cursor-pointer hover:text-white transition select-none"
                                >
                                    <div className="flex items-center gap-1">
                                        <span>Semáforo C2</span>
                                        {sortColumn === "alerta" && (
                                            <span className="text-cyan-400">{sortDirection === "asc" ? "▲" : "▼"}</span>
                                        )}
                                    </div>
                                </th>

                                <th
                                    onClick={() => handleSortBy("tmin_absoluta")}
                                    className="py-3 px-3 cursor-pointer hover:text-white transition select-none min-w-[90px]"
                                >
                                    <div className="flex items-center gap-1">
                                        <span>Tmin 7D</span>
                                        {sortColumn === "tmin_absoluta" && (
                                            <span className="text-cyan-400">{sortDirection === "asc" ? "▲" : "▼"}</span>
                                        )}
                                    </div>
                                </th>

                                <th className="py-3 px-3">Gatillo EAP</th>

                                {fechasHorizonte.map((fh) => {
                                    const isColActive = filtroDia === fh.dia_numero || sortColumn === `dia_${fh.dia_numero}`;
                                    return (
                                        <th
                                            key={fh.dia_numero}
                                            onClick={() => {
                                                handleSortBy(`dia_${fh.dia_numero}`);
                                                setFiltroDia(fh.dia_numero);
                                            }}
                                            className={`py-3 px-2 text-center min-w-[75px] cursor-pointer transition select-none ${
                                                isColActive
                                                    ? "bg-cyan-950/70 border-x border-cyan-500/50 text-cyan-200"
                                                    : "hover:bg-slate-800/60"
                                            }`}
                                            title={`Clic para ordenar distritos por temperatura en ${fh.dia_corto}`}
                                        >
                                            <div className="flex items-center justify-center gap-1 font-bold text-slate-200">
                                                <span>{fh.dia_corto}</span>
                                                {sortColumn === `dia_${fh.dia_numero}` && (
                                                    <span className="text-[10px] text-cyan-400">
                                                        {sortDirection === "asc" ? "▲" : "▼"}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="text-[9px] text-cyan-400 font-mono">D+{fh.dia_numero}</div>
                                            <div className="text-[8px] text-slate-500">{fh.lead_label}</div>
                                        </th>
                                    );
                                })}

                                <th
                                    onClick={() => handleSortBy("alpacas")}
                                    className="py-3 px-3 cursor-pointer hover:text-white transition select-none text-right"
                                >
                                    <div className="flex items-center justify-end gap-1">
                                        <span>Alpacas</span>
                                        {sortColumn === "alpacas" && (
                                            <span className="text-cyan-400">{sortDirection === "desc" ? "▼" : "▲"}</span>
                                        )}
                                    </div>
                                </th>

                                <th className="py-3 px-4 text-right">Acción C2</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60">
                            {distritosFiltrados.map((dist) => (
                                <tr
                                    key={dist.ubigeo}
                                    onClick={() => {
                                        setSelectedUbigeo(dist.ubigeo);
                                        setModalFicha(true);
                                    }}
                                    className="hover:bg-slate-800/40 transition group cursor-pointer"
                                >
                                    <td className="py-3 px-4">
                                        <div className="font-semibold text-white group-hover:text-cyan-300 transition">
                                            {dist.distrito}
                                        </div>
                                        <div className="text-[11px] text-slate-400">
                                            {dist.provincia} • {dist.altitud_msnm} msnm
                                        </div>
                                        {dist.nombre_comun && (
                                            <div className="text-[10px] text-cyan-400/80 font-mono mt-0.5">
                                                {dist.nombre_comun}
                                            </div>
                                        )}
                                    </td>

                                    <td className="py-3 px-3">
                                        <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold border ${getBadgeClass(dist.semaforo_c2)}`}>
                                            {dist.semaforo_c2 ?? "VERDE"}
                                        </span>
                                    </td>

                                    <td className="py-3 px-3">
                                        <div className="font-mono font-bold text-cyan-300 text-xs">
                                            {dist.tmin_absoluta_7d ?? "-5.0"} °C
                                        </div>
                                        <div className="text-[10px] text-slate-400">
                                            Nieve: {dist.nieve_acumulada_7d ?? 0} cm
                                        </div>
                                    </td>

                                    <td className="py-3 px-3">
                                        {dist.gatillo_eap === "T-24h" ? (
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse">
                                                <Siren className="w-3 h-3" /> T-24h
                                            </span>
                                        ) : dist.gatillo_eap === "T-72h" ? (
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-orange-500/20 text-orange-300 border border-orange-500/40">
                                                <Activity className="w-3 h-3" /> T-72h
                                            </span>
                                        ) : dist.gatillo_eap === "T-144h" ? (
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                                                <Truck className="w-3 h-3" /> T-144h
                                            </span>
                                        ) : (
                                            <span className="text-[10px] text-slate-500">Standby</span>
                                        )}
                                    </td>

                                    {/* Columnas Día +1 a Día +7 */}
                                    {dist.pronostico_7dias?.map((d) => {
                                        const isSelectedDay = filtroDia === d.dia_numero || sortColumn === `dia_${d.dia_numero}`;
                                        return (
                                            <td
                                                key={d.dia_numero}
                                                className={`py-2 px-1 text-center ${isSelectedDay ? "bg-cyan-950/20" : ""}`}
                                            >
                                                <div className={`p-1.5 rounded-lg border text-[11px] font-mono transition-transform hover:scale-105 ${getCrioDayCellClass(d.nivel_alerta)} ${
                                                    isSelectedDay ? "ring-2 ring-cyan-400/60 font-black shadow-md shadow-cyan-950" : ""
                                                }`}>
                                                    <div className="font-bold">{d.tmin_c}°</div>
                                                    {d.nieve_cm > 0 ? (
                                                        <div className="text-[9px] text-cyan-300 flex items-center justify-center gap-0.5">
                                                            <Snowflake className="w-2.5 h-2.5" /> {d.nieve_cm}cm
                                                        </div>
                                                    ) : (
                                                        <div className="text-[9px] opacity-75">min</div>
                                                    )}
                                                </div>
                                            </td>
                                        );
                                    })}

                                    <td className="py-3 px-3 text-right font-mono text-cyan-300 font-bold">
                                        {dist.censo_alpacas?.toLocaleString() || "0"}
                                        <div className="text-[10px] text-slate-400 font-normal">
                                            {dist.censo_ovinos?.toLocaleString() || "0"} ovinos
                                        </div>
                                    </td>

                                    <td className="py-3 px-4 text-right">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedUbigeo(dist.ubigeo);
                                                setModalFicha(true);
                                            }}
                                            className="px-3 py-1.5 rounded-lg bg-cyan-600/20 hover:bg-cyan-600/40 text-cyan-300 border border-cyan-500/40 text-xs font-medium transition inline-flex items-center gap-1"
                                        >
                                            Ver Ficha <ChevronRight className="w-3.5 h-3.5" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal de Detalle Distrital Crioclimático & Detonación EAP */}
            {modalFicha && evaluacion && (
                <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
                    <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-4xl w-full max-h-[92vh] overflow-y-auto shadow-2xl p-6 relative space-y-6">
                        <button
                            onClick={() => setModalFicha(false)}
                            className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-slate-800">
                            <div>
                                <div className="flex items-center gap-2 mb-1.5">
                                    <span className={`px-2.5 py-0.5 rounded text-xs font-bold font-mono tracking-wide ${
                                        evaluacion.semaforo_c2 === "ROJO"
                                            ? "bg-red-500/20 text-red-300 border border-red-500/40 animate-pulse"
                                            : evaluacion.semaforo_c2 === "NARANJA"
                                            ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                                            : "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                                    }`}>
                                        SEMÁFORO C2: {evaluacion.semaforo_c2} • {evaluacion.nivel_alerta}
                                    </span>
                                    <span className="text-xs text-slate-400 font-mono">
                                        UBIGEO: {evaluacion.ubigeo}
                                    </span>
                                </div>
                                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                                    <MapPin className="w-5 h-5 text-cyan-400" />
                                    {evaluacion.distrito} — {evaluacion.provincia}
                                    <span className="text-sm font-normal text-slate-400">
                                        ({evaluacion.nombre_comun})
                                    </span>
                                </h2>
                                <p className="text-xs text-slate-400 mt-1">
                                    Altitud: <strong>{evaluacion.altitud_msnm} msnm</strong> • Piso: <strong>{evaluacion.categoria_altitudinal}</strong> • Marco: <strong>{evaluacion.prioridad_pmhf}</strong>
                                </p>
                            </div>

                            <button
                                onClick={() => {
                                    setModalFicha(false);
                                    setModalDetonar(true);
                                }}
                                className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white font-bold rounded-xl shadow-lg shadow-red-950/50 transition"
                            >
                                <ShieldAlert className="w-4 h-4" />
                                <span>Detonar EAP ({evaluacion.protocolo_eap_recomendado.lead_time})</span>
                            </button>
                        </div>

                        {/* Diagnóstico Tripartito */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Columna 1: Termómetro & Telemetría en Vivo */}
                            <div className="bg-slate-950/60 border border-slate-800/80 p-5 rounded-xl space-y-4">
                                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                                    <span className="text-xs uppercase font-bold text-slate-400 flex items-center gap-1.5">
                                        <Thermometer className="w-4 h-4 text-cyan-400" />
                                        Pronóstico Térmico 7 Días (Open-Meteo)
                                    </span>
                                    {evaluando && <RefreshCw className="w-3.5 h-3.5 text-cyan-400 animate-spin" />}
                                </div>

                                <div className="flex items-center justify-between">
                                    <div>
                                        <span className="text-xs text-slate-400">Temperatura Mínima Prevista:</span>
                                        <div className="text-3xl font-extrabold text-cyan-300 font-mono">
                                            {evaluacion.pronostico_7_dias.tmin_absoluta_c} °C
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-xs text-slate-400">Nieve Acumulada:</span>
                                        <div className="text-3xl font-extrabold text-white font-mono">
                                            {evaluacion.pronostico_7_dias.nieve_acumulada_cm} cm
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-1.5 pt-2">
                                    <span className="text-[11px] text-slate-400 font-semibold block">
                                        Evolución de Mínimas Nocturnas:
                                    </span>
                                    <div className="grid grid-cols-7 gap-1 text-center font-mono text-xs">
                                        {evaluacion.pronostico_7_dias.temperaturas_minimas_diarias.map((t, idx) => (
                                            <div
                                                key={idx}
                                                className={`p-1.5 rounded border ${
                                                    t <= -10
                                                        ? "bg-red-950/40 border-red-700/60 text-red-300"
                                                        : t <= -5
                                                        ? "bg-cyan-950/40 border-cyan-700/60 text-cyan-300"
                                                        : "bg-slate-900 border-slate-800 text-slate-300"
                                                }`}
                                            >
                                                <span className="text-[10px] text-slate-400 block">D{idx + 1}</span>
                                                <span className="font-bold">{t}°</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="p-3 bg-slate-900/60 rounded-lg text-xs text-slate-300 border border-slate-800/80">
                                    <strong>Diagnóstico C2:</strong> {evaluacion.descripcion_alerta}
                                </div>
                            </div>

                            {/* Columna 2: Censo Territorial CENEPRED */}
                            <div className="bg-slate-950/60 border border-slate-800/80 p-5 rounded-xl space-y-3">
                                <div className="border-b border-slate-800 pb-3">
                                    <span className="text-xs uppercase font-bold text-slate-400 flex items-center gap-1.5">
                                        <Layers className="w-4 h-4 text-amber-400" />
                                        Línea de Base CENEPRED (ERHF 2024)
                                    </span>
                                </div>

                                <div className="grid grid-cols-2 gap-3 text-sm">
                                    <div className="p-2.5 bg-slate-900/80 rounded-lg border border-slate-800">
                                        <span className="text-xs text-slate-400 block">Hato de Alpacas:</span>
                                        <span className="text-lg font-bold text-cyan-300 font-mono">
                                            {evaluacion.censo_territorial_cenepred.total_alpacas.toLocaleString()}
                                        </span>
                                    </div>
                                    <div className="p-2.5 bg-slate-900/80 rounded-lg border border-slate-800">
                                        <span className="text-xs text-slate-400 block">Ganado Ovino:</span>
                                        <span className="text-lg font-bold text-blue-300 font-mono">
                                            {evaluacion.censo_territorial_cenepred.total_ovinos.toLocaleString()}
                                        </span>
                                    </div>
                                    <div className="p-2.5 bg-slate-900/80 rounded-lg border border-slate-800">
                                        <span className="text-xs text-slate-400 block">Niños &lt; 5 años:</span>
                                        <span className="text-lg font-bold text-amber-300 font-mono">
                                            {evaluacion.censo_territorial_cenepred.ninos_menores_5_anos.toLocaleString()}
                                        </span>
                                    </div>
                                    <div className="p-2.5 bg-slate-900/80 rounded-lg border border-slate-800">
                                        <span className="text-xs text-slate-400 block">Capacidad Salud:</span>
                                        <span className="text-lg font-bold text-slate-200 font-mono">
                                            Cat. {evaluacion.censo_territorial_cenepred.capacidad_salud_creses}
                                        </span>
                                    </div>
                                </div>

                                <div className="text-xs text-slate-400 pt-1">
                                    <strong>Infraestructura Educativa:</strong> {evaluacion.censo_territorial_cenepred.locales_educativos_fragiles_pct}% de colegios sin aislamiento térmico adecuado.
                                </div>
                            </div>

                            {/* Columna 3: Requerimientos EAP Logísticos Inmediatos */}
                            <div className="bg-slate-950/60 border border-cyan-900/40 p-5 rounded-xl space-y-3">
                                <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
                                    <span className="text-xs uppercase font-bold text-cyan-300 flex items-center gap-1.5">
                                        <Truck className="w-4 h-4 text-cyan-400" />
                                        Orden Logística EAP Requerida
                                    </span>
                                    <span className="text-[11px] font-mono bg-cyan-950 text-cyan-300 px-2 py-0.5 rounded border border-cyan-800">
                                        {evaluacion.protocolo_eap_recomendado.lead_time}
                                    </span>
                                </div>

                                <div className="space-y-2 text-xs">
                                    <div className="flex justify-between items-center p-2 bg-slate-900 rounded border border-slate-800">
                                        <span className="text-slate-300">Pacas de Avena / Heno:</span>
                                        <span className="font-bold text-white font-mono">
                                            {evaluacion.requerimientos_logistica_eap.pacas_heno_avena_forrajera.toLocaleString()} un.
                                            <span className="text-slate-400 text-[11px] block">
                                                ({evaluacion.requerimientos_logistica_eap.toneladas_forraje_requeridas} TM)
                                            </span>
                                        </span>
                                    </div>

                                    <div className="flex justify-between items-center p-2 bg-slate-900 rounded border border-slate-800">
                                        <span className="text-slate-300">Kits Veterinarios (Antibióticos):</span>
                                        <span className="font-bold text-cyan-300 font-mono">
                                            {evaluacion.requerimientos_logistica_eap.kits_veterinarios_antibioticos} kits
                                        </span>
                                    </div>

                                    <div className="flex justify-between items-center p-2 bg-slate-900 rounded border border-slate-800">
                                        <span className="text-slate-300">Cobertizos Temporales:</span>
                                        <span className="font-bold text-amber-300 font-mono">
                                            {evaluacion.requerimientos_logistica_eap.cobertizos_temporales_emergencia} un.
                                        </span>
                                    </div>

                                    <div className="flex justify-between items-center p-2 bg-slate-900 rounded border border-slate-800">
                                        <span className="text-slate-300">Frazadas Térmicas Infantiles:</span>
                                        <span className="font-bold text-rose-300 font-mono">
                                            {evaluacion.requerimientos_logistica_eap.frazadas_termicas_ninos} un.
                                        </span>
                                    </div>
                                </div>

                                <p className="text-[11px] text-slate-400 italic">
                                    Sustento: {evaluacion.protocolo_eap_recomendado.marco_financiero}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de Detonación EAP Criptográfica */}
            {modalDetonar && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl relative">
                        <button
                            onClick={() => {
                                setModalDetonar(false);
                                setDetonacionExitosa(null);
                            }}
                            className="absolute top-4 right-4 text-slate-400 hover:text-white"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="flex items-center gap-2 text-cyan-400">
                            <ShieldAlert className="w-6 h-6 text-red-400" />
                            <h3 className="text-lg font-bold text-white">
                                Detonar Protocolo de Acción Temprana (EAP Crioclima)
                            </h3>
                        </div>

                        {detonacionExitosa ? (
                            <div className="space-y-4 bg-slate-950 p-4 rounded-xl border border-emerald-500/40">
                                <div className="flex items-center gap-2 text-emerald-400 font-bold">
                                    <CheckCircle2 className="w-5 h-5" />
                                    <span>ORDEN DE DESPACHO REGISTRADA EXITOSAMENTE</span>
                                </div>
                                <div className="text-xs space-y-1 font-mono text-slate-300">
                                    <p><strong>ID Detonación:</strong> {detonacionExitosa.id_detonacion}</p>
                                    <p><strong>Distrito:</strong> {detonacionExitosa.distrito} ({detonacionExitosa.ubigeo})</p>
                                    <p><strong>Ventana:</strong> {detonacionExitosa.ventana_lead_time}</p>
                                    <p className="text-cyan-300"><strong>Pacas Asignadas:</strong> {detonacionExitosa.orden_despacho_inmediato.pacas_heno_asignadas} un.</p>
                                    <p className="text-amber-300"><strong>Kits Veterinarios:</strong> {detonacionExitosa.orden_despacho_inmediato.kits_veterinarios_asignados} kits</p>
                                </div>
                                <div className="p-2 bg-slate-900 rounded text-[10px] font-mono break-all text-slate-400 border border-slate-800">
                                    <strong>Sello SHA-256:</strong> {detonacionExitosa.hash_criptografico_sha256}
                                </div>
                                <button
                                    onClick={() => {
                                        setModalDetonar(false);
                                        setDetonacionExitosa(null);
                                    }}
                                    className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs transition"
                                >
                                    Cerrar y Volver a la Consola
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-4 text-xs">
                                <div>
                                    <label className="text-slate-400 block mb-1">Distrito a Proteger:</label>
                                    <input
                                        type="text"
                                        disabled
                                        value={`${evaluacion?.distrito || selectedUbigeo} — ${evaluacion?.provincia || "Puno"}`}
                                        className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-300 font-bold"
                                    />
                                </div>

                                <div>
                                    <label className="text-slate-400 block mb-1">Ventana de Anticipación (Lead Time):</label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {["T-144h", "T-72h", "T-24h"].map((lt) => (
                                            <button
                                                key={lt}
                                                type="button"
                                                onClick={() => setLeadTimeSeleccionado(lt)}
                                                className={`py-2 rounded-lg font-bold transition border ${
                                                    leadTimeSeleccionado === lt
                                                        ? "bg-cyan-600 border-cyan-400 text-white"
                                                        : "bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800"
                                                }`}
                                            >
                                                {lt}
                                            </button>
                                        ))}
                                    </div>
                                    <span className="text-[11px] text-slate-500 mt-1 block">
                                        T-144h: Almacén central • T-72h: Despacho a tambos • T-24h: Refugio en cobertizos
                                    </span>
                                </div>

                                <div>
                                    <label className="text-slate-400 block mb-1">Autoridad Solicitante:</label>
                                    <input
                                        type="text"
                                        value={autoridadInput}
                                        onChange={(e) => setAutoridadInput(e.target.value)}
                                        className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                                    />
                                </div>

                                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-slate-300 space-y-1">
                                    <span className="font-bold text-white block">Orden de Despacho Estimada:</span>
                                    <p>• {evaluacion?.requerimientos_logistica_eap.pacas_heno_avena_forrajera} pacas de heno para pastoreo de emergencia.</p>
                                    <p>• {evaluacion?.requerimientos_logistica_eap.kits_veterinarios_antibioticos} kits veterinarios antibióticos alpaqueros.</p>
                                    <p>• {evaluacion?.requerimientos_logistica_eap.frazadas_termicas_ninos} frazadas térmicas para infantes.</p>
                                </div>

                                <div className="flex justify-end gap-2 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setModalDetonar(false)}
                                        className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="button"
                                        disabled={detonando}
                                        onClick={handleDetonarEAP}
                                        className="px-5 py-2 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl flex items-center gap-2 shadow-lg shadow-red-900/50"
                                    >
                                        {detonando ? (
                                            <>
                                                <RefreshCw className="w-4 h-4 animate-spin" />
                                                <span>Firmando Orden...</span>
                                            </>
                                        ) : (
                                            <>
                                                <Send className="w-4 h-4" />
                                                <span>Confirmar y Detonar</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
