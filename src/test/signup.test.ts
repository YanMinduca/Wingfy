import { describe, expect, it } from "vitest";
import { PLANS, priceOf, yearlyPerMonth, yearlySavings } from "@/lib/plans";
import { churchSchema, formatPhone, ownerSchema, slugify, validate } from "@/lib/signup";

describe("cadastro: utilitários", () => {
  it("gera o endereço da igreja sem acentos nem símbolos", () => {
    expect(slugify("Igreja Batista Esperança & Vida!")).toBe("igreja-batista-esperanca-vida");
    expect(slugify("  --Comunidade Wingfy--  ")).toBe("comunidade-wingfy");
  });

  it("formata telefone com DDD", () => {
    expect(formatPhone("11987654321")).toBe("(11) 98765-4321");
    expect(formatPhone("1133334444")).toBe("(11) 3333-4444");
  });
});

describe("cadastro: validação", () => {
  const owner = { fullName: "Maria Silva", email: "maria@igreja.com", phone: "(11) 98765-4321", password: "12345678", confirmPassword: "12345678" };

  it("aceita os dados do responsável corretos", () => {
    expect(validate(ownerSchema, owner)).toEqual({});
  });

  it("recusa e-mail inválido, senha curta e senhas diferentes", () => {
    const errors = validate(ownerSchema, { ...owner, email: "x", password: "123", confirmPassword: "456" });
    expect(errors.email).toBeTruthy();
    expect(errors.password).toBeTruthy();
    expect(validate(ownerSchema, { ...owner, confirmPassword: "outra-senha" }).confirmPassword).toBe("As senhas não conferem.");
  });

  it("exige todos os campos da igreja", () => {
    const errors = validate(churchSchema, { churchName: "", slug: "", denomination: "", city: "", state: "", size: "" });
    expect(Object.keys(errors).sort()).toEqual(["churchName", "city", "denomination", "size", "slug", "state"]);
  });
});

describe("planos", () => {
  it("o plano anual sempre sai mais barato que 12 mensalidades", () => {
    for (const plan of PLANS) {
      expect(priceOf(plan, "anual")).toBeLessThan(priceOf(plan, "mensal") * 12);
      expect(yearlySavings(plan)).toBe(plan.monthly * 12 - plan.yearly);
      expect(yearlyPerMonth(plan)).toBeLessThan(plan.monthly);
    }
  });
});
