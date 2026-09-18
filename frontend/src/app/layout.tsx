// src/app/layout.tsx
import "./globals.css";
import HeaderNav from "@/components/HeaderNav";
import { TelemetryProvider } from "@/context/TelemetryContext";

export const metadata = {
  title: "AMARU-CLIMATE • Inteligencia & Gobernanza Climática Territorial del Perú",
  description: "Plataforma de Inteligencia y Gobernanza Climática Territorial frente al Fenómeno El Niño y Heladas – COEN / INDECI / ENFEN",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="dark">
      <body className="bg-slate-950 text-slate-100 min-h-screen antialiased">
        <TelemetryProvider>
          <HeaderNav />
          <main className="p-4">{children}</main>
        </TelemetryProvider>
      </body>
    </html>
  );
}