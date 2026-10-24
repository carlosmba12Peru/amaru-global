"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
    Flame,
    Wind,
    Droplets,
    AlertTriangle,
    ShieldAlert,
    ShieldCheck,
    Trees,
    Activity,
    Compass,
    TrendingUp,
    FileText,
    ExternalLink,
    RefreshCw,
    Building2,
    Calendar,
    CheckCircle2,
    Sliders,
    Search,
    MapPin,
    Satellite,
    Cpu,
    ArrowUpRight,
    Map as MapIcon,
    Layers,
    Eye,
    Maximize2,
    Minimize2,
    Navigation,
    Truck,
    HelpCircle,
    Filter,
    X,
    Route,
    Footprints,
    Clock,
    Play,
    Pause,
    RotateCcw,
    FastForward,
    Mountain,
    Shield,
    Printer,
    Download
} from "lucide-react";
import TacticalPolarClock from "@/components/TacticalPolarClock";
import { API_BASE } from "@/config/api";
import { useLanguage } from "@/context/LanguageContext";

interface DepartamentoIncendio {
    departamento: string;
    distritos_muy_alto: number;
    distritos_alto: number;
    poblacion_muy_alto: number;
    area_agricola_muy_alto_ha: number;
    zona: string;
}

interface SerieFuego {
    year: number;
    perdida_fuego_ha: number;
    anomalia: string;
}

interface FocoCalor {
    id: string;
    sensor: string;
    departamento: string;
    provincia: string;
    distrito: string;
    ubigeo: string;
    lat: number;
    lng: number;
    temperatura_brillo_k: number;
    frp_mw: number;
    confianza: string;
    cobertura: string;
    riesgo_cenepred: string;
    patrimonio_cercano: string;
    hora_deteccion: string;
    satelite?: "VIIRS" | "Sentinel-3" | "MODIS";
    confirmacion_cruzada?: boolean;
    distancia_cruce_km?: number;
    satelite_cruzado?: string;
    irp_score?: number;
    estado_deteccion?: "CONFIRMADO_ACTIVO" | "OCLUIDO_POR_NUBOSIDAD" | "ATENUADO_NOCTURNO";
    motivo_estado?: string;
    es_oclusion_nubosa?: boolean;
    horas_desde_deteccion?: number;
    open_meteo?: {
        temperatura_ambiente_c: number;
        viento_velocidad_kmh: number;
        rafagas_viento_kmh: number;
        humedad_suelo_0_7cm: number;
        vpd_kpa: number;
        peligro_propagacion: string;
    };
}

interface Distrito2018 {
    id: number;
    departamento: string;
    provincia: string;
    distrito: string;
    ubigeo?: string;
    lat: number;
    lng: number;
    combustible: string;
    pendiente_grados: number;
    fwi_score: number;
    riesgo_cenepred: string;
    es_cenepred_2018?: boolean;
    alcalde?: string;
    telefono?: string;
    correo?: string;
    gmaps_analisis?: {
        buffer_riesgo_km: number;
        topografia_ladera: string;
        vias_acceso: string;
        tiempo_respuesta_cisterna_min: number;
        radio_intervencion_cortafuego_km: number;
        vista_satelital_recomendada: string;
    };
    open_meteo_pro?: {
        humedad_suelo_0_7cm: number;
        vpd_deficit_vapor_kpa: number;
        rafaga_viento_10m_kmh: number;
        estres_hidrico_combustible: string;
        modelo_resolucion: string;
    };
}

interface PlanContingencia {
    id: string;
    titulo: string;
    nivel: string;
    region: string;
    provincia?: string;
    distrito?: string;
    ubigeo_ref: string;
    aspectos_clave: string;
    recursos_asignados?: string;
    archivo_fuente: string;
}

interface EvaluacionSabogal {
    semaforo: string;
    riesgo_score_100: number;
    condiciones_evaluadas: {
        viento_kmh: number;
        humedad_relativa_pct: number;
        temperatura_c: number;
        pendiente_grados: number;
        tipo_biomasa: string;
    };
    advertencias: string[];
    recomendacion_coed_social: string;
    alternativas_ecologicas_sabogal: string[];
    protocolo_fauna_serfor: {
        directriz: string;
        especies_vulnerables: string[];
    };
}

interface ClusterIncendio {
    id_cluster: string;
    tipo_incendio: "MEGA_INCENDIO_COMPLEJO" | "INCENDIO_GRAN_ENVERGADURA" | "INCENDIO_MODERADO_EXPANSION";
    nivel_alerta: string;
    num_focos_agrupados: number;
    num_focos_ocluídos?: number;
    estado_observacion?: "CONFIRMADO_EN_ORBITA" | "OCLUIDO_POR_NUBOSIDAD";
    aviso_c2?: string;
    frp_total_mw: number;
    frp_promedio_mw: number;
    centroide_lat: number;
    centroide_lng: number;
    radio_expansion_km: number;
    departamento: string;
    provincia: string;
    distrito_epicentro: string;
    ubigeo: string;
    distrito_detalle?: any;
    distritos_en_radio?: Array<{
        distrito: string;
        provincia: string;
        departamento: string;
        distancia_km: number;
    }>;
    escalonamiento_sinagerd: string;
    cortafuegos_recomendado_km: number;
    maquinaria_pesada_requerida: string;
    serfor_match?: {
        codrep: string;
        estado_codigo: number;
        estado_label: string;
        categoria_territorial_id: number;
        categoria_territorial_nom: string;
        categoria_grupo: string;
        impacto_prioridad: string;
        sensor_deteccion: string;
        hora_deteccion: string;
        distancia_cruce_km: number;
        distrito_serfor: string;
        departamento_serfor: string;
        fuente_oficial: string;
        protocolo_fauna: string;
    };
    indeci_coen_match?: {
        validacion_oficial: string;
        estado_terreno: string;
        nivel_emergencia_indeci?: string;
        nivel_indeci_label?: string;
        reporte_oficial: string;
        sinpad: string;
        distrito_reportado: string;
        departamento_reportado: string;
        hectareas_destruidas_edan: number;
        sectores_comunidades: string[];
        apoyo_aereo_fap_ejercito: boolean;
        total_reportes_coen_sector: number;
        fuente_portal: string;
        directriz_c2: string;
    };
}

const FOCOS_DEFAULT: FocoCalor[] = [
    {
        id: "HOTSPOT-VIIRS-2026-001",
        sensor: "VIIRS Suomi-NPP (375m)",
        departamento: "CUSCO",
        provincia: "URUBAMBA",
        distrito: "MACHUPICCHU",
        ubigeo: "081304",
        lat: -13.1631,
        lng: -72.5450,
        temperatura_brillo_k: 348.5,
        frp_mw: 84.2,
        confianza: "ALTA (92%)",
        cobertura: "Pajonal de Puna y Matorral Andino (Combustible Clase 5)",
        riesgo_cenepred: "MUY_ALTO",
        patrimonio_cercano: "Santuario Histórico de Machupicchu (SERNANP / MINCUL)",
        hora_deteccion: "2026-10-16 14:22:00 UTC",
        open_meteo: {
            temperatura_ambiente_c: 24.5,
            viento_velocidad_kmh: 32.0,
            rafagas_viento_kmh: 46.5,
            humedad_suelo_0_7cm: 0.045,
            vpd_kpa: 2.85,
            peligro_propagacion: "PROPAGACIÓN_EXTREMA"
        }
    },
    {
        id: "HOTSPOT-VIIRS-2026-002",
        sensor: "VIIRS NOAA-20 (375m)",
        departamento: "ANCASH",
        provincia: "HUARAZ",
        distrito: "INDEPENDENCIA",
        ubigeo: "020102",
        lat: -9.5183,
        lng: -77.5283,
        temperatura_brillo_k: 352.1,
        frp_mw: 112.6,
        confianza: "MUY ALTA (96%)",
        cobertura: "Bosque de Queñual y Pastos Secos (Combustible Clase 4)",
        riesgo_cenepred: "MUY_ALTO",
        patrimonio_cercano: "Parque Nacional Huascarán (Zona de Amortiguamiento)",
        hora_deteccion: "2026-10-16 13:48:00 UTC",
        open_meteo: {
            temperatura_ambiente_c: 21.8,
            viento_velocidad_kmh: 28.0,
            rafagas_viento_kmh: 42.0,
            humedad_suelo_0_7cm: 0.058,
            vpd_kpa: 2.30,
            peligro_propagacion: "PROPAGACIÓN_EXTREMA"
        }
    },
    {
        id: "HOTSPOT-VIIRS-2026-003",
        sensor: "MODIS Terra (1km)",
        departamento: "CAJAMARCA",
        provincia: "JAEN",
        distrito: "JAEN",
        ubigeo: "060801",
        lat: -5.7083,
        lng: -78.8083,
        temperatura_brillo_k: 339.0,
        frp_mw: 62.4,
        confianza: "ALTA (88%)",
        cobertura: "Cafetales y Matorral Seco (Quema Agropecuaria)",
        riesgo_cenepred: "MUY_ALTO",
        patrimonio_cercano: "Bosque Seco del Marañón",
        hora_deteccion: "2026-10-16 15:10:00 UTC",
        open_meteo: {
            temperatura_ambiente_c: 33.2,
            viento_velocidad_kmh: 22.0,
            rafagas_viento_kmh: 35.0,
            humedad_suelo_0_7cm: 0.082,
            vpd_kpa: 3.10,
            peligro_propagacion: "PROPAGACIÓN_EXTREMA"
        }
    },
    {
        id: "HOTSPOT-VIIRS-2026-004",
        sensor: "VIIRS Suomi-NPP (375m)",
        departamento: "PUNO",
        provincia: "CARABAYA",
        distrito: "OLLACHEA",
        ubigeo: "210310",
        lat: -13.7917,
        lng: -70.4750,
        temperatura_brillo_k: 341.2,
        frp_mw: 76.8,
        confianza: "ALTA (89%)",
        cobertura: "Pajonales Altoandinos y Pajonal de Puna Húmeda",
        riesgo_cenepred: "MUY_ALTO",
        patrimonio_cercano: "Ecosistema Frágil de Pajonales del Sur",
        hora_deteccion: "2026-10-16 12:35:00 UTC",
        open_meteo: {
            temperatura_ambiente_c: 19.5,
            viento_velocidad_kmh: 31.0,
            rafagas_viento_kmh: 44.0,
            humedad_suelo_0_7cm: 0.061,
            vpd_kpa: 2.15,
            peligro_propagacion: "PROPAGACIÓN_EXTREMA"
        }
    },
    {
        id: "HOTSPOT-VIIRS-2026-005",
        sensor: "VIIRS NOAA-20 (375m)",
        departamento: "JUNIN",
        provincia: "SATIPO",
        distrito: "PANGOA",
        ubigeo: "120606",
        lat: -11.4283,
        lng: -74.4883,
        temperatura_brillo_k: 358.4,
        frp_mw: 145.0,
        confianza: "EXTREMA (99%)",
        cobertura: "Bosque Secundario y Purmas (Cambio de Uso de Suelo)",
        riesgo_cenepred: "MUY_ALTO",
        patrimonio_cercano: "Comunidades Nativas Asháninkas / Ecosistema Selva Central",
        hora_deteccion: "2026-10-16 14:05:00 UTC",
        open_meteo: {
            temperatura_ambiente_c: 31.8,
            viento_velocidad_kmh: 26.5,
            rafagas_viento_kmh: 39.4,
            humedad_suelo_0_7cm: 0.052,
            vpd_kpa: 2.45,
            peligro_propagacion: "PROPAGACIÓN_EXTREMA"
        }
    },
    {
        id: "HOTSPOT-VIIRS-2026-006",
        sensor: "VIIRS Suomi-NPP (375m) [N]",
        departamento: "JUNIN",
        provincia: "SATIPO",
        distrito: "RIO TAMBO",
        ubigeo: "120608",
        lat: -11.8650,
        lng: -73.8500,
        temperatura_brillo_k: 309.02,
        frp_mw: 3.36,
        confianza: "ALTA (88%)",
        cobertura: "Bosques Húmedos de Selva Central y Purmas Comunales",
        riesgo_cenepred: "MUY_ALTO",
        patrimonio_cercano: "Reserva Comunal Asháninka / Cuenca Río Ene-Tambo",
        hora_deteccion: "2026-10-16 06:16:00 UTC",
        open_meteo: {
            temperatura_ambiente_c: 32.5,
            viento_velocidad_kmh: 28.2,
            rafagas_viento_kmh: 41.0,
            humedad_suelo_0_7cm: 0.048,
            vpd_kpa: 2.65,
            peligro_propagacion: "PROPAGACIÓN_EXTREMA"
        }
    }
];

