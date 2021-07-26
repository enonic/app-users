import {GraphQlRequest} from '../GraphQlRequest';
import {User} from '../../app/principal/User';
import {Group} from '../../app/principal/Group';
import {Role} from '../../app/principal/Role';
import {UserJson} from '../../app/principal/UserJson';
import {GroupJson} from '../../app/principal/GroupJson';
import {RoleJson} from '../../app/principal/RoleJson';
import {PrincipalKey} from 'lib-admin-ui/security/PrincipalKey';
import {Principal} from 'lib-admin-ui/security/Principal';
import {PrincipalJson} from 'lib-admin-ui/security/PrincipalJson';
import {PrincipalType} from 'lib-admin-ui/security/PrincipalType';

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

    getVariables(): { [key: string]: any } {
        let vars = super.getVariables();
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

    private getMembershipsField(includeMemberships: boolean) {
        return includeMemberships ? `
            memberships (transitive: $transitive) {
                key
                displayName
                description
            }` : '';
    }

    sendAndParse(): Q.Promise<Principal> {
        return this.query().then(result => this.fromJsonToPrincipal(result.principal));
    }

    fromJsonToPrincipal(json: PrincipalJson): Principal {
        if (!json) {
            throw `Principal[${this.key.toString()}] not found`;
        }
        if (!json.key) {
            return null;
        }
        let pKey: PrincipalKey = PrincipalKey.fromString(json.key);
        if (pKey.isRole()) {
            return Role.fromJson(<RoleJson>json);

        } else if (pKey.isGroup()) {
            return Group.fromJson(<GroupJson>json);

        } else if (pKey.isUser()) {
            return User.fromJson(<UserJson>json);
        }
    }
}
