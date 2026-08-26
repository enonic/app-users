---
paths:
  - '**/*.tsx'
---

# Preact

The app runs on Preact 10. `react`, `react-dom` and `react-dom/client` are aliased to
`preact/compat` in both `vite.config.ts` and `tsconfig.json`, because `@enonic/ui` is written against
the React types.

## Where imports come from

```ts
import { useCallback, useEffect, useState } from 'preact/hooks'; // hooks and runtime
import { h, render } from 'preact'; // bootstrap only, in main.ts
import type { JSX } from 'preact'; // JSX.Element as a return type
import type { ReactNode } from 'react'; // prop types that reach @enonic/ui slots
```

Runtime code imports from `preact`, not from `react` — nothing here needs the compat runtime
directly. Prop types are the exception: a slot that ends up inside an `@enonic/ui` component must be
typed `ReactNode`, which resolves through the alias to `preact.ComponentChild`. Do not type such a
slot `ComponentChildren`; the two are not interchangeable in the library's props.

## Components

Hook order inside a component reads as what it does: **what it starts, what it reads, what it says, what
it derives.**

1. the section's screen hook — `useUsersScreen()`, which starts the load and returns nothing
2. refs, route and store reads — `useRef`, `useParams`, `useStore`, `use<Domain>()`
3. labels — `useI18n`, `useLabelled`
4. state and memos
5. effects
6. computed class names, then early returns, then JSX

```tsx
export function UsersPage() {
  useUsersScreen();
  const { status, items } = useUsers();

  const emptyLabel = useI18n('users.list.empty');

  const visible = useMemo(() => searchUsers(items, query), [items, query]);

  if (status === 'error') return <BrowseListMessage tone="error" />;
}
```

Labels come before the memos because a memo is built from them — a page's filter entries are labels — and
every hook comes before the early returns, since a hook cannot be called conditionally. A screen hook goes
first even though it is an effect: it is why the component has anything to read.

- Early return instead of `<>{ready && …}</>`.
- Minimize `useEffect`: derive from stores and props first; an effect is for subscriptions and
  imperative DOM work. `useServerEvent` already wraps the subscribe/unsubscribe pattern.
- `useCallback` / `useMemo` only where a dependency actually needs stability, as `useIdProviderName`
  does — a fresh closure per render would kill the memo a page builds its filter entries with.

## Known type friction

- `@enonic/ui` composes Radix Slot, whose ref type does not match Preact's `ForwardedRef`. It works
  at runtime; annotate with `@ts-expect-error` and a one-line reason. Never `as any`.
- TanStack Router probes React 19's `use` hook, which preact/compat lacks; the resulting bundler
  warning is silenced in `vite.config.ts` and is not a real problem.
