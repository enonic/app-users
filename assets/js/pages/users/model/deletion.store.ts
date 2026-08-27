import type { User } from '../../../entities/principal';
import { createDialogStore } from '../../../shared/dialog';

export const usersDeletion = createDialogStore<readonly User[]>();
