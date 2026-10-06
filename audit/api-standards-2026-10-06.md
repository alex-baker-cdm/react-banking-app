# API design & security standards baseline - alex-baker-cdm/react-banking-app (2026-10-06)

## Summary

|                  |                                                                                                                                                                                                                                   |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Repository       | `alex-baker-cdm/react-banking-app` @ `master` (8bbd260)                                                                                                                                                                           |
| Classification   | both (REST API provider: Express `server/`; consumers: React web `src/` and SwiftUI `ios/WellsBanking`)                                                                                                                           |
| Surface          | REST (JSON over HTTP), 5 mounted routes                                                                                                                                                                                           |
| Spec present     | **No** - no OpenAPI/GraphQL/proto; the contract lives in `src/api/types.ts` and `ios/.../Models.swift`                                                                                                                            |
| Auth model       | **None** - no authentication or session on the API; the "Sign On" page is client-side only and the iOS client sends no credentials                                                                                                |
| Runtime verified | Yes - `npm run build && npm run serve` on http://localhost:8080 (Node v20.18.1), 30+ curl probes; `/health`, `/api/accounts` and response headers also checked against the deployed https://nj5xtw68mz.us-east-1.awsapprunner.com |
| Standard cited   | `REVIEW.md` on master (SEC-/API-/OBS-/CI- rule IDs)                                                                                                                                                                               |

### Severity counts

| critical | high | medium | low | total |
| -------- | ---- | ------ | --- | ----- |
| 2        | 2    | 7      | 5   | 16    |

### How it was run and what was verified

- `npm run test:server` (10/10 pass), `npm run build`, then `PORT=8080 node server/index.js` with stdout/stderr captured to files so log lines could be matched to responses.
- Probes: unauthenticated reads of every route, id swapping on `/api/accounts/:id`, empty / malformed / wrong-content-type / 200 kB bodies, boolean and exponent `amount`, object and 90 kB `memo`, HTML in `memo`, prototype-pollution body, replayed POST with an `Idempotency-Key`, the known cc-3309 500 (balances before/after), transfer _from_ a credit account, CORS preflight, non-UUID `x-correlation-id`, 100 back-to-back requests, path traversal against `express.static`, three $0.10 transfers for float drift.
- Static: `npm audit --json`, `npm run eslint`, `npx prettier --check .`, `npm run typecheck`, `git log -p -- server/routes`, review of `Dockerfile`, `infra/*.tf`, `infra/lambda/alerts.py`, `.github/workflows/*.yml`, `ios/WellsBanking/WellsBanking/{ApiClient.swift,Info.plist}`.
- Nothing in the repository was modified; the only additions are the two files under `audit/`.
- Known/intentional: the cc-3309 500 is the auto-triage demo trigger (reported as RBA-D-02, not fixed). The red `sca-vulnerability-check` CI job is a revoked repo secret, not a code finding.

## Route inventory

| Method | Path                             | Handler                                                            | Auth | Validation                              | Notes                                                    |
| ------ | -------------------------------- | ------------------------------------------------------------------ | ---- | --------------------------------------- | -------------------------------------------------------- |
| GET    | `/health`                        | `server/app.js:20-26`                                              | none | -                                       | liveness only; used by Docker HEALTHCHECK and App Runner |
| GET    | `/api/accounts`                  | `server/routes/accounts.js:7-9`                                    | none | -                                       | returns all seed accounts incl. balances                 |
| GET    | `/api/accounts/:id`              | `server/routes/accounts.js:11-15`                                  | none | existence check -> 404                  | no ownership check                                       |
| GET    | `/api/accounts/:id/transactions` | `server/routes/accounts.js:17-21`                                  | none | existence check -> 404                  | unpaginated                                              |
| POST   | `/api/transfers`                 | `server/routes/transfers.js:7-30` -> `services/transfers.js:65-97` | none | ad-hoc (`parseAmount`, presence checks) | money-moving; not idempotent; non-atomic                 |
| GET    | `/*` (not `/api/`)               | `server/app.js:31-34`                                              | none | -                                       | `express.static(build)` + SPA fallback to `index.html`   |

Outbound HTTP calls (consumer side):

| Caller    | Call                                                                                                                          | Where                                                 |
| --------- | ----------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| React web | `fetch` to the five routes above (same origin)                                                                                | `src/api/client.ts:19-67`                             |
| React web | Sentry ingest (`@sentry/react`, DSN in code, `sendDefaultPii: true`)                                                          | `src/sentry.ts`                                       |
| iOS       | `URLSession` to the same routes; base URL from `BANKING_API_BASE_URL` env / `ApiBaseUrl` Info.plist / `http://localhost:8080` | `ios/WellsBanking/WellsBanking/ApiClient.swift:29-64` |
| Lambda    | `POST https://api.devin.ai/v3/organizations/{org}/sessions` with Bearer key from Secrets Manager                              | `infra/lambda/alerts.py:102-130`                      |

## Findings by area

### A. Contract & design

| id       | severity | title                                                                                        | file:lines                                                                                                                                                                   | effort |
| -------- | -------- | -------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| RBA-A-01 | medium   | No machine-readable API contract (OpenAPI); two hand-maintained clients duplicate the schema | `src/api/types.ts; ios/WellsBanking/WellsBanking/Models.swift; server/routes/accounts.js; server/routes/transfers.js` (types.ts 82-128; accounts.js 7-21; transfers.js 7-30) | M      |
| RBA-A-02 | high     | POST /api/transfers is not idempotent - a retried request moves money twice                  | `server/routes/transfers.js; server/services/transfers.js` (transfers.js 7-30; services/transfers.js 65-97)                                                                  | M      |
| RBA-A-03 | low      | No API version in the path and no pagination on the transactions collection                  | `server/app.js; server/routes/accounts.js` (app.js 28-29; accounts.js 17-21)                                                                                                 | S      |

### B. Authentication & authorization

| id       | severity | title                                                                                                                      | file:lines                                                                                                          | effort |
| -------- | -------- | -------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- | ------ |
| RBA-B-01 | critical | No authentication or object-level authorization on any /api route - balances readable and transfers executable anonymously | `server/app.js; src/pages/Signin.tsx; server/routes/accounts.js` (app.js 15-29; Signin.tsx 12-21; accounts.js 7-21) | L      |

### C. Input validation

| id       | severity | title                                                                                                      | file:lines                                                                                                     | effort |
| -------- | -------- | ---------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- | ------ |
| RBA-C-01 | medium   | Ad-hoc body validation: amount accepts booleans/exponents, memo accepts any JSON type and unbounded length | `server/services/transfers.js` (16-25, 65-73, 80-94)                                                           | S      |
| RBA-C-02 | low      | Money is represented as IEEE-754 floats with per-operation rounding                                        | `server/services/transfers.js; server/data/accounts.js` (services/transfers.js 12-14, 27-54; accounts.js 9-10) | M      |

### D. Error handling

| id       | severity | title                                                                                                                                    | file:lines                                                                                      | effort |
| -------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- | ------ |
| RBA-D-01 | medium   | Error envelope is bypassed for parser errors and unknown routes; parser errors leak internals and lose the correlation id                | `server/app.js; server/middleware/errorHandler.js` (app.js 15-16, 28-36; errorHandler.js 48-63) | S      |
| RBA-D-02 | critical | Transfer is not atomic: debit is committed before the credit, so a credit failure leaves money missing (known demo trigger - do not fix) | `server/services/transfers.js` (6-10, 27-34, 75-76)                                             | M      |

### E. Logging & observability

