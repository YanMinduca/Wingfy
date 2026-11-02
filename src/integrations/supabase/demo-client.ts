/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Cliente "Supabase" de demonstração: roda inteiro em memória, sem rede e sem banco.
 * É usado automaticamente por `client.ts` quando não há VITE_SUPABASE_URL / VITE_SUPABASE_PUBLISHABLE_KEY.
 *
 * - Login fake: qualquer e-mail e senha entram (sugestão: demo@eccles.app / demo1234).
 * - Os dados de exemplo nascem a cada carregamento da página; o que for criado/editado/apagado vale até recarregar.
 * - A sessão fake fica no localStorage para o F5 não deslogar.
 *
 * Quando o banco real for conectado, nada aqui é usado.
 */

type Row = any;
type Result = { data: any; error: null | { message: string }; count?: number | null };

export const DEMO_EMAIL = "demo@eccles.app";
export const DEMO_PASSWORD = "demo1234";
const DEMO_USER_ID = "00000000-0000-4000-8000-000000000001";
const SESSION_KEY = "eccles:demo-session";

// ───────────────────────── dados de exemplo ─────────────────────────

const pad = (n: number) => String(n).padStart(2, "0");
const iso = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const daysFromNow = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d;
};
/** Dia `day` do mês `monthsAgo` meses atrás (limitado ao último dia do mês). */
const monthDay = (monthsAgo: number, day: number) => {
  const base = new Date();
  const d = new Date(base.getFullYear(), base.getMonth() - monthsAgo, 1);
  const last = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  d.setDate(Math.min(day, last));
  return iso(d);
};

