"use client";

import React, { useState, useMemo } from 'react';

export interface DistrictForecast {
  ubigeo: string;
  departamento: string;
  provincia: string;
  distrito: string;
  latitud: number;
  longitud: number;
  categoria_unificada: 'REGIMEN_EMERGENCIA_DS124' | 'REGIMEN_SIGRID_VULNERABLE' | 'REGIMEN_VIGILANCIA_NACIONAL';
  es_ds_124_pcm: boolean;
  es_sigrid_vulnerable: boolean;
  peso_sigrid: number;
  nivel_sigrid_verano_2027: string;
  poblacion: number;
  diaria_mm: number[];
  acumulada_mm: number[];
  saturacion_suelo_pct: number[];
  iui_scores: number[];
  alertas_dia: string[];
  max_iui: number;
  alerta_maxima: string;
}

export interface QuebradaForecast {
  id_quebrada: string;
  nombre: string;
  region: string;
  provincia: string;
  distrito: string;
  umbral_critico_mm_24h: number;
  poblacion_cono_deyeccion: number;
  puntos_estrangulamiento: string[];
  historial_activaciones: number[];
  diaria_mm: number[];
  acumulada_mm: number[];
  saturacion_suelo_pct: number[];
  iaq_scores: number[];
  estados_dia: string[];
  max_iaq: number;
  estado_maximo: string;
}

const MOCK_SAMPLE_DISTRICTS: DistrictForecast[] = [
  {
    ubigeo: "150118",
    departamento: "LIMA",
    provincia: "LIMA",
    distrito: "LURIGANCHO (CHOSICA)",
    latitud: -11.93,
    longitud: -76.70,
    categoria_unificada: "REGIMEN_EMERGENCIA_DS124",
    es_ds_124_pcm: true,
    es_sigrid_vulnerable: true,
    peso_sigrid: 1.6,
    nivel_sigrid_verano_2027: "Muy Alto",
    poblacion: 240150,
    diaria_mm: [22.4, 38.5, 42.0, 18.2, 12.0, 8.5, 5.0],
    acumulada_mm: [22.4, 60.9, 102.9, 121.1, 133.1, 141.6, 146.6],
    saturacion_suelo_pct: [52.0, 78.5, 94.2, 98.0, 95.0, 88.0, 80.0],
    iui_scores: [32.0, 68.4, 94.8, 98.5, 96.0, 85.0, 72.0],
    alertas_dia: ["🟨 MODERADO", "🟧 SEVERO", "🔴 INMINENTE", "🔴 INMINENTE", "🔴 INMINENTE", "🔴 INMINENTE", "🟧 SEVERO"],
    max_iui: 98.5,
    alerta_maxima: "🔴 INMINENTE"
  },
  {
    ubigeo: "200101",
    departamento: "PIURA",
    provincia: "PIURA",
    distrito: "PIURA",
    latitud: -5.19,
    longitud: -80.63,
    categoria_unificada: "REGIMEN_EMERGENCIA_DS124",
    es_ds_124_pcm: true,
    es_sigrid_vulnerable: true,
    peso_sigrid: 1.6,
    nivel_sigrid_verano_2027: "Muy Alto",
    poblacion: 175800,
    diaria_mm: [35.0, 52.0, 48.0, 25.0, 18.0, 12.0, 8.0],
    acumulada_mm: [35.0, 87.0, 135.0, 160.0, 178.0, 190.0, 198.0],
    saturacion_suelo_pct: [60.0, 85.0, 98.0, 96.0, 90.0, 82.0, 75.0],
    iui_scores: [45.0, 88.0, 99.5, 95.0, 88.0, 76.0, 65.0],
    alertas_dia: ["🟨 MODERADO", "🔴 INMINENTE", "🔴 INMINENTE", "🔴 INMINENTE", "🔴 INMINENTE", "🔴 INMINENTE", "🟧 SEVERO"],
    max_iui: 99.5,
    alerta_maxima: "🔴 INMINENTE"
  },
  {
    ubigeo: "200304",
    departamento: "PIURA",
    provincia: "HUANCABAMBA",
    distrito: "CANCHAQUE",
    latitud: -5.37,
    longitud: -79.60,
    categoria_unificada: "REGIMEN_SIGRID_VULNERABLE",
    es_ds_124_pcm: false,
    es_sigrid_vulnerable: true,
    peso_sigrid: 1.6,
    nivel_sigrid_verano_2027: "Muy Alto",
    poblacion: 8950,
    diaria_mm: [18.0, 28.0, 35.0, 40.0, 22.0, 15.0, 9.0],
    acumulada_mm: [18.0, 46.0, 81.0, 121.0, 143.0, 158.0, 167.0],
    saturacion_suelo_pct: [55.0, 72.0, 88.0, 96.0, 92.0, 84.0, 76.0],
    iui_scores: [28.0, 56.0, 84.0, 96.5, 91.0, 78.0, 62.0],
    alertas_dia: ["🟨 MODERADO", "🟧 SEVERO", "🔴 INMINENTE", "🔴 INMINENTE", "🔴 INMINENTE", "🔴 INMINENTE", "🟧 SEVERO"],
    max_iui: 96.5,
    alerta_maxima: "🔴 INMINENTE"
  }
];

