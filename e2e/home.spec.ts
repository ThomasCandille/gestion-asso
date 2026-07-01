import { expect, test } from "@playwright/test";

test("affiche le tableau de bord initial", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Gestion association" }),
  ).toBeVisible();
  await expect(page.getByText("Socle initialise")).toBeVisible();
});
