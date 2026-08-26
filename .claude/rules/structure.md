# Structure

These rules govern `assets/**`, `test/**` and `src/main/resources/{extensions,admin/extensions}/**`.
The XP java
layer (`src/main/java`, `src/main/resources/lib/*.js`) predates them and keeps its own style.

## Client — `assets/js`

Feature-Sliced Design, the same layout as app-settings and app-applications, one import direction:

```
app  →  pages  →  widgets / features  →  entities  →  shared
```

- `app/` — the module entry's glue: `mount`, bootstrap, section switch. This app ships **four
  sections from one module**: `app/section.ts` picks the section off `host.baseUrl`; nothing below
  `app/` may switch on a section id.
- `pages/<section>/` — composition only: users, groups, roles, id-providers.
- `entities/principal/` — one domain slice (users, groups, roles and ID providers share
  `PrincipalKey` and each other's member lists), segments `api/`, `model/`, rarely `ui/`.
- `shared/` — transport, config, i18n, sections contract, styles. `shared/sections/contract.ts` is
  **byte-identical with the host's** (`../app-settings/src/main/resources/assets/js/shared/sections/contract.ts`)
  until `@enonic/toolkit` publishes it — change every copy or none.
- File names, barrels, component and store conventions: as in the other rule files here.

The browse framework arrives from `@enonic/toolkit` when it is published — do not copy widgets from
app-settings into this repo.

## Server — `src/main/resources`

- New server TS lives under `extensions/` (shared modules: endpoint, i18n, schema) and
  `admin/extensions/<section>/` (descriptor `.yaml` + `.svg` + a controller re-exporting the shared
  endpoint). It is required absolutely as `/extensions/<name>`.
- **Keep new server code out of `lib/`**: that tree is the plain-`.js` binding to the java beans,
  and `vp pack` emits `.js` into the same jar paths.
- Each descriptor carries its own `allow` — that per-section gate is the point of the architecture
  (app-settings#42, D3/D5).

## Toolchain boundaries

- One pnpm project, at the repository root.
- `pnpmBuild` and `pnpmPack` emit into `build/resources/main` (`assets/_static` and `extensions/`),
  which the java tasks also read — see the build seams in `CLAUDE.md` before adding a task there.
