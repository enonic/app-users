import type { ReactNode } from 'react';

import { StepDialogSummaryRow } from '../../../shared/step-dialog/StepDialogSummary';
import type { PrincipalRef } from '../model/principal.types';
import { PrincipalIcon } from './PrincipalIcon';

export type PrincipalsSummaryRowProps = {
  label: string;
  principals: readonly PrincipalRef[];
  /** What a line says after the name — a level the principal was granted, say. Absent for a plain list. */
  trailing?: (principal: PrincipalRef) => ReactNode;
};

/** A summary row of principals, one icon and name per line. Absent when there are none to read back. */
export function PrincipalsSummaryRow({ label, principals, trailing }: PrincipalsSummaryRowProps) {
  if (principals.length === 0) {
    return null;
  }

  return (
    <StepDialogSummaryRow label={label}>
      <div className="flex flex-col gap-2">
        {principals.map((principal) => (
          <span key={principal.key} className="flex items-center gap-2.5">
            <PrincipalIcon principal={principal} size="xs" />
            <span className="truncate">{principal.displayName}</span>
            {trailing !== undefined && (
              <span className="text-subtle ml-auto shrink-0">{trailing(principal)}</span>
            )}
          </span>
        ))}
      </div>
    </StepDialogSummaryRow>
  );
}
