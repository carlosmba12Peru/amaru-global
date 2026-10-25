"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
    Search,
    Building2,
    Truck,
    ShieldCheck,
    ShieldAlert,
    Lock,
    Zap,
    Scale,
    FileSpreadsheet,
    MessageSquare,
    ExternalLink,
    Compass,
    Sparkles,
    X,
    CornerDownLeft,
    Layers,
    MapPin,
    AlertTriangle,
    Clock,
    FileText
} from "lucide-react";

interface CommandItem {
    id: string;
    titulo: string;
    subtitulo: string;
    categoria: "DISTRITOS" | "PUENTES" | "CONSOLAS" | "ACCIONES_C2";
    href?: string;
    action?: () => void;
    badge?: string;
    icon: React.ElementType;
}

const DISTRITOS_RAPIDOS = [
    { ubigeo: "200105", nombre: "Catacaos", depto: "Piura", peligro: "Inundación Río Piura", ds: "D.S. 124-2026-PCM" },
    { ubigeo: "120901", nombre: "Chupaca", depto: "Junín", peligro: "Heladas & Huaycos", ds: "D.S. 124-2026-PCM" },
    { ubigeo: "150118", nombre: "Lurigancho-Chosica", depto: "Lima", peligro: "Huaycos Quebrada Carossio", ds: "D.S. 124-2026-PCM" },
    { ubigeo: "200107", nombre: "Cura Mori", depto: "Piura", peligro: "Desborde Fila Santa Rosa", ds: "D.S. 124-2026-PCM" },
    { ubigeo: "200114", nombre: "Tambogrande", depto: "Piura", peligro: "Crecida Río Chira/Piura", ds: "D.S. 124-2026-PCM" },
    { ubigeo: "200401", nombre: "Chulucanas", depto: "Piura", peligro: "Aislamiento Cuenca Yapatera", ds: "D.S. 124-2026-PCM" },
    { ubigeo: "200601", nombre: "Sullana", depto: "Piura", peligro: "Represa Poechos aliviadero", ds: "D.S. 124-2026-PCM" },
    { ubigeo: "140304", nombre: "Íllimo", depto: "Lambayeque", peligro: "Desborde Río La Leche", ds: "D.S. 124-2026-PCM" },
    { ubigeo: "130101", nombre: "Trujillo", depto: "La Libertad", peligro: "Quebrada San Idelfonso", ds: "D.S. 124-2026-PCM" },
    { ubigeo: "211101", nombre: "San Román (Juliaca)", depto: "Puno", peligro: "Helada Extrema -14°C", ds: "D.S. 124-2026-PCM" }
];

const PUENTES_CRITICOS = [
    { id: "PUENTE-INDEPENDENCIA", nombre: "Puente Independencia", via: "Ruta Piura-Catacaos", rio: "Río Piura", km: "Panamericana Km 998" },
    { id: "PUENTE-HUAMBACHO", nombre: "Puente Huambacho", via: "Panamericana Norte", rio: "Río Nepeña", km: "Ancash Km 408" },
    { id: "PUENTE-MATUCANA", nombre: "Puente Matucana", via: "Carretera Central", rio: "Río Rímac", km: "Huarochirí Km 74" },
    { id: "PUENTE-SIMBILA", nombre: "Puente Simbilá", via: "Acceso Catacaos", rio: "Río Piura", km: "Piura Sur" },
    { id: "PUENTE-REQUE", nombre: "Puente Reque", via: "Panamericana Norte", rio: "Río Chancay-Reque", km: "Lambayeque Km 772" }
];