const MOCK_SAMPLE_QUEBRADAS: QuebradaForecast[] = [
  {
    id_quebrada: "Q-LIB-01",
    nombre: "Quebrada San Ildefonso",
    region: "La Libertad",
    provincia: "Trujillo",
    distrito: "El Porvenir",
    umbral_critico_mm_24h: 40.0,
    poblacion_cono_deyeccion: 85000,
    puntos_estrangulamiento: ["Sector Mampuesto", "Avenida Miraflores", "Plaza de Armas Trujillo"],
    historial_activaciones: [1983, 1998, 2017, 2023],
    diaria_mm: [20.0, 35.0, 45.0, 25.0, 15.0, 10.0, 5.0],
    acumulada_mm: [20.0, 55.0, 100.0, 125.0, 140.0, 150.0, 155.0],
    saturacion_suelo_pct: [55.0, 78.0, 96.0, 98.0, 94.0, 85.0, 78.0],
    iaq_scores: [35.0, 68.0, 98.5, 99.0, 95.0, 82.0, 68.0],
    estados_dia: ["🟨 SATURADO", "🟧 ACTIVACIÓN INMINENTE", "🔴 HUAICO EN CURSO", "🔴 HUAICO EN CURSO", "🔴 HUAICO EN CURSO", "🟧 ACTIVACIÓN INMINENTE", "🟨 SATURADO"],
    max_iaq: 99.0,
    estado_maximo: "🔴 HUAICO EN CURSO"
  },
  {
    id_quebrada: "Q-LIM-01",
    nombre: "Quebrada Pedregal / Carossio / Quirio",
    region: "Lima",
    provincia: "Lima",
    distrito: "Lurigancho (Chosica)",
    umbral_critico_mm_24h: 25.0,
    poblacion_cono_deyeccion: 62000,
    puntos_estrangulamiento: ["Carretera Central Km 32", "Puente Carossio", "Bajo Pedregal"],
    historial_activaciones: [1987, 1998, 2015, 2017, 2023],
    diaria_mm: [15.0, 28.0, 38.0, 20.0, 12.0, 8.0, 4.0],
    acumulada_mm: [15.0, 43.0, 81.0, 101.0, 113.0, 121.0, 125.0],
    saturacion_suelo_pct: [50.0, 75.0, 92.0, 96.0, 90.0, 80.0, 72.0],
    iaq_scores: [30.0, 62.0, 94.0, 97.0, 88.0, 74.0, 58.0],
    estados_dia: ["🟢 DORMIDO", "🟨 SATURADO", "🔴 HUAICO EN CURSO", "🔴 HUAICO EN CURSO", "🔴 HUAICO EN CURSO", "🟧 ACTIVACIÓN INMINENTE", "🟨 SATURADO"],
    max_iaq: 97.0,
    estado_maximo: "🔴 HUAICO EN CURSO"
  }
];

