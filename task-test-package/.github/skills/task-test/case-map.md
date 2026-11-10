# TaskBoard case map

Paths are relative to the repository root. Consult the current workbook and test sources for full steps and actual coverage. The workbook contains baseline results from an earlier run, not the current state.

## Manual cases

| ID | Scenario | Automation today |
|---|---|---|
| E2E-01 | Admin signs in and opens Q3 Launch | Playwright `ui.spec.ts`, named `E2E-01, UI-03` |
| E2E-02 | Sign out and redirect | Playwright `ui.spec.ts`, named `E2E-02` |
| UI-01 | Invalid login error | Playwright `ui.spec.ts`, named `UI-01` |
| UI-02 | Short registration password | Manual browser case; schema-level unit coverage only |
| UI-03 | Board and task details | Playwright `ui.spec.ts`, named `E2E-01, UI-03` |
| UI-04 | Viewer read-only controls | Known-bug proof, separate suite |
| UI-05 | Mobile form fits 390px | Known-bug proof, separate suite |
| UI-06 | Non-member denied project access | Manual UI case; API-level coverage in `API-04, API-05` |
| API-01 | Valid seeded login | Playwright `api.spec.ts`, named `API-01` |
| API-02 | Invalid login | Playwright `api.spec.ts`, named `API-02` |
| API-03 | Anonymous project access denied | Playwright `api.spec.ts`, named `API-03` |
| API-04 | Viewer project visibility | Playwright `api.spec.ts`, named `API-04, API-05` |
| API-05 | Non-member project access denied | Playwright `api.spec.ts`, named `API-04, API-05` |
| API-06 | Viewer cannot create task | Playwright `api.spec.ts`, named `API-06` |
| API-07 | Viewer cannot update task | Original Part 2 integration test; mutates fixture if defect recurs |
| API-08 | Non-member cannot update task | `src/tests/task-update-authorization.test.ts`; creates and deletes fixture |
| API-09 | Invalid registration | Manual API case; schema-level unit coverage only |
| API-10 | Non-member task assignee | Manual API case; expected behavior awaits product decision |
| API-11 | Concurrent duplicate registration | Manual API case; creates accounts, disposable database only |
| SEC-01 | Password-hash fields in project detail | Manual security proof in `BUGS.md`; inspect field presence only |
| SEC-02 | Search query isolation | Manual security proof in `BUGS.md`; explicit authorization and disposable environment required |
| PERF-01 | Local read-only performance smoke | `npm run qa:performance`, explicitly opt in |

## Commands

Run from the TaskBoard repository root. For Playwright and performance, require `QA_BASE_URL` and `QA_PASSWORD` for the verified isolated environment; `QA_EMAIL` optionally selects the account for API-01, API-02 and performance. Role-specific cases use their named seed accounts. Never echo credentials. Set `QA_BROWSER_CHANNEL=chrome` only when an installed Chrome is available or the user requests it.

```bash
# Unit suite (no service needed)
npm run qa:unit

# Passing regression suite (API and UI/E2E)
npm run qa:e2e

# Only API or UI/E2E tests
npx playwright test --config assessment/framework/playwright.config.ts assessment/framework/tests/api.spec.ts
npx playwright test --config assessment/framework/playwright.config.ts assessment/framework/tests/ui.spec.ts

# Specific automated case, e.g. API-06; quote the selected ID
npx playwright test --config assessment/framework/playwright.config.ts --grep 'API-06'

# Known-bug proof, e.g. UI-05; nonzero exit is an actual failing assertion
npx playwright test --config assessment/framework/known-bugs.config.ts --grep 'UI-05'

# API-07 and API-08 use TEST_BASE_URL and QA_PASSWORD; these mutate test data
TEST_BASE_URL="$QA_BASE_URL" npm test -- src/tests/part2.test.ts
TEST_BASE_URL="$QA_BASE_URL" npm test -- src/tests/task-update-authorization.test.ts

# Explicitly requested performance smoke
QA_PERFORMANCE=1 npm run qa:performance
```

Selectors can cover more than one manual ID. Verify the list with `npx playwright test --config assessment/framework/playwright.config.ts --list` before claiming the exact scope. The full Part 2 file runs all of its tests; do not claim a single test was run when using the whole file.
