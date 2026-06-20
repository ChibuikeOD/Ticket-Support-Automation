import { expect, test } from "@playwright/test";

test("core navigation loads operations screens", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Overview Dashboard" })).toBeVisible();

  await page.getByRole("link", { name: "Backlog" }).click();
  await expect(page.getByRole("heading", { name: "Ticket Backlog" })).toBeVisible();

  await page.getByRole("link", { name: "Review Queue" }).click();
  await expect(page.getByRole("heading", { name: "Human Review Queue" })).toBeVisible();

  await page.getByRole("link", { name: "Evaluation Runs" }).click();
  await expect(page.getByRole("heading", { name: "Evaluation Runs" })).toBeVisible();

  await page.getByRole("link", { name: "Policies" }).click();
  await expect(page.getByRole("heading", { name: "Policy / SOP Studio" })).toBeVisible();

  await page.getByRole("link", { name: "Reports" }).click();
  await expect(page.getByRole("heading", { name: "Reports" })).toBeVisible();
});
