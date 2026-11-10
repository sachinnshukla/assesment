# TaskBoard assessment

This folder collects the assessment work without moving the required submission files or application code.

**Screen and audio recording:** [Assessment walkthrough](https://www.loom.com/share/a11b85d7ef7948678778c85878f31d47).

## Contents

- `plan.md`: assessment plan and sequence.
- `evidence/TaskBoard-manual-test-cases.xlsx`: manual cases, separate automated observations and manual-result columns.
- `evidence/BUGS.md`: snapshot of the Part 1 report; the submission copy is [`../BUGS.md`](../BUGS.md).
- `evidence/TEST_OUTPUT.md` and `part2-before.txt` / `part2-after.txt`: diagnosis and actual Part 2 output; the submission copy is [`../TEST_OUTPUT.md`](../TEST_OUTPUT.md).
- `evidence/assessment-*-results.json`: sanitized Part 1 observations, recorded before the Part 2 fix.
- `evidence/part2-fix.patch` and `task-update-authorization.test.ts.txt`: snapshots of the Part 2 change and added regression tests.
- `evidence/part1-api-checks.cjs.txt` and `workbook-generator.py.txt`: original evidence-generation scripts, preserved for reference. The API script modifies data and performs the documented injection proof; never run it against a shared or production database.
- `framework/`: focused Vitest unit tests, Playwright UI/E2E and API checks, separate known-bug proofs, and a bounded performance smoke check.

The application fix is in [`../src/app/api/tasks/[id]/route.ts`](../src/app/api/tasks/%5Bid%5D/route.ts). The original Part 2 test and its regression test remain in `../src/tests/`. These are the authoritative executable files; the report copies are snapshots and must be refreshed manually if the root versions change.

## Running the framework

Use an **isolated disposable seeded local app**, not the primary development database. The suite expects the seed accounts and Q3 Launch project. No script here starts, resets, or seeds a database; the original Part 2 tests modify data, so only run those against disposable data. Install project dependencies and, if Chromium is missing, run `npx playwright install chromium`. Alternatively set `QA_BROWSER_CHANNEL=chrome` to use an existing Google Chrome installation.

From the repository root:

```bash
npm run qa:unit
export QA_BASE_URL=http://localhost:3101
read -rs -p "Seeded demo password: " QA_PASSWORD; echo
export QA_PASSWORD
npm run qa:e2e
QA_PERFORMANCE=1 npm run qa:performance
```

`qa:e2e` includes API and UI/E2E checks and requires the app to be running. It submits a viewer task-creation request that the API must reject; use disposable data in case the permission check is broken. It also checks sign-in and project visibility. Test names reference manual workbook case IDs. The performance command sends 20 read-only project-list requests at concurrency 2; it reports errors and p50/p95 latency, not a capacity limit or SLA. Both suites require an explicit localhost URL and do not support remote targets.

Run `npm run qa:known-bugs` separately to demonstrate the two documented viewer-control and mobile-overflow issues. Those assertions are intentionally ordinary failing tests until the defects are fixed; they are not included in the passing regression suite.

The Part 2 integration tests need `TEST_BASE_URL` rather than `QA_BASE_URL`:

```bash
TEST_BASE_URL=http://localhost:3101 npm test -- src/tests/part2.test.ts src/tests/task-update-authorization.test.ts
```

The original Part 2 suite creates tasks and, before the fix, changes a task. The added regression test creates and removes its own fixture. Do not reseed or reset a database containing data you need.
