"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Clock, Star, TrendingUp, Activity, Wifi, HardDrive, KeyRound, Bot, AlertTriangle } from "lucide-react";

const HORAS = [
  { h: "08h", v: 3 }, { h: "09h", v: 8 }, { h: "10h", v: 14 },
  { h: "11h", v: 11 }, { h: "12h", v: 5 }, { h: "13h", v: 4 },
  { h: "14h", v: 18 }, { h: "15h", v: 22 }, { h: "16h", v: 16 },
  { h: "17h", v: 9 }, { h: "18h", v: 6 },
];
const MAX_H = Math.max(...HORAS.map((h) => h.v));

const CATEGORIAS = [
  { label: "Rede / Conectividade",   v: 38, icon: <Wifi size={14} />,      color: "#38bdf8" },
  { label: "Hardware / Periféricos", v: 27, icon: <HardDrive size={14} />, color: "#7c3aed" },
  { label: "Acesso / Moodle",        v: 21, icon: <KeyRound size={14} />,  color: "#818cf8" },
  { label: "Automação / Bots",       v: 14, icon: <Bot size={14} />,       color: "#a78bfa" },
];

const RECENTES = [
  { id: "#0047", titulo: "Instabilidade bot Python/Selenium", tipo: "Automação", prior: "Alta",  ago: "2 min"  },
  { id: "#0046", titulo: "Queda na conexão Piso 3 — Switch", tipo: "Rede",      prior: "Alta",  ago: "11 min" },
  { id: "#0045", titulo: "Acesso Moodle colaborador novo",   tipo: "Acesso",    prior: "Média", ago: "28 min" },
  { id: "#0044", titulo: "Impressora HP 2 sem resposta",     tipo: "Hardware",  prior: "Baixa", ago: "41 min" },
];

const PRIOR_COLOR: Record<string, string> = {
  Alta:  "bg-red-500/15 text-red-400 border-red-500/30",
  Média: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
  Baixa: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
};

