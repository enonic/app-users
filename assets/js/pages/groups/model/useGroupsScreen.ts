import { useEffect } from 'preact/hooks';

import { forgetGroups } from '../../../entities/principal';
import { loadGroupsScreen } from './groups.screen';

/** Starts the screen's one load on mount. The two stores it fills are read through their own hooks. */
export function useGroupsScreen(): void {
  useEffect(() => {
    void loadGroupsScreen();
  }, []);

  // The cached details go with the section: a group loaded here means nothing once the list is left.
  useEffect(() => forgetGroups, []);
}
