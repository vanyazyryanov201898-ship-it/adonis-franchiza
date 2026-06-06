import { test, expect } from "@playwright/test";

test("dashboard loads", async ({ page }) => {
  await page.goto("/dashboard");
  await expect(page).toHaveTitle(/ADONIS/);
  await expect(page.getByRole("heading", { name: "ADONIS AI Platform" })).toBeVisible();
});

test("factory infographics page loads", async ({ page }) => {
  await page.goto("/factory/infographics");
  await expect(page.getByRole("heading", { name: "Инфографика" })).toBeVisible();
});

test("factory cartoon page loads", async ({ page }) => {
  await page.goto("/factory/cartoon");
  await expect(page.getByRole("heading", { name: "Мультяшки" })).toBeVisible();
});
