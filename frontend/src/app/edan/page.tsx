"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
    FileCheck2,
    Shield,
    AlertTriangle,
    CheckCircle2,
    Download,
    Upload,
    Building2,
    Users,
    Home,
    Wheat,
    QrCode,
    FileSpreadsheet,
    FileText,
    RefreshCw,
    ExternalLink,
    AlertOctagon,
    Coins,
    Calendar,
    Sparkles,
    Check,
    X,
    Info,
    Search,
    ChevronDown,
    Plus,
    Trash2,
    UserCheck
} from "lucide-react";

interface Familia {
    numero_orden: number;
    sector_caserio: string;
    manzana_lote: string;
    apellidos_nombres_titular: string;
    dni_titular: string;
    sexo: string;
    edad: number;
    miembros_familia: number;
    ninos_0_12: number;
    adultos_mayores_65: number;
    gestantes: number;
    personas_discapacidad: number;
    condicion_habitante: string;
    condicion_vivienda: string;
    material_pared: string;
    califica_bono_bae?: boolean;
    necesidades_urgentes?: string[];
}

interface PlantillaEDAN {
    ubigeo: string;
    distrito: string;
    provincia: string;
    departamento: string;
    alcalde: string;
    cargo_autoridad: string;
    rol_sinagerd: string;
    direccion_municipalidad: string;
    decreto_emergencia: string;
    dias_restantes_estado_emergencia: number;
    fecha_formulario: string;
    hora_formulario: string;
    formulario_1_evaluacion_rapida: {
        peligro_asociado: string;
        fallecidos: number;
        lesionados: number;
        desaparecidos: number;
        viviendas_destruidas: number;
        viviendas_inhabitables: number;
        viviendas_afectadas: number;
        servicios_basicos_interrumpidos: {
            agua_potable: string;
            electricidad: string;
            alcantarillado: string;
            conectividad_vial: string;
        };
    };
    formulario_2a_familias: Familia[];
    formulario_2b_medios_vida: {
        hectareas_cultivo_perdidas: number;
        tipo_cultivo: string;
        ganado_muerto_o_afectado: number;
        tipo_ganado: string;
        canales_riego_destruidos_metros: number;
        activacion_seguro_agricola_sac: boolean;
    };
}

interface AuditoriaResultado {
    puntaje_consistencia_pct: number;
    estado_evaluacion: string;
    semaforo: string;
    total_familias_auditadas: number;
    familias_elegibles_bono_bae: number;
    monto_estimado_bono_bae_mensual_soles: number;
    seguro_agricola_sac_activable: boolean;
    dias_restantes_estado_emergencia: number;
    alertas_detectadas: Array<{
        codigo: string;
        gravedad: string;
        mensaje: string;
    }>;
    resumen_dictamen: string;
}

interface FichaEmitida {
    exito: boolean;
    edan_id: string;
    codigo_sinpad: string;
    hash_sha256: string;
    fecha_emision: string;
    distrito: string;
    departamento: string;
    total_familias: number;
    familias_bono_bae: number;
    seguro_agricola_sac_activado: boolean;
    disparo_contraloria: {
        registro_cgr_id: string;
        estado_control: string;
        puntaje_consistencia: number;
    };
}

const DISTRITOS_PRIORITARIOS = [
    { ubigeo: "200105", nombre: "Catacaos", provincia: "Piura", depto: "Piura", ds: true },
    { ubigeo: "200107", nombre: "Cura Mori", provincia: "Piura", depto: "Piura", ds: true },
    { ubigeo: "200114", nombre: "Tambogrande", provincia: "Piura", depto: "Piura", ds: true },
    { ubigeo: "200401", nombre: "Chulucanas", provincia: "Morropón", depto: "Piura", ds: true },
    { ubigeo: "200601", nombre: "Sullana", provincia: "Sullana", depto: "Piura", ds: true },
    { ubigeo: "200706", nombre: "Máncora", provincia: "Talara", depto: "Piura", ds: true },
    { ubigeo: "140304", nombre: "Íllimo", provincia: "Lambayeque", depto: "Lambayeque", ds: true },
    { ubigeo: "130101", nombre: "Trujillo", provincia: "Trujillo", depto: "La Libertad", ds: true }
];

