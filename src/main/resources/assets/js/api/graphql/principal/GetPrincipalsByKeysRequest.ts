import {GraphQlRequest} from '../GraphQlRequest';
import PrincipalKey = api.security.PrincipalKey;
import Principal = api.security.Principal;
import PrincipalJson = api.security.PrincipalJson;
import Role = api.security.Role;
import RoleJson = api.security.RoleJson;
import Group = api.security.Group;
import GroupJson = api.security.GroupJson;
import User = api.security.User;
import UserJson = api.security.UserJson;

export class GetPrincipalsByKeysRequest
    extends GraphQlRequest<any, Principal[]> {

    private keys: PrincipalKey[];

    constructor(keys: PrincipalKey[]) {
        super();
        this.keys = keys;
    }


    getVariables(): { [keys: string]: any } {
        let vars = super.getVariables();
        if (this.keys) {
            vars['keys'] = this.keys.map(principalKey => principalKey.toString());
        }
        return vars;
    }

    getQuery(): string {
        return `query ($keys: [String]!) {
                    principals (keys: $keys) {
                        key
                        name
                        path
                        description
                        displayName
                        email
                        login
                        members
                        memberships {
                            key
                            displayName
                        }
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

    sendAndParse(): wemQ.Promise<Principal[]> {
        return this.query().then(result => this.fromJsonToPrincipal(result.principals));
    }

    fromJsonToPrincipal(principalsJson: PrincipalJson[]): Principal[] {
        if (!principalsJson) {
            return [];
        }
        return principalsJson.map(principalJson => {
            let pKey: PrincipalKey = PrincipalKey.fromString(principalJson.key);
            if (pKey.isRole()) {
                return Role.fromJson(<RoleJson>principalJson);

            } else if (pKey.isGroup()) {
                return Group.fromJson(<GroupJson>principalJson);

            } else if (pKey.isUser()) {
                return User.fromJson(<UserJson>principalJson);
            }
        });
    }
}
