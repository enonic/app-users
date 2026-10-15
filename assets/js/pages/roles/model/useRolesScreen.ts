import { useEffect } from 'preact/hooks';

import { forgetRoles } from '../../../entities/principal';
import { loadRolesScreen } from './roles.screen';

/** Starts the screen's one load on mount. The three stores it fills are read through their own hooks. */
export function useRolesScreen(): void {
  useEffect(() => {
    void loadRolesScreen();
  }, []);

  // The cached details go with the section: a role loaded here means nothing once the list is left.
  useEffect(() => forgetRoles, []);
}
