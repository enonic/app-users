import Equitable = api.Equitable;
import PrincipalKey = api.security.PrincipalKey;
import UserStoreKey = api.security.UserStoreKey;

export class Report
    implements Equitable {
    private id: string;
    private taskId: string;
    private principalKey: PrincipalKey;
    private userStoreKey: UserStoreKey;
    private report: string;
    private url: string;

    getId(): string {
        return this.id;
    }

    getPrincipalKey(): PrincipalKey {
        return this.principalKey;
    }

    getUserStoreKey(): UserStoreKey {
        return this.userStoreKey;
    }

    getTaskId(): string {
        return this.taskId;
    }

    getReport(): string {
        return this.report;
    }

    getUrl(): string {
        return this.url;
    }

    equals(other: Report): boolean {
        return this.id === other.id;
    }

    static fromJson(json: any): Report {
        const r = new Report();
        r.id = json.id || json._id;
        r.principalKey = json.principalKey ? PrincipalKey.fromString(json.principalKey) : null;
        r.userStoreKey = json.userStoreKey ? UserStoreKey.fromString(json.userStoreKey) : null;
        r.url = json.url;
        r.taskId = json.taskId;
        r.report = json.report;
        return r;
    }
}
