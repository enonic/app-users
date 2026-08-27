import { Separator } from '@enonic/ui';
import type { ReactNode } from 'react';

export type FieldSectionProps = {
  label: string;
  count?: number;
  children: ReactNode;
};

export function FieldSection({ label, count, children }: FieldSectionProps) {
  return (
    <section className="flex flex-col gap-3">
      <Separator label={count === undefined ? label : `${label} (${count})`} />
      <div className="flex flex-col gap-4">{children}</div>
    </section>
  );
}
