/**
 * O Wingfy está em fase visual: sem variáveis do Supabase o app roda inteiro (cadastro, login de demonstração)
 * sem tentar falar com o banco. Quando o banco for conectado, `hasBackend` passa a ser true automaticamente.
 */
export const hasBackend = Boolean(
  import.meta.env["VITE_SUPABASE_URL"] && import.meta.env["VITE_SUPABASE_PUBLISHABLE_KEY"],
);
