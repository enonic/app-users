import { Link, Selector } from '@enonic/ui';
import { useStore } from '@nanostores/preact';

import { useIdProviderNames } from '../../../../entities/principal';
import { visitedErrors } from '../../../../shared/form';
import { i18n, useI18n } from '../../../../shared/i18n';
import { FieldLabel } from '../../../../shared/ui/FieldLabel';
import { SelectorPopup } from '../../../../shared/ui/SelectorPopup';
import {
  $userEditor,
  $userEditorErrors,
  $userEditorProviders,
  closeUserEditor,
  markUserEditorFieldVisited,
  setUserEditorIdProvider,
} from '../../model/user-editor.store';

const PROVIDER_LABEL_ID = 'user-editor-id-provider-label';

const ID_PROVIDERS_HREF = '#/id-providers';

/** A create's first step; a service account's provider is the system store, so it never shows this one. */
export function UserEditorDialogIdProviderStep() {
  const { form, visited, mode } = useStore($userEditor, { keys: ['form', 'visited', 'mode'] });
  const errors = useStore($userEditorErrors);
  const providers = useStore($userEditorProviders);
  const { status: providersStatus } = useIdProviderNames();

  const persisted = mode === 'edit';
  // Only a settled answer says there is none to choose; a failed read keeps the selector.
  const noProviders = !persisted && providersStatus === 'ready' && providers.length === 0;

  const providerName =
    providers.find(({ key }) => key === form.idProvider)?.displayName ?? form.idProvider;

  // Labels
  const providerLabel = useI18n('users.dialog.idProvider');
  const providerPlaceholder = useI18n('users.dialog.idProviderPlaceholder');
  const noProvidersLabel = useI18n('users.dialog.noIdProviders');
  const openProvidersLabel = useI18n('users.dialog.openIdProviders');

  // Errors
  const shown = visitedErrors(errors, visited);
  const providerError = shown.idProvider === undefined ? undefined : i18n(shown.idProvider);

  // No provider to create in: the ID Providers section is where one comes from.
  if (noProviders) {
    return (
      <p className="border-bdr-soft text-subtle rounded-md border p-4 text-sm">
        {noProvidersLabel}{' '}
        <Link href={ID_PROVIDERS_HREF} onClick={closeUserEditor}>
          {openProvidersLabel}
        </Link>
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-1.5">
      <FieldLabel id={PROVIDER_LABEL_ID} text={providerLabel} required={!persisted} />
      <Selector.Root
        disabled={persisted}
        value={form.idProvider}
        error={providerError !== undefined}
        onValueChange={(next) => {
          markUserEditorFieldVisited('idProvider');
          setUserEditorIdProvider(next);
        }}
      >
        <Selector.Trigger aria-labelledby={PROVIDER_LABEL_ID}>
          <Selector.Value placeholder={providerPlaceholder}>
            {form.idProvider.length > 0 ? providerName : undefined}
          </Selector.Value>
          <Selector.Icon />
        </Selector.Trigger>
        <SelectorPopup>
          {providers.map(({ key, displayName }) => (
            <Selector.Item key={key} value={key} textValue={displayName}>
              <Selector.ItemText>{displayName}</Selector.ItemText>
            </Selector.Item>
          ))}
        </SelectorPopup>
      </Selector.Root>
      {providerError !== undefined && <p className="text-error text-sm">{providerError}</p>}
    </div>
  );
}
