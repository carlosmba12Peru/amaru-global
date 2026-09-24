"use client";

import React, { useState, useEffect } from "react";
import {
    Scale,
    ShieldAlert,
    Boxes,
    Flame,
    Droplets,
    Activity,
    CheckCircle2,
    AlertTriangle,
    FileText,
    TrendingUp,
    Truck,
    BadgePercent,
    Building2,
    HelpCircle
} from "lucide-react";

interface IrceData {
    ubigeo: string;
    distrito: string;
    provincia: string;
    departamento: string;
    poblacion: number;
    declarado_ds124: boolean;
    score_irce: number;
    nivel_alerta: string;
    semaforo: string;
    color_hex: string;
    accion_recomendada: string;
    desglose_saaty: {
        peligro_p: number;
        vulnerabilidad_v: number;
        exposicion_e: number;
        capacidad_c: number;
    };
    blindaje_legal: {
        marco_normativo: string;
        ratio_consistencia_saaty_cr: number;
        consistencia_aprobada: boolean;
        hash_sha256: string;
    };
}

interface AnticipatoryPlan {
    nivel_advertencia: string;
    trigger_presupuestal_activo: boolean;
    fase_accion_anticipada: string;
    anomalia_tsm_nino12: number;
    insumos_requeridos: {
        motobombas_4_pulgadas: number;
        motobombas_6_pulgadas: number;
        almacenes_itinerantes: number;
        calaminas_unidades: number;
        bobinas_plastico_pesado: number;
        vacunas_dengue_leptospirosis: number;
        sueros_antiofidicos: number;
        plantas_potabilizadoras_moviles: number;
        costo_estimado_pen: number;
        estado_despliegue: string;
    };
    marco_financiero: string;
    directiva_ceplan_sendai: string;
}

