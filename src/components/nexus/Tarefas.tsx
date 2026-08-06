"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Plus, Check, Trash2, Star, MoreVertical, ChevronDown, ChevronRight, Pencil, X, Lock, Users, Calendar, RefreshCw, ListTodo } from "lucide-react";
import { podeApagarColunaEquipe } from "@/lib/auth-store";

/* ─── tipos ─────────────────────────────────────────────────── */
interface Subtarefa {
  id: string;
  texto: string;
  feita: boolean;
}

type Recorrencia = "nunca" | "diaria" | "semanal" | "mensal";

interface Tarefa {
  id: string;
  texto: string;
  descricao?: string;
  feita: boolean;
  estrela: boolean;
  prioridade: "Alta" | "Normal" | "Baixa";
  prazo?: string;
  recorrencia?: Recorrencia;
  subtarefas?: Subtarefa[];
}

interface Lista {
  id: string;
  nome: string;
  avatar: string;
  cor: string;
  tarefas: Tarefa[];
}

/* ─── dados iniciais ─────────────────────────────────────────── */
const PRIOR_BADGE: Record<Tarefa["prioridade"], { bg: string; text: string }> = {
  Alta:   { bg: "rgba(239,68,68,0.12)",  text: "#f87171" },
  Normal: { bg: "rgba(124,58,237,0.12)", text: "#a78bfa" },
  Baixa:  { bg: "rgba(56,189,248,0.12)", text: "#38bdf8" },
};

/* listas pessoais — privadas, organizadas por tema */
const PESSOAIS_INICIAL: Lista[] = [
  {
    id: "pp1", nome: "Diário", avatar: "☀", cor: "#f59e0b",
    tarefas: [
      { id: "p1", texto: "Atualizar documentação do bot Selenium", descricao: "Docs desatualizados desde a última versão do Selenium 4.", feita: false, estrela: true,  prioridade: "Alta",   recorrencia: "diaria", subtarefas: [{ id: "s1", texto: "Revisar página de instalação", feita: false }, { id: "s2", texto: "Atualizar exemplos de código", feita: false }] },
      { id: "p2", texto: "Revisar script de ETL",                  descricao: "Verificar joins e performance na tabela de 300k linhas.", feita: false, estrela: false, prioridade: "Normal" },
    ],
  },
  {
    id: "pp2", nome: "Mensal", avatar: "📅", cor: "#7c3aed",
    tarefas: [
      { id: "p3", texto: "Relatório mensal de chamados",           descricao: "Exportar do KML DESK e montar planilha consolidada.",    feita: false, estrela: true,  prioridade: "Alta",   recorrencia: "mensal" },
      { id: "p4", texto: "Validar backup do banco de dados",       descricao: "",                                                       feita: false, estrela: false, prioridade: "Normal", recorrencia: "mensal" },
    ],
  },
  {
    id: "pp3", nome: "Estudos", avatar: "📚", cor: "#0ea5e9",
    tarefas: [
      { id: "p5", texto: "Estudar Dart e Flutter",                 descricao: "",                                                       feita: false, estrela: false, prioridade: "Baixa"  },
      { id: "p6", texto: "Curso de Power BI avançado",             descricao: "",                                                       feita: false, estrela: false, prioridade: "Normal" },
    ],
  },
  {
    id: "pp4", nome: "Outros", avatar: "🗂", cor: "#10b981",
    tarefas: [
      { id: "p7", texto: "Organizar pasta de projetos no SharePoint", descricao: "",                                                    feita: true,  estrela: false, prioridade: "Baixa"  },
    ],
  },
];

/* colunas da equipe — visíveis a todos */
const LISTAS_INICIAL: Lista[] = [
  {
    id: "l1", nome: "Kamila Luedy", avatar: "KL", cor: "#7c3aed",
    tarefas: [
      { id: "t1", texto: "Criar relatório mensal de chamados — Junho", descricao: "Exportar dados do KML DESK e montar planilha consolidada.", feita: false, estrela: true,  prioridade: "Alta"   },
      { id: "t2", texto: "Validar backup do banco de dados semanal",   descricao: "",                                                          feita: false, estrela: false, prioridade: "Normal" },
      { id: "t3", texto: "Dashboard de pendências documentadas",       descricao: "Modelo aprovado pelo gestor, aguardando implementação.",   feita: false, estrela: true,  prioridade: "Alta"   },
    ],
  },
  {
    id: "l2", nome: "Marcos Vinicius", avatar: "MV", cor: "#0ea5e9",
    tarefas: [
      { id: "t4", texto: "Treinamento wehandle",                       descricao: "",                                                          feita: false, estrela: false, prioridade: "Normal" },
      { id: "t5", texto: "Atualizar cadastro de usuários no AD",       descricao: "Sincronizar com o RH após última contratação.",             feita: false, estrela: false, prioridade: "Normal" },
      { id: "t6", texto: "Dashboard de chamados (Futuro)",             descricao: "",                                                          feita: false, estrela: true,  prioridade: "Alta"   },
    ],
  },
  {
    id: "l3", nome: "Ana Cláudia", avatar: "AC", cor: "#10b981",
    tarefas: [
      { id: "t7",  texto: "Manutenção e formatação de notebooks",      descricao: "5 notebooks da filial Sul aguardam formatação.",            feita: false, estrela: false, prioridade: "Alta"   },
      { id: "t8",  texto: "Verificar servidor backup Proxmox",         descricao: "",                                                          feita: true,  estrela: false, prioridade: "Baixa"  },
    ],
  },
  {
    id: "l4", nome: "Pedro Mota", avatar: "PM", cor: "#f59e0b",
    tarefas: [
      { id: "t9",  texto: "Reunião com RH — pendente ata",             descricao: "Ata deve ser enviada até sexta-feira.",                    feita: false, estrela: true,  prioridade: "Alta"   },
      { id: "t10", texto: "Formulário ticket pagamento",               descricao: "Implementar no Formapp.",                                  feita: false, estrela: false, prioridade: "Normal" },
      { id: "t11", texto: "Estudar Dart e Flutter",                    descricao: "",                                                          feita: false, estrela: false, prioridade: "Baixa"  },
    ],
  },
];

let _nextId = 300;
function uid() { return `x${++_nextId}`; }

/* ─── hook: drag-and-drop por pointer events ─────────────────── */
/*
  Estratégia:
  - onPointerDown no handle → captura pointer, guarda item sendo arrastado
  - onPointerMove → calcula posição, encontra elemento sob o cursor, move item
  - onPointerUp → solta
  Funciona para tarefas dentro de uma coluna E para colunas entre si.
*/
type DragKind = "tarefa" | "coluna";

interface DragState {
  kind: DragKind;
  listaId: string;   // de onde saiu (tarefas) ou id da coluna (colunas)
  itemId: string;
  ghost: HTMLElement;
  startX: number;
  startY: number;
}

