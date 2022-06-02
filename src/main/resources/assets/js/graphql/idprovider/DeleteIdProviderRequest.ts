import {IdProviderKey} from '@enonic/lib-admin-ui/security/IdProviderKey';
import {DeleteUserItemRequest} from '../useritem/DeleteUserItemRequest';

export class DeleteIdProviderRequest
    extends DeleteUserItemRequest {

    protected getMutationName(): string {
        return 'deleteIdProviders';
    }

    protected convertKey(value: string): IdProviderKey {
        return IdProviderKey.fromString(value);
    }

}