function buildSeed(): Record<string, Row[]> {
  const now = new Date().toISOString();
  const names = [
    ["Maria Aparecida Silva", "Louvor"],
    ["João Pedro Santos", "Mídia"],
    ["Ana Beatriz Costa", "Infantil"],
    ["Carlos Eduardo Lima", "Recepção"],
    ["Fernanda Oliveira", "Louvor"],
    ["Lucas Henrique Alves", "Mídia"],
    ["Juliana Ferreira", "Infantil"],
    ["Rafael Souza", "Recepção"],
    ["Patrícia Gomes", "Louvor"],
    ["Marcos Vinícius Rocha", "Recepção"],
    ["Camila Ribeiro", "Infantil"],
    ["Thiago Martins", "Mídia"],
  ] as const;

  const members: Row[] = names.map(([full_name, department], i) => ({
    id: `m-${i + 1}`,
    full_name,
    department,
    email: `${full_name.split(" ")[0]!.toLowerCase()}@exemplo.com`,
    phone: `(11) 9${8000 + i}-${1000 + i * 7}`,
    status: i === 11 ? "visitante" : i % 5 === 4 ? "membro" : "membro_ativo",
    approval_status: i === 10 ? "pendente" : "aprovado",
    city: "Jacareí",
    neighborhood: "Centro",
    address: `Rua Exemplo, ${100 + i}`,
    zip_code: "12300-000",
    birth_date: `${1980 + i}-${pad((i % 12) + 1)}-${pad(10 + i)}`,
    marital_status: i % 2 ? "Casado(a)" : "Solteiro(a)",
    baptized: i % 3 !== 2,
    baptism_date: null,
    baptism_church: null,
    affiliated_on: monthDay(12 + i, 5),
    joined_on: monthDay(12 + i, 5),
    registration_number: String(1000 + i),
    cpf: null,
    rg: null,
    ministry: null,
    notes: null,
    photo_path: null,
    church_role: null,
    church_role_id: i === 0 ? "cr-leader" : "cr-volunteer",
    // O primeiro membro é a pessoa logada, para "Meu cadastro" funcionar.
    user_id: i === 0 ? DEMO_USER_ID : null,
    created_at: now,
    updated_at: now,
  }));

  const departments: Row[] = ["Louvor", "Mídia", "Infantil", "Recepção"].map((name, i) => ({
    id: `d-${i + 1}`,
    name,
    description: ["Ministério de música", "Som, projeção e transmissão", "Crianças de 3 a 11 anos", "Acolhimento nos cultos"][i],
    leader_member_id: null,
    created_by: DEMO_USER_ID,
    created_at: now,
  }));

  const department_members: Row[] = members
    .filter((m) => m.status !== "visitante")
    .map((m) => ({
      department_id: departments.find((d) => d.name === m.department)!.id,
      member_id: m.id,
      church_role_id: m.church_role_id,
      joined_at: now,
    }));
  const department_leaders: Row[] = [
    { department_id: "d-1", member_id: "m-1", created_at: now },
    { department_id: "d-2", member_id: "m-2", created_at: now },
    { department_id: "d-3", member_id: "m-3", created_at: now },
    { department_id: "d-4", member_id: "m-4", created_at: now },
  ];

  const church_roles: Row[] = [
    { id: "cr-volunteer", code: "volunteer", name: "Voluntário", description: "Participa de um departamento", is_leadership: false, is_system: true, permissions: ["dept_view"], scope: "linked", created_at: now },
    { id: "cr-leader", code: "leader", name: "Líder de departamento", description: "Lidera um departamento", is_leadership: true, is_system: true, permissions: ["dept_view", "dept_manage_members", "dept_report"], scope: "linked", created_at: now },
    { id: "cr-deacon", code: null, name: "Diácono", description: "Apoio geral à liderança", is_leadership: true, is_system: false, permissions: ["view_members", "view_departments"], scope: "all", created_at: now },
  ];

  const tithers = ["m-1", "m-2", "m-3", "m-5", "m-6", "m-8", "m-9"];
  const financial_transactions: Row[] = [];
  let txId = 1;
  const addTx = (kind: "entrada" | "saida", category: string, amount: number, occurred_on: string, extra: Row = {}) =>
    financial_transactions.push({
      id: `t-${txId++}`,
      kind,
      category,
      amount,
      occurred_on,
      description: extra["description"] ?? category,
      member_id: extra["member_id"] ?? null,
      payment_method: extra["payment_method"] ?? "Pix",
      responsible: "Tesouraria",
      notes: null,
      receipt_path: null,
      created_by: DEMO_USER_ID,
      created_at: now,
    });
  for (let back = 0; back < 3; back++) {
    const people = back === 0 ? tithers.slice(0, 5) : tithers;
    people.forEach((id, i) => addTx("entrada", "Dízimos", 200 + i * 60 + back * 10, monthDay(back, 3 + i), { member_id: id }));
    addTx("entrada", "Ofertas", 850 + back * 120, monthDay(back, 8), { payment_method: "Dinheiro" });
    addTx("entrada", "Ofertas", 620 + back * 90, monthDay(back, 22), { payment_method: "Dinheiro" });
    addTx("saida", "Aluguel", 2200, monthDay(back, 5), { payment_method: "Transferência" });
    addTx("saida", "Energia", 380 + back * 15, monthDay(back, 12), { payment_method: "Boleto" });
    addTx("saida", "Água", 140, monthDay(back, 12), { payment_method: "Boleto" });
    addTx("saida", "Internet", 120, monthDay(back, 15), { payment_method: "Boleto" });
    addTx("saida", "Manutenção", 300 + back * 80, monthDay(back, 18));
  }

  const financial_goals: Row[] = [
    { id: "g-1", title: "Reforma do salão", category: null, target_amount: 15000, manual_amount: 6200, deadline: iso(daysFromNow(120)), start_date: monthDay(2, 1), recurrence: "unica", responsible: "Tesouraria", status: "em_andamento", created_at: now },
    { id: "g-2", title: "Missões do trimestre", category: "Ofertas", target_amount: 4000, manual_amount: null, deadline: iso(daysFromNow(45)), start_date: monthDay(1, 1), recurrence: "unica", responsible: "Tesouraria", status: "em_andamento", created_at: now },
  ];

  const recurring_bills: Row[] = [
    { id: "b-1", name: "Aluguel do templo", amount: 2200, category: "Aluguel", due_day: 5, payment_method: "Transferência", active: true, created_at: now },
    { id: "b-2", name: "Internet", amount: 120, category: "Internet", due_day: 15, payment_method: "Boleto", active: true, created_at: now },
  ];

  const at = (days: number, hour: number) => {
    const d = daysFromNow(days);
    d.setHours(hour, 0, 0, 0);
    return d.toISOString();
  };
  const events: Row[] = [
    { id: "e-1", slug: "culto-de-celebracao", title: "Culto de Celebração", description: "Um culto especial para toda a família.", location: "Templo principal", starts_at: at(5, 19), ends_at: at(5, 21), published: true, audience: "all", payment_enabled: false, accepts_card: false, allow_installments: false, max_installments: 1, limit_per_person: false, max_per_person: null, require_image_consent: false, registration_opens_at: null, registration_closes_at: null, notified_at: null, created_by: DEMO_USER_ID, created_at: now },
    { id: "e-2", slug: "retiro-de-jovens", title: "Retiro de Jovens", description: "Dois dias de comunhão e palavra.", location: "Sítio Esperança", starts_at: at(24, 8), ends_at: at(25, 17), published: true, audience: "all", payment_enabled: true, accepts_card: true, allow_installments: true, max_installments: 3, limit_per_person: true, max_per_person: 2, require_image_consent: true, registration_opens_at: null, registration_closes_at: null, notified_at: null, created_by: DEMO_USER_ID, created_at: now },
  ];
  const event_lots: Row[] = [
    { id: "l-1", event_id: "e-1", name: "Entrada gratuita", price: 0, capacity: 300, position: 1, public_access: true, opens_at: null, closes_at: null, created_at: now },
    { id: "l-2", event_id: "e-2", name: "1º lote", price: 180, capacity: 60, position: 1, public_access: true, opens_at: null, closes_at: null, created_at: now },
  ];
  const event_registrations: Row[] = ["m-2", "m-3", "m-5", "m-6"].map((member_id, i) => ({
    id: `er-${i + 1}`,
    event_id: i < 2 ? "e-1" : "e-2",
    lot_id: i < 2 ? "l-1" : "l-2",
    member_id,
    attendee_name: members.find((m) => m.id === member_id)!.full_name,
    attendee_email: null,
    attendee_phone: null,
    attendee_cpf: null,
    quantity: 1,
    installments: 1,
    image_consent: true,
    image_consent_at: now,
    cancelled_at: null,
    released_at: null,
    released_by: null,
    created_at: now,
  }));

  const prayer_requests: Row[] = [
    { id: "p-1", user_id: DEMO_USER_ID, subject: "Saúde da família", message: "Peço oração pela recuperação da minha mãe.", status: "recebido", created_at: new Date(Date.now() - 36e5 * 5).toISOString() },
    { id: "p-2", user_id: DEMO_USER_ID, subject: "Trabalho", message: "Estou buscando uma nova oportunidade de emprego.", status: "em_oracao", created_at: new Date(Date.now() - 36e5 * 30).toISOString() },
    { id: "p-3", user_id: DEMO_USER_ID, subject: "Gratidão", message: "Quero agradecer pela graça recebida neste mês.", status: "concluido", created_at: new Date(Date.now() - 36e5 * 90).toISOString() },
  ];

  return {
    user_roles: [{ id: "ur-1", user_id: DEMO_USER_ID, role: "ceo" }],
    user_permissions: [],
    profiles: [{ id: DEMO_USER_ID, full_name: "Administrador Demo", email: DEMO_EMAIL, created_at: now }],
    members,
    departments,
    department_members,
    department_leaders,
    church_roles,
    church_role_departments: [],
    financial_transactions,
    financial_goals,
    recurring_bills,
    events,
    event_lots,
    event_registrations,
    prayer_requests,
  };
}

