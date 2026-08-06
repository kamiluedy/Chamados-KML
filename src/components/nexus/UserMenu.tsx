"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { User, LogOut, ChevronDown, Settings } from "lucide-react";

export default function UserMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  return (
    <div ref={ref} className="relative">
      {/* Trigger */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-xl px-2 py-1.5 transition-all"
        style={{
          background: open ? "rgba(124,58,237,0.10)" : "transparent",
          border: "1px solid",
          borderColor: open ? "rgba(124,58,237,0.35)" : "transparent",
        }}
      >
        <div className="relative">
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-black text-white pulse-neon"
            style={{ background: "linear-gradient(135deg,#7c3aed,#6d28d9)", border: "2px solid #7c3aed" }}
          >
            KL
          </div>
          <span
            className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-emerald-400 rounded-full online-dot"
            style={{ border: "2px solid var(--avatar-border)" }}
          />
        </div>
        <div className="hidden sm:block text-left">
          <p className="text-xs font-semibold leading-none" style={{ color: "var(--text-heading)" }}>
            Kamila L.
          </p>
          <p className="text-[10px] text-emerald-500 leading-none mt-0.5">Online</p>
        </div>
        <ChevronDown
          size={13}
          style={{
            color: "var(--text-faint)",
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 200ms ease",
          }}
        />
      </button>

      {/* Dropdown */}
      {open && (
        <div
          className="absolute right-0 top-full mt-2 w-52 rounded-xl overflow-hidden z-[100]"
          style={{
            background: "var(--bg-surface-2)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            border: "1px solid var(--border-default)",
            boxShadow: "0 16px 48px rgba(0,0,0,0.15), 0 4px 16px rgba(124,58,237,0.12)",
          }}
        >
          {/* Header do menu */}
          <div className="px-4 py-3" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
            <p className="text-xs font-black" style={{ color: "var(--text-heading)" }}>Kamila Luedy</p>
            <p className="text-[11px] mt-0.5" style={{ color: "var(--text-muted)" }}>
              kamila.luedy@kmltech.com.br
            </p>
            <span className="inline-flex items-center mt-1.5 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-violet-500/15 text-violet-500">
              Administrador
            </span>
          </div>

          {/* Itens */}
          <div className="p-1.5 flex flex-col gap-0.5">
            <MenuLink href="/perfil" icon={<User size={14} />} label="Editar Perfil" onClick={() => setOpen(false)} />
            <MenuLink href="/configuracoes" icon={<Settings size={14} />} label="Configurações" onClick={() => setOpen(false)} />
          </div>

          {/* Logout */}
          <div className="p-1.5" style={{ borderTop: "1px solid var(--border-subtle)" }}>
            <button
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-rose-500 text-xs font-medium transition-colors"
              style={{ background: "transparent" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(239,68,68,0.08)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              <LogOut size={14} />
              Sair do sistema
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function MenuLink({ href, icon, label, onClick }: {
  href: string; icon: React.ReactNode; label: string; onClick: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors text-left"
      style={{ color: "var(--text-secondary)" }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(124,58,237,0.08)"; (e.currentTarget as HTMLElement).style.color = "#7c3aed"; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "var(--text-secondary)"; }}
    >
      <span className="text-violet-400">{icon}</span>
      {label}
    </Link>
  );
}

