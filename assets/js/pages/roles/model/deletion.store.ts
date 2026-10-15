import type { Role } from '../../../entities/principal';
import { createDialogStore } from '../../../shared/dialog';

export const rolesDeletion = createDialogStore<readonly Role[]>();