let store: Record<string, Row[]> | undefined;
const db = () => (store ??= buildSeed());
const table = (name: string): Row[] => (db()[name] ??= []);

// ───────────────────────── sessão fake ─────────────────────────

type Session = { user: { id: string; email: string; user_metadata: Row; app_metadata: Row; aud: string; created_at: string } };

function readSession(): Session | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const { email } = JSON.parse(raw) as { email?: string };
    return makeSession(email || DEMO_EMAIL);
  } catch {
    return null;
  }
}

const makeSession = (email: string): Session => ({
  user: { id: DEMO_USER_ID, email, user_metadata: { full_name: "Administrador Demo" }, app_metadata: {}, aud: "authenticated", created_at: new Date().toISOString() },
});

type AuthListener = (event: string, session: Session | null) => void;
const listeners = new Set<AuthListener>();
const emit = (event: string, session: Session | null) => listeners.forEach((l) => l(event, session));

const auth = {
  async getUser() {
    const s = readSession();
    return { data: { user: s?.user ?? null }, error: s ? null : { message: "Auth session missing!" } };
  },
  async getSession() {
    return { data: { session: readSession() }, error: null };
  },
  async getClaims() {
    const s = readSession();
    return { data: s ? { claims: { sub: s.user.id, email: s.user.email } } : null, error: null };
  },
  async signInWithPassword({ email }: { email: string; password: string }) {
    const session = makeSession(email.trim() || DEMO_EMAIL);
    window.localStorage.setItem(SESSION_KEY, JSON.stringify({ email: session.user.email }));
    emit("SIGNED_IN", session);
    return { data: { user: session.user, session }, error: null };
  },
  async signUp({ email }: { email: string }) {
    const session = makeSession(email);
    window.localStorage.setItem(SESSION_KEY, JSON.stringify({ email }));
    emit("SIGNED_IN", session);
    return { data: { user: session.user, session }, error: null };
  },
  async signOut() {
    window.localStorage.removeItem(SESSION_KEY);
    emit("SIGNED_OUT", null);
    return { error: null };
  },
  async resend() {
    return { data: {}, error: null };
  },
  onAuthStateChange(cb: AuthListener) {
    listeners.add(cb);
    return { data: { subscription: { unsubscribe: () => listeners.delete(cb) } } };
  },
};

