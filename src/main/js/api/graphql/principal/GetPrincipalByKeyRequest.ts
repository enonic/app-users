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

export class GetPrincipalByKeyRequest
    extends GraphQlRequest<any, Principal> {

    private key: PrincipalKey;
    private userMemberships: boolean = false;

    constructor(key: PrincipalKey) {
        super();
        this.key = key;
    }

    includeUserMemberships(value: boolean): GetPrincipalByKeyRequest {
        this.userMemberships = value;
        return this;
    }

    getQuery() {
        return `query {
                    principal ${this.formatQueryParams()} {
                        key
                        name
                        path
                        description
                        displayName
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

    getQueryParams(): string[] {
        let params = super.getQueryParams();
        if (this.key) {
            params.push(`key: "${this.key.toString()}"`);
        }
        params.push(`memberships: ${this.userMemberships}`);
        return params;
    }

    sendAndParse(): wemQ.Promise<Principal> {
        return this.send().then((result: any) => {
            return this.fromJsonToPrincipal(result.principal);
        });
    }

    fromJsonToPrincipal(json: PrincipalJson): Principal {
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