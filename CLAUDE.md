# App Users

Enonic XP admin application: Users, Groups, Roles and ID Providers. The four sections return to this
app as `settings.section` admin extensions for the Settings shell (enonic/app-settings#106; the plan
is [#2628](https://github.com/enonic/app-users/issues/2628)).

The `extensions` branch carries **only** the new world — the lib-admin-ui tool, its GraphQL API, its
Selenium suite and the second toolchain were removed in #2637. `master` remains the legacy
maintenance line and receives none of this work.

- **Client** — `assets/js` (Preact, Tailwind v4, nanostores); one pnpm project at the repository
  root, built by vite-plus (`vp`) configured inline in `vite.config.ts`.
- **Server TS** — `src/main/resources/extensions/` (shared modules: endpoint, i18n, schema) and
  `admin/extensions/<section>/` (descriptor `.yaml` + `.svg` + controller).
- **Java** — `src/main/java/.../lib/auth/` and `handler/`, reached from `src/main/resources/lib/*.js`
  through `__.newBean`. XP's own `lib-auth` has no `modifyIdProvider`, `deleteIdProviders`,
  ID-provider ACL or `getIdProviderMode`, so the branch would have none of them without this. It is
  the **older twin** of app-settings' `lib/idprovider/**`, which #2639 moves back here — merging the
  two is part of that issue, not a thing to pre-empt. Its tests drive the JS through both Nashorn
  and GraalJS, and they are the branch's only server-side safety net until then.

## Scripts

| Intent                         | Command                         |
| ------------------------------ | ------------------------------- |
| Verify changes                 | `pnpm check`                    |
| Verify, fixing format and lint | `pnpm check:fix`                |
| Tests                          | `pnpm test` / `pnpm test:watch` |
| Frontend watch build           | `pnpm dev`                      |
| Server-side TS → CommonJS      | `pnpm pack:server`              |

`pnpm check` = `vp check` (format, type-aware lint, typecheck) + strict server `tsc`
(`src/main/resources/tsconfig.json`) + vitest (`node` environment, no DOM). Gradle runs it as
`:pnpmCheck`; `./gradlew build` produces the jar.

## Build seams

`pnpmBuild` and `pnpmPack` write into `build/resources/main`, which `processResources` also fills
and the java tasks then read. `jar` declares a real dependency on both; `compileTestJava` and the
`Test` tasks take `mustRunAfter`. Add a task that reads that tree and it needs the same edge —
without one Gradle fails whichever consumer happens to run after them, so the failure appears to
wander between tasks.

Sharing that directory also forces `vp pack` to run `clean: false`: delete a server `.ts` and its
`.js` stays behind in `build/` and still ships in the jar.

`vp` runs from the repository root, so `fmt` and `lint` see everything. What they must leave alone —
the plain-`.js` binding layer, its golden test fixtures, docs and CI — is listed once as
`ignorePatterns` in `vite.config.ts` and shared by both.

## Reference repositories

Sibling checkouts, read-only. `../app-settings` (branch `extensions`) is the **host**: the mount
contract is `shared/sections/contract.ts` there, and `docs/extensions/` — `docs.md`,
`host-facts.md`, `provider-facts.md`, `progress.md` — is authoritative on how a section is
discovered, mounted, routed and revoked. `../app-applications` (branch `issue-2295`) is the **first provider** and the
template this project copies. `../npm-enonic-ui` is the source of `@enonic/ui` — read a component
before composing it.

## Conventions

`.claude/rules/` holds them, scoped by file pattern: `structure.md`, `typescript.md`, `preact.md`,
`stores.md`, `requests.md`, `enonic-ui.md`, `testing.md`, `comments.md`. Every user-visible string
goes through the i18n mechanism; phrases live in `src/main/resources/i18n/phrases.properties`.

## Git & GitHub

No conventional commit prefixes. Commits with an issue: `<Issue Title> #<number>`. The `extensions`
branch is the integration line for this work. `AGENTS.md` is a copy of this file — edit both, keep
them identical.
