import React from "react";
import MeteoFenConsole from "@/components/MeteoFenConsole";

export const metadata = {
    title: "Consola Meteorológica Multi-Régimen (FEN 893 & Heladas 1531) | COED Nacional C2",
    description: "Monitoreo cuantitativo de lluvias, inestabilidad convectiva CAPE e infiltración de suelo Open-Meteo Pro, y régimen de heladas/friajes para el COED Nacional y Gobiernos Locales.",
};

export default function MeteoPage() {
    return <MeteoFenConsole />;
}
