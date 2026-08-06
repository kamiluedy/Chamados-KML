"use client";

import { createContext, useContext, useState, ReactNode } from "react";

export interface UsuarioBase {
  id: number;
  nome: string;
  email: string;
  avatar: string;
  role: string;
}

export interface Subcategoria {
  id: string;
  nome: string;
}

export interface Grupo {
  id: string;
  nome: string;
  descricao: string;
  cor: string;
  membros: UsuarioBase[];
  categorias: Subcategoria[];
}

export const USUARIOS_INICIAIS: UsuarioBase[] = [
  { id: 1, nome: "Kamila Luedy",    email: "kamila.luedy@kmltech.com.br",  avatar: "KL", role: "Administrador" },
  { id: 2, nome: "Marcos Vinicius", email: "marcos.v@kmltech.com.br",      avatar: "MV", role: "Técnico N2"    },
  { id: 3, nome: "Fernanda Reis",   email: "fernanda.r@kmltech.com.br",    avatar: "FR", role: "Técnico N1"    },
  { id: 4, nome: "Pedro Mota",      email: "pedro.m@kmltech.com.br",       avatar: "PM", role: "Técnico N1"    },
  { id: 5, nome: "Ana Cláudia",     email: "ana.c@kmltech.com.br",         avatar: "AC", role: "Analista"      },
];

const GRUPOS_INICIAIS: Grupo[] = [
  {
    id: "g1",
    nome: "TI / Infraestrutura",
    descricao: "Responsável por rede, hardware e sistemas operacionais",
    cor: "#7c3aed",
    membros: [USUARIOS_INICIAIS[0], USUARIOS_INICIAIS[1]],
    categorias: [
      { id: "c1", nome: "Rede / Conectividade" },
      { id: "c2", nome: "Hardware / Periféricos" },
      { id: "c3", nome: "Software / Sistema Operacional" },
    ],
  },
  {
    id: "g2",
    nome: "Suporte / Acesso",
    descricao: "Gestão de acessos, senhas e autenticação",
    cor: "#0ea5e9",
    membros: [USUARIOS_INICIAIS[2], USUARIOS_INICIAIS[3]],
    categorias: [
      { id: "c4", nome: "Acesso / Autenticação" },
      { id: "c5", nome: "Acesso / Moodle" },
      { id: "c6", nome: "E-mail / Comunicação" },
    ],
  },
  {
    id: "g3",
    nome: "Dados & Automação",
    descricao: "Scripts, bots, banco de dados e integrações",
    cor: "#10b981",
    membros: [USUARIOS_INICIAIS[0], USUARIOS_INICIAIS[4]],
    categorias: [
      { id: "c7", nome: "Automação / Scripts / Bots" },
      { id: "c8", nome: "Banco de Dados / PostgreSQL" },
    ],
  },
];

interface GruposCtx {
  grupos: Grupo[];
  addGrupo: (g: Omit<Grupo, "id">) => void;
  updateGrupo: (id: string, g: Partial<Omit<Grupo, "id">>) => void;
  deleteGrupo: (id: string) => void;
  getGrupoPorCategoria: (categoria: string) => Grupo | undefined;
}

const Ctx = createContext<GruposCtx | null>(null);

export function GruposProvider({ children }: { children: ReactNode }) {
  const [grupos, setGrupos] = useState<Grupo[]>(GRUPOS_INICIAIS);

  function addGrupo(g: Omit<Grupo, "id">) {
    const id = `g${Date.now()}`;
    setGrupos((prev) => [...prev, { id, ...g }]);
  }

  function updateGrupo(id: string, patch: Partial<Omit<Grupo, "id">>) {
    setGrupos((prev) => prev.map((g) => g.id === id ? { ...g, ...patch } : g));
  }

  function deleteGrupo(id: string) {
    setGrupos((prev) => prev.filter((g) => g.id !== id));
  }

  function getGrupoPorCategoria(categoria: string) {
    return grupos.find((g) =>
      g.categorias.some((c) => c.nome === categoria)
    );
  }

  return (
    <Ctx.Provider value={{ grupos, addGrupo, updateGrupo, deleteGrupo, getGrupoPorCategoria }}>
      {children}
    </Ctx.Provider>
  );
}

export function useGrupos() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useGrupos must be inside GruposProvider");
  return ctx;
}
