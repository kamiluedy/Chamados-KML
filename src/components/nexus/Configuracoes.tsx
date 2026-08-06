"use client";

import { useState } from "react";
import {
  Building2, Clock, Bell, Info, Save, RotateCcw,
  CheckCircle2, AlertTriangle, Volume2, VolumeX, Eye, EyeOff,
  Zap, Terminal,
} from "lucide-react";
import { useConfig, type ConfigStore } from "@/lib/config-store";

const SLA_LABELS: Record<string, { label: string; color: string }> = {
  critica: { label: "Crítica",  color: "#f43f5e" },
  alta:    { label: "Alta",     color: "#ef4444" },
  media:   { label: "Média",    color: "#f59e0b" },
  baixa:   { label: "Baixa",    color: "#10b981" },
};

function minToDisplay(min: number): string {
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m > 0 ? `${h}h ${m}min` : `${h}h`;
}

function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="glass rounded-xl overflow-hidden">
      <div
        className="flex items-center gap-3 px-5 py-4"
        style={{ borderBottom: "1px solid var(--border-subtle)", background: "rgba(124,58,237,0.03)" }}
      >
        <span className="text-violet-400">{icon}</span>
        <h3 className="font-black text-sm tracking-tight" style={{ color: "var(--text-heading)" }}>{title}</h3>
      </div>
      <div className="px-5 py-5 space-y-4">{children}</div>
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-[11px] font-semibold uppercase tracking-wide block mb-1.5" style={{ color: "var(--text-muted)" }}>
        {label}
      </label>
      {children}
      {hint && <p className="text-[11px] mt-1" style={{ color: "var(--text-faint)" }}>{hint}</p>}
    </div>
  );
}

function Toggle({ value, onChange, labelOn, labelOff, icon }: {
  value: boolean;
  onChange: (v: boolean) => void;
  labelOn: string;
  labelOff: string;
  icon: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      className="flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-all text-left"
      style={{
        border: `1px solid ${value ? "rgba(124,58,237,0.35)" : "var(--border-subtle)"}`,
        background: value ? "rgba(124,58,237,0.07)" : "transparent",
      }}
    >
      <span style={{ color: value ? "#a78bfa" : "var(--text-faint)" }}>{icon}</span>
      <span className="flex-1 text-xs font-medium" style={{ color: value ? "var(--text-heading)" : "var(--text-muted)" }}>
        {value ? labelOn : labelOff}
      </span>
      <div
        className="w-9 h-5 rounded-full relative transition-all shrink-0"
        style={{ background: value ? "#7c3aed" : "var(--border-default)" }}
      >
        <div
          className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all"
          style={{ left: value ? "calc(100% - 18px)" : "2px", boxShadow: "0 1px 3px rgba(0,0,0,0.25)" }}
        />
      </div>
    </button>
  );
}

