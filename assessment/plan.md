# TaskBoard assessment plan

## Objective and approach

Complete Part 1 first through an STLC-style manual test design and execution cycle, then Part 2, then automate selected cases in a small hybrid QA framework. Prioritize business impact and demonstrable evidence over test count. The user will record and narrate the session; do not fabricate recordings, results, timestamps, prompts, or AI confirmations.

## Todos

1. Establish an isolated assessment environment and baseline.
2. Design a focused P0/P1 Excel workbook of manual UI, E2E and API cases, with non-functional cases and execution/result fields.
3. Execute functional UI/E2E cases with Playwright MCP and API cases with scripts against the isolated app; leave user-executed cases explicitly pending until their results are provided.
4. Execute safe, bounded non-functional checks and record observations without inventing performance targets.
5. Investigate and document the four highest-impact reproducible findings in `BUGS.md`.
6. Capture, explain, and diagnose the original Part 2 failures before changing code.
7. Fix the Part 2 authorization issue and add a focused regression scenario.
8. Capture and explain the after-fix results in `TEST_OUTPUT.md`.
9. Automate selected manual cases in a small Vitest + Playwright Test hybrid suite.
10. Verify deliverables, document execution and recording-link requirements, and hand off.

## Execution details

### 1. Baseline and data safety

- Inspect the current repository state, installed runtime, services and applicable instructions. Keep existing untracked browser artifacts intact; do not change unrelated work.
- Use a separate, clearly identified disposable test database and application instance. Run the existing migration and seed only against that database. The seed script deletes data, and the existing Part 2 suite mutates tasks, so neither should run against the user's active database. Never reset, reseed, or delete existing data or containers.
- Review tests before running them, and ensure isolated services do not conflict with the app currently on port 3000. Use a distinct test URL/port and verify where database writes go. Keep credentials, tokens and hashes out of artifacts.

### 2. Part 1: prioritized bug report

- First create an Excel workbook with stable IDs, priority, test type, preconditions, steps, test data, expected result, actual result, status, executor, evidence and defect references. Include a separate execution log or clearly distinguish the user's manual execution from Playwright/API-script results; never mark unexecuted cases as passed.
- Execute focused UI and end-to-end flows via Playwright MCP and API scenarios using scripts against the isolated service. Select tests that avoid unnecessary mutations and retain real results. Let the user independently execute the manual cases; no claim of human execution without their evidence.
- Design and execute a bounded non-functional set after functional cases: relevant security observations and a read-only local performance baseline with concurrency, request count, errors and latency. It is not a production load or certification.
- Explore UI, API and code, focusing on security, data integrity, architecture and performance. Rank the top four by business impact rather than committing to findings before reproduction.
- Candidate findings to verify safely include missing authorization on task update, unsafe search query, sensitive user fields in project responses, and a high-impact data/UX issue. Treat previous observations as hypotheses until independently reproduced; don't exfiltrate credentials or use destructive payloads.
- Write `BUGS.md` with priority, category, severity, exact file/line references, concise 2–3 sentence descriptions, prerequisites, and repeatable sanitized curl proofs with observed and expected results. Format any UI issue as “When [action], the app [actual result], but it should [expected result].”
- Record the exact AI prompts and substantive responses for each finding and verify the actual results; flag any unconfirmed candidate rather than presenting it as reproduced. The human must show the interactions and narrate them in the recording.

### 3. Part 2: diagnosis, fix and evidence

- Run the original `src/tests/part2.test.ts` unchanged against the isolated app and capture the actual command, environment context and unedited test output in `TEST_OUTPUT.md`. Before editing, explain each test, identify whether each failure is an application defect or an invalid test expectation, and have the user narrate the reasoning in the recording.
- Preliminary hypothesis: test A correctly expects a viewer update to be forbidden, while test B expects 401 for a signed-in viewer even though 403 expresses insufficient authorization; verify against the contract and observed behavior, do not assume the prior run is sufficient. Preserve test descriptions and setup as instructed. Correct an invalid status assertion only after documenting why; do not remove or weaken a valid bug proof to obtain a green run.
- Fix only Part 2's task-update authorization: enforce project membership and admin/member edit permissions, matching the established helper and response conventions. Keep other Part 1 issues as documented findings, not opportunistic fixes.
- Add at least one distinct regression scenario, prioritizing non-member access or unauthenticated access; also verify legitimate member edits and unchanged seed records where practical. Use dedicated test data or isolated fixtures.
- Capture actual after-fix Part 2 output in `TEST_OUTPUT.md`, compare it with the baseline, and explain any remaining genuine failure rather than misrepresenting success.

### 4. Focused hybrid framework and nonfunctional coverage

- Reuse Vitest and existing TypeScript conventions for small P0/P1 unit/API tests; add Playwright Test as a dev dependency for reproducible browser tests only when implementing this phase. Keep browser configuration, helpers, fixtures, and scripts minimal; avoid a large abstraction or page-object hierarchy unless warranted.
- Cover a small, traceable set: authorization (viewer, member, non-member, no token), request validation, sign-in/project navigation, and the known viewer-control or mobile-overflow observation as an explicit bug proof. Do not silently skip a known failing proof: keep it separately identifiable and document expected failures.
- Use isolated test fixtures, no credentials in source/output, predictable setup and teardown, and separate baseline assessment evidence from framework output. Confirm any npm scripts clearly distinguish passing regressions from intentionally failing bug proofs.
- Automate the selected manual functional and non-functional cases with a traceable mapping to workbook IDs. Any performance smoke check must be bounded and opt-in, with explicit concurrency, request count, status/error counts and latency percentiles. Never point it at a shared or production service by default.

### 5. Final verification and submission

- Run the relevant test selectors, typecheck and build; report actual results, including intentionally retained failing bug proofs. Validate `BUGS.md` includes four reproduced findings and curl evidence, and `TEST_OUTPUT.md` contains genuine before/after runs.
- Document how to run each suite, prerequisites, isolated database setup and known test limitations. Add the real recording URL to `README.md` only after the user supplies it; do not invent one. The user is responsible for the required screen/audio recording and narration.
- Preserve `prisma/seed.ts` and seed data; leave the active environment and any user changes intact. Do not commit, push, create a PR, or alter Git history unless explicitly requested.

## Notes

- The user has chosen Part 1 first, Part 2 second, then the hybrid framework, and selected fixing only the Part 2 defect.
- The challenge's original tests require a running app and seed data; test C creates a task. They are integration tests, not isolated unit tests.
- Docker and Node prerequisites exist, but the live app currently uses local PostgreSQL; verify service readiness again during implementation.
- Because the assessment requires a human recording and narration, implementation must pause at points where the user needs to narrate or supply a recording link; tooling cannot provide that evidence on the user's behalf.
