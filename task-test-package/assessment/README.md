# TaskBoard test framework

Run commands from the package root. The TaskBoard application and an explicitly verified disposable seeded local database must be set up separately. Never reset or reseed a database containing data you need.

```bash
npm ci
npm run qa:unit
npm run qa:e2e
npm run qa:known-bugs
QA_PERFORMANCE=1 npm run qa:performance
```

The unit suite checks the included schema snapshots. Playwright and performance require `QA_BASE_URL` and `QA_PASSWORD`; `QA_EMAIL` selects the login account for API-01, API-02 and performance. Role-specific tests require the expected seeded roles. The passing suite includes API and UI checks; `qa:known-bugs` is separate and its ordinary assertions can fail on the documented defects. The performance command is opt-in and performs 20 reads at concurrency 2, not a stress or capacity test.

Use the interactive helper in the package [README](../README.md) to supply missing local credentials without echoing the password. For Part 2 configure `TEST_BASE_URL` and `QA_PASSWORD`; the original suite creates tasks and can modify a task if the defect recurs. The authorization regression creates and removes its own fixture. These two test files expect the original TaskBoard demo seed accounts and their shared password.

The skill's [case map](../.github/skills/task-test/case-map.md) identifies which workbook cases are automated, manual-only, blocked, or separately selected. The workbook contains historical observations; manual execution columns are not automatically updated. `BUGS.md` is a historical report and references application code paths that are not included in this package.
