import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/context/ThemeContext";
import AppShell from "@/components/nexus/AppShell";
import { GruposProvider } from "@/lib/grupos-store";
import { ConfigProvider } from "@/lib/config-store";

export const metadata: Metadata = {
  title: "KML DESK — Sistema de Chamados de TI",
  description: "Sistema de gestão e monitoramento de chamados de TI — KML DESK",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className="h-full">
      <body className="min-h-full antialiased">
        <ThemeProvider>
          <ConfigProvider>
            <GruposProvider>
              <AppShell>{children}</AppShell>
            </GruposProvider>
          </ConfigProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
