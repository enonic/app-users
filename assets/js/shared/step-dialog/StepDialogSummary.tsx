import type { ReactNode } from 'react';

export type StepDialogSummaryProps = {
  children: ReactNode;
};

/** The grid a summary step reads the answers back in: a label column and a value column. */
export function StepDialogSummary({ children }: StepDialogSummaryProps) {
  return (
    <dl className="bg-surface-primary grid grid-cols-[25%_auto] gap-x-5 gap-y-4 rounded-md p-6 text-sm">
      {children}
    </dl>
  );
}

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
