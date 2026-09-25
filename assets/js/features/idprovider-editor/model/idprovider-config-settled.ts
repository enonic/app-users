import { $idProviderConfig, type IdProviderConfigState } from './idprovider-config.store';

/** How long a save waits for the form before it writes without one, as it would before any load. */
export const CONFIG_SETTLE_TIMEOUT_MS = 10_000;

/**
 * The snapshot once it has an answer for the application: ready, absent or failed. A save clicked while
 * the form is still on its way waits for it here rather than writing the binding without its defaults;
 * the wait never outlasts `timeoutMs`, so Save cannot hang on a request that never answers.
 */
export function whenIdProviderConfigSettled(
  application: string,
  timeoutMs = CONFIG_SETTLE_TIMEOUT_MS,
): Promise<IdProviderConfigState> {
  const current = $idProviderConfig.get();
  if (application.length === 0 || isSettled(current, application)) {
    return Promise.resolve(current);
  }

  return new Promise((resolve) => {
    const finish = (): void => {
      clearTimeout(timer);
      unsubscribe();
      resolve($idProviderConfig.get());
    };
    const timer = setTimeout(finish, timeoutMs);
    const unsubscribe = $idProviderConfig.listen((state) => {
      if (isSettled(state, application)) {
        finish();
      }
    });
  });
}

function isSettled(state: IdProviderConfigState, application: string): boolean {
  return state.status !== 'idle' && state.status !== 'loading' && state.application === application;
}
