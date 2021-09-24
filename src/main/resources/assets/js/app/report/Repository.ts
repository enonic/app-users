import {Equitable} from 'lib-admin-ui/Equitable';

type RepositoryData = {
    id: string;
    name: string;
    branches: string[];
};

export class Repository
    implements Equitable {
    private id: string;
    private name: string;
    private branches: string[];

    getId(): string {
        return this.id;
    }

    getName(): string {
        return this.name;
    }

    getBranches(): string[] {
        return this.branches;
    }

    equals(other: Repository): boolean {
        return this.id === other.id;
    }

    static fromJson(json: RepositoryData): Repository {
        const r = new Repository();
        r.id = json.id;
        r.name = json.name;
        r.branches = json.branches;
        return r;
    }
}
