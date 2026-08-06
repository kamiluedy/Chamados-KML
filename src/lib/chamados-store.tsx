"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export type Prioridade = "Crítica" | "Alta" | "Média" | "Baixa";
export type Status = "todo" | "doing" | "aguardando" | "done";

export interface Mensagem {
  id: string;
  autor: string;
  avatar: string;
  tipo: "tecnico" | "solicitante" | "sistema";
  texto: string;
  hora: string;
  arquivo?: { nome: string; tipo: "pdf" | "img" | "outro" };
}

export interface Tecnico {
  id: string;
  nome: string;
  avatar: string;
  setor: string;
}

export interface Chamado {
  id: string;
  titulo: string;
  descricao: string;
  prioridade: Prioridade;
  categoria: string;
  grupoCategoria: string;
  solicitante: string;
  setor: string;
  dataHora: string;
  avatar: string;
  status: Status;
  tecnicosAtribuidos: Tecnico[];
  mensagens: Mensagem[];
  obsInternas: string;
  pendente: boolean;
}

export const STATUS_LABEL: Record<Status, string> = {
  todo:       "A Fazer",
  doing:      "Em Progresso",
  aguardando: "Aguard. Solicitante",
  done:       "Concluído",
};

/* Mapeamento para os labels em PT usados nos Relatórios */
export const STATUS_LABEL_RELATORIO: Record<Status, string> = {
  todo:       "Aberto",
  doing:      "Em andamento",
  aguardando: "Em andamento",
  done:       "Resolvido",
};

const TODOS_TECNICOS: Tecnico[] = [
  { id: "t1", nome: "Kamila Luedy",    avatar: "KL", setor: "TI / Dados"       },
  { id: "t2", nome: "Marcos Vinicius", avatar: "MV", setor: "Dados & BI"       },
  { id: "t3", nome: "Ana Cláudia",     avatar: "AC", setor: "Infraestrutura"   },
  { id: "t4", nome: "Fernanda Reis",   avatar: "FR", setor: "Suporte"          },
  { id: "t5", nome: "Pedro Mota",      avatar: "PM", setor: "Infraestrutura"   },
  { id: "t6", nome: "Julio Andrade",   avatar: "JA", setor: "TI / Dados"       },
];

const ATRIBUICAO_AUTO: Record<string, string[]> = {
  "Banco":     ["t1", "t2"],
  "Rede":      ["t1", "t3", "t5"],
  "Hardware":  ["t3", "t5"],
  "Acesso":    ["t4", "t6"],
  "Automação": ["t1", "t2", "t6"],
  "Software":  ["t3", "t4"],
};

function tecnicosAuto(categoria: string): Tecnico[] {
  const ids = ATRIBUICAO_AUTO[categoria] ?? ["t1", "t3"];
  return TODOS_TECNICOS.filter((t) => ids.includes(t.id));
}

const MENSAGENS_INICIAIS: Mensagem[] = [
  { id: "m1", autor: "Sistema",         avatar: "S",  tipo: "sistema",     texto: "Chamado aberto.", hora: "17/06 09:14" },
];

interface SeedChamado {
  id: string; titulo: string; descricao: string; prioridade: Prioridade;
  categoria: string; solicitante: string; setor: string; dataHora: string;
  avatar: string; grupoCategoria: string; status: Status;
}

const DEFAULTS: Chamado[] = ([
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
] as SeedChamado[]).map((c) => ({
  ...c,
  tecnicosAtribuidos: tecnicosAuto(c.categoria),
  mensagens: MENSAGENS_INICIAIS,
  obsInternas: "",
  pendente: false,
}));

const KEY = "nexus-chamados";

function gerarId(existentes: Chamado[]): string {
  const nums = existentes
    .map((c) => parseInt(c.id.replace("#", ""), 10))
    .filter((n) => !isNaN(n));
  const proximo = (nums.length ? Math.max(...nums) : 0) + 1;
  return `#${String(proximo).padStart(4, "0")}`;
}

function avatarDe(nome: string): string {
  const partes = nome.trim().split(/\s+/);
  return ((partes[0]?.[0] ?? "") + (partes[1]?.[0] ?? "")).toUpperCase() || "??";
}

interface NovoChamadoInput {
  titulo: string;
  descricao: string;
  prioridade: Prioridade;
  categoria: string;
  grupoCategoria: string;
  solicitante: string;
  setor: string;
}

interface Ctx {
  chamados: Chamado[];
  addChamado: (input: NovoChamadoInput) => Chamado;
  updateChamado: (id: string, patch: Partial<Chamado>) => void;
  getChamado: (id: string) => Chamado | undefined;
}

const ChamadosContext = createContext<Ctx | null>(null);

export function ChamadosProvider({ children }: { children: ReactNode }) {
  const [chamados, setChamados] = useState<Chamado[]>(DEFAULTS);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setChamados(JSON.parse(raw));
    } catch { /* ignore */ }
  }, []);

  function persist(next: Chamado[]) {
    setChamados(next);
    localStorage.setItem(KEY, JSON.stringify(next));
  }

  function addChamado(input: NovoChamadoInput): Chamado {
    const agora = new Date();
    const dataHora = agora.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }) +
      " — " + agora.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

    const novo: Chamado = {
      id: gerarId(chamados),
      titulo: input.titulo,
      descricao: input.descricao,
      prioridade: input.prioridade,
      categoria: input.categoria,
      grupoCategoria: input.grupoCategoria,
      solicitante: input.solicitante,
      setor: input.setor,
      dataHora,
      avatar: avatarDe(input.solicitante),
      status: "todo",
      tecnicosAtribuidos: tecnicosAuto(input.categoria),
      mensagens: [
        { id: `m${Date.now()}`, autor: "Sistema", avatar: "S", tipo: "sistema", texto: "Chamado aberto.", hora: "agora" },
      ],
      obsInternas: "",
      pendente: false,
    };
    persist([novo, ...chamados]);
    return novo;
  }

  function updateChamado(id: string, patch: Partial<Chamado>) {
    persist(chamados.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  }

  function getChamado(id: string) {
    return chamados.find((c) => c.id === id);
  }

  return (
    <ChamadosContext.Provider value={{ chamados, addChamado, updateChamado, getChamado }}>
      {children}
    </ChamadosContext.Provider>
  );
}

export function useChamados() {
  const ctx = useContext(ChamadosContext);
  if (!ctx) throw new Error("useChamados must be inside ChamadosProvider");
  return ctx;
}
