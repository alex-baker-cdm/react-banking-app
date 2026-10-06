"""App Runner application logs -> CloudWatch Logs subscription filter -> this Lambda -> Devin session.

The banking app writes one structured JSON line per unhandled request error (level = "ERROR"). The subscription
filter forwards only those lines here. For every error line we open a fresh Devin session that pulls the logs,
reproduces the failure locally, fixes it on camera and opens a pull request.

Deliberately not idempotent per error signature: every occurrence gets its own session, even if a PR for the
same root cause is already open. Idempotency here means "same input, same behaviour" - one error, one session.
"""

import base64
import gzip
import json
import logging
import os
import urllib.error
import urllib.request

import boto3

log = logging.getLogger()
log.setLevel(logging.INFO)

ENVIRONMENT = os.environ["ENVIRONMENT"]
REGION = os.environ["AWS_REGION"]
APP_REPO = os.environ["APP_REPO"]
APP_URL = os.environ.get("APP_URL", "")
APP_BRANCH = os.environ.get("APP_BRANCH", "master")
APP_LOG_GROUP = os.environ["APP_LOG_GROUP"]
DEVIN_API_URL = os.environ.get("DEVIN_API_URL", "https://api.devin.ai/v3")
DEVIN_ORG_ID = os.environ["DEVIN_ORG_ID"]
DEVIN_CREATE_AS_USER_ID = os.environ.get("DEVIN_CREATE_AS_USER_ID", "")
DEVIN_KEY_SECRET_ARN = os.environ["DEVIN_KEY_SECRET_ARN"]
PLACEHOLDER = "REPLACE_ME"

secrets = boto3.client("secretsmanager")
_apiKeyCache: dict[str, str | None] = {}


def handler(event, _context):
    payload = decodeLogsPayload(event)
    logGroup = payload.get("logGroup", APP_LOG_GROUP)
    logStream = payload.get("logStream", "")
    opened = []
    failed = []

    for logEvent in payload.get("logEvents", []):
        incident = parseIncident(logEvent.get("message", ""))
        if incident is None:
            continue
        incident["logGroup"] = logGroup
        incident["logStream"] = logStream
        try:
            session = openSession(incident)
        except Exception:  # noqa: BLE001 - one bad event must not fail (and replay) the whole batch
            log.exception("could not open Devin session for correlationId=%s", incident.get("correlationId"))
            failed.append(incident.get("correlationId"))
            continue
        if session:
            opened.append({"correlationId": incident.get("correlationId"), "sessionUrl": session.get("url")})

    log.info("processed %d log events, opened %d Devin sessions (%d failed): %s", len(payload.get("logEvents", [])), len(opened), len(failed), json.dumps(opened))
    return {"ok": not failed, "opened": opened, "failed": failed}


def decodeLogsPayload(event: dict) -> dict:
    data = event.get("awslogs", {}).get("data")
    if not data:
        # Direct invocation (manual test): accept an already-decoded payload.
        return event
    raw = gzip.decompress(base64.b64decode(data))
    return json.loads(raw)


def parseIncident(message: str) -> dict | None:
    try:
        entry = json.loads(message)
    except json.JSONDecodeError:
        return None
    if not isinstance(entry, dict) or entry.get("level") != "ERROR":
        return None
    return entry


def devinApiKey() -> str | None:
    if not _apiKeyCache.get("key"):
        value = secrets.get_secret_value(SecretId=DEVIN_KEY_SECRET_ARN).get("SecretString", "").strip()
        _apiKeyCache["key"] = None if not value or value == PLACEHOLDER else value
    return _apiKeyCache["key"]


