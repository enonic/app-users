import { useStore } from '@nanostores/preact';
import { useEffect } from 'preact/hooks';

import type { DetailState } from '../../../shared/detail';
import type { UserDetail } from './principal.types';
import {
  $serviceAccountDetail,
  showServiceAccount,
  serviceAccountDetailFor,
} from './service-account-detail.load';

/**
 * The service account the details panel shows. The key is a plain string because it arrives from the
 * route — it is a `UserKey` only once a user answers to it.
 */
export function useServiceAccount(key: string | undefined): DetailState<UserDetail> {
  // Subscribes only: the answer below reads the store and the cache.
  useStore($serviceAccountDetail);

  useEffect(() => {
    showServiceAccount(key);
  }, [key]);

  useEffect(() => () => showServiceAccount(undefined), []);

  return serviceAccountDetailFor(key);
}
