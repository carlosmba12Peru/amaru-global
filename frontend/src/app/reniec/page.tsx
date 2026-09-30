"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { API_BASE } from "@/config/api";
import {
    UserCheck,
    Shield,
    Search,
    AlertTriangle,
    CheckCircle2,
    XCircle,
    Building2,
    FileText,
    RefreshCw,
    ExternalLink,
    AlertOctagon,
    Award,
    Clock,
    Calendar,
    MapPin,
    Hash,
    Copy,
    Check,
    Cpu,
    ArrowRight
} from "lucide-react";

interface PersonaReniec {
    coResultado: string;
    nuDni: string;
    preNombres?: string;
    apPrimer?: string;
    apSegundo?: string;
    nombreCompleto?: string;
    fechaNacimiento?: string;
    edad?: number;
    sexo?: string;
    estadoCivil?: string;
    ubigeo?: string;
    departamento?: string;
    provincia?: string;
    distrito?: string;
    direccion?: string;
    restriccion?: string;
    esValidoBae: boolean;
    mensaje?: string;
    error?: string;
    origen_datos?: string;
    advertencia_contingencia?: string;
}

interface CasoSimulacion {
    categoria: string;
    titulo: string;
    dni: string;
    descripcion: string;
    resultado_esperado: string;
}

interface EstadoConexion {
    pide_live_activo: boolean;
    endpoint_oficial: string;
    ruc_entidad: string;
    dni_operador: string;
    simulador_contingencia_activo: boolean;
    total_consultas_sesion: number;
}

interface RegistroBitacora {
    id_consulta: string;
    dni_consultado: string;
    fecha_hora: string;
    modo_conexion: string;
    co_resultado: string;
    nombre: string;
    restriccion: string;
    hash_trama: string;
}

