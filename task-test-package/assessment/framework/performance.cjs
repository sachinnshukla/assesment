const { performance } = require("node:perf_hooks");

async function main() {
  const { QA_BASE_URL, QA_PASSWORD, QA_PERFORMANCE, QA_EMAIL = "meera@taskboard.dev" } = process.env;
  if (QA_PERFORMANCE !== "1" || !QA_BASE_URL || !QA_PASSWORD) {
    throw new Error("Set QA_PERFORMANCE=1, QA_BASE_URL and QA_PASSWORD for an isolated local instance.");
  }
  const base = new URL(QA_BASE_URL);
  if (!["localhost", "127.0.0.1", "::1", "[::1]"].includes(base.hostname) ||
      !["http:", "https:"].includes(base.protocol)) {
    throw new Error("Performance checks are restricted to a local instance.");
  }
  const login = await fetch(new URL("/api/auth/login", base), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: QA_EMAIL, password: QA_PASSWORD }),
  });
  if (!login.ok) throw new Error(`Login failed: HTTP ${login.status}`);
  const { token } = await login.json();
  if (!token) throw new Error("Login response did not contain a token.");
  const durations = [];
  let errors = 0;
  for (let batch = 0; batch < 10; batch++) {
    await Promise.all(Array.from({ length: 2 }, async () => {
      const start = performance.now();
      try {
        const response = await fetch(new URL("/api/projects", base), {
          headers: { Authorization: `Bearer ${token}` },
        });
        await response.arrayBuffer();
        if (!response.ok) errors++;
      } catch {
        errors++;
      } finally {
        durations.push(performance.now() - start);
      }
    }));
  }
  durations.sort((a, b) => a - b);
  console.log(`20 requests, concurrency 2, errors ${errors}, p50 ${durations[9].toFixed(1)} ms, p95 ${durations[18].toFixed(1)} ms`);
  console.log("Local smoke baseline only; no latency SLA or capacity claim.");
  if (errors) process.exitCode = 1;
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
