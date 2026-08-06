"use client";

import { useState } from "react";
import {
  Send, AlertTriangle, CheckCircle2, Loader2,
  User, Building2, Tag, Zap, FileText,
} from "lucide-react";
import { useGrupos } from "@/lib/grupos-store";
import { useConfig, slaLabel } from "@/lib/config-store";
import { useChamados, type Prioridade } from "@/lib/chamados-store";

const URGENCIAS = [
  { value: "baixa",   label: "Baixa — não urgente",               color: "text-emerald-500" },
  { value: "media",   label: "Média — impacta produtividade",      color: "text-yellow-500"  },
  { value: "alta",    label: "Alta — serviço/sistema parado",      color: "text-red-500"     },
  { value: "critica", label: "Crítica — impacto geral na empresa", color: "text-rose-500"    },
];

type Estado = "idle" | "loading" | "success";

interface Form {
  nome: string;
  setor: string;
  categoria: string;
  urgencia: string;
  descricao: string;
}

const EMPTY: Form = { nome: "", setor: "", categoria: "", urgencia: "media", descricao: "" };

const URGENCIA_PRIORIDADE: Record<string, Prioridade> = {
  baixa: "Baixa",
  media: "Média",
  alta: "Alta",
  critica: "Crítica",
};

export default function NovoChamado({ onSuccess }: { onSuccess?: () => void }) {
  const { grupos, getGrupoPorCategoria } = useGrupos();
  const { config } = useConfig();
  const { addChamado } = useChamados();
  const [form, setForm] = useState<Form>(EMPTY);
  const [estado, setEstado] = useState<Estado>("idle");
  const [protocolo, setProtocolo] = useState("");

  // Todas as categorias de todos os grupos, sem duplicatas
  const todasCategorias = [
    ...new Map(
      grupos.flatMap((g) => g.categorias).map((c) => [c.nome, c])
    ).values(),
  ];

  function set(k: keyof Form, v: string) {
    setForm((p) => ({ ...p, [k]: v }));
  }

  function validate(): string | null {
    if (!form.nome.trim())      return "Informe o nome do colaborador.";
    if (!form.setor.trim())     return "Informe o setor.";
    if (!form.categoria)        return "Selecione a categoria do problema.";
    if (!form.descricao.trim()) return "Descreva o ocorrido.";
    if (form.descricao.trim().length < 20) return "Descrição muito curta — forneça mais detalhes.";
    return null;
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const err = validate();
    if (err) { alert(err); return; }
    setEstado("loading");
    await new Promise((r) => setTimeout(r, 1800));
    const grupo = getGrupoPorCategoria(form.categoria);
    const novo = addChamado({
      titulo: `${form.categoria} — ${form.descricao.slice(0, 40)}${form.descricao.length > 40 ? "…" : ""}`,
      descricao: form.descricao.trim(),
      prioridade: URGENCIA_PRIORIDADE[form.urgencia] ?? "Média",
      categoria: form.categoria,
      grupoCategoria: grupo?.nome ?? "TI / Infraestrutura",
      solicitante: form.nome.trim(),
      setor: form.setor.trim(),
    });
    setProtocolo(novo.id);
    setEstado("success");
  }

  function resetForm() {
    setForm(EMPTY);
    setEstado("idle");
    setProtocolo("");
  }

  if (estado === "success") {
    return (
      <div className="max-w-xl mx-auto">
        <div className="glass rounded-2xl p-10 flex flex-col items-center text-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
            <CheckCircle2 size={32} className="text-emerald-400" />
          </div>
          <div>
            <h3 className="font-black text-xl mb-1" style={{ color: "var(--text-white)" }}>
              Chamado emitido com sucesso!
            </h3>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              Sua solicitação foi registrada na rede e uma equipe será designada em breve.
            </p>
          </div>
          <div className="bg-sky-500/10 border border-sky-500/20 rounded-xl px-8 py-4 w-full">
            <p className="text-xs mb-1" style={{ color: "var(--text-muted)" }}>Número do protocolo</p>
            <p className="text-sky-400 font-black text-3xl tracking-widest font-mono">{protocolo}</p>
            <p className="text-xs mt-1" style={{ color: "var(--text-faint)" }}>Guarde este número para acompanhamento</p>
          </div>
          <div className="flex gap-3 w-full">
            <button onClick={resetForm} className="flex-1 py-2.5 rounded-xl text-sm transition-all" style={{ border: "1px solid var(--border-subtle)", color: "var(--text-muted)" }}>
              Novo chamado
            </button>
            <button onClick={() => onSuccess?.()} className="flex-1 btn-neon py-2.5 rounded-xl text-sm">
              Ver no Kanban
            </button>
          </div>
        </div>
      </div>
    );
  }

  const urgSelecionada = URGENCIAS.find((u) => u.value === form.urgencia);

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h2 className="font-black text-lg tracking-tight" style={{ color: "var(--text-white)" }}>
          Abrir Chamado de TI
        </h2>
        <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
          Preencha o formulário e emita sua solicitação para a equipe de suporte.
        </p>
      </div>

      <form onSubmit={submit} className="glass rounded-2xl overflow-hidden">
        <div className={`h-1 w-full transition-all duration-500 ${
          form.urgencia === "critica" ? "bg-rose-500" :
          form.urgencia === "alta"    ? "bg-red-500" :
          form.urgencia === "media"   ? "bg-yellow-500" : "bg-emerald-500"
        }`} />

        <div className="p-6 sm:p-8 space-y-5">

          {/* Nome + Setor */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold tracking-wide uppercase mb-2" style={{ color: "var(--text-muted)" }}>
                <User size={12} className="text-violet-400" /> Nome do Colaborador
              </label>
              <input className="nexus-input" placeholder="Ex: Kamila Luedy" value={form.nome} onChange={(e) => set("nome", e.target.value)} />
            </div>
            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold tracking-wide uppercase mb-2" style={{ color: "var(--text-muted)" }}>
                <Building2 size={12} className="text-violet-400" /> Setor
              </label>
              <input className="nexus-input" placeholder="Ex: TI / Dados" value={form.setor} onChange={(e) => set("setor", e.target.value)} />
            </div>
          </div>

          {/* Categoria */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-semibold tracking-wide uppercase mb-2" style={{ color: "var(--text-muted)" }}>
              <Tag size={12} className="text-violet-400" /> Categoria do Problema
            </label>
            <select
              className="nexus-input"
              value={form.categoria}
              onChange={(e) => set("categoria", e.target.value)}
            >
              <option value="">— Selecione a categoria —</option>
              {todasCategorias.map((c) => (
                <option key={c.id} value={c.nome}>{c.nome}</option>
              ))}
            </select>
          </div>

          {/* Urgência */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-semibold tracking-wide uppercase mb-2" style={{ color: "var(--text-muted)" }}>
              <Zap size={12} className="text-violet-400" /> Nível de Urgência
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {URGENCIAS.map((u) => (
                <button
                  key={u.value}
                  type="button"
                  onClick={() => set("urgencia", u.value)}
                  className={`py-2.5 px-3 rounded-xl text-xs font-semibold text-left transition-all duration-200 leading-snug ${
                    form.urgencia === u.value
                      ? `border border-violet-500/60 bg-violet-500/15 ${u.color}`
                      : "border border-white/8 bg-white/2 hover:border-white/15"
                  }`}
                  style={form.urgencia !== u.value ? { color: "var(--text-muted)" } : undefined}
                >
                  {u.label}
                </button>
              ))}
            </div>
            {urgSelecionada && (
              <p className={`text-xs mt-2 flex items-center gap-1 ${urgSelecionada.color}`}>
                <AlertTriangle size={11} /> SLA:{" "}
                {slaLabel(config, form.urgencia)}
              </p>
            )}
          </div>

          {/* Descrição */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-semibold tracking-wide uppercase mb-2" style={{ color: "var(--text-muted)" }}>
              <FileText size={12} className="text-violet-400" /> Descrição do Ocorrido
            </label>
            <textarea
              className="nexus-input resize-none"
              rows={5}
              placeholder="Descreva o problema com detalhes: o que estava fazendo, quando começou, mensagens de erro..."
              value={form.descricao}
              onChange={(e) => set("descricao", e.target.value)}
            />
            <div className="flex justify-between mt-1">
              <p className="text-[11px]" style={{ color: "var(--text-faint)" }}>Mínimo de 20 caracteres</p>
              <p className={`text-[11px] ${form.descricao.length >= 20 ? "text-emerald-500" : ""}`} style={form.descricao.length < 20 ? { color: "var(--text-faint)" } : undefined}>
                {form.descricao.length} chars
              </p>
            </div>
          </div>

          {/* Resumo */}
          {form.nome && form.categoria && (
            <div className="rounded-xl p-4" style={{ background: "rgba(124,58,237,0.04)", border: "1px solid rgba(124,58,237,0.15)" }}>
              <p className="text-violet-400 text-xs font-semibold uppercase tracking-wide mb-2">Resumo do chamado</p>
              <div className="grid grid-cols-2 gap-1 text-xs">
                <span style={{ color: "var(--text-muted)" }}>Solicitante:</span>
                <span className="font-medium" style={{ color: "var(--text-secondary)" }}>{form.nome}</span>
                <span style={{ color: "var(--text-muted)" }}>Setor:</span>
                <span className="font-medium" style={{ color: "var(--text-secondary)" }}>{form.setor || "—"}</span>
                <span style={{ color: "var(--text-muted)" }}>Categoria:</span>
                <span className="font-medium" style={{ color: "var(--text-secondary)" }}>{form.categoria}</span>
                <span style={{ color: "var(--text-muted)" }}>Urgência:</span>
                <span className={`font-bold ${urgSelecionada?.color}`}>{urgSelecionada?.label.split(" — ")[0]}</span>
              </div>
            </div>
          )}

          <button type="submit" disabled={estado === "loading"} className="w-full btn-neon py-3.5 text-sm flex items-center justify-center gap-2">
            {estado === "loading" ? (
              <><Loader2 size={16} className="animate-spin" /> Emitindo chamado na rede...</>
            ) : (
              <><Send size={15} /> Emitir Chamado na Rede</>
            )}
          </button>

          <p className="text-[11px] text-center" style={{ color: "var(--text-faint)" }}>
            Ao enviar, sua solicitação será registrada e um ticket será gerado automaticamente.
          </p>
        </div>
      </form>
    </div>
  );
}