export default function Configuracoes() {
  const { config, save, reset } = useConfig();

  // Local draft — só salva ao clicar em Salvar
  const [draft, setDraft] = useState<ConfigStore>({ ...config });
  const [saved, setSaved] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  function patch<K extends keyof ConfigStore>(k: K, v: ConfigStore[K]) {
    setDraft((p) => ({ ...p, [k]: v }));
  }

  function patchSla(k: keyof ConfigStore["sla"], v: number) {
    setDraft((p) => ({ ...p, sla: { ...p.sla, [k]: v } }));
  }

  function handleSave() {
    save(draft);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  function handleReset() {
    if (!confirmReset) { setConfirmReset(true); setTimeout(() => setConfirmReset(false), 3000); return; }
    reset();
    setDraft({ ...config });
    setConfirmReset(false);
  }

  return (
    <div className="max-w-2xl mx-auto space-y-5">

      {/* Cabeçalho */}
      <div className="flex items-start justify-between flex-wrap gap-3 mb-2">
        <div>
          <h2 className="font-black text-lg tracking-tight" style={{ color: "var(--text-heading)" }}>
            Configurações Gerais
          </h2>
          <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
            Personalize o sistema — as alterações ficam salvas no seu navegador.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all"
            style={{
              border: `1px solid ${confirmReset ? "rgba(239,68,68,0.4)" : "var(--border-subtle)"}`,
              color: confirmReset ? "#ef4444" : "var(--text-muted)",
              background: confirmReset ? "rgba(239,68,68,0.06)" : "transparent",
            }}
          >
            <RotateCcw size={13} />
            {confirmReset ? "Confirmar reset" : "Restaurar padrões"}
          </button>
          <button onClick={handleSave} className="flex items-center gap-1.5 btn-neon px-4 py-2 text-xs">
            {saved ? <CheckCircle2 size={13} /> : <Save size={13} />}
            {saved ? "Salvo!" : "Salvar"}
          </button>
        </div>
      </div>

      {/* Feedback salvo */}
      {saved && (
        <div className="flex items-center gap-2 text-xs text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-4 py-2.5">
          <CheckCircle2 size={14} /> Configurações salvas com sucesso.
        </div>
      )}

      {/* ── Identidade da empresa ── */}
      <Section icon={<Building2 size={16} />} title="Identidade da Empresa">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Nome da Empresa" hint="Exibido no rodapé e na barra de status">
            <input
              className="nexus-input"
              value={draft.empresa}
              onChange={(e) => patch("empresa", e.target.value)}
              placeholder="Ex: KML DESK"
            />
          </Field>
          <Field label="Área / Slogan" hint="Subtítulo exibido ao lado da versão">
            <input
              className="nexus-input"
              value={draft.slogan}
              onChange={(e) => patch("slogan", e.target.value)}
              placeholder="Ex: TI & Dados"
            />
          </Field>
        </div>

        {/* Preview */}
        <div className="rounded-xl px-4 py-3 flex items-center justify-between flex-wrap gap-2" style={{ background: "var(--preview-bg)", border: "1px solid var(--border-subtle)" }}>
          <span className="text-[11px]" style={{ color: "var(--text-faint)" }}>Preview do rodapé:</span>
          <div className="flex items-center gap-4 text-[11px] flex-wrap" style={{ color: "var(--text-faint)" }}>
            <span className="neon-text font-black tracking-widest">KML DESK</span>
            <span>v1.0.0 · Feito por Kamila Luedy · {draft.slogan || "—"}</span>
            <span>Next.js + Tailwind CSS</span>
          </div>
        </div>
      </Section>

      {/* ── Turno de trabalho ── */}
      <Section icon={<Clock size={16} />} title="Turno de Trabalho">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Field label="Nome do Analista" hint="Exibido na barra de status">
            <input
              className="nexus-input"
              value={draft.analistaNome}
              onChange={(e) => patch("analistaNome", e.target.value)}
              placeholder="Ex: Kamila L."
            />
          </Field>
          <Field label="Início do Turno">
            <input
              className="nexus-input"
              type="time"
              value={draft.turnoInicio}
              onChange={(e) => patch("turnoInicio", e.target.value)}
            />
          </Field>
          <Field label="Fim do Turno">
            <input
              className="nexus-input"
              type="time"
              value={draft.turnoFim}
              onChange={(e) => patch("turnoFim", e.target.value)}
            />
          </Field>
        </div>

        {/* Preview barra de status */}
        <div className="rounded-xl px-4 py-2.5 flex items-center gap-4 flex-wrap text-[11px]" style={{ background: "var(--preview-bg)", border: "1px solid var(--border-subtle)" }}>
          <span style={{ color: "var(--text-faint)" }}>Preview:</span>
          <span style={{ color: "var(--text-faint)" }}>
            Turno: <span style={{ color: "var(--text-secondary)" }}>
              {draft.turnoInicio || "08:00"}h – {draft.turnoFim || "18:00"}h
            </span>
          </span>
          <span style={{ color: "var(--text-faint)" }}>
            Analista: <span className="text-violet-500 font-semibold">{draft.analistaNome || "—"}</span>
          </span>
        </div>
      </Section>

      {/* ── SLA ── */}
      <Section icon={<Zap size={16} />} title="SLA — Tempos de Resposta">
        <p className="text-xs" style={{ color: "var(--text-faint)" }}>
          Define quantos minutos cada nível de urgência tem para primeira resposta. Exibido no formulário de chamados.
        </p>
        <div className="space-y-3">
          {(["critica", "alta", "media", "baixa"] as const).map((k) => {
            const { label, color } = SLA_LABELS[k];
            const val = draft.sla[k];
            return (
              <div key={k} className="flex items-center gap-4">
                <div
                  className="text-[11px] font-bold px-2.5 py-1 rounded-full shrink-0 w-16 text-center"
                  style={{ background: `${color}15`, color, border: `1px solid ${color}30` }}
                >
                  {label}
                </div>
                <input
                  type="range"
                  min={5} max={k === "baixa" ? 1440 : k === "media" ? 480 : 120}
                  step={k === "baixa" || k === "media" ? 15 : 5}
                  value={val}
                  onChange={(e) => patchSla(k, Number(e.target.value))}
                  className="flex-1 accent-violet-500"
                />
                <div
                  className="text-xs font-mono font-semibold shrink-0 w-20 text-right"
                  style={{ color }}
                >
                  {minToDisplay(val)}
                </div>
              </div>
            );
          })}
        </div>
        <div className="rounded-xl px-4 py-3 grid grid-cols-2 sm:grid-cols-4 gap-2" style={{ background: "var(--preview-bg)", border: "1px solid var(--border-subtle)" }}>
          {(["critica", "alta", "media", "baixa"] as const).map((k) => (
            <div key={k} className="text-center">
              <p className="text-[10px] font-semibold uppercase" style={{ color: SLA_LABELS[k].color }}>{SLA_LABELS[k].label}</p>
              <p className="text-xs font-mono mt-0.5" style={{ color: "var(--text-secondary)" }}>{minToDisplay(draft.sla[k])}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* ── Notificações ── */}
      <Section icon={<Bell size={16} />} title="Notificações">
        <div className="space-y-2">
          <Toggle
            value={draft.notifVisual}
            onChange={(v) => patch("notifVisual", v)}
            labelOn="Alertas visuais ativos — badge de notificação na navbar"
            labelOff="Alertas visuais desativados"
            icon={draft.notifVisual ? <Eye size={16} /> : <EyeOff size={16} />}
          />
          <Toggle
            value={draft.notifSom}
            onChange={(v) => patch("notifSom", v)}
            labelOn="Alerta sonoro ativo — toca ao receber chamado novo"
            labelOff="Alerta sonoro desativado"
            icon={draft.notifSom ? <Volume2 size={16} /> : <VolumeX size={16} />}
          />
        </div>
        {draft.notifSom && (
          <div className="flex items-start gap-2 text-xs rounded-lg px-3 py-2.5" style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)", color: "#f59e0b" }}>
            <AlertTriangle size={13} className="shrink-0 mt-0.5" />
            O navegador pode pedir permissão de áudio na primeira vez que um chamado chegar.
          </div>
        )}
      </Section>

      {/* ── Sobre ── */}
      <Section icon={<Info size={16} />} title="Sobre o Sistema">
        <div className="flex items-center gap-4">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: "rgba(124,58,237,0.15)", border: "1px solid rgba(124,58,237,0.3)" }}
          >
            <Terminal size={22} className="text-violet-400" />
          </div>
          <div>
            <p className="font-black text-sm" style={{ color: "var(--text-heading)" }}>KML DESK</p>
            <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>Sistema interno de gestão de chamados de TI</p>
          </div>
          <span className="ml-auto text-xs font-mono px-2 py-0.5 rounded-full" style={{ background: "rgba(124,58,237,0.12)", color: "#a78bfa", border: "1px solid rgba(124,58,237,0.25)" }}>
            v1.0.0
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          {[
            ["Framework",    "Next.js 16 + App Router"],
            ["UI",           "Tailwind CSS v4"],
            ["Linguagem",    "TypeScript"],
            ["Ícones",       "Lucide React"],
            ["Instância",    draft.empresa || "—"],
            ["Ambiente",     "Frontend-only (SPA)"],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between gap-2 px-3 py-2 rounded-lg" style={{ background: "var(--preview-bg)", border: "1px solid var(--border-subtle)" }}>
              <span style={{ color: "var(--text-secondary)" }}>{k}</span>
              <span className="font-medium" style={{ color: "var(--text-secondary)" }}>{v}</span>
            </div>
          ))}
        </div>
      </Section>

      {/* Botão salvar inferior */}
      <div className="flex justify-end gap-2 pt-2 pb-6">
        <button
          onClick={handleReset}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all"
          style={{
            border: `1px solid ${confirmReset ? "rgba(239,68,68,0.4)" : "var(--border-subtle)"}`,
            color: confirmReset ? "#ef4444" : "var(--text-muted)",
            background: confirmReset ? "rgba(239,68,68,0.06)" : "transparent",
          }}
        >
          <RotateCcw size={13} />
          {confirmReset ? "Confirmar reset" : "Restaurar padrões"}
        </button>
        <button onClick={handleSave} className="flex items-center gap-1.5 btn-neon px-5 py-2.5 text-sm">
          {saved ? <CheckCircle2 size={14} /> : <Save size={14} />}
          {saved ? "Salvo!" : "Salvar configurações"}
        </button>
      </div>
    </div>
  );
}
