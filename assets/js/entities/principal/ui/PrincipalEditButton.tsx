import { Button } from '@enonic/ui';
import { Lock } from 'lucide-react';

export type PrincipalEditButtonProps = {
  label: string;
  /** Locked by the provider's mode: the button stays, disabled, and says so with a lock. */
  locked?: boolean;
  onClick: () => void;
};

export function PrincipalEditButton({ label, locked = false, onClick }: PrincipalEditButtonProps) {
  return (
    <Button
      variant="outline"
      size="sm"
      label={label}
      disabled={locked}
      startIcon={locked ? Lock : undefined}
      onClick={onClick}
    />
  );
}
