import type { GroupForm } from './group-form';

/**
 * One label/value pair of the summary grid: a phrase key and text the user typed. Members and roles are
 * absent: they are principals, rendered as labels rather than text, so the step lays them out itself.
 */
export type GroupSummaryRow = { labelKey: string; value: string };

/**
 * The wizard's answers as the summary reads them back, in the order the step asked for them. A row whose
 * value is empty is dropped, as the Content Studio project wizard does.
 */
export function groupSummaryRows(
  form: GroupForm,
  providerName: string,
): readonly GroupSummaryRow[] {
  const rows: GroupSummaryRow[] = [
    { labelKey: 'groups.dialog.idProvider', value: providerName },
    { labelKey: 'groups.dialog.section', value: `${form.displayName} (${form.name})` },
  ];

  if (form.description.trim().length > 0) {
    rows.push({ labelKey: 'groups.dialog.description', value: form.description });
  }

  return rows;
}
