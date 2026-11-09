# TaskBoard: prioritized bug report

These findings were reproduced against an isolated development app and disposable seeded PostgreSQL database, not the existing local database. No password hashes or authentication tokens are included in this report. Priorities reflect impact on this assessment application, not a formal vulnerability score.

**Status:** These are the Part 1 baseline findings. BUG-03 was subsequently fixed for Part 2; its proof returns HTTP 403 after the fix. The remaining findings have not been fixed.

## Proof setup

Run the examples **only against a disposable seeded instance**. The update and registration proofs change its data. They require `curl`, `jq`, seeded demo credentials, and the app's base URL; do not print or share tokens.

```bash
BASE=http://localhost:3101
read -rs -p "Seeded demo password: " QA_PASSWORD; echo
login() {
  jq -n --arg email "$1" --arg password "$QA_PASSWORD" \
    '{email:$email,password:$password}' |
    curl -sS -H 'Content-Type: application/json' --data-binary @- \
      "$BASE/api/auth/login" | jq -r '.token'
}
VIEWER_TOKEN="$(login dev@example.com)"
ADMIN_TOKEN="$(login meera@taskboard.dev)"
PROJECT_ID="$(curl -sS -H "Authorization: Bearer $VIEWER_TOKEN" \
  "$BASE/api/projects" | jq -r '.projects[] | select(.name == "Q3 Launch") | .id')"
TASK_ID="$(curl -sS -H "Authorization: Bearer $VIEWER_TOKEN" \
  "$BASE/api/projects/$PROJECT_ID/tasks" | jq -r '.tasks[0].id')"
```

### BUG-01 — Search query allows cross-project data exposure

**Priority:** P0 · **Severity:** Critical · **Category:** Security  
**Location:** `src/app/api/projects/[id]/tasks/route.ts:23-34` · **Case:** SEC-02

The task-search endpoint inserts user input directly into SQL, allowing an authenticated member to bypass the project filter. In the isolated seed, the viewer's Q3 search returned five tasks belonging to a different project; literal search should never return other projects' data.

```bash
curl -sS -G -H "Authorization: Bearer $VIEWER_TOKEN" \
  --data-urlencode "q=x%') OR '1'='1' -- " \
  "$BASE/api/projects/$PROJECT_ID/tasks" |
  jq --arg id "$PROJECT_ID" '[.tasks[] | select(.project_id != $id)] | length'
# Observed: 5; expected: 0.
```

### BUG-02 — Project detail exposes password hashes

**Priority:** P0 · **Severity:** High · **Category:** Security  
**Location:** `src/app/api/projects/[id]/route.ts:25-36` · **Case:** SEC-01

The project-detail response includes full related user records for the owner, members, task creators and assignees. A project viewer can receive password hashes; these fields should never be returned to clients.

```bash
curl -sS -H "Authorization: Bearer $VIEWER_TOKEN" \
  "$BASE/api/projects/$PROJECT_ID" |
  jq '[.. | objects | has("passwordHash")] | any'
# Observed: true; expected: false. This prints presence only, not hash values.
```

### BUG-03 — Viewers and non-members can update tasks

**Priority:** P0 · **Severity:** High · **Category:** Security  
**Location:** `src/app/api/tasks/[id]/route.ts:16-31` · **Cases:** API-07, API-08

Task update verifies the caller is signed in but never checks membership or whether the role can edit tasks. Both a viewer and a user outside the project received HTTP 200 when changing an isolated task title; both should receive HTTP 403 and leave the task unchanged.

```bash
curl -sS -o /dev/null -w 'HTTP %{http_code}\n' \
  -X PATCH -H "Authorization: Bearer $VIEWER_TOKEN" \
  -H 'Content-Type: application/json' \
  --data '{"title":"QA viewer update attempt"}' "$BASE/api/tasks/$TASK_ID"
# Observed: HTTP 200; expected: HTTP 403.
```

### BUG-04 — Concurrent registration creates duplicate accounts

**Priority:** P1 · **Severity:** High · **Category:** Data Integrity  
**Location:** `src/app/api/auth/register/route.ts:15-24`, `prisma/schema.prisma:23-26` · **Case:** API-11

Registration checks for an existing email before inserting but the email column has no unique constraint, so concurrent requests can both pass the check. Five parallel requests for the same new email each returned HTTP 201 and produced five user rows in the isolated database; only one account should be created.

```bash
QA_EMAIL="qa-race-$(date +%s)@example.test"
BODY="$(jq -nc --arg email "$QA_EMAIL" \
  '{name:"QA race",email:$email,password:"testing123"}')"
export BASE BODY
seq 5 | xargs -P 5 -I '{}' sh -c \
  'curl -sS -o /dev/null -w "HTTP %{http_code}\n" -H "Content-Type: application/json" --data "$BODY" "$BASE/api/auth/register"'
# Observed in one isolated run: five HTTP 201 responses; the exact race outcome may vary.
```

Confirm the duplicate count in the isolated database using the test email; never query the active database for this proof:

```bash
printf "SELECT count(*) FROM users WHERE email = :'email';\n" |
  psql -d taskboard_qa_assessment_20261109 -v email="$QA_EMAIL"
# Observed: 5; expected: 1.
```

## Other observations

Playwright found that viewers see task create/edit/delete controls and that the add-task button overflows a 390px viewport. An isolated API test also accepted an assignee who was not a project member; whether non-member assignment is prohibited requires an explicit product decision. The four findings above were selected over these observations for business impact.

**Recording note:** The candidate must demonstrate the actual reproduction and AI confirmation prompts/responses with audio narration. No recording or independent manual execution is claimed by this report.
