import { createFileRoute, Link } from "@tanstack/react-router";
import { Church, Check, Users, CalendarDays, Wallet } from "lucide-react";
import { SignupWizard } from "@/components/signup/SignupWizard";
import { siteMeta } from "@/lib/site-query";
import { EcclesLogo } from "@/components/brand/EcclesLogo";

export const Route = createFileRoute("/cadastro")({
  head: () => siteMeta("Criar minha igreja — Eccles", "Crie o espaço da sua igreja no Eccles e administre membros, finanças, eventos e escalas."),
  component: CadastroPage,
});

const BENEFITS = [
  { Icon: Users, text: "Membros, departamentos e escalas num só lugar" },
  { Icon: Wallet, text: "Financeiro e relatórios de prestação de contas" },
  { Icon: CalendarDays, text: "Eventos com inscrição, ingresso e check-in" },
];

function CadastroPage() {
  return (
    <div className="grid min-h-screen lg:grid-cols-[0.8fr_1.2fr]">
      <aside className="hidden flex-col justify-between bg-ink p-10 text-ink-foreground lg:flex">
        <Link to="/" className="font-display text-2xl font-extrabold">
          <EcclesLogo className="[&_*]:text-ink-foreground" />
        </Link>
        <div>
          <Church className="h-10 w-10 text-primary" aria-hidden />
          <h2 className="mt-6 text-3xl leading-tight">A administração da sua igreja, sem complicação.</h2>
          <ul className="mt-8 space-y-4">
            {BENEFITS.map(({ Icon, text }) => (
              <li key={text} className="flex items-start gap-3 text-sm opacity-90">
                <Icon className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden />
                {text}
              </li>
            ))}
          </ul>
        </div>
        <p className="flex items-center gap-2 text-xs opacity-60">
          <Check className="h-4 w-4" aria-hidden /> Assinatura mensal ou anual, cancele quando quiser.
        </p>
      </aside>

      <main className="flex items-center justify-center bg-primary-soft px-4 py-10 lg:bg-background">
        <div className="w-full max-w-xl rounded-3xl border bg-card p-6 shadow-soft sm:p-8">
          <Link to="/" className="mb-6 block font-display text-xl font-extrabold text-foreground lg:hidden">
            <EcclesLogo className="[&_*]:text-ink-foreground" />
          </Link>
          <SignupWizard />
          <p className="mt-8 border-t pt-5 text-center text-sm text-muted-foreground">
            Já tem uma igreja no Eccles?{" "}
            <Link to="/auth" className="font-semibold text-primary hover:underline">
              Entrar
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
