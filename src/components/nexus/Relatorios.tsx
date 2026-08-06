"use client";

import { useState, useRef, useEffect } from "react";
import {
  Download, Search, Filter, ChevronUp, ChevronDown, X,
  ChevronsUpDown, CheckCircle2, AlertCircle, Clock,
  CircleDot, Circle, FileText, FileSpreadsheet, Braces,
} from "lucide-react";
import { useChamados, STATUS_LABEL_RELATORIO, type Prioridade as Urgencia } from "@/lib/chamados-store";

/* ── Tipos ── */
type Status = "Aberto" | "Em andamento" | "Resolvido" | "Fechado";

interface ChamadoRelatorio {
  id: string;
  titulo: string;
  solicitante: string;
  setor: string;
  categoria: string;
  grupo: string;
  urgencia: Urgencia;
  status: Status;
  abertura: string;
  tma: string | null;
}

/* ── Helpers visuais ── */
const URGENCIA_STYLE: Record<Urgencia, string> = {
  "Crítica": "bg-rose-500/15 text-rose-400 border-rose-500/30",
  "Alta":    "bg-orange-500/15 text-orange-400 border-orange-500/30",
  "Média":   "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
  "Baixa":   "bg-sky-500/15 text-sky-400 border-sky-500/30",
};

const STATUS_STYLE: Record<Status, string> = {
  "Aberto":       "bg-violet-500/15 text-violet-400 border-violet-500/30",
  "Em andamento": "bg-blue-500/15 text-blue-400 border-blue-500/30",
  "Resolvido":    "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  "Fechado":      "bg-zinc-500/15 text-zinc-400 border-zinc-500/30",
};

const STATUS_ICON: Record<Status, React.ReactNode> = {
  "Aberto":       <Circle size={11} />,
  "Em andamento": <CircleDot size={11} />,
  "Resolvido":    <CheckCircle2 size={11} />,
  "Fechado":      <AlertCircle size={11} />,
};

type SortKey = keyof ChamadoRelatorio;
type SortDir = "asc" | "desc";

const TODAS_URGENCIAS: Urgencia[] = ["Crítica", "Alta", "Média", "Baixa"];
const TODOS_STATUS: Status[]      = ["Aberto", "Em andamento", "Resolvido", "Fechado"];

