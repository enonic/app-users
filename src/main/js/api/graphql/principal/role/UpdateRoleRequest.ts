import {GraphQlRequest} from '../../GraphQlRequest';
import PrincipalKey = api.security.PrincipalKey;
import Role = api.security.Role;

export class UpdateRoleRequest
    extends GraphQlRequest<any, Role> {

    private key: PrincipalKey;
    private displayName: string;
    private membersToAdd: PrincipalKey[] = [];
    private membersToRemove: PrincipalKey[] = [];
    private description: string;

    private static readonly mutation = `mutation ($key: String!, $displayName: String!, $description: String!, $addMembers: [String], $removeMembers: [String]) {
            updateRole(key: $key, displayName: $displayName, description: $description, addMembers: $addMembers, removeMembers: $removeMembers) {
                key
                displayName
                description
                members
            }
        }`;

    setKey(key: PrincipalKey): UpdateRoleRequest {
        this.key = key;
        return this;
    }

    setDisplayName(displayName: string): UpdateRoleRequest {
        this.displayName = displayName;
        return this;
    }

    addMembers(members: PrincipalKey[]): UpdateRoleRequest {
        this.membersToAdd = members.slice(0);
        return this;
    }

    removeMembers(members: PrincipalKey[]): UpdateRoleRequest {
        this.membersToRemove = members.slice(0);
        return this;
    }

    setDescription(description: string): UpdateRoleRequest {
        this.description = description;
        return this;
    }

    getVariables(): Object {
        let vars = super.getVariables();

        vars['key'] = this.key.toString();
        vars['displayName'] = this.displayName;
        vars['addMembers'] = this.membersToAdd.map((memberKey) => memberKey.toString());
        vars['removeMembers'] = this.membersToRemove.map((memberKey) => memberKey.toString());
        vars['description'] = this.description;

        return vars;
    }

    sendAndParse(): wemQ.Promise<Role> {

        return this.mutate(UpdateRoleRequest.mutation).then(json => Role.fromJson(json.updateRole));
    }

}

