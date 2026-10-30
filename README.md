# Wingfy

SaaS de administração de igrejas. Cada igreja cria o próprio espaço e mantém o sistema ativo com uma assinatura mensal ou anual.

Base do projeto: [Aava](https://github.com/YanMinduca/Aava) (TanStack Start + React + Tailwind + Supabase), com a mesma estrutura de pastas.

## Estado atual

- **Cadastro** em `/cadastro`: responsável, dados da igreja, plano (mensal/anual) e confirmação. **Somente visual**: nada é salvo e nenhuma cobrança é feita.
- **Login** em `/auth`: tela visual. Sem banco conectado, apenas informa que é uma demonstração.
- **Landing page**: removida. A rota `/` redireciona para `/cadastro` até a landing ser criada.
- **Painel** (`/painel/*`), eventos, convites, migrações (`drizzle/`) e funções (`supabase/`) vieram do Aava e ficam como base para as próximas etapas. Sem as variáveis do Supabase o painel não abre (redireciona para `/auth`).

Os planos e preços do cadastro são provisórios e ficam em `src/lib/plans.ts`.

## Desenvolvimento

Precisa de Node.js e npm.

```sh
npm i
npm run dev
```

Outros comandos: `npm run build`, `npm run lint`, `npm test`.

## Quando conectar o banco

Crie `.env` com `VITE_SUPABASE_URL` e `VITE_SUPABASE_PUBLISHABLE_KEY`. Com elas definidas, `src/lib/backend.ts` passa a liberar o login e o painel automaticamente. O envio do cadastro (`finish()` em `src/components/signup/SignupWizard.tsx`) ainda precisa ser ligado à criação da conta, da igreja e da assinatura.
# Wingfy
