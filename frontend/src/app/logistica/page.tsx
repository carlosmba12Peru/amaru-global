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
    ExternalLink
} from "lucide-react";

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

export default function LogisticaPage() {
    const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

    // Estados de datos base
    const [almacenes, setAlmacenes] = useState<Almacen[]>([]);
    const [albergues, setAlbergues] = useState<Albergue[]>([]);
    const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]);
    const [puentes, setPuentes] = useState<PuenteCritico[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    // Selecciones de despacho
    const [origenId, setOrigenId] = useState<string>("ALM-LIMA-CENTRAL");
    const [destinoId, setDestinoId] = useState<string>("ALB-VIRU-VICTORRAUL");
    const [vehiculoId, setVehiculoId] = useState<string>("CAMION_PESADO_15T");

    // Puentes cortados en simulación
    const [puentesCortados, setPuentesCortados] = useState<string[]>([]);
    const [resultadoRuta, setResultadoRuta] = useState<any>(null);
    const [calculandoRuta, setCalculandoRuta] = useState<boolean>(false);

    // Simulación de red completa
    const [simulacionRed, setSimulacionRed] = useState<{
        resumen_simulacion: ResumenSimulacion;
        albergues: AlbergueSimulado[];
    } | null>(null);

    // Cargar catálogos
    useEffect(() => {
        async function cargarDatos() {
            try {
                setLoading(true);
                const res = await fetch(`${API_BASE}/api/v1/logistica/catalogo`);
                if (res.ok) {
                    const data = await res.json();
                    setAlmacenes(data.almacenes_indeci || []);
                    setAlbergues(data.albergues_destinos || []);
                    setVehiculos(data.flota_vehiculos || []);
                    setPuentes(data.puentes_criticos || []);
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
    }, [API_BASE, origenId, destinoId, vehiculoId, puentesCortados]);

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

    // Preset: Mega-Crecida FEN
    const activarEscenarioMegaCrecida = () => {
        setPuentesCortados([
            "puente-viru-pe1n",
            "puente-reque-pe1n",
            "puente-sechin-casma",
            "puente-independencia-catacaos",
            "puente-la-leche-illimo"
        ]);
    };

    // Preset: Restablecer
    const restablecerVias = () => {
        setPuentesCortados([]);
    };

    // Almacén y albergue seleccionados
    const currentAlmacen = useMemo(() => almacenes.find(a => a.id === origenId), [almacenes, origenId]);
    const currentAlbergue = useMemo(() => albergues.find(a => a.id === destinoId), [albergues, destinoId]);
    const currentVehiculo = useMemo(() => vehiculos.find(v => v.tipo_id === vehiculoId), [vehiculos, vehiculoId]);

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-16">
            {/* ENCABEZADO TÁCTICO C2 */}
            <div className="border-b border-slate-800 bg-slate-900/90 backdrop-blur px-6 py-5 sticky top-0 z-30">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-xs font-mono font-bold px-2 py-0.5 rounded flex items-center gap-1">
                                <Truck className="w-3.5 h-3.5" /> FASE 2 • VRP LOGÍSTICA HUMANITARIA
                            </span>
                            <span className="bg-sky-500/20 text-sky-300 border border-sky-500/40 text-xs font-mono px-2 py-0.5 rounded">
                                INDECI • CCFFAA • MTC
                            </span>
                            <span className="bg-rose-500/20 text-rose-300 border border-rose-500/40 text-xs font-mono px-2 py-0.5 rounded animate-pulse">
                                FEN 2026-2027
                            </span>
                        </div>
                        <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
                            Consola de Mando Logístico & Re-Ruteo Anti-Corte de Puentes
                        </h1>
                        <p className="text-xs text-slate-400">
                            Optimizador de convoyes tácticos, simulación de cortes fluviales y activación de puente aéreo con memoria forense CAF / INDECI.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={activarEscenarioMegaCrecida}
                            className="bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs px-3.5 py-2 rounded-lg flex items-center gap-2 shadow-lg shadow-rose-950/50 border border-rose-400 transition"
                        >
                            <Flame className="w-4 h-4" />
                            Simular Mega-Crecida FEN
                        </button>
                        <button
                            onClick={restablecerVias}
                            className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium px-3.5 py-2 rounded-lg flex items-center gap-2 border border-slate-700 transition"
                        >
                            <RefreshCw className="w-4 h-4" />
                            Restablecer Vías
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 md:px-6 pt-6">
                {/* BANNER DE IMPACTO REGIONAL EN TIEMPO REAL */}
                {simulacionRed && (
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
                        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between">
                            <span className="text-xs font-semibold text-slate-400">Puentes Cortados</span>
                            <div className="text-2xl font-black text-rose-400 mt-1 flex items-baseline gap-1">
                                {simulacionRed.resumen_simulacion.total_puentes_cortados}
                                <span className="text-xs text-slate-500">en alerta</span>
                            </div>
                            <span className="text-[10px] text-slate-500">de 26 monitoreados</span>
                        </div>

                        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between">
                            <span className="text-xs font-semibold text-slate-400">Tránsito Normal</span>
                            <div className="text-2xl font-black text-emerald-400 mt-1 flex items-baseline gap-1">
                                {simulacionRed.resumen_simulacion.albergues_con_transito_normal}
                                <span className="text-xs text-slate-500">albergues</span>
                            </div>
                            <span className="text-[10px] text-emerald-500">Vías expeditas</span>
                        </div>

                        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between">
                            <span className="text-xs font-semibold text-slate-400">Re-Ruteo con Desvío</span>
                            <div className="text-2xl font-black text-amber-400 mt-1 flex items-baseline gap-1">
                                {simulacionRed.resumen_simulacion.albergues_con_desvio_activo}
                                <span className="text-xs text-slate-500">albergues</span>
                            </div>
                            <span className="text-[10px] text-amber-500">Rutas alternas activadas</span>
                        </div>

                        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between">
                            <span className="text-xs font-semibold text-slate-400">Aislamiento Total</span>
                            <div className="text-2xl font-black text-rose-500 mt-1 flex items-baseline gap-1">
                                {simulacionRed.resumen_simulacion.albergues_incomunicados_puente_aereo}
                                <span className="text-xs text-rose-400">destinos</span>
                            </div>
                            <span className="text-[10px] text-rose-400 font-bold flex items-center gap-1">
                                <Plane className="w-3 h-3" /> Requiere FAP Mi-171Sh
                            </span>
                        </div>

                        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between col-span-2 md:col-span-1">
                            <span className="text-xs font-semibold text-slate-400">Población Aislada</span>
                            <div className="text-2xl font-black text-rose-300 mt-1 flex items-baseline gap-1">
                                {simulacionRed.resumen_simulacion.poblacion_en_aislamiento_total.toLocaleString()}
                                <span className="text-xs text-slate-500">pers.</span>
                            </div>
                            <span className="text-[10px] text-slate-400">
                                {simulacionRed.resumen_simulacion.porcentaje_aislamiento_poblacional}% de la población total
                            </span>
                        </div>
                    </div>
                )}

                {/* CONTENIDO PRINCIPAL: 2 COLUMNAS */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* PANEL IZQUIERDO: CONFIGURADOR DE DESPACHO Y SIMULADOR DE PUENTES (5 COLS) */}
                    <div className="lg:col-span-5 space-y-6">
                        {/* SELECTOR DE DESPACHO */}
                        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl">
                            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-800">
                                <Sliders className="w-5 h-5 text-emerald-400" />
                                <h2 className="text-base font-bold text-white tracking-wide">Configuración de Despacho Táctico</h2>
                            </div>

                            <div className="space-y-4 text-xs">
                                {/* ORIGEN */}
                                <div>
                                    <label className="block text-slate-400 font-medium mb-1.5 flex items-center justify-between">
                                        <span className="flex items-center gap-1.5">
                                            <Building2 className="w-3.5 h-3.5 text-sky-400" /> Almacén de Origen INDECI:
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
                                    {currentAlmacen && (
                                        <div className="grid grid-cols-3 gap-2 mt-2 p-2 bg-slate-950/60 rounded border border-slate-800/80 text-[10px] text-slate-400 font-mono">
                                            <div>🥫 {currentAlmacen.stock_raciones_frias.toLocaleString()} rac.</div>
                                            <div>💧 {(currentAlmacen.stock_agua_lts / 1000).toFixed(0)}k Lts</div>
                                            <div>⛺ {currentAlmacen.stock_carpas_familiares.toLocaleString()} carp.</div>
                                        </div>
                                    )}
                                </div>

                                {/* DESTINO */}
                                <div>
                                    <label className="block text-slate-400 font-medium mb-1.5 flex items-center justify-between">
                                        <span className="flex items-center gap-1.5">
                                            <MapPin className="w-3.5 h-3.5 text-emerald-400" /> Albergue de Damnificados (Destino):
                                        </span>
                                        {currentAlbergue && (
                                            <span className="text-[10px] text-emerald-400 font-mono">
                                                {currentAlbergue.poblacion_albergada.toLocaleString()} personas
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
                                    {currentAlbergue && (
                                        <div className="mt-2 p-2 bg-slate-950/60 rounded border border-slate-800/80 text-[11px] text-slate-300">
                                            <div className="flex justify-between text-slate-400 text-[10px] mb-1">
                                                <span>Demanda Diaria:</span>
                                                <span className="font-mono text-emerald-400">
                                                    {currentAlbergue.demanda_raciones_dia.toLocaleString()} raciones / {currentAlbergue.demanda_agua_lts_dia.toLocaleString()} L agua
                                                </span>
                                            </div>
                                            <div className="text-[10px] text-slate-400">
                                                <span className="text-amber-400 font-semibold">Puente Crítico:</span> {currentAlbergue.puente_critico_acceso}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* TIPO DE TRANSPORTE / CONVOY */}
                                <div>
                                    <label className="block text-slate-400 font-medium mb-1.5 flex items-center gap-1.5">
                                        <Truck className="w-3.5 h-3.5 text-amber-400" /> Tipo de Vehículo / Escolta Militar:
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
                                    {currentVehiculo && (
                                        <p className="text-[10px] text-slate-400 mt-1 italic">
                                            {currentVehiculo.descripcion} • Rendimiento: {currentVehiculo.km_por_galon} km/gal Diésel B5.
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* MATRIZ DE PUENTES TÁCTICOS Y SIMULACIÓN DE COLAPSO */}
                        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl">
                            <div className="flex items-center justify-between mb-3 pb-3 border-b border-slate-800">
                                <div className="flex items-center gap-2">
                                    <AlertTriangle className="w-5 h-5 text-rose-400" />
                                    <h2 className="text-base font-bold text-white tracking-wide">
                                        Simulador de Puentes Estratégicos (MTC/CAF)
                                    </h2>
                                </div>
                                <span className="text-[10px] font-mono bg-rose-500/20 text-rose-300 border border-rose-500/40 px-2 py-0.5 rounded">
                                    {puentesCortados.length} cortados
                                </span>
                            </div>

                            <p className="text-[11px] text-slate-400 mb-3">
                                Alterna los interruptores para simular el colapso fluvial por crecida aluvial. El optimizador recalculará el desvío instantáneamente:
                            </p>

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

                                            <div className="flex items-center gap-2">
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
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* PANEL DERECHO: RESULTADOS DE RUTA, BALANZA TÁCTICA Y ALERTA (7 COLS) */}
                    <div className="lg:col-span-7 space-y-6">
                        {/* ESTADO DE CONECTIVIDAD Y ALERTA C2 */}
                        {resultadoRuta && (
                            <div
                                className={`rounded-2xl p-5 border shadow-2xl transition ${
                                    resultadoRuta.requiere_puente_aereo_ffaa
                                        ? "bg-rose-950/40 border-rose-500 shadow-rose-950/60"
                                        : resultadoRuta.estado_conectividad === "DESVIO_TACTICO_ACTIVO"
                                        ? "bg-amber-950/30 border-amber-500/70 shadow-amber-950/40"
                                        : "bg-emerald-950/30 border-emerald-500/60 shadow-emerald-950/40"
                                }`}
                            >
                                <div className="flex items-start justify-between gap-4 mb-3">
                                    <div className="flex items-center gap-2.5">
                                        {resultadoRuta.requiere_puente_aereo_ffaa ? (
                                            <div className="p-2.5 bg-rose-600 text-white rounded-xl shadow-lg">
                                                <Plane className="w-6 h-6 animate-pulse" />
                                            </div>
                                        ) : resultadoRuta.estado_conectividad === "DESVIO_TACTICO_ACTIVO" ? (
                                            <div className="p-2.5 bg-amber-500 text-slate-950 rounded-xl shadow-lg">
                                                <Navigation className="w-6 h-6" />
                                            </div>
                                        ) : (
                                            <div className="p-2.5 bg-emerald-500 text-slate-950 rounded-xl shadow-lg">
                                                <CheckCircle2 className="w-6 h-6" />
                                            </div>
                                        )}
                                        <div>
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
                                            <h3 className="text-lg font-black text-white mt-1">
                                                {resultadoRuta.requiere_puente_aereo_ffaa
                                                    ? "ALERTA: AISLAMIENTO TOTAL TERRESTRE"
                                                    : resultadoRuta.estado_conectividad === "DESVIO_TACTICO_ACTIVO"
                                                    ? "RE-RUTEO ANTI-CORTE VRP HABILITADO"
                                                    : "RUTA TRONCAL EXPEDITA SIN RESTRICCIÓN"}
                                            </h3>
                                        </div>
                                    </div>

                                    {calculandoRuta && (
                                        <span className="text-xs text-slate-400 flex items-center gap-1.5 animate-pulse">
                                            <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Recalculando grafo...
                                        </span>
                                    )}
                                </div>

                                <p className="text-xs text-slate-200 leading-relaxed font-medium bg-slate-950/40 p-3 rounded-xl border border-slate-800">
                                    {resultadoRuta.alerta_tactica_c2}
                                </p>

                                {/* SI REQUIERE PUENTE AÉREO */}
                                {resultadoRuta.requiere_puente_aereo_ffaa && (
                                    <div className="mt-4 p-4 bg-rose-900/30 border border-rose-500/60 rounded-xl text-xs space-y-3">
                                        <div className="flex items-center gap-2 font-bold text-rose-300">
                                            <Plane className="w-4 h-4" />
                                            MEDIO DE TRANSPORTE MILITAR REQUERIDO:
                                        </div>
                                        <div className="p-2.5 bg-slate-950/70 rounded-lg text-slate-200 font-semibold border border-rose-500/40">
                                            {resultadoRuta.medio_transporte_recomendado}
                                        </div>

                                        {resultadoRuta.memoria_historica_precedente && (
                                            <div className="pt-2 border-t border-rose-800/50 text-[11px] text-slate-300 space-y-1">
                                                <div className="text-rose-400 font-bold">Precedente Histórico FEN:</div>
                                                <div>• <strong>Modo de falla:</strong> {resultadoRuta.memoria_historica_precedente.falla}</div>
                                                <div>• <strong>Días de incomunicación:</strong> {resultadoRuta.memoria_historica_precedente.dias_incomunicacion_historicos} días en evento previo</div>
                                                <div>• <strong>Solución aplicada:</strong> {resultadoRuta.memoria_historica_precedente.solucion_aplicada}</div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* COMPARATIVA DE MÉTRICAS Y COMBUSTIBLE */}
                        {resultadoRuta && resultadoRuta.ruta_efectiva && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                {/* DISTANCIA */}
                                <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
                                    <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                                        <Navigation className="w-3.5 h-3.5 text-sky-400" /> Distancia Convoy
                                    </span>
                                    <div className="text-2xl font-black text-white mt-2">
                                        {resultadoRuta.ruta_efectiva.distancia_total_km} <span className="text-xs text-slate-400">km</span>
                                    </div>
                                    <div className="text-[10px] text-slate-400 mt-1">
                                        {resultadoRuta.balance_contingencia.distancia_adicional_km > 0 ? (
                                            <span className="text-amber-400 font-semibold">
                                                +{resultadoRuta.balance_contingencia.distancia_adicional_km} km de desvío
                                            </span>
                                        ) : (
                                            <span className="text-emerald-400 font-semibold">Ruta directa troncal</span>
                                        )}
                                    </div>
                                </div>

                                {/* TIEMPO DE TRÁNSITO */}
                                <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
                                    <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                                        <Clock className="w-3.5 h-3.5 text-amber-400" /> Tiempo Estimado (ETA)
                                    </span>
                                    <div className="text-2xl font-black text-amber-300 mt-2">
                                        {resultadoRuta.ruta_efectiva.tiempo_formateado}
                                    </div>
                                    <div className="text-[10px] text-slate-400 mt-1">
                                        {resultadoRuta.balance_contingencia.tiempo_adicional_minutos > 0 ? (
                                            <span className="text-amber-400 font-semibold">
                                                +{resultadoRuta.balance_contingencia.tiempo_adicional_minutos.toFixed(0)} min demora
                                            </span>
                                        ) : (
                                            <span className="text-emerald-400 font-semibold">Flujo vehicular óptimo</span>
                                        )}
                                    </div>
                                </div>

                                {/* DIÉSEL B5 Y RESERVA MILITAR */}
                                <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
                                    <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                                        <Fuel className="w-3.5 h-3.5 text-rose-400" /> Diésel B5 Requerido
                                    </span>
                                    <div className="text-2xl font-black text-rose-300 mt-2">
                                        {resultadoRuta.ruta_efectiva.consumo_combustible.total_galones_requeridos} <span className="text-xs text-slate-400">gal</span>
                                    </div>
                                    <div className="text-[10px] text-slate-400 mt-1">
                                        Incluye +{resultadoRuta.ruta_efectiva.consumo_combustible.reserva_militar_20pct} gal (20% reserva táctica)
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* HOJA DE RUTA TÁCTICA C2 (ITINERARIO PASO A PASO) */}
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

                        {/* MATRIZ REGIONAL DE ALBERGUES Y CONECTIVIDAD */}
                        {simulacionRed && (
                            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl">
                                <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
                                    <div className="flex items-center gap-2">
                                        <Layers className="w-5 h-5 text-sky-400" />
                                        <h3 className="text-base font-bold text-white tracking-wide">
                                            Matriz Territorial de Accesibilidad de Albergues
                                        </h3>
                                    </div>
                                    <span className="text-xs text-slate-400">
                                        12 destinos estratégicos
                                    </span>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-xs">
                                        <thead className="text-[10px] uppercase font-mono text-slate-400 border-b border-slate-800">
                                            <tr>
                                                <th className="py-2 px-3">Albergue / Ubicación</th>
                                                <th className="py-2 px-2">Población</th>
                                                <th className="py-2 px-2">Conectividad</th>
                                                <th className="py-2 px-2">ETA Convoy</th>
                                                <th className="py-2 px-2">Diésel B5</th>
                                                <th className="py-2 px-3 text-right">Acción</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                                            {simulacionRed.albergues.map(alb => (
                                                <tr
                                                    key={alb.albergue_id}
                                                    onClick={() => setDestinoId(alb.albergue_id)}
                                                    className={`hover:bg-slate-800/40 transition cursor-pointer ${
                                                        destinoId === alb.albergue_id ? "bg-slate-800/70" : ""
                                                    }`}
                                                >
                                                    <td className="py-2.5 px-3">
                                                        <div className="font-sans font-bold text-slate-200">
                                                            {alb.nombre}
                                                        </div>
                                                        <div className="text-[10px] text-slate-500 font-sans">
                                                            {alb.departamento}
                                                        </div>
                                                    </td>
                                                    <td className="py-2.5 px-2 text-slate-300">
                                                        {alb.poblacion.toLocaleString()}
                                                    </td>
                                                    <td className="py-2.5 px-2">
                                                        <span
                                                            className="text-[9px] font-bold px-2 py-0.5 rounded border"
                                                            style={{
                                                                color: alb.semaforo,
                                                                borderColor: alb.semaforo,
                                                                backgroundColor: `${alb.semaforo}20`
                                                            }}
                                                        >
                                                            {alb.estado_conectividad.replace(/_/g, " ")}
                                                        </span>
                                                    </td>
                                                    <td className="py-2.5 px-2 text-slate-300">
                                                        {alb.tiempo_formateado}
                                                    </td>
                                                    <td className="py-2.5 px-2 text-slate-300">
                                                        {alb.diesel_galones > 0 ? `${alb.diesel_galones} gal` : "-"}
                                                    </td>
                                                    <td className="py-2.5 px-3 text-right">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setDestinoId(alb.albergue_id);
                                                            }}
                                                            className="text-[10px] bg-slate-800 hover:bg-slate-700 text-sky-400 font-sans px-2 py-1 rounded transition"
                                                        >
                                                            Rutar C2
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
