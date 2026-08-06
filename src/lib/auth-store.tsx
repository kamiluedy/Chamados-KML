"use client";

// Simulação do usuário logado — em produção viria de um contexto de autenticação real
export type Role = "Administrador" | "Analista" | "Técnico N2" | "Técnico N1";

export interface UsuarioLogado {
  id: number;
  nome: string;
  email: string;
  avatar: string;
  role: Role;
  grupoId?: string;
}

export const USUARIO_LOGADO: UsuarioLogado = {
  id: 1,
  nome: "Kamila Luedy",
  email: "kamila.luedy@kmltech.com.br",
  avatar: "KL",
  role: "Administrador",
  grupoId: "g1",
};

export function isAdmin()    { return USUARIO_LOGADO.role === "Administrador"; }
export function isAnalista() { return USUARIO_LOGADO.role === "Analista"; }
export function isTecnico()  { return USUARIO_LOGADO.role === "Técnico N1" || USUARIO_LOGADO.role === "Técnico N2"; }

export function podeGerenciarGrupo(grupoId: string) {
  if (isAdmin()) return true;
  if (isAnalista()) return USUARIO_LOGADO.grupoId === grupoId;
  return false;
}

export function podeApagarColunaEquipe() {
  return isAdmin() || isAnalista();
}
