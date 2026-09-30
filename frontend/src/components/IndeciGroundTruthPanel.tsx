"use client";

import React, { useState } from "react";
import {
  ShieldAlert,
  ShieldCheck,
  TrendingUp,
  Truck,
  Droplets,
  Zap,
  Home,
  Users,
  Compass,
  FileText,
  AlertTriangle,
  ArrowRight,
  Package,
  Layers,
  Activity,
  CheckCircle2,
  DollarSign
} from "lucide-react";

interface IndeciGroundTruthPanelProps {
  indeciData?: any;
  demandaLogistica?: any;
  balanceSinAmaru?: any;
  balanceConAmaru?: any;
  tsm: number;
  severidad: string;
  avanceObras: number;
  modoAmaru: boolean;
}

export default function IndeciGroundTruthPanel({
  indeciData,
  demandaLogistica,
  balanceSinAmaru,
  balanceConAmaru,
  tsm,
  severidad,
  avanceObras,
  modoAmaru
}: IndeciGroundTruthPanelProps) {
  const [subTab, setSubTab] = useState<"comparativa" | "logistica" | "servicios" | "departamentos">("comparativa");

  const fen17 = indeciData?.fen_costero_2017;
  const reg18 = indeciData?.temporada_regular_2018;
  const mult = indeciData?.multiplicadores_de_catastrofe;
  const danoNeto = indeciData?.dano_neto_atribuible_fen;

  return (
    <div className="space-y-6">
      {/* Encabezado del Panel */}
      <div className="bg-gradient-to-r from-slate-900 via-rose-950/40 to-slate-900 border border-rose-800/40 rounded-2xl p-5 shadow-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 tracking-wider uppercase font-mono">
                GROUND TRUTH OFICIAL • SINPAD / INDECI
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700 tracking-wider uppercase font-mono">
                Cierre Histórico al 100%
              </span>
            </div>
            <h2 className="text-xl md:text-2xl font-black text-white flex items-center gap-2">
              Calibración Empírica INDECI: El Niño Costero 2017 vs. Temporada Regular 2018
            </h2>
            <p className="text-xs text-slate-300 max-w-4xl leading-relaxed">
              Ground Truth extraído directamente de los reportes oficiales del Sistema Nacional de Información para la Prevención y Atención de Desastres (SINPAD): <em>«Resumen Ejecutivo Histórico al 100% Temporada de Lluvias 2016-2017»</em> y <em>«Resumen Ejecutivo Histórico Final N° 018 Temporada de Lluvias 2017-2018»</em>. Proporciona la base de calibración inmutable para simular los daños esperados del <strong>FEN 2026-2027</strong> y validar la eficacia mitigadora de <strong>AMARU-CLIMATE</strong>.
            </p>
          </div>

          <div className="bg-slate-950/80 border border-rose-500/30 rounded-xl px-4 py-3 text-right shrink-0">
            <div className="text-[10px] text-slate-400 font-mono">Simulación Activa</div>
            <div className="text-sm font-bold text-amber-300 font-mono">
              TSM +{tsm.toFixed(1)}°C • {severidad}
            </div>
            <div className="text-[10px] text-emerald-400 font-mono">
              Obras PP 0068: {avanceObras}% avance
            </div>
          </div>
        </div>
      </div>

      {/* Tarjetas de Multiplicador de Catástrofe (Shock FEN) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 text-center space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400">Damnificados</span>
          <div className="text-xl font-black text-rose-400 font-mono">
            {mult?.damnificados_ratio || "21.6"}x
          </div>
          <p className="text-[9px] text-slate-400">283,137 vs 13,085</p>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 text-center space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400">Viviendas Colapso</span>
          <div className="text-xl font-black text-rose-400 font-mono">
            {mult?.viviendas_destruidas_ratio || "21.5"}x
          </div>
          <p className="text-[9px] text-slate-400">65,942 vs 3,074</p>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 text-center space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400">Puentes Caídos</span>
          <div className="text-xl font-black text-amber-400 font-mono">
            {mult?.puentes_destruidos_ratio || "7.7"}x
          </div>
          <p className="text-[9px] text-slate-400">493 vs 64 puentes</p>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 text-center space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400">Vías Destruidas</span>
          <div className="text-xl font-black text-amber-400 font-mono">
            {mult?.carreteras_destruidas_ratio || "9.6"}x
          </div>
          <p className="text-[9px] text-slate-400">4,030 vs 419 km</p>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 text-center space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400">Canales de Riego</span>
          <div className="text-xl font-black text-red-500 font-mono">
            {mult?.canales_riego_destruidos_ratio || "82.5"}x
          </div>
          <p className="text-[9px] text-slate-400">3,019 vs 37 km</p>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 text-center space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400">Ayuda TM Requerida</span>
          <div className="text-xl font-black text-sky-400 font-mono">
            {mult?.ayuda_humanitaria_tm_ratio || "5.8"}x
          </div>
          <p className="text-[9px] text-slate-400">2,518 vs 432 TM</p>
        </div>
      </div>

      {/* Subnavegación del Panel INDECI */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setSubTab("comparativa")}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
            subTab === "comparativa"
              ? "bg-rose-950 text-rose-200 border border-rose-800 shadow"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Matriz de Daño: 2017 vs 2018 vs 2026-2027</span>
        </button>

        <button
          onClick={() => setSubTab("logistica")}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
            subTab === "logistica"
              ? "bg-rose-950 text-rose-200 border border-rose-800 shadow"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
          }`}
        >
          <Truck className="w-3.5 h-3.5" />
          <span>Calculadora Logística de Ayuda Humanitaria (TM)</span>
        </button>

        <button
          onClick={() => setSubTab("servicios")}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
            subTab === "servicios"
              ? "bg-rose-950 text-rose-200 border border-rose-800 shadow"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
          }`}
        >
          <Droplets className="w-3.5 h-3.5" />
          <span>Colapso y Resiliencia de Servicios Básicos</span>
        </button>

        <button
          onClick={() => setSubTab("departamentos")}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
            subTab === "departamentos"
              ? "bg-rose-950 text-rose-200 border border-rose-800 shadow"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
          }`}
        >
          <Compass className="w-3.5 h-3.5" />
          <span>Concentración Regional del Daño (Top Departamentos)</span>
        </button>
      </div>

      {/* SUBTAB 1: MATRIZ DE COMPARACIÓN EMPÍRICA */}
      {subTab === "comparativa" && (
        <div className="space-y-4">
          <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950 shadow-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900 text-slate-400 uppercase font-mono text-[10px] border-b border-slate-800">
                <tr>
                  <th className="py-3 px-3">Variable de Daño Oficial</th>
                  <th className="py-3 px-3 text-slate-300">Temporada Regular (2018)<br/><span className="text-[9px] text-slate-500 font-sans">Línea Base Sin FEN</span></th>
                  <th className="py-3 px-3 text-rose-400 font-bold">El Niño Costero (2017)<br/><span className="text-[9px] text-rose-300/70 font-sans">Cierre al 100% SINPAD</span></th>
                  <th className="py-3 px-3 text-amber-300 font-bold">FEN 2026-2027 Proyectado<br/><span className="text-[9px] text-amber-400/70 font-sans">Sin AMARU-CLIMATE</span></th>
                  <th className="py-3 px-3 text-emerald-400 font-bold">FEN 2026-2027 Mitigado<br/><span className="text-[9px] text-emerald-300/70 font-sans">Con AMARU-CLIMATE</span></th>
                  <th className="py-3 px-3 text-sky-400 font-bold text-center">Eficacia Mitigación</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 font-mono text-[11px]">
                {/* Fallecidos */}
                <tr className="hover:bg-slate-900/50">
                  <td className="py-2.5 px-3 font-semibold text-slate-200 font-sans flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-rose-400" />
                    Fallecidos (Vidas Humanas)
                  </td>
                  <td className="py-2.5 px-3 text-slate-300">{reg18?.vidas_salud?.fallecidos || 34}</td>
                  <td className="py-2.5 px-3 text-rose-400 font-bold">{fen17?.vidas_salud?.fallecidos || 169}</td>
                  <td className="py-2.5 px-3 text-amber-400 font-bold">{balanceSinAmaru?.fallecidos_en_faja_marginal || 563} (fajas ANA)</td>
                  <td className="py-2.5 px-3 text-emerald-400 font-bold">0 en fajas ANA</td>
                  <td className="py-2.5 px-3 text-center">
                    <span className="bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded text-[10px] font-bold">
                      100% Vidas Riberas Salvadas
                    </span>
                  </td>
                </tr>

                {/* Damnificados */}
                <tr className="hover:bg-slate-900/50">
                  <td className="py-2.5 px-3 font-semibold text-slate-200 font-sans flex items-center gap-1.5">
                    <Home className="w-3.5 h-3.5 text-amber-400" />
                    Damnificados (Vivienda Perdida)
                  </td>
                  <td className="py-2.5 px-3 text-slate-300">{(reg18?.vidas_salud?.damnificados || 13085).toLocaleString("es-PE")}</td>
                  <td className="py-2.5 px-3 text-rose-400 font-bold">{(fen17?.vidas_salud?.damnificados || 283137).toLocaleString("es-PE")}</td>
                  <td className="py-2.5 px-3 text-amber-400 font-bold">{(balanceSinAmaru?.damnificados || 6876286).toLocaleString("es-PE")}</td>
                  <td className="py-2.5 px-3 text-emerald-400 font-bold">{(balanceConAmaru?.damnificados || 1512782).toLocaleString("es-PE")}</td>
                  <td className="py-2.5 px-3 text-center">
                    <span className="bg-sky-950 text-sky-300 border border-sky-800 px-2 py-0.5 rounded text-[10px] font-bold">
                      −78.0% Damnificados
                    </span>
                  </td>
                </tr>

                {/* Viviendas Colapsadas */}
                <tr className="hover:bg-slate-900/50">
                  <td className="py-2.5 px-3 font-semibold text-slate-200 font-sans">
                    Viviendas Destruidas / Inhabitables
                  </td>
                  <td className="py-2.5 px-3 text-slate-300">{(reg18?.viviendas?.total_destruidas_inhabitables || 3074).toLocaleString("es-PE")}</td>
                  <td className="py-2.5 px-3 text-rose-400 font-bold">{(fen17?.viviendas?.total_destruidas_inhabitables || 65942).toLocaleString("es-PE")}</td>
                  <td className="py-2.5 px-3 text-amber-400 font-bold">{(balanceSinAmaru?.viviendas_destruidas || 600986).toLocaleString("es-PE")}</td>
                  <td className="py-2.5 px-3 text-emerald-400 font-bold">{(balanceConAmaru?.viviendas_destruidas || 180295).toLocaleString("es-PE")}</td>
                  <td className="py-2.5 px-3 text-center">
                    <span className="bg-purple-950 text-purple-300 border border-purple-800 px-2 py-0.5 rounded text-[10px] font-bold">
                      +{(balanceConAmaru?.viviendas_protegidas || 420691).toLocaleString("es-PE")} Salvadas
                    </span>
                  </td>
                </tr>

                {/* Puentes Caídos */}
                <tr className="hover:bg-slate-900/50">
                  <td className="py-2.5 px-3 font-semibold text-slate-200 font-sans">
                    Puentes Destruidos / Colapsados
                  </td>
                  <td className="py-2.5 px-3 text-slate-300">{reg18?.transporte?.puentes_destruidos_unidades || 64}</td>
                  <td className="py-2.5 px-3 text-rose-400 font-bold">{fen17?.transporte?.puentes_destruidos_unidades || 493}</td>
                  <td className="py-2.5 px-3 text-amber-400 font-bold">{balanceSinAmaru?.puentes_destruidos_estimados || 493}</td>
                  <td className="py-2.5 px-3 text-emerald-400 font-bold">{Math.round((balanceSinAmaru?.puentes_destruidos_estimados || 493) * 0.35)}</td>
                  <td className="py-2.5 px-3 text-center">
                    <span className="bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded text-[10px] font-bold">
                      +{balanceConAmaru?.puentes_salvados_defensas || 320} Puentes Salvados
                    </span>
                  </td>
                </tr>

                {/* Carreteras Destruidas */}
                <tr className="hover:bg-slate-900/50">
                  <td className="py-2.5 px-3 font-semibold text-slate-200 font-sans">
                    Carreteras Destruidas (Km)
                  </td>
                  <td className="py-2.5 px-3 text-slate-300">{reg18?.transporte?.carreteras_destruidas_km || 418.6} km</td>
                  <td className="py-2.5 px-3 text-rose-400 font-bold">{fen17?.transporte?.carreteras_destruidas_km || 4030.0} km</td>
                  <td className="py-2.5 px-3 text-amber-400 font-bold">{balanceSinAmaru?.carreteras_destruidas_km || 4030.0} km</td>
                  <td className="py-2.5 px-3 text-emerald-400 font-bold">{Math.round((balanceSinAmaru?.carreteras_destruidas_km || 4030.0) * 0.45)} km</td>
                  <td className="py-2.5 px-3 text-center">
                    <span className="bg-amber-950 text-amber-300 border border-amber-800 px-2 py-0.5 rounded text-[10px] font-bold">
                      Defensas PP 0068 activas
                    </span>
                  </td>
                </tr>

                {/* Ayuda Humanitaria */}
                <tr className="hover:bg-slate-900/50">
                  <td className="py-2.5 px-3 font-semibold text-slate-200 font-sans flex items-center gap-1.5">
                    <Truck className="w-3.5 h-3.5 text-sky-400" />
                    Ayuda Humanitaria Entregada (TM)
                  </td>
                  <td className="py-2.5 px-3 text-slate-300">{(reg18?.ayuda_humanitaria_tm?.total_tm || 431.6).toLocaleString("es-PE")} TM</td>
                  <td className="py-2.5 px-3 text-rose-400 font-bold">{(fen17?.ayuda_humanitaria_tm?.total_tm || 2518.1).toLocaleString("es-PE")} TM</td>
                  <td className="py-2.5 px-3 text-amber-400 font-bold">{(balanceSinAmaru?.demanda_ayuda_humanitaria_tm || 61130).toLocaleString("es-PE")} TM</td>
                  <td className="py-2.5 px-3 text-emerald-400 font-bold">{(balanceConAmaru?.demanda_ayuda_humanitaria_tm || 13441).toLocaleString("es-PE")} TM</td>
                  <td className="py-2.5 px-3 text-center">
                    <span className="bg-sky-950 text-sky-300 border border-sky-800 px-2 py-0.5 rounded text-[10px] font-bold">
                      −{(demandaLogistica?.ahorro_logistico_tm || 47689).toLocaleString("es-PE")} TM Evitadas
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Tarjeta explicativa de la línea base */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 text-xs space-y-2">
            <div className="flex items-center gap-2 text-rose-400 font-bold">
              <AlertTriangle className="w-4 h-4" />
              <span>Conclusión de Auditoría Estatal: El Fenómeno El Niño como Factor Multiplicador Crítico</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              La diferencia entre 2017 y 2018 demuestra que una temporada normal de lluvias causa daños en distritos de sierra y selva (13,085 personas damnificadas y 418 km de carreteras destruidas), pero <strong>El Niño Costero multiplica por más de 20 veces</strong> el número de personas que pierden sus hogares (283,137 personas) y colapsa la red troncal de transporte (493 puentes y 4,030 km de vías).
            </p>
            <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400 font-mono">
              <span>Daño neto directamente atribuible al FEN 2017:</span>
              <span className="text-rose-400 font-bold">
                +{(danoNeto?.damnificados_excedentes_fen || 270052).toLocaleString("es-PE")} damnificados excedentes • +{(danoNeto?.viviendas_destruidas_excedentes || 62868).toLocaleString("es-PE")} viviendas destruidas
              </span>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 2: CALCULADORA LOGÍSTICA DE AYUDA HUMANITARIA */}
      {subTab === "logistica" && (
        <div className="space-y-4">
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-1">
              <Truck className="w-4 h-4 text-sky-400" />
              Demanda Logística de Ayuda Humanitaria: Coeficientes Oficiales INDECI
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Basado en el desglose oficial de las <strong>2,518.06 Toneladas Métricas</strong> entregadas por el INDECI y los Gobiernos Regionales durante El Niño Costero 2017 (coeficiente oficial de <strong>8.89 kg de ayuda humanitaria por persona damnificada</strong>).
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Escenario Sin AMARU */}
            <div className="bg-red-950/20 border border-red-500/40 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-red-400 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4" />
                  Demanda Sin AMARU (Colapso Logístico)
                </span>
                <span className="text-xs font-mono font-bold text-red-300 bg-red-950 px-2 py-0.5 rounded border border-red-800">
                  {(balanceSinAmaru?.demanda_ayuda_humanitaria_tm || 61130).toLocaleString("es-PE")} TM Totales
                </span>
              </div>

              <div className="space-y-2 text-xs font-mono">
                <div className="flex justify-between py-1 border-b border-red-900/40">
                  <span className="text-slate-300">Techo (calaminas, bobinas):</span>
                  <span className="text-red-300 font-bold">{(demandaLogistica?.sin_amaru?.desglose_por_tipo_tm?.techo_calaminas_bobinas || 34022).toLocaleString("es-PE")} TM (55.6%)</span>
                </div>
                <div className="flex justify-between py-1 border-b border-red-900/40">
                  <span className="text-slate-300">Alimentos (raciones de emergencia):</span>
                  <span className="text-red-300 font-bold">{(demandaLogistica?.sin_amaru?.desglose_por_tipo_tm?.raciones_alimento_emergencia || 17130).toLocaleString("es-PE")} TM (28.0%)</span>
                </div>
                <div className="flex justify-between py-1 border-b border-red-900/40">
                  <span className="text-slate-300">Abrigo (frazadas, ropa de abrigo):</span>
                  <span className="text-red-300 font-bold">{(demandaLogistica?.sin_amaru?.desglose_por_tipo_tm?.abrigo_frazadas_ropa || 4222).toLocaleString("es-PE")} TM (6.9%)</span>
                </div>
                <div className="flex justify-between py-1 border-b border-red-900/40">
                  <span className="text-slate-300">Herramientas (palas, carretillas):</span>
                  <span className="text-red-300 font-bold">{(demandaLogistica?.sin_amaru?.desglose_por_tipo_tm?.herramientas_palas_carretillas || 2561).toLocaleString("es-PE")} TM (4.2%)</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-300">Enseres y Menaje:</span>
                  <span className="text-red-300 font-bold">{(demandaLogistica?.sin_amaru?.desglose_por_tipo_tm?.enseres_menaje_bidones || 1486).toLocaleString("es-PE")} TM (2.4%)</span>
                </div>
              </div>

              <div className="p-3 bg-red-950/60 rounded-lg border border-red-800 text-[11px] text-red-200 space-y-1">
                <div className="font-bold flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Cuello de Botella Operativo:
                </div>
                <p>
                  Requiere <strong>{balanceSinAmaru?.camiones_10tm_requeridos || 6113} viajes de camiones de 10 TM</strong>. Con {balanceSinAmaru?.puentes_destruidos_estimados || 493} puentes colapsados, el 70% de la población queda incomunicada y demanda puentes aéreos masivos de la FAP (aviones Hércules L-100 / Spartan C-27J) con costo fiscal 14 veces mayor.
                </p>
              </div>
            </div>

            {/* Escenario Con AMARU-CLIMATE */}
            <div className="bg-emerald-950/20 border border-emerald-500/40 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" />
                  Demanda Con AMARU-CLIMATE (Optimizada)
                </span>
                <span className="text-xs font-mono font-bold text-emerald-300 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                  {(balanceConAmaru?.demanda_ayuda_humanitaria_tm || 13441).toLocaleString("es-PE")} TM Totales
                </span>
              </div>

              <div className="space-y-2 text-xs font-mono">
                <div className="flex justify-between py-1 border-b border-emerald-900/40">
                  <span className="text-slate-300">Techo (calaminas, bobinas):</span>
                  <span className="text-emerald-300 font-bold">{(demandaLogistica?.con_amaru?.desglose_por_tipo_tm?.techo_calaminas_bobinas || 7485).toLocaleString("es-PE")} TM</span>
                </div>
                <div className="flex justify-between py-1 border-b border-emerald-900/40">
                  <span className="text-slate-300">Alimentos (raciones de emergencia):</span>
                  <span className="text-emerald-300 font-bold">{(demandaLogistica?.con_amaru?.desglose_por_tipo_tm?.raciones_alimento_emergencia || 3769).toLocaleString("es-PE")} TM</span>
                </div>
                <div className="flex justify-between py-1 border-b border-emerald-900/40">
                  <span className="text-slate-300">Abrigo (frazadas, ropa de abrigo):</span>
                  <span className="text-emerald-300 font-bold">{(demandaLogistica?.con_amaru?.desglose_por_tipo_tm?.abrigo_frazadas_ropa || 929).toLocaleString("es-PE")} TM</span>
                </div>
                <div className="flex justify-between py-1 border-b border-emerald-900/40">
                  <span className="text-slate-300">Herramientas (palas, carretillas):</span>
                  <span className="text-emerald-300 font-bold">{(demandaLogistica?.con_amaru?.desglose_por_tipo_tm?.herramientas_palas_carretillas || 563).toLocaleString("es-PE")} TM</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-300">Enseres y Menaje:</span>
                  <span className="text-emerald-300 font-bold">{(demandaLogistica?.con_amaru?.desglose_por_tipo_tm?.enseres_menaje_bidones || 327).toLocaleString("es-PE")} TM</span>
                </div>
              </div>

              <div className="p-3 bg-emerald-950/60 rounded-lg border border-emerald-800 text-[11px] text-emerald-200 space-y-1">
                <div className="font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Estrategia C4ISR de AMARU-CLIMATE:
                </div>
                <p>
                  <strong>Pre-posicionamiento T-144h</strong>: Los {balanceConAmaru?.camiones_10tm_requeridos || 1344} camiones se despachan en <strong>ventana seca</strong> hacia almacenes adelantados del SINPAD en Piura, Chiclayo, Trujillo y Huaraz antes de que los caudales superen el tirante crítico, evitando <strong>{(demandaLogistica?.ahorro_logistico_tm || 47689).toLocaleString("es-PE")} TM de carga no gestionada</strong> y el gasto en puentes aéreos.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 3: COLAPSO Y RESILIENCIA DE SERVICIOS BÁSICOS */}
      {subTab === "servicios" && (
        <div className="space-y-4">
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-1">
              <Droplets className="w-4 h-4 text-cyan-400" />
              Porcentajes Oficiales de Destrucción de Servicios Básicos (Pág. 2 INDECI 2017)
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              El informe de liquidación al 100% de INDECI computó el promedio departamental de afectación en los servicios esenciales de agua, alcantarillado, electricidad y telefonía.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {/* Agua Potable */}
            <div className="bg-slate-950 border border-cyan-500/30 rounded-xl p-3.5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
                  <Droplets className="w-4 h-4 text-cyan-400" /> Agua Potable
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                  66% Falla Total
                </span>
              </div>
              <div className="space-y-1 font-mono text-xs">
                <div className="flex justify-between text-slate-300">
                  <span>Destruido (colapso físico):</span>
                  <span className="text-red-400 font-bold">28%</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Afectado (turbidez/bocatoma):</span>
                  <span className="text-amber-400 font-bold">38%</span>
                </div>
              </div>
              <p className="text-[10px] text-slate-400 pt-1 border-t border-slate-800">
                Provocó 22 días sin agua en Piura (Curumuy colapsado) y 15 días en Trujillo (rotura canal madre Chavimochic).
              </p>
              <div className="p-2 bg-emerald-950/50 rounded border border-emerald-800 text-[10px] text-emerald-300 font-medium">
                🛡️ Mitigación AMARU: Despacho de 140 cisternas y blindaje de PTAP con grupos electrógenos reduce el corte de agua a 0-1 día.
              </div>
            </div>

            {/* Alcantarillado */}
            <div className="bg-slate-950 border border-amber-500/30 rounded-xl p-3.5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-amber-400" /> Desagüe / Saneamiento
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800">
                  47% Falla Total
                </span>
              </div>
              <div className="space-y-1 font-mono text-xs">
                <div className="flex justify-between text-slate-300">
                  <span>Destruido:</span>
                  <span className="text-red-400 font-bold">27%</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Afectado (atoros y colapso):</span>
                  <span className="text-amber-400 font-bold">20%</span>
                </div>
              </div>
              <p className="text-[10px] text-slate-400 pt-1 border-t border-slate-800">
                Afloramiento de aguas servidas generó epidemias de dengue, zika y leptospirosis en Piura y Lambayeque.
              </p>
              <div className="p-2 bg-emerald-950/50 rounded border border-emerald-800 text-[10px] text-emerald-300 font-medium">
                🛡️ Mitigación AMARU: Drenaje prioritario con electrobombas y desarenadores móviles de contingencia.
              </div>
            </div>

            {/* Energía Eléctrica */}
            <div className="bg-slate-950 border border-yellow-500/30 rounded-xl p-3.5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-yellow-300 flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-yellow-400" /> Energía Eléctrica
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-yellow-950 text-yellow-300 border border-yellow-800">
                  48% Falla Total
                </span>
              </div>
              <div className="space-y-1 font-mono text-xs">
                <div className="flex justify-between text-slate-300">
                  <span>Destruido (postes/torres):</span>
                  <span className="text-red-400 font-bold">16%</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Afectado (cortes masivos):</span>
                  <span className="text-amber-400 font-bold">32%</span>
                </div>
              </div>
              <p className="text-[10px] text-slate-400 pt-1 border-t border-slate-800">
                Caída de torres de transmisión en quebradas dejó a Chosica y valles de La Libertad sin fluido hospitalario.
              </p>
              <div className="p-2 bg-emerald-950/50 rounded border border-emerald-800 text-[10px] text-emerald-300 font-medium">
                🛡️ Mitigación AMARU: Micro-redes con generadores autónomos pre-posicionados en centros de salud nivel II y III.
              </div>
            </div>

            {/* Telecomunicaciones */}
            <div className="bg-slate-950 border border-purple-500/30 rounded-xl p-3.5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-purple-300 flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-purple-400" /> Telecomunicaciones
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800">
                  42% Falla Móvil
                </span>
              </div>
              <div className="space-y-1 font-mono text-xs">
                <div className="flex justify-between text-slate-300">
                  <span>Móvil Destruida / Afectada:</span>
                  <span className="text-purple-300 font-bold">5% / 37%</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Fija Destruida / Afectada:</span>
                  <span className="text-purple-300 font-bold">5% / 21%</span>
                </div>
              </div>
              <p className="text-[10px] text-slate-400 pt-1 border-t border-slate-800">
                Ruptura de fibra óptica en Panamericana Norte incomunicó a las comisarías y centros de operaciones de emergencia.
              </p>
              <div className="p-2 bg-emerald-950/50 rounded border border-emerald-800 text-[10px] text-emerald-300 font-medium">
                🛡️ Mitigación AMARU: Red C4ISR mallada con radios HF/VHF y enlace satelital de emergencia.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 4: CONCENTRACIÓN REGIONAL DEL DAÑO 2017 */}
      {subTab === "departamentos" && (
        <div className="space-y-4">
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-1">
              <Compass className="w-4 h-4 text-amber-400" />
              Distribución Departamental Oficial de Damnificados (SINPAD 100% 2017)
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              El 85.5% de todos los damnificados a nivel nacional se concentró en los 4 departamentos de la costa norte y Lima.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {Object.entries(fen17?.distribucion_departamental_damnificados || {}).map(([dep, info]: [string, any]) => {
              const pct = info.pct_damnificados_nacional || 0;
              return (
                <div key={dep} className="bg-slate-950 border border-slate-800 rounded-xl p-3 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
                      {["PIURA", "LA LIBERTAD", "LAMBAYEQUE", "LIMA", "ANCASH"].includes(dep) && (
                        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                      )}
                      {dep}
                    </span>
                    <span className="text-[10px] font-mono font-bold text-rose-400 bg-rose-950/80 px-2 py-0.5 rounded border border-rose-800">
                      {info.damnificados.toLocaleString("es-PE")} damnificados ({pct}%)
                    </span>
                  </div>

                  {/* Barra de Progreso */}
                  <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className={`h-full rounded-full ${
                        pct >= 20 ? "bg-red-500" : pct >= 10 ? "bg-orange-500" : pct >= 5 ? "bg-amber-400" : "bg-sky-500"
                      }`}
                      style={{ width: `${Math.min(100, pct * 2.5)}%` }}
                    />
                  </div>

                  <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                    <span>Afectados: {info.afectados.toLocaleString("es-PE")} personas</span>
                    <span>Análogo FEN 2017</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
