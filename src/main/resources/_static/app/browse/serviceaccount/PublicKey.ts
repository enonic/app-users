import {PublicKeyJson} from '../../principal/PublicKeyJson';
import {Equitable} from '@enonic/lib-admin-ui/Equitable';
import {ObjectHelper} from '@enonic/lib-admin-ui/ObjectHelper';

export class PublicKey
    implements Equitable {

    private readonly kid: string;

    private readonly publicKey: string;

    private readonly creationTime: string;

    private readonly label: string;

    constructor(kid: string, publicKey: string, creationTime: string, label?: string) {
        this.kid = kid;
        this.publicKey = publicKey;
        this.creationTime = creationTime;
        this.label = label || '';
    }

    getKid(): string {
        return this.kid;
    }

    getPublicKey(): string {
        return this.publicKey;
    }

    getLabel(): string {
        return this.label;
    }

    getCreationTime(): string {
        return this.creationTime;
    }

    equals(o: Equitable): boolean {
        if (!ObjectHelper.iFrameSafeInstanceOf(o, PublicKey)) {
            return false;
        }

        let other = o as PublicKey;

        if (!ObjectHelper.stringEquals(this.getKid(), other.getKid())) {
            return false;
        }
        if (!ObjectHelper.stringEquals(this.getPublicKey(), other.getPublicKey())) {
            return false;
        }
        if (!ObjectHelper.stringEquals(this.getCreationTime(), other.getCreationTime())) {
            return false;
        }
        if (!ObjectHelper.stringEquals(this.getLabel(), other.getLabel())) {
            return false;
        }

        return true;
    }

    static fromJson(json: PublicKeyJson): PublicKey {
        return new PublicKey(json.kid, json.publicKey, json.creationTime, json.label);
    }

}
