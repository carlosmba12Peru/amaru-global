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
    ArrowRight,
    Landmark,
    CloudLightning,
    Droplets,
    Mountain,
    Sun,
    CloudRain,
    ExternalLink,
    Eye,
    History,
    Flame,
    Users,
    Radio,
    HeartPulse
} from "lucide-react";

export default function YachayPage() {
    const [activeTab, setActiveTab] = useState<"milenaria" | "autoridades" | "comunidades" | "simulador">("milenaria");
    const [selectedLanguage, setSelectedLanguage] = useState<"QUECHUA_CHANKA" | "QUECHUA_COLLAO" | "AYMARA" | "CAST_LLANO">("QUECHUA_CHANKA");
    const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
    const [simScenario, setSimScenario] = useState<"temprana" | "tardia">("temprana");
    const [selectedBio, setSelectedBio] = useState<number>(0);
    const [selectedHazard, setSelectedHazard] = useState<number>(0);
    const [hazardViewMode, setHazardViewMode] = useState<"todos" | "individual">("todos");

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

    const peligrosFEN = [
        {
            id: "lluvias",
            nombre: "1. Lluvias Torrenciales Inusuales",
            icon: CloudRain,
            color: "text-blue-400",
            bg: "bg-blue-950/40 border-blue-800/60",
            badge: "bg-blue-500/20 text-blue-300 border-blue-500/40",
            umbral: "> 70 - 150 mm / 24h",
            regiones: "Tumbes, Piura, Lambayeque, La Libertad, Ancash, Lima e Ica",
            mecanismo: "El calentamiento oceánico anómalo (TSM > 26.5°C - 28°C) debilita la inversión térmica de la Corriente de Humboldt, disparando violentas celdas convectivas de nubes Cumulonimbus sobre la franja desértica costera.",
            impactoHistorico: "1983 y 1998: Registros pluviométricos históricos en Chulucanas y Morropón superando los 4,000 mm acumulados en la temporada (multiplicando por 20 el promedio anual).",
            leccionAncestral: "Vichama y Caral edificaron en terrazas desérticas elevadas fuera del alcance de inundaciones pluviales, con drenajes litológicos para evacuar escorrentías sin dañar los cimientos."
        },
        {
            id: "huaicos",
            nombre: "2. Huaicos y Llocllas (Flujo de Detritos)",
            icon: Droplets,
            color: "text-amber-400",
            bg: "bg-amber-950/40 border-amber-800/60",
            badge: "bg-amber-500/20 text-amber-300 border-amber-500/40",
            umbral: "> 20 - 25 mm/h en cuenca media",
            regiones: "Vertiente Occidental: Rímac, Lurín, Chillón, Moche, Chicama, Santa, Casma",
            mecanismo: "Precipitaciones violentas en quebradas áridas de fuerte pendiente remueven toneladas de material aluvial inconsolidado, formando una masa viscosa de agua, lodo y rocas de hasta varios metros de diámetro a gran velocidad.",
            impactoHistorico: "2017: Activación en cadena de 46 quebradas en Lima (Huaycoloro, Quirio, Pedregal, Carosio) y la quebrada San Idelfonso en Trujillo, destruyendo cientos de viviendas edificadas en cauce seco.",
            leccionAncestral: "La sabiduría andina denominó 'Lloclla' a este fenómeno recurrente. Las civilizaciones prehispánicas JAMÁS ocuparon los conos aluviales; conocían que la quebrada 'duerme' décadas pero siempre reclama su cauce."
        },
        {
            id: "inundaciones",
            nombre: "3. Inundaciones y Desbordes Fluviales",
            icon: Waves,
            color: "text-cyan-400",
            bg: "bg-cyan-950/40 border-cyan-800/60",
            badge: "bg-cyan-500/20 text-cyan-300 border-cyan-500/40",
            umbral: "Caudal > 1,800 - 4,400 m³/s",
            regiones: "Valles bajos de Piura, Tumbes, Chira, La Leche, Motupe, Chancay-Lambayeque",
            mecanismo: "La colmatación masiva de sedimentos en el lecho fluvial reduce drásticamente la capacidad de porte hidráulico de los ríos costeros, provocando roturas de diques marginales e inundaciones laminares extensas.",
            impactoHistorico: "1998: Caudal histórico de 4,420 m³/s en el río Piura sepultó los distritos de Catacaos y Cura Mori bajo más de 2 metros de agua.",
            leccionAncestral: "Las culturas Vicús, Mochica y Lambayeque ubicaron sus centros ceremoniales y administrativos sobre montículos (huacas) y plataformas artificiales, reservando el lecho de inundación exclusivamente para agricultura de aluvión."
        },
        {
            id: "aluviones",
            nombre: "4. Aluviones y Derrumbes",
            icon: Mountain,
            color: "text-stone-300",
            bg: "bg-stone-950/40 border-stone-800/60",
            badge: "bg-stone-500/20 text-stone-300 border-stone-500/40",
            umbral: "Saturación de macizo rocoso o rotura de lagunas",
            regiones: "Cordillera Blanca, Callejón de Huaylas, Cordillera Huayhuash y cabeceras de cuenca",
            mecanismo: "La combinación de lluvias orográficas intensas, desglaciación acelerada y desestabilización de morenas glaciares genera desprendimientos catastróficos de hielo y roca con volumen multimillonario.",
            impactoHistorico: "Aluviones históricos en Huaraz (1941) y Yungay (1970); activación de torrentes en cuencas altas durante el FEN 1998.",
            leccionAncestral: "Los antiguos constructores de Chavín de Huántar (3,000 BP) diseñaron una red subterránea de galerías hidráulicas capaces de disipar y dosificar la energía de las aguas torrenciales de los ríos Mosna y Huachecsa."
        },
        {
            id: "deslizamientos",
            nombre: "5. Deslizamientos de Laderas",
            icon: Mountain,
            color: "text-yellow-400",
            bg: "bg-yellow-950/40 border-yellow-800/60",
            badge: "bg-yellow-500/20 text-yellow-300 border-yellow-500/40",
            umbral: "Saturación hídrica > 80% en taludes",
            regiones: "Cajamarca, Amazonas, San Martín, Huánuco, Pasco, Junín y Puno ceja de selva",
            mecanismo: "Pérdida de fricción interna y cohesión en estratos geológicos por infiltración profunda de agua pluvial en laderas con pendientes superiores a 35°, acelerado por la pérdida de cobertura vegetal nativa.",
            impactoHistorico: "Interrupción sistemática de la Carretera Central en la sierra de Lima y Junín, aislando a la capital del suministro alimentario andino.",
            leccionAncestral: "Los andenes andinos (terrazas de cultivo) escalonan y reconfiguran las laderas, reduciendo la fuerza gravitacional del agua e introduciendo muros de piedra con raíces de queñual y aliso que actúan como clavos biológicos."
        },
        {
            id: "lahares",
            nombre: "6. Lahares Volcánicos (Región Sur)",
            icon: Flame,
            color: "text-rose-400",
            bg: "bg-rose-950/40 border-rose-800/60",
            badge: "bg-rose-500/20 text-rose-300 border-rose-500/40",
            umbral: "Lluvias > 15 mm en edificios volcánicos",
            regiones: "Arequipa (volcanes Misti, Chachani, Sabancaya), Moquegua (Ubinas, Huaynaputina) y Tacna (Yucamane)",
            mecanismo: "Precipitaciones torrenciales interactúan con los depósitos de ceniza y piroclastos sueltos acumulados en las faldas de los volcanes, formando densos flujos de lodo volcánico abrasivo que bajan por las torrenteras.",
            impactoHistorico: "Episodios recurrentes de lahares en el valle de Ubinas e inundación de torrenteras en la ciudad de Arequipa, dañando plantas de tratamiento de agua potable.",
            leccionAncestral: "Los antiguos Collaguas y Cabanas reconocían a los volcanes como deidades tutelares (Apus) y respetaban escrupulosamente los corredores naturales de descarga volcánica, sin asentar viviendas en sus cauces."
        },
        {
            id: "tormentas",
            nombre: "7. Tormentas Eléctricas y Vientos Huracanados",
            icon: CloudLightning,
            color: "text-purple-400",
            bg: "bg-purple-950/40 border-purple-800/60",
            badge: "bg-purple-500/20 text-purple-300 border-purple-500/40",
            umbral: "Ráfagas > 50 - 70 km/h y descargas eléctricas",
            regiones: "Litoral norte, valles costeros intermedios y vertiente occidental andina",
            mecanismo: "Inestabilidad termodinámica extrema por choque de frentes cálidos marinos con aire frío de la cordillera genera tormentas eléctricas severas y vendavales que desprenden techos ligeros y colapsan redes eléctricas.",
            impactoHistorico: "Tormentas eléctricas anómalas en Trujillo, Piura y Chiclayo durante el FEN Costero 2017 y Ciclón Yaku 2023, colapsando postes y subestaciones.",
            leccionAncestral: "Estructuras arquitectónicas prehispánicas de quincha flexible y techos de barro aligerado con caña brava y doble vertiente que amortiguaban la tracción de los vientos marinos cruzados."
        },
        {
            id: "sequias",
            nombre: "8. Sequías Severas en Sierra Sur (Paradoja Bimodal)",
            icon: Sun,
            color: "text-orange-400",
            bg: "bg-orange-950/40 border-orange-800/60",
            badge: "bg-orange-500/20 text-orange-300 border-orange-500/40",
            umbral: "Déficit de precipitación > 50% - 70%",
            regiones: "Puno (Cuenca del Titicaca), Cusco, Apurímac, Ayacucho y Arequipa alta",
            mecanismo: "La 'Paradoja Bimodal': mientras El Niño inunda el litoral norte, la alteración de la celda de Walker debilita la entrada de humedad amazónica hacia el sur andino, provocando prolongadas sequías meteorológicas y agrícolas.",
            impactoHistorico: "1982-1983: La peor sequía del siglo XX en el Altiplano puneño; mortandad masiva de 300,000 cabezas de camélidos y ovinos y pérdida casi total de cosechas de papa y quinua.",
            leccionAncestral: "Vichama plasmó con rostros cadavéricos el hambre de la sequía de 4,200 años. Tiwanaku perfeccionó los Waru Warus (camellones inundables) y qochas para almacenar agua freática y amortiguar el frío nocturno."
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
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1.5">
                                <GraduationCap className="w-3.5 h-3.5" />
                                NIVEL 3 • COED SOCIAL AMARU
                            </span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-blue-950 text-blue-300 border border-blue-800 font-bold">
                                ACADEMIA DOCTRINARIA &amp; SABERES TERRITORIALES
                            </span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-900 text-slate-300 border border-slate-700">
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

                    {/* Botonera de Enlaces Rápidos y Dock Social */}
                    <div className="flex flex-wrap items-center gap-2">
                        <Link
                            href="/reporte-ciudadano"
                            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-rose-950/60 hover:bg-rose-900 text-rose-200 border border-rose-700/50 transition flex items-center gap-1.5 shadow"
                        >
                            <Radio className="w-3.5 h-3.5 text-rose-400" />
                            <span>Sensor Humano</span>
                        </Link>
                        <Link
                            href="/ayni"
                            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition flex items-center gap-1.5 shadow"
                        >
                            <Users className="w-3.5 h-3.5 text-rose-400" />
                            <span>Red AYNI</span>
                        </Link>
                        <Link
                            href="/salud/triaje"
                            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition flex items-center gap-1.5 shadow"
                        >
                            <HeartPulse className="w-3.5 h-3.5 text-rose-400" />
                            <span>Triaje Salud</span>
                        </Link>
                        <Link
                            href="/glosario"
                            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition flex items-center gap-1.5 shadow"
                        >
                            <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
                            <span>Glosario</span>
                        </Link>
                        <Link
                            href="/pronostico"
                            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-amber-950/60 hover:bg-amber-900 text-amber-200 border border-amber-700/50 transition flex items-center gap-1.5 shadow"
                        >
                            <Clock className="w-3.5 h-3.5 text-amber-400" />
                            <span>Reloj Táctico</span>
                        </Link>
                    </div>
                </div>

                {/* Conmutador de Pestañas Principales */}
                <div className="flex gap-2 mt-6 border-b border-slate-800 pt-2 overflow-x-auto scrollbar-thin scrollbar-thumb-slate-800">
                    <button
                        onClick={() => setActiveTab("milenaria")}
                        className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-t-xl transition border-t border-x whitespace-nowrap ${
                            activeTab === "milenaria"
                                ? "bg-slate-900 text-rose-400 border-rose-500/40 border-b-2 border-b-rose-400 shadow-md"
                                : "text-slate-400 hover:text-slate-200 border-transparent hover:bg-slate-800/50"
                        }`}
                    >
                        <Landmark className="w-4 h-4 text-rose-400" />
                        <span>Memoria Milenaria: Vichama (3,800 años) &amp; Peligros FEN</span>
                    </button>
                    <button
                        onClick={() => setActiveTab("autoridades")}
                        className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-t-xl transition border-t border-x whitespace-nowrap ${
                            activeTab === "autoridades"
                                ? "bg-slate-900 text-amber-400 border-amber-500/40 border-b-2 border-b-amber-400 shadow-md"
                                : "text-slate-400 hover:text-slate-200 border-transparent hover:bg-slate-800/50"
                        }`}
                    >
                        <Building2 className="w-4 h-4" />
                        <span>Mando para Autoridades (Alcaldes / COER)</span>
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
            {/* PESTAÑA: MEMORIA MILENARIA, PELIGROS NATURALES FEN Y EDUCACIÓN CLIMÁTICA   */}
            {/* Fuentes: Zona Arq. Caral (Mincul), Infobae 2026, Andina 2026, Memoria FEN  */}
            {/* ========================================================================= */}
            {activeTab === "milenaria" && (
                <div className="space-y-8">
                    {/* 1. SECCIÓN VICHAMA: LA PRIMERA ADVERTENCIA CLIMÁTICA DE AMÉRICA */}
                    <div className="bg-gradient-to-br from-slate-900 via-rose-950/20 to-slate-900 border border-rose-500/30 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
                        <div className="absolute -top-12 -right-12 w-64 h-64 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
                        
                        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                            <div className="flex items-center gap-2">
                                <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center gap-1.5 shadow-sm">
                                    <Landmark className="w-3.5 h-3.5" />
                                    CIVILIZACIÓN CARAL · VICHAMA (3,800 - 4,200 AÑOS ANTES DEL PRESENTE)
                                </span>
                                <span className="text-xs text-slate-400 hidden sm:inline">Valle de Huaura, Végueta</span>
                            </div>
                            <button
                                onClick={() => speakText(
                                    "Vichama y la advertencia de hace 4,200 años. En el valle de Huaura, los frisos de barro de Vichama representan la primera memoria climática documentada de América. Sus relieves muestran cuerpos esqueléticos por la gran hambruna del cambio climático global, y en lo alto, el sapo antropomorfo que anuncia el regreso de las lluvias torrenciales y la reactivación de los ríos. Los antiguos peruanos jamás construyeron sobre conos aluviales ni cauces secos; desarrollaron las shicras antisísmicas y una red de intercambio costa y sierra para resistir las crisis climáticas."
                                )}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                                    isPlayingAudio
                                        ? "bg-amber-500 text-slate-950 animate-pulse"
                                        : "bg-slate-800 hover:bg-slate-700 text-rose-300 border border-rose-500/30"
                                }`}
                            >
                                <Volume2 className="w-4 h-4" />
                                <span>{isPlayingAudio ? "Pausar Narración" : "Escuchar Crónica Ancestral"}</span>
                            </button>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                            <div className="lg:col-span-8 space-y-4">
                                <h2 className="text-2xl font-black text-white leading-tight">
                                    Vichama y la Advertencia de 4,200 Años: Cómo los Antiguos Peruanos Vencieron la Crisis Climática
                                </h2>
                                <p className="text-sm text-slate-300 leading-relaxed">
                                    Las investigaciones lideradas por la <strong>Dra. Ruth Shady Solís</strong> y la Zona Arqueológica Caral revelan que hace aproximadamente 3,800 a 4,200 años la civilización de Vichama enfrentó el <em>Megaevento 4.2 ka calBP</em>, un colapso climático global que provocó décadas de sequías extremas, enfriamiento marino y posteriores lluvias torrenciales aluviales.
                                </p>
                                <p className="text-sm text-slate-300 leading-relaxed">
                                    A diferencia del modelo moderno, los antiguos constructores <strong>plasmaron en sus muros de arcilla la memoria permanente del desastre</strong> para que ninguna generación futura olvidara las reglas de ocupación del territorio:
                                </p>

                                {/* Tarjetas de los 3 Frisos Clave */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
                                    <div className="p-3.5 rounded-xl bg-slate-950/70 border border-rose-900/50 space-y-1.5">
                                        <div className="text-xs font-bold text-rose-400 flex items-center gap-1">
                                            <span>💀</span> Los Adultos Esqueléticos
                                        </div>
                                        <p className="text-[11px] text-slate-300 leading-normal">
                                            Danza fúnebre con costillas expuestas y vientres hundidos: testimonio de la mortífera hambruna causada por la sequía extrema en el valle.
                                        </p>
                                    </div>
                                    <div className="p-3.5 rounded-xl bg-slate-950/70 border border-amber-900/50 space-y-1.5">
                                        <div className="text-xs font-bold text-amber-400 flex items-center gap-1">
                                            <span>🌱</span> Los Niños de la Resistencia
                                        </div>
                                        <p className="text-[11px] text-slate-300 leading-normal">
                                            Infantes de pie entre los adultos cadavéricos: simbolizan la continuidad biológica y la resiliencia social para refundar la ciudad.
                                        </p>
                                    </div>
                                    <div className="p-3.5 rounded-xl bg-slate-950/70 border border-cyan-900/50 space-y-1.5">
                                        <div className="text-xs font-bold text-cyan-400 flex items-center gap-1">
                                            <span>🐸</span> El Sapo Sagrado y el Rayo
                                        </div>
                                        <p className="text-[11px] text-slate-300 leading-normal">
                                            El sapo antropomorfo que recibe un rayo sobre su cabeza: alegoría sagrada del fin del estiaje y el retorno de las lluvias y crecidas del río.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Columna de Fuentes Oficiales y Principios */}
                            <div className="lg:col-span-4 bg-slate-950/80 border border-rose-900/40 rounded-xl p-4 space-y-4">
                                <div>
                                    <span className="text-[10px] font-bold text-rose-400 tracking-wider uppercase block mb-1.5">
                                        Fuentes Oficiales Grounded
                                    </span>
                                    <div className="space-y-2 text-xs">
                                        <a
                                            href="https://www.gob.pe/institucion/caral/noticias/1433104-vichama-exposicion-muestra-como-una-sociedad-enfrento-los-cambios-ambientales-hace-3800-anos"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="block p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 hover:border-rose-500/50 transition group"
                                        >
                                            <div className="flex items-center justify-between text-rose-300 font-semibold text-[11px] mb-0.5">
                                                <span>Zona Arq. Caral / MINCUL</span>
                                                <ExternalLink className="w-3 h-3 text-slate-500 group-hover:text-rose-400" />
                                            </div>
                                            <p className="text-[10px] text-slate-400 line-clamp-2">
                                                Exposición: Cómo una sociedad enfrentó los cambios ambientales hace 3,800 años (Dra. Ruth Shady).
                                            </p>
                                        </a>

                                        <a
                                            href="https://www.infobae.com/peru/2026/09/09/vichama-y-la-advertencia-de-hace-4200-anos-conoce-como-antiguas-civilizaciones-enfrentaron-una-crisis-climatica-global-como-el-fenomeno-el-nino/"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="block p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 hover:border-rose-500/50 transition group"
                                        >
                                            <div className="flex items-center justify-between text-rose-300 font-semibold text-[11px] mb-0.5">
                                                <span>Infobae Perú (09-Sep-2026)</span>
                                                <ExternalLink className="w-3 h-3 text-slate-500 group-hover:text-rose-400" />
                                            </div>
                                            <p className="text-[10px] text-slate-400 line-clamp-2">
                                                Vichama y la advertencia de hace 4,200 años frente al calentamiento y crisis globales.
                                            </p>
                                        </a>
                                    </div>
                                </div>

                                <div className="p-3 bg-rose-950/30 border border-rose-800/40 rounded-lg">
                                    <span className="text-[10px] font-bold text-rose-300 uppercase block mb-1">
                                        Doctrina Territorial Ancestral
                                    </span>
                                    <p className="text-[11px] text-slate-300 leading-snug">
                                        <em>"La quebrada nunca olvida su cauce"</em>. Vichama ubicó sus centros ceremoniales y viviendas sobre terrazas geológicas altas fuera de las llanuras aluviales, combinando la pesca de anchoveta salada para soportar las sequías agrícolas.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 2. LOS 8 PELIGROS NATURALES ASOCIADOS AL FEN COSTERO (AGENCIA ANDINA 2026) */}
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/40">
                                        CATÁLOGO NACIONAL DE AMENAZAS (8 PELIGROS OFICIALES)
                                    </span>
                                    <span className="text-xs text-slate-400">Doctrina INDECI / Agencia Andina</span>
                                </div>
                                <h3 className="text-lg font-black text-white flex items-center gap-2">
                                    <CloudLightning className="w-5 h-5 text-amber-400" />
                                    Los 8 Peligros Naturales Asociados al Fenómeno El Niño en el Perú
                                </h3>
                            </div>
                            <div className="flex items-center gap-2 flex-wrap">
                                <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
                                    <button
                                        type="button"
                                        onClick={() => setHazardViewMode("todos")}
                                        className={`px-3 py-1 text-xs font-semibold rounded-lg transition ${
                                            hazardViewMode === "todos"
                                                ? "bg-blue-600 text-white shadow"
                                                : "text-slate-400 hover:text-white"
                                        }`}
                                    >
                                        Ver los 8 en Paralelo ({peligrosFEN.length})
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setHazardViewMode("individual")}
                                        className={`px-3 py-1 text-xs font-semibold rounded-lg transition ${
                                            hazardViewMode === "individual"
                                                ? "bg-blue-600 text-white shadow"
                                                : "text-slate-400 hover:text-white"
                                        }`}
                                    >
                                        Modo Foco Individual
                                    </button>
                                </div>
                                <a
                                    href="https://andina.pe/agencia/noticia-el-nino-costero-conoce-peligros-naturales-asociados-a-este-fenomeno-el-peru-1092200.aspx"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-blue-400 border border-slate-700 transition"
                                >
                                    <span>Fuente Oficial Andina</span>
                                    <ExternalLink className="w-3.5 h-3.5" />
                                </a>
                            </div>
                        </div>

                        {/* Botonera de Acceso Rápido a los 8 Peligros */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-[11px] text-slate-400">
                                <span className="font-semibold uppercase tracking-wider text-slate-400">
                                    Índice Rápido de Peligros (Clic para enfocar o navegar)
                                </span>
                                <span className="text-slate-400">Total: 8 Peligros Sistematizados</span>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
                                {peligrosFEN.map((p, idx) => {
                                    const Icon = p.icon;
                                    const isSelected = selectedHazard === idx;
                                    return (
                                        <button
                                            key={p.id}
                                            onClick={() => {
                                                setSelectedHazard(idx);
                                                const el = document.getElementById(`peligro-${p.id}`);
                                                if (el && hazardViewMode === "todos") {
                                                    el.scrollIntoView({ behavior: "smooth", block: "center" });
                                                }
                                            }}
                                            className={`p-2 rounded-xl border text-center transition flex flex-col items-center justify-center gap-1 ${
                                                isSelected
                                                    ? "bg-slate-800/90 border-blue-500 shadow-md ring-1 ring-blue-500/50"
                                                    : "bg-slate-950/60 border-slate-800/80 hover:bg-slate-800/40 hover:border-slate-700"
                                            }`}
                                        >
                                            <Icon className={`w-4 h-4 ${p.color}`} />
                                            <span className="text-[10px] font-bold text-slate-200 line-clamp-1">
                                                #{idx + 1} {p.nombre.replace(/^\d+\.\s*/, "").split(" ")[0]}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* VISTA 1: TODOS LOS 8 PELIGROS VISIBLES EN PARALELO (DEFAULT) */}
                        {hazardViewMode === "todos" && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
                                {peligrosFEN.map((p, idx) => {
                                    const Icon = p.icon;
                                    const isHighlighted = selectedHazard === idx;
                                    return (
                                        <div
                                            key={p.id}
                                            id={`peligro-${p.id}`}
                                            className={`p-5 rounded-xl border transition-all flex flex-col justify-between gap-4 ${p.bg} ${
                                                isHighlighted
                                                    ? "ring-2 ring-blue-500 shadow-xl"
                                                    : "hover:border-slate-700"
                                            }`}
                                        >
                                            <div className="space-y-3">
                                                <div className="flex items-start justify-between gap-2">
                                                    <div className="flex items-center gap-2">
                                                        <div className="p-2 rounded-lg bg-slate-950/80 border border-slate-800">
                                                            <Icon className={`w-5 h-5 ${p.color}`} />
                                                        </div>
                                                        <div>
                                                            <span className="text-[10px] font-mono text-slate-400">Peligro #{idx + 1} de 8</span>
                                                            <h4 className="text-sm font-bold text-white leading-tight">
                                                                {p.nombre}
                                                            </h4>
                                                        </div>
                                                    </div>
                                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border shrink-0 ${p.badge}`}>
                                                        {p.umbral}
                                                    </span>
                                                </div>

                                                <div>
                                                    <span className="text-[11px] font-bold text-slate-300 block mb-0.5">
                                                        Mecanismo Físico:
                                                    </span>
                                                    <p className="text-xs text-slate-300 leading-relaxed">
                                                        {p.mecanismo}
                                                    </p>
                                                </div>

                                                <div className="text-xs text-slate-300 flex items-start gap-1.5 pt-1">
                                                    <Compass className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                                                    <span className="leading-snug">
                                                        <strong className="text-slate-200">Zonas Críticas:</strong> {p.regiones}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="space-y-2.5 pt-3 border-t border-slate-800/80 bg-slate-950/40 -mx-5 -mb-5 p-4 rounded-b-xl">
                                                <div>
                                                    <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block mb-0.5">
                                                        Memoria Histórica Republicana (1983 - 1998 - 2017)
                                                    </span>
                                                    <p className="text-[11px] text-slate-300 leading-snug">
                                                        {p.impactoHistorico}
                                                    </p>
                                                </div>
                                                <div className="pt-2 border-t border-slate-800/60">
                                                    <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block mb-0.5">
                                                        Sabiduría Prehispánica Aplicada
                                                    </span>
                                                    <p className="text-[11px] text-slate-300 leading-snug">
                                                        {p.leccionAncestral}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {/* VISTA 2: MODO FOCO INDIVIDUAL */}
                        {hazardViewMode === "individual" && (() => {
                            const p = peligrosFEN[selectedHazard];
                            const Icon = p.icon;
                            return (
                                <div className={`p-5 rounded-xl border ${p.bg} grid grid-cols-1 lg:grid-cols-12 gap-5 transition-all`}>
                                    <div className="lg:col-span-7 space-y-3">
                                        <div className="flex items-center gap-2">
                                            <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold border ${p.badge}`}>
                                                {p.nombre}
                                            </span>
                                            <span className="text-xs text-slate-400">Umbral: <strong className="text-white">{p.umbral}</strong></span>
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold text-white mb-1">Mecanismo Físico y Dinámica:</h4>
                                            <p className="text-xs text-slate-300 leading-relaxed">{p.mecanismo}</p>
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold text-white mb-1">Regiones y Cuencas Críticas:</h4>
                                            <p className="text-xs text-slate-300 flex items-center gap-1.5">
                                                <Compass className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                                <span>{p.regiones}</span>
                                            </p>
                                        </div>
                                    </div>

                                    <div className="lg:col-span-5 space-y-3 bg-slate-950/70 border border-slate-800/80 rounded-xl p-4">
                                        <div>
                                            <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block mb-1">
                                                Memoria Histórica Republicana (1983 - 1998 - 2017)
                                            </span>
                                            <p className="text-xs text-slate-300 leading-snug">{p.impactoHistorico}</p>
                                        </div>
                                        <div className="pt-2 border-t border-slate-800">
                                            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block mb-1">
                                                Sabiduría Prehispánica Aplicada
                                            </span>
                                            <p className="text-xs text-slate-300 leading-snug">{p.leccionAncestral}</p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })()}
                    </div>

                    {/* 3. CONEXIÓN VIVA: MEMORIA HISTÓRICA REPUBLICANA FEN & LOS 1,891 DISTRITOS */}
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 uppercase">
                                    La Paradoja de la Amnesia Territorial
                                </span>
                                <h3 className="text-xl font-black text-white mt-1">
                                    Vichama vs Los 1,891 Distritos del Perú Republicano
                                </h3>
                                <p className="text-xs text-slate-400 mt-0.5">
                                    ¿Por qué si hace 4,200 años supimos adaptarnos, hoy sufrimos el colapso de colegios, puentes y ciudades?
                                </p>
                            </div>
                            <Link
                                href="/historico"
                                className="px-4 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white transition flex items-center gap-2 shadow-lg shadow-amber-900/30 shrink-0"
                            >
                                <History className="w-4 h-4" />
                                <span>Explorar los 1,891 Distritos FEN</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                        </div>

                        {/* Comparación Directa Ancestral vs Republicano */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-4 rounded-xl bg-slate-950/80 border border-rose-900/40 space-y-3">
                                <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
                                    <Landmark className="w-4 h-4" />
                                    <span>Modelo Ancestral (Vichama, Caral, Chimú)</span>
                                </div>
                                <ul className="text-xs text-slate-300 space-y-2">
                                    <li className="flex items-start gap-2">
                                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                                        <span><strong>Cero ocupación en lechos secos:</strong> Las quebradas se reservaban como corredores sagrados del agua.</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                                        <span><strong>Shicras sismorresistentes:</strong> Mallas de fibra vegetal rellenas de piedra que absorben aceleraciones sísmicas.</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                                        <span><strong>Complementariedad de pisos ecológicos:</strong> Anchoveta seca y camotes aseguraban calorías durante años de sequía.</span>
                                    </li>
                                </ul>
                            </div>

                            <div className="p-4 rounded-xl bg-slate-950/80 border border-amber-900/40 space-y-3">
                                <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                                    <AlertTriangle className="w-4 h-4" />
                                    <span>Amnesia Republicana (1983, 1998, 2017)</span>
                                </div>
                                <ul className="text-xs text-slate-300 space-y-2">
                                    <li className="flex items-start gap-2">
                                        <ShieldAlert className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                                        <span><strong>Lotización de quebradas activas:</strong> Asentamiento en conos deyectores en Huaycoloro, Chosica y Trujillo.</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <ShieldAlert className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                                        <span><strong>Colapso de +12,400 escuelas:</strong> Módulos educativos levantados sobre llanuras inundables sin drenajes pluviales.</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <ShieldAlert className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                                        <span><strong>Pérdida de 43 puentes en 1983:</strong> Diseño de luces insuficientes que estrangulan el caudal extraordinario del FEN.</span>
                                    </li>
                                </ul>
                            </div>
                        </div>

                        {/* Barra de Estadísticas de la Memoria FEN */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-800">
                            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-center">
                                <div className="text-lg font-black text-amber-400 font-mono">1,891</div>
                                <div className="text-[10px] text-slate-400 uppercase tracking-wider">Distritos Registrados</div>
                            </div>
                            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-center">
                                <div className="text-lg font-black text-blue-400 font-mono">3 MegaNiños</div>
                                <div className="text-[10px] text-slate-400 uppercase tracking-wider">1982-83 / 1997-98 / 2017</div>
                            </div>
                            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-center">
                                <div className="text-lg font-black text-rose-400 font-mono">+12,400</div>
                                <div className="text-[10px] text-slate-400 uppercase tracking-wider">Colegios Afectados</div>
                            </div>
                            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-center">
                                <div className="text-lg font-black text-emerald-400 font-mono">100% Digital</div>
                                <div className="text-[10px] text-slate-400 uppercase tracking-wider">Acceso a Expedientes</div>
                            </div>
                        </div>
                    </div>

                    {/* 4. PROPUESTA TRANSFORMADORA: ¿QUÉ PODEMOS HACER CON LA EDUCACIÓN CLIMÁTICA? */}
                    <div className="bg-gradient-to-br from-slate-900 via-emerald-950/20 to-slate-900 border border-emerald-500/30 rounded-2xl p-6 shadow-xl space-y-5">
                        <div className="flex items-center gap-2">
                            <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1.5">
                                <GraduationCap className="w-3.5 h-3.5" />
                                HOJA DE RUTA MINEDU / GOBIERNOS REGIONALES / COLEGIOS
                            </span>
                            <span className="text-xs text-slate-400">Propuesta de Políticas Educativas</span>
                        </div>

                        <div>
                            <h3 className="text-xl font-black text-white">
                                Los 4 Pilares de la Nueva Educación Climática Territorial para el Perú
                            </h3>
                            <p className="text-xs text-slate-300 mt-1">
                                El Fenómeno El Niño no se vence con simulacros protocolares de 10 minutos. Requiere reintroducir la cultura territorial viva en el sistema educativo nacional:
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-4 rounded-xl bg-slate-950/80 border border-emerald-900/40 space-y-2">
                                <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                                    <span className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center font-bold">1</span>
                                    <span>Currículo de Cuenca y Territorio Vivo</span>
                                </div>
                                <p className="text-xs text-slate-300 leading-relaxed">
                                    Sustituir la memorización estéril por salidas de campo donde los escolares recorran la quebrada de su distrito, reconozcan la faja marginal y aprendan a leer las huellas geológicas que dejó el Niño de 1998 o 2017.
                                </p>
                            </div>

                            <div className="p-4 rounded-xl bg-slate-950/80 border border-emerald-900/40 space-y-2">
                                <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                                    <span className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center font-bold">2</span>
                                    <span>Red Nacional de Pluviómetros Escolares</span>
                                </div>
                                <p className="text-xs text-slate-300 leading-relaxed">
                                    Equipar a los colegios secundarios de cuencas medias y altas con estaciones pluviométricas artesanales calibradas. Los estudiantes registran la lluvia diaria y envían la alerta temprana comunitaria si supera los 20 mm/h.
                                </p>
                            </div>

                            <div className="p-4 rounded-xl bg-slate-950/80 border border-emerald-900/40 space-y-2">
                                <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                                    <span className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center font-bold">3</span>
                                    <span>Recuperación de la Memoria Oral y Toponimia</span>
                                </div>
                                <p className="text-xs text-slate-300 leading-relaxed">
                                    Proyectos de investigación escolar donde los jóvenes entrevisten a los abuelos del pueblo para marcar en postes y plazas públicas la <em>cota máxima de inundación</em> histórica y recuperar vocablos ancestrales como <em>Lloclla</em> o <em>Waru Waru</em>.
                                </p>
                            </div>

                            <div className="p-4 rounded-xl bg-slate-950/80 border border-emerald-900/40 space-y-2">
                                <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                                    <span className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center font-bold">4</span>
                                    <span>Veto Ciudadano a la Invasión de Quebradas</span>
                                </div>
                                <p className="text-xs text-slate-300 leading-relaxed">
                                    Empoderar a las futuras generaciones con pensamiento crítico para rechazar la compra o construcción de viviendas en zonas catalogadas como de <em>Muy Alto Riesgo No Mitigable</em> por CENEPRED, rompiendo el ciclo de la corrupción urbana.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

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
                                        <span className="font-bold text-red-400">Guardias COED Municipal 24/7</span>
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