// ───────────────────────── consultas (from/select/insert/...) ─────────────────────────

type Filter = (row: Row) => boolean;

const uuid = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `id-${Math.random().toString(36).slice(2)}-${Date.now()}`;

const singular = (s: string) => s.replace(/ies$/, "y").replace(/s$/, "");
const FK_ALIASES: Record<string, string> = { event_lots: "lot_id", event_registrations: "registration_id", church_roles: "church_role_id" };

/** Resolve relações embutidas do select: "*, events(slug)" -> row.events = {...}; "department_members(...)" -> lista. */
function embed(tableName: string, rows: Row[], select: string): Row[] {
  const rels = [...select.matchAll(/([a-z_]+)(?:!\w+)?\s*\(/g)].map((m) => m[1]!);
  if (!rels.length) return rows;
  return rows.map((row) => {
    const out: Row = { ...row };
    for (const rel of rels) {
      const target = db()[rel];
      if (!target) {
        // Relação sem dados de exemplo (ex.: pagamentos, ingressos): lista vazia / nulo, como um banco sem registros.
        out[rel] = rel.endsWith("s") ? [] : null;
        continue;
      }
      const fk = FK_ALIASES[rel] ?? `${singular(rel)}_id`;
      if (fk in row) {
        out[rel] = target.find((t) => t["id"] === row[fk]) ?? null;
      } else {
        const back = `${singular(tableName)}_id`;
        out[rel] = target.filter((t) => t[back] === row["id"]);
      }
    }
    return out;
  });
}

function compare(a: any, b: any) {
  if (a == null && b == null) return 0;
  if (a == null) return 1;
  if (b == null) return -1;
  return a < b ? -1 : a > b ? 1 : 0;
}

function parseOr(expr: string): Filter {
  const parts = expr.split(",").map((p) => p.trim()).filter(Boolean);
  const tests = parts.map((p): Filter => {
    const [col, op, ...rest] = p.split(".");
    const val = rest.join(".");
    return (r) => cmp(r[col!], op!, val);
  });
  return (r) => tests.some((t) => t(r));
}

function cmp(cell: any, op: string, val: any): boolean {
  switch (op) {
    case "eq": return String(cell) === String(val);
    case "neq": return String(cell) !== String(val);
    case "gt": return compare(cell, val) > 0;
    case "gte": return compare(cell, val) >= 0;
    case "lt": return cell != null && compare(cell, val) < 0;
    case "lte": return cell != null && compare(cell, val) <= 0;
    case "like":
    case "ilike": {
      const re = new RegExp("^" + String(val).replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/%/g, ".*").replace(/_/g, ".") + "$", op === "ilike" ? "i" : "");
      return cell != null && re.test(String(cell));
    }
    case "is": return val === "null" || val === null ? cell == null : String(cell) === String(val);
    default: return true;
  }
}

