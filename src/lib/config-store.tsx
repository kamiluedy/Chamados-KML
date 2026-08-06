"use client";

import { createContext, useContext, useState, ReactNode } from "react";

export interface SlaConfig {
  critica: number;
  alta: number;
  media: number;
  baixa: number;
}

export interface ConfigStore {
  empresa: string;
  slogan: string;
  analistaNome: string;
  turnoInicio: string;
  turnoFim: string;
  sla: SlaConfig;
  notifSom: boolean;
  notifVisual: boolean;
}

const DEFAULTS: ConfigStore = {
  empresa:      "KML DESK",
  slogan:       "TI & Dados",
  analistaNome: "Kamila L.",
  turnoInicio:  "08:00",
  turnoFim:     "18:00",
  sla: { critica: 15, alta: 30, media: 120, baixa: 480 },
  notifSom:     false,
  notifVisual:  true,
};

const KEY = "nexus-config";

interface Ctx {
  config: ConfigStore;
  save: (patch: Partial<ConfigStore>) => void;
  reset: () => void;
}

const ConfigCtx = createContext<Ctx | null>(null);

export function ConfigProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<ConfigStore>(() => {
    if (typeof window === "undefined") return DEFAULTS;
    try {
      const raw = localStorage.getItem(KEY);
      return raw ? { ...DEFAULTS, ...JSON.parse(raw) } : DEFAULTS;
    } catch {
      return DEFAULTS;
    }
  });

  function save(patch: Partial<ConfigStore>) {
    setConfig((prev) => {
      const next = { ...prev, ...patch };
      localStorage.setItem(KEY, JSON.stringify(next));
      return next;
    });
  }

  function reset() {
    localStorage.removeItem(KEY);
    setConfig(DEFAULTS);
  }

  return <ConfigCtx.Provider value={{ config, save, reset }}>{children}</ConfigCtx.Provider>;
}

export function useConfig() {
  const ctx = useContext(ConfigCtx);
  if (!ctx) throw new Error("useConfig must be inside ConfigProvider");
  return ctx;
}

export function slaLabel(config: ConfigStore, urgencia: string): string {
  const min = config.sla[urgencia as keyof SlaConfig];
  if (!min) return "";
  if (min < 60) return `Resposta em até ${min} min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m > 0 ? `Resposta em até ${h}h${m}min` : `Resposta em até ${h}h`;
}
