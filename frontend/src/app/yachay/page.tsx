"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
    GraduationCap,
    BookOpen,
    ShieldAlert,
    Clock,
    AlertTriangle,
    CheckCircle2,
    Volume2,
    Play,
    Pause,
    Languages,
    Sparkles,
    Scale,
    Building2,
    Calendar,
    Compass,
    Waves,
    HelpCircle,
    ChevronRight,
    Download,
    Share2,
    FileText,
    ArrowRight
} from "lucide-react";

export default function YachayPage() {
    const [activeTab, setActiveTab] = useState<"autoridades" | "comunidades" | "simulador">("autoridades");
    const [selectedLanguage, setSelectedLanguage] = useState<"QUECHUA_CHANKA" | "QUECHUA_COLLAO" | "AYMARA" | "CAST_LLANO">("QUECHUA_CHANKA");
    const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
    const [simScenario, setSimScenario] = useState<"temprana" | "tardia">("temprana");
    const [selectedBio, setSelectedBio] = useState<number>(0);

    // Reproducción de voz sintética Web Speech API
    const speakText = (text: string, langCode: string = "es-PE") => {
        if (!("speechSynthesis" in window)) {
            alert("Tu navegador no soporta síntesis de voz interactiva.");
            return;
        }
        window.speechSynthesis.cancel();
        if (isPlayingAudio) {
            setIsPlayingAudio(false);
            return;
        }

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = langCode;
        utterance.rate = 0.92;
        utterance.onstart = () => setIsPlayingAudio(true);
        utterance.onend = () => setIsPlayingAudio(false);
        utterance.onerror = () => setIsPlayingAudio(false);
        window.speechSynthesis.speak(utterance);
    };

    const bioindicadores = [
        {
            nombre: "Aves Marinas Guaneras (Piqueros, Guanayes y Pelícanos)",
            region: "Litoral Norte y Central (Tumbes a Ica)",
            observacion_ancestral: "Cuando los piqueros y pelícanos vuelan erráticos hacia la orilla o se adentran en tierra firme, los antiguos pescadores saben que el mar se ha calentado profundamente, forzando a la anchoveta a hundirse hacia aguas frías inalcanzables.",
            correlacion_cientifica: "Anomalía positiva de TSM Niño 1+2 (> +1.5°C) e intrusión profunda de ondas Kelvin cálidas que abaten la termoclina.",
            leccion_comunal: "No adentrarse en faenas de pesca artesanal profunda; reforzar resguardo de embarcaciones y preparar redes para especies oportunistas de aguas cálidas (perico, barrilete).",
            icono: "🌊"
        },
        {
            nombre: "Floración del Algarrobo (Prosopis pallida) y Zapote",
            region: "Bosque Seco del Norte (Piura, Lambayeque, Tumbes)",
            observacion_ancestral: "Una floración excesiva y temprana en los meses de Septiembre y Octubre anuncia 'año de agua' o Niño de gran intensidad.",
            correlacion_cientifica: "Aumento de la humedad relativa nocturna y transpiración vegetal acelerada por advección de masas de aire cálido ecuatorial.",
            leccion_comunal: "Despejar cauces secos de algarrobos caídos y no sembrar cultivos perennes en el fondo de las quebradas que se inundarán.",
            icono: "🌳"
        },
        {
            nombre: "Constelación de Qullqa / Las Pléyades",
            region: "Sierra Central y Sur (Cusco, Puno, Ayacucho, Huancavelica)",
            observacion_ancestral: "Durante el solsticio de Junio, si las estrellas de las Pléyades (Qullqa) se observan nítidas y brillantes, habrá lluvias oportunas. Si se ven pequeñas o borrosas, las lluvias tardarán y habrá sequía o helada.",
            correlacion_cientifica: "Presencia de cirros tenues a gran altitud atmosférica impulsados por vientos de la alta troposfera relacionados con la fase ENSO.",
            leccion_comunal: "Ajustar el calendario de siembra de papa en aynokas comunales altas y sembrar variedades amargas resistentes a heladas.",
            icono: "✨"
        },
        {
            nombre: "Anidación de la Huallata y Aves de Humedal",
            region: "Altiplano y Punas Altoandinas (Puno, Arequipa, Moquegua)",
            observacion_ancestral: "Si las huallatas construyen sus nidos en la parte alta de los totorales o peñascos secos, predicen crecidas e inundaciones. Si anidan en las orillas bajas, anuncian año seco.",
            correlacion_cientifica: "Sensibilidad barométrica de aves acuáticas a gradientes de presión regional previas a fases convectivas intensas de la ZCIT.",
            leccion_comunal: "Trasladar cobertizos y canchas de pastoreo hacia terrazas intermedias; almacenar pacas de heno en Tambos secos.",
            icono: "🪶"
        },
        {
            nombre: "Viento Paraca y Dirección de Corrientes",
            region: "Costa Central y Sur (Ica, Lima, Arequipa)",
            observacion_ancestral: "El cese prolongado del viento del sur y la aparición de brisas tibias desde el norte indican el debilitamiento de los vientos protectores.",
            correlacion_cientifica: "Debilitamiento del Anticiclón del Pacífico Sur (APS), permitiendo el avance libre de aguas cálidas hacia el litoral central.",
            leccion_comunal: "Reforzar defensas en bocatomas rústicas de canales de regadío y activar comités de regantes.",
            icono: "💨"
        }
    ];

    const cuñasRadiales = {
        QUECHUA_CHANKA: {
            idioma: "Runasimi (Quechua Chanka)",
            region: "Ayacucho, Apurímac, Huancavelica",
            titulo: "AMARU-YACHAY: Sinchi Parakunamanta Amachakuy",
            texto: "¡Ayllumasikuna, allinllachu kachkankichik! Mama quchapa yakun q'uñirikushanmi, chaymi chala suyupi sinchi parakunata apamunqa. Amam mayu kantukunapi wasichakuychikchu. Ayllu faenawan zanjakunata, mayu patakunata pichasunchik. Allpa hunt'aykunamanta hanay allpakunaman lluqsinapaq kamarikuychik. ¡Kawsayninchikta kuskalla amachasun!",
            traduccion_guia: "¡Hermanos de la comunidad! El agua del mar se está calentando y traerá lluvias intensas. No construyamos casas cerca a las orillas de los ríos. Limpiemos zanjas y defensas en faena comunal. Preparemos la salida a terrenos altos ante cualquier desborde. ¡Cuidemos juntos nuestras vidas!"
        },
        QUECHUA_COLLAO: {
            idioma: "Runasimi (Quechua Collao)",
            region: "Cusco, Puno, Arequipa alta",
            titulo: "AMARU-YACHAY: Mayu Llimp'iymanta Ayllukunapaq Willay",
            texto: "¡Qhapaq qheswa ayllukuna! Hatun mayukunan sinchita llimp'imunqa. Chayraykun chakrakunata mayu kantumanta karunchana. Uywakunatapas, ch'uñutapas hanan qullqakunapi waqaychaychik. Manaña maquinakuna llamk'ayta atinqachu paramuy qallariptin. ¡Aylluntin mayu pichayta tukuchisunchik!",
            traduccion_guia: "¡Pueblos del valle sagrado y las alturas! Los ríos grandes crecerán con fuerza. Por ello debemos alejar los sembríos de las orillas del río. Guardemos los animales y cosechas en depósitos altos. La maquinaria no podrá trabajar una vez que empiecen las lluvias. ¡Terminemos la limpieza en comunidad!"
        },
        AYMARA: {
            idioma: "Aymara Altiplánico",
            region: "Puno (Collao, Chucuito, Huancané, Yunguyo)",
            titulo: "AMARU-YACHAY: Jach'a Thayampi Umampi Q'umachasiñataki",
            texto: "¡Jilatanaka kullakanaka! Quta umasti q'uñt'asxiwa. Jach'a jallunaka purini. Jawirankasisa maquinanaka qhiparu apsupxam. Jatha achunaksa alay ch'uxña pampanakar apapxam. Uywanakarus q'uñi utanakaru imantapxam. ¡Mayacht'asisakiwa akapachanxa askichañani!",
            traduccion_guia: "¡Hermanos y hermanas! El agua del mar se está calentando. Vendrán lluvias grandes. Retiren las máquinas de los cauces de los ríos antes de que el agua gane fuerza. Trasladen semillas a zonas altas y resguarden el ganado en cobertizos térmicos. ¡Solo unidos saldremos adelante!"
        },
        CAST_LLANO: {
            idioma: "Castellano Llano Comunitario",
            region: "Costa Norte, Cuencas Bajas y Valles Interandinos",
            titulo: "AMARU-YACHAY: La Regla de Oro antes de la Lluvia",
            texto: "¡Vecino y comunero! La ciencia y nuestros abuelos coinciden: cuando el mar del norte se calienta, el río siempre reclama su cauce. Noviembre es el último mes para descolmatar acequias y reparar techos. En enero y febrero la maquinaria ya no puede entrar al fango. Organicemos las faenas ahora para que nuestras familias y cosechas estén a salvo.",
            traduccion_guia: "Mensaje pedagógico en castellano claro, sin tecnicismos hidrológicos para asambleas comunales y perifoneo distrital."
        }
    };

    return (
        <div className="space-y-6 max-w-7xl mx-auto pb-12">
            {/* Cabecera Heroica de Marca */}
            <div className="bg-gradient-to-r from-slate-900 via-emerald-950/50 to-slate-900 border border-emerald-500/30 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
                <div className="absolute -right-8 -bottom-8 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 relative z-10">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1.5">
                                <GraduationCap className="w-3.5 h-3.5" />
                                ACADEMIA DOCTRINARIA &amp; SABERES TERRITORIALES
                            </span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-blue-950 text-blue-300 border border-blue-800">
                                LEY SINAGERD N° 29664
                            </span>
                        </div>
                        <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight flex items-center gap-3">
                            <span>AMARU-YACHAY</span>
                            <span className="text-slate-400 font-light text-xl">|</span>
                            <span className="text-emerald-400 font-semibold text-lg md:text-xl">
                                Educación Climática &amp; Diálogo de Saberes
                            </span>
                        </h1>
                        <p className="text-xs md:text-sm text-slate-300 max-w-3xl leading-relaxed">
                            Plataforma de traducción cognitiva y gobernanza preventiva: Formación táctica para Alcaldes y Autoridades Locales sobre la <strong>Ventana Dorada</strong> y el <strong>PP 068</strong>, unida al rescate de <strong>Bioindicadores Ancestrales</strong> en lenguas originarias para comunidades campesinas e indígenas.
                        </p>
                    </div>

                    {/* Botonera de Enlaces Rápidos */}
                    <div className="flex items-center gap-2">
                        <Link
                            href="/"
                            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition flex items-center gap-1.5 shadow"
                        >
                            <Clock className="w-4 h-4 text-amber-400" />
                            <span>Ver Reloj Táctico</span>
                        </Link>
                        <Link
                            href="/doctrina"
                            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-purple-900/60 hover:bg-purple-800 text-purple-200 border border-purple-700/50 transition flex items-center gap-1.5 shadow"
                        >
                            <Scale className="w-4 h-4 text-purple-400" />
                            <span>Fórmulas C2</span>
                        </Link>
                    </div>
                </div>

                {/* Conmutador de Pestañas Principales */}
                <div className="flex gap-2 mt-6 border-b border-slate-800 pt-2">
                    <button
                        onClick={() => setActiveTab("autoridades")}
                        className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-t-xl transition border-t border-x ${
                            activeTab === "autoridades"
                                ? "bg-slate-900 text-amber-400 border-amber-500/40 border-b-2 border-b-amber-400"
                                : "text-slate-400 hover:text-slate-200 border-transparent hover:bg-slate-800/50"
                        }`}
                    >
                        <Building2 className="w-4 h-4" />
                        <span>Mando para Autoridades (Alcaldes / COER / COEL)</span>
                    </button>
                    <button
                        onClick={() => setActiveTab("comunidades")}
                        className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-t-xl transition border-t border-x ${
                            activeTab === "comunidades"
                                ? "bg-slate-900 text-emerald-400 border-emerald-500/40 border-b-2 border-b-emerald-400"
                                : "text-slate-400 hover:text-slate-200 border-transparent hover:bg-slate-800/50"
                        }`}
                    >
                        <BookOpen className="w-4 h-4" />
                        <span>Comunidades Campesinas &amp; Bioindicadores</span>
                    </button>
                    <button
                        onClick={() => setActiveTab("simulador")}
                        className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-t-xl transition border-t border-x ${
                            activeTab === "simulador"
                                ? "bg-slate-900 text-sky-400 border-sky-500/40 border-b-2 border-b-sky-400"
                                : "text-slate-400 hover:text-slate-200 border-transparent hover:bg-slate-800/50"
                        }`}
                    >
                        <Sparkles className="w-4 h-4" />
                        <span>Simulador Táctico: Ventana Dorada vs Desastre</span>
                    </button>
                </div>
            </div>

            {/* ========================================================================= */}
            {/* PESTAÑA 1: DOCTRINA PARA AUTORIDADES REGIONALES Y LOCALES                 */}
            {/* ========================================================================= */}
            {activeTab === "autoridades" && (
                <div className="space-y-6">
                    {/* Alerta de Doctrina de la Ventana Dorada */}
                    <div className="bg-slate-900/90 border border-amber-500/40 rounded-2xl p-5 shadow-xl grid grid-cols-1 lg:grid-cols-12 gap-6">
                        <div className="lg:col-span-8 space-y-3">
                            <div className="flex items-center gap-2">
                                <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1">
                                    <Clock className="w-3.5 h-3.5" />
                                    DEADLINE FÍSICO IMPRORROGABLE: 30 DE NOVIEMBRE
                                </span>
                                <span className="text-xs text-slate-400">Doctrina de Ingeniería Hidráulica C2</span>
                            </div>
                            <h2 className="text-xl font-bold text-white">
                                ¿Por qué fracasan las autoridades que esperan a Enero o Febrero?
                            </h2>
                            <p className="text-xs text-slate-300 leading-relaxed">
                                El error más costoso en la historia de los desastres en el Perú es la <strong>ilusión de la emergencia tardía</strong>. Cuando las precipitaciones ya comenzaron en enero o febrero, el caudal del río supera los 300 m³/s y el nivel freático satura las fajas marginales. Las excavadoras de 30 toneladas se hunden en el lodo, los volquetes no pueden ingresar y los costos de alquiler de maquinaria se multiplican por 4 debido a la escasez.
                            </p>
                            <div className="p-3 bg-amber-950/40 border border-amber-800/60 rounded-xl flex items-start gap-3">
                                <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                                <div className="text-xs text-amber-200/90">
                                    <strong>Principio Operativo:</strong> Entre <em>Septiembre y Noviembre</em> la maquinaria pesada opera en lecho seco con 100% de rendimiento. En <em>Diciembre</em> el margen se reduce al 40%. A partir de <em>Enero</em>, la ingeniería pesada en cauce es inviable y solo queda la evacuación reactiva.
                                </div>
                            </div>
                        </div>

                        <div className="lg:col-span-4 bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-3 flex flex-col justify-between">
                            <div>
                                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                                    Cronología Obligatoria de Mando
                                </span>
                                <div className="space-y-2 text-xs">
                                    <div className="flex items-center justify-between p-2 rounded bg-slate-900 border border-slate-800">
                                        <span className="text-slate-300">SETIEMBRE</span>
                                        <span className="font-bold text-sky-400">Expedientes Técnicos</span>
                                    </div>
                                    <div className="flex items-center justify-between p-2 rounded bg-slate-900 border border-slate-800">
                                        <span className="text-slate-300">OCTUBRE</span>
                                        <span className="font-bold text-amber-400">Ingreso de Maquinaria</span>
                                    </div>
                                    <div className="flex items-center justify-between p-2 rounded bg-amber-950/50 border border-amber-500/40">
                                        <span className="text-amber-200 font-bold">30 NOVIEMBRE ★</span>
                                        <span className="font-bold text-amber-400">Retiro y Enrocado Final</span>
                                    </div>
                                    <div className="flex items-center justify-between p-2 rounded bg-slate-900 border border-slate-800">
                                        <span className="text-slate-300">DICIEMBRE</span>
                                        <span className="font-bold text-red-400">Guardias COEL 24/7</span>
                                    </div>
                                </div>
                            </div>
                            <div className="text-[11px] text-slate-400 italic text-center">
                                Directiva INDECI / CENEPRED 2026
                            </div>
                        </div>
                    </div>

                    {/* Guía Presupuestal PP 068 y Responsabilidad Legal */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
                            <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-xs">
                                    S/.
                                </div>
                                <h3 className="text-sm font-bold text-white">
                                    Programa Presupuestal 068 (PP 068 / FONDES)
                                </h3>
                            </div>
                            <p className="text-xs text-slate-300 leading-relaxed">
                                El Alcalde y sus funcionarios <strong>no necesitan esperar una declaratoria de Estado de Emergencia</strong> para actuar. La normativa del MEF faculta realizar modificaciones presupuestarias de tipo 003 (en el nivel institucional) transfiriendo recursos de proyectos no prioritarios hacia la actividad:
                            </p>
                            <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 font-mono text-[11px] text-blue-300">
                                Actividad 5006144: Atención de Actividades de Emergencia y Mitigación Preventiva
                            </div>
                            <ul className="text-xs text-slate-300 space-y-1.5 list-disc pl-4">
                                <li>Compra de combustible para maquinaria propia o comunal.</li>
                                <li>Alquiler de excavadoras sobre orugas para descolmatación.</li>
                                <li>Adquisición de sacos terreros, calaminas y geomallas.</li>
                            </ul>
                        </div>

                        <div className="bg-slate-900 border border-red-500/30 rounded-2xl p-5 space-y-3">
                            <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-lg bg-red-500/20 text-red-400 flex items-center justify-center font-bold text-xs">
                                    ⚖️
                                </div>
                                <h3 className="text-sm font-bold text-white">
                                    Responsabilidad Penal y Civil (Ley N° 29664)
                                </h3>
                            </div>
                            <p className="text-xs text-slate-300 leading-relaxed">
                                El <strong>Artículo 89 del Reglamento de la Ley SINAGERD</strong> tipifica como <em>falta grave pasible de denuncia penal ante el Ministerio Público</em> la omisión de acciones preventivas cuando existan reportes oficiales de alerta temprana emitidos por el SENAMHI o el ENFEN.
                            </p>
                            <div className="p-2.5 bg-red-950/40 rounded-lg border border-red-800/60 text-[11px] text-red-200">
                                <strong>Código Penal Art. 377:</strong> Omisión, rehusamiento o demora de actos funcionales ante situaciones de grave riesgo para la vida de la población.
                            </div>
                            <p className="text-xs text-slate-400">
                                Las autoridades que no ejecutaron los fondos del PP 068 a pesar de contar con el informe de peligro inminente no pueden alegar desconocimiento técnico.
                            </p>
                        </div>
                    </div>

                    {/* Checklist Operativo de 10 Acciones del Alcalde */}
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
                        <div className="flex justify-between items-center">
                            <div>
                                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                    Checklist Operativo: 10 Acciones de Mando Municipal Pre-Desastre
                                </h3>
                                <p className="text-xs text-slate-400">
                                    Hoja de ruta obligatoria para Gerencias de Obras y Defensa Civil Distrital
                                </p>
                            </div>
                            <button
                                onClick={() => window.print()}
                                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 transition"
                            >
                                <Download className="w-3.5 h-3.5" />
                                <span>Imprimir Cartilla C2</span>
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                            {[
                                { n: "01", t: "Descolmatación de Puntos Críticos", d: "Retirar material aluvial y sedimentos en cauces identificados por la ANA." },
                                { n: "02", t: "Enrocado Rip-Rap al Volteo", d: "Instalar roca pesada (> 1 metro) en curvas de socavación activa que amenacen puentes." },
                                { n: "03", t: "Despeje de Alcantarillas y Badenes", d: "Limpiar sumideros pluviales urbanos de basura, plásticos y desmonte." },
                                { n: "04", t: "Padrón de Población en Fajas Marginales", d: "Censar familias en áreas de riesgo no mitigable para reubicación temporal." },
                                { n: "05", t: "Rutas de Evacuación Señalizadas", d: "Pintar y despejar caminos hacia losas deportivas y terrazas altas no inundables." },
                                { n: "06", t: "Prueba Operativa de Motobombas", d: "Encender y probar bombas de achique de 4 y 6 pulgadas con mangueras de descarga." },
                                { n: "07", t: "Stock de 10,000 Sacos Terreros", d: "Almacenar bolsas de polipropileno y arena para proteger viviendas y colegios." },
                                { n: "08", t: "Almacén Adelantado de Asistencia Humanitaria", d: "Guardar agua embotellada, bobinas de plástico, frazadas y herramientas." },
                                { n: "09", t: "Conexión Activa al Sistema SINPAD", d: "Asegurar usuario y clave vigentes del responsable de Defensa Civil con el INDECI." },
                                { n: "10", t: "Red de Telecomunicaciones VHF/HF de Respaldo", d: "Verificar baterías de radios ante caída inminente de antenas celulares de telefonía." }
                            ].map((item, idx) => (
                                <div key={idx} className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-start gap-3 hover:border-slate-700 transition">
                                    <span className="font-mono font-bold text-amber-400 text-sm">{item.n}</span>
                                    <div>
                                        <div className="font-bold text-slate-200">{item.t}</div>
                                        <div className="text-slate-400 text-[11px] mt-0.5">{item.d}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* ========================================================================= */}
            {/* PESTAÑA 2: COMUNIDADES CAMPESINAS & DIÁLOGO DE SABERES                   */}
            {/* ========================================================================= */}
            {activeTab === "comunidades" && (
                <div className="space-y-6">
                    {/* Introducción al Diálogo Intercientífico */}
                    <div className="bg-slate-900 border border-emerald-500/30 rounded-2xl p-5 space-y-3">
                        <div className="flex items-center gap-2">
                            <span className="text-xl">🤝</span>
                            <h2 className="text-lg font-bold text-white">
                                Diálogo de Saberes: Cuando la Ciencia Satelital Escucha a los Abuelos
                            </h2>
                        </div>
                        <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
                            Las comunidades campesinas y los pueblos originarios del Perú han convivido con los ciclos del Niño y la Niña por más de tres mil años. En lugar de imponer terminología incomprensible (como <em>anomalía SST Niño 1+2</em> o <em>geopotencial a 500 hPa</em>), <strong>AMARU-CLIMATE</strong> une la observación milenaria de los <strong>bioindicadores de la Pachamama</strong> con las lecturas en tiempo real de boyas oceánicas y satélites meteorológicos.
                        </p>
                    </div>

                    {/* Catálogo de Bioindicadores Ancestrales */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        {/* Selector de Bioindicadores */}
                        <div className="lg:col-span-4 space-y-2">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                                Bioindicadores Tradicionales
                            </span>
                            {bioindicadores.map((bio, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setSelectedBio(idx)}
                                    className={`w-full text-left p-3 rounded-xl border transition flex items-center justify-between text-xs ${
                                        selectedBio === idx
                                            ? "bg-emerald-950/60 border-emerald-500 text-emerald-200 font-bold shadow-lg"
                                            : "bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800"
                                    }`}
                                >
                                    <div className="flex items-center gap-2.5">
                                        <span className="text-lg">{bio.icono}</span>
                                        <span className="line-clamp-1">{bio.nombre}</span>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-slate-500 shrink-0" />
                                </button>
                            ))}
                        </div>

                        {/* Detalle del Bioindicador Seleccionado */}
                        <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
                            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-2xl">{bioindicadores[selectedBio].icono}</span>
                                        <h3 className="text-base font-bold text-white">
                                            {bioindicadores[selectedBio].nombre}
                                        </h3>
                                    </div>
                                    <span className="text-xs text-emerald-400 font-medium">
                                        Región: {bioindicadores[selectedBio].region}
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                                    <span className="text-[11px] font-bold text-amber-400 block mb-1">
                                        🌿 Observación Ancestral Comunitaria:
                                    </span>
                                    <p className="text-xs text-slate-300 leading-relaxed">
                                        {bioindicadores[selectedBio].observacion_ancestral}
                                    </p>
                                </div>

                                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                                    <span className="text-[11px] font-bold text-sky-400 block mb-1">
                                        🛰️ Correlación Científica Satelital (ENFEN / NOAA):
                                    </span>
                                    <p className="text-xs text-slate-300 leading-relaxed">
                                        {bioindicadores[selectedBio].correlacion_cientifica}
                                    </p>
                                </div>

                                <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-800/50">
                                    <span className="text-[11px] font-bold text-emerald-300 block mb-1">
                                        🛡️ Lección Táctica para la Comunidad:
                                    </span>
                                    <p className="text-xs text-emerald-200/90 leading-relaxed">
                                        {bioindicadores[selectedBio].leccion_comunal}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Generador y Reproductor de Cuñas Radiales en Lenguas Originarias */}
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                            <div>
                                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                                    <Volume2 className="w-4 h-4 text-sky-400" />
                                    Cuñas Radiales y Mensajes para Asambleas Comunales
                                </h3>
                                <p className="text-xs text-slate-400">
                                    Locución adaptada para emisoras comunitarias y WhatsApp rural
                                </p>
                            </div>

                            {/* Selector de Lenguas */}
                            <div className="flex flex-wrap gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
                                {(["QUECHUA_CHANKA", "QUECHUA_COLLAO", "AYMARA", "CAST_LLANO"] as const).map((lang) => (
                                    <button
                                        key={lang}
                                        onClick={() => {
                                            setSelectedLanguage(lang);
                                            window.speechSynthesis.cancel();
                                            setIsPlayingAudio(false);
                                        }}
                                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                                            selectedLanguage === lang
                                                ? "bg-sky-600 text-white shadow font-bold"
                                                : "text-slate-400 hover:text-slate-200"
                                        }`}
                                    >
                                        {lang === "QUECHUA_CHANKA" && "Quechua Chanka"}
                                        {lang === "QUECHUA_COLLAO" && "Quechua Collao"}
                                        {lang === "AYMARA" && "Aymara"}
                                        {lang === "CAST_LLANO" && "Castellano Llano"}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Tarjeta de Audio y Mensaje */}
                        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                            <div className="flex justify-between items-center">
                                <div>
                                    <div className="text-xs font-bold text-white">
                                        {cuñasRadiales[selectedLanguage].titulo}
                                    </div>
                                    <div className="text-[11px] text-slate-400">
                                        {cuñasRadiales[selectedLanguage].idioma} • {cuñasRadiales[selectedLanguage].region}
                                    </div>
                                </div>
                                <button
                                    onClick={() => speakText(cuñasRadiales[selectedLanguage].texto, "es-PE")}
                                    className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition ${
                                        isPlayingAudio
                                            ? "bg-red-600 text-white animate-pulse"
                                            : "bg-sky-600 hover:bg-sky-500 text-white shadow-lg shadow-sky-600/30"
                                    }`}
                                >
                                    {isPlayingAudio ? (
                                        <>
                                            <Pause className="w-3.5 h-3.5" />
                                            <span>Detener Audio</span>
                                        </>
                                    ) : (
                                        <>
                                            <Play className="w-3.5 h-3.5" />
                                            <span>Escuchar Cuña Radial</span>
                                        </>
                                    )}
                                </button>
                            </div>

                            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800/80 font-mono text-xs text-amber-200 leading-relaxed italic">
                                &ldquo;{cuñasRadiales[selectedLanguage].texto}&rdquo;
                            </div>

                            <div className="text-[11px] text-slate-400">
                                <strong className="text-slate-300">Significado didáctico: </strong>
                                {cuñasRadiales[selectedLanguage].traduccion_guia}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ========================================================================= */}
            {/* PESTAÑA 3: SIMULADOR TÁCTICO: VENTANA DORADA VS DESASTRE                  */}
            {/* ========================================================================= */}
            {activeTab === "simulador" && (
                <div className="space-y-6">
                    <div className="bg-slate-900 border border-sky-500/30 rounded-2xl p-5 space-y-4">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                            <div>
                                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                    <Sparkles className="w-4 h-4 text-sky-400" />
                                    Simulador de Impacto Municipal: ¿Cuándo Actúa la Autoridad?
                                </h2>
                                <p className="text-xs text-slate-300">
                                    Compara las consecuencias de actuar en la <strong>Ventana Dorada</strong> vs esperar al desastre.
                                </p>
                            </div>

                            <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
                                <button
                                    onClick={() => setSimScenario("temprana")}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                                        simScenario === "temprana"
                                            ? "bg-emerald-600 text-white shadow"
                                            : "text-slate-400 hover:text-slate-200"
                                    }`}
                                >
                                    ✅ Escenario A: Acción en Ventana Dorada (Set-Nov)
                                </button>
                                <button
                                    onClick={() => setSimScenario("tardia")}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                                        simScenario === "tardia"
                                            ? "bg-red-600 text-white shadow"
                                            : "text-slate-400 hover:text-slate-200"
                                    }`}
                                >
                                    ❌ Escenario B: Reacción Tardía (Ene-Feb)
                                </button>
                            </div>
                        </div>

                        {/* Comparación Visual */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                                <span className="text-[11px] text-slate-400 font-medium">Costo de Intervención por Km</span>
                                <div className={`text-2xl font-black ${simScenario === "temprana" ? "text-emerald-400" : "text-red-400"}`}>
                                    {simScenario === "temprana" ? "S/. 45,000" : "S/. 195,000"}
                                </div>
                                <p className="text-[11px] text-slate-400">
                                    {simScenario === "temprana" ? "Trabajo en seco con maquinaria contratada a tarifa regular." : "Sobreprecio del 330% por emergencia y maquinaria inundada."}
                                </p>
                            </div>

                            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                                <span className="text-[11px] text-slate-400 font-medium">Viviendas Inundadas Proyectadas</span>
                                <div className={`text-2xl font-black ${simScenario === "temprana" ? "text-emerald-400" : "text-red-400"}`}>
                                    {simScenario === "temprana" ? "0 - 15 viviendas" : "850+ viviendas"}
                                </div>
                                <p className="text-[11px] text-slate-400">
                                    {simScenario === "temprana" ? "Contención efectiva por defensas ribereñas y cauce libre." : "Desborde catastrófico por sedimentos acumulados y palizadas."}
                                </p>
                            </div>

                            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                                <span className="text-[11px] text-slate-400 font-medium">Situación Legal del Alcalde</span>
                                <div className={`text-2xl font-black ${simScenario === "temprana" ? "text-emerald-400" : "text-red-400"}`}>
                                    {simScenario === "temprana" ? "Limpio / Conforme" : "Denuncia Penal"}
                                </div>
                                <p className="text-[11px] text-slate-400">
                                    {simScenario === "temprana" ? "Cumplimiento oportuno de directiva SINAGERD y PP 068." : "Apertura de investigación fiscal por omisión de deberes de función."}
                                </p>
                            </div>
                        </div>

                        {/* Descripción Didáctica del Escenario */}
                        <div className={`p-4 rounded-xl border ${
                            simScenario === "temprana"
                                ? "bg-emerald-950/30 border-emerald-700/50 text-emerald-200"
                                : "bg-red-950/30 border-red-700/50 text-red-200"
                        } text-xs leading-relaxed`}>
                            {simScenario === "temprana" ? (
                                <>
                                    <strong>Conclusión de Mando:</strong> El municipio descolmató el río durante octubre y culminó el enrocado el 25 de noviembre. Al llegar la primera crecida de 600 m³/s en enero, el agua fluyó sin estrangulamientos hacia el mar. La transitabilidad se mantuvo y no hubo pérdida de cosechas ni vidas.
                                </>
                            ) : (
                                <>
                                    <strong>Conclusión de Mando:</strong> El municipio solicitó presupuesto recién en enero tras el primer desborde. La maquinaria pesada no pudo ingresar porque el río arrastraba lodo y piedras. El puente principal colapsó, aislando a 14 caseríos y generando pérdidas agrícolas irreparables.
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
