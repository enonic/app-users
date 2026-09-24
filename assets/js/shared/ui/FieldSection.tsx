import { Separator } from '@enonic/ui';
import type { ReactNode } from 'react';

export type FieldSectionProps = {
  label: string;
  count?: number;
  children: ReactNode;
  'data-component'?: string;
};

const FIELD_SECTION_NAME = 'FieldSection';

export function FieldSection({
  label,
  count,
  children,
  'data-component': componentName = FIELD_SECTION_NAME,
}: FieldSectionProps) {
  return (
    <section data-component={componentName} className="flex flex-col gap-3">
      <Separator label={count === undefined ? label : `${label} (${count})`} />
      <div className="flex flex-col gap-4">{children}</div>
    </section>
  );
}

FieldSection.displayName = FIELD_SECTION_NAME;
