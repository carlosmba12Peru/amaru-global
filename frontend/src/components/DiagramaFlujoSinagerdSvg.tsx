"use client";

import React, { useState } from "react";
import {
    ShieldAlert,
    Building2,
    Lock,
    ArrowDown,
    ArrowRight,
    Info,
    CheckCircle2,
    HeartPulse,
    Wheat,
    Home,
    Building,
    Users,
    Scale,
    Activity
} from "lucide-react";

interface NodeDetail {
    title: string;
    level: string;
    color: string;
    description: string;
    baseLegal: string;
    entregable: string;
}

export default function DiagramaFlujoSinagerdSvg() {
    const [selectedNode, setSelectedNode] = useState<NodeDetail | null>({
        title: "ALCALDÍA MUNICIPAL / GT-GRD",
        level: "Nivel 2 • Gestión Local",
        color: "amber",
        description: "Ente ejecutor del auxilio perentorio. Activa la contratación directa de maquinaria (Art. 27 Ley 30225) y aprueba los padrones EDAN 2A/2B.",
        baseLegal: "Ley N.º 29664 Art. 12 / Ley N.º 30225 Art. 27 b / PP 0068",
        entregable: "Ficha EDAN 2A/2B & Acta de Adjudicación Directa"
    });

    const nodes: Record<string, NodeDetail> = {
        minsa: {
            title: "MINSA (COE-Salud)",
            level: "Nivel 1 • Sectorial Salud",
            color: "rose",
            description: "Triaje masivo de salud bajo la NTS-105-MINSA, prioridad de camas hospitalarias y despliegue de brigadas de atención médica.",
            baseLegal: "Ley N.º 29664 Art. 14 / NTS-105-MINSA",
            entregable: "CUP-MINSA (Triaje Vital)"
        },
        midagri: {
            title: "MIDAGRI (Seguro SAC)",
            level: "Nivel 1 • Sectorial Agrario",
            color: "amber",
            description: "Indemnización de hectáreas perdidas y mortandad alpaquera/ovina por heladas mediante el Seguro Agrícola Catastrófico.",
            baseLegal: "D.S. N.º 002-2024-MIDAGRI",
            entregable: "CUP-AGRO (Seguro Catastrófico)"
        },
        mvcs: {
            title: "MVCS (Vivienda & BAE)",
            level: "Nivel 1 • Sectorial Hábitat",
            color: "cyan",
            description: "Otorgamiento del Bono de Arrendamiento para Emergencias (BAE S/ 500/mes) para familias con viviendas colapsadas o inhabitables.",
            baseLegal: "Ley N.º 31526 (Bono BAE)",
            entregable: "CUP-DAMN (Bono BAE S/ 500)"
        },
        indeci: {
            title: "INDECI / COEN",
            level: "Nivel 2 • Coordinación Técnica",
            color: "slate",
            description: "Administrador de la Bóveda del SINPAD y gestor de los Almacenes Nacionales de Bienes de Ayuda Humanitaria (BAH).",
            baseLegal: "Ley N.º 29664 Art. 10",
            entregable: "Resguardo SINPAD & Almacenes BAH"
        },
        gore: {
            title: "GORE / COER",
            level: "Nivel 2 • Nivel Regional",
            color: "cyan",
            description: "Coordinador del auxilio en el nivel 4 de emergencia cuando la capacidad operativa municipal es rebasada.",
            baseLegal: "Ley N.º 29664 Art. 11",
            entregable: "Consolidado Regional & Maquinaria Reg."
        },
        alcalde: {
            title: "ALCALDÍA MUNICIPAL / GT-GRD",
            level: "Nivel 2 • Gestión Local",
            color: "amber",
            description: "Ente ejecutor del auxilio perentorio. Activa la contratación directa de maquinaria (Art. 27 Ley 30225) y aprueba los padrones EDAN 2A/2B.",
            baseLegal: "Ley N.º 29664 Art. 12 / Ley N.º 30225 Art. 27 b / PP 0068",
            entregable: "Ficha EDAN 2A/2B & Acta de Adjudicación Directa"
        },
        comunidad: {
            title: "SOCIEDAD ORGANIZADA",
            level: "Nivel 3 • Sensado Comunitario",
            color: "emerald",
            description: "JUVESC, Rondas Campesinas y Comités Vecinales actuando como sensores humanos en territorio para alertar desbordes y damnificados.",
            baseLegal: "Resiliencia Ciudadana / SINAGERD",
            entregable: "Reportes Ciudadanos & Alerta Temprana"
        },
        cgr: {
            title: "CONTRALORÍA GENERAL (CGR)",
            level: "Nivel 3 • Fiscalización y Control",
            color: "yellow",
            description: "Aplica la Ley N.º 31358 de Control Concurrente. Verifica la legalidad sin paralizar el auxilio humanitario de emergencia.",
            baseLegal: "Ley N.º 31358 (Control Concurrente)",
            entregable: "Hito de Control WORM"
        },
        polygon: {
            title: "POLYGON BLOCKCHAIN L3",
            level: "Nivel 3 • Fe Pública Inmutable",
            color: "purple",
            description: "Anclaje notarial en el Smart Contract ClimateAuditAnchor.sol de la Raíz de Merkle de los eventos para auditoría incorruptible.",
            baseLegal: "Fe Pública Criptográfica Externa",
            entregable: "TxHash On-Chain & PolygonScan Proof"
        }
    };

    return (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl space-y-5">
            {/* Header del Diagrama */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-800 pb-3">
                <div>
                    <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                        <Activity className="w-5 h-5 text-indigo-400" />
                        Mapa Conceptual Interactivo: Flujo Relacional SINAGERD
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                        Diagrama de bloques y líneas de conexión entre el Nivel Nacional, el Mando Municipal y la Fe Pública Blockchain. haz clic en cualquier nodo para ver su rol.
                    </p>
                </div>
                <span className="text-[10px] font-mono bg-indigo-950 text-indigo-300 border border-indigo-800 px-3 py-1 rounded-full font-bold">
                    ESQUEMA VECTORIAL INTERACTIVO SVG
                </span>
            </div>

            {/* ESQUEMA VECTORIAL SVG Y NODOS CLICKABLES */}
            <div className="bg-slate-950 rounded-2xl p-4 border border-slate-800 space-y-6 relative overflow-hidden">
                {/* SVG DE LÍNEAS CONECTORAS CON FLECHAS */}
                <div className="w-full overflow-x-auto">
                    <div className="min-w-[750px] space-y-8 py-2">
                        {/* ----------------------------------------------------------------- */}
                        {/* NIVEL 1: SECTORES NACIONALES (ARRIBA)                             */}
                        {/* ----------------------------------------------------------------- */}
                        <div>
                            <div className="text-[11px] font-mono font-bold text-rose-400 mb-2 flex items-center gap-1.5 uppercase tracking-wider">
                                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                                <span>1. NIVEL NACIONAL SECTORIAL (Políticas & Sustento Asistencial)</span>
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <button
                                    onClick={() => setSelectedNode(nodes.minsa)}
                                    className={`p-3 rounded-xl border text-left transition ${
                                        selectedNode?.title.includes("MINSA")
                                            ? "bg-rose-950 border-rose-500 ring-2 ring-rose-500/50 scale-[1.02]"
                                            : "bg-slate-900 border-slate-800 hover:border-rose-800/60"
                                    }`}
                                >
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-xs font-bold text-white flex items-center gap-1.5">
                                            <HeartPulse className="w-4 h-4 text-rose-400" /> MINSA
                                        </span>
                                        <span className="text-[9px] font-mono bg-rose-950 text-rose-300 px-1.5 py-0.5 rounded border border-rose-800">
                                            CUP-MINSA
                                        </span>
                                    </div>
                                    <span className="text-[10px] text-slate-400 block">COE-Salud / NTS-105</span>
                                </button>

                                <button
                                    onClick={() => setSelectedNode(nodes.midagri)}
                                    className={`p-3 rounded-xl border text-left transition ${
                                        selectedNode?.title.includes("MIDAGRI")
                                            ? "bg-amber-950 border-amber-500 ring-2 ring-amber-500/50 scale-[1.02]"
                                            : "bg-slate-900 border-slate-800 hover:border-amber-800/60"
                                    }`}
                                >
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-xs font-bold text-white flex items-center gap-1.5">
                                            <Wheat className="w-4 h-4 text-amber-400" /> MIDAGRI
                                        </span>
                                        <span className="text-[9px] font-mono bg-amber-950 text-amber-300 px-1.5 py-0.5 rounded border border-amber-800">
                                            CUP-AGRO
                                        </span>
                                    </div>
                                    <span className="text-[10px] text-slate-400 block">Seguro Catastrófico (SAC)</span>
                                </button>

                                <button
                                    onClick={() => setSelectedNode(nodes.mvcs)}
                                    className={`p-3 rounded-xl border text-left transition ${
                                        selectedNode?.title.includes("MVCS")
                                            ? "bg-cyan-950 border-cyan-500 ring-2 ring-cyan-500/50 scale-[1.02]"
                                            : "bg-slate-900 border-slate-800 hover:border-cyan-800/60"
                                    }`}
                                >
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-xs font-bold text-white flex items-center gap-1.5">
                                            <Home className="w-4 h-4 text-cyan-400" /> MVCS
                                        </span>
                                        <span className="text-[9px] font-mono bg-cyan-950 text-cyan-300 px-1.5 py-0.5 rounded border border-cyan-800">
                                            CUP-DAMN
                                        </span>
                                    </div>
                                    <span className="text-[10px] text-slate-400 block">Bono BAE S/ 500</span>
                                </button>
                            </div>
                        </div>

                        {/* FLECHAS DE CONEXIÓN VECTORIAL HACIA EL NIVEL 2 */}
                        <div className="flex justify-around items-center text-slate-600 my-1">
                            <div className="flex flex-col items-center">
                                <div className="h-6 w-0.5 bg-gradient-to-b from-rose-500 to-amber-500" />
                                <ArrowDown className="w-4 h-4 text-amber-500 -mt-1" />
                            </div>
                            <div className="flex flex-col items-center">
                                <div className="h-6 w-0.5 bg-gradient-to-b from-amber-500 to-amber-500" />
                                <ArrowDown className="w-4 h-4 text-amber-500 -mt-1" />
                            </div>
                            <div className="flex flex-col items-center">
                                <div className="h-6 w-0.5 bg-gradient-to-b from-cyan-500 to-amber-500" />
                                <ArrowDown className="w-4 h-4 text-amber-500 -mt-1" />
                            </div>
                        </div>

                        {/* ----------------------------------------------------------------- */}
                        {/* NIVEL 2: MANDO Y GESTIÓN LOCAL (CENTRO)                           */}
                        {/* ----------------------------------------------------------------- */}
                        <div>
                            <div className="text-[11px] font-mono font-bold text-amber-400 mb-2 flex items-center gap-1.5 uppercase tracking-wider">
                                <Building2 className="w-4 h-4 text-amber-400" />
                                <span>2. NODO CENTRAL DE COMANDO &amp; GESTIÓN EDIL (Alcaldía)</span>
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <button
                                    onClick={() => setSelectedNode(nodes.indeci)}
                                    className={`p-3 rounded-xl border text-left transition ${
                                        selectedNode?.title.includes("INDECI")
                                            ? "bg-slate-800 border-slate-500 ring-2 ring-slate-500/50 scale-[1.02]"
                                            : "bg-slate-900 border-slate-800 hover:border-slate-700"
                                    }`}
                                >
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-xs font-bold text-white flex items-center gap-1.5">
                                            <Building className="w-4 h-4 text-slate-300" /> INDECI / COEN
                                        </span>
                                        <span className="text-[9px] font-mono bg-slate-950 text-slate-300 px-1.5 py-0.5 rounded border border-slate-800">
                                            SINPAD
                                        </span>
                                    </div>
                                    <span className="text-[10px] text-slate-400 block">Bóveda C2 / Almacenes BAH</span>
                                </button>

                                <button
                                    onClick={() => setSelectedNode(nodes.alcalde)}
                                    className={`p-3.5 rounded-xl border text-left transition shadow-lg ${
                                        selectedNode?.title.includes("ALCALDÍA")
                                            ? "bg-amber-950 border-amber-400 ring-2 ring-amber-400 scale-105"
                                            : "bg-gradient-to-br from-amber-950/80 to-slate-900 border-amber-600/70 hover:border-amber-500"
                                    }`}
                                >
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-xs font-black text-amber-300 flex items-center gap-1.5">
                                            <Building2 className="w-4 h-4 text-amber-400" /> ALCALDÍA / GT-GRD
                                        </span>
                                        <span className="text-[9px] font-mono bg-amber-500 text-slate-950 px-1.5 py-0.5 rounded font-black">
                                            PP 0068
                                        </span>
                                    </div>
                                    <span className="text-[10px] text-amber-200/90 block font-semibold">
                                        Ficha EDAN 2A/2B &amp; Adjudicación Directa
                                    </span>
                                </button>

                                <button
                                    onClick={() => setSelectedNode(nodes.gore)}
                                    className={`p-3 rounded-xl border text-left transition ${
                                        selectedNode?.title.includes("GORE")
                                            ? "bg-cyan-950 border-cyan-500 ring-2 ring-cyan-500/50 scale-[1.02]"
                                            : "bg-slate-900 border-slate-800 hover:border-cyan-800/60"
                                    }`}
                                >
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-xs font-bold text-white flex items-center gap-1.5">
                                            <Building className="w-4 h-4 text-cyan-400" /> GORE / COER
                                        </span>
                                        <span className="text-[9px] font-mono bg-cyan-950 text-cyan-300 px-1.5 py-0.5 rounded border border-cyan-800">
                                            Región
                                        </span>
                                    </div>
                                    <span className="text-[10px] text-slate-400 block">Auxilio Nivel 4 Regional</span>
                                </button>
                            </div>
                        </div>

                        {/* FLECHAS DE CONEXIÓN VECTORIAL HACIA EL NIVEL 3 */}
                        <div className="flex justify-around items-center text-slate-600 my-1">
                            <div className="flex flex-col items-center">
                                <div className="h-6 w-0.5 bg-gradient-to-b from-amber-500 to-emerald-500" />
                                <ArrowDown className="w-4 h-4 text-emerald-500 -mt-1" />
                            </div>
                            <div className="flex flex-col items-center">
                                <div className="h-6 w-0.5 bg-gradient-to-b from-amber-500 to-yellow-500" />
                                <ArrowDown className="w-4 h-4 text-yellow-500 -mt-1" />
                            </div>
                            <div className="flex flex-col items-center">
                                <div className="h-6 w-0.5 bg-gradient-to-b from-amber-500 to-purple-500" />
                                <ArrowDown className="w-4 h-4 text-purple-500 -mt-1" />
                            </div>
                        </div>

                        {/* ----------------------------------------------------------------- */}
                        {/* NIVEL 3: CONTROL, SOCIEDAD & BLOCKCHAIN (ABAJO)                    */}
                        {/* ----------------------------------------------------------------- */}
                        <div>
                            <div className="text-[11px] font-mono font-bold text-purple-400 mb-2 flex items-center gap-1.5 uppercase tracking-wider">
                                <Lock className="w-4 h-4 text-purple-400" />
                                <span>3. CONTROL, SENSADO COMUNITARIO &amp; FE PÚBLICA BLOCKCHAIN</span>
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <button
                                    onClick={() => setSelectedNode(nodes.comunidad)}
                                    className={`p-3 rounded-xl border text-left transition ${
                                        selectedNode?.title.includes("SOCIEDAD")
                                            ? "bg-emerald-950 border-emerald-500 ring-2 ring-emerald-500/50 scale-[1.02]"
                                            : "bg-slate-900 border-slate-800 hover:border-emerald-800/60"
                                    }`}
                                >
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-xs font-bold text-white flex items-center gap-1.5">
                                            <Users className="w-4 h-4 text-emerald-400" /> COMUNIDAD
                                        </span>
                                        <span className="text-[9px] font-mono bg-emerald-950 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-800">
                                            Sensor
                                        </span>
                                    </div>
                                    <span className="text-[10px] text-slate-400 block">Sensado Humano &amp; JUVESC</span>
                                </button>

                                <button
                                    onClick={() => setSelectedNode(nodes.cgr)}
                                    className={`p-3 rounded-xl border text-left transition ${
                                        selectedNode?.title.includes("CONTRALORÍA")
                                            ? "bg-yellow-950 border-yellow-500 ring-2 ring-yellow-500/50 scale-[1.02]"
                                            : "bg-slate-900 border-slate-800 hover:border-yellow-800/60"
                                    }`}
                                >
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-xs font-bold text-white flex items-center gap-1.5">
                                            <Scale className="w-4 h-4 text-yellow-400" /> CONTRALORÍA (CGR)
                                        </span>
                                        <span className="text-[9px] font-mono bg-yellow-950 text-yellow-300 px-1.5 py-0.5 rounded border border-yellow-800">
                                            Ley 31358
                                        </span>
                                    </div>
                                    <span className="text-[10px] text-slate-400 block">Control Concurrente</span>
                                </button>

                                <button
                                    onClick={() => setSelectedNode(nodes.polygon)}
                                    className={`p-3 rounded-xl border text-left transition ${
                                        selectedNode?.title.includes("POLYGON")
                                            ? "bg-purple-950 border-purple-500 ring-2 ring-purple-500/50 scale-[1.02] animate-pulse"
                                            : "bg-purple-950/40 border-purple-800/60 hover:border-purple-600"
                                    }`}
                                >
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-xs font-bold text-purple-200 flex items-center gap-1.5">
                                            <Lock className="w-4 h-4 text-purple-400" /> POLYGON L3
                                        </span>
                                        <span className="text-[9px] font-mono bg-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded border border-purple-500/40 font-bold">
                                            Merkle Root
                                        </span>
                                    </div>
                                    <span className="text-[10px] text-purple-300/80 block">Fe Pública Inmutable</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* DETALLE DEL NODO SELECCIONADO EN EL MAPA */}
                {selectedNode && (
                    <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-2 text-xs">
                        <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                            <div className="flex items-center gap-2">
                                <Info className="w-4 h-4 text-amber-400" />
                                <span className="font-bold text-white">{selectedNode.title}</span>
                                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 text-slate-300 border border-slate-800">
                                    {selectedNode.level}
                                </span>
                            </div>
                            <span className="text-[10px] font-mono text-cyan-300 bg-slate-950 px-2 py-0.5 rounded border border-slate-800 font-bold">
                                Producto: {selectedNode.entregable}
                            </span>
                        </div>

                        <p className="text-slate-300 leading-relaxed">
                            {selectedNode.description}
                        </p>

                        <div className="pt-1 flex justify-between items-center text-[11px] font-mono text-slate-400">
                            <span>Base Legal Obligatoria: <strong className="text-amber-300">{selectedNode.baseLegal}</strong></span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
