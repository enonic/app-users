import { atom, type ReadableAtom } from 'nanostores';

import type { Host, Notification } from '../sections';

type Level = Notification['level'];

/**
 * The host object and everything this section derives from it, for one mount. `mount` can run more
 * than once per module instance — the host may serve every section of an app from one URL — so none
 * of this may live at module level: each mount builds its own frame, hands it down through
 * `HostFrameProvider`, and disposes it with the unmount.
 */
export type HostFrame = {
  host: Host;
  /**
   * The selected row, as the section's own sub-path carries it: `/` is the list with nothing open,
   * `/<key>` is that item.
   *
   * ? A section has exactly one nested route — the details of one principal — so the host's `path`
   * ? is the whole of its routing. app-settings expressed the same thing with a router because the
   * ? shell owns several sections at once; here `host.navigate` is the only history there is.
   */
  $itemId: ReadableAtom<string | undefined>;
  openItem: (key: string) => void;
  closeItem: () => void;
  notifyError: (message: string) => void;
  notifyWarning: (message: string) => void;
  notifySuccess: (message: string) => void;
  notifyInfo: (message: string) => void;
  /** Stops following the host's path. Runs with the unmount, after the components are gone. */
  dispose: () => void;
};

export function createHostFrame(host: Host): HostFrame {
  // ! Read before subscribing: `path` does not call back on subscribe (app-settings
  // ! `host-facts.md`), so a deep link would otherwise leave its row unopened until the first
  // ! navigation.
  const $itemId = atom<string | undefined>(itemIdOf(host.path.get()));
  const unfollow = host.path.subscribe((path) => $itemId.set(itemIdOf(path)));

  return {
    host,
    $itemId,
    openItem: (key) => host.navigate(`/${encodeURIComponent(key)}`, { replace: true }),
    closeItem: () => host.navigate('/', { replace: true }),
    notifyError: (message) => raise(host, 'error', message),
    notifyWarning: (message) => raise(host, 'warning', message),
    notifySuccess: (message) => raise(host, 'success', message),
    notifyInfo: (message) => raise(host, 'info', message),
    dispose: () => unfollow(),
  };
}

//
// * Internal
//

/**
 * The shell owns the toast stack — a section paints inside its own shadow root and has nowhere to
 * put one — so this hands the message over and keeps nothing. How long it stays and where it
 * appears are the host's to decide, which is why no lifetime crosses.
 *
 * ! Already localized: no i18n key crosses the boundary, per the contract.
 */
function raise(host: Host, level: Level, message: string): void {
  host.notify({ level, message });
}

function itemIdOf(path: string): string | undefined {
  const [segment] = path.replace(/^\/+/, '').split(/[/?#]/);

  return segment === undefined || segment === '' ? undefined : decodeURIComponent(segment);
}
