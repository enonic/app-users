import { useStore } from '@nanostores/preact';
import { ShieldLock } from 'lucide-react';
import { ResultAsync } from 'neverthrow';
import { useEffect } from 'preact/hooks';

import { createIdProvider, updateIdProvider, type IdProvider } from '../../../entities/principal';
import { useHostFrame } from '../../../shared/host';
import { runStepDialogSave, type StepDialogMode } from '../../../shared/step-dialog';
import { StepDialog } from '../../../shared/step-dialog/StepDialog';
import { loadIdProviderApplications } from '../model/idprovider-applications';
import {
  effectiveIdProviderConfig,
  writesIdProviderConfig,
} from '../model/idprovider-config-effective';
import { whenIdProviderConfigSettled } from '../model/idprovider-config-settled';
import { $idProviderConfig } from '../model/idprovider-config.store';
import { loadIdProviderDefaultPermissions } from '../model/idprovider-defaults';
import { idProviderDraftFrom } from '../model/idprovider-draft';
import { $idProviderEditor, idProviderEditorDialog } from '../model/idprovider-editor.store';
import { useIdProviderEditorConfig } from '../model/useIdProviderEditorConfig';
import { useIdProviderEditorPermissions } from '../model/useIdProviderEditorPermissions';
import { ID_PROVIDER_EDITOR_STEP_PANELS } from './steps';

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

  useIdProviderEditorPermissions();
  useIdProviderEditorConfig();

  // What every open reads afresh: the applications a provider may be bound to, and the entries the
  // platform seeds a provider with. An install changes between two opens.
  useEffect(() => {
    if (!open) {
      return;
    }

    const controller = new AbortController();
    loadIdProviderApplications(controller.signal);
    loadIdProviderDefaultPermissions(controller.signal);

    return () => controller.abort();
  }, [open]);

  const save = (): Promise<void> =>
    runStepDialogSave(idProviderEditorDialog, {
      // ! A Save that writes a configuration waits for the application's form if it is still on its way:
      // ! without it the binding would be written empty, without the defaults the same Save writes a moment
      // ! later. One that writes none — the binding kept, nothing applied — goes at once.
      write: (form, { mode, entity }) => {
        const binding = {
          application: form.application,
          applied: form.config,
          bound: mode === 'edit' ? (entity?.application?.key ?? '') : '',
        };
        const settled = writesIdProviderConfig(binding)
          ? whenIdProviderConfigSettled(form.application)
          : Promise.resolve($idProviderConfig.get());

        return ResultAsync.fromSafePromise(settled).andThen((state) => {
          const draft = idProviderDraftFrom(form, effectiveIdProviderConfig(state, binding));

          return mode === 'edit' && entity !== undefined
            ? updateIdProvider(entity.key, draft)
            : createIdProvider(draft);
        });
      },
      notices: NOTICES,
      notify,
      onSaved,
    });

  return (
    <StepDialog
      store={idProviderEditorDialog}
      glyph={<ShieldLock size={40} strokeWidth={1.5} className="text-main" aria-hidden />}
      panels={ID_PROVIDER_EDITOR_STEP_PANELS}
      onSave={() => void save()}
    />
  );
}
