import { useStore } from '@nanostores/preact';
import { useEffect } from 'preact/hooks';

import { $idProviderPermissions } from '../../../entities/principal';
import { $idProviderDefaultPermissions } from './idprovider-defaults';
import { $idProviderEditor, seedIdProviderEditorPermissions } from './idprovider-editor.store';

/**
 * Fills the Permissions step once its list arrives: the provider's own on an edit, the platform's defaults
 * on a create. The details panel owns the edit read; this only lands its answer.
 */
export function useIdProviderEditorPermissions(): void {
  const { open, mode, entity } = useStore($idProviderEditor, { keys: ['open', 'mode', 'entity'] });
  const { item } = useStore($idProviderPermissions);
  const defaults = useStore($idProviderDefaultPermissions);

  const target = entity?.key;
  const loaded = item?.key === target ? item : undefined;

  useEffect(() => {
    if (loaded !== undefined) {
      seedIdProviderEditorPermissions(loaded.permissions);
    }
  }, [loaded]);

  // The defaults kept from an earlier open seed at once; a fresh answer after that is the same list, and
  // the store takes one seed per open anyway.
  useEffect(() => {
    if (open && mode === 'create' && defaults.length > 0) {
      seedIdProviderEditorPermissions(defaults);
    }
  }, [open, mode, defaults]);
}