| id       | severity | title                                                                                                              | file:lines                                                                                                       | effort |
| -------- | -------- | ------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------- | ------ |
| RBA-E-01 | low      | Customer-authored transaction detail is written to logs (request body incl. memo on 5xx; amount on every transfer) | `server/middleware/errorHandler.js; server/routes/transfers.js` (errorHandler.js 3-5, 28-37; transfers.js 10-16) | S      |
| RBA-E-02 | low      | Browser Sentry sends default PII and 100% traces; no metrics or tracing on the server                              | `src/sentry.ts; server/` (sentry.ts 4-21)                                                                        | S      |

### F. Security hygiene

| id       | severity | title                                                                                                                               | file:lines                                                                                                                                           | effort |
| -------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| RBA-F-01 | medium   | No security response headers (helmet) on API or SPA responses                                                                       | `server/app.js` (13-16, 31-34)                                                                                                                       | S      |
| RBA-F-02 | medium   | No rate limiting or abuse controls on the money-moving endpoint                                                                     | `server/app.js; infra/apprunner.tf` (app.js 13-29; apprunner.tf 26-68)                                                                               | S      |
| RBA-F-03 | high     | Runtime dependencies with high/critical advisories and available fixes (react-router 7.13.0, proxy-addr 2.0.7); no SCA gate in CI   | `package.json; package-lock.json; .github/workflows/ci.yml` (package.json 5-12; package-lock.json 9963-9966, 18056-18059, 18309-18311; ci.yml 17-27) | S      |
| RBA-F-04 | medium   | Production image installs express outside the lockfile (--no-package-lock), so the shipped runtime is not reproducible or auditable | `Dockerfile` (12-16)                                                                                                                                 | S      |
| RBA-F-05 | low      | GitHub Actions run step interpolates PR-controlled context directly into a shell script                                             | `.github/workflows/devin-ui-test.yml` (22-32)                                                                                                        | S      |

### G. Lifecycle

| id       | severity | title                                                                                                             | file:lines                                                                                                                                                  | effort |
| -------- | -------- | ----------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| RBA-G-01 | medium   | Deploys track a mutable :latest tag with no documented or automated rollback; no changelog or deprecation process | `.github/workflows/deploy.yml; infra/ecr.tf; infra/apprunner.tf; infra/variables.tf` (deploy.yml 35-65; ecr.tf 1-4; apprunner.tf 29-38; variables.tf 22-26) | M      |

## Detailed findings

### RBA-A-01 - No machine-readable API contract (OpenAPI); two hand-maintained clients duplicate the schema

**Severity:** medium · **Area:** A (Contract & design) · **Effort:** M  
**File:** `src/api/types.ts; ios/WellsBanking/WellsBanking/Models.swift; server/routes/accounts.js; server/routes/transfers.js` · **Lines:** types.ts 82-128; accounts.js 7-21; transfers.js 7-30

**Evidence**

`grep -rln 'openapi\|swagger' --include=*.{json,yaml,yml,md} .` (excluding node_modules) returns nothing; no spec, no Spectral lint, no contract-test generator. The four mounted routes (GET /health, GET /api/accounts, GET /api/accounts/:id, GET /api/accounts/:id/transactions, POST /api/transfers) are typed independently in src/api/types.ts (TypeScript) and ios/.../Models.swift (Swift). Verified at runtime that the server already returns a field the TS type does not model: POST /api/transfers echoes `memo` as whatever JSON type was sent (object `{"a":1}` in the transcript) while TransferReceipt.memo is `string`.

**Remediation**

Author `openapi/wf-online-banking.yaml` (OpenAPI 3.1) as the source of truth for the five routes and the `{ error: { code, message, field?, correlationId } }` envelope; lint it in CI with Spectral; validate requests/responses at runtime with `express-openapi-validator`; generate the TS client types with `openapi-typescript` and the Swift models with `swift-openapi-generator` so the web and iOS clients cannot drift from the server.

### RBA-A-02 - POST /api/transfers is not idempotent - a retried request moves money twice

**Severity:** high · **Area:** A (Contract & design) · **Effort:** M  
**File:** `server/routes/transfers.js; server/services/transfers.js` · **Lines:** transfers.js 7-30; services/transfers.js 65-97

**Evidence**

Two identical requests with the same `Idempotency-Key: abc-123` header both returned 201 with different confirmation numbers and the balance was debited twice:

```
$ for i in 1 2; do curl -s -X POST localhost:8080/api/transfers -H 'content-type: application/json' -H 'Idempotency-Key: abc-123' --data '{"fromAccountId":"chk-4471","toAccountId":"sav-8820","amount":"5.00"}'; done
223CEB231C 4807.12
6DCB35E725 4802.12
```

The handler never reads an idempotency key and `confirmationNumber` is a fresh `randomUUID()` per call (services/transfers.js:79). The web client (`src/api/client.ts` submitTransfer) and iOS client (`ApiClient.swift` transfer) have no retry suppression either, so a network timeout followed by a user retry double-posts.

**Remediation**

Require an `Idempotency-Key` header (UUID) on POST /api/transfers; store `{key, requestHash, status, responseBody}` in a keyed table (in-memory Map for the demo, DynamoDB/Postgres in production) and replay the stored response for a matching key, returning 422 when the key is reused with a different body. Have both clients generate the key once per form submission (`crypto.randomUUID()` / `UUID()`), not per retry.

### RBA-A-03 - No API version in the path and no pagination on the transactions collection

**Severity:** low · **Area:** A (Contract & design) · **Effort:** S  
**File:** `server/app.js; server/routes/accounts.js` · **Lines:** app.js 28-29; accounts.js 17-21

**Evidence**

Routers are mounted at `/api` (no `/v1`), so REVIEW.md API-06 ("breaking changes require a new versioned path `/api/v2/...`") has no baseline to version from. `git log -p -- server/routes` shows the routes were added in a single commit (b633cc2) and never changed, so no unversioned breaking change has shipped yet. `GET /api/accounts/:id/transactions` returns the full array with no `limit`/`cursor`/`sort`: after posting a transfer with a 90,000-character memo the endpoint returned the whole description inline (`201 90376` bytes on the POST, and the transactions list grew accordingly).

**Remediation**

Mount the routers at `/api/v1` now (keep `/api` as an alias for one release per API-06) and record the version in the OpenAPI `servers` block. Add cursor pagination to `/accounts/:id/transactions` (`?limit=50&cursor=<opaque>` returning `{ transactions, nextCursor }`) plus `?from=&to=` date filters, as the org convention for collections.

### RBA-B-01 - No authentication or object-level authorization on any /api route - balances readable and transfers executable anonymously

**Severity:** critical · **Area:** B (Authentication & authorization) · **Effort:** L  
**File:** `server/app.js; src/pages/Signin.tsx; server/routes/accounts.js` · **Lines:** app.js 15-29; Signin.tsx 12-21; accounts.js 7-21

**Evidence**

`server/app.js` mounts `accountsRouter` and `transfersRouter` with only `express.json()` and `requestContext` in front; there is no auth middleware anywhere in `server/` (`grep -rn 'auth\|session\|jwt\|cookie' server/` returns nothing). The "Sign On" page is purely client-side: `Signin.tsx` lines 12-21 check that both fields are non-empty and `navigate('/accounts')`; no credential ever reaches the server and no token/cookie is issued. Runtime, no headers at all:

```
$ curl -s localhost:8080/api/accounts
{"accounts":[{"id":"chk-4471",..."availableBalance":4826.12,...},{"id":"sav-8820",...},{"id":"cc-3309",..."creditLimit":10000,...},{"id":"mtg-1150",..."currentBalance":312400,...}]}
$ curl -si localhost:8080/api/accounts/sav-8820   -> HTTP/1.1 200 OK {"account":{"id":"sav-8820","availableBalance":12450,...}}
$ curl -si -X POST localhost:8080/api/transfers -H 'content-type: application/json' --data '{"fromAccountId":"chk-4471","toAccountId":"sav-8820","amount":true}'
HTTP/1.1 201 Created
```

