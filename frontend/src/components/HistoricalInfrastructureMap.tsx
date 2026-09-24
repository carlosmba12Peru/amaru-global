"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
    MapPin,
    AlertTriangle,
    ShieldAlert,
    ExternalLink,
    Search,
    Filter,
    Layers,
    DollarSign,
    Clock,
    CheckCircle2,
    Compass,
    Eye,
    TrendingUp,
    Navigation,
    Truck,
    Video
} from "lucide-react";

export interface InfraestructuraHistorica {
    id: string;
    nombre: string;
    tipo: "PUENTE_ESTRATEGICO" | "PUENTE_URBANO_ESTRATEGICO" | "PUENTE_PEATONAL_COLGANTE" | "PUENTE_CARROZABLE" | "PUENTE_VIGAS" | "CARRETERA_TRONCAL" | "CARRETERA_MONTAÑA" | "CARRETERA_SELVA_MONTAÑA";
    eje_vial: string;
    rio: string;
    departamento: string;
    provincia: string;
    distrito: string;
    ubigeo: string;
    coordenadas: { lat: number; lon: number };
    eventos_colapso: string[];
    caudal_gatillo_m3s: number;
    modo_falla: string;
    dias_incomunicacion: number;
    costo_reconstruccion_caf_usd: number;
    impacto_territorial: string;
    leccion_aprendida_caf: string;
    estado_actual: string;
    riesgo_fen_2026_2027: string;
    ruta_alterna: string;
    evidencia_audiovisual: string;
}

