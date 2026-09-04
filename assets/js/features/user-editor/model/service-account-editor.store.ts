import type { User } from '../../../entities/principal';
import { createDialogStore } from '../../../shared/dialog';
import type { UserEditorPayload } from './user-editor.store';

// Its own store, not `$userEditor`: both sections stay mounted, and one shared payload would open the
// dialog in each of them at once.
const store = createDialogStore<UserEditorPayload>();

export const $serviceAccountEditor = store.$payload;

export function openServiceAccountCreator(): void {
  store.open({ mode: 'create' });
}

export function openServiceAccountEditor(user: User): void {
  store.open({ mode: 'edit', user });
}

export function closeServiceAccountEditor(): void {
  store.close();
}