The same anonymous `GET /api/accounts` succeeded against the deployed service `https://nj5xtw68mz.us-east-1.awsapprunner.com/api/accounts` (200, full account list). Object-level authorization cannot even be expressed: `seedAccounts()` has no owner/customer field, so swapping `:id` returns whichever account exists. Violates REVIEW.md API-05 (auth enforced by middleware).

**Remediation**

Introduce a real sign-on: POST /api/v1/session validating credentials (demo: a fixed user store with bcrypt hashes) and issuing an HttpOnly, Secure, SameSite=Lax session cookie (`express-session` with a server-side store, or a short-lived JWT via `jose`). Add a `requireAuth` middleware mounted once at `app.use('/api', requireAuth)` (health stays public), attach `customerId` to each account in the data layer and enforce `account.customerId === req.user.customerId` in a shared `loadOwnedAccount()` helper used by all three account routes and the transfer service (object-level authz per OWASP API1). iOS: store the session token in Keychain and send it as `Authorization: Bearer`.

### RBA-C-01 - Ad-hoc body validation: amount accepts booleans/exponents, memo accepts any JSON type and unbounded length

**Severity:** medium · **Area:** C (Input validation) · **Effort:** S  
**File:** `server/services/transfers.js` · **Lines:** 16-25, 65-73, 80-94

**Evidence**

Validation is hand-written in `parseAmount` and `transfer()`; there is no schema library in `package.json`. `parseAmount` coerces with `Number(raw)`, so non-numeric JSON types pass:

```
$ curl -si -X POST localhost:8080/api/transfers -H 'content-type: application/json' --data '{"fromAccountId":"chk-4471","toAccountId":"sav-8820","amount":true}'
HTTP/1.1 201 Created  ... "amount":1  (true -> $1.00 moved)
$ ... --data '{...,"amount":"1e1"}'
HTTP/1.1 201 Created  ... "amount":10
```

`memo` is never type- or length-checked (`memo = ''` default only):

```
$ ... --data '{...,"amount":"1.00","memo":{"a":1}}'
HTTP/1.1 201 Created ... "memo":{"a":1}   (description stored as 'Online Transfer ... - [object Object]')
$ python3 -c "...'memo':'M'*90000" | curl ... -w '%{http_code} %{size_download}'
201 90376
```

