import { useStore } from '@nanostores/preact';
import { ShieldLock } from 'lucide-react';
import { useEffect, useMemo, useState } from 'preact/hooks';

import {
  fetchIdProviderApplications,
  type IdProviderApplication,
} from '../../entities/application';
import {
  createIdProvider,
  fetchDefaultIdProviderPermissions,
  updateIdProvider,
  type IdProvider,
} from '../../entities/principal';
import { visitedErrors } from '../../shared/form';
import { i18n, useI18n } from '../../shared/i18n';
import { DialogIdentityHeader } from '../../shared/ui/dialogs/DialogIdentityHeader';
import { ModalDialog } from '../../shared/ui/dialogs/ModalDialog';
import { IdProviderForm } from './IdProviderForm';
import {
  $idProviderEditDetail,
  forgetIdProviderEditDetail,
  showIdProviderForEdit,
} from './model/idprovider-edit-detail';
import { $idProviderEditor, closeIdProviderEditor } from './model/idprovider-editor.store';
import {
  ID_PROVIDER_FORM_FIELDS,
  initialIdProviderForm,
  isSystemIdProvider,
  nextIdProviderForm,
  sameIdProviderForm,
  validateIdProviderForm,
  type IdProviderFormField,
  type IdProviderForm as IdProviderFormValues,
} from './model/idprovider-form';

export type IdProviderEditorDialogProps = {
  /** The written provider rather than a reload, for the reason `receiveIdProvider` gives. */
  onSaved: (written: IdProvider) => void;
};

