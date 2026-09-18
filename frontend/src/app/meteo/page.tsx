import React from "react";
import MeteoFenConsole from "@/components/MeteoFenConsole";

export const metadata = {
    title: "Consola Meteorológica FEN (893 Distritos D.S. 124) | COEN C2",
    description: "Monitoreo cuantitativo de lluvias, inestabilidad convectiva CAPE e infiltración de suelo Open-Meteo Pro para los 893 distritos declarados en emergencia por el Fenómeno El Niño 2026-2027.",
};

export default function MeteoPage() {
    return <MeteoFenConsole />;
}
