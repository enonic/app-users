import Equitable = api.Equitable;
import PrincipalKey = api.security.PrincipalKey;

export class Report
    implements Equitable {
    private id: string;
    private taskId: string;
    private principalKey: PrincipalKey;
    private repositoryId: string;
    private report: string;
    private url: string;

    getId(): string {
        return this.id;
    }

    getPrincipalKey(): PrincipalKey {
        return this.principalKey;
    }

    getRepositoryId(): string {
        return this.repositoryId;
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
        r.repositoryId = json.repositoryId;
        r.url = json.url;
        r.taskId = json.taskId;
        r.report = json.report;
        return r;
    }
}
