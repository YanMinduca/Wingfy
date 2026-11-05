# Eccles

SaaS de administração de igrejas. Cada igreja cria o próprio espaço e mantém o sistema ativo com uma assinatura mensal ou anual.

Base do projeto: [Aava](https://github.com/YanMinduca/Aava) (TanStack Start + React + Tailwind + Supabase), com a mesma estrutura de pastas.

## Estado atual

- **Cadastro** em `/cadastro`: responsável, dados da igreja, plano (mensal/anual) e confirmação. Com o Supabase conectado, **cria a conta, a igreja e a assinatura (status `pendente`)** de uma vez; nenhuma cobrança é feita ainda.
- **Painel do CEO** em `/painel/ceo` (menu "Painel do CEO", só para o papel `ceo`): total de usuários e de igrejas, novos em 7/30 dias, cadastros por dia, assinaturas por status/plano e lista de igrejas com responsável. Os números vêm das funções `platform_stats` e `platform_churches` (migração `0024`).
- **Login fake** em `/auth`: qualquer e-mail e senha entram (já vem preenchido `demo@eccles.app` / `demo1234`). A sessão fica no `localStorage`.
- **Landing page**: removida. A rota `/` redireciona para `/cadastro` até a landing ser criada.
- **Painel** (`/painel/*`) liberado para teste, com acesso total (CEO) e dados de exemplo: membros, departamentos, eventos, financeiro, oração, permissões. Migrações (`drizzle/`) e funções (`supabase/`) vieram do Aava e ficam como base para o banco real.

### Modo demonstração

Sem `VITE_SUPABASE_URL` e `VITE_SUPABASE_PUBLISHABLE_KEY`, `src/integrations/supabase/client.ts` usa o cliente de `demo-client.ts`: um Supabase falso em memória, sem rede. Criar, editar e apagar funciona, mas os dados voltam ao exemplo ao recarregar a página. Uploads, notificações push e as telas de escalas ficam sem dados. Um aviso aparece no topo do painel.

Os planos e preços do cadastro são provisórios e ficam em `src/lib/plans.ts`.

## Desenvolvimento

Precisa de Node.js e npm.

```sh
npm i
npm run dev
```

Outros comandos: `npm run build`, `npm run lint`, `npm test`.

## Quando conectar o banco

Crie `.env` com `VITE_SUPABASE_URL` e `VITE_SUPABASE_PUBLISHABLE_KEY`. Com elas definidas, o app deixa o modo demonstração sozinho: login e painel passam a usar o banco real (e o aviso some). O cadastro (`finish()` em `src/components/signup/SignupWizard.tsx`) chama `supabase.auth.signUp` com os dados da igreja em `options.data`; o gatilho `handle_new_user` do banco grava perfil, papel, igreja e assinatura. Há um `.env.example` com as duas variáveis do projeto Wingfy; defina as mesmas na Vercel/Lovable.

**Quem vira CEO:** a primeira conta criada no banco recebe o papel `ceo`; as seguintes entram como `member`. Crie a sua conta antes de divulgar o link de cadastro.
