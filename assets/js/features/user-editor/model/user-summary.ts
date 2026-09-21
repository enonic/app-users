import { SYSTEM_ID_PROVIDER } from '../../../entities/principal';
import { publicKeyChangeCounts } from './public-key-changes';
import type { UserForm } from './user-form';

/** A phrase key with the arguments it takes. */
export type SummaryPhrase = { key: string; args?: readonly number[] };

/**
 * One label/value pair of the summary grid. A row carries text the user typed, one phrase, or the
 * phrases of one line each — the model names phrases, it never resolves them. Roles and groups are
 * absent: they are principals, rendered as labels rather than text, so the step lays them out itself.
 */
export type UserSummaryRow = { labelKey: string } & (
  | { value: string; valueKey?: never; valueArgs?: never; lines?: never }
  | { value?: never; valueKey: string; valueArgs?: readonly number[]; lines?: never }
  | { value?: never; valueKey?: never; valueArgs?: never; lines: readonly SummaryPhrase[] }
);

/**
 * The wizard's answers as the summary reads them back, in the order the steps asked for them. A row
 * whose value is empty is dropped, as the Content Studio project wizard does — credentials included,
 * so they are read back only when the dialog changed them. A service account's provider is a given,
 * so it is not read back.
 *
 * ! The password is reported as set, never echoed.
 */
export function userSummaryRows(form: UserForm, providerName: string): readonly UserSummaryRow[] {
  const rows: UserSummaryRow[] = [];

  if (form.idProvider !== SYSTEM_ID_PROVIDER) {
    rows.push({ labelKey: 'users.dialog.idProvider', value: providerName });
  }

  rows.push({ labelKey: 'users.dialog.section', value: `${form.displayName} (${form.name})` });

  if (form.email.trim().length > 0) {
    rows.push({ labelKey: 'users.dialog.email', value: form.email });
  }

  const credentials = credentialLines(form);
  if (credentials.length > 0) {
    rows.push({ labelKey: 'users.dialog.credentials', lines: credentials });
  }

  return rows;
}

// One line for the password, one for the keys; a password left alone is no change and says nothing.
function credentialLines(form: UserForm): readonly SummaryPhrase[] {
  return [passwordLine(form), publicKeyLine(form)].filter((line) => line !== undefined);
}

function passwordLine(form: UserForm): SummaryPhrase | undefined {
  if (form.password !== undefined) {
    return { key: 'users.dialog.passwordSet' };
  }

  return form.clearPassword === true ? { key: 'users.dialog.passwordCleared' } : undefined;
}

// ! Counts, never material: a pending key's own PEM and private half stay out of the summary.
function publicKeyLine(form: UserForm): SummaryPhrase | undefined {
  const { added, removed } = publicKeyChangeCounts(form);

  if (added > 0 && removed > 0) {
    return { key: 'users.dialog.keysAddedRemoved', args: [added, removed] };
  }

  if (added > 0) {
    return { key: 'users.dialog.keysAdded', args: [added] };
  }

  return removed > 0 ? { key: 'users.dialog.keysRemoved', args: [removed] } : undefined;
}
