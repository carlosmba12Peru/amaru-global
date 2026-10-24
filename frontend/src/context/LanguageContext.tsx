"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type Language = "es" | "en";

export interface Translations {
  [key: string]: {
    es: string;
    en: string;
  };
}

export const DICTIONARY: Translations = {
  // Header & Brand
  app_title: {
    es: "AMARU-CLIMATE",
    en: "AMARU-GLOBAL"
  },
  app_subtitle: {
    es: "Centro de Operaciones de Emergencia Digital",
    en: "Sovereign Multi-Agent C2 & UN-EW4All Notary"
  },
  search_c2: {
    es: "Buscador C2...",
    en: "C2 Search..."
  },
  
  // Ecosistema Tripartito Header Switcher
  wfp_perspective: {
    es: "🌾 Semilla WFP 2026",
    en: "🌾 WFP 2026 Seed"
  },
  wfp_perspective_title: {
    es: "Semilla de Investigación I+D: Acción Anticipatoria EAP (WFP AFCIA LAC 2026)",
    en: "R&D Research Seed: Anticipatory Action Protocols (WFP AFCIA LAC 2026)"
  },
  peru_perspective: {
    es: "🇵🇪 Perú Testbed",
    en: "🇵🇪 Peru Testbed"
  },
  peru_perspective_title: {
    es: "Suite Territorial Soberana: SINAGERD, CENEPRED, INDECI & CGR (Perú Testbed)",
    en: "Sovereign Regional Testbed: High-Stress Andean-Pacific Sandbox"
  },
  ieee_perspective: {
    es: "🌍 IEEE Global (EW4All)",
    en: "🌍 IEEE Global (EW4All)"
  },
  ieee_perspective_title: {
    es: "Estándar Universal: UN-EW4All 6-Links, OASIS CAP v1.2, HITL & Polygon (IEEE ClimateChain 2026)",
    en: "Universal Standard: UN-EW4All 6 Links, OASIS CAP v1.2, HITL & Polygon EVM"
  },

  // Pilares Tripartitos Nav
  pillar_all: {
    es: "Todos",
    en: "All Modules"
  },
  pillar_nacional: {
    es: "🌐 COED Nacional Amaru",
    en: "🌐 National C2 Hub"
  },
  pillar_municipal: {
    es: "🏛️ COED Municipal Amaru",
    en: "🏛️ Municipal C2 Suite"
  },
  pillar_social: {
    es: "👥 COED Social Amaru",
    en: "👥 Social & Citizen C2"
  },
  pillar_gobernanza: {
    es: "⚖️ Gobernanza & Auditoría",
    en: "⚖️ Governance & WORM Audit"
  },

  // Temporadas / Modos
  mode_el_nino: {
    es: "MODO EL NIÑO",
    en: "EL NIÑO MODE"
  },
  mode_la_nina: {
    es: "MODO LA NIÑA / HELADAS",
    en: "LA NIÑA / CRYOCLIMATE"
  },

  // Enlaces Principales NavLinks
  nav_alert_hub: {
    es: "Hub Alertas C2",
    en: "C2 Alerts Hub"
  },
  nav_mando_nacional: {
    es: "Mando C2 Nacional",
    en: "National C2 Command"
  },
  nav_geovisor: {
    es: "Geovisor 3D",
    en: "3D Geovisor C2"
  },
  nav_meteo: {
    es: "Meteo Multi-Amenaza",
    en: "Multi-Hazard Weather"
  },
  nav_satelites: {
    es: "Satélites NASA",
    en: "NASA Earth Feeds"
  },
  nav_imarpe: {
    es: "IMARPE BDO",
    en: "Oceanic SST Buoys"
  },
  nav_enfen: {
    es: "ENFEN Oficial",
    en: "ENFEN Official Watch"
  },
  nav_fluvial: {
    es: "Control Fluvial ANA",
    en: "River Hydrology SNIRH"
  },
  nav_quebradas: {
    es: "Quebradas & Huaicos",
    en: "Flash Floods & Huaicos"
  },
  nav_simulacion: {
    es: "Simulación Mega-FEN",
    en: "Mega-ENSO Simulation"
  },
  nav_fuentes: {
    es: "Fuentes C2",
    en: "C2 Data Sources"
  },
  nav_incendios: {
    es: "Incendios Forestales",
    en: "Wildfire C2 Engine"
  },
  nav_suite_municipal: {
    es: "Suite Municipal 360°",
    en: "Municipal 360° Suite"
  },
  nav_polar_clock: {
    es: "Reloj Polar & EAP",
    en: "Tactical Polar Clock & EAP"
  },
  nav_inspector_distrital: {
    es: "Inspector Distrital",
    en: "District Inspector"
  },
  nav_ayni: {
    es: "AMARU-AYNI",
    en: "Citizen Solidarity Network"
  },
  nav_reporte_ciudadano: {
    es: "Reporte Ciudadano",
    en: "Zero-PII Citizen Report"
  },
  nav_triaje_salud: {
    es: "Triaje Salud NTS-105",
    en: "Public Health Triage"
  },
  nav_yachay: {
    es: "Saberes YACHAY",
    en: "Indigenous Knowledge"
  },
  nav_edan: {
    es: "Ficha EDAN v2",
    en: "Disaster Census (EDAN)"
  },
  nav_control_cgr: {
    es: "Control Concurrente",
    en: "Anti-Corruption Control"
  },
  nav_audit_worm: {
    es: "Auditoría Forense",
    en: "Blockchain WORM Audit"
  },
  nav_fiscal: {
    es: "Fiscalización PP 0068",
    en: "Disaster Budget Audit"
  },
  nav_lex: {
    es: "AMARU-LEX (51 Normas)",
    en: "Legal C2 Radar"
  },
  nav_matriz_sinagerd: {
    es: "Matriz SINAGERD & OMM",
    en: "WMO EW4All Architecture"
  },
  nav_hitl_gatekeeper: {
    es: "Puerta Soberana HITL",
    en: "HITL Sovereign Gatekeeper"
  },

  // Consola de Incendios (/incendios)
  fires_badge_national: {
    es: "CONSOLA C2 NACIONAL • INCENDIOS FORESTALES",
    en: "NATIONAL C2 CONSOLE • WILDFIRE TACTICAL C2"
  },
  fires_title: {
    es: "VIGILANCIA TÁCTICA DE FOCOS DE CALOR & ÍNDICE FWI",
    en: "TACTICAL SURVEILLANCE OF THERMAL HOTSPOTS & FWI INDEX"
  },
  fires_desc: {
    es: "Fusión en tiempo real de distritos expuestos, detección térmica satelital VIIRS (375m) / NASA FIRMS, Google Maps Platform 3D y perfil edáfico Open-Meteo Professional.",
    en: "Real-time fusion of fire-exposed districts, VIIRS (375m) / NASA FIRMS satellite thermal detection, Google Maps Platform 3D hybrid terrain, and Open-Meteo Pro soil moisture."
  },
  fires_filter_all: {
    es: "Todos los Complejos",
    en: "All Fire Complexes"
  },
  fires_filter_blind: {
    es: "🔴 Solo Incendios Ciegos (Sin INDECI)",
    en: "🔴 Blind Wildfires Only (Zero COEN Report)"
  },
  fires_filter_validated: {
    es: "🟢 Conciliados INDECI",
    en: "🟢 Validated by INDECI"
  },
  fires_table_rank: {
    es: "Complejos Nacionales Priorizados",
    en: "National High-Severity Complexes"
  },
  fires_btn_d8: {
    es: "Generar Expediente Maquinaria D8",
    en: "Generate D8 Mechanized Firebreak Order"
  },
  fires_btn_fwi: {
    es: "Calcular Índice FWI en Vivo",
    en: "Compute Live Canadian FWI Index"
  },

  // Textos Clave de Alertas e HITL
  hitl_title: {
    es: "Puerta Soberana de Aprobación Humana (HITL)",
    en: "Sovereign Human Approval Gatekeeper (HITL)"
  },
  hitl_desc: {
    es: "Enclaustramiento cognitivo ético: Ninguna alerta se despacha automáticamente sin firma humana.",
    en: "Ethical Cognitive Caging: No alert is dispatched automatically without verified human digital signature."
  },
  hitl_sign_button: {
    es: "Firmar y Autorizar Distribución",
    en: "Sign & Authorize Distribution"
  },
  hitl_cancel: {
    es: "Mantener en Borrador",
    en: "Keep in Draft State"
  },
  hitl_sismate_disclaimer: {
    es: "Declaro que esta alerta es para coordinación técnica y no reemplaza el despacho celular masivo oficial del Estado.",
    en: "I certify that this alert is for technical C2 coordination and does not replace official state mass cellular broadcast."
  },

  // 6 Eslabones OMM / EW4All
  link_1_title: {
    es: "1. Observación y Monitoreo",
    en: "1. Observation & Monitoring"
  },
  link_2_title: {
    es: "2. Pronóstico Científico EAP",
    en: "2. Scientific Forecast & EAP"
  },
  link_3_title: {
    es: "3. Predicción de Impacto Vulnerable",
    en: "3. Vulnerability & Impact Analysis"
  },
  link_4_title: {
    es: "4. Emisión Autorizada HITL (CAP v1.2)",
    en: "4. Authorized HITL Warning (CAP v1.2)"
  },
  link_5_title: {
    es: "5. Acción Logística Humanitaria",
    en: "5. Humanitarian Action & Logistics"
  },
  link_6_title: {
    es: "6. Notaría Blockchain WORM",
    en: "6. Blockchain WORM Audit Trail"
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
    // 1. Detectar si viene con query param ?lang=en o ?lang=es en la URL
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const urlLang = urlParams.get("lang");
      if (urlLang === "en" || urlLang === "es") {
        setLanguage(urlLang);
        localStorage.setItem("amaru_language", urlLang);
        return;
      }
    } catch (e) {
      // Ignorar en SSR
    }

    // 2. Si no viene en la URL, consultar localStorage
    const saved = localStorage.getItem("amaru_language") as Language;
    if (saved === "es" || saved === "en") {
      setLanguage(saved);
    }
  }, []);

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem("amaru_language", lang);
  };

  const toggleLanguage = () => {
    const next = language === "es" ? "en" : "es";
    handleSetLanguage(next);
  };

  const t = (key: string): string => {
    if (DICTIONARY[key]) {
      return DICTIONARY[key][language] || DICTIONARY[key]["es"];
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
