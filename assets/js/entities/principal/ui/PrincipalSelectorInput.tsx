import {
  FieldError,
  getOccurrenceErrorMessage,
  useInputTypesPhrases,
  useValidationVisibility,
  type PrincipalSelectorConfig,
  type SelfManagedComponentProps,
} from '@enonic/input-types';
import { ValueTypes } from '@enonic/input-types/data';
import { useMemo, useState } from 'preact/hooks';

import { useI18n } from '../../../shared/i18n';
import { capSelection } from '../model/principal-selection';
import type { PrincipalRef, PrincipalType } from '../model/principal.types';
import { usePrincipalRefs } from '../model/usePrincipalRefs';
import { PrincipalPicker } from './PrincipalPicker';

const ALL_KINDS: readonly PrincipalType[] = ['user', 'group', 'role'];

/**
 * XP's `PrincipalSelector` input type, which `@enonic/input-types` leaves to the application: only it
 * knows where principals come from. Each occurrence is a `Reference` holding a principal key.
 */
export function PrincipalSelectorInput({
  values,
  onAdd,
  onRemove,
  occurrences,
  config,
  errors,
}: SelfManagedComponentProps<PrincipalSelectorConfig>) {
  const keys = useMemo(() => values.flatMap((value) => value.getString() ?? []), [values]);
  const { refs, remember } = usePrincipalRefs(keys);
  const visibility = useValidationVisibility();
  const t = useInputTypesPhrases();

  const placeholder = useI18n('principal.selector.placeholder');

  const [touched, setTouched] = useState(false);

  const excluded = useMemo(() => new Set(config.skipPrincipals), [config.skipPrincipals]);
  const kinds = config.principalTypes.length > 0 ? config.principalTypes : ALL_KINDS;

  // ! `interactive` alone: under `all` the form's own field already shows the occurrence error of an
  // ! `internal` type under it, and a second copy here would repeat it.
  const shown = visibility === 'interactive' && touched;
  const error = shown ? getOccurrenceErrorMessage(occurrences, errors, t) : undefined;

  const handleChange = (next: readonly PrincipalRef[]): void => {
    setTouched(true);
    remember(next);

    const target = capSelection(
      next.map(({ key }) => key),
      occurrences.getMaximum(),
    );
    const targetKeys = new Set(target);
    // Backwards, so the indices still to be removed are not shifted by the removals done.
    for (let index = values.length - 1; index >= 0; index--) {
      const key = values[index]?.getString();
      if (key == null || !targetKeys.has(key)) {
        onRemove(index);
      }
    }

    const held = new Set(keys);
    target
      .filter((key) => !held.has(key))
      .forEach((key) => onAdd(ValueTypes.REFERENCE.newValue(key)));
  };

  return (
    <div className="flex flex-col gap-1.5">
      <PrincipalPicker
        selected={refs}
        onChange={handleChange}
        kinds={kinds}
        placeholder={placeholder}
        excluded={excluded}
        showIdProvider
      />
      <FieldError message={error} />
    </div>
  );
}