export function IdProviderEditorDialog({ onSaved }: IdProviderEditorDialogProps) {
  const editor = useStore($idProviderEditor);
  const detail = useStore($idProviderEditDetail);
  const editedKey = editor?.mode === 'edit' ? editor.provider.key : undefined;

  const createTitle = useI18n('idProviders.dialog.createTitle');
  const editTitle = useI18n('idProviders.dialog.editTitle');
  const displayNameLabel = useI18n('idProviders.dialog.displayName');
  const displayNamePlaceholder = useI18n('idProviders.dialog.displayNamePlaceholder');
  const permissionsFailed = useI18n('idProviders.dialog.permissionsFailed');
  const saveLabel = useI18n('browse.dialog.save');
  const cancelLabel = useI18n('browse.dialog.cancel');
  const closeLabel = useI18n('browse.dialog.close');

  const [values, setValues] = useState<IdProviderFormValues | undefined>();
  // What the server holds, kept beside what the user is editing, so `Save` can tell the two apart.
  const [saved, setSaved] = useState<IdProviderFormValues | undefined>();
  const [nameEdited, setNameEdited] = useState(false);
  const [visited, setVisited] = useState<ReadonlySet<IdProviderFormField>>(new Set());
  const [applications, setApplications] = useState<readonly IdProviderApplication[]>([]);
  const [defaultPrincipals, setDefaultPrincipals] = useState<ReadonlySet<string>>(new Set());
  const [saving, setSaving] = useState(false);
  const [failure, setFailure] = useState<string | undefined>();

  useEffect(() => {
    const opened = editor === undefined ? undefined : initialIdProviderForm(editor);
    setValues(opened);
    setSaved(opened);
    setNameEdited(false);
    setVisited(new Set());
    setDefaultPrincipals(new Set());
    setSaving(false);
    setFailure(undefined);
    showIdProviderForEdit(editedKey);
  }, [editor, editedKey]);

  // The permissions of the provider being edited, once they arrive.
  useEffect(() => {
    const loaded = detail.item;
    if (loaded === undefined || loaded.key !== editedKey) {
      return;
    }

    setValues((current) =>
      current === undefined || current.permissions.length > 0
        ? current
        : { ...current, permissions: loaded.permissions },
    );

    // ! From the server, never from the edited values, which would report an edit as no change.
    setSaved((current) =>
      current === undefined ? current : { ...current, permissions: loaded.permissions },
    );
  }, [detail.item, editedKey]);

  // ! The three entries every provider is seeded with. A new provider starts from them, and in both modes
  // ! they are pinned wherever they appear — see `pinnedPermissions`. A provider nobody may reach is the
  // ! one shape an administrator never wants.
  useEffect(() => {
    if (editor === undefined) {
      return;
    }

    const create = editor.mode === 'create';
    const controller = new AbortController();

    void fetchDefaultIdProviderPermissions(controller.signal).match(
      (permissions) => {
        if (controller.signal.aborted) {
          return;
        }

        setDefaultPrincipals(new Set(permissions.map(({ principal }) => principal.key)));

        if (create) {
          setValues((current) =>
            current === undefined || current.permissions.length > 0
              ? current
              : { ...current, permissions },
          );

          // What the dialog opened with, not an edit — otherwise a new provider is dirty before it is typed.
          setSaved((current) =>
            current === undefined || current.permissions.length > 0
              ? current
              : { ...current, permissions },
          );
        }
      },
      () => undefined,
    );

    return () => controller.abort();
  }, [editor]);

  useEffect(() => {
    if (editor === undefined) {
      return;
    }

    const controller = new AbortController();

    void fetchIdProviderApplications(controller.signal).match(
      (loaded) => {
        if (!controller.signal.aborted) {
          setApplications(loaded);
        }
      },
      () => {
        if (!controller.signal.aborted) {
          setApplications([]);
        }
      },
    );

    return () => controller.abort();
  }, [editor]);

  const errors = useMemo(
    () =>
      values === undefined || editor === undefined
        ? {}
        : validateIdProviderForm(values, editor.mode),
    [values, editor],
  );

  const shownErrors = useMemo(() => visitedErrors(errors, visited), [errors, visited]);

  const unchanged =
    values !== undefined && saved !== undefined && sameIdProviderForm(saved, values);

  const handleChange = (next: IdProviderFormValues): void => {
    if (values === undefined || editor === undefined) {
      return;
    }

    const change = nextIdProviderForm(values, next, editor.mode, nameEdited);
    setValues(change.values);
    setNameEdited(change.nameEdited);
  };

  const handleSave = async (): Promise<void> => {
    if (values === undefined || editor === undefined) {
      return;
    }

    if (Object.keys(errors).length > 0) {
      setVisited(new Set(ID_PROVIDER_FORM_FIELDS));
      return;
    }

    setSaving(true);
    setFailure(undefined);

    const written =
      editor.mode === 'edit'
        ? await updateIdProvider(editor.provider.key, values)
        : await createIdProvider(values);

    written.match(
      (provider) => {
        forgetIdProviderEditDetail();
        closeIdProviderEditor();
        onSaved(provider);
      },
      (error) => {
        setSaving(false);
        setFailure(error.message);
      },
    );
  };

  return (
    <ModalDialog
      open={editor !== undefined}
      title={editor?.mode === 'edit' ? editTitle : createTitle}
      size="wide"
      primaryLabel={saveLabel}
      primaryDisabled={saving || unchanged}
      cancelLabel={cancelLabel}
      closeLabel={closeLabel}
      error={failure ?? (detail.status === 'error' ? permissionsFailed : undefined)}
      // ! Stays put while the write is in flight. Closing would leave the rejection with no screen to
      // ! land on, and the command hands it back rather than notifying for exactly that reason.
      onClose={() => {
        if (!saving) {
          closeIdProviderEditor();
        }
      }}
      onPrimary={() => void handleSave()}
      header={
        values === undefined ? undefined : (
          <DialogIdentityHeader
            icon={<ShieldLock size={40} strokeWidth={1.5} aria-hidden />}
            label={displayNameLabel}
            placeholder={displayNamePlaceholder}
            value={values.displayName}
            error={
              shownErrors.displayName === undefined ? undefined : i18n(shownErrors.displayName)
            }
            onInput={(displayName) => handleChange({ ...values, displayName })}
          />
        )
      }
    >
      {values !== undefined && editor !== undefined && (
        <IdProviderForm
          values={values}
          errors={shownErrors}
          applications={applications}
          nameFixed={editor.mode === 'edit'}
          applicationFixed={editedKey !== undefined && isSystemIdProvider(editedKey)}
          defaultPrincipals={defaultPrincipals}
          onChange={handleChange}
          onBlur={(field) => setVisited((current) => new Set(current).add(field))}
        />
      )}
    </ModalDialog>
  );
}
