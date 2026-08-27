import type { Notification } from '../sections';
import { $host } from './host.store';

type Level = Notification['level'];

/**
 * The shell owns the toast stack — a section paints inside its own shadow root and has nowhere to
 * put one — so these hand the message over and keep nothing. How long it stays and where it appears
 * are the host's to decide, which is why no lifetime crosses.
 *
 * ! Already localized: no i18n key crosses the boundary, per the contract.
 */
export function notifyError(message: string): void {
  raise('error', message);
}

export function notifyWarning(message: string): void {
  raise('warning', message);
}

export function notifySuccess(message: string): void {
  raise('success', message);
}

export function notifyInfo(message: string): void {
  raise('info', message);
}

//
// * Internal
//

function raise(level: Level, message: string): void {
  $host.get()?.notify({ level, message });
}
