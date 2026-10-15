import type { Group } from '../../../entities/principal';
import { createDialogStore } from '../../../shared/dialog';

export const groupsDeletion = createDialogStore<readonly Group[]>();
