# Enterprise Engineering Standards — Digital Banking Platform

Devin Review enforces this document on every pull request. Each rule has an ID; review comments cite the ID so authors can trace a finding back to the standard. Rules marked **[blocking]** must be fixed before merge; others are advisory.

Scope: the React web app (`src/`), the Express API (`server/`), the iOS app (`ios/`), infrastructure (`infra/`), and CI (`.github/`).

---

## 1. Security (SEC)

- **SEC-01 [blocking]** No secrets in source. API keys, tokens, passwords, and signing keys never appear in code, tests, fixtures, or client bundles — anything under `src/` ships to the browser. Use environment variables, AWS Secrets Manager, or GitHub secrets. Sentry DSNs are the only sanctioned exception.
- **SEC-02 [blocking]** Credentials never travel in URLs. No `?key=`, `?token=`, or similar query parameters; URLs are logged by proxies, browsers, and CloudWatch. Use the `Authorization` header or a session cookie.
- **SEC-03 [blocking]** Never render untrusted data as HTML. `dangerouslySetInnerHTML`, `innerHTML`, and server-side string-built HTML are prohibited. Transaction descriptions, memos, and account names are customer-influenced data.
- **SEC-04 [blocking]** No customer data in logs or console. Account numbers (including last four), balances, names, emails, phone numbers, and transaction detail must not be passed to `console.*`, `logger.*`, or Sentry `extra`. Log identifiers (`accountId`, `correlationId`) only.
- **SEC-05 [blocking]** Validate every input with an allowlist. Route params, query strings, and bodies are checked before use (e.g. `format` must be one of a fixed set). Reject with a 4xx `ValidationError`; never fall through to a 500.
- **SEC-06 [blocking]** Never leak internals to clients. Error responses contain the standard envelope only (SEC-06 ↔ API-02) — no stack traces, exception messages, file paths, or dependency names.
- **SEC-07** Export formats that reach spreadsheets (CSV/TSV) escape cells starting with `=`, `+`, `-`, `@` to prevent formula injection.
- **SEC-08** Dependencies: no new runtime dependency without a named owner in the PR description; resolve critical/high SCA findings before merge.

## 2. API-First Contract (API)

- **API-01 [blocking]** Every `/api/*` route is registered under `server/routes/`, mounted in `server/app.js`, and covered by at least one contract test in `server/test/` (status code, envelope shape, error path).
- **API-02 [blocking]** Uniform envelope. Success: `{ <resource>: ... }`. Failure: delegate to `errorHandler` via `next(err)` using the typed errors in `server/errors.js` so the client receives `{ error: { code, message, correlationId } }`. Handlers never call `res.status(500)` directly.
- **API-03 [blocking]** Resource lookups that can miss must return `NotFoundError` (404), never dereference `undefined`.
- **API-04** Representation is chosen by path or `Accept` header, not by a free-form query flag. If a query parameter is unavoidable it is validated (SEC-05).
- **API-05** Authentication/authorization is enforced by middleware, never inline in a handler, and never by comparing against a literal.
- **API-06** Breaking changes require a new versioned path (`/api/v2/...`) and a deprecation note; existing clients (web, iOS) keep working for one release.
- **API-07** Handlers are non-blocking: no synchronous filesystem or network calls on the request path.

## 3. Observability (OBS)

- **OBS-01 [blocking]** Server code uses `server/logger.js` (structured JSON) only. `console.*` is prohibited in `server/` and `src/` (ESLint `no-console`). Client-side diagnostics go to Sentry.
- **OBS-02 [blocking]** Every server log line and every error response carries the request `correlationId` from `requestContext`.
- **OBS-03 [blocking]** Errors are never swallowed. `catch (e) {}` and `.catch(() => {})` are prohibited; report with `Sentry.captureException(err, { tags })` on the client or `next(err)` on the server, and show the user a recoverable state.
- **OBS-04** Pages that load data expose loading, empty, and error states; a failed fetch must not leave the page blank.

## 4. TypeScript & Data Contracts (TS)

- **TS-01 [blocking]** `any` is prohibited. Use the shared types in `src/api/types.ts` (`Account`, `Transaction`, …) or `unknown` narrowed by a type guard.
- **TS-02 [blocking]** API responses are parsed through `src/api/client.ts`; pages never call `fetch` directly or build API URLs by hand.
- **TS-03** Identifiers: `camelCase` for variables, functions, props, hooks; `PascalCase` for components, interfaces, types; `UPPER_SNAKE_CASE` only for true compile-time constants.
- **TS-04** `strict` stays on; no `@ts-ignore` / `@ts-expect-error` without a justification comment.

## 5. React & UI Consistency (UI)

- **UI-01 [blocking]** Lists use a stable domain key (`transaction.id`), never the array index.
- **UI-02 [blocking]** Components are named arrow functions typed `React.FC<Props>` with an explicit props interface; no inline prop object types.
- **UI-03** Reuse the design-system primitives and classes in `public/app.css` (`wf-page-title`, `wf-panel`, `wf-button`, `wf-table`, …). Do not introduce one-off inline styles or new CSS-in-JS.
- **UI-04** Static assets referenced from JSX must exist under `public/`; images use `alt` text or `aria-hidden="true"` when decorative.
- **UI-05** Pages (`src/pages/`) compose components and hold minimal logic; data shaping belongs in `src/api/` or hooks in `src/hooks/`.
- **UI-06** Follow the Rules of Hooks; custom hooks live in `src/hooks/` and start with `use`.

## 6. Accessibility (A11Y)

- **A11Y-01 [blocking]** Interactive elements are native (`<button>`, `<a>`, `<input>`) or carry `role`, `tabIndex`, and keyboard handlers.
- **A11Y-02** Form controls have associated labels; tables have header cells; colour is never the only signal.

## 7. Quality & Test Engineering (TEST)

- **TEST-01 [blocking]** New server behaviour ships with `node:test` coverage in `server/test/` for the success path and each error path.
- **TEST-02 [blocking]** New pages/components ship with a React Testing Library test covering default, loading, error, and empty states; query by role/label/text.
- **TEST-03** Tests are never skipped, deleted, or weakened to make CI pass; a regression fix adds a test that fails before and passes after.
- **TEST-04** Regression tests for production incidents reference the incident `correlationId` in the test name or a comment.

## 8. Delivery & CI/CD (CI)

- **CI-01 [blocking]** PRs pass `npm run eslint`, `npx prettier --check .`, `npm run typecheck`, `npm run test:server`, the React test suite, and `npm run build`.
- **CI-02** One concern per PR. The description states the user-facing change, the risk, and the verification evidence (test output, screenshots, or recording).
- **CI-03** Infrastructure and workflow changes (`infra/`, `.github/`) are reviewed for least privilege; IAM policies name resources, not `*`, unless the API requires it.
- **CI-04** Generated artifacts (`build/`, `__pycache__/`, `*.zip`) are never committed.
- **CI-05** Install with `npm ci --legacy-peer-deps`; lockfile changes are explained in the PR.

## 9. Review Conventions

- Comments cite a rule ID (`SEC-02`) and, for blocking findings, propose the compliant alternative.
- A PR with any unresolved **[blocking]** finding is not mergeable.
- Rules are changed through a PR to this file with a rationale; the review bot picks up the new standard on the next run.
