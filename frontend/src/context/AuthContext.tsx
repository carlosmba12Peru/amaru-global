"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { API_BASE } from "@/config/api";

export interface AuthUser {
    username: string;
    nombre: string;
    cargo: string;
    institucion: string;
    rol: "SUPER_ADMIN" | "AUTORIDAD_MUNICIPAL" | "OPERADOR_CAMPO";
    rol_etiqueta: string;
    ubigeo_asignado?: string;
    distrito_asignado?: string;
    permisos: string[];
    token: string;
    login_time?: string;
}

interface AuthContextType {
    user: AuthUser | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = "coen_auth_session_v1";

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    // Cargar y verificar sesión al iniciar
    useEffect(() => {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            try {
                const parsed: AuthUser = JSON.parse(stored);
                if (parsed && parsed.token) {
                    // Validar token con el backend
                    fetch(`${API_BASE}/api/auth/verify?token=${parsed.token}`)
                        .then((res) => {
                            if (res.ok) {
                                setUser(parsed);
                            } else {
                                localStorage.removeItem(STORAGE_KEY);
                                setUser(null);
                            }
                        })
                        .catch(() => {
                            // En caso de caída temporal del backend, mantener sesión local válida
                            setUser(parsed);
                        })
                        .finally(() => {
                            setIsLoading(false);
                        });
                    return;
                }
            } catch (e) {
                localStorage.removeItem(STORAGE_KEY);
            }
        }
        setIsLoading(false);
    }, [API_BASE]);

    const login = async (username: string, password: string): Promise<{ success: boolean; error?: string }> => {
        try {
            const res = await fetch(`${API_BASE}/api/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password })
            });

            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                return {
                    success: false,
                    error: errData.error || "Credenciales incorrectas. Verifique usuario o contraseña."
                };
            }

            const data: AuthUser = await res.json();
            setUser(data);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
            return { success: true };
        } catch (err: any) {
            return {
                success: false,
                error: "No se pudo conectar con el servidor de autenticación COEN."
            };
        }
    };

    const logout = () => {
        if (user?.token) {
            fetch(`${API_BASE}/api/auth/logout`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token: user.token })
            }).catch(() => {});
        }
        setUser(null);
        localStorage.removeItem(STORAGE_KEY);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated: !!user,
                isLoading,
                login,
                logout
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth(): AuthContextType {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth debe usarse dentro de un AuthProvider");
    }
    return context;
}
