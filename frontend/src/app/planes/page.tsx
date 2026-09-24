"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
    FileText,
    Building2,
    ShieldAlert,
    ShieldCheck,
    AlertTriangle,
    CheckCircle2,
    Users,
    Search,
    Printer,
    Download,
    Copy,
    Check,
    Scale,
    Waves,
    Compass,
    Sparkles,
    Clock,
    ChevronRight,
    MapPin,
    Phone,
    Mail,
    Home,
    Truck,
    Radio,
    AlertOctagon,
    Landmark,
    Coins,
    TrendingUp,
    ExternalLink
} from "lucide-react";

interface ObraPPRRD {
    cui: string;
    proyecto: string;
    monto_pim_soles: number;
    monto_devengado_soles: number;
    avance_porcentaje: number;
    cuello_botella_siaf: string;
    semaforo_inaccion: string;
    alerta_omision_art377_cp: boolean;
    accion_preventiva_urgente: string;
}

interface Albergue {
    codigo_modular?: string;
    nombre: string;
    tipo_instalacion: string;
    capacidad_personas: number;
    cota_segura_inundacion: boolean;
    servicio_agua_letrinas: boolean;
    vetado_por_antecedente_historico: boolean;
    observacion: string;
}

interface PlanDigital {
    id_expediente: string;
    fecha_generacion_utc: string;
    ubigeo: string;
    distrito: string;
    provincia: string;
    departamento: string;
    periodo_vigencia: string;
    declarado_ds_124_pcm: boolean;
    hash_sha256: string;
    marco_normativo_aplicable: string[];
    capitulo1_escenario_riesgo: {
        ubigeo: string;
        distrito: string;
        provincia: string;
        departamento: string;
        cuenca_rio: string;
        declarado_emergencia_ds124: boolean;
        nivel_peligro_cenepred: string;
        parametros_peligro: {
            tipo_peligro: string;
            lluvia_gatillo_24h_mm: number;
            caudal_critico_desborde_m3s: number;
            tiempo_concentracion_horas: number;
            nivel_saturacion_suelo_pct: number;
            evento_analogo_referencia: string;
            factor_amplificacion_fen: number;
        };
        exposicion: {
            poblacion_total_distrital: number;
            poblacion_expuesta_faja_marginal: number;
            familias_alto_riesgo_no_mitigable: number;
            viviendas_material_precario: number;
            centros_poblados_sectores_criticos: string[];
            vias_vecinales_vulnerables: string[];
            puentes_en_riesgo_socavacion: any[];
            centros_salud_zona_inundable: string[];
            locales_escolares_vulnerables: string[];
        };
        estimacion_danos_probables: {
            familias_damnificadas_probables: number;
            hectareas_cultivos_inundables: number;
            perdidas_economicas_estimadas_soles: number;
            leccion_historica: string;
        };
    };
    capitulo2_organizacion_mando: {
        presidente_gt_grd: string;
        secretario_tecnico: string;
        integrantes: Array<{
            cargo_comite: string;
            titular_nombre: string;
            cargo_institucional: string;
            telefono_contacto: string;
            correo_institucional: string;
        }>;
        plataforma_defensa_civil_actores: string[];
        coel_ubicacion_puesto_comando: string;
        frecuencias_radiales_hf_vhf: string;
        enlace_coer_regional: string;
    };
    capitulo3_procedimientos_respuesta: {
        protocolo_alerta_temprana: any;
        rutas_evacuacion_zonas_seguras: any[];
        albergues_temporales: Albergue[];
        bienes_ayuda_humanitaria: {
            carpas_familiares_unidades: number;
            frazadas_termicas_unidades: number;
            camas_plegables_unidades: number;
            bidones_agua_131l_unidades: number;
            raciones_frias_72h_unidades: number;
            bobinas_plastico_pesado_unidades: number;
            herramientas_palas_picos_unidades: number;
            stock_disponible_almacen_local: string;
            deficit_requerido_indeci_nivel2: string;
        };
        maquinaria_pesada_primera_respuesta: any[];
        brigadas_comunitarias_ayni: string[];
    };
    capitulo4_continuidad_operativa: {
        abastecimiento_provisorio_agua: string;
        puntos_distribucion_camion_cisterna: string[];
        atencion_medica_avanzada_triage: string;
        transitabilidad_rutas_alternas: string;
        puntos_criticos_enlace_telecom: string;
    };
    capitulo5_inversion_pprrd_mef: {
        programa_presupuestal: string;
        total_proyectos_cui: number;
        monto_total_pim_soles: number;
        monto_total_devengado_soles: number;
        avance_financiero_global_pct: number;
        obras_prioritarias_defensas: ObraPPRRD[];
        medidas_no_estructurales_ordenamiento: string[];
    };
    anexo_legal_resolucion_alcaldia: {
        numero_resolucion: string;
        titulo: string;
        fecha_emision: string;
        vistos: string[];
        considerandos: string[];
        articulos_resolutivos: string[];
        firmante_alcalde: string;
        distrito: string;
    };
}

