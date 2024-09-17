import {GraphQlRequest} from '../GraphQlRequest';
import {UserItemKey} from '@enonic/lib-admin-ui/security/UserItemKey';
import {DeleteUserItemJson} from './DeleteUserItemJson';
import {DeleteUserItemResult} from './DeleteUserItemResult';

export abstract class DeleteUserItemRequest extends GraphQlRequest<DeleteUserItemResult[]> {

    private keys: UserItemKey[];

    setKeys(keys: UserItemKey[]): DeleteUserItemRequest {
        this.keys = keys.slice(0);
        return this;
    }

    getVariables(): object {
        return {
            keys: this.keys.map((memberKey) => memberKey.toString())
        };
    }

    getMutation(): string {
        return `mutation ($keys: [String]!) {
            ${this.getMutationName()}(keys: $keys) {
                key
                deleted
                reason
            }
        }`;
    }

    protected abstract getMutationName(): string;

    sendAndParse(): Q.Promise<DeleteUserItemResult[]> {
        return this.mutate().then((json: DeleteUserItemJson) => {
            return json[this.getMutationName()].map(this.jsonToResult.bind(this));
        });
    }

    private jsonToResult(json: DeleteUserItemJson): DeleteUserItemResult {
        return DeleteUserItemResult.create()
            .setKey(this.convertKey(json.key))
            .setDeleted(json.deleted)
            .setReason(json.reason)
            .build();
    }

    protected abstract convertKey(value: string): UserItemKey;
}
