'use client';

import React, { useState } from 'react';
import Link from 'next/link';

interface TicketTriaje {
  ticket_id: string;
  cup_code: string;
  distrito: string;
  prioridad: string;
  sintomas: string[];
  vulnerable: boolean;
  fecha: string;
}

export default function EpidemiologiaSaludPage() {
  const [tickets, setTickets] = useState<TicketTriaje[]>([
    {
      ticket_id: 'TRJ-8849A1',
      cup_code: 'CUP-MINSA-45129',
      distrito: 'TAMBOGRANDE',
      prioridad: 'PRIORIDAD_I_EMERGENCIA_VITAL',
      sintomas: ['DIFICULTAD_RESPIRATORIA', 'FIEBRE_ALTA_PERSISTENTE'],
      vulnerable: true,
      fecha: '2026-10-09 16:30'
    },
    {
      ticket_id: 'TRJ-9921B2',
      cup_code: 'CUP-MINSA-77812',
      distrito: 'CURA MORI',
      prioridad: 'PRIORIDAD_II_URGENCIA_MAYOR',
      sintomas: ['FIEBRE_MODERADA', 'DOLOR_MUSCULAR_DENGUE'],
      vulnerable: false,
      fecha: '2026-10-09 17:15'
    },
    {
      ticket_id: 'TRJ-1102C3',
      cup_code: 'CUP-MINSA-12098',
      distrito: 'BELLAVISTA',
      prioridad: 'PRIORIDAD_III_PACIENTE_LEVE',
      sintomas: ['DESHIDRATACION_LEVE'],
      vulnerable: false,
      fecha: '2026-10-09 17:40'
    }
  ]);

  const [distritoSeleccionado, setDistritoSeleccionado] = useState<string>('TAMBOGRANDE');
  const [alertaProc, setAlertaProc] = useState<string | null>(null);

  const handleProcesarTicket = (ticketId: string) => {
    setAlertaProc(`✅ Ticket ${ticketId} atendido por la Brigada ACS MINSA en albergue de Tambogrande.`);
    setTimeout(() => setAlertaProc(null), 5000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 font-sans">
      {/* Header */}
      <header className="max-w-7xl mx-auto mb-8 flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-800 pb-6 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-3 py-1 bg-emerald-950 border border-emerald-500/40 text-emerald-400 text-xs font-semibold rounded-full uppercase tracking-wider">
              🏥 MINSA Salud Comunitaria
            </span>
            <span className="px-3 py-1 bg-cyan-950 border border-cyan-500/40 text-cyan-400 text-xs font-semibold rounded-full uppercase tracking-wider">
              Norma Técnica NTS-105
            </span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
            🔬 Consola de Triaje & Vigilancia Epidemiológica ACS
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Monitoreo en tiempo real de brotes metaxénicos (Dengue, Leptospirosis, EDAs) y triaje preventivo por Agentes Comunitarios
          </p>
        </div>

        <div className="flex gap-3">
          <Link
            href="/social/voluntarios"
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium rounded-lg text-sm transition-all"
          >
            🦺 Red de Voluntarios
          </Link>
          <Link
            href="/meteo"
            className="px-4 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-medium rounded-lg text-sm transition-all shadow-lg shadow-cyan-900/30"
          >
            🛰️ Consola Meteo 7D
          </Link>
        </div>
      </header>

      {/* Notification Toast */}
      {alertaProc && (
        <div className="max-w-7xl mx-auto mb-6 p-4 bg-emerald-950/80 border border-emerald-500/60 text-emerald-200 rounded-xl flex items-center justify-between shadow-2xl backdrop-blur-md">
          <div className="flex items-center gap-3">
            <span className="text-xl">✅</span>
            <span className="text-sm font-semibold">{alertaProc}</span>
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl backdrop-blur-md">
          <div className="text-slate-400 text-xs font-medium uppercase">Índice de Riesgo Vectorial (IRE)</div>
          <div className="text-3xl font-black text-red-500 mt-1">0.82 / 1.0</div>
          <div className="text-xs text-red-400 mt-1">🚨 Alerta Crítica Dengue / Leptospirosis</div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl backdrop-blur-md">
          <div className="text-slate-400 text-xs font-medium uppercase">Atenciones NTS-105 Hoy</div>
          <div className="text-3xl font-black text-cyan-400 mt-1">418</div>
          <div className="text-xs text-slate-400 mt-1">Triajes por ACS en Albergues</div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl backdrop-blur-md">
          <div className="text-slate-400 text-xs font-medium uppercase">Casos Emergencia Prioridad I</div>
          <div className="text-3xl font-black text-red-400 mt-1">14</div>
          <div className="text-xs text-red-400 mt-1">Evacuación Hospital de Campaña</div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl backdrop-blur-md">
          <div className="text-slate-400 text-xs font-medium uppercase">Kits Agua Segura Entregados</div>
          <div className="text-3xl font-black text-emerald-400 mt-1">1,250</div>
          <div className="text-xs text-emerald-400 mt-1">Ollas Comunes y Albergues</div>
        </div>
      </div>

      {/* Content Section */}
      <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Vector Control Panel */}
        <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-2xl shadow-xl">
          <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
            🦟 Monitoreo de Brotes Epidemiológicos Post-Lluvia
          </h2>
          <p className="text-slate-400 text-xs mb-6">
            Cálculo del IRE combinando temperatura ambiente, días de agua estancada y densidad poblacional.
          </p>

          <div className="space-y-4">
            <div className="p-4 bg-slate-950 border border-red-500/40 rounded-xl">
              <div className="text-xs text-red-400 font-bold uppercase tracking-wider mb-1">
                Distrito: Tambogrande (Ubigeo 200114)
              </div>
              <div className="text-sm font-semibold text-white">
                Fumigación & Abatización Larvaria
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Foco detectado en 3 albergues temporales. Coordenadas telemétricas enviadas a la DIRESA Piura.
              </p>
            </div>

            <div className="p-4 bg-slate-950 border border-amber-500/40 rounded-xl">
              <div className="text-xs text-amber-400 font-bold uppercase tracking-wider mb-1">
                Distrito: Cura Mori (Ubigeo 200107)
              </div>
              <div className="text-sm font-semibold text-white">
                Prevención de Leptospirosis y EDAs
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Despliegue de 15 Agentes Comunitarios con pastillas potabilizadoras de agua.
              </p>
            </div>
          </div>
        </div>

        {/* Right: Triaje Queue */}
        <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 p-6 rounded-2xl shadow-xl">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            📋 Cola de Triaje Clínico NTS-105 (Tríada Zero-PII `CUP-MINSA`)
          </h2>

          <div className="space-y-3">
            {tickets.map((t) => (
              <div
                key={t.ticket_id}
                className="bg-slate-950 border border-slate-800 p-4 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs text-cyan-400 bg-cyan-950 border border-cyan-800 px-2 py-0.5 rounded">
                      {t.cup_code}
                    </span>
                    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded uppercase ${
                      t.prioridad === 'PRIORIDAD_I_EMERGENCIA_VITAL'
                        ? 'bg-red-950 text-red-400 border border-red-800 animate-pulse'
                        : t.prioridad === 'PRIORIDAD_II_URGENCIA_MAYOR'
                        ? 'bg-amber-950 text-amber-400 border border-amber-800'
                        : 'bg-yellow-950 text-yellow-400 border border-yellow-800'
                    }`}>
                      {t.prioridad.replace('PRIORIDAD_', '').replace('_', ' ')}
                    </span>
                  </div>

                  <div className="text-xs text-slate-400">
                    📍 Distrito: <strong className="text-white">{t.distrito}</strong> | Atendido: {t.fecha}
                  </div>
                  <div className="text-xs text-slate-300 mt-1">
                    Síntomas: <span className="text-slate-400 font-mono">{t.sintomas.join(', ')}</span>
                  </div>
                </div>

                <button
                  onClick={() => handleProcesarTicket(t.ticket_id)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs transition-all shadow-md"
                >
                  Atender Ficha
                </button>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
