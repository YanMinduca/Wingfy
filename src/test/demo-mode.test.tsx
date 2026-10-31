import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createMemoryHistory, createRootRoute, createRouter, RouterProvider } from "@tanstack/react-router";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { EventsCard, FinanceCards, PrayerCard, VolunteerCards } from "@/components/dashboard/DashboardCards";
import { createDemoClient, DEMO_EMAIL, resetDemoData } from "@/integrations/supabase/demo-client";

const demo = createDemoClient() as any;

beforeEach(() => {
  window.localStorage.clear();
  resetDemoData();
});
afterEach(cleanup);

describe("login fake", () => {
  it("começa deslogado e entra com qualquer e-mail e senha", async () => {
    expect((await demo.auth.getUser()).data.user).toBeNull();

    const seen: string[] = [];
    const sub = demo.auth.onAuthStateChange((event: string) => seen.push(event));
    const { error } = await demo.auth.signInWithPassword({ email: "pastor@igreja.com", password: "qualquer" });

    expect(error).toBeNull();
    expect((await demo.auth.getUser()).data.user.email).toBe("pastor@igreja.com");
    expect(seen).toEqual(["SIGNED_IN"]);
    sub.data.subscription.unsubscribe();
  });

  it("mantém a sessão após recarregar e sai com signOut", async () => {
    await demo.auth.signInWithPassword({ email: DEMO_EMAIL, password: "x" });
    expect((await demo.auth.getSession()).data.session).not.toBeNull();
    await demo.auth.signOut();
    expect((await demo.auth.getUser()).data.user).toBeNull();
  });

  it("a pessoa logada é CEO (acesso total ao painel)", async () => {
    await demo.auth.signInWithPassword({ email: DEMO_EMAIL, password: "x" });
    const { data: u } = await demo.auth.getUser();
    const { data } = await demo.from("user_roles").select("role").eq("user_id", u.user.id);
    expect(data.map((r: any) => r.role)).toContain("ceo");
  });
});

describe("dados de exemplo", () => {
  it("filtra, ordena, conta e limita como o Supabase", async () => {
    const ativos = await demo.from("members").select("*").eq("status", "membro_ativo").order("full_name");
    expect(ativos.data.length).toBeGreaterThan(3);
    expect(ativos.data.map((m: any) => m.full_name)).toEqual([...ativos.data.map((m: any) => m.full_name)].sort());

    const contagem = await demo.from("members").select("id", { count: "exact", head: true });
    expect(contagem.count).toBe(12);
    expect(contagem.data).toBeNull();

    expect((await demo.from("members").select("*").limit(3)).data).toHaveLength(3);
    expect((await demo.from("members").select("*").eq("id", "nao-existe").maybeSingle()).data).toBeNull();
  });

  it("cria, edita e apaga registros em memória", async () => {
    const criado = await demo.from("members").insert({ full_name: "Novo Membro", status: "visitante" }).select().single();
    expect(criado.data.id).toBeTruthy();
    expect((await demo.from("members").select("id", { count: "exact", head: true })).count).toBe(13);

    await demo.from("members").update({ full_name: "Nome Editado" }).eq("id", criado.data.id);
    expect((await demo.from("members").select("*").eq("id", criado.data.id).single()).data.full_name).toBe("Nome Editado");

    await demo.from("members").delete().eq("id", criado.data.id);
    expect((await demo.from("members").select("id", { count: "exact", head: true })).count).toBe(12);
  });

  it("resolve relações embutidas e funções do banco", async () => {
    const regs = await demo.from("event_registrations").select("*, events(slug, title)").eq("id", "er-1").single();
    expect(regs.data.events.slug).toBe("culto-de-celebracao");

    const deps = (await demo.rpc("department_overview")).data;
    expect(deps).toHaveLength(4);
    expect(deps[0].member_count).toBeGreaterThan(0);
    expect(deps[0].leader_name).toBeTruthy();

    const roster = (await demo.rpc("department_roster", { _dept: "d-1" })).data;
    expect(roster.some((r: any) => r.is_leader)).toBe(true);
    expect((await demo.rpc("funcao_desconhecida")).error).toBeNull();
  });
});

function renderCards(ui: React.ReactNode) {
  const root = createRootRoute({ component: () => <>{ui}</> });
  const router = createRouter({ routeTree: root, history: createMemoryHistory({ initialEntries: ["/"] }) });
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  );
}

describe("cards do dashboard com a sessão fake", () => {
  it("mostram voluntários, dizimistas, evento e pedido de oração", async () => {
    // useAccess usa o cliente global (demo, pois não há variáveis do Supabase nos testes)
    const { supabase } = await import("@/integrations/supabase/client");
    await supabase.auth.signInWithPassword({ email: DEMO_EMAIL, password: "x" });

    renderCards(
      <>
        <VolunteerCards />
        <FinanceCards />
        <EventsCard />
        <PrayerCard />
      </>,
    );

    expect(await screen.findByText("Voluntários")).toBeInTheDocument();
    expect(await screen.findByText("Departamentos")).toBeInTheDocument();
    expect(await screen.findByText("Culto de Celebração")).toBeInTheDocument();
    expect(await screen.findByText("Saúde da família")).toBeInTheDocument();
  });
});
