"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
    Activity,
    HeartPulse,
    ShieldCheck,
    Lock,
    AlertTriangle,
    UploadCloud,
    CheckCircle2,
    Clock,
    PhoneCall,
    Baby,
    Thermometer,
    Flame,
    Droplets,
    FileText,
    ChevronRight,
    MapPin,
    ArrowLeft,
    Share2,
    RefreshCw,
    UserCheck,
    Stethoscope
} from "lucide-react";
import { API_BASE } from "@/config/api";

interface SintomaOption {
    id: string;
    label: string;
    icon: string;
    desc: string;
    severo: boolean;
}

const SINTOMAS_FEN: SintomaOption[] = [
    { id: "DIFICULTAD_RESPIRATORIA_SEVERA", label: "Falta de aire / Asfixia", icon: "🫁", desc: "No puede hablar o pecho agitado", severo: true },
    { id: "HEMORRAGIA_ACTIVA", label: "Sangrado abundante", icon: "🩸", desc: "Herida profunda o hemorragia activa", severo: true },
    { id: "CONTRACCIONES", label: "Parto / Contracciones", icon: "🤰", desc: "Gestante con dolor de parto o pérdida de líquido", severo: true },
    { id: "MORDEDURA_SERPIENTE", label: "Mordedura animal / serpiente", icon: "🐍", desc: "Hinchazón rápida tras mordedura", severo: true },
    { id: "INCONSCIENCIA", label: "Desmayo / Confusión", icon: "😵", desc: "Paciente no responde o convulsiona", severo: true },
    { id: "FIEBRE_ALTA", label: "Fiebre muy alta (>38.5°C)", icon: "🔥", desc: "Cuerpo ardiendo y escalofríos", severo: false },
    { id: "VOMITOS_PERSISTENTES", label: "Vómitos continuos", icon: "🤮", desc: "No tolera agua ni comida", severo: false },
    { id: "DOLOR_ABDOMINAL", label: "Dolor fuerte de estómago", icon: "⚡", desc: "Dolor continuo intenso (alerta Dengue)", severo: false },
    { id: "ICTERICIA", label: "Ojos / piel amarilla", icon: "🟡", desc: "Signo de alerta tras contacto con agua estancada", severo: false },
    { id: "HERIDA_PROFUNDA", label: "Corte con clavo / calamina", icon: "🩹", desc: "Herida con barro y riesgo de tétanos", severo: false },
    { id: "DIARREA_SEVERA", label: "Diarrea líquida frecuente", icon: "💧", desc: "Más de 4 veces al día (riesgo deshidratación)", severo: false },
    { id: "CONSULTA_CRONICA", label: "Se me acabó mi medicina", icon: "💊", desc: "Presión alta, diabetes o asma", severo: false }
];

