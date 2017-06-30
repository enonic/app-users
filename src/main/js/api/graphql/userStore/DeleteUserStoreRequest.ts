import {GraphQlRequest} from '../GraphQlRequest';
import DeleteUserStoreResult = api.security.DeleteUserStoreResult;
import UserStoreKey = api.security.UserStoreKey;

export class DeleteUserStoreRequest
    extends GraphQlRequest<any, DeleteUserStoreResult[]> {

    private keys: UserStoreKey[];

    setKeys(keys: UserStoreKey[]): DeleteUserStoreRequest {
        this.keys = keys.slice(0);
        return this;
    }

    getVariables() {
        let vars = super.getVariables();
        vars['keys'] = this.keys.map(memberKey => memberKey.toString());
        return vars;
    }

    getMutation() {
        return `mutation ($keys: [String]!) {
            deleteUserStores(keys: $keys) {
                userStoreKey
                deleted
                reason
            }
        }`;
    }

    sendAndParse(): wemQ.Promise<DeleteUserStoreResult[]> {
        return this.mutate().then(json => {
            return json.deleteUserStores.map(DeleteUserStoreResult.fromJson);
        });
    }

}