const DISTRITOS_EJEMPLO = [
    { ubigeo: "200105", nombre: "Catacaos", depto: "Piura", desc: "Bajo Piura - Desborde histórico 2017" },
    { ubigeo: "200108", nombre: "El Tallán", depto: "Piura", desc: "Cuenca Baja rural - Plan 2026 calibrado" },
    { ubigeo: "130105", nombre: "La Esperanza", depto: "La Libertad", desc: "Quebradas San Ildefonso y El León" },
    { ubigeo: "150118", nombre: "Lurigancho-Chosica", depto: "Lima", desc: "Cuenca Río Rímac - Huaicos" },
    { ubigeo: "020105", nombre: "Independencia", depto: "Áncash", desc: "Huaraz - Cuenca Río Quillcay" },
    { ubigeo: "110101", nombre: "Ica (Capital)", depto: "Ica", desc: "Valle de Ica - Memoria FEN 1998/2015" }
];

export default function PlanesContingenciaPage() {
    const [selectedUbigeo, setSelectedUbigeo] = useState<string>("200105");
    const [plan, setPlan] = useState<PlanDigital | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [activeTab, setActiveTab] = useState<"resolucion" | "escenario" | "mando" | "respuesta" | "pprrd" | "calibracion">("resolucion");
    const [copied, setCopied] = useState<boolean>(false);
    const [searchQuery, setSearchQuery] = useState<string>("");

    const fetchPlan = async (ubigeo: string) => {
        setLoading(true);
        try {
            const res = await fetch(`/api/v1/planes/contingencia/${ubigeo}`);
            if (res.ok) {
                const data = await res.json();
                setPlan(data);
            }
        } catch (err) {
            console.error("Error cargando plan:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPlan(selectedUbigeo);
    }, [selectedUbigeo]);

    const handleCopyResolucion = () => {
        if (!plan) return;
        const res = plan.anexo_legal_resolucion_alcaldia;
        const text = `${res.numero_resolucion}\n${res.titulo}\n\n${res.fecha_emision}\n\nVISTOS:\n${res.vistos.map(v => "- " + v).join("\n")}\n\nCONSIDERANDO:\n${res.considerandos.map(c => "- " + c).join("\n")}\n\nSE RESUELVE:\n${res.articulos_resolutivos.join("\n\n")}\n\nRegístrese, comuníquese y cúmplase.\n\n${res.firmante_alcalde}\nAlcalde Distrital de ${res.distrito}`;
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8">
            {/* Header Gubernamental */}
            <div className="max-w-7xl mx-auto mb-8 border-b border-slate-800 pb-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                                SINAGERD • LEY N.° 29664
                            </span>
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                                R.J. 188-2015-INDECI
                            </span>
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-500/20 text-sky-300 border border-sky-500/40">
                                R.J. 058-2019-CENEPRED
                            </span>
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/40">
                                D.S. 124-2026-PCM
                            </span>
                        </div>
                        <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
                            <FileText className="w-8 h-8 text-emerald-400" />
                            AMARU-PLAN: Planes de Contingencia & PPRRD Digitales 2026–2027
                        </h1>
                        <p className="text-slate-400 text-sm mt-1 max-w-3xl">
                            Motor de generación técnica y resolución de alcaldía automatizada para los 1,891 municipios del Perú.
                            Integra la respuesta operativa inmediata de INDECI con las inversiones estructurales de CENEPRED y el avance fiscal en Consulta Amigable MEF (PP 0068).
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={handlePrint}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-semibold border border-slate-700 transition-colors shadow-sm"
                        >
                            <Printer className="w-4 h-4 text-emerald-400" />
                            Imprimir Expediente
                        </button>
                    </div>
                </div>

                {/* Selector Rápido de Distritos Críticos */}
                <div className="mt-6 flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-2">
                        Distritos Piloto Calibrados:
                    </span>
                    {DISTRITOS_EJEMPLO.map((d) => (
                        <button
                            key={d.ubigeo}
                            onClick={() => setSelectedUbigeo(d.ubigeo)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                                selectedUbigeo === d.ubigeo
                                    ? "bg-emerald-600 text-white border-emerald-500 shadow-md shadow-emerald-900/30"
                                    : "bg-slate-900/80 text-slate-300 border-slate-800 hover:border-slate-700 hover:bg-slate-800"
                            }`}
                        >
                            <span className="font-bold">{d.nombre}</span> ({d.depto})
                        </button>
                    ))}
                </div>
            </div>

            {/* Ficha Resumen del Distrito Activo */}
            {plan && (
                <div className="max-w-7xl mx-auto mb-6 bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-lg backdrop-blur">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                        <div>
                            <div className="text-xs text-slate-400 font-semibold uppercase">Distrito y Jurisdicción</div>
                            <div className="text-xl font-bold text-white flex items-center gap-2 mt-0.5">
                                <MapPin className="w-5 h-5 text-emerald-400" />
                                {plan.distrito}, {plan.provincia}
                            </div>
                            <div className="text-xs text-slate-400 mt-0.5">
                                Región: {plan.departamento} • UBIGEO: <span className="text-emerald-400 font-mono font-bold">{plan.ubigeo}</span>
                            </div>
                        </div>

                        <div>
                            <div className="text-xs text-slate-400 font-semibold uppercase">Presidente GT-GRD (Alcalde)</div>
                            <div className="text-sm font-bold text-slate-100 flex items-center gap-2 mt-0.5">
                                <Building2 className="w-4 h-4 text-sky-400" />
                                {plan.capitulo2_organizacion_mando.presidente_gt_grd}
                            </div>
                            <div className="text-xs text-slate-400 mt-0.5">
                                Tel: {plan.capitulo2_organizacion_mando.integrantes[0]?.telefono_contacto || "115"}
                            </div>
                        </div>

                        <div>
                            <div className="text-xs text-slate-400 font-semibold uppercase">Estado Legal y Cuenca</div>
                            <div className="flex items-center gap-2 mt-1">
                                {plan.declarado_ds_124_pcm ? (
                                    <span className="px-2 py-0.5 rounded text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
                                        D.S. 124-2026-PCM (EMERGENCIA)
                                    </span>
                                ) : (
                                    <span className="px-2 py-0.5 rounded text-xs font-bold bg-slate-800 text-slate-400">
                                        ORDINARIO
                                    </span>
                                )}
                            </div>
                            <div className="text-xs text-slate-400 mt-1">
                                Cuenca: <span className="text-amber-300 font-medium">{plan.capitulo1_escenario_riesgo.cuenca_rio}</span>
                            </div>
                        </div>

                        <div>
                            <div className="text-xs text-slate-400 font-semibold uppercase">Sellado Digital SHA-256</div>
                            <div className="font-mono text-[11px] text-slate-300 truncate bg-slate-950 px-2 py-1 rounded border border-slate-800 mt-1">
                                {plan.hash_sha256}
                            </div>
                            <div className="text-[10px] text-slate-500 mt-0.5 flex items-center gap-1">
                                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                                Certificado C2 • Vigencia 2026–2027
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Navegación por Capítulos */}
            <div className="max-w-7xl mx-auto mb-6 flex flex-wrap border-b border-slate-800 gap-1">
                {[
                    { id: "resolucion", label: "Resolución de Alcaldía", icon: Scale },
                    { id: "escenario", label: "Cap. I: Escenario de Riesgo", icon: AlertTriangle },
                    { id: "mando", label: "Cap. II: Mando GT-GRD", icon: Users },
                    { id: "respuesta", label: "Cap. III: Respuesta & Albergues", icon: Home },
                    { id: "pprrd", label: "Cap. V: Obras PP 0068 MEF", icon: Landmark },
                    { id: "calibracion", label: "Calibración Empírica 2026", icon: Sparkles }
                ].map((tab) => {
                    const Icon = tab.icon;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-all ${
                                activeTab === tab.id
                                    ? "border-emerald-500 text-emerald-400 bg-emerald-950/20"
                                    : "border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700"
                            }`}
                        >
                            <Icon className="w-4 h-4" />
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            {/* Contenido Modular */}
            <div className="max-w-7xl mx-auto">
                {loading ? (
                    <div className="flex flex-col items-center justify-center p-16 bg-slate-900/50 rounded-xl border border-slate-800">
                        <Clock className="w-10 h-10 text-emerald-400 animate-spin mb-3" />
                        <p className="text-slate-300 font-medium">Ensamblando Plan de Contingencia Digital y cruzando SIAF MEF...</p>
                        <span className="text-xs text-slate-500 mt-1">Calibrando con INDECI y Directorio Municipal INEI 2026</span>
                    </div>
                ) : plan && (
                    <>
                        {/* TAB 1: RESOLUCIÓN DE ALCALDÍA */}
                        {activeTab === "resolucion" && (
                            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 shadow-xl">
                                <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-800">
                                    <div>
                                        <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider">
                                            INSTRUMENTO DE APROBACIÓN FORMAL • SINAGERD ART. 14
                                        </span>
                                        <h2 className="text-xl font-bold text-white mt-1">
                                            {plan.anexo_legal_resolucion_alcaldia.numero_resolucion}
                                        </h2>
                                    </div>
                                    <button
                                        onClick={handleCopyResolucion}
                                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow transition-colors"
                                    >
                                        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                        {copied ? "¡Copiado al Portapapeles!" : "Copiar Minuta Legal"}
                                    </button>
                                </div>

                                <div className="bg-slate-950 border border-slate-800 rounded-lg p-6 font-serif text-slate-300 text-sm leading-relaxed space-y-4 shadow-inner max-w-4xl mx-auto">
                                    <div className="text-center font-bold text-base text-white border-b border-slate-800 pb-3">
                                        MUNICIPALIDAD DISTRITAL DE {plan.distrito.toUpperCase()}<br />
                                        <span className="text-xs text-slate-400 font-sans">
                                            PROVINCIA DE {plan.provincia.toUpperCase()} - DEPARTAMENTO DE {plan.departamento.toUpperCase()}
                                        </span>
                                    </div>

                                    <div className="font-bold text-slate-200">
                                        {plan.anexo_legal_resolucion_alcaldia.titulo}
                                    </div>

                                    <div className="text-right text-xs text-slate-400">
                                        {plan.distrito}, {plan.anexo_legal_resolucion_alcaldia.fecha_emision}
                                    </div>

                                    <div>
                                        <strong className="text-white block mb-1">VISTOS:</strong>
                                        <ul className="list-disc list-inside space-y-1 text-xs">
                                            {plan.anexo_legal_resolucion_alcaldia.vistos.map((v, i) => (
                                                <li key={i}>{v}</li>
                                            ))}
                                        </ul>
                                    </div>

                                    <div>
                                        <strong className="text-white block mb-1">CONSIDERANDO:</strong>
                                        <div className="space-y-2 text-xs text-justify">
                                            {plan.anexo_legal_resolucion_alcaldia.considerandos.map((c, i) => (
                                                <p key={i}>{c}</p>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="pt-2">
                                        <strong className="text-white block mb-2 text-center">SE RESUELVE:</strong>
                                        <div className="space-y-3 text-xs">
                                            {plan.anexo_legal_resolucion_alcaldia.articulos_resolutivos.map((a, i) => (
                                                <p key={i} className="pl-4 border-l-2 border-emerald-500/50">
                                                    {a}
                                                </p>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="pt-8 text-center text-xs border-t border-slate-800 mt-6">
                                        <div className="font-bold text-slate-100">{plan.anexo_legal_resolucion_alcaldia.firmante_alcalde}</div>
                                        <div className="text-slate-400">Alcalde Distrital de {plan.distrito}</div>
                                        <div className="text-[10px] text-slate-500 font-mono mt-2">
                                            Hash de Integridad: {plan.hash_sha256}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* TAB 2: ESCENARIO DE RIESGO OPERATIVO */}
                        {activeTab === "escenario" && (
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                    <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5">
                                        <div className="flex items-center gap-3 mb-2">
                                            <Waves className="w-5 h-5 text-sky-400" />
                                            <h3 className="font-bold text-white text-sm">Parámetros Hidrometeorológicos</h3>
                                        </div>
                                        <div className="space-y-3 text-xs mt-3">
                                            <div className="flex justify-between border-b border-slate-800 pb-1.5">
                                                <span className="text-slate-400">Lluvia Gatillo 24h:</span>
                                                <span className="font-bold text-amber-400 font-mono">
                                                    {plan.capitulo1_escenario_riesgo.parametros_peligro.lluvia_gatillo_24h_mm} mm
                                                </span>
                                            </div>
                                            <div className="flex justify-between border-b border-slate-800 pb-1.5">
                                                <span className="text-slate-400">Caudal Desborde:</span>
                                                <span className="font-bold text-rose-400 font-mono">
                                                    {plan.capitulo1_escenario_riesgo.parametros_peligro.caudal_critico_desborde_m3s} m³/s
                                                </span>
                                            </div>
                                            <div className="flex justify-between border-b border-slate-800 pb-1.5">
                                                <span className="text-slate-400">Tiempo Concentración:</span>
                                                <span className="font-bold text-slate-200 font-mono">
                                                    {plan.capitulo1_escenario_riesgo.parametros_peligro.tiempo_concentracion_horas} horas
                                                </span>
                                            </div>
                                            <div className="flex justify-between border-b border-slate-800 pb-1.5">
                                                <span className="text-slate-400">Evento Análogo FEN:</span>
                                                <span className="font-bold text-emerald-400">
                                                    {plan.capitulo1_escenario_riesgo.parametros_peligro.evento_analogo_referencia}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-slate-400">Factor Amplificación:</span>
                                                <span className="font-bold text-cyan-400 font-mono">
                                                    {plan.capitulo1_escenario_riesgo.parametros_peligro.factor_amplificacion_fen}x
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5">
                                        <div className="flex items-center gap-3 mb-2">
                                            <Users className="w-5 h-5 text-amber-400" />
                                            <h3 className="font-bold text-white text-sm">Población Expuesta (INEI)</h3>
                                        </div>
                                        <div className="space-y-3 text-xs mt-3">
                                            <div className="flex justify-between border-b border-slate-800 pb-1.5">
                                                <span className="text-slate-400">Población Distrital Total:</span>
                                                <span className="font-bold text-slate-100 font-mono">
                                                    {plan.capitulo1_escenario_riesgo.exposicion.poblacion_total_distrital.toLocaleString()} hab.
                                                </span>
                                            </div>
                                            <div className="flex justify-between border-b border-slate-800 pb-1.5">
                                                <span className="text-slate-400">En Faja Marginal Activa:</span>
                                                <span className="font-bold text-rose-400 font-mono">
                                                    {plan.capitulo1_escenario_riesgo.exposicion.poblacion_expuesta_faja_marginal.toLocaleString()} hab.
                                                </span>
                                            </div>
                                            <div className="flex justify-between border-b border-slate-800 pb-1.5">
                                                <span className="text-slate-400">Familias en Alto Riesgo:</span>
                                                <span className="font-bold text-amber-400 font-mono">
                                                    {plan.capitulo1_escenario_riesgo.exposicion.familias_alto_riesgo_no_mitigable.toLocaleString()} familias
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-slate-400">Viviendas Precarias:</span>
                                                <span className="font-bold text-slate-200 font-mono">
                                                    {plan.capitulo1_escenario_riesgo.exposicion.viviendas_material_precario.toLocaleString()}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5">
                                        <div className="flex items-center gap-3 mb-2">
                                            <Coins className="w-5 h-5 text-emerald-400" />
                                            <h3 className="font-bold text-white text-sm">Pérdidas Potenciales Estimadas</h3>
                                        </div>
                                        <div className="space-y-3 text-xs mt-3">
                                            <div className="flex justify-between border-b border-slate-800 pb-1.5">
                                                <span className="text-slate-400">Cultivos Afectables:</span>
                                                <span className="font-bold text-amber-400 font-mono">
                                                    {plan.capitulo1_escenario_riesgo.estimacion_danos_probables.hectareas_cultivos_inundables} Has.
                                                </span>
                                            </div>
                                            <div className="flex justify-between border-b border-slate-800 pb-1.5">
                                                <span className="text-slate-400">Impacto Económico Est.:</span>
                                                <span className="font-bold text-rose-400 font-mono">
                                                    S/ {plan.capitulo1_escenario_riesgo.estimacion_danos_probables.perdidas_economicas_estimadas_soles.toLocaleString()}
                                                </span>
                                            </div>
                                            <div className="mt-2 text-slate-300 italic text-[11px]">
                                                "{plan.capitulo1_escenario_riesgo.estimacion_danos_probables.leccion_historica}"
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Puentes e Infraestructura en Riesgo CAF */}
                                <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5">
                                    <h3 className="font-bold text-white text-sm mb-3 flex items-center gap-2">
                                        <AlertOctagon className="w-4 h-4 text-rose-400" />
                                        Puentes y Nodos de Falla Histórica Identificados (Catálogo CAF / CENEPRED)
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                        {plan.capitulo1_escenario_riesgo.exposicion.puentes_en_riesgo_socavacion.map((p, i) => (
                                            <div key={i} className="bg-slate-950 p-3.5 rounded-lg border border-slate-800">
                                                <div className="font-bold text-slate-200 text-xs">{p.nombre_puente}</div>
                                                <div className="text-[11px] text-slate-400 mt-1">Falla: {p.tipo_falla}</div>
                                                <div className="text-[11px] text-rose-400 mt-0.5">
                                                    Umbral crítico: {p.umbral_critico_m3s} m³/s
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* TAB 3: ORGANIZACIÓN Y MANDO */}
                        {activeTab === "mando" && (
                            <div className="space-y-6">
                                <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6">
                                    <h3 className="font-bold text-white text-base mb-4 flex items-center gap-2">
                                        <Users className="w-5 h-5 text-sky-400" />
                                        Directorio del Grupo de Trabajo de la GRD (GT-GRD) - Directorio Oficial INEI 2026
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {plan.capitulo2_organizacion_mando.integrantes.map((m, i) => (
                                            <div key={i} className="bg-slate-950 p-4 rounded-lg border border-slate-800 flex flex-col justify-between">
                                                <div>
                                                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30 uppercase">
                                                        {m.cargo_comite}
                                                    </span>
                                                    <div className="font-bold text-white text-sm mt-2">{m.titular_nombre}</div>
                                                    <div className="text-xs text-slate-400">{m.cargo_institucional}</div>
                                                </div>
                                                <div className="mt-4 pt-3 border-t border-slate-900 flex items-center justify-between text-xs text-slate-300">
                                                    <span className="flex items-center gap-1.5">
                                                        <Phone className="w-3.5 h-3.5 text-emerald-400" />
                                                        {m.telefono_contacto}
                                                    </span>
                                                    <span className="flex items-center gap-1.5 text-slate-400">
                                                        <Mail className="w-3.5 h-3.5" />
                                                        {m.correo_institucional}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Enlace Radial y Puesto de Comando */}
                                    <div className="mt-6 pt-5 border-t border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                                        <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800">
                                            <span className="text-slate-400 font-bold block mb-1">Puesto de Comando COEL:</span>
                                            <span className="text-slate-200">{plan.capitulo2_organizacion_mando.coel_ubicacion_puesto_comando}</span>
                                        </div>
                                        <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800">
                                            <span className="text-slate-400 font-bold block mb-1">Comunicaciones de Emergencia HF/VHF:</span>
                                            <span className="text-emerald-400 font-mono">{plan.capitulo2_organizacion_mando.frecuencias_radiales_hf_vhf}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* TAB 4: RESPUESTA, ALBERGUES Y KITS BAH */}
                        {activeTab === "respuesta" && (
                            <div className="space-y-6">
                                {/* Cálculo BAH INDECI */}
                                <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5">
                                    <h3 className="font-bold text-white text-sm mb-4 flex items-center gap-2">
                                        <Truck className="w-4 h-4 text-emerald-400" />
                                        Cálculo Estandarizado de Bienes de Ayuda Humanitaria (BAH) - INDECI
                                    </h3>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
                                        <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                                            <div className="text-2xl font-extrabold text-emerald-400 font-mono">
                                                {plan.capitulo3_procedimientos_respuesta.bienes_ayuda_humanitaria.carpas_familiares_unidades}
                                            </div>
                                            <div className="text-xs text-slate-400 mt-1">Carpas Familiares</div>
                                        </div>
                                        <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                                            <div className="text-2xl font-extrabold text-sky-400 font-mono">
                                                {plan.capitulo3_procedimientos_respuesta.bienes_ayuda_humanitaria.frazadas_termicas_unidades}
                                            </div>
                                            <div className="text-xs text-slate-400 mt-1">Frazadas Térmicas</div>
                                        </div>
                                        <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                                            <div className="text-2xl font-extrabold text-amber-400 font-mono">
                                                {plan.capitulo3_procedimientos_respuesta.bienes_ayuda_humanitaria.bidones_agua_131l_unidades}
                                            </div>
                                            <div className="text-xs text-slate-400 mt-1">Bidones de Agua (131L)</div>
                                        </div>
                                        <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                                            <div className="text-2xl font-extrabold text-rose-400 font-mono">
                                                {plan.capitulo3_procedimientos_respuesta.bienes_ayuda_humanitaria.raciones_frias_72h_unidades}
                                            </div>
                                            <div className="text-xs text-slate-400 mt-1">Raciones Frías 72h</div>
                                        </div>
                                    </div>
                                    <div className="mt-4 text-xs text-slate-400 flex flex-col md:flex-row justify-between gap-2 border-t border-slate-800/80 pt-3">
                                        <span><strong>Almacén Local:</strong> {plan.capitulo3_procedimientos_respuesta.bienes_ayuda_humanitaria.stock_disponible_almacen_local}</span>
                                        <span className="text-amber-400"><strong>Déficit Nivel 2:</strong> {plan.capitulo3_procedimientos_respuesta.bienes_ayuda_humanitaria.deficit_requerido_indeci_nivel2}</span>
                                    </div>
                                </div>

                                {/* Albergues Validados MINEDU vs Vetados */}
                                <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5">
                                    <h3 className="font-bold text-white text-sm mb-4 flex items-center gap-2">
                                        <Home className="w-4 h-4 text-sky-400" />
                                        Albergues Temporales Validados (MINEDU SIGMED) con Veto Histórico
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {plan.capitulo3_procedimientos_respuesta.albergues_temporales.map((alb, i) => (
                                            <div
                                                key={i}
                                                className={`p-4 rounded-lg border ${
                                                    alb.vetado_por_antecedente_historico
                                                        ? "bg-rose-950/20 border-rose-800/60"
                                                        : "bg-slate-950 border-slate-800"
                                                }`}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <span className="font-bold text-white text-sm">{alb.nombre}</span>
                                                    {alb.vetado_por_antecedente_historico ? (
                                                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
                                                            VETADO POR INUNDACIÓN
                                                        </span>
                                                    ) : (
                                                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                                                            COTA SEGURA
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="text-xs text-slate-400 mt-1">
                                                    Tipo: {alb.tipo_instalacion} • Capacidad: <strong>{alb.capacidad_personas} personas</strong>
                                                </div>
                                                <div className="text-xs text-slate-300 mt-2 bg-slate-900/80 p-2 rounded">
                                                    {alb.observacion}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* TAB 5: OBRAS PP 0068 MEF */}
                        {activeTab === "pprrd" && (
                            <div className="space-y-6">
                                <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
                                        <div>
                                            <span className="text-xs font-bold text-rose-400 uppercase tracking-wider">
                                                CATEGORÍA PRESUPUESTAL 0068 • CONSULTA AMIGABLE MEF
                                            </span>
                                            <h3 className="font-bold text-white text-base mt-0.5">
                                                Matriz de Inversiones Estructurales de Reducción del Riesgo (PPRRD)
                                            </h3>
                                        </div>
                                        <div className="flex items-center gap-3 text-xs">
                                            <div className="bg-slate-950 px-3 py-1.5 rounded border border-slate-800">
                                                PIM Total: <strong className="text-slate-100 font-mono">S/ {plan.capitulo5_inversion_pprrd_mef.monto_total_pim_soles.toLocaleString()}</strong>
                                            </div>
                                            <div className="bg-slate-950 px-3 py-1.5 rounded border border-slate-800">
                                                Devengado: <strong className="text-emerald-400 font-mono">{plan.capitulo5_inversion_pprrd_mef.avance_financiero_global_pct}%</strong>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="overflow-x-auto">
                                        <table className="w-full text-xs text-left border-collapse">
                                            <thead>
                                                <tr className="bg-slate-950 border-b border-slate-800 text-slate-400">
                                                    <th className="py-2.5 px-3">CUI</th>
                                                    <th className="py-2.5 px-3">Proyecto</th>
                                                    <th className="py-2.5 px-3 text-right">PIM (S/)</th>
                                                    <th className="py-2.5 px-3 text-center">Avance</th>
                                                    <th className="py-2.5 px-3">Cuello de Botella SIAF</th>
                                                    <th className="py-2.5 px-3">Alerta Legal</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-800/60">
                                                {plan.capitulo5_inversion_pprrd_mef.obras_prioritarias_defensas.map((o, idx) => (
                                                    <tr key={idx} className="hover:bg-slate-800/30">
                                                        <td className="py-2.5 px-3 font-mono font-bold text-sky-400">{o.cui}</td>
                                                        <td className="py-2.5 px-3 font-medium text-slate-200 max-w-xs truncate" title={o.proyecto}>
                                                            {o.proyecto}
                                                        </td>
                                                        <td className="py-2.5 px-3 text-right font-mono text-slate-300">
                                                            {o.monto_pim_soles.toLocaleString()}
                                                        </td>
                                                        <td className="py-2.5 px-3 text-center">
                                                            <span className="font-mono font-bold text-slate-100">{o.avance_porcentaje}%</span>
                                                        </td>
                                                        <td className="py-2.5 px-3">
                                                            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                                                                {o.cuello_botella_siaf}
                                                            </span>
                                                        </td>
                                                        <td className="py-2.5 px-3">
                                                            {o.alerta_omision_art377_cp ? (
                                                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
                                                                    ART. 377 CP
                                                                </span>
                                                            ) : (
                                                                <span className="text-slate-500 text-[11px]">—</span>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* TAB 6: CALIBRACIÓN EMPÍRICA */}
                        {activeTab === "calibracion" && (
                            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 space-y-5">
                                <div>
                                    <h3 className="font-bold text-white text-base">
                                        Fundamentación de Calibración Empírica del Plan Base 2026
                                    </h3>
                                    <p className="text-xs text-slate-400 mt-1 max-w-3xl">
                                        AMARU-PLAN no es un generador genérico de plantillas; ha calibrado sus algoritmos analizando 29 planes reales de contingencia y prevención recopilados en el repositorio oficial.
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
                                        <div className="font-bold text-emerald-400 text-sm mb-1">
                                            Patrón El Tallán 2026 & Catacaos (Bajo Piura)
                                        </div>
                                        <p className="text-xs text-slate-300 leading-relaxed">
                                            Calibra el umbral de desborde del Río Piura, la delimitación de fajas no mitigables y el protocolo de evacuación hacia dunas altas. Evita la colocación de refugios en zonas que en 2017 quedaron bajo 2 metros de agua.
                                        </p>
                                    </div>

                                    <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
                                        <div className="font-bold text-sky-400 text-sm mb-1">
                                            Patrón La Esperanza 2026–2030 & Trujillo 2023
                                        </div>
                                        <p className="text-xs text-slate-300 leading-relaxed">
                                            Calibra el protocolo de activación repentina de quebradas secas (San Ildefonso y El León). Inyecta la matriz de maquinaria para apertura de zanjas de drenaje pluvial antes de que el caudal entre al casco urbano.
                                        </p>
                                    </div>

                                    <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
                                        <div className="font-bold text-amber-400 text-sm mb-1">
                                            Patrón Valles de Ica (Parcona, Tate, San Andrés 2015–2016)
                                        </div>
                                        <p className="text-xs text-slate-300 leading-relaxed">
                                            Enseña la ineficacia de las defensas provisionales de sacos de arena en crecidas extraordinarias, exigiendo en la matriz del plan el reforzamiento con roca al volteo y control de compuertas.
                                        </p>
                                    </div>

                                    <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
                                        <div className="font-bold text-rose-400 text-sm mb-1">
                                            Patrón Red Salud Huaral & INSN 2026–2027
                                        </div>
                                        <p className="text-xs text-slate-300 leading-relaxed">
                                            Estandariza los protocolos de triaje sanitario rápido en los albergues para evitar brotes de dengue, leptospirosis y diarreas agudas post-inundación.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
