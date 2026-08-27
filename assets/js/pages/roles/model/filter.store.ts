import { createSelectionStore } from '../../../shared/selection';
import type { RoleBucketId } from './roles.filter';

/**
 * Which buckets the filter has ticked. A multi-select over bucket ids is the same shape as a row
 * selection, so it reuses that store rather than growing a second one; nothing selected means no
 * narrowing.
 */
export const rolesFilter = createSelectionStore<RoleBucketId>();
