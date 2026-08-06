"use client";

import { useState } from "react";
import {
  ShieldCheck, ShieldAlert, Lock, Eye, EyeOff,
  LogIn, UserX, KeyRound, AlertTriangle, CheckCircle2,
  Clock, Monitor, Smartphone, Globe, X, RefreshCw,
} from "lucide-react";

/* ── Dados simulados ── */
const LOGS = [
  { id: 1, tipo: "login",    usuario: "kamila.luedy",  ip: "192.168.1.10", dispositivo: "Chrome · Windows",   quando: "agora",    status: "ok"   },
  { id: 2, tipo: "edicao",   usuario: "kamila.luedy",  ip: "192.168.1.10", dispositivo: "Chrome · Windows",   quando: "3 min",    status: "ok"   },
  { id: 3, tipo: "login",    usuario: "marcos.v",      ip: "192.168.1.22", dispositivo: "Firefox · Windows",  quando: "18 min",   status: "ok"   },
  { id: 4, tipo: "falha",    usuario: "pedro.m",       ip: "192.168.1.45", dispositivo: "Chrome · Windows",   quando: "31 min",   status: "warn" },
  { id: 5, tipo: "falha",    usuario: "pedro.m",       ip: "192.168.1.45", dispositivo: "Chrome · Windows",   quando: "31 min",   status: "warn" },
  { id: 6, tipo: "falha",    usuario: "pedro.m",       ip: "192.168.1.45", dispositivo: "Chrome · Windows",   quando: "32 min",   status: "erro" },
  { id: 7, tipo: "login",    usuario: "fernanda.r",    ip: "192.168.1.18", dispositivo: "Edge · Windows",     quando: "1h 12min", status: "ok"   },
  { id: 8, tipo: "exclusao", usuario: "kamila.luedy",  ip: "192.168.1.10", dispositivo: "Chrome · Windows",   quando: "2h 05min", status: "warn" },
  { id: 9, tipo: "login",    usuario: "ana.c",         ip: "192.168.1.33", dispositivo: "Safari · macOS",     quando: "3h 40min", status: "ok"   },
  { id:10, tipo: "externo",  usuario: "—",             ip: "201.72.48.112",dispositivo: "Bot / Externo",      quando: "4h 22min", status: "erro" },
];

const SESSOES = [
  { usuario: "Kamila Luedy",    login: "kamila.luedy", avatar: "KL", ip: "192.168.1.10", dispositivo: "Chrome 124 · Windows 11", inicio: "08:02", atual: true  },
  { usuario: "Marcos Vinicius", login: "marcos.v",     avatar: "MV", ip: "192.168.1.22", dispositivo: "Firefox 125 · Windows 10",inicio: "08:47", atual: false },
  { usuario: "Fernanda Reis",   login: "fernanda.r",   avatar: "FR", ip: "192.168.1.18", dispositivo: "Edge 124 · Windows 11",   inicio: "09:15", atual: false },
];

const POLITICA = {
  senhaMinCaracteres: 8,
  expiracaoDias: 90,
  tentativasMax: 3,
  bloqueioMin: 15,
  autenticacaoDupla: false,
};

const LOG_META: Record<string, { label: string; icon: React.ReactNode; cor: string }> = {
  login:    { label: "Login",              icon: <LogIn size={13} />,     cor: "#10b981" },
  edicao:   { label: "Edição",             icon: <KeyRound size={13} />,  cor: "#7c3aed" },
  exclusao: { label: "Exclusão",           icon: <UserX size={13} />,     cor: "#f59e0b" },
  falha:    { label: "Tentativa falha",    icon: <AlertTriangle size={13}/>, cor: "#f59e0b" },
  externo:  { label: "Acesso externo",     icon: <Globe size={13} />,     cor: "#ef4444" },
};

const STATUS_COR: Record<string, string> = {
  ok:   "bg-emerald-500/10 text-emerald-500 border-emerald-500/25",
  warn: "bg-yellow-500/10  text-yellow-400  border-yellow-500/25",
  erro: "bg-rose-500/10    text-rose-400    border-rose-500/25",
};