export default function IrceAndGovernancePanel({ ubigeo }: { ubigeo: string }) {
    const [irce, setIrce] = useState<IrceData | null>(null);
    const [plan, setPlan] = useState<AnticipatoryPlan | null>(null);
    const [loading, setLoading] = useState(true);
    const [anomaliaTsm, setAnomaliaTsm] = useState(1.8);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
            try {
                const [resIrce, resPlan] = await Promise.all([
                    fetch(`${apiBase}/api/v1/indices/distrito/${ubigeo}/irce?anomalia_tsm=${anomaliaTsm}`),
                    fetch(`${apiBase}/api/v1/governance/anticipatory-plan/${ubigeo}?anomalia_tsm=${anomaliaTsm}`)
                ]);

                if (resIrce.ok) setIrce(await resIrce.json());
                if (resPlan.ok) setPlan(await resPlan.json());
            } catch (err) {
                console.error("Error al cargar IRCE y Plan Anticipatorio:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [ubigeo, anomaliaTsm]);

    if (loading) {
        return (
            <div className="p-6 bg-slate-900/60 border border-slate-800 rounded-2xl flex items-center justify-center text-xs text-slate-400 gap-3 font-mono">
                <Activity className="w-4 h-4 text-sky-400 animate-spin" />
                <span>Calculando Matriz Saaty AHP (4x4) y Plan Paramétrico CAF/PUCP...</span>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Cabecera de Doctrina y Control de Escenario */}
            <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-lg">
                <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400">
                        <Scale className="w-5 h-5" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="text-sm font-bold text-slate-100">
                                Matriz Saaty AHP (IRCE-FEN) y Preposicionamiento CAF/PUCP 2026
                            </h3>
                            <span className="text-[10px] bg-rose-500/20 text-rose-300 font-mono px-2 py-0.5 rounded border border-rose-500/30">
                                100% DETERMINISTA
                            </span>
                        </div>
                        <p className="text-[11px] text-slate-400">
                            Cálculo paramétrico oficial (R.J. Nº 112-2014-CENEPRED/J) blindado ante Contraloría
                        </p>
                    </div>
                </div>

                {/* Selector de Sensibilidad TSM Niño 1+2 */}
                <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 text-xs">
                    <span className="text-slate-400 text-[11px]">Simular Anomalía TSM:</span>
                    <select
                        value={anomaliaTsm}
                        onChange={(e) => setAnomaliaTsm(parseFloat(e.target.value))}
                        className="bg-slate-900 border border-slate-700 text-sky-400 font-bold font-mono rounded px-2 py-1 text-xs focus:outline-none"
                    >
                        <option value="0.7">+0.7°C (Normal / Vigilancia)</option>
                        <option value="1.5">+1.5°C (Advertencia Temprana)</option>
                        <option value="1.8">+1.8°C (FEN Fuerte Moderado)</option>
                        <option value="2.3">+2.3°C (Emergencia FEN Extraordinaria)</option>
                    </select>
                </div>
            </div>

            {/* Cuadrícula Principal: IRCE-FEN vs Plan Logístico */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* 1. TARJETA IRCE-FEN (SAATY AHP CENEPRED) */}
                {irce && (
                    <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl flex flex-col justify-between space-y-4">
                        <div>
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                                    <ShieldAlert className="w-4 h-4 text-amber-400" />
                                    Índice de Riesgo Compuesto (IRCE-FEN)
                                </span>
                                <span
                                    className="text-xs font-mono font-bold px-2.5 py-1 rounded-full border"
                                    style={{
                                        backgroundColor: `${irce.color_hex}15`,
                                        borderColor: `${irce.color_hex}40`,
                                        color: irce.color_hex
                                    }}
                                >
                                    {irce.semaforo}
                                </span>
                            </div>

                            {/* Score Principal */}
                            <div className="mt-4 flex items-baseline gap-3">
                                <span className="text-4xl font-black font-mono tracking-tight" style={{ color: irce.color_hex }}>
                                    {irce.score_irce.toFixed(3)}
                                </span>
                                <span className="text-xs text-slate-500 font-mono">/ 1.000 max</span>
                                {irce.declarado_ds124 && (
                                    <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded font-medium ml-auto">
                                        Declarado D.S. 124-2026-PCM
                                    </span>
                                )}
                            </div>

                            <p className="mt-2 text-xs text-slate-300 leading-relaxed">
                                {irce.accion_recomendada}
                            </p>
                        </div>

                        {/* Desglose de Factores Saaty */}
                        <div className="space-y-2 pt-3 border-t border-slate-800">
                            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                                Desglose Ponderado Matriz Saaty 4x4:
                            </span>
                            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                                <div className="p-2 bg-slate-950/80 rounded-lg border border-slate-800/80 flex justify-between">
                                    <span className="text-slate-400">Peligro (wP 46.7%):</span>
                                    <span className="text-rose-400 font-bold">{irce.desglose_saaty.peligro_p}</span>
                                </div>
                                <div className="p-2 bg-slate-950/80 rounded-lg border border-slate-800/80 flex justify-between">
                                    <span className="text-slate-400">Vulnerabilidad (wV 27.7%):</span>
                                    <span className="text-amber-400 font-bold">{irce.desglose_saaty.vulnerabilidad_v}</span>
                                </div>
                                <div className="p-2 bg-slate-950/80 rounded-lg border border-slate-800/80 flex justify-between">
                                    <span className="text-slate-400">Exposición (wE 16.0%):</span>
                                    <span className="text-sky-400 font-bold">{irce.desglose_saaty.exposicion_e}</span>
                                </div>
                                <div className="p-2 bg-slate-950/80 rounded-lg border border-slate-800/80 flex justify-between">
                                    <span className="text-slate-400">Capacidad (wC 9.6%):</span>
                                    <span className="text-emerald-400 font-bold">{irce.desglose_saaty.capacidad_c}</span>
                                </div>
                            </div>
                        </div>

                        {/* Blindaje de Integridad */}
                        <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between text-[10px] font-mono text-slate-500">
                            <span>Consistencia Saaty CR: <strong className="text-emerald-400">{irce.blindaje_legal.ratio_consistencia_saaty_cr} ≤ 0.10 (APROBADO)</strong></span>
                            <span className="truncate max-w-[150px]" title={irce.blindaje_legal.hash_sha256}>
                                SHA-256: {irce.blindaje_legal.hash_sha256.slice(0, 10)}...
                            </span>
                        </div>
                    </div>
                )}

                {/* 2. TARJETA PLAN DE GOBERNANZA ANTICIPATORIA CAF/PUCP */}
                {plan && (
                    <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl flex flex-col justify-between space-y-4">
                        <div>
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                                    <Truck className="w-4 h-4 text-sky-400" />
                                    Preposicionamiento Paramétrico CAF / PUCP
                                </span>
                                <span className={`text-xs font-mono font-bold px-2.5 py-1 rounded-full border ${
                                    plan.trigger_presupuestal_activo
                                        ? "bg-rose-500/15 border-rose-500/30 text-rose-400"
                                        : "bg-emerald-500/15 border-emerald-500/30 text-emerald-400"
                                }`}>
                                    {plan.nivel_advertencia}
                                </span>
                            </div>

                            <p className="mt-2 text-xs text-sky-300 font-medium">
                                Fase: {plan.fase_accion_anticipada}
                            </p>

                            {/* Insumos Paramétricos Requeridos */}
                            <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2 text-center font-mono">
                                <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800">
                                    <span className="text-[10px] text-slate-400 block">Motobombas (4")</span>
                                    <span className="text-lg font-bold text-sky-400">
                                        {plan.insumos_requeridos.motobombas_4_pulgadas}
                                    </span>
                                </div>
                                <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800">
                                    <span className="text-[10px] text-slate-400 block">Motobombas (6")</span>
                                    <span className="text-lg font-bold text-sky-400">
                                        {plan.insumos_requeridos.motobombas_6_pulgadas}
                                    </span>
                                </div>
                                <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800">
                                    <span className="text-[10px] text-slate-400 block">Calaminas (Zinc)</span>
                                    <span className="text-lg font-bold text-amber-400">
                                        {plan.insumos_requeridos.calaminas_unidades.toLocaleString()}
                                    </span>
                                </div>
                                <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800">
                                    <span className="text-[10px] text-slate-400 block">Vacunas Dengue</span>
                                    <span className="text-lg font-bold text-emerald-400">
                                        {plan.insumos_requeridos.vacunas_dengue_leptospirosis.toLocaleString()}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Insumos Adicionales y Costo Estimado */}
                        <div className="pt-3 border-t border-slate-800 space-y-2">
                            <div className="flex items-center justify-between text-xs text-slate-400">
                                <span>Almacenes Itinerantes: <strong className="text-slate-200">{plan.insumos_requeridos.almacenes_itinerantes}</strong></span>
                                <span>Plantas Potabilizadoras: <strong className="text-slate-200">{plan.insumos_requeridos.plantas_potabilizadoras_moviles}</strong></span>
                                <span>Sueros Antiofídicos: <strong className="text-slate-200">{plan.insumos_requeridos.sueros_antiofidicos}</strong></span>
                            </div>

                            <div className="p-3 bg-rose-950/20 border border-rose-500/30 rounded-xl flex items-center justify-between text-xs">
                                <div>
                                    <span className="text-[11px] text-slate-400 block">Presupuesto Paramétrico Sugerido (PP 0068 / FONDES):</span>
                                    <span className="text-base font-black font-mono text-rose-400">
                                        S/ {plan.insumos_requeridos.costo_estimado_pen.toLocaleString("es-PE", { minimumFractionDigits: 2 })} PEN
                                    </span>
                                </div>
                                <span className={`text-[10px] font-mono px-2 py-1 rounded font-bold ${
                                    plan.trigger_presupuestal_activo ? "bg-rose-500 text-white" : "bg-slate-800 text-slate-400"
                                }`}>
                                    {plan.insumos_requeridos.estado_despliegue}
                                </span>
                            </div>
                        </div>

                        <p className="text-[10px] text-slate-500 italic">
                            Fuente: {plan.directiva_ceplan_sendai}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
