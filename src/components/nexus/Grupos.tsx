"use client";

import { useState } from "react";
import {
  Plus, Pencil, Trash2, X, Users, Tag, CheckCircle2,
  AlertTriangle, ChevronDown, Hash, Palette,
} from "lucide-react";
import { useGrupos, USUARIOS_INICIAIS, type Grupo, type UsuarioBase, type Subcategoria } from "@/lib/grupos-store";
import { isAdmin, podeGerenciarGrupo } from "@/lib/auth-store";

const CORES = [
  "#7c3aed", "#6d28d9", "#0ea5e9", "#0284c7",
  "#10b981", "#059669", "#f59e0b", "#d97706",
  "#ef4444", "#dc2626", "#ec4899", "#db2777",
];

type Modal =
  | { type: "none" }
  | { type: "novo" }
  | { type: "editar"; grupo: Grupo }
  | { type: "excluir"; grupo: Grupo };

interface FormState {
  nome: string;
  descricao: string;
  cor: string;
  membros: UsuarioBase[];
  categorias: Subcategoria[];
  newCat: string;
}

const EMPTY_FORM: FormState = {
  nome: "", descricao: "", cor: "#7c3aed",
  membros: [], categorias: [], newCat: "",
};

export default function Grupos() {
  const { grupos, addGrupo, updateGrupo, deleteGrupo } = useGrupos();
  const [modal, setModal] = useState<Modal>({ type: "none" });
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [feedback, setFeedback] = useState("");

  function flash(msg: string) {
    setFeedback(msg);
    setTimeout(() => setFeedback(""), 3000);
  }

  function openNovo() {
    setForm(EMPTY_FORM);
    setModal({ type: "novo" });
  }

  function openEditar(g: Grupo) {
    setForm({
      nome: g.nome, descricao: g.descricao, cor: g.cor,
      membros: g.membros, categorias: g.categorias, newCat: "",
    });
    setModal({ type: "editar", grupo: g });
  }

  function toggleMembro(u: UsuarioBase) {
    setForm((p) => {
      const exists = p.membros.some((m) => m.id === u.id);
      return {
        ...p,
        membros: exists ? p.membros.filter((m) => m.id !== u.id) : [...p.membros, u],
      };
    });
  }

  function addCategoria() {
    const nome = form.newCat.trim();
    if (!nome) return;
    if (form.categorias.some((c) => c.nome.toLowerCase() === nome.toLowerCase())) return;
    setForm((p) => ({
      ...p,
      categorias: [...p.categorias, { id: `c${Date.now()}`, nome }],
      newCat: "",
    }));
  }

  function removeCategoria(id: string) {
    setForm((p) => ({ ...p, categorias: p.categorias.filter((c) => c.id !== id) }));
  }

  function salvar() {
    if (!form.nome.trim()) return;
    const payload = {
      nome: form.nome.trim(),
      descricao: form.descricao.trim(),
      cor: form.cor,
      membros: form.membros,
      categorias: form.categorias,
    };
    if (modal.type === "novo") {
      addGrupo(payload);
      flash("Grupo criado com sucesso.");
    } else if (modal.type === "editar") {
      updateGrupo(modal.grupo.id, payload);
      flash("Grupo atualizado.");
    }
    setModal({ type: "none" });
  }

  function confirmarExcluir() {
    if (modal.type !== "excluir") return;
    deleteGrupo(modal.grupo.id);
    setModal({ type: "none" });
    flash("Grupo removido.");
  }

  const totalMembros = [...new Set(grupos.flatMap((g) => g.membros.map((m) => m.id)))].length;
  const totalCats = grupos.reduce((acc, g) => acc + g.categorias.length, 0);

  return (
    <div>
      {/* Cabeçalho */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h2 className="font-black text-lg tracking-tight" style={{ color: "var(--text-heading)" }}>
            Grupos de Atendimento
          </h2>
          <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
            <span className="font-semibold" style={{ color: "var(--text-heading)" }}>{grupos.length}</span> grupos ·{" "}
            <span className="font-semibold" style={{ color: "var(--text-heading)" }}>{totalCats}</span> categorias ·{" "}
            <span className="font-semibold" style={{ color: "var(--text-heading)" }}>{totalMembros}</span> membros únicos
          </p>
        </div>
        {isAdmin() && (
          <button onClick={openNovo} className="flex items-center gap-1.5 btn-neon text-xs px-4 py-2.5">
            <Plus size={14} /> Novo Grupo
          </button>
        )}
      </div>

      {/* Feedback */}
      {feedback && (
        <div className="flex items-center gap-2 text-xs text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-4 py-2.5 mb-4">
          <CheckCircle2 size={14} /> {feedback}
        </div>
      )}

      {/* Grid de grupos */}
      {grupos.length === 0 ? (
        <div className="glass rounded-xl flex flex-col items-center justify-center py-20 text-center">
          <Users size={32} className="mb-3" style={{ color: "var(--text-faint)" }} />
          <p className="text-sm font-semibold" style={{ color: "var(--text-muted)" }}>Nenhum grupo criado</p>
          <p className="text-xs mt-1" style={{ color: "var(--text-faint)" }}>Crie um grupo para organizar o atendimento por área</p>
          <button onClick={openNovo} className="btn-neon text-xs px-4 py-2 mt-4 flex items-center gap-1.5">
            <Plus size={13} /> Criar primeiro grupo
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {grupos.map((g) => (
            <GrupoCard
              key={g.id}
              grupo={g}
              podeEditar={podeGerenciarGrupo(g.id)}
              podeExcluir={isAdmin()}
              onEditar={() => openEditar(g)}
              onExcluir={() => setModal({ type: "excluir", grupo: g })}
            />
          ))}
        </div>
      )}

      {/* ── Modais ── */}
      {modal.type !== "none" && (
        <Overlay onClose={() => setModal({ type: "none" })}>

          {/* Criar / Editar */}
          {(modal.type === "novo" || modal.type === "editar") && (
            <div
              className="w-full max-w-lg rounded-2xl overflow-hidden flex flex-col"
              style={{
                background: "var(--bg-surface-2)",
                backdropFilter: "blur(20px)",
                border: "1px solid var(--border-default)",
                boxShadow: "0 24px 64px rgba(0,0,0,0.25), 0 0 0 1px rgba(124,58,237,0.1)",
                maxHeight: "90vh",
              }}
            >
              {/* Header modal */}
              <div className="flex items-center justify-between px-6 py-4 shrink-0" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                <h3 className="font-black text-base" style={{ color: "var(--text-heading)" }}>
                  {modal.type === "novo" ? "Novo Grupo" : `Editar — ${modal.grupo.nome}`}
                </h3>
                <button onClick={() => setModal({ type: "none" })} className="p-1 rounded-lg" style={{ color: "var(--text-faint)" }}>
                  <X size={16} />
                </button>
              </div>

              {/* Body modal — scrollável */}
              <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

                {/* Nome */}
                <div>
                  <label className="field-label">Nome do Grupo</label>
                  <input
                    className="nexus-input"
                    placeholder="Ex: RH / Departamento Pessoal"
                    value={form.nome}
                    onChange={(e) => setForm((p) => ({ ...p, nome: e.target.value }))}
                  />
                </div>

                {/* Descrição */}
                <div>
                  <label className="field-label">Descrição</label>
                  <input
                    className="nexus-input"
                    placeholder="Descreva a área de atuação deste grupo"
                    value={form.descricao}
                    onChange={(e) => setForm((p) => ({ ...p, descricao: e.target.value }))}
                  />
                </div>

                {/* Cor */}
                <div>
                  <label className="field-label flex items-center gap-1.5"><Palette size={11} /> Cor do Grupo</label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {CORES.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setForm((p) => ({ ...p, cor: c }))}
                        style={{ background: c, width: 26, height: 26, borderRadius: 6, border: form.cor === c ? "2px solid white" : "2px solid transparent", boxShadow: form.cor === c ? `0 0 0 2px ${c}` : "none" }}
                      />
                    ))}
                  </div>
                </div>

                {/* Membros */}
                <div>
                  <label className="field-label flex items-center gap-1.5"><Users size={11} /> Membros</label>
                  <div className="space-y-1 mt-1">
                    {USUARIOS_INICIAIS.map((u) => {
                      const selected = form.membros.some((m) => m.id === u.id);
                      return (
                        <button
                          key={u.id}
                          type="button"
                          onClick={() => toggleMembro(u)}
                          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-left"
                          style={{
                            background: selected ? "rgba(124,58,237,0.10)" : "transparent",
                            border: `1px solid ${selected ? "rgba(124,58,237,0.35)" : "var(--border-subtle)"}`,
                          }}
                        >
                          <div
                            className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-black text-white shrink-0"
                            style={{ background: "linear-gradient(135deg,#7c3aed,#6d28d9)" }}
                          >
                            {u.avatar}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold leading-none truncate" style={{ color: "var(--text-heading)" }}>{u.nome}</p>
                            <p className="text-[10px] mt-0.5" style={{ color: "var(--text-faint)" }}>{u.role}</p>
                          </div>
                          {selected && <CheckCircle2 size={14} className="text-violet-400 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Categorias */}
                <div>
                  <label className="field-label flex items-center gap-1.5"><Hash size={11} /> Categorias de Chamado</label>
                  <p className="text-[11px] mb-2" style={{ color: "var(--text-faint)" }}>
                    Quando um chamado dessa categoria for aberto, este grupo será atribuído automaticamente.
                  </p>

                  {/* Lista de categorias */}
                  {form.categorias.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {form.categorias.map((c) => (
                        <span
                          key={c.id}
                          className="flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-full"
                          style={{ background: `${form.cor}18`, color: form.cor, border: `1px solid ${form.cor}35` }}
                        >
                          {c.nome}
                          <button onClick={() => removeCategoria(c.id)} className="ml-0.5 hover:text-rose-400 transition-colors">
                            <X size={10} />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Adicionar categoria */}
                  <div className="flex gap-2">
                    <input
                      className="nexus-input flex-1 text-xs"
                      placeholder="Ex: Holerite, Ponto, Férias..."
                      value={form.newCat}
                      onChange={(e) => setForm((p) => ({ ...p, newCat: e.target.value }))}
                      onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addCategoria(); } }}
                    />
                    <button
                      type="button"
                      onClick={addCategoria}
                      className="px-3 py-2 rounded-lg text-xs font-semibold transition-all shrink-0"
                      style={{ background: "rgba(124,58,237,0.12)", color: "#a78bfa", border: "1px solid rgba(124,58,237,0.25)" }}
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Footer modal */}
              <div className="flex gap-2 px-6 py-4 shrink-0" style={{ borderTop: "1px solid var(--border-subtle)" }}>
                <button onClick={() => setModal({ type: "none" })} className="flex-1 py-2.5 rounded-xl text-sm" style={{ border: "1px solid var(--border-subtle)", color: "var(--text-muted)" }}>
                  Cancelar
                </button>
                <button onClick={salvar} className="flex-1 btn-neon py-2.5 text-sm" disabled={!form.nome.trim()}>
                  {modal.type === "novo" ? "Criar Grupo" : "Salvar Alterações"}
                </button>
              </div>
            </div>
          )}

          {/* Excluir */}
          {modal.type === "excluir" && (
            <div
              className="w-full max-w-sm rounded-2xl p-6"
              style={{
                background: "var(--bg-surface-2)",
                backdropFilter: "blur(20px)",
                border: "1px solid var(--border-default)",
                boxShadow: "0 24px 64px rgba(0,0,0,0.25)",
              }}
            >
              <div className="flex flex-col items-center text-center gap-3 mb-5">
                <div className="w-12 h-12 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center">
                  <AlertTriangle size={22} className="text-rose-500" />
                </div>
                <div>
                  <h3 className="font-black text-base mb-1" style={{ color: "var(--text-heading)" }}>Remover Grupo</h3>
                  <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                    Deseja remover o grupo{" "}
                    <span className="font-bold" style={{ color: "var(--text-heading)" }}>{modal.grupo.nome}</span>?
                    As categorias associadas não serão mais roteadas automaticamente.
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setModal({ type: "none" })} className="flex-1 py-2 rounded-xl text-sm" style={{ border: "1px solid var(--border-subtle)", color: "var(--text-muted)" }}>
                  Cancelar
                </button>
                <button
                  onClick={confirmarExcluir}
                  className="flex-1 py-2 rounded-xl text-sm font-bold text-white"
                  style={{ background: "linear-gradient(135deg,#dc2626,#b91c1c)", border: "1px solid rgba(239,68,68,0.4)" }}
                >
                  Remover
                </button>
              </div>
            </div>
          )}
        </Overlay>
      )}
    </div>
  );
}

/* ── Card de grupo ── */
function GrupoCard({ grupo, onEditar, onExcluir, podeEditar, podeExcluir }: {
  grupo: Grupo;
  onEditar: () => void;
  onExcluir: () => void;
  podeEditar?: boolean;
  podeExcluir?: boolean;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className="glass rounded-xl overflow-hidden flex flex-col transition-all"
      style={{ borderTop: `3px solid ${grupo.cor}` }}
    >
      {/* Header */}
      <div className="px-4 pt-4 pb-3 flex items-start justify-between gap-2">
        <div className="flex items-start gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-white font-black text-sm"
            style={{ background: grupo.cor }}
          >
            {grupo.nome.charAt(0)}
          </div>
          <div>
            <h3 className="font-black text-sm leading-tight" style={{ color: "var(--text-heading)" }}>{grupo.nome}</h3>
            {grupo.descricao && (
              <p className="text-[11px] mt-0.5 leading-snug" style={{ color: "var(--text-faint)" }}>{grupo.descricao}</p>
            )}
          </div>
        </div>
        <div className="flex gap-1 shrink-0">
          {podeEditar && (
            <button onClick={onEditar} title="Editar grupo" className="p-1.5 rounded-lg transition-all" style={{ color: "var(--text-faint)" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = grupo.cor; (e.currentTarget as HTMLElement).style.background = `${grupo.cor}15`; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "var(--text-faint)"; (e.currentTarget as HTMLElement).style.background = "transparent"; }}>
              <Pencil size={13} />
            </button>
          )}
          {podeExcluir && (
            <button onClick={onExcluir} title="Remover grupo" className="p-1.5 rounded-lg transition-all" style={{ color: "var(--text-faint)" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "#ef4444"; (e.currentTarget as HTMLElement).style.background = "rgba(239,68,68,0.10)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "var(--text-faint)"; (e.currentTarget as HTMLElement).style.background = "transparent"; }}>
              <Trash2 size={13} />
            </button>
          )}
        </div>
      </div>

      {/* Membros */}
      <div className="px-4 py-2.5" style={{ borderTop: "1px solid var(--border-subtle)" }}>
        <p className="text-[10px] font-semibold uppercase tracking-wide mb-2" style={{ color: "var(--text-faint)" }}>
          Membros ({grupo.membros.length})
        </p>
        {grupo.membros.length === 0 ? (
          <p className="text-xs italic" style={{ color: "var(--text-faint)" }}>Nenhum membro</p>
        ) : (
          <div className="flex items-center gap-1.5 flex-wrap">
            {grupo.membros.map((m) => (
              <div key={m.id} className="flex items-center gap-1.5 rounded-full px-2 py-1" style={{ background: "rgba(124,58,237,0.08)", border: "1px solid rgba(124,58,237,0.15)" }}>
                <div
                  className="w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-black text-white shrink-0"
                  style={{ background: "linear-gradient(135deg,#7c3aed,#6d28d9)" }}
                >
                  {m.avatar}
                </div>
                <span className="text-[10px] font-medium whitespace-nowrap" style={{ color: "var(--text-secondary)" }}>
                  {m.nome.split(" ")[0]}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Categorias */}
      <div className="px-4 py-2.5" style={{ borderTop: "1px solid var(--border-subtle)" }}>
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-between"
        >
          <p className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: "var(--text-faint)" }}>
            Categorias ({grupo.categorias.length})
          </p>
          <ChevronDown
            size={12}
            style={{ color: "var(--text-faint)", transform: expanded ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 200ms" }}
          />
        </button>
        {expanded && grupo.categorias.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {grupo.categorias.map((c) => (
              <span
                key={c.id}
                className="flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full"
                style={{ background: `${grupo.cor}12`, color: grupo.cor, border: `1px solid ${grupo.cor}30` }}
              >
                <Tag size={8} /> {c.nome}
              </span>
            ))}
          </div>
        )}
        {expanded && grupo.categorias.length === 0 && (
          <p className="text-xs italic mt-1.5" style={{ color: "var(--text-faint)" }}>Nenhuma categoria definida</p>
        )}
      </div>
    </div>
  );
}

function Overlay({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {children}
    </div>
  );
}
