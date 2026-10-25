'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface Voluntario {
  voluntario_id: string;
  codigo_zero_pii: string;
  nombre_completo: string;
  especialidad: string;
  ubigeo_residencia: {
    departamento: string;
    provincia: string;
    distrito: string;
  };
  codigo_certificacion: string;
  estado: string;
  misiones_completadas: number;
}

export default function VoluntariadoEspecializadoPage() {
  const [voluntarios, setVoluntarios] = useState<Voluntario[]>([
    {
      voluntario_id: '1',
      codigo_zero_pii: 'VOL-OCSE-A7F92C3D',
      nombre_completo: 'Dra. María Elena Quispe',
      especialidad: 'VOLUNTARIO_OCSE',
      ubigeo_residencia: { departamento: 'PIURA', provincia: 'PIURA', distrito: 'TAMBOGRANDE' },
      codigo_certificacion: 'OCSE-CERT-2025-8849',
      estado: 'ACTIVO_DISPONIBLE',
      misiones_completadas: 4
    },
    {
      voluntario_id: '2',
      codigo_zero_pii: 'VOL-GRD-B9E41A2F',
      nombre_completo: 'Ing. Carlos Huamán',
      especialidad: 'VOLUNTARIO_GRD',
      ubigeo_residencia: { departamento: 'PIURA', provincia: 'PIURA', distrito: 'CURA MORI' },
      codigo_certificacion: 'INDECI-GRD-2024-1102',
      estado: 'EN_MISION',
      misiones_completadas: 7
    },
    {
      voluntario_id: '3',
      codigo_zero_pii: 'VOL-ACS-C3D8412E',
      nombre_completo: 'Lic. Rosa Melgar',
      especialidad: 'VOLUNTARIO_ACS_MINSA',
      ubigeo_residencia: { departamento: 'PIURA', provincia: 'SULLANA', distrito: 'BELLAVISTA' },
      codigo_certificacion: 'MINSA-ACS-PIURA-0491',
      estado: 'ACTIVO_DISPONIBLE',
      misiones_completadas: 12
    }
  ]);

  const [filtroEspecialidad, setFiltroEspecialidad] = useState<string>('TODOS');
  const [ubigeoDespacho, setUbigeoDespacho] = useState<string>('200101');
  const [notificacion, setNotificacion] = useState<string | null>(null);

  const handleDespachar = () => {
    setNotificacion(`🚀 Despacho telemétrico ejecutado para UBIGEO ${ubigeoDespacho}. 3 Voluntarios especializados asignados a D.S. 124-2026-PCM.`);
    setTimeout(() => setNotificacion(null), 6000);
  };

  const voluntariosFiltrados = filtroEspecialidad === 'TODOS'
    ? voluntarios
    : voluntarios.filter(v => v.especialidad === filtroEspecialidad);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 font-sans">
      {/* Header Bar */}
      <header className="max-w-7xl mx-auto mb-8 flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-800 pb-6 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-3 py-1 bg-red-950 border border-red-500/40 text-red-400 text-xs font-semibold rounded-full uppercase tracking-wider">
              💖 COED Social AMARU
            </span>
            <span className="px-3 py-1 bg-cyan-950 border border-cyan-500/40 text-cyan-400 text-xs font-semibold rounded-full uppercase tracking-wider">
              Red Tripartita de Voluntariados
            </span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
            🦺 Consola de Despacho de Voluntarios Especializados
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Articulación de Voluntarios GRD (Comunidad), Voluntarios OCSE (Compras D8) y ACS MINSA (Triaje Salud)
          </p>
        </div>

        <div className="flex gap-3">
          <Link
            href="/salud/epidemiologia"
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-lg text-sm transition-all shadow-lg shadow-emerald-900/30 flex items-center gap-2"
          >
            🏥 Triaje ACS MINSA
          </Link>
          <Link
            href="/municipal"
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium rounded-lg text-sm transition-all"
          >
            🚜 Consola Municipal
          </Link>
        </div>
      </header>

      {/* Notification Toast */}
      {notificacion && (
        <div className="max-w-7xl mx-auto mb-6 p-4 bg-emerald-950/80 border border-emerald-500/60 text-emerald-200 rounded-xl flex items-center justify-between shadow-2xl backdrop-blur-md animate-pulse">
          <div className="flex items-center gap-3">
            <span className="text-xl">✅</span>
            <span className="text-sm font-semibold">{notificacion}</span>
          </div>
        </div>
      )}

      {/* Summary KPI Dashboard */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl backdrop-blur-md">
          <div className="text-slate-400 text-xs font-medium uppercase">Total Voluntarios Activos</div>
          <div className="text-3xl font-black text-cyan-400 mt-1">2,840</div>
          <div className="text-xs text-slate-500 mt-1">Red Nacional Certificada</div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl backdrop-blur-md">
          <div className="text-slate-400 text-xs font-medium uppercase">⚖️ Voluntarios OCSE (Compras D8)</div>
          <div className="text-3xl font-black text-amber-400 mt-1">620</div>
          <div className="text-xs text-amber-500/80 mt-1">Asesoría Legal a Alcaldes</div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl backdrop-blur-md">
          <div className="text-slate-400 text-xs font-medium uppercase">🦺 Voluntarios GRD (Ollas Comunes)</div>
          <div className="text-3xl font-black text-red-400 mt-1">1,410</div>
          <div className="text-xs text-red-500/80 mt-1">Capacitación Ley 31458</div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl backdrop-blur-md">
          <div className="text-slate-400 text-xs font-medium uppercase">🏥 ACS MINSA (Triaje NTS-105)</div>
          <div className="text-3xl font-black text-emerald-400 mt-1">810</div>
          <div className="text-xs text-emerald-500/80 mt-1">Vigilancia Epidemiológica</div>
        </div>
      </div>

      {/* Dispatch Control Bar */}
      <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Dispatch Action Panel */}
        <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-2xl shadow-xl flex flex-col justify-between">
          <div>
            <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
              ⚡ Despacho Telemétrico a Municipio DS124
            </h2>
            <p className="text-slate-400 text-xs mb-6">
              Emparejamiento geográfico (*Spatial Matchmaking*) para desplegar asistencia legal, comunitaria y médica a distritos en emergencia.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  UBIGEO del Municipio Destino:
                </label>
                <input
                  type="text"
                  value={ubigeoDespacho}
                  onChange={(e) => setUbigeoDespacho(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-cyan-500 font-mono"
                  placeholder="200101 (Ej. Piura)"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Especialidades Requeridas:
                </label>
                <div className="space-y-2 text-xs">
                  <label className="flex items-center gap-2 text-slate-300">
                    <input type="checkbox" defaultChecked className="rounded border-slate-700 bg-slate-950 text-cyan-500" />
                    ⚖️ Voluntarios OCSE (Expedientes D8 Art. 27)
                  </label>
                  <label className="flex items-center gap-2 text-slate-300">
                    <input type="checkbox" defaultChecked className="rounded border-slate-700 bg-slate-950 text-cyan-500" />
                    🦺 Voluntarios GRD (Capacitación Ollas Comunes)
                  </label>
                  <label className="flex items-center gap-2 text-slate-300">
                    <input type="checkbox" defaultChecked className="rounded border-slate-700 bg-slate-950 text-cyan-500" />
                    🏥 Agentes Comunitarios de Salud ACS MINSA
                  </label>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={handleDespachar}
            className="w-full mt-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-cyan-900/40"
          >
            🚀 Activar Despacho Telemétrico Inmediato
          </button>
        </div>

        {/* Right Column: Volunteers List */}
        <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 p-6 rounded-2xl shadow-xl">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              📋 Padrón Certificado de Voluntarios Especializados
            </h2>

            <div className="flex gap-2">
              {['TODOS', 'VOLUNTARIO_OCSE', 'VOLUNTARIO_GRD', 'VOLUNTARIO_ACS_MINSA'].map((esp) => (
                <button
                  key={esp}
                  onClick={() => setFiltroEspecialidad(esp)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    filtroEspecialidad === esp
                      ? 'bg-cyan-600 text-white'
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                  }`}
                >
                  {esp === 'TODOS' ? 'Todos' : esp.replace('VOLUNTARIO_', '')}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            {voluntariosFiltrados.map((v) => (
              <div
                key={v.voluntario_id}
                className="bg-slate-950 border border-slate-800/80 p-4 rounded-xl hover:border-slate-700 transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs text-cyan-400 bg-cyan-950 border border-cyan-800 px-2 py-0.5 rounded">
                      {v.codigo_zero_pii}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                      v.especialidad === 'VOLUNTARIO_OCSE' ? 'bg-amber-950 text-amber-400 border border-amber-800' :
                      v.especialidad === 'VOLUNTARIO_GRD' ? 'bg-red-950 text-red-400 border border-red-800' :
                      'bg-emerald-950 text-emerald-400 border border-emerald-800'
                    }`}>
                      {v.especialidad.replace('VOLUNTARIO_', '')}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-white">{v.nombre_completo}</h3>
                  <p className="text-xs text-slate-400">
                    📍 Residencia: {v.ubigeo_residencia.distrito} - {v.ubigeo_residencia.provincia} ({v.ubigeo_residencia.departamento})
                  </p>
                  <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                    Certificación: {v.codigo_certificacion}
                  </p>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-2">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                    v.estado === 'ACTIVO_DISPONIBLE'
                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                      : 'bg-amber-950 text-amber-400 border border-amber-800 animate-pulse'
                  }`}>
                    {v.estado === 'ACTIVO_DISPONIBLE' ? '🟢 Disponible' : '🟧 En Misión DS124'}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Misiones: <strong className="text-white">{v.misiones_completadas}</strong>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
