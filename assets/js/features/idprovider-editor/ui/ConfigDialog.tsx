import {
  FormRenderer,
  ValidationVisibilityProvider,
  type ValidationVisibility,
} from '@enonic/input-types';
import { useStore } from '@nanostores/preact';
import { useEffect, useMemo, useState } from 'preact/hooks';

import { useHostFrame } from '../../../shared/host';
import { useI18n } from '../../../shared/i18n';
import { ConfirmDialog } from '../../../shared/ui/dialogs/ConfirmDialog';
import { ModalDialog } from '../../../shared/ui/dialogs/ModalDialog';
import {
  isConfigChanged,
  isConfigValid,
  openConfigTree,
  savedConfigOf,
} from '../model/idprovider-config-tree';
import { CONFIG_INPUT_TYPES } from '../model/idprovider-config-types';
import { $idProviderConfig } from '../model/idprovider-config.store';
import { $idProviderEditor, updateIdProviderEditorForm } from '../model/idprovider-editor.store';

export type ConfigDialogProps = {
  open: boolean;
  /** The application's key, whose form this is. */
  application: string;
  /** The application as the title names it. */
  applicationName: string;
  onClose: () => void;
};

/**
 * The bound application's own configuration form, over a tree of its own that Cancel throws away. Apply
 * hands the tree to the wizard, whose Save writes it with the rest of the provider.
 */
export function ConfigDialog({ open, application, applicationName, onClose }: ConfigDialogProps) {
  const session = useStore($idProviderConfig);
  const { notify } = useHostFrame();

  const title = useI18n('idProviders.dialog.configTitle', applicationName);
  const loadingLabel = useI18n('idProviders.dialog.configLoading');
  const failedLabel = useI18n('idProviders.dialog.configFailed');
  const incompleteLabel = useI18n('idProviders.dialog.configIncomplete');
  const closeLabel = useI18n('browse.dialog.close');
  const cancelLabel = useI18n('browse.dialog.cancel');
  const applyLabel = useI18n('idProviders.dialog.configApply');

  const closeQuestion = useI18n('browse.dialog.closeQuestion');

  const [visibility, setVisibility] = useState<ValidationVisibility>('interactive');
  const [refused, setRefused] = useState(false);
  const [changed, setChanged] = useState(false);
  const [closing, setClosing] = useState(false);

  // ! One tree per open: the form edits it in place, so a new one per render would drop every keystroke.
  // ! It starts from what was applied before, else from what is stored.
  const editing = useMemo(() => {
    if (!open || session.status !== 'ready' || session.application !== application) {
      return undefined;
    }
    const { config } = $idProviderEditor.get().form;
    const tree = openConfigTree(session.form, config ?? session.stored);
    return { form: session.form, tree, opened: savedConfigOf(tree) };
  }, [open, session, application]);

  useEffect(() => {
    setVisibility('interactive');
    setRefused(false);
    setChanged(false);
    setClosing(false);
  }, [editing]);

  // What closing would lose, and whether a refusal still stands: both follow the tree the form edits.
  useEffect(() => {
    if (editing === undefined) {
      return;
    }
    const recheck = (): void => {
      setChanged(isConfigChanged(editing.tree, editing.opened));
      setRefused((was) => was && !isConfigValid(editing.form, editing.tree));
    };
    editing.tree.onChanged(recheck);
    return () => editing.tree.unChanged(recheck);
  }, [editing]);

  // Every way out but Apply — Cancel, the close button, Escape, a click outside — asks before it drops edits.
  const requestClose = (): void => {
    if (changed) {
      setClosing(true);
    } else {
      onClose();
    }
  };

  const apply = (): void => {
    if (editing === undefined) {
      return;
    }

    if (!isConfigValid(editing.form, editing.tree)) {
      setVisibility('all');
      setRefused(true);
      return;
    }

    // ! Against the tree as it opened, defaults and all: the save writes those anyway, so an Apply that
    // ! changes nothing leaves the wizard clean and an edit's stored tree untouched.
    if (isConfigChanged(editing.tree, editing.opened)) {
      updateIdProviderEditorForm({ config: savedConfigOf(editing.tree) });
    }
    onClose();
  };

  return (
    <>
      <ModalDialog
        open={open}
        title={title}
        size="wide"
        primaryLabel={applyLabel}
        primaryDisabled={editing === undefined}
        cancelLabel={cancelLabel}
        closeLabel={closeLabel}
        error={refused ? incompleteLabel : undefined}
        onClose={requestClose}
        onPrimary={apply}
      >
        {session.status === 'loading' && <p className="text-subtle text-base">{loadingLabel}</p>}
        {session.status === 'error' && (
          <p className="text-error text-base" role="alert">
            {failedLabel}
          </p>
        )}
        {editing !== undefined && (
          <ValidationVisibilityProvider visibility={visibility}>
            <FormRenderer
              form={editing.form}
              propertySet={editing.tree.getRoot()}
              applicationKey={application}
              registry={CONFIG_INPUT_TYPES}
              enabled
              notify={(message) => notify('warning', message)}
            />
          </ValidationVisibilityProvider>
        )}
      </ModalDialog>

      <ConfirmDialog
        open={closing}
        question={closeQuestion}
        onConfirm={() => {
          setClosing(false);
          onClose();
        }}
        onClose={() => setClosing(false)}
      />
    </>
  );
}
