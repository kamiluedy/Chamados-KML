"use client";

import { useState, useRef } from "react";
import { Lock, Camera, Eye, EyeOff, CheckCircle2, Mail, User, Hash } from "lucide-react";

const LOCKED_FIELDS = [
  { icon: <User  size={14} />, label: "Nome Completo",         value: "Kamila Luedy"                        },
  { icon: <Mail  size={14} />, label: "E-mail",                value: "kamila.luedy@kmltech.com.br" },
  { icon: <Hash  size={14} />, label: "Login / Identificação", value: "kamila.luedy"                        },
];

export default function EditarPerfil() {
  const [avatarSrc, setAvatarSrc] = useState<string | null>(null);
  const [senha, setSenha] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [showSenha, setShowSenha] = useState(false);
  const [showConfirmar, setShowConfirmar] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  function handleAvatar(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setAvatarSrc(reader.result as string);
    reader.readAsDataURL(file);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (senha && senha.length < 8) { setError("A senha deve ter no mínimo 8 caracteres."); return; }
    if (senha !== confirmar) { setError("As senhas não coincidem."); return; }
    await new Promise((r) => setTimeout(r, 800));
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
    setSenha(""); setConfirmar("");
  }

  return (
    <div className="max-w-lg mx-auto">
      <div className="mb-6">
        <h2 className="font-black text-lg tracking-tight" style={{ color: "var(--text-heading)" }}>
          Editar Perfil
        </h2>
        <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
          Você pode alterar sua foto de perfil e senha. Dados de identificação são gerenciados pelo administrador.
        </p>
      </div>

      <form onSubmit={handleSave} className="glass rounded-2xl p-6 sm:p-8 space-y-6">

        {/* ── Avatar ── */}
        <div className="flex flex-col items-center gap-3">
          <div className="relative">
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center text-2xl font-black text-white overflow-hidden"
              style={{ background: "linear-gradient(135deg,#7c3aed,#6d28d9)", border: "3px solid rgba(124,58,237,0.5)" }}
            >
              {avatarSrc
                ? <img src={avatarSrc} alt="Avatar" className="w-full h-full object-cover" />
                : "KL"
              }
            </div>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="absolute -bottom-1 -right-1 w-7 h-7 rounded-lg flex items-center justify-center btn-neon"
              title="Alterar foto"
            >
              <Camera size={13} />
            </button>
          </div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatar} />
          <p className="text-[11px]" style={{ color: "var(--text-faint)" }}>
            Clique no ícone para alterar a foto
          </p>
        </div>

        {/* ── Campos bloqueados ── */}
        <div className="space-y-3">
          <p className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: "var(--text-faint)" }}>
            Dados de identificação (somente leitura)
          </p>
          {LOCKED_FIELDS.map((f) => (
            <div key={f.label}>
              <label
                className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide mb-1.5"
                style={{ color: "var(--text-muted)" }}
              >
                <span className="text-violet-400">{f.icon}</span>
                {f.label}
                <Lock size={10} className="ml-auto" style={{ color: "var(--text-faint)" }} />
              </label>
              <div
                className="w-full px-3 py-2.5 rounded-lg text-sm flex items-center gap-2"
                style={{
                  background: "rgba(124,58,237,0.04)",
                  border: "1px solid var(--border-subtle)",
                  color: "var(--text-muted)",
                  cursor: "not-allowed",
                }}
              >
                <span className="text-violet-300/50"><Lock size={12} /></span>
                {f.value}
              </div>
            </div>
          ))}
        </div>

        {/* ── Alterar senha ── */}
        <div className="space-y-3" style={{ paddingTop: "8px", borderTop: "1px solid var(--border-subtle)" }}>
          <p className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: "var(--text-faint)" }}>
            Alterar senha
          </p>

          <div>
            <label className="text-[11px] font-semibold uppercase tracking-wide mb-1.5 block" style={{ color: "var(--text-muted)" }}>
              Nova Senha
            </label>
            <div className="relative">
              <input
                type={showSenha ? "text" : "password"}
                placeholder="Mínimo 8 caracteres"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                className="nexus-input pr-10"
              />
              <button
                type="button"
                onClick={() => setShowSenha((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
                style={{ color: "var(--text-faint)" }}
              >
                {showSenha ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          <div>
            <label className="text-[11px] font-semibold uppercase tracking-wide mb-1.5 block" style={{ color: "var(--text-muted)" }}>
              Confirmar Nova Senha
            </label>
            <div className="relative">
              <input
                type={showConfirmar ? "text" : "password"}
                placeholder="Repita a senha"
                value={confirmar}
                onChange={(e) => setConfirmar(e.target.value)}
                className="nexus-input pr-10"
              />
              <button
                type="button"
                onClick={() => setShowConfirmar((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
                style={{ color: "var(--text-faint)" }}
              >
                {showConfirmar ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {/* Indicador de força */}
          {senha && (
            <div className="flex gap-1">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="flex-1 h-1 rounded-full transition-all duration-300"
                  style={{
                    background:
                      senha.length >= i * 3
                        ? i <= 1 ? "#ef4444" : i <= 2 ? "#f59e0b" : i <= 3 ? "#3b82f6" : "#10b981"
                        : "var(--border-subtle)",
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Erro */}
        {error && (
          <p className="text-xs text-rose-500 bg-rose-500/10 border border-rose-500/20 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        {/* Sucesso */}
        {saved && (
          <div className="flex items-center gap-2 text-xs text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-2">
            <CheckCircle2 size={14} />
            Perfil atualizado com sucesso!
          </div>
        )}

        <button type="submit" className="w-full btn-neon py-3 text-sm">
          Salvar Alterações
        </button>
      </form>
    </div>
  );
}

