import { ItemLabel } from '../../../shared/ui/ItemLabel';
import { principalName } from '../model/principal.keys';
import type { PrincipalRef } from '../model/principal.types';
import { PrincipalIcon } from './PrincipalIcon';

export type PrincipalLabelProps = {
  principal: PrincipalRef;
  className?: string;
};

export function PrincipalLabel({ principal, className }: PrincipalLabelProps) {
  const { key, displayName } = principal;

  return (
    <ItemLabel
      className={className}
      icon={<PrincipalIcon principal={principal} />}
      primary={displayName}
      secondary={principalName(key)}
    />
  );
}
