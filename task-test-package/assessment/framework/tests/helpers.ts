import { expect, type APIRequestContext, type Page } from "@playwright/test";

export function config() {
  const baseURL = process.env.QA_BASE_URL;
  const password = process.env.QA_PASSWORD;
  const email = process.env.QA_EMAIL || "meera@taskboard.dev";
  if (!baseURL || !password) {
    throw new Error("Set QA_BASE_URL and QA_PASSWORD for a disposable seeded QA instance.");
  }
  const url = new URL(baseURL);
  if (!["localhost", "127.0.0.1", "::1", "[::1]"].includes(url.hostname) ||
      !["http:", "https:"].includes(url.protocol)) {
    throw new Error("QA_BASE_URL must point to a local disposable instance.");
  }
  return { baseURL: url.origin, email, password };
}

export async function signIn(page: Page, email: string) {
  const { baseURL, password } = config();
  await page.goto(`${baseURL}/login`);
  await page.getByLabel("email").fill(email);
  await page.getByLabel("password").fill(password);
  await page.getByRole("button", { name: "sign in" }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
}

export async function login(request: APIRequestContext, email: string) {
  const { baseURL, password } = config();
  const response = await request.post(`${baseURL}/api/auth/login`, { data: { email, password } });
  expect(response.status()).toBe(200);
  const body: { token: string } = await response.json();
  expect(body.token).toBeTruthy();
  return body.token;
}

export async function q3Id(request: APIRequestContext, token: string) {
  const { baseURL } = config();
  const response = await request.get(`${baseURL}/api/projects`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  expect(response.status()).toBe(200);
  const body: { projects: { id: string; name: string }[] } = await response.json();
  const project = body.projects.find((item) => item.name === "Q3 Launch");
  if (!project) throw new Error("Q3 Launch not found in seeded QA database.");
  return project.id;
}