function StatCard({ icon, label, value, sub, cor }: {
  icon: React.ReactNode; label: string; value: string | number; sub: string; cor: string;
}) {
  return (
    <div className="kpi-card p-4 flex items-center gap-4">
      <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${cor}15`, border: `1px solid ${cor}30`, color: cor }}>
        {icon}
      </div>
      <div>
        <p className="text-xs font-medium uppercase tracking-wide" style={{ color: "var(--text-faint)" }}>{label}</p>
        <p className="font-black text-2xl leading-none mt-0.5" style={{ color: cor }}>{value}</p>
        <p className="text-[11px] mt-0.5" style={{ color: "var(--text-faint)" }}>{sub}</p>
      </div>
    </div>
  );
}

export default function Seguranca() {
  const [mostrarPolitica, setMostrarPolitica] = useState(false);
  const [politica, setPolitica] = useState(POLITICA);
  const [salvandoPolitica, setSalvandoPolitica] = useState(false);
  const [politicaSalva, setPoliticaSalva]  = useState(false);
  const [sessoes, setSessoes]         = useState(SESSOES);
  const [confirmarIp, setConfirmarIp] = useState<string | null>(null);
  const [filtroLog, setFiltroLog]     = useState<string>("todos");

  const logsEfeitos = filtroLog === "todos" ? LOGS : LOGS.filter((l) => l.tipo === filtroLog);
  const alertasAtivos = LOGS.filter((l) => l.status === "erro").length;
  const tentativasFalhas = LOGS.filter((l) => l.tipo === "falha").length;

  function revogarSessao(ip: string) {
    setSessoes((prev) => prev.filter((s) => s.ip !== ip || s.atual));
  }

  async function salvarPolitica() {
    setSalvandoPolitica(true);
    await new Promise((r) => setTimeout(r, 900));
    setSalvandoPolitica(false);
    setPoliticaSalva(true);
    setTimeout(() => setPoliticaSalva(false), 2500);
  }

  return (
    <div className="space-y-6">

      {/* Cabeçalho */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h2 className="font-black text-lg tracking-tight" style={{ color: "var(--text-heading)" }}>
            Segurança
          </h2>
          <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
            Auditoria de acessos, sessões ativas e política de segurança
          </p>
        </div>
        {alertasAtivos > 0 && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold" style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)", color: "#f87171" }}>
            <ShieldAlert size={14} />
            {alertasAtivos} alerta{alertasAtivos > 1 ? "s" : ""} de segurança
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<ShieldCheck size={18} />} label="Status"              value="Normal"              sub="Sem incidentes críticos"     cor="#10b981" />
        <StatCard icon={<LogIn size={18} />}       label="Logins hoje"         value={LOGS.filter(l=>l.tipo==="login").length} sub="Sessões autenticadas" cor="#7c3aed" />
        <StatCard icon={<AlertTriangle size={18}/>} label="Tentativas falhas"  value={tentativasFalhas}    sub="Nas últimas 6 horas"          cor="#f59e0b" />
        <StatCard icon={<Globe size={18} />}        label="Acessos externos"   value={LOGS.filter(l=>l.tipo==="externo").length} sub="IPs fora da rede"  cor="#ef4444" />
      </div>

      {/* Sessões ativas + Política */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Sessões ativas */}
        <div className="glass rounded-xl overflow-hidden">
          <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
            <div>
              <p className="font-bold text-sm" style={{ color: "var(--text-heading)" }}>Sessões Ativas</p>
              <p className="text-xs mt-0.5" style={{ color: "var(--text-faint)" }}>{sessoes.length} usuário{sessoes.length !== 1 ? "s" : ""} conectado{sessoes.length !== 1 ? "s" : ""}</p>
            </div>
            <Monitor size={15} style={{ color: "var(--text-faint)" }} />
          </div>
          <div>
            {sessoes.map((s, i) => (
              <div
                key={s.ip}
                className="flex items-center gap-3 px-5 py-3.5"
                style={{ borderBottom: i < sessoes.length - 1 ? "1px solid var(--border-subtle)" : "none" }}
              >
                <div className="relative shrink-0">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black text-white" style={{ background: "linear-gradient(135deg,#7c3aed,#6d28d9)" }}>
                    {s.avatar}
                  </div>
                  {s.atual && <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full online-dot" style={{ border: "2px solid var(--avatar-border)" }} />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-semibold leading-none" style={{ color: "var(--text-heading)" }}>{s.usuario}</p>
                    {s.atual && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-500">VOCÊ</span>}
                  </div>
                  <p className="text-[10px] mt-0.5" style={{ color: "var(--text-faint)" }}>{s.dispositivo}</p>
                  <p className="text-[10px]" style={{ color: "var(--text-faint)" }}>
                    <span className="font-mono">{s.ip}</span> · desde {s.inicio}
                  </p>
                </div>
                {!s.atual && (
                  <button
                    onClick={() => setConfirmarIp(s.ip)}
                    title="Revogar sessão"
                    className="p-1.5 rounded-lg transition-all shrink-0"
                    style={{ color: "var(--text-faint)" }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "#ef4444"; (e.currentTarget as HTMLElement).style.background = "rgba(239,68,68,0.08)"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "var(--text-faint)"; (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Política de segurança */}
        <div className="glass rounded-xl overflow-hidden">
          <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
            <div>
              <p className="font-bold text-sm" style={{ color: "var(--text-heading)" }}>Política de Acesso</p>
              <p className="text-xs mt-0.5" style={{ color: "var(--text-faint)" }}>Regras de senha e autenticação</p>
            </div>
            <button
              onClick={() => setMostrarPolitica(!mostrarPolitica)}
              className="text-xs font-semibold transition-colors"
              style={{ color: mostrarPolitica ? "#a78bfa" : "var(--text-faint)" }}
            >
              {mostrarPolitica ? "Ocultar" : "Editar"}
            </button>
          </div>

          <div className="px-5 py-4 space-y-3">
            {/* Visualização ou edição */}
            {!mostrarPolitica ? (
              <>
                {[
                  { label: "Mínimo de caracteres",      value: `${politica.senhaMinCaracteres} caracteres`        },
                  { label: "Expiração de senha",        value: `A cada ${politica.expiracaoDias} dias`            },
                  { label: "Tentativas antes do bloqueio", value: `${politica.tentativasMax} tentativas`          },
                  { label: "Tempo de bloqueio",         value: `${politica.bloqueioMin} minutos`                  },
                  { label: "Autenticação em 2 fatores", value: politica.autenticacaoDupla ? "Ativada" : "Desativada" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between py-1.5" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                    <span className="text-xs" style={{ color: "var(--text-muted)" }}>{item.label}</span>
                    <span className="text-xs font-semibold" style={{ color: "var(--text-heading)" }}>{item.value}</span>
                  </div>
                ))}
              </>
            ) : (
              <div className="space-y-3">
                {[
                  { label: "Mín. de caracteres",     key: "senhaMinCaracteres", min: 6,  max: 32  },
                  { label: "Expiração (dias)",        key: "expiracaoDias",      min: 30, max: 365 },
                  { label: "Tentativas antes bloqueio", key: "tentativasMax",   min: 1,  max: 10  },
                  { label: "Bloqueio (minutos)",      key: "bloqueioMin",        min: 5,  max: 60  },
                ].map((f) => (
                  <div key={f.key}>
                    <div className="flex justify-between mb-1">
                      <label className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>{f.label}</label>
                      <span className="text-xs font-mono font-semibold" style={{ color: "#a78bfa" }}>{politica[f.key as keyof typeof politica]}</span>
                    </div>
                    <input
                      type="range" min={f.min} max={f.max}
                      value={politica[f.key as keyof typeof politica] as number}
                      onChange={(e) => setPolitica((p) => ({ ...p, [f.key]: Number(e.target.value) }))}
                      className="w-full accent-violet-500"
                    />
                  </div>
                ))}
                <button
                  onClick={() => setPolitica((p) => ({ ...p, autenticacaoDupla: !p.autenticacaoDupla }))}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all"
                  style={{
                    border: `1px solid ${politica.autenticacaoDupla ? "rgba(124,58,237,0.35)" : "var(--border-subtle)"}`,
                    background: politica.autenticacaoDupla ? "rgba(124,58,237,0.07)" : "transparent",
                  }}
                >
                  <div className="flex items-center gap-2 text-xs font-medium" style={{ color: "var(--text-secondary)" }}>
                    <Smartphone size={13} className="text-violet-400" />
                    Autenticação em 2 fatores
                  </div>
                  <div className="w-8 h-4 rounded-full relative" style={{ background: politica.autenticacaoDupla ? "#7c3aed" : "var(--border-default)" }}>
                    <div className="absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all" style={{ left: politica.autenticacaoDupla ? "calc(100% - 14px)" : "2px" }} />
                  </div>
                </button>
                <button onClick={salvarPolitica} disabled={salvandoPolitica} className="w-full btn-neon py-2 text-xs flex items-center justify-center gap-1.5">
                  {politicaSalva ? <><CheckCircle2 size={13} /> Salvo!</> : salvandoPolitica ? <><RefreshCw size={13} className="animate-spin" /> Salvando...</> : <><Lock size={13} /> Salvar política</>}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Log de auditoria */}
      <div className="glass rounded-xl overflow-hidden">
        <div className="px-5 py-4 flex items-center justify-between flex-wrap gap-3" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
          <div>
            <p className="font-bold text-sm" style={{ color: "var(--text-heading)" }}>Log de Auditoria</p>
            <p className="text-xs mt-0.5" style={{ color: "var(--text-faint)" }}>Últimas atividades do sistema</p>
          </div>
          {/* Filtro por tipo */}
          <div className="flex items-center gap-1 flex-wrap">
            {["todos", "login", "falha", "edicao", "exclusao", "externo"].map((t) => (
              <button
                key={t}
                onClick={() => setFiltroLog(t)}
                className="px-2.5 py-1 rounded-lg text-[10px] font-semibold uppercase tracking-wide transition-all"
                style={{
                  background: filtroLog === t ? "rgba(124,58,237,0.15)" : "transparent",
                  color: filtroLog === t ? "#a78bfa" : "var(--text-faint)",
                  border: filtroLog === t ? "1px solid rgba(124,58,237,0.3)" : "1px solid transparent",
                }}
              >
                {t === "todos" ? "Todos" : LOG_META[t]?.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          {logsEfeitos.map((log, i) => {
            const meta = LOG_META[log.tipo];
            return (
              <div
                key={log.id}
                className="flex items-center gap-3 px-5 py-3 transition-colors"
                style={{ borderBottom: i < logsEfeitos.length - 1 ? "1px solid var(--border-subtle)" : "none" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(124,58,237,0.03)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                {/* Ícone do tipo */}
                <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${meta?.cor}15`, color: meta?.cor, border: `1px solid ${meta?.cor}25` }}>
                  {meta?.icon}
                </div>

                {/* Descrição */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-semibold font-mono" style={{ color: "var(--text-heading)" }}>{log.usuario}</span>
                    <span className="text-xs" style={{ color: "var(--text-muted)" }}>{meta?.label.toLowerCase()}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    <span className="text-[10px] font-mono" style={{ color: "var(--text-faint)" }}>{log.ip}</span>
                    <span className="text-[10px]" style={{ color: "var(--text-faint)" }}>·</span>
                    <span className="text-[10px]" style={{ color: "var(--text-faint)" }}>{log.dispositivo}</span>
                  </div>
                </div>

                {/* Status */}
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border shrink-0 ${STATUS_COR[log.status]}`}>
                  {log.status === "ok" ? "OK" : log.status === "warn" ? "Aviso" : "Alerta"}
                </span>

                {/* Tempo */}
                <div className="flex items-center gap-1 text-[10px] shrink-0 hidden sm:flex" style={{ color: "var(--text-faint)" }}>
                  <Clock size={10} />
                  {log.quando}
                </div>
              </div>
            );
          })}
        </div>

        {/* Rodapé do log */}
        <div className="px-5 py-3 flex items-center justify-between" style={{ borderTop: "1px solid var(--border-subtle)", background: "var(--preview-bg)" }}>
          <span className="text-[11px]" style={{ color: "var(--text-secondary)" }}>
            Exibindo {logsEfeitos.length} de {LOGS.length} registros
          </span>
          <button className="text-[11px] font-semibold transition-colors" style={{ color: "var(--text-secondary)" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#a78bfa")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-secondary)")}
          >
            Ver histórico completo →
          </button>
        </div>
      </div>

      {/* Modal de confirmação de revogação */}
      {confirmarIp && (() => {
        const sessao = sessoes.find((s) => s.ip === confirmarIp);
        if (!sessao) return null;
        return (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center"
            style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)" }}
            onClick={() => setConfirmarIp(null)}
          >
            <div
              className="rounded-2xl p-6 flex flex-col gap-4 w-full max-w-sm mx-4"
              style={{ background: "var(--bg-dropdown)", border: "1px solid var(--border-default)", boxShadow: "0 24px 60px rgba(0,0,0,0.35)" }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Ícone */}
              <div className="flex justify-center">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.25)" }}>
                  <UserX size={22} style={{ color: "#f87171" }} />
                </div>
              </div>

              {/* Texto */}
              <div className="text-center">
                <p className="font-bold text-sm mb-1" style={{ color: "var(--text-heading)" }}>
                  Desconectar sessão?
                </p>
                <p className="text-xs leading-relaxed" style={{ color: "var(--text-muted)" }}>
                  Tem certeza que quer desconectar <strong style={{ color: "var(--text-heading)" }}>{sessao.usuario}</strong>?<br />
                  A sessão em <span className="font-mono">{sessao.dispositivo}</span> será encerrada imediatamente.
                </p>
              </div>

              {/* Ações */}
              <div className="flex gap-2 mt-1">
                <button
                  onClick={() => setConfirmarIp(null)}
                  className="flex-1 py-2 rounded-xl text-xs font-semibold transition-all"
                  style={{ border: "1px solid var(--border-default)", color: "var(--text-muted)" }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "var(--bg-statusbar)")}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "transparent")}
                >
                  Cancelar
                </button>
                <button
                  onClick={() => { revogarSessao(confirmarIp); setConfirmarIp(null); }}
                  className="flex-1 py-2 rounded-xl text-xs font-bold transition-all"
                  style={{ background: "rgba(239,68,68,0.15)", color: "#f87171", border: "1px solid rgba(239,68,68,0.3)" }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "rgba(239,68,68,0.28)")}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "rgba(239,68,68,0.15)")}
                >
                  Sim, desconectar
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
