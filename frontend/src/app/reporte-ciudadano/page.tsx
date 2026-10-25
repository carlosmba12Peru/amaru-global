"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import RadiosAndTriagePanel from "@/components/RadiosAndTriagePanel";
import VoiceStoryRecorder from "@/components/VoiceStoryRecorder";
import { IdiomaCodigo, IDIOMAS_SOPORTADOS, DICCIONARIO_EDAN } from "@/locales/edan_i18n";
import {
    LifeBuoy,
    ShieldCheck,
    ShieldAlert,
    AlertTriangle,
    Eye,
    EyeOff,
    CheckCircle2,
    XCircle,
    Camera,
    UploadCloud,
    MapPin,
    Radio,
    FileText,
    Layers,
    Share2,
    Lock,
    Unlock,
    Activity,
    Info,
    Search,
    Sparkles,
    Video,
    Tv,
    Clock,
    RefreshCw,
    Send,
    Database,
    Compass,
    SlidersHorizontal,
    Maximize2,
    Building,
    HeartPulse,
    ExternalLink,
    Users,
    GraduationCap,
    BookOpen
} from "lucide-react";
import { API_BASE } from "@/config/api";

interface ReportePublico {
    id: string;
    fecha_registro: string;
    tipo_registro: string;
    evento_historico_referencia?: string;
    tipo_evento: string;
    ubigeo: string;
    distrito: string;
    provincia: string;
    departamento: string;
    lugar_referencial: string;
    coordenadas?: { lat: number; lng: number };
    nivel_afectacion: string;
    calle_inundada: boolean;
    estado_validacion: string;
    es_consenso_ciudadano: boolean;
    total_senales_cluster: number;
    aviso_seguridad: string;
}

interface ReporteMilitarC2 {
    id: string;
    fecha_registro: string;
    tipo_registro: string;
    evento_historico_referencia?: string;
    tipo_evento: string;
    ubigeo: string;
    distrito: string;
    provincia: string;
    departamento: string;
    lugar_especifico: string;
    coordenadas: { lat: number; lng: number };
    nivel_afectacion: string;
    calle_inundada: boolean;
    testimonio_restringido: string;
    evidencia_foto: {
        nombre_archivo: string;
        url_interna: string;
        hash_sha256: string;
        exif_metadata: {
            dispositivo: string;
            timestamp_captura: string;
            geotag_lat: number | null;
            geotag_lng: number | null;
            consistencia_gps: string;
        };
    };
    analisis_forense_ia: {
        score_autenticidad: number;
        veredicto: string;
        gemini_vision_audit: string;
        validacion_cruzada_cenepred: {
            cuenca: string;
            zona_riesgo_cenepred: string;
            distancia_a_punto_critico_m: number;
            declarado_ds124: boolean;
        };
        consenso_espacial: {
            total_reportes_cluster: number;
            radio_metros: number;
            nivel_consenso: string;
        };
    };
    estado_operativo: string;
    vista_publica: {
        mostrar_en_mapa: boolean;
        tipo_pin: string;
        nivel_resumen: string;
        etiqueta_publica: string;
    };
}

interface EstadisticasCiudadanas {
    total_reportes: number;
    validados_operaciones_c2: number;
    bloqueados_blindaje_anti_fake: number;
    en_evaluacion_forense: number;
    memoria_historica: number;
    en_vivo_fen_2026: number;
    clusters_consenso_espacial: number;
    tasa_proteccion_anti_fake: number;
    normativa_aplicable: string;
}

interface TransmisionVivo {
    id: string;
    titulo: string;
    tipo_fuente: string;
    plataforma: string;
    ubigeo: string;
    distrito: string;
    departamento: string;
    operador: string;
    estado_verificacion: string;
    latencia_segundos: number;
    espectadores_sala: number;
    alerta_activa: string;
    url_simulada: string;
}