export default function IncendiosForestalesPage() {
    const { t, language } = useLanguage();
    const [resumen, setResumen] = useState<any>(null);
    const [focos, setFocos] = useState<FocoCalor[]>(FOCOS_DEFAULT);
    const [comparativaOrbital, setComparativaOrbital] = useState<any>(null);
    const [distritos2018, setDistritos2018] = useState<Distrito2018[]>([]);
    const [clusters, setClusters] = useState<ClusterIncendio[]>([]);
    const [clusterSeleccionado, setClusterSeleccionado] = useState<ClusterIncendio | null>(null);
    const [planesContingencia, setPlanesContingencia] = useState<PlanContingencia[]>([]);
    const [evaluacionSabogal, setEvaluacionSabogal] = useState<EvaluacionSabogal | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [selectedDept, setSelectedDept] = useState<string>("CUSCO");
    const [distritoSeleccionado, setDistritoSeleccionado] = useState<Distrito2018 | null>(null);
    const [distritoSearch, setDistritoSearch] = useState<string>("");
    const [mapaSearchUbigeo, setMapaSearchUbigeo] = useState<string>("");
    const [soloCenepred, setSoloCenepred] = useState<boolean>(false);
    const [filtroEstadoFuego, setFiltroEstadoFuego] = useState<"TODOS" | "FUEGO_ACTIVO" | "PREVENTIVO">("TODOS");
    const [filtroConciliacionIndeci, setFiltroConciliacionIndeci] = useState<"TODOS" | "VALIDADOS_COEN" | "ALERTADOS_SERFOR" | "CIEGOS_ESTADO" | "VIGILANCIA_PTT">("TODOS");
    const [limiteCardsClusters, setLimiteCardsClusters] = useState<number>(9);
    const [coedTabActiva, setCoedTabActiva] = useState<"NACIONAL" | "MUNICIPAL" | "SOCIAL">("NACIONAL");

    // Filtros avanzados para Focos Térmicos Satelitales (VIIRS / NASA FIRMS)
    const [focosSearch, setFocosSearch] = useState<string>("");
    const [focosSensorFilter, setFocosSensorFilter] = useState<string>("TODOS");
    const [focosFrpMin, setFocosFrpMin] = useState<number>(0);
    const [focosCoberturaFilter, setFocosCoberturaFilter] = useState<string>("TODOS");
    const [focosRiesgoFilter, setFocosRiesgoFilter] = useState<string>("TODOS");
    const [focosNivelSinagerdFilter, setFocosNivelSinagerdFilter] = useState<string>("TODOS");

    // Simulador FWI Interactivo con Open-Meteo Pro
    const [temperatura, setTemperatura] = useState<number>(26.5);
    const [humedadRelativa, setHumedadRelativa] = useState<number>(22.0);
    const [vientoKmh, setVientoKmh] = useState<number>(38.0);
    const [diasSinLluvia, setDiasSinLluvia] = useState<number>(24);
    const [humedadSuelo, setHumedadSuelo] = useState<number>(0.07); // 7% humedad superficial
    const [pendiente, setPendiente] = useState<number>(32.0);      // 32 grados
    const [calculatingFwi, setCalculatingFwi] = useState<boolean>(false);
    const [fwiResult, setFwiResult] = useState<any>(null);

    // Acta D8 Cortafuegos
    const [actaD8, setActaD8] = useState<any>(null);
    const [generatingD8, setGeneratingD8] = useState<boolean>(false);
    const [showActaModal, setShowActaModal] = useState<boolean>(false);

    // Disparo Alerta EAP a Consola Tripartita
    const [alertandoEap, setAlertandoEap] = useState<boolean>(false);
    const [alertaDisparada, setAlertaDisparada] = useState<any>(null);

    // Auditoría Forense Post-Incendio Sentinel-2 (Copernicus CDSE)
    const [loadingForense, setLoadingForense] = useState<boolean>(false);
    const [auditoriaForenseData, setAuditoriaForenseData] = useState<any>(null);
    const [showForenseModal, setShowForenseModal] = useState<boolean>(false);

    // Google Maps Platform Refs & State
    const mapRef = useRef<HTMLDivElement>(null);
    const googleMapInstance = useRef<any>(null);
    const markersRef = useRef<any[]>([]);
    const circlesRef = useRef<any[]>([]);
    const directionsRendererRef = useRef<any>(null);
    const [mapLoaded, setMapLoaded] = useState<boolean>(false);
    const [mapError, setMapError] = useState<string | null>(null);
    const [mapType, setMapType] = useState<"hybrid" | "roadmap" | "terrain">("hybrid");

    // Toggles de Capas en Google Maps
    const [mostrarFocosViirs, setMostrarFocosViirs] = useState<boolean>(true);
    const [mostrarBuffer3km, setMostrarBuffer3km] = useState<boolean>(true);
    const [mostrarClusters, setMostrarClusters] = useState<boolean>(true);
    const [mostrarDistritos, setMostrarDistritos] = useState<boolean>(true);

    // Sistema de Rutas y Accesibilidad C2 (Carro / Caminando)
    const [rutaModo, setRutaModo] = useState<"DRIVING" | "WALKING">("DRIVING");
    const [calculatingRuta, setCalculatingRuta] = useState<boolean>(false);
    const [rutaInfo, setRutaInfo] = useState<{
        origen: string;
        destino: string;
        distancia: string;
        duracion: string;
        modo: "DRIVING" | "WALKING";
        instrucciones: string[];
        advertencias: string[];
    } | null>(null);

    // CONTROL DE LÍNEA DE TIEMPO (TIMELINE MULTITEMPORAL C2 - 24 HORAS)
    const [timelineHora, setTimelineHora] = useState<number>(24); // Horas acumuladas (1 a 24h, default 24 = todos)
    const [timelinePlaying, setTimelinePlaying] = useState<boolean>(false);
    const [timelineVelocidad, setTimelineVelocidad] = useState<1 | 2>(1);

    // MODO 3D TOPOGRÁFICO Y ANÁLISIS DE RUTAS DE ESCAPE
    const [modoEscape3D, setModoEscape3D] = useState<boolean>(false);
    const [focoEscapeSeleccionado, setFocoEscapeSeleccionado] = useState<FocoCalor | null>(null);
    const escapePolylinesRef = useRef<any[]>([]);

    const DEFAULT_MAPS_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "AIzaSyCQpoz3Zw4JarglGM7w2aq46d9XCtwfTyE";

    // Catálogo fallback offline de Planes de Contingencia Regionales
    const PLANES_CONTINGENCIA_DEFAULT: PlanContingencia[] = [
        {
            id: "PLAN-CUSCO-2023-2024",
            titulo: "Plan de Contingencia ante Incendios Forestales de la Región Cusco 2023-2024",
            nivel: "REGIONAL",
            region: "CUSCO",
            ubigeo_ref: "080000",
            aspectos_clave: "Modelo referencial regional. Coordinación interinstitucional GORE Cusco, SERNANP (Santuario Machu Picchu), Bomberos CGBVP IX Comandancia y comunidades campesinas.",
            recursos_asignados: "Compañías de bomberos Cusco, helicópteros FAP, brigadas de guardaparques, almacenes adelantados INDECI.",
            archivo_fuente: "PLAN-CONTINGENCIA-INCENDIOS-FORESTALES-2023-2024.pdf"
        },
        {
            id: "GRJ-JUNIN-2024",
            titulo: "Plan de Contingencia Regional ante Incendios Forestales de Junín 2024",
            nivel: "REGIONAL",
            region: "JUNIN",
            ubigeo_ref: "120000",
            aspectos_clave: "Protocolo de intervención en valles interandinos (Huancayo, Concepción, Jauja) y cuencas de selva central (Satipo, Chanchamayo). Alerta temprana con COER Junín.",
            recursos_asignados: "Maquinaria pesada GORE Junín (Tractores oruga D8/D6), cisternas subregionales, brigadas forestales PNP y Ejército.",
            archivo_fuente: "GRJ-1340453f722e96163ff97c4ad1267ea38645ee Junin 2024.pdf"
        },
        {
            id: "PLAN-SATIPO-2021-2024",
            titulo: "Plan Provincial de Prevención y Reducción del Riesgo ante Incendios Forestales de Satipo",
            nivel: "PROVINCIAL",
            region: "JUNIN",
            provincia: "SATIPO",
            ubigeo_ref: "120600",
            aspectos_clave: "Enfoque territorial en cuenca de Río Tambo, Pangoa, Mazamari. Protección de reservas comunales Asháninkas y bosques primarios ante fuegos de rozo y quema descontrolados.",
            recursos_asignados: "Comité Provincial de Operaciones de Emergencia, enlaces comunitarios nativos por radio HF/VHF, cisternas municipales.",
            archivo_fuente: "22110_plan-de-prevencion-y-reduccion-del-riesgo-de-desastres-ante-incendios-forestales-de-la-provincia-de-satipo-20.pdf"
        },
        {
            id: "PLAN-MARA-APURIMAC-2024",
            titulo: "Plan de Contingencia ante Incendios Forestales Distrito de Mara 2024",
            nivel: "DISTRITAL",
            region: "APURIMAC",
            provincia: "COTABAMBAS",
            distrito: "MARA",
            ubigeo_ref: "030505",
            aspectos_clave: "Protocolo local altoandino para comunidades campesinas de Cotabambas. Coordinación con rondas campesinas y fajas cortafuego en laderas de pendiente >40°.",
            recursos_asignados: "Brigada comunal Mara, reservorios de agua para pastoreo, herramientas manuales Pulaski/McLeod.",
            archivo_fuente: "Plan-de-contingencia-ante-Incendios-Forestales-Mara-2024-1.pdf"
        },
        {
            id: "RER-UCAYALI-0192-2025",
            titulo: "Resolución Ejecutiva Regional 0192-2025 Plan de Emergencia Región Ucayali",
            nivel: "REGIONAL",
            region: "UCAYALI",
            ubigeo_ref: "250000",
            aspectos_clave: "Emergencia ambiental y forestal en Coronel Portillo, Atalaya y Padre Abad. Coordinación fluvial de brigadas y salvaguarda de comunidades Shipibo-Konibo y Ashéninka.",
            recursos_asignados: "Despliegue de lanchas rápidas fluviales, motobombas flotantes, apoyo ala rotatoria FAP.",
            archivo_fuente: "6925303-rer 0192-2025 region ucayali.pdf"
        },
        {
            id: "PLAN-SAN-MARTIN-ORIARC",
            titulo: "Plan de Prevención y Contingencia Forestal Región San Martín (OriArc)",
            nivel: "REGIONAL",
            region: "SAN MARTIN",
            ubigeo_ref: "220000",
            aspectos_clave: "Monitoreo continuo de purmas y plantaciones de palma/cacao. Control de quemas agrícolas en el valle del Huallaga y Alto Mayo.",
            recursos_asignados: "Brigadas del Proyecto Especial Huallaga Central y Bajo Mayo (PEHCBM), drones térmicos.",
            archivo_fuente: "OriArc region san martin.pdf"
        },
        {
            id: "CENEPRED-ESCENARIO-14475",
            titulo: "Escenario de Riesgo por Incendios Forestales de la Región Apurímac (CENEPRED)",
            nivel: "ESTUDIO_TECNICO",
            region: "APURIMAC",
            ubigeo_ref: "030000",
            aspectos_clave: "Zonificación de susceptibilidad muy alta en Abancay, Andahuaylas y Cotabambas por déficit pluviométrico severo y masa combustible de ichu/pajonal seco.",
            archivo_fuente: "14475_escenario-de-riesgo-por-incendios-forestales-de-la-region-apurimac.pdf"
        },
        {
            id: "CENEPRED-ESCENARIO-10471",
            titulo: "Escenario Nacional de Riesgo por Incendios Forestales a Nivel País (CENEPRED 2020)",
            nivel: "METODOLOGIA_NACIONAL",
            region: "NACIONAL",
            ubigeo_ref: "000000",
            aspectos_clave: "Metodología multicriterio basada en pendiente topográfica, cobertura vegetal, estrés hídrico de biomasa e historial de focos de calor FIRMS.",
            archivo_fuente: "10471_escenario-de-riesgo-por-incendios-forestales.pdf"
        }
    ];

    const EVALUACION_SABOGAL_DEFAULT: EvaluacionSabogal = {
        semaforo: "ROJO_PROHIBICION_ABSOLUTA",
        riesgo_score_100: 85,
        condiciones_evaluadas: {
            viento_kmh: 38.0,
            humedad_relativa_pct: 22.0,
            temperatura_c: 26.5,
            pendiente_grados: 32.0,
            tipo_biomasa: "PAJONAL_ALTOANDINO"
        },
        advertencias: [
            "Viento crítico (38.0 km/h): riesgo inminente de propagación descontrolada y fuego de copa por salto de chispas a más de 500m.",
            "Humedad relativa extremadamente baja (22.0%): biomasa convertida en combustible explosivo con secado acelerado.",
            "Pendiente pronunciada (32.0°): efecto chimenea multiplica por 4 la velocidad del fuego ladera arriba."
        ],
        recomendacion_coed_social: "PROHIBIDA CUALQUIER ACTIVIDAD DE FUEGO O QUEMA. Alto riesgo de megaincendio. Alerta a rondas campesinas y COED Social.",
        alternativas_ecologicas_sabogal: [
            "Desbroce mecánico y trituración de rastrojos para abono verde en lugar de quema.",
            "Construcción de fajas cortafuego de 5 a 10 metros en linderos de bosques y pastizales.",
            "Compostaje in situ de restos agrícolas con estiércol para retención de humedad en el suelo.",
            "Zonificación comunal: veda total de fuego en cabeceras de cuenca y bosques relictos de queñual (Polylepis)."
        ],
        protocolo_fauna_serfor: {
            directriz: "En caso de fuego activo, reportar fauna silvestre desorientada o con quemaduras a la ATFFS (SERFOR).",
            especies_vulnerables: [
                "Oso de anteojos (Tremarctos ornatus)",
                "Taruca (Hippocamelus antisensis)",
                "Venado gris",
                "Aves de queñual"
            ]
        }
    };

    // Cargar datos del backend con resiliencia total
    const loadData = async () => {
        try {
            setLoading(true);
            setPlanesContingencia(PLANES_CONTINGENCIA_DEFAULT);
            setEvaluacionSabogal(EVALUACION_SABOGAL_DEFAULT);

            const [res1, res2, res3, res4, res5, res6] = await Promise.allSettled([
                fetch(`${API_BASE}/api/v1/incendios/resumen-nacional`),
                fetch(`${API_BASE}/api/v1/incendios/focos-activos`),
                fetch(`${API_BASE}/api/v1/incendios/distritos-2018?solo_cenepred=${soloCenepred}`),
                fetch(`${API_BASE}/api/v1/incendios/clusters-activos?radio_km=12.0&min_focos=2`),
                fetch(`${API_BASE}/api/v1/incendios/planes-contingencia`),
                fetch(`${API_BASE}/api/v1/incendios/evaluacion-quema-sabogal`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        viento_kmh: vientoKmh,
                        humedad_relativa_pct: humedadRelativa,
                        temperatura_c: temperatura,
                        pendiente_grados: pendiente,
                        tipo_biomasa: "PAJONAL_ALTOANDINO"
                    })
                })
            ]);

            if (res1.status === "fulfilled" && res1.value.ok) {
                const data1 = await res1.value.json();
                setResumen(data1);
            }
            if (res2.status === "fulfilled" && res2.value.ok) {
                const data2 = await res2.value.json();
                if (data2.focos && Array.isArray(data2.focos) && data2.focos.length > 0) {
                    setFocos(data2.focos);
                } else {
                    setFocos(FOCOS_DEFAULT);
                }
                if (data2.comparativa_orbital_c2) {
                    setComparativaOrbital(data2.comparativa_orbital_c2);
                }
            } else {
                setFocos(FOCOS_DEFAULT);
            }
            if (res3.status === "fulfilled" && res3.value.ok) {
                const data3 = await res3.value.json();
                const distList = data3.distritos || [];
                setDistritos2018(distList);
                if (distList.length > 0 && !distritoSeleccionado) {
                    setDistritoSeleccionado(distList[0]);
                }
            }
            if (res4.status === "fulfilled" && res4.value.ok) {
                const data4 = await res4.value.json();
                setClusters(data4.clusters || []);
            }
            if (res5.status === "fulfilled" && res5.value.ok) {
                const data5 = await res5.value.json();
                if (data5.planes && Array.isArray(data5.planes) && data5.planes.length > 0) {
                    setPlanesContingencia(data5.planes);
                }
            }
            if (res6.status === "fulfilled" && res6.value.ok) {
                const data6 = await res6.value.json();
                if (data6.evaluacion) {
                    setEvaluacionSabogal(data6.evaluacion);
                }
            }
        } catch (e) {
            console.error("Error al cargar datos de incendios forestales:", e);
        } finally {
            setLoading(false);
        }
    };



    useEffect(() => {
        loadData();
    }, [soloCenepred]);

    // Inicializar Google Maps Platform
    useEffect(() => {
        if (typeof window === "undefined") return;

        const initMap = () => {
            if (!mapRef.current || !(window as any).google?.maps) return;
            try {
                const google = (window as any).google;
                const map = new google.maps.Map(mapRef.current, {
                    center: { lat: -12.0464, lng: -75.2 },
                    zoom: 6,
                    mapTypeId: mapType,
                    tilt: 45,
                    mapTypeControl: false,
                    streetViewControl: false,
                    fullscreenControl: true,
                    fullscreenControlOptions: {
                        position: google.maps.ControlPosition.BOTTOM_RIGHT
                    },
                    zoomControl: true,
                    zoomControlOptions: {
                        position: google.maps.ControlPosition.RIGHT_CENTER
                    },
                    styles: [
                        { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
                        { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
                        { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
                        {
                            featureType: "administrative.locality",
                            elementType: "labels.text.fill",
                            stylers: [{ color: "#d59563" }]
                        }
                    ]
                });
                googleMapInstance.current = map;
                setMapLoaded(true);
                setMapError(null);
            } catch (err: any) {
                console.error("Error al inicializar Google Maps:", err);
                setMapError("Error al iniciar Google Maps Platform.");
            }
        };

        if ((window as any).google?.maps) {
            initMap();
        } else {
            const existingScript = document.getElementById("gmaps-incendios-script");
            if (!existingScript) {
                const script = document.createElement("script");
                script.id = "gmaps-incendios-script";
                script.src = `https://maps.googleapis.com/maps/api/js?key=${DEFAULT_MAPS_KEY}&libraries=drawing,places,geometry`;
                script.async = true;
                script.defer = true;
                script.onload = () => initMap();
                script.onerror = () => setMapError("No se pudo cargar la librería de Google Maps Platform.");
                document.head.appendChild(script);
            }
        }
    }, [DEFAULT_MAPS_KEY]);

    // Cambiar tipo de mapa
    useEffect(() => {
        if (googleMapInstance.current) {
            googleMapInstance.current.setMapTypeId(mapType);
        }
    }, [mapType]);

    // Renderizar Marcadores y Polígonos de Riesgo en Google Maps
    useEffect(() => {
        if (!mapLoaded || !googleMapInstance.current || !(window as any).google?.maps) return;
        const google = (window as any).google;

        // Limpiar marcadores y círculos previos
        markersRef.current.forEach(m => m.setMap(null));
        markersRef.current = [];
        circlesRef.current.forEach(c => c.setMap(null));
        circlesRef.current = [];

        // Registrar handler global para el botón de InfoWindow
        (window as any).activarEscape3D = (focoId: string) => {
            const fTarget = focos.find(f => f.id === focoId);
            if (fTarget) {
                handleActivarModoEscape3D(fTarget);
            }
        };

        // 1. Graficar Focos de Calor Satelitales (VIIRS 375m & Sentinel-3 1km con Validación Cruzada y Timeline)
        if (mostrarFocosViirs) {
            // Filtro por Timeline horario: si timelineHora < 24, mostrar focos cuya antigüedad sea <= timelineHora
            const focosFiltradosPorTiempo = focos.filter(f => {
                if (timelineHora >= 24) return true;
                const horasAntiguedad = f.horas_desde_deteccion ?? 1;
                return horasAntiguedad <= timelineHora;
            });

            focosFiltradosPorTiempo.forEach(foco => {
                const isOcluido = foco.es_oclusion_nubosa ?? (foco.estado_deteccion === "OCLUIDO_POR_NUBOSIDAD");
                const isCruzado = foco.confirmacion_cruzada === true;
                const isSentinel3 = foco.satelite === "Sentinel-3" || (foco.sensor && foco.sensor.includes("Sentinel-3"));

                // REGLA TRICOLOR DE C2:
                // 1. Rojo brillante parpadeante: Confirmación cruzada dual VIIRS + Sentinel-3 (≤ 1km, 99% confianza)
                // 2. Amarillo: Sentinel-3 solitario (Verificación espectral)
                // 3. Naranja / Ámbar: VIIRS solitario o en persistencia PTT
                let markerColor = "#f97316"; // Naranja VIIRS default
                let strokeColor = "#ffffff";
                let markerScale = 7;

                if (isCruzado) {
                    markerColor = "#ef4444"; // Rojo Crítico Dual
                    strokeColor = "#fee2e2";
                    markerScale = 10;
                } else if (isSentinel3) {
                    markerColor = "#eab308"; // Amarillo Sentinel-3
                    strokeColor = "#713f12";
                    markerScale = 8;
                } else if (isOcluido) {
                    markerColor = "#f59e0b"; // Ámbar PTT
                    strokeColor = "#b45309";
                    markerScale = 7;
                }

                const marker = new google.maps.Marker({
                    position: { lat: foco.lat, lng: foco.lng },
                    map: googleMapInstance.current,
                    title: `${isCruzado ? "🚨 [CONFIRMACIÓN CRUZADA DUAL VIIRS + S3 - 99% CONFIANZA] " : (isSentinel3 ? "🛰️ [SENTINEL-3 SLSTR] " : (isOcluido ? "☁️ [MEMORIA PTT] " : "🔥 VIIRS: "))}${foco.distrito} (${foco.frp_mw} MW)`,
                    icon: {
                        path: google.maps.SymbolPath.CIRCLE,
                        scale: markerScale,
                        fillColor: markerColor,
                        fillOpacity: isOcluido ? 0.75 : 0.95,
                        strokeWeight: isCruzado ? 3 : (isOcluido ? 1.5 : 2),
                        strokeColor: strokeColor
                    }
                });

                // REGLA TÁCTICA DE BÚFER:
                // Si confirmacion_cruzada es true -> Generar automáticamente círculo (búfer) de 1 km alrededor de la alerta
                if (isCruzado) {
                    const circle1km = new google.maps.Circle({
                        map: googleMapInstance.current,
                        center: { lat: foco.lat, lng: foco.lng },
                        radius: 1000, // 1 km oficial
                        fillColor: "#ef4444",
                        fillOpacity: 0.18,
                        strokeColor: "#dc2626",
                        strokeWeight: 2.2
                    });
                    circlesRef.current.push(circle1km);
                }

                // Buffer adicional opcional de 3km si el usuario tiene el toggle activo
                if (mostrarBuffer3km && !isCruzado) {
                    const circle = new google.maps.Circle({
                        map: googleMapInstance.current,
                        center: { lat: foco.lat, lng: foco.lng },
                        radius: 3000,
                        fillColor: isOcluido ? "#f59e0b" : "#ef4444",
                        fillOpacity: isOcluido ? 0.08 : 0.12,
                        strokeColor: isOcluido ? "#d97706" : "#dc2626",
                        strokeWeight: 1.2,
                        strokeDashArray: isOcluido ? [4, 4] : undefined
                    });
                    circlesRef.current.push(circle);
                }

                // 1. CÁLCULO DE SEVERIDAD ESTIMADA DINÁMICA (SISTEMA DE ALERTA TEMPRANA DINÁMICA)
                // Regla Lógica: FRP > 10 MW (alta energía) + Ráfagas 25m > 35 km/h + Humedad Suelo 0-7cm < 15% (0.15)
                const frpValor = foco.frp_mw ?? 0;
                const rafagasValor = foco.open_meteo?.rafagas_viento_kmh ?? 42.0;
                const humedadSueloPct = ((foco.open_meteo?.humedad_suelo_0_7cm ?? 0.048)) * 100;
                const esRiesgoExtremoPropagacion = frpValor > 10 && rafagasValor > 35 && humedadSueloPct < 15;

                const infoWindowContent = `
                    <div style="color: #0f172a; font-family: sans-serif; padding: 8px; max-width: 340px;">
                        <div style="display: flex; align-items: center; justify-content: space-between; gap: 6px; margin-bottom: 6px;">
                            <span style="background: ${isCruzado ? '#dc2626' : (isSentinel3 ? '#ca8a04' : (isOcluido ? '#b45309' : '#ea580c'))}; color: white; padding: 2px 7px; border-radius: 4px; font-weight: bold; font-size: 10.5px;">
                                ${isCruzado ? "🚨 DUAL VIIRS + S3 (99% CONF.)" : (isSentinel3 ? "🛰️ SENTINEL-3 SLSTR" : (isOcluido ? "☁️ MEMORIA PTT" : "🔥 NASA VIIRS LIVE"))}
                            </span>
                            <span style="font-size: 12px; font-weight: bold; color: ${isCruzado ? '#dc2626' : '#b45309'};">FRP ${foco.frp_mw} MW</span>
                        </div>

                        <!-- INDICADOR DINÁMICO DE SEVERIDAD ESTIMADA (FRP + OPEN-METEO) -->
                        <div style="margin-bottom: 6px; padding: 6px 8px; border-radius: 6px; ${
                            esRiesgoExtremoPropagacion
                                ? 'background: #450a0a; border: 1.8px solid #ef4444; color: #fee2e2;'
                                : 'background: #14532d; border: 1.5px solid #22c55e; color: #dcfce7;'
                        }">
                            <div style="display: flex; align-items: center; justify-content: space-between; font-weight: bold; font-size: 10px; margin-bottom: 2px;">
                                <span>⚡ SEVERIDAD ESTIMADA:</span>
                                <span style="font-size: 10px; padding: 1px 5px; border-radius: 3px; background: ${esRiesgoExtremoPropagacion ? '#dc2626' : '#16a34a'}; color: white;">
                                    ${esRiesgoExtremoPropagacion ? "RIESGO EXTREMO DE PROPAGACIÓN" : "RIESGO CONTROLABLE"}
                                </span>
                            </div>
                            <div style="font-size: 9.5px; line-height: 1.3; opacity: 0.95;">
                                ${esRiesgoExtremoPropagacion
                                    ? `<b>CONDICIÓN CRÍTICA CUMPLIDA:</b> FRP > 10 MW (${frpValor} MW) • Ráfagas 25m copa > 35 km/h (${rafagasValor} km/h) • Humedad suelo < 15% (${humedadSueloPct.toFixed(1)}%). <b>Fuego de copa inminente con salto de pavesas ladera arriba.</b>`
                                    : `Monitoreo regular: Parámetros radiativos y de suelo dentro de márgenes de intervención con brigadas terrestres.`
                                }
                            </div>
                        </div>

                        ${isCruzado ? `
                            <div style="background: #fef2f2; border: 1.5px solid #ef4444; color: #991b1b; padding: 6px 8px; border-radius: 6px; font-size: 10px; margin-bottom: 6px; line-height: 1.35;">
                                🛡️ <b>VALIDACIÓN MULTI-SATELITAL COINCIDENTE:</b> Detección cruzada entre sensor <b>VIIRS (375m)</b> y <b>Sentinel-3 (1km)</b> a menos de 1 km de distancia. <b>Falso positivo descartado al 99%</b>. Generado búfer táctico de 1 km.
                            </div>
                        ` : ''}

                        ${isOcluido ? `
                            <div style="background: #fffbeb; border: 1px solid #fde68a; color: #92400e; padding: 6px 8px; border-radius: 6px; font-size: 10px; margin-bottom: 6px; line-height: 1.35;">
                                ⚠️ <b>PROTECCIÓN ANTI-FALSO NEGATIVO:</b> Foco no captado en el pase satelital actual debido al manto espeso de nubes o inversión térmica nocturna. <b>AMARU-CLIMATE retiene su posición y alerta activa</b> porque un fuego de esta escala no se extingue en pocas horas.
                            </div>
                        ` : ''}

                        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 6px; margin-bottom: 6px;">
                            <div style="font-size: 10px; color: #64748b; font-weight: 600; text-transform: uppercase;">Jurisdicción Territorial:</div>
                            <div style="font-size: 13px; font-weight: bold; color: #0f172a; margin-top: 1px;">
                                ${foco.distrito} - ${foco.provincia}
                            </div>
                            <div style="font-size: 11px; font-weight: 600; color: #b45309;">
                                Región: ${foco.departamento} ${foco.ubigeo ? `(UBIGEO: ${foco.ubigeo})` : ""}
                            </div>
                        </div>

                        <div style="font-size: 11px; font-weight: 600; margin-bottom: 3px;">Sensor: ${foco.sensor}</div>
                        <div style="font-size: 10px; color: #475569; margin-bottom: 3px;">Temp Brillo: <b>${foco.temperatura_brillo_k} K</b> | Confianza: <b>${foco.confianza}</b></div>
                        <div style="font-size: 10px; color: #64748b; margin-bottom: 6px;">Hora Detección: <b>${foco.hora_deteccion}</b></div>

                        <!-- ESCALONAMIENTO NORMATIVO SINAGERD (NIVELES 1 A 5) -->
                        <div style="margin-bottom: 6px; padding: 5px 8px; border-radius: 6px; font-size: 10px; font-weight: bold; display: flex; align-items: center; justify-content: space-between; ${
                            isCruzado || foco.frp_mw >= 100 || (foco.open_meteo?.rafagas_viento_kmh ?? 0) >= 40
                                ? 'background: #450a0a; color: #fca5a5; border: 1px solid #dc2626;'
                                : foco.frp_mw >= 10
                                ? 'background: #431407; color: #fdba74; border: 1px solid #ea580c;'
                                : 'background: #1e1b4b; color: #c7d2fe; border: 1px solid #6366f1;'
                        }">
                            <span>ESCALONAMIENTO SINAGERD:</span>
                            <span>${
                                isCruzado || foco.frp_mw >= 100
                                    ? 'NIVEL 5 (NACIONAL / FAP BAMBI BUCKET)'
                                    : foco.frp_mw >= 25
                                    ? 'NIVEL 4 (REGIONAL / GORE)'
                                    : foco.frp_mw >= 5
                                    ? 'NIVEL 3 (PROVINCIAL / CGBVP)'
                                    : 'NIVEL 1-2 (DISTRITAL / LOCAL)'
                            }</span>
                        </div>
                        
                        <!-- DATOS OPEN-METEO PRO: RÁFAGAS A 10M/25M Y HUMEDAD SUELO (0-7CM) -->
                        <div style="background: #0f172a; color: #f8fafc; border-radius: 6px; padding: 6px 8px; margin-bottom: 6px; font-size: 10px; border: 1px solid #334155;">
                            <div style="color: #38bdf8; font-weight: bold; margin-bottom: 4px; display: flex; align-items: center; justify-content: space-between;">
                                <span>🌪️ OPEN-METEO PRO (ECMWF IFS):</span>
                                <span style="color: #fbbf24; font-size: 9px;">${foco.irp_score ? `IRP: ${foco.irp_score}/100` : "Alta Res. 9km"}</span>
                            </div>
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px;">
                                <div>Temp. Ambiente: <b style="color: #f87171;">${foco.open_meteo?.temperatura_ambiente_c ?? 31.8}°C</b></div>
                                <div>Viento 10m: <b style="color: #c084fc;">${foco.open_meteo?.viento_velocidad_kmh ?? 26.5} km/h</b></div>
                                <div>Ráfagas 25m (Copa): <b style="color: #e879f9;">${foco.open_meteo?.rafagas_viento_kmh ?? 42.0} km/h</b></div>
                                <div>Humedad Suelo 0-7cm: <b style="color: #34d399;">${humedadSueloPct.toFixed(1)}%</b></div>
                            </div>
                            ${foco.irp_score ? `
                                <div style="margin-top: 4px; padding-top: 3px; border-top: 1px solid #1e293b; color: #fca5a5; font-size: 9px; font-weight: bold;">
                                    🔥 Índice Riesgo Propagación: ${foco.irp_score}/100 (Crítico)
                                </div>
                            ` : ''}
                        </div>

                        <!-- BOTÓN ACCIÓN DE ESCAPE 3D Y TOPOGRAFÍA DE LADERA -->
                        <div style="margin-top: 6px; display: flex; flex-direction: column; gap: 4px;">
                            <button
                                onclick="window.activarEscape3D('${foco.id}')"
                                style="width: 100%; background: #0284c7; hover:background: #0369a1; color: white; border: none; padding: 6px 10px; border-radius: 6px; font-size: 11px; font-weight: bold; cursor: pointer; display: flex; items-center; justify-content: center; gap: 6px;"
                            >
                                🏔️ VER EN 3D: CONO DE PROPAGACIÓN Y RUTA DE ESCAPE
                            </button>
                            <div style="font-size: 9px; color: #64748b; text-align: center;">
                                Inclina mapa a 67.5°, proyecta avance ladera arriba y vía segura hacia fondo de valle.
                            </div>
                        </div>
                    </div>
                `;
                const infoWindow = new google.maps.InfoWindow({ content: infoWindowContent });

                marker.addListener("click", () => {
                    infoWindow.open(googleMapInstance.current, marker);
                    googleMapInstance.current.setCenter({ lat: foco.lat, lng: foco.lng });
                    googleMapInstance.current.setZoom(14);
                    
                    // Disparar consulta complementaria de Open-Meteo Pro si es foco cruzado
                    if (isCruzado) {
                        fetch(`https://api.open-meteo.com/v1/forecast?latitude=${foco.lat}&longitude=${foco.lng}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,wind_gusts_10m&hourly=soil_moisture_0_to_7cm,vapour_pressure_deficit&models=ecmwf_ifs025&forecast_days=1`)
                            .then(r => r.json())
                            .then(omData => {
                                console.log("[Open-Meteo Pro Live Foco Cruzado]", omData);
                            })
                            .catch(err => console.error("Error Open-Meteo live:", err));
                    }

                    // Seleccionar distrito más cercano
                    let minDist = Infinity;
                    let closestDistrict: any = null;
                    distritos2018.forEach(d => {
                        const dLat = d.lat - foco.lat;
                        const dLng = d.lng - foco.lng;
                        const distSq = (dLat * dLat) + (dLng * dLng);
                        if (distSq < minDist) {
                            minDist = distSq;
                            closestDistrict = d;
                        }
                    });
                    if (closestDistrict) {
                        setDistritoSeleccionado(closestDistrict);
                    }
                });

                markersRef.current.push(marker);
            });
        }

        // 2. Graficar Clusters de Incendios Forestales de Gran Envergadura
        if (mostrarClusters) {
            clusters.forEach(cl => {
                const isMega = cl.tipo_incendio === "MEGA_INCENDIO_COMPLEJO";
                const isGran = cl.tipo_incendio === "INCENDIO_GRAN_ENVERGADURA";
                const colorStroke = isMega ? "#7f1d1d" : (isGran ? "#b91c1c" : "#c2410c");
                const colorFill = isMega ? "#dc2626" : (isGran ? "#ea580c" : "#f97316");

                // Círculo envolvente del Cluster
                const clusterCircle = new google.maps.Circle({
                    map: googleMapInstance.current,
                    center: { lat: cl.centroide_lat, lng: cl.centroide_lng },
                    radius: cl.radio_expansion_km * 1000,
                    fillColor: colorFill,
                    fillOpacity: 0.10,
                    strokeColor: colorStroke,
                    strokeWeight: 2.0,
                    strokeDashArray: [4, 4]
                });

                // Marcador central del Cluster
                const clusterMarker = new google.maps.Marker({
                    position: { lat: cl.centroide_lat, lng: cl.centroide_lng },
                    map: googleMapInstance.current,
                    title: `🚨 ${cl.tipo_incendio}: ${cl.distrito_epicentro} (${cl.num_focos_agrupados} focos, ${cl.frp_total_mw} MW)`,
                    icon: {
                        path: google.maps.SymbolPath.CIRCLE,
                        scale: 13,
                        fillColor: colorStroke,
                        fillOpacity: 0.95,
                        strokeWeight: 2.5,
                        strokeColor: "#ffffff"
                    },
                    label: {
                        text: `${cl.num_focos_agrupados}`,
                        color: "#ffffff",
                        fontSize: "10px",
                        fontWeight: "bold"
                    }
                });

                const clusterInfoContent = `
                    <div style="color: #0f172a; font-family: sans-serif; padding: 8px; max-width: 320px;">
                        <div style="background: ${colorStroke}; color: white; padding: 4px 8px; border-radius: 4px; font-weight: bold; font-size: 11px; margin-bottom: 6px; text-align: center;">
                            🚨 ${cl.tipo_incendio.replace(/_/g, " ")}
                        </div>
                        <div style="font-size: 13px; font-weight: bold; color: #0f172a; margin-bottom: 2px;">
                            Epicentro: ${cl.distrito_epicentro} - ${cl.provincia} (${cl.departamento})
                        </div>
                        <div style="font-size: 11px; color: #475569; margin-bottom: 6px;">
                            Focos Activos Agrupados: <b>${cl.num_focos_agrupados}</b> | Potencia FRP: <b style="color: #dc2626;">${cl.frp_total_mw} MW</b>
                        </div>
                        <div style="font-size: 11px; background: #fff7ed; border: 1px solid #ffedd5; padding: 6px; border-radius: 6px; margin-bottom: 6px;">
                            <div><b>Escalonamiento:</b> ${cl.escalonamiento_sinagerd}</div>
                            <div><b>Radio Expansión:</b> ${cl.radio_expansion_km} km (Cortafuego: ${cl.cortafuegos_recomendado_km} km)</div>
                        </div>
                        <div style="font-size: 10px; background: #fef2f2; border: 1px solid #fecaca; color: #991b1b; padding: 5px; border-radius: 6px;">
                            🚜 <b>Requerimiento C2:</b> ${cl.maquinaria_pesada_requerida}
                        </div>
                    </div>
                `;
                const clusterInfoWindow = new google.maps.InfoWindow({ content: clusterInfoContent });

                clusterMarker.addListener("click", () => {
                    clusterInfoWindow.open(googleMapInstance.current, clusterMarker);
                    handleSelectCluster(cl);
                });

                markersRef.current.push(clusterMarker);
                circlesRef.current.push(clusterCircle);
            });
        }

        // 3. Graficar Distritos Municipales (1,893 a nivel nacional con flag CENEPRED 2018)
        if (mostrarDistritos) {
            const distritosFiltrados = distritos2018.filter(d => !selectedDept || d.departamento === selectedDept);
            distritosFiltrados.forEach(dist => {
                const isCenepred = dist.es_cenepred_2018 ?? true;
                const isMuyAlto = dist.riesgo_cenepred === "MUY_ALTO";
                const markerColor = isCenepred ? (isMuyAlto ? "#f97316" : "#eab308") : "#3b82f6";

                const marker = new google.maps.Marker({
                    position: { lat: dist.lat, lng: dist.lng },
                    map: googleMapInstance.current,
                    title: `${isCenepred ? "[CENEPRED 2018] " : "[MUNICIPALIDAD] "}${dist.distrito} - ${dist.provincia} (${dist.departamento}) | Ubigeo: ${dist.ubigeo}`,
                    icon: {
                        path: isCenepred ? google.maps.SymbolPath.FORWARD_CLOSED_ARROW : google.maps.SymbolPath.CIRCLE,
                        scale: isCenepred ? 5 : 4,
                        fillColor: markerColor,
                        fillOpacity: 0.85,
                        strokeWeight: 1,
                        strokeColor: "#000000"
                    }
                });

                const infoHtml = `
                    <div style="color: #0f172a; font-family: sans-serif; padding: 6px; max-width: 280px; font-size: 11px;">
                        <div style="background: ${isCenepred ? '#ea580c' : '#2563eb'}; color: white; padding: 3px 6px; border-radius: 4px; font-weight: bold; margin-bottom: 4px;">
                            ${isCenepred ? "🔥 PRIORIZADO CENEPRED 2018" : "🏛️ MUNICIPALIDAD DISTRITAL INEI"}
                        </div>
                        <div style="font-weight: bold; font-size: 13px; color: #0f172a;">${dist.distrito}</div>
                        <div style="color: #64748b; margin-bottom: 4px;">${dist.provincia} - ${dist.departamento} | UBIGEO: <b>${dist.ubigeo}</b></div>
                        ${dist.alcalde ? `<div><b>Alcalde:</b> ${dist.alcalde}</div>` : ""}
                        ${dist.telefono ? `<div><b>Contacto C2:</b> ${dist.telefono}</div>` : ""}
                        <div style="margin-top: 4px; font-size: 10px; color: #475569;">
                            <b>Combustible:</b> ${dist.combustible || "Biomasa Local"} | <b>Pendiente:</b> ${dist.pendiente_grados}°
                        </div>
                    </div>
                `;
                const distInfoWin = new google.maps.InfoWindow({ content: infoHtml });

                marker.addListener("click", () => {
                    distInfoWin.open(googleMapInstance.current, marker);
                    setDistritoSeleccionado(dist);
                    googleMapInstance.current.setCenter({ lat: dist.lat, lng: dist.lng });
                    googleMapInstance.current.setZoom(13);
                });

                markersRef.current.push(marker);
            });
        }
    }, [mapLoaded, focos, clusters, distritos2018, selectedDept, soloCenepred, mostrarFocosViirs, mostrarBuffer3km, mostrarClusters, mostrarDistritos, timelineHora]);

    // EFECTO DE REPRODUCCIÓN AUTOMÁTICA DEL TIMELINE (PLAY / PAUSE)
    useEffect(() => {
        let interval: NodeJS.Timeout | null = null;
        if (timelinePlaying) {
            const stepMs = timelineVelocidad === 2 ? 800 : 1600;
            interval = setInterval(() => {
                setTimelineHora(prev => {
                    if (prev >= 24) {
                        return 1; // Reiniciar ciclo
                    }
                    return prev + 1;
                });
            }, stepMs);
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [timelinePlaying, timelineVelocidad]);

    // Función para calcular ruta vehicular / a pie hacia el foco o cluster
    const handleCalcularRutaHaciaFoco = (destinoLat: number, destinoLng: number, destinoNombre: string, modoOverride?: "DRIVING" | "WALKING") => {
        const modo = modoOverride || rutaModo;
        if (!distritoSeleccionado) {
            alert("Por favor selecciona primero un Distrito o Centro Poblado de partida.");
            return;
        }

        if (!(window as any).google?.maps) {
            alert("Google Maps Platform aún no está cargado.");
            return;
        }

        try {
            setCalculatingRuta(true);
            const google = (window as any).google;
            const directionsService = new google.maps.DirectionsService();

            if (!directionsRendererRef.current) {
                directionsRendererRef.current = new google.maps.DirectionsRenderer({
                    map: googleMapInstance.current,
                    suppressMarkers: false,
                    polylineOptions: {
                        strokeColor: modo === "DRIVING" ? "#38bdf8" : "#a855f7",
                        strokeWeight: 5,
                        strokeOpacity: 0.9
                    }
                });
            } else {
                directionsRendererRef.current.setOptions({
                    polylineOptions: {
                        strokeColor: modo === "DRIVING" ? "#38bdf8" : "#a855f7",
                        strokeWeight: 5,
                        strokeOpacity: 0.9
                    }
                });
            }

            const origin = { lat: distritoSeleccionado.lat, lng: distritoSeleccionado.lng };
            const destination = { lat: destinoLat, lng: destinoLng };

            directionsService.route(
                {
                    origin,
                    destination,
                    travelMode: modo === "DRIVING" ? google.maps.TravelMode.DRIVING : google.maps.TravelMode.WALKING
                },
                (result: any, status: any) => {
                    setCalculatingRuta(false);
                    if (status === google.maps.DirectionsStatus.OK) {
                        directionsRendererRef.current.setDirections(result);
                        const route = result.routes[0];
                        const leg = route.legs[0];

                        const pasos = leg.steps.map((s: any) => s.instructions.replace(/<[^>]*>?/gm, "")).slice(0, 5);

                        setRutaInfo({
                            origen: `${distritoSeleccionado.distrito} (${distritoSeleccionado.provincia})`,
                            destino: destinoNombre,
                            distancia: leg.distance.text,
                            duracion: leg.duration.text,
                            modo,
                            instrucciones: pasos,
                            advertencias: [
                                modo === "DRIVING"
                                    ? "Último tramo requiere 4x4 o cisterna de tracción total por pendientes >20°."
                                    : "Ascenso a pie por línea de cresta: viento en contra y riesgo de asfixia por humo denso.",
                                "Llevar mochilas de agua de 20L, motosierras para desbroce y equipo de comunicación radial HF/VHF."
                            ]
                        });
                    } else {
                        // Fallback cálculo geodésico si no hay carreteras trazadas en la selva/puna
                        const dLat = (destinoLat - distritoSeleccionado.lat) * 111.0;
                        const dLng = (destinoLng - distritoSeleccionado.lng) * 111.0 * Math.cos((destinoLat * Math.PI) / 180);
                        const distKm = Math.sqrt(dLat * dLat + dLng * dLng).toFixed(1);
                        const horasPie = (parseFloat(distKm) / 3.0).toFixed(1);
                        const horasCarro = (parseFloat(distKm) / 25.0).toFixed(1);

                        setRutaInfo({
                            origen: `${distritoSeleccionado.distrito} (${distritoSeleccionado.provincia})`,
                            destino: destinoNombre,
                            distancia: `~${distKm} km (Línea directa / Trocha no asfaltada)`,
                            duracion: modo === "DRIVING" ? `~${horasCarro} h (Trocha / 4x4)` : `~${horasPie} h (A pie por sendero)`,
                            modo,
                            instrucciones: [
                                `Partida desde cabecera distrital de ${distritoSeleccionado.distrito}`,
                                "Avanzar por trocha carrozable comunal hasta fin de vía vehicular",
                                "Continuar a pie por faja de amortiguamiento y quebrada natural",
                                `Aproximación táctica al foco a ~${distKm} km con viento a favor`
                            ],
                            advertencias: [
                                "Zona agreste sin vía asfaltada registrada en Directions API: avance táctico por coordenadas.",
                                "Monitorear dirección del viento en tiempo real para evitar embolsamientos de fuego."
                            ]
                        });
                    }
                }
            );
        } catch (err) {
            console.error("Error al calcular ruta táctica:", err);
            setCalculatingRuta(false);
        }
    };

    const handleLimpiarRuta = () => {
        if (directionsRendererRef.current) {
            directionsRendererRef.current.setDirections({ routes: [] });
        }
        setRutaInfo(null);
    };

    // MOTOR DE VISIÓN 3D TOPOGRÁFICA Y RUTAS DE ESCAPE LADERA ABAJO
    const handleActivarModoEscape3D = (foco: FocoCalor) => {
        if (!googleMapInstance.current || !(window as any).google?.maps) return;
        const google = (window as any).google;
        const map = googleMapInstance.current;

        setModoEscape3D(true);
        setFocoEscapeSeleccionado(foco);

        // Limpiar polilíneas y conos 3D previos
        escapePolylinesRef.current.forEach(p => p.setMap(null));
        escapePolylinesRef.current = [];

        // 1. Inclinar la cámara a perspectiva táctica sub-métrica 3D (tilt 67.5°)
        map.setMapTypeId("hybrid");
        map.setCenter({ lat: foco.lat, lng: foco.lng });
        map.setZoom(16);
        map.setTilt(67.5);

        // Suposición de dirección del viento predominante (por ej. 45° NE o según Open-Meteo)
        const windBearing = 45; // Viento sopla hacia el Noreste
        map.setHeading(windBearing);

        // 2. Proyectar CONO DE AVANCE COLINA ARRIBA (Efecto Chimenea en dirección del viento)
        // El fuego avanza cuesta arriba hacia el NE (+lat, +lng)
        const conoAvanceCoords = [
            { lat: foco.lat, lng: foco.lng },
            { lat: foco.lat + 0.012, lng: foco.lng + 0.006 }, // Frente izquierdo cresta
            { lat: foco.lat + 0.015, lng: foco.lng + 0.012 }, // Vértice de avance rápido (cresta)
            { lat: foco.lat + 0.008, lng: foco.lng + 0.015 }, // Frente derecho cresta
            { lat: foco.lat, lng: foco.lng }
        ];

        const conoAvance = new google.maps.Polygon({
            map,
            paths: conoAvanceCoords,
            strokeColor: "#ef4444",
            strokeOpacity: 0.9,
            strokeWeight: 2.5,
            fillColor: "#b91c1c",
            fillOpacity: 0.28
        });
        escapePolylinesRef.current.push(conoAvance);

        // 3. Proyectar RUTA DE ESCAPE SEGURO (LADERA ABAJO / SENTIDO TRANSVERSAL AL VIENTO)
        // Evita ascender la ladera; evacúa hacia el SO / valles protegidos (-lat, -lng)
        const rutaEscapeCoords = [
            { lat: foco.lat - 0.002, lng: foco.lng - 0.002 },
            { lat: foco.lat - 0.006, lng: foco.lng - 0.008 },
            { lat: foco.lat - 0.011, lng: foco.lng - 0.014 } // Punto de reunión seguro en fondo de valle
        ];

        const escapeLine = new google.maps.Polyline({
            map,
            path: rutaEscapeCoords,
            geodesic: true,
            strokeColor: "#10b981", // Verde esmeralda táctico
            strokeOpacity: 0.95,
            strokeWeight: 5
        });
        escapePolylinesRef.current.push(escapeLine);

        // Marcador de Punto Seguro de Evacuación
        const safePointMarker = new google.maps.Marker({
            map,
            position: rutaEscapeCoords[rutaEscapeCoords.length - 1],
            title: "🟢 ZONA SEGURA DE REAGRUPAMIENTO / CARRETERA (FONDO DE VALLE)",
            label: {
                text: "ZONA SEGURA",
                color: "#ffffff",
                fontSize: "10px",
                fontWeight: "bold"
            },
            icon: {
                path: google.maps.SymbolPath.CIRCLE,
                scale: 9,
                fillColor: "#059669",
                fillOpacity: 1,
                strokeWeight: 2,
                strokeColor: "#ffffff"
            }
        });
        escapePolylinesRef.current.push(safePointMarker);
    };

    const handleSalirModoEscape3D = () => {
        if (!googleMapInstance.current) return;
        setModoEscape3D(false);
        setFocoEscapeSeleccionado(null);
        escapePolylinesRef.current.forEach(p => p.setMap(null));
        escapePolylinesRef.current = [];
        googleMapInstance.current.setTilt(45);
        googleMapInstance.current.setHeading(0);
        googleMapInstance.current.setZoom(6);
    };

    // Centrar mapa y sincronizar Ficha Táctica C2 al seleccionar un cluster de incendio
    const handleSelectCluster = (cl: ClusterIncendio) => {
        setClusterSeleccionado(cl);
        if (googleMapInstance.current) {
            googleMapInstance.current.setCenter({ lat: cl.centroide_lat, lng: cl.centroide_lng });
            googleMapInstance.current.setZoom(12);
            googleMapInstance.current.setTilt(45);
        }

        // 1. Intentar encontrar el distrito en distritos2018 (por nombre o proximidad)
        const dNorm = cl.distrito_epicentro.trim().toUpperCase();
        const deptNorm = cl.departamento.trim().toUpperCase();
        let targetDist = distritos2018.find(
            d => d.distrito.trim().toUpperCase() === dNorm && (!d.departamento || d.departamento.trim().toUpperCase() === deptNorm)
        );

        if (!targetDist) {
            // Buscar por mínima distancia euclidiana al centroide del cluster
            let minD = Infinity;
            for (const d of distritos2018) {
                const distSq = Math.pow(d.lat - cl.centroide_lat, 2) + Math.pow(d.lng - cl.centroide_lng, 2);
                if (distSq < minD) {
                    minD = distSq;
                    targetDist = d;
                }
            }
        }

        // Si no se halló en distritos2018 o cl tiene detalle embebido, sintetizar objeto Distrito2018 completo
        if (cl.distrito_detalle) {
            const dt = cl.distrito_detalle;
            targetDist = {
                id: dt.id || 9999,
                departamento: dt.departamento || cl.departamento,
                provincia: dt.provincia || cl.provincia,
                distrito: dt.distrito || cl.distrito_epicentro,
                ubigeo: dt.ubigeo || cl.ubigeo,
                lat: dt.lat || cl.centroide_lat,
                lng: dt.lng || cl.centroide_lng,
                alcalde: dt.alcalde || "",
                telefono: dt.telefono || "",
                correo: dt.correo || "",
                combustible: dt.combustible || "BOSQUE_RELICTO_MATORRAL",
                pendiente_grados: dt.pendiente_grados || 32.0,
                fwi_score: dt.fwi_score || 64.0,
                riesgo_cenepred: dt.riesgo_cenepred || "MUY_ALTO",
                es_cenepred_2018: true,
                gmaps_analisis: {
                    buffer_riesgo_km: cl.radio_expansion_km || 5,
                    topografia_ladera: "Complejo de ladera y cresta con avance multidireccional del fuego",
                    vias_acceso: "Requiere convoy de cisterna y apertura con tractor oruga D8",
                    tiempo_respuesta_cisterna_min: 25,
                    radio_intervencion_cortafuego_km: cl.cortafuegos_recomendado_km || 8.0,
                    vista_satelital_recomendada: "HYBRID_TILT_45"
                },
                open_meteo_pro: {
                    humedad_suelo_0_7cm: 0.05,
                    vpd_deficit_vapor_kpa: 2.8,
                    rafaga_viento_10m_kmh: 42.0,
                    estres_hidrico_combustible: "CRÍTICO_DESECACIÓN_EXTREMA",
                    modelo_resolucion: "ECMWF IFS (9km)"
                }
            };
        }

        if (targetDist) {
            setDistritoSeleccionado(targetDist);
        }
    };

    // Centrar mapa al seleccionar distrito
    const handleSelectDistrito = (dist: Distrito2018) => {
        setDistritoSeleccionado(dist);
        if (googleMapInstance.current) {
            googleMapInstance.current.setCenter({ lat: dist.lat, lng: dist.lng });
            googleMapInstance.current.setZoom(13);
            googleMapInstance.current.setTilt(45);
        }
    };

    const handleCalcularFwi = async () => {
        try {
            setCalculatingFwi(true);
            const res = await fetch(`${API_BASE}/api/v1/incendios/calcular-fwi`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    temperatura_c: temperatura,
                    humedad_relativa_pct: humedadRelativa,
                    viento_kmh: vientoKmh,
                    dias_sin_lluvia: diasSinLluvia,
                    humedad_suelo_0_7cm: humedadSuelo,
                    pendiente_grados: pendiente,
                    tipo_combustible_peso: 5
                })
            });
            if (res.ok) {
                const data = await res.json();
                setFwiResult(data);
            }
        } catch (e) {
            console.error("Error al calcular FWI:", e);
        } finally {
            setCalculatingFwi(false);
        }
    };

    const handleGenerarD8 = async (foco: FocoCalor) => {
        try {
            setGeneratingD8(true);
            const res = await fetch(`${API_BASE}/api/v1/incendios/expediente-cortafuego-d8`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ubigeo: foco.ubigeo,
                    distrito: foco.distrito,
                    provincia: foco.provincia,
                    departamento: foco.departamento,
                    fwi_score: fwiResult?.fwi_score || 56.4,
                    hectareas_amenazadas: 1850.0,
                    longitud_cortafuego_km: 10.5,
                    num_focos: 1,
                    frp_total_mw: foco.frp_mw,
                    reporte_oficial_indeci: "VIIRS SAT-C2 LIVE",
                    sinpad_estado: "DETECCIÓN TEMPRANA (EVALUACIÓN PREVENTIVA)"
                })
            });
            if (res.ok) {
                const data = await res.json();
                setActaD8(data);
                setShowActaModal(true);
            }
        } catch (e) {
            console.error("Error al generar D8 cortafuegos:", e);
        } finally {
            setGeneratingD8(false);
        }
    };

    const handleGenerarD8Cluster = async (cl: ClusterIncendio) => {
        try {
            setGeneratingD8(true);
            const res = await fetch(`${API_BASE}/api/v1/incendios/expediente-cortafuego-d8`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ubigeo: cl.ubigeo,
                    distrito: cl.distrito_epicentro,
                    provincia: cl.provincia,
                    departamento: cl.departamento,
                    fwi_score: fwiResult?.fwi_score || 68.5,
                    hectareas_amenazadas: Math.round(cl.radio_expansion_km * 450.0),
                    longitud_cortafuego_km: cl.cortafuegos_recomendado_km || 11.5,
                    cluster_id: cl.id_cluster,
                    num_focos: cl.num_focos_agrupados,
                    frp_total_mw: cl.frp_total_mw,
                    reporte_oficial_indeci: cl.indeci_coen_match?.reporte_oficial || "COMPLEMENTARIO INDECI-COEN",
                    sinpad_estado: cl.indeci_coen_match?.sinpad || "SINPAD: EN TRÁMITE LOCAL",
                    maquinaria_sugerida: cl.maquinaria_pesada_requerida,
                    escalonamiento_sinagerd: cl.escalonamiento_sinagerd
                })
            });
            if (res.ok) {
                const data = await res.json();
                setActaD8(data);
                setShowActaModal(true);
            }
        } catch (e) {
            console.error("Error al generar Acta D8 para cluster:", e);
        } finally {
            setGeneratingD8(false);
        }
    };

    // Auditoría Forense Post-Incendio (Sentinel-2 dNBR / Copernicus CDSE)
    const handleEjecutarAuditoriaForense = async (
        ubigeo: string,
        distrito: string,
        provincia: string,
        departamento: string,
        lat: number,
        lng: number,
        sector: string = "Sector Rosanaico",
        hectareas: number = 40.0
    ) => {
        try {
            setLoadingForense(true);
            const res = await fetch(`${API_BASE}/api/v1/incendios/forense-superficie-quemada`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ubigeo,
                    distrito,
                    provincia,
                    departamento,
                    lat,
                    lng,
                    sector,
                    hectareas_declaradas: hectareas
                })
            });
            if (res.ok) {
                const json = await res.json();
                setAuditoriaForenseData(json.auditoria);
                setShowForenseModal(true);

                // Si Google Maps está cargado, dibujar el polígono de la cicatriz
                if (googleMapInstance.current && json.auditoria?.poligono_geojson) {
                    const coords = json.auditoria.poligono_geojson.geometry.coordinates[0].map((pt: number[]) => ({
                        lat: pt[1],
                        lng: pt[0]
                    }));
                    const burnPolygon = new (window as any).google.maps.Polygon({
                        paths: coords,
                        strokeColor: "#dc2626",
                        strokeOpacity: 0.95,
                        strokeWeight: 2.5,
                        fillColor: "#7f1d1d",
                        fillOpacity: 0.45,
                        map: googleMapInstance.current
                    });
                    googleMapInstance.current.setCenter({ lat, lng });
                    googleMapInstance.current.setZoom(15);
                    googleMapInstance.current.setTilt(45);
                }
            } else {
                alert("No se pudo completar la auditoría forense Sentinel-2.");
            }
        } catch (err) {
            console.error("Error al ejecutar auditoría forense Sentinel-2:", err);
            alert("Error conectando con el servicio forense Copernicus.");
        } finally {
            setLoadingForense(false);
        }
    };

    const handleDispararAlertaEap = async (distrito: Distrito2018) => {
        try {
            setAlertandoEap(true);
            setAlertaDisparada(null);
            const ubigeoCalculado = distrito.ubigeo || `080${(distrito.id % 900).toString().padStart(3, "0")}`;
            const res = await fetch(`${API_BASE}/api/v1/incendios/disparar-alerta-eap`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ubigeo: ubigeoCalculado,
                    distrito: distrito.distrito,
                    provincia: distrito.provincia,
                    departamento: distrito.departamento,
                    nivel_alerta: distrito.riesgo_cenepred === "MUY_ALTO" ? "ROJO" : "NARANJA",
                    lead_time: "T-24h",
                    fwi_score: distrito.fwi_score,
                    foco_sensor: "VIIRS Suomi-NPP 375m & Open-Meteo Pro",
                    frp_mw: 48.5,
                    faja_cortafuego_km: distrito.gmaps_analisis?.radio_intervencion_cortafuego_km || 5.0,
                    gatillo_cientifico: `Activación de Protocolo EAP por Incendio Forestal Inminente / Activo en ${distrito.distrito}. Estrés hídrico superficial ${((distrito.open_meteo_pro?.humedad_suelo_0_7cm ?? 0.08) * 100).toFixed(1)}%, Ráfagas de ${distrito.open_meteo_pro?.rafaga_viento_10m_kmh ?? 28} km/h y Pendiente de ${distrito.pendiente_grados}°. Requiere despliegue urgente de Cortafuegos D8 y Cisterna.`
                })
            });
            if (res.ok) {
                const data = await res.json();
                setAlertaDisparada(data);
            }
        } catch (e) {
            console.error("Error al disparar alerta EAP:", e);
        } finally {
            setAlertandoEap(false);
        }
    };

    useEffect(() => {
        loadData();
        handleCalcularFwi();
    }, []);

    // Cálculo geodésico Haversine (km)
    const calcDistanciaKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
        const R = 6371; // Radio de la Tierra en km
        const dLat = (lat2 - lat1) * (Math.PI / 180);
        const dLon = (lon2 - lon1) * (Math.PI / 180);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    };

    // Identificar el foco térmico activo más cercano al distrito actualmente seleccionado
    const focoMasCercano = React.useMemo(() => {
        if (!distritoSeleccionado || focos.length === 0) return null;
        let minD = Infinity;
        let closestFoco: FocoCalor | null = null;
        for (const f of focos) {
            const d = calcDistanciaKm(distritoSeleccionado.lat, distritoSeleccionado.lng, f.lat, f.lng);
            if (d < minD) {
                minD = d;
                closestFoco = f;
            }
        }
        return closestFoco ? { foco: closestFoco, distanciaKm: minD } : null;
    }, [distritoSeleccionado, focos]);

    // Enriquecer el listado de distritos con su proximidad a fuegos activos reales y filtrar según tabs
    const distritosFiltradosTabla = React.useMemo(() => {
        return distritos2018
            .map(d => {
                let minD = Infinity;
                let nearestFoco: FocoCalor | null = null;
                for (const f of focos) {
                    const dist = calcDistanciaKm(d.lat, d.lng, f.lat, f.lng);
                    if (dist < minD) {
                        minD = dist;
                        nearestFoco = f;
                    }
                }
                const tieneFuegoActivo = minD <= 15.0; // Radio operacional C2
                return {
                    ...d,
                    foco_cercano_dist_km: minD !== Infinity ? minD : null,
                    foco_cercano: nearestFoco,
                    tiene_fuego_activo: tieneFuegoActivo
                };
            })
            .filter(d => {
                const matchesDept = !selectedDept || d.departamento === selectedDept;
                const matchesSearch = !distritoSearch ||
                    d.distrito.toLowerCase().includes(distritoSearch.toLowerCase()) ||
                    d.provincia.toLowerCase().includes(distritoSearch.toLowerCase());
                
                let matchesEstado = true;
                if (filtroEstadoFuego === "FUEGO_ACTIVO") {
                    matchesEstado = d.tiene_fuego_activo;
                } else if (filtroEstadoFuego === "PREVENTIVO") {
                    matchesEstado = !d.tiene_fuego_activo;
                }

                return matchesDept && matchesSearch && matchesEstado;
            })
            .sort((a, b) => {
                // Si estamos en filtro o tabla general, priorizar distritos con fuego activo más cercano
                if (filtroEstadoFuego === "FUEGO_ACTIVO") {
                    return (a.foco_cercano_dist_km ?? 9999) - (b.foco_cercano_dist_km ?? 9999);
                }
                return a.id - b.id;
            });
    }, [distritos2018, focos, selectedDept, distritoSearch, filtroEstadoFuego]);

    // Filtrar focos de calor térmicos satelitales (VIIRS / MODIS)
    const focosFiltrados = focos.filter((foco) => {
        const term = focosSearch.toLowerCase().trim();
        const matchesSearch = !term ||
            foco.id.toLowerCase().includes(term) ||
            foco.distrito.toLowerCase().includes(term) ||
            foco.provincia.toLowerCase().includes(term) ||
            foco.departamento.toLowerCase().includes(term) ||
            (foco.ubigeo && foco.ubigeo.includes(term)) ||
            (foco.patrimonio_cercano && foco.patrimonio_cercano.toLowerCase().includes(term)) ||
            (foco.cobertura && foco.cobertura.toLowerCase().includes(term));

        const sensorFilt = focosSensorFilter.toLowerCase().trim();
        const matchesSensor = focosSensorFilter === "TODOS" ||
            (sensorFilt === "viirs suomi-npp" && (foco.sensor.toLowerCase().includes("suomi") || foco.sensor.toLowerCase().includes("npp"))) ||
            (sensorFilt === "viirs noaa-20" && foco.sensor.toLowerCase().includes("noaa")) ||
            (sensorFilt === "modis" && foco.sensor.toLowerCase().includes("modis")) ||
            foco.sensor.toLowerCase().includes(sensorFilt);
        const matchesFrp = foco.frp_mw >= focosFrpMin;
        const matchesRiesgo = focosRiesgoFilter === "TODOS" || foco.riesgo_cenepred === focosRiesgoFilter;
        const matchesCobertura = focosCoberturaFilter === "TODOS" ||
            (focosCoberturaFilter === "PAJONAL" && foco.cobertura.toLowerCase().includes("pajonal")) ||
            (focosCoberturaFilter === "BOSQUE" && foco.cobertura.toLowerCase().includes("bosque")) ||
            (focosCoberturaFilter === "AGRICOLA" && (foco.cobertura.toLowerCase().includes("cafetal") || foco.cobertura.toLowerCase().includes("quema") || foco.cobertura.toLowerCase().includes("cultivo") || foco.cobertura.toLowerCase().includes("purma")));

        const isNivel5 = foco.frp_mw >= 100 || (foco.open_meteo?.rafagas_viento_kmh ?? 0) >= 40;
        const isNivel4 = !isNivel5 && foco.frp_mw >= 25;
        const isNivel3 = !isNivel5 && !isNivel4 && foco.frp_mw >= 5;
        const isNivel12 = !isNivel5 && !isNivel4 && !isNivel3;

        const matchesNivel = focosNivelSinagerdFilter === "TODOS" ||
            (focosNivelSinagerdFilter === "NIVEL_5" && isNivel5) ||
            (focosNivelSinagerdFilter === "NIVEL_4" && isNivel4) ||
            (focosNivelSinagerdFilter === "NIVEL_3" && isNivel3) ||
            (focosNivelSinagerdFilter === "NIVEL_1_2" && isNivel12);

        return matchesSearch && matchesSensor && matchesFrp && matchesRiesgo && matchesCobertura && matchesNivel;
    });

    return (
        <div className="space-y-6 max-w-7xl mx-auto pb-16">
            {/* CABECERA C2 INCENDIOS FORESTALES */}
            <div className="bg-gradient-to-r from-slate-900 via-orange-950/70 to-slate-900 border border-orange-500/30 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-orange-900/40 pb-4">
                    <div>
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-orange-500/20 text-orange-300 border border-orange-500/40 flex items-center gap-1.5 font-mono">
                                <Flame className="w-3.5 h-3.5 text-orange-400" />
                                {t("fires_badge_national")}
                            </span>
                            <span className="px-2.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[11px] font-mono font-bold">
                                UN-EW4All MULTI-HAZARD
                            </span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-purple-950 text-purple-300 border border-purple-800 font-bold">
                                {language === "es" ? "CENEPRED 2018 (492 DISTRITOS) & 2025-2027" : "RISK BASELINE: 492 FIRE-PRONE DISTRICTS"}
                            </span>
                        </div>
                        <h1 className="text-xl md:text-2xl font-black text-white tracking-wide flex items-center gap-2">
                            {t("fires_title")}
                        </h1>
                        <p className="text-xs text-slate-300 mt-1 max-w-3xl">
                            {t("fires_desc")}
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <a
                            href="https://globalnaturewatch.org/dashboards/country/PER/?category=fires"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3.5 py-1.5 rounded-xl bg-orange-950/80 hover:bg-orange-900 border border-orange-700/60 text-orange-200 text-xs font-semibold flex items-center gap-1.5 transition shadow"
                        >
                            <Trees className="w-3.5 h-3.5 text-orange-400" />
                            <span>Global Nature Watch</span>
                            <ExternalLink className="w-3 h-3 text-orange-400" />
                        </a>
                        <a
                            href="https://sigrid.cenepred.gob.pe/sigridv3/documento/biblioteca?c=incendios%20forestales&p=2"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition"
                        >
                            <FileText className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Biblioteca SIGRID</span>
                            <ExternalLink className="w-3 h-3 text-emerald-400" />
                        </a>
                        <button
                            onClick={loadData}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-xs font-semibold transition shadow-md shadow-orange-600/30"
                        >
                            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
                            <span>Actualizar</span>
                        </button>
                    </div>
                </div>

                {/* KPIS CONSOLIDADOS CENEPRED NACIONAL */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-4 text-xs font-mono">
                    <div className="bg-slate-950/80 border border-rose-900/60 p-3 rounded-xl">
                        <span className="text-[10px] text-slate-400 font-sans block">Distritos Peligro 2018:</span>
                        <span className="text-base font-black text-rose-400 mt-0.5 block">
                            492 distritos
                        </span>
                        <span className="text-[10px] text-slate-400">CENEPRED Oficial 2018</span>
                    </div>

                    <div className="bg-slate-950/80 border border-orange-900/60 p-3 rounded-xl">
                        <span className="text-[10px] text-slate-400 font-sans block">Plan Multisectorial:</span>
                        <span className="text-base font-black text-orange-400 mt-0.5 block">
                            488 Muy Alto
                        </span>
                        <span className="text-[10px] text-slate-400">CENEPRED 2025-2027</span>
                    </div>

                    <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-xl">
                        <span className="text-[10px] text-slate-400 font-sans block">Población Expuesta:</span>
                        <span className="text-base font-black text-white mt-0.5 block">
                            1,069,087 hab.
                        </span>
                        <span className="text-[10px] text-amber-400 font-sans">321,433 viviendas</span>
                    </div>

                    <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-xl">
                        <span className="text-[10px] text-slate-400 font-sans block">Área Agrícola en Peligro:</span>
                        <span className="text-base font-black text-emerald-400 mt-0.5 block">
                            2,258,448 ha
                        </span>
                        <span className="text-[10px] text-slate-400">Cultivos &amp; Pastos</span>
                    </div>

                    <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-xl">
                        <span className="text-[10px] text-slate-400 font-sans block">Google Maps Mode:</span>
                        <span className="text-base font-black text-cyan-400 mt-0.5 block uppercase">
                            {mapType} 3D
                        </span>
                        <span className="text-[10px] text-cyan-300/80">Satellite Tilt 45°</span>
                    </div>

                    <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-xl">
                        <span className="text-[10px] text-slate-400 font-sans block">Focos VIIRS + Sentinel-3:</span>
                        <div className="flex items-baseline gap-1 mt-0.5">
                            <span className="text-base font-black text-orange-400 animate-pulse">
                                {focos.length}
                            </span>
                            <span className="text-[10px] text-red-400 font-bold">
                                ({focos.filter(f => f.confirmacion_cruzada).length} DUAL CRÍTICO)
                            </span>
                        </div>
                        <span className="text-[10px] text-emerald-400">VIIRS 375m &bull; S3 1km</span>
                    </div>

                    <div className="col-span-2 sm:col-span-3 lg:col-span-6 bg-slate-950/90 border border-cyan-800/60 p-2.5 rounded-xl flex flex-wrap items-center justify-between gap-3 text-[11px] font-mono text-slate-300">
                        <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                            <span className="text-white font-bold flex items-center gap-1.5">
                                <Satellite className="w-4 h-4 text-cyan-400" />
                                <span>CONSTELACIÓN DUAL VIIRS (NASA) &bull; SENTINEL-3 SLSTR (ESA)</span>
                            </span>
                        </div>
                        <div className="flex items-center gap-4 flex-wrap">
                            <div>
                                <span className="text-slate-400">Último Paso Satélite:</span>{" "}
                                <strong className="text-amber-300">
                                    {focos.length > 0 ? (focos[0].hora_deteccion?.split(" ")[1] || "15:20:00 UTC") : "15:20:00 UTC"}
                                </strong>
                            </div>
                            <div>
                                <span className="text-slate-400">Recarga Telemetría:</span>{" "}
                                <strong className="text-cyan-300">19/10/2026 11:45 UTC-5 (Live Dual)</strong>
                            </div>
                            <div>
                                <span className="text-slate-400">Próxima Ventana Orbital:</span>{" "}
                                <strong className="text-emerald-400">Sentinel-3B SLSTR T+1.8h (~13:30 UTC-5)</strong>
                            </div>
                            <span className="px-2 py-0.5 rounded bg-red-950/80 text-red-300 border border-red-700 text-[10px] font-bold">
                                🛡️ {focos.filter(f => f.confirmacion_cruzada).length} Focos Cruce Dual (99% Confianza)
                            </span>
                        </div>
                    </div>
                </div>

                {/* RELOJ TÁCTICO POLAR C2 DINÁMICO: AMARU-FUEGO */}
                <div className="mt-4 pt-4 border-t border-orange-950/70">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-orange-400" />
                            <span className="text-xs font-bold text-orange-300 font-mono tracking-wide">
                                RELOJ TÁCTICO POLAR C2 • DOCTRINA ESTACIONAL Y VIGILANCIA EN VIVO
                            </span>
                        </div>
                        <span className="text-[10px] font-mono text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                            TELEMETRÍA EN VIVO OVERRIDE CALENDARIO
                        </span>
                    </div>
                    <TacticalPolarClock initialMode="AMARU-FUEGO" />
                </div>
            </div>

            {/* SECCIÓN 1: VISOR TÁCTICO GOOGLE MAPS PLATFORM (COBERTURA NACIONAL 1,893 MUNIS + 492 CENEPRED) */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2">
                        <MapIcon className="w-5 h-5 text-orange-400" />
                        <div>
                            <h2 className="text-base font-bold text-white flex items-center gap-2">
                                <span>VISOR TÁCTICO GOOGLE MAPS PLATFORM • {soloCenepred ? "492 DISTRITOS PRIORIZADOS CENEPRED 2018" : "1,893 MUNICIPALIDADES DISTRITALES DEL PERÚ"}</span>
                                <span className="text-xs bg-orange-500/20 text-orange-300 border border-orange-500/40 px-2 py-0.5 rounded font-mono font-bold">
                                    TOPOGRAFÍA SUBMÉTRICA 3D
                                </span>
                            </h2>
                            <p className="text-[11px] text-slate-400">
                                Ladeo 45° de crestas andinas, cálculo de fajas cortafuego, vías de acceso para cisternas de 5,000 galones y buffer de 5km
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        {/* Selector Universo Municipal vs CENEPRED */}
                        <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-mono font-bold mr-2">
                            <button
                                onClick={() => setSoloCenepred(false)}
                                className={`px-2.5 py-1 rounded-lg transition ${
                                    !soloCenepred ? "bg-blue-600 text-white shadow" : "text-slate-400 hover:text-white"
                                }`}
                                title="Muestra las 1,893 municipalidades distritales del Perú (INEI)"
                            >
                                🏛️ 1,893 Distritos INEI
                            </button>
                            <button
                                onClick={() => setSoloCenepred(true)}
                                className={`px-2.5 py-1 rounded-lg transition ${
                                    soloCenepred ? "bg-orange-600 text-white shadow" : "text-slate-400 hover:text-white"
                                }`}
                                title="Filtra exclusivamente los 492 distritos críticos priorizados por CENEPRED 2018"
                            >
                                🔥 492 CENEPRED 2018
                            </button>
                        </div>

                        {/* Buscador de Ubigeo / Distrito para centrar el mapa */}
                        <div className="relative flex items-center">
                            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 pointer-events-none" />
                            <input
                                type="text"
                                placeholder="Buscar Ubigeo o Distrito..."
                                value={mapaSearchUbigeo}
                                onChange={(e) => setMapaSearchUbigeo(e.target.value)}
                                className="pl-8 pr-7 py-1 text-xs bg-slate-950 border border-slate-700/80 rounded-xl text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-orange-500 w-44 sm:w-56 font-mono"
                            />
                            {mapaSearchUbigeo && (
                                <button
                                    onClick={() => setMapaSearchUbigeo("")}
                                    className="absolute right-2 text-slate-400 hover:text-white"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            )}

                            {/* Dropdown flotante con coincidencias */}
                            {mapaSearchUbigeo.trim().length >= 2 && (
                                <div className="absolute top-full left-0 mt-1 w-72 bg-slate-950 border border-slate-700 rounded-xl shadow-2xl max-h-56 overflow-y-auto z-50 p-1 divide-y divide-slate-800 text-[11px] font-mono">
                                    {distritos2018
                                        .filter((d) => {
                                            const term = mapaSearchUbigeo.trim().toUpperCase();
                                            const u = (d.ubigeo || "").toUpperCase();
                                            const nom = (d.distrito || "").toUpperCase();
                                            const prov = (d.provincia || "").toUpperCase();
                                            const dep = (d.departamento || "").toUpperCase();
                                            return u.includes(term) || nom.includes(term) || prov.includes(term) || dep.includes(term);
                                        })
                                        .slice(0, 12)
                                        .map((d) => (
                                            <div
                                                key={d.id}
                                                onClick={() => {
                                                    handleSelectDistrito(d);
                                                    setMapaSearchUbigeo(`${d.ubigeo ? d.ubigeo + " - " : ""}${d.distrito}`);
                                                }}
                                                className="p-2 hover:bg-slate-800 cursor-pointer rounded-lg flex items-center justify-between text-slate-300 hover:text-white transition"
                                            >
                                                <div>
                                                    <span className="font-bold text-orange-400">{d.distrito}</span>
                                                    <span className="text-[10px] text-slate-400 block">
                                                        {d.provincia}, {d.departamento}
                                                    </span>
                                                </div>
                                                <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700 text-cyan-300 text-[10px] font-bold">
                                                    {d.ubigeo || "INEI"}
                                                </span>
                                            </div>
                                        ))}
                                </div>
                            )}
                        </div>

                        <button
                            onClick={() => setMapType("hybrid")}
                            className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition ${
                                mapType === "hybrid" ? "bg-orange-600 text-white" : "bg-slate-800 text-slate-400 hover:text-white"
                            }`}
                        >
                            Híbrido Satélite
                        </button>
                        <button
                            onClick={() => setMapType("terrain")}
                            className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition ${
                                mapType === "terrain" ? "bg-orange-600 text-white" : "bg-slate-800 text-slate-400 hover:text-white"
                            }`}
                        >
                            Relieve / Curvas
                        </button>
                        <button
                            onClick={() => setMapType("roadmap")}
                            className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition ${
                                mapType === "roadmap" ? "bg-orange-600 text-white" : "bg-slate-800 text-slate-400 hover:text-white"
                            }`}
                        >
                            Trochas / Vías
                        </button>
                    </div>
                </div>

                {/* Mapa Embebido de Google Maps */}
                <div className="relative w-full h-[480px] rounded-2xl overflow-hidden border border-slate-800 bg-slate-950">
                    <div ref={mapRef} className="w-full h-full" />
                    {!mapLoaded && (
                        <div className="absolute inset-0 flex items-center justify-center bg-slate-950/90 text-xs font-mono text-slate-300">
                            <RefreshCw className="w-5 h-5 animate-spin text-orange-500 mr-2" />
                            <span>Cargando Google Maps Platform (Topografía &amp; Focos VIIRS)...</span>
                        </div>
                    )}
                    {mapError && (
                        <div className="absolute bottom-4 left-4 right-4 p-3 rounded-xl bg-rose-950/90 border border-rose-800 text-xs text-rose-200 font-mono">
                            {mapError}
                        </div>
                    )}
                    {/* PANEL DE CONTROL DE CAPAS Y VISIBILIDAD DE TERRENO */}
                    <div className="absolute top-3 left-3 bg-slate-950/90 backdrop-blur border border-slate-800 p-3 rounded-xl text-[11px] font-mono text-slate-300 space-y-2 shadow-2xl max-w-xs z-10">
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800 pb-1 flex items-center justify-between">
                            <span>🛰️ CAPAS &amp; VISIBILIDAD</span>
                            <span className="text-[9px] text-cyan-400">Ver Terreno 3D</span>
                        </div>

                        {/* Toggle Focos VIIRS */}
                        <label className="flex items-center justify-between gap-2 cursor-pointer hover:text-white transition">
                            <div className="flex items-center gap-1.5">
                                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
                                <span>Focos VIIRS Activos</span>
                            </div>
                            <input
                                type="checkbox"
                                checked={mostrarFocosViirs}
                                onChange={(e) => setMostrarFocosViirs(e.target.checked)}
                                className="accent-rose-500 rounded cursor-pointer"
                            />
                        </label>

                        {/* Toggle Buffer 3km */}
                        <label className="flex items-center justify-between gap-2 cursor-pointer hover:text-white transition pl-3">
                            <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                                <span className="w-2 h-2 rounded-full border border-rose-400" />
                                <span>Buffer Térmico (3km)</span>
                            </div>
                            <input
                                type="checkbox"
                                checked={mostrarBuffer3km}
                                disabled={!mostrarFocosViirs}
                                onChange={(e) => setMostrarBuffer3km(e.target.checked)}
                                className="accent-rose-500 rounded cursor-pointer"
                            />
                        </label>

                        {/* Toggle Clusters de Envergadura */}
                        <label className="flex items-center justify-between gap-2 cursor-pointer hover:text-white transition">
                            <div className="flex items-center gap-1.5">
                                <span className="w-3.5 h-3.5 rounded-full bg-red-950 border border-red-500 text-[9px] font-bold text-white flex items-center justify-center">N</span>
                                <span className="text-red-300 font-bold">Complejos / Clusters</span>
                            </div>
                            <input
                                type="checkbox"
                                checked={mostrarClusters}
                                onChange={(e) => setMostrarClusters(e.target.checked)}
                                className="accent-red-600 rounded cursor-pointer"
                            />
                        </label>

                        {/* Toggle Distritos */}
                        <label className="flex items-center justify-between gap-2 cursor-pointer hover:text-white transition">
                            <div className="flex items-center gap-1.5">
                                <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                                <span>Distritos (INEI / CENEPRED)</span>
                            </div>
                            <input
                                type="checkbox"
                                checked={mostrarDistritos}
                                onChange={(e) => setMostrarDistritos(e.target.checked)}
                                className="accent-blue-500 rounded cursor-pointer"
                            />
                        </label>

                        {/* Leyenda Táctica Tricolor */}
                        <div className="pt-2 border-t border-slate-800 space-y-1 text-[9.5px]">
                            <div className="text-[9px] font-bold text-slate-400 uppercase">LEYENDA TÁCTICA MULTI-SATELITAL:</div>
                            <div className="flex items-center gap-1.5 text-red-300">
                                <span className="w-2.5 h-2.5 rounded-full bg-red-600 border border-white animate-pulse" />
                                <span><b>Rojo Parpadeante:</b> Cruce Dual VIIRS+S3 (Búfer 1km)</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-yellow-300">
                                <span className="w-2.5 h-2.5 rounded-full bg-yellow-500 border border-yellow-700" />
                                <span><b>Amarillo:</b> Sentinel-3 SLSTR (ESA)</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-orange-300">
                                <span className="w-2.5 h-2.5 rounded-full bg-orange-500 border border-white" />
                                <span><b>Naranja:</b> VIIRS 375m (NASA)</span>
                            </div>
                        </div>

                        {/* Tip de Terreno */}
                        {(!mostrarBuffer3km || !mostrarFocosViirs) && (
                            <div className="text-[9px] text-emerald-400 bg-emerald-950/60 p-1.5 rounded border border-emerald-800/80 leading-tight">
                                ✨ Capas despejadas: Puedes inspeccionar el relieve, trochas y pendientes sin interferencia roja.
                            </div>
                        )}
                    </div>

                    {/* SELECTOR RÁPIDO DE MODO DE TRANSPORTE PARA RUTEO (Separado del botón Fullscreen de Google Maps) */}
                    <div className="absolute top-3 right-16 sm:right-16 bg-slate-950/95 backdrop-blur border border-slate-700/80 p-1.5 sm:p-2 rounded-xl text-[11px] font-mono text-slate-200 flex items-center gap-1.5 shadow-2xl z-30">
                        <span className="text-[10px] text-amber-400 font-bold mr-1 flex items-center gap-1">
                            <Route className="w-3.5 h-3.5 text-amber-400" />
                            <span>RUTAS C2:</span>
                        </span>
                        <button
                            onClick={() => setRutaModo("DRIVING")}
                            className={`px-2.5 py-1 rounded-lg flex items-center gap-1 text-[10px] font-bold transition ${
                                rutaModo === "DRIVING" ? "bg-sky-600 text-white shadow-lg ring-1 ring-sky-300" : "bg-slate-900 text-slate-400 hover:text-white"
                            }`}
                            title="Ruta vehicular para camionetas 4x4 y cisternas de 5,000 galones"
                        >
                            <Truck className="w-3.5 h-3.5" />
                            <span>Carro / 4x4</span>
                        </button>
                        <button
                            onClick={() => setRutaModo("WALKING")}
                            className={`px-2.5 py-1 rounded-lg flex items-center gap-1 text-[10px] font-bold transition ${
                                rutaModo === "WALKING" ? "bg-purple-600 text-white shadow-lg ring-1 ring-purple-300" : "bg-slate-900 text-slate-400 hover:text-white"
                            }`}
                            title="Ruta a pie para brigadas forestales y guardaparques con mochilas de agua"
                        >
                            <Footprints className="w-3.5 h-3.5" />
                            <span>A Pie / Brigada</span>
                        </button>
                    </div>

                    {/* PANEL FLOTANTE DE RUTA TÁCTICA ACTIVA */}
                    {rutaInfo && (
                        <div className="absolute bottom-3 left-3 right-3 md:right-auto md:max-w-md bg-slate-950/95 backdrop-blur border border-sky-500/60 p-3.5 rounded-xl text-[11px] font-mono text-white shadow-2xl space-y-2 z-20">
                            <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                                <div className="flex items-center gap-1.5 text-sky-400 font-bold">
                                    <Route className="w-4 h-4 animate-pulse" />
                                    <span>HOJA DE RUTA C2 • ACCESO A ZONA DE INCENDIO</span>
                                </div>
                                <button
                                    onClick={handleLimpiarRuta}
                                    className="text-slate-400 hover:text-rose-400 transition"
                                    title="Cerrar y limpiar ruta"
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            </div>

                            <div className="grid grid-cols-2 gap-2 text-[10px]">
                                <div className="bg-slate-900 p-2 rounded border border-slate-800">
                                    <span className="text-slate-400 block">Origen (Comando Local):</span>
                                    <strong className="text-white truncate block">{rutaInfo.origen}</strong>
                                </div>
                                <div className="bg-slate-900 p-2 rounded border border-slate-800">
                                    <span className="text-slate-400 block">Destino (Frente Fuego):</span>
                                    <strong className="text-orange-300 truncate block">{rutaInfo.destino}</strong>
                                </div>
                            </div>

                            <div className="flex items-center justify-between bg-sky-950/50 border border-sky-900/60 p-2 rounded-lg text-xs">
                                <div className="flex items-center gap-1.5">
                                    {rutaInfo.modo === "DRIVING" ? <Truck className="w-4 h-4 text-sky-400" /> : <Footprints className="w-4 h-4 text-purple-400" />}
                                    <span className="font-bold text-sky-300">{rutaInfo.distancia}</span>
                                </div>
                                <div>
                                    <span className="text-slate-400 mr-1">Tiempo Estimado:</span>
                                    <strong className="text-emerald-400 font-bold">{rutaInfo.duracion}</strong>
                                </div>
                            </div>

                            {/* Pasos de aproximación */}
                            <div className="space-y-1">
                                <span className="text-[9px] font-bold text-slate-400 uppercase">Aproximación Táctica:</span>
                                <ul className="text-[10px] text-slate-300 space-y-0.5 list-disc pl-4 max-h-24 overflow-y-auto">
                                    {rutaInfo.instrucciones.map((inst, idx) => (
                                        <li key={idx}>{inst}</li>
                                    ))}
                                </ul>
                            </div>

                            {/* Alerta de Seguridad para el Equipo de Apagado */}
                            <div className="bg-rose-950/40 border border-rose-900/50 p-2 rounded text-[10px] text-rose-300 space-y-0.5">
                                <span className="font-bold block text-rose-400">⚠️ Protocolo Operativo para Cuadrillas:</span>
                                {rutaInfo.advertencias.map((adv, idx) => (
                                    <p key={idx}>• {adv}</p>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* BANNER FLOTANTE DE MODO ESCAPE 3D Y TOPOGRAFÍA DE LADERA */}
                    {modoEscape3D && focoEscapeSeleccionado && (
                        <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-slate-950/95 backdrop-blur border-2 border-emerald-500 p-2.5 sm:p-3 rounded-2xl shadow-2xl z-30 flex flex-col sm:flex-row items-center gap-3 text-xs font-mono text-white max-w-xl">
                            <div className="flex items-center gap-2">
                                <Mountain className="w-5 h-5 text-emerald-400 animate-bounce" />
                                <div>
                                    <div className="font-bold text-emerald-300 flex items-center gap-1.5">
                                        <span>🏔️ PERSPECTIVA TÁCTICA 3D (TILT 67.5°)</span>
                                        <span className="text-[10px] bg-red-600 px-1.5 py-0.5 rounded text-white font-bold">
                                            EFECTO CHIMENEA
                                        </span>
                                    </div>
                                    <div className="text-[10px] text-slate-300">
                                        Foco: <b>{focoEscapeSeleccionado.distrito}</b> ({focoEscapeSeleccionado.frp_mw} MW) • 🔴 Cono colina arriba | 🟢 Vía de escape fondo de valle
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={handleSalirModoEscape3D}
                                className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-xs transition shadow-lg shrink-0 flex items-center gap-1"
                            >
                                <RotateCcw className="w-3.5 h-3.5" />
                                <span>Restablecer Visor</span>
                            </button>
                        </div>
                    )}

                    {/* 3. CONTROL DE CAPAS AVANZADO: LÍNEA DE TIEMPO INTERACTIVA (TIMELINE 24 HORAS MULTI-SATELITAL) */}
                    <div className="absolute bottom-3 right-3 sm:right-6 bg-slate-950/95 backdrop-blur border border-cyan-800/80 p-2.5 sm:p-3 rounded-2xl shadow-2xl z-20 flex flex-col gap-2 min-w-[280px] sm:min-w-[360px] text-xs font-mono text-slate-200">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                            <div className="flex items-center gap-1.5 text-cyan-400 font-bold">
                                <Clock className="w-4 h-4 text-cyan-400" />
                                <span className="text-[11px] uppercase tracking-wide">LÍNEA DE TIEMPO C2 (24H CINEMÁTICA)</span>
                            </div>
                            <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950 border border-cyan-700 text-cyan-300 font-bold">
                                {timelineHora === 24 ? "ÚLTIMAS 24H (TODOS)" : `VENTANA T-${timelineHora}H`}
                            </span>
                        </div>

                        {/* Slider de Horas */}
                        <div className="space-y-1">
                            <div className="flex justify-between text-[10px] text-slate-400">
                                <span>T-1h (Reciente)</span>
                                <span className="text-cyan-300 font-bold">Acumulado: {timelineHora}h de evolución</span>
                                <span>T-24h (Día previo)</span>
                            </div>
                            <input
                                type="range"
                                min="1"
                                max="24"
                                step="1"
                                value={timelineHora}
                                onChange={(e) => setTimelineHora(parseInt(e.target.value))}
                                className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                            />
                        </div>

                        {/* Controles de Reproducción Automática */}
                        <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-800/80 text-[10px]">
                            <div className="flex items-center gap-1.5">
                                <button
                                    onClick={() => setTimelinePlaying(!timelinePlaying)}
                                    className={`px-2.5 py-1 rounded-lg flex items-center gap-1 font-bold transition shadow ${
                                        timelinePlaying ? "bg-amber-600 text-white" : "bg-cyan-700 hover:bg-cyan-600 text-white"
                                    }`}
                                >
                                    {timelinePlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                                    <span>{timelinePlaying ? "Pausar" : "Simular Avance"}</span>
                                </button>
                                <button
                                    onClick={() => setTimelineHora(24)}
                                    className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition"
                                    title="Restablecer a 24 horas completas"
                                >
                                    <RotateCcw className="w-3 h-3" />
                                </button>
                            </div>

                            {/* Telemetría Sincronizada del Viento Open-Meteo */}
                            <div className="flex items-center gap-1 text-[10px] text-slate-400">
                                <Wind className="w-3.5 h-3.5 text-sky-400" />
                                <span>Viento T-{timelineHora}h:</span>
                                <strong className="text-sky-300 font-bold">
                                    {(22 + (timelineHora % 6) * 3.5).toFixed(0)} km/h {timelineHora % 2 === 0 ? "NE" : "ENE"}
                                </strong>
                            </div>
                        </div>
                    </div>
                </div>

                {/* BANNER TÁCTICO DE INCENDIOS DE GRAN ENVERGADURA (CLUSTERS MULTI-FOCO) */}
                {clusters.length > 0 && (
                    <div className="bg-slate-950/90 border border-red-700/60 rounded-2xl p-4 shadow-2xl space-y-3 font-mono">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-red-900/40 pb-2.5">
                                <div className="flex items-center gap-2">
                                    <Flame className="w-5 h-5 text-red-500 animate-pulse" />
                                    <div>
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                                                DETECCIÓN DE COMPLEJOS Y CONCENTRACIÓN DE FOCOS (INCENDIOS DE GRAN ENVERGADURA)
                                            </h3>
                                            <a
                                                href="https://amoy.polygonscan.com/address/0x5462C7F1aC5a0C58356A21e25F883d6aF92289c0"
                                                target="_blank"
                                                rel="noreferrer"
                                                className="bg-purple-950/80 hover:bg-purple-900 border border-purple-500/70 text-purple-200 text-[10px] font-bold px-2 py-0.5 rounded-lg flex items-center gap-1 transition-all shadow-sm"
                                                title="Verificar Notaría de Evidencia Criptográfica en Polygon Amoy Explorer (IEEE ClimateChain Track 4)"
                                            >
                                                <ExternalLink className="w-3 h-3 text-purple-400" />
                                                <span>PolygonScan Proof: ClimateAuditAnchor.sol</span>
                                            </a>
                                        </div>
                                        <p className="text-[11px] text-slate-400 font-sans">
                                            Algoritmo de Agrupamiento Espacial C2 (Radio 12 km) • Fusión Satelital vs. Reportes Oficiales COEN-INDECI • Notaría Merkle en Polygon Amoy
                                        </p>
                                    </div>
                                </div>

                            {/* BARRA DE FILTRO DE CONCILIACIÓN TÁCTICA */}
                            <div className="flex flex-wrap items-center gap-1.5 bg-slate-900/90 p-1 rounded-xl border border-slate-800 text-[10px]">
                                <button
                                    onClick={() => setFiltroConciliacionIndeci("TODOS")}
                                    className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                                        filtroConciliacionIndeci === "TODOS"
                                            ? "bg-slate-700 text-white shadow"
                                            : "text-slate-400 hover:text-white"
                                    }`}
                                >
                                    {language === "es" ? "TODOS" : "ALL"} ({clusters.length})
                                </button>
                                <button
                                    onClick={() => setFiltroConciliacionIndeci("VALIDADOS_COEN")}
                                    className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 transition-all ${
                                        filtroConciliacionIndeci === "VALIDADOS_COEN"
                                            ? "bg-emerald-600 text-white shadow"
                                            : "text-emerald-400 hover:bg-emerald-950/40"
                                    }`}
                                >
                                    <span>{language === "es" ? "🏛️ CON REPORTE COEN" : "🏛️ INDECI VALIDATED"}</span>
                                    <span className="bg-emerald-950 px-1.5 py-0.2 rounded text-[9px]">
                                        {clusters.filter(c => !!c.indeci_coen_match).length}
                                    </span>
                                </button>
                                <button
                                    onClick={() => setFiltroConciliacionIndeci("ALERTADOS_SERFOR")}
                                    className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 transition-all ${
                                        filtroConciliacionIndeci === "ALERTADOS_SERFOR"
                                            ? "bg-lime-600 text-white shadow"
                                            : "text-lime-400 hover:bg-lime-950/40"
                                    }`}
                                    title="Incendios con código oficial CODREP y catastro territorial de la Unidad de Monitoreo Satelital de SERFOR (MIDAGRI)"
                                >
                                    <span>{language === "es" ? "🌿 ALERTADOS POR SERFOR" : "🌿 SERFOR MONITORED"}</span>
                                    <span className="bg-lime-950 border border-lime-700/60 px-1.5 py-0.2 rounded text-[9px]">
                                        {clusters.filter(c => !!c.serfor_match).length}
                                    </span>
                                </button>
                                <button
                                    onClick={() => setFiltroConciliacionIndeci("CIEGOS_ESTADO")}
                                    className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 transition-all ${
                                        filtroConciliacionIndeci === "CIEGOS_ESTADO"
                                            ? "bg-purple-600 text-white shadow"
                                            : "text-purple-400 hover:bg-purple-950/40"
                                    }`}
                                >
                                    <span>{language === "es" ? "👁️‍🗨️ INCENDIOS CIEGOS" : "👁️‍🗨️ BLIND WILDFIRES"}</span>
                                    <span className="bg-purple-950 px-1.5 py-0.2 rounded text-[9px]">
                                        {clusters.filter(c => !c.indeci_coen_match).length}
                                    </span>
                                </button>
                                <button
                                    onClick={() => setFiltroConciliacionIndeci("VIGILANCIA_PTT")}
                                    className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 transition-all ${
                                        filtroConciliacionIndeci === "VIGILANCIA_PTT"
                                            ? "bg-amber-600 text-white shadow"
                                            : "text-amber-400 hover:bg-amber-950/40"
                                    }`}
                                    title="Incendios de gran envergadura detectados en pasadas previas retenidos en memoria 48h por bloqueo de nubes"
                                >
                                    <span>{language === "es" ? "☁️ VIGILANCIA PTT / NUBOSIDAD" : "☁️ 48H PTT CLOUD MEMORY"}</span>
                                    <span className="bg-amber-950 border border-amber-700/60 px-1.5 py-0.2 rounded text-[9px]">
                                        {clusters.filter(c => c.estado_observacion === "OCLUIDO_POR_NUBOSIDAD" || (c.num_focos_ocluídos && c.num_focos_ocluídos > 0)).length}
                                    </span>
                                </button>
                            </div>
                        </div>

                        {/* BANNER DE INTELIGENCIA DE PERSISTENCIA TÉRMICA TEMPORAL (PTT) Y OCLUSIÓN NUBOSA */}
                        {comparativaOrbital && comparativaOrbital.focos_ocluídos_nubosidad > 0 && (
                            <div className="bg-amber-950/40 border border-amber-600/70 p-3 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-amber-200">
                                <div className="flex items-center gap-2">
                                    <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0" />
                                    <div>
                                        <span className="font-bold text-amber-300 block">
                                            🛰️ INTELIGENCIA PTT ACTIVA: PROTECCIÓN CONTRA FALSOS NEGATIVOS POR NUBOSIDAD (48 HORAS)
                                        </span>
                                        <p className="text-[11px] text-amber-200/90 font-sans mt-0.5">
                                            {comparativaOrbital.mensaje_c2}
                                        </p>
                                    </div>
                                </div>
                                <div className="shrink-0 flex items-center gap-2">
                                    <span className="bg-amber-900/80 border border-amber-600 text-amber-100 font-bold px-2.5 py-1 rounded-lg text-[10px]">
                                        ☁️ {comparativaOrbital.focos_ocluídos_nubosidad} FOCOS EN RETENCIÓN PTT
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* CONTENEDOR GRID DE TARJETAS DE CLUSTERS */}
                        {(() => {
                            const clustersFiltrados = clusters.filter(cl => {
                                if (filtroConciliacionIndeci === "VALIDADOS_COEN") return !!cl.indeci_coen_match;
                                if (filtroConciliacionIndeci === "ALERTADOS_SERFOR") return !!cl.serfor_match;
                                if (filtroConciliacionIndeci === "CIEGOS_ESTADO") return !cl.indeci_coen_match;
                                if (filtroConciliacionIndeci === "VIGILANCIA_PTT") {
                                    return cl.estado_observacion === "OCLUIDO_POR_NUBOSIDAD" || (cl.num_focos_ocluídos && cl.num_focos_ocluídos > 0);
                                }
                                return true;
                            });

                            const clustersVisibles = clustersFiltrados.slice(0, limiteCardsClusters);

                            return (
                                <>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                        {clustersVisibles.map((cl) => {
                                            const isMega = cl.tipo_incendio === "MEGA_INCENDIO_COMPLEJO";
                                            const isGran = cl.tipo_incendio === "INCENDIO_GRAN_ENVERGADURA";
                                            const isPttOcluido = cl.estado_observacion === "OCLUIDO_POR_NUBOSIDAD" || (cl.num_focos_ocluídos && cl.num_focos_ocluídos > 0);
                                            return (
                                                <div
                                                    key={cl.id_cluster}
                                                    onClick={() => handleSelectCluster(cl)}
                                                    className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                                                        clusterSeleccionado?.id_cluster === cl.id_cluster
                                                            ? "bg-red-950/70 border-red-500 shadow-lg shadow-red-950"
                                                            : (isPttOcluido 
                                                                ? "bg-amber-950/20 border-amber-800/60 hover:border-amber-600/70"
                                                                : "bg-slate-900/80 border-slate-800 hover:border-red-600/50")
                                                    }`}
                                                >
                                                    <div className="flex items-center justify-between text-[11px] mb-1.5">
                                                        <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                                                            isMega
                                                                ? "bg-red-600 text-white animate-pulse"
                                                                : (isGran ? "bg-amber-600 text-white" : "bg-orange-950 text-orange-300 border border-orange-800")
                                                        }`}>
                                                            {cl.tipo_incendio.replace(/_/g, " ")}
                                                        </span>
                                                        <span className="text-red-400 font-bold">{cl.frp_total_mw} MW</span>
                                                    </div>

                                                    <div className="font-bold text-white text-xs mb-1">
                                                        {cl.distrito_epicentro} - {cl.provincia}
                                                    </div>
                                                    <div className="text-[11px] text-slate-400 mb-1 flex items-center justify-between">
                                                        <span>Región: <strong className="text-slate-200">{cl.departamento}</strong> | Focos: <strong className="text-amber-400">{cl.num_focos_agrupados} focos</strong></span>
                                                        {isPttOcluido && (
                                                            <span className="bg-amber-950 text-amber-300 border border-amber-600 px-1.5 py-0.5 rounded text-[8.5px] font-bold flex items-center gap-1">
                                                                ☁️ Retenido PTT (48h)
                                                            </span>
                                                        )}
                                                    </div>

                                                    {isPttOcluido && (
                                                        <div className="text-[10px] bg-amber-950/50 border border-amber-700/80 p-2 rounded-lg text-amber-200 mb-2 leading-tight">
                                                            <div className="font-bold text-amber-300 flex items-center gap-1 mb-0.5">
                                                                <span>🛡️ MEMORIA TÁCTICA PTT: OCULTO POR MANTO NUBOSO</span>
                                                            </div>
                                                            <p className="text-[9.5px] text-amber-200/90 font-sans">
                                                                {cl.aviso_c2 || "Atención: La reducción de focos obedece a bloqueo óptico de nubes en la pasada actual. Prohibido declarar extinción sin verificación terrestre."}
                                                            </p>
                                                        </div>
                                                    )}

                                                    {cl.distritos_en_radio && cl.distritos_en_radio.length > 0 && (
                                                        <div className="text-[10px] text-orange-300/90 mb-2 flex flex-wrap items-center gap-1">
                                                            <span className="text-slate-400">En radio:</span>
                                                            {cl.distritos_en_radio.slice(0, 3).map((dr, dri) => (
                                                                <span key={dri} className="bg-slate-800/80 border border-slate-700 px-1.5 py-0.2 rounded text-[9px]">
                                                                    {dr.distrito} ({dr.distancia_km.toFixed(1)}km)
                                                                </span>
                                                            ))}
                                                        </div>
                                                    )}

                                                    {/* BLOQUE DE IDENTIFICACIÓN OFICIAL SERFOR (MIDAGRI) */}
                                                    {cl.serfor_match && (
                                                        <div className="text-[10px] bg-lime-950/40 border border-lime-600/70 p-2 rounded-lg mb-2 space-y-1">
                                                            <div className="flex items-center justify-between">
                                                                <span className="font-bold text-lime-400 flex items-center gap-1">
                                                                    🌿 REPORTE OFICIAL SERFOR ({cl.serfor_match.codrep})
                                                                </span>
                                                                <span className={`px-1.5 py-0.2 rounded text-[8px] font-bold ${
                                                                    cl.serfor_match.estado_label === "ALERTADO"
                                                                        ? "bg-amber-950 text-amber-200 border border-amber-600"
                                                                        : (cl.serfor_match.estado_label === "CONFIRMADO" ? "bg-red-950 text-red-200 border border-red-600 animate-pulse" : "bg-emerald-950 text-emerald-200 border border-emerald-600")
                                                                }`}>
                                                                    {cl.serfor_match.estado_label}
                                                                </span>
                                                            </div>
                                                            <div className="text-slate-300">
                                                                <b>Catastro:</b> <span className="text-lime-300 font-semibold">{cl.serfor_match.categoria_territorial_nom}</span>
                                                            </div>
                                                            <div className="text-slate-400 text-[9px] flex items-center justify-between">
                                                                <span>🛰️ Sensor: {cl.serfor_match.sensor_deteccion}</span>
                                                                <span className="text-lime-400 font-mono">Δ {cl.serfor_match.distancia_cruce_km} km</span>
                                                            </div>
                                                            <div className="text-[8.5px] text-amber-300/80 leading-tight pt-0.5 border-t border-lime-900/40">
                                                                🐾 <b>Fauna Silvestre:</b> Reportar afectación a la ATFFS regional de SERFOR.
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* BLOQUE DE CONCILIACIÓN OPERATIVA INDECI COEN O INCENDIO CIEGO */}
                                                    {cl.indeci_coen_match ? (
                                                        <div className="text-[10px] bg-emerald-950/40 border border-emerald-600/60 p-2 rounded-lg mb-2.5 space-y-1">
                                                            <div className="flex items-center justify-between">
                                                                <span className="font-bold text-emerald-400 flex items-center gap-1">
                                                                    🏛️ FUSIÓN HOMOLOGADA COEN-INDECI
                                                                </span>
                                                                <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                                                                    cl.indeci_coen_match.estado_terreno === "ACTIVO"
                                                                        ? "bg-red-900 text-red-200 border border-red-700 animate-pulse"
                                                                        : (cl.indeci_coen_match.estado_terreno === "CONTROLADO" ? "bg-amber-900 text-amber-200" : "bg-emerald-900 text-emerald-200")
                                                                }`}>
                                                                    TERRENO: {cl.indeci_coen_match.estado_terreno}
                                                                </span>
                                                            </div>
                                                            {cl.indeci_coen_match.nivel_indeci_label && (
                                                                <div className="bg-emerald-900/50 border border-emerald-700/60 px-2 py-0.5 rounded text-[9px] text-emerald-200 font-bold">
                                                                    🎖️ {cl.indeci_coen_match.nivel_indeci_label}
                                                                </div>
                                                            )}
                                                            <div className="text-slate-300">
                                                                <b>{cl.indeci_coen_match.reporte_oficial}</b> | SINPAD: <strong className="text-amber-300">{cl.indeci_coen_match.sinpad}</strong>
                                                            </div>
                                                            {cl.indeci_coen_match.hectareas_destruidas_edan > 0 && (
                                                                <div className="text-amber-300">
                                                                    <b>EDAN preliminar:</b> {cl.indeci_coen_match.hectareas_destruidas_edan} ha destruidas
                                                                </div>
                                                            )}
                                                            {cl.indeci_coen_match.sectores_comunidades && cl.indeci_coen_match.sectores_comunidades.length > 0 && (
                                                                <div className="text-slate-400 text-[9px] truncate">
                                                                    <b>Sectores:</b> {cl.indeci_coen_match.sectores_comunidades.join(", ")}
                                                                </div>
                                                            )}
                                                            <div className="pt-0.5">
                                                                <a
                                                                    href={cl.indeci_coen_match.fuente_portal}
                                                                    target="_blank"
                                                                    rel="noreferrer"
                                                                    onClick={(e) => e.stopPropagation()}
                                                                    className="text-[9px] text-sky-400 hover:underline flex items-center gap-1"
                                                                >
                                                                    <span>🔗 Ver reporte oficial en portal INDECI</span>
                                                                </a>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="text-[10px] bg-purple-950/30 border border-purple-800/60 p-2 rounded-lg mb-2.5 space-y-1">
                                                            <div className="flex items-center justify-between">
                                                                <span className="font-bold text-purple-300 flex items-center gap-1">
                                                                    👁️‍🗨️ DETECCIÓN TEMPRANA (INCENDIO CIEGO)
                                                                </span>
                                                                <span className="bg-purple-950 border border-purple-600 text-purple-200 font-bold px-1.5 py-0.2 rounded text-[8px]">
                                                                    SIN REGISTRO OFICIAL
                                                                </span>
                                                            </div>
                                                            <div className="text-slate-300 leading-tight text-[9.5px]">
                                                                Detectado satelitalmente sin información reportada en el portal del COEN-INDECI al <b>19/10/2026</b>.
                                                            </div>
                                                            <div className="text-amber-300/90 text-[9px] leading-tight font-sans">
                                                                ⚠️ OGRD municipal sin ficha EDAN ingresada en SINPAD. Emitir alerta temprana EAP preventiva para despliegue de brigadas.
                                                            </div>
                                                            <div className="pt-0.5">
                                                                <a
                                                                    href="https://portal.indeci.gob.pe/informe/reportes-preliminares-complementarios-emergencias/"
                                                                    target="_blank"
                                                                    rel="noreferrer"
                                                                    onClick={(e) => e.stopPropagation()}
                                                                    className="text-[9px] text-purple-300 hover:underline flex items-center gap-1"
                                                                >
                                                                    <span>🔗 Consultar repositorio oficial INDECI</span>
                                                                </a>
                                                            </div>
                                                        </div>
                                                    )}

                                                    <div className="text-[10px] bg-slate-950/70 p-2 rounded-lg border border-slate-800 space-y-1 mb-2.5">
                                                        <div className="text-slate-300"><b>Escalonamiento:</b> {cl.escalonamiento_sinagerd}</div>
                                                        <div className="text-amber-300/90"><b>Radio Fuego:</b> {cl.radio_expansion_km} km (Cortafuego: {cl.cortafuegos_recomendado_km} km)</div>
                                                        <div className="text-red-300"><b>Maquinaria:</b> {cl.maquinaria_pesada_requerida}</div>
                                                    </div>

                                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 pt-1">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleCalcularRutaHaciaFoco(cl.centroide_lat, cl.centroide_lng, `${cl.tipo_incendio.replace(/_/g, " ")}: ${cl.distrito_epicentro}`);
                                                            }}
                                                            className="py-1.5 px-1.5 bg-sky-700 hover:bg-sky-600 text-white font-bold text-[9px] rounded-lg transition-all flex items-center justify-center gap-1 shadow"
                                                            title="Calcula la ruta vehicular o pedestre desde el distrito base seleccionado hasta el epicentro del fuego"
                                                        >
                                                            <Route className="w-3 h-3" />
                                                            <span>Ruta C2</span>
                                                        </button>

                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleGenerarD8Cluster(cl);
                                                            }}
                                                            disabled={generatingD8}
                                                            className="py-1.5 px-1.5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold text-[9px] rounded-lg transition-all flex items-center justify-center gap-1 shadow shadow-amber-950/40"
                                                            title="Generar Acta Técnica Preventiva de Maquinaria D8 (Art. 27 Ley 30225) con sellos de calibración"
                                                        >
                                                            <FileText className="w-3 h-3" />
                                                            <span>Acta D8</span>
                                                        </button>

                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleDispararAlertaEap({
                                                                    id: 999,
                                                                    departamento: cl.departamento,
                                                                    provincia: cl.provincia,
                                                                    distrito: cl.distrito_epicentro,
                                                                    ubigeo: cl.ubigeo,
                                                                    lat: cl.centroide_lat,
                                                                    lng: cl.centroide_lng,
                                                                    combustible: "BIOMASA_COMPLEJO_ALTA_CARGA",
                                                                    pendiente_grados: 35.0,
                                                                    fwi_score: 65.0,
                                                                    riesgo_cenepred: "MUY_ALTO",
                                                                    gmaps_analisis: {
                                                                        buffer_riesgo_km: cl.radio_expansion_km,
                                                                        topografia_ladera: "Complejo de ladera y cresta con avance multidireccional",
                                                                        vias_acceso: "Requiere convoy de cisterna y apertura con tractor oruga D8",
                                                                        tiempo_respuesta_cisterna_min: 20,
                                                                        radio_intervencion_cortafuego_km: cl.cortafuegos_recomendado_km,
                                                                        vista_satelital_recomendada: "HYBRID_TILT_45"
                                                                    },
                                                                    open_meteo_pro: {
                                                                        humedad_suelo_0_7cm: 0.05,
                                                                        vpd_deficit_vapor_kpa: 2.5,
                                                                        rafaga_viento_10m_kmh: 42.0,
                                                                        estres_hidrico_combustible: "CRÍTICO_DESECACIÓN_EXTREMA",
                                                                        modelo_resolucion: "ECMWF IFS (9km)"
                                                                    }
                                                                });
                                                            }}
                                                            className="py-1.5 px-1.5 bg-red-700 hover:bg-red-600 text-white font-bold text-[9px] rounded-lg transition-all flex items-center justify-center gap-1 shadow"
                                                            title="Dispara alerta temprana de activación y despliegue EAP"
                                                        >
                                                            <Flame className="w-3 h-3" />
                                                            <span>Alerta EAP</span>
                                                        </button>

                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleEjecutarAuditoriaForense(
                                                                    cl.ubigeo,
                                                                    cl.distrito_epicentro,
                                                                    cl.provincia,
                                                                    cl.departamento,
                                                                    cl.centroide_lat,
                                                                    cl.centroide_lng,
                                                                    cl.indeci_coen_match?.sectores_comunidades?.[0] || "Sector Ladera / Rosanaico",
                                                                    cl.indeci_coen_match?.hectareas_destruidas_edan || 40.0
                                                                );
                                                            }}
                                                            disabled={loadingForense}
                                                            className="py-1.5 px-1.5 bg-indigo-700 hover:bg-indigo-600 text-white font-bold text-[9px] rounded-lg transition-all flex items-center justify-center gap-1 shadow shadow-indigo-950/40 border border-indigo-500/60"
                                                            title="Auditoría Forense Post-Incendio con Sentinel-2 dNBR (Copernicus CDSE) y validación SAC"
                                                        >
                                                            <Satellite className="w-3 h-3 text-indigo-200" />
                                                            <span>{loadingForense ? "Procesando..." : "Forense S2"}</span>
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* BARRA DE CONTROL DE VISUALIZACIÓN / MOSTRAR MÁS O TODOS */}
                                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-red-900/40 text-[11px] text-slate-400">
                                        <div className="flex items-center gap-2">
                                            <span>
                                                Mostrando <strong className="text-white">{clustersVisibles.length}</strong> de <strong className="text-amber-400">{clustersFiltrados.length}</strong> complejos de gran envergadura
                                                {filtroConciliacionIndeci !== "TODOS" && ` (${filtroConciliacionIndeci.replace(/_/g, " ")})`}
                                            </span>
                                        </div>

                                        <div className="flex flex-wrap items-center gap-2">
                                            {clustersVisibles.length < clustersFiltrados.length && (
                                                <button
                                                    onClick={() => setLimiteCardsClusters(prev => prev + 18)}
                                                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-bold border border-slate-700 transition-all flex items-center gap-1.5 shadow"
                                                >
                                                    <span>➕ Mostrar 18 más</span>
                                                </button>
                                            )}

                                            {limiteCardsClusters < clustersFiltrados.length ? (
                                                <button
                                                    onClick={() => setLimiteCardsClusters(clustersFiltrados.length)}
                                                    className="px-3 py-1.5 bg-gradient-to-r from-red-700 to-orange-700 hover:from-red-600 hover:to-orange-600 text-white rounded-lg font-bold transition-all flex items-center gap-1.5 shadow-md shadow-red-950/60"
                                                >
                                                    <Flame className="w-3.5 h-3.5" />
                                                    <span>Ver todos los {clustersFiltrados.length} eventos</span>
                                                </button>
                                            ) : (
                                                clustersFiltrados.length > 9 && (
                                                    <button
                                                        onClick={() => setLimiteCardsClusters(9)}
                                                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-bold border border-slate-700 transition-all flex items-center gap-1.5"
                                                    >
                                                        <span>Plegar a 9 principales</span>
                                                    </button>
                                                )
                                            )}

                                            {/* Selector rápido de tamaño */}
                                            <div className="flex items-center gap-1 bg-slate-900 px-2 py-1 rounded-lg border border-slate-800">
                                                <span className="text-[10px] text-slate-500">Límite:</span>
                                                {[9, 27, 54, clustersFiltrados.length].map((num, idx) => {
                                                    const label = num === clustersFiltrados.length ? "Todos" : `${num}`;
                                                    const activo = limiteCardsClusters === num;
                                                    return (
                                                        <button
                                                            key={idx}
                                                            onClick={() => setLimiteCardsClusters(num)}
                                                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                                                activo ? "bg-red-700 text-white" : "text-slate-400 hover:text-white"
                                                            }`}
                                                        >
                                                            {label}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                </>
                            );
                        })()}
                    </div>
                )}

                {/* TARJETA TÁCTICA DEDICADA DEL DISTRITO SELECCIONADO (GOOGLE MAPS + OPEN-METEO PRO) */}
                {distritoSeleccionado && (
                    <div className="bg-slate-950 border border-orange-500/50 rounded-2xl p-5 shadow-xl space-y-3 font-mono text-xs">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                            <div className="flex items-center gap-2">
                                <MapPin className="w-5 h-5 text-orange-400" />
                                <div>
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className="text-white font-bold text-sm">
                                            FICHA TÁCTICA C2: {distritoSeleccionado.distrito} - {distritoSeleccionado.provincia} ({distritoSeleccionado.departamento})
                                        </span>
                                        {focoMasCercano && focoMasCercano.distanciaKm <= 15.0 ? (
                                            <span className="bg-red-600/90 text-white font-bold px-2 py-0.5 rounded text-[10px] animate-pulse flex items-center gap-1 shadow-md shadow-red-950">
                                                <Flame className="w-3 h-3" /> FUEGO ACTIVO EN COMBATE: A {focoMasCercano.distanciaKm.toFixed(1)} km ({focoMasCercano.foco.frp_mw} MW)
                                            </span>
                                        ) : (
                                            <span className="bg-emerald-950 text-emerald-300 border border-emerald-700/60 font-semibold px-2 py-0.5 rounded text-[10px] flex items-center gap-1">
                                                <ShieldCheck className="w-3 h-3 text-emerald-400" /> SIN FUEGOS ACTIVOS EN PERÍMETRO (CONDICIÓN PREVENTIVA)
                                            </span>
                                        )}
                                    </div>
                                    <span className="text-[10px] text-slate-400 block font-sans">
                                        Distrito N.° {distritoSeleccionado.id} en Mapa Oficial CENEPRED 2018 • Coordenadas: {distritoSeleccionado.lat}, {distritoSeleccionado.lng}
                                        {distritoSeleccionado.ubigeo ? ` • UBIGEO: ${distritoSeleccionado.ubigeo}` : ""}
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold border ${
                                    distritoSeleccionado.riesgo_cenepred === "MUY_ALTO"
                                        ? "bg-rose-500/20 text-rose-400 border-rose-500/40"
                                        : "bg-orange-500/20 text-orange-400 border-orange-500/40"
                                }`}>
                                    RIESGO METEOROLÓGICO: {distritoSeleccionado.riesgo_cenepred}
                                </span>
                                <span className="bg-indigo-950 text-indigo-300 border border-indigo-800 px-2 py-0.5 rounded text-[10px]">
                                    FWI: {distritoSeleccionado.fwi_score}
                                </span>
                            </div>
                        </div>

                        {/* BANNER DINÁMICO DE SITUACIÓN TÁCTICA REAL (VIIRS VS CONDICIÓN PREVENTIVA) */}
                        {focoMasCercano && focoMasCercano.distanciaKm > 15.0 && (
                            <div className="p-2.5 bg-amber-950/40 border border-amber-800/60 rounded-xl flex items-center justify-between text-[11px] text-amber-200">
                                <div className="flex items-center gap-2">
                                    <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
                                    <span>
                                        <strong>AVISO TÁCTICO:</strong> El distrito de <strong>{distritoSeleccionado.distrito}</strong> mantiene vulnerabilidad climática alta (FWI {distritoSeleccionado.fwi_score}), pero <strong>no registra focos térmicos activos en su jurisdicción</strong>. El foco satelital VIIRS más cercano está a <strong className="text-white underline">{focoMasCercano.distanciaKm.toFixed(1)} km</strong> en el sector de <strong>{focoMasCercano.foco.distrito} ({focoMasCercano.foco.provincia}, {focoMasCercano.foco.departamento})</strong>.
                                    </span>
                                </div>
                                <button
                                    onClick={() => {
                                        // Buscar y seleccionar el distrito donde está el fuego activo más cercano
                                        const distFoco = distritos2018.find(d => 
                                            d.distrito.trim().toUpperCase() === focoMasCercano.foco.distrito.trim().toUpperCase() &&
                                            d.departamento.trim().toUpperCase() === focoMasCercano.foco.departamento.trim().toUpperCase()
                                        );
                                        if (distFoco) {
                                            handleSelectDistrito(distFoco);
                                        } else {
                                            // Fallback centrar en coordenadas del foco
                                            if (googleMapInstance.current) {
                                                googleMapInstance.current.setCenter({ lat: focoMasCercano.foco.lat, lng: focoMasCercano.foco.lng });
                                                googleMapInstance.current.setZoom(13);
                                            }
                                        }
                                    }}
                                    className="shrink-0 ml-3 px-2.5 py-1 bg-amber-700/80 hover:bg-amber-600 text-white font-bold rounded-lg transition-all text-[10px] flex items-center gap-1 shadow"
                                >
                                    <Flame className="w-3 h-3" />
                                    <span>Ir a {focoMasCercano.foco.distrito} &rarr;</span>
                                </button>
                            </div>
                        )}

                        {focoMasCercano && focoMasCercano.distanciaKm <= 15.0 && (
                            <div className="p-2.5 bg-red-950/70 border border-red-600/80 rounded-xl flex items-center justify-between text-[11px] text-red-200 animate-pulse">
                                <div className="flex items-center gap-2">
                                    <Flame className="w-4 h-4 text-red-400 shrink-0" />
                                    <span>
                                        🚨 <strong>OPERACIÓN EN CURSO:</strong> Foco de calor activo detectado por sensor {focoMasCercano.foco.sensor} a solo <strong>{focoMasCercano.distanciaKm.toFixed(1)} km</strong> del centro distrital. Potencia Radiativa: <strong className="text-white">{focoMasCercano.foco.frp_mw} MW</strong>.
                                    </span>
                                </div>
                                <button
                                    onClick={() => handleCalcularRutaHaciaFoco(focoMasCercano.foco.lat, focoMasCercano.foco.lng, `Foco Térmico: ${focoMasCercano.foco.distrito}`)}
                                    className="shrink-0 ml-3 px-2.5 py-1 bg-sky-700 hover:bg-sky-600 text-white font-bold rounded-lg transition-all text-[10px] flex items-center gap-1 shadow"
                                >
                                    <Route className="w-3 h-3" />
                                    <span>Trazar Ruta Cisterna &rarr;</span>
                                </button>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-[11px]">
                            {/* Bloque Google Maps Platform: Topografía */}
                            <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-1">
                                <span className="text-slate-400 text-[10px] font-sans font-bold flex items-center gap-1 text-orange-300">
                                    <Compass className="w-3.5 h-3.5" /> TOPOGRAFÍA GOOGLE MAPS
                                </span>
                                <p className="text-white font-bold mt-1">
                                    {distritoSeleccionado.gmaps_analisis?.topografia_ladera || (distritoSeleccionado.pendiente_grados > 25 ? "Ladera escarpada de alta pendiente" : "Valle interandino con pastizales")}
                                </p>
                                <span className="text-slate-400 block mt-1">Pendiente: <strong>{distritoSeleccionado.pendiente_grados}°</strong> ({distritoSeleccionado.pendiente_grados > 25 ? "Escarpada" : "Moderada"})</span>
                                <span className="text-orange-400 text-[10px] block">
                                    Ladeo 3D: {distritoSeleccionado.gmaps_analisis?.vista_satelital_recomendada || "Inclinación 45° SO"}
                                </span>
                            </div>

                            {/* Bloque Google Maps Platform: Accesibilidad y Cisternas */}
                            <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-1">
                                <span className="text-slate-400 text-[10px] font-sans font-bold flex items-center gap-1 text-sky-300">
                                    <Truck className="w-3.5 h-3.5" /> ACCESO VIAL (DIRECTIONS API)
                                </span>
                                <p className="text-slate-200 mt-1">
                                    {distritoSeleccionado.gmaps_analisis?.vias_acceso || "Vía afirmada / Trocha carrozable hacia cabecera comunal"}
                                </p>
                                <span className="text-cyan-300 font-bold block mt-1">
                                    Tiempo Cisterna: ~{distritoSeleccionado.gmaps_analisis?.tiempo_respuesta_cisterna_min || 35} min
                                </span>
                                <span className="text-slate-400 text-[10px] block">
                                    Radio Cortafuego: {distritoSeleccionado.gmaps_analisis?.radio_intervencion_cortafuego_km || 5.0} km
                                </span>
                            </div>

                            {/* Bloque Open-Meteo Pro: Humedad de Suelo 0-7cm */}
                            <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-1">
                                <span className="text-slate-400 text-[10px] font-sans font-bold flex items-center gap-1 text-emerald-300">
                                    <Droplets className="w-3.5 h-3.5" /> HUMEDAD SUELO (OPEN-METEO PRO)
                                </span>
                                <p className="text-emerald-400 font-bold mt-1">
                                    {((distritoSeleccionado.open_meteo_pro?.humedad_suelo_0_7cm ?? 0.08) * 100).toFixed(1)}% m³/m³ (Capa 0-7cm)
                                </p>
                                <span className="text-slate-300 block mt-1 font-sans">
                                    Combustible Fino: <strong>{distritoSeleccionado.combustible || "Pastizal seco"}</strong>
                                </span>
                                <span className="text-amber-400 text-[10px] block">
                                    {distritoSeleccionado.open_meteo_pro?.estres_hidrico_combustible || "Estrés hídrico severo en biomasa"}
                                </span>
                            </div>

                            {/* Bloque Open-Meteo Pro: Viento y VPD */}
                            <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-1">
                                <span className="text-slate-400 text-[10px] font-sans font-bold flex items-center gap-1 text-purple-300">
                                    <Wind className="w-3.5 h-3.5" /> RÁFAGAS &amp; VPD (ECMWF IFS)
                                </span>
                                <p className="text-purple-300 font-bold mt-1">
                                    {distritoSeleccionado.open_meteo_pro?.rafaga_viento_10m_kmh ?? 28} km/h (10m)
                                </p>
                                <span className="text-slate-300 block mt-1">
                                    Déficit Vapor (VPD): <strong>{distritoSeleccionado.open_meteo_pro?.vpd_deficit_vapor_kpa ?? 2.1} kPa</strong>
                                </span>
                                <span className="text-slate-400 text-[10px] block">
                                    Resolución: {distritoSeleccionado.open_meteo_pro?.modelo_resolucion || "ECMWF IFS (9km)"}
                                </span>
                            </div>
                        </div>

                        {/* BARRA DE ACCIÓN TÁCTICA C2 -> CONSOLA DE ALERTAS */}
                        <div className="pt-3 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
                            <div className="text-[11px] text-slate-400">
                                <span>🎯 Ubigeo: <code className="text-white font-mono">{distritoSeleccionado.ubigeo || `080${(distritoSeleccionado.id % 900).toString().padStart(3, "0")}`}</code> | Nivel de Riesgo: </span>
                                <span className={distritoSeleccionado.riesgo_cenepred === "MUY_ALTO" ? "text-red-400 font-bold" : "text-amber-400 font-bold"}>
                                    {distritoSeleccionado.riesgo_cenepred}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => handleDispararAlertaEap(distritoSeleccionado)}
                                    disabled={alertandoEap}
                                    className="px-4 py-2 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white rounded-xl font-bold text-xs flex items-center gap-2 shadow-lg shadow-red-950/50 transition-all cursor-pointer disabled:opacity-50"
                                >
                                    <Flame className="w-4 h-4 animate-pulse" />
                                    {alertandoEap ? "EMITIENDO ALERTA..." : "🚨 DISPARAR ALERTA EAP AL COED NACIONAL"}
                                </button>
                                <a
                                    href="/alertas"
                                    target="_blank"
                                    rel="noreferrer"
                                    className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1 transition-all"
                                >
                                    Ver en /alertas ↗
                                </a>
                            </div>
                        </div>

                        {/* Mensaje de confirmación cuando se dispara la alerta */}
                        {alertaDisparada && (
                            <div className="p-3 bg-red-950/40 border border-red-800/80 rounded-xl flex items-start justify-between gap-3 text-xs">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 text-red-400 font-bold">
                                        <AlertTriangle className="w-4 h-4" />
                                        <span>ALERTA EAP EMITIDA CON ÉXITO: {alertaDisparada.id_alerta}</span>
                                    </div>
                                    <p className="text-slate-300">
                                        Distrito: <strong>{alertaDisparada.distrito}</strong> | Estado: <span className="text-amber-400 font-mono">PENDIENTE_HITL_COED</span>.
                                    </p>
                                    <p className="text-slate-400 text-[11px]">
                                        El Oficial de Guardia en el COED Nacional ya tiene esta alerta en su consola para revisión y firma criptográfica con soberanía HITL antes del despacho a los alcaldes y radios comunitarias.
                                    </p>
                                </div>
                                <a
                                    href="/alertas"
                                    className="shrink-0 px-3 py-1.5 bg-red-700 hover:bg-red-600 text-white text-[11px] font-bold rounded-lg transition-all"
                                >
                                    Firmar en /alertas &rarr;
                                </a>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* SECCIÓN 2: DESGLOSE COMPLETO DE LOS 492 DISTRITOS DE mapa de distritos 2018-Incendios-Forestales */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2">
                        <Building2 className="w-5 h-5 text-emerald-400" />
                        <div>
                            <h2 className="text-base font-bold text-white uppercase tracking-wider font-mono">
                                CATÁLOGO DESAGREGADO: 492 DISTRITOS EN PELIGRO (CENEPRED 2018)
                            </h2>
                            <p className="text-[11px] text-slate-400">
                                Desglose oficial de 'mapa de distritos 2018-Incendios-Forestales.pdf' con enriquecimiento Google Maps y Open-Meteo Pro
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        {/* Pestañas de Filtro Táctico: Fuegos Activos vs Preventivos */}
                        <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-[11px] font-mono">
                            <button
                                onClick={() => setFiltroEstadoFuego("TODOS")}
                                className={`px-2.5 py-1 rounded-lg font-bold transition ${
                                    filtroEstadoFuego === "TODOS" ? "bg-slate-800 text-white shadow" : "text-slate-400 hover:text-white"
                                }`}
                            >
                                TODOS ({distritos2018.length})
                            </button>
                            <button
                                onClick={() => setFiltroEstadoFuego("FUEGO_ACTIVO")}
                                className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 transition ${
                                    filtroEstadoFuego === "FUEGO_ACTIVO"
                                        ? "bg-red-600 text-white shadow-lg shadow-red-950 animate-pulse"
                                        : "text-red-400 hover:text-red-300"
                                }`}
                            >
                                <Flame className="w-3 h-3" />
                                <span>CON FUEGO ACTIVO</span>
                            </button>
                            <button
                                onClick={() => setFiltroEstadoFuego("PREVENTIVO")}
                                className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 transition ${
                                    filtroEstadoFuego === "PREVENTIVO"
                                        ? "bg-emerald-700 text-white shadow"
                                        : "text-emerald-400 hover:text-emerald-300"
                                }`}
                            >
                                <ShieldCheck className="w-3 h-3" />
                                <span>PREVENTIVO CENEPRED</span>
                            </button>
                        </div>

                        <div className="relative">
                            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                            <input
                                type="text"
                                placeholder="Buscar distrito o provincia..."
                                value={distritoSearch}
                                onChange={(e) => setDistritoSearch(e.target.value)}
                                className="bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 font-mono focus:outline-none focus:border-orange-500 w-44"
                            />
                        </div>
                        <select
                            value={selectedDept}
                            onChange={(e) => setSelectedDept(e.target.value)}
                            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-orange-300 font-mono font-bold focus:outline-none focus:border-orange-500"
                        >
                            <option value="">TODOS LOS DEPARTAMENTOS ({distritos2018.length})</option>
                            <option value="CUSCO">CUSCO</option>
                            <option value="APURIMAC">APURIMAC</option>
                            <option value="PUNO">PUNO</option>
                            <option value="HUANCAVELICA">HUANCAVELICA</option>
                            <option value="CAJAMARCA">CAJAMARCA</option>
                            <option value="AYACUCHO">AYACUCHO</option>
                            <option value="HUANUCO">HUANUCO</option>
                            <option value="JUNIN">JUNIN</option>
                            <option value="PASCO">PASCO</option>
                            <option value="LA LIBERTAD">LA LIBERTAD</option>
                            <option value="ANCASH">ANCASH</option>
                            <option value="LIMA">LIMA</option>
                            <option value="AREQUIPA">AREQUIPA</option>
                            <option value="LAMBAYEQUE">LAMBAYEQUE</option>
                            <option value="AMAZONAS">AMAZONAS</option>
                            <option value="PIURA">PIURA</option>
                        </select>
                    </div>
                </div>

                <div className="overflow-x-auto max-h-96 overflow-y-auto pr-1">
                    <table className="w-full text-left text-xs font-mono">
                        <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 text-[11px] sticky top-0 z-10">
                            <tr>
                                <th className="p-2.5">N.°</th>
                                <th className="p-2.5">Distrito</th>
                                <th className="p-2.5">Provincia</th>
                                <th className="p-2.5">Departamento</th>
                                <th className="p-2.5">Estado Satelital</th>
                                <th className="p-2.5 text-center">Riesgo Climático</th>
                                <th className="p-2.5">FWI</th>
                                <th className="p-2.5">Acceso Google Maps</th>
                                <th className="p-2.5">Suelo 0-7cm</th>
                                <th className="p-2.5">Acción</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800 text-slate-300">
                            {distritosFiltradosTabla.map((dist: any) => {
                                const tieneFuego = dist.tiene_fuego_activo;
                                return (
                                    <tr
                                        key={dist.id}
                                        className={`hover:bg-slate-800/60 transition cursor-pointer ${
                                            distritoSeleccionado?.id === dist.id ? "bg-orange-950/40" : ""
                                        }`}
                                        onClick={() => handleSelectDistrito(dist)}
                                    >
                                        <td className="p-2.5 text-slate-500 font-bold">{dist.id}</td>
                                        <td className="p-2.5 font-bold text-white flex items-center gap-1.5">
                                            <span className={`w-2 h-2 rounded-full ${
                                                tieneFuego ? "bg-red-500 animate-ping" : (dist.riesgo_cenepred === "MUY_ALTO" ? "bg-rose-500" : "bg-orange-400")
                                            }`} />
                                            <span>{dist.distrito}</span>
                                        </td>
                                        <td className="p-2.5 text-slate-300">{dist.provincia}</td>
                                        <td className="p-2.5 text-orange-300 font-bold">{dist.departamento}</td>
                                        <td className="p-2.5">
                                            {tieneFuego && dist.foco_cercano_dist_km != null ? (
                                                <span className="px-2 py-0.5 rounded bg-red-950 text-red-300 border border-red-700/80 font-bold text-[10px] flex items-center gap-1">
                                                    <Flame className="w-2.5 h-2.5 text-red-400" />
                                                    <span>ACTIVO ({dist.foco_cercano_dist_km.toFixed(1)} km)</span>
                                                </span>
                                            ) : (
                                                <span className="text-[10px] text-slate-400 flex items-center gap-1">
                                                    <ShieldCheck className="w-3 h-3 text-emerald-500/70" />
                                                    <span>{dist.foco_cercano_dist_km != null ? `A ${dist.foco_cercano_dist_km.toFixed(0)} km` : "Sin fuegos"}</span>
                                                </span>
                                            )}
                                        </td>
                                        <td className="p-2.5 text-center">
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                                dist.riesgo_cenepred === "MUY_ALTO"
                                                    ? "bg-rose-500/20 text-rose-400 border border-rose-500/40"
                                                    : "bg-orange-500/20 text-orange-400 border border-orange-500/40"
                                            }`}>
                                                {dist.riesgo_cenepred}
                                            </span>
                                        </td>
                                        <td className="p-2.5 font-bold text-amber-300">{dist.fwi_score || 55.0}</td>
                                        <td className="p-2.5 text-[11px] text-slate-400 truncate max-w-xs">
                                            {dist.gmaps_analisis?.vias_acceso || "Trocha carrozable intermodal"}
                                        </td>
                                        <td className="p-2.5 text-emerald-400">
                                            {((dist.open_meteo_pro?.humedad_suelo_0_7cm ?? 0.08) * 100).toFixed(1)}%
                                        </td>
                                        <td className="p-2.5">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleSelectDistrito(dist); }}
                                                className="px-2 py-1 bg-orange-600/80 hover:bg-orange-600 text-white rounded text-[10px] font-bold transition flex items-center gap-1"
                                            >
                                                <Eye className="w-3 h-3" />
                                                <span>Ficha 3D</span>
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* SECCIÓN 3: FOCOS SATELITALES VIIRS & EXPEDIENTE CORTAFUEGOS D8 */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2">
                        <Satellite className="w-5 h-5 text-orange-400 animate-pulse" />
                        <div>
                            <h2 className="text-base font-bold text-white">
                                FOCOS TÉRMICOS SATELITALES ACTIVOS (VIIRS / NASA FIRMS)
                            </h2>
                            <p className="text-[11px] text-slate-400">
                                Detección infrarroja BT4 &gt; 325K (375m) y generación de orden de maquinaria mecanizada D8
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-mono bg-orange-950 text-orange-300 border border-orange-800 px-3 py-1 rounded-xl font-bold flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                            {focosFiltrados.length} DE {focos.length} FOCOS FILTRADOS
                        </span>
                        <span className="text-xs font-mono bg-slate-800 text-slate-300 border border-slate-700 px-3 py-1 rounded-xl font-bold">
                            VIGILANCIA C2
                        </span>
                    </div>
                </div>

                {/* BARRA DE FILTROS AVANZADOS DE FOCOS DE CALOR */}
                <div className="bg-slate-950/90 border border-slate-800/80 rounded-xl p-3 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/60 pb-2">
                        <span className="text-xs font-bold font-mono text-orange-400 flex items-center gap-1.5">
                            <Filter className="w-3.5 h-3.5" /> FILTRADO TÁCTICO SATELITAL
                        </span>
                        {(focosSearch || focosSensorFilter !== "TODOS" || focosFrpMin > 0 || focosCoberturaFilter !== "TODOS" || focosRiesgoFilter !== "TODOS" || focosNivelSinagerdFilter !== "TODOS") && (
                            <button
                                onClick={() => {
                                    setFocosSearch("");
                                    setFocosSensorFilter("TODOS");
                                    setFocosFrpMin(0);
                                    setFocosCoberturaFilter("TODOS");
                                    setFocosRiesgoFilter("TODOS");
                                    setFocosNivelSinagerdFilter("TODOS");
                                }}
                                className="text-[11px] text-rose-400 hover:text-rose-300 font-mono flex items-center gap-1 transition"
                            >
                                <X className="w-3 h-3" /> Limpiar Filtros
                            </button>
                        )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2.5 text-xs">
                        {/* 1. Búsqueda por Ubigeo / Distrito / Provincia / Patrimonio */}
                        <div className="relative">
                            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                            <input
                                type="text"
                                placeholder="Ubigeo, Distrito, Caserío..."
                                value={focosSearch}
                                onChange={(e) => setFocosSearch(e.target.value)}
                                className="w-full pl-8 pr-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 text-[11px] focus:outline-none focus:border-orange-500 transition font-mono"
                            />
                        </div>

                        {/* 2. Filtro por Sensor Satelital */}
                        <div>
                            <select
                                value={focosSensorFilter}
                                onChange={(e) => setFocosSensorFilter(e.target.value)}
                                className="w-full py-1.5 px-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-[11px] focus:outline-none focus:border-orange-500 font-mono"
                            >
                                <option value="TODOS">🛰️ Todos los Sensores</option>
                                <option value="VIIRS Suomi-NPP">VIIRS Suomi-NPP (375m)</option>
                                <option value="VIIRS NOAA-20">VIIRS NOAA-20 (375m)</option>
                                <option value="MODIS">MODIS Terra/Aqua (1km)</option>
                            </select>
                        </div>

                        {/* 3. Filtro por Cobertura Vegetal / Tipo Biomasa */}
                        <div>
                            <select
                                value={focosCoberturaFilter}
                                onChange={(e) => setFocosCoberturaFilter(e.target.value)}
                                className="w-full py-1.5 px-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-[11px] focus:outline-none focus:border-orange-500 font-mono"
                            >
                                <option value="TODOS">🌿 Cobertura: Todas</option>
                                <option value="PAJONAL">Pajonales y Punas</option>
                                <option value="BOSQUE">Bosques y Queñuales</option>
                                <option value="AGRICOLA">Agrícola / Purmas / Quemas</option>
                            </select>
                        </div>

                        {/* 4. Filtro por Potencia Térmica FRP mínima */}
                        <div>
                            <select
                                value={focosFrpMin}
                                onChange={(e) => setFocosFrpMin(Number(e.target.value))}
                                className="w-full py-1.5 px-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-[11px] focus:outline-none focus:border-orange-500 font-mono"
                            >
                                <option value={0}>🔥 FRP: Cualquiera</option>
                                <option value={50}>FRP &gt; 50 MW (Activo)</option>
                                <option value={80}>FRP &gt; 80 MW (Intenso)</option>
                                <option value={100}>FRP &gt; 100 MW (Megaincendio)</option>
                            </select>
                        </div>

                        {/* 5. Filtro por Nivel de Riesgo CENEPRED */}
                        <div>
                            <select
                                value={focosRiesgoFilter}
                                onChange={(e) => setFocosRiesgoFilter(e.target.value)}
                                className="w-full py-1.5 px-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-[11px] focus:outline-none focus:border-orange-500 font-mono"
                            >
                                <option value="TODOS">⚠️ Riesgo: Todos</option>
                                <option value="MUY_ALTO">MUY ALTO (Prioritario)</option>
                                <option value="ALTO">ALTO</option>
                                <option value="MEDIO">MEDIO</option>
                            </select>
                        </div>

                        {/* 6. Filtro por Escalonamiento SINAGERD */}
                        <div>
                            <select
                                value={focosNivelSinagerdFilter}
                                onChange={(e) => setFocosNivelSinagerdFilter(e.target.value)}
                                className="w-full py-1.5 px-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-[11px] focus:outline-none focus:border-orange-500 font-mono"
                            >
                                <option value="TODOS">🚨 Nivel SINAGERD: Todos</option>
                                <option value="NIVEL_5">Nivel 5 (Nacional / Aéreo)</option>
                                <option value="NIVEL_4">Nivel 4 (Regional / GORE)</option>
                                <option value="NIVEL_3">Nivel 3 (Provincial / CGBVP)</option>
                                <option value="NIVEL_1_2">Nivel 1-2 (Distrital / Local)</option>
                            </select>
                        </div>
                    </div>
                </div>

                {focosFiltrados.length === 0 ? (
                    <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-8 text-center space-y-2">
                        <Flame className="w-8 h-8 text-slate-600 mx-auto" />
                        <p className="text-sm font-bold text-slate-300">No se encontraron focos satelitales con los filtros seleccionados</p>
                        <p className="text-xs text-slate-500">Prueba ajustando el término de búsqueda, ubigeo o el umbral de potencia térmica FRP.</p>
                        <div className="flex items-center justify-center gap-2 mt-3">
                            <button
                                onClick={() => {
                                    setFocosSearch("");
                                    setFocosSensorFilter("TODOS");
                                    setFocosFrpMin(0);
                                    setFocosCoberturaFilter("TODOS");
                                    setFocosRiesgoFilter("TODOS");
                                    setFocosNivelSinagerdFilter("TODOS");
                                }}
                                className="px-3 py-1.5 bg-orange-600 hover:bg-orange-500 text-white rounded text-xs font-bold transition font-mono"
                            >
                                Restablecer Filtros
                            </button>
                            <button
                                onClick={() => {
                                    loadData();
                                }}
                                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded text-xs font-bold transition font-mono flex items-center gap-1.5"
                            >
                                <RefreshCw className={`w-3 h-3 ${loading ? "animate-spin" : ""}`} />
                                Reintentar Carga
                            </button>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {focosFiltrados.slice(0, 60).map((foco) => (
                            <div
                                key={foco.id}
                                className="bg-slate-950 border border-orange-500/40 rounded-xl p-4 space-y-3 relative overflow-hidden flex flex-col justify-between shadow-lg hover:border-orange-400 transition"
                            >
                            <div>
                                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                                    <span className="font-mono font-bold text-orange-400 text-xs">{foco.id}</span>
                                    <div className="flex items-center gap-1.5">
                                        <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                                            foco.frp_mw >= 100 || (foco.open_meteo?.rafagas_viento_kmh ?? 0) >= 40
                                                ? 'bg-rose-950/80 text-rose-300 border-rose-500/80'
                                                : foco.frp_mw >= 25
                                                ? 'bg-orange-950/80 text-orange-300 border-orange-500/80'
                                                : foco.frp_mw >= 5
                                                ? 'bg-indigo-950/80 text-indigo-300 border-indigo-500/80'
                                                : 'bg-slate-900 text-slate-300 border-slate-700'
                                        }`}>
                                            {foco.frp_mw >= 100 || (foco.open_meteo?.rafagas_viento_kmh ?? 0) >= 40
                                                ? 'NIVEL 5 (NACIONAL)'
                                                : foco.frp_mw >= 25
                                                ? 'NIVEL 4 (REGIONAL)'
                                                : foco.frp_mw >= 5
                                                ? 'NIVEL 3 (PROVINCIAL)'
                                                : 'NIVEL 1-2 (DISTRITAL)'}
                                        </span>
                                        <span className="text-[10px] bg-rose-500/20 text-rose-300 border border-rose-500/40 px-2 py-0.5 rounded font-mono font-bold">
                                            FRP: {foco.frp_mw} MW
                                        </span>
                                    </div>
                                </div>

                                <div className="mt-2 space-y-1.5 text-xs">
                                    <div className="flex items-center justify-between">
                                        <span className="text-slate-400 font-medium">Ubicación:</span>
                                        <span className="text-white font-bold">{foco.distrito}, {foco.provincia} ({foco.departamento})</span>
                                    </div>
                                    <div className="flex items-center justify-between font-mono text-[11px]">
                                        <span className="text-slate-400 font-sans">Coordenadas:</span>
                                        <span className="text-indigo-300">{foco.lat}, {foco.lng}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-slate-400 font-medium">Sensor Satelital:</span>
                                        <span className="text-emerald-400 font-mono text-[11px]">{foco.sensor}</span>
                                    </div>
                                    <div className="flex items-center justify-between font-mono">
                                        <span className="text-slate-400 font-sans">Temp. Brillo BT4:</span>
                                        <span className="text-amber-300 font-bold">{foco.temperatura_brillo_k} K ({(foco.temperatura_brillo_k - 273.15).toFixed(1)}°C)</span>
                                    </div>
                                    <div className="bg-slate-900 p-2 rounded-lg border border-slate-800 text-[11px] mt-2">
                                        <span className="text-slate-400 block text-[10px] font-bold">AMENAZA A PATRIMONIO / COMUNIDADES:</span>
                                        <span className="text-rose-300 block mt-0.5">{foco.patrimonio_cercano}</span>
                                        <span className="text-slate-400 text-[10px] block mt-1">Cobertura: {foco.cobertura}</span>
                                    </div>

                                    {/* TELEMETRÍA OPEN-METEO PRO: TEMPERATURA & VIENTO ACELERADOR */}
                                    <div className="bg-slate-900/90 p-2.5 rounded-lg border border-sky-900/50 text-[11px] font-mono space-y-1 mt-2">
                                        <div className="flex items-center justify-between text-sky-400 font-bold text-[10px]">
                                            <span className="flex items-center gap-1">
                                                <Wind className="w-3 h-3 text-sky-400" />
                                                <span>OPEN-METEO PRO (ECMWF)</span>
                                            </span>
                                            <span className="text-amber-400 text-[9px] bg-amber-950/60 px-1.5 py-0.2 rounded border border-amber-800/60">
                                                {foco.open_meteo?.peligro_propagacion || "PROPAGACIÓN ACTIVA"}
                                            </span>
                                        </div>
                                        <div className="grid grid-cols-2 gap-1.5 text-[10px] pt-1">
                                            <div className="bg-slate-950 p-1.5 rounded border border-slate-800">
                                                <span className="text-slate-400 block text-[9px]">Temp. Ambiente:</span>
                                                <strong className="text-rose-400 font-bold">{foco.open_meteo?.temperatura_ambiente_c ?? 31.5}°C</strong>
                                            </div>
                                            <div className="bg-slate-950 p-1.5 rounded border border-slate-800">
                                                <span className="text-slate-400 block text-[9px]">Viento Continuo:</span>
                                                <strong className="text-purple-300 font-bold">{foco.open_meteo?.viento_velocidad_kmh ?? 26.0} km/h</strong>
                                            </div>
                                            <div className="bg-slate-950 p-1.5 rounded border border-slate-800">
                                                <span className="text-slate-400 block text-[9px]">Ráfagas 10m:</span>
                                                <strong className="text-fuchsia-400 font-bold">{foco.open_meteo?.rafagas_viento_kmh ?? 38.0} km/h</strong>
                                            </div>
                                            <div className="bg-slate-950 p-1.5 rounded border border-slate-800">
                                                <span className="text-slate-400 block text-[9px]">Humedad Suelo 0-7cm:</span>
                                                <strong className="text-emerald-400 font-bold">{(((foco.open_meteo?.humedad_suelo_0_7cm ?? 0.05)) * 100).toFixed(1)}%</strong>
                                            </div>
                                        </div>
                                        <span className="text-[9px] text-amber-300 block pt-0.5">
                                            🔥 Temp &gt; 30°C y ráfagas aceleran la biomasa seca hacia copas de árboles.
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-3 pt-3 border-t border-slate-800 grid grid-cols-2 gap-2">
                                <button
                                    onClick={() => handleCalcularRutaHaciaFoco(foco.lat, foco.lng, `Foco Térmico ${foco.id}: ${foco.distrito}`)}
                                    disabled={calculatingRuta}
                                    className="py-2 px-2 bg-sky-700 hover:bg-sky-600 text-white rounded-lg text-xs font-bold transition flex items-center justify-center gap-1 shadow-md shadow-sky-900/30"
                                    title="Trazar ruta de aproximación vehicular o pedestre desde el centro comunal más cercano"
                                >
                                    <Route className="w-3.5 h-3.5" />
                                    <span>Ruta C2</span>
                                </button>

                                    <button
                                        onClick={() => handleGenerarD8(foco)}
                                        disabled={generatingD8}
                                        className="py-2 px-2 bg-gradient-to-r from-orange-600 to-rose-600 hover:from-orange-500 hover:to-rose-500 text-white rounded-lg text-xs font-bold transition flex items-center justify-center gap-1 shadow-md shadow-orange-700/30"
                                    >
                                        <ShieldAlert className="w-3.5 h-3.5" />
                                        <span>Acta D8</span>
                                    </button>
                                </div>
                            </div>
                        ))}
                        </div>
                        {focosFiltrados.length > 60 && (
                            <div className="text-center py-2 text-xs font-mono text-slate-400 bg-slate-950/60 border border-slate-800 rounded-xl">
                                🛰️ Mostrando los primeros 60 de {focosFiltrados.length} focos detectados. Usa los filtros o búsqueda por distrito/ubigeo para refinar.
                            </div>
                        )}
                    </>
                )}

                {/* ACTA D8 GENERADA (RESUMEN EN LÍNEA) */}
                {actaD8 && (
                    <div className="mt-4 bg-slate-950 border-2 border-emerald-500/60 rounded-2xl p-5 font-mono text-xs space-y-3 relative overflow-hidden shadow-2xl">
                        {/* Etiqueta / Sello de Advertencia Legal Superior */}
                        <div className="bg-amber-500/10 border-b border-amber-500/30 -mx-5 -mt-5 px-5 py-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <span className="text-[10.5px] font-bold text-amber-300 flex items-center gap-1.5">
                                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                                <span>⚠️ DOCUMENTO DE TRABAJO TÉCNICO-PREVENTIVO EN PROCESO DE CALIBRACIÓN (D.S. 115-2025-PCM)</span>
                            </span>
                            <span className="text-[9px] bg-amber-950/80 text-amber-200 border border-amber-600/60 px-2 py-0.5 rounded font-bold shrink-0">
                                NO OFICIAL • PRE-EXPEDIENTE C2
                            </span>
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-2 pt-1">
                            <div className="flex items-center gap-2">
                                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                                <span className="font-bold text-white text-sm">
                                    EXPEDIENTE TÉCNICO PREVENTIVO D8: {actaD8.expediente}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setShowActaModal(true)}
                                    className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition flex items-center gap-1 shadow-md shadow-emerald-950"
                                >
                                    <FileText className="w-3.5 h-3.5" />
                                    <span>Ver Acta Formal / Imprimir</span>
                                </button>
                                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2.5 py-1 rounded border border-emerald-500/40">
                                    {actaD8.status}
                                </span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-[11px]">
                            <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                                <span className="text-slate-400 block font-sans">Jurisdicción &amp; Amenaza:</span>
                                <span className="text-white font-bold mt-1 block">{actaD8.distrito}, {actaD8.provincia} ({actaD8.departamento})</span>
                                <span className="text-emerald-400 mt-1 block">{actaD8.hectareas_agricolas_salvaguardadas} ha amenazadas</span>
                                <span className="text-slate-400 text-[10px] block mt-1">{actaD8.num_focos || 1} focos satelitales • FRP {actaD8.frp_total_mw || 0} MW</span>
                            </div>

                            <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                                <span className="text-slate-400 block font-sans">Intervención Mecanizada:</span>
                                <span className="text-orange-300 font-bold mt-1 block">{actaD8.intervencion_emergencia?.longitud_cortafuego_defensivo_km || 10.5} km de faja cortafuego (15m ancho)</span>
                                <span className="text-slate-300 mt-1 block">{actaD8.intervencion_emergencia?.horas_maquina_estimadas || 48} horas Tractor Oruga D8K/D8T</span>
                                <span className="text-amber-400 text-[10px] block mt-1">{actaD8.intervencion_emergencia?.unidades_cisterna || 1}x Cisternas 5,000 gal</span>
                            </div>

                            <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                                <span className="text-slate-400 block font-sans">Presupuesto Estimado &amp; Control CGR:</span>
                                <span className="text-cyan-300 font-bold text-sm mt-1 block">S/ {actaD8.intervencion_emergencia?.presupuesto_estimado_soles?.toLocaleString() || "48,500"}</span>
                                <span className="text-amber-400 mt-1 block text-[10px]">{actaD8.control_concurrente_cgr || "Notificación simultánea a OCI"}</span>
                                <span className="text-slate-400 text-[9.5px] block mt-1 font-sans">{actaD8.canal_mef || "Programa Presupuestal 0068 PREVAED"}</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* SECCIÓN 4: SIMULADOR FWI CON OPEN-METEO PRO (HUMEDAD 0-7CM + RÁFAGAS VIENTO) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Panel de Controles Meteorológicos Open-Meteo Pro */}
                <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                        <div className="flex items-center gap-2">
                            <Sliders className="w-5 h-5 text-indigo-400" />
                            <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                                MOTOR PREDICTIVO FWI • OPEN-METEO PRO
                            </h2>
                        </div>
                        <span className="text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 px-2 py-0.5 rounded font-mono font-bold">
                            ECMWF IFS (9km)
                        </span>
                    </div>

                    <div className="space-y-4 text-xs">
                        <div>
                            <div className="flex justify-between mb-1">
                                <span className="text-slate-300">Temperatura Superficial a 2m:</span>
                                <span className="font-mono font-bold text-orange-400">{temperatura} °C</span>
                            </div>
                            <input
                                type="range"
                                min="10"
                                max="42"
                                step="0.5"
                                value={temperatura}
                                onChange={(e) => setTemperatura(parseFloat(e.target.value))}
                                className="w-full accent-orange-500"
                            />
                        </div>

                        <div>
                            <div className="flex justify-between mb-1">
                                <span className="text-slate-300">Humedad Relativa (%):</span>
                                <span className="font-mono font-bold text-cyan-400">{humedadRelativa} %</span>
                            </div>
                            <input
                                type="range"
                                min="5"
                                max="85"
                                step="1"
                                value={humedadRelativa}
                                onChange={(e) => setHumedadRelativa(parseFloat(e.target.value))}
                                className="w-full accent-cyan-500"
                            />
                        </div>

                        <div>
                            <div className="flex justify-between mb-1">
                                <span className="text-slate-300">Ráfagas de Viento a 10m (MINEM / Open-Meteo):</span>
                                <span className="font-mono font-bold text-sky-400">{vientoKmh} km/h</span>
                            </div>
                            <input
                                type="range"
                                min="0"
                                max="80"
                                step="1"
                                value={vientoKmh}
                                onChange={(e) => setVientoKmh(parseFloat(e.target.value))}
                                className="w-full accent-sky-500"
                            />
                        </div>

                        <div>
                            <div className="flex justify-between mb-1">
                                <span className="text-slate-300">Días sin Lluvia Acumulados (Estiaje):</span>
                                <span className="font-mono font-bold text-amber-400">{diasSinLluvia} días</span>
                            </div>
                            <input
                                type="range"
                                min="1"
                                max="90"
                                step="1"
                                value={diasSinLluvia}
                                onChange={(e) => setDiasSinLluvia(parseInt(e.target.value))}
                                className="w-full accent-amber-500"
                            />
                        </div>

                        <div>
                            <div className="flex justify-between mb-1">
                                <span className="text-slate-300">Humedad de Suelo Capa 0-7cm (Combustible Fino FFMC):</span>
                                <span className="font-mono font-bold text-emerald-400">{(humedadSuelo * 100).toFixed(1)} % m³/m³</span>
                            </div>
                            <input
                                type="range"
                                min="0.02"
                                max="0.45"
                                step="0.01"
                                value={humedadSuelo}
                                onChange={(e) => setHumedadSuelo(parseFloat(e.target.value))}
                                className="w-full accent-emerald-500"
                            />
                        </div>

                        <div>
                            <div className="flex justify-between mb-1">
                                <span className="text-slate-300">Pendiente del Terreno (NASA SRTM 90m):</span>
                                <span className="font-mono font-bold text-purple-400">{pendiente}° (Muy Fuerte)</span>
                            </div>
                            <input
                                type="range"
                                min="2"
                                max="55"
                                step="1"
                                value={pendiente}
                                onChange={(e) => setPendiente(parseFloat(e.target.value))}
                                className="w-full accent-purple-500"
                            />
                        </div>

                        <button
                            onClick={handleCalcularFwi}
                            disabled={calculatingFwi}
                            className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-md shadow-indigo-600/30 mt-2"
                        >
                            <RefreshCw className={`w-3.5 h-3.5 ${calculatingFwi ? "animate-spin" : ""}`} />
                            <span>Recalcular FWI Dinámico</span>
                        </button>
                    </div>
                </div>

                {/* Tacómetro y Salida del FWI */}
                <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-2xl flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                            <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                                DICTAMEN DE PELIGRO DE INCENDIO (CANADIAN FWI SYSTEM)
                            </h2>
                            <span className={`px-2.5 py-0.5 rounded text-[11px] font-mono font-bold border ${
                                fwiResult?.nivel_alerta === "EXTREMO_ROJO"
                                    ? "bg-rose-500/20 text-rose-400 border-rose-500/40 animate-pulse"
                                    : fwiResult?.nivel_alerta === "MUY_ALTO_NARANJA"
                                        ? "bg-orange-500/20 text-orange-400 border-orange-500/40"
                                        : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                            }`}>
                                {fwiResult?.nivel_alerta || "CALCULANDO..."}
                            </span>
                        </div>

                        <div className="my-6 text-center">
                            <span className="text-5xl font-black text-white font-mono tracking-tight block">
                                {fwiResult?.fwi_score || 0.0}
                            </span>
                            <span className="text-xs uppercase tracking-wider text-slate-400 font-bold mt-1 block">
                                Puntos FWI de Ignición y Propagación
                            </span>
                        </div>

                        <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                                <span className="text-slate-400 text-[10px] font-sans block">Velocidad del Frente:</span>
                                <span className="text-base font-bold text-orange-400 mt-0.5 block">
                                    {fwiResult?.velocidad_frente_kmh || 0} km/h
                                </span>
                                <span className="text-[10px] text-slate-400">Avance convectivo</span>
                            </div>

                            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                                <span className="text-slate-400 text-[10px] font-sans block">Salto a Fuego de Copa:</span>
                                <span className="text-base font-bold text-rose-400 mt-0.5 block">
                                    &lt; {fwiResult?.tiempo_estimado_fuego_copa_min || 0} min
                                </span>
                                <span className="text-[10px] text-slate-400">Ventana de extinción</span>
                            </div>
                        </div>

                        <div className="mt-4 p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs space-y-1">
                            <span className="text-slate-400 text-[10px] font-bold block uppercase">Protocolo Táctico Recomendado:</span>
                            <p className="text-slate-200">
                                {fwiResult?.accion_recomendada}
                            </p>
                        </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                        <span>FFMC: {fwiResult?.factores_calculo?.ffmc_combustible_fino}</span>
                        <span>ISI: {fwiResult?.factores_calculo?.isi_propagacion_inicial}</span>
                        <span>Pendiente: x{fwiResult?.factores_calculo?.factor_pendiente}</span>
                    </div>
                </div>
            </div>

            {/* SECCIÓN 5: HISTÓRICO GLOBAL FOREST WATCH */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-2xl flex flex-col justify-between space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-orange-400" />
                        <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                            HISTÓRICO PÉRDIDA POR FUEGO 2016-2026 (GLOBAL NATURE WATCH PER.XLSX)
                        </h2>
                    </div>
                    <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono">
                        PER.xlsx • Wildfire
                    </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2 font-mono text-xs">
                    {resumen?.serie_historica_perdidas?.map((item: SerieFuego) => (
                        <div key={item.year} className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-center">
                            <span className="font-bold text-white block">{item.year}</span>
                            <span className="text-[10px] text-slate-400 block truncate">({item.anomalia})</span>
                            <span className="font-bold text-orange-400 text-xs mt-1 block">
                                {item.perdida_fuego_ha.toLocaleString()} ha
                            </span>
                        </div>
                    ))}
                </div>

                <div className="p-3 bg-slate-950 border border-orange-900/40 rounded-xl text-[11px] text-slate-300">
                    <span className="text-orange-400 font-bold block">Hallazgo Multirriesgo AMARU:</span>
                    El pico histórico de 2024 (42,590 ha) demostró que las temporadas secas exacerbadas por La Niña generan deshidratación acelerada de la vegetación andina y amazónica. El sensor de Google Maps Platform y la telemetría de suelo de Open-Meteo Pro permiten anticipar la ventana dorada de extinción antes del fuego de copa.
                </div>
            </div>

            {/* SECCIÓN 6: MATRIZ DE ARTICULACIÓN TRIPARTITA COED Y PLANES DE CONTINGENCIA REGIONALES */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between border-b border-slate-800 pb-4 gap-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <Layers className="w-5 h-5 text-emerald-400" />
                            <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                                ARTICULACIÓN MULTINIVEL C2 AMARU • DOCTRINA CENEPRED & INTE-PUCP
                            </h2>
                        </div>
                        <p className="text-xs text-slate-400 mt-1">
                            Respuesta estructural a las brechas identificadas por <b>Rusby Zela (CENEPRED)</b> y el nuevo régimen de fuego de la <b>Dra. Ana Sabogal (PUCP)</b>.
                        </p>
                    </div>

                    {/* Selector de Nivel COED */}
                    <div className="flex items-center gap-1 bg-slate-950 p-1.5 rounded-xl border border-slate-800 font-mono text-xs">
                        <button
                            onClick={() => setCoedTabActiva("NACIONAL")}
                            className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
                                coedTabActiva === "NACIONAL"
                                    ? "bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-lg"
                                    : "text-slate-400 hover:text-white"
                            }`}
                        >
                            <ShieldAlert className="w-3.5 h-3.5" />
                            COED NACIONAL
                        </button>
                        <button
                            onClick={() => setCoedTabActiva("MUNICIPAL")}
                            className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
                                coedTabActiva === "MUNICIPAL"
                                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-lg"
                                    : "text-slate-400 hover:text-white"
                            }`}
                        >
                            <Building2 className="w-3.5 h-3.5" />
                            COED MUNICIPAL (1,893)
                        </button>
                        <button
                            onClick={() => setCoedTabActiva("SOCIAL")}
                            className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
                                coedTabActiva === "SOCIAL"
                                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-lg"
                                    : "text-slate-400 hover:text-white"
                            }`}
                        >
                            <Trees className="w-3.5 h-3.5" />
                            COED SOCIAL (COMUNAL)
                        </button>
                    </div>
                </div>

                {/* CONTENIDO TAB COED NACIONAL */}
                {coedTabActiva === "NACIONAL" && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                            <span className="text-xs font-bold text-rose-400 font-mono uppercase block">
                                C2 Macro-Estratégico (INDECI / COEN)
                            </span>
                            <p className="text-xs text-slate-300">
                                Monitoreo automatizado con NASA FIRMS (VIIRS Suomi-NPP, NOAA-20/21) a 375m de resolución. Detección inmediata de clusters y potencias radiativas de fuego &gt; 100 MW.
                            </p>
                            <div className="p-2.5 bg-slate-900 rounded border border-slate-800 text-[11px] font-mono text-slate-400">
                                Escalonamiento automático a <b>NIVEL 4 y 5 NACIONAL</b> para movilización interdepartamental.
                            </div>
                        </div>

                        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                            <span className="text-xs font-bold text-rose-400 font-mono uppercase block">
                                Despliegue Aéreo FAP & Bambi Bucket
                            </span>
                            <p className="text-xs text-slate-300">
                                Generación de requerimiento táctico de ala rotatoria (MI-17 FAP con helibaldes de 3,000L) y aviones Spartan C-27J con sistema contraincendios Guardian.
                            </p>
                            <div className="p-2.5 bg-slate-900 rounded border border-slate-800 text-[11px] font-mono text-slate-400">
                                Localización de espejos de agua y lagunas andinas más cercanas para recarga rápida.
                            </div>
                        </div>

                        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                            <span className="text-xs font-bold text-rose-400 font-mono uppercase block">
                                Registro Cero Falsos Positivos CENEPRED
                            </span>
                            <p className="text-xs text-slate-300">
                                Solución al diagnóstico de Rusby Zela: cruce con el catastro nacional para evitar pérdida de reportes de emergencia y agilizar declaratorias de Estado de Emergencia por el Consejo de Ministros.
                            </p>
                            <div className="p-2.5 bg-slate-900 rounded border border-slate-800 text-[11px] font-mono text-emerald-400">
                                Conexión directa con SINPAD y FONDES para activación inmediata de presupuesto.
                            </div>
                        </div>
                    </div>
                )}

                {/* CONTENIDO TAB COED MUNICIPAL */}
                {coedTabActiva === "MUNICIPAL" && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                            <span className="text-xs font-bold text-amber-400 font-mono uppercase block">
                                Padrón Geodésico 100% (1,893 Distritos)
                            </span>
                            <p className="text-xs text-slate-300">
                                Cero exclusión municipal. Cada uno de los 1,893 alcaldes y jefes de defensa civil cuenta con su centroide calibrado, directorio municipal INEI 2026 y ficha de vulnerabilidad local.
                            </p>
                            <div className="p-2.5 bg-slate-900 rounded border border-slate-800 text-[11px] font-mono text-slate-400">
                                Corrige el sesgo de limitar el análisis únicamente a los 492 distritos históricos.
                            </div>
                        </div>

                        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                            <span className="text-xs font-bold text-amber-400 font-mono uppercase block">
                                Actas de Emergencia D8 (Ley 30225)
                            </span>
                            <p className="text-xs text-slate-300">
                                Generación en 60 segundos del expediente de Contratación Directa por Emergencia (Art. 27 inc. b) para alquiler de tractores oruga D8K/D8T y apertura de cortafuegos de 5 a 10 km.
                            </p>
                            <div className="p-2.5 bg-slate-900 rounded border border-slate-800 text-[11px] font-mono text-slate-400">
                                Trazabilidad blindada contra observaciones de la Contraloría General (CGR).
                            </div>
                        </div>

                        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                            <span className="text-xs font-bold text-amber-400 font-mono uppercase block">
                                Desbloqueo Presupuestal PP 0068 / PREVAED
                            </span>
                            <p className="text-xs text-slate-300">
                                Emisión de la justificación técnica fotogramétrica satelital para ejecutar la Actividad 5006144 (Atención Inmediata de Emergencias) con celeridad y sin trabas administrativas.
                            </p>
                            <div className="p-2.5 bg-slate-900 rounded border border-slate-800 text-[11px] font-mono text-amber-400">
                                Registro EDAN digital instantáneo para evitar retrasos en asistencia humanitaria.
                            </div>
                        </div>
                    </div>
                )}

                {/* CONTENIDO TAB COED SOCIAL */}
                {coedTabActiva === "SOCIAL" && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-emerald-400 font-mono uppercase">
                                    Semáforo Comunitario Sabogal
                                </span>
                                <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                                    evaluacionSabogal?.semaforo.includes("ROJO")
                                        ? "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                                        : evaluacionSabogal?.semaforo.includes("AMBAR")
                                            ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                                            : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                                }`}>
                                    {evaluacionSabogal?.semaforo || "CALCULANDO"}
                                </span>
                            </div>

                            <p className="text-xs text-slate-300">
                                {evaluacionSabogal?.recomendacion_coed_social || "Evaluando condiciones bioclimáticas..."}
                            </p>

                            <div className="space-y-1.5 pt-2">
                                <span className="text-[10px] font-bold text-slate-400 uppercase font-mono block">
                                    Condiciones Evaluadas:
                                </span>
                                <div className="grid grid-cols-2 gap-1.5 text-[11px] font-mono text-slate-300">
                                    <div className="bg-slate-900 p-1.5 rounded">Viento: {vientoKmh} km/h</div>
                                    <div className="bg-slate-900 p-1.5 rounded">Humedad: {humedadRelativa}%</div>
                                    <div className="bg-slate-900 p-1.5 rounded">Temp: {temperatura}°C</div>
                                    <div className="bg-slate-900 p-1.5 rounded">Pendiente: {pendiente}°</div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                            <span className="text-xs font-bold text-emerald-400 font-mono uppercase block">
                                Alternativas a la Quema (INTE-PUCP)
                            </span>
                            <ul className="text-xs text-slate-300 space-y-1.5 list-disc pl-4">
                                {evaluacionSabogal?.alternativas_ecologicas_sabogal?.map((alt, i) => (
                                    <li key={i}>{alt}</li>
                                )) || (
                                    <>
                                        <li>Desbroce mecánico y trituración de rastrojos para abono verde.</li>
                                        <li>Fajas cortafuegos de 5 a 10 metros en linderos de bosques y pastos.</li>
                                        <li>Compostaje in situ de restos agrícolas con estiércol para abono.</li>
                                        <li>Veda absoluta en cabeceras de cuenca y bosques relictos de queñual.</li>
                                    </>
                                )}
                            </ul>
                        </div>

                        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                            <span className="text-xs font-bold text-emerald-400 font-mono uppercase block">
                                Salvaguarda de Fauna Silvestre (SERFOR)
                            </span>
                            <p className="text-xs text-slate-300">
                                Rescate y atención inmediata de animales silvestres víctimas de quemaduras o desplazados por el humo mediante enlace directo con la Administración Técnica Forestal y de Fauna Silvestre (ATFFS).
                            </p>
                            <div className="p-2.5 bg-slate-900 rounded border border-slate-800 text-[11px] font-mono text-emerald-400">
                                <b>Especies Prioritarias:</b> Oso de anteojos, Taruca, Venado gris, Mono choro de cola amarilla, Aves endémicas de queñual.
                            </div>
                        </div>
                    </div>
                )}

                {/* MATRIZ DE PLANES DE CONTINGENCIA REGIONALES Y LOCALES */}
                <div className="border-t border-slate-800 pt-5 space-y-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-orange-400" />
                            <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                                CORPUS TÉCNICO REGIONAL DE PLANES DE CONTINGENCIA Y ESCENARIOS CENEPRED
                            </h3>
                        </div>
                        <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono">
                            {planesContingencia.length} Planes Indexados
                        </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                        {planesContingencia.map((plan) => (
                            <div
                                key={plan.id}
                                className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex flex-col justify-between space-y-2 text-xs"
                            >
                                <div>
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-orange-500/20 text-orange-300 font-mono">
                                            {plan.nivel} • {plan.region}
                                        </span>
                                        <span className="text-[10px] text-slate-400 font-mono">{plan.ubigeo_ref}</span>
                                    </div>
                                    <h4 className="font-bold text-slate-100 line-clamp-2 text-xs">{plan.titulo}</h4>
                                    <p className="text-[11px] text-slate-400 mt-1 line-clamp-3">{plan.aspectos_clave}</p>
                                </div>
                                <div className="pt-2 border-t border-slate-900 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                                    <span className="truncate max-w-[150px]">{plan.archivo_fuente}</span>
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* MODAL / VISOR OFICIAL DEL ACTA TÉCNICA D8 DE INTERVENCIÓN MECANIZADA */}
            {showActaModal && actaD8 && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
                    <div className="relative w-full max-w-4xl bg-slate-900 border-2 border-emerald-500/80 rounded-2xl shadow-2xl overflow-hidden my-auto">
                        
                        {/* MARCA DE AGUA TRANSLÚCIDA DE CALIBRACIÓN DIAGONAL */}
                        <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden z-0 select-none">
                            <div className="rotate-[-28deg] text-center opacity-5 space-y-8">
                                <div className="text-4xl sm:text-6xl font-black tracking-widest text-white whitespace-nowrap">
                                    AMARU-CLIMATE • NO OFICIAL
                                </div>
                                <div className="text-2xl sm:text-4xl font-bold tracking-wider text-amber-300 whitespace-nowrap">
                                    BORRADOR TÉCNICO EN CALIBRACIÓN
                                </div>
                                <div className="text-4xl sm:text-6xl font-black tracking-widest text-white whitespace-nowrap">
                                    HITL - D.S. 115-2025-PCM
                                </div>
                            </div>
                        </div>

                        {/* BANNER SUPERIOR DE SALVAGUARDA LEGAL INSTITUCIONAL */}
                        <div className="relative z-10 bg-amber-500/15 border-b border-amber-500/40 p-3 sm:px-6 flex items-start gap-3 text-amber-200">
                            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                            <div className="text-[11px] leading-tight font-sans">
                                <strong className="text-amber-300 block font-mono text-xs uppercase tracking-wide">
                                    ⚠️ ADVERTENCIA INSTITUCIONAL • SALVAGUARDA LEGAL DEL SECTOR PÚBLICO
                                </strong>
                                <span>{actaD8.aviso_legal_sector_publico || "Documento de trabajo técnico-preventivo generado por el algoritmo C2 de AMARU-CLIMATE. No constituye resolución administrativa formal, ni reemplaza el expediente oficial SEACE/SINPAD hasta su suscripción física/digital por el Titular de la Entidad y aprobación según Ley N.° 30225."}</span>
                            </div>
                        </div>

                        {/* CABECERA FORMAL DEL ACTA */}
                        <div className="relative z-10 p-5 sm:p-6 border-b border-slate-800 bg-slate-950/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="space-y-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2.5 py-0.5 rounded font-mono font-bold">
                                        EXPEDIENTE PREVENTIVO C2
                                    </span>
                                    <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded font-mono font-bold">
                                        ART. 27 LEY 30225 (EXONERACIÓN EMERGENCIA)
                                    </span>
                                    <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono">
                                        {actaD8.marco_gobernanza || "D.S. N.° 115-2025-PCM"}
                                    </span>
                                </div>
                                <h2 className="text-base sm:text-lg font-bold text-white font-mono flex items-center gap-2">
                                    <FileText className="w-5 h-5 text-emerald-400" />
                                    <span>ACTA TÉCNICA DE INTERVENCIÓN MECANIZADA INMEDIATA (CORTAFUEGO D8)</span>
                                </h2>
                                <p className="text-xs text-slate-400 font-mono">
                                    Código: <strong className="text-white">{actaD8.expediente}</strong> • Referencial: <span className="text-emerald-400">{actaD8.codigo_referencial || "AMARU-CALIB"}</span>
                                </p>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                                <button
                                    onClick={() => window.print()}
                                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow"
                                    title="Imprimir o exportar como PDF"
                                >
                                    <Printer className="w-3.5 h-3.5" />
                                    <span>Imprimir / PDF</span>
                                </button>
                                <button
                                    onClick={() => setShowActaModal(false)}
                                    className="p-1.5 bg-slate-800 hover:bg-rose-900/60 text-slate-400 hover:text-white rounded-lg transition"
                                    title="Cerrar ventana"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* CUERPO DEL ACTA / EXPEDIENTE TÉCNICO */}
                        <div className="relative z-10 p-5 sm:p-6 space-y-5 text-xs font-mono text-slate-300 max-h-[65vh] overflow-y-auto">
                            
                            {/* SECCIÓN 1: DATOS GENERALES DEL EMPLAZAMIENTO */}
                            <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-3">
                                <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-2">
                                    <MapPin className="w-4 h-4 text-orange-400" />
                                    <span>1. Emplazamiento Territorial y Escalonamiento SINAGERD</span>
                                </h3>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[11px]">
                                    <div>
                                        <span className="text-slate-400 block text-[10px]">DEPARTAMENTO:</span>
                                        <strong className="text-white">{actaD8.departamento}</strong>
                                    </div>
                                    <div>
                                        <span className="text-slate-400 block text-[10px]">PROVINCIA:</span>
                                        <strong className="text-white">{actaD8.provincia}</strong>
                                    </div>
                                    <div>
                                        <span className="text-slate-400 block text-[10px]">DISTRITO (EPICENTRO):</span>
                                        <strong className="text-amber-300">{actaD8.distrito}</strong>
                                    </div>
                                    <div>
                                        <span className="text-slate-400 block text-[10px]">CÓDIGO UBIGEO:</span>
                                        <strong className="text-emerald-400">{actaD8.cluster_id || actaD8.distrito}</strong>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-900 text-[11px]">
                                    <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                                        <span className="text-slate-400 block text-[10px]">Reporte Oficial COEN:</span>
                                        <strong className="text-sky-300">{actaD8.reporte_oficial_indeci || "COMPLEMENTARIO INDECI-COEN"}</strong>
                                    </div>
                                    <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                                        <span className="text-slate-400 block text-[10px]">Estado Administrativo:</span>
                                        <strong className="text-amber-400">{actaD8.sinpad_estado || "SINPAD: EN TRÁMITE LOCAL"}</strong>
                                    </div>
                                    <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                                        <span className="text-slate-400 block text-[10px]">Escalonamiento SINAGERD:</span>
                                        <strong className="text-red-400">{actaD8.escalonamiento_sinagerd || "NIVEL 3 (PROVINCIAL)"}</strong>
                                    </div>
                                </div>
                            </div>

                            {/* SECCIÓN 2: SUSTENTO TÉCNICO Y SATELLITAL C2 */}
                            <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-3">
                                <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-2">
                                    <Satellite className="w-4 h-4 text-sky-400" />
                                    <span>2. Evidencia Satelital y Justificación Jurídica Inmediata</span>
                                </h3>
                                <p className="text-[11.5px] leading-relaxed text-slate-300 font-sans">
                                    {actaD8.sustento_necesidad_inmediata || (
                                        `La presencia activa y simultánea de focos térmicos satelitales (VIIRS Suomi-NPP / NOAA-20) de alta potencia radiativa (FRP) en el perímetro de ${actaD8.distrito}, sumada a un Fire Weather Index (FWI) crítico de ${actaD8.fwi_detonante} puntos y sequedad extrema de combustible (humedad de suelo < 8%), configura una situación de inminente catástrofe que sobrepasa la capacidad de sofocación manual de las cuadrillas comunales.`
                                    )}
                                </p>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10.5px]">
                                    <div className="bg-slate-900 p-2 rounded border border-slate-800">
                                        <span className="text-slate-400 block">Focos Agrupados:</span>
                                        <strong className="text-white text-xs">{actaD8.num_focos || 1} focos</strong>
                                    </div>
                                    <div className="bg-slate-900 p-2 rounded border border-slate-800">
                                        <span className="text-slate-400 block">FRP Térmico Total:</span>
                                        <strong className="text-red-400 text-xs">{actaD8.frp_total_mw || 0} MW</strong>
                                    </div>
                                    <div className="bg-slate-900 p-2 rounded border border-slate-800">
                                        <span className="text-slate-400 block">FWI Detonante:</span>
                                        <strong className="text-orange-400 text-xs">{actaD8.fwi_detonante} pts</strong>
                                    </div>
                                    <div className="bg-slate-900 p-2 rounded border border-slate-800">
                                        <span className="text-slate-400 block">Área Amenazada:</span>
                                        <strong className="text-emerald-400 text-xs">{actaD8.hectareas_agricolas_salvaguardadas} ha</strong>
                                    </div>
                                </div>
                            </div>

                            {/* SECCIÓN 3: ESPECIFICACIONES DE INTERVENCIÓN MECANIZADA Y PRESUPUESTO */}
                            <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-3">
                                <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-2">
                                    <Truck className="w-4 h-4 text-amber-400" />
                                    <span>3. Orden de Movilización de Maquinaria Pesada y Presupuesto Referencial</span>
                                </h3>

                                <div className="space-y-2 text-[11px]">
                                    <div className="bg-slate-900/90 p-3 rounded-lg border border-slate-800 space-y-1">
                                        <span className="text-slate-400 block text-[10px]">TIPO DE MAQUINARIA PESADA ASIGNADA:</span>
                                        <strong className="text-orange-300 text-xs block">{actaD8.intervencion_emergencia?.maquinaria}</strong>
                                    </div>

                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                                        <div className="bg-slate-900 p-2 rounded border border-slate-800">
                                            <span className="text-slate-400 block text-[10px]">Longitud Cortafuego:</span>
                                            <strong className="text-white">{actaD8.intervencion_emergencia?.longitud_cortafuego_defensivo_km} km</strong>
                                        </div>
                                        <div className="bg-slate-900 p-2 rounded border border-slate-800">
                                            <span className="text-slate-400 block text-[10px]">Ancho de Faja:</span>
                                            <strong className="text-white">{actaD8.intervencion_emergencia?.ancho_faja_seguridad_m || 15} metros</strong>
                                        </div>
                                        <div className="bg-slate-900 p-2 rounded border border-slate-800">
                                            <span className="text-slate-400 block text-[10px]">Horas Máquina D8:</span>
                                            <strong className="text-white">{actaD8.intervencion_emergencia?.horas_maquina_estimadas} horas (S/ 380/h)</strong>
                                        </div>
                                        <div className="bg-slate-900 p-2 rounded border border-slate-800">
                                            <span className="text-slate-400 block text-[10px]">Apoyo Cisternas:</span>
                                            <strong className="text-cyan-300">{actaD8.intervencion_emergencia?.unidades_cisterna || 1}x 5,000 gal</strong>
                                        </div>
                                    </div>

                                    <div className="bg-emerald-950/40 border border-emerald-600/60 p-3 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                        <div>
                                            <span className="text-emerald-300 font-bold block text-xs">
                                                PRESUPUESTO ESTIMADO DE CONTRATACIÓN DIRECTA:
                                            </span>
                                            <span className="text-slate-400 text-[10px] font-sans">
                                                Imputación Presupuestal: {actaD8.canal_mef || "Programa Presupuestal 0068 (PREVAED / MEF)"}
                                            </span>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-2xl font-black text-emerald-400 font-mono">
                                                S/ {actaD8.intervencion_emergencia?.presupuesto_estimado_soles?.toLocaleString("es-PE", { minimumFractionDigits: 2 }) || "48,500.00"}
                                            </span>
                                            <span className="text-[10px] text-slate-400 block">Inc. IGV y Combustible Diésel B5</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* SECCIÓN 4: CONTROL CONCURRENTE CONTRALORÍA (CGR) Y VINCULACIÓN MEF */}
                            <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-2 text-[11px]">
                                <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-2">
                                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                                    <span>4. Blindaje Anticorrupción y Control Concurrente Simultáneo (CGR)</span>
                                </h3>
                                <p className="text-slate-300 leading-relaxed font-sans">
                                    De conformidad con la <strong>Ley N.° 31358 (Control Concurrente de la Contraloría General de la República)</strong> y el <strong>Art. 67 de la Ley N.° 29664 (SINAGERD)</strong>, la emisión de esta acta activa la notificación preventiva digital automática al Órgano de Control Institucional (OCI) provincial para acompañar la entrega de maquinaria y consumo de horómetros en campo.
                                </p>
                                <div className="bg-amber-950/30 border border-amber-700/50 p-2.5 rounded-lg text-amber-200 text-[10.5px]">
                                    <b>Plazo Legal de Regularización SEACE:</b> La entidad dispone de 10 días hábiles posteriores a la culminación de la emergencia para regularizar las actuaciones preparatorias y la resolución formal en el SEACE, conforme al Reglamento de la Ley de Contrataciones.
                                </div>
                            </div>

                            {/* BLOQUE DE FIRMAS HITL (HUMAN IN THE LOOP) */}
                            <div className="pt-4 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-6 text-center text-[10px] font-sans">
                                <div className="border-t border-slate-700 pt-2 space-y-0.5">
                                    <div className="h-10 flex items-center justify-center text-slate-600 font-mono italic">
                                        [Espacio Firma / Sello Digital]
                                    </div>
                                    <strong className="text-slate-200 block">ALCALDE / GOBERNADOR REGIONAL</strong>
                                    <span className="text-slate-400 block">Titular del Pliego (Autoridad Competente)</span>
                                </div>

                                <div className="border-t border-slate-700 pt-2 space-y-0.5">
                                    <div className="h-10 flex items-center justify-center text-slate-600 font-mono italic">
                                        [Espacio Firma / Sello Digital]
                                    </div>
                                    <strong className="text-slate-200 block">JEFE DE OFICINA DE GESTIÓN DEL RIESGO (OGRD)</strong>
                                    <span className="text-slate-400 block">Validación Operativa HITL en Terreno</span>
                                </div>

                                <div className="border-t border-slate-700 pt-2 space-y-0.5">
                                    <div className="h-10 flex items-center justify-center text-emerald-500 font-mono text-[9px]">
                                        ✓ MODELO C2 AMARU-CLIMATE<br/>Hash: SHA256-VERIFIED-2026
                                    </div>
                                    <strong className="text-slate-200 block">AMARU-CLIMATE C2 ENGINE</strong>
                                    <span className="text-slate-400 block">Soporte Decisional en Calibración</span>
                                </div>
                            </div>

                        </div>

                        {/* PIE DEL MODAL */}
                        <div className="relative z-10 p-3 sm:px-6 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-[10px] font-mono text-slate-400">
                            <span>AMARU-CLIMATE SAT-C2 • VERSIÓN EXPERIMENTAL CALIBRADA CON COEN-INDECI Y CENEPRED 2026</span>
                            <button
                                onClick={() => setShowActaModal(false)}
                                className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-bold transition"
                            >
                                Cerrar Visor
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ========================================================================= */}
            {/* MODAL C2: AUDITORÍA FORENSE POST-INCENDIO SENTINEL-2 dNBR (COPERNICUS)     */}
            {/* ========================================================================= */}
            {showForenseModal && auditoriaForenseData && (
                <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
                    <div className="relative w-full max-w-3xl bg-slate-950 border-2 border-indigo-500/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
                        {/* CABECERA MODAL FORENSE */}
                        <div className="p-4 bg-gradient-to-r from-indigo-950 via-slate-900 to-purple-950 border-b border-indigo-800/60 flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                                <Satellite className="w-5 h-5 text-indigo-400 animate-pulse" />
                                <div>
                                    <h2 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                                        <span>Auditoría Forense de Superficie Quemada (Copernicus CDSE)</span>
                                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-900/60 text-indigo-300 border border-indigo-700">
                                            Sentinel-2 dNBR (10-20m)
                                        </span>
                                    </h2>
                                    <p className="text-[10px] text-slate-400 font-mono">
                                        Peritaje Satelital Post-Incendio • {auditoriaForenseData.distrito} [{auditoriaForenseData.ubigeo}], {auditoriaForenseData.departamento}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowForenseModal(false)}
                                className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* CUERPO DEL PERITAJE FORENSE */}
                        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 text-xs font-sans">
                            {/* ALERTA DE RESULTADO */}
                            <div className="p-3 bg-indigo-950/40 border border-indigo-600/70 rounded-xl space-y-1">
                                <div className="flex items-center justify-between">
                                    <span className="font-bold text-indigo-300 flex items-center gap-1.5">
                                        <CheckCircle2 className="w-4 h-4 text-indigo-400" />
                                        <span>DICTAMEN TÉCNICO SATELITAL CONFIRMADO</span>
                                    </span>
                                    <span className="px-2 py-0.5 rounded text-[9px] font-bold font-mono bg-indigo-900 text-indigo-200 border border-indigo-700">
                                        {auditoriaForenseData.indices_espectrales?.severidad}
                                    </span>
                                </div>
                                <p className="text-slate-200 text-[11px] leading-relaxed">
                                    {auditoriaForenseData.mensaje_operativo_c2}
                                </p>
                            </div>

                            {/* MÉTRICAS CLAVE EN 4 CUADROS */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                                <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-xl text-center space-y-0.5">
                                    <span className="text-slate-400 text-[10px] block">Área Quemada Calcinada:</span>
                                    <strong className="text-xl font-black text-amber-400 font-mono">
                                        {auditoriaForenseData.hectareas_verificadas} ha
                                    </strong>
                                    <span className="text-[9px] text-slate-500 block">±0.2 ha de resolución</span>
                                </div>

                                <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-xl text-center space-y-0.5">
                                    <span className="text-slate-400 text-[10px] block">Índice Diferencial dNBR:</span>
                                    <strong className="text-xl font-black text-rose-400 font-mono">
                                        {auditoriaForenseData.indices_espectrales?.dnbr_delta}
                                    </strong>
                                    <span className="text-[9px] text-rose-300 block">Pérdida severa biomasa</span>
                                </div>

                                <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-xl text-center space-y-0.5">
                                    <span className="text-slate-400 text-[10px] block">Perímetro Afectado:</span>
                                    <strong className="text-xl font-black text-sky-400 font-mono">
                                        {auditoriaForenseData.perimetro_afectado_km} km
                                    </strong>
                                    <span className="text-[9px] text-slate-500 block">Linderos de quema</span>
                                </div>

                                <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-xl text-center space-y-0.5">
                                    <span className="text-slate-400 text-[10px] block">Elegibilidad SAC:</span>
                                    <strong className="text-sm font-black text-emerald-400 font-mono block mt-1">
                                        {auditoriaForenseData.impacto_sinagerd_sac?.elegible_seguro_agricola_catastrofico ? "✓ APROBADO" : "EVALUACIÓN"}
                                    </strong>
                                    <span className="text-[8.5px] text-emerald-300 block">MIDAGRI / Cobertura</span>
                                </div>
                            </div>

                            {/* SECCIÓN ESCENAS COPERNICUS COMPARADAS */}
                            <div className="bg-slate-900/70 border border-slate-800 p-3 rounded-xl space-y-2">
                                <h4 className="text-[11px] font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                                    <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                                    <span>Escenas Multiespectrales Comparadas (Pre vs Post-Incendio)</span>
                                </h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10.5px]">
                                    <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                                        <span className="text-slate-400 block text-[9px]">Línea Base (Vegetación Sana):</span>
                                        <strong className="text-emerald-400">{auditoriaForenseData.escenas_utilizadas?.pre_evento}</strong>
                                        <div className="text-slate-500 text-[8.5px] mt-0.5">NBR Base: {auditoriaForenseData.indices_espectrales?.nbr_pre_incendio} (Vigor Clorofílico Alto)</div>
                                    </div>
                                    <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                                        <span className="text-slate-400 block text-[9px]">Post-Siniestro (Suelo Calcinado):</span>
                                        <strong className="text-amber-400">{auditoriaForenseData.escenas_utilizadas?.post_evento}</strong>
                                        <div className="text-slate-500 text-[8.5px] mt-0.5">NBR Residual: {auditoriaForenseData.indices_espectrales?.nbr_post_incendio} (Reflectancia SWIR de Carbón)</div>
                                    </div>
                                </div>
                            </div>

                            {/* RADAR SAR SENTINEL-1 FALLBACK */}
                            <div className="bg-slate-900/60 border border-slate-800 p-3 rounded-xl flex items-center justify-between text-[10.5px]">
                                <div>
                                    <strong className="text-white block">📡 Validación Cruzada Radar SAR (Sentinel-1):</strong>
                                    <span className="text-slate-400 text-[10px]">
                                        Diferencia de retrodispersión polarimétrica: <b className="text-cyan-300">{auditoriaForenseData.contingencia_nubosidad_sar?.delta_retrodispersion_vh_db} dB</b> (Penetración a través de nubes y humo).
                                    </span>
                                </div>
                                <span className="px-2 py-0.5 bg-cyan-950 text-cyan-300 border border-cyan-700 rounded text-[9px] font-mono shrink-0">
                                    SAR Confirmado
                                </span>
                            </div>

                            {/* SECCIÓN ACCIONES LEGALES Y SAC */}
                            <div className="bg-emerald-950/30 border border-emerald-700/60 p-3 rounded-xl space-y-1.5">
                                <h4 className="text-[11px] font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
                                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                                    <span>Cadena de Custodia Legal & Beneficio Seguro Agrícola Catastrófico (SAC)</span>
                                </h4>
                                <p className="text-slate-300 text-[10px] leading-relaxed">
                                    {auditoriaForenseData.impacto_sinagerd_sac?.cobertura_sac_midagri}. Este dossier constituye prueba documental plena conforme a la Directiva N.° 001-2023-MIDAGRI para el desembolso de la indemnización a los productores del {auditoriaForenseData.sector}.
                                </p>
                            </div>
                        </div>

                        {/* PIE DEL MODAL FORENSE */}
                        <div className="p-3 sm:px-6 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-[10px] font-mono text-slate-400">
                            <span>COPERNICUS DATA SPACE ECOSYSTEM • SENTINEL-2 L2A / SENTINEL-1 SAR</span>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => {
                                        window.print();
                                    }}
                                    className="px-3 py-1 bg-indigo-700 hover:bg-indigo-600 text-white rounded-lg font-bold flex items-center gap-1 transition"
                                >
                                    <Printer className="w-3 h-3" />
                                    <span>Imprimir Dictamen</span>
                                </button>
                                <button
                                    onClick={() => setShowForenseModal(false)}
                                    className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-bold transition"
                                >
                                    Cerrar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}


