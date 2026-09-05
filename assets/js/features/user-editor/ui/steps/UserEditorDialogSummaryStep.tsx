import { useStore } from '@nanostores/preact';
import type { ReactNode } from 'react';

import { useIdProviderNames, type PrincipalRef } from '../../../../entities/principal';
import { PrincipalIcon } from '../../../../entities/principal/ui/PrincipalIcon';
import { i18n, useI18n } from '../../../../shared/i18n';
import { $userEditor } from '../../model/user-editor.store';
import { userSummaryRows } from '../../model/user-summary';

export function UserEditorDialogSummaryStep() {
  const { form } = useStore($userEditor, { keys: ['form'] });
  const { items: providers } = useIdProviderNames();

  const rolesLabel = useI18n('users.dialog.roles');
  const groupsLabel = useI18n('users.dialog.groups');

  const providerName =
    providers.find(({ key }) => key === form.idProvider)?.displayName ?? form.idProvider;

  return (
    <dl className="bg-surface-primary grid grid-cols-[25%_auto] gap-x-5 gap-y-4 rounded-md p-6 text-sm">
      {userSummaryRows(form, providerName).map((row) => (
        <SummaryRow key={row.labelKey} label={i18n(row.labelKey)}>
          <span className="break-words">
            {row.valueKey === undefined ? row.value : i18n(row.valueKey, ...(row.valueArgs ?? []))}
          </span>
        </SummaryRow>
      ))}

      <PrincipalsRow label={rolesLabel} principals={form.roles} />
      <PrincipalsRow label={groupsLabel} principals={form.groups} />
    </dl>
  );
}

type SummaryRowProps = {
  label: string;
  children: ReactNode;
};

function SummaryRow({ label, children }: SummaryRowProps) {
  return (
    <>
      <dt className="font-semibold">{label}</dt>
      <dd className="min-w-0">{children}</dd>
    </>
  );
}

type PrincipalsRowProps = {
  label: string;
  principals: readonly PrincipalRef[];
};

function PrincipalsRow({ label, principals }: PrincipalsRowProps) {
  if (principals.length === 0) {
    return null;
  }

  return (
    <SummaryRow label={label}>
      <div className="flex flex-col gap-2">
        {principals.map((principal) => (
          <span key={principal.key} className="flex items-center gap-2.5">
            <PrincipalIcon principal={principal} size="xs" />
            <span className="truncate">{principal.displayName}</span>
          </span>
        ))}
      </div>
    </SummaryRow>
  );
}
