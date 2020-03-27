import {PrincipalKey} from 'lib-admin-ui/security/PrincipalKey';
import {DeleteUserItemRequest} from '../useritem/DeleteUserItemRequest';

export class DeletePrincipalRequest
    extends DeleteUserItemRequest {

    protected getMutationName(): string {
        return 'deletePrincipals';
    }

    protected convertKey(value: string): PrincipalKey {
        return PrincipalKey.fromString(value);
    }
}
