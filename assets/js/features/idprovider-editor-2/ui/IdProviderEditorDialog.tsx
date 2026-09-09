import { useStore } from '@nanostores/preact';
import { ShieldLock } from 'lucide-react';
import { useEffect } from 'preact/hooks';

import { createIdProvider, updateIdProvider, type IdProvider } from '../../../entities/principal';
import { useHostFrame } from '../../../shared/host';
import { runStepDialogSave, type StepDialogMode } from '../../../shared/step-dialog';
import { StepDialog } from '../../../shared/step-dialog/StepDialog';
import { loadIdProviderApplications } from '../model/idprovider-applications';
import { idProviderDraftFrom } from '../model/idprovider-draft';
import { $idProviderEditor, idProviderEditorDialog } from '../model/idprovider-editor.store';
import { ID_PROVIDER_EDITOR_STEP_PANELS } from './steps';

const TITLES: Record<StepDialogMode, string> = {
  create: 'idProviders.dialog.createTitle',
  edit: 'idProviders.dialog.editTitle',
};

const NOTICES = {
  created: 'idProviders.notify.created',
  updated: 'idProviders.notify.updated',
  createFailed: 'idProviders.notify.createFailed',
  updateFailed: 'idProviders.notify.updateFailed',
};

export type IdProviderEditorDialogProps = {
  /** The written provider rather than a reload, for the reason `receiveIdProvider` gives. */
  onSaved: (written: IdProvider, mode: StepDialogMode) => void;
};

export function IdProviderEditorDialog({ onSaved }: IdProviderEditorDialogProps) {
  const { open } = useStore($idProviderEditor, { keys: ['open'] });
  const { notify } = useHostFrame();

  // The applications a provider may be bound to, read on every open: an install changes between two.
  useEffect(() => {
    if (!open) {
      return;
    }

    const controller = new AbortController();
    loadIdProviderApplications(controller.signal);

    return () => controller.abort();
  }, [open]);

  const save = (): Promise<void> =>
    runStepDialogSave(idProviderEditorDialog, {
      write: (form, { mode, entity }) =>
        mode === 'edit' && entity !== undefined
          ? updateIdProvider(entity.key, idProviderDraftFrom(form))
          : createIdProvider(idProviderDraftFrom(form)),
      notices: NOTICES,
      notify,
      onSaved,
    });

  return (
    <StepDialog
      store={idProviderEditorDialog}
      glyph={<ShieldLock size={40} strokeWidth={1.5} className="text-main" aria-hidden />}
      titles={TITLES}
      panels={ID_PROVIDER_EDITOR_STEP_PANELS}
      onSave={() => void save()}
    />
  );
}
