// frontend/src/locales/edan_i18n.ts
/**
 * Diccionario Etnolingüístico Oficial para el Pre-Padrón Digital EDAN (AMARU-DAMNIFICADOS)
 * Conforme a:
 * - Ley N.° 29735 (Uso y difusión de Lenguas Originarias del Perú)
 * - D.S. N.° 009-2021-MC (Mapa Etnolingüístico del Perú - RENALIO Tomos I y II)
 * - Manual EDAN v2 / INDECI y Ley N.° 31526 (Bono BAE de S/ 500)
 */

export type IdiomaCodigo = "es" | "qu_chanka" | "qu_collao" | "qu_ancash" | "aymara";

export interface IdiomaInfo {
    id: IdiomaCodigo;
    nombre: string;
    nombreNativo: string;
    variante: string;
    isoCode: string;
    regionPredominante: string;
    banderaIcono: string;
}

export const IDIOMAS_SOPORTADOS: Record<IdiomaCodigo, IdiomaInfo> = {
    es: {
        id: "es",
        nombre: "Castellano",
        nombreNativo: "Castellano Llano",
        variante: "Español Comunitario",
        isoCode: "es-PE",
        regionPredominante: "Costa y zonas urbanas",
        banderaIcono: "🇵🇪"
    },
    qu_chanka: {
        id: "qu_chanka",
        nombre: "Quechua Chanka",
        nombreNativo: "Runasimi Chanka",
        variante: "Quechua II-C (Ayacucho, Huancavelica, Apurímac)",
        isoCode: "qu-PE",
        regionPredominante: "Ayacucho / Huancavelica / Apurímac",
        banderaIcono: "🌾"
    },
    qu_collao: {
        id: "qu_collao",
        nombre: "Quechua Collao",
        nombreNativo: "Runasimi Qusqu-Qullaw",
        variante: "Quechua II-C (Cusco, Puno, Moquegua, Arequipa alta)",
        isoCode: "qul-PE",
        regionPredominante: "Cusco / Puno / Apurímac Sur",
        banderaIcono: "☀️"
    },
    qu_ancash: {
        id: "qu_ancash",
        nombre: "Quechua Áncash",
        nombreNativo: "Runasimi Huáyhuash",
        variante: "Quechua I (Callejón de Huaylas, Conchucos, Huánuco)",
        isoCode: "qwh-PE",
        regionPredominante: "Áncash / Cuenca del Río Santa",
        banderaIcono: "🏔️"
    },
    aymara: {
        id: "aymara",
        nombre: "Aymara",
        nombreNativo: "Aymar Aru",
        variante: "Aymara Altiplánico (Puno, Tacna, Moquegua)",
        isoCode: "ayr-PE",
        regionPredominante: "Puno / Cuenca del Lago Titicaca",
        banderaIcono: "🦙"
    }
};

export interface TraduccionPrePadron {
    // Cabecera de la sección
    tituloSeccion: string;
    subtituloSeccion: string;
    etiquetaBonoBae: string;
    descripcionLey: string;

    // Datos del Jefe de Hogar
    tituloJefeHogar: string;
    dniLabel: string;
    dniPlaceholder: string;
    nombresLabel: string;
    nombresPlaceholder: string;
    apellidosLabel: string;
    apellidosPlaceholder: string;
    telefonoLabel: string;
    telefonoPlaceholder: string;
    lenguaMaternaLabel: string;
    requiereAsistenciaBilingueLabel: string;

    // Características de la Vivienda
    materialMurosLabel: string;
    opcionMurosAdobe: string;
    opcionMurosLadrillo: string;
    opcionMurosMadera: string;
    opcionMurosEstera: string;

    materialTechoLabel: string;
    opcionTechoCalamina: string;
    opcionTechoConcreto: string;
    opcionTechoEsteras: string;
    opcionTechoTejas: string;

    estadoDanoLabel: string;
    opcionDanoInhabitable: string;
    opcionDanoColapsada: string;
    opcionDanoAfectada: string;

    // Tirante de agua
    tiranteAguaLabel: string;
    tiranteTobillo: string;
    tiranteRodilla: string;
    tiranteCintura: string;
    tiranteTecho: string;

    // Composición Familiar
    composicionFamiliarLabel: string;
    totalMiembros: string;
    ninos5: string;
    adultos65: string;
    gestantes: string;
    discapacidad: string;

