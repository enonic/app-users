import {
  createPrincipalReaction,
  evictRoleDetail,
  forgetRoleDetails,
  loadRole,
  removeRole,
} from '../../../entities/principal';
import type { TopicReaction } from '../../../shared/admin-events';
import type { HostFrame } from '../../../shared/host';
import { loadRolesScreen } from './roles.screen';
import { rolesSelection } from './selection.store';

let running: TopicReaction | undefined;

/**
 * A provider change re-reads the screen: its names ride the same document. A user or group change re-reads
 * the open panel, whose members the rows do not show.
 */
export function startRolesEvents(frame: HostFrame): void {
  if (running !== undefined) {
    return;
  }

  const refresh = (): void => void loadRolesScreen();

  running = createPrincipalReaction({
    kind: 'role',
    scope: {
      $visible: frame.$visible,
      activeKey: () => frame.$itemId.get(),
      closeItem: frame.closeItem,
      notify: frame.notifyInfo,
      selection: rolesSelection,
    },
    loadRow: loadRole,
    removeRow: removeRole,
    evictDetail: evictRoleDetail,
    refresh,
    onCreated: 'load',
    foreign: (events) => {
      if (events.some(({ kind }) => kind === 'idProvider')) {
        return true;
      }
      if (events.length > 0) {
        forgetRoleDetails();
      }
      return false;
    },
  });

  running.start();
}

export function stopRolesEvents(): void {
  running?.stop();
  running = undefined;
}