export default function ReporteCiudadanoPage() {
    // Pestaña activa
    const [activeTab, setActiveTab] = useState<"formulario" | "senales" | "doctrina_live" | "radios_triage">("formulario");

    // Modo de vista en la pestaña de señales: Pública (Blindada) vs Militar C2 (Auditoría Forense)
    const [c2ViewMode, setC2ViewMode] = useState<"publica" | "militar_c2">("publica");

    // Estados de datos
    const [reportesPublicos, setReportesPublicos] = useState<ReportePublico[]>([]);
    const [reportesC2, setReportesC2] = useState<ReporteMilitarC2[]>([]);
    const [stats, setStats] = useState<EstadisticasCiudadanas | null>(null);
    const [transmisiones, setTransmisiones] = useState<TransmisionVivo[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    // Formulario de Reporte
    const [formTipoRegistro, setFormTipoRegistro] = useState<"EN_VIVO_2026_2027" | "MEMORIA_HISTORICA">("EN_VIVO_2026_2027");
    const [formEventoHistorico, setFormEventoHistorico] = useState<string>("FEN_2017");
    const [formUbigeo, setFormUbigeo] = useState<string>("150118");
    const [formLugar, setFormLugar] = useState<string>("");
    const [formTipoEvento, setFormTipoEvento] = useState<string>("INUNDACION_PLUVIAL");
    const [formNivel, setFormNivel] = useState<string>("RODILLA_50CM");
    const [formTestimonio, setFormTestimonio] = useState<string>("");
    const [formFileSelected, setFormFileSelected] = useState<string | null>(null);
    const [formSubmitting, setFormSubmitting] = useState<boolean>(false);
    const [receiptModal, setReceiptModal] = useState<any | null>(null);

    // AMARU-DAMNIFICADOS (Pre-Padrón EDAN / Bono BAE S/ 500)
    const [esDamnificadoEdan, setEsDamnificadoEdan] = useState<boolean>(false);
    const [edanIdioma, setEdanIdioma] = useState<IdiomaCodigo>("es");
    const [edanRequiereBilingue, setEdanRequiereBilingue] = useState<boolean>(false);
    const [audioGrabadoBase64, setAudioGrabadoBase64] = useState<string | null>(null);
    const [audioSha256, setAudioSha256] = useState<string | null>(null);

    const [edanDni, setEdanDni] = useState<string>("");
    const [edanNombres, setEdanNombres] = useState<string>("");
    const [edanApellidos, setEdanApellidos] = useState<string>("");
    const [edanTelefono, setEdanTelefono] = useState<string>("");
    const [edanCondicion, setEdanCondicion] = useState<string>("PROPIETARIO");
    const [edanMaterialMuros, setEdanMaterialMuros] = useState<string>("ADOBE_QUINCHA");
    const [edanMaterialTecho, setEdanMaterialTecho] = useState<string>("CALAMINA");
    const [edanEstadoVivienda, setEdanEstadoVivienda] = useState<string>("INHABITABLE");
    const [edanAguaEnCasa, setEdanAguaEnCasa] = useState<boolean>(true);
    const [edanTotalFam, setEdanTotalFam] = useState<number>(4);
    const [edanNinos5, setEdanNinos5] = useState<number>(0);
    const [edanAdultos65, setEdanAdultos65] = useState<number>(0);
    const [edanDiscapacidad, setEdanDiscapacidad] = useState<number>(0);
    const [edanGestantes, setEdanGestantes] = useState<number>(0);
    const [damnReceiptModal, setDamnReceiptModal] = useState<any | null>(null);

    // Diccionario i18n reactivo para el pre-padrón
    const tEdan = DICCIONARIO_EDAN[edanIdioma] || DICCIONARIO_EDAN.es;

    // Filtros de listado
    const [filtroTipo, setFiltroTipo] = useState<string>("TODOS");
    const [searchUbigeo, setSearchUbigeo] = useState<string>("");

    // Cargar datos
    const fetchData = async () => {
        try {
            setLoading(true);
            const [resPub, resC2, resStats, resLive] = await Promise.all([
                fetch(`${API_BASE}/api/ciudadano/reportes?vista=publica`).then(r => r.json()).catch(() => []),
                fetch(`${API_BASE}/api/ciudadano/reportes?vista=militar_c2`).then(r => r.json()).catch(() => []),
                fetch(`${API_BASE}/api/ciudadano/estadisticas`).then(r => r.json()).catch(() => null),
                fetch(`${API_BASE}/api/ciudadano/transmisiones-en-vivo`).then(r => r.json()).catch(() => [])
            ]);
            setReportesPublicos(resPub);
            setReportesC2(resC2);
            setStats(resStats);
            setTransmisiones(resLive);
        } catch (e) {
            console.error("Error cargando telemetría de reporte ciudadano:", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Enviar Reporte
    const handleSubmitReport = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formLugar.trim() || !formTestimonio.trim()) {
            alert("Por favor complete el lugar específico y la descripción del evento.");
            return;
        }

        if (esDamnificadoEdan) {
            if (!edanDni.trim() || edanDni.trim().length !== 8 || !/^\d+$/.test(edanDni.trim())) {
                alert("Para el Pre-Padrón de Damnificados (Ficha EDAN), debe ingresar un DNI válido de 8 dígitos.");
                return;
            }
            if (!edanNombres.trim() || !edanApellidos.trim() || !edanTelefono.trim()) {
                alert("Por favor complete nombres, apellidos y teléfono del Jefe de Hogar.");
                return;
            }
        }

        setFormSubmitting(true);
        try {
            // Mapeo dinámico de centroides según UBIGEO
            const mapaCentroides: Record<string, { lat: number; lng: number }> = {
                "200105": { lat: -5.265, lng: -80.678 },  // Catacaos
                "140301": { lat: -6.512, lng: -79.856 },  // Íllimo
                "130101": { lat: -8.112, lng: -79.018 },  // Trujillo
                "150118": { lat: -11.938, lng: -76.702 }, // Lurigancho Chosica
                "240101": { lat: -3.566, lng: -80.451 },  // Tumbes
                "210404": { lat: -16.230, lng: -69.660 }  // Mazocruz
            };
            const coordsBase = mapaCentroides[formUbigeo] || { lat: -11.938, lng: -76.702 };

            // Si marcó Pre-Padrón EDAN / Bono BAE, registrar primero en el servicio desacoplado
            if (esDamnificadoEdan) {
                const edanPayload = {
                    dni_jefe_hogar: edanDni.trim(),
                    nombres: edanNombres.trim(),
                    apellidos: edanApellidos.trim(),
                    telefono: edanTelefono.trim(),
                    ubigeo: formUbigeo,
                    direccion_exacta: formLugar.trim(),
                    referencia_catastral: "Reporte Georreferenciado COED Social",
                    lat: coordsBase.lat,
                    lng: coordsBase.lng,
                    condicion_tenencia: edanCondicion,
                    material_muros: edanMaterialMuros,
                    material_techo: edanMaterialTecho,
                    tirante_agua: formNivel,
                    agua_dentro_vivienda: edanAguaEnCasa,
                    estado_vivienda_declarado: edanEstadoVivienda,
                    total_integrantes: Number(edanTotalFam) || 1,
                    ninos_menores_5: Number(edanNinos5) || 0,
                    adultos_mayores_65: Number(edanAdultos65) || 0,
                    personas_discapacidad: Number(edanDiscapacidad) || 0,
                    mujeres_gestantes: Number(edanGestantes) || 0,
                    servicios_afectados: ["AGUA_POTABLE", "DESAGUE"],
                    relato_danos: formTestimonio.trim(),
                    foto_evidencia_url: formFileSelected ? `/uploads/${formFileSelected}` : "/img/edan/sample_flood_house.jpg",
                    
                    // Metadatos Etnolingüísticos RENALIO & Testimonio de Voz
                    lengua_materna: edanIdioma,
                    variante_renalio: IDIOMAS_SOPORTADOS[edanIdioma]?.variante || "CASTELLANO",
                    requiere_asistencia_bilingue: edanRequiereBilingue,
                    audio_testimonio_sha256: audioSha256,
                    tiene_audio_adjunto: Boolean(audioSha256)
                };

                const resDamn = await fetch(`${API_BASE}/api/v1/damnificados/registrar`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(edanPayload)
                });

                if (resDamn.ok) {
                    const damnData = await resDamn.json();
                    setDamnReceiptModal(damnData);
                } else {
                    const errData = await resDamn.json();
                    alert(`Error en Pre-Padrón EDAN: ${errData.error || "No se pudo registrar"}`);
                }
            }

            const payload = {
                tipo_registro: "EN_VIVO_2026_2027",
                evento_historico_referencia: "FEN_2026_2027_LIVE",
                tipo_evento: formTipoEvento,
                ubigeo: formUbigeo,
                lugar_especifico: formLugar,
                lat: coordsBase.lat,
                lng: coordsBase.lng,
                nivel_afectacion: formNivel,
                calle_inundada: true,
                testimonio: formTestimonio,
                nombre_archivo: formFileSelected || "evidencia_vecinal_camara.jpg",
                foto_preview_url: "/img/forensic/default_report.jpg",
                dispositivo_exif: "Terminal Móvil Ciudadano (Geotag Automático Activo)"
            };

            const res = await fetch(`${API_BASE}/api/ciudadano/reportar`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            const data = await res.json();
            if (!esDamnificadoEdan) {
                setReceiptModal(data);
            }
            // Limpiar campos principales
            setFormLugar("");
            setFormTestimonio("");
            setFormFileSelected(null);
            // Refrescar feeds
            fetchData();
        } catch (err) {
            alert("Error al enviar el reporte. Verifique la conexión con el servidor COED.");
        } finally {
            setFormSubmitting(false);
        }
    };

    const distritosFrecuentes = [
        { ubigeo: "150118", nombre: "Lurigancho Chosica (Lima)", cuenca: "Río Rímac / Quebrada Carossio" },
        { ubigeo: "200105", nombre: "Catacaos (Piura)", cuenca: "Río Piura / Viduque" },
        { ubigeo: "140301", nombre: "Íllimo (Lambayeque)", cuenca: "Río La Leche / Motupe" },
        { ubigeo: "130101", nombre: "Trujillo (La Libertad)", cuenca: "Quebrada San Ildefonso / Moche" },
        { ubigeo: "240101", nombre: "Tumbes (Tumbes)", cuenca: "Río Tumbes / Puerto Pizarro" },
        { ubigeo: "210404", nombre: "Santa Rosa de Mazocruz (Puno)", cuenca: "Altiplano / Heladas Amaru" }
    ];

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
            {/* ENCABEZADO TÁCTICO */}
            <div className="bg-slate-900 border-b border-slate-800 px-4 py-4 shadow-lg">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-black bg-rose-500 text-white uppercase tracking-wider shadow-md shadow-rose-500/20">
                                NIVEL 3 • COED SOCIAL
                            </span>
                            <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-950 text-rose-300 border border-rose-700/60">
                                ANILLO 2 PATENTE: BLINDAJE CRIPTOGRÁFICO EN BORDE (ZERO-CLOUD PII)
                            </span>
                            <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono">
                                WEB AUDIO API EN RAM • SHA-256 LOCAL
                            </span>
                        </div>
                        <h1 className="text-xl md:text-2xl font-black tracking-tight text-white flex items-center gap-2">
                            COED SOCIAL AMARU • Sensor Humano y Resiliencia Comunitaria
                        </h1>
                        <p className="text-xs text-slate-300 max-w-3xl leading-relaxed mt-0.5">
                            Adquisición tripartita (Hábitat, Salud y Pecuario). El audio oral se procesa en memoria volátil sin subir voz a la nube comercial (Ley N° 29733 y Decisión 486).
                        </p>

                        {/* DOCK SOCIAL DE HERRAMIENTAS INTEGRADAS */}
                        <div className="flex items-center gap-2 mt-2.5 flex-wrap text-[11px]">
                            <Link href="/ayni" className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-rose-300 hover:border-rose-500 transition">
                                <Users className="w-3.5 h-3.5" />
                                <span>AMARU-AYNI</span>
                            </Link>
                            <Link href="/salud/triaje" className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-rose-300 hover:border-rose-500 transition">
                                <HeartPulse className="w-3.5 h-3.5" />
                                <span>Triaje Salud FEN</span>
                            </Link>
                            <Link href="/yachay" className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-emerald-300 hover:border-emerald-500 transition">
                                <GraduationCap className="w-3.5 h-3.5" />
                                <span>AMARU-YACHAY</span>
                            </Link>
                            <Link href="/glosario" className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-sky-300 hover:border-sky-500 transition">
                                <BookOpen className="w-3.5 h-3.5" />
                                <span>Glosario 5 Lenguas</span>
                            </Link>
                            <Link href="/municipal/200101" className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-950/60 border border-amber-700/60 text-amber-300 hover:border-amber-400 transition font-bold">
                                <span>&larr; Retorno a COED Municipal</span>
                            </Link>
                        </div>
                    </div>

                    {/* Botones de Navegación de Pestañas */}
                    <div className="flex items-center gap-1.5 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
                        <button
                            onClick={() => setActiveTab("formulario")}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                                activeTab === "formulario"
                                    ? "bg-amber-600 text-white shadow-md shadow-amber-600/30"
                                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
                            }`}
                        >
                            <Send className="w-3.5 h-3.5" />
                            <span>1. Reportar Evento</span>
                        </button>
                        <button
                            onClick={() => setActiveTab("senales")}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                                activeTab === "senales"
                                    ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
                            }`}
                        >
                            <Radio className="w-3.5 h-3.5" />
                            <span>2. Matriz de Señales &amp; C2</span>
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        </button>
                        <button
                            onClick={() => setActiveTab("doctrina_live")}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                                activeTab === "doctrina_live"
                                    ? "bg-purple-600 text-white shadow-md shadow-purple-600/30"
                                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
                            }`}
                        >
                            <Tv className="w-3.5 h-3.5 text-purple-300" />
                            <span>3. Transmisiones en Vivo &amp; Doctrina</span>
                        </button>
                        <button
                            onClick={() => setActiveTab("radios_triage")}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                                activeTab === "radios_triage"
                                    ? "bg-rose-600 text-white shadow-md shadow-rose-600/30"
                                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
                            }`}
                        >
                            <LifeBuoy className="w-3.5 h-3.5 text-rose-300 animate-pulse" />
                            <span>4. Radios Rurales &amp; Triaje NLP</span>
                        </button>
                    </div>
                </div>

                {/* BANNER DE MÉTRICAS TÁCTICAS */}
                {stats && (
                    <div className="max-w-7xl mx-auto mt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-xs">
                        <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-2.5 flex flex-col">
                            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Total Señales</span>
                            <span className="text-lg font-extrabold text-white mt-0.5">{stats.total_reportes}</span>
                            <span className="text-[10px] text-slate-500">Registros en memoria</span>
                        </div>
                        <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-2.5 flex flex-col">
                            <span className="text-[10px] text-emerald-400 uppercase tracking-wider font-semibold">Validados C2</span>
                            <span className="text-lg font-extrabold text-emerald-400 mt-0.5">{stats.validados_operaciones_c2}</span>
                            <span className="text-[10px] text-emerald-500/80">Confirmados COED Nacional</span>
                        </div>
                        <div className="bg-slate-950/80 border border-rose-900/40 rounded-lg p-2.5 flex flex-col">
                            <span className="text-[10px] text-rose-400 uppercase tracking-wider font-semibold">Fake News Bloqueadas</span>
                            <span className="text-lg font-extrabold text-rose-400 mt-0.5">{stats.bloqueados_blindaje_anti_fake}</span>
                            <span className="text-[10px] text-rose-500/80">Desinformación neutralizada</span>
                        </div>
                        <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-2.5 flex flex-col">
                            <span className="text-[10px] text-cyan-400 uppercase tracking-wider font-semibold">Consenso Espacial</span>
                            <span className="text-lg font-extrabold text-cyan-400 mt-0.5">{stats.clusters_consenso_espacial}</span>
                            <span className="text-[10px] text-cyan-500/80">Clusters multivecinales</span>
                        </div>
                        <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-2.5 flex flex-col">
                            <span className="text-[10px] text-amber-400 uppercase tracking-wider font-semibold">Memoria Histórica</span>
                            <span className="text-lg font-extrabold text-amber-300 mt-0.5">{stats.memoria_historica}</span>
                            <span className="text-[10px] text-amber-500/80">1998 / 2017 / Yaku 2023</span>
                        </div>
                        <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-2.5 flex flex-col">
                            <span className="text-[10px] text-indigo-400 uppercase tracking-wider font-semibold">Tasa Blindaje</span>
                            <span className="text-lg font-extrabold text-indigo-300 mt-0.5">{stats.tasa_proteccion_anti_fake}%</span>
                            <span className="text-[10px] text-indigo-500/80">Filtrado estricto</span>
                        </div>
                    </div>
                )}
            </div>

            {/* CONTENIDO PRINCIPAL SEGÚN PESTAÑA */}
            <div className="max-w-7xl mx-auto w-full p-4 flex-1">
                {/* ========================================================= */}
                {/* PESTAÑA 1: FORMULARIO DE REPORTE CIUDADANO               */}
                {/* ========================================================= */}
                {activeTab === "formulario" && (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        {/* Columna Izquierda: Formulario Táctico */}
                        <div className="lg:col-span-8 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
                            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
                                <div>
                                    <h2 className="text-base font-bold text-white flex items-center gap-2">
                                        <Camera className="w-5 h-5 text-amber-400" />
                                        Registro de Evento Territorial o Memoria de Desastre
                                    </h2>
                                    <p className="text-xs text-slate-400 mt-0.5">
                                        Llene este formulario con precisión para alimentar el Gemelo Digital Territorial Soberano.
                                    </p>
                                </div>
                                <span className="px-2.5 py-1 rounded bg-amber-500/10 text-amber-300 text-[11px] font-semibold border border-amber-500/30">
                                    Canal Criptográfico Seguro
                                </span>
                            </div>

                            {/* BANNER OFICIAL DE BLINDAJE ANTI-PÁNICO Y PRIVACIDAD */}
                            <div className="bg-gradient-to-r from-amber-950/50 via-slate-900 to-amber-950/40 border border-amber-600/50 rounded-xl p-4 mb-6 text-xs text-amber-200 flex items-start gap-3 shadow-inner">
                                <div className="p-2 rounded-lg bg-amber-500/20 text-amber-300 shrink-0 mt-0.5 border border-amber-500/30">
                                    <ShieldAlert className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-amber-300 text-sm mb-1 flex items-center gap-2">
                                        🛡️ GARANTÍA DE PRIVACIDAD CIUDADANA Y BLINDAJE ANTI-DESINFORMACIÓN
                                    </h3>
                                    <p className="leading-relaxed text-amber-200/90">
                                        En cumplimiento del <strong>Protocolo Nacional de Manejo de Información en Crisis del COED Nacional</strong> y la
                                        <strong> Ley N° 29733</strong>, las fotografías, videos y testimonios que usted adjunte
                                        <strong> NUNCA SERÁN EXPUESTOS NI PUBLICADOS EN REDES SOCIALES NI EN INTERNET</strong>.
                                    </p>
                                    <p className="mt-1.5 text-[11px] text-amber-300/80 font-mono">
                                        ✓ En el visor público solo se generará un <strong>pin discreto y anónimo</strong> tras la validación de los equipos técnicos.<br />
                                        ✓ Su evidencia visual se reserva bajo custodia confidencial para peritaje de Inteligencia Forense, evitando pánico o virales manipulados.
                                    </p>
                                </div>
                            </div>

                            {/* BANNER TRIPARTITO DOCTRINAL: TRÍADA DE PROTECCIÓN CIUDADANA EN BORDE (CUP-DAMN, CUP-MINSA & CUP-AGRO) */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
                                {/* 1. CUP-DAMN */}
                                <div className="bg-slate-950/90 border-2 border-emerald-500/70 rounded-xl p-3 shadow-md flex items-start gap-2.5">
                                    <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 shrink-0 mt-0.5 border border-emerald-500/30">
                                        <Building className="w-4 h-4" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between">
                                            <h4 className="font-bold text-xs text-emerald-300 uppercase tracking-wide">
                                                🏠 Hábitat & Vivienda
                                            </h4>
                                            <span className="text-[9px] bg-emerald-950 text-emerald-300 border border-emerald-700 px-1 py-0.2 rounded font-mono font-bold">
                                                CUP-DAMN
                                            </span>
                                        </div>
                                        <p className="text-[10px] text-slate-300 mt-1 leading-snug">
                                            Pérdida de techo, colapso de muros y solicitud del <strong>Bono BAE (S/ 500)</strong> para Ficha EDAN 2B.
                                        </p>
                                    </div>
                                </div>

                                {/* 2. CUP-MINSA */}
                                <div className="bg-slate-950/90 border border-rose-600/70 hover:border-rose-400 rounded-xl p-3 shadow-md flex items-start gap-2.5 transition group">
                                    <div className="p-2 rounded-lg bg-rose-500/20 text-rose-400 shrink-0 mt-0.5 border border-rose-500/30">
                                        <HeartPulse className="w-4 h-4" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between">
                                            <h4 className="font-bold text-xs text-rose-300 uppercase tracking-wide">
                                                🚑 Urgencia Médica
                                            </h4>
                                            <Link
                                                href="/salud/triaje"
                                                className="text-[9px] font-bold text-white bg-rose-600 hover:bg-rose-500 px-1.5 py-0.5 rounded transition flex items-center gap-0.5 shadow"
                                            >
                                                <span>Triaje</span>
                                                <ExternalLink className="w-2.5 h-2.5" />
                                            </Link>
                                        </div>
                                        <p className="text-[10px] text-slate-300 mt-1 leading-snug">
                                            Triaje vital desacoplado NTS-105 y prioridad asistencial SAMU / camas hospitalarias (<code>CUP-MINSA</code>).
                                        </p>
                                    </div>
                                </div>

                                {/* 3. CUP-AGRO */}
                                <div className="bg-slate-950/90 border border-amber-600/70 hover:border-amber-400 rounded-xl p-3 shadow-md flex items-start gap-2.5 transition group">
                                    <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400 shrink-0 mt-0.5 border border-amber-500/30">
                                        <Compass className="w-4 h-4" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between flex-wrap gap-1">
                                            <h4 className="font-bold text-xs text-amber-300 uppercase tracking-wide flex items-center gap-1.5">
                                                <span>🦙 Ganado & Cultivos</span>
                                                <span className="text-[9px] bg-amber-950 text-amber-300 border border-amber-700 px-1 py-0.2 rounded font-mono font-bold">
                                                    CUP-AGRO
                                                </span>
                                            </h4>
                                            <div className="flex items-center gap-1">
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setFormTipoEvento("HELADA_MORTANDAD_GANADO");
                                                        const el = document.getElementById("select-tipo-fenomeno");
                                                        if (el) {
                                                            el.scrollIntoView({ behavior: 'smooth' });
                                                            el.focus();
                                                        }
                                                    }}
                                                    className="text-[9px] font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 px-1.5 py-0.5 rounded transition flex items-center gap-0.5 shadow cursor-pointer"
                                                >
                                                    <span>Reportar Daño</span>
                                                </button>
                                                <Link
                                                    href="/edan"
                                                    className="text-[9px] font-bold text-amber-300 bg-amber-950/90 hover:bg-amber-900 border border-amber-700/80 px-1.5 py-0.5 rounded transition flex items-center gap-0.5"
                                                >
                                                    <span>Ficha SAC</span>
                                                    <ExternalLink className="w-2.5 h-2.5" />
                                                </Link>
                                            </div>
                                        </div>
                                        <p className="text-[10px] text-slate-300 mt-1 leading-snug">
                                            Mortandad alpaquera/ovina por heladas y cultivos anegados para indemnización SAC / MIDAGRI.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <form onSubmit={handleSubmitReport} className="space-y-5">
                                {/* 1. Régimen Operativo del Formulario: Exclusivamente Tiempo Real */}
                                <div>
                                    <label className="block text-xs font-semibold text-slate-300 mb-2 uppercase tracking-wider">
                                        1. Régimen Operativo del Formulario:
                                    </label>
                                    <div className="p-3.5 rounded-xl border bg-blue-950/40 border-blue-500/50 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 rounded-lg bg-blue-600 text-white shrink-0">
                                                <Radio className="w-4 h-4 animate-pulse" />
                                            </div>
                                            <div>
                                                <div className="font-bold text-xs text-white flex items-center gap-2">
                                                    <span>Tiempo Real: Afectación en Curso FEN 2026 - 2027</span>
                                                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-1.5 py-0.5 rounded font-mono font-bold">EN VIVO</span>
                                                </div>
                                                <div className="text-[11px] text-slate-300 mt-0.5">
                                                    Reporte ciudadano directo para empadronamiento digital de vivienda, daños de infraestructura y BAE S/ 500.
                                                </div>
                                            </div>
                                        </div>
                                        <div className="hidden sm:block text-right">
                                            <span className="text-[10px] font-mono text-blue-300 bg-blue-900/50 px-2 py-1 rounded border border-blue-700/50 font-bold">
                                                CUP-DAMN EN VIVO
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* 2. Distrito / UBIGEO */}
                                <div>
                                    <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                                        2. Distrito y Cuenca Afectada (UBIGEO):
                                    </label>
                                    <select
                                        value={formUbigeo}
                                        onChange={(e) => setFormUbigeo(e.target.value)}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                                    >
                                        {distritosFrecuentes.map((d) => (
                                            <option key={d.ubigeo} value={d.ubigeo}>
                                                [{d.ubigeo}] {d.nombre} — {d.cuenca}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* 3. Dirección o Lugar Específico */}
                                <div>
                                    <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                                        3. Calle, Esquina, Puente o Quebrada:
                                    </label>
                                    <div className="relative">
                                        <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                                        <input
                                            type="text"
                                            value={formLugar}
                                            onChange={(e) => setFormLugar(e.target.value)}
                                            placeholder="Ej: Jr. Comercio cdra 6 / Malecón Huaca de la Cruz / Quebrada Carossio"
                                            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                                            required
                                        />
                                    </div>
                                </div>

                                {/* 4. Tipo de Fenómeno y 5. Altura del Agua (Ergonómico Táctico) */}
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                                            4. Tipo de Fenómeno:
                                        </label>
                                        <select
                                            id="select-tipo-fenomeno"
                                            value={formTipoEvento}
                                            onChange={(e) => setFormTipoEvento(e.target.value)}
                                            className="w-full bg-slate-950 border border-amber-500/50 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400 font-medium"
                                        >
                                            <option value="INUNDACION_PLUVIAL">🌧️ Inundación Pluvial (Lluvia Urbana)</option>
                                            <option value="DESBORDE_RIO">🌊 Desborde de Río / Rotura de Dique</option>
                                            <option value="HUAICO_ALUVION">🏔️ Huaico / Flujo de Detritos</option>
                                            <option value="ACTIVACION_QUEBRADA">⚡ Activación de Quebrada Seca</option>
                                            <option value="HELADA_MORTANDAD_GANADO">🦙 Helada Extrema / Mortandad Alpaquera y Ovina (CUP-AGRO)</option>
                                            <option value="CULTIVOS_ANEGADOS_SAC">🌾 Cultivos Anegados / Pérdida Agrícola SAC (MIDAGRI)</option>
                                            <option value="COLAPSO_DRENAJE">🚰 Colapso de Drenaje / Alcantarillado</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-slate-300 mb-2 uppercase tracking-wider">
                                            5. Nivel de Agua o Lodo (Selección Rápida con 1 Toque):
                                        </label>
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-2">
                                            {[
                                                { id: "TOBILLO_15CM", icon: "🦶", label: "Tobillo", altura: "~15 cm", desc: "Anegamiento ligero", color: "border-cyan-500 bg-cyan-950/50 text-cyan-300" },
                                                { id: "RODILLA_50CM", icon: "🦵", label: "Rodilla", altura: "~50 cm", desc: "Tránsito detenido", color: "border-blue-500 bg-blue-950/50 text-blue-300" },
                                                { id: "CINTURA_100CM", icon: "🧍", label: "Cintura", altura: "~1.00 m", desc: "Ingreso a casas", color: "border-amber-500 bg-amber-950/50 text-amber-300" },
                                                { id: "TECHO_CATASTROFICO_200CM", icon: "🏠", label: "Techo", altura: ">2.00 m", desc: "Riesgo de vida", color: "border-rose-500 bg-rose-950/50 text-rose-300" }
                                            ].map((lvl) => {
                                                const isSelected = formNivel === lvl.id;
                                                return (
                                                    <button
                                                        key={lvl.id}
                                                        type="button"
                                                        onClick={() => setFormNivel(lvl.id)}
                                                        className={`p-2.5 rounded-xl border text-center transition flex flex-col items-center justify-center gap-1 cursor-pointer ${
                                                            isSelected
                                                                ? `${lvl.color} shadow-lg ring-2 ring-white/30 font-bold scale-[1.02]`
                                                                : "bg-slate-950/80 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-300"
                                                        }`}
                                                    >
                                                        <span className="text-2xl">{lvl.icon}</span>
                                                        <span className="text-xs font-bold text-white">{lvl.label}</span>
                                                        <span className="text-[10px] text-slate-400 font-mono">{lvl.altura}</span>
                                                        <span className="text-[9px] text-slate-400 leading-tight">{lvl.desc}</span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                        <select
                                            value={formNivel}
                                            onChange={(e) => setFormNivel(e.target.value)}
                                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-400 focus:outline-none focus:border-blue-500"
                                        >
                                            <option value="TOBILLO_15CM">🦶 Tobillo (~15 cm - Anegamiento ligero)</option>
                                            <option value="RODILLA_50CM">🦵 Rodilla (~50 cm - Dificulta vehículos)</option>
                                            <option value="CINTURA_100CM">🧍 Cintura (~1.00 m - Ingreso a viviendas)</option>
                                            <option value="TECHO_CATASTROFICO_200CM">🏠 Techo / Catastrófico (&gt;2.00 m - Riesgo vital)</option>
                                        </select>
                                    </div>
                                </div>

                                {/* 6. Adjuntar Fotografía o Evidencia (Con Simulación de Extracción EXIF) */}
                                <div>
                                    <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                                        6. Evidencia Fotográfica (Se resguarda bajo secreto técnico):
                                    </label>
                                    <div className="border-2 border-dashed border-slate-800 hover:border-slate-700 rounded-xl p-4 bg-slate-950/60 text-center transition flex flex-col items-center justify-center gap-2">
                                        <UploadCloud className="w-8 h-8 text-slate-500" />
                                        <div className="text-xs text-slate-300">
                                            {formFileSelected ? (
                                                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                                                    <CheckCircle2 className="w-4 h-4" /> Archivo seleccionado: {formFileSelected}
                                                </span>
                                            ) : (
                                                <span>Haga clic o arrastre la foto de su calle o zona afectada</span>
                                            )}
                                        </div>
                                        <div className="text-[10px] text-slate-500">
                                            Formatos JPG, PNG, MP4. El sistema extraerá metadatos EXIF y GPS para certificar autenticidad.
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setFormFileSelected(`captura_geotag_${Date.now().toString().slice(-4)}.jpg`)}
                                            className="mt-1 px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-200 border border-slate-700 transition"
                                        >
                                            Simular carga de foto con GPS integrado
                                        </button>
                                    </div>
                                </div>

                                {/* ========================================================= */}
                                {/* SECCIÓN AMARU-DAMNIFICADOS: PRE-PADRÓN EDAN & BONO BAE   */}
                                {/* Ley N.° 29664, Ley N.° 31526, D.S. N.° 008-2022-VIVIENDA */}
                                {/* Ley N.° 29735 (Lenguas Originarias) & RENALIO D.S. 009-2021 */}
                                {/* ========================================================= */}
                                <div className="p-4 rounded-xl border border-amber-500/40 bg-gradient-to-br from-amber-950/40 via-slate-900 to-amber-950/20 shadow-md space-y-3">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-500/20 pb-2.5">
                                        <label className="flex items-start gap-3 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={esDamnificadoEdan}
                                                onChange={(e) => setEsDamnificadoEdan(e.target.checked)}
                                                className="w-5 h-5 mt-0.5 rounded border-slate-700 text-amber-500 focus:ring-amber-500/30 accent-amber-500"
                                            />
                                            <div>
                                                <div className="text-xs font-bold text-amber-300 flex items-center gap-2">
                                                    <span>{tEdan.tituloSeccion}</span>
                                                    <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-[10px] text-amber-400 font-semibold border border-amber-500/40">
                                                        {tEdan.etiquetaBonoBae}
                                                    </span>
                                                </div>
                                                <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                                                    {tEdan.descripcionLey}
                                                </p>
                                            </div>
                                        </label>

                                        {/* Selector de Lengua Originaria RENALIO */}
                                        {esDamnificadoEdan && (
                                            <div className="flex items-center gap-1 bg-slate-950/90 p-1.5 rounded-xl border border-amber-500/30 self-start sm:self-center shrink-0">
                                                {(Object.keys(IDIOMAS_SOPORTADOS) as IdiomaCodigo[]).map((cod) => {
                                                    const info = IDIOMAS_SOPORTADOS[cod];
                                                    const isSelected = edanIdioma === cod;
                                                    return (
                                                        <button
                                                            key={cod}
                                                            type="button"
                                                            onClick={() => setEdanIdioma(cod)}
                                                            title={`${info.nombre} (${info.regionPredominante})`}
                                                            className={`px-2 py-1 rounded-lg text-[10px] font-bold transition flex items-center gap-1 cursor-pointer ${
                                                                isSelected
                                                                    ? "bg-amber-600 text-white shadow-sm"
                                                                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
                                                            }`}
                                                        >
                                                            <span>{info.banderaIcono}</span>
                                                            <span>{info.nombreNativo.split(" ")[0]}</span>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>

                                    {esDamnificadoEdan && (
                                        <div className="space-y-4 animate-fadeIn">
                                            {/* Datos del Jefe de Hogar */}
                                            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                                                <div>
                                                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                                                        {tEdan.dniLabel}
                                                    </label>
                                                    <input
                                                        type="text"
                                                        maxLength={8}
                                                        value={edanDni}
                                                        onChange={(e) => setEdanDni(e.target.value.replace(/\D/g, ""))}
                                                        placeholder={tEdan.dniPlaceholder}
                                                        className="w-full bg-slate-950 border border-amber-500/40 rounded-lg px-3 py-2 text-xs text-white font-mono placeholder-slate-500 focus:outline-none focus:border-amber-400"
                                                        required={esDamnificadoEdan}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                                                        {tEdan.nombresLabel}
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={edanNombres}
                                                        onChange={(e) => setEdanNombres(e.target.value)}
                                                        placeholder={tEdan.nombresPlaceholder}
                                                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                                                        required={esDamnificadoEdan}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                                                        {tEdan.apellidosLabel}
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={edanApellidos}
                                                        onChange={(e) => setEdanApellidos(e.target.value)}
                                                        placeholder={tEdan.apellidosPlaceholder}
                                                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                                                        required={esDamnificadoEdan}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                                                        {tEdan.telefonoLabel}
                                                    </label>
                                                    <input
                                                        type="tel"
                                                        value={edanTelefono}
                                                        onChange={(e) => setEdanTelefono(e.target.value)}
                                                        placeholder={tEdan.telefonoPlaceholder}
                                                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white font-mono placeholder-slate-500 focus:outline-none focus:border-amber-400"
                                                        required={esDamnificadoEdan}
                                                    />
                                                </div>
                                            </div>

                                            {/* Preferencia de Lengua Originaria & Solicitud de Evaluador Bilingüe */}
                                            <div className="p-2.5 rounded-lg bg-slate-950/80 border border-amber-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                                <div className="text-[11px] text-slate-300">
                                                    <span className="text-amber-400 font-bold block">
                                                        🌐 {tEdan.lenguaMaternaLabel}:
                                                    </span>
                                                    <span className="text-slate-400">
                                                        {IDIOMAS_SOPORTADOS[edanIdioma].nombreNativo} ({IDIOMAS_SOPORTADOS[edanIdioma].variante})
                                                    </span>
                                                </div>
                                                <label className="flex items-center gap-2 cursor-pointer text-[11px] text-amber-200">
                                                    <input
                                                        type="checkbox"
                                                        checked={edanRequiereBilingue}
                                                        onChange={(e) => setEdanRequiereBilingue(e.target.checked)}
                                                        className="w-4 h-4 rounded text-amber-500 accent-amber-500"
                                                    />
                                                    <span>{tEdan.requiereAsistenciaBilingueLabel}</span>
                                                </label>
                                            </div>

                                            {/* Características de la Vivienda */}
                                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                                <div>
                                                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                                                        {tEdan.materialMurosLabel}
                                                    </label>
                                                    <select
                                                        value={edanMaterialMuros}
                                                        onChange={(e) => setEdanMaterialMuros(e.target.value)}
                                                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                                                    >
                                                        <option value="ADOBE_QUINCHA">{tEdan.opcionMurosAdobe}</option>
                                                        <option value="LADRILLO_CONCRETO">{tEdan.opcionMurosLadrillo}</option>
                                                        <option value="MADERA_TRIPLAY">{tEdan.opcionMurosMadera}</option>
                                                        <option value="ESTERA_PLASTICO">{tEdan.opcionMurosEstera}</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                                                        {tEdan.materialTechoLabel}
                                                    </label>
                                                    <select
                                                        value={edanMaterialTecho}
                                                        onChange={(e) => setEdanMaterialTecho(e.target.value)}
                                                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                                                    >
                                                        <option value="CALAMINA">{tEdan.opcionTechoCalamina}</option>
                                                        <option value="CONCRETO_ARMADO">{tEdan.opcionTechoConcreto}</option>
                                                        <option value="ESTERAS_PLASTICO">{tEdan.opcionTechoEsteras}</option>
                                                        <option value="TEJAS">{tEdan.opcionTechoTejas}</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                                                        {tEdan.estadoDanoLabel}
                                                    </label>
                                                    <select
                                                        value={edanEstadoVivienda}
                                                        onChange={(e) => setEdanEstadoVivienda(e.target.value)}
                                                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                                                    >
                                                        <option value="INHABITABLE">{tEdan.opcionDanoInhabitable}</option>
                                                        <option value="COLAPSADA_DESTRUIDA">{tEdan.opcionDanoColapsada}</option>
                                                        <option value="AFECTADA">{tEdan.opcionDanoAfectada}</option>
                                                    </select>
                                                </div>
                                            </div>

                                            {/* Composición Familiar y Vulnerabilidad */}
                                            <div>
                                                <label className="block text-[11px] font-semibold text-slate-300 mb-1.5">
                                                    {tEdan.composicionFamiliarLabel}
                                                </label>
                                                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                                                    <div className="p-2 bg-slate-950 rounded-lg border border-slate-800 text-center">
                                                        <span className="text-[10px] text-slate-400 block">{tEdan.totalMiembros}</span>
                                                        <input
                                                            type="number"
                                                            min={1}
                                                            max={25}
                                                            value={edanTotalFam}
                                                            onChange={(e) => setEdanTotalFam(Math.max(1, parseInt(e.target.value) || 1))}
                                                            className="w-full bg-transparent text-center font-bold text-sm text-white focus:outline-none"
                                                        />
                                                    </div>
                                                    <div className="p-2 bg-slate-950 rounded-lg border border-slate-800 text-center">
                                                        <span className="text-[10px] text-cyan-400 block">{tEdan.ninos5}</span>
                                                        <input
                                                            type="number"
                                                            min={0}
                                                            max={15}
                                                            value={edanNinos5}
                                                            onChange={(e) => setEdanNinos5(Math.max(0, parseInt(e.target.value) || 0))}
                                                            className="w-full bg-transparent text-center font-bold text-sm text-cyan-300 focus:outline-none"
                                                        />
                                                    </div>
                                                    <div className="p-2 bg-slate-950 rounded-lg border border-slate-800 text-center">
                                                        <span className="text-[10px] text-amber-400 block">{tEdan.adultos65}</span>
                                                        <input
                                                            type="number"
                                                            min={0}
                                                            max={10}
                                                            value={edanAdultos65}
                                                            onChange={(e) => setEdanAdultos65(Math.max(0, parseInt(e.target.value) || 0))}
                                                            className="w-full bg-transparent text-center font-bold text-sm text-amber-300 focus:outline-none"
                                                        />
                                                    </div>
                                                    <div className="p-2 bg-slate-950 rounded-lg border border-slate-800 text-center">
                                                        <span className="text-[10px] text-rose-400 block">{tEdan.gestantes}</span>
                                                        <input
                                                            type="number"
                                                            min={0}
                                                            max={5}
                                                            value={edanGestantes}
                                                            onChange={(e) => setEdanGestantes(Math.max(0, parseInt(e.target.value) || 0))}
                                                            className="w-full bg-transparent text-center font-bold text-sm text-rose-300 focus:outline-none"
                                                        />
                                                    </div>
                                                    <div className="p-2 bg-slate-950 rounded-lg border border-slate-800 text-center">
                                                        <span className="text-[10px] text-purple-400 block">{tEdan.discapacidad}</span>
                                                        <input
                                                            type="number"
                                                            min={0}
                                                            max={10}
                                                            value={edanDiscapacidad}
                                                            onChange={(e) => setEdanDiscapacidad(Math.max(0, parseInt(e.target.value) || 0))}
                                                            className="w-full bg-transparent text-center font-bold text-sm text-purple-300 focus:outline-none"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* 7. Testimonio Detallado & Entrada Oral por Voz */}
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                                            7. {esDamnificadoEdan ? tEdan.descripcionTestimonioLabel : "Descripción de lo ocurrido:"}
                                        </label>
                                    </div>

                                    {/* Componente de Audio Soberano (Voz) */}
                                    {esDamnificadoEdan && (
                                        <VoiceStoryRecorder
                                            traduccion={tEdan}
                                            onAudioCaptured={(blob, base64, hash) => {
                                                setAudioGrabadoBase64(base64);
                                                setAudioSha256(hash);
                                            }}
                                            disabled={formSubmitting}
                                        />
                                    )}

                                    <textarea
                                        rows={3}
                                        value={formTestimonio}
                                        onChange={(e) => setFormTestimonio(e.target.value)}
                                        placeholder={esDamnificadoEdan ? tEdan.testimonioPlaceholder : "Describa cómo subió el agua, qué quebrada se activó o qué daños sufrieron las viviendas..."}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 leading-relaxed"
                                        required
                                    />
                                </div>

                                {/* Botón de Envío */}
                                <div className="pt-2">
                                    <button
                                        type="submit"
                                        disabled={formSubmitting}
                                        className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white font-bold text-sm shadow-lg shadow-amber-600/30 transition flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                                    >
                                        {formSubmitting ? (
                                            <>
                                                <RefreshCw className="w-4 h-4 animate-spin" />
                                                <span>Cifrando y Ejecutando Peritaje Forense IA...</span>
                                            </>
                                        ) : (
                                            <>
                                                <Lock className="w-4 h-4" />
                                                <span>Enviar Reporte Bajo Custodia Segura COED-AMARU</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>

                        {/* Columna Derecha: Panel de Explicación de Doctrina & Ciberseguridad */}
                        <div className="lg:col-span-4 space-y-4">
                            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg">
                                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2 mb-3">
                                    <Activity className="w-4 h-4 text-cyan-400" />
                                    ¿Cómo funciona el Blindaje Anti-Fake?
                                </h3>
                                <div className="space-y-3 text-xs text-slate-300">
                                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                                        <div className="font-bold text-blue-400 mb-0.5 flex items-center gap-1.5">
                                            <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                                            1. Aislamiento Inmediato
                                        </div>
                                        <p className="text-[11px] text-slate-400 leading-relaxed">
                                            Ninguna foto se publica en feeds abiertos. Se corta de raíz la posibilidad de que una imagen falsa se viralice.
                                        </p>
                                    </div>

                                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                                        <div className="font-bold text-purple-400 mb-0.5 flex items-center gap-1.5">
                                            <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                                            2. Peritaje Forense Gemini Vision
                                        </div>
                                        <p className="text-[11px] text-slate-400 leading-relaxed">
                                            La IA analiza metadatos EXIF, iluminación, tipo de lodo y busca coincidencias con fotos de catástrofes antiguas o de otros países.
                                        </p>
                                    </div>

                                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                                        <div className="font-bold text-emerald-400 mb-0.5 flex items-center gap-1.5">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                            3. Consenso Espacial (≥ 3 Vecinos)
                                        </div>
                                        <p className="text-[11px] text-slate-400 leading-relaxed">
                                            Un reporte aislado en una quebrada no altera el semáforo oficial. Se requieren reportes cruzados en un radio de 600m para confirmar la alerta.
                                        </p>
                                    </div>

                                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                                        <div className="font-bold text-amber-400 mb-0.5 flex items-center gap-1.5">
                                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                                            4. Proyección de Señal Discreta
                                        </div>
                                        <p className="text-[11px] text-slate-400 leading-relaxed">
                                            Una vez validado, el público solo ve un punto táctico de afectación (ej. rodilla 50cm). La calma se preserva; la verdad operativa se defiende.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Enlace Directo al Geovisor */}
                            <div className="bg-gradient-to-br from-slate-900 to-blue-950/40 border border-blue-900/50 rounded-2xl p-5">
                                <h4 className="font-bold text-xs text-white flex items-center gap-2 mb-2">
                                    <Compass className="w-4 h-4 text-sky-400" />
                                    Cruce con Geovisor Táctico C2
                                </h4>
                                <p className="text-xs text-slate-300 leading-relaxed mb-4">
                                    Los reportes validados se integran con las 46 Quebradas Críticas de CENEPRED, los 893 distritos en D.S. 124 y las boyas del DHN.
                                </p>
                                <Link
                                    href="/geovisor"
                                    className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs transition shadow-md shadow-sky-600/30"
                                >
                                    <span>Abrir Geovisor Nacional de Quebradas</span>
                                    <Maximize2 className="w-3.5 h-3.5" />
                                </Link>
                            </div>
                        </div>
                    </div>
                )}

                {/* ========================================================= */}
                {/* PESTAÑA 2: MATRIZ DE SEÑALES & COMPARADOR FORENSE C2     */}
                {/* ========================================================= */}
                {activeTab === "senales" && (
                    <div className="space-y-6">
                        {/* SELECTOR MAESTRO DE VISTA: PÚBLICA vs MILITAR C2 */}
                        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-xl">
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
                                        Nivel de Visualización Operativa:
                                    </span>
                                    {c2ViewMode === "publica" ? (
                                        <span className="px-2 py-0.5 text-[11px] font-bold rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                                            <EyeOff className="w-3 h-3" /> VISTA CIUDADANA PÚBLICA (BLINDADA)
                                        </span>
                                    ) : (
                                        <span className="px-2 py-0.5 text-[11px] font-bold rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1 animate-pulse">
                                            <Eye className="w-3 h-3" /> SALA DE CRISIS C2 (INTELIGENCIA MILITAR)
                                        </span>
                                    )}
                                </div>
                                <p className="text-xs text-slate-400 mt-1">
                                    {c2ViewMode === "publica"
                                        ? "Demostración de lo que la población ve: puntos discretos y nivel de afectación. CERO fotos y CERO pánico."
                                        : "Acceso reservado a operadores COED Nacional: peritaje IA Gemini Vision, fotos forenses completas, EXIF y consenso espacial."}
                                </p>
                            </div>

                            {/* Conmutador de Rol */}
                            <div className="flex items-center gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800">
                                <button
                                    onClick={() => setC2ViewMode("publica")}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                                        c2ViewMode === "publica"
                                            ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30"
                                            : "text-slate-400 hover:text-slate-200"
                                    }`}
                                >
                                    <EyeOff className="w-3.5 h-3.5" />
                                    <span>Vista Pública</span>
                                </button>
                                <button
                                    onClick={() => setC2ViewMode("militar_c2")}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                                        c2ViewMode === "militar_c2"
                                            ? "bg-rose-700 text-white shadow-md shadow-rose-700/30 font-bold"
                                            : "text-rose-400/80 hover:text-rose-300 hover:bg-slate-900"
                                    }`}
                                >
                                    <Lock className="w-3.5 h-3.5" />
                                    <span>Consola Militar C2</span>
                                </button>
                            </div>
                        </div>

                        {/* LISTADO DE REPORTES EN MODO VISTA PÚBLICA */}
                        {c2ViewMode === "publica" && (
                            <div className="space-y-4">
                                <div className="bg-emerald-950/30 border border-emerald-600/30 rounded-xl p-3 text-xs text-emerald-200 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                                        <span>
                                            Mostrando únicamente <strong>{reportesPublicos.length} señales geográficas verificadas</strong>.
                                            Las evidencias audiovisuales están resguardadas en servidores seguros del Estado.
                                        </span>
                                    </div>
                                    <span className="text-[10px] text-emerald-400 font-mono">ENCRIPTACIÓN SHA-256 ACTIVA</span>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {reportesPublicos.map((rep) => (
                                        <div
                                            key={rep.id}
                                            className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl p-4 flex flex-col justify-between shadow-lg transition"
                                        >
                                            <div>
                                                <div className="flex items-center justify-between gap-2 mb-2">
                                                    <span className="font-mono font-bold text-xs text-blue-400">{rep.id}</span>
                                                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                                                        {rep.tipo_registro === "EN_VIVO_2026_2027" ? "FEN 2026-2027" : "MEMORIA HISTÓRICA"}
                                                    </span>
                                                </div>

                                                <h4 className="text-sm font-bold text-white mb-1">
                                                    {rep.distrito} ({rep.departamento})
                                                </h4>
                                                <p className="text-xs text-slate-300 flex items-center gap-1.5 mb-2">
                                                    <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                                                    <span>{rep.lugar_referencial}</span>
                                                </p>

                                                <div className="flex flex-wrap gap-1.5 my-2">
                                                    <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] text-slate-300 font-medium">
                                                        {rep.tipo_evento.replace("_", " ")}
                                                    </span>
                                                    <span className="px-2 py-0.5 rounded bg-amber-500/20 text-[10px] text-amber-300 font-bold border border-amber-500/30">
                                                        Nivel: {rep.nivel_afectacion.replace("_", " ")}
                                                    </span>
                                                    {rep.es_consenso_ciudadano && (
                                                        <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-[10px] text-cyan-300 font-bold border border-cyan-500/30 flex items-center gap-1">
                                                            <CheckCircle2 className="w-3 h-3" /> Consenso ({rep.total_senales_cluster} reportes)
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="mt-3 pt-3 border-t border-slate-800/80 text-[10px] text-slate-400 flex items-center justify-between">
                                                <span>Reg: {new Date(rep.fecha_registro).toLocaleDateString("es-PE")}</span>
                                                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                                                    <CheckCircle2 className="w-3 h-3" /> Señal Calibrada
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* LISTADO DE REPORTES EN MODO MILITAR C2 (INTELIGENCIA Y AUDITORÍA FORENSE) */}
                        {c2ViewMode === "militar_c2" && (
                            <div className="space-y-4">
                                <div className="bg-rose-950/40 border border-rose-600/50 rounded-xl p-3 text-xs text-rose-200 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Lock className="w-4 h-4 text-rose-400" />
                                        <span>
                                            <strong>CANAL RESTRINGIDO COED NACIONAL / FF.AA.:</strong> Inspección forense de fotografías,
                                            metadatos EXIF, triangulación CENEPRED y detección de noticias falsas.
                                        </span>
                                    </div>
                                    <span className="text-[10px] bg-rose-900/60 px-2 py-0.5 rounded text-rose-200 font-mono">
                                        NIVEL CLASIFICADO CSCG
                                    </span>
                                </div>

                                <div className="space-y-4">
                                    {reportesC2.map((rep) => {
                                        const esFake = rep.estado_operativo === "RECHAZADO_POR_FRAUDE";
                                        const score = rep.analisis_forense_ia.score_autenticidad;

                                        return (
                                            <div
                                                key={rep.id}
                                                className={`rounded-2xl border p-5 transition shadow-xl ${
                                                    esFake
                                                        ? "bg-rose-950/20 border-rose-800/70"
                                                        : "bg-slate-900/90 border-slate-800 hover:border-slate-700"
                                                }`}
                                            >
                                                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                                                    {/* Columna Izquierda: Simulación de Evidencia Visual & Metadatos */}
                                                    <div className="lg:col-span-4 flex flex-col justify-between">
                                                        <div>
                                                            <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-slate-950 h-44 flex items-center justify-center group">
                                                                {/* Representación Gráfica Táctica */}
                                                                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent z-10" />
                                                                <div className="text-center p-4 z-20">
                                                                    <Camera className={`w-8 h-8 mx-auto mb-1 ${esFake ? "text-rose-500" : "text-amber-400"}`} />
                                                                    <div className="text-xs font-mono font-bold text-white">{rep.evidencia_foto.nombre_archivo}</div>
                                                                    <div className="text-[10px] text-slate-400 mt-1 font-mono break-all">
                                                                        SHA-256: {rep.evidencia_foto.hash_sha256.slice(0, 16)}...
                                                                    </div>
                                                                </div>

                                                                {/* Badge de Detección Forense */}
                                                                <div className="absolute top-2 right-2 z-20">
                                                                    {esFake ? (
                                                                        <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-rose-600 text-white shadow-lg flex items-center gap-1">
                                                                            <XCircle className="w-3 h-3" /> FAKE NEWS DETECTADO
                                                                        </span>
                                                                    ) : (
                                                                        <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-emerald-600 text-white shadow-lg flex items-center gap-1">
                                                                            <CheckCircle2 className="w-3 h-3" /> AUTÉNTICO ({score}%)
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>

                                                            {/* Ficha EXIF */}
                                                            <div className="mt-2.5 p-2.5 bg-slate-950 rounded-xl border border-slate-800 text-[11px] font-mono text-slate-400 space-y-1">
                                                                <div className="flex justify-between">
                                                                    <span>Dispositivo:</span>
                                                                    <span className="text-slate-200">{rep.evidencia_foto.exif_metadata.dispositivo}</span>
                                                                </div>
                                                                <div className="flex justify-between">
                                                                    <span>Timestamp:</span>
                                                                    <span className="text-slate-200">{rep.evidencia_foto.exif_metadata.timestamp_captura}</span>
                                                                </div>
                                                                <div className="flex justify-between">
                                                                    <span>Validación GPS:</span>
                                                                    <span className={esFake ? "text-rose-400 font-bold" : "text-emerald-400 font-bold"}>
                                                                        {rep.evidencia_foto.exif_metadata.consistencia_gps}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Columna Derecha: Diagnóstico de Inteligencia Gemini Vision y Cruzamiento */}
                                                    <div className="lg:col-span-8 flex flex-col justify-between space-y-3">
                                                        <div>
                                                            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                                                                <div className="flex items-center gap-2">
                                                                    <span className="font-mono font-bold text-sm text-amber-400">{rep.id}</span>
                                                                    <span className="text-base font-bold text-white">
                                                                        {rep.distrito} — {rep.provincia} ({rep.departamento})
                                                                    </span>
                                                                </div>
                                                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                                                                    esFake
                                                                        ? "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                                                                        : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                                                                }`}>
                                                                    {rep.estado_operativo}
                                                                </span>
                                                            </div>

                                                            <div className="text-xs text-slate-300 mb-2">
                                                                <strong>Lugar:</strong> {rep.lugar_especifico} | <strong>Tipo:</strong> {rep.tipo_evento} | <strong>Afectación:</strong> {rep.nivel_afectacion}
                                                            </div>

                                                            {/* Testimonio Restringido */}
                                                            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-300 italic mb-3">
                                                                <span className="text-slate-500 not-italic font-bold block mb-1">Testimonio Confidencial del Informante:</span>
                                                                &ldquo;{rep.testimonio_restringido}&rdquo;
                                                            </div>

                                                            {/* Dictamen Pericial IA Gemini Vision */}
                                                            <div className={`p-3 rounded-xl border text-xs leading-relaxed ${
                                                                esFake
                                                                    ? "bg-rose-950/30 border-rose-700/50 text-rose-200"
                                                                    : "bg-blue-950/30 border-blue-700/50 text-blue-200"
                                                            }`}>
                                                                <div className="flex items-center gap-2 font-bold mb-1">
                                                                    <Sparkles className="w-4 h-4" />
                                                                    <span>Peritaje Forense de IA (Gemini Vision Multimodal):</span>
                                                                </div>
                                                                <p>{rep.analisis_forense_ia.gemini_vision_audit}</p>
                                                            </div>

                                                            {/* Cruzamiento Territorial CENEPRED & Consenso */}
                                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3 text-xs">
                                                                <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800">
                                                                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Validación CENEPRED</span>
                                                                    <div className="font-bold text-slate-200 mt-0.5">
                                                                        Cuenca: {rep.analisis_forense_ia.validacion_cruzada_cenepred.cuenca}
                                                                    </div>
                                                                    <div className="text-[11px] text-amber-400">
                                                                        Distancia a punto crítico: {rep.analisis_forense_ia.validacion_cruzada_cenepred.distancia_a_punto_critico_m}m
                                                                    </div>
                                                                </div>

                                                                <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800">
                                                                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Consenso Espacial Comunitario</span>
                                                                    <div className="font-bold text-slate-200 mt-0.5">
                                                                        Cluster: {rep.analisis_forense_ia.consenso_espacial.total_reportes_cluster} reportes independientes
                                                                    </div>
                                                                    <div className="text-[11px] text-cyan-400">
                                                                        Estado: {rep.analisis_forense_ia.consenso_espacial.nivel_consenso}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Acciones del Operador Militar C2 */}
                                                        <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2">
                                                            <span className="text-[11px] text-slate-400">
                                                                Protocolo: {esFake ? "Material retenido por cuarentena informativa" : "Aprobado para despacho táctico INDECI"}
                                                            </span>
                                                            <div className="flex items-center gap-2">
                                                                {esFake ? (
                                                                    <button
                                                                        onClick={() => alert("El reporte ya se encuentra descartado y bloqueado del visor público.")}
                                                                        className="px-3 py-1.5 rounded-lg bg-rose-600/30 text-rose-300 border border-rose-500/40 text-xs font-semibold"
                                                                    >
                                                                        Descartado por Fraude
                                                                    </button>
                                                                ) : (
                                                                    <button
                                                                        onClick={() => alert(`Despacho táctico notificado para ${rep.distrito}. Brigada INDECI alertada.`)}
                                                                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md transition cursor-pointer"
                                                                    >
                                                                        Despachar Alerta a Sala de Crisis
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* ========================================================= */}
                {/* PESTAÑA 3: TRANSMISIONES EN VIVO (TIKTOK / YOUTUBE) & DOCTRINA */}
                {/* ========================================================= */}
                {activeTab === "doctrina_live" && (
                    <div className="space-y-6">
                        {/* RESPUESTA A LA PREGUNTA DEL USUARIO: ¿CÓMO MANEJAR TRANSMISIONES DIRECTAS / TIKTOK / YOUTUBE? */}
                        <div className="bg-gradient-to-r from-purple-950/60 via-slate-900 to-indigo-950/60 border border-purple-600/50 rounded-2xl p-6 shadow-xl">
                            <div className="flex items-start gap-4">
                                <div className="p-3 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30 shrink-0">
                                    <Tv className="w-6 h-6" />
                                </div>
                                <div>
                                    <h2 className="text-base font-bold text-white flex items-center gap-2">
                                        Doctrina C2 de Transmisión Directa: YouTubers, TikTokers y Corresponsales en Zona
                                    </h2>
                                    <p className="text-xs text-purple-200/90 mt-1 leading-relaxed">
                                        ¿Cómo se maneja una transmisión en directo desde el lugar de los hechos sin caer en desinformación o generar pánico descontrolado?
                                    </p>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4 text-xs">
                                        <div className="p-3 bg-slate-950/80 rounded-xl border border-purple-500/30">
                                            <div className="font-bold text-purple-300 mb-1 flex items-center gap-1.5">
                                                <span className="w-2 h-2 rounded-full bg-purple-400" />
                                                1. Sandbox de Cuarentena
                                            </div>
                                            <p className="text-[11px] text-slate-400">
                                                El enlace de streaming ingresa a un monitor interno de la Sala de Crisis del COED Nacional. <strong>NO se retransmite directamente al público general</strong>.
                                            </p>
                                        </div>

                                        <div className="p-3 bg-slate-950/80 rounded-xl border border-purple-500/30">
                                            <div className="font-bold text-sky-300 mb-1 flex items-center gap-1.5">
                                                <span className="w-2 h-2 rounded-full bg-sky-400" />
                                                2. Triangulación con Aforos ANA
                                            </div>
                                            <p className="text-[11px] text-slate-400">
                                                Si el streamer grita &ldquo;se desbordó el río&rdquo;, el operador del COED Nacional verifica inmediatamente la estación hidrológica oficial de aforo para confirmar o descartar el caudal.
                                            </p>
                                        </div>

                                        <div className="p-3 bg-slate-950/80 rounded-xl border border-purple-500/30">
                                            <div className="font-bold text-emerald-300 mb-1 flex items-center gap-1.5">
                                                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                                                3. Sello de Corresponsal Acreditado
                                            </div>
                                            <p className="text-[11px] text-slate-400">
                                                Los comunicadores locales que demuestren veracidad sostenida obtienen un canal cifrado oficial con prioridad de despacho de ayuda humanitaria.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* PANTALLA DE DIRECTOS EN MONITOREO TÁCTICO */}
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                                    <Video className="w-4 h-4 text-emerald-400" />
                                    Feeds de Transmisión Terrestre y Aérea en Vigilancia Activa
                                </h3>
                                <span className="text-xs text-slate-400">
                                    3 Canales en Cuarentena de Supervisión
                                </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                {transmisiones.map((stream) => (
                                    <div
                                        key={stream.id}
                                        className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg flex flex-col justify-between"
                                    >
                                        <div>
                                            {/* Visor de Video / Player Simulado */}
                                            <div className="bg-slate-950 relative h-48 flex items-center justify-center border-b border-slate-800">
                                                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/60 to-transparent" />
                                                <div className="text-center p-4 z-10">
                                                    <div className="w-12 h-12 rounded-full bg-red-600/20 text-red-500 border border-red-500/40 flex items-center justify-center mx-auto mb-2 animate-pulse">
                                                        <Radio className="w-6 h-6" />
                                                    </div>
                                                    <span className="text-xs font-mono font-bold text-white">{stream.plataforma}</span>
                                                    <div className="text-[10px] text-slate-400 mt-0.5">Latencia: {stream.latencia_segundos}s • Sala: {stream.espectadores_sala} ops</div>
                                                </div>

                                                <div className="absolute top-3 left-3 z-20 flex items-center gap-1.5 px-2 py-0.5 rounded bg-red-600 text-white text-[10px] font-extrabold uppercase">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                                                    EN VIVO
                                                </div>

                                                <div className="absolute top-3 right-3 z-20 px-2 py-0.5 rounded bg-slate-900/90 text-[10px] font-mono text-emerald-300 border border-emerald-500/40">
                                                    {stream.estado_verificacion}
                                                </div>
                                            </div>

                                            {/* Ficha Informativa del Stream */}
                                            <div className="p-4 space-y-2">
                                                <h4 className="font-bold text-xs text-white leading-snug">
                                                    {stream.titulo}
                                                </h4>
                                                <div className="text-[11px] text-slate-300 flex items-center gap-1">
                                                    <MapPin className="w-3 h-3 text-amber-400" />
                                                    <span>{stream.distrito} ({stream.departamento})</span>
                                                </div>
                                                <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 text-[11px] text-slate-400">
                                                    <span className="text-slate-500 block font-semibold text-[10px]">Operador / Canal:</span>
                                                    <span className="text-slate-200 font-medium">{stream.operador}</span>
                                                    <div className="text-emerald-400 font-medium mt-1 text-[10px]">
                                                        {stream.alerta_activa}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="p-4 pt-0">
                                            <button
                                                onClick={() => alert(`Canal ${stream.id} ampliado en monitor principal de Sala de Crisis.`)}
                                                className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition border border-slate-700 flex items-center justify-center gap-1.5 cursor-pointer"
                                            >
                                                <Maximize2 className="w-3.5 h-3.5" />
                                                <span>Auditar Transmisión en Monitor C2</span>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* MATRIZ DOCTRINARIA COMPARATIVA */}
                        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl">
                            <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                                <ShieldCheck className="w-4 h-4 text-amber-400" />
                                Matriz Comparativa: Redes Sociales vs Gemelo Digital Soberano COED Nacional
                            </h3>
                            <div className="overflow-x-auto">
                                <table className="w-full text-xs text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-slate-800 text-slate-400 font-semibold bg-slate-950/60">
                                            <th className="py-2.5 px-3">Criterio de Información</th>
                                            <th className="py-2.5 px-3 text-rose-400">Redes Sociales Abiertas (TikTok / X / WhatsApp)</th>
                                            <th className="py-2.5 px-3 text-emerald-400">Consola Soberana de Reporte COED Nacional</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-800/60 text-slate-300">
                                        <tr>
                                            <td className="py-3 px-3 font-semibold">Exposición de Imágenes</td>
                                            <td className="py-3 px-3 text-rose-300/90">Viralización indiscriminada, videos reciclados de otros años o países.</td>
                                            <td className="py-3 px-3 text-emerald-300/90 font-medium">Fotos protegidas bajo secreto técnico. Se publica solo un pin discreto.</td>
                                        </tr>
                                        <tr>
                                            <td className="py-3 px-3 font-semibold">Impacto Psicológico</td>
                                            <td className="py-3 px-3 text-rose-300/90">Genera histeria masiva, desabastecimiento de alimentos y pánico.</td>
                                            <td className="py-3 px-3 text-emerald-300/90 font-medium">Preserva la serenidad pública mientras orienta la logística del Estado.</td>
                                        </tr>
                                        <tr>
                                            <td className="py-3 px-3 font-semibold">Validación Cruzada</td>
                                            <td className="py-3 px-3 text-rose-300/90">Cero validación; algoritmos premian el sensacionalismo morboso.</td>
                                            <td className="py-3 px-3 text-emerald-300/90 font-medium">Cruce con CENEPRED, D.S. 124, aforos ANA y estaciones SENAMHI.</td>
                                        </tr>
                                        <tr>
                                            <td className="py-3 px-3 font-semibold">Filtro de Autenticidad</td>
                                            <td className="py-3 px-3 text-rose-300/90">Inexistente o reactivo tras horas de desinformación.</td>
                                            <td className="py-3 px-3 text-emerald-300/90 font-medium">Análisis multimodal Gemini Vision en tiempo real con examen EXIF.</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* ========================================================= */}
                {/* PESTAÑA 4: RADIOS RURALES EN VIVO Y TRIAJE NLP             */}
                {/* ========================================================= */}
                {activeTab === "radios_triage" && (
                    <RadiosAndTriagePanel />
                )}
            </div>

            {/* MODAL DE CONSTANCIA DE REPORTE RECIBIDO (BLINDAJE SEGURO) */}
            {receiptModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                                <CheckCircle2 className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-white">
                                    Reporte Recibido y Cifrado con Éxito
                                </h3>
                                <p className="text-xs text-slate-400 font-mono">
                                    Código: <span className="text-amber-400 font-bold">{receiptModal.reporte_id}</span>
                                </p>
                            </div>
                        </div>

                        <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-300 space-y-2">
                            <div className="flex justify-between">
                                <span className="text-slate-500">Hash SHA-256 de Custodia:</span>
                                <span className="text-slate-300 font-mono">{receiptModal.hash_sha256?.slice(0, 20)}...</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500">Score de Autenticidad:</span>
                                <span className="text-emerald-400 font-bold">{receiptModal.score_autenticidad}%</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500">Consenso Espacial:</span>
                                <span className="text-cyan-400 font-bold">{receiptModal.consenso_cluster} reportes en la zona</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500">Estado Operativo:</span>
                                <span className="text-blue-400 font-bold">{receiptModal.estado_validacion}</span>
                            </div>
                        </div>

                        <p className="text-xs text-amber-200/90 bg-amber-950/40 p-3 rounded-xl border border-amber-500/30 leading-relaxed">
                            {receiptModal.mensaje_al_ciudadano}
                        </p>

                        <div className="flex flex-wrap justify-end gap-2 pt-2">
                            <button
                                onClick={() => {
                                    const text = encodeURIComponent(
                                        `🚨 *ALERTA COED SOCIAL AMARU* 🚨\n` +
                                        `Se registró un reporte ciudadano verificado:\n` +
                                        `📍 Lugar: ${receiptModal.lugar_especifico || formLugar || 'Zona de Emergencia'}\n` +
                                        `🌊 Nivel de agua: ${formNivel}\n` +
                                        `🛡️ Estado C2: ${receiptModal.estado_validacion}\n` +
                                        `📋 Código de Custodia: ${receiptModal.reporte_id}\n` +
                                        `_Enviado a través de COED-AMARU_`
                                    );
                                    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
                                }}
                                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shadow-md shadow-emerald-600/30"
                            >
                                <Share2 className="w-3.5 h-3.5" />
                                <span>Compartir Alerta Vecinal WhatsApp</span>
                            </button>
                            <button
                                onClick={() => {
                                    setReceiptModal(null);
                                    setActiveTab("senales");
                                }}
                                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition cursor-pointer"
                            >
                                Ver Señal en la Matriz Táctica
                            </button>
                            <button
                                onClick={() => setReceiptModal(null)}
                                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition cursor-pointer"
                            >
                                Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL DE CONSTANCIA OFICIAL: PRE-PADRÓN EDAN & BONO BAE (AMARU-DAMNIFICADOS) */}
            {damnReceiptModal && (
                <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
                    <div className="bg-slate-900 border border-amber-500/50 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4 animate-scaleUp">
                        <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
                            <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                                <ShieldCheck className="w-7 h-7" />
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-base font-bold text-white">
                                        {tEdan.comprobanteTitulo}
                                    </h3>
                                    <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-500/30">
                                        {IDIOMAS_SOPORTADOS[edanIdioma]?.banderaIcono} {IDIOMAS_SOPORTADOS[edanIdioma]?.nombreNativo}
                                    </span>
                                </div>
                                <p className="text-xs text-slate-400">
                                    {tEdan.comprobanteSubtitulo}
                                </p>
                            </div>
                        </div>

                        {/* Código CUP-DAMN Destacado */}
                        <div className="p-3.5 bg-gradient-to-r from-amber-950/60 via-slate-950 to-amber-950/40 rounded-xl border border-amber-500/40 text-center">
                            <span className="text-[10px] text-amber-300 uppercase tracking-widest font-bold block mb-1">
                                {tEdan.cupLabel}
                            </span>
                            <span className="text-xl font-mono font-extrabold text-amber-400 tracking-wider">
                                {damnReceiptModal.cup}
                            </span>
                            <span className="text-[10px] text-slate-400 block mt-1">
                                {tEdan.cupLeyenda}
                            </span>
                        </div>

                        {/* Dictamen Preliminar IA & Motor Determinista IPAD Saaty AHP 4x4 */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                                <span className="text-[10px] text-slate-400 block uppercase font-semibold">
                                    {tEdan.preClasificacionLabel}
                                </span>
                                <span className="font-bold text-sm text-white mt-1 block">
                                    {damnReceiptModal.pre_clasificacion === "DAMNIFICADO_VIVIENDA_COLAPSADA" ? "🔴 " + tEdan.opcionDanoColapsada.split("(")[0] :
                                     damnReceiptModal.pre_clasificacion === "DAMNIFICADO_VIVIENDA_INHABITABLE" ? "🟠 " + tEdan.opcionDanoInhabitable.split("(")[0] :
                                     "🔵 " + tEdan.opcionDanoAfectada.split("(")[0]}
                                </span>
                                <div className="mt-1.5 flex items-center gap-1 text-[10px] font-mono text-cyan-400">
                                    <span>IPAD Saaty:</span>
                                    <strong>{damnReceiptModal.score_ipad || damnReceiptModal.score_consistencia} pts</strong>
                                    <span className="text-slate-500">(CR: 0.0115)</span>
                                </div>
                            </div>

                            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex flex-col justify-between">
                                <div>
                                    <span className="text-[10px] text-slate-400 block uppercase font-semibold">
                                        Semáforo Humanitario & SLA
                                    </span>
                                    <div className="mt-1 flex items-center gap-1.5">
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                            damnReceiptModal.semaforo_humanitario?.nivel_prioridad === "CRITICO_URGENTE"
                                                ? "bg-rose-950 text-rose-300 border border-rose-700 animate-pulse"
                                                : damnReceiptModal.semaforo_humanitario?.nivel_prioridad === "ALTO"
                                                ? "bg-amber-950 text-amber-300 border border-amber-700"
                                                : "bg-blue-950 text-blue-300 border border-blue-700"
                                        }`}>
                                            {damnReceiptModal.semaforo_humanitario?.nivel_prioridad || "PRIORIDAD ALTA"}
                                        </span>
                                        <span className="text-xs font-mono font-bold text-white">
                                            ≤ {damnReceiptModal.semaforo_humanitario?.plazo_sla_horas || 24} hrs
                                        </span>
                                    </div>
                                </div>
                                <span className="text-[10px] text-slate-400 mt-2 block">
                                    Despacho de auxilio municipal supervisado (HITL)
                                </span>
                            </div>
                        </div>

                        {/* Indicador de Audio Testimonio Oral Adjunto */}
                        {damnReceiptModal.tiene_audio_testimonio && (
                            <div className="p-2.5 rounded-lg bg-emerald-950/30 border border-emerald-500/40 flex items-center justify-between text-xs">
                                <span className="text-emerald-300 font-semibold flex items-center gap-1.5">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                    <span>🎤 Testimonio Oral Protegido en Bóveda Zero-PII</span>
                                </span>
                                {damnReceiptModal.audio_sha256 && (
                                    <span className="text-[9px] font-mono text-emerald-400/80 bg-slate-950 px-2 py-0.5 rounded border border-emerald-500/30">
                                        SHA-256: {damnReceiptModal.audio_sha256.slice(0, 12)}...
                                    </span>
                                )}
                            </div>
                        )}

                        {/* Elegibilidad Bono BAE */}
                        <div className={`p-3 rounded-xl border flex items-center gap-3 ${
                            damnReceiptModal.elegible_bono_bae
                                ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-200"
                                : "bg-slate-950 border-slate-800 text-slate-300"
                        }`}>
                            <div className="text-2xl">{damnReceiptModal.elegible_bono_bae ? "🏠" : "ℹ️"}</div>
                            <div className="text-xs">
                                <div className="font-bold">
                                    {damnReceiptModal.elegible_bono_bae
                                        ? tEdan.bonoBaeElegibleTitulo
                                        : tEdan.bonoBaeNoElegibleTitulo}
                                </div>
                                <div className="text-[11px] text-slate-400 mt-0.5">
                                    {damnReceiptModal.elegible_bono_bae
                                        ? tEdan.bonoBaeElegibleDesc
                                        : tEdan.bonoBaeNoElegibleDesc}
                                </div>
                            </div>
                        </div>

                        {/* Asistencia Humanitaria Inmediata */}
                        {damnReceiptModal.asistencia_humanitaria_sugerida?.length > 0 && (
                            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                                <span className="text-[10px] text-slate-400 uppercase font-semibold block mb-1.5">
                                    {tEdan.asistenciaHumanitariaTitulo}
                                </span>
                                <div className="flex flex-wrap gap-1.5">
                                    {damnReceiptModal.asistencia_humanitaria_sugerida.map((item: string, idx: number) => (
                                        <span key={idx} className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-700 text-[11px] text-amber-200 font-medium">
                                            ✓ {item}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Mensaje Ciudadano y Aviso de Soberanía */}
                        <div className="space-y-1.5 text-[11px] bg-slate-950 p-2.5 rounded-lg border border-slate-800 leading-relaxed text-slate-300">
                            <p className="font-semibold text-amber-300">
                                {damnReceiptModal.mensaje_ciudadano}
                            </p>
                            <p className="text-slate-400">
                                {damnReceiptModal.aviso_importante || tEdan.avisoDefensaCivil}
                            </p>
                        </div>

                        {/* Botones de Acción */}
                        <div className="flex flex-wrap justify-end gap-2 pt-2">
                            <button
                                onClick={() => {
                                    const langLabel = IDIOMAS_SOPORTADOS[edanIdioma]?.nombreNativo || 'Castellano';
                                    const text = encodeURIComponent(
                                        `📋 *${tEdan.comprobanteTitulo.toUpperCase()}*\n` +
                                        `🌐 Lengua / Simi: ${langLabel}\n` +
                                        `🔑 *CÓDIGO CUP-DAMN:* ${damnReceiptModal.cup}\n` +
                                        `🏷️ Condición: ${damnReceiptModal.pre_clasificacion}\n` +
                                        `🎯 Consistencia: ${damnReceiptModal.score_consistencia}%\n` +
                                        `🏠 Bono BAE (S/ 500): ${damnReceiptModal.elegible_bono_bae ? 'ELEGIBLE / LLALLIQ' : 'NO ELEGIBLE'}\n` +
                                        (damnReceiptModal.tiene_audio_testimonio ? `🎤 Audio Testimonio: ADJUNTO EN BÓVEDA ZERO-PII\n` : '') +
                                        `_AMARU COED Soberanía Territorial_`
                                    );
                                    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
                                }}
                                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shadow-md shadow-emerald-600/30"
                            >
                                <Share2 className="w-3.5 h-3.5" />
                                <span>{tEdan.compartirWhatsapp}</span>
                            </button>
                            <button
                                onClick={() => {
                                    const langLabel = IDIOMAS_SOPORTADOS[edanIdioma]?.nombreNativo || 'Castellano';
                                    const text = encodeURIComponent(
                                        `📋 *${tEdan.comprobanteTitulo.toUpperCase()}*\n` +
                                        `🌐 Lengua / Simi: ${langLabel}\n` +
                                        `🔑 *CÓDIGO CUP-DAMN:* ${damnReceiptModal.cup}\n` +
                                        `🏷️ Condición: ${damnReceiptModal.pre_clasificacion}\n` +
                                        `🎯 Consistencia: ${damnReceiptModal.score_consistencia}%\n` +
                                        `🏠 Bono BAE (S/ 500): ${damnReceiptModal.elegible_bono_bae ? 'ELEGIBLE / LLALLIQ' : 'NO ELEGIBLE'}\n` +
                                        (damnReceiptModal.tiene_audio_testimonio ? `🎤 Audio Testimonio: ADJUNTO EN BÓVEDA ZERO-PII\n` : '') +
                                        `_AMARU COED Soberanía Territorial_`
                                    );
                                    window.open(`https://t.me/share/url?url=${encodeURIComponent('https://amaru.gob.pe')}&text=${text}`, '_blank');
                                }}
                                className="px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shadow-md shadow-sky-600/30"
                            >
                                <Send className="w-3.5 h-3.5" />
                                <span>{tEdan.compartirTelegram}</span>
                            </button>
                            <button
                                onClick={() => {
                                    setDamnReceiptModal(null);
                                    setActiveTab("senales");
                                }}
                                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition cursor-pointer"
                            >
                                Ver en Matriz de Señales
                            </button>
                            <button
                                onClick={() => setDamnReceiptModal(null)}
                                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition cursor-pointer"
                            >
                                {tEdan.cerrarBoton}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