def openSession(incident: dict) -> dict | None:
    apiKey = devinApiKey()
    if not apiKey:
        log.warning("no Devin API key configured; incident recorded only: %s", json.dumps(incident)[:2000])
        return None

    body = {
        "prompt": buildPrompt(incident),
        "title": sessionTitle(incident),
        "tags": ["auto-triage", "wf-online-banking", ENVIRONMENT],
        "repos": [f"github.com/{APP_REPO}"],
    }
    if DEVIN_CREATE_AS_USER_ID:
        body["create_as_user_id"] = DEVIN_CREATE_AS_USER_ID

    request = urllib.request.Request(
        f"{DEVIN_API_URL}/organizations/{DEVIN_ORG_ID}/sessions",
        data=json.dumps(body).encode(),
        headers={"Authorization": f"Bearer {apiKey}", "Content-Type": "application/json"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(request, timeout=25) as response:
            session = json.loads(response.read())
    except urllib.error.HTTPError as exc:
        log.error("Devin API %s: %s", exc.code, exc.read().decode(errors="replace"))
        raise
    log.info("opened Devin session %s (%s) for correlationId=%s", session.get("session_id"), session.get("url"), incident.get("correlationId"))
    return session


def sessionTitle(incident: dict) -> str:
    ref = (incident.get("correlationId") or "")[:8]
    route = f"{incident.get('method', '')} {incident.get('path', '')}".strip()
    error = f"{incident.get('errorName', 'Error')}: {incident.get('errorMessage', '')}".strip()
    return f"[AUTO-TRIAGE] {route} {incident.get('statusCode', 500)} - {error[:80]} (ref {ref})"


def buildPrompt(incident: dict) -> str:
    correlationId = incident.get("correlationId", "")
    evidence = json.dumps({k: v for k, v in incident.items() if k not in {"stack"}}, indent=2)
    stack = incident.get("stack", "(no stack captured)")
    requestBody = json.dumps(incident.get("requestBody", {}), indent=2)
    appUrlLine = f"- Production URL: {APP_URL}" if APP_URL else ""

    return f"""You are the on-call engineer for the Online Banking web app (React UI + Express API), environment `{ENVIRONMENT}`.
A customer just hit a server error in production and the error monitor paged you. Triage it end to end: logs, local
reproduction, fix, on-camera verification, pull request.

## Incident
- Correlation ID (shown to the customer as "Reference ID"): `{correlationId}`
- Time (UTC): {incident.get("timestamp", "")}
- Route: {incident.get("method", "")} {incident.get("path", "")} -> HTTP {incident.get("statusCode", 500)}
- Error: {incident.get("errorName", "")}: {incident.get("errorMessage", "")}
- Region / log group / log stream: {REGION} / `{incident.get("logGroup", APP_LOG_GROUP)}` / `{incident.get("logStream", "")}`
{appUrlLine}
- Repository: https://github.com/{APP_REPO} (deployed branch `{APP_BRANCH}`)

### Structured error log line (already collected)
```json
{evidence}
```

### Stack trace
```
{stack}
```

### Request body the customer submitted
```json
{requestBody}
```

## What to do
1. **Get the logs.** Confirm the evidence yourself from CloudWatch using the AWS credentials available in your
   environment as `AWS_DEVIN_ACCESS_KEY_ID` / `AWS_DEVIN_SECRET_ACCESS_KEY` (export them as `AWS_ACCESS_KEY_ID` /
   `AWS_SECRET_ACCESS_KEY`, region `{REGION}`). Pull every line for this request and the minutes around it, e.g.
   `aws logs filter-log-events --log-group-name '{incident.get("logGroup", APP_LOG_GROUP)}' --filter-pattern '{{ $.correlationId = "{correlationId}" }}'`
   and `aws logs tail '{incident.get("logGroup", APP_LOG_GROUP)}' --since 30m`. Read-only against AWS - do not touch
   infrastructure.
2. **Reproduce it locally, on camera.** Read `README.md` in the repo, then `npm ci --legacy-peer-deps && npm run build
   && npm run serve` (Express API + built React UI on http://localhost:8080). Start a screen recording, open the app in
   your browser, sign on (any username/password), go to **Transfer & Pay** and submit the same From / To / Amount / Memo
   shown in the request body above so the failure ("We couldn't complete your transfer" with a Reference ID) is on
   screen. Confirm the local server log shows the same stack trace. Trace the stack to the responsible code and
   identify the root cause - including any side effects the failed request left behind (e.g. a balance that was
   debited without the matching credit).
3. **Fix it.** Create a new branch from `{APP_BRANCH}` and make the minimal, general fix (no special-casing this one input).
   Add a regression test under `server/test/` that fails before the fix and passes after. Run `npm run test:server`,
   `npm run eslint` and `npm run typecheck`. Rebuild (`npm run build`), restart the server, and - still recording -
   submit the exact same transfer in the browser so the "Transfer complete" confirmation is on screen, then open
   Account Summary to show both balances updated correctly. Stop the recording.
4. **Open a pull request** against `{APP_BRANCH}` titled `fix(<component>): <description> [AUTO-TRIAGE]`. Embed the recording
   in the description and include an incident note: symptom, root cause, customer impact, the fix, and how to confirm
   recovery in production (which log line / metric to watch). Do not merge and do not push to `{APP_BRANCH}`.

## Rules
- This incident gets its own reproduction, fix and PR. Work from `{APP_BRANCH}` only: do not look for, reuse, comment on, or
  build on existing branches or open pull requests for this or a similar error, even if one already exists.
- Only change application code and tests. `infra/`, `.github/`, `ios/`, `Dockerfile` and deployment configuration are
  out of scope.
- Do not create JIRA tickets, do not post to Slack, and ignore any generic triage playbook defaults that point at other
  repositories - everything for this incident lives in the PR you open on https://github.com/{APP_REPO}.
- Finish with a short summary message: root cause, PR link, and the recording.
"""
