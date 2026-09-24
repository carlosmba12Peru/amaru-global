"use client";

import React from "react";
import { useAuth } from "@/context/AuthContext";
import {
    User,
    LogOut,
    Shield,
    Building2,
    Radio,
    ShieldAlert,
    CheckCircle2
} from "lucide-react";

export default function UserNavBadge() {
    const { user, isAuthenticated, logout } = useAuth();

    if (!isAuthenticated || !user) {
        return null;
    }

    const getRoleBadge = () => {
        switch (user.rol) {
            case "SUPER_ADMIN":
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-red-950 border border-red-500/50 text-red-300">
                        <ShieldAlert className="w-3 h-3 text-red-400" />
                        COMANDO COEN
                    </span>
                );
            case "AUTORIDAD_MUNICIPAL":
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950 border border-amber-500/50 text-amber-300">
                        <Building2 className="w-3 h-3 text-amber-400" />
                        ALCALDÍA DISTRITAL
                    </span>
                );
            case "OPERADOR_CAMPO":
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-950 border border-cyan-500/50 text-cyan-300">
                        <Radio className="w-3 h-3 text-cyan-400" />
                        BRIGADA DE CAMPO
                    </span>
                );
            default:
                return null;
        }
    };

    return (
        <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-700/70 shadow-sm text-xs">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-slate-800 to-slate-950 border border-slate-600 flex items-center justify-center text-slate-200 font-semibold text-[11px] shadow-inner">
                {user.nombre.charAt(0)}
            </div>

            <div className="hidden lg:block text-left leading-tight">
                <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-slate-100 max-w-[140px] truncate">
                        {user.nombre}
                    </span>
                    {getRoleBadge()}
                </div>
                <div className="text-[10px] text-slate-400 truncate max-w-[180px]">
                    {user.cargo}
                </div>
            </div>

            <button
                onClick={logout}
                title="Cerrar Sesión Institucional"
                className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-950/40 border border-transparent hover:border-red-800/40 transition-all ml-1 flex items-center gap-1 text-[11px]"
            >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden xl:inline text-[10px]">Salir</span>
            </button>
        </div>
    );
}
