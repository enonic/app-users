import { useStore } from '@nanostores/preact';
import { useEffect } from 'preact/hooks';

import { loadIdProviderConfig } from './idprovider-config.load';
import { clearIdProviderConfig } from './idprovider-config.store';
import { $idProviderEditor, $idProviderEditorApplication } from './idprovider-editor.store';

/**
 * Reads the bound application's form and the tree the provider holds for it, once per binding the wizard
 * shows: on open for an edit, and again whenever another application is picked. The configuration dialog
 * edits against it, the binding's warning icon reads it, and a Save that writes a configuration takes its
 * defaults from it — whether or not the dialog is ever opened.
 */
export function useIdProviderEditorConfig(): void {
  const { mode, entity } = useStore($idProviderEditor, { keys: ['mode', 'entity'] });
  const application = useStore($idProviderEditorApplication);

  const idProvider = mode === 'edit' ? entity?.key : undefined;

  useEffect(() => {
    if (application.length === 0) {
      clearIdProviderConfig();
      return;
    }

    const controller = new AbortController();
    loadIdProviderConfig({ application, idProvider }, controller.signal);

    return () => {
      controller.abort();
      clearIdProviderConfig();
    };
  }, [application, idProvider]);
}
