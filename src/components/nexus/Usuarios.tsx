"use client";

import { useState, useRef } from "react";
import {
  Plus, Search, Pencil, Trash2, UserCog, AlertTriangle,
  X, CheckCircle2, ChevronDown, Camera, Shield, KeyRound, Eye, EyeOff,
} from "lucide-react";

type Role = "Administrador" | "Técnico N1" | "Técnico N2" | "Analista";
type Status = "Ativo" | "Inativo";

interface Usuario {
  id: number;
  nome: string;
  email: string;
  login: string;
  role: Role;
  status: Status;
  avatar: string;
  foto?: string; // data URL da foto
}

const ROLES: Role[] = ["Administrador", "Técnico N1", "Técnico N2", "Analista"];

const ROLE_STYLE: Record<Role, string> = {
  "Administrador": "bg-violet-500/15 text-violet-500 border-violet-500/25",
  "Técnico N1":    "bg-blue-500/15   text-blue-400   border-blue-500/25",
  "Técnico N2":    "bg-cyan-500/15   text-cyan-400   border-cyan-500/25",
  "Analista":      "bg-orange-500/15 text-orange-400 border-orange-500/25",
};

const INITIAL_USERS: Usuario[] = [
  { id: 1, nome: "Kamila Luedy",    email: "kamila.luedy@kmltech.com.br",  login: "kamila.luedy",  role: "Administrador", status: "Ativo",   avatar: "KL" },
  { id: 2, nome: "Marcos Vinicius", email: "marcos.v@kmltech.com.br",      login: "marcos.v",      role: "Técnico N2",    status: "Ativo",   avatar: "MV" },
  { id: 3, nome: "Fernanda Reis",   email: "fernanda.r@kmltech.com.br",    login: "fernanda.r",    role: "Técnico N1",    status: "Ativo",   avatar: "FR" },
  { id: 4, nome: "Pedro Mota",      email: "pedro.m@kmltech.com.br",       login: "pedro.m",       role: "Técnico N1",    status: "Inativo", avatar: "PM" },
  { id: 5, nome: "Ana Cláudia",     email: "ana.c@kmltech.com.br",         login: "ana.c",         role: "Analista",      status: "Ativo",   avatar: "AC" },
];

// Usuário logado (simulado) — em produção viria do contexto de autenticação
const USUARIO_LOGADO: Pick<Usuario, "role"> = { role: "Administrador" };

type ModalState =
  | { type: "none" }
  | { type: "novo" }
  | { type: "editar"; usuario: Usuario }
  | { type: "excluir"; usuario: Usuario }
  | { type: "atribuir"; usuario: Usuario };

const EMPTY_FORM = { nome: "", email: "", login: "", role: "Técnico N1" as Role };

interface EditForm {
  nome: string;
  email: string;
  login: string;
  role: Role;
  foto?: string;
  novaSenha?: string;
  redefinirSenha?: boolean;
}

