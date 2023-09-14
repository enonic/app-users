import {UserItemKey} from '@enonic/lib-admin-ui/security/UserItemKey';

export class DeleteUserItemResult {

    private key: UserItemKey;
    private deleted: boolean;
    private reason: string;

    constructor(builder: DeleteUserItemResultBuilder) {
        this.key = builder.key;
        this.deleted = builder.deleted;
        this.reason = builder.reason;
    }

    getKey(): UserItemKey {
        return this.key;
    }

    isDeleted(): boolean {
        return this.deleted;
    }

    getReason(): string {
        return this.reason;
    }

    static create(): DeleteUserItemResultBuilder {
        return new DeleteUserItemResultBuilder();
    }
}

export class DeleteUserItemResultBuilder {

    key: UserItemKey;

    deleted: boolean;

    reason: string;

    setKey(value: UserItemKey): DeleteUserItemResultBuilder {
        this.key = value;

        return this;
    }

    setDeleted(value: boolean): DeleteUserItemResultBuilder {
        this.deleted = value;

        return this;
    }

    setReason(value: string): DeleteUserItemResultBuilder {
        this.reason = value;

        return this;
    }

    build(): DeleteUserItemResult {
        return new DeleteUserItemResult(this);
    }
}
