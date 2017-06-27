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
import PrincipalType = api.security.PrincipalType;

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

    getVariables(): { [key: string]: any } {
        let vars = super.getVariables();
        if (this.key) {
            vars['key'] = this.key.toString();
        }
        vars['memberships'] = this.userMemberships;
        return vars;
    }

    getQuery(): string {
        return `query ($key: String!, $memberships: Boolean) {
                    principal (key: $key, memberships: $memberships) {
                        key
                        name
                        path
                        description
                        displayName
                        ${this.getFieldsByKey(this.key)}
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

    private getFieldsByKey(key: PrincipalKey): string {
        let fields = '';
        switch (key.getType()) {
        case PrincipalType.USER:
            fields = `email
                      login
                      memberships {
                          key
                          displayName
                      }`;
            break;
        case PrincipalType.GROUP:
        case PrincipalType.ROLE:
            fields = `members`;
            break;
        }
        return fields;
    }

    sendAndParse(): wemQ.Promise<Principal> {
        return this.query().then(result => this.fromJsonToPrincipal(result.principal));
    }

    fromJsonToPrincipal(json: PrincipalJson): Principal {
        if (!json) {
            throw `Principal[${this.key.toString()}] not found`;
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