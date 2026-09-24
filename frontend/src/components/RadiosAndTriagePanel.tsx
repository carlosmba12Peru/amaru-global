"use client";

import React, { useState, useEffect } from "react";
import {
    Radio,
    Volume2,
    ShieldAlert,
    AlertCircle,
    CheckCircle2,
    Clock,
    Send,
    Users,
    Activity,
    LifeBuoy,
    PhoneCall,
    ExternalLink,
    Sparkles
} from "lucide-react";

interface RadioStream {
    id: string;
    nombre: string;
    sede: string;
    frecuencia: string;
    stream_url: string;
    tipo_acceso: string;
    cobertura: string;
    cuencas: string[];
    descripcion: string;
}

interface TriageResult {
    timestamp_utc: string;
    estado_triaje: string;
    prioridad: string;
    color_hex: string;
    tiempo_atencion_objetivo: string;
    reportante: string;
    distrito: string;
    vulnerabilidad_detectada: {
        menores_de_edad: boolean;
        adultos_mayores: boolean;
        personas_heridas_o_atrapadas: boolean;
        amenaza_inminente_colapso: boolean;
    };
    pautas_inmediatas_supervivencia: string[];
    despacho_institucional: string[];
}

export default function RadiosAndTriagePanel() {
    const [radios, setRadios] = useState<RadioStream[]>([]);
    const [radioSeleccionada, setRadioSeleccionada] = useState<RadioStream | null>(null);
    const [textoReporte, setTextoReporte] = useState("");
    const [nombre, setNombre] = useState("");
    const [distrito, setDistrito] = useState("Catacaos");
    const [telefono, setTelefono] = useState("");
    const [procesandoTriaje, setProcesandoTriaje] = useState(false);
    const [triajeResultado, setTriajeResultado] = useState<TriageResult | null>(null);

    useEffect(() => {
        const fetchRadios = async () => {
            const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
            try {
                const res = await fetch(`${apiBase}/api/v1/radios/streams`);
                if (res.ok) {
                    const data = await res.json();
                    setRadios(data);
                    if (data.length > 0) setRadioSeleccionada(data[0]);
                }
            } catch (err) {
                console.error("Error al cargar radios:", err);
            }
        };
        fetchRadios();
    }, []);

    const ejecutarTriaje = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!textoReporte.trim()) return;

        setProcesandoTriaje(true);
        const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

        try {
            const res = await fetch(`${apiBase}/api/v1/triage/process-report`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    texto: textoReporte,
                    nombre: nombre || undefined,
                    distrito: distrito || undefined,
                    telefono: telefono || undefined
                })
            });

            if (res.ok) {
                const json = await res.json();
                setTriajeResultado(json);
            }
        } catch (err) {
            console.error("Error al procesar triaje:", err);
        } finally {
            setProcesandoTriaje(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* 1. SECTOR DE RADIOS RURALES Y COMUNITARIAS EN VIVO */}
            <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl shadow-xl">
                <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
                    <div className="flex items-center gap-2.5">
                        <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400">
                            <Radio className="w-5 h-5 animate-pulse" />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                                Red de Radiodifusión Comunitaria y Rotafono de Emergencias
                                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 font-mono px-2 py-0.5 rounded border border-emerald-500/30">
                                    EN VIVO
                                </span>
                            </h3>
                            <p className="text-[11px] text-slate-400">
                                Enlace directo con emisoras rurales que transmiten reportes ciudadanos desde cuencas altas y medias
                            </p>
                        </div>
                    </div>
                </div>

                {/* Parrilla de Emisoras */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
                    {radios.map((r) => {
                        const esActiva = radioSeleccionada?.id === r.id;
                        return (
                            <div
                                key={r.id}
                                onClick={() => setRadioSeleccionada(r)}
                                className={`p-4 rounded-xl border transition cursor-pointer flex flex-col justify-between space-y-3 ${
                                    esActiva
                                        ? "bg-slate-800/90 border-emerald-500/50 shadow-lg shadow-emerald-950/20"
                                        : "bg-slate-950/60 border-slate-800/80 hover:border-slate-700"
                                }`}
                            >
                                <div>
                                    <div className="flex items-start justify-between gap-2">
                                        <h4 className="text-xs font-bold text-slate-200">{r.nombre}</h4>
                                        <span className="text-[10px] font-mono bg-slate-900 px-2 py-0.5 rounded text-sky-400 border border-slate-800">
                                            {r.frecuencia}
                                        </span>
                                    </div>
                                    <p className="text-[11px] text-slate-400 mt-1">{r.sede} • {r.cobertura}</p>
                                    <p className="text-[10px] text-slate-500 mt-2 line-clamp-2">{r.descripcion}</p>
                                </div>

                                <div className="flex items-center justify-between pt-2 border-t border-slate-800/60">
                                    <div className="flex flex-wrap gap-1">
                                        {r.cuencas.map((c) => (
                                            <span key={c} className="text-[9px] bg-slate-900 text-slate-400 px-1.5 py-0.5 rounded">
                                                {c}
                                            </span>
                                        ))}
                                    </div>
                                    <a
                                        href={r.stream_url}
                                        target="_blank"
                                        rel="noreferrer"
                                        onClick={(e) => e.stopPropagation()}
                                        className="text-emerald-400 hover:text-emerald-300 text-xs flex items-center gap-1 font-medium"
                                    >
                                        <ExternalLink className="w-3.5 h-3.5" />
                                        <span>Escuchar</span>
                                    </a>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* 2. CONSOLA DE TRIAJE INTELIGENTE DE EMERGENCIAS (NLP) */}
            <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl shadow-xl">
                <div className="flex items-center gap-2.5 pb-4 border-b border-slate-800">
                    <div className="p-2 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400">
                        <LifeBuoy className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                            Agente de Triaje de Socorro y Priorización de Rescate (IA / NLP)
                            <span className="text-[10px] bg-rose-500/20 text-rose-400 font-mono px-2 py-0.5 rounded border border-rose-500/30">
                                INDECI / SINPAD
                            </span>
                        </h3>
                        <p className="text-[11px] text-slate-400">
                            Analiza llamadas y mensajes vecinales en lenguaje natural, detecta vulnerables y clasifica la prioridad de evacuación
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-4">
                    {/* Formulario de Entrada */}
                    <form onSubmit={ejecutarTriaje} className="lg:col-span-6 space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                            <div>
                                <label className="text-[11px] text-slate-400 block mb-1">Nombre Reportante:</label>
                                <input
                                    type="text"
                                    value={nombre}
                                    onChange={(e) => setNombre(e.target.value)}
                                    placeholder="Ej: Vecino de Chosica"
                                    className="w-full bg-slate-950 border border-slate-800 text-slate-200 px-3 py-1.5 rounded-lg text-xs focus:outline-none focus:border-sky-500"
                                />
                            </div>
                            <div>
                                <label className="text-[11px] text-slate-400 block mb-1">Distrito Crítico:</label>
                                <input
                                    type="text"
                                    value={distrito}
                                    onChange={(e) => setDistrito(e.target.value)}
                                    placeholder="Ej: Catacaos, Chosica"
                                    className="w-full bg-slate-950 border border-slate-800 text-slate-200 px-3 py-1.5 rounded-lg text-xs focus:outline-none focus:border-sky-500"
                                />
                            </div>
                            <div>
                                <label className="text-[11px] text-slate-400 block mb-1">Teléfono Contacto:</label>
                                <input
                                    type="text"
                                    value={telefono}
                                    onChange={(e) => setTelefono(e.target.value)}
                                    placeholder="Ej: 987654321"
                                    className="w-full bg-slate-950 border border-slate-800 text-slate-200 px-3 py-1.5 rounded-lg text-xs focus:outline-none focus:border-sky-500"
                                />
                            </div>
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-1">
                                <label className="text-[11px] text-slate-400">
                                    Transcripción del Mensaje o Llamada de Auxilio:
                                </label>
                                <button
                                    type="button"
                                    onClick={() => setTextoReporte("¡Auxilio por favor! Se rompió el dique en Pedregal Grande, el agua sigue subiendo y estamos atrapados en el techo con mi abuela de 84 años y dos bebés. No hay luz y la corriente es muy fuerte.")}
                                    className="text-[10px] text-sky-400 hover:text-sky-300 font-mono"
                                >
                                    Cargar Caso Crítico de Ejemplo
                                </button>
                            </div>
                            <textarea
                                rows={4}
                                value={textoReporte}
                                onChange={(e) => setTextoReporte(e.target.value)}
                                placeholder="Escriba o pegue la transcripción del audio vecinal... Ej: 'El río se está desbordando, se cayó el puente y hay personas heridas en el techo...'"
                                className="w-full bg-slate-950 border border-slate-800 text-slate-200 p-3 rounded-xl text-xs focus:outline-none focus:border-rose-500 font-sans leading-relaxed"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={procesandoTriaje || !textoReporte.trim()}
                            className="w-full bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition flex items-center justify-center gap-2 shadow-lg shadow-rose-950/40"
                        >
                            {procesandoTriaje ? (
                                <>
                                    <Activity className="w-4 h-4 animate-spin" />
                                    <span>Evaluando con IA Táctica y Modelos NLP...</span>
                                </>
                            ) : (
                                <>
                                    <Sparkles className="w-4 h-4" />
                                    <span>Procesar Triaje y Despachar a Plataforma SINPAD</span>
                                </>
                            )}
                        </button>
                    </form>

                    {/* Resultado del Triaje */}
                    <div className="lg:col-span-6 bg-slate-950 p-4 rounded-2xl border border-slate-800 flex flex-col justify-between">
                        {triajeResultado ? (
                            <div className="space-y-3">
                                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                                    <span className="text-xs text-slate-400 font-mono">
                                        Nivel de Prioridad Operativa:
                                    </span>
                                    <span
                                        className="text-xs font-mono font-bold px-3 py-1 rounded-full border"
                                        style={{
                                            backgroundColor: `${triajeResultado.color_hex}15`,
                                            borderColor: `${triajeResultado.color_hex}40`,
                                            color: triajeResultado.color_hex
                                        }}
                                    >
                                        {triajeResultado.prioridad}
                                    </span>
                                </div>

                                <div className="text-xs font-mono text-slate-400">
                                    Tiempo de Respuesta Objetivo: <strong className="text-slate-200">{triajeResultado.tiempo_atencion_objetivo}</strong>
                                </div>

                                {/* Vulnerables Detectados */}
                                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1.5 text-xs">
                                    <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold block">
                                        Vulnerabilidad Georreferenciada:
                                    </span>
                                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                                        <div className="flex items-center gap-1.5">
                                            {triajeResultado.vulnerabilidad_detectada.menores_de_edad ? (
                                                <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
                                            ) : (
                                                <CheckCircle2 className="w-3.5 h-3.5 text-slate-600" />
                                            )}
                                            <span className={triajeResultado.vulnerabilidad_detectada.menores_de_edad ? "text-rose-300 font-bold" : "text-slate-500"}>
                                                Menores / Lactantes
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            {triajeResultado.vulnerabilidad_detectada.adultos_mayores ? (
                                                <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
                                            ) : (
                                                <CheckCircle2 className="w-3.5 h-3.5 text-slate-600" />
                                            )}
                                            <span className={triajeResultado.vulnerabilidad_detectada.adultos_mayores ? "text-rose-300 font-bold" : "text-slate-500"}>
                                                Adultos Mayores
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            {triajeResultado.vulnerabilidad_detectada.personas_heridas_o_atrapadas ? (
                                                <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
                                            ) : (
                                                <CheckCircle2 className="w-3.5 h-3.5 text-slate-600" />
                                            )}
                                            <span className={triajeResultado.vulnerabilidad_detectada.personas_heridas_o_atrapadas ? "text-rose-300 font-bold" : "text-slate-500"}>
                                                Heridos / Atrapados
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            {triajeResultado.vulnerabilidad_detectada.amenaza_inminente_colapso ? (
                                                <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
                                            ) : (
                                                <CheckCircle2 className="w-3.5 h-3.5 text-slate-600" />
                                            )}
                                            <span className={triajeResultado.vulnerabilidad_detectada.amenaza_inminente_colapso ? "text-rose-300 font-bold" : "text-slate-500"}>
                                                Riesgo Inminente
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Pautas de Supervivencia INDECI */}
                                <div className="space-y-1.5">
                                    <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold block">
                                        Pautas Oficiales de Contención Emitidas:
                                    </span>
                                    <ul className="space-y-1 text-xs text-slate-300 list-disc list-inside">
                                        {triajeResultado.pautas_inmediatas_supervivencia.map((p, idx) => (
                                            <li key={idx} className="text-[11px] leading-relaxed">
                                                {p}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        ) : (
                            <div className="h-full min-h-[220px] flex flex-col items-center justify-center text-center p-4 text-slate-500 space-y-2">
                                <PhoneCall className="w-8 h-8 text-slate-600 animate-pulse" />
                                <span className="text-xs font-semibold text-slate-400">
                                    Esperando reporte de emergencia para clasificar
                                </span>
                                <span className="text-[11px] max-w-xs text-slate-600">
                                    Ingrese el texto o use el caso de ejemplo para ver la priorización inmediata de rescate.
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