REVIEW.md SEC-05 requires allowlist validation of every body field. (Positive: `express.json()`'s default 100 kB limit does reject a 200 kB body with 413, and `fromAccountId`/`toAccountId` of the wrong type fall through to a 404 rather than a crash.)

**Remediation**

Adopt `zod` with a `validate(schema)` middleware per route: `transferSchema = z.object({ fromAccountId: z.string().regex(/^[a-z]+-\d{4}$/), toAccountId: ..., amount: z.string().regex(/^\d{1,9}(\.\d{1,2})?$/), memo: z.string().trim().max(60).default('') }).strict()`; set `express.json({ limit: '10kb' })` for the API router; reject with the existing `ValidationError` so the envelope and `field` stay unchanged. Share the schema with the web client via `zod` and mirror the constraints in Swift `Codable` validation.

### RBA-C-02 - Money is represented as IEEE-754 floats with per-operation rounding

**Severity:** low · **Area:** C (Input validation) · **Effort:** M  
**File:** `server/services/transfers.js; server/data/accounts.js` · **Lines:** services/transfers.js 12-14, 27-54; accounts.js 9-10

**Evidence**

Balances are JS `number` (e.g. `availableBalance: 4826.12`) and every posting does `roundMoney(a + b)` (`Math.round(value * 100) / 100`). Runtime: three $0.10 transfers from 4651.12 gave 4650.82 (correct), so the rounding currently masks drift, but correctness depends on each call site remembering `roundMoney`, and `amount` is parsed via `Number()` (see RBA-C-01) so values such as `1e21` are accepted by `parseAmount` and only rejected later by the balance check. Transaction amounts are stored as negative floats (`amount: -amount`).

**Remediation**

Store and compute money as integer cents (`amountCents: 482612`) or `decimal.js`/`big.js` values throughout `server/`, convert to display strings only in the clients (`formatMoney`), and encode amounts in the API as strings (`"amount":"150.00"`) per the org money convention so JSON parsers never produce binary floats.

### RBA-D-01 - Error envelope is bypassed for parser errors and unknown routes; parser errors leak internals and lose the correlation id

**Severity:** medium · **Area:** D (Error handling) · **Effort:** S  
**File:** `server/app.js; server/middleware/errorHandler.js` · **Lines:** app.js 15-16, 28-36; errorHandler.js 48-63

**Evidence**

`express.json()` (app.js:15) runs before `requestContext` (app.js:16), so body-parser errors reach `errorHandler` with `req.correlationId === undefined`; the handler then echoes the raw `err.name`/`err.message`:

```
$ curl -si -X POST localhost:8080/api/transfers -H 'content-type: application/json' --data '{bad'
HTTP/1.1 400 Bad Request        (no x-correlation-id header)
{"error":{"code":"SyntaxError","message":"Expected property name or '}' in JSON at position 1"}}
$ python3 -c "...'memo':'x'*200000" | curl -si -X POST localhost:8080/api/transfers ... --data-binary @-
HTTP/1.1 413 Payload Too Large
{"error":{"code":"PayloadTooLargeError","message":"request entity too large"}}
```

Unknown API paths and wrong verbs fall through to Express's default HTML 404:

```
$ curl -si localhost:8080/api/nope      -> 404 text/html  <pre>Cannot GET /api/nope</pre>
$ curl -si -X POST localhost:8080/api/accounts -> 404 text/html <pre>Cannot POST /api/accounts</pre>
```

The matching `request rejected` WARN log line is also written without a correlationId. Violates REVIEW.md SEC-06 (no dependency/exception messages), API-02 (uniform envelope) and OBS-02 (every error response carries the correlationId). Handled errors (ValidationError/NotFoundError/500) do use the envelope correctly.

**Remediation**

Move `requestContext` ahead of `express.json()`; in `errorHandler` map body-parser errors (`err.type === 'entity.parse.failed'` -> `ValidationError('Request body must be valid JSON')`, `'entity.too.large'` -> 413 with code `PAYLOAD_TOO_LARGE`) and treat any other unknown `err.statusCode < 500` as `BAD_REQUEST` with a fixed message; add `router.all('/api/*', (req,res,next) => next(new NotFoundError('Route not found')))` before the SPA fallback (405 with `Allow` for known paths). Consider adopting RFC 9457 `application/problem+json` (`type`, `title`, `status`, `detail`, `instance`=correlationId) as the org-wide envelope.

### RBA-D-02 - Transfer is not atomic: debit is committed before the credit, so a credit failure leaves money missing (known demo trigger - do not fix)

**Severity:** critical · **Area:** D (Error handling) · **Effort:** M  
**File:** `server/services/transfers.js` · **Lines:** 6-10, 27-34, 75-76

**Evidence**

`transfer()` calls `postDebit(from, amount)` then `postCredit(to, amount)` with no rollback. `POSTING_RULES` has no entry for `type: 'credit'`, so `postCredit` dereferences `undefined.direction` and throws after the debit has been applied:

```
$ curl -s localhost:8080/api/accounts/chk-4471      -> "availableBalance":4802.12
$ curl -si -X POST localhost:8080/api/transfers -H 'content-type: application/json' --data '{"fromAccountId":"chk-4471","toAccountId":"cc-3309","amount":"150.00","memo":"October payment"}'
HTTP/1.1 500 Internal Server Error
{"error":{"code":"INTERNAL_ERROR","message":"We're sorry - we couldn't complete your request. Please try again later.","correlationId":"20d8dbc1-7247-4183-8d91-cdf23195af15"}}
$ curl -s localhost:8080/api/accounts/chk-4471      -> "availableBalance":4652.12   ($150 gone)
$ curl -s localhost:8080/api/accounts/cc-3309       -> "currentBalance":1284.57    (unchanged)
$ curl -s localhost:8080/api/accounts/chk-4471/transactions  -> no transaction for the $150
```

stderr: `{"level":"ERROR","event":"unhandled request error","correlationId":"20d8dbc1-...","errorName":"TypeError","errorMessage":"Cannot read properties of undefined (reading 'direction')","stack":"TypeError: ... at postCredit (server/services/transfers.js:29:27) at Object.transfer (server/services/transfers.js:76:5) ..."}`. `POST` from `cc-3309` also 500s (`postDebit` -> `rules.debit` on undefined) but before any mutation. Per the orchestrator this is the intentional auto-triage demo trigger and is reported, not fixed.

**Remediation**

Make posting a two-phase unit of work: resolve and validate the posting rules for both accounts up front (unknown account type -> `ValidationError`, never a 500), compute the new balances into a pending ledger entry, and only then commit both sides and the two transaction rows together (in production a DB transaction; in the in-memory demo a `commit()` that swaps the prepared objects in). Add the missing `credit` posting rule (`{ credit: 'currentBalance', direction: -1, mirror: 'availableCredit', mirrorDirection: +1 }`). Keep the regression test referencing the incident correlationId per REVIEW.md TEST-04.

### RBA-E-01 - Customer-authored transaction detail is written to logs (request body incl. memo on 5xx; amount on every transfer)

**Severity:** low · **Area:** E (Logging & observability) · **Effort:** S  
**File:** `server/middleware/errorHandler.js; server/routes/transfers.js` · **Lines:** errorHandler.js 3-5, 28-37; transfers.js 10-16

**Evidence**

The 500 log line carries `requestBody: redact(req.body)`; redaction is key-name based (`/pass|secret|token|ssn|cvv|pin|key$|.../`) so `memo` (free text typed by the customer) and the two account ids are logged verbatim - captured stderr for the cc-3309 failure ends with `"requestBody":{"fromAccountId":"chk-4471","toAccountId":"cc-3309","amount":"150.00","memo":"October payment"}`. Every successful transfer logs the amount: `{"level":"INFO","event":"transfer posted","correlationId":"ffc34556-...","confirmationNumber":"8F539C9BD9","fromAccountId":"chk-4471","toAccountId":"sav-8820","amount":0.1}`. REVIEW.md SEC-04 lists "transaction detail" as data that must not be logged. The same body is forwarded verbatim into the Devin triage prompt by `infra/lambda/alerts.py` buildPrompt (lines 154-190).

**Remediation**

Log identifiers only: replace `requestBody` with a field allowlist (`fromAccountId`, `toAccountId`, `amountBucket`) and drop `memo`; remove `amount` from the `transfer posted` line (or bucket it). If the full body is needed for triage, store it encrypted keyed by correlationId with short retention and have the Lambda fetch it on demand rather than embedding it in logs/prompts.

### RBA-E-02 - Browser Sentry sends default PII and 100% traces; no metrics or tracing on the server

**Severity:** low · **Area:** E (Logging & observability) · **Effort:** S  
**File:** `src/sentry.ts; server/` · **Lines:** sentry.ts 4-21

**Evidence**

`Sentry.init({ sendDefaultPii: true, tracesSampleRate: 1.0, replaysSessionSampleRate: 0.1, replaysOnErrorSampleRate: 1.0 })` is unconditional (not gated on `NODE_ENV`), so client IPs and session replays of banking screens are shipped to Sentry in production. Server side there is no metrics or tracing dependency (`grep -rn 'prom-client\|opentelemetry\|otel' server package.json` -> nothing); observability is the structured request log plus `/health` (which is liveness only - no readiness/dependency check). 5xx are alertable from logs alone (positive, see positives).

**Remediation**

Gate `sendDefaultPii` off and lower `tracesSampleRate` (e.g. 0.1) in production via `process.env`; mask replay text/inputs (`Sentry.replayIntegration({ maskAllText: true, blockAllMedia: true })`). On the server add OpenTelemetry (`@opentelemetry/sdk-node` + `@opentelemetry/instrumentation-express`) exporting to CloudWatch/X-Ray, propagate `x-correlation-id` as a span attribute, and split `/health` (liveness) from `/ready` (dependencies).

### RBA-F-01 - No security response headers (helmet) on API or SPA responses

**Severity:** medium · **Area:** F (Security hygiene) · **Effort:** S  
**File:** `server/app.js` · **Lines:** 13-16, 31-34

**Evidence**

Only `app.disable('x-powered-by')` is set. Local:

```
$ curl -si localhost:8080/health
HTTP/1.1 200 OK
x-correlation-id: 5eb1890a-...
Content-Type: application/json; charset=utf-8
Content-Length: 64
ETag: W/"40-..."
(no Content-Security-Policy, Strict-Transport-Security, X-Frame-Options, X-Content-Type-Options, Referrer-Policy)
```

Production (`curl -sI https://nj5xtw68mz.us-east-1.awsapprunner.com/`) - the App Runner/envoy edge adds none of them either (`grep -i 'strict\|frame\|content-security\|x-content'` on the response headers is empty).

**Remediation**

Add `helmet()` as the first middleware in `createApp` with a CSP tuned for the CRA bundle and the Sentry ingest origin (`connect-src 'self' https://*.ingest.us.sentry.io`), `frameguard: { action: 'deny' }`, `referrerPolicy: strict-origin-when-cross-origin`, and `hsts` (App Runner terminates TLS, so set it in the app). Add a node:test asserting the headers on `/health`.

### RBA-F-02 - No rate limiting or abuse controls on the money-moving endpoint

**Severity:** medium · **Area:** F (Security hygiene) · **Effort:** S  
**File:** `server/app.js; infra/apprunner.tf` · **Lines:** app.js 13-29; apprunner.tf 26-68

**Evidence**

`package.json` has no `express-rate-limit`/`rate-limiter-flexible`, `server/app.js` registers no limiter and `infra/apprunner.tf` attaches no WAF/web ACL. Runtime: 100 back-to-back anonymous requests all succeeded:

```
$ for i in $(seq 1 100); do curl -s -o /dev/null -w '%{http_code}\n' localhost:8080/api/accounts; done | sort | uniq -c
    100 200
```

Combined with RBA-B-01 this means POST /api/transfers can be scripted without limit (each successful call also appends two rows to the in-memory `transactions` array - unbounded memory growth per instance).

**Remediation**

Add `express-rate-limit` (per-IP, stricter bucket for `POST /api/transfers`, keyed by session once RBA-B-01 lands; set `app.set('trust proxy', 1)` behind App Runner so the client IP is used) and attach an AWS WAFv2 web ACL with rate-based rules to the App Runner service in Terraform. Bound in-memory collections or move state to a store.

### RBA-F-03 - Runtime dependencies with high/critical advisories and available fixes (react-router 7.13.0, proxy-addr 2.0.7); no SCA gate in CI

**Severity:** high · **Area:** F (Security hygiene) · **Effort:** S  
**File:** `package.json; package-lock.json; .github/workflows/ci.yml` · **Lines:** package.json 5-12; package-lock.json 9963-9966, 18056-18059, 18309-18311; ci.yml 17-27

**Evidence**

`npm audit --json` (npm 10.8.2, 2026-10-06): 102 advisories (2 critical, 82 high, 14 moderate, 4 low). Runtime-relevant with a non-breaking fix (`fixAvailable: true`): `react-router` 7.13.0 (bundled into the browser) - GHSA-49rj-9fvp-4h2h (high, turbo-stream RCE), GHSA-8646-j5j9-6r62 (high, XSS via javascript: redirect), GHSA-chx6-hx7r-mcp5 (high, DoS), GHSA-qwww-vcr4-c8h2 (high, CSRF), GHSA-wrjc-x8rr-h8h6 / GHSA-2j2x-hqr9-3h42 (moderate open redirects) - vulnerable range `6.0.0 - 7.18.1`, latest 7.18.4; `proxy-addr` 2.0.7 via express 4.22.3 - GHSA-jqcg-44mw-7w3h (critical, IP spoofing via IPv4-mapped IPv6 trust subnet; only reachable once `trust proxy` is enabled, which RBA-F-02 recommends). The remaining ~80 high/2 critical (jest, webpack-dev-server, websocket-driver, svgo, nth-check, ...) are dev-only and fixable only by the semver-major move off `react-scripts` 5.0.1 (CRA is unmaintained). `.github/workflows/ci.yml` runs eslint/prettier/typecheck/tests/build but no `npm audit`; the `sca-vulnerability-check` job in `devin-ui-test.yml` is currently red for a revoked secret, so no SCA gate is effective.

**Remediation**

Bump `react-router-dom` to >=7.18.4 and add an `overrides` entry for `proxy-addr` to the patched release (or bump express when 4.22.x ships it); add `npm audit --omit=dev --audit-level=high` to `ci.yml` as a blocking step (and restore the Devin SCA job's secret). Plan the CRA -> Vite migration to retire the dev-chain advisories. Owner per REVIEW.md SEC-08.

### RBA-F-04 - Production image installs express outside the lockfile (--no-package-lock), so the shipped runtime is not reproducible or auditable

**Severity:** medium · **Area:** F (Security hygiene) · **Effort:** S  
**File:** `Dockerfile` · **Lines:** 12-16

**Evidence**

Stage 2 of the Dockerfile copies only `package.json` and runs `npm install --omit=dev --legacy-peer-deps --no-package-lock express@4`, resolving `express@4` and its transitive tree at build time instead of using `package-lock.json` (which pins express 4.22.3 / proxy-addr 2.0.7). Each image build may therefore contain a different express dependency tree than the one `npm audit` and the SCA job examine, and `npm run test:server` in CI never runs against the production tree.

**Remediation**

Copy `package-lock.json` into the runtime stage and run `npm ci --omit=dev --legacy-peer-deps --ignore-scripts` (or produce a trimmed server-only `package.json`/lockfile via `npm pkg` + workspaces) so the image is built from the lockfile; enable ECR `scan_on_push` findings as a deploy gate (it is already enabled in `infra/ecr.tf`).

### RBA-F-05 - GitHub Actions run step interpolates PR-controlled context directly into a shell script

**Severity:** low · **Area:** F (Security hygiene) · **Effort:** S  
**File:** `.github/workflows/devin-ui-test.yml` · **Lines:** 22-32

**Evidence**

Line 30 builds a JSON string inside `run:` with `${{ github.repository }}`, `${{ github.event.pull_request.number }}` and three uses of `${{ github.head_ref }}` (the branch name, chosen by the PR author) - the GitHub-documented script-injection pattern. The workflow triggers on `pull_request` (not `pull_request_target`), so fork PRs do not receive `secrets.DEVIN_API_KEY`, which limits impact to same-repo branches; the expression is also inside a double-quoted bash string so a branch name containing `"` or `$(...)` breaks or executes in the step. REVIEW.md CI-03 asks for least-privilege review of workflow changes.

**Remediation**

Pass `github.head_ref` and the PR number through `env:` (`HEAD_REF: ${{ github.head_ref }}`) and reference `$HEAD_REF` in the script; build the request body with `jq -n --arg` so it is JSON-escaped. Add `permissions: contents: read` at the workflow top (ci.yml also lacks an explicit `permissions` block).

### RBA-G-01 - Deploys track a mutable :latest tag with no documented or automated rollback; no changelog or deprecation process

**Severity:** medium · **Area:** G (Lifecycle) · **Effort:** M  
**File:** `.github/workflows/deploy.yml; infra/ecr.tf; infra/apprunner.tf; infra/variables.tf` · **Lines:** deploy.yml 35-65; ecr.tf 1-4; apprunner.tf 29-38; variables.tf 22-26

**Evidence**

`deploy.yml` pushes `$GITHUB_SHA` and `latest` and App Runner (`auto_deployments_enabled = true`, `image_identifier = ...:${var.imageTag}` with default `latest`) rolls whatever was pushed last; `aws_ecr_repository.app` has `image_tag_mutability = "MUTABLE"` and `force_delete = true`. Rolling back therefore means manually re-tagging an older SHA as `latest` (no script, runbook or workflow does this; README has no rollback section). There is no CHANGELOG, no `Deprecation`/`Sunset` header support, and no API contract/spec lint gate in CI (see RBA-A-01). Positive: App Runner's health check (`/health`, unhealthy*threshold 5) gives automatic rollback of a failed rollout, and `deploy.yml` waits on the operation and fails on `ROLLBACK*\*`.

**Remediation**

Set `image_tag_mutability = "IMMUTABLE"`, deploy by SHA (`terraform apply -var imageTag=$GITHUB_SHA` or `aws apprunner update-service` with the SHA image) and add a `rollback` `workflow_dispatch` input that redeploys a given SHA; keep a `CHANGELOG.md` (Keep a Changelog) with an `## API` section and emit `Deprecation`/`Sunset` headers for retired routes per API-06. Gate deploys on the CI workflow (`workflow_run` or branch protection).

## Positives

- Uniform success/error envelope for handled errors: `{ <resource>: ... }` on success and `{ error: { code, message, field?, correlationId } }` via typed `ValidationError`/`NotFoundError` + a single `errorHandler` (server/errors.js, server/middleware/errorHandler.js); 404 for missing accounts verified at runtime.
- Correlation ID discipline: `requestContext` mints/validates a UUID `x-correlation-id` (rejects non-UUID client values - verified with `<script>` header), returns it on every response and includes it in request-completion, warn and error logs; the UI shows it as a Reference ID and the iOS client surfaces it (ApiClient.swift).
- 5xx errors are alertable from logs alone: single-line structured JSON to stderr with `level: "ERROR"`, route, stack and correlationId, consumed by the CloudWatch subscription filter `{ $.level = "ERROR" }` -> Lambda (infra/alerts.tf) - a reusable incident-to-ticket pattern.
- Internals are not leaked on 5xx: the client receives a fixed `INTERNAL_ERROR` message and correlationId while the stack stays server-side (verified on the cc-3309 500).
- Structured JSON logger (`server/logger.js`) with service/environment fields, key-based redaction of obviously sensitive body fields and string truncation in error logs; `x-powered-by` disabled.
- Body size bounded by `express.json()` default 100 kB (200 kB body -> 413 verified); no SQL/NoSQL/command execution surfaces; no `dangerouslySetInnerHTML`/`innerHTML` in `src/`; static assets served by `express.static` (path traversal attempt returned the SPA index, not a file).
- No CORS middleware, so browsers enforce same-origin on the API by default (preflight returns no `Access-Control-Allow-*` headers); the iOS client is a native caller and is unaffected.
- No secrets in source: the Devin key lives in Secrets Manager with a `REPLACE_ME` placeholder and `lifecycle.ignore_changes`; the Lambda role can read only that secret ARN; the GitHub deploy role is OIDC-federated and scoped to `repo:<repo>:ref:refs/heads/<branch>` with resource-scoped ECR/App Runner permissions (infra/deploy_role.tf). Sentry DSN is the sanctioned exception per REVIEW.md SEC-01.
- Contract-style tests exist for the API (`server/test/*.test.js`, node:test, 10 passing): status codes, envelope shape and error paths for transfers and accounts; CI (`ci.yml`) gates on eslint, prettier, typecheck, server tests, React tests and build.
- REVIEW.md is a well-structured engineering standard with rule IDs (SEC-/API-/OBS-/TS-/UI-/A11Y-/TEST-/CI-) and blocking/advisory tiers, enforced by Devin Review - a candidate template for the org-wide API standard.
- Deploy pipeline waits for the App Runner operation and fails on `ROLLBACK_*`; App Runner health checks on `/health`; ECR has scan-on-push and a 20-image lifecycle policy; Lambda has 30-day log retention.
- iOS App Transport Security only exempts `localhost` (NSAllowsLocalNetworking + localhost exception) rather than `NSAllowsArbitraryLoads`; production base URL is injected via Info.plist/env, not hard-coded.

## Needs confirmation

- Cross-customer IDOR could not be exercised as such: the seed data is a single customer with no owner field, so there is no second tenant to pivot to. Treated as part of RBA-B-01 (no authn/authz at all) rather than a separate IDOR finding.
- Exploitability of proxy-addr GHSA-jqcg-44mw-7w3h (RBA-F-03) depends on `trust proxy` being enabled; the app does not set it today, so practical impact is currently nil - confirm the intended value once a rate limiter is added.
- Edge protections for the production App Runner service (WAF, TLS policy, request-rate limits at the envoy layer) were not inspected via the AWS API; only response headers from the public URL were observed.
- Lambda/Secrets Manager live configuration (actual secret value, Lambda env vars) was not read; infra was reviewed from Terraform source only.
- The iOS client (`ios/WellsBanking`) was reviewed statically; it was not built or run on this Linux VM.
- Memory growth from unbounded `transactions.unshift` per transfer (RBA-F-02 note) was reasoned from code, not load-tested.

## Appendix A - commands run and tool versions

Tool versions: Node v20.18.1, npm 10.8.2, curl 7.81.0, Python 3.10.12 (Ubuntu 22.04 VM).

```
git fetch origin master && git checkout master
npm run test:server                         # 10 pass
npm run eslint                              # clean
npx prettier --check .                      # clean
npm run typecheck                           # clean after a fresh `npm ci --legacy-peer-deps` (the snapshot's node_modules lacked @types/jest)
npm run build && PORT=8080 node server/index.js > /tmp/server.log 2> /tmp/server.err
npm audit --json                            # 102 advisories: 2 critical, 82 high, 14 moderate, 4 low
git log -p -- server/routes                 # routes added once in b633cc2, never changed
curl ... (full battery below)
curl -si https://nj5xtw68mz.us-east-1.awsapprunner.com/health ; curl -s .../api/accounts ; curl -sI .../
```

## Appendix B - runtime transcripts (trimmed)

```text
### health headers
$ curl -si http://localhost:8080/health
HTTP/1.1 200 OK
x-correlation-id: 5eb1890a-28a4-43da-b9fc-b8c21dd71057
Content-Type: application/json; charset=utf-8
Content-Length: 64
ETag: W/"40-M7bSEjrZyyHcZGltDhb4plLHixA"
Date: Tue, 06 Oct 2026 08:04:53 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"status":"ok","service":"wf-online-banking","uptimeSeconds":61}

### accounts unauth
$ curl -s http://localhost:8080/api/accounts
{"accounts":[{"id":"chk-4471","type":"checking","name":"Everyday Checking","lastFour":"4471","availableBalance":4826.12,"currentBalance":4826.12},{"id":"sav-8820","type":"savings","name":"Way2Save Savings","lastFour":"8820","availableBalance":12450,"currentBalance":12450,"apy":0.01},{"id":"cc-3309","type":"credit","name":"Active Cash Visa Signature Card","lastFour":"3309","currentBalance":1284.57,"creditLimit":10000,"availableCredit":8715.43,"minimumPaymentDue":35,"paymentDueDate":"2026-10-21"},{"id":"mtg-1150","type":"loan","name":"Home Mortgage","lastFour":"1150","currentBalance":312400,"nextPaymentAmount":2184.3,"paymentDueDate":"2026-11-01"}]}

### idor other account
$ curl -si http://localhost:8080/api/accounts/sav-8820
HTTP/1.1 200 OK
x-correlation-id: 1ab46cc8-ad3e-49dc-b483-9724b735a004
Content-Type: application/json; charset=utf-8
Content-Length: 149
ETag: W/"95-cf+4rAF8dt7uUcNuvIHTyQU6Sns"
Date: Tue, 06 Oct 2026 08:04:53 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"account":{"id":"sav-8820","type":"savings","name":"Way2Save Savings","lastFour":"8820","availableBalance":12450,"currentBalance":12450,"apy":0.01}}

### 404 account
$ curl -si http://localhost:8080/api/accounts/does-not-exist
HTTP/1.1 404 Not Found
x-correlation-id: cb08004a-19c4-488b-8a61-0400640ea381
Content-Type: application/json; charset=utf-8
Content-Length: 139
ETag: W/"8b-JFv0KXWTomb1gO1wQENHYnHbMiQ"
Date: Tue, 06 Oct 2026 08:04:53 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"error":{"code":"NotFoundError","message":"Account does-not-exist was not found.","correlationId":"cb08004a-19c4-488b-8a61-0400640ea381"}}

### unknown api route
$ curl -si http://localhost:8080/api/nope
HTTP/1.1 404 Not Found
x-correlation-id: df903e52-1ed7-48a2-8196-ae15da145a00
Content-Security-Policy: default-src 'none'
X-Content-Type-Options: nosniff
Content-Type: text/html; charset=utf-8
Content-Length: 147
Date: Tue, 06 Oct 2026 08:04:53 GMT
Connection: keep-alive
Keep-Alive: timeout=5

<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Error</title>
</head>
<body>
<pre>Cannot GET /api/nope</pre>
</body>
</html>


### wrong verb
$ curl -si -X POST http://localhost:8080/api/accounts
HTTP/1.1 404 Not Found
x-correlation-id: cafa45df-e4cc-4864-bccd-33b257a02488
Content-Security-Policy: default-src 'none'
X-Content-Type-Options: nosniff
Content-Type: text/html; charset=utf-8
Content-Length: 152
Date: Tue, 06 Oct 2026 08:04:53 GMT
Connection: keep-alive
Keep-Alive: timeout=5

<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Error</title>
</head>
<body>
<pre>Cannot POST /api/accounts</pre>
</body>
</html>


### empty body
$ curl -si -X POST http://localhost:8080/api/transfers -H content-type: application/json
HTTP/1.1 400 Bad Request
x-correlation-id: 66924a8a-e0ad-4ddf-90ce-5d054d62278f
Content-Type: application/json; charset=utf-8
Content-Length: 150
ETag: W/"96-Vu+EUW9gNuK4Qw9KW3eRxcgFY4M"
Date: Tue, 06 Oct 2026 08:04:53 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"error":{"code":"ValidationError","message":"Choose a From account.","field":"fromAccountId","correlationId":"66924a8a-e0ad-4ddf-90ce-5d054d62278f"}}

### malformed json
$ curl -si -X POST http://localhost:8080/api/transfers -H content-type: application/json --data {bad
HTTP/1.1 400 Bad Request
Content-Type: application/json; charset=utf-8
Content-Length: 96
ETag: W/"60-6yXpHA9pAaWp8wEd2lL6VQasOGw"
Date: Tue, 06 Oct 2026 08:04:53 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"error":{"code":"SyntaxError","message":"Expected property name or '}' in JSON at position 1"}}

### oversized body 200kb
$ sh -c python3 -c "import json;print(json.dumps({'fromAccountId':'chk-4471','toAccountId':'sav-8820','amount':'1','memo':'x'*200000}))" | curl -si -X POST http://localhost:8080/api/transfers -H 'content-type: application/json' --data-binary @-
HTTP/1.1 413 Payload Too Large
Content-Type: application/json; charset=utf-8
Content-Length: 78
ETag: W/"4e-+cVTgt3NraA5YWXKAv11CgVj+/k"
Date: Tue, 06 Oct 2026 08:04:53 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"error":{"code":"PayloadTooLargeError","message":"request entity too large"}}

### boolean amount
$ curl -si -X POST http://localhost:8080/api/transfers -H content-type: application/json --data {"fromAccountId":"chk-4471","toAccountId":"sav-8820","amount":true}
HTTP/1.1 201 Created
x-correlation-id: 34bdece0-57b7-496c-8be0-adb659c32db9
Content-Type: application/json; charset=utf-8
Content-Length: 376
ETag: W/"178-+BLHtrgYQPnoJk9ASMWcGJ8UGq4"
Date: Tue, 06 Oct 2026 08:04:53 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"transfer":{"confirmationNumber":"5E5D17D9DE","postedAt":"2026-10-06","amount":1,"memo":"","from":{"id":"chk-4471","type":"checking","name":"Everyday Checking","lastFour":"4471","availableBalance":4825.12,"currentBalance":4825.12},"to":{"id":"sav-8820","type":"savings","name":"Way2Save Savings","lastFour":"8820","availableBalance":12451,"currentBalance":12451,"apy":0.01}}}

### exponent amount
$ curl -si -X POST http://localhost:8080/api/transfers -H content-type: application/json --data {"fromAccountId":"chk-4471","toAccountId":"sav-8820","amount":"1e1"}
HTTP/1.1 201 Created
x-correlation-id: ad245463-cb69-489a-ba5a-df7ef0e70ceb
Content-Type: application/json; charset=utf-8
Content-Length: 377
ETag: W/"179-bRTXVfq298dPpyBHved5s0JPb3Q"
Date: Tue, 06 Oct 2026 08:04:53 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"transfer":{"confirmationNumber":"D62B606A2E","postedAt":"2026-10-06","amount":10,"memo":"","from":{"id":"chk-4471","type":"checking","name":"Everyday Checking","lastFour":"4471","availableBalance":4815.12,"currentBalance":4815.12},"to":{"id":"sav-8820","type":"savings","name":"Way2Save Savings","lastFour":"8820","availableBalance":12461,"currentBalance":12461,"apy":0.01}}}

### object memo
$ curl -si -X POST http://localhost:8080/api/transfers -H content-type: application/json --data {"fromAccountId":"chk-4471","toAccountId":"sav-8820","amount":"1.00","memo":{"a":1}}
HTTP/1.1 201 Created
x-correlation-id: 731e8d97-300b-46ee-997f-4b397233064d
Content-Type: application/json; charset=utf-8
Content-Length: 381
ETag: W/"17d-vw8ac3ZXViivAM3L2J3EeNnpDDQ"
Date: Tue, 06 Oct 2026 08:04:53 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"transfer":{"confirmationNumber":"BB294F9192","postedAt":"2026-10-06","amount":1,"memo":{"a":1},"from":{"id":"chk-4471","type":"checking","name":"Everyday Checking","lastFour":"4471","availableBalance":4814.12,"currentBalance":4814.12},"to":{"id":"sav-8820","type":"savings","name":"Way2Save Savings","lastFour":"8820","availableBalance":12462,"currentBalance":12462,"apy":0.01}}}

### 90kb memo accepted?
$ sh -c python3 -c "import json;print(json.dumps({'fromAccountId':'chk-4471','toAccountId':'sav-8820','amount':'1','memo':'M'*90000}))" | curl -s -o /dev/null -w '%{http_code} %{size_download}\n' -X POST http://localhost:8080/api/transfers -H 'content-type: application/json' --data-binary @-
201 90376


### html memo stored
$ curl -s -X POST http://localhost:8080/api/transfers -H content-type: application/json --data {"fromAccountId":"chk-4471","toAccountId":"sav-8820","amount":"1.00","memo":"<img src=x onerror=alert(1)>"}
{"transfer":{"confirmationNumber":"D7A2BB20C1","postedAt":"2026-10-06","amount":1,"memo":"<img src=x onerror=alert(1)>","from":{"id":"chk-4471","type":"checking","name":"Everyday Checking","lastFour":"4471","availableBalance":4812.12,"currentBalance":4812.12},"to":{"id":"sav-8820","type":"savings","name":"Way2Save Savings","lastFour":"8820","availableBalance":12464,"currentBalance":12464,"apy":0.01}}}

### idempotency replay x2
$ sh -c for i in 1 2; do curl -s -X POST http://localhost:8080/api/transfers -H 'content-type: application/json' -H 'Idempotency-Key: abc-123' --data '{"fromAccountId":"chk-4471","toAccountId":"sav-8820","amount":"5.00"}' | python3 -c 'import json,sys;d=json.load(sys.stdin)["transfer"];print(d["confirmationNumber"], d["from"]["availableBalance"])'; done
223CEB231C 4807.12
6DCB35E725 4802.12


### balance before cc 500
$ curl -s http://localhost:8080/api/accounts/chk-4471
{"account":{"id":"chk-4471","type":"checking","name":"Everyday Checking","lastFour":"4471","availableBalance":4802.12,"currentBalance":4802.12}}

### transfer to credit card
$ curl -si -X POST http://localhost:8080/api/transfers -H content-type: application/json --data {"fromAccountId":"chk-4471","toAccountId":"cc-3309","amount":"150.00","memo":"October payment"}
HTTP/1.1 500 Internal Server Error
x-correlation-id: 20d8dbc1-7247-4183-8d91-cdf23195af15
Content-Type: application/json; charset=utf-8
Content-Length: 175
ETag: W/"af-rOxXugU6/8kH1FfHEHLivY+todI"
Date: Tue, 06 Oct 2026 08:04:53 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"error":{"code":"INTERNAL_ERROR","message":"We're sorry - we couldn't complete your request. Please try again later.","correlationId":"20d8dbc1-7247-4183-8d91-cdf23195af15"}}

### balance after cc 500
$ curl -s http://localhost:8080/api/accounts/chk-4471
{"account":{"id":"chk-4471","type":"checking","name":"Everyday Checking","lastFour":"4471","availableBalance":4652.12,"currentBalance":4652.12}}

### cc after
$ curl -s http://localhost:8080/api/accounts/cc-3309
{"account":{"id":"cc-3309","type":"credit","name":"Active Cash Visa Signature Card","lastFour":"3309","currentBalance":1284.57,"creditLimit":10000,"availableCredit":8715.43,"minimumPaymentDue":35,"paymentDueDate":"2026-10-21"}}

### txns after (partial write?)
$ sh -c curl -s http://localhost:8080/api/accounts/chk-4471/transactions | head -c 600
{"transactions":[{"id":"txn-20bc7960","accountId":"chk-4471","postedAt":"2026-10-06","description":"Online Transfer to Way2Save Savings ...8820","amount":-5},{"id":"txn-0227cdd2","accountId":"chk-4471","postedAt":"2026-10-06","description":"Online Transfer to Way2Save Savings ...8820","amount":-5},{"id":"txn-965f9083","accountId":"chk-4471","postedAt":"2026-10-06","description":"Online Transfer to Way2Save Savings ...8820 - <img src=x onerror=alert(1)>","amount":-1},{"id":"txn-af09339d","accountId":"chk-4471","postedAt":"2026-10-06","description":"Online Transfer to Way2Save Savings ...8820 -

### stderr log line
$ tail -1 /tmp/server.err
{"timestamp":"2026-10-06T08:04:53.425Z","level":"ERROR","service":"wf-online-banking","environment":"local","event":"unhandled request error","correlationId":"20d8dbc1-7247-4183-8d91-cdf23195af15","method":"POST","path":"/api/transfers","statusCode":500,"errorName":"TypeError","errorMessage":"Cannot read properties of undefined (reading 'direction')","stack":"TypeError: Cannot read properties of undefined (reading 'direction')\n    at postCredit (/home/ubuntu/repos/react-banking-app/server/services/transfers.js:29:27)\n    at Object.transfer (/home/ubuntu/repos/react-banking-app/server/services/transfers.js:76:5)\n    at /home/ubuntu/repos/react-banking-app/server/routes/transfers.js:9:38\n    at Layer.handle [as handle_request] (/home/ubuntu/repos/react-banking-app/node_modules/express/lib/router/layer.js:95:5)\n    at next (/home/ubuntu/repos/react-banking-app/node_modules/express/lib/router/route.js:149:13)\n    at Route.dispatch (/home/ubuntu/repos/react-banking-app/node_modules/express/lib/router/route.js:119:3)\n    at Layer.handle [as handle_request] (/home/ubuntu/repos/react-banking-app/node_modules/express/lib/router/layer.js:95:5)\n    at /home/ubuntu/repos/react-banking-app/node_modules/express/lib/router/index.js:284:15\n    at Function.process_params (/home/ubuntu/repos/react-banking-app/node_modules/express/lib/router/index.js:346:12)\n    at next (/home/ubuntu/repos/react-banking-app/node_modules/express/lib/router/index.js:280:10)","requestBody":{"fromAccountI

### from credit
$ curl -s -X POST http://localhost:8080/api/transfers -H content-type: application/json --data {"fromAccountId":"cc-3309","toAccountId":"chk-4471","amount":"1"}
{"error":{"code":"INTERNAL_ERROR","message":"We're sorry - we couldn't complete your request. Please try again later.","correlationId":"5045d44a-b29c-4cd0-a8a6-afcdcc9dc540"}}

### cors preflight
$ curl -si -X OPTIONS http://localhost:8080/api/transfers -H Origin: https://evil.example -H Access-Control-Request-Method: POST
HTTP/1.1 200 OK
x-correlation-id: 5a4d803f-addc-4c10-8a35-e0791b4e738e
Allow: POST
Content-Type: text/html; charset=utf-8
Content-Length: 4
ETag: W/"4-Yf+Bwwqjx254r+pisuO9HfpJ6FQ"
Date: Tue, 06 Oct 2026 08:04:53 GMT
Connection: keep-alive
Keep-Alive: timeout=5

POST

### cors simple
$ curl -si http://localhost:8080/api/accounts -H Origin: https://evil.example -o /dev/null -D -
HTTP/1.1 200 OK
x-correlation-id: adb0443f-e6d6-42cd-8036-645170ea585b
Content-Type: application/json; charset=utf-8
Content-Length: 655
ETag: W/"28f-woxuANh4Il8B8AZMrU8Kg3fTyn4"
Date: Tue, 06 Oct 2026 08:04:53 GMT
Connection: keep-alive
Keep-Alive: timeout=5



### bad correlation id
$ curl -si http://localhost:8080/health -H x-correlation-id: <script> -o /dev/null -D -
HTTP/1.1 200 OK
x-correlation-id: ae7bea0a-2079-4115-9418-d2222badc9d8
Content-Type: application/json; charset=utf-8
Content-Length: 64
ETag: W/"40-M7bSEjrZyyHcZGltDhb4plLHixA"
Date: Tue, 06 Oct 2026 08:04:53 GMT
Connection: keep-alive
Keep-Alive: timeout=5



### rate limit 100 req
$ sh -c for i in $(seq 1 100); do curl -s -o /dev/null -w '%{http_code}\n' http://localhost:8080/api/accounts; done | sort | uniq -c
    100 200


### text/plain body
$ curl -si -X POST http://localhost:8080/api/transfers -H content-type: text/plain --data hi
HTTP/1.1 400 Bad Request
x-correlation-id: 7b1912e9-2cf2-497e-ad7e-631f1a533eaf
Content-Type: application/json; charset=utf-8
Content-Length: 150
ETag: W/"96-fsNA2WbqZGcNkUa6YP9PV3vSEu4"
Date: Tue, 06 Oct 2026 08:04:53 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"error":{"code":"ValidationError","message":"Choose a From account.","field":"fromAccountId","correlationId":"7b1912e9-2cf2-497e-ad7e-631f1a533eaf"}}

### static traversal
$ curl -si --path-as-is http://localhost:8080/..%2f..%2fetc/passwd -o /dev/null -D -
HTTP/1.1 200 OK
x-correlation-id: 64629ed1-2bc5-46a9-a33b-9afb38b1eef9
Accept-Ranges: bytes
Cache-Control: public, max-age=0
Last-Modified: Tue, 06 Oct 2026 08:03:52 GMT
ETag: W/"273-1a1103d8ed5"
Content-Type: text/html; charset=UTF-8
Content-Length: 627
Date: Tue, 06 Oct 2026 08:04:53 GMT
Connection: keep-alive
Keep-Alive: timeout=5



### proto pollution
$ curl -s -X POST http://localhost:8080/api/transfers -H content-type: application/json --data {"__proto__":{"polluted":1},"fromAccountId":"chk-4471","toAccountId":"sav-8820","amount":"1"}
{"transfer":{"confirmationNumber":"D7F096E74B","postedAt":"2026-10-06","amount":1,"memo":"","from":{"id":"chk-4471","type":"checking","name":"Everyday Checking","lastFour":"4471","availableBalance":4651.12,"currentBalance":4651.12},"to":{"id":"sav-8820","type":"savings","name":"Way2Save Savings","lastFour":"8820","availableBalance":12475,"currentBalance":12475,"apy":0.01}}}

### float accumulation
$ sh -c for i in 1 2 3; do curl -s -X POST http://localhost:8080/api/transfers -H 'content-type: application/json' --data '{"fromAccountId":"chk-4471","toAccountId":"sav-8820","amount":"0.10"}' >/dev/null; done; curl -s http://localhost:8080/api/accounts/chk-4471
{"account":{"id":"chk-4471","type":"checking","name":"Everyday Checking","lastFour":"4471","availableBalance":4650.82,"currentBalance":4650.82}}

### stdout request log sample
$ sh -c grep 'request completed' /tmp/server.log | tail -2; grep 'transfer posted' /tmp/server.log | tail -1
{"timestamp":"2026-10-06T08:04:53.444Z","level":"INFO","service":"wf-online-banking","environment":"local","event":"request completed","correlationId":"5045d44a-b29c-4cd0-a8a6-afcdcc9dc540","method":"POST","path":"/api/transfers","statusCode":500,"durationMs":0.411145}
{"timestamp":"2026-10-06T08:04:53.845Z","level":"INFO","service":"wf-online-banking","environment":"local","event":"request completed","correlationId":"7b1912e9-2cf2-497e-ad7e-631f1a533eaf","method":"POST","path":"/api/transfers","statusCode":400,"durationMs":0.335486}
{"timestamp":"2026-10-06T08:04:53.868Z","level":"INFO","service":"wf-online-banking","environment":"local","event":"transfer posted","correlationId":"ffc34556-9369-42dd-a4e9-8331c53e0056","confirmationNumber":"8F539C9BD9","fromAccountId":"chk-4471","toAccountId":"sav-8820","amount":0.1}
```
