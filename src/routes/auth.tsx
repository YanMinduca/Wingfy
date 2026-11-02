import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { hasBackend } from "@/lib/backend";
import { supabase } from "@/integrations/supabase/client";
import { DEMO_EMAIL, DEMO_PASSWORD } from "@/integrations/supabase/demo-client";
import { EcclesLogo } from "@/components/brand/EcclesLogo";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Entrar — Eccles" },
      { name: "description", content: "Acesse o painel da sua igreja no Eccles." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const [email, setEmail] = useState(hasBackend ? "" : DEMO_EMAIL);
  const [password, setPassword] = useState(hasBackend ? "" : DEMO_PASSWORD);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function enter(address: string, pass: string) {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email: address, password: pass });
      if (error) throw error;
      navigate({ to: "/painel" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao entrar");
    } finally {
      setLoading(false);
    }
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    void enter(email, password);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-primary-soft px-4">
      <div className="w-full max-w-sm rounded-3xl border bg-card p-8 shadow-soft">
        <Link to="/" className="font-display text-xl font-extrabold text-foreground">
          <EcclesLogo />
        </Link>
        <h1 className="mt-6 text-2xl text-foreground">Entrar</h1>
        {!hasBackend && (
          <div role="note" className="mt-4 rounded-xl border border-primary/30 bg-primary-soft p-3 text-sm text-foreground">
            <p className="font-semibold">Modo demonstração</p>
            <p className="mt-1 text-muted-foreground">
              O login é de teste: qualquer e-mail e senha entram. Os campos já vêm preenchidos com <span className="font-medium text-foreground">{DEMO_EMAIL}</span>.
            </p>
          </div>
        )}
        <form onSubmit={submit} className="mt-6 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">E-mail</Label>
            <Input id="email" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="pw">Senha</Label>
            <Input id="pw" type="password" required autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Aguarde..." : "Entrar"}
          </Button>
        </form>
        <p className="mt-4 text-center text-sm text-muted-foreground">
          Ainda não tem uma igreja?{" "}
          <Link to="/cadastro" className="font-semibold text-primary hover:underline">
            Criar minha igreja
          </Link>
        </p>
      </div>
    </div>
  );
}
