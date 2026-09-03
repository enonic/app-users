import {
  createPrincipalReaction,
  evictGroupDetail,
  forgetGroupDetails,
  loadGroup,
  removeGroup,
} from '../../../entities/principal';
import type { TopicReaction } from '../../../shared/admin-events';
import type { HostFrame } from '../../../shared/host';
import { loadGroupsScreen } from './groups.screen';
import { groupsSelection } from './selection.store';

let running: TopicReaction | undefined;

/**
 * A provider change re-reads the screen: its names ride the same document. A user or role change re-reads
 * the open panel, whose members and memberships the rows do not show.
 */
export function startGroupsEvents(frame: HostFrame): void {
  if (running !== undefined) {
    return;
  }

  const refresh = (): void => void loadGroupsScreen();

  running = createPrincipalReaction({
    kind: 'group',
    scope: {
      $visible: frame.$visible,
      activeKey: () => frame.$itemId.get(),
      closeItem: frame.closeItem,
      notify: (message) => frame.notify('info', message),
      selection: groupsSelection,
    },
    loadRow: loadGroup,
    removeRow: removeGroup,
    evictDetail: evictGroupDetail,
    refresh,
    onCreated: 'load',
    foreign: (events) => {
      if (events.some(({ kind }) => kind === 'idProvider')) {
        return true;
      }
      if (events.length > 0) {
        forgetGroupDetails();
      }
      return false;
    },
  });

  running.start();
}

export function stopGroupsEvents(): void {
  running?.stop();
  running = undefined;
}
