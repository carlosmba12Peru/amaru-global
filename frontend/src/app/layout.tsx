import "./globals.css";
import HeaderNav from "@/components/HeaderNav";
import { TelemetryProvider } from "@/context/TelemetryContext";
import { AuthProvider } from "@/context/AuthContext";
import { LanguageProvider } from "@/context/LanguageContext";
import InstitutionalLoginModal from "@/components/InstitutionalLoginModal";
import CommandPaletteModal from "@/components/CommandPaletteModal";

export const metadata = {
  title: "AMARU-GLOBAL / AMARU-CLIMATE • Sovereign C2 & UN-EW4All Suite",
  description: "Sovereign Multi-Agent C2 Framework & Blockchain Notary for UN-EW4All Climate Resilience, Sendai Framework & Anti-Corruption Auditing.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="dark">
      <body className="bg-slate-950 text-slate-100 min-h-screen antialiased">
        <LanguageProvider>
          <AuthProvider>
            <TelemetryProvider>
              <InstitutionalLoginModal />
              <CommandPaletteModal />
              <HeaderNav />
              <main className="p-4">{children}</main>
            </TelemetryProvider>
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}