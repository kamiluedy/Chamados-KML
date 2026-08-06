"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  X, Send, Paperclip, Image as ImageIcon, CheckCircle2,
  AlertTriangle, Lock, Calendar,
  FileText, Download, ShieldCheck,
  ThumbsUp, CircleDot, UserPlus, UserMinus,
  ChevronDown, Tag, Users,
} from "lucide-react";
import { useChamados, type Chamado, type Prioridade, type Status as StatusChamado, type Mensagem } from "@/lib/chamados-store";

/* ── Helpers visuais ── */
const PRIOR_STYLE: Record<Prioridade, string> = {
  "Crítica": "bg-rose-500/15 text-rose-400 border-rose-500/30",
  "Alta":    "bg-orange-500/15 text-orange-400 border-orange-500/30",
  "Média":   "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
  "Baixa":   "bg-sky-500/15 text-sky-400 border-sky-500/30",
};

const STATUS_LABEL: Record<StatusChamado, string> = {
  todo:       "A Fazer",
  doing:      "Em Progresso",
  done:       "Encerrado",
  aguardando: "Aguard. Solicitante",
};

const STATUS_STYLE: Record<StatusChamado, string> = {
  todo:       "bg-zinc-500/15 text-zinc-400 border-zinc-500/30",
  doing:      "bg-blue-500/15 text-blue-400 border-blue-500/30",
  done:       "bg-zinc-900/80 text-zinc-100 border-zinc-700/60",
  aguardando: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
};

/* ── Papel do usuário atual (simulado) ── */
type Papel = "admin" | "analista" | "tecnico" | "solicitante";
const PAPEL_ATUAL: Papel = "admin"; // trocar para testar outros papéis

const PAPEL_LABEL: Record<Papel, string> = {
  admin:      "Administrador",
  analista:   "Analista",
  tecnico:    "Técnico",
  solicitante:"Solicitante",
};

const PAPEL_COR: Record<Papel, { bg: string; text: string; border: string }> = {
  admin:      { bg: "#fef3c7", text: "#92400e", border: "#fcd34d" },
  analista:   { bg: "#ede9fe", text: "#5b21b6", border: "#c4b5fd" },
  tecnico:    { bg: "#dbeafe", text: "#1e40af", border: "#93c5fd" },
  solicitante:{ bg: "#f0fdf4", text: "#166534", border: "#86efac" },
};

/* ── Pool de técnicos disponíveis por grupo ── */
interface TecnicoComPapel {
  id: string; nome: string; avatar: string; papel: Papel; setor: string;
}

const TODOS_TECNICOS: TecnicoComPapel[] = [
  { id: "t1", nome: "Kamila Luedy",    avatar: "KL", papel: "admin",    setor: "TI / Dados"       },
  { id: "t2", nome: "Marcos Vinicius", avatar: "MV", papel: "analista", setor: "Dados & BI"        },
  { id: "t3", nome: "Ana Cláudia",     avatar: "AC", papel: "tecnico",  setor: "Infraestrutura"    },
  { id: "t4", nome: "Fernanda Reis",   avatar: "FR", papel: "tecnico",  setor: "Suporte"           },
  { id: "t5", nome: "Pedro Mota",      avatar: "PM", papel: "tecnico",  setor: "Infraestrutura"    },
  { id: "t6", nome: "Julio Andrade",   avatar: "JA", papel: "analista", setor: "TI / Dados"        },
];

const GRUPOS_DISPONIVEIS = [
  "TI / Infraestrutura",
  "Suporte / Acesso",
  "Dados & Automação",
  "RH / Administrativo",
  "Financeiro",
];

const CATEGORIAS_DISPONIVEIS = [
  "Banco", "Rede", "Hardware", "Acesso", "Automação", "Software",
];

function papelDoTecnico(id: string): Papel {
  const t = TODOS_TECNICOS.find((t) => t.id === id);
  return t?.papel ?? "tecnico";
}

