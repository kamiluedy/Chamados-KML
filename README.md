# KML DESK — Sistema de Chamados de TI

KML DESK é um sistema de gestão e monitoramento de chamados de TI, pensado para ajudar empresas a organizar solicitações de suporte, acompanhar prioridades e SLAs, e ter visibilidade sobre o que está acontecendo no setor de tecnologia — tudo em um único painel.

O objetivo é dar a times de TI (mesmo pequenos ou de uma pessoa só) uma ferramenta simples para:

- Abrir e acompanhar chamados de suporte (hardware, acesso, rede, automação, banco de dados, etc.)
- Visualizar o fluxo de atendimento em um quadro estilo Kanban (A Fazer / Em Progresso / Concluído)
- Gerar relatórios e exportar o histórico de chamados
- Monitorar segurança: sessões ativas, tentativas de login, acessos externos
- Acompanhar indicadores em um dashboard (tempo médio de atendimento, satisfação, volume por hora, etc.)
- Gerenciar usuários, grupos e tarefas internas da equipe
- Personalizar configurações gerais do sistema (identidade, turno de trabalho, política de senha, notificações)

## Tecnologias utilizadas

- **[Next.js](https://nextjs.org)** — framework React (App Router)
- **[React](https://react.dev)**
- **[TypeScript](https://www.typescriptlang.org)**
- **[Tailwind CSS](https://tailwindcss.com)** — estilização
- **[Lucide React](https://lucide.dev)** — ícones

## Rodando o projeto localmente

```bash
npm install
npm run dev
```

Depois acesse [http://localhost:3000](http://localhost:3000) no navegador.

## Estrutura do projeto

```
src/
  app/          # rotas e layout (Next.js App Router)
  components/   # componentes de interface (quadro de chamados, dashboard, relatórios, etc.)
  context/      # contextos React (tema claro/escuro)
  lib/          # stores e utilitários compartilhados
```

---

Feito por Kamila Luedy.
