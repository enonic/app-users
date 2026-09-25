import type { ReactNode } from 'react';

import { StepDialogSummaryRow } from '../../../shared/step-dialog/StepDialogSummary';
import type { PrincipalRef } from '../model/principal.types';
import { PrincipalIcon } from './PrincipalIcon';

export type PrincipalsSummaryRowProps = {
  label: string;
  principals: readonly PrincipalRef[];
  /** What a line says after the name — a level the principal was granted, say. Absent for a plain list. */
  trailing?: (principal: PrincipalRef) => ReactNode;
  /** On the value cell's content: the row itself is a `dt`/`dd` pair with no element of its own. */
  'data-component'?: string;
};

const PRINCIPALS_SUMMARY_ROW_NAME = 'PrincipalsSummaryRow';

/** A summary row of principals, one icon and name per line. Absent when there are none to read back. */
export function PrincipalsSummaryRow({
  label,
  principals,
  trailing,
  'data-component': componentName = PRINCIPALS_SUMMARY_ROW_NAME,
}: PrincipalsSummaryRowProps) {
  if (principals.length === 0) {
    return null;
  }

  return (
    <StepDialogSummaryRow label={label}>
      <div data-component={componentName} className="flex flex-col gap-2">
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

PrincipalsSummaryRow.displayName = PRINCIPALS_SUMMARY_ROW_NAME;
