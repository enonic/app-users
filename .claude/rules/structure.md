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
- `shared/` — transport, config, i18n, sections contract, styles, and `host/`: the host object and
  the routing it owns. `shared/sections/contract.ts` is **byte-identical with the host's**
  (`../app-settings/src/main/resources/assets/js/shared/sections/contract.ts`) — change every copy or
  none.
- **A section reaches the shell through `shared/host`, never through a router or a socket of its
  own**: `host.path`/`host.navigate` are its whole history, and `host.notify` its toast stack.
- File names, barrels, component and store conventions: as in the other rule files here.

`widgets/` holds the browse framework, copied from app-settings with the sections (#2640) rather than
waited for; app-settings has since deleted its copy, so this one and app-applications' are the
canonical pair `@enonic/ui-kit` (`../npm-enonic-ui-toolkit`) extracts from. They are kept
byte-identical where the code is the same — `cmp` against `../app-applications` is the drift check —
and a widget takes what it needs as props (`activeKey`, `detailsShown`) rather than reaching into
`shared/host`, which is what keeps it portable.

## Server — `src/main/resources`

- New server TS lives under `extensions/` (shared modules: endpoint, i18n, schema, report) and
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