class Query implements PromiseLike<Result> {
  private op: "select" | "insert" | "update" | "delete" | "upsert" = "select";
  private filters: Filter[] = [];
  private payload: any = null;
  private selectCols = "*";
  private returning = false;
  private head = false;
  private wantCount = false;
  private sort: { col: string; asc: boolean }[] = [];
  private max: number | null = null;
  private from_ = 0;
  private mode: "many" | "single" | "maybe" = "many";

  constructor(private name: string) {}

  select(cols = "*", opts?: { count?: string; head?: boolean }) {
    this.selectCols = cols;
    if (this.op === "select") {
      this.head = !!opts?.head;
      this.wantCount = !!opts?.count;
    } else {
      this.returning = true;
    }
    return this;
  }
  insert(rows: Row | Row[]) { this.op = "insert"; this.payload = rows; return this; }
  upsert(rows: Row | Row[]) { this.op = "upsert"; this.payload = rows; return this; }
  update(values: Row) { this.op = "update"; this.payload = values; return this; }
  delete() { this.op = "delete"; return this; }

  eq(c: string, v: any) { this.filters.push((r) => cmp(r[c], "eq", v)); return this; }
  neq(c: string, v: any) { this.filters.push((r) => cmp(r[c], "neq", v)); return this; }
  gt(c: string, v: any) { this.filters.push((r) => cmp(r[c], "gt", v)); return this; }
  gte(c: string, v: any) { this.filters.push((r) => cmp(r[c], "gte", v)); return this; }
  lt(c: string, v: any) { this.filters.push((r) => cmp(r[c], "lt", v)); return this; }
  lte(c: string, v: any) { this.filters.push((r) => cmp(r[c], "lte", v)); return this; }
  like(c: string, v: any) { this.filters.push((r) => cmp(r[c], "like", v)); return this; }
  ilike(c: string, v: any) { this.filters.push((r) => cmp(r[c], "ilike", v)); return this; }
  is(c: string, v: any) { this.filters.push((r) => cmp(r[c], "is", v)); return this; }
  in(c: string, vs: any[]) { this.filters.push((r) => vs.map(String).includes(String(r[c]))); return this; }
  not(c: string, op: string, v: any) { this.filters.push((r) => !cmp(r[c], op, v)); return this; }
  or(expr: string) { this.filters.push(parseOr(expr)); return this; }
  match(obj: Row) { Object.entries(obj).forEach(([c, v]) => this.eq(c, v)); return this; }
  contains(c: string, v: any[]) { this.filters.push((r) => Array.isArray(r[c]) && v.every((x) => r[c].includes(x))); return this; }
  order(col: string, opts?: { ascending?: boolean }) { this.sort.push({ col, asc: opts?.ascending !== false }); return this; }
  limit(n: number) { this.max = n; return this; }
  range(from: number, to: number) { this.from_ = from; this.max = to - from + 1; return this; }
  single() { this.mode = "single"; return this; }
  maybeSingle() { this.mode = "maybe"; return this; }
  returns() { return this; }
  abortSignal() { return this; }

