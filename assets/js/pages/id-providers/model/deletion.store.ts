import type { IdProvider } from '../../../entities/principal';
import { createDialogStore } from '../../../shared/dialog';

export const idProvidersDeletion = createDialogStore<readonly IdProvider[]>();
