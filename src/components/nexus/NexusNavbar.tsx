"use client";

import { Menu, Bell, Sun, Moon } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import UserMenu from "@/components/nexus/UserMenu";

interface Props {
  onMenuToggle: () => void;
}

export default function NexusNavbar({ onMenuToggle }: Props) {
  const { theme, toggle } = useTheme();
  const isDark = theme === "dark";

  return (
    <header
      className="nexus-header sticky top-0 z-50 border-b shrink-0"
      style={{
        background: "var(--bg-header)",
        borderColor: "var(--border-default)",
        height: "56px",
      }}
    >
      <div className="flex items-center justify-between h-full px-4 gap-4">

        {/* Hambúrguer */}
        <button
          onClick={onMenuToggle}
          title="Alternar menu lateral"
          className="p-1.5 rounded-lg transition-colors"
          style={{ color: "var(--text-muted)" }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "#7c3aed"; (e.currentTarget as HTMLElement).style.background = "rgba(124,58,237,0.08)"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "var(--text-muted)"; (e.currentTarget as HTMLElement).style.background = "transparent"; }}
        >
          <Menu size={20} />
        </button>

        {/* Ações direita */}
        <div className="flex items-center gap-1.5 ml-auto">

          {/* Toggle tema */}
          <button
            onClick={toggle}
            title={isDark ? "Tema claro" : "Tema escuro"}
            className="p-1.5 rounded-lg transition-all border"
            style={{
              color: isDark ? "#a78bfa" : "#7c3aed",
              borderColor: isDark ? "rgba(124,58,237,0.35)" : "rgba(124,58,237,0.25)",
              background: isDark ? "rgba(124,58,237,0.10)" : "rgba(124,58,237,0.08)",
            }}
          >
            {isDark ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          {/* Notificações */}
          <button
            className="relative p-1.5 rounded-lg transition-colors"
            style={{ color: "var(--text-muted)" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "#7c3aed"; (e.currentTarget as HTMLElement).style.background = "rgba(124,58,237,0.08)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "var(--text-muted)"; (e.currentTarget as HTMLElement).style.background = "transparent"; }}
          >
            <Bell size={17} />
            <span className="absolute top-0.5 right-0.5 w-2 h-2 bg-violet-500 rounded-full pulse-neon" />
          </button>

          {/* Divisor */}
          <div className="h-5 w-px mx-1" style={{ background: "var(--border-subtle)" }} />

          {/* User menu dropdown */}
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
