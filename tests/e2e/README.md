# End-to-end tests

Playwright tests that run against a real Matomo 6 instance in Docker. Each test asserts behaviour
through the UI and/or the HTTP API, and the UI tests save screenshots to `screenshots/` so you can
review them.

Requirements: Docker with the compose plugin. Node.js is only needed for editing or typechecking
the specs; the tests themselves run in the `mcr.microsoft.com/playwright` image.

## Run the tests

```bash
tests/e2e/bin/run.sh                           # fresh Matomo, all specs
tests/e2e/bin/run.sh specs/invite-user.spec.ts # a single spec (extra args go to `playwright test`)
tests/e2e/bin/integration-test.sh              # only the login plugin integration specs (Matomo must be running)
KEEP_ENV=1 tests/e2e/bin/run.sh                # reuse the running instance (faster)
tests/e2e/bin/marketplace-screenshots.sh       # regenerate the Marketplace screenshots in the plugin's screenshots/
```

Results:

- `screenshots/`: screenshots for review and documentation
- `playwright-report/`: HTML report (`npx playwright show-report`)
- `test-results/`: failure screenshots and traces (`npx playwright show-trace <trace.zip>`)

## A Matomo instance for manual testing

```bash
tests/e2e/bin/start.sh          # start (or reuse) and add demo data
tests/e2e/bin/start.sh --fresh  # start from an empty database
tests/e2e/bin/teardown.sh       # stop and discard everything
```

| What | Where |
| --- | --- |
| Matomo | http://localhost:8089 — `superuser` / `superUserPass1!` |
| Demo users | `alice`, `bob`, `carol`, `dave` / `demoPass1!` |
| Demo groups | Marketing (alice, bob: view on Site One + Blog), Sales (bob, carol: write on Shop), Web Admins (dave: admin on all sites) |
| Mailpit (emails, e.g. invitations) | http://localhost:8025 |

The plugin is copied into the container on every `start.sh` / `setup.sh`, so run it again after
changing PHP, template, JS or `vue/dist` files. Ports can be changed with `MATOMO_PORT` and
`MAILPIT_PORT`, and the Matomo version with `MATOMO_VERSION` (a release of builds.matomo.org, e.g. `6.0.0-rc2`: there is no
official Docker image for Matomo 6 yet, `docker/Dockerfile` puts that release into the latest Matomo 5 image).
The database lives on tmpfs, so `teardown.sh` discards all data.

## Layout

| Path | Purpose |
| --- | --- |
| `docker-compose.yml` | MariaDB, Matomo (apache), Mailpit, Playwright runner |
| `docker/Dockerfile` | Matomo image for `MATOMO_VERSION` |
| `bin/setup.sh` | starts the containers, copies the plugin, installs Matomo, activates the plugin |
| `bin/lifecycle-test.sh` | deactivate / activate / uninstall / reinstall checks (run by `run.sh` after a full run) |
| `bin/integration-test.sh` | group sync with the login plugins LoginLdap, LoginOIDC, RebelOIDC and LoginSaml (run by `run.sh` after a full run, skip with `INTEGRATIONS=0`): starts OpenLDAP, a mock OpenID Connect provider and SimpleSAMLphp (profile `integrations`), installs the pinned plugin releases, runs `specs-integrations/` and removes the plugins again. LoginSaml is paid and cannot be downloaded: its specs only run with a licensed copy for Matomo 5 in `LOGINSAML_DIR` (default `tmp/5.5.11/LoginSaml`, git-ignored, never commit it) |
| `bin/marketplace-screenshots.sh`, `specs-screenshots/`, `playwright.screenshots.config.ts` | Marketplace screenshots (`screenshots/`, file name = caption) from the demo data of `start.sh` plus segments, reports, rules, capabilities and directory groups added by the spec |
| `saml/authsources.php` | users and group attributes of the SAML identity provider |
| `specs-integrations/`, `playwright.integrations.config.ts` | specs needing the login plugins |
| `global-setup.ts` | logs in the super user once and stores the session |
| `helpers/` | API client, UI helpers, Mailpit client |
| `specs/access.spec.ts` | group site access, combining user and group permissions, site/user deletion |
| `specs/api-security.spec.ts` | access checks of the API methods |
| `specs/copy-dashboard.spec.ts` | copying dashboards to groups (dialog and API) |
| `specs/groups-api.spec.ts` | creating, renaming and deleting groups, managing members |
| `specs/invite-user.spec.ts` | inviting users into groups (UI, API, invitation email) |
| `specs/manage-access.spec.ts` | Manage Access tab: site selection, all access levels, "Apply to all websites", errors, site admins |
| `specs/manage-groups.spec.ts` | Manage Groups tab: group selection/URL, create, rename, delete, members, confirmations, errors |
| `specs/segments.spec.ts` | sharing segments with groups: visibility for members, permissions, cleanup, group editor |
| `specs/scheduled-reports.spec.ts` | shared ownership of scheduled reports: members view/edit/send/delete, permissions, request cache, cleanup, UI |
| `specs/special-characters.spec.ts` | group names with HTML, quotes, `&`, unicode: stored as-is, rendered as text (no XSS) |
| `specs/tracking.spec.ts` | tracking requests with the token_auth of group members (write/admin through a group) |
| `specs/translations.spec.ts` | all used translation keys exist and are registered, placeholders match, German UI has no raw keys |
| `specs/overview.spec.ts` | menu entry, main group workflow, overview screenshots |
| `specs/page-access.spec.ts` | who can open the admin page and what they see |