export default function HistoricalInfrastructureMap() {
    const [infraestructuras, setInfraestructuras] = useState<InfraestructuraHistorica[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [filtroTipo, setFiltroTipo] = useState<string>("TODOS");
    const [filtroDepto, setFiltroDepto] = useState<string>("TODOS");
    const [busqueda, setBusqueda] = useState<string>("");
    const [itemSeleccionado, setItemSeleccionado] = useState<InfraestructuraHistorica | null>(null);

    // Cargar catálogo de infraestructura
    useEffect(() => {
        async function fetchInfraestructura() {
            try {
                setLoading(true);
                const res = await fetch("http://localhost:8000/api/v1/infraestructura-vial/puntos-criticos");
                if (res.ok) {
                    const data = await res.json();
                    const items: InfraestructuraHistorica[] = data.infraestructuras || [];
                    setInfraestructuras(items);
                    if (items.length > 0) {
                        setItemSeleccionado(items[0]);
                    }
                }
            } catch (err) {
                console.error("Error cargando infraestructura vial:", err);
            } finally {
                setLoading(false);
            }
        }
        fetchInfraestructura();
    }, []);

    // Departamentos únicos
    const departamentos = useMemo(() => {
        const deptos = new Set(infraestructuras.map(i => i.departamento.split("/")[0].trim()));
        return Array.from(deptos).sort();
    }, [infraestructuras]);

    // Filtrado de infraestructura
    const itemsFiltrados = useMemo(() => {
        return infraestructuras.filter(item => {
            const matchesTipo =
                filtroTipo === "TODOS" ||
                (filtroTipo === "PUENTES" && item.tipo.includes("PUENTE")) ||
                (filtroTipo === "CARRETERAS" && item.tipo.includes("CARRETERA"));

            const matchesDepto =
                filtroDepto === "TODOS" || item.departamento.toLowerCase().includes(filtroDepto.toLowerCase());

            const matchesBusqueda =
                busqueda === "" ||
                item.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
                item.eje_vial.toLowerCase().includes(busqueda.toLowerCase()) ||
                item.rio.toLowerCase().includes(busqueda.toLowerCase());

            return matchesTipo && matchesDepto && matchesBusqueda;
        });
    }, [infraestructuras, filtroTipo, filtroDepto, busqueda]);

    const getColorRiesgo = (riesgo: string) => {
        if (riesgo.includes("CRITICO")) return "bg-red-950 text-red-400 border-red-800";
        if (riesgo.includes("ALTO")) return "bg-amber-950 text-amber-400 border-amber-800";
        if (riesgo.includes("MEDIO")) return "bg-yellow-950 text-yellow-400 border-yellow-800";
        return "bg-emerald-950 text-emerald-400 border-emerald-800";
    };

    return (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6">
            {/* CABECERA */}
            <div className="flex flex-wrap justify-between items-center gap-4 pb-4 border-b border-slate-800">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-amber-950/80 border border-amber-800/80 text-amber-400">
                        <Truck className="w-6 h-6" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="text-base font-bold text-white uppercase tracking-wider">
                                Mapa Forense de Infraestructura Vial Crítica (1983 - 2023)
                            </h3>
                            <span className="text-[10px] font-mono bg-amber-950 text-amber-300 border border-amber-800 px-2 py-0.5 rounded font-bold">
                                CAF / MTC / INDECI
                            </span>
                        </div>
                        <p className="text-xs text-slate-400">
                            Inventario georreferenciado de los 12 puentes colapsados y 8 carreteras troncales cortadas durante mega-eventos FEN
                        </p>
                    </div>
                </div>

                {/* Métricas rápidas */}
                <div className="flex items-center gap-3 text-xs font-mono">
                    <div className="px-3 py-1.5 bg-slate-950 rounded-xl border border-slate-800 flex items-center gap-2">
                        <span className="text-slate-400">Puentes:</span>
                        <b className="text-amber-400 font-black">12 Evaluados</b>
                    </div>
                    <div className="px-3 py-1.5 bg-slate-950 rounded-xl border border-slate-800 flex items-center gap-2">
                        <span className="text-slate-400">Carreteras:</span>
                        <b className="text-red-400 font-black">8 Corredores</b>
                    </div>
                </div>
            </div>

            {/* BARRA DE FILTROS Y BÚSQUEDA */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* Selector Tipo */}
                <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
                    {[
                        { id: "TODOS", label: "Todos (20)" },
                        { id: "PUENTES", label: "Puentes (12)" },
                        { id: "CARRETERAS", label: "Carreteras (8)" }
                    ].map(t => (
                        <button
                            key={t.id}
                            onClick={() => setFiltroTipo(t.id)}
                            className={`flex-1 py-1.5 rounded-lg text-center font-medium transition ${
                                filtroTipo === t.id
                                    ? "bg-amber-600 text-white font-bold shadow"
                                    : "text-slate-400 hover:text-white"
                            }`}
                        >
                            {t.label}
                        </button>
                    ))}
                </div>

                {/* Selector Departamento */}
                <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 text-xs">
                    <Filter className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    <select
                        value={filtroDepto}
                        onChange={e => setFiltroDepto(e.target.value)}
                        className="bg-transparent text-slate-200 focus:outline-none w-full font-sans cursor-pointer"
                    >
                        <option value="TODOS" className="bg-slate-900">Todos los Departamentos</option>
                        {departamentos.map(d => (
                            <option key={d} value={d} className="bg-slate-900">{d}</option>
                        ))}
                    </select>
                </div>

                {/* Buscador */}
                <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 text-xs">
                    <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    <input
                        type="text"
                        placeholder="Buscar puente, carretera o río..."
                        value={busqueda}
                        onChange={e => setBusqueda(e.target.value)}
                        className="bg-transparent text-slate-200 placeholder-slate-500 focus:outline-none w-full"
                    />
                </div>
            </div>

            {/* PANEL PRINCIPAL: LISTA LATERAL + FICHA TÁCTICA FORENSE */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Lista de Infraestructuras (Columna Izquierda: 5 cols) */}
                <div className="lg:col-span-5 space-y-2 max-h-[640px] overflow-y-auto pr-1">
                    {loading ? (
                        <div className="p-8 text-center text-slate-500 font-mono text-xs">
                            Cargando catálogo pericial de infraestructura...
                        </div>
                    ) : itemsFiltrados.length === 0 ? (
                        <div className="p-8 text-center text-slate-500 font-mono text-xs">
                            No se encontraron infraestructuras con los filtros seleccionados.
                        </div>
                    ) : (
                        itemsFiltrados.map(item => {
                            const isSelected = itemSeleccionado?.id === item.id;
                            const isPuente = item.tipo.includes("PUENTE");

                            return (
                                <button
                                    key={item.id}
                                    onClick={() => setItemSeleccionado(item)}
                                    className={`w-full text-left p-3.5 rounded-xl border transition flex flex-col space-y-2 ${
                                        isSelected
                                            ? "bg-slate-800/90 border-amber-500 ring-2 ring-amber-500/30 shadow-lg"
                                            : "bg-slate-950/70 border-slate-800/80 hover:bg-slate-900 hover:border-slate-700"
                                    }`}
                                >
                                    <div className="flex justify-between items-start gap-2">
                                        <div className="flex items-center gap-1.5">
                                            <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border ${
                                                isPuente
                                                    ? "bg-blue-950 text-blue-300 border-blue-800"
                                                    : "bg-purple-950 text-purple-300 border-purple-800"
                                            }`}>
                                                {isPuente ? "🌉 PUENTE" : "🛣️ CARRETERA"}
                                            </span>
                                            <span className="text-[10px] text-slate-400 font-medium">
                                                {item.departamento}
                                            </span>
                                        </div>
                                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded border font-bold ${getColorRiesgo(item.riesgo_fen_2026_2027)}`}>
                                            {item.riesgo_fen_2026_2027.replace("_", " ")}
                                        </span>
                                    </div>

                                    <div>
                                        <h4 className="text-xs font-bold text-white line-clamp-1">
                                            {item.nombre}
                                        </h4>
                                        <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5 font-mono">
                                            {item.eje_vial} • {item.rio}
                                        </p>
                                    </div>

                                    <div className="flex justify-between items-center text-[10px] font-mono text-slate-500 pt-1 border-t border-slate-800/60">
                                        <span>Colapsos: <b className="text-amber-300">{item.eventos_colapso.join(", ")}</b></span>
                                        <span>Q_gatillo: <b className="text-slate-300">{item.caudal_gatillo_m3s} m³/s</b></span>
                                    </div>
                                </button>
                            );
                        })
                    )}
                </div>

                {/* Ficha Forense Pericial Detallada (Columna Derecha: 7 cols) */}
                <div className="lg:col-span-7">
                    {itemSeleccionado ? (
                        <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-5 h-full flex flex-col justify-between">
                            <div className="space-y-4">
                                {/* Encabezado del Item */}
                                <div className="flex justify-between items-start gap-4 pb-3 border-b border-slate-800">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                                                itemSeleccionado.tipo.includes("PUENTE")
                                                    ? "bg-blue-950 text-blue-300 border-blue-800"
                                                    : "bg-purple-950 text-purple-300 border-purple-800"
                                            }`}>
                                                {itemSeleccionado.tipo}
                                            </span>
                                            <span className="text-xs text-slate-400 font-mono">
                                                UBIGEO: {itemSeleccionado.ubigeo}
                                            </span>
                                        </div>
                                        <h3 className="text-base font-bold text-white mt-1">
                                            {itemSeleccionado.nombre}
                                        </h3>
                                        <p className="text-xs text-slate-300 font-mono">
                                            {itemSeleccionado.eje_vial} • {itemSeleccionado.rio}
                                        </p>
                                    </div>

                                    <div className="text-right">
                                        <span className={`text-[11px] font-mono font-bold px-2.5 py-1 rounded-full border ${getColorRiesgo(itemSeleccionado.riesgo_fen_2026_2027)}`}>
                                            {itemSeleccionado.riesgo_fen_2026_2027.replace("_", " ")}
                                        </span>
                                        <div className="text-[10px] text-slate-500 font-mono mt-1">
                                            Lat: {itemSeleccionado.coordenadas.lat.toFixed(4)}, Lon: {itemSeleccionado.coordenadas.lon.toFixed(4)}
                                        </div>
                                    </div>
                                </div>

                                {/* Métricas Periciales de Colapso */}
                                <div className="grid grid-cols-3 gap-3">
                                    <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 space-y-1 text-center">
                                        <span className="text-[10px] font-mono uppercase text-slate-400">Aislamiento Histórico</span>
                                        <div className="text-base font-mono font-black text-amber-400">
                                            {itemSeleccionado.dias_incomunicacion} Días
                                        </div>
                                        <span className="text-[10px] text-slate-500">Corte de Abastecimiento</span>
                                    </div>
                                    <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 space-y-1 text-center">
                                        <span className="text-[10px] font-mono uppercase text-slate-400">Caudal Gatillo FEN</span>
                                        <div className="text-base font-mono font-black text-red-400">
                                            {itemSeleccionado.caudal_gatillo_m3s} m³/s
                                        </div>
                                        <span className="text-[10px] text-slate-500">Umbral de Falla</span>
                                    </div>
                                    <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 space-y-1 text-center">
                                        <span className="text-[10px] font-mono uppercase text-slate-400">Costo Reconstrucción</span>
                                        <div className="text-base font-mono font-black text-emerald-400">
                                            ${(itemSeleccionado.costo_reconstruccion_caf_usd / 1000000).toFixed(1)}M USD
                                        </div>
                                        <span className="text-[10px] text-slate-500">Reporte CAF 1998</span>
                                    </div>
                                </div>

                                {/* Modo de Falla y Afectación Territorial */}
                                <div className="space-y-3 text-xs">
                                    <div className="p-3 bg-red-950/30 rounded-xl border border-red-900/50 space-y-1">
                                        <span className="text-[11px] font-bold text-red-400 uppercase tracking-wider flex items-center gap-1.5">
                                            <AlertTriangle className="w-3.5 h-3.5" /> Modo de Falla Estructural
                                        </span>
                                        <p className="text-slate-300 text-[11.5px] leading-relaxed">
                                            {itemSeleccionado.modo_falla}
                                        </p>
                                    </div>

                                    <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 space-y-1">
                                        <span className="text-[11px] font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                                            <ShieldAlert className="w-3.5 h-3.5 text-amber-400" /> Lección Aprendida Oficial (CAF / MTC)
                                        </span>
                                        <p className="text-slate-300 text-[11.5px] leading-relaxed">
                                            {itemSeleccionado.leccion_aprendida_caf}
                                        </p>
                                    </div>

                                    <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 space-y-1">
                                        <span className="text-[11px] font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
                                            <Navigation className="w-3.5 h-3.5 text-cyan-400" /> Ruta Alterna Táctica Oficial
                                        </span>
                                        <p className="text-slate-300 text-[11.5px] leading-relaxed font-mono">
                                            {itemSeleccionado.ruta_alterna}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Enlace a Video de Archivo y Estado de Mitigación */}
                            <div className="pt-3 border-t border-slate-800 flex flex-wrap justify-between items-center gap-3">
                                <div className="flex items-center gap-2 text-xs">
                                    <span className="text-slate-400">Estado de Mitigación:</span>
                                    <span className="font-mono font-bold text-slate-200 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                                        {itemSeleccionado.estado_actual.replace(/_/g, " ")}
                                    </span>
                                </div>

                                {itemSeleccionado.evidencia_audiovisual && (
                                    <a
                                        href={itemSeleccionado.evidencia_audiovisual}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="px-3 py-1.5 bg-red-950 text-red-300 border border-red-800 rounded-lg text-xs font-bold hover:bg-red-900 transition flex items-center gap-1.5"
                                    >
                                        <Video className="w-3.5 h-3.5" /> Ver Video de Archivo
                                    </a>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="p-12 text-center text-slate-500 font-mono text-xs">
                            Seleccione una infraestructura para ver el expediente pericial.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
