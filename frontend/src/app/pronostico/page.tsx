import React from "react";
import PredictiveMultidayEapConsole from "@/components/PredictiveMultidayEapConsole";

export const metadata = {
    title: "Módulo Predictivo Multidía (7 Días) & Protocolos EAP | COEN C2 AMARU-CLIMATE",
    description: "Matriz consolidada de pronóstico de precipitaciones a 7 días para las ciudades y cuencas vulnerables del D.S. Nº 124-2026-PCM, articulada con Protocolos de Acción Temprana (EAP) en T-144h, T-72h y T-24h.",
};

export default function PronosticoPage() {
    return <PredictiveMultidayEapConsole />;
}