  then<A = Result, B = never>(onfulfilled?: ((v: Result) => A | PromiseLike<A>) | null, onrejected?: ((e: any) => B | PromiseLike<B>) | null) {
    return Promise.resolve().then(() => this.run()).then(onfulfilled, onrejected);
  }

  private run(): Result {
    const rows = table(this.name);
    const matches = (r: Row) => this.filters.every((f) => f(r));
    let affected: Row[] = [];

    if (this.op === "insert" || this.op === "upsert") {
      const list = Array.isArray(this.payload) ? this.payload : [this.payload];
      for (const item of list) {
        const created = { id: uuid(), created_at: new Date().toISOString(), ...item };
        if (this.op === "upsert") {
          const key = "id" in item ? "id" : null;
          const i = key ? rows.findIndex((r) => r[key] === item[key]) : -1;
          if (i >= 0) { rows[i] = { ...rows[i], ...item }; affected.push(rows[i]!); continue; }
        }
        rows.push(created);
        affected.push(created);
      }
    } else if (this.op === "update") {
      rows.forEach((r, i) => {
        if (matches(r)) { rows[i] = { ...r, ...this.payload, updated_at: new Date().toISOString() }; affected.push(rows[i]!); }
      });
    } else if (this.op === "delete") {
      affected = rows.filter(matches);
      db()[this.name] = rows.filter((r) => !matches(r));
    } else {
      affected = rows.filter(matches);
    }

    const isRead = this.op === "select";
    if (!isRead && !this.returning) return { data: null, error: null };

    let out = [...affected];
    for (const { col, asc } of [...this.sort].reverse()) out.sort((a, b) => (asc ? 1 : -1) * compare(a[col], b[col]));
    const total = out.length;
    if (this.from_) out = out.slice(this.from_);
    if (this.max != null) out = out.slice(0, this.max);
    out = embed(this.name, out, this.selectCols).map((r) => ({ ...r }));

    const count = this.wantCount ? total : null;
    if (this.head) return { data: null, error: null, count };
    if (this.mode === "single") {
      return out[0] ? { data: out[0], error: null, count } : { data: null, error: { message: "Linha não encontrada" }, count };
    }
    if (this.mode === "maybe") return { data: out[0] ?? null, error: null, count };
    return { data: out, error: null, count };
  }
}

// ───────────────────────── funções (rpc) ─────────────────────────

const ok = (data: any): Result => ({ data, error: null });

function departmentOverview() {
  return table("departments").map((d) => {
    const leaders = table("department_leaders").filter((l) => l["department_id"] === d["id"]).map((l) => table("members").find((m) => m["id"] === l["member_id"])).filter(Boolean) as Row[];
    return {
      id: d["id"], name: d["name"], description: d["description"], created_at: d["created_at"],
      leader_member_id: leaders[0]?.["id"] ?? null,
      leader_member_ids: leaders.map((l) => l["id"]),
      leader_name: leaders[0]?.["full_name"] ?? null,
      leader_names: leaders.map((l) => l["full_name"]),
      member_count: table("department_members").filter((m) => m["department_id"] === d["id"]).length,
    };
  });
}

function departmentRoster(dept: string) {
  return table("department_members").filter((dm) => dm["department_id"] === dept).map((dm) => {
    const m = table("members").find((x) => x["id"] === dm["member_id"]) ?? {};
    const role = table("church_roles").find((r) => r["id"] === dm["church_role_id"]);
    return {
      member_id: dm["member_id"], full_name: m["full_name"] ?? "", email: m["email"] ?? null, phone: m["phone"] ?? null,
      photo_path: null, status: m["status"] ?? "membro", church_role_id: dm["church_role_id"], role_name: role?.["name"] ?? null,
      joined_at: dm["joined_at"],
      is_leader: table("department_leaders").some((l) => l["department_id"] === dept && l["member_id"] === dm["member_id"]),
    };
  });
}

