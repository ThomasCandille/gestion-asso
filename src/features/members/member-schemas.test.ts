import { describe, expect, it } from "vitest";
import { canMemberRegisterForEvent } from "./member-rules";
import { memberFormSchema } from "./member-schemas";

const baseMember = {
  firstName: "Lina",
  lastName: "Robert",
  email: "lina.robert@iimpact.fr",
  phone: "0600000000",
  year: "A2",
  status: "ACTIVE",
  role: "MEMBER",
  poles: ["INTERNE"],
};

describe("memberFormSchema", () => {
  it("accepte un membre hors bureau avec au moins un pole", () => {
    expect(memberFormSchema.safeParse(baseMember).success).toBe(true);
  });

  it("refuse un membre hors bureau sans pole", () => {
    expect(
      memberFormSchema.safeParse({ ...baseMember, poles: [] }).success,
    ).toBe(false);
  });

  it("refuse un membre du bureau rattache a un pole", () => {
    expect(
      memberFormSchema.safeParse({
        ...baseMember,
        role: "PRESIDENT",
        poles: ["INTERNE"],
      }).success,
    ).toBe(false);
  });
});

describe("canMemberRegisterForEvent", () => {
  it("autorise uniquement les membres actifs a s'inscrire", () => {
    expect(canMemberRegisterForEvent("ACTIVE")).toBe(true);
    expect(canMemberRegisterForEvent("INACTIVE")).toBe(false);
    expect(canMemberRegisterForEvent("ALUMNI")).toBe(false);
  });
});