export default function Relatorios() {
  const { chamados } = useChamados();
  const CHAMADOS: ChamadoRelatorio[] = chamados.map((c) => ({
    id: c.id,
    titulo: c.titulo,
    solicitante: c.solicitante,
    setor: c.setor,
    categoria: c.categoria,
    grupo: c.grupoCategoria,
    urgencia: c.prioridade,
    status: STATUS_LABEL_RELATORIO[c.status] as Status,
    abertura: c.dataHora,
    tma: null,
  }));
  const TODOS_SETORES    = [...new Set(CHAMADOS.map((c) => c.setor))].sort();
  const TODOS_GRUPOS     = [...new Set(CHAMADOS.map((c) => c.grupo))].sort();
  const TODAS_CATEGORIAS = [...new Set(CHAMADOS.map((c) => c.categoria))].sort();

  const [busca, setBusca]               = useState("");
  const [urgFiltro, setUrgFiltro]       = useState<Urgencia | "">("");
  const [statusFiltro, setStatusFiltro] = useState<Status | "">("");
  const [setorFiltro, setSetorFiltro]   = useState("");
  const [grupoFiltro, setGrupoFiltro]   = useState("");
  const [catFiltro, setCatFiltro]       = useState("");
  const [sortKey, setSortKey]           = useState<SortKey>("abertura");
  const [sortDir, setSortDir]           = useState<SortDir>("desc");
  const [exportMenu, setExportMenu]     = useState(false);
  const [filtroAberto, setFiltroAberto] = useState(false);
  const filtroRef                     = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (filtroRef.current && !filtroRef.current.contains(e.target as Node)) setFiltroAberto(false);
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);
  const [exportando, setExportando]   = useState<string | null>(null);
  const exportRef                     = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (exportRef.current && !exportRef.current.contains(e.target as Node)) setExportMenu(false);
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  function handleExport(tipo: string) {
    setExportMenu(false);
    if (tipo === "JSON") {
      const blob = new Blob([JSON.stringify(dados, null, 2)], { type: "application/json" });
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement("a"); a.href = url; a.download = "chamados.json"; a.click();
      URL.revokeObjectURL(url);
      return;
    }
    setExportando(tipo);
    setTimeout(() => setExportando(null), 1800);
  }

  function handleSort(key: SortKey) {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("asc"); }
  }

  let dados = [...CHAMADOS];
  if (busca)        dados = dados.filter((c) => `${c.id} ${c.titulo} ${c.solicitante} ${c.categoria} ${c.grupo}`.toLowerCase().includes(busca.toLowerCase()));
  if (urgFiltro)    dados = dados.filter((c) => c.urgencia === urgFiltro);
  if (statusFiltro) dados = dados.filter((c) => c.status === statusFiltro);
  if (setorFiltro)  dados = dados.filter((c) => c.setor === setorFiltro);
  if (grupoFiltro)  dados = dados.filter((c) => c.grupo === grupoFiltro);
  if (catFiltro)    dados = dados.filter((c) => c.categoria === catFiltro);
  dados.sort((a, b) => {
    const av = a[sortKey] ?? "";
    const bv = b[sortKey] ?? "";
    return sortDir === "asc"
      ? String(av).localeCompare(String(bv))
      : String(bv).localeCompare(String(av));
  });

  function SortIcon({ col }: { col: SortKey }) {
    if (sortKey !== col) return <ChevronsUpDown size={12} style={{ color: "var(--text-faint)", opacity: 0.5 }} />;
    return sortDir === "asc"
      ? <ChevronUp size={12} className="text-violet-400" />
      : <ChevronDown size={12} className="text-violet-400" />;
  }


  return (
    <div className="space-y-5">

      {/* Cabeçalho */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h2 className="font-black text-lg tracking-tight" style={{ color: "var(--text-heading)" }}>
            Relatórios
          </h2>
          <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
            Histórico completo de chamados — {CHAMADOS.length} registros
          </p>
        </div>
        {/* Dropdown exportar */}
        <div ref={exportRef} className="relative">
          <button
            onClick={() => setExportMenu((v) => !v)}
            className="flex items-center gap-1.5 btn-neon text-xs px-4 py-2"
          >
            <Download size={13} className={exportando ? "animate-bounce" : ""} />
            {exportando ? `Gerando ${exportando}…` : "Exportar"}
            <ChevronDown size={12} style={{ transform: exportMenu ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 180ms ease" }} />
          </button>

          {exportMenu && (
            <div
              className="absolute right-0 top-full mt-2 w-44 rounded-xl overflow-hidden z-50"
              style={{
                background: "var(--bg-surface-2)",
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
                border: "1px solid var(--border-default)",
                boxShadow: "0 16px 40px rgba(0,0,0,0.18), 0 4px 12px rgba(124,58,237,0.1)",
              }}
            >
              <div className="px-3 py-2" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                <p className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: "var(--text-faint)" }}>
                  Formato de exportação
                </p>
              </div>
              <div className="p-1.5 flex flex-col gap-0.5">
                {[
                  { label: "PDF",       icon: <FileText size={14} />,        cor: "#f87171" },
                  { label: "Planilhas", icon: <FileSpreadsheet size={14} />, cor: "#34d399" },
                  { label: "JSON",      icon: <Braces size={14} />,          cor: "#60a5fa" },
                ].map((op) => (
                  <button
                    key={op.label}
                    onClick={() => handleExport(op.label)}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors text-left"
                    style={{ color: "var(--text-secondary)" }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(124,58,237,0.08)"; (e.currentTarget as HTMLElement).style.color = op.cor; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "var(--text-secondary)"; }}
                  >
                    <span style={{ color: op.cor }}>{op.icon}</span>
                    {op.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Barra de busca */}
      <div className="flex gap-2 items-center">
        {/* Campo de busca */}
        <div className="relative" style={{ width: "380px" }}>
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "var(--text-faint)" }} />
          <input
            className="nexus-input w-full text-xs"
            style={{ paddingLeft: "2.25rem", paddingTop: "0.5rem", paddingBottom: "0.5rem", fontSize: "0.75rem" }}
            placeholder="Buscar por ID, título, solicitante..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>

        {/* Botão Buscar */}
        <button
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all shrink-0"
          style={{
            background: "rgba(124,58,237,0.15)",
            border: "1px solid rgba(124,58,237,0.35)",
            color: "#a78bfa",
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(124,58,237,0.25)"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(124,58,237,0.15)"; }}
        >
          <Search size={13} />
          Buscar
        </button>

        {/* Botão Filtros com dropdown */}
        <div ref={filtroRef} className="relative shrink-0">
          <button
            onClick={() => setFiltroAberto((v) => !v)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all"
            style={{
              background: (urgFiltro || statusFiltro || setorFiltro || grupoFiltro || catFiltro) ? "rgba(124,58,237,0.2)" : filtroAberto ? "rgba(124,58,237,0.12)" : "transparent",
              border: `1px solid ${(urgFiltro || statusFiltro || setorFiltro || grupoFiltro || catFiltro) ? "rgba(124,58,237,0.5)" : "var(--border-subtle)"}`,
              color: (urgFiltro || statusFiltro || setorFiltro || grupoFiltro || catFiltro) ? "#a78bfa" : "var(--text-muted)",
            }}
          >
            <Filter size={13} />
            Filtros
            {(urgFiltro || statusFiltro || setorFiltro || grupoFiltro || catFiltro) && (
              <span className="w-4 h-4 rounded-full text-[9px] font-black flex items-center justify-center bg-violet-500 text-white">
                {[urgFiltro, statusFiltro, setorFiltro, grupoFiltro, catFiltro].filter(Boolean).length}
              </span>
            )}
            <ChevronDown size={12} style={{ transform: filtroAberto ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 180ms ease" }} />
          </button>

          {filtroAberto && (
            <div
              className="absolute right-0 top-full mt-2 w-56 rounded-xl overflow-hidden z-50"
              style={{
                background: "var(--bg-surface-2)",
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
                border: "1px solid var(--border-default)",
                boxShadow: "0 16px 40px rgba(0,0,0,0.18), 0 4px 12px rgba(124,58,237,0.1)",
              }}
            >
              <div className="px-4 py-3" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                <p className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: "var(--text-faint)" }}>Filtrar por</p>
              </div>
              <div className="p-3 flex flex-col gap-3">
                {/* Urgência */}
                <div>
                  <label className="text-[10px] font-semibold uppercase tracking-wide block mb-1.5" style={{ color: "var(--text-faint)" }}>Urgência</label>
                  <div className="flex flex-wrap gap-1">
                    {TODAS_URGENCIAS.map((u) => (
                      <button
                        key={u}
                        onClick={() => setUrgFiltro(urgFiltro === u ? "" : u)}
                        className="px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-all"
                        style={{
                          background: urgFiltro === u ? "rgba(124,58,237,0.2)" : "transparent",
                          border: `1px solid ${urgFiltro === u ? "rgba(124,58,237,0.4)" : "var(--border-subtle)"}`,
                          color: urgFiltro === u ? "#a78bfa" : "var(--text-muted)",
                        }}
                      >
                        {u}
                      </button>
                    ))}
                  </div>
                </div>
                {/* Status */}
                <div>
                  <label className="text-[10px] font-semibold uppercase tracking-wide block mb-1.5" style={{ color: "var(--text-faint)" }}>Status</label>
                  <div className="flex flex-wrap gap-1">
                    {TODOS_STATUS.map((s) => (
                      <button
                        key={s}
                        onClick={() => setStatusFiltro(statusFiltro === s ? "" : s)}
                        className="px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-all"
                        style={{
                          background: statusFiltro === s ? "rgba(124,58,237,0.2)" : "transparent",
                          border: `1px solid ${statusFiltro === s ? "rgba(124,58,237,0.4)" : "var(--border-subtle)"}`,
                          color: statusFiltro === s ? "#a78bfa" : "var(--text-muted)",
                        }}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
                {/* Setor */}
                <div>
                  <label className="text-[10px] font-semibold uppercase tracking-wide block mb-1.5" style={{ color: "var(--text-faint)" }}>Setor</label>
                  <div className="flex flex-wrap gap-1">
                    {TODOS_SETORES.map((s) => (
                      <button key={s} onClick={() => setSetorFiltro(setorFiltro === s ? "" : s)}
                        className="px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-all"
                        style={{ background: setorFiltro === s ? "rgba(124,58,237,0.2)" : "transparent", border: `1px solid ${setorFiltro === s ? "rgba(124,58,237,0.4)" : "var(--border-subtle)"}`, color: setorFiltro === s ? "#a78bfa" : "var(--text-muted)" }}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
                {/* Grupo */}
                <div>
                  <label className="text-[10px] font-semibold uppercase tracking-wide block mb-1.5" style={{ color: "var(--text-faint)" }}>Grupo</label>
                  <div className="flex flex-wrap gap-1">
                    {TODOS_GRUPOS.map((g) => (
                      <button key={g} onClick={() => setGrupoFiltro(grupoFiltro === g ? "" : g)}
                        className="px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-all"
                        style={{ background: grupoFiltro === g ? "rgba(124,58,237,0.2)" : "transparent", border: `1px solid ${grupoFiltro === g ? "rgba(124,58,237,0.4)" : "var(--border-subtle)"}`, color: grupoFiltro === g ? "#a78bfa" : "var(--text-muted)" }}>
                        {g}
                      </button>
                    ))}
                  </div>
                </div>
                {/* Categoria */}
                <div>
                  <label className="text-[10px] font-semibold uppercase tracking-wide block mb-1.5" style={{ color: "var(--text-faint)" }}>Categoria</label>
                  <div className="flex flex-wrap gap-1">
                    {TODAS_CATEGORIAS.map((cat) => (
                      <button key={cat} onClick={() => setCatFiltro(catFiltro === cat ? "" : cat)}
                        className="px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-all"
                        style={{ background: catFiltro === cat ? "rgba(124,58,237,0.2)" : "transparent", border: `1px solid ${catFiltro === cat ? "rgba(124,58,237,0.4)" : "var(--border-subtle)"}`, color: catFiltro === cat ? "#a78bfa" : "var(--text-muted)" }}>
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
                {/* Limpar */}
                {(urgFiltro || statusFiltro || setorFiltro || grupoFiltro || catFiltro) && (
                  <button
                    onClick={() => { setUrgFiltro(""); setStatusFiltro(""); setSetorFiltro(""); setGrupoFiltro(""); setCatFiltro(""); }}
                    className="w-full text-[10px] font-semibold py-1.5 rounded-lg transition-colors"
                    style={{ color: "#f87171", border: "1px solid rgba(239,68,68,0.25)", background: "rgba(239,68,68,0.06)" }}
                  >
                    Limpar filtros
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        <button
          onClick={() => { setBusca(""); setUrgFiltro(""); setStatusFiltro(""); setSetorFiltro(""); setGrupoFiltro(""); setCatFiltro(""); }}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all shrink-0"
          style={{
            color: (busca || urgFiltro || statusFiltro || setorFiltro || grupoFiltro || catFiltro) ? "#f87171" : "var(--text-faint)",
            border: `1px solid ${(busca || urgFiltro || statusFiltro || setorFiltro || grupoFiltro || catFiltro) ? "rgba(239,68,68,0.25)" : "var(--border-subtle)"}`,
            background: (busca || urgFiltro || statusFiltro || setorFiltro || grupoFiltro || catFiltro) ? "rgba(239,68,68,0.06)" : "transparent",
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(239,68,68,0.10)"; (e.currentTarget as HTMLElement).style.color = "#f87171"; }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.background = (busca || urgFiltro || statusFiltro || setorFiltro || grupoFiltro || catFiltro) ? "rgba(239,68,68,0.06)" : "transparent";
            (e.currentTarget as HTMLElement).style.color = (busca || urgFiltro || statusFiltro || setorFiltro || grupoFiltro || catFiltro) ? "#f87171" : "var(--text-faint)";
          }}
        >
          <X size={12} />
          Limpar
        </button>

        <span className="text-xs shrink-0" style={{ color: "var(--text-faint)" }}>
          {dados.length} resultado{dados.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Tabela */}
      <div className="glass rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border-default)", background: "var(--table-header-bg)" }}>
                {([
                  { key: "id",          label: "ID"          },
                  { key: "titulo",      label: "Título"      },
                  { key: "solicitante", label: "Solicitante" },
                  { key: "categoria",   label: "Categoria"   },
                  { key: "grupo",       label: "Grupo"       },
                  { key: "urgencia",    label: "Urgência"    },
                  { key: "status",      label: "Status"      },
                  { key: "abertura",    label: "Abertura"    },
                  { key: "tma",         label: "TMA"         },
                ] as { key: SortKey; label: string }[]).map((col) => (
                  <th
                    key={col.key}
                    className="px-4 py-3 text-left font-semibold uppercase tracking-wide select-none whitespace-nowrap"
                    style={{ color: "var(--table-header-text)", fontSize: "10px" }}
                  >
                    <button
                      onClick={() => handleSort(col.key)}
                      className="flex items-center gap-1 hover:opacity-80 transition-opacity"
                    >
                      {col.label}
                      <SortIcon col={col.key} />
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {dados.length === 0 && (
                <tr>
                  <td colSpan={9} className="text-center py-14" style={{ color: "var(--text-faint)" }}>
                    Nenhum chamado encontrado para os filtros selecionados.
                  </td>
                </tr>
              )}
              {dados.map((c, i) => (
                <tr
                  key={c.id}
                  style={{ borderBottom: i < dados.length - 1 ? "1px solid var(--border-subtle)" : "none" }}
                  className="transition-colors"
                  onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(124,58,237,0.04)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="font-mono font-semibold" style={{ color: "#a78bfa" }}>{c.id}</span>
                  </td>

                  <td className="px-4 py-3" style={{ minWidth: "200px" }}>
                    <span style={{ color: "var(--text-heading)" }}>{c.titulo}</span>
                    <span className="block text-[10px] mt-0.5" style={{ color: "var(--text-faint)" }}>{c.setor}</span>
                  </td>

                  <td className="px-4 py-3 whitespace-nowrap" style={{ color: "var(--text-secondary)" }}>
                    {c.solicitante}
                  </td>

                  <td className="px-4 py-3 whitespace-nowrap" style={{ color: "var(--text-muted)" }}>
                    {c.categoria}
                  </td>

                  <td className="px-4 py-3 whitespace-nowrap" style={{ color: "var(--text-muted)" }}>
                    {c.grupo}
                  </td>

                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${URGENCIA_STYLE[c.urgencia]}`}>
                      {c.urgencia}
                    </span>
                  </td>

                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${STATUS_STYLE[c.status]}`}>
                      {STATUS_ICON[c.status]}
                      {c.status}
                    </span>
                  </td>

                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center gap-1" style={{ color: "var(--text-secondary)" }}>
                      <Clock size={10} />
                      <span className="font-mono text-[10px]">{c.abertura.split(" ")[0]}</span>
                    </div>
                    <span className="font-mono text-[10px]" style={{ color: "var(--text-secondary)" }}>
                      {c.abertura.split(" ")[1]}
                    </span>
                  </td>

                  <td className="px-4 py-3 whitespace-nowrap font-mono" style={{ color: c.tma ? "var(--text-secondary)" : "var(--text-faint)" }}>
                    {c.tma ?? "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div
          className="px-5 py-3 flex items-center justify-between flex-wrap gap-2"
          style={{ borderTop: "1px solid var(--border-subtle)", background: "var(--preview-bg)" }}
        >
          <span className="text-[11px]" style={{ color: "var(--text-secondary)" }}>
            Exibindo <span style={{ color: "var(--text-secondary)" }}>{dados.length}</span> de {CHAMADOS.length} chamados
          </span>
          <span className="text-[11px]" style={{ color: "var(--text-secondary)" }}>
            Clique nos cabeçalhos para ordenar
          </span>
        </div>
      </div>
    </div>
  );
}
