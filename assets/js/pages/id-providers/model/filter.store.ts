import { createSelectionStore } from '../../../shared/selection';

/**
 * Which providers the filter has ticked. A multi-select over provider keys is the same shape as a
 * row selection, so it reuses that store; nothing selected means no narrowing.
 */
export const idProvidersFilter = createSelectionStore();
