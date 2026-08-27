import { useItemId } from '../../shared/host';

/** The key of the item the sub-path names, which is the active row of the list. */
export function useActiveKey(): string | undefined {
  return useItemId();
}