/* ─── componente TarefaItem ─────────────────────────────────── */
function TarefaItem({
  tarefa, listaId, onToggle, onDelete, onEstrela, onEdit, onToggleSub,
  onDragHandleDown, isDragging,
}: {
  tarefa: Tarefa;
  listaId: string;
  onToggle: () => void;
  onDelete: () => void;
  onEstrela: () => void;
  onEdit: () => void;
  onToggleSub?: (subId: string) => void;
  onDragHandleDown: (e: React.PointerEvent, listaId: string, itemId: string) => void;
  isDragging: boolean;
}) {
  const [hover, setHover] = useState(false);
  const prior = PRIOR_BADGE[tarefa.prioridade];

  return (
    <div
      data-tarefa-id={tarefa.id}
      data-lista-id={listaId}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className="flex items-start gap-2 px-2 py-2 rounded-lg transition-colors select-none"
      style={{
        background: hover ? "var(--bg-statusbar)" : "transparent",
        opacity: isDragging ? 0.35 : 1,
        cursor: "default",
      }}
    >
      {/* Grip handle */}
      <div
        onPointerDown={(e) => onDragHandleDown(e, listaId, tarefa.id)}
        className="mt-0.5 shrink-0 cursor-grab active:cursor-grabbing touch-none"
        style={{ color: "var(--text-faint)", opacity: hover ? 0.6 : 0, transition: "opacity 150ms" }}
        title="Arrastar"
      >
        <svg width="10" height="14" viewBox="0 0 10 14" fill="currentColor">
          <circle cx="3" cy="2.5" r="1.2"/><circle cx="7" cy="2.5" r="1.2"/>
          <circle cx="3" cy="7"   r="1.2"/><circle cx="7" cy="7"   r="1.2"/>
          <circle cx="3" cy="11.5" r="1.2"/><circle cx="7" cy="11.5" r="1.2"/>
        </svg>
      </div>

      {/* Checkbox */}
      <button
        onPointerDown={(e) => e.stopPropagation()}
        onClick={onToggle}
        className="w-4 h-4 rounded-full mt-0.5 shrink-0 flex items-center justify-center border-2 transition-all"
        style={{
          borderColor: tarefa.feita ? "#7c3aed" : "var(--text-muted)",
          background:  tarefa.feita ? "#7c3aed" : "transparent",
        }}
      >
        {tarefa.feita && <Check size={8} className="text-white" strokeWidth={3.5} />}
      </button>

      {/* Texto */}
      <div className="flex-1 min-w-0">
        <p className="text-xs leading-snug" style={{
          color: tarefa.feita ? "var(--text-faint)" : "var(--text-heading)",
          textDecoration: tarefa.feita ? "line-through" : "none",
        }}>
          {tarefa.texto}
        </p>
        {tarefa.descricao && (
          <p className="text-[10px] mt-0.5 leading-snug" style={{ color: "var(--text-muted)" }}>
            {tarefa.descricao}
          </p>
        )}
        {/* Tags de prazo / recorrência / subtarefas */}
        {(tarefa.prazo || tarefa.recorrencia || (tarefa.subtarefas?.length ?? 0) > 0) && (
          <div className="flex items-center gap-1.5 mt-1 flex-wrap">
            {tarefa.prazo && (
              <span className="flex items-center gap-0.5 text-[9px] font-semibold px-1.5 py-0.5 rounded-full"
                style={{ background: "rgba(245,158,11,0.12)", color: "#f59e0b" }}>
                <Calendar size={8} /> {new Date(tarefa.prazo + "T12:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}
              </span>
            )}
            {tarefa.recorrencia && (
              <span className="flex items-center gap-0.5 text-[9px] font-semibold px-1.5 py-0.5 rounded-full"
                style={{ background: "rgba(56,189,248,0.12)", color: "#38bdf8" }}>
                <RefreshCw size={8} /> {({ diaria: "Diária", semanal: "Semanal", mensal: "Mensal" } as Record<string, string>)[tarefa.recorrencia ?? ""] ?? ""}
              </span>
            )}
          </div>
        )}
        {/* Subtarefas como checklist */}
        {(tarefa.subtarefas?.length ?? 0) > 0 && (
          <div className="mt-1.5 space-y-1">
            {tarefa.subtarefas!.map((s) => (
              <button key={s.id}
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => { e.stopPropagation(); onToggleSub?.(s.id); }}
                className="flex items-start gap-2 w-full text-left group"
              >
                <span className="w-3.5 h-3.5 rounded-full shrink-0 flex items-center justify-center border transition-all mt-0.5"
                  style={{
                    borderColor: s.feita ? "#7c3aed" : "var(--text-secondary)",
                    background: s.feita ? "#7c3aed" : "transparent",
                  }}>
                  {s.feita && <Check size={8} strokeWidth={3} className="text-white" />}
                </span>
                <span className="text-[10px] leading-snug break-words min-w-0 flex-1"
                  style={{
                    color: s.feita ? "var(--text-muted)" : "var(--text-primary)",
                    textDecoration: s.feita ? "line-through" : "none",
                  }}>
                  {s.texto}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Badges + ações */}
      <div className="flex items-center gap-1 shrink-0">
        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
          style={{ background: prior.bg, color: prior.text }}>
          {tarefa.prioridade}
        </span>
        <button onPointerDown={(e) => e.stopPropagation()} onClick={onEstrela}
          className="p-1 rounded transition-colors"
          style={{ color: tarefa.estrela ? "#f59e0b" : "var(--text-faint)", opacity: hover || tarefa.estrela ? 1 : 0 }}>
          <Star size={11} fill={tarefa.estrela ? "currentColor" : "none"} />
        </button>
        <button onPointerDown={(e) => e.stopPropagation()} onClick={onEdit}
          className="p-1 rounded transition-colors"
          style={{ color: "var(--text-faint)", opacity: hover ? 1 : 0 }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "#a78bfa")}
          onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--text-faint)")}>
          <Pencil size={11} />
        </button>
        <button onPointerDown={(e) => e.stopPropagation()} onClick={onDelete}
          className="p-1 rounded transition-colors"
          style={{ color: "var(--text-faint)", opacity: hover ? 1 : 0 }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "#f87171")}
          onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--text-faint)")}>
          <Trash2 size={11} />
        </button>
      </div>
    </div>
  );
}

/* ─── componente Coluna ─────────────────────────────────────── */
const CORES_OPCAO  = ["#7c3aed","#0ea5e9","#10b981","#f59e0b","#ef4444","#ec4899","#6366f1","#14b8a6"];
const EMOJIS_OPCAO = ["☀","📅","📚","🗂","⚡","🎯","🔧","💡","📊","🚀","✅","🔒","💬","🌐","🎨","📝"];


function Coluna({
  lista, onChange, onDelete, onColumnDragHandleDown, isDragging,
  onDragHandleDown, draggingTarefa, modo, pasteIdx,
}: {
  lista: Lista;
  onChange: (l: Lista) => void;
  onDelete: () => void;
  onColumnDragHandleDown: (e: React.PointerEvent, listaId: string) => void;
  isDragging: boolean;
  onDragHandleDown: (e: React.PointerEvent, listaId: string, itemId: string) => void;
  draggingTarefa: { listaId: string; itemId: string } | null;
  modo?: "pessoal" | "equipe";
  pasteIdx?: number;
}) {
  const [mostrarForm,      setMostrarForm]      = useState(false);
  const [showMenu,         setShowMenu]         = useState(false);
  const [concluidas,       setConcluidas]       = useState(false);
  const [editandoId,       setEditandoId]       = useState<string | null>(null);
  const [editandoNome,     setEditandoNome]     = useState(false);
  const [confirmarExcluir, setConfirmarExcluir] = useState(false);
  const [nomeEdit,         setNomeEdit]         = useState(lista.nome);
  const [corEdit,          setCorEdit]          = useState(lista.cor);
  const [emojiEdit,        setEmojiEdit]        = useState(lista.avatar);
  const [showEmojis,       setShowEmojis]       = useState(false);
  const menuRef  = useRef<HTMLDivElement>(null);
  const nomeRef  = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function h(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setShowMenu(false);
    }
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  useEffect(() => {
    if (editandoNome) setTimeout(() => nomeRef.current?.focus(), 50);
  }, [editandoNome]);

  function salvarNome() {
    const nome = nomeEdit.trim();
    if (!nome) return;
    const isEmoji = emojiEdit.length >= 1 && emojiEdit.codePointAt(0)! > 127;
    const avatar  = isEmoji ? emojiEdit : nome.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase();
    onChange({ ...lista, nome, avatar, cor: corEdit });
    setEditandoNome(false);
  }

  const pendentes = lista.tarefas.filter((t) => !t.feita);
  const feitas    = lista.tarefas.filter((t) => t.feita);

  function adicionar(campos: Omit<Tarefa, "id" | "feita" | "estrela">) {
    const nova: Tarefa = { id: uid(), feita: false, estrela: false, ...campos };
    onChange({ ...lista, tarefas: [nova, ...lista.tarefas] });
    setMostrarForm(false);
  }

  function salvarEdicao(id: string, campos: Omit<Tarefa, "id" | "feita" | "estrela">) {
    onChange({ ...lista, tarefas: lista.tarefas.map((t) => t.id === id ? { ...t, ...campos } : t) });
    setEditandoId(null);
  }

  function toggle(id: string) {
    onChange({ ...lista, tarefas: lista.tarefas.map((t) => {
      if (t.id !== id) return t;
      const novaFeita = !t.feita;
      return {
        ...t,
        feita: novaFeita,
        subtarefas: novaFeita && t.subtarefas?.length
          ? t.subtarefas.map((s) => ({ ...s, feita: true }))
          : t.subtarefas,
      };
    })});
  }
  function deletar(id: string) {
    onChange({ ...lista, tarefas: lista.tarefas.filter((t) => t.id !== id) });
  }
  function estrela(id: string) {
    onChange({ ...lista, tarefas: lista.tarefas.map((t) => t.id === id ? { ...t, estrela: !t.estrela } : t) });
  }
  function toggleSub(tarefaId: string, subId: string) {
    onChange({ ...lista, tarefas: lista.tarefas.map((t) => t.id !== tarefaId ? t : {
      ...t, subtarefas: t.subtarefas?.map((s) => s.id === subId ? { ...s, feita: !s.feita } : s),
    })});
  }

  const isPessoal    = modo === "pessoal";
  const pastelBg     = isPessoal ? `${lista.cor}18` : "var(--bg-surface)";
  const pastelBorder = isPessoal ? `${lista.cor}40` : "var(--border-default)";

  return (
    <div
      data-lista-id={lista.id}
      className="flex flex-col rounded-xl overflow-visible shrink-0"
      style={{
        width: 288,
        background: pastelBg,
        border: `1px solid ${pastelBorder}`,
        opacity: isDragging ? 0.4 : 1,
        transition: "opacity 150ms",
      }}
    >
      {/* Cabeçalho */}
      <div className="shrink-0" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
        <div className="flex items-center gap-2 px-3 py-2.5">
          {/* Grip coluna */}
          <div onPointerDown={(e) => onColumnDragHandleDown(e, lista.id)}
            className="shrink-0 cursor-grab active:cursor-grabbing touch-none"
            style={{ color: "var(--text-faint)", opacity: 0.4 }} title="Arrastar coluna">
            <svg width="10" height="14" viewBox="0 0 10 14" fill="currentColor">
              <circle cx="3" cy="2.5" r="1.2"/><circle cx="7" cy="2.5" r="1.2"/>
              <circle cx="3" cy="7"   r="1.2"/><circle cx="7" cy="7"   r="1.2"/>
              <circle cx="3" cy="11.5" r="1.2"/><circle cx="7" cy="11.5" r="1.2"/>
            </svg>
          </div>
          {!isPessoal && (
            <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 font-black"
              style={{
                background: lista.cor,
                fontSize: lista.avatar.length === 1 && lista.avatar.codePointAt(0)! > 127 ? "15px" : "10px",
                color: "white",
                boxShadow: `0 0 0 2px ${lista.cor}40`,
              }}>
              {lista.avatar}
            </div>
          )}
          <span className="flex-1 font-semibold text-xs truncate" style={{ color: "var(--text-heading)" }}>
            {lista.nome}
          </span>
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0"
            style={{ background: "var(--bg-statusbar)", color: "var(--text-muted)" }}>
            {pendentes.length}
          </span>
          <div className="relative" ref={menuRef}>
            <button onClick={() => setShowMenu((v) => !v)}
              className="p-1 rounded transition-colors" style={{ color: "var(--text-faint)" }}>
              <MoreVertical size={13} />
            </button>
            {showMenu && (
              <div className="absolute right-0 top-full mt-1 rounded-xl z-30 overflow-hidden"
                style={{ background: "var(--bg-dropdown)", border: "1px solid var(--border-default)", minWidth: 170, boxShadow: "0 8px 32px rgba(0,0,0,0.22), 0 2px 8px rgba(0,0,0,0.14)" }}>
                <button onClick={() => { setMostrarForm(true); setShowMenu(false); }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-left transition-colors"
                  style={{ color: "var(--text-heading)" }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "var(--bg-statusbar)")}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "transparent")}>
                  <Plus size={12} /> Adicionar tarefa
                </button>
                <button onClick={() => { setNomeEdit(lista.nome); setCorEdit(lista.cor); setEmojiEdit(lista.avatar); setEditandoNome(true); setShowMenu(false); }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-left transition-colors"
                  style={{ color: "var(--text-heading)" }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "var(--bg-statusbar)")}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "transparent")}>
                  <Pencil size={12} /> Renomear
                </button>
                {(isPessoal || podeApagarColunaEquipe()) && (
                <button onClick={() => { setShowMenu(false); setConfirmarExcluir(true); }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-left transition-colors"
                  style={{ color: "#f87171" }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "rgba(239,68,68,0.08)")}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "transparent")}>
                  <Trash2 size={12} /> Excluir coluna
                </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Painel inline de edição de nome/cor */}
        {editandoNome && (
          <div className="mx-3 mb-3 p-3 flex flex-col gap-2 rounded-xl"
            style={{ background: "var(--bg-statusbar)", border: "1px solid var(--border-default)" }}>
            <input ref={nomeRef}
              className="nexus-input text-xs w-full"
              style={{ paddingTop: "0.4rem", paddingBottom: "0.4rem" }}
              placeholder="Nome da pessoa"
              value={nomeEdit}
              onChange={(e) => setNomeEdit(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") salvarNome(); if (e.key === "Escape") setEditandoNome(false); }}
            />
            {/* Cor livre — só na aba pessoal */}
            {isPessoal && (
              <div>
                <p className="text-[10px] font-semibold mb-1.5" style={{ color: "var(--text-faint)" }}>Cor do card</p>
                <div className="flex items-center gap-2">
                  <label className="relative cursor-pointer">
                    <div className="w-8 h-8 rounded-lg border-2 transition-transform hover:scale-105"
                      style={{ background: corEdit, borderColor: `${corEdit}80` }} />
                    <input type="color" value={corEdit} onChange={(e) => setCorEdit(e.target.value)}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" />
                  </label>
                  <span className="text-[11px] font-mono" style={{ color: "var(--text-muted)" }}>{corEdit}</span>
                </div>
              </div>
            )}

            {/* Ícone + Cor — só na aba equipe */}
            {!isPessoal && <div className="flex items-center gap-3">
              {/* Botão ícone */}
              <div className="relative">
                <p className="text-[10px] font-semibold mb-1.5" style={{ color: "var(--text-faint)" }}>Ícone</p>
                <button onClick={() => setShowEmojis((v) => !v)}
                  className="w-9 h-9 rounded-xl text-xl flex items-center justify-center transition-all"
                  style={{ background: `${corEdit}22`, border: `2px solid ${corEdit}55` }}
                  title="Escolher ícone">
                  {emojiEdit || nomeEdit.slice(0,2).toUpperCase() || "?"}
                </button>
                {showEmojis && (
                  <div className="absolute left-0 top-full mt-1 rounded-xl z-40 p-2"
                    style={{ background: "var(--bg-dropdown)", border: "1px solid var(--border-default)", boxShadow: "0 8px 32px rgba(0,0,0,0.22)", width: 200 }}>
                    <div className="flex flex-wrap gap-0.5">
                      {EMOJIS_OPCAO.map((em) => (
                        <button key={em} onClick={() => { setEmojiEdit(em); setShowEmojis(false); }}
                          className="w-8 h-8 rounded-lg text-lg flex items-center justify-center transition-all hover:scale-110"
                          style={{ background: emojiEdit === em ? `${corEdit}30` : "transparent" }}>
                          {em}
                        </button>
                      ))}
                      <button onClick={() => { setEmojiEdit(""); setShowEmojis(false); }}
                        className="w-8 h-8 rounded-lg text-[9px] font-black flex items-center justify-center"
                        style={{ background: emojiEdit === "" ? `${corEdit}30` : "transparent", color: "var(--text-muted)" }}>
                        Aa
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Seletor de cor */}
              <div className="flex-1">
                <p className="text-[10px] font-semibold mb-1.5" style={{ color: "var(--text-faint)" }}>Cor</p>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {CORES_OPCAO.map((c) => (
                    <button key={c} onClick={() => setCorEdit(c)}
                      className="w-5 h-5 rounded-full transition-transform"
                      style={{ background: c, outline: corEdit === c ? `2px solid ${c}` : "none", outlineOffset: 2, transform: corEdit === c ? "scale(1.2)" : "scale(1)" }} />
                  ))}
                </div>
              </div>
            </div>}
            <div className="flex gap-2 justify-end">
              <button onClick={() => setEditandoNome(false)}
                className="px-3 py-1 text-xs rounded-lg transition-colors"
                style={{ color: "var(--text-muted)" }}>Cancelar</button>
              <button onClick={salvarNome} className="btn-neon px-3 py-1 text-xs rounded-lg">Salvar</button>
            </div>
          </div>
        )}
      </div>

      {/* Botão / Card nova tarefa */}
      <div className="shrink-0" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
        {!mostrarForm ? (
          <button onClick={() => setMostrarForm(true)}
            className="flex items-center gap-2 px-3 py-2.5 text-xs font-medium transition-colors w-full text-left"
            style={{ color: "#7c3aed" }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "var(--bg-statusbar)")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "transparent")}>
            <Plus size={12} /> Adicionar uma tarefa
          </button>
        ) : (
          <div className="p-2">
            <CardTarefa onSalvar={adicionar} onCancelar={() => setMostrarForm(false)} />
          </div>
        )}
      </div>

      {/* Tarefas pendentes */}
      <div className="flex-1 overflow-y-auto px-2 py-1" style={{ maxHeight: "calc(100vh - 290px)" }}>
        {pendentes.length === 0 && feitas.length === 0 && (
          <p className="text-center py-6 text-xs" style={{ color: "var(--text-faint)" }}>Nenhuma tarefa ainda.</p>
        )}

        {pendentes.map((t) => (
          <div key={t.id}>
            {editandoId === t.id ? (
              <div className="py-1">
                <CardTarefa inicial={t} labelBotao="Salvar"
                  onSalvar={(c) => salvarEdicao(t.id, c)}
                  onCancelar={() => setEditandoId(null)} />
              </div>
            ) : (
              <TarefaItem tarefa={t} listaId={lista.id}
                onToggle={() => toggle(t.id)}
                onDelete={() => deletar(t.id)}
                onEstrela={() => estrela(t.id)}
                onEdit={() => setEditandoId(t.id)}
                onToggleSub={(subId) => toggleSub(t.id, subId)}
                onDragHandleDown={onDragHandleDown}
                isDragging={draggingTarefa?.listaId === lista.id && draggingTarefa?.itemId === t.id}
              />
            )}
          </div>
        ))}

        {/* Concluídas */}
        {feitas.length > 0 && (
          <div className="pt-1">
            <button onClick={() => setConcluidas((v) => !v)}
              className="flex items-center gap-1.5 px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wide w-full rounded-lg transition-colors"
              style={{ color: "var(--text-faint)" }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "var(--bg-statusbar)")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "transparent")}>
              {concluidas ? <ChevronDown size={11} /> : <ChevronRight size={11} />}
              Concluídas ({feitas.length})
            </button>
            {concluidas && feitas.map((t) => (
              <TarefaItem key={t.id} tarefa={t} listaId={lista.id}
                onToggle={() => toggle(t.id)}
                onDelete={() => deletar(t.id)}
                onEstrela={() => estrela(t.id)}
                onEdit={() => setEditandoId(t.id)}
                onToggleSub={(subId) => toggleSub(t.id, subId)}
                onDragHandleDown={onDragHandleDown}
                isDragging={draggingTarefa?.listaId === lista.id && draggingTarefa?.itemId === t.id}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modal confirmar exclusão de coluna */}
      {confirmarExcluir && (
        <div className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)" }}
          onClick={() => setConfirmarExcluir(false)}>
          <div className="rounded-2xl p-6 flex flex-col gap-4 w-full max-w-sm mx-4"
            style={{ background: "var(--bg-dropdown)", border: "1px solid var(--border-default)", boxShadow: "0 24px 60px rgba(0,0,0,0.35)" }}
            onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-center">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                style={{ background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.25)" }}>
                <Trash2 size={22} style={{ color: "#f87171" }} />
              </div>
            </div>
            <div className="text-center">
              <p className="font-bold text-sm mb-1" style={{ color: "var(--text-heading)" }}>
                Excluir coluna?
              </p>
              <p className="text-xs leading-relaxed" style={{ color: "var(--text-muted)" }}>
                Tem certeza que quer excluir a coluna <strong style={{ color: "var(--text-heading)" }}>{lista.nome}</strong>?<br />
                {lista.tarefas.length > 0
                  ? <span style={{ color: "#f87171" }}>As {lista.tarefas.length} tarefa{lista.tarefas.length !== 1 ? "s" : ""} serão perdidas.</span>
                  : "Esta ação não pode ser desfeita."}
              </p>
            </div>
            <div className="flex gap-2 mt-1">
              <button onClick={() => setConfirmarExcluir(false)}
                className="flex-1 py-2 rounded-xl text-xs font-semibold transition-all"
                style={{ border: "1px solid var(--border-default)", color: "var(--text-muted)" }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "var(--bg-statusbar)")}
                onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "transparent")}>
                Cancelar
              </button>
              <button onClick={() => { setConfirmarExcluir(false); onDelete(); }}
                className="flex-1 py-2 rounded-xl text-xs font-bold transition-all"
                style={{ background: "rgba(239,68,68,0.15)", color: "#f87171", border: "1px solid rgba(239,68,68,0.3)" }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "rgba(239,68,68,0.28)")}
                onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "rgba(239,68,68,0.15)")}>
                Sim, excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── card reutilizável de nova/edit tarefa (estilo Google Tasks) ── */
