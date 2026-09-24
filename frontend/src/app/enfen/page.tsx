"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
    Activity,
    AlertTriangle,
    FileText,
    RefreshCw,
    TrendingUp,
    Flame,
    Fish,
    Droplets,
    Calendar,
    ArrowLeft,
    CheckCircle2,
    ShieldAlert,
    Download,
    ExternalLink,
    Compass,
    Waves,
    LineChart as LineChartIcon,
    LayoutGrid,
    Upload
} from "lucide-react";
import {
    ResponsiveContainer,
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
    Legend,
    ReferenceLine
} from "recharts";
import HeaderNav from "@/components/HeaderNav";

export default function EnfenConsolePage() {
    const [historyData, setHistoryData] = useState<any>(null);
    const [comunicados, setComunicados] = useState<any[]>([]);
    const [selectedComunicado, setSelectedComunicado] = useState<any>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [syncing, setSyncing] = useState<boolean>(false);
    const [syncResult, setSyncResult] = useState<string | null>(null);
    const [chartMode, setChartMode] = useState<"linear" | "cards" | "both">("linear");
    const [uploadingPdf, setUploadingPdf] = useState<boolean>(false);
    const enfenFileInputRef = useRef<HTMLInputElement>(null);

    const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

    const fetchData = async () => {
        setLoading(true);
        try {
            const [histRes, comRes] = await Promise.all([
                fetch(`${apiBase}/api/enfen/history`),
                fetch(`${apiBase}/api/enfen/comunicados`)
            ]);

            if (histRes.ok) {
                const hJson = await histRes.json();
                setHistoryData(hJson);
            }
            if (comRes.ok) {
                const cJson = await comRes.json();
                setComunicados(cJson.comunicados || []);
                if (cJson.comunicados && cJson.comunicados.length > 0) {
                    setSelectedComunicado(cJson.comunicados[cJson.comunicados.length - 1]);
                }
            }
        } catch (err) {
            console.error("Error fetching ENFEN data:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleSync = async () => {
        setSyncing(true);
        setSyncResult(null);
        try {
            const res = await fetch(`${apiBase}/api/enfen/sync`, { method: "POST" });
            if (res.ok) {
                const json = await res.json();
                setSyncResult(`Sincronización exitosa: ${json.comunicados_procesados} comunicados PDF procesados. Último: N° ${json.ultimo_comunicado}`);
                await fetchData();
            } else {
                setSyncResult("Error en la sincronización de archivos PDF.");
            }
        } catch (err) {
            setSyncResult("Error de conexión con el backend.");
        } finally {
            setSyncing(false);
        }
    };

    const handleUploadPdf = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploadingPdf(true);
        setSyncResult(`Procesando Comunicado Oficial ENFEN: ${file.name}...`);
        try {
            const formData = new FormData();
            formData.append("file", file);
            const res = await fetch(`${apiBase}/api/enfen/upload-pdf`, {
                method: "POST",
                body: formData,
            });
            if (res.ok) {
                const json = await res.json();
                setSyncResult(`¡Éxito! Comunicado Oficial N° ${json.numero || file.name} procesado (${json.fecha || "Oficial"}). SHA: ${json.hash_sha256?.substring(0, 10)}...`);
                await fetchData();
            } else {
                const err = await res.json();
                setSyncResult(`Error procesando Comunicado ENFEN: ${err.detail || "Fallo en servidor"}`);
            }
        } catch (err: any) {
            setSyncResult(`Error de conexión al subir PDF: ${err.message}`);
        } finally {
            setUploadingPdf(false);
            if (enfenFileInputRef.current) enfenFileInputRef.current.value = "";
            setTimeout(() => setSyncResult(null), 8000);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const latest = historyData?.ultimo_comunicado || (comunicados.length > 0 ? comunicados[comunicados.length - 1] : null);
    const currentProbs = latest?.probabilidades_nino_costero || { extraordinario: 48, fuerte: 45, moderado: 7, debil: 0 };
    const severeTotal = (currentProbs.extraordinario || 0) + (currentProbs.fuerte || 0);

    return (
        <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-red-500 selection:text-white">
            <HeaderNav />

            <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">
                
                {/* Header Superior con Botón de Actualización */}
                <div className="flex flex-wrap justify-between items-center gap-4 bg-slate-900/80 border border-slate-800 p-5 rounded-2xl shadow-xl backdrop-blur">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2.5">
                            <Link href="/" className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition">
                                <ArrowLeft className="w-4 h-4" />
                            </Link>
                            <span className="p-2 rounded-xl bg-red-950/80 border border-red-800/80 text-red-400">
                                <ShieldAlert className="w-5 h-5" />
                            </span>
                            <div>
                                <h1 className="text-xl font-black text-white tracking-wide uppercase flex items-center gap-2">
                                    <span>Consola Táctica Multisectorial ENFEN</span>
                                    <span className="text-[10px] font-mono bg-red-950 text-red-300 px-2 py-0.5 rounded-full border border-red-800 font-bold">
                                        ● ALERTA DE EL NIÑO COSTERO
                                    </span>
                                </h1>
                                <p className="text-xs text-slate-400">
                                    Estudio Nacional del Fenómeno El Niño • IMARPE • SENAMHI • DHN • IGP • ANA • INDECI • D.S. 007-2017-PRODUCE
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Acciones: Botón de Re-escaneo de PDFs y Carga Manual Forense */}
                    <div className="flex items-center gap-2.5">
                        <input
                            type="file"
                            ref={enfenFileInputRef}
                            accept=".pdf"
                            className="hidden"
                            onChange={handleUploadPdf}
                        />
                        <button
                            onClick={() => enfenFileInputRef.current?.click()}
                            disabled={uploadingPdf}
                            className="flex items-center gap-2 px-3.5 py-2 rounded-xl font-bold text-xs bg-slate-800 hover:bg-slate-700 active:bg-slate-900 text-red-300 border border-red-800/60 transition shadow-md disabled:opacity-50"
                            title="Depositar y procesar manualmente un Comunicado Oficial ENFEN en formato PDF"
                        >
                            <Upload className={`w-3.5 h-3.5 ${uploadingPdf ? "animate-bounce" : ""}`} />
                            <span>{uploadingPdf ? "Indexando PDF..." : "Depositar Comunicado (PDF)"}</span>
                        </button>

                        <button
                            onClick={handleSync}
                            disabled={syncing}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs transition shadow-lg ${
                                syncing
                                    ? "bg-slate-800 text-slate-400 cursor-not-allowed"
                                    : "bg-red-600 hover:bg-red-500 text-white shadow-red-600/30"
                            }`}
                        >
                            <RefreshCw className={`w-3.5 h-3.5 ${syncing ? "animate-spin" : ""}`} />
                            <span>{syncing ? "Escaneando PDFs..." : "Actualizar Comunicados PDF"}</span>
                        </button>
                    </div>
                </div>

                {/* Mensaje de Sincronización */}
                {syncResult && (
                    <div className="bg-emerald-950/60 border border-emerald-700 text-emerald-300 text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 animate-fade-in">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>{syncResult}</span>
                    </div>
                )}

                {/* 4 Indicadores Clave de Misión (KPIs) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* KPI 1 */}
                    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-1.5 shadow-lg">
                        <div className="flex justify-between items-center text-xs text-slate-400">
                            <span className="font-semibold uppercase text-[10px] tracking-wider">Último Comunicado</span>
                            <FileText className="w-4 h-4 text-sky-400" />
                        </div>
                        <div className="text-2xl font-black text-white font-mono">
                            {latest ? `N° ${latest.numero}` : "Cargando..."}
                        </div>
                        <p className="text-[11px] text-slate-400 font-medium">
                            Emitido: <span className="text-sky-300 font-semibold">{latest?.fecha || "14 de setiembre 2026"}</span>
                        </p>
                    </div>

                    {/* KPI 2 */}
                    <div className="bg-slate-900/90 border border-red-900/50 rounded-2xl p-4 space-y-1.5 shadow-lg">
                        <div className="flex justify-between items-center text-xs text-slate-400">
                            <span className="font-semibold uppercase text-[10px] tracking-wider text-red-400">Riesgo Fuerte/Extraord.</span>
                            <Flame className="w-4 h-4 text-red-500 animate-pulse" />
                        </div>
                        <div className="text-2xl font-black text-red-400 font-mono">
                            {severeTotal}%
                        </div>
                        <p className="text-[11px] text-slate-400 font-medium">
                            Extraordinario: <b className="text-red-300">{currentProbs.extraordinario}%</b> | Fuerte: <b className="text-amber-300">{currentProbs.fuerte}%</b>
                        </p>
                    </div>

                    {/* KPI 3 */}
                    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-1.5 shadow-lg">
                        <div className="flex justify-between items-center text-xs text-slate-400">
                            <span className="font-semibold uppercase text-[10px] tracking-wider">Horizonte de Alerta</span>
                            <Calendar className="w-4 h-4 text-amber-400" />
                        </div>
                        <div className="text-base font-black text-amber-400 font-mono pt-1">
                            Hasta Otoño/Invierno 2027
                        </div>
                        <p className="text-[11px] text-slate-400 font-medium">
                            Sustento para extensión multianual C2
                        </p>
                    </div>

                    {/* KPI 4 */}
                    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-1.5 shadow-lg">
                        <div className="flex justify-between items-center text-xs text-slate-400">
                            <span className="font-semibold uppercase text-[10px] tracking-wider">Sensibilidad Hidrológica</span>
                            <Droplets className="w-4 h-4 text-emerald-400" />
                        </div>
                        <div className="text-2xl font-black text-emerald-400 font-mono">
                            x1.38
                        </div>
                        <p className="text-[11px] text-slate-400 font-medium">
                            Umbrales reducidos en 38% para activación de alertas
                        </p>
                    </div>
                </div>

                {/* ===================================================================== */}
                {/* GRÁFICA LINEAL DE ESCALADA HISTÓRICA DE PROBABILIDADES (SERIE TEMPORAL) */}
                {/* ===================================================================== */}
                <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
                    <div className="flex flex-wrap justify-between items-center gap-3 border-b border-slate-850 pb-3">
                        <div className="flex items-center gap-2.5">
                            <div className="p-1.5 bg-red-950/80 border border-red-800 rounded-lg">
                                <TrendingUp className="w-4 h-4 text-red-400" />
                            </div>
                            <div>
                                <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                                    Curva de Escalamiento del Riesgo FEN 2026–2027
                                    <span className="text-[10px] bg-red-900/60 text-red-300 font-mono px-2 py-0.5 rounded border border-red-700">
                                        Gráfica Lineal C2
                                    </span>
                                </h2>
                                <p className="text-[11px] text-slate-400">
                                    Serie temporal oficial ENFEN (Comunicados N° 10 a N° 16-2026) proyectada hacia Verano/Invierno 2027
                                </p>
                            </div>
                        </div>

                        {/* Selector de visualización táctica */}
                        <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-mono">
                            <button
                                onClick={() => setChartMode("linear")}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition ${
                                    chartMode === "linear"
                                        ? "bg-red-600 text-white font-bold shadow-md shadow-red-950"
                                        : "text-slate-400 hover:text-white"
                                }`}
                            >
                                <LineChartIcon className="w-3.5 h-3.5" />
                                <span>Gráfica Lineal</span>
                            </button>
                            <button
                                onClick={() => setChartMode("both")}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition ${
                                    chartMode === "both"
                                        ? "bg-slate-800 text-white font-bold border border-slate-700"
                                        : "text-slate-400 hover:text-white"
                                }`}
                            >
                                <span>Combinado</span>
                            </button>
                            <button
                                onClick={() => setChartMode("cards")}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition ${
                                    chartMode === "cards"
                                        ? "bg-slate-800 text-white font-bold border border-slate-700"
                                        : "text-slate-400 hover:text-white"
                                }`}
                            >
                                <LayoutGrid className="w-3.5 h-3.5" />
                                <span>Tarjetas</span>
                            </button>
                        </div>
                    </div>

                    {/* VISTA 1: GRÁFICA LINEAL (RECHARTS) */}
                    {(chartMode === "linear" || chartMode === "both") && (
                        <div className="space-y-3">
                            <div className="h-72 w-full pt-2">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart
                                        data={historyData?.serie_historica || []}
                                        margin={{ top: 10, right: 30, left: -10, bottom: 5 }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                        <XAxis
                                            dataKey="numero"
                                            stroke="#64748b"
                                            tick={{ fill: "#94a3b8", fontSize: 11, fontFamily: "monospace" }}
                                            tickLine={{ stroke: "#334155" }}
                                        />
                                        <YAxis
                                            domain={[0, 100]}
                                            ticks={[0, 20, 40, 60, 80, 100]}
                                            stroke="#64748b"
                                            tick={{ fill: "#94a3b8", fontSize: 11, fontFamily: "monospace" }}
                                            tickFormatter={(val) => `${val}%`}
                                            tickLine={{ stroke: "#334155" }}
                                        />
                                        <Tooltip
                                            content={({ active, payload }: any) => {
                                                if (active && payload && payload.length) {
                                                    const d = payload[0].payload;
                                                    return (
                                                        <div className="bg-slate-950/95 border border-slate-700 p-3.5 rounded-xl shadow-2xl backdrop-blur-md text-xs font-mono space-y-2 min-w-[220px]">
                                                            <div className="flex justify-between items-baseline border-b border-slate-800 pb-1.5">
                                                                <span className="font-bold text-white text-sm">{d.numero}</span>
                                                                <span className="text-[10px] text-slate-400">{d.fecha}</span>
                                                            </div>
                                                            <div className="space-y-1 pt-0.5">
                                                                <div className="flex justify-between items-center text-red-400 font-bold">
                                                                    <span className="flex items-center gap-1.5">
                                                                        <span className="w-2 h-2 rounded-full bg-red-600"></span>
                                                                        Extraordinario:
                                                                    </span>
                                                                    <span className="text-white text-sm">{d.extraordinario}%</span>
                                                                </div>
                                                                <div className="flex justify-between items-center text-amber-400">
                                                                    <span className="flex items-center gap-1.5">
                                                                        <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                                                                        Fuerte:
                                                                    </span>
                                                                    <span className="text-slate-200">{d.fuerte}%</span>
                                                                </div>
                                                                <div className="flex justify-between items-center text-slate-400">
                                                                    <span className="flex items-center gap-1.5">
                                                                        <span className="w-2 h-2 rounded-full bg-slate-500"></span>
                                                                        Moderado:
                                                                    </span>
                                                                    <span className="text-slate-200">{d.moderado}%</span>
                                                                </div>
                                                                <div className="flex justify-between items-center text-pink-400 pt-1.5 border-t border-slate-800 font-bold">
                                                                    <span>Peligro Severo (Total):</span>
                                                                    <span className="text-pink-300 font-black text-sm">{d.suma_severa}%</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                }
                                                return null;
                                            }}
                                        />
                                        <ReferenceLine
                                            y={50}
                                            stroke="#ef4444"
                                            strokeDasharray="4 4"
                                            strokeOpacity={0.6}
                                            label={{
                                                value: "Umbral Crítico (50%)",
                                                fill: "#ef4444",
                                                fontSize: 10,
                                                position: "insideTopLeft",
                                                fontFamily: "monospace"
                                            }}
                                        />
                                        <ReferenceLine
                                            y={80}
                                            stroke="#f43f5e"
                                            strokeDasharray="2 2"
                                            strokeOpacity={0.7}
                                            label={{
                                                value: "Zona Severa Máxima (>80%)",
                                                fill: "#f43f5e",
                                                fontSize: 10,
                                                position: "insideTopLeft",
                                                fontFamily: "monospace"
                                            }}
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="extraordinario"
                                            name="Magnitud Extraordinaria"
                                            stroke="#dc2626"
                                            strokeWidth={3.5}
                                            dot={{ r: 4, fill: "#dc2626", strokeWidth: 1, stroke: "#fff" }}
                                            activeDot={{ r: 7, fill: "#ef4444", stroke: "#fff", strokeWidth: 2 }}
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="fuerte"
                                            name="Magnitud Fuerte"
                                            stroke="#f59e0b"
                                            strokeWidth={2.5}
                                            dot={{ r: 3.5, fill: "#f59e0b" }}
                                            activeDot={{ r: 6, fill: "#fbbf24" }}
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="moderado"
                                            name="Magnitud Moderada"
                                            stroke="#94a3b8"
                                            strokeWidth={2}
                                            strokeDasharray="4 4"
                                            dot={{ r: 3, fill: "#94a3b8" }}
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="suma_severa"
                                            name="Peligro Alto Total (Extr. + Fuerte)"
                                            stroke="#ec4899"
                                            strokeWidth={2.5}
                                            strokeDasharray="3 3"
                                            dot={{ r: 4, fill: "#ec4899" }}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>

                            {/* Leyenda y Lectura Operativa de la Curva */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-2 pt-2 border-t border-slate-850 text-xs">
                                <div className="flex items-center gap-2 bg-slate-950/60 p-2 rounded-lg border border-red-950">
                                    <div className="w-3 h-3 rounded-full bg-red-600 shrink-0"></div>
                                    <div>
                                        <span className="text-red-300 font-bold block text-[11px]">Extraordinario: 10% → 48%</span>
                                        <span className="text-[10px] text-slate-400">Escalamiento cuadrático (+38 pts)</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 bg-slate-950/60 p-2 rounded-lg border border-amber-950">
                                    <div className="w-3 h-3 rounded-full bg-amber-500 shrink-0"></div>
                                    <div>
                                        <span className="text-amber-300 font-bold block text-[11px]">Fuerte: 42% → 45%</span>
                                        <span className="text-[10px] text-slate-400">Meseta sostenida en ~45%-48%</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 bg-slate-950/60 p-2 rounded-lg border border-slate-800">
                                    <div className="w-3 h-1.5 bg-slate-400 shrink-0"></div>
                                    <div>
                                        <span className="text-slate-300 font-bold block text-[11px]">Moderado: 40% → 7%</span>
                                        <span className="text-[10px] text-slate-400">Colapso del escenario benigno</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 bg-slate-950/60 p-2 rounded-lg border border-pink-950">
                                    <div className="w-3 h-1.5 bg-pink-500 shrink-0"></div>
                                    <div>
                                        <span className="text-pink-300 font-bold block text-[11px]">Suma Severa: 52% → 93%</span>
                                        <span className="text-[10px] text-slate-400">Certeza de impacto destructor</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* VISTA 2: TARJETAS POR COMUNICADO (DETALLE SECUENCIAL) */}
                    {(chartMode === "cards" || chartMode === "both") && (
                        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3 pt-2">
                            {(historyData?.serie_historica || []).map((item: any, idx: number) => {
                                const isLatest = idx === (historyData.serie_historica.length - 1);
                                return (
                                    <div
                                        key={idx}
                                        className={`p-3 rounded-xl border flex flex-col justify-between space-y-2.5 transition ${
                                            isLatest
                                                ? "bg-gradient-to-b from-red-950/80 to-slate-950 border-red-500 shadow-lg shadow-red-950/50 ring-1 ring-red-400"
                                                : "bg-slate-950/70 border-slate-800 hover:border-slate-700"
                                        }`}
                                    >
                                        <div className="flex justify-between items-baseline">
                                            <span className={`text-xs font-black font-mono ${isLatest ? "text-red-300" : "text-white"}`}>
                                                {item.numero}
                                            </span>
                                            {isLatest && (
                                                <span className="text-[9px] bg-red-600 text-white font-bold px-1.5 py-0.5 rounded font-mono">
                                                    VIGENTE
                                                </span>
                                            )}
                                        </div>
                                        <span className="text-[10px] text-slate-400 font-medium block">
                                            {item.fecha.split(" ").slice(0, 3).join(" ")}
                                        </span>

                                        {/* Termómetro de Magnitud Extraordinaria */}
                                        <div className="space-y-1 pt-1">
                                            <div className="flex justify-between text-[10px] font-mono">
                                                <span className="text-red-400 font-bold">Extraordinario:</span>
                                                <span className="font-bold text-white">{item.extraordinario}%</span>
                                            </div>
                                            <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-gradient-to-r from-red-600 to-red-900 rounded-full transition-all"
                                                    style={{ width: `${item.extraordinario}%` }}
                                                />
                                            </div>
                                        </div>

                                        {/* Fuerte */}
                                        <div className="space-y-1">
                                            <div className="flex justify-between text-[10px] font-mono">
                                                <span className="text-amber-400">Fuerte:</span>
                                                <span className="text-slate-300">{item.fuerte}%</span>
                                            </div>
                                            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-amber-500 rounded-full"
                                                    style={{ width: `${item.fuerte}%` }}
                                                />
                                            </div>
                                        </div>

                                        {/* Suma Severa */}
                                        <div className="pt-1 border-t border-slate-800/80 text-[10px] font-mono flex justify-between">
                                            <span className="text-slate-400">Peligro Alto:</span>
                                            <b className={isLatest ? "text-red-400 font-black" : "text-slate-300"}>
                                                {item.suma_severa}%
                                            </b>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* ===================================================================== */}
                {/* 2 COLUMNAS: IMPACTO TERRITORIAL & BIOINDICADORES PESQUEROS           */}
                {/* ===================================================================== */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Columna 1: Matriz Territorial Bipolar */}
                    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-3.5 shadow-xl">
                        <div className="flex items-center gap-2 pb-2 border-b border-slate-850">
                            <Compass className="w-4 h-4 text-amber-400" />
                            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                                Pronóstico Oficial por Regiones Hidrográficas
                            </h3>
                        </div>

                        <div className="space-y-3 text-xs">
                            <div className="bg-slate-950 p-3 rounded-xl border border-red-900/40 space-y-1.5">
                                <div className="flex justify-between items-center">
                                    <span className="font-bold text-red-400 uppercase tracking-wide">
                                        Costa Norte & Costa Centro (Pacífico)
                                    </span>
                                    <span className="text-[10px] font-mono text-red-300 bg-red-950 px-2 py-0.5 rounded border border-red-800">
                                        Lluvias Superiores
                                    </span>
                                </div>
                                <p className="text-slate-300 leading-relaxed">
                                    Temperaturas del aire muy superiores a las habituales registrando nuevos récords. Caudales sobre lo normal en ríos del norte desde noviembre 2026. Alta probabilidad de activación masiva de quebradas en Tumbes, Piura, Lambayeque, La Libertad y Lima.
                                </p>
                            </div>

                            <div className="bg-slate-950 p-3 rounded-xl border border-sky-900/40 space-y-1.5">
                                <div className="flex justify-between items-center">
                                    <span className="font-bold text-sky-400 uppercase tracking-wide">
                                        Sierra Sur, Titicaca & Amazonía
                                    </span>
                                    <span className="text-[10px] font-mono text-sky-300 bg-sky-950 px-2 py-0.5 rounded border border-sky-800">
                                        Lluvias Deficitarias
                                    </span>
                                </div>
                                <p className="text-slate-300 leading-relaxed">
                                    Condiciones de lluvia de normal a inferior en Puno, Cusco, Arequipa alta y selva. Predominio de sequía agrometeorológica y heladas severas en zonas sobre los 3,800 msnm (Monitoreado por el Reloj AMARU-CHIRI).
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Columna 2: Bioindicadores Pesqueros IMARPE */}
                    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-3.5 shadow-xl">
                        <div className="flex items-center gap-2 pb-2 border-b border-slate-850">
                            <Fish className="w-4 h-4 text-teal-400" />
                            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                                Bioindicadores Marinos & Recursos Pesqueros (IMARPE)
                            </h3>
                        </div>

                        <div className="space-y-3 text-xs">
                            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1.5">
                                <span className="font-bold text-teal-300 uppercase tracking-wide block">
                                    Anchoveta (Engraulis ringens) • Región Norte-Centro
                                </span>
                                <p className="text-slate-300 leading-relaxed">
                                    Permanece <b className="text-amber-400">profundizada y replegada</b> en la franja costera inmediata debido a la profundización de la termoclina (85m) causada por ondas Kelvin cálidas. Alta vulnerabilidad de cardúmenes ante anomalías mayores a +2.5°C.
                                </p>
                            </div>

                            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1.5">
                                <span className="font-bold text-sky-300 uppercase tracking-wide block">
                                    Especies Cálidas & Oceánicas Invasoras
                                </span>
                                <p className="text-slate-300 leading-relaxed">
                                    Frente a la costa central se mantiene la disponibilidad de fauna asociada a aguas ecuatoriales y oceánicas: <b className="text-white">samasa, pez sierra, perico, barrilete, melva y atún aleta amarilla</b>. Funciona como bioindicador in-situ de la penetración de masas cálidas.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ===================================================================== */}
                {/* EXPLORADOR DETALLADO DE COMUNICADOS PDF                               */}
                {/* ===================================================================== */}
                <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
                    <div className="flex items-center gap-2 pb-2 border-b border-slate-850">
                        <FileText className="w-4 h-4 text-sky-400" />
                        <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                            Explorador Oficial de Comunicados ENFEN Registrados ({comunicados.length} Documentos)
                        </h3>
                    </div>

                    {/* Selector de Pestañas de Comunicados */}
                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
                        {comunicados.map((c: any) => {
                            const isSelected = selectedComunicado?.numero === c.numero;
                            return (
                                <button
                                    key={c.id}
                                    onClick={() => setSelectedComunicado(c)}
                                    className={`px-3.5 py-2 rounded-xl text-xs font-bold font-mono transition shrink-0 flex items-center gap-1.5 ${
                                        isSelected
                                            ? "bg-red-600 text-white shadow-lg shadow-red-600/30"
                                            : "bg-slate-950 text-slate-400 hover:text-white border border-slate-800"
                                    }`}
                                >
                                    <span>N° {c.numero}</span>
                                    <span className="text-[10px] opacity-80">({c.fecha.split(" ")[0]} {c.fecha.split(" ")[1]?.substring(0, 3)})</span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Detalle del Comunicado Seleccionado */}
                    {selectedComunicado && (
                        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-4 animate-fade-in text-xs">
                            <div className="flex flex-wrap justify-between items-center gap-2 border-b border-slate-850 pb-3">
                                <div>
                                    <h4 className="text-base font-black text-white">
                                        {selectedComunicado.titulo}
                                    </h4>
                                    <p className="text-slate-400 text-[11px]">
                                        Fecha Oficial: <b className="text-sky-300">{selectedComunicado.fecha}</b> • Archivo: <span className="font-mono text-slate-300">{selectedComunicado.archivo}</span>
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-[11px] font-mono text-red-400 bg-red-950 px-2.5 py-1 rounded-lg border border-red-800 font-bold">
                                        {selectedComunicado.estado_alerta}
                                    </span>
                                </div>
                            </div>

                            {/* Contenido Extraído */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <span className="text-[11px] uppercase font-bold text-slate-400 block tracking-wider">
                                        Resumen Ejecutivo Oficial
                                    </span>
                                    <p className="text-slate-300 leading-relaxed bg-slate-900/60 p-3 rounded-xl border border-slate-850">
                                        {selectedComunicado.resumen || "Sin resumen disponible."}
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <span className="text-[11px] uppercase font-bold text-slate-400 block tracking-wider">
                                        Desglose de Probabilidades Verano 2026-2027
                                    </span>
                                    <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-850 space-y-2">
                                        <div className="flex justify-between font-mono">
                                            <span className="text-red-400 font-bold">Magnitud Extraordinaria:</span>
                                            <span className="font-bold text-white">{selectedComunicado.probabilidades_nino_costero?.extraordinario}%</span>
                                        </div>
                                        <div className="flex justify-between font-mono">
                                            <span className="text-amber-400">Magnitud Fuerte:</span>
                                            <span className="text-slate-300">{selectedComunicado.probabilidades_nino_costero?.fuerte}%</span>
                                        </div>
                                        <div className="flex justify-between font-mono">
                                            <span className="text-yellow-400">Magnitud Moderada:</span>
                                            <span className="text-slate-300">{selectedComunicado.probabilidades_nino_costero?.moderado}%</span>
                                        </div>
                                        <div className="flex justify-between font-mono">
                                            <span className="text-emerald-400">Magnitud Débil:</span>
                                            <span className="text-slate-300">{selectedComunicado.probabilidades_nino_costero?.debil}%</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

            </div>
        </main>
    );
}
