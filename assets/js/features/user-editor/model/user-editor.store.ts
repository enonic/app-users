import type { User } from '../../../entities/principal';
import { createDialogStore } from '../../../shared/dialog';

export type UserEditorPayload = { mode: 'create' } | { mode: 'edit'; user: User };

const store = createDialogStore<UserEditorPayload>();

export const $userEditor = store.$payload;

export function openUserCreator(): void {
  store.open({ mode: 'create' });
}

export function openUserEditor(user: User): void {
  store.open({ mode: 'edit', user });
}

export function closeUserEditor(): void {
  store.close();
}
