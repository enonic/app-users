import type { ReactNode } from 'react';

export type StepDialogSummaryProps = {
  children: ReactNode;
  'data-component'?: string;
};

const STEP_DIALOG_SUMMARY_NAME = 'StepDialogSummary';

/** The grid a summary step reads the answers back in: a label column and a value column. */
export function StepDialogSummary({
  children,
  'data-component': componentName = STEP_DIALOG_SUMMARY_NAME,
}: StepDialogSummaryProps) {
  return (
    <dl
      data-component={componentName}
      className="bg-surface-primary grid grid-cols-[25%_auto] gap-x-5 gap-y-4 rounded-md p-6 text-sm"
    >
      {children}
    </dl>
  );
}

StepDialogSummary.displayName = STEP_DIALOG_SUMMARY_NAME;

export type StepDialogSummaryRowProps = {
  label: string;
  children: ReactNode;
};

export function StepDialogSummaryRow({ label, children }: StepDialogSummaryRowProps) {
  return (
    <>
      <dt className="font-semibold">{label}</dt>
      <dd className="min-w-0">{children}</dd>
    </>
  );
}
