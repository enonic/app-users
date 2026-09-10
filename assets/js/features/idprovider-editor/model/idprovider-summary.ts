import type { IdProviderForm } from './idprovider-form';

/**
 * One label/value pair of the summary grid: a phrase key and text. The permissions are absent: they are
 * principals with a level each, rendered as labels rather than text, so the step lays them out itself.
 */
export type IdProviderSummaryRow = { labelKey: string; value: string };

/**
 * The wizard's answers as the summary reads them back, in the order the step asked for them. A description
 * nobody typed and a binding nobody made are dropped, as the Content Studio project wizard does.
 * `application` arrives as text: the name of the bound application, when there is one.
 */
export function idProviderSummaryRows(
  form: IdProviderForm,
  application: string | undefined,
): readonly IdProviderSummaryRow[] {
  const rows: IdProviderSummaryRow[] = [
    { labelKey: 'idProviders.dialog.section', value: `${form.displayName} (${form.name})` },
  ];

  if (form.description.trim().length > 0) {
    rows.push({ labelKey: 'idProviders.dialog.description', value: form.description });
  }

  if (application !== undefined) {
    rows.push({ labelKey: 'idProviders.dialog.application', value: application });
  }

  return rows;
}
