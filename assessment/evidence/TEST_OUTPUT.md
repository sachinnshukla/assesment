# Part 2 test results

The original test suite was run against a separate seeded QA database through `http://localhost:3101`, not the user's active application database. The suite changes test data: the original viewer update modifies a task before the fix, and the member-create test creates a task.

## Before fixes

Command:

```bash
TEST_BASE_URL=http://localhost:3101 NO_COLOR=1 npm test -- src/tests/part2.test.ts
```

Result: **2 failed, 1 passed**. Captured output:

```text
> taskboard@0.1.0 test
> vitest run src/tests/part2.test.ts

The CJS build of Vite's Node API is deprecated. See https://vite.dev/guide/troubleshooting.html#vite-cjs-node-api-deprecated for more details.

 RUN  v2.1.8 /Users/sachinshukla/.copilot/repos/iq-taskboard-assessment

 ❯ src/tests/part2.test.ts (3 tests | 2 failed) 508ms
   × task access control > a viewer cannot update a task 24ms
     → expected 200 to be 403 // Object.is equality
   × task access control > a viewer cannot create a task 7ms
     → expected 403 to be 401 // Object.is equality

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 2 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  src/tests/part2.test.ts > task access control > a viewer cannot update a task
AssertionError: expected 200 to be 403 // Object.is equality

- Expected
+ Received

- 403
+ 200

 ❯ src/tests/part2.test.ts:57:24
     55|       body: JSON.stringify({ title: "viewer update attempt" }),
     56|     });
     57|     expect(res.status).toBe(403);
       |                        ^
     58|   });
     59| 

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/2]⎯

 FAIL  src/tests/part2.test.ts > task access control > a viewer cannot create a task
AssertionError: expected 403 to be 401 // Object.is equality

- Expected
+ Received

- 401
+ 403

 ❯ src/tests/part2.test.ts:70:24
     68|       body: JSON.stringify({ title: "viewer create attempt" }),
     69|     });
     70|     expect(res.status).toBe(401);
       |                        ^
     71|   });
     72| 

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/2]⎯

 Test Files  1 failed (1)
      Tests  2 failed | 1 passed (3)
   Start at  22:15:53
   Duration  936ms (transform 27ms, setup 94ms, collect 7ms, tests 508ms, environment 0ms, prepare 76ms)
```

### Diagnosis before changing code

- **A — viewer updates a task:** This is a valid negative authorization test. The app returned 200 and actually changed the task, because `PATCH /api/tasks/:id` checks authentication but not project membership or edit permission. The code is wrong: a viewer should receive 403 and the task must remain unchanged.
- **B — viewer creates a task:** This is a status-code expectation failure, not proof that creation succeeded. The signed-in viewer is authenticated but lacks permission; the implementation rejects creation with 403, whereas the test expects 401, which represents missing or invalid authentication. Under the existing authorization helpers and HTTP semantics the assertion is wrong; the test should expect 403.
- **C — member creates a task:** This is a positive control verifying that an authorized member gets HTTP 201. It passed; the test creates a task in the isolated database.

## After fixes

The task-update route now checks project membership and uses the existing `canEditTasks` helper before updating. Test B's expected status was changed from 401 to 403; test descriptions and setup were not changed.

Command:

```bash
TEST_BASE_URL=http://localhost:3101 NO_COLOR=1 npm test -- src/tests/part2.test.ts
```

Result: **3 passed**. Captured output:

```text
> taskboard@0.1.0 test
> vitest run src/tests/part2.test.ts

The CJS build of Vite's Node API is deprecated. See https://vite.dev/guide/troubleshooting.html#vite-cjs-node-api-deprecated for more details.

 RUN  v2.1.8 /Users/sachinshukla/.copilot/repos/iq-taskboard-assessment

 ✓ src/tests/part2.test.ts (3 tests) 1128ms

 Test Files  1 passed (1)
      Tests  3 passed (3)
   Start at  22:18:02
   Duration  1.55s (transform 24ms, setup 95ms, collect 7ms, tests 1.13s, environment 0ms, prepare 59ms)
```

Additional regression tests:

```bash
TEST_BASE_URL=http://localhost:3101 NO_COLOR=1 npm test -- src/tests/task-update-authorization.test.ts
```

Result: **3 passed**. These tests cover unauthenticated and non-member updates, verify that a denied update does not change the task, and confirm a project member can update. They create and delete their own task fixture in the isolated QA database.

**Recording limitation:** The user had not recorded the pre-fix diagnosis when the fix was made. This file documents the actual sequence; it does not replace the assessment's required screen-and-audio narration before code changes.
