"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { API_BASE } from "@/config/api";
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
    UserCheck,
    ShieldAlert,
    MapPin
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
    comisaria_referencia?: string;
    colegio_referencia?: string;
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
    codigo_sinpad?: string;
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
    const [activeTab, setActiveTab] = useState<"f1" | "f2a" | "f2b" | "anexo2" | "previsualizacion">("f2a");
    const [cargando, setCargando] = useState<boolean>(true);
    const [auditando, setAuditando] = useState<boolean>(false);
    const [auditoria, setAuditoria] = useState<AuditoriaResultado | null>(null);
    const [emitiendo, setEmitiendo] = useState<boolean>(false);
    const [fichaEmitida, setFichaEmitida] = useState<FichaEmitida | null>(null);
    const [tokenFirma, setTokenFirma] = useState<string>("MUNI-DEFENSA-CIVIL-KEY-2026");
    const [ineiVulnerabilidad, setIneiVulnerabilidad] = useState<any | null>(null);

    // Referencias Institucionales Obligatorias (PNP & MINEDU)
    const [referencias, setReferencias] = useState<{
        total_comisarias?: number;
        total_colegios?: number;
        colegios_albergues_potenciales?: number;
        comisarias: any[];
        centros_educativos: any[];
        albergues_potenciales: any[];
    } | null>(null);
    const [comisariaSeleccionada, setComisariaSeleccionada] = useState<string>("");
    const [colegioSeleccionado, setColegioSeleccionado] = useState<string>("");
    const [catalogoTodosDistritos, setCatalogoTodosDistritos] = useState<any[]>([]);
    const [casosModelo, setCasosModelo] = useState<any[]>([]);
    const [casoActivo, setCasoActivo] = useState<string | null>(null);
    const [planillaBah, setPlanillaBah] = useState<any | null>(null);

    useEffect(() => {
        const fetchCatalogoYCasos = async () => {
            try {
                const [resCat, resCasos] = await Promise.all([
                    fetch(`${API_BASE}/api/v1/municipal/catalogo-distritos`),
                    fetch(`${API_BASE}/api/v1/edan/casos-modelo`)
                ]);
                if (resCat.ok) {
                    const data = await resCat.json();
                    setCatalogoTodosDistritos(data);
                }
                if (resCasos.ok) {
                    const dataCasos = await resCasos.json();
                    setCasosModelo(dataCasos);
                }
            } catch (e) {
                console.error("Error cargando catálogo o casos modelo:", e);
            }
        };
        fetchCatalogoYCasos();
    }, []);

    const calcularPlanilla = async (data: PlantillaEDAN) => {
        try {
            const res = await fetch(`${API_BASE}/api/v1/edan/calcular-planilla-bah`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ficha: data })
            });
            if (res.ok) {
                const plan = await res.json();
                setPlanillaBah(plan);
            }
        } catch (e) {
            console.error("Error al calcular Planilla BAH Anexo 02:", e);
        }
    };

    const cargarCasoModelo = async (casoId: string) => {
        setCargando(true);
        setCasoActivo(casoId);
        try {
            const res = await fetch(`${API_BASE}/api/v1/edan/cargar-caso-modelo/${casoId}`);
            if (res.ok) {
                const data: PlantillaEDAN = await res.json();
                setUbigeoSeleccionado(data.ubigeo);
                setPlantilla(data);
                evaluarConsistencia(data);
                calcularPlanilla(data);
                const resRef = await fetch(`${API_BASE}/api/v1/municipal/${data.ubigeo}/referencias-institucionales`);
                if (resRef.ok) {
                    const refData = await resRef.json();
                    setReferencias(refData);
                    if (refData.comisarias?.length > 0) setComisariaSeleccionada(refData.comisarias[0].nombre || refData.comisarias[0].cod_cpnp);
                    if (refData.centros_educativos?.length > 0) setColegioSeleccionado(refData.centros_educativos[0].nombre_ie);
                }
            }
        } catch (e) {
            console.error("Error cargando caso modelo:", e);
        } finally {
            setCargando(false);
        }
    };

    // Cargar plantilla por UBIGEO y sus referencias institucionales obligatorias
    const cargarPlantilla = async (ubigeo: string) => {
        setCargando(true);
        setFichaEmitida(null);
        try {
            const apiBase = API_BASE;
            const [res, resInei, resRef] = await Promise.all([
                fetch(`${apiBase}/api/v1/edan/plantilla/${ubigeo}`),
                fetch(`${apiBase}/api/v1/inei/vulnerabilidad/edan-asistencia/${ubigeo}`),
                fetch(`${apiBase}/api/v1/municipal/${ubigeo}/referencias-institucionales`)
            ]);
            let comSel = "";
            let colSel = "";
            if (resRef && resRef.ok) {
                const refData = await resRef.json();
                setReferencias(refData);
                if (refData.comisarias && refData.comisarias.length > 0) {
                    comSel = refData.comisarias[0].nombre || refData.comisarias[0].cod_cpnp;
                    setComisariaSeleccionada(comSel);
                } else {
                    setComisariaSeleccionada("");
                }
                if (refData.centros_educativos && refData.centros_educativos.length > 0) {
                    const alb = refData.centros_educativos.find((e: any) => e.es_albergue_potencial);
                    colSel = alb ? alb.nombre_ie : refData.centros_educativos[0].nombre_ie;
                    setColegioSeleccionado(colSel);
                } else {
                    setColegioSeleccionado("");
                }
            }

            if (res.ok) {
                const data: PlantillaEDAN = await res.json();
                if (data && data.formulario_2a_familias) {
                    data.formulario_2a_familias = data.formulario_2a_familias.map(f => ({
                        ...f,
                        comisaria_referencia: f.comisaria_referencia || comSel,
                        colegio_referencia: f.colegio_referencia || colSel
                    }));
                }
                setPlantilla(data);
                evaluarConsistencia(data, comSel, colSel);
                calcularPlanilla(data);
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
    const evaluarConsistencia = async (data: PlantillaEDAN, comOverride?: string, colOverride?: string) => {
        setAuditando(true);
        try {
            const res = await fetch(`${API_BASE}/api/v1/edan/evaluar-consistencia`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ficha: data })
            });
            if (res.ok) {
                const resultado: AuditoriaResultado = await res.json();
                const com = comOverride !== undefined ? comOverride : comisariaSeleccionada;
                const col = colOverride !== undefined ? colOverride : colegioSeleccionado;
                if (!com || !col) {
                    resultado.alertas_detectadas.unshift({
                        codigo: "ALERTA-SINPAD-REF-01",
                        gravedad: "ALTA",
                        mensaje: "ADVERTENCIA TERRITORIAL OBLIGATORIA: Falta seleccionar Comisaría PNP o Local Educativo/Albergue para validar territorialmente la Ficha EDAN y evitar observaciones en Contraloría y SINPAD v2."
                    });
                }
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
                const res = await fetch(`${API_BASE}/api/v1/pide/reniec/consultar/${nuevoDni}`);
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
            const res = await fetch(`${API_BASE}/api/v1/pide/reniec/validar-lote`, {
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
            necesidades_urgentes: ["CARPAS", "RACIONES"],
            comisaria_referencia: comisariaSeleccionada || "Comisaría PNP Distrital",
            colegio_referencia: colegioSeleccionado || "Local Educativo de Referencia"
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
            const res = await fetch(`${API_BASE}/api/v1/edan/generar-oficial`, {
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
                        <label className="text-xs font-medium text-slate-400 block mb-1.5 flex items-center justify-between">
                            <span className="flex items-center gap-1.5">
                                <Building2 className="w-3.5 h-3.5 text-emerald-400" />
                                Distrito & Alcaldía (Censo INEI 2026)
                            </span>
                            <span className="text-[10px] text-emerald-400 font-mono">1,891 Distritos</span>
                        </label>
                        <select
                            value={ubigeoSeleccionado}
                            onChange={(e) => setUbigeoSeleccionado(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-700 text-xs rounded-lg px-2.5 py-2 text-white focus:outline-none focus:border-emerald-500"
                        >
                            <optgroup label="Distritos Críticos FEN (D.S. N.° 124-2026-PCM)">
                                {DISTRITOS_PRIORITARIOS.map((d) => (
                                    <option key={`prio-${d.ubigeo}`} value={d.ubigeo}>
                                        {d.nombre} ({d.depto}) - UBIGEO {d.ubigeo}
                                    </option>
                                ))}
                            </optgroup>
                            {catalogoTodosDistritos.length > 0 && (
                                <optgroup label="Todos los Distritos del Perú (1,891)">
                                    {catalogoTodosDistritos.map((d) => (
                                        <option key={`all-${d.ubigeo}`} value={d.ubigeo}>
                                            {d.distrito} ({d.departamento}) - UBIGEO {d.ubigeo} {d.ds_124_2026_pcm ? "⚡" : ""}
                                        </option>
                                    ))}
                                </optgroup>
                            )}
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

            {/* Ribbon de Casos de Modelo Oficiales para Llenado Rápido (1 Clic) */}
            {casosModelo && casosModelo.length > 0 && (
                <div className="max-w-7xl mx-auto mb-6 bg-gradient-to-r from-slate-900 via-slate-900/90 to-indigo-950/40 border border-slate-700/80 rounded-2xl p-4 shadow-xl">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-800 pb-3 mb-3">
                        <div className="flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-amber-400" />
                            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                                Casos de Modelo para Llenado Rápido (1 Clic)
                                <span className="text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full">
                                    Preconfiguración Táctica de Emergencia
                                </span>
                            </h3>
                        </div>
                        <span className="text-xs text-slate-400">
                            Carga instantánea de escenarios FEN reales con empadronamiento, daños y cálculo BAH
                        </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        {casosModelo.map((caso) => (
                            <button
                                key={caso.id}
                                onClick={() => cargarCasoModelo(caso.id)}
                                className={`p-3 rounded-xl border text-left transition relative overflow-hidden flex flex-col justify-between ${
                                    casoActivo === caso.id
                                        ? "bg-amber-500/10 border-amber-500 text-white shadow-lg shadow-amber-500/10"
                                        : "bg-slate-950/80 border-slate-800 hover:border-slate-700 text-slate-300 hover:bg-slate-900"
                                }`}
                            >
                                <div>
                                    <div className="flex items-center justify-between gap-1 mb-1.5">
                                        <span className="text-lg">{caso.icono}</span>
                                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                                            {caso.distrito}
                                        </span>
                                    </div>
                                    <div className="text-xs font-bold text-white line-clamp-1">{caso.nombre}</div>
                                    <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-tight">
                                        {caso.descripcion}
                                    </p>
                                </div>
                                <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px]">
                                    <span className="text-amber-400 font-semibold">{caso.badge}</span>
                                    <span className="text-emerald-400 font-mono font-bold flex items-center gap-1">
                                        Cargar <Check className="w-3 h-3" />
                                    </span>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Panel de Georreferenciación & Referencias Institucionales Obligatorias (PNP & MINEDU) */}
            <div className="max-w-7xl mx-auto mb-6 bg-slate-900/90 border border-slate-700/80 rounded-2xl p-4 shadow-xl">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-800 pb-3 mb-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <Shield className="w-5 h-5 text-sky-400" />
                            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                                Referencias Institucionales Obligatorias de Ubicación y Albergue
                                <span className="text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full">
                                    Exigido para Validación SINPAD v2.0
                                </span>
                            </h3>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">
                            Para evitar falsos positivos y rechazos en la entrega de asistencia humanitaria y Bono BAE, cada ficha familiar debe anclarse a la Comisaría PNP de jurisdicción y al Local Educativo de evacuación o albergue temporal.
                        </p>
                    </div>
                    <div className="text-xs text-slate-400 flex items-center gap-3">
                        <span className="bg-slate-800 px-2.5 py-1 rounded text-[11px] border border-slate-700 text-slate-300">
                            Jurisdicción: <strong className="text-white font-mono">{plantilla?.distrito || ubigeoSeleccionado} (UBIGEO {ubigeoSeleccionado})</strong>
                        </span>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Comisaría PNP */}
                    <div className="bg-slate-950/80 border border-sky-800/40 p-3.5 rounded-xl">
                        <div className="flex items-center justify-between mb-1.5">
                            <label className="text-xs font-bold text-sky-300 flex items-center gap-1.5">
                                <Building2 className="w-4 h-4 text-sky-400" />
                                Comisaría PNP de Jurisdicción (Obligatorio)
                            </label>
                            <span className="text-[10px] px-2 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-800 font-mono">
                                {referencias?.total_comisarias || 0} comisarías en distrito
                            </span>
                        </div>
                        <select
                            value={comisariaSeleccionada}
                            onChange={(e) => {
                                const val = e.target.value;
                                setComisariaSeleccionada(val);
                                if (plantilla) {
                                    const actualizadas = plantilla.formulario_2a_familias.map(f => ({
                                        ...f,
                                        comisaria_referencia: val
                                    }));
                                    const nuevaP = { ...plantilla, formulario_2a_familias: actualizadas };
                                    setPlantilla(nuevaP);
                                    evaluarConsistencia(nuevaP, val, colegioSeleccionado);
                                }
                            }}
                            className="w-full bg-slate-900 border border-sky-700/60 text-xs rounded-lg px-3 py-2 text-white focus:outline-none focus:border-sky-400"
                        >
                            {referencias?.comisarias && referencias.comisarias.length > 0 ? (
                                referencias.comisarias.map((c: any, idx: number) => (
                                    <option key={idx} value={c.nombre || c.cod_cpnp}>
                                        {c.nombre || `Comisaría ${c.cod_cpnp}`} {c.direccion ? `— ${c.direccion}` : ""}
                                    </option>
                                ))
                            ) : (
                                <option value="">No hay comisarías PNP registradas para este UBIGEO</option>
                            )}
                        </select>
                        <div className="mt-2 text-[11px] text-slate-400 flex items-center justify-between">
                            <span>Referencia de seguridad para custodia de empadronamiento y entrega de víveres</span>
                            {comisariaSeleccionada ? (
                                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                                    <Check className="w-3 h-3" /> Asignada
                                </span>
                            ) : (
                                <span className="text-rose-400 font-semibold flex items-center gap-1">
                                    <AlertTriangle className="w-3 h-3" /> Requerida
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Local Educativo / Albergue MINEDU */}
                    <div className="bg-slate-950/80 border border-emerald-800/40 p-3.5 rounded-xl">
                        <div className="flex items-center justify-between mb-1.5">
                            <label className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                                <Home className="w-4 h-4 text-emerald-400" />
                                Colegio / Local Educativo MINEDU (Punto de Albergue Seguro)
                            </label>
                            <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-mono">
                                {referencias?.total_colegios || 0} I.E. ({referencias?.colegios_albergues_potenciales || 0} albergues INDECI)
                            </span>
                        </div>
                        <select
                            value={colegioSeleccionado}
                            onChange={(e) => {
                                const val = e.target.value;
                                setColegioSeleccionado(val);
                                if (plantilla) {
                                    const actualizadas = plantilla.formulario_2a_familias.map(f => ({
                                        ...f,
                                        colegio_referencia: val
                                    }));
                                    const nuevaP = { ...plantilla, formulario_2a_familias: actualizadas };
                                    setPlantilla(nuevaP);
                                    evaluarConsistencia(nuevaP, comisariaSeleccionada, val);
                                }
                            }}
                            className="w-full bg-slate-900 border border-emerald-700/60 text-xs rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-400"
                        >
                            {referencias?.centros_educativos && referencias.centros_educativos.length > 0 ? (
                                referencias.centros_educativos.map((e: any, idx: number) => (
                                    <option key={idx} value={e.nombre_ie}>
                                        {e.es_albergue_potencial ? "🟢 [ALBERGUE INDECI] " : "🏫 "}
                                        {e.nombre_ie} ({e.nivel || "I.E."}) {e.direccion ? `— ${e.direccion}` : ""}
                                    </option>
                                ))
                            ) : (
                                <option value="">No hay centros educativos registrados para este UBIGEO</option>
                            )}
                        </select>
                        <div className="mt-2 text-[11px] text-slate-400 flex items-center justify-between">
                            <span>Punto de evacuación seguro y empadronamiento de familias damnificadas</span>
                            {colegioSeleccionado ? (
                                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                                    <Check className="w-3 h-3" /> Asignado
                                </span>
                            ) : (
                                <span className="text-rose-400 font-semibold flex items-center gap-1">
                                    <AlertTriangle className="w-3 h-3" /> Requerido
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>

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
                            <div className="flex items-baseline gap-1.5">
                                <span className="text-base font-black text-amber-300">
                                    {ineiVulnerabilidad.viviendas_paredes_precarias?.toLocaleString() ?? "--"}
                                </span>
                                {ineiVulnerabilidad.viviendas_adobe_quincha_pct !== undefined && ineiVulnerabilidad.viviendas_adobe_quincha_pct !== null && (
                                    <span className="text-[10px] font-mono text-amber-400/90 font-bold">
                                        ({ineiVulnerabilidad.viviendas_adobe_quincha_pct}%)
                                    </span>
                                )}
                            </div>
                            <span className="text-[9px] text-slate-500 block">Adobe, quincha o esteras</span>
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

                    {/* Intersección Espacial Crítica: Manzanas Censales INEI en Faja Marginal de la ANA */}
                    {ineiVulnerabilidad.manzanas_faja_marginal?.tiene_manzanas_en_faja && (
                        <div className="mt-3 p-3 rounded-xl bg-gradient-to-r from-rose-950/70 via-slate-950 to-slate-950 border border-rose-800/80 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
                            <div className="flex items-start gap-2.5">
                                <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-rose-300">
                                            Intersección Espacial Crítica: {ineiVulnerabilidad.manzanas_faja_marginal.total_manzanas_en_faja} Manzanas Censales en Faja Marginal ANA
                                        </span>
                                        <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-rose-900 text-rose-200 border border-rose-700 font-bold">
                                            Zona Intangible
                                        </span>
                                    </div>
                                    <p className="text-[11px] text-slate-300 mt-0.5">
                                        Cauce: <strong className="text-white">{ineiVulnerabilidad.manzanas_faja_marginal.cauce_hidrico}</strong> • Amparado en <strong>{ineiVulnerabilidad.manzanas_faja_marginal.resolucion_ana}</strong> (Riesgo No Mitigable - Ley Nº 29338).
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0 font-mono text-[11px]">
                                <div className="px-2.5 py-1 rounded-lg bg-rose-950/80 border border-rose-700/80 text-rose-200">
                                    <strong className="text-white">{ineiVulnerabilidad.manzanas_faja_marginal.total_viviendas_en_faja?.toLocaleString()}</strong> viv. en faja
                                </div>
                                <div className="px-2.5 py-1 rounded-lg bg-rose-950/80 border border-rose-700/80 text-rose-200">
                                    <strong className="text-white">{ineiVulnerabilidad.manzanas_faja_marginal.total_poblacion_en_faja?.toLocaleString()}</strong> hab. en peligro
                                </div>
                            </div>
                        </div>
                    )}
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
                <div className="flex flex-wrap border-b border-slate-800 mb-6 gap-2">
                    <button
                        onClick={() => setActiveTab("f1")}
                        className={`px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 flex items-center gap-2 transition ${
                            activeTab === "f1"
                                ? "border-amber-500 text-amber-400 bg-amber-500/10 rounded-t-lg"
                                : "border-transparent text-slate-400 hover:text-slate-200"
                        }`}
                    >
                        <Home className="w-4 h-4 text-amber-400" />
                        Anexo 1: Evaluación Rápida (ER)
                        <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded font-mono">0-4h</span>
                    </button>

                    <button
                        onClick={() => setActiveTab("anexo2")}
                        className={`px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 flex items-center gap-2 transition ${
                            activeTab === "anexo2"
                                ? "border-sky-500 text-sky-400 bg-sky-500/10 rounded-t-lg"
                                : "border-transparent text-slate-400 hover:text-slate-200"
                        }`}
                    >
                        <FileSpreadsheet className="w-4 h-4 text-sky-400" />
                        Anexo 2: Planilla Oficial Entrega BAH
                        <span className="text-[10px] bg-sky-500/20 text-sky-300 px-1.5 py-0.5 rounded font-mono">Urgencia BAH</span>
                    </button>

                    <button
                        onClick={() => setActiveTab("f2a")}
                        className={`px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 flex items-center gap-2 transition ${
                            activeTab === "f2a"
                                ? "border-emerald-500 text-emerald-400 bg-emerald-500/10 rounded-t-lg"
                                : "border-transparent text-slate-400 hover:text-slate-200"
                        }`}
                    >
                        <Users className="w-4 h-4 text-emerald-400" />
                        Anexo 3 (2A): Empadronamiento ({plantilla?.formulario_2a_familias.length || 0})
                        <span className="bg-emerald-500/20 text-emerald-300 text-xs px-2 py-0.5 rounded-full font-bold">
                            Bono BAE
                        </span>
                    </button>

                    <button
                        onClick={() => setActiveTab("f2b")}
                        className={`px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 flex items-center gap-2 transition ${
                            activeTab === "f2b"
                                ? "border-emerald-500 text-emerald-400 bg-emerald-500/10 rounded-t-lg"
                                : "border-transparent text-slate-400 hover:text-slate-200"
                        }`}
                    >
                        <Wheat className="w-4 h-4 text-amber-400" />
                        Anexo 4 (2B): Medios de Vida
                        <span className="bg-amber-500/20 text-amber-300 text-xs px-2 py-0.5 rounded-full font-bold">
                            SAC
                        </span>
                    </button>

                    <button
                        onClick={() => setActiveTab("previsualizacion")}
                        className={`px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 flex items-center gap-2 transition ${
                            activeTab === "previsualizacion"
                                ? "border-purple-500 text-purple-400 bg-purple-500/10 rounded-t-lg"
                                : "border-transparent text-slate-400 hover:text-slate-200"
                        }`}
                    >
                        <FileText className="w-4 h-4 text-purple-400" />
                        Previsualización Oficial en Vivo
                        <span className="text-[10px] bg-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded font-mono">Oficial INDECI</span>
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
                                                <th className="p-3">Ref. PNP / Albergue</th>
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
                                                        <td className="p-3">
                                                            <div className="text-[11px] text-sky-300 flex items-center gap-1 max-w-[190px]" title={f.comisaria_referencia || comisariaSeleccionada}>
                                                                <Building2 className="w-3 h-3 flex-shrink-0 text-sky-400" />
                                                                <span className="truncate">{f.comisaria_referencia || comisariaSeleccionada || "Comisaría PNP"}</span>
                                                            </div>
                                                            <div className="text-[11px] text-emerald-300 flex items-center gap-1 max-w-[190px] mt-1" title={f.colegio_referencia || colegioSeleccionado}>
                                                                <Home className="w-3 h-3 flex-shrink-0 text-emerald-400" />
                                                                <span className="truncate">{f.colegio_referencia || colegioSeleccionado || "I.E. / Albergue"}</span>
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

                        {/* TAB ANEXO 2: PLANILLA DE ENTREGA BAH */}
                        {activeTab === "anexo2" && (
                            <div className="space-y-4">
                                <div className="bg-slate-900/80 p-5 rounded-2xl border border-sky-800/40">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="px-2 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-800 text-[10px] font-mono font-bold">
                                                    ANEXO N° 02 OFICIAL
                                                </span>
                                                <span className="text-xs font-bold text-slate-300">
                                                    R.M. N° 324-2023-PCM & Anexo 06 INDECI
                                                </span>
                                            </div>
                                            <h3 className="text-lg font-black text-white flex items-center gap-2">
                                                <FileSpreadsheet className="w-5 h-5 text-sky-400" />
                                                Planilla de Entrega de Bienes de Ayuda Humanitaria (BAH)
                                            </h3>
                                            <p className="text-xs text-slate-400 mt-0.5">
                                                Registro oficial de entrega en campo con cálculo automatizado según tamaño de familia y condición de habitante (Damnificado vs Afectado).
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => setActiveTab("previsualizacion")}
                                                className="px-3.5 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold flex items-center gap-1.5 transition"
                                            >
                                                <FileText className="w-4 h-4" />
                                                Ver Formato Impreso INDECI
                                            </button>
                                        </div>
                                    </div>

                                    {/* Metadatos Oficiales de la Planilla */}
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 text-xs">
                                        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                                            <span className="text-[10px] text-slate-500 block">Jurisdicción</span>
                                            <span className="font-bold text-white">{plantilla?.distrito} ({plantilla?.departamento})</span>
                                        </div>
                                        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                                            <span className="text-[10px] text-slate-500 block">Código SINPAD</span>
                                            <span className="font-mono font-bold text-emerald-400">{plantilla?.codigo_sinpad || `SINPAD-2026-${ubigeoSeleccionado}`}</span>
                                        </div>
                                        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                                            <span className="text-[10px] text-slate-500 block">Población Empadronada</span>
                                            <span className="font-bold text-sky-300">{planillaBah?.totales_almacen?.total_personas || 0} personas ({planillaBah?.totales_almacen?.total_familias || 0} fam.)</span>
                                        </div>
                                        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                                            <span className="text-[10px] text-slate-500 block">Alcalde / Responsable</span>
                                            <span className="font-bold text-amber-300 truncate block">{plantilla?.alcalde}</span>
                                        </div>
                                    </div>

                                    {/* Resumen Consolidado de Despacho de Almacén (Regla Anexo 06) */}
                                    <div className="mt-4 pt-4 border-t border-slate-800">
                                        <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2 flex items-center gap-1.5">
                                            <Coins className="w-3.5 h-3.5 text-amber-400" />
                                            Cálculo Normativo de Requerimiento de Almacén (Baremo Anexo 06 INDECI):
                                        </span>
                                        <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 text-xs">
                                            <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-center">
                                                <span className="text-base font-black text-white">{planillaBah?.totales_almacen?.carpas || 0}</span>
                                                <span className="text-[10px] text-slate-400 block">Carpas Camp.</span>
                                            </div>
                                            <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-center">
                                                <span className="text-base font-black text-amber-300">{planillaBah?.totales_almacen?.calaminas || 0}</span>
                                                <span className="text-[10px] text-slate-400 block">Calaminas</span>
                                            </div>
                                            <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-center">
                                                <span className="text-base font-black text-sky-300">{planillaBah?.totales_almacen?.frazadas || 0}</span>
                                                <span className="text-[10px] text-slate-400 block">Frazadas / Camas</span>
                                            </div>
                                            <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-center">
                                                <span className="text-base font-black text-emerald-300">{planillaBah?.totales_almacen?.raciones_crudas_kg || 0} kg</span>
                                                <span className="text-[10px] text-slate-400 block">Ración Cruda (15d)</span>
                                            </div>
                                            <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-center">
                                                <span className="text-base font-black text-indigo-300">{planillaBah?.totales_almacen?.bidones || 0} / {planillaBah?.totales_almacen?.baldes || 0}</span>
                                                <span className="text-[10px] text-slate-400 block">Bidones / Baldes</span>
                                            </div>
                                            <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-center">
                                                <span className="text-base font-black text-rose-300">{planillaBah?.totales_almacen?.sacos_terreros || 0}</span>
                                                <span className="text-[10px] text-slate-400 block">Sacos Terreros</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Tabla Nominal de Entrega de Bienes (Planilla Oficial) */}
                                <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/40">
                                    <table className="w-full text-left text-xs">
                                        <thead className="bg-slate-900/90 text-slate-300 font-semibold border-b border-slate-800">
                                            <tr>
                                                <th className="p-2.5 w-10 text-center">N°</th>
                                                <th className="p-2.5">Dirección / Caserío</th>
                                                <th className="p-2.5">Jefe de Familia (Titular)</th>
                                                <th className="p-2.5">DNI</th>
                                                <th className="p-2.5 text-center">Miemb.</th>
                                                <th className="p-2.5 text-center">Techo</th>
                                                <th className="p-2.5 text-center">Abrigo</th>
                                                <th className="p-2.5 text-center">Alimentos</th>
                                                <th className="p-2.5 text-center">Enseres</th>
                                                <th className="p-2.5 text-center">Firma / Huella</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-800/60">
                                            {planillaBah?.filas?.map((f: any, idx: number) => (
                                                <tr key={idx} className="hover:bg-slate-800/30 transition">
                                                    <td className="p-2.5 text-center font-mono text-slate-400">{f.numero_orden}</td>
                                                    <td className="p-2.5">
                                                        <div className="font-medium text-slate-200">{f.direccion}</div>
                                                        <div className="text-[10px] text-slate-400">{f.comisaria_referencia}</div>
                                                    </td>
                                                    <td className="p-2.5">
                                                        <div className="font-bold text-white">{f.titular}</div>
                                                        <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${
                                                            f.condicion === "DAMNIFICADO" ? "bg-rose-500/20 text-rose-300" : "bg-amber-500/20 text-amber-300"
                                                        }`}>
                                                            {f.condicion}
                                                        </span>
                                                    </td>
                                                    <td className="p-2.5 font-mono text-slate-300 font-semibold">{f.dni}</td>
                                                    <td className="p-2.5 text-center font-bold text-white">{f.miembros_familia}</td>
                                                    <td className="p-2.5 text-center">
                                                        <div className="text-[11px] font-mono text-amber-300">
                                                            {f.techo.carpa > 0 ? `1 carpa, ${f.techo.calamina} cal.` : `${f.techo.calamina} calaminas`}
                                                        </div>
                                                        <div className="text-[10px] text-slate-400">{f.techo.triplay} triplay, {f.techo.plastico_m}m plás.</div>
                                                    </td>
                                                    <td className="p-2.5 text-center">
                                                        <div className="text-[11px] font-mono text-sky-300">
                                                            {f.abrigo.frazadas} frazadas
                                                        </div>
                                                        <div className="text-[10px] text-slate-400">{f.abrigo.colchones} colch., {f.abrigo.mosquiteros} mosq.</div>
                                                    </td>
                                                    <td className="p-2.5 text-center">
                                                        <div className="text-[11px] font-mono text-emerald-300">
                                                            {f.alimentos.raciones_crudas_kg} kg crudos
                                                        </div>
                                                        <div className="text-[10px] text-slate-400">{f.alimentos.raciones_frias} raciones frías</div>
                                                    </td>
                                                    <td className="p-2.5 text-center text-[10px] text-slate-300">
                                                        {f.enseres.bidon > 0 ? "1 bidón, 1 balde" : "1 balde"}
                                                    </td>
                                                    <td className="p-2.5 text-center">
                                                        <span className="px-2 py-1 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 text-[10px] font-semibold inline-flex items-center gap-1">
                                                            <Check className="w-3 h-3" /> Conforme
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Bloque de Firmas Oficiales Reglamentarias */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-slate-800">
                                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-center">
                                        <div className="h-10 border-b border-dashed border-slate-700 mb-2"></div>
                                        <div className="text-xs font-bold text-white">{plantilla?.alcalde}</div>
                                        <div className="text-[10px] text-slate-400">Alcalde Distrital / Presidente Plataforma</div>
                                    </div>
                                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-center">
                                        <div className="h-10 border-b border-dashed border-slate-700 mb-2"></div>
                                        <div className="text-xs font-bold text-white">Jefe de Almacén de Defensa Civil</div>
                                        <div className="text-[10px] text-slate-400">Responsable de Custodia y Despacho BAH</div>
                                    </div>
                                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-center">
                                        <div className="h-10 border-b border-dashed border-slate-700 mb-2"></div>
                                        <div className="text-xs font-bold text-white">Representante de la Comunidad</div>
                                        <div className="text-[10px] text-slate-400">Presidente de Junta Vecinal / Afectados</div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* TAB PREVISUALIZACIÓN OFICIAL EN VIVO (FORMATO INDECI) */}
                        {activeTab === "previsualizacion" && plantilla && (
                            <div className="space-y-4">
                                <div className="flex justify-between items-center bg-slate-900 p-4 rounded-xl border border-purple-500/40">
                                    <div className="text-xs text-purple-200">
                                        <span className="font-bold text-white">Previsualización Oficial Idéntica al Formato Físico INDECI:</span> Réplica digital con membretes del Estado Peruano, casilleros normados de la R.M. N° 324-2023-PCM y firma tripartita.
                                    </div>
                                    <button
                                        onClick={() => window.print()}
                                        className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition"
                                    >
                                        <Download className="w-3.5 h-3.5" />
                                        Imprimir / Guardar en PDF
                                    </button>
                                </div>

                                {/* Contenedor Estilo Papel Oficial INDECI */}
                                <div className="bg-white text-slate-900 rounded-xl shadow-2xl p-6 sm:p-10 max-w-4xl mx-auto border border-slate-300 font-sans">
                                    {/* Cabecera Oficial de la República */}
                                    <div className="border-b-2 border-slate-900 pb-4 mb-4 flex justify-between items-start">
                                        <div>
                                            <div className="text-[10px] font-bold uppercase tracking-widest text-slate-600">
                                                REPÚBLICA DEL PERÚ
                                            </div>
                                            <div className="text-[11px] font-extrabold uppercase text-slate-800">
                                                SISTEMA NACIONAL DE GESTIÓN DEL RIESGO DE DESASTRES (SINAGERD)
                                            </div>
                                            <div className="text-xs font-black uppercase text-slate-900 mt-0.5">
                                                INSTITUTO NACIONAL DE DEFENSA CIVIL (INDECI)
                                            </div>
                                            <div className="text-[10px] text-slate-500 mt-1">
                                                Guía Oficial aprobada por R.M. N° 324-2023-PCM & R.S. N° 002-2026-PCM
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className="px-2.5 py-1 bg-red-600 text-white text-xs font-black rounded font-mono block">
                                                {plantilla.codigo_sinpad || `SINPAD-2026-${plantilla.ubigeo}`}
                                            </span>
                                            <span className="text-[10px] font-mono text-slate-600 block mt-1">
                                                EDAN-{plantilla.fecha_formulario.replace(/-/g, "")}-{plantilla.ubigeo}-0001
                                            </span>
                                            <span className="text-[9px] text-red-600 font-bold block mt-0.5">
                                                DECLARACIÓN JURADA OFICIAL
                                            </span>
                                        </div>
                                    </div>

                                    {/* Metadatos de Jurisdicción */}
                                    <div className="bg-slate-50 border border-slate-300 rounded p-3 mb-4 text-xs">
                                        <div className="grid grid-cols-3 gap-2">
                                            <div><strong className="text-slate-600">DEPARTAMENTO:</strong> <span className="font-bold text-slate-900">{plantilla.departamento}</span></div>
                                            <div><strong className="text-slate-600">PROVINCIA:</strong> <span className="font-bold text-slate-900">{plantilla.provincia}</span></div>
                                            <div><strong className="text-slate-600">DISTRITO:</strong> <span className="font-bold text-slate-900">{plantilla.distrito} (UBIGEO {plantilla.ubigeo})</span></div>
                                        </div>
                                        <div className="grid grid-cols-3 gap-2 mt-2 pt-2 border-t border-slate-200">
                                            <div><strong className="text-slate-600">ALCALDE TITULAR:</strong> <span className="font-bold text-slate-900">{plantilla.alcalde}</span></div>
                                            <div><strong className="text-slate-600">MARCO LEGAL:</strong> <span className="font-bold text-slate-900">{plantilla.decreto_emergencia}</span></div>
                                            <div><strong className="text-slate-600">FECHA / HORA:</strong> <span className="font-mono text-slate-900">{plantilla.fecha_formulario} {plantilla.hora_formulario}</span></div>
                                        </div>
                                    </div>

                                    {/* SECCIÓN I: EVALUACIÓN RÁPIDA (ANEXO 01) */}
                                    <div className="mb-4">
                                        <div className="bg-slate-800 text-white px-3 py-1 font-bold text-xs uppercase tracking-wider rounded-t">
                                            I. ANEXO N° 01: FORMULARIO DE EVALUACIÓN RÁPIDA DE DAÑOS
                                        </div>
                                        <div className="border border-slate-300 border-t-0 p-3 text-xs bg-white rounded-b">
                                            <div className="grid grid-cols-4 gap-2 text-center mb-2">
                                                <div className="bg-slate-100 p-2 rounded">
                                                    <span className="text-[10px] text-slate-500 block">Fallecidos</span>
                                                    <strong className="text-sm text-red-600">{plantilla.formulario_1_evaluacion_rapida.fallecidos}</strong>
                                                </div>
                                                <div className="bg-slate-100 p-2 rounded">
                                                    <span className="text-[10px] text-slate-500 block">Lesionados</span>
                                                    <strong className="text-sm text-amber-600">{plantilla.formulario_1_evaluacion_rapida.lesionados}</strong>
                                                </div>
                                                <div className="bg-slate-100 p-2 rounded">
                                                    <span className="text-[10px] text-slate-500 block">Viv. Inhabitables</span>
                                                    <strong className="text-sm text-amber-600">{plantilla.formulario_1_evaluacion_rapida.viviendas_inhabitables}</strong>
                                                </div>
                                                <div className="bg-slate-100 p-2 rounded">
                                                    <span className="text-[10px] text-slate-500 block">Viv. Destruidas</span>
                                                    <strong className="text-sm text-red-600">{plantilla.formulario_1_evaluacion_rapida.viviendas_destruidas}</strong>
                                                </div>
                                            </div>
                                            <div className="text-[11px] text-slate-700">
                                                <strong>Peligro Generador:</strong> {plantilla.formulario_1_evaluacion_rapida.peligro_asociado} | <strong>Corte de Agua:</strong> {plantilla.formulario_1_evaluacion_rapida.servicios_basicos_interrumpidos.agua_potable} | <strong>Electricidad:</strong> {plantilla.formulario_1_evaluacion_rapida.servicios_basicos_interrumpidos.electricidad}
                                            </div>
                                        </div>
                                    </div>

                                    {/* SECCIÓN II: EMPADRONAMIENTO NOMINAL (ANEXO 03 / FORMULARIO 2A) */}
                                    <div className="mb-4">
                                        <div className="bg-sky-800 text-white px-3 py-1 font-bold text-xs uppercase tracking-wider rounded-t flex justify-between items-center">
                                            <span>II. ANEXO N° 03: EMPADRONAMIENTO FAMILIAR (FORMULARIO 2A - HABILITANTE BONO BAE S/ 500)</span>
                                            <span className="text-[10px] font-mono">{plantilla.formulario_2a_familias.length} familias registradas</span>
                                        </div>
                                        <table className="w-full text-left text-[11px] border border-slate-300 border-t-0">
                                            <thead className="bg-slate-100 border-b border-slate-300 text-slate-700 font-bold">
                                                <tr>
                                                    <th className="p-1.5 w-8 text-center">N°</th>
                                                    <th className="p-1.5">Dirección / Caserío</th>
                                                    <th className="p-1.5">Jefe de Familia (Titular)</th>
                                                    <th className="p-1.5">DNI</th>
                                                    <th className="p-1.5 text-center">Miemb.</th>
                                                    <th className="p-1.5">Condición Viv.</th>
                                                    <th className="p-1.5 text-center">Bono BAE</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-200">
                                                {plantilla.formulario_2a_familias.map((f, idx) => (
                                                    <tr key={idx}>
                                                        <td className="p-1.5 text-center font-mono">{idx + 1}</td>
                                                        <td className="p-1.5">{f.sector_caserio} ({f.manzana_lote})</td>
                                                        <td className="p-1.5 font-bold text-slate-900">{f.apellidos_nombres_titular}</td>
                                                        <td className="p-1.5 font-mono">{f.dni_titular}</td>
                                                        <td className="p-1.5 text-center font-bold">{f.miembros_familia}</td>
                                                        <td className="p-1.5 font-semibold text-slate-800">{f.condicion_vivienda}</td>
                                                        <td className="p-1.5 text-center font-bold text-green-700">
                                                            {["INHABITABLE", "DESTRUIDA", "COLAPSADA"].includes(f.condicion_vivienda) ? "APTO S/ 500" : "NO APLICA"}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* SECCIÓN III: PLANILLA DE AYUDA HUMANITARIA (ANEXO 02 / BAREMOS ANEXO 06) */}
                                    <div className="mb-4">
                                        <div className="bg-emerald-800 text-white px-3 py-1 font-bold text-xs uppercase tracking-wider rounded-t flex justify-between items-center">
                                            <span>III. ANEXO N° 02: BIENES DE AYUDA HUMANITARIA ASIGNADOS (BAREMO ANEXO 06)</span>
                                            <span className="text-[10px] font-mono">Entrega Inmediata</span>
                                        </div>
                                        <div className="border border-slate-300 border-t-0 p-3 text-xs bg-slate-50 rounded-b">
                                            <div className="grid grid-cols-5 gap-2 text-center text-[11px]">
                                                <div><strong>Carpas:</strong> {planillaBah?.totales_almacen?.carpas || 0} und</div>
                                                <div><strong>Calaminas:</strong> {planillaBah?.totales_almacen?.calaminas || 0} und</div>
                                                <div><strong>Frazadas:</strong> {planillaBah?.totales_almacen?.frazadas || 0} und</div>
                                                <div><strong>Raciones Crudas:</strong> {planillaBah?.totales_almacen?.raciones_crudas_kg || 0} kg</div>
                                                <div><strong>Bidones/Baldes:</strong> {planillaBah?.totales_almacen?.bidones || 0} / {planillaBah?.totales_almacen?.baldes || 0}</div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Nota Legal Declaración Jurada */}
                                    <div className="bg-amber-50 border border-amber-300 p-2.5 rounded text-[10px] text-amber-900 mb-6">
                                        <strong>DECLARACIÓN JURADA Y RESPONSABILIDAD PENAL:</strong> La información consignada en los presentes Anexos 01, 02, 2A y 2B tiene carácter de Declaración Jurada. Las personas y funcionarios que ingresen datos falsos serán pasibles de las acciones administrativas y penales previstas en el <strong>Artículo 438 del Código Penal</strong> (Falsedad Ideológica).
                                    </div>

                                    {/* Firmas Tripartitas Reglamentarias */}
                                    <div className="grid grid-cols-3 gap-6 pt-6 border-t-2 border-slate-900 text-center text-xs">
                                        <div>
                                            <div className="h-12 border-b border-dashed border-slate-400 mb-1"></div>
                                            <div className="font-bold text-slate-900">{plantilla.alcalde}</div>
                                            <div className="text-[10px] text-slate-600">Alcalde Distrital / Titular SINAGERD</div>
                                        </div>
                                        <div>
                                            <div className="h-12 border-b border-dashed border-slate-400 mb-1"></div>
                                            <div className="font-bold text-slate-900">Jefe de Almacén de Defensa Civil</div>
                                            <div className="text-[10px] text-slate-600">Responsable Logístico de Entrega BAH</div>
                                        </div>
                                        <div>
                                            <div className="h-12 border-b border-dashed border-slate-400 mb-1"></div>
                                            <div className="font-bold text-slate-900">Presidente Junta Vecinal / Caserío</div>
                                            <div className="text-[10px] text-slate-600">Veedor y Fiscalizador Comunitario</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
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
                                        href={`${API_BASE}/api/v1/edan/descargar-pdf/${fichaEmitida.edan_id}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-lg flex items-center gap-2 transition"
                                    >
                                        <Download className="w-3.5 h-3.5" />
                                        Descargar Ficha EDAN Oficial PDF (ReportLab + QR)
                                    </a>

                                    <a
                                        href={`${API_BASE}/api/v1/edan/exportar-sinpad/${fichaEmitida.edan_id}`}
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
