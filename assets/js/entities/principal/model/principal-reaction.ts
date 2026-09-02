import type { ReadableAtom } from 'nanostores';

import {
  createTopicReaction,
  toPrincipalsMessage,
  type PrincipalKind,
  type TopicReaction,
} from '../../../shared/admin-events';
import { i18n } from '../../../shared/i18n';
import { HUB_TOPICS } from '../../../shared/sections';
import type { SelectionStore } from '../../../shared/selection';
import { collapsePrincipalChanges, type PrincipalEvent } from './principal-changes';
import { principalName } from './principal.keys';

const TEXT = {
  deletedElsewhere: 'principal.notify.deletedElsewhere',
} as const;

// Past this many rows a window is an import, and one re-read beats that many requests through a serial transport.
const BATCH_LIMIT = 10;

/** What the section lends the reaction: its panel, its ticks, and its mount's voice. */
export type PrincipalReactionScope = {
  $visible: ReadableAtom<boolean>;
  activeKey: () => string | undefined;
  closeItem: () => void;
  /** Already localized. */
  notify: (message: string) => void;
  selection: SelectionStore;
};

export type PrincipalReactionOptions = {
  /** The kind this section lists; the other kinds reach `foreign`. */
  kind: PrincipalKind;
  scope: PrincipalReactionScope;
  loadRow: (key: string) => Promise<void>;
  removeRow: (key: string) => void;
  evictDetail: (key: string) => void;
  /** Re-reads the screen in place, at the depth it is loaded. */
  refresh: () => void;
  /** A list loaded whole takes a new row; a paged one re-reads, since where the row belongs is the server's call. */
  onCreated: 'load' | 'refresh';
  /** Events of the other kinds; `true` asks for a whole re-read. */
  foreign: (events: readonly PrincipalEvent[]) => boolean;
};

/**
 * A section's subscription to the `principals` topic: own rows patched by key, a batch too large to patch
 * re-read whole. Deletions come first and cost no request; a panel showing a deleted item closes with a word.
 */
export function createPrincipalReaction({
  kind,
  scope,
  loadRow,
  removeRow,
  evictDetail,
  refresh,
  onCreated,
  foreign,
}: PrincipalReactionOptions): TopicReaction {
  function remove(key: string): void {
    const open = scope.activeKey() === key;

    removeRow(key);
    scope.selection.toggle(key, false);
    evictDetail(key);

    if (open) {
      scope.closeItem();
      scope.notify(i18n(TEXT.deletedElsewhere, principalName(key)));
    }
  }

  return createTopicReaction({
    topic: HUB_TOPICS.principals,
    parse: toPrincipalsMessage,
    $visible: scope.$visible,
    refresh,
    apply: (messages) => {
      const events = collapsePrincipalChanges(messages);
      const own = events.filter((event) => event.kind === kind);
      const others = events.filter((event) => event.kind !== kind);

      const deleted = own.filter((event) => event.operation === 'deleted');
      const alive = own.filter((event) => event.operation !== 'deleted');

      const wholesale =
        foreign(others) ||
        alive.length > BATCH_LIMIT ||
        (onCreated === 'refresh' && alive.some((event) => event.operation === 'created'));

      deleted.forEach(({ key }) => remove(key));

      if (wholesale) {
        refresh();
        return;
      }

      alive.forEach(({ key }) => {
        void loadRow(key).then(() => evictDetail(key));
      });
    },
  });
}
