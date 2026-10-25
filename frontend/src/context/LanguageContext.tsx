"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type Language = "es" | "en" | "qu" | "ay";

export interface Translations {
  [key: string]: {
    es: string;
    en: string;
    qu?: string;
    ay?: string;
  };
}

export const DICTIONARY: Translations = {
  // Header & Brand
  app_title: {
    es: "AMARU-CLIMATE",
    en: "AMARU-GLOBAL",
    qu: "AMARU-PACHAMAMA",
    ay: "AMARU-PACHAMAMA"
  },
  app_subtitle: {
    es: "Prototipo C2 & Notaría de Prueba de Concepto",
    en: "Working Prototype & Proof-of-Concept C2 Notary",
    qu: "Chani llapan llakiypi kamachina chakra chaski",
    ay: "Pacha llaki yanapaña amuyt'awi uta"
  },
  search_c2: {
    es: "Buscador C2...",
    en: "C2 Search...",
    qu: "Maskay C2...",
    ay: "Thaqaña C2..."
  },
  
  // Ecosistema Tripartito Header Switcher
  wfp_perspective: {
    es: "🌾 Semilla WFP 2026",
    en: "🌾 WFP 2026 Seed",
    qu: "🌾 WFP Muhu 2026",
    ay: "🌾 WFP Jatha 2026"
  },
  wfp_perspective_title: {
    es: "Semilla de Investigación I+D: Acción Anticipatoria EAP (WFP AFCIA LAC 2026)",
    en: "R&D Research Seed: Anticipatory Action Protocols (WFP AFCIA LAC 2026)",
    qu: "Yachay maskay muhu: EAP ñawpaq ruwaykuna (WFP 2026)",
    ay: "Yatxataña jatha: EAP nayra lurawinaka (WFP 2026)"
  },
  peru_perspective: {
    es: "🇵🇪 Perú Testbed",
    en: "🇵🇪 Peru Testbed",
    qu: "🇵🇪 Piruw Suyu",
    ay: "🇵🇪 Pirwa Suyu"
  },
  peru_perspective_title: {
    es: "Suite Territorial Soberana: SINAGERD, CENEPRED, INDECI & CGR (Perú Testbed)",
    en: "Sovereign Regional Testbed: High-Stress Andean-Pacific Sandbox",
    qu: "Piruw suyunchikpa kamachina llapan llakiynin",
    ay: "Markasan pacha llaki apnaqawi ch'ama"
  },
  ieee_perspective: {
    es: "🌍 IEEE Global (EW4All)",
    en: "🌍 IEEE Global (EW4All)",
    qu: "🌍 IEEE Tiksimuyu (EW4All)",
    ay: "🌍 IEEE Taqpacha (EW4All)"
  },
  ieee_perspective_title: {
    es: "Estándar Universal: UN-EW4All 6-Links, OASIS CAP v1.2, HITL & Polygon (IEEE ClimateChain 2026)",
    en: "Universal Standard: UN-EW4All 6 Links, OASIS CAP v1.2, HITL & Polygon EVM",
    qu: "Tukuy suyukunapaq chani qillqasqa (IEEE 2026)",
    ay: "Taqi markanakataki ch'ikhi qillqa (IEEE 2026)"
  },

  // Pilares Tripartitos Nav
  pillar_all: {
    es: "Todos",
    en: "All Modules",
    qu: "Llapanku",
    ay: "Taqpacha"
  },
  pillar_nacional: {
    es: "🌐 COED Nacional Amaru",
    en: "🌐 National C2 Hub",
    qu: "🌐 Mama Suyu COED",
    ay: "🌐 Markachata COED"
  },
  pillar_municipal: {
    es: "🏛️ COED Municipal Amaru",
    en: "🏛️ Municipal C2 Suite",
    qu: "🏛️ Kiti COED",
    ay: "🏛️ Jisk'a Marka COED"
  },
  pillar_social: {
    es: "👥 COED Social Amaru",
    en: "👥 Social & Citizen C2",
    qu: "👥 Ayllu COED (Ayni)",
    ay: "👥 Jaqi Jaqiraña COED"
  },
  pillar_gobernanza: {
    es: "⚖️ Gobernanza & Auditoría",
    en: "⚖️ Governance & WORM Audit",
    qu: "⚖️ Chaninchay & Taripay",
    ay: "⚖️ Chiqa Kankaña & Taripawi"
  },

  // Temporadas / Modos
  mode_el_nino: {
    es: "MODO EL NIÑO",
    en: "EL NIÑO MODE",
    qu: "NIÑO PARA MIT'A",
    ay: "NIÑO JALLU PACHA"
  },
  mode_la_nina: {
    es: "MODO LA NIÑA / HELADAS",
    en: "LA NIÑA / CRYOCLIMATE",
    qu: "QASA / CHIRI MIT'A",
    ay: "JUYPHI / CH'UÑU PACHA"
  },

  // Enlaces Principales NavLinks
  nav_alert_hub: {
    es: "Hub Alertas C2",
    en: "C2 Alerts Hub",
    qu: "Willakuykuna C2",
    ay: "Yatiyawi C2"
  },
  nav_mando_nacional: {
    es: "Mando C2 Nacional",
    en: "National C2 Command",
    qu: "Mama Suyu Kamachiq",
    ay: "Jach'a Kamachiwi"
  },
  nav_geovisor: {
    es: "Geovisor 3D",
    en: "3D Geovisor C2",
    qu: "Pacha Rikuchiq 3D",
    ay: "Uraqpacha Uñjawi 3D"
  },
  nav_meteo: {
    es: "Meteo Multi-Amenaza",
    en: "Multi-Hazard Weather",
    qu: "Wayra Para Musyay",
    ay: "Thaya Jallu Yatiwi"
  },
  nav_satelites: {
    es: "Satélites NASA",
    en: "NASA Earth Feeds",
    qu: "NASA Wankikuna",
    ay: "NASA Wankinaka"
  },
  nav_imarpe: {
    es: "IMARPE BDO",
    en: "Oceanic SST Buoys",
    qu: "Mama Qucha IMARPE",
    ay: "Jach'a Quta IMARPE"
  },
  nav_enfen: {
    es: "ENFEN Oficial",
    en: "ENFEN Official Watch",
    qu: "ENFEN Chiqaq",
    ay: "ENFEN Chiqapa"
  },
  nav_fluvial: {
    es: "Control Fluvial ANA",
    en: "River Hydrology SNIRH",
    qu: "Mayukuna Kamachiy",
    ay: "Jawas Jawira ANA"
  },
  nav_quebradas: {
    es: "Quebradas & Huaicos",
    en: "Flash Floods & Huaicos",
    qu: "Wayqukuna & Lloqllakuna",
    ay: "Chhuru & Lluqllinaka"
  },
  nav_simulacion: {
    es: "Simulación Mega-FEN",
    en: "Mega-ENSO Simulation",
    qu: "FEN Yachapayay",
    ay: "FEN Yant'awi"
  },
  nav_fuentes: {
    es: "Fuentes C2",
    en: "C2 Data Sources",
    qu: "Pukyukuna C2",
    ay: "Jalsu Qillqawi C2"
  },
  nav_incendios: {
    es: "Incendios Forestales",
    en: "Wildfire C2 Engine",
    qu: "Sacha Rawraykuna (FWI)",
    ay: "Quqa Nakantawinaka (FWI)"
  },
  nav_suite_municipal: {
    es: "Suite Municipal 360°",
    en: "Municipal 360° Suite",
    qu: "Kiti 360° Kamachiy",
    ay: "Jisk'a Marka 360°"
  },
  nav_polar_clock: {
    es: "Reloj Polar & EAP",
    en: "Tactical Polar Clock & EAP",
    qu: "Mit'a Intiwatana EAP",
    ay: "Pacha Pachawana EAP"
  },
  nav_inspector_distrital: {
    es: "Inspector Distrital",
    en: "District Inspector",
    qu: "Kiti Qhawaq",
    ay: "Marka Uñjiriri"
  },
  nav_ayni: {
    es: "AMARU-AYNI",
    en: "Citizen Solidarity Network",
    qu: "AMARU-AYNI (Yanapanakuy)",
    ay: "AMARU-AYNI (Yanapt'asiña)"
  },
  nav_reporte_ciudadano: {
    es: "Reporte Ciudadano",
    en: "Zero-PII Citizen Report",
    qu: "Runapa Willakuynin",
    ay: "Jaqi Yatiyawi"
  },
  nav_triaje_salud: {
    es: "Triaje Salud NTS-105",
    en: "Public Health Triage",
    qu: "Qhali Kay Akllay",
    ay: "K'umar Kankaña Ch'iqa"
  },
  nav_yachay: {
    es: "Saberes YACHAY",
    en: "Indigenous Knowledge",
    qu: "Naypa YACHAY (Willkakuna)",
    ay: "Nayra YATIÑANAKA"
  },
  nav_edan: {
    es: "Ficha EDAN v2",
    en: "Disaster Census (EDAN)",
    qu: "EDAN Llakisqa Qillqa",
    ay: "EDAN Llakita Qillqa"
  },
  nav_control_cgr: {
    es: "Control Concurrente",
    en: "Anti-Corruption Control",
    qu: "CGR Chaninchay",
    ay: "CGR Taripaña"
  },
  nav_audit_worm: {
    es: "Auditoría Forense",
    en: "Blockchain WORM Audit",
    qu: "Blockchain Sello Taripay",
    ay: "Blockchain Sello Uñstawi"
  },
  nav_fiscal: {
    es: "Fiscalización PP 0068",
    en: "Disaster Budget Audit",
    qu: "Qullqi Qillqay PP 0068",
    ay: "Qullqi Uñjaña PP 0068"
  },
  nav_lex: {
    es: "AMARU-LEX (51 Normas)",
    en: "Legal C2 Radar",
    qu: "Kamachikuna LEX",
    ay: "Kamachinaka LEX"
  },
  nav_matriz_sinagerd: {
    es: "Matriz SINAGERD & OMM",
    en: "WMO EW4All Architecture",
    qu: "SINAGERD & OMM Tantasqa",
    ay: "SINAGERD & OMM Wank'aña"
  },
  nav_hitl_gatekeeper: {
    es: "Puerta Soberana HITL",
    en: "HITL Sovereign Gatekeeper",
    qu: "Runaq Pukaran HITL",
    ay: "Jaqina Punkupa HITL"
  },

  // Consola de Incendios (/incendios)
  fires_badge_national: {
    es: "CONSOLA C2 NACIONAL • INCENDIOS FORESTALES",
    en: "NATIONAL C2 CONSOLE • WILDFIRE TACTICAL C2",
    qu: "MAMA SUYU KAMACHIQ • SACHA RAWRAYKUNA",
    ay: "JACH'A MARKA KAMACHIWI • QUQA NAKANTAWI"
  },
  fires_title: {
    es: "VIGILANCIA TÁCTICA DE FOCOS DE CALOR & ÍNDICE FWI",
    en: "TACTICAL SURVEILLANCE OF THERMAL HOTSPOTS & FWI INDEX",
    qu: "RUPHAY FOCOKUNA QHAWAY & FWI CHANI",
    ay: "LUP'I NAKANTAWINAKA UÑJAÑA & FWI CH'AMA"
  },
  fires_desc: {
    es: "Fusión en tiempo real de distritos expuestos, detección térmica satelital VIIRS (375m) / NASA FIRMS, Google Maps Platform 3D y perfil edáfico Open-Meteo Professional.",
    en: "Real-time fusion of fire-exposed districts, VIIRS (375m) / NASA FIRMS satellite thermal detection, Google Maps Platform 3D hybrid terrain, and Open-Meteo Pro soil moisture.",
    qu: "VIIRS (375m) NASA FIRMS kanchaywan sacha rawraykunata qhaway, allpa ch'akiy Open-Meteo yachaywan.",
    ay: "VIIRS (375m) NASA FIRMS wankimpi quqa nakantawinaka uñjaña, uraqi wañt'awi Open-Meteo yatiñampi."
  },

  // Textos Clave de Alertas e HITL
  hitl_title: {
    es: "Puerta Soberana de Aprobación Humana (HITL)",
    en: "Sovereign Human Approval Gatekeeper (HITL)",
    qu: "Runaq Chani Aprobacionnin (HITL)",
    ay: "Jaqina Iyawt'awipa (HITL)"
  },
  hitl_desc: {
    es: "Enclaustramiento cognitivo ético: Ninguna alerta se despacha automáticamente sin firma humana.",
    en: "Ethical Cognitive Caging: No alert is dispatched automatically without verified human digital signature.",
    qu: "Manam mayqin willakuypas runaq mana qillqasqanqa chayanmanchu.",
    ay: "Janiw kuna yatiyawipas jaqina jani qillqatampix t'ijt'kaspati."
  }
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  language: "es",
  setLanguage: () => {},
  toggleLanguage: () => {},
  t: (key: string) => key,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>("es");

  useEffect(() => {
    // 1. Detectar si viene con query param ?lang=en|es|qu|ay en la URL
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const urlLang = urlParams.get("lang") as Language;
      if (urlLang === "en" || urlLang === "es" || urlLang === "qu" || urlLang === "ay") {
        setLanguage(urlLang);
        localStorage.setItem("amaru_language", urlLang);
        return;
      }
    } catch (e) {
      // Ignorar en SSR
    }

    // 2. Si no viene en la URL, consultar localStorage
    const saved = localStorage.getItem("amaru_language") as Language;
    if (saved === "es" || saved === "en" || saved === "qu" || saved === "ay") {
      setLanguage(saved);
    }
  }, []);

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem("amaru_language", lang);
  };

  const toggleLanguage = () => {
    const cycle: Record<Language, Language> = {
      es: "en",
      en: "qu",
      qu: "ay",
      ay: "es"
    };
    handleSetLanguage(cycle[language] || "es");
  };

  const t = (key: string): string => {
    if (DICTIONARY[key]) {
      return (
        DICTIONARY[key][language] ||
        DICTIONARY[key]["es"] ||
        key
      );
    }
    return key;
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage: handleSetLanguage,
        toggleLanguage,
        t,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);