function CardTarefa({
  inicial, onSalvar, onCancelar, labelBotao = "Adicionar tarefa",
}: {
  inicial?: Partial<Tarefa>;
  onSalvar: (t: Omit<Tarefa, "id" | "feita" | "estrela">) => void;
  onCancelar: () => void;
  labelBotao?: string;
}) {
  const [texto,    setTexto]    = useState(inicial?.texto    ?? "");
  const [desc,     setDesc]     = useState(inicial?.descricao ?? "");
  const [prazo,    setPrazo]    = useState(inicial?.prazo     ?? "");
  const [rec,      setRec]      = useState<Recorrencia>(inicial?.recorrencia ?? "nunca");
  const [prior,    setPrior]    = useState<Tarefa["prioridade"]>(inicial?.prioridade ?? "Normal");
  const [subs,     setSubs]     = useState<Subtarefa[]>(inicial?.subtarefas ?? []);
  const [subTxt,   setSubTxt]   = useState("");
  const dateRef = useRef<HTMLInputElement>(null);

  const hoje   = new Date().toISOString().split("T")[0];
  const amanha = (() => { const d = new Date(); d.setDate(d.getDate()+1); return d.toISOString().split("T")[0]; })();

  function addSub() {
    if (!subTxt.trim()) return;
    setSubs((p) => [...p, { id: uid(), texto: subTxt.trim(), feita: false }]);
    setSubTxt("");
  }

  function salvar() {
    if (!texto.trim()) return;
    onSalvar({ texto: texto.trim(), descricao: desc.trim() || undefined, prazo: prazo || undefined, recorrencia: rec !== "nunca" ? rec : undefined, prioridade: prior, subtarefas: subs.length ? subs : undefined });
  }

  return (
    <div className="rounded-xl overflow-hidden" style={{ border: "1.5px solid #a78bfa", background: "var(--bg-surface)" }}>

      {/* Título */}
      <div className="flex items-center gap-3 px-4 py-3" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
        <div className="w-4 h-4 rounded-full border-2 shrink-0" style={{ borderColor: "var(--border-default)" }} />
        <input autoFocus
          className="flex-1 bg-transparent text-sm outline-none font-medium"
          style={{ color: "var(--text-heading)" }}
          placeholder="Título"
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") salvar(); if (e.key === "Escape") onCancelar(); }}
        />
      </div>

      {/* Detalhes */}
      <div className="flex items-start gap-3 px-4 py-2.5" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
        <svg className="shrink-0 mt-0.5" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: "var(--text-faint)" }}>
          <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/>
          <line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
        </svg>
        <input
          className="flex-1 bg-transparent text-xs outline-none"
          style={{ color: "var(--text-muted)" }}
          placeholder="Detalhes"
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
        />
      </div>

      {/* Subtarefas */}
      <div style={{ borderBottom: "1px solid var(--border-subtle)" }}>
        <div className="flex items-center gap-3 px-4 py-2.5">
          <ListTodo size={14} className="shrink-0" style={{ color: "var(--text-secondary)" }} />
          <input
            className="flex-1 bg-transparent text-xs outline-none"
            style={{ color: "var(--text-primary)" }}
            placeholder="Adicionar subtarefa"
            value={subTxt}
            onChange={(e) => setSubTxt(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addSub(); } }}
          />
          {subTxt && (
            <button onClick={addSub} className="text-[10px] px-2 py-0.5 rounded-full font-semibold shrink-0"
              style={{ background: "rgba(124,58,237,0.15)", color: "#a78bfa" }}>+ Add</button>
          )}
        </div>
        {subs.map((s) => (
          <div key={s.id} className="flex items-center gap-3 pl-10 pr-4 py-1.5">
            <div className="w-3.5 h-3.5 rounded-full border shrink-0" style={{ borderColor: "var(--border-default)" }} />
            <span className="flex-1 text-xs" style={{ color: "var(--text-primary)" }}>{s.texto}</span>
            <button onClick={() => setSubs((p) => p.filter((x) => x.id !== s.id))}
              style={{ color: "var(--text-secondary)", fontSize: 10 }}>✕</button>
          </div>
        ))}
      </div>

      {/* Chips: Hoje / Amanhã / 📅 / ↻ / Prioridade */}
      <div className="flex items-center gap-1.5 px-4 py-2.5 flex-wrap" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
        <button onClick={() => setPrazo(prazo === hoje ? "" : hoje)}
          className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all whitespace-nowrap"
          style={{ background: prazo === hoje ? "rgba(124,58,237,0.18)" : "var(--bg-statusbar)", color: prazo === hoje ? "#a78bfa" : "var(--text-muted)", border: `1px solid ${prazo === hoje ? "#a78bfa" : "var(--border-default)"}` }}>
          Hoje
        </button>
        <button onClick={() => setPrazo(prazo === amanha ? "" : amanha)}
          className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all whitespace-nowrap"
          style={{ background: prazo === amanha ? "rgba(124,58,237,0.18)" : "var(--bg-statusbar)", color: prazo === amanha ? "#a78bfa" : "var(--text-muted)", border: `1px solid ${prazo === amanha ? "#a78bfa" : "var(--border-default)"}` }}>
          Amanhã
        </button>

        {/* Botão Data — abre picker via ref */}
        <div className="relative">
          <button onClick={() => dateRef.current?.showPicker?.() ?? dateRef.current?.click()}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all whitespace-nowrap"
            style={{ background: prazo && prazo !== hoje && prazo !== amanha ? "rgba(124,58,237,0.18)" : "var(--bg-statusbar)", color: prazo && prazo !== hoje && prazo !== amanha ? "#a78bfa" : "var(--text-muted)", border: `1px solid ${prazo && prazo !== hoje && prazo !== amanha ? "#a78bfa" : "var(--border-default)"}` }}>
            <Calendar size={11} />
            {prazo && prazo !== hoje && prazo !== amanha
              ? new Date(prazo + "T12:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })
              : "Data"}
          </button>
          <input ref={dateRef} type="date" value={prazo} onChange={(e) => setPrazo(e.target.value)}
            style={{ position: "absolute", opacity: 0, pointerEvents: "none", width: 0, height: 0, top: "100%", left: 0 }} />
        </div>

        <select value={rec} onChange={(e) => setRec(e.target.value as Recorrencia)}
          className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold appearance-none cursor-pointer outline-none transition-all whitespace-nowrap"
          style={{ background: rec !== "nunca" ? "rgba(124,58,237,0.18)" : "var(--bg-statusbar)", color: rec !== "nunca" ? "#a78bfa" : "var(--text-muted)", border: `1px solid ${rec !== "nunca" ? "#a78bfa" : "var(--border-default)"}` }}>
          <option value="nunca">↻ Repetir</option>
          <option value="diaria">Diária</option>
          <option value="semanal">Semanal</option>
          <option value="mensal">Mensal</option>
        </select>
        <select value={prior} onChange={(e) => setPrior(e.target.value as Tarefa["prioridade"])}
          className="px-2.5 py-1 rounded-full text-[11px] font-semibold appearance-none cursor-pointer outline-none transition-all whitespace-nowrap"
          style={{ background: "var(--bg-statusbar)", color: "var(--text-muted)", border: "1px solid var(--border-default)" }}>
          <option>Alta</option><option>Normal</option><option>Baixa</option>
        </select>
      </div>

      {/* Ações */}
      <div className="flex items-center justify-end gap-2 px-4 py-2.5">
        <button onClick={onCancelar}
          className="px-3 py-1.5 text-xs rounded-lg transition-colors font-medium"
          style={{ color: "var(--text-muted)" }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--text-heading)")}
          onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--text-muted)")}>
          Cancelar
        </button>
        <button onClick={salvar} className="btn-neon px-4 py-1.5 text-xs rounded-lg font-semibold">
          {labelBotao}
        </button>
      </div>
    </div>
  );
}

