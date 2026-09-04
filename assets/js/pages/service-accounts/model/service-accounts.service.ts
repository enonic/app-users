import {
  createPrincipalReaction,
  evictServiceAccountDetail,
  forgetServiceAccountDetails,
  loadServiceAccount,
  removeServiceAccount,
} from '../../../entities/principal';
import type { TopicReaction } from '../../../shared/admin-events';
import type { HostFrame } from '../../../shared/host';
import { serviceAccountsSelection } from './selection.store';
import { refreshServiceAccountsScreen } from './service-accounts.screen';

let running: TopicReaction | undefined;

/**
 * User events reach the rows: the section lists users, only the system store's — an event about another
 * provider's user falls through the by-key patches as a no-op. A provider change re-reads the screen:
 * the names ride the same document, and the details panel labels group provenance with them. A group or
 * role change re-reads the open panel: memberships live on the group or role node, not on the user.
 */
export function startServiceAccountsEvents(frame: HostFrame): void {
  if (running !== undefined) {
    return;
  }

  const refresh = (): void => void refreshServiceAccountsScreen();

  running = createPrincipalReaction({
    kind: 'user',
    scope: {
      $visible: frame.$visible,
      activeKey: () => frame.$itemId.get(),
      closeItem: frame.closeItem,
      notify: (message) => frame.notify('info', message),
      selection: serviceAccountsSelection,
    },
    loadRow: loadServiceAccount,
    removeRow: removeServiceAccount,
    evictDetail: evictServiceAccountDetail,
    refresh,
    onCreated: 'refresh',
    foreign: (events) => {
      if (events.some(({ kind }) => kind === 'idProvider')) {
        return true;
      }
      if (events.length > 0) {
        forgetServiceAccountDetails();
      }
      return false;
    },
  });

  running.start();
}

export function stopServiceAccountsEvents(): void {
  running?.stop();
  running = undefined;
}
