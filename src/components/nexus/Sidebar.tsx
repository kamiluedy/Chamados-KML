"use client";

import Link from "next/link";
import {
  LayoutDashboard,
  KanbanSquare,
  Plus,
  Users,
  UsersRound,
  ShieldCheck,
  BarChart2,
  Settings,
  ChevronRight,
  Terminal,
  CheckSquare,
} from "lucide-react";

interface Props {
  activePath: string;
  collapsed: boolean;
  onToggle: () => void;
}

const NAV_PRIMARY = [
  { icon: <LayoutDashboard size={18} />, label: "Painel / Analytics", path: "/dashboard" },
  { icon: <KanbanSquare   size={18} />, label: "Quadro de Chamados",  path: "/kanban"    },
  { icon: <Plus           size={18} />, label: "Abrir Chamado",       path: "/novo"      },
  { icon: <Users          size={18} />, label: "Usuários",            path: "/usuarios"  },
  { icon: <UsersRound     size={18} />, label: "Grupos",              path: "/grupos"    },
  { icon: <CheckSquare    size={18} />, label: "Tarefas",             path: "/tarefas"   },
];

const NAV_SECONDARY: { icon: React.ReactNode; label: string; path?: string }[] = [
  { icon: <ShieldCheck size={18} />, label: "Segurança",     path: "/seguranca"      },
  { icon: <BarChart2   size={18} />, label: "Relatórios",    path: "/relatorios"     },
  { icon: <Settings    size={18} />, label: "Configurações", path: "/configuracoes"  },
];

export default function Sidebar({ activePath, collapsed, onToggle }: Props) {
  return (
    <aside
      style={{
        width: collapsed ? 64 : 220,
        minWidth: collapsed ? 64 : 220,
        transition: "width 280ms ease, min-width 280ms ease",
        background: "var(--bg-header)",
        borderRight: "1px solid var(--border-default)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
      }}
      className="h-screen flex flex-col shrink-0 overflow-hidden z-40"
    >
      {/* ── Logo + Toggle ── */}
      <div
        className="flex items-center shrink-0 h-14 px-3 gap-2"
        style={{ borderBottom: "1px solid var(--border-default)" }}
      >
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 pulse-neon"
          style={{ background: "rgba(124,58,237,0.2)", border: "1px solid rgba(124,58,237,0.5)" }}
        >
          <Terminal size={14} className="text-violet-400" />
        </div>

        <span
          className="neon-text font-black text-sm tracking-widest flex-1 overflow-hidden whitespace-nowrap"
          style={{
            opacity: collapsed ? 0 : 1,
            maxWidth: collapsed ? 0 : 200,
            transition: "opacity 200ms ease, max-width 280ms ease",
          }}
        >
          KML DESK
        </span>

        <button
          onClick={onToggle}
          title={collapsed ? "Expandir menu" : "Recolher menu"}
          className="p-1 rounded-md transition-colors shrink-0"
          style={{ color: "var(--text-faint)" }}
        >
          <ChevronRight
            size={15}
            style={{
              transform: collapsed ? "rotate(0deg)" : "rotate(180deg)",
              transition: "transform 280ms ease",
            }}
          />
        </button>
      </div>

      {/* ── Navegação ── */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden p-2 flex flex-col gap-0.5">

        {NAV_PRIMARY.map((item) => (
          <NavLink
            key={item.path}
            href={item.path}
            icon={item.icon}
            label={item.label}
            isActive={activePath === item.path}
            collapsed={collapsed}
          />
        ))}

        <div className="my-2 mx-1" style={{ borderTop: "1px solid var(--border-subtle)" }} />

        {NAV_SECONDARY.map((item) =>
          item.path ? (
            <NavLink
              key={item.path}
              href={item.path}
              icon={item.icon}
              label={item.label}
              isActive={activePath === item.path}
              collapsed={collapsed}
            />
          ) : (
            <NavDisabled
              key={item.label}
              icon={item.icon}
              label={item.label}
              collapsed={collapsed}
            />
          )
        )}
      </nav>

      {/* ── Rodapé ── */}
      <div className="shrink-0 p-2" style={{ borderTop: "1px solid var(--border-default)" }}>
        <div
          className="flex items-center gap-2.5 overflow-hidden rounded-lg px-2 py-1.5"
          style={{ justifyContent: collapsed ? "center" : "flex-start" }}
        >
          <div className="relative shrink-0">
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-black text-white pulse-neon"
              style={{ background: "linear-gradient(135deg,#7c3aed,#6d28d9)", border: "2px solid #7c3aed" }}
              title={collapsed ? "Kamila L. — Online" : undefined}
            >
              KL
            </div>
            <span
              className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-emerald-400 rounded-full online-dot"
              style={{ border: "2px solid var(--avatar-border)" }}
            />
          </div>
          <div
            className="overflow-hidden"
            style={{ opacity: collapsed ? 0 : 1, maxWidth: collapsed ? 0 : 200, transition: "opacity 150ms ease, max-width 280ms ease" }}
          >
            <p className="text-xs font-semibold leading-none whitespace-nowrap" style={{ color: "var(--text-heading)" }}>
              Kamila Luedy
            </p>
            <p className="text-[10px] text-emerald-500 leading-none mt-0.5 whitespace-nowrap">● Online</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

function NavLink({ href, icon, label, isActive, collapsed }: {
  href: string; icon: React.ReactNode; label: string;
  isActive: boolean; collapsed: boolean;
}) {
  return (
    <Link
      href={href}
      title={collapsed ? label : undefined}
      className={`sidebar-item w-full${isActive ? " active" : ""}`}
      style={{
        justifyContent: collapsed ? "center" : "flex-start",
        paddingLeft: collapsed ? 0 : undefined,
        paddingRight: collapsed ? 0 : undefined,
        color: isActive ? "var(--tab-active)" : "var(--text-muted)",
      }}
    >
      <span className="shrink-0">{icon}</span>
      <span
        className="overflow-hidden whitespace-nowrap"
        style={{ opacity: collapsed ? 0 : 1, maxWidth: collapsed ? 0 : 200, transition: "opacity 150ms ease, max-width 280ms ease" }}
      >
        {label}
      </span>
    </Link>
  );
}

function NavDisabled({ icon, label, collapsed }: {
  icon: React.ReactNode; label: string; collapsed: boolean;
}) {
  return (
    <div
      title={collapsed ? label : undefined}
      className="sidebar-item w-full"
      style={{
        justifyContent: collapsed ? "center" : "flex-start",
        paddingLeft: collapsed ? 0 : undefined,
        paddingRight: collapsed ? 0 : undefined,
        color: "var(--text-faint)",
        opacity: 0.5,
        cursor: "default",
      }}
    >
      <span className="shrink-0">{icon}</span>
      <span
        className="overflow-hidden whitespace-nowrap"
        style={{ opacity: collapsed ? 0 : 1, maxWidth: collapsed ? 0 : 200, transition: "opacity 150ms ease, max-width 280ms ease" }}
      >
        {label}
      </span>
    </div>
  );
}
