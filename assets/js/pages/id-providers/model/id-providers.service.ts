import {
  createPrincipalReaction,
  evictIdProviderPermissions,
  idProviderOf,
  loadIdProvider,
  loadIdProviders,
  reloadIdProviderPermissions,
  reloadIdProviderPrincipalRows,
  removeIdProvider,
} from '../../../entities/principal';
import type { TopicReaction } from '../../../shared/admin-events';
import type { HostFrame } from '../../../shared/host';
import { idProvidersSelection } from './selection.store';

let running: TopicReaction | undefined;

// A user or group change moves its provider's counts, so that row is re-read; the open panel's principals too.
// A provider change re-reads its row, and the panel's permissions with it.
export function startIdProvidersEvents(frame: HostFrame): void {
  if (running !== undefined) {
    return;
  }

  const refresh = (): void => {
    reloadIdProviderPermissions();
    reloadIdProviderPrincipalRows();
    void loadIdProviders();
  };

  running = createPrincipalReaction({
    kind: 'idProvider',
    scope: {
      $visible: frame.$visible,
      activeKey: () => frame.$itemId.get(),
      closeItem: frame.closeItem,
      notify: (message) => frame.notify('info', message),
      selection: idProvidersSelection,
    },
    loadRow: loadIdProvider,
    removeRow: removeIdProvider,
    evictDetail: evictIdProviderPermissions,
    refresh,
    onCreated: 'load',
    foreign: (events) => {
      const providers = new Set(
        events
          .filter(({ kind }) => kind === 'user' || kind === 'group')
          .map(({ key }) => idProviderOf(key))
          .filter((provider) => provider !== undefined),
      );

      providers.forEach((provider) => void loadIdProvider(provider));

      const open = frame.$itemId.get();
      if (open !== undefined && providers.has(open)) {
        reloadIdProviderPrincipalRows();
      }

      return false;
    },
  });

  running.start();
}

export function stopIdProvidersEvents(): void {
  running?.stop();
  running = undefined;
}
