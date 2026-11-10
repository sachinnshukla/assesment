import { expect, test } from "@playwright/test";
import { config, signIn } from "./helpers";

test("UI-04 viewer task controls should be read-only", async ({ page }) => {
  await signIn(page, "dev@example.com");
  await page.getByRole("link", { name: /Q3 Launch/ }).click();
  await expect(page.getByRole("heading", { name: "Q3 Launch" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "members" })).toBeVisible();
  await expect(page.getByRole("button", { name: "add", exact: true })).toHaveCount(0);
});

test("UI-05 add form should fit a 390px viewport", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await signIn(page, "meera@taskboard.dev");
  await page.getByRole("link", { name: /Q3 Launch/ }).click();
  await expect(page.getByRole("heading", { name: "add a task" })).toBeVisible();
  const { width, scrollWidth } = await page.evaluate(() => ({
    width: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));
  expect(scrollWidth).toBeLessThanOrEqual(width);
});
