---
paths:
  - '**/*.{ts,tsx}'
---

# Comments

Comment only what the code cannot say: a workaround, a platform constraint, a non-obvious ordering.
Never narrate what the next line does, and never restate a name. `vite.config.ts` is the reference
for the right density — every comment there explains a decision that would otherwise look wrong.

## Prefixes

Adopted from Content Studio; all four are in use here.

- `// ! ` — a real hazard: race, security implication, breaking behaviour
- `// ? ` — an open question or the rationale for an unusual pattern
- `// * ` — section header in a long file, framed by `// *` lines, as in `vite.config.ts`
- `// TODO: ` — actionable work, imperative, with an issue number when one exists

```ts
//
// * Helpers
//

// ! Deleting the last system role locks every admin out — guard before calling.
// ? Sorted client-side because findPrincipals has no server-side sort.
// TODO: [#8] Swap the fixture for the real transport.
```

Never combine prefixes. Update or delete a comment when the code it describes changes; a stale
comment is worse than none.

## Doc comments

TSDoc where the contract is not obvious from the signature, and on a module constant whose value
needs justifying. Not on internal helpers whose name already says it, and never `@param` / `@returns` restating types.
