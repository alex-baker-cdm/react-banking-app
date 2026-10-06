# Online Banking demo (Wells Fargo-style)

Retail online-banking web app used for Devin demos: account summary, account activity and a
Transfer & Pay flow. React (Create React App, strict TypeScript) UI served by a small Express API,
deployed to AWS App Runner with a CloudWatch -> Lambda -> Devin auto-triage pipeline.

```
browser -> App Runner (Express + React) --stderr JSON--> CloudWatch Logs --filter ERROR--> Lambda --> Devin session
                                                                                              |-> clones repo
                                                                                              |-> pulls logs
                                                                                              |-> reproduces the failure locally on camera
                                                                                              |-> fixes + tests
                                                                                              '-> opens PR
```

## Run locally

```bash
npm ci --legacy-peer-deps
npm run build && npm run serve   # Express API + built UI on http://localhost:8080
```

For UI hot reload run `npm run serve` in one terminal and `npm start` in another (CRA proxies `/api` to 8080).

## Checks

```bash
npm run eslint
npm run typecheck
npm run test:server                       # Express API tests (node:test)
npx react-scripts test --watchAll=false   # React component tests (Jest + Testing Library)
```

## Layout

- `src/` - React UI. Pages in `src/pages/`, shared components in `src/components/<Name>/`, API client in `src/api/`.
- `server/` - Express API: `routes/`, `services/transfers.js` (posting rules), `data/accounts.js` (seed data),
  `middleware/` (correlation IDs, structured error logging). Tests in `server/test/`.
- `infra/` - Terraform for ECR, App Runner, the alerts Lambda (`infra/lambda/alerts.py` holds the triage prompt)
  and the GitHub OIDC deploy role. `scripts/deploy.sh` builds, pushes and applies.
- `ios/` - SwiftUI companion app (iOS) that talks to the same API.
- `REVIEW.md` - code review guidelines enforced by Devin Review.

## Observability

Every request gets an `x-correlation-id`. Unhandled 5xx errors are written to stderr as a single JSON line with
`level: "ERROR"`, the route, stack trace and request body; the customer sees the same ID as a "Reference ID".
