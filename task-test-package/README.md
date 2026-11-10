# TaskBoard `/task-test` portable package

This folder contains the repository-scoped Copilot skill, its manual case workbook, and a standalone set of TaskBoard test dependencies. It does **not** contain the TaskBoard application, a database, or a running server; use it with a compatible, separately set up TaskBoard instance.

## Setup on another machine

1. Copy the **entire** `task-test-package` folder, including its hidden `.github` folder, and open that folder as the workspace in a Copilot surface that supports project skills. If opening the parent repository instead, copy `.github/skills/task-test` to that workspace's `.github/skills/` and keep the paths in the skill consistent with where the test framework is installed.
2. Install Node.js 20 or newer. From this folder run `npm ci`. For browser tests, install Chromium with `npx playwright install chromium`, or set `QA_BROWSER_CHANNEL=chrome` if Google Chrome is installed.
3. Independently set up a **disposable local TaskBoard app and seeded database**. Follow the application's setup instructions; this package never starts or seeds it. Verify the app process and its database configuration before testing. Some tests create, modify, or remove records; do not use a shared or important database. The suite expects the original TaskBoard seed roles and projects. The Part 2 tests use the original demo seed credentials from the assessment, not an arbitrary supplied account.
4. Open a new Copilot session or reload skills if your Copilot surface supports it. Invoke `/task-test` with a case ID or a plain-English request.

The package and its skill are specific to TaskBoard; they are not a generic test runner. `src/schemas` contains **snapshots** used by the local unit tests. Those unit checks validate the snapshots, not the live server's current code. Refresh them from the application under test before treating the unit results as coverage of a newer app version.

## Examples

```text
/task-test run unit tests
/task-test run API-06
/task-test show the manual mobile case
/task-test run the local performance smoke test
```

In an interactive terminal, use the helper to enter a local server URL and a hidden password on demand:

```bash
node assessment/framework/run-with-qa.cjs -- npx playwright test --config assessment/framework/playwright.config.ts --grep 'API-01|API-02'
```

For browser UI use `--headed` if you want to see the browser. The helper does not save credentials; alternatively configure `QA_BASE_URL`, `QA_PASSWORD`, and optionally `QA_EMAIL` securely in the execution environment. A URL alone does not establish database isolation. Role-specific tests require the expected seed accounts. The default configuration does not capture screenshots or traces.

See [assessment/README.md](assessment/README.md) for commands, scope and safety limitations. See [case-map.md](.github/skills/task-test/case-map.md) for exact coverage. The workbook and `BUGS.md` are historical assessment evidence, not live results from a new environment.
