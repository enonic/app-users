import { err, ok, type ResultAsync } from 'neverthrow';

import { AppError, requestGraphQlDocument } from '../../../shared/api';
import type { PrincipalKey } from '../model/principal.types';

const DELETE_PRINCIPALS_DOCUMENT = `
  mutation DeletePrincipals($keys: [String!]!) {
    deletePrincipals(keys: $keys) {
      key
      deleted
      reason
    }
  }
`;

type PrincipalDeletionDto = {
  key: string;
  deleted: boolean;
  reason: string | null;
};

type DeletePrincipalsData = { deletePrincipals: PrincipalDeletionDto[] | null };

export type PrincipalDeletion = {
  key: PrincipalKey;
  deleted: boolean;
  reason?: string;
};

export function sendPrincipalDeletion(
  keys: readonly PrincipalKey[],
): ResultAsync<PrincipalDeletion[], AppError> {
  return requestGraphQlDocument<DeletePrincipalsData>(DELETE_PRINCIPALS_DOCUMENT, { keys }).andThen(
    ({ deletePrincipals }) =>
      deletePrincipals == null
        ? err(new AppError('The delete was not carried out'))
        : ok(deletePrincipals.map(toDeletion)),
  );
}

function toDeletion(dto: PrincipalDeletionDto): PrincipalDeletion {
  return {
    key: dto.key as PrincipalKey,
    deleted: dto.deleted,
    reason: dto.reason != null && dto.reason.length > 0 ? dto.reason : undefined,
  };
}
