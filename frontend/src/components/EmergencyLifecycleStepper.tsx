"use client";

import React from "react";
import Link from "next/link";
import {
    AlertTriangle,
    FileText,
    ShieldCheck,
    Truck,
    Lock,
    Check,
    ChevronRight
} from "lucide-react";

export type EmergencyStepId = "alerta" | "edan" | "quorum" | "logistica" | "worm";

interface StepConfig {
    id: EmergencyStepId;
    num: number;
    titulo: string;
    subtitulo: string;
    href: string;
    icon: React.ElementType;
}

const PASOS: StepConfig[] = [
    {
        id: "alerta",
        num: 1,
        titulo: "Alerta & WhatsApp",
        subtitulo: "Reportes de campo",
        href: "/edan?tab=whatsapp",
        icon: AlertTriangle
    },
    {
        id: "edan",
        num: 2,
        titulo: "Ficha EDAN Digital",
        subtitulo: "SINPAD v2 / BAE",
        href: "/edan",
        icon: FileText
    },
    {
        id: "quorum",
        num: 3,
        titulo: "Quórum Dual",
        subtitulo: "COEL + PNP (Ley 27269)",
        href: "/edan?tab=previsualizacion",
        icon: ShieldCheck
    },
    {
        id: "logistica",
        num: 4,
        titulo: "Ruteo Humanitario",
        subtitulo: "Convoy Anti-Corte",
        href: "/logistica",
        icon: Truck
    },
    {
        id: "worm",
        num: 5,
        titulo: "Auditoría WORM CGR",
        subtitulo: "Cadena SHA-256",
        href: "/edan?tab=worm",
        icon: Lock
    }
];

interface StepperProps {
    currentStep: EmergencyStepId;
    distrito?: string;
    ubigeo?: string;
}

export default function EmergencyLifecycleStepper({ currentStep, distrito, ubigeo }: StepperProps) {
    const currentStepIndex = PASOS.findIndex((p) => p.id === currentStep);

    return (
        <div className="w-full bg-slate-900/90 border border-slate-800 rounded-2xl p-3.5 mb-6 shadow-xl">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-3 mb-3 border-b border-slate-800/80 gap-2">
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
                        Ciclo Operativo de Respuesta Inmediata
                    </span>
                    {distrito && (
                        <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-800">
                            Jurisdicción: <strong className="text-white">{distrito}</strong> {ubigeo ? `(${ubigeo})` : ""}
                        </span>
                    )}
                </div>
                <div className="text-[10px] text-slate-400 font-mono">
                    Flujo Homologado: SINAGERD • INDECI • CGR Ley 31358
                </div>
            </div>

            {/* Stepper Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {PASOS.map((paso, idx) => {
                    const Icon = paso.icon;
                    const isCompleted = idx < currentStepIndex;
                    const isCurrent = idx === currentStepIndex;

                    let cardClass = "border-slate-800/80 bg-slate-950/60 text-slate-400 hover:border-slate-700";
                    let badgeClass = "bg-slate-800 text-slate-400";
                    let iconColor = "text-slate-400";

                    if (isCompleted) {
                        cardClass = "border-emerald-600/50 bg-emerald-950/20 text-emerald-200";
                        badgeClass = "bg-emerald-600 text-slate-950 font-bold";
                        iconColor = "text-emerald-400";
                    } else if (isCurrent) {
                        cardClass = "border-amber-500 bg-amber-950/30 text-white shadow-lg shadow-amber-500/10";
                        badgeClass = "bg-amber-500 text-slate-950 font-black animate-pulse";
                        iconColor = "text-amber-400";
                    }

                    return (
                        <Link
                            key={paso.id}
                            href={paso.href}
                            className={`p-2.5 rounded-xl border flex items-center gap-2.5 transition text-left group ${cardClass}`}
                        >
                            <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 ${badgeClass}`}>
                                {isCompleted ? <Check className="w-3.5 h-3.5" /> : paso.num}
                            </div>
                            <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-1">
                                    <Icon className={`w-3 h-3 ${iconColor}`} />
                                    <span className="text-[11px] font-bold truncate block">
                                        {paso.titulo}
                                    </span>
                                </div>
                                <span className="text-[9px] text-slate-400 block truncate">
                                    {paso.subtitulo}
                                </span>
                            </div>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
