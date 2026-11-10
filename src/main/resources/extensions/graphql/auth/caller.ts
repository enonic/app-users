import { getUser } from '/lib/xp/auth';

/** The user the request runs as. The platform gates admit no anonymous request, so one is always there. */
export function callerKey(): string | undefined {
  return getUser()?.key;
}
