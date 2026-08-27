import type { Role } from '../../../entities/principal';
import { createDialogStore } from '../../../shared/dialog';

export type RoleEditorPayload = { mode: 'create' } | { mode: 'edit'; role: Role };

const store = createDialogStore<RoleEditorPayload>();

export const $roleEditor = store.$payload;

export function openRoleCreator(): void {
  store.open({ mode: 'create' });
}

export function openRoleEditor(role: Role): void {
  store.open({ mode: 'edit', role });
}

export function closeRoleEditor(): void {
  store.close();
}
