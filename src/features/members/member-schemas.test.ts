import { describe, expect, it } from "vitest";
import {
  canMemberRegisterForEvent,
  hasPoleIntersection,
} from "./member-rules";
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

describe("hasPoleIntersection", () => {
  it("retourne true si au moins un pole est commun", () => {
    expect(hasPoleIntersection(["INTERNE"], ["INTERNE", "EXTERNE"])).toBe(true);
  });

  it("retourne false si aucun pole commun", () => {
    expect(hasPoleIntersection(["INTERNE"], ["EXTERNE"])).toBe(false);
  });

  it("retourne false si l'un des tableaux est vide", () => {
    expect(hasPoleIntersection([], ["INTERNE"])).toBe(false);
    expect(hasPoleIntersection(["INTERNE"], [])).toBe(false);
  });

  it("retourne true si les deux ont COMMUNICATION", () => {
    expect(
      hasPoleIntersection(["COMMUNICATION"], ["INTERNE", "COMMUNICATION"]),
    ).toBe(true);
  });
});
