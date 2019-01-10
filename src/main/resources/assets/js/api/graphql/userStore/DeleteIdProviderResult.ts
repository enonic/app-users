import {DeleteIdProviderResultJson} from './DeleteIdProviderResultJson';
import IdProviderKey = api.security.IdProviderKey;

export class DeleteIdProviderResult {

    private userStoreKey: IdProviderKey;
    private deleted: boolean;
    private reason: string;

    static fromJson(json: DeleteIdProviderResultJson): DeleteIdProviderResult {
        let result = new DeleteIdProviderResult();
        result.userStoreKey = IdProviderKey.fromString(json.userStoreKey);
        result.deleted = json.deleted;
        result.reason = json.reason;
        return result;
    }

    isDeleted(): boolean {
        return this.deleted;
    }

    getReason(): string {
        return this.reason;
    }

    getIdProviderKey(): IdProviderKey {
        return this.userStoreKey;
    }
}
