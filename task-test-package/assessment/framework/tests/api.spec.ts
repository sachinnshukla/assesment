import { expect, test } from "@playwright/test";
import { config, login, q3Id } from "./helpers";

test("API-01 valid login returns a token", async ({ request }) => {
  const { email } = config();
  await login(request, email);
});

test("API-02 invalid credentials are denied", async ({ request }) => {
  const { baseURL, email, password } = config();
  expect((await request.post(`${baseURL}/api/auth/login`, {
    data: { email, password: `${password}-invalid` },
  })).status()).toBe(401);
});

test("API-03 anonymous project access is denied", async ({ request }) => {
  const { baseURL } = config();
  expect((await request.get(`${baseURL}/api/projects`)).status()).toBe(401);
});

test("API-04, API-05 viewer sees only membership projects", async ({ request }) => {
  const { baseURL } = config();
  const viewer = await login(request, "dev@example.com");
  const admin = await login(request, "meera@taskboard.dev");
  const viewerResponse = await request.get(`${baseURL}/api/projects`, {
    headers: { Authorization: `Bearer ${viewer}` },
  });
  const viewerBody: { projects: { name: string }[] } = await viewerResponse.json();
  expect(viewerBody.projects.map((project) => project.name)).toEqual(["Q3 Launch"]);
  const adminResponse = await request.get(`${baseURL}/api/projects`, {
    headers: { Authorization: `Bearer ${admin}` },
  });
  const adminBody: { projects: { id: string; name: string }[] } = await adminResponse.json();
  const privateProject = adminBody.projects.find((project) => project.name === "Internal Tools Cleanup");
  expect(privateProject).toBeDefined();
  const forbidden = await request.get(`${baseURL}/api/projects/${privateProject!.id}`, {
    headers: { Authorization: `Bearer ${viewer}` },
  });
  expect(forbidden.status()).toBe(403);
});

test("API-06 viewer cannot create a task", async ({ request }) => {
  const { baseURL } = config();
  const viewer = await login(request, "dev@example.com");
  const projectId = await q3Id(request, viewer);
  const response = await request.post(`${baseURL}/api/projects/${projectId}/tasks`, {
    headers: { Authorization: `Bearer ${viewer}` },
    data: { title: "QA denied viewer task" },
  });
  expect(response.status()).toBe(403);
});
