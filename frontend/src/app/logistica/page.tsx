"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
    Truck,
    Navigation,
    AlertTriangle,
    ShieldAlert,
    CheckCircle2,
    Clock,
    Fuel,
    MapPin,
    Layers,
    RefreshCw,
    Sliders,
    Compass,
    Plane,
    Anchor,
    Users,
    Package,
    Droplets,
    Tent,
    Building2,
    Activity,
    ChevronRight,
    ArrowRight,
    Flame,
    FileText,
    ExternalLink,
    Map,
    ShieldCheck,
    Plus,
    Trash2,
    Send,
    Lock
} from "lucide-react";
import EmergencyLifecycleStepper from "@/components/EmergencyLifecycleStepper";

interface Coordenadas {
    lat: number;
    lon: number;
}

interface Almacen {
    id: string;
    nombre: string;
    codigo_sinpad: string;
    tipo: string;
    departamento: string;
    coordenadas: Coordenadas;
    capacidad_tn: number;
    stock_raciones_frias: number;
    stock_agua_lts: number;
    stock_carpas_familiares: number;
    estado_operativo: string;
}

interface Albergue {
    id: string;
    nombre: string;
    departamento: string;
    distrito: string;
    ubigeo: string;
    coordenadas: Coordenadas;
    poblacion_albergada: number;
    demanda_raciones_dia: number;
    demanda_agua_lts_dia: number;
    puente_critico_acceso: string;
    historico_incomunicacion_dias: number;
    solucion_historica: string;
    riesgo_aislamiento: string;
}

interface Vehiculo {
    tipo_id: string;
    nombre: string;
    descripcion: string;
    capacidad_carga_tn: number;
    km_por_galon: number;
    velocidad_asfalto_kmh: number;
    velocidad_desvio_kmh: number;
    tipo_combustible: string;
}

interface PuenteCritico {
    id: string;
    nombre: string;
    rio: string;
    departamento: string;
    caudal_gatillo_m3s: number;
    modo_falla: string;
    dias_incomunicacion: number;
    ruta_alterna: string;
    leccion_aprendida_caf: string;
}

interface ResumenSimulacion {
    total_puentes_cortados: number;
    albergues_incomunicados_puente_aereo: number;
    albergues_con_desvio_activo: number;
    albergues_con_transito_normal: number;
    poblacion_en_aislamiento_total: number;
    porcentaje_aislamiento_poblacional: number;
}

interface AlbergueSimulado {
    albergue_id: string;
    nombre: string;
    departamento: string;
    poblacion: number;
    estado_conectividad: string;
    semaforo: string;
    severidad: string;
    requiere_puente_aereo: boolean;
    tiempo_formateado: string;
    diesel_galones: number;
    distancia_km: number | null;
}

interface BloqueoVial {
    id: string;
    tipo_incidente: string;
    ubicacion: string;
    descripcion: string;
    puente_afectado?: string;
    arista_afectada?: string;
    reportado_por: string;
    severidad: string;
    timestamp: string;
    estado: string;
}

interface AristaVial {
    id: string;
    origen: string;
    destino: string;
    distancia_km: number;
    calzada: string;
    puentes: string[];
    es_desvio: boolean;
    descripcion_desvio?: string;
}

