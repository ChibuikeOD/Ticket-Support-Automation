import { expect, test } from "@playwright/test";

test("core navigation loads gold evaluation screens", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Gold Dataset Evaluation" })).toBeVisible();

  await page.getByRole("link", { name: "Evaluation" }).click();
  await expect(page.getByRole("heading", { name: "Evaluation" })).toBeVisible();

  await page.getByRole("link", { name: "Run Reports" }).click();
  await expect(page.getByRole("heading", { name: "Evaluation Reports" })).toBeVisible();

  await page.getByRole("link", { name: "Settings" }).click();
  await expect(page.getByRole("heading", { name: "Policy / SOP Studio" })).toBeVisible();
});
