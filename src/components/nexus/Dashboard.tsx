"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Clock, Star, TrendingUp, Activity, Tag, AlertTriangle } from "lucide-react";
import { useChamados } from "@/lib/chamados-store";

const CAT_COLOR = ["#38bdf8", "#7c3aed", "#818cf8", "#a78bfa", "#34d399", "#f59e0b"];

const PRIOR_COLOR: Record<string, string> = {
  "Crítica": "bg-rose-500/15 text-rose-400 border-rose-500/30",
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
  const { chamados } = useChamados();
  const [today, setToday] = useState("");

  useEffect(() => {
    setToday(new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long" }));
  }, []);

  const abertos      = chamados.filter((c) => c.status === "todo").length;
  const emAndamento  = chamados.filter((c) => c.status === "doing" || c.status === "aguardando").length;
  const resolvidos   = chamados.filter((c) => c.status === "done").length;
  const criticos     = chamados.filter((c) => c.prioridade === "Crítica" || c.prioridade === "Alta").length;

  const categoriaCount = new Map<string, number>();
  chamados.forEach((c) => categoriaCount.set(c.categoria, (categoriaCount.get(c.categoria) ?? 0) + 1));
  const totalCategorias = chamados.length || 1;
  const distribuicao = [...categoriaCount.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([label, count], i) => ({
      label,
      pct: Math.round((count / totalCategorias) * 100),
      count,
      color: CAT_COLOR[i % CAT_COLOR.length],
    }));

  const recentes = chamados.slice(0, 5);

  return (
    <div className="space-y-6">

      {/* ── Status dos chamados ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Abertos",      value: abertos,     cor: "#a78bfa" },
          { label: "Em andamento", value: emAndamento, cor: "#60a5fa" },
          { label: "Resolvidos",   value: resolvidos,  cor: "#34d399" },
          { label: "Prioridade Alta/Crítica", value: criticos, cor: "#f87171" },
        ].map((s) => (
          <div key={s.label} className="kpi-card px-4 py-3 flex items-center gap-3">
            <span className="font-black text-3xl leading-none" style={{ color: s.cor }}>{s.value}</span>
            <span className="text-xs" style={{ color: "var(--text-muted)" }}>{s.label}</span>
          </div>
        ))}
      </div>

      {/* ── KPIs ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KPI icon={<CheckCircle2 size={18} />} label="Chamados Resolvidos" value={String(resolvidos)} sub={`de ${chamados.length} chamados no total`} accent="var(--kpi-value-color)" />
        <KPI icon={<Clock size={18} />}        label="Chamados em Aberto" value={String(abertos + emAndamento)} sub="Aguardando atendimento ou em progresso" accent="#38bdf8" />
        <KPI icon={<Star size={18} />}         label="Taxa de Resolução"  value={`${Math.round((resolvidos / totalCategorias) * 100)}%`} sub="Do total de chamados registrados" accent="var(--kpi-value-color)" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Distribuição por categoria */}
        <div className="glass rounded-xl p-5 col-span-1 lg:col-span-2">
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="font-bold text-sm" style={{ color: "var(--text-white)" }}>Distribuição por Categoria</p>
              <p className="text-xs mt-0.5" style={{ color: "var(--text-faint)" }} suppressHydrationWarning>
                Hoje — {today}
              </p>
            </div>
            <Activity size={16} className="text-sky-400" />
          </div>

          <div className="space-y-4">
            {distribuicao.length === 0 && (
              <p className="text-xs" style={{ color: "var(--text-faint)" }}>Nenhum chamado registrado ainda.</p>
            )}
            {distribuicao.map((c) => (
              <div key={c.label}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2 text-xs" style={{ color: "var(--text-secondary)" }}>
                    <Tag size={12} style={{ color: c.color }} />
                    {c.label}
                  </div>
                  <span className="text-xs font-bold" style={{ color: "var(--text-white)" }}>{c.count} ({c.pct}%)</span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "var(--border-subtle)" }}>
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${c.pct}%`, background: `linear-gradient(90deg, ${c.color}, ${c.color}88)` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Resumo por status */}
        <div className="glass rounded-xl p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="font-bold text-sm" style={{ color: "var(--text-white)" }}>Resumo</p>
              <p className="text-xs mt-0.5" style={{ color: "var(--text-faint)" }}>Total de chamados</p>
            </div>
            <AlertTriangle size={15} className="text-yellow-500" />
          </div>

          <div className="mt-1 pt-1 flex items-center justify-between">
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>Total registrado</p>
            <p className="text-sky-400 font-black text-2xl">{chamados.length}</p>
          </div>
        </div>
      </div>

      {/* ── Chamados Recentes ── */}
      <div className="glass rounded-xl overflow-hidden">
        <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
          <p className="font-bold text-sm" style={{ color: "var(--text-white)" }}>Chamados Recentes</p>
        </div>
        <div style={{ borderTop: "none" }}>
          {recentes.length === 0 && (
            <p className="px-5 py-6 text-xs" style={{ color: "var(--text-faint)" }}>Nenhum chamado registrado ainda.</p>
          )}
          {recentes.map((r) => (
            <div
              key={r.id}
              className="px-5 py-3.5 flex items-center gap-4 transition-colors cursor-pointer group"
              style={{ borderBottom: "1px solid var(--border-subtle)" }}
            >
              <span className="text-sky-500 font-mono text-xs shrink-0 font-semibold">{r.id}</span>
              <p className="text-sm flex-1 truncate transition-colors" style={{ color: "var(--text-secondary)" }}>{r.titulo}</p>
              <span className="text-xs shrink-0 hidden sm:block" style={{ color: "var(--text-muted)" }}>{r.categoria}</span>
              <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border shrink-0 ${PRIOR_COLOR[r.prioridade]}`}>
                {r.prioridade}
              </span>
              <span className="text-xs shrink-0 hidden md:block" style={{ color: "var(--text-faint)" }}>{r.dataHora}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
