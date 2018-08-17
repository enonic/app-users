import PrincipalKey = api.security.PrincipalKey;
import {DeletePrincipalResultJson} from './DeletePrincipalResultJson';

export class DeletePrincipalResult {

    private principalKey: PrincipalKey;
    private deleted: boolean;
    private reason: string;

    getPrincipalKey(): PrincipalKey {
        return this.principalKey;
    }

    isDeleted(): boolean {
        return this.deleted;
    }

    getReason(): string {
        return this.reason;
    }

    static fromJson(json: DeletePrincipalResultJson): DeletePrincipalResult {
        let result = new DeletePrincipalResult();
        result.principalKey = PrincipalKey.fromString(json.principalKey);
        result.deleted = json.deleted;
        result.reason = json.reason;
        return result;
    }
}
