// src/app/layout.tsx
import "./globals.css";
import HeaderNav from "@/components/HeaderNav";
import { TelemetryProvider } from "@/context/TelemetryContext";
import { AuthProvider } from "@/context/AuthContext";
import InstitutionalLoginModal from "@/components/InstitutionalLoginModal";

export const metadata = {
  title: "AMARU-CLIMATE • Suite Soberana de Inteligencia y Gobernanza Territorial",
  description: "AMARU-CLIMATE: Suite Tripartita Soberana que articula COED Nacional AMARU, COED Municipal AMARU y COED Social AMARU ante el Fenómeno El Niño y eventos climáticos extremos.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="dark">
      <body className="bg-slate-950 text-slate-100 min-h-screen antialiased">
        <AuthProvider>
          <TelemetryProvider>
            <InstitutionalLoginModal />
            <HeaderNav />
            <main className="p-4">{children}</main>
          </TelemetryProvider>
        </AuthProvider>
      </body>
    </html>
  );
}