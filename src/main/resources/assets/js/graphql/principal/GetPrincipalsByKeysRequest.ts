import {GraphQlRequest} from '../GraphQlRequest';
import {User} from '../../app/principal/User';
import {Group} from '../../app/principal/Group';
import {Role} from '../../app/principal/Role';
import {UserJson} from '../../app/principal/UserJson';
import {GroupJson} from '../../app/principal/GroupJson';
import {PrincipalKey} from '@enonic/lib-admin-ui/security/PrincipalKey';
import {Principal} from '@enonic/lib-admin-ui/security/Principal';
import {PrincipalJson} from '@enonic/lib-admin-ui/security/PrincipalJson';

interface GetPrincipalsByKeyResponse {
    principals: PrincipalJson[];
}

export class GetPrincipalsByKeysRequest
    extends GraphQlRequest<Principal[]> {

    private keys: PrincipalKey[];
    private includeMemberships: boolean = false;
    private transitive: boolean;

    constructor(keys: PrincipalKey[]) {
        super();
        this.keys = keys;
    }

    setIncludeMemberships(value: boolean): GetPrincipalsByKeysRequest {
        this.includeMemberships = value;
        return this;
    }

    setTransitiveMemberships(flag: boolean): GetPrincipalsByKeysRequest {
        this.transitive = flag;
        return this;
    }

    getVariables(): object {
        const vars = super.getVariables();
        if (this.keys) {
            vars['keys'] = this.keys.map(principalKey => principalKey.toString());
        }
        vars['transitive'] = this.transitive;
        return vars;
    }

    getQuery(): string {
        return 'query ($keys: [String]!' + this.getDynamicVariables() + `) {
                    principals (keys: $keys) {
                        key
                        name
                        path
                        description
                        displayName
                        email
                        login
                        members` + this.getMembershipsField() + `
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

    private getDynamicVariables() {
        return this.includeMemberships ? ', $transitive: Boolean' : '';
    }

    private getMembershipsField() {
        return this.includeMemberships ? `
            memberships (transitive: $transitive) {
                key
                displayName
            }` : '';
    }

    sendAndParse(): Q.Promise<Principal[]> {
        return this.query().then((result: GetPrincipalsByKeyResponse) => this.fromJsonToPrincipal(result.principals));
    }

    fromJsonToPrincipal(principalsJson: PrincipalJson[]): Principal[] {
        if (!principalsJson) {
            return [];
        }
        return principalsJson.map(principalJson => {
            let pKey: PrincipalKey = PrincipalKey.fromString(principalJson.key);
            if (pKey.isRole()) {
                return Role.fromJson(principalJson);

            } else if (pKey.isGroup()) {
                return Group.fromJson(principalJson as GroupJson);

            } else if (pKey.isUser()) {
                return User.fromJson(principalJson as UserJson);
            }
        });
    }
}
