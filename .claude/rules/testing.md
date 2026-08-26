---
paths:
  - '**/*.test.{ts,tsx}'
  - 'test/**'
---

# Testing

Vitest through `vp test`, config in the `test` block of `vite.config.ts`. Tests
sit next to their subject as `<file>.test.ts`. Both sides of the new world are covered by the same
run: client code under `assets/js`, server modules under `src/main/resources/extensions`. The
java layer is covered instead by JUnit through `ScriptTestSupport`, under `src/test/`.

**The environment is `node`, and no DOM library is installed — by decision, not by omission.**
Component rendering is not tested. Keep the testable part of a widget in a pure helper next to it (as
`shared/i18n/i18n.store.ts` keeps `localize`): row mapping, action `enabled` predicates, overflow and
sort computations all belong outside the component, where they can be asserted directly. Adding
`happy-dom` and a Preact testing library would be its own issue, never a line in a feature PR.

## Shape

Arrange-act-assert, `describe` per unit, `it` naming the observable behaviour in present tense —
`it('resolves 204 to undefined without parsing')`, not `it('should resolve …')`.

```ts
import { describe, expect, it, vi } from 'vitest';

describe('requestJson', () => {
  it('fails with the server-supplied message on an error status', async () => {
    globalThis.fetch = vi
      .fn()
      .mockResolvedValue(new Response('{"message":"nope"}', { status: 500 }));

    const result = await requestJson('/api');

    expect(result.isErr()).toBe(true);
  });
});
```

## Mocking

- `vi` from vitest, and `vi.restoreAllMocks()` in `afterEach` whenever a global was replaced.
- XP libs resolve to the doubles in `test/mocks/` through the `test.alias` block in
  `vite.config.ts`. A new XP lib needs its double added there before any server test can import it.
- `vi.useFakeTimers()` plus `await vi.runAllTimersAsync()` for debounced behaviour — the list refresh
  debounce is the case that will need it.

## Script beans

A `src/main/java` handler is not reachable from vitest: `__.newBean` is the XP bridge, so the double in
`test/mocks/` stands in for the whole wrapper and the Java behind it goes untested there. Cover it in
`src/test/java` instead, with JUnit 5 + Mockito through XP's `ScriptTestSupport`, which runs the bean on
the same GraalJS engine XP does:

- One `<Handler>Test.java` per handler, mirroring the main package, mocking the OSGi service it asks the
  `BeanContext` for.
- The assertions that matter live in `src/test/resources/<package>/<function>-test.js` — a golden
  `t.assertJsonEquals` against what the wrapper answers, which is the only place the serialized shape is
  pinned. Assert in Java on what reached the platform: the captured `*Params`, the types inside a
  `PropertyTree`, the entries an ACL kept.
- The fixtures `require` the wrapper by its runtime path, so `./gradlew test` depends on the pack
  task to emit it. `pnpm check` does not run them.

## What to cover

Pure logic: mappers into view models, `enabled(ctx)` of every toolbar action, store commands, api
response mapping, formatting helpers. Assert on values and on error results, not on the fact that a
mock was called.