/* ── KPI Card ── */
function KPI({ icon, label, value, sub, trend, accent }: {
  icon: React.ReactNode; label: string; value: string; sub: string; trend?: string; accent?: string;
}) {
  return (
    <div className="kpi-card p-5 flex flex-col gap-3">
      <div className="flex items-start justify-between">
        <div className="w-9 h-9 rounded-xl bg-violet-600/20 border border-violet-600/30 flex items-center justify-center text-violet-400">
          {icon}
        </div>
        {trend && (
          <span className="flex items-center gap-1 text-emerald-500 text-xs font-semibold">
            <TrendingUp size={12} /> {trend}
          </span>
        )}
      </div>
      <div>
        <p className="text-xs font-medium tracking-wide uppercase" style={{ color: "var(--text-faint)" }}>{label}</p>
        <p className="font-black text-3xl mt-1 leading-none" style={{ color: accent ?? "var(--text-heading)" }}>{value}</p>
        <p className="text-xs mt-1" style={{ color: "var(--text-faint)" }}>{sub}</p>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [today, setToday] = useState("");

  useEffect(() => {
    setToday(new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long" }));
  }, []);

  return (
    <div className="space-y-6">

      {/* ── Status dos chamados ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Abertos",      value: 2,  cor: "#a78bfa" },
          { label: "Em andamento", value: 3,  cor: "#60a5fa" },
          { label: "Resolvidos",   value: 6,  cor: "#34d399" },
          { label: "Críticos",     value: 3,  cor: "#f87171" },
        ].map((s) => (
          <div key={s.label} className="kpi-card px-4 py-3 flex items-center gap-3">
            <span className="font-black text-3xl leading-none" style={{ color: s.cor }}>{s.value}</span>
            <span className="text-xs" style={{ color: "var(--text-muted)" }}>{s.label}</span>
          </div>
        ))}
      </div>

      {/* ── KPIs ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KPI icon={<CheckCircle2 size={18} />} label="Chamados Resolvidos Hoje" value="42"     sub="Meta diária: 50 chamados" trend="+8% vs ontem" accent="var(--kpi-value-color)" />
        <KPI icon={<Clock size={18} />}        label="Tempo Médio de Atendimento" value="14 min" sub="SLA: até 30 min"         trend="-3 min"      accent="#38bdf8" />
        <KPI icon={<Star size={18} />}         label="Satisfação (CSAT)"          value="94.8%" sub="Baseado em 38 avaliações" trend="+1.2%"        accent="var(--kpi-value-color)" />
      </div>

      {/* ── Gráficos ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Gráfico de barras */}
        <div className="glass rounded-xl p-5 col-span-1 lg:col-span-2">
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="font-bold text-sm" style={{ color: "var(--text-white)" }}>Volume de Chamados por Hora</p>
              <p className="text-xs mt-0.5" style={{ color: "var(--text-faint)" }}>
                Hoje — {today}
              </p>
            </div>
            <Activity size={16} className="text-sky-400" />
          </div>

          <div className="flex gap-0">
            {/* Eixo Y */}
            <div className="flex flex-col justify-between items-end pr-2 shrink-0" style={{ height: 176, paddingBottom: 0 }}>
              {[MAX_H, Math.round(MAX_H * 0.75), Math.round(MAX_H * 0.5), Math.round(MAX_H * 0.25), 0].map((v) => (
                <span key={v} className="text-[9px] font-mono leading-none" style={{ color: "var(--text-faint)" }}>{v}</span>
              ))}
            </div>

            {/* Área do gráfico */}
            <div className="flex-1 relative">
              {/* Linhas de grade */}
              {[0, 25, 50, 75, 100].map((pct) => (
                <div key={pct} className="absolute w-full" style={{ top: `${pct}%`, height: 1, background: "var(--chart-grid)", zIndex: 0 }} />
              ))}

              {/* Barras */}
              <div className="flex items-end gap-1.5 relative z-10" style={{ height: 176 }}>
                {HORAS.map((h) => (
                  <div key={h.h} className="flex flex-col items-center gap-1 flex-1 min-w-0" style={{ height: "100%" }}>
                    <div className="flex-1 flex items-end w-full">
                      <div className="bar-col w-full" data-value={h.v} style={{ height: `${(h.v / MAX_H) * 100}%` }} />
                    </div>
                    <span className="text-[10px] font-mono shrink-0" style={{ color: "var(--text-faint)" }}>{h.h}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 mt-4 pt-4" style={{ borderTop: "1px solid var(--border-subtle)" }}>
            <div className="flex items-center gap-1.5 text-xs" style={{ color: "var(--text-muted)" }}>
              <div className="w-3 h-2 rounded-sm bg-gradient-to-r from-violet-700 to-violet-400" />
              Chamados abertos
            </div>
            <p className="text-sky-400 text-xs ml-auto font-semibold">Pico: 15h — 22 chamados</p>
          </div>
        </div>

        {/* Distribuição por categoria */}
        <div className="glass rounded-xl p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="font-bold text-sm" style={{ color: "var(--text-white)" }}>Distribuição</p>
              <p className="text-xs mt-0.5" style={{ color: "var(--text-faint)" }}>Por categoria</p>
            </div>
            <AlertTriangle size={15} className="text-yellow-500" />
          </div>

          <div className="space-y-4">
            {CATEGORIAS.map((c) => (
              <div key={c.label}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2 text-xs" style={{ color: "var(--text-secondary)" }}>
                    <span style={{ color: c.color }}>{c.icon}</span>
                    {c.label}
                  </div>
                  <span className="text-xs font-bold" style={{ color: "var(--text-white)" }}>{c.v}%</span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "var(--border-subtle)" }}>
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${c.v}%`, background: `linear-gradient(90deg, ${c.color}, ${c.color}88)` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 pt-4 flex items-center justify-between" style={{ borderTop: "1px solid var(--border-subtle)" }}>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>Total hoje</p>
            <p className="text-sky-400 font-black text-2xl">107</p>
          </div>
        </div>
      </div>

      {/* ── Chamados Recentes ── */}
      <div className="glass rounded-xl overflow-hidden">
        <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
          <p className="font-bold text-sm" style={{ color: "var(--text-white)" }}>Chamados Recentes</p>
          <span className="text-violet-400 text-xs font-semibold cursor-pointer hover:text-violet-300 transition-colors">
            Ver todos →
          </span>
        </div>
        <div style={{ borderTop: "none" }}>
          {RECENTES.map((r) => (
            <div
              key={r.id}
              className="px-5 py-3.5 flex items-center gap-4 transition-colors cursor-pointer group"
              style={{ borderBottom: "1px solid var(--border-subtle)" }}
            >
              <span className="text-sky-500 font-mono text-xs shrink-0 font-semibold">{r.id}</span>
              <p className="text-sm flex-1 truncate transition-colors" style={{ color: "var(--text-secondary)" }}>{r.titulo}</p>
              <span className="text-xs shrink-0 hidden sm:block" style={{ color: "var(--text-muted)" }}>{r.tipo}</span>
              <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border shrink-0 ${PRIOR_COLOR[r.prior]}`}>
                {r.prior}
              </span>
              <span className="text-xs shrink-0 hidden md:block" style={{ color: "var(--text-faint)" }}>{r.ago}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