/* ─── aba pessoal: colunas temáticas privadas ───────────────── */
function AbaPessoal() {
  const [listas,      setListas]    = useState<Lista[]>(PESSOAIS_INICIAL);
  const [novaLista,   setNovaLista] = useState(false);
  const [nomeNova,    setNomeNova]  = useState("");

  const dragRef = useRef<{
    kind: DragKind; listaId: string; itemId?: string;
    ghost: HTMLDivElement; offsetX: number; offsetY: number;
  } | null>(null);
  const [draggingTarefa, setDraggingTarefa] = useState<{ listaId: string; itemId: string } | null>(null);
  const [draggingColuna, setDraggingColuna] = useState<string | null>(null);

  const handleTarefaDragDown = useCallback((e: React.PointerEvent, listaId: string, itemId: string) => {
    e.preventDefault();
    const el = (e.currentTarget as HTMLElement).closest("[data-tarefa-id]") as HTMLElement | null;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const ghost = document.createElement("div");
    ghost.style.cssText = `position:fixed;z-index:9999;pointer-events:none;width:${rect.width}px;height:${rect.height}px;left:${rect.left}px;top:${rect.top}px;background:var(--bg-surface,#fff);border:1.5px solid #a78bfa;border-radius:10px;box-shadow:0 8px 24px rgba(0,0,0,0.18);opacity:0.92;font-size:11px;display:flex;align-items:center;padding:8px 12px;color:var(--text-heading,#111);`;
    ghost.textContent = el.querySelector("p")?.textContent ?? "";
    document.body.appendChild(ghost);
    dragRef.current = { kind: "tarefa", listaId, itemId, ghost, offsetX: e.clientX - rect.left, offsetY: e.clientY - rect.top };
    setDraggingTarefa({ listaId, itemId });
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, []);

  const handleColunaDragDown = useCallback((e: React.PointerEvent, listaId: string) => {
    e.preventDefault();
    const el = (e.currentTarget as HTMLElement).closest("[data-lista-id]") as HTMLElement | null;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const ghost = document.createElement("div");
    ghost.style.cssText = `position:fixed;z-index:9999;pointer-events:none;width:${rect.width}px;height:60px;left:${rect.left}px;top:${rect.top}px;background:var(--bg-surface,#fff);border:1.5px solid #a78bfa;border-radius:12px;box-shadow:0 10px 30px rgba(0,0,0,0.2);opacity:0.88;`;
    document.body.appendChild(ghost);
    dragRef.current = { kind: "coluna", listaId, ghost, offsetX: e.clientX - rect.left, offsetY: e.clientY - rect.top };
    setDraggingColuna(listaId);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    const d = dragRef.current;
    if (!d) return;
    d.ghost.style.left = `${e.clientX - d.offsetX}px`;
    d.ghost.style.top  = `${e.clientY - d.offsetY}px`;
  }, []);

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    const d = dragRef.current;
    if (!d) return;
    d.ghost.remove(); dragRef.current = null;
    setDraggingTarefa(null); setDraggingColuna(null);
    const target = document.elementFromPoint(e.clientX, e.clientY);
    if (!target) return;
    if (d.kind === "tarefa") {
      const destLista = (target as HTMLElement)?.closest("[data-lista-id]")?.getAttribute("data-lista-id");
      const destItem  = (target as HTMLElement)?.closest("[data-tarefa-id]")?.getAttribute("data-tarefa-id");
      if (!destLista) return;
      setListas((prev) => {
        const next = prev.map((l) => ({ ...l, tarefas: [...l.tarefas] }));
        const src  = next.find((l) => l.id === d.listaId);
        const dst  = next.find((l) => l.id === destLista);
        if (!src || !dst) return prev;
        const fi = src.tarefas.findIndex((t) => t.id === d.itemId);
        if (fi === -1) return prev;
        const [item] = src.tarefas.splice(fi, 1);
        if (src.id === dst.id && destItem) {
          const ti = dst.tarefas.findIndex((t) => t.id === destItem);
          dst.tarefas.splice(ti >= 0 ? ti : dst.tarefas.length, 0, item);
        } else {
          dst.tarefas.unshift(item);
        }
        return next;
      });
    } else {
      const destId = (target as HTMLElement)?.closest("[data-lista-id]")?.getAttribute("data-lista-id");
      if (!destId || destId === d.listaId) return;
      setListas((prev) => {
        const next = [...prev];
        const fi = next.findIndex((l) => l.id === d.listaId);
        const ti = next.findIndex((l) => l.id === destId);
        const [col] = next.splice(fi, 1);
        next.splice(ti, 0, col);
        return next;
      });
    }
  }, []);

  function updateLista(lista: Lista) {
    setListas((prev) => prev.map((l) => l.id === lista.id ? lista : l));
  }

  function deletarLista(id: string) {
    setListas((prev) => prev.filter((l) => l.id !== id));
  }

  function criarLista() {
    if (!nomeNova.trim() || listas.length >= 4) return;
    const cores = ["#7c3aed","#0ea5e9","#10b981","#f59e0b"];
    const cor   = cores[listas.length % cores.length];
    const ini   = nomeNova.trim().split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase();
    setListas((prev) => [...prev, { id: uid(), nome: nomeNova.trim(), avatar: ini, cor, tarefas: [] }]);
    setNomeNova(""); setNovaLista(false);
  }

  return (
    <div className="flex flex-col gap-3" onPointerMove={handlePointerMove} onPointerUp={handlePointerUp}>
      {/* Botão nova lista */}
      {listas.length < 4 && !novaLista && (
        <div className="flex justify-end shrink-0">
          <button onClick={() => setNovaLista(true)}
            className="flex items-center gap-1.5 btn-neon px-4 py-2 text-xs shrink-0">
            <Plus size={13} /> Nova lista
          </button>
        </div>
      )}
      {novaLista && (
        <div className="flex gap-2 items-center shrink-0 flex-wrap">
          <input autoFocus
            className="nexus-input text-xs flex-1 max-w-xs"
            style={{ paddingTop: "0.5rem", paddingBottom: "0.5rem" }}
            placeholder="Nome da lista (ex: Semanal, Projetos…)"
            value={nomeNova}
            onChange={(e) => setNomeNova(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") criarLista(); if (e.key === "Escape") setNovaLista(false); }}
          />
          <button onClick={criarLista} className="btn-neon px-4 py-2 text-xs">Criar</button>
          <button onClick={() => setNovaLista(false)}
            className="px-3 py-2 text-xs rounded-xl"
            style={{ background: "var(--bg-surface)", border: "1px solid var(--border-default)", color: "var(--text-muted)" }}>
            Cancelar
          </button>
        </div>
      )}

      {/* Colunas */}
      <div className="flex gap-4 overflow-x-auto pb-4 shrink-0" style={{ scrollbarWidth: "thin" }}>
        {listas.map((lista) => (
          <Coluna
            key={lista.id}
            lista={lista}
            onChange={updateLista}
            onDelete={() => deletarLista(lista.id)}
            onColumnDragHandleDown={handleColunaDragDown}
            isDragging={draggingColuna === lista.id}
            onDragHandleDown={handleTarefaDragDown}
            draggingTarefa={draggingTarefa}
            modo="pessoal"
            pasteIdx={listas.indexOf(lista)}
          />
        ))}
      </div>
    </div>
  );
}

/* ─── página principal com drag-and-drop via pointer events ──── */
export default function Tarefas() {
  const [aba, setAba]             = useState<"pessoal" | "equipe">("pessoal");
  const [listas, setListas]       = useState<Lista[]>(LISTAS_INICIAL);
  const [novaLista, setNovaLista] = useState(false);
  const [nomeNova, setNomeNova]   = useState("");

  /* estado de drag */
  const dragRef = useRef<{
    kind: DragKind;
    listaId: string;
    itemId?: string;
    ghost: HTMLDivElement;
    offsetX: number;
    offsetY: number;
  } | null>(null);
  const [draggingTarefa, setDraggingTarefa] = useState<{ listaId: string; itemId: string } | null>(null);
  const [draggingColuna, setDraggingColuna] = useState<string | null>(null);

  /* ── iniciar drag de tarefa ── */
  const handleTarefaDragDown = useCallback((
    e: React.PointerEvent, listaId: string, itemId: string
  ) => {
    e.preventDefault();
    const el = (e.currentTarget as HTMLElement).closest("[data-tarefa-id]") as HTMLElement | null;
    if (!el) return;
    const rect = el.getBoundingClientRect();

    const ghost = document.createElement("div");
    ghost.style.cssText = `
      position:fixed; z-index:9999; pointer-events:none;
      width:${rect.width}px; height:${rect.height}px;
      left:${rect.left}px; top:${rect.top}px;
      background:var(--bg-surface,#fff); border:1.5px solid #a78bfa;
      border-radius:10px; box-shadow:0 8px 24px rgba(0,0,0,0.18);
      opacity:0.92; font-size:11px; display:flex; align-items:center;
      padding:8px 12px; color:var(--text-heading,#111);
      transition: none;
    `;
    ghost.textContent = el.querySelector("p")?.textContent ?? "";
    document.body.appendChild(ghost);

    dragRef.current = { kind: "tarefa", listaId, itemId, ghost, offsetX: e.clientX - rect.left, offsetY: e.clientY - rect.top };
    setDraggingTarefa({ listaId, itemId });
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, []);

  /* ── iniciar drag de coluna ── */
  const handleColunaDragDown = useCallback((e: React.PointerEvent, listaId: string) => {
    e.preventDefault();
    const el = (e.currentTarget as HTMLElement).closest("[data-lista-id]") as HTMLElement | null;
    if (!el) return;
    const rect = el.getBoundingClientRect();

    const ghost = document.createElement("div");
    ghost.style.cssText = `
      position:fixed; z-index:9999; pointer-events:none;
      width:${rect.width}px; height:60px;
      left:${rect.left}px; top:${rect.top}px;
      background:var(--bg-surface,#fff); border:1.5px solid #a78bfa;
      border-radius:12px; box-shadow:0 10px 30px rgba(0,0,0,0.2);
      opacity:0.88;
    `;
    document.body.appendChild(ghost);

    dragRef.current = { kind: "coluna", listaId, ghost, offsetX: e.clientX - rect.left, offsetY: e.clientY - rect.top };
    setDraggingColuna(listaId);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, []);

  /* ── mover ── */
  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    const d = dragRef.current;
    if (!d) return;
    d.ghost.style.left = `${e.clientX - d.offsetX}px`;
    d.ghost.style.top  = `${e.clientY - d.offsetY}px`;
  }, []);

  /* ── soltar ── */
  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    const d = dragRef.current;
    if (!d) return;
    d.ghost.remove();
    dragRef.current = null;
    setDraggingTarefa(null);
    setDraggingColuna(null);

    // Encontra o elemento alvo sob o ghost (desativamos pointer-events no ghost, então funciona)
    const target = document.elementFromPoint(e.clientX, e.clientY);
    if (!target) return;

    if (d.kind === "tarefa") {
      const tarefaEl  = (target as HTMLElement).closest("[data-tarefa-id]") as HTMLElement | null;
      const listaEl   = (target as HTMLElement).closest("[data-lista-id]")  as HTMLElement | null;
      const destListaId = listaEl?.dataset.listaId;
      const destItemId  = tarefaEl?.dataset.tarefaId;

      if (!destListaId || destListaId === d.listaId && destItemId === d.itemId) return;

      setListas((prev) => {
        const next = prev.map((l) => ({ ...l, tarefas: [...l.tarefas] }));
        const srcLista  = next.find((l) => l.id === d.listaId);
        const destLista = next.find((l) => l.id === destListaId);
        if (!srcLista || !destLista) return prev;

        const srcIdx = srcLista.tarefas.findIndex((t) => t.id === d.itemId);
        if (srcIdx === -1) return prev;
        const [item] = srcLista.tarefas.splice(srcIdx, 1);

        if (destItemId && destListaId === d.listaId) {
          // reordenar na mesma lista
          const destIdx = srcLista.tarefas.findIndex((t) => t.id === destItemId);
          srcLista.tarefas.splice(destIdx, 0, item);
        } else if (destItemId) {
          // mover para outra lista na posição
          const destIdx = destLista.tarefas.findIndex((t) => t.id === destItemId);
          destLista.tarefas.splice(destIdx, 0, item);
        } else {
          // jogou na lista mas não sobre um item → empurra pro final
          destLista.tarefas.push(item);
        }
        return next;
      });

    } else {
      // coluna
      const listaEl = (target as HTMLElement).closest("[data-lista-id]") as HTMLElement | null;
      const destId  = listaEl?.dataset.listaId;
      if (!destId || destId === d.listaId) return;

      setListas((prev) => {
        const next = [...prev];
        const fi = next.findIndex((l) => l.id === d.listaId);
        const ti = next.findIndex((l) => l.id === destId);
        const [col] = next.splice(fi, 1);
        next.splice(ti, 0, col);
        return next;
      });
    }
  }, []);

  function updateLista(lista: Lista) {
    setListas((prev) => prev.map((l) => l.id === lista.id ? lista : l));
  }

  function deletarLista(id: string) {
    setListas((prev) => prev.filter((l) => l.id !== id));
  }

  function criarLista() {
    if (!nomeNova.trim() || listas.length >= 4) return;
    const cores = ["#7c3aed", "#0ea5e9", "#10b981", "#f59e0b"];
    const cor   = cores[listas.length % cores.length];
    const ini   = nomeNova.trim().split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase();
    setListas((prev) => [...prev, { id: uid(), nome: nomeNova.trim(), avatar: ini, cor, tarefas: [] }]);
    setNomeNova(""); setNovaLista(false);
  }

  const pendEquipe = listas.reduce((a, l) => a + l.tarefas.filter((t) => !t.feita).length, 0);

  return (
    <div
      className="flex flex-col h-full gap-4"
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      {/* Cabeçalho */}
      <div className="shrink-0">
        <h2 className="font-black text-lg tracking-tight" style={{ color: "var(--text-heading)" }}>Tarefas</h2>
      </div>

      {/* Abas */}
      <div className="flex items-center gap-1 p-1 rounded-xl shrink-0" style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)", width: "fit-content" }}>
        <button onClick={() => { setAba("pessoal"); setNovaLista(false); }}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all"
          style={{
            background: aba === "pessoal" ? "rgba(124,58,237,0.15)" : "transparent",
            color:      aba === "pessoal" ? "#a78bfa" : "var(--text-muted)",
            border:     aba === "pessoal" ? "1px solid rgba(124,58,237,0.3)" : "1px solid transparent",
          }}>
          <Lock size={12} /> Pessoal
        </button>
        <button onClick={() => { setAba("equipe"); setNovaLista(false); }}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all"
          style={{
            background: aba === "equipe" ? "rgba(124,58,237,0.15)" : "transparent",
            color:      aba === "equipe" ? "#a78bfa" : "var(--text-muted)",
            border:     aba === "equipe" ? "1px solid rgba(124,58,237,0.3)" : "1px solid transparent",
          }}>
          <Users size={12} /> Equipe
          {pendEquipe > 0 && (
            <span className="w-4 h-4 rounded-full text-[9px] font-black flex items-center justify-center bg-violet-500 text-white">
              {pendEquipe}
            </span>
          )}
        </button>
      </div>

      {/* Descrição da aba */}
      <p className="text-[11px] shrink-0 -mt-2" style={{ color: "var(--text-faint)" }}>
        {aba === "pessoal"
          ? "Só você vê estas tarefas — notas pessoais, passos simples, lembretes do dia."
          : "Visível para toda a equipe — demandas compartilhadas, chamados, projetos em grupo."}
      </p>

      {/* Conteúdo da aba pessoal */}
      {aba === "pessoal" && <AbaPessoal />}

      {/* Conteúdo da aba equipe */}
      {aba === "equipe" && (
        <>
          {/* Botão nova lista */}
          {listas.length < 4 && !novaLista && (
            <div className="flex justify-end shrink-0">
              <button onClick={() => setNovaLista(true)}
                className="flex items-center gap-1.5 btn-neon px-4 py-2 text-xs shrink-0">
                <Plus size={13} /> Nova lista
              </button>
            </div>
          )}

          {/* Form nova lista */}
          {novaLista && (
            <div className="flex gap-2 items-center shrink-0 flex-wrap">
              <input autoFocus
                className="nexus-input text-xs flex-1 max-w-xs"
                style={{ paddingTop: "0.5rem", paddingBottom: "0.5rem" }}
                placeholder="Nome da pessoa (ex: Fernanda Reis)"
                value={nomeNova}
                onChange={(e) => setNomeNova(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") criarLista(); if (e.key === "Escape") setNovaLista(false); }}
              />
              <button onClick={criarLista} className="btn-neon px-4 py-2 text-xs">Criar</button>
              <button onClick={() => setNovaLista(false)}
                className="px-3 py-2 text-xs rounded-xl"
                style={{ background: "var(--bg-surface)", border: "1px solid var(--border-default)", color: "var(--text-muted)" }}>
                Cancelar
              </button>
            </div>
          )}

          {/* Colunas da equipe */}
          <div className="flex gap-4 overflow-x-auto pb-4 shrink-0" style={{ scrollbarWidth: "thin" }}>
            {listas.map((lista) => (
              <Coluna
                key={lista.id}
                lista={lista}
                onChange={updateLista}
                onDelete={() => deletarLista(lista.id)}
                onColumnDragHandleDown={handleColunaDragDown}
                isDragging={draggingColuna === lista.id}
                onDragHandleDown={handleTarefaDragDown}
                draggingTarefa={draggingTarefa}
                modo="equipe"
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
