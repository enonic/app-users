import type { Translate } from '@enonic/ui';

import { $phrases, localize } from './i18n.store';

/**
 * What `@enonic/ui`'s `I18nProvider` is handed, so the library's and `@enonic/input-types`' own labels
 * come out in this application's words where its bundle has them, and in the package's English where
 * it has not. A module constant, which is what keeps the labels from re-rendering: the phrases arrive
 * once, before the first render, for the reason `i18n` gives.
 */
export const translate: Translate = (key, { defaultValue, values = [] }) => {
  const phrases = $phrases.get();

  return Object.hasOwn(phrases, key) ? localize(phrases, key, ...values) : defaultValue;
};
