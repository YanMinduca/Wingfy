# Eccles

SaaS de administração de igrejas. Cada igreja cria o próprio espaço e mantém o sistema ativo com uma assinatura mensal ou anual.

Base do projeto: [Aava](https://github.com/YanMinduca/Aava) (TanStack Start + React + Tailwind + Supabase), com a mesma estrutura de pastas.

## Estado atual

- **Cadastro** em `/cadastro`: responsável, dados da igreja, plano (mensal/anual) e confirmação. **Somente visual**: nada é salvo e nenhuma cobrança é feita.
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

Crie `.env` com `VITE_SUPABASE_URL` e `VITE_SUPABASE_PUBLISHABLE_KEY`. Com elas definidas, o app deixa o modo demonstração sozinho: login e painel passam a usar o banco real (e o aviso some). O envio do cadastro (`finish()` em `src/components/signup/SignupWizard.tsx`) ainda precisa ser ligado à criação da conta, da igreja e da assinatura.
