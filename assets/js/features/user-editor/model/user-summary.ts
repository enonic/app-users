import { publicKeyChangeCounts } from './public-key-changes';
import type { UserForm } from './user-form';

/**
 * One label/value pair of the summary grid. A row either carries text the user typed or a phrase key
 * the step resolves — the model names phrases, it never resolves them. Roles and groups are absent:
 * they are principals, rendered as labels rather than text, so the step lays them out itself.
 */
export type UserSummaryRow = { labelKey: string } & (
  | { value: string; valueKey?: never; valueArgs?: never }
  | { value?: never; valueKey: string; valueArgs?: readonly number[] }
);

/**
 * The wizard's answers as the summary reads them back, in the order the steps asked for them. A row
 * whose value is empty is dropped, as the Content Studio project wizard does.
 *
 * ! The password is reported as set, never echoed.
 */
export function userSummaryRows(form: UserForm, providerName: string): readonly UserSummaryRow[] {
  const rows: UserSummaryRow[] = [
    { labelKey: 'users.dialog.idProvider', value: providerName },
    { labelKey: 'users.dialog.section', value: `${form.displayName} (${form.name})` },
  ];

  if (form.email.trim().length > 0) {
    rows.push({ labelKey: 'users.dialog.email', value: form.email });
  }

  if (form.password !== undefined) {
    rows.push({ labelKey: 'users.dialog.password', valueKey: 'users.dialog.passwordSet' });
  } else if (form.clearPassword === true) {
    rows.push({ labelKey: 'users.dialog.password', valueKey: 'users.dialog.passwordCleared' });
  }

  const keys = publicKeyRow(form);
  if (keys !== undefined) {
    rows.push(keys);
  }

  return rows;
}

// ! Counts, never material: a pending key's own PEM and private half stay out of the summary.
function publicKeyRow(form: UserForm): UserSummaryRow | undefined {
  const { added, removed } = publicKeyChangeCounts(form);
  const labelKey = 'users.dialog.publicKeys';

  if (added > 0 && removed > 0) {
    return { labelKey, valueKey: 'users.dialog.keysAddedRemoved', valueArgs: [added, removed] };
  }

  if (added > 0) {
    return { labelKey, valueKey: 'users.dialog.keysAdded', valueArgs: [added] };
  }

  if (removed > 0) {
    return { labelKey, valueKey: 'users.dialog.keysRemoved', valueArgs: [removed] };
  }

  return undefined;
}
