import Equitable = api.Equitable;
import PrincipalKey = api.security.PrincipalKey;

export class Report
    implements Equitable {
    private id: string;
    private taskId: string;
    private principalKey: PrincipalKey;
    private principalDisplayName: string;
    private repositoryId: string;
    private finished: Date;
    private url: string;

    getId(): string {
        return this.id;
    }

    getPrincipalKey(): PrincipalKey {
        return this.principalKey;
    }

    getPrincipalDisplayName(): string {
        return this.principalDisplayName;
    }

    getRepositoryId(): string {
        return this.repositoryId;
    }

    getTaskId(): string {
        return this.taskId;
    }

    getUrl(): string {
        return this.url;
    }

    getFinished(): Date {
        return this.finished;
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
        r.principalDisplayName = json.principalDisplayName;
        r.finished = json.finished ? new Date(json.finished) : undefined;
        return r;
    }
}
