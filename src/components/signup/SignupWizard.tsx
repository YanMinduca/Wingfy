import { Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Check, CheckCircle2, Loader2 } from "lucide-react";
import { useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { brl } from "@/lib/church";
import { PLANS, getPlan, priceOf, yearlyPerMonth, yearlySavings, type Billing } from "@/lib/plans";
import {
  DENOMINATIONS,
  SIZES,
  STATES,
  churchSchema,
  formatPhone,
  ownerSchema,
  slugify,
  validate,
  type ChurchData,
  type FieldErrors,
  type OwnerData,
} from "@/lib/signup";

const STEPS = ["Responsável", "Igreja", "Plano", "Confirmação"] as const;

const emptyOwner: OwnerData = { fullName: "", email: "", phone: "", password: "", confirmPassword: "" };
const emptyChurch: ChurchData = { churchName: "", slug: "", denomination: "", city: "", state: "", size: "" };

function Field({ id, label, error, hint, children }: { id: string; label: string; error?: string | undefined; hint?: string; children: ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      {children}
      {hint && !error && <p className="text-xs text-muted-foreground">{hint}</p>}
      {error && (
        <p role="alert" className="text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}

function Stepper({ current }: { current: number }) {
  return (
    <ol className="flex items-center gap-2" aria-label="Etapas do cadastro">
      {STEPS.map((label, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <li key={label} className="flex flex-1 items-center gap-2" aria-current={active ? "step" : undefined}>
            <span
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                done ? "bg-primary text-primary-foreground" : active ? "border-2 border-primary text-primary" : "border text-muted-foreground"
              }`}
            >
              {done ? <Check className="h-4 w-4" /> : i + 1}
            </span>
            <span className={`hidden text-xs sm:block ${active ? "font-semibold text-foreground" : "text-muted-foreground"}`}>{label}</span>
            {i < STEPS.length - 1 && <span className={`h-px flex-1 ${done ? "bg-primary" : "bg-border"}`} />}
          </li>
        );
      })}
    </ol>
  );
}

export function SignupWizard() {
  const [step, setStep] = useState(0);
  const [owner, setOwner] = useState<OwnerData>(emptyOwner);
  const [church, setChurch] = useState<ChurchData>(emptyChurch);
  const [slugTouched, setSlugTouched] = useState(false);
  const [planId, setPlanId] = useState("crescimento");
  const [billing, setBilling] = useState<Billing>("mensal");
  const [accepted, setAccepted] = useState(false);
  const [ownerErrors, setOwnerErrors] = useState<FieldErrors<OwnerData>>({});
  const [churchErrors, setChurchErrors] = useState<FieldErrors<ChurchData>>({});
  const [termsError, setTermsError] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const plan = getPlan(planId) ?? PLANS[0]!;

  function setOwnerField<K extends keyof OwnerData>(key: K, value: OwnerData[K]) {
    setOwner((o) => ({ ...o, [key]: value }));
    setOwnerErrors((e) => ({ ...e, [key]: undefined }));
  }

  function setChurchField<K extends keyof ChurchData>(key: K, value: ChurchData[K]) {
    setChurch((c) => ({ ...c, [key]: value }));
    setChurchErrors((e) => ({ ...e, [key]: undefined }));
  }

  function next() {
    if (step === 0) {
      const errors = validate(ownerSchema, owner);
      setOwnerErrors(errors);
      if (Object.keys(errors).length) return;
    }
    if (step === 1) {
      const errors = validate(churchSchema, church);
      setChurchErrors(errors);
      if (Object.keys(errors).length) return;
    }
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }

  function back() {
    setStep((s) => Math.max(s - 1, 0));
  }

  function finish() {
    if (!accepted) {
      setTermsError(true);
      return;
    }
    setSubmitting(true);
    // Visual apenas: nada é enviado nem salvo. Aqui entrará a criação da conta, da igreja e da assinatura.
    window.setTimeout(() => {
      setSubmitting(false);
      setDone(true);
    }, 900);
  }

  if (done) {
    return (
      <div className="text-center" data-testid="signup-success">
        <CheckCircle2 className="mx-auto h-14 w-14 text-success" aria-hidden />
        <h1 className="mt-5 text-2xl text-foreground">Igreja criada!</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {church.churchName} já tem um espaço no Wingfy. Enviaremos o acesso para {owner.email}.
        </p>
        <dl className="mx-auto mt-6 max-w-sm space-y-2 rounded-2xl border bg-muted/40 p-4 text-left text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">Endereço</dt>
            <dd className="font-medium">wingfy.app/{church.slug}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">Plano</dt>
            <dd className="font-medium">
              {plan.name} · {billing}
            </dd>
          </div>
        </dl>
        <p className="mx-auto mt-4 max-w-sm text-xs text-muted-foreground">
          Esta é uma versão de demonstração: nenhum dado foi salvo e nenhuma cobrança foi feita.
        </p>
        <Button asChild className="mt-6">
          <Link to="/auth">
            Ir para o login
            <ArrowRight />
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div>
      <Stepper current={step} />

      <div className="mt-8">
        {step === 0 && (
          <section aria-labelledby="step-owner" className="space-y-4">
            <div>
              <h1 id="step-owner" className="text-2xl text-foreground">
                Crie sua conta
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">Você será o administrador principal da igreja.</p>
            </div>
            <Field id="fullName" label="Nome completo" error={ownerErrors.fullName}>
              <Input id="fullName" autoComplete="name" value={owner.fullName} onChange={(e) => setOwnerField("fullName", e.target.value)} />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field id="email" label="E-mail" error={ownerErrors.email}>
                <Input id="email" type="email" autoComplete="email" value={owner.email} onChange={(e) => setOwnerField("email", e.target.value)} />
              </Field>
              <Field id="phone" label="Telefone / WhatsApp" error={ownerErrors.phone}>
                <Input
                  id="phone"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  placeholder="(11) 90000-0000"
                  value={owner.phone}
                  onChange={(e) => setOwnerField("phone", formatPhone(e.target.value))}
                />
              </Field>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field id="password" label="Senha" error={ownerErrors.password} hint="Mínimo de 8 caracteres.">
                <Input id="password" type="password" autoComplete="new-password" value={owner.password} onChange={(e) => setOwnerField("password", e.target.value)} />
              </Field>
              <Field id="confirmPassword" label="Confirmar senha" error={ownerErrors.confirmPassword}>
                <Input
                  id="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  value={owner.confirmPassword}
                  onChange={(e) => setOwnerField("confirmPassword", e.target.value)}
                />
              </Field>
            </div>
          </section>
        )}

        {step === 1 && (
          <section aria-labelledby="step-church" className="space-y-4">
            <div>
              <h1 id="step-church" className="text-2xl text-foreground">
                Dados da igreja
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">Essas informações criam o espaço da sua igreja no Wingfy.</p>
            </div>
            <Field id="churchName" label="Nome da igreja" error={churchErrors.churchName}>
              <Input
                id="churchName"
                value={church.churchName}
                onChange={(e) => {
                  const value = e.target.value;
                  setChurchField("churchName", value);
                  if (!slugTouched) setChurchField("slug", slugify(value));
                }}
              />
            </Field>
            <Field id="slug" label="Endereço da igreja" error={churchErrors.slug} hint="É assim que seus membros vão acessar o sistema.">
              <div className="flex items-center rounded-md border bg-background focus-within:ring-2 focus-within:ring-ring">
                <span className="select-none pl-3 text-sm text-muted-foreground">wingfy.app/</span>
                <Input
                  id="slug"
                  className="border-0 pl-0 shadow-none focus-visible:ring-0"
                  value={church.slug}
                  onChange={(e) => {
                    setSlugTouched(true);
                    setChurchField("slug", slugify(e.target.value));
                  }}
                />
              </div>
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field id="denomination" label="Denominação" error={churchErrors.denomination}>
                <Select value={church.denomination} onValueChange={(v) => setChurchField("denomination", v)}>
                  <SelectTrigger id="denomination">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {DENOMINATIONS.map((d) => (
                      <SelectItem key={d} value={d}>
                        {d}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field id="size" label="Pessoas na igreja" error={churchErrors.size}>
                <Select value={church.size} onValueChange={(v) => setChurchField("size", v)}>
                  <SelectTrigger id="size">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {SIZES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </div>
            <div className="grid gap-4 sm:grid-cols-[1fr_8rem]">
              <Field id="city" label="Cidade" error={churchErrors.city}>
                <Input id="city" autoComplete="address-level2" value={church.city} onChange={(e) => setChurchField("city", e.target.value)} />
              </Field>
              <Field id="state" label="Estado" error={churchErrors.state}>
                <Select value={church.state} onValueChange={(v) => setChurchField("state", v)}>
                  <SelectTrigger id="state">
                    <SelectValue placeholder="UF" />
                  </SelectTrigger>
                  <SelectContent>
                    {STATES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </div>
          </section>
        )}

        {step === 2 && (
          <section aria-labelledby="step-plan" className="space-y-5">
            <div>
              <h1 id="step-plan" className="text-2xl text-foreground">
                Escolha seu plano
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">A assinatura mantém o sistema ativo. Você pode trocar de plano depois.</p>
            </div>

            <div role="group" aria-label="Forma de pagamento" className="inline-flex rounded-full border bg-muted p-1 text-sm">
              {(["mensal", "anual"] as const).map((b) => (
                <button
                  key={b}
                  type="button"
                  aria-pressed={billing === b}
                  onClick={() => setBilling(b)}
                  className={`rounded-full px-4 py-1.5 font-medium transition-colors ${
                    billing === b ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {b === "mensal" ? "Mensal" : "Anual"}
                  {b === "anual" && <span className="ml-2 rounded-full bg-primary-soft px-2 py-0.5 text-xs font-bold text-primary">2 meses grátis</span>}
                </button>
              ))}
            </div>

            <div role="radiogroup" aria-label="Planos" className="grid gap-3">
              {PLANS.map((p) => {
                const selected = p.id === planId;
                return (
                  <button
                    key={p.id}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    onClick={() => setPlanId(p.id)}
                    className={`relative w-full rounded-2xl border p-4 text-left transition-colors ${
                      selected ? "border-primary bg-primary-soft ring-2 ring-primary" : "bg-card hover:border-primary/50"
                    }`}
                  >
                    {p.highlight && <span className="absolute -top-2.5 right-4 rounded-full bg-primary px-2.5 py-0.5 text-xs font-bold text-primary-foreground">Mais escolhido</span>}
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-semibold text-foreground">{p.name}</p>
                        <p className="text-xs text-muted-foreground">{p.members}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-foreground">
                          {brl(billing === "anual" ? yearlyPerMonth(p) : p.monthly)}
                          <span className="text-xs font-normal text-muted-foreground">/mês</span>
                        </p>
                        {billing === "anual" && (
                          <p className="text-xs text-muted-foreground">
                            {brl(p.yearly)} por ano · economiza {brl(yearlySavings(p))}
                          </p>
                        )}
                      </div>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">{p.description}</p>
                    <ul className="mt-3 grid gap-1 text-sm sm:grid-cols-2">
                      {p.features.map((f) => (
                        <li key={f} className="flex items-start gap-2">
                          <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
                          {f}
                        </li>
                      ))}
                    </ul>
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {step === 3 && (
          <section aria-labelledby="step-review" className="space-y-5">
            <div>
              <h1 id="step-review" className="text-2xl text-foreground">
                Confirme os dados
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">Revise antes de criar a sua igreja.</p>
            </div>

            <dl className="divide-y rounded-2xl border text-sm">
              {[
                ["Responsável", owner.fullName],
                ["E-mail", owner.email],
                ["Telefone", owner.phone],
                ["Igreja", church.churchName],
                ["Endereço", `wingfy.app/${church.slug}`],
                ["Denominação", church.denomination],
                ["Cidade", `${church.city} - ${church.state}`],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4 px-4 py-2.5">
                  <dt className="text-muted-foreground">{k}</dt>
                  <dd className="text-right font-medium">{v}</dd>
                </div>
              ))}
              <div className="flex items-center justify-between gap-4 bg-primary-soft px-4 py-3">
                <dt>
                  <span className="font-semibold">Plano {plan.name}</span>
                  <span className="block text-xs text-muted-foreground">Cobrança {billing}</span>
                </dt>
                <dd className="text-right">
                  <span className="text-lg font-bold">{brl(priceOf(plan, billing))}</span>
                  <span className="text-xs text-muted-foreground">/{billing === "anual" ? "ano" : "mês"}</span>
                </dd>
              </div>
            </dl>

            <div className="space-y-1.5">
              <div className="flex items-start gap-3">
                <Checkbox id="terms" checked={accepted} onCheckedChange={(v) => { setAccepted(v === true); setTermsError(false); }} />
                <Label htmlFor="terms" className="text-sm font-normal leading-snug">
                  Li e aceito os Termos de Uso e a Política de Privacidade do Wingfy.
                </Label>
              </div>
              {termsError && (
                <p role="alert" className="text-xs text-destructive">
                  Aceite os termos para continuar.
                </p>
              )}
            </div>
            <p className="text-xs text-muted-foreground">Versão de demonstração: nenhum dado é salvo e nenhuma cobrança é feita.</p>
          </section>
        )}
      </div>

      <div className="mt-8 flex items-center justify-between gap-3">
        {step > 0 ? (
          <Button type="button" variant="ghost" onClick={back} disabled={submitting}>
            <ArrowLeft />
            Voltar
          </Button>
        ) : (
          <span />
        )}
        {step < STEPS.length - 1 ? (
          <Button type="button" onClick={next}>
            Continuar
            <ArrowRight />
          </Button>
        ) : (
          <Button type="button" onClick={finish} disabled={submitting}>
            {submitting ? (
              <>
                <Loader2 className="animate-spin" />
                Criando...
              </>
            ) : (
              "Criar minha igreja"
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