export default function ReniecValidacionPage() {
    const [dniBusqueda, setDniBusqueda] = useState<string>("45892134");
    const [persona, setPersona] = useState<PersonaReniec | null>(null);
    const [casosSimulacion, setCasosSimulacion] = useState<CasoSimulacion[]>([]);
    const [estadoConexion, setEstadoConexion] = useState<EstadoConexion | null>(null);
    const [bitacora, setBitacora] = useState<RegistroBitacora[]>([]);
    const [cargando, setCargando] = useState<boolean>(false);
    const [copiado, setCopiado] = useState<boolean>(false);

    // Cargar casos de simulación y estado al inicio
    useEffect(() => {
        cargarCasos();
        cargarEstado();
        consultarDni("45892134");
    }, []);

    const cargarCasos = async () => {
        try {
            const res = await fetch(`${API_BASE}/api/v1/pide/reniec/casos-simulacion`);
            if (res.ok) {
                const data = await res.json();
                setCasosSimulacion(data);
            }
        } catch (err) {
            console.error("Error al cargar casos de simulación:", err);
        }
    };

    const cargarEstado = async () => {
        try {
            const res = await fetch(`${API_BASE}/api/v1/pide/reniec/estado-conexion`);
            if (res.ok) {
                const data = await res.json();
                setEstadoConexion(data);
            }
        } catch (err) {
            console.error("Error al cargar estado PIDE:", err);
        }
    };

    const consultarDni = async (dni: string) => {
        if (!dni || dni.length !== 8) return;
        setCargando(true);
        try {
            const res = await fetch(`${API_BASE}/api/v1/pide/reniec/consultar/${dni}`);
            if (res.ok) {
                const data: PersonaReniec = await res.json();
                setPersona(data);
                // Actualizar bitácora
                const resBit = await fetch(`${API_BASE}/api/v1/pide/reniec/bitacora`);
                if (resBit.ok) {
                    const dataBit = await resBit.json();
                    setBitacora(dataBit.consultas || []);
                }
            }
        } catch (err) {
            console.error("Error al consultar DNI:", err);
        } finally {
            setCargando(false);
        }
    };

    const handleCopiarTrama = () => {
        if (!persona) return;
        navigator.clipboard.writeText(JSON.stringify(persona, null, 2));
        setCopiado(true);
        setTimeout(() => setCopiado(false), 2000);
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 font-sans">
            {/* Header Institucional PIDE / SGTD-PCM */}
            <header className="max-w-7xl mx-auto mb-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-500/20 text-sky-300 border border-sky-500/30 flex items-center gap-1.5">
                                <Cpu className="w-3.5 h-3.5" />
                                PIDE (Plataforma de Interoperabilidad del Estado - PCM)
                            </span>
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                D.L. Nº 1246 & D.U. Nº 006-2020
                            </span>
                        </div>
                        <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
                            <UserCheck className="w-8 h-8 text-sky-400" />
                            Consola de Validación RENIEC & Simulador PIDE
                        </h1>
                        <p className="text-sm text-slate-400 mt-1 max-w-3xl">
                            Verificación de identidad oficial en tiempo real para el empadronamiento EDAN SINPAD v2. Auto-completado de nombres oficiales y filtro liminar contra cobros indebidos del Bono BAE mediante detección de titulares fallecidos.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <Link
                            href="/edan"
                            className="px-4 py-2.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-sm font-semibold flex items-center gap-2 transition"
                        >
                            <Building2 className="w-4 h-4" />
                            Ir a Formulario EDAN
                            <ExternalLink className="w-3.5 h-3.5 opacity-60" />
                        </Link>
                    </div>
                </div>

                {/* Barra de Estado del Enlace PIDE */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                    <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl">
                        <span className="text-xs text-slate-400 block mb-1">Estado de Interconexión</span>
                        <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                            <span className="text-sm font-bold text-emerald-300">
                                {estadoConexion?.simulador_contingencia_activo ? "Simulador Contingencia FEN" : "PIDE Live Conectado"}
                            </span>
                        </div>
                        <span className="text-[11px] text-slate-500 mt-1 block">Alta Resiliencia ante caída de fibra</span>
                    </div>

                    <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl">
                        <span className="text-xs text-slate-400 block mb-1">RUC Entidad Solicitante</span>
                        <div className="text-sm font-bold text-white font-mono">{estadoConexion?.ruc_entidad || "20148127411"}</div>
                        <span className="text-[11px] text-slate-400 mt-0.5 block">INDECI / Sede Municipal Piura</span>
                    </div>

                    <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl">
                        <span className="text-xs text-slate-400 block mb-1">DNI Operador SINPAD</span>
                        <div className="text-sm font-bold text-sky-400 font-mono">{estadoConexion?.dni_operador || "42891045"}</div>
                        <span className="text-[11px] text-slate-400 mt-0.5 block">Especialista EDAN Certificado</span>
                    </div>

                    <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl">
                        <span className="text-xs text-slate-400 block mb-1">Consultas en Sesión</span>
                        <div className="text-2xl font-black text-amber-400">{bitacora.length}</div>
                        <span className="text-[11px] text-amber-500/80 mt-0.5 block">Auditadas en Bitácora CGR</span>
                    </div>
                </div>
            </header>

            {/* Contenedor Principal: Casos Rápidos, Búsqueda y Tarjeta de Identidad */}
            <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Panel Izquierdo: Buscador & Casos de Simulación (5 cols) */}
                <div className="lg:col-span-5 space-y-4">
                    {/* Buscador Interactivo */}
                    <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl space-y-3">
                        <label className="text-xs font-bold text-slate-300 block uppercase tracking-wider flex items-center gap-1.5">
                            <Search className="w-3.5 h-3.5 text-sky-400" />
                            Consulta Directa por DNI (8 Dígitos)
                        </label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                maxLength={8}
                                placeholder="Ej: 45892134"
                                value={dniBusqueda}
                                onChange={(e) => setDniBusqueda(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && consultarDni(dniBusqueda)}
                                className="w-full bg-slate-950 border border-slate-700 text-sm font-mono rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-sky-500"
                            />
                            <button
                                onClick={() => consultarDni(dniBusqueda)}
                                disabled={cargando || dniBusqueda.length !== 8}
                                className="px-5 py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition disabled:opacity-50"
                            >
                                {cargando ? <RefreshCw className="w-4 h-4 animate-spin" /> : "Consultar"}
                            </button>
                        </div>
                        <p className="text-[11px] text-slate-500">
                            Cualquier DNI de 8 dígitos generará una validación conforme determinística bajo la especificación de la PCM.
                        </p>
                    </div>

                    {/* Escenarios de Prueba Rápida para Simulación */}
                    <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl space-y-3">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                                <Cpu className="w-3.5 h-3.5" />
                                Casos de Simulación & Fiscalización CGR
                            </h2>
                            <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full font-bold">
                                Escenarios FEN
                            </span>
                        </div>
                        <p className="text-xs text-slate-400">
                            Selecciona un caso típico para probar la respuesta del motor ante fraudes o inconsistencias de padrón:
                        </p>

                        <div className="space-y-2">
                            {casosSimulacion.map((c) => {
                                const esActivo = persona?.nuDni === c.dni;
                                return (
                                    <div
                                        key={c.dni}
                                        onClick={() => {
                                            setDniBusqueda(c.dni);
                                            consultarDni(c.dni);
                                        }}
                                        className={`p-3 rounded-xl border text-xs cursor-pointer transition ${
                                            esActivo
                                                ? "bg-sky-950/40 border-sky-500 shadow-md"
                                                : "bg-slate-950/60 border-slate-800 hover:bg-slate-800/40"
                                        }`}
                                    >
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="font-bold text-white">{c.titulo}</span>
                                            <span className="font-mono text-sky-400 font-bold">{c.dni}</span>
                                        </div>
                                        <p className="text-slate-400 text-[11px] leading-relaxed mb-1.5">
                                            {c.descripcion}
                                        </p>
                                        <div className="flex items-center justify-between text-[10px] border-t border-slate-800/60 pt-1.5 text-slate-500">
                                            <span>Esperado: <strong className="text-slate-300">{c.resultado_esperado}</strong></span>
                                            <span className="text-sky-400 flex items-center gap-1 hover:underline">
                                                Cargar prueba <ArrowRight className="w-3 h-3" />
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Panel Derecho: Tarjeta Oficial RENIEC & Trama Técnica (7 cols) */}
                <div className="lg:col-span-7 space-y-6">
                    {persona ? (
                        <>
                            {/* Tarjeta de Identidad Oficial RENIEC */}
                            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 relative overflow-hidden shadow-xl">
                                {/* Marca de agua decorativa */}
                                <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 opacity-5 pointer-events-none">
                                    <Shield className="w-64 h-64 text-white" />
                                </div>

                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800 relative z-10">
                                    <div>
                                        <div className="text-[10px] uppercase font-bold tracking-widest text-slate-400 mb-0.5">
                                            Registro Nacional de Identificación y Estado Civil
                                        </div>
                                        <h2 className="text-xl font-black text-white flex items-center gap-2">
                                            {persona.nombreCompleto || "REGISTRO DE IDENTIDAD"}
                                        </h2>
                                    </div>

                                    <div>
                                        {persona.restriccion === "FALLECIDO" ? (
                                            <span className="px-3 py-1 rounded-full text-xs font-black bg-rose-500/20 text-rose-300 border border-rose-500/50 flex items-center gap-1.5">
                                                <XCircle className="w-4 h-4" />
                                                TITULAR FALLECIDO
                                            </span>
                                        ) : persona.restriccion === "MENOR DE EDAD" ? (
                                            <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/50 flex items-center gap-1.5">
                                                <AlertTriangle className="w-4 h-4" />
                                                MENOR DE EDAD ({persona.edad} AÑOS)
                                            </span>
                                        ) : (
                                            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1.5">
                                                <CheckCircle2 className="w-4 h-4" />
                                                VIGENTE - APTO BONO BAE
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Banner de Alerta Crítica si es fallecido */}
                                {persona.restriccion === "FALLECIDO" && (
                                    <div className="mt-4 bg-rose-950/60 border border-rose-600/70 p-4 rounded-xl text-xs text-rose-200 flex items-start gap-3">
                                        <AlertOctagon className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
                                        <div>
                                            <strong className="block font-bold text-rose-300 text-sm mb-0.5">
                                                ALERTA DE FISCALIZACIÓN CGR: Rechazo Liminar
                                            </strong>
                                            {persona.mensaje}
                                        </div>
                                    </div>
                                )}

                                {/* Datos Desglosados */}
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 mt-5 text-xs">
                                    <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                                        <span className="text-slate-400 block text-[11px] mb-0.5">DNI Titular:</span>
                                        <div className="font-mono text-base font-bold text-sky-400">{persona.nuDni}</div>
                                    </div>

                                    <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                                        <span className="text-slate-400 block text-[11px] mb-0.5">Edad / Sexo:</span>
                                        <div className="font-bold text-white">{persona.edad} años ({persona.sexo === "M" ? "Masculino" : "Femenino"})</div>
                                    </div>

                                    <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                                        <span className="text-slate-400 block text-[11px] mb-0.5">Estado Civil:</span>
                                        <div className="font-bold text-white">{persona.estadoCivil || "SOLTERO"}</div>
                                    </div>

                                    <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                                        <span className="text-slate-400 block text-[11px] mb-0.5">Fecha Nacimiento:</span>
                                        <div className="font-mono text-white">{persona.fechaNacimiento}</div>
                                    </div>

                                    <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                                        <span className="text-slate-400 block text-[11px] mb-0.5">UBIGEO Residencia:</span>
                                        <div className="font-mono text-emerald-400 font-bold">{persona.ubigeo} ({persona.distrito})</div>
                                    </div>

                                    <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                                        <span className="text-slate-400 block text-[11px] mb-0.5">Elegibilidad BAE:</span>
                                        <div className={`font-bold ${persona.esValidoBae ? "text-emerald-400" : "text-rose-400"}`}>
                                            {persona.esValidoBae ? "Habilitado (S/ 500/mes)" : "Bloqueado"}
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-3.5 bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs">
                                    <span className="text-slate-400 block text-[11px] mb-0.5 flex items-center gap-1">
                                        <MapPin className="w-3 h-3 text-amber-400" />
                                        Dirección Registrada según Padrón Electoral:
                                    </span>
                                    <div className="font-medium text-slate-200">
                                        {persona.direccion} - {persona.distrito}, {persona.provincia}, {persona.departamento}
                                    </div>
                                </div>

                                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
                                    <span>Origen de Telemetría: <strong className="text-slate-400">{persona.origen_datos}</strong></span>
                                    <span>Código de Respuesta: <strong className="font-mono text-sky-400">{persona.coResultado}</strong></span>
                                </div>
                            </div>

                            {/* Trama Técnica SOAP/JSON Oficial PIDE (Para Auditoría Técnica) */}
                            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-wider">
                                        <Hash className="w-3.5 h-3.5 text-sky-400" />
                                        Trama Técnica de Interoperabilidad PIDE (SGTD-PCM)
                                    </div>
                                    <button
                                        onClick={handleCopiarTrama}
                                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] flex items-center gap-1 transition"
                                    >
                                        {copiado ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                                        {copiado ? "Copiado" : "Copiar JSON"}
                                    </button>
                                </div>
                                <pre className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-[11px] font-mono text-sky-300 overflow-x-auto max-h-48">
                                    {JSON.stringify(persona, null, 2)}
                                </pre>
                            </div>
                        </>
                    ) : (
                        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-16 text-center text-slate-500 text-sm">
                            Ingrese un DNI de 8 dígitos para consultar la base nacional RENIEC vía PIDE.
                        </div>
                    )}

                    {/* Bitácora de Consultas Realizadas */}
                    {bitacora.length > 0 && (
                        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-3">
                            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5 text-amber-400" />
                                Registro de Auditoría de Consultas en Sesión ({bitacora.length})
                            </h3>
                            <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1">
                                {bitacora.map((b) => (
                                    <div key={b.id_consulta} className="bg-slate-950 p-2 rounded-lg border border-slate-800 flex items-center justify-between text-[11px]">
                                        <div className="flex items-center gap-2">
                                            <span className="font-mono text-sky-400 font-bold">{b.dni_consultado}</span>
                                            <span className="text-slate-300 truncate max-w-[200px]">{b.nombre}</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-slate-400 font-mono text-[10px]">
                                            <span className={`px-1.5 py-0.5 rounded ${b.restriccion === "FALLECIDO" ? "bg-rose-900 text-rose-300" : "bg-slate-800 text-slate-300"}`}>
                                                {b.restriccion}
                                            </span>
                                            <span>{b.fecha_hora.split(" ")[1]}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
