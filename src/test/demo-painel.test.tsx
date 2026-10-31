import { QueryClient } from "@tanstack/react-query";
import { createMemoryHistory, createRouter, RouterProvider } from "@tanstack/react-router";
import { cleanup, render, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DEMO_EMAIL, resetDemoData } from "@/integrations/supabase/demo-client";
import { routeTree } from "@/routeTree.gen";

// Abre cada tela do painel com o login fake e confere que nenhuma cai na tela de erro.
const PATHS = [
  "/painel",
  "/painel/meu-cadastro",
  "/painel/oracao",
  "/painel/membros",
  "/painel/membro/m-2",
  "/painel/departamentos",
  "/painel/departamento/d-1",
  "/painel/eventos",
  "/painel/evento/e-1",
  "/painel/financeiro",
  "/painel/relatorio",
  "/painel/permissoes",
  "/painel/notificacoes",
  "/painel/escalas",
];

beforeEach(async () => {
  // jsdom não tem ResizeObserver (usado pelos gráficos e pelos switches)
  vi.stubGlobal("ResizeObserver", class { observe() {} unobserve() {} disconnect() {} });
  window.localStorage.clear();
  resetDemoData();
  const { supabase } = await import("@/integrations/supabase/client");
  await supabase.auth.signInWithPassword({ email: DEMO_EMAIL, password: "x" });
  vi.spyOn(console, "error").mockImplementation(() => undefined);
  vi.spyOn(console, "warn").mockImplementation(() => undefined);
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("painel em modo demonstração", () => {
  it.each(PATHS)("abre %s sem erro", async (path) => {
    const router = createRouter({
      routeTree,
      context: { queryClient: new QueryClient({ defaultOptions: { queries: { retry: false } } }) },
      history: createMemoryHistory({ initialEntries: [path] }),
    });
    // O shell raiz renderiza <html>; por isso a rota é carregada antes e o React monta direto no document.
    await router.load();
    render(<RouterProvider router={router} />, { container: document as unknown as HTMLElement });

    // Espera o layout do painel aparecer (menu lateral com a marca)
    await waitFor(() => expect(document.body.textContent).toContain("Visão geral"), { timeout: 4000 });
    // Dá tempo das consultas terminarem
    await new Promise((r) => setTimeout(r, 400));

    const text = document.body.textContent ?? "";
    expect(text).not.toContain("Esta página não carregou");
    expect(text).not.toContain("Página não encontrada");
    expect(router.state.location.pathname).toBe(path);
  });
});
