"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import {
    ShieldCheck,
    Lock,
    User,
    KeyRound,
    Eye,
    EyeOff,
    Building2,
    ShieldAlert,
    Radio,
    AlertCircle,
    CheckCircle2,
    Sparkles,
    ChevronRight,
    ArrowRight
} from "lucide-react";

export default function InstitutionalLoginModal() {
    const { isAuthenticated, isLoading, login } = useAuth();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    // No mostrar nada si aún está verificando la sesión inicial o si ya está autenticado
    if (isLoading || isAuthenticated) {
        return null;
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg(null);
        if (!username.trim() || !password.trim()) {
            setErrorMsg("Por favor ingrese su usuario y contraseña institucional.");
            return;
        }

        setIsSubmitting(true);
        const res = await login(username, password);
        setIsSubmitting(false);

        if (!res.success) {
            setErrorMsg(res.error || "Credenciales incorrectas.");
        }
    };

    const handleQuickFill = (u: string, p: string) => {
        setUsername(u);
        setPassword(p);
        setErrorMsg(null);
    };

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
            {/* Contenedor Principal con Borde Resplandeciente */}
            <div className="relative w-full max-w-lg rounded-2xl bg-gradient-to-b from-slate-900 via-slate-900/95 to-slate-950 border border-slate-700/80 shadow-2xl shadow-cyan-950/40 p-6 md:p-8 overflow-hidden">
                {/* Elementos Decorativos Superiores */}
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-red-600 via-amber-500 to-cyan-500" />
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />

                {/* Encabezado Institucional */}
                <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-red-950/60 border border-red-500/30 text-red-400 mb-3 shadow-inner">
                        <ShieldAlert className="w-8 h-8 text-red-500 animate-pulse" />
                    </div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-xs font-semibold text-slate-300 mb-2">
                        <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                        SINAGERD • COED NACIONAL PERÚ
                    </div>
                    <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white">
                        COED-Digital & AMARU-LEX
                    </h2>
                    <p className="text-xs text-slate-400 mt-1">
                        Plataforma de Inteligencia Territorial y Respuesta de Emergencia
                    </p>
                </div>

                {/* Mensaje de Error si aplica */}
                {errorMsg && (
                    <div className="mb-5 p-3 rounded-lg bg-red-950/70 border border-red-500/50 flex items-start gap-2.5 text-xs text-red-200 animate-shake">
                        <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">{errorMsg}</div>
                    </div>
                )}

                {/* Formulario de Inicio de Sesión */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center justify-between">
                            <span>Usuario Institucional</span>
                            <span className="text-[10px] text-slate-500">Ej: admin.alcaldia</span>
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                <User className="w-4 h-4" />
                            </div>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="admin.alcaldia / admin.coen / admin.social"
                                className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-slate-950/80 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all"
                                autoFocus
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center justify-between">
                            <span>Contraseña Oficial</span>
                            <span className="text-[10px] text-slate-500">Cifrada SHA-256</span>
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                <KeyRound className="w-4 h-4" />
                            </div>
                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••••••"
                                className="w-full pl-9 pr-10 py-2.5 rounded-lg bg-slate-950/80 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-white transition-colors"
                            >
                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-2.5 px-4 rounded-lg bg-gradient-to-r from-red-600 via-red-500 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-semibold text-sm shadow-lg shadow-red-900/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group"
                    >
                        {isSubmitting ? (
                            <>
                                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                <span>Verificando Credenciales...</span>
                            </>
                        ) : (
                            <>
                                <Lock className="w-4 h-4" />
                                <span>Ingresar al Sistema Seguro</span>
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </>
                        )}
                    </button>
                </form>

                {/* Perfiles de Acceso Rápido Institucional (Para Demo y Evaluación) */}
                <div className="mt-6 pt-5 border-t border-slate-800">
                    <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2.5">
                        <span className="flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                            Perfiles Oficiales de Acceso Rápido
                        </span>
                        <span className="text-[10px] text-slate-500 lowercase">clic para cargar</span>
                    </div>

                    <div className="grid grid-cols-1 gap-2">
                        {/* Opción 1: Alcaldía Distrital */}
                        <button
                            type="button"
                            onClick={() => handleQuickFill("admin.alcaldia", "Amaru2026!!!")}
                            className="p-2.5 rounded-lg bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800 hover:border-amber-500/50 text-left transition-all flex items-center justify-between group"
                        >
                            <div className="flex items-center gap-2.5">
                                <div className="p-1.5 rounded-md bg-amber-950/60 text-amber-400 border border-amber-500/30">
                                    <Building2 className="w-4 h-4" />
                                </div>
                                <div>
                                    <div className="text-xs font-semibold text-white group-hover:text-amber-300 transition-colors">
                                        Alcaldía Distrital & Defensa Civil
                                    </div>
                                    <div className="text-[10px] text-slate-400">
                                        Usuario: <code className="text-amber-400">admin.alcaldia</code> • Clave: <span className="text-slate-500 font-mono tracking-widest">••••••••••••</span>
                                    </div>
                                </div>
                            </div>
                            <span className="text-[10px] px-2 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-800/60 group-hover:bg-amber-500 group-hover:text-black font-semibold transition-colors">
                                Seleccionar
                            </span>
                        </button>

                        {/* Opción 2: Administrador COED Nacional Amaru */}
                        <button
                            type="button"
                            onClick={() => handleQuickFill("admin.coen", "Amaru2026@@@")}
                            className="p-2.5 rounded-lg bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800 hover:border-red-500/50 text-left transition-all flex items-center justify-between group"
                        >
                            <div className="flex items-center gap-2.5">
                                <div className="p-1.5 rounded-md bg-red-950/60 text-red-400 border border-red-500/30">
                                    <ShieldCheck className="w-4 h-4" />
                                </div>
                                <div>
                                    <div className="text-xs font-semibold text-white group-hover:text-red-300 transition-colors">
                                        Comando COED Nacional Amaru & Operaciones C2
                                    </div>
                                    <div className="text-[10px] text-slate-400">
                                        Usuario: <code className="text-red-400">admin.coen</code> • Clave: <span className="text-slate-500 font-mono tracking-widest">••••••••••••</span>
                                    </div>
                                </div>
                            </div>
                            <span className="text-[10px] px-2 py-0.5 rounded bg-red-950/80 text-red-300 border border-red-800/60 group-hover:bg-red-500 group-hover:text-white font-semibold transition-colors">
                                Seleccionar
                            </span>
                        </button>

                        {/* Opción 3: Brigada Territorial / Social */}
                        <button
                            type="button"
                            onClick={() => handleQuickFill("admin.social", "Amaru2026$$$")}
                            className="p-2.5 rounded-lg bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800 hover:border-cyan-500/50 text-left transition-all flex items-center justify-between group"
                        >
                            <div className="flex items-center gap-2.5">
                                <div className="p-1.5 rounded-md bg-cyan-950/60 text-cyan-400 border border-cyan-500/30">
                                    <Radio className="w-4 h-4" />
                                </div>
                                <div>
                                    <div className="text-xs font-semibold text-white group-hover:text-cyan-300 transition-colors">
                                        Brigada Territorial y Social de Campo
                                    </div>
                                    <div className="text-[10px] text-slate-400">
                                        Usuario: <code className="text-cyan-400">admin.social</code> • Clave: <span className="text-slate-500 font-mono tracking-widest">••••••••••••</span>
                                    </div>
                                </div>
                            </div>
                            <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-800/60 group-hover:bg-cyan-500 group-hover:text-black font-semibold transition-colors">
                                Seleccionar
                            </span>
                        </button>
                    </div>
                </div>

                {/* Pie de Página con Sello de Blindaje Legal */}
                <div className="mt-5 text-center text-[10px] text-slate-500 flex items-center justify-center gap-2">
                    <Lock className="w-3 h-3 text-slate-400" />
                    <span>Blindaje Legal AMARU-LEX • D.S. Nº 124-2026-PCM • Auditoría CGR</span>
                </div>
            </div>
        </div>
    );
}
