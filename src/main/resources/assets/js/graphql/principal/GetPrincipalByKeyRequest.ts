import {GraphQlRequest} from '../GraphQlRequest';
import {User} from '../../app/principal/User';
import {Group} from '../../app/principal/Group';
import {Role} from '../../app/principal/Role';
import {UserJson} from '../../app/principal/UserJson';
import {GroupJson} from '../../app/principal/GroupJson';
import {PrincipalKey} from '@enonic/lib-admin-ui/security/PrincipalKey';
import {Principal} from '@enonic/lib-admin-ui/security/Principal';
import {PrincipalJson} from '@enonic/lib-admin-ui/security/PrincipalJson';
import {PrincipalType} from '@enonic/lib-admin-ui/security/PrincipalType';

interface GetPrincipalByKeyResponse {
    principal: PrincipalJson;
}

export class GetPrincipalByKeyRequest
    extends GraphQlRequest<Principal> {

    private key: PrincipalKey;
    private includeMemberships: boolean = false;
    private transitive: boolean;

    constructor(key: PrincipalKey) {
        super();
        this.key = key;
    }

    setIncludeMemberships(value: boolean): GetPrincipalByKeyRequest {
        this.includeMemberships = value;
        return this;
    }

    setTransitiveMemberships(flag: boolean): GetPrincipalByKeyRequest {
        this.transitive = flag;
        return this;
    }

    getVariables(): object {
        const vars = super.getVariables();
        if (this.key) {
            vars['key'] = this.key.toString();
        }
        vars['transitive'] = this.transitive;
        return vars;
    }

    getQuery(): string {
        return `query (${this.getParamsByKey(this.key, this.includeMemberships)}) {
                    principal (key: $key) {
                        key
                        name
                        path
                        description
                        displayName
                        ${this.getFieldsByKey(this.key, this.includeMemberships)}
                        permissions {
                            principal {
                                key
                                displayName
                            }
                            allow
                            deny
                        }
                        ${this.addFieldsIfUser(this.key)}
                    }
                }`;
    }

    private getParamsByKey(key: PrincipalKey, includeMemberships: boolean): string {
        const params = ['$key: String!'];
        if (includeMemberships && !key.isRole()) {
            params.push('$transitive: Boolean');
        }
        return params.join(', ');
    }

    private getFieldsByKey(key: PrincipalKey, includeMemberships: boolean): string {
        let fields = '';
        switch (key.getType()) {
        case PrincipalType.USER:
            fields = `email
                      login` + this.getMembershipsField(includeMemberships);
            break;
        case PrincipalType.GROUP:
            fields = 'members' + this.getMembershipsField(includeMemberships);
            break;
        case PrincipalType.ROLE:
            fields = 'members';
            break;
        }
        return fields;
    }

    private addFieldsIfUser(key: PrincipalKey): string {
        if (key.isUser()) {
            return `publicKeys {
                         kid
                         publicKey
                         creationTime
                         label
                    }
                    hasPassword`;
        } else {
            return '';
        }
    }

    private getMembershipsField(includeMemberships: boolean) {
        return includeMemberships ? `
            memberships (transitive: $transitive) {
                key
                displayName
                description
            }` : '';
    }

    sendAndParse(): Q.Promise<Principal> {
        return this.query().then((result: GetPrincipalByKeyResponse) => this.fromJsonToPrincipal(result.principal));
    }

    fromJsonToPrincipal(json: PrincipalJson): Principal {
        if (!json) {
            throw Error(`Principal[${this.key.toString()}] not found`);
        }
        if (!json.key) {
            return null;
        }
        let pKey: PrincipalKey = PrincipalKey.fromString(json.key);
        if (pKey.isRole()) {
            return Role.fromJson(json);

        } else if (pKey.isGroup()) {
            return Group.fromJson(json as GroupJson);

        } else if (pKey.isUser()) {
            return User.fromJson(json as UserJson);
        }
    }
}
