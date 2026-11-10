// @vitest-environment node

import { afterAll, beforeAll, describe, expect, it } from "vitest";

const BASE_URL = process.env.TEST_BASE_URL || "http://localhost:3000";
const initialTitle = "QA authorization regression fixture";
let adminToken: string;
let memberToken: string;
let outsiderToken: string;
let projectId: string;
let taskId: string;

async function login(email: string): Promise<string> {
  const password = process.env.QA_PASSWORD;
  if (!password) throw new Error("Set QA_PASSWORD to the demo seed password.");
  const res = await fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error(`Login failed for ${email}: ${res.status}`);
  const data = (await res.json()) as { token: string };
  return data.token;
}

function updateTask(token?: string) {
  return fetch(`${BASE_URL}/api/tasks/${taskId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ title: "QA authorization regression updated" }),
  });
}

beforeAll(async () => {
  [adminToken, memberToken, outsiderToken] = await Promise.all([
    login("meera@taskboard.dev"),
    login("arjun@taskboard.dev"),
    login("lina@example.com"),
  ]);
  const projectsRes = await fetch(`${BASE_URL}/api/projects`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  if (!projectsRes.ok) throw new Error(`Project lookup failed: ${projectsRes.status}`);
  const { projects } = (await projectsRes.json()) as {
    projects: { id: string; name: string }[];
  };
  const project = projects.find((item) => item.name === "Q3 Launch");
  if (!project) throw new Error("Seed project Q3 Launch not found");
  projectId = project.id;

  const res = await fetch(`${BASE_URL}/api/projects/${projectId}/tasks`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${adminToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ title: initialTitle }),
  });
  if (!res.ok) throw new Error(`Fixture creation failed: ${res.status}`);
  const data = (await res.json()) as { task: { id: string } };
  taskId = data.task.id;
});

afterAll(async () => {
  if (!taskId) return;
  const res = await fetch(`${BASE_URL}/api/tasks/${taskId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  if (!res.ok) throw new Error(`Fixture cleanup failed: ${res.status}`);
});

describe("task update authorization regressions", () => {
  it("rejects unauthenticated task updates", async () => {
    expect((await updateTask()).status).toBe(401);
  });

  it("rejects a non-member without changing the task", async () => {
    expect((await updateTask(outsiderToken)).status).toBe(403);
    const res = await fetch(`${BASE_URL}/api/projects/${projectId}/tasks`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    expect(res.status).toBe(200);
    const { tasks } = (await res.json()) as { tasks: { id: string; title: string }[] };
    expect(tasks.find((task) => task.id === taskId)?.title).toBe(initialTitle);
  });

  it("allows a project member to update a task", async () => {
    const res = await updateTask(memberToken);
    expect(res.status).toBe(200);
    const { task } = (await res.json()) as { task: { title: string } };
    expect(task.title).toBe("QA authorization regression updated");
  });
});
