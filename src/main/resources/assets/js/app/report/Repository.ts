import Equitable = api.Equitable;

export class Repository
    implements Equitable {
    private id: string;
    private name: string;

    getId(): string {
        return this.id;
    }

    getName(): string {
        return this.name;
    }

    equals(other: Repository): boolean {
        return this.id === other.id;
    }

    static fromJson(json: any): Repository {
        const r = new Repository();
        r.id = json.id;
        r.name = json.name;
        return r;
    }
}