export default function TriajeCiudadanoSaludPage() {
    // Form fields
    const [dni, setDni] = useState("");
    const [nombres, setNombres] = useState("");
    const [apellidos, setApellidos] = useState("");
    const [telefono, setTelefono] = useState("");
    const [contactoAux, setContactoAux] = useState("");
    const [ubigeo, setUbigeo] = useState("200105"); // Default Catacaos
    const [lugarReferencial, setLugarReferencial] = useState("");
    const [edad, setEdad] = useState<number>(32);
    const [sexo, setSexo] = useState("FEMENINO");
    const [esGestante, setEsGestante] = useState(false);
    const [semanasGestacion, setSemanasGestacion] = useState<number | "">(32);
    const [aguaEnVivienda, setAguaEnVivienda] = useState("INTERIOR_RODILLA");
    const [sintomasSeleccionados, setSintomasSeleccionados] = useState<string[]>([]);
    const [relato, setRelato] = useState("");
    const [fotoSelected, setFotoSelected] = useState<string | null>(null);

    // Submission states
    const [loading, setLoading] = useState(false);
    const [receipt, setReceipt] = useState<any | null>(null);

    const toggleSintoma = (id: string) => {
        if (sintomasSeleccionados.includes(id)) {
            setSintomasSeleccionados(sintomasSeleccionados.filter(s => s !== id));
        } else {
            setSintomasSeleccionados([...sintomasSeleccionados, id]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (dni.length !== 8) {
            alert("Por favor ingrese un DNI válido de 8 dígitos.");
            return;
        }
        if (!nombres.trim() || !telefono.trim() || !relato.trim()) {
            alert("Por favor complete sus nombres, teléfono y descripción de los síntomas.");
            return;
        }

        setLoading(true);
        try {
            const payload = {
                dni: dni.trim(),
                nombres: nombres.trim(),
                apellidos: apellidos.trim(),
                telefono: telefono.trim(),
                contacto_auxiliar: contactoAux.trim() || null,
                ubigeo,
                lugar_referencial: lugarReferencial.trim(),
                edad: Number(edad) || 30,
                sexo,
                es_gestante: esGestante,
                semanas_gestacion: esGestante ? Number(semanasGestacion) : null,
                agua_en_vivienda: aguaEnVivienda,
                sintomas: sintomasSeleccionados,
                relato: relato.trim(),
                foto_preview_url: "/img/clinical/sample_wound.jpg",
                foto_nombre: fotoSelected || "captura_clinica_inundacion.jpg"
            };

            const res = await fetch(`${API_BASE}/api/v1/salud/triaje/registrar`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                throw new Error(errData.error || "Error al procesar el triaje digital.");
            }

            const data = await res.json();
            setReceipt(data);
        } catch (err: any) {
            alert(err.message || "Error al conectar con el servidor COED-Salud.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-16">
            {/* CINTILLO INSTITUCIONAL */}
            <div className="bg-slate-900 border-b border-slate-800 px-4 py-3">
                <div className="max-w-4xl mx-auto flex flex-wrap justify-between items-center gap-3">
                    <div className="flex items-center gap-2">
                        <Link href="/" className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition">
                            <ArrowLeft className="w-4 h-4" />
                        </Link>
                        <div className="p-1.5 rounded-lg bg-rose-500/20 text-rose-400 border border-rose-500/30">
                            <HeartPulse className="w-5 h-5" />
                        </div>
                        <div>
                            <h1 className="text-sm font-bold text-white flex items-center gap-2">
                                SALUD-AMARU • Triaje Digital de Emergencia FEN
                            </h1>
                            <p className="text-[11px] text-slate-400">
                                Asistencia Médica Desacoplada en Zonas Incomunicadas por Desbordes
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 text-xs">
                        <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold flex items-center gap-1">
                            <Lock className="w-3 h-3" /> Privacidad Cripto CUP
                        </span>
                        <Link
                            href="/salud/consola-medica"
                            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-medium border border-slate-700 transition"
                        >
                            Acceso Médicos MINSA →
                        </Link>
                    </div>
                </div>
            </div>

            {/* CONTENIDO PRINCIPAL */}
            <div className="max-w-4xl mx-auto px-4 mt-6">
                {/* BANNER DE PRIVACIDAD Y PROTOCOLO ÉTICO */}
                <div className="bg-gradient-to-r from-emerald-950/40 via-slate-900 to-emerald-950/30 border border-emerald-600/40 rounded-2xl p-4 mb-6 text-xs text-emerald-200 shadow-xl flex items-start gap-3">
                    <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-300 shrink-0 border border-emerald-500/30">
                        <ShieldCheck className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                        <h2 className="font-bold text-emerald-300 text-sm flex items-center gap-1.5">
                            🛡️ Privacidad Absoluta: Su identidad se guarda bajo Código CUP
                        </h2>
                        <p className="text-emerald-200/90 leading-relaxed text-[11px]">
                            Sus nombres, DNI y teléfono quedan <strong>cifrados en una bóveda inviolable</strong>. El equipo médico evaluará sus síntomas usando únicamente un <strong>Código Único de Paciente (CUP)</strong> anónimo. Solo el médico colegiado (CMP) a cargo de su rescate o llamada podrá desbloquear sus datos bajo responsabilidad profesional (Ley N.° 29733 y Ley N.° 26842).
                        </p>
                    </div>
                </div>

                {receipt ? (
                    /* COMPROBANTE DE TRIAJE RECIBIDO (CARNET CUP) */
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6">
                        <div className="text-center space-y-2">
                            <div className="inline-flex p-3 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 animate-pulse">
                                <CheckCircle2 className="w-10 h-10" />
                            </div>
                            <h2 className="text-xl font-black text-white">Triaje Registrado con Éxito</h2>
                            <p className="text-xs text-slate-400 max-w-md mx-auto">
                                Su reporte ha ingresado a la bandeja de emergencias médicas del MINSA / SAMU en el Centro de Operaciones de Emergencia Digital.
                            </p>
                        </div>

                        {/* CARNET DIGITAL CUP */}
                        <div className="bg-slate-950 border border-amber-500/40 rounded-2xl p-5 shadow-inner space-y-4">
                            <div className="flex flex-wrap justify-between items-center gap-2 border-b border-slate-800 pb-3">
                                <div>
                                    <span className="text-[10px] text-slate-500 uppercase tracking-widest font-mono">Código de Protección</span>
                                    <div className="text-xl font-extrabold text-amber-400 font-mono tracking-wider">{receipt.cup}</div>
                                </div>
                                <div className="text-right">
                                    <span className="text-[10px] text-slate-500 uppercase tracking-widest font-mono">Prioridad Asistencial Sugerida</span>
                                    <div className={`text-sm font-extrabold px-3 py-1 rounded-full border mt-0.5 inline-block ${
                                        receipt.prioridad_sugerida === "PRIORIDAD_I_ROJO"
                                            ? "bg-red-500/20 text-red-400 border-red-500/40 animate-pulse"
                                            : receipt.prioridad_sugerida === "PRIORIDAD_II_AMARILLO"
                                                ? "bg-amber-500/20 text-amber-400 border-amber-500/40"
                                                : "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
                                    }`}>
                                        {receipt.prioridad_sugerida.replace(/_/g, " ")}
                                    </div>
                                </div>
                            </div>

                            <div className="text-xs text-slate-300 space-y-1">
                                <div className="text-slate-400 text-[11px]">Tiempo referencial de atención médica:</div>
                                <div className="font-semibold text-white">{receipt.tiempo_atencion_referencial}</div>
                            </div>

                            {/* RECOMENDACIONES DE PRIMEROS AUXILIOS */}
                            <div className="bg-slate-900/90 rounded-xl p-3 border border-slate-800 space-y-2">
                                <h3 className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                                    <Stethoscope className="w-4 h-4 text-amber-400" />
                                    Pautas Inmediatas de Primeros Auxilios (No tome fármacos sin receta):
                                </h3>
                                <ul className="text-xs text-slate-300 space-y-1 list-disc list-inside">
                                    {receipt.recomendaciones_primeros_auxilios?.map((rec: string, idx: number) => (
                                        <li key={idx}>{rec}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        {/* ACCIONES DEL CIUDADANO */}
                        <div className="flex flex-wrap justify-between items-center gap-3 pt-2">
                            <button
                                onClick={() => {
                                    const text = encodeURIComponent(
                                        `🚨 *REPORTE MÉDICO COED-SALUD* 🚨\n` +
                                        `Código CUP: *${receipt.cup}*\n` +
                                        `Prioridad: ${receipt.prioridad_sugerida}\n` +
                                        `Atención: ${receipt.tiempo_atencion_referencial}\n` +
                                        `_Registrado en el sistema de triaje digital de emergencia._`
                                    );
                                    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
                                }}
                                className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition flex items-center gap-2 shadow-lg shadow-emerald-600/30 cursor-pointer"
                            >
                                <Share2 className="w-4 h-4" />
                                <span>Compartir Código CUP por WhatsApp</span>
                            </button>

                            <button
                                onClick={() => {
                                    setReceipt(null);
                                    setSintomasSeleccionados([]);
                                    setRelato("");
                                    setFotoSelected(null);
                                }}
                                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition cursor-pointer"
                            >
                                Registrar Otro Familiar
                            </button>
                        </div>
                    </div>
                ) : (
                    /* FORMULARIO DE TRIAJE */
                    <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6">
                        {/* SECCIÓN 1: IDENTIDAD BÓVEDA */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-1.5">
                                    <Lock className="w-3.5 h-3.5 text-emerald-400" />
                                    1. Datos Personales (Se resguardan en Bóveda Criptográfica)
                                </h3>
                                <span className="text-[10px] text-slate-500 font-mono">Ley N.° 29733</span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <div>
                                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                                        DNI del Paciente (*):
                                    </label>
                                    <input
                                        type="text"
                                        maxLength={8}
                                        value={dni}
                                        onChange={(e) => setDni(e.target.value.replace(/\D/g, ""))}
                                        placeholder="8 dígitos"
                                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500 font-mono"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                                        Nombres (*):
                                    </label>
                                    <input
                                        type="text"
                                        value={nombres}
                                        onChange={(e) => setNombres(e.target.value)}
                                        placeholder="Ej: María Elena"
                                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                                        Apellidos (*):
                                    </label>
                                    <input
                                        type="text"
                                        value={apellidos}
                                        onChange={(e) => setApellidos(e.target.value)}
                                        placeholder="Ej: Vilcherrez Sullón"
                                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                                        Teléfono / WhatsApp (*):
                                    </label>
                                    <input
                                        type="tel"
                                        value={telefono}
                                        onChange={(e) => setTelefono(e.target.value)}
                                        placeholder="9 dígitos del paciente o familiar"
                                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500 font-mono"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                                        Contacto Auxiliar / Vecino (Opcional):
                                    </label>
                                    <input
                                        type="text"
                                        value={contactoAux}
                                        onChange={(e) => setContactoAux(e.target.value)}
                                        placeholder="Ej: 968124578 (Hermana o dirigente)"
                                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* SECCIÓN 2: LOCALIZACIÓN Y CONDICIÓN DE RIESGO HÍDRICO */}
                        <div className="space-y-4 pt-2">
                            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-1.5">
                                    <MapPin className="w-3.5 h-3.5 text-sky-400" />
                                    2. Ubicación y Nivel del Agua en la Vivienda
                                </h3>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <div>
                                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                                        Distrito / Cuenca FEN:
                                    </label>
                                    <select
                                        value={ubigeo}
                                        onChange={(e) => setUbigeo(e.target.value)}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
                                    >
                                        <option value="200105">[200105] Catacaos (Piura) — Río Piura</option>
                                        <option value="200101">[200101] Piura (Piura) — Río Piura</option>
                                        <option value="140301">[140301] Íllimo (Lambayeque) — Río La Leche</option>
                                        <option value="130101">[130101] Trujillo (La Libertad) — Quebrada San Ildefonso</option>
                                        <option value="150118">[150118] Lurigancho Chosica (Lima) — Quebrada Quirio</option>
                                        <option value="240101">[240101] Tumbes (Tumbes) — Río Tumbes</option>
                                    </select>
                                </div>
                                <div className="sm:col-span-2">
                                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                                        Lugar Específico / Caserío / Manzana:
                                    </label>
                                    <input
                                        type="text"
                                        value={lugarReferencial}
                                        onChange={(e) => setLugarReferencial(e.target.value)}
                                        placeholder="Ej: Caserío Pedregal Grande Mz B Lote 4, cerca al dique"
                                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
                                        required
                                    />
                                </div>
                            </div>

                            {/* SELECTOR DE NIVEL DE INUNDACIÓN EN VIVIENDA */}
                            <div>
                                <label className="block text-[11px] font-semibold text-slate-300 mb-1.5">
                                    ¿Hasta dónde llega el agua en el lugar donde están?:
                                </label>
                                <div className="grid grid-cols-3 gap-2">
                                    {[
                                        { id: "PATIO", label: "Solo en el patio", icon: "🏡", desc: "Podemos movernos" },
                                        { id: "INTERIOR_RODILLA", label: "Dentro de la casa", icon: "🌊", desc: "A nivel rodilla o cintura" },
                                        { id: "TECHO_AISLADO", label: "En el techo / Aislados", icon: "🏠", desc: "No podemos salir" }
                                    ].map(item => (
                                        <button
                                            key={item.id}
                                            type="button"
                                            onClick={() => setAguaEnVivienda(item.id)}
                                            className={`p-2.5 rounded-xl border text-center transition flex flex-col items-center justify-center gap-1 cursor-pointer ${
                                                aguaEnVivienda === item.id
                                                    ? "bg-sky-950/60 border-sky-500 text-white shadow-lg ring-1 ring-sky-400 font-bold"
                                                    : "bg-slate-950/80 border-slate-800 text-slate-400 hover:border-slate-700"
                                            }`}
                                        >
                                            <span className="text-xl">{item.icon}</span>
                                            <span className="text-xs font-semibold">{item.label}</span>
                                            <span className="text-[10px] text-slate-400">{item.desc}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* SECCIÓN 3: CONDICIÓN VULNERABLE Y GESTACIÓN */}
                        <div className="space-y-4 pt-2">
                            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-1.5">
                                    <Baby className="w-3.5 h-3.5 text-purple-400" />
                                    3. Edad y Condición Especial
                                </h3>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <div>
                                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                                        Edad del Paciente:
                                    </label>
                                    <input
                                        type="number"
                                        min={0}
                                        max={110}
                                        value={edad}
                                        onChange={(e) => setEdad(Number(e.target.value))}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500 font-mono"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                                        Sexo:
                                    </label>
                                    <select
                                        value={sexo}
                                        onChange={(e) => setSexo(e.target.value)}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                                    >
                                        <option value="FEMENINO">Femenino</option>
                                        <option value="MASCULINO">Masculino</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                                        ¿Es mujer gestante / embarazada?:
                                    </label>
                                    <div className="flex items-center gap-2 mt-1">
                                        <button
                                            type="button"
                                            onClick={() => setEsGestante(!esGestante)}
                                            className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                                                esGestante
                                                    ? "bg-purple-600 text-white border-purple-400 shadow-md shadow-purple-600/30"
                                                    : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"
                                            }`}
                                        >
                                            <Baby className="w-3.5 h-3.5" />
                                            <span>{esGestante ? "✓ Sí, es Gestante" : "No"}</span>
                                        </button>
                                        {esGestante && (
                                            <input
                                                type="number"
                                                min={1}
                                                max={42}
                                                value={semanasGestacion}
                                                onChange={(e) => setSemanasGestacion(Number(e.target.value))}
                                                placeholder="Semanas"
                                                className="w-24 bg-slate-950 border border-purple-500 rounded-xl px-2 py-1.5 text-xs text-white font-mono"
                                            />
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* SECCIÓN 4: SÍNTOMAS DEL FEN (SELECCIÓN RÁPIDA) */}
                        <div className="space-y-4 pt-2">
                            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-1.5">
                                    <Activity className="w-3.5 h-3.5 text-rose-400" />
                                    4. Síntomas Presentes (Toque los que apliquen)
                                </h3>
                                <span className="text-[10px] text-slate-400">Escala NTS N.° 105-MINSA</span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                                {SINTOMAS_FEN.map(s => {
                                    const isSelected = sintomasSeleccionados.includes(s.id);
                                    return (
                                        <button
                                            key={s.id}
                                            type="button"
                                            onClick={() => toggleSintoma(s.id)}
                                            className={`p-2.5 rounded-xl border text-left transition flex items-start gap-2.5 cursor-pointer ${
                                                isSelected
                                                    ? s.severo
                                                        ? "bg-red-950/60 border-red-500 text-white shadow-lg ring-1 ring-red-400"
                                                        : "bg-amber-950/60 border-amber-500 text-white shadow-lg ring-1 ring-amber-400"
                                                    : "bg-slate-950/80 border-slate-800 text-slate-300 hover:border-slate-700"
                                            }`}
                                        >
                                            <span className="text-xl mt-0.5">{s.icon}</span>
                                            <div>
                                                <div className="text-xs font-bold flex items-center gap-1">
                                                    <span>{s.label}</span>
                                                    {s.severo && (
                                                        <span className="text-[8px] bg-red-900/80 text-red-200 px-1 rounded font-mono">Urgente</span>
                                                    )}
                                                </div>
                                                <div className="text-[10px] text-slate-400 mt-0.5 leading-snug">{s.desc}</div>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* SECCIÓN 5: DESCRIPCIÓN Y FOTO DE LA LESIÓN */}
                        <div className="space-y-4 pt-2">
                            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-1.5">
                                    <FileText className="w-3.5 h-3.5 text-amber-400" />
                                    5. Detalle lo que siente y adjunte foto (opcional)
                                </h3>
                            </div>

                            <div>
                                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                                    Relato con sus propias palabras (*):
                                </label>
                                <textarea
                                    rows={3}
                                    value={relato}
                                    onChange={(e) => setRelato(e.target.value)}
                                    placeholder="Explique cómo empezó el malestar, si el agua está contaminada o si la herida tiene pus..."
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 leading-relaxed"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                                    Foto de la lesión, herida o estado del paciente:
                                </label>
                                <div className="border border-dashed border-slate-800 hover:border-slate-700 rounded-xl p-4 bg-slate-950/60 text-center transition flex flex-col items-center justify-center gap-2">
                                    <UploadCloud className="w-6 h-6 text-slate-500" />
                                    <div className="text-xs text-slate-300">
                                        {fotoSelected ? (
                                            <span className="text-emerald-400 font-semibold flex items-center gap-1">
                                                <CheckCircle2 className="w-4 h-4" /> Foto lista para peritaje médico: {fotoSelected}
                                            </span>
                                        ) : (
                                            <span>Toque para tomar foto o adjuntar de la galería</span>
                                        )}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setFotoSelected(`evidencia_clinica_${Date.now().toString().slice(-4)}.jpg`)}
                                        className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-200 border border-slate-700 transition"
                                    >
                                        Simular captura de cámara con GPS
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* BOTÓN DE ENVÍO */}
                        <div className="pt-4 border-t border-slate-800">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-rose-600 via-rose-500 to-rose-600 hover:from-rose-500 hover:to-rose-400 text-white font-bold text-sm shadow-xl shadow-rose-600/30 transition flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                            >
                                {loading ? (
                                    <>
                                        <RefreshCw className="w-4 h-4 animate-spin" />
                                        <span>Cifrando Datos en Bóveda CUP y Evaluando Triaje...</span>
                                    </>
                                ) : (
                                    <>
                                        <HeartPulse className="w-4 h-4" />
                                        <span>Enviar Triaje a Médicos del MINSA (Código Protegido CUP)</span>
                                    </>
                                )}
                            </button>
                            <p className="text-[10px] text-center text-slate-500 mt-2">
                                Conforme a la Ley N.° 26842 y Ley N.° 29733. Sus datos no serán compartidos públicamente.
                            </p>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
