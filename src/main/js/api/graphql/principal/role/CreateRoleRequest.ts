import {GraphQlRequest} from '../../GraphQlRequest';
import Role = api.security.Role;
import PrincipalKey = api.security.PrincipalKey;

export class CreateRoleRequest
    extends GraphQlRequest<any, Role> {

    private key: PrincipalKey;
    private displayName: string;
    private description: string;
    private members: PrincipalKey[] = [];

    setKey(key: PrincipalKey): CreateRoleRequest {
        this.key = key;
        return this;
    }

    setDisplayName(displayName: string): CreateRoleRequest {
        this.displayName = displayName;
        return this;
    }

    setMembers(members: PrincipalKey[]): CreateRoleRequest {
        this.members = members.slice(0);
        return this;
    }

    setDescription(description: string): CreateRoleRequest {
        this.description = description;
        return this;
    }

    getVariables(): { [key: string]: any } {
        let vars = super.getVariables();
        vars['key'] = this.key.toString();
        vars['displayName'] = this.displayName;
        vars['description'] = this.description;
        vars['members'] = this.members.map(key => key.toString());
        return vars;
    }

    getMutation(): string {
        return `mutation ($key: String!, $displayName: String!, $description: String, $members: [String]) {
            createRole(key: $key, displayName: $displayName, description: $description, members: $members) {
                key
                displayName
                description
                members
            }
        }`;
    }

    sendAndParse(): wemQ.Promise<Role> {
        return this.mutate().then(json => Role.fromJson(json.createRole));
    }

}