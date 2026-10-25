"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Cpu,
  Database,
  Flame,
  Waves,
  Lock,
  ExternalLink,
  ChevronRight,
  Globe,
  Award,
  Layers,
  Sparkles,
  Play,
  CloudSnow
} from "lucide-react";

export default function PitchPage() {
  const [activeTab, setActiveTab] = useState<"SWARM" | "BLOCKCHAIN" | "ARCHITECTURE">("SWARM");

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-black">
      {/* Top Banner: IEEE & Track Badge */}
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur-md px-6 py-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 shadow-lg shadow-cyan-500/20 text-white font-black text-xl">
            A
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold tracking-tight text-xl bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-indigo-300">
                AMARU-CLIMATE
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full border border-purple-500/40 bg-purple-950/60 text-purple-300 font-mono font-bold">
                PROTOTIPO / PILOT PROOF-OF-CONCEPT
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Propuesta de Arquitectura C2 con IA Multi-Agente & Notaría Blockchain Polygon (Sujeta a Calibración)
            </p>
          </div>
        </div>

        {/* Badges IEEE & Track */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-indigo-950/50 border border-indigo-500/30 px-3 py-1.5 rounded-lg text-xs font-medium text-indigo-200">
            <Award className="w-4 h-4 text-amber-400" />
            <span>IEEE ClimateChain Hackathon 2026</span>
          </div>
          <div className="flex items-center gap-2 bg-emerald-950/50 border border-emerald-500/30 px-3 py-1.5 rounded-lg text-xs font-medium text-emerald-300">
            <Globe className="w-4 h-4 text-emerald-400" />
            <span>Track 4: Climate Data & Environmental Monitoring</span>
          </div>
        </div>
      </header>

      {/* Main Pitch Hero (Ideal para los primeros 30 segundos del video) */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-6 lg:p-8 flex flex-col gap-8 justify-center">
        {/* Hero Section */}
        <div className="text-center max-w-4xl mx-auto space-y-4 pt-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold tracking-wide uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            Official IEEE Demonstration Console
          </div>
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
            Breaking the <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-400 to-orange-500">Golden Window</span> Paralysis in Climate Disasters
          </h1>

          <p className="text-slate-300 text-base sm:text-lg leading-relaxed max-w-3xl mx-auto">
            Resolving the dual failure of climate emergency response: <strong className="text-white">administrative delay</strong> during rapid-onset disasters and <strong className="text-white">corruption vulnerabilities</strong> in emergency procurement.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-sm shadow-lg shadow-cyan-500/25 transition-all"
            >
              <Play className="w-4 h-4" />
              Entrar al War Room Nacional C2
            </Link>
            <Link
              href="/incendios"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-semibold text-sm transition-all"
            >
              <Flame className="w-4 h-4 text-orange-400" />
              Consola Incendios Ciegos (DBSCAN)
            </Link>
            <Link
              href="/contraloria"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-950/60 hover:bg-indigo-900/60 border border-indigo-700/50 text-indigo-200 font-semibold text-sm transition-all"
            >
              <Lock className="w-4 h-4 text-indigo-400" />
              Notaría Blockchain (Polygon Amoy)
            </Link>
          </div>
        </div>

        {/* Tab Navigation: Swarm vs Blockchain vs Architecture */}
        <div className="flex justify-center border-b border-slate-800">
          <div className="inline-flex p-1 bg-slate-900 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab("SWARM")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                activeTab === "SWARM"
                  ? "bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Cpu className="w-4 h-4" />
              1. Enjambre IA Multi-Agente (AI Swarm)
            </button>
            <button
              onClick={() => setActiveTab("BLOCKCHAIN")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                activeTab === "BLOCKCHAIN"
                  ? "bg-indigo-500 text-white shadow-md shadow-indigo-500/20"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Lock className="w-4 h-4" />
              2. Notaría Blockchain Triple-Layer
            </button>
            <button
              onClick={() => setActiveTab("ARCHITECTURE")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                activeTab === "ARCHITECTURE"
                  ? "bg-purple-600 text-white shadow-md shadow-purple-600/20"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Layers className="w-4 h-4" />
              3. Arquitectura del Dipolo Climático
            </button>
          </div>
        </div>

        {/* Tab 1: AI Swarm Details */}
        {activeTab === "SWARM" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fadeIn">
            {/* Agente Kuraq */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-3 hover:border-cyan-500/40 transition-colors">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
                  AGENTE 01
                </span>
                <Globe className="w-5 h-5 text-cyan-400" />
              </div>
              <h3 className="text-lg font-bold text-white">Kuraq (Orquestador Satelital)</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Ingesta y fusiona 27 streams de telemetría: satélites orbitales NASA FIRMS (VIIRS 375m), Sentinel-3 SLSTR, radares Doppler meteorológicos y boyas del ENFEN.
              </p>
              <div className="text-[11px] text-cyan-300/80 font-mono pt-2 border-t border-slate-800">
                • Ingesta satelital cada 15 min<br />
                • Detección térmica nocturna
              </div>
            </div>

            {/* Agente Yupaq */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-3 hover:border-amber-500/40 transition-colors">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-800">
                  AGENTE 02
                </span>
                <Flame className="w-5 h-5 text-amber-400" />
              </div>
              <h3 className="text-lg font-bold text-white">Yupaq (Motor Geodésico)</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Ejecuta clustering geodésico DBSCAN (R=12 km) para agrupar 86 complejos nacionales. Descubre 38 Incendios Ciegos que no figuran en SINPAD e implementa persistencia térmica PTT 48h.
              </p>
              <div className="text-[11px] text-amber-300/80 font-mono pt-2 border-t border-slate-800">
                • Algoritmo DBSCAN Haversine<br />
                • Cálculo de bulldozer D8 para cortafuegos
              </div>
            </div>

            {/* Agente Fiscalizador */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-3 hover:border-indigo-500/40 transition-colors">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-indigo-950 text-indigo-400 border border-indigo-800">
                  AGENTE 03
                </span>
                <ShieldCheck className="w-5 h-5 text-indigo-400" />
              </div>
              <h3 className="text-lg font-bold text-white">Fiscalizador (Anti-Corrupción)</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Coteja precios de alquiler de maquinaria pesada contra los históricos de SEACE/OSCE y redacta expedientes bajo la Ley 30225 Art. 27 inc. b para evitar sobrecostos en la emergencia.
              </p>
              <div className="text-[11px] text-indigo-300/80 font-mono pt-2 border-t border-slate-800">
                • Benchmark de precios OSCE<br />
                • Formateo de actas de adjudicación
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Triple Layer Blockchain Notary */}
        {activeTab === "BLOCKCHAIN" && (
          <div className="bg-slate-900/60 border border-indigo-900/40 rounded-2xl p-6 lg:p-8 space-y-6 animate-fadeIn">
            <div className="max-w-2xl">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Lock className="w-5 h-5 text-indigo-400" />
                Arquitectura Notarial de Triple Capa (Polygon Amoy)
              </h3>
              <p className="text-xs text-slate-300 mt-1">
                Cómo la telemetría satelital y las cotizaciones de emergencia se convierten en evidencia legal matemáticamente inalterable.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Layer 1 */}
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                <div className="text-xs font-mono font-bold text-cyan-400">LAYER 1: MUNICIPAL EDGE</div>
                <div className="text-sm font-bold text-white">Micro-Pruebas SHA-256 (&lt; 2ms)</div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Genera hashes criptográficos inmediatos en servidores municipales locales. Garantiza operatividad continua incluso ante apagones de internet o colapso de fibra óptica.
                </p>
              </div>

              {/* Layer 2 */}
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                <div className="text-xs font-mono font-bold text-amber-400">LAYER 2: CONTRALORÍA WORM</div>
                <div className="text-sm font-bold text-white">Libro Inmutable ISO-27037</div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Registro Write-Once-Read-Many con sellado de tiempo RFC 3161 y cadena de custodia forense. Audita cotizaciones de maquinaria pesada y censos de damnificados.
                </p>
              </div>

              {/* Layer 3 */}
              <div className="p-4 rounded-xl bg-slate-950/80 border border-indigo-800/60 space-y-2 shadow-lg shadow-indigo-950/40">
                <div className="text-xs font-mono font-bold text-indigo-400">LAYER 3: POLYGON EVM</div>
                <div className="text-sm font-bold text-white">ClimateAuditAnchor.sol (Amoy)</div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Agrupa lotes de eventos en Árboles de Merkle balanceados y ancla la raíz de 32 bytes on-chain en Polygon Testnet (ChainID 80002).
                </p>
                <div className="pt-2">
                  <a
                    href="https://amoy.polygonscan.com/address/0x5462C7F1aC5a0C58356A21e25F883d6aF92289c0"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-[11px] text-cyan-400 hover:text-cyan-300 font-mono"
                  >
                    Ver en PolygonScan <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Compound Climate Dipole Architecture */}
        {activeTab === "ARCHITECTURE" && (
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 lg:p-8 space-y-6 animate-fadeIn">
            <div className="max-w-3xl">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-purple-400" />
                El Dipolo Climático Compuesto (ENSO Multi-Hazard)
              </h3>
              <p className="text-xs text-slate-300 mt-1">
                La física que une las lluvias torrenciales de El Niño con los megaincendios forestales bajo el estándar UN-EW4All.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-5 rounded-xl bg-slate-950/80 border border-cyan-800/40 space-y-3">
                <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
                  <Waves className="w-5 h-5" />
                  1. Frente Costero: El Niño & Inundaciones
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  El calentamiento anómalo del Mar de Grau (boyas ENFEN/NOAA) activa precipitaciones extremas en las cuencas de Piura y Chira. La onda de avenida tarda apenas 4 a 12 horas en golpear las ciudades.
                </p>
                <div className="text-[11px] text-slate-400 font-mono">
                  • Integración CENEPRED SIGRID-10773<br />
                  • 23 puntos críticos georreferenciados
                </div>
              </div>

              <div className="p-5 rounded-xl bg-slate-950/80 border border-orange-800/40 space-y-3">
                <div className="flex items-center gap-2 text-orange-400 font-bold text-sm">
                  <Flame className="w-5 h-5" />
                  2. Frente Sierra / Selva: Sequía e Incendios
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Simultáneamente, la alteración de la celda de Walker provoca estrés hídrico extremo y sequías en los Andes y selva alta. El fuego avanza a 4 km/h colina arriba a través de efectos chimenea.
                </p>
                <div className="text-[11px] text-slate-400 font-mono">
                  • 86 complejos nacionales agrupados (DBSCAN)<br />
                  • 38 Incendios Ciegos expuestos frente a INDECI
                </div>
              </div>

              <div className="p-5 rounded-xl bg-slate-950/80 border border-sky-800/40 space-y-3">
                <div className="flex items-center gap-2 text-sky-400 font-bold text-sm">
                  <CloudSnow className="w-5 h-5" />
                  3. Frente Altiplánico: La Niña & Heladas
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  La oscilación fría de La Niña desata heladas meteorológicas extremas (&lt; -15°C) en el Altiplano (Puno/Cusco), diezmando alpacas y cultivos altoandinos mediante estrés térmico criogénico.
                </p>
                <div className="text-[11px] text-slate-400 font-mono">
                  • Modelo Crioclima Puno (106 distritos)<br />
                  • Paramétrico SAC para ganadería camélida
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer Quick Links */}
        <div className="pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-4">
          <div className="flex items-center gap-4">
            <span>Repositorio Oficial: <a href="https://github.com/carlosmba12Peru/amaru-global" target="_blank" rel="noreferrer" className="text-cyan-400 hover:underline font-mono">amaru-global</a></span>
            <span>•</span>
            <span>Smart Contract: <span className="font-mono text-slate-300">ClimateAuditAnchor.sol</span></span>
          </div>
          <div className="text-slate-300 font-mono">
            ChainID: 80002 (Polygon Amoy Testnet)
          </div>
        </div>
      </main>
    </div>
  );
}
