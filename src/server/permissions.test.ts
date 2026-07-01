import { describe, expect, it } from "vitest";
import {
  canManageMemberWithPoles,
  canManagePole,
  hasPermission,
  isOfficeRole,
} from "./permissions";

describe("permissions", () => {
  it("donne les droits budget au tresorier", () => {
    expect(hasPermission("TREASURER", "budget:manage")).toBe(true);
  });

  it("limite un responsable a son pole", () => {
    expect(canManagePole("POLE_LEAD", ["INTERNE"], "INTERNE")).toBe(true);
    expect(canManagePole("POLE_LEAD", ["INTERNE"], "EXTERNE")).toBe(false);
  });

  it("autorise un responsable a gerer un membre de ses poles", () => {
    expect(
      canManageMemberWithPoles("POLE_LEAD", ["INTERNE"], ["INTERNE"]),
    ).toBe(true);
    expect(
      canManageMemberWithPoles("POLE_LEAD", ["INTERNE"], ["EXTERNE"]),
    ).toBe(false);
  });

  it("identifie les roles bureau", () => {
    expect(isOfficeRole("PRESIDENT")).toBe(true);
    expect(isOfficeRole("MEMBER")).toBe(false);
  });
});
