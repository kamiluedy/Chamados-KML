"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Sidebar from "@/components/nexus/Sidebar";
import NexusNavbar from "@/components/nexus/NexusNavbar";
import { useConfig } from "@/lib/config-store";

const BREADCRUMB: Record<string, string> = {
  "/dashboard": "Dashboard Analytics",
  "/kanban":    "Quadro de Chamados",
  "/novo":      "Abrir Chamado",
  "/usuarios":  "Gerenciamento de Usuários",
  "/perfil":    "Editar Perfil",
  "/grupos":         "Grupos de Atendimento",
  "/configuracoes":  "Configurações Gerais",
  "/relatorios":     "Relatórios",
  "/seguranca":      "Segurança",
  "/tarefas":        "Tarefas",
};

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { config } = useConfig();

  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window === "undefined") return true;
    const saved = localStorage.getItem("nexus-sidebar");
    return saved !== null ? saved === "true" : true;
  });
  const today = new Date().toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit", month: "short", year: "numeric" });

  useEffect(() => {
    localStorage.setItem("nexus-sidebar", String(collapsed));
  }, [collapsed]);

  function toggleSidebar() {
    setCollapsed((v) => !v);
  }

  const breadcrumb = BREADCRUMB[pathname] ?? "—";

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        activePath={pathname}
        collapsed={collapsed}
        onToggle={toggleSidebar}
      />

      <div className="flex flex-col flex-1 overflow-hidden min-w-0">
        <NexusNavbar
          onMenuToggle={toggleSidebar}
        />

        {/* Barra de status */}
        <div
          className="shrink-0"
          style={{ background: "var(--bg-statusbar)", borderBottom: "1px solid var(--border-subtle)" }}
        >
          <div className="px-6 py-2 flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5 text-[11px] text-emerald-500">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 online-dot" />
                Todos os sistemas operacionais
              </div>
              <div className="hidden sm:flex items-center gap-1.5 text-[11px]" style={{ color: "var(--text-faint)" }}>
                <span className="w-1.5 h-1.5 rounded-full bg-yellow-500" />
                Bot Selenium — monitoramento ativo
              </div>
            </div>
            <div className="flex items-center gap-4 text-[11px]" style={{ color: "var(--text-faint)" }}>
              <span>Turno: <span style={{ color: "var(--text-secondary)" }}>{config.turnoInicio}h – {config.turnoFim}h</span></span>
              <span>Analista: <span className="text-violet-500 font-semibold">{config.analistaNome}</span></span>
              <span className="hidden md:inline" suppressHydrationWarning>
                {today}
              </span>
            </div>
          </div>
        </div>

        {/* Conteúdo principal */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs mb-6" style={{ color: "var(--text-faint)" }}>
            <span className="text-violet-500 font-semibold">KML DESK</span>
            <span>/</span>
            <span style={{ color: "var(--text-secondary)" }}>{breadcrumb}</span>
          </div>

          {children}
        </main>

        {/* Footer */}
        <footer className="shrink-0" style={{ borderTop: "1px solid var(--border-subtle)" }}>
          <div className="px-6 py-3">
            <div className="flex items-center justify-between text-[11px] flex-wrap gap-2" style={{ color: "var(--text-faint)" }}>
              <span className="neon-text font-black tracking-widest">KML DESK</span>
              <span>v1.0.0 · Feito por Kamila Luedy · {config.slogan}</span>
              <span>Next.js + Tailwind CSS</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