    // Testimonio y Voz
    descripcionTestimonioLabel: string;
    testimonioPlaceholder: string;
    botonGrabarVoz: string;
    botonPausarVoz: string;
    botonEscucharGrabacion: string;
    botonDescartarAudio: string;
    notaAudioGrabado: string;

    // Envío y Cifrado
    botonEnviar: string;
    botonEnviando: string;

    // Comprobante CUP-DAMN
    comprobanteTitulo: string;
    comprobanteSubtitulo: string;
    cupLabel: string;
    cupLeyenda: string;
    preClasificacionLabel: string;
    scoreTerritorialLabel: string;
    bonoBaeElegibleTitulo: string;
    bonoBaeNoElegibleTitulo: string;
    bonoBaeElegibleDesc: string;
    bonoBaeNoElegibleDesc: string;
    asistenciaHumanitariaTitulo: string;
    avisoDefensaCivil: string;
    compartirWhatsapp: string;
    compartirTelegram: string;
    cerrarBoton: string;
}

export const DICCIONARIO_EDAN: Record<IdiomaCodigo, TraduccionPrePadron> = {
    es: {
        tituloSeccion: "📋 Declarar Daños en Vivienda / Solicitar Pre-Padrón EDAN",
        subtituloSeccion: "Pre-empadronamiento para canalizar ayuda humanitaria y el Bono BAE de S/ 500.",
        etiquetaBonoBae: "Bono BAE S/ 500",
        descripcionLey: "Marque esta casilla si su vivienda se encuentra anegada, inhabitable o colapsada. Sus datos se aislarán bajo Cero-PII (CUP-DAMN) conforme a la Ley N.° 29733 para tramitar víveres, carpas y el subsidio mensual (Ley N.° 31526).",
        
        tituloJefeHogar: "Datos del Jefe o Jefa de Hogar:",
        dniLabel: "DNI Jefe(a) Hogar: *",
        dniPlaceholder: "8 dígitos",
        nombresLabel: "Nombres: *",
        nombresPlaceholder: "Nombres completos",
        apellidosLabel: "Apellidos: *",
        apellidosPlaceholder: "Apellidos completos",
        telefonoLabel: "Teléfono Celular: *",
        telefonoPlaceholder: "9 dígitos de contacto",
        lenguaMaternaLabel: "Lengua materna o de uso en el hogar:",
        requiereAsistenciaBilingueLabel: "Solicito que el evaluador de Defensa Civil hable mi lengua originaria",

        materialMurosLabel: "Material predominante de los muros:",
        opcionMurosAdobe: "Adobe / Quincha / Tapial (Vulnerable a disolución)",
        opcionMurosLadrillo: "Ladrillo / Concreto / Cemento",
        opcionMurosMadera: "Madera / Triplay / Cartón prensado",
        opcionMurosEstera: "Estera / Plástico / Rústico",

        materialTechoLabel: "Material predominante del techo:",
        opcionTechoCalamina: "Calamina metálica / Fibrocemento",
        opcionTechoConcreto: "Concreto armado / Aligerado",
        opcionTechoEsteras: "Esteras / Manta plástica",
        opcionTechoTejas: "Tejas / Caña / Paja / Ichu",

        estadoDanoLabel: "Daño aparente en la vivienda:",
        opcionDanoInhabitable: "Inhabitable (Paredes humedecidas, barro dentro, sin enseres)",
        opcionDanoColapsada: "Colapsada / Destruida (Muros caídos, arrastre aluvial total)",
        opcionDanoAfectada: "Afectada Leve (Agua en patio o calle, estructura habitable)",

        tiranteAguaLabel: "Nivel alcanzado por el agua o lodo:",
        tiranteTobillo: "Tobillo (~20 cm) - Afectación leve",
        tiranteRodilla: "Rodilla (~50 cm) - Muros saturados",
        tiranteCintura: "Cintura (~100 cm) - Inhabitable",
        tiranteTecho: "Techo (~200 cm o más) - Colapso inminente",

        composicionFamiliarLabel: "Composición Familiar & Personas Vulnerables en el Hogar:",
        totalMiembros: "Total Miembros",
        ninos5: "Niños < 5 años",
        adultos65: "Adultos > 65",
        gestantes: "Gestantes",
        discapacidad: "Discapacidad",

        descripcionTestimonioLabel: "Descripción o relato de lo ocurrido:",
        testimonioPlaceholder: "Describa cómo subió el agua, qué quebrada se desbordó o qué pérdidas sufrió su familia...",
        botonGrabarVoz: "🎤 Grabar testimonio por voz (Audio)",
        botonPausarVoz: "⏹️ Detener grabación",
        botonEscucharGrabacion: "▶️ Escuchar mi testimonio grabado",
        botonDescartarAudio: "🗑️ Borrar y grabar de nuevo",
        notaAudioGrabado: "Audio grabado y protegido bajo hash criptográfico SHA-256.",

        botonEnviar: "Enviar Pre-Padrón Bajo Custodia Segura COED-AMARU",
        botonEnviando: "Cifrando y Ejecutando Peritaje Forense IA...",

        comprobanteTitulo: "Constancia de Pre-Empadronamiento Digital EDAN",
        comprobanteSubtitulo: "Ley N.° 29664 (SINAGERD) • Ley N.° 31526 (Bono BAE) • Bóveda Zero-PII Ley N.° 29733",
        cupLabel: "Código Único de Poblador Damnificado (CUP-DAMN)",
        cupLeyenda: "Guarde este código. Su identidad se encuentra cifrada bajo AES-256 en la Bóveda Soberana.",
        preClasificacionLabel: "Pre-Clasificación Oficial:",
        scoreTerritorialLabel: "Score Consistencia Territorial:",
        bonoBaeElegibleTitulo: "ELEGIBLE TÉCNICAMENTE PARA BONO BAE (S/ 500 MENSUALES)",
        bonoBaeNoElegibleTitulo: "Condición Actual: Afectación Leve (Sin Bono BAE)",
        bonoBaeElegibleDesc: "Cumple los criterios del D.S. N.° 008-2022-VIVIENDA para subsidio de arrendamiento por hasta 2 años.",
        bonoBaeNoElegibleDesc: "Se canalizará entrega de kits de herramientas y motobombas de achique municipal.",
        asistenciaHumanitariaTitulo: "Asistencia Técnica Humanitaria Programada:",
        avisoDefensaCivil: "Un evaluador acreditado de Defensa Civil validará su caso en el sistema SINPAD para la entrega de carpas, víveres y el trámite del Bono BAE.",
        compartirWhatsapp: "Compartir Constancia por WhatsApp",
        compartirTelegram: "Compartir por Telegram",
        cerrarBoton: "Cerrar Constancia"
    },

    qu_chanka: {
        tituloSeccion: "📋 Llakisqa Ayllukuna Qillqay / Bono BAE Mañakuy (EDAN)",
        subtituloSeccion: "Sinchi llakipi kaq ayllukunapaq yanapaykuna chaskiy (S/ 500 killachaw).",
        etiquetaBonoBae: "Bono BAE S/ 500",
        descripcionLey: "Kay casilla-ta ñit'iy wasiyki qollusqa, chinkasqa utaq yakupa chawpinpi kaptin. Sutiykikunaqa Zero-PII (CUP-DAMN) nisqawan amachasqam kanqa, Ley N.° 29733 kamachisqanman jina.",

        tituloJefeHogar: "Wasi Umalliqpa Sutinkuna:",
        dniLabel: "Wasi Umalliqpa DNI Yupin: *",
        dniPlaceholder: "8 yupikuna",
        nombresLabel: "Sutiykikuna: *",
        nombresPlaceholder: "Llapanta qillqay",
        apellidosLabel: "Ayllu Sutiykikuna: *",
        apellidosPlaceholder: "Taytamamapa sutin",
        telefonoLabel: "Karu rimana (Celular): *",
        telefonoPlaceholder: "9 yupikuna rimanakunapaq",
        lenguaMaternaLabel: "Wasipi rimasqayki kikin simi:",
        requiereAsistenciaBilingueLabel: "Munani yanapaq hamuq runa Runasimi Chankapi rimawananta",

        materialMurosLabel: "Wasipa pirqan imawan rurasqa:",
        opcionMurosAdobe: "Tika / Qunqur / Tapial (Yakupi lluchkaq, p'akisqa)",
        opcionMurosLadrillo: "Ladrillo / Semento / Rumi pirqa",
        opcionMurosMadera: "K'aspi / Triplay / Tabla",
        opcionMurosEstera: "Isteras / Plastiko / Chala",

        materialTechoLabel: "Wasipa qatan (techon) imawan rurasqa:",
        opcionTechoCalamina: "Kalamina / Llat'an lata",
        opcionTechoConcreto: "Semento techo / Allichasqa",
        opcionTechoEsteras: "Plastiko manta / Istera",
        opcionTechoTejas: "Teja rumi / Ichu / Chhala",

        estadoDanoLabel: "Wasiki imaynam kachkan kunan:",
        opcionDanoInhabitable: "Mana tiyana (Wasi hunt'a mituwan, pirqakuna nuyusqa)",
        opcionDanoColapsada: "Llapallan tuñisqa / Qollusqa (Yakupas mitupas aparqun)",
        opcionDanoAfectada: "Pisi daño (Patiopi yaku kachkan, wasipiqa tiyakunmi)",

        tiranteAguaLabel: "Yaku haykapikamam wicharqan:",
        tiranteTobillo: "Chaki senqakama (~20 cm) - Pisi yaku",
        tiranteRodilla: "Qonqorkama (~50 cm) - Tika wasi nuyusqa",
        tiranteCintura: "Wiqawkama (~100 cm) - Mana tiyana",
        tiranteTecho: "Wasipa qatankama (~200 cm) - Tuñikuy patanpi",

        composicionFamiliarLabel: "Wasiypi kaq runakuna & Llakipi kaqkuna:",
        totalMiembros: "Llapan Runakuna",
        ninos5: "Wawakuna (< 5 wata)",
        adultos65: "Machukuna / Payakuna (> 65)",
        gestantes: "Chichu warmikuna",
        discapacidad: "Mana puriqkuna",

        descripcionTestimonioLabel: "Willakuy: Imataq pasarqan wasiykipi:",
        testimonioPlaceholder: "Willaway imaynam lloqlla yaykumurqan, maymanta yaku hamurqan, imakunata chinkachirqankichik...",
        botonGrabarVoz: "🎤 Kunkaykiwan willakuyta grabay (Audio)",
        botonPausarVoz: "⏹️ Grabasqaykita sayachiy",
        botonEscucharGrabacion: "▶️ Rimasqaykita uyariy",
        botonDescartarAudio: "🗑️ Pichay hinaspa mosoqmanta rimay",
        notaAudioGrabado: "Rimasqayki audioqa amachasqam kachkan (SHA-256).",

        botonEnviar: "Pre-Padrón Willakuyta Kacha COED-AMARU Wasiman",
        botonEnviando: "Cifraspa Peritaje Forense IA rurachkan...",

        comprobanteTitulo: "EDAN Llakisqa Ayllukuna Qillqasqa Willakuy",
        comprobanteSubtitulo: "Ley N.° 29664 (SINAGERD) • Ley N.° 31526 (Bono BAE S/ 500) • Zero-PII Amachasqa",
        cupLabel: "Llakisqa Runapa Sapan Yupin (CUP-DAMN)",
        cupLeyenda: "Kay yupita allinta waqaychay. Sutiykikunaqa AES-256 bovedapi amachasqam kachkan.",
        preClasificacionLabel: "Wasipa Kamachisqa Kaynin:",
        scoreTerritorialLabel: "Allpa Consistencia Score:",
        bonoBaeElegibleTitulo: "BONO BAE S/ 500 CHASKINAPAQ LLALLIQMI KANKI",
        bonoBaeNoElegibleTitulo: "Kunanqa: Pisi dañasqa (Manaraqmi Bono BAE kanchu)",
        bonoBaeElegibleDesc: "D.S. N.° 008-2022-VIVIENDA kamachikuywan wasi arriendopaq qullqi yanapayta chaskinki.",
        bonoBaeNoElegibleDesc: "Municipalidadmi motobomba hinaspa herramientakunata apamunqa.",
        asistenciaHumanitariaTitulo: "Ayllupaq Utqaylla Yanapaykuna:",
        avisoDefensaCivil: "Defensa Civilmanta yachaq runa watukamusunkiku wasiykita qawanapaq, karpakuna mikhuykuna chaskikunapaq.",
        compartirWhatsapp: "Kay Willakuyta WhatsApp-pi Kawaykuy",
        compartirTelegram: "Telegram-pi Kawaykuy",
        cerrarBoton: "Wichqay"
    },

    qu_collao: {
        tituloSeccion: "📋 Llakisqa Wasi Ayllukuna Qillqay / Bono BAE (EDAN)",
        subtituloSeccion: "Lloqllawan, unupi kaq ayllukunapaq yanapa chaskina (S/ 500 sapa killa).",
        etiquetaBonoBae: "Bono BAE S/ 500",
        descripcionLey: "Kaypi marcay wasiyki unupi lloqllapi chinkasqa kaptin. Sutiykiqa Zero-PII (CUP-DAMN) bovedapi allin waqaychasqan kanqa Ley 29733 kamachiyninwan.",

        tituloJefeHogar: "Wasi Uma Runapa Sutinkuna:",
        dniLabel: "Wasi Umalliq DNI: *",
        dniPlaceholder: "8 yupaykuna",
        nombresLabel: "Sutikuna: *",
        nombresPlaceholder: "Sutiykikunata qillqay",
        apellidosLabel: "Ayllu Sutikuna: *",
        apellidosPlaceholder: "Taytamama sutikuna",
        telefonoLabel: "Celular yupay: *",
        telefonoPlaceholder: "9 yupay rimanakunapaq",
        lenguaMaternaLabel: "Wasipi rimasqa mama simi:",
        requiereAsistenciaBilingueLabel: "Runasimi Qullawpi rimawaq evaluadorta munani",

        materialMurosLabel: "Wasi pirqa imallamanta:",
        opcionMurosAdobe: "Tika / Quincha / Allpa pirqa (Unupi tuñiq)",
        opcionMurosLadrillo: "Ladrillo / Semento rumi",
        opcionMurosMadera: "K'aspi / Madera tablakuna",
        opcionMurosEstera: "Istira / Manta plastico",

        materialTechoLabel: "Wasipa pata qatan:",
        opcionTechoCalamina: "Qala mina (Lata qata)",
        opcionTechoConcreto: "Concreto / Semento qata",
        opcionTechoEsteras: "Plastico / Istira qata",
        opcionTechoTejas: "Teja / Ichu / Paja qata",

        estadoDanoLabel: "Wasi imayna dañasqan kachkan:",
        opcionDanoInhabitable: "Mana tiyakunachu (Wasi hunt'a mituwan, pirqakuna nuyusqa)",
        opcionDanoColapsada: "Llapallan urmasqa / Tuñisqa (Mayu llapanta aparqun)",
        opcionDanoAfectada: "Pisi daño (Patiollapi unucha, wasipi tiyakunman)",

        tiranteAguaLabel: "Hayk'akama yaku wicharqan:",
        tiranteTobillo: "Chaki senqakama (~20 cm) - Pisi yaku",
        tiranteRodilla: "Qunqurkama (~50 cm) - Tika pirqa nuyusqa",
        tiranteCintura: "Wiqawkama (~100 cm) - Mana tiyakunachu",
        tiranteTecho: "Wasipa patankama (~200 cm) - Wasi urmasqa",

        composicionFamiliarLabel: "Wasiypi kaq runakuna & Llakipi kaqkuna:",
        totalMiembros: "Llapan Runakuna",
        ninos5: "Erqekuna (< 5 wata)",
        adultos65: "Machu / Paya runakuna (> 65)",
        gestantes: "Chichu warmikuna",
        discapacidad: "Mana puriq runakuna",

        descripcionTestimonioLabel: "Willakuy: Imataq pasarqan wasiykipi:",
        testimonioPlaceholder: "Willaway imaynatam mayu o lloqlla hunt'aykamurqan, imakunatan chinkachirqankichis...",
        botonGrabarVoz: "🎤 Kunkaykiwan willakuyta grabay (Audio)",
        botonPausarVoz: "⏹️ Grabasqaykita sayachiy",
        botonEscucharGrabacion: "▶️ Rimasqaykita uyariy",
        botonDescartarAudio: "🗑️ Pichay hinaspa kaqmanta rimay",
        notaAudioGrabado: "Rimasqayki audioqa amachasqam kachkan (SHA-256).",

        botonEnviar: "Pre-Padrón Willakuyta Kacha COED-AMARU-man",
        botonEnviando: "Cifraspa Peritaje Forense IA rurachkan...",

        comprobanteTitulo: "EDAN Llakisqa Ayllukuna Qillqasqa Willakuy",
        comprobanteSubtitulo: "Ley N.° 29664 (SINAGERD) • Ley N.° 31526 (Bono BAE) • Bóveda Zero-PII",
        cupLabel: "Sapan Yupiyki (CUP-DAMN)",
        cupLeyenda: "Kay yupita allinta waqaychay. Sutiykiqa AES-256 bovedapi amachasqam.",
        preClasificacionLabel: "Wasipa Kamachisqa Kaynin:",
        scoreTerritorialLabel: "Consistencia Territorial Score:",
        bonoBaeElegibleTitulo: "BONO BAE (S/ 500 SAPA KILLA) CHASKINAPAQ LLALLIQMI KANKI",
        bonoBaeNoElegibleTitulo: "Kunanqa: Pisi daño (Manaraq Bono BAE kanchu)",
        bonoBaeElegibleDesc: "D.S. N.° 008-2022-VIVIENDA kamachiyman jina wasi alquilernapaq qullqi chaskinki.",
        bonoBaeNoElegibleDesc: "Municipalidadmi herramientakunata motobombakunata apamunqa.",
        asistenciaHumanitariaTitulo: "Ayllupaq Yanapaykuna Chaskina:",
        avisoDefensaCivil: "Defensa Civilmanta evaluador watukamusunkichismi wasiykita qawanapaq, karpakuna mikhunakuna aypunapaq.",
        compartirWhatsapp: "Kay Willakuyta WhatsApp-pi Kawaykuy",
        compartirTelegram: "Telegram-pi Willakuy",
        cerrarBoton: "Wichqay"
    },

    qu_ancash: {
        tituloSeccion: "📋 Llakishqa Ayllukuna Qillqay / Bono BAE Mañakuy (EDAN)",
        subtituloSeccion: "Río Santa wan lloqllawan dañasqa ayllukunapaq yanapay chaskina (S/ 500 killachaw).",
        etiquetaBonoBae: "Bono BAE S/ 500",
        descripcionLey: "Kayta ñitiy wayiki allpa lluchkaywan o yakupawan ushakaptin. Shutikikunaqa Zero-PII (CUP-DAMN) bovedachaw amparashqam kanqa Ley 29733 nishqanno.",

        tituloJefeHogar: "Wayi Umalliypa Shutinkuna:",
        dniLabel: "Wayi Umalliqpa DNI Yupin: *",
        dniPlaceholder: "8 yupikuna",
        nombresLabel: "Shutikikuna: *",
        nombresPlaceholder: "Llapanta qillqay",
        apellidosLabel: "Ayllu Shutikikuna: *",
        apellidosPlaceholder: "Mamata taytapa shutin",
        telefonoLabel: "Karu rimana (Celular): *",
        telefonoPlaceholder: "9 yupikuna",
        lenguaMaternaLabel: "Wayichaw rimaq mama shimi:",
        requiereAsistenciaBilingueLabel: "Munä Quechua Ancashinota rimaq evaluadorta",

        materialMurosLabel: "Wayipa pirqan imawan rurashqa:",
        opcionMurosAdobe: "Tika / Quincha / Tapial (Yakuchaw shikwaq)",
        opcionMurosLadrillo: "Ladrillo / Semento rumi",
        opcionMurosMadera: "K'aspi / Madera tabla",
        opcionMurosEstera: "Istira / Plastiko",

        materialTechoLabel: "Wayipa janan qatan:",
        opcionTechoCalamina: "Qala mina lata",
        opcionTechoConcreto: "Concreto / Semento techo",
        opcionTechoEsteras: "Plastiko / Istira",
        opcionTechoTejas: "Teja / Tsatsa / Ichu",

        estadoDanoLabel: "Wayiki imano karkan:",
        opcionDanoInhabitable: "Mana täkuy atina (Washi mituwan hunt'a, pirqakuna nuyushqa)",
        opcionDanoColapsada: "Llapallan shikwashqa / Qollushqa (Yakum llapanta aparqon)",
        opcionDanoAfectada: "Pishi dañasqa (Patiullachaw yaku, wayichaw täkuyta atinkim)",

        tiranteAguaLabel: "Mayqayaq yaku charqan:",
        tiranteTobillo: "Chaki senqayaq (~20 cm) - Pishi yaku",
        tiranteRodilla: "Qonqoryaq (~50 cm) - Tika pirqa nuyushqa",
        tiranteCintura: "Choqlluyaq (~100 cm) - Mana täkuy atina",
        tiranteTecho: "Wayipa jananyaq (~200 cm) - Wayi shikwashqa",

        composicionFamiliarLabel: "Wayichaw kaq runakuna & Llakipi kaqkuna:",
        totalMiembros: "Llapan Runakuna",
        ninos5: "Wamrakuna (< 5 wata)",
        adultos65: "Awkinkuna / Chonakuna (> 65)",
        gestantes: "Qeshyaq warmikuna",
        discapacidad: "Mana puriqkuna",

        descripcionTestimonioLabel: "Willakuy: Imanotaq wayikichaw karqan:",
        testimonioPlaceholder: "Willamay imano yaku yaykamorqan, ima mayutaq pasamorqan, imakunatataq oqrarqonki...",
        botonGrabarVoz: "🎤 Kunkikawan willakuyta grabay (Audio)",
        botonPausarVoz: "⏹️ Sayatsiy grabacionta",
        botonEscucharGrabacion: "▶️ Rimarqoykita wiyay",
        botonDescartarAudio: "🗑️ Pitsay y yapay rimay",
        notaAudioGrabado: "Rimarqoyki audioqa amparashqam karkan (SHA-256).",

        botonEnviar: "Pre-Padrón Willakuyta Kacha COED-AMARU-man",
        botonEnviando: "Peritaje Forense IA rurakanmi...",

        comprobanteTitulo: "EDAN Llakishqa Ayllukuna Qillqashqa Willakuy",
        comprobanteSubtitulo: "Ley N.° 29664 (SINAGERD) • Ley N.° 31526 (Bono BAE) • Bóveda Zero-PII",
        cupLabel: "Sapan Yupiki (CUP-DAMN)",
        cupLeyenda: "Kay yupita allita katsikuy. Shutikiqa AES-256 bovedachaw amparashqam.",
        preClasificacionLabel: "Wayipa Kamachishqa Kaynin:",
        scoreTerritorialLabel: "Consistencia Territorial:",
        bonoBaeElegibleTitulo: "BONO BAE (S/ 500 KILLACHAW) CHASKINAPAQ LLALLIQMI KANKI",
        bonoBaeNoElegibleTitulo: "Kunan: Pishi dañasqa (Manaraq Bono BAE kantsu)",
        bonoBaeElegibleDesc: "D.S. N.° 008-2022-VIVIENDA kamatsiyman jina wayi arrendonapaq qellqita chaskinki.",
        bonoBaeNoElegibleDesc: "Municipalidadmi herramientakunata motobombata apamonqa.",
        asistenciaHumanitariaTitulo: "Ayllupaq Yanapaykuna Chaskina:",
        avisoDefensaCivil: "Defensa Civilmanta evaluador shamunqa wayikita rikaanampaq, karpakuna mikuykunata qonampaq.",
        compartirWhatsapp: "Kay Willakuyta WhatsApp-chaw Qawakuy",
        compartirTelegram: "Telegram-chaw Qawakuy",
        cerrarBoton: "Witsqay"
    },

    aymara: {
        tituloSeccion: "📋 Usuchjata Wilanakaru Qillqaña / Bono BAE Mayiña (EDAN)",
        subtituloSeccion: "Uma phukhtampi jallumpi usuchjata wilanakataki yanapa (S/ 500 sapa phaxsi).",
        etiquetaBonoBae: "Bono BAE S/ 500",
        descripcionLey: "Akharu chimpuntam utama liwqita, umampi chhaqata ukhaxa. Sutinakaxa Zero-PII (CUP-DAMN) bovedana imt'atawa Ley N.° 29733 kamachirjama.",

        tituloJefeHogar: "Uta P'iqinchan Sutinaka:",
        dniLabel: "Uta P'iqinchan DNI Jakhu: *",
        dniPlaceholder: "8 jakhunaka",
        nombresLabel: "Sutinaka: *",
        nombresPlaceholder: "Taqpacha sutinak qillqam",
        apellidosLabel: "Wila Sutinaka: *",
        apellidosPlaceholder: "Awki taykan sutinaka",
        telefonoLabel: "Karu rimana (Celular): *",
        telefonoPlaceholder: "9 jakhu aruskipañataki",
        lenguaMaternaLabel: "Utan arsuta tayka aru:",
        requiereAsistenciaBilingueLabel: "Aymar aruta arst'iri evaluador maytha",

        materialMurosLabel: "Utan pirqapa kawkits lurt'ata:",
        opcionMurosAdobe: "T'uru tika / Quincha / Tapial (Uman liwqiri)",
        opcionMurosLadrillo: "Ladrillo / Semento qala",
        opcionMurosMadera: "Lawasa / Madera tabla",
        opcionMurosEstera: "Istira / Plastiku manta",

        materialTechoLabel: "Utan pata tapapa (techo):",
        opcionTechoCalamina: "Kalamina ch'ankha lata",
        opcionTechoConcreto: "Concreto / Semento ch'uxña",
        opcionTechoEsteras: "Plastiku / Istira tapa",
        opcionTechoTejas: "Tiha / Jichhu / Ch'illiwa",

        estadoDanoLabel: "Utaxa kunjamakisa jichhaxa:",
        opcionDanoInhabitable: "Jan jakaskaña (Utan ñiq'i hunt'ata, pirqanaka ch'arani)",
        opcionDanoColapsada: "Taqpacha liwqita / T'unjata (Jawirampi taqpach chhaqayata)",
        opcionDanoAfectada: "Juk'a usuchjata (Utan patapankiw uma, utana jakasispawa)",

        tiranteAguaLabel: "Kawkhakamisa umaxa makhatatayna:",
        tiranteTobillo: "Kayu mukurukama (~20 cm) - Juk'a uma",
        tiranteRodilla: "Qunqurikama (~50 cm) - T'uru tika pirqa ch'arani",
        tiranteCintura: "Wila ch'akhakama (~100 cm) - Jan jakaskaña",
        tiranteTecho: "Utan patapakam (~200 cm) - Uta liwqita",

        composicionFamiliarLabel: "Utankiri jaqinaka & Usuchjata jilat kullakanaka:",
        totalMiembros: "Taqpacha Jaqinaka",
        ninos5: "Wawanaka (< 5 marani)",
        adultos65: "Achachilanaka / Awichanaka (> 65)",
        gestantes: "Usuri warminaka",
        discapacidad: "Jan sarnaqir jaqinaka",

        descripcionTestimonioLabel: "Yatiyawi: Kunasa utaman utjawayi:",
        testimonioPlaceholder: "Yatiyapxita kunjamasa umaxa mantani, kawkiri jawirasa phukhtani, kunanaksa chhaqayapxta...",
        botonGrabarVoz: "🎤 Arukiwimpi yatiyawi grabayaña (Audio)",
        botonPausarVoz: "⏹️ Grabaña sayt'ayaña",
        botonEscucharGrabacion: "▶️ Arsutamaxa ist'aña",
        botonDescartarAudio: "🗑️ Phitayaña ukat mayampi arsuña",
        notaAudioGrabado: "Arsutamaxa SHA-256 amparampi imt'atawa.",

        botonEnviar: "Pre-Padrón Yatiyawi COED-AMARU Utaru Khitaña",
        botonEnviando: "Cifrasisa Peritaje Forense IA luraskiwa...",

        comprobanteTitulo: "EDAN Usuchjata Wilanaka Qillqata Yatiyawi",
        comprobanteSubtitulo: "Ley N.° 29664 (SINAGERD) • Ley N.° 31526 (Bono BAE) • Bóveda Zero-PII Ley N.° 29733",
        cupLabel: "Sapan Jakhumaxa (CUP-DAMN)",
        cupLeyenda: "Aka jakhu allin imxatam. Sutimaxa AES-256 bovedan jark'aqatawa.",
        preClasificacionLabel: "Utan Kamachita Jakhuwipa:",
        scoreTerritorialLabel: "Consistencia Territorial Score:",
        bonoBaeElegibleTitulo: "BONO BAE (S/ 500 SAPA PHAXSI) KATOQAÑATAKI LLALLIQÏTAWA",
        bonoBaeNoElegibleTitulo: "Jichhaxa: Juk'a dañado (Janira Bono BAE utjkiti)",
        bonoBaeElegibleDesc: "D.S. N.° 008-2022-VIVIENDA kamachirjama uta alqilanataki qullqi katoqatawa.",
        bonoBaeNoElegibleDesc: "Municipalidadax motobomba ukat yänaka apanini.",
        asistenciaHumanitariaTitulo: "Wilanakataki Utjiri Yanapanaka:",
        avisoDefensaCivil: "Defensa Civilan evaluadorpaxa utamar sarani uñjirï, karpanaka manq'anaka churañataki.",
        compartirWhatsapp: "Aka Yatiyawi WhatsApp-na Uñjasiyaña",
        compartirTelegram: "Telegram-na Uñjasiyaña",
        cerrarBoton: "Jist'antaña"
    }
};
