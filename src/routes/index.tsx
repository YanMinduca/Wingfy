import { createFileRoute, redirect } from "@tanstack/react-router";

// A landing page será criada depois. Até lá, a raiz leva direto ao cadastro.
export const Route = createFileRoute("/")({
  beforeLoad: () => {
    throw redirect({ to: "/cadastro", replace: true });
  },
});
