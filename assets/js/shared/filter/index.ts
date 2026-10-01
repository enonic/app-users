export {
  EMPTY_FILTER,
  isTextTerm,
  sameTerm,
  textOf,
  textTerm,
  toggledTerm,
  valuesOf,
  withoutTerm,
  withTerm,
} from './filter';
export type { FilterQuery, FilterTerm } from './filter';
export { createFilterStore } from './filter.store';
export type { FilterStore } from './filter.store';
export { matchesEveryWord } from './text-match';
