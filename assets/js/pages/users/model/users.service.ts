import {
  createPrincipalReaction,
  evictUserDetail,
  forgetUserDetails,
  loadUser,
  removeUser,
} from '../../../entities/principal';
import type { TopicReaction } from '../../../shared/admin-events';
import type { HostFrame } from '../../../shared/host';
import { usersSelection } from './selection.store';
import { refreshUsersScreen } from './users.screen';

let running: TopicReaction | undefined;

/**
 * A provider change re-reads the screen: its names and counts ride the same document. A group or role
 * change re-reads the open panel: memberships live on the group or role node, not on the user.
 */
export function startUsersEvents(frame: HostFrame): void {
  if (running !== undefined) {
    return;
  }

  const refresh = (): void => void refreshUsersScreen();

  running = createPrincipalReaction({
    kind: 'user',
    scope: {
      $visible: frame.$visible,
      activeKey: () => frame.$itemId.get(),
      closeItem: frame.closeItem,
      notify: (message) => frame.notify('info', message),
      selection: usersSelection,
    },
    loadRow: loadUser,
    removeRow: removeUser,
    evictDetail: evictUserDetail,
    refresh,
    onCreated: 'refresh',
    foreign: (events) => {
      if (events.some(({ kind }) => kind === 'idProvider')) {
        return true;
      }
      if (events.length > 0) {
        forgetUserDetails();
      }
      return false;
    },
  });

  running.start();
}

export function stopUsersEvents(): void {
  running?.stop();
  running = undefined;
}
