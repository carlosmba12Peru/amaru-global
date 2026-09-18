// src/context/TelemetryContext.tsx
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface TelemetryData {
  forecast: any; // replace with proper type if available
  flood: any;
  alert?: string;
}

interface TelemetryContextProps {
  ubigeo: string;
  setUbigeo: (u: string) => void;
  data: TelemetryData | null;
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

const TelemetryContext = createContext<TelemetryContextProps | undefined>(undefined);

export const TelemetryProvider = ({ children }: { children: ReactNode }) => {
  const [ubigeo, setUbigeo] = useState<string>("");
  const [data, setData] = useState<TelemetryData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTelemetry = async (code: string) => {
    if (!code) return;
    setLoading(true);
    setError(null);
    try {
      const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const resp = await fetch(`${apiBase}/api/distrito/${code}/telemetria`);
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const json = await resp.json();
      setData({ forecast: json.forecast, flood: json.flood, alert: json.alert });
    } catch (e: any) {
      setError(e.message || "Error fetching telemetry");
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTelemetry(ubigeo);
  }, [ubigeo]);

  const refresh = () => fetchTelemetry(ubigeo);

  return (
    <TelemetryContext.Provider value={{ ubigeo, setUbigeo, data, loading, error, refresh }}>
      {children}
    </TelemetryContext.Provider>
  );
};

export const useTelemetry = () => {
  const ctx = useContext(TelemetryContext);
  if (!ctx) throw new Error("useTelemetry must be used within TelemetryProvider");
  return ctx;
};
