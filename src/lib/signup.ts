import { z } from "zod";

export const DENOMINATIONS = [
  "Assembleia de Deus",
  "Batista",
  "Presbiteriana",
  "Congregacional",
  "Metodista",
  "Pentecostal",
  "Católica",
  "Comunidade / Independente",
  "Outra",
];

export const STATES = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO",
];

export const SIZES = ["Até 50 pessoas", "51 a 100", "101 a 300", "301 a 500", "Mais de 500"];

export function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

export function formatPhone(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 2) return d;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

export const ownerSchema = z
  .object({
    fullName: z.string().trim().min(3, "Informe seu nome completo."),
    email: z.string().trim().email("Informe um e-mail válido."),
    phone: z
      .string()
      .refine((v) => v.replace(/\D/g, "").length >= 10, "Informe um telefone com DDD."),
    password: z.string().min(8, "A senha precisa ter pelo menos 8 caracteres."),
    confirmPassword: z.string(),
  })
  .refine((v) => v.password === v.confirmPassword, {
    path: ["confirmPassword"],
    message: "As senhas não conferem.",
  });

export const churchSchema = z.object({
  churchName: z.string().trim().min(3, "Informe o nome da igreja."),
  slug: z
    .string()
    .min(3, "O endereço precisa ter pelo menos 3 caracteres.")
    .regex(/^[a-z0-9-]+$/, "Use apenas letras minúsculas, números e hífen."),
  denomination: z.string().min(1, "Escolha a denominação."),
  city: z.string().trim().min(2, "Informe a cidade."),
  state: z.string().min(1, "Escolha o estado."),
  size: z.string().min(1, "Escolha o tamanho aproximado."),
});

export type OwnerData = z.infer<typeof ownerSchema>;
export type ChurchData = z.infer<typeof churchSchema>;

export type FieldErrors<T> = Partial<Record<keyof T, string>>;

/** Valida um passo e devolve só a primeira mensagem de cada campo. */
export function validate<T>(schema: z.ZodType<T>, data: unknown): FieldErrors<T> {
  const result = schema.safeParse(data);
  if (result.success) return {};
  const errors: Record<string, string> = {};
  for (const issue of result.error.issues) {
    const key = String(issue.path[0] ?? "");
    if (key && !errors[key]) errors[key] = issue.message;
  }
  return errors as FieldErrors<T>;
}