export default function LogisticaPage() {
    const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

    // Pestaña activa
    const [tabActiva, setTabActiva] = useState<"geovisor" | "ruteo" | "bloqueos" | "despacho-edan">("geovisor");

    // Estados de datos base
    const [almacenes, setAlmacenes] = useState<Almacen[]>([]);
    const [albergues, setAlbergues] = useState<Albergue[]>([]);
    const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]);
    const [puentes, setPuentes] = useState<PuenteCritico[]>([]);
    const [aristas, setAristas] = useState<AristaVial[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    // Selecciones de despacho
    const [origenId, setOrigenId] = useState<string>("ALM-JUNIN-HUANCAYO");
    const [destinoId, setDestinoId] = useState<string>("ALB-CHUPACA-YAUYOS");
    const [vehiculoId, setVehiculoId] = useState<string>("CAMION_PESADO_15T");

    // Puentes cortados en simulación
    const [puentesCortados, setPuentesCortados] = useState<string[]>([]);
    const [resultadoRuta, setResultadoRuta] = useState<any>(null);
    const [calculandoRuta, setCalculandoRuta] = useState<boolean>(false);

    // Bloqueos viales activos en tiempo real
    const [bloqueosActivos, setBloqueosActivos] = useState<BloqueoVial[]>([]);
    const [nuevoBloqueo, setNuevoBloqueo] = useState({
        tipo_incidente: "CRECIDA_RIO_COLAPSO_ESTRIBO",
        ubicacion: "Puente Cunas km 4.2, Chupaca",
        descripcion: "Crecida extraordinaria del Río Cunas genera socavación profunda en estribo izquierdo.",
        puente_afectado: "puente-cunas-chupaca",
        severidad: "CRITICO"
    });
    const [guardandoBloqueo, setGuardandoBloqueo] = useState<boolean>(false);

    // Despacho EDAN
    const [edanSeleccionadoId, setEdanSeleccionadoId] = useState<string>("EDAN-20261001-120901-0001");
    const [despachoResultado, setDespachoResultado] = useState<any>(null);
    const [despachandoEdan, setDespachandoEdan] = useState<boolean>(false);
    const [edanOrigenParams, setEdanOrigenParams] = useState<{
        edan_id?: string;
        distrito?: string;
        ubigeo?: string;
        familias?: string;
    } | null>(null);

    // Cross-Linking: Leer parámetros URL (?edan_id=...&puente_bloqueado=...&puente_foco=...)
    useEffect(() => {
        if (typeof window !== "undefined") {
            const params = new URLSearchParams(window.location.search);
            const edanId = params.get("edan_id");
            const distrito = params.get("distrito");
            const ubigeo = params.get("ubigeo");
            const familias = params.get("familias");
            const puenteBloqueado = params.get("puente_bloqueado");
            const puenteFoco = params.get("puente_foco");

            if (edanId) {
                setEdanSeleccionadoId(edanId);
                setEdanOrigenParams({
                    edan_id: edanId,
                    distrito: distrito || undefined,
                    ubigeo: ubigeo || undefined,
                    familias: familias || undefined
                });
            }
            if (puenteBloqueado) {
                setPuentesCortados((prev) => Array.from(new Set([...prev, puenteBloqueado])));
            } else if (puenteFoco) {
                setPuentesCortados((prev) => Array.from(new Set([...prev, puenteFoco])));
            }
        }
    }, []);

    // Simulacro Operacional Mega-FEN (Ground Truth 1998/2017)
    const [simulacroData, setSimulacroData] = useState<any>(null);
    const [ejecutandoSimulacro, setEjecutandoSimulacro] = useState<boolean>(false);

    // Simulación de red completa
    const [simulacionRed, setSimulacionRed] = useState<{
        resumen_simulacion: ResumenSimulacion;
        albergues: AlbergueSimulado[];
    } | null>(null);

    // Cargar catálogos y topología de red vial
    useEffect(() => {
        async function cargarDatos() {
            try {
                setLoading(true);
                const [resCat, resRed, resBloq] = await Promise.all([
                    fetch(`${API_BASE}/api/v1/logistica/catalogo`),
                    fetch(`${API_BASE}/api/v1/logistica/red-vial`),
                    fetch(`${API_BASE}/api/v1/logistica/bloqueos`)
                ]);

                if (resCat.ok) {
                    const data = await resCat.json();
                    setAlmacenes(data.almacenes_indeci || []);
                    setAlbergues(data.albergues_destinos || []);
                    setVehiculos(data.flota_vehiculos || []);
                    setPuentes(data.puentes_criticos || []);
                }

                if (resRed.ok) {
                    const redData = await resRed.json();
                    setAristas(redData.aristas || []);
                }

                if (resBloq.ok) {
                    const bloqData = await resBloq.json();
                    setBloqueosActivos(bloqData.bloqueos || []);
                }
            } catch (err) {
                console.error("Error al cargar catálogo logístico:", err);
            } finally {
                setLoading(false);
            }
        }
        cargarDatos();
    }, [API_BASE]);

    // Recalcular ruta al cambiar origen, destino, vehículo o puentes cortados
    useEffect(() => {
        if (!origenId || !destinoId) return;

        async function recalcular() {
            try {
                setCalculandoRuta(true);
                const res = await fetch(`${API_BASE}/api/v1/logistica/calcular-ruta`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        origen_id: origenId,
                        destino_id: destinoId,
                        tipo_vehiculo: vehiculoId,
                        puentes_cortados: puentesCortados
                    })
                });
                if (res.ok) {
                    const data = await res.json();
                    setResultadoRuta(data);
                }
            } catch (err) {
                console.error("Error al calcular ruta:", err);
            } finally {
                setCalculandoRuta(false);
            }
        }

        recalcular();
    }, [API_BASE, origenId, destinoId, vehiculoId, puentesCortados, bloqueosActivos]);

    // Ejecutar simulación global de la red
    useEffect(() => {
        async function correrSimulacionGlobal() {
            try {
                const res = await fetch(`${API_BASE}/api/v1/logistica/simular-red`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ puentes_cortados: puentesCortados })
                });
                if (res.ok) {
                    const data = await res.json();
                    setSimulacionRed(data);
                }
            } catch (err) {
                console.error("Error al simular red:", err);
            }
        }
        correrSimulacionGlobal();
    }, [API_BASE, puentesCortados]);

    // Manejador de corte individual de puente
    const togglePuente = (puenteId: string) => {
        setPuentesCortados(prev =>
            prev.includes(puenteId) ? prev.filter(id => id !== puenteId) : [...prev, puenteId]
        );
    };

    // Registrar nuevo bloqueo vial en tiempo real
    const registrarBloqueoHandler = async () => {
        try {
            setGuardandoBloqueo(true);
            const res = await fetch(`${API_BASE}/api/v1/logistica/bloqueos`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(nuevoBloqueo)
            });
            if (res.ok) {
                const data = await res.json();
                setBloqueosActivos(prev => [...prev, data.bloqueo]);
                if (nuevoBloqueo.puente_afectado && !puentesCortados.includes(nuevoBloqueo.puente_afectado)) {
                    setPuentesCortados(prev => [...prev, nuevoBloqueo.puente_afectado]);
                }
            }
        } catch (err) {
            console.error("Error al registrar bloqueo:", err);
        } finally {
            setGuardandoBloqueo(false);
        }
    };

    // Levantar bloqueo vial
    const eliminarBloqueoHandler = async (bloqueoId: string, puenteId?: string) => {
        try {
            const res = await fetch(`${API_BASE}/api/v1/logistica/bloqueos/${bloqueoId}`, {
                method: "DELETE"
            });
            if (res.ok) {
                setBloqueosActivos(prev => prev.filter(b => b.id !== bloqueoId));
                if (puenteId) {
                    setPuentesCortados(prev => prev.filter(p => p !== puenteId));
                }
            }
        } catch (err) {
            console.error("Error al eliminar bloqueo:", err);
        }
    };

    // Despachar orden formal EDAN
    const ejecutarDespachoEdanHandler = async (edanId: string) => {
        try {
            setDespachandoEdan(true);
            const res = await fetch(`${API_BASE}/api/v1/logistica/despachar-edan/${edanId}`, {
                method: "POST"
            });
            if (res.ok) {
                const data = await res.json();
                setDespachoResultado(data);
                if (data.almacen_origen?.id) setOrigenId(data.almacen_origen.id);
                if (data.albergue_destino?.id) setDestinoId(data.albergue_destino.id);
            }
        } catch (err) {
            console.error("Error al despachar orden EDAN:", err);
        } finally {
            setDespachandoEdan(false);
        }
    };

    // Presets
    const dispararSimulacroMegaFenHandler = async () => {
        try {
            setEjecutandoSimulacro(true);
            const res = await fetch(`${API_BASE}/api/v1/logistica/simulacro-mega-fen`, {
                method: "POST"
            });
            if (res.ok) {
                const data = await res.json();
                setSimulacroData(data);
                setPuentesCortados(data.puentes_cortados || []);
                setOrigenId("ALM-CHIMBOTE-REG");
                setDestinoId("ALB-VIRU-VICTORRAUL");
                setTabActiva("geovisor");
            }
        } catch (err) {
            console.error("Error al disparar simulacro Mega-FEN:", err);
        } finally {
            setEjecutandoSimulacro(false);
        }
    };

    const activarEscenarioChupacaCunas = () => {
        setOrigenId("ALM-JUNIN-HUANCAYO");
        setDestinoId("ALB-CHUPACA-YAUYOS");
        setPuentesCortados(prev => [...new Set([...prev, "puente-cunas-chupaca"])]);
        setTabActiva("geovisor");
    };

    const activarEscenarioMegaCrecida = () => {
        setPuentesCortados([
            "puente-viru-pe1n",
            "puente-reque-pe1n",
            "puente-sechin-casma",
            "puente-independencia-catacaos",
            "puente-la-leche-illimo",
            "puente-cunas-chupaca"
        ]);
        setTabActiva("ruteo");
    };

    const restablecerVias = () => {
        setPuentesCortados([]);
        setSimulacroData(null);
        bloqueosActivos.forEach(b => eliminarBloqueoHandler(b.id, b.puente_afectado));
    };

    // Proyección cartográfica para Geovisor SVG
    const proyectar = (lat: number, lon: number) => {
        const x = 50 + ((lon - (-81.5)) / 7.2) * 540;
        const y = 40 + ((lat - (-3.2)) / (-10.3)) * 620;
        return { x: Math.max(30, Math.min(620, x)), y: Math.max(30, Math.min(680, y)) };
    };

    // Mapa de coordenadas de nodos
    const mapaCoords = useMemo(() => {
        const map: Record<string, { x: number; y: number; nombre: string; tipo: "almacen" | "albergue" }> = {};
        almacenes.forEach(a => {
            const { x, y } = proyectar(a.coordenadas.lat, a.coordenadas.lon);
            map[a.id] = { x, y, nombre: a.nombre, tipo: "almacen" };
        });
        albergues.forEach(alb => {
            const { x, y } = proyectar(alb.coordenadas.lat, alb.coordenadas.lon);
            map[alb.id] = { x, y, nombre: alb.nombre, tipo: "albergue" };
        });
        // HUBs intermedios
        map["HUB-LIMA-NORTE"] = { x: 370, y: 535, nombre: "Hub Lima Norte (Ancón)", tipo: "almacen" };
        map["HUB-BARRANCA-PATIVILCA"] = { x: 320, y: 470, nombre: "Hub Barranca / Pativilca", tipo: "almacen" };
        map["HUB-CASMA"] = { x: 260, y: 400, nombre: "Hub Casma", tipo: "almacen" };
        map["HUB-PACASMAYO"] = { x: 195, y: 285, nombre: "Hub Pacasmayo", tipo: "almacen" };
        map["HUB-LA-OROYA"] = { x: 440, y: 540, nombre: "Hub La Oroya (Carretera Central)", tipo: "almacen" };
        return map;
    }, [almacenes, albergues]);

    const aristasRutaIds = useMemo(() => {
        if (!resultadoRuta?.ruta_efectiva?.aristas_ruta) return new Set<string>();
        return new Set<string>(resultadoRuta.ruta_efectiva.aristas_ruta.map((e: any) => e.id));
    }, [resultadoRuta]);

    const currentAlmacen = useMemo(() => almacenes.find(a => a.id === origenId), [almacenes, origenId]);
    const currentAlbergue = useMemo(() => albergues.find(a => a.id === destinoId), [albergues, destinoId]);
    const currentVehiculo = useMemo(() => vehiculos.find(v => v.tipo_id === vehiculoId), [vehiculos, vehiculoId]);

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-16">
            {/* Stepper del Ciclo de Vida de Emergencia */}
            <div className="max-w-7xl mx-auto px-6 pt-4">
                <EmergencyLifecycleStepper
                    currentStep="logistica"
                    distrito={edanOrigenParams?.distrito}
                    ubigeo={edanOrigenParams?.ubigeo}
                />

                {edanOrigenParams && (
                    <div className="mb-4 bg-sky-950/60 border border-sky-600/50 rounded-xl p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-sky-200">
                        <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-sky-400 animate-pulse" />
                            <span>
                                <strong>Despacho Vinculado a Ficha EDAN Oficial:</strong> ID <code className="bg-sky-900 px-1.5 py-0.5 rounded text-white font-mono">{edanOrigenParams.edan_id}</code>
                                {edanOrigenParams.distrito ? ` • Destino: ${edanOrigenParams.distrito}` : ""}
                                {edanOrigenParams.familias ? ` (${edanOrigenParams.familias} familias censadas)` : ""}
                            </span>
                        </div>
                        <Link
                            href={`/edan?ubigeo=${edanOrigenParams.ubigeo || ""}`}
                            className="text-sky-300 hover:text-white underline font-semibold flex items-center gap-1"
                        >
                            Ver Ficha EDAN ➔
                        </Link>
                    </div>
                )}
            </div>

            {/* ENCABEZADO TÁCTICO C2 */}
            <div className="border-b border-slate-800 bg-slate-900/90 backdrop-blur px-6 py-4 sticky top-0 z-30">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-xs font-mono font-bold px-2 py-0.5 rounded flex items-center gap-1">
                                <Truck className="w-3.5 h-3.5" /> FASE 2 • VRP LOGÍSTICA HUMANITARIA RESILIENTE ($0 COSTO)
                            </span>
                            <span className="bg-sky-500/20 text-sky-300 border border-sky-500/40 text-xs font-mono px-2 py-0.5 rounded">
                                LEY 29664 • DIRECTIVA EDAN PERÚ • CGR WORM
                            </span>
                            <span className="bg-rose-500/20 text-rose-300 border border-rose-500/40 text-xs font-mono px-2 py-0.5 rounded animate-pulse">
                                FEN 2026-2027
                            </span>
                        </div>
                        <h1 className="text-xl md:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                            Consola de Mando Logístico, Geovisor Táctico & Re-Ruteo Anti-Corte
                        </h1>
                        <p className="text-xs text-slate-400">
                            Desbloqueo de almacenes en horas 0-2, ruteo Dijkstra con penalización aluvial y despacho formal EDAN-INDECI.
                        </p>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                        <button
                            onClick={dispararSimulacroMegaFenHandler}
                            disabled={ejecutandoSimulacro}
                            className="bg-rose-600 hover:bg-rose-500 text-white font-black text-xs px-3.5 py-2 rounded-lg flex items-center gap-1.5 shadow-lg shadow-rose-950/70 border border-rose-400 transition animate-pulse"
                        >
                            <Flame className="w-3.5 h-3.5 text-amber-300" />
                            {ejecutandoSimulacro ? "Cargando Simulacro..." : "🚨 Simulacro Mega-FEN (Ground Truth 1998/2017)"}
                        </button>
                        <button
                            onClick={activarEscenarioChupacaCunas}
                            className="bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs px-3 py-2 rounded-lg flex items-center gap-1.5 shadow-lg shadow-amber-950/40 border border-amber-400 transition"
                        >
                            <AlertTriangle className="w-3.5 h-3.5 text-slate-950" />
                            Huayco Chupaca (Río Cunas)
                        </button>
                        <button
                            onClick={restablecerVias}
                            className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium px-3 py-2 rounded-lg flex items-center gap-1.5 border border-slate-700 transition"
                        >
                            <RefreshCw className="w-3.5 h-3.5" />
                            Restablecer Vías
                        </button>
                    </div>
                </div>

                {/* BARRA DE PESTAÑAS TÁCTICAS */}
                <div className="max-w-7xl mx-auto flex items-center gap-2 mt-4 pt-3 border-t border-slate-800/80 overflow-x-auto text-xs font-semibold">
                    <button
                        onClick={() => setTabActiva("geovisor")}
                        className={`px-3.5 py-1.5 rounded-lg flex items-center gap-2 transition ${
                            tabActiva === "geovisor"
                                ? "bg-sky-500 text-slate-950 shadow-md font-bold"
                                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                        }`}
                    >
                        <Map className="w-4 h-4" />
                        Geovisor Táctico Visual Georreferenciado
                    </button>
                    <button
                        onClick={() => setTabActiva("ruteo")}
                        className={`px-3.5 py-1.5 rounded-lg flex items-center gap-2 transition ${
                            tabActiva === "ruteo"
                                ? "bg-emerald-500 text-slate-950 shadow-md font-bold"
                                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                        }`}
                    >
                        <Navigation className="w-4 h-4" />
                        Optimizador de Convoyes & Puentes MTC
                    </button>
                    <button
                        onClick={() => setTabActiva("bloqueos")}
                        className={`px-3.5 py-1.5 rounded-lg flex items-center gap-2 transition ${
                            tabActiva === "bloqueos"
                                ? "bg-amber-500 text-slate-950 shadow-md font-bold"
                                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                        }`}
                    >
                        <AlertTriangle className="w-4 h-4" />
                        Gestor de Incidentes Viales ({bloqueosActivos.length})
                    </button>
                    <button
                        onClick={() => setTabActiva("despacho-edan")}
                        className={`px-3.5 py-1.5 rounded-lg flex items-center gap-2 transition ${
                            tabActiva === "despacho-edan"
                                ? "bg-indigo-500 text-white shadow-md font-bold"
                                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                        }`}
                    >
                        <ShieldCheck className="w-4 h-4" />
                        Despacho Inmediato EDAN C2
                    </button>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 md:px-6 pt-6">
                {/* BANNER DE IMPACTO REGIONAL EN TIEMPO REAL */}
                {simulacionRed && (
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
                        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between">
                            <span className="text-xs font-semibold text-slate-400">Puentes / Vías en Corte</span>
                            <div className="text-2xl font-black text-rose-400 mt-1 flex items-baseline gap-1">
                                {puentesCortados.length}
                                <span className="text-xs text-slate-500">en alerta</span>
                            </div>
                            <span className="text-[10px] text-slate-500">de {puentes.length} monitoreados</span>
                        </div>

                        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between">
                            <span className="text-xs font-semibold text-slate-400">Tránsito Troncal Normal</span>
                            <div className="text-2xl font-black text-emerald-400 mt-1 flex items-baseline gap-1">
                                {simulacionRed.resumen_simulacion.albergues_con_transito_normal}
                                <span className="text-xs text-slate-500">albergues</span>
                            </div>
                            <span className="text-[10px] text-emerald-500 font-medium">Vías expeditas</span>
                        </div>

                        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between">
                            <span className="text-xs font-semibold text-slate-400">Re-Ruteo con Desvío</span>
                            <div className="text-2xl font-black text-amber-400 mt-1 flex items-baseline gap-1">
                                {simulacionRed.resumen_simulacion.albergues_con_desvio_activo}
                                <span className="text-xs text-slate-500">albergues</span>
                            </div>
                            <span className="text-[10px] text-amber-500 font-medium">Desvíos tácticos habilitados</span>
                        </div>

                        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between">
                            <span className="text-xs font-semibold text-slate-400">Aislamiento Terrestre</span>
                            <div className="text-2xl font-black text-rose-500 mt-1 flex items-baseline gap-1">
                                {simulacionRed.resumen_simulacion.albergues_incomunicados_puente_aereo}
                                <span className="text-xs text-rose-400">destinos</span>
                            </div>
                            <span className="text-[10px] text-rose-400 font-bold flex items-center gap-1">
                                <Plane className="w-3 h-3" /> Requiere FAP Mi-171Sh
                            </span>
                        </div>

                        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between col-span-2 md:col-span-1">
                            <span className="text-xs font-semibold text-slate-400">Población Afectada</span>
                            <div className="text-2xl font-black text-rose-300 mt-1 flex items-baseline gap-1">
                                {simulacionRed.resumen_simulacion.poblacion_en_aislamiento_total.toLocaleString()}
                                <span className="text-xs text-slate-500">pers.</span>
                            </div>
                            <span className="text-[10px] text-slate-400 font-medium">
                                {simulacionRed.resumen_simulacion.porcentaje_aislamiento_poblacional}% de la red
                            </span>
                        </div>
                    </div>
                )}

                {/* ========================================================================= */}
                {/* PESTAÑA 1: GEOVISOR TÁCTICO VISUAL GEORREFERENCIADO */}
                {/* ========================================================================= */}
                {tabActiva === "geovisor" && (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        {/* MAPA SVG CARTOGRÁFICO INTERACTIVO (8 COLS) */}
                        <div className="lg:col-span-8 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-2xl relative overflow-hidden">
                            <div className="flex items-center justify-between mb-3 pb-3 border-b border-slate-800">
                                <div className="flex items-center gap-2">
                                    <Map className="w-5 h-5 text-sky-400" />
                                    <h2 className="text-base font-bold text-white tracking-wide">
                                        Geovisor Cartográfico Táctico C2 (Corredores Costa Norte & Sierra Central)
                                    </h2>
                                </div>
                                <div className="flex items-center gap-2 text-xs">
                                    <span className="flex items-center gap-1 text-sky-400 font-mono text-[10px]">
                                        <Building2 className="w-3.5 h-3.5" /> Almacenes INDECI
                                    </span>
                                    <span className="flex items-center gap-1 text-emerald-400 font-mono text-[10px]">
                                        <MapPin className="w-3.5 h-3.5" /> Albergues
                                    </span>
                                </div>
                            </div>

                            {/* BANNER HUD DE SIMULACRO OPERACIONAL MEGA-FEN */}
                            {simulacroData && (
                                <div className="mb-4 p-4 rounded-xl bg-gradient-to-r from-rose-950/80 via-slate-900 to-amber-950/80 border-2 border-rose-500/80 shadow-2xl">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-2">
                                        <div className="flex items-center gap-2">
                                            <span className="bg-rose-600 text-white text-[10px] font-mono font-black px-2 py-0.5 rounded animate-pulse">
                                                SIMULACRO OPERACIONAL C4ISR ACTIVO
                                            </span>
                                            <h3 className="text-sm font-bold text-white">
                                                Escenario de Estrés: El Niño Extraordinario (TSM ≥ +2.5°C, Análogo 1997-1998 & 2017)
                                            </h3>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-[10px] flex-wrap">
                                            <span className="text-slate-400 font-mono">Ver Corredor FEN:</span>
                                            <button
                                                onClick={() => { setOrigenId("ALM-CHIMBOTE-REG"); setDestinoId("ALB-VIRU-VICTORRAUL"); }}
                                                className={`px-2 py-0.5 rounded border transition ${destinoId === "ALB-VIRU-VICTORRAUL" ? "bg-amber-500 text-slate-950 font-bold border-amber-400" : "bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700"}`}
                                            >
                                                Virú (km 515)
                                            </button>
                                            <button
                                                onClick={() => { setOrigenId("ALM-CHICLAYO-REG"); setDestinoId("ALB-ILLIMO-PACORA"); }}
                                                className={`px-2 py-0.5 rounded border transition ${destinoId === "ALB-ILLIMO-PACORA" ? "bg-amber-500 text-slate-950 font-bold border-amber-400" : "bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700"}`}
                                            >
                                                Íllimo / La Leche
                                            </button>
                                            <button
                                                onClick={() => { setOrigenId("ALM-PIURA-REG"); setDestinoId("ALB-CATACAOS-SANPABLO"); }}
                                                className={`px-2 py-0.5 rounded border transition ${destinoId === "ALB-CATACAOS-SANPABLO" ? "bg-amber-500 text-slate-950 font-bold border-amber-400" : "bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700"}`}
                                            >
                                                Catacaos / Dique
                                            </button>
                                            <button
                                                onClick={() => { setOrigenId("ALM-LIMA-CENTRAL"); setDestinoId("ALB-CHOSICA-LURIGANCHO"); }}
                                                className={`px-2 py-0.5 rounded border transition ${destinoId === "ALB-CHOSICA-LURIGANCHO" ? "bg-amber-500 text-slate-950 font-bold border-amber-400" : "bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700"}`}
                                            >
                                                Chosica / Canta
                                            </button>
                                        </div>
                                    </div>

                                    {/* Comparativa pericial de doctrina contra modelo convencional */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs mt-3 pt-3 border-t border-slate-800/80 font-mono">
                                        <div className="p-2.5 rounded-lg bg-rose-950/40 border border-rose-800/60">
                                            <span className="text-[10px] text-rose-400 font-bold block mb-1">
                                                🔴 Modelo Tradicional Reactivo (1998/2017 sin AMARU):
                                            </span>
                                            <ul className="space-y-1 text-[11px] text-slate-300 font-sans">
                                                <li>• Incomunicación promedio: <strong>21.4 días</strong> en Panamericana Norte.</li>
                                                <li>• Trámites EDAN manuales demoran <strong>10 a 14 días</strong> para abrir almacenes.</li>
                                                <li>• Pérdidas logísticas: <strong>$8.5M USD</strong> en fletes y alimentos descompuestos.</li>
                                            </ul>
                                        </div>
                                        <div className="p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-800/60">
                                            <span className="text-[10px] text-emerald-400 font-bold block mb-1">
                                                🟢 AMARU-CLIMATE C4ISR & VRP (Protocolo Operativo):
                                            </span>
                                            <ul className="space-y-1 text-[11px] text-slate-300 font-sans">
                                                <li>• Re-ruteo automático en <strong>&lt; 1.5 seg</strong> con desvíos validados MTC.</li>
                                                <li>• Desbloqueo de almacén en <strong>Horas 0-2</strong> mediante Quórum Dual.</li>
                                                <li>• 100% convoyes con escolta militar y trazabilidad <strong>CGR WORM Ley 31358</strong>.</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <p className="text-xs text-slate-400 mb-4">
                                Haz clic en un almacén para fijar el origen y en un albergue para fijar el destino. El motor recalcula la ruta óptima sorteando puentes colapsados:
                            </p>

                            <div className="w-full bg-slate-950/90 rounded-xl border border-slate-800/80 p-2 flex justify-center items-center overflow-x-auto">
                                <svg
                                    viewBox="0 0 650 720"
                                    className="w-full max-w-[620px] h-[580px] select-none"
                                >
                                    {/* Grilla táctica de fondo */}
                                    <defs>
                                        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                                            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1e293b" strokeWidth="0.5" />
                                        </pattern>
                                        <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                            <stop offset="0%" stopColor="#38bdf8" />
                                            <stop offset="100%" stopColor="#10b981" />
                                        </linearGradient>
                                        <linearGradient id="detourGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                            <stop offset="0%" stopColor="#f59e0b" />
                                            <stop offset="100%" stopColor="#fbbf24" />
                                        </linearGradient>
                                    </defs>
                                    <rect width="650" height="720" fill="url(#grid)" />

                                    {/* Línea de Costa de Referencia */}
                                    <path
                                        d="M 120 40 Q 100 120 95 180 T 170 300 T 240 420 T 350 560 T 420 680"
                                        fill="none"
                                        stroke="#0f172a"
                                        strokeWidth="24"
                                        strokeLinecap="round"
                                        opacity="0.6"
                                    />

                                    {/* ARISTAS DE LA RED VIAL */}
                                    {aristas.map((edge) => {
                                        const n1 = mapaCoords[edge.origen];
                                        const n2 = mapaCoords[edge.destino];
                                        if (!n1 || !n2) return null;

                                        const esRutaActiva = aristasRutaIds.has(edge.id);
                                        const estaCortada = edge.puentes.some(p => puentesCortados.includes(p));

                                        let strokeColor = "#334155";
                                        let strokeWidth = 2;
                                        let strokeDash = edge.es_desvio ? "4,4" : "none";

                                        if (estaCortada) {
                                            strokeColor = "#ef4444";
                                            strokeDash = "6,4";
                                            strokeWidth = 2.5;
                                        } else if (esRutaActiva) {
                                            strokeColor = edge.es_desvio ? "url(#detourGradient)" : "url(#routeGradient)";
                                            strokeWidth = 4.5;
                                        }

                                        return (
                                            <g key={edge.id}>
                                                <line
                                                    x1={n1.x}
                                                    y1={n1.y}
                                                    x2={n2.x}
                                                    y2={n2.y}
                                                    stroke={strokeColor}
                                                    strokeWidth={strokeWidth}
                                                    strokeDasharray={strokeDash}
                                                    className={esRutaActiva ? "transition-all duration-300" : ""}
                                                />
                                                {/* Indicador de corte sobre la arista */}
                                                {estaCortada && (
                                                    <circle
                                                        cx={(n1.x + n2.x) / 2}
                                                        cy={(n1.y + n2.y) / 2}
                                                        r="6"
                                                        fill="#ef4444"
                                                        stroke="#fff"
                                                        strokeWidth="1.5"
                                                        className="animate-pulse"
                                                    />
                                                )}
                                            </g>
                                        );
                                    })}

                                    {/* NODOS (ALMACENES Y ALBERGUES) */}
                                    {Object.entries(mapaCoords).map(([id, nodo]) => {
                                        const esOrigen = id === origenId;
                                        const esDestino = id === destinoId;
                                        const esAlmacen = nodo.tipo === "almacen";

                                        return (
                                            <g
                                                key={id}
                                                className="cursor-pointer group"
                                                onClick={() => {
                                                    if (esAlmacen) {
                                                        setOrigenId(id);
                                                    } else {
                                                        setDestinoId(id);
                                                    }
                                                }}
                                            >
                                                {/* Halo de selección */}
                                                {(esOrigen || esDestino) && (
                                                    <circle
                                                        cx={nodo.x}
                                                        cy={nodo.y}
                                                        r="14"
                                                        fill={esOrigen ? "#38bdf8" : "#10b981"}
                                                        opacity="0.3"
                                                        className="animate-ping"
                                                    />
                                                )}

                                                <circle
                                                    cx={nodo.x}
                                                    cy={nodo.y}
                                                    r={esOrigen || esDestino ? "8" : esAlmacen ? "6" : "5"}
                                                    fill={
                                                        esOrigen
                                                            ? "#0284c7"
                                                            : esDestino
                                                            ? "#10b981"
                                                            : esAlmacen
                                                            ? "#0284c7"
                                                            : "#475569"
                                                    }
                                                    stroke={esOrigen || esDestino ? "#ffffff" : "#0f172a"}
                                                    strokeWidth={esOrigen || esDestino ? "2.5" : "1.5"}
                                                />

                                                {/* Etiqueta de texto */}
                                                <text
                                                    x={nodo.x + 10}
                                                    y={nodo.y + 4}
                                                    fontSize="9"
                                                    fontWeight={esOrigen || esDestino ? "bold" : "normal"}
                                                    fill={esOrigen ? "#38bdf8" : esDestino ? "#34d399" : "#cbd5e1"}
                                                    className="font-mono pointer-events-none drop-shadow-md"
                                                >
                                                    {nodo.nombre.replace("Almacén Regional INDECI ", "ALM: ").replace("Albergue ", "ALB: ")}
                                                </text>
                                            </g>
                                        );
                                    })}
                                </svg>
                            </div>
                        </div>

                        {/* PANEL LATERAL DE SELECCIÓN Y RESULTADO EN VIVO (4 COLS) */}
                        <div className="lg:col-span-4 space-y-4">
                            {/* CAJA DE CONTROL TÁCTICO */}
                            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
                                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                                    <Sliders className="w-4 h-4 text-sky-400" />
                                    Puntos de Enlace C2
                                </h3>

                                <div>
                                    <label className="text-[11px] text-slate-400 block mb-1">Almacén INDECI (Origen):</label>
                                    <select
                                        value={origenId}
                                        onChange={e => setOrigenId(e.target.value)}
                                        className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-sky-300 font-semibold"
                                    >
                                        {almacenes.map(alm => (
                                            <option key={alm.id} value={alm.id}>
                                                {alm.nombre}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="text-[11px] text-slate-400 block mb-1">Albergue Damnificados (Destino):</label>
                                    <select
                                        value={destinoId}
                                        onChange={e => setDestinoId(e.target.value)}
                                        className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-emerald-300 font-semibold"
                                    >
                                        {albergues.map(alb => (
                                            <option key={alb.id} value={alb.id}>
                                                {alb.nombre} ({alb.departamento})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="text-[11px] text-slate-400 block mb-1">Vehículo / Flota:</label>
                                    <select
                                        value={vehiculoId}
                                        onChange={e => setVehiculoId(e.target.value)}
                                        className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-slate-200"
                                    >
                                        {vehiculos.map(v => (
                                            <option key={v.tipo_id} value={v.tipo_id}>
                                                {v.nombre} ({v.capacidad_carga_tn} Tn)
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* TARJETA DE ESTADO DE CONECTIVIDAD */}
                            {resultadoRuta && (
                                <div
                                    className={`rounded-2xl p-4 border shadow-xl transition ${
                                        resultadoRuta.requiere_puente_aereo_ffaa
                                            ? "bg-rose-950/40 border-rose-500 shadow-rose-950/50"
                                            : resultadoRuta.estado_conectividad === "DESVIO_TACTICO_ACTIVO"
                                            ? "bg-amber-950/30 border-amber-500/70"
                                            : "bg-emerald-950/30 border-emerald-500/60"
                                    }`}
                                >
                                    <div className="flex items-center gap-2 mb-2">
                                        {resultadoRuta.requiere_puente_aereo_ffaa ? (
                                            <Plane className="w-5 h-5 text-rose-400 animate-pulse" />
                                        ) : resultadoRuta.estado_conectividad === "DESVIO_TACTICO_ACTIVO" ? (
                                            <Navigation className="w-5 h-5 text-amber-400" />
                                        ) : (
                                            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                                        )}
                                        <span
                                            className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded border"
                                            style={{
                                                color: resultadoRuta.semaforo,
                                                borderColor: resultadoRuta.semaforo,
                                                backgroundColor: `${resultadoRuta.semaforo}20`
                                            }}
                                        >
                                            {resultadoRuta.estado_conectividad.replace(/_/g, " ")}
                                        </span>
                                    </div>

                                    <p className="text-xs text-slate-200 leading-relaxed font-medium mb-3">
                                        {resultadoRuta.alerta_tactica_c2}
                                    </p>

                                    {resultadoRuta.ruta_efectiva && (
                                        <div className="grid grid-cols-2 gap-2 text-xs font-mono bg-slate-950/50 p-2.5 rounded-xl border border-slate-800">
                                            <div>
                                                <span className="text-slate-400 block text-[10px]">Distancia:</span>
                                                <span className="text-white font-bold">{resultadoRuta.ruta_efectiva.distancia_total_km} km</span>
                                            </div>
                                            <div>
                                                <span className="text-slate-400 block text-[10px]">Tiempo ETA:</span>
                                                <span className="text-amber-300 font-bold">{resultadoRuta.ruta_efectiva.tiempo_formateado}</span>
                                            </div>
                                            <div>
                                                <span className="text-slate-400 block text-[10px]">Diésel B5:</span>
                                                <span className="text-rose-300 font-bold">{resultadoRuta.ruta_efectiva.consumo_combustible.total_galones_requeridos} gal</span>
                                            </div>
                                            <div>
                                                <span className="text-slate-400 block text-[10px]">Desvío Activo:</span>
                                                <span className={resultadoRuta.ruta_efectiva.usa_desvios_emergencia ? "text-amber-400 font-bold" : "text-emerald-400"}>
                                                    {resultadoRuta.ruta_efectiva.usa_desvios_emergencia ? "SÍ (ALTERNATIVA)" : "NO (TRONCAL)"}
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* ATAJO A DESPACHO FORMAL EDAN */}
                            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl">
                                <span className="text-[10px] font-mono text-indigo-400 uppercase tracking-wider block mb-1">
                                    Paso Siguiente en la Cadena Humanitaria
                                </span>
                                <h4 className="text-xs font-bold text-white mb-2">
                                    ¿Almacén desbloqueado con Quórum Dual?
                                </h4>
                                <button
                                    onClick={() => setTabActiva("despacho-edan")}
                                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs py-2 px-3 rounded-lg flex items-center justify-center gap-2 shadow-lg transition"
                                >
                                    <FileText className="w-4 h-4" />
                                    Generar Orden Formal de Despacho EDAN
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* ========================================================================= */}
                {/* PESTAÑA 2: OPTIMIZADOR DE CONVOYES & PUENTES MTC (DETALLADO) */}
                {/* ========================================================================= */}
                {tabActiva === "ruteo" && (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        {/* PANEL IZQUIERDO: CONFIGURADOR Y MATRIZ DE PUENTES */}
                        <div className="lg:col-span-5 space-y-6">
                            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl">
                                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-800">
                                    <Sliders className="w-5 h-5 text-emerald-400" />
                                    <h2 className="text-base font-bold text-white tracking-wide">Configuración de Despacho Táctico</h2>
                                </div>

                                <div className="space-y-4 text-xs">
                                    <div>
                                        <label className="block text-slate-400 font-medium mb-1.5 flex items-center justify-between">
                                            <span className="flex items-center gap-1.5">
                                                <Building2 className="w-3.5 h-3.5 text-sky-400" /> Almacén INDECI:
                                            </span>
                                            {currentAlmacen && (
                                                <span className="text-[10px] text-sky-400 font-mono">
                                                    Cap: {currentAlmacen.capacidad_tn} Tn
                                                </span>
                                            )}
                                        </label>
                                        <select
                                            value={origenId}
                                            onChange={e => setOrigenId(e.target.value)}
                                            className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-emerald-500"
                                        >
                                            {almacenes.map(alm => (
                                                <option key={alm.id} value={alm.id}>
                                                    {alm.nombre} ({alm.departamento})
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-slate-400 font-medium mb-1.5 flex items-center justify-between">
                                            <span className="flex items-center gap-1.5">
                                                <MapPin className="w-3.5 h-3.5 text-emerald-400" /> Albergue Destino:
                                            </span>
                                            {currentAlbergue && (
                                                <span className="text-[10px] text-emerald-400 font-mono">
                                                    {currentAlbergue.poblacion_albergada.toLocaleString()} pers.
                                                </span>
                                            )}
                                        </label>
                                        <select
                                            value={destinoId}
                                            onChange={e => setDestinoId(e.target.value)}
                                            className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-emerald-500"
                                        >
                                            {albergues.map(alb => (
                                                <option key={alb.id} value={alb.id}>
                                                    {alb.nombre} ({alb.departamento})
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-slate-400 font-medium mb-1.5 flex items-center gap-1.5">
                                            <Truck className="w-3.5 h-3.5 text-amber-400" /> Flota de Vehículos:
                                        </label>
                                        <select
                                            value={vehiculoId}
                                            onChange={e => setVehiculoId(e.target.value)}
                                            className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-emerald-500"
                                        >
                                            {vehiculos.map(v => (
                                                <option key={v.tipo_id} value={v.tipo_id}>
                                                    {v.nombre} ({v.capacidad_carga_tn} Tn)
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* MATRIZ DE PUENTES */}
                            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl">
                                <div className="flex items-center justify-between mb-3 pb-3 border-b border-slate-800">
                                    <div className="flex items-center gap-2">
                                        <AlertTriangle className="w-5 h-5 text-rose-400" />
                                        <h2 className="text-base font-bold text-white tracking-wide">
                                            Simulador de Puentes Estratégicos MTC/CAF
                                        </h2>
                                    </div>
                                    <span className="text-[10px] font-mono bg-rose-500/20 text-rose-300 border border-rose-500/40 px-2 py-0.5 rounded">
                                        {puentesCortados.length} cortados
                                    </span>
                                </div>

                                <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
                                    {puentes.map(p => {
                                        const cortado = puentesCortados.includes(p.id);
                                        return (
                                            <div
                                                key={p.id}
                                                onClick={() => togglePuente(p.id)}
                                                className={`p-2.5 rounded-xl border transition cursor-pointer flex items-center justify-between text-xs ${
                                                    cortado
                                                        ? "bg-rose-950/40 border-rose-500/60 text-rose-200 shadow-md shadow-rose-950/30"
                                                        : "bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-300"
                                                }`}
                                            >
                                                <div className="flex-1 pr-2">
                                                    <div className="font-semibold flex items-center gap-1.5">
                                                        <span className={cortado ? "text-rose-400" : "text-slate-200"}>
                                                            {p.nombre}
                                                        </span>
                                                    </div>
                                                    <div className="text-[10px] text-slate-400 flex items-center gap-2 mt-0.5">
                                                        <span>{p.rio} ({p.departamento})</span>
                                                        <span>•</span>
                                                        <span className="font-mono text-amber-400">Gatillo: {p.caudal_gatillo_m3s} m³/s</span>
                                                    </div>
                                                </div>

                                                <span
                                                    className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded ${
                                                        cortado
                                                            ? "bg-rose-500 text-white animate-pulse"
                                                            : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                                                    }`}
                                                >
                                                    {cortado ? "COLAPSADO" : "TRANSITABLE"}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* PANEL DERECHO: ITINERARIO Y HOJA DE RUTA */}
                        <div className="lg:col-span-7 space-y-6">
                            {resultadoRuta && resultadoRuta.ruta_efectiva && (
                                <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl">
                                    <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
                                        <div className="flex items-center gap-2">
                                            <FileText className="w-5 h-5 text-emerald-400" />
                                            <h3 className="text-base font-bold text-white tracking-wide">
                                                Hoja de Ruta Táctica para Convoy Militar
                                            </h3>
                                        </div>
                                        <span className="text-[10px] font-mono text-slate-400 bg-slate-950 px-2.5 py-1 rounded border border-slate-800">
                                            {resultadoRuta.ruta_efectiva.total_tramos} tramos interconectados
                                        </span>
                                    </div>

                                    <div className="space-y-3">
                                        {resultadoRuta.ruta_efectiva.aristas_ruta.map((tramo: any, idx: number) => (
                                            <div
                                                key={idx}
                                                className={`p-3 rounded-xl border text-xs flex items-center justify-between ${
                                                    tramo.es_desvio
                                                        ? "bg-amber-950/30 border-amber-500/50 text-amber-200"
                                                        : "bg-slate-950/60 border-slate-800 text-slate-300"
                                                }`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div
                                                        className={`w-6 h-6 rounded-full flex items-center justify-center font-mono font-bold text-[10px] ${
                                                            tramo.es_desvio
                                                                ? "bg-amber-500 text-slate-950"
                                                                : "bg-slate-800 text-slate-300"
                                                        }`}
                                                    >
                                                        {idx + 1}
                                                    </div>
                                                    <div>
                                                        <div className="font-semibold flex items-center gap-2">
                                                            <span>{tramo.origen}</span>
                                                            <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                                                            <span className="text-white">{tramo.destino}</span>
                                                        </div>
                                                        <div className="text-[10px] text-slate-400 mt-0.5">
                                                            {tramo.calzada} • {tramo.es_desvio && (
                                                                <strong className="text-amber-400">DESVÍO HABILITADO: {tramo.descripcion_desvio}</strong>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="text-right">
                                                    <div className="font-mono font-bold text-white">
                                                        {tramo.distancia_km} km
                                                    </div>
                                                    <div className="text-[10px] text-slate-500">
                                                        {tramo.tiempo_min.toFixed(0)} min
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* ========================================================================= */}
                {/* PESTAÑA 3: GESTOR DE INCIDENTES VIALES EN TIEMPO REAL */}
                {/* ========================================================================= */}
                {tabActiva === "bloqueos" && (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        {/* FORMULARIO DE REGISTRO DE INCIDENTE */}
                        <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
                            <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
                                <Plus className="w-5 h-5 text-amber-400" />
                                <h3 className="text-base font-bold text-white">
                                    Reportar Corte / Incidente Vial en Tiempo Real
                                </h3>
                            </div>

                            <div className="space-y-3 text-xs">
                                <div>
                                    <label className="text-slate-400 block mb-1">Tipo de Evento:</label>
                                    <select
                                        value={nuevoBloqueo.tipo_incidente}
                                        onChange={e => setNuevoBloqueo({ ...nuevoBloqueo, tipo_incidente: e.target.value })}
                                        className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-200"
                                    >
                                        <option value="CRECIDA_RIO_COLAPSO_ESTRIBO">Crecida de Río / Colapso de Estribo</option>
                                        <option value="HUAYCO_LADERA">Huayco / Deslizamiento de Ladera</option>
                                        <option value="DERRUMBE_ROCAS">Derrumbe de Rocas y Bloqueo de Vía</option>
                                        <option value="COLAPSO_PLATAFORMA">Pérdida Total de Plataforma Asfáltica</option>
                                        <option value="CORTE_PREVENTIVO_POLTUR">Cierre Preventivo POLTUR / PNP</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="text-slate-400 block mb-1">Ubicación / Kilómetro:</label>
                                    <input
                                        type="text"
                                        value={nuevoBloqueo.ubicacion}
                                        onChange={e => setNuevoBloqueo({ ...nuevoBloqueo, ubicacion: e.target.value })}
                                        className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-200"
                                        placeholder="Ej. Carretera Central km 44 o Río Cunas km 4.5"
                                    />
                                </div>

                                <div>
                                    <label className="text-slate-400 block mb-1">Puente Estratégico Afectado:</label>
                                    <select
                                        value={nuevoBloqueo.puente_afectado}
                                        onChange={e => setNuevoBloqueo({ ...nuevoBloqueo, puente_afectado: e.target.value })}
                                        className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-200"
                                    >
                                        <option value="">-- Ninguno / Tramo Abierto --</option>
                                        {puentes.map(p => (
                                            <option key={p.id} value={p.id}>
                                                {p.nombre} ({p.rio})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="text-slate-400 block mb-1">Descripción del Daño en Campo:</label>
                                    <textarea
                                        rows={3}
                                        value={nuevoBloqueo.descripcion}
                                        onChange={e => setNuevoBloqueo({ ...nuevoBloqueo, descripcion: e.target.value })}
                                        className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-200"
                                    />
                                </div>

                                <button
                                    onClick={registrarBloqueoHandler}
                                    disabled={guardandoBloqueo}
                                    className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs py-2.5 rounded-lg flex items-center justify-center gap-2 shadow-lg transition"
                                >
                                    <AlertTriangle className="w-4 h-4 text-slate-950" />
                                    {guardandoBloqueo ? "Inyectando bloqueo..." : "Inyectar Incidente al Grafo VRP ($0)"}
                                </button>
                            </div>
                        </div>

                        {/* LISTADO DE BLOQUEOS ACTIVOS */}
                        <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
                            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                                <h3 className="text-base font-bold text-white flex items-center gap-2">
                                    <AlertTriangle className="w-5 h-5 text-rose-400" />
                                    Feed de Bloqueos e Incidentes Viales Activos
                                </h3>
                                <span className="text-xs font-mono text-slate-400">
                                    {bloqueosActivos.length} incidentes activos
                                </span>
                            </div>

                            {bloqueosActivos.length === 0 ? (
                                <div className="text-center py-12 text-slate-500 text-xs">
                                    🟢 No hay bloqueos viales reportados. La red troncal se encuentra expedita.
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {bloqueosActivos.map(b => (
                                        <div
                                            key={b.id}
                                            className="p-3.5 bg-slate-950/70 border border-rose-500/40 rounded-xl flex items-start justify-between gap-4 text-xs"
                                        >
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="bg-rose-500/20 text-rose-400 font-mono font-bold text-[9px] px-1.5 py-0.5 rounded border border-rose-500/40">
                                                        {b.tipo_incidente}
                                                    </span>
                                                    <span className="font-bold text-white">{b.ubicacion}</span>
                                                </div>
                                                <p className="text-slate-300 text-[11px]">{b.descripcion}</p>
                                                <div className="text-[10px] text-slate-500 font-mono">
                                                    ID: {b.id} • Reportado por: {b.reportado_por} • {b.timestamp.slice(0, 16)}
                                                </div>
                                            </div>

                                            <button
                                                onClick={() => eliminarBloqueoHandler(b.id, b.puente_afectado)}
                                                className="bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-500/40 text-[10px] px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition shrink-0"
                                            >
                                                <CheckCircle2 className="w-3 h-3" />
                                                Rehabilitar Vía
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* ========================================================================= */}
                {/* PESTAÑA 4: DESPACHO INMEDIATO EDAN C2 (HORAS 0-2) */}
                {/* ========================================================================= */}
                {tabActiva === "despacho-edan" && (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        {/* PANEL DE ACCIÓN Y SELECCIÓN DE FICHA */}
                        <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
                            <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
                                <ShieldCheck className="w-5 h-5 text-indigo-400" />
                                <h3 className="text-base font-bold text-white">
                                    Despacho Humanitario Inmediato EDAN-INDECI
                                </h3>
                            </div>

                            <p className="text-xs text-slate-300 leading-relaxed">
                                Conforme a la <strong>Ley 29664</strong> y <strong>D.L. 1246</strong>, cuando la Ficha EDAN cuenta con <strong>Quórum Dual</strong> (Alcalde + INDECI), el almacén regional queda formalmente desbloqueado para salida de convoyes sin esperar trámites burocráticos.
                            </p>

                            <div className="space-y-3 text-xs">
                                <div>
                                    <label className="text-slate-400 block mb-1">Código de Ficha EDAN Aprobada:</label>
                                    <input
                                        type="text"
                                        value={edanSeleccionadoId}
                                        onChange={e => setEdanSeleccionadoId(e.target.value)}
                                        className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-indigo-300 font-mono font-bold"
                                    />
                                </div>

                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setEdanSeleccionadoId("EDAN-20261001-120901-0001")}
                                        className="text-[10px] bg-slate-800 hover:bg-slate-700 px-2 py-1 rounded text-slate-300"
                                    >
                                        Chupaca (Junín)
                                    </button>
                                    <button
                                        onClick={() => setEdanSeleccionadoId("EDAN-20261001-150118-0002")}
                                        className="text-[10px] bg-slate-800 hover:bg-slate-700 px-2 py-1 rounded text-slate-300"
                                    >
                                        Lurigancho (Lima)
                                    </button>
                                    <button
                                        onClick={() => setEdanSeleccionadoId("EDAN-20261001-200101-0003")}
                                        className="text-[10px] bg-slate-800 hover:bg-slate-700 px-2 py-1 rounded text-slate-300"
                                    >
                                        Catacaos (Piura)
                                    </button>
                                </div>

                                <button
                                    onClick={() => ejecutarDespachoEdanHandler(edanSeleccionadoId)}
                                    disabled={despachandoEdan}
                                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs py-3 rounded-lg flex items-center justify-center gap-2 shadow-lg shadow-indigo-950/60 transition mt-2"
                                >
                                    <Send className="w-4 h-4" />
                                    {despachandoEdan ? "Generando orden C2..." : "Emitir Orden de Despacho & Convoy Inmediato"}
                                </button>
                            </div>
                        </div>

                        {/* RESULTADO DE LA ORDEN FORMAL DE DESPACHO */}
                        <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
                            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                                <h3 className="text-base font-bold text-white flex items-center gap-2">
                                    <FileText className="w-5 h-5 text-emerald-400" />
                                    Orden Formal de Salida de Almacén (COEN / INDECI)
                                </h3>
                                {despachoResultado && (
                                    <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded">
                                        DESPACHO AUTORIZADO
                                    </span>
                                )}
                            </div>

                            {!despachoResultado ? (
                                <div className="text-center py-16 text-slate-500 text-xs">
                                    📋 Selecciona una Ficha EDAN y presiona "Emitir Orden de Despacho" para generar el convoy y la ruta protegida.
                                </div>
                            ) : (
                                <div className="space-y-4 text-xs font-mono">
                                    {/* CABECERA DE LA ORDEN */}
                                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex justify-between items-center">
                                        <div>
                                            <div className="text-[10px] text-slate-400">CÓDIGO DE ORDEN:</div>
                                            <div className="text-sm font-bold text-indigo-300">{despachoResultado.codigo_orden_despacho}</div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-[10px] text-slate-400">FICHA VINCULADA:</div>
                                            <div className="text-xs font-bold text-slate-200">{despachoResultado.edan_id}</div>
                                        </div>
                                    </div>

                                    {/* ORIGEN Y DESTINO */}
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="p-3 bg-slate-950/80 rounded-xl border border-sky-500/40">
                                            <span className="text-[10px] text-sky-400 block mb-1">ALMACÉN DE SALIDA:</span>
                                            <div className="font-bold text-white text-xs">{despachoResultado.almacen_origen?.nombre}</div>
                                            <div className="text-[10px] text-slate-400">{despachoResultado.almacen_origen?.departamento}</div>
                                        </div>
                                        <div className="p-3 bg-slate-950/80 rounded-xl border border-emerald-500/40">
                                            <span className="text-[10px] text-emerald-400 block mb-1">DESTINO FINAL:</span>
                                            <div className="font-bold text-white text-xs">{despachoResultado.albergue_destino?.nombre}</div>
                                            <div className="text-[10px] text-slate-400">{despachoResultado.distrito_beneficiario} ({despachoResultado.departamento})</div>
                                        </div>
                                    </div>

                                    {/* MANIFIESTO BAH Y CONVOY */}
                                    <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                                        <div className="text-xs font-bold text-amber-400">MANIFIESTO DE CARGA HUMANITARIA (BAH):</div>
                                        <div className="grid grid-cols-3 gap-2 text-[11px] text-slate-300">
                                            <div>🥫 {despachoResultado.ayuda_humanitaria_despachada.raciones_alimento.toLocaleString()} raciones</div>
                                            <div>💧 {despachoResultado.ayuda_humanitaria_despachada.agua_litros.toLocaleString()} Lts agua</div>
                                            <div>⛺ {despachoResultado.ayuda_humanitaria_despachada.carpas_familiares} carpas</div>
                                        </div>
                                        <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-800/80 flex justify-between">
                                            <span>Peso Neto: {despachoResultado.ayuda_humanitaria_despachada.peso_total_toneladas} Tn</span>
                                            <span className="text-white font-bold">Convoy: {despachoResultado.convoy_tactico.numero_camiones_requeridos} Camiones 15 Tn</span>
                                        </div>
                                    </div>

                                    {/* ESCOLTA Y SEGURIDAD */}
                                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex justify-between items-center text-[11px]">
                                        <span className="text-slate-400">Escolta Antirrobo:</span>
                                        <span className="text-sky-300 font-bold">{despachoResultado.convoy_tactico.escolta_seguridad}</span>
                                    </div>

                                    {/* SELLO CRIPTOGRÁFICO WORM CGR */}
                                    <div className="p-3 bg-slate-950 rounded-xl border border-indigo-500/30 text-[10px] text-slate-400 space-y-1">
                                        <div className="text-indigo-400 font-bold flex items-center gap-1">
                                            <ShieldAlert className="w-3.5 h-3.5" />
                                            RESPALDO CONTRALORÍA GENERAL DE LA REPÚBLICA (LEY 31358):
                                        </div>
                                        <div className="truncate text-slate-300 font-mono">
                                            Hash SHA-256: {despachoResultado.trazabilidad_cgr.hash_sha256_orden}
                                        </div>
                                    </div>

                                    <div className="pt-1">
                                        <Link
                                            href="/edan?tab=worm"
                                            className="w-full bg-purple-900/60 hover:bg-purple-800 text-purple-200 border border-purple-700/60 font-bold text-xs py-2 rounded-lg flex items-center justify-center gap-2 transition shadow-md"
                                        >
                                            <Lock className="w-3.5 h-3.5 text-purple-400" />
                                            Verificar Bloque en Bitácora WORM CGR (Módulo 6) ➔
                                        </Link>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