/* ── Componente principal ── */
export default function ChamadoDetalhe({ chamado, onClose }: { chamado: Chamado; onClose: () => void }) {
  const { updateChamado } = useChamados();
  const [texto, setTexto]           = useState("");
  const [previsao, setPrevisao]     = useState("2026-06-24");
  const [aprovando, setAprovando]   = useState(false);
  const [aprovado, setAprovado]     = useState(false);
  const [modalAprovacao, setModalAprovacao] = useState(false);
  const [msgAprovacao, setMsgAprovacao]     = useState("");
  const [menuResponder, setMenuResponder]   = useState(false);
  const menuResponderRef                    = useRef<HTMLDivElement>(null);
  const chatEndRef                          = useRef<HTMLDivElement>(null);
  const fileInputRef                        = useRef<HTMLInputElement>(null);
  const onCloseRef                          = useRef(onClose);

  const mensagens   = chamado.mensagens;
  const prioridade  = chamado.prioridade;
  const status      = chamado.status;
  const pendente    = chamado.pendente;
  const obsInternas = chamado.obsInternas;

  function setMensagens(updater: (prev: Mensagem[]) => Mensagem[]) {
    updateChamado(chamado.id, { mensagens: updater(chamado.mensagens) });
  }
  function setPrioridade(p: Prioridade) { updateChamado(chamado.id, { prioridade: p }); }
  function setStatus(s: StatusChamado) { updateChamado(chamado.id, { status: s }); }
  function setPendente(v: boolean | ((prev: boolean) => boolean)) {
    updateChamado(chamado.id, { pendente: typeof v === "function" ? v(chamado.pendente) : v });
  }
  function setObsInternas(v: string) { updateChamado(chamado.id, { obsInternas: v }); }

  /* Técnicos atribuídos — vêm do store, exibidos com papel simulado */
  const [showAddTec, setShowAddTec] = useState(false);
  const addTecRef = useRef<HTMLDivElement>(null);
  const tecAtribuidos: TecnicoComPapel[] = chamado.tecnicosAtribuidos.map((t) => ({ ...t, papel: papelDoTecnico(t.id) }));

  function setTecAtribuidos(updater: (prev: TecnicoComPapel[]) => TecnicoComPapel[]) {
    const next = updater(tecAtribuidos).map((t) => ({ id: t.id, nome: t.nome, avatar: t.avatar, setor: t.setor }));
    updateChamado(chamado.id, { tecnicosAtribuidos: next });
  }

  /* Categoria / grupo editáveis (Admin + Analista) */
  const [categoriaEdit, setCategoriaEditState] = useState(chamado.categoria);
  const [grupoEdit, setGrupoEditState]         = useState(chamado.grupoCategoria ?? "TI / Infraestrutura");
  function setCategoriaEdit(v: string) { setCategoriaEditState(v); updateChamado(chamado.id, { categoria: v }); }
  function setGrupoEdit(v: string) { setGrupoEditState(v); updateChamado(chamado.id, { grupoCategoria: v }); }

  /* Fechar dropdowns ao clicar fora */
  useEffect(() => {
    function handle(e: MouseEvent) {
      if (addTecRef.current && !addTecRef.current.contains(e.target as Node)) setShowAddTec(false);
      if (menuResponderRef.current && !menuResponderRef.current.contains(e.target as Node)) setMenuResponder(false);
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  const podeManejarTecnicos = PAPEL_ATUAL === "admin" || PAPEL_ATUAL === "analista";
  const podeEditarCatGrupo  = PAPEL_ATUAL === "admin" || PAPEL_ATUAL === "analista";

  function adicionarTecnico(tec: TecnicoComPapel) {
    if (!tecAtribuidos.find((t) => t.id === tec.id)) {
      setTecAtribuidos((prev) => [...prev, tec]);
    }
    setShowAddTec(false);
  }

  function removerTecnico(id: string) {
    setTecAtribuidos((prev) => prev.filter((t) => t.id !== id));
  }

  const tecDisponiveis = TODOS_TECNICOS.filter((t) => !tecAtribuidos.find((a) => a.id === t.id));

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensagens]);

  useEffect(() => { onCloseRef.current = onClose; });

  function enviar() {
    if (!texto.trim()) return;
    const nova: Mensagem = {
      id: `m${Date.now()}`, autor: "Kamila L.", avatar: "KL",
      tipo: "tecnico", texto: texto.trim(), hora: "agora",
    };
    setMensagens((prev) => [...prev, nova]);
    setTexto("");
  }

  function anexarArquivo(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const tipo = file.type.startsWith("image/") ? "img" : file.name.endsWith(".pdf") ? "pdf" : "outro";
    const nova: Mensagem = {
      id: `m${Date.now()}`, autor: "Kamila L.", avatar: "KL",
      tipo: "tecnico", texto: "Arquivo anexado:", hora: "agora",
      arquivo: { nome: file.name, tipo },
    };
    setMensagens((prev) => [...prev, nova]);
    e.target.value = "";
  }

  function encerrarComAprovacao() {
    if (!msgAprovacao.trim()) return;
    const msgTec: Mensagem = {
      id: `m${Date.now()}`, autor: "Kamila L.", avatar: "KL",
      tipo: "tecnico", texto: msgAprovacao.trim(), hora: "agora",
    };
    const sys: Mensagem = {
      id: `m${Date.now() + 1}`, autor: "Sistema", avatar: "S",
      tipo: "sistema", texto: "Chamado encerrado e marcado como Finalizado.", hora: "agora",
    };
    setMensagens((prev) => [...prev, msgTec, sys]);
    setStatus("done");
    setAprovado(true);
    setAprovando(false);
    setMsgAprovacao("");
    setModalAprovacao(false);
    window.setTimeout(() => { onCloseRef.current(); }, 1800);
  }

  return createPortal(
    /* Tela inteira sobre o conteúdo */
    <>
    <div
      className="fixed flex flex-col overflow-hidden"
      style={{ background: "#f3f4f6", inset: 0, top: 0, left: 0, right: 0, bottom: 0, width: "100vw", height: "100vh", zIndex: 9999 }}
    >
        {/* ── Topo ── */}
        <div className="flex items-center gap-4 px-6 py-4 shrink-0" style={{ borderBottom: "1px solid #e5e7eb", background: "#ffffff" }}>
          {/* Botão voltar */}
          <button onClick={onClose}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all shrink-0"
            style={{ background: "#f3f4f6", color: "#6b7280", border: "1px solid #e5e7eb" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#ede9fe"; (e.currentTarget as HTMLElement).style.color = "#7c3aed"; (e.currentTarget as HTMLElement).style.borderColor = "#c4b5fd"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "#f3f4f6"; (e.currentTarget as HTMLElement).style.color = "#6b7280"; (e.currentTarget as HTMLElement).style.borderColor = "#e5e7eb"; }}
          >
            <X size={14} /> Fechar
          </button>
          <div className="w-px h-8 shrink-0" style={{ background: "#e5e7eb" }} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono font-bold text-sm text-violet-600">{chamado.id}</span>
              <span className={`flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${STATUS_STYLE[status]}`}>
                <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: status === "done" ? "#111" : status === "doing" ? "#60a5fa" : status === "aguardando" ? "#fbbf24" : "#a1a1aa" }} />
                {STATUS_LABEL[status]}
              </span>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${PRIOR_STYLE[prioridade]}`}>{prioridade}</span>
            </div>
            <h3 className="font-black text-base mt-0.5 leading-snug text-gray-800">{chamado.titulo}</h3>
            <p className="text-[11px] mt-0.5 text-gray-400">
              {chamado.categoria} · {chamado.setor} · Aberto em {chamado.dataHora}
            </p>
          </div>
        </div>

        {/* ── Corpo ── */}
        <div className="flex flex-1 overflow-hidden">

          {/* Chat */}
          <div className="flex flex-col flex-1 overflow-hidden" style={{ background: "#f9fafb" }}>

            {/* Mensagens */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">

              {/* Descrição original */}
              <div className="rounded-xl p-4 mb-2" style={{ background: "#ede9fe", border: "1px solid #c4b5fd" }}>
                <p className="text-[10px] font-semibold uppercase tracking-wide mb-1.5 text-violet-600">Descrição do chamado</p>
                <p className="text-sm leading-relaxed text-gray-700">{chamado.descricao}</p>
              </div>

              {mensagens.map((m) => {
                if (m.tipo === "sistema") return (
                  <div key={m.id} className="flex items-center gap-2 justify-center">
                    <div className="h-px flex-1 bg-gray-200" />
                    <span className="text-[10px] px-2 text-gray-400">{m.texto} · {m.hora}</span>
                    <div className="h-px flex-1 bg-gray-200" />
                  </div>
                );

                const isTecnico = m.tipo === "tecnico";
                return (
                  <div key={m.id} className={`flex gap-3 ${isTecnico ? "flex-row-reverse" : "flex-row"}`}>
                    {/* Avatar */}
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-black text-white shrink-0 mt-1`}
                      style={{ background: isTecnico ? "linear-gradient(135deg,#7c3aed,#6d28d9)" : "linear-gradient(135deg,#0ea5e9,#0284c7)" }}>
                      {m.avatar}
                    </div>

                    {/* Balão */}
                    <div className={`max-w-[65%] ${isTecnico ? "items-end" : "items-start"} flex flex-col gap-1`}>
                      <div className="flex items-center gap-2">
                        {!isTecnico && <span className="text-[11px] font-semibold text-gray-500">{m.autor}</span>}
                        {isTecnico && (
                          <>
                            <span className="text-[10px] px-1.5 py-0.5 rounded font-bold bg-violet-100 text-violet-600">Técnico</span>
                            <span className="text-[11px] font-semibold text-gray-500">{m.autor}</span>
                          </>
                        )}
                      </div>
                      <div className="px-4 py-3"
                        style={{
                          background: isTecnico ? "#ede9fe" : "#ffffff",
                          border: `1px solid ${isTecnico ? "#c4b5fd" : "#e5e7eb"}`,
                          borderRadius: isTecnico ? "18px 4px 18px 18px" : "4px 18px 18px 18px",
                          boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
                        }}
                      >
                        <p className="text-sm leading-relaxed text-gray-800">{m.texto}</p>
                        {m.arquivo && (
                          <div className="flex items-center gap-2 mt-2 px-3 py-2 rounded-lg bg-gray-100 border border-gray-200">
                            {m.arquivo.tipo === "img" ? <ImageIcon size={14} className="text-sky-500 shrink-0" />
                              : <FileText size={14} className="text-violet-500 shrink-0" />}
                            <span className="text-xs font-medium flex-1 truncate text-gray-600">{m.arquivo.nome}</span>
                            <Download size={12} className="text-gray-400" />
                          </div>
                        )}
                      </div>
                      <span className="text-[10px] text-gray-400">{m.hora}</span>
                    </div>
                  </div>
                );
              })}

              {/* Banner de aprovação pendente */}
              {aprovando && !aprovado && (
                <div className="rounded-xl p-4 flex items-center gap-3 flex-wrap"
                  style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.3)" }}>
                  <AlertTriangle size={16} className="text-yellow-400 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold" style={{ color: "var(--text-heading)" }}>Aguardando aprovação do solicitante</p>
                    <p className="text-[11px] mt-0.5" style={{ color: "var(--text-faint)" }}>O solicitante deve confirmar que o problema foi resolvido.</p>
                  </div>
                  <button onClick={encerrarComAprovacao}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all shrink-0"
                    style={{ background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.35)", color: "#34d399" }}>
                    <ThumbsUp size={13} /> Confirmar resolução
                  </button>
                </div>
              )}

              {aprovado && (
                <div className="rounded-xl p-4 flex items-center gap-3"
                  style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.3)" }}>
                  <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                  <p className="text-xs font-semibold" style={{ color: "var(--text-heading)" }}>Chamado encerrado com aprovação do solicitante</p>
                </div>
              )}

              <div ref={chatEndRef} />
            </div>

            {/* Caixa de texto */}
            <div className="shrink-0 p-4 bg-white" style={{ borderTop: "1px solid #e5e7eb", borderBottom: "1px solid #e5e7eb" }}>
              <div className="rounded-xl overflow-hidden bg-gray-50" style={{ border: "1px solid #e5e7eb" }}>
                <textarea
                  rows={2}
                  className="w-full px-4 pt-3 pb-2 text-sm resize-none outline-none bg-transparent text-gray-800"
                  style={{ fontSize: "0.8125rem" }}
                  placeholder="Digite sua mensagem..."
                  value={texto}
                  onChange={(e) => setTexto(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); enviar(); } }}
                />
                <div className="flex items-center gap-1 px-3 pb-2">
                  <button onClick={() => fileInputRef.current?.click()}
                    className="p-1.5 rounded-lg transition-colors text-gray-400 hover:text-violet-600 hover:bg-violet-50"
                    title="Anexar arquivo"><Paperclip size={14} /></button>
                  <button onClick={() => fileInputRef.current?.click()}
                    className="p-1.5 rounded-lg transition-colors text-gray-400 hover:text-violet-600 hover:bg-violet-50"
                    title="Enviar imagem"><ImageIcon size={14} /></button>
                  <input ref={fileInputRef} type="file" className="hidden" onChange={anexarArquivo} />
                  <span className="text-[10px] ml-auto text-gray-400">Enter para enviar · Shift+Enter nova linha</span>
                </div>
              </div>

              {/* Botão Responder com menu */}
              <div ref={menuResponderRef} className="relative mt-3 flex justify-start">
                <button
                  onClick={() => setMenuResponder((v) => !v)}
                  className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold transition-all btn-neon"
                >
                  <Send size={14} />
                  Responder
                  <ChevronDown size={13} style={{ transform: menuResponder ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 180ms" }} />
                </button>

                {menuResponder && (
                  <div className="absolute bottom-full mb-2 left-0 w-72 rounded-xl overflow-hidden z-20"
                    style={{ background: "var(--bg-dropdown)", border: "1px solid #e5e7eb", boxShadow: "0 8px 32px rgba(0,0,0,0.15)" }}>
                    {/* Enviar mensagem */}
                    <button onClick={() => { enviar(); setMenuResponder(false); }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-left transition-colors"
                      style={{ color: "#374151", borderBottom: "1px solid #f3f4f6" }}
                      onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "#f9fafb")}
                      onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "transparent")}>
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: "rgba(124,58,237,0.1)" }}>
                        <Send size={13} style={{ color: "#7c3aed" }} />
                      </div>
                      <div>
                        <p className="text-xs font-semibold" style={{ color: "#111827" }}>Enviar mensagem</p>
                        <p className="text-[10px]" style={{ color: "#9ca3af" }}>Envia a resposta no chat</p>
                      </div>
                    </button>

                    {/* Solucionar chamado */}
                    {!aprovado && status !== "done" && (
                      <button onClick={() => { setMenuResponder(false); setModalAprovacao(true); }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-left transition-colors"
                        style={{ color: "#374151", borderBottom: "1px solid #f3f4f6" }}
                        onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "#f0fdf4")}
                        onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "transparent")}>
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: "rgba(16,185,129,0.1)" }}>
                          <CheckCircle2 size={13} style={{ color: "#10b981" }} />
                        </div>
                        <div>
                          <p className="text-xs font-semibold" style={{ color: "#111827" }}>Solucionar chamado</p>
                          <p className="text-[10px]" style={{ color: "#9ca3af" }}>Envia mensagem e encerra como Finalizado</p>
                        </div>
                      </button>
                    )}

                    {/* Marcar como pendente */}
                    <button onClick={() => { setPendente((v) => !v); setMenuResponder(false); }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-left transition-colors"
                      onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "#fffbeb")}
                      onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "transparent")}>
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: "rgba(245,158,11,0.1)" }}>
                        <AlertTriangle size={13} style={{ color: "#f59e0b" }} />
                      </div>
                      <div>
                        <p className="text-xs font-semibold" style={{ color: "#111827" }}>{pendente ? "Remover pendência" : "Marcar como pendente"}</p>
                        <p className="text-[10px]" style={{ color: "#9ca3af" }}>Aguardando retorno do solicitante</p>
                      </div>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── Painel lateral técnico ── */}
          <div className="w-72 shrink-0 flex flex-col overflow-y-auto bg-white self-stretch" style={{ borderLeft: "1px solid #e5e7eb" }}>

            {/* Label */}
            <div className="px-4 py-3 flex items-center gap-2 bg-violet-50" style={{ borderBottom: "1px solid #e5e7eb" }}>
              <Lock size={13} className="text-violet-600" />
              <span className="text-[11px] font-bold uppercase tracking-wide text-violet-600">Painel Técnico</span>
              <ShieldCheck size={12} className="ml-auto text-violet-400" />
            </div>

            <div className="p-4 space-y-5 flex-1">

              {/* Solicitante */}
              <Section label="Solicitante">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-black text-white shrink-0"
                    style={{ background: "linear-gradient(135deg,#0ea5e9,#0284c7)" }}>{chamado.avatar}</div>
                  <div>
                    <p className="text-xs font-semibold text-gray-800">{chamado.solicitante}</p>
                    <p className="text-[10px] text-gray-400">{chamado.setor}</p>
                  </div>
                </div>
              </Section>

              {/* Status */}
              <Section label="Status do chamado">
                <div className="relative">
                  <CircleDot size={11} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-violet-400 pointer-events-none" />
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as StatusChamado)}
                    className="w-full rounded-lg text-xs py-2 pl-7 pr-6 outline-none appearance-none bg-gray-50 text-gray-700 font-medium"
                    style={{ border: "1px solid #e5e7eb" }}
                    onFocus={(e) => (e.currentTarget.style.borderColor = "#a78bfa")}
                    onBlur={(e) => (e.currentTarget.style.borderColor = "#e5e7eb")}
                  >
                    {(["todo", "doing", "aguardando", "done"] as StatusChamado[]).map((s) => (
                      <option key={s} value={s}>{STATUS_LABEL[s]}</option>
                    ))}
                  </select>
                  <ChevronDown size={11} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </Section>

              {/* Prioridade */}
              <Section label="Prioridade">
                <div className="relative">
                  <AlertTriangle size={11} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-orange-400 pointer-events-none" />
                  <select
                    value={prioridade}
                    onChange={(e) => setPrioridade(e.target.value as Prioridade)}
                    className="w-full rounded-lg text-xs py-2 pl-7 pr-6 outline-none appearance-none bg-gray-50 text-gray-700 font-medium"
                    style={{ border: "1px solid #e5e7eb" }}
                    onFocus={(e) => (e.currentTarget.style.borderColor = "#a78bfa")}
                    onBlur={(e) => (e.currentTarget.style.borderColor = "#e5e7eb")}
                  >
                    {(["Crítica", "Alta", "Média", "Baixa"] as Prioridade[]).map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                  <ChevronDown size={11} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </Section>

              {/* Previsão */}
              <Section label="Previsão de resolução">
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: "var(--bg-surface)", border: "1px solid var(--border-default)" }}>
                  <Calendar size={13} style={{ color: "var(--text-faint)" }} />
                  <input
                    type="date"
                    value={previsao}
                    onChange={(e) => setPrevisao(e.target.value)}
                    className="flex-1 bg-transparent text-xs outline-none text-gray-700"
                    style={{ colorScheme: "light" }}
                  />
                </div>
              </Section>

              {/* Pendência do solicitante */}
              <Section label="Pendência do solicitante">
                <button
                  onClick={() => setPendente((v) => !v)}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all"
                  style={{
                    border: `1px solid ${pendente ? "#fcd34d" : "#e5e7eb"}`,
                    background: pendente ? "#fffbeb" : "#f9fafb",
                  }}>
                  <span className="flex items-center gap-2 text-xs font-medium" style={{ color: pendente ? "#b45309" : "#6b7280" }}>
                    <AlertTriangle size={13} style={{ color: pendente ? "#f59e0b" : "#9ca3af" }} />
                    {pendente ? "Aguardando solicitante" : "Sem pendências"}
                  </span>
                  <div className="w-7 h-4 rounded-full relative transition-all" style={{ background: pendente ? "#f59e0b" : "#d1d5db" }}>
                    <div className="absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all" style={{ left: pendente ? "calc(100% - 14px)" : "2px" }} />
                  </div>
                </button>
              </Section>

              {/* ── Técnicos atribuídos ── */}
              <Section label="Técnicos atribuídos">
                <div className="space-y-2">
                  {tecAtribuidos.map((tec) => {
                    const cor = PAPEL_COR[tec.papel];
                    return (
                      <div key={tec.id} className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl"
                        style={{ background: "#f9fafb", border: "1px solid #e5e7eb" }}>
                        <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-black text-white shrink-0"
                          style={{ background: "linear-gradient(135deg,#7c3aed,#6d28d9)" }}>
                          {tec.avatar}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-gray-800 truncate">{tec.nome}</p>
                          <p className="text-[10px] text-gray-400 truncate">{tec.setor}</p>
                        </div>
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded shrink-0"
                          style={{ background: cor.bg, color: cor.text, border: `1px solid ${cor.border}` }}>
                          {PAPEL_LABEL[tec.papel]}
                        </span>
                        {podeManejarTecnicos && (
                          <button onClick={() => removerTecnico(tec.id)}
                            title="Remover técnico"
                            className="p-1 rounded-lg transition-colors shrink-0 text-gray-300 hover:text-rose-500 hover:bg-rose-50">
                            <UserMinus size={12} />
                          </button>
                        )}
                      </div>
                    );
                  })}

                  {tecAtribuidos.length === 0 && (
                    <p className="text-[11px] text-gray-400 italic px-1">Nenhum técnico atribuído.</p>
                  )}

                  {/* Botão + dropdown para adicionar */}
                  {podeManejarTecnicos && (
                    <div className="relative" ref={addTecRef}>
                      <button onClick={() => setShowAddTec((v) => !v)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold w-full justify-center transition-all mt-1"
                        style={{
                          background: showAddTec ? "#ede9fe" : "#f3f4f6",
                          border: `1px dashed ${showAddTec ? "#a78bfa" : "#d1d5db"}`,
                          color: showAddTec ? "#7c3aed" : "#6b7280",
                        }}>
                        <UserPlus size={12} /> Atribuir técnico
                      </button>

                      {showAddTec && (
                        <div className="absolute bottom-full left-0 right-0 mb-1 rounded-xl shadow-lg overflow-hidden z-10"
                          style={{ background: "#ffffff", border: "1px solid #e5e7eb" }}>
                          {tecDisponiveis.length === 0 ? (
                            <p className="px-3 py-2 text-xs text-gray-400 italic">Todos atribuídos</p>
                          ) : (
                            tecDisponiveis.map((tec) => {
                              const cor = PAPEL_COR[tec.papel];
                              return (
                                <button key={tec.id} onClick={() => adicionarTecnico(tec)}
                                  className="w-full flex items-center gap-2.5 px-3 py-2 text-left text-xs hover:bg-violet-50 transition-colors">
                                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-black text-white shrink-0"
                                    style={{ background: "linear-gradient(135deg,#7c3aed,#6d28d9)" }}>
                                    {tec.avatar}
                                  </div>
                                  <span className="flex-1 font-medium text-gray-700 truncate">{tec.nome}</span>
                                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded shrink-0"
                                    style={{ background: cor.bg, color: cor.text, border: `1px solid ${cor.border}` }}>
                                    {PAPEL_LABEL[tec.papel]}
                                  </span>
                                </button>
                              );
                            })
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </Section>

              {/* ── Categoria e Grupo (editável p/ Admin e Analista) ── */}
              {podeEditarCatGrupo && (
                <Section label="Categoria / Grupo">
                  <div className="space-y-2">
                    <div>
                      <label className="text-[10px] text-gray-400 mb-0.5 block">Categoria</label>
                      <div className="relative">
                        <Tag size={11} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                        <select
                          value={categoriaEdit}
                          onChange={(e) => setCategoriaEdit(e.target.value)}
                          className="w-full rounded-lg text-xs py-2 pl-7 pr-2 outline-none appearance-none bg-gray-50 text-gray-700"
                          style={{ border: "1px solid #e5e7eb" }}
                          onFocus={(e) => (e.currentTarget.style.borderColor = "#a78bfa")}
                          onBlur={(e) => (e.currentTarget.style.borderColor = "#e5e7eb")}
                        >
                          {CATEGORIAS_DISPONIVEIS.map((c) => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                        <ChevronDown size={11} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] text-gray-400 mb-0.5 block">Grupo responsável</label>
                      <div className="relative">
                        <Users size={11} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                        <select
                          value={grupoEdit}
                          onChange={(e) => setGrupoEdit(e.target.value)}
                          className="w-full rounded-lg text-xs py-2 pl-7 pr-2 outline-none appearance-none bg-gray-50 text-gray-700"
                          style={{ border: "1px solid #e5e7eb" }}
                          onFocus={(e) => (e.currentTarget.style.borderColor = "#a78bfa")}
                          onBlur={(e) => (e.currentTarget.style.borderColor = "#e5e7eb")}
                        >
                          {GRUPOS_DISPONIVEIS.map((g) => (
                            <option key={g} value={g}>{g}</option>
                          ))}
                        </select>
                        <ChevronDown size={11} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                      </div>
                    </div>
                  </div>
                </Section>
              )}

              {/* Observações internas */}
              <Section label="Observações internas">
                <textarea
                  rows={4}
                  className="w-full rounded-xl px-3 py-2.5 text-xs resize-none outline-none text-gray-700 bg-gray-50"
                  style={{ border: "1px solid #e5e7eb", fontSize: "0.75rem" }}
                  placeholder="Notas visíveis apenas para a equipe técnica..."
                  value={obsInternas}
                  onChange={(e) => setObsInternas(e.target.value)}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "#a78bfa")}
                  onBlur={(e) => (e.currentTarget.style.borderColor = "#e5e7eb")}
                />
              </Section>

              {/* Histórico resumido */}
              <Section label="Linha do tempo">
                <div className="space-y-2">
                  {[
                    { hora: "17/06 09:14", texto: "Chamado aberto",           cor: "#7c3aed" },
                    { hora: "17/06 09:36", texto: "Status → Em Progresso",    cor: "#3b82f6" },
                    { hora: "Pendente",    texto: "Encerramento / Aprovação",  cor: "#d1d5db" },
                  ].map((ev, i) => (
                    <div key={i} className="flex items-start gap-2.5">
                      <div className="w-2 h-2 rounded-full mt-1 shrink-0" style={{ background: ev.cor }} />
                      <div>
                        <p className="text-[10px] font-mono text-gray-400">{ev.hora}</p>
                        <p className="text-[11px] text-gray-600">{ev.texto}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Section>

            </div>
          </div>
        </div>
    </div>

    {/* Modal solucionar chamado */}
    {modalAprovacao && (
      <div className="fixed inset-0 z-[300] flex items-center justify-center"
        style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}
        onClick={() => setModalAprovacao(false)}>
        <div className="rounded-2xl p-6 flex flex-col gap-4 w-full max-w-md mx-4"
          style={{ background: "#ffffff", border: "1px solid #e5e7eb", boxShadow: "0 24px 60px rgba(0,0,0,0.25)" }}
          onClick={(e) => e.stopPropagation()}>

          {/* Ícone */}
          <div className="flex justify-center">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
              style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.25)" }}>
              <CheckCircle2 size={22} style={{ color: "#34d399" }} />
            </div>
          </div>

          {/* Título */}
          <div className="text-center">
            <p className="font-bold text-sm mb-1 text-gray-800">Solucionar chamado</p>
            <p className="text-xs text-gray-500 leading-relaxed">
              Escreva uma mensagem de encerramento antes de marcar como <strong className="text-gray-700">Finalizado</strong>.
            </p>
          </div>

          {/* Campo de mensagem */}
          <textarea
            autoFocus
            rows={4}
            className="w-full px-4 py-3 text-sm rounded-xl resize-none outline-none text-gray-800"
            style={{ border: "1px solid #d1d5db", background: "#f9fafb", fontSize: "0.8125rem" }}
            placeholder="Ex: Problema resolvido — índice reconstruído com sucesso. Sistema operando normalmente."
            value={msgAprovacao}
            onChange={(e) => setMsgAprovacao(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && e.ctrlKey) encerrarComAprovacao(); }}
          />
          <p className="text-[10px] text-gray-400 -mt-2">Ctrl+Enter para enviar</p>

          {/* Ações */}
          <div className="flex gap-2">
            <button onClick={() => { setModalAprovacao(false); setMsgAprovacao(""); }}
              className="flex-1 py-2.5 rounded-xl text-xs font-semibold transition-all text-gray-500"
              style={{ border: "1px solid #e5e7eb" }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "#f3f4f6")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "transparent")}>
              Cancelar
            </button>
            <button onClick={encerrarComAprovacao}
              disabled={!msgAprovacao.trim()}
              className="flex-1 py-2.5 rounded-xl text-xs font-bold transition-all"
              style={{
                background: msgAprovacao.trim() ? "rgba(16,185,129,0.15)" : "rgba(16,185,129,0.05)",
                border: "1px solid rgba(16,185,129,0.35)",
                color: msgAprovacao.trim() ? "#059669" : "#9ca3af",
                cursor: msgAprovacao.trim() ? "pointer" : "not-allowed",
              }}
              onMouseEnter={(e) => { if (msgAprovacao.trim()) (e.currentTarget as HTMLElement).style.background = "rgba(16,185,129,0.25)"; }}
              onMouseLeave={(e) => { if (msgAprovacao.trim()) (e.currentTarget as HTMLElement).style.background = "rgba(16,185,129,0.15)"; }}>
              Enviar e encerrar
            </button>
          </div>
        </div>
      </div>
    )}
    </>,
    document.body
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-widest mb-2 text-gray-400">{label}</p>
      {children}
    </div>
  );
}
