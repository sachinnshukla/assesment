import { describe, expect, it } from "vitest";
import { createTaskSchema, updateTaskSchema } from "../../../src/schemas/task";
import { loginSchema, registerSchema } from "../../../src/schemas/auth";

describe("P0/P1 request validation", () => {
  it("rejects malformed login and short registration passwords [API-02, API-09, UI-02]", () => {
    expect(loginSchema.safeParse({ email: "invalid", password: "x" }).success).toBe(false);
    expect(registerSchema.safeParse({ email: "qa@example.test", name: "QA", password: "short" }).success).toBe(false);
  });

  it("validates task titles and statuses", () => {
    expect(createTaskSchema.safeParse({ title: "" }).success).toBe(false);
    expect(createTaskSchema.safeParse({ title: "Task", status: "unknown" }).success).toBe(false);
    expect(createTaskSchema.safeParse({ title: "Task", status: "todo" }).success).toBe(true);
    expect(updateTaskSchema.safeParse({ position: -1 }).success).toBe(false);
  });
});
