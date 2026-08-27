import type { IdProvider } from '../../../entities/principal';
import { createDialogStore } from '../../../shared/dialog';

export type IdProviderEditorPayload = { mode: 'create' } | { mode: 'edit'; provider: IdProvider };

const store = createDialogStore<IdProviderEditorPayload>();

export const $idProviderEditor = store.$payload;

export function openIdProviderCreator(): void {
  store.open({ mode: 'create' });
}

export function openIdProviderEditor(provider: IdProvider): void {
  store.open({ mode: 'edit', provider });
}

export function closeIdProviderEditor(): void {
  store.close();
}
