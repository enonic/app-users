# Requests — the new world

## Client side

A section's data plane is its own extension prefix: `host.baseUrl` + `/graphql`, served by this
app's `/extensions/section-endpoint`. The transport is the `shared/api` module copied from the host
(app-settings) — `ResultAsync<T, AppError>`, errors as values, one request at a time — with its
endpoint set once at mount from `host.baseUrl`. Do not add a second http helper, and do not call
`fetch` outside `shared/api`.

- An `api/` segment is the only place that talks to the server: `entities/principal/api/*.api.ts`,
  one file per subdomain (users, groups, roles, id-providers).
- Wire DTOs stay inside the api segment; map to domain types before returning.
- Pass an `AbortSignal` for anything a user can retrigger and cancel the previous request.
- Surface load failures as store state (`status: 'loading' | 'ready' | 'error'`); a command's
  failure goes to a notification through `host.notify`. Never both for one failure.
- Server events arrive over the admin events hub: `shared/admin-events` imports the platform's
  client from the `eventsUrl` the section's own `config` root field delivers, and subscribes by the
  canonical names in `HUB_TOPICS` (`shared/sections/contract.ts`). The contract carries no event
  member — `app/useSectionEvents.ts` owns the subscription's lifecycle.

## Server side

The extension endpoint (`/extensions/section-endpoint`, arrives with the skeleton) serves
`GET /_static/*` as text and hands `POST /graphql` to lib-graphql. XP's four platform gates
(tool `allow`, extension `allow`, interface check, mount check) have already run before a handler
does — the schema does no role check of its own, but it also must never widen what those gates
decided.

- The schema is built once per module require; every root nullable; `config` and `phrases(locale)`
  are schema root fields — the guest bootstraps from them.
- Queries are built on the server: no variable ever carries a raw query or sort expression; escape
  every interpolated value.
- Never log or echo secrets: passwords, keys, tokens.
- ID-provider writes (`modifyIdProvider`, `deleteIdProviders`, ACL, mode) have no `lib-auth`
  equivalent — they go through `/lib/auth`, which binds the java beans under
  `src/main/java/.../lib/auth/`.
