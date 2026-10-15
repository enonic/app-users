import type { User } from '../../../entities/principal';
import { createDialogStore } from '../../../shared/dialog';

export const serviceAccountsDeletion = createDialogStore<readonly User[]>();