export default function EdanSinpadPage() {
    const [ubigeoSeleccionado, setUbigeoSeleccionado] = useState<string>("200105");
    const [plantilla, setPlantilla] = useState<PlantillaEDAN | null>(null);
    const [activeTab, setActiveTab] = useState<"f1" | "f2a" | "f2b">("f2a");
    const [cargando, setCargando] = useState<boolean>(true);
    const [auditando, setAuditando] = useState<boolean>(false);
    const [auditoria, setAuditoria] = useState<AuditoriaResultado | null>(null);
    const [emitiendo, setEmitiendo] = useState<boolean>(false);
    const [fichaEmitida, setFichaEmitida] = useState<FichaEmitida | null>(null);
    const [tokenFirma, setTokenFirma] = useState<string>("MUNI-DEFENSA-CIVIL-KEY-2026");
    const [ineiVulnerabilidad, setIneiVulnerabilidad] = useState<any | null>(null);

    // Cargar plantilla por UBIGEO
    const cargarPlantilla = async (ubigeo: string) => {
        setCargando(true);
        setFichaEmitida(null);
        try {
            const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
            const [res, resInei] = await Promise.all([
                fetch(`${apiBase}/api/v1/edan/plantilla/${ubigeo}`),
                fetch(`${apiBase}/api/v1/inei/vulnerabilidad/edan-asistencia/${ubigeo}`)
            ]);
            if (res.ok) {
                const data: PlantillaEDAN = await res.json();
                setPlantilla(data);
                evaluarConsistencia(data);
            }
            if (resInei && resInei.ok) {
                const ineiData = await resInei.json();
                setIneiVulnerabilidad(ineiData);
            }
        } catch (err) {
            console.error("Error al cargar plantilla EDAN o INEI:", err);
        } finally {
            setCargando(false);
        }
    };

    // Pre-auditar consistencia en tiempo real
    const evaluarConsistencia = async (data: PlantillaEDAN) => {
        setAuditando(true);
        try {
            const res = await fetch("http://127.0.0.1:8000/api/v1/edan/evaluar-consistencia", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ficha: data })
            });
            if (res.ok) {
                const resultado: AuditoriaResultado = await res.json();
                setAuditoria(resultado);
            }
        } catch (err) {
            console.error("Error al evaluar consistencia algorítmica:", err);
        } finally {
            setAuditando(false);
        }
    };

    useEffect(() => {
        cargarPlantilla(ubigeoSeleccionado);
    }, [ubigeoSeleccionado]);

    // Modificar condición de vivienda de un empadronado
    const actualizarCondicionVivienda = (index: number, nuevaCondicion: string) => {
        if (!plantilla) return;
        const copiaFamilias = [...plantilla.formulario_2a_familias];
        copiaFamilias[index].condicion_vivienda = nuevaCondicion;
        copiaFamilias[index].califica_bono_bae = ["INHABITABLE", "DESTRUIDA", "COLAPSADA"].includes(nuevaCondicion);
        copiaFamilias[index].condicion_habitante = copiaFamilias[index].califica_bono_bae ? "DAMNIFICADO" : "AFECTADO";
        
        const nuevaPlantilla = { ...plantilla, formulario_2a_familias: copiaFamilias };
        setPlantilla(nuevaPlantilla);
        evaluarConsistencia(nuevaPlantilla);
    };

    // Actualizar DNI con auto-consulta a la PIDE-RENIEC
    const actualizarDni = async (index: number, nuevoDni: string) => {
        if (!plantilla) return;
        const copiaFamilias = [...plantilla.formulario_2a_familias];
        copiaFamilias[index].dni_titular = nuevoDni;

        // Si son 8 dígitos numéricos válidos, auto-completar desde PIDE-RENIEC
        if (nuevoDni.length === 8 && /^\d+$/.test(nuevoDni)) {
            try {
                const res = await fetch(`http://127.0.0.1:8000/api/v1/pide/reniec/consultar/${nuevoDni}`);
                if (res.ok) {
                    const data = await res.json();
                    if (data.coResultado === "0000" && data.nombreCompleto) {
                        copiaFamilias[index].apellidos_nombres_titular = data.nombreCompleto;
                        if (data.edad) copiaFamilias[index].edad = data.edad;
                        if (data.sexo) copiaFamilias[index].sexo = data.sexo;
                    } else if (data.restriccion === "FALLECIDO") {
                        copiaFamilias[index].apellidos_nombres_titular = `${data.nombreCompleto || "TITULAR"} [FALLECIDO EN RENIEC]`;
                        copiaFamilias[index].califica_bono_bae = false;
                    }
                }
            } catch (err) {
                console.error("Error al autocompletar DNI vía PIDE:", err);
            }
        }

        const nuevaPlantilla = { ...plantilla, formulario_2a_familias: copiaFamilias };
        setPlantilla(nuevaPlantilla);
        evaluarConsistencia(nuevaPlantilla);
    };

    // Validar todo el padrón completo con la PIDE en lote
    const validarPadronConPide = async () => {
        if (!plantilla) return;
        setAuditando(true);
        try {
            const res = await fetch("http://127.0.0.1:8000/api/v1/pide/reniec/validar-lote", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ familias: plantilla.formulario_2a_familias })
            });
            if (res.ok) {
                const data = await res.json();
                // Actualizar nombres y restricciones en el padrón local
                const copiaFamilias = [...plantilla.formulario_2a_familias];
                data.detalles.forEach((det: any, idx: number) => {
                    if (idx < copiaFamilias.length && det.nombre_oficial_reniec) {
                        if (det.restriccion === "FALLECIDO") {
                            copiaFamilias[idx].apellidos_nombres_titular = `${det.nombre_oficial_reniec} [FALLECIDO RENIEC]`;
                            copiaFamilias[idx].califica_bono_bae = false;
                        } else {
                            copiaFamilias[idx].apellidos_nombres_titular = det.nombre_oficial_reniec;
                            if (det.edad) copiaFamilias[idx].edad = det.edad;
                            if (det.sexo) copiaFamilias[idx].sexo = det.sexo;
                        }
                    }
                });
                const nuevaPlantilla = { ...plantilla, formulario_2a_familias: copiaFamilias };
                setPlantilla(nuevaPlantilla);
                evaluarConsistencia(nuevaPlantilla);
            }
        } catch (err) {
            console.error("Error validando padrón masivo con PIDE:", err);
        } finally {
            setAuditando(false);
        }
    };

    // Agregar nueva fila de familia
    const agregarFamilia = () => {
        if (!plantilla) return;
        const nueva: Familia = {
            numero_orden: plantilla.formulario_2a_familias.length + 1,
            sector_caserio: "Caserío Nuevo Horizonte",
            manzana_lote: "Mz. Z Lt. 01",
            apellidos_nombres_titular: "NUEVO DAMNIFICADO POR REVISAR",
            dni_titular: "00000000",
            sexo: "M",
            edad: 35,
            miembros_familia: 4,
            ninos_0_12: 1,
            adultos_mayores_65: 0,
            gestantes: 0,
            personas_discapacidad: 0,
            condicion_habitante: "DAMNIFICADO",
            condicion_vivienda: "INHABITABLE",
            material_pared: "ADOBE",
            califica_bono_bae: true,
            necesidades_urgentes: ["CARPAS", "RACIONES"]
        };
        const nuevaPlantilla = {
            ...plantilla,
            formulario_2a_familias: [...plantilla.formulario_2a_familias, nueva]
        };
        setPlantilla(nuevaPlantilla);
        evaluarConsistencia(nuevaPlantilla);
    };

    // Eliminar familia
    const eliminarFamilia = (index: number) => {
        if (!plantilla) return;
        const copia = plantilla.formulario_2a_familias.filter((_, i) => i !== index);
        const nuevaPlantilla = { ...plantilla, formulario_2a_familias: copia };
        setPlantilla(nuevaPlantilla);
        evaluarConsistencia(nuevaPlantilla);
    };

    // Generar Ficha Oficial y Despachar a Contraloría
    const emitirFichaOficial = async () => {
        if (!plantilla) return;
        setEmitiendo(true);
        try {
            const res = await fetch("http://127.0.0.1:8000/api/v1/edan/generar-oficial", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ficha: plantilla,
                    token_autoridad: tokenFirma
                })
            });
            if (res.ok) {
                const data: FichaEmitida = await res.json();
                setFichaEmitida(data);
            }
        } catch (err) {
            console.error("Error al emitir ficha oficial:", err);
        } finally {
            setEmitiendo(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 font-sans">
            {/* Header Estratégico */}
            <header className="max-w-7xl mx-auto mb-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
                                <FileCheck2 className="w-3.5 h-3.5" />
                                R.S. Nº 002-2026-PCM/SGRD & R.M. Nº 324-2023-PCM
                            </span>
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-500/20 text-sky-300 border border-sky-500/30">
                                SINPAD v2.0 Homologado
                            </span>
                        </div>
                        <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
                            <Building2 className="w-8 h-8 text-emerald-400" />
                            Consola Municipal EDAN Digital & Bono BAE
                        </h1>
                        <p className="text-sm text-slate-400 mt-1 max-w-3xl">
                            Eliminación de la brecha burocrática de 20 a 35 días en el empadronamiento. Pre-auditoría algorítmica para evitar el rechazo del subsidio de arrendamiento BAE (S/ 500/mes), Seguro Agrícola Catastrófico y despacho instantáneo a Contraloría.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <Link
                            href="/reniec"
                            className="px-4 py-2.5 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/30 text-sky-300 text-sm font-semibold flex items-center gap-2 transition"
                        >
                            <UserCheck className="w-4 h-4" />
                            Validación RENIEC (PIDE)
                            <ExternalLink className="w-3.5 h-3.5 opacity-60" />
                        </Link>
                        <Link
                            href="/contraloria"
                            className="px-4 py-2.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-sm font-semibold flex items-center gap-2 transition"
                        >
                            <Shield className="w-4 h-4" />
                            Consola Contraloría (Control Concurrente)
                            <ExternalLink className="w-3.5 h-3.5 opacity-60" />
                        </Link>
                    </div>
                </div>

                {/* Selector de Municipalidad y Barra de Estado */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
                    <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl">
                        <label className="text-xs font-medium text-slate-400 block mb-1.5 flex items-center gap-1.5">
                            <Building2 className="w-3.5 h-3.5 text-emerald-400" />
                            Distrito & Alcaldía (Censo INEI 2026)
                        </label>
                        <select
                            value={ubigeoSeleccionado}
                            onChange={(e) => setUbigeoSeleccionado(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-700 text-sm rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                        >
                            {DISTRITOS_PRIORITARIOS.map((d) => (
                                <option key={d.ubigeo} value={d.ubigeo}>
                                    {d.nombre} ({d.depto}) - UBIGEO {d.ubigeo}
                                </option>
                            ))}
                        </select>
                        {plantilla && (
                            <div className="mt-2 text-xs text-slate-400">
                                <span className="text-slate-200 font-medium">Alcalde:</span> {plantilla.alcalde}
                            </div>
                        )}
                    </div>

                    <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl">
                        <span className="text-xs font-medium text-slate-400 block mb-1 flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-amber-400" />
                            Marco Jurídico de Emergencia
                        </span>
                        <div className="text-sm font-bold text-amber-300">
                            D.S. N.° 124-2026-PCM
                        </div>
                        <div className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                            {plantilla?.dias_restantes_estado_emergencia || 49} días restantes para agilizar compras y subsidios
                        </div>
                    </div>

                    {/* Pre-auditoría Algorítmica Score */}
                    <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl flex items-center justify-between">
                        <div>
                            <span className="text-xs font-medium text-slate-400 block mb-1 flex items-center gap-1.5">
                                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                                Pre-Auditoría Algorítmica CGR
                            </span>
                            <div className="text-2xl font-black" style={{ color: auditoria?.semaforo || "#10b981" }}>
                                {auditoria?.puntaje_consistencia_pct ?? 100}%
                            </div>
                            <span className="text-[11px] text-slate-400 block mt-0.5">
                                {auditoria?.estado_evaluacion?.replace(/_/g, " ") || "VERIFICANDO"}
                            </span>
                        </div>
                        <div className="w-12 h-12 rounded-full border-2 flex items-center justify-center font-bold text-xs" style={{ borderColor: auditoria?.semaforo || "#10b981", color: auditoria?.semaforo || "#10b981" }}>
                            {auditando ? <RefreshCw className="w-4 h-4 animate-spin" /> : `${auditoria?.puntaje_consistencia_pct || 100}%`}
                        </div>
                    </div>

                    {/* Proyección Bono BAE */}
                    <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl">
                        <span className="text-xs font-medium text-slate-400 block mb-1 flex items-center gap-1.5">
                            <Coins className="w-3.5 h-3.5 text-sky-400" />
                            Aptos Bono BAE (S/ 500/mes)
                        </span>
                        <div className="text-2xl font-black text-sky-300">
                            {auditoria?.familias_elegibles_bono_bae || 0} familias
                        </div>
                        <div className="text-xs text-slate-400 mt-1">
                            S/ {(auditoria?.monto_estimado_bono_bae_mensual_soles || 0).toLocaleString()} / mes transferido por MVCS
                        </div>
                    </div>
                </div>
            </header>

            {/* Tarjeta de Línea Base Demográfica & Vulnerabilidad INEI */}
            {ineiVulnerabilidad && (
                <div className="max-w-7xl mx-auto mb-6 bg-slate-900 border border-indigo-500/40 rounded-2xl p-4 shadow-xl">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 border-b border-slate-800 pb-3">
                        <div className="flex items-center gap-2">
                            <Users className="w-5 h-5 text-indigo-400" />
                            <div>
                                <div className="flex items-center gap-2">
                                    <h3 className="text-sm font-bold text-white">
                                        Línea Base Censal INEI &amp; Proyección de Asistencia Humanitaria
                                    </h3>
                                    <span className="text-[10px] font-mono bg-indigo-950 text-indigo-300 px-2 py-0.5 rounded border border-indigo-800 font-bold">
                                        SRC-INEI-FEN-ESTADISTICA
                                    </span>
                                </div>
                                <p className="text-xs text-slate-400">
                                    Datos sociodemográficos oficiales para consistencia cruzada en el Formulario 1 y Formulario 2A de SINPAD v2
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 text-xs">
                            <span className="text-slate-400">
                                Población Total Censada: <strong className="text-white">{ineiVulnerabilidad.poblacion_total?.toLocaleString() ?? "--"} hab.</strong>
                            </span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 text-xs">
                        <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800">
                            <span className="text-[10px] text-slate-400 block font-medium">Población Muy Vulnerable</span>
                            <span className="text-base font-black text-indigo-300">
                                {ineiVulnerabilidad.poblacion_vulnerable_dependiente?.toLocaleString() ?? "--"}
                            </span>
                            <span className="text-[9px] text-slate-500 block">Menores de 5 y mayores de 65 años</span>
                        </div>

                        <div className="bg-slate-950/80 p-3 rounded-xl border border-amber-900/40">
                            <span className="text-[10px] text-amber-400 block font-medium">Viviendas Precarias (Censo)</span>
                            <span className="text-base font-black text-amber-300">
                                {ineiVulnerabilidad.viviendas_paredes_precarias?.toLocaleString() ?? "--"}
                            </span>
                            <span className="text-[9px] text-slate-500 block">Paredes de quincha, adobe o estera</span>
                        </div>

                        <div className="bg-slate-950/80 p-3 rounded-xl border border-rose-900/40">
                            <span className="text-[10px] text-rose-400 block font-medium">Familias Afectadas Proyectadas</span>
                            <span className="text-base font-black text-rose-300">
                                {ineiVulnerabilidad.estimacion_asistencia_humanitaria?.familias_damnificadas_proyectadas ?? 45} fam.
                            </span>
                            <span className="text-[9px] text-slate-500 block">Riesgo de colapso estructural</span>
                        </div>

                        <div className="bg-slate-950/80 p-3 rounded-xl border border-emerald-900/40">
                            <span className="text-[10px] text-emerald-400 block font-medium">Raciones Alimentarias (30d)</span>
                            <span className="text-base font-black text-emerald-300">
                                {ineiVulnerabilidad.estimacion_asistencia_humanitaria?.raciones_alimentos_30_dias?.toLocaleString() ?? 5400}
                            </span>
                            <span className="text-[9px] text-slate-500 block">Kits de asistencia INDECI</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Banner de Alertas Preventivas de Contraloría */}
            {auditoria && auditoria.alertas_detectadas.length > 0 && (
                <div className="max-w-7xl mx-auto mb-6 bg-rose-950/40 border border-rose-800/60 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2 text-rose-300 font-semibold text-sm">
                        <AlertOctagon className="w-4 h-4 text-rose-400" />
                        Observaciones Preventivas Detectadas ({auditoria.alertas_detectadas.length}) - Corrección Requerida
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-rose-200">
                        {auditoria.alertas_detectadas.map((al, idx) => (
                            <div key={idx} className="bg-rose-900/30 p-2.5 rounded-lg border border-rose-800/40 flex items-start gap-2">
                                <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                                <div>
                                    <span className="font-bold uppercase tracking-wider text-[10px] bg-rose-800/80 px-1.5 py-0.5 rounded mr-1.5">
                                        {al.codigo}
                                    </span>
                                    {al.mensaje}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Contenedor Principal con Tabs de los Formularios */}
            <main className="max-w-7xl mx-auto">
                {/* Pestañas de Formularios Oficiales */}
                <div className="flex border-b border-slate-800 mb-6 gap-2">
                    <button
                        onClick={() => setActiveTab("f2a")}
                        className={`px-5 py-3 text-sm font-semibold border-b-2 flex items-center gap-2 transition ${
                            activeTab === "f2a"
                                ? "border-emerald-500 text-emerald-400 bg-emerald-500/10 rounded-t-lg"
                                : "border-transparent text-slate-400 hover:text-slate-200"
                        }`}
                    >
                        <Users className="w-4 h-4" />
                        Formulario 2A: Empadronamiento Familiar ({plantilla?.formulario_2a_familias.length || 0})
                        <span className="bg-emerald-500/20 text-emerald-300 text-xs px-2 py-0.5 rounded-full ml-1 font-bold">
                            Bono BAE
                        </span>
                    </button>

                    <button
                        onClick={() => setActiveTab("f1")}
                        className={`px-5 py-3 text-sm font-semibold border-b-2 flex items-center gap-2 transition ${
                            activeTab === "f1"
                                ? "border-emerald-500 text-emerald-400 bg-emerald-500/10 rounded-t-lg"
                                : "border-transparent text-slate-400 hover:text-slate-200"
                        }`}
                    >
                        <Home className="w-4 h-4" />
                        Formulario 1: Evaluación Rápida de Daños
                    </button>

                    <button
                        onClick={() => setActiveTab("f2b")}
                        className={`px-5 py-3 text-sm font-semibold border-b-2 flex items-center gap-2 transition ${
                            activeTab === "f2b"
                                ? "border-emerald-500 text-emerald-400 bg-emerald-500/10 rounded-t-lg"
                                : "border-transparent text-slate-400 hover:text-slate-200"
                        }`}
                    >
                        <Wheat className="w-4 h-4" />
                        Formulario 2B: Medios de Vida (Agro / Ganadería)
                        <span className="bg-amber-500/20 text-amber-300 text-xs px-2 py-0.5 rounded-full ml-1 font-bold">
                            SAC
                        </span>
                    </button>
                </div>

                {cargando ? (
                    <div className="py-24 text-center">
                        <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin mx-auto mb-3" />
                        <p className="text-slate-400 text-sm">Cruzando datos censales INEI y directivas SINPAD v2...</p>
                    </div>
                ) : (
                    <>
                        {/* TAB 2A: EMPADRONAMIENTO FAMILIAR */}
                        {activeTab === "f2a" && plantilla && (
                            <div className="space-y-4">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
                                    <div className="text-xs text-slate-300">
                                        <span className="font-semibold text-emerald-400">Regla Anti-Rechazo BAE:</span> Solo las viviendas clasificadas como <strong className="text-white">INHABITABLE</strong> o <strong className="text-white">DESTRUIDA / COLAPSADA</strong> califican para el desembolso mensual de S/ 500 por parte del Fondo MIVIVIENDA.
                                    </div>
                                    <div className="flex items-center gap-2 self-start sm:self-auto">
                                        <button
                                            onClick={validarPadronConPide}
                                            disabled={auditando}
                                            className="px-3.5 py-1.5 bg-sky-600/30 hover:bg-sky-600/50 border border-sky-500/40 text-sky-200 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition disabled:opacity-50"
                                        >
                                            <UserCheck className="w-3.5 h-3.5 text-sky-400" />
                                            {auditando ? "Cruzando con PIDE..." : "Validar Padrón con PIDE-RENIEC"}
                                        </button>
                                        <button
                                            onClick={agregarFamilia}
                                            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition"
                                        >
                                            <Plus className="w-3.5 h-3.5" />
                                            Agregar Fila de Empadronado
                                        </button>
                                    </div>
                                </div>

                                <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/40">
                                    <table className="w-full text-left text-xs">
                                        <thead className="bg-slate-900/90 text-slate-300 font-semibold border-b border-slate-800">
                                            <tr>
                                                <th className="p-3 w-12 text-center">N°</th>
                                                <th className="p-3">Sector / Caserío</th>
                                                <th className="p-3">Jefe de Hogar (Titular)</th>
                                                <th className="p-3">DNI (8 dígitos)</th>
                                                <th className="p-3 text-center">Miembros</th>
                                                <th className="p-3">Condición de Vivienda</th>
                                                <th className="p-3 text-center">Apto Bono BAE</th>
                                                <th className="p-3 text-center">Acciones</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-800/60">
                                            {plantilla.formulario_2a_familias.map((f, idx) => {
                                                const dniValido = f.dni_titular && f.dni_titular.length === 8 && /^\d+$/.test(f.dni_titular);
                                                const esAptoBae = ["INHABITABLE", "DESTRUIDA", "COLAPSADA"].includes(f.condicion_vivienda);

                                                return (
                                                    <tr key={idx} className="hover:bg-slate-800/30 transition">
                                                        <td className="p-3 text-center font-mono text-slate-400">{idx + 1}</td>
                                                        <td className="p-3">
                                                            <div className="font-medium text-slate-200">{f.sector_caserio}</div>
                                                            <div className="text-[11px] text-slate-400">{f.manzana_lote}</div>
                                                        </td>
                                                        <td className="p-3 font-medium text-slate-200">
                                                            {f.apellidos_nombres_titular}
                                                            <div className="flex gap-1.5 mt-1 text-[10px]">
                                                                {f.ninos_0_12 > 0 && <span className="bg-sky-500/20 text-sky-300 px-1.5 py-0.5 rounded">{f.ninos_0_12} niños</span>}
                                                                {f.adultos_mayores_65 > 0 && <span className="bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded">{f.adultos_mayores_65} adultos may.</span>}
                                                                {f.personas_discapacidad > 0 && <span className="bg-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded">Discapacidad</span>}
                                                            </div>
                                                        </td>
                                                        <td className="p-3 font-mono">
                                                            <div className="flex items-center gap-1.5">
                                                                <input
                                                                    type="text"
                                                                    maxLength={8}
                                                                    value={f.dni_titular}
                                                                    onChange={(e) => actualizarDni(idx, e.target.value)}
                                                                    className={`w-24 px-2 py-1 rounded bg-slate-950 border text-xs font-mono text-white ${
                                                                        dniValido ? "border-slate-700 focus:border-emerald-500" : "border-rose-500 text-rose-300"
                                                                    }`}
                                                                />
                                                                {dniValido ? (
                                                                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                                                                ) : (
                                                                    <span title="DNI inválido">
                                                                        <X className="w-3.5 h-3.5 text-rose-400" />
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td className="p-3 text-center font-bold text-slate-200">
                                                            {f.miembros_familia}
                                                        </td>
                                                        <td className="p-3">
                                                            <select
                                                                value={f.condicion_vivienda}
                                                                onChange={(e) => actualizarCondicionVivienda(idx, e.target.value)}
                                                                className={`px-2.5 py-1 rounded text-xs font-semibold border ${
                                                                    f.condicion_vivienda === "DESTRUIDA" || f.condicion_vivienda === "COLAPSADA"
                                                                        ? "bg-rose-500/20 text-rose-300 border-rose-500/40"
                                                                        : f.condicion_vivienda === "INHABITABLE"
                                                                        ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                                                                        : "bg-slate-800 text-slate-300 border-slate-700"
                                                                }`}
                                                            >
                                                                <option value="INHABITABLE">INHABITABLE (Apto BAE)</option>
                                                                <option value="DESTRUIDA">DESTRUIDA (Apto BAE)</option>
                                                                <option value="COLAPSADA">COLAPSADA (Apto BAE)</option>
                                                                <option value="AFECTADA">AFECTADA (No apto BAE)</option>
                                                            </select>
                                                        </td>
                                                        <td className="p-3 text-center">
                                                            {esAptoBae ? (
                                                                <span className="px-2 py-1 rounded-md text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 inline-flex items-center gap-1">
                                                                    <Coins className="w-3 h-3" />
                                                                    S/ 500 / mes
                                                                </span>
                                                            ) : (
                                                                <span className="px-2 py-1 rounded-md text-[11px] font-medium bg-slate-800 text-slate-400">
                                                                    No aplica
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td className="p-3 text-center">
                                                            <button
                                                                onClick={() => eliminarFamilia(idx)}
                                                                className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
                                                                title="Eliminar registro"
                                                            >
                                                                <Trash2 className="w-3.5 h-3.5" />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* TAB 1: EVALUACIÓN RÁPIDA DE DAÑOS */}
                        {activeTab === "f1" && plantilla && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-900/60 p-6 rounded-xl border border-slate-800">
                                <div>
                                    <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                                        <Home className="w-4 h-4 text-emerald-400" />
                                        Impacto Físico y Poblacional en {plantilla.distrito}
                                    </h3>
                                    <div className="space-y-3 text-xs">
                                        <div className="flex justify-between items-center bg-slate-950 p-3 rounded-lg border border-slate-800">
                                            <span className="text-slate-400">Peligro Asociado (INDECI):</span>
                                            <span className="font-semibold text-emerald-400">{plantilla.formulario_1_evaluacion_rapida.peligro_asociado}</span>
                                        </div>
                                        <div className="grid grid-cols-3 gap-3">
                                            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-center">
                                                <div className="text-lg font-bold text-rose-400">{plantilla.formulario_1_evaluacion_rapida.viviendas_destruidas}</div>
                                                <div className="text-[11px] text-slate-400 mt-0.5">Viviendas Destruidas</div>
                                            </div>
                                            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-center">
                                                <div className="text-lg font-bold text-amber-400">{plantilla.formulario_1_evaluacion_rapida.viviendas_inhabitables}</div>
                                                <div className="text-[11px] text-slate-400 mt-0.5">Viviendas Inhabitables</div>
                                            </div>
                                            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-center">
                                                <div className="text-lg font-bold text-slate-200">{plantilla.formulario_1_evaluacion_rapida.viviendas_afectadas}</div>
                                                <div className="text-[11px] text-slate-400 mt-0.5">Viviendas Afectadas</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                                        <AlertTriangle className="w-4 h-4 text-amber-400" />
                                        Servicios Esenciales Interrumpidos
                                    </h3>
                                    <div className="space-y-2 text-xs">
                                        <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 flex justify-between items-center">
                                            <span className="text-slate-400">Agua Potable:</span>
                                            <span className="font-semibold text-rose-300">{plantilla.formulario_1_evaluacion_rapida.servicios_basicos_interrumpidos.agua_potable}</span>
                                        </div>
                                        <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 flex justify-between items-center">
                                            <span className="text-slate-400">Energía Eléctrica:</span>
                                            <span className="font-semibold text-amber-300">{plantilla.formulario_1_evaluacion_rapida.servicios_basicos_interrumpidos.electricidad}</span>
                                        </div>
                                        <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 flex justify-between items-center">
                                            <span className="text-slate-400">Alcantarillado:</span>
                                            <span className="font-semibold text-rose-300">{plantilla.formulario_1_evaluacion_rapida.servicios_basicos_interrumpidos.alcantarillado}</span>
                                        </div>
                                        <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 flex justify-between items-center">
                                            <span className="text-slate-400">Conectividad Vial:</span>
                                            <span className="font-semibold text-amber-300">{plantilla.formulario_1_evaluacion_rapida.servicios_basicos_interrumpidos.conectividad_vial}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* TAB 2B: MEDIOS DE VIDA */}
                        {activeTab === "f2b" && plantilla && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-900/60 p-6 rounded-xl border border-slate-800">
                                <div>
                                    <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                                        <Wheat className="w-4 h-4 text-amber-400" />
                                        Pérdidas Agrícolas y Seguro SAC (MIDAGRI)
                                    </h3>
                                    <div className="space-y-3 text-xs">
                                        <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 flex justify-between items-center">
                                            <span className="text-slate-400">Hectáreas de Cultivo Perdidas:</span>
                                            <span className="text-base font-bold text-amber-400">{plantilla.formulario_2b_medios_vida.hectareas_cultivo_perdidas} Has.</span>
                                        </div>
                                        <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 flex justify-between items-center">
                                            <span className="text-slate-400">Variedad de Cultivo:</span>
                                            <span className="font-semibold text-white">{plantilla.formulario_2b_medios_vida.tipo_cultivo}</span>
                                        </div>
                                        <div className="bg-amber-500/10 border border-amber-500/30 p-3 rounded-lg text-amber-200">
                                            <strong className="block mb-1">Activación de Cobertura SAC:</strong>
                                            Indemnización de hasta S/ 800 por hectárea mediante la póliza catastrófica del Ministerio de Desarrollo Agrario y Riego.
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                                        <Users className="w-4 h-4 text-sky-400" />
                                        Sector Pecuario e Infraestructura de Riego
                                    </h3>
                                    <div className="space-y-3 text-xs">
                                        <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 flex justify-between items-center">
                                            <span className="text-slate-400">Ganado Afectado / Muerto:</span>
                                            <span className="text-base font-bold text-rose-400">{plantilla.formulario_2b_medios_vida.ganado_muerto_o_afectado} cabezas</span>
                                        </div>
                                        <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 flex justify-between items-center">
                                            <span className="text-slate-400">Canales de Riego Colapsados:</span>
                                            <span className="font-semibold text-white">{plantilla.formulario_2b_medios_vida.canales_riego_destruidos_metros} metros lineales</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Barra de Firma Digital y Despacho */}
                        <div className="mt-8 bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6">
                            <div className="space-y-1">
                                <div className="text-sm font-bold text-white flex items-center gap-2">
                                    <Shield className="w-4 h-4 text-emerald-400" />
                                    Firma Digital y Envío Homologado SINPAD v2
                                </div>
                                <p className="text-xs text-slate-400 max-w-xl">
                                    Al emitir la ficha, se sella criptográficamente con SHA-256, se genera el código QR fiscalizable y se despacha de inmediato por webhook a la Contraloría General de la República para su control concurrente.
                                </p>
                            </div>

                            <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                                <button
                                    onClick={emitirFichaOficial}
                                    disabled={emitiendo}
                                    className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/30 transition disabled:opacity-50"
                                >
                                    {emitiendo ? (
                                        <>
                                            <RefreshCw className="w-4 h-4 animate-spin" />
                                            Sellando & Despachando a CGR...
                                        </>
                                    ) : (
                                        <>
                                            <FileCheck2 className="w-4 h-4" />
                                            Firmar Digitalmente y Emitir EDAN Oficial
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* RESULTADO TRAS EMISIÓN DE FICHA OFICIAL */}
                        {fichaEmitida && (
                            <div className="mt-6 bg-emerald-950/30 border border-emerald-700/60 rounded-2xl p-6 text-slate-200">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                                        <CheckCircle2 className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-white">
                                            Ficha EDAN Oficial Emitida y Registrada con Éxito
                                        </h3>
                                        <div className="text-xs text-emerald-300 font-mono">
                                            ID: {fichaEmitida.edan_id} | SINPAD: {fichaEmitida.codigo_sinpad}
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs mb-6">
                                    <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800">
                                        <span className="text-slate-400 block mb-1">Hash SHA-256 de Integridad:</span>
                                        <div className="font-mono text-[11px] text-emerald-300 break-all">
                                            {fichaEmitida.hash_sha256}
                                        </div>
                                    </div>

                                    <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800">
                                        <span className="text-slate-400 block mb-1">Despacho Webhook CGR:</span>
                                        <div className="font-semibold text-white">
                                            Registro {fichaEmitida.disparo_contraloria.registro_cgr_id}
                                        </div>
                                        <span className="text-[11px] text-amber-300 block mt-0.5">
                                            Estado: {fichaEmitida.disparo_contraloria.estado_control}
                                        </span>
                                    </div>

                                    <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800">
                                        <span className="text-slate-400 block mb-1">Impacto Social Directo:</span>
                                        <div className="text-white font-medium">
                                            {fichaEmitida.familias_bono_bae} familias listas para cobro Bono BAE
                                        </div>
                                        <span className="text-[11px] text-emerald-300 block mt-0.5">
                                            Seguro SAC: {fichaEmitida.seguro_agricola_sac_activado ? "Activado" : "No aplica"}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex flex-wrap items-center gap-3 pt-2">
                                    <a
                                        href={`http://127.0.0.1:8000/api/v1/edan/descargar-pdf/${fichaEmitida.edan_id}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-lg flex items-center gap-2 transition"
                                    >
                                        <Download className="w-3.5 h-3.5" />
                                        Descargar Ficha EDAN Oficial PDF (ReportLab + QR)
                                    </a>

                                    <a
                                        href={`http://127.0.0.1:8000/api/v1/edan/exportar-sinpad/${fichaEmitida.edan_id}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-lg flex items-center gap-2 border border-slate-700 transition"
                                    >
                                        <FileSpreadsheet className="w-3.5 h-3.5" />
                                        Exportar Payload SINPAD v2 (JSON Carga Masiva)
                                    </a>

                                    <Link
                                        href="/contraloria"
                                        className="px-4 py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-semibold text-xs rounded-lg flex items-center gap-2 border border-amber-500/40 transition"
                                    >
                                        <Shield className="w-3.5 h-3.5" />
                                        Ver en Consola de Control Concurrente
                                    </Link>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </main>
        </div>
    );
}