export default function LiveReinforcedForecastMap() {
  const [vistaActual, setVistaActual] = useState<'DISTRITAL' | 'QUEBRADAS'>('QUEBRADAS');
  const [modoAcumulado, setModoAcumulado] = useState<boolean>(true);
  const [diaSeleccionado, setDiaSeleccionado] = useState<number>(2); // 0 to 6
  const [busqueda, setBusqueda] = useState<string>('');
  const [quebradaDetalle, setQuebradaDetalle] = useState<QuebradaForecast | null>(null);

  const quebradasFiltradas = useMemo(() => {
    return MOCK_SAMPLE_QUEBRADAS.filter(q => {
      return (
        q.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        q.region.toLowerCase().includes(busqueda.toLowerCase()) ||
        q.distrito.toLowerCase().includes(busqueda.toLowerCase()) ||
        q.id_quebrada.toLowerCase().includes(busqueda.toLowerCase())
      );
    });
  }, [busqueda]);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-2xl text-slate-100 font-sans">
      {/* HEADER C2 CON SELECTOR DE VISTA (DISTRITAL VS ACTIVACIÓN DE QUEBRADAS) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-slate-800 gap-4">
        <div>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20 animate-pulse">
              ⚡ CASCADE CASCADE ENGINE ACTIVE
            </span>
            <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              🌊 MOTOR DE ACTIVACIÓN DE QUEBRADAS CRÍTICAS DE HUAICOS
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Acoplamiento hidrológico en tiempo real: Lluvia Acumulada Open-Meteo ➔ Umbrales de Quebradas INGEMMET/ANA
          </p>
        </div>

        {/* CONTROLES DE MODO DE VISTA Y MODO PLUVIOMÉTRICO */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center bg-slate-950 p-1.5 rounded-lg border border-slate-800">
            <button
              onClick={() => setVistaActual('QUEBRADAS')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                vistaActual === 'QUEBRADAS' 
                  ? 'bg-rose-600 text-white shadow-md' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              🌊 Quebradas de Huaicos (60)
            </button>
            <button
              onClick={() => setVistaActual('DISTRITAL')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                vistaActual === 'DISTRITAL' 
                  ? 'bg-indigo-600 text-white shadow-md' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              🗺️ Vista Distrital (1,813)
            </button>
          </div>

          <div className="flex items-center bg-slate-950 p-1.5 rounded-lg border border-slate-800">
            <button
              onClick={() => setModoAcumulado(false)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                !modoAcumulado ? 'bg-cyan-600 text-white' : 'text-slate-400'
              }`}
            >
              📊 Diaria 24h
            </button>
            <button
              onClick={() => setModoAcumulado(true)}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                modoAcumulado ? 'bg-amber-600 text-white' : 'text-slate-400'
              }`}
            >
              📈 Acumulada (T₀➔Tₖ)
            </button>
          </div>
        </div>
      </div>

      {/* LÍNEA DE TIEMPO INTERACTIVA MULTIDÍAS (7 DÍAS) */}
      <div className="my-6 bg-slate-950/80 p-4 rounded-xl border border-slate-800">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            ⏱️ NAVEGADOR TEMPORAL DE DETONACIÓN DE QUEBRADAS (7 DÍAS):
          </span>
          <button
            onClick={() => setDiaSeleccionado(2)}
            className="px-3 py-1 bg-rose-600/20 hover:bg-rose-600/40 text-rose-300 border border-rose-500/30 rounded text-xs font-bold transition-all flex items-center gap-1.5"
          >
            ⚡ DETECTAR PICO DE ACTIVACIÓN
          </button>
        </div>

        <div className="grid grid-cols-7 gap-2">
          {[0, 1, 2, 3, 4, 5, 6].map(idx => (
            <button
              key={idx}
              onClick={() => setDiaSeleccionado(idx)}
              className={`p-2.5 rounded-lg text-center transition-all border ${
                diaSeleccionado === idx
                  ? 'bg-rose-500/20 border-rose-500 text-rose-300 shadow-lg shadow-rose-950/50 scale-105'
                  : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <div className="text-[10px] uppercase font-bold text-slate-400">Día {idx + 1}</div>
              <div className="text-sm font-extrabold my-0.5 text-white">
                {idx === 0 ? 'Hoy' : `+${idx}d`}
              </div>
              <div className="text-[10px] font-mono text-rose-400/90">
                {modoAcumulado ? `${MOCK_SAMPLE_QUEBRADAS[0].acumulada_mm[idx]}mm` : `${MOCK_SAMPLE_QUEBRADAS[0].diaria_mm[idx]}mm`}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* BÚSQUEDA Y LISTADO DE QUEBRADAS EN ACTIVACIÓN */}
      <div className="mb-4 flex items-center justify-between gap-4">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          📍 QUEBRADAS CRÍTICAS DE HUAICOS MONITOREADAS EN TIEMPO REAL ({quebradasFiltradas.length}):
        </span>
        <input
          type="text"
          placeholder="🔍 Buscar quebrada (ej. San Ildefonso, Quirio, Pedregal)..."
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
          className="w-72 bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-rose-500"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {quebradasFiltradas.map((q, idx) => {
          const rainVal = modoAcumulado ? q.acumulada_mm[diaSeleccionado] : q.diaria_mm[diaSeleccionado];
          const smVal = q.saturacion_suelo_pct[diaSeleccionado];
          const iaqVal = q.iaq_scores[diaSeleccionado];
          const estadoText = q.estados_dia[diaSeleccionado];

          return (
            <div
              key={idx}
              onClick={() => setQuebradaDetalle(q)}
              className="bg-slate-950/80 border border-slate-800 hover:border-rose-500/50 p-5 rounded-xl cursor-pointer transition-all hover:shadow-2xl group"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono bg-rose-950/60 text-rose-300 px-2.5 py-0.5 rounded border border-rose-800/60">
                  ID: {q.id_quebrada}
                </span>
                <span className="text-xs font-extrabold text-amber-400">
                  Umbral Crítico: {q.umbral_critico_mm_24h} mm
                </span>
              </div>

              <h3 className="text-base font-extrabold text-white group-hover:text-rose-400 transition-colors">
                {q.nombre}
              </h3>
              <p className="text-xs text-slate-400 mb-3">
                {q.distrito}, {q.provincia} ({q.region}) — Población expuesta en cono: <span className="text-white font-bold">{q.poblacion_cono_deyeccion.toLocaleString()} hab</span>
              </p>

              <div className="grid grid-cols-3 gap-2 py-3 border-t border-b border-slate-900 text-center">
                <div>
                  <span className="text-[10px] text-slate-400 block">Lluvia ({modoAcumulado ? 'Acum' : '24h'})</span>
                  <span className="text-sm font-mono font-bold text-amber-300">{rainVal} mm</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Saturación Suelo</span>
                  <span className="text-sm font-mono font-bold text-cyan-300">{smVal}%</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Índice IAQ</span>
                  <span className="text-sm font-mono font-bold text-rose-400">{iaqVal} / 100</span>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400">Estado de Activación:</span>
                <span className={`text-xs font-extrabold px-3 py-1 rounded-full border ${
                  iaqVal >= 85
                    ? 'bg-rose-600/20 text-rose-400 border-rose-500/50 animate-pulse'
                    : iaqVal >= 65
                    ? 'bg-amber-600/20 text-amber-400 border-amber-500/50'
                    : 'bg-emerald-600/20 text-emerald-400 border-emerald-500/50'
                }`}>
                  {estadoText}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL DETALLE DE QUEBRADA Y DESPACHO DE EVACUACIÓN CAP v1.2 */}
      {quebradaDetalle && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-rose-500/40 rounded-2xl p-6 max-w-xl w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-xs font-mono text-rose-400">{quebradaDetalle.id_quebrada}</span>
                <h3 className="text-xl font-bold text-white">{quebradaDetalle.nombre}</h3>
                <p className="text-xs text-slate-400">{quebradaDetalle.distrito}, {quebradaDetalle.provincia} ({quebradaDetalle.region})</p>
              </div>
              <button onClick={() => setQuebradaDetalle(null)} className="text-slate-400 hover:text-white text-xl font-bold">✕</button>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 text-xs">
              <div className="font-bold text-rose-400 uppercase">⚠️ PUNTOS DE ESTRANGULAMIENTO CRÍTICO EN CONO DE DEYECCIÓN:</div>
              <ul className="list-disc pl-5 text-slate-300 space-y-1">
                {quebradaDetalle.puntos_estrangulamiento.map((pt, i) => (
                  <li key={i}>{pt}</li>
                ))}
              </ul>
            </div>

            <div className="flex gap-2 pt-2">
              <button className="flex-1 bg-rose-600 hover:bg-rose-500 text-white font-extrabold py-2.5 rounded-lg text-xs transition-colors flex items-center justify-center gap-2">
                🚨 EMITIR ALERTA CAP v1.2 / SISMATE DE EVACUACIÓN
              </button>
              <button className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold py-2.5 rounded-lg text-xs transition-colors">
                🗺️ Ver Geovisor 3D de Cuenca
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
