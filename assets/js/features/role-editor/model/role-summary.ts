import type { RoleForm } from './role-form';

/**
 * One label/value pair of the summary grid: a phrase key and text the user typed. The members are absent:
 * they are principals, rendered as labels rather than text, so the step lays them out itself.
 */
export type RoleSummaryRow = { labelKey: string; value: string };

/**
 * The wizard's answers as the summary reads them back, in the order the step asked for them. A row whose
 * value is empty is dropped, as the Content Studio project wizard does.
 */
export function roleSummaryRows(form: RoleForm): readonly RoleSummaryRow[] {
  const rows: RoleSummaryRow[] = [
    { labelKey: 'roles.dialog.section', value: `${form.displayName} (${form.name})` },
  ];

  if (form.description.trim().length > 0) {
    rows.push({ labelKey: 'roles.dialog.description', value: form.description });
  }

  return rows;
}
