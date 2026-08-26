---
paths:
  - '**/*.{ts,tsx}'
---

# TypeScript

`strict: true`, target ES2023, native TypeScript 7. Formatting (2-space, single quotes, import and
Tailwind class order) is enforced by oxfmt — never hand-tune it, run `pnpm check:fix`.

## Style

```ts
// ✅ type over interface for object shapes
type User = { id: string; displayName: string };

// ✅ T[] over Array<T>; unknown over any; type guards over assertions
const parsed: unknown = JSON.parse(text);
if (isToolConfig(parsed)) {
}

// ✅ one check for both null and undefined
if (value != null) {
}

// ✅ early returns and guard clauses before the main path
if (!scriptId) {
  throw new AppError('No script carries a data-config-script-id attribute');
}

// ✅ satisfies where a literal must keep its narrow type
const options = { method: 'POST' } satisfies RequestOptions;

// ❌ nested ternaries — use if/else, switch or a lookup object
// ❌ non-null `!` to silence the checker
```

`as` belongs at the wire boundary only: casting a parsed JSON payload to its expected shape inside
the api transport, where the value has just crossed into the app and either a type guard follows or
the caller's generic defines the contract. Anywhere else, narrow with a guard instead.

## Naming

```ts
export const $phrases = atom<Phrases>({}); // stores: $ prefix
const CONFIG_SCRIPT_ID = 'settings-config-json'; // module constants: UPPER_SNAKE
const isAdmin = hasRole(ADMIN_ROLE); // standalone booleans: is/has/can/should
type ButtonProps = { disabled?: boolean }; // props drop the boolean prefix
type Props = { onSelect?: (key: string) => void }; // props: on*, internals: handle*
function getUserById(id: string): User | undefined {} // functions: verb first
const users: User[] = []; // arrays: plural
```

## Functions

- Exported functions declare their return type, including `void`.
- Components are the exception: their return type is inferred, as every component in the app does.
- Callbacks and one-liners passed inline do not declare one either.
- `export function` for anything a module exposes; arrow consts only for local helpers.

## Imports

- Named exports only, no default exports.
- No path alias in this project — relative imports, and cross-layer imports follow
  `.claude/rules/structure.md`.
- `import type` for type-only imports. It is the codebase convention, not a lint rule: oxlint's
  `consistent-type-imports` is not enabled here, so nothing but review will catch a violation.
- Server-side code imports XP libs absolutely (`/lib/xp/i18n`); under vitest those resolve to the
  doubles in `test/mocks/`. This app's own new-world server modules live under `/extensions/*`
  (`/extensions/i18n`) — the same absolute form, aliased straight to their real source in the
  `test.alias` block of `vite.config.ts`.
