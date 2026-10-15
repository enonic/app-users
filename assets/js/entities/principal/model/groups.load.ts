import { fetchGroup } from '../api/groups.api';
import { receiveGroup, removeGroup } from './groups.store';
import { createRowLoader } from './row.load';

export const loadGroup: (key: string) => Promise<void> = createRowLoader({
  fetch: fetchGroup,
  receive: receiveGroup,
  missing: removeGroup,
});
