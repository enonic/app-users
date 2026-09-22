import { isEmailAddress } from '../../../shared/form';
import { createAvailabilityCheck, type AvailabilityCheck } from './availability-check';
import { isUserEmailTaken } from './user-commands';

export type UserEmailCheck = AvailabilityCheck;

/**
 * Whether another user of the provider holds the email being typed. Asked in both modes — an edit can
 * re-address a user — with that user's key as `except`.
 */
export function createUserEmailCheck(): UserEmailCheck {
  return createAvailabilityCheck({ ask: isUserEmailTaken, keyOf });
}

// The platform matches emails case-blind, so one spelling in any case is one question.
function keyOf(idProvider: string, email: string): string | undefined {
  if (idProvider.length === 0 || !isEmailAddress(email)) {
    return undefined;
  }

  return `email:${idProvider}|${email.toLowerCase()}`;
}
