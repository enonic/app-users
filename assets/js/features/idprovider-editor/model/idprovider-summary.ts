import type { IdProviderForm } from './idprovider-form';

/**
 * One label/value pair of the summary grid: a phrase key and text. The permissions are absent: they are
 * principals with a level each, rendered as labels rather than text, so the step lays them out itself.
 */
export type IdProviderSummaryRow = { labelKey: string; value: string };

/**
 * The wizard's answers as the summary reads them back, in the order the step asked for them. A description
 * nobody typed is dropped, as the Content Studio project wizard does; the binding is not, since a provider
 * bound to nothing serves no login, which is worth reading back. `application` arrives as text: the name
 * of the bound application, or what the step says for none.
 */
export function idProviderSummaryRows(
  form: IdProviderForm,
  application: string,
): readonly IdProviderSummaryRow[] {
  const rows: IdProviderSummaryRow[] = [
    { labelKey: 'idProviders.dialog.section', value: `${form.displayName} (${form.name})` },
  ];

  if (form.description.trim().length > 0) {
    rows.push({ labelKey: 'idProviders.dialog.description', value: form.description });
  }

  rows.push({ labelKey: 'idProviders.dialog.application', value: application });

  return rows;
}
