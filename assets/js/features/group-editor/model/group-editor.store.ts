import type { Group } from '../../../entities/principal';
import { createDialogStore } from '../../../shared/dialog';

export type GroupEditorPayload = { mode: 'create' } | { mode: 'edit'; group: Group };

const store = createDialogStore<GroupEditorPayload>();

export const $groupEditor = store.$payload;

export function openGroupCreator(): void {
  store.open({ mode: 'create' });
}

export function openGroupEditor(group: Group): void {
  store.open({ mode: 'edit', group });
}

export function closeGroupEditor(): void {
  store.close();
}