export default function CommandPaletteModal() {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [selectedIndex, setSelectedIndex] = useState(0);
    const router = useRouter();
    const inputRef = useRef<HTMLInputElement>(null);

    // Escuchar atajo global Ctrl+K / Cmd+K y tecla Escape
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
                e.preventDefault();
                setIsOpen((prev) => !prev);
            } else if (e.key === "Escape") {
                setIsOpen(false);
            }
        };

        const handleCustomOpen = () => {
            setIsOpen(true);
        };

        window.addEventListener("keydown", handleKeyDown);
        window.addEventListener("open-command-palette", handleCustomOpen);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
            window.removeEventListener("open-command-palette", handleCustomOpen);
        };
    }, []);

    // Enfocar input al abrir
    useEffect(() => {
        if (isOpen) {
            setQuery("");
            setSelectedIndex(0);
            setTimeout(() => inputRef.current?.focus(), 50);
        }
    }, [isOpen]);

    // Catálogo de comandos y elementos indexados
    const items: CommandItem[] = [
        // Acciones Tácticas C2
        {
            id: "cmd-nuevo-edan",
            titulo: "Crear Nueva Ficha EDAN Digital",
            subtitulo: "Aperturar empadronamiento de familias y Bono BAE con prellenado",
            categoria: "ACCIONES_C2",
            href: "/edan?accion=nuevo",
            badge: "SINPAD v2",
            icon: Building2
        },
        {
            id: "cmd-whatsapp-campo",
            titulo: "Abrir Emulador WhatsApp Comunitario",
            subtitulo: "Monitorear reportes de damnificados en campo y alertas de corte",
            categoria: "ACCIONES_C2",
            href: "/edan?tab=whatsapp",
            badge: "Módulo 5",
            icon: MessageSquare
        },
        {
            id: "cmd-cgr-worm",
            titulo: "Verificar Integridad WORM CGR",
            subtitulo: "Auditar la cadena inmutable de bloques SHA-256 (Ley 31358)",
            categoria: "ACCIONES_C2",
            href: "/edan?tab=worm",
            badge: "Módulo 6",
            icon: Lock
        },
        {
            id: "cmd-ruteo-logistico",
            titulo: "Calcular Ruteo Humanitario Dijkstra",
            subtitulo: "Trazar convoy evitando puentes caídos y cortes de carretera",
            categoria: "ACCIONES_C2",
            href: "/logistica",
            badge: "VRP Anti-Corte",
            icon: Truck
        },
        {
            id: "cmd-simulacion-mega-fen",
            titulo: "Ejecutar Simulación Mega-FEN 2026-2027",
            subtitulo: "Calibración con ground truth de desastres históricos INDECI",
            categoria: "ACCIONES_C2",
            href: "/simulacion",
            badge: "Simulacro C2",
            icon: Zap
        },
        {
            id: "cmd-reloj-polar",
            titulo: "Consultar Reloj Polar Táctico & EAP",
            subtitulo: "Ventana dorada de horas de anticipación antes de la avenida del río",
            categoria: "ACCIONES_C2",
            href: "/pronostico",
            badge: "EAP Ventana Dorada",
            icon: Clock
        },
        // Consolas Principales
        {
            id: "nav-c2-nacional",
            titulo: "Mando C2 Nacional",
            subtitulo: "Videowall y centro de operaciones macro-estratégico",
            categoria: "CONSOLAS",
            href: "/",
            badge: "COED Nacional",
            icon: Layers
        },
        {
            id: "nav-geovisor-3d",
            titulo: "Geovisor 3D Nacional",
            subtitulo: "Visualización geoespacial de capas satelitales, ríos y topología vial",
            categoria: "CONSOLAS",
            href: "/geovisor",
            badge: "3D C2",
            icon: Compass
        },
        {
            id: "nav-contraloria",
            titulo: "Módulo de Control Concurrente CGR",
            subtitulo: "Supervisión preventiva gubernamental según Ley 31358",
            categoria: "CONSOLAS",
            href: "/contraloria",
            badge: "CGR 2026",
            icon: ShieldCheck
        },
        {
            id: "nav-amaru-lex",
            titulo: "AMARU-LEX: Marco Legal del Desastre",
            subtitulo: "Catálogo de 51 normas del SINAGERD y directivas de emergencia",
            categoria: "CONSOLAS",
            href: "/lex",
            badge: "51 Normas",
            icon: Scale
        },
        // Puentes Críticos
        ...PUENTES_CRITICOS.map((p) => ({
            id: `puente-${p.id}`,
            titulo: `${p.nombre} (${p.rio})`,
            subtitulo: `${p.via} • ${p.km} • Estado en Red Logística`,
            categoria: "PUENTES" as const,
            href: `/logistica?puente_foco=${p.id}`,
            badge: "Infraestructura Crítica",
            icon: Truck
        })),
        // Distritos Prioritarios
        ...DISTRITOS_RAPIDOS.map((d) => ({
            id: `distrito-${d.ubigeo}`,
            titulo: `${d.nombre} (${d.depto}) - UBIGEO ${d.ubigeo}`,
            subtitulo: `${d.peligro} • Vigente por ${d.ds}`,
            categoria: "DISTRITOS" as const,
            href: `/edan?ubigeo=${d.ubigeo}`,
            badge: d.depto,
            icon: MapPin
        }))
    ];

    // Filtrar resultados
    const filteredItems = items.filter((item) => {
        if (!query.trim()) return true;
        const q = query.toLowerCase();
        return (
            item.titulo.toLowerCase().includes(q) ||
            item.subtitulo.toLowerCase().includes(q) ||
            item.categoria.toLowerCase().includes(q) ||
            (item.badge && item.badge.toLowerCase().includes(q))
        );
    });

    const handleSelect = (item: CommandItem) => {
        setIsOpen(false);
        if (item.action) {
            item.action();
        } else if (item.href) {
            router.push(item.href);
        }
    };

    // Manejar navegación con teclado
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "ArrowDown") {
            e.preventDefault();
            setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredItems.length));
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setSelectedIndex((prev) => (prev - 1 + filteredItems.length) % Math.max(1, filteredItems.length));
        } else if (e.key === "Enter") {
            e.preventDefault();
            if (filteredItems[selectedIndex]) {
                handleSelect(filteredItems[selectedIndex]);
            }
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-150">
            <div
                className="w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[75vh]"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header de Búsqueda */}
                <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-800 bg-slate-950/60">
                    <Search className="w-5 h-5 text-amber-400" />
                    <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={(e) => {
                            setQuery(e.target.value);
                            setSelectedIndex(0);
                        }}
                        onKeyDown={handleKeyDown}
                        placeholder="Buscar por distrito, UBIGEO, puente, comando C2 o ley (ej: 'Catacaos', 'Independencia', 'WORM')..."
                        className="w-full bg-transparent text-sm text-white placeholder-slate-400 focus:outline-none"
                    />
                    {query && (
                        <button
                            onClick={() => setQuery("")}
                            className="text-slate-400 hover:text-white p-1"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                    <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                        ESC para salir
                    </span>
                </div>

                {/* Lista de Resultados */}
                <div className="overflow-y-auto p-2 divide-y divide-slate-800/40">
                    {filteredItems.length === 0 ? (
                        <div className="py-12 text-center text-slate-400">
                            <AlertTriangle className="w-8 h-8 text-amber-400 mx-auto mb-2 opacity-60" />
                            <p className="text-sm">No se encontraron distritos, puentes ni comandos para "{query}"</p>
                            <p className="text-xs text-slate-500 mt-1">Pruebe con "EDAN", "Piura", "Puente" o "Chupaca"</p>
                        </div>
                    ) : (
                        filteredItems.map((item, index) => {
                            const Icon = item.icon;
                            const isSelected = index === selectedIndex;
                            return (
                                <button
                                    key={item.id}
                                    onClick={() => handleSelect(item)}
                                    onMouseEnter={() => setSelectedIndex(index)}
                                    className={`w-full text-left px-3 py-2.5 rounded-xl flex items-center justify-between gap-3 transition ${
                                        isSelected
                                            ? "bg-amber-500/20 border border-amber-500/40 text-white"
                                            : "hover:bg-slate-800/60 text-slate-300 border border-transparent"
                                    }`}
                                >
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div
                                            className={`p-2 rounded-lg ${
                                                isSelected
                                                    ? "bg-amber-500 text-slate-950 font-bold"
                                                    : "bg-slate-800 text-amber-400"
                                            }`}
                                        >
                                            <Icon className="w-4 h-4" />
                                        </div>
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-bold text-white truncate">
                                                    {item.titulo}
                                                </span>
                                                {item.badge && (
                                                    <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-slate-800 text-amber-300 border border-amber-500/30">
                                                        {item.badge}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-[11px] text-slate-400 truncate mt-0.5">
                                                {item.subtitulo}
                                            </p>
                                        </div>
                                    </div>

                                    {isSelected && (
                                        <div className="flex items-center gap-1 text-[11px] text-amber-300 font-mono flex-shrink-0">
                                            <span>Abrir</span>
                                            <CornerDownLeft className="w-3.5 h-3.5" />
                                        </div>
                                    )}
                                </button>
                            );
                        })
                    )}
                </div>

                {/* Footer Táctico */}
                <div className="px-4 py-2 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                    <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                            <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px] border border-slate-700">↑</kbd>
                            <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px] border border-slate-700">↓</kbd>
                            Navegar
                        </span>
                        <span className="flex items-center gap-1">
                            <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px] border border-slate-700">Enter</kbd>
                            Seleccionar
                        </span>
                    </div>
                    <span className="text-amber-400/80 font-mono text-[10px]">
                        AMARU-CLIMATE C2 SEARCH
                    </span>
                </div>
            </div>
        </div>
    );
}