export default function Usuarios() {
  const [users, setUsers]   = useState<Usuario[]>(INITIAL_USERS);
  const [search, setSearch] = useState("");
  const [modal, setModal]   = useState<ModalState>({ type: "none" });
  const [form, setForm]     = useState(EMPTY_FORM);
  const [editForm, setEditForm] = useState<EditForm>({ nome: "", email: "", login: "", role: "Técnico N1" });
  const [feedback, setFeedback] = useState("");

  const isAdmin = USUARIO_LOGADO.role === "Administrador";

  function flash(msg: string) {
    setFeedback(msg);
    setTimeout(() => setFeedback(""), 3000);
  }

  function openNovo() { setForm(EMPTY_FORM); setModal({ type: "novo" }); }

  function openEditar(u: Usuario) {
    setEditForm({ nome: u.nome, email: u.email, login: u.login, role: u.role, foto: u.foto });
    setModal({ type: "editar", usuario: u });
  }

  function salvarNovo() {
    if (!form.nome || !form.email || !form.login) return;
    const initials = form.nome.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
    setUsers((prev) => [...prev, { id: Math.max(...prev.map((u) => u.id)) + 1, ...form, status: "Ativo", avatar: initials }]);
    setModal({ type: "none" });
    flash("Usuário criado com sucesso.");
  }

  function salvarEdicao() {
    if (modal.type !== "editar") return;
    if (editForm.redefinirSenha && (editForm.novaSenha?.length ?? 0) < 6) return;
    const initials = editForm.nome.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
    setUsers((prev) => prev.map((u) => u.id === modal.usuario.id
      ? { ...u, nome: editForm.nome, email: editForm.email, login: editForm.login, role: editForm.role, foto: editForm.foto, avatar: initials }
      : u
    ));
    setModal({ type: "none" });
    flash(editForm.redefinirSenha ? "Usuário atualizado e senha redefinida. Ele deverá alterá-la no próximo login." : "Usuário atualizado com sucesso.");
  }

  function excluir() {
    if (modal.type !== "excluir") return;
    setUsers((prev) => prev.filter((u) => u.id !== modal.usuario.id));
    setModal({ type: "none" });
    flash("Usuário removido.");
  }

  function toggleStatus(id: number) {
    setUsers((prev) => prev.map((u) => u.id === id ? { ...u, status: u.status === "Ativo" ? "Inativo" : "Ativo" } : u));
  }

  const filtered = users.filter(
    (u) =>
      u.nome.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.role.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      {/* Cabeçalho */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h2 className="font-black text-lg tracking-tight" style={{ color: "var(--text-heading)" }}>
            Gerenciamento de Usuários
          </h2>
          <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
            <span className="font-semibold" style={{ color: "var(--text-heading)" }}>{users.length}</span> usuários cadastrados
          </p>
        </div>
        {isAdmin && (
          <button onClick={openNovo} className="flex items-center gap-1.5 btn-neon text-xs px-4 py-2.5">
            <Plus size={14} /> Novo Usuário
          </button>
        )}
      </div>

      {/* Feedback */}
      {feedback && (
        <div className="flex items-center gap-2 text-xs text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-4 py-2.5 mb-4">
          <CheckCircle2 size={14} /> {feedback}
        </div>
      )}

      {/* Aviso de permissão restrita */}
      {!isAdmin && (
        <div className="flex items-center gap-2 text-xs mb-4 px-4 py-2.5 rounded-lg"
          style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)", color: "#f59e0b" }}>
          <Shield size={13} /> Apenas administradores podem editar usuários.
        </div>
      )}

      {/* Tabela */}
      <div className="glass rounded-xl overflow-hidden">
        <div className="px-4 py-3 flex items-center gap-3" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
          <div className="relative flex-1 max-w-xs">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-faint)" }} />
            <input
              className="nexus-input pl-9 py-2 text-xs"
              placeholder="Buscar por nome, e-mail ou papel..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <span className="text-xs ml-auto" style={{ color: "var(--text-faint)" }}>
            {filtered.length} resultado{filtered.length !== 1 ? "s" : ""}
          </span>
        </div>

        <div className="grid text-[11px] font-semibold uppercase tracking-wide px-4 py-2.5"
          style={{ gridTemplateColumns: "2fr 2.5fr 1.5fr 1fr 1.5fr", color: "var(--text-faint)", borderBottom: "1px solid var(--border-subtle)", background: "rgba(124,58,237,0.03)" }}>
          <span>Nome</span>
          <span>E-mail</span>
          <span>Papel</span>
          <span>Status</span>
          <span className="text-right">Ações</span>
        </div>

        <div>
          {filtered.length === 0 && (
            <div className="py-12 text-center text-sm" style={{ color: "var(--text-faint)" }}>Nenhum usuário encontrado.</div>
          )}
          {filtered.map((u, idx) => (
            <div key={u.id} className="grid items-center px-4 py-3 transition-colors"
              style={{ gridTemplateColumns: "2fr 2.5fr 1.5fr 1fr 1.5fr", borderBottom: idx < filtered.length - 1 ? "1px solid var(--border-subtle)" : "none" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(124,58,237,0.04)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>

              {/* Nome + avatar */}
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-7 h-7 rounded-full shrink-0 overflow-hidden flex items-center justify-center text-[10px] font-black text-white"
                  style={{ background: "linear-gradient(135deg,#7c3aed,#6d28d9)" }}>
                  {u.foto ? <img src={u.foto} alt={u.nome} className="w-full h-full object-cover" /> : u.avatar}
                </div>
                <span className="text-sm font-medium truncate" style={{ color: "var(--text-primary)" }}>{u.nome}</span>
              </div>

              <span className="text-xs truncate" style={{ color: "var(--text-muted)" }}>{u.email}</span>

              <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border w-fit ${ROLE_STYLE[u.role]}`}>{u.role}</span>

              <button onClick={() => isAdmin && toggleStatus(u.id)}
                className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border w-fit transition-all ${u.status === "Ativo" ? "bg-emerald-500/15 text-emerald-500 border-emerald-500/25" : "bg-zinc-500/15 text-zinc-400 border-zinc-500/25"} ${isAdmin ? "cursor-pointer" : "cursor-default"}`}
                title={isAdmin ? "Clique para alternar status" : undefined}>
                {u.status}
              </button>

              <div className="flex items-center justify-end gap-1">
                {isAdmin && (
                  <>
                    <ActionBtn icon={<Pencil size={13} />} label="Editar usuário" color="#7c3aed" onClick={() => openEditar(u)} />
                    <ActionBtn icon={<UserCog size={13} />} label="Atribuir Chamados" color="#38bdf8" onClick={() => setModal({ type: "atribuir", usuario: u })} />
                    <ActionBtn icon={<Trash2 size={13} />} label="Excluir" color="#ef4444" onClick={() => setModal({ type: "excluir", usuario: u })} danger />
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Modais ── */}
      {modal.type !== "none" && (
        <Overlay onClose={() => setModal({ type: "none" })}>

          {/* Novo Usuário */}
          {modal.type === "novo" && (
            <ModalCard title="Novo Usuário" onClose={() => setModal({ type: "none" })}>
              <FormUsuario form={form} onChange={(k, v) => setForm((p) => ({ ...p, [k]: v }))} />
              <div className="flex gap-2 mt-5">
                <button onClick={() => setModal({ type: "none" })} className="flex-1 py-2 rounded-lg text-sm" style={{ border: "1px solid var(--border-subtle)", color: "var(--text-muted)" }}>Cancelar</button>
                <button onClick={salvarNovo} className="flex-1 btn-neon py-2 text-sm">Criar Usuário</button>
              </div>
            </ModalCard>
          )}

          {/* Editar Usuário — completo, só admin */}
          {modal.type === "editar" && (
            <ModalCard title={`Editar Usuário`} onClose={() => setModal({ type: "none" })} wide>
              <EditarUsuarioForm
                form={editForm}
                onChange={(k, v) => setEditForm((p) => ({ ...p, [k]: v }))}
                onChangeBool={(k, v) => setEditForm((p) => ({ ...p, [k]: v }))}
                usuario={modal.usuario}
              />
              <div className="flex gap-2 mt-6">
                <button onClick={() => setModal({ type: "none" })} className="flex-1 py-2 rounded-lg text-sm" style={{ border: "1px solid var(--border-subtle)", color: "var(--text-muted)" }}>Cancelar</button>
                <button onClick={salvarEdicao} className="flex-1 btn-neon py-2 text-sm">Salvar Alterações</button>
              </div>
            </ModalCard>
          )}

          {/* Atribuir Chamados */}
          {modal.type === "atribuir" && (
            <ModalCard title={`Atribuir Chamados — ${modal.usuario.nome}`} onClose={() => setModal({ type: "none" })}>
              <p className="text-sm mb-4" style={{ color: "var(--text-secondary)" }}>Selecione os chamados que serão atribuídos a este técnico:</p>
              {["#0051 — Erro PostgreSQL", "#0050 — Sem acesso Protheus", "#0049 — Monitor não detectado"].map((c) => (
                <label key={c} className="flex items-center gap-2.5 py-2 cursor-pointer" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                  <input type="checkbox" className="accent-violet-600 w-4 h-4" />
                  <span className="text-sm" style={{ color: "var(--text-secondary)" }}>{c}</span>
                </label>
              ))}
              <div className="flex gap-2 mt-5">
                <button onClick={() => setModal({ type: "none" })} className="flex-1 py-2 rounded-lg text-sm" style={{ border: "1px solid var(--border-subtle)", color: "var(--text-muted)" }}>Cancelar</button>
                <button onClick={() => { setModal({ type: "none" }); flash("Chamados atribuídos."); }} className="flex-1 btn-neon py-2 text-sm">Confirmar</button>
              </div>
            </ModalCard>
          )}

          {/* Excluir */}
          {modal.type === "excluir" && (
            <ModalCard title="Confirmar Exclusão" onClose={() => setModal({ type: "none" })}>
              <div className="flex flex-col items-center text-center gap-3 py-2">
                <div className="w-12 h-12 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center">
                  <AlertTriangle size={22} className="text-rose-500" />
                </div>
                <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                  Tem certeza que deseja excluir o usuário{" "}
                  <span className="font-bold" style={{ color: "var(--text-heading)" }}>{modal.usuario.nome}</span>?
                  <br />
                  <span className="text-xs mt-1 block" style={{ color: "var(--text-faint)" }}>Esta ação não pode ser desfeita.</span>
                </p>
              </div>
              <div className="flex gap-2 mt-4">
                <button onClick={() => setModal({ type: "none" })} className="flex-1 py-2 rounded-lg text-sm" style={{ border: "1px solid var(--border-subtle)", color: "var(--text-muted)" }}>Cancelar</button>
                <button onClick={excluir} className="flex-1 py-2 rounded-lg text-sm font-bold text-white transition-all"
                  style={{ background: "linear-gradient(135deg,#dc2626,#b91c1c)", border: "1px solid rgba(239,68,68,0.4)" }}>
                  Excluir
                </button>
              </div>
            </ModalCard>
          )}
        </Overlay>
      )}
    </div>
  );
}

/* ── Formulário completo de edição (admin only) ── */
function EditarUsuarioForm({ form, onChange, onChangeBool, usuario }: {
  form: EditForm;
  onChange: (k: string, v: string) => void;
  onChangeBool: (k: string, v: boolean) => void;
  usuario: Usuario;
}) {
  const fotoRef = useRef<HTMLInputElement>(null);
  const [mostrarSenha, setMostrarSenha] = useState(false);

  function handleFoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => onChange("foto", ev.target?.result as string);
    reader.readAsDataURL(file);
  }

  return (
    <div className="space-y-5">
      {/* Avatar / foto */}
      <div className="flex items-center gap-4">
        <div className="relative shrink-0">
          <div className="w-16 h-16 rounded-2xl overflow-hidden flex items-center justify-center text-xl font-black text-white"
            style={{ background: "linear-gradient(135deg,#7c3aed,#6d28d9)" }}>
            {form.foto
              ? <img src={form.foto} alt="foto" className="w-full h-full object-cover" />
              : usuario.avatar}
          </div>
          <button onClick={() => fotoRef.current?.click()}
            className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center transition-all"
            style={{ background: "#7c3aed", border: "2px solid var(--bg-surface-2)" }}
            title="Trocar foto">
            <Camera size={11} className="text-white" />
          </button>
          <input ref={fotoRef} type="file" accept="image/*" className="hidden" onChange={handleFoto} />
        </div>
        <div>
          <p className="text-sm font-bold" style={{ color: "var(--text-heading)" }}>{usuario.nome}</p>
          <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>Clique na câmera para trocar a foto</p>
          {form.foto && (
            <button onClick={() => onChange("foto", "")} className="text-[10px] mt-1 underline" style={{ color: "#ef4444" }}>
              Remover foto
            </button>
          )}
        </div>
      </div>

      {/* Campos */}
      <div className="grid grid-cols-2 gap-4">
        <Field label="Nome Completo" value={form.nome} onChange={(v) => onChange("nome", v)} placeholder="Ex: João Silva" />
        <Field label="Login / Identificação" value={form.login} onChange={(v) => onChange("login", v)} placeholder="joao.silva" />
      </div>
      <Field label="E-mail" value={form.email} onChange={(v) => onChange("email", v)} placeholder="joao@empresa.com" type="email" />

      <div>
        <label className="text-[11px] font-semibold uppercase tracking-wide block mb-1.5" style={{ color: "var(--text-muted)" }}>Papel / Role</label>
        <div className="relative">
          <select className="nexus-input pr-8 appearance-none" value={form.role}
            onChange={(e) => onChange("role", e.target.value)}>
            {ROLES.map((r) => <option key={r}>{r}</option>)}
          </select>
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "var(--text-faint)" }} />
        </div>
      </div>

      {/* Redefinir senha */}
      <div className="rounded-xl p-4 space-y-3" style={{ background: "rgba(124,58,237,0.06)", border: "1px solid rgba(124,58,237,0.18)" }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <KeyRound size={13} style={{ color: "#a78bfa" }} />
            <span className="text-xs font-semibold" style={{ color: "var(--text-heading)" }}>Redefinir senha</span>
          </div>
          <button
            type="button"
            onClick={() => { onChangeBool("redefinirSenha", !form.redefinirSenha); onChange("novaSenha", ""); }}
            className="relative w-9 h-5 rounded-full transition-all shrink-0"
            style={{ background: form.redefinirSenha ? "#7c3aed" : "var(--border-default)" }}>
            <span className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all shadow-sm"
              style={{ left: form.redefinirSenha ? "calc(100% - 18px)" : "2px" }} />
          </button>
        </div>

        {form.redefinirSenha && (
          <div className="space-y-2 pt-1">
            <p className="text-[11px]" style={{ color: "var(--text-faint)" }}>
              A pessoa receberá a nova senha e será obrigada a alterá-la no próximo login.
            </p>
            <div className="relative">
              <input
                type={mostrarSenha ? "text" : "password"}
                className="nexus-input pr-10 text-sm"
                placeholder="Nova senha temporária"
                value={form.novaSenha ?? ""}
                onChange={(e) => onChange("novaSenha", e.target.value)}
              />
              <button type="button" onClick={() => setMostrarSenha((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                style={{ color: "var(--text-faint)" }}>
                {mostrarSenha ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
            {(form.novaSenha?.length ?? 0) > 0 && (form.novaSenha?.length ?? 0) < 6 && (
              <p className="text-[10px]" style={{ color: "#f87171" }}>Mínimo 6 caracteres</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function Field({ label, value, onChange, placeholder, type = "text" }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string;
}) {
  return (
    <div>
      <label className="text-[11px] font-semibold uppercase tracking-wide block mb-1.5" style={{ color: "var(--text-muted)" }}>{label}</label>
      <input type={type} className="nexus-input" placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

/* ── Sub-componentes ── */

function ActionBtn({ icon, label, color, onClick, danger }: {
  icon: React.ReactNode; label: string; color: string; onClick: () => void; danger?: boolean;
}) {
  return (
    <button onClick={onClick} title={label} className="p-1.5 rounded-lg transition-all" style={{ color: "var(--text-faint)" }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = color; (e.currentTarget as HTMLElement).style.background = danger ? "rgba(239,68,68,0.10)" : "rgba(124,58,237,0.10)"; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "var(--text-faint)"; (e.currentTarget as HTMLElement).style.background = "transparent"; }}>
      {icon}
    </button>
  );
}

function Overlay({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      {children}
    </div>
  );
}

function ModalCard({ title, children, onClose, wide }: { title: string; children: React.ReactNode; onClose: () => void; wide?: boolean }) {
  return (
    <div className={`w-full rounded-2xl p-6 ${wide ? "max-w-lg" : "max-w-md"}`}
      style={{ background: "var(--bg-surface-2)", backdropFilter: "blur(20px)", border: "1px solid var(--border-default)", boxShadow: "0 24px 64px rgba(0,0,0,0.2)" }}>
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-black text-base" style={{ color: "var(--text-heading)" }}>{title}</h3>
        <button onClick={onClose} className="p-1 rounded-lg transition-colors" style={{ color: "var(--text-faint)" }}><X size={16} /></button>
      </div>
      {children}
    </div>
  );
}

function FormUsuario({ form, onChange }: { form: typeof EMPTY_FORM; onChange: (k: string, v: string) => void }) {
  return (
    <div className="space-y-4">
      {[
        { key: "nome",  label: "Nome Completo",        placeholder: "Ex: João Silva"   },
        { key: "email", label: "E-mail",                placeholder: "joao@empresa.com" },
        { key: "login", label: "Login / Identificação", placeholder: "joao.silva"       },
      ].map((f) => (
        <div key={f.key}>
          <label className="text-[11px] font-semibold uppercase tracking-wide block mb-1.5" style={{ color: "var(--text-muted)" }}>{f.label}</label>
          <input className="nexus-input" placeholder={f.placeholder}
            value={(form as Record<string, string>)[f.key]}
            onChange={(e) => onChange(f.key, e.target.value)} />
        </div>
      ))}
      <div>
        <label className="text-[11px] font-semibold uppercase tracking-wide block mb-1.5" style={{ color: "var(--text-muted)" }}>Papel / Role</label>
        <div className="relative">
          <select className="nexus-input pr-8 appearance-none" value={form.role} onChange={(e) => onChange("role", e.target.value)}>
            {ROLES.map((r) => <option key={r}>{r}</option>)}
          </select>
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "var(--text-faint)" }} />
        </div>
      </div>
    </div>
  );
}
