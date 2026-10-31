export type Billing = "mensal" | "anual";

export type Plan = {
  id: string;
  name: string;
  description: string;
  /** Preço mensal em reais, cobrado mês a mês. */
  monthly: number;
  /** Preço anual em reais, cobrado uma vez por ano. */
  yearly: number;
  members: string;
  features: string[];
  highlight?: boolean;
};

/**
 * Valores e recursos provisórios, só para a parte visual.
 * Ajuste aqui e o cadastro inteiro (cards, resumo e confirmação) acompanha.
 */
export const PLANS: Plan[] = [
  {
    id: "essencial",
    name: "Essencial",
    description: "Para igrejas pequenas que estão começando a se organizar.",
    monthly: 49,
    yearly: 490,
    members: "Até 100 membros",
    features: ["Cadastro de membros", "Departamentos e escalas", "Financeiro básico", "1 administrador"],
  },
  {
    id: "crescimento",
    name: "Crescimento",
    description: "Para igrejas em crescimento que precisam de mais controle.",
    monthly: 99,
    yearly: 990,
    members: "Até 500 membros",
    features: ["Tudo do Essencial", "Eventos com ingresso e check-in", "Relatórios financeiros", "Notificações push", "Até 5 administradores"],
    highlight: true,
  },
  {
    id: "completo",
    name: "Completo",
    description: "Para igrejas grandes ou com várias congregações.",
    monthly: 199,
    yearly: 1990,
    members: "Membros ilimitados",
    features: ["Tudo do Crescimento", "Permissões por cargo e departamento", "Exportações em XLS", "Administradores ilimitados"],
  },
];

export const priceOf = (plan: Plan, billing: Billing) => (billing === "anual" ? plan.yearly : plan.monthly);

/** Quanto o plano anual economiza em relação a 12 mensalidades. */
export const yearlySavings = (plan: Plan) => plan.monthly * 12 - plan.yearly;

/** Preço anual dividido por 12, para comparar com o mensal. */
export const yearlyPerMonth = (plan: Plan) => plan.yearly / 12;

export const getPlan = (id: string) => PLANS.find((p) => p.id === id);
