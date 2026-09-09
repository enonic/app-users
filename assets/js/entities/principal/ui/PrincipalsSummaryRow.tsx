import { StepDialogSummaryRow } from '../../../shared/step-dialog/StepDialogSummary';
import type { PrincipalRef } from '../model/principal.types';
import { PrincipalIcon } from './PrincipalIcon';

export type PrincipalsSummaryRowProps = {
  label: string;
  principals: readonly PrincipalRef[];
};

/** A summary row of principals, one icon and name per line. Absent when there are none to read back. */
export function PrincipalsSummaryRow({ label, principals }: PrincipalsSummaryRowProps) {
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
          </span>
        ))}
      </div>
    </StepDialogSummaryRow>
  );
}
