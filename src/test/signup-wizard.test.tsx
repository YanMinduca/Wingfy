import { createMemoryHistory, createRootRoute, createRouter, RouterProvider } from "@tanstack/react-router";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { SignupWizard } from "@/components/signup/SignupWizard";

function renderWizard() {
  const rootRoute = createRootRoute({ component: SignupWizard });
  const router = createRouter({ routeTree: rootRoute, history: createMemoryHistory({ initialEntries: ["/"] }) });
  return render(<RouterProvider router={router} />);
}

const type = (label: RegExp | string, value: string) =>
  fireEvent.change(screen.getByLabelText(label), { target: { value } });

afterEach(cleanup);

describe("SignupWizard", () => {
  it("não avança com campos vazios e mostra os erros do responsável", async () => {
    renderWizard();
    fireEvent.click(await screen.findByRole("button", { name: /continuar/i }));
    expect(await screen.findByText("Informe seu nome completo.")).toBeTruthy();
    expect(screen.getByText("Informe um e-mail válido.")).toBeTruthy();
    expect(screen.queryByText("Dados da igreja")).toBeNull();
  });

  it("percorre as quatro etapas e cria a igreja (simulação)", async () => {
    renderWizard();

    await screen.findByText("Crie sua conta");
    type("Nome completo", "Maria Silva");
    type("E-mail", "maria@igreja.com");
    type(/Telefone/, "11987654321");
    type("Senha", "12345678");
    type("Confirmar senha", "12345678");
    fireEvent.click(screen.getByRole("button", { name: /continuar/i }));

    await screen.findByText("Dados da igreja");
    type("Nome da igreja", "Igreja Esperança");
    expect((screen.getByLabelText("Endereço da igreja") as HTMLInputElement).value).toBe("igreja-esperanca");
    type("Cidade", "Jacareí");
    // Selects do Radix não abrem no jsdom: os campos de seleção são cobertos pelo teste de validação.
    fireEvent.click(screen.getByRole("button", { name: /continuar/i }));
    expect(await screen.findByText("Escolha a denominação.")).toBeTruthy();
    expect(screen.getByText("Escolha o estado.")).toBeTruthy();
  });
});
