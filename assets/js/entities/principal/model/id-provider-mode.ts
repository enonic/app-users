import type { IdProviderMode } from './principal.types';

export type PrincipalWrite = 'user' | 'group';

// ! The same matrix the server refuses by: the client only hides what the server would refuse anyway.
const WRITABLE: Record<PrincipalWrite, readonly IdProviderMode[]> = {
  user: ['LOCAL'],
  group: ['LOCAL', 'MIXED'],
};

/**
 * Whether this app may create or edit a principal of that kind in a provider of that mode. An unknown
 * mode — the providers not loaded yet, or a key the list does not carry — allows nothing.
 */
export function allowsWrite(mode: IdProviderMode | undefined, write: PrincipalWrite): boolean {
  return mode !== undefined && WRITABLE[write].includes(mode);
}

/** What the details panels say about who manages a provider's principals. */
export const ID_PROVIDER_MODE_KEYS: Record<IdProviderMode, string> = {
  LOCAL: 'idProviders.mode.local',
  MIXED: 'idProviders.mode.mixed',
  EXTERNAL: 'idProviders.mode.external',
  UNAVAILABLE: 'idProviders.mode.unavailable',
};