function publicEvents() {
  const now = Date.now();
  return table("events").filter((e) => e["published"]).map((e) => {
    const lots = table("event_lots").filter((l) => l["event_id"] === e["id"]);
    const taken = table("event_registrations").filter((r) => r["event_id"] === e["id"] && !r["cancelled_at"]).reduce((n, r) => n + (r["quantity"] ?? 1), 0);
    const cap = lots.reduce((n, l) => n + (l["capacity"] ?? 0), 0);
    return {
      id: e["id"], slug: e["slug"], title: e["title"], description: e["description"], location: e["location"],
      starts_at: e["starts_at"], ends_at: e["ends_at"], audience: e["audience"], payment_enabled: e["payment_enabled"],
      registration_opens_at: e["registration_opens_at"], registration_closes_at: e["registration_closes_at"],
      registration_open: new Date(e["starts_at"]).getTime() > now,
      min_price: lots.length ? Math.min(...lots.map((l) => Number(l["price"]))) : null,
      spots_left: cap ? Math.max(cap - taken, 0) : null,
    };
  });
}

function eventAdminStats(eventId: string) {
  const regs = table("event_registrations").filter((r) => r["event_id"] === eventId && !r["cancelled_at"]);
  const lots = table("event_lots").filter((l) => l["event_id"] === eventId);
  const sold = (lotId: string) => regs.filter((r) => r["lot_id"] === lotId).reduce((n, r) => n + (r["quantity"] ?? 1), 0);
  const price = (lotId: string) => Number(lots.find((l) => l["id"] === lotId)?.["price"] ?? 0);
  const tickets = regs.reduce((n, r) => n + (r["quantity"] ?? 1), 0);
  return {
    registrations: regs.length,
    tickets_total: tickets,
    checked_in: 0,
    expected_total: regs.reduce((n, r) => n + price(r["lot_id"]) * (r["quantity"] ?? 1), 0),
    paid_total: 0,
    claimed_total: 0,
    lots: lots.map((l) => ({ name: l["name"], capacity: l["capacity"], sold: sold(l["id"]) })),
  };
}

function rpc(name: string, args: Row = {}): Result {
  switch (name) {
    case "department_overview": return ok(departmentOverview());
    case "department_roster": return ok(departmentRoster(args["_dept"]));
    case "member_departments":
      return ok(table("department_members").map((dm) => ({
        member_id: dm["member_id"], department_id: dm["department_id"],
        department_name: table("departments").find((d) => d["id"] === dm["department_id"])?.["name"] ?? "",
      })));
    case "dashboard_volunteer_stats":
      return ok({ departments: table("departments").length, volunteers: new Set(table("department_members").map((m) => m["member_id"])).size });
    case "public_events": return ok(publicEvents());
    case "event_admin_stats": return ok(eventAdminStats(args["_event"]));
    case "shift_departments":
    case "my_shifts":
    case "shift_warnings":
    case "shift_candidates":
    case "dept_schedule":
    case "storage_trash_next":
    case "storage_orphans_preview":
    case "find_member_duplicates":
    case "find_claimable_members":
    case "department_candidates":
      return ok([]);
    default:
      return ok(null);
  }
}

// ───────────────────────── armazenamento e funções de borda ─────────────────────────

const bucket = () => ({
  async upload(path: string) { return { data: { path }, error: null }; },
  async remove() { return { data: [], error: null }; },
  async list() { return { data: [], error: null }; },
  async download() { return { data: null, error: { message: "Arquivo indisponível na demonstração" } }; },
  async createSignedUrl() { return { data: { signedUrl: "" }, error: null }; },
  async createSignedUrls() { return { data: [], error: null }; },
  getPublicUrl() { return { data: { publicUrl: "" } }; },
});

export function createDemoClient() {
  return {
    auth,
    from: (name: string) => new Query(name),
    rpc: (name: string, args?: Row) => Promise.resolve().then(() => rpc(name, args)),
    storage: { from: bucket },
    functions: { invoke: async () => ({ data: null, error: null }) },
    channel: () => ({ on() { return this; }, subscribe() { return this; }, unsubscribe() {} }),
    removeChannel: async () => "ok",
  };
}

/** Só para testes: volta os dados de exemplo ao estado inicial. */
export function resetDemoData() {
  store = undefined;
}
