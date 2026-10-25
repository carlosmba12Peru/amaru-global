"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
    Clock,
    Maximize2,
    Minimize2,
    Flame,
    Snowflake,
    AlertTriangle,
    ShieldCheck,
    History,
    CheckSquare,
    Waves,
    Compass,
    Sparkles,
    Calendar,
    ChevronRight,
    Info,
    Volume2,
    Play,
    Pause,
    GraduationCap,
    BookOpen,
    Landmark,
    ShieldAlert,
    CloudRain,
    Truck,
    Building2,
    ExternalLink,
    Mountain,
    Milestone,
    ChevronDown,
    ChevronUp
} from "lucide-react";

export interface TacticalPolarClockProps {
    className?: string;
    initialMode?: "AMARU-FEN" | "AMARU-CHIRI" | "AMARU-FUEGO";
}

export default function TacticalPolarClock({
    className = "",
    initialMode = "AMARU-FEN"
}: TacticalPolarClockProps) {
    const [clockType, setClockType] = useState<"AMARU-FEN" | "AMARU-CHIRI" | "AMARU-FUEGO">(initialMode);
    const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
    const [selectedStation, setSelectedStation] = useState<any>(null);
    const [hoveredStationId, setHoveredStationId] = useState<string | null>(null);
    const [timelineScale, setTimelineScale] = useState<"days" | "months">("days");
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [yachayMode, setYachayMode] = useState<boolean>(true); // Activo por defecto para educación climática
    const [playingSpeech, setPlayingSpeech] = useState<string | null>(null);
    const [speechLang, setSpeechLang] = useState<"quechua" | "aymara" | "castellano">("quechua");
    const [expandedObrasGroup, setExpandedObrasGroup] = useState<string | null>("G1_DEFENSAS_RIBERENAS");


    const speakText = (text: string, id: string) => {
        if (!("speechSynthesis" in window)) {
            alert("Tu navegador no soporta síntesis de voz.");
            return;
        }
        window.speechSynthesis.cancel();
        if (playingSpeech === id) {
            setPlayingSpeech(null);
            return;
        }
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = "es-PE";
        utterance.rate = 0.92;
        utterance.onstart = () => setPlayingSpeech(id);
        utterance.onend = () => setPlayingSpeech(null);
        utterance.onerror = () => setPlayingSpeech(null);
        window.speechSynthesis.speak(utterance);
    };

    const fetchTelemetry = async () => {
        try {
            const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
            const res = await fetch(`${apiBase}/api/clocks/enso`);
            if (res.ok) {
                const json = await res.json();
                setData(json);
            }
        } catch (err) {
            console.warn("Error fetching /api/clocks/enso, using live local calculation", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTelemetry();
        const interval = setInterval(fetchTelemetry, 15000); // Polling cada 15s
        return () => clearInterval(interval);
    }, []);

    // Datos por defecto mientras carga o si backend se desconecta
    const fen = data?.amaru_fen || {
        titulo: "Reloj AMARU-FEN (Costa Pacífica & Cuencas Bajas)",
        amenaza: "ALERTA_EL_NINO_COSTERO",
        anomalia_tsm_c: 2.6,
        temperatura_mar_c: 23.6,
        onda_kelvin: true,
        angulo_aguja: 276.95,
        cronograma_multianual_fen: [
            { id: "m1", mes: "SET 26", anio: 2026, label: "Setiembre 2026", estado: "EN_CURSO", es_hoy: true, dia_inicio: 0, dia_fin: 30, dia_rango_relativo: "D+0 → D+30", duracion_dias: 30, fase: "Detección Temprana", anomalia_tsm: "+1.2°C", color: "#38bdf8", severidad_pct: 20, tipo: "CIVIL_HOY", analogo: "Vigilancia Inicial", consecuencias_proyectadas: "Detección temprana de anomalías térmicas en litoral norte y primeras ondas Kelvin. Fase obligatoria para agilizar contrataciones de emergencia y expedientes técnicos de defensas." },
            { id: "m2", mes: "OCT 26", anio: 2026, label: "Octubre 2026", estado: "PREVISTO", es_hoy: false, dia_inicio: 31, dia_fin: 61, dia_rango_relativo: "D+31 → D+61", duracion_dias: 31, fase: "Ondas Kelvin Cálidas", anomalia_tsm: "+1.6°C", color: "#f87171", severidad_pct: 30, tipo: "ALERTA", analogo: "Alerta ENFEN", consecuencias_proyectadas: "Aceleración del calentamiento costero en Paita y Talara. Despliegue anticipado de convoyes de maquinaria pesada hacia cuencas vulnerables de Piura, Lambayeque y La Libertad." },
            { id: "m3", mes: "NOV 26", anio: 2026, label: "Noviembre 2026", estado: "CRITICO", es_hoy: false, dia_inicio: 62, dia_fin: 91, dia_rango_relativo: "D+62 → D+91 (NOV★)", duracion_dias: 30, fase: "VENTANA DORADA (DEADLINE)", anomalia_tsm: "+2.1°C", color: "#facc15", severidad_pct: 45, tipo: "VENTANA_DORADA", analogo: "Hito Táctico C2", consecuencias_proyectadas: "DEADLINE FÍSICO IMPRORROGABLE: Límite final para descolmatación y enrocado riprap en fajas marginales urbanas antes de que las avenidas fluviales impidan el trabajo de maquinaria." },
            { id: "m4", mes: "DIC 26", anio: 2026, label: "Diciembre 2026", estado: "AMENAZA", es_hoy: false, dia_inicio: 92, dia_fin: 122, dia_rango_relativo: "D+92 → D+122", duracion_dias: 31, fase: "Inicio Lluvias Costeras", anomalia_tsm: "+2.5°C", color: "#ef4444", severidad_pct: 60, tipo: "AMENAZA_INICIAL", analogo: "FEN 2012 / 2019", consecuencias_proyectadas: "Lluvias torrenciales tempranas en Tumbes y Piura. Saturación inicial de quebradas secas y primeros desvíos preventivos de tránsito en tramos vulnerables de la Panamericana Norte." },
            { id: "m5", mes: "ENE 27", anio: 2027, label: "Enero 2027", estado: "ALERTA_MAX", es_hoy: false, dia_inicio: 123, dia_fin: 153, dia_rango_relativo: "D+123 → D+153", duracion_dias: 31, fase: "Ciclón & Ondas Costeras", anomalia_tsm: "+2.9°C", color: "#dc2626", severidad_pct: 75, tipo: "AMENAZA_SEVERA", analogo: "Ciclón Yaku (+2.8°C)", consecuencias_proyectadas: "Acoplamiento atmosférico oceánico análogo a Yaku. Activación violenta de quebradas costeras y saturación rápida de suelos en cuencas de Lima y Áncash." },
            { id: "m6", mes: "FEB 27", anio: 2027, label: "Febrero 2027", estado: "ALERTA_MAX", es_hoy: false, dia_inicio: 154, dia_fin: 181, dia_rango_relativo: "D+154 → D+181", duracion_dias: 28, fase: "Huaicos y Desbordes", anomalia_tsm: "+3.3°C", color: "#b91c1c", severidad_pct: 90, tipo: "AMENAZA_MUY_FUERTE", analogo: "Niño 2017 (+3.2°C)", consecuencias_proyectadas: "Avenidas máximas sostenidas en ríos Piura y La Leche (>2,000 m³/s). Colapso de alcantarillados urbanos, anegamiento masivo y caída de puentes carrozables secundarios." },
            { id: "m7", mes: "MAR 27", anio: 2027, label: "Marzo 2027", estado: "CATASTROFE", es_hoy: false, dia_inicio: 182, dia_fin: 212, dia_rango_relativo: "D+182 → D+212 (MARZO🚨)", duracion_dias: 31, fase: "CLÍMAX HISTÓRICO FEN", anomalia_tsm: "+4.1°C", color: "#450a0a", severidad_pct: 100, tipo: "CLIMAX_HISTORICO", analogo: "Mega-Niño 1982-83 / 97-98", consecuencias_proyectadas: "CLÍMAX HISTÓRICO CATASTRÓFICO: Máximo acoplamiento térmico costero. Activación simultánea de cuencas norte y centro (Rímac, Piura, Tumbes). Aislamiento interregional prolongado e inundación de valles agrícolas." },
            { id: "m8", mes: "ABR 27", anio: 2027, label: "Abril 2027", estado: "IMPACTO", es_hoy: false, dia_inicio: 213, dia_fin: 242, dia_rango_relativo: "D+213 → D+242", duracion_dias: 30, fase: "Resaca Fluvial & Aluviones", anomalia_tsm: "+2.7°C", color: "#b91c1c", severidad_pct: 70, tipo: "RESACA_FLUVIAL", analogo: "Cola Aluvial Post-Pico", consecuencias_proyectadas: "Resaca fluvial y aluviones de lodo remanentes. Cuencas bajas con desagüe lento, lagunas artificiales en áreas deprimidas y desborde por sedimentación acumulada." },
            { id: "m9", mes: "MAY 27", anio: 2027, label: "Mayo 2027", estado: "DESCENSO", es_hoy: false, dia_inicio: 243, dia_fin: 273, dia_rango_relativo: "D+243 → D+273", duracion_dias: 31, fase: "Descompresión & Alisios", anomalia_tsm: "+1.9°C", color: "#ea580c", severidad_pct: 45, tipo: "DESCOMPRESION", analogo: "Reinstalación Alisios", consecuencias_proyectadas: "Descompresión convectiva e intensificación de vientos alisios del sur. Crisis epidemiológica secundaria por vectores (Dengue, Leptospirosis, EDA) y desabastecimiento de insumos básicos." },
            { id: "m10", mes: "JUN 27", anio: 2027, label: "Junio 2027", estado: "REMANENTE", es_hoy: false, dia_inicio: 274, dia_fin: 303, dia_rango_relativo: "D+274 → D+303", duracion_dias: 30, fase: "Saturación de Suelos", anomalia_tsm: "+1.2°C", color: "#f59e0b", severidad_pct: 30, tipo: "SATURACION_SUELOS", analogo: "Monitoreo Reconstrucción", consecuencias_proyectadas: "Suelos saturados al 80%. Obras tempranas de rehabilitación de transitabilidad, dragado de sedimentos en reservorios (Poechos/San Lorenzo) y restitución de servicios básicos." },
            { id: "m11", mes: "JUL 27", anio: 2027, label: "Julio 2027", estado: "CIERRE", es_hoy: false, dia_inicio: 304, dia_fin: 334, dia_rango_relativo: "D+304 → D+334 (JULIO CIERRE)", duracion_dias: 31, fase: "Cierre Ciclo Interanual", anomalia_tsm: "+0.5°C", color: "#10b981", severidad_pct: 15, tipo: "CIERRE_INTERANUAL", analogo: "Transición a Normalidad", consecuencias_proyectadas: "Cierre del ciclo interanual 2026-2027. Normalización progresiva de anomalías térmicas marinas y balance definitivo de daños multisectoriales para reconstrucción definitiva." }
        ],
        ventana_dorada: {
            mes: "Noviembre",
            badge: "NOV★ DEADLINE",
            dias_restantes: 47,
            estado_urgencia: "CRITICO_VENTANA_CERRANDOSE",
            cartera_obras_pp0068: {
                programa_presupuestal: "0068: REDUCCION DE VULNERABILIDAD Y ATENCION DE EMERGENCIAS POR DESASTRES",
                fuente_oficial: "Consulta Amigable MEF - Datos Abiertos SIAF 2026",
                fecha_corte: "2026-09-20",
                total_obras_auditadas: 643,
                pim_total_soles: 1443477787.0,
                devengado_total_soles: 803290927.0,
                promedio_simple_avance_global: 44.3,
                avance_ponderado_pim_global: 55.6,
                obras_en_alarma_critica_total: 177,
                alerta_doctrina_ventana_dorada: "DESCALCE HIDROLÓGICO CRÍTICO: Las defensas ribereñas registran apenas 37.7% de avance ponderado con 146 obras en riesgo de abandono (<20%), mientras que la aguja de amenaza FEN se aproxima a Diciembre 2026. Se requiere habilitar turnos 24/7 y Contratación Directa de Emergencia (Art. 27 Ley N.º 30225).",
                grupos_estrategicos: [
                    {
                        id: "G5_CAPACIDAD_OPERATIVA",
                        nombre: "Capacidad Operativa, Maquinaria y Logística de Emergencia",
                        descripcion: "Pool de maquinaria pesada, combustible para motobombas, almacenes de ayuda humanitaria y COED Nacional/Regional.",
                        icono: "Truck",
                        color_alerta: "#10b981",
                        diagnostico_doctrina: "Alto nivel de devengado central (Acciones Comunes INDECI / FFAA), requiriendo preposicionamiento territorial acelerado en almacenes adelantados.",
                        total_obras: 16,
                        pim_soles: 595507845.0,
                        devengado_soles: 437981980.0,
                        promedio_simple_avance: 41.6,
                        avance_ponderado_pim: 73.5,
                        obras_criticas_menor_20: 3,
                        obras_avanzadas_mayor_70: 5,
                        porcentaje_obras_criticas: 18.8,
                        ejemplos_principales: [
                            { cui: "3000001", nombre: "ACCIONES COMUNES", pim_soles: 452202449.0, devengado_soles: 341517448.0, porcentaje_ejecucion: 75.5, departamento: "MULTIDEPARTAMENTAL", semaforo: "VERDE_CONFORME" },
                            { cui: "3000734", nombre: "CAPACIDAD INSTALADA PARA LA PREPARACION Y RESPUESTA FRENTE A EMERGENCIAS", pim_soles: 95887850.0, devengado_soles: 63172813.0, porcentaje_ejecucion: 65.9, departamento: "LIMA", semaforo: "VERDE_CONFORME" },
                            { cui: "2663867", nombre: "MEJORAMIENTO Y AMPLIACION DEL SERVICIO DE ALERTA TEMPRANA EN LA CUENCA", pim_soles: 25187499.0, devengado_soles: 24982100.0, porcentaje_ejecucion: 99.2, departamento: "PIURA", semaforo: "VERDE_CONFORME" }
                        ]
                    },
                    {
                        id: "G1_DEFENSAS_RIBERENAS",
                        nombre: "Defensas Ribereñas y Control de Inundaciones",
                        descripcion: "Enrocado riprap, diques longitudinales, muros de contención y encauzamiento en fajas marginales fluviales.",
                        icono: "ShieldAlert",
                        color_alerta: "#ef4444",
                        diagnostico_doctrina: "Cuello de botella más severo: 146 obras en zona roja (<20% de avance). Riesgo inminente de desborde si la crecida de diciembre arriba con obras inconclusas.",
                        total_obras: 502,
                        pim_soles: 568285789.0,
                        devengado_soles: 214474853.0,
                        promedio_simple_avance: 40.8,
                        avance_ponderado_pim: 37.7,
                        obras_criticas_menor_20: 146,
                        obras_avanzadas_mayor_70: 174,
                        porcentaje_obras_criticas: 29.1,
                        ejemplos_principales: [
                            { cui: "3000735", nombre: "DESARROLLO DE MEDIDAS DE INTERVENCION PARA LA PROTECCION FISICA FRENTE A PELIGROS", pim_soles: 101412732.0, devengado_soles: 45432904.0, porcentaje_ejecucion: 44.8, departamento: "MULTIDEPARTAMENTAL", semaforo: "AMARILLO_RIESGO" },
                            { cui: "2571084", nombre: "AMPLIACION DEL SERVICIO DE PROTECCION EN RIBERAS DEL RIO MOQUEGUA", pim_soles: 16498722.0, devengado_soles: 11234900.0, porcentaje_ejecucion: 68.1, departamento: "MOQUEGUA", semaforo: "VERDE_CONFORME" },
                            { cui: "2669349", nombre: "CREACION DE LOS SERVICIOS DE PROTECCION EN RIBERAS DE RIO VULNERABLES", pim_soles: 15357443.0, devengado_soles: 9598400.0, porcentaje_ejecucion: 62.5, departamento: "ANCASH", semaforo: "VERDE_CONFORME" }
                        ]
                    },
                    {
                        id: "G6_LOCALES_ESENCIALES_MITIGACION",
                        nombre: "Locales Esenciales (Colegios IRI) y Mitigación Complementaria",
                        descripcion: "Intervenciones de Reconstrucción mediante Inversiones (IRI) en colegios y centros de salud, además de obras complementarias.",
                        icono: "Building2",
                        color_alerta: "#10b981",
                        diagnostico_doctrina: "Avance favorable superior al 54%, focalizado en protección perimétrica de locales educativos y postas médicas de primera línea.",
                        total_obras: 80,
                        pim_soles: 187858764.0,
                        devengado_soles: 102033710.0,
                        promedio_simple_avance: 63.5,
                        avance_ponderado_pim: 54.3,
                        obras_criticas_menor_20: 17,
                        obras_avanzadas_mayor_70: 44,
                        porcentaje_obras_criticas: 21.2,
                        ejemplos_principales: [
                            { cui: "3000736", nombre: "EDIFICACIONES SEGURAS ANTE EL RIESGO DE DESASTRES", pim_soles: 38098617.0, devengado_soles: 23659241.0, porcentaje_ejecucion: 62.1, departamento: "LIMA", semaforo: "VERDE_CONFORME" },
                            { cui: "3000738", nombre: "PERSONAS CON FORMACION Y CONOCIMIENTO EN GESTION DEL RIESGO", pim_soles: 17307916.0, devengado_soles: 10713600.0, porcentaje_ejecucion: 61.9, departamento: "LIMA", semaforo: "VERDE_CONFORME" },
                            { cui: "2458555", nombre: "MEJORAMIENTO Y AMPLIACION SERVICIO DE PROTECCION ANTE INUNDACIONES", pim_soles: 16781503.0, devengado_soles: 9078793.0, porcentaje_ejecucion: 54.1, departamento: "LA LIBERTAD", semaforo: "AMARILLO_RIESGO" }
                        ]
                    },
                    {
                        id: "G3_CONTROL_QUEBRADAS",
                        nombre: "Control de Torrenteras, Quebradas y Huaycos",
                        descripcion: "Diques transversales, barreras dinámicas y estabilización de laderas en cauces torrenciales secos.",
                        icono: "Mountain",
                        color_alerta: "#38bdf8",
                        diagnostico_doctrina: "Avance sostenido en descolmatación de torrenteras (Ica, Chosica), pero con retrasos puntuales en adquisición de geomallas y gaviones.",
                        total_obras: 16,
                        pim_soles: 58572396.0,
                        devengado_soles: 35362724.0,
                        promedio_simple_avance: 50.1,
                        avance_ponderado_pim: 60.4,
                        obras_criticas_menor_20: 4,
                        obras_avanzadas_mayor_70: 7,
                        porcentaje_obras_criticas: 25.0,
                        ejemplos_principales: [
                            { cui: "2228738", nombre: "CONTROL DE DESBORDES E INUNDACIONES EN EL RIO ICA Y QUEBRADA CANSAS", pim_soles: 51955115.0, devengado_soles: 34654061.0, porcentaje_ejecucion: 66.7, departamento: "ICA", semaforo: "VERDE_CONFORME" },
                            { cui: "2494716", nombre: "CREACION DEL SERVICIO DE PROTECCION DEL CAUCE DE TORRENTERA", pim_soles: 4147610.0, devengado_soles: 24885.0, porcentaje_ejecucion: 0.6, departamento: "AREQUIPA", semaforo: "ROJO_INACCION_CRITICA" },
                            { cui: "2414409", nombre: "CREACION DE LOS SERVICIOS DE PROTECCION FRENTE A LOS DESLIZAMIENTOS", pim_soles: 1181111.0, devengado_soles: 42520.0, porcentaje_ejecucion: 3.6, departamento: "LIMA", semaforo: "ROJO_INACCION_CRITICA" }
                        ]
                    },
                    {
                        id: "G2_DRENAJE_PLUVIAL",
                        nombre: "Drenaje Pluvial y Colectores Urbanos",
                        descripcion: "Sistemas de evacuación de aguas de lluvia, cunetas, alcantarillas y colectores contra cuencas ciegas.",
                        icono: "CloudRain",
                        color_alerta: "#f59e0b",
                        diagnostico_doctrina: "Riesgo crítico de anegamiento en ciudades costeras (Piura, Chiclayo, Tumbes). Descalce en el avance frente a lluvias torrenciales tempranas.",
                        total_obras: 22,
                        pim_soles: 27791948.0,
                        devengado_soles: 11633765.0,
                        promedio_simple_avance: 46.4,
                        avance_ponderado_pim: 41.9,
                        obras_criticas_menor_20: 6,
                        obras_avanzadas_mayor_70: 8,
                        porcentaje_obras_criticas: 27.3,
                        ejemplos_principales: [
                            { cui: "2309153", nombre: "INSTALACION DEL SISTEMA DE EVACUACION DE AGUAS PLUVIALES DE LA CIUDAD", pim_soles: 16775610.0, devengado_soles: 5385000.0, porcentaje_ejecucion: 32.1, departamento: "PIURA", semaforo: "AMARILLO_RIESGO" },
                            { cui: "2644305", nombre: "CREACION DEL SERVICIO DE DRENAJE PLUVIAL EN LA ZONA URBANA", pim_soles: 5356463.0, devengado_soles: 5094000.0, porcentaje_ejecucion: 95.1, departamento: "TUMBES", semaforo: "VERDE_CONFORME" },
                            { cui: "2725724", nombre: "CONSTRUCCION DE DRENAJE TRANSVERSAL Y COLECTOR", pim_soles: 2065371.0, devengado_soles: 0.0, porcentaje_ejecucion: 0.0, departamento: "LAMBAYEQUE", semaforo: "ROJO_INACCION_CRITICA" }
                        ]
                    },
                    {
                        id: "G4_INFRAESTRUCTURA_VIAL",
                        nombre: "Infraestructura Vial, Puentes y Transitabilidad",
                        descripcion: "Rehabilitación de puentes vehiculares/peatonales, badenes, pontones y obras de arte viales de evacuación.",
                        icono: "Milestone",
                        color_alerta: "#ef4444",
                        diagnostico_doctrina: "Riesgo de corte de rutas y aislamiento territorial: El 67% del presupuesto asignado aún no ha sido devengado.",
                        total_obras: 7,
                        pim_soles: 5447045.0,
                        devengado_soles: 1789897.0,
                        promedio_simple_avance: 64.3,
                        avance_ponderado_pim: 32.9,
                        obras_criticas_menor_20: 1,
                        obras_avanzadas_mayor_70: 4,
                        porcentaje_obras_criticas: 14.3,
                        ejemplos_principales: [
                            { cui: "2737745", nombre: "REPARACION DE SUPERFICIE DE RODADURA Y OBRAS DE ARTE", pim_soles: 3199535.0, devengado_soles: 0.0, porcentaje_ejecucion: 0.0, departamento: "PIURA", semaforo: "ROJO_INACCION_CRITICA" },
                            { cui: "2690144", nombre: "REPARACION DE PUENTE PEATONAL Y SERVICIO DE TRANSITABILIDAD", pim_soles: 1109615.0, devengado_soles: 700166.0, porcentaje_ejecucion: 63.1, departamento: "ANCASH", semaforo: "VERDE_CONFORME" },
                            { cui: "2255797", nombre: "CREACION DEL SERVICIO DE LA CAPACIDAD OPERATIVA DEL POOL DE MAQUINARIA", pim_soles: 673990.0, devengado_soles: 673990.0, porcentaje_ejecucion: 100.0, departamento: "LIMA", semaforo: "VERDE_CONFORME" }
                        ]
                    }
                ]
            },
            doctrina_logistica: [
                { hitos: "G1: Defensas Ribereñas y Descolmatación Fluvial", progreso_nacional: 38, critico: true },
                { hitos: "G5: Capacidad Operativa y Pool Maquinaria MTC/INDECI", progreso_nacional: 74, critico: false },
                { hitos: "G3: Control de Quebradas y Mallas Dinámicas", progreso_nacional: 60, critico: false },
                { hitos: "G2: Drenaje Pluvial y Mitigación Cuencas Ciegas", progreso_nacional: 42, critico: true },
                { hitos: "G4: Infraestructura Vial y Puentes de Evacuación", progreso_nacional: 33, critico: true },
                { hitos: "G6: Protección Población y Bienes Críticos", progreso_nacional: 54, critico: false }
            ]
        },
        analogos_historicos: [
            { evento: "Mega-Niño 1982-1983", categoria: "EXTRAORDINARIO", anomalia_tsm: "+4.1°C", impacto: "1,200 mm acumulados en costa norte (Paita/Piura)", color: "#450a0a" },
            { evento: "El Niño 1997-1998", categoria: "EXTRAORDINARIO", anomalia_tsm: "+3.8°C", impacto: "Desbordes simultáneos cuencas Norte y Centro", color: "#7f1d1d" },
            { evento: "Niño Costero 2017", categoria: "SÚBITO", anomalia_tsm: "+3.2°C", impacto: "Huaicos sucesivos Qda. San Ildefonso y Huaycoloro", color: "#b91c1c" },
            { evento: "Ciclón Yaku (2023)", categoria: "VÓRTICE CONVECTIVO", anomalia_tsm: "+2.8°C", impacto: "Activación violenta de quebradas secas costeras", color: "#dc2626" }
        ]
    };

    const chiri = data?.amaru_chiri || {
        titulo: "Reloj AMARU-CHIRI (Sierra Sur & Alto Altiplano)",
        amenaza: "HELADAS_Y_FRIAJES_CRITICOS",
        temp_minima_altiplano_c: -8.4,
        isoterma_severa_c: -12.0,
        estacion_referencia: "EMA Mazocruz (Puno, 3,970 msnm)",
        angulo_aguja: 265.22,
        geometria_c2: { centro_x: 260.0, centro_y: 260.0, radio_exterior: 247.0 },
        ventana_dorada: {
            mes: "Abril",
            badge: "ABR★ GOLDEN WINDOW",
            dias_restantes: 198,
            color_destacado: "#facc15",
            borde_destacado: "#fef08a",
            doctrina_logistica: [
                { hitos: "Desparasitación y vitaminización de madres alpacas preñadas", progreso_nacional: 82, critico: true },
                { hitos: "Acopio y resguardo seco de pacas de heno en Tambos Agro Rural", progreso_nacional: 88, critico: true },
                { hitos: "Acondicionamiento térmico de escuelas rurales (PREVAED)", progreso_nacional: 75, critico: true }
            ]
        },
        analogos_historicos: [
            { evento: "La Niña 1988-1989", tmin: "-22.0°C Mazocruz", impacto: "Pérdida de más del 30% de crías de alpaca" },
            { evento: "La Niña 2007-2008", tmin: "-18.5°C Imata", impacto: "Helada prolongada y friaje severo en selva baja" }
        ]
    };

    const fuego = data?.amaru_fuego || {
        titulo: "Reloj AMARU-FUEGO (Incendios Forestales & Estrés de Biomasa)",
        amenaza: "INCENDIOS_FORESTALES_Y_PROPAGACION_TERMICA",
        focos_activos_24h: 6,
        frp_total_mw: 485.0,
        humedad_suelo_0_7cm_pct: 6.5,
        estado_dinamico: "TRANSICIÓN_CON_VIGILANCIA_ESTRICTA",
        badge_alerta: "🟠 FASE RESIDUAL ACTIVA",
        color_destacado: "#ea580c",
        hay_anomalia_prolongada: false,
        fuente_satelital: "NASA FIRMS (VIIRS 375m) + Open-Meteo Pro (ECMWF IFS)",
        angulo_aguja: 285.0,
        geometria_c2: { centro_x: 260.0, centro_y: 260.0, radio_exterior: 247.0 },
        arco_amenaza: {
            sector: "Julio a Octubre (Histórico CENEPRED 10471) • Fin dinámico: 300°",
            angulo_inicio: 180.0,
            angulo_fin: 300.0,
            color_base: "#ea580c"
        },
        ventana_dorada: {
            mes: "Abril",
            badge: "ABR★ GOLDEN WINDOW CORTAFUEGOS",
            dias_restantes: 165,
            color_destacado: "#facc15",
            borde_destacado: "#fef08a",
            doctrina_logistica: [
                { hitos: "Apertura y mantenimiento de fajas cortafuego comunales en cabeceras", progreso_nacional: 68, critico: true },
                { hitos: "Inspección y calibración de motobombas forestales Mark-3 y batefuegos", progreso_nacional: 74, critico: true },
                { hitos: "Fiscalización satelital y prohibición de quemas de rastrojos", progreso_nacional: 59, critico: true }
            ]
        },
        analogos_historicos: [
            { evento: "Crisis Nacional de Fuego 2024", focos_pico: "350+ focos", impacto: "Emergencia Nivel 5 en Amazonas, Junín (Río Tambo), Cusco", color: "#dc2626" },
            { evento: "Incendios en Valle Sagrado 2020", focos_pico: "85 focos", impacto: "Amenaza a monumentos arqueológicos de Machu Picchu", color: "#ea580c" },
            { evento: "Incendios Forestales Apurímac 2023", focos_pico: "Ráfagas >45 km/h", impacto: "Pérdida de vidas de brigadistas en laderas escarpadas", color: "#ef4444" }
        ]
    };

    const activeClock = clockType === "AMARU-FEN" ? fen : (clockType === "AMARU-CHIRI" ? chiri : fuego);
    const carteraObras = clockType === "AMARU-FEN" ? (fen?.ventana_dorada?.cartera_obras_pp0068 || fen?.doctrina_logistica_obras_pp0068) : null;
    const resumenAna = clockType === "AMARU-FEN" ? (fen?.resumen_obras_ana || {
        programa: "PLAN NACIONAL DE INTERVENCIONES EN CAUCES FEN 2026-2027",
        entidad: "Autoridad Nacional del Agua (ANA) / MIDAGRI",
        decreto_supremo: "D.S. N° 164-2026-EF & D.S. N° 124-2026-PCM",
        total_intervenciones: 536,
        costo_total_soles: 670435436.13,
        meta_total_km: 645.4,
        volumen_total_m3: 14820000.0,
        poblacion_total_protegida: 327942,
        hectareas_cultivo_total: 76775.9,
        frentes_tacticos: [
            {
                id: "FRENTE_NORTE",
                nombre: "Frente Norte (Tumbes, Piura, Lambayeque, La Libertad)",
                cuencas_clave: "Ríos Tumbes, Chira, Piura, La Leche, Moche",
                total_obras: 189,
                costo_total_soles: 310240000,
                meta_km: 248.5,
                poblacion_protegida: 142800,
                hectareas_cultivo: 41200,
                avance_ponderado: 41.5,
                prioridad: "PRIORIDAD_1_CRITICA",
                color: "#ef4444"
            },
            {
                id: "FRENTE_CENTRO",
                nombre: "Frente Centro (Lima Metropolitana & Provincias)",
                cuencas_clave: "Ríos Rímac, Chillón, Lurín, Cañete, Mala",
                total_obras: 142,
                costo_total_soles: 182600000,
                meta_km: 172.0,
                poblacion_protegida: 118400,
                hectareas_cultivo: 12400,
                avance_ponderado: 48.2,
                prioridad: "ALTA_URBANA",
                color: "#f59e0b"
            },
            {
                id: "FRENTE_ANCASH",
                nombre: "Frente Áncash (Costa & Callejón de Huaylas)",
                cuencas_clave: "Ríos Santa, Casma, Huarmey, Culebras",
                total_obras: 56,
                costo_total_soles: 74800000,
                meta_km: 84.2,
                poblacion_protegida: 29500,
                hectareas_cultivo: 9800,
                avance_ponderado: 52.0,
                prioridad: "MEDIA_ALTA",
                color: "#3b82f6"
            },
            {
                id: "FRENTE_SUR",
                nombre: "Frente Costa Sur (Ica & Arequipa)",
                cuencas_clave: "Ríos Ica, Pisco, Grande, Camaná, Chili",
                total_obras: 149,
                costo_total_soles: 102800000,
                meta_km: 140.7,
                poblacion_protegida: 37242,
                hectareas_cultivo: 13375.9,
                avance_ponderado: 56.4,
                prioridad: "MEDIA_EN_EJECUCION",
                color: "#10b981"
            }
        ]
    }) : null;

    // 12 Marcas Horarias del Dial Polar (Cada 30° = 1 hora / 1 mes)
    // CÚSPIDE (0° / 360° = Las 12:00): 1 de Enero de 2027
    const hourMarks = [
        { hour: 12, angle: 0, label: "12", sublabel: "1 ENE 2027", esOrigen12: true },
        { hour: 1, angle: 30, label: "1", sublabel: "FEB" },
        { hour: 2, angle: 60, label: "2", sublabel: "MAR" },
        { hour: 3, angle: 90, label: "3", sublabel: "ABR" },
        { hour: 4, angle: 120, label: "4", sublabel: "MAY" },
        { hour: 5, angle: 150, label: "5", sublabel: "JUN" },
        { hour: 6, angle: 180, label: "6", sublabel: "JUL" },
        { hour: 7, angle: 210, label: "7", sublabel: "AGO" },
        { hour: 8, angle: 240, label: "8", sublabel: "SET 26" },
        { hour: 9, angle: 270, label: "9", sublabel: "OCT" },
        { hour: 10, angle: 300, label: "10", sublabel: "NOV" },
        { hour: 11, angle: 330, label: "11", sublabel: "DIC" }
    ];

    // Nombres de los meses centrados en su arco de 30°
    const monthCenters = [
        { nombre: "ENE", centerAngle: 15, tickAngle: 0 },
        { nombre: "FEB", centerAngle: 45, tickAngle: 30 },
        { nombre: "MAR", centerAngle: 75, tickAngle: 60 },
        { nombre: "ABR", centerAngle: 105, tickAngle: 90 },
        { nombre: "MAY", centerAngle: 135, tickAngle: 120 },
        { nombre: "JUN", centerAngle: 165, tickAngle: 150 },
        { nombre: "JUL", centerAngle: 195, tickAngle: 180 },
        { nombre: "AGO", centerAngle: 225, tickAngle: 210 },
        { nombre: "SET", centerAngle: 255, tickAngle: 240 },
        { nombre: "OCT", centerAngle: 285, tickAngle: 270 },
        { nombre: "NOV", centerAngle: 315, tickAngle: 300 },
        { nombre: "DIC", centerAngle: 345, tickAngle: 330 }
    ];

    // Cálculos de trigonometría en viewBox 520x520 (cx=260, cy=260, r=247)
    const cx = 260.0;
    const cy = 260.0;
    const r = 247.0;

    const toRad = (deg: number) => (deg - 90) * (Math.PI / 180.0);
    const getPoint = (deg: number, radius: number) => ({
        x: cx + radius * Math.cos(toRad(deg)),
        y: cy + radius * Math.sin(toRad(deg))
    });

    // Mapeo angular exacto para los 11 meses de la campaña multianual FEN (Set 2026 → Jul 2027)
    // Sincronización cromática 1:1 directa con el Cuadro de Barras Multianual FEN
    const stationAngles: Record<string, { start: number; end: number; center: number; monthName: string }> = {
        m1: { start: 240, end: 270, center: 255, monthName: "SET" }, // Setiembre 2026 (#38bdf8 - Civil Hoy)
        m2: { start: 270, end: 300, center: 285, monthName: "OCT" }, // Octubre 2026 (#f87171 - Alerta Kelvin)
        m3: { start: 300, end: 330, center: 315, monthName: "NOV" }, // Noviembre 2026 (#facc15 - Ventana Dorada NOV★)
        m4: { start: 330, end: 360, center: 345, monthName: "DIC" }, // Diciembre 2026 (#ef4444 - Inicio Lluvias / Posibilidad FEN)
        m5: { start: 0, end: 30, center: 15, monthName: "ENE" },     // Enero 2027 (#dc2626 - Ciclón Yaku / Cúspide)
        m6: { start: 30, end: 60, center: 45, monthName: "FEB" },    // Febrero 2027 (#b91c1c - Muy Fuerte 2017)
        m7: { start: 60, end: 90, center: 75, monthName: "MAR" },    // Marzo 2027 (#450a0a - Clímax Catastrófico)
        m8: { start: 90, end: 120, center: 105, monthName: "ABR" },  // Abril 2027 (#b91c1c - Resaca Fluvial)
        m9: { start: 120, end: 150, center: 135, monthName: "MAY" }, // Mayo 2027 (#ea580c - Descompresión Alisios)
        m10: { start: 150, end: 180, center: 165, monthName: "JUN" },// Junio 2027 (#f59e0b - Saturación Suelos)
        m11: { start: 180, end: 210, center: 195, monthName: "JUL" } // Julio 2027 (#10b981 - Cierre Interanual)
    };

    const getArcPath = (startDeg: number, endDeg: number, radius: number) => {
        const p1 = getPoint(startDeg, radius);
        const p2 = getPoint(endDeg === 360 ? 0 : endDeg, radius);
        const delta = (endDeg - startDeg + 360) % 360;
        const largeArcFlag = delta > 180 ? 1 : 0;
        return `M ${p1.x} ${p1.y} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${p2.x} ${p2.y}`;
    };

    const getStationForMonth = (monthName: string) => {
        return (fen.cronograma_multianual_fen || []).find((s: any) => s.mes?.startsWith(monthName));
    };

    // =========================================================================
    // CINEMÁTICA Y AGUJAS DOCTRINARIAS DEL RELOJ POLAR C2
    // =========================================================================
    
    // 1. MINUTERO: Día Actualizado del Calendario Civil (Manecilla Larga y Delgada)
    // Marca el día exacto de hoy (16 de Setiembre de 2026, día 259/365 -> 254.5°, ~8:29 h)
    const minuteAngle = data?.minutero_dia_actual?.angulo ?? data?.angulo_base_cronologico ?? (() => {
        const now = new Date();
        const start = new Date(now.getFullYear(), 0, 0);
        const diff = now.getTime() - start.getTime();
        const oneDay = 1000 * 60 * 60 * 24;
        const day = Math.floor(diff / oneDay);
        return (day / 365.25) * 360.0;
    })();
    const minuteTip = getPoint(minuteAngle, r - 15);
    const minuteBase1 = getPoint(minuteAngle - 90, 4.5);
    const minuteBase2 = getPoint(minuteAngle + 90, 4.5);
    const minuteTail = getPoint(minuteAngle + 180, 20);

    // 2. HORARIO: Posibilidad de Inicio o Pico de Amenaza (Manecilla Corta y Robusta)
    const hourAngle = clockType === "AMARU-FEN"
        ? (data?.horario_inicio_fen?.angulo ?? fen.angulo_aguja ?? 334.5)
        : (clockType === "AMARU-CHIRI" ? chiri.angulo_aguja : (fuego.angulo_aguja ?? 285.0));
    const hourTip = getPoint(hourAngle, r - 66);
    const hourBase1 = getPoint(hourAngle - 90, 12);
    const hourBase2 = getPoint(hourAngle + 90, 12);
    const hourTail = getPoint(hourAngle + 180, 26);
    const handAngle = hourAngle; // Para métricas C2 y retrocompatibilidad

    return (
        <>
            {/* ========================================================================= */}
            {/* WIDGET COMPACTO (Para integrarse en el Tablero de Mando Nacional)         */}
            {/* ========================================================================= */}
            <div className={`bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl backdrop-blur flex flex-col justify-between ${className}`}>
                {/* Header del Widget */}
                <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                    <div className="flex items-center gap-2">
                        <Clock className={`w-4 h-4 ${clockType === "AMARU-FEN" ? "text-red-400 animate-pulse" : (clockType === "AMARU-FUEGO" ? "text-orange-400 animate-pulse" : "text-sky-400")}`} />
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
                            {clockType === "AMARU-FEN" ? "Reloj AMARU-FEN" : (clockType === "AMARU-CHIRI" ? "Reloj AMARU-CHIRI" : "Reloj AMARU-FUEGO")}
                        </span>
                    </div>

                    {/* Toggle de Reloj */}
                    <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
                        <button
                            onClick={() => setClockType("AMARU-FEN")}
                            className={`px-2 py-0.5 rounded text-[10px] font-bold transition ${
                                clockType === "AMARU-FEN" ? "bg-red-600 text-white shadow" : "text-slate-400 hover:text-white"
                            }`}
                        >
                            FEN (Niño)
                        </button>
                        <button
                            onClick={() => setClockType("AMARU-CHIRI")}
                            className={`px-2 py-0.5 rounded text-[10px] font-bold transition ${
                                clockType === "AMARU-CHIRI" ? "bg-sky-600 text-white shadow" : "text-slate-400 hover:text-white"
                            }`}
                        >
                            CHIRI (Niña)
                        </button>
                        <button
                            onClick={() => setClockType("AMARU-FUEGO")}
                            className={`px-2 py-0.5 rounded text-[10px] font-bold transition flex items-center gap-1 ${
                                clockType === "AMARU-FUEGO" ? "bg-orange-600 text-white shadow" : "text-slate-400 hover:text-white"
                            }`}
                        >
                            <Flame className="w-2.5 h-2.5" /> FUEGO
                        </button>
                        <button
                            onClick={() => setYachayMode(!yachayMode)}
                            className={`px-2 py-0.5 rounded text-[10px] font-bold transition flex items-center gap-1 border ${
                                yachayMode
                                    ? "bg-emerald-600 text-white border-emerald-400 shadow"
                                    : "bg-slate-800 text-slate-300 border-slate-700 hover:text-white"
                            }`}
                            title="Alternar entre modo técnico militar C2 y modo pedagógico Yachay"
                        >
                            <GraduationCap className="w-3 h-3" />
                            <span>{yachayMode ? "Yachay ON" : "Modo C2"}</span>
                        </button>
                    </div>

                    <button
                        onClick={() => setIsFullscreen(true)}
                        className="p-1 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-md transition"
                        title="Agrandar en toda la pantalla"
                    >
                        <Maximize2 className="w-3.5 h-3.5" />
                    </button>
                </div>

                {/* Contenido Visual Mini-Dial */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center py-2">
                    {/* SVG Miniatura */}
                    <div className="md:col-span-6 flex justify-center">
                        <div className="relative w-44 h-44 cursor-pointer" onClick={() => setIsFullscreen(true)}>
                            <svg viewBox="0 0 520 520" className="w-full h-full drop-shadow-2xl">
                                <defs>
                                    {/* Gradiente FEN: Ascenso hacia Marzo (Clímax Catastrófico) con Escala Histórica */}
                                    <linearGradient id="fen-severity-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                        <stop offset="0%" stopColor="#f87171" />    {/* Dic: Inicio / Débil (+1.5°C) */}
                                        <stop offset="25%" stopColor="#ef4444" />   {/* Ene: Moderado (+2.3°C) */}
                                        <stop offset="50%" stopColor="#dc2626" />   {/* Feb: Severo / Yaku (+2.8°C) */}
                                        <stop offset="75%" stopColor="#b91c1c" />   {/* Feb fin: Niño Costero 2017 (+3.2°C) */}
                                        <stop offset="90%" stopColor="#7f1d1d" />   {/* Mar: Niño 97-98 (+3.8°C) */}
                                        <stop offset="100%" stopColor="#450a0a" />  {/* Mar: CLÍMAX 1982-83 (+4.1°C) */}
                                    </linearGradient>
                                    {/* Gradiente FEN Extendido: Descenso, Resaca Fluvial y Cierre hasta Julio 2027 */}
                                    <linearGradient id="fen-descent-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                        <stop offset="0%" stopColor="#450a0a" />    {/* Mar: Clímax Catastrófico (+4.1°C) */}
                                        <stop offset="25%" stopColor="#b91c1c" />   {/* Abr: Resaca Fluvial (+2.7°C) */}
                                        <stop offset="50%" stopColor="#ea580c" />   {/* May: Descompresión Convectiva (+1.9°C) */}
                                        <stop offset="75%" stopColor="#f59e0b" />   {/* Jun: Saturación Suelos Remanente (+1.2°C) */}
                                        <stop offset="100%" stopColor="#10b981" />  {/* Jul 2027: Cierre Interanual (+0.5°C) */}
                                    </linearGradient>
                                </defs>
                                <circle cx={cx} cy={cy} r={r} fill="#030712" stroke="#1e293b" strokeWidth="4" />
                                <circle cx={cx} cy={cy} r={r - 30} fill="none" stroke="#0f172a" strokeWidth="2" strokeDasharray="4 4" />
                                
                                {/* Arco Amenaza FEN: 11 Sectores Sincronizados con el Cuadro de Barras Multianual (Set 2026 → Jul 2027) */}
                                {clockType === "AMARU-FEN" ? (
                                    <g id="mini-fen-multianual-sectors">
                                        {/* Pista base sutil que une el arco de campaña (240° a 210°) */}
                                        <path
                                            d={getArcPath(240, 210, r - 15)}
                                            fill="none"
                                            stroke="#0f172a"
                                            strokeWidth="22"
                                            className="opacity-70"
                                        />

                                        {/* 11 Arcos de Color Sincronizados con las 11 Barras del Histograma */}
                                        {fen.cronograma_multianual_fen.map((st: any) => {
                                            const angles = stationAngles[st.id] || { start: 0, end: 30 };
                                            const isSelected = selectedStation?.id === st.id;
                                            const isHovered = hoveredStationId === st.id;
                                            const arcPath = getArcPath(angles.start + 0.8, angles.end - 0.8, r - 15);

                                            return (
                                                <g
                                                    key={`mini-sector-${st.id}`}
                                                    className="cursor-pointer group"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setSelectedStation(isSelected ? null : st);
                                                    }}
                                                    onMouseEnter={() => setHoveredStationId(st.id)}
                                                    onMouseLeave={() => setHoveredStationId(null)}
                                                >
                                                    <title>{`${st.label} (${st.dia_rango_relativo}): ${st.fase} • Intensidad: ${st.severidad_pct}% • Color: ${st.color}`}</title>
                                                    <path
                                                        d={arcPath}
                                                        fill="none"
                                                        stroke={st.color}
                                                        strokeWidth={isSelected ? 26 : isHovered ? 23 : 18}
                                                        strokeLinecap="round"
                                                        className={`transition-all duration-200 ${
                                                            isSelected
                                                                ? "opacity-100 filter drop-shadow-[0_0_8px_rgba(255,255,255,0.85)]"
                                                                : isHovered
                                                                ? "opacity-100 filter brightness-125"
                                                                : "opacity-90 hover:opacity-100"
                                                        }`}
                                                    />
                                                    {isSelected && (
                                                        <path
                                                            d={arcPath}
                                                            fill="none"
                                                            stroke="#ffffff"
                                                            strokeWidth={3}
                                                            strokeLinecap="round"
                                                            className="opacity-95 animate-pulse"
                                                        />
                                                    )}
                                                </g>
                                            );
                                        })}

                                        {/* Balizas clave grabadas sobre el arco */}
                                        {/* Setiembre 2026: Civil Hoy (255°) */}
                                        <circle cx={getPoint(255, r - 15).x} cy={getPoint(255, r - 15).y} r="4" fill="#38bdf8" stroke="#ffffff" strokeWidth="1.5" />
                                        {/* Noviembre 2026: Ventana Dorada NOV★ (315°) */}
                                        <circle cx={getPoint(315, r - 15).x} cy={getPoint(315, r - 15).y} r="5" fill="#facc15" stroke="#ffffff" strokeWidth="2" />
                                        {/* Marzo 2027: Clímax Catastrófico (75°) */}
                                        <circle cx={getPoint(75, r - 15).x} cy={getPoint(75, r - 15).y} r="6" fill="#450a0a" stroke="#ffffff" strokeWidth="2" />
                                        {/* Julio 2027: Cierre Interanual (195°) */}
                                        <circle cx={getPoint(195, r - 15).x} cy={getPoint(195, r - 15).y} r="4.5" fill="#10b981" stroke="#ffffff" strokeWidth="1.5" />
                                    </g>
                                ) : clockType === "AMARU-CHIRI" ? (
                                    <>
                                        {/* Arco Amenaza CHIRI Glacial (Mayo a Julio: 120° a 210°) */}
                                        <path
                                            d={`M ${getPoint(120, r - 15).x} ${getPoint(120, r - 15).y} A ${r - 15} ${r - 15} 0 0 1 ${getPoint(210, r - 15).x} ${getPoint(210, r - 15).y}`}
                                            fill="none"
                                            stroke="#0284c7"
                                            strokeWidth="24"
                                            strokeLinecap="round"
                                        />
                                        {/* Ventana Dorada Abril (90° a 120°) */}
                                        <path
                                            d={`M ${getPoint(90, r - 15).x} ${getPoint(90, r - 15).y} A ${r - 15} ${r - 15} 0 0 1 ${getPoint(120, r - 15).x} ${getPoint(120, r - 15).y}`}
                                            fill="none"
                                            stroke="#facc15"
                                            strokeWidth="24"
                                            strokeLinecap="round"
                                        />
                                    </>
                                ) : (
                                    /* AMARU-FUEGO: Arco Dinámico (Julio a Octubre / Noviembre prolongado) */
                                    <>
                                        {/* Arco Amenaza FUEGO Dinámico */}
                                        <path
                                            d={`M ${getPoint(180, r - 15).x} ${getPoint(180, r - 15).y} A ${r - 15} ${r - 15} 0 0 1 ${getPoint(fuego.arco_amenaza?.angulo_fin || 300, r - 15).x} ${getPoint(fuego.arco_amenaza?.angulo_fin || 300, r - 15).y}`}
                                            fill="none"
                                            stroke={fuego.color_destacado || "#ea580c"}
                                            strokeWidth="24"
                                            strokeLinecap="round"
                                        />
                                        {/* Ventana Dorada Silvícola Abril-Mayo (90° a 150°) */}
                                        <path
                                            d={`M ${getPoint(90, r - 15).x} ${getPoint(90, r - 15).y} A ${r - 15} ${r - 15} 0 0 1 ${getPoint(150, r - 15).x} ${getPoint(150, r - 15).y}`}
                                            fill="none"
                                            stroke="#facc15"
                                            strokeWidth="20"
                                            strokeLinecap="round"
                                        />
                                        {/* Baliza del Pico Histórico (Agosto 240°) */}
                                        <circle cx={getPoint(240, r - 15).x} cy={getPoint(240, r - 15).y} r="5" fill="#ef4444" stroke="#ffffff" strokeWidth="2" />
                                    </>
                                )}

                                {/* Baliza Cúspide: Las 12 en Punto = 1 de Enero de 2027 */}
                                <g id="mini-origen-12-enero-2027" className="select-none pointer-events-none">
                                    <line
                                        x1={getPoint(0, r - 2).x}
                                        y1={getPoint(0, r - 2).y}
                                        x2={getPoint(0, r - 26).x}
                                        y2={getPoint(0, r - 26).y}
                                        stroke="#ffffff"
                                        strokeWidth="3"
                                    />
                                    <rect
                                        x={cx - 36}
                                        y={cy - r + 8}
                                        width="72"
                                        height="15"
                                        rx="4"
                                        fill="#030712"
                                        stroke="#ef4444"
                                        strokeWidth="1.2"
                                    />
                                    <text
                                        x={cx}
                                        y={cy - r + 19}
                                        textAnchor="middle"
                                        fill="#ffffff"
                                        fontSize="8"
                                        fontWeight="900"
                                        fontFamily="monospace"
                                    >
                                        12 • 1 ENE 2027
                                    </text>
                                </g>

                                {/* 1. HORARIO: Posibilidad de Inicio o Pico (Manecilla Corta y Táctica) */}
                                <g id="mini-horario-inicio-fen" className="opacity-95">
                                    <polygon
                                        points={`${hourTip.x},${hourTip.y} ${hourBase1.x},${hourBase1.y} ${hourTail.x},${hourTail.y} ${hourBase2.x},${hourBase2.y}`}
                                        fill={clockType === "AMARU-FEN" ? "#ef4444" : (clockType === "AMARU-FUEGO" ? "#ea580c" : "#38bdf8")}
                                        stroke="#ffffff"
                                        strokeWidth="2.5"
                                    />
                                    {/* Alma reflectante interior dorada para destacar el horario */}
                                    {clockType === "AMARU-FEN" && (
                                        <line
                                            x1={cx}
                                            y1={cy}
                                            x2={hourTip.x}
                                            y2={hourTip.y}
                                            stroke="#facc15"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                        />
                                    )}
                                    <circle cx={hourTip.x} cy={hourTip.y} r="5" fill={clockType === "AMARU-FEN" ? "#ef4444" : (clockType === "AMARU-FUEGO" ? "#f97316" : "#38bdf8")} stroke="#ffffff" strokeWidth="1.5" />
                                </g>

                                {/* 2. MINUTERO: Día Actualizado del Calendario Civil (Manecilla Larga y Precisa) */}
                                <g id="mini-minutero-dia-actual" className="opacity-95">
                                    <polygon
                                        points={`${minuteTip.x},${minuteTip.y} ${minuteBase1.x},${minuteBase1.y} ${minuteTail.x},${minuteTail.y} ${minuteBase2.x},${minuteBase2.y}`}
                                        fill="#38bdf8"
                                        stroke="#ffffff"
                                        strokeWidth="1.5"
                                    />
                                    {/* Marcador del Día Actual en el perímetro */}
                                    <circle cx={minuteTip.x} cy={minuteTip.y} r="5" fill="#0284c7" stroke="#ffffff" strokeWidth="1.5" />
                                    <circle cx={minuteTip.x} cy={minuteTip.y} r="2" fill="#38bdf8" />
                                </g>
                                {/* Buje Central Dinámico con Métricas en Vivo */}
                                <circle cx={cx} cy={cy} r="48" fill="#090d16" stroke={clockType === "AMARU-FEN" ? "#ef4444" : (clockType === "AMARU-FUEGO" ? "#ea580c" : "#38bdf8")} strokeWidth="2.5" />
                                {clockType === "AMARU-FEN" ? (
                                    <g className="select-none pointer-events-none">
                                        <circle cx={cx} cy={cy} r="42" fill="#0f172a" opacity="0.9" />
                                        <text x={cx} y={cy - 16} textAnchor="middle" fill="#94a3b8" fontSize="9" fontWeight="bold" letterSpacing="0.8">
                                            ΔTSM PAITA
                                        </text>
                                        <text x={cx} y={cy + 5} textAnchor="middle" fill="#ef4444" fontSize="21" fontWeight="900" fontFamily="monospace">
                                            {fen.anomalia_tsm_c >= 0 ? `+${fen.anomalia_tsm_c.toFixed(1)}` : fen.anomalia_tsm_c.toFixed(1)}°
                                        </text>
                                        <text x={cx} y={cy + 22} textAnchor="middle" fill="#38bdf8" fontSize="11" fontWeight="bold" fontFamily="monospace">
                                            TSM {fen.temperatura_mar_c?.toFixed(1)}°C
                                        </text>
                                        <text x={cx} y={cy + 34} textAnchor="middle" fill="#64748b" fontSize="7" fontWeight="bold">
                                            IMARPE IN-SITU
                                        </text>
                                    </g>
                                ) : clockType === "AMARU-CHIRI" ? (
                                    <g className="select-none pointer-events-none">
                                        <circle cx={cx} cy={cy} r="42" fill="#0f172a" opacity="0.9" />
                                        <text x={cx} y={cy - 16} textAnchor="middle" fill="#94a3b8" fontSize="9" fontWeight="bold" letterSpacing="0.8">
                                            T. MÍNIMA
                                        </text>
                                        <text x={cx} y={cy + 5} textAnchor="middle" fill="#38bdf8" fontSize="21" fontWeight="900" fontFamily="monospace">
                                            {chiri.temp_minima_altiplano_c?.toFixed(1)}°
                                        </text>
                                        <text x={cx} y={cy + 22} textAnchor="middle" fill="#cbd5e1" fontSize="11" fontWeight="bold" fontFamily="monospace">
                                            MAZOCRUZ
                                        </text>
                                        <text x={cx} y={cy + 34} textAnchor="middle" fill="#64748b" fontSize="7" fontWeight="bold">
                                            SENAMHI EMA
                                        </text>
                                    </g>
                                ) : (
                                    <g className="select-none pointer-events-none">
                                        <circle cx={cx} cy={cy} r="42" fill="#0f172a" opacity="0.9" />
                                        <text x={cx} y={cy - 16} textAnchor="middle" fill="#94a3b8" fontSize="8" fontWeight="bold" letterSpacing="0.8">
                                            FOCOS 24H
                                        </text>
                                        <text x={cx} y={cy + 5} textAnchor="middle" fill="#f97316" fontSize="21" fontWeight="900" fontFamily="monospace">
                                            {fuego.focos_activos_24h ?? 6}
                                        </text>
                                        <text x={cx} y={cy + 22} textAnchor="middle" fill="#fbbf24" fontSize="10" fontWeight="bold" fontFamily="monospace">
                                            {fuego.frp_total_mw ? `${Math.round(fuego.frp_total_mw)} MW` : "485 MW"}
                                        </text>
                                        <text x={cx} y={cy + 34} textAnchor="middle" fill="#64748b" fontSize="7" fontWeight="bold">
                                            VIIRS 375m
                                        </text>
                                    </g>
                                )}
                                <circle cx={cx} cy={cy} r="4" fill="#ffffff" />
                            </svg>
                        </div>
                    </div>

                    {/* Resumen Táctico Lateral */}
                    <div className="md:col-span-6 space-y-2 text-xs">
                        <div className="bg-slate-950 p-2 rounded-xl border border-slate-800">
                            <div className="flex justify-between items-center text-[10px] text-slate-400 uppercase font-bold">
                                <span>Ventana Dorada</span>
                                <span className="text-amber-400">{activeClock.ventana_dorada.badge}</span>
                            </div>
                            <div className="flex items-baseline gap-2 mt-1">
                                <span className="text-2xl font-black text-amber-400 leading-none">
                                    {activeClock.ventana_dorada.dias_restantes}
                                </span>
                                <span className="text-[11px] text-slate-400 font-medium">días para el cierre de ventana</span>
                            </div>
                        </div>

                        <div className="bg-slate-950 p-2 rounded-xl border border-slate-800 space-y-1">
                            <span className="text-[10px] uppercase font-bold text-slate-400 block">
                                {clockType === "AMARU-FEN" ? "Telemetría Marina (Boyas DHN)" : "Altiplano SENAMHI EMA"}
                            </span>
                            <div className="text-[11px] font-mono text-slate-300">
                                {clockType === "AMARU-FEN" ? (
                                    <>TSM Niño 1+2: <b className="text-red-400">+{fen.anomalia_tsm_c}°C</b> ({fen.temperatura_mar_c}°C)</>
                                ) : (
                                    <>T. Mínima Nocturna: <b className="text-sky-400">{chiri.temp_minima_altiplano_c}°C</b> (Mazocruz)</>
                                )}
                            </div>
                        </div>

                        <button
                            onClick={() => setIsFullscreen(true)}
                            className="w-full bg-slate-800 hover:bg-slate-750 text-slate-200 text-[11px] font-bold py-1.5 px-2 rounded-lg border border-slate-700 flex items-center justify-center gap-1.5 transition"
                        >
                            <Maximize2 className="w-3 h-3" /> Agrandar Reloj en Pantalla Completa
                        </button>
                    </div>
                </div>

                {/* ========================================================================= */}
                {/* CUADRO DE BARRAS TÁCTICO MULTIANUAL FEN EN DÍAS (SETIEMBRE 2026 → JULIO 2027) */}
                {/* ========================================================================= */}
                {clockType === "AMARU-FEN" && (fen.cronograma_multianual_fen || []).length > 0 && (
                    <div className="mt-2 pt-2.5 border-t border-slate-800 space-y-2.5">
                        {/* Cabecera del Cuadro de Barras y Selector de Escala */}
                        <div className="flex flex-wrap justify-between items-center gap-2 text-[11px]">
                            <div className="flex items-center gap-1.5 font-bold text-slate-200">
                                <Calendar className="w-3.5 h-3.5 text-red-400" />
                                <span>Cuadro de Barras FEN: Setiembre 2026 → Julio 2027</span>
                                <span className="text-[9px] bg-red-950 text-red-300 font-mono px-1.5 py-0.5 rounded border border-red-800">
                                    334 DÍAS DE CAMPAÑA
                                </span>
                            </div>

                            {/* Selector de escala de eje X: Días vs Meses */}
                            <div className="flex items-center bg-slate-950 p-0.5 rounded-lg border border-slate-800 text-[10px] font-mono">
                                <button
                                    onClick={() => setTimelineScale("days")}
                                    className={`px-2 py-0.5 rounded transition ${
                                        timelineScale === "days"
                                            ? "bg-red-600 text-white font-bold shadow"
                                            : "text-slate-400 hover:text-white"
                                    }`}
                                >
                                    Eje X en Días (D+0..334)
                                </button>
                                <button
                                    onClick={() => setTimelineScale("months")}
                                    className={`px-2 py-0.5 rounded transition ${
                                        timelineScale === "months"
                                            ? "bg-slate-800 text-white font-bold"
                                            : "text-slate-400 hover:text-white"
                                    }`}
                                >
                                    Meses
                                </button>
                            </div>
                        </div>

                        {/* Tira de Sincronización Cromática Directa con el Reloj FEN */}
                        <div className="flex flex-wrap items-center justify-between gap-1 text-[9px] font-mono bg-slate-950/90 px-2 py-1 rounded-lg border border-slate-850">
                            <span className="text-slate-400 flex items-center gap-1">
                                <Sparkles className="w-2.5 h-2.5 text-sky-400" />
                                <span>Sincronización Reloj FEN ↔ Barras:</span>
                            </span>
                            <div className="flex items-center gap-1">
                                {fen.cronograma_multianual_fen.map((st: any) => (
                                    <span
                                        key={`dot-${st.id}`}
                                        onClick={() => setSelectedStation(selectedStation?.id === st.id ? null : st)}
                                        onMouseEnter={() => setHoveredStationId(st.id)}
                                        onMouseLeave={() => setHoveredStationId(null)}
                                        title={`${st.mes} (${st.dia_rango_relativo}): ${st.fase} • Color: ${st.color}`}
                                        className={`w-2.5 h-2.5 rounded-full cursor-pointer transition-all ${
                                            selectedStation?.id === st.id ? "ring-2 ring-white scale-125 shadow" : "hover:scale-115 opacity-90"
                                        }`}
                                        style={{ backgroundColor: st.color }}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* CUADRO DE BARRAS / HISTOGRAMA DE INTENSIDAD */}
                        <div className="bg-slate-950/90 p-2 rounded-xl border border-slate-850 space-y-1.5">
                            {/* Gráfica con Eje Y de Intensidad (%) y 11 Columnas en Días */}
                            <div className="flex items-end gap-1.5 h-28 pt-3 pb-1 px-1">
                                {/* Eje Y: Intensidad (%) */}
                                <div className="flex flex-col justify-between h-full text-[8px] font-mono text-slate-400 shrink-0 text-right pr-1 border-r border-slate-800/80 select-none">
                                    <span className="text-red-400 font-bold">100%</span>
                                    <span className="text-amber-400">75%</span>
                                    <span className="text-yellow-400">50%</span>
                                    <span className="text-sky-400">25%</span>
                                    <span>0%</span>
                                </div>

                                {/* Contenedor de las 11 Barras Tácticas */}
                                <div className="grid grid-cols-11 gap-1 w-full h-full items-end">
                                    {fen.cronograma_multianual_fen.map((st: any) => {
                                        const isSelected = selectedStation?.id === st.id;
                                        const isHovered = hoveredStationId === st.id;
                                        const xLabel = timelineScale === "days"
                                            ? (st.dia_rango_relativo?.split(" ")[0] || st.mes)
                                            : st.mes;

                                        return (
                                            <button
                                                key={st.id}
                                                onClick={() => setSelectedStation(isSelected ? null : st)}
                                                onMouseEnter={() => setHoveredStationId(st.id)}
                                                onMouseLeave={() => setHoveredStationId(null)}
                                                className={`h-full flex flex-col justify-end items-center group relative cursor-pointer p-0.5 rounded transition ${
                                                    isSelected
                                                        ? "bg-slate-800/90 ring-2 ring-white shadow-lg shadow-white/10 scale-102 z-10"
                                                        : isHovered
                                                        ? "bg-slate-850/80 ring-1 ring-slate-400"
                                                        : "hover:bg-slate-900/60"
                                                }`}
                                                title={`${st.label} (${st.dia_rango_relativo || ''}) • Intensidad: ${st.severidad_pct}% • ΔTSM: ${st.anomalia_tsm} • Color sincronizado: ${st.color}`}
                                            >
                                                {/* Badge Superior para Hitos Notables */}
                                                {st.es_hoy && (
                                                    <span className="text-[7px] bg-sky-500 text-slate-950 font-black px-1 rounded-xs mb-0.5 uppercase tracking-tighter">
                                                        HOY
                                                    </span>
                                                )}
                                                {st.tipo === "VENTANA_DORADA" && !st.es_hoy && (
                                                    <span className="text-[7px] bg-amber-400 text-slate-950 font-black px-0.5 rounded-xs mb-0.5 uppercase">
                                                        ★LIM
                                                    </span>
                                                )}
                                                {st.tipo === "CLIMAX_HISTORICO" && (
                                                    <span className="text-[7px] bg-red-600 text-white font-black px-0.5 rounded-xs mb-0.5 uppercase animate-pulse">
                                                        PICO
                                                    </span>
                                                )}

                                                {/* Columna / Barra de Intensidad */}
                                                <div className="w-full bg-slate-900 rounded-t overflow-hidden flex flex-col justify-end p-0.5 border border-slate-800/60 group-hover:border-slate-600 transition" style={{ height: "100%" }}>
                                                    <div
                                                        className="w-full rounded-xs transition-all shadow-md group-hover:brightness-125"
                                                        style={{
                                                            height: `${Math.max(12, st.severidad_pct)}%`,
                                                            backgroundColor: st.color
                                                        }}
                                                    />
                                                </div>

                                                {/* Eje X: Rótulo de Período en Días o Meses */}
                                                <span className={`text-[7.5px] font-mono mt-1 block truncate leading-tight ${
                                                    st.es_hoy ? "text-sky-300 font-bold" : st.tipo === "VENTANA_DORADA" ? "text-amber-300 font-bold" : "text-slate-400"
                                                }`}>
                                                    {timelineScale === "days" ? (st.id === "m1" ? "D+0..30" : st.id === "m7" ? "D+182..212" : st.id === "m11" ? "D+304..334" : `D+${st.dia_inicio}`) : st.mes}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Sub-rótulo explicativo del Eje X */}
                            <div className="flex justify-between items-center text-[8.5px] font-mono text-slate-400 px-1 border-t border-slate-850/80 pt-1">
                                <span>▲ Eje Y: Intensidad (%)</span>
                                <span>Eje X: {timelineScale === "days" ? "Línea Temporal de Días (D+0 a D+334 de Campaña FEN)" : "Meses Calendario (Set 2026 a Jul 2027)"} ►</span>
                            </div>
                        </div>

                        {/* Cartela Institucional: Advertencia de Modelo Referencial Histórico */}
                        <div className="bg-amber-950/30 border border-amber-800/40 rounded-xl p-2 text-[10px] text-amber-200/90 leading-relaxed flex items-start gap-2">
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                            <div>
                                <b className="text-amber-300 uppercase tracking-wide font-mono text-[9px] block">
                                    Aviso de Doctrina C2 (Marco Referencial Basado en Niño Histórico):
                                </b>
                                Cuadro de intensidad proyectado en 334 días modelado sobre el comportamiento sinóptico de los Mega-Niños históricos (1982-83, 1997-98, 2017 y Yaku 2023). Las consecuencias e intensidades son referenciales y permiten anticipar las ventanas de respuesta operativa multisectorial.
                            </div>
                        </div>

                        {/* Ficha Desplegable de Consecuencias Proyectadas en el Tiempo */}
                        {selectedStation && (
                            <div className="bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs space-y-1.5 animate-fade-in shadow-xl">
                                <div className="flex justify-between items-baseline border-b border-slate-800 pb-1.5">
                                    <div className="flex items-center gap-2">
                                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: selectedStation.color }} />
                                        <span className="font-bold text-white text-xs">
                                            {selectedStation.label} • {selectedStation.fase}
                                        </span>
                                        <span className="text-[10px] font-mono text-red-300 bg-red-950 px-1.5 py-0.5 rounded border border-red-800 font-bold">
                                            Intensidad: {selectedStation.severidad_pct}%
                                        </span>
                                    </div>
                                    <div className="text-right font-mono text-[10px] text-slate-300">
                                        Período: <b className="text-amber-400">{selectedStation.dia_rango_relativo || `${selectedStation.mes}`}</b>
                                    </div>
                                </div>

                                <div className="text-[11px] text-slate-300 leading-relaxed">
                                    <b className="text-amber-300 font-mono text-[10px] block">CONSECUENCIAS PROYECTADAS EN EL TIEMPO:</b>
                                    {selectedStation.consecuencias_proyectadas || "Monitoreo continuo de defensas ribereñas y desfogues fluviales."}
                                </div>

                                {/* Despliegue de Saberes y Doctrina Yachay */}
                                {yachayMode && (
                                    <div className="mt-2 pt-2 border-t border-slate-800 space-y-2 bg-slate-950/70 p-2 rounded-lg">
                                        <div className="flex items-center justify-between text-[10px]">
                                            <span className="font-bold text-emerald-400 flex items-center gap-1">
                                                <GraduationCap className="w-3.5 h-3.5" />
                                                <span>Doctrina &amp; Diálogo de Saberes:</span>
                                            </span>
                                            <div className="flex items-center gap-1">
                                                <button
                                                    onClick={() => setSpeechLang("quechua")}
                                                    className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${speechLang === "quechua" ? "bg-sky-600 text-white" : "text-slate-400 bg-slate-900"}`}
                                                >
                                                    Quechua
                                                </button>
                                                <button
                                                    onClick={() => setSpeechLang("aymara")}
                                                    className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${speechLang === "aymara" ? "bg-sky-600 text-white" : "text-slate-400 bg-slate-900"}`}
                                                >
                                                    Aymara
                                                </button>
                                                <button
                                                    onClick={() => setSpeechLang("castellano")}
                                                    className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${speechLang === "castellano" ? "bg-sky-600 text-white" : "text-slate-400 bg-slate-900"}`}
                                                >
                                                    Castellano
                                                </button>
                                            </div>
                                        </div>

                                        {/* Directiva Autoridades */}
                                        {selectedStation.mensaje_autoridad && (
                                            <div className="text-[10px] text-amber-200/90 bg-amber-950/30 border border-amber-900/50 p-2 rounded">
                                                <strong className="text-amber-300 block">🏛️ Mando para el Alcalde / COED Municipal:</strong>
                                                {selectedStation.mensaje_autoridad}
                                            </div>
                                        )}

                                        {/* Lengua Originaria y Alerta Comunal con Audio */}
                                        <div className="text-[10px] text-slate-300 bg-slate-900 border border-slate-800 p-2 rounded space-y-1">
                                            <div className="flex justify-between items-center">
                                                <strong className="text-sky-300">
                                                    {speechLang === "quechua" ? "🌾 Willakuy (Runasimi):" : speechLang === "aymara" ? "🌾 Yatiyawi (Aymara):" : "🌾 Alerta en Castellano Llano:"}
                                                </strong>
                                                <button
                                                    onClick={() => {
                                                        const txt = speechLang === "quechua" ? selectedStation.mensaje_quechua : speechLang === "aymara" ? selectedStation.mensaje_aymara : selectedStation.mensaje_comunitario_castellano;
                                                        if (txt) speakText(txt, `st-mini-${selectedStation.id}-${speechLang}`);
                                                    }}
                                                    className="flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded bg-sky-700 hover:bg-sky-600 text-white transition shadow"
                                                >
                                                    <Volume2 className="w-3 h-3" />
                                                    <span>{playingSpeech === `st-mini-${selectedStation.id}-${speechLang}` ? "Pausar" : "Escuchar"}</span>
                                                </button>
                                            </div>
                                            <p className="font-mono text-[10px] text-emerald-200 italic">
                                                &ldquo;{speechLang === "quechua" ? (selectedStation.mensaje_quechua || "Allinta amachanakusun...") : speechLang === "aymara" ? (selectedStation.mensaje_aymara || "Mayacht'asisakiwa...") : selectedStation.mensaje_comunitario_castellano}&rdquo;
                                            </p>
                                        </div>

                                        {/* Bioindicador Tradicional */}
                                        {selectedStation.bioindicador_ancestral && (
                                            <div className="text-[10px] text-teal-300/90 bg-teal-950/30 border border-teal-900/40 p-2 rounded">
                                                <strong className="text-teal-300 block">🌿 Bioindicador de la Naturaleza:</strong>
                                                {selectedStation.bioindicador_ancestral}
                                            </div>
                                        )}
                                    </div>
                                )}

                                <div className="flex justify-between items-center pt-1 border-t border-slate-850 text-[10px] text-slate-400 font-mono">
                                    <span>Análogo Histórico: <b className="text-white">{selectedStation.analogo}</b> (ΔTSM: <b className="text-red-400">{selectedStation.anomalia_tsm}</b>)</span>
                                    <button
                                        onClick={() => setSelectedStation(null)}
                                        className="text-slate-400 hover:text-white bg-slate-800 px-2 py-0.5 rounded transition"
                                    >
                                        Cerrar
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Campo Explicatorio Operativo del Reloj Polar */}
                <div className="mt-3 pt-3 border-t border-slate-800/80 bg-slate-950/70 rounded-xl p-3 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 font-bold text-slate-200">
                            <Info className="w-4 h-4 text-amber-400 shrink-0" />
                            <span>Interpretación Operativa de las Agujas ({clockType === "AMARU-FEN" ? "AMARU-FEN" : "AMARU-CHIRI"})</span>
                        </div>
                        <span className="text-[10px] font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                            Doctrina C2
                        </span>
                    </div>

                    {clockType === "AMARU-FEN" ? (
                        <div className="space-y-2 text-[11px]">
                            {/* Insignia Cúspide: 12:00 = 1 ENE 2027 */}
                            <div className="bg-slate-900 border border-slate-700/80 p-2 rounded-lg flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="bg-red-600 text-white font-mono font-black text-[10px] px-1.5 py-0.5 rounded">
                                        12:00 (0°)
                                    </span>
                                    <span className="text-white font-bold text-xs">
                                        1 de Enero de 2027
                                    </span>
                                </div>
                                <span className="text-slate-400 text-[10px] font-mono">
                                    Cúspide / Convección Severa
                                </span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                <div className="bg-slate-900/90 border border-slate-800 p-2.5 rounded-lg space-y-0.5">
                                    <div className="flex items-center gap-1.5 font-bold text-sky-400">
                                        <span className="w-2.5 h-2.5 rounded-full bg-sky-400 shrink-0"></span>
                                        <span>Minutero Azul (Día Actualizado):</span>
                                    </div>
                                    <p className="text-slate-400 text-[10.5px] leading-tight">
                                        Marca el <b>{data?.fecha_actual_legible || "16 de Setiembre de 2026"}</b> (Día 259/365 • Ángulo 254.5° • Las 8:29 h). Refleja el avance del tiempo civil real.
                                    </p>
                                </div>

                                <div className="bg-slate-900/90 border border-slate-800 p-2.5 rounded-lg space-y-0.5">
                                    <div className="flex items-center gap-1.5 font-bold text-red-400">
                                        <span className="w-2.5 h-2.5 rounded-full bg-red-500 shrink-0"></span>
                                        <span>Horario Rojo (Posibilidad Inicio FEN):</span>
                                    </div>
                                    <p className="text-slate-400 text-[10.5px] leading-tight">
                                        Marca <strong className="text-red-300">Diciembre 2026 (334.5° • Las 11:10 h)</strong> con <b className="text-amber-300">84% de probabilidad</b> según informe ENFEN / Boyas DHN Paita (+{fen.anomalia_tsm_c}°C).
                                    </p>
                                </div>
                            </div>

                            <div className="text-[10px] text-amber-200 bg-amber-950/20 border border-amber-800/40 rounded-lg p-2 flex items-start gap-2">
                                <span className="text-amber-400 font-bold shrink-0">⏳ VENTANA DORADA NOV★:</span>
                                <span>
                                    Quedan solo <b>{activeClock.ventana_dorada.dias_restantes} días</b> (hasta el 30 de Noviembre) antes del inicio del Fenómeno El Niño 2026-2027 para culminar descolmataciones y defensas ribereñas.
                                </span>
                            </div>

                            {/* Resumen Cartera Obras PP 0068 en widget */}
                            {carteraObras && (
                                <div className="bg-slate-900/90 border border-amber-900/50 rounded-lg p-2.5 space-y-1.5 text-[10.5px]">
                                    <div className="flex justify-between items-center">
                                        <span className="font-bold text-amber-300 flex items-center gap-1.5">
                                            <Landmark className="w-3.5 h-3.5 text-amber-400" />
                                            Obras PP 0068 vs. Ventana Dorada:
                                        </span>
                                        <span className="text-[9.5px] font-mono text-emerald-400 bg-emerald-950 px-1.5 py-0.5 rounded border border-emerald-800">
                                            PIM S/ {(carteraObras.pim_total_soles / 1e6).toFixed(0)}M
                                        </span>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex justify-between text-[10px] text-slate-300">
                                            <span>Avance Ponderado Global (643 obras):</span>
                                            <span className="font-bold text-white font-mono">{carteraObras.avance_ponderado_pim_global}% (Prom. simple: {carteraObras.promedio_simple_avance_global}%)</span>
                                        </div>
                                        <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden border border-slate-800">
                                            <div 
                                                className="h-full bg-gradient-to-r from-amber-500 to-emerald-500 rounded-full transition-all duration-500" 
                                                style={{ width: `${Math.min(100, carteraObras.avance_ponderado_pim_global)}%` }}
                                            />
                                        </div>
                                        <div className="flex justify-between items-center text-[9.5px] text-slate-400 pt-0.5">
                                            <span className="text-red-300">🚨 Defensas ribereñas: <b>37.7%</b> (146 obras en &lt;20%)</span>
                                            <button
                                                onClick={() => setIsFullscreen(true)}
                                                className="text-sky-400 hover:text-sky-300 font-bold underline"
                                            >
                                                Ver 6 grupos C2 ►
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-1.5 text-[11px] text-slate-300">
                            <p className="text-slate-400 text-[10.5px] leading-relaxed">
                                El <b className="text-sky-400">Minutero Azul</b> indica el avance del calendario civil, mientras que la <b className="text-sky-300">Aguja Glacial</b> monitorea la proximidad hacia las heladas polares del Altiplano (Mazocruz: {chiri.temp_minima_altiplano_c}°C).
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* ========================================================================= */}
            {/* MODAL C2 COMPLETO (PANTALLA COMPLETA CON INFORMACIÓN TÁCTICA DETALLADA)   */}
            {/* ========================================================================= */}
            {isFullscreen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-4 sm:p-6 overflow-y-auto animate-fade-in">
                    <div className="bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-700 rounded-3xl w-full max-w-6xl p-6 shadow-2xl space-y-6 relative max-h-[92vh] overflow-y-auto">
                        
                        {/* Barra Superior del Modal */}
                        <div className="flex flex-wrap justify-between items-center pb-4 border-b border-slate-800 gap-3">
                            <div className="flex items-center gap-3">
                                <div className={`p-2.5 rounded-2xl ${clockType === "AMARU-FEN" ? "bg-red-950/80 border border-red-700 text-red-400" : "bg-sky-950/80 border border-sky-700 text-sky-400"}`}>
                                    {clockType === "AMARU-FEN" ? <Flame className="w-6 h-6" /> : <Snowflake className="w-6 h-6" />}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h2 className="text-lg font-black text-white tracking-wide">
                                            {activeClock.titulo.toUpperCase()}
                                        </h2>
                                        <span className="bg-emerald-950 border border-emerald-700 text-emerald-400 font-mono text-[10px] px-2 py-0.5 rounded-full font-bold">
                                            ● EN VIVO (24/7)
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-400 font-medium">
                                        Doctrina Logística C2 y Cronometría Táctica de Ventanas Doradas • COED Nacional Digital
                                    </p>
                                </div>
                            </div>

                            {/* Selector de Modo y Botón Cerrar */}
                            <div className="flex items-center gap-3">
                                <div className="flex bg-slate-950 p-1.5 rounded-xl border border-slate-800">
                                    <button
                                        onClick={() => setClockType("AMARU-FEN")}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                                            clockType === "AMARU-FEN" ? "bg-red-600 text-white shadow-lg" : "text-slate-400 hover:text-white"
                                        }`}
                                    >
                                        <Flame className="w-3.5 h-3.5" /> AMARU-FEN (Niño / Costa)
                                    </button>
                                    <button
                                        onClick={() => setClockType("AMARU-CHIRI")}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                                            clockType === "AMARU-CHIRI" ? "bg-sky-600 text-white shadow-lg" : "text-slate-400 hover:text-white"
                                        }`}
                                    >
                                        <Snowflake className="w-3.5 h-3.5" /> AMARU-CHIRI (Niña / Altiplano)
                                    </button>
                                    <button
                                        onClick={() => setClockType("AMARU-FUEGO")}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                                            clockType === "AMARU-FUEGO" ? "bg-orange-600 text-white shadow-lg" : "text-slate-400 hover:text-white"
                                        }`}
                                    >
                                        <Flame className="w-3.5 h-3.5" /> AMARU-FUEGO (Incendios / Biomasa)
                                    </button>
                                </div>

                                <button
                                    onClick={() => setIsFullscreen(false)}
                                    className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl transition border border-slate-700"
                                >
                                    <Minimize2 className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Grid Principal de 3 Columnas C2 */}
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                            
                            {/* [COLUMNA 1] TELEMETRÍA EN TIEMPO REAL & CUENTA REGRESIVA (3 Columnas) */}
                            <div className="lg:col-span-3 space-y-4">
                                <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 space-y-3">
                                    <span className="text-[11px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1.5">
                                        <Compass className="w-4 h-4 text-sky-400" /> Cinemática Polar C2
                                    </span>
                                    <div className="space-y-2 text-xs">
                                        <div className="flex justify-between border-b border-slate-850 pb-1 text-slate-400">
                                            <span>Las 12:00 (0°):</span>
                                            <span className="font-mono text-red-400 font-bold">1 ENE 2027</span>
                                        </div>
                                        <div className="flex justify-between border-b border-slate-850 pb-1 text-slate-400">
                                            <span>Horario (Inicio FEN):</span>
                                            <span className="font-mono text-amber-300 font-bold">{hourAngle}° (11:10 h)</span>
                                        </div>
                                        <div className="flex justify-between border-b border-slate-850 pb-1 text-slate-400">
                                            <span>Minutero (Día Civil):</span>
                                            <span className="font-mono text-sky-400 font-bold">{minuteAngle.toFixed(1)}° (8:29 h)</span>
                                        </div>
                                        <div className="flex justify-between border-b border-slate-850 pb-1 text-slate-400">
                                            <span>Probabilidad ENFEN:</span>
                                            <span className="font-bold text-red-400">84% (Alerta FEN)</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Banner Gran Contador Ventana Dorada */}
                                <div className="bg-gradient-to-br from-amber-950/40 via-slate-950 to-slate-950 border border-amber-800/80 rounded-2xl p-4 text-center space-y-2 shadow-xl">
                                    <div className="inline-block bg-amber-950 border border-amber-600 text-amber-300 font-mono text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase">
                                        {activeClock.ventana_dorada.badge}
                                    </div>
                                    <div>
                                        <div className="text-4xl font-black text-amber-400 font-mono">
                                            {activeClock.ventana_dorada.dias_restantes}
                                        </div>
                                        <div className="text-xs font-semibold text-slate-300 uppercase tracking-wide">
                                            Días Restantes de Preparación
                                        </div>
                                    </div>
                                    <p className="text-[11px] text-amber-200/80 leading-tight">
                                        {clockType === "AMARU-FEN"
                                            ? "Plazo fatal para descolmatar cauces y conformar defensas ribereñas antes de las lluvias de verano."
                                            : (clockType === "AMARU-CHIRI"
                                                ? "Plazo fatal para dosificar camélidos y almacenar pacas de forraje antes del friaje de mayo."
                                                : "Plazo fatal para apertura de fajas cortafuego comunales y equipamiento de brigadas antes del estiaje.")}
                                    </p>
                                </div>

                                {/* Sensores Físicos */}
                                <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 space-y-2 text-xs">
                                    <span className="text-[11px] uppercase font-bold text-slate-400 tracking-wider block">
                                        Red de Telemetría Oficial
                                    </span>
                                    {clockType === "AMARU-FEN" ? (
                                        <div className="space-y-1.5 font-mono text-[11px]">
                                            <div className="flex justify-between text-slate-300">
                                                <span>Boya DHN Paita:</span>
                                                <span className="text-red-400 font-bold">+{fen.anomalia_tsm_c}°C</span>
                                            </div>
                                            <div className="flex justify-between text-slate-300">
                                                <span>Onda Kelvin:</span>
                                                <span className="text-emerald-400 font-bold">Activa (85m termoclina)</span>
                                            </div>
                                            <div className="flex justify-between text-slate-300">
                                                <span>Semáforo ENFEN:</span>
                                                <span className="text-red-400 font-bold">Alerta El Niño</span>
                                            </div>
                                        </div>
                                    ) : clockType === "AMARU-CHIRI" ? (
                                        <div className="space-y-1.5 font-mono text-[11px]">
                                            <div className="flex justify-between text-slate-300">
                                                <span>EMA Mazocruz:</span>
                                                <span className="text-sky-400 font-bold">{chiri.temp_minima_altiplano_c}°C</span>
                                            </div>
                                            <div className="flex justify-between text-slate-300">
                                                <span>Isoterma Crítica:</span>
                                                <span className="text-red-400 font-bold">{chiri.isoterma_severa_c}°C</span>
                                            </div>
                                            <div className="flex justify-between text-slate-300">
                                                <span>Altitud Estación:</span>
                                                <span className="text-slate-400">3,970 msnm</span>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-1.5 font-mono text-[11px]">
                                            <div className="flex justify-between text-slate-300">
                                                <span>VIIRS Focos 24h:</span>
                                                <span className="text-orange-400 font-bold">{fuego.focos_activos_24h ?? 6} focos</span>
                                            </div>
                                            <div className="flex justify-between text-slate-300">
                                                <span>FRP Acumulado:</span>
                                                <span className="text-red-400 font-bold">{fuego.frp_total_mw ? `${Math.round(fuego.frp_total_mw)} MW` : "485 MW"}</span>
                                            </div>
                                            <div className="flex justify-between text-slate-300">
                                                <span>Humedad Suelo:</span>
                                                <span className="text-amber-400 font-bold">{fuego.humedad_suelo_0_7cm_pct ?? 6.5}%</span>
                                            </div>
                                            <div className="flex justify-between text-slate-300 pt-1 border-t border-slate-800">
                                                <span>Estado Dinámico:</span>
                                                <span className="text-emerald-400 font-bold text-[10px]">{fuego.badge_alerta || "RESIDUAL"}</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* [COLUMNA 2] DIAL POLAR VECTORIAL SVG 360° (6 Columnas) */}
                            <div className="lg:col-span-6 flex justify-center items-center">
                                <div className="relative w-[340px] h-[340px] sm:w-[440px] sm:h-[440px] md:w-[480px] md:h-[480px]">
                                    <svg viewBox="0 0 520 520" className="w-full h-full drop-shadow-2xl">
                                        <defs>
                                            {/* Gradiente de Intensidad Histórica del FEN (Ascenso hacia Marzo Clímax) */}
                                            <linearGradient id="fen-modal-severity-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                                <stop offset="0%" stopColor="#f87171" />    {/* Dic: Inicio / Débil (+1.5°C) */}
                                                <stop offset="25%" stopColor="#ef4444" />   {/* Ene: Moderado (+2.3°C) */}
                                                <stop offset="50%" stopColor="#dc2626" />   {/* Feb: Severo / Yaku (+2.8°C) */}
                                                <stop offset="75%" stopColor="#b91c1c" />   {/* Feb fin: Niño Costero 2017 (+3.2°C) */}
                                                <stop offset="90%" stopColor="#7f1d1d" />   {/* Mar: Niño 97-98 (+3.8°C) */}
                                                <stop offset="100%" stopColor="#450a0a" />  {/* Mar: CLÍMAX Mega-Niño 82-83 (+4.1°C) */}
                                            </linearGradient>
                                            {/* Gradiente Extendido FEN: Resaca Fluvial, Descompresión y Cierre hasta Julio 2027 */}
                                            <linearGradient id="fen-modal-descent-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                                <stop offset="0%" stopColor="#450a0a" />    {/* Mar Clímax (+4.1°C) */}
                                                <stop offset="25%" stopColor="#b91c1c" />   {/* Abr: Resaca Fluvial (+2.7°C) */}
                                                <stop offset="50%" stopColor="#ea580c" />   {/* May: Descompresión Convectiva (+1.9°C) */}
                                                <stop offset="75%" stopColor="#f59e0b" />   {/* Jun: Saturación Suelos Remanente (+1.2°C) */}
                                                <stop offset="100%" stopColor="#10b981" />  {/* Jul 2027: Cierre Interanual (+0.5°C) */}
                                            </linearGradient>
                                        </defs>
                                        {/* Dial Fondo C2 */}
                                        <circle cx={cx} cy={cy} r={r} fill="#030712" stroke="#334155" strokeWidth="4" />
                                        <circle cx={cx} cy={cy} r={r - 30} fill="none" stroke="#1e293b" strokeWidth="2" strokeDasharray="6 6" />
                                        <circle cx={cx} cy={cy} r={r - 90} fill="none" stroke="#1e293b" strokeWidth="1.5" />
                                        <circle cx={cx} cy={cy} r={r - 150} fill="none" stroke="#1e293b" strokeWidth="1" />

                                        {/* 12 Rayas y Números Horarios (0° = 12:00 = 1 de Enero de 2027) */}
                                        {hourMarks.map((hm) => {
                                            const p1 = getPoint(hm.angle, r - 4);
                                            const p2 = getPoint(hm.angle, hm.esOrigen12 ? r - 28 : r - 18);
                                            const pText = getPoint(hm.angle, r - 38);

                                            return (
                                                <g key={`hour-${hm.hour}`} className="select-none pointer-events-none">
                                                    <line
                                                        x1={p1.x}
                                                        y1={p1.y}
                                                        x2={p2.x}
                                                        y2={p2.y}
                                                        stroke={hm.esOrigen12 ? "#ef4444" : "#cbd5e1"}
                                                        strokeWidth={hm.esOrigen12 ? 4 : 2}
                                                    />
                                                    {hm.esOrigen12 ? (
                                                        <g transform={`translate(${cx}, ${cy - r + 36})`}>
                                                            <rect
                                                                x="-46"
                                                                y="-13"
                                                                width="92"
                                                                height="22"
                                                                rx="5"
                                                                fill="#030712"
                                                                stroke="#ef4444"
                                                                strokeWidth="2"
                                                            />
                                                            <text
                                                                x="0"
                                                                y="3"
                                                                textAnchor="middle"
                                                                fill="#ffffff"
                                                                fontSize="10"
                                                                fontWeight="900"
                                                                fontFamily="monospace"
                                                            >
                                                                12 • 1 ENE 2027
                                                            </text>
                                                        </g>
                                                    ) : (
                                                        <text
                                                            x={pText.x}
                                                            y={pText.y}
                                                            fill="#94a3b8"
                                                            fontSize="11"
                                                            fontWeight="800"
                                                            fontFamily="monospace"
                                                            textAnchor="middle"
                                                            dominantBaseline="central"
                                                        >
                                                            {hm.label}
                                                        </text>
                                                    )}
                                                </g>
                                            );
                                        })}

                                        {/* Nombres de Meses Centrados en su Arco de 30° con Sincronización Cromática FEN */}
                                        {monthCenters.map((mc) => {
                                            const pText = getPoint(mc.centerAngle, r - 58);
                                            const st = clockType === "AMARU-FEN" ? getStationForMonth(mc.nombre) : null;
                                            const isStSelected = st && selectedStation?.id === st.id;
                                            const isStHovered = st && hoveredStationId === st.id;
                                            const labelColor = clockType === "AMARU-FEN" && st ? st.color : "#64748b";

                                            return (
                                                <g
                                                    key={`month-${mc.nombre}`}
                                                    className={st ? "cursor-pointer" : ""}
                                                    onClick={() => {
                                                        if (st) setSelectedStation(isStSelected ? null : st);
                                                    }}
                                                    onMouseEnter={() => st && setHoveredStationId(st.id)}
                                                    onMouseLeave={() => st && setHoveredStationId(null)}
                                                >
                                                    <text
                                                        x={pText.x}
                                                        y={pText.y}
                                                        fill={isStSelected ? "#ffffff" : labelColor}
                                                        fontSize={isStSelected ? "13" : "11"}
                                                        fontWeight={isStSelected ? "900" : "bold"}
                                                        fontFamily="monospace"
                                                        textAnchor="middle"
                                                        dominantBaseline="central"
                                                        className={isStSelected ? "filter drop-shadow-[0_0_6px_rgba(255,255,255,0.8)]" : ""}
                                                    >
                                                        {mc.nombre}
                                                    </text>
                                                    {st && (
                                                        <circle
                                                            cx={getPoint(mc.centerAngle, r - 70).x}
                                                            cy={getPoint(mc.centerAngle, r - 70).y}
                                                            r={isStSelected ? 3.5 : 2}
                                                            fill={st.color}
                                                        />
                                                    )}
                                                </g>
                                            );
                                        })}

                                        {/* ==================================================== */}
                                        {/* RENDER AMARU-FEN: 11 Sectores Cromáticos Sincronizados*/}
                                        {/* ==================================================== */}
                                        {clockType === "AMARU-FEN" && (
                                            <g id="modal-fen-multianual-sectors">
                                                {/* Pista base exterior sutil */}
                                                <path
                                                    d={getArcPath(240, 210, r - 12)}
                                                    fill="none"
                                                    stroke="#0f172a"
                                                    strokeWidth="30"
                                                    className="opacity-70"
                                                />

                                                {/* 11 Arcos de Color Sincronizados con las 11 Barras del Histograma */}
                                                {fen.cronograma_multianual_fen.map((st: any) => {
                                                    const angles = stationAngles[st.id] || { start: 0, end: 30 };
                                                    const isSelected = selectedStation?.id === st.id;
                                                    const isHovered = hoveredStationId === st.id;
                                                    const arcPath = getArcPath(angles.start + 0.8, angles.end - 0.8, r - 12);

                                                    return (
                                                        <g
                                                            key={`modal-sector-${st.id}`}
                                                            className="cursor-pointer group"
                                                            onClick={() => setSelectedStation(isSelected ? null : st)}
                                                            onMouseEnter={() => setHoveredStationId(st.id)}
                                                            onMouseLeave={() => setHoveredStationId(null)}
                                                        >
                                                            <title>{`${st.label} (${st.dia_rango_relativo}): ${st.fase} • Intensidad: ${st.severidad_pct}% • ΔTSM: ${st.anomalia_tsm}`}</title>
                                                            <path
                                                                d={arcPath}
                                                                fill="none"
                                                                stroke={st.color}
                                                                strokeWidth={isSelected ? 34 : isHovered ? 30 : 24}
                                                                strokeLinecap="round"
                                                                className={`transition-all duration-200 ${
                                                                    isSelected
                                                                        ? "opacity-100 filter drop-shadow-[0_0_12px_rgba(255,255,255,0.9)]"
                                                                        : isHovered
                                                                        ? "opacity-100 filter brightness-125"
                                                                        : "opacity-90 hover:opacity-100"
                                                                }`}
                                                            />
                                                            {isSelected && (
                                                                <path
                                                                    d={arcPath}
                                                                    fill="none"
                                                                    stroke="#ffffff"
                                                                    strokeWidth={4.5}
                                                                    strokeLinecap="round"
                                                                    className="opacity-95 animate-pulse"
                                                                />
                                                            )}
                                                        </g>
                                                    );
                                                })}

                                                {/* Balizas y rótulos de análogos históricos grabados sobre el arco */}
                                                <g id="hitos-historicos-arco" className="opacity-95 select-none pointer-events-none">
                                                    {/* Setiembre 2026: Civil Hoy (255°) */}
                                                    <circle cx={getPoint(255, r - 12).x} cy={getPoint(255, r - 12).y} r="5" fill="#38bdf8" stroke="#ffffff" strokeWidth="1.5" />
                                                    {/* Octubre 2026: Kelvin (285°) */}
                                                    <circle cx={getPoint(285, r - 12).x} cy={getPoint(285, r - 12).y} r="4.5" fill="#f87171" stroke="#ffffff" strokeWidth="1.5" />
                                                    {/* Noviembre 2026: Ventana Dorada (315°) */}
                                                    <circle cx={getPoint(315, r - 12).x} cy={getPoint(315, r - 12).y} r="6" fill="#facc15" stroke="#ffffff" strokeWidth="2" />
                                                    <text x={getPoint(315, r - 72).x} y={getPoint(315, r - 72).y} fill="#fde047" fontSize="10" fontWeight="900" textAnchor="middle" dominantBaseline="central">
                                                        NOV★
                                                    </text>
                                                    {/* Enero 2027: Yaku (15°) */}
                                                    <circle cx={getPoint(15, r - 12).x} cy={getPoint(15, r - 12).y} r="4.5" fill="#dc2626" stroke="#ffffff" strokeWidth="1.5" />
                                                    {/* Febrero 2017: Niño 2017 (45°) */}
                                                    <circle cx={getPoint(45, r - 12).x} cy={getPoint(45, r - 12).y} r="5" fill="#b91c1c" stroke="#ffffff" strokeWidth="2" />
                                                    {/* Marzo 2027: Clímax Catastrófico 1982-83 / 97-98 (75°) */}
                                                    <circle cx={getPoint(75, r - 12).x} cy={getPoint(75, r - 12).y} r="7" fill="#450a0a" stroke="#ffffff" strokeWidth="2.5" />
                                                    <text x={getPoint(75, r - 72).x} y={getPoint(75, r - 72).y} fill="#fca5a5" fontSize="10" fontWeight="900" textAnchor="middle" dominantBaseline="central">
                                                        MAR⚡ PICO
                                                    </text>
                                                    {/* Julio 2027: Cierre Interanual (195°) */}
                                                    <circle cx={getPoint(195, r - 12).x} cy={getPoint(195, r - 12).y} r="5.5" fill="#10b981" stroke="#ffffff" strokeWidth="2" />
                                                    <text x={getPoint(195, r - 72).x} y={getPoint(195, r - 72).y} fill="#6ee7b7" fontSize="10" fontWeight="900" textAnchor="middle" dominantBaseline="central">
                                                        JUL✓ CIERRE
                                                    </text>
                                                </g>
                                            </g>
                                        )}

                                        {/* ==================================================== */}
                                        {/* RENDER AMARU-CHIRI: 3 Pistas (May-Jul) + Abril ABR★ */}
                                        {/* ==================================================== */}
                                        {clockType === "AMARU-CHIRI" && (
                                            <>
                                                {/* 3 Pistas Radiales Concéntricas (Mayo a Julio: 120° a 210°) */}
                                                <path
                                                    d={`M ${getPoint(120, r - 10).x} ${getPoint(120, r - 10).y} A ${r - 10} ${r - 10} 0 0 1 ${getPoint(210, r - 10).x} ${getPoint(210, r - 10).y}`}
                                                    fill="none"
                                                    stroke="#38bdf8"
                                                    strokeWidth="18"
                                                    strokeLinecap="round"
                                                />
                                                <path
                                                    d={`M ${getPoint(120, r - 35).x} ${getPoint(120, r - 35).y} A ${r - 35} ${r - 35} 0 0 1 ${getPoint(210, r - 35).x} ${getPoint(210, r - 35).y}`}
                                                    fill="none"
                                                    stroke="#0284c7"
                                                    strokeWidth="18"
                                                    strokeLinecap="round"
                                                />
                                                <path
                                                    d={`M ${getPoint(120, r - 60).x} ${getPoint(120, r - 60).y} A ${r - 60} ${r - 60} 0 0 1 ${getPoint(210, r - 60).x} ${getPoint(210, r - 60).y}`}
                                                    fill="none"
                                                    stroke="#0369a1"
                                                    strokeWidth="18"
                                                    strokeLinecap="round"
                                                />

                                                {/* Rotulación en negro sólido (#000000, font-weight: 900) para C2 */}
                                                <text
                                                    x={getPoint(165, r - 10).x}
                                                    y={getPoint(165, r - 10).y}
                                                    fill="#000000"
                                                    fontSize="8"
                                                    fontWeight="900"
                                                    textAnchor="middle"
                                                    dominantBaseline="central"
                                                >
                                                    ISOTERMA &lt; -10°C
                                                </text>
                                                <text
                                                    x={getPoint(165, r - 35).x}
                                                    y={getPoint(165, r - 35).y}
                                                    fill="#000000"
                                                    fontSize="8"
                                                    fontWeight="900"
                                                    textAnchor="middle"
                                                    dominantBaseline="central"
                                                >
                                                    RIESGO ALPACAS
                                                </text>

                                                {/* Sector Amarillo Táctico de Abril (90° a 120°) */}
                                                <path
                                                    d={`M ${getPoint(90, r - 15).x} ${getPoint(90, r - 15).y} A ${r - 15} ${r - 15} 0 0 1 ${getPoint(120, r - 15).x} ${getPoint(120, r - 15).y}`}
                                                    fill="none"
                                                    stroke="#facc15"
                                                    strokeWidth="28"
                                                    strokeLinecap="round"
                                                />
                                                <circle cx={getPoint(105, r - 15).x} cy={getPoint(105, r - 15).y} r="14" fill="#fef08a" />
                                                <text
                                                    x={getPoint(105, r - 15).x}
                                                    y={getPoint(105, r - 15).y}
                                                    fill="#000000"
                                                    fontSize="9"
                                                    fontWeight="900"
                                                    textAnchor="middle"
                                                    dominantBaseline="central"
                                                >
                                                    ABR★
                                                </text>
                                            </>
                                        )}

                                        {/* ==================================================== */}
                                        {/* RENDER AMARU-FUEGO: 3 Pistas Radiales & Ventana Dorada */}
                                        {/* ==================================================== */}
                                        {clockType === "AMARU-FUEGO" && (
                                            <>
                                                {/* Pista Exterior: FWI Meteorológico (180° a fin dinámico) */}
                                                <path
                                                    d={`M ${getPoint(180, r - 10).x} ${getPoint(180, r - 10).y} A ${r - 10} ${r - 10} 0 0 1 ${getPoint(fuego.arco_amenaza?.angulo_fin || 300, r - 10).x} ${getPoint(fuego.arco_amenaza?.angulo_fin || 300, r - 10).y}`}
                                                    fill="none"
                                                    stroke="#ef4444"
                                                    strokeWidth="18"
                                                    strokeLinecap="round"
                                                />
                                                {/* Pista Media: Estrés Hídrico Suelo <10% (180° a fin dinámico) */}
                                                <path
                                                    d={`M ${getPoint(180, r - 35).x} ${getPoint(180, r - 35).y} A ${r - 35} ${r - 35} 0 0 1 ${getPoint(fuego.arco_amenaza?.angulo_fin || 300, r - 35).x} ${getPoint(fuego.arco_amenaza?.angulo_fin || 300, r - 35).y}`}
                                                    fill="none"
                                                    stroke="#ea580c"
                                                    strokeWidth="18"
                                                    strokeLinecap="round"
                                                />
                                                {/* Pista Interior: Detección Térmica Satelital VIIRS/MODIS */}
                                                <path
                                                    d={`M ${getPoint(180, r - 60).x} ${getPoint(180, r - 60).y} A ${r - 60} ${r - 60} 0 0 1 ${getPoint(fuego.arco_amenaza?.angulo_fin || 300, r - 60).x} ${getPoint(fuego.arco_amenaza?.angulo_fin || 300, r - 60).y}`}
                                                    fill="none"
                                                    stroke="#b91c1c"
                                                    strokeWidth="18"
                                                    strokeLinecap="round"
                                                />

                                                {/* Rótulos en negro sólido (#000000, font-weight: 900) para C2 */}
                                                <text
                                                    x={getPoint(240, r - 10).x}
                                                    y={getPoint(240, r - 10).y}
                                                    fill="#000000"
                                                    fontSize="8"
                                                    fontWeight="900"
                                                    textAnchor="middle"
                                                    dominantBaseline="central"
                                                >
                                                    PICO HISTÓRICO FWI
                                                </text>
                                                <text
                                                    x={getPoint(240, r - 35).x}
                                                    y={getPoint(240, r - 35).y}
                                                    fill="#000000"
                                                    fontSize="8"
                                                    fontWeight="900"
                                                    textAnchor="middle"
                                                    dominantBaseline="central"
                                                >
                                                    SUELO SECO &lt;10%
                                                </text>

                                                {/* Ventana Dorada Silvícola Abril (90° a 120°) */}
                                                <path
                                                    d={`M ${getPoint(90, r - 15).x} ${getPoint(90, r - 15).y} A ${r - 15} ${r - 15} 0 0 1 ${getPoint(120, r - 15).x} ${getPoint(120, r - 15).y}`}
                                                    fill="none"
                                                    stroke="#facc15"
                                                    strokeWidth="28"
                                                    strokeLinecap="round"
                                                />
                                                <circle cx={getPoint(105, r - 15).x} cy={getPoint(105, r - 15).y} r="14" fill="#fef08a" />
                                                <text
                                                    x={getPoint(105, r - 15).x}
                                                    y={getPoint(105, r - 15).y}
                                                    fill="#000000"
                                                    fontSize="8.5"
                                                    fontWeight="900"
                                                    textAnchor="middle"
                                                    dominantBaseline="central"
                                                >
                                                    CORTAFUEGO
                                                </text>
                                            </>
                                        )}

                                        {/* 1. MINUTERO: Día Actualizado del Calendario Civil (Manecilla Larga y Precisa) */}
                                        <g id="modal-minutero-dia-actual">
                                            <polygon
                                                points={`${minuteTip.x},${minuteTip.y} ${minuteBase1.x},${minuteBase1.y} ${minuteTail.x},${minuteTail.y} ${minuteBase2.x},${minuteBase2.y}`}
                                                fill="#38bdf8"
                                                stroke="#ffffff"
                                                strokeWidth="2"
                                                className="drop-shadow-md"
                                            />
                                            {/* Baliza del Día Actual */}
                                            <circle cx={minuteTip.x} cy={minuteTip.y} r="7" fill="#0284c7" stroke="#ffffff" strokeWidth="2" />
                                            <circle cx={minuteTip.x} cy={minuteTip.y} r="2.5" fill="#38bdf8" />
                                            
                                            {/* Etiqueta flotante del minutero */}
                                            <g transform={`translate(${minuteTip.x}, ${minuteTip.y})`}>
                                                <rect
                                                    x={minuteAngle > 180 ? -120 : 12}
                                                    y="-11"
                                                    width="114"
                                                    height="22"
                                                    rx="6"
                                                    fill="#030712"
                                                    stroke="#0284c7"
                                                    strokeWidth="1.5"
                                                    opacity="0.95"
                                                />
                                                <text
                                                    x={minuteAngle > 180 ? -63 : 69}
                                                    y="4"
                                                    textAnchor="middle"
                                                    fill="#38bdf8"
                                                    fontSize="9"
                                                    fontWeight="900"
                                                    fontFamily="monospace"
                                                >
                                                    ● MINUTERO: 16 SET
                                                </text>
                                            </g>
                                        </g>

                                        {/* 2. HORARIO: Posibilidad de Inicio del Fenómeno El Niño 2026-2027 (Manecilla Corta Táctica) */}
                                        <g id="modal-horario-inicio-fen">
                                            <polygon
                                                points={`${hourTip.x},${hourTip.y} ${hourBase1.x},${hourBase1.y} ${hourTail.x},${hourTail.y} ${hourBase2.x},${hourBase2.y}`}
                                                fill={clockType === "AMARU-FEN" ? "#ef4444" : "#38bdf8"}
                                                stroke="#ffffff"
                                                strokeWidth="3.5"
                                                className="drop-shadow-2xl"
                                            />
                                            {/* Alma Reflectante Interior */}
                                            {clockType === "AMARU-FEN" && (
                                                <line
                                                    x1={cx}
                                                    y1={cy}
                                                    x2={hourTip.x}
                                                    y2={hourTip.y}
                                                    stroke="#facc15"
                                                    strokeWidth="3"
                                                    strokeLinecap="round"
                                                />
                                            )}
                                            <circle cx={hourTip.x} cy={hourTip.y} r="7.5" fill={clockType === "AMARU-FEN" ? "#ef4444" : "#38bdf8"} stroke="#ffffff" strokeWidth="2" />
                                            {clockType === "AMARU-FEN" && (
                                                <circle cx={hourTip.x} cy={hourTip.y} r="3" fill="#facc15" />
                                            )}

                                            {/* Etiqueta flotante del horario táctico */}
                                            {clockType === "AMARU-FEN" && (
                                                <g transform={`translate(${hourTip.x}, ${hourTip.y})`}>
                                                    <rect
                                                        x={hourAngle > 180 ? -175 : 12}
                                                        y="-11"
                                                        width="170"
                                                        height="22"
                                                        rx="6"
                                                        fill="#030712"
                                                        stroke="#ef4444"
                                                        strokeWidth="1.5"
                                                        opacity="0.95"
                                                    />
                                                    <text
                                                        x={hourAngle > 180 ? -90 : 97}
                                                        y="4"
                                                        textAnchor="middle"
                                                        fill="#fca5a5"
                                                        fontSize="8.5"
                                                        fontWeight="900"
                                                        fontFamily="monospace"
                                                    >
                                                        ▲ HORARIO: INICIO FEN (DIC • 84%)
                                                    </text>
                                                </g>
                                            )}
                                        </g>
                                            {/* Buje central C2 con Telemetría en Vivo */}
                                            <circle cx={cx} cy={cy} r="54" fill="#030712" stroke={clockType === "AMARU-FEN" ? "#ef4444" : (clockType === "AMARU-FUEGO" ? "#ea580c" : "#38bdf8")} strokeWidth="3" />
                                            {clockType === "AMARU-FEN" ? (
                                                <g className="select-none pointer-events-none">
                                                    <circle cx={cx} cy={cy} r="48" fill="#090d16" />
                                                    <text x={cx} y={cy - 20} textAnchor="middle" fill="#94a3b8" fontSize="10" fontWeight="bold" letterSpacing="1">
                                                        ANOMALÍA TSM
                                                    </text>
                                                    <text x={cx} y={cy + 4} textAnchor="middle" fill="#ef4444" fontSize="26" fontWeight="900" fontFamily="monospace">
                                                        {fen.anomalia_tsm_c >= 0 ? `+${fen.anomalia_tsm_c.toFixed(1)}` : fen.anomalia_tsm_c.toFixed(1)}°C
                                                    </text>
                                                    <text x={cx} y={cy + 22} textAnchor="middle" fill="#38bdf8" fontSize="13" fontWeight="bold" fontFamily="monospace">
                                                        TSM {fen.temperatura_mar_c?.toFixed(1)}°C
                                                    </text>
                                                    <text x={cx} y={cy + 36} textAnchor="middle" fill="#64748b" fontSize="8" fontWeight="bold">
                                                        PAITA • IMARPE
                                                    </text>
                                                </g>
                                            ) : clockType === "AMARU-CHIRI" ? (
                                                <g className="select-none pointer-events-none">
                                                    <circle cx={cx} cy={cy} r="48" fill="#090d16" />
                                                    <text x={cx} y={cy - 20} textAnchor="middle" fill="#94a3b8" fontSize="10" fontWeight="bold" letterSpacing="1">
                                                        T. MÍNIMA ALTIPLANO
                                                    </text>
                                                    <text x={cx} y={cy + 4} textAnchor="middle" fill="#38bdf8" fontSize="26" fontWeight="900" fontFamily="monospace">
                                                        {chiri.temp_minima_altiplano_c?.toFixed(1)}°C
                                                    </text>
                                                    <text x={cx} y={cy + 22} textAnchor="middle" fill="#cbd5e1" fontSize="12" fontWeight="bold" fontFamily="monospace">
                                                        MAZOCRUZ 3,970m
                                                    </text>
                                                    <text x={cx} y={cy + 36} textAnchor="middle" fill="#64748b" fontSize="8" fontWeight="bold">
                                                        SENAMHI EMA
                                                    </text>
                                                </g>
                                            ) : (
                                                <g className="select-none pointer-events-none">
                                                    <circle cx={cx} cy={cy} r="48" fill="#090d16" />
                                                    <text x={cx} y={cy - 20} textAnchor="middle" fill="#94a3b8" fontSize="9" fontWeight="bold" letterSpacing="1">
                                                        FOCOS ACTIVOS (24H)
                                                    </text>
                                                    <text x={cx} y={cy + 4} textAnchor="middle" fill="#f97316" fontSize="26" fontWeight="900" fontFamily="monospace">
                                                        {fuego.focos_activos_24h ?? 6}
                                                    </text>
                                                    <text x={cx} y={cy + 22} textAnchor="middle" fill="#fbbf24" fontSize="12" fontWeight="bold" fontFamily="monospace">
                                                        FRP {fuego.frp_total_mw ? `${Math.round(fuego.frp_total_mw)} MW` : "485 MW"}
                                                    </text>
                                                    <text x={cx} y={cy + 36} textAnchor="middle" fill="#64748b" fontSize="8" fontWeight="bold">
                                                        NASA FIRMS VIIRS
                                                    </text>
                                                </g>
                                            )}
                                            <circle cx={cx} cy={cy} r="5" fill="#ffffff" />
                                    </svg>
                                </div>
                            </div>

                            {/* [COLUMNA 3] DOCTRINA LOGÍSTICA & ANÁLOGOS HISTÓRICOS (3 Columnas) */}
                            <div className="lg:col-span-3 space-y-4">
                                {/* Checklist Logístico de la Ventana Dorada */}
                                <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 space-y-2.5">
                                    <div className="flex justify-between items-center text-xs font-bold text-amber-400 uppercase">
                                        <span className="flex items-center gap-1.5">
                                            <CheckSquare className="w-4 h-4" /> Doctrina Logística
                                        </span>
                                        <span className="text-[10px] font-mono text-slate-400">Avance</span>
                                    </div>
                                    
                                    <div className="space-y-2 text-xs">
                                        {(clockType === "AMARU-FEN" && carteraObras?.grupos_estrategicos?.length
                                            ? carteraObras.grupos_estrategicos.map((g: any) => ({
                                                hitos: `${g.id.replace(/G\d+_/, '')}: ${g.nombre}`,
                                                progreso_nacional: Math.round(g.avance_ponderado_pim),
                                                critico: g.avance_ponderado_pim < 40.0,
                                                obras: g.total_obras
                                            }))
                                            : activeClock.ventana_dorada.doctrina_logistica
                                        ).map((item: any, i: number) => {
                                            const isCrit = item.critico || item.progreso_nacional < 40;
                                            const isGood = item.progreso_nacional >= 70;
                                            return (
                                                <div key={i} className="space-y-1">
                                                    <div className="flex justify-between text-[11px] text-slate-300">
                                                        <span className="line-clamp-1" title={item.hitos}>{item.hitos}</span>
                                                        <span className={`font-mono font-bold ${isCrit ? "text-red-400" : isGood ? "text-emerald-400" : "text-amber-400"}`}>
                                                            {item.progreso_nacional}%
                                                        </span>
                                                    </div>
                                                    <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                                                        <div
                                                            className={`h-full rounded-full transition-all duration-500 ${
                                                                isCrit ? "bg-red-500" : isGood ? "bg-emerald-500" : "bg-amber-500"
                                                            }`}
                                                            style={{ width: `${Math.min(100, item.progreso_nacional)}%` }}
                                                        ></div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Resumen de Obras Agrupadas de la ANA / MIDAGRI (Sustituye Análogos en Columna 3) */}
                                {clockType === "AMARU-FEN" && resumenAna ? (
                                    <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-lg">
                                        <div className="flex justify-between items-center text-xs font-bold text-teal-400 uppercase">
                                            <span className="flex items-center gap-1.5">
                                                <Waves className="w-4 h-4 text-teal-400" /> Defensas Fluviales ANA
                                            </span>
                                            <span className="text-[10px] font-mono text-teal-300 bg-teal-950/80 border border-teal-800/80 px-2 py-0.5 rounded-full">
                                                D.S. 164-2026-EF
                                            </span>
                                        </div>

                                        {/* Mini KPIs de la ANA */}
                                        <div className="grid grid-cols-3 gap-2 text-center">
                                            <div className="bg-slate-900/90 p-2 rounded-xl border border-slate-800">
                                                <span className="text-[9px] font-mono text-slate-400 uppercase block">Total Obras</span>
                                                <span className="text-sm font-black text-teal-300 font-mono">
                                                    {resumenAna.total_intervenciones}
                                                </span>
                                                <span className="text-[8px] text-slate-500 block">en 8 Regiones</span>
                                            </div>
                                            <div className="bg-slate-900/90 p-2 rounded-xl border border-slate-800">
                                                <span className="text-[9px] font-mono text-slate-400 uppercase block">Inversión</span>
                                                <span className="text-sm font-black text-white font-mono">
                                                    S/ {(resumenAna.costo_total_soles / 1e6).toFixed(0)}M
                                                </span>
                                                <span className="text-[8px] text-slate-500 block">D.S. 164-EF</span>
                                            </div>
                                            <div className="bg-slate-900/90 p-2 rounded-xl border border-slate-800">
                                                <span className="text-[9px] font-mono text-slate-400 uppercase block">Cauces</span>
                                                <span className="text-sm font-black text-amber-400 font-mono">
                                                    {resumenAna.meta_total_km} km
                                                </span>
                                                <span className="text-[8px] text-slate-500 block">Descolmatados</span>
                                            </div>
                                        </div>

                                        {/* Frentes Tácticos Agrupados */}
                                        <div className="space-y-2">
                                            <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">
                                                Frentes Hidrográficos Prioritarios:
                                            </span>
                                            {resumenAna.frentes_tacticos.map((f: any, idx: number) => {
                                                const isCrit = f.avance_ponderado < 45;
                                                return (
                                                    <div key={idx} className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800 space-y-1.5">
                                                        <div className="flex justify-between items-center text-xs">
                                                            <span className="font-bold text-slate-200 text-[11px] line-clamp-1" title={f.nombre}>
                                                                {f.nombre.split("(")[0].trim()}
                                                            </span>
                                                            <span className="text-[10px] font-mono font-bold text-slate-300">
                                                                {f.total_obras} obras • S/ {(f.costo_total_soles / 1e6).toFixed(0)}M
                                                            </span>
                                                        </div>

                                                        {/* Barra de Avance Ponderado */}
                                                        <div className="space-y-0.5">
                                                            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                                                                <span className="text-[9px] text-slate-400 truncate max-w-[150px]">{f.cuencas_clave}</span>
                                                                <span className={`font-bold ${isCrit ? "text-rose-400" : "text-emerald-400"}`}>
                                                                    {f.avance_ponderado}%
                                                                </span>
                                                            </div>
                                                            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                                                                <div
                                                                    className={`h-full rounded-full transition-all duration-500 ${
                                                                        isCrit ? "bg-rose-500" : "bg-emerald-500"
                                                                    }`}
                                                                    style={{ width: `${Math.min(100, f.avance_ponderado)}%` }}
                                                                ></div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        <div className="pt-1 flex justify-between items-center text-[10px] text-slate-400 border-t border-slate-850 font-mono">
                                            <span className="text-teal-400 font-bold">🌾 {(resumenAna.hectareas_cultivo_total || 0).toLocaleString()} Ha protegidas</span>
                                            <span className="text-slate-300">👥 {(resumenAna.poblacion_total_protegida || 0).toLocaleString()} hab.</span>
                                        </div>
                                    </div>
                                ) : (
                                    /* Análogos para AMARU-CHIRI / AMARU-FUEGO */
                                    <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 space-y-2.5">
                                        <span className="text-xs font-bold text-slate-400 uppercase flex items-center gap-1.5">
                                            {clockType === "AMARU-FUEGO" ? <Flame className="w-4 h-4 text-orange-400" /> : <History className="w-4 h-4 text-sky-400" />}
                                            {clockType === "AMARU-FUEGO" ? "Grandes Incendios Históricos" : "Análogos Históricos"}
                                        </span>
                                        <div className="space-y-2">
                                            {activeClock.analogos_historicos.map((an: any, idx: number) => (
                                                <div key={idx} className="bg-slate-900 p-2 rounded-xl border border-slate-850 text-xs space-y-0.5">
                                                    <div className="flex justify-between items-center font-bold text-slate-200">
                                                        <span>{an.evento}</span>
                                                        <span className={`text-[10px] font-mono px-1 rounded ${clockType === "AMARU-FUEGO" ? "text-orange-400 bg-orange-950" : "text-sky-400 bg-sky-950"}`}>
                                                            {an.tmin || an.anomalia_tsm || an.focos_pico}
                                                        </span>
                                                    </div>
                                                    <p className="text-[10px] text-slate-400 leading-tight">
                                                        {an.impacto}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                        </div>

                        {/* ========================================================================= */}
                        {/* [NUEVA BANDA HORIZONTAL] ANÁLOGOS HISTÓRICOS DE REFERENCIA DESPLEGADOS    */}
                        {/* ========================================================================= */}
                        {clockType === "AMARU-FEN" && (activeClock.analogos_historicos || []).length > 0 && (
                            <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
                                <div className="flex flex-wrap justify-between items-center gap-3 border-b border-slate-850 pb-3">
                                    <div className="flex items-center gap-2.5">
                                        <span className="p-2 rounded-xl bg-blue-950/80 text-blue-400 border border-blue-800/80">
                                            <History className="w-4 h-4" />
                                        </span>
                                        <div>
                                            <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                                                <span>Análogos Históricos de Referencia: Curva Hidrológica &amp; Lecciones Aprendidas</span>
                                                <span className="text-[10px] bg-blue-950 text-blue-300 font-mono px-2 py-0.5 rounded-full border border-blue-800">
                                                    CALIBRACIÓN DOCTRINARIA C2
                                                </span>
                                            </h3>
                                            <p className="text-xs text-slate-400">
                                                Eventos hidrometeorológicos extraordinarios que definieron la curva de severidad y respuesta operativa de la campaña 2026-2027
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-[11px] font-mono text-slate-400 flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                                        <span>Proyección 2026-2027: Fase Alerta ENFEN (84% probabilidad)</span>
                                    </div>
                                </div>

                                {/* Grid Horizontal de 4 Columnas */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                                    {activeClock.analogos_historicos.map((an: any, idx: number) => {
                                        const isExtra = an.categoria === "EXTRAORDINARIO" || an.evento.includes("1982") || an.evento.includes("1997");
                                        return (
                                            <div
                                                key={idx}
                                                className={`bg-slate-900/90 p-4 rounded-2xl border transition-all duration-200 hover:border-slate-600 hover:shadow-lg flex flex-col justify-between space-y-3 ${
                                                    isExtra ? "border-red-900/50 bg-gradient-to-b from-red-950/20 to-slate-900/90" : "border-slate-800"
                                                }`}
                                            >
                                                {/* Cabecera del Análogo */}
                                                <div className="space-y-1">
                                                    <div className="flex justify-between items-start gap-1">
                                                        <span className="font-extrabold text-white text-sm tracking-tight leading-snug">
                                                            {an.evento}
                                                        </span>
                                                        <span className={`text-[10px] font-mono font-black px-1.5 py-0.5 rounded ${
                                                            isExtra ? "bg-red-950 text-red-300 border border-red-800" : "bg-rose-950 text-rose-300 border border-rose-800"
                                                        }`}>
                                                            {an.anomalia_tsm || an.tmin}
                                                        </span>
                                                    </div>
                                                    <span className="text-[9.5px] font-mono uppercase tracking-wider text-slate-400 block">
                                                        {an.categoria || "EVENTO DE REFERENCIA"}
                                                    </span>
                                                </div>

                                                {/* Impacto Histórico */}
                                                <div className="space-y-1">
                                                    <span className="text-[9px] font-mono text-slate-500 uppercase font-bold block">
                                                        Impacto Registrado:
                                                    </span>
                                                    <p className="text-[11px] text-slate-300 leading-relaxed">
                                                        {an.impacto}
                                                    </p>
                                                </div>

                                                {/* Lección Doctrinaria */}
                                                <div className="pt-2 border-t border-slate-800/80 bg-slate-950/60 p-2.5 rounded-xl space-y-1 text-[10.5px]">
                                                    <span className="font-bold text-amber-300/90 flex items-center gap-1 text-[10px] uppercase font-mono">
                                                        <ShieldAlert className="w-3 h-3 text-amber-400 shrink-0" /> Lección para 2026-27:
                                                    </span>
                                                    <p className="text-slate-300 text-[10px] leading-snug">
                                                        {an.leccion || (
                                                            an.evento.includes("1982") ? "Diques de tierra sin enrocado sufren sifonamiento masivo por encima de 1,500 m³/s." :
                                                            an.evento.includes("1997") ? "Avenidas de Marzo destruyen obras si no están concluidas antes de Diciembre." :
                                                            an.evento.includes("2017") ? "Ventana de alerta de solo 72 horas para activación violenta de quebradas secas." :
                                                            "Lluvia moderada pero persistente en lechos colmatados causa anegamiento en menos de 48h."
                                                        )}
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* ========================================================================= */}
                        {/* CUADRO DE BARRAS TÁCTICO MULTIANUAL FEN: EVOLUCIÓN HISTÓRICA EN DÍAS     */}
                        {/* ========================================================================= */}
                        {clockType === "AMARU-FEN" && (fen.cronograma_multianual_fen || []).length > 0 && (
                            <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
                                <div className="flex flex-wrap justify-between items-center gap-3 border-b border-slate-850 pb-3">
                                    <div className="flex items-center gap-2.5">
                                        <span className="p-2 rounded-xl bg-red-950/80 text-red-400 border border-red-800/80">
                                            <Calendar className="w-4 h-4" />
                                        </span>
                                        <div>
                                            <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                                                <span>Cuadro de Barras Multianual FEN: Setiembre 2026 → Julio 2027</span>
                                                <span className="text-[10px] bg-red-950 text-red-300 font-mono px-2 py-0.5 rounded-full border border-red-800">
                                                    334 DÍAS DE CAMPAÑA C2
                                                </span>
                                            </h3>
                                            <p className="text-xs text-slate-400">
                                                Evolución de Intensidad en Días de Campaña (D+0 a D+334) calibrada con Marcadores Históricos (Mega-Niños 1982-83, 1997-98, 2017 y Ciclón Yaku 2023).
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {/* Selector de escala de eje X */}
                                        <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs font-mono">
                                            <button
                                                onClick={() => setTimelineScale("days")}
                                                className={`px-3 py-1 rounded-lg transition ${
                                                    timelineScale === "days"
                                                        ? "bg-red-600 text-white font-bold shadow-md shadow-red-950"
                                                        : "text-slate-400 hover:text-white"
                                                }`}
                                            >
                                                Eje X: Días (D+0..334)
                                            </button>
                                            <button
                                                onClick={() => setTimelineScale("months")}
                                                className={`px-3 py-1 rounded-lg transition ${
                                                    timelineScale === "months"
                                                        ? "bg-slate-800 text-white font-bold"
                                                        : "text-slate-400 hover:text-white"
                                                }`}
                                            >
                                                Meses Calendario
                                            </button>
                                        </div>
                                        <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950 px-2.5 py-1 rounded-lg border border-emerald-800">
                                            ● EXTENDIDO HASTA JULIO 2027
                                        </span>
                                    </div>
                                </div>

                                {/* Barra de Sincronización Cromática Dial ↔ Barras en Pantalla Completa */}
                                <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs font-mono">
                                    <span className="flex items-center gap-1.5 text-sky-300 font-bold">
                                        <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                                        <span>SINCRONIZACIÓN CROMÁTICA ACTIVA (11 ESTACIONES DIAL ↔ HISTOGRAMA):</span>
                                    </span>
                                    <div className="flex flex-wrap items-center gap-1.5">
                                        {fen.cronograma_multianual_fen.map((st: any) => {
                                            const isSelected = selectedStation?.id === st.id;
                                            const isHovered = hoveredStationId === st.id;
                                            return (
                                                <button
                                                    key={`legend-${st.id}`}
                                                    onClick={() => setSelectedStation(isSelected ? null : st)}
                                                    onMouseEnter={() => setHoveredStationId(st.id)}
                                                    onMouseLeave={() => setHoveredStationId(null)}
                                                    className={`px-2 py-0.5 rounded flex items-center gap-1.5 text-[10px] font-bold border transition ${
                                                        isSelected
                                                            ? "bg-white text-slate-950 ring-2 ring-white scale-105"
                                                            : isHovered
                                                            ? "bg-slate-800 text-white brightness-125"
                                                            : "bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-600"
                                                    }`}
                                                >
                                                    <span className="w-2 h-2 rounded-full shrink-0 shadow-sm" style={{ backgroundColor: st.color }} />
                                                    <span>{st.mes}</span>
                                                    <span className="opacity-75 font-normal text-[9px]">{st.anomalia_tsm}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* HISTOGRAMA DE INTENSIDAD MULTIANUAL C2 */}
                                <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-850 space-y-2">
                                    <div className="flex items-end gap-2 h-44 pt-4 pb-2 px-2">
                                        {/* Eje Y: Intensidad (%) y Etiquetas de Doctrina */}
                                        <div className="flex flex-col justify-between h-full text-[9px] font-mono text-slate-400 shrink-0 text-right pr-2 border-r border-slate-800 select-none">
                                            <div className="flex items-center gap-1 justify-end text-red-400 font-bold">
                                                <span className="text-[8px] bg-red-950 px-1 rounded border border-red-800 hidden sm:inline">CLÍMAX</span>
                                                <span>100%</span>
                                            </div>
                                            <div className="flex items-center gap-1 justify-end text-amber-400">
                                                <span className="text-[8px] bg-amber-950 px-1 rounded border border-amber-800 hidden sm:inline">MUY FUERTE</span>
                                                <span>75%</span>
                                            </div>
                                            <div className="flex items-center gap-1 justify-end text-yellow-400">
                                                <span className="text-[8px] bg-yellow-950 px-1 rounded border border-yellow-800 hidden sm:inline">CRÍTICO</span>
                                                <span>50%</span>
                                            </div>
                                            <div className="flex items-center gap-1 justify-end text-sky-400">
                                                <span className="text-[8px] bg-sky-950 px-1 rounded border border-sky-800 hidden sm:inline">ALERTA</span>
                                                <span>25%</span>
                                            </div>
                                            <span>0%</span>
                                        </div>

                                        {/* Contenedor de las 11 Columnas del Histograma */}
                                        <div className="grid grid-cols-11 gap-2 w-full h-full items-end">
                                            {fen.cronograma_multianual_fen.map((st: any) => {
                                                const isSelected = selectedStation?.id === st.id;
                                                const isHovered = hoveredStationId === st.id;
                                                const daysLabel = st.dia_rango_relativo || `D+${st.dia_inicio}..${st.dia_fin}`;

                                                return (
                                                    <div
                                                        key={st.id}
                                                        onClick={() => setSelectedStation(isSelected ? null : st)}
                                                        onMouseEnter={() => setHoveredStationId(st.id)}
                                                        onMouseLeave={() => setHoveredStationId(null)}
                                                        className={`h-full flex flex-col justify-end items-center group relative cursor-pointer p-1 rounded-xl transition-all select-none ${
                                                            isSelected
                                                                ? "bg-slate-800/95 ring-2 ring-white shadow-xl shadow-white/10 scale-102 z-10"
                                                                : isHovered
                                                                ? "bg-slate-850/90 ring-1 ring-slate-400"
                                                                : "hover:bg-slate-850/80"
                                                        }`}
                                                    >
                                                        {/* Badge Superior para Hitos Críticos */}
                                                        {st.es_hoy && (
                                                            <span className="text-[8px] bg-sky-400 text-slate-950 font-black px-1.5 py-0.5 rounded-sm mb-1 uppercase tracking-wider shadow">
                                                                HOY
                                                            </span>
                                                        )}
                                                        {st.tipo === "VENTANA_DORADA" && !st.es_hoy && (
                                                            <span className="text-[8px] bg-amber-400 text-slate-950 font-black px-1 rounded-sm mb-1 uppercase animate-pulse">
                                                                ★DEADLINE
                                                            </span>
                                                        )}
                                                        {st.tipo === "CLIMAX_HISTORICO" && (
                                                            <span className="text-[8px] bg-red-600 text-white font-black px-1.5 py-0.5 rounded-sm mb-1 uppercase animate-pulse shadow-lg shadow-red-950">
                                                                PICO
                                                            </span>
                                                        )}

                                                        {/* Columna / Barra de Intensidad */}
                                                        <div className="w-full bg-slate-950/90 rounded-t-lg overflow-hidden flex flex-col justify-end p-1 border border-slate-800 group-hover:border-slate-600 transition" style={{ height: "100%" }}>
                                                            <div
                                                                className="w-full rounded-sm transition-all shadow-inner group-hover:brightness-125 flex items-center justify-center"
                                                                style={{
                                                                    height: `${Math.max(16, st.severidad_pct)}%`,
                                                                    backgroundColor: st.color
                                                                }}
                                                            >
                                                                <span className="text-[8px] font-mono text-white/90 font-bold drop-shadow hidden lg:inline">
                                                                    {st.severidad_pct}%
                                                                </span>
                                                            </div>
                                                        </div>

                                                        {/* Rótulo Inferior del Eje X: Días o Meses */}
                                                        <div className="mt-1.5 text-center w-full">
                                                            <span className={`text-[9px] font-black font-mono block truncate ${
                                                                st.es_hoy ? "text-sky-300" : st.tipo === "VENTANA_DORADA" ? "text-amber-300" : "text-white"
                                                            }`}>
                                                                {timelineScale === "days" ? (st.id === "m1" ? "D+0..30" : st.id === "m7" ? "D+182..212" : st.id === "m11" ? "D+304..334" : `D+${st.dia_inicio}`) : st.mes}
                                                            </span>
                                                            <span className="text-[8px] font-mono text-slate-400 block truncate scale-95 -mt-0.5">
                                                                {st.anomalia_tsm}
                                                            </span>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Barra de Navegación y Lectura de Ejes */}
                                    <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 px-2 pt-2 border-t border-slate-850">
                                        <span className="flex items-center gap-1.5">
                                            <span className="w-2 h-2 rounded-full bg-red-500"></span>
                                            ▲ Eje Y: Intensidad del Evento (%) correlacionada con Anomalía TSM (°C)
                                        </span>
                                        <span className="text-slate-400">
                                            Eje X: {timelineScale === "days" ? "Línea Temporal de Campaña (D+0 a D+334 Días)" : "Meses Calendario (Setiembre 2026 a Julio 2027)"} ►
                                        </span>
                                    </div>
                                </div>

                                {/* Cartela Institucional: Advertencia de Modelo Referencial Histórico */}
                                <div className="bg-amber-950/30 border border-amber-800/50 rounded-xl p-3 text-xs text-amber-200/90 leading-relaxed flex items-start gap-2.5">
                                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                                    <div>
                                        <b className="text-amber-300 uppercase tracking-wide font-mono text-xs block mb-0.5">
                                            Aviso de Doctrina C2 (Marco Referencial Basado en Niño Histórico):
                                        </b>
                                        Este cuadro de barras e histograma de intensidad en días (<b>D+0 a D+334</b>) es un <b>MODELO REFERENCIAL PROYECTIVO</b> estructurado sobre el comportamiento sinóptico de los Mega-Niños históricos (<b>1982-83, 1997-98, Niño Costero 2017 y Ciclón Yaku 2023</b>). Las consecuencias e intensidades son referenciales y permiten anticipar las ventanas de respuesta operativa multisectorial, compras estratégicas y colapso de defensas antes de que el fenómeno alcance su madurez convectiva.
                                    </div>
                                </div>

                                {/* Panel Desplegable de Inteligencia Táctica de la Estación con Consecuencias Proyectadas */}
                                {selectedStation && (
                                    <div className="bg-slate-900 border border-slate-700 rounded-xl p-4 animate-fade-in space-y-2.5 shadow-2xl">
                                        <div className="flex flex-wrap justify-between items-center gap-3 border-b border-slate-800 pb-2">
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white shadow-lg shrink-0 font-mono text-xs"
                                                    style={{ backgroundColor: selectedStation.color }}
                                                >
                                                    {timelineScale === "days" ? `D+${selectedStation.dia_inicio}` : selectedStation.mes.split(" ")[0]}
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <h4 className="font-bold text-white text-sm">
                                                            {selectedStation.label} • {selectedStation.fase}
                                                        </h4>
                                                        <span className="text-xs font-mono px-2 py-0.5 rounded font-bold border" style={{ color: selectedStation.color, borderColor: selectedStation.color }}>
                                                            Intensidad {selectedStation.severidad_pct}% (ΔTSM {selectedStation.anomalia_tsm})
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-slate-300 mt-0.5">
                                                        <b>Período en Días:</b> {selectedStation.dia_rango_relativo || `D+${selectedStation.dia_inicio}..${selectedStation.dia_fin}`} ({selectedStation.duracion_dias || 30} días) | <b>Análogo Histórico:</b> {selectedStation.analogo}
                                                    </p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => setSelectedStation(null)}
                                                className="text-xs text-slate-400 hover:text-white bg-slate-800 px-3 py-1 rounded-lg transition font-mono"
                                            >
                                                Cerrar Ficha
                                            </button>
                                        </div>

                                        {/* Consecuencias Proyectadas en el Tiempo */}
                                        <div className="bg-slate-950 p-3 rounded-lg border border-slate-850 text-xs space-y-1">
                                            <span className="font-bold text-amber-400 font-mono uppercase tracking-wide block">
                                                CONSECUENCIAS PROYECTADAS EN EL TIEMPO (DOCTRINA HISTÓRICA FEN):
                                            </span>
                                            <p className="text-slate-200 leading-relaxed">
                                                {selectedStation.consecuencias_proyectadas || "Monitoreo permanente de cuencas bajas, estabilidad de diques y fajas marginales."}
                                            </p>
                                        </div>

                                        {/* Despliegue de Saberes y Doctrina Yachay (Modal Pantalla Completa) */}
                                        {yachayMode && (
                                            <div className="bg-slate-950 p-4 rounded-xl border border-emerald-500/30 text-xs space-y-3">
                                                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-850 pb-2">
                                                    <span className="font-bold text-emerald-400 flex items-center gap-1.5 text-xs">
                                                        <GraduationCap className="w-4 h-4" />
                                                        <span>AMARU-YACHAY: Doctrina de Mando &amp; Diálogo de Saberes</span>
                                                    </span>
                                                    <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-lg border border-slate-800">
                                                        <button
                                                            onClick={() => setSpeechLang("quechua")}
                                                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${speechLang === "quechua" ? "bg-sky-600 text-white shadow" : "text-slate-400 hover:text-white"}`}
                                                        >
                                                            Quechua
                                                        </button>
                                                        <button
                                                            onClick={() => setSpeechLang("aymara")}
                                                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${speechLang === "aymara" ? "bg-sky-600 text-white shadow" : "text-slate-400 hover:text-white"}`}
                                                        >
                                                            Aymara
                                                        </button>
                                                        <button
                                                            onClick={() => setSpeechLang("castellano")}
                                                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${speechLang === "castellano" ? "bg-sky-600 text-white shadow" : "text-slate-400 hover:text-white"}`}
                                                        >
                                                            Castellano
                                                        </button>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                    {/* Directiva Autoridades */}
                                                    {selectedStation.mensaje_autoridad && (
                                                        <div className="bg-amber-950/20 border border-amber-800/40 p-3 rounded-lg space-y-1">
                                                            <strong className="text-amber-300 block text-xs">🏛️ Directiva para Alcaldes y Autoridades:</strong>
                                                            <p className="text-slate-300 text-[11px] leading-relaxed">
                                                                {selectedStation.mensaje_autoridad}
                                                            </p>
                                                        </div>
                                                    )}

                                                    {/* Bioindicador */}
                                                    {selectedStation.bioindicador_ancestral && (
                                                        <div className="bg-teal-950/20 border border-teal-800/40 p-3 rounded-lg space-y-1">
                                                            <strong className="text-teal-300 block text-xs">🌿 Bioindicador Ancestral de la Naturaleza:</strong>
                                                            <p className="text-slate-300 text-[11px] leading-relaxed">
                                                                {selectedStation.bioindicador_ancestral}
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Mensaje en Lengua Originaria con Locución */}
                                                <div className="bg-slate-900 border border-slate-800 p-3 rounded-lg space-y-2">
                                                    <div className="flex justify-between items-center">
                                                        <strong className="text-sky-300 text-xs">
                                                            {speechLang === "quechua" ? "🌾 Willakuy (Runasimi para Comunidad):" : speechLang === "aymara" ? "🌾 Yatiyawi (Aymara para Comunidad):" : "🌾 Alerta Comunitaria en Castellano Llano:"}
                                                        </strong>
                                                        <button
                                                            onClick={() => {
                                                                const txt = speechLang === "quechua" ? selectedStation.mensaje_quechua : speechLang === "aymara" ? selectedStation.mensaje_aymara : selectedStation.mensaje_comunitario_castellano;
                                                                if (txt) speakText(txt, `st-modal-${selectedStation.id}-${speechLang}`);
                                                            }}
                                                            className="flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-lg bg-sky-600 hover:bg-sky-500 text-white transition shadow shadow-sky-600/30"
                                                        >
                                                            <Volume2 className="w-3.5 h-3.5" />
                                                            <span>{playingSpeech === `st-modal-${selectedStation.id}-${speechLang}` ? "Pausar Audio" : "Escuchar Audio"}</span>
                                                        </button>
                                                    </div>
                                                    <p className="font-mono text-xs text-amber-200 leading-relaxed italic bg-slate-950/80 p-2.5 rounded-lg border border-slate-850">
                                                        &ldquo;{speechLang === "quechua" ? (selectedStation.mensaje_quechua || "Allinta amachanakusun...") : speechLang === "aymara" ? (selectedStation.mensaje_aymara || "Mayacht'asisakiwa...") : selectedStation.mensaje_comunitario_castellano}&rdquo;
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Campo Explicatorio y Doctrina Operativa del Reloj AMARU-FEN (Modal C2) */}
                        <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 space-y-3">
                            <div className="flex items-center justify-between border-b border-slate-850 pb-2.5">
                                <div className="flex items-center gap-2">
                                    <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                                        <Info className="w-4 h-4" />
                                    </span>
                                    <h3 className="text-sm font-bold text-white">
                                        Manual y Doctrina Operativa del Reloj Polar Táctico {clockType === "AMARU-FEN" ? "AMARU-FEN" : "AMARU-CHIRI"}
                                    </h3>
                                </div>
                                <span className="text-[10px] text-teal-400 bg-teal-950/80 border border-teal-800 px-2.5 py-0.5 rounded-full font-mono font-bold">
                                    SISTEMA DE ALERTA ANTICIPATORIA
                                </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                                <div className="bg-slate-900/70 border border-slate-800/80 p-3.5 rounded-xl space-y-1.5">
                                    <div className="flex items-center gap-2 font-bold text-sky-400">
                                        <span className="w-2.5 h-2.5 rounded-full bg-sky-400 shrink-0"></span>
                                        <span>1. Minutero Azul (Día Actual Real):</span>
                                    </div>
                                    <p className="text-slate-400 text-[11px] leading-relaxed">
                                        Marca con precisión la posición del día civil de hoy en el dial anual de 360° (<b>{data?.fecha_actual_legible || "15 de Setiembre"}</b>, ángulo 254.5°). Representa el tiempo ordinario transcurrido del almanaque.
                                    </p>
                                </div>

                                <div className="bg-slate-900/70 border border-slate-800/80 p-3.5 rounded-xl space-y-1.5">
                                    <div className="flex items-center gap-2 font-bold text-red-400">
                                        <span className="w-2.5 h-2.5 rounded-full bg-red-500 shrink-0"></span>
                                        <span>2. Aguja Roja (Cinética de Amenaza):</span>
                                    </div>
                                    <p className="text-slate-400 text-[11px] leading-relaxed">
                                        Adelantada cinemáticamente a <b className="text-red-300">334.5° (Fines de Noviembre)</b>. La fiebre oceánica in-situ de <b className="text-white">+{fen.anomalia_tsm_c}°C</b> en Paita y las ondas Kelvin comprimen el tiempo, colocando el escenario hidroclimático en fase pre-catastrófica.
                                    </p>
                                </div>

                                <div className="bg-slate-900/70 border border-slate-800/80 p-3.5 rounded-xl space-y-1.5">
                                    <div className="flex items-center gap-2 font-bold text-amber-400">
                                        <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shrink-0"></span>
                                        <span>3. Ventana Dorada (Logística C2):</span>
                                    </div>
                                    <p className="text-slate-400 text-[11px] leading-relaxed">
                                        Plazo perentorio de <b>{activeClock.ventana_dorada.dias_restantes} días</b> para culminar defensas ribereñas, descolmatación y preposicionamiento de maquinaria antes de que la aguja entre al sector de avenidas torrenciales (Diciembre - Marzo).
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* ========================================================================= */}
                        {/* CARTERA DE OBRAS PP 0068 (DOCTRINA LOGÍSTICA & PROMEDIOS DE AVANCE)        */}
                        {/* ========================================================================= */}
                        {clockType === "AMARU-FEN" && carteraObras && (
                            <div className="bg-slate-950/90 border border-amber-900/40 rounded-2xl p-5 space-y-4 shadow-2xl">
                                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-850 pb-3">
                                    <div className="flex items-center gap-2.5">
                                        <span className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                                            <Landmark className="w-5 h-5" />
                                        </span>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h3 className="text-sm font-bold text-white">
                                                    Doctrina Logística C2: Estado de Obras de Prevención (PP 0068)
                                                </h3>
                                                <span className="text-[10px] text-amber-300 bg-amber-950/80 border border-amber-800 px-2 py-0.5 rounded-full font-mono font-bold">
                                                    643 OBRAS AUDITADAS
                                                </span>
                                            </div>
                                            <p className="text-slate-400 text-xs mt-0.5">
                                                Monitoreo de 6 macro-familias de ingeniería frente a la Ventana Dorada (Noviembre / Diciembre 2026) • Datos Abiertos MEF / SIAF
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <Link
                                            href="/fiscal"
                                            className="text-xs font-bold text-sky-400 hover:text-sky-300 bg-sky-950/60 border border-sky-800/80 px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 shadow"
                                        >
                                            <span>Agente FISCALIZADOR</span>
                                            <ExternalLink className="w-3.5 h-3.5" />
                                        </Link>
                                        <Link
                                            href="/contraloria"
                                            className="text-xs font-bold text-amber-400 hover:text-amber-300 bg-amber-950/60 border border-amber-800/80 px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 shadow"
                                        >
                                            <span>Bandeja CGR / OCI</span>
                                            <ExternalLink className="w-3.5 h-3.5" />
                                        </Link>
                                    </div>
                                </div>

                                {/* Resumen Consolidado Nacional (KPIs) */}
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                                    <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-xl">
                                        <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">Presupuesto PIM Total:</span>
                                        <span className="text-base font-black text-white font-mono mt-0.5 block">
                                            S/ {(carteraObras.pim_total_soles / 1e6).toFixed(1)} M
                                        </span>
                                        <span className="text-[10px] text-slate-500 font-mono">643 intervenciones</span>
                                    </div>

                                    <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-xl">
                                        <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">Devengado Ejecutado:</span>
                                        <span className="text-base font-black text-emerald-400 font-mono mt-0.5 block">
                                            S/ {(carteraObras.devengado_total_soles / 1e6).toFixed(1)} M
                                        </span>
                                        <span className="text-[10px] text-slate-500 font-mono">Gasto devengado SIAF</span>
                                    </div>

                                    <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-xl">
                                        <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">Avance Ponderado Global:</span>
                                        <span className="text-base font-black text-amber-400 font-mono mt-0.5 block">
                                            {carteraObras.avance_ponderado_pim_global}%
                                        </span>
                                        <span className="text-[10px] text-slate-400 font-mono">
                                            Prom. simple: <b>{carteraObras.promedio_simple_avance_global}%</b>
                                        </span>
                                    </div>

                                    <div className="bg-slate-900/80 border border-red-900/40 p-3 rounded-xl">
                                        <span className="text-[10px] text-red-300 uppercase tracking-wider block font-bold">Obras Críticas (&lt;20%):</span>
                                        <span className="text-base font-black text-red-400 font-mono mt-0.5 block">
                                            {carteraObras.obras_en_alarma_critica_total} proyectos
                                        </span>
                                        <span className="text-[10px] text-red-400/80 font-mono">
                                            Riesgo inminente de colapso
                                        </span>
                                    </div>
                                </div>

                                {/* Cartela de Alerta Doctrinal */}
                                <div className="bg-red-950/30 border border-red-800/60 rounded-xl p-3 text-xs text-red-200/95 leading-relaxed flex items-start gap-2.5">
                                    <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                                    <div>
                                        <b className="text-red-300 font-mono text-xs block mb-0.5 uppercase tracking-wide">
                                            Alerta Doctrinal de Descalce Hidrológico (Art. 67 Ley N.º 29664):
                                        </b>
                                        {carteraObras.alerta_doctrina_ventana_dorada}
                                    </div>
                                </div>

                                {/* Grid de los 6 Grupos Estratégicos */}
                                <div className="space-y-3 pt-1">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                                            Desglose por Familias de Ingeniería y Promedios de Avance:
                                        </span>
                                        <span className="text-[10.5px] text-slate-400 font-mono">
                                            Ordenado por volumen presupuestal PIM
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5">
                                        {(carteraObras.grupos_estrategicos || []).map((g: any) => {
                                            const isExpanded = expandedObrasGroup === g.id;
                                            const isLow = g.avance_ponderado_pim < 40.0;
                                            const isMed = g.avance_ponderado_pim >= 40.0 && g.avance_ponderado_pim < 60.0;
                                            const colorCls = isLow ? "text-red-400" : isMed ? "text-amber-400" : "text-emerald-400";
                                            const barGradient = isLow ? "bg-red-500" : isMed ? "bg-amber-500" : "bg-emerald-500";

                                            return (
                                                <div
                                                    key={g.id}
                                                    className="bg-slate-900/80 border border-slate-800 hover:border-slate-700 rounded-xl p-3.5 space-y-2.5 transition"
                                                >
                                                    {/* Header Grupo */}
                                                    <div className="flex items-start justify-between gap-2">
                                                        <div className="flex items-start gap-2">
                                                            <div className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 mt-0.5 shrink-0">
                                                                {g.id === "G1_DEFENSAS_RIBERENAS" ? <ShieldAlert className="w-4 h-4 text-red-400" /> :
                                                                 g.id === "G2_DRENAJE_PLUVIAL" ? <CloudRain className="w-4 h-4 text-amber-400" /> :
                                                                 g.id === "G3_CONTROL_QUEBRADAS" ? <Mountain className="w-4 h-4 text-sky-400" /> :
                                                                 g.id === "G4_INFRAESTRUCTURA_VIAL" ? <Milestone className="w-4 h-4 text-rose-400" /> :
                                                                 g.id === "G5_CAPACIDAD_OPERATIVA" ? <Truck className="w-4 h-4 text-emerald-400" /> :
                                                                 <Building2 className="w-4 h-4 text-teal-400" />}
                                                            </div>
                                                            <div>
                                                                <h4 className="text-xs font-bold text-white leading-tight">
                                                                    {g.nombre}
                                                                </h4>
                                                                <span className="text-[10px] text-slate-400 block mt-0.5">
                                                                    <b>{g.total_obras} proyectos</b> • PIM: <b>S/ {(g.pim_soles / 1e6).toFixed(1)}M</b> • Devengado: S/ {(g.devengado_soles / 1e6).toFixed(1)}M
                                                                </span>
                                                            </div>
                                                        </div>

                                                        <span className={`text-xs font-black font-mono px-2 py-0.5 rounded-lg border ${
                                                            isLow ? "bg-red-950/80 text-red-400 border-red-800" :
                                                            isMed ? "bg-amber-950/80 text-amber-400 border-amber-800" :
                                                            "bg-emerald-950/80 text-emerald-400 border-emerald-800"
                                                        }`}>
                                                            {g.avance_ponderado_pim}% Pond.
                                                        </span>
                                                    </div>

                                                    {/* Barras de Progreso Duales */}
                                                    <div className="space-y-1">
                                                        <div className="flex justify-between text-[10px]">
                                                            <span className="text-slate-300">Avance Financiero Ponderado:</span>
                                                            <span className={`font-bold font-mono ${colorCls}`}>{g.avance_ponderado_pim}%</span>
                                                        </div>
                                                        <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                                                            <div
                                                                className={`h-full ${barGradient} rounded-full transition-all duration-500`}
                                                                style={{ width: `${Math.min(100, g.avance_ponderado_pim)}%` }}
                                                            />
                                                        </div>
                                                        <div className="flex justify-between text-[10px] text-slate-400 pt-0.5">
                                                            <span>Promedio Simple de Avance Físico:</span>
                                                            <span className="font-mono text-slate-200 font-semibold">{g.promedio_simple_avance}%</span>
                                                        </div>
                                                    </div>

                                                    {/* Alarma de Obras Críticas */}
                                                    <div className="flex flex-wrap items-center justify-between text-[10px] pt-1 border-t border-slate-800/80">
                                                        <span className={`${g.obras_criticas_menor_20 > 0 ? "text-red-400 font-bold" : "text-slate-400"}`}>
                                                            🚨 <b>{g.obras_criticas_menor_20}</b> obras en riesgo crítico (&lt;20%)
                                                        </span>
                                                        <span className="text-emerald-400">
                                                            ✓ <b>{g.obras_avanzadas_mayor_70}</b> obras avanzadas (&ge;70%)
                                                        </span>
                                                    </div>

                                                    {/* Diagnóstico Doctrinal */}
                                                    <p className="text-[10px] text-slate-400 leading-relaxed bg-slate-950/60 p-2 rounded-lg border border-slate-850">
                                                        {g.diagnostico_doctrina}
                                                    </p>

                                                    {/* Toggle Proyectos Emblemáticos */}
                                                    <div>
                                                        <button
                                                            onClick={() => setExpandedObrasGroup(isExpanded ? null : g.id)}
                                                            className="text-[10px] text-sky-400 hover:text-sky-300 font-bold flex items-center gap-1 transition"
                                                        >
                                                            <span>{isExpanded ? "Ocultar proyectos emblemáticos" : `Ver proyectos principales (${g.ejemplos_principales?.length || 3})`}</span>
                                                            {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                                                        </button>

                                                        {isExpanded && g.ejemplos_principales && (
                                                            <div className="mt-2 space-y-1.5 animate-fade-in">
                                                                {g.ejemplos_principales.map((ej: any) => (
                                                                    <div
                                                                        key={ej.cui}
                                                                        className="bg-slate-950/90 border border-slate-800/80 p-2 rounded-lg text-[10px] flex items-center justify-between gap-2"
                                                                    >
                                                                        <div className="min-w-0">
                                                                            <div className="flex items-center gap-1.5">
                                                                                <span className="font-mono font-bold text-amber-400">CUI {ej.cui}:</span>
                                                                                <span className="text-slate-300 truncate max-w-[220px]" title={ej.nombre}>
                                                                                    {ej.nombre}
                                                                                </span>
                                                                            </div>
                                                                            <span className="text-[9px] text-slate-500 font-mono">
                                                                                Región: {ej.departamento} • PIM: S/ {ej.pim_soles.toLocaleString()}
                                                                            </span>
                                                                        </div>
                                                                        <div className="text-right shrink-0">
                                                                            <span className={`font-mono font-bold text-[10.5px] ${
                                                                                ej.porcentaje_ejecucion < 20 ? "text-red-400" :
                                                                                ej.porcentaje_ejecucion < 60 ? "text-amber-400" :
                                                                                "text-emerald-400"
                                                                            }`}>
                                                                                {ej.porcentaje_ejecucion}%
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Footer del Modal */}
                        <div className="pt-3 border-t border-slate-800 flex justify-between items-center text-xs text-slate-400">
                            <span>
                                🏛️ <b>COED Nacional Digital:</b> Visualización Polar C2 • Resoluciones INDECI y Mandatos Sectoriales MIDAGRI / MTC / MINSA.
                            </span>
                            <button
                                onClick={() => setIsFullscreen(false)}
                                className="bg-slate-800 hover:bg-slate-700 text-white font-bold px-4 py-2 rounded-xl transition"
                            >
                                Cerrar Visor Táctico
                            </button>
                        </div>

                    </div>
                </div>
            )}
        </>
    );
}
