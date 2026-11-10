import { expect, test } from "@playwright/test";
import { config, signIn } from "./helpers";

test("UI-01 invalid login reports an error", async ({ page }) => {
  const { baseURL } = config();
  await page.goto(`${baseURL}/login`);
  await page.getByLabel("email").fill("meera@taskboard.dev");
  await page.getByLabel("password").fill("incorrect-password");
  await page.getByRole("button", { name: "sign in" }).click();
  await expect(page.getByRole("alert").filter({ hasText: "invalid credentials" })).toBeVisible();
});

test("E2E-01, UI-03 login opens a project and task details", async ({ page }) => {
  await signIn(page, "meera@taskboard.dev");
  await page.getByRole("link", { name: /Q3 Launch/ }).click();
  await expect(page.getByRole("heading", { name: "Q3 Launch" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "To do" })).toBeVisible();
  await page.getByRole("button", { name: /Draft press release/ }).click();
  await expect(page.getByRole("heading", { name: "edit task" })).toBeVisible();
  await page.getByRole("button", { name: "cancel" }).click();
  await expect(page.getByRole("heading", { name: "edit task" })).toHaveCount(0);
});

test("E2E-02 sign out redirects to login", async ({ page }) => {
  await signIn(page, "dev@example.com");
  await page.getByRole("button", { name: "sign out" }).click();
  await expect(page).toHaveURL(/\/login$/);
  const { baseURL } = config();
  await page.goto(`${baseURL}/dashboard`);
  await expect(page).toHaveURL(/\/login$/);
});
