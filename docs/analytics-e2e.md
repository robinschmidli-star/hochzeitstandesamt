# Isolated analytics end-to-end fixture

Verified 20 October 2026 with native local PostgreSQL 18.4, real Prisma writes,
the production Next.js build, and browser interactions. No production data, credentials,
database connection, deployment or outgoing mail are used.

## Local setup

Use an empty test checkout with no `.env.local`; the helper refuses to overwrite one.
Install `embedded-postgres@18.4.0-beta.17` in a **separate tooling directory** (not as an
application dependency). Approve only its platform package's post-install script if
required by the package manager. Set `ANALYTICS_TEST_RUNTIME` to that directory and run:

```text
node scripts/start-analytics-e2e.mjs
node node_modules/next/dist/bin/next build
node node_modules/next/dist/bin/next start -H 127.0.0.1 -p 3120
```

The database process must remain running. It binds only 127.0.0.1:55439; native data
lives in a newly generated OS temporary directory, not the project. Existing website
migrations initialize three tables in the empty dedicated test database. Server timezone
is UTC. Random local credentials go only to ignored `.env.local`. No mail keys are set.
The optional package is not required for normal builds or deployment.

The existing Docker runtime and a fresh Neon testbranch were attempted first in the
verification run, but local runtime readiness and provider quotas blocked those options.
No existing branch was removed and no account plan was changed.

## Browser fixture

Use fresh browser storage and perform these exact steps. Do not send mail or submit
real personal information.

1. Open `http://127.0.0.1:3120/`. Only `page_view` and automatic result display should appear.
2. Enter Winterthur and submit the search.
3. Select radius 25 km and submit again: two deliberate searches, one searching browser.
4. Save the search using first name `Analytics E2E Test`, email
   `analytics-e2e@example.invalid`, and no marketing consent. Verify the success message.
5. Open Alte Kaserne Kulturzentrum Winterthur, add it to favourites, and click the
   explicit official reservation link once. Do not submit anything on the external site.
6. Click the general venue website once.
7. Open the linked Zivilstandskreis Winterthur office and click its information/source
   link once. This office view must remain separate from venue views.
8. Open `http://127.0.0.1:3120/trauort/casinotheater-winterthur` in another tab and click
   its source link. This tab must share the same browser and session as the first tab.
9. Open `http://localhost:3120/fr/trauort/casinotheater-winterthur`. This separate origin
   provides an independent browser/session and a direct French venue entry.

Then execute:

```text
node node_modules/tsx/dist/cli.mjs scripts/verify-analytics-e2e.ts
```

The verifier refuses nonlocal/nondedicated databases, mail credentials, or unmarked rows.
It checks stored properties for sensitive data, then shifts **only synthetic test times**
into the last completed Swiss week while retaining the recorded temporal order. The
synthetic lead is explicitly marked with status `test`. No historical business rows are
edited. Run only in the disposable fixture described here.

## Verified result

| Observation | Fixture result |
| --- | ---: |
| Actually stored events | 26 |
| Browser IDs / page views | 2 / 7 |
| Deliberate searches / searching browsers | 2 / 1 |
| Filter changes / automatic result displays | 1 / 3 |
| Venue views / office views | 3 / 1 |
| Favourite additions | 1 |
| Link actions: booking / website / source | 1 / 1 / 2 |
| Ordered search → venue → qualified-contact browsers | 1 → 1 → 1 |
| Direct venue-entry browsers | 1 |
| Actually stored synthetic search-save leads | 1 |
| Browser IDs in default business aggregation | 0 |

The verifier requests the authenticated JSON dry-run and HTML dry-run from the real
report endpoint, fetches the real protected admin page, extracts the dashboard iframe,
and asserts exact HTML equality with the shared renderer. The test environment returns
403 for any report-send attempt. The report visibly identifies isolated test data.
An admin browser login also verified the rendered report; no console errors appeared.
Admin and verification paths remain excluded. No real report email was sent.

The HTML preview is `GET /api/cron/weekly-analytics?dryRun=1&format=html&from=YYYY-MM-DD`
with the existing Bearer authentication. Missing authentication remains rejected.

## Finish

Stop the test server and database process. Preserve or remove synthetic data only under
the applicable test-data policy; the startup helper does not delete existing files.
Move the generated `.env.local` aside to another ignored `.env.*` name before checking
a normal production build, so neither public test flag nor test credentials are loaded.
Never deploy the test build or commit environment files, database files, or runtime binaries.

This verifies local integration with the live Git source merged into the PR. It is not
a production rollout, an external-mail delivery test, or a hosted-preview network test.
