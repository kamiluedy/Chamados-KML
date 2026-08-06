"use client";

import { useState, useMemo } from "react";
import {
  Clock, Tag, ChevronUp, ChevronDown, ChevronsUpDown,
  Search, Filter, X, Plus, ChevronRight,
} from "lucide-react";
import ChamadoDetalhe from "@/components/nexus/ChamadoDetalhe";

type Prioridade = "Alta" | "Média" | "Baixa";
type Status = "todo" | "doing" | "done";

interface Chamado {
  id: string;
  titulo: string;
  descricao: string;
  prioridade: Prioridade;
  categoria: string;
  solicitante: string;
  setor: string;
  dataHora: string;
  avatar: string;
  grupoCategoria?: string;
  status: Status;
}

const PRIOR_STYLE: Record<Prioridade, string> = {
  Alta:  "bg-red-500/15 text-red-400 border-red-500/30",
  Média: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
  Baixa: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
};

const STATUS_STYLE: Record<Status, string> = {
  todo:  "bg-zinc-500/15 text-zinc-400 border-zinc-500/30",
  doing: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  done:  "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
};

const STATUS_LABEL: Record<Status, string> = {
  todo:  "A Fazer",
  doing: "Em Progresso",
  done:  "Concluído",
};

const CAT_STYLE: Record<string, string> = {
  "Rede":      "bg-blue-500/15 text-blue-400",
  "Hardware":  "bg-orange-500/15 text-orange-400",
  "Acesso":    "bg-cyan-500/15 text-cyan-400",
  "Automação": "bg-violet-500/15 text-violet-400",
  "Banco":     "bg-rose-500/15 text-rose-400",
  "Software":  "bg-teal-500/15 text-teal-400",
};

const CHAMADOS_INICIAL: Chamado[] = [
  { id: "#0051", titulo: "Erro na carga de dados PostgreSQL",         descricao: "Pipeline de ETL travando na etapa de carga — tabela clientes. Timeout após 90s.",                prioridade: "Alta",  categoria: "Banco",     solicitante: "Marcos Vinicius",      setor: "Dados & BI",       dataHora: "17/06 — 09:14", avatar: "MV", grupoCategoria: "Banco de Dados / PostgreSQL",    status: "todo"  },
  { id: "#0050", titulo: "Sem acesso ao sistema Protheus",            descricao: "Usuário não consegue logar no ERP desde a última atualização do AD.",                             prioridade: "Alta",  categoria: "Acesso",    solicitante: "Fernanda Reis",        setor: "Financeiro",       dataHora: "17/06 — 09:02", avatar: "FR", grupoCategoria: "Acesso / Autenticação",          status: "todo"  },
  { id: "#0049", titulo: "Monitor externo não detectado",             descricao: "TV Samsung 55pol via HDMI não é reconhecida pelo notebook Dell.",                                 prioridade: "Baixa", categoria: "Hardware",  solicitante: "Julio Andrade",        setor: "Comercial",        dataHora: "17/06 — 08:47", avatar: "JA", grupoCategoria: "Hardware / Periféricos",          status: "todo"  },
  { id: "#0048", titulo: "Instabilidade no bot Python/Selenium",      descricao: "Bot de automação de relatórios falhando silenciosamente às 07h. ChromeDriver desatualizado.",     prioridade: "Alta",  categoria: "Automação", solicitante: "Kamila Luedy",         setor: "TI / Dados",       dataHora: "17/06 — 08:30", avatar: "KL", grupoCategoria: "Automação / Scripts / Bots",     status: "doing" },
  { id: "#0047", titulo: "Configuração de acesso Moodle",             descricao: "Novo colaborador sem perfil de tutor no ambiente de EAD corporativo.",                            prioridade: "Média", categoria: "Acesso",    solicitante: "Kamila Luedy",         setor: "TI / RH",          dataHora: "17/06 — 08:05", avatar: "KL", grupoCategoria: "Acesso / Moodle",                status: "doing" },
  { id: "#0046", titulo: "Queda na rede — switch Piso 3",             descricao: "14 estações sem conexão após queda de energia. Switch HP 1910 não restabeleceu.",                 prioridade: "Alta",  categoria: "Rede",      solicitante: "Coord. Infraestrutura", setor: "Infraestrutura",  dataHora: "17/06 — 07:58", avatar: "CI", grupoCategoria: "Rede / Conectividade",           status: "doing" },
  { id: "#0045", titulo: "Impressora HP LaserJet — fila travada",     descricao: "Spool corrompido após atualização Windows. Limpeza e reinício do serviço.",                       prioridade: "Baixa", categoria: "Hardware",  solicitante: "Ana Cláudia",          setor: "Administrativo",   dataHora: "17/06 — 07:30", avatar: "AC", grupoCategoria: "Hardware / Periféricos",          status: "done"  },
  { id: "#0044", titulo: "Redefinição de senha — VPN corporativa",    descricao: "Usuário bloqueado após 5 tentativas incorretas. Reset e orientação concluídos.",                   prioridade: "Média", categoria: "Acesso",    solicitante: "Pedro Mota",           setor: "Comercial",        dataHora: "16/06 — 17:45", avatar: "PM", grupoCategoria: "Acesso / Autenticação",          status: "done"  },
  { id: "#0043", titulo: "Notebook reiniciando aleatoriamente",       descricao: "Diagnóstico: superaquecimento. Limpeza interna e substituição da pasta térmica.",                  prioridade: "Média", categoria: "Hardware",  solicitante: "Bruna Alves",          setor: "Marketing",        dataHora: "16/06 — 16:20", avatar: "BA", grupoCategoria: "Hardware / Periféricos",          status: "done"  },
  { id: "#0042", titulo: "Script n8n quebrando na integração Sheets", descricao: "Token OAuth expirado. Reautenticação e teste de fluxo concluídos com sucesso.",                   prioridade: "Alta",  categoria: "Automação", solicitante: "Kamila Luedy",         setor: "TI / Dados",       dataHora: "16/06 — 14:10", avatar: "KL", grupoCategoria: "Automação / Scripts / Bots",     status: "done"  },
];

