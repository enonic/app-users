import type { ReadableAtom } from 'nanostores';

import { subscribeTopic } from './admin-events';

export type TopicReactionOptions<M> = {
  topic: string;
  parse: (data: unknown) => M | undefined;
  /** While hidden, messages are dropped and one `refresh` runs on reveal. */
  $visible: ReadableAtom<boolean>;
  apply: (messages: readonly M[]) => void;
  /** Re-reads the screen whole: after a loss, and on the reveal that ends a hidden spell. */
  refresh: () => void;
};

export type TopicReaction = {
  start: () => void;
  stop: () => void;
};

// ! Core emits one event per node, so an import is a burst of one-change messages; the window makes it one
// ! batch, which is what lets `apply` tell an edit from an import.
const WINDOW_MS = 300;

/** A section's subscription to one hub topic: parsing, the gathering window, loss and the hidden spell. */
export function createTopicReaction<M>({
  topic,
  parse,
  $visible,
  apply,
  refresh,
}: TopicReactionOptions<M>): TopicReaction {
  let gathered: M[] = [];
  let scheduled: ReturnType<typeof setTimeout> | undefined;
  let stale = false;
  let unsubscribe: (() => void) | undefined;
  let unwatch: (() => void) | undefined;

  function flush(): void {
    scheduled = undefined;
    const batch = gathered;
    gathered = [];

    if (batch.length > 0) {
      apply(batch);
    }
  }

  function refreshOrMark(): void {
    if ($visible.get()) {
      refresh();
    } else {
      stale = true;
    }
  }

  function onMessage(data: unknown): void {
    if (!$visible.get()) {
      stale = true;
      return;
    }

    const message = parse(data);
    if (message === undefined) {
      return;
    }

    gathered.push(message);
    scheduled ??= setTimeout(flush, WINDOW_MS);
  }

  function reset(): void {
    if (scheduled !== undefined) {
      clearTimeout(scheduled);
      scheduled = undefined;
    }
    gathered = [];
    stale = false;
  }

  return {
    start(): void {
      if (unsubscribe !== undefined) {
        return;
      }

      unsubscribe = subscribeTopic(topic, { onMessage, onLoss: refreshOrMark });

      // ! `listen`, not `subscribe`: firing on subscribe would refresh a screen that has just loaded.
      unwatch = $visible.listen((visible) => {
        if (!visible) {
          // The refresh on reveal covers what the window holds; applying it later would race that refresh.
          const unapplied = gathered.length > 0;
          reset();
          stale = unapplied;
          return;
        }

        if (stale) {
          stale = false;
          refresh();
        }
      });
    },

    stop(): void {
      unsubscribe?.();
      unsubscribe = undefined;
      unwatch?.();
      unwatch = undefined;
      reset();
    },
  };
}