type SortKey = "id" | "titulo" | "prioridade" | "status" | "solicitante" | "dataHora";
type SortDir = "asc" | "desc";

const PRIORIDADES: Prioridade[] = ["Alta", "Média", "Baixa"];
const STATUSES: Status[]        = ["todo", "doing", "done"];

export default function Kanban() {
  const [chamados, setChamados]     = useState(CHAMADOS_INICIAL);
  const [busca, setBusca]           = useState("");
  const [filtroAberto, setFiltroAberto] = useState(false);
  const [priorFiltro, setPriorFiltro]   = useState<Prioridade | "">("");
  const [statusFiltro, setStatusFiltro] = useState<Status | "">("");
  const [sortKey, setSortKey]       = useState<SortKey>("dataHora");
  const [sortDir, setSortDir]       = useState<SortDir>("desc");
  function handleSort(key: SortKey) {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("asc"); }
  }

  function moverStatus(id: string, dir: "prev" | "next") {
    const ORDER: Status[] = ["todo", "doing", "done"];
    setChamados((prev) => prev.map((c) => {
      if (c.id !== id) return c;
      const idx = ORDER.indexOf(c.status);
      const novoIdx = dir === "next" ? idx + 1 : idx - 1;
      if (novoIdx < 0 || novoIdx >= ORDER.length) return c;
      return { ...c, status: ORDER[novoIdx] };
    }));
  }

  const dados = useMemo(() => {
    let list = [...chamados];
    if (busca)       list = list.filter((c) => `${c.id} ${c.titulo} ${c.solicitante} ${c.categoria}`.toLowerCase().includes(busca.toLowerCase()));
    if (priorFiltro) list = list.filter((c) => c.prioridade === priorFiltro);
    if (statusFiltro) list = list.filter((c) => c.status === statusFiltro);
    list.sort((a, b) => {
      const av = a[sortKey] ?? "";
      const bv = b[sortKey] ?? "";
      return sortDir === "asc"
        ? String(av).localeCompare(String(bv))
        : String(bv).localeCompare(String(av));
    });
    return list;
  }, [chamados, busca, priorFiltro, statusFiltro, sortKey, sortDir]);

  function SortIcon({ col }: { col: SortKey }) {
    if (sortKey !== col) return <ChevronsUpDown size={12} style={{ color: "var(--text-faint)", opacity: 0.5 }} />;
    return sortDir === "asc"
      ? <ChevronUp size={12} className="text-violet-400" />
      : <ChevronDown size={12} className="text-violet-400" />;
  }

  const temFiltro = !!(busca || priorFiltro || statusFiltro);
  const [chamadoAberto, setChamadoAberto] = useState<Chamado | null>(null);

  return (
    <div className="space-y-5">
      {chamadoAberto && (
        <ChamadoDetalhe chamado={chamadoAberto} onClose={() => setChamadoAberto(null)} />
      )}

      {/* Cabeçalho */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h2 className="font-black text-lg tracking-tight" style={{ color: "var(--text-heading)" }}>Quadro de Chamados</h2>
          <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
            <span className="font-semibold" style={{ color: "var(--text-heading)" }}>{chamados.length}</span> chamados ativos · Atualizado agora
          </p>
        </div>
        <button className="flex items-center gap-1.5 btn-neon text-xs px-4 py-2">
          <Plus size={13} /> Novo Chamado
        </button>
      </div>

      {/* Barra de busca + filtros */}
      <div className="flex gap-2 items-center flex-wrap">
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

        <button
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all shrink-0"
          style={{ background: "rgba(124,58,237,0.15)", border: "1px solid rgba(124,58,237,0.35)", color: "#a78bfa" }}
        >
          <Search size={13} /> Buscar
        </button>

        {/* Filtros dropdown */}
        <div className="relative shrink-0">
          <button
            onClick={() => setFiltroAberto((v) => !v)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all"
            style={{
              background: (priorFiltro || statusFiltro) ? "rgba(124,58,237,0.2)" : filtroAberto ? "rgba(124,58,237,0.12)" : "transparent",
              border: `1px solid ${(priorFiltro || statusFiltro) ? "rgba(124,58,237,0.5)" : "var(--border-subtle)"}`,
              color: (priorFiltro || statusFiltro) ? "#a78bfa" : "var(--text-muted)",
            }}
          >
            <Filter size={13} />
            Filtros
            {(priorFiltro || statusFiltro) && (
              <span className="w-4 h-4 rounded-full text-[9px] font-black flex items-center justify-center bg-violet-500 text-white">
                {[priorFiltro, statusFiltro].filter(Boolean).length}
              </span>
            )}
            <ChevronDown size={12} style={{ transform: filtroAberto ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 180ms ease" }} />
          </button>

          {filtroAberto && (
            <div
              className="absolute left-0 top-full mt-2 w-56 rounded-xl overflow-hidden z-50"
              style={{
                background: "var(--bg-surface-2)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
                border: "1px solid var(--border-default)",
                boxShadow: "0 16px 40px rgba(0,0,0,0.18), 0 4px 12px rgba(124,58,237,0.1)",
              }}
            >
              <div className="px-4 py-3" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                <p className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: "var(--text-faint)" }}>Filtrar por</p>
              </div>
              <div className="p-3 flex flex-col gap-3">
                <div>
                  <label className="text-[10px] font-semibold uppercase tracking-wide block mb-1.5" style={{ color: "var(--text-faint)" }}>Prioridade</label>
                  <div className="flex flex-wrap gap-1">
                    {PRIORIDADES.map((p) => (
                      <button key={p} onClick={() => setPriorFiltro(priorFiltro === p ? "" : p)}
                        className="px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-all"
                        style={{ background: priorFiltro === p ? "rgba(124,58,237,0.2)" : "transparent", border: `1px solid ${priorFiltro === p ? "rgba(124,58,237,0.4)" : "var(--border-subtle)"}`, color: priorFiltro === p ? "#a78bfa" : "var(--text-muted)" }}
                      >{p}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-semibold uppercase tracking-wide block mb-1.5" style={{ color: "var(--text-faint)" }}>Status</label>
                  <div className="flex flex-wrap gap-1">
                    {STATUSES.map((s) => (
                      <button key={s} onClick={() => setStatusFiltro(statusFiltro === s ? "" : s)}
                        className="px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-all"
                        style={{ background: statusFiltro === s ? "rgba(124,58,237,0.2)" : "transparent", border: `1px solid ${statusFiltro === s ? "rgba(124,58,237,0.4)" : "var(--border-subtle)"}`, color: statusFiltro === s ? "#a78bfa" : "var(--text-muted)" }}
                      >{STATUS_LABEL[s]}</button>
                    ))}
                  </div>
                </div>
                {(priorFiltro || statusFiltro) && (
                  <button onClick={() => { setPriorFiltro(""); setStatusFiltro(""); }}
                    className="w-full text-[10px] font-semibold py-1.5 rounded-lg"
                    style={{ color: "#f87171", border: "1px solid rgba(239,68,68,0.25)", background: "rgba(239,68,68,0.06)" }}
                  >Limpar filtros</button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Limpar tudo */}
        <button
          onClick={() => { setBusca(""); setPriorFiltro(""); setStatusFiltro(""); }}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all shrink-0"
          style={{
            color: temFiltro ? "#f87171" : "var(--text-faint)",
            border: `1px solid ${temFiltro ? "rgba(239,68,68,0.25)" : "var(--border-subtle)"}`,
            background: temFiltro ? "rgba(239,68,68,0.06)" : "transparent",
          }}
        >
          <X size={12} /> Limpar
        </button>

        <span className="text-xs shrink-0 ml-auto" style={{ color: "var(--text-faint)" }}>
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
                  { key: "prioridade",  label: "Prioridade"  },
                  { key: "status",      label: "Status"      },
                  { key: "dataHora",    label: "Data / Hora" },
                  { key: "_acoes",      label: ""            },
                ] as { key: string; label: string }[]).map((col) => (
                  <th key={col.key}
                    className="px-4 py-3 text-left font-bold uppercase tracking-wide select-none whitespace-nowrap"
                    style={{ color: "var(--table-header-text)", fontSize: "10px" }}
                  >
                    {col.key !== "_acoes" ? (
                      <button onClick={() => handleSort(col.key as SortKey)} className="flex items-center gap-1 hover:opacity-80 transition-opacity">
                        {col.label} <SortIcon col={col.key as SortKey} />
                      </button>
                    ) : col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {dados.length === 0 && (
                <tr><td colSpan={8} className="text-center py-14" style={{ color: "var(--text-faint)" }}>Nenhum chamado encontrado.</td></tr>
              )}
              {dados.map((c) => {
                return (
                  <tr
                    key={c.id}
                      style={{ borderBottom: "1px solid var(--border-subtle)", cursor: "pointer" }}
                      className="transition-colors"
                      onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(124,58,237,0.04)")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                      onClick={() => setChamadoAberto(c)}
                    >
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="font-mono font-semibold" style={{ color: "#a78bfa" }}>{c.id}</span>
                      </td>
                      <td className="px-4 py-3" style={{ minWidth: "200px" }}>
                        <div className="flex items-center gap-1.5">
                          <ChevronRight size={12} style={{ color: "var(--text-faint)", flexShrink: 0 }} />
                          <span style={{ color: "var(--text-heading)" }}>{c.titulo}</span>
                        </div>
                        <span className="block text-[10px] mt-0.5 ml-4" style={{ color: "var(--text-faint)" }}>{c.setor}</span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap" style={{ color: "var(--text-secondary)" }}>
                        <div className="flex items-center gap-1.5">
                          <div className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black text-white shrink-0" style={{ background: "linear-gradient(135deg,#7c3aed,#6d28d9)" }}>{c.avatar}</div>
                          {c.solicitante}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-md ${CAT_STYLE[c.categoria] ?? "bg-zinc-700/40 text-zinc-400"}`}>
                          <Tag size={9} /> {c.categoria}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${PRIOR_STYLE[c.prioridade]}`}>
                          {c.prioridade}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${STATUS_STYLE[c.status]}`}>
                          {STATUS_LABEL[c.status]}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-1" style={{ color: "var(--text-secondary)" }}>
                          <Clock size={10} />
                          <span className="font-mono text-[10px]">{c.dataHora}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                          {c.status !== "todo" && (
                            <button onClick={() => moverStatus(c.id, "prev")}
                              className="px-2 py-1 rounded-lg text-[10px] font-medium transition-all"
                              style={{ color: "var(--text-secondary)", border: "1px solid var(--border-subtle)" }}
                              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "#a78bfa"; (e.currentTarget as HTMLElement).style.borderColor = "rgba(124,58,237,0.4)"; }}
                              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "var(--text-secondary)"; (e.currentTarget as HTMLElement).style.borderColor = "var(--border-subtle)"; }}
                            >← Voltar</button>
                          )}
                          {c.status !== "done" && (
                            <button onClick={() => moverStatus(c.id, "next")}
                              className="px-2 py-1 rounded-lg text-[10px] font-medium transition-all"
                              style={{ color: "var(--text-secondary)", border: "1px solid var(--border-subtle)" }}
                              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "#34d399"; (e.currentTarget as HTMLElement).style.borderColor = "rgba(52,211,153,0.4)"; }}
                              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "var(--text-secondary)"; (e.currentTarget as HTMLElement).style.borderColor = "var(--border-subtle)"; }}
                            >Avançar →</button>
                          )}
                        </div>
                      </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 flex items-center justify-between" style={{ borderTop: "1px solid var(--border-subtle)", background: "var(--preview-bg)" }}>
          <span className="text-[11px]" style={{ color: "var(--text-secondary)" }}>
            Exibindo <span style={{ color: "var(--text-secondary)" }}>{dados.length}</span> de {chamados.length} chamados
          </span>
          <span className="text-[11px]" style={{ color: "var(--text-secondary)" }}>Clique na linha para ver detalhes · Clique no cabeçalho para ordenar</span>
        </div>
      </div>
    </div>
  );
}
